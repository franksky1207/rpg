"use strict";
const assert=require("node:assert/strict"),{chromium}=require("playwright");
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844}});
  await page.setContent('<!doctype html><html><body><div id="main"><div class="combat-screen"><div id="combatPlayerCard" class="combatant"><span id="combatPlayerHp"></span><span id="combatPlayerDamage"></span><span id="combatPlayerBar"></span></div><div id="combatEnemyCard" class="combatant"><span id="combatEnemyHp"></span><span id="combatEnemyDamage"></span><span id="combatEnemyBar"></span></div></div></div></body></html>');
  await page.addScriptTag({path:"combatfx.js"});
  const result=await page.evaluate(async()=>{
   const base={playerMaxHp:10000,playerStartHp:10000,e:{hp:10000},enemyStartHp:10000};
   const events=Array.from({length:100},(_,i)=>({type:"attack",actor:i%2?"enemy":"player",target:i%2?"player":"enemy",damage:1,actualDamage:1}));
   const input={...base,events};
   const timerStart=performance.now();
   window.prepareCombatPresentation(input);
   const snap=await window.animateStructuredCombatPresentation(input,{sleep:()=>Promise.resolve(),clearAfter:true});
   const after100={playerHp:snap.playerHp,enemyHp:snap.enemyHp,active:window.isCombatPresentationActive()};
   for(let i=0;i<100;i++){
    window.prepareCombatPresentation({...base,events:[]});
    window.spawnCombatFx("enemy","heal","S",20);
    window.clearCombatPresentation("repeat-"+i);
   }
   for(let i=0;i<50;i++){
    window.prepareCombatPresentation({...base,events:[]});
    window.spawnCombatFx("enemy","heal","E",20);
    window.clearCombatPresentation("exit-"+i);
   }
   await new Promise(r=>setTimeout(r,75));
   return {after100,staleNodes:document.querySelectorAll(".combat-fx-pop").length,elapsedMs:performance.now()-timerStart};
  });
  assert.equal(result.after100.playerHp,9950);
  assert.equal(result.after100.enemyHp,9950);
  assert.equal(result.after100.active,false);
  assert.equal(result.staleNodes,0);
  console.log("BATCH3_PRESSURE_PASS",JSON.stringify(result));
 }finally{await browser.close()}
})().catch(e=>{console.error(e.stack||String(e));process.exitCode=1});
