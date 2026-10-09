/* 3D Batch 03: opt-in home command bridge, no state or save writes. */
(function(global){
"use strict";
let runtime=null,loading=null,enabled=false,epoch=0;
const host=()=>document.getElementById("civilization3dFormalHost");
function hide(){epoch++;enabled=false;runtime?.dispose();runtime=null;const h=host();if(h){h.hidden=true;h.setAttribute("aria-hidden","true");h.dataset.3dFormalMount="inactive";}document.body.classList.remove("civilization-3d-home-on");syncButton();}
function syncButton(){const b=document.getElementById("civilization3dHomeToggle");if(b){b.textContent=enabled?"關閉 3D 艦橋":"預覽 3D 艦橋";b.setAttribute("aria-pressed",String(enabled));}}
function script(src){return new Promise((resolve,reject)=>{const s=document.createElement("script");s.src=src;s.onload=resolve;s.onerror=()=>reject(new Error("load-failed"));document.head.appendChild(s);});}
async function load(){
 if(global.BABYLON?.Engine&&global.Civilization3DPrototype?.createScene)return;
 if(!loading)loading=(async()=>{
  if(!global.BABYLON?.Engine)await script("https://cdn.jsdelivr.net/npm/babylonjs@7.54.3/babylon.js");
  if(!global.Civilization3DPrototype?.createScene)await script("3d-test/prototype-engine.js?v=20261009-b03");
 })().catch(error=>{loading=null;throw error;});
 return loading;
}
async function toggle(){
 if(enabled){hide();return;}
 const h=host();if(!h||!global.Civilization3DRuntime)return;
 const ticket=++epoch;enabled=true;h.hidden=false;h.setAttribute("aria-hidden","false");h.dataset.3dFormalMount="loading";syncButton();
 try{
  await load();
  if(ticket!==epoch||!enabled)return;
  runtime=global.Civilization3DRuntime.create({host:h,onFallback:()=>hide()});
  runtime.setQuality("low");
  const result=await runtime.show("home-command-bridge",global.Civilization3DPrototype.createScene);
  if(ticket!==epoch||!enabled)return;
  if(!result.ok){hide();return;}
  h.dataset.3dFormalMount="active";
  document.body.classList.add("civilization-3d-home-on");
 }catch(error){if(ticket===epoch)hide();}
}
function onRendered(view){
 if(view!=="home"&&enabled)hide();
 else syncButton();
}
global.civilization3dToggleHome=toggle;
global.civilization3dHomeRouteRendered=onRendered;
global.CIVILIZATION_3D_HOME_BRIDGE_VERSION=1;
})(window);
