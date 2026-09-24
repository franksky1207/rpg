(function(){
 const VERSION=1;
 const hooks=new Map();
 const base=typeof window.save==="function"?window.save:null;
 if(!base){
  window.SAVE_HOOK_CORE_VERSION=VERSION;
  window.SAVE_HOOK_CORE_REPORT={version:VERSION,passed:false,reason:"base-save-missing"};
  return;
 }
 function register(id,fn){
  const key=String(id||"").trim();
  if(!key||typeof fn!=="function")return false;
  hooks.set(key,fn);
  return true;
 }
 function unregister(id){return hooks.delete(String(id||"").trim());}
 function runHooks(context){
  hooks.forEach((fn,id)=>{
   try{fn(context);}catch(error){console.error(`[文明戰線] Save hook failed: ${id}`,error);}
  });
 }
 const wrapped=function(show=true){
  const ok=base(show);
  if(ok===true)runHooks({show:show!==false,state:window.state??(typeof state!=="undefined"?state:null),savedAt:Date.now()});
  return ok;
 };
 window.registerAfterSaveHook=register;
 window.unregisterAfterSaveHook=unregister;
 window.getAfterSaveHookIds=function(){return Array.from(hooks.keys());};
 window.save=wrapped;
 try{save=wrapped;}catch(e){}
 window.SAVE_HOOK_CORE_VERSION=VERSION;
 window.SAVE_HOOK_RUNTIME_OWNER="savehookcore";
 window.SAVE_HOOK_CORE_REPORT={version:VERSION,passed:true,reason:"",baseSave:base,wrappedSave:wrapped};
})();
