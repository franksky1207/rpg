const { chromium } = require('playwright');

(async()=>{
 const browser=await chromium.launch({headless:true});
 const page=await browser.newPage();
 const pageErrors=[];
 page.on('pageerror',error=>pageErrors.push(error.message));
 await page.goto('http://127.0.0.1:4173/index.html',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.FIRST_WORLD_REINCARNATION_RERUN_POLICY_VERSION===1&&window.FIRST_WORLD_REINCARNATION_TARGET_IDENTITY_FIX_VERSION===1&&window.FIRST_WORLD_REINCARNATION_TARGET_CONTEXT_VERSION===1&&window.FIRST_WORLD_REINCARNATION_COMBAT_SPEED_BADGE_REUSE_VERSION===2&&window.COMBAT_SPEED_BADGE_RENDERER_VERSION===1&&window.CALAMITY_RERUN_KEY_BOSS_UNLOCK_VERSION===1&&typeof window.firstWorldRerunKeyBossCoverage==='function'&&typeof window.firstWorldReincarnationTargetContext==='function'&&typeof window.combatSpeedHeaderHtml==='function');
 const result=await page.evaluate(async()=>{
  function reincarnation(count){return {count,breakthrough:{permanent:0,milestoneLifeId:count,milestones:{}},alternateUniverse:{unlocked:false,deepestCleared:0,activeAttempt:null,lifeFailures:{lifeId:count,failures:{}}}};}
  function blankWorld(count){
   const mapCount=Array.isArray(MAPS)?MAPS.length:100;
   return {saveVersion:17,level:1,exp:0,hp:1,gold:0,settings:{combatSpeed:count>0?1.5:1},unlockedMap:0,mapProgress:Array.from({length:mapCount},()=>[0,0,0,0]),bossProgress:Array(mapCount).fill(0),bossLocked:Array(mapCount).fill(false),bossKilled:Array(mapCount).fill(false),reincarnation:reincarnation(count),secondWorld:{entered:false},thirdWorld:{entered:false}};
  }
  const originalState=state;
  const rows=Array.isArray(WORLD_REGIONS)?WORLD_REGIONS:[];
  const calamities=typeof window.getCivilizationCalamityDefinitions==='function'?window.getCivilizationCalamityDefinitions():[];
  const out={versions:{rerun:window.FIRST_WORLD_REINCARNATION_RERUN_POLICY_VERSION,targetIdentity:window.FIRST_WORLD_REINCARNATION_TARGET_IDENTITY_FIX_VERSION,targetContext:window.FIRST_WORLD_REINCARNATION_TARGET_CONTEXT_VERSION,speedReuse:window.FIRST_WORLD_REINCARNATION_COMBAT_SPEED_BADGE_REUSE_VERSION,speedRenderer:window.COMBAT_SPEED_BADGE_RENDERER_VERSION,calamity:window.CALAMITY_RERUN_KEY_BOSS_UNLOCK_VERSION},counts:{maps:Array.isArray(MAPS)?MAPS.length:0,regions:rows.length,calamities:calamities.length}};

  state=blankWorld(0);
  out.firstRun={enemyBoss:enemyUnlocked(99,4),canBoss:canBoss(99),html:adventureMapPage(),context:window.firstWorldReincarnationRerunContext(state),targetContext:window.firstWorldReincarnationTargetContext(state),badge:window.combatSpeedBadgeHtml({target:state})};

  state=blankWorld(1);state.bossLocked[99]=true;
  out.rerun={enemySlots:[0,1,2,3,4].map(index=>enemyUnlocked(99,index)),canBoss:canBoss(99),html:adventureMapPage(),unlockedMap:state.unlockedMap,bossKilled:state.bossKilled.slice(),context:window.firstWorldReincarnationRerunContext(state)};
  const oldRender=render,oldReset=window.resetMonsterPreviewCache;
  render=()=>{};window.resetMonsterPreviewCache=()=>{};
  out.rerun.opened=window.openReincarnationRerunWorld1Map(99);
  selectEnemy(4);
  const formalRef=state,formalBefore=JSON.stringify(state),targetContext=window.firstWorldReincarnationTargetContext(state);
  const prepareHtml=adventurePreparePage();
  const formalAfter=JSON.stringify(state);
  const target=monsterObj(selectedMap,selectedEnemy);
  const combatHtml=adventureCombatPage();
  out.rerun.selection={selectedMap,selectedEnemy,adventureScreen,unlockedMap:state.unlockedMap,prepareShowsMap:prepareHtml.includes(MAPS[99].name),prepareShowsLv500:prepareHtml.includes('Lv.500'),combatShowsLv500:combatHtml.includes('Lv.500'),targetLevel:Number(target?.level),targetName:String(target?.name||''),targetContext,stateReferenceRestored:state===formalRef,formalStateUnchanged:formalBefore===formalAfter,sharedSpeedBadge:combatHtml.includes('data-combat-speed-badge="1"')&&combatHtml.includes('1.5×'),sharedSpeedHeader:combatHtml.includes('data-combat-speed-header="1"'),legacyInlineSpeed:combatHtml.includes('｜1.5×')};
  render=oldRender;window.resetMonsterPreviewCache=oldReset;

  state=blankWorld(1);
  const sixthKey=rows[5].mapEnd;state.bossKilled[sixthKey]=true;
  out.coverage6={coverage:window.firstWorldRerunKeyBossCoverage(state),unlocks:calamities.map(def=>window.isCivilizationCalamityUnlocked(def.id,state)),bossKilled:state.bossKilled.slice(),sixthKey};

  state=blankWorld(0);state.bossKilled[sixthKey]=true;
  out.firstRunCalamity={unlocks:calamities.map(def=>window.isCivilizationCalamityUnlocked(def.id,state)),coverage:window.firstWorldRerunKeyBossCoverage(state)};

  state=blankWorld(1);const finalKey=rows[rows.length-1].mapEnd;state.bossKilled[finalKey]=true;
  out.coverage10={coverage:window.firstWorldRerunKeyBossCoverage(state),unlocks:calamities.map(def=>window.isCivilizationCalamityUnlocked(def.id,state)),bossKilled:state.bossKilled.slice(),finalKey};
  const source=await (await fetch('reincarnationrerunworld1.js')).text();
  out.sourceContract={usesSharedRenderer:source.includes('combatSpeedHeaderHtml'),usesStructuredReplace:source.includes('head.replaceWith(replacement)'),legacyHeaderRegex:source.includes('html.replace(/<div class="combat-head"')};
  state=originalState;
  return out;
 });
 const fail=(code,detail)=>{throw new Error(`${code}: ${JSON.stringify(detail)}`);};
 if(pageErrors.length)fail('PAGE_ERRORS',pageErrors);
 if(result.versions.rerun!==1||result.versions.targetIdentity!==1||result.versions.targetContext!==1||result.versions.speedReuse!==2||result.versions.speedRenderer!==1||result.versions.calamity!==1)fail('VERSIONS',result.versions);
 if(result.counts.maps!==100||result.counts.regions!==10||result.counts.calamities!==10)fail('COUNTS',result.counts);
 if(result.firstRun.context.active!==false||result.firstRun.enemyBoss!==false||result.firstRun.canBoss!==false||result.firstRun.targetContext.active!==false||result.firstRun.badge!=='')fail('FIRST_RUN_GATE_CHANGED',result.firstRun);
 if(result.firstRun.html.includes('data-rerun-world1="1"')||result.firstRun.html.includes('data-rerun-world1-region="10"'))fail('FIRST_RUN_UI_CONTAMINATED',result.firstRun.html.slice(0,500));
 if(result.rerun.context.active!==true||result.rerun.enemySlots.some(value=>value!==true)||result.rerun.canBoss!==true)fail('RERUN_DIRECT_CHALLENGE',result.rerun);
 if(!result.rerun.html.includes('data-rerun-world1="1"')||!result.rerun.html.includes('data-rerun-world1-region="10"')||!result.rerun.html.includes('100 張地圖'))fail('RERUN_ALL_MAP_UI',result.rerun.html.slice(0,1000));
 if(result.rerun.unlockedMap!==0||result.rerun.bossKilled.some(Boolean))fail('RERUN_FAKE_PROGRESS',result.rerun);
 if(result.rerun.opened!==true||result.rerun.selection.selectedMap!==99||result.rerun.selection.selectedEnemy!==4||result.rerun.selection.adventureScreen!=='prepare')fail('RERUN_MAP_SELECTION',result.rerun.selection);
 if(result.rerun.selection.targetContext?.active!==true||result.rerun.selection.targetContext?.authorized!==true||result.rerun.selection.targetContext?.mapIndex!==99||result.rerun.selection.targetContext?.enemyIndex!==4)fail('RERUN_TARGET_CONTEXT',result.rerun.selection);
 if(result.rerun.selection.stateReferenceRestored!==true||result.rerun.selection.formalStateUnchanged!==true)fail('RERUN_PREPARE_MUTATED_FORMAL_STATE',result.rerun.selection);
 if(result.rerun.selection.unlockedMap!==0||result.rerun.selection.prepareShowsMap!==true||result.rerun.selection.prepareShowsLv500!==true||result.rerun.selection.combatShowsLv500!==true||result.rerun.selection.targetLevel!==500)fail('RERUN_TARGET_IDENTITY',result.rerun.selection);
 if(result.rerun.selection.sharedSpeedBadge!==true||result.rerun.selection.sharedSpeedHeader!==true||result.rerun.selection.legacyInlineSpeed!==false)fail('RERUN_SHARED_SPEED_RENDERER',result.rerun.selection);
 if(result.sourceContract.usesSharedRenderer!==true||result.sourceContract.usesStructuredReplace!==true||result.sourceContract.legacyHeaderRegex!==false)fail('RERUN_SPEED_SOURCE_CONTRACT',result.sourceContract);
 if(result.coverage6.coverage!==6||result.coverage6.unlocks.slice(0,6).some(value=>value!==true)||result.coverage6.unlocks.slice(6).some(value=>value!==false))fail('KEY_BOSS_COVERAGE_6',result.coverage6);
 if(result.coverage6.bossKilled.filter(Boolean).length!==1||result.coverage6.bossKilled[result.coverage6.sixthKey]!==true)fail('KEY_BOSS_NO_FAKE_HISTORY_6',result.coverage6);
 if(result.firstRunCalamity.coverage!==0||result.firstRunCalamity.unlocks[5]!==true||result.firstRunCalamity.unlocks[0]!==false)fail('FIRST_RUN_CALAMITY_SEMANTICS',result.firstRunCalamity);
 if(result.coverage10.coverage!==10||result.coverage10.unlocks.some(value=>value!==true))fail('KEY_BOSS_COVERAGE_10',result.coverage10);
 if(result.coverage10.bossKilled.filter(Boolean).length!==1||result.coverage10.bossKilled[result.coverage10.finalKey]!==true)fail('KEY_BOSS_NO_FAKE_HISTORY_10',result.coverage10);
 console.log('Reincarnation World 1 rerun integrity passed.');
 await browser.close();
})().catch(error=>{console.error(error);process.exit(1);});
