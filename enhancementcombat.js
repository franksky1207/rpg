(function(){
 // 正式能力計算已整併 engine.js；本檔僅保留強化語意別名，避免既有 GM／測試呼叫中斷。
 if(typeof window.equippedStatsWithEnhancementLevels!=="function"){
  console.error("[強化系統] engine.js 尚未提供正式 equippedStatsWithEnhancementLevels API");
  return;
 }
 window.enhancedEquippedStats=function(){return window.equippedStatsWithEnhancementLevels(null);};
})();
