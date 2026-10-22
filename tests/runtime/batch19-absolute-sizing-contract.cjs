'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto'),cp=require('node:child_process');
(async()=>{
 const {PLAYER_FRAME_HEIGHT,measuredMonsterProfiles,monsterProfileSourceSHA}=await import('../../3d-test/monster-actor.mjs');
 const floors=JSON.parse(fs.readFileSync('development/combat-animation/batch19-1/absolute-height-baseline.json')).rows;
 assert.equal(floors.length,57);assert.equal(new Set(floors.map(r=>JSON.stringify([r.viewport,r.world,r.mode,r.identity]))).size,57);for(const r of floors)assert.equal(r.minPaintedHeight,r.paintedHeight-1);
 const profiles=JSON.parse(fs.readFileSync('development/combat-animation/batch19-1/measured-prototypes.json'));
 assert.deepEqual(measuredMonsterProfiles,profiles,'failed-load layout must use the actual measured prototype envelopes');
 const assets=JSON.parse(fs.readFileSync('data/monsters/monster-assets.json')).assets;
 assert.equal(crypto.createHash('sha256').update(JSON.stringify(assets.map(a=>[a.assetId,a.sha256]))).digest('hex'),monsterProfileSourceSHA,'asset changes require fresh Alpha measurements');
 assert.equal(Object.keys(profiles).length,39);for(const a of assets)assert.ok(profiles[a.assetId]);
 const reference=JSON.parse(fs.readFileSync('development/combat-animation/batch19-1/main-special-frame-reference.json')).rows.find(r=>r.viewport.width===390&&r.specialId==='mysterious_traveler');
 assert.equal(PLAYER_FRAME_HEIGHT,reference.layout.playerFrameFraction,'absolute target comes from the measured native special encounter');
 for(const path of ['data/monsters/monster-assets.json','data/monsters/monster-mappings.json','data/monsters/monster-variants.json','combatcore.js','combatmath.js','specialcore.js','specialencounter.js','alternateuniversecombat.js','calamitycore.js','thirdworldcombat.js','engine.js','savemigration.js','3d-test/era-player-sprites.mjs','3d-test/equipment-sprites-v1/actor.mjs','3d-test/equipment-sprites-v1/animation.mjs'])assert.equal(fs.readFileSync(path,'utf8'),cp.execFileSync('git',['show','9f9f1668445850e1c73b72a79a5e20ccbd25d1b9:'+path],{encoding:'utf8',maxBuffer:16*1024*1024}),'unchanged identity, art or gameplay owner: '+path);
 console.log('PASS measured absolute frame target; 39 measured outline profiles locked to approved image SHAs; identity/art/gameplay owners unchanged');
})().catch(e=>{console.error(e);process.exitCode=1;});
