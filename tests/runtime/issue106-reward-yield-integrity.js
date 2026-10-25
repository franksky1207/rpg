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
assert.match(offline,/calculateReincarnationYield\(xpRaw/);
assert.match(world1,/calculateReincarnationYield\(xpBase/);
assert.ok(!world1.includes("result=window.applyWorld1OnlineOverlevelReward"));
assert.match(world2,/calculateReincarnationYield\(rawXp/);
assert.match(world2,/calculateReincarnationYield\(rawMatter/);
assert.match(stone,/calculateReincarnationYield\(raw.basic/);
assert.ok(!offline.includes("*.05"));
console.log("Issue #106 reward-yield integrity passed (levels, specialization, overlevel, sales, offline owner).");
