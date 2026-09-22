(function(){
 function numberOr(value,fallback=0){
  const n=Number(value);
  return Number.isFinite(n)?n:fallback;
 }
 function specBonus(key,useTest=false){
  if(typeof window.specializationPercentBonus==="function")return Math.max(0,Number(window.specializationPercentBonus(key,useTest))||0);
  if(typeof window.specializationLevel==="function")return Math.max(0,Number(window.specializationLevel(key,useTest))||0);
  return 0;
 }

 window.COMBAT_PLAYER_FINAL_DAMAGE_LAYER_VERSION=1;
 window.runCombatCore=function(player,enemy,startHp=null,options={}){
  const p=player&&typeof player==="object"?player:{};
  const e=enemy&&typeof enemy==="object"?enemy:{};
  const name=String(e.name||options.enemyName||"敵人");
  const logs=options.logs===false?null:[];
  const events=[];
  const rng=typeof options.rng==="function"?options.rng:Math.random;
  const useTest=options.useTestSpecializations===true;
  const useTestMarks=options.useTestMarks===true||useTest;
  const maxTurns=Math.max(0,Math.floor(numberOr(options.maxTurns,0)));
  const skipPlayerAction=options.skipPlayerAction===true;
  const skipEnemyAction=options.skipEnemyAction===true;
  const playerFinalDamageMultiplier=Math.max(0,numberOr(options.playerFinalDamageMultiplier,1));
  const spec={
   initiative:specBonus("initiative",useTest),
   combo:specBonus("combo",useTest),
   penetration:specBonus("penetration",useTest),
   counter:specBonus("counter",useTest),
   drain:specBonus("drain",useTest)
  };
  const markKeys=Array.from(window.MARK_KEYS||[]);
  const explicitMarkLevels=options.markLevels&&typeof options.markLevels==="object"?options.markLevels:null;
  const markLevels=Object.fromEntries(markKeys.map(key=>[
   key,
   explicitMarkLevels&&typeof window.markClampLevel==="function"
    ?window.markClampLevel(explicitMarkLevels[key])
    :(typeof window.markLevel==="function"?window.markLevel(key,useTestMarks):0)
  ]));
  const markEffects=Object.fromEntries(markKeys.map(key=>[
   key,
   typeof window.markEffectSnapshot==="function"?window.markEffectSnapshot(key,markLevels[key]):{id:key,level:markLevels[key]||0,active:false}
  ]));
  const initialHp=startHp==null?numberOr(p.hp,0):numberOr(startHp,0);
  const playerMaxHp=Math.max(1,numberOr(p.hp,1));
  let php=Math.max(0,initialHp);
  const enemyMaxHp=Math.max(1,numberOr(e.hp,1));
  const enemyStartHp=options.enemyStartHp==null?enemyMaxHp:Math.max(1,Math.min(enemyMaxHp,numberOr(options.enemyStartHp,enemyMaxHp)));
  let ehp=enemyStartHp;
  let turns=0;
  let berserkShown=false;
  let shield=0;
  let indomitableActivated=false;
  let indomitableUsed=false;
  let battleSpiritActivated=false;
  let battleSpiritLayer=0;
  let revengeReady=false;

  function rollRate(rate,always=false){
   const value=Math.max(0,numberOr(rate,0));
   if(!always&&value<=0)return false;
   return rng()*100<value;
  }
  function combatDamage(atk,def){
   if(typeof window.combatDamageWithRng==="function")return window.combatDamageWithRng(atk,def,rng);
   return calcDamage(atk,def);
  }
  function markEvent(mark,action,data={}){
   events.push({type:"mark",mark,action,...data});
  }
  function activateOpeningMarks(){
   const ward=markEffects.ward||{};
   if(ward.active&&rollRate(ward.activationChance)){
    shield=Math.max(1,ceil(playerMaxHp*numberOr(ward.shieldMaxHpPercent,0)/100));
    markEvent("ward","activate",{shield,maxHp:playerMaxHp,percent:numberOr(ward.shieldMaxHpPercent,0)});
   }
   const indomitable=markEffects.indomitable||{};
   if(indomitable.active&&rollRate(indomitable.activationChance)){
    indomitableActivated=true;
    markEvent("indomitable","activate",{uses:1});
   }
   const battleSpirit=markEffects.battleSpirit||{};
   if(battleSpirit.active&&rollRate(battleSpirit.activationChance)){
    battleSpiritActivated=true;
    markEvent("battleSpirit","activate",{maxLayers:Math.max(0,Math.floor(numberOr(battleSpirit.maxLayers,10))),atkPercentPerLayer:numberOr(battleSpirit.atkPercentPerLayer,0)});
   }
  }
  function beginRoundMarks(){
   if(!battleSpiritActivated)return;
   const effect=markEffects.battleSpirit||{};
   const maxLayers=Math.max(0,Math.floor(numberOr(effect.maxLayers,10)));
   battleSpiritLayer=Math.min(maxLayers,battleSpiritLayer+1);
   markEvent("battleSpirit","layer",{round:turns,layer:battleSpiritLayer,atkPercent:numberOr(effect.atkPercentPerLayer,0)*battleSpiritLayer});
  }
  function playerAttack(source="normal",initiative=false){
   const scale=source==="combo"?.50:source==="counter"?.40:1;
   const suppression=Math.max(0,numberOr(markEffects.suppression?.enemyDodgeReductionPoints,0));
   const rawEnemyDodge=Math.max(0,numberOr(e.dodge,0));
   const enemyDodge=Math.max(0,rawEnemyDodge-suppression);
   const enemyDodgeRoll=rng()*100;
   if(suppression>0&&enemyDodgeRoll<rawEnemyDodge&&enemyDodgeRoll>=enemyDodge){
    markEvent("suppression","preventDodge",{source,reductionPoints:suppression,originalRate:rawEnemyDodge,finalRate:enemyDodge});
   }
   if(enemyDodgeRoll<enemyDodge){
    events.push({type:"dodge",target:"enemy",source,rate:enemyDodge});
    if(logs)logs.push(options.mainlineLogs?`你攻擊${name}，${name}閃避了攻擊。`:`${name}閃避了你的攻擊。`);
    return false;
   }

   const ignoreEffect=markEffects.ignore||{};
   const ignoreDefense=ignoreEffect.active&&rollRate(ignoreEffect.triggerChance);
   let penetration=false;
   if(ignoreDefense){
    markEvent("ignore","trigger",{source});
   }else{
    penetration=spec.penetration>0&&rollRate(spec.penetration);
   }
   const effectiveDef=ignoreDefense?0:numberOr(e.def,0)*(penetration?.75:1);
   const spiritPercent=battleSpiritActivated?numberOr(markEffects.battleSpirit?.atkPercentPerLayer,0)*battleSpiritLayer:0;
   const effectiveAtk=numberOr(p.atk,0)*(1+spiritPercent/100);
   let damage=combatDamage(effectiveAtk,effectiveDef);
   const initiativeApplied=initiative&&spec.initiative>0;
   if(initiativeApplied)damage=ceil(damage*(1+spec.initiative/100));

   let crit=false,revengeCrit=false;
   if(revengeReady){
    crit=true;
    revengeCrit=true;
    revengeReady=false;
    markEvent("revenge","consume",{source});
   }else{
    crit=rollRate(numberOr(p.crit,0),true);
   }
   if(crit)damage=ceil(damage*CRIT_DAMAGE_MULTIPLIER);
   damage=Math.max(1,ceil(damage*scale));
   damage=Math.max(1,ceil(damage*playerFinalDamageMultiplier));

   const before=Math.max(0,ehp);
   const actualDamage=Math.min(before,damage);
   ehp-=damage;
   events.push({type:"attack",actor:"player",source,damage,actualDamage,crit,revengeCrit,penetration,ignoreDefense,initiative:initiativeApplied,battleSpiritLayer,battleSpiritAtkPercent:spiritPercent,playerFinalDamageMultiplier});
   if(logs)logs.push(crit?`你攻擊${name}，暴擊造成 ${damage} 點傷害。`:`你攻擊${name}，造成 ${damage} 點傷害。`);

   if(spec.drain>0&&actualDamage>0&&rollRate(spec.drain)){
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
    if(spec.combo<=0||!rollRate(spec.combo))break;
    events.push({type:"combo",from:source});
    source="combo";
   }
  }

  activateOpeningMarks();
  while(php>0&&ehp>0){
   if(maxTurns>0&&turns>=maxTurns)break;
   turns++;
   beginRoundMarks();
   if(!skipPlayerAction)playerChain("normal",turns===1);
   if(ehp<=0)break;
   if(skipEnemyAction)continue;

   if(rollRate(numberOr(p.dodge,0),true)){
    events.push({type:"dodge",target:"player",source:"enemy"});
    if(logs)logs.push(`${name}攻擊你，你閃避了攻擊。`);
    continue;
   }

   const baseAtk=Math.max(1,numberOr(e.atk,1));
   const berserk=!!e.berserk&&ehp/enemyMaxHp<.5;
   if(berserk&&!berserkShown){berserkShown=true;events.push({type:"berserk",actor:"enemy"});}
   const enemyAtk=berserk?ceil(baseAtk*1.20):baseAtk;
   let damage=combatDamage(enemyAtk,numberOr(p.def,0));
   const composure=Math.max(0,numberOr(markEffects.composure?.enemyCritReductionPoints,0));
   const rawEnemyCritRate=Math.max(0,numberOr(e.crit,0));
   const enemyCritRate=Math.max(0,rawEnemyCritRate-composure);
   const enemyCritRoll=rng()*100;
   if(composure>0&&enemyCritRoll<rawEnemyCritRate&&enemyCritRoll>=enemyCritRate){
    markEvent("composure","preventCrit",{reductionPoints:composure,originalRate:rawEnemyCritRate,finalRate:enemyCritRate});
   }
   const crit=enemyCritRoll<enemyCritRate;
   if(crit){
    const baseDamage=damage;
    const resilience=Math.max(0,Math.min(100,numberOr(markEffects.resilience?.enemyCritBonusDamageReductionPercent,0)));
    if(resilience>0){
     const normalCritDamage=ceil(baseDamage*numberOr(CRIT_DAMAGE_MULTIPLIER,1.5));
     const bonus=Math.max(0,baseDamage*(numberOr(CRIT_DAMAGE_MULTIPLIER,1.5)-1));
     damage=ceil(baseDamage+bonus*(1-resilience/100));
     markEvent("resilience","reduceCritDamage",{reductionPercent:resilience,originalDamage:normalCritDamage,finalDamage:damage});
    }else damage=ceil(baseDamage*CRIT_DAMAGE_MULTIPLIER);
   }

   const absorption=markEffects.absorption||{};
   const absorbed=absorption.active&&rollRate(absorption.triggerChance);
   if(absorbed){
    const wanted=Math.max(1,ceil(damage*numberOr(absorption.healOriginalDamagePercent,25)/100));
    const healed=Math.max(0,Math.min(wanted,playerMaxHp-php));
    php+=healed;
    events.push({type:"attack",actor:"enemy",source:"normal",damage,actualDamage:0,crit,berserk,absorbed:true,shieldAbsorbed:0,enemyCritRate});
    markEvent("absorption","trigger",{damage,healed});
    if(logs)logs.push(`${name}攻擊你，但吸收印記化解了傷害。`);
    continue;
   }

   const playerHpBefore=Math.max(0,php);
   let remaining=damage;
   let indomitableTriggered=false;
   const shieldAbsorbed=Math.min(shield,remaining);
   if(shieldAbsorbed>0){
    shield-=shieldAbsorbed;
    remaining-=shieldAbsorbed;
   }
   if(remaining>0){
    const rawAfter=php-remaining;
    if(rawAfter<=0&&indomitableActivated&&!indomitableUsed){
     indomitableUsed=true;
     indomitableTriggered=true;
     php=1;
    }else php=Math.max(0,rawAfter);
   }
   const actualDamage=Math.max(0,playerHpBefore-php);
   events.push({type:"attack",actor:"enemy",source:"normal",damage,actualDamage,crit,berserk,absorbed:false,shieldAbsorbed,enemyCritRate,indomitable:indomitableTriggered});
   if(shieldAbsorbed>0)markEvent("ward","absorb",{amount:shieldAbsorbed,remainingShield:shield});
   if(indomitableTriggered)markEvent("indomitable","survive",{hp:1});
   if(logs)logs.push(crit?`${name}攻擊你，暴擊造成 ${damage} 點傷害。`:`${name}攻擊你，造成 ${damage} 點傷害。`);

   if(php<=0)break;

   const revenge=markEffects.revenge||{};
   if(crit&&revenge.active&&rollRate(revenge.triggerChance)){
    revengeReady=true;
    markEvent("revenge","ready",{});
   }

   const backlash=markEffects.backlash||{};
   if(actualDamage>0&&backlash.active&&rollRate(backlash.triggerChance)){
    const reflected=Math.max(1,ceil(actualDamage*numberOr(backlash.reflectActualHpLossPercent,30)/100));
    const reflectedActual=Math.min(Math.max(0,ehp),reflected);
    ehp-=reflected;
    markEvent("backlash","trigger",{damage:reflected,actualDamage:reflectedActual,hpLoss:actualDamage});
   }
   if(ehp<=0)break;

   if(actualDamage>0&&spec.counter>0&&rollRate(spec.counter)){
    events.push({type:"counter"});
    playerChain("counter",false);
   }
  }

  const result={
   win:ehp<=0,
   hp:Math.max(0,php),
   enemyHp:Math.max(0,ehp),
   enemyStartHp,
   enemyMaxHp,
   playerStartHp:Math.max(0,initialHp),
   playerMaxHp,
   turns,
   logs:logs||[],
   events,
   markState:{
    useTest:useTestMarks,
    levels:{...markLevels},
    shield:Math.max(0,shield),
    indomitableActivated,
    indomitableUsed,
    battleSpiritActivated,
    battleSpiritLayer,
    revengeReady
   },
   e:enemy
  };
  if(options.preparePresentation!==false&&typeof window.prepareCombatPresentation==="function")window.prepareCombatPresentation(result,options);
  return result;
 };
 window.COMBAT_MARK_INTEGRATION_VERSION=1;
 window.COMBAT_PERSISTENT_ENEMY_HP_VERSION=1;

 fightOnce=function(mapIdx,eIdx,encounter=null){
  if(!enemyUnlocked(mapIdx,eIdx)){
   if(eIdx===4&&state.bossLocked?.[mapIdx])return {ok:false,reason:`Boss 挑戰暫時鎖定，請先擊敗本地圖菁英怪 10 隻（${state.bossProgress[mapIdx]||0}/10）。`};
   return {ok:false,reason:"這隻怪物尚未解鎖。"};
  }
  const e=encounter||createMonsterEncounter(mapIdx,eIdx);
  if(e.kind==="boss"&&!canBoss(mapIdx))return {ok:false,reason:`Boss 挑戰暫時鎖定，請先擊敗本地圖菁英怪 10 隻（${state.bossProgress[mapIdx]||0}/10）。`};

  const playerLevelBefore=Math.max(1,Math.floor(Number(state.level)||1));
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
   return {ok:true,win:false,logs,events:combat.events,e,penalty,combatEndHp,turns:combat.turns,firstBossKill:false,bossMapIndex:e.kind==="boss"?mapIdx:null,pendingStoryId:null};
  }

  const xp=expReward(e),gold=goldReward(e);
  state.gold+=gold;
  gainExp(xp,logs);
  let firstBossKill=false;
  if(e.kind==="boss"){
   firstBossKill=!state.bossKilled[mapIdx];
   state.bossKilled[mapIdx]=true;
   state.bossLocked[mapIdx]=false;
   state.bossProgress[mapIdx]=0;
   if(firstBossKill&&mapIdx<MAPS.length-1)state.unlockedMap=Math.max(state.unlockedMap,mapIdx+1);
  }else{
   progressEnemyKill(mapIdx,eIdx);
   addProgress(mapIdx,e.kind);
  }

  const items=[];
  let saleEnhancementStones={basic:0,advanced:0};
  const it=dropItem(e,mapIdx),ir=addItem(it);
  if(it){
   items.push({item:it,sold:ir.sold||0,sale:ir.sale||null});
   saleEnhancementStones=mergeEnhancementStoneRewards(saleEnhancementStones,ir.enhancementStones);
  }
  if(e.kind==="boss"&&(state.vipLevel||0)>=16&&Math.random()<.15){
   const extra=dropItem(e,mapIdx);
   if(extra){
    const extraResult=addItem(extra);
    items.push({item:extra,sold:extraResult.sold||0,sale:extraResult.sale||null,vip16Extra:true});
    saleEnhancementStones=mergeEnhancementStoneRewards(saleEnhancementStones,extraResult.enhancementStones);
   }
  }
  const enhancementStones=grantMainlineEnhancementStoneReward(e,playerLevelBefore);

  logs.push(`${e.name}被擊敗。獲得 EXP +${xp}、金幣 +${gold}。`);
  if(e.kind==="normal"&&eIdx<2&&state.mapProgress[mapIdx][eIdx]===10)logs.push(`新敵人已出現：${MAPS[mapIdx].enemies[eIdx+1][0]}。`);
  if(e.kind==="normal"&&eIdx===2&&state.mapProgress[mapIdx][2]===10)logs.push(`菁英敵人已出現：${MAPS[mapIdx].enemies[3][0]}。`);
  if(e.kind==="elite"&&!state.bossKilled[mapIdx]&&!state.bossLocked[mapIdx]&&state.mapProgress[mapIdx][3]>=10)logs.push(state.level>=MAPS[mapIdx].max?`Boss 已出現：${MAPS[mapIdx].enemies[4][0]}。`:`菁英進度完成；達到 Lv.${MAPS[mapIdx].max} 後 Boss 才會出現。`);
  if(e.kind==="elite"&&state.bossLocked[mapIdx])logs.push(`Boss 再挑戰進度：${state.bossProgress[mapIdx]}/10 菁英。`);
  if(e.kind==="elite"&&!state.bossLocked[mapIdx]&&state.bossProgress[mapIdx]>=10)logs.push(`Boss 已重新開放，可以再次挑戰。`);
  items.forEach(row=>{const saleText=row.sale&&typeof window.equipmentSaleText==="function"?window.equipmentSaleText(row.sale):row.sold?`${row.sold} 金幣`:"";logs.push(`${row.sale||row.sold?`自動出售 ${itemHtmlPlain(row.item)}，獲得 ${saleText}`:`獲得裝備 ${itemHtmlPlain(row.item)}`}`);});
  let pendingStoryId=null;
  if(firstBossKill&&window.civilizationStoryProgress?.queueBossStory)pendingStoryId=window.civilizationStoryProgress.queueBossStory(mapIdx);
  save(false);
  return {ok:true,win:true,logs,events:combat.events,e,xp,gold,item:items[0]?.item||null,sold:items[0]?.sold||0,items,enhancementStones,saleEnhancementStones,combatEndHp,turns:combat.turns,firstBossKill,bossMapIndex:e.kind==="boss"?mapIdx:null,pendingStoryId};
 };
 window.fightOnce=fightOnce;
 window.MAINLINE_ENHANCEMENT_PIPELINE_VERSION=2;
 window.MAINLINE_BOSS_FIRST_CLEAR_SIGNAL_VERSION=2;
})();