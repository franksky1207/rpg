/* T1-B: formal DOM controls and route notifications; no asset loading. */
(function(global){
"use strict";
function create({toggle,hide,getState}){
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
 const {enabled,activeControl}=getState();
 for(const button of previewButtons()){
  if(!button.dataset.previewLabel)button.dataset.previewLabel=button.textContent==="關閉 3D 預覽"?"預覽 3D":button.textContent;
  const selected=enabled&&button===activeControl;
  button.textContent=selected?"關閉 3D 預覽":button.dataset.previewLabel;
  button.setAttribute("aria-pressed",String(selected));
 }
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
 const {enabled,runtime,activeGrowthKind,activeRoute,activeHost,activeControl,activeEra}=getState();
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
 syncAllPreviewButtons();
}
// Account, cloud and authorized GM panels may mount after the first settings render.
const authReady=()=>queueMicrotask(()=>ensureServiceControl("settings"));
global.addEventListener("civilization-auth-ready",authReady);
const groupReady=event=>{
 if(event.detail?.group==="gm")queueMicrotask(()=>ensureServiceControl("settings"));
};
global.addEventListener("civilization-script-group-ready",groupReady);
const settingsHost=document.getElementById("main");
let observer=null;
if(settingsHost&&typeof MutationObserver==="function"){
 observer=new MutationObserver(records=>{
  if(!document.getElementById("settingsTitle"))return;
  if(!records.some(record=>Array.from(record.addedNodes).some(node=>node.nodeType===1&&(
   node.id==="civilizationAccountSettings"||node.id==="civilizationCloudSaveSettings"||
   node.id==="gmStartupSlot"||node.querySelector?.("#civilizationAccountSettings,#civilizationCloudSaveSettings,#gmStartupSlot")
  ))))return;
  ensureServiceControl("settings");uniqueControls();syncAllPreviewButtons();
 });
 observer.observe(settingsHost,{childList:true,subtree:true});
}

function filterDungeon(dungeonSnapshot){
    dungeonSnapshot.dungeonVisibleModes=dungeonSnapshot.dungeonVisibleModes.filter(key=>{
      const card=document.querySelector("#main .dungeon-mode-"+key);
      return !!card&&!card.hidden&&card.dataset.dungeonPolicyHidden!=="1"&&getComputedStyle(card).display!=="none";
    });
    dungeonSnapshot.dungeonAvailableModes=["bounty","arena","tower","mirror"].map(key=>dungeonSnapshot.dungeonVisibleModes.includes(key)&&!!document.querySelector("#main .dungeon-mode-"+key+" .dungeon-entry-btn:not(:disabled)"));
    dungeonSnapshot.dungeonRemaining=dungeonSnapshot.dungeonAvailableModes.filter(Boolean).length;
 return dungeonSnapshot;
}
function clearFailure(){document.querySelectorAll("[data-three-d-preview-error-notice]").forEach(node=>node.remove());}
function showFailure(code){
 clearFailure();
 const {activeControl}=getState();
 const target=activeControl?.parentElement;
 if(!target)return;
 const notice=document.createElement("span");notice.className="muted";notice.dataset.threeDPreviewErrorNotice="1";notice.setAttribute("role","status");
 notice.textContent=code==="scene-capability-missing"?"此預覽場景目前無法使用，可重試或選擇其他預覽。":code.startsWith("module-")?"3D 共用模組載入失敗，請重試。":code.includes("webgl")?"3D 顯示暫時無法使用，請重新開啟預覽。":"3D 預覽載入失敗，請重試。";
 target.appendChild(notice);
}
// One observer per controller; BFCache suspends and restores the same owner.
global.addEventListener("pagehide",()=>observer?.disconnect());
global.addEventListener("pageshow",()=>{if(settingsHost)observer?.observe(settingsHost,{childList:true,subtree:true});});
return Object.freeze({onRendered,syncAllPreviewButtons,filterDungeon,showFailure,clearFailure});
}
global.Civilization3DFormalDOM=Object.freeze({version:1,create});
})(window);
