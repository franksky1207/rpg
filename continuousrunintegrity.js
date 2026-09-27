(function(){
 const VERSION=1;
 const SHARED_INFRA_VERSION=1;
 function freeze(value){return Object.freeze(value);}
 function sourceOf(fn){try{return Function.prototype.toString.call(fn);}catch(_){return "";}}
 function run(){
  const errors=[];
  const fail=(code,detail=null)=>errors.push({code,detail});
  if(Number(window.CONTINUOUS_RUN_INFRA_VERSION)!==SHARED_INFRA_VERSION||window.CONTINUOUS_RUN_INFRA_INTEGRITY?.passed!==true||typeof window.createContinuousRunInfrastructure!=="function")fail("SHARED_INFRA_OWNER",{version:window.CONTINUOUS_RUN_INFRA_VERSION,integrity:window.CONTINUOUS_RUN_INFRA_INTEGRITY||null,api:typeof window.createContinuousRunInfrastructure});
  if(Number(window.CALAMITY_SHARED_CONTINUOUS_INFRA_VERSION)!==SHARED_INFRA_VERSION)fail("GALAXY_SHARED_INFRA",window.CALAMITY_SHARED_CONTINUOUS_INFRA_VERSION);
  if(Number(window.SECOND_WORLD_CALAMITY_SHARED_CONTINUOUS_INFRA_VERSION)!==SHARED_INFRA_VERSION)fail("UNIVERSE_SHARED_INFRA",window.SECOND_WORLD_CALAMITY_SHARED_CONTINUOUS_INFRA_VERSION);
  if(Number(window.THIRD_WORLD_RUN_SHARED_CONTINUOUS_INFRA_VERSION)!==SHARED_INFRA_VERSION)fail("HIGHER_DIMENSIONAL_SHARED_INFRA",window.THIRD_WORLD_RUN_SHARED_CONTINUOUS_INFRA_VERSION);
  if(window.CALAMITY_RUN_INTEGRITY?.passed!==true)fail("GALAXY_RUN_INTEGRITY",window.CALAMITY_RUN_INTEGRITY||null);
  if(window.SECOND_WORLD_CALAMITY_UI_INTEGRITY?.passed!==true)fail("UNIVERSE_UI_INTEGRITY",window.SECOND_WORLD_CALAMITY_UI_INTEGRITY||null);
  if(window.THIRD_WORLD_RUN_INTEGRITY?.passed!==true)fail("HIGHER_DIMENSIONAL_RUN_INTEGRITY",window.THIRD_WORLD_RUN_INTEGRITY||null);
  if(window.THIRD_WORLD_CORE_INTEGRITY?.passed!==true)fail("HIGHER_DIMENSIONAL_CORE_INTEGRITY",window.THIRD_WORLD_CORE_INTEGRITY||null);
  const required=[
   "backgroundProgressStart","backgroundProgressStop","backgroundProgressFastCatchUpActive","backgroundProgressCatchUpPolicy","backgroundProgressCatchUpStep","backgroundProgressCatchUpFinalPolicy","backgroundProgressConsumeCatchUpCredit","backgroundProgressUiYield","backgroundProgressOnPageHide",
   "beginCivilizationCalamityRun","runCivilizationCalamityContinuous","requestCivilizationCalamityContinuousStop","getCivilizationCalamityRunSnapshot",
   "beginSecondWorldCalamityRun","runSecondWorldCalamityContinuous","requestSecondWorldCalamityStop","getSecondWorldCalamityRunSnapshot",
   "startThirdWorldContinuousRun","runThirdWorldContinuousLoop","stopThirdWorldContinuousRun","thirdWorldContinuousRunSnapshot"
  ];
  required.forEach(name=>{if(typeof window[name]!=="function")fail("RUN_API_MISSING",name);});
  const galaxySource=sourceOf(window.runCivilizationCalamityContinuous),universeSource=sourceOf(window.runSecondWorldCalamityContinuous),higherSource=sourceOf(window.runThirdWorldContinuousLoop);
  if(!/catchUpPreviewPolicy/.test(galaxySource)||!/fastCatchUp/.test(galaxySource))fail("GALAXY_SHARED_FAST_CATCH_UP_WIRING");
  if(!/catchUpPreviewPolicy/.test(universeSource)||!/fastCatchUp/.test(universeSource))fail("UNIVERSE_SHARED_FAST_CATCH_UP_WIRING");
  if(!/fastCatchUpActive/.test(higherSource)||!/catchUpStep/.test(higherSource)||!/catchUpFinal/.test(higherSource))fail("HIGHER_DIMENSIONAL_SHARED_FAST_CATCH_UP_WIRING");
  const galaxyState=typeof state!=="undefined"?state?.calamities:null;
  if(galaxyState&&["active","mode","battleCount","wins","losses","stopRequested","endedReason","lastBattle"].some(key=>Object.prototype.hasOwnProperty.call(galaxyState,key)))fail("GALAXY_TRANSIENT_PERSISTENCE_LEAK",galaxyState);
  const universeRows=Array.isArray(state?.secondWorld?.calamities)?state.secondWorld.calamities:[];
  if(universeRows.some(row=>row&&["active","mode","battleCount","wins","losses","stopRequested","reason","lastBattle"].some(key=>Object.prototype.hasOwnProperty.call(row,key))))fail("UNIVERSE_TRANSIENT_PERSISTENCE_LEAK");
  const persistent=Array.from(window.THIRD_WORLD_PERSISTENT_KEYS||[]);
  if(["deaths","suppression","run","targetBossIndex","pendingEvents","recentBattles","lastBattleSummary","coreLevelAtStart","perDeathSuppressionPointsAtStart"].some(key=>persistent.includes(key)))fail("HIGHER_DIMENSIONAL_TRANSIENT_PERSISTENCE_LEAK",persistent);
  const higher=typeof window.thirdWorldContinuousRunSnapshot==="function"?window.thirdWorldContinuousRunSnapshot():null;
  if(higher?.active===true)fail("HIGHER_DIMENSIONAL_BOOT_RUNTIME_ACTIVE",higher);
  if(Number(window.THIRD_WORLD_RUN_EVENT_PAUSE_VERSION)!==0||Number(window.THIRD_WORLD_RUN_EVENT_TERMINAL_VERSION)!==1)fail("HIGHER_DIMENSIONAL_PROGRESS_EVENT_TERMINAL",{pause:window.THIRD_WORLD_RUN_EVENT_PAUSE_VERSION,terminal:window.THIRD_WORLD_RUN_EVENT_TERMINAL_VERSION});
  if(Number(window.THIRD_WORLD_RUN_CORE_SNAPSHOT_VERSION)!==1||Number(window.THIRD_WORLD_RUN_HP_LIFECYCLE_VERSION)!==1)fail("HIGHER_DIMENSIONAL_RUN_SNAPSHOT_CONTRACT",{core:window.THIRD_WORLD_RUN_CORE_SNAPSHOT_VERSION,hp:window.THIRD_WORLD_RUN_HP_LIFECYCLE_VERSION});
  return freeze({version:VERSION,sharedInfraVersion:SHARED_INFRA_VERSION,passed:errors.length===0,errors:freeze(errors.slice()),checkedAt:Date.now()});
 }
 window.CONTINUOUS_RUN_CROSS_ERA_INTEGRITY_VERSION=VERSION;
 window.runContinuousRunCrossEraIntegrity=run;
 window.CONTINUOUS_RUN_CROSS_ERA_INTEGRITY=run();
 if(!window.CONTINUOUS_RUN_CROSS_ERA_INTEGRITY.passed)console.error("[文明戰線] Cross-era continuous run integrity error",window.CONTINUOUS_RUN_CROSS_ERA_INTEGRITY.errors);
})();
