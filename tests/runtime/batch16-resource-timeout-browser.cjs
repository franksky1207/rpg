'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
const base=process.env.RUNTIME_SMOKE_URL||'http://127.0.0.1:4173/index.html';
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||(fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined),args:['--no-sandbox']}),report={passed:false,rows:[]};
const dungeonRows=JSON.parse(fs.readFileSync('data/monsters/monster-mappings.json')).records.filter(r=>r.id==='void-regular-02').concat(require('./batch16-special-fixtures.cjs'));
try{for(const row of dungeonRows)for(const fault of ['load-timeout']){
 const page=await browser.newPage();await page.route('**/batch15-recovery.html',r=>r.fulfill({contentType:'text/html',body:'<div id="stage" style="position:relative;width:390px;height:240px"></div>'}));
 let broken=true,held,requests=0;
 await page.route('**/'+JSON.parse(fs.readFileSync('data/monsters/monster-assets.json')).assets.find(a=>a.assetId===row.assetId).path+'*',async route=>{requests++;if(!broken||fault==='decode')return route.continue();if(fault==='leave-download'||fault==='load-timeout'){held=route;return;}if(fault==='http')return route.fulfill({status:503,body:'unavailable'});const asset=JSON.parse(fs.readFileSync('data/monsters/monster-assets.json')).assets.find(a=>a.assetId===row.assetId),bytes=Buffer.from(fs.readFileSync(asset.path));bytes[100]^=1;return route.fulfill({contentType:'image/webp',body:bytes});});
 await page.goto(new URL('batch15-recovery.html',base).href);
 await page.evaluate(fault=>{window.__decodeBroken=fault==='decode';const decode=window.createImageBitmap;window.createImageBitmap=async(...args)=>{if(window.__decodeBroken&&args[0]?.size>50000)throw Error('injected monster decode failure');return decode(...args);};},fault);
 await page.addScriptTag({url:new URL('3d-test/t3b-formal-renderer.js',base).href});
 await page.evaluate(async row=>{
  const {mappings}=await import('./3d-test/monster-sprites.mjs'),mapping=mappings[row.id],api=CivilizationFormalBRenderer;
  window.__start=async()=>{window.__ac=new AbortController();const bundle=await api.prepare({wholeSuit:true,eraVisualId:row.world==='universe'?'universe':'galaxy',identity:{mode:row.mode,world:row.world==='universe'?2:1,kind:row.kind,name:row.name,location:row.mode==='special'?row.specialId:row.mode==='arena'?String(row.arenaStage):row.mode==='void'?String(row.isBossFloor?(row.bossCycle+1)*10:1):null,id:row.id},signal:__ac.signal});window.__renderer=await api.create({bundle,signal:__ac.signal,isCurrent:()=>!__ac.signal.aborted,host:document.querySelector('#stage')});__renderer.sample({player:{clip:'idle',elapsedMs:0},enemy:{clip:'idle',elapsedMs:0}});};await __start();
 },row);
 while(!requests)await page.waitForTimeout(10);
 if(fault==='leave-download'){
  await page.waitForFunction(()=>CivilizationFormalBRenderer.monsterStats().pending===1);await page.evaluate(()=>{__ac.abort();CivilizationFormalBRenderer.clearSpriteCache();});await held.fulfill({status:503,body:'left'}).catch(()=>{});
 }else{
  await page.waitForFunction(()=>CivilizationFormalBRenderer.monsterStats().pending===0);
  if(fault==='load-timeout')await held.fulfill({status:503,body:'expired'}).catch(()=>{});
  assert.equal(await page.locator('.formal-b-verified-monster').count(),0);
  assert.equal(await page.locator('.formal-b-whole-suit').count(),1,'player survives monster failure');
  assert.equal(await page.locator('.formal-b-enemy-sprite').evaluate(e=>e.style.visibility),'','silhouette fallback remains available');
  await page.evaluate(()=>__ac.abort());
 }
 broken=false;await page.evaluate(async()=>{window.__decodeBroken=false;CivilizationFormalBRenderer.clearSpriteCache();await __start();});
 await page.locator('.formal-b-verified-monster').waitFor();
 for(let i=0;i<2;i++){
  await page.evaluate(async()=>{__ac.abort();CivilizationFormalBRenderer.clearSpriteCache();await __start();});await page.locator('.formal-b-verified-monster').waitFor();
  const stats=await page.evaluate(()=>CivilizationFormalBRenderer.monsterStats());assert.equal(stats.refs,1);assert.equal(stats.pending,0);assert.ok(stats.bytes<=stats.limit);
 }
 await page.evaluate(()=>{document.dispatchEvent(new Event('visibilitychange'));__ac.abort();CivilizationFormalBRenderer.clearSpriteCache();});
 const stats=await page.evaluate(()=>CivilizationFormalBRenderer.monsterStats());assert.equal(stats.refs,0);assert.equal(stats.pending,0);assert.equal(stats.bytes,0);
 report.rows.push({id:row.id,fault,requests,recoveredWithoutReload:true,continuousReentries:2,stats,realDevice:false});console.log('PASS dungeon recovery',row.id,fault);await page.close();
}report.passed=true;}finally{fs.writeFileSync('/tmp/batch16-resource-timeout.json',JSON.stringify(report,null,2));await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
