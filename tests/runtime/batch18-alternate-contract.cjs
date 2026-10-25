'use strict';
const fs=require('node:fs'),vm=require('node:vm'),cp=require('node:child_process'),assert=require('node:assert/strict'),crypto=require('node:crypto');
(async()=>{
 const read=p=>JSON.parse(fs.readFileSync(p)),baseline='6ca6b863d897d94db92d2e652e88aa013535becb',old=p=>JSON.parse(cp.execFileSync('git',['show',baseline+':'+p],{maxBuffer:16*1024*1024}));
 const a=read('data/monsters/monster-assets.json'),m=read('data/monsters/monster-mappings.json');
 assert.deepEqual(a.assets.slice(0,33),old('data/monsters/monster-assets.json').assets);assert.deepEqual(m.records.slice(0,695),old('data/monsters/monster-mappings.json').records);
 for(const asset of a.assets.slice(0,33))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(asset.path)).digest('hex'),asset.sha256);
 for(const file of ['alternateuniversedata.js','alternateuniverseattempt.js','alternateuniversecombat.js','alternateuniverseprogression.js','alternateuniverseui.js','reincarnationcore.js','combatcore.js','combat-events.js','offlineprogress.js'])assert.equal(fs.readFileSync(file,'utf8'),cp.execFileSync('git',['show','c0ec18d686d7111b2e5a7fa380c94653a2b8a2e4:'+file],{encoding:'utf8',maxBuffer:16*1024*1024}),file+' exact gameplay owner');
 const ctx={window:{}};vm.runInNewContext(fs.readFileSync('alternateuniversedata.js','utf8'),ctx);
 const {resolveFormalMonster}=await import('../../3d-test/monster-formal-resolver.mjs');
 const plan=read('development/combat-animation/batch18/culture-plan.json'),rows=m.records.filter(r=>r.status==='batch18-formal-enabled');
 assert.equal(rows.length,1000);assert.equal(a.assets.length,39);assert.equal(m.records.length,1695);assert.equal(new Set(plan.map(r=>r.assetId)).size,20);
 for(const p of plan){const asset=a.assets.find(a=>a.assetId===p.assetId);assert.ok(asset,'culture must resolve to a delivered asset');const group=rows.filter(r=>r.culture===p.culture);assert.equal(group.length,50);assert.deepEqual([...new Set(group.map(r=>r.assetId))],[p.assetId]);assert.equal(new Set(group.map(r=>r.universeIndex)).size,10);}
 const approvedRows=new Map(JSON.parse(cp.execFileSync('git',['show','c0ec18d686d7111b2e5a7fa380c94653a2b8a2e4:data/monsters/monster-mappings.json'],{maxBuffer:16*1024*1024})).records.map(r=>[r.id,r]));
 for(const row of rows){const info=ctx.window.alternateUniverseDepthInfo(row.depth);for(const k of ['culture','universeIndex','universeNumber','universeName','stageIndex','stageNumber','stageName'])assert.equal(row[k],info[k]);assert.equal(row.name,info.displayName);const proto=a.assets.find(a=>a.assetId===row.assetId);assert.equal(row.visual.animationType,proto.animationType);assert.ok(Object.hasOwn(read('data/monsters/monster-variants.json').palettes,row.visual.palette),'current approved alternate palette');
  const approved=approvedRows.get(row.id);assert.deepEqual(row,approved,'approved identity and per-stage appearance remain exact');
  const identity={mode:'alternate',world:3,location:String(row.depth)};
  assert.equal(resolveFormalMonster(identity)?.mapping.id,row.id);
  for(const world of [1,2,3])assert.equal(resolveFormalMonster({...identity,world,name:row.name,id:row.id,kind:row.kind})?.asset.assetId,row.assetId);
  for(const bad of [{world:0},{location:'0'},{location:'1001'},{location:'01'},{location:row.depth},{name:row.name+'偽'},{id:'wrong'},{kind:'wrong'},{mode:'review'}])assert.equal(resolveFormalMonster({...identity,...bad}),null,JSON.stringify(bad));
 }
 for(let u=0;u<200;u++){const group=rows.filter(r=>r.universeIndex===u);assert.equal(group.length,5);assert.equal(group.map(r=>r.stageName).join('|'),'外環|神庭|聖域|天座|主宰');}
 console.log('PASS 1000 exact depth/culture identities, 20 unique prototypes, 200 universes, five stages, malformed rejection; 695 old mappings/33 image bytes/gameplay owners unchanged');
})().catch(e=>{console.error(e);process.exitCode=1;});
