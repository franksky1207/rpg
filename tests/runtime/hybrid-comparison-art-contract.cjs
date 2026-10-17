'use strict';
// Current GM B artifact verification. Retired A/C authoring source history is not a runtime dependency.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto'),validator=require('gltf-validator');
const root='development/hybrid-comparison/t2b2-v1',sha=b=>crypto.createHash('sha256').update(b).digest('hex');
(async()=>{
 const inventory=JSON.parse(fs.readFileSync(root+'/inventory.json'));
 const manifest=JSON.parse(fs.readFileSync('development/hybrid-comparison/t2b3-v1/manifest.json'));
 const fixture=JSON.parse(fs.readFileSync('development/hybrid-comparison/t2a-v1/owner-fixtures.json'));
 assert.equal(inventory.files.length,165,'Current B2 registry');
 assert.equal(Object.keys(manifest.files).length,174,'Approved B-only request closure');
 assert.equal(sha(fs.readFileSync(root+'/inventory.json')),manifest.B2InventorySHA);
 assert.equal(fixture.sha256,'5a74c2eeb00014b208bcb175d2bd6f7668e430112dc7ebec8a7b5ac3ced83d99');
 let glbCount=0,total=0;
 for(const row of inventory.files){
  const file=path.join(root,row.path),bytes=fs.readFileSync(file);
  assert.equal(bytes.length,row.bytes,'Current bytes '+row.path);
  assert.equal(sha(bytes),row.sha256,'Current SHA '+row.path);
  assert.equal(row.publish,false);
  assert.ok(!row.path.endsWith('.blend'),'Blender authoring source retired');
  total+=bytes.length;
  if(!row.path.endsWith('.glb'))continue;
  const result=await validator.validateBytes(bytes,{maxIssues:10000});
  assert.equal(result.issues.numErrors,0,'GLB validation '+row.path);
  assert.equal(result.issues.numWarnings,0,'GLB warnings '+row.path);
  glbCount++;
 }
 assert.equal(total,inventory.totalBytes,'Current source byte ledger');
 assert.equal(glbCount,6,'Three player and three enemy retained candidate GLBs');
 const pub=require('../../scripts/publish-assets.cjs').inspect(process.cwd());
 assert.equal(pub.missing.length,0);
 assert.ok(!pub.keep.some(p=>p.startsWith('development/')),'Never publish development-only B2');
 assert.ok(pub.keep.includes('3d-test/gm-battle-simulation.js'),'Retain approved GM B adapter');
 require('../../scripts/gm-sprite-publication.cjs')(process.cwd(),pub.files);
 console.log('PASS B-only GLB inspection, 165 current SHA assets, 174 verified B requests and formal release boundary');
})().catch(error=>{console.error(error);process.exitCode=1;});
