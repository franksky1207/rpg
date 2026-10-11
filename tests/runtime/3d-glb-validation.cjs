'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),validator=require('gltf-validator');
(async()=>{
 const registry=JSON.parse(fs.readFileSync('assets/3d/asset-registry.json','utf8'));
 for(const asset of registry.assets.filter(a=>a.path.endsWith('.glb'))){
  const r=await validator.validateBytes(new Uint8Array(fs.readFileSync(asset.path)),{uri:asset.path,maxIssues:1000});
  assert.equal(r.issues.numErrors,0,JSON.stringify(r.issues.messages));assert.equal(r.issues.numWarnings,0,JSON.stringify(r.issues.messages));
  console.log('PASS Khronos glTF validator:',asset.id,asset.metrics.triangles,'triangles, zero errors/warnings');
 }
})().catch(e=>{console.error(e);process.exitCode=1;});
