const { chromium } = require("playwright");
const assert = require("node:assert/strict");
(async () => {
  const browser = await chromium.launch({ headless: true, args: ["--use-gl=angle", "--use-angle=swiftshader"] });
  const page = await browser.newPage();
  const failures = [];
  page.on("pageerror", e => failures.push(String(e)));
  try {
    await page.goto(process.env.SMOKE_URL || "http://127.0.0.1:4173/index.html", { waitUntil: "domcontentloaded", timeout: 45000 });
    await page.waitForFunction(() => typeof window.go === "function" && typeof window.adventureMapPage === "function", { timeout: 45000 });
    const result = await page.evaluate(() => {
      // Use formal mainline route, not the review branch. Do not save or start combat.
      const html = window.adventureMapPage();
      const doc = new DOMParser().parseFromString(html, "text/html");
      const direct = doc.querySelectorAll("#civilization3dGalaxyToggle").length;
      window.go("adventure");
      const rendered = document.querySelectorAll("#main #civilization3dGalaxyToggle").length;
      return {
        direct, rendered,
        caption: document.querySelector("#main #civilization3dGalaxyToggle")?.textContent?.trim(),
        formalMap: document.querySelectorAll("#main .world-region-list").length,
        hasControl: typeof window.civilization3dToggleGalaxy === "function"
      };
    });
    assert.equal(result.direct, 1, "formal adventureMapPage HTML missing galaxy button");
    assert.equal(result.rendered, 1, "rendered mainline adventure DOM missing galaxy button");
    assert.equal(result.formalMap, 1, "formal region list missing");
    assert.equal(result.hasControl, true, "3D toggle bridge missing");
    assert.match(result.caption, /預覽 3D 銀河星圖/);
    console.log("PASS Galaxy mainline 3D button: " + JSON.stringify(result));
    // Regression matrix: first-run mainline, reincarnated world-1 mainline,
    // and galaxy review after crossing into world 2. Rendering only; no save writes.
    const matrix = await page.evaluate(() => {
      const main=document.getElementById("main");
      const saved=main.innerHTML;
      const savedPhase=window.currentWorldPhase;
      const savedEra=window.getAdventureEraView;
      const fixtures=[
        {name:"first-run-galaxy",phase:1,era:"galaxy",review:false,expected:1},
        {name:"reincarnation-galaxy",phase:1,era:"galaxy",review:false,expected:1},
        {name:"galaxy-review",phase:2,era:"galaxy-review",review:true,expected:0}
      ];
      try{
        return fixtures.map(f=>{
          window.currentWorldPhase=()=>f.phase;
          window.getAdventureEraView=()=>f.era;
          main.innerHTML='<section class="map-screen '+(f.review?'galaxy-review-adventure-screen':'')+'"><div class="world-region-list"><button class="map-card">銀河大區</button></div></section>';
          window.civilization3dHomeRouteRendered("adventure");
          window.civilization3dHomeRouteRendered("adventure");
          const count=main.querySelectorAll("#civilization3dGalaxyToggle").length;
          return {name:f.name,count,expected:f.expected};
        });
      }finally{
        window.currentWorldPhase=savedPhase;
        window.getAdventureEraView=savedEra;
        main.innerHTML=saved;
        window.civilization3dHomeRouteRendered("adventure");
      }
    });
    for(const entry of matrix)assert.equal(entry.count,entry.expected,entry.name+" incorrect preview button");
    console.log("PASS Galaxy route matrix "+JSON.stringify(matrix));
    // Real event regression: opening a Galaxy review map must show the enemy selector.
    const reviewClick=await page.evaluate(()=>{
      const entered=window.isSecondWorldEntered,phase=window.currentWorldPhase,era=window.getAdventureEraView;
      const main=document.querySelector("#main"),original=main.innerHTML;
      try{
        window.isSecondWorldEntered=()=>true;
        window.currentWorldPhase=()=>2;
        window.getAdventureEraView=()=>"galaxy-review";
        window.go("adventure");
        const card=main.querySelector(".galaxy-review-action");
        if(!card)return {button:false,html:main.innerHTML.slice(0,300)};
        card.click();
        return {button:true,prepared:!!main.querySelector(".galaxy-review-prepare"),html:main.innerHTML.slice(0,350)};
      }catch(e){return {button:true,error:String(e),stack:String(e.stack||"")};}
      finally{
        window.isSecondWorldEntered=entered;window.currentWorldPhase=phase;window.getAdventureEraView=era;
        main.innerHTML=original;
      }
    });
    assert.equal(reviewClick.button,true,"No Galaxy review challenge button: "+JSON.stringify(reviewClick));
    assert.equal(reviewClick.prepared,true,"Galaxy review challenge did not open monster selector: "+JSON.stringify(reviewClick));
    console.log("PASS Galaxy review challenge click "+JSON.stringify(reviewClick));
    const cameraChecks = await page.evaluate(async()=>{
      const original=window.BABYLON;
      const callbacks=[];
      class Engine {
        static isSupported(){return true;}
        constructor(){this.resize=()=>{};}
        setHardwareScalingLevel(){}
        runRenderLoop(callback){callbacks.push(callback);}
        stopRenderLoop(){}
        dispose(){}
      }
      window.BABYLON={Engine};
      const host=document.createElement("div");
      document.body.appendChild(host);
      const runtime=window.Civilization3DRuntime.create({host});
      const camera={radius:10,alpha:1,beta:1.2,lowerRadiusLimit:4,upperRadiusLimit:18,metadata:{}};
      const scene={activeCamera:camera,render(){},dispose(){}};
      try{
        const result=await runtime.show("camera-test",()=>scene);
        const canvas=runtime.canvas;
        const initialCanvas=runtime.canvas;
        const initialCamera=scene.activeCamera;
        host.querySelector(".civilization-3d-layout-button").click();
        const expanded=host.classList.contains("civilization-3d-expanded");
        const canvasUnchanged=runtime.canvas===initialCanvas&&scene.activeCamera===initialCamera;
        host.querySelector(".civilization-3d-layout-button").click();
        const restored=!host.classList.contains("civilization-3d-expanded");
        const wheel=new WheelEvent("wheel",{bubbles:true,cancelable:true,deltaY:100});
        const wheelNotCancelled=canvas.dispatchEvent(wheel);
        const wheelBlocked=wheel.defaultPrevented&&!wheelNotCancelled;
        host.querySelector('[data-camera-action="zoom-in"]').click();
        const closer=camera.radius<10;
        host.querySelector('[data-camera-action="zoom-out"]').click();
        const afterButtons=camera.radius;
        camera.alpha=2.4;camera.beta=.6;camera.radius=14;
        host.querySelector('[data-camera-action="reset"]').click();
        return {expanded,restored,canvasUnchanged,sceneOk:result.ok,wheelBlocked,closer,afterButtons,reset:camera.radius===10&&camera.alpha===1&&camera.beta===1.2,buttons:host.querySelectorAll(".civilization-3d-camera-button").length};
      }finally{runtime.dispose();host.remove();window.BABYLON=original;}
    });
    assert.equal(cameraChecks.expanded,true,"preview did not expand");
    assert.equal(cameraChecks.restored,true,"preview did not restore");
    assert.equal(cameraChecks.canvasUnchanged,true,"scene/canvas replaced during resize");
    assert.equal(cameraChecks.sceneOk,true,"mocked 3D runtime scene not ready");
    assert.equal(cameraChecks.wheelBlocked,true,"wheel event over active 3D canvas must be cancelled");
    assert.equal(cameraChecks.closer,true,"zoom-in did not move camera");
    assert.equal(cameraChecks.reset,true,"camera reset did not restore baseline");
    assert.equal(cameraChecks.buttons,3,"camera control buttons missing");
    console.log("PASS 3D camera controls "+JSON.stringify(cameraChecks));
    const relevantErrors = failures.filter(x => /worldmapui|formal-home|galaxy|adventureMapPage/i.test(x));
    assert.equal(relevantErrors.length, 0, relevantErrors.join("\n"));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
