/* Shared readonly character assets. CPU bytes bounded; GPU containers belong to
   one scene and are disposed with it. No game state, storage or auth writes. */
(function(global){
'use strict';
const base=new URL('../',document.currentScript.src),registryPath='assets/3d/asset-registry.json';
const bytes=new Map(),inflight=new Map();
let registryJob=null,pluginJob=null;
const stats={downloads:0,downloadedBytes:0,containers:0,failures:0};
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
  bytes.set(key,data);while(bytes.size>2)bytes.delete(bytes.keys().next().value);
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
  await prepareEquipment(scene,args,doc,quality,nodes);
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


async function prepareEquipment(scene,args,doc,quality,nodes){
 const resolver=global.Civilization3DAppearance?.resolveEquipment;
 if(!doc.equipment||typeof resolver!=='function')return;
 const selected=resolver(args.modelDescriptors||[],doc,quality);
 const session=equipmentSession(scene),found=new Map(nodes.map(n=>[n.name,n]));
 const equipped=[];
 const status={};
 async function load(d){
  const a=doc.assets.find(a=>a.id===d.assetId&&a.type==='equipment'&&a.slot===d.type&&a.quality===quality&&a.sha256===d.sha256);
  const parent=found.get(doc.slots[d.type]);
  if(!a||a.mount!=='rigid'||a.rigContract!==doc.rigContract||!parent)throw Error('equipment-contract');
  const data=await verified(a);
  const file=new File([data],a.path.split('/').pop(),{type:'model/gltf-binary'});
  const box=await global.BABYLON.SceneLoader.LoadAssetContainerAsync('file:',file,scene,undefined,'.glb');
  if(scene.isDisposed||args.signal?.aborted||args.isCurrent?.()===false){box.dispose();throw Error('preview-cancelled');}
  if(box.skeletons.length||!box.meshes.some(m=>m.getTotalVertices()>0)){box.dispose();throw Error('equipment-invalid');}
  const roots=box.rootNodes?.length?box.rootNodes:box.meshes.filter(m=>!m.parent);
  return {dispose:()=>box.dispose(),commit:()=>{box.addAllToScene();for(const n of roots)n.parent=parent;}};
 }
 for(const d of selected){
  if(!d.present){status[d.type]='empty';continue;}
  if(!d.assetId){status[d.type]='geometry-fallback';continue;}
  try{
   if(await session.update([...equipped,d],load)){equipped.push(d);status[d.type]='mounted';}
  }catch(_){status[d.type]='fallback';}
 }
 if(!scene.isDisposed)scene.metadata.civilization3dCharacter={
  ...scene.metadata.civilization3dCharacter,equipmentStatus:status,
  hidePolicy:'no-hide-without-verified-region-mesh'
 };
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
    if(old?.assetId===d.assetId&&old?.sha256===d.sha256)continue;
    const loaded=await loader(d);
    if(!loaded||typeof loaded.dispose!=='function')throw Error('Invalid equipment container');
    if(disposed||scene.isDisposed||mine!==generation){loaded.dispose();break;}
    staged.set(slot,{...loaded,assetId:d.assetId,sha256:d.sha256});
   }
   if(disposed||scene.isDisposed||mine!==generation)return false;
   for(const slot of [...owned.keys()])if(!desired.has(slot)||staged.has(slot))release(slot);
   for(const [slot,entry] of staged){entry.commit?.();owned.set(slot,entry);}
   staged.clear();
   return true;
  }finally{for(const e of staged.values())try{e.dispose();}catch(_){}}
 }
 return Object.freeze({update,dispose,snapshot:()=>({generation,disposed,slots:[...owned.keys()]})});
}
global.Civilization3DCharacterAssets=Object.freeze({equipmentSession,attach,snapshot:()=>({...stats,cachedBuffers:bytes.size,cachedBytes:[...bytes.values()].reduce((s,b)=>s+b.byteLength,0),pending:inflight.size}),clearBytes:()=>bytes.clear()});
})(window);
