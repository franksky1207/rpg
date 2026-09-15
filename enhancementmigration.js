(function(){
 if(typeof window.migrateSave!=="function"||typeof window.normalizeEnhancementState!=="function")return;
 const baseMigrateSave=window.migrateSave;
 window.migrateSave=function(rawState,fromVersion=null,normalizer=null,sourceRaw=null){return window.normalizeEnhancementState(baseMigrateSave(rawState,fromVersion,normalizer,sourceRaw));};
 const errors=[],fail=(code,message,data=null)=>errors.push({code,message,data});
 if(Number(window.ENHANCEMENT_MAX_LEVEL)!==20)fail("MAX_LEVEL","強化上限應為 20");
 if(Number(window.ENHANCEMENT_BONUS_PERCENT_PER_LEVEL)!==2.5)fail("BONUS_RATE","每級主能力加成應為 2.5%");
 if(typeof window.enhancementUpgradeCost!=="function")fail("COST_FUNCTION","缺少強化成本函式");
 else [[1,100,5],[10,1000,50],[20,2000,100]].forEach(([lv,basic,advanced])=>{const cost=window.enhancementUpgradeCost(lv);if(cost.basic!==basic||cost.advanced!==advanced)fail("COST_FORMULA",`+${lv} 成本異常`,cost);});
 if(typeof window.enhancementBonusPercent==="function"&&window.enhancementBonusPercent(20)!==50)fail("MAX_BONUS","+20 應為 +50%");
 if(typeof window.newState==="function"){
  const fresh=window.newState();
  if(fresh?.enhancement?.basicStones!==0||fresh?.enhancement?.advancedStones!==0)fail("NEW_STATE_STONES","新存檔強化石應為 0",fresh?.enhancement);
  (window.ENHANCEMENT_SLOTS||[]).forEach(type=>{if(fresh?.enhancement?.levels?.[type]!==0)fail("NEW_STATE_LEVEL",`${type} 新存檔強化等級應為 0`,fresh?.enhancement?.levels);});
 }
 const probe={enhancement:{basicStones:-5,advancedStones:"bad",levels:{weapon:99,helmet:-2,armor:7.9,shoes:"4",accessory:null}}};
 window.normalizeEnhancementState(probe);
 const expected={weapon:20,helmet:0,armor:7,shoes:4,accessory:0};
 if(probe.enhancement.basicStones!==0||probe.enhancement.advancedStones!==0)fail("STONE_NORMALIZE","強化石正規化失敗",probe.enhancement);
 Object.keys(expected).forEach(type=>{if(probe.enhancement.levels[type]!==expected[type])fail("LEVEL_NORMALIZE",`${type} 強化等級正規化失敗`,probe.enhancement.levels);});
 if(typeof window.getNewStateNormalizerCount==="function"&&window.getNewStateNormalizerCount()!==4)fail("NORMALIZER_COUNT",`強化系統不應增加正式 newState normalizer，實際 ${window.getNewStateNormalizerCount()}`);
 window.ENHANCEMENT_INTEGRITY_REPORT={passed:errors.length===0,errors};
 if(errors.length)console.error("[強化系統完整性檢查失敗]",errors);
})();
