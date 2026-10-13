/* 3D Batch 03: opt-in home command bridge, no state or save writes. */
(function(global){
"use strict";
let runtime=null,enabled=false,epoch=0;
let activeControl=null,activeHost=null;
const host=(kind)=>document.getElementById(kind==="chronicle-story"?"civilization3dStoryHost":"civilization3dFormalHost");
function hide(){
 epoch++;enabled=false;
 const old=runtime;runtime=null;old?.dispose();
 const h=activeHost||host(activeGrowthKind);
 if(h){h.querySelector('[data-character-fallback-notice]')?.remove();h.hidden=true;h.setAttribute("aria-hidden","true");h.dataset.threeDFormalMount="inactive";}
 activeControl=null;activeHost=null;
 document.body.classList.remove("civilization-3d-home-on");
 syncAllPreviewButtons();
}
function reportFailure(h,code,detail){
 h.dataset.threeDPreviewError=code;
 dom.showFailure(code);
 console.warn("3D preview",code,detail||"");
 global.dispatchEvent(new CustomEvent("civilization3d:preview-error",{detail:{code,reason:String(detail||code)}}));
}
function syncButton(){syncAllPreviewButtons();}
const load=()=>global.Civilization3DLoader.load();
const dom=global.Civilization3DFormalDOM.create({toggle,hide,getState:()=>({runtime,enabled,activeControl,activeHost,activeGrowthKind,activeRoute,activeEra})});
const syncAllPreviewButtons=()=>dom.syncAllPreviewButtons();
const onRendered=view=>dom.onRendered(view);
global.Civilization3DLoader.schedulePrefetch();
let activeRoute="home",activeEra="",activeGrowthKind=null;
async function toggle(route="home",growthKind=null){
 const eventTarget=global.event?.target;
 const clicked=eventTarget?.closest?.("button")||null;
 if(enabled){
  const same=activeRoute===route&&activeGrowthKind===growthKind&&(!clicked||!activeControl||clicked===activeControl);
  hide();if(same)return;
 }
 const h=host(growthKind);if(!h||global.CivilizationPresentationMode?.canPreview3D?.()===false)return;
 activeRoute=route;activeGrowthKind=growthKind;
 activeControl=clicked||null;activeHost=h;
 activeEra=route==="adventure"?(global.getAdventureEraView?.()||""):"";
 dom.clearFailure();
 delete h.dataset.threeDPreviewError;
 const ticket=++epoch;enabled=true;h.hidden=false;h.setAttribute("aria-hidden","false");h.dataset.threeDFormalMount="loading";syncButton();
 try{
  await load();
  if(ticket!==epoch||!enabled||!h.isConnected){if(ticket===epoch)hide();return;}
  if(runtime){runtime.dispose();runtime=null;}
  runtime=global.Civilization3DRuntime.create({host:h,onFallback:reason=>{reportFailure(h,reason);hide();},onClose:()=>hide(),onContextRestored:()=>{if(enabled)hide();}});
  runtime.setQuality(matchMedia('(max-width: 700px)').matches?'low':'medium');
  const world=typeof global.currentWorldPhase==="function"?Number(global.currentWorldPhase()):1;
  const era=global.getAdventureEraView?.()||"";
  const galaxy=activeRoute==="adventure"&&((world===1&&era==="galaxy")||((world===2||world===3)&&era==="galaxy-review"));
  const universe=activeRoute==="adventure"&&((world===2&&era==="universe")||(world===3&&era==="universe-review"));
  const higher=activeRoute==="adventure"&&world===3&&era==="higher-dimensional";
  const character=activeRoute==="character";
  const inventory=activeRoute==="inventory";
  const forge=activeRoute==="enhancement";
  const growth=activeRoute==="specialization"||!!activeGrowthKind;
  const battlePreview=activeGrowthKind==="battle-preview";
   const servicePreview=String(activeGrowthKind||"").startsWith("service-");
   const chroniclePreview=activeGrowthKind==="chronicle-record"||activeGrowthKind==="chronicle-story"||activeGrowthKind==="chronicle-reincarnation";
  const frontier=activeRoute==="calamity"||activeRoute==="alternateuniverse";
  const dungeon=["dungeon","dungeon-bounty","dungeon-arena"].includes(activeRoute);
  const advanced=(activeRoute==="dungeon-arena"&&Number(global.currentWorldPhase?.()||0)===3)||["dungeon-mirror","dungeon-void-mirage"].includes(activeRoute);
  const create=servicePreview?global.Civilization3DPrototype.createServiceConsoleScene:chroniclePreview?global.Civilization3DPrototype.createChronicleTransitionScene:battlePreview?global.Civilization3DPrototype.createBattlePresentationScene:frontier?global.Civilization3DPrototype.createFrontierScene:advanced?global.Civilization3DPrototype.createDungeonAdvancedScene:dungeon?global.Civilization3DPrototype.createDungeonScene:growth?global.Civilization3DPrototype.createGrowthScene:forge?global.Civilization3DPrototype.createForgeScene:inventory?global.Civilization3DPrototype.createEquipmentScene:character?global.Civilization3DPrototype.createCharacterScene:higher?global.Civilization3DPrototype.createHigherDimensionalScene:universe?global.Civilization3DPrototype.createUniverseScene:galaxy?global.Civilization3DPrototype.createGalaxyScene:(global.Civilization3DPrototype.createEpochScene||global.Civilization3DPrototype.createScene);
  global.Civilization3DLoader.requireFactory(create);
  const data=global.Civilization3DFormalSnapshots;
  if(!data)throw new Error("正式唯讀快照模組尚未載入");
  const galaxySnapshot=galaxy?data.galaxy({review:era==="galaxy-review",mapIndex:era==="galaxy-review"?global.getGalaxyReviewSelectedMap?.():(typeof selectedMap==="number"?selectedMap:0)}):{};
  const universeSnapshot=universe?data.universe({review:era==="universe-review"}):{};
  const higherSnapshot=higher?data.higher():{};
  const appearance=character||inventory||forge?data.appearance():null;
  const growthState=growth?data.growth(activeGrowthKind||"specialization"):{};
  const dungeonSnapshot=dungeon?data.dungeon(activeRoute==="dungeon-arena"?"arena":activeRoute==="dungeon-bounty"?"bounty":"hub"):{};
  if(activeRoute==="dungeon"&&dungeonSnapshot.status!=="unavailable")dom.filterDungeon(dungeonSnapshot);
  const advancedSnapshot=advanced?data.dungeon(activeRoute==="dungeon-arena"?"arena":activeRoute==="dungeon-mirror"?"mirror":"void"):{};
  const frontierSnapshot=frontier?(activeRoute==="alternateuniverse"?data.alternate():data.calamity(world>=2&&!!document.querySelector("#main .universe-civilization-summary")?2:1,{review:world>(document.querySelector("#main .universe-civilization-summary")?2:1)})):{};
  const battleSnapshot=battlePreview?data.battle():{};
  const snapshot=servicePreview?{kind:activeGrowthKind.slice(8),visualOnly:true}:chroniclePreview?{kind:activeGrowthKind==="chronicle-reincarnation"?"reincarnation":activeGrowthKind==="chronicle-story"?"story":"record",visualOnly:true}:battlePreview?battleSnapshot:frontier?frontierSnapshot:advanced?advancedSnapshot:dungeon?dungeonSnapshot:growth?growthState:forge||inventory||character?global.Civilization3DAppearance?.scene(forge?"forge":inventory?"equipment":"character",appearance)||{}:higher?higherSnapshot:galaxy?galaxySnapshot:universeSnapshot;
  if(snapshot.status==="unavailable"||battlePreview&&battleSnapshot.battleAvailable!==true){hide();return;}
  const session=runtime;
  const result=await session.show("preview-"+activeRoute+"-era-"+world,args=>create({...args,world,...snapshot}));
  if(ticket!==epoch||!enabled||!h.isConnected){if(ticket===epoch)hide();return;}
  if(!result.ok){reportFailure(h,result.reason||"scene-failed",result.error);hide();return;}
  h.dataset.threeDFormalMount="active";
  const model=runtime.getSnapshot().character;
  if(model?.assetKind==='geometry-fallback'){
   const notice=document.createElement('p');notice.className='muted';notice.dataset.characterFallbackNotice='1';notice.setAttribute('role','status');notice.textContent='人物資源暫時無法使用，正在顯示替代外觀。';h.appendChild(notice);
  }
  document.body.classList.add("civilization-3d-home-on");
 }catch(error){if(ticket===epoch){reportFailure(h,error.code||"scene-failed",error.message);hide();}}
}
global.civilization3dToggleStory=()=>toggle("story","chronicle-story");
global.civilization3dHideStoryPreview=()=>{if(activeGrowthKind==="chronicle-story"&&enabled)hide();};
global.civilization3dToggleHome=()=>toggle("home");
global.civilization3dToggleGalaxy=()=>toggle("adventure");
global.civilization3dToggleUniverse=()=>toggle("adventure");
global.civilization3dToggleHigher=()=>toggle("adventure");
global.civilization3dToggleCharacter=()=>toggle("character");
global.civilization3dToggleInventory=()=>toggle("inventory");
global.civilization3dToggleForge=()=>toggle("enhancement");
global.civilization3dToggleGrowth=()=>toggle("specialization","specialization");
global.civilization3dHomeRouteRendered=onRendered;
if(typeof global.registerDungeonPostRenderHook==="function")global.registerDungeonPostRenderHook(({view})=>onRendered(view));
global.addEventListener("pagehide",hide);
global.CIVILIZATION_3D_HOME_BRIDGE_VERSION=1;
})(window);
