#!/usr/bin/env node
'use strict';
// Extend, never regenerate/replace the accepted character registry.
const fs=require('node:fs'),{glb,sha}=require('./asset-registry.cjs');
const file='assets/3d/asset-registry.json',doc=JSON.parse(fs.readFileSync(file));
const source='development/3d-source/equipment/ancient-ruins-v1/ancient-ruins.blend';
const names={weapon:'古代光刃',helmet:'遺物守衛盔',armor:'自律護衛甲',shoes:'遺跡浮行靴',accessory:'古文明鑰印'};
doc.assets=doc.assets.filter(a=>!a.id.startsWith('equipment.ancient-ruins.v1.'));doc.equipment={};
for(const [slot,name] of Object.entries(names)){
 doc.equipment[slot]={};
 for(const quality of ['low','medium','high']){
  const path=`assets/3d/equipment/ancient-ruins-v1/${slot}-${quality}.glb`,b=fs.readFileSync(path),d=glb(b,path),id=`equipment.ancient-ruins.v1.${slot}.${quality}`;
  doc.equipment[slot][quality]=id;
  doc.assets.push({id,type:'equipment',slot,quality,mount:['weapon','accessory'].includes(slot)?'rigid':'skinned',rigContract:doc.rigContract,names:[name],identity:{world:1,chapter:'地球戰爭',area:'古代科技遺址',minLevel:31,maxLevel:35},socket:doc.slots[slot],displayRotation:d.nodes.find(n=>n.mesh!==undefined)?.extras?.display_rotation,path,sha256:sha(b),bytes:b.length,source:{path:source,sha256:sha(fs.readFileSync(source))},license:'CC0-1.0; original ancient-civilization wearable designs',epochs:[1],scenes:['character-formal','gm-character','equipment-display'],lod:quality,dependencies:['babylon.gltf-loader.v7.54.3'],preload:false,fallback:'procedural-geometry',hideRegions:slot==='helmet'?['face-covered']:slot==='armor'?['chest-covered']:slot==='shoes'?['boot-covered']:slot==='accessory'?['back-core-covered']:[],metrics:{triangles:d.meshes.reduce((s,m)=>s+m.primitives.reduce((s,p)=>s+d.accessors[p.indices].count/3,0),0),joints:d.skins?.[0]?.joints.length||0,materials:d.materials.length,embeddedImages:d.images?.length||0}});
 }
}
doc.equipmentFamilies={...doc.equipmentFamilies,'ancient-ruins-v1':doc.equipment};
// Conservative reversible triangle partitions of the unmodified accepted GLBs.
// All three vertices must lie inside a covered area. Never hide an entire head,
// neck, torso or foot mesh. The maps are bound to each character digest.
const inside={
 'face-covered':([x,y,z],mat)=>mat==='CW_Head_NaturalSkin'&&y>1.735&&y<1.862&&z>.036&&Math.abs(x)<.074,
 'chest-covered':([x,y,z])=>Math.abs(x)<.135&&y>1.375&&y<1.465&&z>.075,
 'boot-covered':([x,y,z])=>Math.abs(Math.abs(x)-.14)<.045&&y<.075&&y>.035&&z>.05&&z<.19,
 'back-core-covered':([x,y,z])=>Math.abs(x)<.030&&y>1.453&&y<1.514&&z<-.090
};
doc.occlusion={};
for(const quality of ['low','medium','high']){
 const a=doc.assets.find(a=>a.id===doc.player[quality]),b=fs.readFileSync(a.path),d=glb(b,a.id),bin=b.subarray(20+b.readUInt32LE(12)+8);
 const values=(idx)=>{const a=d.accessors[idx],v=d.bufferViews[a.bufferView],n={SCALAR:1,VEC3:3}[a.type],size={5123:2,5125:4,5126:4}[a.componentType];return Array.from({length:a.count},(_,i)=>Array.from({length:n},(_,k)=>{const pos=(v.byteOffset||0)+(a.byteOffset||0)+i*(v.byteStride||n*size)+k*size;return a.componentType===5126?bin.readFloatLE(pos):size===2?bin.readUInt16LE(pos):bin.readUInt32LE(pos);}));};
 const rows=[];
 for(const p of d.meshes.flatMap(m=>m.primitives)){
  const pos=values(p.attributes.POSITION),idx=values(p.indices).map(x=>x[0]),material=d.materials[p.material].name,regions={};
  for(const [region,test] of Object.entries(inside)){
   const ranges=[];
   for(let i=0;i<idx.length;i+=3)if(idx.slice(i,i+3).every(v=>test(pos[v],material))){const last=ranges.at(-1);if(last&&last[0]+last[1]===i)last[1]+=3;else ranges.push([i,3]);}
   if(ranges.length)regions[region]=ranges;
  }
  if(Object.keys(regions).length)rows.push({material,vertices:pos.length,indexCount:idx.length,regions});
 }
 doc.occlusion[quality]={characterSHA256:a.sha256,policy:'covered-triangles-only; immutable vertex buffers; restore original indices',meshes:rows};
}
doc.version='batch28c-ancient-ruins-v1';doc.equipmentArtStatus='first-set-awaiting-user-visual-acceptance';
const reviewPath='development/3d-source/equipment/concepts/galaxy/g007-ancient-tech-ruins/model-review.json';
if(fs.existsSync(reviewPath)){const review=JSON.parse(fs.readFileSync(reviewPath));if(review.reviewer==='user-delegated-chatgpt'&&review.sourceSha256===sha(fs.readFileSync(source))&&doc.assets.filter(a=>a.type==='equipment').every(a=>review.assetSha256[a.id]===a.sha256)){doc.version='batch28-consolidated-refinement-20261014';doc.equipmentArtStatus='refined-model-art-reviewed-by-user-delegated-chatgpt';}}
fs.writeFileSync(file,JSON.stringify(doc,null,2)+'\n');console.log('Registered 15 real equipment GLBs and digest-bound conservative coverage partitions');
