(function(){
 const VERSION=2;
 window.ACCOUNT_CLOUD_INTEGRITY_VERSION=VERSION;
 function run(){
  const issues=[];
  if(Number(window.CIVILIZATION_AUTH_VERSION||0)<4)issues.push("auth-version");
  if(Number(window.CIVILIZATION_CLOUD_SAVE_VERSION||0)<2)issues.push("cloud-save-version");
  if(Number(window.LEGACY_FILE_SAVE_RETIRED_VERSION||0)<1)issues.push("legacy-save-retirement");
  if(Number(window.CLOUD_SAVE_GUIDE_VERSION||0)<2)issues.push("cloud-save-guide");
  if(typeof window.civilizationCloudUpload!=="function")issues.push("cloud-upload-api");
  if(typeof window.civilizationCloudDownload!=="function")issues.push("cloud-download-api");
  if(typeof window.civilizationAccountLogout!=="function")issues.push("logout-api");
  const auth=window.civilizationAuth;
  if(!auth||typeof auth.getUser!=="function"||typeof auth.signOut!=="function")issues.push("auth-api");
  const report={version:VERSION,ok:issues.length===0,issues};
  window.ACCOUNT_CLOUD_INTEGRITY_REPORT=report;
  if(!report.ok)console.error("Account/cloud integrity check failed",report);
  return report;
 }
 window.runAccountCloudIntegrity=run;
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>setTimeout(run,0),{once:true});else setTimeout(run,0);
})();