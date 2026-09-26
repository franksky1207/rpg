(function(){
 const VERSION=6;
 function phase(){return typeof window.currentWorldPhase==="function"?window.currentWorldPhase():1;}
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
   if(title==="副本"&&desc)desc.textContent="挑戰懸賞、競技場、虛空幻境與鏡像戰";
  });
 }
 function apply(){
  applyHomeSemantics();
  if(phase()===2&&typeof window.applySecondWorldAdventureProgressFocus==="function")window.applySecondWorldAdventureProgressFocus();
 }
 const base=typeof window.render==="function"?window.render:null;
 if(base){
  window.render=function(...args){const result=base.apply(this,args);apply();return result;};
 }
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",apply,{once:true});else apply();
 window.PLAYER_SEMANTICS_UI_VERSION=VERSION;
 window.PLAYER_SEMANTICS_WORLD_PHASE_VERSION=1;
 window.SECOND_WORLD_CONTEXTUAL_INVENTORY_BUTTON_VERSION=1;
})();
