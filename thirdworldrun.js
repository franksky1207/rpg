(function(){
 const VERSION=1;
 const SUPPRESSION_VERSION=1;
 const RUNTIME_VERSION=1;
 const EVENT_PAUSE_VERSION=1;
 const PAGEHIDE_RESET_VERSION=1;
 const INTEGRITY_VERSION=1;
 const MAX_DEATHS=100;
 const BASE_SUPPRESSION_PER_DEATH=.50;
 const CORE_REDUCTION_PER_LEVEL=.04;
 const CORE_MAX_LEVEL=10;
 const FLOW_KIND="third-world";
 let runtime=null;
 let runSerial=0;

 function finiteWhole(value,fallback=0){const n=Math.floor(Number(value));return Number.isFinite(n)?n:fallback;}
 function numberOr(value,fallback=0){const n=Number(value);return Number.isFinite(n)?n:fallback;}
 function clamp(value,min,max){return Math.max(min,Math.min(max,value));}
 function freeze(value){return Object.freeze(value);}
 function currentState(){try{return typeof state!=="undefined"&&state&&typeof state==="object"?state:null;}catch(_){return null;}}
 function resolveBossIndex(value){return typeof window.thirdWorldBossIndex==="function"?window.thirdWorldBossIndex(value):-1;}
 function round2(value){return Math.round((Number(value)||0)*100)/100;}
 function coreLevel(target=currentState()){return clamp(finiteWhole(target?.thirdWorld?.coreLevel,0),0,CORE_MAX_LEVEL);}
 function suppressionPerDeathPoints(value=coreLevel()){
  const level=clamp(finiteWhole(value,0),0,CORE_MAX_LEVEL);
  return round2(BASE_SUPPRESSION_PER_DEATH-level*CORE_REDUCTION_PER_LEVEL);
 }
 function playerMaxHp(target=currentState(),override=null){
  if(override!=null)return Math.max(1,finiteWhole(override,1));
  if(typeof window.playerCombatStats!=="function")return 1;
  const stats=window.playerCombatStats();
  return Math.max(1,finiteWhole(stats?.hp,1));
 }
 function hpCapSnapshot(deaths,target=currentState(),maxHpOverride=null){
  const deathCount=clamp(finiteWhole(deaths,0),0,MAX_DEATHS),level=coreLevel(target),perDeath=suppressionPerDeathPoints(level),suppressionPoints=round2(deathCount*perDeath),maxHp=playerMaxHp(target,maxHpOverride),fraction=clamp(1-suppressionPoints/100,0,1),hpCap=Math.max(1,Math.floor(maxHp*fraction));
  return freeze({version:SUPPRESSION_VERSION,deaths:deathCount,maxDeaths:MAX_DEATHS,coreLevel:level,perDeathSuppressionPoints:perDeath,suppressionPoints,maxHp,hpCap,hpCapPercent:round2(fraction*100)});
 }
 function runtimeSnapshot(source=runtime){
  if(!source)return freeze({version:RUNTIME_VERSION,active:false,paused:false,bossIndex:-1,deaths:0,battles:0,pendingEvents:freeze([]),stopReason:""});
  return freeze({
   version:RUNTIME_VERSION,
   active:source.active===true,
   paused:source.paused===true,
   bossIndex:finiteWhole(source.bossIndex,-1),
   deaths:clamp(finiteWhole(source.deaths,0),0,MAX_DEATHS),
   battles:Math.max(0,finiteWhole(source.battles,0)),
   startedAt:Math.max(0,finiteWhole(source.startedAt,0)),
   pauseReason:String(source.pauseReason||""),
   stopReason:String(source.stopReason||""),
   pendingEvents:freeze((Array.isArray(source.pendingEvents)?source.pendingEvents:[]).slice()),
   hpCap:hpCapSnapshot(source.deaths,currentState()),
   lastSettlement:source.lastSettlement||null
  });
 }
 function stopBackgroundFlow(){if(typeof window.backgroundProgressStop==="function")window.backgroundProgressStop(FLOW_KIND);}
 function startBackgroundFlow(){if(typeof window.backgroundProgressStart==="function")window.backgroundProgressStart(FLOW_KIND,{mode:"continuous"});}
 function clearRuntime(reason="manual"){
  if(!runtime){stopBackgroundFlow();return freeze({...runtimeSnapshot(),stopReason:String(reason||"manual")});}
  const finished={...runtime,active:false,paused:false,stopReason:String(reason||"manual"),pendingEvents:Array.isArray(runtime.pendingEvents)?runtime.pendingEvents.slice():[]};
  runtime=null;runSerial+=1;stopBackgroundFlow();
  return runtimeSnapshot(finished);
 }
 function startRun(value){
  const index=resolveBossIndex(value),target=currentState();
  if(index<0)return freeze({ok:false,reason:"找不到高維 Boss。",snapshot:runtimeSnapshot()});
  if(runtime?.active===true){
   if(runtime.bossIndex!==index)return freeze({ok:false,reason:"高維連戰進行中，必須先停止目前連戰才能更換目標。",snapshot:runtimeSnapshot()});
   return freeze({ok:true,started:false,snapshot:runtimeSnapshot()});
  }
  if(!target||typeof window.thirdWorldChallengeStatus!=="function")return freeze({ok:false,reason:"無法取得高維正式狀態。",snapshot:runtimeSnapshot()});
  const status=window.thirdWorldChallengeStatus(index,target);
  if(status?.allowed!==true)return freeze({ok:false,reason:String(status?.reason||"challenge-blocked"),challengeStatus:status||null,snapshot:runtimeSnapshot()});
  runtime={active:true,paused:false,bossIndex:index,deaths:0,battles:0,startedAt:Date.now(),pauseReason:"",stopReason:"",pendingEvents:[],lastSettlement:null};
  runSerial+=1;startBackgroundFlow();
  return freeze({ok:true,started:true,snapshot:runtimeSnapshot()});
 }
 function pauseForProgressEvents(settlement){
  if(!runtime)return runtimeSnapshot();
  runtime.paused=true;
  runtime.pauseReason="progress-event";
  runtime.pendingEvents=Array.isArray(settlement?.eventSequence)?settlement.eventSequence.slice():[];
  stopBackgroundFlow();
  return runtimeSnapshot();
 }
 function acknowledgeEvents(){
  if(!runtime?.active||runtime.paused!==true||runtime.pauseReason!=="progress-event")return freeze({ok:false,reason:"目前沒有待確認的高維進度事件。",snapshot:runtimeSnapshot()});
  const target=currentState(),status=typeof window.thirdWorldChallengeStatus==="function"?window.thirdWorldChallengeStatus(runtime.bossIndex,target):null;
  if(status?.allowed!==true){const stopped=clearRuntime(status?.reason||"challenge-blocked");return freeze({ok:false,reason:String(status?.reason||"challenge-blocked"),snapshot:stopped});}
  runtime.paused=false;runtime.pauseReason="";runtime.pendingEvents=[];startBackgroundFlow();
  return freeze({ok:true,snapshot:runtimeSnapshot()});
 }
 function battleOptions(options,cap){
  return {
   startHp:cap.hpCap,
   playerHealCap:cap.hpCap,
   preparePresentation:options.preparePresentation===true,
   logs:options.logs!==false,
   rng:typeof options.rng==="function"?options.rng:undefined,
   maxActions:options.maxActions,
   maxActionsPerChain:options.maxActionsPerChain,
   vipLevel:options.vipLevel,
   weakTypesResolver:options.weakTypesResolver
  };
 }
 function runOneBattle(options={}){
  if(!runtime?.active)return freeze({ok:false,reason:"高維連戰尚未開始。",snapshot:runtimeSnapshot()});
  if(runtime.paused)return freeze({ok:false,reason:"高維連戰正在等待進度事件確認。",snapshot:runtimeSnapshot()});
  if(typeof window.runThirdWorldBossCombat!=="function"||typeof window.settleThirdWorldCombatResult!=="function")return freeze({ok:false,reason:"高維戰鬥／結算 owner 尚未載入。",snapshot:clearRuntime("owner-missing")});
  const target=currentState(),status=typeof window.thirdWorldChallengeStatus==="function"?window.thirdWorldChallengeStatus(runtime.bossIndex,target):null;
  if(status?.allowed!==true)return freeze({ok:false,reason:String(status?.reason||"challenge-blocked"),challengeStatus:status||null,snapshot:clearRuntime(status?.reason||"challenge-blocked")});
  const cap=hpCapSnapshot(runtime.deaths,target);
  const combat=window.runThirdWorldBossCombat(runtime.bossIndex,battleOptions(options,cap));
  if(combat?.ok!==true||combat?.formalSettlementEligible!==true)return freeze({ok:false,reason:String(combat?.reason||combat?.terminationReason||"combat-incomplete"),combat:combat||null,snapshot:clearRuntime("combat-incomplete")});
  const settlement=window.settleThirdWorldCombatResult(combat,{rng:options.rng,vipLevel:options.vipLevel,weakTypesResolver:options.weakTypesResolver});
  if(settlement?.ok!==true)return freeze({ok:false,reason:String(settlement?.reason||settlement?.code||"settlement-failed"),combat,settlement:settlement||null,snapshot:clearRuntime("settlement-failed")});
  runtime.battles+=1;
  runtime.lastSettlement=settlement;
  const countsDeath=settlement.playerDied===true&&settlement.bossDefeated!==true;
  if(countsDeath)runtime.deaths=clamp(runtime.deaths+1,0,MAX_DEATHS);
  const deathsAfter=runtime.deaths;
  const continuation=settlement.continuation&&typeof settlement.continuation==="object"?settlement.continuation:{};
  const terminalReason=String(continuation.terminalReason||"");
  const progressEvent=continuation.requiresEventHandling===true;
  const deathLimitReached=countsDeath&&deathsAfter>=MAX_DEATHS;
  let snapshot;
  if(terminalReason)snapshot=clearRuntime(terminalReason);
  else if(progressEvent)snapshot=pauseForProgressEvents(settlement);
  else if(deathLimitReached)snapshot=clearRuntime("death-limit");
  else snapshot=runtimeSnapshot();
  return freeze({ok:true,world:3,combat,settlement,countsDeath,deathsAfter,deathLimitReached,terminalReason,progressEventPending:progressEvent,continuationAllowed:snapshot.active===true&&!snapshot.paused,snapshot});
 }
 async function sleepBetweenBattles(){
  const gap=Math.max(0,numberOr(window.COMBAT_OUTER_GAP_MS,140));
  if(typeof window.backgroundProgressSleep==="function")return window.backgroundProgressSleep(gap,FLOW_KIND);
  if(typeof window.sleep==="function")return window.sleep(gap);
  return new Promise(resolve=>setTimeout(resolve,gap));
 }
 async function runLoop(value,options={}){
  const started=startRun(value);
  if(!started.ok)return started;
  const serial=runSerial,results=[];
  while(runtime?.active===true&&runSerial===serial){
   if(runtime.paused)break;
   const step=runOneBattle(options);
   results.push(step);
   if(typeof options.onBattle==="function"){try{await options.onBattle(step);}catch(error){console.error(error);}}
   if(step.ok!==true||runtime?.active!==true||runtime.paused||runSerial!==serial)break;
   await sleepBetweenBattles();
  }
  return freeze({ok:true,world:3,battles:results.length,results:freeze(results.slice()),snapshot:runtimeSnapshot()});
 }
 function validate(){
  const errors=[];
  const p0=suppressionPerDeathPoints(0),p10=suppressionPerDeathPoints(10),h0=hpCapSnapshot(100,{thirdWorld:{coreLevel:0}},10000),h10=hpCapSnapshot(100,{thirdWorld:{coreLevel:10}},10000),hMid=hpCapSnapshot(50,{thirdWorld:{coreLevel:5}},10000);
  if(p0!==.5||p10!==.1)errors.push({code:"SUPPRESSION_ENDPOINTS",p0,p10});
  if(h0.hpCapPercent!==50||h0.hpCap!==5000||h10.hpCapPercent!==90||h10.hpCap!==9000)errors.push({code:"HUNDRED_DEATH_CAP",h0,h10});
  if(hMid.perDeathSuppressionPoints!==.3||hMid.hpCapPercent!==85||hMid.hpCap!==8500)errors.push({code:"MID_CORE_CAP",hMid});
  const persistent=Array.from(window.THIRD_WORLD_PERSISTENT_KEYS||[]);
  if(["deaths","suppression","run","targetBossIndex","pendingEvents"].some(key=>persistent.includes(key)))errors.push({code:"TRANSIENT_PERSISTENCE_LEAK",persistent});
  if(typeof window.runThirdWorldBossCombat!=="function"||typeof window.settleThirdWorldCombatResult!=="function")errors.push({code:"FORMAL_OWNER_MISSING"});
  return freeze({version:INTEGRITY_VERSION,passed:errors.length===0,errors:freeze(errors.slice())});
 }
 function stopRun(reason="manual"){return clearRuntime(reason);}
 function onPageHide(){if(runtime?.active)clearRuntime("pagehide");}
 if(typeof window.addEventListener==="function")window.addEventListener("pagehide",onPageHide);

 window.THIRD_WORLD_RUN_VERSION=VERSION;
 window.THIRD_WORLD_SUPPRESSION_VERSION=SUPPRESSION_VERSION;
 window.THIRD_WORLD_CONTINUOUS_RUNTIME_VERSION=RUNTIME_VERSION;
 window.THIRD_WORLD_RUN_EVENT_PAUSE_VERSION=EVENT_PAUSE_VERSION;
 window.THIRD_WORLD_RUN_PAGEHIDE_RESET_VERSION=PAGEHIDE_RESET_VERSION;
 window.THIRD_WORLD_RUN_INTEGRITY_VERSION=INTEGRITY_VERSION;
 window.THIRD_WORLD_RUN_MAX_DEATHS=MAX_DEATHS;
 window.THIRD_WORLD_SUPPRESSION_BASE_POINTS=BASE_SUPPRESSION_PER_DEATH;
 window.THIRD_WORLD_CORE_SUPPRESSION_REDUCTION_PER_LEVEL=CORE_REDUCTION_PER_LEVEL;
 window.thirdWorldSuppressionPerDeathPoints=suppressionPerDeathPoints;
 window.thirdWorldRunHpCapSnapshot=hpCapSnapshot;
 window.thirdWorldContinuousRunSnapshot=runtimeSnapshot;
 window.startThirdWorldContinuousRun=startRun;
 window.stopThirdWorldContinuousRun=stopRun;
 window.acknowledgeThirdWorldContinuousRunEvents=acknowledgeEvents;
 window.runThirdWorldContinuousBattle=runOneBattle;
 window.runThirdWorldContinuousLoop=runLoop;
 window.THIRD_WORLD_RUN_INTEGRITY=validate();
 if(!window.THIRD_WORLD_RUN_INTEGRITY.passed)console.error("[文明戰線] Third-world run integrity error",window.THIRD_WORLD_RUN_INTEGRITY.errors);
})();
