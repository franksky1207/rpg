'use strict';
const fs=require('node:fs'),vm=require('node:vm'),cp=require('node:child_process'),assert=require('node:assert/strict'),{webcrypto,createHash}=require('node:crypto');
const source=p=>process.env.CACHE_SOURCE_REF?cp.execFileSync('git',['show',process.env.CACHE_SOURCE_REF+':'+p],{encoding:'utf8'}):fs.readFileSync(p,'utf8');
const tick=()=>new Promise(r=>setImmediate(r));
function basic(r){Object.defineProperty(r,'type',{value:'basic'});const clone=r.clone.bind(r);r.clone=()=>basic(clone());return r;}
async function workerBench({clearDuring=false,manifestFails=false,assetFails=false}={}){
 const events={},stored=new Map(),calls={fetch:0,match:0,put:0},scope='https://example.test/rpg/';
 const files=Object.fromEntries(Array.from({length:30},(_,i)=>['assets/backgrounds/test-'+i+'.webp',createHash('sha256').update('media').digest('hex').slice(0,24)]));
 const cache={keys:async()=>[...stored.keys()].map(x=>new Request(x)),match:async key=>{calls.match++;return stored.get(String(key))?.clone();},put:async(key,r)=>{calls.put++;stored.set(String(key),r.clone());},delete:async k=>stored.delete(String(k))};
 const caches={open:async()=>cache,keys:async()=>['civilization-resource-v1-media'],delete:async()=>{stored.clear();return true;}};
 let release;const blocked=new Promise(r=>release=r);let hold=true;
 const fetch=async req=>{const u=typeof req==='string'?req:req.url||req.href;if(u.endsWith('resource-manifest.json')){if(manifestFails)throw Error('manifest offline');return new Response(JSON.stringify({schema:1,algorithm:'sha256-96',files}));}calls.fetch++;if(hold){hold=false;await blocked;}return assetFails?new Response('unavailable',{status:503}):basic(new Response('media'));};
 const self={registration:{scope},addEventListener:(n,fn)=>events[n]=fn};
 vm.runInNewContext(source('resource-cache-sw.js')+';self.reporterCount=()=>typeof preloadReporters==="undefined"?null:preloadReporters.size;',{self,caches,fetch,URL,Request,Response,Headers,TextEncoder,crypto:webcrypto,Uint8Array,Map,Set,console});
 function send(type){const messages=[];let work;events.message({data:{type},ports:[{postMessage:x=>messages.push(x)}],waitUntil:p=>work=p});return {messages,work};}
 const started=performance.now(),a=send('CIV_CACHE_PRELOAD');await tick();const b=send('CIV_CACHE_PRELOAD');await tick();
 if(clearDuring)await send('CIV_CACHE_CLEAR').work;
 release();await Promise.all([a.work,b.work]);
 const initialStored=stored.size,fetches=calls.fetch;const next=send('CIV_CACHE_PRELOAD');await next.work;
 return {ms:performance.now()-started,calls,a:a.messages,b:b.messages,stored:initialStored,warmFetches:calls.fetch-fetches,recoveredStored:stored.size,retainedReporters:self.reporterCount()};
}
async function clientBench(){
 let receive;const calls={keys:0,match:0,blob:0,writes:0};let text='';const target={isConnected:true,get textContent(){return text;},set textContent(v){text=v;calls.writes++;}};
 const cache={keys:async()=>{calls.keys++;return Array.from({length:100},(_,i)=>'key-'+i);},match:async()=>{calls.match++;return {headers:{get:()=>null},blob:async()=>{calls.blob++;return {size:1000};}};}};
 class Channel{constructor(){this.port1={close(){},set onmessage(fn){receive=fn;}};this.port2={};}}
 const worker={postMessage(){}};const g={caches:{open:async()=>cache},addEventListener(){},dispatchEvent(){}};
 vm.runInNewContext(source('resource-cache-client.js'),{window:g,navigator:{serviceWorker:{ready:Promise.resolve({active:worker}),controller:worker}},location:{protocol:'https:'},document:{readyState:'loading',getElementById:()=>target},caches:g.caches,MessageChannel:Channel,setTimeout,clearTimeout,console,Event});
 const started=performance.now();await g.CivilizationResourceCache.startBackgroundPreload();
 for(let done=3;done<=90;done+=3){receive({data:{phase:'progress',total:100,done}});await tick();}
 receive({data:{phase:'complete',total:100,done:100}});for(let i=0;i<12;i++)await tick();
 return {ms:performance.now()-started,calls,text,canRestart:await g.CivilizationResourceCache.startBackgroundPreload()};
}
(async()=>{
 const worker=await workerBench(),client=await clientBench(),failure=await workerBench({manifestFails:true}),cleared=await workerBench({clearDuring:true});
 const assetsFailed=await workerBench({assetFails:true});
 const summary={retainedReporters:worker.retainedReporters,assetFailures:[assetsFailed.a,assetsFailed.b].map(xs=>xs.at(-1)?.failed??null),worker:{ms:worker.ms,fetches:worker.calls.fetch,terminals:[worker.a,worker.b].map(xs=>xs.filter(x=>['complete','error'].includes(x.phase)).length)},client,warmFetches:worker.warmFetches,failureTerminals:[failure.a,failure.b].map(xs=>xs.filter(x=>['complete','error'].includes(x.phase)).length),clear:{stored:cleared.stored,recoveredStored:cleared.recoveredStored,terminals:[cleared.a,cleared.b].map(xs=>xs.filter(x=>['complete','error'].includes(x.phase)).length)}};
 console.log(JSON.stringify(summary,null,2));
 if(process.argv.includes('--benchmark'))return;
 assert.equal(summary.retainedReporters,0,'finished jobs release every reporter');assert.deepEqual(summary.assetFailures,[30,30],'resource failures still settle every caller');
 assert.equal(summary.warmFetches,0,'a subsequent cached preload does not fetch again');assert.equal(summary.clear.recoveredStored,30,'a new preload after clear restores resources');
 assert.equal(worker.calls.fetch,30,'concurrent callers share one download job');
 assert.deepEqual(summary.worker.terminals,[1,1],'every preload caller receives exactly one terminal notification');
 assert.deepEqual(summary.failureTerminals,[1,1],'all callers receive job errors');
 assert.deepEqual(summary.clear.terminals,[1,1],'clear settles all waiting callers');assert.equal(summary.clear.stored,0,'clear prevents stale preloader writes');
 assert(client.calls.match<=200,'progress cannot rescan every cached response');assert(client.calls.blob<=200);assert.match(client.text,/100 個資源/);assert(!client.text.includes('正在背景下載'),'completion refresh reflects idle status');
 console.log('PASS preload fan-out, failure, clear and bounded progress statistics');
})().catch(e=>{console.error(e);process.exitCode=1;});
