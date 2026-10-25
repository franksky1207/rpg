'use strict';
const fs=require('node:fs'),cp=require('node:child_process'),assert=require('node:assert/strict');
const baseline='9748c72cd17b2c3dd0e8aaf749a4fcd821a1f23a';
const owners=['combatcore.js','combatmath.js','combat-events.js','combatpacing.js','combatspeed.js','offlineprogress.js','offlinestatecore.js','alternateuniversecombat.js','alternateuniverseattempt.js','alternateuniverseui.js','thirdworldcombat.js','thirdworldrun.js','dungeonarena.js','dungeonbounty.js','dungeonvoid.js','settlementtransaction.js','engine.js','savemigration.js','supabaseauth.js','cloudsave.js','3d-test/t3b-formal-owner-clock.js','3d-test/t3b-formal-controller.js','3d-test/t3b-formal-entry.js','audio/audio-core.js','audio/audio-scenes.js'];
for(const p of owners){assert.deepEqual(require('./postrelease-ui-copy-approval.cjs').historicalBytes(p,fs.readFileSync(p)),cp.execFileSync('git',['show','c0ec18d686d7111b2e5a7fa380c94653a2b8a2e4:'+p]),'protected formal owner changed: '+p);}
// battlepipeline.js (PR #53) and backgroundprogress.js (PR #52) intentionally changed; each has dedicated runtime regressions.
assert.match(fs.readFileSync('battlepipeline.js','utf8'),/if\(battleBusy\|\|window\.activeMainBattleContext\|\|window\.activeSecondWorldMainlineContext\)return;/,'old mainline settlement must not overwrite live combat');
assert.match(fs.readFileSync('backgroundprogress.js','utf8'),/runtime-status-invalid/,'malformed runtime conflict remains fail-closed');
const html=fs.readFileSync('3d-test/index.html','utf8'),center=fs.readFileSync('3d-test/test-center.js','utf8');
assert.doesNotMatch(html,/id="(?:categoryList|caseList|caseSearch)"/);
assert.doesNotMatch(center,/角色與動作|戰場與對戰|renderCategories|renderCases/);
assert.match(center,/selectCase\(id\)/,'historical automated diagnostics retained');
for(const p of ['3d-test/equipment-sprites-v1/actor.mjs','development/equipment-2_5d/v1/actor.mjs'])assert.doesNotMatch(fs.readFileSync(p,'utf8'),/if\(slash\)|c\.stroke\(/,'attack halo rendering must remain removed');
const trial=JSON.parse(fs.readFileSync('development/combat-animation/batch12/thrust-feasibility.json'));
assert.equal(trial.productionThrustAccepted,false,'missing art must not be declared accepted');
const release=JSON.parse(fs.readFileSync('assets/era-player/v1/manifest.json'));
assert.equal(release.attackRevision,'20261019-batch12-rising-cut1');
for(const entry of release.entries){assert.equal(entry.weaponAnimation.template,'short-rising-cut');assert.equal(entry.weaponAnimation.weaponAnimationStatus,'complete');assert.ok(entry.weaponAnimation.body.bytes<50000);assert.equal(entry.weaponAnimation.sourceSha256.length,2);}
assert.match(fs.readFileSync('3d-test/gm-era-sprites.mjs','utf8'),/攻擊（短距離上挑斬）/);
assert.doesNotMatch(fs.readFileSync('3d-test/gm-era-sprites.mjs','utf8'),/突刺待補|獨立武器突刺/);
console.log('PASS Batch12 presentation safety: '+owners.length+' unchanged formal owners; no categories or attack aura; source-derived rising cut explicit');
