"use strict";
// T4 retirement: the formal Galaxy adventure must not resurrect obsolete 3D toggles.
// Keep normal Galaxy route/review checks; the old 3D camera test is intentionally retired.
const {chromium}=require("playwright"),assert=require("node:assert/strict");
(async()=>{
 const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
 try{
  const page=await browser.newPage(),errors=[];
  page.on("pageerror",e=>errors.push(String(e)));
  await page.goto(process.env.SMOKE_URL||"http://127.0.0.1:4173/index.html",{waitUntil:"domcontentloaded",timeout:60000});
  await page.waitForFunction(()=>typeof window.go==="function"&&typeof window.adventureMapPage==="function",null,{timeout:60000});
  const state=await page.evaluate(()=>{
   const html=window.adventureMapPage();
   const doc=new DOMParser().parseFromString(html,"text/html");
   return {hasMap:!!doc.querySelector(".world-region-list"),legacyPreview:!!doc.querySelector("#civilization3dGalaxyToggle"),bridge:typeof window.civilization3dToggleGalaxy};
  });
  assert.equal(state.hasMap,true,"Galaxy adventure area remains present");
  assert.equal(state.legacyPreview,false,"retired Galaxy 3D toggle must not return");
  assert.equal(state.bridge,"undefined","retired Galaxy visual entry must not return");
  assert.equal(errors.filter(e=>/galaxy|worldmapui|adventureMapPage/i.test(e)).length,0,JSON.stringify(errors));
  console.log("PASS Galaxy text-mode adventure remains; retired formal 3D toggle absent",state);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
