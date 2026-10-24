'use strict';
const {chromium}=require('playwright'),fs=require('node:fs'),assert=require('node:assert/strict');
const {sdk,finishIntro}=require('../equipment-formal/helpers.cjs');
const base=process.env.RUNTIME_SMOKE_URL||'http://127.0.0.1:4173/index.html';
const sizes=[{width:1365,height:900},{width:390,height:844},{width:844,height:390}];
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||(fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined)}),rows=[];
async function boot(viewport){
 const page=await browser.newPage({viewport,isMobile:viewport.width!==1365,hasTouch:viewport.width!==1365});page.errors=[];page.on('pageerror',e=>page.errors.push(e.message));
 await page.route('**/supabase.js',r=>r.fulfill({contentType:'text/javascript',body:sdk}));await page.goto(base+'?production=1');await page.waitForFunction(()=>CivilizationStartupCoordinator.snapshot().status==='ready');
 await page.evaluate(async()=>{await ensureCivilizationScriptGroup('story');civilizationStoryProgress.resume();});await page.locator('#civilizationStoryModal.open').waitFor();await finishIntro(page);
 await page.evaluate(()=>window.__intro=structuredClone(state.storyProgress));return page;
}
async function seed(page,world,higher=false){await page.evaluate(({world,higher})=>{
 state=newState();state.introSeen=true;state.storyProgress=structuredClone(__intro);state.playerName='副本驗收者';state.level=[0,100,600,1000][world];state.secondWorld.entered=world>1;
 if(world===3){state.thirdWorld=createBlankThirdWorldState();state.thirdWorld.entered=true;state.thirdWorld.entryVersion=2;state.thirdWorld.story.introSeen=true;state.reincarnation.count=1;}
 if(higher){state.reincarnation.count=1;state.reincarnation.appearanceEra='higher';}
 window.playerCombatStats=()=>({hp:1000,atk:100,def:0,crit:0,dodge:0});state.hp=1000;Math.random=()=>.5;gmSetBackgroundBattlePreference(false);view='dungeon-mirror';render();
 },{world,higher});}
async function visible(page,mode){
 await page.waitForFunction(mode=>{const c=document.querySelector('.formal-b-verified-monster');return c&&getComputedStyle(c).visibility!=='hidden'&&CivilizationCombatEvents.snapshot()?.mode===mode;},mode,{timeout:20000});
 return page.evaluate(()=>{
 const stage=document.querySelector('.formal-b-shared-stage'),p=stage.querySelector('[data-suit]'),e=stage.querySelector('.formal-b-verified-monster');
 const rect=el=>{const r=el.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top+scrollY,bottom:r.bottom+scrollY,width:r.width,height:r.height};};
 const ink=c=>{const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let n=0;for(let i=3;i<d.length;i+=4)if(d[i]>16)n++;return n;};
 return {suit:p.dataset.suit,mirror:e.dataset.mirror,monster:e.dataset.monster,pixels:[ink(p),ink(e)],ratio:Number(e.dataset.actualRatio),event:CivilizationCombatEvents.snapshot(),stage:rect(stage),cards:[...document.querySelectorAll('.combatant')].map(rect),hp:[...document.querySelectorAll('.status-label>span:last-child')].map(el=>({text:el.textContent,height:el.getBoundingClientRect().height,lineHeight:parseFloat(getComputedStyle(el).lineHeight)||parseFloat(getComputedStyle(el).fontSize)*1.5,scrollWidth:el.scrollWidth,width:el.clientWidth}))};
 });
}
async function hide(page){await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});Object.defineProperty(document,'visibilityState',{configurable:true,get:()=>'hidden'});document.dispatchEvent(new Event('visibilitychange'));});await page.waitForFunction(()=>!battleBusy&&!getMirrorDungeonActiveRun()?.active&&!CivilizationCombatLifecycle.snapshot());}
async function show(page){await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>false});Object.defineProperty(document,'visibilityState',{configurable:true,get:()=>'visible'});document.dispatchEvent(new Event('visibilitychange'));dispatchEvent(new Event('focus'));});}
async function cleanup(page){await page.evaluate(()=>{CivilizationFormalBEntry.dispose();CivilizationFormalBRenderer.clearSpriteCache();});const stats=await page.evaluate(()=>({player:CivilizationFormalBRenderer.spriteStats(),monster:CivilizationFormalBRenderer.monsterStats()}));assert.equal(stats.player.refs,0);assert.equal(stats.monster.refs,0);assert.deepEqual(page.errors,[]);return stats;}
try{
 if(process.env.MIRROR_VOID_MODE!=='void')for(const viewport of sizes)for(const world of [1,2,3]){
  const page=await boot(viewport);await seed(page,world);
  assert.equal(await page.evaluate(()=>startMirrorCombatRun()),true);
  let proof=await visible(page,'mirror');assert.equal(proof.suit,['','era-galaxy','era-universe','era-higher'][world]);assert.equal(proof.mirror,proof.suit);assert.ok(proof.pixels.every(n=>n>100));assert.ok(proof.ratio>=1&&proof.ratio<=1.5);
  assert.ok(proof.cards.every(c=>c.width>200));if(viewport.width>760)assert.ok(Math.abs(proof.cards[0].width-proof.cards[1].width)<1);
  assert.ok(proof.hp.every(h=>h.height<=h.lineHeight+1),'HP stays on one line');
  await page.evaluate(()=>{window.__screen=document.querySelector('.mirror-combat-shell');window.__stage=__screen.querySelector('.formal-b-shared-stage');window.__tops=[];window.__track=true;const tick=()=>{if(!__track)return;const screen=document.querySelector('.mirror-combat-shell');if(screen){const stage=screen.querySelector(".formal-b-shared-stage"),b=stage?.getBoundingClientRect();__tops.push({same:screen===__screen,top:b?b.top+scrollY:0,height:b?.height||0});}requestAnimationFrame(tick)};requestAnimationFrame(tick);});
  await page.waitForFunction(()=>state.dungeon.mirror.daily.wins+state.dungeon.mirror.daily.losses>=1&&getMirrorDungeonActiveRun()?.currentBattle>=2,{},{timeout:25000});
  await visible(page,'mirror');await page.screenshot({path:`/tmp/mirror-void-mirror-${viewport.width}-${world}.png`});
  const frames=await page.evaluate(()=>{__track=false;return __tops});assert.ok(frames.length>10);assert.ok(frames.every(f=>f.same&&f.height>0));assert.ok(Math.max(...frames.map(f=>f.top))-Math.min(...frames.map(f=>f.top))<=1,'mirror stage stable through round switch');
  await hide(page);const saved=await page.evaluate(()=>({daily:structuredClone(state.dungeon.mirror.daily),vip:state.vipPoints}));await show(page);
  const dialogs=[];page.on('dialog',async d=>{dialogs.push({type:d.type(),message:d.message()});await d.accept()});
  await page.getByRole('button',{name:'繼續鏡像戰',exact:true}).click();await page.waitForFunction(()=>getMirrorDungeonActiveRun()?.active&&CivilizationCombatLifecycle.snapshot());
  const resumed=await page.evaluate(()=>({run:getMirrorDungeonActiveRun(),daily:structuredClone(state.dungeon.mirror.daily),vip:state.vipPoints}));assert.deepEqual(resumed.daily,saved.daily);assert.equal(resumed.vip,saved.vip);assert.equal(resumed.run.currentBattle,saved.daily.wins+saved.daily.losses+1);assert.equal(dialogs.length,0,'resume requires no new daily-start modal');await visible(page,'mirror');await hide(page);
  // Reload uses the real persisted checkpoint and the same original snapshot.
  await page.reload();await page.waitForFunction(()=>CivilizationStartupCoordinator.snapshot().status==='ready');const loaded=await page.evaluate(()=>({daily:structuredClone(state.dungeon.mirror.daily),info:mirrorDungeonStatus(),vip:state.vipPoints}));assert.deepEqual(loaded.daily,saved.daily);assert.equal(loaded.vip,saved.vip);assert.equal(loaded.info.resumable,true);
  rows.push({mode:'mirror',viewport,world,proof,frames:frames.length,saved,resumedBattle:resumed.run.currentBattle,reloadPreserved:true,stats:await cleanup(page)});await page.close();console.log('PASS mirror native UI + interruption/resume/reload',viewport.width,world);
 }
 if(process.env.MIRROR_VOID_MODE!=='mirror')for(const viewport of sizes)for(const world of [1,2,3]){
  const page=await boot(viewport);await seed(page,world);await page.evaluate(()=>{window.playerCombatStats=()=>({hp:100000,atk:100,def:100,crit:0,dodge:0});state.hp=100000;ensureVoidMirageState();state.dungeon.voidMirage.highestCleared=109;enterVoidMirageDungeon();startVoidMirageChallengeUI();});
  const proofs=[];for(const floor of [9,10,11]){
   await page.waitForFunction(floor=>CivilizationCombatEvents.snapshot()?.actors?.enemy?.location===String(floor),floor,{timeout:45000});const proof=await visible(page,'void');assert.equal(proof.event.world,world);assert.ok(proof.monster);assert.ok(proof.pixels.every(n=>n>100));proofs.push(proof);
   await page.screenshot({path:`/tmp/mirror-void-void-${viewport.width}-${world}-${floor}.png`});
   if(floor===9)await page.evaluate(()=>{window.__voidScreen=document.querySelector(".void-combat");window.__voidTop=document.querySelector(".formal-b-shared-stage").getBoundingClientRect().top+scrollY;});
   assert.equal(await page.evaluate(()=>__voidScreen===document.querySelector(".void-combat")),true,'reuse same shared stage');
   assert.ok(await page.evaluate(()=>Math.abs(document.querySelector(".formal-b-shared-stage").getBoundingClientRect().top+scrollY-__voidTop)<1),'void stage stable across normal/Boss floors');
  }
  await page.getByRole('button',{name:'強制退出虛空幻境',exact:true}).click();await page.waitForFunction(()=>!getVoidMirageRunSnapshot()?.active,{},{timeout:45000});const result=await page.evaluate(()=>({run:getVoidMirageRunSnapshot(),progress:structuredClone(state.dungeon.voidMirage),vip:state.vipPoints}));assert.equal(result.run.endedReason,'exit');assert.ok(result.run.lastClearedFloor>=11);assert.equal(result.vip,0,'no implicit reward claim');
  rows.push({mode:'void',viewport,world,proofs,result,stats:await cleanup(page)});await page.close();console.log('PASS void native regular/Boss/next floor + exit',viewport.width,world);
 }
 fs.writeFileSync(process.env.MIRROR_VOID_REPORT||'/tmp/mirror-void-formal.json',JSON.stringify({passed:true,realIPhone:false,selectedMode:process.env.MIRROR_VOID_MODE||"both",rows},null,2));
}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
