"use strict";
const {chromium}=require("playwright");
const assert=require("node:assert/strict");
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844}});
  await page.setContent('<!doctype html><html><body><div id="main"><div class="combat-screen"><div id="combatPlayerCard" class="combatant"><div class="big-hp"><div class="bar"><span id="combatPlayerBar"></span></div></div><span id="combatPlayerHp"></span></div><div id="combatEnemyCard" class="combatant"><div class="big-hp"><div class="bar"><span id="combatEnemyBar"></span></div></div><span id="combatEnemyHp"></span></div></div></div></body></html>');
  // The current main presenter requires its real foreground lifecycle owner.
  await page.addScriptTag({path:"combatlifecycle.js"});
  await page.addScriptTag({path:"combatfx.js"});
  const result=await page.evaluate(async()=>{
   const combat={events:[],playerMaxHp:100,playerStartHp:100,e:{hp:100},enemyStartHp:100};
   const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
   for(let i=0;i<50;i++){
    window.prepareCombatPresentation(combat);
    window.spawnCombatFx("enemy","heal","OLD",75);
    window.clearCombatPresentation("test-cancel");
   }
   await sleep(130);
   const stale=document.querySelectorAll(".combat-fx-pop").length;
   window.prepareCombatPresentation(combat);
   window.spawnCombatFx("enemy","heal","NEW",5);
   await sleep(35);
   const active=[...document.querySelectorAll(".combat-fx-pop")].map(x=>x.textContent);
   window.clearCombatPresentation("test-complete");
   window.spawnCombatFx("enemy","heal","ORPHAN",75);
   window.clearCombatPresentation("orphan-without-owner");
   await sleep(130);
   const orphan=document.querySelectorAll(".combat-fx-pop").length;
   window.prepareCombatPresentation(combat);
   let releaseOld;
   const oldTask=window.animateStructuredCombatPresentation(combat,{
    sleep:()=>new Promise(resolve=>{releaseOld=resolve;}),
    clearAfter:true
   }).then(()=>({interrupted:false}),error=>{if(error?.code!=="COMBAT_INTERRUPTED")throw error;return {interrupted:true};});
   window.prepareCombatPresentation(combat);
   const replacement=window.getCombatPresentationSnapshot()?.token;
   releaseOld();
   const oldResult=await oldTask;
   const replacementSurvived=window.isCombatPresentationActive()&&window.getCombatPresentationSnapshot()?.token===replacement;
   window.clearCombatPresentation("final-cleanup");
   return {stale,active,remaining:document.querySelectorAll(".combat-fx-pop").length,orphan,replacementSurvived,supersededInterrupted:oldResult.interrupted};
  });
  assert.equal(result.stale,0,"cancelled battle must not show delayed stale FX");
  assert.deepEqual(result.active,["NEW"],"active battle retains intended FX");
  assert.equal(result.remaining,0,"cleared battle must release FX nodes");
  assert.equal(result.orphan,0,"unowned delayed FX must not revive after cleanup");
  assert.equal(result.supersededInterrupted,true,"superseded playback must use the current lifecycle interruption contract");
  assert.equal(result.replacementSurvived,true,"stale playback cannot clear replacement battle");
  console.log("BATCH3_FX_TIMER_LIFECYCLE_PASS",JSON.stringify(result));
 }finally{await browser.close();}
})().catch(e=>{console.error(e.stack||String(e));process.exitCode=1;});
