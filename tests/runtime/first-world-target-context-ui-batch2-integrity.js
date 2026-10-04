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
  await page.waitForFunction(()=>window.FIRST_WORLD_TARGET_CONTEXT_VERSION===1&&window.FIRST_WORLD_PREPARED_TARGET_CONTEXT_VERSION===1&&window.FIRST_WORLD_TARGET_ENCOUNTER_BRIDGE_VERSION===1&&window.FIRST_WORLD_TARGET_UI_PREPARE_BRIDGE_VERSION===1&&window.FIRST_WORLD_TARGET_CONTEXT_INTEGRITY?.passed===true,{timeout:30000});
  const report=await page.evaluate(()=>{
   const deep=value=>JSON.parse(JSON.stringify(value));
   const originalState=deep(state),originalUi={selectedMap,selectedEnemy,selectedBattleCount,adventureScreen,currentCombatEncounter},originalRender=render,originalRunBattles=runBattles;
   const makeFirstWorldState=count=>{
    const s=deep(originalState);
    if(s.secondWorld&&typeof s.secondWorld==="object")s.secondWorld.entered=false;
    if(s.thirdWorld&&typeof s.thirdWorld==="object")s.thirdWorld.entered=false;
    if(!s.reincarnation||typeof s.reincarnation!=="object")s.reincarnation={};
    s.reincarnation.count=count;
    s.level=500;
    s.unlockedMap=99;
    s.mapProgress=Array.from({length:MAPS.length},()=>[10,10,10,10]);
    s.bossProgress=Array(MAPS.length).fill(10);
    s.bossLocked=Array(MAPS.length).fill(false);
    s.bossKilled=Array(MAPS.length).fill(false);
    return s;
   };
   try{
    render=()=>{};
    state=makeFirstWorldState(0);selectedMap=4;selectedEnemy=3;selectedBattleCount=1;adventureScreen="prepare";
    window.clearPreparedFirstWorldTargetContext();
    const htmlA=adventurePreparePage();
    const preparedA=window.getPreparedFirstWorldTargetContext();
    const htmlB=adventurePreparePage();
    const preparedB=window.getPreparedFirstWorldTargetContext();
    const samePrepareId=preparedA?.contextId===preparedB?.contextId;
    const encounterA=window.firstWorldEncounterFromTargetContext(preparedA,{preview:true});
    const expectedA=monsterObj(4,3);

    selectEnemy(4);
    const preparedAfterSelect=window.getPreparedFirstWorldTargetContext();
    const htmlC=adventurePreparePage();
    const preparedC=window.getPreparedFirstWorldTargetContext();

    window.clearPreparedFirstWorldTargetContext();
    selectedMap=7;selectedEnemy=3;
    const explicitPrepared=window.prepareFirstWorldTargetContextFromSelection({mode:"formal",source:"batch2-begin"},state);
    selectedMap=1;selectedEnemy=0;
    let runCall=null;runBattles=count=>{runCall={count,map:selectedMap,enemy:selectedEnemy};};
    currentCombatEncounter=null;
    const beginOk=beginCombat(1);
    const beginEncounter=currentCombatEncounter?{name:currentCombatEncounter.name,level:currentCombatEncounter.level,kind:currentCombatEncounter.kind}:null;
    const expectedPreparedEncounter=monsterObj(explicitPrepared.mapIndex,explicitPrepared.enemyIndex);
    const beginUiCursorAfter={map:selectedMap,enemy:selectedEnemy};

    state=makeFirstWorldState(2);selectedMap=99;selectedEnemy=4;adventureScreen="prepare";window.clearPreparedFirstWorldTargetContext();
    const rerunHtml=adventurePreparePage();
    const rerunPrepared=window.getPreparedFirstWorldTargetContext();

    window.setGalaxyReviewSelectedMap?.(6);window.setGalaxyReviewSelectedEnemy?.(3);window.clearPreparedFirstWorldTargetContext();
    const reviewHtml=galaxyReviewPreparePage();
    const reviewPrepared=window.getPreparedFirstWorldTargetContext();
    const reviewHtml2=galaxyReviewPreparePage();
    const reviewPrepared2=window.getPreparedFirstWorldTargetContext();

    const invalid=window.prepareFirstWorldTargetContext({mode:"formal",mapIndex:-1,enemyIndex:99,source:"batch2-invalid"},makeFirstWorldState(0));
    const invalidEncounter=window.firstWorldEncounterFromTargetContext(invalid,{preview:true});

    return {
     versions:{context:window.FIRST_WORLD_TARGET_CONTEXT_VERSION,prepared:window.FIRST_WORLD_PREPARED_TARGET_CONTEXT_VERSION,encounter:window.FIRST_WORLD_TARGET_ENCOUNTER_BRIDGE_VERSION,ui:window.FIRST_WORLD_TARGET_UI_PREPARE_BRIDGE_VERSION},
     self:window.FIRST_WORLD_TARGET_CONTEXT_INTEGRITY,
     install:window.FIRST_WORLD_TARGET_UI_BRIDGE_INSTALL_REPORT,
     formal:{preparedA,preparedB,samePrepareId,htmlHasTarget:htmlA.includes(expectedA.name),repeatHtmlStable:htmlA===htmlB,encounter:{name:encounterA?.name,level:encounterA?.level,kind:encounterA?.kind},expected:{name:expectedA.name,level:expectedA.level,kind:expectedA.kind}},
     selectionChange:{clearedImmediately:preparedAfterSelect===null,preparedC,htmlHasBoss:htmlC.includes(monsterObj(4,4).name)},
     begin:{beginOk,prepared:explicitPrepared,encounter:beginEncounter,expected:{name:expectedPreparedEncounter.name,level:expectedPreparedEncounter.level,kind:expectedPreparedEncounter.kind},runCall,uiCursorAfter:beginUiCursorAfter},
     rerun:{prepared:rerunPrepared,htmlHasBoss:rerunHtml.includes(monsterObj(99,4).name)},
     review:{prepared:reviewPrepared,stableId:reviewPrepared?.contextId===reviewPrepared2?.contextId,htmlStable:reviewHtml===reviewHtml2,htmlHasElite:reviewHtml.includes(monsterObj(6,3).name)},
     invalid:{context:invalid,encounter:invalidEncounter}
    };
   }finally{
    state=originalState;selectedMap=originalUi.selectedMap;selectedEnemy=originalUi.selectedEnemy;selectedBattleCount=originalUi.selectedBattleCount;adventureScreen=originalUi.adventureScreen;currentCombatEncounter=originalUi.currentCombatEncounter;render=originalRender;runBattles=originalRunBattles;window.clearPreparedFirstWorldTargetContext?.();
   }
  });

  assert.deepEqual(report.versions,{context:1,prepared:1,encounter:1,ui:1});
  assert.equal(report.self.passed,true,JSON.stringify(report.self.errors||[]));
  assert.equal(report.install.prepare,true);assert.equal(report.install.combatPreview,true);assert.equal(report.install.enterMap,true);assert.equal(report.install.selectEnemy,true);assert.equal(report.install.backToMaps,true);assert.equal(report.install.reviewPrepare,true);
  assert.equal(report.formal.preparedA.mode,"formal");assert.equal(report.formal.preparedA.mapIndex,4);assert.equal(report.formal.preparedA.enemyIndex,3);assert.equal(report.formal.preparedA.authorized,true);
  assert.equal(report.formal.samePrepareId,true,"Repeated prepare render must reuse the same canonical prepared context.");
  assert.equal(report.formal.htmlHasTarget,true);assert.equal(report.formal.repeatHtmlStable,true);
  assert.deepEqual(report.formal.encounter,report.formal.expected,"Encounter bridge must resolve from prepared target identity.");
  assert.equal(report.selectionChange.clearedImmediately,true,"Changing the UI enemy cursor must invalidate the previous prepared context.");
  assert.equal(report.selectionChange.preparedC.enemyIndex,4);assert.equal(report.selectionChange.htmlHasBoss,true);
  assert.equal(report.begin.beginOk,true);assert.equal(report.begin.prepared.mapIndex,7);assert.equal(report.begin.prepared.enemyIndex,3);
  assert.deepEqual(report.begin.encounter,report.begin.expected,"beginCombat preview must use the already prepared canonical target even after the UI cursor drifts.");
  assert.equal(report.begin.runCall.count,1,"beginCombat must preserve the existing battle-count contract.");
  assert.deepEqual(report.begin.uiCursorAfter,{map:1,enemy:0},"Batch2 must not convert the UI cursor into combat authority or overwrite it.");
  assert.equal(report.rerun.prepared.mode,"rerun");assert.equal(report.rerun.prepared.mapIndex,99);assert.equal(report.rerun.prepared.enemyIndex,4);assert.equal(report.rerun.prepared.authorized,true);assert.equal(report.rerun.htmlHasBoss,true);
  assert.equal(report.review.prepared.mode,"review");assert.equal(report.review.prepared.mapIndex,6);assert.equal(report.review.prepared.enemyIndex,3);assert.equal(report.review.prepared.policy.formalRewardsAllowed,false);assert.equal(report.review.stableId,true);assert.equal(report.review.htmlStable,true);assert.equal(report.review.htmlHasElite,true);
  assert.equal(report.invalid.context.valid,false);assert.equal(report.invalid.context.authorized,false);assert.equal(report.invalid.encounter,null,"Invalid prepared targets must fail closed at the encounter bridge.");
  assert.deepEqual(pageErrors,[],"Browser pageerror:\n"+pageErrors.join("\n\n"));
  console.log("First-world target context UI/prepare/encounter Batch2 integrity passed:",JSON.stringify({versions:report.versions,install:report.install,formal:{identity:report.formal.preparedA.identity,samePrepareId:report.formal.samePrepareId},selectionChange:report.selectionChange.preparedC.identity,begin:{prepared:report.begin.prepared.identity,encounter:report.begin.encounter,uiCursorAfter:report.begin.uiCursorAfter},rerun:report.rerun.prepared.identity,review:{identity:report.review.prepared.identity,stableId:report.review.stableId},invalid:{valid:report.invalid.context.valid,authorized:report.invalid.context.authorized}}));
 }finally{await browser.close();}
})().catch(error=>{console.error(error?.stack||error);process.exit(1);});
