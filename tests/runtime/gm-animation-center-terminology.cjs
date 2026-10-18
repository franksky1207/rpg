"use strict";
const fs=require("node:fs"),assert=require("node:assert/strict");
const read=p=>fs.readFileSync(p,"utf8");
const bridge=read("gm3dprototype.js");
for(const phrase of ["GM 動畫測試中心","進入動畫測試中心","GM 測試｜動畫測試中心"])assert.ok(bridge.includes(phrase),phrase);
for(const phrase of ["開啟 GM 3D 測試中心","進入 3D 測試中心","GM 測試｜3D 測試中心","文明戰線 3D 測試中心"])assert.ok(!bridge.includes(phrase),"legacy visible label: "+phrase);
const surfaces=["3d-test/test-center.js","3d-test/gm-battle-simulation.js","3d-test/gm-battle-published.mjs","3d-test/gm-whole-suit.mjs","3d-test/gm-era-sprites.mjs"];
for(const p of surfaces){
 const src=read(p);
 assert.doesNotMatch(src,/["'`]([^"'`\n]*)(?:GM 2\.5D|2\.5D B 沙盒|2\.5D 戰場預覽|原3D五槽測試|真實2\.5D角色|2\.5D 角色預覽)/,"retired user-visible GM copy: "+p);
}
assert.ok(read("3d-test/index.html").includes("GM 動畫測試中心"));
assert.ok(read("3d-test/test-center.js").includes("C-08-CHARACTER")&&read("3d-test/test-center.js").includes("C-15-BATTLE"));
assert.ok(read("index.html").includes("gm3dprototype.js?v=20261018-gm-copy1"));
assert.ok(read("3d-test/index.html").includes("test-center.js?v=20261018-gm-copy1"));
assert.ok(read("3d-test/test-center.js").includes("gm-battle-simulation.js?v=20261018-gm-copy1"));
assert.ok(read("3d-test/gm-battle-simulation.js").includes("gm-battle-published.mjs?v=20261018-gm-copy1"));
console.log("PASS GM animation center user-facing terminology and asset cache; two existing tests retained");
