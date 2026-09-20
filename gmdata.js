(function(){
 const VERSION=1;

 function isObject(value){return !!value&&typeof value==="object"&&!Array.isArray(value);}
 function cloneJson(value){try{return JSON.parse(JSON.stringify(value));}catch(_){return null;}}
 function pad2(value){return String(value).padStart(2,"0");}
 function exportFileName(now=new Date()){
  return `rpg-${now.getFullYear()}${pad2(now.getMonth()+1)}${pad2(now.getDate())}-${pad2(now.getHours())}${pad2(now.getMinutes())}.json`;
 }
 function assertGm(){if(state?.gm===true)return true;alert("此功能只能在 GM 管理模式使用。");return false;}
 function currentSchemaVersion(){return Math.max(1,Math.floor(Number(window.SAVE_SCHEMA_VERSION)||Number(state?.saveVersion)||1));}

 function validateRawSave(raw){
  if(!isObject(raw))throw new Error("JSON 根資料必須是物件。");
  const version=Math.floor(Number(raw.saveVersion));
  if(!Number.isFinite(version)||version<1)throw new Error("缺少有效的 saveVersion。");
  if(version>currentSchemaVersion())throw new Error(`此存檔版本（${version}）高於目前遊戲版本（${currentSchemaVersion()}），無法安全匯入。`);
  if(!Number.isFinite(Number(raw.level)))throw new Error("缺少有效的角色等級。");
  if(!isObject(raw.equipment))throw new Error("缺少有效的裝備資料。");
  if(!Array.isArray(raw.inventory))throw new Error("缺少有效的背包資料。");
  if(!Array.isArray(raw.mapProgress))throw new Error("缺少有效的地圖進度資料。");
  return version;
 }
 function normalizeImportedSave(raw){
  const source=cloneJson(raw);
  if(!source)throw new Error("無法複製匯入資料。");
  const version=validateRawSave(source);
  if(typeof window.migrateSave!=="function")throw new Error("正式存檔 migration 尚未載入。");
  const previousReport=window.LAST_SAVE_MIGRATION_REPORT;
  let normalized;
  try{
   normalized=window.migrateSave(source,version,typeof window.normalizeSaveState==="function"?window.normalizeSaveState:null,raw);
  }finally{
   window.LAST_SAVE_MIGRATION_REPORT=previousReport;
  }
  if(!isObject(normalized))throw new Error("存檔正規化失敗。");
  if(Math.floor(Number(normalized.saveVersion))!==currentSchemaVersion())throw new Error("存檔版本正規化失敗。");
  if(!Number.isFinite(Number(normalized.level))||!isObject(normalized.equipment)||!Array.isArray(normalized.inventory)||!Array.isArray(normalized.mapProgress))throw new Error("正規化後的存檔結構不完整。");

  const now=Date.now();
  if(!isObject(normalized.offline))normalized.offline={};
  normalized.offline.lastSettledAt=now;
  normalized.offline.maxObservedWallClock=now;
  normalized.offline.timeLockUntil=0;
  delete normalized.offline.pendingSettlement;
  delete normalized.offline.checkpointId;
  return normalized;
 }
 function summaryText(save){
  const name=String(save?.playerName||"玩家");
  const level=Math.max(1,Math.floor(Number(save?.level)||1));
  const vip=Math.max(0,Math.floor(Number(save?.vipLevel)||0));
  const version=Math.max(1,Math.floor(Number(save?.saveVersion)||1));
  return `玩家：${name}\n等級：Lv.${level}\nVIP：${vip}\n存檔版本：${version}`;
 }

 function managementHtml(){
  return `<div class="muted gm-hub-note">供 GM 測試快速備份與切換本機遊戲進度。只處理《文明戰線》正式存檔，不包含帳號登入、Supabase session 或其他瀏覽器資料。</div><div class="controls"><button class="btn blue" onclick="gmExportSaveJson()">匯出 JSON</button><button class="btn" onclick="gmChooseImportSaveJson()">匯入 JSON</button><input id="gmSaveJsonFile" type="file" accept=".json,application/json" hidden onchange="gmImportSaveJsonFile(this)"></div><div class="muted" style="margin-top:10px">匯入會先驗證並使用正式 migration／normalization；確認後才覆蓋目前本機存檔，並重新整理頁面。匯入後不會把檔案保存期間計入離線收益。</div>`;
 }

 window.gmExportSaveJson=function(){
  if(!assertGm())return false;
  if(typeof save==="function"&&save(false)===false){alert("目前存檔無法寫入，已取消匯出。");return false;}
  const snapshot=cloneJson(state);
  if(!snapshot){alert("目前存檔無法轉成 JSON。");return false;}
  snapshot.saveVersion=currentSchemaVersion();
  let json="";
  try{json=JSON.stringify(snapshot,null,2);}catch(error){alert(`匯出失敗：${String(error?.message||error)}`);return false;}
  try{
   const blob=new Blob([json],{type:"application/json;charset=utf-8"});
   const url=URL.createObjectURL(blob);
   const link=document.createElement("a");
   link.href=url;link.download=exportFileName();link.style.display="none";
   document.body.appendChild(link);link.click();link.remove();
   setTimeout(()=>URL.revokeObjectURL(url),1000);
   return true;
  }catch(error){alert(`匯出失敗：${String(error?.message||error)}`);return false;}
 };
 window.gmChooseImportSaveJson=function(){
  if(!assertGm())return false;
  const input=document.getElementById("gmSaveJsonFile");
  if(!input)return false;
  input.value="";
  input.click();
  return true;
 };
 window.gmImportSaveJsonFile=async function(input){
  if(!assertGm())return false;
  const file=input?.files?.[0];
  if(!file)return false;
  let rawText="",raw=null,normalized=null;
  try{
   rawText=await file.text();
   raw=JSON.parse(rawText);
   normalized=normalizeImportedSave(raw);
  }catch(error){
   if(input)input.value="";
   alert(`匯入失敗：${String(error?.message||error)}\n\n目前存檔沒有變更。`);
   return false;
  }

  const ok=confirm(`準備匯入以下資料：\n\n${summaryText(normalized)}\n\n這會覆蓋目前本機遊戲進度。確定要繼續嗎？`);
  if(!ok){if(input)input.value="";return false;}

  const nextRaw=JSON.stringify(normalized);
  let previousRaw=null,hadPrevious=false;
  try{
   previousRaw=localStorage.getItem(SAVE_KEY);
   hadPrevious=previousRaw!==null;
   localStorage.setItem(SAVE_KEY,nextRaw);
   if(localStorage.getItem(SAVE_KEY)!==nextRaw)throw new Error("寫入後驗證失敗。");
  }catch(error){
   try{if(hadPrevious)localStorage.setItem(SAVE_KEY,previousRaw);else localStorage.removeItem(SAVE_KEY);}catch(_){}
   if(input)input.value="";
   alert(`匯入失敗：${String(error?.message||error)}\n\n已保留原本存檔。`);
   return false;
  }

  if(input)input.value="";
  alert("匯入完成。頁面將重新整理並載入這份測試資料。");
  location.reload();
  return true;
 };

 window.GM_DATA_MANAGEMENT_VERSION=VERSION;
 window.gmDataManagementHtml=managementHtml;
 window.gmValidateImportedSave=function(raw){try{return {ok:true,save:normalizeImportedSave(raw)};}catch(error){return {ok:false,error:String(error?.message||error)};}};
 window.gmDataExportFileName=exportFileName;

 if(typeof window.registerGmHubSection==="function")window.registerGmHubSection("manage","資料管理",managementHtml,{id:"gm-data-management",position:"prepend"});
})();