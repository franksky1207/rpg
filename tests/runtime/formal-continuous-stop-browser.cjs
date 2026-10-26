'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
const {sdk,finishIntro}=require('../equipment-formal/helpers.cjs');
const base=process.env.RUNTIME_SMOKE_URL||'http://127.0.0.1:4173/index.html';
const output=process.env.FORMAL_STOP_EVIDENCE||'/tmp/formal-continuous-stop';fs.mkdirSync(output,{recursive:true});
const cases=[{phase:1,mode:'main',enemy:0},{phase:1,mode:'main',enemy:3},{phase:1,mode:'main',enemy:4},{phase:2,mode:'main'},
 {phase:1,mode:'special'},{phase:2,mode:'special'},{phase:1,mode:'calamity'},{phase:2,mode:'calamity'},
 {phase:3,mode:'main'},...[1,2].flatMap(phase=>[{phase,mode:'bounty'},{phase,mode:'arena'}]),
 {phase:3,mode:'arena',variant:'fixed'},{phase:3,mode:'arena',variant:'varied'},...[1,2,3].map(phase=>({phase,mode:'void'}))];
const sizes=[{width:390,height:844},{width:844,height:390},{width:1365,height:900}];
const filter=process.env.FORMAL_STOP_FILTER;
if(process.env.CI&&filter)throw Error('CI must run the complete formal stop matrix');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||process.env.CHROMIUM_EXECUTABLE,args:['--no-sandbox']}),reports=[];
 try{for(const size of sizes)for(const item of cases){
 const name=`${item.phase}-${item.mode}-${item.enemy??item.variant??'default'}-${size.width}`;
 if(filter&&!name.includes(filter))continue;
 const page=await browser.newPage({viewport:size,isMobile:size.width!==1365,hasTouch:size.width!==1365}),errors=[];
 page.on('pageerror',e=>errors.push(String(e)));page.on('dialog',d=>{errors.push(d.message());void d.dismiss();});
 try{
 await page.route('**/supabase.js',r=>r.fulfill({contentType:'text/javascript',body:sdk}));
 await page.addInitScript(()=>localStorage.setItem('civilization-war-combat-animation-v1:device','on'));
 await page.goto(base+'?production=1');await page.waitForFunction(()=>window.CivilizationStartupCoordinator?.snapshot().status==='ready',null,{timeout:60000});await finishIntro(page);
 const expectedMode=await page.evaluate(async item=>{
  const {phase,mode}=item;gmSetBackgroundBattlePreference(false);gmSetMainlineHpLockPreference(false);closeBattleResultModal();
  state=newState();state.introSeen=true;state.storyProgress={...state.storyProgress,introCompleted:true,starterGearReceived:true,pendingStory:null,completedStories:Object.keys(window.CIVILIZATION_STORIES||{})};state.level=mode==='special'&&phase===1?1:phase===1?500:phase===2?600:1000;
  state.unlockedMap=100;state.mapProgress.forEach(row=>row.fill(10));state.bossKilled=state.bossKilled.map(()=>true);
  if(phase>=2){state.secondWorld.entered=true;state.secondWorld.civilizationLevel=phase===3?10:1;state.secondWorld.mainline.bossKilled[0]=true;}
  if(phase===3){state.thirdWorld=createBlankThirdWorldState();state.thirdWorld.entered=true;state.thirdWorld.entryVersion=2;state.thirdWorld.story.unlockedStage=2;state.reincarnation.count=1;}
  // Numerical fixtures only. Real stop, presentation, pacing and settlement owners run.
  window.playerCombatStats=()=>({hp:1e12,atk:1e12,def:0,crit:0,dodge:0});state.hp=1e12;Math.random=()=>.5;
  state.specializations.combo=0;state.specializations.drain=0;
  if(mode==='arena'){Math.random=()=>0;window.playerCombatStats=()=>({hp:1000,atk:100000,def:0,crit:0,dodge:0});state.hp=1000;state.specializations.combo=60;state.specializations.drain=60;}
  view='home';render();await CivilizationFormalBRenderer.warmSprites();
  const formalMode=mode==='main'||mode==='special'?(phase===1?'main':phase===2?'second-world-mainline':'higher-stage'):mode==='calamity'?(phase===1?'calamity':'second-world-calamity'):mode==='arena'&&phase===3?'higher-arena':mode;
  const coreNames={main:phase===1?'requestContinuousBattleStop':phase===2?'requestSecondWorldContinuousStop':'stopThirdWorldContinuousRun',special:phase===1?'requestContinuousBattleStop':'requestSecondWorldContinuousStop',calamity:phase===1?'requestCivilizationCalamityContinuousStop':'requestSecondWorldCalamityStop',bounty:'requestBountyContinuousStop',arena:phase===3?'requestThirdWorldArenaStop':'requestArenaContinuousStop',void:'requestVoidMirageExit'};
  const stopName=coreNames[mode],stop=window[stopName];window.__stopCalls=0;
  window[stopName]=function(...args){__stopCalls++;return stop.apply(this,args);};
  window.__stopHold=false;window.__stopPlayed=[];let held=false;
  const original=window.animateStructuredCombatPresentation;
  window.animateStructuredCombatPresentation=function(result,options={}){
   __stopPlayed.push({mode:options.mode,win:result.win,events:result.events?.length});
   const nativeSleep=options.sleep||((ms)=>new Promise(resolve=>setTimeout(resolve,ms)));
   return original(result,{...options,sleep:async ms=>{
    if(!held&&(mode!=='special'||options.mode==='special')){held=true;__stopHold=true;await new Promise(resolve=>window.__releaseStop=resolve);}
    return nativeSleep(ms);
   }});
  };
  if(mode==='special')state.pendingBlackMarketEncounter=true;
  if(mode==='main'||mode==='special'){
   view='adventure';setAdventureEraView(phase===1?'galaxy':phase===2?'universe':'higher');render();
   if(phase===1){selectedMap=0;selectedEnemy=item.enemy||0;selectedBattleCount='continuous';adventureScreen='prepare';clearPreparedFirstWorldTargetContext();prepareFirstWorldTargetContextFromSelection();render();void startBattles();}
   else if(phase===2)void startSecondWorldBossContinuous(0);else void startThirdWorldRunFromPlayerUi(0);
  }else if(mode==='bounty'){enterBountyDungeon();startBountyFight(true);}
  else if(mode==='arena'){openArenaDungeon();if(phase===3)startThirdWorldArenaUi(item.variant,5);else{startArenaDungeon('normal');startArenaStageFight(true);}}
  else if(mode==='void'){enterVoidMirageDungeon();startVoidMirageChallengeUI();}
  else if(phase===1){const d=getCivilizationCalamityDefinitions()[0];state.bossKilled[d.mapIndex]=true;startCivilizationCalamityUI(d.id,'continuous');}
  else{const d=getSecondWorldCalamityDefinitions()[1];state.secondWorld.mainline.bossKilled[d.bossIndex]=true;view='calamity';startSecondWorldCalamityUI(d.id,'continuous');}
  return formalMode;
 },item);
 await page.waitForFunction(mode=>window.__stopHold&&(!CivilizationCombatViewport.snapshot().mobile||CivilizationCombatViewport.snapshot().focused)&&document.querySelector('.formal-b-shared-stage:not([hidden])')&&document.querySelector(`[data-combat-mode="${mode}"]`),expectedMode,{timeout:30000});
 const geometry=await page.evaluate(()=>{
  const button=document.querySelector('[data-combat-action="stop-continuous"]'),stage=document.querySelector('.formal-b-shared-stage:not([hidden])');
  const screen=stage.closest('.combat-screen')||document.querySelector('.combat-screen'),head=screen?.querySelector('.combat-head')||screen?.closest('.calamity-panel')?.querySelector('.calamity-combat-head');
  const rect=el=>el?.getBoundingClientRect().toJSON();
  return {button:rect(button),stage:rect(stage),head:rect(head),visibleTop:document.querySelector("header")?.getBoundingClientRect().bottom||0,count:document.querySelectorAll('[data-combat-action="stop-continuous"]').length,mode:button?.dataset.combatMode,run:button?.dataset.combatRun,sourceOrder:!!(button.compareDocumentPosition(stage)&Node.DOCUMENT_POSITION_FOLLOWING),registered:getFormalContinuousStopModes(),state:getFormalContinuousStopState(button?.dataset.combatMode)};
 });
 assert(geometry.visibleTop>0,name+" measured actual sticky application header");assert.equal(geometry.count,1,name);assert.equal(geometry.mode,expectedMode);assert(geometry.button.width>0&&geometry.button.height>0&&geometry.stage.width>0&&geometry.stage.height>0,name+' real rendered geometry');
 assert(geometry.button.bottom<=geometry.stage.top+1,name+' button must be above actual animation '+JSON.stringify(geometry));
 assert(geometry.stage.top>=geometry.visibleTop-1&&geometry.stage.bottom<=size.height+1,name+' entire animation region within visible viewport '+JSON.stringify(geometry));
 assert(geometry.head.bottom<=geometry.button.top+1,name+' button below heading '+JSON.stringify(geometry));assert(geometry.sourceOrder,name+' authored DOM precedes animation');
 assert(geometry.button.top>=geometry.visibleTop-1&&geometry.button.bottom<=size.height+1,name+' control vertically visible '+JSON.stringify(geometry));
 assert(geometry.button.left>=-1&&geometry.button.right<=size.width+1,name+' control within horizontal viewport');
 const before=await page.evaluate(()=>({state:JSON.stringify(state),storage:JSON.stringify(localStorage),count:__stopPlayed.length,daily:JSON.stringify(state.daily)}));
 // Keep the exact node to prove repeat clicks cannot reach the owner twice.
 const button=await page.locator('[data-combat-action="stop-continuous"]').elementHandle();await button.click();
 const requested=await page.evaluate(mode=>({calls:__stopCalls,stop:getFormalContinuousStopState(mode),state:JSON.stringify(state),storage:JSON.stringify(localStorage),disabled:document.querySelector('[data-combat-action="stop-continuous"]')?.disabled}),expectedMode);
 assert.equal(requested.calls,1,name+' original capability once');assert.equal(requested.stop.requested,true,name+' owner requested');assert.equal(requested.disabled,true,name+' pending disabled');
 assert.equal(requested.state,before.state,name+' requesting stop must not settle rewards or change persistent progress');assert.equal(requested.storage,before.storage,name+' requesting stop must not write save');
 const duplicate=await button.evaluate(el=>{el.click();return requestFormalContinuousStopFromControl(el);});assert.equal(duplicate.ok,false,name+' repeat rejected');assert.equal(await page.evaluate(()=>__stopCalls),1);
 if(item.mode==='special')await page.screenshot({path:output+'/'+name+'.png'});
 await page.evaluate(()=>__releaseStop());
 await page.waitForFunction(mode=>!getFormalContinuousStopState(mode).active&&!battleBusy&&!CivilizationCombatLifecycle.snapshot(),expectedMode,{timeout:45000});
 const after=await page.evaluate(mode=>({stop:getFormalContinuousStopState(mode),calls:__stopCalls,played:__stopPlayed,daily:state.daily,
  bounty:mode==='bounty'?getBountyTestSnapshot():null,arena:mode==='arena'?getArenaCoreState():null,higherArena:mode==='higher-arena'?getThirdWorldArenaRuntimeState():null,
  void:mode==='void'?getVoidMirageRunSnapshot():null,calamity:mode==='calamity'?getCivilizationCalamityRunSnapshot():mode==='second-world-calamity'?getSecondWorldCalamityRunSnapshot():null,
  controls:document.querySelectorAll('[data-combat-action="stop-continuous"]').length,transition:worldTransitionRuntimeStatus(),view}),expectedMode);
 assert.equal(after.calls,1);assert.equal(after.stop.active,false,name+' stopped owner');assert.equal(after.controls,0,name+' retired stop controls removed');
 const actual=after.played.length-before.count+1;
 if(item.mode==='arena'){assert.equal(actual,3,name+' current three-fight round finishes');const rt=item.phase===3?after.higherArena:after.arena;assert.equal(item.phase===3?rt.finishedRuns:rt.summary.runs,1,name+' exactly one round');}
 else assert.equal(actual,1,name+' no next battle after current encounter/floor');
 if(after.void){assert.equal(after.void.exitRequested,true);assert.equal(after.void.endedReason,'exit');}
 if(after.calamity)assert.equal(after.calamity.stopRequested,true);
 const navigation=await page.evaluate(()=>{closeBattleResultModal();go('home');return {view,runtime:worldTransitionRuntimeStatus()};});assert.equal(navigation.view,'home',name+' normal navigation restored');assert.equal(navigation.runtime.blocked,false,name+' no stale owner after leaving result');after.navigation=navigation;
 assert.deepEqual(errors,[],name+' browser errors');reports.push({name,item,size,geometry,requested:{calls:requested.calls,stop:requested.stop},after});
 fs.writeFileSync(output+'/report.json',JSON.stringify({passed:false,complete:false,reports},null,2));console.log('PASS formal stop',name);
 }catch(error){await page.screenshot({path:output+'/FAIL-'+name+'.png'}).catch(()=>{});console.error('FAIL',name,errors,await page.evaluate(()=>({html:document.querySelector('#main')?.innerHTML.slice(0,2000),stop:getFormalContinuousStopModes().map(getFormalContinuousStopState),hold:window.__stopHold,played:window.__stopPlayed})).catch(()=>null));throw error;
 }finally{await page.close();}}
 assert(reports.length>0);if(!filter)assert.equal(reports.length,cases.length*sizes.length);
 fs.writeFileSync(output+'/report.json',JSON.stringify({passed:true,complete:!filter,reports},null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
