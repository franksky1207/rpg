(function(){
 const MARK_CORE_VERSION=1;
 const MARK_COMBAT_RULE_VERSION=1;
 const MARK_MAX_LEVEL=Math.max(0,Math.floor(Number(window.MARK_MAX_LEVEL)||10));
 const MARK_UPGRADE_KILLS=Object.freeze([1,1,2,2,3,3,4,4,5,5]);
 const MARK_KEYS=Object.freeze(Array.from(window.CIVILIZATION_MARK_IDS||[]));
 const REGION_IDS=Object.freeze(Array.from(window.CIVILIZATION_CALAMITY_IDS||[]));
 function regionMax(index){const id=REGION_IDS[index];const region=Array.isArray(WORLD_REGIONS)?WORLD_REGIONS.find(x=>x?.id===id):null;return Math.max(1,Math.floor(Number(region?.max)||((index+1)*50)));}
 const MARK_DEFS=Object.freeze({
  ward:Object.freeze({id:"ward",name:"護界印記",regionId:REGION_IDS[0],unlockLevel:regionMax(0)}),
  suppression:Object.freeze({id:"suppression",name:"壓制印記",regionId:REGION_IDS[1],unlockLevel:regionMax(1)}),
  composure:Object.freeze({id:"composure",name:"鎮心印記",regionId:REGION_IDS[2],unlockLevel:regionMax(2)}),
  indomitable:Object.freeze({id:"indomitable",name:"不屈印記",regionId:REGION_IDS[3],unlockLevel:regionMax(3)}),
  resilience:Object.freeze({id:"resilience",name:"韌性印記",regionId:REGION_IDS[4],unlockLevel:regionMax(4)}),
  battleSpirit:Object.freeze({id:"battleSpirit",name:"戰意印記",regionId:REGION_IDS[5],unlockLevel:regionMax(5)}),
  absorption:Object.freeze({id:"absorption",name:"吸收印記",regionId:REGION_IDS[6],unlockLevel:regionMax(6)}),
  revenge:Object.freeze({id:"revenge",name:"復仇印記",regionId:REGION_IDS[7],unlockLevel:regionMax(7)}),
  backlash:Object.freeze({id:"backlash",name:"反噬印記",regionId:REGION_IDS[8],unlockLevel:regionMax(8)}),
  ignore:Object.freeze({id:"ignore",name:"無視印記",regionId:REGION_IDS[9],unlockLevel:regionMax(9)})
 });

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
 function formalEntry(key){
  if(!validKey(key))return {acquired:false,level:0,progress:0};
  if(typeof window.ensureCivilizationCalamityState==="function")window.ensureCivilizationCalamityState();
  const entry=state?.marks?.entries?.[key];
  return {
   acquired:entry?.acquired===true,
   level:clampLevel(entry?.level),
   progress:Math.max(0,Math.floor(Number(entry?.progress)||0))
  };
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
 function levelsSnapshot(useTest=false){
  return Object.fromEntries(MARK_KEYS.map(key=>[key,markLevel(key,useTest)]));
 }
 function formalSnapshot(){
  return Object.fromEntries(MARK_KEYS.map(key=>{
   const entry=formalEntry(key);
   return [key,{...entry,requiredForNext:requiredKillsForNextLevel(entry.level)}];
  }));
 }
 function effectsSnapshot(useTest=false){
  return Object.fromEntries(MARK_KEYS.map(key=>[key,effectSnapshot(key,markLevel(key,useTest))]));
 }
 function blankTestLevels(){return Object.fromEntries(MARK_KEYS.map(key=>[key,0]));}

 window.MARK_CORE_VERSION=MARK_CORE_VERSION;
 window.MARK_COMBAT_RULE_VERSION=MARK_COMBAT_RULE_VERSION;
 window.MARK_UPGRADE_KILLS=MARK_UPGRADE_KILLS;
 window.MARK_KEYS=MARK_KEYS;
 window.MARK_DEFS=MARK_DEFS;
 window.markClampLevel=clampLevel;
 window.markActivationChance=activationChance;
 window.markRequiredKillsForNextLevel=requiredKillsForNextLevel;
 window.markCumulativeKillsForLevel=cumulativeKillsForLevel;
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
})();