'use strict';
const {chromium}=require('playwright'),fs=require('node:fs'),assert=require('node:assert/strict');
const base=process.env.RUNTIME_SMOKE_URL||'http://127.0.0.1:4173/index.html';
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
 const reports=[];
 try{for(const viewport of [{width:1365,height:900},{width:390,height:844},{width:844,height:390}]){
  const page=await browser.newPage({viewport});
  await page.route('**/batch17-fast-host.html',r=>r.fulfill({contentType:'text/html',body:'<iframe src="batch17-fast-frame.html?embedded=1" style="width:100%;height:100vh"></iframe>'}));
  await page.route('**/batch17-fast-frame.html?embedded=1',r=>r.fulfill({contentType:'text/html',body:'<base href="./3d-test/"><div id="gm"></div>'}));
  await page.goto(new URL('batch17-fast-host.html',base).href);
  await page.evaluate(()=>addEventListener('message',e=>{if(e.data?.type==='civilization3d:sprite-auth')e.source.postMessage({type:'civilization3d:sprite-auth-response',requestId:e.data.requestId,authorized:true},location.origin);}));
  const frame=page.frames()[1];await frame.waitForLoadState();
  const report=await frame.evaluate(async()=>{
   window.requestAnimationFrame=()=>0;
   const {mount}=await import('./gm-era-sprites.mjs'),{mappings,palettes}=await import('./monster-sprites.mjs');
   const host=document.querySelector('#gm'),mounted=await mount({host}),bosses=Object.values(mappings).filter(r=>r.status==='batch17-formal-enabled'),rows=[];
   const change=(s,value)=>{const e=host.querySelector(s);e.value=value;e.dispatchEvent(new Event('change'));};
   const wait=async fn=>{const end=performance.now()+10000;while(!fn()){if(performance.now()>end)throw Error('rapid-switch-timeout');await new Promise(r=>setTimeout(r,2));}};
   for(const final of [bosses[9],bosses[28],bosses[29]]){
    for(const row of [...bosses,final]){change('[data-monster]',row.assetId);change('[data-monster-identity]',row.id);}
    await wait(()=>host.querySelector('canvas[data-monster]')?.dataset.monster===final.assetId&&host.querySelector('[data-monster-status]').dataset.ready==='true');
    await new Promise(r=>setTimeout(r,0));
    const canvas=host.querySelector('canvas[data-monster]'),expected=document.createElement('canvas');expected.style.filter=palettes[final.visual.palette];
    if(canvas.style.filter!==expected.style.filter)throw Error('late-palette-overwrite');
    const stats=JSON.parse(host.querySelector('[data-diagnostics]').textContent).monster;
    if(stats.refs!==1||stats.pending!==0||stats.bytes>stats.limit||host.querySelectorAll('canvas[data-monster]').length!==1)throw Error('rapid-switch-lease-leak');
    rows.push({final:final.id,rapidSelections:31,stats});
   }
   host.querySelector('[data-advanced]').open=true;const gallery=host.querySelector('[data-boss-gallery]');
   host.querySelector('[data-boss-compare]').click();await wait(()=>gallery.querySelectorAll('figure').length===30);
   if(getComputedStyle(gallery).display!=='grid'||host.querySelectorAll('.gm-suit-preview canvas').length!==2)throw Error('gallery-show');
   host.querySelector('[data-boss-compare]').click();if(getComputedStyle(gallery).display!=='none'||gallery.childElementCount)throw Error('gallery-hide-retained-images');
   mounted.dispose();if(host.querySelector('canvas'))throw Error('dispose-retained-canvas');
   return {passed:true,realDevice:false,rows,disposed:true};
  });
  assert.equal(report.rows.length,3);reports.push({viewport,...report});await page.close();
 }fs.writeFileSync('/tmp/batch17-fast-switch.json',JSON.stringify({passed:true,realDevice:false,reports},null,2));console.log('PASS 279 rapid Boss selections, shared-eye palette race, bounded pool, gallery show/hide and disposal across three viewports');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
