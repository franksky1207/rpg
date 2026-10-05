const {chromium}=require("playwright");
const assert=require("assert");

async function productionUrl(base){return base+(base.includes("?")?"&":"?")+"production=1";}
async function waitStory(page){await page.waitForFunction(()=>window.CivilizationScriptLoader?.snapshot?.().groups?.story?.status==="ready",{timeout:30000});}
async function waitGm(page){await page.waitForFunction(()=>window.CivilizationScriptLoader?.snapshot?.().groups?.gm?.status==="ready"&&typeof window.gmLevel==="function"&&typeof window.gmBackgroundBattleEnabled==="function",{timeout:30000});}

(async()=>{
 const browser=await chromium.launch({headless:true});
 const base=process.env.RUNTIME_SMOKE_URL||"http://127.0.0.1:4173/index.html";
 const url=await productionUrl(base);
 try{
  {
   const context=await browser.newContext();
   const page=await context.newPage();
   const pageErrors=[];
   page.on("pageerror",error=>pageErrors.push(String(error?.stack||error?.message||error)));
   await page.goto(url,{waitUntil:"load",timeout:30000});
   await waitStory(page);
   const before=await page.evaluate(()=>({
    loader:window.CivilizationScriptLoader?.snapshot?.()||null,
    activation:window.CivilizationScriptLoader?.activationSnapshot?.()||null,
    gmLevel:typeof window.gmLevel,
    gmBackground:typeof window.gmBackgroundBattleEnabled,
    finalIntegrity:!!window.CIVILIZATION_FINAL_INTEGRITY_REPORT,
    legacyEnsure:typeof window.ensureCivilizationScriptGroup,
    legacySnapshot:typeof window.civilizationScriptGroupSnapshot
   }));
   assert.equal(before.loader?.groups?.story?.status,"ready","Story 應維持 post-load sequenced。");
   assert.equal(before.loader?.groups?.gm?.status,"pending","gm:false 的一般玩家不應自動載入 GM。");
   assert.equal(before.loader?.groups?.integrity?.status,"pending","Production mode 不應自動載入 Integrity。");
   assert.equal(before.gmLevel,"undefined","一般玩家啟動時不應存在 GM implementation。");
   assert.equal(before.gmBackground,"undefined","一般玩家啟動時不應存在背景戰鬥 GM owner。");
   assert.equal(before.finalIntegrity,false,"Final Integrity 不應在一般玩家啟動時執行。");
   assert.deepEqual(before.activation,{version:2,behaviorVersion:3,story:"post-load-sequenced",gm:"authorized-save-or-password-modal-on-demand",integrity:"diagnostics-explicit-only",autoGroups:["story"],savedGmAuthorized:false});
   assert.equal(before.legacyEnsure,"function","舊 ensure alias 必須暫時保留相容。");
   assert.equal(before.legacySnapshot,"function","舊 snapshot alias 必須暫時保留相容。");

   await page.evaluate(()=>document.getElementById("passwordModal")?.classList.add("open"));
   await waitGm(page);
   const afterGm=await page.evaluate(()=>window.CivilizationScriptLoader.snapshot());
   assert.equal(afterGm.groups.gm.status,"ready","打開管理密碼視窗後 GM 應完成載入。");
   assert.equal(afterGm.groups.integrity.status,"pending","載入 GM 不得順帶載入 Integrity。");

   await page.evaluate(()=>window.CivilizationScriptLoader.ensure("integrity"));
   await page.waitForFunction(()=>window.CivilizationScriptLoader?.snapshot?.().groups?.integrity?.status==="ready"&&!!window.CIVILIZATION_FINAL_INTEGRITY_REPORT,{timeout:30000});
   const afterIntegrity=await page.evaluate(()=>({loader:window.CivilizationScriptLoader.snapshot(),final:window.CIVILIZATION_FINAL_INTEGRITY_REPORT||null}));
   assert.equal(afterIntegrity.loader.groups.integrity.status,"ready","Explicit diagnostics 應可載入 Integrity。");
   assert.equal(afterIntegrity.final?.passed,true,"Explicit Integrity 載入後 final report 必須通過。");
   assert.deepEqual(pageErrors,[],"Browser pageerror:\n"+pageErrors.join("\n\n"));
   await context.close();
  }

  {
   const context=await browser.newContext();
   const page=await context.newPage();
   await page.goto(url,{waitUntil:"load",timeout:30000});
   await waitStory(page);
   await page.evaluate(()=>{state.gm=true;save(false);});
   await page.reload({waitUntil:"load",timeout:30000});
   await waitGm(page);
   const restored=await page.evaluate(()=>({gm:state.gm,loader:window.CivilizationScriptLoader.snapshot(),activation:window.CivilizationScriptLoader.activationSnapshot(),backgroundOwner:typeof window.gmBackgroundBattleEnabled}));
   assert.equal(restored.gm,true,"首輪 reload 後 gm:true 必須保留。");
   assert.equal(restored.loader.groups.gm.status,"ready","首輪 gm:true reload 後 GM runtime 必須自動恢復。");
   assert.equal(restored.backgroundOwner,"function","首輪 gm:true reload 後背景戰鬥 GM owner 必須存在。");
   assert.equal(restored.activation.savedGmAuthorized,true,"Loader 必須辨識已授權 GM save。");
   await context.close();
  }

  {
   const context=await browser.newContext();
   const page=await context.newPage();
   await page.goto(url,{waitUntil:"load",timeout:30000});
   await waitStory(page);
   const beforeReset=await page.evaluate(()=>{
    state.gm=true;
    const result=window.applyReincarnationResetState(state,{requireEligible:false,currentTime:Date.now()});
    save(false);
    return {ok:result?.ok===true,gm:state.gm,count:state.reincarnation?.count||0};
   });
   assert.equal(beforeReset.ok,true,"轉生 reset fixture 應成功。");
   assert.equal(beforeReset.gm,true,"轉生 reset 不得清除 gm:true。");
   assert.ok(beforeReset.count>=1,"轉生 reset 應進入 rerun life。");
   await page.reload({waitUntil:"load",timeout:30000});
   await waitGm(page);
   const rerunRestored=await page.evaluate(()=>({gm:state.gm,count:state.reincarnation?.count||0,gmStatus:window.CivilizationScriptLoader.snapshot().groups.gm.status,backgroundOwner:typeof window.gmBackgroundBattleEnabled}));
   assert.equal(rerunRestored.gm,true,"轉生後 reload 仍須保留 gm:true。");
   assert.ok(rerunRestored.count>=1,"reload 後仍應是轉生後角色。");
   assert.equal(rerunRestored.gmStatus,"ready","轉生後 gm:true reload 必須自動恢復 GM runtime。");
   assert.equal(rerunRestored.backgroundOwner,"function","轉生後背景戰鬥 GM owner 必須自動恢復。");
   await context.close();
  }

  console.log("Code cleanup Batch7 lazy-loading + persisted GM restore integrity passed.");
 }finally{await browser.close();}
})().catch(error=>{console.error(error?.stack||error);process.exit(1);});
