(function(){
 const SAVE_SCHEMA_VERSION=16;
 const SAVE_LOAD_PIPELINE_VERSION=2;
 const SAVE_NORMALIZATION_PIPELINE_VERSION=1;
 const SAVE_NORMALIZATION_PIPELINE_ORDER=Object.freeze(["worldPhase","worldProgress","level","gear","enhancement","vip","specialization","daily","dungeon","calamity","titles","offline","persistentFlags"]);
 const SAVE_LEGACY_SUPPORT_POLICY_VERSION=1;
 const SAVE_MIN_SUPPORTED_VERSION=1;
 const SAVE_LEGACY_SUPPORT_MODE="all-known";
 const LEGACY_EXP_LAST_VERSION=9;
 const STAT_KEYS=["hp","atk","def","crit","dodge"];

 function isObject(value){return !!value&&typeof value==="object"&&!Array.isArray(value);}
 function finiteNonNegative(value,fallback=0){const n=Number(value);return Number.isFinite(n)&&n>=0?n:fallback;}
 function sourceVersionOf(value,fallback=SAVE_MIN_SUPPORTED_VERSION){const n=Math.floor(Number(value));return Number.isFinite(n)&&n>=SAVE_MIN_SUPPORTED_VERSION?n:fallback;}
 function defaultMainStat(type){return typeof mainStatForType==="function"?mainStatForType(type):(type==="weapon"?"atk":type==="helmet"||type==="shoes"?"hp":type==="armor"?"def":"crit");}
 function cleanupLegacyDungeonFields(target){
  if(!isObject(target?.dungeon))return false;
  let removed=false;
  ["progress","attempts","activeRun","points"].forEach(key=>{if(Object.prototype.hasOwnProperty.call(target.dungeon,key)){delete target.dungeon[key];removed=true;}});
  return removed;
 }
 function cleanupRetiredShopState(target){
  if(!isObject(target))return false;
  if(!Object.prototype.hasOwnProperty.call(target,"shop"))return false;
  delete target.shop;
  return true;
 }
 const TRANSIENT_GM_TEST_STATE_KEYS=Object.freeze(["gmTestWorld","gmTestLevel","gmTestEquipment","gmTestEquipmentSource","gmTestVipLevel","gmTestEnhancementLevels","gmTestSpecializations","gmTestMarkLevels","gmTestCivilizationLevel","gmPowerBenchmark","gmTestResults"]);
 function cleanupTransientGmTestState(target){
  if(!isObject(target))return false;
  let removed=false;
  TRANSIENT_GM_TEST_STATE_KEYS.forEach(key=>{if(Object.prototype.hasOwnProperty.call(target,key)){delete target[key];removed=true;}});
  return removed;
 }
 function normalizePendingBlackMarketEncounter(target){
  if(!isObject(target))return target;
  target.pendingBlackMarketEncounter=target.pendingBlackMarketEncounter===true;
  return target;
 }
 function normalizePersistentFlags(target){
  if(!isObject(target))return target;
  normalizePendingBlackMarketEncounter(target);
  cleanupTransientGmTestState(target);
  return target;
 }
 function legacySameExpV9(level){const l=Math.max(1,Math.floor(Number(level)||1));return Math.ceil(25+4*l);}
 function legacyExpNeedV9(level){
  const l=Math.max(1,Math.floor(Number(level)||1));
  return Math.ceil(legacySameExpV9(l)*(5+245*(1-Math.exp(-(l-1)/142))));
 }
 function migrateExpProgress(target,version,source){
  if(version>LEGACY_EXP_LAST_VERSION||!isObject(target)||!isObject(source))return false;
  const level=Math.max(1,Math.floor(Number(target.level)||Number(source.level)||1));
  if(typeof MAX_LEVEL==="number"&&level>=MAX_LEVEL){target.exp=0;return true;}
  const oldNeed=Math.max(1,legacyExpNeedV9(level));
  const oldExp=finiteNonNegative(source.exp,0);
  const progress=Math.max(0,Math.min(1,oldExp/oldNeed));
  const newNeed=typeof expNeed==="function"?Math.max(1,Math.floor(Number(expNeed(level))||1)):oldNeed;
  target.exp=Math.max(0,Math.min(newNeed-1,Math.round(newNeed*progress)));
  return true;
 }

 function prepareLegacyItem(item,forcedType=null){
  if(!isObject(item))return item;
  const type=forcedType||item.type;
  if(!Array.isArray(EQUIPMENT_TYPES)||!EQUIPMENT_TYPES.includes(type))return item;
  item.type=type;
  item.world=Number(item.world)===2?2:1;
  item.locked=item.locked===true;
  const totals={};
  STAT_KEYS.forEach(key=>{totals[key]=finiteNonNegative(item[key],0);});
  const mainKey=isObject(item.mainStat)&&STAT_KEYS.includes(item.mainStat.stat)?item.mainStat.stat:defaultMainStat(type);
  const rawMain=Number(item.mainStat?.value);
  const mainValue=Number.isFinite(rawMain)&&rawMain>=0?rawMain:totals[mainKey];
  item.mainStat={stat:mainKey,value:typeof round1==="function"?round1(mainValue):mainValue};
  if(!Array.isArray(item.affixes)||item.affixes.length===0){
   const affixes=[];
   STAT_KEYS.forEach(key=>{
    const residual=Math.max(0,totals[key]-(key===mainKey?mainValue:0));
    if(residual>0){affixes.push({stat:key,value:typeof round1==="function"?round1(residual):residual});}
   });
   item.affixes=affixes;
  }
  return item;
 }

 function prepareAllGear(target){
  if(!isObject(target))return;
  if(isObject(target.equipment))EQUIPMENT_TYPES.forEach(type=>prepareLegacyItem(target.equipment[type],type));
  if(Array.isArray(target.inventory))target.inventory.forEach(item=>prepareLegacyItem(item));
  if(Array.isArray(target.lostGear))target.lostGear.forEach(entry=>prepareLegacyItem(entry?.item));
 }

 function normalizeVoidMirage(target){
  if(!isObject(target))return;
  if(!isObject(target.dungeon))target.dungeon={};
  if(!isObject(target.dungeon.voidMirage))target.dungeon.voidMirage={};
  target.dungeon.voidMirage.highestCleared=Math.floor(finiteNonNegative(target.dungeon.voidMirage.highestCleared,0));
 }
 function cloneJson(value){
  try{return JSON.parse(JSON.stringify(value));}catch(e){return null;}
 }

 window.SAVE_SCHEMA_VERSION=SAVE_SCHEMA_VERSION;
 window.SAVE_LOAD_PIPELINE_VERSION=SAVE_LOAD_PIPELINE_VERSION;
 window.SAVE_NORMALIZATION_PIPELINE_VERSION=SAVE_NORMALIZATION_PIPELINE_VERSION;
 window.SAVE_NORMALIZATION_PIPELINE_ORDER=Array.from(SAVE_NORMALIZATION_PIPELINE_ORDER);
 window.SAVE_LEGACY_SUPPORT_POLICY_VERSION=SAVE_LEGACY_SUPPORT_POLICY_VERSION;
 window.SAVE_MIN_SUPPORTED_VERSION=SAVE_MIN_SUPPORTED_VERSION;
 window.SAVE_LEGACY_SUPPORT_MODE=SAVE_LEGACY_SUPPORT_MODE;
 window.SECOND_WORLD_CIVILIZATION_MIGRATION_VERSION=1;
 window.THIRD_WORLD_STATE_MIGRATION_VERSION=1;
 window.ARENA_BY_WORLD_MIGRATION_VERSION=1;
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
  const source=isObject(sourceRaw)?sourceRaw:target;
  const version=sourceVersionOf(fromVersion??source.saveVersion,SAVE_MIN_SUPPORTED_VERSION);
  const introWasBoolean=typeof source.introSeen==="boolean";
  const introValue=introWasBoolean?source.introSeen:true;
  const hadCalamityState=isObject(source.calamities);
  const hadMarkState=isObject(source.marks);
  const hadTitleState=isObject(source.titles);
  const hadSecondWorldState=isObject(source.secondWorld);
  const hadThirdWorldState=isObject(source.thirdWorld);
  const hadCivilizationLevel=Number.isFinite(Number(source?.secondWorld?.civilizationLevel));
  const hadArenaByWorld=isObject(source?.dungeon?.arenaByWorld);
  const hadLegacyArena=isObject(source?.dungeon?.arena);

  prepareAllGear(target);
  if(!introWasBoolean)target.introSeen=true;
  const retiredShopStateRemoved=cleanupRetiredShopState(target);
  const legacyDungeonFieldsRemoved=cleanupLegacyDungeonFields(target);
  const transientGmTestStateRemoved=cleanupTransientGmTestState(target);
  const normalize=typeof normalizer==="function"?normalizer:null;
  if(normalize)target=normalize(target);
  cleanupRetiredShopState(target);
  const expProgressMigrated=migrateExpProgress(target,version,source);

  if(typeof normalizeSecondWorldState==="function")normalizeSecondWorldState(target);
  if(typeof window.normalizeThirdWorldState==="function")window.normalizeThirdWorldState(target);
  if(typeof normalizeWorldSaveState==="function")normalizeWorldSaveState(target);
  if(typeof window.normalizeLevelProgressionState==="function")window.normalizeLevelProgressionState(target);
  prepareAllGear(target);
  if(typeof normalizeEnhancementState==="function")normalizeEnhancementState(target);
  if(typeof normalizeVipState==="function")normalizeVipState(target);
  if(typeof normalizeSpecializationState==="function")normalizeSpecializationState(target);
  if(typeof normalizeDailyState==="function")normalizeDailyState(target);
  if(typeof normalizeDungeonSaveState==="function")normalizeDungeonSaveState(target);
  if(typeof normalizeCivilizationCalamityState==="function")normalizeCivilizationCalamityState(target);
  if(typeof normalizePlayerTitleState==="function")normalizePlayerTitleState(target);
  cleanupLegacyDungeonFields(target);
  cleanupRetiredShopState(target);
  normalizeVoidMirage(target);
  if(typeof window.normalizeOfflineSaveState!=="function")throw new Error("Offline save normalization owner unavailable");
  window.normalizeOfflineSaveState(target,{sourceVersion:version});
  normalizePersistentFlags(target);

  target.introSeen=introValue;
  target.saveVersion=SAVE_SCHEMA_VERSION;
  window.LAST_SAVE_MIGRATION_REPORT={sourceVersion:version,targetVersion:SAVE_SCHEMA_VERSION,legacySupportPolicyVersion:SAVE_LEGACY_SUPPORT_POLICY_VERSION,minSupportedVersion:SAVE_MIN_SUPPORTED_VERSION,legacySupportMode:SAVE_LEGACY_SUPPORT_MODE,expProgressMigrated,legacyDungeonFieldsRemoved,retiredShopStateRemoved,transientGmTestStateRemoved,calamityStateInitialized:!hadCalamityState,markStateInitialized:!hadMarkState,titleStateInitialized:!hadTitleState,secondWorldStateInitialized:!hadSecondWorldState,thirdWorldStateInitialized:!hadThirdWorldState,civilizationLevelInitialized:!hadCivilizationLevel,arenaByWorldInitialized:!hadArenaByWorld,legacyArenaMigrated:hadLegacyArena&&!hadArenaByWorld};
  return target;
 };

 window.load=function(){
  let rawSnapshot=null,sourceVersion=SAVE_SCHEMA_VERSION,hadRaw=false,parseFailed=false;
  try{
   const raw=localStorage.getItem(SAVE_KEY);
   hadRaw=!!raw;
   if(raw){rawSnapshot=JSON.parse(raw);sourceVersion=sourceVersionOf(rawSnapshot?.saveVersion,SAVE_MIN_SUPPORTED_VERSION);}
  }catch(e){rawSnapshot=null;parseFailed=true;}

  const failProtectedLoad=(reason,error=null)=>{
   try{state=typeof newState==="function"?newState():{};}catch(_){state={saveVersion:SAVE_SCHEMA_VERSION};}
   const e=document.getElementById("saveStatus");if(e)e.textContent="本機存檔讀取失敗・已保護";
   window.LAST_SAVE_LOAD_REPORT={pipelineVersion:SAVE_LOAD_PIPELINE_VERSION,hadRaw,parseFailed,sourceVersion,targetVersion:SAVE_SCHEMA_VERSION,failed:true,reason:String(reason||"load-failed"),error:error?String(error?.message||error):""};
   console.error("[文明戰線] Local save load failed; original localStorage entry was preserved.",error||reason);
   return false;
  };

  if(hadRaw&&(parseFailed||!isObject(rawSnapshot)))return failProtectedLoad(parseFailed?"parse-failed":"invalid-root");
  try{
   const seed=isObject(rawSnapshot)?(cloneJson(rawSnapshot)||rawSnapshot):(typeof newState==="function"?newState():{});
   const normalizer=typeof window.normalizeSaveState==="function"?window.normalizeSaveState:null;
   state=window.migrateSave(seed,sourceVersion,normalizer,rawSnapshot);

   const dungeonFinalize=typeof window.finalizeDungeonLoadedState==="function"?window.finalizeDungeonLoadedState():null;
   if(typeof ensureDailyState==="function")ensureDailyState();
   selectedMap=Math.max(0,Math.min(Number(state.unlockedMap)||0,MAPS.length-1));
   if(typeof normalizeHP==="function")normalizeHP();
   cleanupRetiredShopState(state);
   normalizePersistentFlags(state);
   state.saveVersion=SAVE_SCHEMA_VERSION;
   if(typeof window.markSaveLoadResolved==="function")window.markSaveLoadResolved("local-load");
   if(typeof save==="function")save(false);

   window.LAST_SAVE_LOAD_REPORT={
    pipelineVersion:SAVE_LOAD_PIPELINE_VERSION,
    hadRaw,
    parseFailed,
    sourceVersion,
    targetVersion:SAVE_SCHEMA_VERSION,
    failed:false,
    legacySupportPolicyVersion:SAVE_LEGACY_SUPPORT_POLICY_VERSION,
    minSupportedVersion:SAVE_MIN_SUPPORTED_VERSION,
    legacySupportMode:SAVE_LEGACY_SUPPORT_MODE,
    expProgressMigrated:window.LAST_SAVE_MIGRATION_REPORT?.expProgressMigrated===true,
    legacyDungeonFieldsRemoved:window.LAST_SAVE_MIGRATION_REPORT?.legacyDungeonFieldsRemoved===true,
    retiredShopStateRemoved:window.LAST_SAVE_MIGRATION_REPORT?.retiredShopStateRemoved===true,
    transientGmTestStateRemoved:window.LAST_SAVE_MIGRATION_REPORT?.transientGmTestStateRemoved===true,
    calamityStateInitialized:window.LAST_SAVE_MIGRATION_REPORT?.calamityStateInitialized===true,
    markStateInitialized:window.LAST_SAVE_MIGRATION_REPORT?.markStateInitialized===true,
    titleStateInitialized:window.LAST_SAVE_MIGRATION_REPORT?.titleStateInitialized===true,
    secondWorldStateInitialized:window.LAST_SAVE_MIGRATION_REPORT?.secondWorldStateInitialized===true,
    thirdWorldStateInitialized:window.LAST_SAVE_MIGRATION_REPORT?.thirdWorldStateInitialized===true,
    civilizationLevelInitialized:window.LAST_SAVE_MIGRATION_REPORT?.civilizationLevelInitialized===true,
    arenaByWorldInitialized:window.LAST_SAVE_MIGRATION_REPORT?.arenaByWorldInitialized===true,
    legacyArenaMigrated:window.LAST_SAVE_MIGRATION_REPORT?.legacyArenaMigrated===true,
    recoveredInterruptedDungeonRun:dungeonFinalize?.recoveredInterruptedRun===true,
    recoveredInterruptedMirrorRun:dungeonFinalize?.recoveredInterruptedMirrorRun===true
   };
   return true;
  }catch(error){
   return failProtectedLoad("migration-failed",error);
  }
 };
})();