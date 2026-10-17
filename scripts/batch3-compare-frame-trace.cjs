"use strict";
const fs=require("node:fs"),cp=require("node:child_process"),path=require("node:path");
const baseline="1db8b9b2db656e7aedec78041af01eca506382d6";
const source="tests/runtime/batch1-animation-frame-trace.cjs";
const helper="tests/runtime/.batch3-trace-temporary.cjs";
const oldScript="tests/runtime/.batch3-combatfx-before.js";
let runner=fs.readFileSync(source,"utf8");
const from='await page.addScriptTag({path:"combatfx.js"});';
if(!runner.includes(from))throw Error("benchmark injection anchor missing");
runner=runner.replace(from,'await page.addScriptTag({content:fs.readFileSync(process.env.COMBATFX_BENCH_SOURCE,"utf8")});');
fs.writeFileSync(helper,runner);
const reports=[];
try{
 fs.writeFileSync(oldScript,cp.execFileSync("git",["show",baseline+":combatfx.js"],{encoding:"utf8",maxBuffer:8*1024*1024}));
 for(const row of [{label:"before",source:oldScript},{label:"after",source:"combatfx.js"}]){
  const r=cp.spawnSync(process.execPath,[helper],{encoding:"utf8",timeout:180000,env:{...process.env,COMBATFX_BENCH_SOURCE:path.resolve(row.source)},maxBuffer:3*1024*1024});
  if(r.status!==0)throw Error(row.label+" trace failed: "+(r.stderr||r.stdout).slice(-2500));
  const data=JSON.parse(fs.readFileSync("batch1-animation-frame-trace.json","utf8"));
  reports.push({label:row.label,source:row.source,entries:data.entries.map(x=>({mode:x.mode,frameInterval:x.frameInterval,traceCounts:x.traceCounts,traceDurationMs:x.traceDurationMs,longTask:x.longTask,mutationRecords:x.mutationRecords,remainingFloaters:x.remainingFloaters}))});
  console.log("BATCH3_COMPARE",row.label,r.stdout.trim().slice(-700));
 }
 fs.writeFileSync("batch3-before-after-frame-trace.json",JSON.stringify({schema:"cw.batch3.same-presenter-before-after.v1",baseline,head:process.env.GITHUB_SHA||"local",caveat:"Same isolated synthetic common presenter, NOT alternate-universe full UI or iPhone thermal measurements; frame jitter in CI is not a performance guarantee.",reports},null,2)+"\n");
}finally{
 for(const file of [helper,oldScript])try{fs.unlinkSync(file)}catch{}
}
