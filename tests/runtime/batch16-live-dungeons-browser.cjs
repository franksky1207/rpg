'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
const {sdk,finishIntro}=require('../equipment-formal/helpers.cjs'),base=process.env.RUNTIME_SMOKE_URL||'http://127.0.0.1:4173/index.html';
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||(fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined),args:['--no-sandbox']}),rows=[];
try{for(const world of [1,2])for(const mode of ['bounty','arena','void','mirror']){
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(String(e)));
 await page.route('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js',r=>r.fulfill({contentType:'text/javascript',body:sdk}));
 await page.goto(base);await page.waitForFunction(()=>window.CivilizationStartupCoordinator?.snapshot().status==='ready',null,{timeout:60000});await finishIntro(page);
 await page.evaluate(({world,mode})=>{
  state=newState();state.introSeen=true;state.storyProgress={pendingStory:null,completedStories:['earth-prologue'],introCompleted:true,starterGearReceived:true};state.playerName='第16批測試者';state.level=world===2?600:50;state.secondWorld.entered=world===2;state.hp=1000;
  window.playerCombatStats=()=>({hp:1000,atk:50,def:5,crit:0,dodge:0});// W2 arena must last long enough to observe a genuine cold-load frame.
  if(world===2&&mode==='arena')window.playerCombatStats=()=>({hp:10000,atk:1000,def:500,crit:0,dodge:0});Math.random=()=>.5;window.effectiveCombatSpeed=()=>1;
  if(mode==='bounty'){enterBountyDungeon();startBountyFight(false);}
  if(mode==='arena'){openArenaDungeon();startArenaDungeon('normal');startArenaStageFight(false);}
  if(mode==='void'){enterVoidMirageDungeon();startVoidMirageChallengeUI();}
  if(mode==='mirror'){view='dungeon-mirror';render();if(!startMirrorCombatRun())throw Error('mirror-start');}
 },{world,mode});
 const proof=await page.waitForFunction(({world,mode})=>{
  const snapshot=CivilizationCombatEvents.snapshot(),enemy=document.querySelector('.formal-b-verified-monster');
  if(!enemy||getComputedStyle(enemy).visibility==='hidden')return false;
  const player=document.querySelector('.formal-b-player-sprite'),stage=enemy.closest('.formal-b-shared-stage'),p=player.getBoundingClientRect(),e=enemy.getBoundingClientRect(),b=stage.getBoundingClientRect();
  if(snapshot.mode!==mode||snapshot.world!==world)return false;
  return {world,mode,enemy:snapshot.actors.enemy,assetId:enemy.dataset.monster||null,mirror:enemy.dataset.mirror||null,player:player.dataset.suit,ratio:Number(enemy.dataset.actualRatio),stage:{width:b.width,height:b.height},distinctCanvases:stage.querySelectorAll('canvas').length};
 },{world,mode},{timeout:20000});
 const row=await proof.jsonValue();assert.ok(row.ratio>=1&&row.ratio<=1.5);assert.equal(row.distinctCanvases,3,'one player, one fallback, one verified enemy');
 if(mode==='mirror'){assert.equal(row.enemy.name,'鏡像・第16批測試者');assert.equal(row.assetId,null);assert.equal(row.mirror,row.player);}else assert.ok(row.assetId);
 await page.screenshot({path:`/tmp/batch16-live-${world}-${mode}.png`,fullPage:true});
 await page.evaluate(()=>{CivilizationFormalBEntry.dispose();CivilizationFormalBRenderer.clearSpriteCache();});
 const stats=await page.evaluate(()=>({monster:CivilizationFormalBRenderer.monsterStats(),player:CivilizationFormalBRenderer.spriteStats()}));assert.equal(stats.monster.refs,0);assert.equal(stats.player.refs,0);assert.deepEqual(errors,[]);rows.push({...row,stats,errors});console.log('PASS actual dungeon UI',world,mode);await page.close();
}}finally{fs.writeFileSync('/tmp/batch16-live.json',JSON.stringify({passed:rows.length===8,realDevice:false,rows},null,2));await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
