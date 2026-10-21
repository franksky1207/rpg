// Names come from the actual gameplay owner; prototypes are the approved contract.
const fs=require('node:fs'),vm=require('node:vm');
const owner=vm.createContext({window:{}});
vm.runInContext(fs.readFileSync('specialmonsters.js','utf8'),owner);
const prototypes={gold_slime:'energy-01',mimic:'fort-01',reaper:'mech-02',lucky_rabbit:'energy-01',ancient_guardian:'dr-02',relic_guardian:'mech-01',bandit_king:'cmd-01',collector:'hm-02',mysterious_traveler:'hm-02'};
const mappings=JSON.parse(fs.readFileSync('data/monsters/monster-mappings.json')).records;
module.exports=Object.entries(prototypes).flatMap(([specialId,assetId])=>[1,2].map(world=>({...mappings.find(r=>r.specialId===specialId),assetId,mode:'special',world:world===1?'galaxy':'universe',name:vm.runInContext(`getSpecialMonsterById(${JSON.stringify(specialId)},${world}).name`,owner)})));
