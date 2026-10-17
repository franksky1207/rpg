'use strict';
// The old 31-scene Babylon loader is retired from GM. Verify real 2.5D module
// retries, independent rendering and bounded disposal instead.
const {chromium}=require('playwright'),assert=require('node:assert/strict');
const base=process.env.RUNTIME_SMOKE_URL||'http://127.0.0.1:4173/index.html';
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--use-gl=angle','--use-angle=swiftshader']});
 try{
  for(const viewport of [{width:1280,height:800},{width:390,height:844}]){
   const page=await browser.newPage({viewport}),errors=[],requests=[];
   page.on('pageerror',e=>errors.push(String(e)));
   page.on('request',r=>requests.push(new URL(r.url()).pathname));
   let failed=false;
   await page.route('**/gm-whole-suit.mjs*',route=>{
    if(!failed){failed=true;return route.fulfill({status:503,body:'transient GM sprite-module failure'});}
    return route.continue();
   });
   await page.goto(new URL('3d-test/',base).href,{waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>window.Civilization3DTestCenter?.version===6);
   await page.waitForFunction(()=>!document.getElementById('fallback').hidden,null,{timeout:30000});
   assert.match(await page.locator('#fallbackReason').innerText(),/載入失敗/);
   assert.equal(await page.locator('#categoryList .center-category').count(),2);
   await page.locator('#restart').click();
   await page.waitForSelector('.gm-suit-status',{timeout:30000});
   assert.equal(await page.locator('#fallback').isVisible(),false);
   await page.locator('#categoryList').getByRole('button',{name:'戰場與對戰'}).click();
   await page.waitForSelector('.gm-b-simulation',{timeout:30000});
   assert.equal(await page.locator('.gm-suit').count(),0,'character controller disposed');
   await page.locator('#categoryList').getByRole('button',{name:'角色與動作'}).click();
   await page.waitForSelector('.gm-suit-status',{timeout:30000});
   assert.equal(await page.locator('.gm-b-simulation').count(),0,'battle controller disposed');
   assert.equal(requests.some(p=>/prototype-engine\.js|shared-loader\.js|alternateuniversedata\.js/.test(p)),false,
    'obsolete 3D scene loader is not a GM viewing prerequisite');
   assert.deepEqual(errors.filter(e=>!/transient GM sprite-module failure|Failed to fetch dynamically imported module/i.test(e)),[]);
   await page.close();
  }
  console.log('PASS two 2.5D GM modules, transient JS-load retry, no legacy 3D scene loader, mobile disposal');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
