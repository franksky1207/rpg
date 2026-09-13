(()=>{
 const baseCompact=typeof window.compactMobileDom==="function"?window.compactMobileDom:null;
 function clearPortal(){document.getElementById("prepareMobileControlsPortal")?.remove();}
 function portalPrepareControls(){
  clearPortal();
  const mobile=window.matchMedia&&window.matchMedia("(max-width:760px)").matches;
  if(!mobile)return;
  const panel=document.querySelector("#main .prepare-screen .battle-count-panel");
  const actions=document.querySelector("#main .prepare-screen .prepare-actions");
  if(!panel||!actions)return;
  const portal=document.createElement("div");
  portal.id="prepareMobileControlsPortal";
  portal.className="prepare-screen prepare-mobile-controls-portal";
  portal.append(panel,actions);
  document.body.appendChild(portal);
 }
 window.compactMobileDom=function(){
  if(baseCompact)baseCompact();
  portalPrepareControls();
 };
 setTimeout(()=>window.compactMobileDom(),0);
})();
