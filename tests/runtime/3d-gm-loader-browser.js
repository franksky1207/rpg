"use strict";
// Current 2.5D GM loader regression: real modules, safe fallback, restart, disposal.
const {chromium}=require("playwright");
const assert=require("node:assert/strict");
const base=process.env.RUNTIME_SMOKE_URL||"http://127.0.0.1:4173/index.html";
(async()=>{
 const browser=await chromium.launch({headless:true,args:["--use-gl=angle","--use-angle=swiftshader","--no-sandbox"]});
 try{
  for(const viewport of [{width:1280,height:800},{width:390,height:844}]){
   const page=await browser.newPage({viewport}),errors=[],requests=[];
   page.on("pageerror",e=>errors.push(String(e)));
   page.on("request",r=>requests.push(new URL(r.url()).pathname));
   try{
    await page.goto(new URL("3d-test/?embedded=1",base).href,{waitUntil:"domcontentloaded",timeout:60000});
    await page.waitForFunction(()=>window.Civilization3DTestCenter?.version===6,null,{timeout:60000});
    assert.deepEqual(await page.evaluate(()=>Civilization3DTestCenter.categoryIds),["character","combat"]);
    assert.deepEqual(await page.evaluate(()=>Civilization3DTestCenter.caseIds),["C-08-CHARACTER","C-15-BATTLE"]);
    await page.locator("#categoryList").getByRole("button",{name:/戰場與對戰/}).click();
    await page.waitForFunction(()=>document.querySelector('[data-b="stage"]')?.dataset.renderReady==="true",null,{timeout:90000});
    assert.equal(await page.locator('[data-b="case"] option').count(),5,"five real GM B scenarios");
    assert.equal(await page.locator(".gm-b-simulation").count(),1);
    await page.locator("#toggle").click();
    await page.waitForFunction(()=>!document.querySelector("#fallback").hidden);
    assert.match(await page.locator("#fallbackReason").innerText(),/預覽已停用/);
    assert.equal(await page.locator(".gm-b-simulation").count(),0,"disable disposes battle view");
    await page.locator("#restart").click();
    await page.waitForFunction(()=>document.querySelector('[data-b="stage"]')?.dataset.renderReady==="true",null,{timeout:90000});
    assert.equal(await page.locator("#fallback").isHidden(),true,"restart exits safe fallback");
    await page.locator("#categoryList").getByRole("button",{name:/角色與動作/}).click();
    await page.waitForFunction(()=>!!document.querySelector(".gm-suit"),null,{timeout:30000});
    assert.equal(await page.locator(".gm-b-simulation").count(),0,"case switch releases battle");
    // A genuinely rejected dynamic import must show a safe user-visible fallback.
    // Fresh navigation is required to retry a failed browser module graph.
    await page.route("**/gm-battle-simulation.js*",route=>route.fulfill({status:503,contentType:"text/javascript",body:"module unavailable"}));
    await page.reload({waitUntil:"domcontentloaded"});
    await page.waitForFunction(()=>window.Civilization3DTestCenter?.version===6);
    await page.locator("#categoryList").getByRole("button",{name:/戰場與對戰/}).click();
    await page.waitForFunction(()=>!document.querySelector("#fallback").hidden,null,{timeout:30000});
    assert.match(await page.locator("#fallbackReason").innerText(),/視覺測試無法載入/);
    assert.equal(await page.locator(".gm-b-simulation").count(),0,"failed import has no live battle view");
    await page.unroute("**/gm-battle-simulation.js*");
    await page.reload({waitUntil:"domcontentloaded"});
    await page.waitForFunction(()=>window.Civilization3DTestCenter?.version===6);
    await page.locator("#categoryList").getByRole("button",{name:/戰場與對戰/}).click();
    await page.waitForFunction(()=>document.querySelector('[data-b="stage"]')?.dataset.renderReady==="true",null,{timeout:90000});
    await page.evaluate(()=>dispatchEvent(new Event("pagehide")));
    assert.equal(await page.locator(".gm-b-simulation").count(),0,"pagehide disposes active view");
    assert.deepEqual(errors,[],"browser errors");
    assert.ok(requests.some(p=>p.endsWith("/gm-battle-simulation.js")),"current battle module requested");
    console.log("PASS current GM 2.5D load/fallback/restart/reload/disposal",viewport);
   }finally{await page.close();}
  }
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
