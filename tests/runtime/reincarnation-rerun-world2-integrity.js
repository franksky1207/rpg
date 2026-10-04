const { chromium } = require('playwright');

(async()=>{
 const browser=await chromium.launch({headless:true});
 const page=await browser.newPage();
 const pageErrors=[];
 page.on('pageerror',error=>pageErrors.push(error.message));
 await page.goto('http://127.0.0.1:4173/index.html',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.SECOND_WORLD_REINCARNATION_RERUN_POLICY_VERSION===1&&window.SECOND_WORLD_REINCARNATION_REGION_OWNER_SPLIT_VERSION===1&&typeof window.secondWorldRerunKeyBossCoverage==='function'&&typeof window.secondWorldAdventureRegionVisible==='function'&&typeof window.secondWorldArenaRegionEligible==='function'&&typeof window.getSecondWorldArenaRegionCap==='function');
 const result=await page.evaluate(()=>{
  function reincarnation(count){return {count,breakthrough:{permanent:0,milestoneLifeId:count,milestones:{}},alternateUniverse:{unlocked:false,deepestCleared:0,activeAttempt:null,lifeFailures:{lifeId:count,failures:{}}}};}
  function blankSecondWorld(count){
   return {saveVersion:17,level:500,exp:0,hp:1,gold:0,reincarnation:reincarnation(count),secondWorld:{entered:true,mainline:{bossKilled:Array(100).fill(false)},darkMatter:0,darkEnergy:0,civilizationLevel:0,calamities:Array.from({length:10},()=>({currentHp:null,trueKills:0}))},thirdWorld:{entered:false},dungeon:{arenaByWorld:{1:{highestArenaUnlocked:1},2:{highestArenaUnlocked:1}}}};
  }
  const originalState=state;
  const out={version:window.SECOND_WORLD_REINCARNATION_RERUN_POLICY_VERSION,regionOwnerSplitVersion:window.SECOND_WORLD_REINCARNATION_REGION_OWNER_SPLIT_VERSION,keyBossIndexes:Array.from(window.SECOND_WORLD_REINCARNATION_KEY_BOSSES||[])};

  state=blankSecondWorld(0);
  out.firstRun={context:window.secondWorldReincarnationRerunContext(state),boss0:window.canChallengeSecondWorldBoss(0,state),boss99:window.canChallengeSecondWorldBoss(99,state),legacyRegion0:window.secondWorldRegionVisible(0,state),legacyRegion9:window.secondWorldRegionVisible(9,state),adventureRegion0:window.secondWorldAdventureRegionVisible(0,state),adventureRegion9:window.secondWorldAdventureRegionVisible(9,state),arenaRegion0:window.secondWorldArenaRegionEligible(0,state),arenaRegion9:window.secondWorldArenaRegionEligible(9,state),arenaCap:window.getSecondWorldArenaRegionCap(state),calamity0:window.getSecondWorldCalamityUnlockStatus(0,state)};

  state=blankSecondWorld(1);
  const legacyOwnerBefore=window.secondWorldRegionVisible,adventureOwnerBefore=window.secondWorldAdventureRegionVisible,arenaOwnerBefore=window.secondWorldArenaRegionEligible,formalBefore=JSON.stringify(state);
  const html=window.secondWorldAdventurePageHtml();
  const formalAfter=JSON.stringify(state);
  const boss99=typeof window.secondWorldBoss==='function'?window.secondWorldBoss(99):null;
  const encounter99=typeof window.secondWorldBossEncounter==='function'?window.secondWorldBossEncounter(99):null;
  out.rerunBlank={context:window.secondWorldReincarnationRerunContext(state),allChallengeable:Array.from({length:100},(_,i)=>window.canChallengeSecondWorldBoss(i,state)).every(Boolean),allVisible:Array.from({length:100},(_,i)=>window.secondWorldBossVisible(i,state)).every(Boolean),adventureRegions:Array.from({length:10},(_,i)=>window.secondWorldAdventureRegionVisible(i,state)),legacyRegions:Array.from({length:10},(_,i)=>window.secondWorldRegionVisible(i,state)),arenaRegions:Array.from({length:10},(_,i)=>window.secondWorldArenaRegionEligible(i,state)),regionSections:(html.match(/class="world-region universe-region/g)||[]).length,regionCap:window.getSecondWorldArenaRegionCap(state),ownerIdentityStable:window.secondWorldRegionVisible===legacyOwnerBefore&&window.secondWorldAdventureRegionVisible===adventureOwnerBefore&&window.secondWorldArenaRegionEligible===arenaOwnerBefore,formalStateUnchanged:formalBefore===formalAfter,bossKilledCount:state.secondWorld.mainline.bossKilled.filter(Boolean).length,target99:{bossIndex:Number(boss99?.index),bossLevel:Number(boss99?.level),bossName:String(boss99?.name||''),encounterLevel:Number(encounter99?.level),encounterName:String(encounter99?.name||'')}};

  state=blankSecondWorld(1);state.secondWorld.mainline.bossKilled[59]=true;
  const calamityVisible6=Array.from({length:10},(_,i)=>window.isSecondWorldCalamityVisible(i,state));
  const calamityChallenge0=Array.from({length:10},(_,i)=>window.canChallengeSecondWorldCalamity(i,state));
  out.coverage6={coverage:window.secondWorldRerunKeyBossCoverage(state),adventureRegions:Array.from({length:10},(_,i)=>window.secondWorldAdventureRegionVisible(i,state)),legacyRegions:Array.from({length:10},(_,i)=>window.secondWorldRegionVisible(i,state)),arenaRegions:Array.from({length:10},(_,i)=>window.secondWorldArenaRegionEligible(i,state)),arenaCap:window.getSecondWorldArenaRegionCap(state),calamityVisible:calamityVisible6,calamityChallengeAtCiv0:calamityChallenge0,bossKilledCount:state.secondWorld.mainline.bossKilled.filter(Boolean).length,keyKilled:state.secondWorld.mainline.bossKilled[59]};
  state.secondWorld.civilizationLevel=5;
  out.coverage6.calamityChallengeAtCiv5=Array.from({length:10},(_,i)=>window.canChallengeSecondWorldCalamity(i,state));
  out.coverage6.calamityStatus5=window.getSecondWorldCalamityStatus(5,state);

  state=blankSecondWorld(1);state.secondWorld.mainline.bossKilled[99]=true;
  out.coverage10={coverage:window.secondWorldRerunKeyBossCoverage(state),adventureRegions:Array.from({length:10},(_,i)=>window.secondWorldAdventureRegionVisible(i,state)),legacyRegions:Array.from({length:10},(_,i)=>window.secondWorldRegionVisible(i,state)),arenaRegions:Array.from({length:10},(_,i)=>window.secondWorldArenaRegionEligible(i,state)),arenaCap:window.getSecondWorldArenaRegionCap(state),calamityVisible:Array.from({length:10},(_,i)=>window.isSecondWorldCalamityVisible(i,state)),calamityChallengeAtCiv0:Array.from({length:10},(_,i)=>window.canChallengeSecondWorldCalamity(i,state)),bossKilledCount:state.secondWorld.mainline.bossKilled.filter(Boolean).length,keyKilled:state.secondWorld.mainline.bossKilled[99]};

  state=originalState;
  return out;
 });
 const fail=(code,detail)=>{throw new Error(`${code}: ${JSON.stringify(detail)}`);};
 if(pageErrors.length)fail('PAGE_ERRORS',pageErrors);
 if(result.version!==1||result.regionOwnerSplitVersion!==1)fail('VERSION',{version:result.version,regionOwnerSplitVersion:result.regionOwnerSplitVersion});
 if(JSON.stringify(result.keyBossIndexes)!==JSON.stringify([9,19,29,39,49,59,69,79,89,99]))fail('KEY_BOSS_INDEXES',result.keyBossIndexes);
 if(result.firstRun.context.active!==false||result.firstRun.boss0!==true||result.firstRun.boss99!==false)fail('FIRST_RUN_GATE_CHANGED',result.firstRun);
 if(result.firstRun.legacyRegion0!==result.firstRun.adventureRegion0||result.firstRun.legacyRegion9!==result.firstRun.adventureRegion9||result.firstRun.arenaRegion0!==result.firstRun.adventureRegion0||result.firstRun.arenaRegion9!==result.firstRun.adventureRegion9||result.firstRun.arenaCap!==1)fail('FIRST_RUN_REGION_SEMANTICS_CHANGED',result.firstRun);
 if(result.rerunBlank.context.active!==true||result.rerunBlank.allChallengeable!==true||result.rerunBlank.allVisible!==true)fail('RERUN_DIRECT_CHALLENGE',result.rerunBlank);
 if(result.rerunBlank.regionSections!==10||result.rerunBlank.adventureRegions.some(v=>v!==true)||result.rerunBlank.legacyRegions.some(v=>v!==true))fail('RERUN_ALL_REGIONS_UI',result.rerunBlank);
 if(result.rerunBlank.arenaRegions[0]!==true||result.rerunBlank.arenaRegions.slice(1).some(v=>v!==false)||result.rerunBlank.regionCap!==1)fail('RERUN_ARENA_BLANK_COVERAGE',result.rerunBlank);
 if(result.rerunBlank.ownerIdentityStable!==true||result.rerunBlank.formalStateUnchanged!==true)fail('RERUN_ADVENTURE_RENDER_OWNER_MUTATION',result.rerunBlank);
 if(result.rerunBlank.bossKilledCount!==0)fail('RERUN_FAKE_PROGRESS_BLANK',result.rerunBlank);
 if(result.rerunBlank.target99.bossIndex!==99||result.rerunBlank.target99.bossLevel!==1000||result.rerunBlank.target99.encounterLevel!==1000||result.rerunBlank.target99.bossName!==result.rerunBlank.target99.encounterName)fail('RERUN_TARGET_IDENTITY_99',result.rerunBlank.target99);
 if(result.coverage6.coverage!==6||result.coverage6.arenaCap!==6)fail('KEY_BOSS_COVERAGE_6',result.coverage6);
 if(result.coverage6.adventureRegions.some(v=>v!==true)||result.coverage6.legacyRegions.some(v=>v!==true))fail('ADVENTURE_REGION_COVERAGE_6',result.coverage6);
 if(result.coverage6.arenaRegions.slice(0,6).some(v=>v!==true)||result.coverage6.arenaRegions.slice(6).some(v=>v!==false))fail('ARENA_REGION_COVERAGE_6',result.coverage6.arenaRegions);
 if(result.coverage6.calamityVisible.slice(0,6).some(value=>value!==true)||result.coverage6.calamityVisible.slice(6).some(value=>value!==false))fail('CALAMITY_VISIBLE_COVERAGE_6',result.coverage6.calamityVisible);
 if(result.coverage6.calamityChallengeAtCiv0[0]!==true||result.coverage6.calamityChallengeAtCiv0.slice(1).some(value=>value!==false))fail('CALAMITY_CHAIN_CIV0',result.coverage6.calamityChallengeAtCiv0);
 if(result.coverage6.calamityChallengeAtCiv5.slice(0,6).some(value=>value!==true)||result.coverage6.calamityChallengeAtCiv5.slice(6).some(value=>value!==false))fail('CALAMITY_CHAIN_CIV5',result.coverage6.calamityChallengeAtCiv5);
 if(result.coverage6.calamityStatus5?.unlock?.rerunCoverage!==6||result.coverage6.calamityStatus5?.challengeable!==true)fail('CALAMITY_STATUS_OWNER',result.coverage6.calamityStatus5);
 if(result.coverage6.bossKilledCount!==1||result.coverage6.keyKilled!==true)fail('KEY_BOSS_NO_FAKE_HISTORY_6',result.coverage6);
 if(result.coverage10.coverage!==10||result.coverage10.arenaCap!==10||result.coverage10.adventureRegions.some(v=>v!==true)||result.coverage10.legacyRegions.some(v=>v!==true)||result.coverage10.arenaRegions.some(v=>v!==true)||result.coverage10.calamityVisible.some(v=>v!==true))fail('KEY_BOSS_COVERAGE_10',result.coverage10);
 if(result.coverage10.calamityChallengeAtCiv0[0]!==true||result.coverage10.calamityChallengeAtCiv0.slice(1).some(v=>v!==false))fail('CALAMITY_CHAIN_PRESERVED_10',result.coverage10.calamityChallengeAtCiv0);
 if(result.coverage10.bossKilledCount!==1||result.coverage10.keyKilled!==true)fail('KEY_BOSS_NO_FAKE_HISTORY_10',result.coverage10);
 console.log('Reincarnation World 2 rerun integrity passed.');
 await browser.close();
})().catch(error=>{console.error(error);process.exit(1);});
