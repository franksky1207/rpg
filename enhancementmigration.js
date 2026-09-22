(function(){
 const errors=[],fail=(code,message,data=null)=>errors.push({code,message,data});
 if(typeof window.migrateSave!=="function"||typeof window.normalizeEnhancementState!=="function")fail("MIGRATION_API","強化存檔正規化／遷移 API 未載入");
 if(typeof window.newState==="function"){
  const fresh=window.newState();
  if(fresh?.enhancement?.basicStones!==0||fresh?.enhancement?.advancedStones!==0)fail("NEW_STATE_STONES","新存檔強化石應為 0",fresh?.enhancement);
  (window.ENHANCEMENT_SLOTS||[]).forEach(type=>{if(fresh?.enhancement?.levels?.[type]!==0)fail("NEW_STATE_LEVEL",`${type} 新存檔強化等級應為 0`,fresh?.enhancement?.levels);});
 }
 if(typeof window.normalizeEnhancementState==="function"){
  const galaxy={secondWorld:{entered:false},enhancement:{basicStones:-5,advancedStones:"bad",levels:{weapon:99,helmet:-2,armor:7.9,shoes:"4",accessory:null}}};
  window.normalizeEnhancementState(galaxy);
  const expectedGalaxy={weapon:20,helmet:0,armor:7,shoes:4,accessory:0};
  if(galaxy.enhancement.basicStones!==0||galaxy.enhancement.advancedStones!==0)fail("STONE_NORMALIZE","強化石正規化失敗",galaxy.enhancement);
  Object.keys(expectedGalaxy).forEach(type=>{if(galaxy.enhancement.levels[type]!==expectedGalaxy[type])fail("LEVEL_NORMALIZE_GALAXY",type+" 銀河強化等級正規化失敗",galaxy.enhancement.levels);});
  const universe={secondWorld:{entered:true},enhancement:{basicStones:11,advancedStones:22,levels:{weapon:21,helmet:30,armor:40,shoes:99,accessory:19}}};
  window.normalizeEnhancementState(universe);
  const expectedUniverse={weapon:21,helmet:30,armor:40,shoes:40,accessory:19};
  Object.keys(expectedUniverse).forEach(type=>{if(universe.enhancement.levels[type]!==expectedUniverse[type])fail("LEVEL_NORMALIZE_UNIVERSE",type+" 宇宙強化等級正規化失敗",universe.enhancement.levels);});
 }
 if(typeof window.migrateSave==="function"){
  try{
   const legacy=typeof window.newState==="function"?window.newState():{};
   delete legacy.enhancement;
   legacy.saveVersion=12;
   const migrated=window.migrateSave(legacy,12,null,legacy);
   if(!migrated?.enhancement||migrated.enhancement.basicStones!==0||migrated.enhancement.advancedStones!==0)fail("MIGRATION_ENHANCEMENT_DEFAULT","正式 migrateSave 未補齊缺少的強化資料",migrated?.enhancement);
   (window.ENHANCEMENT_SLOTS||[]).forEach(type=>{if(migrated?.enhancement?.levels?.[type]!==0)fail("MIGRATION_ENHANCEMENT_LEVEL",`正式 migrateSave 未補齊 ${type} 強化等級`,migrated?.enhancement?.levels);});
   const universe=typeof window.newState==="function"?window.newState():{};
   universe.secondWorld=universe.secondWorld&&typeof universe.secondWorld==="object"?universe.secondWorld:{};
   universe.secondWorld.entered=true;
   universe.enhancement={basicStones:0,advancedStones:0,levels:{weapon:21,helmet:30,armor:40,shoes:40,accessory:25}};
   universe.saveVersion=Number(window.SAVE_SCHEMA_VERSION)||14;
   const universeSource=JSON.parse(JSON.stringify(universe));
   const migratedUniverse=window.migrateSave(universe,universe.saveVersion,null,universeSource);
   const expectedUniverse={weapon:21,helmet:30,armor:40,shoes:40,accessory:25};
   Object.keys(expectedUniverse).forEach(type=>{if(migratedUniverse?.enhancement?.levels?.[type]!==expectedUniverse[type])fail("MIGRATION_UNIVERSE_LEVEL","宇宙存檔 "+type+" +21～+40 不得在 migration 被壓回 +20",migratedUniverse?.enhancement?.levels);});
  }catch(error){fail("MIGRATION_PROBE","正式 migrateSave 強化相容測試失敗",String(error));}
 }
 if(typeof window.effectiveEnhancementMin!=="function"||typeof window.effectiveEnhancementCap!=="function"||typeof window.clampEffectiveEnhancementLevel!=="function"||typeof window.formalEnhancementLevelValid!=="function"||typeof window.enhancementFormalStateIssues!=="function"||typeof window.enhancementUpgradeCost!=="function")fail("WORLD_AWARE_API","世界感知強化 API 未完整載入");
 else{
  const galaxy={secondWorld:{entered:false}},universe={secondWorld:{entered:true}};
  if(window.effectiveEnhancementMin(galaxy)!==0||window.effectiveEnhancementCap(galaxy)!==20||window.effectiveEnhancementMin(universe)!==20||window.effectiveEnhancementCap(universe)!==40)fail("WORLD_AWARE_RANGE","銀河／宇宙強化正式範圍異常",{galaxyMin:window.effectiveEnhancementMin(galaxy),galaxyCap:window.effectiveEnhancementCap(galaxy),universeMin:window.effectiveEnhancementMin(universe),universeCap:window.effectiveEnhancementCap(universe)});
  const c21=window.enhancementUpgradeCost(21,universe),c30=window.enhancementUpgradeCost(30,universe),c40=window.enhancementUpgradeCost(40,universe),blocked=window.enhancementUpgradeCost(21,galaxy);
  if(!c21?.available||c21.darkMatter!==30000||c21.darkEnergy!==300)fail("COST21","宇宙 +21 成本異常",c21);
  if(!c30?.available||c30.darkMatter!==138000||c30.darkEnergy!==390)fail("COST30","宇宙 +30 成本異常",c30);
  if(!c40?.available||c40.darkMatter!==258000||c40.darkEnergy!==490)fail("COST40","宇宙 +40 成本異常",c40);
  if(blocked?.available!==false)fail("GALAXY_HIGH_LEVEL_BLOCK","+21 不得在銀河紀元可用",blocked);
  const totals=Array.from({length:20},(_,i)=>window.enhancementUpgradeCost(21+i,universe)).reduce((sum,row)=>({darkMatter:sum.darkMatter+row.darkMatter,darkEnergy:sum.darkEnergy+row.darkEnergy}),{darkMatter:0,darkEnergy:0});
  if(totals.darkMatter!==2880000||totals.darkEnergy!==7900)fail("UNIVERSE_COST_TOTAL","單欄 +20→+40 累積成本異常",totals);
  if(typeof window.enhancementBonusPercent!=="function"||window.enhancementBonusPercent(40)!==100)fail("BONUS40","+40 主能力加成應為 +100%",window.enhancementBonusPercent?.(40));
  const invalidUniverse={secondWorld:{entered:true},enhancement:{levels:{weapon:19,helmet:20,armor:21,shoes:40,accessory:20}}};
  const issues=window.enhancementFormalStateIssues(invalidUniverse);
  if(!issues.some(row=>row?.code==="LEVEL_BELOW_FORMAL_MIN"&&row?.type==="weapon"&&row?.value===19))fail("FORMAL_MIN_DETECT","宇宙紀元低於 +20 的正式異常未被偵測",issues);
  if(window.formalEnhancementLevelValid(19,universe)!==false||window.formalEnhancementLevelValid(20,universe)!==true||window.formalEnhancementLevelValid(40,universe)!==true||window.formalEnhancementLevelValid(41,universe)!==false)fail("FORMAL_RANGE_VALIDATION","宇宙正式 +20～+40 範圍判定異常");
 }
 if(typeof window.getNewStateNormalizerCount==="function"&&window.getNewStateNormalizerCount()!==4)fail("NORMALIZER_COUNT",`正式 newState normalizer 應維持 4 個，實際 ${window.getNewStateNormalizerCount()}`);
 window.ENHANCEMENT_MIGRATION_WORLD_AWARE_VERSION=2;
 window.ENHANCEMENT_INTEGRITY_REPORT={passed:errors.length===0,errors};
 if(errors.length)console.error("[強化存檔相容檢查失敗]",errors);
})();
