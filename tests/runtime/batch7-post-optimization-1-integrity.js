const {chromium}=require("playwright");
const assert=require("assert");
const fs=require("fs");

(async()=>{
 const gmBreakthroughSource=fs.readFileSync("gmbreakthroughmanage.js","utf8");
 assert.ok(gmBreakthroughSource.includes("rebuildBreakthroughFromPermanentTotal"),"GM breakthrough management must delegate canonical rebuild to the formal breakthrough owner.");
 assert.ok(!gmBreakthroughSource.includes("target.reincarnation.count="),"GM breakthrough management must not directly derive/write reincarnation count.");
 assert.ok(!gmBreakthroughSource.includes("target.reincarnation.breakthrough={"),"GM breakthrough management must not maintain a second milestone rebuild implementation.");

 const browser=await chromium.launch({headless:true});
 const page=await browser.newPage();
 const pageErrors=[];
 page.on("pageerror",error=>pageErrors.push(String(error?.stack||error?.message||error)));
 const url=process.env.RUNTIME_SMOKE_URL||"http://127.0.0.1:4173/index.html";
 try{
  await page.goto(url,{waitUntil:"domcontentloaded",timeout:30000});
  await page.waitForFunction(()=>window.BREAKTHROUGH_CANONICAL_REBUILD_VERSION===1&&window.GM_FORMAL_ENHANCEMENT_TRANSACTION_VERSION===2&&window.GM_BREAKTHROUGH_CANONICAL_REBUILD_VERSION===2&&typeof window.gmCommitFormalEnhancementMutation==="function",{timeout:30000});
  const report=await page.evaluate(()=>{
   const clone=value=>JSON.parse(JSON.stringify(value));
   const milestones=()=>Object.fromEntries((window.BREAKTHROUGH_MILESTONE_LEVELS||[]).map(level=>[String(level),false]));
   const fixture=(count,total=0)=>({saveVersion:17,level:500,exp:0,hp:100,secondWorld:{entered:false},thirdWorld:{entered:false},reincarnation:{count,breakthrough:{permanent:total,milestoneLifeId:count,milestones:milestones()},alternateUniverse:{unlocked:true,deepestCleared:40,activeAttempt:{lifeId:count,depth:41,attemptId:"post-opt",traits:["strong","swift"]},lifeFailures:{lifeId:count,failures:{"41":3}}}}});
   const plans=[0,1,10,11,20,25,30,31].map(total=>window.breakthroughPlanFromPermanentTotal(total));
   const rebuildTarget=fixture(2,20),rebuilt=window.rebuildBreakthroughFromPermanentTotal(25,rebuildTarget);
   const rebuildSnapshot=clone(rebuildTarget.reincarnation);
   const sameLife=fixture(3,25),sameLifeAttempt=clone(sameLife.reincarnation.alternateUniverse),sameLifeResult=window.rebuildBreakthroughFromPermanentTotal(27,sameLife),sameLifeAfter=clone(sameLife.reincarnation.alternateUniverse);
   const first=fixture(0,0),firstBefore=JSON.stringify(first),firstResult=window.rebuildBreakthroughFromPermanentTotal(5,first),firstStable=firstBefore===JSON.stringify(first);
   const gmPlan=window.gmBreakthroughManagementPlan(25);

   const originalState=state,originalSave=window.save;
   const slots=Array.from(window.ENHANCEMENT_SLOTS||[]);
   const levels=value=>Object.fromEntries(slots.map(type=>[type,value]));
   const makeFormal=()=>{const s=newState();s.level=500;s.secondWorld.entered=false;s.thirdWorld.entered=false;s.enhancement.levels=levels(0);return s;};
   let success=null,failed=null,exception=null,successState=null,failedStable=false,exceptionStable=false,successSaveCalls=0,failedSaveCalls=0,exceptionSaveCalls=0;
   try{
    state=makeFormal();
    window.save=()=>{successSaveCalls++;return true;};
    success=window.gmCommitFormalEnhancementMutation(levels(20));
    successState=clone(state.enhancement.levels);

    state=makeFormal();const beforeFailed=JSON.stringify(state);
    window.save=()=>{failedSaveCalls++;return false;};
    failed=window.gmCommitFormalEnhancementMutation(levels(10));
    failedStable=beforeFailed===JSON.stringify(state);

    state=makeFormal();const beforeException=JSON.stringify(state);
    window.save=()=>{exceptionSaveCalls++;throw new Error("post-opt-save-exception");};
    exception=window.gmCommitFormalEnhancementMutation(levels(15));
    exceptionStable=beforeException===JSON.stringify(state);
   }finally{state=originalState;window.save=originalSave;}
   return {schema:window.SAVE_SCHEMA_VERSION,breakthroughCore:window.BREAKTHROUGH_CORE_INTEGRITY,gmBreakthrough:window.GM_BREAKTHROUGH_MANAGEMENT_INTEGRITY,formalTx:window.GM_FORMAL_TRANSACTION_INTEGRITY,plans,rebuilt,rebuildSnapshot,sameLifeResult,sameLifeAttempt,sameLifeAfter,firstResult,firstStable,gmPlan,enhancement:{slots,success,successState,successSaveCalls,failed,failedStable,failedSaveCalls,exception,exceptionStable,exceptionSaveCalls,uiTransactionVersion:window.gmApplyEnhancementLevels?.__gmFormalTransactionVersion||0}};
  });

  assert.equal(report.schema,17,"Optimization must not bump save schema.");
  assert.equal(report.breakthroughCore.passed,true,"Breakthrough core self-integrity failed: "+JSON.stringify(report.breakthroughCore.errors||null));
  assert.equal(report.gmBreakthrough.passed,true,"GM breakthrough self-integrity failed: "+JSON.stringify(report.gmBreakthrough.errors||null));
  assert.equal(report.formalTx.passed,true,"GM formal transaction self-integrity failed: "+JSON.stringify(report.formalTx.errors||null));
  assert.deepEqual(report.plans.map(row=>[row.total,row.count,row.currentLife]),[[0,1,0],[1,1,1],[10,1,10],[11,2,1],[20,2,10],[25,3,5],[30,3,10],[31,4,1]]);
  assert.deepEqual([report.gmPlan.total,report.gmPlan.count,report.gmPlan.currentLife],[25,3,5],"GM must expose the formal owner's B25 plan.");
  assert.equal(report.rebuilt.ok,true);assert.equal(report.rebuildSnapshot.count,3);assert.equal(report.rebuildSnapshot.breakthrough.permanent,25);assert.equal(report.rebuildSnapshot.breakthrough.milestoneLifeId,3);
  assert.equal(Object.values(report.rebuildSnapshot.breakthrough.milestones).filter(Boolean).length,5);
  assert.equal(report.rebuildSnapshot.alternateUniverse.deepestCleared,40);assert.equal(report.rebuildSnapshot.alternateUniverse.activeAttempt,null);assert.deepEqual(report.rebuildSnapshot.alternateUniverse.lifeFailures,{lifeId:3,failures:{}});
  assert.equal(report.sameLifeResult.ok,true);assert.deepEqual(report.sameLifeAfter,report.sameLifeAttempt,"Changing breakthrough total within the same derived life must preserve AU current-life attempt/failures, matching existing semantics.");
  assert.equal(report.firstResult.reason,"first-run-locked");assert.equal(report.firstStable,true);

  assert.equal(report.enhancement.uiTransactionVersion,1,"Live GM enhancement UI handler must be owned by the formal transaction layer.");
  assert.equal(report.enhancement.success.ok,true);assert.equal(report.enhancement.success.saved,true);assert.equal(report.enhancement.successSaveCalls,1);assert.equal(report.enhancement.slots.every(type=>report.enhancement.successState[type]===20),true);
  assert.equal(report.enhancement.failed.ok,false);assert.equal(report.enhancement.failed.reason,"save-failed");assert.equal(report.enhancement.failed.rolledBack,true);assert.equal(report.enhancement.failedStable,true);assert.equal(report.enhancement.failedSaveCalls,1);
  assert.equal(report.enhancement.exception.ok,false);assert.equal(report.enhancement.exception.reason,"save-exception");assert.equal(report.enhancement.exception.rolledBack,true);assert.equal(report.enhancement.exceptionStable,true);assert.equal(report.enhancement.exceptionSaveCalls,1);
  assert.deepEqual(pageErrors,[],"Browser pageerror:\n"+pageErrors.join("\n\n"));
  console.log("Batch7 post-optimization 1 integrity passed:",JSON.stringify({plans:report.plans,enhancement:{success:report.enhancement.success,failed:report.enhancement.failed,exception:report.enhancement.exception}}));
 }finally{await browser.close();}
})().catch(error=>{console.error(error?.stack||error);process.exit(1);});