(function(){
 const VERSION=1;
 const PUBLIC_API_VERSION=1;
 const PRIVATE_HELPER_RETIRE_VERSION=1;
 const SUMMARY_VERSION=1;
 const PUBLIC_APIS=Object.freeze(["createThirdWorldBossCombatSnapshot","thirdWorldSettlementBasisFromResult","canRunThirdWorldBossCombat","runThirdWorldBossCombat"]);
 const RETIRED_APIS=Object.freeze(["thirdWorldCombatAbilityProfileFromStats","thirdWorldCombatEffectProfileFromAbilities","createThirdWorldCombatSettlementBasis","validateThirdWorldCombatAdapter","runThirdWorldCombatIntegrity"]);
 const errors=[];
 const fail=(code,data=null)=>errors.push({code,data});
 PUBLIC_APIS.forEach(name=>{if(typeof window[name]!=="function")fail("PUBLIC_API_MISSING",name);});
 const adapter=window.THIRD_WORLD_COMBAT_INTEGRITY||null;
 const deterministic=window.THIRD_WORLD_COMBAT_DETERMINISTIC_INTEGRITY||null;
 const markCore=window.MARK_CORE_INTEGRITY||null;
 const combatMark=window.COMBAT_MARK_INTEGRITY||null;
 const saveGuard=window.THIRD_WORLD_COMBAT_SAVE_GUARD_REPORT||null;
 if(adapter?.passed!==true)fail("ADAPTER_INTEGRITY",adapter?.errors||null);
 if(deterministic?.passed!==true)fail("DETERMINISTIC_INTEGRITY",deterministic?.errors||null);
 if(markCore?.passed!==true)fail("MARK_CORE_INTEGRITY",markCore?.errors||null);
 if(combatMark?.passed!==true)fail("COMBAT_MARK_INTEGRITY",combatMark?.errors||null);
 if(saveGuard?.passed!==true)fail("SAVE_GUARD_INTEGRITY",saveGuard||null);
 if(Number(window.COMBAT_ACTION_SAFETY_VERSION)!==1)fail("ACTION_SAFETY_VERSION",window.COMBAT_ACTION_SAFETY_VERSION);
 if(Number(window.MARK_MAX_LEVEL_OWNER_VERSION)!==1)fail("MARK_MAX_LEVEL_OWNER_VERSION",window.MARK_MAX_LEVEL_OWNER_VERSION);
 if(Number(window.SPECIALIZATION_COMBAT_RULE_SOURCE_VERSION)!==1)fail("SPECIALIZATION_COMBAT_RULE_SOURCE_VERSION",window.SPECIALIZATION_COMBAT_RULE_SOURCE_VERSION);
 RETIRED_APIS.forEach(name=>{try{delete window[name];}catch(_){};if(typeof window[name]!=="undefined")fail("PRIVATE_API_NOT_RETIRED",name);});
 const summary=Object.freeze({
  version:SUMMARY_VERSION,
  passed:errors.length===0,
  errors:Object.freeze(errors.slice()),
  combatVersion:Number(window.THIRD_WORLD_COMBAT_VERSION)||0,
  deterministicVersion:Number(window.THIRD_WORLD_COMBAT_INTEGRITY_VERSION)||0,
  saveGuardVersion:Number(window.THIRD_WORLD_COMBAT_SAVE_GUARD_VERSION)||0,
  schemaVersion:Number(window.SAVE_SCHEMA_VERSION)||0,
  schemaBumpRequired:window.THIRD_WORLD_COMBAT_SAVE_SCHEMA_BUMP_REQUIRED===true,
  publicApis:PUBLIC_APIS,
  retiredApis:RETIRED_APIS
 });
 window.THIRD_WORLD_COMBAT_FINALIZE_VERSION=VERSION;
 window.THIRD_WORLD_COMBAT_PUBLIC_API_VERSION=PUBLIC_API_VERSION;
 window.THIRD_WORLD_COMBAT_PRIVATE_HELPER_RETIRE_VERSION=PRIVATE_HELPER_RETIRE_VERSION;
 window.THIRD_WORLD_COMBAT_INTEGRITY_SUMMARY_VERSION=SUMMARY_VERSION;
 window.THIRD_WORLD_COMBAT_PUBLIC_APIS=PUBLIC_APIS;
 window.THIRD_WORLD_COMBAT_RETIRED_APIS=RETIRED_APIS;
 window.THIRD_WORLD_COMBAT_INTEGRITY_SUMMARY=summary;
 if(!summary.passed)console.error("[文明戰線] Third-world combat finalization integrity error",summary.errors);
})();
