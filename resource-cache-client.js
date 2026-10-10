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
  return true;
 }catch(error){console.warn("[文明戰線] 資源快取不可用，改用一般網路載入",error);return false;}
}
function humanBytes(bytes){if(!Number.isFinite(bytes)||bytes<0)return "無法計算";if(bytes<1024)return bytes+" B";if(bytes<1048576)return (bytes/1024).toFixed(1)+" KB";return (bytes/1048576).toFixed(1)+" MB";}
async function updateSettingsStatus(){
 const target=document.getElementById("localResourceCacheStatus");
 if(!target)return;
 const result=await status();
 if(!target.isConnected)return;
 target.textContent=result.ok?("已儲存 "+result.entries+" 個資源，約 "+humanBytes(result.bytes)):("快取狀態無法讀取"+(SUPPORTED?"":"（瀏覽器不支援）"));
}
async function clearWithConfirmation(){
 if(!confirm("確定清除已下載的遊戲資源？角色進度、帳號資料與 GM 設定不會刪除。下次進入遊戲將重新下載必要資源。"))return false;
 const result=await clear();
 alert(result.ok?"已清除遊戲資源快取。下次進入時將重新下載需要的資源。":"目前無法清除遊戲資源，請稍後再試。");
 await updateSettingsStatus();
 return result.ok===true;
}
function clear(){return message("CIV_CACHE_CLEAR");}
function status(){return message("CIV_CACHE_STATUS");}
function refresh(){return message("CIV_CACHE_REFRESH");}
g.CivilizationResourceCache=Object.freeze({version:2,register,clear,status,refresh,updateSettingsStatus,clearWithConfirmation});
if(document.readyState==="complete")setTimeout(register,0);
else g.addEventListener("load",()=>setTimeout(register,0),{once:true});
})(window);
