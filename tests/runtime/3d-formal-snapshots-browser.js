"use strict";
const {chromium}=require("playwright"),assert=require("node:assert/strict");
const base=process.env.RUNTIME_SMOKE_URL||"http://127.0.0.1:4173/index.html";
// Isolated SDK session fixture, following the existing player browser tests.
// The real auth/startup/GM owners run; no real account, remote save or gate removal.
const sdk=`window.supabase={createClient(){return{auth:{onAuthStateChange(){return{data:{subscription:{unsubscribe(){}}}}},async getSession(){return{data:{session:{user:{id:'t1a-snapshot-test'}}},error:null}}},from(){return{select(){return this},eq(){return this},single(){return Promise.resolve({data:null,error:null})}}}}}};`;
async function finishIntro(page){
 await page.locator("#civilizationStoryModal.open").waitFor({state:"visible",timeout:60000});
 const actions=page.locator("#civilizationStoryModal #storyActions");
 for(let i=0;i<100;i++){
  const end=actions.getByRole("button",{name:"結束",exact:true});
  if(await end.count()){
   await end.click();await page.locator("#civilizationStoryModal.open").waitFor({state:"hidden"});
   await page.locator("#civilizationStarterGearModal").getByRole("button",{name:"領取裝備",exact:true}).click();
   await page.locator("#civilizationStarterGearModal").waitFor({state:"hidden"});
   await page.locator("#gameIntroModal").getByRole("button",{name:"踏上征途",exact:true}).click();
   await page.locator("#gameIntroModal.show").waitFor({state:"hidden"});return;
  }
  await actions.getByRole("button",{name:"下一頁",exact:true}).click();
 }
 throw Error("Intro did not finish through its formal controls");
}
(async()=>{
 const browser=await chromium.launch({headless:true,args:["--use-gl=angle","--use-angle=swiftshader"]});
 try{
  for(const viewport of [{width:1280,height:800},{width:390,height:844}]){
   const context=await browser.newContext({viewport}),errors=[];
   await context.route("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js",route=>route.fulfill({status:200,contentType:"text/javascript",body:sdk}));
   await context.addInitScript(()=>{
    localStorage.setItem("civilization-war-presentation-mode-v1:t1a-snapshot-test","text");
    localStorage.setItem("civilization-war-gm-authorized-v2-account-t1a-snapshot-test","1");
   });
   const page=await context.newPage();page.on("pageerror",e=>errors.push(String(e)));
   // Fix only Date.now before owners create checkpoints. Keep native timers,
   // animation frames and Date construction for actual UI / renderer behavior.
   await page.addInitScript(()=>{const fixed=Date.now();Date.now=()=>fixed;});
   await require('./retired-preview-harness.cjs')(page);
  await page.goto(base,{waitUntil:"domcontentloaded"});
   await page.waitForFunction(()=>window.CivilizationStartupCoordinator?.snapshot?.().status==="ready"&&typeof openGm3DPrototype==="function",null,{timeout:60000});
   await finishIntro(page);
   assert.equal(await page.evaluate(()=>document.body.classList.contains("background-preloading")),false);
   assert.equal(await page.evaluate(()=>gmRuntimeAuthorizationAuthorized()),true);
   const routes=["home","character","inventory","enhancement","specialization","adventure","dungeon","storyrecord","settings","guide"];
   for(const route of routes){
    console.log("T1-A preview",viewport.width,route);
    await page.evaluate(route=>go(route),route);
    const button=page.locator("#main #civilization3dHomeToggle, #main .galaxy-3d-controls button").first();
    assert.equal(await button.count(),1,"Formal preview missing: "+route);
    const before=await page.evaluate(()=>JSON.stringify(state));
    await button.click({timeout:60000});
    await page.waitForFunction(()=>document.getElementById("civilization3dFormalHost")?.dataset.threeDFormalMount==="active",null,{timeout:60000});
    await page.waitForFunction(()=>{
     const h=document.getElementById("civilization3dFormalHost");
     return window.BABYLON?.EngineStore.Instances.some(e=>h.contains(e.getRenderingCanvas())&&e.scenes.some(s=>s.isReady()&&s.textures.every(t=>t.isReady())));
    },null,{timeout:60000});
    await page.locator("#civilization3dFormalHost").getByRole("button",{name:"關閉 3D 預覽",exact:true}).click({timeout:60000});
    assert.equal(await page.evaluate(()=>JSON.stringify(state)),before,"Preview wrote formal state: "+route);
    await button.click();
    await page.waitForFunction(()=>document.getElementById("civilization3dFormalHost")?.dataset.threeDFormalMount==="active");
    assert.equal(await page.evaluate(()=>document.querySelectorAll("#civilization3dFormalHost canvas").length),1);
    await page.locator("#civilization3dFormalHost").getByRole("button",{name:"關閉 3D 預覽",exact:true}).click();
    assert.equal(await page.evaluate(()=>BABYLON.EngineStore.Instances.length),0,"GPU engine retained after close: "+route);

   }
   // Hold an old factory result across a route change; Runtime must dispose it.
   await page.evaluate(()=>{
    go("home");const original=Civilization3DPrototype;
    window.__oldFactory=original;
    window.Civilization3DPrototype={...original,createEpochScene:async args=>{await new Promise(resolve=>window.__releaseOldScene=resolve);return original.createEpochScene(args);}};
    civilization3dToggleHome();
   });
   await page.waitForFunction(()=>typeof window.__releaseOldScene==="function");
   await page.evaluate(()=>{go("character");Civilization3DPrototype=__oldFactory;civilization3dToggleCharacter();});
   await page.waitForFunction(()=>document.getElementById("civilization3dFormalHost")?.dataset.threeDFormalMount==="active");
   await page.evaluate(()=>__releaseOldScene());
   await page.waitForFunction(()=>BABYLON.EngineStore.Instances.length===1);
   assert.equal(await page.evaluate(()=>document.querySelectorAll("#civilization3dFormalHost canvas").length),1);
   // A missing decoration fails only its own scene and produces a visible notice.
   await page.evaluate(()=>{go("settings");Civilization3DPrototype={...__oldFactory,createServiceConsoleScene:undefined};});
   await page.locator('#main [data-service3d-preview="settings"] button').click();
   await page.waitForFunction(()=>document.getElementById("civilization3dFormalHost")?.dataset.threeDPreviewError==="scene-capability-missing");
   assert.equal(await page.locator('[data-three-d-preview-error-notice]').count(),1);
   await page.evaluate(()=>{go("character");civilization3dToggleCharacter();});
   await page.waitForFunction(()=>document.getElementById("civilization3dFormalHost")?.dataset.threeDFormalMount==="active");
   await page.evaluate(()=>document.querySelector("#civilization3dFormalHost canvas").dispatchEvent(new Event("webglcontextlost",{cancelable:true})));
   await page.waitForFunction(()=>BABYLON.EngineStore.Instances.length===0);
   await page.evaluate(()=>civilization3dToggleCharacter());
   await page.waitForFunction(()=>document.getElementById("civilization3dFormalHost")?.dataset.threeDFormalMount==="active");
   await page.locator("#civilization3dFormalHost").getByRole("button",{name:"關閉 3D 預覽",exact:true}).click();
   await page.evaluate(()=>{Civilization3DPrototype=__oldFactory;go("settings");});
   const before=await page.evaluate(()=>JSON.stringify(state));
   const direct=await page.evaluate(()=>Civilization3DFormalSnapshots.scenario());
   assert.equal(await page.evaluate(()=>JSON.stringify(state)),before,"Shared owner reads wrote formal state");
   assert.equal(direct.battle.status,"unavailable");assert.equal(direct.battle.settlementAvailable,false);
   assert.equal(await page.evaluate(()=>openGm3DPrototype()),true);
   await page.waitForFunction(()=>document.querySelector("#gm3dPrototypeOverlay iframe")?.contentWindow?.Civilization3DTestCenter?.version===5,null,{timeout:60000});
   const frame=page.frames().find(f=>f.url().includes("/3d-test/"));
   await frame.locator("#categoryList .center-category").filter({hasText:"冒險與宇宙地圖"}).click();
   await frame.locator("#caseList").getByRole("button",{name:"銀河紀元星圖",exact:true}).click();
   await frame.waitForFunction(()=>Civilization3DTestCenter.getFixture().formalReady&&Civilization3DTestCenter.getFixture().formalAppearanceReady,null,{timeout:60000});
   const bridged=await frame.evaluate(()=>new Promise((resolve,reject)=>{
    const timeout=setTimeout(()=>{removeEventListener("message",receive);reject(Error("formal scenario bridge timeout"));},15000);
    function receive(event){if(event.origin!==location.origin||event.source!==parent||event.data?.type!=="civilization3d:scenario-response")return;clearTimeout(timeout);removeEventListener("message",receive);resolve(event.data.snapshot);}
    addEventListener("message",receive);parent.postMessage({type:"civilization3d:scenario-request"},location.origin);
   }));
   assert.deepEqual(bridged,direct,"GM and formal must consume the same projection");
   assert.deepEqual(await frame.evaluate(()=>Civilization3DTestCenter.getFixture().equipmentCatalogCounts),{galaxy:100,universe:100,higher:10});
   await frame.locator("#categoryList .center-category").filter({hasText:"冒險與宇宙地圖"}).click();
   await frame.locator("#caseList").getByRole("button",{name:"銀河紀元星圖",exact:true}).click();
   await frame.locator("#scenarioFree").click();
   await frame.locator("#fixtureProgress").selectOption("7");
   const afterFixture=await page.evaluate(()=>JSON.stringify(state));
   assert.equal(afterFixture,before,"GM fixture leaked into formal state");
   await page.evaluate(()=>closeGm3DPrototype());assert.deepEqual(errors,[]);
   console.log("PASS T1-A formal routes, detached snapshots, real authorized iframe bridge and fixture isolation",viewport,routes);
   await context.close();
  }
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
