(function(){
 const CLOUD_SAVE_VERSION=1;
 const TABLE="game_saves";
 const LOCAL_META_KEY="civilization_frontline_local_save_meta_v1";
 const LOCAL_OWNER_KEY="civilization_frontline_local_owner_v1";
 let cloudMeta=null;
 let cloudBusy=false;
 let lastMetaUserId=null;
 let saveWrapped=false;

 window.CIVILIZATION_CLOUD_SAVE_VERSION=CLOUD_SAVE_VERSION;

 function auth(){return window.civilizationAuth||null;}
 function client(){return auth()?.getClient?.()||window.civilizationSupabase||null;}
 function user(){return auth()?.getUser?.()||null;}
 function cloneJson(value){try{return JSON.parse(JSON.stringify(value));}catch(e){return null;}}
 function n(value,fallback=0){const x=Number(value);return Number.isFinite(x)?Math.floor(x):fallback;}
 function formatTime(value){
  if(!value)return "尚無紀錄";
  const d=new Date(value);if(Number.isNaN(d.getTime()))return "時間未知";
  try{return d.toLocaleString("zh-TW",{year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false});}catch(e){return d.toLocaleString();}
 }
 function readLocalMeta(){
  try{const raw=localStorage.getItem(LOCAL_META_KEY);const x=raw?JSON.parse(raw):null;return x&&typeof x==="object"?x:null;}catch(e){return null;}
 }
 function writeLocalMeta(at=Date.now()){
  if(typeof state==="undefined"||!state)return;
  const row={updatedAt:new Date(at).toISOString(),level:n(state.level,1),exp:n(state.exp,0)};
  try{localStorage.setItem(LOCAL_META_KEY,JSON.stringify(row));}catch(e){}
 }
 function localOwner(){try{return localStorage.getItem(LOCAL_OWNER_KEY)||"";}catch(e){return "";}}
 function bindLocalOwner(userId){try{if(userId)localStorage.setItem(LOCAL_OWNER_KEY,userId);else localStorage.removeItem(LOCAL_OWNER_KEY);}catch(e){}}
 function ensureLocalIdentity(){
  const u=user();if(!u?.id)return;
  const owner=localOwner();
  if(!owner)bindLocalOwner(u.id);
  if(!readLocalMeta()&&typeof localStorage!=="undefined"&&localStorage.getItem(typeof SAVE_KEY!=="undefined"?SAVE_KEY:"frank_text_rpg_save"))writeLocalMeta();
 }
 function localSnapshot(){
  const meta=readLocalMeta();
  return {updatedAt:meta?.updatedAt||null,level:n(typeof state!=="undefined"?state?.level:meta?.level,1),exp:n(typeof state!=="undefined"?state?.exp:meta?.exp,0)};
 }
 function ownerMismatch(){const u=user(),owner=localOwner();return !!(u?.id&&owner&&owner!==u.id);}
 function rowHtml(label,row,emptyText){
  if(!row)return `<div class="cloud-save-column"><div class="cloud-save-title">${label}</div><div class="cloud-save-empty">${emptyText}</div></div>`;
  return `<div class="cloud-save-column"><div class="cloud-save-title">${label}</div><div class="cloud-save-line"><span>存檔時間</span><b>${formatTime(row.updatedAt||row.updated_at)}</b></div><div class="cloud-save-line"><span>等級</span><b>Lv.${n(row.level,1)}</b></div><div class="cloud-save-line"><span>EXP</span><b>${n(row.exp,0).toLocaleString()}</b></div></div>`;
 }
 function sectionHtml(){
  const local=localSnapshot();
  const mismatch=ownerMismatch();
  const cloud=cloudMeta===undefined?null:cloudMeta;
  const cloudEmpty=cloudMeta===undefined?"正在讀取雲端資訊…":"尚未建立雲端存檔";
  return `<section id="civilizationCloudSaveSettings" class="civilization-cloud-save-settings"><h3>雲端存檔</h3><div class="muted cloud-save-intro">雲端存檔只會在你按下按鈕時手動傳輸，不會自動同步。</div>${mismatch?`<div class="cloud-save-warning">這台裝置目前的本機存檔屬於另一個登入帳號。為避免誤覆蓋，暫時禁止上傳；你仍可下載目前帳號的雲端存檔來覆蓋本機。</div>`:""}<div class="cloud-save-compare">${rowHtml("本機存檔",local,"尚無本機存檔")}${rowHtml("雲端存檔",cloud,cloudEmpty)}</div><div id="civilizationCloudSaveStatus" class="cloud-save-status" hidden></div><div class="cloud-save-actions"><button id="civilizationCloudRefresh" type="button" class="btn" onclick="civilizationCloudRefresh()">重新整理雲端資訊</button><button id="civilizationCloudUpload" type="button" class="btn blue" onclick="civilizationCloudUpload()" ${mismatch?"disabled":""}>上傳本機存檔</button><button id="civilizationCloudDownload" type="button" class="btn primary" onclick="civilizationCloudDownload()" ${cloudMeta?"":"disabled"}>下載雲端存檔</button></div><div class="muted cloud-save-note">下載雲端存檔會覆蓋這台裝置目前的本機進度；下載時會重設離線計時起點，避免把跨裝置傳輸時間誤算成離線收益。</div></section>`;
 }
 function mount(){
  const account=document.getElementById("civilizationAccountSettings");
  if(!account||!user())return;
  let section=document.getElementById("civilizationCloudSaveSettings");
  const holder=document.createElement("div");holder.innerHTML=sectionHtml();const fresh=holder.firstElementChild;
  if(!fresh)return;
  if(section)section.replaceWith(fresh);else account.after(fresh);
  if(lastMetaUserId!==user().id){cloudMeta=undefined;lastMetaUserId=user().id;renderOnly();refreshMeta();}
 }
 function renderOnly(){
  const section=document.getElementById("civilizationCloudSaveSettings");if(!section)return;
  const holder=document.createElement("div");holder.innerHTML=sectionHtml();const fresh=holder.firstElementChild;if(fresh)section.replaceWith(fresh);
  setBusy(cloudBusy);
 }
 function setStatus(message,type="info"){
  const el=document.getElementById("civilizationCloudSaveStatus");if(!el)return;
  el.textContent=message||"";el.dataset.type=type;el.hidden=!message;
 }
 function setBusy(next){
  cloudBusy=!!next;
  ["civilizationCloudRefresh","civilizationCloudUpload","civilizationCloudDownload"].forEach(id=>{const el=document.getElementById(id);if(el)el.disabled=cloudBusy||(id==="civilizationCloudUpload"&&ownerMismatch())||(id==="civilizationCloudDownload"&&!cloudMeta);});
 }
 function errorText(error){
  const raw=String(error?.message||error||"").trim();
  if(!raw)return "雲端存檔操作失敗，請稍後再試。";
  if(raw.toLowerCase().includes("row-level security"))return "雲端存檔權限驗證失敗，請重新登入後再試。";
  return raw;
 }
 async function refreshMeta(){
  const c=client(),u=user();if(!c||!u)return;
  setBusy(true);setStatus("正在讀取雲端存檔資訊…");
  try{
   const {data,error}=await c.from(TABLE).select("updated_at,level,exp,revision").eq("user_id",u.id).maybeSingle();
   if(error)throw error;
   cloudMeta=data?{updated_at:data.updated_at,level:n(data.level,1),exp:n(data.exp,0),revision:n(data.revision,1)}:null;
   renderOnly();setStatus(cloudMeta?"雲端資訊已更新。":"目前尚未建立雲端存檔。","success");
  }catch(error){cloudMeta=null;renderOnly();setStatus(errorText(error),"error");}
  finally{setBusy(false);}
 }
 function confirmSummary(action,local,cloud){
  const cloudText=cloud?`${formatTime(cloud.updated_at)}／Lv.${n(cloud.level,1)}／EXP ${n(cloud.exp,0).toLocaleString()}`:"尚無雲端存檔";
  const localText=`${formatTime(local.updatedAt)}／Lv.${n(local.level,1)}／EXP ${n(local.exp,0).toLocaleString()}`;
  if(action==="upload")return `確定要把本機存檔上傳到雲端嗎？\n\n本機：${localText}\n雲端：${cloudText}\n\n${cloud?"上傳後會覆蓋目前雲端存檔。":"將建立第一份雲端存檔。"}`;
  return `確定要下載雲端存檔並覆蓋這台裝置嗎？\n\n本機：${localText}\n雲端：${cloudText}\n\n這台裝置目前的本機進度會被覆蓋。`;
 }
 async function upload(){
  const c=client(),u=user();if(!c||!u||cloudBusy)return;
  ensureLocalIdentity();
  if(ownerMismatch()){setStatus("這份本機存檔屬於另一個帳號，已禁止上傳以避免誤覆蓋。","error");return;}
  setBusy(true);setStatus("正在確認雲端資訊…");
  try{
   const {data:existing,error:metaError}=await c.from(TABLE).select("updated_at,level,exp,revision").eq("user_id",u.id).maybeSingle();
   if(metaError)throw metaError;
   cloudMeta=existing?{updated_at:existing.updated_at,level:n(existing.level,1),exp:n(existing.exp,0),revision:n(existing.revision,1)}:null;
   const local=localSnapshot();
   if(!confirm(confirmSummary("upload",local,cloudMeta))){renderOnly();return;}
   if(typeof save==="function"&&!save(false))throw new Error("本機存檔失敗，已取消上傳。");
   writeLocalMeta();
   const payload=cloneJson(state);if(!payload)throw new Error("本機存檔無法整理成雲端資料。");
   const updatedAt=new Date().toISOString();
   const row={user_id:u.id,save_data:payload,level:n(state.level,1),exp:n(state.exp,0),revision:cloudMeta?n(cloudMeta.revision,1)+1:1,updated_at:updatedAt};
   const {data,error}=await c.from(TABLE).upsert(row,{onConflict:"user_id"}).select("updated_at,level,exp,revision").single();
   if(error)throw error;
   cloudMeta={updated_at:data.updated_at,level:n(data.level,1),exp:n(data.exp,0),revision:n(data.revision,1)};
   renderOnly();setStatus("本機存檔已成功上傳到雲端。","success");
  }catch(error){renderOnly();setStatus(errorText(error),"error");}
  finally{setBusy(false);}
 }
 function prepareDownloadedState(raw){
  const next=cloneJson(raw);if(!next||typeof next!=="object")throw new Error("雲端存檔內容無效。");
  const now=Date.now();
  if(!next.offline||typeof next.offline!=="object")next.offline={};
  next.offline.lastSettledAt=now;
  next.offline.maxObservedWallClock=now;
  next.offline.timeLockUntil=0;
  delete next.offline.pendingSettlement;
  return next;
 }
 async function download(){
  const c=client(),u=user();if(!c||!u||cloudBusy)return;
  setBusy(true);setStatus("正在讀取雲端存檔…");
  try{
   const {data,error}=await c.from(TABLE).select("save_data,updated_at,level,exp,revision").eq("user_id",u.id).maybeSingle();
   if(error)throw error;
   if(!data?.save_data){cloudMeta=null;renderOnly();setStatus("目前沒有可下載的雲端存檔。","error");return;}
   cloudMeta={updated_at:data.updated_at,level:n(data.level,1),exp:n(data.exp,0),revision:n(data.revision,1)};
   const local=localSnapshot();
   if(!confirm(confirmSummary("download",local,cloudMeta))){renderOnly();return;}
   const previous=cloneJson(state);
   try{
    state=prepareDownloadedState(data.save_data);
    if(typeof normalizeCurrentSaveState==="function")normalizeCurrentSaveState();
    bindLocalOwner(u.id);
    if(typeof save==="function"&&!save(false))throw new Error("下載後寫入本機存檔失敗。");
    writeLocalMeta();
   }catch(applyError){if(previous)state=previous;throw applyError;}
   setStatus("雲端存檔已下載完成，正在重新載入遊戲…","success");
   setTimeout(()=>location.reload(),250);
  }catch(error){renderOnly();setStatus(errorText(error),"error");setBusy(false);}
 }
 function installSaveWrapper(){
  if(saveWrapped||typeof window.save!=="function")return;
  const base=window.save;
  const wrapped=function(show=true){const ok=base(show);if(ok)writeLocalMeta();return ok;};
  window.save=wrapped;try{save=wrapped;}catch(e){}
  saveWrapped=true;
 }
 function initialize(){
  installSaveWrapper();ensureLocalIdentity();
  window.civilizationCloudSave={version:CLOUD_SAVE_VERSION,mount,refreshMeta,upload,download,localSnapshot,getCloudMeta:()=>cloudMeta};
  window.civilizationCloudRefresh=refreshMeta;
  window.civilizationCloudUpload=upload;
  window.civilizationCloudDownload=download;
  mount();
  window.addEventListener("civilization-auth-ready",()=>{ensureLocalIdentity();mount();});
 }
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",initialize,{once:true});else initialize();
})();