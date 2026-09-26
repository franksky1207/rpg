(function(){
 const VERSION=1;
 const STORAGE_PREFIX="civilization_frontline_gm_background_battle_v1_";
 const MAINLINE_HP_LOCK_STORAGE_PREFIX="civilization_frontline_gm_mainline_hp_lock_v1_";

 function currentUserId(){
  const id=window.civilizationAuth?.getUser?.()?.id||window.civilizationAuthSession?.user?.id||"";
  return String(id||"");
 }
 function devicePreferenceStorageKey(prefix){
  const id=currentUserId();
  return id?`${String(prefix||"")}${id}`:"";
 }
 function deviceBooleanPreferenceEnabled(prefix){
  const key=devicePreferenceStorageKey(prefix);
  if(!key)return false;
  try{return localStorage.getItem(key)==="1";}catch(e){return false;}
 }
 function setDeviceBooleanPreference(prefix,next){
  const key=devicePreferenceStorageKey(prefix);
  if(!key)return false;
  try{localStorage.setItem(key,next?"1":"0");return true;}catch(e){return false;}
 }
 function storageKey(){return devicePreferenceStorageKey(STORAGE_PREFIX);}
 function mainlineHpLockStorageKey(){return devicePreferenceStorageKey(MAINLINE_HP_LOCK_STORAGE_PREFIX);}
 function enabled(){return deviceBooleanPreferenceEnabled(STORAGE_PREFIX);}
 function mainlineHpLockEnabled(){return deviceBooleanPreferenceEnabled(MAINLINE_HP_LOCK_STORAGE_PREFIX);}
 function mainlineHpLockActive(scope=""){
  if(!mainlineHpLockEnabled())return false;
  if(scope==="world1-mainline")return true;
  if(scope==="world2-mainline")return !!window.activeSecondWorldMainlineContext;
  if(scope==="special")return !!(window.activeMainBattleContext||window.activeSecondWorldMainlineContext);
  return false;
 }
 function setEnabled(next){
  if(!setDeviceBooleanPreference(STORAGE_PREFIX,next))return false;
  if(!next&&typeof window.backgroundProgressStop==="function"){window.backgroundProgressStop("main");window.backgroundProgressStop("void");window.backgroundProgressStop("calamity");}
  return true;
 }
 function setMainlineHpLockEnabled(next){return setDeviceBooleanPreference(MAINLINE_HP_LOCK_STORAGE_PREFIX,next);}
 function installStyles(){
  if(document.getElementById("gmBackgroundBattleStyles"))return;
  const style=document.createElement("style");
  style.id="gmBackgroundBattleStyles";
  style.textContent=`
   #settingsTitle + .muted{display:none!important}
   .gm-background-status{margin-top:12px;padding:11px 12px;border:1px solid #4a4232;border-radius:9px;background:#12151a;font-weight:800}
   .gm-background-status.on{color:#7CFF9A}.gm-background-status.off{color:#FF8A8A}
  `;
  document.head.appendChild(style);
 }
 function managementHtml(){
  const on=enabled();
  return `<div class="muted gm-hub-note">背景戰鬥只允許從 GM 管理開啟；玩家介面沒有背景戰鬥開關。此設定只保存在目前裝置，依登入帳號分開記錄；不寫入遊戲存檔或雲端資料。銀河紀元與宇宙紀元主線共用此 gate。</div><div class="controls"><button class="btn blue" onclick="gmSetBackgroundBattle(true)" ${on?"disabled":""}>開啟背景戰鬥</button><button class="btn danger" onclick="gmSetBackgroundBattle(false)" ${on?"":"disabled"}>關閉背景戰鬥</button></div><div class="gm-background-status ${on?"on":"off"}">目前狀態：背景戰鬥已${on?"開啟":"關閉"}</div>`;
 }
 function mainlineHpLockManagementHtml(){
  const on=mainlineHpLockEnabled();
  return `<div class="muted gm-hub-note">主線鎖血只允許從 GM 管理開啟；玩家介面沒有此開關。此設定只保存在目前裝置，依登入帳號分開記錄；不寫入遊戲存檔或雲端資料。只作用於銀河紀元／宇宙紀元正式主線與主線特殊怪，不影響副本、災厄、回顧戰或 GM 測試。</div><div class="controls"><button class="btn blue" onclick="gmSetMainlineHpLock(true)" ${on?"disabled":""}>開啟主線鎖血</button><button class="btn danger" onclick="gmSetMainlineHpLock(false)" ${on?"":"disabled"}>關閉主線鎖血</button></div><div class="gm-background-status ${on?"on":"off"}">目前狀態：主線鎖血已${on?"開啟":"關閉"}</div>`;
 }
 window.gmSetBackgroundBattle=function(next){
  if(!setEnabled(next===true)){
   alert("背景戰鬥設定無法寫入目前裝置。");
   return false;
  }
  if(typeof render==="function")render();
  return true;
 };
 window.gmSetMainlineHpLock=function(next){
  if(!setMainlineHpLockEnabled(next===true)){
   alert("主線鎖血設定無法寫入目前裝置。");
   return false;
  }
  if(typeof render==="function")render();
  return true;
 };
 window.gmDevicePreferenceStorageKey=devicePreferenceStorageKey;
 window.gmDeviceBooleanPreferenceEnabled=deviceBooleanPreferenceEnabled;
 window.gmSetDeviceBooleanPreference=setDeviceBooleanPreference;
 window.gmBackgroundBattleEnabled=enabled;
 window.gmBackgroundBattleStorageKey=storageKey;
 window.gmMainlineHpLockEnabled=mainlineHpLockEnabled;
 window.gmMainlineHpLockStorageKey=mainlineHpLockStorageKey;
 window.gmMainlineHpLockActive=mainlineHpLockActive;
 window.GM_DEVICE_BOOLEAN_PREFERENCE_VERSION=1;
 window.GM_BACKGROUND_BATTLE_VERSION=VERSION;
 window.GM_BACKGROUND_BATTLE_ALL_COMBAT_GATE_VERSION=1;
 window.GM_MAINLINE_HP_LOCK_MANAGEMENT_VERSION=1;
 window.GM_MAINLINE_HP_LOCK_GATE_VERSION=1;
 installStyles();
 if(typeof window.registerGmHubSection==="function"){
  window.registerGmHubSection("manage","背景戰鬥",managementHtml,{id:"gm-background-battle",position:"prepend"});
  window.registerGmHubSection("manage","主線鎖血",mainlineHpLockManagementHtml,{id:"gm-mainline-hp-lock",position:"prepend"});
 }
})();