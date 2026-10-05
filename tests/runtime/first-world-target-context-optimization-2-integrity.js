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
  await page.waitForFunction(()=>window.FIRST_WORLD_PREPARED_TARGET_SESSION_VERSION===1&&window.MAIN_BATTLE_TARGET_LOCK_OWNER_VERSION===1&&window.FIRST_WORLD_TARGET_CONTEXT_BATCH4_WRAPPER_RETIREMENT_VERSION===1,{timeout:30000});
  const report=await page.evaluate(async()=>{
   const deep=value=>JSON.parse(JSON.stringify(value));
   const originalState=deep(state),originalSelection={map:selectedMap,enemy:selectedEnemy};
   const formalSnapshot=target=>JSON.stringify({
    saveVersion:target?.saveVersion,
    level:target?.level,
    exp:target?.exp,
    gold:target?.gold,
    unlockedMap:target?.unlockedMap,
    mapProgress:target?.mapProgress,
    bossProgress:target?.bossProgress,
    bossLocked:target?.bossLocked,
    bossKilled:target?.bossKilled
   });
   try{
    if(state.secondWorld)state.secondWorld.entered=false;if(state.thirdWorld)state.thirdWorld.entered=false;if(!state.reincarnation)state.reincarnation={};state.reincarnation.count=0;state.level=100;
    selectedMap=4;selectedEnemy=3;window.clearPreparedFirstWorldTargetContext();
    const first=window.prepareFirstWorldTargetContextFromSelection({mode:"formal",source:"opt2-first"},state);
    const session1=window.getPreparedFirstWorldTargetSession();
    const formalBefore=formalSnapshot(state);
    const repeated=window.prepareFirstWorldTargetContextFromSelection({mode:"formal",source:"opt2-repeat"},state);
    const sessionRepeat=window.getPreparedFirstWorldTargetSession();
    const ctx=window.createMainBattleContext(1,first);
    const attempted=window.createFirstWorldTargetContext({mode:"formal",mapIndex:7,enemyIndex:0,source:"opt2-drift"},state);
    try{ctx.targetContext=attempted;}catch(_){ }
    selectedMap=7;selectedEnemy=0;
    const second=window.prepareFirstWorldTargetContextFromSelection({mode:"formal",source:"opt2-second"},state);
    const session2=window.getPreparedFirstWorldTargetSession();
    window.clearPreparedFirstWorldTargetContext();
    const fallback=window.resolveMainBattleTargetContext(null,null);
    const formalAfter=formalSnapshot(state);
    const runtimeOnly=!Object.prototype.hasOwnProperty.call(state,"preparedSession")&&!Object.prototype.hasOwnProperty.call(state,"preparedContext")&&!Object.prototype.hasOwnProperty.call(state,"targetContext")&&!Object.prototype.hasOwnProperty.call(state,"targetSessionId")&&!Object.prototype.hasOwnProperty.call(state,"contextId");
    const coreSource=await (await fetch("firstworldtargetcontext.js",{cache:"no-store"})).text();
    const pipelineSource=await (await fetch("battlepipeline.js",{cache:"no-store"})).text();
    const bridgeSource=await (await fetch("firstworldtargetcontextbatch4.js",{cache:"no-store"})).text();
    return {versions:{session:window.FIRST_WORLD_PREPARED_TARGET_SESSION_VERSION,lock:window.MAIN_BATTLE_TARGET_LOCK_OWNER_VERSION,sessionBinding:window.MAIN_BATTLE_PREPARED_SESSION_BINDING_VERSION,uiFallbackRetired:window.MAIN_BATTLE_UI_SELECTION_FALLBACK_RETIRED_VERSION,wrapperRetired:window.FIRST_WORLD_TARGET_CONTEXT_BATCH4_WRAPPER_RETIREMENT_VERSION},first:{contextId:first?.contextId,sessionId:session1?.sessionId,sessionContextId:session1?.contextId},repeat:{sameContext:repeated?.contextId===first?.contextId,sameSession:sessionRepeat?.sessionId===session1?.sessionId},battle:{targetId:ctx.targetContext?.contextId,targetSessionId:ctx.targetSessionId,immutable:ctx.targetContext?.contextId===first?.contextId},second:{contextId:second?.contextId,sessionId:session2?.sessionId,newContext:second?.contextId!==first?.contextId,newSession:session2?.sessionId!==session1?.sessionId},fallbackNull:fallback===null,formalStable:formalBefore===formalAfter,runtimeOnly,saveSchema:Number(window.SAVE_SCHEMA_VERSION)||Number(state?.saveVersion)||0,source:{sessionOwner:coreSource.includes("let preparedSession=null")&&coreSource.includes("getPreparedFirstWorldTargetSession"),sessionOwnerNoSaveCall:!coreSource.includes("save("),sessionOwnerNoStateAssignment:!coreSource.includes("state.preparedSession")&&!coreSource.includes("state.targetContext"),noLegacyEntry:!pipelineSource.includes("battle-pipeline-legacy-entry"),pipelineOwnsLock:pipelineSource.includes('Object.defineProperty(ctx,"targetContext"'),bridgeNoRunWrapper:!bridgeSource.includes("window.runBattles="),bridgeNoSpecialWrapper:!bridgeSource.includes("window.maybeHandleSpecialEncounter=")}};
   }finally{state=originalState;selectedMap=originalSelection.map;selectedEnemy=originalSelection.enemy;window.clearPreparedFirstWorldTargetContext?.();}
  });
  console.log("Target Context optimization 2 diagnostic:",JSON.stringify(report));
  assert.deepEqual(report.versions,{session:1,lock:1,sessionBinding:1,uiFallbackRetired:1,wrapperRetired:1});
  assert.equal(report.first.sessionContextId,report.first.contextId);assert.equal(report.repeat.sameContext,true);assert.equal(report.repeat.sameSession,true);
  assert.equal(report.battle.targetId,report.first.contextId);assert.equal(report.battle.targetSessionId,report.first.sessionId);assert.equal(report.battle.immutable,true);
  assert.equal(report.second.newContext,true);assert.equal(report.second.newSession,true);assert.equal(report.fallbackNull,true);
  assert.equal(report.formalStable,true);assert.equal(report.runtimeOnly,true);assert.equal(report.saveSchema,17);
  Object.entries(report.source).forEach(([name,value])=>assert.equal(value,true,`Optimization 2 source contract failed: ${name}`));
  assert.deepEqual(pageErrors,[],"Browser pageerror:\n"+pageErrors.join("\n\n"));
  console.log("First-world Target Context optimization 2 integrity passed:",JSON.stringify(report));
 }finally{await browser.close();}
})().catch(error=>{console.error(error?.stack||error);process.exit(1);});