(function(){
 const VERSION=3;
 const SHARED_INFRA_VERSION=1;
 const STOP_REASON_VERSION=2;
 const GLOBAL_MUTEX_VERSION=1;
 const STRICT_INFRA_VERSION=1;
 function freeze(value){return Object.freeze(value);}
 function sourceOf(fn){try{return Function.prototype.toString.call(fn);}catch(_){return "";}}
 function run(){
  const errors=[];
  const fail=(code,detail=null)=>errors.push({code,detail});
  if(Number(window.CONTINUOUS_RUN_INFRA_VERSION)!==SHARED_INFRA_VERSION||window.CONTINUOUS_RUN_INFRA_INTEGRITY?.passed!==true||typeof window.createContinuousRunInfrastructure!=="function")fail("SHARED_INFRA_OWNER",{version:window.CONTINUOUS_RUN_INFRA_VERSION,integrity:window.CONTINUOUS_RUN_INFRA_INTEGRITY||null,api:typeof window.createContinuousRunInfrastructure});
  if(Number(window.CONTINUOUS_RUN_STOP_REASON_SEMANTICS_VERSION)!==STOP_REASON_VERSION)fail("STOP_REASON_SEMANTICS_VERSION",window.CONTINUOUS_RUN_STOP_REASON_SEMANTICS_VERSION);
  if(Number(window.CALAMITY_SHARED_CONTINUOUS_INFRA_VERSION)!==SHARED_INFRA_VERSION)fail("GALAXY_SHARED_INFRA",window.CALAMITY_SHARED_CONTINUOUS_INFRA_VERSION);
  if(Number(window.SECOND_WORLD_CALAMITY_SHARED_CONTINUOUS_INFRA_VERSION)!==SHARED_INFRA_VERSION)fail("UNIVERSE_SHARED_INFRA",window.SECOND_WORLD_CALAMITY_SHARED_CONTINUOUS_INFRA_VERSION);
  if(Number(window.THIRD_WORLD_RUN_SHARED_CONTINUOUS_INFRA_VERSION)!==SHARED_INFRA_VERSION)fail("HIGHER_DIMENSIONAL_SHARED_INFRA",window.THIRD_WORLD_RUN_SHARED_CONTINUOUS_INFRA_VERSION);
  if(Number(window.CALAMITY_SHARED_INFRA_STRICT_VERSION)!==STRICT_INFRA_VERSION||Number(window.SECOND_WORLD_CALAMITY_SHARED_INFRA_STRICT_VERSION)!==STRICT_INFRA_VERSION||Number(window.THIRD_WORLD_RUN_SHARED_INFRA_STRICT_VERSION)!==STRICT_INFRA_VERSION)fail("THREE_ERA_STRICT_SHARED_INFRA",{galaxy:window.CALAMITY_SHARED_INFRA_STRICT_VERSION,universe:window.SECOND_WORLD_CALAMITY_SHARED_INFRA_STRICT_VERSION,higher:window.THIRD_WORLD_RUN_SHARED_INFRA_STRICT_VERSION});
  if(Number(window.CALAMITY_MANUAL_STOP_TERMINAL_VERSION)!==2||Number(window.SECOND_WORLD_CALAMITY_MANUAL_STOP_TERMINAL_VERSION)!==1)fail("MANUAL_STOP_TERMINAL_POLICY",{galaxy:window.CALAMITY_MANUAL_STOP_TERMINAL_VERSION,universe:window.SECOND_WORLD_CALAMITY_MANUAL_STOP_TERMINAL_VERSION});
  if(Number(window.CALAMITY_GLOBAL_RUN_MUTEX_VERSION)!==GLOBAL_MUTEX_VERSION)fail("GALAXY_GLOBAL_MUTEX_VERSION",window.CALAMITY_GLOBAL_RUN_MUTEX_VERSION);
  if(Number(window.SECOND_WORLD_CALAMITY_GLOBAL_RUN_MUTEX_VERSION)!==GLOBAL_MUTEX_VERSION)fail("UNIVERSE_GLOBAL_MUTEX_VERSION",window.SECOND_WORLD_CALAMITY_GLOBAL_RUN_MUTEX_VERSION);
  if(String(window.CALAMITY_RUN_BLOCKER_NAME||"")!=="galaxy-calamity-run"||String(window.SECOND_WORLD_CALAMITY_RUN_BLOCKER_NAME||"")!=="second-world-calamity-run")fail("CROSS_ERA_BLOCKER_NAMES",{galaxy:window.CALAMITY_RUN_BLOCKER_NAME,universe:window.SECOND_WORLD_CALAMITY_RUN_BLOCKER_NAME});
  if(window.CALAMITY_RUN_INTEGRITY?.passed!==true)fail("GALAXY_RUN_INTEGRITY",window.CALAMITY_RUN_INTEGRITY||null);
  if(window.SECOND_WORLD_CALAMITY_UI_INTEGRITY?.passed!==true)fail("UNIVERSE_UI_INTEGRITY",window.SECOND_WORLD_CALAMITY_UI_INTEGRITY||null);
  if(window.THIRD_WORLD_RUN_INTEGRITY?.passed!==true)fail("HIGHER_DIMENSIONAL_RUN_INTEGRITY",window.THIRD_WORLD_RUN_INTEGRITY||null);
  if(window.THIRD_WORLD_CORE_INTEGRITY?.passed!==true)fail("HIGHER_DIMENSIONAL_CORE_INTEGRITY",window.THIRD_WORLD_CORE_INTEGRITY||null);
  const required=[
   "backgroundProgressStart","backgroundProgressStop","backgroundProgressFastCatchUpActive","backgroundProgressCatchUpPolicy","backgroundProgressCatchUpStep","backgroundProgressCatchUpFinalPolicy","backgroundProgressConsumeCatchUpCredit","backgroundProgressUiYield","backgroundProgressOnPageHide","continuousRunStopReasonMeta",
   "beginCivilizationCalamityRun","runCivilizationCalamityContinuous","requestCivilizationCalamityContinuousStop","getCivilizationCalamityRunSnapshot","civilizationCalamityRunConflictStatus",
   "beginSecondWorldCalamityRun","runSecondWorldCalamityContinuous","requestSecondWorldCalamityStop","getSecondWorldCalamityRunSnapshot","secondWorldCalamityRunConflictStatus",
   "startThirdWorldContinuousRun","runThirdWorldContinuousLoop","stopThirdWorldContinuousRun","thirdWorldContinuousRunSnapshot","thirdWorldLastFinishedRunSnapshot"
  ];
  required.forEach(name=>{if(typeof window[name]!=="function")fail("RUN_API_MISSING",name);});
  const galaxySource=sourceOf(window.runCivilizationCalamityContinuous),universeSource=sourceOf(window.runSecondWorldCalamityContinuous),higherSource=sourceOf(window.runThirdWorldContinuousLoop),galaxyBegin=sourceOf(window.beginCivilizationCalamityRun),universeBegin=sourceOf(window.beginSecondWorldCalamityRun),galaxyStop=sourceOf(window.requestCivilizationCalamityContinuousStop),universeStop=sourceOf(window.requestSecondWorldCalamityStop);
  if(!/catchUpPreviewPolicy/.test(galaxySource)||!/fastCatchUp/.test(galaxySource))fail("GALAXY_SHARED_FAST_CATCH_UP_WIRING");
  if(!/catchUpPreviewPolicy/.test(universeSource)||!/fastCatchUp/.test(universeSource))fail("UNIVERSE_SHARED_FAST_CATCH_UP_WIRING");
  if(!/fastCatchUpActive/.test(higherSource)||!/catchUpStep/.test(higherSource)||!/catchUpFinal/.test(higherSource))fail("HIGHER_DIMENSIONAL_SHARED_FAST_CATCH_UP_WIRING");
  if(!/runtimeConflictStatus/.test(galaxyBegin)||!/active-runtime/.test(galaxyBegin))fail("GALAXY_GLOBAL_MUTEX_WIRING",galaxyBegin);
  if(!/runtimeConflictStatus/.test(universeBegin)||!/active-runtime/.test(universeBegin))fail("UNIVERSE_GLOBAL_MUTEX_WIRING",universeBegin);
  if(!/phase!=="fighting"/.test(galaxyStop)||!/finish\("stopped"\)/.test(galaxyStop))fail("GALAXY_MANUAL_STOP_WIRING",galaxyStop);
  if(!/phase!=="fighting"/.test(universeStop)||!/finish\("stopped"\)/.test(universeStop))fail("UNIVERSE_MANUAL_STOP_WIRING",universeStop);
  const bossMeta=typeof window.continuousRunStopReasonMeta==="function"?window.continuousRunStopReasonMeta("boss-defeated"):null,civMeta=typeof window.continuousRunStopReasonMeta==="function"?window.continuousRunStopReasonMeta("civilization-complete"):null,stageMeta=typeof window.continuousRunStopReasonMeta==="function"?window.continuousRunStopReasonMeta("stage-crossed"):null;
  if(bossMeta?.category!=="completion"||civMeta?.category!=="completion"||stageMeta?.category!=="progression"||Number(bossMeta?.version)!==STOP_REASON_VERSION)fail("STOP_REASON_SEMANTICS",{bossMeta,civMeta,stageMeta});
  const galaxyState=typeof state!=="undefined"?state?.calamities:null;
  if(galaxyState&&["active","mode","battleCount","wins","losses","stopRequested","endedReason","lastBattle"].some(key=>Object.prototype.hasOwnProperty.call(galaxyState,key)))fail("GALAXY_TRANSIENT_PERSISTENCE_LEAK",galaxyState);
  const universeRows=Array.isArray(state?.secondWorld?.calamities)?state.secondWorld.calamities:[];
  if(universeRows.some(row=>row&&["active","mode","phase","battleCount","wins","losses","stopRequested","reason","lastBattle"].some(key=>Object.prototype.hasOwnProperty.call(row,key))))fail("UNIVERSE_TRANSIENT_PERSISTENCE_LEAK");
  const persistent=Array.from(window.THIRD_WORLD_PERSISTENT_KEYS||[]);
  if(["deaths","suppression","run","targetBossIndex","pendingEvents","recentBattles","lastBattleSummary","lastFinishedRun","lastFinishedRuntime","coreLevelAtStart","perDeathSuppressionPointsAtStart"].some(key=>persistent.includes(key)))fail("HIGHER_DIMENSIONAL_TRANSIENT_PERSISTENCE_LEAK",persistent);
  const higher=typeof window.thirdWorldContinuousRunSnapshot==="function"?window.thirdWorldContinuousRunSnapshot():null,lastFinished=typeof window.thirdWorldLastFinishedRunSnapshot==="function"?window.thirdWorldLastFinishedRunSnapshot():undefined;
  if(higher?.active===true)fail("HIGHER_DIMENSIONAL_BOOT_RUNTIME_ACTIVE",higher);
  if(lastFinished!==null)fail("HIGHER_DIMENSIONAL_BOOT_LAST_FINISHED_NOT_TRANSIENT",lastFinished);
  if(Number(window.THIRD_WORLD_RUN_EVENT_PAUSE_VERSION)!==0||Number(window.THIRD_WORLD_RUN_EVENT_TERMINAL_VERSION)!==1)fail("HIGHER_DIMENSIONAL_PROGRESS_EVENT_TERMINAL",{pause:window.THIRD_WORLD_RUN_EVENT_PAUSE_VERSION,terminal:window.THIRD_WORLD_RUN_EVENT_TERMINAL_VERSION});
  if(Number(window.THIRD_WORLD_RUN_LEGACY_EVENT_ACK_VERSION)!==1||typeof window.acknowledgeThirdWorldContinuousRunEvents!=="function")fail("HIGHER_DIMENSIONAL_LEGACY_ACK_COMPAT",{version:window.THIRD_WORLD_RUN_LEGACY_EVENT_ACK_VERSION,api:typeof window.acknowledgeThirdWorldContinuousRunEvents});
  else{const ack=window.acknowledgeThirdWorldContinuousRunEvents();if(ack?.ok!==false||ack?.code!=="event-run-ended")fail("HIGHER_DIMENSIONAL_LEGACY_ACK_NON_RESUME",ack);}
  if(Number(window.THIRD_WORLD_RUN_CORE_SNAPSHOT_VERSION)!==1||Number(window.THIRD_WORLD_RUN_HP_LIFECYCLE_VERSION)!==1)fail("HIGHER_DIMENSIONAL_RUN_SNAPSHOT_CONTRACT",{core:window.THIRD_WORLD_RUN_CORE_SNAPSHOT_VERSION,hp:window.THIRD_WORLD_RUN_HP_LIFECYCLE_VERSION});
  if(Number(window.THIRD_WORLD_RUN_LAST_FINISHED_SNAPSHOT_VERSION)!==1||Number(window.THIRD_WORLD_RUN_FORMAL_BATTLE_COUNT_VERSION)!==1)fail("HIGHER_DIMENSIONAL_RESULT_LIFECYCLE",{lastFinished:window.THIRD_WORLD_RUN_LAST_FINISHED_SNAPSHOT_VERSION,battleCount:window.THIRD_WORLD_RUN_FORMAL_BATTLE_COUNT_VERSION});
  const sandboxCore=typeof window.thirdWorldCoreSnapshot==="function"?window.thirdWorldCoreSnapshot({thirdWorld:{entered:true,coreLevel:5,dimensionalStrings:2000000000}}):null;
  if(Number(window.THIRD_WORLD_CORE_TARGET_RUN_ISOLATION_VERSION)!==1||sandboxCore?.formalTarget!==false||sandboxCore?.runActive!==false)fail("HIGHER_DIMENSIONAL_CORE_TARGET_ISOLATION",{version:window.THIRD_WORLD_CORE_TARGET_RUN_ISOLATION_VERSION,snapshot:sandboxCore});
  return freeze({version:VERSION,sharedInfraVersion:SHARED_INFRA_VERSION,stopReasonSemanticsVersion:STOP_REASON_VERSION,globalMutexVersion:GLOBAL_MUTEX_VERSION,strictInfraVersion:STRICT_INFRA_VERSION,passed:errors.length===0,errors:freeze(errors.slice()),checkedAt:Date.now()});
 }
 window.CONTINUOUS_RUN_CROSS_ERA_INTEGRITY_VERSION=VERSION;
 window.runContinuousRunCrossEraIntegrity=run;
 window.CONTINUOUS_RUN_CROSS_ERA_INTEGRITY=run();
 if(!window.CONTINUOUS_RUN_CROSS_ERA_INTEGRITY.passed)console.error("[文明戰線] Cross-era continuous run integrity error",window.CONTINUOUS_RUN_CROSS_ERA_INTEGRITY.errors);
})();