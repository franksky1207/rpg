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
// Cross-mode runtime owner matrix: completed owners must release; live owners must retain protection.
const owners=[
 ["mirror","mirrorDungeonStatus",()=>({status:"running"}),()=>({status:"completed"}),"mirror-active"],
 ["void","getVoidMirageRunSnapshot",()=>({active:true}),()=>({active:false,phase:"ended"}),"void-active"],
 ["galaxy calamity","getCivilizationCalamityRunSnapshot",()=>({active:true}),()=>({active:false,phase:"ended"}),"galaxy-calamity-active"],
 ["universe calamity","getSecondWorldCalamityRunSnapshot",()=>({active:true}),()=>({active:false,phase:"ended"}),"second-world-calamity-active"]
];
for(const [name,accessor,live,ended,reason] of owners){
 assert.deepEqual(check({extra:{[accessor]:ended}}),[],name+" finished owner must release runtime");
 assert.deepEqual(check({extra:{[accessor]:live}}),[reason],name+" live owner must block");
 for(const previous of ["bounty","arena"]){
  assert.deepEqual(check({[previous]:{phase:"result",continuous:true},extra:{[accessor]:live}}),[reason],name+" live owner still blocks after completed "+previous);
  assert.deepEqual(check({[previous]:{phase:"result",continuous:true},extra:{[accessor]:ended}}),[],name+" completed owner does not block after "+previous);
 }
 assert.deepEqual(check({extra:{[accessor]:()=>{throw Error("injected "+name)}}}),[name==="galaxy calamity"?"galaxy-calamity-check-error":name==="universe calamity"?"second-world-calamity-check-error":name+"-check-error"],name+" errors fail closed");
}
assert.deepEqual(check({extra:{activeSpecialEncounter:{id:"test"}}}),["special-encounter-active"],"live special encounter protects runtime");
assert.deepEqual(check({extra:{activeSpecialEncounter:null}}),[],"finished special encounter releases runtime");
assert.deepEqual(check({bounty:{phase:"combat"},arena:{phase:"combat"},extra:{getVoidMirageRunSnapshot:()=>({active:true})}}),["bounty-active","arena-active","void-active"],"parallel invalid active owners are all surfaced");
console.log("Cross-combat subsystem lifecycle regression passed");
