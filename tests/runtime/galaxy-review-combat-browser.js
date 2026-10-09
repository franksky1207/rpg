const {chromium}=require("playwright");
const assert=require("node:assert/strict");
(async()=>{
 const browser=await chromium.launch({headless:true});
 const page=await browser.newPage();
 const errors=[];page.on("pageerror",e=>errors.push(String(e)));
 try{
  await page.goto(process.env.RUNTIME_SMOKE_URL||"http://127.0.0.1:4173/index.html",{waitUntil:"domcontentloaded",timeout:30000});
  await page.waitForFunction(()=>typeof window.startGalaxyReviewBattle==="function"&&typeof window.openGalaxyReviewMap==="function"&&typeof window.runCombatCore==="function",{timeout:30000});
  const setup=await page.evaluate(()=>{
   const before=JSON.stringify(state);
   window.__reviewBrowserCleanup={before,world:window.isSecondWorldEntered,combat:window.runCombatCore,presenter:window.animateStructuredCombatPresentation,originalView:view,originalScreen:adventureScreen,originalBusy:battleBusy};
   window.isSecondWorldEntered=()=>true;
   // Use the genuine combat core; only its time-based visual playback is accelerated.
   window.runCombatCore=(player,enemy,hp,options)=>window.__reviewBrowserCleanup.combat(player,enemy,hp,options);
   window.animateStructuredCombatPresentation=async()=>{await new Promise(resolve=>setTimeout(resolve,500));};
   view="adventure";battleBusy=false;window.setAdventureReviewBattleActive?.(false);
   window.openGalaxyReviewMap(0);
   window.__reviewBrowserCleanup.before=JSON.stringify(state);
   return {hasPrepare:!!document.querySelector(".galaxy-review-prepare"),hasEnemy:!!document.querySelector(".enemy-card"),hasButton:!!document.querySelector('button[onclick="startGalaxyReviewBattle()"]')};
  });
  assert.equal(setup.hasPrepare,true);assert.equal(setup.hasEnemy,true);assert.equal(setup.hasButton,true);
  for(let n=0;n<2;n++){
   await page.locator(".galaxy-review-prepare .enemy-card").nth(n).click();
   await page.locator('button[onclick="startGalaxyReviewBattle()"]').click();
   await page.waitForSelector(".galaxy-review-combat",{timeout:10000});
   await page.waitForSelector("#battleResultModal.show",{timeout:10000});
   const inModal=await page.evaluate(()=>({locked:window.isAdventureReviewBattleActive?.(),source:window.getAdventureReviewBattleSource?.(),busy:battleBusy,save:JSON.stringify(state)}));
   assert.equal(inModal.locked,true);
   assert.equal(inModal.source,"galaxy");
   assert.equal(inModal.busy,false);
   assert.equal(inModal.save,await page.evaluate(()=>window.__reviewBrowserCleanup.before));
   await page.evaluate(()=>closeBattleResultModal());
   const end=await page.evaluate(()=>({locked:window.isAdventureReviewBattleActive?.(),busy:battleBusy,prepare:!!document.querySelector(".galaxy-review-prepare"),modal:document.querySelector("#battleResultModal")?.classList.contains("show")}));
   assert.equal(end.locked,false);assert.equal(end.busy,false);assert.equal(end.prepare,true);assert.equal(end.modal,false);
  }
  await page.evaluate(()=>{
   const x=window.__reviewBrowserCleanup;
   window.isSecondWorldEntered=x.world;window.runCombatCore=x.combat;window.animateStructuredCombatPresentation=x.presenter;
   view=x.originalView;adventureScreen=x.originalScreen;battleBusy=x.originalBusy;
   window.setAdventureReviewBattleActive?.(false);render();
   delete window.__reviewBrowserCleanup;
  });
  assert.deepEqual(errors,[],"Page errors: "+errors.join("\n"));
  console.log("Galaxy review real-click combat/settlement/retry browser regression passed");
 }finally{await browser.close();}
})().catch(e=>{console.error(e.stack||e);process.exit(1)});
