const {chromium}=require("playwright");
const assert=require("assert");

(async()=>{
 const browser=await chromium.launch({headless:true});
 const page=await browser.newPage();
 const pageErrors=[];
 page.on("pageerror",error=>pageErrors.push(String(error?.stack||error?.message||error)));
 const url=process.env.RUNTIME_SMOKE_URL||"http://127.0.0.1:4173/index.html";
 try{
  await page.goto(url,{waitUntil:"domcontentloaded",timeout:30000});
  await page.waitForFunction(()=>
   window.SAVE_SCHEMA_VERSION===17&&
   window.SAVE_LOAD_PIPELINE_VERSION===3&&
   window.SAVE_NORMALIZATION_PIPELINE_VERSION===3&&
   window.SAVE_MIGRATION_STAIRCASE_VERSION===1&&
   window.REINCARNATION_STATE_VERSION>=7&&
   window.GM_TEST_TRANSIENT_KEY_INVENTORY_VERSION>=2&&
   Array.isArray(window.GM_TEST_TRANSIENT_STATE_KEYS)&&
   window.CHARACTER_WORLD_SNAPSHOT_CANONICAL_PHASE_VERSION>=1&&
   window.CHARACTER_WORLD_SNAPSHOT_OWNER==="playersemanticsui"&&
   typeof window.characterWorldSnapshot==="function"&&
   typeof window.saveCompatibilityFor==="function"&&
   typeof window.saveMigrationPlanForVersion==="function"&&
   typeof window.saveSchemaChangeRequiresBump==="function"&&
   typeof window.assertSaveVersionSupported==="function"&&
   typeof window.migrateSave==="function"&&
   typeof window.normalizeReincarnationState==="function",
   {timeout:30000}
  );

  const report=await page.evaluate(()=>{
   const clone=value=>JSON.parse(JSON.stringify(value));
   const matrixVersions=[1,9,15,16,17,18];
   const compatibility=matrixVersions.map(sourceSchema=>({sourceSchema,...window.saveCompatibilityFor({saveVersion:sourceSchema})}));
   const migrationPlans=matrixVersions.filter(version=>version<=17).map(version=>({version,stages:window.saveMigrationPlanForVersion(version).map(row=>row.id)}));
   const schemaPolicy={
    additiveOptional:window.saveSchemaChangeRequiresBump("additive-optional-field"),
    normalizationOnly:window.saveSchemaChangeRequiresBump("normalization-only"),
    semanticReinterpretation:window.saveSchemaChangeRequiresBump("semantic-reinterpretation"),
    persistentFieldRemoval:window.saveSchemaChangeRequiresBump("persistent-field-removal"),
    incompatibleStructure:window.saveSchemaChangeRequiresBump("incompatible-structure"),
    unknown:window.saveSchemaChangeRequiresBump("unknown")
   };

   const makeBase=(schema,level=100,phase=1)=>{
    const s=newState();
    s.saveVersion=schema;
    s.level=level;
    s.exp=0;
    s.playerName=`compat-v${schema}`;
    s.gold=123456;
    s.settings={...s.settings,keepUpgrade:true,dark:true,combatSpeed:1};
    if(phase>=2){s.secondWorld.entered=true;}
    if(phase>=3){s.secondWorld.entered=true;s.thirdWorld.entered=true;}
    return s;
   };
   const migrate=source=>{
    const original=clone(source);
    const migrated=window.migrateSave(clone(source),source.saveVersion,null,original);
    return {migrated:clone(migrated),migration:clone(window.LAST_SAVE_MIGRATION_REPORT||{}),normalization:clone(window.LAST_REINCARNATION_NORMALIZATION_REPORT||{}),gmCleanup:clone(window.LAST_GM_TEST_TRANSIENT_CLEANUP_REPORT||{})};
   };

   const gmTransientKeys=Array.from(window.GM_TEST_TRANSIENT_STATE_KEYS||[]);
   const gmTransientMatrix=[];
   for(let version=1;version<=17;version++){
    const phase=version>=16?3:version>=10?2:1;
    const source=makeBase(version,phase===3?1500:phase===2?750:100,phase);
    gmTransientKeys.forEach((key,index)=>{source[key]={legacy:true,key,index,version};});
    const out=migrate(source);
    gmTransientMatrix.push({version,leftovers:gmTransientKeys.filter(key=>Object.prototype.hasOwnProperty.call(out.migrated,key)),cleanup:out.gmCleanup,migration:out.migration});
   }

   const legacy=[];
   [
    {version:1,level:10,phase:1},
    {version:9,level:100,phase:1},
    {version:15,level:1000,phase:2},
    {version:16,level:1500,phase:3}
   ].forEach(row=>{
    const source=makeBase(row.version,row.level,row.phase);
    source.reincarnation={count:7,breakthrough:{permanent:77,milestoneLifeId:7,milestones:{100:true}},alternateUniverse:{unlocked:true,deepestCleared:777,activeAttempt:{lifeId:7,depth:778,attemptId:"legacy",traits:["strong","swift"]},lifeFailures:{lifeId:7,failures:{"778":9}}}};
    source.gmTestLevel=999;
    source.gmPowerBenchmark={dirty:true};
    const out=migrate(source);
    legacy.push({version:row.version,sourceLevel:row.level,targetVersion:out.migrated.saveVersion,level:out.migrated.level,count:out.migrated.reincarnation?.count,permanent:out.migrated.reincarnation?.breakthrough?.permanent,auUnlocked:out.migrated.reincarnation?.alternateUniverse?.unlocked,hasGmTestLevel:Object.prototype.hasOwnProperty.call(out.migrated,"gmTestLevel"),hasBenchmark:Object.prototype.hasOwnProperty.call(out.migrated,"gmPowerBenchmark"),migration:out.migration});
   });

   const missingVersion=makeBase(17,88,1);
   delete missingVersion.saveVersion;
   missingVersion.reincarnation={count:5,breakthrough:{permanent:50,milestoneLifeId:5,milestones:{100:true}},alternateUniverse:{unlocked:true,deepestCleared:50}};
   const missingOriginal=clone(missingVersion);
   const missingMigrated=window.migrateSave(clone(missingVersion),null,null,missingOriginal);
   const missingReport=clone(window.LAST_SAVE_MIGRATION_REPORT||{});

   const current=makeBase(17,600,2);
   current.reincarnation={count:3,breakthrough:{permanent:25,milestoneLifeId:3,milestones:{100:true,200:true,300:true,400:true,500:true}},alternateUniverse:{unlocked:false,deepestCleared:120,activeAttempt:{lifeId:3,depth:121,attemptId:"current",traits:["強壯","迅捷"]},lifeFailures:{lifeId:3,failures:{"121":4}}}};
   const first=migrate(current);
   const second=migrate(first.migrated);

   const staleLife=makeBase(17,250,1);
   staleLife.reincarnation={count:4,breakthrough:{permanent:31,milestoneLifeId:3,milestones:{100:true,200:true,300:true}},alternateUniverse:{unlocked:true,deepestCleared:8,activeAttempt:{lifeId:3,depth:9,attemptId:"stale-life",traits:["strong","swift"]},lifeFailures:{lifeId:3,failures:{"9":7}}}};
   const stale=migrate(staleLife);

   const frontierMismatch=makeBase(17,250,1);
   frontierMismatch.reincarnation={count:2,breakthrough:{permanent:12,milestoneLifeId:2,milestones:{100:true,200:true}},alternateUniverse:{unlocked:true,deepestCleared:30,activeAttempt:{lifeId:2,depth:40,attemptId:"wrong-frontier",traits:["strong","swift"]},lifeFailures:{lifeId:2,failures:{"31":3,"40":8}}}};
   const frontier=migrate(frontierMismatch);

   const characterWorlds=[
    {phase:1,state:makeBase(17,500,1)},
    {phase:2,state:makeBase(17,1000,2)},
    {phase:3,state:makeBase(17,1500,3)}
   ].map(row=>({phase:row.phase,snapshot:clone(window.characterWorldSnapshot(row.state))}));

   let futureAssert={threw:false,code:"",sourceVersion:null,currentVersion:null};
   try{window.assertSaveVersionSupported({saveVersion:18},{label:"compat-matrix"});}
   catch(error){futureAssert={threw:true,code:String(error?.code||""),sourceVersion:error?.saveCompatibility?.sourceVersion??null,currentVersion:error?.saveCompatibility?.currentVersion??null};}

   const stateBefore=clone(state);
   const storageBefore={};
   for(let i=0;i<localStorage.length;i++){const key=localStorage.key(i);storageBefore[key]=localStorage.getItem(key);}
   const stateAfter=clone(state);
   const storageAfter={};
   for(let i=0;i<localStorage.length;i++){const key=localStorage.key(i);storageAfter[key]=localStorage.getItem(key);}

   return {compatibility,migrationPlans,schemaPolicy,gmTransientKeys,gmTransientInventoryVersion:window.GM_TEST_TRANSIENT_KEY_INVENTORY_VERSION,gmTransientMatrix,characterWorldOwner:window.CHARACTER_WORLD_SNAPSHOT_OWNER,characterWorldVersion:window.CHARACTER_WORLD_SNAPSHOT_CANONICAL_PHASE_VERSION,characterWorlds,legacy,missing:{saveVersion:missingMigrated.saveVersion,count:missingMigrated.reincarnation?.count,permanent:missingMigrated.reincarnation?.breakthrough?.permanent,auUnlocked:missingMigrated.reincarnation?.alternateUniverse?.unlocked,migration:missingReport},current:{first:first.migrated,firstMigration:first.migration,second:second.migrated,secondMigration:second.migration},stale:{state:stale.migrated,normalization:stale.normalization},frontier:{state:frontier.migrated,normalization:frontier.normalization},futureAssert,stateStable:JSON.stringify(stateBefore)===JSON.stringify(stateAfter),storageStable:JSON.stringify(storageBefore)===JSON.stringify(storageAfter)};
  });

  const expectedTransientKeys=["gmTestWorld","gmTestLevel","gmTestEquipment","gmTestEquipmentSource","gmTestVipLevel","gmTestEnhancementLevels","gmTestSpecializations","gmTestMarkLevels","gmTestCivilizationLevel","gmPowerBenchmark","gmTestResults"];
  assert.equal(report.gmTransientInventoryVersion,2,"GM transient key inventory version drifted.");
  assert.deepEqual(report.gmTransientKeys,expectedTransientKeys,"GM transient key inventory drifted.");
  assert.equal(report.gmTransientMatrix.length,17,"Schema1-17 GM transient migration matrix incomplete.");
  for(const row of report.gmTransientMatrix){
   assert.deepEqual(row.leftovers,[],`Schema${row.version} leaked historical GM-only transient keys.`);
   assert.equal(row.cleanup?.inventorySize,expectedTransientKeys.length,`Schema${row.version} cleanup inventory size drifted.`);
   assert.equal(row.cleanup?.removedCount,expectedTransientKeys.length,`Schema${row.version} did not remove every historical GM transient key.`);
   assert.deepEqual(row.cleanup?.removed,expectedTransientKeys,`Schema${row.version} cleanup diagnostics drifted.`);
   assert.equal(row.migration?.transientGmTestStateRemoved,true,`Schema${row.version} did not report transient cleanup.`);
  }

  assert.equal(report.characterWorldOwner,"playersemanticsui","Character snapshot canonical owner drifted.");
  assert.equal(report.characterWorldVersion,1,"Character snapshot canonical phase version drifted.");
  const characterByPhase=Object.fromEntries(report.characterWorlds.map(row=>[row.phase,row.snapshot]));
  assert.deepEqual({world:characterByPhase[1].world,label:characterByPhase[1].worldLabel,cap:characterByPhase[1].cap},{world:1,label:"銀河紀元",cap:500},"W1 character snapshot semantics drifted.");
  assert.deepEqual({world:characterByPhase[2].world,label:characterByPhase[2].worldLabel,cap:characterByPhase[2].cap},{world:2,label:"宇宙紀元",cap:1000},"W2 character snapshot semantics drifted.");
  assert.deepEqual({world:characterByPhase[3].world,label:characterByPhase[3].worldLabel,cap:characterByPhase[3].cap},{world:3,label:"高維紀元",cap:2000},"W3 character snapshot semantics drifted.");

  const compatByVersion=Object.fromEntries(report.compatibility.map(row=>[row.sourceSchema,row]));
  [1,9,15,16].forEach(version=>{
   assert.equal(compatByVersion[version].sourceVersion,version,`Schema${version} source-version diagnostic drifted.`);
   assert.equal(compatByVersion[version].supported,true,`Schema${version} must remain supported legacy.`);
   assert.equal(compatByVersion[version].isLegacy,true,`Schema${version} must be classified legacy.`);
   assert.equal(compatByVersion[version].isFuture,false,`Schema${version} must not be future.`);
  });
  assert.equal(compatByVersion[17].sourceVersion,17,"Schema17 source-version diagnostic drifted.");
  assert.equal(compatByVersion[17].supported,true,"Schema17 must be supported current schema.");
  assert.equal(compatByVersion[17].isLegacy,false,"Schema17 must not be legacy.");
  assert.equal(compatByVersion[18].sourceVersion,18,"Schema18 source-version diagnostic drifted.");
  assert.equal(compatByVersion[18].supported,false,"Schema18 must fail closed until explicitly supported.");
  assert.equal(compatByVersion[18].isFuture,true,"Schema18 must be classified future.");

  const planByVersion=Object.fromEntries(report.migrationPlans.map(row=>[row.version,row.stages]));
  const tail=["canonical-normalization","world-phase-normalization","subsystem-normalization","finalize-current-schema"];
  assert.deepEqual(planByVersion[1],["legacy-exp-progress","pre-schema16-compatibility","pre-schema17-reincarnation",...tail]);
  assert.deepEqual(planByVersion[9],["legacy-exp-progress","pre-schema16-compatibility","pre-schema17-reincarnation",...tail]);
  assert.deepEqual(planByVersion[15],["pre-schema16-compatibility","pre-schema17-reincarnation",...tail]);
  assert.deepEqual(planByVersion[16],["pre-schema17-reincarnation",...tail]);
  assert.deepEqual(planByVersion[17],tail);

  assert.deepEqual(report.schemaPolicy,{additiveOptional:false,normalizationOnly:false,semanticReinterpretation:true,persistentFieldRemoval:true,incompatibleStructure:true,unknown:null},"Schema evolution policy drifted.");

  for(const row of report.legacy){
   assert.equal(row.targetVersion,17,`Schema${row.version} did not migrate to 17.`);
   assert.equal(row.count,0,`Schema${row.version} leaked reincarnation count.`);
   assert.equal(row.permanent,0,`Schema${row.version} leaked permanent breakthrough.`);
   assert.equal(row.auUnlocked,false,`Schema${row.version} leaked AU unlock.`);
   assert.equal(row.hasGmTestLevel,false,`Schema${row.version} leaked GM sandbox state.`);
   assert.equal(row.hasBenchmark,false,`Schema${row.version} leaked benchmark sandbox state.`);
   assert.equal(row.migration?.preSchema17ReincarnationDiscarded,true,`Schema${row.version} did not report pre17 discard.`);
  }

  assert.equal(report.missing.saveVersion,17,"Missing saveVersion must canonicalize through supported legacy fallback.");
  assert.equal(report.missing.count,0,"Missing saveVersion must not trust injected reincarnation data.");
  assert.equal(report.missing.permanent,0,"Missing saveVersion must not trust injected breakthrough data.");
  assert.equal(report.missing.auUnlocked,false,"Missing saveVersion must not trust injected AU data.");
  assert.equal(report.missing.migration?.sourceVersion,1,"Missing saveVersion fallback must remain minimum supported schema.");

  assert.equal(report.current.first.saveVersion,17,"Current Schema17 must remain Schema17.");
  assert.equal(report.current.first.reincarnation.count,3,"Current Schema17 reincarnation count changed.");
  assert.equal(report.current.first.reincarnation.breakthrough.permanent,25,"Current Schema17 permanent breakthrough changed.");
  assert.equal(report.current.first.reincarnation.alternateUniverse.unlocked,true,"Schema17 deepest>0 must salvage AU unlock.");
  assert.deepEqual(report.current.first.reincarnation.alternateUniverse.activeAttempt?.traits,["strong","swift"],"Formal trait aliases must canonicalize.");
  assert.deepEqual(report.current.second.reincarnation,report.current.first.reincarnation,"Schema17 second normalization pass must be idempotent for reincarnation/AU state.");

  assert.equal(report.stale.state.reincarnation.count,4,"Stale-life repair changed life count.");
  assert.equal(report.stale.state.reincarnation.breakthrough.permanent,31,"Stale-life repair must preserve permanent breakthrough.");
  assert.equal(report.stale.state.reincarnation.breakthrough.milestoneLifeId,4,"Stale-life repair must move milestone owner to current life.");
  assert.ok(Object.values(report.stale.state.reincarnation.breakthrough.milestones).every(value=>value===false),"Stale milestones must not cross life boundary.");
  assert.equal(report.stale.state.reincarnation.alternateUniverse.activeAttempt,null,"Stale AU attempt from another life must fail closed.");
  assert.equal(report.stale.state.reincarnation.alternateUniverse.lifeFailures.lifeId,4,"AU failures must follow current life id.");
  assert.deepEqual(report.stale.state.reincarnation.alternateUniverse.lifeFailures.failures,{},"Stale-life AU failures must be cleared.");

  assert.equal(report.frontier.state.reincarnation.alternateUniverse.activeAttempt,null,"Non-frontier AU attempt must fail closed.");
  assert.equal(report.frontier.normalization?.activeAttemptFrontierMismatch,true,"Frontier mismatch must be diagnosed explicitly.");
  assert.equal(report.frontier.normalization?.activeAttemptExpectedFrontierDepth,31,"Frontier diagnostic expected depth drifted.");
  assert.equal(report.frontier.state.reincarnation.alternateUniverse.lifeFailures.failures["31"],3,"Valid current-life frontier failure count must survive canonicalization.");

  assert.deepEqual(report.futureAssert,{threw:true,code:"FUTURE_SAVE_VERSION",sourceVersion:18,currentVersion:17},"Future schema guard drifted.");
  assert.equal(report.stateStable,true,"Compatibility diagnostics mutated formal runtime state.");
  assert.equal(report.storageStable,true,"Compatibility diagnostics mutated localStorage.");
  assert.deepEqual(pageErrors,[],"Browser pageerror:\n"+pageErrors.join("\n\n"));

  console.log("Schema17 compatibility matrix passed:",JSON.stringify({
   compatibility:report.compatibility.map(row=>({sourceSchema:row.sourceSchema,sourceVersion:row.sourceVersion,supported:row.supported,isLegacy:row.isLegacy,isFuture:row.isFuture})),
   migrationPlans:report.migrationPlans,
   gmTransientSchemas:report.gmTransientMatrix.length,
   gmTransientKeyCount:report.gmTransientKeys.length,
   characterWorlds:report.characterWorlds.map(row=>({phase:row.phase,world:row.snapshot.world,label:row.snapshot.worldLabel,cap:row.snapshot.cap})),
   legacy:report.legacy.map(row=>({version:row.version,targetVersion:row.targetVersion,count:row.count,auUnlocked:row.auUnlocked})),
   current:{count:report.current.first.reincarnation.count,permanent:report.current.first.reincarnation.breakthrough.permanent,auDepth:report.current.first.reincarnation.alternateUniverse.deepestCleared},
   future:report.futureAssert,
   stateStable:report.stateStable,
   storageStable:report.storageStable
  }));
 }finally{await browser.close();}
})().catch(error=>{console.error(error?.stack||error);process.exit(1);});