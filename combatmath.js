(function(){
 const COMBAT_DAMAGE_MODEL_VERSION=1;
 const WORLD_COMBAT_ADAPTER_VERSION=1;
 const DEF_WEIGHT=.55;
 const RANDOM_MIN=.95;
 const RANDOM_RANGE=.10;
 function numberOr(value,fallback=0){const n=Number(value);return Number.isFinite(n)?n:fallback;}
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
 function worldCombatDamageMultiplier(world,targetState=null,civilizationLevel=null){
  const phase=normalizeWorld(world,targetState);
  if(typeof window.civilizationCombatDamageMultiplier!=="function")return 1;
  const value=Number(window.civilizationCombatDamageMultiplier({world:phase,state:targetState,civilizationLevel}));
  return Number.isFinite(value)&&value>=0?value:1;
 }
 function runWorldCombatCore(player,enemy,startHp=null,options={}){
  if(typeof window.runCombatCore!=="function")throw new Error("正式戰鬥核心尚未載入。");
  const source=options&&typeof options==="object"?options:{};
  const targetState=source.state&&typeof source.state==="object"?source.state:(typeof state!=="undefined"&&state&&typeof state==="object"?state:null);
  const world=normalizeWorld(source.world,targetState);
  const resolvedMultiplier=source.playerFinalDamageMultiplier==null
   ?worldCombatDamageMultiplier(world,targetState,source.civilizationLevel)
   :Math.max(0,numberOr(source.playerFinalDamageMultiplier,1));
  const combatOptions={...source,playerFinalDamageMultiplier:resolvedMultiplier};
  delete combatOptions.world;
  delete combatOptions.state;
  delete combatOptions.civilizationLevel;
  const combat=window.runCombatCore(player,enemy,startHp,combatOptions);
  return Object.freeze({version:WORLD_COMBAT_ADAPTER_VERSION,world,playerFinalDamageMultiplier:resolvedMultiplier,combat});
 }
 window.COMBAT_DAMAGE_MODEL_VERSION=COMBAT_DAMAGE_MODEL_VERSION;
 window.COMBAT_DAMAGE_DEF_WEIGHT=DEF_WEIGHT;
 window.combatDamageWithRng=combatDamageWithRng;
 window.calcDamage=calcDamageCompat;
 window.COMBAT_WORLD_ADAPTER_VERSION=WORLD_COMBAT_ADAPTER_VERSION;
 window.worldCombatDamageMultiplier=worldCombatDamageMultiplier;
 window.runWorldCombatCore=runWorldCombatCore;
 try{calcDamage=calcDamageCompat;}catch(e){}
})();
