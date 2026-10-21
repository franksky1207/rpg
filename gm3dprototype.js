/* GM 3D prototype bridge: session-only presentation, no gameplay mutation. */
(function(){
"use strict";
let overlay=null, previousFocus=null, previousOverflow=null, previousScrollX=0,previousScrollY=0, previousMainScrollTop=0;
function allowed(){return typeof state!=="undefined" && state?.gm===true;}
function close(){
  if(!overlay)return false;
  const node=overlay;overlay=null;
  node.remove();
  if(previousOverflow!==null)document.body.style.overflow=previousOverflow;
  previousOverflow=null;
  window.scrollTo(previousScrollX,previousScrollY);
  const main=document.getElementById("main");if(main)main.scrollTop=previousMainScrollTop;
  if(previousFocus?.isConnected)previousFocus.focus({preventScroll:true});
  previousFocus=null;
  return true;
}
function open(){
  if(!allowed())return false;
  if(overlay)return true;
  previousFocus=document.activeElement;
  previousOverflow=document.body.style.overflow;
  previousScrollX=window.scrollX;previousScrollY=window.scrollY;
  previousMainScrollTop=document.getElementById("main")?.scrollTop||0;
  const layer=document.createElement("div");
  layer.id="gm3dPrototypeOverlay";
  layer.setAttribute("role","dialog");
  layer.setAttribute("aria-modal","true");
  layer.setAttribute("aria-label","GM 動畫測試中心");
  layer.style.cssText="position:fixed;inset:0;z-index:2147483000;background:#050d19;display:flex;flex-direction:column;padding:env(safe-area-inset-top) 0 env(safe-area-inset-bottom)";
  const bar=document.createElement("div");
  bar.style.cssText="display:flex;align-items:center;justify-content:space-between;gap:10px;background:#0a1627;color:#e7f5ff;padding:10px max(14px,env(safe-area-inset-right)) 10px max(14px,env(safe-area-inset-left));border-bottom:1px solid #355879";
  const title=document.createElement("strong");title.textContent="GM 測試｜動畫測試中心";
  const exit=document.createElement("button");exit.type="button";exit.className="btn";exit.textContent="← 返回原本畫面";
  exit.addEventListener("click",close);
  bar.append(title,exit);
  const frame=document.createElement("iframe");
  frame.src="3d-test/?embedded=1&v=20261021-batch16-dungeons1";
  frame.title="文明戰線 GM 動畫測試中心";
  frame.style.cssText="display:block;flex:1;min-height:0;width:100%;border:0;background:#060c18";
  layer.append(bar,frame);
  frame.addEventListener("load",()=>{try{frame.contentWindow?.addEventListener("keydown",event=>{if(event.key==="Escape"){event.preventDefault();close();}});}catch(_){}});
  document.body.appendChild(layer);
  overlay=layer;
  document.body.style.overflow="hidden";
  exit.focus({preventScroll:true});
  return true;
}
document.addEventListener("keydown",event=>{
  if(!overlay)return;
  if(event.key==="Escape"){event.preventDefault();close();}
  if(event.key==="Tab"){
    // Keep the modal header reachable; iframe controls remain accessible through normal tabbing.
    if(document.activeElement===document.body){event.preventDefault();overlay.querySelector("button")?.focus();}
  }
});
window.addEventListener("message",event=>{
 if(!overlay||event.origin!==location.origin||event.source!==overlay.querySelector("iframe")?.contentWindow )return;
 if(event.data?.type==="civilization3d:sprite-auth"){
  event.source.postMessage({type:"civilization3d:sprite-auth-response",requestId:event.data.requestId,authorized:allowed(),playerName:allowed()?String(state?.playerName||"玩家"):null},event.origin);return;
 }
 if(!allowed())return;
 if(event.data?.type==="civilization3d:sprite-snapshot"){
  const sender=event.source,origin=event.origin,requestId=event.data.requestId;
  (async()=>{let appearance=null;try{await window.Civilization3DLoader.ensure("appearance");if(allowed())appearance=window.Civilization3DFormalSnapshots?.appearance();}catch(_){}
   if(overlay&&overlay.querySelector("iframe")?.contentWindow===sender)sender.postMessage({type:"civilization3d:sprite-snapshot-response",requestId,authorized:allowed(),appearance:allowed()?appearance:null,eraVisualId:allowed()?window.CivilizationEraAppearanceContract?.resolve({world:appearance?.world})?.visualId:null},origin);
  })();return;
 }
 if(event.data?.type==="civilization3d:close"){close();return;}
 if(event.data?.type==="civilization3d:appearance-request"){
  const sender=event.source,origin=event.origin;
  // Read authoritative formal data; the loader is only invoked when GM requests a snapshot.
  (async()=>{
   try{
    await window.Civilization3DLoader.ensure("appearance");
    const appearance=window.Civilization3DFormalSnapshots?.appearance();
    if(!appearance)throw new Error("正式角色快照尚無可讀取資料");
    const catalog=window.Civilization3DFormalSnapshots.equipmentCatalog();
    if(!overlay||!allowed()||overlay.querySelector("iframe")?.contentWindow!==sender)return;
    sender.postMessage({type:"civilization3d:appearance-response",appearance,catalog},origin);
   }catch(error){
    if(overlay&&allowed()&&overlay.querySelector("iframe")?.contentWindow===sender)sender.postMessage({type:"civilization3d:appearance-error",reason:String(error?.message||error)},origin);
   }
  })();
 }
 if(event.data?.type==="civilization3d:scenario-request"){
 try{
  if(!window.Civilization3DFormalSnapshots)throw new Error("正式唯讀快照模組尚未載入");
  const snapshot=window.Civilization3DFormalSnapshots.scenario();
  if(!snapshot)throw new Error("正式資料尚未可用");
  event.source.postMessage({type:"civilization3d:scenario-response",snapshot},event.origin);
 }catch(error){
  event.source.postMessage({type:"civilization3d:scenario-error",reason:String(error?.message||error)},event.origin);
 }
 }
});
window.openGm3DPrototype=open;
window.closeGm3DPrototype=close;
window.gm3DPrototypeTestHtml=function(){
  return '<p class="muted gm-hub-note">開啟 GM 動畫測試中心，檢視現有角色動作與戰鬥動畫測試，不影響正式角色及戰鬥資料。退出後直接回到目前 GM 測試頁，不會重新整理、重設捲動或修改角色資料。</p><div class="controls"><button class="btn blue" type="button" onclick="openGm3DPrototype()">進入動畫測試中心</button></div>';
};
window.GM_3D_PROTOTYPE_BRIDGE_VERSION=1;
})();
