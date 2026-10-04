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
  await page.waitForFunction(()=>window.GM_ALTERNATE_UNIVERSE_BENCHMARK_VERSION===2&&window.GM_ALTERNATE_UNIVERSE_BENCHMARK_INTEGRATION_VERSION===1&&window.GM_POWER_BENCHMARK_MODE_STATE_VERSION===2&&typeof window.applyReincarnationResetState==="function"&&typeof window.grantBreakthroughMilestonesForLevelCrossing==="function",{timeout:30000});
  const report=await page.evaluate(async()=>{
   const clone=v=>JSON.parse(JSON.stringify(v));
   const qualify=s=>{
    s.level=2000;s.exp=0;
    s.thirdWorld=window.createBlankThirdWorldState();
    s.thirdWorld.entered=true;s.thirdWorld.completed=true;s.thirdWorld.coreLevel=10;s.thirdWorld.coreProgress=0;
    s.thirdWorld.bosses=s.thirdWorld.bosses.map(()=>({currentHp:0}));
    return s;
   };
   const first=qualify(newState());first.saveVersion=17;
   const firstGrant=window.grantBreakthroughMilestonesForLevelCrossing(1,1000,first);
   const firstBefore=clone(first.reincarnation);
   const firstReset=window.applyReincarnationResetState(first,{currentTime:1000});
   const life1AfterReset=clone(first.reincarnation);
   const life1Grant=window.grantBreakthroughMilestonesForLevelCrossing(1,1000,first);
   const life1Repeat=window.grantBreakthroughMilestonesForLevelCrossing(1,1000,first);
   const life1Late=window.grantBreakthroughMilestonesForLevelCrossing(1000,1500,first);
   first.reincarnation.alternateUniverse={unlocked:true,deepestCleared:100,activeAttempt:{lifeId:1,depth:101,attemptId:"batch7-life1-au",traits:["strong","swift"]},lifeFailures:{lifeId:1,failures:{"101":7}}};
   first.dungeon=first.dungeon||{};
   first.dungeon.arenaByWorld={1:{rank:7},2:{rank:4}};
   first.dungeon.mirror={best:20,streak:20,history:[20]};
   first.dungeon.voidMirage={highestCleared:88};
   first.offline={battleSampleVersion:4,lastSettledAt:444,battleSamples:[{sampleVersion:4,world:1,targetType:"mainline",combatSpeed:1,actualMs:1000,cycleMs:1140,adjustedMs:1140,playerLevel:1,enemyLevel:500,overlevelContextRecorded:true,kind:"boss",multiplier:1,recordedAt:444}],pendingSettlement:{sampleVersion:4,world:1,targetType:"mainline"},farmMap:9,farmEnemy:4,avgBattleMs:1000,sampleCount:1,maxObservedWallClock:444,timeLockUntil:0,sampleMigration:null};
   first.level=1;
   const access=Object.fromEntries(["bounty","arena","tower","mirror"].map(mode=>[mode,window.dungeonModeAccessSnapshot(mode,first)]));
   const overlevel=window.reincarnationOverlevelRewardMultiplier(1,500,first);
   const mirrorBefore=clone(first.dungeon.mirror),voidBefore=clone(first.dungeon.voidMirage);
   qualify(first);
   const life2Reset=window.applyReincarnationResetState(first,{currentTime:2000});
   const life2AfterReset={reincarnation:clone(first.reincarnation),offline:clone(first.offline),arenaByWorld:clone(first.dungeon.arenaByWorld),mirror:clone(first.dungeon.mirror),voidMirage:clone(first.dungeon.voidMirage)};
   const life2Grant=window.grantBreakthroughMilestonesForLevelCrossing(1,500,first);
   const life2Repeat=window.grantBreakthroughMilestonesForLevelCrossing(1,500,first);
   const life2Down=window.grantBreakthroughMilestonesForLevelCrossing(500,100,first);

   const readOnlyBefore=JSON.stringify(first),auSnapshot=window.gmAlternateUniverseFormalSnapshot(first),readOnlyAfter=JSON.stringify(first);

   const originalState=state,originalSave=window.save,originalBreakthrough=window.gmTestBreakthroughLevelValue?.()??0;
   let saveCalls=0,sandboxStable=false,summary0="",summary1="",summaryAfterChange="",html0="",html1="",htmlAfterChange="",benchmark=null,session637=null,registered=[];
   try{
    state=clone(first);
    window.save=()=>{saveCalls++;return true;};
    window.gmPowerBenchmarkClearAllResults();
    window.gmPowerBenchmarkInvalidateSnapshot();
    html0=window.gmPowerBenchmarkHtml();summary0=window.gmPowerBenchmarkSummaryText();
    const formalBeforeSandbox=JSON.stringify(state);
    window.gmSetTestBreakthroughLevel(37,false);
    sandboxStable=formalBeforeSandbox===JSON.stringify(state);
    window.gmAlternateUniverseBenchmarkSetDepth(637);
    session637=window.gmAlternateUniverseBenchmarkSession();
    window.gmAlternateUniverseBenchmarkSetDepth(1);
    benchmark=await window.gmAlternateUniverseBenchmarkRunSelected();
    html1=window.gmPowerBenchmarkHtml();summary1=window.gmPowerBenchmarkSummaryText();
    window.gmSetTestBreakthroughLevel(38,true);
    htmlAfterChange=window.gmPowerBenchmarkHtml();summaryAfterChange=window.gmPowerBenchmarkSummaryText();
    registered=typeof window.gmHubRegisteredSectionIds==="function"?window.gmHubRegisteredSectionIds("test"):[];
   }finally{
    state=originalState;window.save=originalSave;
    if(typeof window.gmSetTestBreakthroughLevel==="function")window.gmSetTestBreakthroughLevel(originalBreakthrough,false);
   }
   return {
    versions:{auBenchmark:window.GM_ALTERNATE_UNIVERSE_BENCHMARK_VERSION,auIntegration:window.GM_ALTERNATE_UNIVERSE_BENCHMARK_INTEGRATION_VERSION,modeState:window.GM_POWER_BENCHMARK_MODE_STATE_VERSION},
    install:window.GM_ALTERNATE_UNIVERSE_BENCHMARK_INSTALL_REPORT,modeIds:Array.from(window.GM_POWER_BENCHMARK_MODE_IDS||[]),
    firstGrant,firstBefore,firstReset,life1AfterReset,life1Grant,life1Repeat,life1Late,access,overlevel,mirrorBefore,voidBefore,life2Reset,life2AfterReset,life2Grant,life2Repeat,life2Down,
    readOnlyStable:readOnlyBefore===readOnlyAfter,auSnapshot,saveCalls,sandboxStable,html0,summary0,session637,benchmark,html1,summary1,htmlAfterChange,summaryAfterChange,registered,
    benchmarkResultAfterChange:window.gmAlternateUniverseBenchmarkResultSnapshot?.()||null
   };
  });

  assert.deepEqual(report.versions,{auBenchmark:2,auIntegration:1,modeState:2});
  assert.equal(report.install.integrated,true);assert.equal(report.install.separateHubSection,false);assert.equal(report.install.defaultDepth,1);
  assert.equal(report.modeIds.length,8);assert.ok(report.modeIds.includes("alternate"));
  assert.equal(report.registered.includes("alternate-universe-benchmark-test"),false,"AU benchmark must live inside the existing power benchmark section, not as a ninth GM test section.");

  assert.equal(report.firstGrant.awarded,0,"First run must never earn breakthrough milestones.");
  assert.equal(report.firstReset.ok,true);assert.equal(report.firstReset.countBefore,0);assert.equal(report.firstReset.countAfter,1);
  assert.equal(report.life1AfterReset.count,1);assert.equal(report.life1AfterReset.breakthrough.permanent,0);
  assert.equal(report.life1Grant.awarded,10);assert.equal(report.life1Grant.permanentAfter,10);assert.equal(report.life1Grant.currentLifeAfter,10);
  assert.equal(report.life1Repeat.awarded,0);assert.equal(report.life1Late.awarded,0,"Lv.1000+ must not add more current-life breakthrough milestones.");
  for(const mode of ["bounty","arena","tower","mirror"]){assert.equal(report.access[mode].permanent,true,mode+" must be permanently accessible after reincarnation.");assert.equal(report.access[mode].unlocked,true);}
  assert.ok(Math.abs(report.overlevel-15.97)<1e-9,"Reincarnation overlevel multiplier must remain active on Life1.");

  assert.equal(report.life2Reset.ok,true);assert.equal(report.life2Reset.countBefore,1);assert.equal(report.life2Reset.countAfter,2);
  assert.equal(report.life2AfterReset.reincarnation.breakthrough.permanent,10,"Permanent breakthrough must survive next reincarnation.");
  assert.equal(report.life2AfterReset.reincarnation.breakthrough.milestoneLifeId,2);
  assert.equal(Object.values(report.life2AfterReset.reincarnation.breakthrough.milestones).every(v=>v===false),true,"New life milestone ownership must start blank.");
  assert.equal(report.life2AfterReset.reincarnation.alternateUniverse.unlocked,true);assert.equal(report.life2AfterReset.reincarnation.alternateUniverse.deepestCleared,100);
  assert.equal(report.life2AfterReset.reincarnation.alternateUniverse.activeAttempt,null);assert.deepEqual(report.life2AfterReset.reincarnation.alternateUniverse.lifeFailures,{lifeId:2,failures:{}});
  assert.equal(report.life2AfterReset.offline.battleSamples.length,0);assert.equal(report.life2AfterReset.offline.pendingSettlement,null);assert.equal(report.life2AfterReset.offline.lastSettledAt,2000);
  assert.deepEqual(report.life2AfterReset.arenaByWorld,{1:{},2:{}},"W1/W2 Arena current-life progress must reset each reincarnation.");
  assert.deepEqual(report.life2AfterReset.mirror,report.mirrorBefore,"Mirror history must survive reincarnation.");assert.deepEqual(report.life2AfterReset.voidMirage,report.voidBefore,"Void history must survive reincarnation.");
  assert.equal(report.life2Grant.awarded,5);assert.equal(report.life2Grant.permanentAfter,15);assert.equal(report.life2Grant.currentLifeAfter,5);
  assert.equal(report.life2Repeat.awarded,0);assert.equal(report.life2Down.awarded,0,"Level decrease must not deduct or re-award milestones.");
  assert.equal(report.readOnlyStable,true,"GM AU snapshot must be read-only.");assert.equal(report.auSnapshot.lifeId,2);

  assert.equal(report.sandboxStable,true,"GM test breakthrough changes must not alter formal state.");assert.equal(report.saveCalls,0,"GM test sandbox and AU benchmark must not write formal save.");
  assert.ok(report.html0.includes("異宇宙測試"));assert.ok(report.html0.includes("王編號")&&report.html0.includes("上一隻")&&report.html0.includes("下一隻"));
  assert.ok(!report.html0.includes("特性 A")&&!report.html0.includes("檢查 21 組雙特性"),"Internal trait diagnostics must not clutter the GM benchmark UI.");
  assert.ok(report.html0.includes("0 / 8"),"Fresh/cleared benchmark summary must be 0 / 8.");assert.ok(!report.html0.includes(" / 7"));
  assert.ok(report.summary0.includes("尚未執行任何戰鬥測試"));
  assert.equal(report.session637.depth,637,"AU boss selection must persist within the current page session.");
  assert.equal(report.benchmark.formalStateStable,true);assert.equal(report.benchmark.completed,100);assert.equal(report.benchmark.invalid,0);assert.equal(report.benchmark.actionSafety,0);
  assert.ok(report.html1.includes("1 / 8"));assert.ok(report.html1.includes("異宇宙"));assert.ok(report.summary1.includes("【異宇宙】")&&report.summary1.includes("第 1 層域"));
  assert.ok(report.htmlAfterChange.includes("0 / 8"),"Changing test character power must invalidate old AU benchmark result.");assert.ok(!report.summaryAfterChange.includes("【異宇宙】"));
  assert.equal(report.benchmarkResultAfterChange,null);
  assert.deepEqual(pageErrors,[],"Browser pageerror:\n"+pageErrors.join("\n\n"));

  const page2=await browser.newPage();
  await page2.goto(url,{waitUntil:"domcontentloaded",timeout:30000});
  await page2.waitForFunction(()=>window.GM_ALTERNATE_UNIVERSE_BENCHMARK_VERSION===2,{timeout:30000});
  const freshDepth=await page2.evaluate(()=>window.gmAlternateUniverseBenchmarkSession().depth);
  assert.equal(freshDepth,1,"Reload/new page must reset AU boss selection to boss 1.");
  await page2.close();
  console.log("Batch7 final closure passed:",JSON.stringify({versions:report.versions,life1:{permanent:report.life1Grant.permanentAfter},life2:{count:report.life2AfterReset.reincarnation.count,permanent:report.life2Grant.permanentAfter,auDepth:report.life2AfterReset.reincarnation.alternateUniverse.deepestCleared},benchmark:{completed:report.benchmark.completed,formalStateStable:report.benchmark.formalStateStable},summary:{zero:report.html0.includes("0 / 8"),one:report.html1.includes("1 / 8"),invalidated:report.htmlAfterChange.includes("0 / 8")},freshDepth}));
 }finally{await browser.close();}
})().catch(error=>{console.error(error?.stack||error);process.exit(1);});
