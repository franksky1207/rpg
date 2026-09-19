(function(){
 const SAVE_SCHEMA_VERSION=13;
 const SAVE_LOAD_PIPELINE_VERSION=2;
 const LEGACY_EXP_LAST_VERSION=9;
 const STAT_KEYS=["hp","atk","def","crit","dodge"];
 const OFFLINE_REAL_SAMPLE_LIMIT=20;
 const OFFLINE_BATTLE_SAMPLE_VERSION=2;
 const NORMAL_BATTLE_GAP_MS=140;
 const ELITE_BATTLE_GAP_MS=220;

 function isObject(value){return !!value&&typeof value==="object"&&!Array.isArray(value);}
 function finiteNonNegative(value,fallback=0){const n=Number(value);return Number.isFinite(n)&&n>=0?n:fallback;}
 function sourceVersionOf(value,fallback=1){const n=Math.floor(Number(value));return Number.isFinite(n)&&n>=1?n:fallback;}
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
 function normalizePersistentFlags(target){
  if(!isObject(target))return target;
  target.pendingBlackMarketEncounter=target.pendingBlackMarketEncounter===true;
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
 function sampleMultiplier(playerLevel,enemyLevel){
  const gap=Math.max(0,Math.floor(Number(playerLevel)||1)-Math.floor(Number(enemyLevel)||1));
  if(gap<=3)return 1;
  if(gap<=6)return 1.30;
  if(gap<=10)return 1.60;
  if(gap<=15)return 2;
  return null;
 }
 function normalizeRealBattleSamples(source){
  const rows=Array.isArray(source?.battleSamples)?source.battleSamples:[];
  source.battleSamples=rows.map(row=>{
   if(!isObject(row))return null;
   const actualMs=Math.round(Number(row.actualMs));
   const playerLevel=Math.max(1,Math.floor(Number(row.playerLevel)||1)),enemyLevel=Math.max(1,Math.floor(Number(row.enemyLevel)||1));
   const multiplier=sampleMultiplier(playerLevel,enemyLevel);
   if(multiplier==null||!Number.isFinite(actualMs)||actualMs<100||actualMs>300000)return null;
   const kind=row.kind==="elite"?"elite":"normal";
   const cycleMs=actualMs+(kind==="elite"?ELITE_BATTLE_GAP_MS:NORMAL_BATTLE_GAP_MS);
   const adjustedMs=Math.max(100,Math.round(cycleMs*multiplier));
   const map=Math.max(0,Math.floor(Number(row.map)||0)),enemy=Math.max(0,Math.floor(Number(row.enemy)||0)),recordedAt=Math.max(0,Math.floor(Number(row.recordedAt)||0));
   return {sampleVersion:OFFLINE_BATTLE_SAMPLE_VERSION,actualMs,cycleMs,adjustedMs,playerLevel,enemyLevel,kind,map,enemy,multiplier,recordedAt};
  }).filter(Boolean).slice(-OFFLINE_REAL_SAMPLE_LIMIT);
 }
 function normalizeOffline(target,version){
  if(!isObject(target))return;
  const now=Date.now();
  if(version<9||!isObject(target.offline)){
   target.offline={lastSettledAt:now,farmMap:null,farmEnemy:null,avgBattleMs:0,sampleCount:0,battleSamples:[],maxObservedWallClock:now,timeLockUntil:0};
   return;
  }
  const source=target.offline;
  const rawTime=source.lastSettledAt==null?NaN:Number(source.lastSettledAt);
  source.lastSettledAt=Number.isFinite(rawTime)&&rawTime>=0&&rawTime<=now?Math.floor(rawTime):now;
  const priorMax=Number(source.maxObservedWallClock);
  const observedCandidates=[now];
  if(Number.isFinite(priorMax)&&priorMax>=0)observedCandidates.push(priorMax);
  if(Number.isFinite(rawTime)&&rawTime>=0)observedCandidates.push(rawTime);
  source.maxObservedWallClock=Math.floor(Math.max(...observedCandidates));
  const lockUntil=Number(source.timeLockUntil);
  source.timeLockUntil=Number.isFinite(lockUntil)&&lockUntil>0?Math.floor(lockUntil):0;
  const map=source.farmMap==null?NaN:Number(source.farmMap),enemy=source.farmEnemy==null?NaN:Number(source.farmEnemy);
  source.farmMap=Number.isInteger(map)&&map>=0&&map<MAPS.length?map:null;
  source.farmEnemy=Number.isInteger(enemy)&&enemy>=0&&enemy<=3?enemy:null;
  const avg=Number(source.avgBattleMs);
  source.avgBattleMs=Number.isFinite(avg)&&avg>=600&&avg<=60000?Math.round(avg):0;
  source.sampleCount=Math.max(0,Math.min(20,Math.floor(Number(source.sampleCount)||0)));
  if(source.sampleCount<=0||source.avgBattleMs<=0||source.farmMap==null||source.farmEnemy==null){source.farmMap=null;source.farmEnemy=null;source.avgBattleMs=0;source.sampleCount=0;}
  normalizeRealBattleSamples(source);
 }
 function cloneJson(value){
  try{return JSON.parse(JSON.stringify(value));}catch(e){return null;}
 }

 window.SAVE_SCHEMA_VERSION=SAVE_SCHEMA_VERSION;
 window.SAVE_LOAD_PIPELINE_VERSION=SAVE_LOAD_PIPELINE_VERSION;
 window.OFFLINE_BATTLE_SAMPLE_VERSION=OFFLINE_BATTLE_SAMPLE_VERSION;
 window.cleanupLegacyDungeonFields=cleanupLegacyDungeonFields;
 window.cleanupRetiredShopState=cleanupRetiredShopState;
 window.normalizePersistentFlags=normalizePersistentFlags;
 if(typeof registerNewStateNormalizer==="function")registerNewStateNormalizer(normalizePersistentFlags);
 window.migrateSave=function(rawState,fromVersion=null,normalizer=null,sourceRaw=null){
  let target=isObject(rawState)?rawState:(typeof newState==="function"?newState():{});
  const source=isObject(sourceRaw)?sourceRaw:target;
  const version=sourceVersionOf(fromVersion??source.saveVersion,1);
  const introWasBoolean=typeof source.introSeen==="boolean";
  const introValue=introWasBoolean?source.introSeen:true;
  const hadCalamityState=isObject(source.calamities);
  const hadMarkState=isObject(source.marks);
  const hadTitleState=isObject(source.titles);

  prepareAllGear(target);
  if(!introWasBoolean)target.introSeen=true;
  const retiredShopStateRemoved=cleanupRetiredShopState(target);
  const legacyDungeonFieldsRemoved=cleanupLegacyDungeonFields(target);
  const normalize=typeof normalizer==="function"?normalizer:null;
  if(normalize)target=normalize(target);
  cleanupRetiredShopState(target);
  const expProgressMigrated=migrateExpProgress(target,version,source);

  prepareAllGear(target);
  if(typeof normalizeWorldSaveState==="function")normalizeWorldSaveState(target);
  if(typeof normalizeVipState==="function")normalizeVipState(target);
  if(typeof normalizeSpecializationState==="function")normalizeSpecializationState(target);
  if(typeof normalizeEnhancementState==="function")normalizeEnhancementState(target);
  if(typeof normalizeDailyState==="function")normalizeDailyState(target);
  if(typeof normalizeDungeonSaveState==="function")normalizeDungeonSaveState(target);
  if(typeof normalizeCivilizationCalamityState==="function")normalizeCivilizationCalamityState(target);
  if(typeof normalizePlayerTitleState==="function")normalizePlayerTitleState(target);
  cleanupLegacyDungeonFields(target);
  cleanupRetiredShopState(target);
  normalizeVoidMirage(target);
  normalizeOffline(target,version);
  normalizePersistentFlags(target);

  target.introSeen=introValue;
  target.saveVersion=SAVE_SCHEMA_VERSION;
  window.LAST_SAVE_MIGRATION_REPORT={sourceVersion:version,targetVersion:SAVE_SCHEMA_VERSION,expProgressMigrated,legacyDungeonFieldsRemoved,retiredShopStateRemoved,calamityStateInitialized:!hadCalamityState,markStateInitialized:!hadMarkState,titleStateInitialized:!hadTitleState};
  return target;
 };

 window.load=function(){
  let rawSnapshot=null,sourceVersion=SAVE_SCHEMA_VERSION,hadRaw=false,parseFailed=false;
  try{
   const raw=localStorage.getItem(SAVE_KEY);
   hadRaw=!!raw;
   if(raw){rawSnapshot=JSON.parse(raw);sourceVersion=sourceVersionOf(rawSnapshot?.saveVersion,1);}
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
    expProgressMigrated:window.LAST_SAVE_MIGRATION_REPORT?.expProgressMigrated===true,
    legacyDungeonFieldsRemoved:window.LAST_SAVE_MIGRATION_REPORT?.legacyDungeonFieldsRemoved===true,
    retiredShopStateRemoved:window.LAST_SAVE_MIGRATION_REPORT?.retiredShopStateRemoved===true,
    calamityStateInitialized:window.LAST_SAVE_MIGRATION_REPORT?.calamityStateInitialized===true,
    markStateInitialized:window.LAST_SAVE_MIGRATION_REPORT?.markStateInitialized===true,
    titleStateInitialized:window.LAST_SAVE_MIGRATION_REPORT?.titleStateInitialized===true,
    recoveredInterruptedDungeonRun:dungeonFinalize?.recoveredInterruptedRun===true,
    recoveredInterruptedMirrorRun:dungeonFinalize?.recoveredInterruptedMirrorRun===true
   };
   return true;
  }catch(error){
   return failProtectedLoad("migration-failed",error);
  }
 };
})();