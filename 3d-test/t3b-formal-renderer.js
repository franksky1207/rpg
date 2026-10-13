/* Formal B renderer. No battle clock, state writes, rewards, audio or event producer. */
(function(global){
"use strict";
if(global.CivilizationFormalBRenderer)return;
const verified=new WeakMap(),clips=["idle","attack","hit","dodge","return","defeat"];
const hex=b=>Array.from(new Uint8Array(b),x=>x.toString(16).padStart(2,"0")).join("");
async function prepare(options){
 const {registry,catalog,identity,tier,appearance,signal}=options;
 const gate=global.CivilizationFormalBAssets;
 if(!gate||!signal||!identity||!appearance)throw Error("missing-formal-context");
 // Registration does not imply art approval. Require explicit release approval separately.
 if(options.approval?.player!==true||options.approval?.equipment!==true)throw Error("unapproved-player-art");
 const player=gate.player(registry,tier),enemy=gate.enemy(catalog,{...identity,tier});
 if(!player.ready||!enemy.ready)throw Error(player.ready?enemy.reason:player.reason);
 const equipment=[];
 for(const slot of gate.slots){
  const query=appearance[slot];if(!query)continue;
  const result=gate.equipment(registry,{...query,slot,tier});
  if(!result.ready)throw Error(slot+":"+result.reason);
  equipment.push({asset:result.asset,row:registry.assets.find(x=>x.id===result.asset.id)});
 }
 const atlas=catalog.entries.find(x=>x.id===identity.id&&x.world===identity.world&&x.kind===identity.kind&&x.location===identity.location&&x.tier===tier);
 const layout=atlas.layout;
 if(!layout||layout.durationMs!==700||layout.samples!==22||layout.clipStart!==1/30||clips.some(c=>{const row=layout.clips?.[c];return !row||!Array.isArray(row.frames)||row.frames.length!==22||!Array.isArray(row.dimensions)||row.dimensions.length!==2||row.dimensions.some(n=>!Number.isSafeInteger(n)||n<=0)||row.frames.some(f=>!Array.isArray(f.rect)||f.rect.length!==4||f.rect.some(n=>!Number.isSafeInteger(n)||n<0)||f.rect[2]<=0||f.rect[3]<=0||f.rect[0]+f.rect[2]>row.dimensions[0]||f.rect[1]+f.rect[3]>row.dimensions[1])}))throw Error("invalid-atlas-timing");
 async function bytes(row){
  signal.throwIfAborted();const response=await (options.fetch||global.fetch)(row.path,{signal,cache:"no-cache"});
  if(!response.ok)throw Error("asset-http:"+response.status);
  const buffer=await response.arrayBuffer();signal.throwIfAborted();
  if(buffer.byteLength!==row.bytes||hex(await global.crypto.subtle.digest("SHA-256",buffer))!==row.sha256)throw Error("asset-integrity:"+row.id);
  signal.throwIfAborted();return buffer;
 }
 const body=await bytes(player.asset),images={},gear=[];let animation=null;
 if(options.animation){const row=options.animation;if(options.approval?.animation!==true||!/^assets\/[a-zA-Z0-9_./-]+$/.test(row.path)||row.path.includes("..")||!row.license?.trim()||!Number.isSafeInteger(row.bytes)||row.bytes<=0||!/^([a-f0-9]{64})$/.test(row.sha256))throw Error("unapproved-animation");animation=await bytes(row);}
 for(const clip of clips){const row=layout.clips[clip].asset;if(!row||!/^assets\/[a-zA-Z0-9_./-]+$/.test(row.path)||row.path.includes("..")||!row.license?.trim()||!Number.isSafeInteger(row.bytes)||row.bytes<=0||!/^([a-f0-9]{64})$/.test(row.sha256))throw Error("invalid-atlas-asset");images[clip]=await bytes(row);}
 for(const item of equipment)gear.push({...item,bytes:await bytes(item.asset)});
 const token=Object.freeze({tier,identity:Object.freeze({...identity})});
 verified.set(token,{bodySHA256:player.asset.sha256,body,animation,images,gear,layout:JSON.parse(JSON.stringify(layout)),registry:JSON.parse(JSON.stringify(registry)),identity:{...identity},tier,signal});return token;
}
async function create(options){
 const {host,signal,isCurrent}=options,bundle=verified.get(options.bundle);
 if(!bundle||bundle.signal!==signal||typeof isCurrent!=="function"||!host)throw Error("unverified-renderer-input");
 const B=global.BABYLON;if(!B?.SceneLoader)throw Error("webgl-unavailable");
 let closed=false,engine,scene,canvas,texture,group=null,activeClip=null;
 const boxes=[],urls=[],unsubscribers=[],textures={};
 const current=()=>!closed&&!signal.aborted&&isCurrent();
 function dispose(){
  if(closed)return;closed=true;
  for(const off of unsubscribers)off();for(const box of boxes)box.dispose();
  scene?.dispose();engine?.dispose();for(const url of urls)global.URL.revokeObjectURL(url);
  canvas?.remove();
 }
 function requireCurrent(){if(!current())throw Error("stale-formal-renderer");}
 try{
  const aborted=()=>dispose();signal.addEventListener("abort",aborted,{once:true});unsubscribers.push(()=>signal.removeEventListener("abort",aborted));
  requireCurrent();canvas=global.document.createElement("canvas");canvas.setAttribute("aria-label","2.5D 戰鬥視覺；正式數值由文字 HUD 顯示");canvas.style.cssText="width:100%;height:100%;display:block";
  engine=new B.Engine(canvas,true,{preserveDrawingBuffer:false,stencil:true});scene=new B.Scene(engine);
  scene.useRightHandedSystem=true;scene.clearColor=new B.Color4(.025,.04,.065,1);
  const camera=new B.FreeCamera("formal-b-camera",new B.Vector3(5,4,-7),scene);camera.setTarget(new B.Vector3(0,1,0));camera.mode=B.Camera.ORTHOGRAPHIC_CAMERA;scene.activeCamera=camera;
  function resize(){if(!current())return;const ratio=Math.max(.5,host.clientWidth/Math.max(1,host.clientHeight));camera.orthoLeft=-3*ratio;camera.orthoRight=3*ratio;camera.orthoTop=3;camera.orthoBottom=-3;engine.resize();}
  const light=new B.HemisphericLight("formal-b-fill",new B.Vector3(0,1,0),scene);light.intensity=.75;
  const key=new B.DirectionalLight("formal-b-key",new B.Vector3(-1,-2,1),scene);key.position=new B.Vector3(4,8,-4);key.intensity=1.1;
  const ground=B.MeshBuilder.CreateGround("formal-b-ground",{width:14,height:10},scene),groundMat=new B.StandardMaterial("formal-b-ground-material",scene);groundMat.diffuseColor=new B.Color3(.09,.12,.17);ground.material=groundMat;ground.receiveShadows=true;
  const shadows=new B.ShadowGenerator(512,key);shadows.useBlurExponentialShadowMap=true;
  async function load(bytes,name){
   const box=await B.SceneLoader.LoadAssetContainerAsync("",new global.File([bytes],name,{type:"model/gltf-binary"}),scene,undefined,".glb");
   if(!current()){box.dispose();requireCurrent();}boxes.push(box);box.addAllToScene();for(const g of box.animationGroups)g.stop();return box;
  }
  const body=await load(bundle.body,"formal-player.glb"),skin=body.skeletons[0];
  if(!skin||skin.bones.length!==53)throw Error("invalid-player-rig");
  const pivot=new B.TransformNode("formal-player-position",scene);pivot.position.x=-1.6;
  for(const n of body.rootNodes)n.parent=pivot;
  let animationSource=body;
  if(bundle.animation){
   const source=await load(bundle.animation,"formal-approved-animation.glb"),sourceSkin=source.skeletons[0];
   if(!sourceSkin||sourceSkin.bones.length!==53||sourceSkin.bones.some((b,i)=>b.name!==skin.bones[i].name||!b.getBindPose().m.every((v,j)=>Math.abs(v-skin.bones[i].getBindPose().m[j])<1e-5)))throw Error("incompatible-animation-rig");
   const targets=[...body.transformNodes,...body.meshes];
   // Retarget animation data only; never replace the registered body or its topology.
   for(const g of source.animationGroups){const name=g.name;g.clone("formal-retarget-"+name,target=>{const hits=targets.filter(n=>n.name===target.name);if(hits.length!==1)throw Error("ambiguous-animation-target");return hits[0];});}
   animationSource={animationGroups:scene.animationGroups.filter(g=>g.name.startsWith("formal-retarget-"))};
   source.dispose();boxes.splice(boxes.indexOf(source),1);
  }
  const groups=new Map();for(const clip of clips){const g=animationSource.animationGroups.find(x=>x.name===(bundle.animation?"formal-retarget-B2_":"B2_")+clip);if(!g||g.from>2||g.to<44||g.targetedAnimations.length<6||g.targetedAnimations.some(x=>x.animation.framePerSecond!==60))throw Error("unavailable-player-clip:"+clip);groups.set(clip,g);}
  for(const item of bundle.gear){
   const gear=await load(item.bytes,item.asset.id+".glb");
   if(item.row.mount==="skinned"){
    const s=gear.skeletons[0];if(!s||s.bones.length!==53||s.bones.some((b,i)=>b.name!==skin.bones[i].name||!b.getBindPose().m.every((v,j)=>Math.abs(v-skin.bones[i].getBindPose().m[j])<1e-5)))throw Error("incompatible-equipment-rig");
    for(const n of gear.rootNodes)n.parent=pivot;for(const m of gear.meshes)if(m.getTotalVertices()>0)m.skeleton=skin;
   }else{
    const socket=body.transformNodes.find(n=>n.name===bundle.registry.slots[item.asset.slot]);if(!socket)throw Error("missing-equipment-socket");
    for(const n of gear.rootNodes){n.parent=socket;n.position.set(0,0,0);n.scaling.set(1,1,1);n.rotationQuaternion=B.Quaternion.Identity();}
   }
  }
  const hidden=new Set(bundle.gear.flatMap(x=>x.row.hideRegions||[]));
  if(hidden.size){
   const coverage=bundle.registry.occlusion?.[bundle.tier];if(!coverage||coverage.characterSHA256!==bundle.bodySHA256)throw Error("unverified-covered-regions");
   for(const row of coverage.meshes){const mesh=body.meshes.find(m=>m.material?.name===row.material&&m.getTotalVertices()===row.vertices&&m.getTotalIndices()===row.indexCount);if(!mesh)throw Error("covered-region-mesh-mismatch");const indices=Array.from(mesh.getIndices()),excluded=new Set();for(const region of hidden)for(const [offset,count] of row.regions[region]||[])for(let i=offset;i<offset+count;i+=3)excluded.add(i);const visible=[];for(let i=0;i<indices.length;i+=3)if(!excluded.has(i))visible.push(indices[i],indices[i+1],indices[i+2]);mesh.setIndices(visible,null,false);mesh.refreshBoundingInfo();}
  }
  for(const box of boxes)for(const mesh of box.meshes)if(mesh.getTotalVertices()>0)shadows.addShadowCaster(mesh);
  for(const clip of clips){
   const imageURL=global.URL.createObjectURL(new global.Blob([bundle.images[clip]],{type:"image/png"}));urls.push(imageURL);
   textures[clip]=await new Promise((resolve,reject)=>{let timeout;const cancelled=()=>finish(Error("atlas-aborted"));function finish(error,value){clearTimeout(timeout);signal.removeEventListener("abort",cancelled);error?reject(error):resolve(value);}signal.addEventListener("abort",cancelled,{once:true});timeout=setTimeout(()=>finish(Error("atlas-timeout")),15000);const t=new B.Texture(imageURL,scene,false,false,B.Texture.BILINEAR_SAMPLINGMODE,()=>finish(null,t),()=>finish(Error("atlas-decode")));});requireCurrent();
   const t=textures[clip],size=t.getSize(),row=bundle.layout.clips[clip];if(size.width!==row.dimensions[0]||size.height!==row.dimensions[1])throw Error("atlas-dimensions");
   t.hasAlpha=true;t.wrapU=t.wrapV=B.Texture.CLAMP_ADDRESSMODE;
  }
  texture=textures.idle;
  const enemy=B.MeshBuilder.CreatePlane("formal-enemy-atlas",{width:3,height:3},scene);enemy.position.set(1.6,1.5,0);enemy.billboardMode=B.Mesh.BILLBOARDMODE_ALL;
  const material=new B.StandardMaterial("formal-enemy-material",scene);material.diffuseTexture=texture;material.emissiveColor=B.Color3.White();material.disableLighting=true;material.backFaceCulling=false;material.useAlphaFromDiffuseTexture=true;enemy.material=material;
  const onLost=()=>{options.onFallback?.("context-lost");dispose();};canvas.addEventListener("webglcontextlost",onLost);unsubscribers.push(()=>canvas.removeEventListener("webglcontextlost",onLost));
  const abort=()=>dispose();signal.addEventListener("abort",abort,{once:true});unsubscribers.push(()=>signal.removeEventListener("abort",abort));
  global.addEventListener("resize",resize);unsubscribers.push(()=>global.removeEventListener("resize",resize));
  await new Promise((resolve,reject)=>{let timer;const cancelled=()=>finish(Error("shader-readiness-aborted"));function finish(error){clearTimeout(timer);signal.removeEventListener("abort",cancelled);error?reject(error):resolve();}signal.addEventListener("abort",cancelled,{once:true});timer=setTimeout(()=>finish(Error("shader-readiness-timeout")),30000);scene.whenReadyAsync().then(()=>finish(),finish);});
  requireCurrent();host.appendChild(canvas);resize();
  function sample(frame){
   if(!current())return false;
   // elapsedMs comes from the presentation owner. Never run an independent combat timer/RAF.
   const p=frame.player||frame,e=frame.enemy||frame;
   if([p,e].some(x=>!clips.includes(x.clip)||!Number.isFinite(x.elapsedMs)||x.elapsedMs<0))return false;
   const fraction=Math.min(1,p.elapsedMs/700),g=groups.get(p.clip);
   if(g!==group){group?.stop();g.start(false,1);g.pause();group=g;activeClip=p.clip;}
   g.goToFrame((1/30+fraction*.7)*60);
   const row=bundle.layout.clips[e.clip],cell=row.frames[Math.round(Math.min(1,e.elapsedMs/700)*21)],r=cell.rect;
   texture=textures[e.clip];material.diffuseTexture=texture;
   texture.uScale=r[2]/row.dimensions[0];texture.vScale=r[3]/row.dimensions[1];texture.uOffset=r[0]/row.dimensions[0];texture.vOffset=1-(r[1]+r[3])/row.dimensions[1];
   enemy.scaling.set(r[2]/256,r[3]/256,1);
   const pivot=cell.pivot;if(Array.isArray(pivot)&&pivot.length===2){enemy.position.y=(pivot[1]-r[3]/2)*3/256;enemy.position.x=1.6+(r[2]/2-pivot[0])*3/256;}
   scene.render();return true;
  }
  return Object.freeze({sample,dispose,snapshot:()=>Object.freeze({closed,activeClip,engines:closed?0:1,canCommit:false,canEmitCombatEvents:false})});
 }catch(error){dispose();throw error;}
}
global.CivilizationFormalBRenderer=Object.freeze({version:1,prepare,create,rendererReleased:false,fixtureAllowed:false});
})(window);
