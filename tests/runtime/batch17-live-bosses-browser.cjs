'use strict';
const {chromium}=require('playwright'),fs=require('node:fs'),assert=require('node:assert/strict');
const {sdk,finishIntro}=require('../equipment-formal/helpers.cjs');
const base=process.env.RUNTIME_SMOKE_URL||'http://127.0.0.1:4173/index.html';
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']}),report={passed:false,rows:[],realDevice:false};
 try{for(const item of [{world:1,mode:'calamity'},{world:2,mode:'calamity'},{world:3,mode:'main'},{world:3,mode:'arena',variant:'fixed'},{world:3,mode:'arena',variant:'varied'}]){
  const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(String(e)));page.on('dialog',d=>d.dismiss());
  await page.route('**/supabase.js',r=>r.fulfill({contentType:'text/javascript',body:sdk}));
  await page.goto(base);await page.waitForFunction(()=>CivilizationStartupCoordinator?.snapshot().status==='ready',null,{timeout:60000});await finishIntro(page);
  await page.evaluate(async item=>{
   state=newState();state.introSeen=true;state.storyProgress={pendingStory:null,completedStories:['earth-prologue'],introCompleted:true,starterGearReceived:true};state.playerName='第17批驗收';state.level=item.world===1?500:item.world===2?1000:1100;
   state.bossKilled=state.bossKilled.map(()=>true);state.unlockedMap=100;state.mapProgress.forEach(r=>r.fill(10));
   if(item.world>=2){state.secondWorld.entered=true;state.secondWorld.civilizationLevel=item.world===3?10:0;state.secondWorld.mainline.bossKilled.fill(true);}
   if(item.world===3){state.thirdWorld=createBlankThirdWorldState();state.thirdWorld.entered=true;state.thirdWorld.entryVersion=2;state.thirdWorld.story.unlockedStage=2;state.reincarnation.count=1;}
   window.playerCombatStats=()=>({hp:1000000,atk:1000,def:500,crit:0,dodge:0});state.hp=1000000;Math.random=()=>.5;window.effectiveCombatSpeed=()=>1;
   view='home';render();await CivilizationFormalBRenderer.warmSprites();
   if(item.mode==='calamity'){
    const d=item.world===1?getCivilizationCalamityDefinitions()[0]:getSecondWorldCalamityDefinitions()[0];view='calamity';render();
    if(!(item.world===1?startCivilizationCalamityUI(d.id,'single'):startSecondWorldCalamityUI(d.id,'single')))throw Error('calamity entry rejected');
   }else if(item.mode==='arena'){openArenaDungeon();if(!startThirdWorldArenaUi(item.variant,1))throw Error('arena entry rejected');}
   else {view='adventure';setAdventureEraView('higher');render();void startThirdWorldRunFromPlayerUi(0);}
  },item);
  const proof=await page.waitForFunction(item=>{
   const snap=CivilizationCombatEvents.snapshot(),c=document.querySelector('.formal-b-verified-monster');
   if(snap?.world!==item.world||snap.mode!==item.mode||!c||getComputedStyle(c).visibility==='hidden')return false;
   const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;if(!d.some((v,i)=>i%4===3&&v>16))return false;
   return {enemy:snap.actors.enemy,world:snap.world,mode:snap.mode,assetId:c.dataset.monster,ratio:Number(c.dataset.actualRatio),stage:c.closest('.formal-b-shared-stage').getBoundingClientRect().toJSON()};
  },item,{timeout:30000});
  const row=await proof.jsonValue();assert.ok(row.assetId);assert.ok(row.enemy.id);assert.ok(row.ratio>=1.5&&row.ratio<=2);
  await page.screenshot({path:`/tmp/batch17-live-${item.world}-${item.mode}-${item.variant||'boss'}.png`,fullPage:true});
  await page.evaluate(()=>{CivilizationFormalBEntry.dispose();CivilizationFormalBRenderer.clearSpriteCache();});
  const stats=await page.evaluate(()=>({monster:CivilizationFormalBRenderer.monsterStats(),player:CivilizationFormalBRenderer.spriteStats()}));assert.equal(stats.monster.refs,0);assert.equal(stats.player.refs,0);assert.deepEqual(errors,[]);
  report.rows.push({...item,...row,stats,errors});console.log('PASS live entry',item);await page.close();
 }report.passed=report.rows.length===5;
 }finally{fs.writeFileSync('/tmp/batch17-live.json',JSON.stringify(report,null,2));await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
