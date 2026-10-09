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
   document.getElementById("civilizationAuthGate")?.remove();
   document.getElementById("gameIntroModal")?.classList.remove("show");
   const before=JSON.stringify(state);
   window.__reviewBrowserCleanup={before,world:window.isSecondWorldEntered,combat:window.runCombatCore,presenter:window.animateStructuredCombatPresentation,sleep:window.mainBattlePresentationSleep,phase:window.currentWorldPhase,prepareSelection:window.prepareFirstWorldTargetContextFromSelection,prepareExplicit:window.prepareFirstWorldTargetContext,originalView:view,originalScreen:adventureScreen,originalBusy:battleBusy};
   window.isSecondWorldEntered=()=>true;
   window.currentWorldPhase=()=>2;
   // Use the genuine combat core; only its time-based visual playback is accelerated.
   window.runCombatCore=(player,enemy,hp,options)=>window.__reviewBrowserCleanup.combat(player,enemy,hp,options);
   window.mainBattlePresentationSleep=async()=>{await new Promise(resolve=>setTimeout(resolve,1));};
   view="adventure";battleBusy=false;window.setAdventureReviewBattleActive?.(false);
   const selected=window.setAdventureEraView("galaxy-review");
   render();
   window.__reviewBrowserCleanup.before=JSON.stringify(state);
   return {selected,phase:window.currentWorldPhase(state),era:window.getAdventureEraView?.(),locked:window.adventureEraViewLocked?.(),view,preview:document.querySelector("#main")?.textContent?.slice(0,260),hasPrepare:!!document.querySelector(".galaxy-review-prepare"),hasEnemy:!!document.querySelector(".enemy-card"),hasButton:!!document.querySelector('button[onclick="startGalaxyReviewBattle()"]')};
  });
  assert.equal(setup.era,"galaxy-review",JSON.stringify(setup));
  if(!setup.hasPrepare){await page.locator(".galaxy-review-action").first().click();}
  assert.equal(await page.locator(".galaxy-review-prepare").count(),1);assert.equal(await page.locator(".galaxy-review-prepare .enemy-card").count(),5);assert.equal(await page.locator('button[onclick="startGalaxyReviewBattle()"]').count(),1);
  const formalSnapshot=()=>page.evaluate(()=>JSON.stringify({exp:state.exp,gold:state.gold,unlockedMap:state.unlockedMap,mapProgress:state.mapProgress,bossProgress:state.bossProgress,equipment:state.equipment,vipPoints:state.vipPoints}));
  for(let n=0;n<2;n++){
   if(n===1)await page.evaluate(()=>{
    window.currentWorldPhase=()=>3;
    window.clearPreparedFirstWorldTargetContext?.();
    window.prepareFirstWorldTargetContextFromSelection=()=>null;
    window.prepareFirstWorldTargetContext=()=>null;
    window.setAdventureEraView("galaxy-review");
    window.openGalaxyReviewMap(0);
   });
   await page.evaluate(()=>{window.setAdventureEraView("galaxy-review");window.openGalaxyReviewMap(0);});
   const before=await formalSnapshot();
   const prepared=await page.evaluate(()=>({screen:adventureScreen,era:window.getAdventureEraView?.(),phase:window.currentWorldPhase(state),view,reviewButtons:document.querySelectorAll(".galaxy-review-prepare .enemy-card").length,direct:typeof adventurePage==="function"?adventurePage().slice(0,280):"missing",adventureFunction:typeof adventurePage==="function"?String(adventurePage).slice(0,600):"missing",reviewPrepareFunction:typeof galaxyReviewPreparePage==="function"?String(galaxyReviewPreparePage).slice(0,190):"missing",directSource:String(adventurePage).slice(0,700),renderSource:String(render).slice(0,340),mainText:document.getElementById("main")?.textContent?.slice(0,280),html:document.querySelector("#main")?.innerHTML?.slice(0,500)}));
   assert.equal(prepared.reviewButtons,5,JSON.stringify(prepared));
   await page.locator(".galaxy-review-prepare .enemy-card").nth(n).click();
   const beforeClick=await page.evaluate(()=>({view,screen:adventureScreen,era:window.getAdventureEraView?.(),phase:window.currentWorldPhase?.(state),buttons:document.querySelectorAll('button[onclick="startGalaxyReviewBattle()"]').length,content:document.getElementById("main")?.textContent?.slice(0,220),direct:typeof adventurePage==="function"?adventurePage().slice(0,220):"missing",renderSource:String(render).slice(0,270),isEntered:window.isSecondWorldEntered?.()}));
   assert.equal(beforeClick.buttons,1,JSON.stringify(beforeClick));
   await page.locator('button[onclick="startGalaxyReviewBattle()"]').click();
   await page.waitForSelector(".galaxy-review-combat",{timeout:10000});
   await page.waitForSelector("#battleResultModal.show",{timeout:10000});
   const inModal=await page.evaluate(()=>({locked:window.isAdventureReviewBattleActive?.(),source:window.getAdventureReviewBattleSource?.(),busy:battleBusy,save:JSON.stringify(state)}));
   assert.equal(inModal.locked,true);
   assert.equal(inModal.source,"galaxy");
   assert.equal(inModal.busy,false);
   assert.equal(await formalSnapshot(),before,"Read-only Galaxy review changed formal rewards or progression");
   await page.evaluate(()=>closeBattleResultModal());
   const end=await page.evaluate(()=>({locked:window.isAdventureReviewBattleActive?.(),busy:battleBusy,prepare:!!document.querySelector(".galaxy-review-prepare"),modal:document.querySelector("#battleResultModal")?.classList.contains("show")}));
   assert.equal(end.locked,false);assert.equal(end.busy,false);assert.equal(end.prepare,true);assert.equal(end.modal,false);
  }
  await page.evaluate(()=>{
   const x=window.__reviewBrowserCleanup;
   window.isSecondWorldEntered=x.world;window.runCombatCore=x.combat;window.animateStructuredCombatPresentation=x.presenter;window.mainBattlePresentationSleep=x.sleep;window.currentWorldPhase=x.phase;window.prepareFirstWorldTargetContextFromSelection=x.prepareSelection;window.prepareFirstWorldTargetContext=x.prepareExplicit;
   view=x.originalView;adventureScreen=x.originalScreen;battleBusy=x.originalBusy;
   window.setAdventureReviewBattleActive?.(false);render();
   delete window.__reviewBrowserCleanup;
  });
  assert.deepEqual(errors,[],"Page errors: "+errors.join("\n"));
  console.log("Galaxy review real-click combat/settlement/retry browser regression passed");
 }finally{await browser.close();}
})().catch(e=>{console.error(e.stack||e);process.exit(1)});
