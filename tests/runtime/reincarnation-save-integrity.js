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
   window.REINCARNATION_STATE_VERSION>=6&&
   window.ALTERNATE_UNIVERSE_STATE_FORMAT_VERSION===2&&
   window.ALTERNATE_UNIVERSE_TRAIT_POLICY_VERSION===1&&
   window.ALTERNATE_UNIVERSE_FAILURES_FORMAT_VERSION===1&&
   typeof window.migrateSave==="function"&&
   typeof window.normalizeReincarnationState==="function"&&
   typeof window.alternateUniverseFailureCount==="function"&&
   typeof window.alternateUniverseDepthLocked==="function",
   {timeout:30000}
  );
  const report=await page.evaluate(()=>{
   const clone=value=>JSON.parse(JSON.stringify(value));
   const errors=[],cases=[];
   const record=(id,ok,detail={})=>{cases.push({id,ok,...detail});if(!ok)errors.push({code:id,...detail});};
   const meaningful=s=>({level:s.level,exp:s.exp,gold:s.gold,unlockedMap:s.unlockedMap,vipLevel:s.vipLevel,vipPoints:s.vipPoints,combatSpeed:s.settings?.combatSpeed,keepUpgrade:s.settings?.keepUpgrade,secondEntered:s.secondWorld?.entered===true,thirdEntered:s.thirdWorld?.entered===true});
   const makeFixture=(schema,level,phase)=>({
    saveVersion:schema,introSeen:true,playerName:"Integrity Probe",level,
    exp:[500,1000,2000].includes(level)?0:123,hp:1,gold:987654,unlockedMap:37,
    vipLevel:0,vipPoints:0,equipment:{},inventory:[],lostGear:[],
    settings:{autoSell:[false,false,false,false,false,false],keepUpgrade:true,dark:true,combatSpeed:1},
    enhancement:{basicStones:0,advancedStones:0,levels:{}},specializations:{},
    mapProgress:[],bossProgress:[],bossLocked:[],bossKilled:[],
    secondWorld:{entered:phase>=2},thirdWorld:{entered:phase>=3}
   });

   [["W1_MID",259,1],["W1_CAP",500,1],["W2_MID",600,2],["W2_CAP",1000,2],["W3_ENTRY",1000,3],["W3_MID",1500,3],["W3_CAP",2000,3]].forEach(([id,level,phase])=>{
    const source=makeFixture(16,level,phase),before=meaningful(source),raw=clone(source);
    const migrated=window.migrateSave(clone(source),16,null,raw),after=meaningful(migrated),migration=clone(window.LAST_SAVE_MIGRATION_REPORT||{}),lifecycle=window.reincarnationLifecycleSnapshot(migrated);
    const lf=migrated.reincarnation?.alternateUniverse?.lifeFailures;
    record(`SCHEMA16_ZERO_POLLUTION_${id}`,
     JSON.stringify(before)===JSON.stringify(after)&&migrated.saveVersion===17&&migrated.reincarnation?.count===0&&migrated.reincarnation?.breakthrough?.milestoneLifeId===0&&lifecycle.firstRun===true&&lifecycle.reincarnationRun===false&&lifecycle.lifeId===0&&migration.reincarnationStateInitialized===true&&migration.sourceReincarnationCount===0&&migration.targetReincarnationCount===0&&lf?.lifeId===0&&Object.keys(lf?.failures||{}).length===0,
     {before,after,lifecycle,migration:{sourceVersion:migration.sourceVersion,targetVersion:migration.targetVersion,reincarnationStateInitialized:migration.reincarnationStateInitialized,sourceReincarnationCount:migration.sourceReincarnationCount,targetReincarnationCount:migration.targetReincarnationCount},lifeFailures:clone(lf)});
   });

   const contaminated=makeFixture(16,1000,2);
   contaminated.reincarnation={count:9,breakthrough:{permanent:88,milestoneLifeId:9,milestones:{100:true,200:true}},alternateUniverse:{unlocked:true,deepestCleared:900,activeAttempt:{lifeId:9,depth:901,attemptId:"legacy",traits:["strong","swift"]},lifeFailures:{901:{lifeId:9,failures:8}}}};
   const contaminatedMigrated=window.migrateSave(clone(contaminated),16,null,clone(contaminated)),contaminatedReport=clone(window.LAST_SAVE_MIGRATION_REPORT||{});
   record("PRE_SCHEMA17_CONTAMINATED_ROOT_IS_DISCARDED",
    contaminatedMigrated.reincarnation?.count===0&&contaminatedMigrated.reincarnation?.breakthrough?.permanent===0&&window.currentLifeBreakthrough(contaminatedMigrated)===0&&contaminatedMigrated.reincarnation?.alternateUniverse?.unlocked===false&&contaminatedMigrated.reincarnation?.alternateUniverse?.lifeFailures?.lifeId===0&&Object.keys(contaminatedMigrated.reincarnation?.alternateUniverse?.lifeFailures?.failures||{}).length===0&&contaminatedReport.sourceHadReincarnationRoot===true&&contaminatedReport.preSchema17ReincarnationDiscarded===true,
    {actual:clone(contaminatedMigrated.reincarnation),migration:contaminatedReport});

   [["SCHEMA1_ACTUAL_MIGRATION",1,10,1],["SCHEMA9_ACTUAL_MIGRATION",9,100,1],["SCHEMA15_ACTUAL_MIGRATION",15,1000,2]].forEach(([id,schema,level,phase])=>{
    const source=makeFixture(schema,level,phase);
    source.reincarnation={count:7,breakthrough:{permanent:77,milestoneLifeId:7,milestones:{100:true}},alternateUniverse:{unlocked:true,deepestCleared:777}};
    let migrated=null,migration=null,error="";
    try{migrated=window.migrateSave(clone(source),schema,null,clone(source));migration=clone(window.LAST_SAVE_MIGRATION_REPORT||{});}catch(e){error=String(e?.message||e);}
    const lifecycle=migrated?window.reincarnationLifecycleSnapshot(migrated):null;
    record(id,!error&&migrated?.saveVersion===17&&migrated?.reincarnation?.count===0&&migrated?.reincarnation?.breakthrough?.permanent===0&&migrated?.reincarnation?.alternateUniverse?.unlocked===false&&lifecycle?.firstRun===true&&migration?.sourceVersion===schema&&migration?.sourceHadReincarnationRoot===true&&migration?.preSchema17ReincarnationDiscarded===true,{error,migration,lifecycle});
   });

   const invalid={saveVersion:17,reincarnation:{count:-5,breakthrough:{permanent:-20,milestones:{100:true,200:"true",300:1}},alternateUniverse:{unlocked:false,deepestCleared:5000,activeAttempt:{lifeId:9,depth:4,attemptId:"bad",traits:["strong","swift"]},lifeFailures:{lifeId:9,failures:{4:99}}}}};
   window.normalizeReincarnationState(invalid);
   record("INVALID_REINCARNATION_NORMALIZES_TO_SAFE_FIRST_RUN",
    invalid.reincarnation.count===0&&invalid.reincarnation.breakthrough.permanent===0&&invalid.reincarnation.breakthrough.milestoneLifeId===0&&Object.values(invalid.reincarnation.breakthrough.milestones).every(v=>v===false)&&invalid.reincarnation.alternateUniverse.unlocked===true&&invalid.reincarnation.alternateUniverse.deepestCleared===1000&&invalid.reincarnation.alternateUniverse.activeAttempt===null&&invalid.reincarnation.alternateUniverse.lifeFailures?.lifeId===0&&Object.keys(invalid.reincarnation.alternateUniverse.lifeFailures?.failures||{}).length===0,
    {actual:clone(invalid.reincarnation)});

   const canonical={saveVersion:17,reincarnation:{count:2,breakthrough:{permanent:7,milestoneLifeId:2,milestones:{100:true,200:true}},alternateUniverse:{unlocked:true,deepestCleared:5000,activeAttempt:{lifeId:2,depth:124,attemptId:"attempt-124",traits:["strong","swift"]},lifeFailures:{lifeId:2,failures:{124:99,125:4,1001:2,0:8}}}}};
   window.normalizeReincarnationState(canonical);
   record("CANONICAL_REINCARNATION_VALUES_ARE_BOUNDED",
    canonical.reincarnation.count===2&&window.currentLifeBreakthrough(canonical)===2&&canonical.reincarnation.alternateUniverse.deepestCleared===1000&&JSON.stringify(canonical.reincarnation.alternateUniverse.activeAttempt?.traits)===JSON.stringify(["strong","swift"])&&canonical.reincarnation.alternateUniverse.lifeFailures?.lifeId===2&&canonical.reincarnation.alternateUniverse.lifeFailures?.failures?.["124"]===10&&canonical.reincarnation.alternateUniverse.lifeFailures?.failures?.["125"]===4&&!canonical.reincarnation.alternateUniverse.lifeFailures?.failures?.["1001"]&&window.alternateUniverseFailureCount(canonical,124)===10&&window.alternateUniverseDepthLocked(canonical,124)===true&&window.alternateUniverseDepthLocked(canonical,125)===false,
    {actual:clone(canonical.reincarnation)});

   const legacyRows={saveVersion:17,reincarnation:{count:4,breakthrough:{permanent:20,milestoneLifeId:4,milestones:{}},alternateUniverse:{unlocked:true,deepestCleared:80,lifeFailures:{81:{lifeId:4,failures:3},82:{lifeId:3,failures:9},83:{lifeId:4,failures:12},84:5}}}};
   window.normalizeReincarnationState(legacyRows);
   record("LEGACY_SCHEMA17_FAILURE_ROWS_CANONICALIZE",
    legacyRows.reincarnation.alternateUniverse.lifeFailures?.lifeId===4&&JSON.stringify(legacyRows.reincarnation.alternateUniverse.lifeFailures?.failures)===JSON.stringify({"81":3,"83":10})&&window.alternateUniverseFailureCount(legacyRows,81)===3&&window.alternateUniverseDepthLocked(legacyRows,83)===true,
    {actual:clone(legacyRows.reincarnation.alternateUniverse.lifeFailures),normalization:clone(window.LAST_REINCARNATION_NORMALIZATION_REPORT||{})});

   const numericFallback={saveVersion:17,reincarnation:{count:4,breakthrough:{permanent:0,milestoneLifeId:4,milestones:{}},alternateUniverse:{unlocked:true,deepestCleared:0,lifeFailures:{81:3,82:10}}}};
   window.normalizeReincarnationState(numericFallback);
   record("LOOSE_NUMERIC_FAILURE_FALLBACK_RETIRED",
    numericFallback.reincarnation.alternateUniverse.lifeFailures?.lifeId===4&&Object.keys(numericFallback.reincarnation.alternateUniverse.lifeFailures?.failures||{}).length===0,
    {actual:clone(numericFallback.reincarnation.alternateUniverse.lifeFailures)});

   const traitIds=clone(window.ALTERNATE_UNIVERSE_TRAIT_IDS||[]),monsterTraitIds=clone(window.MONSTER_TRAIT_IDS||[]);
   record("ALTERNATE_UNIVERSE_TRAIT_IDS_MATCH_FORMAL_MONSTER_TRAITS",
    JSON.stringify(traitIds)===JSON.stringify(["strong","ferocious","hard","swift","deadly","berserk","giant"])&&JSON.stringify(traitIds)===JSON.stringify(monsterTraitIds),
    {traitIds,monsterTraitIds});

   const aliasAttempt={saveVersion:17,reincarnation:{count:6,breakthrough:{permanent:0,milestoneLifeId:6,milestones:{}},alternateUniverse:{unlocked:true,deepestCleared:10,activeAttempt:{lifeId:6,depth:11,attemptId:"alias",traits:["強壯","迅捷"]},lifeFailures:{lifeId:6,failures:{}}}}};
   window.normalizeReincarnationState(aliasAttempt);
   record("FORMAL_CHINESE_TRAIT_LABELS_CANONICALIZE_TO_IDS",
    JSON.stringify(aliasAttempt.reincarnation.alternateUniverse.activeAttempt?.traits)===JSON.stringify(["strong","swift"]),
    {actual:clone(aliasAttempt.reincarnation.alternateUniverse.activeAttempt)});

   [["UNKNOWN_TRAIT",["strong","unknown"]],["DUPLICATE_TRAIT",["swift","迅捷"]],["THREE_TRAITS",["strong","swift","deadly"]],["ONE_TRAIT",["strong"]]].forEach(([id,traits])=>{
    const s={saveVersion:17,reincarnation:{count:2,breakthrough:{permanent:0,milestoneLifeId:2,milestones:{}},alternateUniverse:{unlocked:true,deepestCleared:1,activeAttempt:{lifeId:2,depth:2,attemptId:id,traits},lifeFailures:{lifeId:2,failures:{}}}}};
    window.normalizeReincarnationState(s);
    record(`ACTIVE_ATTEMPT_${id}_FAILS_CLOSED`,s.reincarnation.alternateUniverse.activeAttempt===null,{traits,actual:s.reincarnation.alternateUniverse.activeAttempt});
   });

   const staleMilestones={saveVersion:17,reincarnation:{count:3,breakthrough:{permanent:20,milestoneLifeId:2,milestones:{100:true,200:true,300:true}},alternateUniverse:{unlocked:false}}};
   window.normalizeReincarnationState(staleMilestones);
   record("BREAKTHROUGH_MILESTONES_CANNOT_CROSS_LIFE",
    staleMilestones.reincarnation.breakthrough.permanent===20&&staleMilestones.reincarnation.breakthrough.milestoneLifeId===3&&window.currentLifeBreakthrough(staleMilestones)===0&&Object.values(staleMilestones.reincarnation.breakthrough.milestones).every(v=>v===false),
    {actual:clone(staleMilestones.reincarnation.breakthrough)});

   const original=makeFixture(17,1500,3);
   original.reincarnation={count:4,breakthrough:{permanent:37,milestoneLifeId:4,milestones:{100:true,200:true}},alternateUniverse:{unlocked:true,deepestCleared:123,activeAttempt:{lifeId:4,depth:124,attemptId:"roundtrip-124",traits:["strong","swift"]},lifeFailures:{lifeId:4,failures:{"124":3}}}};
   window.normalizeReincarnationState(original);
   const serialized=JSON.stringify(original),parsed=JSON.parse(serialized),roundTrip=window.migrateSave(parsed,17,null,clone(parsed));
   const expectedReincarnation=clone(original.reincarnation),actualReincarnation=clone(roundTrip.reincarnation);
   record("SCHEMA17_REINCARNATION_ROUND_TRIP",
    JSON.stringify(expectedReincarnation)===JSON.stringify(actualReincarnation)&&roundTrip.saveVersion===17&&window.currentLifeId(roundTrip)===4&&window.currentLifeBreakthrough(roundTrip)===2&&roundTrip.reincarnation?.alternateUniverse?.lifeFailures?.lifeId===4&&roundTrip.reincarnation?.alternateUniverse?.lifeFailures?.failures?.["124"]===3,
    {expected:expectedReincarnation,actual:actualReincarnation});

   const first=window.reincarnationLifecycleSnapshot({reincarnation:{count:0}}),later=window.reincarnationLifecycleSnapshot({reincarnation:{count:5}});
   record("LIFECYCLE_DERIVED_ONLY",first.lifeId===0&&first.firstRun===true&&later.lifeId===5&&later.reincarnationRun===true,{first,later});
   return {passed:errors.length===0,errors,cases};
  });
  assert.equal(report.passed,true,"Reincarnation save integrity failed:\n"+JSON.stringify(report.errors,null,2));
  assert.deepEqual(pageErrors,[],"Browser pageerror:\n"+pageErrors.join("\n\n"));
  console.log("Reincarnation save integrity passed:",JSON.stringify({cases:report.cases.map(x=>({id:x.id,ok:x.ok}))}));
 }finally{await browser.close();}
})().catch(error=>{console.error(error?.stack||error);process.exit(1);});