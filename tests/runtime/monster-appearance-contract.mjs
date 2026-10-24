import assert from 'node:assert/strict';
import fs from 'node:fs';
import cp from 'node:child_process';
import {mappings} from '../../3d-test/monster-sprites.mjs';
import {resolveMonsterAppearance,appearanceFingerprint} from '../../3d-test/monster-appearance.mjs';
import {resolveFormalMonster} from '../../3d-test/monster-formal-resolver.mjs';
const rows=Object.values(mappings),keys=new Map();
for(const r of rows){
 const s=resolveMonsterAppearance(r);assert.deepEqual(s,resolveMonsterAppearance(r));assert.ok(Object.isFrozen(s)&&Object.isFrozen(s.colors));
 const k=appearanceFingerprint(s),group=keys.get(k)||[];group.push(r);keys.set(k,group);
 if(r.world==='higher'){assert.deepEqual(resolveMonsterAppearance('projection-'+r.id),s);assert.equal(resolveFormalMonster({world:3,mode:'arena',kind:'dungeon-arena-third-world',id:r.id,location:'0',name:'高維投影·'+r.name})?.mapping.id,r.id);}
 if(r.mode==='alternate')assert.equal(s.rank,7);
 if(r.mode==='calamity')assert.equal(s.rank,r.world==='galaxy'?4:5);
}
assert.equal(keys.size,895);for(const group of keys.values())if(group.length>1){assert.equal(group.length,5);assert.ok(group.every(r=>r.mode==='alternate'&&r.universeNumber===group[0].universeNumber));}
const alternateEffectSequences=[];
for(const asset of new Set(rows.filter(r=>r.mode==='alternate').map(r=>r.assetId))){
 const versions=rows.filter(r=>r.assetId===asset&&r.mode==='alternate'&&r.stageIndex===0).map(resolveMonsterAppearance);
 alternateEffectSequences.push(JSON.stringify(versions.map(s=>[s.texture,s.field,s.culture])));assert.equal(versions.length,10);assert.equal(new Set(versions.map(s=>JSON.stringify(s.colors))).size,10);assert.equal(new Set(versions.map(s=>JSON.stringify([s.texture,s.field,s.culture]))).size,10);
}
assert.equal(new Set(alternateEffectSequences).size,20,'twenty prototypes do not copy one ten-effect sequence');
assert.notEqual(appearanceFingerprint('special-gold_slime'),appearanceFingerprint('special-lucky_rabbit'));
const baseline='b0241d67c9073c2dbf48f972b5e414cadf111d1c';
for(const p of ['data/monsters/monster-assets.json','data/monsters/monster-mappings.json','data/monsters/monster-variants.json','monstercodexdata.js','combatcore.js','thirdworldarena.js','dungeonbounty.js','dungeonarena.js','dungeonvoid.js','mirrorcombatcore.js','mirrordungeonstate.js','alternateuniversedata.js','alternateuniversecombat.js','reincarnationcore.js','savemigration.js','resource-cache-sw.js','3d-test/monster-sprite-pool.mjs','3d-test/era-player-sprites.mjs'])assert.deepEqual(fs.readFileSync(p),cp.execFileSync('git',['show',baseline+':'+p],{maxBuffer:16*1024*1024}),p+' protected');
const actor=fs.readFileSync('3d-test/monster-actor.mjs','utf8'),codex=fs.readFileSync('monstercodeximage.mjs','utf8');for(const s of [actor,codex]){assert.ok(s.includes('resolveMonsterAppearance('));assert.ok(s.includes('paintMonsterAppearance('));}
console.log('PASS formal-owned immutable appearance; 895 designs / 1695 mappings; ten AU designs per prototype; projection inheritance; exact gameplay, sizing inputs, source assets, pool and player owners');
