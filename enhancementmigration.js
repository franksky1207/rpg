(function(){
 const errors=[],fail=(code,message,data=null)=>errors.push({code,message,data});
 if(typeof window.migrateSave!=="function"||typeof window.normalizeEnhancementState!=="function")fail("MIGRATION_API","強化存檔正規化／遷移 API 未載入");
 if(typeof window.newState==="function"){
  const fresh=window.newState();
  if(fresh?.enhancement?.basicStones!==0||fresh?.enhancement?.advancedStones!==0)fail("NEW_STATE_STONES","新存檔強化石應為 0",fresh?.enhancement);
  (window.ENHANCEMENT_SLOTS||[]).forEach(type=>{if(fresh?.enhancement?.levels?.[type]!==0)fail("NEW_STATE_LEVEL",`${type} 新存檔強化等級應為 0`,fresh?.enhancement?.levels);});
 }
 if(typeof window.normalizeEnhancementState==="function"){
  const probe={enhancement:{basicStones:-5,advancedStones:"bad",levels:{weapon:99,helmet:-2,armor:7.9,shoes:"4",accessory:null}}};
  window.normalizeEnhancementState(probe);
  const max=Math.max(0,Math.floor(Number(window.ENHANCEMENT_MAX_LEVEL)||0));
  const expected={weapon:max,helmet:0,armor:7,shoes:4,accessory:0};
  if(probe.enhancement.basicStones!==0||probe.enhancement.advancedStones!==0)fail("STONE_NORMALIZE","強化石正規化失敗",probe.enhancement);
  Object.keys(expected).forEach(type=>{if(probe.enhancement.levels[type]!==expected[type])fail("LEVEL_NORMALIZE",`${type} 強化等級正規化失敗`,probe.enhancement.levels);});
 }
 if(typeof window.migrateSave==="function"){
  try{
   const legacy=typeof window.newState==="function"?window.newState():{};
   delete legacy.enhancement;
   legacy.saveVersion=12;
   const migrated=window.migrateSave(legacy,12,null,legacy);
   if(!migrated?.enhancement||migrated.enhancement.basicStones!==0||migrated.enhancement.advancedStones!==0)fail("MIGRATION_ENHANCEMENT_DEFAULT","正式 migrateSave 未補齊缺少的強化資料",migrated?.enhancement);
   (window.ENHANCEMENT_SLOTS||[]).forEach(type=>{if(migrated?.enhancement?.levels?.[type]!==0)fail("MIGRATION_ENHANCEMENT_LEVEL",`正式 migrateSave 未補齊 ${type} 強化等級`,migrated?.enhancement?.levels);});
  }catch(error){fail("MIGRATION_PROBE","正式 migrateSave 強化相容測試失敗",String(error));}
 }
 if(typeof window.getNewStateNormalizerCount==="function"&&window.getNewStateNormalizerCount()!==4)fail("NORMALIZER_COUNT",`正式 newState normalizer 應維持 4 個，實際 ${window.getNewStateNormalizerCount()}`);
 window.ENHANCEMENT_INTEGRITY_REPORT={passed:errors.length===0,errors};
 if(errors.length)console.error("[強化存檔相容檢查失敗]",errors);
})();
