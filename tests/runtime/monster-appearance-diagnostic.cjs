'use strict';
// Failure-only evidence; no threshold, production asset or renderer changes.
const fs=require('node:fs'),cp=require('node:child_process'),os=require('node:os');
async function diagnose(browser,base,kind,failures,out){
 const report={kind,browser:browser.version(),playwright:require('playwright/package.json').version,os:{release:os.release(),arch:os.arch(),cpu:os.cpus()[0]?.model},failures,probes:[]};
 for(const baseline of [true,false]){
  const page=await browser.newPage({viewport:{width:390,height:844}});
  await page.route('**/__m3_probe.html',r=>r.fulfill({contentType:'text/html',body:'<!doctype html><title>M3 isolated evidence</title>'}));
  if(baseline)await page.route('**/__m3_main__/**',r=>{
   const path=new URL(r.request().url()).pathname.split('/__m3_main__/')[1];
   if(!path||path.split('/').includes('..'))return r.abort();
   try{return r.fulfill({body:cp.execFileSync('git',['show','origin/main:'+path],{maxBuffer:16*1024*1024}),contentType:path.endsWith('.mjs')?'text/javascript':path.endsWith('.webp')?'image/webp':'application/octet-stream'});}catch(_){return r.fulfill({status:404,body:'baseline path missing'});}
  });
  await page.route('**/__m3_golden.webp',r=>r.fulfill({contentType:'image/webp',body:cp.execFileSync('git',['show','20c7f286b32da7fc3533d34ed7561266f6969cc4:development/monster-art/full-review/effects-full/void-boss-06.webp'],{maxBuffer:4*1024*1024})}));
  await page.goto(new URL('__m3_probe.html',base).href);
  const probe=await page.evaluate(async baseline=>{
   const prefix=baseline?'./__m3_main__/':'./';
   const {prepareMonsterAppearance,resolveMonsterAppearance}=await import(prefix+'3d-test/monster-appearance.mjs');
   const {createMonsterPool}=await import(prefix+'3d-test/monster-sprite-pool.mjs'),{findAsset}=await import(prefix+'3d-test/monster-sprites.mjs');
   const spec=resolveMonsterAppearance('void-boss-06'),pool=createMonsterPool({usage:'formal'}),raw=await pool.acquire(spec.assetId),prepared=await prepareMonsterAppearance(raw.bitmap,findAsset(spec.assetId),spec);
   const im=new Image();im.src='__m3_golden.webp';await im.decode();
   const actual=prepared.source.getContext('2d').getImageData(0,0,512,512).data,readbacks=[];
   for(const willReadFrequently of [false,true]){
    const c=document.createElement('canvas');c.width=c.height=512;const ctx=c.getContext('2d',{willReadFrequently});ctx.drawImage(im,0,0);const expected=ctx.getImageData(0,0,512,512).data,pixels=[];
    for(let i=3;i<actual.length;i+=4)if(expected[i]!==actual[i])pixels.push({x:((i-3)/4)%512,y:Math.floor((i-3)/4/512),golden:expected[i],actual:actual[i]});
    readbacks.push({willReadFrequently,alphaDifferences:pixels.length,pixels});
   }
   const result={baseline,spec:spec.key,userAgent:navigator.userAgent,readbacks};raw.release();pool.dispose();prepared.body.width=prepared.source.width=1;return result;
  },baseline);report.probes.push(probe);await page.close();
 }
 fs.writeFileSync(out+'/appearance-failure-diagnostic.json',JSON.stringify(report,null,2));console.log('M3 failure evidence:',JSON.stringify(report));
}
module.exports={diagnose};
