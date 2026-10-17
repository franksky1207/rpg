'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const w={};w.window=w;vm.createContext(w);vm.runInContext(fs.readFileSync('secondworlddata.js','utf8'),w);vm.runInContext(fs.readFileSync('savemigration.js','utf8'),w);
const cp=require('node:child_process');const index={sets:JSON.parse(cp.execFileSync('python3',['scripts/formal-equipment-identities.py'],{encoding:'utf8'})).rows},mapping=JSON.parse(fs.readFileSync('docs/WEAPON_NAME_MIGRATION_2026-10-15.json'));
assert.equal(index.sets.length,210);assert.equal(index.sets.flatMap(r=>Object.values(r.equipmentNames)).length,1050);assert.equal(new Set(index.sets.map(r=>r.id)).size,210);assert.equal(new Set(index.sets.map(r=>r.equipmentNames.weapon)).size,210);
assert.deepEqual(index.sets.filter(r=>r.epoch==='higher').map(r=>r.id),Array.from({length:10},(_,i)=>'h'+String(i+1).padStart(2,'0')));
for(const r of index.sets){assert.doesNotMatch(r.equipmentNames.weapon,/[槍炮戟矛鐮斧鎚錘]/);if(r.epoch!=='higher')assert.match(r.equipmentNames.weapon,/[刀劍刃鋒]/);if(mapping.ids[r.id])assert.equal(r.equipmentNames.weapon,mapping.ids[r.id]);}
assert.equal(Object.keys(w.SECOND_WORLD_LEGACY_WEAPON_NAMES).length,70);
// Execute the actual load pipeline on real schema17 gear containers. A no-op
// normalizer isolates this rename from unrelated existing normalization rules.
w.normalizeReincarnationState=x=>x;w.normalizeOfflineSaveState=x=>x;
w.EQUIPMENT_TYPES=['weapon','helmet','armor','shoes','accessory'];
for(const [old,name] of Object.entries(mapping.aliases)){
 const item={id:'preserve-id',world:2,type:'weapon',name:old,visualKey:old,level:777,q:5,locked:true,hp:0,atk:123,def:0,crit:0,dodge:0,mainStat:{stat:'atk',value:123},affixes:[{stat:'crit',value:0}],enhancement:17,custom:{keep:true}};
 const input={saveVersion:17,introSeen:true,equipment:{weapon:structuredClone(item)},inventory:[structuredClone(item)],lostGear:[{item:structuredClone(item)}]};
 const result=w.migrateSave(input,17,x=>x);
 for(const actual of [result.equipment.weapon,result.inventory[0],result.lostGear[0].item])assert.deepEqual(JSON.parse(JSON.stringify(actual)),{...item,name,visualKey:name});
 const again=w.migrateSave(result,17,x=>x);assert.equal(again.inventory.length,1);assert.equal(again.inventory[0].name,name);
}
for(const [world,type] of [[1,'weapon'],[3,'weapon'],[2,'helmet']]){const name=Object.keys(mapping.aliases)[0],target={saveVersion:17,inventory:[{world,type,name,mainStat:{stat:'atk',value:1},affixes:[{stat:'atk',value:1}]}]};assert.equal(w.migrateSave(target,17,x=>x).inventory[0].name,name);}
assert.equal(w.canonicalSecondWorldWeaponName('自訂名稱'),'自訂名稱');assert.equal(w.canonicalSecondWorldWeaponName('toString'),'toString');
console.log('PASS 210 formal equipment identities / 1050 slots / 70 aliases / schema17 gear migration; no legacy concept image requirement');
