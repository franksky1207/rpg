/* Read-only 3D player snapshot contract; run: node tests/runtime/3d-player-snapshot-contract.js */
"use strict";
const assert=require("node:assert/strict");
const vm=require("node:vm");
const fs=require("node:fs");
const code=fs.readFileSync("3d-test/appearance-snapshot.js","utf8");
const game={
 level:700,vipLevel:12,breakthrough:{level:3},hp:1234,
 equipment:{weapon:{name:"Mock weapon",q:5,world:1,level:600}},
 inventory:[],
 enhancement:{levels:{weapon:29}},specializations:{training:42,scavenge:7},
 marks:{entries:{ward:{level:8},resilience:{level:2}}},
 secondWorld:{entered:true,civilizationLevel:6},
 thirdWorld:{coreLevel:4}
};
const baseline=JSON.stringify(game);
const window={state:game,currentWorldPhase:()=>2,effectiveEnhancementMin:()=>20,effectiveEnhancementCap:()=>40,
 SPECIALIZATION_KEYS:["training","scavenge"],MARK_KEYS:["ward","resilience"],
 markDisplayName:key=>({ward:"護界印記",resilience:"韌性印記"})[key],
 playerCombatStats:()=>({hp:30000,atk:6500,def:2900,crit:28,dodge:23})};
vm.runInNewContext(code,{window,JSON,Math,Number,String,Object,Array});
const data=window.Civilization3DAppearance.capture();
assert.equal(data.version,2);assert.equal(data.source,"formal");
assert.equal(data.world,2);assert.equal(data.abilities.hp,30000);
assert.equal(data.abilities.atk,6500);assert.equal(data.abilities.def,2900);
assert.equal(data.abilities.crit,28);assert.equal(data.abilities.dodge,23);
assert.equal(data.vip,12);assert.equal(data.breakthrough,3);
assert.equal(data.specializations.training,42);
assert.equal(data.markLevels.ward,8);assert.equal(data.civilizationLevel,6);
assert.equal(data.coreLevel,4);assert.equal(data.markNames[0],"護界印記");
assert.equal(data.equipment.weapon.world,1);
data.equipment.weapon.name="mutation";
data.specializations.training=0;
assert.equal(JSON.stringify(game),baseline,"3D snapshots must not mutate formal game data");
assert.equal(window.Civilization3DAppearance.scene("forge",data).cap,40);
console.log("PASS readonly 3D formal player snapshot v2, growth owner and save isolation");
