(function(){
 const VERSION=1;
 const TARGET_VERSION=1;
 const SAMPLE_HOOK_VERSION=1;
 const WORLD=3;
 const TARGET_TYPE="higher-dimensional";
 const REAL_BATTLE_MIN_MS=100;
 const REAL_BATTLE_MAX_MS=601000;
 const MAX_ACTUAL_MS=300000;
 const FLOW_KIND="third-world";
 const baseResolve=typeof window.resolveOfflineFarmTarget==="function"?window.resolveOfflineFarmTarget:null;
 const baseCombat=typeof window.runThirdWorldBossCombat==="function"?window.runThirdWorldBossCombat:null;
 const baseSettlement=typeof window.settleThirdWorldCombatResult==="function"?window.settleThirdWorldCombatResult:null;
 const tokensByCombat=new WeakMap();

 function now(){return Date.now();}
 function finiteWhole(value,fallback=0){const n=Math.floor(Number(value));return Number.isFinite(n)?n:fallback;}
 function currentState(){try{return typeof state!=="undefined"&&state&&typeof state==="object"?state:null;}catch(_){return null;}}
 function currentPhase(target=currentState()){
  if(typeof window.currentWorldPhase==="function")return Number(window.currentWorldPhase(target))||1;
  return target?.thirdWorld?.entered===true?3:target?.secondWorld?.entered===true?2:1;
 }
 function formalWorld3(target=currentState()){
  return !!target&&currentPhase(target)===3&&(typeof window.worldProgressionEnabled!=="function"||window.worldProgressionEnabled(3,target)===true);
 }
 function currentCombatSpeed(){
  const speed=typeof window.effectiveCombatSpeed==="function"?Number(window.effectiveCombatSpeed()):1;
  return [1,1.5,2].includes(speed)?speed:1;
 }
 function environmentBlocksSample(){
  if(typeof window.backgroundProgressEnvironmentIsBackground==="function"&&window.backgroundProgressEnvironmentIsBackground())return true;
  if(typeof window.backgroundProgressFastCatchUpActive==="function"&&window.backgroundProgressFastCatchUpActive(FLOW_KIND)===true)return true;
  return false;
 }
 function ensureOfflineState(){
  const s=currentState();
  if(!s||typeof window.normalizeOfflineSaveState!=="function")return null;
  return window.normalizeOfflineSaveState(s,{sourceVersion:Number(s.saveVersion)||Number(window.SAVE_SCHEMA_VERSION)||1,currentTime:now()});
 }
 function retainRows(rows){return typeof window.normalizeOfflineBattleSamples==="function"?window.normalizeOfflineBattleSamples(rows):Array.isArray(rows)?rows.slice():[];}
 function beginThirdWorldOfflineBattleSample(){
  const s=currentState();
  if(!formalWorld3(s)||environmentBlocksSample())return null;
  const combatSpeed=currentCombatSpeed();
  if(![1,1.5,2].includes(combatSpeed))return null;
  const token={startedAt:now(),interrupted:false,playerLevel:Math.max(1000,finiteWhole(s.level,1000)),combatSpeed,predictedActualMs:0,unsubscribe:null};
  if(typeof window.backgroundProgressOnEnvironmentChange==="function")token.unsubscribe=window.backgroundProgressOnEnvironmentChange(isBackground=>{if(isBackground)token.interrupted=true;});
  return token;
 }
 function formalPresentationDuration(combat){
  if(typeof window.structuredCombatPresentationDurationMs!=="function")return 0;
  const value=Math.round(Number(window.structuredCombatPresentationDurationMs(combat))||0);
  return Math.max(0,Math.min(MAX_ACTUAL_MS,value));
 }
 function finishThirdWorldOfflineBattleSample(token,combat,settlement,gapMs=null){
  if(!token)return false;
  if(typeof token.unsubscribe==="function")token.unsubscribe();
  if(token.interrupted||environmentBlocksSample()||!formalWorld3())return false;
  if(combat?.ok!==true||combat?.formalSettlementEligible!==true||settlement?.ok!==true||Number(settlement?.world)!==WORLD)return false;
  const wall=Math.round(now()-Number(token.startedAt)),predicted=Math.max(0,finiteWhole(token.predictedActualMs,0));
  const actualMs=Math.max(wall,predicted);
  if(!Number.isFinite(actualMs)||actualMs<REAL_BATTLE_MIN_MS||actualMs>MAX_ACTUAL_MS)return false;
  const baseGap=gapMs==null?Math.max(0,Number(window.COMBAT_OUTER_GAP_MS)||140):Math.max(0,Number(gapMs)||0);
  const gap=Math.round(baseGap),cycleMs=Math.min(REAL_BATTLE_MAX_MS,actualMs+gap),adjustedMs=Math.max(REAL_BATTLE_MIN_MS,Math.min(REAL_BATTLE_MAX_MS,cycleMs));
  const o=ensureOfflineState();
  if(!o)return false;
  const rows=retainRows(o.battleSamples);
  rows.push({sampleVersion:Number(window.OFFLINE_BATTLE_SAMPLE_VERSION)||4,world:WORLD,targetType:TARGET_TYPE,combatSpeed:token.combatSpeed,actualMs,cycleMs,adjustedMs,playerLevel:token.playerLevel,kind:TARGET_TYPE,multiplier:1,recordedAt:now()});
  o.battleSampleVersion=Number(window.OFFLINE_BATTLE_SAMPLE_VERSION)||4;
  o.battleSamples=retainRows(rows);
  return true;
 }
 function legalThirdWorldSample(row){
  return Number(row?.sampleVersion)===Number(window.OFFLINE_BATTLE_SAMPLE_VERSION)&&Number(row?.world)===WORLD&&row?.targetType===TARGET_TYPE&&[1,1.5,2].includes(Number(row?.combatSpeed));
 }
 function convertedMs(row,targetSpeed){
  if(typeof window.convertOfflineSampleMsForSpeed==="function")return Math.max(0,Number(window.convertOfflineSampleMsForSpeed(row,targetSpeed))||0);
  const sourceSpeed=Number(row?.combatSpeed),speed=Number(targetSpeed),actual=Number(row?.actualMs),cycle=Number(row?.cycleMs);
  if(![1,1.5,2].includes(sourceSpeed)||![1,1.5,2].includes(speed)||!Number.isFinite(actual)||!Number.isFinite(cycle)||cycle<actual)return 0;
  return Math.max(REAL_BATTLE_MIN_MS,Math.min(REAL_BATTLE_MAX_MS,Math.round(actual*(sourceSpeed/speed)+(cycle-actual))));
 }
 function resolveThirdWorldTarget(){
  const o=ensureOfflineState(),speed=currentCombatSpeed();
  if(!o)return null;
  const rows=(Array.isArray(o.battleSamples)?o.battleSamples:[]).filter(legalThirdWorldSample);
  if(!rows.length)return null;
  const exact=rows.filter(row=>Number(row.combatSpeed)===speed),selected=exact.length?exact:rows;
  const values=selected.map(row=>convertedMs(row,speed)).filter(value=>value>0);
  if(!values.length)return null;
  const avgBattleMs=Math.max(REAL_BATTLE_MIN_MS,Math.min(REAL_BATTLE_MAX_MS,Math.round(values.reduce((sum,value)=>sum+value,0)/values.length)));
  const latest=selected[selected.length-1];
  return {world:WORLD,targetType:TARGET_TYPE,avgBattleMs,combatSpeed:speed,fallbackSpeed:exact.length?null:Number(latest?.combatSpeed)||null,sampleCount:selected.length};
 }
 function resolveOfflineFarmTarget(...args){
  if(currentPhase()===WORLD)return resolveThirdWorldTarget();
  return typeof baseResolve==="function"?baseResolve.apply(this,args):null;
 }
 function installFormalSampleHooks(){
  if(typeof baseCombat!=="function"||typeof baseSettlement!=="function")return false;
  if(window.runThirdWorldBossCombat?.__offlineWorld3SampleHook===true&&window.settleThirdWorldCombatResult?.__offlineWorld3SampleHook===true)return true;
  const combatWrapped=function(...args){
   const token=beginThirdWorldOfflineBattleSample();
   const result=baseCombat.apply(this,args);
   if(token&&result&&typeof result==="object"){
    token.predictedActualMs=formalPresentationDuration(result);
    try{tokensByCombat.set(result,token);}catch(_){if(typeof token.unsubscribe==="function")token.unsubscribe();}
   }else if(token&&typeof token.unsubscribe==="function")token.unsubscribe();
   return result;
  };
  combatWrapped.__offlineWorld3SampleHook=true;
  const settlementWrapped=function(result,...args){
   const token=result&&typeof result==="object"?tokensByCombat.get(result):null;
   const settled=baseSettlement.call(this,result,...args);
   if(token){tokensByCombat.delete(result);finishThirdWorldOfflineBattleSample(token,result,settled);}
   return settled;
  };
  settlementWrapped.__offlineWorld3SampleHook=true;
  window.runThirdWorldBossCombat=combatWrapped;
  window.settleThirdWorldCombatResult=settlementWrapped;
  return true;
 }
 function validate(){
  const errors=[];
  if(Number(window.OFFLINE_BATTLE_SAMPLE_VERSION)!==4)errors.push({code:"SAMPLE_VERSION",actual:window.OFFLINE_BATTLE_SAMPLE_VERSION});
  if(Number(window.OFFLINE_LEGACY_BATTLE_SAMPLE_VERSION)!==3||Number(window.OFFLINE_BATTLE_SAMPLE_MIGRATION_VERSION)!==1)errors.push({code:"V3_TO_V4_MIGRATION_OWNER",legacy:window.OFFLINE_LEGACY_BATTLE_SAMPLE_VERSION,migration:window.OFFLINE_BATTLE_SAMPLE_MIGRATION_VERSION});
  if(typeof window.normalizeOfflineBattleSamples!=="function"||typeof window.convertOfflineSampleMsForSpeed!=="function")errors.push({code:"SHARED_OFFLINE_OWNER"});
  if(typeof baseResolve!=="function")errors.push({code:"BASE_TARGET_OWNER"});
  const sample={sampleVersion:4,world:3,targetType:TARGET_TYPE,combatSpeed:1,actualMs:1000,cycleMs:1140,adjustedMs:1140,playerLevel:1200,kind:TARGET_TYPE,multiplier:1,recordedAt:1};
  if(!legalThirdWorldSample(sample)||convertedMs(sample,2)!==640)errors.push({code:"WORLD3_SPEED_CONVERSION",converted:convertedMs(sample,2)});
  return Object.freeze({version:VERSION,targetVersion:TARGET_VERSION,sampleHookVersion:SAMPLE_HOOK_VERSION,passed:errors.length===0,errors:Object.freeze(errors.slice())});
 }

 window.OFFLINE_THREE_ERA_TARGET_VERSION=TARGET_VERSION;
 window.THIRD_WORLD_OFFLINE_SAMPLE_VERSION=VERSION;
 window.THIRD_WORLD_OFFLINE_SAMPLE_HOOK_VERSION=SAMPLE_HOOK_VERSION;
 window.THIRD_WORLD_OFFLINE_TARGET_TYPE=TARGET_TYPE;
 window.beginThirdWorldOfflineBattleSample=beginThirdWorldOfflineBattleSample;
 window.finishThirdWorldOfflineBattleSample=finishThirdWorldOfflineBattleSample;
 window.resolveThirdWorldOfflineFarmTarget=resolveThirdWorldTarget;
 window.resolveOfflineFarmTarget=resolveOfflineFarmTarget;
 installFormalSampleHooks();
 window.THIRD_WORLD_OFFLINE_SAMPLE_INTEGRITY=validate();
 if(!window.THIRD_WORLD_OFFLINE_SAMPLE_INTEGRITY.passed)console.error("[文明戰線] World 3 offline sample adapter integrity error",window.THIRD_WORLD_OFFLINE_SAMPLE_INTEGRITY.errors);
})();
