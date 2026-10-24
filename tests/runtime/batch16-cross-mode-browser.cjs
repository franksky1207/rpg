'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
const base=process.env.RUNTIME_SMOKE_URL||'http://127.0.0.1:4173/index.html';
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||(fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined),args:['--no-sandbox']});
try{const page=await browser.newPage({viewport:{width:390,height:844}});await page.route('**/batch16-switch.html',r=>r.fulfill({contentType:'text/html',body:'<div id="stage" style="position:relative;width:360px;height:240px"></div>'}));await page.goto(new URL('batch16-switch.html',base).href);await page.addScriptTag({url:new URL('3d-test/t3b-formal-renderer.js',base).href});
const report=await page.evaluate(async specialRows=>{
 const {mappings}=await import('./3d-test/monster-sprites.mjs'),api=CivilizationFormalBRenderer,host=document.querySelector('#stage'),rows=[],sampleCpuMs=[];
 const wait=async f=>{const end=performance.now()+10000;while(!f()){if(performance.now()>end)throw Error('switch-timeout');await new Promise(r=>setTimeout(r,2));}};
 const ids=['galaxy-map-001','galaxy-bounty-01','universe-arena-03','void-regular-02','mirror','calamity','high-arena','alternate'];let renderer,ac;
 for(let pass=0;pass<10;pass++)for(const id of [...ids,...specialRows.map(r=>r.world+'/'+r.id)]){
  renderer?.dispose();ac?.abort();api.clearSpriteCache();if(host.querySelector('canvas'))throw Error('stale-canvas');if(api.monsterStats().refs||api.monsterStats().pending||api.spriteStats().refs)throw Error('stale-lease');
  const special=specialRows.find(r=>r.world+'/'+r.id===id),row=special||mappings[id],world=row?.world==='universe'?2:id==='high-arena'||id==='alternate'?3:1,mode=row?.mode||(id==='galaxy-map-001'?'main':id==='high-arena'?'arena':id);
  const identity={world,mode,name:row?.name||(id==='mirror'?'鏡像・切換者':'未授權對手'),playerName:'切換者',kind:row?.kind||'boss',location:special?special.specialId:id==='galaxy-map-001'?'0:0':row?.mode==='arena'?String(row.arenaStage):'1'};
  ac=new AbortController();const bundle=await api.prepare({wholeSuit:true,eraVisualId:world===2?'universe':'galaxy',identity,signal:ac.signal});renderer=await api.create({bundle,signal:ac.signal,isCurrent:()=>!ac.signal.aborted,host});const sample=()=>renderer.sample({player:{clip:'idle',elapsedMs:0},enemy:{clip:'idle',elapsedMs:0}});sample();
  const enabled=!!row||id==='mirror';if(enabled){await wait(()=>{sample();return host.querySelector('.formal-b-verified-monster');});if(host.querySelectorAll('.formal-b-verified-monster').length!==1)throw Error('duplicate');
   if(row?.mode){const c=host.querySelector('[data-monster]'),size=c.style.width;host.dataset.effects='off';renderer.sample({player:{clip:'idle',elapsedMs:50},enemy:{clip:'idle',elapsedMs:50}});if(c.style.filter.includes('drop-shadow')||c.style.width!==size)throw Error('effects-downgrade');delete host.dataset.effects;}
  }else{await new Promise(r=>setTimeout(r,10));if(host.querySelector('.formal-b-verified-monster')||api.monsterStats().refs)throw Error('unauthorized-visual');}
  // Background cache clearing cannot invalidate an active actor lease.
  document.dispatchEvent(new Event('visibilitychange'));api.clearSpriteCache();sample();if(!host.querySelector('.formal-b-player-sprite'))throw Error('active-lease-cleared');
  if(enabled)for(let i=0;i<60;i++){const start=performance.now();renderer.sample({player:{clip:'idle',elapsedMs:i*50},enemy:{clip:'idle',elapsedMs:i*50}});sampleCpuMs.push(performance.now()-start);}
  rows.push({pass,id,mode,world,enabled});
 }
 // Effects-off must disable new body motion/flash as well as CSS glow.
 const {MonsterActor}=await import('./3d-test/monster-actor.mjs'),{createMonsterPool}=await import('./3d-test/monster-sprite-pool.mjs'),probes=createMonsterPool(),probe=document.createElement('div');probe.dataset.effects='off';document.body.append(probe);
 let effectsOffBodies=0;
 for(const id of ['void-regular-02','void-regular-04','void-regular-05','void-regular-09']){
  const row=mappings[id],visual=await new MonsterActor(probes,row.assetId,{identity:id}).init(),raw=await new MonsterActor(probes,row.assetId).init();probe.append(visual.canvas);visual.draw({clip:'idle',elapsedMs:400});raw.draw({clip:'idle',elapsedMs:400});
  const prototypePixels=raw.ctx.getImageData(0,0,256,256).data;
  // Bare actor supplies the unchanged base pose; borrow only the static identity raster.
  raw.appearanceSource=visual.appearanceSource;raw.draw({clip:'idle',elapsedMs:400});
  const a=visual.ctx.getImageData(0,0,256,256).data,b=raw.ctx.getImageData(0,0,256,256).data;if(a.some((v,i)=>v!==b[i])||!a.some((v,i)=>i%4!==3&&v!==prototypePixels[i])||visual.canvas.style.filter.includes('drop-shadow'))throw Error('effects-off-body '+id);effectsOffBodies++;visual.dispose();raw.dispose();
 }
 probes.dispose();probe.remove();renderer.dispose();ac.abort();api.clearSpriteCache();sampleCpuMs.sort((a,b)=>a-b);return {passed:true,rows,effectsOffBodies,samplingCpu:{samples:sampleCpuMs.length,p50:sampleCpuMs[Math.floor(sampleCpuMs.length*.5)],p95:sampleCpuMs[Math.floor(sampleCpuMs.length*.95)],max:Math.max(...sampleCpuMs),gpuAndHardwareThermalsMeasured:false},monster:api.monsterStats(),player:api.spriteStats(),realDevice:false};
},require('./batch16-special-fixtures.cjs'));assert.equal(report.rows.length,260);assert.equal(report.monster.refs,0);assert.equal(report.monster.pending,0);assert.equal(report.monster.bytes,0);assert.equal(report.player.refs,0);fs.writeFileSync('/tmp/batch16-cross-mode.json',JSON.stringify(report,null,2));console.log('PASS 260 visual mode switches, start/stop, background cache clear, effects downgrade and high/calamity/alternate exclusions');}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
