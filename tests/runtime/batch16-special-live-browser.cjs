'use strict';
const {chromium}=require('playwright'),fs=require('node:fs'),assert=require('node:assert/strict');
const {sdk,finishIntro}=require('../equipment-formal/helpers.cjs'),cases=require('./batch16-special-fixtures.cjs');
const base=process.env.RUNTIME_SMOKE_URL||'http://127.0.0.1:4173/index.html';
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||(fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined),args:['--no-sandbox']}),report={passed:false,realDevice:false,rows:[]};
 try{
  const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(String(e)));
  await page.route('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js',r=>r.fulfill({contentType:'text/javascript',body:sdk}));
  await page.goto(base);await page.waitForFunction(()=>window.CivilizationStartupCoordinator?.snapshot().status==='ready',null,{timeout:60000});await finishIntro(page);
  for(const row of cases){
   const world=row.world==='galaxy'?1:2;
   await page.evaluate(({row,world})=>{
    closeBattleResultModal();CivilizationFormalBEntry.dispose();CivilizationFormalBRenderer.clearSpriteCache();CivilizationFormalBEntry.boot();
    state=newState();state.introSeen=true;state.storyProgress={pendingStory:null,completedStories:['earth-prologue'],introCompleted:true,starterGearReceived:true};state.playerName='特殊怪驗收';state.level=world===2?600:1;state.secondWorld.entered=world===2;state.hp=1000;
    // Deterministic encounter selection only: actual enemy construction, combat, events,
    // presentation, reward, save and settlement functions remain production code.
    window.rollSpecialMonster=()=>getSpecialMonsterById(row.specialId,world);Math.random=()=>.01;
    window.effectiveCombatSpeed=()=>1;
    window.__specialInitial=JSON.parse(JSON.stringify(state));
    window.__specialContext={continuous:true,completed:0,originalCount:1,totalXp:0,totalGold:0,totalDarkMatter:0,totalDarkEnergy:0,items:[]};
    window.__specialDone=false;window.__specialError=null;
    window.__specialPromise=maybeHandleSpecialEncounter(__specialContext,{win:true,e:monsterObj(0,0)},{world,mapIndex:0,enemyIndex:0,bossIndex:0}).then(r=>{window.__specialResult=r;window.__specialDone=true;}).catch(e=>{window.__specialError=String(e);window.__specialDone=true;});
   },{row,world});
   const proof=await page.waitForFunction(({world,row})=>{
    if(window.__specialError)throw Error(window.__specialError);
    const s=CivilizationCombatEvents.snapshot(),c=document.querySelector('.formal-b-verified-monster');
    if(document.querySelector('#battleResultModal.show')||!c||s?.mode!=='special'||s.world!==world||getComputedStyle(c).visibility==='hidden')return false;
    const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;
    if(!d.some((v,i)=>i%4===3&&v>16))return false;
    return {world,id:row.specialId,name:s.actors.enemy.name,kind:s.actors.enemy.kind,location:s.actors.enemy.location,assetId:c.dataset.monster,ratio:Number(c.dataset.actualRatio),fallbackHidden:document.querySelector('.formal-b-enemy-sprite')?.style.visibility==='hidden'};
   },{world,row},{timeout:25000});
   const value=await proof.jsonValue();assert.equal(value.assetId,row.assetId);assert.equal(value.name,row.name);assert.equal(value.location,row.specialId);assert.equal(value.kind,'special');assert.equal(value.fallbackHidden,true);assert.ok(value.ratio>=.9);
   await page.screenshot({path:`/tmp/batch16-special-live-${world}-${row.specialId}.png`});
   await page.waitForFunction(()=>window.__specialDone,null,{timeout:60000});
   const settlement=await page.evaluate(()=>({error:__specialError,triggered:__specialResult?.triggered,world:__specialResult?.result?.world,win:__specialResult?.win,encounters:__specialContext.specialEncounters?.length,hp:state.hp}));
   assert.equal(settlement.error,null);assert.equal(settlement.triggered,true);assert.equal(settlement.world,world);assert.equal(settlement.encounters,1);
   await page.evaluate(()=>{CivilizationFormalBEntry.dispose();CivilizationFormalBRenderer.clearSpriteCache();CivilizationFormalBEntry.boot();});
   const stats=await page.evaluate(()=>CivilizationFormalBRenderer.monsterStats());assert.equal(stats.refs,0);assert.equal(stats.pending,0);assert.equal(stats.bytes,0);
   const suppressed=await page.evaluate(async({row,world})=>{
    const expected=__specialResult.result,summary=r=>({win:r.win,world:r.world,xp:r.xp,gold:r.gold,darkMatter:r.darkMatter,darkEnergy:r.darkEnergy,convertedGold:r.convertedGold,blackMarketIntelGranted:r.blackMarketIntelGranted,drops:r.drops.length});
    state=JSON.parse(JSON.stringify(__specialInitial));
    document.querySelector('#main').innerHTML='<p>背景進度</p>';
    window.backgroundProgressHasCatchUpCredit=()=>true;
    const result=await maybeHandleSpecialEncounter({continuous:true,items:[]},{win:true,e:monsterObj(0,0)},{world,mapIndex:0,enemyIndex:0,bossIndex:0});
    window.backgroundProgressHasCatchUpCredit=()=>false;
    return {expected:summary(expected),actual:summary(result.result),suppressed:specialEncounterPresentationSuppressed({suppressPresentation:true}),canvases:document.querySelectorAll('.formal-b-verified-monster').length,stats:CivilizationFormalBRenderer.monsterStats()};
   },{row,world});
   assert.deepEqual(suppressed.actual,suppressed.expected,'fast catch-up preserves settlement');assert.equal(suppressed.canvases,0);assert.equal(suppressed.stats.refs,0);assert.equal(suppressed.suppressed,true);
   report.rows.push({...value,settlement,stats,suppressed});console.log('PASS actual special encounter -> settlement',world,row.specialId);
  }
  assert.deepEqual(errors,[]);report.passed=report.rows.length===18;
 }finally{fs.writeFileSync('/tmp/batch16-special-live.json',JSON.stringify(report,null,2));await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
