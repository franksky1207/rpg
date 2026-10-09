const {chromium}=require("playwright");
const assert=require("node:assert/strict");
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  const base=process.env.RUNTIME_SMOKE_URL||"http://127.0.0.1:4173/index.html";
  const context=await browser.newContext();
  // Mock Supabase session only; the actual script loader, 32 GM files and startup screen are unmodified.
  await context.route("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js",route=>route.fulfill({status:200,contentType:"application/javascript",body:`window.supabase={createClient(){return{auth:{onAuthStateChange(){return{data:{subscription:{unsubscribe(){}}}}},async getSession(){return{data:{session:{user:{id:"test-gm-boot"}}},error:null}}},from(){return{select(){return this},eq(){return this},single(){return Promise.resolve({data:null,error:null})}}}}}};`}));
  await context.addInitScript(()=>localStorage.setItem("civilization-war-gm-authorized-v2-account-test-gm-boot","1"));
  const page=await context.newPage();
  const errors=[];page.on("pageerror",e=>errors.push(String(e)));
  await page.goto(base,{waitUntil:"domcontentloaded",timeout:30000});
  await page.waitForFunction(()=>window.CivilizationStartupCoordinator?.snapshot().status==="ready",{timeout:60000});
  const first=await page.evaluate(()=>({gm:window.CivilizationScriptLoader.snapshot().groups.gm,status:window.CivilizationStartupCoordinator.snapshot().status,flag:state.gm,loaded:typeof window.gmHtml==="function",screen:document.body.classList.contains("background-preloading"),percent:document.querySelector("#backgroundPreloadPercent")?.textContent,version:window.GM_STARTUP_REVALIDATION_VERSION,ui:document.querySelector("#backgroundPreloadStatus")?.textContent}));
  assert.equal(first.gm.status,"ready","Authorized GM must complete all scripts before reveal");
  assert.equal(first.gm.loaded,32);
  assert.equal(first.loaded,true);assert.equal(first.flag,true);
  assert.equal(first.screen,false);assert.equal(first.status,"ready");assert.equal(first.version,1);
  assert.ok(!/GM|管理|診斷|admin/i.test(first.ui||""));
  await page.reload({waitUntil:"domcontentloaded"});
  await page.waitForFunction(()=>window.CivilizationStartupCoordinator?.snapshot().status==="ready",{timeout:60000});
  assert.equal(await page.evaluate(()=>window.CivilizationScriptLoader.snapshot().groups.gm.status),"ready");
  assert.deepEqual(errors,[]);
  await context.close();
  const ordinary=await browser.newContext();
  await ordinary.route("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js",route=>route.fulfill({status:200,contentType:"application/javascript",body:`window.supabase={createClient(){return{auth:{onAuthStateChange(){return{}},async getSession(){return{data:{session:{user:{id:"ordinary"}}},error:null}}}}}};`}));
  const normalPage=await ordinary.newPage();
  await normalPage.goto(base,{waitUntil:"domcontentloaded",timeout:30000});
  await normalPage.waitForFunction(()=>window.CivilizationStartupCoordinator?.snapshot().status==="ready",{timeout:30000});
  assert.equal(await normalPage.evaluate(()=>window.CivilizationScriptLoader.snapshot().groups.gm.status),"pending");
  await ordinary.close();
  console.log("Authorized GM gated boot, reload and ordinary account bypass passed");
 }finally{await browser.close();}
})().catch(e=>{console.error(e.stack||e);process.exit(1)});
