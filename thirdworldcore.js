(function(){
 const VERSION=2;
 const UPGRADE_VERSION=1;
 const RUN_LOCK_VERSION=2;
 const TARGET_RUN_ISOLATION_VERSION=1;
 const COST_PER_LEVEL=1000000000;

 function freeze(value){return Object.freeze(value);}
 function currentState(){try{return typeof state!=="undefined"&&state&&typeof state==="object"?state:null;}catch(_){return null;}}
 function finiteWhole(value,fallback=0){const n=Math.floor(Number(value));return Number.isFinite(n)?n:fallback;}
 function maxLevel(){return Math.max(0,finiteWhole(window.THIRD_WORLD_CORE_MAX_LEVEL,10));}
 function runSnapshot(){return typeof window.thirdWorldContinuousRunSnapshot==="function"?window.thirdWorldContinuousRunSnapshot():null;}
 function isFormalTarget(target){const live=currentState();return !!live&&target===live;}
 function runActive(target=currentState()){return isFormalTarget(target)&&runSnapshot()?.active===true;}
 function reject(code,reason,snapshot=null){return freeze({ok:false,code:String(code||"core-upgrade-rejected"),reason:String(reason||"界弦核心升級遭拒。"),snapshot:snapshot||coreSnapshot()});}
 function coreSnapshot(target=currentState()){
  const third=target?.thirdWorld&&typeof target.thirdWorld==="object"?target.thirdWorld:null;
  const entered=third?.entered===true;
  const level=Math.max(0,Math.min(maxLevel(),finiteWhole(third?.coreLevel,0)));
  const dimensionalStrings=Math.max(0,finiteWhole(third?.dimensionalStrings,0));
  const atMax=level>=maxLevel();
  const active=runActive(target);
  let reason="";
  if(!entered)reason="not-entered";
  else if(active)reason="run-active";
  else if(atMax)reason="max-level";
  else if(dimensionalStrings<COST_PER_LEVEL)reason="insufficient-dimensional-strings";
  return freeze({
   version:VERSION,entered,level,maxLevel:maxLevel(),atMax,costPerLevel:COST_PER_LEVEL,
   dimensionalStrings,nextCost:atMax?0:COST_PER_LEVEL,totalCostToMax:Math.max(0,maxLevel()-level)*COST_PER_LEVEL,
   runActive:active,formalTarget:isFormalTarget(target),canUpgrade:reason==="",reason
  });
 }
 function upgradeCore(){
  const before=coreSnapshot();
  if(!before.entered)return reject("not-entered","尚未進入高維紀元。",before);
  if(before.runActive)return reject("run-active","高維連戰進行中，必須先停止連戰才能升級界弦核心。",before);
  if(before.atMax)return reject("max-level","界弦核心已達最高等級。",before);
  if(before.dimensionalStrings<COST_PER_LEVEL)return reject("insufficient-dimensional-strings","維度之弦不足，無法升級界弦核心。",before);
  if(typeof window.runSettlementTransaction!=="function")return reject("transaction-owner-missing","共用原子交易 owner 尚未載入。",before);
  const tx=window.runSettlementTransaction({
   label:"third-world-core-upgrade",
   mutate:live=>{
    if(runActive(live))return {ok:false,reason:"run-active"};
    const third=live?.thirdWorld;
    if(!third||third.entered!==true)return {ok:false,reason:"not-entered"};
    const level=Math.max(0,Math.min(maxLevel(),finiteWhole(third.coreLevel,0)));
    const strings=Math.max(0,finiteWhole(third.dimensionalStrings,0));
    if(level>=maxLevel())return {ok:false,reason:"max-level"};
    if(strings<COST_PER_LEVEL)return {ok:false,reason:"insufficient-dimensional-strings"};
    third.coreLevel=level+1;
    third.dimensionalStrings=strings-COST_PER_LEVEL;
    return {ok:true,levelBefore:level,levelAfter:third.coreLevel,dimensionalStringsBefore:strings,dimensionalStringsAfter:third.dimensionalStrings,cost:COST_PER_LEVEL};
   }
  });
  if(tx?.ok!==true){
   const code=String(tx?.reason||"transaction-failed");
   const messages={
    "run-active":"高維連戰進行中，必須先停止連戰才能升級界弦核心。",
    "not-entered":"尚未進入高維紀元。",
    "max-level":"界弦核心已達最高等級。",
    "insufficient-dimensional-strings":"維度之弦不足，無法升級界弦核心。",
    "save-failed":"界弦核心升級存檔失敗，已回復升級前狀態。",
    "save-exception":"界弦核心升級存檔發生錯誤，已回復升級前狀態。"
   };
   return freeze({ok:false,code,reason:messages[code]||"界弦核心升級失敗，狀態已安全回復。",rolledBack:tx?.rolledBack===true,snapshot:coreSnapshot(),transaction:tx||null});
  }
  return freeze({ok:true,code:"upgraded",...tx.value,snapshot:coreSnapshot(),transaction:tx});
 }
 function validate(){
  const errors=[];
  if(maxLevel()!==10)errors.push({code:"CORE_MAX_LEVEL",actual:maxLevel()});
  if(COST_PER_LEVEL!==1000000000)errors.push({code:"CORE_COST",actual:COST_PER_LEVEL});
  if(maxLevel()*COST_PER_LEVEL!==10000000000)errors.push({code:"CORE_TOTAL_COST"});
  if(typeof window.runSettlementTransaction!=="function")errors.push({code:"TRANSACTION_OWNER_MISSING"});
  const sandbox={thirdWorld:{entered:true,coreLevel:5,dimensionalStrings:3000000000}},probe=coreSnapshot(sandbox);
  if(probe.level!==5||probe.costPerLevel!==COST_PER_LEVEL||probe.totalCostToMax!==5000000000)errors.push({code:"SNAPSHOT_RULE",probe});
  if(probe.formalTarget!==false||probe.runActive!==false||runActive(sandbox)!==false)errors.push({code:"TARGET_RUNTIME_ISOLATION",probe});
  return freeze({version:VERSION,upgradeVersion:UPGRADE_VERSION,runLockVersion:RUN_LOCK_VERSION,targetRunIsolationVersion:TARGET_RUN_ISOLATION_VERSION,passed:errors.length===0,errors:freeze(errors)});
 }

 window.THIRD_WORLD_CORE_PROGRESSION_VERSION=VERSION;
 window.THIRD_WORLD_CORE_UPGRADE_VERSION=UPGRADE_VERSION;
 window.THIRD_WORLD_CORE_RUN_LOCK_VERSION=RUN_LOCK_VERSION;
 window.THIRD_WORLD_CORE_TARGET_RUN_ISOLATION_VERSION=TARGET_RUN_ISOLATION_VERSION;
 window.THIRD_WORLD_CORE_COST_PER_LEVEL=COST_PER_LEVEL;
 window.thirdWorldCoreSnapshot=coreSnapshot;
 window.thirdWorldCoreRunActive=runActive;
 window.upgradeThirdWorldCore=upgradeCore;
 window.THIRD_WORLD_CORE_INTEGRITY=validate();
 if(!window.THIRD_WORLD_CORE_INTEGRITY.passed)console.error("[文明戰線] Third-world core integrity error",window.THIRD_WORLD_CORE_INTEGRITY.errors);
})();
