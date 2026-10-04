const {chromium}=require("playwright");
const assert=require("assert");

(async()=>{
 const browser=await chromium.launch({headless:true});
 const page=await browser.newPage();
 const pageErrors=[];
 page.on("pageerror",error=>pageErrors.push(String(error?.stack||error?.message||error)));
 const url=process.env.RUNTIME_SMOKE_URL||"http://127.0.0.1:4173/index.html";
 try{
  await page.goto(url,{waitUntil:"domcontentloaded",timeout:30000});
  await page.waitForFunction(()=>window.GM_ALTERNATE_UNIVERSE_MANAGEMENT_VERSION===2&&window.GM_ALTERNATE_UNIVERSE_MANAGEMENT_INTEGRITY?.passed===true&&typeof window.gmCommitFormalAlternateUniverseProgress==="function",{timeout:30000});
  const report=await page.evaluate(()=>{
   const fixture=()=>({
    saveVersion:17,level:1,exp:0,hp:100,vipLevel:0,vipPoints:0,equipment:{},enhancement:{levels:{}},secondWorld:{entered:false},thirdWorld:{entered:false},
    reincarnation:{count:2,breakthrough:{permanent:20,milestoneLifeId:2,milestones:{}},alternateUniverse:{unlocked:true,deepestCleared:37,activeAttempt:{lifeId:2,depth:38,attemptId:"batch7-3",traits:["strong","swift"]},lifeFailures:{lifeId:2,failures:{"38":4,"50":2}}}}
   });
   const lockedFixture=()=>({
    saveVersion:17,level:1,exp:0,hp:100,vipLevel:0,vipPoints:0,equipment:{},enhancement:{levels:{}},secondWorld:{entered:false},thirdWorld:{entered:false},
    reincarnation:{count:2,breakthrough:{permanent:20,milestoneLifeId:2,milestones:{}},alternateUniverse:{unlocked:false,deepestCleared:0,activeAttempt:null,lifeFailures:{lifeId:2,failures:{}}}}
   });
   const direct=fixture();
   const before=window.gmAlternateUniverseFormalSnapshot(direct);
   const preview=window.gmAlternateUniverseProgressPlan({deepestCleared:150},direct);
   const applied=window.gmApplyFormalAlternateUniverseProgress({deepestCleared:150},direct);
   const after=window.gmAlternateUniverseFormalSnapshot(direct);
   const zero=window.gmApplyFormalAlternateUniverseProgress({deepestCleared:0},direct);
   const afterZero=window.gmAlternateUniverseFormalSnapshot(direct);
   const locked=lockedFixture();
   const lockedZero=window.gmApplyFormalAlternateUniverseProgress({deepestCleared:0},locked);
   const afterLockedZero=window.gmAlternateUniverseFormalSnapshot(locked);
   const forced=window.gmApplyFormalAlternateUniverseProgress({deepestCleared:12},locked);
   const afterForced=window.gmAlternateUniverseFormalSnapshot(locked);
   const invalidTarget=fixture(),invalidBefore=JSON.stringify(invalidTarget),invalid=window.gmApplyFormalAlternateUniverseProgress({deepestCleared:1001},invalidTarget),invalidExact=invalidBefore===JSON.stringify(invalidTarget);

   const registered=typeof window.gmHubRegisteredSectionIds==="function"?window.gmHubRegisteredSectionIds("manage"):[];
   const html=window.gmAlternateUniverseManagementHtml();

   const originalState=state,originalSave=window.save,originalRender=window.render;
   let failedTx=null,failedExact=false,successTx=null,saveCalls=0,successSnapshot=null;
   try{
    state=fixture();
    const rollbackBefore=JSON.stringify(state);
    window.save=()=>{saveCalls++;return false;};
    window.render=()=>{};
    failedTx=window.gmCommitFormalAlternateUniverseProgress({deepestCleared:222});
    failedExact=rollbackBefore===JSON.stringify(state);
    saveCalls=0;
    window.save=()=>{saveCalls++;return true;};
    successTx=window.gmCommitFormalAlternateUniverseProgress({deepestCleared:222});
    successSnapshot=window.gmAlternateUniverseFormalSnapshot(state);
   }finally{
    state=originalState;window.save=originalSave;window.render=originalRender;
   }
   return {versions:{manage:window.GM_ALTERNATE_UNIVERSE_MANAGEMENT_VERSION,canonical:window.GM_ALTERNATE_UNIVERSE_CANONICAL_MUTATION_VERSION,transaction:window.GM_ALTERNATE_UNIVERSE_TRANSACTION_VERSION},self:window.GM_ALTERNATE_UNIVERSE_MANAGEMENT_INTEGRITY,before,preview,applied,after,zero,afterZero,lockedZero,afterLockedZero,forced,afterForced,invalid,invalidExact,registered,html,failedTx,failedExact,successTx,saveCalls,successSnapshot};
  });

  assert.equal(report.self.passed,true,"Batch7-3 self-integrity failed: "+JSON.stringify(report.self.errors||null));
  assert.deepEqual(report.versions,{manage:2,canonical:2,transaction:1});
  assert.equal(report.before.deepestCleared,37);
  assert.equal(report.before.frontier,38);
  assert.equal(report.before.activeAttempt.depth,38);
  assert.deepEqual(report.before.failures,{"38":4,"50":2});
  assert.equal(report.preview.ok,true);
  assert.equal(report.preview.deepestCleared,150);
  assert.equal(report.preview.frontier,151);
  assert.equal(report.preview.clearsActiveAttempt,true);
  assert.equal(report.preview.resetsLifeFailures,true);
  assert.equal(report.applied.ok,true);
  assert.equal(report.after.unlocked,true);
  assert.equal(report.after.deepestCleared,150);
  assert.equal(report.after.frontier,151);
  assert.equal(report.after.activeAttempt,null);
  assert.deepEqual(report.after.failures,{});
  assert.equal(report.after.lifeId,2);
  assert.equal(report.zero.ok,true);
  assert.equal(report.afterZero.unlocked,true,"Setting progress to 0 must not silently relock an already unlocked AU.");
  assert.equal(report.afterZero.deepestCleared,0);
  assert.equal(report.afterZero.frontier,1);
  assert.equal(report.lockedZero.ok,true);
  assert.equal(report.afterLockedZero.unlocked,false,"A locked AU at 0 progress must remain locked when only progress is managed.");
  assert.equal(report.afterLockedZero.deepestCleared,0);
  assert.equal(report.afterLockedZero.frontier,null);
  assert.equal(report.forced.ok,true);
  assert.equal(report.afterForced.unlocked,true,"Positive deepest progress must canonically imply AU unlocked.");
  assert.equal(report.afterForced.deepestCleared,12);
  assert.equal(report.afterForced.frontier,13);
  assert.equal(report.invalid.ok,false);
  assert.equal(report.invalid.reason,"invalid-depth");
  assert.equal(report.invalidExact,true,"Invalid formal AU mutation must not alter target state.");
  assert.ok(report.registered.includes("alternate-universe-manage"),"GM AU management section must register through the GM hub registry.");
  assert.ok(report.html.includes("異宇宙管理")||report.html.includes("正式異宇宙狀態"));
  assert.ok(report.html.includes("層域"),"GM AU UI must use player-facing 層域 terminology.");
  assert.ok(!report.html.includes("gmAlternateUniverseUnlocked"),"GM AU management must not expose a separate unlock selector.");
  assert.ok(!report.html.includes("<select"),"GM AU progress control should stay simple and avoid a redundant unlock dropdown.");
  assert.ok(!report.html.includes("1000U")&&!/\bU\d+\b/.test(report.html),"GM AU UI must not expose internal U shorthand.");
  assert.equal(report.failedTx.ok,false,"save(false) must fail the AU GM transaction.");
  assert.equal(report.failedTx.rolledBack,true,"save(false) must roll back the AU GM transaction.");
  assert.equal(report.failedExact,true,"save(false) rollback must restore exact AU formal state.");
  assert.equal(report.successTx.ok,true);
  assert.equal(report.successTx.saved,true);
  assert.equal(report.saveCalls,1,"Successful AU formal mutation must save exactly once.");
  assert.equal(report.successSnapshot.deepestCleared,222);
  assert.equal(report.successSnapshot.frontier,223);
  assert.equal(report.successSnapshot.activeAttempt,null);
  assert.deepEqual(report.successSnapshot.failures,{});
  assert.deepEqual(pageErrors,[],"Browser pageerror:\n"+pageErrors.join("\n\n"));
  console.log("GM alternate universe Batch7-3 integrity passed:",JSON.stringify({versions:report.versions,before:report.before,after:report.after,afterZero:report.afterZero,afterLockedZero:report.afterLockedZero,afterForced:report.afterForced,success:report.successSnapshot}));
 }finally{await browser.close();}
})().catch(error=>{console.error(error?.stack||error);process.exit(1);});
