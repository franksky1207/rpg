(function(){
 const VERSION=16;
 const baseCharacterWorldSnapshot=typeof window.characterWorldSnapshot==="function"?window.characterWorldSnapshot:null;
 const baseAdventurePage=typeof window.adventurePage==="function"?window.adventurePage:null;
 function phase(target=null){
  const s=target&&typeof target==="object"?target:(typeof state!=="undefined"?state:null);
  if(typeof window.currentWorldPhase==="function"){
   try{
    const current=Number(window.currentWorldPhase(s));
    if(Number.isInteger(current)&&current>=1&&current<=3)return current;
   }catch(e){}
  }
  if(s?.thirdWorld?.entered===true)return 3;
  if(s?.secondWorld?.entered===true)return 2;
  return 1;
 }
 function worldLabelForPhase(current){
  const meta=typeof window.worldPhaseMeta==="function"?window.worldPhaseMeta(current):window.WORLD_PHASE_METADATA?.[current];
  if(meta?.name)return String(meta.name);
  return current===3?"高維紀元":current===2?"宇宙紀元":"銀河紀元";
 }
 function playerBreakthroughLevel(target=null){
  const s=target&&typeof target==="object"?target:(typeof state!=="undefined"?state:null);
  if(typeof window.breakthroughLevel==="function")return Math.max(0,Math.floor(Number(window.breakthroughLevel(s))||0));
  if(typeof window.permanentBreakthroughLevel==="function")return Math.max(0,Math.floor(Number(window.permanentBreakthroughLevel(s))||0));
  return Math.max(0,Math.floor(Number(s?.reincarnation?.breakthrough?.permanent)||0));
 }
 function percentText(value){const n=Number(value);if(!Number.isFinite(n))return "0";return Number.isInteger(n)?String(n):String(Math.round(n*100)/100);}
 function breakthroughDisplay(target=null){
  const s=target&&typeof target==="object"?target:(typeof state!=="undefined"?state:null);
  const level=playerBreakthroughLevel(s);
  const snap=typeof window.breakthroughSnapshot==="function"?window.breakthroughSnapshot(s):null;
  const equipmentBonusPercent=Math.max(0,Number(snap?.equipmentBonusPercent));
  const finalDamageBonusPercent=Math.max(0,Number(snap?.finalDamageAdd)*100);
  return {
   level,
   equipmentBonusPercent:Number.isFinite(equipmentBonusPercent)?equipmentBonusPercent:level*(Number(window.BREAKTHROUGH_EQUIPMENT_PERCENT_PER_LEVEL)||2.5),
   finalDamageBonusPercent:Number.isFinite(finalDamageBonusPercent)?finalDamageBonusPercent:level*(Number(window.BREAKTHROUGH_FINAL_DAMAGE_ADD_PER_LEVEL)||.05)*100
  };
 }
 function characterSnapshot(target=null){
  const s=target&&typeof target==="object"?target:(typeof state!=="undefined"?state:null);
  const base=baseCharacterWorldSnapshot&&s?baseCharacterWorldSnapshot(s):{};
  const current=phase(s);
  const progress=typeof window.levelProgressSnapshot==="function"?window.levelProgressSnapshot(s):null;
  const resource=typeof window.primaryWorldResourceSnapshot==="function"?window.primaryWorldResourceSnapshot(s):current===3?{label:"維度之弦",amount:Math.max(0,Math.floor(Number(s?.thirdWorld?.dimensionalStrings)||0)),secondaryLabel:null,secondaryAmount:0}:current===2?{label:"暗物質",amount:Math.max(0,Math.floor(Number(s?.secondWorld?.darkMatter)||0)),secondaryLabel:"暗能量",secondaryAmount:Math.max(0,Math.floor(Number(s?.secondWorld?.darkEnergy)||0))}:{label:"金幣",amount:Math.max(0,Math.floor(Number(s?.gold)||0)),secondaryLabel:null,secondaryAmount:0};
  const civilizationLevel=current>=2&&typeof window.civilizationLevel==="function"?window.civilizationLevel(s):Math.max(0,Math.floor(Number(base?.civilizationLevel)||0));
  const civilizationMax=Math.max(0,Math.floor(Number(window.CIVILIZATION_LEVEL_MAX)||Number(base?.civilizationMax)||10));
  const civilizationDamageBonusPercent=current>=2&&typeof window.civilizationDamageBonusPercent==="function"?window.civilizationDamageBonusPercent(s):Math.max(0,Number(base?.civilizationDamageBonusPercent)||0);
  const civilizationDamageMultiplier=current>=2&&typeof window.civilizationDamageMultiplier==="function"?window.civilizationDamageMultiplier(s):Math.max(1,Number(base?.civilizationDamageMultiplier)||1);
  const equippedWorlds=typeof EQUIPMENT_TYPES!=="undefined"&&Array.isArray(EQUIPMENT_TYPES)?Object.fromEntries(EQUIPMENT_TYPES.map(type=>{const item=s?.equipment?.[type];return [type,item?(typeof window.sharedEquipmentWorld==="function"?window.sharedEquipmentWorld(item):(Number(item?.world)===3?3:Number(item?.world)===2?2:1)):null];})):base?.equippedWorlds||{};
  const breakthrough=breakthroughDisplay(s);
  const reincarnationCount=Math.max(0,Math.floor(Number(s?.reincarnation?.count)||0));
  return {
   ...base,
   reincarnationCount,
   world:current,
   worldLabel:worldLabelForPhase(current),
   level:Math.max(1,Math.floor(Number(progress?.level??s?.level)||1)),
   cap:Math.max(1,Math.floor(Number(progress?.cap)||Number(window.effectiveLevelCap?.(s))|| (current===3?2000:current===2?1000:500))),
   atCap:progress?.atCap===true,
   exp:Math.max(0,Math.floor(Number(progress?.exp??s?.exp)||0)),
   need:Math.max(0,Math.floor(Number(progress?.need)||0)),
   percent:Math.max(0,Math.min(100,Number(progress?.percent)||0)),
   resourceLabel:String(resource?.label||"資源"),
   resourceAmount:Math.max(0,Math.floor(Number(resource?.amount)||0)),
   resourceSecondaryLabel:resource?.secondaryLabel?String(resource.secondaryLabel):null,
   resourceSecondaryAmount:Math.max(0,Math.floor(Number(resource?.secondaryAmount)||0)),
   dimensionalStrings:Math.max(0,Math.floor(Number(s?.thirdWorld?.dimensionalStrings)||0)),
   coreLevel:Math.max(0,Math.min(Math.max(0,Math.floor(Number(window.THIRD_WORLD_CORE_MAX_LEVEL)||10)),Math.floor(Number(s?.thirdWorld?.coreLevel)||0))),
   coreMax:Math.max(0,Math.floor(Number(window.THIRD_WORLD_CORE_MAX_LEVEL)||10)),
   civilizationLevel,
   civilizationMax,
   civilizationDamageBonusPercent,
   civilizationDamageMultiplier,
   breakthroughLevel:breakthrough.level,
   breakthroughEquipmentBonusPercent:breakthrough.equipmentBonusPercent,
   breakthroughFinalDamageBonusPercent:breakthrough.finalDamageBonusPercent,
   equippedWorlds
  };
 }
 window.characterWorldSnapshot=characterSnapshot;
 function thirdWorldAdventureFallback(){
  if(typeof window.wrapFunctionPage==="function")return window.wrapFunctionPage(`<div class="card"><h2>高維戰線</h2><div class="notice"><b>高維正式玩家介面尚未載入。</b><div class="muted" style="margin-top:6px">高維紀元已由共用玩家 UI 正確接管；十王正式玩家 UI 將由第三紀元介面 owner 提供。</div></div></div>`);
  return `<section class="map-screen"><div class="page-top"><button class="btn back-btn" onclick="go('home')">← 返回主頁</button><h2 class="page-title">高維戰線</h2><span></span></div><div class="notice"><b>高維正式玩家介面尚未載入。</b></div></section>`;
 }
 function phaseAwareAdventurePage(){
  // Galaxy review owns its prepare/combat screens even when the current phase is Higher Dimensional.
  // The epoch tabs select the map view only; they must not replace an active review battle screen.
  if(typeof adventureScreen!=="undefined"&&(adventureScreen==="review-prepare"||adventureScreen==="review-combat")&&baseAdventurePage)return baseAdventurePage();
  if(phase()===3){
   if(typeof window.cancelSecondWorldAdventureProgressFocus==="function")window.cancelSecondWorldAdventureProgressFocus();
   const era=typeof window.getAdventureEraView==="function"?window.getAdventureEraView():"higher-dimensional";
   if((era==="universe-review"||era==="galaxy-review")&&typeof window.secondWorldAdventurePageHtml==="function")return window.secondWorldAdventurePageHtml();
   return typeof window.thirdWorldAdventurePageHtml==="function"?window.thirdWorldAdventurePageHtml():thirdWorldAdventureFallback();
  }
  return baseAdventurePage?baseAdventurePage():`<section class="map-screen"><div class="notice"><b>冒險介面尚未載入。</b></div></section>`;
 }
 if(baseAdventurePage)window.adventurePage=phaseAwareAdventurePage;
 function applyHomeSemantics(){
  if(typeof document==="undefined")return;
  const home=document.querySelector(".home-screen");
  if(!home)return;
  const current=phase();
  const subtitle=home.querySelector(".home-title .muted");
  if(subtitle){
   subtitle.textContent=current===3?"跨入高維紀元，向更高層次的文明戰線推進。":current===2?"挑戰宇宙主線、持續成長與換裝，向更高階戰區推進。":"打怪、升級、換裝，逐步推進銀河紀元主線。";
  }
  home.querySelectorAll(".menu-card").forEach(card=>{
   const title=card.querySelector("b")?.textContent?.trim();
   const desc=card.querySelector("span");
   if(!desc)return;
   if(title==="冒險")desc.textContent=current===3?"進入高維戰線，攻略十名高維存在":current===2?"進入宇宙主線並挑戰 Boss":"選擇地圖並挑戰怪物";
   if(title==="背包"&&current===3)desc.textContent="整理、裝備與處理裝備";
   if(title==="強化"&&current===3)desc.textContent="查看已完成的 +40 裝備欄位強化";
   if(title==="專精"&&current===3)desc.textContent="查看已完成並持續生效的 Lv.60 專精";
   if(title==="副本")desc.textContent=current===3?"競技場、虛空幻境與鏡像戰":"挑戰懸賞、競技場、虛空幻境與鏡像戰";
   if(title==="文明災厄"){
    if(current===3){const heading=card.querySelector("b");if(heading)heading.textContent="災厄回顧";desc.textContent="回顧銀河紀元與宇宙紀元文明災厄";}
    else desc.textContent=current===2?"討伐宇宙文明級威脅並提升文明等級":"討伐文明級威脅並培養永久印記";
   }
   if(title==="設定"&&current===3)desc.textContent="裝備自動處理、存檔與遊戲設定";
  });
 }
 function statByLabel(grid,label){return Array.from(grid?.querySelectorAll(".stat")||[]).find(row=>String(row.childNodes?.[0]?.textContent||row.textContent||"").trim().startsWith(label))||null;}
 function ensureCharacterStat(grid,label,value){
  if(!grid)return null;
  let row=statByLabel(grid,label);
  if(!row){row=document.createElement("div");row.className="stat";grid.appendChild(row);}
  row.innerHTML=`${label}<b>${value}</b>`;
  return row;
 }
 function applyCharacterSemantics(){
  if(typeof document==="undefined")return false;
  const card=document.querySelector(".character-stats-card");
  if(!card)return false;
  const snap=characterSnapshot();
  const notice=card.querySelector(".notice");
  const title=notice?.querySelector("b"),copy=notice?.querySelector(".muted");
  if(title)title.textContent=snap.worldLabel;
  if(copy)copy.textContent=`目前角色等級上限 Lv.${snap.cap}`;
  const grid=card.querySelector(".character-stats-grid");
  ensureCharacterStat(grid,"轉生次數",snap.reincarnationCount>0?`${snap.reincarnationCount} 次`:"尚未轉生");
  ensureCharacterStat(grid,"突破等級",`Lv.${snap.breakthroughLevel}`);
  ensureCharacterStat(grid,"突破裝備加成",`+${percentText(snap.breakthroughEquipmentBonusPercent)}%`);
  ensureCharacterStat(grid,"突破最終傷害",`+${percentText(snap.breakthroughFinalDamageBonusPercent)}%`);
  if(grid){
   let note=card.querySelector('[data-character-breakthrough-note="1"]');
   if(!note){note=document.createElement("div");note.dataset.characterBreakthroughNote="1";note.className="muted";note.style.marginTop="8px";grid.insertAdjacentElement("afterend",note);}
   note.textContent="突破每級：裝備原始 HP／攻擊／防禦 +2.5%，最終傷害 +5%。";
  }
  if(snap.world===3&&grid){
   const resource=Array.from(grid.querySelectorAll(".stat")).find(row=>/^(金幣|暗物質|暗能量|維度之弦)/.test(String(row.textContent||"").trim()));
   if(resource)resource.innerHTML=`${snap.resourceLabel}<b>${snap.resourceAmount.toLocaleString()}</b>`;
   ensureCharacterStat(grid,"界弦核心",`Lv.${snap.coreLevel} / ${snap.coreMax}`);
  }
  return true;
 }
 function applySettingsSemantics(){
  if(typeof document==="undefined"||phase()!==3)return false;
  const row=document.querySelector(".combat-speed-setting");
  if(!row)return false;
  const copy=row.querySelector(".muted");
  if(copy)copy.textContent="高維紀元沿用已解鎖的 1.5× 戰鬥速度；可隨時切回標準速度。";
  return true;
 }
 function applyThirdWorldUniverseReviewSemantics(){
  if(typeof document==="undefined"||phase()!==3||window.getAdventureEraView?.()!=="universe-review")return false;
  return !!document.querySelector(".universe-review-adventure-screen");
 }
 function apply(){
  applyHomeSemantics();
  applyCharacterSemantics();
  applySettingsSemantics();
  if(phase()===2&&typeof window.applySecondWorldAdventureProgressFocus==="function")window.applySecondWorldAdventureProgressFocus();
  if(phase()===3)applyThirdWorldUniverseReviewSemantics();
 }
 const base=typeof window.render==="function"?window.render:null;
 if(base){
  window.render=function(...args){const result=base.apply(this,args);apply();return result;};
 }
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",apply,{once:true});else apply();
 window.PLAYER_SEMANTICS_UI_VERSION=VERSION;
 window.PLAYER_SEMANTICS_WORLD_PHASE_VERSION=3;
 window.PLAYER_ADVENTURE_WORLD_PHASE_ROUTING_VERSION=2;
 window.PLAYER_ADVENTURE_ERA_VIEW_ROUTING_VERSION=1;
 window.CHARACTER_WORLD_PHASE_SEMANTICS_VERSION=4;
 window.CHARACTER_WORLD_SNAPSHOT_CANONICAL_PHASE_VERSION=1;
 window.CHARACTER_WORLD_SNAPSHOT_OWNER="playersemanticsui";
 window.CHARACTER_EQUIPMENT_WORLD_SEMANTICS_VERSION=1;
 window.CHARACTER_BREAKTHROUGH_UI_VERSION=3;
 window.THIRD_WORLD_COMPLETED_SYSTEM_UI_VERSION=3;
 window.SECOND_WORLD_CONTEXTUAL_INVENTORY_BUTTON_VERSION=1;
 window.THIRD_WORLD_UNIVERSE_REVIEW_SEMANTICS_VERSION=2;
 window.applyCharacterWorldPhaseSemantics=applyCharacterSemantics;
 window.applyThirdWorldCompletedSystemSemantics=function(){applySettingsSemantics();};
 window.applyThirdWorldUniverseReviewSemantics=applyThirdWorldUniverseReviewSemantics;
})();