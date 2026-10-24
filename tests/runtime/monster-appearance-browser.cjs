'use strict';
const {chromium,webkit}=require('playwright'),fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{
 const kind=process.env.APPEARANCE_BROWSER||'chromium',browser=await (kind==='webkit'?webkit:chromium).launch(kind==='webkit'?{headless:true}:{headless:true,executablePath:fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined,args:['--no-sandbox']});
 const out='work/visual-integration';fs.mkdirSync(out,{recursive:true});
 try{
 const page=await browser.newPage({viewport:{width:1600,height:1000},reducedMotion:'reduce'});await page.goto('http://127.0.0.1:4173/3d-test/monster-appearance-review.html');await page.waitForFunction(()=>window.reviewReady);
 const result=await page.evaluate(async()=>{
 const {mappings,findAsset}=await import('./monster-sprites.mjs'),{MonsterActor}=await import('./monster-actor.mjs'),{createMonsterPool}=await import('./monster-sprite-pool.mjs'),{resolveMonsterAppearance,paintMonsterAppearance,appearanceFingerprint}=await import('./monster-appearance.mjs'),{drawCodexMonster}=await import('../monstercodeximage.mjs');
 const pool=createMonsterPool({usage:'formal'}),records=[],thumbs=[],timings=[];
 const rows=Object.values(mappings).filter(r=>r.mode!=='alternate'||r.stageIndex===0).sort((a,b)=>a.assetId.localeCompare(b.assetId)||a.id.localeCompare(b.id));
 for(const row of rows){
  const started=performance.now(),actor=await new MonsterActor(pool,row.assetId,{identity:row.id,usage:'formal'}).init();actor.draw();timings.push(performance.now()-started);
  const c=document.createElement('canvas');c.width=c.height=128;const ctx=c.getContext('2d');ctx.drawImage(actor.canvas,0,0,128,128);const p=ctx.getImageData(0,0,128,128).data;
  const alpha=p.filter((_,i)=>i%4===3);const spec=resolveMonsterAppearance(row),asset=findAsset(row.assetId);
  // Recoloring must preserve every source alpha byte; layout/motion alpha remains exact.
  const lease=await pool.acquire(row.assetId),painted=paintMonsterAppearance(lease.bitmap,asset,spec),raw=document.createElement('canvas');raw.width=raw.height=512;raw.getContext('2d').drawImage(lease.bitmap,0,0);
  const before=raw.getContext('2d').getImageData(0,0,512,512).data,after=painted.getContext('2d').getImageData(0,0,512,512).data;let alphaDifferences=0;for(let i=3;i<before.length;i+=4)if(before[i]!==after[i])alphaDifferences++;
  // Compare two consumers' source fingerprints; the codex uses its existing centering.
  if(records.length%23===0){const holder=document.createElement('div'),codex=document.createElement('canvas'),status=document.createElement('span');codex.width=codex.height=512;holder.append(codex,status);document.body.append(holder);await drawCodexMonster(codex,row);if(codex.dataset.appearance!==actor.canvas.dataset.appearance)throw Error('codex/formal appearance mismatch');holder.remove();}
  records.push({id:row.id,asset:row.assetId,fingerprint:appearanceFingerprint(spec),alphaDifferences});thumbs.push({row,p:[...p]});
  lease.release();painted.width=painted.height=raw.width=raw.height=1;actor.dispose();
 }
 // Compare all same-prototype pairs at a normal 128px raster, ignoring transparent pixels.
 const pairs=[];for(let a=0;a<thumbs.length;a++)for(let b=a+1;b<thumbs.length&&thumbs[b].row.assetId===thumbs[a].row.assetId;b++){
  const x=thumbs[a],y=thumbs[b];let sum=0,n=0,changed=0;for(let i=0;i<x.p.length;i+=4)if(x.p[i+3]>32&&y.p[i+3]>32){const d=(Math.abs(x.p[i]-y.p[i])+Math.abs(x.p[i+1]-y.p[i+1])+Math.abs(x.p[i+2]-y.p[i+2]))/3;sum+=d;n++;if(d>20)changed++;}
  pairs.push({a:x.row.id,b:y.row.id,mean:sum/n,changed:changed/n});
 }
 pairs.sort((a,b)=>a.mean-b.mean);const stats=pool.stats();pool.dispose();return {records,comparisons:pairs.length,nearest:pairs.slice(0,100),suspects:pairs.filter(p=>p.mean<15||p.changed<.25),stats,after:pool.stats(),prepareMs:{median:timings.sort((a,b)=>a-b)[Math.floor(timings.length/2)],p95:timings[Math.floor(timings.length*.95)]}};
 });
 fs.writeFileSync(out+'/pixels-'+kind+'.json',JSON.stringify(result,null,2));assert.equal(result.records.length,895);assert.ok(result.records.every(r=>r.alphaDifferences===0));assert.ok(result.stats.bytes<=2097152);assert.equal(result.after.refs,0);assert.equal(result.after.bytes,0);assert.deepEqual(result.suspects,[],'near duplicates need correction');
 await page.selectOption('#group','alternate');await page.waitForFunction(()=>window.reviewReady);for(const asset of await page.locator('#asset option').evaluateAll(ns=>ns.map(n=>n.value))){await page.selectOption('#asset',asset);await page.waitForFunction(()=>window.reviewReady);if(await page.locator('#gallery canvas').count()===10)await page.locator('#gallery').screenshot({path:out+'/alternate-'+asset+'-'+kind+'.png'});}
 for(const group of ['galaxy','universe','calamity','higher','special','dungeon','mirror']){await page.selectOption('#group',group);await page.waitForFunction(()=>window.reviewReady);await page.locator('#gallery').screenshot({path:out+'/'+group+'-'+kind+'.png'});}
 await page.setViewportSize({width:390,height:844});await page.selectOption('#group','prototype');await page.waitForFunction(()=>window.reviewReady);await page.selectOption('#asset','hm-02');await page.waitForFunction(()=>window.reviewReady);
 const original=await page.locator('#focus canvas').getAttribute('data-appearance');await page.click('#next');await page.waitForFunction(value=>document.querySelector('#focus canvas')?.dataset.appearance!==value,original);await page.locator('#focus').screenshot({path:out+'/mobile-next-'+kind+'.png'});await page.click('#prev');await page.waitForFunction(value=>document.querySelector('#focus canvas')?.dataset.appearance===value,original);
 console.log('PASS',kind,result.records.length,'sources; alpha exact;',result.comparisons,'same-prototype pairs; nearest',result.nearest[0],result.prepareMs);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
