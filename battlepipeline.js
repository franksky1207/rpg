(function(){
 runBattles=async function(count,ctx=null){
  if(battleBusy)return;
  battleBusy=true;
  if(!ctx)ctx={wins:0,totalXp:0,totalGold:0,items:[],originalCount:count,completed:0,remaining:count,totalDungeonProgress:0,gainedDungeonAttempts:0,specialEncounters:[]};
  if(typeof ctx.totalDungeonProgress!=="number")ctx.totalDungeonProgress=0;
  if(typeof ctx.gainedDungeonAttempts!=="number")ctx.gainedDungeonAttempts=0;
  if(!Array.isArray(ctx.specialEncounters))ctx.specialEncounters=[];
  let defeat=null;

  for(let local=1;local<=count;local++){
   let encounter=currentCombatEncounter||getPreviewEncounter(selectedMap,selectedEnemy)||createMonsterEncounter(selectedMap,selectedEnemy);
   currentCombatEncounter=encounter;
   combatRound=ctx.completed+1;
   combatTotal=ctx.originalCount;
   adventureScreen="combat";
   render();
   await sleep(60);

   const psBefore=playerCombatStats(),startPlayerHp=state.hp,playerLevelBefore=state.level;
   const r=fightOnce(selectedMap,selectedEnemy,encounter);
   if(!r.ok){alert(r.reason);break}

   await animateFight(r,startPlayerHp,psBefore.hp,encounter.hp,ctx.originalCount>1?`第 ${combatRound} / ${ctx.originalCount} 場`:"");

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
   }else{
    defeat=r;
   }

   ctx.completed++;
   ctx.remaining=Math.max(0,ctx.originalCount-ctx.completed);
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
     save();
     return;
    }
    if(ctx.remaining>0){
     currentCombatEncounter=createMonsterEncounter(selectedMap,selectedEnemy);
     await sleep(r.e.kind==="elite"?220:140);
    }else{
     save();
    }
    continue;
   }

   if(ctx.remaining>0){
    save(false);
    currentCombatEncounter=createMonsterEncounter(selectedMap,selectedEnemy);
    await sleep(r.e.kind==="elite"?220:140);
   }else{
    save();
   }
  }

  battleBusy=false;
  save();
  render();
  setTimeout(()=>showBattleResult(ctx,defeat),0);
 };
})();