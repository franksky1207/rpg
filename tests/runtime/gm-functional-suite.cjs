'use strict';
// Preserve all five Functional CI entries, order and fail-fast behavior.
const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
const {performance}=require('node:perf_hooks');
const output=process.env.GM_PREVIEW_EVIDENCE||'/tmp/gm-preview-evidence';
fs.mkdirSync(output,{recursive:true});
const started=performance.now(),report={passed:false,sha:process.env.GITHUB_SHA||null,tests:[]};
const files=['gm-animation-center-terminology.cjs','3d-player-snapshot-contract.js','gm-runtime-early-restore-integrity.js','batch19-2-gm-center-browser.cjs','gm-3d-test-center-browser.js'];
let exitCode=0;
for(const file of files){
 console.log('::group::GM '+file);
 const start=performance.now(),result=spawnSync(process.execPath,[path.join(__dirname,file)],{stdio:'inherit',env:process.env});
 const row={file,seconds:(performance.now()-start)/1000,exitCode:result.status,signal:result.signal};
 report.tests.push(row);console.log(`GM ${file}: ${row.seconds.toFixed(3)}s, exit ${row.exitCode}`);console.log('::endgroup::');
 if(result.error||result.status!==0){if(result.error)console.error(result.error);exitCode=result.status||1;break;}
}
report.seconds=(performance.now()-started)/1000;report.passed=exitCode===0;
if(process.env.GM_JOB_STARTED_MS)report.jobSeconds=(Date.now()-Number(process.env.GM_JOB_STARTED_MS))/1000;
fs.writeFileSync(path.join(output,'timings.json'),JSON.stringify(report,null,2)+'\n');
let summary='### GM acceptance timings\n\n| Test | Seconds | Exit |\n| --- | ---: | ---: |\n'+report.tests.map(r=>`| ${r.file} | ${r.seconds.toFixed(3)} | ${r.exitCode} |`).join('\n')+`\n\nFive-entry suite total: ${report.seconds.toFixed(3)}s (browser setup and artifact upload excluded).\n`;
if(report.jobSeconds!==undefined)summary+=`Job elapsed through acceptance: ${report.jobSeconds.toFixed(3)}s (includes checkout/browser setup; artifact upload and post-job cleanup excluded). Full job duration is available in Actions.\n`;
const preview=path.join(output,'report.json');
if(fs.existsSync(preview)){
 const detail=JSON.parse(fs.readFileSync(preview,'utf8'));
 summary+='\n| Viewport / coverage | Total s | Modes / six actions s | Monster/action samples s | Stability s | Load/decode s | Pixels s | Release s |\n| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |\n';
 for(const row of detail.reports||[]){const t=row.timings;if(!t)continue;summary+=`| ${row.viewport.width}×${row.viewport.height} / ${row.coverage} | `+['totalMs','modesMs','samplesMs','stabilityMs','loadingMs','pixelMs','releaseMs'].map(k=>(t[k]/1000).toFixed(3)).join(' | ')+' |\n';}
 summary+='\nLoad/decode, pixel and release costs are inclusive subsets of phase totals; do not add them together.\n';
}
console.log(summary);
if(process.env.GITHUB_STEP_SUMMARY)fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,summary);
process.exitCode=exitCode;
