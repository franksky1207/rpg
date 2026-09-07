(function(){
 const TURN_LIMIT=200;

 fightOnce=function(mapIdx,eIdx,encounter=null){
  if(!enemyUnlocked(mapIdx,eIdx)){
   if(eIdx===4&&state.bossLocked?.[mapIdx])return {ok:false,reason:`Boss 挑戰暫時鎖定，請先擊敗本地圖菁英怪 10 隻（${state.bossProgress[mapIdx]||0}/10）。`};
   return {ok:false,reason:"這隻怪物尚未解鎖。"};
  }
  let e=encounter||createMonsterEncounter(mapIdx,eIdx);
  if(e.kind==="boss"&&!canBoss(mapIdx))return {ok:false,reason:`Boss 挑戰暫時鎖定，請先擊敗本地圖菁英怪 10 隻（${state.bossProgress[mapIdx]||0}/10）。`};
  let ps=equippedStats(),ehp=e.hp,php=state.hp,logs=[],turn=0;
  while(php>0&&ehp>0&&turn<TURN_LIMIT){
   turn++;
   if(Math.random()*100<e.dodge){logs.push(`你攻擊${e.name}，${e.name}閃避了攻擊。`)}
   else{
    let pd=calcDamage(ps.atk,e.def),crit=Math.random()*100<ps.crit;if(crit)pd=ceil(pd*CRIT_DAMAGE_MULTIPLIER);
    ehp-=pd;logs.push(crit?`你攻擊${e.name}，暴擊造成 ${pd} 點傷害。`:`你攻擊${e.name}，造成 ${pd} 點傷害。`);
   }
   if(ehp<=0)break;
   if(Math.random()*100<ps.dodge){logs.push(`${e.name}攻擊你，你閃避了攻擊。`);continue}
   let enemyAtk=e.berserk&&ehp/e.hp<.5?ceil(e.atk*1.20):e.atk;
   let ed=calcDamage(enemyAtk,ps.def),enemyCrit=Math.random()*100<e.crit;if(enemyCrit)ed=ceil(ed*CRIT_DAMAGE_MULTIPLIER);
   php-=ed;logs.push(enemyCrit?`${e.name}攻擊你，暴擊造成 ${ed} 點傷害。`:`${e.name}攻擊你，造成 ${ed} 點傷害。`);
  }
  state.hp=Math.max(0,php);
  if(php<=0){
   logs.push(`你被${e.name}擊敗。`);
   if(e.kind==="boss"){state.bossLocked[mapIdx]=true;state.bossProgress[mapIdx]=0;logs.push(`Boss 再挑戰已鎖定：需再擊敗本地圖菁英怪 10 隻。`)}
   let penalty=applyDeathPenalty(logs);save(false);return {ok:true,win:false,logs,e,penalty};
  }
  if(ehp>0){
   logs.push(`戰鬥超過 ${TURN_LIMIT} 回合，未能分出勝負，本次挑戰結束。`);
   save(false);
   return {ok:true,win:false,logs,e,penalty:{expLost:0,dropped:null},turnLimit:true};
  }
  let xp=expReward(e),gold=goldReward(e);state.gold+=gold;gainExp(xp,logs);
  if(e.kind==="boss"){
   let first=!state.bossKilled[mapIdx];state.bossKilled[mapIdx]=true;state.bossLocked[mapIdx]=false;state.bossProgress[mapIdx]=0;
   if(first&&mapIdx<9){state.unlockedMap=Math.max(state.unlockedMap,mapIdx+1);freeShopRefresh(mapIdx+1)}
  }else{progressEnemyKill(mapIdx,eIdx);addProgress(mapIdx,e.kind)}
  let it=dropItem(e,mapIdx),ir=addItem(it);
  logs.push(`${e.name}被擊敗。獲得 EXP +${xp}、金幣 +${gold}。`);
  if(e.kind==="normal"&&eIdx<2&&state.mapProgress[mapIdx][eIdx]===10)logs.push(`新敵人已出現：${MAPS[mapIdx].enemies[eIdx+1][0]}。`);
  if(e.kind==="normal"&&eIdx===2&&state.mapProgress[mapIdx][2]===10)logs.push(`菁英敵人已出現：${MAPS[mapIdx].enemies[3][0]}。`);
  if(e.kind==="elite"&&!state.bossKilled[mapIdx]&&!state.bossLocked[mapIdx]&&state.mapProgress[mapIdx][3]>=10)logs.push(state.level>=MAPS[mapIdx].max?`Boss 已出現：${MAPS[mapIdx].enemies[4][0]}。`:`菁英進度完成；達到 Lv.${MAPS[mapIdx].max} 後 Boss 才會出現。`);
  if(e.kind==="elite"&&state.bossLocked[mapIdx])logs.push(`Boss 再挑戰進度：${state.bossProgress[mapIdx]}/10 菁英。`);
  if(e.kind==="elite"&&!state.bossLocked[mapIdx]&&state.bossProgress[mapIdx]>=10)logs.push(`Boss 已重新開放，可以再次挑戰。`);
  if(it)logs.push(`${ir.sold?`自動出售 ${itemHtmlPlain(it)}，金幣 +${ir.sold}`:`獲得裝備 ${itemHtmlPlain(it)}`}`);
  save(false);return {ok:true,win:true,logs,e,xp,gold,item:it,sold:ir.sold};
 };
})();
