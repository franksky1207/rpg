"use strict";
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
const base=process.env.RUNTIME_SMOKE_URL||'http://127.0.0.1:4173/index.html';
const sdk=`window.supabase={createClient(){return{auth:{onAuthStateChange(){return{data:{subscription:{unsubscribe(){}}}}},async getSession(){return{data:{session:{user:{id:'t1c-owner-test'}}},error:null}}},from(){return{select(){return this},eq(){return this},single(){return Promise.resolve({data:null,error:null})}}}}}};`;
async function intro(page){await page.locator('#civilizationStoryModal.open').waitFor({state:'visible',timeout:60000});const actions=page.locator('#civilizationStoryModal #storyActions');for(let i=0;i<100;i++){const end=actions.getByRole('button',{name:'結束',exact:true});if(await end.count()){await end.click();await page.locator('#civilizationStarterGearModal').getByRole('button',{name:'領取裝備',exact:true}).click();await page.locator('#gameIntroModal').getByRole('button',{name:'踏上征途',exact:true}).click();return;}await actions.getByRole('button',{name:'下一頁',exact:true}).click();}throw Error('Intro not completed');}
(async()=>{
 const browser=await chromium.launch({headless:true}),reports=[];
 try{
 for(const viewport of [{width:1280,height:800},{width:390,height:844}]){
 const context=await browser.newContext({viewport}),page=await context.newPage(),errors=[],modelRequests=[];
 await context.route('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js',r=>r.fulfill({contentType:'text/javascript',body:sdk}));
 await page.addInitScript(()=>{const fixed=Date.now();Date.now=()=>fixed;localStorage.setItem('civilization-war-presentation-mode-v1:t1c-owner-test','text');});
 page.on('pageerror',e=>errors.push(String(e)));page.on('request',r=>{if(/\.glb|babylon\.js/.test(r.url()))modelRequests.push(r.url());});
 await page.goto(base,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>CivilizationStartupCoordinator.snapshot().status==='ready',null,{timeout:60000});await intro(page);
 const report=await page.evaluate(async()=>{
  const bridge=CivilizationCombatEvents,realStats=window.playerCombatStats,initial=JSON.stringify(state),seen=[],subscriptions=[];
  // Deliberately isolated numerical input fixture; official mode/core/settlement owners run unchanged.
  window.playerCombatStats=()=>({hp:1000,atk:100000,def:0,crit:0,dodge:0});
  const seedState=JSON.stringify(newState());
  const state3=()=>{state=JSON.parse(seedState);state.level=1000;state.secondWorld.entered=true;state.secondWorld.civilizationLevel=10;state.thirdWorld=createBlankThirdWorldState();state.thirdWorld.entered=true;state.thirdWorld.entryVersion=2;state.thirdWorld.story.unlockedStage=2;state.playerName='t1c fixture';state.specializations.combo=60;state.specializations.drain=60;};
  const runArena=async mode=>{
   state3();resetThirdWorldArenaRuntime();const started=startThirdWorldArenaSession(mode,1);if(!started.ok)throw Error(JSON.stringify(started));const begun=beginThirdWorldArenaRound({rng:()=>0,bossIndex:0});if(!begun.ok)throw Error(JSON.stringify(begun));const outcomes=[];
   for(let i=0;i<3;i++){
    const fight=fightThirdWorldArenaCurrentStage({deferSettlement:true,rng:()=>0,maxActions:10000});if(!fight.ok||fight.combat.stageIndex!==i||!fight.combat.win)throw Error(JSON.stringify({ok:fight.ok,stage:fight.combat?.stageIndex,win:fight.combat?.win,turns:fight.combat?.turns,enemy:fight.combat?.enemy}));
    outcomes.push(fight.combat);settleThirdWorldArenaStage(fight.combat);for(let microtask=0;microtask<100;microtask++)await Promise.resolve();
   }
   return {outcomes,state:JSON.stringify(state)};
  };
  const comparisons=[];
  for(const mode of ['fixed','varied']){
   window.CivilizationCombatEvents=undefined;const baseline=await runArena(mode);window.CivilizationCombatEvents=bridge;
   subscriptions.push(bridge.subscribe(e=>seen.push({id:e.battleId,type:e.type,mode:e.mode,world:e.world,location:e.data?.context?.location,variant:e.data?.context?.variant})));
   subscriptions.push(bridge.subscribe(()=>{throw Error('owner renderer failure');}));
   const attached=await runArena(mode);
   if(JSON.stringify(attached)!==JSON.stringify(baseline)){
    const diffs=[];function compare(a,b,path=''){if(a&&b&&typeof a==='object'&&typeof b==='object'){for(const k of new Set([...Object.keys(a),...Object.keys(b)]))compare(a[k],b[k],path+'.'+k);}else if(a!==b&&diffs.length<10)diffs.push({path,a,b});}
    compare(baseline.outcomes,attached.outcomes,'outcomes');compare(JSON.parse(baseline.state),JSON.parse(attached.state),'state');throw Error('Arena parity differences '+JSON.stringify(diffs));
   }
   comparisons.push({mode,stages:attached.outcomes.map(r=>r.stageIndex),completeStateEqual:true});
   subscriptions.splice(0).forEach(dispose=>dispose());
  }
  const specialComparisons=[],formalRandom=Math.random;Math.random=()=>.99;
  for(const world of [1,2]){
   const setup=()=>{state=JSON.parse(seedState);state.hp=1000;state.playerName='special fixture';state.secondWorld.entered=world===2;};
   const enemy={name:'隔離特殊遭遇',kind:'special',hp:1,atk:1,def:0,crit:0,dodge:0};
   setup();window.CivilizationCombatEvents=undefined;const baseline={result:specialFightCore(enemy,{world}),state:JSON.stringify(state)};
   setup();window.CivilizationCombatEvents=bridge;const events=[];const dispose=bridge.subscribe(e=>events.push(e));
   const attached={result:specialFightCore(enemy,{world}),state:JSON.stringify(state)};
   for(let i=0;i<100;i++)await Promise.resolve();dispose();
   if(JSON.stringify(baseline)!==JSON.stringify(attached)){const diffs=[];function compare(a,b,path=''){if(a&&b&&typeof a==='object'&&typeof b==='object'){for(const k of new Set([...Object.keys(a),...Object.keys(b)]))compare(a[k],b[k],path+'.'+k);}else if(a!==b&&diffs.length<10)diffs.push({path,a,b});}compare(baseline.result,attached.result,'result');compare(JSON.parse(baseline.state),JSON.parse(attached.state),'state');throw Error('Special parity '+JSON.stringify(diffs));}
   if(!events.some(e=>e.type==='encounter'&&e.world===world&&e.actors.enemy.name===enemy.name))throw Error('Special encounter source unavailable');
   specialComparisons.push({world,completeStateEqual:true,encounterObserved:true});
  }
  Math.random=formalRandom;
  state3();state.reincarnation.count=2;
  const ids=new Set();let depths=0;
  subscriptions.push(bridge.subscribe(()=>new Promise(()=>{})));
  for(let depth=1;depth<=1000;depth++){
   state.reincarnation.alternateUniverse={unlocked:true,deepestCleared:depth-1,activeAttempt:{lifeId:2,depth,attemptId:'isolated-'+depth,traits:['strong','deadly']},lifeFailures:{lifeId:2,failures:{}}};
   const before=JSON.stringify(state),out=runAlternateUniverseCombat({preparePresentation:false,maxTurns:1,maxActions:1,rng:()=>.99}),projection=bridge.snapshot();
   if(!out.ok||projection.mode!=='alternate'||projection.world!==3||projection.actors.enemy.name!==(out.enemy.name||null)||projection.actors.enemy.location!==String(depth))throw Error('AU source identity mismatch '+depth+' '+JSON.stringify(out));
   if(JSON.stringify(state)!==before)throw Error('AU observation changed State');
   if(ids.has(projection.battleId))throw Error('Duplicate AU battle ID');ids.add(projection.battleId);depths++;
  }
  const bounded=bridge.diagnostics().queued<=bridge.limits.queue;subscriptions.splice(0).forEach(dispose=>dispose());
  window.playerCombatStats=realStats;state=JSON.parse(initial);resetThirdWorldArenaRuntime();
  return {comparisons,specialComparisons,seen,alternateIdentityFixtures:depths,uniqueBattles:ids.size,bounded,subscribersAfterDispose:bridge.diagnostics().subscribers};
 });
 assert.equal(report.alternateIdentityFixtures,1000);assert.equal(report.uniqueBattles,1000);assert.equal(report.bounded,true);assert.equal(report.subscribersAfterDispose,0);
 for(const mode of ['fixed','varied'])for(const stage of ['0','1','2'])assert.ok(report.seen.some(e=>e.type==='battle-start'&&e.variant===mode&&e.location===stage),'Missing W3 arena '+mode+' stage '+stage);
 assert.deepEqual(errors,[]);assert.deepEqual(modelRequests,[],'Bridge/consumer must not request 3D assets');reports.push({viewport,...report});console.log('PASS actual W3 fixed/varied three-stage State parity and 200x5 AU identity fixtures',viewport);
 await context.close();
 }
 fs.writeFileSync('combat-events-owner-browser-report.json',JSON.stringify({passed:true,reports},null,2)+'\n');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
