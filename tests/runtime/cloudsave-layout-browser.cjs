'use strict';
const {chromium}=require('playwright'),fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  const page=await browser.newPage();await page.route('http://cloudsave.test/',r=>r.fulfill({body:'<!doctype html><html><meta charset="utf-8"><body style="margin:16px;background:#101820;color:white"><div id="civilizationAccountSettings"></div><div id="settingsCloudSaveSlot"></div></body></html>',contentType:'text/html'}));await page.goto('http://cloudsave.test/');
  await page.addStyleTag({content:fs.readFileSync('cloudsave.css','utf8')});
  await page.evaluate(()=>{
   window.state={level:1,exp:0,reincarnation:{count:2,breakthrough:{permanent:7}}};window.requests=[];
   const data={level:2000,exp:1234567890,revision:1,updated_at:new Date().toISOString(),save_data:{reincarnation:{count:3,breakthrough:{permanent:17}}}};
   window.civilizationAuth={getUser:()=>({id:'test'}),getClient:()=>({from(){const q={select(v){requests.push(v);return q;},eq(){return q;},maybeSingle:async()=>({data,error:null})};return q;}})};
   window.registerAfterSaveHook=()=>{};window.save=()=>true;
  });
  for(const path of ['thirdworldphase.js','reincarnationstate.js','cloudsave.js'])await page.addScriptTag({content:fs.readFileSync(path,'utf8')});
  await page.waitForFunction(()=>civilizationCloudSave.getCloudMeta()?.progression?.permanent===17);
  for(const width of [320,390,768,1440]){
   await page.setViewportSize({width,height:900});
   const proof=await page.evaluate(()=>{for(let i=0;i<8;i++)civilizationCloudSave.mount();return {requests:requests.length,text:document.querySelector('.cloud-save-compare').textContent,overflow:[...document.querySelectorAll('.cloud-save-column,.cloud-save-line,.cloud-save-line b')].some(el=>el.scrollWidth>el.clientWidth+1),columns:getComputedStyle(document.querySelector('.cloud-save-compare')).gridTemplateColumns.split(' ').length};});
   assert.equal(proof.requests,1);assert.match(proof.text,/Lv.7/);assert.match(proof.text,/Lv.17/);assert.equal(proof.overflow,false);assert.equal(proof.columns,width<=620?1:2);console.log('PASS layout',width,JSON.stringify(proof));
  }
  await page.evaluate(()=>{state={level:2000,exp:0};civilizationCloudSave.mount();});assert.doesNotMatch(await page.locator('.cloud-save-compare').innerText(),/轉生|突破/);
  await page.evaluate(async()=>{requests.length=0;await civilizationCloudSave.refreshMeta();});
  assert.deepEqual(await page.evaluate(()=>requests),['updated_at,level,exp,revision']);
  await page.evaluate(()=>{state.reincarnation={count:0,breakthrough:{permanent:0}};state.thirdWorld={bosses:Array.from({length:10},()=>({currentHp:0}))};civilizationCloudSave.mount();});
  await page.waitForFunction(()=>requests.length===2&&civilizationCloudSave.getCloudMeta()?.progression?.permanent===17);
  await page.evaluate(()=>{for(let i=0;i<10;i++)civilizationCloudSave.mount();});assert.equal(await page.evaluate(()=>requests.length),2);
  console.log('PASS same-session unlock: one lightweight query, one full query, no render refetch.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
