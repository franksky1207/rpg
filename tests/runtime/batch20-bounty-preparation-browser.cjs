'use strict';
const {chromium}=require('playwright'),fs=require('node:fs'),assert=require('node:assert/strict'),{sdk,finishIntro}=require('../equipment-formal/helpers.cjs');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||(fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined),args:['--no-sandbox']}),rows=[];
 try{for(const world of [1,2]){
  const page=await browser.newPage({viewport:{width:390,height:844}});await page.route('**/supabase.js',r=>r.fulfill({contentType:'text/javascript',body:sdk}));await page.goto(process.env.RUNTIME_SMOKE_URL||'http://127.0.0.1:4173/');await page.waitForFunction(()=>window.CivilizationStartupCoordinator?.snapshot().status==='ready');await finishIntro(page);
  await page.evaluate(world=>{
   state=newState();state.introSeen=true;state.storyProgress={pendingStory:null,completedStories:['earth-prologue'],introCompleted:true,starterGearReceived:true};state.playerName='補修連戰測試者';state.level=world===2?600:50;state.secondWorld.entered=world===2;state.hp=100000;window.playerCombatStats=()=>({hp:100000,atk:100000,def:10000,crit:0,dodge:0});window.equippedStats=()=>({hp:1000,atk:50,def:5,crit:0,dodge:0});Math.random=()=>.01;window.effectiveCombatSpeed=()=>20;
   const original=CivilizationFormalBRenderer;window.__prepared=[];window.CivilizationFormalBRenderer={...original,prepareMonsterVisual(identity,options){if(identity.mode==='bounty'&&options?.priority==='next')window.__prepared.push({identity,snapshot:getBountyTestSnapshot()});return original.prepareMonsterVisual(identity,options);}};
   enterBountyDungeon();
  },world);
  await page.bringToFront();await page.getByRole('button',{name:'連續挑戰',exact:true}).click();
  await page.waitForFunction(()=>window.__prepared.length>0,null,{timeout:60000}).catch(async e=>{console.error(await page.evaluate(()=>({snapshot:getBountyTestSnapshot(),busy:battleBusy,view,lifecycle:window.CivilizationCombatLifecycle?.snapshot?.()})));throw e;});const prepared=await page.evaluate(()=>window.__prepared[0]);assert.equal(prepared.identity.world,world);assert.equal(prepared.identity.name,prepared.snapshot.enemy.name);assert.equal(prepared.identity.kind,prepared.snapshot.enemy.kind);assert.equal(prepared.snapshot.phase,'transition');rows.push({world,name:prepared.identity.name,phase:prepared.snapshot.phase});await page.close();
 }console.log('PASS actual continuous bounty owner prepares already chosen next enemy during transition in both eras',rows);fs.writeFileSync('/tmp/batch20-bounty-preparation.json',JSON.stringify({passed:true,realDevice:false,rows},null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
