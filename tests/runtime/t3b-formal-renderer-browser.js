'use strict';
// In-memory release approval is confined to this test. Real B2 candidates are NOT formally released.
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const base=process.env.T3B_BASE_URL||'http://127.0.0.1:4173/',root='development/hybrid-comparison/t2b2-v1/';
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const routes={},row=(id,path)=>{const bytes=fs.readFileSync(path),p='assets/test/'+id;routes[p]=path;return{id,path:p,bytes:bytes.length,sha256:sha(bytes),license:'In-memory test only; source license unchanged'};};
const player={...row('player.glb','assets/3d/characters/player-v1/player-low.glb'),type:'character',quality:'low'},animation=row('animation.glb',root+'player/candidate-low.glb');
const atlas=JSON.parse(fs.readFileSync(root+'enemies/normal/atlases/atlas.json'));
const layout={durationMs:700,samples:22,clipStart:1/30,clips:Object.fromEntries(atlas.rows.map(x=>[x.action,{asset:row(x.rgba,root+'enemies/normal/atlases/'+x.rgba),dimensions:x.dimensions,sourceFrameDimensions:x.sourceFrameDimensions,frames:x.frames}]))};
const official=JSON.parse(fs.readFileSync('assets/3d/asset-registry.json')),gear=official.assets.filter(x=>x.type==='equipment'&&x.quality==='low').map(x=>({...x,...row(x.id+'.glb',x.path),type:x.type,slot:x.slot,mount:x.mount,names:x.names,identity:x.identity,hideRegions:x.hideRegions}));
const actorTiers=[];
for(const kind of ['normal','elite','boss'])for(const tier of ['low','medium','high']){
 const dir=tier==='high'?root+'enemies/'+kind+'/atlases/':root+'repair-r1/tiers/'+tier+'/'+kind+'/',m=JSON.parse(fs.readFileSync(dir+'atlas.json'));
 const layout={durationMs:700,samples:22,clipStart:1/30,clips:Object.fromEntries(m.rows.map(x=>[x.action,{asset:row(kind+'-'+tier+'-'+x.rgba,dir+x.rgba),dimensions:x.dimensions,sourceFrameDimensions:x.sourceFrameDimensions||[256,256],frames:x.frames}]))};
 const player={...row('body-'+tier+'.glb','assets/3d/characters/player-v1/player-'+tier+'.glb'),type:'character',quality:tier},animation=row('animation-'+tier+'.glb',root+'player/candidate-'+tier+'.glb'),identity={id:'internal-only-'+kind,world:1,kind,location:'test-only-'+kind};
 actorTiers.push({kind,tier,player,animation,identity,catalog:{schema:'civilization.formal.b.enemy-atlas.v1',publish:true,approved:true,entries:[{...layout.clips.idle.asset,...identity,tier,reviewed:true,layout}]}});
}
const identity={id:'internal-only-normal',world:1,kind:'normal',location:'test-only'},catalog={schema:'civilization.formal.b.enemy-atlas.v1',publish:true,approved:true,entries:[{...layout.clips.idle.asset,...identity,tier:'low',reviewed:true,layout}]};
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||(fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined),args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const page=await browser.newPage({viewport:{width:900,height:700}}),errors=[];page.on('pageerror',e=>errors.push(String(e)));
  await page.goto(base+'assets/3d/asset-registry.json');await page.evaluate(()=>document.body.innerHTML='<div id="test-host" style="width:800px;height:600px"></div>');
  for(const file of ['vendor/babylonjs/7.54.3/babylon.js','vendor/babylonjs/7.54.3/babylonjs.loaders.min.js','3d-test/t3b-formal-assets.js','3d-test/t3b-formal-renderer.js','engine.js','combat-events.js','combatmath.js','combatcore.js','combatfx.js','3d-test/t3a-hybrid-policy.js','3d-test/appearance-snapshot.js','3d-test/formal-snapshots.js','3d-test/t3b-formal-projection.js','3d-test/t3b-formal-owner-clock.js','3d-test/t3b-formal-controller.js','3d-test/t3b-formal-entry.js'])await page.addScriptTag({url:base+file});
  const result=await page.evaluate(async({player,animation,catalog,identity,routes,base,official,gear,actorTiers})=>{
   const saved=JSON.stringify(localStorage),audioCount=document.querySelectorAll('audio').length,originalRandom=Math.random;let visualRandomCalls=0;const randomStacks=[];Math.random=()=>{visualRandomCalls++;if(randomStacks.length<5)randomStacks.push(new Error().stack);return originalRandom();};
   const abort=new AbortController(),R=CivilizationFormalBRenderer,options={registry:{...official,player:{low:player.id},assets:[player,...gear]},catalog,identity,tier:'low',appearance:{},approval:{player:true,equipment:true,animation:true},animation,signal:abort.signal,fetch:(path,opts)=>fetch(base+routes[path],opts)};
   const bundle=await R.prepare(options);const renderer=await R.create({bundle,host:document.getElementById('test-host'),signal:abort.signal,isCurrent:()=>true});
   const canvas=document.querySelector('#test-host canvas'),hashes=[],jointPoses=[];const pixels=()=>{const c=document.createElement('canvas');c.width=canvas.width;c.height=canvas.height;c.getContext('2d').drawImage(canvas,0,0);return c.toDataURL();};
   for(const clip of ['idle','attack','hit','dodge','return','defeat']){const frames=[];for(const elapsedMs of [0,350,700]){if(!renderer.sample({clip,elapsedMs}))throw Error('Sample rejected');frames.push(pixels());if(clip==='attack'){const scene=BABYLON.EngineStore.Instances.at(-1).scenes[0],mesh=scene.meshes.find(m=>m.skeleton&&m.getTotalVertices()>0);mesh.skeleton.prepare();jointPoses.push(Array.from(mesh.skeleton.getTransformMatrices(mesh)));}}hashes.push({clip,frames});}
   renderer.sample({clip:'idle',elapsedMs:0});
   const scene=BABYLON.EngineStore.Instances.at(-1).scenes[0],enemy=scene.getMeshByName('formal-enemy-atlas'),bounds=enemy.getBoundingInfo().boundingBox.vectorsWorld.map(v=>BABYLON.Vector3.Project(v,BABYLON.Matrix.Identity(),scene.getTransformMatrix(),new BABYLON.Viewport(0,0,canvas.width,canvas.height)));
   const left=Math.round(Math.min(...bounds.map(v=>v.x))),top=Math.round(Math.min(...bounds.map(v=>v.y))),width=Math.round(Math.max(...bounds.map(v=>v.x))-left),height=Math.round(Math.max(...bounds.map(v=>v.y))-top);
   const expected=document.createElement('canvas'),actual=document.createElement('canvas');expected.width=actual.width=width;expected.height=actual.height=height;
   actual.getContext('2d').drawImage(canvas,left,top,width,height,0,0,width,height);
   const row=catalog.entries[0].layout.clips.idle,cell=row.frames[0],bitmap=await createImageBitmap(new Blob([await (await options.fetch(row.asset.path,{})).arrayBuffer()],{type:'image/png'}));
   expected.getContext('2d').drawImage(bitmap,...cell.rect,0,0,width,height);bitmap.close();
   const a=actual.getContext('2d').getImageData(0,0,width,height).data,e=expected.getContext('2d').getImageData(0,0,width,height).data;let correct=0,flipped=0,count=0;
   for(let y=0;y<height;y++)for(let x=0;x<width;x++){const i=(y*width+x)*4,j=((height-1-y)*width+x)*4;if(e[i+3]<240)continue;for(let c=0;c<3;c++){correct+=(a[i+c]-e[i+c])**2;flipped+=(a[i+c]-e[j+c])**2;count++;}}
   const orientation={correctRMSE:Math.sqrt(correct/count),flippedRMSE:Math.sqrt(flipped/count),samples:count,actualOpaquePixels:Array.from(a).filter((v,i)=>i%4===3&&v>240).length,bounds:{left,top,width,height},expectedPNG:expected.toDataURL(),actualPNG:actual.toDataURL()};
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
   const tierReports=[];
   for(const test of actorTiers){
    const controller=new AbortController(),ctx={...options,registry:{...official,player:{[test.tier]:test.player.id},assets:[test.player]},catalog:test.catalog,identity:test.identity,tier:test.tier,animation:test.animation,signal:controller.signal};
    const b=await R.prepare(ctx),r=await R.create({bundle:b,host:document.getElementById('test-host'),signal:controller.signal,isCurrent:()=>true});
    const clips=[];for(const clip of ['idle','attack','hit','dodge','return','defeat']){const hashes=[];for(const elapsedMs of [0,350,700]){r.sample({clip,elapsedMs});const image=document.createElement('canvas'),c=document.querySelector('#test-host canvas');image.width=c.width;image.height=c.height;image.getContext('2d').drawImage(c,0,0);hashes.push(Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(image.toDataURL()))),x=>x.toString(16).padStart(2,'0')).join(''));}if(new Set(hashes).size!==3)throw Error('Tier/clip static '+test.kind+'/'+test.tier+'/'+clip);clips.push({clip,hashes});}
    tierReports.push({kind:test.kind,tier:test.tier,clips});controller.abort();r.dispose();if(BABYLON.EngineStore.Instances.length)throw Error('Tier engine leaked');
   }
   // Run the actual formal core and its existing structured presentation owner, not a second event player.
   window.state={playerName:'internal-only-owner-test',worldPhase:1,level:35,hp:1000,equipment:{},inventory:[],enhancement:{levels:{}},specializations:{},marks:{entries:{}}};
   state=window.state;window.playerCombatStats=()=>({hp:1000,atk:50,def:20,crit:10,dodge:10});
   const isolatedBefore=JSON.stringify(window.state),ownerHost=document.createElement('main');ownerHost.id='main';ownerHost.style.cssText='width:800px';ownerHost.innerHTML='<section class="combat-screen"><div class="combat-head">internal-only real owner test</div><div class="combat-arena"><div id="combatPlayerCard" class="combatant player"><span id="combatPlayerDamage"></span><span id="combatPlayerHp"></span><div class="bar"><span id="combatPlayerBar"></span></div></div><div id="combatEnemyCard" class="combatant enemy"><span id="combatEnemyDamage"></span><span id="combatEnemyHp"></span><div class="bar"><span id="combatEnemyBar"></span></div></div></div></section>';document.body.appendChild(ownerHost);
   const coordinator=CivilizationFormalBEntry.bindRoutes({quality:'standard',resolve:async()=>({...options,signal:undefined})});
   const result=runCombatCore({hp:1000,atk:50,def:20,crit:10,dodge:10},{id:identity.id,name:'internal-only-owner-test-enemy',kind:'normal',level:31,hp:500,atk:20,def:0,crit:0,dodge:0},1000,{rng:()=>.5,maxActions:8,preparePresentation:true,visualContext:{mode:'main',world:1,owner:'combatcore.js',location:identity.location,playerName:'internal-only-owner-test'}});
   await animateStructuredCombatPresentation(result);
   for(let i=0;i<100;i++)await Promise.resolve();
   const ownerDiagnostic=coordinator.snapshot(),hudValues={player:document.getElementById('combatPlayerHp').textContent,enemy:document.getElementById('combatEnemyHp').textContent};CivilizationFormalBEntry.dispose();
   const unavailable=CivilizationFormalBEntry.bindRoutes({quality:'standard',resolve:async()=>({...options,catalog:{...catalog,approved:false},signal:undefined})});
   const textResult=runCombatCore({hp:1000,atk:50,def:20,crit:10,dodge:10},{id:identity.id,name:'internal-only-owner-test-enemy',kind:'normal',level:31,hp:500,atk:20,def:0,crit:0,dodge:0},1000,{rng:()=>.5,maxActions:8,preparePresentation:true,visualContext:{mode:'main',world:1,owner:'combatcore.js',location:identity.location,playerName:'internal-only-owner-test'}});
   await animateStructuredCombatPresentation(textResult);for(let i=0;i<100;i++)await Promise.resolve();
   const unavailableDiagnostic=unavailable.snapshot(),coreResultsEqual=JSON.stringify(result)===JSON.stringify(textResult);CivilizationFormalBEntry.dispose();
   if(JSON.stringify(window.state)!==isolatedBefore)throw Error('Renderer changed isolated formal State');
   if(BABYLON.EngineStore.Instances.length!==0||document.querySelectorAll('#main .formal-b-battle-stage canvas').length)throw Error('Formal owner integration leaked an engine/canvas');
   Math.random=originalRandom;
   return{orientation,visualRandomCalls,randomStacks,hashes,jointPoses,subsets,tierReports,diagnostic,disposed,ownerDiagnostic,unavailableDiagnostic,coreResultsEqual,hudValues,remaining:document.querySelectorAll('#test-host canvas').length,saveUnchanged:saved===JSON.stringify(localStorage),audioUnchanged:audioCount===document.querySelectorAll('audio').length};
  },{player,animation,catalog,identity,routes,base,official,gear,actorTiers});
  fs.writeFileSync('/tmp/t3-formal-attack-mid.png',Buffer.from(result.hashes.find(x=>x.clip==='attack').frames[1].split(',')[1],'base64'));
  for(const x of result.hashes){assert.equal(new Set(x.frames.map(sha)).size,3,'Actual animated rendered poses '+x.clip);for(const png of x.frames)assert.ok(png.length>2000,'Nonblank rendered stage');x.frames=x.frames.map(sha);}
  assert.ok(result.jointPoses[0].some((v,i)=>Math.abs(v-result.jointPoses[1][i])>.0001),'Actual player skeleton matrices deform at source samples');
  result.jointPoses=result.jointPoses.map(x=>sha(JSON.stringify(x)));
  assert.equal(result.subsets.length,100);assert.equal(new Set(result.subsets.slice(0,32).map(x=>x.pixelHash)).size,32,'Actual independently visible five-slot subsets');assert.ok(result.subsets.every(x=>x.rig===53));
  for(const name of ['expectedPNG','actualPNG'])fs.writeFileSync('/tmp/t3-orientation-'+name+'.png',Buffer.from(result.orientation[name].split(',')[1],'base64'));
  delete result.orientation.expectedPNG;delete result.orientation.actualPNG;
  assert.ok(result.orientation.samples>1000);assert.ok(result.orientation.actualOpaquePixels>1000,"WebGL framebuffer must be captured before an asynchronous yield");assert.ok(result.orientation.correctRMSE<result.orientation.flippedRMSE,'Actual source PNG orientation '+JSON.stringify(result.orientation));
  assert.equal(result.visualRandomCalls,0,'Renderer must not consume the gameplay Math.random sequence: '+JSON.stringify(result.randomStacks));
  assert.match(result.hudValues.player,/\d+ \/ \d+/);assert.match(result.hudValues.enemy,/\d+ \/ \d+/);
  assert.equal(result.coreResultsEqual,true);assert.equal(result.unavailableDiagnostic.frames,0);assert.equal(result.unavailableDiagnostic.engines,0);assert.ok(result.unavailableDiagnostic.fallbacks>0);
  assert.ok(result.ownerDiagnostic.frames>0,JSON.stringify(result.ownerDiagnostic));
  assert.equal(result.tierReports.length,9);assert.ok(result.tierReports.every(x=>x.clips.length===6));
  assert.equal(result.remaining,0);assert.equal(result.disposed.engines,0);assert.equal(result.saveUnchanged,true);assert.equal(result.audioUnchanged,true);assert.deepEqual(errors,[]);
  fs.writeFileSync('/tmp/t3b-formal-renderer-browser.json',JSON.stringify({passed:true,result,hardware:'Chromium SwiftShader; NOT real GPU/mobile/art approval'},null,2)+'\n');
  console.log('PASS actual formal renderer code, original registered player GLB, compatible retargeted B2 animation and six atlas clips, endpoints/midpoints, 32 visible equipment subsets, 100 actual engine switches/dispose, actual formal core/presentation-owner integration, State/save/audio unchanged; test-only approval, SwiftShader');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
