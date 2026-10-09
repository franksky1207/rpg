const {chromium}=require("playwright");
const assert=require("node:assert/strict");
(async()=>{
 const browser=await chromium.launch({headless:true,args:["--use-gl=angle","--use-angle=swiftshader"]});
 const page=await browser.newPage({viewport:{width:1280,height:800}});
 const errors=[];
 page.on("pageerror",e=>errors.push(String(e)));
 try{
  await page.goto(process.env.RUNTIME_SMOKE_URL||"http://127.0.0.1:4173/3d-test/?embedded=1",{waitUntil:"domcontentloaded",timeout:45000});
  await page.waitForFunction(()=>window.Civilization3DTestCenter?.caseIds?.length===8,{timeout:60000});
  assert.equal(await page.locator("#categoryList .center-category").count(),10);
  assert.equal(await page.locator("#caseList .center-case").count(),8);
  assert.equal(await page.locator("#backToGame").isHidden(),true);
  assert.equal(await page.locator(".stage #status").count(),0,"Status must never overlay the 3D stage");
  assert.equal(await page.locator(".center-workspace > #status").count(),1,"Status must live above 3D stage");
  await page.locator("#caseSearch").fill("B05");
  assert.equal(await page.locator("#caseList .center-case").count(),3);
  await page.locator("#caseSearch").fill("");
  await page.getByRole("button",{name:/冒險／地圖／回顧/}).click();
  assert.equal(await page.locator("#caseList .center-case").count(),2);
  await page.locator("#caseList .center-case").first().click();
  assert.equal(await page.evaluate(()=>window.Civilization3DTestCenter.getCurrent()),"C-05-GALAXY-MAP");
  await page.locator("#fixtureWorld").selectOption("2");
  await page.locator("#fixtureLife").selectOption("rerun");
  await page.locator("#fixtureProgress").selectOption("7");
  const snapshot=await page.evaluate(()=>({fixture:window.Civilization3DTestCenter.getFixture(),factories:!!(window.Civilization3DPrototype?.createGalaxyScene&&window.Civilization3DPrototype?.createEpochScene),storage:localStorage.length}));
  assert.equal(snapshot.fixture.world,2);
  assert.equal(snapshot.fixture.life,"rerun");
  assert.equal(snapshot.fixture.regionProgress,7);
  assert.equal(snapshot.factories,true,"Shared formal 3D factories were not loaded");
  // When the scene is active, the success banner must not cover the camera controls.
  await page.waitForFunction(()=>document.querySelector("#status")?.hidden===true||!document.querySelector("#fallback")?.hidden,{timeout:20000});
  const presentation=await page.evaluate(()=>({
    fallback:!document.querySelector("#fallback").hidden,
    bannerHidden:document.querySelector("#status").hidden,
    cameraButtons:document.querySelectorAll("#prototypeHost .civilization-3d-camera-button").length
  }));
  if(!presentation.fallback){
    assert.equal(presentation.bannerHidden,true,"Successful scene status is covering camera buttons");
    assert.equal(presentation.cameraButtons,3,"Camera controls missing after banner hide");
  }
  console.log("GM 3D status visibility: "+JSON.stringify(presentation));

  await page.setViewportSize({width:390,height:844});
  assert.equal(await page.locator("#caseList .center-case").count(),2);
  assert.equal(await page.locator(".center-workspace").isVisible(),true);
  assert.deepEqual(errors.filter(e=>/test-center|prototype-engine|runtime\.js/.test(e)),[]);
  console.log("PASS GM 3D Test Center categories, B01-B05 case registry, search, fixtures and mobile viewport",snapshot);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
