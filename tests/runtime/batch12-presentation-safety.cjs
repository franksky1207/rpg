'use strict';
const fs=require('node:fs'),cp=require('node:child_process'),assert=require('node:assert/strict');
const baseline='9748c72cd17b2c3dd0e8aaf749a4fcd821a1f23a';
const owners=['combatcore.js','combatmath.js','combat-events.js','combatpacing.js','combatspeed.js','battlepipeline.js','backgroundprogress.js','offlineprogress.js','offlinestatecore.js','alternateuniversecombat.js','alternateuniverseattempt.js','alternateuniverseui.js','thirdworldcombat.js','thirdworldrun.js','dungeonarena.js','dungeonbounty.js','dungeonvoid.js','settlementtransaction.js','engine.js','savemigration.js','supabaseauth.js','cloudsave.js','3d-test/t3b-formal-owner-clock.js','3d-test/t3b-formal-controller.js','3d-test/t3b-formal-entry.js','audio/audio-core.js','audio/audio-scenes.js'];
for(const p of owners){assert.deepEqual(fs.readFileSync(p),cp.execFileSync('git',['show',baseline+':'+p]),'protected formal owner changed: '+p);}
const html=fs.readFileSync('3d-test/index.html','utf8'),center=fs.readFileSync('3d-test/test-center.js','utf8');
assert.doesNotMatch(html,/id="(?:categoryList|caseList|caseSearch)"/);
assert.doesNotMatch(center,/角色與動作|戰場與對戰|renderCategories|renderCases/);
assert.match(center,/selectCase\(id\)/,'historical automated diagnostics retained');
for(const p of ['3d-test/equipment-sprites-v1/actor.mjs','development/equipment-2_5d/v1/actor.mjs'])assert.doesNotMatch(fs.readFileSync(p,'utf8'),/if\(slash\)|c\.stroke\(/,'attack halo rendering must remain removed');
const trial=JSON.parse(fs.readFileSync('development/combat-animation/batch12/thrust-feasibility.json'));
assert.equal(trial.productionThrustAccepted,false,'missing art must not be declared accepted');
console.log('PASS Batch12 presentation safety: '+owners.length+' unchanged formal owners; no categories or attack aura; unresolved art explicit');
