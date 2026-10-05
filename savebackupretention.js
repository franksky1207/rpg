(function(){
 const VERSION=1;
 const POLICY=Object.freeze({
  rollingSafety:Object.freeze({suffix:".safety-backup-v1",retain:"latest",automaticDelete:false}),
  rollingSafetyMeta:Object.freeze({suffix:".safety-backup-meta-v1",retain:"with-rolling-safety",automaticDelete:false}),
  preSchema16:Object.freeze({suffix:".pre-schema16-backup-v1",retain:"until-manual-prune-after-canonical-schema17",automaticDelete:false}),
  preSchema17:Object.freeze({suffix:".pre-schema17-backup-v1",retain:"until-manual-prune-after-canonical-schema17",automaticDelete:false})
 });
 function bytes(text){const value=String(text??"");try{return typeof Blob==="function"?new Blob([value]).size:value.length*2;}catch(_){return value.length*2;}}
 function safeGet(key){try{return localStorage.getItem(key);}catch(_){return null;}}
 function saveKey(){try{return typeof SAVE_KEY!=="undefined"?String(SAVE_KEY):"";}catch(_){return "";}}
 function parseSchema(raw){try{const parsed=JSON.parse(raw||"");const n=Math.floor(Number(parsed?.saveVersion));return Number.isFinite(n)&&n>=1?n:null;}catch(_){return null;}}
 function entry(id,row){const base=saveKey(),key=base?`${base}${row.suffix}`:"",raw=key?safeGet(key):null;return Object.freeze({id,key,present:typeof raw==="string"&&raw.length>0,bytes:bytes(raw||""),schema:parseSchema(raw),retain:row.retain,automaticDelete:false});}
 function snapshot(){
  const currentRaw=saveKey()?safeGet(saveKey()):null,currentSchema=parseSchema(currentRaw),canonical=Number(window.SAVE_SCHEMA_VERSION)||currentSchema||0;
  const entries=Object.entries(POLICY).map(([id,row])=>entry(id,row));
  const legacy=entries.filter(row=>row.id==="preSchema16"||row.id==="preSchema17");
  const pruneEligible=currentSchema!==null&&canonical>=17&&currentSchema===canonical&&legacy.filter(row=>row.present).every(row=>row.schema===null||row.schema<canonical);
  return Object.freeze({version:VERSION,currentSchema,canonicalSchema:canonical,automaticDeletion:false,legacyMigrationBackups:legacy,totalBackupBytes:entries.reduce((sum,row)=>sum+row.bytes,0),manualPruneEligible:pruneEligible,entries:Object.freeze(entries)});
 }
 function pruneLegacyMigrationBackups(options={}){
  const dryRun=options?.dryRun!==false,snap=snapshot(),removed=[],skipped=[];
  if(!snap.manualPruneEligible)return Object.freeze({version:VERSION,ok:false,dryRun,reason:"not-eligible",removed:Object.freeze([]),skipped:Object.freeze(snap.legacyMigrationBackups.map(row=>row.key))});
  for(const row of snap.legacyMigrationBackups){
   if(!row.present){skipped.push(row.key);continue;}
   if(dryRun){removed.push(row.key);continue;}
   try{localStorage.removeItem(row.key);removed.push(row.key);}catch(_){skipped.push(row.key);}
  }
  return Object.freeze({version:VERSION,ok:skipped.length===0,dryRun,reason:"",removed:Object.freeze(removed),skipped:Object.freeze(skipped)});
 }
 window.SAVE_BACKUP_RETENTION_VERSION=VERSION;
 window.SAVE_BACKUP_RETENTION_POLICY=POLICY;
 window.localSaveBackupRetentionSnapshot=snapshot;
 window.pruneLegacyMigrationBackups=pruneLegacyMigrationBackups;
})();