"use strict";
const {chromium}=require('playwright'),assert=require('node:assert/strict');
const base=process.env.RUNTIME_SMOKE_URL||'http://127.0.0.1:4173/index.html';
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--use-gl=angle','--use-angle=swiftshader']});
 try{
 for(const viewport of [{width:1280,height:800},{width:390,height:844}]){
 const page=await browser.newPage({viewport}),errors=[],requests={};let failOnce=true;
 page.on('pageerror',e=>errors.push(String(e)));
 page.on('request',r=>{const path=new URL(r.url()).pathname;if(/(?:babylon|prototype-engine|runtime|appearance-snapshot)\.js$/.test(path))requests[path]=(requests[path]||0)+1;});
 await page.route('**/prototype-engine.js*',r=>{if(failOnce){failOnce=false;return r.fulfill({status:503,body:'injected module failure'});}return r.continue();});
 await page.goto(new URL('3d-test/',base).href,{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>document.getElementById('fallbackReason').textContent.includes('模組載入失敗'),null,{timeout:60000});
 await page.locator('#restart').click();
 await page.waitForFunction(()=>document.querySelector('#prototypeHost [data-state="active"]'),null,{timeout:60000});
 assert.equal(await page.locator('#caseList .center-case').count(),31);
 assert.equal(await page.evaluate(()=>Civilization3DTestCenter.categoryIds.length),8);
 const titles=await page.locator('#caseList .center-case-label').allTextContents();
 for(const title of titles){
  await page.locator('#caseList').getByRole('button',{name:title,exact:true}).click();
  if(title==="2.5D 戰鬥模擬")await page.locator("#gmBattleViewPicker").getByRole("button",{name:"戰場與生命顯示",exact:true}).click();
  await page.waitForFunction(()=>document.querySelector('#prototypeHost [data-state="active"]'),null,{timeout:60000});
  assert.equal(await page.evaluate(()=>BABYLON.EngineStore.Instances.length),1,'Scene engine leak: '+title);
 }
 await page.evaluate(()=>{window.__completePrototype=Civilization3DPrototype;Civilization3DPrototype={...Civilization3DPrototype,createServiceConsoleScene:undefined,createChronicleTransitionScene:undefined,createBattlePresentationScene:undefined};});
 await page.locator('#caseList').getByRole('button',{name:'銀河紀元星圖',exact:true}).click();
 await page.waitForFunction(()=>document.querySelector('#prototypeHost [data-state="active"]'));
 await page.locator('#caseList').getByRole('button',{name:'設定中心',exact:true}).click();
 await page.waitForFunction(()=>document.getElementById('fallbackReason').textContent.includes('此預覽場景'));
 await page.locator('#caseList').getByRole('button',{name:'角色全身展示',exact:true}).click();
 await page.waitForFunction(()=>document.querySelector('#prototypeHost [data-state="active"]'),null,{timeout:60000});
 assert.equal(Object.entries(requests).filter(([path])=>path.endsWith('prototype-engine.js'))[0][1],2,'Retry must reload only failed scenes module');
 for(const [path,count] of Object.entries(requests))if(!path.endsWith('prototype-engine.js'))assert.equal(count,1,'Duplicate module: '+path);
 await page.evaluate(()=>{Civilization3DPrototype=__completePrototype;dispatchEvent(new Event('pagehide'));});
 assert.equal(await page.evaluate(()=>BABYLON.EngineStore.Instances.length),0);
 assert.deepEqual(errors,[]);
 console.log('PASS GM loader retry, 8 categories / 31 real scenes, decoration isolation and release',viewport,requests);
 await page.close();
 }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
