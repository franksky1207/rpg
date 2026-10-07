(function(){
 const VERSION=1;
 const AUTH_SYNC_VERSION=1;
 const BACKGROUND_STORAGE_PREFIX="civilization_frontline_gm_background_battle_v1_";
 const MAINLINE_HP_LOCK_STORAGE_PREFIX="civilization_frontline_gm_mainline_hp_lock_v1_";

 function currentUserId(){
  const id=window.civilizationAuth?.getUser?.()?.id||window.civilizationAuthSession?.user?.id||"";
  return String(id||"");
 }
 function storageKey(prefix,userId=currentUserId()){
  const id=String(userId||"").trim();
  return id?`${String(prefix||"")}${id}`:"";
 }
 function booleanEnabled(prefix,userId=currentUserId()){
  const key=storageKey(prefix,userId);
  if(!key)return false;
  try{return localStorage.getItem(key)==="1";}catch(_){return false;}
 }
 function setBoolean(prefix,next,userId=currentUserId()){
  const key=storageKey(prefix,userId);
  if(!key)return false;
  try{localStorage.setItem(key,next===true?"1":"0");return true;}catch(_){return false;}
 }
 function backgroundStorageKey(){return storageKey(BACKGROUND_STORAGE_PREFIX);}
 function mainlineHpLockStorageKey(){return storageKey(MAINLINE_HP_LOCK_STORAGE_PREFIX);}
 function backgroundEnabled(){return booleanEnabled(BACKGROUND_STORAGE_PREFIX);}
 function mainlineHpLockEnabled(){return booleanEnabled(MAINLINE_HP_LOCK_STORAGE_PREFIX);}
 function mainlineHpLockActive(scope=""){
  if(!mainlineHpLockEnabled())return false;
  if(scope==="world1-mainline")return true;
  if(scope==="world2-mainline")return !!window.activeSecondWorldMainlineContext;
  if(scope==="special")return !!(window.activeMainBattleContext||window.activeSecondWorldMainlineContext);
  return false;
 }
 function snapshot(source="read"){
  const userId=currentUserId();
  return Object.freeze({
   version:VERSION,
   authSyncVersion:AUTH_SYNC_VERSION,
   source:String(source||"read"),
   userId,
   ready:!!userId,
   backgroundBattle:backgroundEnabled(),
   mainlineHpLock:mainlineHpLockEnabled()
  });
 }
 function notify(source="auth-ready"){
  const detail=snapshot(source);
  try{window.dispatchEvent(new CustomEvent("gm-runtime-preferences-ready",{detail}));}catch(_){}
  return detail;
 }
 function syncFromAuth(source="auth-ready"){return notify(source);}

 window.gmDevicePreferenceStorageKey=storageKey;
 window.gmDeviceBooleanPreferenceEnabled=booleanEnabled;
 window.gmSetDeviceBooleanPreference=setBoolean;
 window.gmBackgroundBattleEnabled=backgroundEnabled;
 window.gmBackgroundBattleStorageKey=backgroundStorageKey;
 window.gmMainlineHpLockEnabled=mainlineHpLockEnabled;
 window.gmMainlineHpLockStorageKey=mainlineHpLockStorageKey;
 window.gmMainlineHpLockActive=mainlineHpLockActive;
 window.gmRuntimeDevicePreferenceSnapshot=snapshot;
 window.gmSyncRuntimeDevicePreferencesFromAuth=syncFromAuth;
 window.GM_DEVICE_BOOLEAN_PREFERENCE_VERSION=2;
 window.GM_RUNTIME_DEVICE_PREFERENCE_CORE_VERSION=VERSION;
 window.GM_RUNTIME_DEVICE_PREFERENCE_AUTH_SYNC_VERSION=AUTH_SYNC_VERSION;

 window.addEventListener?.("civilization-auth-ready",()=>syncFromAuth("civilization-auth-ready"));
 if(currentUserId())syncFromAuth("initial-session");
})();
