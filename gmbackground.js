(function(){
 const VERSION=1;
 const STORAGE_PREFIX="civilization_frontline_gm_background_battle_v1_";

 function currentUserId(){
  const id=window.civilizationAuth?.getUser?.()?.id||window.civilizationAuthSession?.user?.id||"";
  return String(id||"");
 }
 function storageKey(){
  const id=currentUserId();
  return id?`${STORAGE_PREFIX}${id}`:"";
 }
 function enabled(){
  const key=storageKey();
  if(!key)return false;
  try{return localStorage.getItem(key)==="1";}catch(e){return false;}
 }
 function setEnabled(next){
  const key=storageKey();
  if(!key)return false;
  try{
   localStorage.setItem(key,next?"1":"0");
   if(!next&&typeof window.backgroundProgressStop==="function"){window.backgroundProgressStop("main");window.backgroundProgressStop("calamity");}
   return true;
  }catch(e){return false;}
 }
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
  return `<div class="muted gm-hub-note">此設定只保存在目前裝置，依登入帳號分開記錄；不寫入遊戲存檔或雲端資料。</div><div class="controls"><button class="btn blue" onclick="gmSetBackgroundBattle(true)" ${on?"disabled":""}>開啟背景戰鬥</button><button class="btn danger" onclick="gmSetBackgroundBattle(false)" ${on?"":"disabled"}>關閉背景戰鬥</button></div><div class="gm-background-status ${on?"on":"off"}">目前狀態：背景戰鬥已${on?"開啟":"關閉"}</div>`;
 }
 window.gmSetBackgroundBattle=function(next){
  if(!setEnabled(next===true)){
   alert("背景戰鬥設定無法寫入目前裝置。");
   return false;
  }
  if(typeof render==="function")render();
  return true;
 };
 window.gmBackgroundBattleEnabled=enabled;
 window.gmBackgroundBattleStorageKey=storageKey;
 window.GM_BACKGROUND_BATTLE_VERSION=VERSION;
 installStyles();
 if(typeof window.registerGmHubSection==="function")window.registerGmHubSection("manage","背景戰鬥",managementHtml,{id:"gm-background-battle",open:true,position:"prepend"});
})();