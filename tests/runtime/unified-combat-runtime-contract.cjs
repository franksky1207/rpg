"use strict";
const fs=require("node:fs");
const vm=require("node:vm");
const assert=require("node:assert/strict");
const source=fs.readFileSync("backgroundprogress.js","utf8");
const start=source.indexOf("function continuousRunConflictStatus(");
const end=source.indexOf("function createContinuousRunInfrastructure(",start);
assert(start>=0&&end>start,"shared continuous-run conflict entrypoint exists");
const fnSource=source.slice(start,end);
function check({runtime={blocked:false,blockers:[]},activeKind="",throwError=false,flow="calamity",own="galaxy-calamity"}={}){
 const window={backgroundProgressActiveKind:()=>activeKind,worldTransitionRuntimeStatus:()=>{if(throwError)throw Error("injected");return runtime;}};
 const fn=vm.runInNewContext("("+fnSource.trim().replace(/;\s*$/,"")+")",{window,Object,String,Array});
 const result=fn(flow,own);
 return {blocked:result.blocked,blockers:[...result.blockers]};
}
assert.deepEqual(check(),{blocked:false,blockers:[]},"idle flows can start");
assert.deepEqual(check({runtime:{blocked:true,blockers:["subsystems:bounty-active"]}}),{blocked:true,blockers:["subsystems:bounty-active"]},"real active bounty blocks");
assert.deepEqual(check({runtime:{blocked:true,blockers:["galaxy-calamity:active"]}}),{blocked:false,blockers:[]},"own live blocker is excluded");
assert.deepEqual(check({runtime:{blocked:true,blockers:[]}}),{blocked:true,blockers:["runtime-status-invalid"]},"blocked empty list fails closed");
assert.deepEqual(check({runtime:{blocked:true}}),{blocked:true,blockers:["runtime-status-invalid"]},"missing list fails closed");
assert.deepEqual(check({runtime:null}),{blocked:true,blockers:["runtime-status-invalid"]},"missing status fails closed");
assert.deepEqual(check({throwError:true}),{blocked:true,blockers:["runtime-status-check-error"]},"exception fails closed");
assert.deepEqual(check({activeKind:"bounty"}),{blocked:true,blockers:["background-flow:bounty"]},"other flow blocks");
assert.deepEqual(check({activeKind:"calamity"}),{blocked:false,blockers:[]},"same owned flow does not self-block");
console.log("Unified combat runtime dynamic contract passed");
