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
 const engine=process.env.BACKGROUND_BROWSER==='webkit'?'webkit':'chromium';
 const browser=await (engine==='webkit'?webkit:chromium).launch({headless:true,...(engine==='chromium'&&fs.existsSync('/usr/bin/chromium')?{executablePath:'/usr/bin/chromium'}:{})});const reports=[];
 try{for(const mode of ['galaxy','universe','void']){
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(String(e)));
 await page.route('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js',r=>r.fulfill({contentType:'text/javascript',body:sdk}));await page.addInitScript(()=>localStorage.setItem('civilization-war-presentation-mode-v1:t1a-snapshot-test','text'));
 await page.goto(base,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>CivilizationStartupCoordinator.snapshot().status==='ready',null,{timeout:60000});await finishIntro(page);await page.evaluate(()=>ensureCivilizationScriptGroup('integrity'));const integrity=await page.evaluate(()=>runContinuousRunCrossEraIntegrity());assert.equal(integrity.passed,true,JSON.stringify(integrity.errors));
 await page.evaluate(mode=>{
  state=newState();state.equipment.armor={name:window.CivilizationFormalPlayerSprites.sets.find(r=>r.id==='g007').equipmentNames.armor,world:1,q:1,level:1};state.level=mode==='galaxy'?50:600;state.reincarnation.count=1;state.hp=100000;
  if(mode!=='galaxy'){state.secondWorld.entered=true;state.secondWorld.bossDefeated=Array(100).fill(false);state.secondWorld.civilizationLevel=10;}
  window.playerCombatStats=()=>({hp:100000,atk:100000,def:10000,crit:0,dodge:0});window.effectiveCombatSpeed=()=>2;Math.random=()=>.99;gmSetBackgroundBattlePreference(true);
  view='adventure';setAdventureEraView(mode==='galaxy'?'galaxy':'universe');render();
  window.__environment=hidden=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>hidden});Object.defineProperty(document,'visibilityState',{configurable:true,get:()=>hidden?'hidden':'visible'});document.dispatchEvent(new Event('visibilitychange'));window.dispatchEvent(new Event(hidden?'blur':'focus'));};
  if(mode==='galaxy'){state.unlockedMap=1;state.mapProgress[0]=[10,10,10,10];selectedMap=0;selectedEnemy=0;selectedBattleCount=CONTINUOUS_BATTLE_COUNT;adventureScreen='prepare';clearPreparedFirstWorldTargetContext();prepareFirstWorldTargetContextFromSelection();startBattles();}
  if(mode==='universe')window.__flow=startSecondWorldBossContinuous(0);
  if(mode==='void'){enterVoidMirageDungeon();window.__flow=startVoidMirageChallengeUI();}
 },mode);
 const counter=mode==='galaxy'?()=>window.activeMainBattleContext?.completed||0:mode==='universe'?()=>window.activeSecondWorldMainlineContext?.completed||0:()=>getVoidMirageRunSnapshot()?.cleared||0;
 await page.waitForFunction(()=>getCombatPresentationSnapshot()?.active!==false&&document.querySelector('.combat-screen'),null,{timeout:15000});
 await page.waitForSelector('.formal-b-whole-suit[data-suit="era-higher"]');
 await page.evaluate(mode=>{if(mode==='galaxy')openMinimalMode('main');if(mode==='universe')openSecondWorldMainlineMinimalMode();if(mode==='void')openVoidMirageMinimalMode();},mode);
 assert.equal(await page.evaluate(()=>isMinimalModeOpen()),true);
 const selector=mode==='galaxy'?'[data-main-minimal-mode-round]':mode==='universe'?'[data-second-world-minimal-round]':'[data-void-minimal-mode-cleared]';
 const start=await page.evaluate(counter);const text=await page.locator(selector).textContent();
 for(let i=0;i<2;i++){
  await page.evaluate(()=>__environment(true));await page.waitForTimeout(100);
  await page.evaluate(()=>{const native=Date.now;Date.now=()=>native()+2500;__environment(false);Date.now=native;});
  await page.waitForFunction(counter,null,{timeout:20000});
 }
 await page.waitForFunction(({mode,start})=>{const value=mode==='galaxy'?activeMainBattleContext?.completed:mode==='universe'?activeSecondWorldMainlineContext?.completed:getVoidMirageRunSnapshot()?.cleared;return value>start;},{mode,start},{timeout:30000});
 await page.waitForFunction(({selector,text})=>document.querySelector(selector)?.textContent!==text,{selector,text});assert.notEqual(await page.locator(selector).textContent(),text,'minimal follows real progress '+mode);
 const after=await page.evaluate(counter);const minimal=await page.locator(selector).textContent();
 await page.evaluate(mode=>{closeMinimalMode();if(mode==='galaxy')requestContinuousBattleStop();if(mode==='universe')requestSecondWorldContinuousStop();if(mode==='void')requestVoidMirageExitUI();},mode);
 await page.waitForFunction(mode=>mode==='galaxy'?!battleBusy:mode==='universe'?!activeSecondWorldMainlineContext:!getVoidMirageRunSnapshot()?.active,mode,{timeout:30000});
 assert.deepEqual(errors,[]);reports.push({mode,engine,start,after,minimal,backgroundCycles:2,stopped:true});console.log('PASS actual cross-era background/minimal',mode,engine);await page.close();
 }}finally{await browser.close();}
 fs.writeFileSync(process.env.CROSS_ERA_REPORT||'/tmp/cross-era-background-browser.json',JSON.stringify({passed:true,reports},null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
