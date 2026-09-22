(function(){
 const FIRST_WORLD_ENHANCEMENT_CAP=20;
 const SECOND_WORLD_ENHANCEMENT_CAP=40;
 const SECOND_WORLD_ENHANCEMENT_EXTENSION_ACTIVE=true;
 const ABSOLUTE_MAX_LEVEL=SECOND_WORLD_ENHANCEMENT_CAP;
 const MAX_LEVEL=FIRST_WORLD_ENHANCEMENT_CAP;
 const BONUS_PERCENT_PER_LEVEL=2.5;
 const BASIC_COST_PER_TARGET_LEVEL=50;
 const ADVANCED_COST_PER_TARGET_LEVEL=5;
 const SECOND_WORLD_DARK_MATTER_BASE=30000;
 const SECOND_WORLD_DARK_MATTER_STEP=12000;
 const SECOND_WORLD_DARK_ENERGY_BASE=300;
 const SECOND_WORLD_DARK_ENERGY_STEP=10;
 const SLOTS=["weapon","helmet","armor","shoes","accessory"];
 function clampWhole(value,min,max){const n=Math.floor(Number(value));return Number.isFinite(n)?Math.max(min,Math.min(max,n)):min;}
 function normalizeCount(value){const n=Math.floor(Number(value));return Number.isFinite(n)&&n>=0?n:0;}
 function blankLevels(){return Object.fromEntries(SLOTS.map(type=>[type,0]));}
 function enteredSecondWorld(target=null){
  const holder=target&&typeof target==="object"?target:(typeof state!=="undefined"&&state&&typeof state==="object"?state:null);
  if(!holder)return false;
  if(typeof window.isSecondWorldEntered==="function")return window.isSecondWorldEntered(holder)===true;
  return holder?.secondWorld?.entered===true;
 }
 function effectiveEnhancementCap(target=null){return enteredSecondWorld(target)?SECOND_WORLD_ENHANCEMENT_CAP:FIRST_WORLD_ENHANCEMENT_CAP;}
 function clampEffectiveEnhancementLevel(value,target=null){return clampWhole(value,0,effectiveEnhancementCap(target));}
 function normalizeEnhancementState(target){
  if(!target||typeof target!=="object")return target;
  const source=target.enhancement&&typeof target.enhancement==="object"&&!Array.isArray(target.enhancement)?target.enhancement:{};
  const rawLevels=source.levels&&typeof source.levels==="object"&&!Array.isArray(source.levels)?source.levels:{};
  const levels=blankLevels();
  const cap=effectiveEnhancementCap(target);
  SLOTS.forEach(type=>{levels[type]=clampWhole(rawLevels[type],0,cap);});
  target.enhancement={basicStones:normalizeCount(source.basicStones),advancedStones:normalizeCount(source.advancedStones),levels};
  return target;
 }
 function enhancementLevel(target,type){if(!SLOTS.includes(type))return 0;const holder=target&&typeof target==="object"?target:(typeof state!=="undefined"?state:null);return clampEffectiveEnhancementLevel(holder?.enhancement?.levels?.[type],holder);}
 function enhancementBonusPercent(level){return clampWhole(level,0,ABSOLUTE_MAX_LEVEL)*BONUS_PERCENT_PER_LEVEL;}
 function enhancementMultiplier(level){return 1+enhancementBonusPercent(level)/100;}
 function enhancementUpgradeCost(targetLevel,target=null){
  const raw=Math.floor(Number(targetLevel)),cap=effectiveEnhancementCap(target);
  if(!Number.isFinite(raw)||raw<1||raw>cap)return {available:false,targetLevel:Number.isFinite(raw)?raw:0,phase:enteredSecondWorld(target)?2:1,basic:0,advanced:0,darkMatter:0,darkEnergy:0};
  if(raw<=FIRST_WORLD_ENHANCEMENT_CAP)return {available:true,targetLevel:raw,phase:1,basic:BASIC_COST_PER_TARGET_LEVEL*raw,advanced:ADVANCED_COST_PER_TARGET_LEVEL*raw,darkMatter:0,darkEnergy:0};
  const k=raw-(FIRST_WORLD_ENHANCEMENT_CAP+1);
  return {available:true,targetLevel:raw,phase:2,basic:0,advanced:0,darkMatter:SECOND_WORLD_DARK_MATTER_BASE+SECOND_WORLD_DARK_MATTER_STEP*k,darkEnergy:SECOND_WORLD_DARK_ENERGY_BASE+SECOND_WORLD_DARK_ENERGY_STEP*k};
 }
 function enhancedMainStatValue(rawValue,level){return Math.max(0,Number(rawValue)||0)*enhancementMultiplier(level);}
 window.FIRST_WORLD_ENHANCEMENT_CAP=FIRST_WORLD_ENHANCEMENT_CAP;
 window.SECOND_WORLD_ENHANCEMENT_CAP=SECOND_WORLD_ENHANCEMENT_CAP;
 window.SECOND_WORLD_ENHANCEMENT_EXTENSION_ACTIVE=SECOND_WORLD_ENHANCEMENT_EXTENSION_ACTIVE;
 window.ENHANCEMENT_ABSOLUTE_MAX_LEVEL=ABSOLUTE_MAX_LEVEL;
 window.ENHANCEMENT_MAX_LEVEL=MAX_LEVEL;
 window.ENHANCEMENT_WORLD_AWARE_CORE_VERSION=1;
 window.SECOND_WORLD_ENHANCEMENT_COST_VERSION=1;
 window.SECOND_WORLD_ENHANCEMENT_DATA_CAP_ACTIVE=true;
 window.ENHANCEMENT_BONUS_PERCENT_PER_LEVEL=BONUS_PERCENT_PER_LEVEL;
 window.ENHANCEMENT_SLOTS=Object.freeze(SLOTS.slice());
 window.createBlankEnhancementLevels=blankLevels;
 window.effectiveEnhancementCap=effectiveEnhancementCap;
 window.clampEffectiveEnhancementLevel=clampEffectiveEnhancementLevel;
 window.normalizeEnhancementState=normalizeEnhancementState;
 window.enhancementLevel=enhancementLevel;
 window.enhancementBonusPercent=enhancementBonusPercent;
 window.enhancementMultiplier=enhancementMultiplier;
 window.enhancementUpgradeCost=enhancementUpgradeCost;
 window.SECOND_WORLD_ENHANCEMENT_COST_CONFIG=Object.freeze({darkMatterBase:SECOND_WORLD_DARK_MATTER_BASE,darkMatterStep:SECOND_WORLD_DARK_MATTER_STEP,darkEnergyBase:SECOND_WORLD_DARK_ENERGY_BASE,darkEnergyStep:SECOND_WORLD_DARK_ENERGY_STEP});
 window.enhancedMainStatValue=enhancedMainStatValue;
})();
