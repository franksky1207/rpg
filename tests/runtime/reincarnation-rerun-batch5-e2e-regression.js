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
  await page.waitForFunction(()=>window.FIRST_WORLD_REINCARNATION_TARGET_CONTEXT_VERSION===1&&window.SECOND_WORLD_REINCARNATION_REGION_OWNER_SPLIT_VERSION===1&&window.THIRD_WORLD_REINCARNATION_RERUN_UI_PRESENTATION_VERSION>=2&&typeof window.applyReincarnationResetState==='function'&&typeof window.normalizeReincarnationState==='function'&&typeof window.settleSecondWorldBossVictory==='function'&&window.SECOND_WORLD_COMBAT_SETTLEMENT_READY===true,{timeout:30000});
  const report=await page.evaluate(()=>{
   const clone=v=>JSON.parse(JSON.stringify(v));
   const milestones=()=>Object.fromEntries((window.BREAKTHROUGH_MILESTONES||window.BREAKTHROUGH_MILESTONE_LEVELS||[100,200,300,400,500,600,700,800,900,1000]).map(level=>[String(level),false]));
   const reincarnation=count=>({count,breakthrough:{permanent:0,milestoneLifeId:count,milestones:milestones()},alternateUniverse:{unlocked:false,deepestCleared:0,activeAttempt:null,lifeFailures:{lifeId:count,failures:{}}}});
   const makeW1=count=>{const s=newState();s.saveVersion=17;s.reincarnation=reincarnation(count);s.secondWorld=createBlankSecondWorldState();s.thirdWorld=createBlankThirdWorldState();return s;};
   const makeW2=count=>{const s=makeW1(count);s.level=1000;s.secondWorld=createBlankSecondWorldState();s.secondWorld.entered=true;s.thirdWorld=createBlankThirdWorldState();return s;};
   const makeW3=count=>{const s=makeW2(count);s.thirdWorld=createBlankThirdWorldState();s.thirdWorld.entered=true;return s;};
   const overpowerEquipment=s=>{Object.values(s.equipment||{}).filter(Boolean).forEach(item=>{item.atk=Math.max(0,Number(item.atk)||0)+1000000000;item.def=Math.max(0,Number(item.def)||0)+1000000000;item.hp=Math.max(0,Number(item.hp)||0)+1000000000;});};
   const originalState=state,originalRandom=Math.random;
   const originalSelected={map:selectedMap,enemy:selectedEnemy,battleCount:typeof selectedBattleCount==='undefined'?null:selectedBattleCount,screen:typeof adventureScreen==='undefined'?null:adventureScreen};
   const out={};
   try{
    // W1: real rerun selection -> prepare -> encounter -> combat/settlement -> actual boss flag -> downward calamity eligibility.
    state=makeW1(1);state.level=500;overpowerEquipment(state);state.hp=playerCombatStats().hp;
    const w1Opened=openReincarnationRerunWorld1Map(99);if(typeof selectEnemy==='function')selectEnemy(4);else selectedEnemy=4;
    const w1Target=firstWorldReincarnationTargetContext(state),w1StateBeforePrepare=JSON.stringify(state),w1Prepare=adventurePreparePage(),w1StateAfterPrepare=JSON.stringify(state);
    const w1Encounter=(typeof getPreviewEncounter==='function'?getPreviewEncounter(selectedMap,selectedEnemy):null)||createMonsterEncounter(selectedMap,selectedEnemy);
    Math.random=()=>.99;
    const w1Combat=fightOnce(selectedMap,selectedEnemy,w1Encounter);
    Math.random=originalRandom;
    const w1Calamities=getCivilizationCalamityDefinitions(),w1LastCalamity=w1Calamities[w1Calamities.length-1];
    out.w1={opened:w1Opened,target:w1Target,prepareHas500:w1Prepare.includes('Lv.500'),stateStableAcrossPrepare:w1StateBeforePrepare===w1StateAfterPrepare,encounter:{level:w1Encounter?.level,kind:w1Encounter?.kind,name:w1Encounter?.name},combat:{ok:w1Combat?.ok,win:w1Combat?.win,level:w1Combat?.e?.level,kind:w1Combat?.e?.kind},selected:{map:selectedMap,enemy:selectedEnemy},actualKills:state.bossKilled.filter(Boolean).length,lastBossKilled:state.bossKilled[99]===true,lowerKeyFake:state.bossKilled[9]===true,coverage:firstWorldRerunKeyBossCoverage(state),lastCalamityUnlocked:isCivilizationCalamityUnlocked(w1LastCalamity?.id,state),unlockedMap:state.unlockedMap};

    // W2: direct Boss index remains identical through formal combat and settlement; one real final-key kill derives coverage downward without fake flags.
    state=makeW2(1);state.secondWorld.civilizationLevel=10;
    const w2Boss=secondWorldBoss(99),w2Encounter=secondWorldBossEncounter(99,{traits:[]}),w2Player={hp:1000000000000,atk:1000000000000,def:1000000000000,crit:0,dodge:0};
    const w2Combat=runSecondWorldBossCombat(99,{state,player:w2Player,startHp:w2Player.hp,encounter:w2Encounter,logs:false,preparePresentation:false,rng:()=>.99});
    const w2Settlement=w2Combat?.win===true?settleSecondWorldBossVictory(99,{rng:()=>.99}):{ok:false,reason:'combat-not-won'};
    const w2FirstCalamity=getSecondWorldCalamityUnlockStatus(0,state),w2LastCalamity=getSecondWorldCalamityUnlockStatus(9,state);
    out.w2={boss:{index:w2Boss?.index,id:w2Boss?.id,level:w2Boss?.level},encounter:{id:w2Encounter?.id,level:w2Encounter?.level},combat:{ok:w2Combat?.ok,win:w2Combat?.win,bossIndex:w2Combat?.bossIndex,id:w2Combat?.e?.id,level:w2Combat?.e?.level},settlement:{ok:w2Settlement?.ok,bossIndex:w2Settlement?.bossIndex,firstKill:w2Settlement?.firstKill},actualKills:state.secondWorld.mainline.bossKilled.filter(Boolean).length,lastBossKilled:state.secondWorld.mainline.bossKilled[99]===true,lowerKeyFake:state.secondWorld.mainline.bossKilled[9]===true,coverage:secondWorldRerunKeyBossCoverage(state),firstCalamity:{visible:w2FirstCalamity?.visible,challengeable:w2FirstCalamity?.challengeable},lastCalamity:{visible:w2LastCalamity?.visible,challengeable:w2LastCalamity?.challengeable,coverage:w2LastCalamity?.rerunCoverage}};

    // W3: rerun bypass is narrow. five-point-front may be bypassed, defeated/invalid/world-locked remain blocked.
    const maxHp=Number(THIRD_WORLD_BOSS_MAX_HP);
    state=makeW3(1);state.thirdWorld.bosses.forEach(row=>row.currentHp=maxHp);state.thirdWorld.bosses[0].currentHp=Math.floor(maxHp*.80);
    const w3FivePoint=thirdWorldChallengeStatus(0,state);
    state.thirdWorld.bosses[0].currentHp=0;
    const w3Defeated=thirdWorldChallengeStatus(0,state),w3Invalid=thirdWorldChallengeStatus(-1,state);
    const w3WorldLocked=makeW2(1);w3WorldLocked.thirdWorld=createBlankThirdWorldState();w3WorldLocked.thirdWorld.entered=false;
    const w3Locked=thirdWorldChallengeStatus(0,w3WorldLocked);
    out.w3={fivePoint:w3FivePoint,defeated:w3Defeated,invalid:w3Invalid,worldLocked:w3Locked};

    // First-run isolation across all three worlds.
    state=makeW1(0);const firstW1={lastBoss:canBoss(99),lastEnemy:enemyUnlocked(99,4),rerunUi:adventureMapPage().includes('data-rerun-world1="1"')};
    state=makeW2(0);const firstW2={boss99:canChallengeSecondWorldBoss(99,state),rerunActive:isSecondWorldReincarnationRerun(state)};
    state=makeW3(0);state.thirdWorld.bosses.forEach(row=>row.currentHp=maxHp);state.thirdWorld.bosses[0].currentHp=Math.floor(maxHp*.80);const firstW3=thirdWorldChallengeStatus(0,state);
    out.firstRun={w1:firstW1,w2:firstW2,w3:firstW3};

    // Legacy normalization must not resurrect rerun state before Schema17.
    const legacy={saveVersion:16,reincarnation:{count:9,breakthrough:{permanent:99,milestoneLifeId:9,milestones:{100:true}},alternateUniverse:{unlocked:true,deepestCleared:999}}};
    normalizeReincarnationState(legacy);
    out.legacy={count:legacy.reincarnation?.count,permanent:legacy.reincarnation?.breakthrough?.permanent,auUnlocked:legacy.reincarnation?.alternateUniverse?.unlocked,deepest:legacy.reincarnation?.alternateUniverse?.deepestCleared,rerun:isReincarnationRun(legacy)};

    // Reincarnation reset closes current-life progression while preserving Story history.
    const resetProbe=makeW3(1);resetProbe.storyProgress={...(resetProbe.storyProgress||{}),completedStories:['batch5-e2e-story']};resetProbe.bossKilled[99]=true;resetProbe.secondWorld.mainline.bossKilled[99]=true;resetProbe.thirdWorld.bosses[0].currentHp=Math.floor(maxHp*.42);
    const resetResult=applyReincarnationResetState(resetProbe,{requireEligible:false,currentTime:987654});
    out.reset={ok:resetResult?.ok===true,count:resetProbe.reincarnation.count,w1Kills:resetProbe.bossKilled.filter(Boolean).length,w2Entered:resetProbe.secondWorld.entered,w2Kills:resetProbe.secondWorld.mainline.bossKilled.filter(Boolean).length,w3Entered:resetProbe.thirdWorld.entered,w3Fresh:resetProbe.thirdWorld.bosses.every(row=>Number(row.currentHp)===maxHp),storyPreserved:resetProbe.storyProgress.completedStories.includes('batch5-e2e-story')};

    // Speed UI / Minimal Mode / Fast Catch-up closure.
    const speedFirst=makeW1(0),speedRerun=makeW1(1);speedRerun.settings.combatSpeed=1.5;
    const firstSpeedOptions=playerCombatSpeedOptions(speedFirst),rerunSpeedOptions=playerCombatSpeedOptions(speedRerun),firstBadge=combatSpeedBadgeHtml({target:speedFirst,speed:1}),rerunBadge=combatSpeedBadgeHtml({target:speedRerun,speed:1.5});
    out.runtime={firstSpeedOptions,rerunSpeedOptions,firstBadgeHidden:firstBadge==='',rerunBadge15:rerunBadge.includes('1.5×')&&rerunBadge.includes('data-combat-speed-badge="1"'),minimalShared:Number(window.MINIMAL_MODE_SHARED_API_VERSION)||0,w2MinimalPassed:window.SECOND_WORLD_MAINLINE_MINIMAL_MODE_INTEGRITY?.passed===true,w3MinimalAdapter:Number(window.THIRD_WORLD_PLAYER_FLOW_MINIMAL_MODE_ADAPTER_VERSION)||0,fastCatchUp:{background:Number(window.BACKGROUND_PROGRESS_FAST_CATCH_UP_POLICY_VERSION)||0,w1:Number(window.MAIN_BATTLE_FAST_CATCH_UP_POLICY_VERSION)||0,w2:Number(window.SECOND_WORLD_FAST_CATCH_UP_POLICY_VERSION)||0,w3:Number(window.THIRD_WORLD_RUN_FAST_CATCH_UP_VERSION)||0}};
   }finally{
    Math.random=originalRandom;
    state=originalState;
    selectedMap=originalSelected.map;selectedEnemy=originalSelected.enemy;
    if(originalSelected.battleCount!==null)selectedBattleCount=originalSelected.battleCount;
    if(originalSelected.screen!==null)adventureScreen=originalSelected.screen;
   }
   return out;
  });

  assert.deepEqual(pageErrors,[],'Browser pageerror:\n'+pageErrors.join('\n\n'));
  assert.equal(report.w1.opened,true);assert.equal(report.w1.target.authorized,true);assert.equal(report.w1.target.mapIndex,99);assert.equal(report.w1.target.enemyIndex,4);assert.equal(report.w1.prepareHas500,true);assert.equal(report.w1.stateStableAcrossPrepare,true);assert.equal(report.w1.encounter.level,500);assert.equal(report.w1.encounter.kind,'boss');assert.equal(report.w1.combat.ok,true);assert.equal(report.w1.combat.win,true);assert.equal(report.w1.combat.level,500);assert.equal(report.w1.combat.kind,'boss');assert.deepEqual(report.w1.selected,{map:99,enemy:4});assert.equal(report.w1.actualKills,1);assert.equal(report.w1.lastBossKilled,true);assert.equal(report.w1.lowerKeyFake,false);assert.equal(report.w1.coverage,10);assert.equal(report.w1.lastCalamityUnlocked,true);assert.equal(report.w1.unlockedMap,0);
  assert.deepEqual(report.w2.boss,{index:99,id:report.w2.encounter.id,level:1000});assert.equal(report.w2.encounter.level,1000);assert.equal(report.w2.combat.ok,true);assert.equal(report.w2.combat.win,true);assert.equal(report.w2.combat.bossIndex,99);assert.equal(report.w2.combat.id,report.w2.boss.id);assert.equal(report.w2.combat.level,1000);assert.equal(report.w2.settlement.ok,true);assert.equal(report.w2.settlement.bossIndex,99);assert.equal(report.w2.settlement.firstKill,true);assert.equal(report.w2.actualKills,1);assert.equal(report.w2.lastBossKilled,true);assert.equal(report.w2.lowerKeyFake,false);assert.equal(report.w2.coverage,10);assert.deepEqual(report.w2.firstCalamity,{visible:true,challengeable:true});assert.deepEqual(report.w2.lastCalamity,{visible:true,challengeable:true,coverage:10});
  assert.equal(report.w3.fivePoint.allowed,true);assert.equal(report.w3.fivePoint.reason,'reincarnation-rerun');assert.equal(report.w3.fivePoint.fivePointBypassed,true);assert.equal(report.w3.defeated.allowed,false);assert.equal(report.w3.defeated.reason,'defeated');assert.equal(report.w3.invalid.allowed,false);assert.equal(report.w3.invalid.reason,'invalid');assert.equal(report.w3.worldLocked.allowed,false);assert.equal(report.w3.worldLocked.reason,'world-locked');
  assert.deepEqual(report.firstRun.w1,{lastBoss:false,lastEnemy:false,rerunUi:false});assert.deepEqual(report.firstRun.w2,{boss99:false,rerunActive:false});assert.equal(report.firstRun.w3.allowed,false);assert.equal(report.firstRun.w3.reason,'five-point-front');
  assert.deepEqual(report.legacy,{count:0,permanent:0,auUnlocked:false,deepest:0,rerun:false});
  assert.deepEqual(report.reset,{ok:true,count:2,w1Kills:0,w2Entered:false,w2Kills:0,w3Entered:false,w3Fresh:true,storyPreserved:true});
  assert.deepEqual(report.runtime.firstSpeedOptions,[1]);assert.deepEqual(report.runtime.rerunSpeedOptions,[1,1.5]);assert.equal(report.runtime.firstBadgeHidden,true);assert.equal(report.runtime.rerunBadge15,true);assert.equal(report.runtime.minimalShared,1);assert.equal(report.runtime.w2MinimalPassed,true);assert.ok(report.runtime.w3MinimalAdapter>=1);assert.deepEqual(report.runtime.fastCatchUp,{background:1,w1:1,w2:1,w3:1});
  console.log('Reincarnation rerun Batch5 end-to-end regression passed:',JSON.stringify(report));
 }finally{await browser.close();}
})().catch(error=>{console.error(error?.stack||error);process.exit(1);});
