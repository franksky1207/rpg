#!/usr/bin/env node
'use strict';
// Batch 2-3: read-only inventory of the legacy preview's current runtime closure.
// This gate deliberately never removes assets or changes formal runtime behavior.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const exists=p=>fs.existsSync(path.join(root,p));
const gm=read('3d-test/test-center.js');
const battle=read('3d-test/gm-battle-simulation.js');
const published=read('3d-test/gm-battle-published.mjs');
const stage=read('scripts/stage-hybrid-preview.cjs');
const manifestPath='development/hybrid-comparison/t2b3-v1/manifest.json';
const manifest=JSON.parse(read(manifestPath));
assert.equal(manifest.schema,'cw.t2b3.assets');
assert.equal(manifest.publish,false);
assert.ok(gm.includes('"角色與動作"')&&gm.includes('"戰場與對戰"'),'GM visual categories must remain intact');
assert.ok(gm.includes('C-08-CHARACTER')&&gm.includes('C-15-BATTLE'),'Existing two visual entries must remain intact');
assert.ok(battle.includes("import(new URL('fixture-input.mjs"),'Sandbox B fixture is still dynamically imported');
assert.ok(battle.includes("import(new URL('t2b3-v1/renderer.mjs"),'Sandbox B renderer is still dynamically imported');
assert.ok(battle.includes("import('./gm-battle-published.mjs"),'Shipped fallback must remain available');
assert.ok(published.includes('civilization3d:sprite-auth'),'Published GM authorization must remain');
assert.ok(published.includes('gmPreviewAllowed===true'),'Published sprite allowlist must remain');
assert.ok(stage.includes('manifest.files')&&stage.includes('manifest.vendor'),'Stage still consumes historical full manifest');
const protectedRuntime=[
 '3d-test/gm-battle-simulation.js','3d-test/gm-battle-published.mjs',
 'development/hybrid-comparison/fixture-input.mjs',
 'development/hybrid-comparison/playback.mjs',
 'development/hybrid-comparison/t2b3-v1/renderer.mjs',
 'development/hybrid-comparison/t2b3-v1/manifest.json',
 'assets/gm-equipment-2_5d/v1/catalog.json'
];
for(const p of protectedRuntime)assert.ok(exists(p),'Cannot remove active runtime dependency: '+p);
const paths=Object.keys(manifest.files||{});
const vendor=Object.keys(manifest.vendor||{});
for(const p of [...paths,...vendor]){
 assert.ok(!path.isAbsolute(p)&&!p.split('/').includes('..'),'Unsafe path: '+p);
 assert.ok(exists(p),'Manifest asset missing: '+p);
 const entry=(manifest.files||{})[p]||(manifest.vendor||{})[p];
 assert.ok(Number.isSafeInteger(entry.bytes)&&entry.bytes>=0,'Invalid bytes: '+p);
 assert.match(entry.sha256,/^[a-f0-9]{64}$/,'Invalid digest: '+p);
}
const result={
 batch:'2-3',status:'active-dependencies-not-retired',
 protectedRuntime,legacyComparisonEntry:exists('development/hybrid-comparison/index.html'),
 fullManifestSelectedByStage:true,manifestFiles:paths.length,manifestVendor:vendor.length,
 notes:'Inventory only: file existence is not evidence that every manifest entry is required at runtime.'
};
console.log(JSON.stringify(result,null,2));
