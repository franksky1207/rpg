(function(){
 const VERSION=8;
 const SUPPRESSION_VERSION=3;
 const RUNTIME_VERSION=4;
 const EVENT_TERMINAL_VERSION=1;
 const LEGACY_EVENT_ACK_VERSION=1;
 const PAGEHIDE_RESET_VERSION=2;
 const FAST_CATCH_UP_VERSION=1;
 const BOUNDED_HISTORY_VERSION=1;
 const ACTIVE_FLOW_GUARD_VERSION=1;
 const SHARED_PAGEHIDE_OWNER_VERSION=1;
 const RESULT_SUMMARY_VERSION=2;
 const RUN_TOTALS_VERSION=1;
 const RUN_IDENTITY_VERSION=1;
 const EXCEPTION_CLEANUP_VERSION=1;
 const INTEGRITY_VERSION=10;
 const SHARED_CONTINUOUS_INFRA_VERSION=1;
 const SHARED_INFRA_STRICT_VERSION=1;
 const CORE_RUN_SNAPSHOT_VERSION=1;
 const HP_LIFECYCLE_VERSION=1;
 const LAST_FINISHED_SNAPSHOT_VERSION=2;
 const FORMAL_BATTLE_COUNT_VERSION=1;
 const BACKGROUND_GM_GATE_VERSION=1;
 const FOREGROUND_WAIT_VERSION=1;
 const BACKGROUND_POLICY_VERSION=1;
 const VIP20_DEATH_PROTECTION_VERSION=1;
 const OWN_MINIMAL_MODE_GUARD_VERSION=1;
 const OWN_MINIMAL_MODE_ADAPTER_ID="third-world-mainline";
 const MAX_DEATHS=500;
 const BASE_SUPPRESSION_PER_DEATH=.10;
 const CORE_REDUCTION_PER_LEVEL=.008;
 const RECENT_HISTORY_LIMIT=20;
 const FLOW_KIND="third-world";
 const BLOCKER_NAME="third-world-run";
 let runtime=null;
 let lastFinishedRuntime=null;
 let runSerial=0;
 let pageHideSubscribed=false;
 let blockerRegistered=false;
 let sharedRunInfra=null;

 function finiteWhole(value,fallback=0){const n=Math.floor(Number(value));return Number.isFinite(n)?n:fallback;}
 function numberOr(value,fallback=0){const n=Number(value);return Number.isFinite(n)?n:fallback;}
 function clamp(value,min,max){return Math.max(min,Math.min(max,value));}
 function freeze(value){return Object.freeze(value);}
 function currentState(){try{return typeof state!=="undefined"&&state&&typeof state==="object"?state:null;}catch(_){return null;}}
 function resolveBossIndex(value){return typeof window.thirdWorldBossIndex==="function"?window.thirdWorldBossIndex(value):-1;}
 function round3(value){return Math.round((Number(value)||0)*1000)/1000;}
 function runInfra(){
  if(sharedRunInfra)return sharedRunInfra;
  if(typeof window.createContinuousRunInfrastructure==="function")sharedRunInfra=window.createContinuousRunInfrastructure({flowKind:FLOW_KIND,mode:"continuous",historyLimit:RECENT_HISTORY_LIMIT,blockerName:BLOCKER_NAME});
  return sharedRunInfra;
 }
 function gmBackgroundEnabled(){return typeof window.gmBackgroundBattleEnabled==="function"&&window.gmBackgroundBattleEnabled()===true;}
 function environmentIsBackground(){return typeof window.backgroundProgressEnvironmentIsBackground==="function"&&window.backgroundProgressEnvironmentIsBackground()===true;}
 function ownMinimalModeActive(){return typeof window.isMinimalModeOpen==="function"&&window.isMinimalModeOpen()===true&&typeof window.getMinimalModeAdapterId==="function"&&String(window.getMinimalModeAdapterId()||"")===OWN_MINIMAL_MODE_ADAPTER_ID;}
 function normalizeRuntimeConflict(status,allowOwnMinimal=ownMinimalModeActive()){
  const raw=status&&typeof status==="object"?status:{blocked:true,blockers:["runtime-status-missing"],activeBackgroundKind:null};
  const blockers=(Array.isArray(raw.blockers)?raw.blockers:[]).map(reason=>String(reason||"")).filter(Boolean);
  const filtered=allowOwnMinimal?blockers.filter(reason=>reason!=="minimal-mode-open"):blockers;
  return freeze({...raw,blocked:filtered.length>0||raw.blocked===true&&blockers.length===0,blockers:freeze(filtered.slice())});
 }
 function coreMaxLevel(){return Math.max(0,finiteWhole(window.THIRD_WORLD_CORE_MAX_LEVEL,0));}
 function coreLevel(target=currentState()){return clamp(finiteWhole(target?.thirdWorld?.coreLevel,0),0,coreMaxLevel());}
 function suppressionPerDeathPoints(value=coreLevel()){
  const level=clamp(finiteWhole(value,0),0,coreMaxLevel());
  return round3(BASE_SUPPRESSION_PER_DEATH-level*CORE_REDUCTION_PER_LEVEL);
 }
 function playerMaxHp(target=currentState(),override=null){
  if(override!=null)return Math.max(1,finiteWhole(override,1));
  if(typeof window.playerCombatStats!=="function")return 1;
  const stats=window.playerCombatStats();
  return Math.max(1,finiteWhole(stats?.hp,1));
 }
 function hpCapSnapshot(deaths,target=currentState(),maxHpOverride=null,coreLevelOverride=null){
  const deathCount=clamp(finiteWhole(deaths,0),0,MAX_DEATHS),level=coreLevelOverride==null?coreLevel(target):clamp(finiteWhole(coreLevelOverride,0),0,coreMaxLevel()),perDeath=suppressionPerDeathPoints(level),suppressionPoints=round3(deathCount*perDeath),maxHp=playerMaxHp(target,maxHpOverride),fraction=clamp(1-suppressionPoints/100,0,1),hpCap=Math.max(1,Math.floor(maxHp*fraction));
  return freeze({version:SUPPRESSION_VERSION,deaths:deathCount,maxDeaths:MAX_DEATHS,coreLevel:level,coreMaxLevel:coreMaxLevel(),perDeathSuppressionPoints:perDeath,suppressionPoints,maxHp,hpCap,hpCapPercent:round3(fraction*100)});
 }
 function boundedSummaries(rows){const infra=runInfra();return freeze(infra?infra.boundedHistory(rows,RECENT_HISTORY_LIMIT):(Array.isArray(rows)?rows:[]).slice(-RECENT_HISTORY_LIMIT));}
 function activeBackgroundKind(){const infra=runInfra();return infra?infra.activeKind():"";}
 function backgroundPolicySnapshot(){
  const gmEnabled=gmBackgroundEnabled(),activeKind=activeBackgroundKind();
  return freeze({version:BACKGROUND_POLICY_VERSION,gmEnabled,environmentBackground:environmentIsBackground(),waitsForForeground:!gmEnabled,backgroundFlowActive:activeKind===FLOW_KIND,activeBackgroundKind:activeKind||null});
 }
 function runtimeSnapshot(source=runtime){
  if(!source)return freeze({version:RUNTIME_VERSION,runId:null,active:false,paused:false,looping:false,bossIndex:-1,deaths:0,battles:0,vip20Protections:0,coreLevelAtStart:null,perDeathSuppressionPointsAtStart:null,pendingEvents:freeze([]),stopReason:"",stopMeta:null,recentBattleLimit:RECENT_HISTORY_LIMIT,recentBattles:freeze([]),lastBattleSummary:null});
  const stopReason=String(source.stopReason||""),levelAtStart=clamp(finiteWhole(source.coreLevelAtStart,coreLevel()),0,coreMaxLevel()),perDeathAtStart=suppressionPerDeathPoints(levelAtStart);
  return freeze({
   version:RUNTIME_VERSION,
   runId:Math.max(1,finiteWhole(source.runId,1)),
   active:source.active===true,
   paused:false,
   looping:source.looping===true,
   bossIndex:finiteWhole(source.bossIndex,-1),
   deaths:clamp(finiteWhole(source.deaths,0),0,MAX_DEATHS),
   battles:Math.max(0,finiteWhole(source.battles,0)),
   vip20Protections:Math.max(0,finiteWhole(source.vip20Protections,0)),
   startedAt:Math.max(0,finiteWhole(source.startedAt,0)),
   coreLevelAtStart:levelAtStart,
   perDeathSuppressionPointsAtStart:perDeathAtStart,
   pauseReason:"",
   stopReason,
   stopMeta:runInfra()?.stopReasonMeta(stopReason)||null,
   pendingEvents:freeze((Array.isArray(source.pendingEvents)?source.pendingEvents:[]).slice()),
   hpCap:hpCapSnapshot(source.deaths,currentState(),null,levelAtStart),
   recentBattleLimit:RECENT_HISTORY_LIMIT,
   recentBattles:boundedSummaries(source.recentBattles),
   lastBattleSummary:source.lastBattleSummary||null
  });
 }
 function lastFinishedRunSnapshot(expectedRunId=null){
  if(!lastFinishedRuntime)return null;
  if(expectedRunId!=null&&Math.max(1,finiteWhole(expectedRunId,1))!==Math.max(1,finiteWhole(lastFinishedRuntime.runId,1)))return null;
  return lastFinishedRuntime;
 }
 function ownRuntimeBlockerStatus(){return runtime?.active===true?{blocked:true,reasons:["active"]}:{blocked:false,reasons:[]};}
 function runtimeConflictStatus(){
  const infra=runInfra();
  if(!infra)return freeze({blocked:true,blockers:freeze(["continuous-run-infrastructure-missing"]),activeBackgroundKind:null});
  return normalizeRuntimeConflict(infra.conflictStatus(BLOCKER_NAME));
 }
 function stopBackgroundFlow(){const infra=runInfra();return infra?infra.stopBackground():false;}
 function startBackgroundFlow(){const infra=runInfra();return infra?infra.startBackground():null;}
 function backgroundFlowOwned(){const infra=runInfra();return infra?infra.flowOwned():false;}
 function fastCatchUpActive(){const infra=runInfra();return infra?infra.fastCatchUp():false;}
 function catchUpStep(){const infra=runInfra();return infra?infra.catchUpStep():null;}
 function catchUpFinal(){const infra=runInfra();return infra?infra.catchUpFinal():null;}
 async function waitForForegroundIfBackgroundDisabled(){
  if(gmBackgroundEnabled()||!environmentIsBackground())return false;
  if(typeof window.backgroundProgressOnEnvironmentChange!=="function"){
   while(runtime?.active===true&&!gmBackgroundEnabled()&&environmentIsBackground())await new Promise(resolve=>setTimeout(resolve,100));
   return true;
  }
  await new Promise(resolve=>{
   let done=false,unsubscribe=null;
   const finish=()=>{if(done)return;done=true;if(typeof unsubscribe==="function")unsubscribe();resolve();};
   unsubscribe=window.backgroundProgressOnEnvironmentChange(isBackground=>{if(!isBackground||gmBackgroundEnabled()||runtime?.active!==true)finish();});
   if(!environmentIsBackground()||gmBackgroundEnabled()||runtime?.active!==true)finish();
  });
  return true;
 }
 async function consumeCatchUpDelay(ms){
  const delay=Math.max(0,numberOr(ms,0)),infra=runInfra();
  if(infra)return infra.consumeDelay(delay);
  if(delay>0)await new Promise(resolve=>setTimeout(resolve,delay));
  return false;
 }
 function clearRuntime(reason="manual"){
  if(!runtime){stopBackgroundFlow();return freeze({...runtimeSnapshot(),stopReason:String(reason||"manual"),stopMeta:runInfra()?.stopReasonMeta(reason)||null});}
  const finished={...runtime,active:false,paused:false,looping:false,pauseReason:"",stopReason:String(reason||"manual"),pendingEvents:Array.isArray(runtime.pendingEvents)?runtime.pendingEvents.slice():[],recentBattles:Array.isArray(runtime.recentBattles)?runtime.recentBattles.slice():[]};
  const finishedSnapshot=runtimeSnapshot(finished);
  runtime=null;runSerial+=1;stopBackgroundFlow();lastFinishedRuntime=finishedSnapshot;
  // Infinite high-era progression has no generic victory settlement: progress and deaths are not all-clear.
  window.CivilizationAudioScenes?.notify?.("combat-exit",{era:"higher",mode:"higher-stage"});
  return finishedSnapshot;
 }
 function startRun(value){
  const index=resolveBossIndex(value),target=currentState();
  if(index<0)return freeze({ok:false,reason:"找不到高維 Boss。",snapshot:runtimeSnapshot()});
  if(runtime?.active===true){
   if(runtime.bossIndex!==index)return freeze({ok:false,reason:"高維連戰進行中，必須先停止目前連戰才能更換目標。",snapshot:runtimeSnapshot()});
   return freeze({ok:true,started:false,snapshot:runtimeSnapshot()});
  }
  const conflict=runtimeConflictStatus();
  if(conflict.blocked)return freeze({ok:false,reason:"已有其他正式戰鬥／背景流程進行中，無法開始高維連戰。",code:"active-runtime",runtime:conflict,snapshot:runtimeSnapshot()});
  if(!target||typeof window.thirdWorldChallengeStatus!=="function")return freeze({ok:false,reason:"無法取得高維正式狀態。",snapshot:runtimeSnapshot()});
  const status=window.thirdWorldChallengeStatus(index,target);
  if(status?.allowed!==true)return freeze({ok:false,reason:String(status?.reason||"challenge-blocked"),challengeStatus:status||null,snapshot:runtimeSnapshot()});
  const levelAtStart=coreLevel(target),runId=runSerial+1;
  window.CivilizationAudioScenes?.notify?.("combat-start",{era:"higher",mode:"higher-stage"});
  runtime={runId,active:true,paused:false,looping:false,bossIndex:index,deaths:0,battles:0,vip20Protections:0,startedAt:Date.now(),coreLevelAtStart:levelAtStart,perDeathSuppressionPointsAtStart:suppressionPerDeathPoints(levelAtStart),pauseReason:"",stopReason:"",pendingEvents:[],recentBattles:[],lastBattleSummary:null};
  runSerial=runId;
  if(gmBackgroundEnabled())startBackgroundFlow();else stopBackgroundFlow();
  return freeze({ok:true,started:true,snapshot:runtimeSnapshot()});
 }
 function terminalReasonForStep(terminalReason,progressEvent,deathLimitReached){
  const formal=String(terminalReason||"");
  if(formal)return formal;
  if(progressEvent===true)return "progress-event";
  if(deathLimitReached===true)return "death-limit";
  return "";
 }
 function settlePendingEvents(settlement){
  if(!runtime)return [];
  const events=Array.isArray(settlement?.eventSequence)?settlement.eventSequence.slice():[];
  runtime.pendingEvents=events;
  return events;
 }
 function acknowledgeEvents(){
  return freeze({ok:false,reason:"高維進度事件已改為當場結束整輪；請在顯示事件後重新開始新的連戰。",code:"event-run-ended",snapshot:runtimeSnapshot()});
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
 function summaryFromStep(settlement,combat,data={}){
  const items=Array.isArray(settlement?.items)?settlement.items:[];
  return freeze({
   version:RESULT_SUMMARY_VERSION,
   battleNumber:Math.max(0,finiteWhole(data.battleNumber,0)),
   bossIndex:finiteWhole(settlement?.bossIndex,finiteWhole(combat?.bossIndex,-1)),
   bossId:String(settlement?.bossId||combat?.bossId||""),
   formalStartHp:Math.max(0,finiteWhole(settlement?.formalStartHp,0)),
   combatEndHp:Math.max(0,finiteWhole(settlement?.combatEndHp,0)),
   effectivePermanentDamage:Math.max(0,finiteWhole(settlement?.effectivePermanentDamage,0)),
   xp:Math.max(0,finiteWhole(settlement?.xp,0)),
   dimensionalStrings:Math.max(0,finiteWhole(settlement?.dimensionalStrings,0)),
   itemCount:items.length,
   playerDied:settlement?.playerDied===true,
   bossDefeated:settlement?.bossDefeated===true,
   terminationReason:String(combat?.terminationReason||settlement?.terminationReason||""),
   countsDeath:data.countsDeath===true,
   deathPenalty:data.deathPenalty&&typeof data.deathPenalty==="object"?freeze({...data.deathPenalty}):null,
   deathsAfter:clamp(finiteWhole(data.deathsAfter,0),0,MAX_DEATHS),
   deathLimitReached:data.deathLimitReached===true,
   terminalReason:String(data.terminalReason||""),
   progressEventPending:data.progressEvent===true,
   continuationAllowed:data.continuationAllowed===true
  });
 }
 function recordBattleSummary(summary){
  if(!runtime||!summary)return;
  if(!Array.isArray(runtime.recentBattles))runtime.recentBattles=[];
  runtime.recentBattles.push(summary);
  if(runtime.recentBattles.length>RECENT_HISTORY_LIMIT)runtime.recentBattles.splice(0,runtime.recentBattles.length-RECENT_HISTORY_LIMIT);
  runtime.lastBattleSummary=summary;
 }
 function runOneBattle(options={}){
  if(!runtime?.active)return freeze({ok:false,reason:"高維連戰尚未開始。",snapshot:runtimeSnapshot()});
  if(runtime.deaths>=MAX_DEATHS)return freeze({ok:false,reason:`本輪已達 ${MAX_DEATHS} 次死亡上限。`,snapshot:clearRuntime("death-limit")});
  const conflict=runtimeConflictStatus();
  if(conflict.blocked||!backgroundFlowOwned())return freeze({ok:false,reason:"其他正式戰鬥／背景流程已接管，停止高維連戰。",runtime:conflict,snapshot:clearRuntime("active-runtime")});
  if(typeof window.runThirdWorldBossCombat!=="function"||typeof window.settleThirdWorldCombatResult!=="function")return freeze({ok:false,reason:"高維戰鬥／結算 owner 尚未載入。",snapshot:clearRuntime("owner-missing")});
  const target=currentState(),status=typeof window.thirdWorldChallengeStatus==="function"?window.thirdWorldChallengeStatus(runtime.bossIndex,target):null;
  if(status?.allowed!==true)return freeze({ok:false,reason:String(status?.reason||"challenge-blocked"),challengeStatus:status||null,snapshot:clearRuntime(status?.reason||"challenge-blocked")});
  const cap=hpCapSnapshot(runtime.deaths,target,null,runtime.coreLevelAtStart);
  const combat=window.runThirdWorldBossCombat(runtime.bossIndex,battleOptions(options,cap));
  if(combat?.ok!==true||combat?.formalSettlementEligible!==true)return freeze({ok:false,reason:String(combat?.reason||combat?.terminationReason||"combat-incomplete"),combat:combat||null,snapshot:clearRuntime("combat-incomplete")});
  const settlement=window.settleThirdWorldCombatResult(combat,{rng:options.rng,vipLevel:options.vipLevel,weakTypesResolver:options.weakTypesResolver});
  if(settlement?.ok!==true)return freeze({ok:false,reason:String(settlement?.reason||settlement?.code||"settlement-failed"),combat,settlement:settlement||null,snapshot:clearRuntime("settlement-failed")});
  runtime.battles+=1;
  const countsDeath=settlement.playerDied===true&&settlement.bossDefeated!==true;
  let deathPenalty=null;
  if(countsDeath){
   if(typeof window.resolveDeathEquipmentPenalty!=="function")return freeze({ok:false,reason:"共用死亡裝備懲罰 owner 尚未載入。",combat,settlement,snapshot:clearRuntime("owner-missing")});
   deathPenalty=window.resolveDeathEquipmentPenalty([],{rng:typeof options.rng==="function"?options.rng:undefined,forceProtected:true,source:"third-world"});
   if(deathPenalty?.protectedByVip20===true)runtime.vip20Protections=Math.max(0,finiteWhole(runtime.vip20Protections,0))+1;
   runtime.deaths=clamp(runtime.deaths+1,0,MAX_DEATHS);
  }
  const deathsAfter=runtime.deaths;
  const continuation=settlement.continuation&&typeof settlement.continuation==="object"?settlement.continuation:{};
  const formalTerminalReason=String(continuation.terminalReason||"");
  const progressEvent=continuation.requiresEventHandling===true;
  const deathLimitReached=countsDeath&&deathsAfter>=MAX_DEATHS;
  if(progressEvent||Array.isArray(settlement?.eventSequence)&&settlement.eventSequence.length)settlePendingEvents(settlement);
  const terminalReason=terminalReasonForStep(formalTerminalReason,progressEvent,deathLimitReached);
  const willContinue=!terminalReason;
  const summary=summaryFromStep(settlement,combat,{battleNumber:runtime.battles,countsDeath,deathPenalty,deathsAfter,deathLimitReached,terminalReason,progressEvent,continuationAllowed:willContinue});
  recordBattleSummary(summary);
  const snapshot=terminalReason?clearRuntime(terminalReason):runtimeSnapshot();
  return freeze({ok:true,world:3,combat,settlement,summary,countsDeath,deathPenalty,deathsAfter,deathLimitReached,terminalReason,progressEventPending:progressEvent,continuationAllowed:terminalReason===""&&snapshot.active===true,snapshot});
 }
 async function sleepBetweenBattles(){return consumeCatchUpDelay(Math.max(0,numberOr(window.COMBAT_OUTER_GAP_MS,140)));}
 function shouldNotifyDuringCatchUp(step,policy){return step?.ok!==true||step?.terminalReason||step?.progressEventPending===true||step?.deathLimitReached===true||policy?.shouldRefreshUi===true||policy?.shouldPresentBattle===true;}
 async function runLoop(value,options={}){
  const started=startRun(value);
  if(!started.ok)return started;
  if(runtime?.looping===true)return freeze({ok:false,reason:"此高維連戰已由另一個 loop 執行中。",snapshot:runtimeSnapshot()});
  const serial=runSerial,runId=Math.max(1,finiteWhole(runtime?.runId,serial)),recent=[],startedBattleCount=Math.max(0,finiteWhole(runtime?.battles,0)),totals={effectivePermanentDamage:0,xp:0,dimensionalStrings:0,itemCount:0};
  let total=0,lastStep=null,lastSnapshot=started.snapshot,catchUpNeedsFinalSync=false,caughtError=null;
  runtime.looping=true;
  try{
   while(runtime?.active===true&&runSerial===serial){
    await waitForForegroundIfBackgroundDisabled();
    if(runtime?.active!==true||runSerial!==serial)break;
    const fastCatchUp=fastCatchUpActive();
    const step=runOneBattle(options);
    if(step?.ok===true)total+=1;
    lastStep=step;lastSnapshot=step?.snapshot||runtimeSnapshot();
    if(step?.summary){
     recent.push(step.summary);if(recent.length>RECENT_HISTORY_LIMIT)recent.splice(0,recent.length-RECENT_HISTORY_LIMIT);
     totals.effectivePermanentDamage+=Math.max(0,finiteWhole(step.summary.effectivePermanentDamage,0));
     totals.xp+=Math.max(0,finiteWhole(step.summary.xp,0));
     totals.dimensionalStrings+=Math.max(0,finiteWhole(step.summary.dimensionalStrings,0));
     totals.itemCount+=Math.max(0,finiteWhole(step.summary.itemCount,0));
    }
    const policy=fastCatchUp&&runtime?.active===true?catchUpStep():null;
    if(fastCatchUp)catchUpNeedsFinalSync=true;
    const notify=!fastCatchUp||shouldNotifyDuringCatchUp(step,policy);
    if(notify&&typeof options.onBattle==="function"){try{await options.onBattle(step,{fastCatchUp,catchUpPolicy:policy});}catch(error){console.error(error);}}
    if(fastCatchUp){const infra=runInfra();if(infra)await infra.uiYield();}
    if(step.ok!==true||runtime?.active!==true||runSerial!==serial)break;
    await sleepBetweenBattles();
    if(catchUpNeedsFinalSync&&!fastCatchUpActive()){
     const finalPolicy=catchUpFinal();
     if(typeof options.onCatchUpFinal==="function"){try{await options.onCatchUpFinal({snapshot:runtimeSnapshot(),lastResult:lastStep,policy:finalPolicy});}catch(error){console.error(error);}}
     catchUpNeedsFinalSync=false;
    }
   }
  }catch(error){
   caughtError=error;
   if(runtime?.active===true&&runSerial===serial)lastSnapshot=clearRuntime("battle-error");
   else lastSnapshot=lastFinishedRunSnapshot(runId)||lastSnapshot;
   lastStep=freeze({ok:false,world:3,reason:"battle-error",error:String(error?.message||error),snapshot:lastSnapshot});
   console.error(error);
  }finally{
   if(runtime?.active===true&&runSerial===serial)runtime.looping=false;
  }
  if(catchUpNeedsFinalSync&&typeof options.onCatchUpFinal==="function"){
   const finalPolicy=catchUpFinal();
   try{await options.onCatchUpFinal({snapshot:lastSnapshot,lastResult:lastStep,policy:finalPolicy});}catch(error){console.error(error);}
  }
  const completed=Math.max(total,Math.max(0,finiteWhole(lastSnapshot?.battles,startedBattleCount)-startedBattleCount));
  const summaries=boundedSummaries(recent),runTotals=freeze({version:RUN_TOTALS_VERSION,effectivePermanentDamage:totals.effectivePermanentDamage,xp:totals.xp,dimensionalStrings:totals.dimensionalStrings,itemCount:totals.itemCount});
  return freeze({ok:caughtError==null,world:3,runId,battles:completed,totals:runTotals,results:summaries,recentBattles:summaries,resultsTruncated:completed>summaries.length,lastResult:lastStep,snapshot:lastSnapshot,reason:caughtError?"battle-error":"",error:caughtError?String(caughtError?.message||caughtError):""});
 }
 function validate(){
  const errors=[];
  const maxCore=coreMaxLevel(),p0=suppressionPerDeathPoints(0),p1=suppressionPerDeathPoints(1),pMax=suppressionPerDeathPoints(maxCore),h0=hpCapSnapshot(500,{thirdWorld:{coreLevel:0}},10000),hMax=hpCapSnapshot(500,{thirdWorld:{coreLevel:maxCore}},10000),hMid=hpCapSnapshot(250,{thirdWorld:{coreLevel:5}},10000),hOverride=hpCapSnapshot(500,{thirdWorld:{coreLevel:maxCore}},10000,0),life=battleOptions({},freeze({hpCap:777})),backgroundPolicy=backgroundPolicySnapshot();
  const ownMinimalProbe=normalizeRuntimeConflict({blocked:true,blockers:["minimal-mode-open"],activeBackgroundKind:FLOW_KIND},true);
  const foreignMinimalProbe=normalizeRuntimeConflict({blocked:true,blockers:["minimal-mode-open"],activeBackgroundKind:FLOW_KIND},false);
  const mixedMinimalProbe=normalizeRuntimeConflict({blocked:true,blockers:["minimal-mode-open","arena-active"],activeBackgroundKind:FLOW_KIND},true);
  if(maxCore!==10)errors.push({code:"CORE_MAX_OWNER",maxCore});
  if(MAX_DEATHS!==500||p0!==.1||p1!==.092||pMax!==.02)errors.push({code:"SUPPRESSION_ENDPOINTS",maxDeaths:MAX_DEATHS,p0,p1,pMax,maxCore});
  if(h0.hpCapPercent!==50||h0.hpCap!==5000||hMax.hpCapPercent!==90||hMax.hpCap!==9000)errors.push({code:"FIVE_HUNDRED_DEATH_CAP",h0,hMax});
  if(hMid.perDeathSuppressionPoints!==.06||hMid.hpCapPercent!==85||hMid.hpCap!==8500)errors.push({code:"MID_CORE_CAP",hMid});
  if(hOverride.coreLevel!==0||hOverride.hpCapPercent!==50||hOverride.hpCap!==5000)errors.push({code:"RUN_START_CORE_OVERRIDE",hOverride});
  if(life.startHp!==777||life.playerHealCap!==777)errors.push({code:"HP_LIFECYCLE_CAP",life});
  if(ownMinimalProbe.blocked||ownMinimalProbe.blockers.length!==0||foreignMinimalProbe.blocked!==true||foreignMinimalProbe.blockers[0]!=="minimal-mode-open"||mixedMinimalProbe.blocked!==true||mixedMinimalProbe.blockers.length!==1||mixedMinimalProbe.blockers[0]!=="arena-active")errors.push({code:"OWN_MINIMAL_MODE_GUARD",ownMinimalProbe,foreignMinimalProbe,mixedMinimalProbe});
  if(terminalReasonForStep("stage-crossed",true,true)!=="stage-crossed"||terminalReasonForStep("",true,true)!=="progress-event"||terminalReasonForStep("",false,true)!=="death-limit"||terminalReasonForStep("",false,false)!=="")errors.push({code:"TERMINAL_PRECEDENCE"});
  const persistent=Array.from(window.THIRD_WORLD_PERSISTENT_KEYS||[]);
  if(["deaths","suppression","run","runId","targetBossIndex","pendingEvents","recentBattles","lastBattleSummary","lastFinishedRun","lastFinishedRuntime","coreLevelAtStart","perDeathSuppressionPointsAtStart","runTotals"].some(key=>persistent.includes(key)))errors.push({code:"TRANSIENT_PERSISTENCE_LEAK",persistent});
  if(typeof window.runThirdWorldBossCombat!=="function"||typeof window.settleThirdWorldCombatResult!=="function")errors.push({code:"FORMAL_OWNER_MISSING"});
  if(typeof window.backgroundProgressFastCatchUpActive!=="function"||typeof window.backgroundProgressCatchUpStep!=="function"||typeof window.backgroundProgressCatchUpFinalPolicy!=="function"||typeof window.backgroundProgressConsumeCatchUpCredit!=="function"||typeof window.backgroundProgressUiYield!=="function"||window.BACKGROUND_PROGRESS_FAST_CATCH_UP_POLICY_INTEGRITY?.passed!==true)errors.push({code:"FAST_CATCH_UP_OWNER_MISSING"});
  if(typeof window.createContinuousRunInfrastructure!=="function"||Number(window.CONTINUOUS_RUN_INFRA_VERSION)!==SHARED_CONTINUOUS_INFRA_VERSION||window.CONTINUOUS_RUN_INFRA_INTEGRITY?.passed!==true||!runInfra())errors.push({code:"SHARED_CONTINUOUS_INFRA_MISSING"});
  if(typeof window.thirdWorldCoreSnapshot!=="function"||typeof window.upgradeThirdWorldCore!=="function"||window.THIRD_WORLD_CORE_INTEGRITY?.passed!==true)errors.push({code:"CORE_PROGRESSION_OWNER_MISSING"});
  if(typeof window.backgroundProgressActiveKind!=="function"||typeof window.worldTransitionRuntimeStatus!=="function")errors.push({code:"ACTIVE_FLOW_GUARD_OWNER_MISSING"});
  if(typeof window.backgroundProgressEnvironmentIsBackground!=="function"||typeof window.backgroundProgressOnEnvironmentChange!=="function"||typeof window.gmBackgroundBattleEnabled!=="function")errors.push({code:"BACKGROUND_GM_GATE_OWNER_MISSING"});
  if(typeof window.isMinimalModeOpen!=="function"||typeof window.getMinimalModeAdapterId!=="function")errors.push({code:"MINIMAL_MODE_OWNER_MISSING"});
  if(backgroundPolicy?.version!==BACKGROUND_POLICY_VERSION||backgroundPolicy?.waitsForForeground!==!gmBackgroundEnabled())errors.push({code:"BACKGROUND_POLICY_SNAPSHOT",backgroundPolicy});
  if(typeof window.backgroundProgressOnPageHide!=="function"||pageHideSubscribed!==true)errors.push({code:"PAGEHIDE_OWNER_MISSING"});
  if(typeof window.registerWorldTransitionRuntimeBlocker!=="function"||blockerRegistered!==true)errors.push({code:"RUNTIME_BLOCKER_OWNER_MISSING"});
  const bounded=boundedSummaries(Array.from({length:RECENT_HISTORY_LIMIT+5},(_,index)=>freeze({version:RESULT_SUMMARY_VERSION,battleNumber:index+1})));
  if(bounded.length!==RECENT_HISTORY_LIMIT||bounded[0]?.battleNumber!==6||bounded[bounded.length-1]?.battleNumber!==RECENT_HISTORY_LIMIT+5)errors.push({code:"BOUNDED_HISTORY",length:bounded.length,first:bounded[0]||null,last:bounded[bounded.length-1]||null});
  const battleSource=Function.prototype.toString.call(runOneBattle),startSource=Function.prototype.toString.call(startRun),loopSource=Function.prototype.toString.call(runLoop),clearSource=Function.prototype.toString.call(clearRuntime),lastFinishedSource=Function.prototype.toString.call(lastFinishedRunSnapshot),conflictSource=Function.prototype.toString.call(runtimeConflictStatus);
  if(/pauseForProgressEvents/.test(battleSource)||!/terminalReasonForStep/.test(battleSource)||!/clearRuntime\(terminalReason\)/.test(battleSource))errors.push({code:"PROGRESS_EVENT_TERMINAL_WIRING"});
  if(!/runtime\.coreLevelAtStart/.test(battleSource)||!/coreLevelAtStart/.test(startSource)||!/perDeathSuppressionPointsAtStart/.test(startSource))errors.push({code:"CORE_RUN_SNAPSHOT_WIRING"});
  if(!/if\(step\?\.ok===true\)total\+=1/.test(loopSource))errors.push({code:"FORMAL_BATTLE_COUNT_WIRING"});
  if(!/totals\.effectivePermanentDamage/.test(loopSource)||!/itemCount/.test(loopSource)||!/runTotals/.test(loopSource))errors.push({code:"RUN_TOTALS_WIRING"});
  if(!/catch\(error\)/.test(loopSource)||!/clearRuntime\("battle-error"\)/.test(loopSource)||!/ok:caughtError==null/.test(loopSource))errors.push({code:"RUN_EXCEPTION_CLEANUP_WIRING"});
  if(!/runId/.test(startSource)||!/expectedRunId/.test(lastFinishedSource)||!/lastFinishedRuntime\.runId/.test(lastFinishedSource))errors.push({code:"RUN_IDENTITY_WIRING"});
  if(!/gmBackgroundEnabled\(\).*startBackgroundFlow/.test(startSource)||!/else stopBackgroundFlow/.test(startSource))errors.push({code:"BACKGROUND_GM_GATE_WIRING"});
  if(!/waitForForegroundIfBackgroundDisabled/.test(loopSource))errors.push({code:"FOREGROUND_WAIT_WIRING"});
  if(!/lastFinishedRuntime=finishedSnapshot/.test(clearSource)||lastFinishedRunSnapshot()!==null)errors.push({code:"LAST_FINISHED_SNAPSHOT_WIRING"});
  if(!/continuous-run-infrastructure-missing/.test(conflictSource)||!/normalizeRuntimeConflict/.test(conflictSource))errors.push({code:"STRICT_SHARED_INFRA_WIRING"});
  return freeze({version:INTEGRITY_VERSION,backgroundGmGateVersion:BACKGROUND_GM_GATE_VERSION,foregroundWaitVersion:FOREGROUND_WAIT_VERSION,backgroundPolicyVersion:BACKGROUND_POLICY_VERSION,ownMinimalModeGuardVersion:OWN_MINIMAL_MODE_GUARD_VERSION,runTotalsVersion:RUN_TOTALS_VERSION,runIdentityVersion:RUN_IDENTITY_VERSION,exceptionCleanupVersion:EXCEPTION_CLEANUP_VERSION,passed:errors.length===0,errors:freeze(errors.slice())});
 }
 function stopRun(reason="manual"){return clearRuntime(reason);}
 function onPageHide(){if(runtime?.active)clearRuntime("pagehide");}
 const sharedInfra=runInfra();
 if(sharedInfra){sharedInfra.onPageHide(onPageHide);pageHideSubscribed=true;blockerRegistered=sharedInfra.registerRuntimeBlocker(BLOCKER_NAME,ownRuntimeBlockerStatus);}

 window.THIRD_WORLD_RUN_VERSION=VERSION;
 window.THIRD_WORLD_VIP20_DEATH_PROTECTION_VERSION=VIP20_DEATH_PROTECTION_VERSION;
 window.THIRD_WORLD_SUPPRESSION_VERSION=SUPPRESSION_VERSION;
 window.THIRD_WORLD_CONTINUOUS_RUNTIME_VERSION=RUNTIME_VERSION;
 window.THIRD_WORLD_RUN_EVENT_PAUSE_VERSION=0;
 window.THIRD_WORLD_RUN_EVENT_TERMINAL_VERSION=EVENT_TERMINAL_VERSION;
 window.THIRD_WORLD_RUN_LEGACY_EVENT_ACK_VERSION=LEGACY_EVENT_ACK_VERSION;
 window.THIRD_WORLD_RUN_PAGEHIDE_RESET_VERSION=PAGEHIDE_RESET_VERSION;
 window.THIRD_WORLD_RUN_FAST_CATCH_UP_VERSION=FAST_CATCH_UP_VERSION;
 window.THIRD_WORLD_RUN_BOUNDED_HISTORY_VERSION=BOUNDED_HISTORY_VERSION;
 window.THIRD_WORLD_RUN_ACTIVE_FLOW_GUARD_VERSION=ACTIVE_FLOW_GUARD_VERSION;
 window.THIRD_WORLD_RUN_SHARED_PAGEHIDE_OWNER_VERSION=SHARED_PAGEHIDE_OWNER_VERSION;
 window.THIRD_WORLD_RUN_SHARED_CONTINUOUS_INFRA_VERSION=SHARED_CONTINUOUS_INFRA_VERSION;
 window.THIRD_WORLD_RUN_SHARED_INFRA_STRICT_VERSION=SHARED_INFRA_STRICT_VERSION;
 window.THIRD_WORLD_RUN_CORE_SNAPSHOT_VERSION=CORE_RUN_SNAPSHOT_VERSION;
 window.THIRD_WORLD_RUN_HP_LIFECYCLE_VERSION=HP_LIFECYCLE_VERSION;
 window.THIRD_WORLD_RUN_LAST_FINISHED_SNAPSHOT_VERSION=LAST_FINISHED_SNAPSHOT_VERSION;
 window.THIRD_WORLD_RUN_FORMAL_BATTLE_COUNT_VERSION=FORMAL_BATTLE_COUNT_VERSION;
 window.THIRD_WORLD_RUN_RESULT_SUMMARY_VERSION=RESULT_SUMMARY_VERSION;
 window.THIRD_WORLD_RUN_TOTALS_VERSION=RUN_TOTALS_VERSION;
 window.THIRD_WORLD_RUN_IDENTITY_VERSION=RUN_IDENTITY_VERSION;
 window.THIRD_WORLD_RUN_EXCEPTION_CLEANUP_VERSION=EXCEPTION_CLEANUP_VERSION;
 window.THIRD_WORLD_RUN_INTEGRITY_VERSION=INTEGRITY_VERSION;
 window.THIRD_WORLD_RUN_BACKGROUND_GM_GATE_VERSION=BACKGROUND_GM_GATE_VERSION;
 window.THIRD_WORLD_RUN_FOREGROUND_WAIT_VERSION=FOREGROUND_WAIT_VERSION;
 window.THIRD_WORLD_RUN_BACKGROUND_POLICY_VERSION=BACKGROUND_POLICY_VERSION;
 window.THIRD_WORLD_RUN_OWN_MINIMAL_MODE_GUARD_VERSION=OWN_MINIMAL_MODE_GUARD_VERSION;
 window.THIRD_WORLD_RUN_MAX_DEATHS=MAX_DEATHS;
 window.THIRD_WORLD_RUN_RECENT_HISTORY_LIMIT=RECENT_HISTORY_LIMIT;
 window.THIRD_WORLD_SUPPRESSION_BASE_POINTS=BASE_SUPPRESSION_PER_DEATH;
 window.THIRD_WORLD_CORE_SUPPRESSION_REDUCTION_PER_LEVEL=CORE_REDUCTION_PER_LEVEL;
 window.thirdWorldSuppressionPerDeathPoints=suppressionPerDeathPoints;
 window.thirdWorldRunHpCapSnapshot=hpCapSnapshot;
 window.thirdWorldRunConflictStatus=runtimeConflictStatus;
 window.thirdWorldRunBackgroundPolicySnapshot=backgroundPolicySnapshot;
 window.thirdWorldContinuousRunSnapshot=runtimeSnapshot;
 window.thirdWorldLastFinishedRunSnapshot=lastFinishedRunSnapshot;
 window.startThirdWorldContinuousRun=startRun;
 window.stopThirdWorldContinuousRun=stopRun;
 window.acknowledgeThirdWorldContinuousRunEvents=acknowledgeEvents;
 window.runThirdWorldContinuousBattle=runOneBattle;
 window.runThirdWorldContinuousLoop=runLoop;
 window.THIRD_WORLD_RUN_INTEGRITY=validate();
 if(!window.THIRD_WORLD_RUN_INTEGRITY.passed)console.error("[文明戰線] Third-world run integrity error",window.THIRD_WORLD_RUN_INTEGRITY.errors);
})();