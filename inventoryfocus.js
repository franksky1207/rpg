(function(){
 const VERSION=1;
 let pending=false;

 function requestFocus(){pending=true;return true;}
 function hasLostGear(){return Array.isArray(state?.lostGear)&&state.lostGear.length>0;}
 function hasUpgrade(){
  if(!Array.isArray(state?.inventory)||!Array.isArray(window.EQUIPMENT_TYPES||EQUIPMENT_TYPES))return false;
  return EQUIPMENT_TYPES.some(type=>{
   const current=state?.equipment?.[type]||null;
   const currentScore=typeof equipmentScore==="function"?equipmentScore(current):0;
   return state.inventory.some(item=>item?.type===type&&(typeof equipmentScore==="function"?equipmentScore(item):0)>currentScore);
  });
 }
 function runFocus(){
  if(typeof document==="undefined"||!document.querySelector(".inventory-page"))return false;
  let target=null;
  if(hasLostGear())target=document.querySelector(".inventory-page .lost-gear-card");
  else if(hasUpgrade())target=document.querySelector('.inventory-page [onclick="equipBestAll()"]');
  if(target){target.scrollIntoView({block:"center",inline:"nearest",behavior:"auto"});return true;}
  if(typeof window.scrollTo==="function")window.scrollTo({top:0,left:0,behavior:"auto"});
  return true;
 }
 function applyFocus(){
  if(!pending)return false;
  pending=false;
  const run=()=>runFocus();
  if(typeof requestAnimationFrame==="function")requestAnimationFrame(()=>requestAnimationFrame(run));
  else setTimeout(run,0);
  return true;
 }
 function enterInventory(base,args,context){
  requestFocus();
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

 window.requestInventoryEntryFocus=requestFocus;
 window.applyInventoryEntryFocus=applyFocus;
 window.inventoryHasEquipmentUpgrade=hasUpgrade;
 window.INVENTORY_ENTRY_FOCUS_VERSION=VERSION;
})();
