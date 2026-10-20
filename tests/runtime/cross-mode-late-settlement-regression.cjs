"use strict";
const fs=require("node:fs"),vm=require("node:vm"),assert=require("node:assert/strict");
const source=fs.readFileSync("battlepipeline.js","utf8");
const start=source.indexOf("setTimeout(()=>{if(battleBusy||window.activeMainBattleContext||window.activeSecondWorldMainlineContext)return;showBattleResult(ctx,defeat);");
assert(start>=0,"galaxy settlement late-callback guard exists");
const end=source.indexOf("},0);",start);
assert(end>start,"callback ends at zero-delay timer");
const statement=source.slice(start,end+5);
function exercise({busy=false,first=false,second=false}={}){
 const called=[],ctx={id:"old-battle"},defeat=false;
 const env={battleBusy:busy,ctx,defeat,window:{activeMainBattleContext:first?{id:"new"}:null,activeSecondWorldMainlineContext:second?{id:"new"}:null,mainMinimalModeHandleBattleResult:()=>called.push("minimal")},showBattleResult:()=>called.push("result"),setTimeout:fn=>fn()};
 vm.runInNewContext(statement,env);
 return called;
}
assert.deepEqual(exercise(),["result","minimal"],"normal completed battle still displays result");
assert.deepEqual(exercise({busy:true}),[],"next running battle must not get overwritten");
assert.deepEqual(exercise({first:true}),[],"next galaxy owner must not get overwritten");
assert.deepEqual(exercise({second:true}),[],"universe owner must not get overwritten");
console.log("Late settlement cross-mode isolation regression passed");
