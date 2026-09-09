(function(){
 function numberOr(value,fallback=0){
  const n=Number(value);
  return Number.isFinite(n)?n:fallback;
 }

 window.runCombatCore=function(player,enemy,startHp=null,options={}){
  const p=player&&typeof player==="object"?player:{};
  const e=enemy&&typeof enemy==="object"?enemy:{};
  const name=String(e.name||options.enemyName||"敵人");
  const logs=options.logs===false?null:[];
  const initialHp=startHp==null?numberOr(p.hp,0):numberOr(startHp,0);
  let php=Math.max(0,initialHp);
  let ehp=Math.max(1,numberOr(e.hp,1));
  const enemyMaxHp=ehp;
  let turns=0;

  while(php>0&&ehp>0){
   turns++;

   if(Math.random()*100<numberOr(e.dodge,0)){
    if(logs)logs.push(options.mainlineLogs?`你攻擊${name}，${name}閃避了攻擊。`:`${name}閃避了你的攻擊。`);
   }else{
    let damage=calcDamage(numberOr(p.atk,0),numberOr(e.def,0));
    const crit=Math.random()*100<numberOr(p.crit,0);
    if(crit)damage=ceil(damage*CRIT_DAMAGE_MULTIPLIER);
    ehp-=damage;
    if(logs)logs.push(crit?`你攻擊${name}，暴擊造成 ${damage} 點傷害。`:`你攻擊${name}，造成 ${damage} 點傷害。`);
   }

   if(ehp<=0)break;

   if(Math.random()*100<numberOr(p.dodge,0)){
    if(logs)logs.push(`${name}攻擊你，你閃避了攻擊。`);
    continue;
   }

   const baseAtk=Math.max(1,numberOr(e.atk,1));
   const enemyAtk=e.berserk&&ehp/enemyMaxHp<.5?ceil(baseAtk*1.20):baseAtk;
   let damage=calcDamage(enemyAtk,numberOr(p.def,0));
   const crit=Math.random()*100<numberOr(e.crit,0);
   if(crit)damage=ceil(damage*CRIT_DAMAGE_MULTIPLIER);
   php-=damage;
   if(logs)logs.push(crit?`${name}攻擊你，暴擊造成 ${damage} 點傷害。`:`${name}攻擊你，造成 ${damage} 點傷害。`);
  }

  return {
   win:ehp<=0,
   hp:Math.max(0,php),
   enemyHp:Math.max(0,ehp),
   turns,
   logs:logs||[],
   e:enemy
  };
 };

 fightOnce=function(mapIdx,eIdx,encounter=null){
  if(!enemyUnlocked(mapIdx,eIdx)){
   if(eIdx===4&&state.bossLocked?.[mapIdx])return {ok:false,reason:`Boss 挑戰暫時鎖定，請先擊敗本地圖菁英怪 10 隻（${state.bossProgress[mapIdx]||0}/10）。`};
   return {ok:false,reason:"這隻怪物尚未解鎖。"};
  }
  const e=encounter||createMonsterEncounter(mapIdx,eIdx);
  if(e.kind==="boss"&&!canBoss(mapIdx))return {ok:false,reason:`Boss 挑戰暫時鎖定，請先擊敗本地圖菁英怪 10 隻（${state.bossProgress[mapIdx]||0}/10）。`};

  const ps=equippedStats();
  const combat=runCombatCore(ps,e,state.hp,{mainlineLogs:true});
  state.hp=combat.hp;
  const combatEndHp=state.hp;
  const logs=combat.logs;

  if(!combat.win){
   logs.push(`你被${e.name}擊敗。`);
   if(e.kind==="boss"){
    state.bossLocked[mapIdx]=true;
    state.bossProgress[mapIdx]=0;
    logs.push(`Boss 再挑戰已鎖定：需再擊敗本地圖菁英怪 10 隻。`);
   }
   const penalty=applyDeathPenalty(logs);
   save(false);
   return {ok:true,win:false,logs,e,penalty,combatEndHp,turns:combat.turns};
  }

  const xp=expReward(e),gold=goldReward(e);
  state.gold+=gold;
  gainExp(xp,logs);
  if(e.kind==="boss"){
   const first=!state.bossKilled[mapIdx];
   state.bossKilled[mapIdx]=true;
   state.bossLocked[mapIdx]=false;
   state.bossProgress[mapIdx]=0;
   if(first&&mapIdx<9){state.unlockedMap=Math.max(state.unlockedMap,mapIdx+1);freeShopRefresh(mapIdx+1);}
  }else{
   progressEnemyKill(mapIdx,eIdx);
   addProgress(mapIdx,e.kind);
  }
  const it=dropItem(e,mapIdx),ir=addItem(it);
  logs.push(`${e.name}被擊敗。獲得 EXP +${xp}、金幣 +${gold}。`);
  if(e.kind==="normal"&&eIdx<2&&state.mapProgress[mapIdx][eIdx]===10)logs.push(`新敵人已出現：${MAPS[mapIdx].enemies[eIdx+1][0]}。`);
  if(e.kind==="normal"&&eIdx===2&&state.mapProgress[mapIdx][2]===10)logs.push(`菁英敵人已出現：${MAPS[mapIdx].enemies[3][0]}。`);
  if(e.kind==="elite"&&!state.bossKilled[mapIdx]&&!state.bossLocked[mapIdx]&&state.mapProgress[mapIdx][3]>=10)logs.push(state.level>=MAPS[mapIdx].max?`Boss 已出現：${MAPS[mapIdx].enemies[4][0]}。`:`菁英進度完成；達到 Lv.${MAPS[mapIdx].max} 後 Boss 才會出現。`);
  if(e.kind==="elite"&&state.bossLocked[mapIdx])logs.push(`Boss 再挑戰進度：${state.bossProgress[mapIdx]}/10 菁英。`);
  if(e.kind==="elite"&&!state.bossLocked[mapIdx]&&state.bossProgress[mapIdx]>=10)logs.push(`Boss 已重新開放，可以再次挑戰。`);
  if(it)logs.push(`${ir.sold?`自動出售 ${itemHtmlPlain(it)}，金幣 +${ir.sold}`:`獲得裝備 ${itemHtmlPlain(it)}`}`);
  save(false);
  return {ok:true,win:true,logs,e,xp,gold,item:it,sold:ir.sold,combatEndHp,turns:combat.turns};
 };
})();
