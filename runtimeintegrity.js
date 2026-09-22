(function(){
 const errors=[],warnings=[];
 const fail=(code,message,data=null)=>errors.push({code,message,data});
 const warn=(code,message,data=null)=>warnings.push({code,message,data});
 const expectedMaps=Array.isArray(WORLD_REGIONS)?WORLD_REGIONS.reduce((max,r)=>Math.max(max,(Number(r?.mapEnd)||-1)+1),0):0;

 if(!Array.isArray(MAPS)||MAPS.length!==expectedMaps)fail("WORLD_MAP_COUNT",`MAPS 應為 ${expectedMaps} 張，實際 ${Array.isArray(MAPS)?MAPS.length:"非陣列"}`);
 if(window.WORLD_MAP_REGISTRATION_REPORT?.passed!==true)fail("WORLD_MAP_REGISTRY","世界地圖固定註冊檢查未通過",window.WORLD_MAP_REGISTRATION_REPORT?.errors||null);
 if(window.WORLD_NAMING_REPORT?.errors?.length)fail("WORLD_NAMING","世界資料硬錯誤",window.WORLD_NAMING_REPORT.errors);

 const required=[
  "normalizeSaveState","migrateSave","load","markSaveLoadResolved","saveWriteGuardStatus","finalizeDungeonLoadedState","ensureDungeonState","dungeonFightCore","cleanupLegacyDungeonFields","cleanupRetiredShopState","normalizePersistentFlags",
  "registerNewStateNormalizer","getNewStateNormalizerCount","redeemLostGear","normalizeCivilizationCalamityState","ensureCivilizationCalamityState","createBlankCalamityState","createBlankMarkState","markActivationChance","markRequiredKillsForNextLevel","markCumulativeKillsForLevel","markProgressSnapshot","advanceMarkProgressEntry","settleFormalMarkKill","markLevel","markEffectSnapshot","markEffectDescription","markLevelsSnapshot","markFormalSnapshot","markEffectsSnapshot","gmSetTestMarkLevel","gmUseCurrentMarkTestStatus","combatMarkFxDescriptor","syncCombatPresentationHp","getCombatPresentationEnemyHp","getCombatPresentationPlayerHp","getCombatPresentationPlayerShield","getCombatPresentationPlayerShieldMax","prepareCombatPresentation","clearCombatPresentation","isCombatPresentationActive","getCombatPresentationSnapshot","animateStructuredCombatPresentation","prepareMirrorCombatPresentation","animateMirrorStructuredCombatPresentation","getCivilizationCalamityDefinitions","getCivilizationCalamityDefinition","isCivilizationCalamityUnlocked","getCivilizationCalamityBaseBoss","buildCivilizationCalamityEnemy","getCivilizationCalamityMaxHp","getCivilizationCalamityCurrentHp","getCivilizationCalamityStatus","applyCivilizationCalamityBattleResult","runCivilizationCalamityBattle","beginCivilizationCalamityRun","runCivilizationCalamitySingle","fightNextCivilizationCalamityBattle","runCivilizationCalamityContinuous","requestCivilizationCalamityContinuousStop","getCivilizationCalamityRunSnapshot","stopCivilizationCalamityRunForPageHide","civilizationCalamityBackgroundEnabled","civilizationCalamityPageHtml","prepareCivilizationCalamityEntry","startCivilizationCalamityUI","stopCivilizationCalamityContinuousUI","returnToCivilizationCalamityList","leaveCivilizationCalamityUI","openCivilizationCalamityMinimalMode","getVisibleCivilizationCalamityIds","getCivilizationCalamityForStory","showCivilizationCalamityUnlockNoticeForStory","closeCivilizationCalamityUnlockNotice","gmTestMarkLabel","refreshGmMarkTestControls","gmSetTestMarkLevelUi","gmMarkManagementHtml","gmApplyFormalMarks","gmMarkTestHtml","gmCalamityTestHtml","gmCalamitySingle","gmCalamityFullKill","runGmCalamitySingleSimulation","runGmCalamityFullKillSimulation","normalizePlayerTitleState","getPlayerTitleDefinition","getPlayerTitleDefinitionForCalamity","getPlayerTitleDefinitionForMirrorWins","grantPlayerTitleForCalamityFirstKill","grantPlayerTitlesForMirrorWins","getPendingPlayerTitleNotice","clearPendingPlayerTitleNotice","getUnlockedPlayerTitleDefinitions","getEquippedPlayerTitleDefinition","playerTitleHtml","playerIdentityNameHtml","equipPlayerTitle","openPlayerTitlePicker","closePlayerTitlePicker","selectPlayerTitle","showPendingPlayerTitleNotice","closePlayerTitleNotice","queuePendingPlayerTitleNotice","gmPlayerTitlePreviewHtml","gmSetPlayerTitlePreviewTier",
  "normalizeDailyState","ensureDailyState","gameDailyDateKey","dailyDungeonStatus","dailyDungeonRemaining","consumeDailyDungeonUse",
  "voidMirageDailyStatus","recordVoidMirageDailyFloor","claimVoidMirageDailyReward",
  "vipDungeonPointMultiplier","adjustVipDungeonPoints",
  "enterBountyDungeon","renderBountyDungeon",
  "getArenaProgressState","getArenaAssessmentStatus","getArenaAssessmentCompatibilityVersions","getArenaAssessmentSignature","getArenaBaseTotalPoints",
  "ensureVoidMirageState","getVoidMirageStartFloor","voidMirageStartFloorFromHistory","beginVoidMirageRun","fightNextVoidMirageFloor","renderVoidMirageDungeon",
  "gmSetVoidMirageState","gmDungeonManagementHtml","gmApplyDungeonValues","gmResetDailyDungeonState","gmPreviewVoidMirageFloor","gmSimulateVoidMirageClimb","gmSimulateArena100",
  "registerRegionMaps","specialRewardExpAmount","specialRewardGoldAmount"
 ];
 required.forEach(name=>{if(typeof window[name]!=="function")fail("MISSING_FUNCTION",`必要函式 ${name} 未載入`);});

 const retiredDungeonRunApis=["canStartDungeonRun","beginDungeonRun","getActiveDungeonRun","finishDungeonRun"];
 retiredDungeonRunApis.forEach(name=>{if(typeof window[name]!=="undefined")fail("LEGACY_DUNGEON_RUN_API",`舊共享副本流程 ${name} 不應再存在`);});
 const retiredVoidApis=["getVoidMirageNextFloor","voidMirageFirstClearPoints"];
 retiredVoidApis.forEach(name=>{if(typeof window[name]!=="undefined")fail("LEGACY_VOID_API",`舊虛空相容函式 ${name} 不應再存在`);});
 const retiredShopApis=["newShopState","currentShopMap","makeShopItems","ensureShop","shopRefreshCost","paidShopRefresh","freeShopRefresh","shopPurchase","canResetShopPrice","resetShopPrice","specialApplyShopDiscount"];
 retiredShopApis.forEach(name=>{if(typeof window[name]!=="undefined")fail("LEGACY_SHOP_API",`已退休商店函式 ${name} 不應再存在`);});
 if(typeof window.VOID_MIRAGE_GM_UI_V2!=="undefined")fail("LEGACY_VOID_GM_MARKER","已退休的虛空 GM UI 標記不應再載入");
 const retiredPresentationApis=["consumeCombatPresentationPulse","consumeCombatPresentationPulseManual"];
 retiredPresentationApis.forEach(name=>{if(typeof window[name]!=="undefined")fail("LEGACY_COMBAT_PRESENTATION_API",`舊 log-based presentation API ${name} 不應再存在`);});
 const retiredCalamityApis=["normalizeCivilizationMarkProgressForCore","advanceCivilizationCalamityMarkEntry","settleCivilizationCalamityMarkKill","markAcquired","markProgress","MARK_DEFS","CALAMITY_DEFS"];
 retiredCalamityApis.forEach(name=>{if(typeof window[name]!=="undefined")fail("LEGACY_CALAMITY_API",`已退休的災厄／印記相容 API ${name} 不應再存在`);});

 if(Number(window.CIVILIZATION_CALAMITY_CONFIG_VERSION)!==2||!Array.isArray(window.CIVILIZATION_CALAMITY_CONFIG)||window.CIVILIZATION_CALAMITY_CONFIG.length!==10)fail("CALAMITY_CONFIG","文明災厄統一設定未正確載入",window.CIVILIZATION_CALAMITY_CONFIG);
 if(Number(window.MARK_PROGRESSION_OWNER_VERSION)!==1)fail("MARK_PROGRESSION_OWNER","Mark Core progression owner 未正確載入",window.MARK_PROGRESSION_OWNER_VERSION);
 if(Number(window.MARK_DESCRIPTION_OWNER_VERSION)!==1)fail("MARK_DESCRIPTION_OWNER","Mark Core description owner 未正確載入",window.MARK_DESCRIPTION_OWNER_VERSION);
 if(!Array.isArray(window.CIVILIZATION_PLAYER_TITLE_DEFS)||window.CIVILIZATION_PLAYER_TITLE_DEFS.length!==10||!Array.isArray(window.MIRROR_PLAYER_TITLE_DEFS)||window.MIRROR_PLAYER_TITLE_DEFS.length!==6||!Array.isArray(window.PLAYER_TITLE_DEFS)||window.PLAYER_TITLE_DEFS.length!==16)fail("PLAYER_TITLE_CORE","玩家稱號災厄10＋鏡像6 定義未正確載入",{calamity:window.CIVILIZATION_PLAYER_TITLE_DEFS?.length,mirror:window.MIRROR_PLAYER_TITLE_DEFS?.length,total:window.PLAYER_TITLE_DEFS?.length});
 if(window.PLAYER_TITLE_INTEGRITY?.passed!==true)fail("PLAYER_TITLE_INTEGRITY","玩家稱號專屬 integrity 未通過",window.PLAYER_TITLE_INTEGRITY?.errors||null);
 if(Number(SAVE_VERSION)!==13)fail("SAVE_VERSION",`SAVE_VERSION 應為 13，實際 ${SAVE_VERSION}`);
 if(Number(window.SAVE_SCHEMA_VERSION)!==14)fail("SAVE_SCHEMA",`SAVE_SCHEMA_VERSION 應為 14，實際 ${window.SAVE_SCHEMA_VERSION}`);
 if(Number(window.SAVE_NORMALIZATION_PIPELINE_VERSION)!==1||JSON.stringify(window.SAVE_NORMALIZATION_PIPELINE_ORDER)!==JSON.stringify(["worldPhase","worldProgress","level","gear","enhancement","vip","specialization","daily","dungeon","calamity","titles","offline","persistentFlags"]))fail("SAVE_NORMALIZATION_PIPELINE","存檔 normalization 順序 owner 未正確載入",{version:window.SAVE_NORMALIZATION_PIPELINE_VERSION,order:window.SAVE_NORMALIZATION_PIPELINE_ORDER});
 if(Number(window.SAVE_WRITE_GUARD_VERSION)!==1||typeof window.markSaveLoadResolved!=="function"||typeof window.saveWriteGuardStatus!=="function")fail("SAVE_WRITE_GUARD","本機存檔寫入保護 V1 未載入",{version:window.SAVE_WRITE_GUARD_VERSION,mark:typeof window.markSaveLoadResolved,status:typeof window.saveWriteGuardStatus});
 if(Number(window.SAVE_LOAD_PIPELINE_VERSION)!==2)fail("SAVE_PIPELINE",`SAVE_LOAD_PIPELINE_VERSION 應為 2，實際 ${window.SAVE_LOAD_PIPELINE_VERSION}`);
 if(Number(window.VIP_PROGRESSION_VERSION)!==13)fail("VIP_PROGRESSION_VERSION",`VIP 正式核心版本應為 13，實際 ${window.VIP_PROGRESSION_VERSION}`);
 if(Number(window.VIP_THRESHOLD_BASE)!==1000)fail("VIP_THRESHOLD_BASE",`VIP 門檻基數應為 1000，實際 ${window.VIP_THRESHOLD_BASE}`);
 if(typeof window.vipThreshold==="function"&&Number(window.vipThreshold(20))!==400000)fail("VIP20_THRESHOLD",`VIP20 門檻應為 400,000，實際 ${window.vipThreshold(20)}`);
 if(typeof window.vipThreshold==="function"&&Number(window.vipThreshold(1))!==1000)fail("VIP1_THRESHOLD",`VIP1 門檻應為 1,000，實際 ${window.vipThreshold(1)}`);
 if(typeof window.adjustVipDungeonPoints==="function"&&Number(window.adjustVipDungeonPoints(570,12))!==684)fail("VIP_DUNGEON_MULTIPLIER",`VIP12 對 570 基礎積分應為 684，實際 ${window.adjustVipDungeonPoints(570,12)}`);
 if(Number(window.SPECIALIZATION_MAX_LEVEL)!==60)fail("SPECIALIZATION_MAX_LEVEL",`專精上限應為 60，實際 ${window.SPECIALIZATION_MAX_LEVEL}`);
 if(Number(window.SPECIALIZATION_WORLD_SEMANTICS_VERSION)!==1||Number(window.SPECIALIZATION_PLAYER_WORLD_UI_VERSION)!==1||Number(window.SPECIALIZATION_GM_WORLD_SEMANTICS_VERSION)!==1||Number(window.GM_SPECIALIZATION_FORMAL_RANGE_VERSION)!==1||Number(window.GM_SPECIALIZATION_TEST_RANGE_VERSION)!==1||Number(window.SPECIALIZATION_WORLD_INTEGRITY_VERSION)!==1||typeof window.specializationWorldSemantics!=="function"||typeof window.specializationWorldEconomySummary!=="function"||typeof window.specializationPercentForLevel!=="function")fail("SPECIALIZATION_WORLD_SEMANTICS","專精玩家／GM 世界感知語意 owner 未完整載入",{semantics:window.SPECIALIZATION_WORLD_SEMANTICS_VERSION,playerUi:window.SPECIALIZATION_PLAYER_WORLD_UI_VERSION,gm:window.SPECIALIZATION_GM_WORLD_SEMANTICS_VERSION,formalRange:window.GM_SPECIALIZATION_FORMAL_RANGE_VERSION,testRange:window.GM_SPECIALIZATION_TEST_RANGE_VERSION,integrity:window.SPECIALIZATION_WORLD_INTEGRITY_VERSION});
 if(Number(window.ENHANCEMENT_MAX_LEVEL)!==20)fail("ENHANCEMENT_MAX_LEVEL",`強化上限應為 20，實際 ${window.ENHANCEMENT_MAX_LEVEL}`);
 if(Number(window.FIRST_WORLD_ENHANCEMENT_CAP)!==20||Number(window.SECOND_WORLD_ENHANCEMENT_MIN)!==20||Number(window.SECOND_WORLD_ENHANCEMENT_CAP)!==40||window.SECOND_WORLD_ENHANCEMENT_EXTENSION_ACTIVE!==true||Number(window.ENHANCEMENT_WORLD_AWARE_CORE_VERSION)!==2||Number(window.ENHANCEMENT_FORMAL_RANGE_VERSION)!==2||typeof window.effectiveEnhancementMin!=="function"||typeof window.formalEnhancementLevelValid!=="function")fail("ENHANCEMENT_WORLD_CAPS","強化正式世界範圍 owner 異常",{first:window.FIRST_WORLD_ENHANCEMENT_CAP,secondMin:window.SECOND_WORLD_ENHANCEMENT_MIN,second:window.SECOND_WORLD_ENHANCEMENT_CAP,active:window.SECOND_WORLD_ENHANCEMENT_EXTENSION_ACTIVE,core:window.ENHANCEMENT_WORLD_AWARE_CORE_VERSION,range:window.ENHANCEMENT_FORMAL_RANGE_VERSION});
 if(Number(window.SECOND_WORLD_ENHANCEMENT_PLAYER_FLOW_VERSION)!==1||Number(window.SECOND_WORLD_ENHANCEMENT_ATOMIC_UPGRADE_VERSION)!==1||typeof window.performEnhancementUpgrade!=="function"||Number(window.ENHANCEMENT_UI_VERSION)!==6)fail("SECOND_WORLD_ENHANCEMENT_PLAYER_FLOW","宇宙高階強化玩家流程／atomic owner 未完整載入",{flow:window.SECOND_WORLD_ENHANCEMENT_PLAYER_FLOW_VERSION,atomic:window.SECOND_WORLD_ENHANCEMENT_ATOMIC_UPGRADE_VERSION,api:typeof window.performEnhancementUpgrade,ui:window.ENHANCEMENT_UI_VERSION});
 if(Number(window.ENHANCEMENT_BONUS_PERCENT_PER_LEVEL)!==2.5)fail("ENHANCEMENT_RATE",`強化每級主能力應為 2.5%，實際 ${window.ENHANCEMENT_BONUS_PERCENT_PER_LEVEL}`);
 if(typeof window.enhancementUpgradeCost!=="function")fail("ENHANCEMENT_COST_API","強化成本 API 未載入");
 else{
  const c20=window.enhancementUpgradeCost(20);
  if(c20?.basic!==1000||c20?.advanced!==100)fail("ENHANCEMENT_COST20","強化 +20 成本應為基礎 1000、進階 100",c20);
  const total=Array.from({length:20},(_,i)=>window.enhancementUpgradeCost(i+1)).reduce((sum,cost)=>({basic:sum.basic+(Number(cost?.basic)||0),advanced:sum.advanced+(Number(cost?.advanced)||0)}),{basic:0,advanced:0});
  if(total.basic!==10500||total.advanced!==1050)fail("ENHANCEMENT_COST_TOTAL","單欄 +0→+20 累積成本應為基礎 10,500、進階 1,050",total);
 }
 if(typeof window.enhancementStoneEligible!=="function"||window.enhancementStoneEligible(115,105)!==false||window.enhancementStoneEligible(115,106)!==true)fail("ENHANCEMENT_LEVEL_GAP","強化石 10 級差邊界異常");
 if(typeof window.enhancementStoneSaleReward!=="function"||window.enhancementStoneSaleReward({q:4})?.basic!==5||window.enhancementStoneSaleReward({q:5})?.advanced!==1)fail("ENHANCEMENT_SALE_REWARD","傳說／神話出售強化石規則異常");
 if(typeof window.equippedStatsWithEnhancementLevels!=="function"||Number(window.ENHANCEMENT_EXPLICIT_LEVEL_CAP_VERSION)!==1)fail("ENHANCEMENT_STATS_API","指定強化等級能力計算 API／+40 cap owner 未完整載入",{api:typeof window.equippedStatsWithEnhancementLevels,capVersion:window.ENHANCEMENT_EXPLICIT_LEVEL_CAP_VERSION});
 if(Number(window.ENHANCEMENT_MIGRATION_WORLD_AWARE_VERSION)!==2)fail("ENHANCEMENT_MIGRATION_WORLD_AWARE","強化 migration 世界感知版本應為 V2",window.ENHANCEMENT_MIGRATION_WORLD_AWARE_VERSION);
 if(Number(window.ENHANCEMENT_FINAL_INTEGRITY_VERSION)!==2)fail("ENHANCEMENT_FINAL_VERSION","強化 Final Integrity 應為 V2",window.ENHANCEMENT_FINAL_INTEGRITY_VERSION);
 if(typeof window.gmTestEnhancedEquippedStats!=="function"||typeof window.gmUseCurrentEnhancementTestStatus!=="function")fail("ENHANCEMENT_GM_API","GM 強化測試 API 未載入");
 if(typeof window.normalizeEnhancementStoneReward!=="function"||typeof window.mergeEnhancementStoneRewards!=="function"||typeof window.enhancementStoneRewardText!=="function")fail("ENHANCEMENT_REWARD_HELPERS","強化石共用獎勵 API 未完整載入");
 else{
  const rewardProbe=window.mergeEnhancementStoneRewards({basic:1,advanced:0},{basic:5,advanced:1});
  if(rewardProbe.basic!==6||rewardProbe.advanced!==1)fail("ENHANCEMENT_REWARD_MERGE","強化石共用合併異常",rewardProbe);
  const rewardText=window.enhancementStoneRewardText(rewardProbe);
  if(!rewardText.includes("基礎強化石 +6")||!rewardText.includes("進階強化石 +1"))fail("ENHANCEMENT_REWARD_TEXT","強化石共用文字格式異常",rewardText);
 }
 if(typeof window.blankBattleEnhancementRewards!=="function"||typeof window.addBattleEnhancementReward!=="function"||typeof window.enhancementStoneSettlementSummaryHtml!=="function")fail("ENHANCEMENT_REWARD_PIPELINE","戰鬥強化石摘要／結算 API 未完整載入");
 else{
  const rewardCtx={enhancementRewards:window.blankBattleEnhancementRewards()};
  window.addBattleEnhancementReward(rewardCtx,"battle",{basic:1,advanced:1});
  window.addBattleEnhancementReward(rewardCtx,"autoSale",{basic:5,advanced:0});
  const rewardHtml=window.enhancementStoneSettlementSummaryHtml(rewardCtx);
  if(!rewardHtml.includes("enhancement-stone-summary-row")||!rewardHtml.includes("基礎強化石")||!rewardHtml.includes("+6")||!rewardHtml.includes("進階強化石")||!rewardHtml.includes("+1"))fail("ENHANCEMENT_REWARD_SETTLEMENT","戰鬥強化石全寬摘要顯示異常",rewardHtml);
  if(rewardHtml.includes("打怪掉落")||rewardHtml.includes("AUTO 出售"))fail("ENHANCEMENT_REWARD_DUPLICATE_SOURCE","戰鬥強化石結算不應重複顯示來源說明",rewardHtml);
  const basicOnly={enhancementRewards:window.blankBattleEnhancementRewards()};
  window.addBattleEnhancementReward(basicOnly,"battle",{basic:3,advanced:0});
  const basicHtml=window.enhancementStoneSettlementSummaryHtml(basicOnly);
  if(!basicHtml.includes("基礎強化石")||!basicHtml.includes("+3")||basicHtml.includes("進階強化石"))fail("ENHANCEMENT_REWARD_SINGLE_TYPE","單一基礎強化石獎勵顯示異常",basicHtml);
 }
 if(window.ENHANCEMENT_FINAL_INTEGRITY?.passed!==true)fail("ENHANCEMENT_FINAL_INTEGRITY","強化專屬回歸檢查未通過",window.ENHANCEMENT_FINAL_INTEGRITY?.errors||null);
 if(window.BOSS_CONTINUOUS_INTEGRITY?.passed!==true)fail("BOSS_CONTINUOUS_INTEGRITY","Boss 連戰專屬回歸檢查未通過",window.BOSS_CONTINUOUS_INTEGRITY?.errors||null);
 if(Number(window.DAILY_DUNGEON_LIMITS?.bounty)!==20)fail("BOUNTY_DAILY_LIMIT","懸賞每日上限應為 20");
 if(Number(window.DAILY_DUNGEON_LIMITS?.arena)!==20)fail("ARENA_DAILY_LIMIT","競技場每日上限應為 20");
 if(Number(window.ARENA_BALANCE_VERSION)!==3||typeof window.getArenaPositionPhysicalMultipliers!=="function"||typeof window.getArenaPositionStageConfig!=="function"||typeof window.getArenaTraitCountProfile!=="function")fail("ARENA_BALANCE_API","競技場平衡基準 API 未更新");
 else{
  const normal=window.getArenaPositionPhysicalMultipliers("normal"),hard=window.getArenaPositionPhysicalMultipliers("hard"),extreme=window.getArenaPositionPhysicalMultipliers("extreme");
  if(normal.hp!==1||normal.damage!==1||normal.def!==1)fail("ARENA_BALANCE_NORMAL","競技場低位物理倍率異常",normal);
  if(hard.hp!==.96||hard.damage!==.96||hard.def!==.98)fail("ARENA_BALANCE_HARD","競技場中位物理倍率異常",hard);
  if(extreme.hp!==.90||extreme.damage!==.92||extreme.def!==.96)fail("ARENA_BALANCE_EXTREME","競技場高位物理倍率異常",extreme);

  const extremeStages=[
   {critScale:.50,critAdd:1,critCap:11,dodgeScale:.45,dodgeAdd:1,dodgeCap:9,traitMode:"one"},
   {critScale:.65,critAdd:2,critCap:16,dodgeScale:.60,dodgeAdd:1,dodgeCap:13,traitMode:"extreme2"},
   {critScale:.75,critAdd:2,critCap:19,dodgeScale:.70,dodgeAdd:1,dodgeCap:16,traitMode:"extreme3"}
  ];
  extremeStages.forEach((expected,index)=>{
   const actual=window.getArenaPositionStageConfig("extreme",index);
   Object.keys(expected).forEach(key=>{if(actual?.[key]!==expected[key])fail("ARENA_EXTREME_STAGE",`競技場高位第 ${index+1} 戰 ${key} 異常`,{expected:expected[key],actual:actual?.[key]});});
  });
  const extreme2Traits=window.getArenaTraitCountProfile("extreme2"),extreme3Traits=window.getArenaTraitCountProfile("extreme3");
  if(extreme2Traits.zero!==0||extreme2Traits.one!==.75||extreme2Traits.two!==.25)fail("ARENA_EXTREME2_TRAITS","競技場高位第 2 戰特性數量機率異常",extreme2Traits);
  if(extreme3Traits.zero!==0||extreme3Traits.one!==.70||extreme3Traits.two!==.30)fail("ARENA_EXTREME3_TRAITS","競技場高位第 3 戰特性數量機率異常",extreme3Traits);

  if(typeof window.getArenaPositionConfigs!=="function")fail("ARENA_CONFIG_API","競技場 Position 完整設定 API 未載入");
  else{
   const extremeConfig=window.getArenaPositionConfigs(1).find(x=>x?.id==="extreme"),stage3=extremeConfig?.stages?.[2];
   if(!extremeConfig?.positionPhysical||extremeConfig.positionPhysical.hp!==.90||extremeConfig.positionPhysical.damage!==.92||extremeConfig.positionPhysical.def!==.96)fail("ARENA_CONFIG_POSITION_PHYSICAL","競技場完整設定未包含高位物理倍率",extremeConfig?.positionPhysical);
   const expectedHp=.78*.90,expectedDamage=.73*.92,expectedDef=.82*.96;
   if(!stage3?.effectivePhysical||Math.abs(stage3.effectivePhysical.hpMul-expectedHp)>1e-12||Math.abs(stage3.effectivePhysical.damageMul-expectedDamage)>1e-12||Math.abs(stage3.effectivePhysical.defMul-expectedDef)>1e-12)fail("ARENA_CONFIG_EFFECTIVE_PHYSICAL","競技場完整設定的高位第 3 戰有效物理倍率異常",stage3?.effectivePhysical);
  }
 }
 const arenaVersions=typeof window.getArenaVersionProfile==="function"?window.getArenaVersionProfile():null;
 if(!arenaVersions)fail("ARENA_VERSION_PROFILE","競技場統一版本 profile 未載入");
 else{
  if(Number(window.ARENA_ASSESSMENT_STATE_VERSION)!==Number(arenaVersions.assessmentStateVersion)||Number(window.ARENA_ASSESSMENT_RUNTIME_VERSION)!==Number(arenaVersions.assessmentRuntimeVersion))fail("ARENA_ASSESSMENT_VERSION","競技場評估版本與統一 profile 不一致",{state:window.ARENA_ASSESSMENT_STATE_VERSION,runtime:window.ARENA_ASSESSMENT_RUNTIME_VERSION,profile:arenaVersions});
 }
 if(typeof window.getArenaAssessmentCompatibilityVersions==="function"){
  const versions=window.getArenaAssessmentCompatibilityVersions();
  if(versions.positionModelVersion!==1||versions.assessmentRuleVersion!==4||versions.balanceVersion!==3)fail("ARENA_ASSESSMENT_COMPAT","競技場評估相容版本異常",versions);
  if(Number(versions.balanceVersion)!==Number(window.ARENA_BALANCE_VERSION))fail("ARENA_ASSESSMENT_BALANCE_SYNC","競技場評估 balanceVersion 與正式平衡版本不同步",{assessment:versions.balanceVersion,balance:window.ARENA_BALANCE_VERSION});
 }
 if(typeof window.getArenaAssessmentSignature==="function"){
  try{
   const signature=JSON.parse(window.getArenaAssessmentSignature(1));
   const markKeys=["ward","suppression","composure","indomitable","resilience","battleSpirit","absorption","revenge","backlash","ignore"];
   if(signature?.positionModelVersion!==1||signature?.assessmentRuleVersion!==4||signature?.balanceVersion!==3||Number(signature?.markRuleVersion)!==Number(window.MARK_COMBAT_RULE_VERSION))fail("ARENA_ASSESSMENT_SIGNATURE_VERSION","競技場評估簽章未包含目前版本",{signature});
   if(!signature?.marks||markKeys.some(key=>!Number.isFinite(Number(signature.marks[key]))))fail("ARENA_ASSESSMENT_SIGNATURE_MARKS","競技場評估簽章未包含完整 10 枚印記",signature?.marks||null);
  }catch(error){fail("ARENA_ASSESSMENT_SIGNATURE_PARSE","競技場評估簽章無法解析",String(error));}
 }
 if(typeof window.normalizeDungeonSaveState==="function"){
  try{
   const legacyArenaProbe={
    unlockedMap:Math.max(0,(Array.isArray(WORLD_REGIONS)&&WORLD_REGIONS.length?WORLD_REGIONS[WORLD_REGIONS.length-1]?.mapStart:99)||99),
    dungeon:{arena:{positionModelVersion:1,assessmentRuleVersion:3,balanceVersion:3,highestArenaUnlocked:4,activeRank:null,rank:4,promotionReady:true,lastCheckSignature:"legacy-qualified",lastCheckRuns:500,lastCheckClearCount:500}}
   };
   window.normalizeDungeonSaveState(legacyArenaProbe,{timestamp:Date.now()});
   const arena=legacyArenaProbe.dungeon?.arena;
   if(arena?.highestArenaUnlocked!==4)fail("ARENA_LEGACY_UNLOCK_PRESERVE","競技場舊評估失效時不得重置已解鎖階級",arena);
   if(arena?.promotionReady!==false||arena?.lastCheckRuns!==0||arena?.lastCheckClearCount!==0||arena?.lastCheckSignature!==null)fail("ARENA_LEGACY_ASSESS_RESET","競技場舊版本評估結果未正確失效",arena);
   if(arena?.positionModelVersion!==1||arena?.assessmentRuleVersion!==4||arena?.balanceVersion!==3)fail("ARENA_LEGACY_VERSION_NORMALIZE","競技場舊評估版本欄位未正規化",arena);
  }catch(error){fail("ARENA_LEGACY_ASSESS_PROBE","競技場舊評估相容測試執行失敗",String(error));}
 }
  if("VOID_MIRAGE_MAX_FLOOR" in window)fail("VOID_MAX_FLOOR_RESIDUE","虛空幻境不應存在最高層限制");
 if(Number(window.VOID_MIRAGE_START_OFFSET)!==100)fail("VOID_START_OFFSET",`虛空幻境起始回退應為 100 層，實際 ${window.VOID_MIRAGE_START_OFFSET}`);
 if(typeof window.voidMirageStartFloorFromHistory==="function"){
  const checks=[[80,1],[850,750],[2500,2400],[4000,3900],[5000,4900],[10000,9900]];
  checks.forEach(([highest,expected])=>{const actual=window.voidMirageStartFloorFromHistory(highest);if(Number(actual)!==expected)fail("VOID_START_FLOOR",`歷史最高 ${highest} 時起始層應為 ${expected}，實際 ${actual}`);});
 }
 if(typeof window.getArenaBaseTotalPoints==="function"){
  const checks=[[1,"normal",50],[1,"hard",100],[1,"extreme",150],[4,"normal",110],[4,"hard",160],[4,"extreme",210],[10,"normal",470],[10,"hard",520],[10,"extreme",570]];
  checks.forEach(([rank,id,expected])=>{const actual=window.getArenaBaseTotalPoints(rank,id);if(Number(actual)!==expected)fail("ARENA_POINTS",`競技場第 ${rank} 階 ${id} 積分應為 ${expected}，實際 ${actual}`);});
 }
 if(typeof window.getNewStateNormalizerCount==="function"&&Number(window.getNewStateNormalizerCount())!==5)fail("NEW_STATE_NORMALIZERS",`新存檔應只有 5 個正式 normalizer，實際 ${window.getNewStateNormalizerCount()}`);
 if(typeof newState==="function"){
  const fresh=newState();
  if(!fresh?.daily||fresh.daily.bounty?.used!==0||fresh.daily.arena?.used!==0)fail("NEW_STATE_DAILY","newState 未正確建立每日副本狀態",fresh?.daily);
  if(!fresh?.dungeon?.arena)fail("NEW_STATE_DUNGEON","newState 未正確建立競技場持久狀態",fresh?.dungeon);
  if(fresh?.vipPoints!==0||fresh?.vipLevel!==0)fail("NEW_STATE_VIP","newState VIP 初始狀態異常",{vipPoints:fresh?.vipPoints,vipLevel:fresh?.vipLevel});
  if(Object.prototype.hasOwnProperty.call(fresh,"shop"))fail("NEW_STATE_SHOP","newState 不應再含退休的 shop 欄位");
  if(fresh.pendingBlackMarketEncounter!==false)fail("NEW_STATE_BLACK_MARKET","newState 應正式建立 pendingBlackMarketEncounter=false",fresh.pendingBlackMarketEncounter);
  if(Number(fresh.calamities?.version)!==1||Object.keys(fresh.calamities?.entries||{}).length!==10)fail("NEW_STATE_CALAMITIES","newState 未正確建立文明災厄 state",fresh.calamities);
  if(Number(fresh.marks?.version)!==1||Object.keys(fresh.marks?.entries||{}).length!==10)fail("NEW_STATE_MARKS","newState 未正確建立印記 state",fresh.marks);
  ["progress","attempts","activeRun","points"].forEach(key=>{if(Object.prototype.hasOwnProperty.call(fresh?.dungeon||{},key))fail("NEW_STATE_LEGACY_DUNGEON",`newState 不應含舊副本欄位 ${key}`);});
 }
 if(typeof window.normalizeDailyState==="function"){
  const key=typeof window.gameDailyDateKey==="function"?window.gameDailyDateKey():"";
  const probe={daily:{dateKey:key,bounty:{used:999},arena:{used:999},voidMirage:{highestFloor:0,claimed:false}}};
  window.normalizeDailyState(probe);
  if(probe.daily.bounty.used!==20||probe.daily.arena.used!==20)fail("DAILY_NORMALIZE_CLAMP","每日次數 normalizer 應直接限制在 20",probe.daily);
 }
 if(typeof window.migrateSave==="function"&&typeof newState==="function"&&typeof window.normalizeSaveState==="function"){
  const priorReport=window.LAST_SAVE_MIGRATION_REPORT;
  try{
   const probe=newState();
   const item=JSON.parse(JSON.stringify(probe.equipment?.weapon));
   probe.saveVersion=11;
   probe.shop={items:[],refreshIndex:7,resetAvailableAt:123,initialized:true};
   probe.lostGear=[{id:"runtime-migration-probe",item,cost:123,lostAt:456}];
   const raw=JSON.parse(JSON.stringify(probe));
   const migrated=window.migrateSave(probe,11,window.normalizeSaveState,raw);
   if(Object.prototype.hasOwnProperty.call(migrated,"shop"))fail("MIGRATION_SHOP_RETIRE","v11 → v14 migration 未移除 shop");
   const lost=migrated.lostGear?.find(x=>x?.id==="runtime-migration-probe");
   if(!lost||lost.cost!==123||lost.lostAt!==456||lost.item?.id!==item?.id)fail("MIGRATION_LOST_GEAR","v11 → v14 migration 未完整保留 lostGear",lost);
   if(migrated.pendingBlackMarketEncounter!==false)fail("MIGRATION_BLACK_MARKET_FLAG","v11 → v14 migration 未建立黑市情報布林狀態",migrated.pendingBlackMarketEncounter);
   if(Number(migrated.saveVersion)!==14||Object.keys(migrated.calamities?.entries||{}).length!==10||Object.keys(migrated.marks?.entries||{}).length!==10)fail("MIGRATION_SCHEMA14_STATE","舊存檔未正確補上 Schema 14 正式 state",{saveVersion:migrated.saveVersion,calamities:migrated.calamities,marks:migrated.marks});
  }catch(error){fail("MIGRATION_PROBE","v11 → v14 migration 回歸測試執行失敗",String(error));}
  window.LAST_SAVE_MIGRATION_REPORT=priorReport;
 }
 if(typeof window.specialRewardGoldAmount==="function"&&typeof window.specializationAdjustedGold==="function"){
  const ctx={goldMultiplier:2.5};
  const actual=window.specialRewardGoldAmount(100,ctx);
  const expected=window.specializationAdjustedGold(250);
  if(actual!==expected)fail("SPECIAL_GOLD_SPECIALIZATION_ONCE",`特殊怪金幣專精應只套用一次，預期 ${expected}，實際 ${actual}`);
  const bonus=window.specialRewardGoldAmount(100,ctx);
  if(bonus!==actual)fail("BLACK_MARKET_VIP10_GOLD",`黑市 VIP10 第二份金幣應與第一份相同，第一份 ${actual}、第二份 ${bonus}`);
 }
 if(typeof window.specialRewardExpAmount==="function"&&typeof window.specializationAdjustedExp==="function"){
  const ctx={expMultiplier:4};
  const actual=window.specialRewardExpAmount(100,ctx);
  const expected=window.specializationAdjustedExp(400);
  if(actual!==expected)fail("SPECIAL_EXP_SPECIALIZATION_ONCE",`特殊怪 EXP 專精應只套用一次，預期 ${expected}，實際 ${actual}`);
 }
 if(window.BATCH5_UI_READY!==true)fail("BATCH5_UI","第五批共用 UI 未完成載入");
 const clock=document.getElementById("gameDailyClock"),clockTime=document.getElementById("gameDailyClockTime");
 if(!clock||!clockTime)fail("DAILY_CLOCK","主介面每日時鐘未建立");
 else if(!/^\d{2}:\d{2}:\d{2}$/.test(clockTime.textContent||""))fail("DAILY_CLOCK_FORMAT",`時鐘格式異常：${clockTime.textContent||""}`);
 if(clock?.textContent?.includes("臺灣時間"))fail("DAILY_CLOCK_LABEL","時鐘不應顯示「臺灣時間」文字");
 if(!clock?.textContent?.includes("每日凌晨 0 點重置"))fail("DAILY_RESET_LABEL","缺少固定的每日凌晨 0 點重置文字");

 if(Number(window.GAME_GUIDE_VERSION)!==14)fail("GUIDE_VERSION",`遊戲說明版本應為 14，實際 ${window.GAME_GUIDE_VERSION}`);
 if(window.GAME_GUIDE_ARENA_V6!==true)fail("GUIDE_LATE_OVERRIDE","舊競技場說明覆蓋檔未停用");
 const guideText=Array.isArray(window.GAME_GUIDE_CATEGORIES)?window.GAME_GUIDE_CATEGORIES.flatMap(c=>c.items||[]).flat().join(" "):"";
 const guideRequired=["每天最多挑戰 20 次","每天最多開始 20 輪","沒有最高層數","當日最高層 × 2","最高 Lv60","查看特權","主線由多個區域與地圖組成","遺失裝備贖回","黑市情報","裝備欄位強化","玩家高於怪物 10 級（含）以上時，主線戰鬥將不再掉落強化石","Boss 可選擇單場或連續戰鬥","普通怪、菁英怪與 Boss 都可以選擇","Boss 不會觸發","離線收益不會以 Boss 作為刷怪目標","最近一次有效的普通怪或菁英怪戰鬥紀錄","擊敗各區域最終 Boss 後解鎖對應災厄","災厄 HP 會跨挑戰保留","印記最高 Lv.10","文明災厄不提供 EXP、金幣、裝備或其他一般獎勵"];
 guideRequired.forEach(text=>{if(!guideText.includes(text))fail("GUIDE_REQUIRED_TEXT",`遊戲說明缺少新版規則：${text}`);});
 const guideLegacy=["EXP、金幣、裝備與副本進度","副本需要消耗挑戰次數","下一個尚未通過的樓層","每突破一層即可取得該層的 VIP 積分","每一種最高 Lv30","VIP4：提升副本進度取得速度","VIP12：進一步提升副本進度取得速度","第1～3階為 50／100／150","2500 × VIP 等級²","每級 EXP +2.5%","最高為 12,800","重置回 100","免費刷新一次新地圖的商店","前往商店花費金幣贖回","降低目前商店刷新費用","商店會提供","Boss 固定只能單場挑戰","Boss 每次只能單場挑戰","離線刷普通怪或菁英怪可取得理論基礎強化石的 5%"];
 guideLegacy.forEach(text=>{if(guideText.includes(text))fail("GUIDE_LEGACY_TEXT",`遊戲說明仍含過度詳細或舊規則：${text}`);});
 if(typeof gmHtml==="function"){
  const gmText=String(gmHtml());
  ["副本次數累積進度","副本可挑戰次數","GM 測試不扣副本次數","推進並取得積分","首通積分","平均每層積分"].forEach(text=>{if(gmText.includes(text))fail("GM_LEGACY_TEXT",`GM 介面仍含舊規則：${text}`);});
  ["今日懸賞","今日競技場","虛空歷史最高","虛空當日最高"].forEach(text=>{if(!gmText.includes(text))fail("GM_CURRENT_TEXT",`GM 介面缺少新版副本資料：${text}`);});
 }

 if(window.CALAMITY_STATE_INTEGRITY?.passed!==true)fail("CALAMITY_STATE_INTEGRITY","文明災厄／印記持久 state 專屬回歸檢查未通過",window.CALAMITY_STATE_INTEGRITY?.errors||null);
 if(window.MARK_CORE_INTEGRITY?.passed!==true)fail("MARK_CORE_INTEGRITY","Mark Core 專屬回歸檢查未通過",window.MARK_CORE_INTEGRITY?.errors||null);
 if(window.COMBAT_MARK_INTEGRITY?.passed!==true)fail("COMBAT_MARK_INTEGRITY","共用戰鬥印記整合回歸檢查未通過",window.COMBAT_MARK_INTEGRITY?.errors||null);
 if(window.COMBAT_MARK_FX_INTEGRITY?.passed!==true)fail("COMBAT_MARK_FX_INTEGRITY","戰鬥印記浮字／HP 呈現回歸檢查未通過",window.COMBAT_MARK_FX_INTEGRITY?.errors||null);
 if(window.CALAMITY_CORE_INTEGRITY?.passed!==true)fail("CALAMITY_CORE_INTEGRITY","文明災厄 Core 專屬回歸檢查未通過",window.CALAMITY_CORE_INTEGRITY?.errors||null);
 if(window.CALAMITY_RUN_INTEGRITY?.passed!==true)fail("CALAMITY_RUN_INTEGRITY","文明災厄單場／連續討伐 runtime 回歸檢查未通過",window.CALAMITY_RUN_INTEGRITY?.errors||null);
 if(window.CALAMITY_UI_INTEGRITY?.passed!==true)fail("CALAMITY_UI_INTEGRITY","文明災厄 UI／極簡／可見性回歸檢查未通過",window.CALAMITY_UI_INTEGRITY?.errors||null);
 if(window.CALAMITY_GM_INTEGRITY?.passed!==true)fail("CALAMITY_GM_INTEGRITY","文明災厄／印記 GM 整合回歸檢查未通過",window.CALAMITY_GM_INTEGRITY?.errors||null);
 if(Number(window.MARK_CORE_VERSION)!==1||Number(window.MARK_COMBAT_RULE_VERSION)!==1)fail("MARK_CORE_VERSION","Mark Core／戰鬥規則版本異常",{core:window.MARK_CORE_VERSION,rules:window.MARK_COMBAT_RULE_VERSION});
 if(Number(window.COMBAT_MARK_INTEGRATION_VERSION)!==1)fail("COMBAT_MARK_INTEGRATION_VERSION","共用戰鬥印記整合版本應為 1",window.COMBAT_MARK_INTEGRATION_VERSION);
 if(Number(window.COMBAT_MARK_FX_VERSION)!==1)fail("COMBAT_MARK_FX_VERSION","戰鬥印記浮字版本應為 1",window.COMBAT_MARK_FX_VERSION);
 if(Number(window.COMBAT_PRESENTATION_VERSION)!==2)fail("COMBAT_PRESENTATION_VERSION","Combat Presentation 版本應為 2",window.COMBAT_PRESENTATION_VERSION);
 if(Number(window.COMBAT_STRUCTURED_PRESENTATION_VERSION)!==2||Number(window.COMBAT_STRUCTURED_SLEEP_INJECTION_VERSION)!==1||Number(window.MIRROR_STRUCTURED_PRESENTATION_VERSION)!==1||Number(window.CALAMITY_STRUCTURED_PRESENTATION_VERSION)!==2||Number(window.CALAMITY_BACKGROUND_PRESENTATION_VERSION)!==1||Number(window.COMBAT_PRESENTATION_UNIFIED_VERSION)!==1)fail("COMBAT_STRUCTURED_PRESENTATION_VERSION","Unified Structured Presentation／災厄背景動畫版本異常",{structured:window.COMBAT_STRUCTURED_PRESENTATION_VERSION,sleepInjection:window.COMBAT_STRUCTURED_SLEEP_INJECTION_VERSION,mirror:window.MIRROR_STRUCTURED_PRESENTATION_VERSION,calamity:window.CALAMITY_STRUCTURED_PRESENTATION_VERSION,calamityBackground:window.CALAMITY_BACKGROUND_PRESENTATION_VERSION,unified:window.COMBAT_PRESENTATION_UNIFIED_VERSION});
 if(Number(window.CALAMITY_BALANCE_VERSION)!==3||Number(window.CALAMITY_HP_PER_LEVEL)!==500000||typeof window.getCivilizationCalamityConfiguredMaxHp!=="function"||Number(window.getCivilizationCalamityConfiguredMaxHp(window.CIVILIZATION_CALAMITY_IDS?.[0]))!==500000||Number(window.getCivilizationCalamityConfiguredMaxHp(window.CIVILIZATION_CALAMITY_IDS?.[9]))!==5000000)fail("CALAMITY_BALANCE_VERSION","文明災厄 Balance V3／分級 HP 曲線異常",{balance:window.CALAMITY_BALANCE_VERSION,hpPerLevel:window.CALAMITY_HP_PER_LEVEL,first:window.getCivilizationCalamityConfiguredMaxHp?.(window.CIVILIZATION_CALAMITY_IDS?.[0]),last:window.getCivilizationCalamityConfiguredMaxHp?.(window.CIVILIZATION_CALAMITY_IDS?.[9])});
 if(Number(window.CALAMITY_CORE_VERSION)!==1||Number(window.CALAMITY_COMBAT_RULE_VERSION)!==2||Number(window.CALAMITY_HP_RESTORE_OWNER_VERSION)!==1||Number(window.COMBAT_PERSISTENT_ENEMY_HP_VERSION)!==1)fail("CALAMITY_CORE_VERSION","文明災厄 Core／HP restore owner／持久敵方 HP 版本異常",{core:window.CALAMITY_CORE_VERSION,rules:window.CALAMITY_COMBAT_RULE_VERSION,restoreOwner:window.CALAMITY_HP_RESTORE_OWNER_VERSION,persistentHp:window.COMBAT_PERSISTENT_ENEMY_HP_VERSION});
 if(Number(window.CALAMITY_RUN_VERSION)!==1||Number(window.CALAMITY_CONTINUOUS_RULE_VERSION)!==4)fail("CALAMITY_RUN_VERSION","文明災厄 runtime／連戰規則版本異常",{run:window.CALAMITY_RUN_VERSION,rules:window.CALAMITY_CONTINUOUS_RULE_VERSION});
 if(Number(window.CALAMITY_UI_VERSION)!==3||Number(window.CALAMITY_MINIMAL_MODE_VERSION)!==1||Number(window.CALAMITY_BATTLE_VIEW_VERSION)!==1||Number(window.CALAMITY_OUTER_PACING_VERSION)!==1)fail("CALAMITY_UI_VERSION","文明災厄 UI／battleView／極簡模式／Outer Pacing 接線異常",{ui:window.CALAMITY_UI_VERSION,battleView:window.CALAMITY_BATTLE_VIEW_VERSION,minimal:window.CALAMITY_MINIMAL_MODE_VERSION,outer:window.CALAMITY_OUTER_PACING_VERSION});
 if(Number(window.GM_CALAMITY_TEST_VERSION)!==1||Number(window.GM_MARK_MANAGEMENT_VERSION)!==1||Number(window.GM_MARK_CONFIG_OWNER_VERSION)!==1||Number(window.GM_CALAMITY_FULL_KILL_SAFETY_LIMIT)!==100000)fail("CALAMITY_GM_VERSION","文明災厄／印記 GM 版本異常",{calamity:window.GM_CALAMITY_TEST_VERSION,marks:window.GM_MARK_MANAGEMENT_VERSION,configOwner:window.GM_MARK_CONFIG_OWNER_VERSION,safety:window.GM_CALAMITY_FULL_KILL_SAFETY_LIMIT});
 if(state&&Number(state.saveVersion)!==Number(window.SAVE_SCHEMA_VERSION))fail("STATE_SCHEMA",`state.saveVersion ${state.saveVersion} 與正式 schema 不一致`);
 if(Number(window.SAVE_NORMALIZATION_WORLD_AWARE_VERSION)!==1||typeof window.normalizeSaveState!=="function"||typeof window.normalizeSaveItem!=="function")fail("WORLD_AWARE_SAVE_NORMALIZATION","世界感知存檔／裝備 normalization owner 未完整載入",{version:window.SAVE_NORMALIZATION_WORLD_AWARE_VERSION,state:typeof window.normalizeSaveState,item:typeof window.normalizeSaveItem});
 if(Number(window.SAVE_ROOT_NORMALIZATION_ORDER_VERSION)!==1)fail("SAVE_ROOT_NORMALIZATION_ORDER","root save normalizer 應採 world-first 順序",window.SAVE_ROOT_NORMALIZATION_ORDER_VERSION);
 if(Number(window.UI_LEGACY_INVENTORY_MUTATION_RETIRED_VERSION)!==1||Number(window.INVENTORY_SALE_DISPLAY_FAIL_CLOSED_VERSION)!==1)fail("INVENTORY_UI_OWNER","背包 UI 應只保留顯示，正式 mutation／sale 由 equipment owner 管理",{retired:window.UI_LEGACY_INVENTORY_MUTATION_RETIRED_VERSION,displayFailClosed:window.INVENTORY_SALE_DISPLAY_FAIL_CLOSED_VERSION});
 if(Number(window.EQUIPMENT_ENHANCEMENT_PIPELINE_VERSION)!==4||Number(window.EQUIPMENT_SALE_FAIL_CLOSED_VERSION)!==1||Number(window.EQUIPMENT_LOST_GEAR_ECONOMY_NORMALIZATION_VERSION)!==1||typeof window.handleUnequippedItem!=="function"||typeof window.equipmentSellSelected!=="function"||typeof window.equipmentSellLowerAll!=="function")fail("EQUIPMENT_SALE_PIPELINE","裝備 mutation／sale owner V4 未完整載入",{pipeline:window.EQUIPMENT_ENHANCEMENT_PIPELINE_VERSION,failClosed:window.EQUIPMENT_SALE_FAIL_CLOSED_VERSION,lostGear:window.EQUIPMENT_LOST_GEAR_ECONOMY_NORMALIZATION_VERSION});
 try{
  const mkItem=(world,level=600,q=3)=>({id:"lost-probe-"+world,name:"probe",type:"weapon",world,level,q,mainStat:{stat:"atk",value:1},affixes:[],atk:1,def:0,hp:0,crit:0,dodge:0,sell:0,buy:100});
  const universe=typeof newState==="function"?newState():{};
  universe.secondWorld=typeof window.createBlankSecondWorldState==="function"?window.createBlankSecondWorldState():{entered:false,mainline:{bossKilled:Array(100).fill(false)},darkMatter:0,darkEnergy:0,calamities:Array(10).fill(null)};
  universe.secondWorld.entered=true;universe.level=600;
  universe.lostGear=[{id:"w2",item:mkItem(2),cost:123,currency:"gold",lostAt:1},{id:"w1",item:mkItem(1,500),cost:999,currency:"gold",lostAt:2}];
  const normalizedUniverse=window.normalizeSaveState(universe);
  const w2=normalizedUniverse.lostGear?.find(x=>x.id==="w2"),w1=normalizedUniverse.lostGear?.find(x=>x.id==="w1");
  const expectedW2=typeof window.secondWorldEquipmentRedemptionCost==="function"?window.secondWorldEquipmentRedemptionCost(w2?.item,false):null;
  if(w2?.currency!=="darkMatter"||expectedW2==null||Number(w2?.cost)!==Number(expectedW2))fail("LOST_GEAR_WORLD2_CURRENCY","world2 遺失裝備應統一為正式暗物質贖回價",{w2,expectedW2});
  if(w1?.currency!=="free"||Number(w1?.cost)!==0)fail("LOST_GEAR_WORLD1_UNIVERSE_FREE","宇宙紀元遺失的 world1 裝備應免費贖回",w1);
  const galaxy=typeof newState==="function"?newState():{};
  galaxy.lostGear=[{id:"g1",item:mkItem(1,500),cost:321,currency:"gold",lostAt:3}];
  const normalizedGalaxy=window.normalizeSaveState(galaxy),g1=normalizedGalaxy.lostGear?.[0];
  if(g1?.currency!=="gold"||Number(g1?.cost)!==321)fail("LOST_GEAR_WORLD1_GALAXY_GOLD","銀河紀元 world1 遺失裝備應保留金幣贖回資料",g1);
 }catch(error){fail("LOST_GEAR_WORLD_AWARE_PROBE","lostGear 世界感知 normalization probe 失敗",String(error?.message||error));}

 if(state&&(Object.keys(state.calamities?.entries||{}).length!==10||Object.keys(state.marks?.entries||{}).length!==10))fail("STATE_CALAMITY_MARKS","正式 state 應包含 10 組災厄與 10 組印記",{calamities:state.calamities,marks:state.marks});
 if(state&&Object.prototype.hasOwnProperty.call(state,"shop"))fail("LEGACY_SHOP_STATE","正式 state 不應再含退休的 shop 欄位");
 if(state&&typeof state.pendingBlackMarketEncounter!=="boolean")fail("BLACK_MARKET_INTEL_STATE","pendingBlackMarketEncounter 應 normalize 為 boolean",state.pendingBlackMarketEncounter);
 if(state?.dungeon){
  ["progress","attempts","activeRun","points"].forEach(key=>{if(Object.prototype.hasOwnProperty.call(state.dungeon,key))fail("LEGACY_DUNGEON_STATE",`state.dungeon 不應再含舊欄位 ${key}`);});
 }
 const blackMarket=typeof getSpecialMonsterById==="function"?getSpecialMonsterById("bandit_king"):null;
 if(!blackMarket)fail("BLACK_MARKET_MONSTER","找不到黑市武裝頭目正式定義");
 else{
  const effects=Array.isArray(blackMarket.effects)?blackMarket.effects:[];
  const gold=effects.find(x=>x?.type==="goldMultiplier");
  if(Number(gold?.value)!==2.5)fail("BLACK_MARKET_GOLD","黑市武裝頭目金幣倍率應為 2.5",effects);
  if(effects.some(x=>String(x?.type||"").toLowerCase().includes("shop")))fail("BLACK_MARKET_SHOP_EFFECT","黑市武裝頭目不應再含商店效果",effects);
 }
 if(!window.LAST_SAVE_LOAD_REPORT)warn("LOAD_REPORT","尚未找到 LAST_SAVE_LOAD_REPORT");
 else if(Number(window.LAST_SAVE_LOAD_REPORT.pipelineVersion)!==Number(window.SAVE_LOAD_PIPELINE_VERSION))fail("LOAD_REPORT_PIPELINE","LAST_SAVE_LOAD_REPORT pipeline 與正式版本不一致",window.LAST_SAVE_LOAD_REPORT);

 if(Number(window.STRUCTURED_COMBAT_PACING_VERSION)!==2||Number(window.STRUCTURED_COMBAT_SPEED_AWARE_VERSION)!==1||typeof window.getStructuredCombatPacing!=="function"||typeof window.getStructuredCombatPacingForSpeed!=="function")fail("STRUCTURED_COMBAT_PACING_OWNER","戰鬥內動畫應由 speed-aware Structured Combat Pacing 統一管理",{version:window.STRUCTURED_COMBAT_PACING_VERSION,speedAware:window.STRUCTURED_COMBAT_SPEED_AWARE_VERSION,api:typeof window.getStructuredCombatPacing});
 if(Number(window.COMBAT_SPEED_INTEGRITY_VERSION)!==1||window.COMBAT_SPEED_INTEGRITY?.passed!==true)fail("COMBAT_SPEED_INTEGRITY","正式戰鬥倍速完整性檢查未通過",window.COMBAT_SPEED_INTEGRITY?.errors||null);
 if(Number(window.COMBAT_FX_ANIMATION_LIFECYCLE_VERSION)!==1)fail("COMBAT_FX_ANIMATION_LIFECYCLE","Combat FX 應由 animation lifecycle 清理，不應依賴舊固定 timer",window.COMBAT_FX_ANIMATION_LIFECYCLE_VERSION);
 if(Number(window.OFFLINE_BATTLE_SAMPLE_VERSION)!==3||Number(window.MAIN_REAL_BATTLE_SAMPLE_VERSION)!==3||Number(window.OFFLINE_COMBAT_SPEED_SAMPLE_VERSION)!==1)fail("OFFLINE_BATTLE_SAMPLE_VERSION","離線實戰樣本應使用 speed-aware V3",{offline:window.OFFLINE_BATTLE_SAMPLE_VERSION,main:window.MAIN_REAL_BATTLE_SAMPLE_VERSION,speed:window.OFFLINE_COMBAT_SPEED_SAMPLE_VERSION});
 if(Number(window.OFFLINE_CHECKPOINT_RECOVERY_VERSION)!==2||typeof window.recoverOfflineCheckpointTime!=="function"||typeof window.prepareOfflineCheckpointForWorldTransition!=="function"||typeof window.finalizeOfflineCheckpointForWorldTransition!=="function")fail("OFFLINE_CHECKPOINT_RECOVERY_OWNER","離線 checkpoint recovery／世界轉換 owner 未正確載入",{version:window.OFFLINE_CHECKPOINT_RECOVERY_VERSION,recover:typeof window.recoverOfflineCheckpointTime,prepare:typeof window.prepareOfflineCheckpointForWorldTransition,finalize:typeof window.finalizeOfflineCheckpointForWorldTransition});
 else{
  const nowProbe=2000000,earlier=1000000,later=1500000;
  const recovered=window.recoverOfflineCheckpointTime(later,earlier,nowProbe);
  if(recovered!==earlier)fail("OFFLINE_CHECKPOINT_EARLIER_WINS","較早 persisted checkpoint 必須覆蓋較晚 lastSettledAt",{current:later,persisted:earlier,recovered});
  const kept=window.recoverOfflineCheckpointTime(earlier,later,nowProbe);
  if(kept!==earlier)fail("OFFLINE_CHECKPOINT_LATER_DOES_NOT_ADVANCE","較晚 persisted checkpoint 不得把離線起點往後推",{current:earlier,persisted:later,recovered:kept});
 }
 try{
  if(typeof window.migrateSave!=="function")throw new Error("migrateSave unavailable");
  const sampleVersion=Number(window.OFFLINE_BATTLE_SAMPLE_VERSION);
  const probeSource=typeof newState==="function"?newState():{};
  probeSource.saveVersion=Number(window.SAVE_SCHEMA_VERSION)||14;
  probeSource.offline={
   lastSettledAt:Date.now()-600000,
   farmMap:null,farmEnemy:null,avgBattleMs:0,sampleCount:0,
   battleSampleVersion:sampleVersion,
   battleSamples:[{sampleVersion,combatSpeed:1,actualMs:1000,cycleMs:1140,adjustedMs:1140,playerLevel:10,enemyLevel:10,kind:"normal",map:0,enemy:0,multiplier:1,recordedAt:Date.now()-600000}],
   maxObservedWallClock:Date.now()-600000,timeLockUntil:0
  };
  const raw=JSON.parse(JSON.stringify(probeSource));
  const previousReport=window.LAST_SAVE_MIGRATION_REPORT;
  const migrated=window.migrateSave(probeSource,probeSource.saveVersion,typeof normalizeSaveState==="function"?normalizeSaveState:null,raw);
  window.LAST_SAVE_MIGRATION_REPORT=previousReport;
  const row=migrated?.offline?.battleSamples?.[0];
  if(Number(migrated?.offline?.battleSampleVersion)!==sampleVersion||Number(row?.sampleVersion)!==sampleVersion||Number(row?.combatSpeed)!==1||Number(row?.cycleMs)!==1140)fail("OFFLINE_SAMPLE_MIGRATION_VERSION","離線 V3 sample 經 migration normalize 後必須保留正式 speed-aware sample",{owner:sampleVersion,battleSampleVersion:migrated?.offline?.battleSampleVersion,row});
 }catch(error){fail("OFFLINE_SAMPLE_MIGRATION_PROBE","離線 V3 sample migration 回歸檢查失敗",String(error?.message||error));}
 if(Number(window.GM_BACKGROUND_BATTLE_ALL_COMBAT_GATE_VERSION)!==1||Number(window.VOID_BACKGROUND_GM_GATE_VERSION)!==1)fail("BACKGROUND_GM_GATE","GM 背景戰鬥開關應統一控制 main／void／calamity",{gm:window.GM_BACKGROUND_BATTLE_ALL_COMBAT_GATE_VERSION,void:window.VOID_BACKGROUND_GM_GATE_VERSION});
 if(Number(window.GM_DATA_MANAGEMENT_VERSION)!==1||typeof window.gmExportSaveJson!=="function"||typeof window.gmChooseImportSaveJson!=="function"||typeof window.gmValidateImportedSave!=="function")fail("GM_DATA_MANAGEMENT","GM JSON 資料管理模組未完整載入",{version:window.GM_DATA_MANAGEMENT_VERSION,exportApi:typeof window.gmExportSaveJson,importApi:typeof window.gmChooseImportSaveJson,validateApi:typeof window.gmValidateImportedSave});
 if(Number(window.GM_HUB_EXTENSION_VERSION)!==7||Number(window.GM_HUB_REGISTRY_VERSION)!==1||typeof window.registerGmHubSection!=="function"||typeof window.gmHubRegisteredSectionsHtml!=="function"||typeof window.gmHubRegisteredSectionIds!=="function")fail("GM_HUB_REGISTRY","GM Hub 統一 section registry 未完整載入",{extension:window.GM_HUB_EXTENSION_VERSION,registry:window.GM_HUB_REGISTRY_VERSION,register:typeof window.registerGmHubSection,render:typeof window.gmHubRegisteredSectionsHtml,ids:typeof window.gmHubRegisteredSectionIds});
 if(Number(window.GM_GEAR_LEVEL_INPUT_VERSION)!==1)fail("GM_GEAR_LEVEL_INPUT","GM 產生裝備等級應使用可擴充數字輸入",window.GM_GEAR_LEVEL_INPUT_VERSION);
 if(Number(window.BATCH5_CLOCK_CACHE_VERSION)!==1)fail("DAILY_CLOCK_CACHE","每日時鐘 DOM 快取版本異常",window.BATCH5_CLOCK_CACHE_VERSION);
 if(typeof window.gmHubRegisteredSectionIds==="function"){
  const manageExpected=["gm-data-management","gm-background-battle","gm-combat-speed","general-manage","spec-manage","enhancement-manage","marks-manage","dungeon-manage"];
  const testExpected=["vip-test","spec-test","enhancement-test","marks-test","power-benchmark-test","map-test","special-test","bounty-test","arena-test","void-test","mirror-test","calamity-test","player-title-preview","gm-story-test"];
  const manageIds=window.gmHubRegisteredSectionIds("manage"),testIds=window.gmHubRegisteredSectionIds("test");
  if(JSON.stringify(manageIds)!==JSON.stringify(manageExpected))fail("GM_HUB_MANAGE_ORDER","GM 管理 section 註冊／排序異常",{expected:manageExpected,actual:manageIds});
  if(JSON.stringify(testIds)!==JSON.stringify(testExpected))fail("GM_HUB_TEST_ORDER","GM 測試 section 註冊／排序異常",{expected:testExpected,actual:testIds});
 }
 if(Number(window.GM_TEST_STATE_VERSION)!==1||Number(window.GM_ENHANCEMENT_TEST_PIPELINE_VERSION)!==6||Number(window.GM_ENHANCEMENT_TEST_RANGE_VERSION)!==1||Number(window.GM_ENHANCEMENT_HUB_VERSION)!==5||Number(window.GM_ENHANCEMENT_FORMAL_RANGE_VERSION)!==1||typeof window.gmRefreshTestControls!=="function"||typeof window.gmTestEnhancementSlots!=="function"||typeof window.gmClampTestEnhancementLevel!=="function"||typeof window.gmUseCurrentTestStatus!=="function")fail("GM_TEST_STATE_OWNER","GM 共用測試狀態 owner／正式與沙盒強化範圍未完整載入",{stateVersion:window.GM_TEST_STATE_VERSION,pipeline:window.GM_ENHANCEMENT_TEST_PIPELINE_VERSION,testRange:window.GM_ENHANCEMENT_TEST_RANGE_VERSION,hub:window.GM_ENHANCEMENT_HUB_VERSION,formalRange:window.GM_ENHANCEMENT_FORMAL_RANGE_VERSION,refresh:typeof window.gmRefreshTestControls,slots:typeof window.gmTestEnhancementSlots,clamp:typeof window.gmClampTestEnhancementLevel,sync:typeof window.gmUseCurrentTestStatus});
 if(Number(window.GM_POWER_BENCHMARK_VERSION)!==16||Number(window.GM_POWER_BENCHMARK_ENHANCEMENT_RANGE_VERSION)!==1||Number(window.GM_POWER_BENCHMARK_SPECIALIZATION_WORLD_VERSION)!==1||Number(window.GM_POWER_BENCHMARK_BATCH_SIZE)!==25||typeof window.gmPowerBenchmarkSetWorld!=="function"||typeof window.gmPowerBenchmarkSelectedEnemy!=="function"||typeof window.gmPowerBenchmarkRunOutput!=="function"||typeof window.gmPowerBenchmarkRunDefense!=="function"||typeof window.gmPowerBenchmarkRunCombat!=="function"||typeof window.gmPowerBenchmarkSetUniverseRegion!=="function"||typeof window.gmPowerBenchmarkSetUniverseBoss!=="function"||typeof window.gmPowerBenchmarkIsBusy!=="function"||typeof window.gmPowerBenchmarkSummaryText!=="function"||typeof window.gmPowerBenchmarkCopySummary!=="function"||typeof window.gmPowerBenchmarkReset!=="function"||typeof window.gmPowerBenchmarkRunUniverseCombat!=="undefined")fail("GM_POWER_BENCHMARK","GM 戰力基準測試 V16／宇宙 +40 強化與專精世界語意未完整載入",{version:window.GM_POWER_BENCHMARK_VERSION,enhancementRange:window.GM_POWER_BENCHMARK_ENHANCEMENT_RANGE_VERSION,specializationWorld:window.GM_POWER_BENCHMARK_SPECIALIZATION_WORLD_VERSION,batch:window.GM_POWER_BENCHMARK_BATCH_SIZE,world:typeof window.gmPowerBenchmarkSetWorld,selectedEnemy:typeof window.gmPowerBenchmarkSelectedEnemy,output:typeof window.gmPowerBenchmarkRunOutput,defense:typeof window.gmPowerBenchmarkRunDefense,combat:typeof window.gmPowerBenchmarkRunCombat,universeRegion:typeof window.gmPowerBenchmarkSetUniverseRegion,universeBoss:typeof window.gmPowerBenchmarkSetUniverseBoss,legacyUniverse:typeof window.gmPowerBenchmarkRunUniverseCombat,busy:typeof window.gmPowerBenchmarkIsBusy});
 if(Number(window.BACKGROUND_PROGRESS_CORE_VERSION)!==1||Number(window.MAIN_BATTLE_BACKGROUND_LIFECYCLE_VERSION)!==1)fail("BACKGROUND_LIFECYCLE_OWNER","background engine／主線 lifecycle owner 異常",{core:window.BACKGROUND_PROGRESS_CORE_VERSION,main:window.MAIN_BATTLE_BACKGROUND_LIFECYCLE_VERSION});
 if(Number(window.BACKGROUND_PROGRESS_SINGLE_ACTIVE_FLOW_VERSION)!==1||Number(window.BACKGROUND_PROGRESS_UI_YIELD_VERSION)!==3||Number(window.BACKGROUND_PROGRESS_FAST_CATCH_UP_VERSION)!==1||Number(window.BACKGROUND_PROGRESS_FAST_YIELDS_PER_PAINT)!==8||typeof window.backgroundProgressActiveKind!=="function")fail("BACKGROUND_FLOW_POLICY","背景進度應採 single-active-flow＋快速逐場 catch-up／週期 paint",{single:window.BACKGROUND_PROGRESS_SINGLE_ACTIVE_FLOW_VERSION,yield:window.BACKGROUND_PROGRESS_UI_YIELD_VERSION,fast:window.BACKGROUND_PROGRESS_FAST_CATCH_UP_VERSION,every:window.BACKGROUND_PROGRESS_FAST_YIELDS_PER_PAINT,activeKind:typeof window.backgroundProgressActiveKind});
 if(Number(window.BACKGROUND_PROGRESS_FAST_CATCH_UP_POLICY_VERSION)!==1||window.BACKGROUND_PROGRESS_FAST_CATCH_UP_POLICY_INTEGRITY?.passed!==true||typeof window.backgroundProgressFastCatchUpActive!=="function"||typeof window.backgroundProgressCatchUpPolicy!=="function"||typeof window.backgroundProgressCatchUpStep!=="function"||typeof window.backgroundProgressCatchUpFinalPolicy!=="function"||typeof window.backgroundProgressConsumeCatchUpCredit!=="function")fail("BACKGROUND_FAST_CATCH_UP_POLICY","共用 Fast Catch-up Policy owner 未完整載入",{version:window.BACKGROUND_PROGRESS_FAST_CATCH_UP_POLICY_VERSION,integrity:window.BACKGROUND_PROGRESS_FAST_CATCH_UP_POLICY_INTEGRITY});
 if(Number(window.SECOND_WORLD_ATOMIC_SETTLEMENT_VERSION)!==1||Number(window.SECOND_WORLD_FAST_CATCH_UP_ATOMIC_SAVE_POLICY_VERSION)!==1)fail("SECOND_WORLD_ATOMIC_SAVE_POLICY","宇宙主線 Fast Catch-up 必須保留逐場 atomic settlement/save rollback",{settlement:window.SECOND_WORLD_ATOMIC_SETTLEMENT_VERSION,catchUp:window.SECOND_WORLD_FAST_CATCH_UP_ATOMIC_SAVE_POLICY_VERSION});
 if(Number(window.SECOND_WORLD_SPECIALIZATION_ECONOMY_VERSION)!==1||Number(window.SECOND_WORLD_GM_SPECIALIZATION_SEMANTICS_VERSION)!==1)fail("SECOND_WORLD_SPECIALIZATION_OWNER","宇宙專精 EXP／暗物質／出售與 GM 語意 owner 未完整載入",{economy:window.SECOND_WORLD_SPECIALIZATION_ECONOMY_VERSION,gm:window.SECOND_WORLD_GM_SPECIALIZATION_SEMANTICS_VERSION});
 if(Number(window.MAIN_BATTLE_FAST_CATCH_UP_POLICY_VERSION)!==1||Number(window.SECOND_WORLD_FAST_CATCH_UP_POLICY_VERSION)!==1||Number(window.CALAMITY_FAST_CATCH_UP_POLICY_VERSION)!==1||Number(window.CALAMITY_FAST_CATCH_UP_UI_VERSION)!==1||Number(window.VOID_MIRAGE_FAST_CATCH_UP_POLICY_VERSION)!==1||Number(window.VOID_FAST_CATCH_UP_UI_VERSION)!==1)fail("BACKGROUND_FAST_CATCH_UP_COVERAGE","main／universe／calamity／void 應全部接入共用 Fast Catch-up Policy",{main:window.MAIN_BATTLE_FAST_CATCH_UP_POLICY_VERSION,universe:window.SECOND_WORLD_FAST_CATCH_UP_POLICY_VERSION,calamity:window.CALAMITY_FAST_CATCH_UP_POLICY_VERSION,calamityUi:window.CALAMITY_FAST_CATCH_UP_UI_VERSION,void:window.VOID_MIRAGE_FAST_CATCH_UP_POLICY_VERSION,voidUi:window.VOID_FAST_CATCH_UP_UI_VERSION});
 if(Number(window.COMBAT_OUTER_PACING_VERSION)!==2||Number(window.COMBAT_OUTER_GAP_MS)!==140||typeof window.combatOuterGapMs!=="function"||["main","bounty","arena","mirror","void","calamity"].some(mode=>Number(window.combatOuterGapMs(mode))!==140))fail("COMBAT_OUTER_PACING_OWNER","戰鬥外場間節奏 owner 異常",{version:window.COMBAT_OUTER_PACING_VERSION,gap:window.COMBAT_OUTER_GAP_MS});
 if(Number(window.MAIN_BATTLE_PACING_VERSION)!==2||Number(window.MAIN_BATTLE_FLOW_SLEEP_VERSION)!==1||typeof window.mainBattleFlowSleep!=="function"||typeof window.mainBattlePresentationSleep!=="function")fail("MAIN_FLOW_PACING_OWNER","主線 flow/presentation sleep owner 異常",{pacing:window.MAIN_BATTLE_PACING_VERSION,flow:window.MAIN_BATTLE_FLOW_SLEEP_VERSION,flowApi:typeof window.mainBattleFlowSleep,presentationApi:typeof window.mainBattlePresentationSleep});
 if(Number(window.SPECIAL_ENCOUNTER_FLOW_PACING_VERSION)!==1)fail("SPECIAL_FLOW_PACING_OWNER","特殊遭遇流程等待應使用明確 flow pacing owner",window.SPECIAL_ENCOUNTER_FLOW_PACING_VERSION);
 if(typeof window.estimateMainBattleDurationMs==="function")fail("LEGACY_MAIN_DURATION_ESTIMATOR","舊主線動畫 duration estimator 應已退休");
 if(typeof window.CALAMITY_CONTINUOUS_GAP_MS!=="undefined")fail("LEGACY_CALAMITY_GAP_OWNER","舊 CALAMITY_CONTINUOUS_GAP_MS 應已退休");
 if(typeof window.BACKGROUND_PROGRESS_MAIN_SHARED_VERSION!=="undefined"||typeof window.BACKGROUND_PROGRESS_GM_GATE_VERSION!=="undefined"||typeof window.backgroundProgressMainBattleMode==="function"||typeof window.backgroundProgressMainBattleAllowsBackground==="function")fail("BACKGROUND_LEGACY_MAIN_WRAPPER","backgroundprogress 主線專屬 wrapper／gate API 應已退休");
  if(Number(window.SPECIAL_ENEMY_SHARED_HELPERS_VERSION)!==1||typeof window.specialRateFromPlayer!=="function"||typeof window.rollUniqueMonsterTraits!=="function")fail("SPECIAL_ENEMY_SHARED_HELPERS","特殊敵人共用 rate／trait helper 異常",{version:window.SPECIAL_ENEMY_SHARED_HELPERS_VERSION});
 if(Number(window.BOUNTY_BALANCE_VERSION)!==1||Number(window.BOUNTY_DIFFICULTY_FORMULA_VERSION)!==1||Number(window.BOUNTY_TIER_META_VERSION)!==1)fail("BOUNTY_BALANCE_VERSION","懸賞戰 Balance V1／Difficulty Formula V1／Tier Meta V1 異常",{balance:window.BOUNTY_BALANCE_VERSION,formula:window.BOUNTY_DIFFICULTY_FORMULA_VERSION,meta:window.BOUNTY_TIER_META_VERSION});
 if(typeof window.getBountyTierMeta!=="function"||typeof window.getBountyTierMetadata!=="function")fail("BOUNTY_TIER_META_API","缺少懸賞戰 Tier Metadata 正式 API");
 if(typeof window.getBountyDifficultyProfile!=="function")fail("BOUNTY_DIFFICULTY_API","缺少懸賞戰難度公式正式 API");
 else{
  const bountyProfiles=["normal","high","danger"].map(id=>window.getBountyDifficultyProfile(id));
  if(bountyProfiles.some(v=>!v||![v.hpMul,v.damageMul,v.defMul,v.critScale,v.dodgeScale].every(Number.isFinite)))fail("BOUNTY_DIFFICULTY_DATA","懸賞戰三檔公式資料異常",bountyProfiles);
  if(!(bountyProfiles[0].hpMul<bountyProfiles[1].hpMul&&bountyProfiles[1].hpMul<bountyProfiles[2].hpMul&&bountyProfiles[0].damageMul<bountyProfiles[1].damageMul&&bountyProfiles[1].damageMul<bountyProfiles[2].damageMul&&bountyProfiles[0].defMul<bountyProfiles[1].defMul&&bountyProfiles[1].defMul<bountyProfiles[2].defMul))fail("BOUNTY_DIFFICULTY_CURVE","懸賞戰普通／高級／危險實體能力必須逐檔提高",bountyProfiles);
 }
 if(!arenaVersions||Number(window.ARENA_BALANCE_VERSION)!==Number(arenaVersions.balanceVersion)||Number(window.ARENA_RANK_BALANCE_VERSION)!==Number(arenaVersions.rankBalanceVersion))fail("ARENA_BALANCE_VERSION","競技場 Balance／Rank Balance 與統一版本 profile 不一致",{balance:window.ARENA_BALANCE_VERSION,rankBalance:window.ARENA_RANK_BALANCE_VERSION,profile:arenaVersions});
 if(!window.ARENA_RANK_CURVE||!["hp","damage","def"].every(key=>Number.isFinite(Number(window.ARENA_RANK_CURVE?.[key]?.linear))&&Number.isFinite(Number(window.ARENA_RANK_CURVE?.[key]?.quadratic))))fail("ARENA_RANK_CURVE_CONFIG","競技場階級公式設定異常",window.ARENA_RANK_CURVE);
 if(Number(window.ARENA_POSITION_API_VERSION)!==1||Number(window.ARENA_ENEMY_PROFILE_VERSION)!==1||Number(window.ARENA_PRESENTATION_PACING_SOURCE_VERSION)!==1)fail("ARENA_POSITION_PROFILE_VERSION","競技場 Position／Enemy Profile／Pacing Source 版本異常",{positionApi:window.ARENA_POSITION_API_VERSION,profile:window.ARENA_ENEMY_PROFILE_VERSION,pacing:window.ARENA_PRESENTATION_PACING_SOURCE_VERSION});
 if(typeof window.getArenaPositionConfigs!=="function"||typeof window.getArenaEnemyProfile!=="function")fail("ARENA_POSITION_PROFILE_API","缺少競技場 Position／Enemy Profile 正式 API");
 else{
  const positions=window.getArenaPositionConfigs(6);
  if(!Array.isArray(positions)||positions.length!==3)fail("ARENA_POSITION_CONFIGS","競技場 Position 設定應固定為 3 組",positions);
  const expected={normal:{hp:1,damage:1,def:1},hard:{hp:.96,damage:.96,def:.98},extreme:{hp:.90,damage:.92,def:.96}};
  ["normal","hard","extreme"].forEach(id=>{
   const row=positions.find(x=>x?.id===id),physical=row?.positionPhysical||{};
   if(!row||Math.abs(Number(physical.hp)-expected[id].hp)>1e-9||Math.abs(Number(physical.damage)-expected[id].damage)>1e-9||Math.abs(Number(physical.def)-expected[id].def)>1e-9)fail("ARENA_POSITION_PHYSICAL","競技場 Position 歷史物理倍率被意外改動",{id,row});
   const profile=window.getArenaEnemyProfile(6,id,2);
   if(!profile||profile.positionId!==id||profile.stageIndex!==2||![profile.finalPhysical?.hpMul,profile.finalPhysical?.damageMul,profile.finalPhysical?.defMul,profile.critScale,profile.dodgeScale].every(Number.isFinite))fail("ARENA_ENEMY_PROFILE","競技場 Enemy Profile 輸出異常",{id,profile});
  });
 }
  if(typeof window.getArenaRankMultipliers!=="function")fail("ARENA_RANK_MULTIPLIERS_API","缺少競技場階級倍率正式 API");
 else{
  const ranks=Array.from({length:10},(_,i)=>window.getArenaRankMultipliers(i+1));
  if(ranks.some(v=>!v||![v.hp,v.damage,v.def].every(Number.isFinite)))fail("ARENA_RANK_MULTIPLIERS_DATA","競技場 1～10 階倍率資料異常",ranks);
  for(let i=1;i<ranks.length;i++){
   if(ranks[i].hp<=ranks[i-1].hp||ranks[i].damage<=ranks[i-1].damage||ranks[i].def<=ranks[i-1].def){fail("ARENA_RANK_CURVE","競技場 1～10 階倍率必須逐階提高",ranks);break;}
  }
 }
 if(state?.dungeon?.arena&&typeof window.ensureDungeonState==="function"){
  const arenaRef=state.dungeon.arena;
  window.ensureDungeonState();
  if(state.dungeon.arena!==arenaRef)fail("ARENA_REFERENCE","競技場 normalize 重新替換了 arena 物件參照");
 }
 if(state&&typeof window.ensureDailyState==="function"){
  const daily=window.ensureDailyState();
  if(!daily||daily.dateKey!==window.gameDailyDateKey())fail("DAILY_STATE","每日狀態日期未正確同步",daily);
  const voidDaily=typeof window.voidMirageDailyStatus==="function"?window.voidMirageDailyStatus():null;
  if(!voidDaily||!Number.isFinite(Number(voidDaily.highestFloor))||Number(voidDaily.highestFloor)<0)fail("VOID_DAILY_STATE","虛空幻境當日最高層狀態異常",voidDaily);
 }

 if(typeof window.getArenaDifficultyConfigs==="function")fail("ARENA_LEGACY_DIFFICULTY_CONFIG_API","退休的 getArenaDifficultyConfigs 不應恢復");
 if(typeof window.getArenaPositionDifficultyId==="function")fail("ARENA_LEGACY_POSITION_DIFFICULTY_API","退休的 getArenaPositionDifficultyId 不應恢復");
 if(typeof window.getBountyTierConfig==="function"||typeof window.getBountyTierConfigs==="function")fail("BOUNTY_LEGACY_TIER_CONFIG_API","退休的 Bounty Tier Config 舊 API 不應恢復");
  if(typeof window.getArenaDifficultyConfigs==="function")fail("ARENA_LEGACY_DIFFICULTY_CONFIG_API","退休的 getArenaDifficultyConfigs 不應恢復");
 if(typeof window.getArenaPositionDifficultyId==="function")fail("ARENA_LEGACY_POSITION_DIFFICULTY_API","退休的 getArenaPositionDifficultyId 不應恢復");
 if(typeof window.getBountyTierConfig==="function"||typeof window.getBountyTierConfigs==="function")fail("BOUNTY_LEGACY_TIER_CONFIG_API","退休的 Bounty Tier Config 舊 API 不應恢復");
  const report={passed:errors.length===0,clean:errors.length===0&&warnings.length===0,errors,warnings,checkedAt:Date.now()};
 window.PROJECT_RUNTIME_REPORT=report;
 if(errors.length)console.error("[文明戰線] Runtime integrity error",errors);
 else if(warnings.length)console.warn("[文明戰線] Runtime integrity warning",warnings);
})();