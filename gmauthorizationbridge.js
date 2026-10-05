(function(){
 const VERSION=1;
 function loader(){return window.CivilizationScriptLoader&&typeof window.CivilizationScriptLoader==="object"?window.CivilizationScriptLoader:null;}
 function stripLegacySaveFlag(){
  try{
   if(typeof state==="undefined"||!state||state.gm!==true)return false;
   state.gm=false;
   if(typeof save==="function")save(false);
   return true;
  }catch(_){return false;}
 }
 function install(){
  const base=window.unlockGM;
  if(typeof base!=="function")return false;
  if(base.__gmAuthorizationBridgeVersion===VERSION)return true;
  const wrapped=function(){
   let before=false;
   try{before=state?.gm===true;}catch(_){ }
   const result=base.apply(this,arguments);
   let passwordAccepted=false;
   try{passwordAccepted=!before&&state?.gm===true;}catch(_){ }
   if(passwordAccepted){
    const api=loader();
    if(api&&typeof api.authorizeGmRuntime==="function")api.authorizeGmRuntime();
    try{state.gm=false;if(typeof save==="function")save(false);}catch(_){ }
   }
   return result;
  };
  wrapped.__gmAuthorizationBridgeVersion=VERSION;
  window.unlockGM=wrapped;
  return true;
 }
 const legacyStripped=stripLegacySaveFlag();
 const installed=install();
 window.GM_AUTHORIZATION_BRIDGE_VERSION=VERSION;
 window.GM_SAVE_AUTHORIZATION_RETIRED_VERSION=1;
 window.GM_LEGACY_SAVE_AUTHORIZATION_STRIPPED=legacyStripped;
 window.GM_AUTHORIZATION_BRIDGE_INSTALLED=installed;
})();