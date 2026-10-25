'use strict';
const fs=require('node:fs'),vm=require('node:vm'),cp=require('node:child_process'),assert=require('node:assert/strict');
(async()=>{
 const read=p=>JSON.parse(fs.readFileSync(p)),m=read('data/monsters/monster-mappings.json'),a=read('data/monsters/monster-assets.json'),plan=read('development/monster-art/batch17/metadata/boss_30_mapping.json');
 const baseline='f2d37f4c382248e3130f66d400246dc5e42e3639';
 const old=JSON.parse(cp.execFileSync('git',['show',baseline+':data/monsters/monster-mappings.json']));
 assert.deepEqual(m.records.slice(0,665),old.records,'all prior 665 identities unchanged');
 assert.deepEqual(a.assets.slice(0,21),JSON.parse(cp.execFileSync('git',['show',baseline+':data/monsters/monster-assets.json'])).assets);
 assert.equal(a.assets.length,39);assert.equal(m.records.length,1695);
 for(const file of ['calamityconfig.js','calamitycore.js','secondworldcalamity.js','secondworldcalamityrun.js','thirdworlddata.js','thirdworldcombat.js','thirdworldarena.js','combatcore.js','offlineprogress.js'])assert.equal(require('./postrelease-ui-copy-approval.cjs').historicalBytes(file,require('./issue106-approved-sources.cjs').historicalBytes(file,fs.readFileSync(file))).toString('utf8'),cp.execFileSync('git',['show','c0ec18d686d7111b2e5a7fa380c94653a2b8a2e4:'+file],{encoding:'utf8'}),file+' gameplay unchanged');
 const ctx=vm.createContext({console});ctx.window=ctx;
 vm.runInContext(fs.readFileSync('engine.js','utf8').split('\n').find(line=>line.startsWith('function round1(')),ctx);
 const data=fs.readFileSync('data.js','utf8'),start=data.indexOf('const WORLD_REGIONS=');vm.runInContext(data.slice(start,data.indexOf(';',start)+1),ctx);
 for(const file of ['calamityconfig.js','secondworlddata.js','secondworldcalamity.js','thirdworldphase.js','thirdworlddata.js','specialmonsters.js','thirdworldarena.js'])vm.runInContext(fs.readFileSync(file,'utf8'),ctx,{filename:file});
 const {resolveFormalMonster}=await import('../../3d-test/monster-formal-resolver.mjs');
 const bosses=m.records.filter(r=>r.status==='batch17-formal-enabled');assert.equal(bosses.length,30);let projections=0;
 for(const [i,row] of bosses.entries()){
  const world=['galaxy','universe','higher'].indexOf(row.world)+1,n=row.bossIndex;
  const source=world===1?ctx.window.CIVILIZATION_CALAMITY_CONFIG[n]:world===2?ctx.window.SECOND_WORLD_CALAMITY_DEFINITIONS[n]:ctx.window.thirdWorldBoss(n);
  assert.equal(row.name,source.calamityName||source.name);assert.equal(row.bossId,source.id);
  assert.equal(row.name,plan[i].boss_name);assert.equal(row.visual.visibleRatio,plan[i].suggested_visible_height_to_player);
  assert.equal(row.artCode,plan[i].art_code_or_existing_asset);
  const input={world,mode:row.mode,kind:row.kind,id:row.bossId,name:row.name,location:world===3?String(n):row.bossId};
  assert.equal(resolveFormalMonster(input)?.mapping.id,row.id);
  for(const invalid of [{id:'wrong'},{id:null},{name:row.name+'偽'},{world:0},{world:world===1?2:1},{kind:'wrong'},{location:'wrong'},{mode:'alternate'},{mode:'review'}])assert.equal(resolveFormalMonster({...input,...invalid}),null,JSON.stringify({row:row.id,invalid}));
  if(world===3)for(let stage=0;stage<3;stage++){
   const enemy=ctx.window.buildThirdWorldArenaEnemy(n,stage,{hp:10000,atk:1000,def:500},1100);
   assert.equal(enemy.higherDimensionalBossId,row.bossId);assert.equal(enemy.name,'高維投影·'+row.name);
   const projection={world:3,mode:'arena',kind:enemy.kind,name:enemy.name,id:enemy.higherDimensionalBossId,location:String(stage)};
   assert.equal(resolveFormalMonster(projection)?.mapping.id,row.id);assert.equal(resolveFormalMonster({...projection,location:'3'}),null);projections++;
  }
 }
 assert.equal(projections,30);assert.notEqual(bosses[9].visual.palette,bosses[28].visual.palette);
 console.log('PASS 30 exact gameplay source identities, 30 projections, malformed rejection; 665 old mappings/21 sprites and gameplay owners unchanged');
})().catch(e=>{console.error(e);process.exitCode=1;});
