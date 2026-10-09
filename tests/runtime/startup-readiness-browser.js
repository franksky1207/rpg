const assert=require("assert");
const {chromium}=require("playwright");
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  const page=await browser.newPage();
  await page.goto(process.env.RUNTIME_SMOKE_URL||"http://127.0.0.1:4173/index.html",{waitUntil:"domcontentloaded",timeout:30000});
  await page.waitForFunction(()=>window.CivilizationStartupCoordinator?.snapshot?.().status==="ready",{timeout:20000});
  const report=await page.evaluate(()=>({
   snap:window.CivilizationStartupCoordinator.snapshot(),
   background:window.BACKGROUND_PRELOAD_READY===true,
   visible:!document.body.classList.contains("background-preloading"),
   done:document.getElementById("backgroundPreloadPercent")?.textContent,
   failure:document.getElementById("backgroundPreloadRetry")?.hidden,
   text:document.getElementById("backgroundPreloadStatus")?.textContent,
   registrationAfterReady:window.CivilizationStartupCoordinator.register("too-late",async()=>{})
  }));
  assert.equal(report.snap.status,"ready");
  assert.equal(report.background,true);
  assert.equal(report.visible,true);
  assert.ok(report.done===undefined||report.done==="100%");
  assert.equal(report.registrationAfterReady,false);
  assert.ok(!/GM|管理|診斷|admin/i.test(report.text||""),"Boot status must not disclose admin role");
  await page.close();
  console.log("Startup readiness normal-browser smoke passed");
 }finally{await browser.close();}
})().catch(error=>{console.error(error?.stack||error);process.exit(1)});
