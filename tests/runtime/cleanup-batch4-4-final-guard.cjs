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
const approvedBatch8=new Set(["3d-test/formal-player-sprites.css","3d-test/t3b-formal-controller.js"]); // PR50 exact content is SHA-locked in pr48-presentation-baseline.cjs
// Batch12 permits exactly the single-interface layout rule; no other CSS change.
const batch12Css="3d-test/test-center.css";
// User-approved Batch19-2 exact append. Preserve every byte of the old CSS baseline.
const batch19Ui="\n/* Batch19-2: one responsive preview with diagnostics outside the normal flow. */\n.shell{max-width:1100px;margin:auto;padding:12px}\n.shell>header{margin-bottom:8px}.shell>header h1{font-size:20px}\n.center-description{margin:0;padding:4px 12px}.center-description h2{font-size:16px;margin:4px 0}\n.center-description p:empty,.gm-suit p:empty{display:none}\nbody .stage:has(.gm-suit){height:auto;min-height:0;overflow:visible}\nbody #prototypeHost:has(.gm-suit){height:auto;overflow:visible}\nbody .gm-suit{padding:48px 12px 12px;max-height:none;overflow:visible}\nbody .gm-suit-selects{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}\nbody .gm-suit-selects label{min-width:0;display:grid;gap:4px;font-size:13px}\nbody .gm-suit-selects select{width:100%;min-width:0}\n.gm-suit [data-alternate]{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}\n.gm-suit [data-alternate] label{flex:1;min-width:0;display:grid}\n.gm-suit [data-alternate] select{min-width:0;width:100%}\n.gm-suit .gm-suit-preview{height:240px!important;margin:8px auto}\nbody .gm-suit-actions{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:6px;margin:8px 0}\nbody .gm-suit-actions button{padding:6px;min-width:0}\n.gm-monster-actions{display:flex;gap:8px;justify-content:center;margin:8px 0}\n.gm-suit details{margin-top:12px;border-top:1px solid #527a9166;padding-top:10px}\n.gm-suit summary{cursor:pointer;min-height:44px;display:list-item}\n.gm-suit pre{max-height:200px;overflow:auto;overflow-wrap:anywhere;white-space:pre-wrap}\nbody .center-maximized .stage:has(.gm-suit){height:100dvh;overflow:auto}\nbody .center-maximized #prototypeHost:has(.gm-suit){height:auto;overflow:visible}\n.shell>footer{margin-top:8px}.shell>footer>p{font-size:12px;margin:4px 0}\n@media(max-width:600px){\n .shell{padding:8px}body .gm-suit{padding-inline:8px}\n body .gm-suit-selects{grid-template-columns:repeat(2,minmax(0,1fr))}\n body .gm-suit-actions{grid-template-columns:repeat(3,minmax(0,1fr))}\n .shell>header small{display:none}\n}\n@media(max-height:500px) and (min-width:601px){\n .shell>header,.center-description,.shell>footer>p{display:none}\n body .gm-suit{padding-top:44px}\n .gm-suit .gm-suit-preview{height:240px!important}\n}\n\n.gm-suit[data-view=\"monster\"] canvas[data-suit]{visibility:hidden}\n\n.is-embedded .shell>header,.center-workspace:has(.gm-suit) .center-description{display:none}\n";
assert.equal(fs.readFileSync(batch12Css,"utf8").slice(-batch19Ui.length),batch19Ui,"Unexpected change to reviewed Batch19-2 UI extension");
assert.equal(fs.readFileSync(batch12Css,"utf8").slice(0,-batch19Ui.length),run("show","9748c72cd17b2c3dd0e8aaf749a4fcd821a1f23a:"+batch12Css)+"\n\n/* Batch12: one direct preview, no category/catalog navigation. */\n.center-layout{display:block}\n","Unexpected GM stylesheet change beyond Batch12 single-interface rule");
require("./pr48-presentation-baseline.cjs").original("ui.js");
// Batch14: preserve the exact original twenty-image GM evidence, but allow audited formal consumers.
const batch13Lock=JSON.parse(fs.readFileSync('development/monster-art/batch13-twenty/runtime-lock.json','utf8'));
const approvedBatch13=new Set(['3d-test/monster-actor.mjs','3d-test/monster-sprite-pool.mjs','3d-test/monster-sprites.mjs']);
assert.deepEqual(Object.keys(batch13Lock).sort(),[...approvedBatch13].sort());
for(const p of approvedBatch13)assert.ok(live.has(p),'Batch13 module missing: '+p);
const approvedBatch14=new Set([...approvedBatch13,'3d-test/monster-formal-resolver.mjs']);
const batch14Authorized=approvedBatch14;
assert.equal(JSON.parse(fs.readFileSync('data/monsters/monster-assets.json')).formalBattleEnabled,true,'Batch14 must explicitly authorize map-monster visuals');
assert.equal(JSON.parse(fs.readFileSync('data/monsters/monster-mappings.json')).formalBattleEnabled,true,'Batch14 identity registry must be approved');
// Batch17 permits only the exact source-ID projection, with every other byte locked.
require('./pr48-presentation-baseline.cjs').original('combat-events.js');
const history=JSON.parse(fs.readFileSync('3d-test/fixture-owner-history.json','utf8'));
const sealedHistory=JSON.parse(run('show','f2d37f4c382248e3130f66d400246dc5e42e3639:3d-test/fixture-owner-history.json'));
sealedHistory.sources['combat-events.js'].afterSHA256=crypto.createHash('sha256').update(fs.readFileSync('combat-events.js')).digest('hex');
assert.deepEqual(history,sealedHistory,'only live owner digest changes; historical fixture sources remain immutable');
const approvedBatch17=new Set(['combat-events.js','3d-test/fixture-owner-history.json']);
const unexpected=changed.filter(p=>!approvedBatch17.has(p)&&p!=="ui.js"&&p!==batch12Css&&!approvedBatch8.has(p)&&p!=="index.html"&&p!=="gm3dprototype.js"&&!approvedBatch4Gm.has(p)&&!approvedBatch13.has(p)&&!batch14Authorized.has(p)&&protectedRoots.some(re=>re.test(p)));
for(const p of approvedBatch4Gm)if(changed.includes(p))assert.ok(live.has(p),"Approved GM presentation entrypoint disappeared: "+p);
assert.deepEqual(unexpected,[],"Batch4-4 protected live runtime or assets changed unexpectedly");
if(changed.includes("index.html")){
 // Compare against sealed presentation baseline and explicitly approved cache keys.
 // Batch11 extends only the audio owner and formal renderer script cache tokens.
 const sealed=run("show","32257058dd7003e284d9f548674617d8d2e9c263:index.html");
 const actual=require("./pr48-presentation-baseline.cjs").original("index.html").toString();
 const expected=sealed
  .replace("gm3dprototype.js?v=20261018-gm-copy1","gm3dprototype.js?v=20261019-batch12-rising-cut1")
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
  .replace("3d-test/t3b-formal-renderer.js?v=20261019-batch8-shared1","3d-test/t3b-formal-renderer.js?v=20261019-batch12-rising-cut1")
  // Mobile combat presentation: only the approved shared viewport script and stylesheet cache token.
  .replace("battle-mobile-viewport.css?v=20261019-batch10-usability1","battle-mobile-viewport.css?v=20261019-batch10-usability1&v26=20261019-unified1")
  .replace("dungeonui.js?v=20261019-batch8-stable-anchor1","dungeonui.js?v=20261019-batch8-stable-anchor1&v26=20261019-unified1")
  .replace('<script src="3d-test/formal-snapshots.js','<script src="combat-viewport-coordinator.js?v=20261019-unified1"></script>\n<script src="3d-test/formal-snapshots.js')

 assert.equal(actual,expected,"Batch14 index differs from exactly approved cache-only changes");
}
const needs=["assets/3d/asset-registry.json","assets/gm-equipment-2_5d/v1/g005.webp","assets/gm-equipment-2_5d/v1/g007.webp","assets/gm-equipment-2_5d/v1/g018.webp","tests/runtime/cleanup-batch4-3-current-inventory.cjs"];
for(const p of needs)assert.ok(live.has(p),"Protected current dependency missing: "+p);
const check=JSON.parse(fs.readFileSync("development/hybrid-comparison/t2b3-v1/manifest.json","utf8"));
assert.equal(Object.keys(check.files).length,174,"Current B-only manifest unexpectedly changed");
const result={baseline:base,head:run("rev-parse","HEAD"),changedFiles:changed.length,prohibitedTracked:0,protectedFilesChecked:needs.length,manifestEntries:174,formalRuntimeChanges:0};
console.log("PASS cleanup batch 4-4 historical assets preserved; Batch14 scoped formal visuals",JSON.stringify(result));
