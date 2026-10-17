"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,"../..");
const stage=path.join(root,".publish-stage3");
const pre="development/hybrid-comparison/";
assert.ok(fs.existsSync(path.join(stage,".publish-candidate")),"Official release gate not staged");
for(const name of ["index.html","comparison.css","comparison.mjs"]) {
 assert.ok(!fs.existsSync(path.join(stage,pre+name)),"Retired A/B/C entry still published: "+name);
}
for(const name of ["fixture-input.mjs","playback.mjs","t2b3-v1/manifest.json","t2b3-v1/renderer.mjs","t2b3-v1/assets.mjs","t2b3-v1/atlas.mjs","t2b3-v1/contract.mjs"]) {
 assert.ok(fs.statSync(path.join(stage,pre+name)).isFile(),"GM B dependency missing: "+name);
}
for(const name of ["assets/gm-equipment-2_5d/v1/catalog.json","3d-test/gm-battle-simulation.js","3d-test/gm-battle-published.mjs"]) {
 assert.ok(fs.existsSync(path.join(stage,name)),"GM shipped runtime dependency missing: "+name);
}
const plan=require("../../scripts/publish-assets.cjs").inspect(root);
assert.ok(!plan.keep.includes("3d-test/atlas-review.js"),"Retired GM atlas entry published");
assert.ok(plan.excluded.some(row=>row.path==="3d-test/atlas-review.js"),"Retired GM source must remain tracked until deletion phase");
const approved=JSON.parse(fs.readFileSync(path.join(root,"development/equipment-2_5d/gm-publication.json"),"utf8"));
const shipped=new Set(Object.keys(approved.files));
for(const name of shipped)assert.ok(fs.existsSync(path.join(stage,name)),"Approved GM asset missing: "+name);
for(const name of ["3d-test/test-center.js","3d-test/gm-battle-published.mjs","3d-test/gm-battle-simulation.js"])assert.ok(fs.existsSync(path.join(stage,name)),"GM test control missing: "+name);
console.log("Batch 2-3: retired A/B/C browser entry absent, GM B and published fallback retained");
