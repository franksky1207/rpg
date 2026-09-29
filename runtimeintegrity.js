(function(){
 const VERSION=20;
 const errors=[],warnings=[];
 const fail=(code,message,data=null)=>errors.push({code,message,data});
 const warn=(code,message,data=null)=>warnings.push({code,message,data});
 const reports=[
  ["CALAMITY_STATE_INTEGRITY",window.CALAMITY_STATE_INTEGRITY],["MARK_CORE_INTEGRITY",window.MARK_CORE_INTEGRITY],["COMBAT_MARK_INTEGRITY",window.COMBAT_MARK_INTEGRITY],["COMBAT_MARK_FX_INTEGRITY",window.COMBAT_MARK_FX_INTEGRITY],
  ["COMBAT_SPEED_INTEGRITY",window.COMBAT_SPEED_INTEGRITY],["CALAMITY_CORE_INTEGRITY",window.CALAMITY_CORE_INTEGRITY],["CALAMITY_RUN_INTEGRITY",window.CALAMITY_RUN_INTEGRITY],["CALAMITY_UI_INTEGRITY",window.CALAMITY_UI_INTEGRITY],
  ["CALAMITY_GM_INTEGRITY",window.CALAMITY_GM_INTEGRITY],["PLAYER_TITLE_INTEGRITY",window.PLAYER_TITLE_INTEGRITY],["GM_PLAYER_TITLE_PREVIEW_INTEGRITY_REPORT",window.GM_PLAYER_TITLE_PREVIEW_INTEGRITY_REPORT],
  ["PLAYER_TITLE_UNIVERSE_VISUAL_INTEGRITY_REPORT",window.PLAYER_TITLE_UNIVERSE_VISUAL_INTEGRITY_REPORT],["CIVILIZATION_LEVEL_INTEGRITY_REPORT",window.CIVILIZATION_LEVEL_INTEGRITY_REPORT],
  ["SECOND_WORLD_DATA_INTEGRITY",window.SECOND_WORLD_DATA_INTEGRITY],["THIRD_WORLD_DATA_INTEGRITY",window.THIRD_WORLD_DATA_INTEGRITY],["LEVEL_PROGRESSION_INTEGRITY",window.LEVEL_PROGRESSION_INTEGRITY],
  ["SECOND_WORLD_COMBAT_INTEGRITY",window.SECOND_WORLD_COMBAT_INTEGRITY],["SECOND_WORLD_REWARD_INTEGRITY",window.SECOND_WORLD_REWARD_INTEGRITY],["SECOND_WORLD_MAINLINE_INTEGRITY",window.SECOND_WORLD_MAINLINE_INTEGRITY],
  ["SECOND_WORLD_CALAMITY_UI_INTEGRITY",window.SECOND_WORLD_CALAMITY_UI_INTEGRITY],["SECOND_WORLD_CALAMITY_FULL_INTEGRITY_REPORT",window.SECOND_WORLD_CALAMITY_FULL_INTEGRITY_REPORT],
  ["ENHANCEMENT_FINAL_INTEGRITY",window.ENHANCEMENT_FINAL_INTEGRITY],["ENHANCEMENT_WORLD3_INTEGRITY",window.ENHANCEMENT_WORLD3_INTEGRITY],["BOSS_CONTINUOUS_INTEGRITY",window.BOSS_CONTINUOUS_INTEGRITY],
  ["BOUNTY_NAME_POOL_INTEGRITY",window.BOUNTY_NAME_POOL_INTEGRITY],["GM_BATCH16_INTEGRITY",window.GM_BATCH16_INTEGRITY],["OFFLINE_SAMPLE_OWNER_INTEGRITY",window.OFFLINE_SAMPLE_OWNER_INTEGRITY]
 ];
 reports.forEach(([name,report])=>{if(report?.passed!==true)fail("SUBSYSTEM_REPORT",`${name} 未通過或未載入`,report?.errors||null);if(Array.isArray(report?.warnings)&&report.warnings.length)warn("SUBSYSTEM_WARNING",`${name} 有 warning`,report.warnings);});
 if(Number(window.CIVILIZATION_INTEGRITY_CONTRACT_VERSION)!==3||typeof window.runCivilizationIntegrityContract!=="function")fail("INTEGRITY_CONTRACT_MISSING","Canonical Integrity Contract V3 未載入",{version:window.CIVILIZATION_INTEGRITY_CONTRACT_VERSION,api:typeof window.runCivilizationIntegrityContract});
 else{const contract=window.runCivilizationIntegrityContract({phase:"runtime"});if(contract?.passed!==true)fail("INTEGRITY_CONTRACT","Canonical Integrity Contract 未通過",contract?.errors||null);}
 const expectedMaps=Array.isArray(WORLD_REGIONS)?WORLD_REGIONS.reduce((max,r)=>Math.max(max,(Number(r?.mapEnd)||-1)+1,0),0):0;
 if(!Array.isArray(MAPS)||MAPS.length!==expectedMaps)fail("WORLD_MAP_COUNT",`MAPS 應為 ${expectedMaps} 張，實際 ${Array.isArray(MAPS)?MAPS.length:"非陣列"}`);
 if(window.WORLD_MAP_REGISTRATION_REPORT?.passed!==true)fail("WORLD_MAP_REGISTRY","世界地圖固定註冊檢查未通過",window.WORLD_MAP_REGISTRATION_REPORT?.errors||null);
 if(window.WORLD_NAMING_REPORT?.errors?.length)fail("WORLD_NAMING","世界資料硬錯誤",window.WORLD_NAMING_REPORT.errors);
 const required=["normalizeSaveState","migrateSave","load","markSaveLoadResolved","saveWriteGuardStatus","saveCompatibilityFor","assertSaveVersionSupported","normalizeOfflineSaveState","finalizeDungeonLoadedState","ensureDungeonState","normalizePlayerTitleState","getPlayerTitleDefinition","playerTitleHtml","playerIdentityNameHtml","equipPlayerTitle","getArenaProgressForWorld","getCurrentArenaProgress","getArenaVersionProfile","getArenaEnemyProfile","civilizationCombatDamageMultiplier","secondWorldBossBaseStats","runSecondWorldBossCombat","secondWorldAdventurePageHtml","backgroundProgressSleep","resolveOfflineFarmTarget","gmDataManagementHtml","gmFormalMarkMinimum","gameGuideCategoriesForState","getSpecialMonsterById"];
 required.forEach(name=>{if(typeof window[name]!=="function")fail("MISSING_FUNCTION",`必要函式 ${name} 未載入`);});
 const retiredApis=["gmMapMonsterTestHtml","getMapMonsterGmTestHtml","gmStartMapMonsterTest","getSecondWorldBossGmSelection","getSecondWorldBossGmRegionOptions","getSecondWorldBossGmOptions","gmStartSecondWorldBossTest","gmArenaTestHtml","getArenaGmTestHtml","gmSimulateArena","refreshArenaGm5","canStartDungeonRun","beginDungeonRun","getActiveDungeonRun","finishDungeonRun","getVoidMirageNextFloor","voidMirageFirstClearPoints","newShopState","currentShopMap","makeShopItems","ensureShop","shopRefreshCost","paidShopRefresh","freeShopRefresh","shopPurchase","canResetShopPrice","resetShopPrice","specialApplyShopDiscount","consumeCombatPresentationPulse","consumeCombatPresentationPulseManual","normalizeCivilizationMarkProgressForCore","advanceCivilizationCalamityMarkEntry","settleCivilizationCalamityMarkKill","markAcquired","markProgress","MARK_DEFS","CALAMITY_DEFS","getArenaDifficultyConfigs","getArenaPositionDifficultyId","getBountyTierConfig","getBountyTierConfigs"];
 retiredApis.forEach(name=>{if(typeof window[name]!=="undefined")fail("LEGACY_API",`已退休 API ${name} 不應再存在`);});
 if(Number(window.SAVE_WRITE_GUARD_VERSION)!==1)fail("SAVE_WRITE_GUARD","本機存檔寫入保護 V1 未載入",window.SAVE_WRITE_GUARD_VERSION);
 if(Number(window.SAVE_FUTURE_VERSION_GUARD_VERSION)!==1)fail("SAVE_FUTURE_VERSION_GUARD","未來版本存檔保護 V1 未載入",window.SAVE_FUTURE_VERSION_GUARD_VERSION);
 if(Number(window.SAVE_LEGACY_SUPPORT_POLICY_VERSION)!==1||Number(window.SAVE_MIN_SUPPORTED_VERSION)!==1||String(window.SAVE_LEGACY_SUPPORT_MODE||"")!=="all-known")fail("SAVE_LEGACY_POLICY","舊存檔支援政策異常",{version:window.SAVE_LEGACY_SUPPORT_POLICY_VERSION,min:window.SAVE_MIN_SUPPORTED_VERSION,mode:window.SAVE_LEGACY_SUPPORT_MODE});
 if(Number(window.OFFLINE_STATE_NORMALIZATION_VERSION)<4)fail("OFFLINE_STATE_OWNER","Offline state normalization 至少應為 V4",window.OFFLINE_STATE_NORMALIZATION_VERSION);
 try{
  const current=Number(window.SAVE_SCHEMA_VERSION)||0,legacy=window.saveCompatibilityFor?.({saveVersion:window.SAVE_MIN_SUPPORTED_VERSION}),supported=window.saveCompatibilityFor?.({saveVersion:current}),future=window.saveCompatibilityFor?.({saveVersion:current+1});let threw=false;
  try{window.assertSaveVersionSupported?.({saveVersion:current+1},{label:"Runtime 測試存檔"});}catch(error){threw=error?.code==="FUTURE_SAVE_VERSION";}
  if(legacy?.supported!==true||legacy?.isLegacy!==true||supported?.supported!==true||future?.isFuture!==true||future?.supported!==false||!threw)fail("SAVE_COMPATIBILITY_POLICY_PROBE","存檔相容政策 probe 異常",{legacy,supported,future,threw});
 }catch(error){fail("SAVE_COMPATIBILITY_POLICY_PROBE","存檔相容政策 probe 執行失敗",String(error?.message||error));}
 try{
  const expectedSample=Math.max(1,Math.floor(Number(window.OFFLINE_BATTLE_SAMPLE_VERSION)||0)),probe={saveVersion:Number(window.SAVE_SCHEMA_VERSION)||1,offline:{battleSampleVersion:0,battleSamples:[{sampleVersion:999}],farmMap:999,farmEnemy:9,avgBattleMs:-1,sampleCount:999,lastSettledAt:-1,maxObservedWallClock:-1,timeLockUntil:-1}};
  const first=window.normalizeOfflineSaveState?.(probe,{sourceVersion:probe.saveVersion,currentTime:123456789}),snapshot=JSON.stringify(probe.offline),second=window.normalizeOfflineSaveState?.(probe,{sourceVersion:probe.saveVersion,currentTime:123456789});
  if(!first||!second||Number(probe.offline.battleSampleVersion)!==expectedSample||probe.offline.battleSamples.length!==0||probe.offline.farmMap!==null||probe.offline.farmEnemy!==null||JSON.stringify(probe.offline)!==snapshot)fail("OFFLINE_STATE_OWNER_PROBE","Offline normalization owner probe 異常",probe.offline);
 }catch(error){fail("OFFLINE_STATE_OWNER_PROBE","Offline normalization owner probe 執行失敗",String(error?.message||error));}
 try{
  const galaxy={secondWorld:{entered:false},thirdWorld:{entered:false}},universe={secondWorld:{entered:true},thirdWorld:{entered:false}},higher={secondWorld:{entered:true},thirdWorld:{entered:true}};
  const mins=[window.gmFormalMarkMinimum?.(galaxy),window.gmFormalMarkMinimum?.(universe),window.gmFormalMarkMinimum?.(higher)];
  if(mins[0]!==0||mins[1]!==10||mins[2]!==10)fail("GM_MARK_PHASE_LOCK_PROBE","正式印記紀元最低等級應為銀河 0／宇宙 10／高維 10",mins);
 }catch(error){fail("GM_MARK_PHASE_LOCK_PROBE","正式印記紀元鎖定 probe 執行失敗",String(error?.message||error));}
 try{
  if(Number(window.GAME_GUIDE_SPECIAL_WORLD_VERSION)!==2||Number(window.GAME_GUIDE_SPECIAL_PROFILE_TITLE_VERSION)!==1)fail("GUIDE_SPECIAL_PROFILE_VERSION","特殊怪說明名稱 owner 版本異常",{world:window.GAME_GUIDE_SPECIAL_WORLD_VERSION,title:window.GAME_GUIDE_SPECIAL_PROFILE_TITLE_VERSION});
  const ids=Array.from(window.GAME_GUIDE_SPECIAL_IDS||[]),targets=[{name:"galaxy",world:1,state:{secondWorld:{entered:false},thirdWorld:{entered:false}}},{name:"universe",world:2,state:{secondWorld:{entered:true},thirdWorld:{entered:false}}}];
  if(ids.length!==9)fail("GUIDE_SPECIAL_IDS","特殊怪說明應綁定 9 個正式特殊怪 ID",ids);
  targets.forEach(probe=>{const special=window.gameGuideCategoriesForState?.(probe.state)?.find(row=>row?.id==="special")?.items||[];ids.forEach((id,index)=>{const expected=window.getSpecialMonsterById?.(id,probe.world)?.name,actual=special[index+1]?.[0];if(!expected||actual!==expected)fail("GUIDE_SPECIAL_NAME_PROFILE",`${probe.name} 特殊怪說明名稱未跟正式 profile`,{id,index,expected,actual});});});
 }catch(error){fail("GUIDE_SPECIAL_PROFILE_PROBE","特殊怪說明名稱 profile probe 執行失敗",String(error?.message||error));}
 if(state&&Number(state.saveVersion)!==Number(window.SAVE_SCHEMA_VERSION))fail("STATE_SCHEMA",`state.saveVersion ${state.saveVersion} 與正式 schema ${window.SAVE_SCHEMA_VERSION} 不一致`);
 if(state&&Object.prototype.hasOwnProperty.call(state,"shop"))fail("LEGACY_SHOP_STATE","正式 state 不應再含退休的 shop 欄位");
 if(state?.dungeon)["progress","attempts","activeRun","points"].forEach(key=>{if(Object.prototype.hasOwnProperty.call(state.dungeon,key))fail("LEGACY_DUNGEON_STATE",`state.dungeon 不應再含舊欄位 ${key}`);});
 try{if(typeof newState==="function"){const fresh=newState();if(Number(fresh?.saveVersion)!==Number(window.SAVE_SCHEMA_VERSION))fail("NEW_STATE_SCHEMA","newState schema 異常",fresh?.saveVersion);if(Object.prototype.hasOwnProperty.call(fresh||{},"shop"))fail("NEW_STATE_SHOP","newState 不應含退休 shop");if(!fresh?.dungeon?.arenaByWorld?.[1]||!fresh?.dungeon?.arenaByWorld?.[2])fail("NEW_STATE_ARENA_BY_WORLD","newState 應建立兩個紀元的 arenaByWorld",fresh?.dungeon?.arenaByWorld||null);if(!Array.isArray(fresh?.titles?.unlocked)||fresh.titles.unlocked.length!==0)fail("NEW_STATE_TITLES","newState 稱號狀態異常",fresh?.titles||null);}}catch(error){fail("NEW_STATE_PROBE","newState probe 失敗",String(error?.message||error));}
 try{const profile=window.getArenaVersionProfile?.();if(!profile||Number(profile.balanceVersion)!==7||Number(profile.rankBalanceVersion)!==4||Number(profile.assessmentRuleVersion)!==4)fail("ARENA_PROFILE","Arena canonical profile 異常",profile||null);const universeCurve=window.getArenaRankCurveForWorld?.(2);if(!universeCurve||Number(window.SECOND_WORLD_ARENA_RANK_CURVE_VERSION)!==2)fail("ARENA_UNIVERSE_CURVE","第二世界 Arena 曲線 owner 應為 V2",{version:window.SECOND_WORLD_ARENA_RANK_CURVE_VERSION,curve:universeCurve||null});}catch(error){fail("ARENA_PROBE","Arena profile probe 失敗",String(error?.message||error));}
 const report={version:VERSION,contractVersion:Number(window.CIVILIZATION_INTEGRITY_CONTRACT_VERSION)||0,passed:errors.length===0,clean:errors.length===0&&warnings.length===0,errors,warnings,checkedAt:Date.now()};
 window.PROJECT_RUNTIME_INTEGRITY_VERSION=VERSION;window.PROJECT_RUNTIME_REPORT=report;
 if(errors.length)console.error("[文明戰線] Runtime integrity error",errors);else if(warnings.length)console.warn("[文明戰線] Runtime integrity warning",warnings);else console.info("[文明戰線] Runtime integrity passed");
})();
