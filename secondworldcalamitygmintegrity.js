(function(){
 const errors=[];
 const fail=(code,message,data=null)=>errors.push({code,message,data});
 if(Number(window.GM_SECOND_WORLD_CALAMITY_VERSION)!==1)fail("GM_VERSION","宇宙文明災厄 GM owner 應為 V1",window.GM_SECOND_WORLD_CALAMITY_VERSION);
 if(Number(window.GM_SECOND_WORLD_CALAMITY_FORMAL_VERSION)!==1)fail("FORMAL_VERSION","正式管理 owner 應為 V1",window.GM_SECOND_WORLD_CALAMITY_FORMAL_VERSION);
 if(Number(window.GM_SECOND_WORLD_CALAMITY_TEST_VERSION)!==1)fail("TEST_VERSION","沙盒測試 owner 應為 V1",window.GM_SECOND_WORLD_CALAMITY_TEST_VERSION);
 if(Number(window.GM_POWER_BENCHMARK_CALAMITY_VERSION)!==1)fail("BENCHMARK_VERSION","災厄 Benchmark owner 應為 V1",window.GM_POWER_BENCHMARK_CALAMITY_VERSION);
 const required=[
  "gmSecondWorldCalamityManagementHtml","gmApplySecondWorldCalamityFormal","gmSecondWorldCalamitySetFullHp",
  "gmSecondWorldCalamitySetNearDeath","gmSecondWorldCalamityResetSelected","gmSyncCivilizationFromCalamities",
  "gmSecondWorldCalamityTestHtml","gmSecondWorldCalamitySingleTest","gmSecondWorldCalamityFullKillTest",
  "runGmSecondWorldCalamitySimulation","runGmSecondWorldCalamityFullKill","runGmSecondWorldCalamityBenchmark",
  "gmSecondWorldCalamityBenchmarkHtml","gmPowerBenchmarkRunCalamity"
 ];
 required.forEach(name=>{if(typeof window[name]!=="function")fail("API_MISSING",name+" 未載入");});
 try{
  const defs=typeof window.getSecondWorldCalamityDefinitions==="function"?window.getSecondWorldCalamityDefinitions():[];
  if(defs.length!==10)fail("DATA_COUNT","GM 應對齊 10 隻宇宙文明災厄",defs.length);
  if(typeof window.gmHubRegisteredSectionIds==="function"){
   const manage=window.gmHubRegisteredSectionIds("manage"),test=window.gmHubRegisteredSectionIds("test");
   if(!manage.includes("second-world-calamity-manage"))fail("HUB_MANAGE","GM Hub 缺少宇宙文明災厄管理 section",manage);
   if(!test.includes("second-world-calamity-test"))fail("HUB_TEST","GM Hub 缺少宇宙文明災厄測試 section",test);
  }
 }catch(error){fail("REGISTRY_PROBE","GM registry probe 失敗",String(error?.message||error));}
 try{
  const src=Function.prototype.toString.call(window.runGmSecondWorldCalamitySimulation);
  if(!/buildSecondWorldCalamityEnemy/.test(src)||!/runCombatCore/.test(src))fail("FORMAL_COMBAT_REUSE","GM 沙盒必須重用正式災厄敵人與 Combat Core",src);
 }catch(error){fail("SOURCE_PROBE","GM source probe 失敗",String(error?.message||error));}
 const report={passed:errors.length===0,errors,checkedAt:Date.now()};
 window.GM_SECOND_WORLD_CALAMITY_INTEGRITY_VERSION=1;
 window.GM_SECOND_WORLD_CALAMITY_INTEGRITY=report;
 if(errors.length)console.error("[文明戰線] Second World Calamity GM integrity error",errors);
})();