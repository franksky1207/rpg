'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{const browser=await chromium.launch({headless:true});try{
 const context=await browser.newContext({viewport:{width:390,height:844}}),page=await context.newPage(),errors=[];
 if(process.env.LOW_MEMORY==='1')await page.addInitScript(()=>{Object.defineProperty(navigator,'deviceMemory',{get:()=>2});Object.defineProperty(navigator,'hardwareConcurrency',{get:()=>2});});
 page.on('pageerror',e=>errors.push(e.message));await page.route('**/batch3-stress.html',r=>r.fulfill({contentType:'text/html',body:'<div id="stage" style="width:390px;height:240px;position:relative"></div><div><canvas id="codex" width="512" height="512"></canvas><span></span></div>'}));
 await page.goto('http://127.0.0.1:4173/batch3-stress.html');await page.addScriptTag({url:'3d-test/t3b-formal-renderer.js'});
 const cdp=await context.newCDPSession(page);await cdp.send('Performance.enable');await cdp.send('HeapProfiler.enable');
 await page.evaluate(async()=>{
  const {mappings}=await import('./3d-test/monster-sprites.mjs'),{MonsterActor}=await import('./3d-test/monster-actor.mjs'),{getSharedMonsterPool}=await import('./3d-test/monster-sprite-pool.mjs'),{getMonsterAppearanceManager}=await import('./3d-test/monster-appearance-manager.mjs'),{drawCodexMonster}=await import('./monstercodeximage.mjs');
  const api=CivilizationFormalBRenderer,pool=getSharedMonsterPool(),manager=getMonsterAppearanceManager(),records=[];let frames=0;
  function identity(row,world){const mode=row.mode||(row.kind==='special'?'special':'main');return {world,mode,name:row.name,kind:row.kind,id:row.bossId||row.id,location:mode==='alternate'?String(row.depth):((row.region-1)*10+row.mapIndex-1)+':'+(row.slot-1)};}
  async function battle(id,world){const row=mappings[id],ac=new AbortController(),started=performance.now();const bundle=await api.prepare({wholeSuit:true,eraVisualId:world===3?'higher':'galaxy',identity:identity(row,world),signal:ac.signal}),renderer=await api.create({bundle,host:document.getElementById('stage'),signal:ac.signal,isCurrent:()=>!ac.signal.aborted});
   try{while(!document.querySelector('.formal-b-verified-monster')){renderer.sample({player:{clip:'idle',elapsedMs:0},enemy:{clip:'idle',elapsedMs:0}});await new Promise(r=>setTimeout(r,5));}
    for(const clip of ['idle','attack','hit','dodge','return','defeat'])for(let i=0;i<3;i++){const t=performance.now();renderer.sample({player:{clip,elapsedMs:i*80},enemy:{clip,elapsedMs:i*80}});records.push(performance.now()-t);frames++;}
   }finally{ac.abort();}return performance.now()-started;
  }
  window.__stress={pool,manager,records,completed:0,gmSwitches:0,codexSwitches:0,battleMs:[],async run(to){for(let i=this.completed;i<to;i++){
   const id=i%10<5?'alternate-depth-'+String(i%5+1).padStart(4,'0'):['galaxy-map-003','galaxy-map-004'][i%2],world=id.startsWith('alternate')?3:1;
   this.battleMs.push(await battle(id,world));
   if(i%5===0){const ids=['galaxy-map-003','galaxy-map-009','galaxy-map-003'];for(const id of ids){const actor=await new MonsterActor(pool,mappings[id].assetId,{identity:id}).init();actor.draw({clip:'attack',elapsedMs:350});actor.dispose();this.gmSwitches++;}}
   this.completed++;
  }},async codex(){const canvas=document.getElementById('codex');const jobs=[];for(let i=0;i<100;i++){const ac=new AbortController();jobs.push(drawCodexMonster(canvas,mappings[i%2?'universe-boss-001':'universe-boss-002'],{signal:ac.signal}).catch(e=>{if(!/aborted|memory-budget/.test(e.message))throw e;}));if(i%3!==0)ac.abort();this.codexSwitches++;if(i%10===9)await Promise.all(jobs.splice(0));}await Promise.all(jobs);},stats(){return {completed:this.completed,gmSwitches:this.gmSwitches,codexSwitches:this.codexSwitches,frames,appearance:manager.stats(),prototype:pool.stats(),canvases:document.querySelectorAll('canvas').length,battleMs:this.battleMs,sampleMs:records};}};
 });
 const snapshots=[];
 async function snap(label){await cdp.send('HeapProfiler.collectGarbage');const metric=Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(x=>[x.name,x.value]));snapshots.push({label,metric,stats:await page.evaluate(()=>__stress.stats())});}
 await snap('initial');await page.evaluate(()=>__stress.run(30));await snap('30 battles');await page.evaluate(()=>__stress.run(100));await snap('100 battles');await page.evaluate(()=>__stress.codex());await snap('100 codex switches');
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));dispatchEvent(new Event('pagehide'));dispatchEvent(new Event('civilization-resource-cache-cleared'));});await snap('clear');
 await page.evaluate(async()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>false});document.dispatchEvent(new Event('visibilitychange'));dispatchEvent(new Event('pageshow'));await __stress.run(101);});await snap('reentered');
 for(const row of snapshots){assert.equal(row.stats.appearance.refs,0);assert.equal(row.stats.prototype.refs,0);assert.equal(row.stats.appearance.pending,0);assert.equal(row.stats.prototype.pending,0);assert(row.stats.appearance.bytes<=row.stats.appearance.limit);assert(row.stats.prototype.bytes<=row.stats.prototype.limit);assert.equal(row.stats.canvases,1);}
 assert.equal(snapshots.at(-1).stats.completed,101);assert.deepEqual(errors,[]);
 const out=process.env.STRESS_OUT||'work/batch3/stress-after.json';fs.writeFileSync(out,JSON.stringify({realIPhone:false,snapshots,errors},null,2));console.log(snapshots.map(x=>({label:x.label,heap:x.metric.JSHeapUsedSize,nodes:x.metric.Nodes,listeners:x.metric.JSEventListeners,refs:x.stats.appearance.refs,entries:x.stats.appearance.entries})));
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
