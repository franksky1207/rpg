(function(){
 function numberOr(value,fallback=0){
  const n=Number(value);
  return Number.isFinite(n)?n:fallback;
 }
 function specLevel(key,useTest=false){
  return typeof window.specializationLevel==="function"?Math.max(0,Number(window.specializationLevel(key,useTest))||0):0;
 }

 window.runCombatCore=function(player,enemy,startHp=null,options={}){
  const p=player&&typeof player==="object"?player:{};
  const e=enemy&&typeof enemy==="object"?enemy:{};
  const name=String(e.name||options.enemyName||"敵人");
  const logs=options.logs===false?null:[];
  const events=[];
  const useTest=options.useTestSpecializations===true;
  const spec={
   initiative:specLevel("initiative",useTest),
   combo:specLevel("combo",useTest),
   penetration:specLevel("penetration",useTest),
   counter:specLevel("counter",useTest),
   drain:specLevel("drain",useTest)
  };
  const initialHp=startHp==null?numberOr(p.hp,0):numberOr(startHp,0);
  const playerMaxHp=Math.max(1,numberOr(p.hp,1));
  let php=Math.max(0,initialHp);
  let ehp=Math.max(1,numberOr(e.hp,1));
  const enemyMaxHp=ehp;
  let turns=0;
  let berserkShown=false;

  function playerAttack(source="normal",initiative=false){
   const scale=source==="combo"?.50:source==="counter"?.40:1;
   if(Math.random()*100<numberOr(e.dodge,0)){
    events.push({type:"dodge",target:"enemy",source});
    if(logs)logs.push(options.mainlineLogs?`你攻擊${name}，${name}閃避了攻擊。`:`${name}閃避了你的攻擊。`);
    return false;
   }

   const penetration=spec.penetration>0&&Math.random()*100<spec.penetration;
   const effectiveDef=numberOr(e.def,0)*(penetration?.75:1);
   let damage=calcDamage(numberOr(p.atk,0),effectiveDef);
   if(initiative&&spec.initiative>0)damage=ceil(damage*(1+spec.initiative*.02));
   const crit=Math.random()*100<numberOr(p.crit,0);
   if(crit)damage=ceil(damage*CRIT_DAMAGE_MULTIPLIER);
   damage=Math.max(1,ceil(damage*scale));

   const before=Math.max(0,ehp);
   const actualDamage=Math.min(before,damage);
   ehp-=damage;
   events.push({type:"attack",actor:"player",source,damage,actualDamage,crit,penetration,initiative:!!initiative});
   if(logs)logs.push(crit?`你攻擊${name}，暴擊造成 ${damage} 點傷害。`:`你攻擊${name}，造成 ${damage} 點傷害。`);

   if(spec.drain>0&&actualDamage>0&&Math.random()*100<spec.drain){
    const wanted=Math.max(1,ceil(actualDamage*.10));
    const healed=Math.max(0,Math.min(wanted,playerMaxHp-php));
    php+=healed;
    events.push({type:"drain",source,healed,actualDamage});
   }
   return true;
  }

  function playerChain(initialSource="normal",initiative=false){
   let source=initialSource,first=true;
   while(php>0&&ehp>0){
    playerAttack(source,first&&initiative);
    first=false;
    if(ehp<=0)break;
    if(spec.combo<=0||Math.random()*100>=spec.combo)break;
    events.push({type:"combo",from:source});
    source="combo";
   }
  }

  while(php>0&&ehp>0){
   turns++;
   playerChain("normal",turns===1);
   if(ehp<=0)break;

   if(Math.random()*100<numberOr(p.dodge,0)){
    events.push({type:"dodge",target:"player",source:"enemy"});
    if(logs)logs.push(`${name}攻擊你，你閃避了攻擊。`);
    continue;
   }

   const baseAtk=Math.max(1,numberOr(e.atk,1));
   const berserk=!!e.berserk&&ehp/enemyMaxHp<.5;
   if(berserk&&!berserkShown){berserkShown=true;events.push({type:"berserk",actor:"enemy"});}
   const enemyAtk=berserk?ceil(baseAtk*1.20):baseAtk;
   let damage=calcDamage(enemyAtk,numberOr(p.def,0));
   const crit=Math.random()*100<numberOr(e.crit,0);
   if(crit)damage=ceil(damage*CRIT_DAMAGE_MULTIPLIER);
   const actualDamage=Math.min(Math.max(0,php),damage);
   php-=damage;
   events.push({type:"attack",actor:"enemy",source:"normal",damage,actualDamage,crit,berserk});
   if(logs)logs.push(crit?`${name}攻擊你，暴擊造成 ${damage} 點傷害。`:`${name}攻擊你，造成 ${damage} 點傷害。`);

   if(php<=0)break;
   if(actualDamage>0&&spec.counter>0&&Math.random()*100<spec.counter){
    events.push({type:"counter"});
    playerChain("counter",false);
   }
  }

  return {
   win:ehp<=0,
   hp:Math.max(0,php),
   enemyHp:Math.max(0,ehp),
   turns,
   logs:logs||[],
   events,
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

  const ps=playerCombatStats();
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
   return {ok:true,win:false,logs,events:combat.events,e,penalty,combatEndHp,turns:combat.turns};
  }

  const xp=expReward(e),gold=goldReward(e);
  state.gold+=gold;
  gainExp(xp,logs);
  if(e.kind==="boss"){
   const first=!state.bossKilled[mapIdx];
   state.bossKilled[mapIdx]=true;
   state.bossLocked[mapIdx]=false;
   state.bossProgress[mapIdx]=0;
   if(first&&mapIdx<MAPS.length-1){state.unlockedMap=Math.max(state.unlockedMap,mapIdx+1);freeShopRefresh(mapIdx+1);}
  }else{
   progressEnemyKill(mapIdx,eIdx);
   addProgress(mapIdx,e.kind);
  }

  const items=[];
  const it=dropItem(e,mapIdx),ir=addItem(it);
  if(it)items.push({item:it,sold:ir.sold||0});
  if(e.kind==="boss"&&(state.vipLevel||0)>=16&&Math.random()<.15){
   const extra=dropItem(e,mapIdx);
   if(extra){
    const extraResult=addItem(extra);
    items.push({item:extra,sold:extraResult.sold||0,vip16Extra:true});
   }
  }

  logs.push(`${e.name}被擊敗。獲得 EXP +${xp}、金幣 +${gold}。`);
  if(e.kind==="normal"&&eIdx<2&&state.mapProgress[mapIdx][eIdx]===10)logs.push(`新敵人已出現：${MAPS[mapIdx].enemies[eIdx+1][0]}。`);
  if(e.kind==="normal"&&eIdx===2&&state.mapProgress[mapIdx][2]===10)logs.push(`菁英敵人已出現：${MAPS[mapIdx].enemies[3][0]}。`);
  if(e.kind==="elite"&&!state.bossKilled[mapIdx]&&!state.bossLocked[mapIdx]&&state.mapProgress[mapIdx][3]>=10)logs.push(state.level>=MAPS[mapIdx].max?`Boss 已出現：${MAPS[mapIdx].enemies[4][0]}。`:`菁英進度完成；達到 Lv.${MAPS[mapIdx].max} 後 Boss 才會出現。`);
  if(e.kind==="elite"&&state.bossLocked[mapIdx])logs.push(`Boss 再挑戰進度：${state.bossProgress[mapIdx]}/10 菁英。`);
  if(e.kind==="elite"&&!state.bossLocked[mapIdx]&&state.bossProgress[mapIdx]>=10)logs.push(`Boss 已重新開放，可以再次挑戰。`);
  items.forEach(row=>logs.push(`${row.sold?`自動出售 ${itemHtmlPlain(row.item)}，金幣 +${row.sold}`:`獲得裝備 ${itemHtmlPlain(row.item)}`}`));
  save(false);
  return {ok:true,win:true,logs,events:combat.events,e,xp,gold,item:items[0]?.item||null,sold:items[0]?.sold||0,items,combatEndHp,turns:combat.turns};
 };
})();