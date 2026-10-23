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
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
 page.on('pageerror',e=>errors.push(String(e)));
 await page.route('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js',r=>r.fulfill({contentType:'text/javascript',body:sdk}));
 await page.addInitScript(()=>localStorage.setItem('civilization-war-presentation-mode-v1:batch194-audit','text'));
 await page.goto(testUrl.href);
 await page.waitForFunction(()=>window.CivilizationStartupCoordinator?.snapshot().status==='ready',null,{timeout:60000});
 await finishIntro(page);

 const result=await page.evaluate(async()=>{
  state=newState();state.level=1000;state.secondWorld.entered=true;state.secondWorld.civilizationLevel=10;state.thirdWorld=createBlankThirdWorldState();state.thirdWorld.entered=true;state.thirdWorld.entryVersion=2;state.thirdWorld.story.unlockedStage=2;state.reincarnation.count=1;
  state.specializations.drain=60;window.playerCombatStats=()=>({hp:1e12,atk:1e7,def:0,crit:0,dodge:0});state.hp=1e12;
  gmSetBackgroundBattlePreference(false);gmSetMainlineHpLockPreference(false);let seed=1;Math.random=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);view='adventure';setAdventureEraView('higher');render();
  const start=thirdWorldBossProgressSnapshot(0,state).currentHp,stringsBefore=state.thirdWorld.dimensionalStrings;
  let playedPlayerDrains=0;const originalPlay=window.animateStructuredCombatPresentation;window.animateStructuredCombatPresentation=(r,options={})=>originalPlay(r,{...options,onUpdate:(snap,e)=>{if(e?.type==="drain"&&e.actor==="player"&&e.healed>0)playedPlayerDrains++;options.onUpdate?.(snap,e);}});
  window.__run=startThirdWorldPlayerFlow(0);window.__run.catch(e=>console.error('flow error',String(e)));
  const waitUntil=async test=>{for(let i=0;i<300;i++){if(test())return;await new Promise(r=>setTimeout(r,20));}throw Error('probe timeout '+JSON.stringify({p:getCombatPresentationSnapshot(),rt:thirdWorldContinuousRunSnapshot(),ctx:getThirdWorldPlayerFlowContext(),story:state.thirdWorld.story}));};
  await waitUntil(()=>playedPlayerDrains>0&&getCombatPresentationSnapshot()?.enemyHp<start);
  const playing=getCombatPresentationSnapshot(),before=thirdWorldBossProgressSnapshot(0,state).currentHp;
  Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});Object.defineProperty(document,'visibilityState',{configurable:true,get:()=>'hidden'});document.dispatchEvent(new Event('visibilitychange'));
  await waitUntil(()=>!thirdWorldContinuousRunSnapshot().active);
  const after=thirdWorldBossProgressSnapshot(0,state).currentHp,strings=state.thirdWorld.dimensionalStrings-stringsBefore;
  Object.defineProperty(document,'hidden',{configurable:true,get:()=>false});Object.defineProperty(document,'visibilityState',{configurable:true,get:()=>'visible'});document.dispatchEvent(new Event('visibilitychange'));window.dispatchEvent(new Event('focus'));
  return {start,playing,before,after,strings,playedPlayerDrains,boss:state.thirdWorld.bosses[0],ctx:getThirdWorldPlayerFlowContext(),runtime:thirdWorldContinuousRunSnapshot()};
 });
 assert.ok(result.playedPlayerDrains>0);assert.deepEqual(errors,[]);assert.equal(result.before,result.start);assert.ok(result.after>0&&result.after<result.start);assert.equal(result.after,result.playing.enemyHp);assert.equal(result.strings,result.start-result.after);assert.equal(result.runtime.active,false);
 const ledger=await page.evaluate(()=>{
  state=newState();state.level=1000;state.secondWorld.entered=true;state.secondWorld.civilizationLevel=10;state.thirdWorld=createBlankThirdWorldState();state.thirdWorld.entered=true;state.thirdWorld.entryVersion=2;state.thirdWorld.story.unlockedStage=2;
  window.playerCombatStats=()=>({hp:1e12,atk:1e7,def:1e12,crit:0,dodge:0});state.hp=1e12;
  const r=runThirdWorldBossCombat(0,{rng:()=>.99,preparePresentation:false}),start=r.formalStartHp,base=state.thirdWorld.dimensionalStrings;
  const checks=[];const cp=(hp,index)=>{const x=checkpointThirdWorldCombat(r,hp,index);checks.push({hp,index,ok:x.ok,xp:x.xp,strings:state.thirdWorld.dimensionalStrings-base,stored:state.thirdWorld.bosses[0].currentHp});return x;};
  cp(start-100,1);cp(start-50,2);cp(start-90,3);cp(start-200,4);
  const encoded=JSON.stringify(state),beforeFailure=JSON.stringify(state),oldSave=save;
  save=window.save=()=>false;const failed=cp(start-300,5);save=window.save=oldSave;const rolledBack=JSON.stringify(state)===beforeFailure;
  state=JSON.parse(encoded);normalizeThirdWorldState(state);const retained=state.thirdWorld.bosses[0].rewardFloorHp===start-200;
  const backwards=checkpointThirdWorldCombat(r,start-500,2),badHp=checkpointThirdWorldCombat(r,start+1,6);
  state.thirdWorld.bosses[0].currentHp=start-201;const stale=settleThirdWorldCombatResult(r);state.thirdWorld.bosses[0].currentHp=start-200;
  const final=settleThirdWorldCombatResult(r),duplicate=settleThirdWorldCombatResult(r);
  return {checks,rolledBack,failed:failed.ok,retained,backwards:backwards.ok,badHp:badHp.ok,stale:stale.code,final:{ok:final.ok,xp:final.xp,strings:final.dimensionalStrings,newlyCreditedXp:final.newlyCreditedXp,checkpointCreditedXp:final.checkpointCreditedXp},duplicate:duplicate.code,total:state.thirdWorld.dimensionalStrings-base,start,finalHp:state.thirdWorld.bosses[0].currentHp};
 });
 assert.deepEqual(ledger.checks.slice(0,4).map(x=>x.xp),[100,0,0,100]);assert.equal(ledger.rolledBack,true);assert.equal(ledger.failed,false);assert.equal(ledger.retained,true);assert.equal(ledger.backwards,false);assert.equal(ledger.badHp,false);assert.equal(ledger.stale,'stale-settlement');assert.equal(ledger.final.ok,true);assert.equal(ledger.final.xp,ledger.start);assert.equal(ledger.final.strings,ledger.start);assert.equal(ledger.final.checkpointCreditedXp,200);assert.equal(ledger.final.newlyCreditedXp,ledger.start-200);assert.equal(ledger.duplicate,'duplicate-result');assert.equal(ledger.total,ledger.start);assert.equal(ledger.finalHp,0);
 const performanceReport=await page.evaluate(()=>{
  const battles=[];
  for(const count of [10,1000,10000]){const t=performance.now(),r=runCombatCore({hp:1e12,atk:1,def:0,crit:0,dodge:0},{name:'resource probe',hp:1.1e9,atk:1,def:0,crit:0,dodge:0},1e12,{logs:true,preparePresentation:false,maxTurns:count,rng:()=>.99}),coreMs=performance.now()-t;battles.push({turns:r.turns,events:r.events.length,coreMs,eventBytes:new TextEncoder().encode(JSON.stringify(r.events)).length,logBytes:new TextEncoder().encode(JSON.stringify(r.logs)).length,addedHpIndexBytes:0});}
  state=newState();state.level=1000;state.secondWorld.entered=true;state.secondWorld.civilizationLevel=10;state.thirdWorld=createBlankThirdWorldState();state.thirdWorld.entered=true;state.thirdWorld.entryVersion=2;
  const r=runThirdWorldBossCombat(0,{rng:()=>.99,preparePresentation:false}),beforeBytes=new TextEncoder().encode(JSON.stringify(state)).length,checkpoints=[];
  for(let i=1;i<=10;i++){const t=performance.now(),cp=checkpointThirdWorldCombat(r,r.formalStartHp-i*100,i);if(!cp.ok)throw Error(JSON.stringify(cp));checkpoints.push(performance.now()-t);}
  const afterBytes=new TextEncoder().encode(JSON.stringify(state)).length;
  return {battles,checkpointMs:checkpoints,addedStateBytes:afterBytes-beforeBytes,frequencyMs:5000,heap:performance.memory?{used:performance.memory.usedJSHeapSize,total:performance.memory.totalJSHeapSize}:null,realIPhone:false};
 });
 const calamities=[];
 for(const world of [1,2]){
  await page.evaluate(world=>{
   state=newState();state.introSeen=true;state.level=world===1?500:600;if(world===2){state.secondWorld.entered=true;state.secondWorld.civilizationLevel=1;}
   gmSetBackgroundBattlePreference(false);gmSetMainlineHpLockPreference(false);Math.random=()=>.99;
   const def=world===1?getCivilizationCalamityDefinitions()[0]:getSecondWorldCalamityDefinitions()[1];window.__calId=def.id;
   if(world===1)state.bossKilled[def.mapIndex]=true;else state.secondWorld.mainline.bossKilled[def.bossIndex]=true;
   window.__calHp=()=>world===1?getCivilizationCalamityCurrentHp(__calId):getSecondWorldCalamityCurrentHp(__calId);
   window.__calStart=__calHp();window.playerCombatStats=()=>({hp:1e12,atk:Math.max(1,Math.floor(__calStart/50)),def:1e12,crit:0,dodge:0});state.hp=1e12;view='home';render();
   if(world===1)void startCivilizationCalamityUI(def.id,'continuous');else void startSecondWorldCalamityUI(def.id,'continuous');
  },world);
  await page.waitForFunction(()=>{const p=getCombatPresentationSnapshot();return p&&p.enemyHp>0&&p.enemyHp<__calStart;},null,{timeout:15000});
  const partial=await page.evaluate(()=>{const playing=getCombatPresentationSnapshot(),before=__calHp();Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});Object.defineProperty(document,'visibilityState',{configurable:true,get:()=>'hidden'});document.dispatchEvent(new Event('visibilitychange'));return {start:__calStart,before,played:playing.enemyHp,saved:__calHp()};});
  await page.waitForFunction(()=>!CivilizationCombatLifecycle.snapshot());assert.equal(partial.before,partial.start);assert.equal(partial.saved,partial.played);assert.ok(partial.saved>0&&partial.saved<partial.start);calamities.push({world,...partial});
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>false});Object.defineProperty(document,'visibilityState',{configurable:true,get:()=>'visible'});document.dispatchEvent(new Event('visibilitychange'));window.dispatchEvent(new Event('focus'));});
 }
 console.log(JSON.stringify({result,ledger,performanceReport,calamities},null,2));fs.writeFileSync(process.env.FOREGROUND_REPORT||'/tmp/foreground-combat-checkpoints.json',JSON.stringify({result,ledger,performanceReport,calamities},null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
