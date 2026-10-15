'use strict';
const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
(async()=>{
 const root=path.resolve(__dirname,'../..'),server=http.createServer((req,res)=>{let file;try{file=path.resolve(root,'.'+decodeURIComponent(req.url.split('?')[0]));if(!file.startsWith(root+path.sep))throw Error();if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');const ext=path.extname(file);res.setHeader('Content-Type',({'.html':'text/html','.mjs':'text/javascript','.json':'application/json','.webp':'image/webp','.png':'image/png'})[ext]||'text/plain');res.end(fs.readFileSync(file));}catch{res.statusCode=404;res.end('missing');}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 try{
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||(fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined),args:['--no-sandbox']});const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`http://127.0.0.1:${server.address().port}/development/equipment-2_5d/v1/`);await page.waitForFunction(()=>document.querySelector('#status').textContent.includes('素材完成'));
 const result=await page.evaluate(async()=>{
  const {createSpritePool}=await import('./assets.mjs'),{WholeSuitActor}=await import('./actor.mjs');const reg=await(await fetch('./registry.json')).json(),pool=createSpritePool();const checks=[];
  const checksum=c=>{const data=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let n=0;for(let i=0;i<data.length;i++)n=(n+data[i]*(i%251+1))%1000000007;return n;};
  const gallery=document.createElement('div');gallery.id='verified-characters';gallery.style.cssText='display:flex;gap:8px;flex-wrap:wrap';document.body.append(gallery);
  for(const entry of reg.entries){
   const actor=await new WholeSuitActor(pool,entry,{tier:'low'}).init(),hashes={};
   for(const clip of ['idle','attack','hit','dodge','defeat']){actor.draw({clip,ms:0,rootMotion:true});const first=checksum(actor.canvas);actor.draw({clip,ms:350,rootMotion:true});const second=checksum(actor.canvas);if(first===second)throw Error(entry.id+' '+clip+' has no visible animation');hashes[clip]=[first,second];}
   actor.draw({clip:'idle',ms:0});const copy=document.createElement('canvas');copy.width=copy.height=128;copy.getContext('2d').drawImage(actor.canvas,0,0);const block=document.createElement('div'),label=document.createElement('p');label.textContent=entry.id+' · 128px';block.append(label,copy);gallery.append(block);checks.push({id:entry.id,hashes,pixels:actor.canvas.width,complete:entry.status==='complete'});actor.dispose();actor.dispose();
  }
  for(let i=0;i<20;i++){const a=await pool.acquire(reg.entries[0]);a.release();}
  const warm=pool.stats();pool.clear();const after=pool.stats();pool.dispose();
  let badSHA=false,bad404=false;try{const bad=createSpritePool();await bad.acquire({...reg.entries[0],asset:{...reg.entries[0].asset,sha256:'0'.repeat(64)}});}catch{badSHA=true;}
  try{const bad=createSpritePool({fetcher:async()=>new Response('not found',{status:404})});await bad.acquire(reg.entries[0]);}catch{bad404=true;}
  return {checks,warm,after,badSHA,bad404,canCommit:false,physicalDevice:false};
 });
 assert.equal(result.checks.length,3);assert.ok(result.checks.every(c=>c.complete));assert.equal(result.warm.loads,3);assert.ok(result.warm.hits>=20);assert.equal(result.after.bytes,0);assert.equal(result.after.entries,0);assert.ok(result.badSHA&&result.bad404);
 for(const id of ['g007','g018','g005']){await page.selectOption('#character',id);await page.waitForFunction(id=>document.querySelector('#status').textContent.startsWith(id+' 素材完成'),id);await page.selectOption('#clip','attack');await page.click('#play');await page.click('#cancel');}
 await page.click('#release');await page.waitForFunction(()=>JSON.parse(document.querySelector('#stats').textContent).bytes===0);await page.screenshot({path:process.env.SPRITE_SCREENSHOT||'/tmp/equipment-phase3-browser.png',fullPage:true});assert.deepEqual(errors,[]);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'mobile horizontal overflow');
 await page.setViewportSize({width:1365,height:900});await page.selectOption('#character','g007');await page.waitForFunction(()=>document.querySelector('#status').textContent.startsWith('g007 素材完成'));result.viewports=[{width:390,height:844},{width:1365,height:900}];
 result.browser='Chromium headless at 390x844 CSS px; actual image decode and canvas raster, not a physical phone';result.pageErrors=errors;
 fs.writeFileSync(process.env.SPRITE_REPORT||'/tmp/equipment-phase3-browser.json',JSON.stringify(result,null,2)+'\n');console.log('PASS 3 real sprites x 5 visible animation templates, 128px raster, switching/cancel, warm cache, SHA/404 fallback and release');
 }finally{await browser?.close();await new Promise(r=>server.close(r));}
})().catch(error=>{console.error(error);process.exitCode=1;});
