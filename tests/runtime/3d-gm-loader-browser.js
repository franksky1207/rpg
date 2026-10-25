"use strict";
// Current 2.5D GM loader regression: real modules, safe fallback, restart, disposal.
const {chromium}=require("playwright");
const assert=require("node:assert/strict");
const base=process.env.RUNTIME_SMOKE_URL||"http://127.0.0.1:4173/index.html";
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH,args:["--use-gl=angle","--use-angle=swiftshader","--no-sandbox"]});
 try{
  for(const viewport of [{width:1280,height:800},{width:390,height:844}]){
   const page=await browser.newPage({viewport}),errors=[],requests=[];
   page.on("pageerror",e=>errors.push(String(e)));
   page.on("request",r=>requests.push(new URL(r.url()).pathname));
   try{
    await page.goto(new URL("3d-test/?embedded=1",base).href,{waitUntil:"domcontentloaded",timeout:60000});
    await page.waitForFunction(()=>window.Civilization3DTestCenter?.version===7,null,{timeout:60000});
    assert.deepEqual(await page.evaluate(()=>Civilization3DTestCenter.categoryIds),[]);
    assert.deepEqual(await page.evaluate(()=>Civilization3DTestCenter.caseIds),["C-08-CHARACTER","C-15-BATTLE"]);
    await page.evaluate(()=>Civilization3DTestCenter.selectCase('C-15-BATTLE'));
    await page.waitForFunction(()=>!!document.querySelector(".gm-b-simulation")||!document.getElementById("fallback").hidden,null,{timeout:30000});
    const initial=await page.evaluate(()=>({battle:!!document.querySelector(".gm-b-simulation"),fallback:!document.getElementById("fallback").hidden,reason:document.getElementById("fallbackReason").textContent}));
    assert.ok(initial.battle||/載入|失敗|安全/.test(initial.reason),"GM must expose battle or explained safe fallback "+JSON.stringify(initial));
    if(initial.battle)assert.equal(await page.locator('[data-b="case"] option').count(),5,"five current GM battle cases");
    assert.equal(await page.locator(".gm-b-simulation").count(),initial.battle?1:0);
    await page.locator("#toggle").click();
    await page.waitForFunction(()=>document.querySelector("#status")?.textContent?.includes("預覽已停用")&&document.querySelector("#fallback").hidden);
    assert.match(await page.locator("#status").innerText(),/預覽已停用/);
    assert.equal(await page.locator(".gm-b-simulation").count(),0,"disable disposes battle view");
    await page.locator("#restart").click();
    await page.waitForFunction(()=>!!document.querySelector(".gm-b-simulation")||!document.getElementById("fallback").hidden,null,{timeout:30000});
    assert.equal(await page.locator("#toggle").innerText(),"停用預覽","restart re-enables GM previews");
    await page.evaluate(()=>Civilization3DTestCenter.selectCase('C-08-CHARACTER'));
    await page.waitForFunction(()=>!!document.querySelector(".gm-suit"),null,{timeout:30000});
    assert.equal(await page.locator(".gm-b-simulation").count(),0,"case switch releases battle");
    // A genuinely rejected dynamic import must show a safe user-visible fallback.
    // Fresh navigation is required to retry a failed browser module graph.
    await page.route("**/gm-battle-simulation.js*",route=>route.fulfill({status:503,contentType:"text/javascript",body:"module unavailable"}));
    await page.reload({waitUntil:"domcontentloaded"});
    await page.waitForFunction(()=>window.Civilization3DTestCenter?.version===7);
    await page.evaluate(()=>Civilization3DTestCenter.selectCase('C-15-BATTLE'));
    await page.waitForFunction(()=>!document.querySelector("#fallback").hidden,null,{timeout:30000});
    assert.match(await page.locator("#fallbackReason").innerText(),/動畫預覽載入失敗/);
    assert.equal(await page.locator(".gm-b-simulation").count(),0,"failed import has no live battle view");
    await page.unroute("**/gm-battle-simulation.js*");
    await page.reload({waitUntil:"domcontentloaded"});
    await page.waitForFunction(()=>window.Civilization3DTestCenter?.version===7);
    await page.evaluate(()=>Civilization3DTestCenter.selectCase('C-15-BATTLE'));
    await page.waitForFunction(()=>!!document.querySelector(".gm-b-simulation")||!document.getElementById("fallback").hidden,null,{timeout:30000});
    await page.evaluate(()=>dispatchEvent(new Event("pagehide")));
    assert.equal(await page.locator(".gm-b-simulation").count(),0,"pagehide disposes active view");
    assert.deepEqual(errors.filter(e=>!/Failed to fetch dynamically imported module|Importing a module script failed/i.test(e)),[],"unexpected browser errors");
    assert.ok(requests.some(p=>p.endsWith("/gm-battle-simulation.js")),"current battle module requested");
    console.log("PASS current GM 2.5D load/fallback/restart/reload/disposal",viewport);
   }finally{await page.close();}
  }
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
