const fs=require("fs");
const assert=require("node:assert/strict");
const manifest=JSON.parse(fs.readFileSync("resource-manifest.json","utf8"));
const generator=fs.readFileSync("scripts/generate-resource-manifest.py","utf8");
const bridge=fs.readFileSync("3d-test/formal-home.js","utf8");
const workflow=fs.readFileSync(".github/workflows/asset-version-manifest.yml","utf8");
assert.equal(manifest.schema,1);
assert.equal(manifest.algorithm,"sha256-96");
assert.ok(Object.keys(manifest.files).length>=250);
for(const path of ["gmtools.js","gmruntimeauthorization.js","3d-test/prototype-engine.js","vendor/babylonjs/7.54.3/babylon.js"]){
 assert.match(manifest.files[path]||"",/^[a-f0-9]{24}$/,path+" requires a content digest");
}
assert.match(generator,/hashlib\.sha256/);
assert.match(bridge,/resolveSceneResources/);
assert.match(bridge,/cache:"no-store"/);
assert.match(bridge,/asset=/);
assert.match(workflow,/git push origin HEAD:main/);
assert.ok(!JSON.stringify(manifest).includes("sb_publishable_"));
console.log("GM and 3D per-file version manifest structural integrity passed",Object.keys(manifest.files).length);
