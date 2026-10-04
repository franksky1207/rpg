const { chromium }=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true});
 const page=await browser.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(String(e?.message||e)));
 await page.goto('http://127.0.0.1:4173/index.html',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.REINCARNATION_RERUN_MAINLINE_BACKFILL_VERSION===2&&window.REINCARNATION_RERUN_PROGRESS_NORMALIZATION_VERSION===1&&typeof window.applyFirstWorldReincarnationRerunConquest==='function'&&typeof window.applySecondWorldReincarnationRerunConquest==='function'&&typeof window.normalizeExistingReincarnationRerunProgress==='function'&&typeof window.migrateSave==='function'&&typeof window.settleSecondWorldBossVictory==='function');
 const report=await page.evaluate(()=>{
  const milestone=()=>Object.fromEntries([100,200,300,400,500,600,700,800,900,1000].map(x=>[x,false]));
  const reincarnation=count=>({count,breakthrough:{permanent:0,milestoneLifeId:count,milestones:milestone()},alternateUniverse:{unlocked:false,deepestCleared:0,activeAttempt:null,lifeFailures:{lifeId:count,failures:{}}}});
  const makeW1=count=>{const s=newState();s.saveVersion=17;s.reincarnation=reincarnation(count);s.level=500;s.secondWorld=createBlankSecondWorldState();s.thirdWorld=createBlankThirdWorldState();s.unlockedMap=0;s.mapProgress=Array.from({length:100},()=>[0,0,0,0]);s.bossProgress=Array(100).fill(0);s.bossLocked=Array(100).fill(false);s.bossKilled=Array(100).fill(false);return s;};
  const makeW2=count=>{const s=newState();s.saveVersion=17;s.reincarnation=reincarnation(count);s.level=1000;s.secondWorld=createBlankSecondWorldState();s.secondWorld.entered=true;s.secondWorld.civilizationLevel=10;s.thirdWorld=createBlankThirdWorldState();return s;};
  const migrateFixture=source=>migrateSave(JSON.parse(JSON.stringify(source)),17,null,JSON.parse(JSON.stringify(source)));
  const original=state,out={version:window.REINCARNATION_RERUN_MAINLINE_BACKFILL_VERSION,normalizationVersion:window.REINCARNATION_RERUN_PROGRESS_NORMALIZATION_VERSION};

  state=makeW1(0);const firstW1Before=JSON.stringify({unlockedMap:state.unlockedMap,mapProgress:state.mapProgress,bossProgress:state.bossProgress,bossKilled:state.bossKilled});const firstW1Result=applyFirstWorldReincarnationRerunConquest(99,state);const firstW1After=JSON.stringify({unlockedMap:state.unlockedMap,mapProgress:state.mapProgress,bossProgress:state.bossProgress,bossKilled:state.bossKilled});const firstW1Normalize=normalizeExistingReincarnationRerunProgress(state);out.firstW1={result:firstW1Result,normalize:firstW1Normalize,unchanged:firstW1Before===firstW1After};

  state=makeW1(1);const weakBoss={name:'回填測試王',level:500,kind:'boss',hp:1,atk:0,def:0,crit:0,dodge:0,traits:[]};state.hp=999999999;const w1Fight=fightOnce(99,4,weakBoss);out.w1={win:w1Fight?.win===true,killed:state.bossKilled.filter(Boolean).length,allProgress:state.mapProgress.every(row=>[0,1,2,3].every(i=>Number(row?.[i])>=10)),allBossProgress:state.bossProgress.every(v=>Number(v)>=10),allUnlocked:state.bossLocked.every(v=>v===false),unlockedMap:state.unlockedMap,coverage:firstWorldRerunKeyBossCoverage(state),arenaCap:getArenaRankCapForWorld(1,state),keyBosses:WORLD_REGIONS.map(r=>state.bossKilled[r.mapEnd]===true)};

  state=makeW1(1);const sixthEnd=WORLD_REGIONS[5].mapEnd;applyFirstWorldReincarnationRerunConquest(sixthEnd,state);out.w1Partial={end:sixthEnd,through:state.bossKilled.slice(0,sixthEnd+1).every(Boolean),after:state.bossKilled.slice(sixthEnd+1).some(Boolean),coverage:firstWorldRerunKeyBossCoverage(state),arenaCap:getArenaRankCapForWorld(1,state)};

  state=makeW2(0);const firstW2Before=state.secondWorld.mainline.bossKilled.slice();const firstW2Result=applySecondWorldReincarnationRerunConquest(99,state);const firstW2Normalize=normalizeExistingReincarnationRerunProgress(state);out.firstW2={result:firstW2Result,normalize:firstW2Normalize,unchanged:JSON.stringify(firstW2Before)===JSON.stringify(state.secondWorld.mainline.bossKilled)};

  state=makeW2(1);const settled=settleSecondWorldBossVictory(99,{rng:()=>.99});out.w2={ok:settled?.ok===true,firstKill:settled?.firstKill===true,killed:state.secondWorld.mainline.bossKilled.filter(Boolean).length,all:state.secondWorld.mainline.bossKilled.every(Boolean),coverage:secondWorldRerunKeyBossCoverage(state),arenaCap:getArenaRankCapForWorld(2,state)};

  state=makeW2(1);applySecondWorldReincarnationRerunConquest(59,state);out.w2Partial={through:state.secondWorld.mainline.bossKilled.slice(0,60).every(Boolean),after:state.secondWorld.mainline.bossKilled.slice(60).some(Boolean),coverage:secondWorldRerunKeyBossCoverage(state),arenaCap:getArenaRankCapForWorld(2,state)};

  const oldW1=makeW1(1);oldW1.bossKilled[99]=true;const migratedW1=migrateFixture(oldW1),w1SecondPass=normalizeExistingReincarnationRerunProgress(migratedW1);out.schema17W1={count:migratedW1.reincarnation.count,killed:migratedW1.bossKilled.filter(Boolean).length,allProgress:migratedW1.mapProgress.every(row=>[0,1,2,3].every(i=>Number(row?.[i])>=10)),allBossProgress:migratedW1.bossProgress.every(v=>Number(v)>=10),unlockedMap:migratedW1.unlockedMap,secondPassChanged:w1SecondPass.changed,report:{normalized:LAST_SAVE_MIGRATION_REPORT?.rerunProgressNormalized,world1End:LAST_SAVE_MIGRATION_REPORT?.rerunProgressWorld1End,version:LAST_SAVE_MIGRATION_REPORT?.rerunProgressNormalizationVersion}};

  const oldW2=makeW2(1);oldW2.secondWorld.mainline.bossKilled=Array(100).fill(false);oldW2.secondWorld.mainline.bossKilled[99]=true;const migratedW2=migrateFixture(oldW2),w2SecondPass=normalizeExistingReincarnationRerunProgress(migratedW2);out.schema17W2={count:migratedW2.reincarnation.count,killed:migratedW2.secondWorld.mainline.bossKilled.filter(Boolean).length,secondPassChanged:w2SecondPass.changed,report:{normalized:LAST_SAVE_MIGRATION_REPORT?.rerunProgressNormalized,world2End:LAST_SAVE_MIGRATION_REPORT?.rerunProgressWorld2End,version:LAST_SAVE_MIGRATION_REPORT?.rerunProgressNormalizationVersion}};

  const firstLegacy=makeW1(0);firstLegacy.bossKilled[99]=true;const firstLegacyBefore=JSON.stringify(firstLegacy),firstLegacyResult=normalizeExistingReincarnationRerunProgress(firstLegacy);out.firstRunLegacy={changed:firstLegacyResult.changed,rerun:firstLegacyResult.rerun,unchanged:firstLegacyBefore===JSON.stringify(firstLegacy),killed:firstLegacy.bossKilled.filter(Boolean).length};

  state=original;return out;
 });
 const fail=(code,detail)=>{throw new Error(`${code}: ${JSON.stringify(detail)}`)};
 if(errors.length)fail('PAGE_ERRORS',errors);
 if(report.version!==2||report.normalizationVersion!==1)fail('VERSION',report);
 if(report.firstW1.result?.ok!==false||report.firstW1.normalize?.changed!==false||report.firstW1.normalize?.rerun!==false||report.firstW1.unchanged!==true)fail('FIRST_W1_CONTAMINATED',report.firstW1);
 if(report.w1.win!==true||report.w1.killed!==100||report.w1.allProgress!==true||report.w1.allBossProgress!==true||report.w1.allUnlocked!==true||report.w1.unlockedMap!==99||report.w1.coverage!==10||report.w1.arenaCap!==10||report.w1.keyBosses.some(v=>v!==true))fail('W1_FULL_BACKFILL',report.w1);
 if(report.w1Partial.through!==true||report.w1Partial.after!==false||report.w1Partial.coverage!==6||report.w1Partial.arenaCap!==6)fail('W1_PARTIAL_BACKFILL',report.w1Partial);
 if(report.firstW2.result?.ok!==false||report.firstW2.normalize?.changed!==false||report.firstW2.normalize?.rerun!==false||report.firstW2.unchanged!==true)fail('FIRST_W2_CONTAMINATED',report.firstW2);
 if(report.w2.ok!==true||report.w2.firstKill!==true||report.w2.killed!==100||report.w2.all!==true||report.w2.coverage!==10||report.w2.arenaCap!==10)fail('W2_FULL_BACKFILL',report.w2);
 if(report.w2Partial.through!==true||report.w2Partial.after!==false||report.w2Partial.coverage!==6||report.w2Partial.arenaCap!==6)fail('W2_PARTIAL_BACKFILL',report.w2Partial);
 if(report.schema17W1.count!==1||report.schema17W1.killed!==100||report.schema17W1.allProgress!==true||report.schema17W1.allBossProgress!==true||report.schema17W1.unlockedMap!==99||report.schema17W1.secondPassChanged!==false||report.schema17W1.report.normalized!==true||report.schema17W1.report.world1End!==99||report.schema17W1.report.version!==1)fail('SCHEMA17_W1_NORMALIZATION',report.schema17W1);
 if(report.schema17W2.count!==1||report.schema17W2.killed!==100||report.schema17W2.secondPassChanged!==false||report.schema17W2.report.normalized!==true||report.schema17W2.report.world2End!==99||report.schema17W2.report.version!==1)fail('SCHEMA17_W2_NORMALIZATION',report.schema17W2);
 if(report.firstRunLegacy.changed!==false||report.firstRunLegacy.rerun!==false||report.firstRunLegacy.unchanged!==true||report.firstRunLegacy.killed!==1)fail('FIRST_RUN_SCHEMA17_ISOLATION',report.firstRunLegacy);
 console.log('Reincarnation rerun formal downward conquest + schema17 normalization E2E passed:',JSON.stringify(report));
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
