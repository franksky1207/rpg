(function(){
 const VERSION=4;
 window.ACCOUNT_CLOUD_INTEGRITY_VERSION=VERSION;
 function run(){
  const issues=[];
  if(Number(window.CIVILIZATION_AUTH_VERSION||0)<5)issues.push("auth-version");
  if(Number(window.CIVILIZATION_CLOUD_SAVE_VERSION||0)<2)issues.push("cloud-save-version");
  if(Number(window.CLOUD_SAVE_GUIDE_VERSION||0)<2)issues.push("cloud-save-guide");
  if(typeof window.civilizationCloudUpload!=="function")issues.push("cloud-upload-api");
  if(typeof window.civilizationCloudDownload!=="function")issues.push("cloud-download-api");
  if(typeof window.civilizationAccountLogout!=="function")issues.push("logout-api");
  if(typeof window.civilizationForgotPassword!=="function")issues.push("forgot-password-ui");
  const auth=window.civilizationAuth;
  if(!auth||typeof auth.getUser!=="function"||typeof auth.signOut!=="function")issues.push("auth-api");
  if(!auth||typeof auth.sendPasswordReset!=="function"||typeof auth.updateRecoveredPassword!=="function")issues.push("password-recovery-api");
  if(typeof window.exportSave==="function"||typeof window.importSave==="function")issues.push("legacy-file-save-api-present");
  if(typeof window.settingsPage==="function"){
   const source=String(window.settingsPage);
   if(source.includes("exportSave")||source.includes("importSave")||source.includes("匯出存檔")||source.includes("匯入存檔"))issues.push("legacy-file-save-ui-present");
  }
  const report={version:VERSION,ok:issues.length===0,issues};
  window.ACCOUNT_CLOUD_INTEGRITY_REPORT=report;
  if(!report.ok)console.error("Account/cloud integrity check failed",report);
  return report;
 }
 window.runAccountCloudIntegrity=run;
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>setTimeout(run,0),{once:true});else setTimeout(run,0);
})();