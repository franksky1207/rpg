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
  await page.waitForFunction(()=>window.FIRST_WORLD_TARGET_CONTEXT_BATCH4_BRIDGE_VERSION===1&&window.MAIN_MINIMAL_MODE_TARGET_CONTEXT_VERSION===1,{timeout:30000});
  const report=await page.evaluate(async()=>{
   const deep=value=>JSON.parse(JSON.stringify(value));
   const originalState=deep(state);
   const originalGlobals={selectedMap,selectedEnemy,selectedBattleCount,adventureScreen,battleBusy,currentCombatEncounter,combatRound,combatTotal,activeMainBattleContext:window.activeMainBattleContext};
   const originals={fightOnce:window.fightOnce,animateFight:window.animateFight,render:window.render,save:window.save,restorePlayerHp:window.restorePlayerHp,maybeHandleSpecialEncounter:window.maybeHandleSpecialEncounter,showBattleResult:window.showBattleResult,fast:window.backgroundProgressFastCatchUpActive,step:window.backgroundProgressCatchUpStep,consume:window.backgroundProgressConsumeCatchUpCredit,duration:window.structuredCombatPresentationDurationMs};
   const makeState=()=>{const s=deep(originalState);if(s.secondWorld)s.secondWorld.entered=false;if(s.thirdWorld)s.thirdWorld.entered=false;if(!s.reincarnation)s.reincarnation={};s.reincarnation.count=0;s.level=500;s.unlockedMap=99;s.mapProgress=Array.from({length:MAPS.length},()=>[10,10,10,10]);s.bossProgress=Array(MAPS.length).fill(10);s.bossLocked=Array(MAPS.length).fill(false);s.bossKilled=Array(MAPS.length).fill(false);s.hp=playerCombatStats().hp;return s;};
   try{
    state=makeState();selectedMap=4;selectedEnemy=3;selectedBattleCount=1;adventureScreen="prepare";battleBusy=false;currentCombatEncounter=null;
    window.clearPreparedFirstWorldTargetContext();
    const target=window.prepareFirstWorldTargetContext({mode:"formal",mapIndex:4,enemyIndex:3,source:"batch4-main"},state);
    const drift=window.createFirstWorldTargetContext({mode:"formal",mapIndex:9,enemyIndex:0,source:"batch4-drift"},state);
    const expected={name:target.enemyName,level:target.enemyLevel};
    const calls=[];
    window.render=()=>{};window.animateFight=async()=>{};window.save=()=>true;window.restorePlayerHp=()=>{state.hp=playerCombatStats().hp;return state.hp;};window.showBattleResult=()=>{};window.maybeHandleSpecialEncounter=async()=>false;
    window.backgroundProgressFastCatchUpActive=()=>true;window.backgroundProgressCatchUpStep=()=>({shouldPresentBattle:false,shouldRefreshUi:false,shouldCheckpoint:false});window.backgroundProgressConsumeCatchUpCredit=ms=>({active:true,requested:ms,consumed:ms,remaining:0,credit:1000});window.structuredCombatPresentationDurationMs=()=>0;
    window.fightOnce=(map,enemy,encounter)=>{calls.push({map,enemy,name:encounter?.name,contextId:window.activeMainBattleContext?.targetContext?.contextId});if(calls.length===1){try{window.activeMainBattleContext.targetContext=drift;}catch(_){}}selectedMap=99;selectedEnemy=4;if(calls.length>=2)window.activeMainBattleContext.exitRequested=true;return {ok:true,win:true,logs:[],events:[],e:encounter,xp:0,gold:0,items:[],enhancementStones:{basic:0,advanced:0},saleEnhancementStones:{basic:0,advanced:0},combatEndHp:state.hp,turns:1,pendingStoryId:null};};
    currentCombatEncounter=window.firstWorldEncounterFromTargetContext(target,{preview:true});
    const ctx=window.createMainBattleContext(window.CONTINUOUS_BATTLE_COUNT,target);
    const continuousOk=await runBattles(window.CONTINUOUS_BATTLE_COUNT,ctx,target);

    state=makeState();selectedMap=99;selectedEnemy=4;adventureScreen="combat";combatTotal=0;combatRound=7;currentCombatEncounter=null;
    const minimalTarget=window.prepareFirstWorldTargetContext({mode:"formal",mapIndex:7,enemyIndex:3,source:"batch4-minimal"},state);
    window.activeMainBattleContext=window.createMainBattleContext(window.CONTINUOUS_BATTLE_COUNT,minimalTarget);
    const minimalOpened=window.openMainMinimalMode();
    const minimalEnemy=document.querySelector("[data-main-minimal-mode-enemy]")?.textContent||"";
    window.closeMainMinimalMode();

    const parent=window.resolveFirstWorldSpecialParentTargetContext({targetContext:minimalTarget},{parentTargetContext:minimalTarget});
    const review=window.createFirstWorldTargetContext({mode:"review",mapIndex:7,enemyIndex:3,source:"batch4-review"},state);
    const reviewParent=window.resolveFirstWorldSpecialParentTargetContext({targetContext:review},{parentTargetContext:review});
    const minimalSource=await (await fetch("mainminimalmode.js",{cache:"no-store"})).text();
    const bridgeSource=await (await fetch("firstworldtargetcontextbatch4.js",{cache:"no-store"})).text();
    return {versions:{bridge:window.FIRST_WORLD_TARGET_CONTEXT_BATCH4_BRIDGE_VERSION,continuous:window.FIRST_WORLD_CONTINUOUS_TARGET_LOCK_VERSION,fast:window.FIRST_WORLD_FAST_CATCH_UP_TARGET_LOCK_VERSION,special:window.FIRST_WORLD_SPECIAL_PARENT_TARGET_VERSION,minimal:window.MAIN_MINIMAL_MODE_TARGET_CONTEXT_VERSION},continuous:{ok:continuousOk,targetId:target.contextId,calls,ctxTargetId:ctx.targetContext?.contextId},minimal:{opened:minimalOpened,text:minimalEnemy,expected},special:{parentId:parent?.contextId||null,expectedId:minimalTarget.contextId,reviewParent},source:{minimalNoPreviewSelection:!minimalSource.includes("getPreviewEncounter(selectedMap,selectedEnemy)"),minimalNoMonsterSelection:!minimalSource.includes("monsterObj(selectedMap,selectedEnemy)"),bridgeLocksTarget:bridgeSource.includes('Object.defineProperty(ctx,"targetContext"'),bridgeCarriesParent:bridgeSource.includes("parentTargetContext"),bridgeRestoresSelection:bridgeSource.includes("selectedMap=beforeMap")&&bridgeSource.includes("selectedEnemy=beforeEnemy")}};
   }finally{
    window.closeMainMinimalMode?.();state=originalState;selectedMap=originalGlobals.selectedMap;selectedEnemy=originalGlobals.selectedEnemy;selectedBattleCount=originalGlobals.selectedBattleCount;adventureScreen=originalGlobals.adventureScreen;battleBusy=originalGlobals.battleBusy;currentCombatEncounter=originalGlobals.currentCombatEncounter;combatRound=originalGlobals.combatRound;combatTotal=originalGlobals.combatTotal;window.activeMainBattleContext=originalGlobals.activeMainBattleContext;Object.assign(window,originals);window.clearPreparedFirstWorldTargetContext?.();
   }
  });
  assert.deepEqual(report.versions,{bridge:1,continuous:1,fast:1,special:1,minimal:1});
  assert.equal(report.continuous.ok,true);assert.equal(report.continuous.calls.length,2);assert.equal(report.continuous.ctxTargetId,report.continuous.targetId);report.continuous.calls.forEach(call=>{assert.equal(call.map,4);assert.equal(call.enemy,3);assert.equal(call.contextId,report.continuous.targetId);});
  assert.equal(report.minimal.opened,true);assert.ok(report.minimal.text.includes(report.minimal.expected.name));assert.ok(report.minimal.text.includes(String(report.minimal.expected.level)));
  assert.equal(report.special.parentId,report.special.expectedId);assert.equal(report.special.reviewParent,null);
  Object.entries(report.source).forEach(([name,value])=>assert.equal(value,true,`Batch4 source contract failed: ${name}`));
  assert.deepEqual(pageErrors,[],"Browser pageerror:\n"+pageErrors.join("\n\n"));
  console.log("First-world Target Context Batch4 continuous/minimal/fast/special integrity passed:",JSON.stringify(report));
 }finally{await browser.close();}
})().catch(error=>{console.error(error?.stack||error);process.exit(1);});