const {chromium}=require('playwright');
const fs=require('node:fs');
const {finishIntro}=require('../equipment-formal/helpers.cjs');
const assert=require('node:assert/strict');
// Formal foreground interruption acceptance using a disposable local auth fixture.
// Serve repository on localhost; provide playwright with NODE_PATH if already installed.
const sdk=`window.supabase={createClient(){return{auth:{onAuthStateChange(){return{data:{subscription:{unsubscribe(){}}}}},async getSession(){return{data:{session:{user:{id:'batch194-audit'}}},error:null}}},from(){return{select(){return this},eq(){return this},single(){return Promise.resolve({data:null,error:null})}}}}}};`;
const testUrl=new URL(process.env.RUNTIME_SMOKE_URL||'http://127.0.0.1:4173/index.html');testUrl.searchParams.set('production','1');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE||(fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined),headless:true,args:['--no-sandbox']});
 try{
 const testContext=await browser.newContext({viewport:{width:390,height:844}});const page=await testContext.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(String(e)));
 await page.route('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js',r=>r.fulfill({contentType:'text/javascript',body:sdk}));
 await page.addInitScript(()=>localStorage.setItem('civilization-war-presentation-mode-v1:batch194-audit','text'));
 await page.goto(testUrl.href);
 await page.waitForFunction(()=>window.CivilizationStartupCoordinator?.snapshot().status==='ready',null,{timeout:60000});
 await finishIntro(page);

 const before=await page.evaluate(()=>{
  state=newState();state.introSeen=true;state.level=1000;state.secondWorld.entered=true;state.secondWorld.civilizationLevel=10;state.thirdWorld=createBlankThirdWorldState();state.thirdWorld.entered=true;state.thirdWorld.entryVersion=2;state.thirdWorld.story.unlockedStage=2;state.reincarnation.count=1;
  window.playerCombatStats=()=>({hp:1e12,atk:1e7,def:1e12,crit:0,dodge:0});state.hp=1e12;Math.random=()=>.99;gmSetBackgroundBattlePreference(false);gmSetMainlineHpLockPreference(false);view='adventure';setAdventureEraView('higher');render();window.__run=startThirdWorldPlayerFlow(0);return true;
 });
 await page.waitForFunction(()=>state.thirdWorld.bosses[0].rewardFloorHp!=null&&state.thirdWorld.bosses[0].currentHp>0,null,{timeout:15000});
 const committed=await page.evaluate(()=>({hp:state.thirdWorld.bosses[0].currentHp,floor:state.thirdWorld.bosses[0].rewardFloorHp,strings:state.thirdWorld.dimensionalStrings,level:state.level,exp:state.exp}));
 assert.ok(committed.hp>0&&committed.hp<1100000000);assert.equal(committed.strings,1100000000-committed.floor);
 const context=page.context(),cdp=await context.newCDPSession(page),crashed=page.waitForEvent('crash');
 cdp.send('Page.crash').catch(()=>{});await crashed;
 const restored=await context.newPage();restored.on('console',m=>{if(m.type()==='error')console.error(m.text());});restored.on('pageerror',e=>{errors.push(String(e));console.error('PAGE',e);});await restored.route('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js',r=>r.fulfill({contentType:'text/javascript',body:sdk}));
 await restored.goto(testUrl.href);await restored.waitForFunction(()=>CivilizationStartupCoordinator.snapshot().status==='ready',null,{timeout:60000});
 const loaded=await restored.evaluate(()=>({hp:state.thirdWorld.bosses[0].currentHp,floor:state.thirdWorld.bosses[0].rewardFloorHp,strings:state.thirdWorld.dimensionalStrings,level:state.level,exp:state.exp}));
 assert.deepEqual(loaded,committed,'renderer crash restores last successful checkpoint without a departure save');
 const mirrorStart=await restored.evaluate(()=>{
  state=newState();state.introSeen=true;state.level=500;state.hp=1000;window.playerCombatStats=()=>({hp:1000,atk:100,def:0,crit:0,dodge:0});state.specializations.combo=0;state.specializations.drain=0;Math.random=()=>.5;gmSetBackgroundBattlePreference(false);view='home';render();return startMirrorCombatRun();
 });assert.equal(mirrorStart,true);
 await restored.waitForFunction(()=>state.dungeon.mirror.daily.wins+state.dungeon.mirror.daily.losses>=1&&CivilizationCombatLifecycle.snapshot(),null,{timeout:15000}).catch(async error=>{console.error(await restored.evaluate(()=>({visibility:document.visibilityState,focused:document.hasFocus(),daily:state.dungeon.mirror.daily,run:getMirrorDungeonActiveRun(),lifetime:CivilizationCombatLifecycle.snapshot()})));throw error;});
 const first=await restored.evaluate(()=>{const d=state.dungeon.mirror.daily;Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});Object.defineProperty(document,'visibilityState',{configurable:true,get:()=>'hidden'});document.dispatchEvent(new Event('visibilitychange'));return {wins:d.wins,losses:d.losses,startedAt:d.startedAt,vip:state.vipPoints};});
 await restored.waitForFunction(()=>!CivilizationCombatLifecycle.snapshot());assert.equal(first.wins+first.losses,1);
 await restored.reload();await restored.waitForFunction(()=>CivilizationStartupCoordinator.snapshot().status==='ready',null,{timeout:60000});
 const mirrorRecovery=await restored.evaluate(()=>{const d=state.dungeon.mirror.daily,info=mirrorDungeonStatus();window.playerCombatStats=()=>({hp:1000,atk:100,def:0,crit:0,dodge:0});Math.random=()=>.5;return {wins:d.wins,losses:d.losses,startedAt:d.startedAt,vip:state.vipPoints,resumable:info.resumable,resumed:startMirrorCombatRun()};});
 assert.equal(mirrorRecovery.wins,first.wins);assert.equal(mirrorRecovery.losses,first.losses);assert.equal(mirrorRecovery.startedAt,first.startedAt);assert.equal(mirrorRecovery.vip,first.vip);assert.equal(mirrorRecovery.resumable,true);assert.equal(mirrorRecovery.resumed,true);
 await restored.waitForFunction(()=>!!CivilizationCombatLifecycle.snapshot());await restored.evaluate(()=>{Object.defineProperty(document,'visibilityState',{configurable:true,get:()=>'hidden'});document.dispatchEvent(new Event('visibilitychange'));});await restored.waitForFunction(()=>!CivilizationCombatLifecycle.snapshot());
 const schema=await restored.evaluate(()=>{
  const legacy=newState();legacy.saveVersion=17;legacy.level=200;legacy.gold=12345;const raw=JSON.stringify(legacy),key=typeof SAVE_KEY==='string'?SAVE_KEY:'frank_text_rpg_save';localStorage.removeItem(key+'.pre-schema18-backup-v1');localStorage.setItem(key,raw);const ok=load();return {ok,version:state.saveVersion,gold:state.gold,backupExact:localStorage.getItem(key+'.pre-schema18-backup-v1')===raw,future:saveCompatibilityFor({saveVersion:19}).isFuture};
 });assert.equal(schema.ok,true);assert.equal(schema.version,18);assert.equal(schema.gold,12345);assert.equal(schema.backupExact,true);assert.equal(schema.future,true);
 const raceCases=[];
 for(const type of ['near-win','near-loss','complete']){
  const seeded=await restored.evaluate(type=>{
   Object.defineProperty(document,'visibilityState',{configurable:true,get:()=>'visible'});Object.defineProperty(document,'hidden',{configurable:true,get:()=>false});document.dispatchEvent(new Event('visibilitychange'));window.dispatchEvent(new Event('focus'));closeBattleResultModal();
   state=newState();state.introSeen=true;state.level=1;state.gold=777;Math.random=()=>type==='near-loss'?.1:.99;state.equipment.weapon=makeItem(1,0,'normal',0,'weapon');const weapon=state.equipment.weapon.id;
   window.playerCombatStats=()=>({hp:type==='near-loss'?1:1000,atk:type==='near-loss'?1:1000,def:0,crit:0,dodge:0});state.hp=playerCombatStats().hp;gmSetBackgroundBattlePreference(false);gmSetMainlineHpLockPreference(false);
   const play=window.__raceOriginalPlay||window.animateStructuredCombatPresentation;window.__raceOriginalPlay=play;window.__race=null;
   window.animateStructuredCombatPresentation=(r,options={})=>play(r,{...options,sleep:async ms=>{
    const p=getCombatPresentationSnapshot();if(type!=='complete'&&!__race&&p?.index===p?.eventCount&&p.playerHp>0&&p.enemyHp>0){__race={index:p.index,eventCount:p.eventCount,calculatedWin:r.win,enemyHp:p.enemyHp,playerHp:p.playerHp};Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});Object.defineProperty(document,'visibilityState',{configurable:true,get:()=>'hidden'});document.dispatchEvent(new Event('visibilitychange'));return;}
    await new Promise(resolve=>setTimeout(resolve,ms));
   }});
   view='adventure';setAdventureEraView('galaxy');selectedMap=0;selectedEnemy=0;selectedBattleCount=1;adventureScreen='prepare';clearPreparedFirstWorldTargetContext();prepareFirstWorldTargetContextFromSelection();render();startBattles();return {weapon};
  },type);
  await restored.waitForFunction(()=>!battleBusy&&(!CivilizationCombatLifecycle.snapshot()),null,{timeout:10000});
  const outcome=await restored.evaluate(()=>({race:__race,gold:state.gold,progress:state.mapProgress[0][0],weapon:state.equipment.weapon?.id,lost:state.lostGear.length,exp:state.exp,level:state.level}));
  if(type==='complete'){assert.equal(outcome.progress,1);assert.ok(outcome.gold>777);}
  else{assert.ok(outcome.race);assert.equal(outcome.race.calculatedWin,type==='near-win');assert.equal(outcome.progress,0);assert.equal(outcome.gold,777);assert.equal(outcome.weapon,seeded.weapon);assert.equal(outcome.lost,0);}
  raceCases.push({type,...outcome});
 }
 assert.deepEqual(errors,[]);
 fs.writeFileSync(process.env.FOREGROUND_REPORT||'/tmp/foreground-combat-recovery.json',JSON.stringify({rendererCrash:{committed,loaded},mirror:{first,mirrorRecovery},schema,raceCases,realIPhone:false},null,2));console.log('PASS crash recovery, mirror completed-battle isolation, and Schema18 exact backup');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
