"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm");
const src=fs.readFileSync("combat-viewport-coordinator.js","utf8");
assert.doesNotMatch(src,/textContent|insertBefore|stopControl/);
assert.match(src,/visualViewport/);
for(const p of ["dungeonbounty.js","dungeonarena.js","thirdworldarenaui.js","worldmapui.js","thirdworldui.js","calamityui.js","secondworldcalamityui.js"]){
 const s=fs.readFileSync(p,"utf8");assert.match(s,/window\.renderContinuousStopControl\(/,p);
}
const handlers={};let y=0,hidden=true;const q=[];
const stage={isConnected:true,get hidden(){return hidden;},getBoundingClientRect(){return {top:700-y,bottom:950-y,width:350,height:250}}};
let combat={querySelector:()=>hidden?null:stage};
const root={isConnected:true,querySelector:()=>combat};
const doc={readyState:"complete",visibilityState:"visible",hidden:false,body:{classList:{contains:()=>false}},scrollingElement:{scrollHeight:2200},documentElement:{scrollHeight:2200},getElementById:()=>root,addEventListener:(k,v)=>handlers[k]=v};
let mutation;
const win={matchMedia:()=>({matches:true}),innerHeight:660,innerWidth:390,get scrollY(){return y;},visualViewport:{width:390,height:660,offsetTop:0,addEventListener:()=>{}},CivilizationPresentationMode:{combatAnimationEnabled:()=>true},requestAnimationFrame:fn=>q.push(fn),scrollTo:v=>{y=v.top;},addEventListener:(k,v)=>handlers[k]=v};
vm.runInNewContext(src,{window:win,document:doc,MutationObserver:class{constructor(f){mutation=f;}observe(){}}});
const flush=()=>{for(let i=0;i<15&&q.length;i++){let a=q.splice(0);a.forEach(f=>f());}};
flush();assert.equal(y,0,"loading must not move viewport");
hidden=false;mutation();flush();assert(Math.abs((700-y+125)-330)<18,"ready stage must be centered");
const before=y;handlers.touchmove();win.CivilizationCombatViewport.sync();flush();assert.equal(y,before,"manual scroll protected");
combat=null;win.CivilizationCombatViewport.sync();assert.equal(win.CivilizationCombatViewport.snapshot().manual,false);
console.log("UNIFIED_MOBILE_COMBAT_VIEWPORT_PASS");
// A queued stable-layout callback must not outlive its original stage or gesture.
combat={querySelector:()=>stage};hidden=false;y=0;win.CivilizationCombatViewport.sync();handlers.touchmove();flush();assert.equal(y,0,'gesture during pending RAF cancels centering');
combat=null;win.CivilizationCombatViewport.sync();
combat={querySelector:()=>stage};y=0;win.CivilizationCombatViewport.sync();hidden=true;mutation();flush();assert.equal(y,0,'retired loading stage cannot scroll');
hidden=false;mutation();flush();assert(y>0);const once=y;
combat={querySelector:()=>({...stage,getBoundingClientRect:()=>({top:1000-y,width:350,height:250})})};mutation();flush();assert.equal(y,once,'continuous screen replacement is not a new focus request');
assert.equal(win.CivilizationCombatViewport.snapshot().observerCount,1,'one viewport observer');
combat=null;win.CivilizationCombatViewport.sync();win.visualViewport.offsetTop=29;win.visualViewport.height=480;
combat={querySelector:()=>stage};y=0;win.CivilizationCombatViewport.sync();flush();assert(Math.abs(700-y+125-(29+240))<3,'visualViewport toolbar offset and visible height determine only the stage center');
combat=null;win.CivilizationCombatViewport.sync();win.matchMedia=()=>({matches:false});combat={querySelector:()=>stage};y=0;win.CivilizationCombatViewport.sync();flush();assert.equal(y,0,'desktop never uses mobile positioning');
