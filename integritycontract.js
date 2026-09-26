(function(){
 const VERSION=2;
 const EXPECTED_VERSIONS=Object.freeze({
  SAVE_SCHEMA_VERSION:16,
  SAVE_LOAD_PIPELINE_VERSION:2,
  SAVE_NORMALIZATION_PIPELINE_VERSION:1,
  SAVE_LEGACY_SUPPORT_POLICY_VERSION:1,
  SAVE_FUTURE_VERSION_GUARD_VERSION:1,
  OFFLINE_STATE_NORMALIZATION_VERSION:1,
  LEGACY_COMPATIBILITY_OWNER_VERSION:1,
  SCRIPT_LOAD_POLICY_VERSION:2,
  WORLD_PHASE_VERSION:4,
  WORLD_PHASE_PRIMARY_RESOURCE_VERSION:2,
  THIRD_WORLD_PHASE_VERSION:1,
  THIRD_WORLD_STATE_MIGRATION_VERSION:1,
  THIRD_WORLD_PHASE_INTEGRITY_VERSION:1,
  PLAYER_SEMANTICS_UI_VERSION:6,
  PLAYER_SEMANTICS_WORLD_PHASE_VERSION:1,
  LEVEL_PROGRESSION_AUDIT_VERSION:1,
  PLAYER_TITLE_CATALOG_VERSION:3,
  PLAYER_TITLE_INTEGRITY_VERSION:9,
  GM_PLAYER_TITLE_PREVIEW_INTEGRITY_VERSION:2,
  PLAYER_TITLE_UNIVERSE_VISUAL_INTEGRITY_VERSION:2,
  ARENA_BY_WORLD_STATE_VERSION:2,
  ARENA_BY_WORLD_MIGRATION_VERSION:1,
  SECOND_WORLD_ARENA_UNLOCK_VERSION:2,
  SECOND_WORLD_ARENA_RANK_CURVE_VERSION:2,
  SECOND_WORLD_CIVILIZATION_COMBAT_VERSION:2,
  BOUNTY_BALANCE_VERSION:2,
  BOUNTY_DIFFICULTY_FORMULA_VERSION:2,
  SECOND_WORLD_ADVENTURE_UI_VERSION:4,
  SECOND_WORLD_CALAMITY_FULL_INTEGRITY_VERSION:2,
  LEVEL_PROGRESSION_VERSION:1,
  VIP_PROGRESSION_VERSION:14,
  VIP_UNBOUNDED_LEVEL_VERSION:1,
  VIP_PERK_MAX_LEVEL:20,
  VIP_POINTS_SOURCE_OF_TRUTH_VERSION:1,
  VIP_STATE_RECONCILIATION_VERSION:1,
  VIP_ADD_POINTS_OWNER_REQUIRED_VERSION:1,
  VIP_UI_VERSION:2,
  GM_UNBOUNDED_VIP_TEST_VERSION:1,
  VIP_UNBOUNDED_INTEGRITY_VERSION:1,
  GAME_GUIDE_VERSION:19
 });
 const REQUIRED_APIS=Object.freeze([
  "normalizeSaveState","migrateSave","load","saveWriteGuardStatus","saveCompatibilityFor","assertSaveVersionSupported","normalizeOfflineSaveState",
  "currentWorldPhase","worldProgressionEnabled","worldPhaseSnapshot","primaryWorldResourceSnapshot","scriptLoadGroupFor",
  "createBlankThirdWorldState","normalizeThirdWorldState","thirdWorldState",
  "normalizePlayerTitleState","playerIdentityNameHtml","equipPlayerTitle",
  "getArenaProgressForWorld","getCurrentArenaProgress","getArenaVersionProfile",
  "effectiveLevelCap","effectiveExpNeed","levelProgressionAudit",
  "civilizationCombatDamageMultiplier","secondWorldBossBaseStats","runSecondWorldBossCombat",
  "secondWorldAdventurePageHtml","gameGuideCategoriesForState",
  "vipThreshold","vipLevelFromPoints","normalizeVipState","vipBonusStats","gmVipManagementHtml","gmSetTestVipLevel"
 ]);
 function run(options={}){
  const errors=[];
  Object.entries(EXPECTED_VERSIONS).forEach(([name,expected])=>{
   const actual=Number(window[name]);
   if(actual!==expected)errors.push({code:"VERSION_MISMATCH",name,expected,actual:Number.isFinite(actual)?actual:null});
  });
  REQUIRED_APIS.forEach(name=>{if(typeof window[name]!=="function")errors.push({code:"API_MISSING",name});});
  if(window.THIRD_WORLD_PHASE_INTEGRITY_REPORT?.passed!==true){
   errors.push({code:"THIRD_WORLD_PHASE_INTEGRITY",report:window.THIRD_WORLD_PHASE_INTEGRITY_REPORT||null});
  }
  if(window.VIP_UNBOUNDED_INTEGRITY_REPORT?.passed!==true){
   errors.push({code:"VIP_UNBOUNDED_INTEGRITY",report:window.VIP_UNBOUNDED_INTEGRITY_REPORT||null});
  }
  if(Number(window.SAVE_MIN_SUPPORTED_VERSION)!==1||String(window.SAVE_LEGACY_SUPPORT_MODE||"")!=="all-known"){
   errors.push({code:"SAVE_LEGACY_POLICY",minSupportedVersion:window.SAVE_MIN_SUPPORTED_VERSION,mode:window.SAVE_LEGACY_SUPPORT_MODE});
  }
  if(window.LEGACY_COMPATIBILITY_OWNER_REPORT?.passed!==true){
   errors.push({code:"LEGACY_COMPATIBILITY_OWNER",report:window.LEGACY_COMPATIBILITY_OWNER_REPORT||null});
  }
  if(Number(window.LEGACY_SAVE_VERSION)!==13||Number(window.LEGACY_FIRST_WORLD_LEVEL_CAP)!==500||String(window.SAVE_SCHEMA_RUNTIME_OWNER||"")!=="savemigration"||String(window.LEVEL_CAP_RUNTIME_OWNER||"")!=="levelprogression"||String(window.ARENA_PROGRESS_RUNTIME_OWNER||"")!=="arenaByWorld"){
   errors.push({code:"LEGACY_OWNER_POLICY",legacySaveVersion:window.LEGACY_SAVE_VERSION,legacyLevelCap:window.LEGACY_FIRST_WORLD_LEVEL_CAP,saveOwner:window.SAVE_SCHEMA_RUNTIME_OWNER,levelOwner:window.LEVEL_CAP_RUNTIME_OWNER,arenaOwner:window.ARENA_PROGRESS_RUNTIME_OWNER});
  }
  if(!Array.isArray(window.CIVILIZATION_PLAYER_TITLE_DEFS)||window.CIVILIZATION_PLAYER_TITLE_DEFS.length!==10||!Array.isArray(window.UNIVERSE_CALAMITY_PLAYER_TITLE_DEFS)||window.UNIVERSE_CALAMITY_PLAYER_TITLE_DEFS.length!==10||!Array.isArray(window.MIRROR_PLAYER_TITLE_DEFS)||window.MIRROR_PLAYER_TITLE_DEFS.length!==6||!Array.isArray(window.PLAYER_TITLE_DEFS)||window.PLAYER_TITLE_DEFS.length!==26){
   errors.push({code:"TITLE_CATALOG_COUNT",counts:{galaxy:window.CIVILIZATION_PLAYER_TITLE_DEFS?.length??null,universe:window.UNIVERSE_CALAMITY_PLAYER_TITLE_DEFS?.length??null,mirror:window.MIRROR_PLAYER_TITLE_DEFS?.length??null,total:window.PLAYER_TITLE_DEFS?.length??null}});
  }
  const arenaProfile=typeof window.getArenaVersionProfile==="function"?window.getArenaVersionProfile():null;
  if(!arenaProfile||Number(arenaProfile.balanceVersion)!==6||Number(arenaProfile.rankBalanceVersion)!==3||Number(arenaProfile.assessmentRuleVersion)!==4||Number(arenaProfile.assessmentStateVersion)!==4||Number(arenaProfile.assessmentRuntimeVersion)!==4){
   errors.push({code:"ARENA_PROFILE_MISMATCH",profile:arenaProfile});
  }
  if(Number(window.SECOND_WORLD_BOSS_BASE_STATS?.base)!==2700||Number(window.SECOND_WORLD_BOSS_BASE_STATS?.ratio?.hp)!==12||Number(window.SECOND_WORLD_BOSS_BASE_STATS?.ratio?.atk)!==2||Number(window.SECOND_WORLD_BOSS_BASE_STATS?.ratio?.def)!==1){
   errors.push({code:"SECOND_WORLD_BOSS_FORMULA",value:window.SECOND_WORLD_BOSS_BASE_STATS||null});
  }
  try{
   const legacy=window.saveCompatibilityFor?.({saveVersion:window.SAVE_MIN_SUPPORTED_VERSION});
   const supported=window.saveCompatibilityFor?.({saveVersion:window.SAVE_SCHEMA_VERSION});
   const future=window.saveCompatibilityFor?.({saveVersion:Number(window.SAVE_SCHEMA_VERSION)+1});
   if(legacy?.supported!==true||legacy?.isLegacy!==true||supported?.supported!==true||supported?.isFuture!==false||future?.supported!==false||future?.isFuture!==true){
    errors.push({code:"SAVE_COMPATIBILITY_POLICY",legacy,supported,future});
   }
  }catch(error){errors.push({code:"SAVE_COMPATIBILITY_POLICY_PROBE",error:String(error?.message||error)});}
  try{
   const probe={saveVersion:window.SAVE_SCHEMA_VERSION,offline:{battleSampleVersion:0,battleSamples:[{sampleVersion:999}],farmMap:999,farmEnemy:9,avgBattleMs:-1,sampleCount:999,lastSettledAt:-1,maxObservedWallClock:-1,timeLockUntil:-1}};
   const first=window.normalizeOfflineSaveState?.(probe,{sourceVersion:window.SAVE_SCHEMA_VERSION,currentTime:123456789});
   const snapshot=JSON.stringify(probe.offline);
   const second=window.normalizeOfflineSaveState?.(probe,{sourceVersion:window.SAVE_SCHEMA_VERSION,currentTime:123456789});
   if(!first||!second||Number(probe.offline.battleSampleVersion)!==3||probe.offline.battleSamples.length!==0||probe.offline.farmMap!==null||probe.offline.farmEnemy!==null||JSON.stringify(probe.offline)!==snapshot){
    errors.push({code:"OFFLINE_STATE_NORMALIZATION",offline:probe.offline});
   }
  }catch(error){errors.push({code:"OFFLINE_STATE_NORMALIZATION_PROBE",error:String(error?.message||error)});}
  try{
   const phaseProbe={gold:1,secondWorld:{entered:true,darkMatter:2,darkEnergy:3},thirdWorld:{entered:true,dimensionalStrings:4}};
   const phase=window.currentWorldPhase?.(phaseProbe),resource=window.primaryWorldResourceSnapshot?.(phaseProbe),snapshot=window.worldPhaseSnapshot?.(phaseProbe);
   if(phase!==3||resource?.label!=="維度之弦"||Number(resource?.amount)!==4||snapshot?.progression?.[2]!==false||snapshot?.progression?.[3]!==true){
    errors.push({code:"THIRD_WORLD_PHASE_POLICY",phase,resource,snapshot});
   }
  }catch(error){errors.push({code:"THIRD_WORLD_PHASE_POLICY_PROBE",error:String(error?.message||error)});}
  return {version:VERSION,phase:String(options.phase||"runtime"),passed:errors.length===0,errors,checkedAt:Date.now()};
 }
 window.CIVILIZATION_INTEGRITY_CONTRACT_VERSION=VERSION;
 window.CIVILIZATION_INTEGRITY_EXPECTED_VERSIONS=EXPECTED_VERSIONS;
 window.runCivilizationIntegrityContract=run;
})();