const {chromium}=require("playwright");
const assert=require("assert");

(async()=>{
 const browser=await chromium.launch({headless:true});
 const page=await browser.newPage();
 const pageErrors=[];
 page.on("pageerror",error=>pageErrors.push(String(error?.stack||error?.message||error)));
 const base=process.env.RUNTIME_SMOKE_URL||"http://127.0.0.1:4173/index.html";
 const url=base+(base.includes("?")?"&":"?")+"production=1";
 try{
  await page.goto(url,{waitUntil:"load",timeout:30000});
  await page.waitForFunction(()=>window.CivilizationScriptLoader?.snapshot?.().groups?.story?.status==="ready",{timeout:30000});
  const before=await page.evaluate(()=>({
   loader:window.CivilizationScriptLoader?.snapshot?.()||null,
   activation:window.CivilizationScriptLoader?.activationSnapshot?.()||null,
   gmLevel:typeof window.gmLevel,
   finalIntegrity:!!window.CIVILIZATION_FINAL_INTEGRITY_REPORT,
   legacyEnsure:typeof window.ensureCivilizationScriptGroup,
   legacySnapshot:typeof window.civilizationScriptGroupSnapshot
  }));
  assert.equal(before.loader?.groups?.story?.status,"ready","Story 應維持 post-load sequenced。");
  assert.equal(before.loader?.groups?.gm?.status,"pending","Production mode 不應自動載入 GM。");
  assert.equal(before.loader?.groups?.integrity?.status,"pending","Production mode 不應自動載入 Integrity。");
  assert.equal(before.gmLevel,"undefined","GM implementation 不應在一般玩家啟動時存在。");
  assert.equal(before.finalIntegrity,false,"Final Integrity 不應在一般玩家啟動時執行。");
  assert.deepEqual(before.activation,{version:1,behaviorVersion:2,story:"post-load-sequenced",gm:"password-modal-on-demand",integrity:"diagnostics-explicit-only",autoGroups:["story"]});
  assert.equal(before.legacyEnsure,"function","舊 ensure alias 必須暫時保留相容。");
  assert.equal(before.legacySnapshot,"function","舊 snapshot alias 必須暫時保留相容。");

  await page.evaluate(()=>document.getElementById("passwordModal")?.classList.add("open"));
  await page.waitForFunction(()=>window.CivilizationScriptLoader?.snapshot?.().groups?.gm?.status==="ready"&&typeof window.gmLevel==="function",{timeout:30000});
  const afterGm=await page.evaluate(()=>window.CivilizationScriptLoader.snapshot());
  assert.equal(afterGm.groups.gm.status,"ready","打開管理密碼視窗後 GM 應完成載入。");
  assert.equal(afterGm.groups.integrity.status,"pending","載入 GM 不得順帶載入 Integrity。");

  await page.evaluate(()=>window.CivilizationScriptLoader.ensure("integrity"));
  await page.waitForFunction(()=>window.CivilizationScriptLoader?.snapshot?.().groups?.integrity?.status==="ready"&&!!window.CIVILIZATION_FINAL_INTEGRITY_REPORT,{timeout:30000});
  const afterIntegrity=await page.evaluate(()=>({loader:window.CivilizationScriptLoader.snapshot(),final:window.CIVILIZATION_FINAL_INTEGRITY_REPORT||null}));
  assert.equal(afterIntegrity.loader.groups.integrity.status,"ready","Explicit diagnostics 應可載入 Integrity。");
  assert.equal(afterIntegrity.final?.passed,true,"Explicit Integrity 載入後 final report 必須通過。");
  assert.deepEqual(pageErrors,[],"Browser pageerror:\n"+pageErrors.join("\n\n"));
  console.log("Code cleanup Batch7 production lazy-loading integrity passed:",JSON.stringify({before:before.loader,afterGm,afterIntegrity:afterIntegrity.loader}));
 }finally{await browser.close();}
})().catch(error=>{console.error(error?.stack||error);process.exit(1);});
