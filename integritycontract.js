(function(){
 const VERSION=3;
 const MINIMUM_VERSIONS=Object.freeze({
  SAVE_SCHEMA_VERSION:16,SAVE_LOAD_PIPELINE_VERSION:2,SAVE_NORMALIZATION_PIPELINE_VERSION:2,SAVE_LEGACY_SUPPORT_POLICY_VERSION:1,SAVE_FUTURE_VERSION_GUARD_VERSION:1,
  OFFLINE_STATE_NORMALIZATION_VERSION:4,LEGACY_COMPATIBILITY_OWNER_VERSION:1,SCRIPT_LOAD_POLICY_VERSION:2,
  WORLD_PHASE_VERSION:6,WORLD_PHASE_SHARED_CORE_VERSION:3,WORLD_PHASE_SAFE_TRANSITION_VERSION:3,WORLD_PHASE_METADATA_VERSION:2,WORLD_PHASE_PRIMARY_RESOURCE_VERSION:2,
  THIRD_WORLD_PHASE_VERSION:3,THIRD_WORLD_ENTRY_REQUIREMENTS_VERSION:1,THIRD_WORLD_ENTRY_TRANSITION_VERSION:2,THIRD_WORLD_DUNGEON_UI_VERSION:6,
  LEVEL_PROGRESSION_VERSION:1,LEVEL_WORLD_PHASE_CAP_OWNER_VERSION:1,THIRD_WORLD_LEVEL_PROGRESSION_VERSION:1,THIRD_WORLD_EXP_OWNER_VERSION:1,
  PLAYER_TITLE_CATALOG_VERSION:3,PLAYER_TITLE_INTEGRITY_VERSION:13,ARENA_BY_WORLD_STATE_VERSION:2,SECOND_WORLD_ARENA_UNLOCK_VERSION:2,SECOND_WORLD_ARENA_RANK_CURVE_VERSION:2,
  SECOND_WORLD_CIVILIZATION_COMBAT_VERSION:2,BOUNTY_BALANCE_VERSION:2,BOUNTY_DIFFICULTY_FORMULA_VERSION:2,SECOND_WORLD_ADVENTURE_UI_VERSION:5,
  SECOND_WORLD_CALAMITY_FULL_INTEGRITY_VERSION:2,
  VIP_PROGRESSION_VERSION:14,VIP_UNBOUNDED_LEVEL_VERSION:1,VIP_PERK_MAX_LEVEL:20,VIP_POINTS_SOURCE_OF_TRUTH_VERSION:1,VIP_STATE_RECONCILIATION_VERSION:1,VIP_ADD_POINTS_OWNER_REQUIRED_VERSION:1,VIP_UI_VERSION:4,
  GAME_GUIDE_VERSION:24
 });
 const REQUIRED_APIS=Object.freeze([
  "normalizeSaveState","migrateSave","load","saveWriteGuardStatus","saveCompatibilityFor","assertSaveVersionSupported","normalizeOfflineSaveState",
  "currentWorldPhase","worldProgressionEnabled","worldPhaseSnapshot","primaryWorldResourceSnapshot","runWorldTransition","worldTransitionRuntimeStatus",
  "createBlankThirdWorldState","normalizeThirdWorldState","thirdWorldEntryRequirements","canEnterThirdWorld","thirdWorldDungeonModeVisible","thirdWorldDungeonResourceSnapshot",
  "currentLevelWorldPhase","effectiveLevelCap","effectiveExpNeed","thirdWorldExpNeed","levelProgressSnapshot","getArenaVersionProfile","getArenaRankCurveForWorld",
  "normalizePlayerTitleState","civilizationCombatDamageMultiplier","gameGuideCategoriesForState","vipThreshold","vipLevelFromPoints","normalizeVipState","vipBonusStats"
 ]);
 function finiteVersion(value){const n=Number(value);return Number.isFinite(n)?n:null;}
 function minimumVersionErrors(){const errors=[];Object.entries(MINIMUM_VERSIONS).forEach(([name,minimum])=>{const actual=finiteVersion(window[name]);if(actual==null||actual<minimum)errors.push({code:"VERSION_BELOW_MINIMUM",name,minimum,actual});});return errors;}
 function runBehaviorProbes(){
  const errors=[],fail=(code,data=null)=>errors.push({code,data});
  try{
   const galaxy={gold:123,level:500,secondWorld:{entered:false},thirdWorld:{entered:false}},universe={level:1000,secondWorld:{entered:true,darkMatter:456,darkEnergy:7},thirdWorld:{entered:false}},higher={level:1000,secondWorld:{entered:true,darkMatter:456,darkEnergy:7},thirdWorld:{entered:true,dimensionalStrings:789}};
   if(window.currentWorldPhase?.(galaxy)!==1||window.currentWorldPhase?.(universe)!==2||window.currentWorldPhase?.(higher)!==3)fail("WORLD_PHASE_ROUTING");
   const gRes=window.primaryWorldResourceSnapshot?.(galaxy),uRes=window.primaryWorldResourceSnapshot?.(universe),hRes=window.primaryWorldResourceSnapshot?.(higher);
   if(gRes?.label!=="金幣"||uRes?.label!=="暗物質"||uRes?.secondaryLabel!=="暗能量"||hRes?.label!=="維度之弦")fail("WORLD_RESOURCE_ROUTING",{gRes,uRes,hRes});
   if(window.effectiveLevelCap?.(galaxy)!==500||window.effectiveLevelCap?.(universe)!==1000||window.effectiveLevelCap?.(higher)!==2000)fail("LEVEL_CAP_ROUTING");
   if(window.effectiveExpNeed?.(1000,universe)!==0||window.effectiveExpNeed?.(1000,higher)!==10000000||window.effectiveExpNeed?.(2000,higher)!==0)fail("LEVEL_EXP_BOUNDARY");
   if(window.thirdWorldDungeonModeVisible?.("bounty",higher)!==false||window.thirdWorldDungeonModeVisible?.("arena",higher)!==true||window.thirdWorldDungeonModeVisible?.("tower",higher)!==true)fail("THIRD_WORLD_DUNGEON_POLICY");
   const arenaPolicy=window.dungeonModeAvailability?.("arena",higher);if(arenaPolicy&&arenaPolicy.enabled!==true)fail("THIRD_WORLD_ARENA_LIVE",arenaPolicy);
   const profile=window.getArenaVersionProfile?.();if(!profile||Number(profile.balanceVersion)<7||Number(profile.rankBalanceVersion)<4||Number(profile.assessmentRuleVersion)<4)fail("ARENA_PROFILE",profile||null);
   const curve=window.getArenaRankCurveForWorld?.(2);if(!curve||Number(curve.hp?.base)!==1.68||Number(curve.damage?.base)!==1.52||Number(curve.def?.base)!==1.11)fail("ARENA_UNIVERSE_CURVE",curve||null);
   if(window.vipThreshold?.(21)!==441000||window.vipLevelFromPoints?.(441000)!==21)fail("VIP_UNBOUNDED_PROGRESSION",{threshold21:window.vipThreshold?.(21),levelAt441k:window.vipLevelFromPoints?.(441000)});
   const vipProbe={vipPoints:490000,vipLevel:20};window.normalizeVipState?.(vipProbe);if(vipProbe.vipLevel!==22||vipProbe.vipPoints!==490000)fail("VIP_POINTS_SOURCE_OF_TRUTH",vipProbe);
   const current=Number(window.SAVE_SCHEMA_VERSION)||0,legacy=window.saveCompatibilityFor?.({saveVersion:window.SAVE_MIN_SUPPORTED_VERSION}),supported=window.saveCompatibilityFor?.({saveVersion:current}),future=window.saveCompatibilityFor?.({saveVersion:current+1});
   if(legacy?.supported!==true||supported?.supported!==true||future?.isFuture!==true||future?.supported!==false)fail("SAVE_COMPATIBILITY_POLICY",{legacy,supported,future});
   const sampleVersion=Math.max(1,Math.floor(Number(window.OFFLINE_BATTLE_SAMPLE_VERSION)||0)),probe={saveVersion:current,offline:{battleSampleVersion:0,battleSamples:[{sampleVersion:999}],farmMap:999,farmEnemy:9,avgBattleMs:-1,sampleCount:999,lastSettledAt:-1,maxObservedWallClock:-1,timeLockUntil:-1}};
   const first=window.normalizeOfflineSaveState?.(probe,{sourceVersion:current,currentTime:123456789}),snapshot=JSON.stringify(probe.offline),second=window.normalizeOfflineSaveState?.(probe,{sourceVersion:current,currentTime:123456789});
   if(!first||!second||probe.offline.battleSampleVersion!==sampleVersion||probe.offline.battleSamples.length!==0||probe.offline.farmMap!==null||probe.offline.farmEnemy!==null||JSON.stringify(probe.offline)!==snapshot)fail("OFFLINE_NORMALIZATION",probe.offline);
   if(window.GM_BATCH16_INTEGRITY&&window.GM_BATCH16_INTEGRITY.passed!==true)fail("GM_BATCH16_INTEGRITY",window.GM_BATCH16_INTEGRITY.errors||null);
  }catch(error){fail("BEHAVIOR_PROBE_EXCEPTION",String(error?.message||error));}
  return errors;
 }
 function run(options={}){const errors=[...minimumVersionErrors()];REQUIRED_APIS.forEach(name=>{if(typeof window[name]!=="function")errors.push({code:"API_MISSING",name});});errors.push(...runBehaviorProbes());return {version:VERSION,phase:String(options.phase||"runtime"),passed:errors.length===0,errors,checkedAt:Date.now()};}
 window.CIVILIZATION_INTEGRITY_CONTRACT_VERSION=VERSION;
 window.CIVILIZATION_INTEGRITY_MINIMUM_VERSIONS=MINIMUM_VERSIONS;
 window.CIVILIZATION_INTEGRITY_EXPECTED_VERSIONS=MINIMUM_VERSIONS;
 window.runCanonicalCivilizationIntegrityContract=run;
 window.runCivilizationIntegrityContract=run;
})();
