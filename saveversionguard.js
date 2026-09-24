(function(){
 const VERSION=1;
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
    }
   }catch(_){/* parse/shape errors stay owned by the canonical load pipeline */}
   return baseLoad();
  };
  try{load=window.load;}catch(_){}
 }

 window.SAVE_FUTURE_VERSION_GUARD_VERSION=VERSION;
 window.saveCompatibilityFor=compatibility;
 window.assertSaveVersionSupported=assertSupported;
})();
