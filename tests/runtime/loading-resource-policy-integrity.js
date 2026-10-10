// Batch 1: deployment resource inventory coverage and safe caching boundaries.
// Run: node tests/runtime/loading-resource-policy-integrity.js
const fs=require("node:fs"),assert=require("node:assert/strict");
const read=p=>fs.readFileSync(p,"utf8");
const manifest=JSON.parse(read("resource-manifest.json"));
const generator=read("scripts/generate-resource-manifest.py");
const workflow=read(".github/workflows/asset-version-manifest.yml");
const html=read("index.html");
assert.equal(manifest.schema,1);
assert.equal(manifest.algorithm,"sha256-96");
assert.match(generator,/MEDIA_SUFFIXES/);
for(const dir of ["audio/assets","3d-test/assets","assets/3d","assets/models"])assert.ok(generator.includes(dir));
for(const trigger of ["audio/assets/**","3d-test/assets/**","assets/3d/**","assets/models/**"])assert.ok(workflow.includes(trigger));
assert.match(workflow,/git fetch origin main/);
assert.match(workflow,/git push origin HEAD:main/);
assert.ok(!generator.includes('paths.add("index.html")'),"index must remain bootstrap-fresh");
assert.match(html,/backgroundpreload\.js/);
assert.match(html,/scriptgrouploader\.js/);
assert.match(read("scriptgrouploader.js"),/GM_DIGEST_KEY/);
assert.match(read("scriptgrouploader.js"),/gmAuthorized\(\)/);
assert.ok(Object.keys(manifest.files).length>=250);
const f=manifest.files;
for(const key of ["audio/audio-core.js","3d-test/prototype-engine.js","vendor/babylonjs/7.54.3/babylon.js"]){assert.match(f[key]||"",/^[a-f0-9]{24}$/);}
console.log("Loading resource policy PASS; existing manifest:",Object.keys(f).length,"resources. Media coverage activates when workflow regenerates it.");
