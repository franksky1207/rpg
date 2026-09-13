(()=>{
 const LAYER_ID="mobileMainBattleBackgroundLayer";
 function cleanup(){
  document.getElementById(LAYER_ID)?.remove();
  const app=document.querySelector(".app");
  if(app){app.style.removeProperty("position");app.style.removeProperty("z-index");}
  document.body?.removeAttribute("data-mobile-main-battle-layer");
 }
 function apply(){
  const mobile=window.matchMedia&&window.matchMedia("(max-width:760px)").matches;
  const screen=document.querySelector("#main .combat-screen");
  if(!mobile||!screen){cleanup();return;}
  const inlineBg=screen.style.getPropertyValue("background-image");
  const fallback='linear-gradient(180deg,rgba(5,10,18,.28) 0%,rgba(5,10,18,.42) 45%,rgba(5,10,18,.58) 100%),url("assets/bg-battle-mobile.webp?v=20260913-battlebg-layer1")';
  let layer=document.getElementById(LAYER_ID);
  if(!layer){
   layer=document.createElement("div");
   layer.id=LAYER_ID;
   Object.assign(layer.style,{position:"fixed",inset:"0",zIndex:"0",pointerEvents:"none",backgroundColor:"#0b0e13",backgroundSize:"cover,cover",backgroundPosition:"center center,center center",backgroundRepeat:"no-repeat,no-repeat"});
   document.body.insertBefore(layer,document.body.firstChild);
  }
  layer.style.backgroundImage=inlineBg&&inlineBg!=="none"?inlineBg:fallback;
  const app=document.querySelector(".app");
  if(app){app.style.setProperty("position","relative");app.style.setProperty("z-index","1");}
  screen.style.setProperty("background","transparent","important");
  screen.style.setProperty("background-color","transparent","important");
  screen.style.setProperty("background-image","none","important");
  document.body.setAttribute("data-mobile-main-battle-layer","applied");
 }
 function schedule(){requestAnimationFrame(()=>setTimeout(apply,0));}
 const main=document.getElementById("main");
 if(main)new MutationObserver(schedule).observe(main,{childList:true,subtree:true});
 window.addEventListener("resize",schedule,{passive:true});
 schedule();
})();
