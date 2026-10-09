(function(){
 const VERSION=1;
 const AUTHORIZATION_VERSION=2;
 const EARLY_RESTORE_VERSION=2;
 const SAVE_BOUNDARY_VERSION=2;
 const LEGACY_RECONCILE_VERSION=1;
 const KEY="civilization-war-gm-authorized-v1";
 const ACCOUNT_PREFIX="civilization-war-gm-authorized-v2-account-";
 function accountId(){return String(window.civilizationAuth?.getUser?.()?.id||window.civilizationAuthSession?.user?.id||"").trim();}
 function accountKey(id=accountId()){return id?ACCOUNT_PREFIX+id:"";}
 const SAVE_HOOK_ID="gm-runtime-authorization-v1";

 function authorized(){
  const key=accountKey();if(!key)return false;
  try{return localStorage.getItem(key)==="1";}catch(_){return false;}
 }
 function setAuthorized(value){
  const key=accountKey();
  try{
   // Legacy device-wide authorization is not an identity proof; never migrate it across accounts.
   localStorage.removeItem(KEY);
   if(!key)return false;
   if(value===true)localStorage.setItem(key,"1");
   else localStorage.removeItem(key);
   return true;
  }catch(_){return false;}
 }
 function clearCurrentAuthorization(){
  const id=accountId();
  try{localStorage.removeItem(KEY);if(id)localStorage.removeItem(accountKey(id));}catch(_){}
  setRuntimeFlag(false);
  return true;
 }
 function runtimeState(){
  try{return typeof state!=="undefined"&&state&&typeof state==="object"?state:null;}catch(_){return null;}
 }
 function setRuntimeFlag(value,target=runtimeState()){
  if(!target||typeof target!=="object")return false;
  target.gm=value===true;
  return true;
 }
 function reconcileAfterLoad(target=runtimeState()){
  if(!target||typeof target!=="object")return Object.freeze({ok:false,authorized:authorized(),runtimeFlag:false,legacyCleared:false});
  const allow=authorized(),legacyCleared=!allow&&target.gm===true;
  target.gm=allow;
  return Object.freeze({ok:true,authorized:allow,runtimeFlag:target.gm===true,legacyCleared});
 }
 function installSaveBoundary(){
  if(typeof window.registerBeforeSaveHook!=="function"||typeof window.registerSaveSettlementHook!=="function")return false;
  const before=typeof window.getBeforeSaveHookIds==="function"?window.getBeforeSaveHookIds():[];
  if(!before.includes(SAVE_HOOK_ID)){
   window.registerBeforeSaveHook(SAVE_HOOK_ID,context=>{try{if(context?.state?.gm===true){context.__gmRuntimeAuthorizationRestore=true;context.state.gm=false;}}catch(_){}});
  }
  const settlement=typeof window.getSaveSettlementHookIds==="function"?window.getSaveSettlementHookIds():[];
  if(!settlement.includes(SAVE_HOOK_ID)){
   window.registerSaveSettlementHook(SAVE_HOOK_ID,context=>{if(context?.__gmRuntimeAuthorizationRestore===true)setRuntimeFlag(true);});
  }
  return true;
 }
 function snapshot(){
  const target=runtimeState();
  return Object.freeze({version:VERSION,authorizationVersion:AUTHORIZATION_VERSION,scope:"account-local-runtime",accountBound:true,accountPresent:!!accountId(),authorized:authorized(),runtimeFlag:target?.gm===true,saveStateAuthoritative:false,key:accountKey(),saveBoundaryInstalled:installSaveBoundary()});
 }

 window.gmRuntimeAuthorizationAuthorized=authorized;
 window.gmClearCurrentRuntimeAuthorization=clearCurrentAuthorization;
 window.gmRuntimeAuthorizationAccountId=accountId;
 window.gmSetRuntimeAuthorization=setAuthorized;
 window.gmSetRuntimeAuthorizationFlag=setRuntimeFlag;
 window.gmReconcileRuntimeAuthorizationAfterLoad=reconcileAfterLoad;
 window.gmRuntimeAuthorizationSnapshot=snapshot;
 window.gmInstallRuntimeAuthorizationSaveBoundary=installSaveBoundary;
 window.GM_RUNTIME_AUTHORIZATION_CORE_VERSION=VERSION;
 window.GM_RUNTIME_AUTHORIZATION_VERSION=AUTHORIZATION_VERSION;
 window.GM_RUNTIME_EARLY_RESTORE_VERSION=EARLY_RESTORE_VERSION;
 window.GM_RUNTIME_SAVE_BOUNDARY_VERSION=SAVE_BOUNDARY_VERSION;
 window.GM_RUNTIME_LEGACY_RECONCILE_VERSION=LEGACY_RECONCILE_VERSION;
 window.GM_RUNTIME_AUTHORIZATION_SCOPE="account-local-runtime";
 window.GM_SAVE_AUTHORIZATION_RETIRED_VERSION=1;
 window.GM_RUNTIME_SAVE_BOUNDARY_INSTALLED=installSaveBoundary();
})();
