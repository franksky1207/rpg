/* 3D Batch 03: opt-in home command bridge, no state or save writes. */
(function(global){
"use strict";
let runtime=null,loading=null,enabled=false,epoch=0;
const host=()=>document.getElementById("civilization3dFormalHost");
function hide(){epoch++;enabled=false;const old=runtime;runtime=null;old?.dispose();const h=host();if(h){h.hidden=true;h.setAttribute("aria-hidden","true");h.dataset.threeDFormalMount="inactive";}document.body.classList.remove("civilization-3d-home-on");syncButton();}
function syncButton(){for(const id of ["civilization3dHomeToggle","civilization3dGalaxyToggle"]){const b=document.getElementById(id);if(b){const galaxy=id==="civilization3dGalaxyToggle";b.textContent=enabled?"關閉 3D 預覽":galaxy?"預覽 3D 銀河星圖":"預覽 3D 艦橋";b.setAttribute("aria-pressed",String(enabled));}}}
function script(src){return new Promise((resolve,reject)=>{const s=document.createElement("script");s.src=src;s.onload=resolve;s.onerror=()=>reject(new Error("load-failed"));document.head.appendChild(s);});}
async function load(){
 if(global.BABYLON?.Engine&&global.Civilization3DPrototype?.createGalaxyScene)return;
 if(!loading)loading=(async()=>{
  if(!global.BABYLON?.Engine)await script("vendor/babylonjs/7.54.3/babylon.js");
  if(!global.Civilization3DPrototype?.createGalaxyScene)await script("3d-test/prototype-engine.js?v=20261009-b03&v2=20261009-b04&v3=20261009-b05");
 })().catch(error=>{loading=null;throw error;});
 return loading;
}
let activeRoute="home";
async function toggle(route="home"){
 if(enabled){hide();return;}
 const h=host();if(!h||!global.Civilization3DRuntime)return;
 activeRoute=route;
 const ticket=++epoch;enabled=true;h.hidden=false;h.setAttribute("aria-hidden","false");h.dataset.threeDFormalMount="loading";syncButton();
 try{
  await load();
  if(ticket!==epoch||!enabled)return;
  if(runtime){runtime.dispose();runtime=null;}
  runtime=global.Civilization3DRuntime.create({host:h,onFallback:()=>hide(),onContextRestored:()=>{if(enabled)hide();}});
  runtime.setQuality("low");
  const world=typeof global.currentWorldPhase==="function"?Number(global.currentWorldPhase()):1;
  const galaxy=activeRoute==="adventure"&&world===1;
  const create=galaxy?global.Civilization3DPrototype.createGalaxyScene:(global.Civilization3DPrototype.createEpochScene||global.Civilization3DPrototype.createScene);
  const maps=typeof MAPS!=="undefined"?MAPS:global.MAPS;
  const formalState=typeof state!=="undefined"?state:global.state;
  const snapshot=galaxy?{mapCount:Array.isArray(maps)?maps.length:10,selectedMap:typeof selectedMap==="number"?selectedMap:0,unlockedMap:Number(formalState?.unlockedMap)||0,enemyCount:5}:{};
  const result=await runtime.show("preview-"+activeRoute+"-era-"+world,args=>create({...args,world,...snapshot}));
  if(ticket!==epoch||!enabled){hide();return;}
  if(!result.ok){hide();return;}
  h.dataset.threeDFormalMount="active";
  document.body.classList.add("civilization-3d-home-on");
 }catch(error){if(ticket===epoch)hide();}
}
function onRendered(view){
 if(view!==activeRoute&&(enabled||runtime))hide();
 else syncButton();
}
global.civilization3dToggleHome=()=>toggle("home");
global.civilization3dToggleGalaxy=()=>toggle("adventure");
global.civilization3dHomeRouteRendered=onRendered;
global.CIVILIZATION_3D_HOME_BRIDGE_VERSION=1;
})(window);
