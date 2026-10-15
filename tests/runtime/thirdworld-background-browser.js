"use strict";
const {chromium,webkit}=require("playwright"),assert=require("node:assert/strict"),fs=require("node:fs");
const base=process.env.RUNTIME_SMOKE_URL||"http://127.0.0.1:4173/index.html";
// Isolated SDK session fixture, following the existing player browser tests.
// The real auth/startup/GM owners run; no real account, remote save or gate removal.
const sdk=`window.supabase={createClient(){return{auth:{onAuthStateChange(){return{data:{subscription:{unsubscribe(){}}}}},async getSession(){return{data:{session:{user:{id:'t1a-snapshot-test'}}},error:null}}},from(){return{select(){return this},eq(){return this},single(){return Promise.resolve({data:null,error:null})}}}}}};`;
async function finishIntro(page){
 await page.locator("#civilizationStoryModal.open").waitFor({state:"visible",timeout:60000});
 const actions=page.locator("#civilizationStoryModal #storyActions");
 for(let i=0;i<100;i++){
  const end=actions.getByRole("button",{name:"結束",exact:true});
  if(await end.count()){
   await end.click();await page.locator("#civilizationStoryModal.open").waitFor({state:"hidden"});
   await page.locator("#civilizationStarterGearModal").getByRole("button",{name:"領取裝備",exact:true}).click();
   await page.locator("#civilizationStarterGearModal").waitFor({state:"hidden"});
   await page.locator("#gameIntroModal").getByRole("button",{name:"踏上征途",exact:true}).click();
   await page.locator("#gameIntroModal.show").waitFor({state:"hidden"});return;
  }
  await actions.getByRole("button",{name:"下一頁",exact:true}).click();
 }
 throw Error("Intro did not finish through its formal controls");
}
(async()=>{
 const reports=[];
 for(const engine of (process.env.BACKGROUND_BROWSER==='webkit'?['webkit']:['chromium'])){
 const browser=await (engine==='webkit'?webkit:chromium).launch({headless:true,...(engine==='chromium'?{...(process.env.CHROMIUM_EXECUTABLE?{executablePath:process.env.CHROMIUM_EXECUTABLE}:fs.existsSync('/usr/bin/chromium')?{executablePath:'/usr/bin/chromium'}:{}),args:['--no-sandbox']}: {})});
 try{for(const viewport of [{width:1280,height:800},{width:390,height:844}]){
 const page=await browser.newPage({viewport});
 if(process.env.BACKGROUND_BASELINE_DIR)for(const file of ['backgroundprogress.js','combatfx.js','thirdworldrun.js','thirdworldplayerflow.js','thirdworldui.js'])await page.route('**/'+file+'?*',r=>r.fulfill({contentType:'text/javascript',body:fs.readFileSync(process.env.BACKGROUND_BASELINE_DIR+'/'+file)}));const errors=[];page.on('pageerror',e=>errors.push(String(e)));
 await page.route('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js',r=>r.fulfill({contentType:'text/javascript',body:sdk}));
 await page.addInitScript(()=>localStorage.setItem('civilization-war-presentation-mode-v1:t1a-snapshot-test','text'));
 await page.goto(base,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>CivilizationStartupCoordinator.snapshot().status==='ready',null,{timeout:60000});await finishIntro(page);await page.evaluate(()=>ensureCivilizationScriptGroup('integrity'));
 await page.evaluate(fault=>{window.__visualFault=fault;},process.env.W3_B_VISUAL_FAILURE==='1');
 await page.evaluate(()=>{
 state=newState();state.equipment.armor={name:window.CivilizationFormalPlayerSprites.sets.find(r=>r.id==='g007').equipmentNames.armor,world:1,q:1,level:1};state.level=1000;state.secondWorld.entered=true;state.secondWorld.civilizationLevel=10;state.thirdWorld=createBlankThirdWorldState();state.thirdWorld.entered=true;state.thirdWorld.entryVersion=2;state.thirdWorld.story.unlockedStage=2;ensureCivilizationCalamityState();state.marks.entries.ward={acquired:true,level:10,progress:0};view='adventure';setAdventureEraView('higher');
 // Disposable numerical input; real W3 core, run, rewards, render and minimal owners.
 if(window.__visualFault)CivilizationFormalBEntry.bindRoutes({resolve:async()=>{throw Error('injected-B-visual-unavailable');}});
 window.playerCombatStats=()=>({hp:50000,atk:20000,def:0,crit:0,dodge:0});window.effectiveCombatSpeed=()=>2;Math.random=()=>.5;
 gmSetBackgroundBattlePreference(true);render();window.__flow=startThirdWorldPlayerFlow(0);
 window.__hpSamples=[];window.__sampleTimer=setInterval(()=>{const p=getCombatPresentationSnapshot();if(!p)return;__hpSamples.push({token:p.token,index:p.index,player:p.playerHp,enemy:p.enemyHp,playerText:document.getElementById('combatPlayerHp')?.textContent,enemyText:document.getElementById('combatEnemyHp')?.textContent,bar:document.getElementById('combatPlayerBar')?.style.width,shield:p.playerShield,shieldMax:p.playerShieldMax,shieldWidth:document.querySelector('#combatPlayerBar + .combat-shield-bar')?.style.width});},20);
 window.__environment=(hidden,persisted=null)=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>hidden});Object.defineProperty(document,'visibilityState',{configurable:true,get:()=>hidden?'hidden':'visible'});document.dispatchEvent(new Event('visibilitychange'));window.dispatchEvent(new Event(hidden?'blur':'focus'));if(persisted!==null)window.dispatchEvent(new PageTransitionEvent(hidden?'pagehide':'pageshow',{persisted}));};
 });
 await page.waitForFunction(()=>getCombatPresentationSnapshot()?.index>=2);
 await page.evaluate(()=>render());
 await page.waitForFunction(()=>getCombatPresentationSnapshot()?.playerHp>0&&getCombatPresentationSnapshot()?.playerHp<getCombatPresentationSnapshot()?.playerMaxHp);
 assert.equal(await page.evaluate(()=>{const p=getCombatPresentationSnapshot();return document.getElementById('combatPlayerHp').textContent===`${p.playerHp} / ${p.playerMaxHp}`;}),true,'replaced HUD follows partial player damage');
 await page.waitForSelector('.formal-b-whole-suit[data-suit="g007"]');
 await page.evaluate(()=>openThirdWorldMinimalMode());
 const initial=await page.evaluate(()=>thirdWorldContinuousRunSnapshot().battles);
 await page.waitForFunction(n=>thirdWorldContinuousRunSnapshot().battles>n,initial);
 const minimalBefore=await page.locator('[data-third-world-minimal-round]').textContent();
 for(let i=0;i<3;i++){
 const before=await page.evaluate(()=>thirdWorldContinuousRunSnapshot().battles);
 const oldToken=await page.evaluate(()=>getCombatPresentationSnapshot()?.token??null);
 await page.evaluate(()=>__environment(true,true));assert.equal(await page.evaluate(()=>getCombatPresentationSnapshot()),null,'background retires expired presentation without replay');
 assert.equal(await page.evaluate(()=>thirdWorldContinuousRunSnapshot().active),true,'persisted pagehide preserves same runtime');
 await page.waitForTimeout(100);
 await page.evaluate(()=>{const native=Date.now;window.__nativeNow=native;Date.now=()=>native()+3000;__environment(false,true);Date.now=native;});
 await page.waitForFunction(n=>thirdWorldContinuousRunSnapshot().battles>n,before,{timeout:15000});
 await page.waitForFunction(()=>backgroundProgressSnapshot()?.fastCatchUp===false&&getThirdWorldPlayerFlowContext()?.catchingUp===false,{timeout:20000});
 assert.equal(await page.locator('#thirdWorldCatchUpStatus').count(),0,'completed catch-up removes checkpoint notice');
 await page.waitForFunction(()=>getCombatPresentationSnapshot()?.playerHp>0&&getCombatPresentationSnapshot()?.playerHp<getCombatPresentationSnapshot()?.playerMaxHp,{timeout:15000});
 const synced=await page.evaluate(()=>{const p=getCombatPresentationSnapshot();return {player:document.getElementById('combatPlayerHp').textContent===`${p.playerHp} / ${p.playerMaxHp}`,enemy:document.getElementById('combatEnemyHp').textContent===`${p.enemyHp} / ${p.enemyMaxHp}`,run:thirdWorldContinuousRunSnapshot().battles};});assert.equal(synced.player,true);assert.equal(synced.enemy,true);if(oldToken!==null)assert.notEqual(await page.evaluate(()=>getCombatPresentationSnapshot()?.token),oldToken,'foreground uses a new owner presentation');
 }
 assert.notEqual(await page.locator('[data-third-world-minimal-round]').textContent(),minimalBefore);
 await page.evaluate(()=>{closeMinimalMode();openThirdWorldMinimalMode();});
 await page.evaluate(()=>closeMinimalMode());await page.waitForSelector('.formal-b-whole-suit[data-suit="g007"]');await page.evaluate(()=>openThirdWorldMinimalMode());
 const minimal=await page.evaluate(()=>({round:document.querySelector('[data-third-world-minimal-round]').textContent,deaths:document.querySelector('[data-third-world-minimal-deaths]').textContent,cap:document.querySelector('[data-third-world-minimal-cap]').textContent,exp:document.querySelector('[data-third-world-minimal-exp]').textContent,strings:document.querySelector('[data-third-world-minimal-strings]').textContent}));
 await page.evaluate(()=>{gmSetBackgroundBattlePreference(false);backgroundProgressStop('third-world');__environment(true);});
 const disabled=await page.evaluate(()=>thirdWorldContinuousRunSnapshot().battles);await page.waitForTimeout(1500);assert.equal(await page.evaluate(()=>thirdWorldContinuousRunSnapshot().battles),disabled,'GM off pauses after current settled battle');
 await page.evaluate(()=>__environment(false));await page.waitForFunction(n=>thirdWorldContinuousRunSnapshot().battles>n,disabled);
 const samples=await page.evaluate(()=>{clearInterval(__sampleTimer);return __hpSamples;});
 assert.ok(samples.some(s=>s.player>0&&s.player<50000),'partial damage observed, not just death');assert.ok(samples.some(s=>s.shield>0),'formal ward activated');assert.ok(samples.some(s=>s.shield===0&&s.shieldMax>0),'formal ward absorbed damage');assert.ok(samples.some(s=>s.shield>0&&Math.abs(parseFloat(s.shieldWidth)-s.shield/s.shieldMax*100)<.01),'shield DOM follows same presentation owner');
 assert.ok(new Set(samples.map(s=>s.enemy)).size>3,'enemy HP changes through actual attacks');
 await page.evaluate(()=>{stopThirdWorldPlayerFlow('manual');closeMinimalMode();});await page.waitForFunction(()=>getThirdWorldPlayerFlowContext()===null);
 await page.evaluate(()=>{closeThirdWorldRunSummaryModal();window.__restart=startThirdWorldPlayerFlow(0);});await page.waitForFunction(()=>thirdWorldContinuousRunSnapshot().active);
 await page.evaluate(()=>__environment(true,false));assert.equal(await page.evaluate(()=>thirdWorldContinuousRunSnapshot().active),false,'real departure releases runtime');
 assert.deepEqual(errors,[]);reports.push({engine,viewport,visualFailureInjected:process.env.W3_B_VISUAL_FAILURE==='1',initial,minimal,samples,backgroundCycles:3,gmOffSafe:true,persistedResumes:true,departureStops:true});console.log('PASS W3 actual background/HUD/minimal',engine,viewport);await page.close();
 }}finally{await browser.close();}
 }
 fs.writeFileSync(process.env.BACKGROUND_REPORT||'/tmp/thirdworld-background-browser.json',JSON.stringify({passed:true,reports,realIosAppSwitch:false},null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
