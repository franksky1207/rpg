(function(){
 const VERSION=2;
 function universe(){return typeof window.isSecondWorldEntered==="function"&&window.isSecondWorldEntered()===true;}
 function installStyles(){
  if(typeof document==="undefined"||document.getElementById("playerSemanticsUiStyles"))return;
  const style=document.createElement("style");
  style.id="playerSemanticsUiStyles";
  style.textContent=`
   .universe-adventure-top{display:grid!important;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);align-items:center;gap:10px}
   .universe-adventure-top>.back-btn{justify-self:start}
   .universe-adventure-top>.page-title{justify-self:center;text-align:center}
   .universe-adventure-top>.universe-adventure-inventory{justify-self:end}
   @media(max-width:760px){.universe-adventure-top{gap:7px}.universe-adventure-top>.universe-adventure-inventory{padding:9px 12px}}
  `;
  document.head.appendChild(style);
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
  screen.querySelectorAll(".universe-boss-actions .universe-boss-action").forEach(button=>{
   if(button.textContent?.trim()==="背包")button.remove();
  });
  const top=screen.querySelector(":scope > .page-top");
  if(!top)return;
  top.classList.add("universe-adventure-top");
  let inventory=top.querySelector(".universe-adventure-inventory");
  if(!inventory){
   inventory=document.createElement("button");
   inventory.type="button";
   inventory.className="btn universe-adventure-inventory";
   inventory.textContent="背包";
   inventory.setAttribute("aria-label","開啟背包");
   inventory.addEventListener("click",()=>{if(typeof window.openAdventureInventory==="function")window.openAdventureInventory();});
   const placeholder=top.lastElementChild;
   if(placeholder?.tagName==="SPAN")placeholder.replaceWith(inventory);else top.appendChild(inventory);
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
 window.SECOND_WORLD_SHARED_INVENTORY_BUTTON_VERSION=1;
})();