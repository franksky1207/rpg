'use strict';
/* GM 2.5D visual center acceptance: two categories, actual previews, no legacy
   symbolic scenes, no real-game writes, mobile maximize and safe disposal. */
const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--use-gl=angle','--use-angle=swiftshader','--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1280,height:800}}),errors=[];
 page.on('pageerror',error=>errors.push(String(error)));
 try{
  const base=process.env.RUNTIME_SMOKE_URL||'http://127.0.0.1:4173/index.html';
  await page.goto(new URL('3d-test/?embedded=1',base).href,{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>window.Civilization3DTestCenter?.version===6,null,{timeout:60000});
  const api=await page.evaluate(()=>({ids:window.Civilization3DTestCenter.caseIds,cats:window.Civilization3DTestCenter.categoryIds}));
  assert.deepEqual(api.ids,['C-08-CHARACTER','C-15-BATTLE']);
  assert.deepEqual(api.cats,['character','combat']);
  assert.equal(await page.locator('#categoryList .center-category').count(),2);
  assert.equal(await page.locator('#caseList .center-case').count(),1);
  assert.equal(await page.locator('#backToGame').isHidden(),true);
  assert.equal(await page.locator('#caseMetadata').count(),0);
  assert.equal(await page.locator('#contextTest').count(),0);
  for(const bad of ['3D 視覺測試中心','八種專精星環','懸賞戰準備區','文明紀錄與轉生','A-01-ENGINE','LOD／圖集品質']){
   if(bad==='LOD／圖集品質')continue; // battle has its own technical quality selector, handled in 2-3
   assert.ok(!(await page.locator('body').innerText()).includes(bad),'retired GM scene exposed '+bad);
  }
  await page.locator('#caseList').getByRole('button',{name:'角色與五種動作'}).click();
  await page.locator('.gm-suit-status').filter({hasText:/需要 GM 授權|正在確認 GM 權限/}).waitFor({timeout:20000});
  assert.equal(await page.locator('.gm-suit-preview canvas').count(),0,'direct iframe must not receive protected sprites');
  assert.equal(await page.locator('#fixturePanel').isVisible(),false);
  assert.equal(await page.locator('#scenarioFormal').isVisible(),false);
  for(const retired of ['#fixturePanel','#scenarioFormal','#appearanceWorld','#alternateUniverse','#dungeonArenaRank','#scenarioCalamityIndex','#gmAtlasReview']){
   assert.equal(await page.locator(retired).count(),0,'Removed 3D scenario controls must not remain in GM DOM: '+retired);
  }
  await page.locator('#categoryList').getByRole('button',{name:/戰場與對戰/}).click();
  assert.equal(await page.locator('#caseList .center-case').count(),1);
  assert.equal(await page.locator('#caseTitle').innerText(),'2.5D 戰鬥模擬');
  assert.equal(await page.evaluate(()=>window.Civilization3DTestCenter.getCurrent()),'C-15-BATTLE');
  await page.waitForFunction(()=>document.querySelector('.gm-b-simulation')||!document.querySelector('#fallback').hidden,null,{timeout:30000});
  const battleDiagnostics=await page.evaluate(()=>({fallback:document.getElementById('fallbackReason')?.textContent,status:document.getElementById('status')?.textContent,hasBattle:!!document.querySelector('.gm-b-simulation')}));
  assert.equal(await page.locator('[data-b="case"] option').count(),5,JSON.stringify(battleDiagnostics));
  for(const label of ['play','pause','resume','replay','stop'])assert.equal(await page.locator('[data-b="'+label+'"]').count(),1);
  assert.equal(await page.locator('[data-b="speed"] option').count(),3);
  await page.locator('#caseSearch').fill('不存在的舊場景');
  assert.equal(await page.locator('#caseList .center-case').count(),0);
  await page.locator('#caseSearch').fill('');
  assert.equal(await page.locator('#caseList .center-case').count(),1);
  await page.locator('#maximizePreview').scrollIntoViewIfNeeded();
  const before=await page.evaluate(()=>scrollY);
  await page.locator('#maximizePreview').click();
  assert.equal(await page.evaluate(()=>window.Civilization3DTestCenter.isMaximized()),true);
  await page.keyboard.press('Escape');
  assert.equal(await page.evaluate(()=>window.Civilization3DTestCenter.isMaximized()),false);
  await page.setViewportSize({width:390,height:844});
  await page.locator('#maximizePreview').scrollIntoViewIfNeeded();
  const mobileBefore=await page.evaluate(()=>scrollY);
  await page.locator('#maximizePreview').click();
  const geometry=await page.evaluate(()=>{
   const a=document.querySelector('.center-workspace .stage').getBoundingClientRect(),
     b=document.querySelector('#maximizePreview').getBoundingClientRect();
   return {width:a.width,height:a.height,within:b.left>=0&&b.right<=innerWidth&&b.bottom<=innerHeight};
  });
  assert.ok(geometry.width>=380&&geometry.height>=780&&geometry.within,JSON.stringify(geometry));
  await page.locator('#maximizePreview').click();await page.waitForTimeout(300);
  const mobileAfter=await page.evaluate(()=>scrollY);
  assert.ok(Math.abs(mobileAfter-mobileBefore)<=5,'mobile scroll restore '+mobileBefore+' / '+mobileAfter);
  await page.locator('#categoryList').getByRole('button',{name:/角色與動作/}).click();
  await page.waitForFunction(()=>!!document.querySelector('.gm-suit'),null,{timeout:20000});
  assert.equal(await page.locator('.gm-b-simulation').count(),0,'switch disposes B playback');
  assert.equal(await page.locator('#categoryList .center-category').count(),2);
  assert.equal(errors.length,0,'page errors: '+JSON.stringify(errors));
  console.log('PASS GM 2.5D visual center: 2 categories / 2 real scenes, authorization isolation, playback controls, mobile maximize restore');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
