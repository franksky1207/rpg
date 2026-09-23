(function(){
 const VERSION=1;
 function universe(){return typeof window.isSecondWorldEntered==="function"&&window.isSecondWorldEntered()===true;}
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
 function apply(){applyHomeSemantics();}
 const base=typeof window.render==="function"?window.render:null;
 if(base){
  window.render=function(...args){const result=base.apply(this,args);apply();return result;};
 }
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",apply,{once:true});else apply();
 window.PLAYER_SEMANTICS_UI_VERSION=VERSION;
})();