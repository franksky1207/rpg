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
   typeof window.migrateSave==="function"&&
   typeof window.normalizeReincarnationState==="function"&&
   typeof window.reincarnationLifecycleSnapshot==="function"&&
   typeof newState==="function",
   {timeout:30000}
  );
  const report=await page.evaluate(()=>{
   const clone=value=>JSON.parse(JSON.stringify(value));
   const errors=[],cases=[];
   const record=(id,ok,detail={})=>{cases.push({id,ok,...detail});if(!ok)errors.push({code:id,...detail});};
   const meaningful=s=>({
    level:s.level,exp:s.exp,gold:s.gold,unlockedMap:s.unlockedMap,
    vipLevel:s.vipLevel,vipPoints:s.vipPoints,
    combatSpeed:s.settings?.combatSpeed,keepUpgrade:s.settings?.keepUpgrade,
    secondEntered:s.secondWorld?.entered===true,thirdEntered:s.thirdWorld?.entered===true,
    enhancementLevels:clone(s.enhancement?.levels||{}),
    specializations:clone(s.specializations||{})
   });
   const makeSchema16=(level,phase)=>{
    const s=newState();
    s.saveVersion=16;delete s.reincarnation;
    s.level=level;s.exp=level===500||level===1000||level===2000?0:123;
    s.gold=987654;s.unlockedMap=37;s.vipPoints=0;s.vipLevel=0;
    s.settings.combatSpeed=1;s.settings.keepUpgrade=true;
    if(s.enhancement?.levels)Object.keys(s.enhancement.levels).forEach(k=>s.enhancement.levels[k]=Math.min(10,level>=500?10:5));
    if(s.specializations&&typeof s.specializations==="object")Object.keys(s.specializations).forEach(k=>s.specializations[k]=Math.min(10,level>=500?10:5));
    if(!s.secondWorld||typeof s.secondWorld!=="object")s.secondWorld={};
    if(!s.thirdWorld||typeof s.thirdWorld!=="object")s.thirdWorld={};
    s.secondWorld.entered=phase>=2;s.thirdWorld.entered=phase>=3;
    return s;
   };
   const fixtures=[
    ["W1_MID",259,1],["W1_CAP",500,1],["W2_MID",600,2],["W2_CAP",1000,2],
    ["W3_ENTRY",1000,3],["W3_MID",1500,3],["W3_CAP",2000,3]
   ];
   fixtures.forEach(([id,level,phase])=>{
    const source=makeSchema16(level,phase),before=meaningful(source),raw=clone(source);
    const migrated=window.migrateSave(clone(source),16,null,raw),after=meaningful(migrated),migration=clone(window.LAST_SAVE_MIGRATION_REPORT||{});
    const lifecycle=window.reincarnationLifecycleSnapshot(migrated);
    const ok=JSON.stringify(before)===JSON.stringify(after)&&migrated.saveVersion===17&&migrated.reincarnation?.count===0&&lifecycle.firstRun===true&&lifecycle.reincarnationRun===false&&lifecycle.lifeId===0&&migration.reincarnationStateInitialized===true&&migration.sourceReincarnationCount===0&&migration.targetReincarnationCount===0;
    record(`SCHEMA16_ZERO_POLLUTION_${id}`,ok,{before,after,lifecycle,migration:{sourceVersion:migration.sourceVersion,targetVersion:migration.targetVersion,reincarnationStateInitialized:migration.reincarnationStateInitialized,sourceReincarnationCount:migration.sourceReincarnationCount,targetReincarnationCount:migration.targetReincarnationCount}});
   });

   const invalid={reincarnation:{count:-5,breakthrough:{permanent:-20,milestones:{100:true,200:"true",300:1}},alternateUniverse:{unlocked:false,deepestCleared:5000,activeAttempt:{lifeId:9,depth:4,attemptId:"bad",traits:["A","B"]},lifeFailures:{4:{lifeId:9,failures:99}}}}};
   window.normalizeReincarnationState(invalid);
   record("INVALID_REINCARNATION_NORMALIZES_TO_SAFE_FIRST_RUN",
    invalid.reincarnation.count===0&&invalid.reincarnation.breakthrough.permanent===0&&invalid.reincarnation.breakthrough.milestones["100"]===true&&invalid.reincarnation.breakthrough.milestones["200"]===false&&invalid.reincarnation.breakthrough.milestones["300"]===false&&invalid.reincarnation.alternateUniverse.unlocked===false&&invalid.reincarnation.alternateUniverse.deepestCleared===0&&invalid.reincarnation.alternateUniverse.activeAttempt===null&&Object.keys(invalid.reincarnation.alternateUniverse.lifeFailures).length===0,
    {actual:clone(invalid.reincarnation)});

   const bounded={reincarnation:{count:2,breakthrough:{permanent:7,milestones:{100:true,200:true}},alternateUniverse:{unlocked:true,deepestCleared:5000,activeAttempt:{lifeId:2,depth:124,attemptId:"attempt-124",traits:["A","B","C"]},lifeFailures:{124:{lifeId:2,failures:99},125:{lifeId:1,failures:4},1001:{lifeId:2,failures:2}}}}};
   window.normalizeReincarnationState(bounded);
   record("INVALID_REINCARNATION_VALUES_ARE_BOUNDED",
    bounded.reincarnation.count===2&&bounded.reincarnation.alternateUniverse.deepestCleared===1000&&bounded.reincarnation.alternateUniverse.activeAttempt?.lifeId===2&&bounded.reincarnation.alternateUniverse.activeAttempt?.depth===124&&JSON.stringify(bounded.reincarnation.alternateUniverse.activeAttempt?.traits)===JSON.stringify(["A","B"])&&bounded.reincarnation.alternateUniverse.lifeFailures?.["124"]?.failures===10&&!bounded.reincarnation.alternateUniverse.lifeFailures?.["125"]&&!bounded.reincarnation.alternateUniverse.lifeFailures?.["1001"],
    {actual:clone(bounded.reincarnation)});

   const original=newState();
   original.saveVersion=17;
   original.reincarnation.count=4;
   original.reincarnation.breakthrough.permanent=37;
   original.reincarnation.breakthrough.milestones["100"]=true;
   original.reincarnation.breakthrough.milestones["200"]=true;
   original.reincarnation.alternateUniverse.unlocked=true;
   original.reincarnation.alternateUniverse.deepestCleared=123;
   original.reincarnation.alternateUniverse.activeAttempt={lifeId:4,depth:124,attemptId:"roundtrip-124",traits:["強壯","迅捷"]};
   original.reincarnation.alternateUniverse.lifeFailures={"124":{lifeId:4,failures:3}};
   const serialized=JSON.stringify(original),parsed=JSON.parse(serialized),roundTrip=window.migrateSave(parsed,17,null,clone(parsed));
   const expectedReincarnation=clone(original.reincarnation),actualReincarnation=clone(roundTrip.reincarnation);
   record("SCHEMA17_REINCARNATION_ROUND_TRIP",JSON.stringify(expectedReincarnation)===JSON.stringify(actualReincarnation)&&roundTrip.saveVersion===17&&window.currentLifeId(roundTrip)===4&&window.currentLifeBreakthrough(roundTrip)===2,{expected:expectedReincarnation,actual:actualReincarnation});

   const first=window.reincarnationLifecycleSnapshot({reincarnation:{count:0}}),later=window.reincarnationLifecycleSnapshot({reincarnation:{count:5}});
   record("LIFECYCLE_DERIVED_ONLY",first.lifeId===0&&first.firstRun===true&&later.lifeId===5&&later.reincarnationRun===true,{first,later});
   return {passed:errors.length===0,errors,cases,pageErrors};
  });
  assert.equal(report.passed,true,"Reincarnation save integrity failed:\n"+JSON.stringify(report.errors,null,2));
  assert.deepEqual(report.pageErrors,[],"Reincarnation save integrity page errors:\n"+report.pageErrors.join("\n\n"));
  assert.deepEqual(pageErrors,[],"Browser pageerror:\n"+pageErrors.join("\n\n"));
  console.log("Reincarnation save integrity passed:",JSON.stringify({cases:report.cases.map(x=>({id:x.id,ok:x.ok}))}));
 }finally{await browser.close();}
})().catch(error=>{console.error(error?.stack||error);process.exit(1);});
