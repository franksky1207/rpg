(function(){
 const VERSION=4;
 const PRE_SCHEMA16_POLICY_REGRESSION_VERSION=1;
 const TRANSIENT_DROP_REGRESSION_VERSION=1;
 const CORE_RECONCILIATION_REGRESSION_VERSION=1;
 const CORE_PROGRESS_REGRESSION_VERSION=2;
 const SCHEMA_EVOLUTION_POLICY_REGRESSION_VERSION=1;
 const LEGACY_CORE_POLICY_REGRESSION_VERSION=1;
 function clone(value){try{return JSON.parse(JSON.stringify(value));}catch(e){return null;}}
 function baseSave(bosses){return {saveVersion:16,level:1000,exp:0,secondWorld:{entered:true},thirdWorld:{entered:true,entryVersion:2,bosses},offline:{}};}
 function runThirdWorldBossMigrationRegression(){
  const errors=[],cases=[],max=Number(window.THIRD_WORLD_BOSS_MAX_HP),count=Number(window.THIRD_WORLD_BOSS_COUNT),coreCost=Math.max(1,Math.floor(Number(window.THIRD_WORLD_CORE_PROGRESS_PER_LEVEL)||1000000000)),trustedEntryVersion=Math.max(1,Math.floor(Number(window.THIRD_WORLD_ENTRY_RECONCILIATION_VERSION)||2)),previousReport=window.LAST_SAVE_MIGRATION_REPORT;
  const fail=(id,data=null)=>errors.push({code:id,data});
  const runCase=(id,source,check)=>{
   try{
    const original=clone(source),seed=clone(source),version=Math.max(1,Math.floor(Number(source?.saveVersion)||16)),migrated=window.migrateSave(seed,version,null,original),report=clone(window.LAST_SAVE_MIGRATION_REPORT)||{},ok=check(migrated,report)===true;
    cases.push({id,ok,sourceVersion:version,bosses:clone(migrated?.thirdWorld?.bosses)||null,coreLevel:Number(migrated?.thirdWorld?.coreLevel)||0,coreProgress:Number(migrated?.thirdWorld?.coreProgress)||0,dimensionalStrings:Number(migrated?.thirdWorld?.dimensionalStrings)||0,entryVersion:Number(migrated?.thirdWorld?.entryVersion)||0,targetVersion:Number(migrated?.saveVersion)||0,report});
    if(!ok)fail(id,{migrated:migrated?.thirdWorld||migrated,report});
   }catch(error){cases.push({id,ok:false,error:String(error?.message||error)});fail(id,String(error?.message||error));}
  };
  const runCoreBoundaryCase=(id,entryVersion,check)=>{
   try{
    const probe={thirdWorld:{entered:true,entryVersion,coreLevel:7,coreProgress:456789012,dimensionalStrings:1234567890}},result=window.reconcileThirdWorldCoreProgressionState?.(probe),ok=check(probe,result)===true;
    cases.push({id,ok,entryVersion,coreLevel:Number(probe.thirdWorld?.coreLevel)||0,coreProgress:Number(probe.thirdWorld?.coreProgress)||0,dimensionalStrings:Number(probe.thirdWorld?.dimensionalStrings)||0,reconciliation:clone(result)});
    if(!ok)fail(id,{probe,result});
   }catch(error){cases.push({id,ok:false,error:String(error?.message||error)});fail(id,String(error?.message||error));}
  };
  try{
   if(typeof window.migrateSave!=="function"||typeof window.normalizeThirdWorldCoreInvestment!=="function"||typeof window.reconcileThirdWorldCoreProgressionState!=="function"||!Number.isInteger(max)||max<=0||count!==10){fail("OWNER_MISSING",{migrateSave:typeof window.migrateSave,normalizeThirdWorldCoreInvestment:typeof window.normalizeThirdWorldCoreInvestment,reconcileThirdWorldCoreProgressionState:typeof window.reconcileThirdWorldCoreProgressionState,max,count});}
   else{
    const distinct=Array.from({length:count},(_,index)=>({currentHp:max-index*1234567}));
    runCase("SCHEMA16_DISTINCT_HP_PRESERVED",baseSave(distinct),m=>Array.isArray(m?.thirdWorld?.bosses)&&m.thirdWorld.bosses.length===count&&m.thirdWorld.bosses.every((row,index)=>row.currentHp===distinct[index].currentHp));
    runCase("SCHEMA16_MISSING_BOSS_FILLED",baseSave(Array.from({length:count-1},()=>({currentHp:max-1}))),m=>m?.thirdWorld?.bosses?.length===count&&m.thirdWorld.bosses[count-1]?.currentHp===max);
    const malformed=Array.from({length:count+1},(_,index)=>({currentHp:index===0?-5:index===1?max+999:index===2?"123456789":max-index,tempShield:99}));
    runCase("SCHEMA16_HP_NORMALIZED_AND_TRANSIENT_DROPPED",baseSave(malformed),m=>{const rows=m?.thirdWorld?.bosses;return Array.isArray(rows)&&rows.length===count&&rows[0]?.currentHp===0&&rows[1]?.currentHp===max&&rows[2]?.currentHp===123456789&&rows.every(row=>Object.keys(row||{}).length===1&&Object.prototype.hasOwnProperty.call(row,"currentHp"));});
    const transient=baseSave(distinct);Object.assign(transient.thirdWorld,{deaths:88,suppression:22.5,run:{active:true},targetBossIndex:4,pendingEvents:[{type:"probe"}],recentBattles:[{bossIndex:4}],lastBattleSummary:{bossIndex:4}});
    runCase("SCHEMA16_THIRD_WORLD_RUNTIME_TRANSIENTS_DROPPED",transient,m=>{const row=m?.thirdWorld||{},allowed=new Set(Array.from(window.THIRD_WORLD_PERSISTENT_KEYS||[]));return ["deaths","suppression","run","targetBossIndex","pendingEvents","recentBattles","lastBattleSummary"].every(key=>!Object.prototype.hasOwnProperty.call(row,key))&&Object.keys(row).every(key=>allowed.has(key));});
    const missingProgress=baseSave(distinct);missingProgress.thirdWorld.coreLevel=4;missingProgress.thirdWorld.dimensionalStrings=2000000000;
    runCase("SCHEMA16_MISSING_CORE_PROGRESS_DEFAULTS_ZERO",missingProgress,m=>Number(m?.saveVersion)===16&&Number(m?.thirdWorld?.coreLevel)===4&&Number(m?.thirdWorld?.coreProgress)===0);
    const partialProgress=baseSave(distinct);partialProgress.thirdWorld.coreLevel=4;partialProgress.thirdWorld.coreProgress=345678901;
    runCase("SCHEMA16_CORE_PROGRESS_PRESERVED",partialProgress,m=>Number(m?.saveVersion)===16&&Number(m?.thirdWorld?.coreLevel)===4&&Number(m?.thirdWorld?.coreProgress)===345678901);
    const overProgress=baseSave(distinct);overProgress.thirdWorld.coreLevel=4;overProgress.thirdWorld.coreProgress=coreCost+12345;overProgress.thirdWorld.dimensionalStrings=700;
    runCase("SCHEMA16_CORE_PROGRESS_CARRIES_FORWARD",overProgress,m=>Number(m?.thirdWorld?.coreLevel)===5&&Number(m?.thirdWorld?.coreProgress)===12345&&Number(m?.thirdWorld?.dimensionalStrings)===700);
    const multiProgress=baseSave(distinct);multiProgress.thirdWorld.coreLevel=4;multiProgress.thirdWorld.coreProgress=coreCost*3+7654321;multiProgress.thirdWorld.dimensionalStrings=123;
    runCase("SCHEMA16_CORE_PROGRESS_MULTI_LEVEL_CARRY",multiProgress,m=>Number(m?.thirdWorld?.coreLevel)===7&&Number(m?.thirdWorld?.coreProgress)===7654321&&Number(m?.thirdWorld?.dimensionalStrings)===123);
    const negativeProgress=baseSave(distinct);negativeProgress.thirdWorld.coreLevel=4;negativeProgress.thirdWorld.coreProgress=-99;
    runCase("SCHEMA16_NEGATIVE_CORE_PROGRESS_ZEROED",negativeProgress,m=>Number(m?.thirdWorld?.coreProgress)===0);
    const capOverflow=baseSave(distinct);capOverflow.thirdWorld.coreLevel=9;capOverflow.thirdWorld.coreProgress=coreCost+500000000;capOverflow.thirdWorld.dimensionalStrings=250000000;
    runCase("SCHEMA16_CORE_PROGRESS_CAP_OVERFLOW_RECOVERED_TO_STRINGS",capOverflow,m=>Number(m?.thirdWorld?.coreLevel)===10&&Number(m?.thirdWorld?.coreProgress)===0&&Number(m?.thirdWorld?.dimensionalStrings)===750000000);
    const maxCoreProgress=baseSave(distinct);maxCoreProgress.thirdWorld.coreLevel=10;maxCoreProgress.thirdWorld.coreProgress=777777777;maxCoreProgress.thirdWorld.dimensionalStrings=100;
    runCase("SCHEMA16_MAX_CORE_PROGRESS_RECOVERED_TO_STRINGS",maxCoreProgress,m=>Number(m?.thirdWorld?.coreLevel)===10&&Number(m?.thirdWorld?.coreProgress)===0&&Number(m?.thirdWorld?.dimensionalStrings)===777777877);

    runCoreBoundaryCase("UNTRUSTED_ENTRY_V0_CORE_RESET",0,(p,r)=>Number(p.thirdWorld.coreLevel)===0&&Number(p.thirdWorld.coreProgress)===0&&Number(p.thirdWorld.entryVersion)===trustedEntryVersion&&Number(p.thirdWorld.dimensionalStrings)===1234567890&&r?.legacyUnpaidCoreReset===true);
    runCoreBoundaryCase("UNTRUSTED_ENTRY_V1_CORE_RESET",1,(p,r)=>Number(p.thirdWorld.coreLevel)===0&&Number(p.thirdWorld.coreProgress)===0&&Number(p.thirdWorld.entryVersion)===trustedEntryVersion&&Number(p.thirdWorld.dimensionalStrings)===1234567890&&r?.legacyUnpaidCoreReset===true);
    runCoreBoundaryCase("TRUSTED_ENTRY_V2_CORE_PRESERVED",trustedEntryVersion,(p,r)=>Number(p.thirdWorld.coreLevel)===7&&Number(p.thirdWorld.coreProgress)===456789012&&Number(p.thirdWorld.entryVersion)===trustedEntryVersion&&Number(p.thirdWorld.dimensionalStrings)===1234567890&&r?.legacyUnpaidCoreReset!==true);
    runCoreBoundaryCase("TRUSTED_FUTURE_ENTRY_CORE_PRESERVED",trustedEntryVersion+1,(p,r)=>Number(p.thirdWorld.coreLevel)===7&&Number(p.thirdWorld.coreProgress)===456789012&&Number(p.thirdWorld.entryVersion)===trustedEntryVersion+1&&Number(p.thirdWorld.dimensionalStrings)===1234567890&&r?.legacyUnpaidCoreReset!==true);

    const legacyCore=baseSave(distinct);legacyCore.thirdWorld.entryVersion=1;legacyCore.thirdWorld.coreLevel=7;legacyCore.thirdWorld.coreProgress=456789012;legacyCore.thirdWorld.dimensionalStrings=1234567890;
    runCase("SCHEMA16_PRE_BATCH7_UNPAID_CORE_RESET",legacyCore,m=>Number(m?.thirdWorld?.coreLevel)===0&&Number(m?.thirdWorld?.coreProgress)===0&&Number(m?.thirdWorld?.entryVersion)===trustedEntryVersion&&Number(m?.thirdWorld?.dimensionalStrings)===1234567890);
    runCase("SCHEMA15_THIRD_WORLD_DISCARDED_AS_DEVELOPMENT_DATA",{saveVersion:15,level:1500,exp:999,secondWorld:{entered:true},thirdWorld:{entered:true,completed:true,entryVersion:99,dimensionalStrings:999999,coreLevel:10,coreProgress:999999999,bosses:distinct,deaths:100,run:{active:true}},offline:{}},(m,r)=>{const row=m?.thirdWorld||{};return row.entered!==true&&row.completed!==true&&Number(row.dimensionalStrings||0)===0&&Number(row.coreLevel||0)===0&&Number(row.coreProgress||0)===0&&Array.isArray(row.bosses)&&row.bosses.every(b=>b.currentHp===max)&&r?.legacyThirdWorldStateDiscarded===true;});
   }
   const policy=window.SAVE_SCHEMA_EVOLUTION_POLICY,requires=window.saveSchemaChangeRequiresBump;
   if(Number(window.SAVE_SCHEMA_EVOLUTION_POLICY_VERSION)!==1||typeof requires!=="function")fail("SCHEMA_EVOLUTION_POLICY_OWNER",{version:window.SAVE_SCHEMA_EVOLUTION_POLICY_VERSION,api:typeof requires});
   else{
    if(Number(policy?.currentSchema)!==16||policy?.schema16ThirdWorld?.coreProgressOptional!==true||Number(policy?.schema16ThirdWorld?.missingCoreProgressDefaultsTo)!==0||policy?.schema16ThirdWorld?.preSchema16ThirdWorld!=="discard-development-data")fail("SCHEMA16_THIRD_WORLD_COMPAT_POLICY",policy||null);
    if(requires("additive-optional-field")!==false||requires("normalization-only")!==false||requires("semantic-reinterpretation")!==true||requires("persistent-field-removal")!==true||requires("incompatible-structure")!==true||requires("unknown-change")!==null)fail("SCHEMA_BUMP_BOUNDARY_POLICY",policy||null);
   }
  }finally{
   if(typeof previousReport==="undefined")delete window.LAST_SAVE_MIGRATION_REPORT;else window.LAST_SAVE_MIGRATION_REPORT=previousReport;
  }
  const legacyCorePolicy=Object.freeze({developmentOnly:true,untrustedEntryVersionMax:trustedEntryVersion-1,trustedFromEntryVersion:trustedEntryVersion,untrustedTreatment:"reset-core-and-coreProgress-preserve-dimensionalStrings",trustedTreatment:"normalize-and-preserve-investment"});
  const report=Object.freeze({version:VERSION,preSchema16PolicyRegressionVersion:PRE_SCHEMA16_POLICY_REGRESSION_VERSION,transientDropRegressionVersion:TRANSIENT_DROP_REGRESSION_VERSION,coreReconciliationRegressionVersion:CORE_RECONCILIATION_REGRESSION_VERSION,coreProgressRegressionVersion:CORE_PROGRESS_REGRESSION_VERSION,schemaEvolutionPolicyRegressionVersion:SCHEMA_EVOLUTION_POLICY_REGRESSION_VERSION,legacyCorePolicyRegressionVersion:LEGACY_CORE_POLICY_REGRESSION_VERSION,preSchema16Policy:"discard-development-data",legacyCorePolicy,passed:errors.length===0,errors:Object.freeze(errors.slice()),cases:Object.freeze(cases.slice()),checkedAt:Date.now()});
  window.SAVE_THIRD_WORLD_BOSS_MIGRATION_REGRESSION_REPORT=report;
  return report;
 }
 window.SAVE_THIRD_WORLD_BOSS_MIGRATION_REGRESSION_VERSION=VERSION;
 window.THIRD_WORLD_PRE_SCHEMA16_POLICY_REGRESSION_VERSION=PRE_SCHEMA16_POLICY_REGRESSION_VERSION;
 window.THIRD_WORLD_TRANSIENT_DROP_REGRESSION_VERSION=TRANSIENT_DROP_REGRESSION_VERSION;
 window.THIRD_WORLD_CORE_RECONCILIATION_REGRESSION_VERSION=CORE_RECONCILIATION_REGRESSION_VERSION;
 window.THIRD_WORLD_CORE_PROGRESS_REGRESSION_VERSION=CORE_PROGRESS_REGRESSION_VERSION;
 window.THIRD_WORLD_SCHEMA_EVOLUTION_POLICY_REGRESSION_VERSION=SCHEMA_EVOLUTION_POLICY_REGRESSION_VERSION;
 window.THIRD_WORLD_LEGACY_CORE_POLICY_REGRESSION_VERSION=LEGACY_CORE_POLICY_REGRESSION_VERSION;
 window.runThirdWorldBossMigrationRegression=runThirdWorldBossMigrationRegression;
 window.SAVE_THIRD_WORLD_BOSS_MIGRATION_REGRESSION_REPORT=runThirdWorldBossMigrationRegression();
})();
