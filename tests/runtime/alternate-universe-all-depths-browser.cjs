'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true});try{
 const page=await browser.newPage();await page.goto((process.env.RUNTIME_SMOKE_URL||'http://127.0.0.1:4173/index.html')+'?production=1');
 await page.waitForFunction(()=>typeof beginAlternateUniverseAttempt==='function'&&typeof runAlternateUniverseCombat==='function');
 const report=await page.evaluate(()=>{
  const failures=[];let completed=0,duplicatesRejected=0,resumed=0;
  markSaveLoadResolved('all-depths-fixture');
  for(let depth=1;depth<=1000;depth++){
   state=newState();state.level=2000;state.hp=1000000000;state.secondWorld.entered=true;state.thirdWorld.entered=true;state.reincarnation.count=1;
   state.reincarnation.alternateUniverse.unlocked=true;state.reincarnation.alternateUniverse.deepestCleared=depth-1;
   const begun=beginAlternateUniverseAttempt(depth,{rng:()=>.5,attemptId:'all-depths-'+depth});
   if(!begun.ok){failures.push({depth,stage:'begin',reason:begun.reason});continue;}
   const retry=beginAlternateUniverseAttempt(depth);if(retry.ok&&retry.resumed&&retry.attempt.attemptId===begun.attempt.attemptId)resumed++;else failures.push({depth,stage:'resume'});
   const enemy=alternateUniverseCurrentAttemptEncounter(state),player={hp:enemy.hp*100,atk:enemy.hp*100,def:enemy.atk*100,crit:0,dodge:0};
   const result=runAlternateUniverseCombat({player,startHp:player.hp,playerHealCap:player.hp,rng:()=>.5,logs:false,maxTurns:50,maxActions:1000});
   if(!result.ok||!result.settlementReady||!result.combat.win){failures.push({depth,stage:'combat',reason:result.reason});continue;}
   const settled=settleAlternateUniverseCombat(result);if(settled.ok&&state.reincarnation.alternateUniverse.deepestCleared===depth)completed++;else failures.push({depth,stage:'settle',reason:settled.reason});
   const before=JSON.stringify(state),duplicate=settleAlternateUniverseCombat(result);
   if(!duplicate.ok&&JSON.stringify(state)===before)duplicatesRejected++;else failures.push({depth,stage:'duplicate'});
  }
  return {universes:200,stagesPerUniverse:5,completed,resumed,duplicatesRejected,failures};
 });assert.deepEqual(report.failures,[]);assert.equal(report.completed,1000);assert.equal(report.resumed,1000);assert.equal(report.duplicatesRejected,1000);console.log(JSON.stringify(report));
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
