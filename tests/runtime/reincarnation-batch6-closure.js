const {chromium}=require('playwright');
const assert=require('assert');

(async()=>{
 const browser=await chromium.launch({headless:true});
 const page=await browser.newPage();
 const pageErrors=[];
 page.on('pageerror',error=>pageErrors.push(String(error?.stack||error?.message||error)));
 const url=process.env.RUNTIME_SMOKE_URL||'http://127.0.0.1:4173/index.html';
 try{
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>
   window.REINCARNATION_OVERLEVEL_REWARD_VERSION===1&&
   window.OFFLINE_REINCARNATION_OVERLEVEL_VERSION===1&&
   window.PLAYER_BATCH_UPGRADE_VERSION===1&&
   window.REINCARNATION_DUNGEON_ACCESS_VERSION===1&&
   window.REINCARNATION_RERUN_MAINLINE_BACKFILL_VERSION===2&&
   window.REINCARNATION_RERUN_PROGRESS_NORMALIZATION_VERSION===1&&
   typeof window.applyReincarnationResetState==='function'&&
   typeof window.offlineOverlevelRewardContext==='function'&&
   typeof window.specializationBalancedUpgradePreview==='function'&&
   typeof window.enhancementBalancedUpgradePreview==='function'&&
   typeof window.normalizeExistingReincarnationRerunProgress==='function',
   {timeout:30000}
  );

  const report=await page.evaluate(async()=>{
   const milestones=count=>Object.fromEntries([100,200,300,400,500,600,700,800,900,1000].map(level=>[String(level),false]));
   const reincarnation=count=>({count,breakthrough:{permanent:0,milestoneLifeId:count,milestones:milestones(count)},alternateUniverse:{unlocked:false,deepestCleared:0,activeAttempt:null,lifeFailures:{lifeId:count,failures:{}}}});
   const makeW1=count=>{const s=newState();s.saveVersion=17;s.reincarnation=reincarnation(count);s.secondWorld=createBlankSecondWorldState();s.thirdWorld=createBlankThirdWorldState();return s;};
   const makeW2=count=>{const s=makeW1(count);s.level=500;s.secondWorld.entered=true;return s;};
   const makeQualifiedForReset=()=>{
    const s=makeW1(0);s.level=2000;s.thirdWorld=createBlankThirdWorldState();s.thirdWorld.entered=true;s.thirdWorld.completed=true;s.thirdWorld.coreLevel=10;s.thirdWorld.bosses=s.thirdWorld.bosses.map(row=>({...row,currentHp:0}));
    s.daily={dateKey:'closure-day',bountyUsed:17,arenaUsed:19,rewardClaimed:true};
    s.dungeon={...(s.dungeon||{}),arenaByWorld:{1:{highestArenaUnlocked:10,rank:10},2:{highestArenaUnlocked:10,rank:10}},mirror:{streak:20,best:20},voidMirage:{highestCleared:88}};
    return s;
   };
   const clone=v=>JSON.parse(JSON.stringify(v));
   const originalState=state,originalView=view;
   const out={};
   try{
    // 6-1 / 6-3: first run stays 1x, rerun online and offline share the same owner and exact recorded target identity.
    const first=makeW1(0),rerun=makeW1(1),pending={playerLevel:100,enemyLevel:500,overlevelContextRecorded:true};
    state=first;const firstOffline=offlineOverlevelRewardContext(pending,500);
    state=rerun;const rerunOffline=offlineOverlevelRewardContext(pending,500);
    out.overlevel={
     firstOnline:reincarnationOverlevelRewardMultiplier(100,500,first),firstOffline,
     rerunOnline:reincarnationOverlevelRewardMultiplier(100,500,rerun),rerunOffline,
     noCap:reincarnationOverlevelRewardMultiplier(1,1000,rerun)
    };

    // 6-2: the exact same batch-growth owner is used by first run and rerun; phase scope remains W1 specialization and W1/W2 enhancement only.
    const specFirst=makeW1(0),specRerun=makeW1(1);specFirst.gold=3500;specRerun.gold=3500;
    const enhW1First=makeW1(0),enhW1Rerun=makeW1(1);
    [enhW1First,enhW1Rerun].forEach(s=>{ENHANCEMENT_SLOTS.forEach(key=>s.enhancement.levels[key]=12);s.enhancement.basicStones=2000;s.enhancement.advancedStones=200;});
    const enhW2First=makeW2(0),enhW2Rerun=makeW2(1);
    [enhW2First,enhW2Rerun].forEach(s=>{ENHANCEMENT_SLOTS.forEach(key=>s.enhancement.levels[key]=20);s.secondWorld.darkMatter=100000;s.secondWorld.darkEnergy=950;SPECIALIZATION_KEYS.forEach(key=>s.specializations[key]=60);});
    out.batch={
     specFirst:specializationBalancedUpgradePreview(specFirst),specRerun:specializationBalancedUpgradePreview(specRerun),
     enhW1First:enhancementBalancedUpgradePreview(enhW1First),enhW1Rerun:enhancementBalancedUpgradePreview(enhW1Rerun),
     enhW2First:enhancementBalancedUpgradePreview(enhW2First),enhW2Rerun:enhancementBalancedUpgradePreview(enhW2Rerun)
    };

    // 6-4 lifecycle: Daily/Mirror/Void survive reincarnation, W1/W2 Arena current-life progress resets, then four dungeon entries become permanent at Lv.1.
    state=makeQualifiedForReset();const preservedBefore={daily:clone(state.daily),mirror:clone(state.dungeon.mirror),voidMirage:clone(state.dungeon.voidMirage)};
    const resetResult=applyReincarnationResetState(state,{currentTime:123456789});
    const preservedAfter={daily:clone(state.daily),mirror:clone(state.dungeon.mirror),voidMirage:clone(state.dungeon.voidMirage)};
    view='dungeon';render();
    const selectors=['.dungeon-mode-bounty','.dungeon-mode-arena','.dungeon-mode-tower','[data-mirror-dungeon-card]'];
    out.lifecycle={
     resetOk:resetResult?.ok===true,count:state.reincarnation?.count,level:state.level,preservedBefore,preservedAfter,
     arenaByWorld:clone(state.dungeon?.arenaByWorld||{}),permanent:reincarnationDungeonPermanentAccessUnlocked(state),
     cards:selectors.map(sel=>{const card=document.querySelector(sel),button=card?.querySelector('.dungeon-entry-btn');return {exists:!!card,locked:card?.classList.contains('locked')===true,hidden:card?.hidden===true,disabled:button?.disabled===true};})
    };

    // Arena mainline qualification derives downward from current-life key boss coverage; promotion assessment remains exactly 485 / 500 = 97%.
    state=makeW1(1);state.bossKilled[WORLD_REGIONS[9].mapEnd]=true;
    const w1Coverage=firstWorldRerunKeyBossCoverage(state),w1Cap=getArenaRankCapForWorld(1,state);
    state=makeW2(1);state.secondWorld.mainline.bossKilled[99]=true;
    const w2Coverage=secondWorldRerunKeyBossCoverage(state),w2Cap=getArenaRankCapForWorld(2,state);
    const arenaSource=await (await fetch('arenapositioncore.js')).text();
    out.arena={w1Coverage,w1Cap,w2Coverage,w2Cap,assessment500:arenaSource.includes('const ASSESS_RUNS=500;'),target485:arenaSource.includes('const ASSESS_CLEAR_TARGET=485;')};

    // The formal rerun progress owner is now V2 and includes idempotent Schema17 normalization; first run remains excluded.
    const stale=makeW1(1);stale.bossKilled[99]=true;const normalized=normalizeExistingReincarnationRerunProgress(stale),secondPass=normalizeExistingReincarnationRerunProgress(stale);
    const firstRun=makeW1(0);firstRun.bossKilled[99]=true;const firstRunBefore=JSON.stringify(firstRun),firstRunNormalize=normalizeExistingReincarnationRerunProgress(firstRun);
    out.progressNormalization={version:REINCARNATION_RERUN_PROGRESS_NORMALIZATION_VERSION,firstChanged:normalized.changed,full:stale.bossKilled.every(Boolean),secondPassChanged:secondPass.changed,firstRunChanged:firstRunNormalize.changed,firstRunStable:firstRunBefore===JSON.stringify(firstRun)};

    // Equipment sale is explicitly outside the overlevel multiplier; the same item quote must be identical in first run/rerun.
    const item={world:2,level:800,q:5,type:'weapon',sell:123,buy:456};
    state=makeW2(0);const firstSale=equipmentSaleQuote(item);
    state=makeW2(1);const rerunSale=equipmentSaleQuote(item);
    const overlevelSource=await (await fetch('reincarnationoverlevelrewards.js')).text();
    const offlineSource=await (await fetch('offlineprogress.js')).text();
    out.sale={firstSale,rerunSale,onlineSaleExcluded:overlevelSource.includes('saleEnhancementStones'),offlineFormalSaleOwner:offlineSource.includes('settleEquipmentSaleBatch')};
   }finally{state=originalState;view=originalView;render();}
   return out;
  });

  assert.deepStrictEqual(pageErrors,[],`page errors: ${JSON.stringify(pageErrors)}`);
  assert.strictEqual(report.overlevel.firstOnline,1);
  assert.strictEqual(report.overlevel.firstOffline.multiplier,1);
  assert.strictEqual(report.overlevel.rerunOnline,13);
  assert.strictEqual(report.overlevel.rerunOffline.multiplier,13);
  assert.strictEqual(report.overlevel.noCap,30.97);
  assert.deepStrictEqual(report.batch.specFirst.levelsAfter,report.batch.specRerun.levelsAfter);
  assert.deepStrictEqual(report.batch.enhW1First.levelsAfter,report.batch.enhW1Rerun.levelsAfter);
  assert.deepStrictEqual(report.batch.enhW2First.levelsAfter,report.batch.enhW2Rerun.levelsAfter);
  assert.strictEqual(report.lifecycle.resetOk,true);
  assert.strictEqual(report.lifecycle.count,1);
  assert.strictEqual(report.lifecycle.level,1);
  assert.deepStrictEqual(report.lifecycle.preservedAfter,report.lifecycle.preservedBefore);
  assert.strictEqual(report.lifecycle.arenaByWorld['1'].highestArenaUnlocked,1);
  assert.strictEqual(report.lifecycle.arenaByWorld['2'].highestArenaUnlocked,1);
  assert.strictEqual(report.lifecycle.permanent,true);
  assert.strictEqual(report.lifecycle.cards.every(row=>row.exists&&!row.locked&&!row.hidden&&!row.disabled),true);
  assert.strictEqual(report.arena.w1Coverage,10);
  assert.strictEqual(report.arena.w1Cap,10);
  assert.strictEqual(report.arena.w2Coverage,10);
  assert.strictEqual(report.arena.w2Cap,10);
  assert.strictEqual(report.arena.assessment500,true);
  assert.strictEqual(report.arena.target485,true);
  assert.strictEqual(report.progressNormalization.version,1);
  assert.strictEqual(report.progressNormalization.firstChanged,true);
  assert.strictEqual(report.progressNormalization.full,true);
  assert.strictEqual(report.progressNormalization.secondPassChanged,false);
  assert.strictEqual(report.progressNormalization.firstRunChanged,false);
  assert.strictEqual(report.progressNormalization.firstRunStable,true);
  assert.deepStrictEqual(report.sale.firstSale,report.sale.rerunSale);
  assert.strictEqual(report.sale.onlineSaleExcluded,true);
  assert.strictEqual(report.sale.offlineFormalSaleOwner,true);

  console.log('Reincarnation Batch6 closure passed:',JSON.stringify(report));
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exit(1);});
