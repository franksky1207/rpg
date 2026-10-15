'use strict';
// Real index, formal UI, battle pipeline/core, owner clock and render path. Disposable browser state only.
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
const {sdk,finishIntro}=require('./helpers.cjs');
const base=process.env.RUNTIME_SMOKE_URL||'http://127.0.0.1:4173/index.html';
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||(fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined),args:['--no-sandbox']}),reports=[];
 try{for(const viewport of [{width:1365,height:900},{width:390,height:844},{width:844,height:390}]){
 const page=await browser.newPage({viewport}),errors=[],requests=[];page.on('pageerror',e=>errors.push(String(e)));page.on('request',r=>{if(/gm-equipment-2_5d.*webp/.test(r.url()))requests.push(r.url());});
 await page.route('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js',r=>r.fulfill({contentType:'text/javascript',body:sdk}));await page.addInitScript(()=>localStorage.setItem('civilization-war-presentation-mode-v1:t1a-snapshot-test','text'));
 await page.goto(base+(base.includes('?')?'&':'?')+'production=1',{waitUntil:'load'});await page.waitForFunction(()=>window.CivilizationStartupCoordinator?.snapshot().status==='ready',null,{timeout:60000});console.log('startup',viewport.width);await finishIntro(page);console.log('intro',viewport.width);assert.equal(requests.length,0);
 await page.evaluate(()=>{
  window.__samples=[];window.__lastResult=null;const animate=window.animateStructuredCombatPresentation;
  window.animateStructuredCombatPresentation=async function(r,o){__lastResult=r;return animate(r,o);};
  window.__sample=setInterval(()=>{const c=document.querySelector('.formal-b-whole-suit'),p=getCombatPresentationSnapshot();if(c&&p){const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let pixels=0;for(let i=3;i<d.length;i+=4)if(d[i]>16)pixels++;__samples.push({suit:c.dataset.suit,clip:c.dataset.clip,pixels,player:p.playerHp,enemy:p.enemyHp,shield:p.playerShield,playerMax:p.playerMaxHp,hpText:document.getElementById('combatPlayerHp')?.textContent,enemyText:document.getElementById('combatEnemyHp')?.textContent});}},20);
 });
 const runs=[];
 for(const [id,speed,scenario='normal'] of [['g005',1],['g007',1.5],['g018',2],...(viewport.width===1365?[['g007',2,'death'],['g005',2,'dodge']]:[])]){
 console.log('run',viewport.width,id,speed);await page.evaluate(({id,speed,scenario})=>{
  closeBattleResultModal();state=newState();state.introSeen=true;state.storyProgress={pendingStory:null,completedStories:['earth-prologue'],introCompleted:true,starterGearReceived:true};state.level=50;state.reincarnation.count=1;state.hp=1000;state.unlockedMap=1;state.mapProgress[0]=[10,10,10,10];
  const row=CivilizationFormalPlayerSprites.sets.find(r=>r.id===id);state.equipment.armor={name:row.equipmentNames.armor,world:1,q:1,level:1};
  state.equipment.weapon={name:'混穿武器',world:2,q:1,level:1};
  window.playerCombatStats=()=>({hp:scenario==='death'?1:1000,atk:scenario==='death'?0:20,def:0,crit:0,dodge:scenario==='dodge'?100:0});window.effectiveCombatSpeed=()=>speed;Math.random=()=>.5;
  view='adventure';setAdventureEraView('galaxy');selectedMap=0;selectedEnemy=0;selectedBattleCount=1;adventureScreen='prepare';clearPreparedFirstWorldTargetContext();prepareFirstWorldTargetContextFromSelection();render();startBattles();
 },{id,speed,scenario});
 try{await page.waitForFunction(id=>document.querySelector('.formal-b-whole-suit')?.dataset.suit===id,id,{timeout:15000});}catch(e){console.log(await page.evaluate(()=>({html:document.querySelector('#main')?.innerHTML,session:CivilizationCombatEvents.snapshot(),bridge:CivilizationFormalHybridBridge.diagnostics(),stats:CivilizationFormalBRenderer.spriteStats(),errors:window.RUNTIME_INTEGRITY})));console.log(errors);throw e;}
 const layout=await page.evaluate(()=>{const c=document.querySelector('.formal-b-whole-suit').getBoundingClientRect(),hp=document.querySelector('#combatPlayerHp').getBoundingClientRect(),enemy=document.querySelector('#combatEnemyCard').getBoundingClientRect();return {width:c.width,height:c.height,hpClear:c.bottom<=hp.top,enemyClear:c.right<=enemy.left||c.top>=enemy.bottom||c.bottom<=enemy.top};});assert.ok(layout.hpClear&&layout.enemyClear,JSON.stringify(layout));
 await page.screenshot({path:`/tmp/formal-${viewport.width}-${id}.png`,fullPage:true});
 await page.waitForFunction(()=>!battleBusy,null,{timeout:25000});
 const result=await page.evaluate(()=>({win:__lastResult.win,events:__lastResult.events.length,snapshot:CivilizationCombatEvents.snapshot(),stats:CivilizationFormalBRenderer.spriteStats(),samples:__samples.splice(0)}));
 assert.ok(result.samples.some(s=>s.suit===id&&s.pixels>500),'real actor raster');assert.ok(result.samples.some(s=>s.clip==='attack'),'formal player attack');if(scenario==='death'){assert.equal(result.win,false);assert.ok(result.samples.some(s=>s.clip==='defeat'),'formal death');}if(scenario==='dodge')assert.ok(result.samples.some(s=>s.clip==='dodge'),'formal dodge');assert.ok(result.samples.every(s=>s.hpText===`${s.player} / ${s.playerMax}`),'live player HP parity');assert.ok(new Set(result.samples.map(s=>s.enemy)).size>1,'live enemy HP');assert.equal(result.stats.refs,0);runs.push({id,speed,scenario,layout,...result});
 }
 assert.equal(await page.evaluate(()=>CivilizationPresentationMode.isFull3DAvailable()),false);assert.deepEqual(errors,[]);reports.push({viewport,runs,requests,errors});await page.close();
 console.log('PASS formal battle UI',viewport.width);
 }}finally{await browser.close();}
 fs.writeFileSync('/tmp/equipment-formal-browser.json',JSON.stringify({passed:true,realDevice:false,reports},null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
