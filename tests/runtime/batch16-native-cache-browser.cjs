const {chromium}=require('playwright'),fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||(fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined),args:['--no-sandbox']}),context=await browser.newContext(),page=await context.newPage();
try{await page.route('**/batch16-native-cache.html',r=>r.fulfill({contentType:'text/html',body:'<p>Native cache verification</p>'}));await page.goto(new URL('batch16-native-cache.html',process.env.RUNTIME_SMOKE_URL||'http://127.0.0.1:4173/index.html').href);
const report=await page.evaluate(async()=>{
 const path='assets/monsters/v1/void/void-phantom-v01.webp',expected='6b52b6a956847f0ce77c0043187dbc3a85b6e87e12f2026476246187ff8c133d',digest=expected.slice(0,24),key=new URL(path+'?asset='+digest,location.href).href;
 const reg=await navigator.serviceWorker.register('resource-cache-sw.js',{scope:'./',updateViaCache:'none'});await navigator.serviceWorker.ready;
 const msg=type=>new Promise((resolve,reject)=>{const ch=new MessageChannel(),timer=setTimeout(()=>reject(Error('native-cache-timeout '+type)),60000),messages=[];ch.port1.onmessage=e=>{messages.push(e.data);if(e.data.phase==='complete'||e.data.phase==='error'||e.data.ok!==undefined){clearTimeout(timer);ch.port1.close();resolve(messages);}};(reg.active||reg.waiting).postMessage({type},[ch.port2]);});
 const hash=async response=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',await response.arrayBuffer()))].map(x=>x.toString(16).padStart(2,'0')).join('');
 const cold=await msg('CIV_CACHE_PRELOAD');let cache=await caches.open('civilization-resource-v1-media');if(await hash(await cache.match(key))!==expected)throw Error('native-cold-sha');
 const warm=await msg('CIV_CACHE_PRELOAD');if(warm.at(-1).saved!==0)throw Error('native-repeat-download');
 await cache.put(key,new Response('corrupt'));await msg('CIV_CACHE_REFRESH');
 const repaired=await fetch(key);if(await hash(repaired)!==expected)throw Error('native-repair-response');if(await hash(await cache.match(key))!==expected)throw Error('native-repair-disk');
 await msg('CIV_CACHE_CLEAR');cache=await caches.open('civilization-resource-v1-media');if((await cache.keys()).length)throw Error('native-clear');const redownload=await msg('CIV_CACHE_PRELOAD');if(await hash(await cache.match(key))!==expected)throw Error('native-redownload-sha');
 const entries=(await cache.keys()).map(x=>x.url);if(entries.some(x=>x.includes('/development/')||x.includes('preview.png')))throw Error('native-source-preload');
 await msg('CIV_CACHE_CLEAR');await reg.unregister();return {passed:true,nativeChromium:true,realDevice:false,sha256:expected,cold:cold.at(-1),warm:warm.at(-1),corruptDiskRepaired:true,redownload:redownload.at(-1),sourceExcluded:true};
});assert.equal(report.passed,true);fs.writeFileSync('/tmp/batch16-native-cache.json',JSON.stringify(report,null,2));console.log(report);}finally{await context.close();await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
