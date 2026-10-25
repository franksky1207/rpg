'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),cp=require('node:child_process');
(async()=>{const browser=await chromium.launch({headless:true,args:['--ignore-certificate-errors']});const rows=[];try{
 for(const variant of ['before','after'])for(let run=1;run<=3;run++){
  const page=await browser.newPage({ignoreHTTPSErrors:true,viewport:{width:390,height:844}});
  await page.route('**/cache-cost.html',r=>r.fulfill({contentType:'text/html',body:'<span id="localResourceCacheStatus"></span>'}));await page.goto('https://127.0.0.1:8443/cache-cost.html');
  await page.evaluate(async()=>{
   const cache=await caches.open('civilization-resource-v1-media');for(let i=0;i<100;i++)await cache.put('/cost-'+i+'.bin',new Response(new Uint8Array(32768)));
   const stats={keys:0,match:0,blobs:0,pending:0,lastEnd:0};window.__cacheStats=stats;
   const keys=Cache.prototype.keys,match=Cache.prototype.match;
   Cache.prototype.keys=async function(...args){stats.keys++;return keys.apply(this,args);};
   Cache.prototype.match=async function(...args){stats.match++;stats.pending++;try{const r=await match.apply(this,args);if(r){const blob=r.blob.bind(r);r.blob=async()=>{stats.blobs++;stats.pending++;try{return await blob();}finally{stats.pending--;stats.lastEnd=performance.now();}};}return r;}finally{stats.pending--;stats.lastEnd=performance.now();}};
   const worker={postMessage(data,ports){if(data.type==='CIV_CACHE_PRELOAD')window.__preloadPort=ports[0];else if(data.type==='CIV_CACHE_CLEAR')caches.delete('civilization-resource-v1-media').then(()=>ports[0].postMessage({ok:true}));}};
   Object.defineProperty(navigator,'serviceWorker',{value:{controller:worker,ready:Promise.resolve({active:worker}),register:async()=>({active:worker})},configurable:true});window.confirm=()=>true;window.alert=()=>{};
  });
  const code=variant==='before'?cp.execFileSync('git',['show','9e9ed6292499fd5546842bb8ee55384fcde0bb1e:resource-cache-client.js'],{encoding:'utf8'}):fs.readFileSync('resource-cache-client.js','utf8');await page.addScriptTag({content:code});
  await page.evaluate(()=>CivilizationResourceCache.updateSettingsStatus());
  const result=await page.evaluate(async()=>{
   const started=performance.now();await CivilizationResourceCache.startBackgroundPreload();for(let i=1;i<=30;i++){__preloadPort.postMessage({phase:'progress',total:100,done:i*3});await new Promise(r=>setTimeout(r,0));}__preloadPort.postMessage({phase:'complete',total:100,done:100});
   await new Promise(r=>setTimeout(r,100));while(__cacheStats.pending)await new Promise(r=>setTimeout(r,10));
   const cost={...__cacheStats,elapsedMs:performance.now()-started,text:document.getElementById('localResourceCacheStatus').textContent};
   // Force an in-flight old cache handle while clear deletes its named entry.
   const oldKeys=Cache.prototype.keys;let release,entered;const begun=new Promise(r=>entered=r),gate=new Promise(r=>release=r);
   Cache.prototype.keys=async function(...args){const result=await oldKeys.apply(this,args);entered();await gate;return result;};
   const scan=CivilizationResourceCache.updateSettingsStatus();await begun;const clearing=CivilizationResourceCache.clearWithConfirmation();await new Promise(r=>setTimeout(r,40));Cache.prototype.keys=oldKeys;release();await Promise.all([scan,clearing]);
   const clearedText=document.getElementById('localResourceCacheStatus').textContent;const c=await caches.open('civilization-resource-v1-media');await c.put('/restored.bin',new Response('restored'));await CivilizationResourceCache.updateSettingsStatus();
   return {cost,clearedText,restoredText:document.getElementById('localResourceCacheStatus').textContent};
  });
  rows.push({variant,run,...result});if(variant==='after'){assert(result.cost.match<=200);assert.match(result.clearedText,/0 個資源/);assert.match(result.restoredText,/1 個資源/);assert(!result.cost.text.includes('正在背景下載'));}
  await page.close();
 }
 fs.writeFileSync('work/batch3/cache-browser-before-after.json',JSON.stringify(rows,null,2));console.log(rows);
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
