(function(){
 const SAVE_SCHEMA_VERSION=17;
 const SAVE_LOAD_PIPELINE_VERSION=3;
 const SAVE_NORMALIZATION_PIPELINE_VERSION=3;
 const SAVE_NORMALIZATION_PIPELINE_ORDER=Object.freeze(["reincarnation","worldPhase.secondWorld","worldPhase.thirdWorld","worldProgress","level","gear","enhancement","vip","specialization","daily","dungeon","calamity","titles","offline","persistentFlags"]);
 const SAVE_LEGACY_SUPPORT_POLICY_VERSION=1;
 const SAVE_MIN_SUPPORTED_VERSION=1;
 const SAVE_LEGACY_SUPPORT_MODE="all-known";
 const LEGACY_EXP_LAST_VERSION=9;
 const STAT_KEYS=["hp","atk","def","crit","dodge"];
 const MIGRATE_EXP_TARGET_OWNER_VERSION=1;
 const SAVE_LEVEL_EXP_CLAMP_REPORT_VERSION=1;
 const RETIRED_SAVE_STATE_MIGRATION_ONLY_VERSION=1;
 const SAVE_MIGRATION_GLOBAL_API_CLEANUP_VERSION=2;
 const SAVE_MIGRATION_REGRESSION_RUNTIME_SEPARATION_VERSION=1;
 const REINCARNATION_PERMANENT_GEAR_LOAD_REPAIR_RETIRED_VERSION=1;
 const GM_TEST_TRANSIENT_KEY_INVENTORY_VERSION=3;

 function isObject(value){return !!value&&typeof value==="object"&&!Array.isArray(value);}
 function finiteNonNegative(value,fallback=0){const n=Number(value);return Number.isFinite(n)&&n>=0?n:fallback;}
 function sourceVersionOf(value,fallback=SAVE_MIN_SUPPORTED_VERSION){const n=Math.floor(Number(value));return Number.isFinite(n)&&n>=SAVE_MIN_SUPPORTED_VERSION?n:fallback;}
 function defaultMainStat(type){return typeof mainStatForType==="function"?mainStatForType(type):(type==="weapon"?"atk":type==="helmet"||type==="shoes"?"hp":type==="armor"?"def":"crit");}
 function cleanupLegacyDungeonFields(target){if(!isObject(target?.dungeon))return false;let removed=false;["progress","attempts","activeRun","points"].forEach(key=>{if(Object.prototype.hasOwnProperty.call(target.dungeon,key)){delete target.dungeon[key];removed=true;}});return removed;}
 function cleanupRetiredShopState(target){if(!isObject(target))return false;if(!Object.prototype.hasOwnProperty.call(target,"shop"))return false;delete target.shop;return true;}
 const TRANSIENT_GM_TEST_STATE_KEYS=Object.freeze(["gmTestWorld","gmTestLevel","gmTestEquipment","gmTestEquipmentSource","gmTestVipLevel","gmTestBreakthroughLevel","gmTestEnhancementLevels","gmTestSpecializations","gmTestMarkLevels","gmTestCivilizationLevel","gmTestContext","gmTestContextRevision","gmPowerBenchmark","gmTestResults"]);
 function cleanupTransientGmTestState(target){
  if(!isObject(target))return false;
  const removed=[];
  TRANSIENT_GM_TEST_STATE_KEYS.forEach(key=>{if(Object.prototype.hasOwnProperty.call(target,key)){delete target[key];removed.push(key);}});
  window.LAST_GM_TEST_TRANSIENT_CLEANUP_REPORT=Object.freeze({version:GM_TEST_TRANSIENT_KEY_INVENTORY_VERSION,removed:Object.freeze(removed.slice()),removedCount:removed.length,inventorySize:TRANSIENT_GM_TEST_STATE_KEYS.length});
  return removed.length>0;
 }
 function normalizePendingBlackMarketEncounter(target){if(!isObject(target))return target;target.pendingBlackMarketEncounter=target.pendingBlackMarketEncounter===true;return target;}
 function normalizePersistentFlags(target){if(!isObject(target))return target;normalizePendingBlackMarketEncounter(target);return target;}
 function cleanupRetiredMigrationState(target){return Object.freeze({legacyDungeonFieldsRemoved:cleanupLegacyDungeonFields(target),retiredShopStateRemoved:cleanupRetiredShopState(target),transientGmTestStateRemoved:cleanupTransientGmTestState(target)});}
 function legacySameExpV9(level){const l=Math.max(1,Math.floor(Number(level)||1));return Math.ceil(25+4*l);}
 function legacyExpNeedV9(level){const l=Math.max(1,Math.floor(Number(level)||1));return Math.ceil(legacySameExpV9(l)*(5+245*(1-Math.exp(-(l-1)/142))));}
 function migrateExpProgress(target,version,source){
  if(version>LEGACY_EXP_LAST_VERSION||!isObject(target)||!isObject(source))return false;
  const level=Math.max(1,Math.floor(Number(target.level)||Number(source.level)||1));
  if(typeof MAX_LEVEL==="number"&&level>=MAX_LEVEL){target.exp=0;return true;}
  const oldNeed=Math.max(1,legacyExpNeedV9(level)),oldExp=finiteNonNegative(source.exp,0),progress=Math.max(0,Math.min(1,oldExp/oldNeed));
  const newNeed=typeof window.effectiveExpNeed==="function"?Math.max(1,Math.floor(Number(window.effectiveExpNeed(level,target))||1)):typeof expNeed==="function"?Math.max(1,Math.floor(Number(expNeed(level))||1)):oldNeed;
  target.exp=Math.max(0,Math.min(newNeed-1,Math.round(newNeed*progress)));
  return true;
 }
 function normalizedItemWorld(value,sourceVersion=SAVE_SCHEMA_VERSION){const world=Math.floor(Number(value));if(world===2)return 2;if(world===3&&sourceVersion>=16)return 3;return 1;}
 function prepareLegacyItem(item,forcedType=null,sourceVersion=SAVE_SCHEMA_VERSION){if(!isObject(item))return item;const type=forcedType||item.type;if(!Array.isArray(EQUIPMENT_TYPES)||!EQUIPMENT_TYPES.includes(type))return item;item.type=type;item.world=normalizedItemWorld(item.world,sourceVersion);item.locked=item.locked===true;const totals={};STAT_KEYS.forEach(key=>{totals[key]=finiteNonNegative(item[key],0);});const mainKey=isObject(item.mainStat)&&STAT_KEYS.includes(item.mainStat.stat)?item.mainStat.stat:defaultMainStat(type),rawMain=Number(item.mainStat?.value),mainValue=Number.isFinite(rawMain)&&rawMain>=0?rawMain:totals[mainKey];item.mainStat={stat:mainKey,value:typeof round1==="function"?round1(mainValue):mainValue};if(!Array.isArray(item.affixes)||item.affixes.length===0){const affixes=[];STAT_KEYS.forEach(key=>{const residual=Math.max(0,totals[key]-(key===mainKey?mainValue:0));if(residual>0)affixes.push({stat:key,value:typeof round1==="function"?round1(residual):residual});});item.affixes=affixes;}return item;}
 function prepareAllGear(target,sourceVersion=SAVE_SCHEMA_VERSION){if(!isObject(target))return;if(isObject(target.equipment))EQUIPMENT_TYPES.forEach(type=>prepareLegacyItem(target.equipment[type],type,sourceVersion));if(Array.isArray(target.inventory))target.inventory.forEach(item=>prepareLegacyItem(item,null,sourceVersion));if(Array.isArray(target.lostGear))target.lostGear.forEach(entry=>prepareLegacyItem(entry?.item,null,sourceVersion));}
 function normalizeVoidMirage(target){if(!isObject(target))return;if(!isObject(target.dungeon))target.dungeon={};if(!isObject(target.dungeon.voidMirage))target.dungeon.voidMirage={};target.dungeon.voidMirage.highestCleared=Math.floor(finiteNonNegative(target.dungeon.voidMirage.highestCleared,0));}
 function cloneJson(value){try{return JSON.parse(JSON.stringify(value));}catch(e){return null;}}

 window.SAVE_SCHEMA_VERSION=SAVE_SCHEMA_VERSION;
 window.SAVE_LOAD_PIPELINE_VERSION=SAVE_LOAD_PIPELINE_VERSION;
 window.SAVE_NORMALIZATION_PIPELINE_VERSION=SAVE_NORMALIZATION_PIPELINE_VERSION;
 window.SAVE_NORMALIZATION_PIPELINE_STAGE_LABELS_VERSION=2;
 window.SAVE_NORMALIZATION_PIPELINE_ORDER=Array.from(SAVE_NORMALIZATION_PIPELINE_ORDER);
 window.SAVE_LEGACY_SUPPORT_POLICY_VERSION=SAVE_LEGACY_SUPPORT_POLICY_VERSION;
 window.SAVE_MIN_SUPPORTED_VERSION=SAVE_MIN_SUPPORTED_VERSION;
 window.SAVE_LEGACY_SUPPORT_MODE=SAVE_LEGACY_SUPPORT_MODE;
 window.SECOND_WORLD_CIVILIZATION_MIGRATION_VERSION=1;
 window.THIRD_WORLD_STATE_MIGRATION_VERSION=1;
 window.THIRD_WORLD_PRE_SCHEMA16_DISCARD_VERSION=1;
 window.REINCARNATION_PRE_SCHEMA17_DISCARD_VERSION=1;
 window.SAVE_VERSION_BACKUP_DELEGATION_VERSION=1;
 window.GEAR_WORLD_FIELD_MIGRATION_VERSION=2;
 window.ARENA_BY_WORLD_MIGRATION_VERSION=1;
 window.MIGRATE_EXP_TARGET_OWNER_VERSION=MIGRATE_EXP_TARGET_OWNER_VERSION;
 window.SAVE_LEVEL_EXP_CLAMP_REPORT_VERSION=SAVE_LEVEL_EXP_CLAMP_REPORT_VERSION;
 window.RETIRED_SAVE_STATE_MIGRATION_ONLY_VERSION=RETIRED_SAVE_STATE_MIGRATION_ONLY_VERSION;
 window.SAVE_MIGRATION_GLOBAL_API_CLEANUP_VERSION=SAVE_MIGRATION_GLOBAL_API_CLEANUP_VERSION;
 window.SAVE_MIGRATION_DIAGNOSTICS_VERSION=1;
 window.SAVE_MIGRATION_REGRESSION_RUNTIME_SEPARATION_VERSION=SAVE_MIGRATION_REGRESSION_RUNTIME_SEPARATION_VERSION;
 window.REINCARNATION_PERMANENT_GEAR_LOAD_REPAIR_RETIRED_VERSION=REINCARNATION_PERMANENT_GEAR_LOAD_REPAIR_RETIRED_VERSION;
 window.normalizePendingBlackMarketEncounter=normalizePendingBlackMarketEncounter;
 window.PENDING_BLACK_MARKET_FLAG_SEMANTICS_VERSION=1;
 window.GM_TEST_SAVE_ISOLATION_VERSION=1;
 window.GM_TEST_TRANSIENT_KEY_INVENTORY_VERSION=GM_TEST_TRANSIENT_KEY_INVENTORY_VERSION;
 window.GM_TEST_TRANSIENT_STATE_KEYS=Object.freeze(Array.from(TRANSIENT_GM_TEST_STATE_KEYS));
 window.cleanupTransientGmTestState=cleanupTransientGmTestState;
 window.LAST_GM_TEST_TRANSIENT_CLEANUP_REPORT=Object.freeze({version:GM_TEST_TRANSIENT_KEY_INVENTORY_VERSION,removed:Object.freeze([]),removedCount:0,inventorySize:TRANSIENT_GM_TEST_STATE_KEYS.length});
 window.normalizePersistentFlags=normalizePersistentFlags;
 if(typeof registerNewStateNormalizer==="function")registerNewStateNormalizer(normalizePersistentFlags);
 window.migrateSave=function(rawState,fromVersion=null,normalizer=null,sourceRaw=null){
  let target=isObject(rawState)?rawState:(typeof newState==="function"?newState():{});
  const source=isObject(sourceRaw)?sourceRaw:target,version=sourceVersionOf(fromVersion??source.saveVersion,SAVE_MIN_SUPPORTED_VERSION),introWasBoolean=typeof source.introSeen==="boolean",introValue=introWasBoolean?source.introSeen:true,hadCalamityState=isObject(source.calamities),hadMarkState=isObject(source.marks),hadTitleState=isObject(source.titles),hadSecondWorldState=isObject(source.secondWorld),hadThirdWorldState=isObject(source.thirdWorld),sourceHadReincarnationRoot=Object.prototype.hasOwnProperty.call(source,"reincarnation"),hadReincarnationState=isObject(source.reincarnation),sourceReincarnationCountRaw=sourceHadReincarnationRoot?(source?.reincarnation?.count??null):null,sourceReincarnationCount=version<17?0:Math.max(0,Math.floor(Number(source?.reincarnation?.count)||0)),preSchema17ReincarnationDiscarded=version<17&&sourceHadReincarnationRoot,legacyThirdWorldStateDiscarded=version<16&&Object.prototype.hasOwnProperty.call(source,"thirdWorld"),hadCivilizationLevel=Number.isFinite(Number(source?.secondWorld?.civilizationLevel)),hadArenaByWorld=isObject(source?.dungeon?.arenaByWorld),hadLegacyArena=isObject(source?.dungeon?.arena),reincarnationBefore=cloneJson(target.reincarnation),sourceTitleIds=Array.isArray(source?.titles?.unlocked)?source.titles.unlocked.filter(id=>typeof id==="string"):[],sourceTitleIdSet=new Set(sourceTitleIds),sourceMirrorHistory=cloneJson(source?.dungeon?.mirror?.history),sourceHadMirrorHistory=isObject(source?.dungeon?.mirror?.history);
  if(version<16&&Object.prototype.hasOwnProperty.call(target,"thirdWorld"))delete target.thirdWorld;
  if(version<17&&Object.prototype.hasOwnProperty.call(target,"reincarnation"))delete target.reincarnation;
  prepareAllGear(target,version);if(!introWasBoolean)target.introSeen=true;
  const retiredCleanup=cleanupRetiredMigrationState(target),legacyDungeonFieldsRemoved=retiredCleanup.legacyDungeonFieldsRemoved,retiredShopStateRemoved=retiredCleanup.retiredShopStateRemoved,transientGmTestStateRemoved=retiredCleanup.transientGmTestStateRemoved,normalize=typeof normalizer==="function"?normalizer:null;
  if(normalize)target=normalize(target);const expProgressMigrated=migrateExpProgress(target,version,source);
  if(typeof window.normalizeReincarnationState!=="function")throw new Error("Reincarnation state normalization owner unavailable");
  window.normalizeReincarnationState(target);
  const reincarnationAfter=cloneJson(target.reincarnation),targetReincarnationCount=Math.max(0,Math.floor(Number(target?.reincarnation?.count)||0)),reincarnationStateNormalized=JSON.stringify(reincarnationBefore)!==JSON.stringify(reincarnationAfter);
  if(typeof normalizeSecondWorldState==="function")normalizeSecondWorldState(target);
  if(typeof window.normalizeThirdWorldState==="function")window.normalizeThirdWorldState(target);
  if(typeof normalizeWorldSaveState==="function")normalizeWorldSaveState(target);
  const levelBeforeNormalization=Math.max(1,Math.floor(Number(target.level)||1)),expBeforeNormalization=Math.max(0,Math.floor(Number(target.exp)||0));
  if(typeof window.normalizeLevelProgressionState==="function")window.normalizeLevelProgressionState(target);
  const levelAfterNormalization=Math.max(1,Math.floor(Number(target.level)||1)),expAfterNormalization=Math.max(0,Math.floor(Number(target.exp)||0)),levelExpClamped=levelAfterNormalization!==levelBeforeNormalization||expAfterNormalization!==expBeforeNormalization;
  prepareAllGear(target,SAVE_SCHEMA_VERSION);
  if(typeof normalizeEnhancementState==="function")normalizeEnhancementState(target);
  if(typeof normalizeVipState==="function")normalizeVipState(target);
  if(typeof normalizeSpecializationState==="function")normalizeSpecializationState(target);
  if(typeof normalizeDailyState==="function")normalizeDailyState(target);
  if(typeof normalizeDungeonSaveState==="function")normalizeDungeonSaveState(target);
  if(typeof normalizeCivilizationCalamityState==="function")normalizeCivilizationCalamityState(target);
  if(typeof normalizePlayerTitleState==="function")normalizePlayerTitleState(target);
  const alternateUniverseTitleIds=Array.from(window.ALTERNATE_UNIVERSE_PLAYER_TITLE_IDS||[]),finalTitleIds=Array.isArray(target?.titles?.unlocked)?target.titles.unlocked.filter(id=>typeof id==="string"):[],alternateUniverseTitlesBackfilledIds=alternateUniverseTitleIds.filter(id=>finalTitleIds.includes(id)&&!sourceTitleIdSet.has(id)),alternateUniverseTitlesBackfilled=alternateUniverseTitlesBackfilledIds.length;
  const mirrorHistoryAfter=cloneJson(target?.dungeon?.mirror?.history),mirrorHistoryInitialized=!sourceHadMirrorHistory&&isObject(target?.dungeon?.mirror?.history),mirrorHistoryRepaired=sourceHadMirrorHistory&&JSON.stringify(sourceMirrorHistory)!==JSON.stringify(mirrorHistoryAfter);
  const sourceMiracleDates=Array.isArray(sourceMirrorHistory?.miracleDates)?sourceMirrorHistory.miracleDates.filter(value=>typeof value==="string"):[],finalMiracleDates=Array.isArray(mirrorHistoryAfter?.miracleDates)?mirrorHistoryAfter.miracleDates.filter(value=>typeof value==="string"):[],mirrorMiracleDatesRemoved=Math.max(0,sourceMiracleDates.length-finalMiracleDates.length);
  normalizeVoidMirage(target);
  if(typeof window.normalizeOfflineSaveState!=="function")throw new Error("Offline save normalization owner unavailable");
  window.normalizeOfflineSaveState(target,{sourceVersion:version});normalizePersistentFlags(target);
  target.introSeen=introValue;target.saveVersion=SAVE_SCHEMA_VERSION;
  window.LAST_SAVE_MIGRATION_REPORT={sourceVersion:version,targetVersion:SAVE_SCHEMA_VERSION,normalizationPipelineVersion:SAVE_NORMALIZATION_PIPELINE_VERSION,normalizationOrder:Array.from(SAVE_NORMALIZATION_PIPELINE_ORDER),legacySupportPolicyVersion:SAVE_LEGACY_SUPPORT_POLICY_VERSION,minSupportedVersion:SAVE_MIN_SUPPORTED_VERSION,legacySupportMode:SAVE_LEGACY_SUPPORT_MODE,retiredStateMigrationOnlyVersion:RETIRED_SAVE_STATE_MIGRATION_ONLY_VERSION,reincarnationPermanentGearLoadRepairRetiredVersion:REINCARNATION_PERMANENT_GEAR_LOAD_REPAIR_RETIRED_VERSION,gmTestTransientKeyInventoryVersion:GM_TEST_TRANSIENT_KEY_INVENTORY_VERSION,gmTestTransientKeyCount:TRANSIENT_GM_TEST_STATE_KEYS.length,expProgressMigrated,levelExpClamped,levelBeforeNormalization,levelAfterNormalization,expBeforeNormalization,expAfterNormalization,legacyDungeonFieldsRemoved,retiredShopStateRemoved,transientGmTestStateRemoved,reincarnationStateInitialized:version<17||!hadReincarnationState,reincarnationStateNormalized,sourceHadReincarnationRoot,sourceReincarnationCountRaw,preSchema17ReincarnationDiscarded,sourceReincarnationCount,targetReincarnationCount,calamityStateInitialized:!hadCalamityState,markStateInitialized:!hadMarkState,titleStateInitialized:!hadTitleState,diagnosticsVersion:1,alternateUniverseTitlesBackfilled,alternateUniverseTitlesBackfilledIds:Object.freeze(alternateUniverseTitlesBackfilledIds.slice()),mirrorHistoryInitialized,mirrorHistoryRepaired,mirrorMiracleDatesRemoved,secondWorldStateInitialized:!hadSecondWorldState,thirdWorldStateInitialized:version<16||!hadThirdWorldState,legacyThirdWorldStateDiscarded,civilizationLevelInitialized:!hadCivilizationLevel,arenaByWorldInitialized:!hadArenaByWorld,legacyArenaMigrated:hadLegacyArena&&!hadArenaByWorld};return target;
 };
 window.load=function(){
  let rawSnapshot=null,sourceVersion=SAVE_SCHEMA_VERSION,hadRaw=false,parseFailed=false;
  try{const raw=localStorage.getItem(SAVE_KEY);hadRaw=!!raw;if(raw){rawSnapshot=JSON.parse(raw);sourceVersion=sourceVersionOf(rawSnapshot?.saveVersion,SAVE_MIN_SUPPORTED_VERSION);}}catch(e){rawSnapshot=null;parseFailed=true;}
  const failProtectedLoad=(reason,error=null)=>{try{state=typeof newState==="function"?newState():{};}catch(_){state={saveVersion:SAVE_SCHEMA_VERSION};}const e=document.getElementById("saveStatus");if(e)e.textContent="本機存檔讀取失敗・已保護";window.LAST_SAVE_LOAD_REPORT={pipelineVersion:SAVE_LOAD_PIPELINE_VERSION,normalizationPipelineVersion:SAVE_NORMALIZATION_PIPELINE_VERSION,normalizationOrder:Array.from(SAVE_NORMALIZATION_PIPELINE_ORDER),hadRaw,parseFailed,sourceVersion,targetVersion:SAVE_SCHEMA_VERSION,failed:true,reason:String(reason||"load-failed"),error:error?String(error?.message||error):"",versionBackupOwner:"saveversionguard"};console.error("[文明戰線] Local save load failed; original localStorage entry was preserved.",error||reason);return false;};
  if(hadRaw&&(parseFailed||!isObject(rawSnapshot)))return failProtectedLoad(parseFailed?"parse-failed":"invalid-root");
  try{
   const seed=isObject(rawSnapshot)?(cloneJson(rawSnapshot)||rawSnapshot):(typeof newState==="function"?newState():{}),normalizer=typeof window.normalizeSaveState==="function"?window.normalizeSaveState:null;
   state=window.migrateSave(seed,sourceVersion,normalizer,rawSnapshot);
   const dungeonFinalize=typeof window.finalizeDungeonLoadedState==="function"?window.finalizeDungeonLoadedState():null;
   if(typeof ensureDailyState==="function")ensureDailyState();selectedMap=Math.max(0,Math.min(Number(state.unlockedMap)||0,MAPS.length-1));if(typeof normalizeHP==="function")normalizeHP();normalizePersistentFlags(state);state.saveVersion=SAVE_SCHEMA_VERSION;if(typeof window.markSaveLoadResolved==="function")window.markSaveLoadResolved("local-load");if(typeof save==="function")save(false);
   window.LAST_SAVE_LOAD_REPORT={pipelineVersion:SAVE_LOAD_PIPELINE_VERSION,normalizationPipelineVersion:SAVE_NORMALIZATION_PIPELINE_VERSION,normalizationOrder:Array.from(SAVE_NORMALIZATION_PIPELINE_ORDER),hadRaw,parseFailed,sourceVersion,targetVersion:SAVE_SCHEMA_VERSION,failed:false,versionBackupOwner:"saveversionguard",legacySupportPolicyVersion:SAVE_LEGACY_SUPPORT_POLICY_VERSION,minSupportedVersion:SAVE_MIN_SUPPORTED_VERSION,legacySupportMode:SAVE_LEGACY_SUPPORT_MODE,retiredStateMigrationOnlyVersion:RETIRED_SAVE_STATE_MIGRATION_ONLY_VERSION,reincarnationPermanentGearLoadRepairRetiredVersion:REINCARNATION_PERMANENT_GEAR_LOAD_REPAIR_RETIRED_VERSION,gmTestTransientKeyInventoryVersion:window.LAST_SAVE_MIGRATION_REPORT?.gmTestTransientKeyInventoryVersion,gmTestTransientKeyCount:window.LAST_SAVE_MIGRATION_REPORT?.gmTestTransientKeyCount,expProgressMigrated:window.LAST_SAVE_MIGRATION_REPORT?.expProgressMigrated===true,levelExpClamped:window.LAST_SAVE_MIGRATION_REPORT?.levelExpClamped===true,levelBeforeNormalization:window.LAST_SAVE_MIGRATION_REPORT?.levelBeforeNormalization,levelAfterNormalization:window.LAST_SAVE_MIGRATION_REPORT?.levelAfterNormalization,expBeforeNormalization:window.LAST_SAVE_MIGRATION_REPORT?.expBeforeNormalization,expAfterNormalization:window.LAST_SAVE_MIGRATION_REPORT?.expAfterNormalization,legacyDungeonFieldsRemoved:window.LAST_SAVE_MIGRATION_REPORT?.legacyDungeonFieldsRemoved===true,retiredShopStateRemoved:window.LAST_SAVE_MIGRATION_REPORT?.retiredShopStateRemoved===true,transientGmTestStateRemoved:window.LAST_SAVE_MIGRATION_REPORT?.transientGmTestStateRemoved===true,reincarnationStateInitialized:window.LAST_SAVE_MIGRATION_REPORT?.reincarnationStateInitialized===true,reincarnationStateNormalized:window.LAST_SAVE_MIGRATION_REPORT?.reincarnationStateNormalized===true,sourceHadReincarnationRoot:window.LAST_SAVE_MIGRATION_REPORT?.sourceHadReincarnationRoot===true,sourceReincarnationCountRaw:window.LAST_SAVE_MIGRATION_REPORT?.sourceReincarnationCountRaw??null,preSchema17ReincarnationDiscarded:window.LAST_SAVE_MIGRATION_REPORT?.preSchema17ReincarnationDiscarded===true,sourceReincarnationCount:window.LAST_SAVE_MIGRATION_REPORT?.sourceReincarnationCount,targetReincarnationCount:window.LAST_SAVE_MIGRATION_REPORT?.targetReincarnationCount,calamityStateInitialized:window.LAST_SAVE_MIGRATION_REPORT?.calamityStateInitialized===true,markStateInitialized:window.LAST_SAVE_MIGRATION_REPORT?.markStateInitialized===true,titleStateInitialized:window.LAST_SAVE_MIGRATION_REPORT?.titleStateInitialized===true,diagnosticsVersion:window.LAST_SAVE_MIGRATION_REPORT?.diagnosticsVersion||0,alternateUniverseTitlesBackfilled:Math.max(0,Math.floor(Number(window.LAST_SAVE_MIGRATION_REPORT?.alternateUniverseTitlesBackfilled)||0)),alternateUniverseTitlesBackfilledIds:Array.isArray(window.LAST_SAVE_MIGRATION_REPORT?.alternateUniverseTitlesBackfilledIds)?window.LAST_SAVE_MIGRATION_REPORT.alternateUniverseTitlesBackfilledIds.slice():[],mirrorHistoryInitialized:window.LAST_SAVE_MIGRATION_REPORT?.mirrorHistoryInitialized===true,mirrorHistoryRepaired:window.LAST_SAVE_MIGRATION_REPORT?.mirrorHistoryRepaired===true,mirrorMiracleDatesRemoved:Math.max(0,Math.floor(Number(window.LAST_SAVE_MIGRATION_REPORT?.mirrorMiracleDatesRemoved)||0)),secondWorldStateInitialized:window.LAST_SAVE_MIGRATION_REPORT?.secondWorldStateInitialized===true,thirdWorldStateInitialized:window.LAST_SAVE_MIGRATION_REPORT?.thirdWorldStateInitialized===true,legacyThirdWorldStateDiscarded:window.LAST_SAVE_MIGRATION_REPORT?.legacyThirdWorldStateDiscarded===true,civilizationLevelInitialized:window.LAST_SAVE_MIGRATION_REPORT?.civilizationLevelInitialized===true,arenaByWorldInitialized:window.LAST_SAVE_MIGRATION_REPORT?.arenaByWorldInitialized===true,legacyArenaMigrated:window.LAST_SAVE_MIGRATION_REPORT?.legacyArenaMigrated===true,recoveredInterruptedDungeonRun:dungeonFinalize?.recoveredInterruptedRun===true,recoveredInterruptedMirrorRun:dungeonFinalize?.recoveredInterruptedMirrorRun===true};return true;
  }catch(error){return failProtectedLoad("migration-failed",error);}
 };
})();