"use strict";
const fs=require("node:fs"),cp=require("node:child_process"),{performance}=require("node:perf_hooks");
const cases=[
["01 lifecycle","tests/runtime/batch2-background-sleeper-lifecycle.cjs"],
["02 alternate mode","tests/runtime/alternate-universe-batch4-3-regression.js"],
["03 background cross-era","tests/runtime/cross-era-background-browser.js"],
["04 fast catch-up","tests/runtime/calamity-shared-terminal-fast-catchup-integrity.js"],
["05 offline handoff","tests/runtime/offline-sample-provenance-opt4-integrity.js"],
["06 visibility page transitions","tests/runtime/thirdworld-background-browser.js"],
["07 minimal modes","tests/runtime/galaxy-review-combat-browser.js"],
["08 GM isolation","tests/runtime/gm-alternate-universe-management-batch7-3-integrity.js"],
["09 timers/observers","tests/runtime/combat-events-owner-browser.js"],
["10 presentation owners","tests/runtime/combat-events-integration.cjs"],
["11 repeated renderer contract","tests/runtime/hybrid-comparison-playback-contract.cjs"],
["12 broad existing regression","scripts/batch1-fixed12-evidence.cjs"],
["13 release manifest","tests/runtime/resource-manifest-integrity.js"]
];
let results=[];
for(const [scope,file] of cases){
 const start=performance.now();
 const x=fs.existsSync(file)?cp.spawnSync(process.execPath,[file],{encoding:"utf8",timeout:150000,maxBuffer:4*1024*1024,env:{...process.env,RUNTIME_SMOKE_URL:"http://127.0.0.1:4173/index.html"}}):null;
 const row={scope,file,status:!x?"missing":x.error?"error":x.status===0?"pass":"fail",elapsedMs:Math.round(performance.now()-start),exitCode:x?.status??null,tail:((x?.stdout||"")+"\n"+(x?.stderr||"")).slice(-900)};
 results.push(row);console.log("BATCH2",row.scope,row.status,row.elapsedMs+"ms");if(row.status!=="pass")console.error("BATCH2_FAILURE_DETAIL",row.scope,row.tail);
}
const report={schema:"cw.batch2.final13.evidence.v1",sha:process.env.GITHUB_SHA||"local",scope:"Fixed original Batch2 15 items; 13 remaining categories. Existing regression execution only, NOT proof of all state combinations, memory leak slope or all-mode end-to-end.",results};
fs.writeFileSync("batch2-final13-evidence.json",JSON.stringify(report,null,2)+"\n");
if(results.some(x=>x.status!=="pass"))process.exitCode=1;
