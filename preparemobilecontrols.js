(()=>{
 const baseCompact=typeof window.compactMobileDom==="function"?window.compactMobileDom:null;
 function clearPortal(){document.getElementById("prepareMobileControlsPortal")?.remove();}
 function portalPrepareControls(){
  clearPortal();
  const mobile=window.matchMedia&&window.matchMedia("(max-width:760px)").matches;
  if(!mobile)return;
  const panel=document.querySelector('#main .prepare-screen [data-mobile-battle-panel="1"]');
  const actions=document.querySelector('#main .prepare-screen [data-mobile-prepare-actions="1"]');
  if(!actions)return;
  const portal=document.createElement("div");
  portal.id="prepareMobileControlsPortal";
  portal.className="prepare-screen prepare-mobile-controls-portal";
  if(panel)portal.append(panel);
  portal.append(actions);
  document.body.appendChild(portal);
 }
 window.compactMobileDom=function(){
  if(baseCompact)baseCompact();
  portalPrepareControls();
 };
 setTimeout(()=>window.compactMobileDom(),0);
 window.PREPARE_MOBILE_CONTROLS_VERSION=2;
})();
