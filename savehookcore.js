(function(){
 const CORE_VERSION=2;
 const IMPLEMENTATION_VERSION=1;
 const LEGACY_RUNTIME_OWNER_ALIAS="compatibilityowners";
 const IMPLEMENTATION_OWNER="savehookcore";
 const beforeSaveHooks=new Map();
 const afterSaveHooks=new Map();
 const settlementSaveHooks=new Map();
 const baseSave=typeof window.save==="function"?window.save:null;

 function registerHook(map,id,fn){const key=String(id||"").trim();if(!key||typeof fn!=="function")return false;map.set(key,fn);return true;}
 function unregisterHook(map,id){return map.delete(String(id||"").trim());}
 function runHooks(map,context,label){
  map.forEach((fn,id)=>{
   try{const result=fn(context);if(label==="before"&&result===false){context.cancelled=true;if(!context.cancelReason)context.cancelReason=`hook:${id}`;}}
   catch(error){console.error(`[文明戰線] Save ${label} hook failed: ${id}`,error);}
  });
 }
 function registerBeforeSaveHook(id,fn){return registerHook(beforeSaveHooks,id,fn);}
 function unregisterBeforeSaveHook(id){return unregisterHook(beforeSaveHooks,id);}
 function registerAfterSaveHook(id,fn){return registerHook(afterSaveHooks,id,fn);}
 function unregisterAfterSaveHook(id){return unregisterHook(afterSaveHooks,id);}
 function registerSaveSettlementHook(id,fn){return registerHook(settlementSaveHooks,id,fn);}
 function unregisterSaveSettlementHook(id){return unregisterHook(settlementSaveHooks,id);}

 if(!baseSave)throw new Error("Save Hook Core requires engine save() owner.");
 if(baseSave.__saveHookCoreVersion){throw new Error("Save Hook Core cannot wrap an already-hooked save().");}
 const hookedSave=function(show=true){
  const context={show:show!==false,state:typeof state!=="undefined"?state:null,startedAt:Date.now(),cancelled:false,cancelReason:"",result:false,savedAt:0};
  runHooks(beforeSaveHooks,context,"before");
  if(!context.cancelled)context.result=baseSave(show)===true;
  if(context.result===true){context.savedAt=Date.now();runHooks(afterSaveHooks,context,"after");}
  context.finishedAt=Date.now();runHooks(settlementSaveHooks,context,"settlement");
  return context.result===true;
 };
 hookedSave.__saveHookOwner=IMPLEMENTATION_OWNER;
 hookedSave.__saveHookCoreVersion=CORE_VERSION;
 hookedSave.__saveHookBase=baseSave;
 window.save=hookedSave;
 try{save=hookedSave;}catch(_){}

 window.SAVE_HOOK_CORE_VERSION=CORE_VERSION;
 window.SAVE_HOOK_IMPLEMENTATION_VERSION=IMPLEMENTATION_VERSION;
 window.SAVE_HOOK_IMPLEMENTATION_OWNER=IMPLEMENTATION_OWNER;
 window.SAVE_HOOK_RUNTIME_OWNER=LEGACY_RUNTIME_OWNER_ALIAS;
 window.SAVE_HOOK_RUNTIME_OWNER_ALIAS_VERSION=1;
 window.registerBeforeSaveHook=registerBeforeSaveHook;
 window.unregisterBeforeSaveHook=unregisterBeforeSaveHook;
 window.registerAfterSaveHook=registerAfterSaveHook;
 window.unregisterAfterSaveHook=unregisterAfterSaveHook;
 window.registerSaveSettlementHook=registerSaveSettlementHook;
 window.unregisterSaveSettlementHook=unregisterSaveSettlementHook;
 window.getBeforeSaveHookIds=function(){return Array.from(beforeSaveHooks.keys());};
 window.getAfterSaveHookIds=function(){return Array.from(afterSaveHooks.keys());};
 window.getSaveSettlementHookIds=function(){return Array.from(settlementSaveHooks.keys());};
 window.saveHookOwnerSnapshot=function(){return Object.freeze({coreVersion:CORE_VERSION,implementationVersion:IMPLEMENTATION_VERSION,implementationOwner:IMPLEMENTATION_OWNER,runtimeOwnerAlias:LEGACY_RUNTIME_OWNER_ALIAS,before:Array.from(beforeSaveHooks.keys()),after:Array.from(afterSaveHooks.keys()),settlement:Array.from(settlementSaveHooks.keys())});};
})();