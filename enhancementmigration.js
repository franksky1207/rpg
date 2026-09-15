(function(){
 if(typeof window.migrateSave!=="function"||typeof window.normalizeEnhancementState!=="function")return;
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
 try{
  const legacy=typeof window.newState==="function"?window.newState():{};
  delete legacy.enhancement;
  legacy.saveVersion=12;
  const migrated=window.migrateSave(legacy,12,null,legacy);
  if(!migrated?.enhancement||migrated.enhancement.basicStones!==0||migrated.enhancement.advancedStones!==0)fail("MIGRATION_ENHANCEMENT_DEFAULT","正式 migrateSave 未補齊缺少的強化資料",migrated?.enhancement);
  (window.ENHANCEMENT_SLOTS||[]).forEach(type=>{if(migrated?.enhancement?.levels?.[type]!==0)fail("MIGRATION_ENHANCEMENT_LEVEL",`正式 migrateSave 未補齊 ${type} 強化等級`,migrated?.enhancement?.levels);});
 }catch(error){fail("MIGRATION_PROBE","正式 migrateSave 強化相容測試失敗",String(error));}
 if(typeof window.rawEquippedStats!=="function"||typeof window.equippedStats!=="function"||typeof window.equippedStatsWithEnhancementLevels!=="function")fail("COMBAT_OWNER","engine.js 未正式提供原始／強化裝備能力 API");
 else{
  try{
   const raw=window.rawEquippedStats();
   const zero=window.equippedStatsWithEnhancementLevels(Object.fromEntries((window.ENHANCEMENT_SLOTS||[]).map(type=>[type,0])));
   ["hp","atk","def","crit","dodge"].forEach(stat=>{if(Math.abs((Number(raw?.[stat])||0)-(Number(zero?.[stat])||0))>1e-9)fail("COMBAT_ZERO_LEVEL",`+0 強化不應改變 ${stat}`,{raw,zero});});
   const maxLevels=Object.fromEntries((window.ENHANCEMENT_SLOTS||[]).map(type=>[type,20]));
   const maxed=window.equippedStatsWithEnhancementLevels(maxLevels);
   ["hp","atk","def","crit","dodge"].forEach(stat=>{if((Number(maxed?.[stat])||0)+1e-9<(Number(raw?.[stat])||0))fail("COMBAT_MAX_LEVEL",`+20 強化不應降低 ${stat}`,{raw,maxed});});
  }catch(error){fail("COMBAT_PROBE","正式強化能力計算測試失敗",String(error));}
 }
 if(typeof window.getNewStateNormalizerCount==="function"&&window.getNewStateNormalizerCount()!==4)fail("NORMALIZER_COUNT",`核心正式化後仍應維持 4 個 newState normalizer，實際 ${window.getNewStateNormalizerCount()}`);
 window.ENHANCEMENT_INTEGRITY_REPORT={passed:errors.length===0,errors};
 if(errors.length)console.error("[強化系統完整性檢查失敗]",errors);
})();
