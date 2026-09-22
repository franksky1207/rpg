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
  "stopCivilizationCalamityRunForPageHide",
  "civilizationCalamityBackgroundEnabled"
 ];
 required.forEach(name=>{if(typeof window[name]!=="function")fail("CALAMITY_RUN_API",`${name} 未載入`);});
 if(Number(window.CALAMITY_RUN_VERSION)!==1)fail("CALAMITY_RUN_VERSION","文明災厄 runtime 應為 V1",window.CALAMITY_RUN_VERSION);
 if(Number(window.CALAMITY_CONTINUOUS_RULE_VERSION)!==5||Number(window.CALAMITY_MAXED_MARK_CONTINUOUS_STOP_VERSION)!==1)fail("CALAMITY_CONTINUOUS_RULE_VERSION","文明災厄連續討伐應為 V5，印記滿級後當場停止",{rules:window.CALAMITY_CONTINUOUS_RULE_VERSION,maxedStop:window.CALAMITY_MAXED_MARK_CONTINUOUS_STOP_VERSION});
 if(Number(window.CALAMITY_HP_RESTORE_OWNER_VERSION)!==1)fail("CALAMITY_HP_RESTORE_OWNER","災厄每場戰後回滿 HP 應由 Calamity Core settlement 單一管理",window.CALAMITY_HP_RESTORE_OWNER_VERSION);
 if(Number(window.CALAMITY_FAST_CATCH_UP_POLICY_VERSION)!==1||Number(window.BACKGROUND_PROGRESS_FAST_CATCH_UP_POLICY_VERSION)!==1)fail("CALAMITY_FAST_CATCH_UP_POLICY","文明災厄應接入共用 Fast Catch-up Policy V1",{calamity:window.CALAMITY_FAST_CATCH_UP_POLICY_VERSION,owner:window.BACKGROUND_PROGRESS_FAST_CATCH_UP_POLICY_VERSION});
 const continuousSource=(()=>{try{return Function.prototype.toString.call(window.runCivilizationCalamityContinuous);}catch(e){return "";}})();
 const fightSource=(()=>{try{return Function.prototype.toString.call(window.fightNextCivilizationCalamityBattle);}catch(e){return "";}})();
 if(!/catchUpPreviewPolicy/.test(continuousSource)||!/shouldCheckpoint/.test(continuousSource)||!/save:fast/.test(continuousSource))fail("CALAMITY_FAST_CATCH_UP_SAVE_WIRING","文明災厄 catch-up 應由共用 policy 決定批次 checkpoint",continuousSource);
 if(!/options\.save!==false/.test(fightSource))fail("CALAMITY_FAST_CATCH_UP_SAVE_OPTION","災厄 fightNext 應允許 catch-up 關閉逐場 save",fightSource);
 if(!/markMaxed/.test(fightSource)||!/mark-maxed/.test(fightSource))fail("CALAMITY_MAXED_MARK_STOP_WIRING","災厄連戰應在印記滿級的該場戰鬥後停止",fightSource);
 if(typeof window.backgroundProgressConsumeCatchUpCredit!=="function")fail("CALAMITY_FAST_CATCH_UP_CREDIT_API","缺少共用 catch-up credit consume API");
 try{
  const snapshot=typeof window.getCivilizationCalamityRunSnapshot==="function"?window.getCivilizationCalamityRunSnapshot():null;
  if(snapshot!==null)fail("CALAMITY_RUN_BOOT_STATE","頁面載入時不應從 save 恢復文明災厄連戰",snapshot);
  const invalid=typeof window.beginCivilizationCalamityRun==="function"?window.beginCivilizationCalamityRun("__integrity_invalid__","continuous"):null;
  if(invalid?.ok!==false||invalid?.reason!=="unknown-calamity")fail("CALAMITY_RUN_INVALID_ID","未知災厄不得建立 runtime run",invalid);
  const stop=typeof window.requestCivilizationCalamityContinuousStop==="function"?window.requestCivilizationCalamityContinuousStop():null;
  if(stop?.ok!==false||stop?.reason!=="no-active-run")fail("CALAMITY_RUN_IDLE_STOP","無 active run 時停止 API 應安全拒絕",stop);
  if(typeof window.gmBackgroundBattleEnabled==="function"&&typeof window.civilizationCalamityBackgroundEnabled==="function"&&window.civilizationCalamityBackgroundEnabled()!==window.gmBackgroundBattleEnabled())fail("CALAMITY_BACKGROUND_GM_GATE","文明災厄背景戰鬥應直接共用 GM 背景戰鬥開關");
 }catch(error){fail("CALAMITY_RUN_PROBE","文明災厄 runtime 無副作用 probe 失敗",String(error?.message||error));}
 const persisted=state?.calamities;
 if(persisted&&["active","mode","battleCount","wins","losses","stopRequested","endedReason","lastBattle"].some(key=>Object.prototype.hasOwnProperty.call(persisted,key)))fail("CALAMITY_RUN_PERSISTED","連續討伐 runtime 狀態不得寫入 state.calamities",persisted);
 const report={passed:errors.length===0,errors,checkedAt:Date.now()};
 window.CALAMITY_RUN_INTEGRITY=report;
 if(errors.length)console.error("[文明戰線] Civilization Calamity run integrity error",errors);
})();