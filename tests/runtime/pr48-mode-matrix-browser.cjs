'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
const {sdk,finishIntro}=require('../equipment-formal/helpers.cjs');
const base=process.env.RUNTIME_SMOKE_URL||'http://127.0.0.1:4173/index.html';
const cases=[...[1,2,3].flatMap(phase=>[{phase,mode:'main'},{phase,mode:'bounty'},{phase,mode:'arena'}]),{phase:1,mode:'calamity'},{phase:2,mode:'calamity'},{phase:1,mode:'void'}];
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined}),reports=[];try{
 for(const size of [{width:390,height:844},{width:844,height:390}])for(const item of cases){
 const page=await browser.newPage({viewport:size,isMobile:true,hasTouch:true});const errors=[];page.on('pageerror',e=>errors.push(String(e)));page.on('dialog',d=>{errors.push(d.message());void d.dismiss();});try{
 await page.route('**/supabase.js',r=>r.fulfill({contentType:'text/javascript',body:sdk}));await page.addInitScript(()=>localStorage.setItem('civilization-war-combat-animation-v1:device','on'));
 await page.goto(base+'?production=1');await page.waitForFunction(()=>CivilizationStartupCoordinator.snapshot().status==='ready',null,{timeout:60000});await finishIntro(page);
 const availability=await page.evaluate(async({phase,mode})=>{
  closeBattleResultModal();state=newState();state.introSeen=true;state.level=phase===1?500:phase===2?600:1000;state.unlockedMap=100;state.mapProgress.forEach(r=>r.fill(10));state.bossKilled=state.bossKilled.map(()=>true);
  if(phase>=2){state.secondWorld.entered=true;state.secondWorld.civilizationLevel=phase===3?10:1;state.secondWorld.mainline.bossKilled[0]=true;}
  if(phase===3){state.thirdWorld=createBlankThirdWorldState();state.thirdWorld.entered=true;state.thirdWorld.entryVersion=2;state.thirdWorld.story.unlockedStage=2;state.reincarnation.count=1;}
  window.playerCombatStats=()=>({hp:1000,atk:100000,def:0,crit:0,dodge:0});state.hp=1000;state.specializations.combo=60;state.specializations.drain=60;Math.random=()=>.5;
  view='home';render();await CivilizationFormalBRenderer.warmSprites();if(phase===3&&mode==='bounty')return {blocked:!isDungeonModeEntryUnlocked('bounty',state),stops:document.querySelectorAll('[data-combat-action="stop-continuous"]').length};window.__scrollProof=[];const scroll=window.scrollTo.bind(window);window.scrollTo=(...args)=>{__scrollProof.push({ready:!!document.querySelector('.formal-b-shared-stage:not([hidden])'),args});scroll(...args);};
  window.__originalStops=0;
  const names={main:phase===1?'requestContinuousBattleStop':phase===2?'requestSecondWorldContinuousStop':'stopThirdWorldRunFromPlayerUi',bounty:'requestBountyContinuousStop',arena:phase===3?'requestThirdWorldArenaUiStop':'requestArenaContinuousStop',calamity:phase===1?'stopCivilizationCalamityContinuousUI':'stopSecondWorldCalamityContinuousUI',void:'requestVoidMirageExitUI'};
  const fn=names[mode],stop=window[fn];window[fn]=function(...args){__originalStops++;return stop.apply(this,args);};
  if(mode==='main'){
   view='adventure';setAdventureEraView(phase===1?'galaxy':phase===2?'universe':'higher');render();
   if(phase===1){selectedMap=0;selectedEnemy=0;selectedBattleCount='continuous';adventureScreen='prepare';clearPreparedFirstWorldTargetContext();prepareFirstWorldTargetContextFromSelection();render();startBattles();}
   else if(phase===2)void startSecondWorldBossContinuous(0);else void startThirdWorldRunFromPlayerUi(0);
  }else if(mode==='bounty'){enterBountyDungeon();startBountyFight(true);}
  else if(mode==='arena'){openArenaDungeon();if(phase===3)startThirdWorldArenaUi('fixed',5);else{startArenaDungeon('normal');startArenaStageFight(true);}}
  else if(mode==='void'){enterVoidMirageDungeon();startVoidMirageChallengeUI();}
  else {window.playerCombatStats=()=>({hp:1000,atk:100,def:0,crit:0,dodge:0});state.hp=1000;if(phase===1){const d=getCivilizationCalamityDefinitions()[0];state.bossKilled[d.mapIndex]=true;startCivilizationCalamityUI(d.id,'continuous');}else{const d=getSecondWorldCalamityDefinitions()[0];state.secondWorld.mainline.bossKilled[d.bossIndex]=true;view='calamity';startSecondWorldCalamityUI(d.id,'continuous');}}
 },item);
 if(item.phase===3&&item.mode==='bounty'){assert.equal(availability.blocked,true,'formal high-era bounty remains unavailable');assert.equal(availability.stops,0,'no invented high-era bounty stop');reports.push({item,size,availability});console.log('PASS existing unavailable mode',item,size);continue;}
 await page.waitForFunction(()=>document.querySelector('.formal-b-shared-stage:not([hidden])')&&CivilizationCombatViewport.snapshot().focused,null,{timeout:20000}).catch(async e=>{console.log(item,size,errors,await page.evaluate(()=>({view,html:document.querySelector('#main').innerHTML.slice(0,1200),diag:CivilizationFormalBEntry.diagnostics(),vp:CivilizationCombatViewport.snapshot()})));throw e;});
 const proof=await page.evaluate(()=>{const b=document.querySelector('[data-combat-action="stop-continuous"]'),s=document.querySelector('.formal-b-shared-stage'),r=s.getBoundingClientRect();return {count:document.querySelectorAll('[data-combat-action="stop-continuous"]').length,above:b?.getBoundingClientRect().bottom<=r.top+1,delta:r.top+r.height/2-visualViewport.offsetTop-visualViewport.height/2,scrolls:__scrollProof,handler:b?.getAttribute('onclick')};});
 assert.equal(proof.count,1,JSON.stringify({item,proof}));assert(proof.above,JSON.stringify({item,proof}));assert(Math.abs(proof.delta)<4,JSON.stringify({item,proof}));assert(proof.scrolls.every(s=>s.ready),'no animated entry scroll before Ready: '+JSON.stringify({item,proof}));
 await page.locator('[data-combat-action="stop-continuous"]').evaluate(b=>b.click());assert.equal(await page.evaluate(()=>__originalStops),1,'exact original stop handler executes once');assert.deepEqual(errors,[]);
 reports.push({item,size,proof});console.log('PASS real mode',item,size);
 }finally{await page.close();}}
 fs.writeFileSync('/tmp/pr48-mode-matrix.json',JSON.stringify({realDevice:false,reports},null,2));
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
