(function(){
  const report=typeof validateWorldMapRegistration==="function"
    ?validateWorldMapRegistration()
    :{passed:false,errors:[{code:"REGISTRY_VALIDATOR_MISSING",message:"validateWorldMapRegistration 未載入"}]};
  window.WORLD_MAP_REGISTRATION_REPORT=report;
  if(!report.passed)console.error("[文明戰線] 世界地圖註冊錯誤",report.errors);
})();
