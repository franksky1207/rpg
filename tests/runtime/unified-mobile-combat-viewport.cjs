"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm");
const source=fs.readFileSync("combat-viewport-coordinator.js","utf8");
const css=fs.readFileSync("battle-mobile-viewport.css","utf8");
const index=fs.readFileSync("index.html","utf8");
const d=fs.readFileSync("dungeonui.js","utf8");
assert.match(index,/combat-viewport-coordinator\.js\?v=20261019-unified1/);
assert.match(css,/combat-viewport-stop/);
assert.match(source,/\.formal-b-shared-stage:not\(\[hidden\]\)/);
assert.match(source,/visualViewport/);
assert.match(source,/touchmove/);
assert.match(source,/mutation/i);
assert.match(source,/manual/);
assert.match(d,/CivilizationCombatViewport/);
const listeners={};let scroll=0,schedule=[],viewportHeight=660;
const makeNode=(top,bottom)=>({top,bottom,height:bottom-top});
const button={textContent:"停止連續討伐",getAttribute:()=>"stopCivilizationCalamityContinuousUI()",closest:()=>wrap};
const wrap={parentElement:null,nextElementSibling:null,classList:{add(k){this[k]=true;}},getBoundingClientRect:()=>makeNode(320,370)};
const screen={
 isConnected:true,
 closest:()=>({contains:()=>true,querySelectorAll:()=>[button]}),
 querySelector:s=>s.includes("formal-b-shared-stage")?stage:null,
 insertBefore(w,t){w.parentElement=this;w.nextElementSibling=t;},
};
const stage={isConnected:true,getBoundingClientRect:()=>makeNode(400,680)};
let combat=screen;
const root={isConnected:true,querySelector:()=>combat};
const observer={observe(){}};
const document={
 readyState:"complete",visibilityState:"visible",hidden:false,
 body:{classList:{contains:()=>false}},
 scrollingElement:{scrollHeight:2400},documentElement:{scrollHeight:2400},
 getElementById:id=>id==="main"?root:null,
 addEventListener:(name,fn)=>listeners[name]=fn
};
const window={
 matchMedia:()=>({matches:true}),innerHeight:660,get scrollY(){return scroll;},
 visualViewport:{height:viewportHeight,offsetTop:0,addEventListener:(name,fn)=>listeners["vv-"+name]=fn},
 CivilizationPresentationMode:{combatAnimationEnabled:()=>true},
 requestAnimationFrame:fn=>{schedule.push(fn);},
 scrollTo:arg=>{scroll=arg.top;},
 addEventListener:(name,fn)=>listeners[name]=fn
};
const context={window,document,MutationObserver:class{constructor(fn){this.fn=fn;}observe(){}}};
vm.runInNewContext(source,context);
const flush=()=>{for(let n=0;n<5&&schedule.length;n++){const tasks=schedule; schedule=[];tasks.forEach(fn=>fn());}};
flush();
assert(scroll>0,"actual visual stage must scroll into view");
assert.equal(wrap.parentElement,screen,"stop is relocated inside combat screen");
assert.equal(wrap.nextElementSibling,stage,"stop stays above visual stage");
const before=scroll;
listeners.touchmove();
window.CivilizationCombatViewport.sync();flush();
assert.equal(scroll,before,"manual scrolling suppresses programmatic reposition");
combat=null;window.CivilizationCombatViewport.sync();
assert.equal(window.CivilizationCombatViewport.snapshot().manual,false,"leaving combat resets manual protection");
combat=screen;window.CivilizationCombatViewport.sync();flush();
assert.equal(window.CivilizationCombatViewport.snapshot().observerCount,1,"one shared observer");
console.log("UNIFIED_MOBILE_COMBAT_VIEWPORT_PASS");
