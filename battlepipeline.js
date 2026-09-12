(function(){
 const CONTINUOUS_COUNT="continuous";
 const REAL_BATTLE_SAMPLE_LIMIT=20;
 function isContinuousCount(count,ctx=null){return count===CONTINUOUS_COUNT||ctx?.continuous===true;}
 function createBattleContext(count){
  const continuous=isContinuousCount(count);
  const total=continuous?null:Math.max(1,Math.floor(Number(count)||1));
  return {wins:0,totalXp:0,totalGold:0,items:[],originalCount:total,completed:0,remaining:total,totalDungeonProgress:0,gainedDungeonAttempts:0,specialEncounters:[],continuous,exitRequested:false,infinite:continuous};
 }
 function hasMoreBattles(ctx){return ctx?.continuous===true||Number(ctx?.remaining)>0;}
 function shouldStopContinuous(ctx){return ctx?.continuous===true&&ctx?.exitRequested===true;}
 function realBattleSampleMultiplier(playerLevel,enemyLevel){
  const gap=Math.max(0,Math.floor(Number(playerLevel)||1)-Math.floor(Number(enemyLevel)||1));
  if(gap<=3)return 1;
  if(gap<=6)return 1.10;
  if(gap<=10)return 1.25;
  if(gap<=15)return 1.50;
  return 2;
 }
 function beginRealBattleTiming(encounter,playerLevel,mapIdx,enemyIdx){
  if(!encounter||encounter.kind==="boss")return null;
  if(typeof window.backgroundProgressEnvironmentIsBackground==="function"&&window.backgroundProgressEnvironmentIsBackground())return null;
  const token={startedAt:Date.now(),interrupted:false,playerLevel:Math.max(1,Math.floor(Number(playerLevel)||1)),enemyLevel:Math.max(1,Math.floor(Number(encounter.level)||1)),kind:encounter.kind==="elite"?"elite":"normal",map:Math.max(0,Math.floor(Number(mapIdx)||0)),enemy:Math.max(0,Math.floor(Number(enemyIdx)||0)),unsubscribe:null};
  if(typeof window.backgroundProgressOnEnvironmentChange==="function")token.unsubscribe=window.backgroundProgressOnEnvironmentChange(isBackground=>{if(isBackground)token.interrupted=true;});
  return token;
 }
 function finishRealBattleTiming(token,result){
  if(!token)return false;
  if(typeof token.unsubscribe==="function")token.unsubscribe();
  if(token.interrupted||result?.win!==true||result?.e?.kind==="boss")return false;
  if(typeof window.backgroundProgressEnvironmentIsBackground==="function"&&window.backgroundProgressEnvironmentIsBackground())return false;
  const actualMs=Math.round(Date.now()-token.startedAt);
  if(!Number.isFinite(actualMs)||actualMs<100||actualMs>300000)return false;
  const multiplier=realBattleSampleMultiplier(token.playerLevel,token.enemyLevel);
  const adjustedMs=Math.max(100,Math.round(actualMs*multiplier));
  if(!state.offline||typeof state.offline!=="object"||Array.isArray(state.offline))state.offline={};
  const samples=Array.isArray(state.offline.battleSamples)?state.offline.battleSamples:[];
  samples.push({actualMs,adjustedMs,playerLevel:token.playerLevel,enemyLevel:token.enemyLevel,kind:token.kind,map:token.map,enemy:token.enemy,multiplier,recordedAt:Date.now()});
  state.offline.battleSamples=samples.slice(-REAL_BATTLE_SAMPLE_LIMIT);
  return true;
 }

 window.requestContinuousBattleStop=function(){
  const ctx=window.activeMainBattleContext;
  if(!battleBusy||ctx?.continuous!==true)return false;
  ctx.exitRequested=true;
  const btn=document.getElementById("continuousBattleStopBtn")||document.getElementById("infiniteBattleStopBtn");
  if(btn){btn.disabled=true;btn.textContent="本場結束後停止";}
  return true;
 };
 // 舊特殊遭遇畫面仍可能呼叫這個名稱；僅保留 runtime 相容，不再作為正式模式。
 window.requestInfiniteBattleStop=function(){return window.requestContinuousBattleStop();};

 runBattles=async function(count,ctx=null){
  if(battleBusy)return;
  battleBusy=true;
  if(!ctx)ctx=createBattleContext(count);
  ctx.continuous=isContinuousCount(count,ctx);
  // 特殊遭遇舊畫面只讀取 ctx.infinite；不寫入存檔，待該畫面日後直接收斂。
  ctx.infinite=ctx.continuous;
  if(ctx.continuous){ctx.originalCount=null;ctx.remaining=null;}
  else{
   ctx.originalCount=Math.max(1,Math.floor(Number(ctx.originalCount??count)||1));
   ctx.remaining=Math.max(0,Math.floor(Number(ctx.remaining??ctx.originalCount)||0));
  }
  if(typeof ctx.totalDungeonProgress!=="number")ctx.totalDungeonProgress=0;
  if(typeof ctx.gainedDungeonAttempts!=="number")ctx.gainedDungeonAttempts=0;
  if(!Array.isArray(ctx.specialEncounters))ctx.specialEncounters=[];
  ctx.exitRequested=ctx.exitRequested===true;
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
   await sleep(60);

   const psBefore=playerCombatStats(),startPlayerHp=state.hp;
   const r=fightOnce(selectedMap,selectedEnemy,encounter);
   if(!r.ok){if(typeof realBattleTiming?.unsubscribe==="function")realBattleTiming.unsubscribe();alert(r.reason);break}

   const roundLabel=ctx.continuous?`連續戰鬥・第 ${combatRound} 場`:ctx.originalCount>1?`第 ${combatRound} / ${ctx.originalCount} 場`:"";
   await animateFight(r,startPlayerHp,psBefore.hp,encounter.hp,roundLabel);
   finishRealBattleTiming(realBattleTiming,r);

   const dungeonResult=typeof awardDungeonProgressForBattle==="function"?awardDungeonProgressForBattle({
    source:"main",
    win:r.win===true,
    enemyMaxHp:encounter.hp,
    playerLevel:playerLevelBefore,
    playerMaxHp:psBefore.hp,
    startHp:startPlayerHp,
    endHp:typeof r.combatEndHp==="number"?r.combatEndHp:state.hp
   }):null;
   if(dungeonResult){
    ctx.totalDungeonProgress+=Number(dungeonResult.added)||0;
    ctx.gainedDungeonAttempts+=Number(dungeonResult.gainedAttempts)||0;
   }

   if(r.win){
    ctx.wins++;
    ctx.totalXp+=r.xp;
    ctx.totalGold+=r.gold;
    if(Array.isArray(r.items)&&r.items.length)ctx.items.push(...r.items);
    else if(r.item)ctx.items.push({item:r.item,sold:r.sold||0});
   }else defeat=r;

   ctx.completed++;
   if(!ctx.continuous)ctx.remaining=Math.max(0,ctx.originalCount-ctx.completed);
   clearPreviewEncounter(selectedMap,selectedEnemy);
   currentCombatEncounter=null;

   if(typeof restorePlayerHp==="function")restorePlayerHp({save:false});
   else state.hp=playerCombatStats().hp;

   if(!r.win){
    adventureScreen="prepare";
    save();
    break;
   }

   save(false);
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
     await sleep(r.e.kind==="elite"?220:140);
    }else save();
    continue;
   }

   if(shouldStopContinuous(ctx))break;
   if(hasMoreBattles(ctx)){
    save(false);
    currentCombatEncounter=createMonsterEncounter(selectedMap,selectedEnemy);
    await sleep(r.e.kind==="elite"?220:140);
   }else save();
  }

  currentCombatEncounter=null;
  if(typeof clearPreviewEncounter==="function")clearPreviewEncounter(selectedMap,selectedEnemy);
  battleBusy=false;
  window.activeMainBattleContext=null;
  save();
  render();
  setTimeout(()=>showBattleResult(ctx,defeat),0);
 };
})();