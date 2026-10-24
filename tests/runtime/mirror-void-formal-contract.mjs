import assert from 'node:assert/strict';
import fs from 'node:fs';
import cp from 'node:child_process';
import {pathToFileURL} from 'node:url';
import {resolveFormalMonster,resolveFormalMirror} from '../../3d-test/monster-formal-resolver.mjs';
import {mappings} from '../../3d-test/monster-sprites.mjs';
const base='042b21cc720bacda8f0ca19081ebd175d1407a45';
const source=cp.execFileSync('git',['show',base+':3d-test/monster-formal-resolver.mjs'],{encoding:'utf8'}).replace("'./monster-sprites.mjs?v=20261024-au-ten-stages1'",JSON.stringify(pathToFileURL(process.cwd()+'/3d-test/monster-sprites.mjs').href));
const prior=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
let checked=0,voids=0;
for(const row of Object.values(mappings)){
 const worlds=row.world==='both'?[1,2,3]:[{galaxy:1,universe:2,higher:3}[row.world]].filter(Boolean);
 for(const world of worlds){
  let input={world,mode:row.mode||'main',name:row.name,kind:row.kind};
  if(row.mode==='alternate')input={...input,location:String(row.depth),id:row.id};
  else if(row.mode==='void')input.location=String(row.isBossFloor?(row.bossCycle+1)*10:38168);
  else if(row.mode==='arena')input.location=String(row.arenaStage);
  else if(row.mode==='calamity')input={...input,location:row.bossId,id:row.bossId};
  else if(row.specialId)input={...input,mode:'special',location:row.specialId};
  else if(world===1&&row.mapIndex!=null)input.location=(10*(row.region-1)+row.mapIndex-1)+':'+(row.slot-1);
  else if(world===2)input={...input,id:row.id,location:String(Number(row.id.slice(-3))-1)};
  else if(world===3)input={...input,id:row.id,location:String(row.bossIndex)};
  const before=prior.resolveFormalMonster(input),after=resolveFormalMonster(input);
  if(row.mode==='void'&&world===3){assert.equal(before,null);assert.equal(after?.mapping.id,row.id);voids++;}
  else assert.deepEqual(after,before,'unchanged other mode identity '+JSON.stringify(input));
  if(after){checked++;assert.equal(resolveFormalMonster({...input,name:input.name+'偽'}),null);assert.equal(resolveFormalMonster({...input,world:0}),null);}
 }
}
assert.ok(checked>1600);assert.equal(voids,20);
for(const world of [1,2,3])for(const appearance of ['galaxy','universe','higher']){
 const input={mode:'mirror',world,name:'鏡像・測試者',playerName:'測試者'},entry={id:'era-'+appearance,formalBattleAllowed:true};
 assert.ok(resolveFormalMirror(input,entry));if(world!==3)assert.deepEqual(resolveFormalMirror(input,entry),prior.resolveFormalMirror(input,entry));
 for(const bad of [{world:0},{mode:'main'},{name:'鏡像・他人'},{playerName:null}])assert.equal(resolveFormalMirror({...input,...bad},entry),null);
 assert.equal(resolveFormalMirror(input,{...entry,formalBattleAllowed:false}),null);
}
for(const floor of ['0','01','1.5','NaN','9007199254740992'])assert.equal(resolveFormalMonster({mode:'void',world:3,name:'虛空獵兵',kind:'dungeon-void-mirage',location:floor}),null);
// Exact frozen owners: all #92 work, images, identity catalogues, damage, reward,
// save/schema/reincarnation, and foreground/background lifecycle stay on main.
for(const p of ['calamityui.js','secondworldcalamityui.js','3d-test/gm-era-sprites.mjs','3d-test/test-center.js','3d-test/index.html','3d-test/monster-actor.mjs','3d-test/monster-sprite-pool.mjs','data/monsters/monster-assets.json','data/monsters/monster-mappings.json','monstercodexdata.js','combatcore.js','mirrorcombatcore.js','mirrordungeonstate.js','dungeonvoid.js','dungeoncore.js','combatlifecycle.js','combat-events.js','reincarnationcore.js','savemigration.js','offlineprogress.js','alternateuniversecombat.js'])assert.deepEqual(fs.readFileSync(p),cp.execFileSync('git',['show',base+':'+p],{maxBuffer:8*1024*1024}),p+' protected');
console.log('PASS',checked,'existing identity resolutions and strict rejection; 20 shared Void W3 identities; 9 world/appearance mirrors; #92 and formal owners exact');

// Independent PR #93 may merge before or after this repair. Its one approved
// presentation class must compose without relaxing any codex content assertion.
const codexBefore=cp.execFileSync('git',['show',base+':monstercodex.js'],{encoding:'utf8'}),codexNow=fs.readFileSync('monstercodex.js','utf8');
const codexNavigationBlob=cp.execFileSync('git',['hash-object','monstercodex.js'],{encoding:'utf8'}).trim();
assert.ok([codexBefore,codexBefore.replace('<section class="function-page"><div class="back-home">','<section class="function-page story-record-page"><div class="back-home">')].includes(codexNow)||codexNavigationBlob==='e4b4af60d81e8d5ea34f765b9a9f3a7146c61731','codex exact #92/#93 or pinned #95 navigation source');
