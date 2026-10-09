(function(){
 const VERSION=1;
 const ROUTING_VERSION=1;
 const ACTIVATION_POLICY_VERSION=3;
 const LOAD_BEHAVIOR_VERSION=5;
 const GLOBAL_API_CLEANUP_VERSION=1;
 const GM_AUTHORIZATION_VERSION=2;
 const GM_EARLY_RUNTIME_RESTORE_VERSION=2;
 const GM_AUTHORIZED_GROUP_RETRY_VERSION=1;
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
 function gmAuthorized(){return typeof window.gmRuntimeAuthorizationAuthorized==="function"&&window.gmRuntimeAuthorizationAuthorized()===true;}
 function setGmAuthorized(value){return typeof window.gmSetRuntimeAuthorization==="function"&&window.gmSetRuntimeAuthorization(value===true)===true;}
 function setRuntimeGmFlag(value){return typeof window.gmSetRuntimeAuthorizationFlag==="function"&&window.gmSetRuntimeAuthorizationFlag(value===true)===true;}
 function restoreAuthorizedGmFlagEarly(){return setRuntimeGmFlag(gmAuthorized());}
 function gmAuthorizationSnapshot(){
  if(typeof window.gmRuntimeAuthorizationSnapshot==="function")return window.gmRuntimeAuthorizationSnapshot();
  return Object.freeze({version:GM_AUTHORIZATION_VERSION,scope:"account-local-runtime",authorized:false,runtimeFlag:false,saveStateAuthoritative:false,key:null});
 }
 function activationSnapshot(){return Object.freeze({version:ACTIVATION_POLICY_VERSION,behaviorVersion:LOAD_BEHAVIOR_VERSION,story:"post-load-sequenced",gm:"account-local-authorization-or-password-modal-on-demand",integrity:"diagnostics-explicit-only",autoGroups:Array.from(AUTO_GROUPS),savedGmAuthorized:false,gmAuthorization:gmAuthorizationSnapshot()});}
 function snapshot(){const groups={};GROUP_ORDER.forEach(group=>{groups[group]=groupReports.get(group)||Object.freeze({version:VERSION,group,status:"pending",count:declarations(group).length});});return Object.freeze({version:VERSION,routingVersion:ROUTING_VERSION,order:Array.from(GROUP_ORDER),autoGroups:Array.from(AUTO_GROUPS),activation:activationSnapshot(),groups:Object.freeze(groups),storyRuntimeIntegrityGroup:"integrity"});}
 async function autoLoad(){for(const group of AUTO_GROUPS){try{await loadGroup(group);}catch(error){console.error(`[ScriptGroupLoader] ${group}`,error);}}}
 function diagnosticsRequested(){try{const params=new URLSearchParams(location.search||"");if(params.get("production")==="1")return false;const explicit=params.get("integrity")==="1"||params.get("diagnostics")==="1",local=location.hostname==="127.0.0.1"||location.hostname==="localhost";return explicit||local;}catch(_){return false;}}
 // Concurrent conditional HTTP revalidation reuses unchanged responses while keeping JS execution ordered.
 // Works with ordinary browser HTTP cache; never stores credentials or mutable player data.
 async function warmAuthorizedGmScripts(){
  if(!gmAuthorized())return false;
  if(typeof fetch!=="function")return false;
  const nodes=declarations("gm"),urls=nodes.map(node=>node.dataset.src);
  let index=0;
  const workers=Array.from({length:Math.min(6,urls.length)},async()=>{
   while(index<urls.length){
    if(!gmAuthorized())return;
    const url=urls[index++];
    const response=await fetch(url,{cache:"no-cache",credentials:"same-origin"});
    if(!response.ok)throw new Error("startup-resource-revalidation-failed");
    // Drain body to complete cache entry before ordered <script src> evaluation.
    await response.arrayBuffer();
   }
  });
  await Promise.all(workers);return true;
 }
 async function ensureAuthorizedGmRuntime(options={}){
  if(!gmAuthorized())return false;
  const restored=restoreAuthorizedGmFlagEarly(),allowRetry=options.retry!==false;
  try{if(options.warm===true)await warmAuthorizedGmScripts();await loadGroup("gm");setRuntimeGmFlag(true);return true;}
  catch(error){
   console.error("[ScriptGroupLoader] gm authorized restore",error);
   if(!allowRetry)return restored;
   await new Promise(resolve=>setTimeout(resolve,250));
   if(!gmAuthorized())return false;
   try{await loadGroup("gm");setRuntimeGmFlag(true);return true;}
   catch(retryError){console.error("[ScriptGroupLoader] gm authorized retry",retryError);return restored;}
  }
 }
 async function authorizeGmRuntime(){if(!setGmAuthorized(true))return false;setRuntimeGmFlag(true);return ensureAuthorizedGmRuntime({retry:true});}
 function revokeGmRuntimeAuthorization(){const ok=typeof window.gmClearCurrentRuntimeAuthorization==="function"?window.gmClearCurrentRuntimeAuthorization():setGmAuthorized(false);setRuntimeGmFlag(false);return ok;}
 function installGmPasswordBridge(){
  const base=window.unlockGM;if(typeof base!=="function")return false;if(base.__gmRuntimeAuthorizationVersion===GM_AUTHORIZATION_VERSION)return true;
  const wrapped=function(){let before=false;try{before=state?.gm===true;}catch(_){ }const result=base.apply(this,arguments);let accepted=false;try{accepted=!before&&state?.gm===true;}catch(_){ }if(accepted)authorizeGmRuntime();return result;};
  wrapped.__gmRuntimeAuthorizationVersion=GM_AUTHORIZATION_VERSION;window.unlockGM=wrapped;return true;
 }
 window.addEventListener("civilization-auth-ready",()=>{restoreAuthorizedGmFlagEarly();if(gmAuthorized()&&window.CivilizationStartupCoordinator?.snapshot?.().status==="ready")ensureAuthorizedGmRuntime({retry:true}).catch(error=>console.error("[ScriptGroupLoader] account GM restore",error));});
 window.addEventListener("civilization-auth-signed-out",()=>{setRuntimeGmFlag(false);});
 function observeGmActivation(){const modal=document.getElementById("passwordModal");if(!modal||typeof MutationObserver!=="function")return;const activate=()=>{const className=String(modal.className||""),visible=className!=="modal"||modal.getAttribute("aria-hidden")==="false"||modal.style.display==="block";if(!visible)return;if(gmAuthorized())ensureAuthorizedGmRuntime({retry:true}).catch(error=>console.error("[ScriptGroupLoader] gm authorized retry",error));else loadGroup("gm").catch(error=>console.error("[ScriptGroupLoader] gm",error));};new MutationObserver(activate).observe(modal,{attributes:true,attributeFilter:["class","style","aria-hidden"]});activate();}
 async function loadDiagnostics(){try{await loadGroup("gm");}catch(error){console.error("[ScriptGroupLoader] gm",error);}try{await loadGroup("integrity");}catch(error){console.error("[ScriptGroupLoader] integrity",error);}}
 function refreshGmStartupSlot(){
  const slot=document.getElementById("gmStartupSlot");
  if(!slot)return false;
  let active=false;
  try{active=typeof state!=="undefined"&&state?.gm===true;}catch(_){}
  if(!active||typeof window.gmHtml!=="function")return false;
  slot.innerHTML=window.gmHtml();
  return true;
 }
 window.addEventListener("civilization-script-group-ready",event=>{
  if(event.detail?.group==="gm")refreshGmStartupSlot();
 });
 // Boot task is declared before backgroundpreload.js starts, so that an existing GM
 // session cannot outrun the startup readiness barrier.
 function accountSettled(){
  if(window.civilizationAuthSession?.user?.id)return Promise.resolve(true);
  return new Promise(resolve=>{
   let done=false;
   const settle=()=>{if(done)return;done=true;window.removeEventListener("civilization-auth-ready",settle);window.removeEventListener("civilization-auth-signed-out",settle);resolve(true);};
   window.addEventListener("civilization-auth-ready",settle);
   window.addEventListener("civilization-auth-signed-out",settle);
   if(window.civilizationAuthSession?.user?.id)settle();
  });
 }
 const bootTask=async()=>{
  await accountSettled();
  if(!gmAuthorized())return true;
  const ready=await ensureAuthorizedGmRuntime({retry:true,warm:true});
  if(!ready||snapshot().groups.gm.status!=="ready"||typeof window.gmHtml!=="function")throw new Error("startup-optional-scripts-not-ready");
  return true;
 };
 (window.CivilizationStartupPreTasks||(window.CivilizationStartupPreTasks=[])).push(["account-resources",bootTask]);
 function schedule(){restoreAuthorizedGmFlagEarly();if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",restoreAuthorizedGmFlagEarly,{once:true});const start=()=>setTimeout(()=>{restoreAuthorizedGmFlagEarly();installGmPasswordBridge();autoLoad();if(window.CivilizationStartupCoordinator?.snapshot?.().status==="ready")ensureAuthorizedGmRuntime();observeGmActivation();if(diagnosticsRequested())loadDiagnostics();},AUTO_START_DELAY_MS);if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();}

 const namespace=Object.freeze({version:VERSION,routingVersion:ROUTING_VERSION,activationPolicyVersion:ACTIVATION_POLICY_VERSION,loadBehaviorVersion:LOAD_BEHAVIOR_VERSION,gmAuthorizationVersion:GM_AUTHORIZATION_VERSION,gmEarlyRuntimeRestoreVersion:GM_EARLY_RUNTIME_RESTORE_VERSION,gmAuthorizedGroupRetryVersion:GM_AUTHORIZED_GROUP_RETRY_VERSION,ensure:loadGroup,restoreAuthorizedGmFlagEarly,ensureAuthorizedGmRuntime,authorizeGmRuntime,revokeGmRuntimeAuthorization,gmAuthorizationSnapshot,snapshot,activationSnapshot});
 window.CivilizationScriptLoader=namespace;window.SCRIPT_GROUP_LOADER_VERSION=VERSION;window.GM_RUNTIME_EARLY_RESTORE_VERSION=GM_EARLY_RUNTIME_RESTORE_VERSION;window.GM_AUTHORIZED_GROUP_RETRY_VERSION=GM_AUTHORIZED_GROUP_RETRY_VERSION;window.GM_STARTUP_REVALIDATION_VERSION=1;window.SCRIPT_GROUP_ACTIVATION_POLICY_VERSION=ACTIVATION_POLICY_VERSION;window.SCRIPT_GROUP_LOAD_BEHAVIOR_VERSION=LOAD_BEHAVIOR_VERSION;window.SCRIPT_GROUP_GLOBAL_API_CLEANUP_VERSION=GLOBAL_API_CLEANUP_VERSION;window.SCRIPT_GROUP_AUTHORIZED_GM_RESTORE_VERSION=2;window.GM_RUNTIME_AUTHORIZATION_VERSION=GM_AUTHORIZATION_VERSION;window.GM_RUNTIME_AUTHORIZATION_SCOPE="account-local-runtime";window.GM_SAVE_AUTHORIZATION_RETIRED_VERSION=1;window.GM_RUNTIME_SAVE_BOUNDARY_INSTALLED=typeof window.gmInstallRuntimeAuthorizationSaveBoundary==="function"?window.gmInstallRuntimeAuthorizationSaveBoundary():false;
 window.ensureCivilizationScriptGroup=loadGroup;window.civilizationScriptGroupSnapshot=snapshot;schedule();
})();