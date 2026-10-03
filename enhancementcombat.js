(function(){
 const BREAKTHROUGH_COMBAT_STATS_OWNER_VERSION=1;
 const baseEquippedStatsWithEnhancementLevels=window.equippedStatsWithEnhancementLevels;

 if(typeof baseEquippedStatsWithEnhancementLevels!=="function"){
  console.error("[強化系統] engine.js 尚未提供正式 equippedStatsWithEnhancementLevels API");
  return;
 }
 if(typeof window.breakthroughRawEquipmentBonuses!=="function"){
  console.error("[突破系統] breakthroughcore.js 尚未提供正式 raw equipment bonus API");
  return;
 }

 function currentState(){
  try{return typeof state!=="undefined"&&state&&typeof state==="object"?state:null;}
  catch(_){return null;}
 }
 function equippedRawBreakthroughStats(target=null){
  const holder=target&&typeof target==="object"?target:currentState();
  const out={hp:0,atk:0,def:0};
  if(!holder||!holder.equipment||typeof holder.equipment!=="object")return out;
  const slots=Array.isArray(window.ENHANCEMENT_SLOTS)?window.ENHANCEMENT_SLOTS:["weapon","helmet","armor","shoes","accessory"];
  slots.forEach(type=>{
   const item=holder.equipment?.[type];
   if(!item||typeof item!=="object")return;
   out.hp+=Math.max(0,Number(item.hp)||0);
   out.atk+=Math.max(0,Number(item.atk)||0);
   out.def+=Math.max(0,Number(item.def)||0);
  });
  return out;
 }
 function breakthroughEquippedStatsWithEnhancementLevels(levelSource=null){
  const out={...baseEquippedStatsWithEnhancementLevels(levelSource)};
  const holder=currentState();
  if(!holder)return out;
  const rawGear=equippedRawBreakthroughStats(holder);
  const breakthrough=window.breakthroughRawEquipmentBonuses(rawGear,holder);
  out.hp=Math.max(0,(Number(out.hp)||0)+(Number(breakthrough.hp)||0));
  out.atk=Math.max(0,(Number(out.atk)||0)+(Number(breakthrough.atk)||0));
  out.def=Math.max(0,(Number(out.def)||0)+(Number(breakthrough.def)||0));
  return out;
 }
 function breakthroughEquippedStats(){return breakthroughEquippedStatsWithEnhancementLevels(null);}

 window.BREAKTHROUGH_COMBAT_STATS_OWNER_VERSION=BREAKTHROUGH_COMBAT_STATS_OWNER_VERSION;
 window.equippedRawBreakthroughStats=equippedRawBreakthroughStats;
 window.equippedStatsWithEnhancementLevels=breakthroughEquippedStatsWithEnhancementLevels;
 window.equippedStats=breakthroughEquippedStats;
 window.enhancedEquippedStats=breakthroughEquippedStats;
})();
