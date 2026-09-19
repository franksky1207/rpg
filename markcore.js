(function(){
 const MARK_CORE_VERSION=1;
 const MARK_COMBAT_RULE_VERSION=1;
 const MARK_PROGRESSION_OWNER_VERSION=1;
 const MARK_MAX_LEVEL=Math.max(0,Math.floor(Number(window.MARK_MAX_LEVEL)||10));
 const MARK_UPGRADE_KILLS=Object.freeze([1,1,2,2,3,3,4,4,5,5]);
 const CONFIG=Array.from(window.CIVILIZATION_CALAMITY_CONFIG||[]);
 const MARK_KEYS=Object.freeze(CONFIG.map(entry=>entry.markId));
 const MARK_DEFS=Object.freeze(Object.fromEntries(CONFIG.map(entry=>[
  entry.markId,
  Object.freeze({id:entry.markId,name:entry.markName,regionId:entry.regionId,unlockLevel:entry.unlockLevel})
 ])));

 function clampLevel(value){return Math.max(0,Math.min(MARK_MAX_LEVEL,Math.floor(Number(value)||0)));}
 function round1(value){return Math.round((Number(value)||0)*10)/10;}
 function validKey(key){return MARK_KEYS.includes(key)&&!!MARK_DEFS[key];}
 function activationChance(level){const lv=clampLevel(level);return lv<=0?0:30+(lv-1)*5;}
 function requiredKillsForNextLevel(level){
  const lv=clampLevel(level);
  return lv>=MARK_MAX_LEVEL?0:MARK_UPGRADE_KILLS[lv]||0;
 }
 function cumulativeKillsForLevel(level){
  const lv=clampLevel(level);
  let total=0;
  for(let i=0;i<lv;i++)total+=MARK_UPGRADE_KILLS[i]||0;
  return total;
 }
 function progressSnapshot(value){
  const source=value&&typeof value==="object"?value:{};
  const level=clampLevel(source.level);
  const acquired=source.acquired===true||level>0;
  if(!acquired)return {acquired:false,level:0,progress:0};
  if(level>=MARK_MAX_LEVEL)return {acquired:true,level:MARK_MAX_LEVEL,progress:0};
  const required=Math.max(1,requiredKillsForNextLevel(level));
  const progress=Math.max(0,Math.min(required-1,Math.floor(Number(source.progress)||0)));
  return {acquired:true,level,progress};
 }
 function formalEntry(key){
  if(!validKey(key))return {acquired:false,level:0,progress:0};
  return progressSnapshot(state?.marks?.entries?.[key]);
 }
 function advanceProgressEntry(value){
  const entry=progressSnapshot(value);
  if(!entry.acquired){
   return {entry:{acquired:true,level:0,progress:0},settlement:{changed:true,firstAcquisition:true,level:0,progress:0,maxed:false,levelUp:false}};
  }
  if(entry.level>=MARK_MAX_LEVEL){
   return {entry:{acquired:true,level:MARK_MAX_LEVEL,progress:0},settlement:{changed:false,firstAcquisition:false,level:MARK_MAX_LEVEL,progress:0,maxed:true,levelUp:false}};
  }
  const before=entry.level,required=Math.max(1,requiredKillsForNextLevel(before));
  const nextProgress=Math.min(required,entry.progress+1);
  const levelUp=nextProgress>=required,nextLevel=levelUp?Math.min(MARK_MAX_LEVEL,before+1):before,nextStored=levelUp?0:nextProgress;
  return {entry:{acquired:true,level:nextLevel,progress:nextLevel>=MARK_MAX_LEVEL?0:nextStored},settlement:{changed:true,firstAcquisition:false,level:nextLevel,progress:nextLevel>=MARK_MAX_LEVEL?0:nextStored,maxed:nextLevel>=MARK_MAX_LEVEL,levelUp,previousLevel:before,required}};
 }
 function settleFormalKill(key){
  if(!validKey(key))return {changed:false,firstAcquisition:false,level:0,progress:0,maxed:false};
  if(typeof window.ensureCivilizationCalamityState==="function")window.ensureCivilizationCalamityState();
  const entry=state?.marks?.entries?.[key];
  if(!entry)return {changed:false,firstAcquisition:false,level:0,progress:0,maxed:false};
  const advanced=advanceProgressEntry(entry);
  Object.assign(entry,advanced.entry);
  return advanced.settlement;
 }
 function testLevel(key){
  if(!validKey(key))return 0;
  return clampLevel(window.gmTestMarkLevels?.[key]);
 }
 function markLevel(key,useTest=false){return useTest?testLevel(key):formalEntry(key).level;}
 function markAcquired(key){return formalEntry(key).acquired;}
 function markProgress(key){return formalEntry(key).progress;}
 function effectSnapshot(key,level){
  const lv=clampLevel(level);
  const base={id:key,level:lv,active:lv>0};
  if(key==="ward")return {...base,activationChance:activationChance(lv),shieldMaxHpPercent:lv*2};
  if(key==="suppression")return {...base,enemyDodgeReductionPoints:lv*.5};
  if(key==="composure")return {...base,enemyCritReductionPoints:lv*.5};
  if(key==="indomitable")return {...base,activationChance:activationChance(lv),surviveHp:lv>0?1:0,usesPerBattle:lv>0?1:0};
  if(key==="resilience")return {...base,enemyCritBonusDamageReductionPercent:lv*3};
  if(key==="battleSpirit")return {...base,activationChance:activationChance(lv),atkPercentPerLayer:round1(lv*.2),maxLayers:10};
  if(key==="absorption")return {...base,triggerChance:lv*.5,healOriginalDamagePercent:lv>0?25:0};
  if(key==="revenge")return {...base,triggerChance:lv*5};
  if(key==="backlash")return {...base,triggerChance:lv*1.5,reflectActualHpLossPercent:lv>0?30:0};
  if(key==="ignore")return {...base,triggerChance:lv*.5,enemyDefMultiplierOnTrigger:lv>0?0:1};
  return base;
 }
 function levelsSnapshot(useTest=false){return Object.fromEntries(MARK_KEYS.map(key=>[key,markLevel(key,useTest)]));}
 function formalSnapshot(){
  return Object.fromEntries(MARK_KEYS.map(key=>{
   const entry=formalEntry(key);
   return [key,{...entry,requiredForNext:requiredKillsForNextLevel(entry.level)}];
  }));
 }
 function effectsSnapshot(useTest=false){return Object.fromEntries(MARK_KEYS.map(key=>[key,effectSnapshot(key,markLevel(key,useTest))]));}
 function blankTestLevels(){return Object.fromEntries(MARK_KEYS.map(key=>[key,0]));}

 window.MARK_CORE_VERSION=MARK_CORE_VERSION;
 window.MARK_COMBAT_RULE_VERSION=MARK_COMBAT_RULE_VERSION;
 window.MARK_PROGRESSION_OWNER_VERSION=MARK_PROGRESSION_OWNER_VERSION;
 window.MARK_UPGRADE_KILLS=MARK_UPGRADE_KILLS;
 window.MARK_KEYS=MARK_KEYS;
 window.MARK_DEFS=MARK_DEFS;
 window.markClampLevel=clampLevel;
 window.markActivationChance=activationChance;
 window.markRequiredKillsForNextLevel=requiredKillsForNextLevel;
 window.markCumulativeKillsForLevel=cumulativeKillsForLevel;
 window.markProgressSnapshot=progressSnapshot;
 window.advanceMarkProgressEntry=advanceProgressEntry;
 window.settleFormalMarkKill=settleFormalKill;
 window.markLevel=markLevel;
 window.markAcquired=markAcquired;
 window.markProgress=markProgress;
 window.markEffectSnapshot=effectSnapshot;
 window.markLevelsSnapshot=levelsSnapshot;
 window.markFormalSnapshot=formalSnapshot;
 window.markEffectsSnapshot=effectsSnapshot;
 window.createBlankTestMarkLevels=blankTestLevels;
 window.gmTestMarkLevels=blankTestLevels();
 window.gmSetTestMarkLevel=function(key,value){
  if(!validKey(key))return false;
  if(!window.gmTestMarkLevels||typeof window.gmTestMarkLevels!=="object")window.gmTestMarkLevels=blankTestLevels();
  window.gmTestMarkLevels[key]=clampLevel(value);
  return true;
 };
 window.gmUseCurrentMarkTestStatus=function(){
  MARK_KEYS.forEach(key=>window.gmSetTestMarkLevel(key,markLevel(key,false)));
  return levelsSnapshot(true);
 };

 // Temporary compatibility aliases; ownership is Mark Core and these are candidates for final cleanup.
 window.normalizeCivilizationMarkProgressForCore=progressSnapshot;
 window.advanceCivilizationCalamityMarkEntry=advanceProgressEntry;
 window.settleCivilizationCalamityMarkKill=settleFormalKill;
})();
