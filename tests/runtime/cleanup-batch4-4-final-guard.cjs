"use strict";
const fs=require("node:fs"),cp=require("node:child_process"),assert=require("node:assert/strict"),crypto=require("node:crypto");
const base="b84094b6f6b89b5f1b63df10be2e7e9a3a30f576";
const run=(...args)=>cp.execFileSync("git",args,{encoding:"utf8",maxBuffer:20*1024*1024}).trim();
const tree=run("ls-tree","-r","--name-only","HEAD").split("\n"),live=new Set(tree);
const prohibited=[
 /\.blend$/,/source-version\.cjs$/,/source-lock\.json$/,/source-evolution\.json$/,
 /^development\/retired-formal-previews\//,
 /^development\/3d-source\/equipment\/concepts\//,
 /^docs\/(?:3D_EQUIPMENT_CONCEPT|3D_EQUIPMENT_210_SET_MASTER_INDEX|BATCH28_G0)/,
 /^docs\/(?:3D_BATCH27_|3D_BATCH28[ABC]_|3D_HYBRID_T[12])/,
];
for(const re of prohibited)assert.deepEqual(tree.filter(p=>re.test(p)),[],"Retired visual scheme returned: "+re);
const text=fs.readFileSync("docs/2_5D_BATCH28_40_REBASE_MASTER_PLAN_2026-10-16.md","utf8");
assert.match(text,/不製作210套角色/);
assert.doesNotMatch(text,/G20＝G096|210套兩張概念圖全量產/);
const changed=run("diff","--name-only",base,"HEAD").split("\n").filter(Boolean);
const protectedRoots=[/^(?:data|combatcore|combat-events|savemigration|offlineprogress|ui|engine|balance|audio|gm3dprototype)\.js$/,/^index\.html$/,/^assets\/gm-equipment-2_5d\//,/^assets\/3d\//,/^3d-test\//,/^development\/equipment-2_5d\//];
// Batch 4 explicitly authorizes only these GM presentation entrypoints.
const approvedBatch4Gm=new Set(["3d-test/index.html","3d-test/test-center.js","3d-test/t3b-formal-entry.js","3d-test/mode-foundation.js","3d-test/era-appearance-contract.js","3d-test/gm-battle-simulation.js","3d-test/gm-battle-published.mjs","3d-test/gm-whole-suit.mjs","3d-test/gm-era-sprites.mjs","3d-test/era-player-sprites.mjs","3d-test/t3b-formal-renderer.js","3d-test/equipment-sprites-v1/assets.mjs","3d-test/equipment-sprites-v1/actor.mjs","3d-test/equipment-sprites-v1/animation.mjs","development/equipment-2_5d/v1/actor.mjs","development/equipment-2_5d/v1/animation.mjs","development/equipment-2_5d/v1/assets.mjs","development/equipment-2_5d/gm-publication.json"]);
// Batch8/9 authorize the presentation stylesheet only; gameplay and retired assets remain protected.
const approvedBatch8=new Set(["3d-test/formal-player-sprites.css"]);
// Batch12 permits exactly the single-interface layout rule; no other CSS change.
const batch12Css="3d-test/test-center.css";
assert.equal(fs.readFileSync(batch12Css,"utf8"),run("show","9748c72cd17b2c3dd0e8aaf749a4fcd821a1f23a:"+batch12Css)+"\n\n/* Batch12: one direct preview, no category/catalog navigation. */\n.center-layout{display:block}\n","Unexpected GM stylesheet change beyond Batch12 single-interface rule");
const unexpected=changed.filter(p=>p!==batch12Css&&!approvedBatch8.has(p)&&p!=="index.html"&&p!=="gm3dprototype.js"&&!approvedBatch4Gm.has(p)&&protectedRoots.some(re=>re.test(p)));
for(const p of approvedBatch4Gm)if(changed.includes(p))assert.ok(live.has(p),"Approved GM presentation entrypoint disappeared: "+p);
assert.deepEqual(unexpected,[],"Batch4-4 protected live runtime or assets changed unexpectedly");
if(changed.includes("index.html")){
 // Compare against sealed presentation baseline and explicitly approved cache keys.
 // Batch11 extends only the audio owner and formal renderer script cache tokens.
 const sealed=run("show","32257058dd7003e284d9f548674617d8d2e9c263:index.html");
 const actual=fs.readFileSync("index.html","utf8");
 const expected=sealed
  .replace("gm3dprototype.js?v=20261018-gm-copy1","gm3dprototype.js?v=20261019-batch12-single1")
  .replace("3d-test/formal-player-sprites.css?v=20261015-phase5","3d-test/formal-player-sprites.css?v=20261019-batch8-shared1")
  .replace("3d-test/t3b-formal-renderer.js?v=20261015-thrust1&vbatch7sprite=20261018-lightweight1","3d-test/t3b-formal-renderer.js?v=20261019-batch8-shared1")
  .replace("3d-test/t3b-formal-entry.js?v=20261018-batch5-central-settings&vbatch7sprite=20261018-lightweight1","3d-test/t3b-formal-entry.js?v=20261019-batch8-shared1")
  .replace("dungeonui.js?v=20261018-batch4-mobile-stage-anchor1","dungeonui.js?v=20261019-batch8-stable-anchor1")
  .replace("battle-mobile-viewport.css?v=20261018-batch4-mobile1","battle-mobile-viewport.css?v=20261019-batch10-usability1")
  .replace("3d-test/formal-player-sprites.css?v=20261019-batch8-shared1","3d-test/formal-player-sprites.css?v=20261019-batch9-background1")
  .replace("audioRegression=20261011-b08-galaxy-entry&final=all-combat3&audioLifecycle=20261011-unified-v1","audioRegression=20261011-b08-galaxy-entry&final=all-combat3&audioLifecycle=20261019-batch11-lazy1")
  .replace("3d-test/t3b-formal-entry.js?v=20261019-batch8-shared1","3d-test/t3b-formal-entry.js?v=20261019-batch11-lifecycle1")
  .replace("settingsCopy=20261011-no-gm-v2&audioLifecycle=20261011-unified-v1&events=20261012-t1c-v1","settingsCopy=20261011-no-gm-v2&audioLifecycle=20261019-batch11-lazy1&events=20261012-t1c-v1")
  .replace("audio/audio-core.js?v=audio-20261011-volume-slider-fix&audioPersist=20261011-no-ui-click-prefs","audio/audio-core.js?v=audio-20261011-volume-slider-fix&audioPersist=20261019-batch11-lazy-sfx1")
  .replace("3d-test/t3b-formal-renderer.js?v=20261019-batch8-shared1","3d-test/t3b-formal-renderer.js?v=20261019-batch12-no-arc1");
 assert.equal(actual,expected,"Batch8/9 index differs from exactly approved cache-only changes");
}
const needs=["assets/3d/asset-registry.json","assets/gm-equipment-2_5d/v1/g005.webp","assets/gm-equipment-2_5d/v1/g007.webp","assets/gm-equipment-2_5d/v1/g018.webp","tests/runtime/cleanup-batch4-3-current-inventory.cjs"];
for(const p of needs)assert.ok(live.has(p),"Protected current dependency missing: "+p);
const check=JSON.parse(fs.readFileSync("development/hybrid-comparison/t2b3-v1/manifest.json","utf8"));
assert.equal(Object.keys(check.files).length,174,"Current B-only manifest unexpectedly changed");
const result={baseline:base,head:run("rev-parse","HEAD"),changedFiles:changed.length,prohibitedTracked:0,protectedFilesChecked:needs.length,manifestEntries:174,formalRuntimeChanges:0};
console.log("PASS cleanup batch 4-4 current-only and unmodified formal runtime",JSON.stringify(result));
