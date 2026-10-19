'use strict';
// Retirement regression for the removed standalone GM atlas-review UI.
// Active B2/B3 integrity is enforced separately by current-inventory and renderer-contract tests.
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
const base=process.env.RUNTIME_SMOKE_URL||'http://127.0.0.1:4173/index.html';
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||(fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined),args:['--use-gl=angle','--use-angle=swiftshader','--no-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  try{
   await page.goto(new URL('3d-test/?embedded=1',base).href,{waitUntil:'domcontentloaded',timeout:60000});
   await page.waitForFunction(()=>window.Civilization3DTestCenter?.version===7,null,{timeout:60000});
   assert.equal(await page.locator('#gmAtlasReview').count(),0,'retired atlas UI must remain absent');
   assert.equal(await page.locator('#categoryList .center-category').count(),0);
   const storage=await page.evaluate(()=>JSON.stringify(localStorage));
   await page.evaluate(()=>Civilization3DTestCenter.selectCase('C-15-BATTLE'));
   await page.waitForFunction(()=>document.querySelector('[data-b="stage"]')?.dataset.renderReady==='true',null,{timeout:90000});
   const actual=await page.evaluate(()=>document.getElementById('prototypeHost').__gmBattleSimulation?.diagnostics());
   assert.equal(actual?.current?.actorKinds?.enemy,'AtlasActor','approved atlas actor must still render in current B');
   assert.equal(await page.locator('#gmAtlasReview').count(),0,'no retired authoring panel after B load');
   assert.equal(await page.locator('[data-b="case"] option').count(),5);
   await page.evaluate(()=>Civilization3DTestCenter.selectCase('C-08-CHARACTER'));
   assert.equal(await page.locator('.gm-b-simulation').count(),0,'atlas renderer disposed on GM case switch');
   assert.equal(await page.evaluate(s=>JSON.stringify(localStorage)===s,storage),true,'no user save writes');
   assert.deepEqual(errors,[],'browser page errors');
   fs.writeFileSync('/tmp/gm-atlas-review-browser.json',JSON.stringify({passed:true,legacyAtlasReviewAbsent:true,activeAtlasActor:true,routeDisposed:true,saveUnchanged:true,hardware:false},null,2));
   console.log('PASS retired GM atlas UI absent; current B AtlasActor available, case disposal and save isolation');
  }finally{await page.close();}
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
