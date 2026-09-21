(function(){
 const VERSION=5;
 function run(){
  const errors=[],warnings=[];
  const fail=(code,message,data=null)=>errors.push({code,message,data});
  const warn=(code,message,data=null)=>warnings.push({code,message,data});

  const reports=[
   ["CALAMITY_STATE_INTEGRITY",window.CALAMITY_STATE_INTEGRITY],
   ["MARK_CORE_INTEGRITY",window.MARK_CORE_INTEGRITY],
   ["COMBAT_MARK_INTEGRITY",window.COMBAT_MARK_INTEGRITY],
   ["COMBAT_MARK_FX_INTEGRITY",window.COMBAT_MARK_FX_INTEGRITY],
   ["COMBAT_SPEED_INTEGRITY",window.COMBAT_SPEED_INTEGRITY],
   ["CALAMITY_CORE_INTEGRITY",window.CALAMITY_CORE_INTEGRITY],
   ["CALAMITY_RUN_INTEGRITY",window.CALAMITY_RUN_INTEGRITY],
   ["CALAMITY_UI_INTEGRITY",window.CALAMITY_UI_INTEGRITY],
   ["CALAMITY_GM_INTEGRITY",window.CALAMITY_GM_INTEGRITY],
   ["PLAYER_TITLE_INTEGRITY",window.PLAYER_TITLE_INTEGRITY],
   ["PROJECT_RUNTIME_REPORT",window.PROJECT_RUNTIME_REPORT],
   ["MIRROR_DUNGEON_FINAL_INTEGRITY",window.MIRROR_DUNGEON_FINAL_INTEGRITY],
   ["STORY_RUNTIME_INTEGRITY_REPORT",window.STORY_RUNTIME_INTEGRITY_REPORT],
   ["SECOND_WORLD_DATA_INTEGRITY",window.SECOND_WORLD_DATA_INTEGRITY],
   ["LEVEL_PROGRESSION_INTEGRITY",window.LEVEL_PROGRESSION_INTEGRITY],
   ["SECOND_WORLD_COMBAT_INTEGRITY",window.SECOND_WORLD_COMBAT_INTEGRITY]
  ];
  reports.forEach(([name,report])=>{if(report?.passed!==true)fail("FINAL_REPORT",`${name} 未通過`,report?.errors||null);});

  if(!Array.isArray(window.CIVILIZATION_PLAYER_TITLE_DEFS)||window.CIVILIZATION_PLAYER_TITLE_DEFS.length!==10||!Array.isArray(window.MIRROR_PLAYER_TITLE_DEFS)||window.MIRROR_PLAYER_TITLE_DEFS.length!==6||!Array.isArray(window.PLAYER_TITLE_DEFS)||window.PLAYER_TITLE_DEFS.length!==16)fail("FINAL_PLAYER_TITLE","玩家稱號公開定義數量異常",{calamity:window.CIVILIZATION_PLAYER_TITLE_DEFS?.length,mirror:window.MIRROR_PLAYER_TITLE_DEFS?.length,total:window.PLAYER_TITLE_DEFS?.length});
  if(Number(window.SAVE_WRITE_GUARD_VERSION)!==1||typeof window.markSaveLoadResolved!=="function"||typeof window.saveWriteGuardStatus!=="function")fail("FINAL_SAVE_WRITE_GUARD","本機存檔寫入保護 V1 未載入",{version:window.SAVE_WRITE_GUARD_VERSION,mark:typeof window.markSaveLoadResolved,status:typeof window.saveWriteGuardStatus});
  if(Number(window.SAVE_SCHEMA_VERSION)!==14)fail("FINAL_SCHEMA","最終 Save Schema 應為 14",window.SAVE_SCHEMA_VERSION);
  if(Number(window.LEVEL_PROGRESSION_VERSION)!==1||Number(window.FIRST_WORLD_LEVEL_CAP)!==500||Number(window.SECOND_WORLD_LEVEL_CAP)!==1000||Number(window.ABSOLUTE_MAX_LEVEL)!==1000||typeof window.effectiveLevelCap!=="function"||typeof window.levelProgressSnapshot!=="function"||typeof window.universeExpNeed!=="function")fail("FINAL_LEVEL_PROGRESSION","世界感知等級／EXP owner 未完整載入",{version:window.LEVEL_PROGRESSION_VERSION,first:window.FIRST_WORLD_LEVEL_CAP,second:window.SECOND_WORLD_LEVEL_CAP,absolute:window.ABSOLUTE_MAX_LEVEL});
  if(Number(window.SECOND_WORLD_COMBAT_VERSION)!==1||window.SECOND_WORLD_COMBAT_SETTLEMENT_READY!==false||typeof window.secondWorldBossBaseStats!=="function"||typeof window.secondWorldBossEncounter!=="function"||typeof window.runSecondWorldBossCombat!=="function")fail("FINAL_SECOND_WORLD_COMBAT","宇宙紀元 Boss 戰鬥 owner 未完整載入",{version:window.SECOND_WORLD_COMBAT_VERSION,settlementReady:window.SECOND_WORLD_COMBAT_SETTLEMENT_READY,base:typeof window.secondWorldBossBaseStats,encounter:typeof window.secondWorldBossEncounter,run:typeof window.runSecondWorldBossCombat});
  if(typeof window.gmStartSecondWorldBossTest!=="function"||typeof window.getSecondWorldBossGmOptions!=="function")fail("FINAL_SECOND_WORLD_GM_COMBAT","GM 宇宙 Boss 快速測試未完整載入",{start:typeof window.gmStartSecondWorldBossTest,options:typeof window.getSecondWorldBossGmOptions});
  if(Number(window.SECOND_WORLD_DATA_VERSION)!==1||Number(window.SECOND_WORLD_REGION_COUNT)!==10||Number(window.SECOND_WORLD_BOSS_COUNT)!==100||typeof window.canChallengeSecondWorldBoss!=="function")fail("FINAL_SECOND_WORLD_DATA","宇宙紀元主線資料 owner 未完整載入",{version:window.SECOND_WORLD_DATA_VERSION,regions:window.SECOND_WORLD_REGION_COUNT,bosses:window.SECOND_WORLD_BOSS_COUNT,challenge:typeof window.canChallengeSecondWorldBoss});
  if(Number(window.SECOND_WORLD_ADVENTURE_UI_VERSION)!==1||typeof window.secondWorldAdventurePageHtml!=="function"||typeof window.toggleSecondWorldAdventureRegion!=="function")fail("FINAL_SECOND_WORLD_ADVENTURE_UI","宇宙紀元冒險 UI owner 未完整載入",{version:window.SECOND_WORLD_ADVENTURE_UI_VERSION,page:typeof window.secondWorldAdventurePageHtml,toggle:typeof window.toggleSecondWorldAdventureRegion});
  if(Number(window.STRUCTURED_COMBAT_PACING_VERSION)!==2||Number(window.STRUCTURED_COMBAT_SPEED_AWARE_VERSION)!==1||typeof window.getStructuredCombatPacing!=="function"||typeof window.getStructuredCombatPacingForSpeed!=="function")fail("FINAL_STRUCTURED_COMBAT_PACING","speed-aware 共用 Structured Combat Pacing 未載入",{version:window.STRUCTURED_COMBAT_PACING_VERSION,speedAware:window.STRUCTURED_COMBAT_SPEED_AWARE_VERSION,api:typeof window.getStructuredCombatPacing});
  if(Number(window.COMBAT_FX_ANIMATION_LIFECYCLE_VERSION)!==1)fail("FINAL_COMBAT_FX_ANIMATION_LIFECYCLE","Combat FX animation lifecycle owner 未載入",window.COMBAT_FX_ANIMATION_LIFECYCLE_VERSION);
  if(Number(window.OFFLINE_BATTLE_SAMPLE_VERSION)!==3||Number(window.MAIN_REAL_BATTLE_SAMPLE_VERSION)!==3||Number(window.OFFLINE_COMBAT_SPEED_SAMPLE_VERSION)!==1)fail("FINAL_OFFLINE_BATTLE_SAMPLE_VERSION","speed-aware 離線實戰樣本 V3 未載入",{offline:window.OFFLINE_BATTLE_SAMPLE_VERSION,main:window.MAIN_REAL_BATTLE_SAMPLE_VERSION,speed:window.OFFLINE_COMBAT_SPEED_SAMPLE_VERSION});
  if(Number(window.OFFLINE_SAMPLE_SELECTION_VERSION)!==2||Number(window.OFFLINE_SAMPLES_PER_SPEED)!==8||typeof window.convertOfflineSampleMsForSpeed!=="function"||typeof window.resolveOfflineFarmTarget!=="function")fail("FINAL_OFFLINE_SAMPLE_SELECTION","離線樣本分速保存／跨速換算 V2 未載入",{version:window.OFFLINE_SAMPLE_SELECTION_VERSION,perSpeed:window.OFFLINE_SAMPLES_PER_SPEED,convert:typeof window.convertOfflineSampleMsForSpeed,resolve:typeof window.resolveOfflineFarmTarget});
  else if(window.convertOfflineSampleMsForSpeed({combatSpeed:1,actualMs:1400,cycleMs:1540,multiplier:1},2)!==840)fail("FINAL_OFFLINE_SPEED_CONVERSION","離線跨速換算應只縮放戰鬥本體並保留固定外層 140ms");
  if(Number(window.OFFLINE_CHECKPOINT_RECOVERY_VERSION)!==1||typeof window.recoverOfflineCheckpointTime!=="function")fail("FINAL_OFFLINE_CHECKPOINT_RECOVERY","離線 checkpoint recovery owner 未載入",{version:window.OFFLINE_CHECKPOINT_RECOVERY_VERSION,api:typeof window.recoverOfflineCheckpointTime});
  else if(window.recoverOfflineCheckpointTime(1500000,1000000,2000000)!==1000000)fail("FINAL_OFFLINE_CHECKPOINT_RECOVERY_SEMANTICS","較早 persisted checkpoint 應保留為離線起點");
  if(Number(window.GM_BACKGROUND_BATTLE_ALL_COMBAT_GATE_VERSION)!==1||Number(window.VOID_BACKGROUND_GM_GATE_VERSION)!==1)fail("FINAL_BACKGROUND_GM_GATE","GM 背景戰鬥統一 gate 未載入",{gm:window.GM_BACKGROUND_BATTLE_ALL_COMBAT_GATE_VERSION,void:window.VOID_BACKGROUND_GM_GATE_VERSION});
  if(Number(window.GM_DATA_MANAGEMENT_VERSION)!==1||typeof window.gmExportSaveJson!=="function"||typeof window.gmChooseImportSaveJson!=="function"||typeof window.gmValidateImportedSave!=="function")fail("FINAL_GM_DATA_MANAGEMENT","GM JSON 資料管理模組未完整載入",{version:window.GM_DATA_MANAGEMENT_VERSION});
  if(Number(window.GM_POWER_BENCHMARK_VERSION)!==10||Number(window.GM_POWER_BENCHMARK_BATCH_SIZE)!==25||typeof window.gmPowerBenchmarkRunCombat!=="function"||typeof window.gmPowerBenchmarkRunUniverseCombat!=="function"||typeof window.gmPowerBenchmarkSetUniverseBoss!=="function"||typeof window.gmPowerBenchmarkIsBusy!=="function"||typeof window.gmPowerBenchmarkSummaryText!=="function"||typeof window.gmPowerBenchmarkCopySummary!=="function"||typeof window.gmPowerBenchmarkReset!=="function")fail("FINAL_GM_POWER_BENCHMARK","GM 戰力基準測試 V10 未完整載入",{version:window.GM_POWER_BENCHMARK_VERSION,batch:window.GM_POWER_BENCHMARK_BATCH_SIZE,combat:typeof window.gmPowerBenchmarkRunCombat,universe:typeof window.gmPowerBenchmarkRunUniverseCombat,busy:typeof window.gmPowerBenchmarkIsBusy});
  if(Number(window.GM_HUB_EXTENSION_VERSION)!==7||Number(window.GM_HUB_REGISTRY_VERSION)!==1||typeof window.gmHubRegisteredSectionIds!=="function")fail("FINAL_GM_HUB_REGISTRY","GM Hub 統一 registry 未完整載入",{extension:window.GM_HUB_EXTENSION_VERSION,registry:window.GM_HUB_REGISTRY_VERSION,ids:typeof window.gmHubRegisteredSectionIds});
  if(Number(window.GM_GEAR_LEVEL_INPUT_VERSION)!==1||Number(window.BATCH5_CLOCK_CACHE_VERSION)!==1)fail("FINAL_GM_OPTIMIZATION","GM 裝備等級輸入／每日時鐘快取未完整載入",{gear:window.GM_GEAR_LEVEL_INPUT_VERSION,clock:window.BATCH5_CLOCK_CACHE_VERSION});
  if(Number(window.BACKGROUND_PROGRESS_CORE_VERSION)!==1||Number(window.MAIN_BATTLE_BACKGROUND_LIFECYCLE_VERSION)!==1)fail("FINAL_BACKGROUND_LIFECYCLE_OWNER","Background Core／主線正式 lifecycle owner 未載入",{core:window.BACKGROUND_PROGRESS_CORE_VERSION,main:window.MAIN_BATTLE_BACKGROUND_LIFECYCLE_VERSION});
  if(Number(window.BACKGROUND_PROGRESS_SINGLE_ACTIVE_FLOW_VERSION)!==1||Number(window.BACKGROUND_PROGRESS_UI_YIELD_VERSION)!==3||Number(window.BACKGROUND_PROGRESS_FAST_CATCH_UP_VERSION)!==1||Number(window.BACKGROUND_PROGRESS_FAST_YIELDS_PER_PAINT)!==8||typeof window.backgroundProgressActiveKind!=="function")fail("FINAL_BACKGROUND_FLOW_POLICY","Background single-active-flow／快速逐場 catch-up 未載入",{single:window.BACKGROUND_PROGRESS_SINGLE_ACTIVE_FLOW_VERSION,yield:window.BACKGROUND_PROGRESS_UI_YIELD_VERSION,fast:window.BACKGROUND_PROGRESS_FAST_CATCH_UP_VERSION,every:window.BACKGROUND_PROGRESS_FAST_YIELDS_PER_PAINT});
  if(Number(window.COMBAT_OUTER_PACING_VERSION)!==2||Number(window.COMBAT_OUTER_GAP_MS)!==140||typeof window.combatOuterGapMs!=="function"||["main","bounty","arena","mirror","void","calamity"].some(mode=>Number(window.combatOuterGapMs(mode))!==140))fail("FINAL_COMBAT_OUTER_PACING","Combat Outer Pacing 統一 140ms owner 未載入",{version:window.COMBAT_OUTER_PACING_VERSION,gap:window.COMBAT_OUTER_GAP_MS,api:typeof window.combatOuterGapMs});
  if(Number(window.MAIN_BATTLE_PACING_VERSION)!==2||Number(window.MAIN_BATTLE_FLOW_SLEEP_VERSION)!==1||Number(window.SPECIAL_ENCOUNTER_FLOW_PACING_VERSION)!==1||typeof window.mainBattleFlowSleep!=="function")fail("FINAL_FLOW_PACING_OWNER","主線／特殊遭遇明確 Flow Pacing owner 未載入",{main:window.MAIN_BATTLE_PACING_VERSION,flow:window.MAIN_BATTLE_FLOW_SLEEP_VERSION,special:window.SPECIAL_ENCOUNTER_FLOW_PACING_VERSION,api:typeof window.mainBattleFlowSleep});
  if(Number(window.CIVILIZATION_CALAMITY_CONFIG_VERSION)!==2||!Array.isArray(window.CIVILIZATION_CALAMITY_CONFIG)||window.CIVILIZATION_CALAMITY_CONFIG.length!==10)fail("FINAL_CALAMITY_CONFIG","文明災厄統一設定版本／數量異常",{version:window.CIVILIZATION_CALAMITY_CONFIG_VERSION,count:window.CIVILIZATION_CALAMITY_CONFIG?.length});
  if(Number(window.MARK_CORE_VERSION)!==1||Number(window.MARK_COMBAT_RULE_VERSION)!==1||Number(window.MARK_PROGRESSION_OWNER_VERSION)!==1||Number(window.MARK_DESCRIPTION_OWNER_VERSION)!==1)fail("FINAL_MARK_VERSION","Mark Core 版本／progression owner 異常",{core:window.MARK_CORE_VERSION,rules:window.MARK_COMBAT_RULE_VERSION,progression:window.MARK_PROGRESSION_OWNER_VERSION,description:window.MARK_DESCRIPTION_OWNER_VERSION});
  if(Number(window.COMBAT_MARK_INTEGRATION_VERSION)!==1||Number(window.COMBAT_MARK_FX_VERSION)!==1||Number(window.COMBAT_PRESENTATION_VERSION)!==2||Number(window.COMBAT_PRESENTATION_UNIFIED_VERSION)!==1||Number(window.COMBAT_STRUCTURED_PRESENTATION_VERSION)!==2||Number(window.COMBAT_STRUCTURED_SLEEP_INJECTION_VERSION)!==1||Number(window.MIRROR_STRUCTURED_PRESENTATION_VERSION)!==1||Number(window.CALAMITY_STRUCTURED_PRESENTATION_VERSION)!==2||Number(window.CALAMITY_BACKGROUND_PRESENTATION_VERSION)!==1)fail("FINAL_MARK_COMBAT_VERSION","印記 Combat／Unified Presentation／災厄背景動畫版本異常",{combat:window.COMBAT_MARK_INTEGRATION_VERSION,fx:window.COMBAT_MARK_FX_VERSION,presentation:window.COMBAT_PRESENTATION_VERSION,unified:window.COMBAT_PRESENTATION_UNIFIED_VERSION,structured:window.COMBAT_STRUCTURED_PRESENTATION_VERSION,sleepInjection:window.COMBAT_STRUCTURED_SLEEP_INJECTION_VERSION,mirror:window.MIRROR_STRUCTURED_PRESENTATION_VERSION,calamity:window.CALAMITY_STRUCTURED_PRESENTATION_VERSION,calamityBackground:window.CALAMITY_BACKGROUND_PRESENTATION_VERSION});
  if(Number(window.CALAMITY_BALANCE_VERSION)!==3||Number(window.CALAMITY_HP_PER_LEVEL)!==500000||typeof window.getCivilizationCalamityConfiguredMaxHp!=="function"||Number(window.getCivilizationCalamityConfiguredMaxHp(window.CIVILIZATION_CALAMITY_IDS?.[0]))!==500000||Number(window.getCivilizationCalamityConfiguredMaxHp(window.CIVILIZATION_CALAMITY_IDS?.[9]))!==5000000||Number(window.CALAMITY_CORE_VERSION)!==1||Number(window.CALAMITY_COMBAT_RULE_VERSION)!==2||Number(window.CALAMITY_HP_RESTORE_OWNER_VERSION)!==1||Number(window.CALAMITY_RUN_VERSION)!==1||Number(window.CALAMITY_CONTINUOUS_RULE_VERSION)!==4||Number(window.CALAMITY_UI_VERSION)!==3||Number(window.CALAMITY_BATTLE_VIEW_VERSION)!==1||Number(window.CALAMITY_OUTER_PACING_VERSION)!==1||Number(window.GM_CALAMITY_TEST_VERSION)!==1||Number(window.GM_MARK_CONFIG_OWNER_VERSION)!==1)fail("FINAL_CALAMITY_VERSION","文明災厄版本鏈／分級 HP 曲線異常",{balance:window.CALAMITY_BALANCE_VERSION,hpPerLevel:window.CALAMITY_HP_PER_LEVEL,core:window.CALAMITY_CORE_VERSION,combatRules:window.CALAMITY_COMBAT_RULE_VERSION,restoreOwner:window.CALAMITY_HP_RESTORE_OWNER_VERSION,run:window.CALAMITY_RUN_VERSION,rules:window.CALAMITY_CONTINUOUS_RULE_VERSION,ui:window.CALAMITY_UI_VERSION,battleView:window.CALAMITY_BATTLE_VIEW_VERSION,outer:window.CALAMITY_OUTER_PACING_VERSION,gm:window.GM_CALAMITY_TEST_VERSION,gmConfigOwner:window.GM_MARK_CONFIG_OWNER_VERSION});
  if(Number(window.SPECIAL_ENEMY_SHARED_HELPERS_VERSION)!==1||typeof window.specialRateFromPlayer!=="function"||typeof window.rollUniqueMonsterTraits!=="function")fail("FINAL_SPECIAL_ENEMY_HELPERS","Special Enemy shared helpers 異常",window.SPECIAL_ENEMY_SHARED_HELPERS_VERSION);
  if(Number(window.BOUNTY_BALANCE_VERSION)!==1||Number(window.BOUNTY_DIFFICULTY_FORMULA_VERSION)!==1||Number(window.BOUNTY_TIER_META_VERSION)!==1||typeof window.getBountyDifficultyProfile!=="function"||typeof window.getBountyTierMeta!=="function")fail("FINAL_BOUNTY_BALANCE","Bounty Balance V1／Difficulty Formula V1／Tier Meta V1 異常",{balance:window.BOUNTY_BALANCE_VERSION,formula:window.BOUNTY_DIFFICULTY_FORMULA_VERSION,meta:window.BOUNTY_TIER_META_VERSION});
  const arenaVersions=typeof window.getArenaVersionProfile==="function"?window.getArenaVersionProfile():null;
  if(!arenaVersions)fail("FINAL_ARENA_VERSION_PROFILE","Arena 統一版本 profile 未載入");
  else{
   if(Number(window.ARENA_ASSESSMENT_RUNTIME_VERSION)!==Number(arenaVersions.assessmentRuntimeVersion)||Number(window.ARENA_ASSESSMENT_STATE_VERSION)!==Number(arenaVersions.assessmentStateVersion))fail("FINAL_ARENA_ASSESSMENT","Arena Assessment 與統一版本 profile 不一致",{runtime:window.ARENA_ASSESSMENT_RUNTIME_VERSION,state:window.ARENA_ASSESSMENT_STATE_VERSION,profile:arenaVersions});
   if(Number(window.ARENA_BALANCE_VERSION)!==Number(arenaVersions.balanceVersion)||Number(window.ARENA_RANK_BALANCE_VERSION)!==Number(arenaVersions.rankBalanceVersion))fail("FINAL_ARENA_BALANCE","Arena Balance 與統一版本 profile 不一致",{balance:window.ARENA_BALANCE_VERSION,rankBalance:window.ARENA_RANK_BALANCE_VERSION,profile:arenaVersions});
  }
  if(Number(window.ARENA_POSITION_API_VERSION)!==1||Number(window.ARENA_ENEMY_PROFILE_VERSION)!==1||Number(window.ARENA_PRESENTATION_PACING_SOURCE_VERSION)!==1||typeof window.getArenaPositionConfigs!=="function"||typeof window.getArenaEnemyProfile!=="function")fail("FINAL_ARENA_POSITION_PROFILE","Arena Position／Enemy Profile／Pacing Source 正式 owner 異常",{positionApi:window.ARENA_POSITION_API_VERSION,profile:window.ARENA_ENEMY_PROFILE_VERSION,pacing:window.ARENA_PRESENTATION_PACING_SOURCE_VERSION});
  if(!window.ARENA_RANK_CURVE)fail("FINAL_ARENA_RANK_CURVE","Arena Rank 正式公式設定未載入");
  if(typeof window.getArenaDifficultyConfigs==="function"||typeof window.getArenaPositionDifficultyId==="function")fail("FINAL_ARENA_LEGACY_DIFFICULTY_API","Arena 舊 difficulty API 不應恢復");
  if(typeof window.getBountyTierConfig==="function"||typeof window.getBountyTierConfigs==="function")fail("FINAL_BOUNTY_LEGACY_TIER_API","Bounty 舊 tier config API 不應恢復");
  if(Number(window.MIRROR_DUNGEON_FINAL_INTEGRITY_VERSION)!==5)fail("FINAL_MIRROR_VERSION","Mirror Final Integrity 應為 V5",window.MIRROR_DUNGEON_FINAL_INTEGRITY_VERSION);
  if(Number(window.GAME_GUIDE_VERSION)!==14)fail("FINAL_GUIDE_VERSION","遊戲說明應為 V14",window.GAME_GUIDE_VERSION);
  if(Number(window.STORY_RUNTIME_INTEGRITY_VERSION)!==9)fail("FINAL_STORY_RUNTIME_VERSION","Story Runtime Integrity 應為 V9",window.STORY_RUNTIME_INTEGRITY_VERSION);

  try{
   const guideText=Array.isArray(window.GAME_GUIDE_CATEGORIES)?window.GAME_GUIDE_CATEGORIES.flatMap(c=>c.items||[]).flat().join(" "):"";
   ["擊敗各區域最終 Boss 後解鎖對應災厄","災厄 HP 會跨挑戰保留","印記最高 Lv.10","文明災厄不提供 EXP、金幣、裝備或其他一般獎勵"].forEach(text=>{if(!guideText.includes(text))fail("FINAL_CALAMITY_GUIDE",`遊戲說明缺少文明災厄規則：${text}`);});
  }catch(error){fail("FINAL_GUIDE_PROBE","遊戲說明最終檢查失敗",String(error?.message||error));}

  try{
   const main=document.getElementById("main");
   if(!main)fail("FINAL_BACKGROUND_MAIN","找不到 #main，無法檢查戰線紀錄背景");
   else{
    const probe=document.createElement("div");
    probe.className="function-page story-record-page";
    probe.style.position="absolute";
    probe.style.visibility="hidden";
    probe.style.pointerEvents="none";
    probe.innerHTML="<div class=\"card\">背景檢查</div>";
    main.appendChild(probe);
    const image=getComputedStyle(probe).backgroundImage||"";
    probe.remove();
    if(!image.includes("guide-settings"))fail("FINAL_STORY_RECORD_BACKGROUND","戰線紀錄未實際解析到 guide-settings 背景",image);
   }
  }catch(error){fail("FINAL_BACKGROUND_PROBE","戰線紀錄背景 DOM probe 失敗",String(error?.message||error));}

  try{
   const probe=document.createElement("div");
   probe.className="combat-message";
   probe.textContent="戰鬥訊息檢查";
   document.body.appendChild(probe);
   const display=getComputedStyle(probe).display||"";
   probe.remove();
   if(display!=="none")fail("FINAL_COMBAT_MESSAGE_VISIBLE","正式戰鬥文字訊息列應從玩家畫面移除",display);
  }catch(error){fail("FINAL_COMBAT_MESSAGE_PROBE","戰鬥訊息隱藏 DOM probe 失敗",String(error?.message||error));}

  if(window.PROJECT_RUNTIME_REPORT?.warnings?.length)warn("FINAL_RUNTIME_WARNINGS","主 runtime 仍有 warning",window.PROJECT_RUNTIME_REPORT.warnings);
  if(window.STORY_RUNTIME_INTEGRITY_REPORT?.warnings?.length)warn("FINAL_STORY_WARNINGS","故事 runtime 仍有 warning",window.STORY_RUNTIME_INTEGRITY_REPORT.warnings);
  if(window.MIRROR_DUNGEON_FINAL_INTEGRITY?.warnings?.length)warn("FINAL_MIRROR_WARNINGS","鏡像 final integrity 仍有 warning",window.MIRROR_DUNGEON_FINAL_INTEGRITY.warnings);

  const report={version:VERSION,passed:errors.length===0,clean:errors.length===0&&warnings.length===0,errors,warnings,checkedAt:Date.now()};
  window.CIVILIZATION_FINAL_INTEGRITY_REPORT=report;
  if(errors.length)console.error("[文明戰線] Final integrity error",errors);
  else if(warnings.length)console.warn("[文明戰線] Final integrity warning",warnings);
  else console.info("[文明戰線] Final integrity passed");
  return report;
 }
 window.CIVILIZATION_FINAL_INTEGRITY_VERSION=VERSION;
 window.runCivilizationFinalIntegrity=run;
 setTimeout(run,0);
})();