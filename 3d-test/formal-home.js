/* 3D Batch 03: opt-in home command bridge, no state or save writes. */
(function(global){
"use strict";
let runtime=null,loading=null,enabled=false,epoch=0;
const host=()=>document.getElementById("civilization3dFormalHost");
function hide(){epoch++;enabled=false;const old=runtime;runtime=null;old?.dispose();const h=host();if(h){h.hidden=true;h.setAttribute("aria-hidden","true");h.dataset.threeDFormalMount="inactive";}document.body.classList.remove("civilization-3d-home-on");syncButton();}
function syncButton(){for(const id of ["civilization3dHomeToggle","civilization3dGalaxyToggle","civilization3dUniverseToggle","civilization3dHigherToggle","civilization3dCharacterToggle","civilization3dInventoryToggle","civilization3dForgeToggle","civilization3dGrowthToggle","civilization3dGrowthPageToggle","civilization3dDungeonToggle","civilization3dAdvancedToggle"]){const b=document.getElementById(id);if(b){const galaxy=id==="civilization3dGalaxyToggle";b.textContent=enabled?"關閉 3D 預覽":galaxy?"預覽 3D 銀河星圖":id==="civilization3dUniverseToggle"?"預覽 3D 宇宙星圖":id==="civilization3dHigherToggle"?"預覽 3D 高維戰線":id==="civilization3dCharacterToggle"?"預覽 3D 角色":id==="civilization3dInventoryToggle"?"預覽 3D 裝備陳列":id==="civilization3dForgeToggle"?"預覽 3D 強化鍛造台":id==="civilization3dGrowthToggle"?"預覽 3D 八種專精":id==="civilization3dGrowthPageToggle"?(b.dataset.previewLabel||"預覽 3D 養成星環"):id==="civilization3dDungeonToggle"?(b.dataset.previewLabel||"預覽 3D 副本作戰中心") :id==="civilization3dAdvancedToggle"?(b.dataset.previewLabel||"預覽 3D 副本"):"預覽 3D 艦橋";b.setAttribute("aria-pressed",String(enabled));}}}
function script(src){return new Promise((resolve,reject)=>{const s=document.createElement("script");s.src=src;s.onload=resolve;s.onerror=()=>reject(new Error("load-failed"));document.head.appendChild(s);});}
const BABYLON_SRC="vendor/babylonjs/7.54.3/babylon.js";
const SCENE_SRC="3d-test/prototype-engine.js?v=20261009-b11&v2=20261009-b12&v3=20261009-b12-entry-state&v4=20261009-b13&v5=20261009-b13-higher-hub";
async function load(){
 if(global.BABYLON?.Engine&&global.Civilization3DPrototype?.createDungeonAdvancedScene)return;
 if(!loading)loading=Promise.all([
   global.BABYLON?.Engine?Promise.resolve():script(BABYLON_SRC),
   global.Civilization3DPrototype?.createDungeonAdvancedScene?Promise.resolve():script(SCENE_SRC)
 ]).then(()=>{if(!global.BABYLON?.Engine||!global.Civilization3DPrototype?.createDungeonAdvancedScene)throw new Error("3d-modules-unavailable");})
 .catch(error=>{loading=null;throw error;});
 return loading;
}
/* Warm network cache only; WebGL and GPU allocations begin on explicit user action. */
function schedule3dPrefetch(){
 const run=()=>{
  for(const src of [BABYLON_SRC,SCENE_SRC]){
   if(document.querySelector('link[data-civilization-3d-prefetch="'+src+'"]'))continue;
   const link=document.createElement("link");
   link.rel="prefetch";link.as="script";link.href=src;link.dataset.civilization3dPrefetch=src;
   document.head.appendChild(link);
  }
 };
 const idle=()=>typeof global.requestIdleCallback==="function"?global.requestIdleCallback(run,{timeout:3000}):setTimeout(run,900);
 if(document.readyState==="complete")idle();else global.addEventListener("load",idle,{once:true});
}
schedule3dPrefetch();
let activeRoute="home",activeEra="",activeGrowthKind=null;
async function toggle(route="home",growthKind=null){
 if(enabled){hide();return;}
 const h=host();if(!h||!global.Civilization3DRuntime)return;
 activeRoute=route;activeGrowthKind=growthKind;
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
  const character=activeRoute==="character";
  const inventory=activeRoute==="inventory";
  const forge=activeRoute==="enhancement";
  const growth=activeRoute==="specialization"||!!activeGrowthKind;
  const dungeon=["dungeon","dungeon-bounty","dungeon-arena"].includes(activeRoute);
  const advanced=(activeRoute==="dungeon-arena"&&Number(global.currentWorldPhase?.()||0)===3)||["dungeon-mirror","dungeon-void-mirage"].includes(activeRoute);
  const create=advanced?global.Civilization3DPrototype.createDungeonAdvancedScene:dungeon?global.Civilization3DPrototype.createDungeonScene:growth?global.Civilization3DPrototype.createGrowthScene:forge?global.Civilization3DPrototype.createForgeScene:inventory?global.Civilization3DPrototype.createEquipmentScene:character?global.Civilization3DPrototype.createCharacterScene:higher?global.Civilization3DPrototype.createHigherDimensionalScene:universe?global.Civilization3DPrototype.createUniverseScene:galaxy?global.Civilization3DPrototype.createGalaxyScene:(global.Civilization3DPrototype.createEpochScene||global.Civilization3DPrototype.createScene);
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
    return {defeated:p?.defeated===true,available:p?.challengeStatus?.allowed===true,remainingPercent:Number(p?.remainingPercent??100)};
  }):[];
  const higherSnapshot=higher?{presences,selectedPresence:Math.max(0,presences.findIndex(p=>!p.defeated))}:{};
  const appearance=global.Civilization3DAppearance?.capture();
  const growthState=growth?{
    growthKind:"specialization",
    growthLevels:(Array.isArray(global.SPECIALIZATION_KEYS)?global.SPECIALIZATION_KEYS:[]).map(key=>Math.max(0,Math.min(60,Number(formalState?.specializations?.[key])||0))),
    marks:(Array.isArray(global.MARK_KEYS)?global.MARK_KEYS:[]).map(key=>Math.max(0,Math.min(10,Number(formalState?.marks?.entries?.[key]?.level)||0))),
    civilizationLevel:Math.max(0,Math.min(10,Number(formalState?.secondWorld?.civilizationLevel)||0)),
    coreLevel:Math.max(0,Math.min(10,Number(formalState?.thirdWorld?.coreLevel)||0))
  }:{};
  if(growth){
    const choice=activeGrowthKind||"specialization";
    growthState.growthKind=choice;
    growthState.growthLevels=choice==="marks"?growthState.marks:growthState.growthLevels;
    growthState.growthLevel=choice==="civilization"?growthState.civilizationLevel:growthState.coreLevel;
  }
  const dungeonSnapshot=(()=>{if(!dungeon)return {};
    const phase=activeRoute==="dungeon-arena"?global.getArenaCoreState?.():activeRoute==="dungeon-bounty"?global.getBountyTestSnapshot?.():null;
    const dungeonKind=activeRoute==="dungeon-arena"?"arena":activeRoute==="dungeon-bounty"?"bounty":"hub";
    const remaining=phase?.daily?.remaining;
    const dungeonModeKeys=["bounty","arena","tower","mirror"];
    const dungeonVisibleModes=activeRoute==="dungeon"?dungeonModeKeys.filter(key=>{
      const policy=global.dungeonModeAvailability?.(key);
      if(policy?.visible===false)return false;
      const card=document.querySelector("#main .dungeon-mode-"+key);
      return !!card&&!card.hidden&&card.dataset.dungeonPolicyHidden!=="1"&&getComputedStyle(card).display!=="none";
    }):[];
    const dungeonAvailableModes=activeRoute==="dungeon"?dungeonModeKeys.map(key=>dungeonVisibleModes.includes(key)&&!!document.querySelector("#main .dungeon-mode-"+key+" .dungeon-entry-btn:not(:disabled)")):[];
    const available=dungeonAvailableModes.filter(Boolean).length;
    return {dungeonKind,dungeonPhase:phase?.phase==="ready"?"ready":"select",dungeonRemaining:Number.isFinite(Number(remaining))?Math.max(0,Number(remaining)):available,dungeonUnlocked:activeRoute==="dungeon"||!!phase,dungeonAvailableModes,dungeonVisibleModes};
  })();
  const advancedSnapshot=(()=>{if(!advanced)return {};
    if(activeRoute==="dungeon-arena"){
      const a=global.getArenaCoreState?.()||{},rt=a.runtime||{};
      return {advancedKind:"higher-arena",advancedStage:Number(rt.round?.stageIndex)||0,advancedProgress:Number(rt.finishedRuns)||0,advancedUnlocked:true};
    }
    if(activeRoute==="dungeon-mirror"){
      const info=global.mirrorDungeonStatus?.()||{},history=info.history||{};
      return {advancedKind:"mirror",advancedProgress:Number(history.bestWins)||0,advancedUnlocked:info.unlocked===true};
    }
    const progress=global.getVoidMirageProgressSnapshot?.()||global.getVoidMirageRunSnapshot?.()||{};
    return {advancedKind:"void",advancedProgress:Number(progress.highestCleared??progress.historicalHighest)||0,advancedUnlocked:true};
  })();
  const snapshot=advanced?advancedSnapshot:dungeon?dungeonSnapshot:growth?growthState:forge||inventory||character?global.Civilization3DAppearance?.scene(forge?"forge":inventory?"equipment":"character",appearance)||{}:higher?higherSnapshot:galaxy?{mapCount:regionList.length||10,selectedMap:selectedRegion,unlockedRegions,enemyCount:5}:universeSnapshot;
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
function ensureCharacterControl(view){
 if(view!=="character")return;
 const screen=document.querySelector("#main .character-layout");
 if(!screen||screen.querySelector("#civilization3dCharacterToggle"))return;
 const controls=document.createElement("div");controls.className="galaxy-3d-controls";
 const button=document.createElement("button");button.id="civilization3dCharacterToggle";button.className="btn";button.type="button";
 button.setAttribute("aria-pressed","false");button.textContent="預覽 3D 角色";
 button.addEventListener("click",()=>toggle("character"));
 const hint=document.createElement("span");hint.className="muted";hint.textContent="立體角色為展示佔位；能力、穿戴、稱號與突破以正式頁面為準。";
 controls.append(button,hint);screen.before(controls);
}
function ensureInventoryControl(view){
 if(view!=="inventory")return;
 const page=document.querySelector("#main .inventory-page");
 if(!page||page.querySelector("#civilization3dInventoryToggle"))return;
 const controls=document.createElement("div");controls.className="galaxy-3d-controls";
 const button=document.createElement("button");button.id="civilization3dInventoryToggle";button.className="btn";button.type="button";
 button.setAttribute("aria-pressed","false");button.textContent="預覽 3D 裝備陳列";
 button.addEventListener("click",()=>toggle("inventory"));
 const hint=document.createElement("span");hint.className="muted";hint.textContent="僅展示五個穿戴槽與背包樣本；換裝、鎖定、出售及贖回仍在下方操作。";
 controls.append(button,hint);
 const grid=page.querySelector(".grid");if(grid)grid.before(controls);else page.prepend(controls);
}
function ensureForgeControl(view){
 if(view!=="enhancement")return;
 const page=document.querySelector("#main .enhancement-page");
 if(!page||page.querySelector("#civilization3dForgeToggle"))return;
 const controls=document.createElement("div");controls.className="galaxy-3d-controls";
 const button=document.createElement("button");button.id="civilization3dForgeToggle";button.className="btn";button.type="button";
 button.setAttribute("aria-pressed","false");button.textContent="預覽 3D 強化鍛造台";
 button.addEventListener("click",()=>toggle("enhancement"));
 const hint=document.createElement("span");hint.className="muted";hint.textContent="展示五欄位強化狀態；實際消耗、確認與升級仍由原強化介面操作。";
 controls.append(button,hint);
 const shell=page.querySelector(".enhance-shell");
 if(shell)shell.before(controls);else page.prepend(controls);
}
function ensureGrowthControl(view){
 if(view!=="specialization")return;
 const page=document.querySelector("#main .function-page");
 if(!page||page.querySelector("#civilization3dGrowthToggle"))return;
 const controls=document.createElement("div");controls.className="galaxy-3d-controls";
 const button=document.createElement("button");button.id="civilization3dGrowthToggle";button.className="btn";button.type="button";
 button.textContent="預覽 3D 八種專精";button.setAttribute("aria-pressed","false");
 button.onclick=()=>toggle("specialization","specialization");
 const hint=document.createElement("span");hint.className="muted";hint.textContent="只顯示八種專精的正式等級；升級仍在原頁操作。";
 controls.append(button,hint);page.prepend(controls);
}
function ensureGrowthPageControls(view){
 const main=document.getElementById("main");
 if(!main)return;
 let kind=null,label="",anchor=null;
 if(view==="calamity"){
  const shell=main.querySelector(".calamity-shell.calamity-home");
  if(!shell)return; // No 3D preview while a calamity battle/result is open.
  if(shell.querySelector(".calamity-mark-grid")){
   kind="marks";label="預覽 3D 十種印記";anchor=shell.querySelector(".calamity-mark-grid");
  }else if(shell.querySelector(".universe-civilization-summary")||shell.querySelector(".calamity-grid")){
   // Only the actual universe civilization screen; never infer the era from currentWorldPhase alone.
   const universe=Number(global.currentWorldPhase?.()||0)>=2&&
     !shell.querySelector(".calamity-mark-grid")&&
     (shell.querySelector(".universe-civilization-summary")||shell.textContent.includes("宇宙災厄"));
   if(universe){kind="civilization";label="預覽 3D 文明等級";anchor=shell.querySelector(".universe-civilization-summary")||shell.querySelector(".calamity-grid");}
  }
 }else if(view==="adventure"&&Number(global.currentWorldPhase?.()||0)===3&&global.getAdventureEraView?.()==="higher-dimensional"){
  const screen=main.querySelector(".third-world-adventure-screen");
  const core=screen?.querySelector(".third-world-core-panel");
  if(core){kind="core";label="預覽 3D 界弦核心";anchor=core;}
 }
 if(!kind||!anchor||main.querySelector("#civilization3dGrowthPageToggle"))return;
 const controls=document.createElement("div");controls.className="galaxy-3d-controls";
 const button=document.createElement("button");button.id="civilization3dGrowthPageToggle";button.className="btn";button.type="button";
 button.textContent=label;button.dataset.previewLabel=label;button.setAttribute("aria-pressed","false");
 button.onclick=()=>toggle(view,kind);
 const hint=document.createElement("span");hint.className="muted";hint.textContent="僅顯示正式進度，不影響戰鬥、注入或養成操作。";
 controls.append(button,hint);anchor.before(controls);
}
function ensureDungeonControl(view){
 if(!["dungeon","dungeon-bounty","dungeon-arena"].includes(view))return;
 if(view==="dungeon-arena"&&Number(global.currentWorldPhase?.()||0)===3)return;
 const main=document.getElementById("main");
 if(!main||main.querySelector("#civilization3dDungeonToggle"))return;
 const phase=view==="dungeon-bounty"?global.getBountyTestSnapshot?.()?.phase:view==="dungeon-arena"?global.getArenaCoreState?.()?.phase:"select";
 if(view==="dungeon-bounty"&&phase!=="ready")return;
 if(view==="dungeon-arena"&&!["select","ready"].includes(phase))return;
 const shell=view==="dungeon"?main.querySelector(".dungeon-page-shell"):view==="dungeon-bounty"?main.querySelector(".dungeon-bounty-shell"):main.querySelector(".arena-shell");
 if(!shell)return;
 const controls=document.createElement("div");controls.className="galaxy-3d-controls";
 const button=document.createElement("button");button.id="civilization3dDungeonToggle";button.type="button";button.className="btn";
 const label=view==="dungeon"?"預覽 3D 副本作戰中心":view==="dungeon-bounty"?"預覽 3D 懸賞戰準備區":"預覽 3D 競技場";
 button.textContent=label;button.dataset.previewLabel=label;button.setAttribute("aria-pressed","false");
 button.addEventListener("click",()=>toggle(view));
 const hint=document.createElement("span");hint.className="muted";hint.textContent="僅供立體觀看；次數、獎勵、鎖定及正式挑戰仍由原頁決定。";
 controls.append(button,hint);shell.prepend(controls);
}
function ensureAdvancedDungeonControl(view){
 if(!["dungeon-arena","dungeon-mirror","dungeon-void-mirage"].includes(view))return;
 if(view==="dungeon-arena"&&Number(global.currentWorldPhase?.()||0)!==3)return;
 const main=document.getElementById("main");
 if(!main||main.querySelector("#civilization3dAdvancedToggle"))return;
 const arena=global.getArenaCoreState?.();
 if(view==="dungeon-arena"&&arena?.phase!=="select")return;
 if(view==="dungeon-void-mirage"&&main.querySelector(".void-combat"))return;
 const shell=view==="dungeon-arena"?main.querySelector(".w3-arena-shell"):view==="dungeon-mirror"?main.querySelector(".mirror-page"):main.querySelector(".void-shell");
 if(!shell)return;
 const label=view==="dungeon-arena"?"預覽 3D 高維競技場":view==="dungeon-mirror"?"預覽 3D 鏡像紀錄":"預覽 3D 虛空樓層";
 const controls=document.createElement("div");controls.className="galaxy-3d-controls";
 const button=document.createElement("button");button.className="btn";button.type="button";button.id="civilization3dAdvancedToggle";
 button.dataset.previewLabel=label;button.textContent=label;button.setAttribute("aria-pressed","false");button.addEventListener("click",()=>toggle(view));
 const hint=document.createElement("span");hint.className="muted";hint.textContent="立體展示只讀取目前副本狀態，不修改正式挑戰或獎勵。";
 controls.append(button,hint);shell.prepend(controls);
}
function onRendered(view){
 if(enabled&&["dungeon","dungeon-bounty","dungeon-arena","dungeon-mirror","dungeon-void-mirage"].includes(view)&&view===activeRoute)hide();
 if(view!==activeRoute&&(enabled||runtime))hide();
 if(view==="adventure"&&enabled){
  const world=Number(global.currentWorldPhase?.()||1),era=global.getAdventureEraView?.()||"";
  if(era!==activeEra||!((world===1&&era==="galaxy")||([2,3].includes(world)&&era==="galaxy-review")||(world===2&&era==="universe")||(world===3&&era==="universe-review")||(world===3&&era==="higher-dimensional")))hide();
 }
 ensureGalaxyMainlineControl(view);
 ensureGalaxyReviewControl(view);
 ensureUniverseControl(view);
 ensureHigherControl(view);
 ensureCharacterControl(view);
 ensureInventoryControl(view);
 ensureForgeControl(view);
 ensureGrowthControl(view);
 ensureGrowthPageControls(view);
 ensureDungeonControl(view);
 ensureAdvancedDungeonControl(view);
 syncButton();
}
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
global.CIVILIZATION_3D_HOME_BRIDGE_VERSION=1;
})(window);
