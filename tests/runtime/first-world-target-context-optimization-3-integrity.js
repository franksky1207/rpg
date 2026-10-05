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
  await page.waitForFunction(()=>window.FIRST_WORLD_TARGET_LIFECYCLE_DELEGATE_VERSION===1&&window.FIRST_WORLD_TARGET_POLICY_GATE_VERSION===1&&window.FIRST_WORLD_REINCARNATION_LIFECYCLE_DELEGATE_VERSION===2&&window.FIRST_WORLD_REINCARNATION_LIFECYCLE_OWNER_CONVERGENCE_VERSION===1&&window.REINCARNATION_WORLD_RERUN_CONTEXT_OWNER_VERSION===1,{timeout:30000});
  const report=await page.evaluate(async()=>{
   const deep=value=>JSON.parse(JSON.stringify(value));
   const originalState=deep(state),originalSelection={map:selectedMap,enemy:selectedEnemy};
   const originalLifecycleOwner=window.worldReincarnationContext;
   try{
    if(state.secondWorld)state.secondWorld.entered=false;
    if(state.thirdWorld)state.thirdWorld.entered=false;
    if(!state.reincarnation)state.reincarnation={};
    state.reincarnation.count=0;
    selectedMap=4;selectedEnemy=3;
    window.clearPreparedFirstWorldTargetContext?.();

    const firstLife=window.firstWorldTargetLifecycleSnapshot(state);
    const formal=window.createFirstWorldTargetContext({mode:"formal",mapIndex:4,enemyIndex:3,source:"opt3-formal"},state);
    const boss=window.createFirstWorldTargetContext({mode:"formal",mapIndex:4,enemyIndex:4,source:"opt3-boss"},state);
    const review=window.createFirstWorldTargetContext({mode:"review",mapIndex:4,enemyIndex:3,source:"opt3-review"},state);
    const formalExec=window.validateFirstWorldExecutionTargetContext(formal,state,{mode:"formal",policy:{formalRewardsAllowed:true,formalProgressAllowed:true,offlineSampleAllowed:true}});
    const bossOffline=window.firstWorldTargetPolicyAllows(boss,{offlineSampleAllowed:true});
    const reviewFormal=window.firstWorldTargetPolicyAllows(review,{formalRewardsAllowed:true});

    state.reincarnation.count=1;
    const rerunLife=window.firstWorldTargetLifecycleSnapshot(state);
    const runtimeMode=window.resolveFirstWorldTargetRuntimeMode(state);
    const rerunUi=window.firstWorldReincarnationRerunContext(state);
    const rerunTarget=window.firstWorldReincarnationTargetContext(state);

    window.worldReincarnationContext=undefined;
    const missingLife=window.firstWorldTargetLifecycleSnapshot(state);
    const missingOwnerContext=window.createFirstWorldTargetContext({mode:"rerun",mapIndex:4,enemyIndex:3,source:"opt3-owner-missing"},state);
    const missingCurrent=window.validateCurrentFirstWorldTargetContext(missingOwnerContext,state);
    window.worldReincarnationContext=originalLifecycleOwner;

    const coreSource=await (await fetch("firstworldtargetcontext.js",{cache:"no-store"})).text();
    const rerunSource=await (await fetch("reincarnationrerunworld1.js",{cache:"no-store"})).text();
    const batch5Source=await (await fetch("firstworldtargetcontextbatch5.js",{cache:"no-store"})).text();
    const batch6Source=await (await fetch("firstworldtargetcontextbatch6.js",{cache:"no-store"})).text();
    return {
     versions:{lifecycle:window.FIRST_WORLD_TARGET_LIFECYCLE_DELEGATE_VERSION,policy:window.FIRST_WORLD_TARGET_POLICY_GATE_VERSION,rerunLifecycle:window.FIRST_WORLD_REINCARNATION_LIFECYCLE_DELEGATE_VERSION,rerunOwnerConvergence:window.FIRST_WORLD_REINCARNATION_LIFECYCLE_OWNER_CONVERGENCE_VERSION,sharedRerunOwner:window.REINCARNATION_WORLD_RERUN_CONTEXT_OWNER_VERSION,batch5Lifecycle:window.FIRST_WORLD_TARGET_CONTEXT_BATCH5_LIFECYCLE_DELEGATE_VERSION,batch5Policy:window.FIRST_WORLD_TARGET_CONTEXT_BATCH5_POLICY_GATE_VERSION,batch6Lifecycle:window.FIRST_WORLD_TARGET_CONTEXT_BATCH6_LIFECYCLE_DELEGATE_VERSION,batch6Policy:window.FIRST_WORLD_TARGET_CONTEXT_BATCH6_POLICY_GATE_VERSION},
     firstLife:{available:firstLife?.available,firstRun:firstLife?.firstRun,reincarnationRun:firstLife?.reincarnationRun,count:firstLife?.count,lifeId:firstLife?.lifeId},
     policies:{formalRewards:window.firstWorldTargetPolicy(formal)?.formalRewardsAllowed,formalOffline:window.firstWorldTargetPolicy(formal)?.offlineSampleAllowed,bossOffline,reviewFormal,formalExec:formalExec?.passed===true},
     rerun:{available:rerunLife?.available,reincarnationRun:rerunLife?.reincarnationRun,count:rerunLife?.count,lifeId:rerunLife?.lifeId,runtimeMode,uiActive:rerunUi?.active,uiSource:rerunUi?.source,targetAuthorized:rerunTarget?.authorized,targetCanonical:!!rerunTarget?.canonicalContext},
     missingOwner:{available:missingLife?.available,authorized:missingOwnerContext?.authorized,currentPassed:missingCurrent?.passed,errors:missingCurrent?.errors||[]},
     source:{coreDelegates:coreSource.includes('window.worldReincarnationContext')&&coreSource.includes('FIRST_WORLD_TARGET_LIFECYCLE_DELEGATE_VERSION'),rerunDelegates:rerunSource.includes('window.firstWorldTargetLifecycleSnapshot')&&rerunSource.includes('CivilizationReincarnation?.lifecycle?.worldRerunPolicy')&&!rerunSource.includes('function worldRerunPolicy(')&&!rerunSource.includes('window.worldRerunPolicy=')&&!rerunSource.includes('target?.reincarnation?.count'),batch5ModeOwner:batch5Source.includes('window.resolveFirstWorldTargetRuntimeMode')&&!batch5Source.includes('target?.reincarnation?.count'),batch5PolicyGate:batch5Source.includes('window.firstWorldTargetPolicyAllows'),batch6PolicyGate:batch6Source.includes('window.firstWorldTargetPolicyAllows'),batch6Lifecycle:batch6Source.includes('window.firstWorldTargetLifecycleSnapshot')&&!batch6Source.includes('target?.reincarnation?.count')}
    };
   }finally{
    window.worldReincarnationContext=originalLifecycleOwner;
    state=originalState;selectedMap=originalSelection.map;selectedEnemy=originalSelection.enemy;window.clearPreparedFirstWorldTargetContext?.();
   }
  });
  console.log("Target Context optimization 3 diagnostic:",JSON.stringify(report));
  assert.deepEqual(report.versions,{lifecycle:1,policy:1,rerunLifecycle:2,rerunOwnerConvergence:1,sharedRerunOwner:1,batch5Lifecycle:1,batch5Policy:1,batch6Lifecycle:1,batch6Policy:1});
  assert.deepEqual(report.firstLife,{available:true,firstRun:true,reincarnationRun:false,count:0,lifeId:0});
  assert.equal(report.policies.formalRewards,true);assert.equal(report.policies.formalOffline,true);assert.equal(report.policies.bossOffline,false);assert.equal(report.policies.reviewFormal,false);assert.equal(report.policies.formalExec,true);
  assert.equal(report.rerun.available,true);assert.equal(report.rerun.reincarnationRun,true);assert.equal(report.rerun.count,1);assert.equal(report.rerun.lifeId,1);assert.equal(report.rerun.runtimeMode,"rerun");assert.equal(report.rerun.uiActive,true);assert.equal(report.rerun.uiSource,"first-world-target-lifecycle");assert.equal(report.rerun.targetAuthorized,true);assert.equal(report.rerun.targetCanonical,true);
  assert.equal(report.missingOwner.available,false);assert.equal(report.missingOwner.authorized,false);assert.equal(report.missingOwner.currentPassed,false);assert.ok(report.missingOwner.errors.includes("lifecycle-owner-missing"));
  Object.entries(report.source).forEach(([name,value])=>assert.equal(value,true,`Optimization 3 source contract failed: ${name}`));
  assert.deepEqual(pageErrors,[],"Browser pageerror:\n"+pageErrors.join("\n\n"));
  console.log("First-world Target Context optimization 3 Batch5 lifecycle integrity passed:",JSON.stringify(report));
 }finally{await browser.close();}
})().catch(error=>{console.error(error?.stack||error);process.exit(1);});