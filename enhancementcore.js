(function(){
 const MAX_LEVEL=20;
 const BONUS_PERCENT_PER_LEVEL=2.5;
 const BASIC_COST_PER_TARGET_LEVEL=100;
 const ADVANCED_COST_PER_TARGET_LEVEL=5;
 const SLOTS=["weapon","helmet","armor","shoes","accessory"];

 function clampWhole(value,min,max){
  const n=Math.floor(Number(value));
  return Number.isFinite(n)?Math.max(min,Math.min(max,n)):min;
 }
 function normalizeCount(value){
  const n=Math.floor(Number(value));
  return Number.isFinite(n)&&n>=0?n:0;
 }
 function blankLevels(){return Object.fromEntries(SLOTS.map(type=>[type,0]));}
 function normalizeEnhancementState(target){
  if(!target||typeof target!=="object")return target;
  const source=target.enhancement&&typeof target.enhancement==="object"&&!Array.isArray(target.enhancement)?target.enhancement:{};
  const rawLevels=source.levels&&typeof source.levels==="object"&&!Array.isArray(source.levels.levels)?source.levels:{};
  const levels=blankLevels();
  SLOTS.forEach(type=>{levels[type]=clampWhole(rawLevels[type],0,MAX_LEVEL);});
  target.enhancement={basicStones:normalizeCount(source.basicStones),advancedStones:normalizeCount(source.advancedStones),levels};
  return target;
 }
 function enhancementLevel(target,type){
  if(!SLOTS.includes(type))return 0;
  const holder=target&&typeof target==="object"?target:(typeof state!=="undefined"?state:null);
  return clampWhole(holder?.enhancement?.levels?.[type],0,MAX_LEVEL);
 }
 function enhancementBonusPercent(level){return clampWhole(level,0,MAX_LEVEL)*BONUS_PERCENT_PER_LEVEL;}
 function enhancementMultiplier(level){return 1+enhancementBonusPercent(level)/100;}
 function enhancementUpgradeCost(targetLevel){
  const n=clampWhole(targetLevel,1,MAX_LEVEL);
  return {basic:BASIC_COST_PER_TARGET_LEVEL*n,advanced:ADVANCED_COST_PER_TARGET_LEVEL*n};
 }
 function enhancedMainStatValue(rawValue,level){return Math.max(0,Number(rawValue)||0)*enhancementMultiplier(level);}

 window.ENHANCEMENT_MAX_LEVEL=MAX_LEVEL;
 window.ENHANCEMENT_BONUS_PERCENT_PER_LEVEL=BONUS_PERCENT_PER_LEVEL;
 window.ENHANCEMENT_SLOTS=Object.freeze(SLOTS.slice());
 window.createBlankEnhancementLevels=blankLevels;
 window.normalizeEnhancementState=normalizeEnhancementState;
 window.enhancementLevel=enhancementLevel;
 window.enhancementBonusPercent=enhancementBonusPercent;
 window.enhancementMultiplier=enhancementMultiplier;
 window.enhancementUpgradeCost=enhancementUpgradeCost;
 window.enhancedMainStatValue=enhancedMainStatValue;

 // 強化是正式持久資料，但不占用 newState normalizer 名額；包裝既有 newState 建立預設值。
 if(typeof window.newState==="function"){
  const baseNewState=window.newState;
  window.newState=function(){return normalizeEnhancementState(baseNewState());};
 }
})();
