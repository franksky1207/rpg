/* Civilization cache client: optional enhancement, never blocks game startup. */
(function(g){"use strict";
const SUPPORTED=typeof navigator!=="undefined"&&"serviceWorker" in navigator&&location.protocol==="https:";
let registration=null;
function message(type){
 return new Promise(async resolve=>{
  try{
   if(!SUPPORTED)return resolve({ok:false,reason:"unsupported"});
   const reg=registration||await navigator.serviceWorker.ready;
   const worker=navigator.serviceWorker.controller||reg.active;
   if(!worker)return resolve({ok:false,reason:"not-active"});
   const channel=new MessageChannel();
   const timeout=setTimeout(()=>{channel.port1.close();resolve({ok:false,reason:"timeout"});},12000);
   channel.port1.onmessage=e=>{clearTimeout(timeout);channel.port1.close();resolve(e.data||{ok:false});};
   worker.postMessage({type},[channel.port2]);
  }catch(error){resolve({ok:false,reason:String(error?.message||error)});}
 });
}
async function register(){
 if(!SUPPORTED)return false;
 try{
  registration=await navigator.serviceWorker.register("resource-cache-sw.js",{scope:"./",updateViaCache:"none"});
  updateSettingsStatus().catch(()=>{});
  setTimeout(()=>startBackgroundPreload().catch(()=>{}),1200);
  return true;
 }catch(error){console.warn("[文明戰線] 資源快取不可用，改用一般網路載入",error);return false;}
}
const VERSION_KEY="civilization.resource.versions.checked.v1";
let startupChanges=null, pendingVersionFiles=null;
async function checkStartupVersions(){
 const report={ok:false,changed:0,firstVisit:false};
 try{
  const response=await fetch("resource-manifest.json",{cache:"no-store",credentials:"same-origin"});
  if(!response.ok)throw Error("version-check-failed");
  const next=await response.json();
  if(next.schema!==1||next.algorithm!=="sha256-96"||!next.files||typeof next.files!=="object")throw Error("version-list-invalid");
  const now=next.files;
  let previous=null;
  try{previous=JSON.parse(localStorage.getItem(VERSION_KEY)||"null");}catch(_){}
  if(!previous||typeof previous!=="object"||Array.isArray(previous)){
   report.firstVisit=true;
  }else{
   report.changed=Object.keys(now).filter(k=>previous[k]!==now[k]).length+Object.keys(previous).filter(k=>!(k in now)).length;
  }
  // Keep the new snapshot pending until startup prerequisites actually succeed.
  pendingVersionFiles=now;
  report.ok=true;
 }catch(error){report.error=String(error?.message||error);}
 startupChanges=Object.freeze(report);
 return startupChanges;
}
function versionReport(){return startupChanges;}
function finishStartupVersionCheck(){if(!startupChanges?.ok||!pendingVersionFiles)return false;try{localStorage.setItem(VERSION_KEY,JSON.stringify(pendingVersionFiles));pendingVersionFiles=null;return true;}catch(_){return false;}}
let preloading=false;
async function readDirectCacheStatus(){
 if(!("caches" in g))return {ok:false};
 try{
  const cache=await caches.open("civilization-resource-v1-media");
  const keys=await cache.keys();
  let bytes=0;
  for(const key of keys){
   const response=await cache.match(key);
   if(response){try{bytes+=(await response.blob()).size;}catch(_){}}
  }
  return {ok:true,entries:keys.length,bytes};
 }catch(_){return {ok:false};}
}
async function startBackgroundPreload(){
 if(preloading||!SUPPORTED)return false;
 preloading=true;
 try{
  const reg=registration||await navigator.serviceWorker.ready;
  const worker=navigator.serviceWorker.controller||reg.active;
  if(!worker){preloading=false;return false;}
  const port=new MessageChannel();
  port.port1.onmessage=event=>{
   const info=event.data||{};
   if(info.phase==="progress"||info.phase==="complete")updateSettingsStatus().catch(()=>{});
   if(info.phase==="complete"||info.phase==="error"){preloading=false;port.port1.close();}
  };
  worker.postMessage({type:"CIV_CACHE_PRELOAD"},[port.port2]);
  return true;
 }catch(_){preloading=false;return false;}
}
function humanBytes(bytes){if(!Number.isFinite(bytes)||bytes<0)return "無法計算";if(bytes<1024)return bytes+" B";if(bytes<1048576)return (bytes/1024).toFixed(1)+" KB";return (bytes/1048576).toFixed(1)+" MB";}
async function updateSettingsStatus(){
 const target=document.getElementById("localResourceCacheStatus");
 if(!target)return;
 const result=await readDirectCacheStatus();
 if(!target.isConnected)return;
 target.textContent=result.ok?("已儲存 "+result.entries+" 個資源，約 "+humanBytes(result.bytes)+(preloading?"（正在背景下載）":"")):("快取狀態無法讀取"+(SUPPORTED?"":"（瀏覽器不支援）"));
}
async function clearWithConfirmation(){
 if(!confirm("確定清除已下載的遊戲資源？角色進度、帳號資料與 GM 設定不會刪除。下次進入遊戲將重新下載必要資源。"))return false;
 const result=await clear();
 alert(result.ok?"已清除遊戲資源快取。下次進入時將重新下載需要的資源。":"目前無法清除遊戲資源，請稍後再試。");
 await updateSettingsStatus();
 return result.ok===true;
}
function clear(){return message("CIV_CACHE_CLEAR");}
function status(){return readDirectCacheStatus();}
function refresh(){return message("CIV_CACHE_REFRESH");}
g.CivilizationResourceCache=Object.freeze({version:2,register,clear,status,refresh,updateSettingsStatus,clearWithConfirmation,checkStartupVersions,versionReport,finishStartupVersionCheck,startBackgroundPreload});
if(document.readyState==="complete")setTimeout(register,0);
else g.addEventListener("load",()=>setTimeout(register,0),{once:true});
})(window);
