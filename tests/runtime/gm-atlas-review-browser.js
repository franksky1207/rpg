'use strict';
const {chromium}=require('playwright'),fs=require('node:fs'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const base=process.env.RUNTIME_SMOKE_URL||'http://127.0.0.1:4173/index.html',atlasRoot='development/hybrid-comparison/t2b2-v1/enemies/';
const rows=['normal','elite','boss'].map(kind=>{const dir=atlasRoot+kind+'/atlases/',m=JSON.parse(fs.readFileSync(dir+'atlas.json'));return {name:'internal-only '+kind,reviewed:true,layout:{durationMs:700,samples:22,clipStart:1/30,clips:Object.fromEntries(m.rows.map(r=>{const b=fs.readFileSync(dir+r.rgba);return [r.action,{...r,asset:{path:'assets/test/'+kind+'/'+r.rgba,bytes:b.length,sha256:crypto.createHash('sha256').update(b).digest('hex'),license:'test-only memory approval; original B2 license unchanged'}}];}))}};});
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined,args:['--use-gl=angle','--use-angle=swiftshader']});
 try{
  const page=await browser.newPage();
  await page.route('**/assets/test/*/*.png*',route=>{
   const parts=new URL(route.request().url()).pathname.split('/');
   route.fulfill({contentType:'image/png',body:fs.readFileSync(atlasRoot+parts[3]+'/atlases/'+parts[4])});
  });
  await page.goto(new URL('3d-test/',base).href,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.Civilization3DTestCenter?.version===6);
  assert.equal(await page.locator('#gmAtlasReview').count(),0,'old atlas viewer no longer appears in GM navigation');
  await page.addScriptTag({url:new URL('3d-test/atlas-review.js',base).href});
  await page.evaluate(()=>{
   const host=document.createElement('div');host.id='gmAtlasReview';
   document.body.append(host);
   host.__review=CivilizationGMAtlasReview.mount({host,source:'fixture',catalog:null});
  });
  assert.match(await page.locator('#gmAtlasReview').innerText(),/unavailable/);
  assert.equal(await page.locator('#gmAtlasReview canvas').count(),0);
  const before=await page.evaluate(()=>JSON.stringify(localStorage));
  await page.evaluate(rows=>{
   const host=document.getElementById('gmAtlasReview');host.__review.dispose();
   const catalog={schema:'civilization.formal.b.enemy-atlas.v1',approved:true,publish:true,entries:rows};
   host.__review=CivilizationGMAtlasReview.mount({host,source:'fixture',catalog});
  },rows);
  await page.waitForFunction(()=>document.getElementById('gmAtlasReview').__review.snapshot().ready,null,{timeout:30000});
  const report=[];
  for(let actor=0;actor<3;actor++){
   await page.getByLabel('圖集角色').selectOption(String(actor));
   await page.waitForFunction(()=>document.getElementById('gmAtlasReview').__review.snapshot().ready);
   for(const clip of ['idle','attack','hit','dodge','return','defeat']){
    await page.getByLabel('圖集動作').selectOption(clip);
    const hashes=[];
    for(const frame of [0,10,21]){
     await page.getByLabel('圖集畫格').evaluate((e,value)=>{e.value=value;e.dispatchEvent(new Event('input',{bubbles:true}));},String(frame));
     const png=await page.locator('#gmAtlasReview canvas').screenshot();
     hashes.push(crypto.createHash('sha256').update(png).digest('hex'));
    }
    assert.equal(new Set(hashes).size,3,'actual atlas frame pixels '+actor+'/'+clip);
    report.push({actor,clip,hashes});
   }
  }
  await page.evaluate(rows=>{
   const host=document.getElementById('gmAtlasReview');host.__review.dispose();
   const bad=structuredClone(rows);
   bad[0].layout.clips.idle.asset.sha256='0'.repeat(64);
   host.__review=CivilizationGMAtlasReview.mount({host,source:'fixture',catalog:{schema:'civilization.formal.b.enemy-atlas.v1',approved:true,publish:true,entries:bad}});
  },rows);
  await page.waitForFunction(()=>document.querySelector('#gmAtlasReview [role="status"]')?.textContent?.includes('unavailable'),null,{timeout:30000});
  assert.equal(await page.evaluate(()=>document.getElementById('gmAtlasReview').__review.snapshot().bitmaps),0);
  await page.evaluate(()=>{const host=document.getElementById('gmAtlasReview');host.__review.dispose();host.remove();});
  assert.equal(await page.locator('#gmAtlasReview').count(),0);
  assert.equal(await page.evaluate(()=>JSON.stringify(localStorage)),before);
  fs.writeFileSync('/tmp/gm-atlas-review-browser.json',JSON.stringify({passed:true,retiredGMEntry:true,genericValidatorPreserved:true,report},null,2));
  console.log('PASS retired atlas GM entry, standalone SHA/alpha atlas validation, three source types, six clips and safe disposal');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
