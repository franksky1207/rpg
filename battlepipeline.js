(function(){
 const INFINITE_COUNT="infinite";
 function isInfiniteCount(count,ctx=null){return count===INFINITE_COUNT||ctx?.infinite===true;}
 function createBattleContext(count){
  const infinite=isInfiniteCount(count);
  const total=infinite?null:Math.max(1,Math.floor(Number(count)||1));
  return {wins:0,totalXp:0,totalGold:0,items:[],originalCount:total,completed:0,remaining:total,totalDungeonProgress:0,gainedDungeonAttempts:0,specialEncounters:[],infinite,exitRequested:false};
 }
 function hasMoreBattles(ctx){return ctx?.infinite===true||Number(ctx?.remaining)>0;}
 function shouldStopInfinite(ctx){return ctx?.infinite===true&&ctx?.exitRequested===true;}

 window.requestInfiniteBattleStop=function(){
  const ctx=window.activeMainBattleContext;
  if(!battleBusy||ctx?.infinite!==true)return false;
  ctx.exitRequested=true;
  const btn=document.getElementById("infiniteBattleStopBtn");
  if(btn){btn.disabled=true;btn.textContent="本場結束後停止";}
  return true;
 };

 runBattles=async function(count,ctx=null){
  if(battleBusy)return;
  battleBusy=true;
  if(!ctx)ctx=createBattleContext(count);
  ctx.infinite=isInfiniteCount(count,ctx);
  if(ctx.infinite){ctx.originalCount=null;ctx.remaining=null;}
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

  while(ctx.infinite||local<ctx.originalCount){
   if(shouldStopInfinite(ctx))break;
   local++;
   let encounter=currentCombatEncounter||getPreviewEncounter(selectedMap,selectedEnemy)||createMonsterEncounter(selectedMap,selectedEnemy);
   currentCombatEncounter=encounter;
   combatRound=ctx.completed+1;
   combatTotal=ctx.infinite?0:ctx.originalCount;
   adventureScreen="combat";
   render();
   await sleep(60);

   const psBefore=playerCombatStats(),startPlayerHp=state.hp,playerLevelBefore=state.level;
   const r=fightOnce(selectedMap,selectedEnemy,encounter);
   if(!r.ok){alert(r.reason);break}

   const roundLabel=ctx.infinite?`無限連戰・第 ${combatRound} 場`:ctx.originalCount>1?`第 ${combatRound} / ${ctx.originalCount} 場`:"";
   await animateFight(r,startPlayerHp,psBefore.hp,encounter.hp,roundLabel);

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
   if(!ctx.infinite)ctx.remaining=Math.max(0,ctx.originalCount-ctx.completed);
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
    if(shouldStopInfinite(ctx))break;
    if(hasMoreBattles(ctx)){
     currentCombatEncounter=createMonsterEncounter(selectedMap,selectedEnemy);
     await sleep(r.e.kind==="elite"?220:140);
    }else save();
    continue;
   }

   if(shouldStopInfinite(ctx))break;
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