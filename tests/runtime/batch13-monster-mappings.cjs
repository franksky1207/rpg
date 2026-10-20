'use strict';
// Execute actual source data in an isolated VM: source/region/map/slot and stable IDs,
// never fuzzy display-name matching. No gameplay functions are invoked.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const design=read('docs/MONSTER_MAP_MAPPING_BATCH13_STEP1_2026-10-20.json'),data=read('data/monsters/monster-mappings.json'),registry=read('data/monsters/monster-assets.json'),variants=read('data/monsters/monster-variants.json');
const ctx=vm.createContext({window:{},console,registerRegionMaps:(id,maps)=>regions.push({id,maps})}),regions=[];
const files=[...new Set(design.records.filter(r=>r.world==='galaxy').map(r=>r.source))];
for(const file of files)vm.runInContext(fs.readFileSync(file,'utf8'),ctx,{filename:file});
vm.runInContext(fs.readFileSync('secondworlddata.js','utf8'),ctx);
vm.runInContext(fs.readFileSync('specialmonsters.js','utf8')+'\nwindow.specials=SPECIAL_MONSTERS;',ctx);
const assets=new Map(registry.assets.map(a=>[a.assetId,a]));assert.equal(assets.size,20);assert.equal(data.formalBattleEnabled,false);assert.equal(registry.formalBattleEnabled,false);
assert.equal(data.records.length,609);assert.equal(new Set(data.records.map(r=>r.id)).size,609);
const sourceRows=[];
for(let region=0;region<regions.length;region++)for(let map=0;map<regions[region].maps.length;map++)for(let slot=0;slot<5;slot++){
 const [name,level,kind,combatStyle]=regions[region].maps[map].enemies[slot];sourceRows.push({id:'galaxy-map-'+String(sourceRows.length+1).padStart(3,'0'),source:files[region],region:region+1,mapIndex:map+1,slot:slot+1,name,level,kind,combatStyle,world:'galaxy'});
}
assert.equal(sourceRows.length,500);
for(const b of ctx.window.SECOND_WORLD_BOSSES)sourceRows.push({id:b.id,name:b.name,level:b.level,kind:'boss',world:'universe',source:'secondworlddata.js'});
assert.equal(sourceRows.length,600);
for(const b of ctx.window.specials)sourceRows.push({id:'special-'+b.id,specialId:b.id,name:b.name,tier:b.tier,kind:'special',world:'both',source:'specialmonsters.js'});
const mappings=new Map(data.records.map(r=>[r.id,r]));
for(const source of sourceRows){const row=mappings.get(source.id);assert.ok(row,source.id);for(const [key,value] of Object.entries(source))assert.equal(row[key],value,source.id+'/'+key);
 const a=assets.get(row.assetId);assert.ok(a,'unknown asset '+row.assetId);const v=row.visual;assert.ok(Object.hasOwn(variants.palettes,v.palette));assert.ok(v.scale>=.6&&v.scale<=1.3);assert.deepEqual(v.pivot,[.5,.5]);assert.equal(v.offsetX,0);assert.equal(v.offsetY,0);assert.equal(v.facing,a.facing);assert.equal(v.animationType,a.animationType);assert.ok(v.maxStageFraction>0&&v.maxStageFraction<=.47);
 if(row.specialId){const actual=ctx.window.specialMonsterForWorld(ctx.window.specials.find(b=>b.id===row.specialId),2);assert.equal(actual.id,row.specialId);assert.equal(actual.name,ctx.window.SPECIAL_WORLD2_PROFILES[row.specialId].name);}
}
const before=read('development/monster-art/batch13-twenty/mapping-review.json');
for(const change of before.corrections){assert.equal(design.records.find(r=>r.id===change.id).assetId,change.from);assert.equal(mappings.get(change.id).assetId,change.to);}
console.log('PASS 609 source identities: galaxy 500 + universe 100 + special 9; valid mappings 609, missing 0, invalid asset 0; explicit corrections '+before.corrections.length);
