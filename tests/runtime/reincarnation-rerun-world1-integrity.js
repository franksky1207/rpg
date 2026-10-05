const {chromium}=require('playwright');
const assert=require('assert');

(async()=>{
 const browser=await chromium.launch({headless:true});
 const page=await browser.newPage();
 const pageErrors=[];
 page.on('pageerror',error=>pageErrors.push(String(error?.stack||error?.message||error)));
 try{
  await page.goto('http://127.0.0.1:4173/index.html',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.FIRST_WORLD_REINCARNATION_RERUN_POLICY_VERSION===2&&window.FIRST_WORLD_RERUN_PRESENTATION_STATE_SWAP_RETIRED_VERSION===1&&window.FIRST_WORLD_REINCARNATION_TARGET_IDENTITY_FIX_VERSION===1&&window.FIRST_WORLD_REINCARNATION_TARGET_CONTEXT_VERSION===1&&window.FIRST_WORLD_REINCARNATION_COMBAT_SPEED_BADGE_REUSE_VERSION===2&&window.COMBAT_SPEED_BADGE_RENDERER_VERSION===1&&window.CALAMITY_RERUN_KEY_BOSS_UNLOCK_VERSION===1&&typeof window.firstWorldRerunKeyBossCoverage==='function'&&typeof window.firstWorldReincarnationTargetContext==='function'&&typeof window.combatSpeedHeaderHtml==='function',{timeout:30000});
  const result=await page.evaluate(async()=>{
   const deep=value=>JSON.parse(JSON.stringify(value));
   const reincarnation=count=>({count,breakthrough:{permanent:0,milestoneLifeId:count,milestones:{}},alternateUniverse:{unlocked:false,deepestCleared:0,activeAttempt:null,lifeFailures:{lifeId:count,failures:{}}}});
   const blankWorld=count=>{
    const mapCount=Array.isArray(MAPS)?MAPS.length:100;
    return {saveVersion:17,level:1,exp:0,hp:1,gold:0,settings:{combatSpeed:count>0?1.5:1},unlockedMap:0,mapProgress:Array.from({length:mapCount},()=>[0,0,0,0]),bossProgress:Array(mapCount).fill(0),bossLocked:Array(mapCount).fill(false),bossKilled:Array(mapCount).fill(false),reincarnation:reincarnation(count),secondWorld:{entered:false},thirdWorld:{entered:false}};
   };
   const formalProgressSnapshot=s=>deep({
    level:s.level,exp:s.exp,unlockedMap:s.unlockedMap,mapProgress:s.mapProgress,bossProgress:s.bossProgress,bossLocked:s.bossLocked,bossKilled:s.bossKilled,reincarnation:s.reincarnation,secondWorld:s.secondWorld,thirdWorld:s.thirdWorld
   });
   const originalState=state,originalUi={selectedMap,selectedEnemy,selectedBattleCount,adventureScreen,currentCombatEncounter},originalRender=render,originalReset=window.resetMonsterPreviewCache;
   const rows=Array.isArray(WORLD_REGIONS)?WORLD_REGIONS:[];
   const calamities=typeof window.getCivilizationCalamityDefinitions==='function'?window.getCivilizationCalamityDefinitions():[];
   try{
    const out={versions:{rerun:window.FIRST_WORLD_REINCARNATION_RERUN_POLICY_VERSION,presentationSwapRetired:window.FIRST_WORLD_RERUN_PRESENTATION_STATE_SWAP_RETIRED_VERSION,targetIdentity:window.FIRST_WORLD_REINCARNATION_TARGET_IDENTITY_FIX_VERSION,targetContext:window.FIRST_WORLD_REINCARNATION_TARGET_CONTEXT_VERSION,speedReuse:window.FIRST_WORLD_REINCARNATION_COMBAT_SPEED_BADGE_REUSE_VERSION,speedRenderer:window.COMBAT_SPEED_BADGE_RENDERER_VERSION,calamity:window.CALAMITY_RERUN_KEY_BOSS_UNLOCK_VERSION},counts:{maps:Array.isArray(MAPS)?MAPS.length:0,regions:rows.length,calamities:calamities.length}};

    state=blankWorld(0);
    out.firstRun={enemyBoss:enemyUnlocked(99,4),canBoss:canBoss(99),html:adventureMapPage(),context:window.firstWorldReincarnationRerunContext(state),targetContext:window.firstWorldReincarnationTargetContext(state),badge:window.combatSpeedBadgeHtml({target:state})};

    state=blankWorld(1);state.bossLocked[99]=true;
    out.rerun={enemySlots:[0,1,2,3,4].map(index=>enemyUnlocked(99,index)),canBoss:canBoss(99),html:adventureMapPage(),unlockedMap:state.unlockedMap,bossKilled:state.bossKilled.slice(),context:window.firstWorldReincarnationRerunContext(state)};
    render=()=>{};window.resetMonsterPreviewCache=()=>{};
    out.rerun.opened=window.openReincarnationRerunWorld1Map(99);selectEnemy(4);
    const formalRef=state,formalBefore=formalProgressSnapshot(state),targetContext=window.firstWorldReincarnationTargetContext(state);
    const prepareHtml=adventurePreparePage();
    const prepared=typeof window.getPreparedFirstWorldTargetContext==='function'?window.getPreparedFirstWorldTargetContext():null;
    const formalAfter=formalProgressSnapshot(state),target=monsterObj(selectedMap,selectedEnemy),combatHtml=adventureCombatPage();
    out.rerun.selection={selectedMap,selectedEnemy,adventureScreen,unlockedMap:state.unlockedMap,prepareShowsMap:prepareHtml.includes(MAPS[99].name),prepareShowsLv500:prepareHtml.includes('Lv.500'),combatShowsLv500:combatHtml.includes('Lv.500'),targetLevel:Number(target?.level),targetName:String(target?.name||''),targetContext,preparedContext:prepared,stateReferenceStable:state===formalRef,formalProgressUnchanged:JSON.stringify(formalBefore)===JSON.stringify(formalAfter),formalBefore,formalAfter,sharedSpeedBadge:combatHtml.includes('data-combat-speed-badge="1"')&&combatHtml.includes('1.5×'),sharedSpeedHeader:combatHtml.includes('data-combat-speed-header="1"'),legacyInlineSpeed:combatHtml.includes('｜1.5×')};

    state=blankWorld(1);const sixthKey=rows[5].mapEnd;state.bossKilled[sixthKey]=true;
    out.coverage6={coverage:window.firstWorldRerunKeyBossCoverage(state),unlocks:calamities.map(def=>window.isCivilizationCalamityUnlocked(def.id,state)),bossKilled:state.bossKilled.slice(),sixthKey};
    state=blankWorld(0);state.bossKilled[sixthKey]=true;
    out.firstRunCalamity={unlocks:calamities.map(def=>window.isCivilizationCalamityUnlocked(def.id,state)),coverage:window.firstWorldRerunKeyBossCoverage(state)};
    state=blankWorld(1);const finalKey=rows[rows.length-1].mapEnd;state.bossKilled[finalKey]=true;
    out.coverage10={coverage:window.firstWorldRerunKeyBossCoverage(state),unlocks:calamities.map(def=>window.isCivilizationCalamityUnlocked(def.id,state)),bossKilled:state.bossKilled.slice(),finalKey};
    const source=await (await fetch('reincarnationrerunworld1.js')).text();
    out.sourceContract={usesSharedRenderer:source.includes('combatSpeedHeaderHtml'),usesStructuredReplace:source.includes('head.replaceWith(replacement)'),legacyHeaderRegex:source.includes('html.replace(/<div class="combat-head"'),usesPreparedContext:source.includes('prepareFirstWorldTargetContextFromSelection'),usesStateSwap:source.includes('state=presentationState')};
    return out;
   }finally{
    state=originalState;selectedMap=originalUi.selectedMap;selectedEnemy=originalUi.selectedEnemy;selectedBattleCount=originalUi.selectedBattleCount;adventureScreen=originalUi.adventureScreen;currentCombatEncounter=originalUi.currentCombatEncounter;render=originalRender;window.resetMonsterPreviewCache=originalReset;window.clearPreparedFirstWorldTargetContext?.();
   }
  });

  assert.deepEqual(result.versions,{rerun:2,presentationSwapRetired:1,targetIdentity:1,targetContext:1,speedReuse:2,speedRenderer:1,calamity:1});
  assert.deepEqual(result.counts,{maps:100,regions:10,calamities:10});
  assert.equal(result.firstRun.context.active,false);assert.equal(result.firstRun.enemyBoss,false);assert.equal(result.firstRun.canBoss,false);assert.equal(result.firstRun.targetContext.active,false);assert.equal(result.firstRun.badge,'');
  assert.equal(result.firstRun.html.includes('data-rerun-world1="1"'),false);assert.equal(result.firstRun.html.includes('data-rerun-world1-region="10"'),false);
  assert.equal(result.rerun.context.active,true);assert.equal(result.rerun.enemySlots.every(Boolean),true);assert.equal(result.rerun.canBoss,true);assert.equal(result.rerun.html.includes('data-rerun-world1="1"'),true);assert.equal(result.rerun.html.includes('data-rerun-world1-region="10"'),true);assert.equal(result.rerun.html.includes('100 張地圖'),true);
  assert.equal(result.rerun.unlockedMap,0);assert.equal(result.rerun.bossKilled.some(Boolean),false);
  assert.equal(result.rerun.opened,true);assert.equal(result.rerun.selection.selectedMap,99);assert.equal(result.rerun.selection.selectedEnemy,4);assert.equal(result.rerun.selection.adventureScreen,'prepare');
  assert.equal(result.rerun.selection.targetContext?.active,true);assert.equal(result.rerun.selection.targetContext?.authorized,true);assert.equal(result.rerun.selection.targetContext?.mapIndex,99);assert.equal(result.rerun.selection.targetContext?.enemyIndex,4);
  assert.equal(result.rerun.selection.preparedContext?.mode,'rerun');assert.equal(result.rerun.selection.preparedContext?.mapIndex,99);assert.equal(result.rerun.selection.preparedContext?.enemyIndex,4);
  assert.equal(result.rerun.selection.stateReferenceStable,true,'W1 rerun prepare must not replace global state.');
  assert.equal(result.rerun.selection.formalProgressUnchanged,true,`W1 rerun prepare mutated formal progress: ${JSON.stringify({before:result.rerun.selection.formalBefore,after:result.rerun.selection.formalAfter})}`);
  assert.equal(result.rerun.selection.unlockedMap,0);assert.equal(result.rerun.selection.prepareShowsMap,true);assert.equal(result.rerun.selection.prepareShowsLv500,true);assert.equal(result.rerun.selection.combatShowsLv500,true);assert.equal(result.rerun.selection.targetLevel,500);
  assert.equal(result.rerun.selection.sharedSpeedBadge,true);assert.equal(result.rerun.selection.sharedSpeedHeader,true);assert.equal(result.rerun.selection.legacyInlineSpeed,false);
  assert.deepEqual(result.sourceContract,{usesSharedRenderer:true,usesStructuredReplace:true,legacyHeaderRegex:false,usesPreparedContext:true,usesStateSwap:false});
  assert.equal(result.coverage6.coverage,6);assert.equal(result.coverage6.unlocks.slice(0,6).every(Boolean),true);assert.equal(result.coverage6.unlocks.slice(6).some(Boolean),false);assert.equal(result.coverage6.bossKilled.filter(Boolean).length,1);assert.equal(result.coverage6.bossKilled[result.coverage6.sixthKey],true);
  assert.equal(result.firstRunCalamity.coverage,0);assert.equal(result.firstRunCalamity.unlocks[5],true);assert.equal(result.firstRunCalamity.unlocks[0],false);
  assert.equal(result.coverage10.coverage,10);assert.equal(result.coverage10.unlocks.every(Boolean),true);assert.equal(result.coverage10.bossKilled.filter(Boolean).length,1);assert.equal(result.coverage10.bossKilled[result.coverage10.finalKey],true);
  assert.deepEqual(pageErrors,[],`Browser pageerror:\n${pageErrors.join('\n\n')}`);
  console.log('Reincarnation World 1 rerun V2 integrity passed.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error?.stack||error);process.exit(1);});