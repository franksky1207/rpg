(function(){
 const CONTINUOUS_COUNT=window.CONTINUOUS_BATTLE_COUNT;
 const REAL_BATTLE_SAMPLE_LIMIT=20;
 const battleGapMs=window.mainBattleGapMs;
 function isContinuousCount(count,ctx=null){return count===CONTINUOUS_COUNT||ctx?.continuous===true;}
 function blankEnhancementRewards(){return {battle:{basic:0,advanced:0},autoSale:{basic:0,advanced:0}};}
 function ensureEnhancementRewards(ctx){
  if(!ctx.enhancementRewards||typeof ctx.enhancementRewards!=="object")ctx.enhancementRewards=blankEnhancementRewards();
  ctx.enhancementRewards.battle=mergeEnhancementStoneRewards({basic:0,advanced:0},ctx.enhancementRewards.battle);
  ctx.enhancementRewards.autoSale=mergeEnhancementStoneRewards({basic:0,advanced:0},ctx.enhancementRewards.autoSale);
  return ctx.enhancementRewards;
 }
 function addContextEnhancementReward(ctx,key,reward){const summary=ensureEnhancementRewards(ctx);summary[key]=mergeEnhancementStoneRewards(summary[key],reward);return summary[key];}
 function createBattleContext(count){
  const continuous=isContinuousCount(count);
  const total=continuous?null:Math.max(1,Math.floor(Number(count)||1));
  return {wins:0,totalXp:0,totalGold:0,items:[],originalCount:total,completed:0,remaining:total,specialEncounters:[],enhancementRewards:blankEnhancementRewards(),continuous,exitRequested:false,pendingStoryId:null};
 }
 function hasMoreBattles(ctx){return ctx?.continuous===true||Number(ctx?.remaining)>0;}
 function shouldStopContinuous(ctx){return ctx?.continuous===true&&ctx?.exitRequested===true;}
 function realBattleSampleMultiplier(playerLevel,enemyLevel){
  const gap=Math.max(0,Math.floor(Number(playerLevel)||1)-Math.floor(Number(enemyLevel)||1));
  if(gap<=3)return 1;
  if(gap<=6)return 1.30;
  if(gap<=10)return 1.60;
  if(gap<=15)return 2;
  return null;
 }
 function beginRealBattleTiming(encounter,playerLevel,mapIdx,enemyIdx){
  if(!encounter||encounter.kind==="boss")return null;
  const multiplier=realBattleSampleMultiplier(playerLevel,encounter.level);
  if(multiplier==null)return null;
  if(typeof window.backgroundProgressEnvironmentIsBackground==="function"&&window.backgroundProgressEnvironmentIsBackground())return null;
  if(typeof window.backgroundProgressHasCatchUpCredit==="function"&&window.backgroundProgressHasCatchUpCredit("main"))return null;
  const kind=encounter.kind==="elite"?"elite":"normal";
  const token={startedAt:Date.now(),interrupted:false,playerLevel:Math.max(1,Math.floor(Number(playerLevel)||1)),enemyLevel:Math.max(1,Math.floor(Number(encounter.level)||1)),kind,map:Math.max(0,Math.floor(Number(mapIdx)||0)),enemy:Math.max(0,Math.floor(Number(enemyIdx)||0)),multiplier,gapMs:battleGapMs(kind),unsubscribe:null};
  if(typeof window.backgroundProgressOnEnvironmentChange==="function")token.unsubscribe=window.backgroundProgressOnEnvironmentChange(isBackground=>{if(isBackground)token.interrupted=true;});
  return token;
 }
 function finishRealBattleTiming(token,result){
  if(!token)return false;
  if(typeof token.unsubscribe==="function")token.unsubscribe();
  if(token.interrupted||result?.win!==true||result?.e?.kind==="boss")return false;
  if(typeof window.backgroundProgressEnvironmentIsBackground==="function"&&window.backgroundProgressEnvironmentIsBackground())return false;
  if(typeof window.backgroundProgressHasCatchUpCredit==="function"&&window.backgroundProgressHasCatchUpCredit("main"))return false;
  const actualMs=Math.round(Date.now()-token.startedAt);
  if(!Number.isFinite(actualMs)||actualMs<100||actualMs>300000)return false;
  const cycleMs=actualMs+token.gapMs;
  const adjustedMs=Math.max(100,Math.round(cycleMs*token.multiplier));
  const sampleVersion=Math.max(0,Math.floor(Number(window.OFFLINE_BATTLE_SAMPLE_VERSION)||0));
  if(sampleVersion<=0)return false;
  if(!state.offline||typeof state.offline!=="object"||Array.isArray(state.offline))state.offline={};
  const samples=(Array.isArray(state.offline.battleSamples)?state.offline.battleSamples:[]).filter(row=>Number(row?.sampleVersion)===sampleVersion);
  samples.push({sampleVersion,actualMs,cycleMs,adjustedMs,playerLevel:token.playerLevel,enemyLevel:token.enemyLevel,kind:token.kind,map:token.map,enemy:token.enemy,multiplier:token.multiplier,recordedAt:Date.now()});
  state.offline.battleSampleVersion=sampleVersion;
  state.offline.battleSamples=samples.slice(-REAL_BATTLE_SAMPLE_LIMIT);
  return true;
 }
 function consumePendingStoryFromResult(ctx,result){
  if(result?.win!==true)return null;
  const storyId=typeof result.pendingStoryId==="string"&&result.pendingStoryId?result.pendingStoryId:null;
  if(!storyId)return null;
  ctx.pendingStoryId=storyId;
  if(ctx.continuous)ctx.exitRequested=true;
  return storyId;
 }

 window.blankBattleEnhancementRewards=blankEnhancementRewards;
 window.ensureBattleEnhancementRewards=ensureEnhancementRewards;
 window.addBattleEnhancementReward=addContextEnhancementReward;
 window.requestContinuousBattleStop=function(){
  const ctx=window.activeMainBattleContext;
  if(!battleBusy||ctx?.continuous!==true)return false;
  ctx.exitRequested=true;
  const btn=document.getElementById("continuousBattleStopBtn");
  if(btn){btn.disabled=true;btn.textContent="本場結束後停止";}
  return true;
 };

 runBattles=async function(count,ctx=null){
  if(battleBusy)return;
  battleBusy=true;
  if(!ctx)ctx=createBattleContext(count);
  ensureEnhancementRewards(ctx);
  ctx.continuous=isContinuousCount(count,ctx);
  if(ctx.continuous){ctx.originalCount=null;ctx.remaining=null;}
  else{
   ctx.originalCount=Math.max(1,Math.floor(Number(ctx.originalCount??count)||1));
   ctx.remaining=Math.max(0,Math.floor(Number(ctx.remaining??ctx.originalCount)||0));
  }
  if(!Array.isArray(ctx.specialEncounters))ctx.specialEncounters=[];
  ctx.exitRequested=ctx.exitRequested===true;
  ctx.pendingStoryId=typeof ctx.pendingStoryId==="string"?ctx.pendingStoryId:null;
  window.activeMainBattleContext=ctx;
  let defeat=null,local=0;

  while(ctx.continuous||local<ctx.originalCount){
   if(shouldStopContinuous(ctx))break;
   local++;
   let encounter=currentCombatEncounter||getPreviewEncounter(selectedMap,selectedEnemy)||createMonsterEncounter(selectedMap,selectedEnemy);
   currentCombatEncounter=encounter;
   combatRound=ctx.completed+1;
   combatTotal=ctx.continuous?0:ctx.originalCount;
   const playerLevelBefore=state.level;
   const realBattleTiming=beginRealBattleTiming(encounter,playerLevelBefore,selectedMap,selectedEnemy);
   adventureScreen="combat";
   render();
   if(typeof window.mainMinimalModeEnsureCombatHeader==="function")window.mainMinimalModeEnsureCombatHeader({continuous:ctx.continuous});

   const psBefore=playerCombatStats(),startPlayerHp=state.hp;
   const r=fightOnce(selectedMap,selectedEnemy,encounter);
   if(!r.ok){if(typeof realBattleTiming?.unsubscribe==="function")realBattleTiming.unsubscribe();alert(r.reason);break}

   const roundLabel=ctx.continuous?`連續戰鬥・第 ${combatRound} 場`:ctx.originalCount>1?`第 ${combatRound} / ${ctx.originalCount} 場`:"";
   await animateFight(r,startPlayerHp,psBefore.hp,encounter.hp,roundLabel);
   finishRealBattleTiming(realBattleTiming,r);

   if(r.win){
    ctx.wins++;
    ctx.totalXp+=r.xp;
    ctx.totalGold+=r.gold;
    addContextEnhancementReward(ctx,"battle",r.enhancementStones);
    addContextEnhancementReward(ctx,"autoSale",r.saleEnhancementStones);
    if(Array.isArray(r.items)&&r.items.length)ctx.items.push(...r.items);
    else if(r.item)ctx.items.push({item:r.item,sold:r.sold||0});
    consumePendingStoryFromResult(ctx,r);
   }else defeat=r;

   ctx.completed++;
   if(!ctx.continuous)ctx.remaining=Math.max(0,ctx.originalCount-ctx.completed);
   if(ctx.continuous&&typeof window.syncMinimalMode==="function"&&window.getMinimalModeAdapterId?.()==="main")window.syncMinimalMode();
   if(ctx.continuous&&typeof window.backgroundProgressUiYield==="function")await window.backgroundProgressUiYield("main");
   clearPreviewEncounter(selectedMap,selectedEnemy);
   currentCombatEncounter=null;

   if(typeof restorePlayerHp==="function")restorePlayerHp({save:false});
   else state.hp=playerCombatStats().hp;

   if(!r.win){
    break;
   }

   save(false);
   if(ctx.pendingStoryId)break;

   let specialOutcome=false;
   if(typeof maybeHandleSpecialEncounter==="function")specialOutcome=await maybeHandleSpecialEncounter(ctx,r);
   if(specialOutcome?.triggered){
    if(!specialOutcome.win){
     battleBusy=false;
     window.activeMainBattleContext=null;
     save();
     return;
    }
    if(shouldStopContinuous(ctx))break;
    if(hasMoreBattles(ctx)){
     currentCombatEncounter=createMonsterEncounter(selectedMap,selectedEnemy);
     await sleep(battleGapMs(r.e.kind));
    }
    continue;
   }

   if(shouldStopContinuous(ctx))break;
   if(hasMoreBattles(ctx)){
    currentCombatEncounter=createMonsterEncounter(selectedMap,selectedEnemy);
    await sleep(battleGapMs(r.e.kind));
   }
  }

  currentCombatEncounter=null;
  if(typeof clearPreviewEncounter==="function")clearPreviewEncounter(selectedMap,selectedEnemy);
  battleBusy=false;
  window.activeMainBattleContext=null;
  save();
  render();
  setTimeout(()=>{
   showBattleResult(ctx,defeat);
   if(typeof window.mainMinimalModeHandleBattleResult==="function")window.mainMinimalModeHandleBattleResult(ctx,defeat);
  },0);
 };
 window.MAIN_BATTLE_PIPELINE_CLEANUP_VERSION=1;
 window.MAINLINE_BOSS_STORY_PIPELINE_VERSION=2;
 window.MAIN_MINIMAL_MODE_PIPELINE_HOOK_VERSION=1;
})();