'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
const {sdk,finishIntro}=require('../equipment-formal/helpers.cjs');
const base=process.env.RUNTIME_SMOKE_URL||'http://127.0.0.1:4173/index.html';
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||(fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined)}),rows=[];
async function boot(){const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});page.errors=[];page.on('pageerror',e=>page.errors.push(e.message));await page.route('**/supabase.js',r=>r.fulfill({contentType:'text/javascript',body:sdk}));await page.goto(base+'?production=1');await page.waitForFunction(()=>CivilizationStartupCoordinator.snapshot().status==='ready');await page.evaluate(async()=>{await ensureCivilizationScriptGroup('story');civilizationStoryProgress.resume();});await page.locator('#civilizationStoryModal.open').waitFor();await finishIntro(page);return page;}
try{
 const page=await boot();const dialogs=[];page.on('dialog',async d=>{dialogs.push(d.message());await d.accept()});
 const failures=await page.evaluate(()=>{
  state.level=100;window.playerCombatStats=()=>({hp:1000,atk:100,def:0,crit:0,dodge:0});state.hp=1000;view='dungeon-mirror';render();const before=JSON.stringify(state.dungeon.mirror),out=[];
  battleBusy=true;out.push(startMirrorCombatRun());battleBusy=false;
  const core=window.runMirrorCombatCore;window.runMirrorCombatCore=null;out.push(startMirrorCombatRun());window.runMirrorCombatCore=core;
  const saveFn=window.save;window.save=()=>false;out.push(startMirrorCombatRun());window.save=saveFn;
  return {out,before,after:JSON.stringify(state.dungeon.mirror)};
 });assert.deepEqual(failures.out,[false,false,false]);assert.equal(failures.after,failures.before);assert.equal(dialogs.length,3);assert.match(dialogs[0],/收尾/);assert.equal(dialogs[1],"鏡像戰尚未載入完成，請重新整理後再試；本輪進度會保留。");assert.match(dialogs[2],/保存/);
 // Resume exactly one remaining battle and verify the daily settlement happens once.
 const seeded=await page.evaluate(()=>{
  Math.random=()=>.5;const snapshot=createMirrorCombatSnapshot();const begun=beginMirrorDungeonState(Date.now(),{snapshot});if(!begun.ok)throw Error('fixture start');state.dungeon.mirror.daily.wins=19;save(false);const before={daily:structuredClone(state.dungeon.mirror.daily),vip:state.vipPoints};return {before,started:startMirrorCombatRun()};
 });assert.equal(seeded.started,true);await page.waitForFunction(()=>state.dungeon.mirror.daily.status==='completed',null,{timeout:25000});const settled=await page.evaluate(()=>({daily:structuredClone(state.dungeon.mirror.daily),vip:state.vipPoints,expected:mirrorDungeonRewardForWins(state.dungeon.mirror.daily.wins)}));assert.equal(settled.daily.wins+settled.daily.losses,20);assert.equal(settled.daily.startedAt,seeded.before.daily.startedAt);assert.equal(settled.vip-seeded.before.vip,settled.expected);assert.equal(await page.evaluate(()=>startMirrorCombatRun()),false);assert.deepEqual(await page.evaluate(()=>({daily:structuredClone(state.dungeon.mirror.daily),vip:state.vipPoints,expected:mirrorDungeonRewardForWins(state.dungeon.mirror.daily.wins)})),settled);
 rows.push({kind:'failure-feedback-and-once-only-settlement',failures,dialogs,settled});await page.close();
 // The supplied screenshot has high stats, title effects and many marks. Exercise
 // the real event producer, not injected successful resolver return values.
 const dense=await boot();await dense.evaluate(()=>{
  const intro=state.storyProgress;state=newState();state.storyProgress=intro;state.introSeen=true;state.level=2000;state.reincarnation.count=1;state.playerName='寂寞邊界';
  grantPlayerTitlesForMirrorWins(20,state);state.titles.equipped='mirror_title_20';state.titles.pendingNotice=null;state.dungeon.mirror.history={bestWins:20,bestDate:gameDailyDateKey(),miracleDates:[gameDailyDateKey()]};
  for(const key of MARK_KEYS)state.marks[key]=10;state.specializations.combo=60;state.specializations.counter=60;state.specializations.drain=60;
  window.playerCombatStats=()=>({hp:279855,atk:1000,def:500,crit:20,dodge:0});state.hp=279855;Math.random=()=>.5;view='dungeon-mirror';render();startMirrorCombatRun();
 });await dense.locator('[data-mirror="era-higher"]').waitFor();const visuals=[];
 for(const viewport of [{width:1365,height:900},{width:390,height:844},{width:844,height:390}]){
  await dense.setViewportSize(viewport);await dense.waitForTimeout(160);await dense.screenshot({path:`/tmp/mirror-void-dense-${viewport.width}.png`});
  const proof=await dense.evaluate(()=>{const cards=[...document.querySelectorAll('.combatant')];return {suit:document.querySelector('[data-suit]')?.dataset.suit,mirror:document.querySelector('[data-mirror]')?.dataset.mirror,cards:cards.map(c=>({width:c.getBoundingClientRect().width,labels:c.querySelectorAll('.combat-fx-pop').length,layer:c.querySelector('.combat-fx-layer')?.getBoundingClientRect().bottom,title:c.querySelector('h2').getBoundingClientRect().top,damage:c.querySelector('.combat-damage').getBoundingClientRect().bottom})),overflow:document.documentElement.scrollWidth>innerWidth};});
  assert.equal(proof.suit,'era-higher');assert.equal(proof.mirror,proof.suit);assert.equal(proof.overflow,false);assert.ok(proof.cards.every(c=>c.width>200&&c.labels<=3&&c.damage<c.title&&(!c.layer||c.layer<c.title)));visuals.push({viewport,...proof});
 }
 await dense.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});Object.defineProperty(document,'visibilityState',{configurable:true,get:()=> 'hidden'});document.dispatchEvent(new Event('visibilitychange'));});await dense.waitForFunction(()=>!getMirrorDungeonActiveRun()?.active);assert.deepEqual(dense.errors,[]);rows.push({kind:'reincarnated-higher-appearance-in-W1-and-dense-effects',visuals});await dense.close();
 for(const broken of [false,true]){
  const page=await boot();if(broken)await page.route('**/assets/monsters/**',r=>r.fulfill({status:503,body:'test unavailable'}));
  await page.evaluate(()=>{const intro=state.storyProgress;state=newState();state.storyProgress=intro;state.introSeen=true;state.level=2000;state.reincarnation.count=1;state.secondWorld.entered=true;state.thirdWorld.entered=true;state.thirdWorld.entryVersion=2;ensureVoidMirageState();state.dungeon.voidMirage.highestCleared=38268;window.playerCombatStats=()=>({hp:500000,atk:30000,def:50000,crit:0,dodge:0});state.hp=500000;Math.random=()=>.5;enterVoidMirageDungeon();startVoidMirageChallengeUI();});
  if(!broken)await page.locator('.formal-b-verified-monster').waitFor();else await page.waitForFunction(()=>CivilizationFormalBEntry.diagnostics().ready===true);
  if(broken)await page.waitForTimeout(300);const proof=await page.evaluate(()=>{const stage=document.querySelector('.formal-b-shared-stage'),c=stage.querySelector('.formal-b-enemy-sprite:not(.formal-b-verified-monster)'),r=c.getBoundingClientRect();return {world:CivilizationCombatEvents.snapshot().world,enemy:CivilizationCombatEvents.snapshot().actors.enemy,verified:!!stage.querySelector('.formal-b-verified-monster'),fallbackVisible:getComputedStyle(c).visibility!=='hidden',canvas:{width:r.width,height:r.height},stats:CivilizationFormalBRenderer.monsterStats()};});
  assert.equal(proof.world,3);assert.equal(proof.enemy.location,'38168');assert.equal(proof.verified,!broken);assert.equal(proof.fallbackVisible,broken);assert.ok(proof.canvas.width>0);await page.screenshot({path:`/tmp/mirror-void-high-floor-${broken?'fallback':'verified'}.png`});
  await page.evaluate(()=>{CivilizationFormalBEntry.dispose();CivilizationFormalBRenderer.clearSpriteCache();});await page.waitForFunction(()=>CivilizationFormalBRenderer.monsterStats().refs===0);assert.equal(await page.evaluate(()=>CivilizationFormalBRenderer.spriteStats().refs),0);assert.deepEqual(page.errors,[]);rows.push({kind:'high-floor',broken,proof});await page.close();
 }
 fs.writeFileSync('/tmp/mirror-void-recovery.json',JSON.stringify({passed:true,realIPhone:false,rows},null,2));console.log('PASS explicit failure feedback, final resume/once-only payout, dense marks/title and reincarnated appearance, floor38168 verified/fallback/release');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
