(function(){
 const BREAKTHROUGH_COMBAT_STATS_OWNER_VERSION=2;
 const STATE_AWARE_COMBAT_STATS_OWNER_VERSION=1;
 const EQUIPMENT_SLOTS=Object.freeze(Array.isArray(window.ENHANCEMENT_SLOTS)?Array.from(window.ENHANCEMENT_SLOTS):["weapon","helmet","armor","shoes","accessory"]);

 if(typeof window.breakthroughRawEquipmentBonuses!=="function"){
  console.error("[突破系統] breakthroughcore.js 尚未提供正式 raw equipment bonus API");
  return;
 }
 if(typeof window.playerCombatStats!=="function"){
  console.error("[能力系統] engine.js 尚未提供正式 playerCombatStats API");
  return;
 }

 function currentState(){
  try{return typeof state!=="undefined"&&state&&typeof state==="object"?state:null;}
  catch(_){return null;}
 }
 function round1(value){return Math.round((Number(value)||0)*10)/10;}
 function explicitEnhancementLevel(value){
  const cap=Math.max(0,Math.floor(Number(window.ENHANCEMENT_ABSOLUTE_MAX_LEVEL)||Number(window.SECOND_WORLD_ENHANCEMENT_CAP)||Number(window.ENHANCEMENT_MAX_LEVEL)||20));
  return Math.max(0,Math.min(cap,Math.floor(Number(value)||0)));
 }
 function equippedRawBreakthroughStats(target=null){
  const holder=target&&typeof target==="object"?target:currentState();
  const out={hp:0,atk:0,def:0};
  if(!holder||!holder.equipment||typeof holder.equipment!=="object")return out;
  EQUIPMENT_SLOTS.forEach(type=>{
   const item=holder.equipment?.[type];
   if(!item||typeof item!=="object")return;
   out.hp+=Math.max(0,Number(item.hp)||0);
   out.atk+=Math.max(0,Number(item.atk)||0);
   out.def+=Math.max(0,Number(item.def)||0);
  });
  return out;
 }
 function stateAwareEquippedStatsWithEnhancementLevels(target=null,levelSource=null){
  const holder=target&&typeof target==="object"?target:currentState();
  if(!holder)throw new Error("Formal combat stats target state unavailable.");
  if(typeof baseHP!=="function"||typeof baseATK!=="function"||typeof baseDEF!=="function")throw new Error("Base combat stat owner unavailable.");
  const level=Math.max(1,Math.floor(Number(holder.level)||1));
  const out={hp:Math.max(1,Number(baseHP(level))||1),atk:Math.max(1,Number(baseATK(level))||1),def:Math.max(0,Number(baseDEF(level))||0),crit:0,dodge:0};
  const rawGear={hp:0,atk:0,def:0};
  EQUIPMENT_SLOTS.forEach(type=>{
   const item=holder.equipment?.[type];
   if(!item||typeof item!=="object")return;
   const hp=Math.max(0,Number(item.hp)||0),atk=Math.max(0,Number(item.atk)||0),def=Math.max(0,Number(item.def)||0);
   out.hp+=hp;out.atk+=atk;out.def+=def;rawGear.hp+=hp;rawGear.atk+=atk;rawGear.def+=def;
   out.crit+=Math.max(0,Number(item.crit)||0);out.dodge+=Math.max(0,Number(item.dodge)||0);
   const stat=item.mainStat?.stat,raw=Math.max(0,Number(item.mainStat?.value)||0);
   if(!raw||!["hp","atk","def","crit","dodge"].includes(stat))return;
   const enhancementLevel=levelSource&&typeof levelSource==="object"
    ?explicitEnhancementLevel(levelSource[type])
    :(typeof window.enhancementLevel==="function"?window.enhancementLevel(holder,type):0);
   const enhanced=typeof window.enhancedMainStatValue==="function"?window.enhancedMainStatValue(raw,enhancementLevel):raw;
   out[stat]+=Math.max(0,enhanced-raw);
  });
  const breakthrough=window.breakthroughRawEquipmentBonuses(rawGear,holder);
  out.hp=Math.max(0,(Number(out.hp)||0)+(Number(breakthrough.hp)||0));
  out.atk=Math.max(0,(Number(out.atk)||0)+(Number(breakthrough.atk)||0));
  out.def=Math.max(0,(Number(out.def)||0)+(Number(breakthrough.def)||0));
  out.crit=round1(Math.max(0,Number(out.crit)||0));
  out.dodge=round1(Math.max(0,Number(out.dodge)||0));
  return out;
 }
 function playerCombatStatsForState(target=null,levelSource=null,vipLevel=null){
  const holder=target&&typeof target==="object"?target:currentState();
  if(!holder)throw new Error("Formal combat stats target state unavailable.");
  const base=stateAwareEquippedStatsWithEnhancementLevels(holder,levelSource);
  const resolvedVip=vipLevel==null?holder.vipLevel:vipLevel;
  return window.playerCombatStats(base,resolvedVip);
 }
 function breakthroughEquippedStatsWithEnhancementLevels(levelSource=null){return stateAwareEquippedStatsWithEnhancementLevels(currentState(),levelSource);}
 function breakthroughEquippedStats(){return breakthroughEquippedStatsWithEnhancementLevels(null);}

 window.BREAKTHROUGH_COMBAT_STATS_OWNER_VERSION=BREAKTHROUGH_COMBAT_STATS_OWNER_VERSION;
 window.STATE_AWARE_COMBAT_STATS_OWNER_VERSION=STATE_AWARE_COMBAT_STATS_OWNER_VERSION;
 window.equippedRawBreakthroughStats=equippedRawBreakthroughStats;
 window.stateAwareEquippedStatsWithEnhancementLevels=stateAwareEquippedStatsWithEnhancementLevels;
 window.playerCombatStatsForState=playerCombatStatsForState;
 window.equippedStatsWithEnhancementLevels=breakthroughEquippedStatsWithEnhancementLevels;
 window.equippedStats=breakthroughEquippedStats;
 window.enhancedEquippedStats=breakthroughEquippedStats;
})();
