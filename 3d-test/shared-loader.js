/* T1-B: one per-document module loader; existing HTTP/SW and GLB caches remain owners. */
(function(global){
"use strict";
if(global.Civilization3DLoader)return;
const base=new URL("../",document.currentScript.src);
const entries={
 engine:["vendor/babylonjs/7.54.3/babylon.js",""],
 scenes:["3d-test/prototype-engine.js","20261011-b28c-ruins-v1"],
 runtime:["3d-test/runtime.js","20261011-b27-player-v1"],
 appearance:["3d-test/appearance-snapshot.js","20261011-b28c-ruins-v1"]
};
const jobs=new Map();
let resourceVersionPromise=null,sharedWarmPromise=null,prefetchScheduled=false;
function failure(code,message){const error=new Error(message);error.code=code;return error;}
function ready(kind){
 switch(kind){
 case "engine":return typeof global.BABYLON?.Engine==="function"&&typeof global.BABYLON?.Scene==="function";
 case "scenes":return typeof global.Civilization3DPrototype?.supported==="function"&&typeof global.Civilization3DPrototype?.mount==="function";
 case "runtime":return typeof global.Civilization3DRuntime?.create==="function";
 case "appearance":return typeof global.Civilization3DAppearance?.capture==="function"&&typeof global.Civilization3DAppearance?.scene==="function";
 default:throw failure("unknown-module","未知 3D 模組："+kind);
 }
}
function resolveSceneResources(){
 if(!resourceVersionPromise)resourceVersionPromise=fetch(new URL("resource-manifest.json",base).href,{cache:"no-store",credentials:"same-origin"})
 .then(response=>{if(!response.ok)throw Error("manifest-unavailable");return response.json();})
 .then(manifest=>{if(manifest?.schema!==1||!manifest.files||typeof manifest.files!=="object")throw Error("invalid-resource-manifest");return manifest.files;})
 .catch(error=>{resourceVersionPromise=null;console.warn("3D manifest fallback",String(error.message));return {};});
 return resourceVersionPromise.then(files=>Object.fromEntries(Object.entries(entries).map(([kind,[path,token]])=>{
  const url=new URL(path,base),digest=files[path];
  if(typeof digest==="string"&&/^[a-f0-9]{24}$/.test(digest))url.searchParams.set("asset",digest);
  else if(token)url.searchParams.set("v",token);
  return [kind,url.href];
 })));
}
function ensure(kind){
 if(ready(kind))return Promise.resolve();
 if(jobs.has(kind))return jobs.get(kind);
 const job=resolveSceneResources().then(urls=>new Promise((resolve,reject)=>{
  // A concurrent owner may have completed this API while the manifest was pending.
  if(ready(kind)){resolve();return;}
  const el=document.createElement("script");el.src=urls[kind];
  const clear=()=>{el.onload=null;el.onerror=null;};
  el.onload=()=>{clear();if(ready(kind))resolve();else{el.remove();reject(failure("module-api-missing","3D 模組 API 不完整："+kind));}};
  el.onerror=()=>{clear();el.remove();reject(failure("module-load-failed","3D 模組載入失敗："+kind));};
  document.head.appendChild(el);
 })).catch(error=>{resourceVersionPromise=null;throw error;}).finally(()=>{if(jobs.get(kind)===job)jobs.delete(kind);});
 jobs.set(kind,job);return job;
}
async function load(){
 // Scene registration is independent of Babylon, but construction only follows validated APIs.
 const results=await Promise.allSettled(["engine","scenes","runtime","appearance"].map(ensure));
 const rejected=results.find(result=>result.status==="rejected");
 if(rejected)throw rejected.reason;
}
function requireFactory(factory){
 if(typeof factory!=="function")throw failure("scene-capability-missing","此預覽場景目前無法使用。");
 return factory;
}
function warmShared3dAssets(){
 if(!sharedWarmPromise)sharedWarmPromise=resolveSceneResources().then(async urls=>{
  const sources=[urls.engine,urls.scenes];
  await Promise.all(sources.map(async src=>{const response=await fetch(src,{cache:"no-cache",credentials:"same-origin"});if(!response.ok)throw failure("warm-failed","3D 預熱失敗");await response.arrayBuffer();}));
  return sources;
 }).catch(error=>{sharedWarmPromise=null;throw error;});
 return sharedWarmPromise;
}
function schedulePrefetch(){
 if(prefetchScheduled||global.CivilizationPresentationMode?.shouldWarm3DAtStartup?.()!==true)return;
 prefetchScheduled=true;
 const run=async()=>{const urls=await resolveSceneResources();for(const src of Object.values(urls)){
  if(Array.from(document.querySelectorAll("link[data-civilization-3d-prefetch]")).some(link=>link.href===src))continue;
  const link=document.createElement("link");link.rel="prefetch";link.as="script";link.href=src;link.dataset.civilization3dPrefetch=src;document.head.appendChild(link);
 }};
 const schedule=()=>setTimeout(()=>run().catch(error=>console.warn("3D prefetch",error.message)),150);
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",schedule,{once:true});else schedule();
}
global.Civilization3DLoader=Object.freeze({version:1,load,ensure,ready,requireFactory,resolveSceneResources,warmShared3dAssets,schedulePrefetch});
global.Civilization3DSharedAssetWarm=warmShared3dAssets;
})(window);
