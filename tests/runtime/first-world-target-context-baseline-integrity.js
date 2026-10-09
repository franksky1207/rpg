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
  await page.waitForFunction(()=>window.MAIN_BATTLE_PIPELINE_CLEANUP_VERSION===1&&window.FIRST_WORLD_REINCARNATION_TARGET_CONTEXT_VERSION===1&&window.GALAXY_REVIEW_BATTLE_RUNTIME_VERSION===7&&window.GALAXY_REVIEW_FORMAL_STATE_GUARD_VERSION===2&&Number(window.OFFLINE_BATTLE_SAMPLE_VERSION)===4&&window.MAINLINE_BOSS_STORY_PIPELINE_VERSION===2&&window.REINCARNATION_RERUN_MAINLINE_BACKFILL_VERSION===2,{timeout:30000});
  const report=await page.evaluate(async()=>{
   const deep=value=>JSON.parse(JSON.stringify(value));
   const originalState=deep(state),originalSelections={selectedMap,selectedEnemy,selectedBattleCount,adventureScreen,battleBusy,currentCombatEncounter};
   const originalRunCombat=window.runCombatCore,originalRender=render,originalAnimateFight=animateFight,originalAlert=window.alert;
   const sourceNames=["battlepipeline.js","mainminimalmode.js","specialencounter.js","offlineprogress.js","reincarnationrerunworld1.js"];
   const sources=Object.fromEntries(await Promise.all(sourceNames.map(async name=>[name,await (await fetch(name,{cache:"no-store"})).text()])));
   function firstWorldClone(count=0){
    const s=deep(originalState);
    if(s.secondWorld&&typeof s.secondWorld==="object")s.secondWorld.entered=false;
    if(s.thirdWorld&&typeof s.thirdWorld==="object")s.thirdWorld.entered=false;
    if(!s.reincarnation||typeof s.reincarnation!=="object")s.reincarnation={};
    s.reincarnation.count=Math.max(0,Math.floor(Number(count)||0));
    return s;
   }
   const scenarios={};
   try{
    const normal=monsterObj(0,0),elite=monsterObj(0,3),boss=monsterObj(0,4);
    scenarios.enemyKinds={normal:normal?.kind,elite:elite?.kind,boss:boss?.kind};
    scenarios.battleModes={normal:battleModesForEnemy(normal),elite:battleModesForEnemy(elite),boss:battleModesForEnemy(boss)};

    state=firstWorldClone(0);
    state.level=1;state.unlockedMap=0;
    state.mapProgress=Array.from({length:MAPS.length},()=>[0,0,0,0]);
    state.bossProgress=Array(MAPS.length).fill(0);state.bossLocked=Array(MAPS.length).fill(false);state.bossKilled=Array(MAPS.length).fill(false);
    scenarios.firstRunStart={enemy0:enemyUnlocked(0,0),enemy1:enemyUnlocked(0,1),elite:enemyUnlocked(0,3),boss:enemyUnlocked(0,4)};
    state.mapProgress[0]=[10,10,10,10];state.level=MAPS[0].max;
    scenarios.firstRunBossReady={boss:enemyUnlocked(0,4),canBoss:canBoss(0)};

    state=firstWorldClone(1);selectedMap=99;selectedEnemy=4;
    const rerunValid=window.firstWorldReincarnationTargetContext(state);
    selectedMap=-1;selectedEnemy=9;
    const rerunInvalid=window.firstWorldReincarnationTargetContext(state);
    scenarios.rerunTarget={valid:rerunValid,invalid:rerunInvalid};

    state=firstWorldClone(1);
    const rerunMultiplier=window.reincarnationOverlevelRewardMultiplier(100,500,state);
    const firstRunState=firstWorldClone(0);
    const firstRunMultiplier=window.reincarnationOverlevelRewardMultiplier(100,500,firstRunState);
    const detached=firstWorldClone(1);
    detached.mapProgress=Array.from({length:MAPS.length},()=>[0,0,0,0]);detached.bossProgress=Array(MAPS.length).fill(0);detached.bossLocked=Array(MAPS.length).fill(false);detached.bossKilled=Array(MAPS.length).fill(false);detached.unlockedMap=0;
    const conquest=window.applyFirstWorldReincarnationRerunConquest(9,detached);
    const conquestOk=conquest?.ok===true&&detached.bossKilled.slice(0,10).every(Boolean)&&detached.mapProgress.slice(0,10).every(row=>row.every(v=>v>=10))&&detached.bossProgress.slice(0,10).every(v=>v>=10)&&detached.unlockedMap>=10;
    const arenaState=firstWorldClone(1);arenaState.bossKilled=Array(MAPS.length).fill(false);
    const regions=Array.isArray(window.WORLD_REGIONS)?window.WORLD_REGIONS:WORLD_REGIONS;
    if(regions[0])arenaState.bossKilled[regions[0].mapEnd]=true;
    if(regions[1])arenaState.bossKilled[regions[1].mapEnd]=true;
    const arenaCoverage=window.firstWorldRerunKeyBossCoverage(arenaState);
    scenarios.rerunProgress={rerunMultiplier,firstRunMultiplier,conquestOk,conquest,arenaCoverage};

    state=firstWorldClone(0);selectedMap=55;selectedEnemy=2;battleBusy=false;
    window.runCombatCore=(ps,e,startHp)=>({win:true,logs:[],events:[],hp:startHp,enemyHp:0,turns:1});
    render=()=>{};animateFight=async()=>{};window.alert=()=>{};
    const reviewBefore=JSON.stringify(state),formalSelectionBefore={selectedMap,selectedEnemy};
    window.openGalaxyReviewMap(0);window.setGalaxyReviewSelectedEnemy(0);
    const reviewNormalOk=await window.startGalaxyReviewBattle();window.setGalaxyReviewBattleActive(false);
    const reviewAfterNormal=JSON.stringify(state),formalAfterNormal={selectedMap,selectedEnemy};
    window.openGalaxyReviewMap(0);window.setGalaxyReviewSelectedEnemy(4);
    const reviewBossOk=await window.startGalaxyReviewBattle();window.setGalaxyReviewBattleActive(false);
    const reviewAfterBoss=JSON.stringify(state),formalAfterBoss={selectedMap,selectedEnemy};
    scenarios.review={reviewNormalOk,reviewBossOk,formalStateStable:reviewBefore===reviewAfterNormal&&reviewBefore===reviewAfterBoss,formalSelectionStable:JSON.stringify(formalSelectionBefore)===JSON.stringify(formalAfterNormal)&&JSON.stringify(formalSelectionBefore)===JSON.stringify(formalAfterBoss),runtimeVersion:window.GALAXY_REVIEW_BATTLE_RUNTIME_VERSION,stateGuardVersion:window.GALAXY_REVIEW_FORMAL_STATE_GUARD_VERSION};

    scenarios.runtimeContracts={
     continuous:window.MAIN_BOSS_CONTINUOUS_VERSION,
     minimal:window.MAIN_MINIMAL_MODE_PIPELINE_HOOK_VERSION,
     fastCatchUp:window.MAIN_BATTLE_FAST_CATCH_UP_POLICY_VERSION,
     specialPacing:window.SPECIAL_ENCOUNTER_FLOW_PACING_VERSION,
     specialWorldGuard:window.SPECIAL_ENCOUNTER_THIRD_WORLD_GUARD_VERSION,
     offlineSample:window.OFFLINE_BATTLE_SAMPLE_VERSION,
     mainRealSample:window.MAIN_REAL_BATTLE_SAMPLE_VERSION,
     bossStoryPipeline:window.MAINLINE_BOSS_STORY_PIPELINE_VERSION,
     rerunBackfill:window.REINCARNATION_RERUN_MAINLINE_BACKFILL_VERSION
    };

    scenarios.sourceContracts={
     continuousUsesStableContext:sources["battlepipeline.js"].includes("window.activeMainBattleContext=ctx")&&sources["battlepipeline.js"].includes("requestContinuousBattleStop"),
     fastCatchUpUsesContext:sources["battlepipeline.js"].includes("mainCatchUpStep()")&&sources["battlepipeline.js"].includes("refreshMainCatchUpUi(ctx)"),
     specialWinAndLoss:sources["specialencounter.js"].includes("if(r.win){")&&sources["specialencounter.js"].includes("result.penalty=")&&sources["specialencounter.js"].includes("maybeHandleSpecialEncounter(ctx"),
     offlineExcludesBoss:sources["offlineprogress.js"].includes("e<0||e>3")&&sources["offlineprogress.js"].includes('targetType:"mapEnemy"'),
     storyPendingPipeline:sources["battlepipeline.js"].includes("pendingStoryId")&&sources["battlepipeline.js"].includes("consumePendingStoryFromResult"),
     minimalHasCurrentEncounter:sources["mainminimalmode.js"].includes("currentCombatEncounter"),
     rerunContextFailClosed:sources["reincarnationrerunworld1.js"].includes("canonical-target-owner-missing")&&sources["reincarnationrerunworld1.js"].includes("firstWorldTargetContextFromSelection")
    };

    scenarios.preRefactorDebt={
     battlePipelineReadsUiSelection:sources["battlepipeline.js"].includes("fightOnce(selectedMap,selectedEnemy,encounter)")&&sources["battlepipeline.js"].includes("beginRealBattleTiming(encounter,playerLevelBefore,selectedMap,selectedEnemy)"),
     minimalFallsBackToUiSelection:sources["mainminimalmode.js"].includes("getPreviewEncounter(selectedMap,selectedEnemy)")&&sources["mainminimalmode.js"].includes("monsterObj(selectedMap,selectedEnemy)"),
     rerunTargetReadsUiSelection:sources["reincarnationrerunworld1.js"].includes("typeof selectedMap")&&sources["reincarnationrerunworld1.js"].includes("typeof selectedEnemy")
    };
    return scenarios;
   }finally{
    state=originalState;selectedMap=originalSelections.selectedMap;selectedEnemy=originalSelections.selectedEnemy;selectedBattleCount=originalSelections.selectedBattleCount;adventureScreen=originalSelections.adventureScreen;battleBusy=originalSelections.battleBusy;currentCombatEncounter=originalSelections.currentCombatEncounter;
    window.runCombatCore=originalRunCombat;render=originalRender;animateFight=originalAnimateFight;window.alert=originalAlert;
   }
  });

  assert.deepEqual(report.enemyKinds,{normal:"normal",elite:"elite",boss:"boss"});
  for(const modes of Object.values(report.battleModes))assert.deepEqual(modes,[1,"continuous"],"Current W1 UI supports single + continuous only; baseline must not invent a fixed multi-count mode.");
  assert.deepEqual(report.firstRunStart,{enemy0:true,enemy1:false,elite:false,boss:false});
  assert.deepEqual(report.firstRunBossReady,{boss:true,canBoss:true});
  assert.equal(report.rerunTarget.valid.authorized,true);assert.equal(report.rerunTarget.valid.mapIndex,99);assert.equal(report.rerunTarget.valid.enemyIndex,4);
  assert.equal(report.rerunTarget.invalid.valid,false);assert.equal(report.rerunTarget.invalid.authorized,false);
  assert.equal(report.rerunProgress.rerunMultiplier,13);assert.equal(report.rerunProgress.firstRunMultiplier,1);assert.equal(report.rerunProgress.conquestOk,true);assert.equal(report.rerunProgress.arenaCoverage,2);
  assert.equal(report.review.reviewNormalOk,true);assert.equal(report.review.reviewBossOk,true);assert.equal(report.review.formalStateStable,true);assert.equal(report.review.formalSelectionStable,true);assert.equal(report.review.runtimeVersion,7);assert.equal(report.review.stateGuardVersion,2);
  assert.deepEqual(report.runtimeContracts,{continuous:1,minimal:1,fastCatchUp:1,specialPacing:1,specialWorldGuard:1,offlineSample:4,mainRealSample:4,bossStoryPipeline:2,rerunBackfill:2});
  Object.entries(report.sourceContracts).forEach(([name,value])=>assert.equal(value,true,`Baseline source contract failed: ${name}`));
  assert.deepEqual(pageErrors,[],"Browser pageerror:\n"+pageErrors.join("\n\n"));
  console.log("First-world target-context pre-refactor baseline passed:",JSON.stringify(report));
 }finally{await browser.close();}
})().catch(error=>{console.error(error?.stack||error);process.exit(1);});