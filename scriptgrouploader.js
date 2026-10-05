(function(){
 const VERSION=1;
 const ROUTING_VERSION=1;
 const ACTIVATION_POLICY_VERSION=3;
 const LOAD_BEHAVIOR_VERSION=4;
 const GLOBAL_API_CLEANUP_VERSION=1;
 const GM_AUTHORIZATION_VERSION=1;
 const GM_AUTHORIZATION_KEY="civilization-war-gm-authorized-v1";
 const GM_SAVE_HOOK_ID="gm-runtime-authorization-v1";
 const GROUP_ORDER=Object.freeze(["story","gm","integrity"]);
 const AUTO_GROUPS=Object.freeze(["story"]);
 const AUTO_START_DELAY_MS=120;
 const groupPromises=new Map();
 const groupReports=new Map();

 function declaredNodes(){return Array.from(document.querySelectorAll('script[type="application/x-civilization-deferred"][data-load-group][data-src]'));}
 function effectiveGroup(node){const declared=String(node?.dataset?.loadGroup||"").trim().toLowerCase(),src=String(node?.dataset?.src||"").split("?")[0].toLowerCase();if(src==="storyruntimeintegrity.js")return "integrity";return declared;}
 function declarations(group){return declaredNodes().filter(node=>effectiveGroup(node)===group);}
 function report(group,status,extra={}){const row=Object.freeze({version:VERSION,group,status,...extra});groupReports.set(group,row);return row;}
 function loadOne(node){return new Promise((resolve,reject)=>{if(node.dataset.loaded==="1")return resolve(node.dataset.src||"");const script=document.createElement("script");Array.from(node.attributes).forEach(attr=>{if(["type","data-src","data-load-group"].includes(attr.name))return;script.setAttribute(attr.name,attr.value);});script.src=node.dataset.src;script.async=false;script.dataset.loadGroup=effectiveGroup(node);script.onload=()=>{node.dataset.loaded="1";script.dataset.loadState="ready";resolve(script.src);};script.onerror=()=>{script.remove();reject(new Error(`script-group-load-failed:${node.dataset.src||"unknown"}`));};node.after(script);});}
 async function loadGroup(group){
  const key=String(group||"").trim().toLowerCase();if(!GROUP_ORDER.includes(key))throw new Error(`unknown-script-group:${key||"empty"}`);if(groupPromises.has(key))return groupPromises.get(key);
  const nodes=declarations(key),startedAt=Date.now();report(key,"loading",{count:nodes.length,startedAt});let promise=null;
  promise=(async()=>{const loaded=[];for(const node of nodes)loaded.push(await loadOne(node));const done=report(key,"ready",{count:nodes.length,loaded:loaded.length,startedAt,completedAt:Date.now()});try{window.dispatchEvent(new CustomEvent("civilization-script-group-ready",{detail:done}));}catch(_){ }return done;})().catch(error=>{if(groupPromises.get(key)===promise)groupPromises.delete(key);const failed=report(key,"failed",{count:nodes.length,startedAt,completedAt:Date.now(),error:String(error?.message||error),retryable:true});try{window.dispatchEvent(new CustomEvent("civilization-script-group-failed",{detail:failed}));}catch(_){ }throw error;});
  groupPromises.set(key,promise);return promise;
 }
 function gmAuthorized(){try{return localStorage.getItem(GM_AUTHORIZATION_KEY)==="1";}catch(_){return false;}}
 function setGmAuthorized(value){const enabled=value===true;try{if(enabled)localStorage.setItem(GM_AUTHORIZATION_KEY,"1");else localStorage.removeItem(GM_AUTHORIZATION_KEY);}catch(_){return false;}return true;}
 function setRuntimeGmFlag(value){try{if(typeof state!=="undefined"&&state)state.gm=value===true;return true;}catch(_){return false;}}
 function installSaveBoundary(){
  if(typeof window.registerBeforeSaveHook!=="function"||typeof window.registerSaveSettlementHook!=="function")return false;
  window.registerBeforeSaveHook(GM_SAVE_HOOK_ID,context=>{try{if(context?.state?.gm===true){context.__gmRuntimeAuthorizationRestore=true;context.state.gm=false;}}catch(_){ }});
  window.registerSaveSettlementHook(GM_SAVE_HOOK_ID,context=>{if(context?.__gmRuntimeAuthorizationRestore===true)setRuntimeGmFlag(true);});
  return true;
 }
 function stripLegacySaveAuthorization(){try{if(typeof state==="undefined"||!state||state.gm!==true)return false;state.gm=false;if(typeof save==="function")save(false);return true;}catch(_){return false;}}
 function gmAuthorizationSnapshot(){let legacySaveFlag=false;try{legacySaveFlag=typeof state!=="undefined"&&state?.gm===true&&!gmAuthorized();}catch(_){ }return Object.freeze({version:GM_AUTHORIZATION_VERSION,scope:"browser-local-runtime",authorized:gmAuthorized(),runtimeFlag:typeof state!=="undefined"&&state?.gm===true,legacySaveFlagIgnored:legacySaveFlag,saveStateAuthoritative:false,key:GM_AUTHORIZATION_KEY});}
 function activationSnapshot(){return Object.freeze({version:ACTIVATION_POLICY_VERSION,behaviorVersion:LOAD_BEHAVIOR_VERSION,story:"post-load-sequenced",gm:"browser-local-authorization-or-password-modal-on-demand",integrity:"diagnostics-explicit-only",autoGroups:Array.from(AUTO_GROUPS),savedGmAuthorized:false,gmAuthorization:gmAuthorizationSnapshot()});}
 function snapshot(){const groups={};GROUP_ORDER.forEach(group=>{groups[group]=groupReports.get(group)||Object.freeze({version:VERSION,group,status:"pending",count:declarations(group).length});});return Object.freeze({version:VERSION,routingVersion:ROUTING_VERSION,order:Array.from(GROUP_ORDER),autoGroups:Array.from(AUTO_GROUPS),activation:activationSnapshot(),groups:Object.freeze(groups),storyRuntimeIntegrityGroup:"integrity"});}
 async function autoLoad(){for(const group of AUTO_GROUPS){try{await loadGroup(group);}catch(error){console.error(`[ScriptGroupLoader] ${group}`,error);}}}
 function diagnosticsRequested(){try{const params=new URLSearchParams(location.search||"");if(params.get("production")==="1")return false;const explicit=params.get("integrity")==="1"||params.get("diagnostics")==="1",local=location.hostname==="127.0.0.1"||location.hostname==="localhost";return explicit||local;}catch(_){return false;}}
 function ensureAuthorizedGmRuntime(){if(!gmAuthorized())return Promise.resolve(false);return loadGroup("gm").then(()=>{setRuntimeGmFlag(true);return true;}).catch(error=>{console.error("[ScriptGroupLoader] gm authorized restore",error);return false;});}
 async function authorizeGmRuntime(){if(!setGmAuthorized(true))return false;try{await loadGroup("gm");setRuntimeGmFlag(true);return true;}catch(error){console.error("[ScriptGroupLoader] gm authorization load",error);return false;}}
 function revokeGmRuntimeAuthorization(){const ok=setGmAuthorized(false);setRuntimeGmFlag(false);return ok;}
 function installGmPasswordBridge(){
  const base=window.unlockGM;if(typeof base!=="function")return false;if(base.__gmRuntimeAuthorizationVersion===GM_AUTHORIZATION_VERSION)return true;
  const wrapped=function(){let before=false;try{before=state?.gm===true;}catch(_){ }const result=base.apply(this,arguments);let accepted=false;try{accepted=!before&&state?.gm===true;}catch(_){ }if(accepted)authorizeGmRuntime();return result;};
  wrapped.__gmRuntimeAuthorizationVersion=GM_AUTHORIZATION_VERSION;window.unlockGM=wrapped;return true;
 }
 function observeGmActivation(){const modal=document.getElementById("passwordModal");if(!modal||typeof MutationObserver!=="function")return;const activate=()=>{const className=String(modal.className||""),visible=className!=="modal"||modal.getAttribute("aria-hidden")==="false"||modal.style.display==="block";if(visible)loadGroup("gm").catch(error=>console.error("[ScriptGroupLoader] gm",error));};new MutationObserver(activate).observe(modal,{attributes:true,attributeFilter:["class","style","aria-hidden"]});activate();}
 async function loadDiagnostics(){try{await loadGroup("gm");}catch(error){console.error("[ScriptGroupLoader] gm",error);}try{await loadGroup("integrity");}catch(error){console.error("[ScriptGroupLoader] integrity",error);}}
 function schedule(){const start=()=>setTimeout(()=>{stripLegacySaveAuthorization();installGmPasswordBridge();autoLoad();ensureAuthorizedGmRuntime();observeGmActivation();if(diagnosticsRequested())loadDiagnostics();},AUTO_START_DELAY_MS);if(document.readyState==="complete")start();else window.addEventListener("load",start,{once:true});}

 const namespace=Object.freeze({version:VERSION,routingVersion:ROUTING_VERSION,activationPolicyVersion:ACTIVATION_POLICY_VERSION,loadBehaviorVersion:LOAD_BEHAVIOR_VERSION,gmAuthorizationVersion:GM_AUTHORIZATION_VERSION,ensure:loadGroup,ensureAuthorizedGmRuntime,authorizeGmRuntime,revokeGmRuntimeAuthorization,gmAuthorizationSnapshot,snapshot,activationSnapshot});
 window.CivilizationScriptLoader=namespace;window.SCRIPT_GROUP_LOADER_VERSION=VERSION;window.SCRIPT_GROUP_ACTIVATION_POLICY_VERSION=ACTIVATION_POLICY_VERSION;window.SCRIPT_GROUP_LOAD_BEHAVIOR_VERSION=LOAD_BEHAVIOR_VERSION;window.SCRIPT_GROUP_GLOBAL_API_CLEANUP_VERSION=GLOBAL_API_CLEANUP_VERSION;window.SCRIPT_GROUP_AUTHORIZED_GM_RESTORE_VERSION=2;window.GM_RUNTIME_AUTHORIZATION_VERSION=GM_AUTHORIZATION_VERSION;window.GM_RUNTIME_AUTHORIZATION_SCOPE="browser-local-runtime";window.GM_SAVE_AUTHORIZATION_RETIRED_VERSION=1;window.GM_RUNTIME_SAVE_BOUNDARY_VERSION=1;window.GM_RUNTIME_SAVE_BOUNDARY_INSTALLED=installSaveBoundary();
 window.ensureCivilizationScriptGroup=loadGroup;window.civilizationScriptGroupSnapshot=snapshot;schedule();
})();