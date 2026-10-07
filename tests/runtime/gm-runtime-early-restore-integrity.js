const fs=require("fs");
const vm=require("vm");
function assert(condition,message){if(!condition)throw new Error(message);}
const source=fs.readFileSync("scriptgrouploader.js","utf8");

assert(/GM_EARLY_RUNTIME_RESTORE_VERSION=1/.test(source),"GM early runtime restore version must be V1.");
assert(/function restoreAuthorizedGmFlagEarly\(\)\{if\(!gmAuthorized\(\)\)return false;return setRuntimeGmFlag\(true\);\}/.test(source),"Authorized GM runtime must have an early restore owner.");
assert(/const restored=restoreAuthorizedGmFlagEarly\(\),allowRetry=options\.retry!==false/.test(source),"Authorized GM restore must set runtime before deferred GM group loading.");
assert(/GM_AUTHORIZED_GROUP_RETRY_VERSION=1/.test(source),"Authorized GM group retry must be versioned.");
assert(/await new Promise\(resolve=>setTimeout\(resolve,250\)\)/.test(source),"Authorized GM group load failure must schedule one bounded retry.");
assert(/catch\(retryError\)\{console\.error\("\[ScriptGroupLoader\] gm authorized retry",retryError\);return restored;\}/.test(source),"Retry failure must preserve the already-restored runtime authorization.");
assert(/function schedule\(\)\{restoreAuthorizedGmFlagEarly\(\);/.test(source),"Early GM restore must run immediately when scriptgrouploader executes.");
assert(/GM_RUNTIME_SAVE_BOUNDARY_INSTALLED=installSaveBoundary\(\)/.test(source),"GM runtime authorization must remain excluded from formal saves.");

function runtimeContext(authorized){
 const storage=new Map(authorized?[["civilization-war-gm-authorized-v1","1"]]:[]);
 const state={gm:false};
 const listeners={};
 const window={
  addEventListener:(name,fn)=>{listeners[name]=fn;},
  dispatchEvent:()=>true
 };
 const document={
  readyState:"loading",
  querySelectorAll:()=>[],
  getElementById:()=>null,
  addEventListener:(name,fn)=>{listeners["document:"+name]=fn;}
 };
 const context={
  window,document,state,
  localStorage:{
   getItem:key=>storage.has(key)?storage.get(key):null,
   setItem:(key,value)=>storage.set(key,String(value)),
   removeItem:key=>storage.delete(key)
  },
  location:{search:"",hostname:"example.test"},
  CustomEvent:function(name,options){this.type=name;this.detail=options?.detail;},
  MutationObserver:function(){this.observe=()=>{};},
  setTimeout:()=>0,
  console,
  Promise,
  Map,
  Object,
  Array,
  String,
  Date,
  URLSearchParams
 };
 vm.createContext(context);
 vm.runInContext(source,context,{filename:"scriptgrouploader.js"});
 return {context,state,window,storage,listeners};
}

const authorized=runtimeContext(true);
assert(authorized.state.gm===true,"Existing browser-local GM authorization must restore state.gm immediately, before window load or GM group completion.");
assert(authorized.window.GM_RUNTIME_EARLY_RESTORE_VERSION===1,"Runtime must expose early restore version V1.");
assert(authorized.window.CivilizationScriptLoader?.gmAuthorizationSnapshot().authorized===true,"Authorization snapshot must remain authoritative from localStorage.");

const unauthorized=runtimeContext(false);
assert(unauthorized.state.gm===false,"Without browser-local authorization, early restore must fail closed.");
assert(unauthorized.window.CivilizationScriptLoader?.gmAuthorizationSnapshot().authorized===false,"Unauthorized browser must remain unauthorized.");

console.log("GM runtime early restore integrity passed");
