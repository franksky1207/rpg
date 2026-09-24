(function(){
 const VERSION=1;
 const EXPECTED_VERSIONS=Object.freeze({
  SAVE_SCHEMA_VERSION:15,
  SAVE_LOAD_PIPELINE_VERSION:2,
  SAVE_NORMALIZATION_PIPELINE_VERSION:1,
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
  GAME_GUIDE_VERSION:18
 });
 const REQUIRED_APIS=Object.freeze([
  "normalizeSaveState","migrateSave","load","saveWriteGuardStatus",
  "normalizePlayerTitleState","playerIdentityNameHtml","equipPlayerTitle",
  "getArenaProgressForWorld","getCurrentArenaProgress","getArenaVersionProfile",
  "civilizationCombatDamageMultiplier","secondWorldBossBaseStats","runSecondWorldBossCombat",
  "secondWorldAdventurePageHtml","gameGuideCategoriesForState"
 ]);
 function run(options={}){
  const errors=[];
  Object.entries(EXPECTED_VERSIONS).forEach(([name,expected])=>{
   const actual=Number(window[name]);
   if(actual!==expected)errors.push({code:"VERSION_MISMATCH",name,expected,actual:Number.isFinite(actual)?actual:null});
  });
  REQUIRED_APIS.forEach(name=>{if(typeof window[name]!=="function")errors.push({code:"API_MISSING",name});});
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
  return {version:VERSION,phase:String(options.phase||"runtime"),passed:errors.length===0,errors,checkedAt:Date.now()};
 }
 window.CIVILIZATION_INTEGRITY_CONTRACT_VERSION=VERSION;
 window.CIVILIZATION_INTEGRITY_EXPECTED_VERSIONS=EXPECTED_VERSIONS;
 window.runCivilizationIntegrityContract=run;
})();
