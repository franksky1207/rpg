'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
const {sdk,finishIntro}=require('../equipment-formal/helpers.cjs');
const base=process.env.RUNTIME_SMOKE_URL||'http://127.0.0.1:4173/index.html';
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||(fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined)}),reports=[];
try{for(const viewport of [{width:1365,height:900},{width:390,height:844},{width:844,height:390}]){
 const page=await browser.newPage({viewport,isMobile:viewport.width!==1365,hasTouch:viewport.width!==1365}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));await page.route('**/supabase.js',r=>r.fulfill({contentType:'text/javascript',body:sdk}));
 await page.addInitScript(()=>localStorage.setItem('civilization-war-combat-animation-v1:device','on'));
 await page.goto(base+'?production=1');await page.waitForFunction(()=>CivilizationStartupCoordinator.snapshot().status==='ready');await page.evaluate(async()=>{await ensureCivilizationScriptGroup('story');civilizationStoryProgress.resume();});await page.locator('#civilizationStoryModal.open').waitFor();await finishIntro(page);await page.evaluate(()=>window.__introProgress=structuredClone(state.storyProgress));
 await page.evaluate(()=>{state.monsterCodex={version:1,encountered:MONSTER_CODEX_CATALOGUE.map(r=>r.id)};view='storyrecord';setFrontlineRecordTab('codex');});
 assert.equal(await page.evaluate(()=>__introProgress.introCompleted&&__introProgress.starterGearReceived&&!__introProgress.pendingStory),true,'formal onboarding completed before combat fixtures');
 const categories=[];console.log('START viewport',viewport);
 for(const category of ['主線','特殊遭遇','副本','文明災厄','異宇宙']){
  await page.selectOption('#main select',category);
  // Open every actual level through its native disclosure, including all ten universe groups.
  const groups=page.locator('[data-codex-group]');const count=await groups.count();
  for(let i=0;i<count;i++)await groups.nth(i).evaluate(el=>{el.open=true;});
  await page.waitForTimeout(100);
  const proof=await page.evaluate(()=>{
   const groups=[...document.querySelectorAll('[data-codex-group]')];return {groups:groups.length,roots:groups.filter(el=>!el.parentElement.closest('[data-codex-group]')).length,
    bad:groups.filter(el=>{const parent=el.parentElement.closest('[data-codex-group]');return parent&&el.querySelector('summary').getBoundingClientRect().left-parent.querySelector('summary').getBoundingClientRect().left<12;}).length,
    overflow:document.documentElement.scrollWidth>innerWidth,
    buttons:[...document.querySelectorAll('.codex-list .btn')].every(el=>el.getBoundingClientRect().right<=innerWidth),
    progress:monsterCodexDisplayProgress()};
  });assert.equal(proof.bad,0);assert.equal(proof.overflow,false);assert.equal(proof.buttons,true);assert.equal(proof.progress.total,905);assert.equal(proof.progress.identities,1705);if(category==='異宇宙')assert.equal(proof.roots,10);
  const group=groups.first();await group.evaluate(el=>el.open=false);await page.waitForTimeout(50);assert.equal(await group.getAttribute('open'),null);await group.evaluate(el=>el.open=true);await page.waitForTimeout(50);
  const button=page.locator('.codex-list .btn').first();await button.scrollIntoViewIfNeeded();const scroll=await page.evaluate(()=>scrollY);
  await button.click();await page.locator('#monsterCodexImage').waitFor();await page.getByRole('button',{name:'← 返回清單'}).click();await page.waitForTimeout(100);
  assert.equal(await page.locator('[data-codex-group][open]').count(),count);assert.ok(Math.abs(await page.evaluate(()=>scrollY)-scroll)<2,'detail return scroll');
  if(category==='主線')await page.screenshot({path:`/tmp/three-ui-main-codex-${viewport.width}.png`});
  categories.push({category,...proof});
 }
 await page.screenshot({path:`/tmp/three-ui-codex-${viewport.width}.png`});console.log('PASS all codex levels',viewport.width);
 for(const world of [1,2]){
  await page.evaluate(async world=>{
   closeBattleResultModal();state=newState();state.introSeen=true;state.storyProgress=structuredClone(__introProgress);state.level=500;state.bossKilled=state.bossKilled.map(()=>true);state.unlockedMap=100;
   if(world===2){state.secondWorld.entered=true;state.secondWorld.civilizationLevel=1;state.secondWorld.mainline.bossKilled=state.secondWorld.mainline.bossKilled.map(()=>true);}
   window.playerCombatStats=()=>({hp:1000,atk:100,def:0,crit:0,dodge:0});state.hp=1000;Math.random=()=>.5;
   gmSetBackgroundBattlePreference(false);view='calamity';render();await CivilizationFormalBRenderer.warmSprites();
   window.__rounds=0;window.__geometry=[];window.__tracking=true;window.__seen=false;
   const original=window.__baseAnimate||animateStructuredCombatPresentation;window.__baseAnimate=original;
   window.animateStructuredCombatPresentation=async function(...args){const result=await original(...args);__rounds++;if(__rounds===4){if(world===1)stopCivilizationCalamityContinuousUI();else stopSecondWorldCalamityContinuousUI();}return result;};
   function track(){if(!__tracking)return;const screen=document.querySelector('.calamity-combat'),stage=screen?.querySelector('.formal-b-shared-stage');
    if(stage&&!stage.hidden)__seen=true;
    if(__seen&&screen){const box=el=>{const r=el?.getBoundingClientRect();return r?{top:r.top+scrollY,height:r.height}:null;};__geometry.push({masked:!!document.querySelector('#civilizationStoryModal.open,#gameIntroModal.show,#civilizationStarterGearModal.open'),round:__rounds,stage:box(stage),player:box(document.querySelector('#combatPlayerCard')),enemy:box(document.querySelector('#combatEnemyCard')),pending:screen.classList.contains('formal-b-stage-pending')});}
    requestAnimationFrame(track);
   }requestAnimationFrame(track);
   if(world===1)startCivilizationCalamityUI(getCivilizationCalamityDefinitions()[0].id,'continuous');
   else startSecondWorldCalamityUI(getSecondWorldCalamityDefinitions()[1].id,'continuous');
  },world);
  await page.waitForFunction(()=>document.querySelector('.formal-b-shared-stage:not([hidden])'));
  await page.screenshot({path:`/tmp/three-ui-calamity-${viewport.width}-${world}.png`});
  await page.waitForFunction(()=>__rounds>=4,null,{timeout:90000}).catch(async error=>{console.log(await page.evaluate(()=>({rounds:__rounds,frames:__geometry.length,run:getCivilizationCalamityRunSnapshot(),run2:getSecondWorldCalamityRunSnapshot(),entry:CivilizationFormalBEntry.diagnostics(),lifecycle:CivilizationCombatLifecycle.snapshot(),html:document.querySelector('#main').innerText})));throw error;});
  await page.waitForFunction(world=>world===1?!getCivilizationCalamityRunSnapshot()?.active:!getSecondWorldCalamityRunSnapshot()?.active,world);
  const proof=await page.evaluate(()=>{__tracking=false;return {rounds:__rounds,frames:__geometry,entry:CivilizationFormalBEntry.diagnostics(),fx:document.querySelectorAll('.combat-fx-pop').length};});
  assert.ok(proof.frames.every(f=>!f.masked),'native battle must never be hidden behind onboarding');
  assert.ok(proof.frames.length>10);assert.ok(proof.frames.some(f=>f.round===1)&&proof.frames.some(f=>f.round===3),'sample full inter-round gaps');
  for(const key of ['stage','player','enemy']){assert.ok(proof.frames.every(f=>f[key]&&f[key].height>0),key+' never collapses');const tops=proof.frames.map(f=>f[key].top);assert.ok(Math.max(...tops)-Math.min(...tops)<=1,key+' stays stable across all frames '+JSON.stringify({min:Math.min(...tops),max:Math.max(...tops)}));}
  assert.equal(proof.fx,0);await page.waitForFunction(()=>CivilizationFormalBEntry.diagnostics().rafs===0);assert.equal(await page.locator('.formal-b-shared-stage canvas').count(),0);
  reports.push({viewport,world,categories,...proof});console.log('PASS continuous stable frames',viewport.width,world,proof.frames.length);
 }
 assert.deepEqual(errors,[]);await page.close();
}fs.writeFileSync('/tmp/three-ui-repairs.json',JSON.stringify({passed:true,realDevice:false,reports},null,2));}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
