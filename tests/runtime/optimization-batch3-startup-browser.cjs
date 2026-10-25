'use strict';
const fs=require('node:fs'),{chromium}=require('playwright'),{sdk}=require('../equipment-formal/helpers.cjs');
(async()=>{const browser=await chromium.launch({headless:true,args:['--ignore-certificate-errors']});const rows=[];try{
 for(const variant of ['before','after'])for(let run=1;run<=3;run++){
  const context=await browser.newContext({viewport:{width:390,height:844},ignoreHTTPSErrors:true});
  const page=await context.newPage();await page.route('**/supabase.js',r=>r.fulfill({contentType:'text/javascript',body:sdk}));
  await page.addInitScript(()=>{window.__perf={longTasks:[]};addEventListener('civilization-background-ready-before-reveal',()=>__perf.readyMs=performance.now(),{once:true});new PerformanceObserver(list=>{for(const x of list.getEntries())__perf.longTasks.push({start:x.startTime,ms:x.duration});}).observe({entryTypes:['longtask']});});
  const cdp=await context.newCDPSession(page);await cdp.send('Performance.enable');await cdp.send('Network.enable');await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
  let cached=0,swResponses=0;cdp.on('Network.responseReceived',e=>{if(e.response.fromServiceWorker)swResponses++;});cdp.on('Network.requestServedFromCache',()=>cached++);
  for(const visit of ['cold','warm']){
   cached=0;swResponses=0;const url='https://127.0.0.1:'+(variant==='before'?8444:8443)+'/index.html?production=1';
   await page.goto(url,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>CivilizationStartupCoordinator?.snapshot().status==='ready');
   await page.waitForFunction(()=>civilizationScriptGroupSnapshot().groups.story.status==='ready');
   const sample=await page.evaluate(()=>({readyMs:__perf.readyMs,now:performance.now(),longTasks:__perf.longTasks,resources:performance.getEntriesByType('resource').map(r=>({path:new URL(r.name).pathname,ms:r.duration,transfer:r.transferSize,bytes:r.decodedBodySize})),groups:civilizationScriptGroupSnapshot(),sw:!!navigator.serviceWorker.controller,heap:performance.memory?.usedJSHeapSize}));
   const metrics=Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(x=>[x.name,x.value]));
   rows.push({variant,run,visit,cached,swResponses,...sample,metrics});
   // Identical settle window; do not subscribe to the known-broken baseline job.
   await page.waitForTimeout(2500);
  }
  await context.close();
 }
 fs.writeFileSync('work/batch3/startup-before-after.json',JSON.stringify({cpuThrottle:4,viewport:'390x844',loopbackHTTPS:true,rows},null,2));console.log(rows.map(r=>({variant:r.variant,run:r.run,visit:r.visit,readyMs:r.readyMs,cached:r.cached,scriptMs:r.metrics.ScriptDuration*1000,gm:r.groups.groups.gm.status,integrity:r.groups.groups.integrity.status,codex:r.resources.find(x=>x.path.endsWith('/monstercodexdata.js'))?.bytes})));
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
