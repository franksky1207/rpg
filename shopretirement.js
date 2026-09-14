(function(){
 const baseNewState=window.newState;
 const baseMigrateSave=window.migrateSave;
 const baseSave=window.save;
 const baseEnsureShop=window.ensureShop;

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
   if(!state||typeof state!=="object")return baseSave(show);
   const hadShop=Object.prototype.hasOwnProperty.call(state,"shop");
   const runtimeShop=state.shop;
   if(hadShop)delete state.shop;
   const ok=baseSave(show);
   if(hadShop)state.shop=runtimeShop;
   return ok;
  };
 }

 // Phase 1 compatibility shell: the old shop page remains until the UI-removal batch.
 // Normal loading never recreates state.shop; only actually entering the legacy shop view
 // receives a runtime-only object, and save() strips it before persistence.
 window.ensureShop=function(){
  if(!state||typeof state!=="object")return;
  if(typeof view==="undefined"||view!=="shop")return;
  if(!state.shop||typeof state.shop!=="object")state.shop={items:[],refreshIndex:0,resetAvailableAt:0,initialized:false};
  if(typeof baseEnsureShop==="function")baseEnsureShop();
 };

 // Boss first-clear no longer refreshes shop stock. The legacy call remains harmless until
 // combatcore is physically cleaned in the final retirement pass.
 window.freeShopRefresh=function(){return false;};

 window.SHOP_CORE_RETIREMENT_PHASE1=true;
})();
