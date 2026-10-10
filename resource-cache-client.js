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
  return true;
 }catch(error){console.warn("[文明戰線] 資源快取不可用，改用一般網路載入",error);return false;}
}
function clear(){return message("CIV_CACHE_CLEAR");}
function status(){return message("CIV_CACHE_STATUS");}
function refresh(){return message("CIV_CACHE_REFRESH");}
g.CivilizationResourceCache=Object.freeze({version:1,register,clear,status,refresh});
if(document.readyState==="complete")setTimeout(register,0);
else g.addEventListener("load",()=>setTimeout(register,0),{once:true});
})(window);
