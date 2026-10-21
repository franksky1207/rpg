'use strict';
const {chromium}=require('playwright'),fs=require('node:fs'),assert=require('node:assert/strict');
const {sdk,finishIntro}=require('../../../tests/equipment-formal/helpers.cjs');
const base=process.env.RUNTIME_SMOKE_URL||'http://127.0.0.1:4173/index.html';
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']}),report={passed:false,rows:[],realDevice:false};
 try{const records=require('../../../data/monsters/monster-mappings.json').records.filter(r=>r.status==='batch17-formal-enabled');
 const viewports=[{width:1365,height:900},{width:390,height:844},{width:844,height:390}];
 for(const viewport of viewports){const context=await browser.newContext({viewport,hasTouch:viewport.width!==1365,isMobile:viewport.width!==1365});for(const row of records){const item={world:row.world==='higher'?3:row.world==='universe'?2:1,mode:row.mode,bossId:row.bossId,bossIndex:row.bossIndex,assetId:row.assetId,name:row.name,viewport};
  const page=await context.newPage(),errors=[];await page.setViewportSize(item.viewport);await page.addInitScript(()=>localStorage.clear());page.on('pageerror',e=>errors.push(String(e)));page.on('requestfailed',r=>console.error('HTTP request failed',r.url(),r.failure()));page.on('response',r=>{if(r.status()>=400)console.error('HTTP response',r.status(),r.url());});page.on('dialog',d=>d.dismiss());
  await page.route('**/supabase.js',r=>r.fulfill({contentType:'text/javascript',body:sdk}));
  await page.goto(base);await page.waitForFunction(()=>window.CivilizationStartupCoordinator?.snapshot().status==='ready',null,{timeout:60000});await finishIntro(page);
  await page.evaluate(async item=>{
   state=newState();state.introSeen=true;state.storyProgress={pendingStory:null,completedStories:['earth-prologue'],introCompleted:true,starterGearReceived:true};state.playerName='第17批驗收';state.level=item.world===1?500:item.world===2?1000:1100;
   state.bossKilled=state.bossKilled.map(()=>true);state.unlockedMap=100;state.mapProgress.forEach(r=>r.fill(10));
   if(item.world>=2){state.secondWorld.entered=true;state.secondWorld.civilizationLevel=10;state.secondWorld.mainline.bossKilled.fill(true);}
   if(item.world===3){state.thirdWorld=createBlankThirdWorldState();state.thirdWorld.entered=true;state.thirdWorld.entryVersion=2;state.thirdWorld.story.unlockedStage=2;state.reincarnation.count=1;}
   window.playerCombatStats=()=>({hp:1000000,atk:1000,def:500,crit:0,dodge:0});state.hp=1000000;Math.random=()=>.5;window.effectiveCombatSpeed=()=>1;
   view='home';render();await CivilizationFormalBRenderer.warmSprites();
   if(item.mode==='calamity'){
    const d=item.world===1?getCivilizationCalamityDefinitions().find(d=>d.id===item.bossId):getSecondWorldCalamityDefinitions().find(d=>d.id===item.bossId);view='calamity';render();
    if(!(item.world===1?startCivilizationCalamityUI(d.id,'single'):startSecondWorldCalamityUI(d.id,'single')))throw Error('calamity entry rejected');
   }else if(item.mode==='arena'){openArenaDungeon();if(!startThirdWorldArenaUi(item.variant,1))throw Error('arena entry rejected');}
   else {view='adventure';setAdventureEraView('higher');render();void startThirdWorldRunFromPlayerUi(item.bossIndex);}
  },item);
  const proof=await page.waitForFunction(item=>{
   const snap=CivilizationCombatEvents.snapshot(),c=document.querySelector('.formal-b-verified-monster');
   if(snap?.world!==item.world||snap.mode!==item.mode||!c||getComputedStyle(c).visibility==='hidden')return false;
   const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;if(!d.some((v,i)=>i%4===3&&v>16))return false;
   return {enemy:snap.actors.enemy,world:snap.world,mode:snap.mode,assetId:c.dataset.monster,ratio:Number(c.dataset.actualRatio),stage:c.closest('.formal-b-shared-stage').getBoundingClientRect().toJSON()};
  },item,{timeout:30000});
  await page.waitForFunction(()=>{const vp=window.CivilizationCombatViewport?.snapshot();return !!vp&&(!vp.mobile||vp.focused);},null,{timeout:10000});assert.equal(await page.evaluate(()=>matchMedia('(pointer:coarse)').matches),item.viewport.width!==1365,'correct device profile');const proofRow=await proof.jsonValue();assert.equal(proofRow.assetId,item.assetId);assert.equal(proofRow.enemy.id,item.bossId);assert.equal(proofRow.enemy.name,item.name);assert.ok(proofRow.ratio>=1.5&&proofRow.ratio<=2);
  const layout=await page.evaluate(()=>{
   const stage=document.querySelector('.formal-b-shared-stage'),mon=stage.querySelector('[data-monster]'),player=stage.querySelector('[data-suit]');
   const alpha=c=>{const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data,b=c.getBoundingClientRect();let l=c.width,t=c.height,r=-1,bt=-1;for(let i=3;i<d.length;i+=4)if(d[i]>16){const x=(i-3)/4%c.width,y=Math.floor((i-3)/4/c.width);l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);bt=Math.max(bt,y);}return {left:b.left+l/c.width*b.width,right:b.left+(r+1)/c.width*b.width,top:b.top+t/c.height*b.height,bottom:b.top+(bt+1)/c.height*b.height,height:(bt-t+1)/c.height*b.height};};
   const boxes=[alpha(player),alpha(mon)],bars=['combatPlayerBar','combatEnemyBar'].map(id=>document.getElementById(id)?.parentElement.getBoundingClientRect().toJSON());
   const overlap=(a,b)=>a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top;
   return {boxes,bars,ratio:boxes[1].height/boxes[0].height,separated:boxes[0].right<boxes[1].left,bloodBarsUncovered:bars.every(b=>b&&boxes.every(a=>!overlap(a,b))),insideViewport:boxes.every(b=>b.left>=-.5&&b.right<=innerWidth+.5&&b.top>=-.5&&b.bottom<=innerHeight+.5)};
  });
  assert.ok(layout.separated,'actual page left/right');assert.ok(layout.bloodBarsUncovered,'actual page HP bars');assert.ok(layout.insideViewport,'actual page viewport');assert.ok(layout.ratio>=1.5&&layout.ratio<=2,'actual page Canvas Alpha ratio');
  
  await page.evaluate(()=>{CivilizationFormalBEntry.dispose();CivilizationFormalBRenderer.clearSpriteCache();});
  const stats=await page.evaluate(()=>({monster:CivilizationFormalBRenderer.monsterStats(),player:CivilizationFormalBRenderer.spriteStats()}));assert.equal(stats.monster.refs,0);assert.equal(stats.player.refs,0);assert.deepEqual(errors,[]);
  report.rows.push({...item,...proofRow,layout,stats,errors,deviceProfile:{hasTouch:viewport.width!==1365,isMobile:viewport.width!==1365}});console.log('PASS live entry',item);await page.close();
 }await context.close();}report.passed=report.rows.length===90;
 }finally{fs.writeFileSync('/tmp/batch17-pages-live90.json',JSON.stringify(report,null,2));await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
