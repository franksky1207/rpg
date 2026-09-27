(function(){
 const VERSION=3;
 const PRE_SCHEMA16_POLICY_REGRESSION_VERSION=1;
 const TRANSIENT_DROP_REGRESSION_VERSION=1;
 const CORE_RECONCILIATION_REGRESSION_VERSION=1;
 const CORE_PROGRESS_REGRESSION_VERSION=1;
 function clone(value){try{return JSON.parse(JSON.stringify(value));}catch(e){return null;}}
 function baseSave(bosses){return {saveVersion:16,level:1000,exp:0,secondWorld:{entered:true},thirdWorld:{entered:true,entryVersion:2,bosses},offline:{}};}
 function runThirdWorldBossMigrationRegression(){
  const errors=[],cases=[],max=Number(window.THIRD_WORLD_BOSS_MAX_HP),count=Number(window.THIRD_WORLD_BOSS_COUNT),coreCost=Math.max(1,Math.floor(Number(window.THIRD_WORLD_CORE_PROGRESS_PER_LEVEL)||1000000000)),previousReport=window.LAST_SAVE_MIGRATION_REPORT;
  const fail=(id,data=null)=>errors.push({code:id,data});
  const runCase=(id,source,check)=>{
   try{
    const original=clone(source),seed=clone(source),version=Math.max(1,Math.floor(Number(source?.saveVersion)||16)),migrated=window.migrateSave(seed,version,null,original),report=clone(window.LAST_SAVE_MIGRATION_REPORT)||{},ok=check(migrated,report)===true;
    cases.push({id,ok,sourceVersion:version,bosses:clone(migrated?.thirdWorld?.bosses)||null,coreProgress:Number(migrated?.thirdWorld?.coreProgress)||0,report});
    if(!ok)fail(id,{migrated:migrated?.thirdWorld||migrated,report});
   }catch(error){cases.push({id,ok:false,error:String(error?.message||error)});fail(id,String(error?.message||error));}
  };
  try{
   if(typeof window.migrateSave!=="function"||!Number.isInteger(max)||max<=0||count!==10){fail("OWNER_MISSING",{migrateSave:typeof window.migrateSave,max,count});}
   else{
    const distinct=Array.from({length:count},(_,index)=>({currentHp:max-index*1234567}));
    runCase("SCHEMA16_DISTINCT_HP_PRESERVED",baseSave(distinct),m=>Array.isArray(m?.thirdWorld?.bosses)&&m.thirdWorld.bosses.length===count&&m.thirdWorld.bosses.every((row,index)=>row.currentHp===distinct[index].currentHp));
    runCase("SCHEMA16_MISSING_BOSS_FILLED",baseSave(Array.from({length:count-1},()=>({currentHp:max-1}))),m=>m?.thirdWorld?.bosses?.length===count&&m.thirdWorld.bosses[count-1]?.currentHp===max);
    const malformed=Array.from({length:count+1},(_,index)=>({currentHp:index===0?-5:index===1?max+999:index===2?"123456789":max-index,tempShield:99}));
    runCase("SCHEMA16_HP_NORMALIZED_AND_TRANSIENT_DROPPED",baseSave(malformed),m=>{
     const rows=m?.thirdWorld?.bosses;
     return Array.isArray(rows)&&rows.length===count&&rows[0]?.currentHp===0&&rows[1]?.currentHp===max&&rows[2]?.currentHp===123456789&&rows.every(row=>Object.keys(row||{}).length===1&&Object.prototype.hasOwnProperty.call(row,"currentHp"));
    });
    const transient=baseSave(distinct);Object.assign(transient.thirdWorld,{deaths:88,suppression:22.5,run:{active:true},targetBossIndex:4,pendingEvents:[{type:"probe"}],recentBattles:[{bossIndex:4}],lastBattleSummary:{bossIndex:4}});
    runCase("SCHEMA16_THIRD_WORLD_RUNTIME_TRANSIENTS_DROPPED",transient,m=>{
     const row=m?.thirdWorld||{},allowed=new Set(Array.from(window.THIRD_WORLD_PERSISTENT_KEYS||[]));
     return ["deaths","suppression","run","targetBossIndex","pendingEvents","recentBattles","lastBattleSummary"].every(key=>!Object.prototype.hasOwnProperty.call(row,key))&&Object.keys(row).every(key=>allowed.has(key));
    });
    const missingProgress=baseSave(distinct);missingProgress.thirdWorld.coreLevel=4;missingProgress.thirdWorld.dimensionalStrings=2000000000;
    runCase("SCHEMA16_MISSING_CORE_PROGRESS_DEFAULTS_ZERO",missingProgress,m=>Number(m?.thirdWorld?.coreLevel)===4&&Number(m?.thirdWorld?.coreProgress)===0);
    const partialProgress=baseSave(distinct);partialProgress.thirdWorld.coreLevel=4;partialProgress.thirdWorld.coreProgress=345678901;
    runCase("SCHEMA16_CORE_PROGRESS_PRESERVED",partialProgress,m=>Number(m?.thirdWorld?.coreLevel)===4&&Number(m?.thirdWorld?.coreProgress)===345678901);
    const overProgress=baseSave(distinct);overProgress.thirdWorld.coreLevel=4;overProgress.thirdWorld.coreProgress=coreCost+12345;
    runCase("SCHEMA16_CORE_PROGRESS_CLAMPED",overProgress,m=>Number(m?.thirdWorld?.coreProgress)===coreCost-1);
    const negativeProgress=baseSave(distinct);negativeProgress.thirdWorld.coreLevel=4;negativeProgress.thirdWorld.coreProgress=-99;
    runCase("SCHEMA16_NEGATIVE_CORE_PROGRESS_ZEROED",negativeProgress,m=>Number(m?.thirdWorld?.coreProgress)===0);
    const maxCoreProgress=baseSave(distinct);maxCoreProgress.thirdWorld.coreLevel=10;maxCoreProgress.thirdWorld.coreProgress=777777777;
    runCase("SCHEMA16_MAX_CORE_PROGRESS_ZEROED",maxCoreProgress,m=>Number(m?.thirdWorld?.coreLevel)===10&&Number(m?.thirdWorld?.coreProgress)===0);
    const legacyCore=baseSave(distinct);legacyCore.thirdWorld.entryVersion=1;legacyCore.thirdWorld.coreLevel=7;legacyCore.thirdWorld.coreProgress=456789012;legacyCore.thirdWorld.dimensionalStrings=1234567890;
    runCase("SCHEMA16_PRE_BATCH7_UNPAID_CORE_RESET",legacyCore,m=>Number(m?.thirdWorld?.coreLevel)===0&&Number(m?.thirdWorld?.coreProgress)===0&&Number(m?.thirdWorld?.entryVersion)===2&&Number(m?.thirdWorld?.dimensionalStrings)===1234567890);
    const reconciledCore=baseSave(distinct);reconciledCore.thirdWorld.coreLevel=5;reconciledCore.thirdWorld.coreProgress=600000000;reconciledCore.thirdWorld.dimensionalStrings=3000000000;
    runCase("SCHEMA16_RECONCILED_CORE_PRESERVED",reconciledCore,m=>Number(m?.thirdWorld?.coreLevel)===5&&Number(m?.thirdWorld?.coreProgress)===600000000&&Number(m?.thirdWorld?.entryVersion)===2&&Number(m?.thirdWorld?.dimensionalStrings)===3000000000);
    runCase("SCHEMA15_THIRD_WORLD_DISCARDED_AS_DEVELOPMENT_DATA",{saveVersion:15,level:1500,exp:999,secondWorld:{entered:true},thirdWorld:{entered:true,completed:true,entryVersion:99,dimensionalStrings:999999,coreLevel:10,coreProgress:999999999,bosses:distinct,deaths:100,run:{active:true}},offline:{}},(m,r)=>{
     const row=m?.thirdWorld||{};
     return row.entered!==true&&row.completed!==true&&Number(row.dimensionalStrings||0)===0&&Number(row.coreLevel||0)===0&&Number(row.coreProgress||0)===0&&Array.isArray(row.bosses)&&row.bosses.every(b=>b.currentHp===max)&&r?.legacyThirdWorldStateDiscarded===true;
    });
   }
  }finally{
   if(typeof previousReport==="undefined")delete window.LAST_SAVE_MIGRATION_REPORT;else window.LAST_SAVE_MIGRATION_REPORT=previousReport;
  }
  const report=Object.freeze({version:VERSION,preSchema16PolicyRegressionVersion:PRE_SCHEMA16_POLICY_REGRESSION_VERSION,transientDropRegressionVersion:TRANSIENT_DROP_REGRESSION_VERSION,coreReconciliationRegressionVersion:CORE_RECONCILIATION_REGRESSION_VERSION,coreProgressRegressionVersion:CORE_PROGRESS_REGRESSION_VERSION,preSchema16Policy:"discard-development-data",passed:errors.length===0,errors:Object.freeze(errors.slice()),cases:Object.freeze(cases.slice()),checkedAt:Date.now()});
  window.SAVE_THIRD_WORLD_BOSS_MIGRATION_REGRESSION_REPORT=report;
  return report;
 }
 window.SAVE_THIRD_WORLD_BOSS_MIGRATION_REGRESSION_VERSION=VERSION;
 window.THIRD_WORLD_PRE_SCHEMA16_POLICY_REGRESSION_VERSION=PRE_SCHEMA16_POLICY_REGRESSION_VERSION;
 window.THIRD_WORLD_TRANSIENT_DROP_REGRESSION_VERSION=TRANSIENT_DROP_REGRESSION_VERSION;
 window.THIRD_WORLD_CORE_RECONCILIATION_REGRESSION_VERSION=CORE_RECONCILIATION_REGRESSION_VERSION;
 window.THIRD_WORLD_CORE_PROGRESS_REGRESSION_VERSION=CORE_PROGRESS_REGRESSION_VERSION;
 window.runThirdWorldBossMigrationRegression=runThirdWorldBossMigrationRegression;
 window.SAVE_THIRD_WORLD_BOSS_MIGRATION_REGRESSION_REPORT=runThirdWorldBossMigrationRegression();
})();