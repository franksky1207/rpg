(function(){
 const VERSION=3;
 function universe(){return typeof window.isSecondWorldEntered==="function"&&window.isSecondWorldEntered()===true;}
 function installStyles(){
  if(typeof document==="undefined")return;
  document.getElementById("playerSemanticsUiStyles")?.remove();
 }
 function applyHomeSemantics(){
  if(typeof document==="undefined")return;
  const home=document.querySelector(".home-screen");
  if(!home)return;
  const subtitle=home.querySelector(".home-title .muted");
  if(subtitle)subtitle.textContent=universe()?"挑戰宇宙主線、持續成長與換裝，向更高階戰區推進。":"打怪、升級、換裝，逐步推進銀河紀元主線。";
  home.querySelectorAll(".menu-card").forEach(card=>{
   const title=card.querySelector("b")?.textContent?.trim();
   const desc=card.querySelector("span");
   if(title==="副本"&&desc)desc.textContent="挑戰懸賞、競技場、虛空幻境與鏡像戰";
  });
 }
 function applyUniverseAdventureSemantics(){
  if(typeof document==="undefined")return;
  const screen=document.querySelector(".universe-adventure-screen");
  if(!screen)return;
  const top=screen.querySelector(":scope > .page-top");
  if(!top)return;
  top.classList.remove("universe-adventure-top");
  const legacyInventory=top.querySelector(".universe-adventure-inventory");
  if(legacyInventory){
   const placeholder=document.createElement("span");
   legacyInventory.replaceWith(placeholder);
  }
 }
 function apply(){installStyles();applyHomeSemantics();applyUniverseAdventureSemantics();}
 const base=typeof window.render==="function"?window.render:null;
 if(base){
  window.render=function(...args){const result=base.apply(this,args);apply();return result;};
 }
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",apply,{once:true});else apply();
 window.PLAYER_SEMANTICS_UI_VERSION=VERSION;
 window.SECOND_WORLD_ADVENTURE_HEADER_POLISH_VERSION=1;
 window.SECOND_WORLD_CONTEXTUAL_INVENTORY_BUTTON_VERSION=1;
})();