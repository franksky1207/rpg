(function(){
 const CONTINUOUS_COUNT=window.CONTINUOUS_BATTLE_COUNT;
 const battleGapMs=window.mainBattleGapMs;
 const battleFlowSleep=window.mainBattleFlowSleep;
 const TARGET_CONTEXT_PIPELINE_VERSION=1;
 const TARGET_LOCK_OWNER_VERSION=1;
 const PREPARED_SESSION_BINDING_VERSION=1;
 const UI_SELECTION_FALLBACK_RETIRED_VERSION=1;
 function isContinuousCount(count,ctx=null){return count===CONTINUOUS_COUNT||ctx?.continuous===true;}
 function blankEnhancementRewards(){return {battle:{basic:0,advanced:0},autoSale:{basic:0,advanced:0}};}
 function ensureEnhancementRewards(ctx){if(!ctx.enhancementRewards||typeof ctx.enhancementRewards!=="object")ctx.enhancementRewards=blankEnhancementRewards();ctx.enhancementRewards.battle=mergeEnhancementStoneRewards({basic:0,advanced:0},ctx.enhancementRewards.battle);ctx.enhancementRewards.autoSale=mergeEnhancementStoneRewards({basic:0,advanced:0},ctx.enhancementRewards.autoSale);return ctx.enhancementRewards;}
 function addContextEnhancementReward(ctx,key,reward){const summary=ensureEnhancementRewards(ctx);summary[key]=mergeEnhancementStoneRewards(summary[key],reward);return summary[key];}
 function resolveBattleTargetContext(explicit=null,ctx=null){
  let context=explicit||ctx?.targetContext||null;
  if(!context&&typeof window.getPreparedFirstWorldTargetContext==="function")context=window.getPreparedFirstWorldTargetContext();
  if(typeof window.bindFirstWorldBattleTargetContext!=="function")return null;
  return window.bindFirstWorldBattleTargetContext(context,state);
 }
 function preparedSessionForTarget(target){return typeof window.firstWorldPreparedTargetSessionForContext==="function"?window.firstWorldPreparedTargetSessionForContext(target):null;}
 function lockBattleTarget(ctx,target){
  if(!ctx||!target)return false;
  const session=preparedSessionForTarget(target);
  Object.defineProperty(ctx,"targetContext",{configurable:true,enumerable:true,writable:false,value:target});
  Object.defineProperty(ctx,"targetIdentity",{configurable:true,enumerable:true,writable:false,value:target.identity});
  Object.defineProperty(ctx,"targetSessionId",{configurable:true,enumerable:true,writable:false,value:session?.sessionId||null});
  return true;
 }
 function targetIdentity(ctx){const target=ctx?.targetContext;return target&&target.valid===true?{mapIndex:target.mapIndex,enemyIndex:target.enemyIndex}:null;}
 function encounterMatchesTarget(encounter,target){if(!encounter||!target)return false;if(String(encounter.name||"")!==String(target.enemyName||""))return false;if(Math.max(0,Math.floor(Number(encounter.level)||0))!==Math.max(0,Math.floor(Number(target.enemyLevel)||0)))return false;const expected=target.targetType==="boss"?"boss":target.targetType==="elite"?"elite":"normal";return String(encounter.kind||"")===expected;}
 function encounterForContext(ctx,{preview=false,existing=null}={}){const target=ctx?.targetContext;if(!target)return null;if(existing&&encounterMatchesTarget(existing,target))return existing;if(typeof window.firstWorldEncounterFromTargetContext==="function")return window.firstWorldEncounterFromTargetContext(target,{preview});return typeof createMonsterEncounter==="function"?createMonsterEncounter(target.mapIndex,target.enemyIndex):null;}
 function clearPreviewForContext(ctx){const target=ctx?.targetContext;if(!target)return false;if(typeof window.clearFirstWorldPreviewForTargetContext==="function")return window.clearFirstWorldPreviewForTargetContext(target);if(typeof clearPreviewEncounter==="function"){clearPreviewEncounter(target.mapIndex,target.enemyIndex);return true;}return false;}
 function createBattleContext(count,targetContext=null){const continuous=isContinuousCount(count);const total=continuous?null:Math.max(1,Math.floor(Number(count)||1));const ctx={wins:0,totalXp:0,totalGold:0,items:[],originalCount:total,completed:0,remaining:total,specialEncounters:[],enhancementRewards:blankEnhancementRewards(),continuous,exitRequested:false,pendingStoryId:null,targetContext:null,targetIdentity:null,targetSessionId:null};if(targetContext)lockBattleTarget(ctx,targetContext);return ctx;}
 function hasMoreBattles(ctx){return ctx?.continuous===true||Number(ctx?.remaining)>0;}
 function shouldStopContinuous(ctx){return ctx?.continuous===true&&ctx?.exitRequested===true;}
 function mainBackgroundEnabled(ctx){return ctx?.continuous===true&&typeof window.gmBackgroundBattleEnabled==="function"&&window.gmBackgroundBattleEnabled()===true&&typeof window.backgroundProgressStart==="function";}
 function startMainBackground(ctx){if(!mainBackgroundEnabled(ctx)){if(ctx?.continuous===true&&typeof window.backgroundProgressStop==="function")window.backgroundProgressStop("main");return false;}window.backgroundProgressStart("main",{mode:"continuous"});return true;}
 function stopMainBackground(started){if(started&&typeof window.backgroundProgressStop==="function")window.backgroundProgressStop("main");}
 function mainFastCatchUp(){return typeof window.backgroundProgressFastCatchUpActive==="function"&&window.backgroundProgressFastCatchUpActive("main")===true;}
 function mainCatchUpStep(){return typeof window.backgroundProgressCatchUpStep==="function"?window.backgroundProgressCatchUpStep("main"):null;}
 function mainCatchUpFinal(){return typeof window.backgroundProgressCatchUpFinalPolicy==="function"?window.backgroundProgressCatchUpFinalPolicy("main"):null;}
 function mainStructuredDuration(result){return typeof window.structuredCombatPresentationDurationMs==="function"?Math.max(0,Number(window.structuredCombatPresentationDurationMs(result))||0):0;}
 async function consumeMainCatchUpDelay(ms){const delay=Math.max(0,Number(ms)||0);if(delay<=0)return true;if(mainFastCatchUp()&&typeof window.backgroundProgressConsumeCatchUpCredit==="function"){const consumed=window.backgroundProgressConsumeCatchUpCredit(delay,"main");if(Number(consumed?.remaining)>0)await battleFlowSleep(consumed.remaining);return Number(consumed?.remaining)<=0;}await battleFlowSleep(delay);return false;}
 function refreshMainCatchUpUi(ctx){adventureScreen="combat";if(typeof render==="function")render();if(typeof window.mainMinimalModeEnsureCombatHeader==="function")window.mainMinimalModeEnsureCombatHeader({continuous:ctx?.continuous===true});if(ctx?.continuous&&typeof window.syncMinimalMode==="function"&&window.getMinimalModeAdapterId?.()==="main")window.syncMinimalMode();}
 function beginRealBattleTiming(encounter,playerLevel,mapIdx,enemyIdx){if(!encounter||encounter.kind==="boss"||typeof window.offlineBattleSampleMultiplier!=="function")return null;const multiplier=window.offlineBattleSampleMultiplier(playerLevel,encounter.level);if(multiplier==null)return null;if(typeof window.backgroundProgressEnvironmentIsBackground==="function"&&window.backgroundProgressEnvironmentIsBackground())return null;if(typeof window.backgroundProgressHasCatchUpCredit==="function"&&window.backgroundProgressHasCatchUpCredit("main"))return null;const kind=encounter.kind==="elite"?"elite":"normal";const combatSpeed=typeof window.effectiveCombatSpeed==="function"?Number(window.effectiveCombatSpeed()):1;const speeds=Array.isArray(window.OFFLINE_STATE_COMBAT_SPEEDS)?window.OFFLINE_STATE_COMBAT_SPEEDS:[1,1.5,2];if(!speeds.includes(combatSpeed))return null;const token={startedAt:Date.now(),interrupted:false,playerLevel:Math.max(1,Math.floor(Number(playerLevel)||1)),enemyLevel:Math.max(1,Math.floor(Number(encounter.level)||1)),kind,map:Math.max(0,Math.floor(Number(mapIdx)||0)),enemy:Math.max(0,Math.floor(Number(enemyIdx)||0)),multiplier,gapMs:battleGapMs(kind),combatSpeed,unsubscribe:null};if(typeof window.backgroundProgressOnEnvironmentChange==="function")token.unsubscribe=window.backgroundProgressOnEnvironmentChange(isBackground=>{if(isBackground)token.interrupted=true;});return token;}
 function finishRealBattleTiming(token,result){if(!token)return false;if(typeof token.unsubscribe==="function")token.unsubscribe();if(token.interrupted||result?.win!==true||result?.e?.kind==="boss")return false;if(typeof window.backgroundProgressEnvironmentIsBackground==="function"&&window.backgroundProgressEnvironmentIsBackground())return false;if(typeof window.backgroundProgressHasCatchUpCredit==="function"&&window.backgroundProgressHasCatchUpCredit("main"))return false;if(typeof window.appendOfflineBattleSample!=="function")return false;const actualMs=Math.round(Date.now()-token.startedAt);if(!Number.isFinite(actualMs)||actualMs<100||actualMs>300000)return false;const cycleMs=actualMs+token.gapMs,adjustedMs=Math.max(100,Math.round(cycleMs*token.multiplier)),sampleVersion=Math.max(0,Math.floor(Number(window.OFFLINE_BATTLE_SAMPLE_VERSION)||0));if(sampleVersion<=0)return false;const appended=window.appendOfflineBattleSample(state,{sampleVersion,world:1,targetType:"mapEnemy",combatSpeed:token.combatSpeed,actualMs,cycleMs,adjustedMs,playerLevel:token.playerLevel,enemyLevel:token.enemyLevel,kind:token.kind,map:token.map,enemy:token.enemy,multiplier:token.multiplier,recordedAt:Date.now()},{currentTime:Date.now()});return appended?.ok===true;}
 function consumePendingStoryFromResult(ctx,result){if(result?.win!==true)return null;const storyId=typeof result.pendingStoryId==="string"&&result.pendingStoryId?result.pendingStoryId:null;if(!storyId)return null;ctx.pendingStoryId=storyId;if(ctx.continuous)ctx.exitRequested=true;return storyId;}

 window.MAIN_REAL_BATTLE_SAMPLE_VERSION=4;
 window.MAIN_OFFLINE_SAMPLE_OWNER_CONVERGENCE_VERSION=1;
 window.MAIN_BATTLE_TARGET_CONTEXT_VERSION=TARGET_CONTEXT_PIPELINE_VERSION;
 window.MAIN_BATTLE_TARGET_LOCK_OWNER_VERSION=TARGET_LOCK_OWNER_VERSION;
 window.MAIN_BATTLE_PREPARED_SESSION_BINDING_VERSION=PREPARED_SESSION_BINDING_VERSION;
 window.MAIN_BATTLE_UI_SELECTION_FALLBACK_RETIRED_VERSION=UI_SELECTION_FALLBACK_RETIRED_VERSION;
 window.createMainBattleContext=createBattleContext;
 window.resolveMainBattleTargetContext=resolveBattleTargetContext;
 window.lockMainBattleTargetContext=lockBattleTarget;
 window.blankBattleEnhancementRewards=blankEnhancementRewards;
 window.ensureBattleEnhancementRewards=ensureEnhancementRewards;
 window.addBattleEnhancementReward=addContextEnhancementReward;
 window.requestContinuousBattleStop=function(){const ctx=window.activeMainBattleContext;if(!battleBusy||ctx?.continuous!==true)return false;ctx.exitRequested=true;const btn=document.getElementById("continuousBattleStopBtn");if(btn){btn.disabled=true;btn.textContent="本場結束後停止";}return true;};

 runBattles=async function(count,ctx=null,targetContext=null){
  if(battleBusy)return false;
  const boundTarget=resolveBattleTargetContext(targetContext,ctx);
  if(!boundTarget)return false;
  battleBusy=true;
  if(!ctx)ctx=createBattleContext(count,boundTarget);
  if(!lockBattleTarget(ctx,boundTarget)){battleBusy=false;return false;}
  const identity=targetIdentity(ctx);
  if(!identity){battleBusy=false;return false;}
  const mapIndex=identity.mapIndex,enemyIndex=identity.enemyIndex;
  ensureEnhancementRewards(ctx);
  ctx.continuous=isContinuousCount(count,ctx);
  if(ctx.continuous){ctx.originalCount=null;ctx.remaining=null;}else{ctx.originalCount=Math.max(1,Math.floor(Number(ctx.originalCount??count)||1));ctx.remaining=Math.max(0,Math.floor(Number(ctx.remaining??ctx.originalCount)||0));}
  if(!Array.isArray(ctx.specialEncounters))ctx.specialEncounters=[];
  ctx.exitRequested=ctx.exitRequested===true;
  ctx.pendingStoryId=typeof ctx.pendingStoryId==="string"?ctx.pendingStoryId:null;
  window.activeMainBattleContext=ctx;
  let defeat=null,local=0,catchUpNeedsFinalSync=false;
  const mainBackgroundStarted=startMainBackground(ctx);
  try{
   while(ctx.continuous||local<ctx.originalCount){
    if(shouldStopContinuous(ctx))break;
    local++;
    let encounter=encounterForContext(ctx,{preview:local===1,existing:currentCombatEncounter});
    if(!encounter)break;
    currentCombatEncounter=encounter;combatRound=ctx.completed+1;combatTotal=ctx.continuous?0:ctx.originalCount;
    const playerLevelBefore=state.level,realBattleTiming=beginRealBattleTiming(encounter,playerLevelBefore,mapIndex,enemyIndex),fastCatchUp=mainFastCatchUp(),suppressPresentation=fastCatchUp;
    if(!suppressPresentation){adventureScreen="combat";render();if(typeof window.mainMinimalModeEnsureCombatHeader==="function")window.mainMinimalModeEnsureCombatHeader({continuous:ctx.continuous});}
    const psBefore=playerCombatStats(),startPlayerHp=state.hp;
    const r=fightOnce(mapIndex,enemyIndex,encounter);
    if(!r.ok){if(typeof realBattleTiming?.unsubscribe==="function")realBattleTiming.unsubscribe();alert(r.reason);break;}
    const roundLabel=ctx.continuous?`連續戰鬥・第 ${combatRound} 場`:ctx.originalCount>1?`第 ${combatRound} / ${ctx.originalCount} 場`:"";
    if(!suppressPresentation)await animateFight(r,startPlayerHp,psBefore.hp,encounter.hp,roundLabel);
    finishRealBattleTiming(realBattleTiming,r);
    if(r.win){ctx.wins++;ctx.totalXp+=r.xp;ctx.totalGold+=r.gold;addContextEnhancementReward(ctx,"battle",r.enhancementStones);addContextEnhancementReward(ctx,"autoSale",r.saleEnhancementStones);if(Array.isArray(r.items)&&r.items.length)ctx.items.push(...r.items);else if(r.item)ctx.items.push({item:r.item,sold:r.sold||0});consumePendingStoryFromResult(ctx,r);}else defeat=r;
    ctx.completed++;if(!ctx.continuous)ctx.remaining=Math.max(0,ctx.originalCount-ctx.completed);
    const catchUpPolicy=fastCatchUp?mainCatchUpStep():null;
    if(fastCatchUp){catchUpNeedsFinalSync=true;if(catchUpPolicy?.shouldPresentBattle){refreshMainCatchUpUi(ctx);await animateFight(r,startPlayerHp,psBefore.hp,encounter.hp,roundLabel);}else{await consumeMainCatchUpDelay(mainStructuredDuration(r));if(catchUpPolicy?.shouldRefreshUi)refreshMainCatchUpUi(ctx);}if((catchUpPolicy?.shouldRefreshUi||catchUpPolicy?.shouldPresentBattle)&&typeof window.backgroundProgressUiYield==="function")await window.backgroundProgressUiYield("main");}else if(ctx.continuous&&typeof window.syncMinimalMode==="function"&&window.getMinimalModeAdapterId?.()==="main")window.syncMinimalMode();
    clearPreviewForContext(ctx);currentCombatEncounter=null;
    if(typeof restorePlayerHp==="function")restorePlayerHp({save:false});else state.hp=playerCombatStats().hp;
    if(!r.win)break;
    if(!fastCatchUp||catchUpPolicy?.shouldCheckpoint)save(false);
    if(ctx.pendingStoryId)break;
    let specialOutcome=false;
    if(typeof maybeHandleSpecialEncounter==="function")specialOutcome=await maybeHandleSpecialEncounter(ctx,r,{mapIndex,enemyIndex,targetContext:boundTarget,parentTargetContext:boundTarget});
    if(specialOutcome?.triggered){if(!specialOutcome.win){battleBusy=false;window.activeMainBattleContext=null;save();return false;}if(shouldStopContinuous(ctx))break;if(hasMoreBattles(ctx)){currentCombatEncounter=encounterForContext(ctx,{preview:false});await consumeMainCatchUpDelay(battleGapMs(r.e.kind));if(catchUpNeedsFinalSync&&!mainFastCatchUp()){const finalPolicy=mainCatchUpFinal();if(finalPolicy?.shouldRefreshUi)refreshMainCatchUpUi(ctx);if(finalPolicy?.shouldCheckpoint)save(false);catchUpNeedsFinalSync=false;}}continue;}
    if(shouldStopContinuous(ctx))break;
    if(hasMoreBattles(ctx)){currentCombatEncounter=encounterForContext(ctx,{preview:false});await consumeMainCatchUpDelay(battleGapMs(r.e.kind));if(catchUpNeedsFinalSync&&!mainFastCatchUp()){const finalPolicy=mainCatchUpFinal();if(finalPolicy?.shouldRefreshUi)refreshMainCatchUpUi(ctx);if(finalPolicy?.shouldCheckpoint)save(false);catchUpNeedsFinalSync=false;}}
   }
   currentCombatEncounter=null;clearPreviewForContext(ctx);battleBusy=false;window.activeMainBattleContext=null;save();render();setTimeout(()=>{showBattleResult(ctx,defeat);if(typeof window.mainMinimalModeHandleBattleResult==="function")window.mainMinimalModeHandleBattleResult(ctx,defeat);},0);return true;
  }finally{stopMainBackground(mainBackgroundStarted);if(battleBusy&&window.activeMainBattleContext===ctx){battleBusy=false;window.activeMainBattleContext=null;}}
 };
 window.MAIN_BATTLE_BACKGROUND_LIFECYCLE_VERSION=1;
 window.MAIN_BATTLE_FAST_CATCH_UP_POLICY_VERSION=1;
 window.MAIN_BATTLE_PIPELINE_CLEANUP_VERSION=1;
 window.MAINLINE_BOSS_STORY_PIPELINE_VERSION=2;
 window.MAIN_MINIMAL_MODE_PIPELINE_HOOK_VERSION=1;
})();