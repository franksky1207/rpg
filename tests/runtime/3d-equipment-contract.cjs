'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),vm=require('node:vm');
const {glb,checkCompatibleSkin}=require('../../scripts/asset-registry.cjs');
const registry=JSON.parse(fs.readFileSync('assets/3d/asset-registry.json'));
const rows=registry.assets.filter(a=>a.type==='equipment'),slots=['weapon','helmet','armor','shoes','accessory'];
assert.equal(rows.length,15,'one real first set, five slots times three actual LODs');
const window={};vm.runInNewContext(fs.readFileSync('3d-test/appearance-snapshot.js','utf8'),{window});
const source=JSON.parse(fs.readFileSync('development/3d-source/equipment/ancient-ruins-v1/rig-contract.json'));
assert.equal(source.bones.length,53);assert.equal(Object.keys(source.sockets).length,9);
assert.equal(source.baseSHA256,registry.assets.find(a=>a.type==='character').source.sha256);
const names=['古代光刃','遺物守衛盔','自律護衛甲','遺跡浮行靴','古文明鑰印'];
for(const q of ['low','medium','high']){
 const selected=slots.map((type,i)=>window.Civilization3DAppearance.modelDescriptor(type,{present:true,name:names[i],world:1}));
 const resolved=window.Civilization3DAppearance.resolveEquipment(selected,registry,q);
 assert.ok(resolved.every(d=>d.assetKind==='equipment-glb'));
 assert.ok(window.Civilization3DAppearance.resolveEquipment(selected.map(d=>({...d,world:2})),registry,q).every(d=>d.assetId===null),'world 2 cannot impersonate this identity');
 assert.ok(window.Civilization3DAppearance.resolveEquipment(selected.map(d=>({...d,name:'未製作的裝備'})),registry,q).every(d=>d.assetId===null),'unbuilt names cannot impersonate the first set');
 for(const a of rows.filter(a=>a.quality===q)){
  const bytes=fs.readFileSync(a.path),d=glb(bytes,a.id);
  assert.deepEqual(a.names,[names[slots.indexOf(a.slot)]]);assert.equal(a.socket,registry.slots[a.slot]);
  assert.ok(!d.images?.length,'no oversized new texture atlas');assert.ok(!d.animations?.length,'uses existing character animation');
  assert.ok(d.materials.every(m=>!m.alphaMode||m.alphaMode==='OPAQUE'),'no transparent face loophole');
  const node=d.nodes.find(n=>n.mesh!==undefined);assert.ok(!node.matrix&&!node.translation&&!node.rotation&&!node.scale,'mesh origin baked, no hidden transform');
  if(a.mount==='skinned'){
   const base=registry.assets.find(p=>p.id===registry.player[q]),b=fs.readFileSync(base.path),ref=glb(b,base.id);
   checkCompatibleSkin(bytes,d,b,ref);
   const broken=structuredClone(d);broken.nodes[broken.skins[0].joints[1]].name='wrong.pelvis';assert.throws(()=>checkCompatibleSkin(bytes,broken,b,ref),/joint order\/name/);
   const corrupt=Buffer.from(bytes),acc=d.accessors[d.skins[0].inverseBindMatrices],view=d.bufferViews[acc.bufferView],offset=20+bytes.readUInt32LE(12)+8+(view.byteOffset||0)+(acc.byteOffset||0);
   corrupt.writeFloatLE(2,offset);assert.throws(()=>checkCompatibleSkin(corrupt,d,b,ref),/inverse bind/);
   if(a.slot==='shoes'){
    const json=JSON.stringify(d);assert.match(json,/foot.L/);assert.match(json,/foot.R/);assert.ok(a.metrics.triangles>400,'both shaped boots exported');
   }
  }else{assert.ok(!d.skins);assert.ok(a.metrics.triangles>=100,'authored layered design, not an empty mount');}
 }
 const total=rows.filter(a=>a.quality===q).reduce((n,a)=>n+a.bytes,0);assert.ok(total<450000,'first set bounded mobile download');
}
console.log('PASS Batch28C 15 actual LODs, strict five formal identities, opaque helmet, paired boots, 53 joint/bind/weights, wrong-name/bind rejection, no base changes');
