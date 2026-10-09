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
    const relevantErrors = failures.filter(x => /worldmapui|formal-home|galaxy|adventureMapPage/i.test(x));
    assert.equal(relevantErrors.length, 0, relevantErrors.join("\n"));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
