'use strict';
// Retired full-3D equipment preview browser regression.
// Preserve formal text-mode equipment and confirm legacy preview controls stay absent.
// Actual GM whole-suit and battle tests run in dedicated active 2.5D workflows.
const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[],glbRequests=[];
  page.on('pageerror',e=>errors.push(String(e)));
  page.on('request',r=>{if(/\\.glb(?:\\?|$)/i.test(r.url()))glbRequests.push(r.url());});
  try{
   const base=process.env.RUNTIME_SMOKE_URL||process.env.SMOKE_URL||'http://127.0.0.1:4173/index.html';
   await page.goto(base,{waitUntil:'domcontentloaded',timeout:60000});
   await page.waitForFunction(()=>window.CivilizationStartupCoordinator?.snapshot?.().status==='ready',null,{timeout:60000});
   const result=await page.evaluate(()=>({
    oldPreview:!!document.querySelector('#civilization3dCharacterToggle'),
    oldFormalHost:!!document.querySelector('#civilization3dFormalHost'),
    retiredToggle:typeof window.civilization3dToggleCharacter,
    inventoryPresent:typeof state==='object'&&!!state.equipment
   }));
   assert.equal(result.oldPreview,false,'retired formal full-3D equipment button must stay absent');
   assert.equal(result.oldFormalHost,false,'retired formal 3D preview host must stay absent');
   assert.equal(result.retiredToggle,'undefined','retired toggle API must not return');
   assert.equal(result.inventoryPresent,true,'formal equipment owner must remain');
   assert.deepEqual(glbRequests,[],'formal text startup must not download old 3D equipment');
   assert.equal(errors.filter(e=>/3d.*equipment|equipment.*3d|preview/i.test(e)).length,0,'no retired preview browser exceptions');
   console.log('PASS formal equipment preserved; retired full-3D preview UI, APIs and GLB loads absent');
  }finally{await page.close();}
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
