/* Shared readonly character assets. CPU bytes bounded; GPU containers belong to
   one scene and are disposed with it. No game state, storage or auth writes. */
(function(global){
'use strict';
const base=new URL('../',document.currentScript.src),registryPath='assets/3d/asset-registry.json';
const bytes=new Map(),inflight=new Map(),equipmentOwners=new WeakMap();
const CACHE_BUFFERS=8,CACHE_BYTES=16*1024*1024;
let registryJob=null,pluginJob=null;
const stats={downloads:0,downloadedBytes:0,containers:0,equipmentContainers:0,failures:0};
const sha=async data=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',data)),x=>x.toString(16).padStart(2,'0')).join('');
async function registry(){
 if(!registryJob)registryJob=fetch(new URL(registryPath,base),{cache:'no-store',credentials:'same-origin'}).then(async r=>{
  if(!r.ok)throw Error('人物資源清單無法取得');const d=await r.json();
  if(d.schema!==1||d.rigContract!=='cw.humanoid.rig.v1'||!Array.isArray(d.assets))throw Error('人物資源清單不相容');
  return d;
 }).catch(e=>{registryJob=null;throw e;});
 return registryJob;
}
async function verified(asset){
 const key=asset.id+':'+asset.sha256;
 if(bytes.has(key)){const data=bytes.get(key);bytes.delete(key);bytes.set(key,data);return data;}
 if(inflight.has(key))return inflight.get(key);
 const job=(async()=>{
  if(!/^[a-f0-9]{64}$/.test(asset.sha256)||asset.path.includes('..')||asset.path.includes(':')||asset.path.startsWith('/'))throw Error('人物資源路徑不相容');
  const url=new URL(asset.path,base);url.searchParams.set('asset',asset.sha256.slice(0,24));
  const r=await fetch(url,{credentials:'same-origin'});if(!r.ok)throw Error('人物模型下載失敗');
  const data=await r.arrayBuffer();
  if(data.byteLength!==asset.bytes||await sha(data)!==asset.sha256)throw Error('人物模型版本不一致');
  stats.downloads++;stats.downloadedBytes+=data.byteLength;
  bytes.set(key,data);while(bytes.size>CACHE_BUFFERS||[...bytes.values()].reduce((n,b)=>n+b.byteLength,0)>CACHE_BYTES)bytes.delete(bytes.keys().next().value);
  return data;
 })().finally(()=>inflight.delete(key));inflight.set(key,job);return job;
}
async function plugin(doc){
 if(global.BABYLON.SceneLoader.IsPluginForExtensionAvailable('.glb'))return;
 if(!pluginJob)pluginJob=(async()=>{
  const a=doc.assets.find(x=>x.id==='babylon.gltf-loader.v7.54.3');if(!a)throw Error('人物解碼模組缺少');
  const data=await verified(a),url=URL.createObjectURL(new Blob([data],{type:'text/javascript'}));
  try{await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=url;s.onload=()=>{s.remove();resolve();};s.onerror=()=>{s.remove();reject(Error('人物解碼模組無法載入'));};document.head.appendChild(s);});}
  finally{URL.revokeObjectURL(url);}
 })().catch(e=>{pluginJob=null;throw e;});
 return pluginJob;
}
async function attach(scene,args){
 const current=()=>!scene.isDisposed&&!args.signal?.aborted&&(args.isCurrent?.()??true);
 let container=null,counted=false;
 try{
  const doc=await registry();if(!current())throw Error('preview-cancelled');
  const quality=['low','medium','high'].includes(args.quality)?args.quality:matchMedia('(max-width: 700px)').matches?'low':'medium';
  const asset=doc.assets.find(a=>a.id===doc.player[quality]);if(!asset)throw Error('人物品質版本缺少');
  await plugin(doc);if(!current())throw Error('preview-cancelled');
  const data=await verified(asset);if(!current())throw Error('preview-cancelled');
  const file=new File([data],asset.path.split('/').pop(),{type:'model/gltf-binary'});
  container=await global.BABYLON.SceneLoader.LoadAssetContainerAsync('file:',file,scene,undefined,'.glb');
  if(!current())throw Error('preview-cancelled');
  if(!container.skeletons.length||!container.meshes.some(m=>m.getTotalVertices()>0&&m.skeleton)||!container.animationGroups.length)throw Error('人物骨架或動畫不完整');
  const nodes=[...container.transformNodes,...container.meshes],sockets={};
  for(const [slot,name] of Object.entries(doc.slots)){const node=nodes.find(n=>n.name===name);if(!node)throw Error('人物掛點缺少');sockets[slot]=node.name;}
  container.addAllToScene();stats.containers++;counted=true;
  container.animationGroups[0].start(true,1);
  await prepareEquipment(scene,args,doc,quality,nodes,container);
  if(!current())throw Error('preview-cancelled');
  scene.onDisposeObservable.addOnce(()=>{container.dispose();if(counted){stats.containers--;counted=false;}});
  scene.metadata.civilization3dCharacter={...scene.metadata.civilization3dCharacter,
   assetKind:'skinned-glb',assetId:asset.id,sha256:asset.sha256,quality,artStatus:doc.artStatus,
   rigContract:doc.rigContract,sockets,bones:container.skeletons[0].bones.length,
   meshCount:container.meshes.filter(m=>m.getTotalVertices()>0).length,animationGroups:container.animationGroups.length};
  return {ok:true};
 }catch(error){
  container?.dispose();if(counted){stats.containers--;counted=false;}stats.failures++;
  return {ok:false,cancelled:!current(),reason:String(error.message||error)};
 }
}


async function prepareEquipment(scene,args,doc,quality,nodes,character){
 const resolver=global.Civilization3DAppearance?.resolveEquipment;
 if(!doc.equipment||typeof resolver!=='function')return;
 const B=global.BABYLON,session=equipmentSession(scene),found=new Map(nodes.map(n=>[n.name,n]));
 const baseSkeleton=character.skeletons[0];
 const coverage=doc.occlusion?.[quality];
 const asset=doc.assets.find(a=>a.id===doc.player[quality]);
 const original=[];
 if(coverage?.characterSHA256===asset.sha256){
  for(const row of coverage.meshes){
   const mesh=character.meshes.find(m=>m.material?.name===row.material&&m.getTotalVertices()===row.vertices&&m.getTotalIndices()===row.indexCount);
   if(!mesh)throw Error('equipment-region-contract');
   original.push({mesh,row,indices:Array.from(mesh.getIndices())});
  }
 }
 const mounted=new Map(),status={};
 // A scene-only grasp overlay follows the existing idle clip. It never edits
 // skeleton/bind data or creates another animation system/owner.
 const fingers=baseSkeleton.bones.filter(b=>/^(index|middle|ring|little|thumb)_0[123]\.R$/.test(b.name)).map(b=>({node:b.getTransformNode(),name:b.name,base:null,applied:null}));
 function grasp(){
  const hold=mounted.has('weapon');
  for(const f of fingers){
   const n=f.node;if(!n?.rotationQuaternion)continue;
   if(n.rotationQuaternion!==f.applied)f.base=n.rotationQuaternion.clone();
   if(!f.base)continue;
   if(hold){
    const part=Number(f.name.match(/_0([123])/)[1]);
    const degrees=f.name.startsWith('thumb')?[12,18,12][part-1]:[34,42,26][part-1];
    f.applied=f.base.multiply(B.Quaternion.RotationAxis(B.Axis.X,degrees*Math.PI/180));n.rotationQuaternion=f.applied;
   }else if(n.rotationQuaternion===f.applied){n.rotationQuaternion=f.base.clone();f.applied=null;}
  }
 }
 scene.onAfterAnimationsObservable.add(grasp);

 function masks(){
  const hidden=new Set([...mounted.values()].flatMap(a=>a.hideRegions||[]));
  for(const {mesh,row,indices} of original){
   const excluded=new Set();
   for(const region of hidden)for(const [start,count] of row.regions[region]||[])for(let i=start;i<start+count;i+=3)excluded.add(i);
   const visible=[];for(let i=0;i<indices.length;i+=3)if(!excluded.has(i))visible.push(indices[i],indices[i+1],indices[i+2]);
   // setIndices creates this scene's GPU index buffer; shared verified GLB bytes
   // and all vertex attributes/weights remain immutable and exactly restorable.
   mesh.setIndices(visible,null,false);mesh.refreshBoundingInfo();
  }
  scene.metadata.civilization3dCharacter={...scene.metadata.civilization3dCharacter,equipmentStatus:{...status},equipmentAssets:Object.fromEntries([...mounted].map(([s,a])=>[s,a.id])),hidePolicy:original.length?'verified-covered-triangles-only':'no-hide-without-verified-region-mesh',hiddenRegions:[...hidden]};
 }
 async function load(d){
  const a=doc.assets.find(a=>a.id===d.assetId&&a.type==='equipment'&&a.slot===d.type&&a.quality===quality&&a.sha256===d.sha256);
  const parent=found.get(doc.slots[d.type]);
  let box=null,counted=false;
  const release=()=>{box?.dispose();if(counted){stats.equipmentContainers--;counted=false;if(mounted.get(d.type)===a)mounted.delete(d.type);}};
  try{
   if(!a||(a.mount!=='rigid'&&a.mount!=='skinned')||a.rigContract!==doc.rigContract||!parent)throw Error('equipment-contract');
   const data=await verified(a);
   const file=new File([data],a.path.split('/').pop(),{type:'model/gltf-binary'});
   box=await B.SceneLoader.LoadAssetContainerAsync('file:',file,scene,undefined,'.glb');
   if(scene.isDisposed||args.signal?.aborted||args.isCurrent?.()===false)throw Error('preview-cancelled');
   const meshes=box.meshes.filter(m=>m.getTotalVertices()>0);
   for(const mesh of meshes)if(mesh.material instanceof B.PBRMaterial)mesh.material.specularIntensity=.35;
   if(!meshes.length)throw Error('equipment-invalid');
   if(a.mount==='rigid'){
    if(box.skeletons.length)throw Error('equipment-rigid-skin');
   }else{
    const skin=box.skeletons[0];
    if(!skin||skin.bones.length!==53||baseSkeleton.bones.length!==53||!meshes.every(m=>m.skeleton===skin))throw Error('equipment-skin-count');
    for(let i=0;i<53;i++){
     const old=skin.bones[i],target=baseSkeleton.bones[i];
     if(old.name!==target.name||old.getParent()?.name!==target.getParent()?.name||old.getIndex()!==target.getIndex()||old.getBindPose().m.some((v,k)=>Math.abs(v-target.getBindPose().m[k])>0.00001))throw Error('equipment-skin-bind');
    }
    for(const mesh of meshes)mesh.skeleton=baseSkeleton;
   }
   const roots=box.rootNodes?.length?box.rootNodes:box.meshes.filter(m=>!m.parent);
   return {dispose:release,commit:()=>{
    box.addAllToScene();stats.equipmentContainers++;counted=true;
    if(a.mount==='rigid')for(const n of roots){n.parent=parent;n.position.set(0,0,0);n.scaling.set(1,1,1);n.rotationQuaternion=B.Quaternion.Identity();}
    mounted.set(d.type,a);status[d.type]='mounted';
   }};
  }catch(error){
   release();
   // Failed replacement removes only this slot and restores its covered base.
   return {failed:true,dispose(){},commit(){status[d.type]='fallback';mounted.delete(d.type);}};
  }
 }
 async function update(descriptors){
  const selected=resolver(descriptors||[],doc,quality);
  const ok=await session.update(selected,load);
  if(!ok||scene.isDisposed)return false;
  for(const d of selected)if(!d.present||!d.assetId){mounted.delete(d.type);status[d.type]=d.present?'geometry-fallback':'empty';}
  masks();grasp();return true;
 }
 equipmentOwners.set(scene,{update,session});
 scene.onDisposeObservable.addOnce(()=>{equipmentOwners.delete(scene);});
 await update(args.modelDescriptors||[]);
}

async function updateEquipment(scene,descriptors){
 const owner=equipmentOwners.get(scene);if(!owner||scene.isDisposed)return false;
 return owner.update(descriptors);
}

async function displayEquipment(scene,args,anchors){
 const current=()=>!scene.isDisposed&&!args.signal?.aborted&&(args.isCurrent?.()??true);
 const status={};
 try{
  const doc=await registry();
  const quality=['low','medium','high'].includes(args.quality)?args.quality:matchMedia('(max-width: 700px)').matches?'low':'medium';
  const ds=global.Civilization3DAppearance.resolveEquipment(args.modelDescriptors||[],doc,quality);
  if(ds.some(d=>d.present&&d.assetId))await plugin(doc);
  for(const [i,d] of ds.entries()){
   if(!current())break;
   if(!d.present||!d.assetId){status[d.type]=d.present?'geometry-fallback':'empty';continue;}
   let box=null,counted=false;
   const release=()=>{box?.dispose();if(counted){stats.equipmentContainers--;counted=false;}};
   try{
    const a=doc.assets.find(a=>a.id===d.assetId),data=await verified(a);
    box=await global.BABYLON.SceneLoader.LoadAssetContainerAsync('file:',new File([data],a.path.split('/').pop(),{type:'model/gltf-binary'}),scene,undefined,'.glb');
    if(!current())throw Error('preview-cancelled');
    box.addAllToScene();counted=true;stats.equipmentContainers++;
    for(const mesh of box.meshes)if(mesh.material instanceof global.BABYLON.PBRMaterial)mesh.material.specularIntensity=.35;
    if(a.mount==='rigid'&&a.displayRotation){const mesh=box.meshes.find(m=>m.getTotalVertices()>0);mesh.rotationQuaternion=global.BABYLON.Quaternion.FromArray(a.displayRotation);}
    const root=box.rootNodes[0],bounds=root.getHierarchyBoundingVectors(true),center=bounds.min.add(bounds.max).scale(.5),height=bounds.max.y-bounds.min.y,scale=1.65/Math.max(.1,height);
    root.scaling.scaleInPlace(scale);root.position.set((i-2)*2.2-center.x*scale,.5-center.y*scale,-center.z*scale);
    for(const mesh of anchors[i]||[])mesh.setEnabled(false);
    scene.onDisposeObservable.addOnce(release);status[d.type]='equipment-glb';
   }catch(_){release();status[d.type]='fallback';}
  }
 }catch(_){}
 if(current())scene.metadata.civilization3dEquipment={...scene.metadata.civilization3dEquipment,equipmentStatus:status};
}

/* Equipment update owner is per scene, never global/player state.
   A stale completion is disposed rather than committed. */
function equipmentSession(scene){
 let generation=0,disposed=false;
 const owned=new Map();
 const release=(slot)=>{const entry=owned.get(slot);owned.delete(slot);try{entry?.dispose?.();}catch(_){}};
 const dispose=()=>{if(disposed)return;disposed=true;generation++;for(const slot of [...owned.keys()])release(slot);};
 scene.onDisposeObservable?.addOnce(dispose);
 async function update(descriptors,loader){
  const mine=++generation;
  const desired=new Map((Array.isArray(descriptors)?descriptors:[]).filter(d=>d?.present&&d?.assetId).map(d=>[d.type,d]));
  const staged=new Map();
  try{
   for(const [slot,d] of desired){
    if(disposed||scene.isDisposed||mine!==generation)break;
    const old=owned.get(slot);
    if(old&&!old.failed&&old.assetId===d.assetId&&old.sha256===d.sha256)continue;
    const loaded=await loader(d);
    if(!loaded||typeof loaded.dispose!=='function')throw Error('Invalid equipment container');
    if(disposed||scene.isDisposed||mine!==generation){loaded.dispose();break;}
    staged.set(slot,{...loaded,assetId:d.assetId,sha256:d.sha256});
   }
   if(disposed||scene.isDisposed||mine!==generation)return false;
   for(const slot of [...owned.keys()])if(!desired.has(slot)||staged.has(slot))release(slot);
   for(const [slot,entry] of staged){try{entry.commit?.();owned.set(slot,entry);}catch(error){entry.dispose();staged.delete(slot);throw error;}}
   staged.clear();
   return true;
  }finally{for(const e of staged.values())try{e.dispose();}catch(_){}}
 }
 return Object.freeze({update,dispose,snapshot:()=>({generation,disposed,slots:[...owned.keys()]})});
}
global.Civilization3DCharacterAssets=Object.freeze({equipmentSession,attach,updateEquipment,displayEquipment,snapshot:()=>({...stats,cacheLimitBuffers:CACHE_BUFFERS,cacheLimitBytes:CACHE_BYTES,cachedBuffers:bytes.size,cachedBytes:[...bytes.values()].reduce((s,b)=>s+b.byteLength,0),pending:inflight.size}),clearBytes:()=>bytes.clear()});
})(window);
