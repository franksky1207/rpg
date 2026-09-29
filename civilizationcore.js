(function(){
 const CIVILIZATION_LEVEL_MAX=10;
 const CIVILIZATION_FINAL_DAMAGE_PERCENT_PER_LEVEL=5;

 function clampCivilizationLevel(value){
  const n=Math.floor(Number(value));
  return Number.isFinite(n)?Math.max(0,Math.min(CIVILIZATION_LEVEL_MAX,n)):0;
 }
 function civilizationWorldPhase(target=null){
  const holder=target&&typeof target==="object"?target:(typeof state!=="undefined"&&state&&typeof state==="object"?state:null);
  if(!holder)return 1;
  if(typeof window.currentWorldPhase==="function"){
   const phase=Math.floor(Number(window.currentWorldPhase(holder))||1);
   if(phase===1||phase===2||phase===3)return phase;
  }
  if(holder?.thirdWorld?.entered===true)return 3;
  if(holder?.secondWorld?.entered===true)return 2;
  return 1;
 }
 function formalCivilizationRange(target=null){
  const phase=civilizationWorldPhase(target);
  if(phase===3)return {phase,enabled:true,min:CIVILIZATION_LEVEL_MAX,max:CIVILIZATION_LEVEL_MAX,fixed:true};
  if(phase===2)return {phase,enabled:true,min:0,max:CIVILIZATION_LEVEL_MAX,fixed:false};
  return {phase,enabled:false,min:0,max:0,fixed:true};
 }
 function clampFormalCivilizationLevel(value,target=null){
  const range=formalCivilizationRange(target);
  if(!range.enabled)return 0;
  const n=clampCivilizationLevel(value);
  return Math.max(range.min,Math.min(range.max,n));
 }
 function formalCivilizationLevelValid(value,target=null){
  const range=formalCivilizationRange(target);
  if(!range.enabled)return false;
  const n=Math.floor(Number(value));
  return Number.isFinite(n)&&n>=range.min&&n<=range.max;
 }
 function civilizationLevel(target=null){
  const holder=target&&typeof target==="object"?target:(typeof state!=="undefined"&&state&&typeof state==="object"?state:null);
  if(!holder)return 0;
  const range=formalCivilizationRange(holder);
  if(!range.enabled)return 0;
  return clampFormalCivilizationLevel(holder?.secondWorld?.civilizationLevel,holder);
 }
 function civilizationDamageBonusPercentForLevel(level){
  return clampCivilizationLevel(level)*CIVILIZATION_FINAL_DAMAGE_PERCENT_PER_LEVEL;
 }
 function civilizationDamageMultiplierForLevel(level){
  return 1+civilizationDamageBonusPercentForLevel(level)/100;
 }
 function civilizationDamageBonusPercent(target=null){
  return civilizationDamageBonusPercentForLevel(civilizationLevel(target));
 }
 function civilizationDamageMultiplier(target=null){
  return civilizationDamageMultiplierForLevel(civilizationLevel(target));
 }
 function civilizationFinalDamage(baseDamage,target=null){
  const base=Math.max(0,Number(baseDamage)||0);
  return Math.max(0,Math.ceil(base*civilizationDamageMultiplier(target)));
 }
 function normalizeWorld(value){const world=Math.floor(Number(value));return world===2||world===3?world:1;}
 function inferredWorldForTarget(target){
  if(typeof window.currentWorldPhase==="function"&&target){
   const world=Number(window.currentWorldPhase(target));
   if(world===1||world===2||world===3)return world;
  }
  return target?.thirdWorld?.entered===true?3:target?.secondWorld?.entered===true?2:1;
 }
 function civilizationCombatDamageMultiplier(options={}){
  const source=options&&typeof options==="object"?options:{};
  const target=source.state&&typeof source.state==="object"?source.state:(typeof state!=="undefined"&&state&&typeof state==="object"?state:null);
  const world=source.world==null?inferredWorldForTarget(target):normalizeWorld(source.world);
  if(world<2)return 1;
  if(source.civilizationLevel!=null)return civilizationDamageMultiplierForLevel(source.civilizationLevel);
  return civilizationDamageMultiplier(target);
 }

 window.CIVILIZATION_LEVEL_MAX=CIVILIZATION_LEVEL_MAX;
 window.CIVILIZATION_FINAL_DAMAGE_PERCENT_PER_LEVEL=CIVILIZATION_FINAL_DAMAGE_PERCENT_PER_LEVEL;
 window.CIVILIZATION_CORE_VERSION=1;
 window.CIVILIZATION_FINAL_DAMAGE_LAYER_VERSION=1;
 window.CIVILIZATION_COMBAT_DAMAGE_OWNER_VERSION=1;
 window.CIVILIZATION_WORLD_PHASE_DAMAGE_VERSION=1;
 window.CIVILIZATION_FORMAL_WORLD_RANGE_VERSION=1;
 window.CIVILIZATION_WORLD3_FORMAL_LOCK_VERSION=1;
 window.clampCivilizationLevel=clampCivilizationLevel;
 window.civilizationWorldPhase=civilizationWorldPhase;
 window.formalCivilizationRange=formalCivilizationRange;
 window.clampFormalCivilizationLevel=clampFormalCivilizationLevel;
 window.formalCivilizationLevelValid=formalCivilizationLevelValid;
 window.civilizationLevel=civilizationLevel;
 window.civilizationDamageBonusPercentForLevel=civilizationDamageBonusPercentForLevel;
 window.civilizationDamageMultiplierForLevel=civilizationDamageMultiplierForLevel;
 window.civilizationDamageBonusPercent=civilizationDamageBonusPercent;
 window.civilizationDamageMultiplier=civilizationDamageMultiplier;
 window.civilizationFinalDamage=civilizationFinalDamage;
 window.civilizationCombatDamageMultiplier=civilizationCombatDamageMultiplier;
})();