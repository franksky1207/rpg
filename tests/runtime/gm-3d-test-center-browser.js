'use strict';
// Batch 2-2: GM viewer should expose only two functional 2.5D previews.
const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--use-gl=angle','--use-angle=swiftshader']});
 try{
  for(const viewport of [{width:1280,height:800},{width:390,height:844},{width:844,height:390}]){
   const page=await browser.newPage({viewport}),errors=[];
   page.on('pageerror',error=>errors.push(String(error)));
   const base=process.env.RUNTIME_SMOKE_URL||'http://127.0.0.1:4173/index.html';
   await page.goto(new URL('3d-test/?embedded=1',base).href,{waitUntil:'domcontentloaded',timeout:60000});
   await page.waitForFunction(()=>window.Civilization3DTestCenter?.version===6,null,{timeout:30000});
   assert.deepEqual(await page.evaluate(()=>window.Civilization3DTestCenter.caseIds),['C-08-CHARACTER','C-15-BATTLE']);
   assert.deepEqual(await page.evaluate(()=>window.Civilization3DTestCenter.categoryIds),['character','combat']);
   assert.equal(await page.locator('#categoryList .center-category').count(),2);
   assert.equal(await page.locator('#caseList .center-case').count(),1);
   assert.equal(await page.locator('#caseSearch').isVisible(),false);
   assert.equal(await page.locator('#backToGame').isVisible(),false);
   for(const obsolete of ['三紀元主畫面','五槽裝備陳列','強化鍛造台','懸賞戰準備區','雲端存檔中心','原 3D 角色']){
    assert.ok(!(await page.locator('body').innerText()).includes(obsolete),'obsolete GM scene exposed: '+obsolete);
   }
   await page.locator('#categoryList').getByRole('button',{name:'角色與動作'}).click();
   await page.waitForSelector('.gm-suit-status',{timeout:30000});
   assert.equal(await page.locator('.gm-suit-actions button').count(),7);
   assert.equal(await page.locator('#gmWholeSuitPicker').count(),0);
   assert.equal(await page.locator('#gmBattleViewPicker').count(),0);
   assert.equal(await page.locator('.gm-suit-preview canvas').count(),0,'unauthorized standalone cannot show protected sprite');
   await page.locator('#categoryList').getByRole('button',{name:'戰場與對戰'}).click();
   await page.waitForSelector('.gm-b-simulation',{timeout:45000});
   assert.equal(await page.locator('.gm-suit').count(),0,'category switch disposes old sprite view');
   assert.deepEqual(await page.locator('[data-b="speed"] option').evaluateAll(items=>items.map(x=>x.value)),['1','1.5','2']);
   for(const action of ['play','pause','resume','replay','stop'])assert.equal(await page.locator('[data-b="'+action+'"]').count(),1);
   await page.locator('#maximizePreview').click();
   assert.equal(await page.locator('body').evaluate(x=>x.classList.contains('gm-3d-maximized')),true);
   await page.keyboard.press('Escape');
   assert.equal(await page.locator('body').evaluate(x=>x.classList.contains('gm-3d-maximized')),false);
   await page.locator('#categoryList').getByRole('button',{name:'角色與動作'}).click();
   await page.waitForSelector('.gm-suit-status',{timeout:30000});
   assert.equal(await page.locator('.gm-b-simulation').count(),0,'category switch disposes battle view');
   assert.deepEqual(errors.filter(e=>/test-center\.js|gm-whole-suit|gm-battle-simulation/.test(e)),[]);
   await page.close();
  }
  console.log('PASS two visual categories, real 2.5D controllers, unauthorized fallback, lifecycle, mobile and maximize');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
