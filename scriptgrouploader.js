(function(){
 const VERSION=1;
 const ROUTING_VERSION=1;
 const ACTIVATION_POLICY_VERSION=2;
 const LOAD_BEHAVIOR_VERSION=3;
 const GLOBAL_API_CLEANUP_VERSION=1;
 const GROUP_ORDER=Object.freeze(["story","gm","integrity"]);
 const AUTO_GROUPS=Object.freeze(["story"]);
 const AUTO_START_DELAY_MS=120;
 const groupPromises=new Map();
 const groupReports=new Map();

 function declaredNodes(){return Array.from(document.querySelectorAll('script[type="application/x-civilization-deferred"][data-load-group][data-src]'));}
 function effectiveGroup(node){
  const declared=String(node?.dataset?.loadGroup||"").trim().toLowerCase(),src=String(node?.dataset?.src||"").split("?")[0].toLowerCase();
  if(src==="storyruntimeintegrity.js")return "integrity";
  return declared;
 }
 function declarations(group){return declaredNodes().filter(node=>effectiveGroup(node)===group);}
 function report(group,status,extra={}){
  const row=Object.freeze({version:VERSION,group,status,...extra});
  groupReports.set(group,row);
  return row;
 }
 function loadOne(node){
  return new Promise((resolve,reject)=>{
   if(node.dataset.loaded==="1")return resolve(node.dataset.src||"");
   const script=document.createElement("script");
   Array.from(node.attributes).forEach(attr=>{
    if(["type","data-src","data-load-group"].includes(attr.name))return;
    script.setAttribute(attr.name,attr.value);
   });
   script.src=node.dataset.src;
   script.async=false;
   script.dataset.loadGroup=effectiveGroup(node);
   script.onload=()=>{node.dataset.loaded="1";resolve(script.src);};
   script.onerror=()=>reject(new Error(`script-group-load-failed:${node.dataset.src||"unknown"}`));
   node.after(script);
  });
 }
 async function loadGroup(group){
  const key=String(group||"").trim().toLowerCase();
  if(!GROUP_ORDER.includes(key))throw new Error(`unknown-script-group:${key||"empty"}`);
  if(groupPromises.has(key))return groupPromises.get(key);
  const nodes=declarations(key),startedAt=Date.now();
  report(key,"loading",{count:nodes.length,startedAt});
  const promise=(async()=>{
   const loaded=[];
   for(const node of nodes)loaded.push(await loadOne(node));
   const done=report(key,"ready",{count:nodes.length,loaded:loaded.length,startedAt,completedAt:Date.now()});
   try{window.dispatchEvent(new CustomEvent("civilization-script-group-ready",{detail:done}));}catch(_){ }
   return done;
  })().catch(error=>{
   const failed=report(key,"failed",{count:nodes.length,startedAt,completedAt:Date.now(),error:String(error?.message||error)});
   try{window.dispatchEvent(new CustomEvent("civilization-script-group-failed",{detail:failed}));}catch(_){ }
   throw error;
  });
  groupPromises.set(key,promise);
  return promise;
 }
 function savedGmAuthorized(){
  try{return typeof state!=="undefined"&&state&&state.gm===true;}catch(_){return false;}
 }
 function activationSnapshot(){
  return Object.freeze({
   version:ACTIVATION_POLICY_VERSION,
   behaviorVersion:LOAD_BEHAVIOR_VERSION,
   story:"post-load-sequenced",
   gm:"authorized-save-or-password-modal-on-demand",
   integrity:"diagnostics-explicit-only",
   autoGroups:Array.from(AUTO_GROUPS),
   savedGmAuthorized:savedGmAuthorized()
  });
 }
 function snapshot(){
  const groups={};
  GROUP_ORDER.forEach(group=>{groups[group]=groupReports.get(group)||Object.freeze({version:VERSION,group,status:"pending",count:declarations(group).length});});
  return Object.freeze({version:VERSION,routingVersion:ROUTING_VERSION,order:Array.from(GROUP_ORDER),autoGroups:Array.from(AUTO_GROUPS),activation:activationSnapshot(),groups:Object.freeze(groups),storyRuntimeIntegrityGroup:"integrity"});
 }
 async function autoLoad(){
  for(const group of AUTO_GROUPS){
   try{await loadGroup(group);}catch(error){console.error(`[ScriptGroupLoader] ${group}`,error);}
  }
 }
 function diagnosticsRequested(){
  try{
   const params=new URLSearchParams(location.search||"");
   if(params.get("production")==="1")return false;
   const explicit=params.get("integrity")==="1"||params.get("diagnostics")==="1";
   const local=location.hostname==="127.0.0.1"||location.hostname==="localhost";
   return explicit||local;
  }catch(_){return false;}
 }
 function ensureAuthorizedGmRuntime(){
  if(!savedGmAuthorized())return Promise.resolve(false);
  return loadGroup("gm").then(()=>true).catch(error=>{console.error("[ScriptGroupLoader] gm authorized restore",error);return false;});
 }
 function observeGmActivation(){
  const modal=document.getElementById("passwordModal");
  if(!modal||typeof MutationObserver!=="function")return;
  const activate=()=>{
   const className=String(modal.className||"");
   const visible=className!=="modal"||modal.getAttribute("aria-hidden")==="false"||modal.style.display==="block";
   if(visible)loadGroup("gm").catch(error=>console.error("[ScriptGroupLoader] gm",error));
  };
  new MutationObserver(activate).observe(modal,{attributes:true,attributeFilter:["class","style","aria-hidden"]});
  activate();
 }
 async function loadDiagnostics(){
  try{await loadGroup("gm");}catch(error){console.error("[ScriptGroupLoader] gm",error);}
  try{await loadGroup("integrity");}catch(error){console.error("[ScriptGroupLoader] integrity",error);}
 }
 function schedule(){
  const start=()=>setTimeout(()=>{
   autoLoad();
   ensureAuthorizedGmRuntime();
   observeGmActivation();
   if(diagnosticsRequested())loadDiagnostics();
  },AUTO_START_DELAY_MS);
  if(document.readyState==="complete")start();else window.addEventListener("load",start,{once:true});
 }

 const namespace=Object.freeze({
  version:VERSION,
  routingVersion:ROUTING_VERSION,
  activationPolicyVersion:ACTIVATION_POLICY_VERSION,
  loadBehaviorVersion:LOAD_BEHAVIOR_VERSION,
  ensure:loadGroup,
  ensureAuthorizedGmRuntime,
  snapshot,
  activationSnapshot
 });
 window.CivilizationScriptLoader=namespace;
 window.SCRIPT_GROUP_LOADER_VERSION=VERSION;
 window.SCRIPT_GROUP_ACTIVATION_POLICY_VERSION=ACTIVATION_POLICY_VERSION;
 window.SCRIPT_GROUP_LOAD_BEHAVIOR_VERSION=LOAD_BEHAVIOR_VERSION;
 window.SCRIPT_GROUP_GLOBAL_API_CLEANUP_VERSION=GLOBAL_API_CLEANUP_VERSION;
 window.SCRIPT_GROUP_AUTHORIZED_GM_RESTORE_VERSION=1;
 // Compatibility aliases retained for existing diagnostics/tests; new consumers use CivilizationScriptLoader.
 window.ensureCivilizationScriptGroup=loadGroup;
 window.civilizationScriptGroupSnapshot=snapshot;
 schedule();
})();