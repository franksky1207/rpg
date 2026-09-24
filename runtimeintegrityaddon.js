(function(){
 const VERSION=1;
 const report=window.PROJECT_RUNTIME_REPORT;
 const bounty=window.BOUNTY_NAME_POOL_INTEGRITY;
 if(report&&Array.isArray(report.errors)){
  const already=report.errors.some(row=>row?.code==="BOUNTY_NAME_POOL_INTEGRITY");
  if(!already&&(Number(window.BOUNTY_NAME_POOL_INTEGRITY_VERSION)!==1||bounty?.passed!==true)){
   report.errors.push({code:"BOUNTY_NAME_POOL_INTEGRITY",message:"銀河／宇宙懸賞名稱池完整性未通過",data:bounty?.errors||null});
  }
  report.passed=report.errors.length===0;
  report.clean=report.errors.length===0&&(!Array.isArray(report.warnings)||report.warnings.length===0);
 }
 window.RUNTIME_INTEGRITY_ADDON_VERSION=VERSION;
 window.RUNTIME_INTEGRITY_BOUNTY_NAMES_VERSION=1;
})();
