(function(){
 function statsWithEnhancementLevels(levelSource=null){
  const base=typeof window.rawEquippedStats==="function"?window.rawEquippedStats():{hp:baseHP(state.level),atk:baseATK(state.level),def:baseDEF(state.level),crit:0,dodge:0};
  const out={...base};
  EQUIPMENT_TYPES.forEach(type=>{
   const item=state.equipment?.[type];
   if(!item)return;
   const stat=item.mainStat?.stat;
   const raw=Math.max(0,Number(item.mainStat?.value)||0);
   if(!raw||!["hp","atk","def","crit","dodge"].includes(stat))return;
   const level=levelSource&&typeof levelSource==="object"?Math.max(0,Math.min(Number(window.ENHANCEMENT_MAX_LEVEL)||20,Math.floor(Number(levelSource[type])||0))):(typeof enhancementLevel==="function"?enhancementLevel(state,type):0);
   const enhanced=typeof enhancedMainStatValue==="function"?enhancedMainStatValue(raw,level):raw;
   const extra=Math.max(0,enhanced-raw);
   out[stat]+=extra;
  });
  out.hp=Math.max(0,Number(out.hp)||0);
  out.atk=Math.max(0,Number(out.atk)||0);
  out.def=Math.max(0,Number(out.def)||0);
  out.crit=round1(Math.max(0,Number(out.crit)||0));
  out.dodge=round1(Math.max(0,Number(out.dodge)||0));
  return out;
 }

 window.rawEquippedStats=equippedStats;
 function enhancedEquippedStats(){return statsWithEnhancementLevels(null);}
 equippedStats=enhancedEquippedStats;
 window.equippedStats=enhancedEquippedStats;
 window.enhancedEquippedStats=enhancedEquippedStats;
 window.equippedStatsWithEnhancementLevels=statsWithEnhancementLevels;
})();
