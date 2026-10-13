'use strict';
// In-memory release approval is confined to this test. Real B2 candidates are NOT formally released.
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const base=process.env.T3B_BASE_URL||'http://127.0.0.1:4173/',root='development/hybrid-comparison/t2b2-v1/';
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const routes={},row=(id,path)=>{const bytes=fs.readFileSync(path),p='assets/test/'+id;routes[p]=path;return{id,path:p,bytes:bytes.length,sha256:sha(bytes),license:'In-memory test only; source license unchanged'};};
const player={...row('player.glb','assets/3d/characters/player-v1/player-low.glb'),type:'character',quality:'low'},animation=row('animation.glb',root+'player/candidate-low.glb');
const atlas=JSON.parse(fs.readFileSync(root+'enemies/normal/atlases/atlas.json'));
const layout={durationMs:700,samples:22,clipStart:1/30,clips:Object.fromEntries(atlas.rows.map(x=>[x.action,{asset:row(x.rgba,root+'enemies/normal/atlases/'+x.rgba),dimensions:x.dimensions,frames:x.frames}]))};
const official=JSON.parse(fs.readFileSync('assets/3d/asset-registry.json')),gear=official.assets.filter(x=>x.type==='equipment'&&x.quality==='low').map(x=>({...x,...row(x.id+'.glb',x.path),type:x.type,slot:x.slot,mount:x.mount,names:x.names,identity:x.identity,hideRegions:x.hideRegions}));
const identity={id:'internal-only-normal',world:1,kind:'normal',location:'test-only'},catalog={schema:'civilization.formal.b.enemy-atlas.v1',publish:true,approved:true,entries:[{...layout.clips.idle.asset,...identity,tier:'low',reviewed:true,layout}]};
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||(fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined),args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const page=await browser.newPage({viewport:{width:900,height:700}}),errors=[];page.on('pageerror',e=>errors.push(String(e)));
  await page.goto(base+'assets/3d/asset-registry.json');await page.evaluate(()=>document.body.innerHTML='<div id="test-host" style="width:800px;height:600px"></div>');
  for(const file of ['vendor/babylonjs/7.54.3/babylon.js','vendor/babylonjs/7.54.3/babylonjs.loaders.min.js','3d-test/t3b-formal-assets.js','3d-test/t3b-formal-renderer.js'])await page.addScriptTag({url:base+file});
  const result=await page.evaluate(async({player,animation,catalog,identity,routes,base,official,gear})=>{
   const saved=JSON.stringify(localStorage),audioCount=document.querySelectorAll('audio').length;
   const abort=new AbortController(),R=CivilizationFormalBRenderer,options={registry:{...official,player:{low:player.id},assets:[player,...gear]},catalog,identity,tier:'low',appearance:{},approval:{player:true,equipment:true,animation:true},animation,signal:abort.signal,fetch:(path,opts)=>fetch(base+routes[path],opts)};
   const bundle=await R.prepare(options);const renderer=await R.create({bundle,host:document.getElementById('test-host'),signal:abort.signal,isCurrent:()=>true});
   const canvas=document.querySelector('#test-host canvas'),hashes=[],jointPoses=[];const pixels=()=>{const c=document.createElement('canvas');c.width=canvas.width;c.height=canvas.height;c.getContext('2d').drawImage(canvas,0,0);return c.toDataURL();};
   for(const clip of ['idle','attack','hit','dodge','return','defeat']){const frames=[];for(const elapsedMs of [0,350,700]){if(!renderer.sample({clip,elapsedMs}))throw Error('Sample rejected');frames.push(pixels());if(clip==='attack'){const scene=BABYLON.EngineStore.Instances.at(-1).scenes[0],mesh=scene.meshes.find(m=>m.skeleton&&m.getTotalVertices()>0);mesh.skeleton.prepare();jointPoses.push(Array.from(mesh.skeleton.getTransformMatrices(mesh)));}}hashes.push({clip,frames});}
   const diagnostic=renderer.snapshot();abort.abort();renderer.dispose();const disposed=renderer.snapshot();
   const subsets=[];
   for(let iteration=0;iteration<100;iteration++){
    const mask=iteration<32?iteration:0;
    const controller=new AbortController(),appearance={};
    for(let i=0;i<gear.length;i++)if(mask&(1<<i)){const x=gear[i];appearance[x.slot]={name:x.names[0],...x.identity,level:31};}
    const b=await R.prepare({...options,appearance,signal:controller.signal}),r=await R.create({bundle:b,host:document.getElementById('test-host'),signal:controller.signal,isCurrent:()=>true});
    r.sample({player:{clip:'attack',elapsedMs:350},enemy:{clip:'hit',elapsedMs:350}});
    const scene=BABYLON.EngineStore.Instances.at(-1).scenes[0];const actualCanvas=document.querySelector('#test-host canvas'),copy=document.createElement('canvas');copy.width=actualCanvas.width;copy.height=actualCanvas.height;copy.getContext('2d').drawImage(actualCanvas,0,0);const pixelHash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(copy.toDataURL()))),x=>x.toString(16).padStart(2,'0')).join('');
    subsets.push({iteration,mask,pixelHash,meshCount:scene.meshes.filter(m=>m.getTotalVertices()>0).length,rig:scene.skeletons[0].bones.length});
    controller.abort();r.dispose();if(BABYLON.EngineStore.Instances.length!==0)throw Error('Engine leaked after subset');
   }
   return{hashes,jointPoses,subsets,diagnostic,disposed,remaining:document.querySelectorAll('#test-host canvas').length,saveUnchanged:saved===JSON.stringify(localStorage),audioUnchanged:audioCount===document.querySelectorAll('audio').length};
  },{player,animation,catalog,identity,routes,base,official,gear});
  for(const x of result.hashes){assert.equal(new Set(x.frames.map(sha)).size,3,'Actual animated rendered poses '+x.clip);for(const png of x.frames)assert.ok(png.length>2000,'Nonblank rendered stage');x.frames=x.frames.map(sha);}
  assert.ok(result.jointPoses[0].some((v,i)=>Math.abs(v-result.jointPoses[1][i])>.0001),'Actual player skeleton matrices deform at source samples');
  result.jointPoses=result.jointPoses.map(x=>sha(JSON.stringify(x)));
  assert.equal(result.subsets.length,100);assert.equal(new Set(result.subsets.slice(0,32).map(x=>x.pixelHash)).size,32,'Actual independently visible five-slot subsets');assert.ok(result.subsets.every(x=>x.rig===53));
  assert.equal(result.remaining,0);assert.equal(result.disposed.engines,0);assert.equal(result.saveUnchanged,true);assert.equal(result.audioUnchanged,true);assert.deepEqual(errors,[]);
  fs.writeFileSync('/tmp/t3b-formal-renderer-browser.json',JSON.stringify({passed:true,result,hardware:'Chromium SwiftShader; NOT real GPU/mobile/art approval'},null,2)+'\n');
  console.log('PASS actual formal renderer code, original registered player GLB, compatible retargeted B2 animation and six atlas clips, endpoints/midpoints, 32 visible equipment subsets, 100 actual engine switches/dispose, save/audio unchanged; test-only approval, SwiftShader');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
