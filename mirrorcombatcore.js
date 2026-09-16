(function(){
 const MIRROR_COMBAT_CORE_VERSION=1;
 const MIRROR_COMBAT_BATTLE_LIMIT=20;
 const MIRROR_COUNTER_SCALE=.40;
 const MIRROR_COMBO_SCALE=.50;
 const MIRROR_PENETRATION_DEF_MULTIPLIER=.75;
 const MIRROR_DRAIN_RATIO=.10;

 function numberOr(value,fallback=0){const n=Number(value);return Number.isFinite(n)?n:fallback;}
 function clampRate(value){return Math.max(0,Math.min(100,numberOr(value,0)));}
 function intLevel(value,max=60){return Math.max(0,Math.min(max,Math.floor(numberOr(value,0))));}
 function cloneJson(value){try{return JSON.parse(JSON.stringify(value));}catch(e){return null;}}
 function roll(rng,percent){return percent>0&&rng()*100<percent;}
 function combatDamage(atk,def,rng){return Math.max(1,Math.ceil((Math.max(0,numberOr(atk,0))-Math.max(0,numberOr(def,0))*.55)*(.95+rng()*.1)));}
 function specializationBonuses(levels){
  const source=levels&&typeof levels==="object"?levels:{};
  return {
   initiative:intLevel(source.initiative),
   combo:intLevel(source.combo)*.5,
   penetration:intLevel(source.penetration)*.5,
   counter:intLevel(source.counter)*.5,
   drain:intLevel(source.drain)*.5
  };
 }
 function currentSpecializationLevels(){
  if(typeof window.specializationLevelsSnapshot==="function")return window.specializationLevelsSnapshot(false);
  const source=state?.specializations&&typeof state.specializations==="object"?state.specializations:{};
  return {initiative:intLevel(source.initiative),combo:intLevel(source.combo),penetration:intLevel(source.penetration),counter:intLevel(source.counter),drain:intLevel(source.drain)};
 }
 function currentEnhancementLevels(){
  const source=state?.enhancement?.levels&&typeof state.enhancement.levels==="object"?state.enhancement.levels:{};
  const types=Array.isArray(EQUIPMENT_TYPES)?EQUIPMENT_TYPES:["weapon","helmet","armor","shoes","accessory"];
  return Object.fromEntries(types.map(type=>[type,Math.max(0,Math.min(Number(window.ENHANCEMENT_MAX_LEVEL)||20,Math.floor(numberOr(source[type],0))))]));
 }
 function createMirrorCombatSnapshot(){
  const stats=typeof playerCombatStats==="function"?playerCombatStats():{hp:1,atk:1,def:0,crit:0,dodge:0};
  const levels=currentSpecializationLevels();
  return {
   version:MIRROR_COMBAT_CORE_VERSION,
   playerName:String(state?.playerName||"玩家"),
   level:Math.max(1,Math.floor(numberOr(state?.level,1))),
   vipLevel:Math.max(0,Math.floor(numberOr(state?.vipLevel,0))),
   stats:{hp:Math.max(1,Math.ceil(numberOr(stats.hp,1))),atk:Math.max(1,Math.ceil(numberOr(stats.atk,1))),def:Math.max(0,Math.ceil(numberOr(stats.def,0))),crit:clampRate(stats.crit),dodge:clampRate(stats.dodge)},
   specializations:cloneJson(levels)||{},
   specializationBonuses:specializationBonuses(levels),
   enhancementLevels:currentEnhancementLevels(),
   equipment:cloneJson(state?.equipment)||{}
  };
 }
 function normalizeSnapshot(snapshot){
  const source=snapshot&&typeof snapshot==="object"?snapshot:createMirrorCombatSnapshot();
  const stats=source.stats&&typeof source.stats==="object"?source.stats:{};
  const levels=source.specializations&&typeof source.specializations==="object"?source.specializations:{};
  return {
   version:MIRROR_COMBAT_CORE_VERSION,
   playerName:String(source.playerName||"玩家"),
   level:Math.max(1,Math.floor(numberOr(source.level,1))),
   vipLevel:Math.max(0,Math.floor(numberOr(source.vipLevel,0))),
   stats:{hp:Math.max(1,Math.ceil(numberOr(stats.hp,1))),atk:Math.max(1,Math.ceil(numberOr(stats.atk,1))),def:Math.max(0,Math.ceil(numberOr(stats.def,0))),crit:clampRate(stats.crit),dodge:clampRate(stats.dodge)},
   specializations:cloneJson(levels)||{},
   specializationBonuses:specializationBonuses(levels),
   enhancementLevels:cloneJson(source.enhancementLevels)||{},
   equipment:cloneJson(source.equipment)||{}
  };
 }

 window.runMirrorCombatCore=function(snapshot,options={}){
  const snap=normalizeSnapshot(snapshot);
  const rng=typeof options.rng==="function"?options.rng:Math.random;
  const logs=options.logs===false?null:[];
  const events=[];
  const names={player:String(options.playerName||snap.playerName||"玩家"),mirror:String(options.mirrorName||`鏡像・${snap.playerName||"玩家"}`)};
  const spec=snap.specializationBonuses;
  const stats=snap.stats;
  const sides={
   player:{key:"player",name:names.player,hp:stats.hp,maxHp:stats.hp,initiativeUsed:false},
   mirror:{key:"mirror",name:names.mirror,hp:stats.hp,maxHp:stats.hp,initiativeUsed:false}
  };
  let active=rng()<.5?"player":"mirror";
  const firstActor=active;
  let turns=0;

  function other(key){return key==="player"?"mirror":"player";}
  function pushLog(text){if(logs)logs.push(text);}
  function performStrike(actorKey,defenderKey,source,initiativeApplied){
   const actor=sides[actorKey],defender=sides[defenderKey];
   const scale=source==="counter"?MIRROR_COUNTER_SCALE:source==="combo"?MIRROR_COMBO_SCALE:1;
   const dodge=roll(rng,stats.dodge);
   if(dodge){
    events.push({type:"dodge",actor:actorKey,target:defenderKey,source,initiative:initiativeApplied});
    pushLog(`${actor.name}攻擊${defender.name}，${defender.name}閃避了攻擊。`);
    return {hit:false,actualDamage:0,killed:false};
   }
   const penetration=roll(rng,spec.penetration);
   const effectiveDef=stats.def*(penetration?MIRROR_PENETRATION_DEF_MULTIPLIER:1);
   let damage=combatDamage(stats.atk,effectiveDef,rng);
   if(initiativeApplied&&spec.initiative>0)damage=Math.ceil(damage*(1+spec.initiative/100));
   const crit=roll(rng,stats.crit);
   if(crit)damage=Math.ceil(damage*(Number(CRIT_DAMAGE_MULTIPLIER)||1.5));
   damage=Math.max(1,Math.ceil(damage*scale));
   const before=Math.max(0,defender.hp),actualDamage=Math.min(before,damage);
   defender.hp=Math.max(0,defender.hp-damage);
   events.push({type:"attack",actor:actorKey,target:defenderKey,source,damage,actualDamage,crit,penetration,initiative:initiativeApplied});
   pushLog(`${actor.name}攻擊${defender.name}${crit?"，暴擊":""}造成 ${damage} 點傷害。`);
   if(actualDamage>0&&roll(rng,spec.drain)){
    const wanted=Math.max(1,Math.ceil(actualDamage*MIRROR_DRAIN_RATIO));
    const healed=Math.max(0,Math.min(wanted,actor.maxHp-actor.hp));
    actor.hp+=healed;
    events.push({type:"drain",actor:actorKey,source,healed,actualDamage});
    if(healed>0)pushLog(`${actor.name}汲取生命，回復 ${healed} HP。`);
   }
   return {hit:true,actualDamage,killed:defender.hp<=0};
  }
  function attackChain(actorKey,defenderKey,initialSource="normal",allowCounter=false){
   const actor=sides[actorKey],defender=sides[defenderKey];
   let source=initialSource,first=true,hadEffectiveDamage=false;
   while(actor.hp>0&&defender.hp>0){
    let initiativeApplied=false;
    if(initialSource==="normal"&&first&&!actor.initiativeUsed){actor.initiativeUsed=true;initiativeApplied=spec.initiative>0;}
    const strike=performStrike(actorKey,defenderKey,source,initiativeApplied);
    if(strike.actualDamage>0)hadEffectiveDamage=true;
    first=false;
    if(defender.hp<=0)break;
    if(!roll(rng,spec.combo))break;
    events.push({type:"combo",actor:actorKey,from:source});
    source="combo";
   }
   if(allowCounter&&actor.hp>0&&defender.hp>0&&hadEffectiveDamage&&roll(rng,spec.counter)){
    events.push({type:"counter",actor:defenderKey,target:actorKey});
    pushLog(`${defender.name}發動反擊。`);
    attackChain(defenderKey,actorKey,"counter",false);
   }
  }

  events.push({type:"firstActor",actor:firstActor});
  pushLog(`${sides[firstActor].name}取得先攻。`);
  while(sides.player.hp>0&&sides.mirror.hp>0){
   turns++;
   const defender=other(active);
   attackChain(active,defender,"normal",true);
   if(sides[defender].hp<=0||sides[active].hp<=0)break;
   active=defender;
  }
  const winner=sides.player.hp>0?"player":"mirror";
  const loser=other(winner);
  events.push({type:"battleEnd",winner,loser,turns});
  pushLog(`${sides[winner].name}獲勝。`);
  return {
   win:winner==="player",
   winner,
   firstActor,
   turns,
   playerHp:Math.max(0,sides.player.hp),
   mirrorHp:Math.max(0,sides.mirror.hp),
   maxHp:stats.hp,
   logs:logs||[],
   events,
   snapshot:snap
  };
 };

 window.MIRROR_COMBAT_CORE_VERSION=MIRROR_COMBAT_CORE_VERSION;
 window.MIRROR_COMBAT_BATTLE_LIMIT=MIRROR_COMBAT_BATTLE_LIMIT;
 window.createMirrorCombatSnapshot=createMirrorCombatSnapshot;
 window.normalizeMirrorCombatSnapshot=normalizeSnapshot;
 window.mirrorSpecializationBonuses=specializationBonuses;
})();
