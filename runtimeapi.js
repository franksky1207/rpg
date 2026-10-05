(function(){
 const VERSION=2;
 const WORLD_RERUN_POLICY_VERSION=1;
 const GLOBAL_ALIAS_COMPATIBILITY_VERSION=1;
 const LATE_BOUND_NAMESPACE_VERSION=1;

 function stateTarget(target){
  if(target&&typeof target==="object")return target;
  try{return typeof state!=="undefined"&&state&&typeof state==="object"?state:null;}catch(_){return null;}
 }
 function whole(value,fallback=0){const n=Math.floor(Number(value));return Number.isFinite(n)?n:fallback;}
 function worldPhase(target){
  if(typeof window.currentWorldPhase==="function")return Math.max(1,Math.min(3,whole(window.currentWorldPhase(target),1)));
  if(target?.thirdWorld?.entered===true)return 3;
  if(target?.secondWorld?.entered===true)return 2;
  return 1;
 }
 function worldLifecycle(target){
  const owner=typeof window.worldReincarnationContext==="function"?window.worldReincarnationContext:null;
  return owner?owner(target):null;
 }
 function worldRerunPolicy(world,target=null,options={}){
  const holder=stateTarget(target),targetWorld=Math.max(1,Math.min(3,whole(world,1))),phase=holder?worldPhase(holder):1;
  const suppliedLifecycle=options&&typeof options==="object"?options.lifecycle:null;
  const lifecycle=suppliedLifecycle||worldLifecycle(holder);
  const available=options?.available===undefined?!!lifecycle:options.available===true;
  const entered=targetWorld===1?true:targetWorld===2?holder?.secondWorld?.entered===true&&holder?.thirdWorld?.entered!==true:holder?.thirdWorld?.entered===true;
  const reincarnationRun=available&&lifecycle?.reincarnationRun===true;
  const active=!!holder&&available&&entered&&reincarnationRun&&phase===targetWorld;
  return Object.freeze({
   version:Math.max(1,whole(options?.version,WORLD_RERUN_POLICY_VERSION)),
   active,
   count:available?Math.max(0,whole(lifecycle?.count,0)):0,
   lifeId:available?Math.max(0,whole(lifecycle?.lifeId,0)):0,
   firstRun:available&&lifecycle?.firstRun===true,
   reincarnationRun,
   world:phase,
   targetWorld,
   source:available?String(options?.source||"reincarnation-context"):"fail-closed"
  });
 }
 function late(name,code){
  return function(){
   const owner=window[name];
   if(typeof owner!=="function")throw new Error(code||`${name.toUpperCase()}_OWNER_MISSING`);
   return owner.apply(window,arguments);
  };
 }

 const reincarnationLifecycle=Object.freeze({
  snapshot:late("reincarnationLifecycleSnapshot","REINCARNATION_LIFECYCLE_OWNER_MISSING"),
  contextForDomain:late("reincarnationContextForDomain","REINCARNATION_DOMAIN_CONTEXT_OWNER_MISSING"),
  world:late("worldReincarnationContext","REINCARNATION_WORLD_CONTEXT_OWNER_MISSING"),
  level:late("levelReincarnationContext","REINCARNATION_LEVEL_CONTEXT_OWNER_MISSING"),
  story:late("storyReincarnationContext","REINCARNATION_STORY_CONTEXT_OWNER_MISSING"),
  dungeon:late("dungeonReincarnationContext","REINCARNATION_DUNGEON_CONTEXT_OWNER_MISSING"),
  speed:late("speedReincarnationContext","REINCARNATION_SPEED_CONTEXT_OWNER_MISSING"),
  worldRerunPolicy
 });
 const reincarnation=Object.freeze({
  version:VERSION,
  count:late("reincarnationCount","REINCARNATION_COUNT_OWNER_MISSING"),
  currentLifeId:late("currentLifeId","REINCARNATION_LIFE_OWNER_MISSING"),
  isRun:late("isReincarnationRun","REINCARNATION_RUN_OWNER_MISSING"),
  isFirstRun:late("isFirstRun","REINCARNATION_FIRST_RUN_OWNER_MISSING"),
  lifecycle:reincarnationLifecycle,
  breakthrough:Object.freeze({
   permanent:late("permanentBreakthroughLevel","BREAKTHROUGH_PERMANENT_OWNER_MISSING"),
   currentLife:late("currentLifeBreakthrough","BREAKTHROUGH_LIFE_OWNER_MISSING")
  }),
  alternateUniverse:Object.freeze({
   unlocked:late("alternateUniverseUnlocked","ALTERNATE_UNIVERSE_UNLOCK_OWNER_MISSING"),
   deepestCleared:late("alternateUniverseDeepestCleared","ALTERNATE_UNIVERSE_DEPTH_OWNER_MISSING"),
   failureCount:late("alternateUniverseFailureCount","ALTERNATE_UNIVERSE_FAILURE_OWNER_MISSING"),
   depthLocked:late("alternateUniverseDepthLocked","ALTERNATE_UNIVERSE_LOCK_OWNER_MISSING"),
   lifecycleSnapshot:late("alternateUniverseLifecycleSnapshot","ALTERNATE_UNIVERSE_LIFECYCLE_OWNER_MISSING")
  })
 });
 const firstWorldTarget=Object.freeze({
  version:VERSION,
  create:late("createFirstWorldTargetContext","FIRST_WORLD_TARGET_CONTEXT_OWNER_MISSING"),
  fromSelection:late("firstWorldTargetContextFromSelection","FIRST_WORLD_TARGET_SELECTION_OWNER_MISSING"),
  selectionSnapshot:late("firstWorldTargetSelectionSnapshot","FIRST_WORLD_TARGET_SELECTION_SNAPSHOT_OWNER_MISSING"),
  lifecycleSnapshot:late("firstWorldTargetLifecycleSnapshot","FIRST_WORLD_TARGET_LIFECYCLE_OWNER_MISSING"),
  resolveRuntimeMode:late("resolveFirstWorldTargetRuntimeMode","FIRST_WORLD_TARGET_MODE_OWNER_MISSING"),
  policy:late("firstWorldTargetPolicy","FIRST_WORLD_TARGET_POLICY_OWNER_MISSING"),
  policyAllows:late("firstWorldTargetPolicyAllows","FIRST_WORLD_TARGET_POLICY_GATE_OWNER_MISSING"),
  identity:late("firstWorldTargetIdentity","FIRST_WORLD_TARGET_IDENTITY_OWNER_MISSING"),
  metadata:late("firstWorldTargetMetadata","FIRST_WORLD_TARGET_METADATA_OWNER_MISSING"),
  persistedCoordinates:late("firstWorldPersistedTargetCoordinates","FIRST_WORLD_PERSISTED_TARGET_OWNER_MISSING"),
  fromPersisted:late("firstWorldTargetContextFromPersisted","FIRST_WORLD_PERSISTED_CONTEXT_OWNER_MISSING"),
  sameIdentity:late("sameFirstWorldTargetIdentity","FIRST_WORLD_TARGET_IDENTITY_COMPARATOR_MISSING"),
  validate:late("validateFirstWorldTargetContext","FIRST_WORLD_TARGET_VALIDATOR_MISSING"),
  validateCurrent:late("validateCurrentFirstWorldTargetContext","FIRST_WORLD_CURRENT_TARGET_VALIDATOR_MISSING"),
  bindForBattle:late("bindFirstWorldBattleTargetContext","FIRST_WORLD_BATTLE_BINDING_OWNER_MISSING"),
  prepareFromSelection:late("prepareFirstWorldTargetContextFromSelection","FIRST_WORLD_PREPARE_SELECTION_OWNER_MISSING"),
  prepare:late("prepareFirstWorldTargetContext","FIRST_WORLD_PREPARE_OWNER_MISSING"),
  prepared:late("getPreparedFirstWorldTargetContext","FIRST_WORLD_PREPARED_TARGET_OWNER_MISSING"),
  preparedSession:late("getPreparedFirstWorldTargetSession","FIRST_WORLD_PREPARED_SESSION_OWNER_MISSING"),
  preparedSessionForContext:late("firstWorldPreparedTargetSessionForContext","FIRST_WORLD_SESSION_CONTEXT_OWNER_MISSING"),
  clearPrepared:late("clearPreparedFirstWorldTargetContext","FIRST_WORLD_PREPARED_CLEAR_OWNER_MISSING"),
  encounter:late("firstWorldEncounterFromTargetContext","FIRST_WORLD_TARGET_ENCOUNTER_OWNER_MISSING"),
  clearPreview:late("clearFirstWorldPreviewForTargetContext","FIRST_WORLD_TARGET_PREVIEW_OWNER_MISSING")
 });
 const saveMigration=Object.freeze({
  version:VERSION,
  get schemaVersion(){return Number(window.SAVE_SCHEMA_VERSION)||0;},
  get minSupportedVersion(){return Number(window.SAVE_MIN_SUPPORTED_VERSION)||0;},
  migrate:late("migrateSave","SAVE_MIGRATION_OWNER_MISSING"),
  get retiredStateMigrationOnlyVersion(){return Number(window.RETIRED_SAVE_STATE_MIGRATION_ONLY_VERSION)||0;}
 });

 window.CIVILIZATION_RUNTIME_API_VERSION=VERSION;
 window.CIVILIZATION_RUNTIME_LATE_BOUND_NAMESPACE_VERSION=LATE_BOUND_NAMESPACE_VERSION;
 window.REINCARNATION_RUNTIME_NAMESPACE_VERSION=VERSION;
 window.FIRST_WORLD_TARGET_CONTEXT_NAMESPACE_VERSION=VERSION;
 window.SAVE_MIGRATION_NAMESPACE_VERSION=VERSION;
 window.RUNTIME_GLOBAL_ALIAS_COMPATIBILITY_VERSION=GLOBAL_ALIAS_COMPATIBILITY_VERSION;
 window.REINCARNATION_WORLD_RERUN_CONTEXT_OWNER_VERSION=WORLD_RERUN_POLICY_VERSION;
 window.CivilizationReincarnation=reincarnation;
 window.CivilizationFirstWorldTarget=firstWorldTarget;
 window.CivilizationSaveMigration=saveMigration;
 window.CivilizationRuntime=Object.freeze({version:VERSION,lateBoundNamespaceVersion:LATE_BOUND_NAMESPACE_VERSION,reincarnation,firstWorldTarget,saveMigration});

 // Compatibility alias: old consumers remain valid while new consumers use the canonical namespace.
 window.worldRerunPolicy=worldRerunPolicy;
})();
