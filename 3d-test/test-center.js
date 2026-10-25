/* GM battle animation test center. Presentation only: no official combat, storage or cloud owner. */
(function(){
"use strict";
// C-15-BATTLE remains callable by automated diagnostics, never a visible category.
const cases=[
 {id:"C-08-CHARACTER",cat:"character",title:"角色動作預覽",kind:"character",detail:"檢查銀河、宇宙、高維角色的六種動作、方向、縮放、手機範圍與缺圖回退。"},
 {id:"C-15-BATTLE",cat:"combat",title:"戰鬥動畫模擬",kind:"battle-battle",detail:"檢視已發布戰場、可用角色、敵方情境、血量與播放控制，不發放收益。"}
];
const $=id=>document.getElementById(id);
const host=$("prototypeHost"),status=$("status"),fallback=$("fallback"),fallbackReason=$("fallbackReason");
const quality=$("quality"),toggle=$("toggle"),maximizeButton=$("maximizePreview");
const embedded=new URLSearchParams(location.search).get("embedded")==="1";
if(embedded){document.body.classList.add("is-embedded");const back=$("backToGame");if(back){back.hidden=true;back.style.display="none";}}
let selected="C-08-CHARACTER",runtime=null,serial=0,disabled=false,maximized=false,maximumScroll=null;
const entry=()=>cases.find(c=>c.id===selected)||cases[0];
function release(){
 serial++;
 const old=runtime;runtime=null;
 if(old)try{old.dispose();}catch(_){}
 host.replaceChildren();
}
function showFailure(reason){
 status.hidden=false;fallback.hidden=false;host.hidden=true;
 fallbackReason.textContent=String(reason);
 status.textContent="預覽安全模式：可重新啟動或返回 GM";
}
function setMaximized(value){
 const next=!!value;if(next===maximized)return;
 if(next)maximumScroll={left:window.scrollX,top:window.scrollY,focus:document.activeElement};
 maximized=next;
 document.body.classList.toggle("gm-3d-maximized",maximized);
 $("centerWorkspace").classList.toggle("center-maximized",maximized);
 maximizeButton.setAttribute("aria-pressed",String(maximized));
 maximizeButton.setAttribute("aria-label",maximized?"還原預覽":"最大化預覽");
 maximizeButton.textContent=maximized?"⛶ 還原預覽":"⛶ 最大化預覽";
 runtime?.resize?.();
 requestAnimationFrame(()=>{
  if(!maximized){if(maximumScroll)window.scrollTo({...maximumScroll,behavior:"instant"});maximumScroll?.focus?.focus({preventScroll:true});maximumScroll=null;}
  runtime?.resize?.();
 });
}
maximizeButton.addEventListener("click",()=>setMaximized(!maximized));
function renderInfo(){
 $("caseTitle").textContent=entry().title;$("caseDetail").textContent="";
 const legacy=$("fixturePanel");if(legacy)legacy.hidden=true;
}
async function start(){
 release();
 const ticket=serial;
 if(disabled){status.hidden=false;status.textContent="預覽已停用，不影響正式遊戲。";fallback.hidden=true;host.hidden=true;return;}
 fallback.hidden=true;host.hidden=false;status.hidden=false;
 const abort=new AbortController();let viewer=null;
 runtime={dispose:()=>{abort.abort();viewer?.dispose?.();},resize:()=>viewer?.resize?.(),setQuality:value=>viewer?.setQuality?.(value)};
 try{
  let mod;
  if(entry().kind==="character"){
   status.textContent="GM 角色預覽：使用三紀元正式角色素材，不修改存檔。";
   mod=await import("./gm-era-sprites.mjs?v=20261025-center1&uiRepair=20261024-three1&appearance=20261024-approved1");
  }else{
   status.textContent="GM 戰鬥動畫測試：不影響正式戰鬥或音效。";
   mod=await import("./gm-battle-simulation.js?v=20261019-batch12-rising-cut1&issue106=20261025-rewards");
  }
  if(ticket!==serial||abort.signal.aborted)return;
  viewer=await mod.mount({host,signal:abort.signal,quality:quality.value});
  if(ticket===serial)status.hidden=true;
  if(ticket!==serial||abort.signal.aborted)viewer?.dispose?.();
 }catch(error){if(ticket===serial){console.error("[文明戰線] GM 動畫預覽載入失敗",error);showFailure("動畫預覽載入失敗，請重新啟動預覽。");}}
}
toggle.onclick=()=>{disabled=!disabled;toggle.textContent=disabled?"啟用預覽":"停用預覽";void start();};
$("restart").onclick=()=>{disabled=false;toggle.textContent="停用預覽";void start();};
quality.onchange=()=>void start();
window.addEventListener("pagehide",()=>{setMaximized(false);release();});
window.addEventListener("keydown",event=>{
 if(event.key!=="Escape")return;
 if(maximized){event.preventDefault();event.stopImmediatePropagation();setMaximized(false);return;}
 if(embedded){event.preventDefault();try{window.parent?.postMessage({type:"civilization3d:close"},location.origin);}catch(_){}}
});
window.Civilization3DTestCenter=Object.freeze({
 version:7,caseIds:cases.map(c=>c.id),categoryIds:[],
 // Retain historical automated battle diagnostics without a second user interface.
 async selectCase(id){if(!cases.some(c=>c.id===id))throw Error("unknown-test-case");selected=id;renderInfo();await start();},
 getCurrent:()=>selected,isMaximized:()=>maximized,
 getFixture:()=>({world:1,selectedMap:0,regionProgress:1,appearanceMode:embedded?"formal":"free",scenarioMode:embedded?"formal":"free"})
});
renderInfo();void start();
})();
