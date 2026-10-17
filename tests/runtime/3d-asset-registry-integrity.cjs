'use strict';
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict'),cp=require('node:child_process');
const {inspectRegistry,glb}=require('../../scripts/asset-registry.cjs');
const policy=require('../../scripts/publish-assets.cjs');
const root=path.resolve(__dirname,'../..'),files=new Set(cp.execFileSync('git',['ls-files','-z'],{cwd:root,encoding:'utf8'}).split('\0').filter(Boolean));
const result=inspectRegistry(root,files);assert.ok(result.entries.length>=4);assert.equal(result.entries.filter(a=>a.type==='character').length,3);assert.equal(result.entries.filter(a=>a.type==='decoder').length,1);
const registry=result.registry,source=registry.assets.find(a=>a.type==='character').source.path;
assert.ok(!fs.existsSync(path.join(root,source)),'Retired Blender authoring source must not be tracked');
for(const a of result.entries)assert.match(a.source.sha256,/^[a-f0-9]{64}$/,'Source provenance digest retained');
for(const a of result.entries.filter(a=>a.type==='character')){
 const bytes=fs.readFileSync(path.join(root,a.path)),doc=glb(bytes,a.id);
 assert.equal(doc.skins[0].joints.length,53);assert.equal(doc.materials.length,5);assert.equal(doc.images.length,2);
 assert.ok(doc.nodes.some(n=>n.name==='middle_03.L'));assert.ok(doc.nodes.some(n=>n.name==='thumb_03.R'));
 const binOffset=20+bytes.readUInt32LE(12)+8,bin=bytes.subarray(binOffset);
 assert.deepEqual(a.metrics.textureDimensions,[[512,512],[1024,1024]],'actual embedded textile and facial atlas dimensions');
 assert.ok(doc.meshes[0].primitives.some(p=>'COLOR_0' in p.attributes),'continuous tailoring must survive GLB export');
 const skinPrimitives=doc.meshes.flatMap(m=>m.primitives).filter(p=>doc.materials[p.material].name==='CW_Head_NaturalSkin');
 assert.ok(skinPrimitives.length>0);
 for(const p of skinPrimitives){
  const a=doc.accessors[p.attributes.COLOR_0],v=doc.bufferViews[a.bufferView];assert.equal(a.componentType,5126);
  const n=a.type==='VEC3'?3:4,offset=(v.byteOffset||0)+(a.byteOffset||0);
  for(let i=0;i<a.count;i++)for(let k=0;k<n;k++)assert.equal(bin.readFloatLE(offset+i*(v.byteStride||n*4)+k*4),1,'face atlas must have neutral vertex colour, without garment tint');
 }
 const accessor=(index)=>{const a=doc.accessors[index],v=doc.bufferViews[a.bufferView];return {a,v,offset:(v.byteOffset||0)+(a.byteOffset||0)};};
 for(const p of doc.meshes[0].primitives){
  assert.ok('JOINTS_0' in p.attributes&&'WEIGHTS_0' in p.attributes);
  const {a,v,offset}=accessor(p.attributes.WEIGHTS_0);assert.equal(a.componentType,5126);assert.equal(a.type,'VEC4');
  for(let i=0;i<a.count;i++){let total=0;for(let k=0;k<4;k++){const w=bin.readFloatLE(offset+i*(v.byteStride||16)+k*4);assert.ok(Number.isFinite(w)&&w>=0&&w<=1);total+=w;}assert.ok(Math.abs(total-1)<.0001);}
 }
}
const plan=policy.inspect(root);assert.ok(plan.keep.includes(registry.assets[1].path));assert.ok(!plan.keep.some(p=>p.startsWith('development/')));
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'cw-registry-'));
try{
 const copy=p=>{fs.mkdirSync(path.dirname(path.join(temp,p)),{recursive:true});fs.copyFileSync(path.join(root,p),path.join(temp,p));};
 for(const p of new Set(['assets/3d/asset-registry.json',...result.entries.map(a=>a.path),...result.entries.map(a=>a.source.path)]))if(fs.existsSync(path.join(root,p)))copy(p);
 const known=new Set([...files]);const original=JSON.stringify(registry);const write=d=>fs.writeFileSync(path.join(temp,'assets/3d/asset-registry.json'),JSON.stringify(d));
 const test=(change,pattern)=>{const d=JSON.parse(original);change(d);write(d);assert.throws(()=>inspectRegistry(temp,known),pattern);};
 test(d=>d.assets[1].path='assets/3d/missing.glb',/Registered asset missing/);
 test(d=>d.assets[1].dependencies=['unknown.asset'],/dependency ID/);
 test(d=>d.assets[1].sha256='0'.repeat(64),/digest\/size/);
 test(d=>d.assets[1].path='development/character.blend',/Source format/);
 test(d=>d.assets[1].source.path='development/missing-provenance.txt',/Non-retired asset source missing/);
 test(d=>d.assets[1].preload=true,/on-demand/);
 test(d=>d.player.low='unknown.asset',/Missing player LOD/);
 test(d=>d.slots.weapon='nonexistent.socket',/Missing socket/);
 console.log('PASS Batch 27 registry: real GLB skin weights, PBR/animation/sockets, LOD closure, retired authoring provenance and missing/hash/source/preload rejection');
}finally{fs.rmSync(temp,{recursive:true,force:true});}
