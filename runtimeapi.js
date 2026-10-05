(function(){
 const VERSION=1;
 const WORLD_RERUN_POLICY_VERSION=1;
 const GLOBAL_ALIAS_COMPATIBILITY_VERSION=1;

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

 const reincarnationLifecycle=Object.freeze({
  snapshot:window.reincarnationLifecycleSnapshot,
  contextForDomain:window.reincarnationContextForDomain,
  world:window.worldReincarnationContext,
  level:window.levelReincarnationContext,
  story:window.storyReincarnationContext,
  dungeon:window.dungeonReincarnationContext,
  speed:window.speedReincarnationContext,
  worldRerunPolicy
 });
 const reincarnation=Object.freeze({
  version:VERSION,
  count:window.reincarnationCount,
  currentLifeId:window.currentLifeId,
  isRun:window.isReincarnationRun,
  isFirstRun:window.isFirstRun,
  lifecycle:reincarnationLifecycle,
  breakthrough:Object.freeze({
   permanent:window.permanentBreakthroughLevel,
   currentLife:window.currentLifeBreakthrough
  }),
  alternateUniverse:Object.freeze({
   unlocked:window.alternateUniverseUnlocked,
   deepestCleared:window.alternateUniverseDeepestCleared,
   failureCount:window.alternateUniverseFailureCount,
   depthLocked:window.alternateUniverseDepthLocked,
   lifecycleSnapshot:window.alternateUniverseLifecycleSnapshot
  })
 });
 const firstWorldTarget=Object.freeze({
  version:VERSION,
  create:window.createFirstWorldTargetContext,
  fromSelection:window.firstWorldTargetContextFromSelection,
  selectionSnapshot:window.firstWorldTargetSelectionSnapshot,
  lifecycleSnapshot:window.firstWorldTargetLifecycleSnapshot,
  resolveRuntimeMode:window.resolveFirstWorldTargetRuntimeMode,
  policy:window.firstWorldTargetPolicy,
  policyAllows:window.firstWorldTargetPolicyAllows,
  identity:window.firstWorldTargetIdentity,
  metadata:window.firstWorldTargetMetadata,
  persistedCoordinates:window.firstWorldPersistedTargetCoordinates,
  fromPersisted:window.firstWorldTargetContextFromPersisted,
  sameIdentity:window.sameFirstWorldTargetIdentity,
  validate:window.validateFirstWorldTargetContext,
  validateCurrent:window.validateCurrentFirstWorldTargetContext,
  bindForBattle:window.bindFirstWorldBattleTargetContext,
  prepareFromSelection:window.prepareFirstWorldTargetContextFromSelection,
  prepare:window.prepareFirstWorldTargetContext,
  prepared:window.getPreparedFirstWorldTargetContext,
  preparedSession:window.getPreparedFirstWorldTargetSession,
  preparedSessionForContext:window.firstWorldPreparedTargetSessionForContext,
  clearPrepared:window.clearPreparedFirstWorldTargetContext,
  encounter:window.firstWorldEncounterFromTargetContext,
  clearPreview:window.clearFirstWorldPreviewForTargetContext
 });
 const saveMigration=Object.freeze({
  version:VERSION,
  schemaVersion:Number(window.SAVE_SCHEMA_VERSION)||0,
  minSupportedVersion:Number(window.SAVE_MIN_SUPPORTED_VERSION)||0,
  migrate:function(){if(typeof window.migrateSave!=="function")throw new Error("SAVE_MIGRATION_OWNER_MISSING");return window.migrateSave.apply(window,arguments);},
  retiredStateMigrationOnlyVersion:Number(window.RETIRED_SAVE_STATE_MIGRATION_ONLY_VERSION)||0
 });

 window.CIVILIZATION_RUNTIME_API_VERSION=VERSION;
 window.REINCARNATION_RUNTIME_NAMESPACE_VERSION=VERSION;
 window.FIRST_WORLD_TARGET_CONTEXT_NAMESPACE_VERSION=VERSION;
 window.SAVE_MIGRATION_NAMESPACE_VERSION=VERSION;
 window.RUNTIME_GLOBAL_ALIAS_COMPATIBILITY_VERSION=GLOBAL_ALIAS_COMPATIBILITY_VERSION;
 window.REINCARNATION_WORLD_RERUN_CONTEXT_OWNER_VERSION=WORLD_RERUN_POLICY_VERSION;
 window.CivilizationReincarnation=reincarnation;
 window.CivilizationFirstWorldTarget=firstWorldTarget;
 window.CivilizationSaveMigration=saveMigration;
 window.CivilizationRuntime=Object.freeze({version:VERSION,reincarnation,firstWorldTarget,saveMigration});

 // Compatibility alias: old consumers remain valid while new consumers use the canonical namespace.
 window.worldRerunPolicy=worldRerunPolicy;
})();
