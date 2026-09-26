(function(){
 const VERSION=1;
 const EXPECTED=Object.freeze({THIRD_WORLD_DATA_VERSION:5,THIRD_WORLD_BOSS_DATA_VERSION:1,THIRD_WORLD_BOSS_STAGE_VERSION:1,THIRD_WORLD_BOSS_ABILITY_DESCRIPTOR_VERSION:1,THIRD_WORLD_BOSS_PROGRESS_SNAPSHOT_VERSION:1,THIRD_WORLD_BOSS_AGGREGATE_SNAPSHOT_VERSION:1,THIRD_WORLD_FIVE_POINT_FRONT_VERSION:1,THIRD_WORLD_CHALLENGE_GATE_VERSION:1,THIRD_WORLD_TITLE_RULE_VERSION:2,THIRD_WORLD_DATA_INTEGRITY_VERSION:3,THIRD_WORLD_BOSS_PERSISTENCE_ORDER_VERSION:1,THIRD_WORLD_TITLE_HP_AUTHORITY_VERSION:1,THIRD_WORLD_DATA_OWNER_REQUIREMENT_VERSION:1,THIRD_WORLD_FIVE_POINT_AUTHORITY_VERSION:1,THIRD_WORLD_TITLE_API_SEMANTICS_VERSION:1,THIRD_WORLD_SNAPSHOT_USAGE_POLICY_VERSION:1,SAVE_THIRD_WORLD_BOSS_MIGRATION_REGRESSION_VERSION:1});
 const REQUIRED_APIS=Object.freeze(["thirdWorldBossIndex","thirdWorldBoss","thirdWorldBossStage","thirdWorldBossStats","thirdWorldBossAbilities","thirdWorldBossProgressSnapshot","thirdWorldBossAggregateSnapshot","thirdWorldChallengeStatus","thirdWorldChallengeAllowed","canChallengeThirdWorldBoss","thirdWorldTotalRemainingPercent","thirdWorldOverallRemainingPercent","thirdWorldTitleTierForRemainingHp","thirdWorldTitleTierForRemainingPercentSum","thirdWorldTitleTier","thirdWorldTitleDefinition","thirdWorldCurrentTitleDefinition","validateThirdWorldData","runThirdWorldBossMigrationRegression"]);
 const baseRun=window.runCivilizationIntegrityContract;
 if(typeof baseRun!=="function")throw new Error("Third-world integrity contract extension requires canonical integrity contract owner.");
 function run(options={}){
  const base=baseRun(options)||{},errors=Array.isArray(base.errors)?base.errors.slice():[];
  Object.entries(EXPECTED).forEach(([name,expected])=>{const actual=Number(window[name]);if(actual!==expected)errors.push({code:"THIRD_WORLD_VERSION_MISMATCH",name,expected,actual:Number.isFinite(actual)?actual:null});});
  REQUIRED_APIS.forEach(name=>{if(typeof window[name]!=="function")errors.push({code:"THIRD_WORLD_API_MISSING",name});});
  if(window.THIRD_WORLD_DATA_INTEGRITY?.passed!==true)errors.push({code:"THIRD_WORLD_DATA_INTEGRITY",report:window.THIRD_WORLD_DATA_INTEGRITY||null});
  if(window.SAVE_THIRD_WORLD_BOSS_MIGRATION_REGRESSION_REPORT?.passed!==true)errors.push({code:"THIRD_WORLD_BOSS_MIGRATION_REGRESSION",report:window.SAVE_THIRD_WORLD_BOSS_MIGRATION_REGRESSION_REPORT||null});
  const authority=window.THIRD_WORLD_CHALLENGE_AUTHORITY,policy=window.THIRD_WORLD_SNAPSHOT_USAGE_POLICY;
  if(authority?.decisionField!=="allowed"||authority?.gapField!=="gapHp"||authority?.thresholdField!=="fivePointHpGap"||authority?.displayOnlyFields?.includes("gapPoints")!==true)errors.push({code:"THIRD_WORLD_FIVE_POINT_AUTHORITY",authority:authority||null});
  if(policy?.resolveAtBattleStart!==true||policy?.reuseDuringCombatRun!==true||policy?.refreshAfterSettlement!==true||policy?.globalCache!==false||policy?.combatTickRecompute!==false)errors.push({code:"THIRD_WORLD_SNAPSHOT_USAGE_POLICY",policy:policy||null});
  return {...base,passed:errors.length===0,errors};
 }
 window.CIVILIZATION_THIRD_WORLD_DATA_CONTRACT_EXTENSION_VERSION=VERSION;
 window.CIVILIZATION_THIRD_WORLD_DATA_EXPECTED_VERSIONS=EXPECTED;
 window.CIVILIZATION_THIRD_WORLD_DATA_REQUIRED_APIS=REQUIRED_APIS;
 window.CIVILIZATION_INTEGRITY_EXPECTED_VERSIONS=Object.freeze({...window.CIVILIZATION_INTEGRITY_EXPECTED_VERSIONS,...EXPECTED});
 window.runCivilizationIntegrityContract=run;
})();