"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm");
const code=fs.readFileSync("3d-test/era-appearance-contract.js","utf8");
const storage=new Map(),events=[];
const w={
 state:{reincarnation:{count:0}},
 civilizationAuthSession:{user:{id:"A"}},
 localStorage:{getItem:k=>storage.has(k)?storage.get(k):null,setItem:(k,v)=>storage.set(k,v)},
 dispatchEvent:e=>events.push(e.detail)
};
const context={window:w,CustomEvent:class{constructor(type,options){this.type=type;this.detail=options.detail;}}};
vm.runInNewContext(code,context);
const c=w.CivilizationEraAppearanceContract;
assert.equal(c.version,2);assert.equal(c.readOnly,true);
for(const [world,id] of [[1,"galaxy"],[2,"universe"],[3,"higher"]])assert.equal(c.resolve({world}).visualId,id);
assert.equal(c.resolve({world:1,equipped:{armor:{epoch:"higher"}}}).visualId,"galaxy");
assert.equal(c.resolve({world:1,equipped:{weapon:{epoch:"galaxy"},shoes:{epoch:"higher"}}}).visualId,"galaxy");
assert.equal(c.resolve({world:1,equipped:{armor:{epoch:"universe"}}}).visualId,"galaxy");
assert.equal(c.canChoose(),false);assert.equal(c.select("universe").ok,false);
w.state.reincarnation.count=8;
assert.equal(c.canChoose(),true);assert.equal(c.resolve({world:1}).visualId,"higher");
assert.equal(c.select("universe").ok,true);assert.equal(c.resolve({world:1}).visualId,"universe");
assert.equal(events.length,1);assert.equal(events[0].apply,"next-battle");
w.civilizationAuthSession.user.id="B";
assert.equal(c.resolve({world:2}).visualId,"higher");
assert.equal(c.select("galaxy").ok,true);
w.civilizationAuthSession.user.id="A";
assert.equal(c.choice(),"universe");
w.state.reincarnation.count=0;
assert.equal(c.resolve({world:3}).visualId,"higher");
assert.equal(c.select("higher").ok,false);
assert.equal(c.resolve({world:1,role:"enemy"}).ready,false);
assert.equal(c.resolve({world:4}).ready,false);
assert.equal(c.resolve({world:1}).artReleased,false);
assert.equal(c.select("INVALID").ok,false);
w.state.reincarnation.count=3;
w.civilizationAuthSession.user.id="A";
storage.set("civilization-war-era-appearance-v1:A","malformed");
assert.equal(c.choice(),"higher");
storage.set("civilization-war-era-appearance-v1:A","galaxy");
assert.equal(c.choice(),"galaxy");
delete w.civilizationAuthSession.user;
assert.equal(c.canChoose(),false);
assert.equal(c.select("higher").ok,false);
w.civilizationAuthSession.user={id:"A"};
const goodStorage=w.localStorage;
w.localStorage={getItem(){throw Error("blocked");},setItem(){throw Error("blocked");}};
assert.equal(c.choice(),"higher");
assert.equal(c.select("universe").ok,false);
w.localStorage=goodStorage;
assert.equal(c.choice(),"galaxy");
w.state.reincarnation.count=8;

const formal=fs.readFileSync("3d-test/t3b-formal-entry.js","utf8");
assert.ok(!formal.includes("data-player-sprite-toggle"));
assert.ok(formal.includes("combatAnimationEnabled"));
const mode=fs.readFileSync("3d-test/mode-foundation.js","utf8");
assert.ok(mode.includes("setCombatAnimationEnabled")&&mode.includes("setEraAppearance")&&mode.includes("localStorage.setItem"));
assert.ok(!mode.includes("選擇遊戲模式"));
assert.ok(mode.includes("function appearanceHtml()"));
assert.ok(mode.includes("civilizationEraAppearanceChoice"));
assert.ok(mode.includes("setEraAppearance"));
assert.ok(mode.includes("首次正式轉生後解鎖"));
assert.ok(mode.includes("變更從下一場戰鬥生效"));

const html=fs.readFileSync("index.html","utf8");
assert.ok(html.includes("era-appearance-contract.js?v=20261018-batch7-v2"));
console.log("PASS Batch7 foundation: visual choice independent of gear, reincarnation gate, account isolation, next-battle apply, no art release");
