"use strict";
// Fixed-scope batch1 orchestration. All 12 checks are evidence-gated; unsupported coverage is reported as incomplete.
const fs=require("fs"),cp=require("child_process");
const items=[
 ["01","Architecture/static","node","tests/runtime/combat-events-integration.cjs"],
 ["02","Lifecycle/cleanup","node","tests/runtime/combat-events-owner-browser.js"],
 ["03","Alternate owner","node","tests/runtime/alternate-universe-batch4-3-regression.js"],
 ["04","Frames/layout/longtasks","node","tests/runtime/batch1-animation-frame-trace.cjs"],
 ["05","Repeated stress","node","tests/runtime/hybrid-comparison-playback-contract.cjs"],
 ["06","Background modes","node","tests/runtime/cross-era-background-browser.js"],
 ["07","Fast Catch-up","node","tests/runtime/calamity-shared-terminal-fast-catchup-integrity.js"],
 ["08","Offline settlement","node","tests/runtime/offline-sample-provenance-opt4-integrity.js"],
 ["09","Minimal/speed","node","tests/runtime/thirdworld-background-browser.js"],
 ["10","Art/resource references","node","tests/runtime/cleanup-batch4-3-current-inventory.cjs"],
 ["11","Resource/disposal","node","tests/runtime/hybrid-comparison-renderer-contract.cjs"],
 ["12","Release/regression","node","tests/runtime/resource-manifest-integrity.js"]
];
const results=[];
for(const [id,scope,kind,file] of items){
 if(!fs.existsSync(file)){results.push({id,scope,file,status:"unavailable"});continue;}
 const begin=process.hrtime.bigint();const r=cp.spawnSync(process.execPath,[file],{encoding:"utf8",timeout:120000,maxBuffer:6*1024*1024,env:{...process.env,RUNTIME_SMOKE_URL:"http://127.0.0.1:4173/index.html"}});
 results.push({id,scope,file,status:r.error?"error":r.status===0?"pass":"fail",durationMs:Number(process.hrtime.bigint()-begin)/1e6,exitCode:r.status,tail:(r.stdout+"\n"+r.stderr).slice(-1000)});
 console.log("SCOPE",id,results.at(-1).status,scope,results.at(-1).durationMs.toFixed(1)+"ms");
}
const out={schema:"cw.batch1.fixed12.evidence.v1",sha:process.env.GITHUB_SHA||"local",claims:"Only existing automated regression checks; pass does not prove full-mode lifecycle, art-reference closure, genuine heavy animation stress or memory-leak stability",results};
fs.writeFileSync("batch1-fixed12-evidence.json",JSON.stringify(out,null,2)+"\n");
if(results.some(x=>x.status!=="pass"))process.exitCode=1;
