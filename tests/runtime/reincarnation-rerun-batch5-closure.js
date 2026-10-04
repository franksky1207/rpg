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
  await page.waitForFunction(()=>window.FIRST_WORLD_REINCARNATION_RERUN_POLICY_VERSION===1&&window.SECOND_WORLD_REINCARNATION_RERUN_POLICY_VERSION===1&&window.THIRD_WORLD_REINCARNATION_RERUN_POLICY_VERSION===1&&typeof window.applyReincarnationResetState==='function'&&window.SECOND_WORLD_MAINLINE_MINIMAL_MODE_INTEGRITY?.passed===true&&window.THIRD_WORLD_PLAYER_FLOW_MINIMAL_MODE_ADAPTER_VERSION>=1,{timeout:30000});
  const report=await page.evaluate(()=>{
   const clone=v=>JSON.parse(JSON.stringify(v));
   const reincarnation=count=>({count,breakthrough:{permanent:0,milestoneLifeId:count,milestones:Object.fromEntries((window.BREAKTHROUGH_MILESTONES||window.BREAKTHROUGH_MILESTONE_LEVELS||[100,200,300,400,500,600,700,800,900,1000]).map(level=>[String(level),false]))},alternateUniverse:{unlocked:false,deepestCleared:0,activeAttempt:null,lifeFailures:{lifeId:count,failures:{}}}});
   const makeW1=count=>{const s=newState();s.saveVersion=17;s.reincarnation=reincarnation(count);s.secondWorld=createBlankSecondWorldState();s.thirdWorld=createBlankThirdWorldState();return s;};
   const makeW2=count=>{const s=makeW1(count);s.level=500;s.secondWorld=createBlankSecondWorldState();s.secondWorld.entered=true;s.thirdWorld=createBlankThirdWorldState();return s;};
   const makeW3=count=>{const s=makeW2(count);s.level=1000;s.thirdWorld=createBlankThirdWorldState();s.thirdWorld.entered=true;return s;};
   const originalState=state;
   const originalEffectiveCombatSpeed=window.effectiveCombatSpeed;
   const originalSecondWorldEntryRequirements=window.secondWorldEntryRequirements;
   const out={};

   state=makeW1(0);
   out.w1First={context:firstWorldReincarnationRerunContext(state),lastBoss:canBoss(MAPS.length-1),lastEnemy:enemyUnlocked(MAPS.length-1,4),uiRerun:adventureMapPage().includes('data-rerun-world1="1"')};
   state=makeW1(1);
   const w1Html=adventureMapPage();
   out.w1Rerun={context:firstWorldReincarnationRerunContext(state),allEnemies:MAPS.every((_,m)=>[0,1,2,3,4].every(e=>enemyUnlocked(m,e))),allBosses:MAPS.every((_,m)=>canBoss(m)),regionSections:(w1Html.match(/data-rerun-world1-region=/g)||[]).length,uiRerun:w1Html.includes('轉生重征服・銀河紀元')};
   const w1RegionIndex=5,w1KeyIndex=Number(WORLD_REGIONS[w1RegionIndex].mapEnd);state.bossKilled[w1KeyIndex]=true;
   out.w1Coverage={coverage:firstWorldRerunKeyBossCoverage(state),actualKills:state.bossKilled.filter(Boolean).length,keyKilled:state.bossKilled[w1KeyIndex]};
   state=clone(state);out.w1Reload={active:isFirstWorldReincarnationRerun(state),coverage:firstWorldRerunKeyBossCoverage(state),actualKills:state.bossKilled.filter(Boolean).length};

   state=makeW1(0);
   const firstSettings=settingsPage();
   state=makeW1(1);state.settings.combatSpeed=1.5;
   const rerunSettings=settingsPage();
   const rerunCombat=adventureCombatPage();
   document.getElementById('main').innerHTML=rerunCombat;
   mainMinimalModeEnsureCombatHeader({continuous:true});
   const rerunContinuousBadge=document.querySelector('.combat-head .universe-combat-speed')?.textContent||'';
   window.effectiveCombatSpeed=()=>2;
   const gmCombat=adventureCombatPage();
   window.effectiveCombatSpeed=originalEffectiveCombatSpeed;
   window.secondWorldEntryRequirements=()=>({eligible:true});
   state=makeW1(0);openWorldPhaseConfirmation(2);
   const firstTransition=document.getElementById('worldPhaseConfirmModal')?.textContent||'';closeWorldPhaseConfirmation();
   state=makeW1(1);openWorldPhaseConfirmation(2);
   const rerunTransition=document.getElementById('worldPhaseConfirmModal')?.textContent||'';closeWorldPhaseConfirmation();
   window.secondWorldEntryRequirements=originalSecondWorldEntryRequirements;
   out.speedUi={firstSettingsHidden:!firstSettings.includes('combat-speed-setting'),rerunSettingsVisible:rerunSettings.includes('combat-speed-setting')&&rerunSettings.includes('1.5×'),rerunCombat15:rerunCombat.includes('class="universe-combat-speed">1.5×</span>'),gmCombat2:gmCombat.includes('class="universe-combat-speed">2×</span>'),rerunContinuousBadge,firstTransitionUnlock:firstTransition.includes('1.5× 戰鬥速度'),rerunTransitionUnlock:rerunTransition.includes('1.5× 戰鬥速度')};

   state=makeW2(0);
   out.w2First={context:secondWorldReincarnationRerunContext(state),boss0:canChallengeSecondWorldBoss(0,state),boss99:canChallengeSecondWorldBoss(99,state)};
   state=makeW2(1);
   const w2Html=secondWorldAdventurePageHtml();
   out.w2Rerun={context:secondWorldReincarnationRerunContext(state),allBosses:Array.from({length:100},(_,i)=>canChallengeSecondWorldBoss(i,state)).every(Boolean),regionSections:(w2Html.match(/class="world-region universe-region/g)||[]).length};
   state.secondWorld.mainline.bossKilled[59]=true;
   out.w2Coverage={coverage:secondWorldRerunKeyBossCoverage(state),actualKills:state.secondWorld.mainline.bossKilled.filter(Boolean).length,keyKilled:state.secondWorld.mainline.bossKilled[59],reviewAvailable:typeof canRunSecondWorldBossReview==='function'?canRunSecondWorldBossReview(0,state):null};
   state=clone(state);out.w2Reload={active:isSecondWorldReincarnationRerun(state),coverage:secondWorldRerunKeyBossCoverage(state),actualKills:state.secondWorld.mainline.bossKilled.filter(Boolean).length};

   const maxHp=Number(THIRD_WORLD_BOSS_MAX_HP);
   state=makeW3(0);state.thirdWorld.bosses.forEach(row=>row.currentHp=maxHp);state.thirdWorld.bosses[0].currentHp=Math.floor(maxHp*.90);
   out.w3First={context:thirdWorldReincarnationRerunContext(state),challenge:thirdWorldChallengeStatus(0,state)};
   state=makeW3(1);state.thirdWorld.bosses.forEach(row=>row.currentHp=maxHp);state.thirdWorld.bosses[0].currentHp=Math.floor(maxHp*.90);
   const beforeHp=state.thirdWorld.bosses.map(row=>row.currentHp),w3Html=thirdWorldAdventurePageHtml();
   out.w3Rerun={context:thirdWorldReincarnationRerunContext(state),challenge:thirdWorldChallengeStatus(0,state),uiRerun:w3Html.includes('轉生重征服：可集中攻略任一存活高維存在'),hpUnchanged:JSON.stringify(beforeHp)===JSON.stringify(state.thirdWorld.bosses.map(row=>row.currentHp))};
   state=clone(state);out.w3Reload={active:isThirdWorldReincarnationRerun(state),challenge:thirdWorldChallengeStatus(0,state)};

   const storyFirst=makeW1(0),storyRerun=makeW1(1);
   out.story={first:worldEntryStoryRequirement(storyFirst,'closure-story',false),rerun:worldEntryStoryRequirement(storyRerun,'closure-story',false)};
   out.boundaries={w1:currentWorldPhase(makeW1(1)),w2:currentWorldPhase(makeW2(1)),w3:currentWorldPhase(makeW3(1))};
   out.minimal={shared:MINIMAL_MODE_SHARED_API_VERSION,w2:SECOND_WORLD_MAINLINE_MINIMAL_MODE_INTEGRITY,w3:THIRD_WORLD_PLAYER_FLOW_MINIMAL_MODE_ADAPTER_VERSION,w2Continuous:typeof startSecondWorldBossContinuous==='function',w3Continuous:typeof startThirdWorldPlayerFlow==='function'};

   const resetProbe=makeW3(1);
   resetProbe.storyProgress={...(resetProbe.storyProgress||{}),completedStories:['closure-read-story']};
   resetProbe.bossKilled[Number(WORLD_REGIONS[7].mapEnd)]=true;
   resetProbe.secondWorld.mainline.bossKilled[79]=true;
   resetProbe.thirdWorld.bosses[0].currentHp=Math.floor(maxHp*.42);
   const resetResult=applyReincarnationResetState(resetProbe,{requireEligible:false,currentTime:123456});
   out.nextLife={ok:resetResult?.ok===true,count:resetProbe.reincarnation.count,w1Kills:resetProbe.bossKilled.filter(Boolean).length,w2Entered:resetProbe.secondWorld.entered,w2Kills:resetProbe.secondWorld.mainline.bossKilled.filter(Boolean).length,w3Entered:resetProbe.thirdWorld.entered,w3AllFresh:resetProbe.thirdWorld.bosses.every(row=>Number(row.currentHp)===maxHp),storyPreserved:resetProbe.storyProgress.completedStories.includes('closure-read-story')};

   window.effectiveCombatSpeed=originalEffectiveCombatSpeed;
   window.secondWorldEntryRequirements=originalSecondWorldEntryRequirements;
   state=originalState;
   return out;
  });

  assert.deepEqual(pageErrors,[],'Browser pageerror:\n'+pageErrors.join('\n\n'));
  assert.equal(report.w1First.context.active,false);assert.equal(report.w1First.lastBoss,false);assert.equal(report.w1First.lastEnemy,false);assert.equal(report.w1First.uiRerun,false);
  assert.equal(report.w1Rerun.context.active,true);assert.equal(report.w1Rerun.allEnemies,true);assert.equal(report.w1Rerun.allBosses,true);assert.equal(report.w1Rerun.regionSections,10);assert.equal(report.w1Rerun.uiRerun,true);
  assert.deepEqual(report.w1Coverage,{coverage:6,actualKills:1,keyKilled:true});assert.deepEqual(report.w1Reload,{active:true,coverage:6,actualKills:1});
  assert.equal(report.speedUi.firstSettingsHidden,true);assert.equal(report.speedUi.rerunSettingsVisible,true);assert.equal(report.speedUi.rerunCombat15,true);assert.equal(report.speedUi.gmCombat2,true);assert.equal(report.speedUi.rerunContinuousBadge,'1.5×');assert.equal(report.speedUi.firstTransitionUnlock,true);assert.equal(report.speedUi.rerunTransitionUnlock,false);
  assert.equal(report.w2First.context.active,false);assert.equal(report.w2First.boss0,true);assert.equal(report.w2First.boss99,false);
  assert.equal(report.w2Rerun.context.active,true);assert.equal(report.w2Rerun.allBosses,true);assert.equal(report.w2Rerun.regionSections,10);
  assert.equal(report.w2Coverage.coverage,6);assert.equal(report.w2Coverage.actualKills,1);assert.equal(report.w2Coverage.keyKilled,true);if(report.w2Coverage.reviewAvailable!==null)assert.equal(report.w2Coverage.reviewAvailable,false,'Formal rerun availability must not unlock review history.');
  assert.deepEqual(report.w2Reload,{active:true,coverage:6,actualKills:1});
  assert.equal(report.w3First.context.active,false);assert.equal(report.w3First.challenge.allowed,false);assert.equal(report.w3First.challenge.reason,'five-point-front');
  assert.equal(report.w3Rerun.context.active,true);assert.equal(report.w3Rerun.challenge.allowed,true);assert.equal(report.w3Rerun.challenge.reason,'reincarnation-rerun');assert.equal(report.w3Rerun.challenge.fivePointBypassed,true);assert.equal(report.w3Rerun.uiRerun,true);assert.equal(report.w3Rerun.hpUnchanged,true);
  assert.equal(report.w3Reload.active,true);assert.equal(report.w3Reload.challenge.allowed,true);assert.equal(report.w3Reload.challenge.reason,'reincarnation-rerun');
  assert.equal(report.story.first.ok,false);assert.equal(report.story.rerun.ok,true);assert.equal(report.story.rerun.bypassedForRerun,true);
  assert.deepEqual(report.boundaries,{w1:1,w2:2,w3:3});
  assert.equal(report.minimal.shared,1);assert.equal(report.minimal.w2.passed,true);assert.ok(report.minimal.w3>=1);assert.equal(report.minimal.w2Continuous,true);assert.equal(report.minimal.w3Continuous,true);
  assert.equal(report.nextLife.ok,true);assert.equal(report.nextLife.count,2);assert.equal(report.nextLife.w1Kills,0);assert.equal(report.nextLife.w2Entered,false);assert.equal(report.nextLife.w2Kills,0);assert.equal(report.nextLife.w3Entered,false);assert.equal(report.nextLife.w3AllFresh,true);assert.equal(report.nextLife.storyPreserved,true);
  console.log('Reincarnation rerun batch 5 closure passed:',JSON.stringify(report));
 }finally{await browser.close();}
})().catch(error=>{console.error(error?.stack||error);process.exit(1);});