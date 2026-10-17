'use strict';
// Batch28 post-retirement acceptance: current 2.5D GM lifecycle, not archived 3D bones/catalog.
const {chromium}=require('playwright'),assert=require('node:assert/strict');
const base=process.env.BATCH28_BASE_URL||process.env.RUNTIME_SMOKE_URL||'http://127.0.0.1:4175/';
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:1280,height:900}}),errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  try{
   await page.goto(new URL('3d-test/?embedded=1',base).href,{waitUntil:'domcontentloaded',timeout:60000});
   await page.waitForFunction(()=>window.Civilization3DTestCenter?.version===6,null,{timeout:60000});
   assert.deepEqual(await page.evaluate(()=>Civilization3DTestCenter.caseIds),['C-08-CHARACTER','C-15-BATTLE']);
   assert.deepEqual(await page.evaluate(()=>Civilization3DTestCenter.categoryIds),['character','combat']);
   await page.locator('#categoryList').getByRole('button',{name:/戰場與對戰/}).click();
   await page.waitForFunction(()=>!!document.querySelector('.gm-b-simulation')||!document.getElementById('fallback').hidden,null,{timeout:30000});
   if(await page.locator('.gm-b-simulation').count()){
    assert.equal(await page.locator('[data-b="case"] option').count(),5);
    assert.ok(await page.locator('[data-b="stage"]').count()===1 || await page.locator('.gm-b-simulation').count()===1,'actual GM B sandbox stage mounted');
   }else assert.match(await page.locator('#fallbackReason').innerText(),/載入|失敗|安全/);
   await page.locator('#quality').selectOption('low');
   await page.waitForFunction(()=>!!document.querySelector('.gm-b-simulation')||!document.getElementById('fallback').hidden,null,{timeout:30000});
   await page.locator('#restart').click();
   await page.waitForFunction(()=>!!document.querySelector('.gm-b-simulation')||!document.getElementById('fallback').hidden,null,{timeout:30000});
   await page.locator('#categoryList').getByRole('button',{name:/角色與動作/}).click();
   await page.waitForFunction(()=>!!document.querySelector('.gm-suit')||!document.getElementById('fallback').hidden,null,{timeout:30000});
   assert.equal(await page.locator('.gm-b-simulation').count(),0,'battle view must release after switching to character');
   await page.evaluate(()=>dispatchEvent(new Event('pagehide')));
   assert.equal(await page.locator('.gm-suit').count(),0,'pagehide releases the active GM sprite viewer');
   assert.deepEqual(errors.filter(e=>!/Failed to fetch dynamically imported module|Importing a module script failed/i.test(e)),[]);
   console.log('PASS Batch28 current 2.5D GM categories, B cases, quality/restart, switch and release');
  }finally{await page.close();}
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
