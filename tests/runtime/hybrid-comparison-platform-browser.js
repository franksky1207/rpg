'use strict';
const {chromium}=require('playwright'),fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const base=process.env.HYBRID_COMPARISON_URL||'http://127.0.0.1:4173/development/hybrid-comparison/index.html';
const b=JSON.parse(fs.readFileSync('development/hybrid-comparison/t2a-v1/owner-fixtures.json'));
const digest=x=>crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const viewports=[{width:1280,height:720},{width:1440,height:1080},{width:390,height:844},{width:360,height:800},{width:844,height:390}];
(async()=>{
 const browser=await chromium.launch({headless:true}),reports=[];
 try{
 for(const viewport of viewports){
  const context=await browser.newContext({viewport}),page=await context.newPage(),errors=[],requests=[];
  await page.addInitScript(()=>{
   const blocked=()=>{throw Error('Real player storage/audio forbidden in isolated page');};
   Storage.prototype.getItem=blocked;Storage.prototype.setItem=blocked;Storage.prototype.removeItem=blocked;Storage.prototype.clear=blocked;
   window.Audio=blocked;window.AudioContext=blocked;window.webkitAudioContext=blocked;
   Object.defineProperty(window,'state',{configurable:true,get:blocked,set:blocked});
  });
  page.on('pageerror',e=>errors.push(String(e)));page.on('request',r=>requests.push(r.url()));
  await page.goto(base,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.CivilizationHybridComparisonDev?.diagnostics().loaded,{timeout:30000});
  assert.equal(await page.locator('#variant option').count(),33);assert.equal(await page.locator('#case option').count(),5);assert.equal(await page.locator('#lod option').count(),3);
  const layout=await page.evaluate(()=>{
   const box=id=>{const r=document.getElementById(id).getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom};};
   return {stage:box('stage-canvas'),player:box('player-slot'),enemy:box('enemy-slot'),hud:box('hud'),controls:['play','pause','resume','replay','stop'].map(box),bodyWidth:document.documentElement.scrollWidth,fontSize:getComputedStyle(document.getElementById('event-label')).fontSize};
  });
  assert.ok(layout.bodyWidth<=viewport.width,'No horizontal UI overflow');
  assert.ok(layout.hud.bottom<=layout.stage.y,'HUD must remain outside stage');
  for(const button of layout.controls){assert.ok(button.y>=layout.stage.bottom,'Stage must not overlap controls');assert.ok(button.height>=44,'Touch target');}
  for(const [role,x] of [['player',.25],['enemy',.74]]){const r=layout[role];assert.ok(r.x>=layout.stage.x&&r.right<=layout.stage.right,'Actor inside stage');assert.ok(Math.abs((r.x+r.width/2-layout.stage.x)/layout.stage.width-x)<.01,'Shared foot x');assert.ok(Math.abs((r.bottom-layout.stage.y)/layout.stage.height-.78)<.01,'Shared foot y');}
  assert.ok(parseFloat(layout.fontSize)>=16);assert.match(await page.locator('#player-shield').innerText(),/未知/);
  // Same data and geometry at ready, with scheme selection kept outside input.
  const inputs=[];const rectangles=[];
  for(const scheme of ['A','B','C']){await page.selectOption('#scheme',scheme);inputs.push(await page.evaluate(()=>CivilizationHybridComparisonDev.input()));rectangles.push(await page.locator('#player-slot').boundingBox());}
  assert.equal(digest(inputs[0]),digest(inputs[1]));assert.equal(digest(inputs[0]),digest(inputs[2]));assert.deepEqual(rectangles[0],rectangles[1]);assert.deepEqual(rectangles[0],rectangles[2]);
  const initialId=await page.evaluate(()=>CivilizationHybridComparisonDev.snapshot().playbackId);
  await page.click('#play');await page.waitForFunction(()=>CivilizationHybridComparisonDev.snapshot().phase==='prepare');await page.click('#pause');
  const paused=await page.evaluate(()=>CivilizationHybridComparisonDev.snapshot());await page.waitForTimeout(180);assert.deepEqual(await page.evaluate(()=>CivilizationHybridComparisonDev.snapshot()),paused);
  await page.click('#resume');await page.waitForFunction(()=>CivilizationHybridComparisonDev.snapshot().phase!=='prepare');await page.click('#replay');assert.notEqual(await page.evaluate(()=>CivilizationHybridComparisonDev.snapshot().playbackId),initialId);await page.click('#stop');assert.equal(await page.evaluate(()=>CivilizationHybridComparisonDev.diagnostics().timers),0);
  // Real browser controls and 100 rapid replay/switch cycles; no synthetic GPU claim.
  const release=await page.evaluate(()=>{
   const api=CivilizationHybridComparisonDev,sourceIds=api.input().events.map(e=>e.eventId);let closed=0;
   api.subscribe(()=>{}, {sessionOwned:true,dispose:()=>closed++});
   for(let i=0;i<100;i++){
    document.getElementById('replay').click();document.getElementById('pause').click();document.getElementById('resume').click();
    for(const [id,value] of [['scheme',['A','B','C'][i%3]],['case',['normal-baseline','elite-baseline','boss-baseline','boss-player-defeat','elite-effects-owner-input'][i%5]],['variant','g007-subset-'+(i%32)],['lod',['low','medium','high'][i%3]]]){const select=document.getElementById(id);select.value=value;select.dispatchEvent(new Event('change'));}
    if(api.diagnostics().timers>1)throw Error('Timer accumulation');
   }
   document.getElementById('stop').click();return {diag:api.diagnostics(),closed,sourceIds};
  });
  assert.equal(release.diag.timers,0);assert.equal(release.diag.subscribers,0);assert.equal(release.closed,1);assert.equal(release.diag.listeners,12);
  await page.selectOption('#variant','mixed-g006-g007-empty-accessory');assert.match(await page.locator('#equipment li[data-slot=helmet]').innerText(),/極寒封閉盔.*fallback/);assert.match(await page.locator('#equipment li[data-slot=accessory]').innerText(),/空槽/);
  await page.selectOption('#case','boss-baseline');await page.click('#play');await page.waitForFunction(()=>CivilizationHybridComparisonDev.snapshot().sourceEvent?.data?.sourceType==='dodge');const dodger=await page.evaluate(()=>CivilizationHybridComparisonDev.snapshot().sourceEvent.data.target);assert.ok((await page.locator('#event-label').innerText()).startsWith(dodger==='player'?'玩家｜閃避':'敵人｜閃避'));await page.click('#stop');
  await page.selectOption('#case','elite-effects-owner-input');await page.click('#play');
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});
  assert.equal(await page.evaluate(()=>CivilizationHybridComparisonDev.diagnostics().timers),0);
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'));});
  assert.match(await page.locator('#outcome-label').innerText(),/雙方存活.*不是已結算敗北/);assert.equal(await page.evaluate(()=>CivilizationHybridComparisonDev.snapshot().sourceEvent),null);
  // Finish a real episode on its 700ms offline clock, then prove completed play/replay works.
  await page.selectOption('#case','boss-player-defeat');await page.click('#play');await page.waitForFunction(()=>CivilizationHybridComparisonDev.snapshot().mode==='completed',null,{timeout:15000});assert.match(await page.locator('#outcome-label').innerText(),/玩家 HP 歸零/);assert.match(await page.locator('#player-hp').innerText(),/HP 0/);await page.click('#play');assert.equal(await page.evaluate(()=>CivilizationHybridComparisonDev.snapshot().mode),'playing');await page.click('#stop');
  const disposed=await page.evaluate(()=>{CivilizationHybridComparisonDev.dispose();return CivilizationHybridComparisonDev.diagnostics();});
  assert.equal(disposed.listeners,0);assert.equal(disposed.subscribers,0);assert.equal(disposed.timers,0);assert.equal(disposed.loaded,false);
  assert.deepEqual(errors,[]);assert.ok(!requests.some(u=>/\.glb|babylon|supabase|audio\/|resource-cache-sw/.test(u)),'No model, engine, cloud, audio or SW request');
  reports.push({viewport,layout,cycles:100,release,disposed,requests:requests.length,pageErrors:errors,schemeInputSHA:digest(inputs[0]),background:'simulated visibility event; no real OS throttle/GPU test'});console.log('PASS isolated controls/data/HUD/100 cycles/release',viewport);
  await context.close();
 }
 // A real navigation/back restores a fresh usable development session.
 const historyContext=await browser.newContext(),historyPage=await historyContext.newPage();await historyPage.goto(base);await historyPage.waitForFunction(()=>CivilizationHybridComparisonDev?.diagnostics().loaded);const beforeHistory=await historyPage.evaluate(()=>CivilizationHybridComparisonDev.snapshot().playbackId);await historyPage.click('#play');await historyPage.goto('about:blank');await historyPage.goBack();await historyPage.waitForFunction(()=>CivilizationHybridComparisonDev?.diagnostics().loaded&&!CivilizationHybridComparisonDev.diagnostics().disposed);assert.notEqual(await historyPage.evaluate(()=>CivilizationHybridComparisonDev.snapshot().playbackId),beforeHistory);await historyPage.click('#play');assert.equal(await historyPage.evaluate(()=>CivilizationHybridComparisonDev.snapshot().mode),'playing');await historyContext.close();console.log('PASS actual page navigation/back/reopen lifecycle');
 // Negative JSON/source/retry and overlapping source loads in a fresh browser context.
 const context=await browser.newContext(),page=await context.newPage();let corrupt=true;
 await context.route('**/t2a-v1/owner-fixtures.json',route=>route.fulfill({contentType:'application/json',body:JSON.stringify(corrupt?{...b,version:2}:b)}));
 await page.goto(base);await page.waitForFunction(()=>document.getElementById('status').dataset.error==='true');assert.equal(await page.locator('#play').isEnabled(),false);assert.equal(await page.evaluate(()=>CivilizationHybridComparisonDev.input()),null);corrupt=false;await page.click('#retry');await page.waitForFunction(()=>CivilizationHybridComparisonDev.diagnostics().loaded);
 await context.unroute('**/t2a-v1/owner-fixtures.json');let changed=true;
 await context.route('**/combat-events.js',route=>changed?route.fulfill({contentType:'text/javascript',body:'changed-source'}):route.continue());
 await page.evaluate(()=>CivilizationHybridComparisonDev.reload());await page.waitForFunction(()=>document.getElementById('status').dataset.error==='true');assert.match(await page.locator('#status').innerText(),/Source SHA changed/);assert.equal(await page.evaluate(()=>CivilizationHybridComparisonDev.input()),null);changed=false;await page.click('#retry');await page.waitForFunction(()=>CivilizationHybridComparisonDev.diagnostics().loaded);
 // Captured old source request intentionally completes after a newer successful reload.
 let delayed,once=true,captured;const intercepted=new Promise(resolve=>captured=resolve);
 await context.route('**/t2a-v1/owner-fixtures.json',async route=>{if(once){once=false;const waiting=new Promise(r=>delayed=r);captured();await waiting;try{await route.fulfill({contentType:'application/json',body:JSON.stringify({...b,version:99})});}catch(_){}}else await route.continue();});
 await page.evaluate(()=>{void CivilizationHybridComparisonDev.reload();});await intercepted;await page.selectOption('#case','boss-baseline');await page.evaluate(()=>{void CivilizationHybridComparisonDev.reload();});await page.waitForFunction(()=>CivilizationHybridComparisonDev.diagnostics().loaded);delayed();await page.waitForTimeout(100);assert.equal(await page.evaluate(()=>CivilizationHybridComparisonDev.input().caseId),'boss-baseline');assert.equal(await page.locator('#status').getAttribute('data-error'),'false');
 await page.goto('about:blank');await context.close();console.log('PASS malformed Fixture/source rejection, retry and stale loading isolation');
 fs.writeFileSync('hybrid-comparison-platform-browser-report.json',JSON.stringify({passed:true,reports,negativeLoadsPassed:true,gpuTest:false,rendererImplemented:false},null,2)+'\n');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
