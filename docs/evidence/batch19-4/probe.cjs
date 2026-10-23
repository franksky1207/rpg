const {chromium}=require('playwright');
const fs=require('node:fs');
const assert=require('node:assert/strict');
// Baseline defect probe, NOT repaired-behavior acceptance. Uses disposable local auth.
// Serve repository on localhost; provide playwright with NODE_PATH if already installed.
const sdk=`window.supabase={createClient(){return{auth:{onAuthStateChange(){return{data:{subscription:{unsubscribe(){}}}}},async getSession(){return{data:{session:{user:{id:'batch194-audit'}}},error:null}}},from(){return{select(){return this},eq(){return this},single(){return Promise.resolve({data:null,error:null})}}}}}};`;
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
 page.on('pageerror',e=>errors.push(String(e)));
 await page.route('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js',r=>r.fulfill({contentType:'text/javascript',body:sdk}));
 await page.addInitScript(()=>localStorage.setItem('civilization-war-presentation-mode-v1:batch194-audit','text'));
 await page.goto(process.env.RUNTIME_SMOKE_URL||'http://127.0.0.1:4173/index.html');
 await page.waitForFunction(()=>window.CivilizationStartupCoordinator?.snapshot().status==='ready',null,{timeout:60000});
 await page.locator('#civilizationStoryModal.open').waitFor({state:'visible'});
 const actions=page.locator('#civilizationStoryModal #storyActions');
 for(let i=0;i<100;i++){
  const end=actions.getByRole('button',{name:'結束',exact:true});
  if(await end.count()){
   await end.click();await page.locator('#civilizationStarterGearModal').getByRole('button',{name:'領取裝備',exact:true}).click();
   await page.locator('#gameIntroModal').getByRole('button',{name:'踏上征途',exact:true}).click();break;
  }
  await actions.getByRole('button',{name:'下一頁',exact:true}).click();
 }
 await page.evaluate(()=>ensureCivilizationScriptGroup('integrity'));
 const result=await page.evaluate(async()=>{
  const metrics=[];
  function replay(r){let hp=r.enemyStartHp;const index=new Float64Array(r.events.length);for(let i=0;i<r.events.length;i++){const e=r.events[i];if(e.type==='attack'&&e.target==='enemy')hp=Math.max(0,hp-e.actualDamage);if(e.type==='drain'&&e.actor==='enemy')hp=Math.min(r.enemyHealCap,hp+e.healed);if(e.type==='mark'&&e.mark==='absorption'&&e.owner==='enemy')hp=Math.min(r.enemyHealCap,hp+e.healed);if(e.type==='mark'&&e.mark==='backlash'&&e.target==='enemy')hp=Math.max(0,hp-e.actualDamage);index[i]=hp;}return {hp,indexBytes:index.byteLength};}
  for(const turns of [10,1000,10000]){
   const begin=performance.now();
   const r=runCombatCore({hp:1e12,atk:1,def:0,crit:0,dodge:0},{name:'resource probe',hp:1.1e9,atk:1,def:0,crit:0,dodge:0},1e12,{maxTurns:turns,rng:()=>.99,logs:true,preparePresentation:false});
   const coreMs=performance.now()-begin,t=performance.now(),rebuilt=replay(r),indexMs=performance.now()-t;
   metrics.push({turns:r.turns,events:r.events.length,coreMs,eventBytes:new TextEncoder().encode(JSON.stringify(r.events)).length,logBytes:new TextEncoder().encode(JSON.stringify(r.logs)).length,indexBytes:rebuilt.indexBytes,indexMs,enemyHp:r.enemyHp,reconstructedHp:rebuilt.hp,actionBudgetReached:r.actionBudgetReached});
  }
  const effects={ward:{active:true,activationChance:100,shieldMaxHpPercent:20},absorption:{active:true,triggerChance:40,healOriginalDamagePercent:25},backlash:{active:true,triggerChance:80,reflectActualHpLossPercent:30},indomitable:{active:true,activationChance:100}};
  const replayChecks=[];
  for(let seed=1;seed<=100;seed++){let n=seed;const rng=()=>((n=(n*1664525+1013904223)>>>0)/4294967296);const r=runCombatCore({hp:10000,atk:117,def:10,crit:20,dodge:10},{name:'heal/shield/absorption',hp:5000,atk:100,def:20,crit:20,dodge:10},10000,{enemyStartHp:4000,enemyHealCap:4000,enemyEffectProfile:effects,enemyAbilityProfile:{drainRate:80,comboRate:20,counterRate:20},rng,maxTurns:100,preparePresentation:false});const p=replay(r);replayChecks.push({seed,actual:r.enemyHp,rebuilt:p.hp,effects:[...new Set(r.events.filter(e=>e.type==='mark').map(e=>e.mark))],drain:r.events.some(e=>e.type==='drain'&&e.actor==='enemy')});}
  state=newState();state.level=1000;state.secondWorld.entered=true;state.secondWorld.civilizationLevel=10;state.thirdWorld=createBlankThirdWorldState();state.thirdWorld.entered=true;state.thirdWorld.entryVersion=2;state.thirdWorld.story.unlockedStage=2;ensureCivilizationCalamityState();
  const saves=[];
  for(let i=0;i<10;i++){const t=performance.now(),ok=save(false);saves.push({ok,ms:performance.now()-t});}
  const cursorProbe=runCombatCore({hp:1000,atk:10,def:0,crit:0,dodge:0},{name:'cursor probe',hp:100,atk:1,def:0,crit:0,dodge:0},1000,{maxTurns:1,rng:()=>.99,preparePresentation:true});
  const cursorDuringWait=[];
  await animateStructuredCombatPresentation(cursorProbe,{sleep:async ms=>{const p=getCombatPresentationSnapshot();cursorDuringWait.push({ms,index:p?.index,hp:p?.enemyHp});if(p?.index===1)clearCombatPresentation('audit-cancel-in-flight');}});
  const clearResolvedNormally=true;
  window.playerCombatStats=()=>({hp:1e12,atk:1e8,def:1e12,crit:0,dodge:0});state.hp=1e12;
  const pending=runThirdWorldBossCombat(0,{rng:()=>.99,preparePresentation:false});
  const initialHp=state.thirdWorld.bosses[0].currentHp;
  state.thirdWorld.bosses[0].currentHp=initialHp-100;
  const staleAfterHpCheckpoint=settleThirdWorldCombatResult(pending);
  state.thirdWorld.bosses[0].currentHp=initialHp;
  const before=thirdWorldBossProgressSnapshot(0,state);
  state.reincarnation.count=1;state.specializations.drain=60;
  window.playerCombatStats=()=>({hp:1e12,atk:1e7,def:0,crit:0,dodge:0});
  Math.random=()=>.29;gmSetBackgroundBattlePreference(false);gmSetMainlineHpLockPreference(false);view='adventure';setAdventureEraView('higher');state.hp=1e12;render();
  const originalBossCombat=window.runThirdWorldBossCombat;let actualCombatMetrics;
  window.runThirdWorldBossCombat=function(...args){const start=performance.now(),r=originalBossCombat(...args),ms=performance.now()-start;actualCombatMetrics={ms,turns:r.turns,eventCount:r.events.length,eventBytes:new TextEncoder().encode(JSON.stringify(r.events)).length,logBytes:new TextEncoder().encode(JSON.stringify(r.logs)).length,candidateDenseIndexBytes:r.events.length*8,playerDrains:r.events.filter(e=>e.type==='drain'&&e.actor==='player'&&e.healed>0).length,enemyDrains:r.events.filter(e=>e.type==='drain'&&e.actor==='enemy'&&e.healed>0).length,completed:r.combatCompleted,actionSafetyReached:r.actionSafetyReached};return r;};
  window.__flow=startThirdWorldPlayerFlow(0);
  await new Promise(r=>setTimeout(r,300));
  const after=thirdWorldBossProgressSnapshot(0,state),p=getCombatPresentationSnapshot(),run=thirdWorldContinuousRunSnapshot();
  Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});Object.defineProperty(document,'visibilityState',{configurable:true,get:()=>'hidden'});document.dispatchEvent(new Event('visibilitychange'));window.dispatchEvent(new Event('blur'));
  await new Promise(r=>setTimeout(r,100));
  return {metrics,replayChecks,saves,cursorDuringWait,clearResolvedNormally,staleAfterHpCheckpoint,actualCombatMetrics,heap:performance.memory?{used:performance.memory.usedJSHeapSize,total:performance.memory.totalJSHeapSize,limit:performance.memory.jsHeapSizeLimit}:null,reproduction:{before,after,presentation:p,run,hiddenProgress:thirdWorldBossProgressSnapshot(0,state),hiddenPresentation:getCombatPresentationSnapshot()},fixture:{disposableAuth:true,viewport:'390x844',realIPhone:false,gmBackground:gmBackgroundBattleEnabled(),hpLock:gmMainlineHpLockEnabled()}};
 });
 assert.deepEqual(errors,[]);
 assert.equal(result.replayChecks.filter(x=>x.actual!==x.rebuilt).length,0);
 assert.equal(result.staleAfterHpCheckpoint.code,'stale-settlement');
 assert.equal(result.reproduction.before.currentHp,1100000000);
 assert.equal(result.reproduction.after.currentHp,0,'baseline defect: precommitted entire battle');
 assert.ok(result.reproduction.presentation.enemyHp>0,'baseline presentation is incomplete');
 assert.equal(result.fixture.gmBackground,false);assert.equal(result.fixture.hpLock,false);
 assert.ok(result.actualCombatMetrics.playerDrains>0);
 assert.equal(result.actualCombatMetrics.actionSafetyReached,false);
 fs.writeFileSync(process.env.PROBE_OUTPUT||'work/19-4/probe.json',JSON.stringify({result,errors},null,2));
 console.log(JSON.stringify({metrics:result.metrics,replayMismatches:result.replayChecks.filter(x=>x.actual!==x.rebuilt),reproduction:result.reproduction,heap:result.heap,errors},null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
