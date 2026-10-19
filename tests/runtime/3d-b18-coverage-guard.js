"use strict";
// Current 2.5D GM static contract. No archived 3D source, credential, save or network required.
// Browser lifecycle (load/failure/restart/disposal) is covered by 3d-gm-loader-browser.js.
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const root=path.resolve(__dirname,"../..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const center=read("3d-test/test-center.js");
const html=read("3d-test/index.html");
const gm=read("gm3dprototype.js");
const loader=read("tests/runtime/3d-gm-loader-browser.js");
assert.match(center,/version:7/,"current GM center version");
assert.match(center,/C-08-CHARACTER/);
assert.match(center,/C-15-BATTLE/);
assert.match(center,/gm-era-sprites\.mjs/,"current sprite preview is lazy");
assert.match(center,/gm-battle-simulation\.js/,"current B sandbox is lazy");
assert.match(center,/AbortController/,"loads must be abortable");
assert.match(center,/viewer\?\.dispose\?\.\(\)/,"previous viewers must dispose");
assert.match(center,/ticket!==serial\|\|abort\.signal\.aborted/,"late async completions must not attach");
assert.match(center,/function showFailure\(/,"safe fallback exists");
assert.match(center,/\$\("restart"\)\.onclick/,"restart action exists");
assert.match(center,/window\.addEventListener\("pagehide"/,"page lifecycle releases viewer");
assert.match(html,/id="restart"/);
assert.match(html,/id="fallback"/);
assert.match(gm,/gmRuntimeAuthorizationAuthorized|gm3dPrototypeOverlay/,"GM authorization/overlay retained");
assert.match(loader,/視覺測試無法載入/,"failure fallback browser coverage retained");
assert.match(loader,/pagehide/,"disposal browser coverage retained");
assert.ok(!center.includes("31 real scenes")&&!center.includes("Civilization3DLoader.load()"),"retired GM scene loader not restored");
for(const p of ["development/retired-formal-previews/20261013/source-evolution.json","3d-test/formal-home.js","3d-test/formal-dom.js"]){
 assert.equal(fs.existsSync(path.join(root,p)),false,"retired history/source must not return: "+p);
}
console.log("PASS current B18 GM contract: two 2.5D previews, auth boundary, abort, fallback, restart and disposal; no retired archive");
