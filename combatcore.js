(function(){
 const STANDARD_ABILITY_RULES=Object.freeze({comboScale:.50,penetrationDefMultiplier:.75,counterScale:.40,drainRatio:.10});
 const ACTION_SAFETY_RULES=Object.freeze({maxActionsPerRun:1000000,maxActionsPerChain:1024});
 function numberOr(value,fallback=0){const n=Number(value);return Number.isFinite(n)?n:fallback;}
 function clampRate(value){return Math.max(0,Math.min(100,numberOr(value,0)));}
 function positiveWhole(value,fallback){const n=Math.floor(Number(value));return Number.isFinite(n)&&n>0?n:fallback;}
 function specBonus(key,useTest=false){
  if(typeof window.specializationPercentBonus==="function")return Math.max(0,Number(window.specializationPercentBonus(key,useTest))||0);
  if(typeof window.specializationLevel==="function")return Math.max(0,Number(window.specializationLevel(key,useTest))||0);
  return 0;
 }
 function normalizeAbilityProfile(source={}){
  const raw=source&&typeof source==="object"?source:{};
  return Object.freeze({
   initiativeBonusPercent:Math.max(0,numberOr(raw.initiativeBonusPercent??raw.initiative,0)),
   comboRate:clampRate(raw.comboRate??raw.combo),
   penetrationRate:clampRate(raw.penetrationRate??raw.penetration),
   counterRate:clampRate(raw.counterRate??raw.counter),
   drainRate:clampRate(raw.drainRate??raw.drain)
  });
 }
 function inactiveEffect(id){return {id,active:false};}
 function normalizeEffectProfile(source={}){
  const raw=source&&typeof source==="object"?source:{};
  const ids=["ward","suppression","composure","indomitable","resilience","battleSpirit","absorption","revenge","backlash","ignore"];
  return Object.freeze(Object.fromEntries(ids.map(id=>[id,raw[id]&&typeof raw[id]==="object"?Object.freeze({...raw[id],id,active:raw[id].active!==false}):inactiveEffect(id)])));
 }
 window.COMBAT_STANDARD_ABILITY_RULES=STANDARD_ABILITY_RULES;
 window.COMBAT_STANDARD_ABILITY_RULES_VERSION=1;
 window.COMBAT_ACTION_SAFETY_RULES=ACTION_SAFETY_RULES;
 window.COMBAT_ACTION_SAFETY_VERSION=1;
 window.normalizeCombatAbilityProfile=normalizeAbilityProfile;
 window.normalizeCombatEffectProfile=normalizeEffectProfile;
 window.COMBAT_ACTOR_ABILITY_PROFILE_VERSION=1;
 window.COMBAT_HEAL_CAP_VERSION=1;
 window.COMBAT_COUNTER_RECURSION_GUARD_VERSION=1;
 window.COMBAT_PLAYER_FINAL_DAMAGE_LAYER_VERSION=1;
 window.COMBAT_DODGE_INITIATIVE_EVENT_VERSION=1;

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
  const maxActions=Math.min(ACTION_SAFETY_RULES.maxActionsPerRun,positiveWhole(options.maxActions,ACTION_SAFETY_RULES.maxActionsPerRun));
  const maxActionsPerChain=Math.min(ACTION_SAFETY_RULES.maxActionsPerChain,positiveWhole(options.maxActionsPerChain,ACTION_SAFETY_RULES.maxActionsPerChain));
  const skipPlayerAction=options.skipPlayerAction===true;
  const skipEnemyAction=options.skipEnemyAction===true;
  const lockPlayerFullHp=options.lockPlayerFullHp===true;
  const playerFinalDamageMultiplier=Math.max(0,numberOr(options.playerFinalDamageMultiplier,1));
  const playerAbility=normalizeAbilityProfile({initiativeBonusPercent:specBonus("initiative",useTest),comboRate:specBonus("combo",useTest),penetrationRate:specBonus("penetration",useTest),counterRate:specBonus("counter",useTest),drainRate:specBonus("drain",useTest)});
  const enemyAbility=normalizeAbilityProfile(options.enemyAbilityProfile||options.enemyCombatProfile||{});
  const markKeys=Array.from(window.MARK_KEYS||[]);
  const explicitMarkLevels=options.markLevels&&typeof options.markLevels==="object"?options.markLevels:null;
  const markLevels=Object.fromEntries(markKeys.map(key=>[key,explicitMarkLevels&&typeof window.markClampLevel==="function"?window.markClampLevel(explicitMarkLevels[key]):(typeof window.markLevel==="function"?window.markLevel(key,useTestMarks):0)]));
  const playerEffects=normalizeEffectProfile(Object.fromEntries(markKeys.map(key=>[key,typeof window.markEffectSnapshot==="function"?window.markEffectSnapshot(key,markLevels[key]):{id:key,level:markLevels[key]||0,active:false}])));
  const enemyEffects=normalizeEffectProfile(options.enemyEffectProfile||options.enemyEffects||{});
  const initialHp=startHp==null?numberOr(p.hp,0):numberOr(startHp,0);
  const playerMaxHp=Math.max(1,numberOr(p.hp,1));
  const playerHealCap=Math.max(1,Math.min(playerMaxHp,numberOr(options.playerHealCap,playerMaxHp)));
  let php=lockPlayerFullHp?playerHealCap:Math.max(0,Math.min(initialHp,playerHealCap));
  const enemyMaxHp=Math.max(1,numberOr(e.hp,1));
  const enemyStartHp=options.enemyStartHp==null?enemyMaxHp:Math.max(1,Math.min(enemyMaxHp,numberOr(options.enemyStartHp,enemyMaxHp)));
  const enemyHealCap=Math.max(1,Math.min(enemyMaxHp,numberOr(options.enemyHealCap,enemyMaxHp)));
  let ehp=Math.min(enemyStartHp,enemyHealCap);
  let turns=0,berserkShown=false,actionCount=0,actionBudgetReached=false,chainBudgetReached=false;
  const runtime={
   player:{shield:0,indomitableActivated:false,indomitableUsed:false,battleSpiritActivated:false,battleSpiritLayer:0,revengeReady:false,initiativeUsed:false},
   enemy:{shield:0,indomitableActivated:false,indomitableUsed:false,battleSpiritActivated:false,battleSpiritLayer:0,revengeReady:false,initiativeUsed:false}
  };
  function rollRate(rate,always=false){const value=Math.max(0,numberOr(rate,0));if(!always&&value<=0)return false;return rng()*100<value;}
  function combatDamage(atk,def){if(typeof window.combatDamageWithRng==="function")return window.combatDamageWithRng(atk,def,rng);return calcDamage(atk,def);}
  function hpOf(side){return side==="player"?php:ehp;}
  function setHp(side,value){if(side==="player")php=Math.max(0,value);else ehp=Math.max(0,value);}
  function maxHpOf(side){return side==="player"?playerMaxHp:enemyMaxHp;}
  function healCapOf(side){return side==="player"?playerHealCap:enemyHealCap;}
  function statsOf(side){return side==="player"?p:e;}
  function abilityOf(side){return side==="player"?playerAbility:enemyAbility;}
  function effectsOf(side){return side==="player"?playerEffects:enemyEffects;}
  function other(side){return side==="player"?"enemy":"player";}
  function markEvent(owner,mark,action,data={}){events.push({type:"mark",owner,mark,action,...data});}
  function safetyEvent(scope,actor,data={}){events.push({type:"combatSafety",scope,actor,actionCount,maxActions,maxActionsPerChain,...data});}
  function activateOpeningEffects(side){
   const rt=runtime[side],effects=effectsOf(side),maxHp=maxHpOf(side);
   const ward=effects.ward||{};
   if(ward.active&&rollRate(ward.activationChance)){rt.shield=Math.max(1,ceil(maxHp*numberOr(ward.shieldMaxHpPercent,0)/100));markEvent(side,"ward","activate",{shield:rt.shield,maxHp,percent:numberOr(ward.shieldMaxHpPercent,0)});}
   const indomitable=effects.indomitable||{};
   if(indomitable.active&&rollRate(indomitable.activationChance)){rt.indomitableActivated=true;markEvent(side,"indomitable","activate",{uses:1});}
   const spirit=effects.battleSpirit||{};
   if(spirit.active&&rollRate(spirit.activationChance)){rt.battleSpiritActivated=true;markEvent(side,"battleSpirit","activate",{maxLayers:Math.max(0,Math.floor(numberOr(spirit.maxLayers,10))),atkPercentPerLayer:numberOr(spirit.atkPercentPerLayer,0)});}
  }
  function beginRoundEffects(side){
   const rt=runtime[side];if(!rt.battleSpiritActivated)return;
   const spirit=effectsOf(side).battleSpirit||{},maxLayers=Math.max(0,Math.floor(numberOr(spirit.maxLayers,10)));
   rt.battleSpiritLayer=Math.min(maxLayers,rt.battleSpiritLayer+1);
   markEvent(side,"battleSpirit","layer",{round:turns,layer:rt.battleSpiritLayer,atkPercent:numberOr(spirit.atkPercentPerLayer,0)*rt.battleSpiritLayer});
  }
  function healFromDrain(side,actualDamage,source){
   const ability=abilityOf(side);if(!(actualDamage>0)||!rollRate(ability.drainRate))return 0;
   const wanted=Math.max(1,ceil(actualDamage*STANDARD_ABILITY_RULES.drainRatio)),before=hpOf(side),cap=healCapOf(side),healed=Math.max(0,Math.min(wanted,cap-before));
   if(healed>0)setHp(side,before+healed);
   events.push({type:"drain",actor:side,source,healed,actualDamage,healCap:cap});
   return healed;
  }
  function strike(actor,source="normal",initiative=false){
   const defender=other(actor),aStats=statsOf(actor),dStats=statsOf(defender),aAbility=abilityOf(actor),aEffects=effectsOf(actor),dEffects=effectsOf(defender),aRt=runtime[actor],dRt=runtime[defender];
   const scale=source==="combo"?STANDARD_ABILITY_RULES.comboScale:source==="counter"?STANDARD_ABILITY_RULES.counterScale:1;
   const initiativeApplied=initiative&&aAbility.initiativeBonusPercent>0;
   const suppression=Math.max(0,numberOr(aEffects.suppression?.enemyDodgeReductionPoints??aEffects.suppression?.playerDodgeRateReductionPoints,0));
   const rawDodge=Math.max(0,numberOr(dStats.dodge,0)),finalDodge=Math.max(0,rawDodge-suppression),dodgeRoll=rng()*100;
   if(suppression>0&&dodgeRoll<rawDodge&&dodgeRoll>=finalDodge)markEvent(actor,"suppression","preventDodge",{target:defender,source,reductionPoints:suppression,originalRate:rawDodge,finalRate:finalDodge});
   if(dodgeRoll<finalDodge){events.push({type:"dodge",actor,target:defender,source,rate:finalDodge,initiative:initiativeApplied});if(logs)logs.push(actor==="player"?(options.mainlineLogs?`你攻擊${name}，${name}閃避了攻擊。`:`${name}閃避了你的攻擊。`):`${name}攻擊你，你閃避了攻擊。`);return {hit:false,actualDamage:0,killed:false,crit:false};}
   const ignore=aEffects.ignore||{},ignoreDefense=ignore.active&&rollRate(ignore.triggerChance);
   let penetration=false;
   if(ignoreDefense)markEvent(actor,"ignore","trigger",{target:defender,source});else penetration=rollRate(aAbility.penetrationRate);
   const effectiveDef=ignoreDefense?0:numberOr(dStats.def,0)*(penetration?STANDARD_ABILITY_RULES.penetrationDefMultiplier:1);
   const spiritPercent=aRt.battleSpiritActivated?numberOr(aEffects.battleSpirit?.atkPercentPerLayer,0)*aRt.battleSpiritLayer:0;
   let atk=Math.max(1,numberOr(aStats.atk,1))*(1+spiritPercent/100);
   let berserk=false;
   if(actor==="enemy"&&e.berserk&&ehp/enemyMaxHp<.5){berserk=true;atk=ceil(atk*1.20);if(!berserkShown){berserkShown=true;events.push({type:"berserk",actor:"enemy"});}}
   let damage=combatDamage(atk,effectiveDef);
   if(initiativeApplied)damage=ceil(damage*(1+aAbility.initiativeBonusPercent/100));
   const composure=Math.max(0,numberOr(dEffects.composure?.enemyCritReductionPoints??dEffects.composure?.playerCritRateReductionPoints,0)),rawCrit=Math.max(0,numberOr(aStats.crit,0)),finalCrit=Math.max(0,rawCrit-composure);
   let crit=false,revengeCrit=false;
   if(aRt.revengeReady){crit=true;revengeCrit=true;aRt.revengeReady=false;markEvent(actor,"revenge","consume",{target:defender,source});}
   else{const critRoll=rng()*100;if(composure>0&&critRoll<rawCrit&&critRoll>=finalCrit)markEvent(defender,"composure","preventCrit",{target:actor,reductionPoints:composure,originalRate:rawCrit,finalRate:finalCrit});crit=critRoll<finalCrit;}
   if(crit){const baseDamage=damage,resilience=Math.max(0,Math.min(100,numberOr(dEffects.resilience?.enemyCritBonusDamageReductionPercent??dEffects.resilience?.playerCritBonusDamageReductionPercent,0)));if(resilience>0){const normalCritDamage=ceil(baseDamage*numberOr(CRIT_DAMAGE_MULTIPLIER,1.5)),bonus=Math.max(0,baseDamage*(numberOr(CRIT_DAMAGE_MULTIPLIER,1.5)-1));damage=ceil(baseDamage+bonus*(1-resilience/100));markEvent(defender,"resilience","reduceCritDamage",{target:actor,reductionPercent:resilience,originalDamage:normalCritDamage,finalDamage:damage});}else damage=ceil(baseDamage*CRIT_DAMAGE_MULTIPLIER);}
   damage=Math.max(1,ceil(damage*scale));if(actor==="player")damage=Math.max(1,ceil(damage*playerFinalDamageMultiplier));
   const absorption=dEffects.absorption||{},absorbed=absorption.active&&rollRate(absorption.triggerChance);
   if(absorbed){const before=hpOf(defender),wanted=Math.max(1,ceil(damage*numberOr(absorption.healOriginalDamagePercent,25)/100)),healed=Math.max(0,Math.min(wanted,healCapOf(defender)-before));if(healed>0)setHp(defender,before+healed);events.push({type:"attack",actor,target:defender,source,damage,actualDamage:0,crit,revengeCrit,penetration,ignoreDefense,initiative:initiativeApplied,battleSpiritLayer:aRt.battleSpiritLayer,battleSpiritAtkPercent:spiritPercent,playerFinalDamageMultiplier:actor==="player"?playerFinalDamageMultiplier:1,berserk,absorbed:true,shieldAbsorbed:0});markEvent(defender,"absorption","trigger",{target:actor,damage,healed});if(logs)logs.push(actor==="enemy"?`${name}攻擊你，但吸收印記化解了傷害。`:`你攻擊${name}，但攻擊被吸收。`);return {hit:true,actualDamage:0,killed:false,crit,absorbed:true};}
   const before=Math.max(0,hpOf(defender)),shieldAbsorbed=Math.min(dRt.shield,damage);if(shieldAbsorbed>0)dRt.shield-=shieldAbsorbed;const remaining=Math.max(0,damage-shieldAbsorbed);let indomitableTriggered=false;
   if(remaining>0){const rawAfter=before-remaining;if(rawAfter<=0&&dRt.indomitableActivated&&!dRt.indomitableUsed){dRt.indomitableUsed=true;indomitableTriggered=true;setHp(defender,1);}else setHp(defender,Math.max(0,rawAfter));}
   const actualDamage=Math.max(0,before-hpOf(defender));events.push({type:"attack",actor,target:defender,source,damage,actualDamage,crit,revengeCrit,penetration,ignoreDefense,initiative:initiativeApplied,battleSpiritLayer:aRt.battleSpiritLayer,battleSpiritAtkPercent:spiritPercent,playerFinalDamageMultiplier:actor==="player"?playerFinalDamageMultiplier:1,berserk,absorbed:false,shieldAbsorbed,indomitable:indomitableTriggered});
   if(shieldAbsorbed>0)markEvent(defender,"ward","absorb",{target:actor,amount:shieldAbsorbed,remainingShield:dRt.shield});if(indomitableTriggered)markEvent(defender,"indomitable","survive",{target:actor,hp:1});
   if(logs)logs.push(actor==="player"?(crit?`你攻擊${name}，暴擊造成 ${damage} 點傷害。`:`你攻擊${name}，造成 ${damage} 點傷害。`):(crit?`${name}攻擊你，暴擊造成 ${damage} 點傷害。`:`${name}攻擊你，造成 ${damage} 點傷害。`));
   if(lockPlayerFullHp&&defender==="player")php=playerHealCap;
   if(hpOf(defender)<=0)return {hit:true,actualDamage,killed:true,crit};
   const revenge=dEffects.revenge||{};if(crit&&revenge.active&&rollRate(revenge.triggerChance)){dRt.revengeReady=true;markEvent(defender,"revenge","ready",{target:actor});}
   const backlash=dEffects.backlash||{};if(actualDamage>0&&backlash.active&&rollRate(backlash.triggerChance)){const reflected=Math.max(1,ceil(actualDamage*numberOr(backlash.reflectActualHpLossPercent,30)/100)),reflectedActual=Math.min(Math.max(0,hpOf(actor)),reflected);setHp(actor,hpOf(actor)-reflected);markEvent(defender,"backlash","trigger",{target:actor,damage:reflected,actualDamage:reflectedActual,hpLoss:actualDamage});}
   if(hpOf(actor)>0&&hpOf(defender)>0)healFromDrain(actor,actualDamage,source);
   return {hit:true,actualDamage,killed:hpOf(defender)<=0||hpOf(actor)<=0,crit};
  }
  function attackChain(actor,initialSource="normal",allowCounter=true){
   const defender=other(actor),aRt=runtime[actor],ability=abilityOf(actor);let source=initialSource,first=true,hadEffectiveDamage=false,chainActions=0;
   while(hpOf(actor)>0&&hpOf(defender)>0){
    if(actionCount>=maxActions){actionBudgetReached=true;safetyEvent("run",actor,{source});break;}
    if(chainActions>=maxActionsPerChain){chainBudgetReached=true;safetyEvent("chain",actor,{source,chainActions});break;}
    actionCount++;chainActions++;
    const initiativeApplied=initialSource==="normal"&&first&&!aRt.initiativeUsed;if(initiativeApplied)aRt.initiativeUsed=true;
    const hit=strike(actor,source,initiativeApplied);if(hit.actualDamage>0)hadEffectiveDamage=true;first=false;if(hpOf(actor)<=0||hpOf(defender)<=0)break;if(!rollRate(ability.comboRate))break;events.push({type:"combo",actor,from:source});source="combo";
   }
   if(!actionBudgetReached&&allowCounter&&hadEffectiveDamage&&hpOf(actor)>0&&hpOf(defender)>0){const defenderAbility=abilityOf(defender);if(rollRate(defenderAbility.counterRate)){events.push({type:"counter",actor:defender,target:actor});attackChain(defender,"counter",false);}}
  }
  activateOpeningEffects("player");activateOpeningEffects("enemy");
  while(php>0&&ehp>0){
   if(actionBudgetReached)break;if(maxTurns>0&&turns>=maxTurns)break;turns++;beginRoundEffects("player");beginRoundEffects("enemy");
   if(!skipPlayerAction)attackChain("player","normal",true);if(actionBudgetReached||php<=0||ehp<=0)break;if(skipEnemyAction)continue;
   attackChain("enemy","normal",true);
  }
  const result={win:ehp<=0,hp:Math.max(0,php),enemyHp:Math.max(0,ehp),enemyStartHp,enemyMaxHp,enemyHealCap,playerStartHp:lockPlayerFullHp?playerHealCap:Math.max(0,Math.min(initialHp,playerHealCap)),playerMaxHp,playerHealCap,turns,logs:logs||[],events,
   actionCount,maxActions,maxActionsPerChain,actionBudgetReached,chainBudgetReached,
   markState:{useTest:useTestMarks,levels:{...markLevels},shield:Math.max(0,runtime.player.shield),indomitableActivated:runtime.player.indomitableActivated,indomitableUsed:runtime.player.indomitableUsed,battleSpiritActivated:runtime.player.battleSpiritActivated,battleSpiritLayer:runtime.player.battleSpiritLayer,revengeReady:runtime.player.revengeReady},
   actorState:{player:{...runtime.player},enemy:{...runtime.enemy}},playerAbilityProfile:playerAbility,enemyAbilityProfile:enemyAbility,e:enemy};
  if(options.preparePresentation!==false&&typeof window.prepareCombatPresentation==="function")window.prepareCombatPresentation(result,options);
  return result;
 };
 window.COMBAT_MARK_INTEGRATION_VERSION=1;
 window.COMBAT_PERSISTENT_ENEMY_HP_VERSION=1;
 window.COMBAT_OPTIONAL_FULL_HP_LOCK_VERSION=1;
 window.COMBAT_FULL_HP_LOCK_START_NORMALIZATION_VERSION=1;

 fightOnce=function(mapIdx,eIdx,encounter=null){
  if(!enemyUnlocked(mapIdx,eIdx)){
   if(eIdx===4&&state.bossLocked?.[mapIdx])return {ok:false,reason:`Boss 挑戰暫時鎖定，請先擊敗本地圖菁英怪 10 隻（${state.bossProgress[mapIdx]||0}/10）。`};
   return {ok:false,reason:"這隻怪物尚未解鎖。"};
  }
  const e=encounter||createMonsterEncounter(mapIdx,eIdx);
  if(e.kind==="boss"&&!canBoss(mapIdx))return {ok:false,reason:`Boss 挑戰暫時鎖定，請先擊敗本地圖菁英怪 10 隻（${state.bossProgress[mapIdx]||0}/10）。`};

  const playerLevelBefore=Math.max(1,Math.floor(Number(state.level)||1));
  const ps=playerCombatStats();
  const gmMainlineHpLock=typeof window.gmMainlineHpLockActive==="function"&&window.gmMainlineHpLockActive("world1-mainline")===true;
  const combat=runCombatCore(ps,e,state.hp,{mainlineLogs:true,lockPlayerFullHp:gmMainlineHpLock});
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
  if(typeof window.vipLootBossExtraDropTriggered!=="function")throw new Error("VIP Loot Core 未載入。");
  if(window.vipLootBossExtraDropTriggered({boss:e.kind==="boss"})){
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
  let result={ok:true,win:true,logs,events:combat.events,e,xp,gold,item:items[0]?.item||null,sold:items[0]?.sold||0,items,enhancementStones,saleEnhancementStones,combatEndHp,turns:combat.turns,firstBossKill,bossMapIndex:e.kind==="boss"?mapIdx:null,pendingStoryId};
  if(typeof window.applyWorld1OnlineOverlevelReward==="function")result=window.applyWorld1OnlineOverlevelReward(result,playerLevelBefore,state,{persist:false})||result;
  save(false);
  return result;
 };
 window.fightOnce=fightOnce;
 window.MAINLINE_ENHANCEMENT_PIPELINE_VERSION=2;
 window.MAINLINE_BOSS_FIRST_CLEAR_SIGNAL_VERSION=2;
 window.MAINLINE_OVERLEVEL_REWARD_INTEGRATION_VERSION=1;
})();