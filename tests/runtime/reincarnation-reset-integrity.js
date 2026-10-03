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
  await page.waitForFunction(()=>window.REINCARNATION_CORE_VERSION===1&&window.REINCARNATION_ELIGIBILITY_VERSION===1&&window.REINCARNATION_RESET_MUTATION_VERSION===1&&typeof window.reincarnationEligibilitySnapshot==="function"&&typeof window.applyReincarnationResetState==="function",{timeout:30000});
  const report=await page.evaluate(()=>{
   const clone=v=>JSON.parse(JSON.stringify(v));
   const makeQualified=()=>{
    const s=newState();
    s.saveVersion=17;
    s.level=2000;s.exp=123456;s.hp=99999;s.gold=777777;s.unlockedMap=Math.max(0,MAPS.length-1);
    s.mapProgress=s.mapProgress.map(()=>[9,9,9,9]);s.bossProgress=s.bossProgress.map(()=>10);s.bossLocked=s.bossLocked.map(()=>true);s.bossKilled=s.bossKilled.map(()=>true);
    s.vipPoints=625000;window.normalizeVipState(s);
    s.settings={...s.settings,combatSpeed:1.5,dark:false,customPreference:"keep"};
    s.titles={unlocked:["calamity-10","mirror-20"],selected:"mirror-20"};
    s.storyProgress={completedStories:["earth-boss-1","higher-dimensional-final"],customHistory:"keep"};
    s.daily={dateKey:"2026-10-03",bountyUsed:17,arenaUsed:19,rewardClaimed:true};
    s.dungeon={arenaByWorld:{1:{highestArenaUnlocked:10,rank:10},2:{highestArenaUnlocked:10,rank:10}},mirror:{streak:20,best:20},voidMirage:{highestCleared:88},thirdWorldArenaTransaction:{version:1,status:"active"}};
    s.reincarnation={count:2,breakthrough:{permanent:17,milestoneLifeId:2,milestones:Object.fromEntries((window.BREAKTHROUGH_MILESTONE_LEVELS||[]).map(level=>[String(level),true]))},alternateUniverse:{unlocked:true,deepestCleared:12,activeAttempt:{lifeId:2,depth:13,attemptId:"active-13",traits:["strong","hard"]},lifeFailures:{lifeId:2,failures:{"13":7}}}};
    s.specializations=Object.fromEntries((window.SPECIALIZATION_KEYS||[]).map(key=>[key,60]));
    s.enhancement={basicStones:999,advancedStones:888,levels:Object.fromEntries(["weapon","helmet","armor","shoes","accessory"].map(slot=>[slot,40]))};
    s.calamities=window.createBlankCalamityState();Object.values(s.calamities.entries).forEach(row=>{row.currentHp=1;});
    s.marks=window.createBlankMarkState();Object.values(s.marks.entries).forEach(row=>{row.acquired=true;row.level=10;row.progress=0;});
    s.secondWorld=window.createBlankSecondWorldState();s.secondWorld.entered=true;s.secondWorld.darkMatter=999999;s.secondWorld.darkEnergy=888;s.secondWorld.civilizationLevel=10;s.secondWorld.mainline.bossKilled=s.secondWorld.mainline.bossKilled.map(()=>true);s.secondWorld.calamities.forEach(row=>{row.trueKills=30;row.currentHp=1;});
    s.thirdWorld=window.createBlankThirdWorldState();s.thirdWorld.entered=true;s.thirdWorld.completed=true;s.thirdWorld.entryVersion=2;s.thirdWorld.dimensionalStrings=123456789;s.thirdWorld.coreLevel=10;s.thirdWorld.coreProgress=0;s.thirdWorld.bosses=s.thirdWorld.bosses.map(()=>({currentHp:0}));s.thirdWorld.story={introSeen:true,unlockedStage:10,finalSeen:true};
    const permanent=(type,hp)=>({id:`p-${type}`,type,world:3,level:2000,name:`永久${type}`,hp,atk:type==="weapon"?100:0,def:type==="armor"?50:0,crit:0,dodge:0,mainStat:{stat:type==="weapon"?"atk":type==="armor"?"def":"hp",value:10},affixes:[],sell:0,buy:0});
    s.equipment={weapon:permanent("weapon",100),helmet:permanent("helmet",200),armor:permanent("armor",300),shoes:permanent("shoes",400),accessory:{id:"old-accessory",type:"accessory",world:2,level:1000,name:"應移除",hp:999,atk:0,def:0,crit:10,dodge:0,mainStat:{stat:"crit",value:10},affixes:[]}};
    s.inventory=[permanent("accessory",500),{id:"old-inventory",type:"weapon",world:2,level:1000,name:"應移除",hp:1,atk:1,def:0,crit:0,dodge:0,mainStat:{stat:"atk",value:1},affixes:[]}];
    s.lostGear=[{id:"lost",item:permanent("weapon",999),cost:0,lostAt:1}];
    s.pendingBlackMarketEncounter=true;
    s.offline={battleSampleVersion:4,lastSettledAt:100,battleSamples:[{sampleVersion:4,world:3,targetType:"higher-dimensional",combatSpeed:1.5,actualMs:1000,cycleMs:1140,adjustedMs:1140,playerLevel:2000,kind:"higher-dimensional",multiplier:1,recordedAt:100}],pendingSettlement:{sampleVersion:4,world:3,targetType:"higher-dimensional"},farmMap:1,farmEnemy:0,avgBattleMs:1000,sampleCount:1,maxObservedWallClock:100,timeLockUntil:0,sampleMigration:null};
    return s;
   };
   const eligibilityState=makeQualified();
   const eligible=window.reincarnationEligibilitySnapshot(eligibilityState);
   const levelFail=clone(eligibilityState);levelFail.level=1999;
   const bossFail=clone(eligibilityState);bossFail.thirdWorld.bosses[3].currentHp=1;
   const coreFail=clone(eligibilityState);coreFail.thirdWorld.coreLevel=9;
   const storyIrrelevant=clone(eligibilityState);storyIrrelevant.storyProgress={completedStories:[]};
   const requirements={eligible,levelFail:window.reincarnationEligibilitySnapshot(levelFail),bossFail:window.reincarnationEligibilitySnapshot(bossFail),coreFail:window.reincarnationEligibilitySnapshot(coreFail),storyIrrelevant:window.reincarnationEligibilitySnapshot(storyIrrelevant)};
   const rejected=clone(eligibilityState);rejected.level=1999;const rejectedBefore=JSON.stringify(rejected),rejectedResult=window.applyReincarnationResetState(rejected,{currentTime:5000});
   const s=makeQualified();
   const preserved={vipPoints:s.vipPoints,vipLevel:s.vipLevel,settings:clone(s.settings),titles:clone(s.titles),storyProgress:clone(s.storyProgress),daily:clone(s.daily),mirror:clone(s.dungeon.mirror),voidMirage:clone(s.dungeon.voidMirage)};
   const result=window.applyReincarnationResetState(s,{currentTime:5000});
   const milestoneValues=Object.values(s.reincarnation.breakthrough.milestones||{});
   const reset={
    level:s.level,exp:s.exp,gold:s.gold,hp:s.hp,unlockedMap:s.unlockedMap,
    mapZero:s.mapProgress.every(row=>row.every(v=>v===0)),bossProgressZero:s.bossProgress.every(v=>v===0),bossKilledZero:s.bossKilled.every(v=>v===false),bossLockedZero:s.bossLocked.every(v=>v===false),
    enhancement:s.enhancement,specializations:s.specializations,
    marksZero:Object.values(s.marks.entries||{}).every(row=>row.acquired===false&&row.level===0&&row.progress===0),
    calamityReset:Object.values(s.calamities.entries||{}).every(row=>row.currentHp==null),
    secondWorld:s.secondWorld,thirdWorld:s.thirdWorld,
    arenaByWorld:clone(s.dungeon.arenaByWorld),hasThirdWorldArenaTransaction:Object.prototype.hasOwnProperty.call(s.dungeon,"thirdWorldArenaTransaction"),
    offline:clone(s.offline),pendingBlackMarketEncounter:s.pendingBlackMarketEncounter,lostGearCount:s.lostGear.length,
    equipmentWorlds:Object.fromEntries(Object.entries(s.equipment).map(([k,v])=>[k,{world:v?.world,level:v?.level,id:v?.id}])),inventory:s.inventory.map(v=>({id:v.id,world:v.world,level:v.level})),
    reincarnation:clone(s.reincarnation),milestonesAllBlank:milestoneValues.length===10&&milestoneValues.every(v=>v===false)
   };
   const preservedAfter={vipPoints:s.vipPoints,vipLevel:s.vipLevel,settings:clone(s.settings),titles:clone(s.titles),storyProgress:clone(s.storyProgress),daily:clone(s.daily),mirror:clone(s.dungeon.mirror),voidMirage:clone(s.dungeon.voidMirage)};
   const unlockProbe=makeQualified();unlockProbe.reincarnation.alternateUniverse={unlocked:false,deepestCleared:0,activeAttempt:null,lifeFailures:{lifeId:2,failures:{}}};const unlockResult=window.applyReincarnationResetState(unlockProbe,{currentTime:6000});
   return {requirements,rejected:{result:rejectedResult,unchanged:JSON.stringify(rejected)===rejectedBefore},result,reset,preserved,preservedAfter,unlockProbe:{result:unlockResult,au:clone(unlockProbe.reincarnation.alternateUniverse)},versions:{core:window.REINCARNATION_CORE_VERSION,eligibility:window.REINCARNATION_ELIGIBILITY_VERSION,mutation:window.REINCARNATION_RESET_MUTATION_VERSION}};
  });
  assert.deepEqual(report.versions,{core:1,eligibility:1,mutation:1});
  assert.equal(report.requirements.eligible.eligible,true);assert.equal(report.requirements.eligible.storyRequired,false);
  assert.equal(report.requirements.levelFail.eligible,false);assert.equal(report.requirements.levelFail.level.ok,false);
  assert.equal(report.requirements.bossFail.eligible,false);assert.equal(report.requirements.bossFail.bosses.ok,false);
  assert.equal(report.requirements.coreFail.eligible,false);assert.equal(report.requirements.coreFail.core.ok,false);
  assert.equal(report.requirements.storyIrrelevant.eligible,true,"Story completion must not be a reincarnation requirement.");
  assert.equal(report.rejected.result.ok,false);assert.equal(report.rejected.result.reason,"requirements-incomplete");assert.equal(report.rejected.unchanged,true,"Rejected mutation must not alter state.");
  assert.equal(report.result.ok,true);assert.equal(report.result.countBefore,2);assert.equal(report.result.countAfter,3);assert.equal(report.result.permanentBreakthrough,17);assert.equal(report.result.equipment.equippedRetained,4);assert.equal(report.result.equipment.inventoryRetained,1);
  assert.deepEqual(report.preservedAfter,report.preserved,"VIP/settings/titles/story/daily/mirror/void history must survive reincarnation unchanged.");
  assert.equal(report.reset.level,1);assert.equal(report.reset.exp,0);assert.equal(report.reset.gold,0);assert.ok(report.reset.hp>0);assert.equal(report.reset.unlockedMap,0);
  assert.equal(report.reset.mapZero,true);assert.equal(report.reset.bossProgressZero,true);assert.equal(report.reset.bossKilledZero,true);assert.equal(report.reset.bossLockedZero,true);
  assert.equal(report.reset.enhancement.basicStones,0);assert.equal(report.reset.enhancement.advancedStones,0);assert.equal(Object.values(report.reset.enhancement.levels).every(v=>v===0),true);
  assert.equal(Object.values(report.reset.specializations).every(v=>v===0),true);assert.equal(report.reset.marksZero,true);assert.equal(report.reset.calamityReset,true);
  assert.equal(report.reset.secondWorld.entered,false);assert.equal(report.reset.secondWorld.darkMatter,0);assert.equal(report.reset.secondWorld.darkEnergy,0);assert.equal(report.reset.secondWorld.civilizationLevel,0);assert.equal(report.reset.secondWorld.mainline.bossKilled.every(v=>v===false),true);
  assert.equal(report.reset.thirdWorld.entered,false);assert.equal(report.reset.thirdWorld.dimensionalStrings,0);assert.equal(report.reset.thirdWorld.coreLevel,0);assert.equal(report.reset.thirdWorld.coreProgress,0);
  assert.equal(report.reset.pendingBlackMarketEncounter,false);assert.equal(report.reset.lostGearCount,0);assert.equal(report.reset.offline.battleSamples.length,0);assert.equal(report.reset.offline.pendingSettlement,null);assert.equal(report.reset.offline.lastSettledAt,5000);
  assert.deepEqual(report.reset.arenaByWorld,{1:{},2:{}});assert.equal(report.reset.hasThirdWorldArenaTransaction,false);
  assert.equal(report.reset.equipmentWorlds.weapon.world,3);assert.equal(report.reset.equipmentWorlds.weapon.level,2000);assert.equal(report.reset.equipmentWorlds.accessory.world,1);assert.equal(report.reset.equipmentWorlds.accessory.level,1);assert.deepEqual(report.reset.inventory,[{id:"p-accessory",world:3,level:2000}]);
  assert.equal(report.reset.reincarnation.count,3);assert.equal(report.reset.reincarnation.breakthrough.permanent,17);assert.equal(report.reset.reincarnation.breakthrough.milestoneLifeId,3);assert.equal(report.reset.milestonesAllBlank,true);
  assert.equal(report.reset.reincarnation.alternateUniverse.unlocked,true);assert.equal(report.reset.reincarnation.alternateUniverse.deepestCleared,12);assert.equal(report.reset.reincarnation.alternateUniverse.activeAttempt,null);assert.deepEqual(report.reset.reincarnation.alternateUniverse.lifeFailures,{lifeId:3,failures:{}});
  assert.equal(report.unlockProbe.au.unlocked,true,"Ten W3 defeats must permanently solidify AU unlock before W3 reset.");assert.equal(report.unlockProbe.au.deepestCleared,0);assert.deepEqual(report.unlockProbe.au.lifeFailures,{lifeId:3,failures:{}});
  assert.deepEqual(pageErrors,[],"Browser pageerror:\n"+pageErrors.join("\n\n"));
  console.log("Reincarnation reset integrity passed:",JSON.stringify(report));
 }finally{await browser.close();}
})().catch(error=>{console.error(error?.stack||error);process.exit(1);});
