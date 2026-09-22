(function(){
 const CIVILIZATION_LEVEL_MAX=10;
 const CIVILIZATION_FINAL_DAMAGE_PERCENT_PER_LEVEL=5;

 function clampCivilizationLevel(value){
  const n=Math.floor(Number(value));
  return Number.isFinite(n)?Math.max(0,Math.min(CIVILIZATION_LEVEL_MAX,n)):0;
 }
 function civilizationLevel(target=null){
  const holder=target&&typeof target==="object"?target:(typeof state!=="undefined"&&state&&typeof state==="object"?state:null);
  if(!holder)return 0;
  const entered=typeof window.isSecondWorldEntered==="function"?window.isSecondWorldEntered(holder)===true:holder?.secondWorld?.entered===true;
  if(!entered)return 0;
  return clampCivilizationLevel(holder?.secondWorld?.civilizationLevel);
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

 window.CIVILIZATION_LEVEL_MAX=CIVILIZATION_LEVEL_MAX;
 window.CIVILIZATION_FINAL_DAMAGE_PERCENT_PER_LEVEL=CIVILIZATION_FINAL_DAMAGE_PERCENT_PER_LEVEL;
 window.CIVILIZATION_CORE_VERSION=1;
 window.CIVILIZATION_FINAL_DAMAGE_LAYER_VERSION=1;
 window.clampCivilizationLevel=clampCivilizationLevel;
 window.civilizationLevel=civilizationLevel;
 window.civilizationDamageBonusPercentForLevel=civilizationDamageBonusPercentForLevel;
 window.civilizationDamageMultiplierForLevel=civilizationDamageMultiplierForLevel;
 window.civilizationDamageBonusPercent=civilizationDamageBonusPercent;
 window.civilizationDamageMultiplier=civilizationDamageMultiplier;
 window.civilizationFinalDamage=civilizationFinalDamage;
})();