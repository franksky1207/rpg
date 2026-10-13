"use strict";
const {chromium}=require("playwright"),assert=require("node:assert/strict"),fs=require("node:fs");
const base=process.env.RUNTIME_SMOKE_URL||"http://127.0.0.1:4173/index.html";
// Isolated SDK session fixture, following the existing player browser tests.
// The real auth/startup/GM owners run; no real account, remote save or gate removal.
const sdk=`window.supabase={createClient(){return{auth:{onAuthStateChange(){return{data:{subscription:{unsubscribe(){}}}}},async getSession(){return{data:{session:{user:{id:'t1a-snapshot-test'}}},error:null}}},from(){return{select(){return this},eq(){return this},single(){return Promise.resolve({data:null,error:null})}}}}}};`;
async function finishIntro(page){
 await page.locator("#civilizationStoryModal.open").waitFor({state:"visible",timeout:60000});
 const actions=page.locator("#civilizationStoryModal #storyActions");
 for(let i=0;i<100;i++){
  const end=actions.getByRole("button",{name:"結束",exact:true});
  if(await end.count()){
   await end.click();await page.locator("#civilizationStoryModal.open").waitFor({state:"hidden"});
   await page.locator("#civilizationStarterGearModal").getByRole("button",{name:"領取裝備",exact:true}).click();
   await page.locator("#civilizationStarterGearModal").waitFor({state:"hidden"});
   await page.locator("#gameIntroModal").getByRole("button",{name:"踏上征途",exact:true}).click();
   await page.locator("#gameIntroModal.show").waitFor({state:"hidden"});return;
  }
  await actions.getByRole("button",{name:"下一頁",exact:true}).click();
 }
 throw Error("Intro did not finish through its formal controls");
}
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined,args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const report={realHardware:false,release:false,cases:[],errors:[]};
 try{
 for(const viewport of [{width:1280,height:800},{width:390,height:844},{width:844,height:390}]){
  const context=await browser.newContext({viewport});
  await context.route('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js',r=>r.fulfill({contentType:'text/javascript',body:sdk}));
  await context.addInitScript(()=>localStorage.setItem('civilization-war-presentation-mode-v1:t1a-snapshot-test','text'));
  const page=await context.newPage(),requests=[];page.on('request',r=>requests.push(r.url()));page.on('pageerror',e=>report.errors.push(String(e)));
  await page.goto(base,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>CivilizationStartupCoordinator.snapshot().status==='ready',null,{timeout:60000});await finishIntro(page);
  const before=await page.evaluate(()=>JSON.stringify(state));
  for(const route of ['home','character','inventory','enhancement','specialization','adventure','dungeon','storyrecord','settings','guide','calamity']){
   await page.evaluate(r=>go(r),route);await page.waitForTimeout(80);
   assert.equal(await page.locator('#civilization3dFormalHost,#civilization3dStoryHost,[data-service3d-preview],[data-chronicle-preview],.galaxy-3d-controls,button[id^="civilization3d"]').count(),0,'retired preview DOM '+route);
   assert.equal(await page.locator('#main canvas').count(),0,'hidden canvas '+route);
   assert.equal(await page.evaluate(()=>typeof window.civilization3dToggleHome), 'undefined');
   assert.equal(await page.evaluate(()=>window.BABYLON?.EngineStore?.Instances?.length||0),0);
   report.cases.push({viewport,route,canvas:0,preview:0});
  }
  for(let i=0;i<100;i++)await page.evaluate(i=>go(i%2?'character':'home'),i);
  assert.equal(await page.evaluate(()=>JSON.stringify(state)),before,'routes wrote formal state');
  assert.ok(!requests.some(url=>/\.glb(?:\?|$)|vendor\/babylonjs|formal-home\.js|formal-dom\.js|preview-expand\.css/.test(url)),'decorative resource initialized');
  assert.equal(await page.evaluate(()=>CivilizationFormalBEntry.boot()),false,'unapproved broad B release');
  assert.equal(await page.evaluate(()=>window.CivilizationFormalHybridBridge.diagnostics().subscribed),false,'closed B cannot attach');
  await context.close();
 }
 assert.deepEqual(report.errors,[]);fs.writeFileSync('/tmp/t4-preview-retirement-browser.json',JSON.stringify(report,null,2));console.log('PASS T4 current formal desktop/portrait/landscape routes, 100 switches, zero decorative requests/DOM/canvas/engine and release closed');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
