import issue106Approval from './issue106-approved-sources.cjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import cp from 'node:child_process';
import vm from 'node:vm';
import {mappings,palettes} from '../../3d-test/monster-sprites.mjs';
import {resolveFormalMonster} from '../../3d-test/monster-formal-resolver.mjs';
const base='3470f9fb273d8646ac5741fe56a95ac47c15fb4d';
const old=JSON.parse(cp.execFileSync('git',['show',base+':data/monsters/monster-mappings.json'],{maxBuffer:16*1024*1024}));
const variants=JSON.parse(fs.readFileSync('data/monsters/monster-variants.json'));
const ctx={window:{}};vm.runInNewContext(fs.readFileSync('alternateuniversedata.js','utf8'),ctx);
const counts=new Map(),seen=new Map();
for(const row of Object.values(mappings)){
 const previous=old.records.find(r=>r.id===row.id);
 if(row.mode!=='alternate'){assert.deepEqual(row,previous);continue;}
 const info=ctx.window.alternateUniverseDepthInfo(row.depth);
 assert.equal(row.universeNumber,info.universeNumber);assert.equal(row.culture,info.culture);
 if(!seen.has(row.universeNumber)){
  const tier=(counts.get(row.assetId)||0)+1;counts.set(row.assetId,tier);seen.set(row.universeNumber,{asset:row.assetId,tier});
 }
 const {asset,tier}=seen.get(row.universeNumber);
 assert.equal(row.assetId,asset);assert.equal(row.visual.appearanceTier,tier);
 assert.equal(row.visual.palette,variants.alternatePrototypes[asset].palettes[tier-1]);
 assert.notEqual(palettes[row.visual.palette],'none');assert.equal(row.visual.visibleRatio,1.75);
 const protectedRow=structuredClone(row);protectedRow.visual.palette=previous.visual.palette;delete protectedRow.visual.appearanceTier;delete protectedRow.visual.appearanceVersion;assert.deepEqual(protectedRow,previous);
 assert.equal(resolveFormalMonster({world:3,mode:'alternate',location:String(row.depth)})?.mapping.id,row.id);
}
assert.equal(seen.size,200);assert.equal(counts.size,20);assert.deepEqual([...new Set(counts.values())],[10]);
assert.equal(new Set(Object.values(variants.alternatePrototypes).flatMap(p=>p.palettes.map(k=>palettes[k]))).size,200);
for(const f of ['data/monsters/monster-assets.json','alternateuniversedata.js','alternateuniversecombat.js','alternateuniverseprogression.js','combatcore.js','reincarnationcore.js'])assert.equal(issue106Approval.historicalBytes(f,fs.readFileSync(f)).toString('utf8'),cp.execFileSync('git',['show',base+':'+f],{encoding:'utf8',maxBuffer:16*1024*1024}));
console.log('PASS 1000 identities / 200 universes / 20 prototypes × 10 deterministic unique palettes; five stages agree; ratio 1.75; other modes, image bytes and gameplay owners unchanged');
