/* 3D Batch 03: opt-in home command bridge, no state or save writes. */
(function(global){
"use strict";
let runtime=null,loading=null,enabled=false,epoch=0;
let activeControl=null,activeHost=null;
const PREVIEW_CONTROL_IDS=["civilization3dHomeToggle","civilization3dGalaxyToggle","civilization3dUniverseToggle","civilization3dHigherToggle","civilization3dCharacterToggle","civilization3dInventoryToggle","civilization3dForgeToggle","civilization3dGrowthToggle","civilization3dGrowthPageToggle","civilization3dDungeonToggle","civilization3dAdvancedToggle","civilization3dFrontierToggle","civilization3dBattleToggle"];
function uniqueControls(root=document.getElementById("main")){
 if(!root)return;
 const seen=new Set();
 root.querySelectorAll(".galaxy-3d-controls").forEach(control=>{
  const button=control.querySelector("button");
  if(!button)return;
  const token=button.id||button.dataset.chroniclePreview||control.dataset.service3dPreview||control.dataset.service3DPreview;
  if(!token)return;
  if(seen.has(token)){control.remove();return;}
  seen.add(token);
 });
}
function previewButtons(){
 const main=document.getElementById("main");
 return main?Array.from(main.querySelectorAll("button")).filter(b=>PREVIEW_CONTROL_IDS.includes(b.id)||b.dataset.chroniclePreview||b.closest("[data-service3d-preview],[data-service-3d-preview]")):[];
}
function syncAllPreviewButtons(){
 for(const button of previewButtons()){
  if(!button.dataset.previewLabel)button.dataset.previewLabel=button.textContent==="關閉 3D 預覽"?"預覽 3D":button.textContent;
  const selected=enabled&&button===activeControl;
  button.textContent=selected?"關閉 3D 預覽":button.dataset.previewLabel;
  button.setAttribute("aria-pressed",String(selected));
 }
}
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
function syncButton(){syncAllPreviewButtons();}
function script(src){
 return new Promise((resolve,reject)=>{
  const el=document.createElement("script");
  el.src=src;
  el.onload=()=>{el.onload=null;el.onerror=null;resolve();};
  el.onerror=()=>{el.onload=null;el.onerror=null;el.remove();reject(new Error("3D 模組載入失敗："+src));};
  document.head.appendChild(el);
 });
}
const BABYLON_SRC="vendor/babylonjs/7.54.3/babylon.js";
const SCENE_SRC="3d-test/prototype-engine.js?v=20261011-b28c-ruins-v1";
const RUNTIME_SRC="3d-test/runtime.js?v=20261011-b27-player-v1";
const APPEARANCE_SRC="3d-test/appearance-snapshot.js?v=20261011-b28c-ruins-v1";
let resourceVersionPromise=null;
function resolveSceneResources(){
 if(!resourceVersionPromise)resourceVersionPromise=fetch("resource-manifest.json",{cache:"no-store",credentials:"same-origin"})
  .then(response=>{if(!response.ok)throw new Error("manifest-unavailable");return response.json();})
  .then(manifest=>{
   if(manifest?.schema!==1||typeof manifest.files!=="object")throw new Error("invalid-resource-manifest");
   const version=(path,fallback)=>{
    const hash=manifest.files[path];
    return typeof hash==="string"&&/^[0-9a-f]{24}$/.test(hash)?path+"?asset="+hash:fallback;
   };
   return [
    version(BABYLON_SRC,BABYLON_SRC),
    version("3d-test/prototype-engine.js",SCENE_SRC),
    version("3d-test/runtime.js",RUNTIME_SRC),
    version("3d-test/appearance-snapshot.js",APPEARANCE_SRC)
   ];
  }).catch(()=>[BABYLON_SRC,SCENE_SRC,RUNTIME_SRC,APPEARANCE_SRC]);
 return resourceVersionPromise;
}
async function load(){
 if(global.BABYLON?.Engine&&global.Civilization3DPrototype?.createServiceConsoleScene&&global.Civilization3DRuntime?.create&&global.Civilization3DAppearance?.capture)return;
 if(!loading)loading=resolveSceneResources().then(async ([engineUrl,sceneUrl,runtimeUrl,appearanceUrl])=>{
   // Runtime and appearance are needed only after clicking a preview, never for text startup.
   await Promise.all([
     global.Civilization3DRuntime?.create?Promise.resolve():script(runtimeUrl),
     global.Civilization3DAppearance?.capture?Promise.resolve():script(appearanceUrl),
     global.BABYLON?.Engine?Promise.resolve():script(engineUrl),
     global.Civilization3DPrototype?.createServiceConsoleScene?Promise.resolve():script(sceneUrl)
   ]);
   if(!global.BABYLON?.Engine||!global.Civilization3DPrototype?.createServiceConsoleScene||!global.Civilization3DRuntime?.create||!global.Civilization3DAppearance?.capture)throw new Error("3d-modules-unavailable");
 }).catch(error=>{loading=null;resourceVersionPromise=null;throw error;});
 return loading;
}
/* Preload network bytes only; neither WebGL nor GPU resources are created. */
let sharedWarmPromise=null;
function warmShared3dAssets(){
 if(!sharedWarmPromise)sharedWarmPromise=resolveSceneResources().then(async allSources=>{
  // GM pre-warm only shared Babylon/scene bytes; runtime and appearance remain on demand.
  const sources=allSources.slice(0,2);
  await Promise.all(sources.map(async src=>{
   const response=await fetch(src,{cache:"no-cache",credentials:"same-origin"});
   if(!response.ok)throw new Error("3d-cache-warm-failed");
   await response.arrayBuffer();
  }));
  return sources;
 }).catch(error=>{sharedWarmPromise=null;throw error;});
 return sharedWarmPromise;
}
global.Civilization3DSharedAssetWarm=warmShared3dAssets;
function schedule3dPrefetch(){
 const run=async()=>{
  const sources=await resolveSceneResources();
  for(const src of sources){
   if(document.querySelector('link[data-civilization-3d-prefetch="'+src+'"]'))continue;
   const link=document.createElement("link");
   link.rel="prefetch";link.as="script";link.href=src;link.dataset.civilization3dPrefetch=src;
   document.head.appendChild(link);
  }
 };
 // Begin before window.load: waiting for all images delays the current 3D preview unnecessarily.
 const schedule=()=>setTimeout(()=>run().catch(()=>{}),150);
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",schedule,{once:true});else schedule();
}
if(global.CivilizationPresentationMode?.shouldWarm3DAtStartup?.()===true)schedule3dPrefetch();
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
 const ticket=++epoch;enabled=true;h.hidden=false;h.setAttribute("aria-hidden","false");h.dataset.threeDFormalMount="loading";syncButton();
 try{
  await load();
  if(ticket!==epoch||!enabled||!h.isConnected){if(ticket===epoch)hide();return;}
  if(runtime){runtime.dispose();runtime=null;}
  runtime=global.Civilization3DRuntime.create({host:h,onFallback:()=>hide(),onClose:()=>hide(),onContextRestored:()=>{if(enabled)hide();}});
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
  const data=global.Civilization3DFormalSnapshots;
  if(!data)throw new Error("正式唯讀快照模組尚未載入");
  const galaxySnapshot=galaxy?data.galaxy({review:era==="galaxy-review",mapIndex:era==="galaxy-review"?global.getGalaxyReviewSelectedMap?.():(typeof selectedMap==="number"?selectedMap:0)}):{};
  const universeSnapshot=universe?data.universe({review:era==="universe-review"}):{};
  const higherSnapshot=higher?data.higher():{};
  const appearance=character||inventory||forge?data.appearance():null;
  const growthState=growth?data.growth(activeGrowthKind||"specialization"):{};
  const dungeonSnapshot=dungeon?data.dungeon(activeRoute==="dungeon-arena"?"arena":activeRoute==="dungeon-bounty"?"bounty":"hub"):{};
  // Keep current DOM presentation filtering here; controller/DOM separation is T1-B.
  if(activeRoute==="dungeon"&&dungeonSnapshot.status!=="unavailable"){
    dungeonSnapshot.dungeonVisibleModes=dungeonSnapshot.dungeonVisibleModes.filter(key=>{
      const card=document.querySelector("#main .dungeon-mode-"+key);
      return !!card&&!card.hidden&&card.dataset.dungeonPolicyHidden!=="1"&&getComputedStyle(card).display!=="none";
    });
    dungeonSnapshot.dungeonAvailableModes=["bounty","arena","tower","mirror"].map(key=>dungeonSnapshot.dungeonVisibleModes.includes(key)&&!!document.querySelector("#main .dungeon-mode-"+key+" .dungeon-entry-btn:not(:disabled)"));
    dungeonSnapshot.dungeonRemaining=dungeonSnapshot.dungeonAvailableModes.filter(Boolean).length;
  }
  const advancedSnapshot=advanced?data.dungeon(activeRoute==="dungeon-arena"?"arena":activeRoute==="dungeon-mirror"?"mirror":"void"):{};
  const frontierSnapshot=frontier?(activeRoute==="alternateuniverse"?data.alternate():data.calamity(world>=2&&!!document.querySelector("#main .universe-civilization-summary")?2:1,{review:world>(document.querySelector("#main .universe-civilization-summary")?2:1)})):{};
  const battleSnapshot=battlePreview?data.battle():{};
  const snapshot=servicePreview?{kind:activeGrowthKind.slice(8),visualOnly:true}:chroniclePreview?{kind:activeGrowthKind==="chronicle-reincarnation"?"reincarnation":activeGrowthKind==="chronicle-story"?"story":"record",visualOnly:true}:battlePreview?battleSnapshot:frontier?frontierSnapshot:advanced?advancedSnapshot:dungeon?dungeonSnapshot:growth?growthState:forge||inventory||character?global.Civilization3DAppearance?.scene(forge?"forge":inventory?"equipment":"character",appearance)||{}:higher?higherSnapshot:galaxy?galaxySnapshot:universeSnapshot;
  if(snapshot.status==="unavailable"||battlePreview&&battleSnapshot.battleAvailable!==true){hide();return;}
  const result=await runtime.show("preview-"+activeRoute+"-era-"+world,args=>create({...args,world,...snapshot}));
  if(ticket!==epoch||!enabled||!h.isConnected){if(ticket===epoch)hide();return;}
  if(!result.ok){hide();return;}
  h.dataset.threeDFormalMount="active";
  const model=runtime.getSnapshot().character;
  if(model?.assetKind==='geometry-fallback'){
   const notice=document.createElement('p');notice.className='muted';notice.dataset.characterFallbackNotice='1';notice.setAttribute('role','status');notice.textContent='人物資源暫時無法使用，正在顯示替代外觀。';h.appendChild(notice);
  }
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
 if(!screen||document.getElementById("civilization3dCharacterToggle"))return;
 const controls=document.createElement("div");controls.className="galaxy-3d-controls";
 const button=document.createElement("button");button.id="civilization3dCharacterToggle";button.className="btn";button.type="button";
 button.setAttribute("aria-pressed","false");button.textContent="預覽 3D 角色";
 button.addEventListener("click",()=>toggle("character"));
 const hint=document.createElement("span");hint.className="muted";hint.textContent="人物基座預覽；裝備造型仍在製作，能力與穿戴以正式頁面為準。";
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
function ensureFrontierControl(view){
 if(!["calamity","alternateuniverse"].includes(view))return;
 const main=document.getElementById("main");if(!main||main.querySelector("#civilization3dFrontierToggle"))return;
 const shell=view==="calamity"?main.querySelector(".calamity-shell.calamity-home"):main.querySelector(".alternate-universe-page");
 if(!shell||main.querySelector(".combat-screen"))return;
 const controls=document.createElement("div");controls.className="galaxy-3d-controls";
 const button=document.createElement("button");button.id="civilization3dFrontierToggle";button.className="btn";button.type="button";
 const label=view==="calamity"?"預覽 3D 文明災厄封印":"預覽 3D 異宇宙前線";
 button.dataset.previewLabel=label;button.textContent=label;button.setAttribute("aria-pressed","false");
 button.addEventListener("click",()=>toggle(view));
 const hint=document.createElement("span");hint.className="muted";hint.textContent="立體預覽僅反映既有進度，不更動挑戰門檻、血量或獎勵。";
 if(view==="alternateuniverse"){
  const progress=global.Civilization3DFormalSnapshots?.alternate()||{};
  const deepest=progress.historicalCompletedDepth||0;
  const universe=progress.alternateUniverse,depth=progress.alternateDepth;
  const info=document.createElement("span");info.className="muted civilization-3d-alternate-progress";
  const details=global.alternateUniverseUniverseInfo?.(universe),members=(global.ALTERNATE_UNIVERSE_NAME_CULTURES||[]).map((c,i)=>c===details?.culture?i+1:0).filter(Boolean);
  const tier=members.indexOf(universe)+1;
  info.textContent=progress.status==="available"?`${details?.culture||"異宇宙"} · ${details?.name||"U"+String(universe).padStart(3,"0")} · 體系內第 ${Math.max(1,tier)}/10 階 · ${global.ALTERNATE_UNIVERSE_DEPTH_LABELS?.[depth-1]||"深度 "+depth} · 已通過 ${deepest}/1000 層（僅預覽）`:"尚無可用的正式異宇宙挑戰焦點。";
  controls.append(button,info);
 }else controls.append(button,hint);
 shell.prepend(controls);
}
function ensureBattlePreviewControl(view){
 // Void has its own floor preview; GM retains the universal battle/settlement preview.
 if(view==="dungeon-void-mirage")return;
 const main=document.getElementById("main");if(!main||main.querySelector("#civilization3dBattleToggle"))return;
 const combat=main.querySelector(".combat-screen,.calamity-battle-shell,.void-combat");
 const result=main.querySelector(".arena-result-panel,.dungeon-bounty-result-card,.calamity-result-shell,.void-result,.alternate-universe-result");
 const encounter=main.querySelector(".special-encounter,.special-encounter-panel");
 const anchor=combat||result||encounter;
 if(!anchor)return;
 const controls=document.createElement("div");controls.className="galaxy-3d-controls";
 const button=document.createElement("button");button.id="civilization3dBattleToggle";button.className="btn";button.type="button";
 button.dataset.previewLabel="預覽 3D 戰鬥與結算";button.textContent=button.dataset.previewLabel;button.setAttribute("aria-pressed","false");
 button.addEventListener("click",()=>toggle(view,"battle-preview"));
 const hint=document.createElement("span");hint.className="muted";hint.textContent="此為獨立立體外觀預覽；正式戰鬥、護盾與結算仍由原介面執行。";
 controls.append(button,hint);anchor.before(controls);
}
function ensureChronicleControls(view){
  const main=document.getElementById("main");
  if(!main)return;
  const record=main.querySelector(".story-record-page");
  const reincarnation=main.querySelector('[data-major-transition="reincarnation"]');
  const target=record||reincarnation;
  if(!target||target.querySelector("[data-chronicle-preview]"))return;
  const kind=record?"chronicle-record":"chronicle-reincarnation";
  const button=document.createElement("button");
  button.type="button";button.className="btn";button.dataset.chroniclePreview=kind;
  button.textContent=record?"預覽 3D 文明紀錄":"預覽 3D 文明轉生";
  button.setAttribute("aria-pressed","false");
  button.addEventListener("click",()=>toggle(view,kind));
  const container=document.createElement("div");
  container.className="galaxy-3d-controls";container.appendChild(button);
  target.insertBefore(container,target.firstChild);
}
function ensureServiceControl(view){
 if(view!=="settings"&&view!=="guide")return;
 const main=document.getElementById("main");
 if(!main)return;
 const page=main.querySelector(".function-page");if(!page)return;
 const rows=view==="settings"?[
  ["settings",page.querySelector("#settingsTitle")?.closest(".card")],
  ["account",main.querySelector("#civilizationAccountSettings")],
  ["cloud",main.querySelector("#civilizationCloudSaveSettings")],
  ["gm",main.querySelector("#gmStartupSlot")]
 ]:[["guide",page]];
 for(const [kind,target] of rows){
  if(!target)continue;
  // v17 used data-service3d-preview but looked for data-service-3d-preview.
  // Deduplicate pre-existing DOM nodes as well as all future updates.
  const existing=Array.from(target.querySelectorAll('[data-service3d-preview="'+kind+'"],[data-service-3d-preview="'+kind+'"]'));
  if(existing.length){
   existing.slice(1).forEach(node=>node.remove());
   continue;
  }
  if(kind==="gm"&&(typeof global.gmRuntimeAuthorizationAuthorized!=="function"||global.gmRuntimeAuthorizationAuthorized()!==true))continue;
  const control=document.createElement("div");control.className="galaxy-3d-controls";control.setAttribute("data-service3d-preview",kind);
  const button=document.createElement("button");button.type="button";button.className="btn";button.textContent="預覽 3D "+({settings:"設定中心",guide:"遊戲說明",account:"帳號中心",cloud:"雲端存檔中心",gm:"GM 管理中心"}[kind]);
  button.addEventListener("click",()=>toggle(view,"service-"+kind));
  const hint=document.createElement("span");hint.className="muted";hint.textContent="僅供視覺預覽，全部操作仍由原本介面執行。";
  control.append(button,hint);target.prepend(control);
 }
}
function onRendered(view){
 if(enabled&&(activeGrowthKind==="battle-preview"||["dungeon","dungeon-bounty","dungeon-arena","dungeon-mirror","dungeon-void-mirage","calamity","alternateuniverse"].includes(view))&&view===activeRoute)hide();
 if((view!==activeRoute||activeHost&&!activeHost.isConnected||activeControl&&!activeControl.isConnected)&&(enabled||runtime))hide();
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
 ensureFrontierControl(view);
 ensureBattlePreviewControl(view);
 ensureChronicleControls(view);
 ensureServiceControl(view);
 uniqueControls();
 if(view==="settings")queueMicrotask(()=>ensureServiceControl("settings"));
 syncButton();
}
// Account, cloud and authorized GM panels may mount after the first settings render.
global.addEventListener("civilization-auth-ready",()=>queueMicrotask(()=>ensureServiceControl("settings")));
global.addEventListener("civilization-script-group-ready",event=>{
 if(event.detail?.group==="gm")queueMicrotask(()=>ensureServiceControl("settings"));
});
const settingsHost=document.getElementById("main");
if(settingsHost&&typeof MutationObserver==="function"){
 const observer=new MutationObserver(records=>{
  if(!document.getElementById("settingsTitle"))return;
  if(!records.some(record=>Array.from(record.addedNodes).some(node=>node.nodeType===1&&(
   node.id==="civilizationAccountSettings"||node.id==="civilizationCloudSaveSettings"||
   node.id==="gmStartupSlot"||node.querySelector?.("#civilizationAccountSettings,#civilizationCloudSaveSettings,#gmStartupSlot")
  ))))return;
  ensureServiceControl("settings");uniqueControls();syncAllPreviewButtons();
 });
 observer.observe(settingsHost,{childList:true,subtree:true});
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
global.CIVILIZATION_3D_HOME_BRIDGE_VERSION=1;
})(window);
