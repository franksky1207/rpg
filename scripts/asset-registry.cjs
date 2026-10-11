"use strict";
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const REGISTRY='assets/3d/asset-registry.json';
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
function glb(bytes,label){
 if(bytes.length<20||bytes.readUInt32LE(0)!==0x46546c67||bytes.readUInt32LE(4)!==2||bytes.readUInt32LE(8)!==bytes.length)throw Error('Invalid GLB: '+label);
 if(bytes.readUInt32LE(16)!==0x4e4f534a)throw Error('Missing GLB JSON: '+label);
 return JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)).toString());
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
    if(a.mount==='skinned'&&(!doc.skins?.length||!doc.skins[0].joints?.length))throw Error('Equipment skin missing: '+a.id);
    if(a.mount==='rigid'&&doc.skins?.length)throw Error('Rigid equipment must not include skin: '+a.id);
   }else throw Error('Unsupported GLB asset type: '+a.id);
   for(const row of [...(doc.images||[]),...(doc.buffers||[])])if(row.uri)throw Error('External GLB dependency must be embedded: '+a.id);
   if((doc.extensionsRequired||[]).some(x=>/compression|draco|basisu/i.test(x)))throw Error('Unverified GLB codec: '+a.id);
  }
 }
 if(registry.equipment!==undefined){
  if(!registry.equipment||typeof registry.equipment!=='object'||Array.isArray(registry.equipment))throw Error('Invalid equipment mapping');
  for(const [slot,mapping] of Object.entries(registry.equipment)){
   if(!['weapon','helmet','armor','shoes','accessory'].includes(slot)||!mapping||typeof mapping!=='object')throw Error('Invalid equipment slot mapping');
   for(const [quality,id] of Object.entries(mapping)){
    const asset=entries.get(id);
    if(!['low','medium','high'].includes(quality)||!asset||asset.type!=='equipment'||asset.slot!==slot||asset.quality!==quality)throw Error('Invalid equipment LOD mapping: '+slot+'/'+quality);
   }
  }
 }
 for(const quality of ['low','medium','high']){
  const a=entries.get(registry.player?.[quality]);if(!a||a.quality!==quality||a.type!=='character')throw Error('Missing player LOD: '+quality);
 }
 return {paths:[REGISTRY,...new Set([...entries.values()].map(a=>a.path))],entries:[...entries.values()],registry};
}
module.exports={REGISTRY,inspectRegistry,glb,sha};
