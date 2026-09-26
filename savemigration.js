(function(){
 const SAVE_SCHEMA_VERSION=16;
 const SAVE_LOAD_PIPELINE_VERSION=2;
 const SAVE_NORMALIZATION_PIPELINE_VERSION=2;
 const SAVE_NORMALIZATION_PIPELINE_ORDER=Object.freeze(["worldPhase.secondWorld","worldPhase.thirdWorld","worldProgress","level","gear","enhancement","vip","specialization","daily","dungeon","calamity","titles","offline","persistentFlags"]);
 const SAVE_LEGACY_SUPPORT_POLICY_VERSION=1;
 const SAVE_MIN_SUPPORTED_VERSION=1;
 const SAVE_LEGACY_SUPPORT_MODE="all-known";
 const LEGACY_EXP_LAST_VERSION=9;
 const STAT_KEYS=["hp","atk","def","crit","dodge"];
 const PRE_SCHEMA16_BACKUP_SUFFIX=".pre-schema16-backup-v1";
 const MIGRATE_EXP_TARGET_OWNER_VERSION=1;
 const SAVE_LEVEL_EXP_CLAMP_REPORT_VERSION=1;
 const SAVE_LEVEL_MIGRATION_REGRESSION_VERSION=1;

 function isObject(value){return !!value&&typeof value==="object"&&!Array.isArray(value);}
 function finiteNonNegative(value,fallback=0){const n=Number(value);return Number.isFinite(n)&&n>=0?n:fallback;}
 function sourceVersionOf(value,fallback=SAVE_MIN_SUPPORTED_VERSION){const n=Math.floor(Number(value));return Number.isFinite(n)&&n>=SAVE_MIN_SUPPORTED_VERSION?n:fallback;}
 function defaultMainStat(type){return typeof mainStatForType==="function"?mainStatForType(type):(type==="weapon"?"atk":type==="helmet"||type==="shoes"?"hp":type==="armor"?"def":"crit");}
 function cleanupLegacyDungeonFields(target){if(!isObject(target?.dungeon))return false;let removed=false;["progress","attempts","activeRun","points"].forEach(key=>{if(Object.prototype.hasOwnProperty.call(target.dungeon,key)){delete target.dungeon[key];removed=true;}});return removed;}
 function cleanupRetiredShopState(target){if(!isObject(target))return false;if(!Object.prototype.hasOwnProperty.call(target,"shop"))return false;delete target.shop;return true;}
 const TRANSIENT_GM_TEST_STATE_KEYS=Object.freeze(["gmTestWorld","gmTestLevel","gmTestEquipment","gmTestEquipmentSource","gmTestVipLevel","gmTestEnhancementLevels","gmTestSpecializations","gmTestMarkLevels","gmTestCivilizationLevel","gmPowerBenchmark","gmTestResults"]);
 function cleanupTransientGmTestState(target){if(!isObject(target))return false;let removed=false;TRANSIENT_GM_TEST_STATE_KEYS.forEach(key=>{if(Object.prototype.hasOwnProperty.call(target,key)){delete target[key];removed=true;}});return removed;}
 function normalizePendingBlackMarketEncounter(target){if(!isObject(target))return target;target.pendingBlackMarketEncounter=target.pendingBlackMarketEncounter===true;return target;}
 function normalizePersistentFlags(target){if(!isObject(target))return target;normalizePendingBlackMarketEncounter(target);cleanupTransientGmTestState(target);return target;}
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
 function preSchema16BackupKey(){return `${SAVE_KEY}${PRE_SCHEMA16_BACKUP_SUFFIX}`;}
 function ensurePreSchema16Backup(rawText,sourceVersion){const result={required:sourceVersion<16,created:false,alreadyExists:false,failed:false,key:""};if(!result.required||typeof rawText!=="string"||!rawText)return result;const key=preSchema16BackupKey();result.key=key;try{const existing=localStorage.getItem(key);if(existing){result.alreadyExists=true;return result;}localStorage.setItem(key,rawText);result.created=true;}catch(error){result.failed=true;console.warn("[文明戰線] Unable to create pre-Schema16 local backup.",error);}return result;}

 window.SAVE_SCHEMA_VERSION=SAVE_SCHEMA_VERSION;
 window.SAVE_LOAD_PIPELINE_VERSION=SAVE_LOAD_PIPELINE_VERSION;
 window.SAVE_NORMALIZATION_PIPELINE_VERSION=SAVE_NORMALIZATION_PIPELINE_VERSION;
 window.SAVE_NORMALIZATION_PIPELINE_STAGE_LABELS_VERSION=1;
 window.SAVE_NORMALIZATION_PIPELINE_ORDER=Array.from(SAVE_NORMALIZATION_PIPELINE_ORDER);
 window.SAVE_LEGACY_SUPPORT_POLICY_VERSION=SAVE_LEGACY_SUPPORT_POLICY_VERSION;
 window.SAVE_MIN_SUPPORTED_VERSION=SAVE_MIN_SUPPORTED_VERSION;
 window.SAVE_LEGACY_SUPPORT_MODE=SAVE_LEGACY_SUPPORT_MODE;
 window.SECOND_WORLD_CIVILIZATION_MIGRATION_VERSION=1;
 window.THIRD_WORLD_STATE_MIGRATION_VERSION=1;
 window.THIRD_WORLD_PRE_SCHEMA16_DISCARD_VERSION=1;
 window.SAVE_PRE_SCHEMA16_BACKUP_VERSION=1;
 window.GEAR_WORLD_FIELD_MIGRATION_VERSION=2;
 window.ARENA_BY_WORLD_MIGRATION_VERSION=1;
 window.MIGRATE_EXP_TARGET_OWNER_VERSION=MIGRATE_EXP_TARGET_OWNER_VERSION;
 window.SAVE_LEVEL_EXP_CLAMP_REPORT_VERSION=SAVE_LEVEL_EXP_CLAMP_REPORT_VERSION;
 window.SAVE_LEVEL_MIGRATION_REGRESSION_VERSION=SAVE_LEVEL_MIGRATION_REGRESSION_VERSION;
 window.cleanupLegacyDungeonFields=cleanupLegacyDungeonFields;
 window.cleanupRetiredShopState=cleanupRetiredShopState;
 window.normalizePendingBlackMarketEncounter=normalizePendingBlackMarketEncounter;
 window.cleanupTransientGmTestState=cleanupTransientGmTestState;
 window.GM_TEST_TRANSIENT_STATE_KEYS=Array.from(TRANSIENT_GM_TEST_STATE_KEYS);
 window.PENDING_BLACK_MARKET_FLAG_SEMANTICS_VERSION=1;
 window.GM_TEST_SAVE_ISOLATION_VERSION=1;
 window.normalizePersistentFlags=normalizePersistentFlags;
 if(typeof registerNewStateNormalizer==="function")registerNewStateNormalizer(normalizePersistentFlags);
 window.migrateSave=function(rawState,fromVersion=null,normalizer=null,sourceRaw=null){
  let target=isObject(rawState)?rawState:(typeof newState==="function"?newState():{});
  const source=isObject(sourceRaw)?sourceRaw:target,version=sourceVersionOf(fromVersion??source.saveVersion,SAVE_MIN_SUPPORTED_VERSION),introWasBoolean=typeof source.introSeen==="boolean",introValue=introWasBoolean?source.introSeen:true,hadCalamityState=isObject(source.calamities),hadMarkState=isObject(source.marks),hadTitleState=isObject(source.titles),hadSecondWorldState=isObject(source.secondWorld),hadThirdWorldState=isObject(source.thirdWorld),legacyThirdWorldStateDiscarded=version<16&&Object.prototype.hasOwnProperty.call(source,"thirdWorld"),hadCivilizationLevel=Number.isFinite(Number(source?.secondWorld?.civilizationLevel)),hadArenaByWorld=isObject(source?.dungeon?.arenaByWorld),hadLegacyArena=isObject(source?.dungeon?.arena);
  if(version<16&&Object.prototype.hasOwnProperty.call(target,"thirdWorld"))delete target.thirdWorld;
  prepareAllGear(target,version);if(!introWasBoolean)target.introSeen=true;
  const retiredShopStateRemoved=cleanupRetiredShopState(target),legacyDungeonFieldsRemoved=cleanupLegacyDungeonFields(target),transientGmTestStateRemoved=cleanupTransientGmTestState(target),normalize=typeof normalizer==="function"?normalizer:null;
  if(normalize)target=normalize(target);cleanupRetiredShopState(target);const expProgressMigrated=migrateExpProgress(target,version,source);
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
  cleanupLegacyDungeonFields(target);cleanupRetiredShopState(target);normalizeVoidMirage(target);
  if(typeof window.normalizeOfflineSaveState!=="function")throw new Error("Offline save normalization owner unavailable");
  window.normalizeOfflineSaveState(target,{sourceVersion:version});normalizePersistentFlags(target);target.introSeen=introValue;target.saveVersion=SAVE_SCHEMA_VERSION;
  window.LAST_SAVE_MIGRATION_REPORT={sourceVersion:version,targetVersion:SAVE_SCHEMA_VERSION,normalizationPipelineVersion:SAVE_NORMALIZATION_PIPELINE_VERSION,normalizationOrder:Array.from(SAVE_NORMALIZATION_PIPELINE_ORDER),legacySupportPolicyVersion:SAVE_LEGACY_SUPPORT_POLICY_VERSION,minSupportedVersion:SAVE_MIN_SUPPORTED_VERSION,legacySupportMode:SAVE_LEGACY_SUPPORT_MODE,expProgressMigrated,levelExpClamped,levelBeforeNormalization,levelAfterNormalization,expBeforeNormalization,expAfterNormalization,legacyDungeonFieldsRemoved,retiredShopStateRemoved,transientGmTestStateRemoved,calamityStateInitialized:!hadCalamityState,markStateInitialized:!hadMarkState,titleStateInitialized:!hadTitleState,secondWorldStateInitialized:!hadSecondWorldState,thirdWorldStateInitialized:version<16||!hadThirdWorldState,legacyThirdWorldStateDiscarded,civilizationLevelInitialized:!hadCivilizationLevel,arenaByWorldInitialized:!hadArenaByWorld,legacyArenaMigrated:hadLegacyArena&&!hadArenaByWorld};return target;
 };
 function runLevelMigrationRegression(){
  const errors=[],cases=[];
  const runCase=(id,source,check)=>{
   try{
    const original=cloneJson(source),seed=cloneJson(source),migrated=window.migrateSave(seed,source.saveVersion,null,original),report=cloneJson(window.LAST_SAVE_MIGRATION_REPORT)||{};
    const ok=check(migrated,report)===true;
    cases.push({id,ok,level:migrated?.level,exp:migrated?.exp,phase:typeof window.currentWorldPhase==="function"?window.currentWorldPhase(migrated):null,levelExpClamped:report.levelExpClamped===true});
    if(!ok)errors.push({code:id,migrated,report});
   }catch(error){cases.push({id,ok:false,error:String(error?.message||error)});errors.push({code:id,error:String(error?.message||error)});}
  };
  const world3=(level,exp)=>({saveVersion:16,level,exp,secondWorld:{entered:true},thirdWorld:{entered:true,entryVersion:1}});
  runCase("SCHEMA16_WORLD3_LV1000",world3(1000,0),(m,r)=>m?.thirdWorld?.entered===true&&m?.level===1000&&m?.exp===0&&r?.levelExpClamped===false);
  runCase("SCHEMA16_WORLD3_LV1500",world3(1500,1234567),(m,r)=>m?.thirdWorld?.entered===true&&m?.level===1500&&m?.exp===1234567&&r?.levelExpClamped===false);
  runCase("SCHEMA16_WORLD3_LV2000",world3(2000,9876543),(m,r)=>m?.thirdWorld?.entered===true&&m?.level===2000&&m?.exp===0&&r?.levelExpClamped===true&&r?.expBeforeNormalization===9876543&&r?.expAfterNormalization===0);
  runCase("SCHEMA16_WORLD2_FAKE_LV1500",{saveVersion:16,level:1500,exp:123,secondWorld:{entered:true},thirdWorld:{entered:false}},(m,r)=>m?.thirdWorld?.entered!==true&&m?.level===1000&&m?.exp===0&&r?.levelExpClamped===true&&r?.levelBeforeNormalization===1500&&r?.levelAfterNormalization===1000);
  runCase("SCHEMA15_FAKE_WORLD3_LV1500",{saveVersion:15,level:1500,exp:123,secondWorld:{entered:true},thirdWorld:{entered:true,entryVersion:1}},(m,r)=>m?.thirdWorld?.entered!==true&&m?.level===1000&&m?.exp===0&&r?.legacyThirdWorldStateDiscarded===true&&r?.levelExpClamped===true);
  const report={version:SAVE_LEVEL_MIGRATION_REGRESSION_VERSION,passed:errors.length===0,errors,cases,checkedAt:Date.now()};
  window.SAVE_LEVEL_MIGRATION_REGRESSION_REPORT=report;
  return report;
 }
 window.runLevelMigrationRegression=runLevelMigrationRegression;
 window.load=function(){
  let rawSnapshot=null,rawText="",sourceVersion=SAVE_SCHEMA_VERSION,hadRaw=false,parseFailed=false,preSchema16Backup={required:false,created:false,alreadyExists:false,failed:false,key:""};
  try{const raw=localStorage.getItem(SAVE_KEY);rawText=raw||"";hadRaw=!!raw;if(raw){rawSnapshot=JSON.parse(raw);sourceVersion=sourceVersionOf(rawSnapshot?.saveVersion,SAVE_MIN_SUPPORTED_VERSION);}}catch(e){rawSnapshot=null;parseFailed=true;}
  const failProtectedLoad=(reason,error=null)=>{try{state=typeof newState==="function"?newState():{};}catch(_){state={saveVersion:SAVE_SCHEMA_VERSION};}const e=document.getElementById("saveStatus");if(e)e.textContent="本機存檔讀取失敗・已保護";window.LAST_SAVE_LOAD_REPORT={pipelineVersion:SAVE_LOAD_PIPELINE_VERSION,normalizationPipelineVersion:SAVE_NORMALIZATION_PIPELINE_VERSION,normalizationOrder:Array.from(SAVE_NORMALIZATION_PIPELINE_ORDER),hadRaw,parseFailed,sourceVersion,targetVersion:SAVE_SCHEMA_VERSION,failed:true,reason:String(reason||"load-failed"),error:error?String(error?.message||error):"",preSchema16Backup};console.error("[文明戰線] Local save load failed; original localStorage entry was preserved.",error||reason);return false;};
  if(hadRaw&&(parseFailed||!isObject(rawSnapshot)))return failProtectedLoad(parseFailed?"parse-failed":"invalid-root");
  try{
   if(hadRaw&&sourceVersion<16)preSchema16Backup=ensurePreSchema16Backup(rawText,sourceVersion);
   const seed=isObject(rawSnapshot)?(cloneJson(rawSnapshot)||rawSnapshot):(typeof newState==="function"?newState():{}),normalizer=typeof window.normalizeSaveState==="function"?window.normalizeSaveState:null;
   state=window.migrateSave(seed,sourceVersion,normalizer,rawSnapshot);
   const dungeonFinalize=typeof window.finalizeDungeonLoadedState==="function"?window.finalizeDungeonLoadedState():null;
   if(typeof ensureDailyState==="function")ensureDailyState();selectedMap=Math.max(0,Math.min(Number(state.unlockedMap)||0,MAPS.length-1));if(typeof normalizeHP==="function")normalizeHP();cleanupRetiredShopState(state);normalizePersistentFlags(state);state.saveVersion=SAVE_SCHEMA_VERSION;if(typeof window.markSaveLoadResolved==="function")window.markSaveLoadResolved("local-load");if(typeof save==="function")save(false);
   window.LAST_SAVE_LOAD_REPORT={pipelineVersion:SAVE_LOAD_PIPELINE_VERSION,normalizationPipelineVersion:SAVE_NORMALIZATION_PIPELINE_VERSION,normalizationOrder:Array.from(SAVE_NORMALIZATION_PIPELINE_ORDER),hadRaw,parseFailed,sourceVersion,targetVersion:SAVE_SCHEMA_VERSION,failed:false,preSchema16Backup,legacySupportPolicyVersion:SAVE_LEGACY_SUPPORT_POLICY_VERSION,minSupportedVersion:SAVE_MIN_SUPPORTED_VERSION,legacySupportMode:SAVE_LEGACY_SUPPORT_MODE,expProgressMigrated:window.LAST_SAVE_MIGRATION_REPORT?.expProgressMigrated===true,levelExpClamped:window.LAST_SAVE_MIGRATION_REPORT?.levelExpClamped===true,levelBeforeNormalization:window.LAST_SAVE_MIGRATION_REPORT?.levelBeforeNormalization,levelAfterNormalization:window.LAST_SAVE_MIGRATION_REPORT?.levelAfterNormalization,expBeforeNormalization:window.LAST_SAVE_MIGRATION_REPORT?.expBeforeNormalization,expAfterNormalization:window.LAST_SAVE_MIGRATION_REPORT?.expAfterNormalization,legacyDungeonFieldsRemoved:window.LAST_SAVE_MIGRATION_REPORT?.legacyDungeonFieldsRemoved===true,retiredShopStateRemoved:window.LAST_SAVE_MIGRATION_REPORT?.retiredShopStateRemoved===true,transientGmTestStateRemoved:window.LAST_SAVE_MIGRATION_REPORT?.transientGmTestStateRemoved===true,calamityStateInitialized:window.LAST_SAVE_MIGRATION_REPORT?.calamityStateInitialized===true,markStateInitialized:window.LAST_SAVE_MIGRATION_REPORT?.markStateInitialized===true,titleStateInitialized:window.LAST_SAVE_MIGRATION_REPORT?.titleStateInitialized===true,secondWorldStateInitialized:window.LAST_SAVE_MIGRATION_REPORT?.secondWorldStateInitialized===true,thirdWorldStateInitialized:window.LAST_SAVE_MIGRATION_REPORT?.thirdWorldStateInitialized===true,legacyThirdWorldStateDiscarded:window.LAST_SAVE_MIGRATION_REPORT?.legacyThirdWorldStateDiscarded===true,civilizationLevelInitialized:window.LAST_SAVE_MIGRATION_REPORT?.civilizationLevelInitialized===true,arenaByWorldInitialized:window.LAST_SAVE_MIGRATION_REPORT?.arenaByWorldInitialized===true,legacyArenaMigrated:window.LAST_SAVE_MIGRATION_REPORT?.legacyArenaMigrated===true,recoveredInterruptedDungeonRun:dungeonFinalize?.recoveredInterruptedRun===true,recoveredInterruptedMirrorRun:dungeonFinalize?.recoveredInterruptedMirrorRun===true};return true;
  }catch(error){return failProtectedLoad("migration-failed",error);}
 };
})();