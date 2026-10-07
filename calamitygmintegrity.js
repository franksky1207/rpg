(function(){
 const errors=[];
 function fail(code,message,data){errors.push({code:code,message:message,data:data==null?null:data});}
 const required=[
  "gmTestMarkLabel","refreshGmMarkTestControls","gmSetTestMarkLevelUi",
  "gmMarkManagementHtml","gmApplyFormalMarks","gmMarkTestHtml","gmFormalMarkMinimum",
  "gmCalamityTestHtml","gmCalamitySingle","gmCalamityFullKill",
  "runGmCalamitySingleSimulation","runGmCalamityFullKillSimulation"
 ];
 required.forEach(function(name){if(typeof window[name]!=="function")fail("GM_CALAMITY_API",name+" 未載入");});
 if(Number(window.GM_CALAMITY_TEST_VERSION)!==1)fail("GM_CALAMITY_TEST_VERSION","文明災厄 GM 測試版本應為 1",window.GM_CALAMITY_TEST_VERSION);
 if(Number(window.GM_MARK_MANAGEMENT_VERSION)!==2)fail("GM_MARK_MANAGEMENT_VERSION","GM 印記管理版本應為 2",window.GM_MARK_MANAGEMENT_VERSION);
 if(Number(window.GM_MARK_FORMAL_PHASE_LOCK_VERSION)!==1)fail("GM_MARK_FORMAL_PHASE_LOCK_VERSION","GM 正式印記紀元鎖定應為 V1",window.GM_MARK_FORMAL_PHASE_LOCK_VERSION);
 if(Number(window.GM_MARK_CONFIG_OWNER_VERSION)!==1)fail("GM_MARK_CONFIG_OWNER_VERSION","GM 印記工具應直接使用統一災厄設定",window.GM_MARK_CONFIG_OWNER_VERSION);
 if(Number(window.GM_CALAMITY_FULL_KILL_SAFETY_LIMIT)!==100000)fail("GM_CALAMITY_SAFETY_LIMIT","完整擊殺安全上限應為 100000",window.GM_CALAMITY_FULL_KILL_SAFETY_LIMIT);
 if(Number(window.GM_CALAMITY_TEST_CONTEXT_SNAPSHOT_VERSION)!==1||Number(window.GM_CALAMITY_TEST_STALE_RESULT_GUARD_VERSION)!==1)fail("GM_CALAMITY_TEST_CONTEXT","銀河災厄 GM 結果必須保存測試 context 並防止設定變更後回填舊結果",{context:window.GM_CALAMITY_TEST_CONTEXT_SNAPSHOT_VERSION,stale:window.GM_CALAMITY_TEST_STALE_RESULT_GUARD_VERSION});
 if(Number(window.GM_TEST_CONTEXT_OWNER_VERSION)!==1||typeof window.gmTestContextSnapshot!=="function"||typeof window.gmTestContextRevision!=="function")fail("GM_TEST_CONTEXT_OWNER","GM 測試 context owner 未完整載入",{version:window.GM_TEST_CONTEXT_OWNER_VERSION,snapshot:typeof window.gmTestContextSnapshot,revision:typeof window.gmTestContextRevision});
 try{
  const galaxy={secondWorld:{entered:false},thirdWorld:{entered:false}},universe={secondWorld:{entered:true},thirdWorld:{entered:false}},higher={secondWorld:{entered:true},thirdWorld:{entered:true}};
  if(window.gmFormalMarkMinimum?.(galaxy)!==0)fail("GM_MARK_GALAXY_MIN","銀河紀元正式印記最低等級應為 0",window.gmFormalMarkMinimum?.(galaxy));
  if(window.gmFormalMarkMinimum?.(universe)!==10)fail("GM_MARK_UNIVERSE_MIN","宇宙紀元正式印記必須鎖定 Lv.10",window.gmFormalMarkMinimum?.(universe));
  if(window.gmFormalMarkMinimum?.(higher)!==10)fail("GM_MARK_HIGHER_MIN","高維紀元正式印記必須鎖定 Lv.10",window.gmFormalMarkMinimum?.(higher));
  const manage=String(window.gmMarkManagementHtml?window.gmMarkManagementHtml():"");
  const currentMin=window.gmFormalMarkMinimum?.();
  if(currentMin>=10){if(!manage.includes("固定為 Lv.10")||!manage.includes("disabled"))fail("GM_MARK_MANAGE_LOCKED","宇宙／高維正式印記管理應顯示鎖定 Lv.10",manage.slice(0,800));}
  else if(!manage.includes("未取得")||!manage.includes("Lv.0")||!manage.includes("Lv.10"))fail("GM_MARK_MANAGE_OPTIONS","銀河紀元正式印記管理需提供未取得、Lv.0 與 Lv.10",manage.slice(0,800));
  const test=String(window.gmMarkTestHtml?window.gmMarkTestHtml():"");
  if(!test.includes("Lv.0")||!test.includes("Lv.10"))fail("GM_MARK_TEST_OPTIONS","印記測試需提供 Lv.0～Lv.10",test.slice(0,500));
  if(test.includes('<option value="none"'))fail("GM_MARK_TEST_UNACQUIRED","印記測試不應提供未取得選項；Lv.0 即為零效果");
  const calamity=String(window.gmCalamityTestHtml?window.gmCalamityTestHtml():"");
  if(!calamity.includes("單次挑戰模擬")||!calamity.includes("完整擊殺模擬"))fail("GM_CALAMITY_ACTIONS","文明災厄 GM 測試缺少兩種正式模擬",calamity.slice(0,800));
  ["解鎖災厄","設定災厄 HP","瀕死","近死","擊殺數"].forEach(function(text){if(calamity.includes(text))fail("GM_CALAMITY_FORBIDDEN_CONTROL","文明災厄 GM 不應提供「"+text+"」作弊控制");});
  if(!calamity.includes("VIP／專精／強化／印記"))fail("GM_CALAMITY_CAPABILITY_NOTE","文明災厄 GM 測試應明示統一能力快照");
 }catch(error){fail("GM_CALAMITY_RENDER_PROBE","GM 災厄／印記 renderer 檢查失敗",String(error&&error.message||error));}
 const report={passed:errors.length===0,errors:errors,checkedAt:Date.now()};
 window.CALAMITY_GM_INTEGRITY=report;
 if(errors.length)console.error("[文明戰線] Calamity GM integrity error",errors);
})();
