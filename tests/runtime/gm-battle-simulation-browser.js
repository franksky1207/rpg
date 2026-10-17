'use strict';
// Current GM B visual battle regression. Replaces retired 31-scene/8-category harness.
// This test must operate real rendered published controls, not just inspect source.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const base=process.env.RUNTIME_SMOKE_URL||'http://127.0.0.1:4173/index.html';
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||(fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined),args:['--use-gl=angle','--use-angle=swiftshader','--no-sandbox']});
 const reports=[];
 try{
  for(const viewport of [{width:1280,height:800},{width:390,height:844},{width:844,height:390}].filter(v=>!process.env.GM_B_WIDTH||v.width===Number(process.env.GM_B_WIDTH))){
   const page=await browser.newPage({viewport}),errors=[],requests=[];
   page.on('pageerror',e=>errors.push(String(e)));
   page.on('request',r=>requests.push(r.url()));
   try{
    await page.goto(new URL('3d-test/?embedded=1',base).href,{waitUntil:'domcontentloaded',timeout:60000});
    await page.waitForFunction(()=>window.Civilization3DTestCenter?.version===6,null,{timeout:60000});
    assert.deepEqual(await page.evaluate(()=>Civilization3DTestCenter.caseIds),['C-08-CHARACTER','C-15-BATTLE']);
    assert.deepEqual(await page.evaluate(()=>Civilization3DTestCenter.categoryIds),['character','combat']);
    assert.equal(await page.locator('#categoryList .center-category').count(),2);
    const before=await page.evaluate(()=>JSON.stringify(localStorage));
    await page.locator('#categoryList').getByRole('button',{name:/戰場與對戰/}).click();
    assert.equal(await page.locator('#caseList .center-case').count(),1);
    await page.locator('#caseList').getByRole('button',{name:'2.5D 戰鬥模擬',exact:true}).click();
    await page.waitForFunction(()=>document.querySelector('[data-b="stage"]')?.dataset.renderReady==='true',null,{timeout:90000});
    const cases=await page.locator('[data-b="case"] option').evaluateAll(opts=>opts.map(o=>o.value));
    assert.equal(cases.length,5,'five current B scenarios');
    const inspected=[];
    for(const id of cases){
     await page.locator('[data-b="case"]').selectOption(id);
     await page.waitForFunction(()=>document.querySelector('[data-b="stage"]')?.dataset.renderReady==='true',null,{timeout:90000});
     const api=await page.evaluate(()=>document.getElementById('prototypeHost').__gmBattleSimulation?.diagnostics());
     assert.ok(api?.current&&api.current.scheme==='B','real B renderer '+id);
     assert.equal(api.current.actorKinds.player,'NativeActor');
     assert.equal(api.current.actorKinds.enemy,'AtlasActor');
     assert.equal(await page.locator('[data-b="play"]').count(),1);
     await page.locator('[data-b="play"]').click();
     await page.waitForFunction(()=>document.getElementById('prototypeHost').__gmBattleSimulation?.diagnostics().current?.sourceFrames>0,null,{timeout:20000});
     await page.locator('[data-b="stop"]').click();
     await page.waitForFunction(()=>document.getElementById('prototypeHost').__gmBattleSimulation?.diagnostics().resources?.engines===0,null,{timeout:15000});
     inspected.push(id);
    }
    assert.equal(await page.evaluate(t=>JSON.stringify(localStorage)===t,before),true,'GM may not write browser save');
    assert.equal(requests.filter(u=>/auth\/|rest\/v1|cloudsave/.test(u)).length,0,'GM direct preview must not call cloud');
    assert.deepEqual(errors,[],'browser page errors');
    reports.push({viewport,scenarios:inspected,storageUnchanged:true,resourceDisposal:true});
   }finally{await page.close();}
  }
  console.log('PASS current GM B simulation: two GM categories, five real scenarios, render/play/stop/disposal, desktop/mobile, no storage/cloud writes');
  fs.writeFileSync(process.env.GM_B_REPORT||'/tmp/gm-battle-simulation-browser.json',JSON.stringify({passed:true,reports,physicalGPU:false},null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
