'use strict';
const {chromium}=require('playwright'),fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});try{
 const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
 await page.route('**/batch18-pressure.html',r=>r.fulfill({contentType:'text/html',body:'<div id="stage" style="position:relative;width:374px;height:240px"></div>'}));
 await page.goto(new URL('batch18-pressure.html',process.env.RUNTIME_SMOKE_URL||'http://127.0.0.1:4173/index.html').href);
 const cdp=await page.context().newCDPSession(page);await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});await cdp.send('HeapProfiler.collectGarbage');const before=await cdp.send('Runtime.getHeapUsage');
 await page.addScriptTag({url:new URL('3d-test/t3b-formal-renderer.js',page.url()).href});
 const report=await page.evaluate(async()=>{
  const {mappings}=await import('./3d-test/monster-sprites.mjs'),api=CivilizationFormalBRenderer,host=document.querySelector('#stage');
  const all=Object.values(mappings).filter(r=>r.status==='batch18-formal-enabled'),cultures=[...new Set(all.map(r=>r.culture))],targets=cultures.map(c=>all.find(r=>r.culture===c)),rows=[],samples=[];
  const wait=async fn=>{const end=performance.now()+10000;while(!fn()){if(performance.now()>end)throw Error('pressure-load-timeout');await new Promise(r=>setTimeout(r,1));}};
  let renderer,ac;
  async function begin(row,ready=true){renderer?.dispose();ac?.abort();ac=new AbortController();const bundle=await api.prepare({wholeSuit:true,eraVisualId:'higher',identity:{world:3,mode:'alternate',location:String(row.depth)},signal:ac.signal});renderer=await api.create({bundle,signal:ac.signal,isCurrent:()=>!ac.signal.aborted,host});const sample=()=>renderer.sample({player:{clip:'idle',elapsedMs:0},enemy:{clip:'idle',elapsedMs:0}});sample();if(ready)await wait(()=>{sample();return host.querySelector('[data-monster]')?.dataset.monster===row.assetId;});}
  const loads=api.monsterStats().loads||0;
  for(let i=0;i<30;i++){await begin(targets[0]);if(api.monsterStats().loads!==loads+1)throw Error('same-prototype-redecoded');}
  for(let pass=0;pass<5;pass++)for(const row of targets){await begin(row);if(host.querySelectorAll('.formal-b-verified-monster').length!==1)throw Error('duplicate-actor');
   for(let i=0;i<60;i++){const t=performance.now();renderer.sample({player:{clip:'idle',elapsedMs:i*50},enemy:{clip:'idle',elapsedMs:i*50}});samples.push(performance.now()-t);}
   const s=api.monsterStats();if(s.refs!==1||s.pending||s.entries>2||s.bytes>s.limit)throw Error('unbounded-pool');rows.push({pass,id:row.id,stats:s});
   document.dispatchEvent(new Event('visibilitychange'));renderer.sample({player:{clip:'idle',elapsedMs:0},enemy:{clip:'idle',elapsedMs:0}});
  }
  for(let i=0;i<200;i++)await begin(all[i%all.length],false);
  await begin(targets.at(-1));renderer.dispose();ac.abort();api.clearSpriteCache();
  const monster=api.monsterStats(),player=api.spriteStats();if(monster.refs||monster.pending||monster.bytes||player.refs||player.bytes||host.querySelector('canvas'))throw Error('dispose-resource-leak');
  samples.sort((a,b)=>a-b);return {passed:true,realDevice:false,cpuThrottle:4,samePrototypeBattles:30,samePrototypeDecodes:1,repeatedBattles:rows.length,rapidSwitches:200,rows,monster,player,samplingCpu:{samples:samples.length,p50:samples[Math.floor(samples.length*.5)],p95:samples[Math.floor(samples.length*.95)],max:Math.max(...samples)},hardwareThermalsMeasured:false};
 });
 await cdp.send('HeapProfiler.collectGarbage');report.heap={before,after:await cdp.send('Runtime.getHeapUsage')};fs.writeFileSync('/tmp/batch18-pressure.json',JSON.stringify(report,null,2));assert.equal(report.passed,true);console.log('PASS 30 same prototype battles / one decode, 100 repeated battles, 200 rapid switches, CPU4 and zero resources',report.samplingCpu,report.heap);
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
