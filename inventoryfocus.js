(function(){
 const VERSION=3;
 const FOCUS_MODE_ENTRY="entry";
 const FOCUS_MODE_POST_REDEEM="post-redeem";
 let pendingMode=null;

 function requestEntryFocus(){pendingMode=FOCUS_MODE_ENTRY;return true;}
 function requestPostRedeemFocus(){pendingMode=FOCUS_MODE_POST_REDEEM;return true;}
 function hasLostGear(){return Array.isArray(state?.lostGear)&&state.lostGear.length>0;}
 function hasUpgrade(){
  if(!Array.isArray(state?.inventory)||typeof window.isActualGearUpgrade!=="function")return false;
  return state.inventory.some(item=>window.isActualGearUpgrade(item));
 }
 function resolveFocusTarget(mode){
  if(hasLostGear())return "lost-gear";
  if(hasUpgrade())return "upgrade";
  if(mode===FOCUS_MODE_ENTRY)return "top";
  return "none";
 }
 function scrollTarget(target){
  if(!target)return false;
  target.scrollIntoView({block:"center",inline:"nearest",behavior:"auto"});
  return true;
 }
 function runFocus(mode){
  if(typeof document==="undefined"||!document.querySelector(".inventory-page"))return false;
  const target=resolveFocusTarget(mode);
  if(target==="lost-gear")return scrollTarget(document.querySelector(".inventory-page .lost-gear-card"));
  if(target==="upgrade")return scrollTarget(document.querySelector('.inventory-page [onclick="equipBestAll()"]'));
  if(target==="top"&&typeof window.scrollTo==="function")window.scrollTo({top:0,left:0,behavior:"auto"});
  return true;
 }
 function applyFocus(){
  if(!pendingMode)return false;
  const mode=pendingMode;
  pendingMode=null;
  const run=()=>runFocus(mode);
  if(typeof requestAnimationFrame==="function")requestAnimationFrame(()=>requestAnimationFrame(run));
  else setTimeout(run,0);
  return true;
 }

 window.requestInventoryEntryFocus=requestEntryFocus;
 window.requestInventoryPostRedeemFocus=requestPostRedeemFocus;
 window.applyInventoryFocus=applyFocus;
 window.resolveInventoryFocusTarget=resolveFocusTarget;
 window.inventoryHasEquipmentUpgrade=hasUpgrade;
 window.INVENTORY_FOCUS_VERSION=VERSION;
})();
