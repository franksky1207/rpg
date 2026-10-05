(function(){
 const VERSION=1;
 const GROUP_ORDER=Object.freeze(["story","gm","integrity"]);
 const AUTO_START_DELAY_MS=120;
 const groupPromises=new Map();
 const groupReports=new Map();

 function declarations(group){
  return Array.from(document.querySelectorAll(`script[type="application/x-civilization-deferred"][data-load-group="${group}"][data-src]`));
 }
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
   script.dataset.loadGroup=node.dataset.loadGroup||"";
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
 function snapshot(){
  const groups={};
  GROUP_ORDER.forEach(group=>{groups[group]=groupReports.get(group)||Object.freeze({version:VERSION,group,status:"pending",count:declarations(group).length});});
  return Object.freeze({version:VERSION,order:Array.from(GROUP_ORDER),groups:Object.freeze(groups)});
 }
 async function autoLoad(){
  for(const group of GROUP_ORDER){
   try{await loadGroup(group);}catch(error){console.error(`[ScriptGroupLoader] ${group}`,error);}
  }
 }
 function schedule(){
  const start=()=>setTimeout(()=>autoLoad(),AUTO_START_DELAY_MS);
  if(document.readyState==="complete")start();else window.addEventListener("load",start,{once:true});
 }

 window.SCRIPT_GROUP_LOADER_VERSION=VERSION;
 window.SCRIPT_GROUP_AUTO_START_DELAY_MS=AUTO_START_DELAY_MS;
 window.ensureCivilizationScriptGroup=loadGroup;
 window.civilizationScriptGroupSnapshot=snapshot;
 schedule();
})();