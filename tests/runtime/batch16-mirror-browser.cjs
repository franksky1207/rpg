'use strict';
const {chromium}=require('playwright'),fs=require('node:fs'),assert=require('node:assert/strict');
const base=process.env.RUNTIME_SMOKE_URL||'http://127.0.0.1:4173/index.html';
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||(fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined),args:['--no-sandbox']}),report={passed:false,realDevice:false,rows:[]};
try{for(const viewport of [{width:1365,height:900},{width:390,height:844},{width:844,height:390}]){
 const page=await browser.newPage({viewport});await page.route('**/batch16-mirror.html',r=>r.fulfill({contentType:'text/html',body:'<iframe style="border:0;width:100%;height:95vh" src="batch16-mirror-frame.html?embedded=1"></iframe>'}));
 await page.route('**/batch16-mirror-frame.html?embedded=1',r=>r.fulfill({contentType:'text/html',body:'<base href="./3d-test/"><link rel="stylesheet" href="formal-player-sprites.css"><div id="gm"></div><div id="formal" style="height:180px;position:relative;overflow:hidden"></div>'}));
 await page.goto(new URL('batch16-mirror.html',base).href);await page.evaluate(()=>addEventListener('message',e=>{if(e.data?.type==='civilization3d:sprite-auth')e.source.postMessage({type:'civilization3d:sprite-auth-response',requestId:e.data.requestId,authorized:true},location.origin);}));
 const frame=page.frames()[1];await frame.waitForLoadState();await frame.addScriptTag({url:new URL('3d-test/t3b-formal-renderer.js',base).href});
 const result=await frame.evaluate(async()=>{
  window.requestAnimationFrame=()=>0;const {mount}=await import('./gm-era-sprites.mjs');const gm=document.querySelector('#gm'),host=document.querySelector('#formal'),mounted=await mount({host:gm}),rows=[];
  const wait=async fn=>{const end=performance.now()+10000;while(!fn()){if(performance.now()>end)throw Error('timeout');await new Promise(r=>setTimeout(r,5));}};
   // Enter the current two-layer GM UI before the frozen identity fixture mutates selections.
   gm.querySelector('[data-preview-mode]').value='duel';gm.querySelector('[data-preview-mode]').dispatchEvent(new Event('change'));
   gm.querySelector('[data-enter]').click();await wait(()=>gm.querySelector('canvas[data-monster]')&&mounted.diagnostics().presenting);
  const select=(s,v)=>{const e=gm.querySelector(s);e.value=v;e.dispatchEvent(new Event('change'));};
  function read(c){const n=c.width,d=c.getContext('2d').getImageData(0,0,n,n).data,b=c.getBoundingClientRect();let min=n,max=-1,left=n,right=-1,count=0;for(let i=3;i<d.length;i+=4)if(d[i]>16){const x=(i-3)/4%n,y=Math.floor((i-3)/4/n);min=Math.min(min,y);max=Math.max(max,y);left=Math.min(left,x);right=Math.max(right,x);count++;}return {height:(max-min+1)/n*b.height,left:b.left+left/n*b.width,right:b.left+(right+1)/n*b.width,top:b.top+min/n*b.height,bottom:b.top+(max+1)/n*b.height,count};}
  for(const [world,era] of [[1,'galaxy'],[2,'universe']]){
   select('[data-dungeon]',era+'/mirror');await wait(()=>gm.querySelector('[data-mirror="era-'+era+'"]'));
   const gp=read(gm.querySelector('[data-suit]')),ge=read(gm.querySelector('[data-mirror]')),gmRatio=ge.height/gp.height;
   const ac=new AbortController(),api=CivilizationFormalBRenderer,bundle=await api.prepare({wholeSuit:true,eraVisualId:era,signal:ac.signal,identity:{mode:'mirror',world,name:'鏡像・測試者',playerName:'測試者'}}),renderer=await api.create({bundle,host,signal:ac.signal,isCurrent:()=>true});
   const sample=(clip='idle',elapsedMs=0)=>renderer.sample({player:{clip:'idle',elapsedMs:0},enemy:{clip,elapsedMs,approach:.42}});sample();await wait(()=>{sample();return host.querySelector('[data-mirror]');});
   const p=read(host.querySelector('[data-suit]')),e=read(host.querySelector('[data-mirror]')),ratio=e.height/p.height;
   if(ratio<1||ratio>1.5||Math.abs(ratio-gmRatio)>.001||p.right>=e.left)throw Error('mirror layout '+JSON.stringify({world,p,e,gp,ge,ratio,gmRatio,status:gm.querySelector("[data-monster-status]").textContent}));
   // Mirrored idle pixels must match the original body exactly reflected horizontally.
   sample();const pc=host.querySelector('[data-suit]'),ec=host.querySelector('[data-mirror]'),n=pc.width,pixels=pc.getContext('2d').getImageData(0,0,n,n).data,enemy=ec.getContext('2d').getImageData(0,0,n,n).data;
   let reflectedError=0,unflippedError=0;for(let y=0;y<n;y++)for(let x=0;x<n;x++)for(let k=0;k<4;k++){reflectedError+=Math.abs(pixels[(y*n+x)*4+k]-enemy[(y*n+n-1-x)*4+k]);unflippedError+=Math.abs(pixels[(y*n+x)*4+k]-enemy[(y*n+x)*4+k]);}if(reflectedError>unflippedError*.05)throw Error('mirror-facing '+JSON.stringify({reflectedError,unflippedError}));
   for(const clip of ['attack','hit','dodge','return','defeat'])for(let ms=0;ms<=700;ms+=35){sample(clip,ms);const enemy=read(ec);if(clip!=='defeat'&&(!enemy.count||enemy.left<host.getBoundingClientRect().left||enemy.right>host.getBoundingClientRect().right||p.right>=enemy.left))throw Error('mirror action '+clip+':'+ms);}
   rows.push({world,appearance:era,gmRatio,ratio,reflectedError,unflippedError,reflectedRaster:true,sixActions:true});renderer.dispose();ac.abort();api.clearSpriteCache();if(api.spriteStats().refs!==0)throw Error('mirror lease');
  }
  mounted.dispose();return rows;
 });report.rows.push(...result.map(row=>({viewport,...row})));console.log('PASS mirror',viewport.width);await page.close();
}report.passed=true;}finally{fs.writeFileSync('/tmp/batch16-mirror.json',JSON.stringify(report,null,2));await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
