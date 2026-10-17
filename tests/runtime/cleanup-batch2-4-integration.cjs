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
  const original=historic(base,p).toString(),current=actual(p).toString();
  const oldToken="backgroundprogress.js?v=20261013-background-hud-recovery1";
  const newToken="backgroundprogress.js?v=20261017-batch2-lifecycle-sleeper1";
  assert.ok(original.includes(oldToken)&&current.includes(newToken),"Expected approved backgroundprogress cache version");
  const oldFx="combatfx.js?v=20261015-thrust1";
  const newFx="combatfx.js?v=20261017-batch3-fx-lifecycle1";
  assert.ok(original.includes(oldFx)&&current.includes(newFx),"Expected approved Batch 3 combatfx cache version");
  assert.equal(current.replace(newToken,oldToken).replace(newFx,oldFx),original,"Unexpected formal HTML change beyond approved Batch 2/3 cache tokens");
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
