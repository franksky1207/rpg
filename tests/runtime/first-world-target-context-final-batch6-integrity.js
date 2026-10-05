const {chromium}=require("playwright");
const assert=require("assert");

(async()=>{
 const browser=await chromium.launch({headless:true});
 const page=await browser.newPage();
 const pageErrors=[];
 page.on("pageerror",e=>pageErrors.push(String(e?.stack||e?.message||e)));
 const url=process.env.RUNTIME_SMOKE_URL||"http://127.0.0.1:4173/index.html";
 try{
  await page.goto(url,{waitUntil:"domcontentloaded",timeout:30000});
  await page.waitForFunction(()=>window.FIRST_WORLD_TARGET_CONTEXT_BATCH6_VERSION===1&&window.FIRST_WORLD_TARGET_CONTEXT_FINAL_CLOSURE_VERSION===1,{timeout:30000});
  const report=await page.evaluate(async()=>{
   const deep=v=>JSON.parse(JSON.stringify(v));
   const originalState=deep(state),orig={selectedMap,selectedEnemy};
   const makeState=count=>{const s=deep(originalState);if(s.secondWorld)s.secondWorld.entered=false;if(s.thirdWorld)s.thirdWorld.entered=false;if(!s.reincarnation)s.reincarnation={};s.reincarnation.count=count;s.level=count>0?100:500;s.unlockedMap=99;s.mapProgress=Array.from({length:MAPS.length},()=>[10,10,10,10]);s.bossProgress=Array(MAPS.length).fill(10);s.bossLocked=Array(MAPS.length).fill(false);s.bossKilled=Array(MAPS.length).fill(false);return s;};
   try{
    state=makeState(1);selectedMap=9;selectedEnemy=4;window.clearPreparedFirstWorldTargetContext();
    const prepared=window.prepareFirstWorldTargetContext({mode:"rerun",mapIndex:9,enemyIndex:4,source:"batch6-final"},state);
    selectedMap=99;selectedEnemy=0;
    const resolved=window.firstWorldReincarnationExecutionTargetContext(state);
    const driftBefore=window.firstWorldTargetDriftSnapshot(prepared,state);
    const closureBefore=window.firstWorldTargetContextClosureSnapshot(state);
    const stateBefore=JSON.stringify(state);
    const selectionBefore={map:selectedMap,enemy:selectedEnemy};
    const missingAfterClear=(()=>{window.clearPreparedFirstWorldTargetContext();return window.firstWorldReincarnationExecutionTargetContext(state);})();
    const stateAfter=JSON.stringify(state),selectionAfter={map:selectedMap,enemy:selectedEnemy};

    window.prepareFirstWorldTargetContext({mode:"rerun",mapIndex:9,enemyIndex:4,source:"batch6-stale"},state);
    const stale=window.getPreparedFirstWorldTargetContext();
    state.reincarnation.count=2;
    const driftAfter=window.firstWorldTargetDriftSnapshot(stale,state);
    const staleResolved=window.firstWorldReincarnationExecutionTargetContext(state);

    state=makeState(0);window.clearPreparedFirstWorldTargetContext();
    const formal=window.prepareFirstWorldTargetContext({mode:"formal",mapIndex:4,enemyIndex:3,source:"batch6-formal"},state);
    const formalResolved=window.resolvePreparedFirstWorldExecutionTargetContext("formal",state,{policy:{formalRewardsAllowed:true,formalProgressAllowed:true}});
    const review=window.createFirstWorldTargetContext({mode:"review",mapIndex:7,enemyIndex:3,source:"batch6-review"},state);
    const reviewCheck=window.validateFirstWorldExecutionTargetContext(review,state,{mode:"review",policy:{formalRewardsAllowed:false,formalProgressAllowed:false}});

    const batch4=await (await fetch("firstworldtargetcontextbatch4.js",{cache:"no-store"})).text();
    const batch5=await (await fetch("firstworldtargetcontextbatch5.js",{cache:"no-store"})).text();
    const batch6=await (await fetch("firstworldtargetcontextbatch6.js",{cache:"no-store"})).text();
    const pipeline=await (await fetch("battlepipeline.js",{cache:"no-store"})).text();
    const minimal=await (await fetch("mainminimalmode.js",{cache:"no-store"})).text();
    return {
     versions:{batch6:window.FIRST_WORLD_TARGET_CONTEXT_BATCH6_VERSION,drift:window.FIRST_WORLD_TARGET_DRIFT_GUARD_VERSION,fallback:window.FIRST_WORLD_TARGET_FALLBACK_RETIREMENT_VERSION,closure:window.FIRST_WORLD_TARGET_CONTEXT_FINAL_CLOSURE_VERSION},
     rerun:{preparedId:prepared.contextId,resolvedId:resolved?.canonicalContext?.contextId,map:resolved?.mapIndex,enemy:resolved?.enemyIndex,driftBefore,missingAfterClear,staleDrift:driftAfter,staleResolved},
     formal:{preparedId:formal.contextId,resolvedId:formalResolved?.contextId},
     review:{passed:reviewCheck.passed,rewards:review.policy.formalRewardsAllowed,progress:review.policy.formalProgressAllowed},
     readOnly:{stateStable:stateBefore===stateAfter,selectionStable:JSON.stringify(selectionBefore)===JSON.stringify(selectionAfter),closure:closureBefore},
     source:{executionResolverNoSelection:!batch6.includes("selectedMap")&&!batch6.includes("selectedEnemy"),pipelineNoSelectionFallback:!pipeline.includes("monsterObj(selectedMap,selectedEnemy)"),minimalNoSelectionFallback:!minimal.includes("getPreviewEncounter(selectedMap,selectedEnemy)")&&!minimal.includes("monsterObj(selectedMap,selectedEnemy)"),offlineExplicitIdentity:batch5.includes("offline-persisted-identity"),specialParentBoundary:batch4.includes("parentTargetContext"),closureNoSave:!batch6.includes("save(")&&!batch6.includes("state.")}
    };
   }finally{window.clearPreparedFirstWorldTargetContext?.();state=originalState;selectedMap=orig.selectedMap;selectedEnemy=orig.selectedEnemy;}
  });
  console.log("Batch6 final diagnostic:",JSON.stringify(report));
  assert.deepEqual(report.versions,{batch6:1,drift:1,fallback:1,closure:1});
  assert.equal(report.rerun.resolvedId,report.rerun.preparedId);assert.equal(report.rerun.map,9);assert.equal(report.rerun.enemy,4);assert.equal(report.rerun.driftBefore.passed,true);
  assert.equal(report.rerun.missingAfterClear.valid,false);assert.equal(report.rerun.missingAfterClear.reason,"prepared-target-required");
  assert.equal(report.rerun.staleDrift.passed,false);assert.equal(report.rerun.staleResolved.valid,false);
  assert.equal(report.formal.resolvedId,report.formal.preparedId);
  assert.equal(report.review.passed,true);assert.equal(report.review.rewards,false);assert.equal(report.review.progress,false);
  assert.equal(report.readOnly.stateStable,true);assert.equal(report.readOnly.selectionStable,true);assert.equal(report.readOnly.closure.saveSchemaVersion,17);
  Object.entries(report.source).forEach(([k,v])=>assert.equal(v,true,`Batch6 source contract failed: ${k}`));
  assert.deepEqual(pageErrors,[],"Browser pageerror:\n"+pageErrors.join("\n\n"));
  console.log("First-world Target Context Batch6 final closure integrity passed");
 }finally{await browser.close();}
})().catch(e=>{console.error(e?.stack||e);process.exit(1);});