(function(){
 const VERSION=4;
 const LEGACY_SAVE_VERSION_VALUE=typeof SAVE_VERSION==="number"?Math.floor(Number(SAVE_VERSION)||0):0;
 const LEGACY_MAX_LEVEL_VALUE=typeof MAX_LEVEL==="number"?Math.floor(Number(MAX_LEVEL)||0):0;
 const EXPECTED_SAVE_SCHEMA_VERSION=17;
 const SAVE_SCHEMA_OWNER="savemigration";
 const LEVEL_CAP_RUNTIME_OWNER="levelprogression";
 const ARENA_RUNTIME_OWNER="arenaByWorld";
 const ARENA_ALIAS_POLICY="legacy-read-through-only";
 const SCRIPT_LOAD_POLICY_VERSION=3;
 const LEGACY_GLOBAL_ALIAS_POLICY_VERSION=1;
 const LEGACY_SAVE_SUPPORT_BOUNDARY_VERSION=1;

 function scriptLoadGroupFor(path){
  const name=String(path||"").split("/").pop().split("?")[0].toLowerCase();
  if(!name)return "core";
  if(name.startsWith("storydata-")||["storyintegrity.js","storyui.js","storymigration.js","storyprogress.js","storyrecordtabs.js","storyruntimeintegrity.js"].includes(name))return "story";
  if(name.includes("integrity"))return "integrity";
  if(name.startsWith("gm")||name.includes("gm.")||name.includes("gmp")||name.endsWith("gm.js")||["vipgm.js","civilizationgm.js","specialgmbatch.js","dungeongm.js","arenagm5.js","dungeonvoidgmmanage.js","batch5ui.js","mirrordungeongm.js","levelprogressionaudit.js","enhancementworld3gm.js","thirdworldarenagm.js","secondworldcalamitygm.js","calamitygm.js"].includes(name))return "gm";
  if(name.startsWith("worldmaps-")||name.startsWith("secondworld")||name.startsWith("thirdworld")||name.startsWith("worldphase")||name.startsWith("worldmap"))return "world";
  return "core";
 }
 function scriptLoadPolicySnapshot(path){
  const group=scriptLoadGroupFor(path),deferred=["gm","story","integrity"].includes(group);
  return Object.freeze({version:SCRIPT_LOAD_POLICY_VERSION,group,startupCritical:!deferred,deferRecommended:deferred,fetchPriority:deferred?"low":"auto"});
 }
 function legacyGlobalAliasSnapshot(){
  return Object.freeze({
   version:LEGACY_GLOBAL_ALIAS_POLICY_VERSION,
   policy:"read-compatible-no-duplicate-write",
   saveVersion:{legacy:LEGACY_SAVE_VERSION_VALUE,canonical:Number(window.SAVE_SCHEMA_VERSION)||0,owner:SAVE_SCHEMA_OWNER},
   maxLevel:{legacy:LEGACY_MAX_LEVEL_VALUE,windowAlias:Number(window.MAX_LEVEL)||0,firstWorld:Number(window.FIRST_WORLD_LEVEL_CAP)||0,absolute:Number(window.ABSOLUTE_MAX_LEVEL)||0,owner:LEVEL_CAP_RUNTIME_OWNER},
   arena:{policy:ARENA_ALIAS_POLICY,owner:ARENA_RUNTIME_OWNER}
  });
 }
 function legacySaveSupportSnapshot(){
  const current=Math.max(1,Math.floor(Number(window.SAVE_SCHEMA_VERSION)||EXPECTED_SAVE_SCHEMA_VERSION));
  const minimum=Math.max(1,Math.floor(Number(window.SAVE_MIN_SUPPORTED_VERSION)||1));
  return Object.freeze({
   version:LEGACY_SAVE_SUPPORT_BOUNDARY_VERSION,
   currentSchema:current,
   minSupportedVersion:minimum,
   configuredMode:String(window.SAVE_LEGACY_SUPPORT_MODE||""),
   legacyReadPath:"migration-only",
   canonicalWriteSchema:current,
   canonicalizeAfterLoad:true,
   legacyDuplicateWrites:false,
   futureSchemaPolicy:"fail-closed"
  });
 }
 function runDiagnostics(){
  const errors=[];
  if(LEGACY_SAVE_VERSION_VALUE!==13)errors.push({code:"LEGACY_SAVE_VERSION",actual:LEGACY_SAVE_VERSION_VALUE});
  if(Number(window.SAVE_SCHEMA_VERSION)!==EXPECTED_SAVE_SCHEMA_VERSION)errors.push({code:"SAVE_SCHEMA_VERSION",actual:window.SAVE_SCHEMA_VERSION,expected:EXPECTED_SAVE_SCHEMA_VERSION});
  if(LEGACY_MAX_LEVEL_VALUE!==500)errors.push({code:"LEGACY_MAX_LEVEL",actual:LEGACY_MAX_LEVEL_VALUE});
  if(Number(window.MAX_LEVEL)!==LEGACY_MAX_LEVEL_VALUE)errors.push({code:"WINDOW_MAX_LEVEL_ALIAS",actual:window.MAX_LEVEL,expected:LEGACY_MAX_LEVEL_VALUE});
  if(Number(window.FIRST_WORLD_LEVEL_CAP)!==500||Number(window.SECOND_WORLD_LEVEL_CAP)!==1000||Number(window.THIRD_WORLD_LEVEL_CAP)!==2000||Number(window.ABSOLUTE_MAX_LEVEL)!==2000)errors.push({code:"LEVEL_CAP_OWNER",first:window.FIRST_WORLD_LEVEL_CAP,second:window.SECOND_WORLD_LEVEL_CAP,third:window.THIRD_WORLD_LEVEL_CAP,absolute:window.ABSOLUTE_MAX_LEVEL});
  if(Number(window.LEVEL_WORLD_PHASE_CAP_OWNER_VERSION)!==1||Number(window.THIRD_WORLD_LEVEL_PROGRESSION_VERSION)!==1||Number(window.THIRD_WORLD_EXP_OWNER_VERSION)!==1)errors.push({code:"THIRD_WORLD_LEVEL_OWNER_VERSION",phase:window.LEVEL_WORLD_PHASE_CAP_OWNER_VERSION,progression:window.THIRD_WORLD_LEVEL_PROGRESSION_VERSION,exp:window.THIRD_WORLD_EXP_OWNER_VERSION});
  try{
   const galaxy={level:500,secondWorld:{entered:false},thirdWorld:{entered:false}},universe={level:1000,secondWorld:{entered:true},thirdWorld:{entered:false}},higher={level:1000,secondWorld:{entered:true},thirdWorld:{entered:true}};
   if(typeof window.currentLevelWorldPhase!=="function"||window.currentLevelWorldPhase(galaxy)!==1||window.currentLevelWorldPhase(universe)!==2||window.currentLevelWorldPhase(higher)!==3)errors.push({code:"LEVEL_WORLD_PHASE_RUNTIME"});
   if(typeof window.effectiveLevelCap!=="function"||window.effectiveLevelCap(galaxy)!==500||window.effectiveLevelCap(universe)!==1000||window.effectiveLevelCap(higher)!==2000)errors.push({code:"LEVEL_CAP_RUNTIME_BEHAVIOR",galaxy:window.effectiveLevelCap?.(galaxy),universe:window.effectiveLevelCap?.(universe),higher:window.effectiveLevelCap?.(higher)});
   if(typeof window.effectiveExpNeed!=="function"||window.effectiveExpNeed(1000,universe)!==0||window.effectiveExpNeed(1000,higher)!==10000000||window.effectiveExpNeed(1999,higher)!==10000000||window.effectiveExpNeed(2000,higher)!==0)errors.push({code:"LEVEL_EXP_RUNTIME_BEHAVIOR",u1000:window.effectiveExpNeed?.(1000,universe),h1000:window.effectiveExpNeed?.(1000,higher),h1999:window.effectiveExpNeed?.(1999,higher),h2000:window.effectiveExpNeed?.(2000,higher)});
  }catch(error){errors.push({code:"LEVEL_RUNTIME_PROBE_EXCEPTION",error:String(error?.message||error)});}
  if(Number(window.ARENA_BY_WORLD_STATE_VERSION)!==2||typeof window.getArenaProgressForWorld!=="function")errors.push({code:"ARENA_OWNER"});
  const hookSnapshot=typeof window.saveHookOwnerSnapshot==="function"?window.saveHookOwnerSnapshot():null;
  if(typeof window.save!=="function"||typeof window.registerBeforeSaveHook!=="function"||typeof window.registerAfterSaveHook!=="function"||typeof window.registerSaveSettlementHook!=="function"||window.SAVE_HOOK_IMPLEMENTATION_OWNER!=="savehookcore"||window.save?.__saveHookOwner!=="savehookcore")errors.push({code:"SAVE_HOOK_OWNER",implementation:window.SAVE_HOOK_IMPLEMENTATION_OWNER||null,wrapper:window.save?.__saveHookOwner||null,snapshot:hookSnapshot});
  const legacySupport=legacySaveSupportSnapshot();
  if(legacySupport.currentSchema!==EXPECTED_SAVE_SCHEMA_VERSION||legacySupport.minSupportedVersion!==1||legacySupport.configuredMode!=="all-known"||legacySupport.legacyReadPath!=="migration-only"||legacySupport.canonicalWriteSchema!==EXPECTED_SAVE_SCHEMA_VERSION)errors.push({code:"LEGACY_SAVE_SUPPORT_BOUNDARY",actual:legacySupport});
  const report={version:VERSION,passed:errors.length===0,errors,legacyGlobals:legacyGlobalAliasSnapshot(),legacySaveSupport:legacySupport,saveHookImplementation:hookSnapshot,checkedAt:Date.now()};
  window.LEGACY_COMPATIBILITY_OWNER_REPORT=report;
  return report;
 }

 window.LEGACY_COMPATIBILITY_OWNER_VERSION=VERSION;
 window.LEGACY_SAVE_VERSION=LEGACY_SAVE_VERSION_VALUE;
 window.LEGACY_SAVE_VERSION_ALIAS_VERSION=1;
 window.LEGACY_FIRST_WORLD_LEVEL_CAP=LEGACY_MAX_LEVEL_VALUE;
 window.LEGACY_MAX_LEVEL_ALIAS_VERSION=1;
 window.LEGACY_MAX_LEVEL_WINDOW_ALIAS_VERSION=2;
 window.SAVE_SCHEMA_RUNTIME_OWNER=SAVE_SCHEMA_OWNER;
 window.LEVEL_CAP_RUNTIME_OWNER=LEVEL_CAP_RUNTIME_OWNER;
 window.ARENA_PROGRESS_RUNTIME_OWNER=ARENA_RUNTIME_OWNER;
 window.ARENA_LEGACY_ALIAS_POLICY=ARENA_ALIAS_POLICY;
 window.ARENA_LEGACY_ALIAS_AUDIT_VERSION=1;
 window.LEGACY_GLOBAL_ALIAS_POLICY_VERSION=LEGACY_GLOBAL_ALIAS_POLICY_VERSION;
 window.LEGACY_GLOBAL_DUPLICATE_WRITE_RETIREMENT_VERSION=1;
 window.legacyGlobalAliasSnapshot=legacyGlobalAliasSnapshot;
 window.LEGACY_SAVE_SUPPORT_BOUNDARY_VERSION=LEGACY_SAVE_SUPPORT_BOUNDARY_VERSION;
 window.legacySaveSupportSnapshot=legacySaveSupportSnapshot;
 window.runLegacyCompatibilityOwnerDiagnostics=runDiagnostics;
 window.SCRIPT_LOAD_POLICY_VERSION=SCRIPT_LOAD_POLICY_VERSION;
 window.scriptLoadGroupFor=scriptLoadGroupFor;
 window.scriptLoadPolicySnapshot=scriptLoadPolicySnapshot;
 window.SCRIPT_LOAD_GROUPS=Object.freeze(["core","world","gm","story","integrity"]);
 window.LEVEL_CAP_THREE_WORLD_COMPATIBILITY_VERSION=1;
 window.LEGACY_COMPATIBILITY_OWNER_REPORT={version:VERSION,passed:null,pending:true,errors:[],checkedAt:0};
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",runDiagnostics,{once:true});else runDiagnostics();
})();