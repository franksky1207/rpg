import assert from 'node:assert/strict';
import fs from 'node:fs';
import cp from 'node:child_process';
import {createHash} from 'node:crypto';
import {artSamples} from '../../3d-test/monster-art-samples.mjs';
import {artSamplesV2,resolveArtSampleV2,FIRST_ROUND_SHA256,ROUND2_ROUTE} from '../../3d-test/monster-art-samples-v2.mjs';
import {mappings} from '../../3d-test/monster-sprites.mjs';
import {resolveMonsterAppearance,appearanceFingerprint} from '../../3d-test/monster-appearance.mjs';
const digest=b=>createHash('sha256').update(b).digest('hex');
const sealed=JSON.parse(fs.readFileSync('docs/monster-appearance-fingerprints-2026-10-24.json','utf8'));
for(const row of sealed.rows)assert.equal(appearanceFingerprint(resolveMonsterAppearance(row.id)),row.fingerprint,'default formal route changed: '+row.id);
const frozen=fs.readFileSync('3d-test/monster-art-samples.mjs');
assert.equal(digest(frozen),FIRST_ROUND_SHA256);assert.deepEqual(frozen,cp.execFileSync('git',['show','f674c144:3d-test/monster-art-samples.mjs']));
assert.deepEqual(artSamplesV2.map(s=>s.id),artSamples.map(s=>s.id));assert.equal(artSamplesV2.length,12);assert.equal(new Set(artSamplesV2.map(s=>s.assetId)).size,7);
assert.equal(artSamplesV2.filter(s=>s.retained).length,5);assert.equal(artSamplesV2.filter(s=>s.original).length,1);assert.equal(artSamplesV2.find(s=>s.original).id,'galaxy-map-003');
for(const s of artSamplesV2){assert.ok(Object.isFrozen(s));assert.ok(s.retained||Object.isFrozen(s.rules));assert.equal(resolveArtSampleV2(s.id),s);assert.equal(resolveMonsterAppearance(s.id,{route:ROUND2_ROUTE}),s);assert.equal(resolveMonsterAppearance(s.id,{route:'art-samples-12'}),artSamples.find(x=>x.id===s.id));
 const body=resolveMonsterAppearance(s.id,{route:ROUND2_ROUTE,bodyOnly:true});assert.equal(body.power,0);assert.equal(s.power,artSamples.find(x=>x.id===s.id).power);
 if(mappings[s.id].world==='higher')assert.deepEqual(resolveMonsterAppearance('projection-'+s.id,{route:ROUND2_ROUTE}),s);
}
for(const row of Object.values(mappings)){
 const sample=resolveArtSampleV2(row);
 if(!sample)assert.deepEqual(resolveMonsterAppearance(row,{route:ROUND2_ROUTE}),resolveMonsterAppearance(row));
 if(sample&&row.mode==='alternate')assert.equal(appearanceFingerprint(resolveMonsterAppearance(row,{route:ROUND2_ROUTE})),appearanceFingerprint(sample));
}
// No gameplay, assets, mappings, placement, pool or animation changes since latest main.
for(const file of ['data/monsters/monster-assets.json','data/monsters/monster-mappings.json','data/monsters/monster-variants.json','3d-test/monster-sprites.mjs','3d-test/monster-sprite-pool.mjs','combatcore.js','alternateuniversecombat.js','alternateuniversedata.js','thirdworldarena.js','mirrorcombatcore.js','reincarnationcore.js','savemigration.js','resource-cache-sw.js'])assert.deepEqual(fs.readFileSync(file),cp.execFileSync('git',['show','origin/main:'+file],{maxBuffer:16*1024*1024}));
console.log('PASS round2 frozen B SHA/source, exact 12 whitelist, 5 retained / 7 edited, immutable specs, AU/projection, unchanged protected main owners');
