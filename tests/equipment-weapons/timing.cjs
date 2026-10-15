'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
const {sdk,finishIntro}=require('../equipment-formal/helpers.cjs');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'/usr/bin/chromium',args:['--no-sandbox']});try{
const page=await browser.newPage();await page.route('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js',r=>r.fulfill({contentType:'text/javascript',body:sdk}));await page.addInitScript(()=>localStorage.setItem('civilization-war-presentation-mode-v1:t1a-snapshot-test','text'));await page.goto((process.env.RUNTIME_SMOKE_URL||'http://127.0.0.1:4189/index.html')+'?production=1');await page.waitForFunction(()=>window.CivilizationStartupCoordinator?.snapshot().status==='ready',null,{timeout:60000});await finishIntro(page);
const report=await page.evaluate(async()=>{
 const originalNow=performance.now.bind(performance),originalSpeed=window.effectiveCombatSpeed;let time=0,speed=1;Object.defineProperty(performance,'now',{configurable:true,value:()=>time});window.effectiveCombatSpeed=()=>speed;
 const modes=Object.entries(CivilizationFormalBProjection.modes).flatMap(([mode,worlds])=>worlds.map(world=>({mode,world}))),rows=[];
 const input=[{type:'mark',owner:'player',mark:'ward',action:'activate',shield:3},{type:'mark',owner:'enemy',mark:'ward',action:'activate',shield:5},{type:'attack',actor:'player',target:'enemy',actualDamage:10,damage:15,shieldAbsorbed:5},{type:'combo',actor:'player'},{type:'attack',actor:'player',target:'enemy',source:'combo',actualDamage:8,damage:8},{type:'counter',actor:'enemy'},{type:'attack',actor:'enemy',target:'player',source:'counter',actualDamage:7,damage:10,shieldAbsorbed:3},{type:'drain',actor:'enemy',healed:2},{type:'dodge',actor:'player',target:'enemy'},{type:'attack',actor:'player',target:'enemy',actualDamage:1000,damage:1000}];
 async function run(mode,world,visual,variant){
  time=0;const events=structuredClone(input);if(mode==='mirror')for(const e of events)for(const k of ['actor','target','owner'])if(e[k]==='enemy')e[k]='mirror';const result={maxHp:100,events,playerStartHp:100,playerMaxHp:100,enemyStartHp:100,enemyMaxHp:100,e:{hp:100},playerEndHp:93,enemyEndHp:0,win:true};
  // Actual formal prepare and animate owners run unchanged. Virtual sleep is an
  // existing owner injection seam; no independent simulated battle scheduler.
  (mode==='mirror'?prepareMirrorCombatPresentation:prepareCombatPresentation)(result,{playerStartHp:100,playerMaxHp:100,enemyStartHp:100,enemyMaxHp:100});
  let frameCount=0,maxLag=0,clock=visual?CivilizationFormalBOwnerClock.create({now:()=>time,read:getCombatPresentationSnapshot,snapshot:()=>({battleId:'timing',background:variant==='background',presentation:{token:getCombatPresentationSnapshot()?.token},pacing:getStructuredCombatPacing(events.length)})}):null;
  clock?.observe({lane:'formal',availability:'authoritative',expired:false,battleId:'timing',type:'combat-action',sourceIndex:0,data:{sourceType:'attack',actor:'player',target:'enemy'}});
  const trace=[],hp=[];let lastIndex=0,lastState='';
  const record=()=>{const p=getCombatPresentationSnapshot();if(!p)return;if(p.index!==lastIndex){lastIndex=p.index;trace.push({index:p.index,at:p.actionStartedAt,type:p.action?.sourceType||events[p.index-1]?.type});}const state=[p.playerHp,p.enemyHp,p.playerShield,p.enemyShield];if(JSON.stringify(state)!==lastState){lastState=JSON.stringify(state);hp.push({at:time,state});}};
  await (mode==='mirror'?animateMirrorStructuredCombatPresentation:animateStructuredCombatPresentation)(result,{sleep:async ms=>{
   record();const start=time;
   // Deliberately late 60Hz visual sampling exercises timestamp anchoring.
   if(clock&&variant!=='minimal'&&variant!=='background'){
    if(variant==='switch'&&getCombatPresentationSnapshot().index===3)clock.reset({resume:true});
    time=start+Math.min(ms,17);const f=clock.sample();if(f)frameCount++;
    if(f?.weaponAttack){const p=getCombatPresentationSnapshot(),impact=getStructuredCombatPacing(events.length).impactDelay;const expected=(time-p.actionStartedAt)<impact?(time-p.actionStartedAt)/impact*336:336+Math.min(1,(time-p.actionStartedAt-impact)/getStructuredCombatPacing(events.length).stepDelay)*364;maxLag=Math.max(maxLag,Math.abs(f.weaponAttack.elapsedMs-expected));}
   }
   time=start+ms;record();
  },onUpdate:record});record();return {trace,hp,total:time,maxLag,frameCount,mode,world,variant};
 }
 try{for(speed of [1,1.5,2])for(const {mode,world} of modes)for(const variant of ['normal','switch','minimal','background']){const text=await run(mode,world,false,variant),visual=await run(mode,world,true,variant);rows.push({speed,mode,world,variant,text,visual});}}finally{Object.defineProperty(performance,'now',{configurable:true,value:originalNow});window.effectiveCombatSpeed=originalSpeed;}
 return {method:'actual structured presentation owner with injected virtual sleep, delayed visual samples; authoritative trace tolerance 0ms; normalized sample tolerance 1e-9',rows};
});
for(const r of report.rows){assert.deepEqual(r.text.trace,r.visual.trace);assert.deepEqual(r.text.hp,r.visual.hp);assert.equal(r.text.total,r.visual.total);assert.ok(r.visual.maxLag<1e-9);assert.equal(r.text.trace.filter(e=>e.type==='attack').length,4);}
report.passed=true;report.comparisons=report.rows.length;report.maxAuthorityDeltaMs=0;fs.writeFileSync('/tmp/equipment-weapons-timing.json',JSON.stringify(report,null,2));console.log('PASS timing comparisons',report.rows.length,'authority delta 0ms');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
