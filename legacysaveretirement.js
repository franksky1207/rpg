(function(){
 const VERSION=1;
 window.LEGACY_FILE_SAVE_RETIRED_VERSION=VERSION;

 function stripLegacyControls(html){
  try{
   const tpl=document.createElement("template");
   tpl.innerHTML=String(html||"");
   const exportBtn=tpl.content.querySelector('[onclick="exportSave()"]');
   const importInput=tpl.content.querySelector('input[onchange="importSave(event)"]');
   const controls=exportBtn?.closest(".controls")||importInput?.closest(".controls");
   if(controls)controls.remove();
   return tpl.innerHTML;
  }catch(e){return html;}
 }

 function install(){
  const base=window.settingsPage;
  if(typeof base!=="function"||base.__legacySaveRetired)return;
  const wrapped=function(...args){return stripLegacyControls(base.apply(this,args));};
  wrapped.__legacySaveRetired=true;
  window.settingsPage=wrapped;
  try{settingsPage=wrapped;}catch(e){}

  const retired=function(){alert("舊式檔案匯入／匯出已停用，請改用設定中的雲端存檔功能。");};
  window.exportSave=retired;
  window.importSave=retired;
  try{exportSave=retired;importSave=retired;}catch(e){}
 }

 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",install,{once:true});else install();
})();