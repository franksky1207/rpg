'use strict';
// Candidate binary validation: no runtime import, account or combat calculation.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto'),validator=require('gltf-validator');
const root='development/hybrid-comparison/t2b2-v1',json=p=>JSON.parse(fs.readFileSync(p)),sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const lock=json(root+'/source-lock.json'),fixture=json('development/hybrid-comparison/t2a-v1/owner-fixtures.json');
const doc=p=>{const b=fs.readFileSync(p);return JSON.parse(b.subarray(20,20+b.readUInt32LE(12)));};
(async()=>{
 for(const [p,h] of Object.entries(lock.sources))require('../../development/hybrid-comparison/t2b3-v1/source-version.cjs')(p,h);
 assert.equal(lock.fixtureSHA,fixture.sha256);assert.deepEqual(lock.representatives,fixture.representatives);
 for(const kind of ['normal','elite','boss']){const design=json(`${root}/enemies/${kind}/design.json`);assert.deepEqual(design.identity,fixture.representatives.find(r=>r.kind===kind));assert.equal(design.identity.formalId,null);assert.match(design.status,/pending/);}
 let n=0;const inventory=json(root+'/inventory.json');
 for(const row of inventory.files){assert.equal(sha(fs.readFileSync(path.join(root,row.path))),row.sha256);assert.equal(row.publish,false);if(!row.path.endsWith('.glb'))continue;
  const file=path.join(root,row.path),r=await validator.validateBytes(fs.readFileSync(file),{maxIssues:10000});assert.equal(r.issues.numErrors,0,JSON.stringify(r.issues.messages));assert.equal(r.issues.numWarnings,0,JSON.stringify(r.issues.messages));const d=doc(file);
  // Blender retains authored frame origin 1/30s. The contract is 700ms elapsed,
  // so compare actual end-start and require consistent start across channels.
  for(const name of ['idle','attack','hit','dodge','return','defeat']){const a=d.animations.find(a=>a.name==='B2_'+name);assert.ok(a,'Actual action '+name);assert.ok(a.channels.length>=6);const starts=a.samplers.map(s=>d.accessors[s.input].min[0]);assert.ok(starts.every(t=>Math.abs(t-1/30)<.0001));assert.ok(a.samplers.every(s=>Math.abs((d.accessors[s.input].max[0]-d.accessors[s.input].min[0])-.7)<.0001));}
  if(row.path.startsWith('player/')){assert.equal(d.skins[0].joints.length,53);const baseline=doc(`assets/3d/characters/player-v1/player-${row.path.match(/(low|medium|high)/)[1]}.glb`);assert.deepEqual(d.skins[0].joints.map(i=>d.nodes[i].name),baseline.skins[0].joints.map(i=>baseline.nodes[i].name));assert.equal(d.meshes.length,1,'No equipment or extra models embedded');assert.equal(d.nodes.filter(n=>/^(socket\.|fx\.)/.test(n.name||'')).length,9);}
  n++;console.log('PASS candidate GLB actions/rig/zero Khronos errors and warnings',row.path,row.metrics.triangles);
 }
 assert.equal(n,6);const pub=require('../../scripts/publish-assets.cjs').inspect(process.cwd());assert.ok(!pub.keep.some(p=>p.startsWith('development/')));assert.equal(pub.keep.length,389,'382 retained historical sources after three pure decorative retirements plus one GM-only atlas review module and six closed T3-B assets/session/renderer/controller/clock/entry modules; build separately adds .nojekyll and .publish-candidate');for(const p of ['3d-test/t3b-formal-assets.js','3d-test/t3b-formal-session.js','3d-test/t3b-formal-renderer.js','3d-test/t3b-formal-controller.js','3d-test/t3b-formal-owner-clock.js','3d-test/t3b-formal-entry.js'])assert.ok(pub.keep.includes(p),'Closed formal module retained '+p);assert.ok(pub.keep.includes('3d-test/t3b-formal-projection.js'),'Formal B projection must be included in published sources');
 console.log('PASS six candidates, formal IDs/sources, original fixture/runtime isolation, 389 copied sources exclude development, including T3-A policy and T3-B projection');
})().catch(e=>{console.error(e);process.exitCode=1;});
