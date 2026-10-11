'use strict';
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict'),cp=require('node:child_process');
const {inspectRegistry,glb}=require('../../scripts/asset-registry.cjs');
const policy=require('../../scripts/publish-assets.cjs');
const root=path.resolve(__dirname,'../..'),files=new Set(cp.execFileSync('git',['ls-files','-z'],{cwd:root,encoding:'utf8'}).split('\0').filter(Boolean));
const result=inspectRegistry(root,files);assert.equal(result.entries.length,4);
const registry=result.registry,source=registry.assets.find(a=>a.type==='character').source.path;
assert.ok(fs.readFileSync(path.join(root,source)).subarray(0,7).equals(Buffer.from('BLENDER')),'real Blender source header');
for(const a of result.entries.filter(a=>a.type==='character')){
 const bytes=fs.readFileSync(path.join(root,a.path)),doc=glb(bytes,a.id);
 assert.equal(doc.skins[0].joints.length,53);assert.equal(doc.materials.length,5);assert.equal(doc.images.length,1);
 assert.ok(doc.nodes.some(n=>n.name==='middle_03.L'));assert.ok(doc.nodes.some(n=>n.name==='thumb_03.R'));
 const binOffset=20+bytes.readUInt32LE(12)+8,bin=bytes.subarray(binOffset);
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
 for(const p of new Set(['assets/3d/asset-registry.json',...result.entries.map(a=>a.path),...result.entries.map(a=>a.source.path)]))copy(p);
 const known=new Set([...files]);const original=JSON.stringify(registry);const write=d=>fs.writeFileSync(path.join(temp,'assets/3d/asset-registry.json'),JSON.stringify(d));
 const test=(change,pattern)=>{const d=JSON.parse(original);change(d);write(d);assert.throws(()=>inspectRegistry(temp,known),pattern);};
 test(d=>d.assets[1].path='assets/3d/missing.glb',/Registered asset missing/);
 test(d=>d.assets[1].dependencies=['unknown.asset'],/dependency ID/);
 test(d=>d.assets[1].sha256='0'.repeat(64),/digest\/size/);
 test(d=>d.assets[1].path='development/character.blend',/Source format/);
 test(d=>d.assets[1].preload=true,/on-demand/);
 test(d=>d.player.low='unknown.asset',/Missing player LOD/);
 test(d=>d.slots.weapon='nonexistent.socket',/Missing socket/);
 console.log('PASS Batch 27 registry: real GLB skin weights, PBR/animation/sockets, LOD closure, missing/hash/source/preload rejection');
}finally{fs.rmSync(temp,{recursive:true,force:true});}
