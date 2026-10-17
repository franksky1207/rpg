"use strict";
/* Audit-only subprocess timing. This does NOT measure FPS, frame costs or iPhone heat.
   Each scenario executes an existing regression in a fresh Node process.
   No production runtime is modified or benchmark results fabricated. */
const {spawnSync}=require("node:child_process");
const fs=require("node:fs");
const {performance}=require("node:perf_hooks");
const sha=process.env.GITHUB_SHA||"local";
const scenarios=[
 ["galaxy-combat-context","tests/runtime/first-world-target-context-combat-batch3-integrity.js"],
 ["universe-and-cross-era-background","tests/runtime/cross-era-background-browser.js"],
 ["high-dimension-background","tests/runtime/thirdworld-background-browser.js"],
 ["high-dimension-settlement","tests/runtime/thirdworld-rerun-settlement-stage-regression.js"],
 ["alternate-combat","tests/runtime/alternate-universe-combat-integrity.js"],
 ["alternate-attempt","tests/runtime/alternate-universe-attempt-integrity.js"],
 ["alternate-ui","tests/runtime/alternate-universe-ui-integrity.js"],
 ["alternate-failure","tests/runtime/alternate-universe-failure-integrity.js"],
 ["calamity-fast-catchup","tests/runtime/calamity-shared-terminal-fast-catchup-integrity.js"],
 ["calamity-policy","tests/runtime/calamity-shared-ui-policy-opt-batch3.js"],
 ["offline-samples","tests/runtime/offline-sample-provenance-opt4-integrity.js"],
 ["review","tests/runtime/galaxy-review-combat-browser.js"],
 ["combat-events","tests/runtime/combat-events-owner-browser.js"],
 ["void-related-contract","tests/runtime/first-world-target-context-offline-rerun-review-batch5-integrity.js"],
 ["higher-dungeons-bounty-arena-void","tests/equipment-formal/higher-dungeons.cjs"],
 ["special-fast-catchup","tests/runtime/special-fast-catchup-integrity.js"],
 ["reincarnation-dungeon-access","tests/runtime/reincarnation-dungeon-access-batch6-4-integrity.js"],
 ["alternate-full-regression","tests/runtime/alternate-universe-batch4-3-regression.js"]
];
const data={schema:"cw.batch1.dynamic-ci-baseline.v1",sha,startedAt:new Date().toISOString(),method:"fresh Node subprocess executes existing isolated regression; elapsedMs is end-to-end test duration, not animation frame time",platform:{node:process.version,os:process.platform,arch:process.arch},samples:[]};
for(const [name,path] of scenarios){
 if(!fs.existsSync(path)){data.samples.push({name,path,status:"missing"});continue;}
 const start=performance.now();
 const child=spawnSync(process.execPath,[path],{encoding:"utf8",timeout:90000,env:{...process.env,RUNTIME_SMOKE_URL:"http://127.0.0.1:4173/index.html"},maxBuffer:4*1024*1024});
 const row={name,path,elapsedMs:Math.round((performance.now()-start)*100)/100,status:child.error?child.error.code==="ETIMEDOUT"?"timeout":"error":child.status===0?"pass":"fail",exitCode:child.status,signal:child.signal,tail:(String(child.stdout||"")+"\n"+String(child.stderr||"")).slice(-1250)};
 data.samples.push(row);
 console.log(name,row.status,row.elapsedMs+"ms");
}
data.finishedAt=new Date().toISOString();
data.passed=data.samples.filter(x=>x.status==="pass").length;
data.failed=data.samples.filter(x=>x.status!=="pass").length;
fs.writeFileSync("batch1-dynamic-ci-baseline.json",JSON.stringify(data,null,2)+"\n");
console.log("AUDIT",data.passed,"passed",data.failed,"not passed; invalid or unavailable tests remain evidence, not erased");
if(data.failed>0)process.exitCode=1;
