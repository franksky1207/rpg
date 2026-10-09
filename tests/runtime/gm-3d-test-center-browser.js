const {chromium}=require("playwright");
const assert=require("node:assert/strict");
(async()=>{
 const browser=await chromium.launch({headless:true,args:["--use-gl=angle","--use-angle=swiftshader"]});
 const page=await browser.newPage({viewport:{width:1280,height:800}});
 const errors=[];page.on("pageerror",e=>errors.push(String(e)));
 try{
  await page.goto(process.env.RUNTIME_SMOKE_URL||"http://127.0.0.1:4173/3d-test/?embedded=1",{waitUntil:"domcontentloaded",timeout:45000});
  await page.waitForFunction(()=>window.Civilization3DTestCenter?.version===2,{timeout:60000});
  assert.equal(await page.locator("#categoryList .center-category").count(),7);
  assert.equal(await page.locator("#caseList .center-case").count(),3);
  assert.equal(await page.locator("#backToGame").isHidden(),true);
  assert.equal(await page.locator(".stage #status").count(),0);
  assert.equal(await page.locator("#caseMetadata").count(),0);
  assert.equal(await page.locator("#contextTest").count(),0);
  for(const term of ["A-01-ENGINE","B01","Babylon.js","WebGL"]){
   assert.ok(!(await page.locator("body").innerText()).includes(term),"Internal label exposed: "+term);
  }
  await page.locator("#caseSearch").fill("銀河星圖");
  assert.equal(await page.locator("#caseList .center-case").count(),1);
  await page.locator("#caseSearch").fill("");
  await page.getByRole("button",{name:"冒險與宇宙地圖"}).click();
  assert.equal(await page.locator("#caseList .center-case").count(),2);
  await page.getByRole("button",{name:"銀河紀元星圖"}).click();
  assert.equal(await page.evaluate(()=>window.Civilization3DTestCenter.getCurrent()),"C-05-GALAXY-MAP");
  assert.equal(await page.locator("#fixtureWorld").isVisible(),false);
  assert.equal(await page.locator("#fixtureProgress").isVisible(),true);
  await page.locator("#fixtureProgress").selectOption("7");
  assert.equal(await page.evaluate(()=>window.Civilization3DTestCenter.getFixture().regionProgress),7);
  await page.getByRole("button",{name:"宇宙紀元星圖"}).click();
  assert.equal(await page.evaluate(()=>window.Civilization3DTestCenter.getCurrent()),"C-06-UNIVERSE-MAP");
  assert.equal(await page.locator("#fixtureProgress").isVisible(),true);
  assert.equal(await page.locator("#fixtureSelected").isVisible(),true);
  await page.waitForFunction(()=>document.querySelector("#status")?.hidden===true||!document.querySelector("#fallback")?.hidden,{timeout:20000});
  await page.waitForFunction(()=>document.querySelector("#prototypeHost canvas")||!document.querySelector("#fallback").hidden,{timeout:20000});
  const initialCanvas=await page.locator("#prototypeHost canvas").count();
  await page.locator("#maximizePreview").click();
  assert.equal(await page.evaluate(()=>window.Civilization3DTestCenter.isMaximized()),true);
  assert.equal(await page.locator("#prototypeHost canvas").count(),initialCanvas);
  await page.keyboard.press("Escape");
  assert.equal(await page.evaluate(()=>window.Civilization3DTestCenter.isMaximized()),false);
  await page.setViewportSize({width:390,height:844});
  await page.locator("#maximizePreview").click();
  const mobile=await page.evaluate(()=>{
   const stage=document.querySelector(".center-workspace .stage").getBoundingClientRect();
   const button=document.querySelector("#maximizePreview").getBoundingClientRect();
   const controls=document.querySelector(".civilization-3d-camera-controls")?.getBoundingClientRect();
   return {maximized:window.Civilization3DTestCenter.isMaximized(),stageWidth:stage.width,stageHeight:stage.height,
    buttonWithin:button.left>=0&&button.right<=innerWidth&&button.bottom<=innerHeight,
    controlsWithin:!controls||(controls.left>=0&&controls.right<=innerWidth&&controls.bottom<=innerHeight)};
  });
  assert.equal(mobile.maximized,true);assert.equal(mobile.buttonWithin,true);assert.equal(mobile.controlsWithin,true);
  assert.ok(mobile.stageWidth>=380&&mobile.stageHeight>=780);
  await page.locator("#maximizePreview").click();
  await page.waitForTimeout(300);
  const restore=await page.evaluate(()=>{
   const stage=document.querySelector(".center-workspace .stage").getBoundingClientRect();
   return {maximized:window.Civilization3DTestCenter.isMaximized(),top:stage.top,bottom:stage.bottom,viewHeight:innerHeight,scrollY};
  });
  assert.equal(restore.maximized,false);
  assert.ok(restore.top>=-75&&restore.top<restore.viewHeight*.3,"Mobile restore jumped away from 3D preview: "+JSON.stringify(restore));
  assert.ok(restore.bottom>0,"Restored preview offscreen: "+JSON.stringify(restore));
  assert.deepEqual(errors.filter(e=>/test-center|prototype-engine|runtime\\.js/.test(e)),[]);
  console.log("PASS GM visual center: 6 categories, 3 scenes, no engineering text, mobile maximize/restore",mobile,restore);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
