'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),cp=require('node:child_process');
(async()=>{
 const read=p=>JSON.parse(fs.readFileSync(p));const rows=read('data/monsters/monster-mappings.json').records.filter(r=>r.mode),assets=read('data/monsters/monster-assets.json').assets;
 const {resolveFormalMonster,resolveFormalMirror}=await import('../../3d-test/monster-formal-resolver.mjs');
 // Read exact declarations from actual gameplay owners without running gameplay.
 function constants(file,names){const source=fs.readFileSync(file,'utf8'),ctx=vm.createContext({Object});for(const name of names){const start=source.indexOf(' const '+name+'=');assert.ok(start>=0);const end=source.indexOf(';',start);vm.runInContext(source.slice(start,end+1).replace(' const ','var '),ctx);}return ctx;}
 const bounty=constants('dungeonbounty.js',['BOUNTY_NAMES','UNIVERSE_BOUNTY_NAMES']),arena=constants('dungeonarena.js',['ARENA_ENEMY_NAMES_BY_WORLD']),voids=constants('dungeonvoid.js',['VOID_MIRAGE_REGULAR_NAMES','VOID_MIRAGE_BOSS_NAMES']);
 const reviewed={
  '暗物質武裝艇':'ship-01','萬域私戰艦':'ship-04','跨域劫掠主機':'core-01',
  '深空封鎖母艦':'ship-04','跨域掠奪母艦':'ship-04','戰爭失控核心':'core-01'
 };
 for(const [name,id] of Object.entries(reviewed))assert.equal(rows.find(r=>r.name===name)?.assetId,id,'reviewed silhouette: '+name);
 assert.notEqual(rows.find(r=>r.name==='幻域支配者').visual.palette,rows.find(r=>r.name==='虛境帝皇').visual.palette,'shared ruler silhouettes have distinct palettes');
 assert.equal(rows.length,56);assert.equal(new Set(rows.map(r=>r.id)).size,56);
 for(const [world,key] of [['galaxy','BOUNTY_NAMES'],['universe','UNIVERSE_BOUNTY_NAMES']])assert.deepEqual(rows.filter(r=>r.world===world&&r.mode==='bounty').map(r=>r.name),Array.from(Object.values(bounty[key]).flat()));
 for(const [world,w] of [['galaxy',1],['universe',2]])assert.deepEqual(rows.filter(r=>r.world===world&&r.mode==='arena').map(r=>r.name),Array.from(arena.ARENA_ENEMY_NAMES_BY_WORLD[w]));
 assert.deepEqual(rows.filter(r=>r.mode==='void').map(r=>r.name),[...voids.VOID_MIRAGE_REGULAR_NAMES,...voids.VOID_MIRAGE_BOSS_NAMES]);
 for(const row of rows){
  const input={mode:row.mode,world:row.world==='universe'?2:1,name:row.name,kind:row.kind,location:row.mode==='arena'?String(row.arenaStage):row.mode==='void'?String(row.isBossFloor?(row.bossCycle+1)*10:1):null};
  assert.equal(resolveFormalMonster(input)?.mapping.id,row.id);
  for(const mode of ['calamity','alternate','special','thirdworld-arena','mirror'])assert.equal(resolveFormalMonster({...input,mode}),null);
  assert.equal(resolveFormalMonster({...input,world:3}),null);assert.equal(resolveFormalMonster({...input,name:row.name+'偽'}),null);assert.equal(resolveFormalMonster({...input,kind:'boss'}),null);
  const silhouette=assets.find(a=>a.assetId===row.assetId);
  if(/(?:艦|艇)$/.test(row.name))assert.ok(silhouette.path.includes('/starship/'),'ship-name must use a ship silhouette: '+row.name);
  if(/(?:核心|主機)$/.test(row.name))assert.ok(silhouette.path.includes('/core/'),'core-name must use a core silhouette: '+row.name);
  assert.equal(row.visual.sizePolicy,'dungeon');assert.ok(row.visual.visibleRatio>=1&&row.visual.visibleRatio<=1.5);
 }
 assert.deepEqual(rows.filter(r=>r.assetId==='void-phantom-v01').map(r=>r.name),['幻境遊魂','異相戰影','迷界殘像','空間殘響']);
 for(const world of [1,2])assert.ok(resolveFormalMirror({mode:'mirror',world,name:'鏡像・測試者',playerName:'測試者'},{formalBattleAllowed:true}));
 assert.equal(resolveFormalMirror({mode:'mirror',world:3,name:'鏡像・測試者',playerName:'測試者'},{formalBattleAllowed:true}),null);
 // All numeric/gameplay owners and 609 original mappings/images are unchanged.
 const before=JSON.parse(cp.execFileSync('git',['show','cff02989:data/monsters/monster-mappings.json'],{encoding:'utf8'}));
 assert.deepEqual(read('data/monsters/monster-mappings.json').records.filter(r=>!r.mode),before.records);
 for(const file of ['dungeonbounty.js','dungeonarena.js','dungeonvoid.js','mirrordungeonrun.js','combatcore.js','dungeoncore.js','mirrorcombatcore.js','offline.js']){
  if(!fs.existsSync(file))continue;
  assert.equal(fs.readFileSync(file,'utf8'),cp.execFileSync('git',['show','cff02989:'+file],{encoding:'utf8'}),file);
 }
 const old=JSON.parse(cp.execFileSync('git',['show','cff02989:data/monsters/monster-assets.json'],{encoding:'utf8'}));assert.deepEqual(assets.slice(0,20),old.assets);
 console.log('PASS 56 exact owner identities; whitelist exclusions; four V01 uses; 609 original mappings/20 assets and gameplay owners unchanged');
})().catch(e=>{console.error(e);process.exitCode=1;});
