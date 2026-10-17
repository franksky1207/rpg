"use strict";
const fs=require("node:fs"),assert=require("node:assert/strict"),cp=require("node:child_process");
const html=fs.readFileSync("index.html","utf8");
const gm=fs.readFileSync("3d-test/index.html","utf8");
const gmJs=fs.readFileSync("3d-test/test-center.js","utf8");
const ui=fs.readFileSync("dungeonui.js","utf8");
const css=fs.readFileSync("battle-mobile-viewport.css","utf8");
assert(html.includes("battle-mobile-viewport.css?v=20261018-batch4-mobile1"));
assert(html.includes("dungeonui.js?v=20261018-batch4-mobile-stage-anchor1"));
assert(gm.includes("GM 動畫測試中心"));
assert(gmJs.includes("C-08-CHARACTER")&&gmJs.includes("C-15-BATTLE"));
assert(gmJs.includes("release()")&&gmJs.includes("dispose()"),"GM resources must be disposed");
assert(/function positionActiveDungeonCombat/.test(ui));
for(const mode of ["dungeon-bounty","dungeon-arena","dungeon-void-mirage"])assert(ui.includes(mode),mode);
assert(ui.includes("battleViewportGestureAt")&&ui.includes("document.visibilityState"),"mobile scroll needs user gesture and visibility guards");
assert(css.includes("safe-area-inset-bottom")&&css.includes("overflow-wrap:anywhere"));
const protectedOwners=["combatfx.js","combatcore.js","dungeonarena.js","dungeonbounty.js","thirdworldarenaui.js","dungeonvoidui.js","mainminimalmode.js","backgroundprogress.js"];
const base="fb182111da17eec2bea0c23afbe4083078db6446";
for(const path of protectedOwners){
 const old=cp.execFileSync("git",["show",base+":"+path],{encoding:"utf8"});
 assert.equal(fs.readFileSync(path,"utf8"),old,"Batch 4 must not rewrite battle/gameplay owner: "+path);
}
const names=["dungeonui.js","3d-test/test-center.js","tests/runtime/batch4-mobile-combat-viewport.cjs"];
for(const p of names)cp.execFileSync(process.execPath,["--check",p],{stdio:"pipe"});
console.log("BATCH4_CORE_SCOPE_PASS",JSON.stringify({protectedOwners:protectedOwners.length,gmCases:2,cacheKeys:2,viewportModes:3}));
