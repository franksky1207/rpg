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
  // Do not instantly kill an entire continuous run before the browser can observe Ready.
  // Stable combat stats exercise the actual published HUD and original stop owner.
  window.playerCombatStats=()=>({hp:50000,atk:300,def:1000,crit:0,dodge:0});state.hp=50000;state.specializations.combo=60;state.specializations.drain=60;Math.random=()=>.5;
  view='home';render();await CivilizationFormalBRenderer.warmSprites();if(phase===3&&mode==='bounty')return {blocked:!isDungeonModeEntryUnlocked('bounty',state),stops:document.querySelectorAll('[data-combat-action="stop-continuous"]').length};window.__scrollProof=[];const scroll=window.scrollTo.bind(window);window.scrollTo=(...args)=>{__scrollProof.push({ready:!!document.querySelector('.formal-b-shared-stage:not([hidden])'),args});scroll(...args);};
  window.__originalStops=0;
  const names={main:phase===1?'requestContinuousBattleStop':phase===2?'requestSecondWorldContinuousStop':'stopThirdWorldContinuousRun',bounty:'requestBountyContinuousStop',arena:phase===3?'requestThirdWorldArenaStop':'requestArenaContinuousStop',calamity:phase===1?'requestCivilizationCalamityContinuousStop':'requestSecondWorldCalamityStop',void:'requestVoidMirageExit'};
  const fn=names[mode],stop=window[fn];window[fn]=function(...args){__originalStops++;return stop.apply(this,args);};
  if(mode==='main'){
   view='adventure';setAdventureEraView(phase===1?'galaxy':phase===2?'universe':'higher');render();
   if(phase===1){selectedMap=0;selectedEnemy=0;selectedBattleCount='continuous';adventureScreen='prepare';clearPreparedFirstWorldTargetContext();prepareFirstWorldTargetContextFromSelection();render();startBattles();}
   else if(phase===2)void startSecondWorldBossContinuous(0);else void startThirdWorldRunFromPlayerUi(0);
  }else if(mode==='bounty'){enterBountyDungeon();startBountyFight(true);}
  else if(mode==='arena'){openArenaDungeon();if(phase===3)startThirdWorldArenaUi('fixed',5);else{startArenaDungeon('normal');startArenaStageFight(true);}}
  else if(mode==='void'){window.playerCombatStats=()=>({hp:1000,atk:1,def:0,crit:0,dodge:0});state.specializations.combo=0;state.specializations.drain=0;enterVoidMirageDungeon();startVoidMirageChallengeUI();}
  else {window.playerCombatStats=()=>({hp:1000,atk:100,def:0,crit:0,dodge:0});state.hp=1000;if(phase===1){const d=getCivilizationCalamityDefinitions()[0];state.bossKilled[d.mapIndex]=true;startCivilizationCalamityUI(d.id,'continuous');}else{const d=getSecondWorldCalamityDefinitions()[1];state.secondWorld.mainline.bossKilled[d.bossIndex]=true;view='calamity';startSecondWorldCalamityUI(d.id,'continuous');}}
 },item);
 if(item.phase===3&&item.mode==='bounty'){assert.equal(availability.blocked,true,'formal high-era bounty remains unavailable');assert.equal(availability.stops,0,'no invented high-era bounty stop');reports.push({item,size,availability});console.log('PASS existing unavailable mode',item,size);continue;}
 const handle=await page.waitForFunction(()=>{
  const s=document.querySelector('.formal-b-shared-stage:not([hidden])');if(!s||!CivilizationCombatViewport.snapshot().focused)return false;
  const r=s.getBoundingClientRect(),vp=visualViewport,bottom=vp.offsetTop+vp.height,top=Math.max(vp.offsetTop,document.querySelector("header")?.getBoundingClientRect().bottom||0);
  if(r.height<=0||r.bottom<=top||r.top>=bottom)return false;
  const essential=[r];
  for(const card of document.querySelectorAll('.combat-arena .combatant.player,.combat-arena .combatant.enemy')){
   for(const el of [card.querySelector('h2'),card.querySelector('.big-hp')])if(el){const box=el.getBoundingClientRect();if(box.height>0)essential.push(box);}
  }
  const b=document.querySelector('[data-combat-action="stop-continuous"]');
  const control=b?.closest('.combat-viewport-stop');if(control){const box=control.getBoundingClientRect();if(box.height>0)essential.push(box);}
  const areaTop=Math.min(...essential.map(x=>x.top)),areaBottom=Math.max(...essential.map(x=>x.bottom));
  const fits=areaBottom-areaTop<=bottom-top-24;
  if(fits&&(areaTop<top-3||areaBottom>bottom+3))return false;
  const delta=r.top+r.height/2-top-vp.height/2;
  return {count:document.querySelectorAll('[data-combat-action="stop-continuous"]').length,above:b?.getBoundingClientRect().bottom<=r.top+1,delta,fits,areaTop,areaBottom,viewportTop:top,viewportBottom:bottom,stageVisible:r.top<bottom&&r.bottom>top,scrolls:__scrollProof,handler:b?.getAttribute('onclick')};
 },null,{timeout:20000}).catch(async e=>{console.log(item,size,errors,await page.evaluate(()=>({view,y:scrollY,scrolls:__scrollProof,stage:document.querySelector('.formal-b-shared-stage')?.getBoundingClientRect().toJSON(),html:document.querySelector('#main').innerHTML.slice(0,1200),diag:CivilizationFormalBEntry.diagnostics(),vp:CivilizationCombatViewport.snapshot()})));throw e;});
 // Capture geometry in the same browser turn as Ready: a one-hit Void floor can
 // retire before the next IPC. The complete original numeric assertions follow.
 const proof=await handle.jsonValue();await handle.dispose();
 assert.equal(proof.count,1,JSON.stringify({item,proof}));assert(proof.above,JSON.stringify({item,proof}));assert(proof.stageVisible,'stage remains visible: '+JSON.stringify({item,proof}));if(proof.fits)assert(proof.areaTop>=proof.viewportTop-3&&proof.areaBottom<=proof.viewportBottom+3,'all essential HUD visible when it fits: '+JSON.stringify({item,proof}));assert(proof.scrolls.every(s=>s.ready),'no animated entry scroll before Ready: '+JSON.stringify({item,proof}));
 await page.locator('[data-combat-action="stop-continuous"]').evaluate(b=>b.click());assert.equal(await page.evaluate(()=>__originalStops),1,'exact original stop handler executes once');assert.deepEqual(errors,[]);
 reports.push({item,size,proof});console.log('PASS real mode',item,size);
 }finally{await page.close();}}
 fs.writeFileSync('/tmp/pr48-mode-matrix.json',JSON.stringify({realDevice:false,reports},null,2));
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
