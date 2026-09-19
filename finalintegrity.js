(function(){
 const VERSION=2;
 function run(){
  const errors=[],warnings=[];
  const fail=(code,message,data=null)=>errors.push({code,message,data});
  const warn=(code,message,data=null)=>warnings.push({code,message,data});

  const reports=[
   ["CALAMITY_STATE_INTEGRITY",window.CALAMITY_STATE_INTEGRITY],
   ["MARK_CORE_INTEGRITY",window.MARK_CORE_INTEGRITY],
   ["COMBAT_MARK_INTEGRITY",window.COMBAT_MARK_INTEGRITY],
   ["COMBAT_MARK_FX_INTEGRITY",window.COMBAT_MARK_FX_INTEGRITY],
   ["CALAMITY_CORE_INTEGRITY",window.CALAMITY_CORE_INTEGRITY],
   ["CALAMITY_RUN_INTEGRITY",window.CALAMITY_RUN_INTEGRITY],
   ["CALAMITY_UI_INTEGRITY",window.CALAMITY_UI_INTEGRITY],
   ["CALAMITY_GM_INTEGRITY",window.CALAMITY_GM_INTEGRITY],
   ["PROJECT_RUNTIME_REPORT",window.PROJECT_RUNTIME_REPORT],
   ["MIRROR_DUNGEON_FINAL_INTEGRITY",window.MIRROR_DUNGEON_FINAL_INTEGRITY],
   ["STORY_RUNTIME_INTEGRITY_REPORT",window.STORY_RUNTIME_INTEGRITY_REPORT]
  ];
  reports.forEach(([name,report])=>{if(report?.passed!==true)fail("FINAL_REPORT",`${name} 未通過`,report?.errors||null);});

  if(Number(window.SAVE_SCHEMA_VERSION)!==13)fail("FINAL_SCHEMA","最終 Save Schema 應為 13",window.SAVE_SCHEMA_VERSION);
  if(Number(window.STRUCTURED_COMBAT_PACING_VERSION)!==2||typeof window.getStructuredCombatPacing!=="function")fail("FINAL_STRUCTURED_COMBAT_PACING","戰鬥內動畫固定高速共用 Pacing V2 未載入",{version:window.STRUCTURED_COMBAT_PACING_VERSION,api:typeof window.getStructuredCombatPacing});
  if(Number(window.COMBAT_FX_ANIMATION_LIFECYCLE_VERSION)!==1)fail("FINAL_COMBAT_FX_ANIMATION_LIFECYCLE","Combat FX animation lifecycle owner 未載入",window.COMBAT_FX_ANIMATION_LIFECYCLE_VERSION);
  if(Number(window.OFFLINE_BATTLE_SAMPLE_VERSION)!==2||Number(window.MAIN_REAL_BATTLE_SAMPLE_VERSION)!==2)fail("FINAL_OFFLINE_BATTLE_SAMPLE_VERSION","離線實戰樣本版本隔離未載入",{offline:window.OFFLINE_BATTLE_SAMPLE_VERSION,main:window.MAIN_REAL_BATTLE_SAMPLE_VERSION});
  if(Number(window.GM_BACKGROUND_BATTLE_ALL_COMBAT_GATE_VERSION)!==1||Number(window.VOID_BACKGROUND_GM_GATE_VERSION)!==1)fail("FINAL_BACKGROUND_GM_GATE","GM 背景戰鬥統一 gate 未載入",{gm:window.GM_BACKGROUND_BATTLE_ALL_COMBAT_GATE_VERSION,void:window.VOID_BACKGROUND_GM_GATE_VERSION});
  if(Number(window.BACKGROUND_PROGRESS_CORE_VERSION)!==1||Number(window.MAIN_BATTLE_BACKGROUND_LIFECYCLE_VERSION)!==1)fail("FINAL_BACKGROUND_LIFECYCLE_OWNER","Background Core／主線正式 lifecycle owner 未載入",{core:window.BACKGROUND_PROGRESS_CORE_VERSION,main:window.MAIN_BATTLE_BACKGROUND_LIFECYCLE_VERSION});
  if(Number(window.CIVILIZATION_CALAMITY_CONFIG_VERSION)!==1||!Array.isArray(window.CIVILIZATION_CALAMITY_CONFIG)||window.CIVILIZATION_CALAMITY_CONFIG.length!==10)fail("FINAL_CALAMITY_CONFIG","文明災厄統一設定版本／數量異常",{version:window.CIVILIZATION_CALAMITY_CONFIG_VERSION,count:window.CIVILIZATION_CALAMITY_CONFIG?.length});
  if(Number(window.MARK_CORE_VERSION)!==1||Number(window.MARK_COMBAT_RULE_VERSION)!==1||Number(window.MARK_PROGRESSION_OWNER_VERSION)!==1||Number(window.MARK_DESCRIPTION_OWNER_VERSION)!==1)fail("FINAL_MARK_VERSION","Mark Core 版本／progression owner 異常",{core:window.MARK_CORE_VERSION,rules:window.MARK_COMBAT_RULE_VERSION,progression:window.MARK_PROGRESSION_OWNER_VERSION,description:window.MARK_DESCRIPTION_OWNER_VERSION});
  if(Number(window.COMBAT_MARK_INTEGRATION_VERSION)!==1||Number(window.COMBAT_MARK_FX_VERSION)!==1||Number(window.COMBAT_PRESENTATION_VERSION)!==2||Number(window.COMBAT_PRESENTATION_UNIFIED_VERSION)!==1||Number(window.COMBAT_STRUCTURED_PRESENTATION_VERSION)!==2||Number(window.COMBAT_STRUCTURED_SLEEP_INJECTION_VERSION)!==1||Number(window.MIRROR_STRUCTURED_PRESENTATION_VERSION)!==1||Number(window.CALAMITY_STRUCTURED_PRESENTATION_VERSION)!==2||Number(window.CALAMITY_BACKGROUND_PRESENTATION_VERSION)!==1)fail("FINAL_MARK_COMBAT_VERSION","印記 Combat／Unified Presentation／災厄背景動畫版本異常",{combat:window.COMBAT_MARK_INTEGRATION_VERSION,fx:window.COMBAT_MARK_FX_VERSION,presentation:window.COMBAT_PRESENTATION_VERSION,unified:window.COMBAT_PRESENTATION_UNIFIED_VERSION,structured:window.COMBAT_STRUCTURED_PRESENTATION_VERSION,sleepInjection:window.COMBAT_STRUCTURED_SLEEP_INJECTION_VERSION,mirror:window.MIRROR_STRUCTURED_PRESENTATION_VERSION,calamity:window.CALAMITY_STRUCTURED_PRESENTATION_VERSION,calamityBackground:window.CALAMITY_BACKGROUND_PRESENTATION_VERSION});
  if(Number(window.CALAMITY_BALANCE_VERSION)!==2||Number(window.CALAMITY_FIXED_HP)!==1000000||Number(window.CALAMITY_CORE_VERSION)!==1||Number(window.CALAMITY_COMBAT_RULE_VERSION)!==2||Number(window.CALAMITY_HP_RESTORE_OWNER_VERSION)!==1||Number(window.CALAMITY_RUN_VERSION)!==1||Number(window.CALAMITY_CONTINUOUS_RULE_VERSION)!==3||Number(window.CALAMITY_UI_VERSION)!==3||Number(window.CALAMITY_BATTLE_VIEW_VERSION)!==1||Number(window.CALAMITY_CONTINUOUS_GAP_MS)!==350||Number(window.GM_CALAMITY_TEST_VERSION)!==1||Number(window.GM_MARK_CONFIG_OWNER_VERSION)!==1)fail("FINAL_CALAMITY_VERSION","文明災厄版本鏈／固定 HP 異常",{balance:window.CALAMITY_BALANCE_VERSION,hp:window.CALAMITY_FIXED_HP,core:window.CALAMITY_CORE_VERSION,combatRules:window.CALAMITY_COMBAT_RULE_VERSION,restoreOwner:window.CALAMITY_HP_RESTORE_OWNER_VERSION,run:window.CALAMITY_RUN_VERSION,rules:window.CALAMITY_CONTINUOUS_RULE_VERSION,ui:window.CALAMITY_UI_VERSION,battleView:window.CALAMITY_BATTLE_VIEW_VERSION,gap:window.CALAMITY_CONTINUOUS_GAP_MS,gm:window.GM_CALAMITY_TEST_VERSION,gmConfigOwner:window.GM_MARK_CONFIG_OWNER_VERSION});
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