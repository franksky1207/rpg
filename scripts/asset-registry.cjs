"use strict";
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const REGISTRY='assets/3d/asset-registry.json';
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
function glb(bytes,label){
 if(bytes.length<20||bytes.readUInt32LE(0)!==0x46546c67||bytes.readUInt32LE(4)!==2||bytes.readUInt32LE(8)!==bytes.length)throw Error('Invalid GLB: '+label);
 if(bytes.readUInt32LE(16)!==0x4e4f534a)throw Error('Missing GLB JSON: '+label);
 return JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)).toString());
}
function accessorValues(bytes,doc,index){
 const a=doc.accessors[index],v=doc.bufferViews[a.bufferView],counts={SCALAR:1,VEC3:3,VEC4:4,MAT4:16},sizes={5121:1,5123:2,5125:4,5126:4};
 if(!a||!v||!counts[a.type]||!sizes[a.componentType]||a.sparse)throw Error('Unsupported skin accessor');
 const n=counts[a.type],size=sizes[a.componentType],bin=20+bytes.readUInt32LE(12)+8;
 return Array.from({length:a.count},(_,i)=>Array.from({length:n},(_,k)=>{
  const p=bin+(v.byteOffset||0)+(a.byteOffset||0)+i*(v.byteStride||n*size)+k*size;
  return a.componentType===5126?bytes.readFloatLE(p):size===1?bytes.readUInt8(p):size===2?bytes.readUInt16LE(p):bytes.readUInt32LE(p);
 }));
}
function checkCompatibleSkin(bytes,doc,referenceBytes,reference){
 const skin=doc.skins?.[0],base=reference.skins[0];
 if(doc.skins?.length!==1||skin.joints.length!==53)throw Error('Equipment requires full 53-joint compatible skin');
 const names=skin.joints.map(i=>doc.nodes[i].name),expected=base.joints.map(i=>reference.nodes[i].name);
 if(JSON.stringify(names)!==JSON.stringify(expected))throw Error('Equipment joint order/name mismatch');
 const matrices=accessorValues(bytes,doc,skin.inverseBindMatrices),rest=accessorValues(referenceBytes,reference,base.inverseBindMatrices);
 if(matrices.some((m,i)=>m.some((v,k)=>!Number.isFinite(v)||Math.abs(v-rest[i][k])>1e-6)))throw Error('Equipment inverse bind mismatch');
 const parent=(d,joints,index)=>{const p=joints.find(i=>d.nodes[i].children?.includes(index));return p===undefined?null:d.nodes[p].name;};
 for(let j=0;j<53;j++){
  const n=doc.nodes[skin.joints[j]],b=reference.nodes[base.joints[j]];
  if(parent(doc,skin.joints,skin.joints[j])!==parent(reference,base.joints,base.joints[j]))throw Error('Equipment bone parent mismatch');
  for(const [key,def] of [['translation',[0,0,0]],['rotation',[0,0,0,1]],['scale',[1,1,1]]])if((n[key]||def).some((v,k)=>Math.abs(v-(b[key]||def)[k])>1e-6))throw Error('Equipment rest transform mismatch');
 }
 for(const m of doc.meshes)for(const p of m.primitives){
  if(p.attributes.JOINTS_0===undefined||p.attributes.WEIGHTS_0===undefined)throw Error('Equipment mesh missing weights');
  const joints=accessorValues(bytes,doc,p.attributes.JOINTS_0),weights=accessorValues(bytes,doc,p.attributes.WEIGHTS_0);
  for(let i=0;i<weights.length;i++)if(joints[i].some(j=>j<0||j>=53)||weights[i].some(w=>!Number.isFinite(w)||w<0||w>1)||Math.abs(weights[i].reduce((s,w)=>s+w,0)-1)>1e-4)throw Error('Equipment skin weights invalid');
 }
}
function inspectRegistry(root,available){
 if(!available.has(REGISTRY))return {paths:[],entries:[],registry:null};
 const registry=JSON.parse(fs.readFileSync(path.join(root,REGISTRY),'utf8'));
 if(registry.schema!==1||registry.rigContract!=='cw.humanoid.rig.v1'||!Array.isArray(registry.assets))throw Error('Invalid 3D registry schema');
 const entries=new Map();
 const safe=p=>typeof p==='string'&&!p.includes('..')&&!p.startsWith('/')&&!p.includes('\\')&&!p.includes(':')&&!p.includes('?');
 for(const a of registry.assets){
  if(!a.id||entries.has(a.id)||!safe(a.path)||!/^\w[\w.-]*$/.test(a.id))throw Error('Invalid/duplicate asset ID');
  if(!/\.(?:glb|png|webp|jpe?g|bin|js|ktx2|basis)$/.test(a.path)||a.path.startsWith('development/'))throw Error('Source format not allowed in registry: '+a.path);
  if(!available.has(a.path))throw Error('Registered asset missing: '+a.id+' -> '+a.path);
  const bytes=fs.readFileSync(path.join(root,a.path));
  if(a.sha256!==sha(bytes)||a.bytes!==bytes.length)throw Error('Asset digest/size mismatch: '+a.id);
  if(!a.license||!a.source?.path||!safe(a.source.path)||!available.has(a.source.path))throw Error('Asset source/license missing: '+a.id);
  if(a.source.sha256!==sha(fs.readFileSync(path.join(root,a.source.path))))throw Error('Source digest mismatch: '+a.id);
  if(a.preload!==false||!Array.isArray(a.dependencies)||!Array.isArray(a.epochs)||!Array.isArray(a.scenes))throw Error('Explicit on-demand policy required: '+a.id);
  entries.set(a.id,a);
 }
 const visit=(id,stack=[])=>{
  const a=entries.get(id);if(!a)throw Error('Missing registry dependency ID: '+id);
  if(stack.includes(id))throw Error('Registry dependency cycle: '+id);
  for(const dep of a.dependencies)visit(dep,[...stack,id]);
 };
 for(const a of entries.values()){
  visit(a.id);
  if(a.path.endsWith('.glb')){
   const doc=glb(fs.readFileSync(path.join(root,a.path)),a.id);
   if(!doc.meshes?.length||!doc.materials?.length)throw Error('Mesh/material missing: '+a.id);
   if(a.type==='character'){
    if(!doc.skins?.length||doc.skins[0].joints.length!==53||!doc.animations?.length)throw Error('Rig/material/animation missing: '+a.id);
    for(const name of Object.values(registry.slots))if(!doc.nodes.some(n=>n.name===name))throw Error('Missing socket '+name);
   }else if(a.type==='equipment'){
    if(!['weapon','helmet','armor','shoes','accessory'].includes(a.slot)||!['rigid','skinned'].includes(a.mount)||a.rigContract!=='cw.humanoid.rig.v1')throw Error('Equipment mounting contract invalid: '+a.id);
    if(a.socket!==registry.slots[a.slot]||!Array.isArray(a.names)||!a.names.length||a.lod!==a.quality)throw Error('Equipment identity/socket/LOD missing: '+a.id);
    if(a.mount==='skinned'){
     const base=entries.get(registry.player[a.quality]);if(!base)throw Error('Missing player LOD for equipment');
     const ref=fs.readFileSync(path.join(root,base.path));checkCompatibleSkin(fs.readFileSync(path.join(root,a.path)),doc,ref,glb(ref,base.id));
    }
    if(a.mount==='rigid'&&doc.skins?.length)throw Error('Rigid equipment must not include skin: '+a.id);
   }else throw Error('Unsupported GLB asset type: '+a.id);
   for(const row of [...(doc.images||[]),...(doc.buffers||[])])if(row.uri)throw Error('External GLB dependency must be embedded: '+a.id);
   if((doc.extensionsRequired||[]).some(x=>/compression|draco|basisu/i.test(x)))throw Error('Unverified GLB codec: '+a.id);
  }
 }
 if(registry.equipment!==undefined){
  if(!registry.equipment||typeof registry.equipment!=='object'||Array.isArray(registry.equipment))throw Error('Invalid equipment mapping');
  for(const [slot,mapping] of [registry.equipment,...Object.values(registry.equipmentFamilies||{})].flatMap(f=>Object.entries(f))){
   if(!['weapon','helmet','armor','shoes','accessory'].includes(slot)||!mapping||typeof mapping!=='object')throw Error('Invalid equipment slot mapping');
   for(const [quality,id] of Object.entries(mapping)){
    const asset=entries.get(id);
    if(!['low','medium','high'].includes(quality)||!asset||asset.type!=='equipment'||asset.slot!==slot||asset.quality!==quality)throw Error('Invalid equipment LOD mapping: '+slot+'/'+quality);
   }
  }
 }
 if(registry.occlusion)for(const [quality,map] of Object.entries(registry.occlusion)){
  const a=entries.get(registry.player[quality]);if(!a||a.sha256!==map.characterSHA256)throw Error('Occlusion character digest mismatch');
  const d=glb(fs.readFileSync(path.join(root,a.path)),a.id);
  for(const row of map.meshes){
   const p=d.meshes.flatMap(m=>m.primitives).find(p=>d.materials[p.material].name===row.material&&d.accessors[p.indices].count===row.indexCount&&d.accessors[p.attributes.POSITION].count===row.vertices);
   if(!p)throw Error('Occlusion primitive mismatch');
   for(const ranges of Object.values(row.regions))for(const [start,count] of ranges)if(!Number.isInteger(start)||!Number.isInteger(count)||start<0||count<=0||start%3||count%3||start+count>row.indexCount)throw Error('Occlusion range invalid');
   if(Object.values(row.regions).some(r=>r.reduce((s,x)=>s+x[1],0)>=row.indexCount))throw Error('Occlusion cannot erase entire base mesh');
  }
 }
 for(const quality of ['low','medium','high']){
  const a=entries.get(registry.player?.[quality]);if(!a||a.quality!==quality||a.type!=='character')throw Error('Missing player LOD: '+quality);
 }
 return {paths:[REGISTRY,...new Set([...entries.values()].map(a=>a.path))],entries:[...entries.values()],registry};
}
module.exports={REGISTRY,inspectRegistry,glb,sha,accessorValues,checkCompatibleSkin};
