(function(){
 const baseNewState=window.newState;
 const baseMigrateSave=window.migrateSave;
 const baseSave=window.save;

 if(typeof baseNewState==="function"){
  window.newState=function(){
   const next=baseNewState();
   if(next&&typeof next==="object")delete next.shop;
   return next;
  };
 }

 if(typeof baseMigrateSave==="function"){
  window.migrateSave=function(...args){
   const next=baseMigrateSave(...args);
   if(next&&typeof next==="object")delete next.shop;
   return next;
  };
 }

 if(typeof baseSave==="function"){
  window.save=function(show=true){
   if(state&&typeof state==="object"&&Object.prototype.hasOwnProperty.call(state,"shop"))delete state.shop;
   return baseSave(show);
  };
 }

 // The shop UI is retired. Legacy callers must not recreate runtime shop state.
 window.ensureShop=function(){
  if(state&&typeof state==="object"&&Object.prototype.hasOwnProperty.call(state,"shop"))delete state.shop;
  return false;
 };

 // Boss first-clear no longer refreshes shop stock. Kept temporarily as a harmless retired API
 // until the final source-cleanup batch removes the old call site and legacy shop functions.
 window.freeShopRefresh=function(){return false;};

 window.SHOP_CORE_RETIREMENT_PHASE2=true;
})();
