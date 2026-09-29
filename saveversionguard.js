(function(){
 const VERSION=1;
 const SCHEMA_EVOLUTION_POLICY_VERSION=1;
 const SAVE_SAFETY_VERSION=1;
 const SAVE_SAFETY_BACKUP_SUFFIX=".safety-backup-v1";
 const SAVE_SAFETY_META_SUFFIX=".safety-backup-meta-v1";
 const PRE_SCHEMA16_BACKUP_SUFFIX=".pre-schema16-backup-v1";
 const SCHEMA_EVOLUTION_POLICY=Object.freeze({
  currentSchema:16,
  sameSchemaAllowed:Object.freeze(["additive-optional-field","normalization-only"]),
  schemaBumpRequired:Object.freeze(["semantic-reinterpretation","persistent-field-removal","incompatible-structure"]),
  schema16ThirdWorld:Object.freeze({coreProgressOptional:true,missingCoreProgressDefaultsTo:0,preSchema16ThirdWorld:"discard-development-data"})
 });
 function isObject(value){return !!value&&typeof value==="object"&&!Array.isArray(value);}
 function currentVersion(){return Math.max(1,Math.floor(Number(window.SAVE_SCHEMA_VERSION)||1));}
 function minimumVersion(){return Math.max(1,Math.floor(Number(window.SAVE_MIN_SUPPORTED_VERSION)||1));}
 function sourceVersion(raw,explicitVersion=null){
  const candidate=explicitVersion??raw?.saveVersion;
  const n=Math.floor(Number(candidate));
  return Number.isFinite(n)&&n>=1?n:minimumVersion();
 }
 function compatibility(raw,explicitVersion=null){
  const source=sourceVersion(raw,explicitVersion),current=currentVersion(),minimum=minimumVersion();
  const isFuture=source>current,isTooOld=source<minimum;
  return {version:VERSION,sourceVersion:source,currentVersion:current,minSupportedVersion:minimum,isLegacy:source<current&&!isTooOld,isFuture,isTooOld,supported:!isFuture&&!isTooOld};
 }
 function schemaChangeRequiresBump(kind){
  const key=String(kind||"").trim();
  if(SCHEMA_EVOLUTION_POLICY.sameSchemaAllowed.includes(key))return false;
  if(SCHEMA_EVOLUTION_POLICY.schemaBumpRequired.includes(key))return true;
  return null;
 }
 function assertSupported(raw,options={}){
  const label=String(options.label||"存檔");
  if(!isObject(raw))throw new Error(`${label}內容無效。`);
  const info=compatibility(raw,options.version??null);
  if(info.isFuture){
   const error=new Error(`${label}版本（${info.sourceVersion}）高於目前遊戲版本（${info.currentVersion}），已停止讀取以保護較新的存檔。`);
   error.code="FUTURE_SAVE_VERSION";
   error.saveCompatibility=info;
   throw error;
  }
  if(info.isTooOld){
   const error=new Error(`${label}版本（${info.sourceVersion}）低於目前最低支援版本（${info.minSupportedVersion}），無法安全讀取。`);
   error.code="UNSUPPORTED_LEGACY_SAVE_VERSION";
   error.saveCompatibility=info;
   throw error;
  }
  return info;
 }
 function byteLength(text){
  const value=String(text??"");
  try{return typeof Blob==="function"?new Blob([value]).size:value.length*2;}catch(_){return value.length*2;}
 }
 function storageSnapshot(){
  let totalBytes=0,entries=0,saveRaw="",backupRaw="",readFailed=false;
  try{
   for(let i=0;i<localStorage.length;i++){
    const key=localStorage.key(i);if(key==null)continue;
    const value=localStorage.getItem(key)||"";entries++;totalBytes+=byteLength(key)+byteLength(value);
   }
   saveRaw=localStorage.getItem(SAVE_KEY)||"";
   backupRaw=localStorage.getItem(`${SAVE_KEY}${SAVE_SAFETY_BACKUP_SUFFIX}`)||"";
  }catch(_){readFailed=true;}
  return {version:SAVE_SAFETY_VERSION,entries,totalApproxBytes:totalBytes,saveApproxBytes:byteLength(saveRaw),backupApproxBytes:byteLength(backupRaw),inventoryCount:Array.isArray(window.state?.inventory)?window.state.inventory.length:(typeof state!=="undefined"&&Array.isArray(state?.inventory)?state.inventory.length:0),lostGearCount:Array.isArray(window.state?.lostGear)?window.state.lostGear.length:(typeof state!=="undefined"&&Array.isArray(state?.lostGear)?state.lostGear.length:0),readFailed};
 }
 function writeVerified(key,value){
  localStorage.setItem(key,value);
  if(localStorage.getItem(key)!==value)throw new Error("寫入後驗證失敗。");
  return true;
 }
 function safetyBackupKey(){return `${SAVE_KEY}${SAVE_SAFETY_BACKUP_SUFFIX}`;}
 function safetyMetaKey(){return `${SAVE_KEY}${SAVE_SAFETY_META_SUFFIX}`;}
 function createSafetyBackup(reason="manual",rawOverride=null){
  const report={version:SAVE_SAFETY_VERSION,reason:String(reason||"manual"),required:false,created:false,verified:false,failed:false,key:safetyBackupKey(),bytes:0,error:"",snapshotBefore:storageSnapshot()};
  let raw="";
  try{raw=typeof rawOverride==="string"?rawOverride:(localStorage.getItem(SAVE_KEY)||"");}catch(error){report.failed=true;report.error=String(error?.message||error);window.LAST_LOCAL_SAVE_SAFETY_REPORT=report;return report;}
  if(!raw){report.verified=true;window.LAST_LOCAL_SAVE_SAFETY_REPORT=report;return report;}
  report.required=true;report.bytes=byteLength(raw);
  try{
   writeVerified(report.key,raw);report.created=true;report.verified=true;
   try{localStorage.setItem(safetyMetaKey(),JSON.stringify({version:SAVE_SAFETY_VERSION,reason:report.reason,createdAt:Date.now(),bytes:report.bytes}));}catch(_){}
  }catch(error){report.failed=true;report.error=String(error?.message||error);}
  report.snapshotAfter=storageSnapshot();window.LAST_LOCAL_SAVE_SAFETY_REPORT=report;return report;
 }
 function strictPreSchema16Backup(rawText,parsed){
  const source=sourceVersion(parsed),report={version:SAVE_SAFETY_VERSION,required:source<16,sourceVersion:source,ok:true,created:false,verified:false,usedSafetyBackup:false,key:`${SAVE_KEY}${PRE_SCHEMA16_BACKUP_SUFFIX}`,error:""};
  if(!report.required||typeof rawText!=="string"||!rawText){report.verified=true;return report;}
  try{
   const existing=localStorage.getItem(report.key);
   if(existing===rawText){report.verified=true;return report;}
   if(existing==null){writeVerified(report.key,rawText);report.created=true;report.verified=true;return report;}
   const rolling=createSafetyBackup("pre-schema16-current",rawText);
   if(rolling.verified===true&&!rolling.failed){report.usedSafetyBackup=true;report.verified=true;return report;}
   throw new Error(rolling.error||"無法建立目前舊存檔的安全備份。");
  }catch(error){report.ok=false;report.error=String(error?.message||error);return report;}
 }
 function protectedLoadFailure(reason,sourceVersionValue,error=""){
  try{state=typeof newState==="function"?newState():{};}catch(_){state={saveVersion:currentVersion()};}
  const status=document.getElementById("saveStatus");if(status)status.textContent="本機存檔備份失敗・已保護";
  window.LAST_SAVE_LOAD_REPORT={pipelineVersion:Number(window.SAVE_LOAD_PIPELINE_VERSION)||0,hadRaw:true,parseFailed:false,sourceVersion:sourceVersionValue,targetVersion:currentVersion(),failed:true,reason:String(reason||"save-safety-failed"),error:String(error||""),saveSafetyVersion:SAVE_SAFETY_VERSION};
  console.error("[文明戰線] Save safety preflight failed; original localStorage entry was preserved.",error||reason);
  return false;
 }
 function installLateDestructiveGuards(){
  if(typeof window.resetGame==="function"&&window.resetGame.__saveSafetyWrapped!==true){
   const baseReset=window.resetGame;
   const guarded=function(){
    const backup=createSafetyBackup("reset-game");
    if(backup.required&&(!backup.verified||backup.failed)){alert(`無法建立重置前安全備份，已取消清除進度。\n\n${backup.error||"請先匯出 JSON 或清理瀏覽器儲存空間。"}`);return false;}
    return baseReset.apply(this,arguments);
   };
   guarded.__saveSafetyWrapped=true;window.resetGame=guarded;
  }
  if(typeof window.gmImportSaveJsonFile==="function"&&window.gmImportSaveJsonFile.__saveSafetyWrapped!==true){
   const baseImport=window.gmImportSaveJsonFile;
   const guardedImport=async function(input){
    const backup=createSafetyBackup("gm-import");
    if(backup.required&&(!backup.verified||backup.failed)){if(input)input.value="";alert(`無法建立匯入前安全備份，已取消匯入。\n\n${backup.error||"請先清理瀏覽器儲存空間。"}`);return false;}
    return baseImport.call(this,input);
   };
   guardedImport.__saveSafetyWrapped=true;window.gmImportSaveJsonFile=guardedImport;
  }
 }

 const baseMigrate=window.migrateSave;
 if(typeof baseMigrate==="function"){
  window.migrateSave=function(rawState,fromVersion=null,normalizer=null,sourceRaw=null){
   const source=isObject(sourceRaw)?sourceRaw:rawState;
   assertSupported(source,{version:fromVersion,label:"存檔"});
   return baseMigrate(rawState,fromVersion,normalizer,sourceRaw);
  };
 }

 const baseLoad=window.load;
 if(typeof baseLoad==="function"){
  window.load=function(){
   let raw=null,parsed=null;
   try{
    raw=localStorage.getItem(SAVE_KEY);
    if(raw){
     parsed=JSON.parse(raw);
     const info=compatibility(parsed);
     if(info.isFuture||info.isTooOld){
      try{state=typeof newState==="function"?newState():{};}catch(_){state={saveVersion:currentVersion()};}
      const status=document.getElementById("saveStatus");if(status)status.textContent=info.isFuture?"本機存檔版本較新・已保護":"本機存檔版本過舊・已保護";
      const reason=info.isFuture?"future-version":"unsupported-legacy-version";
      window.LAST_SAVE_LOAD_REPORT={pipelineVersion:Number(window.SAVE_LOAD_PIPELINE_VERSION)||0,hadRaw:true,parseFailed:false,sourceVersion:info.sourceVersion,targetVersion:info.currentVersion,minSupportedVersion:info.minSupportedVersion,failed:true,reason,error:""};
      console.error(`[文明戰線] Local save v${info.sourceVersion} is outside supported range v${info.minSupportedVersion}–v${info.currentVersion}; original localStorage entry was preserved.`);
      return false;
     }
     if(info.sourceVersion<16){
      const backup=strictPreSchema16Backup(raw,parsed);window.LAST_PRE_SCHEMA16_SAVE_SAFETY_REPORT=backup;
      if(!backup.ok||!backup.verified)return protectedLoadFailure("pre-schema16-backup-failed",info.sourceVersion,backup.error);
     }
    }
   }catch(_){/* parse/shape errors stay owned by the canonical load pipeline */}
   return baseLoad();
  };
  try{load=window.load;}catch(_){}
 }

 const baseSave=typeof window.save==="function"?window.save:null;
 if(baseSave){
  window.save=function(show=true){
   const before=storageSnapshot(),ok=baseSave(show),after=storageSnapshot();
   window.LAST_LOCAL_SAVE_WRITE_REPORT={version:SAVE_SAFETY_VERSION,ok:ok!==false,before,after,checkedAt:Date.now()};
   return ok;
  };
  try{save=window.save;}catch(_){}
 }

 window.SAVE_FUTURE_VERSION_GUARD_VERSION=VERSION;
 window.SAVE_SCHEMA_EVOLUTION_POLICY_VERSION=SCHEMA_EVOLUTION_POLICY_VERSION;
 window.SAVE_SCHEMA_EVOLUTION_POLICY=SCHEMA_EVOLUTION_POLICY;
 window.SAVE_SAFETY_VERSION=SAVE_SAFETY_VERSION;
 window.SAVE_SAFETY_BACKUP_SUFFIX=SAVE_SAFETY_BACKUP_SUFFIX;
 window.saveSchemaChangeRequiresBump=schemaChangeRequiresBump;
 window.saveCompatibilityFor=compatibility;
 window.assertSaveVersionSupported=assertSupported;
 window.localSaveSafetySnapshot=storageSnapshot;
 window.ensureLocalSaveSafetyBackup=createSafetyBackup;
 window.installLocalSaveDestructiveGuards=installLateDestructiveGuards;
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",installLateDestructiveGuards,{once:true});else setTimeout(installLateDestructiveGuards,0);
})();
