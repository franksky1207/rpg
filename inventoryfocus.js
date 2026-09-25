(function(){
 const VERSION=2;
 let pendingMode=null;

 function requestEntryFocus(){pendingMode="entry";return true;}
 function requestPostRedeemFocus(){pendingMode="post-redeem";return true;}
 function hasLostGear(){return Array.isArray(state?.lostGear)&&state.lostGear.length>0;}
 function hasUpgrade(){
  if(!Array.isArray(state?.inventory)||typeof equipmentScore!=="function")return false;
  const types=Array.isArray(window.EQUIPMENT_TYPES)?window.EQUIPMENT_TYPES:(typeof EQUIPMENT_TYPES!=="undefined"?EQUIPMENT_TYPES:[]);
  return types.some(type=>{
   const current=state?.equipment?.[type]||null;
   const currentScore=equipmentScore(current);
   return state.inventory.some(item=>item?.type===type&&equipmentScore(item)>currentScore);
  });
 }
 function scrollTarget(target){
  if(!target)return false;
  target.scrollIntoView({block:"center",inline:"nearest",behavior:"auto"});
  return true;
 }
 function runFocus(mode){
  if(typeof document==="undefined"||!document.querySelector(".inventory-page"))return false;
  if(hasLostGear())return scrollTarget(document.querySelector(".inventory-page .lost-gear-card"));
  if(hasUpgrade())return scrollTarget(document.querySelector('.inventory-page [onclick="equipBestAll()"]'));
  if(mode==="entry"&&typeof window.scrollTo==="function")window.scrollTo({top:0,left:0,behavior:"auto"});
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
 function enterInventory(base,args,context){
  requestEntryFocus();
  const result=base.apply(context,args);
  applyFocus();
  return result;
 }

 const baseGo=typeof window.go==="function"?window.go:null;
 if(baseGo){
  window.go=function(...args){
   if(args[0]==="inventory")return enterInventory(baseGo,args,this);
   return baseGo.apply(this,args);
  };
 }
 const baseAdventureInventory=typeof window.openAdventureInventory==="function"?window.openAdventureInventory:null;
 if(baseAdventureInventory){
  window.openAdventureInventory=function(...args){return enterInventory(baseAdventureInventory,args,this);};
 }

 window.requestInventoryEntryFocus=requestEntryFocus;
 window.requestInventoryPostRedeemFocus=requestPostRedeemFocus;
 window.applyInventoryEntryFocus=applyFocus;
 window.inventoryHasEquipmentUpgrade=hasUpgrade;
 window.INVENTORY_ENTRY_FOCUS_VERSION=VERSION;
})();
