"use strict";
const fs=require("node:fs");
const cp=require("node:child_process");
const assert=require("node:assert/strict");
const crypto=require("node:crypto");
const base="5bfb00a44fd18263e3fe79581255871024f4396c";
const decoupled="27ed18bbcb0f1e8d0af5420ecf132fb9fa0e5873";
const sha=b=>crypto.createHash("sha256").update(b).digest("hex");
const historic=(ref,p)=>cp.execFileSync("git",["show",ref+":"+p]);
const actual=p=>fs.readFileSync(p);
const formalProtected=[
 "index.html","data.js","balance.js","combatcore.js","combatmath.js",
 "combat-events.js","engine.js","ui.js","audio/audio-core.js",
 "newstate.js","resource-cache-client.js","sw.js"
];
for(const p of formalProtected){
 if(!fs.existsSync(p))continue;
 if(p==="index.html"){
  const original=historic(base,p).toString(),actualHtml=actual(p).toString();
  // Only exact Batch7 cache fingerprints are normalized for this historical guard.
  assert.ok(actualHtml.includes("&vbatch7=20261018-era-settings-r2")&&actualHtml.includes("era-appearance-contract.js?v=20261018-batch7-v3"),"Missing authorized Batch7 cache fingerprints");
  const current=actualHtml.replaceAll("&vbatch7sprite=20261018-lightweight1", "").replace("&vbatch7=20261018-era-settings-r2","").replace("era-appearance-contract.js?v=20261018-batch7-v3","era-appearance-contract.js?v=20261018-batch5-contract1");
  const oldToken="backgroundprogress.js?v=20261013-background-hud-recovery1";
  const newToken="backgroundprogress.js?v=20261017-batch2-lifecycle-sleeper1";
  assert.ok(original.includes(oldToken)&&current.includes(newToken),"Expected approved backgroundprogress cache version");
  const oldFx="combatfx.js?v=20261015-thrust1";
  const newFx="combatfx.js?v=20261017-batch3-fx-lifecycle1";
  assert.ok(original.includes(oldFx)&&current.includes(newFx),"Expected approved Batch 3 combatfx cache version");
  const oldDungeon="dungeonui.js?v=20260923-universe-exp-fix1";
  const newDungeon="dungeonui.js?v=20261018-batch4-mobile-stage-anchor1";
  const newSheet='<link rel="stylesheet" href="battle-mobile-viewport.css?v=20261018-batch4-mobile1">';
  assert.ok(original.includes(oldDungeon)&&current.includes(newDungeon)&&current.includes(newSheet),"Expected approved Batch 4 cache token and mobile stylesheet");
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
 assert.equal(current.replace(gmNew,gmOld).replace(batch5Formal,newFormal).replace(modeBatch5,modeBase).replace(contractScript,"").replace(newToken,oldToken).replace(newFx,oldFx).replace(newDungeon,oldDungeon).replace(newSheet,"").replace("&vbatch4=20261018-animation-center","").replace(newFormal,oldFormal),original,"Unexpected formal HTML change beyond approved Batch 2/3/4 cache and stylesheet entries");
  continue;
 }
 assert.equal(sha(actual(p)),sha(historic(base,p)),"Formal runtime unexpectedly modified: "+p);
}
const batch21=[
 "scripts/formal-equipment-identities.py",
 "scripts/equipment-sprites.py",
 "scripts/equipment-gm-publication.py",
 "development/equipment-2_5d/v1/registry.json",
 "development/equipment-2_5d/weapons-v1/registry.json",
 "tests/equipment-weapons/names.cjs"
];
for(const p of batch21)assert.equal(sha(actual(p)),sha(historic(decoupled,p)),"Batch 2-1 decoupling lost: "+p);
const html=actual("3d-test/index.html").toString();
const js=actual("3d-test/test-center.js").toString();
assert.ok(!/id="(?:fixtureWorld|scenarioFormal|alternateUniverse|appearanceWorld|dungeonArenaRank)"/.test(html),"Retired GM controls still in markup");
assert.ok(!/scenarioKinds|calamitySimulation|function sceneCalamityStates/.test(js),"Retired GM scenario controller retained");
assert.ok(js.includes("C-08-CHARACTER")&&js.includes("C-15-BATTLE"),"Both GM 2.5D cases required");
const ownership=require("../../scripts/publish-assets.cjs").inspect(process.cwd());
assert.equal(ownership.missing.length,0,"Unresolved published paths");
assert.equal(ownership.backgrounds.length,32,"Existing battle backgrounds changed");
assert.equal(ownership.audio.music.length,6,"Existing music selection changed");
assert.equal(ownership.audio.sfx.length,11,"Existing SFX selection changed");
for(const p of ["3d-test/atlas-review.js","development/hybrid-comparison/index.html"])
 assert.ok(!ownership.keep.includes(p),"Retired source unexpectedly shipped: "+p);
const gm=JSON.parse(actual("development/equipment-2_5d/gm-publication.json"));
assert.deepEqual(gm.ids,["g005","g007","g018"]);
for(const p of Object.keys(gm.files))assert.ok(ownership.keep.includes(p),"Approved GM runtime missing from release: "+p);
console.log("PASS batch 2-4 integration: formal owner unchanged; Batch 2-1 source preserved; GM/2.5D/audio/publish boundaries match");
