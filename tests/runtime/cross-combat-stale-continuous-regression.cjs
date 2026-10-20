"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const source=fs.readFileSync("worldtransitionsafety.js","utf8");

function check({view="",bounty=null,arena=null,extra={}}={}){
 const blockers=new Map();
 const window={
  currentWorldPhase:()=>2,
  getBountyTestSnapshot:()=>bounty,
  getArenaCoreState:()=>arena,
  registerWorldTransitionRuntimeBlocker:(name,fn)=>{blockers.set(name,fn);return true;},
  ...extra
 };
 const context={window,view,state:{secondWorld:{entered:true}},sessionStorage:{removeItem(){}},console};
 vm.runInNewContext(source,context,{filename:"worldtransitionsafety.js"});
 assert.equal(blockers.has("subsystems"),true,"subsystem blocker registered");
 return [...blockers.get("subsystems")().reasons];
}
for(const mode of ["bounty","arena"]){
 const snapshot={phase:"result",continuous:true,stopRequested:true};
 assert.deepEqual(check({[mode]:snapshot}),[],mode+" settled continuous run must not lock subsequent calamity");
 assert.deepEqual(check({[mode]:{...snapshot,stopRequested:false}}),[],mode+" naturally finished run must not block");
 assert.deepEqual(check({[mode]:{phase:"ready",continuous:false}}),[],mode+" stale ready state must not block after leaving view");
 assert.deepEqual(check({[mode]:{phase:"combat",continuous:true}}),[mode+"-active"],mode+" active battle must retain mutex");
 assert.deepEqual(check({[mode]:{phase:"combat",continuous:false}}),[mode+"-active"],mode+" active single battle must retain mutex");
 const activeView=mode==="bounty"?"dungeon-bounty":"dungeon-arena";
 assert.deepEqual(check({view:activeView,[mode]:{phase:"ready"}}),[mode+"-active"],mode+" visible preparation must retain mutex");
}
assert.deepEqual(check({bounty:{phase:"transition",continuous:true}}),["bounty-active"],"between-round bounty must retain mutex");
assert.deepEqual(check({bounty:{phase:"result",continuous:true},arena:{phase:"combat",continuous:true}}),["arena-active"],"settled bounty cannot mask live arena");
assert.deepEqual(check({extra:{getVoidMirageRunSnapshot:()=>({active:true})}}),["void-active"],"other live blockers must remain");
assert.deepEqual(check({extra:{getVoidMirageRunSnapshot:()=>{throw Error("fault")}}}),["void-check-error"],"failed runtime check must fail closed");
console.log("Cross-combat subsystem lifecycle regression passed");
