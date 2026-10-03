(function(){
 const COMBAT_DAMAGE_MODEL_VERSION=1;
 const WORLD_COMBAT_ADAPTER_VERSION=1;
 const FORMAL_PLAYER_FINAL_DAMAGE_OWNER_VERSION=1;
 const DEF_WEIGHT=.55;
 const RANDOM_MIN=.95;
 const RANDOM_RANGE=.10;
 function numberOr(value,fallback=0){const n=Number(value);return Number.isFinite(n)?n:fallback;}
 function wholeNonNegative(value){const n=Math.floor(Number(value));return Number.isFinite(n)&&n>=0?n:0;}
 function combatDamageWithRng(atk,def,rng=Math.random){
  const random=typeof rng==="function"?rng:Math.random;
  const attack=Math.max(0,numberOr(atk,0)),defense=Math.max(0,numberOr(def,0));
  return Math.max(1,Math.ceil((attack-defense*DEF_WEIGHT)*(RANDOM_MIN+random()*RANDOM_RANGE)));
 }
 function calcDamageCompat(atk,def){return combatDamageWithRng(atk,def,Math.random);}
 function normalizeWorld(value,targetState=null){
  const explicit=Math.floor(Number(value));
  if(explicit===1||explicit===2||explicit===3)return explicit;
  if(typeof window.currentWorldPhase==="function"){
   const phase=Math.floor(Number(window.currentWorldPhase(targetState))||1);
   if(phase===1||phase===2||phase===3)return phase;
  }
  return targetState?.thirdWorld?.entered===true?3:targetState?.secondWorld?.entered===true?2:1;
 }
 function civilizationFinalDamageAdd(world,targetState=null,civilizationLevel=null){
  const phase=normalizeWorld(world,targetState);
  if(typeof window.civilizationCombatDamageMultiplier!=="function")return 0;
  const multiplier=Number(window.civilizationCombatDamageMultiplier({world:phase,state:targetState,civilizationLevel}));
  return Number.isFinite(multiplier)&&multiplier>=1?multiplier-1:0;
 }
 function breakthroughFinalDamageAddForState(targetState=null,breakthroughLevel=null){
  if(breakthroughLevel!=null){
   const perLevel=Math.max(0,numberOr(window.BREAKTHROUGH_FINAL_DAMAGE_ADD_PER_LEVEL,.05));
   return wholeNonNegative(breakthroughLevel)*perLevel;
  }
  if(typeof window.breakthroughFinalDamageAdd!=="function")return 0;
  const value=Number(window.breakthroughFinalDamageAdd(targetState));
  return Number.isFinite(value)&&value>=0?value:0;
 }
 function formalPlayerFinalDamageMultiplier(options={}){
  const source=options&&typeof options==="object"?options:{};
  const targetState=source.state&&typeof source.state==="object"?source.state:null;
  const world=normalizeWorld(source.world,targetState);
  const civilizationAdd=civilizationFinalDamageAdd(world,targetState,source.civilizationLevel);
  const breakthroughAdd=breakthroughFinalDamageAddForState(targetState,source.breakthroughLevel);
  return 1+civilizationAdd+breakthroughAdd;
 }
 function formalPlayerFinalDamageSnapshot(options={}){
  const source=options&&typeof options==="object"?options:{};
  const targetState=source.state&&typeof source.state==="object"?source.state:null;
  const world=normalizeWorld(source.world,targetState);
  const civilizationAdd=civilizationFinalDamageAdd(world,targetState,source.civilizationLevel);
  const breakthroughAdd=breakthroughFinalDamageAddForState(targetState,source.breakthroughLevel);
  const breakthroughLevel=source.breakthroughLevel!=null?wholeNonNegative(source.breakthroughLevel):(typeof window.breakthroughLevel==="function"?wholeNonNegative(window.breakthroughLevel(targetState)):0);
  return Object.freeze({version:FORMAL_PLAYER_FINAL_DAMAGE_OWNER_VERSION,world,civilizationAdd,breakthroughLevel,breakthroughAdd,multiplier:1+civilizationAdd+breakthroughAdd});
 }
 function worldCombatDamageMultiplier(world,targetState=null,civilizationLevel=null,breakthroughLevel=null){
  return formalPlayerFinalDamageMultiplier({world,state:targetState,civilizationLevel,breakthroughLevel});
 }
 function runWorldCombatCore(player,enemy,startHp=null,options={}){
  if(typeof window.runCombatCore!=="function")throw new Error("正式戰鬥核心尚未載入。");
  const source=options&&typeof options==="object"?options:{};
  const targetState=source.state&&typeof source.state==="object"?source.state:(typeof state!=="undefined"&&state&&typeof state==="object"?state:null);
  const world=normalizeWorld(source.world,targetState);
  const resolvedMultiplier=source.playerFinalDamageMultiplier==null
   ?formalPlayerFinalDamageMultiplier({world,state:targetState,civilizationLevel:source.civilizationLevel,breakthroughLevel:source.breakthroughLevel})
   :Math.max(0,numberOr(source.playerFinalDamageMultiplier,1));
  const combatOptions={...source,playerFinalDamageMultiplier:resolvedMultiplier};
  delete combatOptions.world;
  delete combatOptions.state;
  delete combatOptions.civilizationLevel;
  delete combatOptions.breakthroughLevel;
  const combat=window.runCombatCore(player,enemy,startHp,combatOptions);
  return Object.freeze({version:WORLD_COMBAT_ADAPTER_VERSION,world,playerFinalDamageMultiplier:resolvedMultiplier,combat});
 }
 window.COMBAT_DAMAGE_MODEL_VERSION=COMBAT_DAMAGE_MODEL_VERSION;
 window.COMBAT_DAMAGE_DEF_WEIGHT=DEF_WEIGHT;
 window.combatDamageWithRng=combatDamageWithRng;
 window.calcDamage=calcDamageCompat;
 window.COMBAT_WORLD_ADAPTER_VERSION=WORLD_COMBAT_ADAPTER_VERSION;
 window.FORMAL_PLAYER_FINAL_DAMAGE_OWNER_VERSION=FORMAL_PLAYER_FINAL_DAMAGE_OWNER_VERSION;
 window.civilizationFinalDamageAdd=civilizationFinalDamageAdd;
 window.breakthroughFinalDamageAddForState=breakthroughFinalDamageAddForState;
 window.formalPlayerFinalDamageMultiplier=formalPlayerFinalDamageMultiplier;
 window.formalPlayerFinalDamageSnapshot=formalPlayerFinalDamageSnapshot;
 window.worldCombatDamageMultiplier=worldCombatDamageMultiplier;
 window.runWorldCombatCore=runWorldCombatCore;
 try{calcDamage=calcDamageCompat;}catch(e){}
})();
