(function(){
 const errors=[];
 const fail=(code,message,data=null)=>errors.push({code,message,data});
 const required=[
  "beginCivilizationCalamityRun",
  "runCivilizationCalamitySingle",
  "fightNextCivilizationCalamityBattle",
  "runCivilizationCalamityContinuous",
  "requestCivilizationCalamityContinuousStop",
  "getCivilizationCalamityRunSnapshot",
  "stopCivilizationCalamityRunForPageHide"
 ];
 required.forEach(name=>{if(typeof window[name]!=="function")fail("CALAMITY_RUN_API",`${name} 未載入`);});
 if(Number(window.CALAMITY_RUN_VERSION)!==1)fail("CALAMITY_RUN_VERSION","文明災厄 runtime 應為 V1",window.CALAMITY_RUN_VERSION);
 if(Number(window.CALAMITY_CONTINUOUS_RULE_VERSION)!==1)fail("CALAMITY_CONTINUOUS_RULE_VERSION","文明災厄連續討伐規則版本應為 1",window.CALAMITY_CONTINUOUS_RULE_VERSION);
 if(Number(window.CALAMITY_CONTINUOUS_GAP_MS)!==350)fail("CALAMITY_CONTINUOUS_GAP","文明災厄場間節奏應對齊目前虛空 UI 的 350ms",window.CALAMITY_CONTINUOUS_GAP_MS);
 try{
  const snapshot=typeof window.getCivilizationCalamityRunSnapshot==="function"?window.getCivilizationCalamityRunSnapshot():null;
  if(snapshot!==null)fail("CALAMITY_RUN_BOOT_STATE","頁面載入時不應從 save 恢復文明災厄連戰",snapshot);
  const invalid=typeof window.beginCivilizationCalamityRun==="function"?window.beginCivilizationCalamityRun("__integrity_invalid__","continuous"):null;
  if(invalid?.ok!==false||invalid?.reason!=="unknown-calamity")fail("CALAMITY_RUN_INVALID_ID","未知災厄不得建立 runtime run",invalid);
  const stop=typeof window.requestCivilizationCalamityContinuousStop==="function"?window.requestCivilizationCalamityContinuousStop():null;
  if(stop?.ok!==false||stop?.reason!=="no-active-run")fail("CALAMITY_RUN_IDLE_STOP","無 active run 時停止 API 應安全拒絕",stop);
 }catch(error){fail("CALAMITY_RUN_PROBE","文明災厄 runtime 無副作用 probe 失敗",String(error?.message||error));}
 const persisted=state?.calamities;
 if(persisted&&["active","mode","battleCount","wins","losses","stopRequested","endedReason","lastBattle"].some(key=>Object.prototype.hasOwnProperty.call(persisted,key)))fail("CALAMITY_RUN_PERSISTED","連續討伐 runtime 狀態不得寫入 state.calamities",persisted);
 const report={passed:errors.length===0,errors,checkedAt:Date.now()};
 window.CALAMITY_RUN_INTEGRITY=report;
 if(errors.length)console.error("[文明戰線] Civilization Calamity run integrity error",errors);
})();