(function(){
 const VERSION=1;
 function isObject(value){return !!value&&typeof value==="object"&&!Array.isArray(value);}
 function currentVersion(){return Math.max(1,Math.floor(Number(window.SAVE_SCHEMA_VERSION)||1));}
 function sourceVersion(raw,explicitVersion=null){
  const candidate=explicitVersion??raw?.saveVersion;
  const n=Math.floor(Number(candidate));
  return Number.isFinite(n)&&n>=1?n:1;
 }
 function compatibility(raw,explicitVersion=null){
  const source=sourceVersion(raw,explicitVersion),current=currentVersion();
  return {version:VERSION,sourceVersion:source,currentVersion:current,isFuture:source>current,supported:source<=current};
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
     if(info.isFuture){
      try{state=typeof newState==="function"?newState():{};}catch(_){state={saveVersion:currentVersion()};}
      const status=document.getElementById("saveStatus");if(status)status.textContent="本機存檔版本較新・已保護";
      window.LAST_SAVE_LOAD_REPORT={pipelineVersion:Number(window.SAVE_LOAD_PIPELINE_VERSION)||0,hadRaw:true,parseFailed:false,sourceVersion:info.sourceVersion,targetVersion:info.currentVersion,failed:true,reason:"future-version",error:""};
      console.error(`[文明戰線] Local save v${info.sourceVersion} is newer than supported v${info.currentVersion}; original localStorage entry was preserved.`);
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
