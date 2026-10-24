// Local server required. Exports both modes from the same formal Actor review route.
const {chromium}=require('playwright'),fs=require('node:fs');
(async()=>{const b=await chromium.launch({headless:true,executablePath:fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined,args:['--no-sandbox']});try{
 const p=await b.newPage({viewport:{width:1180,height:900}});await p.goto('http://127.0.0.1:4173/3d-test/monster-art-samples.html');await p.waitForFunction(()=>window.reviewReady);
 const out='docs/monster-art-samples';fs.mkdirSync(out,{recursive:true});
 await p.screenshot({path:out+'/abc-desktop.png',fullPage:true});await p.setViewportSize({width:390,height:844});await p.screenshot({path:out+'/abc-mobile.png',fullPage:true});
 await p.check('#bodyOnly');await p.waitForFunction(()=>window.reviewReady);const bodies=await p.locator('article canvas').evaluateAll(cs=>cs.map(c=>c.toDataURL('image/png')));
 await p.setViewportSize({width:1180,height:900});await p.screenshot({path:out+'/abc-body-desktop.png',fullPage:true});await p.setViewportSize({width:390,height:844});await p.screenshot({path:out+'/abc-body-mobile.png',fullPage:true});
 await p.uncheck('#bodyOnly');await p.waitForFunction(()=>window.reviewReady);
 const html=await p.evaluate(bodies=>{
  [...document.querySelectorAll('article canvas')].forEach((c,i)=>{const img=document.createElement('img');img.src=img.dataset.full=c.toDataURL('image/png');img.dataset.body=bodies[i];img.style='display:block;width:100%;max-width:192px;margin:auto';img.alt=c.nextElementSibling.textContent;c.replaceWith(img);});
  document.querySelector('script').remove();document.querySelector('#clip').closest('label').remove();document.querySelector('header a').remove();
  document.querySelector('#status').textContent='第二輪離線比較 · A 原型／B 第一輪固定版／C 第二輪 · 可切換僅本體；動作定格請用本機互動頁。';
  const script=document.createElement('script');script.textContent="document.querySelector('#bodyOnly').onchange=e=>document.querySelectorAll('article img').forEach(i=>i.src=e.target.checked?i.dataset.body:i.dataset.full);document.querySelector('#background').onchange=e=>document.body.className=e.target.value;document.querySelector('#zoom').onclick=()=>document.querySelector('main').classList.toggle('zoom');";document.body.append(script);
  return '<!doctype html>'+document.documentElement.outerHTML;
 },bodies);fs.writeFileSync(out+'/abc-offline.html',html);
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
