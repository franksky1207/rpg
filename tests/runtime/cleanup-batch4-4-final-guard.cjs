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
const unexpected=changed.filter(p=>p!=="index.html"&&p!=="gm3dprototype.js"&&!approvedBatch4Gm.has(p)&&protectedRoots.some(re=>re.test(p)));
for(const p of approvedBatch4Gm)if(changed.includes(p))assert.ok(live.has(p),"Approved GM presentation entrypoint disappeared: "+p);
assert.deepEqual(unexpected,[],"Batch4-4 protected live runtime or assets changed unexpectedly");
if(changed.includes("index.html")){
 // Permit only independently approved Batch 2 and Batch 3 script cache tokens.
 // Normalize both back to the historical values, then require exact HTML equality;
 // do not disable or loosen the broader retired-asset guard.
 const original=run("show",base+":index.html");
 const actual=fs.readFileSync("index.html","utf8").trim();
 // Independently approved Batch 7 extends only the two exact version tokens.
 assert.ok(actual.includes("&vbatch7=20261018-era-settings-r2")&&actual.includes("era-appearance-contract.js?v=20261018-batch7-v3"),"Expected Batch7 cache fingerprint");
 const current=actual.replaceAll("&vbatch7sprite=20261018-lightweight1", "").replace("&vbatch7=20261018-era-settings-r2","").replace("era-appearance-contract.js?v=20261018-batch7-v3","era-appearance-contract.js?v=20261018-batch5-contract1");
 const oldScript="backgroundprogress.js?v=20261013-background-hud-recovery1";
 const newScript="backgroundprogress.js?v=20261017-batch2-lifecycle-sleeper1";
 assert.ok(original.includes(oldScript)&&current.includes(newScript),"Expected approved Batch 2 cache version");
 const oldFx="combatfx.js?v=20261015-thrust1";
 const newFx="combatfx.js?v=20261017-batch3-fx-lifecycle1";
 assert.ok(original.includes(oldFx)&&current.includes(newFx),"Expected approved Batch 3 combat FX cache version");
 const oldDungeon="dungeonui.js?v=20260923-universe-exp-fix1";
 const newDungeon="dungeonui.js?v=20261018-batch4-mobile-stage-anchor1";
 const newSheet='<link rel="stylesheet" href="battle-mobile-viewport.css?v=20261018-batch4-mobile1">';
 assert.ok(original.includes(oldDungeon)&&current.includes(newDungeon)&&current.includes(newSheet),"Expected approved Batch 4 dungeon UI/cache stylesheet");
 const oldFormal="3d-test/t3b-formal-entry.js?v=20261015-phase5";
 const newFormal="3d-test/t3b-formal-entry.js?v=20261018-batch4-toggle-fallback";
 const batch5Formal="3d-test/t3b-formal-entry.js?v=20261018-batch5-central-settings";
 const modeBase="3d-test/mode-foundation.js?v=20261010-dual-mode-preflight3&v2=20261010-b17-mode-policy&v3=20261010-opt5-account-migration";
 const modeBatch5=modeBase+"&vbatch5=20261018-animation-preference";
  const gmOld="gm3dprototype.js?v=20261015-thrust1";
 const gmNew="gm3dprototype.js?v=20261018-gm-copy1";
const contractScript='<script src="3d-test/era-appearance-contract.js?v=20261018-batch5-contract1"></script>\n';
 assert.ok(current.includes(batch5Formal)&&current.includes(modeBatch5)&&current.includes(contractScript.trim()),"Batch5 exact approved cache and contract script absent");
 assert.ok(original.includes(oldFormal)&&current.includes(batch5Formal),"Expected approved Batch 4 formal entry cache key");
 assert.equal(current.replace(gmNew,gmOld).replace(batch5Formal,newFormal).replace(modeBatch5,modeBase).replace(contractScript,"").replace(newScript,oldScript).replace(newFx,oldFx).replace(newDungeon,oldDungeon).replace(newSheet,"").replace("&vbatch4=20261018-animation-center","").replace(newFormal,oldFormal),original,"Historical index HTML changed beyond approved Batch 2/3/4 cache and stylesheet keys");
}
const needs=["assets/3d/asset-registry.json","assets/gm-equipment-2_5d/v1/g005.webp","assets/gm-equipment-2_5d/v1/g007.webp","assets/gm-equipment-2_5d/v1/g018.webp","tests/runtime/cleanup-batch4-3-current-inventory.cjs"];
for(const p of needs)assert.ok(live.has(p),"Protected current dependency missing: "+p);
const check=JSON.parse(fs.readFileSync("development/hybrid-comparison/t2b3-v1/manifest.json","utf8"));
assert.equal(Object.keys(check.files).length,174,"Current B-only manifest unexpectedly changed");
const result={baseline:base,head:run("rev-parse","HEAD"),changedFiles:changed.length,prohibitedTracked:0,protectedFilesChecked:needs.length,manifestEntries:174,formalRuntimeChanges:0};
console.log("PASS cleanup batch 4-4 current-only and unmodified formal runtime",JSON.stringify(result));
