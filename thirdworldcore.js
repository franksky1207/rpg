(function(){
 const VERSION=3;
 const UPGRADE_VERSION=1;
 const INJECTION_VERSION=1;
 const RUN_LOCK_VERSION=2;
 const TARGET_RUN_ISOLATION_VERSION=1;
 const INVESTMENT_NORMALIZATION_OWNER_VERSION=1;
 const COST_PER_LEVEL=Math.max(1,Math.floor(Number(window.THIRD_WORLD_CORE_PROGRESS_PER_LEVEL)||1000000000));

 function freeze(value){return Object.freeze(value);}
 function currentState(){try{return typeof state!=="undefined"&&state&&typeof state==="object"?state:null;}catch(_){return null;}}
 function finiteWhole(value,fallback=0){const n=Math.floor(Number(value));return Number.isFinite(n)?n:fallback;}
 function maxLevel(){return Math.max(0,finiteWhole(window.THIRD_WORLD_CORE_MAX_LEVEL,10));}
 function runSnapshot(){return typeof window.thirdWorldContinuousRunSnapshot==="function"?window.thirdWorldContinuousRunSnapshot():null;}
 function isFormalTarget(target){const live=currentState();return !!live&&target===live;}
 function runActive(target=currentState()){return isFormalTarget(target)&&runSnapshot()?.active===true;}
 function normalizedLevel(value){return Math.max(0,Math.min(maxLevel(),finiteWhole(value,0)));}
 function investmentSnapshot(target=currentState()){
  const third=target?.thirdWorld&&typeof target.thirdWorld==="object"?target.thirdWorld:{};
  if(typeof window.normalizeThirdWorldCoreInvestment==="function"){
   const row=window.normalizeThirdWorldCoreInvestment(third.coreLevel,third.coreProgress,third.dimensionalStrings,{preserveOverflow:true});
   return {level:normalizedLevel(row?.level),progress:Math.max(0,finiteWhole(row?.progress,0)),strings:Math.max(0,finiteWhole(row?.dimensionalStrings,0))};
  }
  const level=normalizedLevel(third.coreLevel),progress=level>=maxLevel()?0:Math.max(0,Math.min(COST_PER_LEVEL-1,finiteWhole(third.coreProgress,0))),strings=Math.max(0,finiteWhole(third.dimensionalStrings,0));
  return {level,progress,strings};
 }
 function reject(code,reason,snapshot=null){return freeze({ok:false,code:String(code||"core-injection-rejected"),reason:String(reason||"界弦核心注入遭拒。"),snapshot:snapshot||coreSnapshot()});}
 function injectionPlan(target=currentState()){
  const third=target?.thirdWorld&&typeof target.thirdWorld==="object"?target.thirdWorld:null;
  const entered=third?.entered===true,investment=investmentSnapshot(target),level=investment.level,progress=investment.progress,strings=investment.strings,atMax=level>=maxLevel();
  const remainingCapacity=atMax?0:Math.max(0,(maxLevel()-level)*COST_PER_LEVEL-progress);
  const injected=Math.min(strings,remainingCapacity),combined=progress+injected,levelsGained=atMax?0:Math.min(maxLevel()-level,Math.floor(combined/COST_PER_LEVEL)),levelAfter=level+levelsGained,progressAfter=levelAfter>=maxLevel()?0:combined-levelsGained*COST_PER_LEVEL,stringsAfter=strings-injected;
  return freeze({entered,levelBefore:level,levelAfter,coreProgressBefore:progress,coreProgressAfter:progressAfter,dimensionalStringsBefore:strings,dimensionalStringsAfter:stringsAfter,injected,levelsGained,reachedMax:levelAfter>=maxLevel(),remainingCapacity});
 }
 function coreSnapshot(target=currentState()){
  const third=target?.thirdWorld&&typeof target.thirdWorld==="object"?target.thirdWorld:null;
  const entered=third?.entered===true;
  const investment=investmentSnapshot(target),level=investment.level,coreProgress=investment.progress,dimensionalStrings=investment.strings;
  const atMax=level>=maxLevel();
  const active=runActive(target);
  const remainingToNext=atMax?0:Math.max(0,COST_PER_LEVEL-coreProgress);
  const totalCostToMax=atMax?0:Math.max(0,(maxLevel()-level)*COST_PER_LEVEL-coreProgress);
  const availableInjection=Math.min(dimensionalStrings,totalCostToMax);
  let reason="";
  if(!entered)reason="not-entered";
  else if(active)reason="run-active";
  else if(atMax)reason="max-level";
  else if(dimensionalStrings<=0)reason="no-dimensional-strings";
  return freeze({version:VERSION,entered,level,maxLevel:maxLevel(),atMax,costPerLevel:COST_PER_LEVEL,coreProgress,progressRequired:COST_PER_LEVEL,progressPercent:atMax?100:coreProgress/COST_PER_LEVEL*100,dimensionalStrings,nextCost:remainingToNext,remainingToNext,totalCostToMax,availableInjection,runActive:active,formalTarget:isFormalTarget(target),canInject:reason==="",canUpgrade:reason==="",reason});
 }
 function injectAllCoreStrings(){
  const before=coreSnapshot();
  if(!before.entered)return reject("not-entered","尚未進入高維紀元。",before);
  if(before.runActive)return reject("run-active","高維連戰進行中，必須先停止連戰才能注入界弦核心。",before);
  if(before.atMax)return reject("max-level","界弦核心已達最高等級。",before);
  if(before.dimensionalStrings<=0)return reject("no-dimensional-strings","目前沒有可注入的維度之弦。",before);
  if(typeof window.runSettlementTransaction!=="function")return reject("transaction-owner-missing","共用原子交易 owner 尚未載入。",before);
  const tx=window.runSettlementTransaction({
   label:"third-world-core-injection",
   mutate:live=>{
    if(runActive(live))return {ok:false,reason:"run-active"};
    if(!live?.thirdWorld||live.thirdWorld.entered!==true)return {ok:false,reason:"not-entered"};
    if(typeof window.normalizeThirdWorldState==="function")window.normalizeThirdWorldState(live);
    const third=live?.thirdWorld,plan=injectionPlan(live);
    if(!third||third.entered!==true)return {ok:false,reason:"not-entered"};
    if(plan.levelBefore>=maxLevel())return {ok:false,reason:"max-level"};
    if(plan.dimensionalStringsBefore<=0||plan.injected<=0)return {ok:false,reason:"no-dimensional-strings"};
    third.coreLevel=plan.levelAfter;
    third.coreProgress=plan.coreProgressAfter;
    third.dimensionalStrings=plan.dimensionalStringsAfter;
    return {ok:true,levelBefore:plan.levelBefore,levelAfter:plan.levelAfter,coreProgressBefore:plan.coreProgressBefore,coreProgressAfter:plan.coreProgressAfter,dimensionalStringsBefore:plan.dimensionalStringsBefore,dimensionalStringsAfter:plan.dimensionalStringsAfter,injected:plan.injected,levelsGained:plan.levelsGained,reachedMax:plan.reachedMax,costPerLevel:COST_PER_LEVEL};
   }
  });
  if(tx?.ok!==true){
   const code=String(tx?.reason||"transaction-failed"),messages={"run-active":"高維連戰進行中，必須先停止連戰才能注入界弦核心。","not-entered":"尚未進入高維紀元。","max-level":"界弦核心已達最高等級。","no-dimensional-strings":"目前沒有可注入的維度之弦。","save-failed":"界弦核心注入存檔失敗，已回復注入前狀態。","save-exception":"界弦核心注入存檔發生錯誤，已回復注入前狀態。"};
   return freeze({ok:false,code,reason:messages[code]||"界弦核心注入失敗，狀態已安全回復。",rolledBack:tx?.rolledBack===true,snapshot:coreSnapshot(),transaction:tx||null});
  }
  return freeze({ok:true,code:"injected",...tx.value,snapshot:coreSnapshot(),transaction:tx});
 }
 function upgradeCore(){return injectAllCoreStrings();}
 function validate(){
  const errors=[];
  if(maxLevel()!==10)errors.push({code:"CORE_MAX_LEVEL",actual:maxLevel()});
  if(COST_PER_LEVEL!==1000000000)errors.push({code:"CORE_COST",actual:COST_PER_LEVEL});
  if(maxLevel()*COST_PER_LEVEL!==10000000000)errors.push({code:"CORE_TOTAL_COST"});
  if(typeof window.runSettlementTransaction!=="function")errors.push({code:"TRANSACTION_OWNER_MISSING"});
  if(typeof window.normalizeThirdWorldCoreInvestment!=="function")errors.push({code:"INVESTMENT_NORMALIZATION_OWNER_MISSING"});
  const sandbox={thirdWorld:{entered:true,coreLevel:5,coreProgress:400000000,dimensionalStrings:3000000000}},probe=coreSnapshot(sandbox);
  if(probe.level!==5||probe.coreProgress!==400000000||probe.remainingToNext!==600000000||probe.totalCostToMax!==4600000000||probe.availableInjection!==3000000000)errors.push({code:"SNAPSHOT_RULE",probe});
  if(probe.formalTarget!==false||probe.runActive!==false||runActive(sandbox)!==false)errors.push({code:"TARGET_RUNTIME_ISOLATION",probe});
  const cross=injectionPlan({thirdWorld:{entered:true,coreLevel:2,coreProgress:700000000,dimensionalStrings:2800000000}});
  if(cross.levelAfter!==5||cross.coreProgressAfter!==500000000||cross.dimensionalStringsAfter!==0||cross.levelsGained!==3||cross.injected!==2800000000)errors.push({code:"MULTI_LEVEL_INJECTION_PLAN",cross});
  const malformed=injectionPlan({thirdWorld:{entered:true,coreLevel:4,coreProgress:1500000000,dimensionalStrings:250000000}});
  if(malformed.levelBefore!==5||malformed.coreProgressBefore!==500000000||malformed.dimensionalStringsBefore!==250000000)errors.push({code:"MALFORMED_PROGRESS_CARRY_FORWARD",malformed});
  const capped=injectionPlan({thirdWorld:{entered:true,coreLevel:9,coreProgress:900000000,dimensionalStrings:5000000000}});
  if(capped.levelAfter!==10||capped.coreProgressAfter!==0||capped.dimensionalStringsAfter!==4900000000||capped.injected!==100000000||capped.levelsGained!==1||capped.reachedMax!==true)errors.push({code:"MAX_LEVEL_EXCESS_PRESERVED",capped});
  return freeze({version:VERSION,upgradeVersion:UPGRADE_VERSION,injectionVersion:INJECTION_VERSION,runLockVersion:RUN_LOCK_VERSION,targetRunIsolationVersion:TARGET_RUN_ISOLATION_VERSION,investmentNormalizationOwnerVersion:INVESTMENT_NORMALIZATION_OWNER_VERSION,passed:errors.length===0,errors:freeze(errors)});
 }

 window.THIRD_WORLD_CORE_PROGRESSION_VERSION=VERSION;
 window.THIRD_WORLD_CORE_UPGRADE_VERSION=UPGRADE_VERSION;
 window.THIRD_WORLD_CORE_INJECTION_VERSION=INJECTION_VERSION;
 window.THIRD_WORLD_CORE_RUN_LOCK_VERSION=RUN_LOCK_VERSION;
 window.THIRD_WORLD_CORE_TARGET_RUN_ISOLATION_VERSION=TARGET_RUN_ISOLATION_VERSION;
 window.THIRD_WORLD_CORE_INVESTMENT_NORMALIZATION_OWNER_VERSION=INVESTMENT_NORMALIZATION_OWNER_VERSION;
 window.THIRD_WORLD_CORE_COST_PER_LEVEL=COST_PER_LEVEL;
 window.thirdWorldCoreSnapshot=coreSnapshot;
 window.thirdWorldCoreInjectionPlan=injectionPlan;
 window.thirdWorldCoreRunActive=runActive;
 window.injectAllThirdWorldCoreStrings=injectAllCoreStrings;
 window.upgradeThirdWorldCore=upgradeCore;
 window.THIRD_WORLD_CORE_INTEGRITY=validate();
 if(!window.THIRD_WORLD_CORE_INTEGRITY.passed)console.error("[文明戰線] Third-world core integrity error",window.THIRD_WORLD_CORE_INTEGRITY.errors);
})();