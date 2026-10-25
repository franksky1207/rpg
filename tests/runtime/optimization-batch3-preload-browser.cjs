'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{const browser=await chromium.launch({headless:true,args:['--ignore-certificate-errors']});try{
 const context=await browser.newContext({ignoreHTTPSErrors:true}),page=await context.newPage();await page.route('**/preload-concurrency.html',r=>r.fulfill({contentType:'text/html',body:'<span id="localResourceCacheStatus"></span>'}));await page.goto('https://127.0.0.1:8443/preload-concurrency.html');
 const report=await page.evaluate(async()=>{
  await navigator.serviceWorker.register('resource-cache-sw.js',{scope:'./'});await navigator.serviceWorker.ready;if(!navigator.serviceWorker.controller)await new Promise(r=>navigator.serviceWorker.addEventListener('controllerchange',r,{once:true}));
  function preload(){const channel=new MessageChannel(),phases=[];return new Promise((resolve,reject)=>{const timer=setTimeout(()=>{channel.port1.close();reject(Error('preload terminal missing'));},30000);channel.port1.onmessage=e=>{phases.push(e.data);if(['complete','error'].includes(e.data.phase)){clearTimeout(timer);channel.port1.close();resolve(phases);}};navigator.serviceWorker.controller.postMessage({type:'CIV_CACHE_PRELOAD'},[channel.port2]);});}
  const jobs=await Promise.all([preload(),preload()]);const warm=await preload();const keys=await(await caches.open('civilization-resource-v1-media')).keys();return {jobs,warm,entries:keys.length,distinctKeys:new Set(keys.map(k=>k.url)).size};
 });for(const job of report.jobs){assert.equal(job.at(-1).phase,'complete');assert.equal(job.at(-1).failed,0);}assert.equal(report.warm.at(-1).saved,0);assert.equal(report.entries,report.distinctKeys);assert.equal(report.jobs[0].at(-1).total,report.jobs[1].at(-1).total);
 fs.writeFileSync('work/batch3/preload-browser.json',JSON.stringify(report,null,2));console.log('PASS real HTTPS Service Worker: both concurrent ports complete, warm preload saves no duplicates',report.entries);
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
