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
  await page.waitForFunction(()=>window.REINCARNATION_OVERLEVEL_REWARD_VERSION===1&&window.SECOND_WORLD_OVERLEVEL_REWARD_ADAPTER_VERSION===1&&window.OFFLINE_REINCARNATION_OVERLEVEL_VERSION===1&&typeof window.fightOnce==='function'&&typeof window.secondWorldMainlineRewardPreview==='function'&&typeof window.grantFirstWorldOfflineRewards==='function'&&typeof window.grantSecondWorldOfflineRewards==='function',{timeout:30000});
  const report=await page.evaluate(async()=>{
   const milestones=count=>Object.fromEntries([100,200,300,400,500,600,700,800,900,1000].map(level=>[String(level),false]));
   const reincarnation=count=>({count,breakthrough:{permanent:0,milestoneLifeId:count,milestones:milestones(count)},alternateUniverse:{unlocked:false,deepestCleared:0,activeAttempt:null,lifeFailures:{lifeId:count,failures:{}}}});
   const makeW1=count=>{const s=newState();s.saveVersion=17;s.reincarnation=reincarnation(count);s.secondWorld=createBlankSecondWorldState();s.thirdWorld=createBlankThirdWorldState();return s;};
   const makeW2=count=>{const s=makeW1(count);s.level=500;s.secondWorld=createBlankSecondWorldState();s.secondWorld.entered=true;s.thirdWorld=createBlankThirdWorldState();return s;};
   const overpower=s=>{Object.values(s.equipment||{}).filter(Boolean).forEach(item=>{item.atk=Math.max(0,Number(item.atk)||0)+1000000000;item.def=Math.max(0,Number(item.def)||0)+1000000000;item.hp=Math.max(0,Number(item.hp)||0)+1000000000;});};
   const originalState=state,originalRandom=Math.random,originalSelected={map:selectedMap,enemy:selectedEnemy};
   const out={};
   try{
    const firstProbe=makeW1(0),rerunProbe=makeW1(1);
    out.owner={firstGap400:reincarnationOverlevelRewardMultiplier(100,500,firstProbe),rerunGap400:reincarnationOverlevelRewardMultiplier(100,500,rerunProbe),rerunEqual:reincarnationOverlevelRewardMultiplier(500,500,rerunProbe),rerunDown:reincarnationOverlevelRewardMultiplier(600,500,rerunProbe),ceil:applyReincarnationOverlevelIntegerReward(1,100,105,rerunProbe)};

    // First-run online calculations stay exactly on the legacy reward owners.
    state=makeW1(0);state.level=1;overpower(state);state.hp=playerCombatStats().hp;selectedMap=0;selectedEnemy=0;
    const firstEncounter=createMonsterEncounter(0,0),firstBaseXp=expReward(firstEncounter),firstBaseGold=goldReward(firstEncounter);
    Math.random=()=>.99;const firstResult=fightOnce(0,0,firstEncounter);Math.random=originalRandom;
    out.w1First={baseXp:firstBaseXp,baseGold:firstBaseGold,resultXp:firstResult.xp,resultGold:firstResult.gold,multiplier:firstResult.overlevelRewardMultiplier||1,stones:firstResult.enhancementStones};

    // Rerun W1 online applies the shared multiplier after the legacy reward result, including battle stones only.
    state=makeW1(1);state.level=100;overpower(state);state.hp=playerCombatStats().hp;selectedMap=99;selectedEnemy=4;
    const rerunEncounter=createMonsterEncounter(99,4),rerunBaseXp=expReward(rerunEncounter),rerunBaseGold=goldReward(rerunEncounter),rerunBaseStones=mainlineEnhancementStoneReward(rerunEncounter,100),rerunMultiplier=reincarnationOverlevelRewardMultiplier(100,rerunEncounter.level,state);
    Math.random=()=>.99;const rerunResult=fightOnce(99,4,rerunEncounter);Math.random=originalRandom;
    out.w1Rerun={enemyLevel:rerunEncounter.level,multiplier:rerunResult.overlevelRewardMultiplier,baseXp:rerunBaseXp,baseGold:rerunBaseGold,expectedXp:Math.ceil(rerunBaseXp*rerunMultiplier),expectedGold:Math.ceil(rerunBaseGold*rerunMultiplier),resultXp:rerunResult.xp,resultGold:rerunResult.gold,baseStones:rerunBaseStones,resultStones:rerunResult.enhancementStones,expectedAdvanced:Math.ceil((rerunBaseStones.advanced||0)*rerunMultiplier),saleStones:rerunResult.saleEnhancementStones};

    // W2 first-run preview is byte-for-byte equivalent in numeric outputs to existing reward owners.
    state=makeW2(0);const firstBoss=secondWorldBoss(99),firstW2Xp=secondWorldBossExpReward(99,false,state),firstW2Dm=secondWorldBossDarkMatterReward(99,false),firstW2Preview=secondWorldMainlineRewardPreview(99,{state});
    out.w2First={bossLevel:firstBoss.level,baseXp:firstW2Xp,baseDarkMatter:firstW2Dm,preview:firstW2Preview};

    // W2 rerun online uses the same shared multiplier and ceil rule; formal settlement books the multiplied dark energy atomically.
    state=makeW2(1);const w2Boss=secondWorldBoss(99),w2BaseXp=secondWorldBossExpReward(99,false,state),w2BaseDm=secondWorldBossDarkMatterReward(99,false),w2Multiplier=reincarnationOverlevelRewardMultiplier(state.level,w2Boss.level,state),w2Preview=secondWorldMainlineRewardPreview(99,{state});
    const dmBefore=state.secondWorld.darkMatter,deBefore=state.secondWorld.darkEnergy;
    Math.random=()=>.99;const w2Settlement=settleSecondWorldBossVictory(99,{ignoreUnlock:true,rng:()=>.99});Math.random=originalRandom;
    out.w2Rerun={multiplier:w2Multiplier,baseXp:w2BaseXp,baseDarkMatter:w2BaseDm,preview:w2Preview,settlement:{ok:w2Settlement.ok,xp:w2Settlement.xp,darkMatter:w2Settlement.darkMatter,darkEnergy:w2Settlement.darkEnergy,multiplier:w2Settlement.overlevelRewardMultiplier},delta:{darkMatter:state.secondWorld.darkMatter-dmBefore,darkEnergy:state.secondWorld.darkEnergy-deBefore}};

    // Equipment sale values must be independent of reincarnation overlevel rewards.
    const saleItem={world:2,level:500,q:5,type:'weapon',sell:123,buy:456};
    const saleFirst=equipmentSaleQuote(saleItem,{state:makeW2(0)}),saleRerun=equipmentSaleQuote(saleItem,{state:makeW2(1)});
    out.sale={first:saleFirst,rerun:saleRerun};

    // Batch6-3 W1 offline: recorded sample identity drives the same shared multiplier; first run remains exactly 1x.
    const offlineEnemy=monsterObj(99,3),offlineCount=10;
    const firstOfflineState=makeW1(0);firstOfflineState.level=100;state=firstOfflineState;Math.random=()=>.99;
    const firstOfflineContext={battles:offlineCount,map:99,enemy:3,playerLevel:100,enemyLevel:offlineEnemy.level,overlevelContextRecorded:true};
    const firstOfflineBaseXp=expReward(offlineEnemy),firstOfflineBaseGold=goldReward(offlineEnemy),firstOfflineExpectedStones=expectedMainlineEnhancementStoneReward(offlineEnemy,100);
    const firstOffline=await grantFirstWorldOfflineRewards(firstOfflineContext,offlineEnemy);
    out.offlineW1First={enemyLevel:offlineEnemy.level,multiplier:firstOffline.overlevelRewardMultiplier,totalXp:firstOffline.totalXp,directGold:firstOffline.directGold,battleBasic:firstOffline.enhancement.battleBasic,expectedXp:Math.floor(firstOfflineBaseXp*.10*offlineCount),expectedGold:Math.floor(firstOfflineBaseGold*.10*offlineCount),expectedBasic:Math.floor((Number(firstOfflineExpectedStones.basic)||0)*.05*offlineCount)};

    const rerunOfflineState=makeW1(1);rerunOfflineState.level=100;state=rerunOfflineState;
    const rerunOfflineContext={battles:offlineCount,map:99,enemy:3,playerLevel:100,enemyLevel:offlineEnemy.level,overlevelContextRecorded:true};
    const rerunOfflineMultiplier=reincarnationOverlevelRewardMultiplier(100,offlineEnemy.level,state),rerunOfflineBaseXp=expReward(offlineEnemy),rerunOfflineBaseGold=goldReward(offlineEnemy),rerunOfflineExpectedStones=expectedMainlineEnhancementStoneReward(offlineEnemy,100);
    const rerunOffline=await grantFirstWorldOfflineRewards(rerunOfflineContext,offlineEnemy);
    out.offlineW1Rerun={multiplier:rerunOffline.overlevelRewardMultiplier,sharedMultiplier:rerunOfflineMultiplier,totalXp:rerunOffline.totalXp,directGold:rerunOffline.directGold,battleBasic:rerunOffline.enhancement.battleBasic,expectedXp:Math.floor(applyReincarnationOverlevelIntegerReward(rerunOfflineBaseXp,100,offlineEnemy.level,state)*.10*offlineCount),expectedGold:Math.floor(applyReincarnationOverlevelIntegerReward(rerunOfflineBaseGold,100,offlineEnemy.level,state)*.10*offlineCount),expectedBasic:Math.floor((Number(rerunOfflineExpectedStones.basic)||0)*rerunOfflineMultiplier*.05*offlineCount)};

    // Batch6-3 W2 offline: first run unchanged, rerun shares 6-1 owner for EXP / dark matter / dark energy.
    const w2OfflineCount=20,w2OfflineBoss=secondWorldBoss(99);
    state=makeW2(0);Math.random=()=>.99;const firstW2OfflineBaseXp=secondWorldBossExpReward(99,false,state),firstW2OfflineBaseDm=secondWorldBossDarkMatterReward(99,false);
    const firstW2Offline=await grantSecondWorldOfflineRewards({battles:w2OfflineCount,bossIndex:99,playerLevel:500,enemyLevel:w2OfflineBoss.level,overlevelContextRecorded:true},w2OfflineBoss);
    out.offlineW2First={multiplier:firstW2Offline.overlevelRewardMultiplier,totalXp:firstW2Offline.totalXp,directDarkMatter:firstW2Offline.directDarkMatter,directDarkEnergy:firstW2Offline.directDarkEnergy,expectedXp:Math.floor(firstW2OfflineBaseXp*.10*w2OfflineCount),expectedDarkMatter:Math.floor(firstW2OfflineBaseDm*.10*w2OfflineCount),expectedDarkEnergy:Math.floor(w2OfflineCount*.05)};

    state=makeW2(1);Math.random=()=>.99;const rerunW2OfflineMultiplier=reincarnationOverlevelRewardMultiplier(500,w2OfflineBoss.level,state),rerunW2OfflineBaseXp=secondWorldBossExpReward(99,false,state),rerunW2OfflineBaseDm=secondWorldBossDarkMatterReward(99,false);
    const rerunW2Offline=await grantSecondWorldOfflineRewards({battles:w2OfflineCount,bossIndex:99,playerLevel:500,enemyLevel:w2OfflineBoss.level,overlevelContextRecorded:true},w2OfflineBoss);
    out.offlineW2Rerun={multiplier:rerunW2Offline.overlevelRewardMultiplier,sharedMultiplier:rerunW2OfflineMultiplier,totalXp:rerunW2Offline.totalXp,directDarkMatter:rerunW2Offline.directDarkMatter,directDarkEnergy:rerunW2Offline.directDarkEnergy,expectedXp:Math.floor(applyReincarnationOverlevelIntegerReward(rerunW2OfflineBaseXp,500,w2OfflineBoss.level,state)*.10*w2OfflineCount),expectedDarkMatter:Math.floor(applyReincarnationOverlevelIntegerReward(rerunW2OfflineBaseDm,500,w2OfflineBoss.level,state)*.10*w2OfflineCount),expectedDarkEnergy:Math.floor(applyReincarnationOverlevelIntegerReward(1,500,w2OfflineBoss.level,state)*.05*w2OfflineCount)};

    // Target identity survives sample -> farm target, while legacy pending without level identity stays on 1x for compatibility.
    state=makeW2(1);normalizeOfflineSaveState(state,{sourceVersion:17,currentTime:Date.now()});state.offline.battleSamples=[];
    appendOfflineBattleSample(state,{sampleVersion:OFFLINE_BATTLE_SAMPLE_VERSION,world:2,targetType:'boss',bossIndex:99,bossId:w2OfflineBoss.id,combatSpeed:1,actualMs:1000,cycleMs:1140,adjustedMs:1140,playerLevel:500,enemyLevel:w2OfflineBoss.level,kind:'boss',multiplier:1,recordedAt:Date.now()},{currentTime:Date.now()});
    state.settings.combatSpeed=1;const resolved=resolveOfflineFarmTarget();
    const legacyPending=normalizeOfflinePendingSettlement({sampleVersion:OFFLINE_BATTLE_SAMPLE_VERSION,world:2,targetType:'boss',bossIndex:99,bossId:w2OfflineBoss.id,combatSpeed:1,avgBattleMs:1140,elapsedRaw:60000,elapsedUsed:60000,battles:1,createdAt:Date.now()});
    const legacyContext=offlineOverlevelRewardContext(legacyPending,w2OfflineBoss.level);
    out.identity={resolved:{bossIndex:resolved?.bossIndex,playerLevel:resolved?.playerLevel,enemyLevel:resolved?.enemyLevel,recorded:resolved?.overlevelContextRecorded},legacy:{recorded:legacyPending?.overlevelContextRecorded,contextRecorded:legacyContext.recorded,multiplier:legacyContext.multiplier}};
   }finally{Math.random=originalRandom;state=originalState;selectedMap=originalSelected.map;selectedEnemy=originalSelected.enemy;}
   return out;
  });

  assert.deepEqual(pageErrors,[],'Browser pageerror:\n'+pageErrors.join('\n\n'));
  assert.deepEqual(report.owner,{firstGap400:1,rerunGap400:13,rerunEqual:1,rerunDown:1,ceil:2});
  assert.equal(report.w1First.resultXp,report.w1First.baseXp);assert.equal(report.w1First.resultGold,report.w1First.baseGold);assert.equal(report.w1First.multiplier,1);
  assert.equal(report.w1Rerun.enemyLevel,500);assert.equal(report.w1Rerun.multiplier,13);assert.equal(report.w1Rerun.resultXp,report.w1Rerun.expectedXp);assert.equal(report.w1Rerun.resultGold,report.w1Rerun.expectedGold);assert.equal(report.w1Rerun.resultStones.advanced,report.w1Rerun.expectedAdvanced);assert.deepEqual(report.w1Rerun.saleStones,{basic:0,advanced:0});
  assert.equal(report.w2First.preview.xp,report.w2First.baseXp);assert.equal(report.w2First.preview.darkMatter,report.w2First.baseDarkMatter);assert.equal(report.w2First.preview.darkEnergy,1);assert.equal(report.w2First.preview.overlevelRewardMultiplier,1);
  assert.equal(report.w2Rerun.multiplier,16);assert.equal(report.w2Rerun.preview.xp,Math.ceil(report.w2Rerun.baseXp*16));assert.equal(report.w2Rerun.preview.darkMatter,Math.ceil(report.w2Rerun.baseDarkMatter*16));assert.equal(report.w2Rerun.preview.darkEnergy,16);assert.equal(report.w2Rerun.settlement.ok,true);assert.equal(report.w2Rerun.settlement.xp,report.w2Rerun.preview.xp);assert.equal(report.w2Rerun.settlement.darkMatter,report.w2Rerun.preview.darkMatter);assert.equal(report.w2Rerun.settlement.darkEnergy,16);assert.deepEqual(report.w2Rerun.delta,{darkMatter:report.w2Rerun.preview.darkMatter,darkEnergy:16});
  assert.deepEqual(report.sale.first,report.sale.rerun);
  assert.equal(report.offlineW1First.multiplier,1);assert.equal(report.offlineW1First.totalXp,report.offlineW1First.expectedXp);assert.equal(report.offlineW1First.directGold,report.offlineW1First.expectedGold);assert.equal(report.offlineW1First.battleBasic,report.offlineW1First.expectedBasic);
  assert.equal(report.offlineW1Rerun.multiplier,report.offlineW1Rerun.sharedMultiplier);assert.equal(report.offlineW1Rerun.totalXp,report.offlineW1Rerun.expectedXp);assert.equal(report.offlineW1Rerun.directGold,report.offlineW1Rerun.expectedGold);assert.equal(report.offlineW1Rerun.battleBasic,report.offlineW1Rerun.expectedBasic);
  assert.equal(report.offlineW2First.multiplier,1);assert.equal(report.offlineW2First.totalXp,report.offlineW2First.expectedXp);assert.equal(report.offlineW2First.directDarkMatter,report.offlineW2First.expectedDarkMatter);assert.equal(report.offlineW2First.directDarkEnergy,report.offlineW2First.expectedDarkEnergy);
  assert.equal(report.offlineW2Rerun.multiplier,16);assert.equal(report.offlineW2Rerun.multiplier,report.offlineW2Rerun.sharedMultiplier);assert.equal(report.offlineW2Rerun.totalXp,report.offlineW2Rerun.expectedXp);assert.equal(report.offlineW2Rerun.directDarkMatter,report.offlineW2Rerun.expectedDarkMatter);assert.equal(report.offlineW2Rerun.directDarkEnergy,report.offlineW2Rerun.expectedDarkEnergy);
  assert.deepEqual(report.identity.resolved,{bossIndex:99,playerLevel:500,enemyLevel:1000,recorded:true});assert.equal(report.identity.legacy.recorded,false);assert.equal(report.identity.legacy.contextRecorded,false);assert.equal(report.identity.legacy.multiplier,1);
  console.log('Reincarnation overlevel Batch6-1/6-3 integrity passed:',JSON.stringify(report));
 }finally{await browser.close();}
})().catch(error=>{console.error(error?.stack||error);process.exit(1);});