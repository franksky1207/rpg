(function(){
 const CONFIG=window.MIRROR_DUNGEON_CONFIG;if(!CONFIG)throw new Error("Mirror dungeon config missing.");
 const MIRROR_COMBAT_CORE_VERSION=5;
 const MIRROR_MARK_RULE_VERSION=Math.max(0,Math.floor(Number(window.MARK_COMBAT_RULE_VERSION)||0));
 const RUN_BATTLES=CONFIG.runBattles;
 const MIRROR_COUNTER_SCALE=CONFIG.combat.counterScale;
 const MIRROR_COMBO_SCALE=CONFIG.combat.comboScale;
 const MIRROR_PENETRATION_DEF_MULTIPLIER=CONFIG.combat.penetrationDefMultiplier;
 const MIRROR_DRAIN_RATIO=CONFIG.combat.drainRatio;

 function numberOr(value,fallback=0){const n=Number(value);return Number.isFinite(n)?n:fallback;}
 function clampRate(value){return Math.max(0,Math.min(100,numberOr(value,0)));}
 function intLevel(value,max=60){return Math.max(0,Math.min(max,Math.floor(numberOr(value,0))));}
 function markLevel(value){return typeof window.markClampLevel==="function"?window.markClampLevel(value):Math.max(0,Math.min(10,Math.floor(numberOr(value,0))));}
 function cloneJson(value){try{return JSON.parse(JSON.stringify(value));}catch(e){return null;}}
 function roll(rng,percent){return percent>0&&rng()*100<percent;}
 function specializationBonuses(levels){const source=levels&&typeof levels==="object"?levels:{};return {initiative:intLevel(source.initiative),combo:intLevel(source.combo)*.5,penetration:intLevel(source.penetration)*.5,counter:intLevel(source.counter)*.5,drain:intLevel(source.drain)*.5};}
 function currentSpecializationLevels(){if(typeof window.specializationLevelsSnapshot==="function")return window.specializationLevelsSnapshot(false);const source=state?.specializations&&typeof state.specializations==="object"?state.specializations:{};return {initiative:intLevel(source.initiative),combo:intLevel(source.combo),penetration:intLevel(source.penetration),counter:intLevel(source.counter),drain:intLevel(source.drain)};}
 function currentSpecializationBonuses(levels){const fallback=specializationBonuses(levels);if(typeof window.specializationPercentBonus!=="function")return fallback;return {initiative:Math.max(0,numberOr(window.specializationPercentBonus("initiative",false),fallback.initiative)),combo:Math.max(0,numberOr(window.specializationPercentBonus("combo",false),fallback.combo)),penetration:Math.max(0,numberOr(window.specializationPercentBonus("penetration",false),fallback.penetration)),counter:Math.max(0,numberOr(window.specializationPercentBonus("counter",false),fallback.counter)),drain:Math.max(0,numberOr(window.specializationPercentBonus("drain",false),fallback.drain))};}
 function normalizeBonuses(source,levels){const fallback=specializationBonuses(levels),raw=source&&typeof source==="object"?source:{};return {initiative:Math.max(0,numberOr(raw.initiative,fallback.initiative)),combo:clampRate(numberOr(raw.combo,fallback.combo)),penetration:clampRate(numberOr(raw.penetration,fallback.penetration)),counter:clampRate(numberOr(raw.counter,fallback.counter)),drain:clampRate(numberOr(raw.drain,fallback.drain))};}
 function currentEnhancementLevels(){const source=state?.enhancement?.levels&&typeof state.enhancement.levels==="object"?state.enhancement.levels:{};const types=Array.isArray(EQUIPMENT_TYPES)?EQUIPMENT_TYPES:["weapon","helmet","armor","shoes","accessory"];return Object.fromEntries(types.map(type=>[type,Math.max(0,Math.min(Number(window.ENHANCEMENT_MAX_LEVEL)||20,Math.floor(numberOr(source[type],0))))]));}
 function markKeys(){return Array.from(window.MARK_KEYS||[]);}
 function normalizeMarkLevels(source){const raw=source&&typeof source==="object"?source:{};return Object.fromEntries(markKeys().map(key=>[key,markLevel(raw[key])]));}
 function currentMarkLevels(){if(typeof window.markLevelsSnapshot==="function")return normalizeMarkLevels(window.markLevelsSnapshot(false));return normalizeMarkLevels(Object.fromEntries(markKeys().map(key=>[key,state?.marks?.entries?.[key]?.level||0])));}
 function markEffects(levels){return Object.fromEntries(markKeys().map(key=>[key,typeof window.markEffectSnapshot==="function"?window.markEffectSnapshot(key,levels[key]):{id:key,level:levels[key]||0,active:false}]));}

 function createMirrorCombatSnapshot(){
  const stats=typeof playerCombatStats==="function"?playerCombatStats():{hp:1,atk:1,def:0,crit:0,dodge:0},levels=currentSpecializationLevels(),marks=currentMarkLevels();
  const world=typeof window.isSecondWorldEntered==="function"&&window.isSecondWorldEntered(state)===true?2:1;
  const civilizationLevel=typeof window.civilizationLevel==="function"?window.civilizationLevel(state):0;
  const civilizationDamageMultiplier=typeof window.civilizationCombatDamageMultiplier==="function"?window.civilizationCombatDamageMultiplier({world,state,civilizationLevel}):1;
  return {
   version:MIRROR_COMBAT_CORE_VERSION,
   damageModelVersion:Math.max(0,Math.floor(numberOr(window.COMBAT_DAMAGE_MODEL_VERSION,0))),
   markRuleVersion:MIRROR_MARK_RULE_VERSION,
   playerName:String(state?.playerName||"玩家"),
   level:Math.max(1,Math.floor(numberOr(state?.level,1))),
   vipLevel:Math.max(0,Math.floor(numberOr(state?.vipLevel,0))),
   world,
   civilizationLevel,
   civilizationDamageMultiplier,
   stats:{hp:Math.max(1,Math.ceil(numberOr(stats.hp,1))),atk:Math.max(1,Math.ceil(numberOr(stats.atk,1))),def:Math.max(0,Math.ceil(numberOr(stats.def,0))),crit:clampRate(stats.crit),dodge:clampRate(stats.dodge)},
   specializations:cloneJson(levels)||{},
   specializationBonuses:currentSpecializationBonuses(levels),
   enhancementLevels:currentEnhancementLevels(),
   marks,
   equipment:cloneJson(state?.equipment)||{}
  };
 }
 function normalizeSnapshot(snapshot){
  const source=snapshot&&typeof snapshot==="object"?snapshot:createMirrorCombatSnapshot(),stats=source.stats&&typeof source.stats==="object"?source.stats:{},levels=source.specializations&&typeof source.specializations==="object"?source.specializations:{};
  const civilizationLevel=Math.max(0,Math.min(Number(window.CIVILIZATION_LEVEL_MAX)||10,Math.floor(numberOr(source.civilizationLevel,0))));
  const fallbackWorld=typeof window.isSecondWorldEntered==="function"&&typeof state!=="undefined"&&state?window.isSecondWorldEntered(state)===true?2:1:1;
  const world=source.world==null?(civilizationLevel>0||numberOr(source.civilizationDamageMultiplier,1)>1?2:fallbackWorld):(Number(source.world)===2?2:1);
  const civilizationDamageMultiplier=typeof window.civilizationCombatDamageMultiplier==="function"?window.civilizationCombatDamageMultiplier({world,civilizationLevel}):Math.max(1,numberOr(source.civilizationDamageMultiplier,1));
  return {
   version:MIRROR_COMBAT_CORE_VERSION,
   damageModelVersion:Math.max(0,Math.floor(numberOr(source.damageModelVersion,window.COMBAT_DAMAGE_MODEL_VERSION||0))),
   markRuleVersion:MIRROR_MARK_RULE_VERSION,
   playerName:String(source.playerName||"玩家"),
   level:Math.max(1,Math.floor(numberOr(source.level,1))),
   vipLevel:Math.max(0,Math.floor(numberOr(source.vipLevel,0))),
   world,
   civilizationLevel,
   civilizationDamageMultiplier,
   stats:{hp:Math.max(1,Math.ceil(numberOr(stats.hp,1))),atk:Math.max(1,Math.ceil(numberOr(stats.atk,1))),def:Math.max(0,Math.ceil(numberOr(stats.def,0))),crit:clampRate(stats.crit),dodge:clampRate(stats.dodge)},
   specializations:cloneJson(levels)||{},
   specializationBonuses:normalizeBonuses(source.specializationBonuses,levels),
   enhancementLevels:cloneJson(source.enhancementLevels)||{},
   marks:normalizeMarkLevels(source.marks),
   equipment:cloneJson(source.equipment)||{}
  };
 }
 function sharedCombatDamage(atk,def,rng){if(typeof window.combatDamageWithRng!=="function")throw new Error("Shared combat damage model missing.");return window.combatDamageWithRng(atk,def,rng);}
 function auditCurrentSnapshotSources(){
  const snap=createMirrorCombatSnapshot(),issues=[],liveStats=typeof playerCombatStats==="function"?playerCombatStats():null;
  if(!liveStats)issues.push("playerCombatStats missing");else ["hp","atk","def","crit","dodge"].forEach(key=>{if(Number(snap.stats[key])!==Number(liveStats[key]))issues.push(`stats.${key} mismatch`);});
  if(Number(snap.vipLevel)!==Math.max(0,Math.floor(numberOr(state?.vipLevel,0))))issues.push("vipLevel mismatch");
  const liveCivilizationLevel=typeof window.civilizationLevel==="function"?window.civilizationLevel(state):0;
  const liveWorld=typeof window.isSecondWorldEntered==="function"&&window.isSecondWorldEntered(state)===true?2:1;
  const liveCivilizationMultiplier=typeof window.civilizationCombatDamageMultiplier==="function"?window.civilizationCombatDamageMultiplier({world:liveWorld,state,civilizationLevel:liveCivilizationLevel}):1;
  if(Number(snap.world)!==Number(liveWorld))issues.push("world mismatch");
  if(Number(snap.civilizationLevel)!==Number(liveCivilizationLevel))issues.push("civilizationLevel mismatch");
  if(Math.abs(Number(snap.civilizationDamageMultiplier)-Number(liveCivilizationMultiplier))>1e-9)issues.push("civilizationDamageMultiplier mismatch");
  const liveLevels=currentSpecializationLevels();["initiative","combo","penetration","counter","drain"].forEach(key=>{if(Number(snap.specializations[key])!==Number(liveLevels[key]))issues.push(`specializations.${key} mismatch`);});
  const liveBonuses=currentSpecializationBonuses(liveLevels);["initiative","combo","penetration","counter","drain"].forEach(key=>{if(Number(snap.specializationBonuses[key])!==Number(liveBonuses[key]))issues.push(`specializationBonuses.${key} mismatch`);});
  const liveEnhancement=currentEnhancementLevels();Object.keys(liveEnhancement).forEach(key=>{if(Number(snap.enhancementLevels[key])!==Number(liveEnhancement[key]))issues.push(`enhancementLevels.${key} mismatch`);});
  const liveMarks=currentMarkLevels();markKeys().forEach(key=>{if(Number(snap.marks[key])!==Number(liveMarks[key]))issues.push(`marks.${key} mismatch`);});
  try{if(JSON.stringify(snap.equipment)!==JSON.stringify(state?.equipment||{}))issues.push("equipment mismatch");}catch(e){issues.push("equipment audit failed");}
  if(Number(snap.damageModelVersion)!==Number(window.COMBAT_DAMAGE_MODEL_VERSION||0))issues.push("damage model version mismatch");
  if(Number(snap.markRuleVersion)!==Number(window.MARK_COMBAT_RULE_VERSION||0))issues.push("mark rule version mismatch");
  return {passed:issues.length===0,issues,snapshot:snap};
 }

 window.runMirrorCombatCore=function(snapshot,options={}){
  const snap=normalizeSnapshot(snapshot),rng=typeof options.rng==="function"?options.rng:Math.random,logs=options.logs===false?null:[],events=[],names={player:String(options.playerName||snap.playerName||"玩家"),mirror:String(options.mirrorName||`鏡像・${snap.playerName||"玩家"}`)},spec=snap.specializationBonuses,stats=snap.stats,effects=markEffects(snap.marks);
  const sides={
   player:{key:"player",name:names.player,hp:stats.hp,maxHp:stats.hp,initiativeUsed:false,shield:0,indomitableActivated:false,indomitableUsed:false,battleSpiritActivated:false,battleSpiritLayer:0,revengeReady:false},
   mirror:{key:"mirror",name:names.mirror,hp:stats.hp,maxHp:stats.hp,initiativeUsed:false,shield:0,indomitableActivated:false,indomitableUsed:false,battleSpiritActivated:false,battleSpiritLayer:0,revengeReady:false}
  };
  let active=rng()<.5?"player":"mirror";const firstActor=active;let turns=0;
  function other(key){return key==="player"?"mirror":"player";}
  function pushLog(text){if(logs)logs.push(text);}
  function markEvent(owner,mark,action,data={}){events.push({type:"mark",owner,mark,action,...data});}
  function openingMarks(ownerKey){
   const side=sides[ownerKey],ward=effects.ward||{},indomitable=effects.indomitable||{},spirit=effects.battleSpirit||{};
   if(ward.active&&roll(rng,ward.activationChance)){side.shield=Math.max(1,Math.ceil(side.maxHp*numberOr(ward.shieldMaxHpPercent,0)/100));markEvent(ownerKey,"ward","activate",{shield:side.shield,maxHp:side.maxHp,percent:numberOr(ward.shieldMaxHpPercent,0)});}
   if(indomitable.active&&roll(rng,indomitable.activationChance)){side.indomitableActivated=true;markEvent(ownerKey,"indomitable","activate",{uses:1});}
   if(spirit.active&&roll(rng,spirit.activationChance)){side.battleSpiritActivated=true;markEvent(ownerKey,"battleSpirit","activate",{maxLayers:Math.max(0,Math.floor(numberOr(spirit.maxLayers,10))),atkPercentPerLayer:numberOr(spirit.atkPercentPerLayer,0)});}
  }
  function beginRoundMarks(){
   [active,other(active)].forEach(key=>{
    const side=sides[key];if(!side.battleSpiritActivated)return;
    const spirit=effects.battleSpirit||{},maxLayers=Math.max(0,Math.floor(numberOr(spirit.maxLayers,10)));
    side.battleSpiritLayer=Math.min(maxLayers,side.battleSpiritLayer+1);
    markEvent(key,"battleSpirit","layer",{round:turns,layer:side.battleSpiritLayer,atkPercent:numberOr(spirit.atkPercentPerLayer,0)*side.battleSpiritLayer});
   });
  }
  function performStrike(actorKey,defenderKey,source,initiativeApplied){
   const actor=sides[actorKey],defender=sides[defenderKey],scale=source==="counter"?MIRROR_COUNTER_SCALE:source==="combo"?MIRROR_COMBO_SCALE:1;
   const suppression=Math.max(0,numberOr(effects.suppression?.enemyDodgeReductionPoints,0)),rawDodge=clampRate(stats.dodge),finalDodge=Math.max(0,rawDodge-suppression),dodgeRoll=rng()*100;
   if(suppression>0&&dodgeRoll<rawDodge&&dodgeRoll>=finalDodge)markEvent(actorKey,"suppression","preventDodge",{target:defenderKey,source,reductionPoints:suppression,originalRate:rawDodge,finalRate:finalDodge});
   if(dodgeRoll<finalDodge){events.push({type:"dodge",actor:actorKey,target:defenderKey,source,initiative:initiativeApplied});pushLog(`${actor.name}攻擊${defender.name}，${defender.name}閃避了攻擊。`);return {hit:false,actualDamage:0,killed:false};}

   const ignoreEffect=effects.ignore||{},ignoreDefense=ignoreEffect.active&&roll(rng,ignoreEffect.triggerChance);
   let penetration=false;
   if(ignoreDefense)markEvent(actorKey,"ignore","trigger",{target:defenderKey,source});
   else penetration=roll(rng,spec.penetration);
   const effectiveDef=ignoreDefense?0:stats.def*(penetration?MIRROR_PENETRATION_DEF_MULTIPLIER:1);
   const spiritPercent=actor.battleSpiritActivated?numberOr(effects.battleSpirit?.atkPercentPerLayer,0)*actor.battleSpiritLayer:0;
   const effectiveAtk=stats.atk*(1+spiritPercent/100);
   let damage=sharedCombatDamage(effectiveAtk,effectiveDef,rng);
   if(initiativeApplied&&spec.initiative>0)damage=Math.ceil(damage*(1+spec.initiative/100));

   const composure=Math.max(0,numberOr(effects.composure?.enemyCritReductionPoints,0)),rawCrit=clampRate(stats.crit),finalCrit=Math.max(0,rawCrit-composure);
   let crit=false,revengeCrit=false;
   if(actor.revengeReady){
    crit=true;revengeCrit=true;actor.revengeReady=false;markEvent(actorKey,"revenge","consume",{target:defenderKey,source});
   }else{
    const critRoll=rng()*100;
    if(composure>0&&critRoll<rawCrit&&critRoll>=finalCrit)markEvent(defenderKey,"composure","preventCrit",{target:actorKey,reductionPoints:composure,originalRate:rawCrit,finalRate:finalCrit});
    crit=critRoll<finalCrit;
   }

   if(crit){
    const baseDamage=damage,resilience=Math.max(0,Math.min(100,numberOr(effects.resilience?.enemyCritBonusDamageReductionPercent,0)));
    if(resilience>0){
     const normalCritDamage=Math.ceil(baseDamage*(Number(CRIT_DAMAGE_MULTIPLIER)||1.5)),bonus=Math.max(0,baseDamage*((Number(CRIT_DAMAGE_MULTIPLIER)||1.5)-1));
     damage=Math.ceil(baseDamage+bonus*(1-resilience/100));
     markEvent(defenderKey,"resilience","reduceCritDamage",{target:actorKey,reductionPercent:resilience,originalDamage:normalCritDamage,finalDamage:damage});
    }else damage=Math.ceil(baseDamage*(Number(CRIT_DAMAGE_MULTIPLIER)||1.5));
   }
   damage=Math.max(1,Math.ceil(damage*scale));
   damage=Math.max(1,Math.ceil(damage*Math.max(1,numberOr(snap.civilizationDamageMultiplier,1))));

   const absorption=effects.absorption||{},absorbed=absorption.active&&roll(rng,absorption.triggerChance);
   if(absorbed){
    const wanted=Math.max(1,Math.ceil(damage*numberOr(absorption.healOriginalDamagePercent,25)/100)),healed=Math.max(0,Math.min(wanted,defender.maxHp-defender.hp));
    defender.hp+=healed;
    events.push({type:"attack",actor:actorKey,target:defenderKey,source,damage,actualDamage:0,crit,revengeCrit,penetration,ignoreDefense,initiative:initiativeApplied,battleSpiritLayer:actor.battleSpiritLayer,battleSpiritAtkPercent:spiritPercent,civilizationDamageMultiplier:snap.civilizationDamageMultiplier,absorbed:true,shieldAbsorbed:0});
    markEvent(defenderKey,"absorption","trigger",{target:actorKey,damage,healed});
    pushLog(`${actor.name}攻擊${defender.name}，但${defender.name}的吸收印記化解了傷害。`);
    return {hit:true,actualDamage:0,killed:false,absorbed:true};
   }

   const before=Math.max(0,defender.hp),shieldAbsorbed=Math.min(defender.shield,damage);
   if(shieldAbsorbed>0)defender.shield-=shieldAbsorbed;
   const remaining=Math.max(0,damage-shieldAbsorbed);
   let indomitableTriggered=false;
   if(remaining>0){
    const rawAfter=defender.hp-remaining;
    if(rawAfter<=0&&defender.indomitableActivated&&!defender.indomitableUsed){defender.indomitableUsed=true;indomitableTriggered=true;defender.hp=1;}
    else defender.hp=Math.max(0,rawAfter);
   }
   const actualDamage=Math.max(0,before-defender.hp);
   events.push({type:"attack",actor:actorKey,target:defenderKey,source,damage,actualDamage,crit,revengeCrit,penetration,ignoreDefense,initiative:initiativeApplied,battleSpiritLayer:actor.battleSpiritLayer,battleSpiritAtkPercent:spiritPercent,civilizationDamageMultiplier:snap.civilizationDamageMultiplier,absorbed:false,shieldAbsorbed,indomitable:indomitableTriggered});
   if(shieldAbsorbed>0)markEvent(defenderKey,"ward","absorb",{target:actorKey,amount:shieldAbsorbed,remainingShield:defender.shield});
   if(indomitableTriggered)markEvent(defenderKey,"indomitable","survive",{target:actorKey,hp:1});
   pushLog(`${actor.name}攻擊${defender.name}${crit?"，暴擊":""}造成 ${damage} 點傷害。`);

   if(defender.hp>0&&crit){
    const revenge=effects.revenge||{};
    if(revenge.active&&roll(rng,revenge.triggerChance)){defender.revengeReady=true;markEvent(defenderKey,"revenge","ready",{target:actorKey});}
   }

   if(defender.hp>0&&actualDamage>0){
    const backlash=effects.backlash||{};
    if(backlash.active&&roll(rng,backlash.triggerChance)){
     const reflected=Math.max(1,Math.ceil(actualDamage*numberOr(backlash.reflectActualHpLossPercent,30)/100)),reflectedActual=Math.min(Math.max(0,actor.hp),reflected);
     actor.hp=Math.max(0,actor.hp-reflected);
     markEvent(defenderKey,"backlash","trigger",{target:actorKey,damage:reflected,actualDamage:reflectedActual,hpLoss:actualDamage});
    }
   }

   if(actor.hp>0&&actualDamage>0&&roll(rng,spec.drain)){
    const wanted=Math.max(1,Math.ceil(actualDamage*MIRROR_DRAIN_RATIO)),healed=Math.max(0,Math.min(wanted,actor.maxHp-actor.hp));
    actor.hp+=healed;events.push({type:"drain",actor:actorKey,source,healed,actualDamage});if(healed>0)pushLog(`${actor.name}汲取生命，回復 ${healed} HP。`);
   }
   return {hit:true,actualDamage,killed:defender.hp<=0||actor.hp<=0,absorbed:false};
  }
  function attackChain(actorKey,defenderKey,initialSource="normal",allowCounter=false){
   const actor=sides[actorKey],defender=sides[defenderKey];let source=initialSource,first=true,hadEffectiveDamage=false;
   while(actor.hp>0&&defender.hp>0){
    let initiativeApplied=false;
    if(initialSource==="normal"&&first&&!actor.initiativeUsed){actor.initiativeUsed=true;initiativeApplied=spec.initiative>0;}
    const strike=performStrike(actorKey,defenderKey,source,initiativeApplied);
    if(strike.actualDamage>0)hadEffectiveDamage=true;
    first=false;
    if(actor.hp<=0||defender.hp<=0)break;
    if(!roll(rng,spec.combo))break;
    events.push({type:"combo",actor:actorKey,from:source});source="combo";
   }
   if(allowCounter&&actor.hp>0&&defender.hp>0&&hadEffectiveDamage&&roll(rng,spec.counter)){
    events.push({type:"counter",actor:defenderKey,target:actorKey});pushLog(`${defender.name}發動反擊。`);attackChain(defenderKey,actorKey,"counter",false);
   }
  }

  events.push({type:"firstActor",actor:firstActor});pushLog(`${sides[firstActor].name}取得先攻。`);
  openingMarks(firstActor);openingMarks(other(firstActor));
  while(sides.player.hp>0&&sides.mirror.hp>0){
   turns++;
   beginRoundMarks();
   const defender=other(active);
   attackChain(active,defender,"normal",true);
   if(sides[defender].hp<=0||sides[active].hp<=0)break;
   active=defender;
  }
  const winner=sides.player.hp>0?"player":"mirror",loser=other(winner);
  events.push({type:"battleEnd",winner,loser,turns});pushLog(`${sides[winner].name}獲勝。`);
  return {
   win:winner==="player",winner,firstActor,turns,
   playerHp:Math.max(0,sides.player.hp),mirrorHp:Math.max(0,sides.mirror.hp),maxHp:stats.hp,
   logs:logs||[],events,snapshot:snap,
   markState:{
    levels:{...snap.marks},
    player:{shield:Math.max(0,sides.player.shield),indomitableActivated:sides.player.indomitableActivated,indomitableUsed:sides.player.indomitableUsed,battleSpiritActivated:sides.player.battleSpiritActivated,battleSpiritLayer:sides.player.battleSpiritLayer,revengeReady:sides.player.revengeReady},
    mirror:{shield:Math.max(0,sides.mirror.shield),indomitableActivated:sides.mirror.indomitableActivated,indomitableUsed:sides.mirror.indomitableUsed,battleSpiritActivated:sides.mirror.battleSpiritActivated,battleSpiritLayer:sides.mirror.battleSpiritLayer,revengeReady:sides.mirror.revengeReady}
   }
  };
 };
 window.MIRROR_COMBAT_CORE_VERSION=MIRROR_COMBAT_CORE_VERSION;
 window.MIRROR_COMBAT_MARK_RULE_VERSION=MIRROR_MARK_RULE_VERSION;
 window.MIRROR_COMBAT_BATTLE_LIMIT=RUN_BATTLES;
 window.MIRROR_CIVILIZATION_DAMAGE_VERSION=1;
 window.MIRROR_CIVILIZATION_COMBAT_OWNER_VERSION=1;
 window.createMirrorCombatSnapshot=createMirrorCombatSnapshot;
 window.normalizeMirrorCombatSnapshot=normalizeSnapshot;
 window.mirrorSpecializationBonuses=specializationBonuses;
 window.auditCurrentMirrorCombatSnapshotSources=auditCurrentSnapshotSources;
})();