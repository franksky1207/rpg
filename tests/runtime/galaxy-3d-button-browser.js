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
    const relevantErrors = failures.filter(x => /worldmapui|formal-home|galaxy|adventureMapPage/i.test(x));
    assert.equal(relevantErrors.length, 0, relevantErrors.join("\n"));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
