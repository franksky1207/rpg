/* Dual presentation modes, batch 17. No changes to formal save/state owners. */
(function(global){
"use strict";
const VERSION=2, PREFIX="civilization-war-presentation-mode-v1:", MODES=Object.freeze(["text","3d"]);
const FULL_3D_AVAILABLE=false; // Enable only after the B40 full-mode release gate.
let accountId="",shownFor="",active="text";
const safeId=value=>String(value||"").trim();
const userId=()=>safeId(global.civilizationAuthSession?.user?.id);
const storageKey=id=>PREFIX+id;
function read(id){
 if(!id)return null;
 try{const value=localStorage.getItem(storageKey(id));return MODES.includes(value)?value:null;}catch(_){return null;}
}
function persist(id,mode){
 if(!id||!MODES.includes(mode)||mode==="3d"&&!FULL_3D_AVAILABLE)return false;
 try{localStorage.setItem(storageKey(id),mode);return true;}catch(_){return false;}
}
function closeSelector(){document.getElementById("civilizationModeSelector")?.remove();}
function initialSelection(id){
 const existing=read(id);
 if(existing==="text"||existing==="3d"&&FULL_3D_AVAILABLE){active=existing;closeSelector();return;}
 active="text";
 if(shownFor===id&&document.getElementById("civilizationModeSelector"))return;
 shownFor=id;
 const root=document.createElement("section");root.id="civilizationModeSelector";
 root.setAttribute("role","dialog");root.setAttribute("aria-modal","true");
 root.setAttribute("aria-label","選擇遊戲模式");
 root.style.cssText="position:fixed;inset:0;z-index:12000;display:grid;place-items:center;background:#030913ed;padding:20px;color:#eff5ff";
 root.innerHTML='<div style="width:min(100%,440px);border:1px solid #6486ad;border-radius:15px;background:#111c2c;padding:24px;box-shadow:0 12px 45px #000a"><h2 style="margin:0 0 12px">選擇遊戲模式</h2><p style="line-height:1.6">同一帳號共用角色、裝備、戰鬥規則及存檔。這台裝置會記住你的選擇。</p><button type="button" id="civilizationModeChooseText" class="btn blue" style="width:100%;margin:10px 0">文字模式・進入遊戲</button><button type="button" class="btn" disabled style="width:100%;opacity:.65">3D 模式・開發中</button><p class="muted" style="font-size:13px">3D 完整模式尚未開放，現有介面的 3D 預覽仍可使用。</p></div>';
 document.body.appendChild(root);
 root.querySelector("#civilizationModeChooseText").addEventListener("click",()=>{
  if(!persist(id,"text")){root.querySelector(".muted").textContent="無法儲存模式偏好；本次仍可進入文字模式，下次可能再次詢問。";}
  active="text";closeSelector();
 });
 root.querySelector("#civilizationModeChooseText").focus();
}
function onSession(){
 const id=userId();
 if(!id){accountId="";shownFor="";active="text";closeSelector();return;}
 if(id!==accountId){accountId=id;shownFor="";}
 initialSelection(id);
}
function canSwitch(){
 if(document.querySelector(".combat-screen,.void-combat,.calamity-battle-shell,.alternate-universe-combat,.world-phase-overlay.open,.story-overlay.open"))return false;
 if(global.CivilizationStartupCoordinator?.snapshot?.().status==="loading")return false;
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
function settingsHtml(){
 if(!userId())return "";
 return '<div class="setting-row" style="display:block"><h3 style="margin:0 0 7px">遊戲模式</h3><div class="muted" style="margin-bottom:9px">文字模式完整保留；模式偏好依帳號與這台裝置記錄，不會變更角色存檔。</div><button class="btn blue" type="button" disabled>文字模式（目前使用中）</button> <button class="btn" type="button" disabled>3D 模式（開發中）</button><div class="muted" style="margin-top:8px">正式 3D 完成後可在這裡切換，切換前確認操作完成並重新載入。</div></div>';
}
global.addEventListener("civilization-auth-ready",onSession);
global.addEventListener("civilization-auth-signed-out",()=>{accountId="";shownFor="";active="text";closeSelector();});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",onSession,{once:true});else queueMicrotask(onSession);
global.CivilizationPresentationMode=Object.freeze({
 version:VERSION,modeIds:MODES,currentMode:()=>active,isFull3DAvailable:()=>FULL_3D_AVAILABLE,
 canPreview3D:()=>true,shouldWarm3DAtStartup:()=>active==="3d",
 accountPreference:()=>read(userId()),selectMode:switchMode,settingsHtml,
 canSwitch,refresh:onSession
});
})(window);
