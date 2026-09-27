(function(){
 const VERSION=5;
 const DATA_VERSION=3;
 const COMBAT_VERSION=1;
 const PROGRESSION_VERSION=1;
 const RUN_VERSION=5;
 function freezeReport(version,errors){return Object.freeze({version,passed:errors.length===0,errors:Object.freeze(errors.slice())});}
 function dataReport(){
  const errors=[];
  if(Number(window.SAVE_SCHEMA_VERSION)!==16)errors.push({code:"THIRD_WORLD_SCHEMA_DRIFT",expected:16,actual:Number(window.SAVE_SCHEMA_VERSION)||0});
  if(Number(window.THIRD_WORLD_PHASE_VERSION)!==5)errors.push({code:"THIRD_WORLD_PHASE_VERSION",actual:window.THIRD_WORLD_PHASE_VERSION});
  if(Number(window.THIRD_WORLD_CORE_PROGRESS_NORMALIZATION_VERSION)!==2||typeof window.normalizeThirdWorldCoreInvestment!=="function")errors.push({code:"THIRD_WORLD_CORE_PROGRESS_NORMALIZATION_OWNER",version:window.THIRD_WORLD_CORE_PROGRESS_NORMALIZATION_VERSION,api:typeof window.normalizeThirdWorldCoreInvestment});
  if(Number(window.THIRD_WORLD_CORE_RECONCILIATION_VERSION)!==1||typeof window.reconcileThirdWorldCoreProgressionState!=="function")errors.push({code:"THIRD_WORLD_CORE_RECONCILIATION_OWNER",version:window.THIRD_WORLD_CORE_RECONCILIATION_VERSION,api:typeof window.reconcileThirdWorldCoreProgressionState});
  if(window.THIRD_WORLD_DATA_INTEGRITY?.passed!==true)errors.push({code:"THIRD_WORLD_DATA_INTEGRITY",report:window.THIRD_WORLD_DATA_INTEGRITY||null});
  const migration=window.SAVE_THIRD_WORLD_BOSS_MIGRATION_REGRESSION_REPORT;
  if(migration?.passed!==true)errors.push({code:"THIRD_WORLD_BOSS_MIGRATION_REGRESSION",report:migration||null});
  if(migration?.preSchema16Policy!=="discard-development-data"||Number(migration?.preSchema16PolicyRegressionVersion)!==1||Number(migration?.transientDropRegressionVersion)!==1||Number(migration?.coreReconciliationRegressionVersion)!==1||Number(migration?.coreProgressRegressionVersion)!==2)errors.push({code:"THIRD_WORLD_LEGACY_DATA_POLICY",report:migration||null});
  if(Number(window.THIRD_WORLD_PRE_SCHEMA16_DISCARD_VERSION)!==1)errors.push({code:"THIRD_WORLD_PRE_SCHEMA16_DISCARD_OWNER",actual:window.THIRD_WORLD_PRE_SCHEMA16_DISCARD_VERSION});
  const authority=window.THIRD_WORLD_CHALLENGE_AUTHORITY,policy=window.THIRD_WORLD_SNAPSHOT_USAGE_POLICY;
  if(authority?.decisionField!=="allowed"||authority?.gapField!=="gapHp"||authority?.thresholdField!=="fivePointHpGap"||authority?.displayOnlyFields?.includes("gapPoints")!==true)errors.push({code:"THIRD_WORLD_FIVE_POINT_AUTHORITY",authority:authority||null});
  if(policy?.resolveAtBattleStart!==true||policy?.reuseDuringCombatRun!==true||policy?.refreshAfterSettlement!==true||policy?.globalCache!==false||policy?.combatTickRecompute!==false)errors.push({code:"THIRD_WORLD_SNAPSHOT_USAGE_POLICY",policy:policy||null});
  return freezeReport(DATA_VERSION,errors);
 }
 function combatReport(){
  const errors=[];
  if(window.THIRD_WORLD_COMBAT_SAVE_SCHEMA_BUMP_REQUIRED!==false)errors.push({code:"THIRD_WORLD_COMBAT_SCHEMA_BUMP_POLICY",value:window.THIRD_WORLD_COMBAT_SAVE_SCHEMA_BUMP_REQUIRED});
  if(window.THIRD_WORLD_COMBAT_INTEGRITY_SUMMARY?.passed!==true)errors.push({code:"THIRD_WORLD_COMBAT_INTEGRITY_SUMMARY",report:window.THIRD_WORLD_COMBAT_INTEGRITY_SUMMARY||null});
  if(window.THIRD_WORLD_COMBAT_SAVE_GUARD_REPORT?.passed!==true)errors.push({code:"THIRD_WORLD_COMBAT_SAVE_GUARD",report:window.THIRD_WORLD_COMBAT_SAVE_GUARD_REPORT||null});
  const publicApis=Array.from(window.THIRD_WORLD_COMBAT_PUBLIC_APIS||[]),requiredPublic=["createThirdWorldBossCombatSnapshot","thirdWorldSettlementBasisFromResult","canRunThirdWorldBossCombat","runThirdWorldBossCombat"];
  if(JSON.stringify(publicApis)!==JSON.stringify(requiredPublic))errors.push({code:"THIRD_WORLD_COMBAT_PUBLIC_API_POLICY",publicApis});
  Array.from(window.THIRD_WORLD_COMBAT_RETIRED_APIS||[]).forEach(name=>{if(typeof window[name]!=="undefined")errors.push({code:"THIRD_WORLD_COMBAT_PRIVATE_API_LEAK",name});});
  if(window.MARK_CORE_INTEGRITY?.passed!==true)errors.push({code:"MARK_CORE_INTEGRITY",report:window.MARK_CORE_INTEGRITY||null});
  if(Number(window.markMaxLevel?.())!==Number(window.MARK_MAX_LEVEL))errors.push({code:"THIRD_WORLD_MARK_MAX_OWNER",markMaxLevel:typeof window.markMaxLevel==="function"?window.markMaxLevel():null,constant:window.MARK_MAX_LEVEL});
  if(window.specializationCombatRuleSnapshot?.()!==window.COMBAT_STANDARD_ABILITY_RULES)errors.push({code:"THIRD_WORLD_SPECIALIZATION_COMBAT_RULE_OWNER"});
  const actionSafety=window.COMBAT_ACTION_SAFETY_RULES;
  if(!(Number(actionSafety?.maxActionsPerRun)>0)||!(Number(actionSafety?.maxActionsPerChain)>0)||Number(actionSafety?.maxActionsPerChain)>Number(actionSafety?.maxActionsPerRun))errors.push({code:"THIRD_WORLD_COMBAT_ACTION_SAFETY",rules:actionSafety||null});
  const settlementAuthority=window.THIRD_WORLD_SETTLEMENT_AUTHORITY;
  if(settlementAuthority?.field!=="settlementBasis"||settlementAuthority?.version!==1||settlementAuthority?.topLevelSettlementFields!=="convenience-only"||settlementAuthority?.combat!=="diagnostic-only"||settlementAuthority?.snapshot!=="diagnostic-only")errors.push({code:"THIRD_WORLD_SETTLEMENT_AUTHORITY",authority:settlementAuthority||null});
  return freezeReport(COMBAT_VERSION,errors);
 }
 function progressionReport(){
  const errors=[];
  if(window.SETTLEMENT_TRANSACTION_INTEGRITY?.passed!==true)errors.push({code:"SHARED_SETTLEMENT_TRANSACTION",report:window.SETTLEMENT_TRANSACTION_INTEGRITY||null});
  if(Number(window.SETTLEMENT_TRANSACTION_INTEGRITY?.rollbackIdentityVersion)!==1||Number(window.SETTLEMENT_TRANSACTION_INTEGRITY?.nestedReferenceVersion)!==1)errors.push({code:"SHARED_SETTLEMENT_ROLLBACK_IDENTITY",report:window.SETTLEMENT_TRANSACTION_INTEGRITY||null});
  if(window.EQUIPMENT_REWARD_CORE_INTEGRITY?.passed!==true||Number(window.EQUIPMENT_REWARD_CORE_INTEGRITY?.rngPipelineVersion)!==1||Number(window.EQUIPMENT_REWARD_CORE_INTEGRITY?.metadataOwnerVersion)!==1)errors.push({code:"SHARED_EQUIPMENT_REWARD_CORE",report:window.EQUIPMENT_REWARD_CORE_INTEGRITY||null});
  if(window.THIRD_WORLD_EQUIPMENT_REWARD_INTEGRITY?.passed!==true||Number(window.THIRD_WORLD_EQUIPMENT_REWARD_INTEGRITY?.deterministicVersion)!==1||Number(window.THIRD_WORLD_EQUIPMENT_REWARD_INTEGRITY?.metadataOwnerVersion)!==1)errors.push({code:"THIRD_WORLD_EQUIPMENT_REWARD",report:window.THIRD_WORLD_EQUIPMENT_REWARD_INTEGRITY||null});
  const lootPolicy=window.THIRD_WORLD_EQUIPMENT_BASE_POLICY;
  if(lootPolicy?.legendaryChance!==.95||lootPolicy?.mythicChance!==.05||lootPolicy?.baseDropCount!==1||lootPolicy?.levelSource!=="player-current"||lootPolicy?.saleResource!=="none"||lootPolicy?.vipLootPrivileges!==true)errors.push({code:"THIRD_WORLD_EQUIPMENT_POLICY",policy:lootPolicy||null});
  if(typeof window.sharedEquipmentTypes!=="function"||typeof window.sharedEquipmentTypeLabel!=="function")errors.push({code:"SHARED_EQUIPMENT_METADATA_API"});
  if(typeof window.equipmentSaleQuote!=="function")errors.push({code:"THIRD_WORLD_ZERO_SALE_OWNER_MISSING"});
  else{const sale=window.equipmentSaleQuote({world:3,level:1350,q:5,sell:999},{state:{secondWorld:{entered:true},thirdWorld:{entered:true}}});if(sale?.currency!=="none"||Number(sale?.amount)!==0||Number(sale?.gold)!==0||Number(sale?.darkMatter)!==0||Number(sale?.darkEnergy)!==0)errors.push({code:"THIRD_WORLD_ZERO_SALE_POLICY",sale});}
  if(window.LEVEL_PROGRESSION_INTEGRITY?.passed!==true)errors.push({code:"LEVEL_PROGRESSION_INTEGRITY",report:window.LEVEL_PROGRESSION_INTEGRITY||null});
  if(window.THIRD_WORLD_PROGRESS_INTEGRITY?.passed!==true)errors.push({code:"THIRD_WORLD_PROGRESS_INTEGRITY",report:window.THIRD_WORLD_PROGRESS_INTEGRITY||null});
  if(window.PLAYER_TITLE_INTEGRITY?.passed!==true||Number(window.PLAYER_TITLE_INTEGRITY?.thirdWorldBackfillRegressionVersion)!==1)errors.push({code:"THIRD_WORLD_TITLE_BACKFILL_REGRESSION",report:window.PLAYER_TITLE_INTEGRITY||null});
  const higherDefs=Array.from(window.THIRD_WORLD_PLAYER_TITLE_DEFS||[]),sourceDefs=Array.from(window.THIRD_WORLD_TITLE_DEFINITIONS||[]);
  if(higherDefs.length!==10||sourceDefs.length!==10||higherDefs.some((def,index)=>def.id!==sourceDefs[index]?.id||def.tier!==index+1||def.series!=="higher-dimensional"))errors.push({code:"THIRD_WORLD_TITLE_CATALOG",higherDefs});
  if(Number(window.PLAYER_TITLE_CATALOG_VERSION)!==3||Number(window.PLAYER_TITLE_CANONICAL_CATALOG_VERSION)!==2||Number(window.PLAYER_TITLE_THIRD_WORLD_CATALOG_EXTENSION_VERSION)!==1||Array.from(window.PLAYER_TITLE_DEFS||[]).length!==36)errors.push({code:"THIRD_WORLD_TITLE_SHARED_CATALOG",catalog:window.PLAYER_TITLE_CATALOG_VERSION,canonical:window.PLAYER_TITLE_CANONICAL_CATALOG_VERSION,extension:window.PLAYER_TITLE_THIRD_WORLD_CATALOG_EXTENSION_VERSION,count:Array.from(window.PLAYER_TITLE_DEFS||[]).length});
  if(window.SECOND_WORLD_REWARD_INTEGRITY?.passed!==true)errors.push({code:"SECOND_WORLD_REWARD_INTEGRITY",report:window.SECOND_WORLD_REWARD_INTEGRITY||null});
  if(Number(window.SECOND_WORLD_SHARED_SETTLEMENT_TRANSACTION_VERSION)!==1)errors.push({code:"SECOND_WORLD_SHARED_SETTLEMENT_TRANSACTION",actual:window.SECOND_WORLD_SHARED_SETTLEMENT_TRANSACTION_VERSION});
  return freezeReport(PROGRESSION_VERSION,errors);
 }
 function runReport(){
  const errors=[];
  if(window.THIRD_WORLD_RUN_INTEGRITY?.passed!==true)errors.push({code:"THIRD_WORLD_RUN_INTEGRITY",report:window.THIRD_WORLD_RUN_INTEGRITY||null});
  if(window.THIRD_WORLD_CORE_INTEGRITY?.passed!==true)errors.push({code:"THIRD_WORLD_CORE_INTEGRITY",report:window.THIRD_WORLD_CORE_INTEGRITY||null});
  if(window.CONTINUOUS_RUN_CROSS_ERA_INTEGRITY?.passed!==true||Number(window.CONTINUOUS_RUN_CROSS_ERA_INTEGRITY_VERSION)!==3)errors.push({code:"CROSS_ERA_CONTINUOUS_RUN_INTEGRITY",version:window.CONTINUOUS_RUN_CROSS_ERA_INTEGRITY_VERSION,report:window.CONTINUOUS_RUN_CROSS_ERA_INTEGRITY||null});
  if(Number(window.CONTINUOUS_RUN_INFRA_VERSION)!==1||window.CONTINUOUS_RUN_INFRA_INTEGRITY?.passed!==true)errors.push({code:"SHARED_CONTINUOUS_RUN_INFRA",version:window.CONTINUOUS_RUN_INFRA_VERSION,report:window.CONTINUOUS_RUN_INFRA_INTEGRITY||null});
  if(Number(window.CONTINUOUS_RUN_STOP_REASON_SEMANTICS_VERSION)!==2)errors.push({code:"SHARED_STOP_REASON_SEMANTICS",version:window.CONTINUOUS_RUN_STOP_REASON_SEMANTICS_VERSION});
  if(Number(window.CALAMITY_SHARED_CONTINUOUS_INFRA_VERSION)!==1||Number(window.SECOND_WORLD_CALAMITY_SHARED_CONTINUOUS_INFRA_VERSION)!==1||Number(window.THIRD_WORLD_RUN_SHARED_CONTINUOUS_INFRA_VERSION)!==1)errors.push({code:"THREE_ERA_SHARED_CONTINUOUS_INFRA",galaxy:window.CALAMITY_SHARED_CONTINUOUS_INFRA_VERSION,universe:window.SECOND_WORLD_CALAMITY_SHARED_CONTINUOUS_INFRA_VERSION,higher:window.THIRD_WORLD_RUN_SHARED_CONTINUOUS_INFRA_VERSION});
  if(Number(window.CALAMITY_SHARED_INFRA_STRICT_VERSION)!==1||Number(window.SECOND_WORLD_CALAMITY_SHARED_INFRA_STRICT_VERSION)!==1||Number(window.THIRD_WORLD_RUN_SHARED_INFRA_STRICT_VERSION)!==1)errors.push({code:"THREE_ERA_STRICT_SHARED_INFRA",galaxy:window.CALAMITY_SHARED_INFRA_STRICT_VERSION,universe:window.SECOND_WORLD_CALAMITY_SHARED_INFRA_STRICT_VERSION,higher:window.THIRD_WORLD_RUN_SHARED_INFRA_STRICT_VERSION});
  if(Number(window.CALAMITY_MANUAL_STOP_TERMINAL_VERSION)!==2||Number(window.SECOND_WORLD_CALAMITY_MANUAL_STOP_TERMINAL_VERSION)!==1)errors.push({code:"MANUAL_STOP_TERMINAL_POLICY",galaxy:window.CALAMITY_MANUAL_STOP_TERMINAL_VERSION,universe:window.SECOND_WORLD_CALAMITY_MANUAL_STOP_TERMINAL_VERSION});
  if(Number(window.CALAMITY_GLOBAL_RUN_MUTEX_VERSION)!==1||Number(window.SECOND_WORLD_CALAMITY_GLOBAL_RUN_MUTEX_VERSION)!==1)errors.push({code:"CROSS_ERA_RUN_MUTEX",galaxy:window.CALAMITY_GLOBAL_RUN_MUTEX_VERSION,universe:window.SECOND_WORLD_CALAMITY_GLOBAL_RUN_MUTEX_VERSION});
  if(Number(window.THIRD_WORLD_RUN_MAX_DEATHS)!==100||Number(window.THIRD_WORLD_SUPPRESSION_BASE_POINTS)!==.5||Number(window.THIRD_WORLD_CORE_SUPPRESSION_REDUCTION_PER_LEVEL)!==.04)errors.push({code:"THIRD_WORLD_SUPPRESSION_POLICY",maxDeaths:window.THIRD_WORLD_RUN_MAX_DEATHS,base:window.THIRD_WORLD_SUPPRESSION_BASE_POINTS,reduction:window.THIRD_WORLD_CORE_SUPPRESSION_REDUCTION_PER_LEVEL});
  if(Number(window.THIRD_WORLD_RUN_EVENT_PAUSE_VERSION)!==0||Number(window.THIRD_WORLD_RUN_EVENT_TERMINAL_VERSION)!==1||Number(window.THIRD_WORLD_RUN_LEGACY_EVENT_ACK_VERSION)!==1)errors.push({code:"THIRD_WORLD_PROGRESS_EVENT_TERMINAL",pause:window.THIRD_WORLD_RUN_EVENT_PAUSE_VERSION,terminal:window.THIRD_WORLD_RUN_EVENT_TERMINAL_VERSION,legacyAck:window.THIRD_WORLD_RUN_LEGACY_EVENT_ACK_VERSION});
  if(Number(window.THIRD_WORLD_CORE_PROGRESSION_VERSION)!==3||Number(window.THIRD_WORLD_CORE_UPGRADE_VERSION)!==1||Number(window.THIRD_WORLD_CORE_RUN_LOCK_VERSION)!==2||Number(window.THIRD_WORLD_CORE_TARGET_RUN_ISOLATION_VERSION)!==1||Number(window.THIRD_WORLD_CORE_INVESTMENT_NORMALIZATION_OWNER_VERSION)!==1||Number(window.THIRD_WORLD_CORE_COST_PER_LEVEL)!==1000000000)errors.push({code:"THIRD_WORLD_CORE_OWNER",progression:window.THIRD_WORLD_CORE_PROGRESSION_VERSION,upgrade:window.THIRD_WORLD_CORE_UPGRADE_VERSION,runLock:window.THIRD_WORLD_CORE_RUN_LOCK_VERSION,targetIsolation:window.THIRD_WORLD_CORE_TARGET_RUN_ISOLATION_VERSION,normalizationOwner:window.THIRD_WORLD_CORE_INVESTMENT_NORMALIZATION_OWNER_VERSION,cost:window.THIRD_WORLD_CORE_COST_PER_LEVEL});
  const sandboxCore=typeof window.thirdWorldCoreSnapshot==="function"?window.thirdWorldCoreSnapshot({thirdWorld:{entered:true,coreLevel:5,dimensionalStrings:2000000000}}):null;
  if(sandboxCore?.formalTarget!==false||sandboxCore?.runActive!==false)errors.push({code:"THIRD_WORLD_CORE_TARGET_ISOLATION",snapshot:sandboxCore});
  if(Number(window.THIRD_WORLD_RUN_CORE_SNAPSHOT_VERSION)!==1||Number(window.THIRD_WORLD_RUN_HP_LIFECYCLE_VERSION)!==1)errors.push({code:"THIRD_WORLD_RUN_SNAPSHOT_POLICY",coreSnapshot:window.THIRD_WORLD_RUN_CORE_SNAPSHOT_VERSION,hpLifecycle:window.THIRD_WORLD_RUN_HP_LIFECYCLE_VERSION});
  if(Number(window.THIRD_WORLD_RUN_LAST_FINISHED_SNAPSHOT_VERSION)!==1||Number(window.THIRD_WORLD_RUN_FORMAL_BATTLE_COUNT_VERSION)!==1||typeof window.thirdWorldLastFinishedRunSnapshot!=="function")errors.push({code:"THIRD_WORLD_RUN_RESULT_LIFECYCLE",lastFinished:window.THIRD_WORLD_RUN_LAST_FINISHED_SNAPSHOT_VERSION,battleCount:window.THIRD_WORLD_RUN_FORMAL_BATTLE_COUNT_VERSION,api:typeof window.thirdWorldLastFinishedRunSnapshot});
  if(Number(window.THIRD_WORLD_RUN_RECENT_HISTORY_LIMIT)!==20)errors.push({code:"THIRD_WORLD_RUN_HISTORY_LIMIT",actual:window.THIRD_WORLD_RUN_RECENT_HISTORY_LIMIT});
  if(window.thirdWorldSuppressionPerDeathPoints?.(0)!==.5||window.thirdWorldSuppressionPerDeathPoints?.(10)!==.1)errors.push({code:"THIRD_WORLD_SUPPRESSION_ENDPOINTS",lv0:window.thirdWorldSuppressionPerDeathPoints?.(0),lv10:window.thirdWorldSuppressionPerDeathPoints?.(10)});
  if(window.BACKGROUND_PROGRESS_FAST_CATCH_UP_POLICY_INTEGRITY?.passed!==true||typeof window.backgroundProgressFastCatchUpActive!=="function"||typeof window.backgroundProgressCatchUpStep!=="function"||typeof window.backgroundProgressCatchUpFinalPolicy!=="function"||typeof window.backgroundProgressConsumeCatchUpCredit!=="function"||typeof window.backgroundProgressUiYield!=="function")errors.push({code:"THIRD_WORLD_FAST_CATCH_UP_OWNER",report:window.BACKGROUND_PROGRESS_FAST_CATCH_UP_POLICY_INTEGRITY||null});
  if(typeof window.backgroundProgressActiveKind!=="function"||typeof window.worldTransitionRuntimeStatus!=="function"||typeof window.registerWorldTransitionRuntimeBlocker!=="function")errors.push({code:"THIRD_WORLD_ACTIVE_FLOW_GUARD_OWNER"});
  if(typeof window.backgroundProgressOnPageHide!=="function")errors.push({code:"THIRD_WORLD_SHARED_PAGEHIDE_OWNER"});
  const persistent=Array.from(window.THIRD_WORLD_PERSISTENT_KEYS||[]);
  if(["deaths","suppression","run","targetBossIndex","pendingEvents","recentBattles","lastBattleSummary","lastFinishedRun","lastFinishedRuntime","coreLevelAtStart","perDeathSuppressionPointsAtStart"].some(key=>persistent.includes(key)))errors.push({code:"THIRD_WORLD_RUN_PERSISTENCE_LEAK",persistent});
  return freezeReport(RUN_VERSION,errors);
 }
 function build(){const reports=Object.freeze({data:dataReport(),combat:combatReport(),progression:progressionReport(),run:runReport()});const errors=[];Object.entries(reports).forEach(([name,report])=>{if(report.passed!==true)errors.push({code:"THIRD_WORLD_SUBSYSTEM_FAILED",name,report});});return Object.freeze({version:VERSION,passed:errors.length===0,errors:Object.freeze(errors),reports});}
 window.THIRD_WORLD_SUBSYSTEM_INTEGRITY_VERSION=VERSION;
 window.THIRD_WORLD_DATA_SUBSYSTEM_INTEGRITY_VERSION=DATA_VERSION;
 window.THIRD_WORLD_COMBAT_SUBSYSTEM_INTEGRITY_VERSION=COMBAT_VERSION;
 window.THIRD_WORLD_PROGRESSION_SUBSYSTEM_INTEGRITY_VERSION=PROGRESSION_VERSION;
 window.THIRD_WORLD_RUN_SUBSYSTEM_INTEGRITY_VERSION=RUN_VERSION;
 window.THIRD_WORLD_SUBSYSTEM_INTEGRITY=build();
 if(!window.THIRD_WORLD_SUBSYSTEM_INTEGRITY.passed)console.error("[文明戰線] Third-world subsystem integrity error",window.THIRD_WORLD_SUBSYSTEM_INTEGRITY.errors);
})();