'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
const {sdk,finishIntro}=require('../equipment-formal/helpers.cjs');
const base=process.env.RUNTIME_SMOKE_URL||'http://127.0.0.1:4173/index.html';
const cases=[...[1,2,3].flatMap(phase=>[{phase,mode:'main'},{phase,mode:'bounty'},{phase,mode:'arena'}]),{phase:1,mode:'special'},{phase:2,mode:'special'},{phase:1,mode:'calamity'},{phase:2,mode:'calamity'},{phase:1,mode:'void'},{phase:2,mode:'void'},{phase:3,mode:'void'},...[1,2,3].map(phase=>({phase,mode:'mirror'})),{phase:3,mode:'alternate'},{phase:2,mode:'review1'},{phase:3,mode:'review2'},{phase:3,mode:'review3'},{phase:2,mode:'calreview1'},{phase:3,mode:'calreview2'}];
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE||(fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined)}),reports=[];try{
 for(const size of [{width:390,height:844}])for(const item of cases){
 const page=await browser.newPage({viewport:size,isMobile:true,hasTouch:true});const errors=[];page.on('pageerror',e=>errors.push(String(e)));page.on('dialog',d=>{errors.push(d.message());void d.dismiss();});try{
 await page.route('**/supabase.js',r=>r.fulfill({contentType:'text/javascript',body:sdk}));await page.addInitScript(()=>localStorage.setItem('civilization-war-combat-animation-v1:device','on'));
 await page.goto(base+'?production=1');await page.waitForFunction(()=>CivilizationStartupCoordinator.snapshot().status==='ready',null,{timeout:60000});await finishIntro(page);
 const availability=await page.evaluate(async({phase,mode})=>{
  const retiredOwners={review1:"startGalaxyReviewBattle",review2:"startSecondWorldBossReview",review3:"startThirdWorldBossReviewFromPlayerUi",calreview1:"startGalaxyCalamityReview",calreview2:"startUniverseCalamityReview"};
  if(retiredOwners[mode]){const before=JSON.stringify(state);return {retired:true,absent:typeof window[retiredOwners[mode]]==="undefined",idle:!CivilizationCombatLifecycle.snapshot(),unchanged:JSON.stringify(state)===before};}
  gmSetBackgroundBattlePreference(false);gmSetMainlineHpLockPreference(false);closeBattleResultModal();state=newState();state.introSeen=true;state.level=phase===1?500:phase===2?600:1000;state.unlockedMap=100;state.mapProgress.forEach(r=>r.fill(10));state.bossKilled=state.bossKilled.map(()=>true);
  if(phase>=2){state.secondWorld.entered=true;state.secondWorld.civilizationLevel=phase===3?10:1;state.secondWorld.mainline.bossKilled[0]=true;}
  if(phase===3){state.thirdWorld=createBlankThirdWorldState();state.thirdWorld.entered=true;state.thirdWorld.entryVersion=2;state.thirdWorld.story.unlockedStage=2;state.reincarnation.count=1;}
  // Do not instantly kill an entire continuous run before the browser can observe Ready.
  // Stable combat stats exercise the actual published HUD and original stop owner.
  window.playerCombatStats=()=>({hp:50000,atk:300,def:1000,crit:0,dodge:0});state.hp=50000;state.specializations.combo=60;state.specializations.drain=60;Math.random=()=>.5;
  view='home';render();await CivilizationFormalBRenderer.warmSprites();if(phase===3&&mode==='bounty')return {blocked:!isDungeonModeEntryUnlocked('bounty',state),stops:document.querySelectorAll('[data-combat-action="stop-continuous"]').length};window.__scrollProof=[];const scroll=window.scrollTo.bind(window);window.scrollTo=(...args)=>{__scrollProof.push({ready:!!document.querySelector('.formal-b-shared-stage:not([hidden])'),args});scroll(...args);};
  window.__rewardFingerprint=()=>JSON.stringify({level:state.level,exp:state.exp,gold:state.gold,vip:state.vipPoints,marks:state.marks,titles:state.titles,bosses:state.bossKilled,map:state.mapProgress,bossLocked:state.bossLocked,bossProgress:state.bossProgress,inventory:state.inventory,equipment:state.equipment,lostGear:state.lostGear,universe:{mainline:state.secondWorld?.mainline,darkMatter:state.secondWorld?.darkMatter,darkEnergy:state.secondWorld?.darkEnergy},calamities:state.secondWorld?.calamities,civ:state.secondWorld?.civilizationLevel,third:state.thirdWorld,void:state.dungeon?.voidMirage,daily:state.daily,reincarnation:state.reincarnation,mirror:state.dungeon?.mirror?{history:state.dungeon.mirror.history,status:state.dungeon.mirror.daily.status,wins:state.dungeon.mirror.daily.wins,losses:state.dungeon.mirror.daily.losses}:null});
  window.__settlementBaseline=null;for(const name of ["runCombatCore","runMirrorCombatCore"]){const core=window[name];window[name]=function(...args){if(__settlementBaseline===null)__settlementBaseline=__rewardFingerprint();return core.apply(this,args);};}
  window.__originalStops=0;
  const names={main:phase===1?'requestContinuousBattleStop':phase===2?'requestSecondWorldContinuousStop':'stopThirdWorldRunFromPlayerUi',bounty:'requestBountyContinuousStop',arena:phase===3?'requestThirdWorldArenaUiStop':'requestArenaContinuousStop',calamity:phase===1?'stopCivilizationCalamityContinuousUI':'stopSecondWorldCalamityContinuousUI',void:'requestVoidMirageExitUI'};
  const fn=names[mode],stop=window[fn];window[fn]=function(...args){__originalStops++;return stop.apply(this,args);};
  if(mode==='special'){if(phase===1)state.level=1;state.pendingBlackMarketEncounter=true;void maybeHandleSpecialEncounter({completed:1,totalXp:0,totalGold:0,items:[],specialEncounters:[]},{win:true,e:{kind:'normal',level:state.level}},{world:phase,mapIndex:0,enemyIndex:0,bossIndex:0}).catch(error=>{if(!CivilizationCombatLifecycle.isInterrupted(error))throw error;});}
  else if(mode==='main'){
   view='adventure';setAdventureEraView(phase===1?'galaxy':phase===2?'universe':'higher');render();
   if(phase===1){selectedMap=0;selectedEnemy=0;selectedBattleCount='continuous';adventureScreen='prepare';clearPreparedFirstWorldTargetContext();prepareFirstWorldTargetContextFromSelection();render();startBattles();}
   else if(phase===2)void startSecondWorldBossContinuous(0);else void startThirdWorldRunFromPlayerUi(0);
  }else if(mode==='bounty'){enterBountyDungeon();startBountyFight(true);}
  else if(mode==='arena'){openArenaDungeon();if(phase===3)startThirdWorldArenaUi('fixed',5);else{startArenaDungeon('normal');startArenaStageFight(true);}}
  else if(mode==='void'){window.playerCombatStats=()=>({hp:1000,atk:1,def:0,crit:0,dodge:0});state.specializations.combo=0;state.specializations.drain=0;enterVoidMirageDungeon();startVoidMirageChallengeUI();}
  else if(mode==='mirror'){window.playerCombatStats=()=>({hp:1000,atk:100,def:0,crit:0,dodge:0});state.hp=1000;state.specializations.combo=0;state.specializations.drain=0;startMirrorCombatRun();}
  else if(mode==='alternate'){state.thirdWorld.bosses.forEach(b=>b.currentHp=0);state.reincarnation.alternateUniverse.unlocked=true;void challengeAlternateUniverseFormal();}
  else {window.playerCombatStats=()=>({hp:1000,atk:100,def:0,dodge:0,crit:0});state.hp=1000;if(phase===1){const d=getCivilizationCalamityDefinitions()[0];state.bossKilled[d.mapIndex]=true;startCivilizationCalamityUI(d.id,'continuous');}else{const d=getSecondWorldCalamityDefinitions()[1];state.secondWorld.mainline.bossKilled[d.bossIndex]=true;view='calamity';startSecondWorldCalamityUI(d.id,'continuous');}}
 },item);
 if(availability.retired){assert.equal(availability.absent,true);assert.equal(availability.idle,true);assert.equal(availability.unchanged,true);reports.push({item,reviewRetirement:availability});console.log('PASS retired mode cannot create runtime',item);continue;}
 if(item.phase===3&&item.mode==='bounty'){assert.equal(availability.blocked,true,'formal high-era bounty remains unavailable');assert.equal(availability.stops,0,'no invented high-era bounty stop');reports.push({item,size,availability});console.log('PASS existing unavailable mode',item,size);continue;}

 await page.waitForFunction(()=>CivilizationCombatLifecycle.snapshot()&&!CivilizationCombatLifecycle.snapshot().done,null,{timeout:20000});
 const before=await page.evaluate(()=>{

  if(__settlementBaseline===null)throw Error("Formal core was not reached");return __settlementBaseline;
 });
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});Object.defineProperty(document,'visibilityState',{configurable:true,get:()=>'hidden'});document.dispatchEvent(new Event('visibilitychange'));});
 await page.waitForFunction(()=>!CivilizationCombatLifecycle.snapshot(),null,{timeout:5000});
 await page.waitForTimeout(100);
 const after=await page.evaluate(()=>({fingerprint:__rewardFingerprint(),busy:battleBusy,p:getCombatPresentationSnapshot()}));
 const oldState=JSON.parse(before),newState=JSON.parse(after.fingerprint),changedKeys=[...new Set([...Object.keys(oldState),...Object.keys(newState)])].filter(k=>JSON.stringify(oldState[k])!==JSON.stringify(newState[k]));
 assert.deepEqual(changedKeys,[],'opening cancellation cannot commit any reward/progress '+JSON.stringify(item));
 assert.equal(after.busy,false,'release battleBusy '+JSON.stringify(item));assert.equal(after.p,null);
 assert.deepEqual(errors,[],'expected cancellation must not throw or alert '+JSON.stringify(item));
 const released=await page.evaluate(()=>{Object.defineProperty(document,'visibilityState',{configurable:true,get:()=>'visible'});Object.defineProperty(document,'hidden',{configurable:true,get:()=>false});document.dispatchEvent(new Event('visibilitychange'));window.dispatchEvent(new Event('focus'));go('home');return worldTransitionRuntimeStatus();});assert.equal(released.blocked,false,'no stale mode owner after cancellation '+JSON.stringify({item,released}));
 reports.push({item,openingCancelled:true,busyReleased:true,ownerReleased:true});console.log('PASS interruption',item);
 }finally{await page.close();}}
 fs.writeFileSync(process.env.FOREGROUND_REPORT||'/tmp/foreground-combat-modes.json',JSON.stringify({passed:true,reports},null,2));
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
