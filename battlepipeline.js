(function(){
 const beforeFightHooks=[];

 window.registerBattleBeforeFightHook=function(fn){
  if(typeof fn!=="function"||beforeFightHooks.includes(fn))return;
  beforeFightHooks.push(fn);
 };

 async function runBeforeFightHooks(ctx){
  for(const hook of beforeFightHooks){
   if(await hook(ctx))return true;
  }
  return false;
 }

 if(typeof window.maybeHandleSpecialEncounter==="function"){
  registerBattleBeforeFightHook(window.maybeHandleSpecialEncounter);
 }

 runBattles=async function(count,ctx=null){
  if(battleBusy)return;
  battleBusy=true;
  if(!ctx)ctx={wins:0,totalXp:0,totalGold:0,items:[],originalCount:count,completed:0,remaining:count};
  let defeat=null;

  for(let local=1;local<=count;local++){
   if(await runBeforeFightHooks(ctx)){
    battleBusy=false;
    save();
    return;
   }

   let encounter=currentCombatEncounter||getPreviewEncounter(selectedMap,selectedEnemy)||createMonsterEncounter(selectedMap,selectedEnemy);
   currentCombatEncounter=encounter;
   combatRound=ctx.completed+1;
   combatTotal=ctx.originalCount;
   adventureScreen="combat";
   render();
   await sleep(60);

   const psBefore=equippedStats(),startPlayerHp=state.hp;
   const r=fightOnce(selectedMap,selectedEnemy,encounter);
   if(!r.ok){alert(r.reason);break}

   await animateFight(r,startPlayerHp,psBefore.hp,encounter.hp,ctx.originalCount>1?`第 ${combatRound} / ${ctx.originalCount} 場`:"");

   if(r.win){
    ctx.wins++;
    ctx.totalXp+=r.xp;
    ctx.totalGold+=r.gold;
    if(r.item)ctx.items.push({item:r.item,sold:r.sold||0});
   }else{
    defeat=r;
   }

   ctx.completed++;
   ctx.remaining=Math.max(0,ctx.originalCount-ctx.completed);
   save();
   clearPreviewEncounter(selectedMap,selectedEnemy);
   currentCombatEncounter=null;

   if(!r.win)break;

   if(ctx.originalCount>1&&ctx.remaining>0&&lowHp()){
    render();
    pendingContinuousBattle=ctx;
    battleBusy=false;
    showRiskModal("continuous",ctx.remaining);
    return;
   }

   if(ctx.remaining>0){
    currentCombatEncounter=createMonsterEncounter(selectedMap,selectedEnemy);
    await sleep(r.e.kind==="elite"?220:140);
   }
  }

  battleBusy=false;
  save();
  render();
  setTimeout(()=>showBattleResult(ctx,defeat),0);
 };
})();