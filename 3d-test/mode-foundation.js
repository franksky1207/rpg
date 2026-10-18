/* Dual presentation modes, batch 17. No changes to formal save/state owners. */
(function(global){
"use strict";
const VERSION=3, PREFIX="civilization-war-presentation-mode-v1:", MODES=Object.freeze(["text","3d"]);
const FULL_3D_AVAILABLE=false; // Enable only after the B40 full-mode release gate.
let accountId="",shownFor="",active="text";
const safeId=value=>String(value||"").trim();
const userId=()=>safeId(global.civilizationAuthSession?.user?.id);
const storageKey=id=>PREFIX+id;
// Legacy text/3d strings remain supported. New structured values are read-only
// until the real 3D launch; malformed values never touch formal save data.
function parsePreference(raw){
 if(MODES.includes(raw))return raw;
 if(typeof raw!=="string"||raw.length>256)return null;
 try{
  const value=JSON.parse(raw);
  return value&&typeof value==="object"&&!Array.isArray(value)&&MODES.includes(value.mode)?value.mode:null;
 }catch(_){return null;}
}
function read(id){
 if(!id)return null;
 try{return parsePreference(localStorage.getItem(storageKey(id)));}catch(_){return null;}
}
function persist(id,mode){
 if(!id||!MODES.includes(mode)||mode==="3d"&&!FULL_3D_AVAILABLE)return false;
 try{localStorage.setItem(storageKey(id),mode);return true;}catch(_){return false;}
}
function closeSelector(){document.getElementById("civilizationModeSelector")?.remove();}
// The retired full-3D chooser remains readable for old account keys but is never shown.
function initialSelection(id){
 const existing=read(id);
 active=existing==="3d"&&FULL_3D_AVAILABLE?"3d":"text";
 closeSelector();
}
const ANIMATION_KEY="civilization-war-combat-animation-v1:";
const animationKey=()=>ANIMATION_KEY+(userId()||"device");
function animationEnabled(){
 try{const value=localStorage.getItem(animationKey());return value===null?true:value!=="off";}catch(_){return true;}
}
function setAnimationEnabled(value){
 const enabled=value===true;
 try{localStorage.setItem(animationKey(),enabled?"on":"off");}catch(_){return {ok:false,reason:"storage-unavailable"};}
 global.dispatchEvent(new CustomEvent("civilization-combat-animation-change",{detail:{enabled}}));
 return {ok:true,enabled};
}

function onSession(){
 const id=userId();
 if(id!==accountId)closeSelector();
 if(!id){accountId="";shownFor="";active="text";closeSelector();return;}
 if(id!==accountId){accountId=id;shownFor="";}
 initialSelection(id);
}
// Future owners register authoritative pending-operation probes here.
const switchBlockers=new Map();
function registerSwitchBlocker(id,probe){
 if(typeof id!=="string"||!id||typeof probe!=="function")return false;
 switchBlockers.set(id,probe);return true;
}
function unregisterSwitchBlocker(id){return switchBlockers.delete(id);}
function canSwitch(){
 if(document.querySelector(".combat-screen,.void-combat,.calamity-battle-shell,.alternate-universe-combat,.world-phase-overlay.open,.story-overlay.open"))return false;
 const startup=global.CivilizationStartupCoordinator?.snapshot?.();
 if(startup&&startup.status!=="ready")return false;
 for(const blocker of switchBlockers.values()){
  try{if(blocker()!==false)return false;}catch(_){return false;}
 }
 return true;
}
function switchMode(mode){
 if(!MODES.includes(mode))return {ok:false,reason:"invalid-mode"};
 if(mode==="3d"&&!FULL_3D_AVAILABLE)return {ok:false,reason:"3d-not-released"};
 const id=userId();
 if(!id)return {ok:false,reason:"not-logged-in"};
 if(!canSwitch())return {ok:false,reason:"active-operation"};
 if(mode===active)return {ok:true,unchanged:true};
 if(!persist(id,mode))return {ok:false,reason:"storage-unavailable"};
 global.location.reload();
 return {ok:true,reloading:true};
}
function appearanceHtml(){
 const contract=global.CivilizationEraAppearanceContract;
 if(!contract)return "";
 const unlocked=contract.canChoose();
 const selected=contract.choice();
 const s=typeof state!=="undefined"?state:global.state;
 const world=typeof global.currentWorldPhase==="function"?global.currentWorldPhase():s?.thirdWorld?.entered?3:s?.secondWorld?.entered?2:1;
 const base=contract.resolve({world});
 const labels={galaxy:"銀河戰甲",universe:"宇宙戰甲",higher:"高維戰甲"};
 const options=contract.available.map(id=>'<option value="'+id+'"'+(selected===id?' selected':'')+'>'+labels[id]+'</option>').join("");
 return '<div class="setting-row" style="display:block"><h3 style="margin:0 0 7px">角色外觀</h3>'+
 '<div class="muted" style="margin-bottom:9px">三套角色外觀只影響戰鬥動畫，變更於下一場戰鬥套用。外觀設定不會隨雲端存檔或存檔匯入傳送。</div>'+
 (unlocked?'<div class="muted" style="margin-bottom:9px">已完成轉生，可自由選擇三紀元主角外觀；只影響戰鬥動畫，不影響裝備能力。變更從下一場戰鬥生效，設定保存在本裝置的登入帳號。</div>'+
 '<label>戰鬥造型 <select id="civilizationEraAppearanceChoice" onchange="window.CivilizationPresentationMode.setEraAppearance(this.value)">'+options+'</select></label>':
 '<div class="muted">首次正式轉生後解鎖三套外觀自由選擇。目前依所在紀元顯示：'+(labels[base.visualId]||"尚未確認")+'。</div>')+'</div>';
}
function setEraAppearance(value){
 const result=global.CivilizationEraAppearanceContract?.select(value)||{ok:false,reason:"unavailable"};
 if(!result.ok){const element=document.getElementById("civilizationEraAppearanceChoice");if(element)element.value=global.CivilizationEraAppearanceContract?.choice()||"higher";}
 return result;
}
function settingsHtml(){
 const enabled=animationEnabled();
 return appearanceHtml()+'<div class="setting-row" style="display:block"><h3 style="margin:0 0 7px">戰鬥動畫</h3><div class="muted" style="margin-bottom:9px">控制支援動畫的正式戰鬥畫面；不影響文字戰鬥、傷害、速度或結算。設定儲存在這台裝置，登入時依帳號區分。</div><label style="display:inline-flex;align-items:center;gap:8px"><input type="checkbox" '+(enabled?'checked ':'')+'onchange="window.CivilizationPresentationMode.setCombatAnimationEnabled(this.checked)"> 開啟戰鬥動畫</label><div class="muted" style="margin-top:8px">關閉後使用文字戰鬥；變更立即生效，後續戰鬥也會記住選擇。</div></div>';
}

global.addEventListener("civilization-auth-ready",onSession);
global.addEventListener("civilization-auth-signed-out",()=>{accountId="";shownFor="";active="text";closeSelector();});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",onSession,{once:true});else queueMicrotask(onSession);
global.CivilizationPresentationMode=Object.freeze({
 version:VERSION,modeIds:MODES,currentMode:()=>active,isFull3DAvailable:()=>FULL_3D_AVAILABLE,
 canPreview3D:()=>true,shouldWarm3DAtStartup:()=>active==="3d",
 accountPreference:()=>read(userId()),selectMode:switchMode,settingsHtml,
 canSwitch,registerSwitchBlocker,unregisterSwitchBlocker,refresh:onSession,
 combatAnimationEnabled:animationEnabled,setCombatAnimationEnabled:setAnimationEnabled,setEraAppearance
});
})(window);
