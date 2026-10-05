const { chromium } = require('playwright');

(async()=>{
 const browser=await chromium.launch({headless:true});
 const page=await browser.newPage();
 const pageErrors=[];
 page.on('pageerror',error=>pageErrors.push(error.message));
 await page.goto('http://127.0.0.1:4173/index.html',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.THIRD_WORLD_REINCARNATION_RERUN_POLICY_VERSION===2&&window.THIRD_WORLD_REINCARNATION_RERUN_UI_PRESENTATION_VERSION===2&&window.THIRD_WORLD_REINCARNATION_WRAPPER_BOUNDARY_VERSION===1&&typeof window.thirdWorldReincarnationRerunContext==='function'&&typeof window.thirdWorldChallengeStatus==='function');
 const result=await page.evaluate(async()=>{
  function reincarnation(count){return {count,breakthrough:{permanent:0,milestoneLifeId:count,milestones:{}},alternateUniverse:{unlocked:true,deepestCleared:0,activeAttempt:null,lifeFailures:{lifeId:count,failures:{}}}};}
  function third(count){return {saveVersion:17,level:1000,exp:0,hp:1,reincarnation:reincarnation(count),secondWorld:{entered:true,mainline:{bossKilled:Array(100).fill(true)},civilizationLevel:10},thirdWorld:{entered:true,completed:false,entryVersion:1,dimensionalStrings:0,coreLevel:0,coreProgress:0,bosses:Array.from({length:10},()=>({currentHp:Number(window.THIRD_WORLD_BOSS_MAX_HP)})),story:{introSeen:false,unlockedStage:0,finalSeen:false}},storyProgress:{completedStories:[],pendingStory:null},dungeon:{}};}
  const originalState=state,max=Number(window.THIRD_WORLD_BOSS_MAX_HP),gap=Math.floor(max*.10);
  const out={version:window.THIRD_WORLD_REINCARNATION_RERUN_POLICY_VERSION,uiVersion:window.THIRD_WORLD_REINCARNATION_RERUN_UI_PRESENTATION_VERSION,wrapperBoundaryVersion:window.THIRD_WORLD_REINCARNATION_WRAPPER_BOUNDARY_VERSION,baseOwners:window.THIRD_WORLD_REINCARNATION_BASE_OWNERS||null};
  state=third(0);state.thirdWorld.bosses[0].currentHp=max-gap;
  const firstBefore=JSON.stringify(state.thirdWorld.bosses);
  out.firstRun={context:window.thirdWorldReincarnationRerunContext(state),status:window.thirdWorldChallengeStatus(0,state),snapshot:window.thirdWorldBossProgressSnapshot(0,state),unchanged:JSON.stringify(state.thirdWorld.bosses)===firstBefore,html:window.thirdWorldAdventurePageHtml()};
  state=third(1);state.thirdWorld.bosses[0].currentHp=max-gap;
  const rerunBefore=JSON.stringify(state.thirdWorld.bosses);
  out.rerun={context:window.thirdWorldReincarnationRerunContext(state),status:window.thirdWorldChallengeStatus(0,state),snapshot:window.thirdWorldBossProgressSnapshot(0,state),canChallenge:window.canChallengeThirdWorldBoss(0,state),unchanged:JSON.stringify(state.thirdWorld.bosses)===rerunBefore};
  const html=typeof window.thirdWorldAdventurePageHtml==='function'?window.thirdWorldAdventurePageHtml():'';
  out.ui={hasStructuredOwner:html.includes('data-third-world-rerun-presentation="1"'),hasRerunCopy:html.includes('轉生重征服：可集中攻略任一存活高維存在')||html.includes('轉生重征服：已解除 5% 戰線限制，可集中攻略此高維存在'),hasRerunRule:html.includes('轉生重征服不受 5% 戰線限制'),hasOldReadyCopy:html.includes('目前位於合法 5% 戰線內'),firstRunStructuredOwner:out.firstRun.html.includes('data-third-world-rerun-presentation="1"')};
  state=third(1);state.thirdWorld.bosses[0].currentHp=0;out.defeated=window.thirdWorldChallengeStatus(0,state);
  const progressSource=await (await fetch('thirdworldprogress.js')).text(),rerunSource=await (await fetch('reincarnationrerunworld3.js')).text();
  out.settlementContract={formalStartHp:progressSource.includes('formalStartHp'),combatEndHp:progressSource.includes('combatEndHp'),effectivePermanentDamage:progressSource.includes('effectivePermanentDamage'),staleGuard:progressSource.includes('currentHp!==formalStartHp'),challengeAfter:progressSource.includes('thirdWorldChallengeStatus')&&progressSource.includes('fivePointBlocked')};
  out.presentationContract={noReplaceAll:!rerunSource.includes('.replaceAll('),readsFivePointBypassed:rerunSource.includes('fivePointBypassed'),readsRerunContext:rerunSource.includes('ctx.active'),structuredCardSelection:rerunSource.includes('third-world-boss-card[data-third-world-boss]'),singleInstall:rerunSource.includes('THIRD_WORLD_REINCARNATION_RERUN_POLICY_VERSION)>=1'),boundary:rerunSource.includes('THIRD_WORLD_REINCARNATION_WRAPPER_BOUNDARY_VERSION')};
  await new Promise(resolve=>setTimeout(resolve,0));
  const storyApi=window.civilizationStoryProgress,descriptors=typeof window.thirdWorldStoryTriggerDescriptors==='function'?window.thirdWorldStoryTriggerDescriptors():[],firstStory=descriptors.find(row=>row?.storyId&&row?.kind!=='final')||descriptors[0]||null;
  if(firstStory?.storyId&&storyApi?.thirdWorldEligibility){state=third(1);state.storyProgress.completedStories=[firstStory.storyId];const eligibility=storyApi.thirdWorldEligibility(state),row=eligibility?.rows?.find?.(item=>item.storyId===firstStory.storyId)||null;out.story={storyId:firstStory.storyId,completed:row?.completed===true,eligible:row?.eligible===true};}else out.story={storyId:null,completed:null,eligible:null};
  state=originalState;return out;
 });
 const fail=(code,detail)=>{throw new Error(`${code}: ${JSON.stringify(detail)}`);};
 if(pageErrors.length)fail('PAGE_ERRORS',pageErrors);
 if(result.version!==2||result.uiVersion!==2||result.wrapperBoundaryVersion!==1||!result.baseOwners)fail('VERSION_OR_BOUNDARY',{version:result.version,uiVersion:result.uiVersion,wrapperBoundaryVersion:result.wrapperBoundaryVersion,baseOwners:!!result.baseOwners});
 if(result.firstRun.context.active!==false||result.firstRun.status?.allowed!==false||result.firstRun.status?.reason!=='five-point-front'||result.firstRun.snapshot?.challengeAllowed!==false||result.firstRun.unchanged!==true)fail('FIRST_RUN_5PP_CHANGED',result.firstRun);
 if(result.rerun.context.active!==true||result.rerun.status?.allowed!==true||result.rerun.status?.reason!=='reincarnation-rerun'||result.rerun.status?.fivePointBypassed!==true||result.rerun.snapshot?.challengeAllowed!==true||result.rerun.canChallenge!==true||result.rerun.unchanged!==true)fail('RERUN_5PP_NOT_BYPASSED',result.rerun);
 if(result.ui.hasStructuredOwner!==true||result.ui.hasRerunCopy!==true||result.ui.hasRerunRule!==true||result.ui.hasOldReadyCopy!==false||result.ui.firstRunStructuredOwner!==false)fail('RERUN_UI_COPY',result.ui);
 if(Object.values(result.presentationContract).some(v=>v!==true))fail('RERUN_PRESENTATION_CONTRACT',result.presentationContract);
 if(result.defeated?.allowed!==false||result.defeated?.reason!=='defeated')fail('DEFEATED_GATE_CHANGED',result.defeated);
 if(Object.values(result.settlementContract).some(v=>v!==true))fail('W3_SETTLEMENT_CONTRACT_CHANGED',result.settlementContract);
 if(result.story.storyId&&!(result.story.completed===true&&result.story.eligible===false))fail('STORY_HISTORY_REQUEUED',result.story);
 console.log('Reincarnation World 3 rerun V2 integrity passed.');
 await browser.close();
})().catch(error=>{console.error(error);process.exit(1);});