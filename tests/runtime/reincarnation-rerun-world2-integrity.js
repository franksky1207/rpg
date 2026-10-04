const { chromium } = require('playwright');

(async()=>{
 const browser=await chromium.launch({headless:true});
 const page=await browser.newPage();
 const pageErrors=[];
 page.on('pageerror',error=>pageErrors.push(error.message));
 await page.goto('http://127.0.0.1:4173/index.html',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.SECOND_WORLD_REINCARNATION_RERUN_POLICY_VERSION===1&&typeof window.secondWorldRerunKeyBossCoverage==='function'&&typeof window.getSecondWorldArenaRegionCap==='function');
 const result=await page.evaluate(()=>{
  function reincarnation(count){return {count,breakthrough:{permanent:0,milestoneLifeId:count,milestones:{}},alternateUniverse:{unlocked:false,deepestCleared:0,activeAttempt:null,lifeFailures:{lifeId:count,failures:{}}}};}
  function blankSecondWorld(count){
   return {saveVersion:17,level:500,exp:0,hp:1,gold:0,reincarnation:reincarnation(count),secondWorld:{entered:true,mainline:{bossKilled:Array(100).fill(false)},darkMatter:0,darkEnergy:0,civilizationLevel:0,calamities:Array.from({length:10},()=>({currentHp:null,trueKills:0}))},thirdWorld:{entered:false},dungeon:{arenaByWorld:{1:{highestArenaUnlocked:1},2:{highestArenaUnlocked:1}}}};
  }
  const originalState=state;
  const out={version:window.SECOND_WORLD_REINCARNATION_RERUN_POLICY_VERSION,keyBossIndexes:Array.from(window.SECOND_WORLD_REINCARNATION_KEY_BOSSES||[])};

  state=blankSecondWorld(0);
  out.firstRun={context:window.secondWorldReincarnationRerunContext(state),boss0:window.canChallengeSecondWorldBoss(0,state),boss99:window.canChallengeSecondWorldBoss(99,state),region9:window.secondWorldRegionVisible(9,state),calamity0:window.getSecondWorldCalamityUnlockStatus(0,state)};

  state=blankSecondWorld(1);
  const html=window.secondWorldAdventurePageHtml();
  const boss99=typeof window.secondWorldBoss==='function'?window.secondWorldBoss(99):null;
  const encounter99=typeof window.secondWorldBossEncounter==='function'?window.secondWorldBossEncounter(99):null;
  out.rerunBlank={context:window.secondWorldReincarnationRerunContext(state),allChallengeable:Array.from({length:100},(_,i)=>window.canChallengeSecondWorldBoss(i,state)).every(Boolean),allVisible:Array.from({length:100},(_,i)=>window.secondWorldBossVisible(i,state)).every(Boolean),regionSections:(html.match(/class="world-region universe-region/g)||[]).length,regionCap:window.getSecondWorldArenaRegionCap(state),postRenderRegion9:window.secondWorldRegionVisible(9,state),bossKilledCount:state.secondWorld.mainline.bossKilled.filter(Boolean).length,target99:{bossIndex:Number(boss99?.index),bossLevel:Number(boss99?.level),bossName:String(boss99?.name||''),encounterLevel:Number(encounter99?.level),encounterName:String(encounter99?.name||'')}};

  state=blankSecondWorld(1);state.secondWorld.mainline.bossKilled[59]=true;
  const calamityVisible6=Array.from({length:10},(_,i)=>window.isSecondWorldCalamityVisible(i,state));
  const calamityChallenge0=Array.from({length:10},(_,i)=>window.canChallengeSecondWorldCalamity(i,state));
  out.coverage6={coverage:window.secondWorldRerunKeyBossCoverage(state),regionVisible:Array.from({length:10},(_,i)=>window.secondWorldRegionVisible(i,state)),arenaCap:window.getSecondWorldArenaRegionCap(state),calamityVisible:calamityVisible6,calamityChallengeAtCiv0:calamityChallenge0,bossKilledCount:state.secondWorld.mainline.bossKilled.filter(Boolean).length,keyKilled:state.secondWorld.mainline.bossKilled[59]};
  state.secondWorld.civilizationLevel=5;
  out.coverage6.calamityChallengeAtCiv5=Array.from({length:10},(_,i)=>window.canChallengeSecondWorldCalamity(i,state));
  out.coverage6.calamityStatus5=window.getSecondWorldCalamityStatus(5,state);

  state=blankSecondWorld(1);state.secondWorld.mainline.bossKilled[99]=true;
  out.coverage10={coverage:window.secondWorldRerunKeyBossCoverage(state),arenaCap:window.getSecondWorldArenaRegionCap(state),regionVisible:Array.from({length:10},(_,i)=>window.secondWorldRegionVisible(i,state)),calamityVisible:Array.from({length:10},(_,i)=>window.isSecondWorldCalamityVisible(i,state)),calamityChallengeAtCiv0:Array.from({length:10},(_,i)=>window.canChallengeSecondWorldCalamity(i,state)),bossKilledCount:state.secondWorld.mainline.bossKilled.filter(Boolean).length,keyKilled:state.secondWorld.mainline.bossKilled[99]};

  state=originalState;
  return out;
 });
 const fail=(code,detail)=>{throw new Error(`${code}: ${JSON.stringify(detail)}`);};
 if(pageErrors.length)fail('PAGE_ERRORS',pageErrors);
 if(result.version!==1)fail('VERSION',result.version);
 if(JSON.stringify(result.keyBossIndexes)!==JSON.stringify([9,19,29,39,49,59,69,79,89,99]))fail('KEY_BOSS_INDEXES',result.keyBossIndexes);
 if(result.firstRun.context.active!==false||result.firstRun.boss0!==true||result.firstRun.boss99!==false)fail('FIRST_RUN_GATE_CHANGED',result.firstRun);
 if(result.rerunBlank.context.active!==true||result.rerunBlank.allChallengeable!==true||result.rerunBlank.allVisible!==true)fail('RERUN_DIRECT_CHALLENGE',result.rerunBlank);
 if(result.rerunBlank.regionSections!==10)fail('RERUN_ALL_REGIONS_UI',result.rerunBlank);
 if(result.rerunBlank.regionCap!==1||result.rerunBlank.postRenderRegion9!==false)fail('RERUN_UI_ARENA_ISOLATION',result.rerunBlank);
 if(result.rerunBlank.bossKilledCount!==0)fail('RERUN_FAKE_PROGRESS_BLANK',result.rerunBlank);
 if(result.rerunBlank.target99.bossIndex!==99||result.rerunBlank.target99.bossLevel!==1000||result.rerunBlank.target99.encounterLevel!==1000||result.rerunBlank.target99.bossName!==result.rerunBlank.target99.encounterName)fail('RERUN_TARGET_IDENTITY_99',result.rerunBlank.target99);
 if(result.coverage6.coverage!==6||result.coverage6.arenaCap!==6)fail('KEY_BOSS_COVERAGE_6',result.coverage6);
 if(result.coverage6.regionVisible.slice(0,6).some(v=>v!==true)||result.coverage6.regionVisible.slice(6).some(v=>v!==false))fail('ARENA_REGION_COVERAGE_6',result.coverage6.regionVisible);
 if(result.coverage6.calamityVisible.slice(0,6).some(v=>v!==true)||result.coverage6.calamityVisible.slice(6).some(v=>v!==false))fail('CALAMITY_VISIBLE_COVERAGE_6',result.coverage6.calamityVisible);
 if(result.coverage6.calamityChallengeAtCiv0[0]!==true||result.coverage6.calamityChallengeAtCiv0.slice(1).some(v=>v!==false))fail('CALAMITY_CHAIN_CIV0',result.coverage6.calamityChallengeAtCiv0);
 if(result.coverage6.calamityChallengeAtCiv5.slice(0,6).some(v=>v!==true)||result.coverage6.calamityChallengeAtCiv5.slice(6).some(v=>v!==false))fail('CALAMITY_CHAIN_CIV5',result.coverage6.calamityChallengeAtCiv5);
 if(result.coverage6.calamityStatus5?.unlock?.rerunCoverage!==6||result.coverage6.calamityStatus5?.challengeable!==true)fail('CALAMITY_STATUS_OWNER',result.coverage6.calamityStatus5);
 if(result.coverage6.bossKilledCount!==1||result.coverage6.keyKilled!==true)fail('KEY_BOSS_NO_FAKE_HISTORY_6',result.coverage6);
 if(result.coverage10.coverage!==10||result.coverage10.arenaCap!==10||result.coverage10.regionVisible.some(v=>v!==true)||result.coverage10.calamityVisible.some(v=>v!==true))fail('KEY_BOSS_COVERAGE_10',result.coverage10);
 if(result.coverage10.calamityChallengeAtCiv0[0]!==true||result.coverage10.calamityChallengeAtCiv0.slice(1).some(v=>v!==false))fail('CALAMITY_CHAIN_PRESERVED_10',result.coverage10.calamityChallengeAtCiv0);
 if(result.coverage10.bossKilledCount!==1||result.coverage10.keyKilled!==true)fail('KEY_BOSS_NO_FAKE_HISTORY_10',result.coverage10);
 console.log('Reincarnation World 2 rerun integrity passed.');
 await browser.close();
})().catch(error=>{console.error(error);process.exit(1);});
