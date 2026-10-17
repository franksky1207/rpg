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
const unexpected=changed.filter(p=>p!=="index.html"&&protectedRoots.some(re=>re.test(p)));
assert.deepEqual(unexpected,[],"Batch4-4 protected live runtime or assets changed unexpectedly");
if(changed.includes("index.html")){
 // Permit only independently approved Batch 2 and Batch 3 script cache tokens.
 // Normalize both back to the historical values, then require exact HTML equality;
 // do not disable or loosen the broader retired-asset guard.
 const original=run("show",base+":index.html");
 const current=fs.readFileSync("index.html","utf8").trim();
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
 assert.ok(original.includes(oldFormal)&&current.includes(newFormal),"Expected approved Batch 4 formal entry cache key");
 assert.equal(current.replace(newScript,oldScript).replace(newFx,oldFx).replace(newDungeon,oldDungeon).replace(newSheet,"").replace("&vbatch4=20261018-animation-center","").replace(newFormal,oldFormal),original,"Historical index HTML changed beyond approved Batch 2/3/4 cache and stylesheet keys");
}
const needs=["assets/3d/asset-registry.json","assets/gm-equipment-2_5d/v1/g005.webp","assets/gm-equipment-2_5d/v1/g007.webp","assets/gm-equipment-2_5d/v1/g018.webp","tests/runtime/cleanup-batch4-3-current-inventory.cjs"];
for(const p of needs)assert.ok(live.has(p),"Protected current dependency missing: "+p);
const check=JSON.parse(fs.readFileSync("development/hybrid-comparison/t2b3-v1/manifest.json","utf8"));
assert.equal(Object.keys(check.files).length,174,"Current B-only manifest unexpectedly changed");
const result={baseline:base,head:run("rev-parse","HEAD"),changedFiles:changed.length,prohibitedTracked:0,protectedFilesChecked:needs.length,manifestEntries:174,formalRuntimeChanges:0};
console.log("PASS cleanup batch 4-4 current-only and unmodified formal runtime",JSON.stringify(result));
