/* 3D Batch 03: opt-in home command bridge, no state or save writes. */
(function(global){
"use strict";
let runtime=null,loading=null,enabled=false,epoch=0;
const host=()=>document.getElementById("civilization3dFormalHost");
function hide(){epoch++;enabled=false;const old=runtime;runtime=null;old?.dispose();const h=host();if(h){h.hidden=true;h.setAttribute("aria-hidden","true");h.dataset.threeDFormalMount="inactive";}document.body.classList.remove("civilization-3d-home-on");syncButton();}
function syncButton(){for(const id of ["civilization3dHomeToggle","civilization3dGalaxyToggle","civilization3dUniverseToggle","civilization3dHigherToggle"]){const b=document.getElementById(id);if(b){const galaxy=id==="civilization3dGalaxyToggle";b.textContent=enabled?"關閉 3D 預覽":galaxy?"預覽 3D 銀河星圖":id==="civilization3dUniverseToggle"?"預覽 3D 宇宙星圖":id==="civilization3dHigherToggle"?"預覽 3D 高維戰線":"預覽 3D 艦橋";b.setAttribute("aria-pressed",String(enabled));}}}
function script(src){return new Promise((resolve,reject)=>{const s=document.createElement("script");s.src=src;s.onload=resolve;s.onerror=()=>reject(new Error("load-failed"));document.head.appendChild(s);});}
async function load(){
 if(global.BABYLON?.Engine&&global.Civilization3DPrototype?.createHigherDimensionalScene)return;
 if(!loading)loading=(async()=>{
  if(!global.BABYLON?.Engine)await script("vendor/babylonjs/7.54.3/babylon.js");
  if(!global.Civilization3DPrototype?.createHigherDimensionalScene)await script("3d-test/prototype-engine.js?v=20261009-b03&v2=20261009-b04&v3=20261009-b05&v4=20261009-b05-region-lock&v5=20261009-b06&v6=20261009-b07");
 })().catch(error=>{loading=null;throw error;});
 return loading;
}
let activeRoute="home",activeEra="";
async function toggle(route="home"){
 if(enabled){hide();return;}
 const h=host();if(!h||!global.Civilization3DRuntime)return;
 activeRoute=route;
 activeEra=route==="adventure"?(global.getAdventureEraView?.()||""):"";
 const ticket=++epoch;enabled=true;h.hidden=false;h.setAttribute("aria-hidden","false");h.dataset.threeDFormalMount="loading";syncButton();
 try{
  await load();
  if(ticket!==epoch||!enabled)return;
  if(runtime){runtime.dispose();runtime=null;}
  runtime=global.Civilization3DRuntime.create({host:h,onFallback:()=>hide(),onClose:()=>hide(),onContextRestored:()=>{if(enabled)hide();}});
  runtime.setQuality("low");
  const world=typeof global.currentWorldPhase==="function"?Number(global.currentWorldPhase()):1;
  const era=global.getAdventureEraView?.()||"";
  const galaxy=activeRoute==="adventure"&&((world===1&&era==="galaxy")||((world===2||world===3)&&era==="galaxy-review"));
  const universe=activeRoute==="adventure"&&((world===2&&era==="universe")||(world===3&&era==="universe-review"));
  const higher=activeRoute==="adventure"&&world===3&&era==="higher-dimensional";
  const create=higher?global.Civilization3DPrototype.createHigherDimensionalScene:universe?global.Civilization3DPrototype.createUniverseScene:galaxy?global.Civilization3DPrototype.createGalaxyScene:(global.Civilization3DPrototype.createEpochScene||global.Civilization3DPrototype.createScene);
  const regions=typeof WORLD_REGIONS!=="undefined"?WORLD_REGIONS:global.WORLD_REGIONS;
  const formalState=typeof state!=="undefined"?state:global.state;
  const mapIndex=galaxy&&era==="galaxy-review"&&typeof global.getGalaxyReviewSelectedMap==="function"?Number(global.getGalaxyReviewSelectedMap()):(typeof selectedMap==="number"?selectedMap:0);
  const unlockedIndex=Number(formalState?.unlockedMap)||0;
  const regionList=Array.isArray(regions)?regions:[];
  const selectedRegion=regionList.reduce((last,region,i)=>mapIndex>=Number(region.mapStart)?i:last,0);
  const unlockedRegions=regionList.map(region=>era==="galaxy-review"||unlockedIndex>=Number(region.mapStart));
  const bosses=Array.isArray(global.SECOND_WORLD_BOSSES)?global.SECOND_WORLD_BOSSES:[];
  const highest=typeof global.secondWorldHighestUnlockedBossIndex==="function"?Number(global.secondWorldHighestUnlockedBossIndex()):0;
  const cleared=bosses.filter(b=>typeof global.secondWorldBossKilled==="function"&&global.secondWorldBossKilled(b.index)).length;
  const universeSnapshot=universe?{highestUnlockedBossIndex:highest,clearedBossCount:cleared,selectedMap:Math.max(0,Math.min(9,Math.floor(highest/10))),review:era==="universe-review"}:{};
  const defs=Array.isArray(global.THIRD_WORLD_BOSS_DEFINITIONS)?global.THIRD_WORLD_BOSS_DEFINITIONS:[];
  const presences=higher?defs.slice(0,10).map((_,i)=>{
    const p=typeof global.thirdWorldBossProgressSnapshot==="function"?global.thirdWorldBossProgressSnapshot(i,formalState):null;
    return {defeated:p?.defeated===true,available:p?.challengeable!==false,remainingPercent:Number(p?.remainingPercent??100)};
  }):[];
  const higherSnapshot=higher?{presences,selectedPresence:Math.max(0,presences.findIndex(p=>!p.defeated))}:{};
  const snapshot=higher?higherSnapshot:galaxy?{mapCount:regionList.length||10,selectedMap:selectedRegion,unlockedRegions,enemyCount:5}:universeSnapshot;
  const result=await runtime.show("preview-"+activeRoute+"-era-"+world,args=>create({...args,world,...snapshot}));
  if(ticket!==epoch||!enabled){hide();return;}
  if(!result.ok){hide();return;}
  h.dataset.threeDFormalMount="active";
  document.body.classList.add("civilization-3d-home-on");
 }catch(error){if(ticket===epoch)hide();}
}
function ensureGalaxyMainlineControl(view){
 if(view!=="adventure")return;
 const world=typeof global.currentWorldPhase==="function"?Number(global.currentWorldPhase()):NaN;
 const era=typeof global.getAdventureEraView==="function"?global.getAdventureEraView():world===1?"galaxy":"";
 if(world!==1||era!=="galaxy")return;
 const main=document.getElementById("main");
 if(!main||main.querySelector("#civilization3dGalaxyToggle"))return;
 const screen=main.querySelector(".map-screen:not(.galaxy-review-adventure-screen)");
 const regions=screen?.querySelector(".world-region-list");
 if(!regions)return;
 const controls=document.createElement("div");
 controls.className="galaxy-3d-controls";
 const button=document.createElement("button");
 button.id="civilization3dGalaxyToggle";
 button.className="btn";
 button.type="button";
 button.setAttribute("aria-pressed","false");
 button.textContent="預覽 3D 銀河星圖";
 button.addEventListener("click",()=>toggle("adventure"));
 const hint=document.createElement("span");
 hint.className="muted";
 hint.textContent="立體預覽不改變正式地圖、怪物或戰鬥選擇。";
 controls.append(button,hint);
 regions.before(controls);
}
function ensureGalaxyReviewControl(view){
 if(view!=="adventure")return;
 const world=Number(global.currentWorldPhase?.()||0),era=global.getAdventureEraView?.();
 if(!([2,3].includes(world)&&era==="galaxy-review"))return;
 const screen=document.querySelector("#main .galaxy-review-adventure-screen");
 if(!screen||screen.querySelector("#civilization3dGalaxyToggle"))return;
 const list=screen.querySelector(".galaxy-review-region-list");
 if(!list)return;
 const controls=document.createElement("div");controls.className="galaxy-3d-controls";
 const button=document.createElement("button");button.id="civilization3dGalaxyToggle";button.className="btn";button.type="button";
 button.setAttribute("aria-pressed","false");button.textContent="預覽 3D 銀河星圖";
 button.addEventListener("click",()=>toggle("adventure"));
 const hint=document.createElement("span");hint.className="muted";
 hint.textContent="銀河回顧星圖僅供觀看；正式回顧挑戰由原本地圖按鈕操作。";
 controls.append(button,hint);list.before(controls);
}
function ensureUniverseControl(view){
 if(view!=="adventure")return;
 const world=Number(global.currentWorldPhase?.()||0),era=global.getAdventureEraView?.();
 if(!((world===2&&era==="universe")||(world===3&&era==="universe-review")))return;
 const screen=document.querySelector("#main .universe-adventure-screen:not(.galaxy-review-adventure-screen)");
 if(!screen||screen.querySelector("#civilization3dUniverseToggle"))return;
 const controls=document.createElement("div");controls.className="galaxy-3d-controls";
 const button=document.createElement("button");button.id="civilization3dUniverseToggle";button.className="btn";button.type="button";
 button.setAttribute("aria-pressed","false");button.textContent="預覽 3D 宇宙星圖";
 button.addEventListener("click",()=>toggle("adventure"));
 const hint=document.createElement("span");hint.className="muted";hint.textContent="立體展示不改變正式 Boss、進度或回顧規則。";
 controls.append(button,hint);
 const list=screen.querySelector(".universe-region-list");
 if(list)list.before(controls);
}
function ensureHigherControl(view){
 if(view!=="adventure"||Number(global.currentWorldPhase?.()||0)!==3||global.getAdventureEraView?.()!=="higher-dimensional")return;
 const screen=document.querySelector("#main .third-world-adventure-screen");
 if(!screen||screen.querySelector("#civilization3dHigherToggle")||!screen.querySelector(".third-world-boss-card"))return;
 const controls=document.createElement("div");controls.className="galaxy-3d-controls";
 const button=document.createElement("button");button.id="civilization3dHigherToggle";button.className="btn";button.type="button";
 button.setAttribute("aria-pressed","false");button.textContent="預覽 3D 高維戰線";
 button.addEventListener("click",()=>toggle("adventure"));
 const hint=document.createElement("span");hint.className="muted";hint.textContent="僅供觀看，永久 HP 與回顧挑戰依正式遊戲規則。";
 controls.append(button,hint);
 const grid=screen.querySelector(".third-world-boss-card")?.closest(".map-grid");
 if(grid)grid.before(controls);
}
function onRendered(view){
 if(view!==activeRoute&&(enabled||runtime))hide();
 if(view==="adventure"&&enabled){
  const world=Number(global.currentWorldPhase?.()||1),era=global.getAdventureEraView?.()||"";
  if(era!==activeEra||!((world===1&&era==="galaxy")||([2,3].includes(world)&&era==="galaxy-review")||(world===2&&era==="universe")||(world===3&&era==="universe-review")||(world===3&&era==="higher-dimensional")))hide();
 }
 ensureGalaxyMainlineControl(view);
 ensureGalaxyReviewControl(view);
 ensureUniverseControl(view);
 ensureHigherControl(view);
 syncButton();
}
global.civilization3dToggleHome=()=>toggle("home");
global.civilization3dToggleGalaxy=()=>toggle("adventure");
global.civilization3dToggleUniverse=()=>toggle("adventure");
global.civilization3dToggleHigher=()=>toggle("adventure");
global.civilization3dHomeRouteRendered=onRendered;
global.CIVILIZATION_3D_HOME_BRIDGE_VERSION=1;
})(window);
