'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:1600,height:1000}});
  await page.goto(process.env.RUNTIME_SMOKE_URL||'http://127.0.0.1:4173/');
  const result=await page.evaluate(async()=>{
   const {mappings,palettes,registry}=await import('./3d-test/monster-sprites.mjs?v=20261024-au-ten-stages1');
   const {createMonsterPool}=await import('./3d-test/monster-sprite-pool.mjs?v=20261024-au-ten-stages1');
   const pool=createMonsterPool({usage:'formal'}),rows=Object.values(mappings).filter(r=>r.mode==='alternate'&&r.stageIndex===0).sort((a,b)=>a.assetId.localeCompare(b.assetId)||a.visual.appearanceTier-b.visual.appearanceTier);
   const container=document.createElement('div');container.id='swatches';container.style='position:absolute;top:0;left:0;z-index:999999;display:grid;grid-template-columns:repeat(10,160px);background:#101729;color:white;';document.body.replaceChildren(container);const records=[];
   for(const row of rows){
    const lease=await pool.acquire(row.assetId),cell=document.createElement('div'),canvas=document.createElement('canvas');canvas.width=canvas.height=144;cell.append(canvas);const ctx=canvas.getContext('2d');ctx.filter=palettes[row.visual.palette];ctx.drawImage(lease.bitmap,0,0,144,144);
    const pixels=ctx.getImageData(0,0,144,144).data,hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',pixels))].map(v=>v.toString(16).padStart(2,'0')).join('');
    const base=document.createElement('canvas');base.width=base.height=144;const b=base.getContext('2d');b.drawImage(lease.bitmap,0,0,144,144);const original=b.getImageData(0,0,144,144).data;let alphaSame=true,difference=0,count=0;
    for(let i=0;i<pixels.length;i+=4){if(pixels[i+3]!==original[i+3])alphaSame=false;if(pixels[i+3]>16){count++;for(let k=0;k<3;k++)difference+=Math.abs(pixels[i+k]-original[i+k]);}}
    records.push({id:row.id,asset:row.assetId,tier:row.visual.appearanceTier,hash,alphaSame,meanColorDifference:difference/(count*3)});
    cell.append(document.createTextNode(row.culture+' '+row.visual.appearanceTier));container.append(cell);lease.release();
   }
   const stats=pool.stats();pool.dispose();return {records,stats,after:pool.stats()};
  });
  assert.equal(result.records.length,200);assert.equal(new Set(result.records.map(r=>r.hash)).size,200);for(const r of result.records){assert.ok(r.alphaSame);assert.ok(r.meanColorDifference>5,JSON.stringify(r));}assert.ok(result.stats.bytes<=2*512*512*4);assert.equal(result.after.bytes,0);
  await page.locator('#swatches').screenshot({path:'/tmp/batch20-alternate-ten-stages.png'});fs.writeFileSync('/tmp/batch20-alternate-colors.json',JSON.stringify({passed:true,realDevice:false,...result},null,2));console.log('PASS 200 unique rendered colors; alpha unchanged, original differs, <=2 decoded images, dispose releases all');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
