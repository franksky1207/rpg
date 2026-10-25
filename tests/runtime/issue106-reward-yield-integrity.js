const fs=require("node:fs");
const vm=require("node:vm");
const assert=require("node:assert/strict");
const read=path=>fs.readFileSync(path,"utf8");
const core=read("reincarnationoverlevelrewards.js");
const offline=read("offlineprogress.js");
const world1=read("combatcore.js");
const world2=read("secondworldrewards.js");
const stone=read("enhancementrewards.js");
const mock={window:{specializationMultiplier:key=>({training:2.5,scavenge:2.5,appraisal:2.5})[key]||1,isReincarnationRun:s=>s.reincarnation?.count>0},state:{reincarnation:{count:1,breakthrough:{permanent:0}}},console};
vm.runInNewContext(core,mock,{filename:"reincarnationoverlevelrewards.js"});
assert.equal(mock.window.REINCARNATION_OVERLEVEL_REWARD_INTEGRITY.passed,true);
const calc=mock.window.calculateReincarnationYield;
const profile=level=>({reincarnation:{count:1,breakthrough:{permanent:level}}});
for(const [level,rate] of [[0,1],[1,1.01],[10,1.10],[130,2.30],[500,6]]){
 const target=profile(level);
 assert.ok(Math.abs(calc(100,{target,integer:false})/100-rate)<1e-10);
 assert.equal(calc(100,{target,specialization:"training"}),Math.ceil(100*(2.5+level*.01)-1e-10));
 assert.equal(calc(100,{target,specialization:"scavenge",overlevelMultiplier:2}),Math.ceil(200*(2.5+level*.01)-1e-10));
 assert.equal(calc(100,{target,specialization:"appraisal"}),Math.ceil(100*(2.5+level*.01)-1e-10));
 assert.equal(calc(1,{target}),Math.ceil(1+level*.01-1e-10));
}
const first={reincarnation:{count:0,breakthrough:{permanent:0}}};
assert.equal(calc(100,{target:first,playerLevel:100,enemyLevel:500}),100);
assert.equal(calc(100,{target:profile(0),playerLevel:100,enemyLevel:105}),115);
assert.equal(calc(100,{target:profile(130),specialization:"training"}),380);
assert.equal(calc(1,{target:profile(130)}),3);
assert.match(offline,/const OFFLINE_REWARD_RATE=\.10;/);
for(const retired of ["OFFLINE_EXP_RATE","OFFLINE_GOLD_RATE","OFFLINE_GEAR_RATE","OFFLINE_ENHANCEMENT_STONE_RATE","OFFLINE_SECOND_WORLD_DARK_ENERGY_RATE"]){
 assert.ok(!offline.includes(retired),"Retired offline owner: "+retired);
}
assert.match(offline,/calculateReincarnationYield\(expected\?\.basic/);
assert.match(offline,/firstWorldMainlineRewardPreview\(enemy/);
assert.match(world1,/firstWorldMainlineRewardPreview\(e/);
assert.ok(!world1.includes("result=window.applyWorld1OnlineOverlevelReward"));
assert.match(world2,/calculateReincarnationYield\(rawXp/);
assert.match(world2,/calculateReincarnationYield\(rawMatter/);
assert.match(stone,/calculateReincarnationYield\(raw.basic/);
assert.ok(!offline.includes("*.05"));
console.log("Issue #106 reward-yield integrity passed (levels, specialization, overlevel, sales, offline owner).");

// Integer contract: currency preserves legacy nested ceil at B0; materials floor
// the complete yield, bounded below by the legacy overlevel integer award.
assert.equal(calc(1,{target:profile(1),resource:true}),1);
assert.equal(calc(1,{target:profile(130),resource:true}),2);
assert.equal(calc(1,{target:profile(1),resource:true,overlevelMultiplier:1.15}),2);
assert.equal(calc(1,{target:profile(0),specialization:"training",overlevelMultiplier:1.15}),4);
assert.equal(calc(0,{target:profile(500),resource:true}),0);
assert.ok(!core.includes("calculateReincarnationYieldFromAdjusted"),"Unused adjusted-input owner must be retired");
assert.ok(!core.includes("function applyBattleStoneBonus"),"Post-settlement top-up implementation must be retired");
const already={ok:true,win:true,xp:100,gold:100,e:{level:500}};
const before=JSON.stringify(mock.state);
assert.equal(mock.window.applyWorld1OnlineOverlevelReward(already,1),already);
assert.equal(JSON.stringify(mock.state),before,"Retired compatibility API must never mutate state");
assert.equal(already.xp,100,"Compatibility API must not award twice");
assert.ok(!offline.includes("收益 5%")&&!offline.includes("資源 5%"));

const isolated={console,state:{specializations:{training:60,scavenge:60,appraisal:60}},document:{getElementById:()=>true}};
isolated.window=isolated;
vm.createContext(isolated);
vm.runInContext(read("specialization.js"),isolated);
vm.runInContext(core,isolated);
for(const breakthrough of [0,1,10,130,500])for(const specLevel of [0,60]){
 const target={...profile(breakthrough),specializations:{training:specLevel,scavenge:specLevel,appraisal:specLevel}};
 const saved=JSON.stringify(target),formalSaved=JSON.stringify(isolated.state);
 for(const key of ["training","scavenge","appraisal"]){
  const expected=100*(1+specLevel*.025+breakthrough*.01);
  assert.ok(Math.abs(isolated.calculateReincarnationYield(100,{target,specialization:key,integer:false})-expected)<1e-9);
  isolated.gmTestSpecializations[key]=60-specLevel;
  assert.ok(Math.abs(isolated.calculateReincarnationYield(100,{target,specialization:key,useTest:true,integer:false})-100*(1+(60-specLevel)*.025+breakthrough*.01))<1e-9);
 }
 assert.equal(JSON.stringify(target),saved,"Preview must not normalize or mutate target");
 assert.equal(JSON.stringify(isolated.state),formalSaved,"Explicit target must not normalize global formal state");
}
console.log("Issue #106 integer, target-state and GM isolation contracts passed.");

assert.equal(calc(1,{target:profile(1),specialization:"training",overlevelMultiplier:1.15}),4,"B1 currency must not lose B0 legacy rounding");
