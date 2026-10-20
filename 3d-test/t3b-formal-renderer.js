/* Formal B renderer. No battle clock, state writes, rewards, audio or event producer. */
(function(global){
"use strict";
if(global.CivilizationFormalBRenderer)return;
const verified=new WeakMap(),clips=["idle","attack","hit","dodge","return","defeat"];
const hex=b=>Array.from(new Uint8Array(b),x=>x.toString(16).padStart(2,"0")).join("");
async function prepare(options){
 if(options.wholeSuit===true)return prepareSuit(options);
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
 const atlas=catalog.entries.find(x=>x.id===enemy.asset.id&&x.world===identity.world&&x.kind===identity.kind&&x.location===identity.location&&x.tier===tier);
 const layout=atlas.layout;
 if(!layout||layout.durationMs!==700||layout.samples!==22||layout.clipStart!==1/30||clips.some(c=>{const row=layout.clips?.[c];return !row||!Array.isArray(row.frames)||row.frames.length!==22||!Array.isArray(row.dimensions)||row.dimensions.length!==2||row.dimensions.some(n=>!Number.isSafeInteger(n)||n<=0)||(row.sourceFrameDimensions!==undefined&&(!Array.isArray(row.sourceFrameDimensions)||row.sourceFrameDimensions.length!==2||row.sourceFrameDimensions.some(n=>!Number.isSafeInteger(n)||n<=0)))||row.frames.some(f=>!Array.isArray(f.rect)||f.rect.length!==4||f.rect.some(n=>!Number.isSafeInteger(n)||n<0)||f.rect[2]<=0||f.rect[3]<=0||f.rect[0]+f.rect[2]>row.dimensions[0]||f.rect[1]+f.rect[3]>row.dimensions[1]||(f.pivot!==undefined&&(!Array.isArray(f.pivot)||f.pivot.length!==2||f.pivot.some(n=>!Number.isFinite(n))))||(f.masterPivot!==undefined&&(!Array.isArray(f.masterPivot)||f.masterPivot.length!==2||f.masterPivot.some(n=>!Number.isFinite(n))))||(f.masterTrim!==undefined&&(!Array.isArray(f.masterTrim)||f.masterTrim.length!==4||f.masterTrim.some(n=>!Number.isSafeInteger(n)||n<0)||f.masterTrim[2]<=0||f.masterTrim[3]<=0||!row.sourceFrameDimensions||f.masterTrim[0]+f.masterTrim[2]>row.sourceFrameDimensions[0]||f.masterTrim[1]+f.masterTrim[3]>row.sourceFrameDimensions[1])))}))throw Error("invalid-atlas-timing");
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
 verified.set(token,{bodyName:player.asset.path.split("/").pop(),animationName:options.animation?.path.split("/").pop(),bodySHA256:player.asset.sha256,body,animation,images,gear,layout:JSON.parse(JSON.stringify(layout)),registry:JSON.parse(JSON.stringify(registry)),identity:{...identity,visualAssetId:enemy.asset.id},tier,signal});return token;
}
async function create(options){
 const {host,signal,isCurrent}=options,bundle=verified.get(options.bundle);
 if(!bundle||bundle.signal!==signal||typeof isCurrent!=="function"||!host)throw Error("unverified-renderer-input");
 if(bundle.kind==="whole-suit")return createSuit(options,bundle);
 const B=global.BABYLON;if(!B?.SceneLoader)throw Error("webgl-unavailable");
 // Babylon Geometry.RandomId delegates to Tools.RandomId. Runtime IDs must not consume game RNG.
 if(!global.crypto?.getRandomValues||!B.Tools)throw Error("unavailable-isolated-runtime-id-source");
 B.Tools.RandomId=()=>global.crypto.randomUUID?.()||Array.from(global.crypto.getRandomValues(new Uint8Array(16)),x=>x.toString(16).padStart(2,"0")).join("");
 let closed=false,engine,scene,canvas,texture,group=null,activeClip=null;
 const boxes=[],urls=[],unsubscribers=[],textures={};
 const current=()=>!closed&&!signal.aborted&&isCurrent();
 function dispose(){
  if(closed)return;closed=true;
  for(const off of unsubscribers)off();for(const box of boxes)box.dispose();
  const gl=engine?._gl;scene?.dispose();engine?.dispose();gl?.getExtension("WEBGL_lose_context")?.loseContext();for(const url of urls)global.URL.revokeObjectURL(url);
  canvas?.remove();
 }
 function requireCurrent(){if(!current())throw Error("stale-formal-renderer");}
 try{
  const aborted=()=>dispose();signal.addEventListener("abort",aborted,{once:true});unsubscribers.push(()=>signal.removeEventListener("abort",aborted));
  requireCurrent();canvas=global.document.createElement("canvas");canvas.setAttribute("aria-label","2.5D 戰鬥視覺；正式數值由文字 HUD 顯示");canvas.style.cssText="width:100%;height:100%;display:block";
  engine=new B.Engine(canvas,true,{preserveDrawingBuffer:false,stencil:true});scene=new B.Scene(engine);
  scene.useRightHandedSystem=true;scene.clearColor=new B.Color4(.025,.04,.065,1);
  const camera=new B.FreeCamera("formal-b-camera",new B.Vector3(5.5403228,3.5131905,7.9124012),scene);camera.setTarget(new B.Vector3(0,1,0));camera.mode=B.Camera.ORTHOGRAPHIC_CAMERA;scene.activeCamera=camera;
  function resize(){if(!current())return;const ratio=Math.max(.5,host.clientWidth/Math.max(1,host.clientHeight));camera.orthoLeft=-3*ratio;camera.orthoRight=3*ratio;camera.orthoTop=3;camera.orthoBottom=-3;engine.resize();}
  const light=new B.HemisphericLight("formal-b-fill",new B.Vector3(0,1,0),scene);light.intensity=.75;
  const key=new B.DirectionalLight("formal-b-key",new B.Vector3(-1,-2,1),scene);key.position=new B.Vector3(4,8,-4);key.intensity=1.1;
  const ground=B.MeshBuilder.CreateGround("formal-b-ground",{width:14,height:10},scene),groundMat=new B.StandardMaterial("formal-b-ground-material",scene);groundMat.diffuseColor=new B.Color3(.09,.12,.17);ground.material=groundMat;ground.receiveShadows=true;
  const shadows=new B.ShadowGenerator(512,key);shadows.useBlurExponentialShadowMap=true;
  async function load(bytes,name){
   const box=await B.SceneLoader.LoadAssetContainerAsync("",new global.File([bytes],name,{type:"model/gltf-binary"}),scene,undefined,".glb");
   if(!current()){box.dispose();requireCurrent();}boxes.push(box);box.addAllToScene();for(const g of box.animationGroups)g.stop();return box;
  }
  const body=await load(bundle.body,bundle.bodyName),skin=body.skeletons[0];
  if(!skin||skin.bones.length!==53)throw Error("invalid-player-rig");
  const pivot=new B.TransformNode("formal-player-position",scene);pivot.position.x=-1.6;
  for(const n of body.rootNodes)n.parent=pivot;
  let animationSource=body;
  if(bundle.animation){
   const source=await load(bundle.animation,bundle.animationName),sourceSkin=source.skeletons[0];
   if(!sourceSkin||sourceSkin.bones.length!==53||sourceSkin.bones.some((b,i)=>b.name!==skin.bones[i].name||!b.getBindPose().m.every((v,j)=>Math.abs(v-skin.bones[i].getBindPose().m[j])<1e-5)))throw Error("incompatible-animation-rig");
   const targets=[...body.transformNodes,...body.meshes];
   // Retarget animation data only; never replace the registered body or its topology.
   for(const g of source.animationGroups){const name=g.name;g.clone("formal-retarget-"+name,target=>{const hits=targets.filter(n=>n.name===target.name);if(hits.length!==1)throw Error("ambiguous-animation-target");return hits[0];});}
   animationSource={animationGroups:scene.animationGroups.filter(g=>g.name.startsWith("formal-retarget-"))};
   source.dispose();boxes.splice(boxes.indexOf(source),1);
  }
  const groups=new Map();for(const clip of clips){const g=animationSource.animationGroups.find(x=>x.name===(bundle.animation?"formal-retarget-B2_":"B2_")+clip);if(!g||g.from>2||g.to<44||g.targetedAnimations.length<6||g.targetedAnimations.some(x=>x.animation.framePerSecond!==60))throw Error("unavailable-player-clip:"+clip);const moving=new Set(g.targetedAnimations.filter(x=>{const keys=x.animation.getKeys(),first=keys[0]?.value?.asArray?.();return first&&keys.some(k=>k.value?.asArray?.().some((v,i)=>Math.abs(v-first[i])>1e-5));}).map(x=>x.target.name));if(moving.size<3)throw Error("non-articulated-player-clip:"+clip);groups.set(clip,g);}
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
   textures[clip]=await new Promise((resolve,reject)=>{let timeout;const cancelled=()=>finish(Error("atlas-aborted"));function finish(error,value){clearTimeout(timeout);signal.removeEventListener("abort",cancelled);error?reject(error):resolve(value);}signal.addEventListener("abort",cancelled,{once:true});timeout=setTimeout(()=>finish(Error("atlas-timeout")),15000);const t=new B.Texture(imageURL,scene,true,true,B.Texture.BILINEAR_SAMPLINGMODE,()=>finish(null,t),()=>finish(Error("atlas-decode")));});requireCurrent();
   const t=textures[clip],size=t.getSize(),row=bundle.layout.clips[clip];if(size.width!==row.dimensions[0]||size.height!==row.dimensions[1])throw Error("atlas-dimensions");
   t.hasAlpha=true;t.wrapU=t.wrapV=B.Texture.CLAMP_ADDRESSMODE;
  }
  texture=textures.idle;
  const enemy=B.MeshBuilder.CreatePlane("formal-enemy-atlas",{width:3,height:3},scene);enemy.position.set(1.6,1.5,0);enemy.billboardMode=B.Mesh.BILLBOARDMODE_ALL;
  const material=new B.StandardMaterial("formal-enemy-material",scene);material.diffuseTexture=texture;material.emissiveColor=B.Color3.White();material.disableLighting=true;material.backFaceCulling=false;material.useAlphaFromDiffuseTexture=true;enemy.material=material;
  const contact=B.MeshBuilder.CreateDisc("formal-enemy-contact",{radius:.55,tessellation:32},scene);contact.rotation.x=Math.PI/2;contact.position.set(1.6,.01,0);
  const contactMat=new B.StandardMaterial("formal-enemy-contact-material",scene);contactMat.diffuseColor=B.Color3.Black();contactMat.disableLighting=true;contactMat.alpha=.24;contact.material=contactMat;
  const effect=B.MeshBuilder.CreateTorus("formal-known-impact",{diameter:.7,thickness:.045,tessellation:24},scene);effect.position.y=1.1;effect.isVisible=false;
  const effectMat=new B.StandardMaterial("formal-known-impact-material",scene);effectMat.disableLighting=true;effect.material=effectMat;
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
   const move=x=>Number.isFinite(x)&&x>=0&&x<=.42?x:0;pivot.position.x=-1.6+move(p.approach);contact.position.x=1.6-move(e.approach);
   const row=bundle.layout.clips[e.clip],cell=row.frames[Math.round(Math.min(1,e.elapsedMs/700)*21)],r=cell.rect;
   texture=textures[e.clip];material.diffuseTexture=texture;
   texture.uScale=r[2]/row.dimensions[0];texture.vScale=r[3]/row.dimensions[1];texture.uOffset=r[0]/row.dimensions[0];texture.vOffset=1-(r[1]+r[3])/row.dimensions[1];
   const source=row.sourceFrameDimensions||[256,256],extent=cell.masterTrim?cell.masterTrim.slice(2):r.slice(2);enemy.scaling.set(extent[0]/source[0],extent[1]/source[1],1);
   const atlasPivot=cell.masterPivot||cell.pivot;if(Array.isArray(atlasPivot)&&atlasPivot.length===2){enemy.position.y=(atlasPivot[1]-extent[1]/2)*3/source[1];enemy.position.x=1.6-move(e.approach)+(extent[0]/2-atlasPivot[0])*3/source[0];}
   const cue=frame.cue;effect.isVisible=!!cue&&["impact","crit","combo","counter","drain"].includes(cue.type)&&Number.isFinite(cue.ageMs)&&cue.ageMs>=0&&cue.ageMs<160;
   if(effect.isVisible){const role=cue.type==="drain"?cue.actor:cue.target||cue.actor;effect.position.x=role==="player"?pivot.position.x:contact.position.x;effectMat.emissiveColor=cue.type==="drain"?new B.Color3(.25,1,.55):cue.type==="crit"?new B.Color3(1,.75,.2):new B.Color3(.45,.8,1);effectMat.alpha=1-cue.ageMs/160;const scale=1+cue.ageMs/160;effect.scaling.set(scale,scale,scale);}
   scene.render();return true;
  }
  return Object.freeze({sample,resize,dispose,snapshot:()=>Object.freeze({closed,activeClip,engines:closed?0:1,canCommit:false,canEmitCombatEvents:false})});
 }catch(error){dispose();throw error;}
}
async function prepareSuit(options){
 const {release}=await import('./era-player-sprites.mjs?v=20261019-batch12-rising-cut1');
 if(release.schema!=="cw.era-player-sprites.v1")throw Error("unapproved-formal-sprites");
 const identity=['galaxy','universe','higher'].includes(options.eraVisualId)?{ready:true,visualId:options.eraVisualId}:global.CivilizationEraAppearanceContract?.resolve({world:options.world??options.appearance?.world});
 const entry=release.entries.find(e=>e.id==='era-'+identity?.visualId);
 if(!identity?.ready||!entry||entry.formalBattleAllowed!==true)throw Error("unavailable-formal-armor");
 options.signal.throwIfAborted();
 const token=Object.freeze({kind:"whole-suit",id:entry.id});
 verified.set(token,{kind:"whole-suit",entry,signal:options.signal,enemyKind:options.identity?.kind||null,enemyName:options.identity?.name||null,enemyId:options.identity?.id||null,enemyMode:options.identity?.mode||null,enemyWorld:options.identity?.world||null,enemyLocation:options.identity?.location||null});return token;
}
let spriteRuntime=null,spritePool=null,spriteMonsterPool=null,warming=null,warmController=null,warmTimer=null,warmIdle=null;
const runtime=()=>spriteRuntime ||=(Promise.all([import('./equipment-sprites-v1/actor.mjs?v=20261019-batch12-rising-cut1'),import('./equipment-sprites-v1/assets.mjs?v=20261019-batch12-rising-cut1')]).catch(error=>{spriteRuntime=null;throw error;}));
const warmAllowed=()=>!global.document?.querySelector?.('#main .combat-screen')&&!global.document?.hidden&&!global.navigator?.connection?.saveData&&global.CivilizationPresentationMode?.combatAnimationEnabled?.()!==false&&!global.document?.body?.classList.contains('main-minimal-mode-open')&&global.gmBackgroundBattleEnabled?.()!==true;
function cancelWarmup(){
 clearTimeout(warmTimer);if(warmIdle!==null)global.cancelIdleCallback?.(warmIdle);warmIdle=null;
 warmController?.abort();
}
function clearSpriteCache(){cancelWarmup();spritePool?.clear();spriteMonsterPool?.clear();}
function warmIdentity(){
 const phase=Number(global.currentWorldPhase?.());
 return global.CivilizationEraAppearanceContract?.resolve({world:phase});
}
function warmSprites(){
 if(warming)return warming;
 if(!warmAllowed())return Promise.resolve(false);
 const identity=warmIdentity();if(!identity?.ready)return Promise.resolve(false);
 const ac=new AbortController();warmController=ac;
 const abort=()=>{if(!warmAllowed())ac.abort();};
 global.document?.addEventListener('visibilitychange',abort);
 warming=(async()=>{
  const [{release},[,poolModule]]=await Promise.all([import('./era-player-sprites.mjs?v=20261019-batch12-rising-cut1'),runtime()]);
  if(ac.signal.aborted||!warmAllowed()||warmIdentity()?.visualId!==identity.visualId)return false;
  const entry=release.entries.find(e=>e.id==='era-'+identity.visualId);if(!entry)return false;
  spritePool ||= poolModule.createSpritePool({usage:'formal'});
  // Same content-addressed pool as live actors. At most two 512-square bitmaps
  // (2 MiB decoded) for this appearance, never an actor, canvas, RAF or GPU engine.
  for(const layer of [null,'body']){
   if(ac.signal.aborted||!warmAllowed()||warmIdentity()?.visualId!==identity.visualId)return false;
   const lease=await spritePool.acquire(entry,{signal:ac.signal,layer});lease.release();
  }
  return true;
 })().catch(()=>false).finally(()=>{global.document?.removeEventListener('visibilitychange',abort);if(warmController===ac)warmController=null;warming=null;});
 return warming;
}
function scheduleWarm(attempt=0){
 clearTimeout(warmTimer);if(warmIdle!==null)global.cancelIdleCallback?.(warmIdle);
 const run=()=>{warmIdle=null;if(!warmAllowed())return;
  if(global.CivilizationStartupCoordinator?.snapshot?.().status!=='ready'){if(attempt<30)warmTimer=setTimeout(()=>scheduleWarm(attempt+1),1000);return;}
  void warmSprites();
 };
 if(typeof global.requestIdleCallback==='function')warmIdle=global.requestIdleCallback(run,{timeout:5000});
 else warmTimer=setTimeout(run,1800);
}
global.document?.addEventListener('visibilitychange',()=>{if(global.document.hidden)clearSpriteCache();else scheduleWarm();});
for(const event of ['civilization-auth-signed-out','pagehide'])global.addEventListener?.(event,clearSpriteCache);
global.addEventListener?.('civilization-auth-ready',()=>{clearSpriteCache();scheduleWarm();});
global.addEventListener?.('civilization-era-appearance-change',()=>{cancelWarmup();scheduleWarm();});
global.addEventListener?.('civilization-combat-animation-change',()=>{clearSpriteCache();if(warmAllowed())scheduleWarm();});
if(global.document?.readyState==='loading')global.document.addEventListener('DOMContentLoaded',()=>scheduleWarm(),{once:true});
else scheduleWarm();

async function createSuit(options,bundle){
 const {signal,host,isCurrent}=options;
 const [{WholeSuitActor},{createSpritePool}]=await runtime();
 signal.throwIfAborted();if(!isCurrent())throw Error("stale-formal-suit");
 spritePool ||= createSpritePool({usage:'formal'});
 const timeout=new AbortController(),cancel=()=>timeout.abort();signal.addEventListener('abort',cancel,{once:true});
 const timer=setTimeout(cancel,5000);let actor;
 try{actor=await new WholeSuitActor(spritePool,bundle.entry,{signal:timeout.signal,tier:'medium'}).init();}
 catch(error){
  if(!/^sprite-(?:bytes|sha|decode)$/.test(String(error?.message||''))||timeout.signal.aborted||signal.aborted){clearTimeout(timer);signal.removeEventListener('abort',cancel);throw error;}
  try{
   // Refresh only the approved suit's assets, then initialize once more.
   for(const asset of [bundle.entry.asset,bundle.entry.weaponAnimation?.body].filter(Boolean)){
    const response=await fetch(asset.path+'?asset='+asset.sha256.slice(0,24)+'&sprite-repair=1',{signal:timeout.signal,cache:'reload'});
    if(!response.ok)throw Error('sprite-repair-http:'+response.status);
    await response.arrayBuffer();
   }
   spritePool?.clear();
   actor=await new WholeSuitActor(spritePool,bundle.entry,{signal:timeout.signal,tier:'medium'}).init();
  }catch(repairError){clearTimeout(timer);signal.removeEventListener('abort',cancel);throw repairError;}
 }
 clearTimeout(timer);
 let closed=false,activeClip='idle',lastActorRenderKey=null,lastActorShift=null;
 let monsterActor=null,monsterAttempt=0,monsterMapping=null,monsterReady=false,monsterLastKey=null,monsterError='';
 let lastEnemyFrame=null;
 let monsterPoolPromise=null;
 const loadMonsterPool=()=>monsterPoolPromise||=(import('./monster-sprite-pool.mjs?v=20261021-batch14-formal1').then(({createMonsterPool})=>{spriteMonsterPool ||= createMonsterPool({usage:'formal'});return spriteMonsterPool;}));
 // Monster optional: keep the existing known-good silhouette until verified sprite is ready.
 async function activateMonster(){
  if(monsterAttempt||closed||signal.aborted||!isCurrent()||bundle.enemyMode!=='main'||![1,2].includes(bundle.enemyWorld))return;
  monsterAttempt=1;
  try{
   const [{resolveFormalMonster},{MonsterActor}]=await Promise.all([
    import('./monster-formal-resolver.mjs?v=20261021-batch14-formal1'),
    import('./monster-actor.mjs?v=20261021-batch14-formal1')
   ]);
   if(closed||signal.aborted||!isCurrent())return;
   const approved=resolveFormalMonster({mode:bundle.enemyMode,world:bundle.enemyWorld,kind:bundle.enemyKind,name:bundle.enemyName,location:bundle.enemyLocation,id:bundle.enemyId});
   if(!approved)return;
   monsterMapping=approved.mapping;
   const pool=await loadMonsterPool();
   if(closed||signal.aborted||!isCurrent())return;
   const actor=await new MonsterActor(pool,approved.asset.assetId,{signal,identity:approved.mapping.id,usage:'formal',tier:'medium'}).init();
   if(closed||signal.aborted||!isCurrent()){actor.dispose();return;}
   monsterActor=actor;actor.canvas.className='formal-b-enemy-sprite formal-b-verified-monster';
   actor.canvas.style.position='absolute';actor.canvas.style.maxWidth='none';actor.canvas.style.right='auto';
   host.append(actor.canvas);monsterReady=true;enemyCanvas.style.visibility='hidden';
   const w=host.clientWidth,h=host.clientHeight;const mobile=global.matchMedia('(max-width:760px)').matches;const size=Math.min(h*(mobile?.82:.87),w*(mobile?.47:.44));
   actor.canvas.style.width=size+'px';actor.canvas.style.height=size+'px';
   actor.canvas.style.left=(w/2-size*.18+.42*140/2)+'px';
   if(lastEnemyFrame)drawMonster(lastEnemyFrame);
  }catch(error){monsterError=String(error?.message||error);if(monsterActor){monsterActor.dispose();monsterActor=null;}monsterReady=false;enemyCanvas.style.visibility='';}
  finally{}
 }
 function drawMonster(frame){
  if(!monsterActor||!monsterReady)return;
  const e=frame.enemy||frame,elapsed=Number.isFinite(e.elapsedMs)?Math.max(0,e.elapsedMs):0;
  const clip=e.clip==='return'?'idle':e.clip==='dodge'?'hit':e.clip||'idle';
  const tick=Math.floor(elapsed/(clip==='idle'?50:35)),key=clip+':'+tick;
  if(key!==monsterLastKey){try{monsterActor.draw({clip,elapsedMs:tick*(clip==='idle'?50:35),palette:monsterMapping.visual.palette});monsterLastKey=key;}catch(error){monsterError=String(error?.message||error);monsterReady=false;monsterActor.dispose();monsterActor=null;enemyCanvas.style.visibility='';return;}}
  const shift=Number.isFinite(e.approach)?Math.min(.42,Math.max(0,e.approach))*140:0;
  monsterActor.canvas.style.transform='translateX('+(-shift)+'px)';
 }
 const dispose=()=>{if(closed)return;closed=true;signal.removeEventListener('abort',cancel);signal.removeEventListener('abort',dispose);actor.canvas.remove();monsterActor?.dispose();monsterActor=null;host.querySelectorAll('.formal-b-enemy-sprite').forEach(node=>node.remove());actor.dispose();};
 signal.addEventListener('abort',dispose,{once:true});
 if(signal.aborted||!isCurrent()){dispose();throw Error("stale-formal-suit");}
 actor.canvas.className='formal-b-whole-suit formal-b-player-sprite';actor.canvas.dataset.suit=bundle.entry.id;
 actor.canvas.setAttribute('aria-label',bundle.entry.id.toUpperCase()+' 戰鬥角色');host.append(actor.canvas);
 // Lightweight shared opponent, driven by the exact same formal owner sample.
 // Its silhouette is a visual fallback, not an invented monster identity or gameplay state.
 const enemyCanvas=global.document.createElement('canvas');
 enemyCanvas.className='formal-b-enemy-sprite';
 enemyCanvas.width=enemyCanvas.height=256;
 enemyCanvas.setAttribute('role','img');
 enemyCanvas.setAttribute('aria-label',(bundle.enemyName||'敵方')+' 戰鬥動畫（共用替代輪廓）');
 host.append(enemyCanvas);
 const ec=enemyCanvas.getContext('2d');
 if(!ec){enemyCanvas.remove();dispose();throw Error('enemy-canvas-unavailable');}
 const kind=(host.closest('.combat-screen')?.querySelector('.combatant.enemy')?.textContent||'').toLowerCase();
 const enemyKind=String(bundle.enemyKind||'').toLowerCase();
 const rank=/boss|首領|魔王|王者|災厄/.test(enemyKind+' '+kind)?'boss':/elite|菁英|精英/.test(enemyKind+' '+kind)?'elite':'normal';
 host.dataset.enemyRank=rank;
 // Visual docking follows the existing owner approach (max 58.8px). Keep both
 // sprites square and near the shared centre even in a wide, short landscape stage.
 // This changes presentation coordinates only, never event timing or collision rules.
 let layoutKey='';
 function layoutSprites(){
  const w=host.clientWidth,h=host.clientHeight,mobile=global.matchMedia('(max-width:760px)').matches,key=`${w}:${h}:${mobile}`;
  if(key===layoutKey||!w||!h)return;layoutKey=key;
  const size=Math.min(h*(mobile?.82:.87),w*(mobile?.47:.44)),halfApproach=.42*140/2;
  for(const canvas of [actor.canvas,enemyCanvas,monsterActor?.canvas].filter(Boolean)){canvas.style.width=size+'px';canvas.style.height=size+'px';canvas.style.maxWidth='none';canvas.style.right='auto';}
  actor.canvas.style.left=(w/2-size*.70-halfApproach)+'px';
  enemyCanvas.style.left=(w/2-size*.18+halfApproach)+'px';if(monsterActor)monsterActor.canvas.style.left=enemyCanvas.style.left;
 }
 layoutSprites();
 let lastEnemyRenderKey=null;
 function drawEnemy(frame){
  lastEnemyFrame=frame;if(monsterReady){drawMonster(frame);return;}
  const e=frame.enemy||frame;
  const ms=Math.max(0,Math.min(700,e.elapsedMs||0)),t=ms/700;
  const approach=Math.max(0,Math.min(.42,e.approach||0));
  // Use a local key instead of mutating data-* attributes on every animation sample.
  const renderKey=`${e.clip||'idle'}:${Math.floor(ms/35)}:${Math.round(approach*1000)}`;
  if(lastEnemyRenderKey===renderKey)return;
  lastEnemyRenderKey=renderKey;
  ec.clearRect(0,0,256,256);ec.save();
  ec.translate(128,222);
  // Opponent faces left, toward the player; effects stay inside its own canvas.
  const offset=e.clip==='dodge'?Math.sin(Math.PI*t)*18:e.clip==='hit'?Math.sin(Math.PI*t)*9:0;
  ec.translate(-offset,0);
  ec.rotate(e.clip==='defeat'?-Math.min(.52,t*.52):e.clip==='hit'?-Math.sin(Math.PI*t)*.14:0);
  const scale=e.clip==='defeat'?1-.26*t:1+((rank==='boss')?.10:rank==='elite'?.05:0);
  ec.scale(scale,scale);
  ec.globalAlpha=e.clip==='defeat'?1-t:1;
  const fill=rank==='boss'?'#9d5167':rank==='elite'?'#7d6eb7':'#697f9e';
  ec.fillStyle=fill;ec.strokeStyle='#d1ddeb';ec.lineWidth=4;
  ec.beginPath();ec.moveTo(-55,-112);ec.lineTo(-83,-75);ec.lineTo(-64,-26);ec.lineTo(-42,-48);ec.lineTo(-35,0);ec.lineTo(-23,0);ec.lineTo(-17,-60);ec.lineTo(19,-60);ec.lineTo(25,0);ec.lineTo(40,0);ec.lineTo(45,-50);ec.lineTo(61,-26);ec.lineTo(82,-83);ec.lineTo(51,-117);ec.closePath();ec.fill();ec.stroke();
  ec.beginPath();ec.moveTo(-43,-112);ec.lineTo(-62,-150);ec.lineTo(-22,-136);ec.lineTo(0,-155);ec.lineTo(23,-136);ec.lineTo(61,-150);ec.lineTo(40,-112);ec.closePath();ec.fill();ec.stroke();
  ec.strokeStyle='#fbe5e8';ec.lineWidth=5;ec.beginPath();ec.moveTo(-26,-120);ec.lineTo(-9,-116);ec.moveTo(12,-116);ec.lineTo(29,-120);ec.stroke();
  if(e.clip==='attack'){ec.strokeStyle='#ffb4c1';ec.lineWidth=7;ec.beginPath();ec.moveTo(-45,-68);ec.lineTo(-70-Math.sin(Math.PI*t)*25,-98);ec.stroke();}
  if(e.clip==='hit'){ec.fillStyle='rgba(255,255,255,'+(Math.sin(Math.PI*t)*.32)+')';ec.fillRect(-85,-157,170,160);}
  ec.restore();
  enemyCanvas.dataset.clip=e.clip||'idle';
  enemyCanvas.style.transform='translateX('+(-approach*140)+'px)';
 }

 function sample(frame){
  if(closed||signal.aborted||!isCurrent())return false;
  layoutSprites();if(!monsterAttempt)void activateMonster();const p=frame.player||frame;activeClip=p.clip;
  const weapon=frame.weaponAttack?.role==='player'&&['attack','return'].includes(p.clip);
  // The official owner still samples every RAF; only duplicate pixels are skipped.
  // Active animation is sampled at 30 FPS and idle at 20 FPS on mobile-sized canvases.
  const elapsed=Number.isFinite(p.elapsedMs)?Math.max(0,p.elapsedMs):0;
  const step=p.clip==='idle'?50:35;
  const actorTick=Math.floor(elapsed/step);
  const attackTick=weapon?Math.floor(Math.max(0,frame.weaponAttack.elapsedMs||0)/35):-1;
  const impactPhase=weapon&&frame.weaponAttack.elapsedMs>=336?1:0;
  const actorKey=`${p.clip}:${actorTick}:${attackTick}:${impactPhase}`;
  if(lastActorRenderKey!==actorKey){
   actor.draw({clip:p.clip,elapsedMs:actorTick*step,attackElapsedMs:weapon?Math.max(0,frame.weaponAttack.elapsedMs||0):undefined,rootMotion:bundle.entry.singleLayer===true&&["hit","dodge"].includes(p.clip)});
   lastActorRenderKey=actorKey;
  }
  const shift=Number.isFinite(p.approach)?Math.min(.42,Math.max(0,p.approach))*140:0;
  const shiftKey=Math.round(shift*10)/10;
  if(lastActorShift!==shiftKey){actor.canvas.style.transform=`translateX(${shiftKey}px)`;lastActorShift=shiftKey;}
  if(actor.canvas.dataset.clip!==p.clip)actor.canvas.dataset.clip=p.clip;
  drawEnemy(frame);return true;
 }
 return Object.freeze({sample,resize:layoutSprites,dispose,snapshot:()=>({closed,activeClip,engines:0,canCommit:false,canEmitCombatEvents:false})});
}
global.CivilizationFormalBRenderer=Object.freeze({version:1,prepare,create,warmSprites,scheduleWarm,clearSpriteCache,spriteStats:()=>spritePool?.stats()||{bytes:0,refs:0,entries:0},monsterStats:()=>spriteMonsterPool?.stats()||{bytes:0,refs:0,entries:0},rendererReleased:false,fixtureAllowed:false});
})(window);
