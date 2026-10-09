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
  // A preregistered startup prerequisite must prevent reveal on failure and succeed after manual retry.
  const retryPage=await browser.newPage();
  await retryPage.addInitScript(()=>{
   let coordinator=null,attempts=0;
   Object.defineProperty(window,"CivilizationStartupCoordinator",{
    configurable:true,
    get(){return coordinator;},
    set(value){
     coordinator=value;
     value.register("browser-retry-probe",async()=>{
      if(++attempts===1)throw new Error("probe-transient-failure");
     });
    }
   });
  });
  await retryPage.goto(process.env.RUNTIME_SMOKE_URL||"http://127.0.0.1:4173/index.html",{waitUntil:"domcontentloaded",timeout:30000});
  await retryPage.waitForFunction(()=>window.CivilizationStartupCoordinator?.snapshot?.().status==="failed",{timeout:20000});
  assert.equal(await retryPage.locator("#backgroundPreloadRetry").isVisible(),true);
  assert.equal(await retryPage.evaluate(()=>document.body.classList.contains("background-preloading")),true);
  assert.notEqual(await retryPage.locator("#backgroundPreloadPercent").textContent(),"100%");
  assert.ok(!/GM|管理|診斷|admin/i.test(await retryPage.locator("#backgroundPreloadStatus").textContent()));
  await retryPage.locator("#backgroundPreloadRetry").click();
  await retryPage.waitForFunction(()=>window.CivilizationStartupCoordinator?.snapshot?.().status==="ready",{timeout:20000});
  assert.equal(await retryPage.evaluate(()=>document.body.classList.contains("background-preloading")),false);
  await retryPage.close();
  console.log("Startup readiness normal and transient retry browser smokes passed");
 }finally{await browser.close();}
})().catch(error=>{console.error(error?.stack||error);process.exit(1)});
