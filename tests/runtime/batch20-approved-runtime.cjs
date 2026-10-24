'use strict';
// Batch20 adds an exact-source layer without altering the sealed historical registrations.
// Both links are fail-closed: live -> batch20 base -> historical guard base.
const fs=require('node:fs'),cp=require('node:child_process'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const current=require('./batch20-approved-runtime.json'),historical=require('./foreground-approved-runtime.json');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const at=(ref,p)=>cp.execFileSync('git',['show',ref+':'+p],{maxBuffer:8*1024*1024});
function original(p,encoding){
 let bytes=fs.readFileSync(p);
 // Compose the later PR #93 heritage cache token before the exact #94 digest.
 if(p==='index.html')bytes=Buffer.from(bytes.toString().replace('civilizationheritage.js?v=20261024-batch20&batch20=20261024-r2&heritageBackground=20261024','civilizationheritage.js?v=20261024-batch20&batch20=20261024-r2'));
 // PR #93 is an independent, exact cache-only HTML composition. Accept that
 // approved token before checking this repair; never overwrite its codex change.
 if(p==='index.html')bytes=Buffer.from(bytes.toString().replace('monstercodex.js?v=20261024-batch20-2&batch20=20261024-r2&repair=20261024-r2&uiRepair=20261024-three1&storyBackground=20261024','monstercodex.js?v=20261024-batch20-2&batch20=20261024-r2&repair=20261024-r2&uiRepair=20261024-three1'));

 // The codex navigation cache token must be normalized before the Mirror/Void exact HTML digest.
 if(p==='index.html')bytes=Buffer.from(bytes.toString().replace('&codexNavVisible=20261024',''));
 if(p==='index.html')bytes=Buffer.from(bytes.toString().replace('&codexNav=20261024',''));

 // The independent Mirror/Void repair is exact-registered above the sealed links.
 const dungeonRepair=require('./mirror-void-approved-sources.json'),dungeonSource=dungeonRepair.files[p];
 if(dungeonSource){assert.equal(sha(bytes),dungeonSource.afterSha256,'unregistered Mirror/Void edit: '+p);const before=at(dungeonRepair.baseline,p);assert.equal(sha(before),dungeonSource.beforeSha256,'Mirror/Void baseline digest: '+p);bytes=before;}

 // Exact registration of the three authorized UI repairs; historical assertions still run.
 const repair=require('./three-ui-approved-sources.json'),registered=repair.files[p];
 if(p==='monstercodex.js'){
  // Explicitly approved codex navigation addition: fail closed on every other edit.
  assert.equal(cp.execFileSync('git',['hash-object',p],{encoding:'utf8'}).trim(),'0107af3bc334288acaa45fb7fbfc1e4b314b426e','unregistered codex navigation source edit');
  bytes=at('5eb831d7f720d6e89e8c85ca23bfd724c96820f3',p);
 }
 if(p==='civilizationheritage.js')bytes=Buffer.from(bytes.toString().replace('<section class="calamity-shell calamity-home">','<section class="calamity-shell">'));
 if(p==='monstercodex.js')bytes=Buffer.from(bytes.toString().replace('<section class="function-page story-record-page"><div class="back-home">','<section class="function-page"><div class="back-home">'));
 if(p==='index.html')bytes=Buffer.from(bytes.toString().replace('&storyBackground=20261024',''));
 if(registered){assert.equal(sha(bytes),registered.afterSha256,'unregistered UI repair source edit: '+p);const before=at(repair.baseline,p);assert.equal(sha(before),registered.beforeSha256,'UI repair baseline digest: '+p);bytes=before;}

 if(p==='thirdworldarena.js')bytes=Buffer.from(bytes.toString().replace('function runtimeSnapshot(options={}){const round=arenaRuntime.round;if(options?.visualOnly===true)return {status:arenaRuntime.status,round:round?{stageIndex:round.stageIndex,enemy:{higherDimensionalBossId:round.enemy?.higherDimensionalBossId},lineup:cloneLineup(round.lineup)}:null};','function runtimeSnapshot(){const round=arenaRuntime.round;'));
 if(p==='index.html')bytes=Buffer.from(bytes.toString().replace('thirdworldarena.js?v=20260929-thirdworld-batch15-opt2&events=20261012-t1c-v1&foreground=20261023-194-v2&repair=20261024-r2','thirdworldarena.js?v=20260929-thirdworld-batch15-opt2&events=20261012-t1c-v1&foreground=20261023-194-v2'));
 if(p==='dungeonbounty.js')bytes=Buffer.from(bytes.toString().replace(';void window.CivilizationFormalBRenderer?.prepareMonsterVisual?.({mode:"bounty",world:universePhase()?2:1,name:bountyState.enemy.name,kind:bountyState.enemy.kind},{priority:"next"})',''));
 if(p==='index.html')bytes=Buffer.from(bytes.toString().replace('dungeonbounty.js?v=20261010-battle-end-return-theme1&v2=20261004-reincarnation-dungeon-opt2&victory=20261010-finalsettlement&audiofix1=20261011&audioLifecycle=20261011-unified-v1&pr48=20261019-center3&foreground=20261023-194-v2&repair=20261024-r2','dungeonbounty.js?v=20261010-battle-end-return-theme1&v2=20261004-reincarnation-dungeon-opt2&victory=20261010-finalsettlement&audiofix1=20261011&audioLifecycle=20261011-unified-v1&pr48=20261019-center3&foreground=20261023-194-v2'));
 // Only the authorized resource-clear event bridge is normalized for historical byte locks.
 if(p==='resource-cache-client.js')bytes=Buffer.from(bytes.toString().replace('async function clear(){const result=await message("CIV_CACHE_CLEAR");if(result.ok)g.dispatchEvent(new Event("civilization-resource-cache-cleared"));return result;}','function clear(){return message("CIV_CACHE_CLEAR");}'));
 if(p==='index.html')for(const [from,to] of [["monstercodex.js?v=20261024-batch20-2&batch20=20261024-r2&repair=20261024-r2", "monstercodex.js?v=20261024-batch20-2&batch20=20261024-r2"], ["monstercodexdata.js?v=20261024-batch20&batch20=20261024-r2&appearance=20261024-au-ten-stages1&repair=20261024-r2", "monstercodexdata.js?v=20261024-batch20&batch20=20261024-r2&appearance=20261024-au-ten-stages1"], ["gmdata.js?v=20260924-future-save-guard1&repair=20261024-r2", "gmdata.js?v=20260924-future-save-guard1"], ["resource-cache-client.js?v=20261011-prefetch-fix1&repair=20261024-r2", "resource-cache-client.js?v=20261011-prefetch-fix1"], ["3d-test/t3b-formal-renderer.js?v=20261024-au-ten-stages1&spriteWarm=20261019-v2&pr48=20261019-center4&batch14=20261021-map-monsters1&batch15=20261021-pair1&repair=20261024-r2", "3d-test/t3b-formal-renderer.js?v=20261024-au-ten-stages1&spriteWarm=20261019-v2&pr48=20261019-center4&batch14=20261021-map-monsters1&batch15=20261021-pair1"]])bytes=Buffer.from(bytes.toString().replace(from,to));
 // Exact authorized repair cache revision; all other bytes remain protected.
 if(p==='index.html')bytes=Buffer.from(bytes.toString().replace('t3b-formal-renderer.js?v=20261024-au-ten-stages1','t3b-formal-renderer.js?v=20261022-batch19-frame1').replace('monstercodexdata.js?v=20261024-batch20&batch20=20261024-r2&appearance=20261024-au-ten-stages1','monstercodexdata.js?v=20261024-batch20&batch20=20261024-r2'));
 const row=current.files[p];
 if(row){assert.equal(sha(bytes),row.afterSha256,'unregistered batch20 source edit: '+p);const before=at(current.baseline,p);assert.equal(sha(before),row.beforeSha256,'batch20 baseline digest: '+p);bytes=before;}
 const old=historical.files[p];
 if(old){assert.equal(sha(bytes),old.afterSha256,'historical approved-runtime link: '+p);const before=at(historical.baseline,p);assert.equal(sha(before),old.beforeSha256,'historical baseline digest: '+p);if(p==='combatcore.js')assert.equal(bytes.toString().split('window.COMBAT_FULL_HP_LOCK_START_NORMALIZATION_VERSION=1;')[0],before.toString().split('window.COMBAT_FULL_HP_LOCK_START_NORMALIZATION_VERSION=1;')[0],'historical damage kernel remains exact');bytes=before;}
 return encoding?bytes.toString(encoding):bytes;
}
function verifyAll(){const paths=[...new Set([...Object.keys(historical.files),...Object.keys(current.files),...Object.keys(require('./three-ui-approved-sources.json').files),...Object.keys(require('./mirror-void-approved-sources.json').files)])];paths.forEach(p=>original(p));return paths;}
module.exports={original,verifyAll};
if(require.main===module){require('./batch20-notice-protection.cjs');console.log('PASS exact-source Batch20 registration, historical locks unchanged:',verifyAll().length);}
