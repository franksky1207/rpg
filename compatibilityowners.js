(function(){
 const VERSION=1;
 const LEGACY_SAVE_VERSION_VALUE=typeof SAVE_VERSION==="number"?Math.floor(Number(SAVE_VERSION)||0):0;
 const LEGACY_MAX_LEVEL_VALUE=typeof MAX_LEVEL==="number"?Math.floor(Number(MAX_LEVEL)||0):0;
 const SAVE_SCHEMA_OWNER="savemigration";
 const LEVEL_CAP_RUNTIME_OWNER="levelprogression";
 const ARENA_RUNTIME_OWNER="arenaByWorld";
 const ARENA_ALIAS_POLICY="legacy-read-through-only";
 const SAVE_HOOK_CORE_VERSION=1;
 const SCRIPT_LOAD_POLICY_VERSION=1;
 const saveHooks=new Map();
 const baseSave=typeof window.save==="function"?window.save:null;

 function registerAfterSaveHook(id,fn){
  const key=String(id||"").trim();
  if(!key||typeof fn!=="function")return false;
  saveHooks.set(key,fn);
  return true;
 }
 function unregisterAfterSaveHook(id){return saveHooks.delete(String(id||"").trim());}
 function runAfterSaveHooks(context){
  saveHooks.forEach((fn,id)=>{
   try{fn(context);}catch(error){console.error(`[文明戰線] Save hook failed: ${id}`,error);}
  });
 }
 if(baseSave){
  const hookedSave=function(show=true){
   const ok=baseSave(show);
   if(ok===true)runAfterSaveHooks({show:show!==false,state:typeof state!=="undefined"?state:null,savedAt:Date.now()});
   return ok;
  };
  window.save=hookedSave;
  try{save=hookedSave;}catch(e){}
 }
 function scriptLoadGroupFor(path){
  const name=String(path||"").split("/").pop().split("?")[0].toLowerCase();
  if(!name)return "core";
  if(name.startsWith("storydata-")||["storyintegrity.js","storyui.js","storymigration.js","storyprogress.js","storyrecordtabs.js","storyruntimeintegrity.js"].includes(name))return "story";
  if(name.includes("integrity"))return "integrity";
  if(name.startsWith("gm")||name.includes("gm.")||name.includes("gmp")||name.endsWith("gm.js")||["vipgm.js","civilizationgm.js","specialgmbatch.js","dungeongm.js","arenagm5.js","dungeonvoidgmmanage.js","batch5ui.js","mirrordungeongm.js","levelprogressionaudit.js"].includes(name))return "gm";
  if(name.startsWith("worldmaps-")||name.startsWith("secondworld")||name.startsWith("worldphase")||name.startsWith("worldmap"))return "world";
  return "core";
 }

 window.LEGACY_COMPATIBILITY_OWNER_VERSION=VERSION;
 window.LEGACY_SAVE_VERSION=LEGACY_SAVE_VERSION_VALUE;
 window.LEGACY_SAVE_VERSION_ALIAS_VERSION=1;
 window.LEGACY_FIRST_WORLD_LEVEL_CAP=LEGACY_MAX_LEVEL_VALUE;
 window.LEGACY_MAX_LEVEL_ALIAS_VERSION=1;
 window.SAVE_SCHEMA_RUNTIME_OWNER=SAVE_SCHEMA_OWNER;
 window.LEVEL_CAP_RUNTIME_OWNER=LEVEL_CAP_RUNTIME_OWNER;
 window.ARENA_PROGRESS_RUNTIME_OWNER=ARENA_RUNTIME_OWNER;
 window.ARENA_LEGACY_ALIAS_POLICY=ARENA_ALIAS_POLICY;
 window.ARENA_LEGACY_ALIAS_AUDIT_VERSION=1;
 window.SAVE_HOOK_CORE_VERSION=SAVE_HOOK_CORE_VERSION;
 window.SAVE_HOOK_RUNTIME_OWNER="compatibilityowners";
 window.registerAfterSaveHook=registerAfterSaveHook;
 window.unregisterAfterSaveHook=unregisterAfterSaveHook;
 window.getAfterSaveHookIds=function(){return Array.from(saveHooks.keys());};
 window.SCRIPT_LOAD_POLICY_VERSION=SCRIPT_LOAD_POLICY_VERSION;
 window.scriptLoadGroupFor=scriptLoadGroupFor;
 window.SCRIPT_LOAD_GROUPS=Object.freeze(["core","world","gm","story","integrity"]);

 const errors=[];
 if(LEGACY_SAVE_VERSION_VALUE!==13)errors.push({code:"LEGACY_SAVE_VERSION",actual:LEGACY_SAVE_VERSION_VALUE});
 if(Number(window.SAVE_SCHEMA_VERSION)!==15)errors.push({code:"SAVE_SCHEMA_VERSION",actual:window.SAVE_SCHEMA_VERSION});
 if(LEGACY_MAX_LEVEL_VALUE!==500)errors.push({code:"LEGACY_MAX_LEVEL",actual:LEGACY_MAX_LEVEL_VALUE});
 if(Number(window.FIRST_WORLD_LEVEL_CAP)!==500||Number(window.SECOND_WORLD_LEVEL_CAP)!==1000)errors.push({code:"LEVEL_CAP_OWNER",first:window.FIRST_WORLD_LEVEL_CAP,second:window.SECOND_WORLD_LEVEL_CAP});
 if(Number(window.ARENA_BY_WORLD_STATE_VERSION)!==2||typeof window.getArenaProgressForWorld!=="function")errors.push({code:"ARENA_OWNER"});
 if(!baseSave||typeof window.registerAfterSaveHook!=="function")errors.push({code:"SAVE_HOOK_OWNER"});
 window.LEGACY_COMPATIBILITY_OWNER_REPORT={version:VERSION,passed:errors.length===0,errors};
})();
