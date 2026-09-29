(function(){
 const VERSION=1;
 const SCHEMA_EVOLUTION_POLICY_VERSION=1;
 const SAVE_SAFETY_VERSION=2;
 const SAVE_CAPACITY_DIAGNOSTIC_VERSION=1;
 const SAVE_MIGRATION_STAIRCASE_VERSION=1;
 const SAVE_SAFETY_BACKUP_SUFFIX=".safety-backup-v1";
 const SAVE_SAFETY_META_SUFFIX=".safety-backup-meta-v1";
 const PRE_SCHEMA16_BACKUP_SUFFIX=".pre-schema16-backup-v1";
 const SAVE_CAPACITY_WARNING_BYTES=2*1024*1024;
 const SAVE_CAPACITY_CRITICAL_BYTES=4*1024*1024;
 const SAVE_MIGRATION_STAGES=Object.freeze([
  Object.freeze({id:"legacy-exp-progress",label:"Legacy EXP progress",minVersion:1,maxVersion:9,conditional:true}),
  Object.freeze({id:"pre-schema16-compatibility",label:"Pre-Schema16 compatibility",minVersion:1,maxVersion:15,conditional:true}),
  Object.freeze({id:"canonical-normalization",label:"Canonical root normalization",minVersion:1,maxVersion:16,conditional:false}),
  Object.freeze({id:"world-phase-normalization",label:"World phase and level normalization",minVersion:1,maxVersion:16,conditional:false}),
  Object.freeze({id:"subsystem-normalization",label:"Subsystem normalization",minVersion:1,maxVersion:16,conditional:false}),
  Object.freeze({id:"finalize-current-schema",label:"Finalize current schema",minVersion:1,maxVersion:16,conditional:false})
 ]);
 const SCHEMA_EVOLUTION_POLICY=Object.freeze({
  currentSchema:16,
  sameSchemaAllowed:Object.freeze(["additive-optional-field","normalization-only"]),
  schemaBumpRequired:Object.freeze(["semantic-reinterpretation","persistent-field-removal","incompatible-structure"]),
  schema16ThirdWorld:Object.freeze({coreProgressOptional:true,missingCoreProgressDefaultsTo:0,preSchema16ThirdWorld:"discard-development-data"})
 });
 function isObject(value){return !!value&&typeof value==="object"&&!Array.isArray(value);}
 function currentVersion(){return Math.max(1,Math.floor(Number(window.SAVE_SCHEMA_VERSION)||1));}
 function minimumVersion(){return Math.max(1,Math.floor(Number(window.SAVE_MIN_SUPPORTED_VERSION)||1));}
 function sourceVersion(raw,explicitVersion=null){const candidate=explicitVersion??raw?.saveVersion,n=Math.floor(Number(candidate));return Number.isFinite(n)&&n>=1?n:minimumVersion();}
 function compatibility(raw,explicitVersion=null){const source=sourceVersion(raw,explicitVersion),current=currentVersion(),minimum=minimumVersion(),isFuture=source>current,isTooOld=source<minimum;return {version:VERSION,sourceVersion:source,currentVersion:current,minSupportedVersion:minimum,isLegacy:source<current&&!isTooOld,isFuture,isTooOld,supported:!isFuture&&!isTooOld};}
 function schemaChangeRequiresBump(kind){const key=String(kind||"").trim();if(SCHEMA_EVOLUTION_POLICY.sameSchemaAllowed.includes(key))return false;if(SCHEMA_EVOLUTION_POLICY.schemaBumpRequired.includes(key))return true;return null;}
 function assertSupported(raw,options={}){
  const label=String(options.label||"存檔");if(!isObject(raw))throw new Error(`${label}內容無效。`);
  const info=compatibility(raw,options.version??null);
  if(info.isFuture){const error=new Error(`${label}版本（${info.sourceVersion}）高於目前遊戲版本（${info.currentVersion}），已停止讀取以保護較新的存檔。`);error.code="FUTURE_SAVE_VERSION";error.saveCompatibility=info;throw error;}
  if(info.isTooOld){const error=new Error(`${label}版本（${info.sourceVersion}）低於目前最低支援版本（${info.minSupportedVersion}），無法安全讀取。`);error.code="UNSUPPORTED_LEGACY_SAVE_VERSION";error.saveCompatibility=info;throw error;}
  return info;
 }
 function byteLength(text){const value=String(text??"");try{return typeof Blob==="function"?new Blob([value]).size:value.length*2;}catch(_){return value.length*2;}}
 function capacityLevelForBytes(bytes){const n=Math.max(0,Number(bytes)||0);return n>=SAVE_CAPACITY_CRITICAL_BYTES?"critical":n>=SAVE_CAPACITY_WARNING_BYTES?"warning":"normal";}
 function serializeStateForCapacity(target=null){try{const value=target??(typeof state!=="undefined"?state:null),raw=JSON.stringify(value);return {ok:true,raw,bytes:byteLength(raw),error:""};}catch(error){return {ok:false,raw:"",bytes:0,error:String(error?.message||error)};}}
 function storageSnapshot(){
  let totalBytes=0,entries=0,saveRaw="",backupRaw="",readFailed=false;
  try{for(let i=0;i<localStorage.length;i++){const key=localStorage.key(i);if(key==null)continue;const value=localStorage.getItem(key)||"";entries++;totalBytes+=byteLength(key)+byteLength(value);}saveRaw=localStorage.getItem(SAVE_KEY)||"";backupRaw=localStorage.getItem(`${SAVE_KEY}${SAVE_SAFETY_BACKUP_SUFFIX}`)||"";}catch(_){readFailed=true;}
  const projected=serializeStateForCapacity();
  const saveBytes=byteLength(saveRaw),backupBytes=byteLength(backupRaw),projectedBytes=projected.ok?projected.bytes:saveBytes;
  return {version:SAVE_SAFETY_VERSION,capacityDiagnosticVersion:SAVE_CAPACITY_DIAGNOSTIC_VERSION,entries,totalApproxBytes:totalBytes,saveApproxBytes:saveBytes,backupApproxBytes:backupBytes,projectedSaveBytes:projectedBytes,capacityLevel:capacityLevelForBytes(projectedBytes),warningThresholdBytes:SAVE_CAPACITY_WARNING_BYTES,criticalThresholdBytes:SAVE_CAPACITY_CRITICAL_BYTES,inventoryCount:Array.isArray(window.state?.inventory)?window.state.inventory.length:(typeof state!=="undefined"&&Array.isArray(state?.inventory)?state.inventory.length:0),lostGearCount:Array.isArray(window.state?.lostGear)?window.state.lostGear.length:(typeof state!=="undefined"&&Array.isArray(state?.lostGear)?state.lostGear.length:0),serializationOk:projected.ok,serializationError:projected.error,readFailed};
 }
 function capacitySnapshot(){const snapshot=storageSnapshot();return {...snapshot,recommendation:snapshot.capacityLevel==="critical"?"建議立即匯出 JSON 備份並整理不需要的裝備。":snapshot.capacityLevel==="warning"?"建議定期匯出 JSON 備份並留意背包成長。":"目前容量診斷正常。"};}
 function writeVerified(key,value){localStorage.setItem(key,value);if(localStorage.getItem(key)!==value)throw new Error("寫入後驗證失敗。");return true;}
 function safetyBackupKey(){return `${SAVE_KEY}${SAVE_SAFETY_BACKUP_SUFFIX}`;}
 function safetyMetaKey(){return `${SAVE_KEY}${SAVE_SAFETY_META_SUFFIX}`;}
 function createSafetyBackup(reason="manual",rawOverride=null){
  const report={version:SAVE_SAFETY_VERSION,reason:String(reason||"manual"),required:false,created:false,verified:false,failed:false,key:safetyBackupKey(),bytes:0,error:"",snapshotBefore:storageSnapshot()};let raw="";
  try{raw=typeof rawOverride==="string"?rawOverride:(localStorage.getItem(SAVE_KEY)||"");}catch(error){report.failed=true;report.error=String(error?.message||error);window.LAST_LOCAL_SAVE_SAFETY_REPORT=report;return report;}
  if(!raw){report.verified=true;window.LAST_LOCAL_SAVE_SAFETY_REPORT=report;return report;}
  report.required=true;report.bytes=byteLength(raw);
  try{writeVerified(report.key,raw);report.created=true;report.verified=true;try{localStorage.setItem(safetyMetaKey(),JSON.stringify({version:SAVE_SAFETY_VERSION,reason:report.reason,createdAt:Date.now(),bytes:report.bytes}));}catch(_){}}catch(error){report.failed=true;report.error=String(error?.message||error);}
  report.snapshotAfter=storageSnapshot();window.LAST_LOCAL_SAVE_SAFETY_REPORT=report;return report;
 }
 function strictPreSchema16Backup(rawText,parsed){
  const source=sourceVersion(parsed),report={version:SAVE_SAFETY_VERSION,required:source<16,sourceVersion:source,ok:true,created:false,verified:false,usedSafetyBackup:false,key:`${SAVE_KEY}${PRE_SCHEMA16_BACKUP_SUFFIX}`,error:""};
  if(!report.required||typeof rawText!=="string"||!rawText){report.verified=true;return report;}
  try{const existing=localStorage.getItem(report.key);if(existing===rawText){report.verified=true;return report;}if(existing==null){writeVerified(report.key,rawText);report.created=true;report.verified=true;return report;}const rolling=createSafetyBackup("pre-schema16-current",rawText);if(rolling.verified===true&&!rolling.failed){report.usedSafetyBackup=true;report.verified=true;return report;}throw new Error(rolling.error||"無法建立目前舊存檔的安全備份。");}catch(error){report.ok=false;report.error=String(error?.message||error);return report;}
 }
 function protectedLoadFailure(reason,sourceVersionValue,error=""){
  try{state=typeof newState==="function"?newState():{};}catch(_){state={saveVersion:currentVersion()};}
  const status=document.getElementById("saveStatus");if(status)status.textContent="本機存檔備份失敗・已保護";
  window.LAST_SAVE_LOAD_REPORT={pipelineVersion:Number(window.SAVE_LOAD_PIPELINE_VERSION)||0,hadRaw:true,parseFailed:false,sourceVersion:sourceVersionValue,targetVersion:currentVersion(),failed:true,reason:String(reason||"save-safety-failed"),error:String(error||""),saveSafetyVersion:SAVE_SAFETY_VERSION};console.error("[文明戰線] Save safety preflight failed; original localStorage entry was preserved.",error||reason);return false;
 }
 function migrationPlanForVersion(version){
  const source=Math.max(minimumVersion(),Math.floor(Number(version)||minimumVersion()));
  return SAVE_MIGRATION_STAGES.filter(stage=>!stage.conditional||(stage.id==="legacy-exp-progress"?source<=9:stage.id==="pre-schema16-compatibility"?source<16:true)).map(stage=>({id:stage.id,label:stage.label,sourceVersion:source,targetVersion:currentVersion()}));
 }
 function augmentMigrationReport(source,plan){const previous=isObject(window.LAST_SAVE_MIGRATION_REPORT)?window.LAST_SAVE_MIGRATION_REPORT:{};window.LAST_SAVE_MIGRATION_REPORT={...previous,migrationStaircaseVersion:SAVE_MIGRATION_STAIRCASE_VERSION,migrationStageCount:plan.length,migrationStages:plan.map(stage=>stage.id),migrationPlan:plan,sourceVersion:Number(previous.sourceVersion)||source,targetVersion:Number(previous.targetVersion)||currentVersion()};return window.LAST_SAVE_MIGRATION_REPORT;}
 function runSaveMigrationStaircaseRegression(){
  const previous=window.LAST_SAVE_MIGRATION_REPORT,errors=[],cases=[];
  const fixtures=[
   {id:"V1_LEGACY_CORE",source:{saveVersion:1,level:10,exp:0},expected:["legacy-exp-progress","pre-schema16-compatibility","canonical-normalization","world-phase-normalization","subsystem-normalization","finalize-current-schema"]},
   {id:"V9_LEGACY_EXP",source:{saveVersion:9,level:100,exp:1},expected:["legacy-exp-progress","pre-schema16-compatibility","canonical-normalization","world-phase-normalization","subsystem-normalization","finalize-current-schema"]},
   {id:"V15_PRE_WORLD3",source:{saveVersion:15,level:1000,exp:0,secondWorld:{entered:true},thirdWorld:{entered:true}},expected:["pre-schema16-compatibility","canonical-normalization","world-phase-normalization","subsystem-normalization","finalize-current-schema"]},
   {id:"V16_CURRENT",source:{saveVersion:16,level:1000,exp:0,secondWorld:{entered:true},thirdWorld:{entered:false}},expected:["canonical-normalization","world-phase-normalization","subsystem-normalization","finalize-current-schema"]}
  ];
  try{fixtures.forEach(fixture=>{const plan=migrationPlanForVersion(fixture.source.saveVersion),ids=plan.map(x=>x.id),ok=JSON.stringify(ids)===JSON.stringify(fixture.expected);cases.push({id:fixture.id,ok,stages:ids});if(!ok)errors.push({code:fixture.id,expected:fixture.expected,actual:ids});});}finally{window.LAST_SAVE_MIGRATION_REPORT=previous;}
  const report={version:SAVE_MIGRATION_STAIRCASE_VERSION,passed:errors.length===0,errors,cases,checkedAt:Date.now()};window.SAVE_MIGRATION_STAIRCASE_REGRESSION_REPORT=report;return report;
 }
 function installLateDestructiveGuards(){
  if(typeof window.resetGame==="function"&&window.resetGame.__saveSafetyWrapped!==true){const baseReset=window.resetGame,guarded=function(){const backup=createSafetyBackup("reset-game");if(backup.required&&(!backup.verified||backup.failed)){alert(`無法建立重置前安全備份，已取消清除進度。\n\n${backup.error||"請先匯出 JSON 或清理瀏覽器儲存空間。"}`);return false;}return baseReset.apply(this,arguments);};guarded.__saveSafetyWrapped=true;window.resetGame=guarded;}
  if(typeof window.gmImportSaveJsonFile==="function"&&window.gmImportSaveJsonFile.__saveSafetyWrapped!==true){const baseImport=window.gmImportSaveJsonFile,guardedImport=async function(input){const backup=createSafetyBackup("gm-import");if(backup.required&&(!backup.verified||backup.failed)){if(input)input.value="";alert(`無法建立匯入前安全備份，已取消匯入。\n\n${backup.error||"請先清理瀏覽器儲存空間。"}`);return false;}return baseImport.call(this,input);};guardedImport.__saveSafetyWrapped=true;window.gmImportSaveJsonFile=guardedImport;}
 }

 const baseMigrate=window.migrateSave;
 if(typeof baseMigrate==="function"){
  window.migrateSave=function(rawState,fromVersion=null,normalizer=null,sourceRaw=null){const source=isObject(sourceRaw)?sourceRaw:rawState,info=assertSupported(source,{version:fromVersion,label:"存檔"}),plan=migrationPlanForVersion(info.sourceVersion),result=baseMigrate(rawState,fromVersion,normalizer,sourceRaw);augmentMigrationReport(info.sourceVersion,plan);return result;};
 }

 const baseLoad=window.load;
 if(typeof baseLoad==="function"){
  window.load=function(){
   let raw=null,parsed=null;
   try{raw=localStorage.getItem(SAVE_KEY);if(raw){parsed=JSON.parse(raw);const info=compatibility(parsed);if(info.isFuture||info.isTooOld){try{state=typeof newState==="function"?newState():{};}catch(_){state={saveVersion:currentVersion()};}const status=document.getElementById("saveStatus");if(status)status.textContent=info.isFuture?"本機存檔版本較新・已保護":"本機存檔版本過舊・已保護";const reason=info.isFuture?"future-version":"unsupported-legacy-version";window.LAST_SAVE_LOAD_REPORT={pipelineVersion:Number(window.SAVE_LOAD_PIPELINE_VERSION)||0,hadRaw:true,parseFailed:false,sourceVersion:info.sourceVersion,targetVersion:info.currentVersion,minSupportedVersion:info.minSupportedVersion,failed:true,reason,error:""};console.error(`[文明戰線] Local save v${info.sourceVersion} is outside supported range v${info.minSupportedVersion}–v${info.currentVersion}; original localStorage entry was preserved.`);return false;}if(info.sourceVersion<16){const backup=strictPreSchema16Backup(raw,parsed);window.LAST_PRE_SCHEMA16_SAVE_SAFETY_REPORT=backup;if(!backup.ok||!backup.verified)return protectedLoadFailure("pre-schema16-backup-failed",info.sourceVersion,backup.error);}}}catch(_){/* parse/shape errors stay owned by the canonical load pipeline */}
   return baseLoad();
  };
  try{load=window.load;}catch(_){}
 }

 const baseSave=typeof window.save==="function"?window.save:null;
 if(baseSave){
  window.save=function(show=true){
   const before=storageSnapshot(),projected=serializeStateForCapacity(),ok=projected.ok?baseSave(show):false,after=storageSnapshot(),capacityLevel=capacityLevelForBytes(projected.bytes||before.projectedSaveBytes),lastEngineError=window.LAST_SAVE_ERROR||null;
   const failureKind=ok!==false?null:!projected.ok?"serialization-failed":capacityLevel==="critical"?"capacity-risk-write-failed":"storage-write-failed";
   const report={version:SAVE_SAFETY_VERSION,capacityDiagnosticVersion:SAVE_CAPACITY_DIAGNOSTIC_VERSION,ok:ok!==false,before,after,projectedSaveBytes:projected.bytes,capacityLevel,failureKind,serializationError:projected.error,engineError:lastEngineError,inventoryCount:before.inventoryCount,lostGearCount:before.lostGearCount,checkedAt:Date.now()};window.LAST_LOCAL_SAVE_WRITE_REPORT=report;
   if(capacityLevel!=="normal")console.warn(`[文明戰線] Local save capacity ${capacityLevel}: ${projected.bytes} bytes; inventory=${before.inventoryCount}, lostGear=${before.lostGearCount}.`);
   if(ok===false){const e=document.getElementById("saveStatus");if(e)e.textContent=capacityLevel==="critical"?"存檔空間風險・請先匯出 JSON":"存檔失敗・請先匯出 JSON";}
   return ok!==false;
  };
  try{save=window.save;}catch(_){}
 }

 window.SAVE_FUTURE_VERSION_GUARD_VERSION=VERSION;
 window.SAVE_SCHEMA_EVOLUTION_POLICY_VERSION=SCHEMA_EVOLUTION_POLICY_VERSION;
 window.SAVE_SCHEMA_EVOLUTION_POLICY=SCHEMA_EVOLUTION_POLICY;
 window.SAVE_SAFETY_VERSION=SAVE_SAFETY_VERSION;
 window.SAVE_CAPACITY_DIAGNOSTIC_VERSION=SAVE_CAPACITY_DIAGNOSTIC_VERSION;
 window.SAVE_CAPACITY_WARNING_BYTES=SAVE_CAPACITY_WARNING_BYTES;
 window.SAVE_CAPACITY_CRITICAL_BYTES=SAVE_CAPACITY_CRITICAL_BYTES;
 window.SAVE_MIGRATION_STAIRCASE_VERSION=SAVE_MIGRATION_STAIRCASE_VERSION;
 window.SAVE_MIGRATION_STAGES=SAVE_MIGRATION_STAGES.map(stage=>({...stage}));
 window.SAVE_SAFETY_BACKUP_SUFFIX=SAVE_SAFETY_BACKUP_SUFFIX;
 window.saveSchemaChangeRequiresBump=schemaChangeRequiresBump;
 window.saveCompatibilityFor=compatibility;
 window.assertSaveVersionSupported=assertSupported;
 window.localSaveSafetySnapshot=storageSnapshot;
 window.localSaveCapacitySnapshot=capacitySnapshot;
 window.saveMigrationPlanForVersion=migrationPlanForVersion;
 window.runSaveMigrationStaircaseRegression=runSaveMigrationStaircaseRegression;
 window.ensureLocalSaveSafetyBackup=createSafetyBackup;
 window.installLocalSaveDestructiveGuards=installLateDestructiveGuards;
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",installLateDestructiveGuards,{once:true});else setTimeout(installLateDestructiveGuards,0);
})();
