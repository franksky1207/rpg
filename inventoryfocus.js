(function(){
 const VERSION=4;
 const THIRD_WORLD_ADVENTURE_RETURN_VERSION=1;
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
 function openThirdWorldAdventureInventory(){
  const run=typeof window.thirdWorldContinuousRunSnapshot==="function"?window.thirdWorldContinuousRunSnapshot():null;
  if(run?.active===true&&typeof window.stopThirdWorldRunFromPlayerUi==="function")window.stopThirdWorldRunFromPlayerUi();
  if(typeof window.openAdventureInventory!=="function")return false;
  window.openAdventureInventory();
  return true;
 }
 function thirdWorldReturnIntegrity(){
  const errors=[];
  const source=Function.prototype.toString.call(openThirdWorldAdventureInventory);
  if(typeof window.openAdventureInventory!=="function")errors.push({code:"SHARED_ADVENTURE_INVENTORY_OWNER_MISSING"});
  if(!/openAdventureInventory/.test(source))errors.push({code:"THIRD_WORLD_SHARED_RETURN_WIRING_MISSING"});
  if(!/stopThirdWorldRunFromPlayerUi/.test(source))errors.push({code:"THIRD_WORLD_RUN_STOP_WIRING_MISSING"});
  return Object.freeze({version:THIRD_WORLD_ADVENTURE_RETURN_VERSION,passed:errors.length===0,errors:Object.freeze(errors)});
 }

 window.requestInventoryEntryFocus=requestEntryFocus;
 window.requestInventoryPostRedeemFocus=requestPostRedeemFocus;
 window.applyInventoryFocus=applyFocus;
 window.resolveInventoryFocusTarget=resolveFocusTarget;
 window.inventoryHasEquipmentUpgrade=hasUpgrade;
 window.thirdWorldOpenInventoryFromPlayerUi=openThirdWorldAdventureInventory;
 window.INVENTORY_FOCUS_VERSION=VERSION;
 window.THIRD_WORLD_ADVENTURE_INVENTORY_RETURN_VERSION=THIRD_WORLD_ADVENTURE_RETURN_VERSION;
 window.THIRD_WORLD_ADVENTURE_INVENTORY_RETURN_INTEGRITY=thirdWorldReturnIntegrity();
 if(!window.THIRD_WORLD_ADVENTURE_INVENTORY_RETURN_INTEGRITY.passed)console.error("[文明戰線] Third-world inventory return integrity error",window.THIRD_WORLD_ADVENTURE_INVENTORY_RETURN_INTEGRITY.errors);
})();
