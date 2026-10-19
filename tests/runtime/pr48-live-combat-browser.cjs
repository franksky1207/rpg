'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
const {sdk,finishIntro}=require('../equipment-formal/helpers.cjs');
const base=process.env.RUNTIME_SMOKE_URL||'http://127.0.0.1:4173/index.html';
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined});const reports=[];try{
 const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 await page.route('**/supabase.js',r=>r.fulfill({contentType:'text/javascript',body:sdk}));
 await page.addInitScript(()=>localStorage.setItem('civilization-war-combat-animation-v1:device','on'));
 await page.goto(base+'?production=1');await page.waitForFunction(()=>CivilizationStartupCoordinator.snapshot().status==='ready',null,{timeout:60000});await finishIntro(page);
 for(const item of [{phase:1,mode:'calamity'},{phase:3,mode:'varied'}]){
 await page.evaluate(({phase,mode})=>{
  clearCombatPresentation('pr48-test-reset');closeBattleResultModal();state=newState();state.introSeen=true;state.level=phase===3?1000:500;state.unlockedMap=100;state.mapProgress.forEach(r=>r.fill(10));state.bossKilled=state.bossKilled.map(()=>true);
  if(phase===3){state.secondWorld.entered=true;state.secondWorld.civilizationLevel=10;state.thirdWorld=createBlankThirdWorldState();state.thirdWorld.entered=true;state.thirdWorld.entryVersion=2;state.thirdWorld.story.unlockedStage=2;}
  // Numerical fixture only. Genuine UI/core/pacing/settlement/stop owners run.
  window.playerCombatStats=()=>({hp:1e15,atk:1e15,def:1e12,crit:0,dodge:0});state.hp=1e15;Math.random=()=>.5;
  view='home';render();window.__pr48Battles=[];const original=window.__pr48OriginalAnimate||animateStructuredCombatPresentation;window.__pr48OriginalAnimate=original;
  window.animateStructuredCombatPresentation=function(result,options){const rt=getThirdWorldArenaRuntimeState();__pr48Battles.push({name:result.e?.name,mode:options?.mode,round:rt.startedRuns,stage:rt.round?.stageIndex,win:result.win});return original(result,options);};
  if(mode==='calamity'){window.playerCombatStats=()=>({hp:1000,atk:100,def:0,crit:0,dodge:0});state.hp=1000;const d=getCivilizationCalamityDefinitions().find(d=>d.calamityName==='日蝕王座'||d.name==='日蝕王座');if(!d)throw Error('missing eclipse calamity');state.bossKilled[d.mapIndex]=true;state.level=Math.max(state.level,d.unlockLevel);startCivilizationCalamityUI(d.id,'continuous');}
  else {Math.random=()=>0;window.playerCombatStats=()=>({hp:1000,atk:100000,def:0,crit:0,dodge:0});state.hp=1000;state.specializations.combo=60;state.specializations.drain=60;if(!startThirdWorldArenaUi('varied',5))throw Error('varied arena did not start');}
 },item);
 await page.waitForFunction(()=>document.querySelector('.formal-b-shared-stage:not([hidden])')&&CivilizationCombatViewport.snapshot().focused,null,{timeout:20000}).catch(async e=>{console.log(await page.evaluate(()=>({view,viewport:CivilizationCombatViewport.snapshot(),entry:CivilizationFormalBEntry.diagnostics(),html:document.querySelector('#main').innerHTML.slice(0,2200),run:getCivilizationCalamityRunSnapshot()})));throw e;});
 const geometry=await page.evaluate(()=>{const r=document.querySelector('.formal-b-shared-stage').getBoundingClientRect(),b=document.querySelector('[data-combat-action="stop-continuous"]');return {count:document.querySelectorAll('[data-combat-action="stop-continuous"]').length,above:b.getBoundingClientRect().bottom<=r.top+1,delta:r.top+r.height/2-visualViewport.offsetTop-visualViewport.height/2,handler:b.getAttribute('onclick'),y:scrollY};});
 assert.equal(geometry.count,1);assert(geometry.above,JSON.stringify(geometry));assert(Math.abs(geometry.delta)<4,JSON.stringify(geometry));
 if(item.mode==='varied'){
  await page.evaluate(()=>{document.dispatchEvent(new Event('touchmove'));scrollTo(0,0);});
  await page.waitForFunction(()=>getThirdWorldArenaRuntimeState().startedRuns>=2&&getThirdWorldArenaRuntimeState().status==='combat'&&__pr48Battles.length>=4,null,{timeout:60000});
  const next=await page.evaluate(()=>({rt:getThirdWorldArenaRuntimeState(),y:scrollY,battles:__pr48Battles.length}));
  assert.equal(next.rt.startedRuns,2);assert.equal(next.rt.finishedRuns,1);assert.equal(next.rt.fullClears,1,'first round must win all three fights');assert.equal(next.rt.failedRuns,0);assert.equal(next.battles,4,'three completed fights followed by first fight of next round');assert.equal(next.y,0,'no manual scroll steal on fourth fight');
 }
 await page.locator('[data-combat-action="stop-continuous"]').evaluate(b=>b.click());
 console.log('original stop dispatched',item.mode);
 await page.waitForFunction(mode=>mode==='varied'?['stopped','complete'].includes(getThirdWorldArenaRuntimeState().status):!getCivilizationCalamityRunSnapshot()?.active,item.mode,{timeout:30000});
 const result=await page.evaluate(mode=>({battles:__pr48Battles,run:mode==='varied'?getThirdWorldArenaRuntimeState():getCivilizationCalamityRunSnapshot()}),item.mode);
 assert(result.battles.length>0);if(item.mode==='varied'){assert.equal(result.run.stopReason,'manual');assert.equal(result.run.finishedRuns,2,'stop finishes current three-fight round');assert.equal(result.run.fullClears,2);assert.equal(result.run.failedRuns,0);assert.deepEqual(result.battles.map(b=>[b.round,b.stage,b.win]),[[1,0,true],[1,1,true],[1,2,true],[2,0,true],[2,1,true],[2,2,true]],'two full three-fight rounds; no partial defeat may masquerade as the three-fight requirement');}else assert.equal(result.run.stopRequested,true,'original calamity stop requested');
 reports.push({item,geometry,result});console.log('PASS real combat',item);
 }
 fs.writeFileSync('/tmp/pr48-live-combat.json',JSON.stringify({realDevice:false,reports},null,2));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
