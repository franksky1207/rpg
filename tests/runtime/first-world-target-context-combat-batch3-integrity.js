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
  await page.waitForFunction(()=>window.FIRST_WORLD_TARGET_BATTLE_BINDING_VERSION===1&&window.MAIN_BATTLE_TARGET_CONTEXT_VERSION===1&&window.FIRST_WORLD_TARGET_CONTEXT_INTEGRITY?.passed===true,{timeout:30000});
  const report=await page.evaluate(async()=>{
   const deep=value=>JSON.parse(JSON.stringify(value));
   const originalState=deep(state);
   const originalGlobals={selectedMap,selectedEnemy,selectedBattleCount,adventureScreen,battleBusy,currentCombatEncounter,combatRound,combatTotal,activeMainBattleContext:window.activeMainBattleContext};
   const originals={
    fightOnce:window.fightOnce,animateFight:window.animateFight,render:window.render,save:window.save,restorePlayerHp:window.restorePlayerHp,
    maybeHandleSpecialEncounter:window.maybeHandleSpecialEncounter,clearPreviewEncounter:window.clearPreviewEncounter,showBattleResult:window.showBattleResult,
    minimalResult:window.mainMinimalModeHandleBattleResult,minimalHeader:window.mainMinimalModeEnsureCombatHeader,syncMinimal:window.syncMinimalMode
   };
   const source=await (await fetch("battlepipeline.js",{cache:"no-store"})).text();
   const makeState=count=>{
    const s=deep(originalState);
    if(s.secondWorld&&typeof s.secondWorld==="object")s.secondWorld.entered=false;
    if(s.thirdWorld&&typeof s.thirdWorld==="object")s.thirdWorld.entered=false;
    if(!s.reincarnation||typeof s.reincarnation!=="object")s.reincarnation={};
    s.reincarnation.count=count;
    s.level=500;s.unlockedMap=99;
    s.mapProgress=Array.from({length:MAPS.length},()=>[10,10,10,10]);
    s.bossProgress=Array(MAPS.length).fill(10);s.bossLocked=Array(MAPS.length).fill(false);s.bossKilled=Array(MAPS.length).fill(false);
    s.hp=playerCombatStats().hp;
    return s;
   };
   try{
    state=makeState(0);selectedMap=7;selectedEnemy=3;selectedBattleCount=1;adventureScreen="prepare";battleBusy=false;currentCombatEncounter=null;
    window.clearPreparedFirstWorldTargetContext();
    const target=window.prepareFirstWorldTargetContext({mode:"formal",mapIndex:7,enemyIndex:3,source:"batch3-combat"},state);
    const expected=monsterObj(7,3);
    selectedMap=1;selectedEnemy=0;

    const calls=[],previewClears=[],saveCalls=[];
    window.render=()=>{};
    window.animateFight=async()=>{};
    window.save=(...args)=>{saveCalls.push(args);return true;};
    window.restorePlayerHp=()=>{state.hp=playerCombatStats().hp;return state.hp;};
    window.maybeHandleSpecialEncounter=async()=>false;
    window.clearPreviewEncounter=(map,enemy)=>{previewClears.push({map,enemy});return true;};
    window.showBattleResult=()=>{};
    window.mainMinimalModeHandleBattleResult=()=>false;
    window.mainMinimalModeEnsureCombatHeader=()=>true;
    window.syncMinimalMode=()=>{};
    window.fightOnce=(map,enemy,encounter)=>{
     calls.push({map,enemy,name:encounter?.name,level:encounter?.level,kind:encounter?.kind,contextId:window.activeMainBattleContext?.targetContext?.contextId,identity:deep(window.activeMainBattleContext?.targetIdentity||null),ui:{map:selectedMap,enemy:selectedEnemy}});
     selectedMap=calls.length===1?55:88;selectedEnemy=calls.length===1?2:4;
     return {ok:true,win:true,logs:[],events:[],e:encounter,xp:0,gold:0,items:[],enhancementStones:{basic:0,advanced:0},saleEnhancementStones:{basic:0,advanced:0},combatEndHp:state.hp,turns:1,pendingStoryId:null};
    };
    currentCombatEncounter=window.firstWorldEncounterFromTargetContext(target,{preview:true});
    const finiteCtx=window.createMainBattleContext(2,target);
    const finiteOk=await runBattles(2,finiteCtx,target);
    const uiAfterFinite={map:selectedMap,enemy:selectedEnemy};
    const finitePreviewClears=deep(previewClears);

    state=makeState(0);selectedMap=4;selectedEnemy=0;battleBusy=false;currentCombatEncounter=null;window.clearPreparedFirstWorldTargetContext();
    const continuousTarget=window.prepareFirstWorldTargetContext({mode:"formal",mapIndex:4,enemyIndex:3,source:"batch3-continuous"},state);
    selectedMap=0;selectedEnemy=0;
    const continuousCalls=[];
    window.fightOnce=(map,enemy,encounter)=>{
     continuousCalls.push({map,enemy,name:encounter?.name,contextId:window.activeMainBattleContext?.targetContext?.contextId});
     selectedMap=99;selectedEnemy=4;
     if(continuousCalls.length>=2)window.activeMainBattleContext.exitRequested=true;
     return {ok:true,win:true,logs:[],events:[],e:encounter,xp:0,gold:0,items:[],enhancementStones:{basic:0,advanced:0},saleEnhancementStones:{basic:0,advanced:0},combatEndHp:state.hp,turns:1,pendingStoryId:null};
    };
    currentCombatEncounter=window.firstWorldEncounterFromTargetContext(continuousTarget,{preview:true});
    const continuousOk=await runBattles(window.CONTINUOUS_BATTLE_COUNT,null,continuousTarget);

    state=makeState(0);window.clearPreparedFirstWorldTargetContext();
    const stale=window.prepareFirstWorldTargetContext({mode:"formal",mapIndex:2,enemyIndex:0,source:"batch3-stale"},state);
    state.reincarnation.count=1;
    const staleValidation=window.validateCurrentFirstWorldTargetContext(stale,state);
    const staleBound=window.bindFirstWorldBattleTargetContext(stale,state);
    state=makeState(0);
    const review=window.createFirstWorldTargetContext({mode:"review",mapIndex:2,enemyIndex:0,source:"batch3-review"},state);
    const reviewBound=window.bindFirstWorldBattleTargetContext(review,state);

    return {
     versions:{context:window.FIRST_WORLD_TARGET_CONTEXT_VERSION,binding:window.FIRST_WORLD_TARGET_BATTLE_BINDING_VERSION,pipeline:window.MAIN_BATTLE_TARGET_CONTEXT_VERSION},
     integrity:window.FIRST_WORLD_TARGET_CONTEXT_INTEGRITY,
     finite:{ok:finiteOk,target:{contextId:target.contextId,identity:target.identity},expected:{name:expected.name,level:expected.level,kind:expected.kind},calls,previewClears:finitePreviewClears,uiAfter:uiAfterFinite,ctx:{completed:finiteCtx.completed,wins:finiteCtx.wins,targetContextId:finiteCtx.targetContext?.contextId,targetIdentity:finiteCtx.targetIdentity},saveCalls:saveCalls.length},
     continuous:{ok:continuousOk,target:{contextId:continuousTarget.contextId,identity:continuousTarget.identity},calls:continuousCalls,uiAfter:{map:selectedMap,enemy:selectedEnemy}},
     failClosed:{staleValidation,staleBound,reviewBound},
     source:{noFightSelection:!source.includes("fightOnce(selectedMap,selectedEnemy,encounter)"),noTimingSelection:!source.includes("beginRealBattleTiming(encounter,playerLevelBefore,selectedMap,selectedEnemy)"),noRegenerateSelection:!source.includes("createMonsterEncounter(selectedMap,selectedEnemy)"),passesContextToSpecial:source.includes("maybeHandleSpecialEncounter(ctx,r,{mapIndex,enemyIndex,targetContext:boundTarget,parentTargetContext:boundTarget})"),contextSettlement:source.includes("fightOnce(mapIndex,enemyIndex,encounter)")}
    };
   }finally{
    state=originalState;selectedMap=originalGlobals.selectedMap;selectedEnemy=originalGlobals.selectedEnemy;selectedBattleCount=originalGlobals.selectedBattleCount;adventureScreen=originalGlobals.adventureScreen;battleBusy=originalGlobals.battleBusy;currentCombatEncounter=originalGlobals.currentCombatEncounter;combatRound=originalGlobals.combatRound;combatTotal=originalGlobals.combatTotal;window.activeMainBattleContext=originalGlobals.activeMainBattleContext;
    Object.assign(window,originals);window.clearPreparedFirstWorldTargetContext?.();
   }
  });

  assert.deepEqual(report.versions,{context:1,binding:1,pipeline:1});
  assert.equal(report.integrity.passed,true,JSON.stringify(report.integrity.errors||[]));
  assert.equal(report.finite.ok,true);assert.equal(report.finite.calls.length,2);assert.equal(report.finite.ctx.completed,2);assert.equal(report.finite.ctx.wins,2);
  report.finite.calls.forEach(call=>{assert.equal(call.map,7);assert.equal(call.enemy,3);assert.equal(call.name,report.finite.expected.name);assert.equal(call.level,report.finite.expected.level);assert.equal(call.kind,report.finite.expected.kind);assert.equal(call.contextId,report.finite.target.contextId);assert.deepEqual(call.identity,report.finite.target.identity);});
  assert.deepEqual(report.finite.uiAfter,{map:88,enemy:4},"Combat must not overwrite the UI cursor merely to preserve target authority.");
  assert.equal(report.finite.ctx.targetContextId,report.finite.target.contextId);assert.deepEqual(report.finite.ctx.targetIdentity,report.finite.target.identity);
  assert.ok(report.finite.previewClears.length>=1);report.finite.previewClears.forEach(row=>assert.deepEqual(row,{map:7,enemy:3}));
  assert.equal(report.continuous.ok,true);assert.equal(report.continuous.calls.length,2);report.continuous.calls.forEach(call=>{assert.equal(call.map,4);assert.equal(call.enemy,3);assert.equal(call.contextId,report.continuous.target.contextId);});
  assert.deepEqual(report.continuous.uiAfter,{map:99,enemy:4});
  assert.equal(report.failClosed.staleValidation.passed,false);assert.ok(report.failClosed.staleValidation.errors.includes("stale-count")||report.failClosed.staleValidation.errors.includes("stale-life"));assert.equal(report.failClosed.staleBound,null);assert.equal(report.failClosed.reviewBound,null);
  Object.entries(report.source).forEach(([name,value])=>assert.equal(value,true,`Batch3 source contract failed: ${name}`));
  assert.deepEqual(pageErrors,[],"Browser pageerror:\n"+pageErrors.join("\n\n"));
  console.log("First-world target context combat/settlement Batch3 integrity passed:",JSON.stringify({versions:report.versions,finite:{target:report.finite.target,calls:report.finite.calls.map(x=>({map:x.map,enemy:x.enemy,name:x.name,contextId:x.contextId})),uiAfter:report.finite.uiAfter},continuous:{target:report.continuous.target,calls:report.continuous.calls,uiAfter:report.continuous.uiAfter},failClosed:{errors:report.failClosed.staleValidation.errors,review:report.failClosed.reviewBound},source:report.source}));
 }finally{await browser.close();}
})().catch(error=>{console.error(error?.stack||error);process.exit(1);});