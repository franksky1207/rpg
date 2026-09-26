(function(){
 const VERSION=6;
 const baseCharacterWorldSnapshot=typeof window.characterWorldSnapshot==="function"?window.characterWorldSnapshot:null;
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
 function characterSnapshot(target=null){
  const s=target&&typeof target==="object"?target:(typeof state!=="undefined"?state:null);
  const base=baseCharacterWorldSnapshot&&s?baseCharacterWorldSnapshot(s):{};
  const current=phase(s);
  const progress=typeof window.levelProgressSnapshot==="function"?window.levelProgressSnapshot(s):null;
  const resource=typeof window.primaryWorldResourceSnapshot==="function"?window.primaryWorldResourceSnapshot(s):current===3?{label:"維度之弦",amount:Math.max(0,Math.floor(Number(s?.thirdWorld?.dimensionalStrings)||0)),secondaryLabel:null,secondaryAmount:0}:current===2?{label:"暗物質",amount:Math.max(0,Math.floor(Number(s?.secondWorld?.darkMatter)||0)),secondaryLabel:"暗能量",secondaryAmount:Math.max(0,Math.floor(Number(s?.secondWorld?.darkEnergy)||0))}:{label:"金幣",amount:Math.max(0,Math.floor(Number(s?.gold)||0)),secondaryLabel:null,secondaryAmount:0};
  return {
   ...base,
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
   dimensionalStrings:Math.max(0,Math.floor(Number(s?.thirdWorld?.dimensionalStrings)||0))
  };
 }
 if(baseCharacterWorldSnapshot)window.characterWorldSnapshot=characterSnapshot;
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
   if(title==="副本"&&desc)desc.textContent=current===3?"競技場、虛空幻境與鏡像戰保留；懸賞戰已關閉":"挑戰懸賞、競技場、虛空幻境與鏡像戰";
  });
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
  if(snap.world===3){
   const stat=Array.from(card.querySelectorAll(".character-stats-grid .stat")).find(row=>/^(金幣|暗物質|維度之弦)/.test(String(row.textContent||"").trim()));
   if(stat)stat.innerHTML=`${snap.resourceLabel}<b>${snap.resourceAmount.toLocaleString()}</b>`;
  }
  return true;
 }
 function applyThirdWorldUniverseReviewSemantics(){
  if(typeof document==="undefined"||phase()!==3)return false;
  const screen=document.querySelector(".universe-adventure-screen:not(.galaxy-review-adventure-screen)");
  if(!screen)return false;
  const notice=screen.querySelector(".universe-adventure-notice");
  const title=notice?.querySelector("b"),copy=notice?.querySelector(".muted");
  if(title)title.textContent="宇宙紀元・回顧";
  if(copy)copy.textContent="宇宙紀元主線已完成並轉為歷史回顧；此頁不再產生正式成長進度。";
  screen.querySelectorAll(".universe-boss-action").forEach(button=>{
   if(button.dataset.universeContextualInventory==="1"||button.textContent.trim()==="背包")return;
   button.disabled=true;
   button.onclick=null;
   button.removeAttribute("onclick");
   button.textContent="正式挑戰已結束";
  });
  return true;
 }
 function apply(){
  applyHomeSemantics();
  applyCharacterSemantics();
  if(phase()===2&&typeof window.applySecondWorldAdventureProgressFocus==="function")window.applySecondWorldAdventureProgressFocus();
  if(phase()===3)applyThirdWorldUniverseReviewSemantics();
 }
 const base=typeof window.render==="function"?window.render:null;
 if(base){
  window.render=function(...args){const result=base.apply(this,args);apply();return result;};
 }
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",apply,{once:true});else apply();
 window.PLAYER_SEMANTICS_UI_VERSION=VERSION;
 window.PLAYER_SEMANTICS_WORLD_PHASE_VERSION=1;
 window.CHARACTER_WORLD_PHASE_SEMANTICS_VERSION=1;
 window.SECOND_WORLD_CONTEXTUAL_INVENTORY_BUTTON_VERSION=1;
 window.THIRD_WORLD_UNIVERSE_REVIEW_SEMANTICS_VERSION=1;
 window.applyCharacterWorldPhaseSemantics=applyCharacterSemantics;
 window.applyThirdWorldUniverseReviewSemantics=applyThirdWorldUniverseReviewSemantics;
})();