'use strict';
const {chromium}=require('playwright'),fs=require('node:fs'),assert=require('node:assert/strict');
const {sdk,finishIntro}=require('../../../tests/equipment-formal/helpers.cjs');
const base=process.env.RUNTIME_SMOKE_URL||'http://127.0.0.1:4173/index.html';
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||(fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined),args:['--no-sandbox']}),report={passed:false,rows:[],realDevice:false};
 try{ const all=require('../../../data/monsters/monster-mappings.json').records;
 const records=[...['gold_slime','ancient_guardian','mysterious_traveler'].map(id=>all.find(r=>r.specialId===id)),
 all.find(r=>r.world==='galaxy'&&r.kind==='normal'),
 ...[0,9,10,19,20,29].map(i=>all.filter(r=>r.status==='batch17-formal-enabled')[i]),
 ...[1,2].flatMap(world=>['bounty','arena','void','mirror'].map(mode=>({world:world===1?'galaxy':'universe',mode}))),
 all.find(r=>r.status==='batch18-formal-enabled')];
 const viewports=[{width:1365,height:900},{width:390,height:844},{width:844,height:390}];
 for(const viewport of viewports){const context=await browser.newContext({viewport,hasTouch:viewport.width!==1365,isMobile:viewport.width!==1365});for(const row of records.filter(r=>(!process.env.B19_SPECIAL_ONLY||r.specialId)&&(!process.env.B19_MODE||(r.specialId?'special':r.mode||'main')===process.env.B19_MODE))){const item={world:row.world==='higher'?3:row.world==='universe'?2:1,mode:row.specialId?'special':(row.mode||'main'),bossId:row.bossId,bossIndex:row.bossIndex,assetId:row.assetId,name:row.name,specialId:row.specialId,depth:row.depth,viewport};
  const page=await context.newPage(),errors=[];await page.setViewportSize(item.viewport);await page.addInitScript(()=>localStorage.clear());page.on('pageerror',e=>errors.push(String(e)));page.on('requestfailed',r=>console.error('HTTP request failed',r.url(),r.failure()));page.on('response',r=>{if(r.status()>=400)console.error('HTTP response',r.status(),r.url());});page.on('dialog',d=>d.dismiss());
  await page.route('**/supabase.js',r=>r.fulfill({contentType:'text/javascript',body:sdk}));
  await page.goto(base+'?production=1');await page.waitForFunction(()=>window.CivilizationStartupCoordinator?.snapshot().status==='ready',null,{timeout:60000});await finishIntro(page);
  await page.evaluate(async item=>{
   state=newState();state.introSeen=true;state.storyProgress={pendingStory:null,completedStories:['earth-prologue'],introCompleted:true,starterGearReceived:true};state.playerName='第17批驗收';state.level=item.world===1?500:item.world===2?1000:1100;
   state.bossKilled=state.bossKilled.map(()=>true);state.unlockedMap=100;state.mapProgress.forEach(r=>r.fill(10));
   if(item.world>=2){state.secondWorld.entered=true;state.secondWorld.civilizationLevel=10;state.secondWorld.mainline.bossKilled.fill(true);}
   if(item.world===3){state.thirdWorld=createBlankThirdWorldState();state.thirdWorld.entered=true;state.thirdWorld.entryVersion=2;state.thirdWorld.story.unlockedStage=2;state.reincarnation.count=1;}
   window.playerCombatStats=()=>({hp:1000000,atk:1000,def:500,crit:0,dodge:0});state.hp=1000000;Math.random=()=>.5;window.effectiveCombatSpeed=()=>1;
   view='home';render();await CivilizationFormalBRenderer.warmSprites();window.mainBattlePresentationSleep=()=>new Promise(()=>{});const present=window.animateStructuredCombatPresentation;window.animateStructuredCombatPresentation=(r,o)=>present(r,{...o,sleep:window.mainBattlePresentationSleep});
   if(item.mode==='special'){
    state.level=1;state.hp=1000;window.playerCombatStats=()=>({hp:1000,atk:50,def:5,crit:0,dodge:0});window.rollSpecialMonster=()=>getSpecialMonsterById(item.specialId,1);Math.random=()=>.01;
    void maybeHandleSpecialEncounter({continuous:true,completed:0,originalCount:1,totalXp:0,totalGold:0,totalDarkMatter:0,totalDarkEnergy:0,items:[]},{win:true,e:monsterObj(0,0)},{world:1,mapIndex:0,enemyIndex:0,bossIndex:0});
   }else if(item.mode==='main'&&item.world===3){
    view='adventure';setAdventureEraView('higher');render();void startThirdWorldRunFromPlayerUi(item.bossIndex);
   }else if(item.mode==='main'){
    state.level=50;view='adventure';setAdventureEraView('galaxy');render();selectedMap=0;selectedEnemy=0;selectedBattleCount='continuous';adventureScreen='prepare';clearPreparedFirstWorldTargetContext();prepareFirstWorldTargetContextFromSelection();render();startBattles();
   }else if(item.mode==='calamity'){
    const d=item.world===1?getCivilizationCalamityDefinitions().find(d=>d.id===item.bossId):getSecondWorldCalamityDefinitions().find(d=>d.id===item.bossId);view='calamity';render();
    if(!(item.world===1?startCivilizationCalamityUI(d.id,'single'):startSecondWorldCalamityUI(d.id,'single')))throw Error('calamity entry rejected');
   }else if(item.mode==='bounty'||item.mode==='arena'||item.mode==='void'||item.mode==='mirror'){
    state.level=item.world===1?50:600;state.hp=10000;window.playerCombatStats=()=>({hp:10000,atk:1000,def:500,crit:0,dodge:0});
    if(item.mode==='bounty'){enterBountyDungeon();startBountyFight(false);}
    if(item.mode==='arena'){openArenaDungeon();startArenaDungeon('normal');startArenaStageFight(false);}
    if(item.mode==='void'){enterVoidMirageDungeon();startVoidMirageChallengeUI();}
    if(item.mode==='mirror'){view='dungeon-mirror';render();if(!startMirrorCombatRun())throw Error('mirror entry rejected');}
   }else if(item.mode==='alternate'){
    state.reincarnation.alternateUniverse.unlocked=true;state.reincarnation.alternateUniverse.deepestCleared=item.depth-1;state.reincarnation.alternateUniverse.activeAttempt=null;
    if(!openAlternateUniversePage())throw Error('alternate entry rejected');void challengeAlternateUniverseFormal();
   }
   else {view='adventure';setAdventureEraView('higher');render();void startThirdWorldRunFromPlayerUi(item.bossIndex);}
  },item);
  const proof=await page.waitForFunction(item=>{
   const snap=CivilizationCombatEvents.snapshot(),c=document.querySelector('.formal-b-verified-monster');
   if(snap?.world!==item.world||snap.mode!==item.mode||!c||getComputedStyle(c).visibility==='hidden')return false;
   const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;if(!d.some((v,i)=>i%4===3&&v>16))return false;
   return {enemy:snap.actors.enemy,world:snap.world,mode:snap.mode,assetId:c.dataset.monster,ratio:Number(c.dataset.actualRatio),stage:c.closest('.formal-b-shared-stage').getBoundingClientRect().toJSON()};
  },item,{timeout:30000}).catch(async e=>{console.log('FAIL',item,errors,await page.evaluate(()=>({snap:CivilizationCombatEvents.snapshot(),diag:CivilizationFormalBEntry.diagnostics(),body:document.body.innerText.slice(-1500),view,adventureScreen,stage:document.querySelector('.formal-b-shared-stage')?.outerHTML})));throw e;});
  await page.waitForFunction(()=>{const vp=window.CivilizationCombatViewport?.snapshot();return !!vp&&(!vp.mobile||vp.focused);},null,{timeout:10000});assert.equal(await page.evaluate(()=>matchMedia('(pointer:coarse)').matches),item.viewport.width!==1365,'correct device profile');const proofRow=await proof.jsonValue();
  const layout=await page.evaluate(()=>{
   const stage=document.querySelector('.formal-b-shared-stage'),mon=stage.querySelector('[data-monster],[data-mirror]'),player=stage.querySelector('[data-suit]');
   const outer=e=>{if(!e)return 0;const c=getComputedStyle(e);return e.getBoundingClientRect().height+parseFloat(c.marginTop)+parseFloat(c.marginBottom);};
   const cards=[...stage.closest('.combat-screen').querySelectorAll('.combatant')];
   const hud=cards.map(e=>{const c=getComputedStyle(e);return outer(e.querySelector('h2'))+outer(e.querySelector('.big-hp'))+parseFloat(c.paddingTop)+parseFloat(c.paddingBottom)+parseFloat(c.borderTopWidth)+parseFloat(c.borderBottomWidth);});
   const stacked=cards.length===2&&Math.abs(cards[0].getBoundingClientRect().top-cards[1].getBoundingClientRect().top)>Math.min(...cards.map(e=>e.getBoundingClientRect().height))/2;
   const frameHeight=stage.getBoundingClientRect().height+(stacked?hud.reduce((a,b)=>a+b,0):Math.max(0,...hud));
   const alpha=c=>{const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data,b=c.getBoundingClientRect();let l=c.width,t=c.height,r=-1,bt=-1;for(let i=3;i<d.length;i+=4)if(d[i]>16){const x=(i-3)/4%c.width,y=Math.floor((i-3)/4/c.width);l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);bt=Math.max(bt,y);}return {left:b.left+l/c.width*b.width,right:b.left+(r+1)/c.width*b.width,top:b.top+t/c.height*b.height,bottom:b.top+(bt+1)/c.height*b.height,height:(bt-t+1)/c.height*b.height};};
   const boxes=[alpha(player),alpha(mon)],bars=['combatPlayerBar','combatEnemyBar'].map(id=>document.getElementById(id)?.parentElement.getBoundingClientRect().toJSON());
   const overlap=(a,b)=>a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top;
   return {boxes,bars,targetHeight:Number(player.dataset.targetHeight),paintedHeight:Number(player.dataset.paintedHeight),safetyRetreat:player.dataset.safetyRetreat,frameHeight,hud,stacked,playerFrameFraction:boxes[0].height/frameHeight,stageHeight:stage.getBoundingClientRect().height,playerStageFraction:boxes[0].height/stage.getBoundingClientRect().height,playerViewportFraction:boxes[0].height/(visualViewport?.height||innerHeight),monsterViewportFraction:boxes[1].height/(visualViewport?.height||innerHeight),ratio:boxes[1].height/boxes[0].height,separated:boxes[0].right<boxes[1].left,bloodBarsUncovered:bars.every(b=>b&&boxes.every(a=>!overlap(a,b))),insideViewport:boxes.every(b=>b.left>=-.5&&b.right<=innerWidth+.5&&b.top>=-.5&&b.bottom<=innerHeight+.5)};
  });
  assert.ok(layout.separated,'actual page left/right');assert.ok(layout.bloodBarsUncovered,'actual page HP bars');assert.ok(layout.insideViewport,'actual page viewport');
  
  if(!process.env.B19_REFERENCE){
   assert.ok(Math.abs(layout.targetHeight-layout.frameHeight*0.2682725482887481)<1,'measured compact combat frame target');
   assert.ok(Math.abs(layout.boxes[0].height-layout.paintedHeight)<Math.max(2,layout.paintedHeight*.016),'actual Alpha meets selected painted height');
   if(!layout.safetyRetreat)assert.ok(layout.playerFrameFraction>=.264,'absolute player height must meet the measured frame reference');
   else assert.ok(layout.paintedHeight<layout.targetHeight,'explicit animation safety retreat');
  }
  await page.screenshot({path:`/tmp/batch19-${viewport.width}-${item.specialId||item.bossId||item.mode+'-'+item.world}.png`});
  await page.evaluate(()=>{CivilizationFormalBEntry.dispose();CivilizationFormalBRenderer.clearSpriteCache();});
  const stats=await page.evaluate(()=>({monster:CivilizationFormalBRenderer.monsterStats(),player:CivilizationFormalBRenderer.spriteStats()}));assert.equal(stats.monster.refs,0);assert.equal(stats.player.refs,0);assert.deepEqual(errors,[]);
  report.rows.push({...item,...proofRow,layout,stats,errors,deviceProfile:{hasTouch:viewport.width!==1365,isMobile:viewport.width!==1365}});fs.writeFileSync(process.env.B19_REPORT||'/tmp/batch19-baseline.json',JSON.stringify(report,null,2));console.log('PASS live entry',item);await page.close();
 }await context.close();}report.passed=report.rows.length===(process.env.B19_SPECIAL_ONLY?9:process.env.B19_MODE?records.filter(r=>(r.specialId?'special':r.mode||'main')===process.env.B19_MODE).length*3:records.length*3);
 }finally{fs.writeFileSync(process.env.B19_REPORT||'/tmp/batch19-baseline.json',JSON.stringify(report,null,2));await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
