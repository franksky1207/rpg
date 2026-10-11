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
global.Civilization3DCharacterAssets=Object.freeze({attach,snapshot:()=>({...stats,cachedBuffers:bytes.size,cachedBytes:[...bytes.values()].reduce((s,b)=>s+b.byteLength,0),pending:inflight.size}),clearBytes:()=>bytes.clear()});
})(window);
