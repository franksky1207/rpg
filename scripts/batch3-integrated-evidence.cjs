"use strict";
const fs=require("node:fs"),cp=require("node:child_process"),{performance}=require("node:perf_hooks");
const entries=[
 ["fx timer and ownership","tests/runtime/batch3-fx-timer-lifecycle.cjs"],
 ["shared animation trace","tests/runtime/batch1-animation-frame-trace.cjs"],
 ["alternate universe presentation contract","tests/runtime/alternate-universe-batch4-3-regression.js"],
 ["alternate universe full combat contract","tests/runtime/alternate-universe-combat-integrity.js"],
 ["mirror and audio presentation","tests/runtime/combat-events-integration.cjs"],
 ["combat event ownership","tests/runtime/combat-events-owner-browser.js"],
 ["audio playback lifecycle","tests/runtime/audio-lifecycle-browser.js"],
 ["audio preference contract","tests/runtime/audio-settings-persistence-integrity.js"],
 ["renderer contract","tests/runtime/hybrid-comparison-renderer-contract.cjs"],
 ["renderer playback","tests/runtime/hybrid-comparison-playback-contract.cjs"],
 ["formal renderer","tests/runtime/t3b-formal-renderer.cjs"],
 ["asset loading policy","tests/runtime/loading-resource-policy-integrity.js"],
 ["resource manifest","tests/runtime/resource-manifest-integrity.js"],
 ["cache contract","tests/runtime/html-cache-version-guard.js"],
 ["historical batch 1 12-point regression","scripts/batch1-fixed12-evidence.cjs"],
 ["historical batch 2 13-point regression","scripts/batch2-final13-evidence.cjs"]
];
const rows=[];
for(const [scope,file] of entries){
 const start=performance.now();
 const run=fs.existsSync(file)?cp.spawnSync(process.execPath,[file],{encoding:"utf8",timeout:240000,maxBuffer:8*1024*1024,env:{...process.env,RUNTIME_SMOKE_URL:"http://127.0.0.1:4173/index.html"}}):null;
 const row={scope,file,status:!run?"missing":run.error?"error":run.status===0?"pass":"fail",ms:Math.round(performance.now()-start),exitCode:run?.status??null,tail:((run?.stdout||"")+"\n"+(run?.stderr||"")).slice(-5500)};
 rows.push(row);console.log("BATCH3",scope,row.status,row.ms);
 if(row.status!=="pass")console.error("BATCH3_FAIL",scope,row.tail);
}
fs.writeFileSync("batch3-integrated-evidence.json",JSON.stringify({schema:"cw.batch3.integrated.v1",sha:process.env.GITHUB_SHA||"local",note:"Representative existing contract/isolated Chromium gate; NOT a 16-item full performance proof, official alternate UI complete trace, iPhone thermal test, or memory leak slope.",rows},null,2)+"\n");
if(rows.some(x=>x.status!=="pass"))process.exitCode=1;
