'use strict';
// Tests-only same-frame material/lighting inspection. No B1/B3 renderer,
// playback, account, combat event, downloader, cache or audio integration.
const {execFileSync}=require('node:child_process');
const {chromium}=require('playwright'),fs=require('node:fs'),assert=require('node:assert/strict');
const base='http://127.0.0.1:4173/',art=base+'development/hybrid-comparison/t2b2-v1/',root='development/hybrid-comparison/t2b2-v1';
const contract=JSON.parse(fs.readFileSync(root+'/repair-r1/color-source-contract.json'));
const output=root+'/repair-r2/native-aligned-r1';fs.mkdirSync(output,{recursive:true});
(async()=>{const browser=await chromium.launch({headless:true,args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{const page=await browser.newPage();page.on('console',m=>{if(m.type()==='error'||m.text().startsWith('COLOR QC'))console.log(m.text());});await page.route('**/__color_qc__.html',r=>r.fulfill({contentType:'text/html',body:'<!doctype html><title>Offline color QC</title>'}));await page.route('**/__local_agx_lut__.png',r=>r.fulfill({contentType:'image/png',body:fs.readFileSync('/tmp/t2b2-color-lut/blender-agx-log-lut.png')}));for(const actor of ['normal','elite','boss'])await page.route('**/__baseline_'+actor+'.glb',r=>r.fulfill({contentType:'model/gltf-binary',body:execFileSync('git',['show','0d7c2307f9e50af2d97dd45c59b650c1d787a4b7:'+root+'/enemies/'+actor+'/candidate.glb'],{maxBuffer:4*1024*1024})}));await page.goto(base+'__color_qc__.html');
for(const file of ['babylon.js','babylonjs.loaders.min.js'])await page.addScriptTag({url:base+'vendor/babylonjs/7.54.3/'+file});
const result=await page.evaluate(async({base,art,contract})=>{
 const B=BABYLON,canvas=document.createElement('canvas');canvas.width=256;canvas.height=256;document.body.append(canvas);const engine=new B.Engine(canvas,false,{preserveDrawingBuffer:true,alpha:true});
 // Offline quadrature exceeds this headless driver's UBO binding count.
 // Plain uniforms retain all lamps and the same PBR equations; no light removed.
 engine.disableUniformBuffers=true;
 const convert=v=>new B.Vector3(v[0],v[2],-v[1]);const results=[];
 B.Effect.ShadersStore.b2AgxFragmentShader=`precision highp float; varying vec2 vUV; uniform sampler2D textureSampler; uniform sampler2D agxLut;
 vec3 lookup(vec3 c){vec3 p=clamp((log2(max(c,vec3(0.000244140625)))+12.0)/20.0,0.0,1.0)*64.0;float z=floor(p.b);vec2 a=vec2((z*65.0+p.r+0.5)/4225.0,(p.g+0.5)/65.0);vec2 b=vec2((min(z+1.0,64.0)*65.0+p.r+0.5)/4225.0,(p.g+0.5)/65.0);return mix(texture2D(agxLut,a).rgb,texture2D(agxLut,b).rgb,p.b-z);}
 void main(){vec4 c=texture2D(textureSampler,vUV);gl_FragColor=vec4(lookup(c.rgb),c.a);}`;
 for(const actor of ['normal','elite','boss'])for(const calibrated of [true]){
  console.log('COLOR QC',actor,calibrated);
  const desc=contract.actors[actor],scene=new B.Scene(engine);scene.useRightHandedSystem=true;scene.clearColor=new B.Color4(0,0,0,0);
  const camera=new B.FreeCamera('same-source-camera',convert(desc.camera.position),scene);camera.setTarget(new B.Vector3(0,{normal:1.85,elite:2.5,boss:3.2}[actor]*.5,0));camera.mode=B.Camera.ORTHOGRAPHIC_CAMERA;const half=desc.camera.orthoScale/2;camera.orthoLeft=-half;camera.orthoRight=half;camera.orthoTop=half;camera.orthoBottom=-half;scene.activeCamera=camera;
  const box=await B.SceneLoader.LoadAssetContainerAsync('',base+`__baseline_${actor}.glb`,scene,undefined,'.glb');box.addAllToScene();for(const a of box.animationGroups)a.stop();let lut,pp;
  if(calibrated){
   // Square area lamps approximated with 3x3 point quadrature using source
   // transforms/energy/colors. It preserves light direction; residual is measured.
   for(const light of desc.lights){const m=light.matrixWorld;for(let x=0;x<3;x++)for(let y=0;y<3;y++){
    const pos=light.position.map((v,i)=>v+((x+.5)/3-.5)*light.sizeMetres*m[i][0]+((y+.5)/3-.5)*light.sizeMetres*m[i][1]);
    const l=new B.PointLight(light.name+x+y,convert(pos),scene);l.diffuse=new B.Color3(...light.colorLinear);l.specular=l.diffuse;l.intensity=light.energyWatts/(9*4*Math.PI);l.falloffType=B.Light.FALLOFF_PHYSICAL;
   }}
   // Original HDR contains the finite square emitters, so glossy panels reflect
   // broad lamps rather than 27 artificial specular dots. Direct diffuse still
   // uses quadrature; ambient irradiance is the source's uniform world only.
   const env=new B.HDRCubeTexture(art+`repair-r1/studio/${actor}-studio.hdr`,scene,128,false,true,false,true);scene.environmentTexture=env;
   await new Promise((resolve,reject)=>{if(env.isReady())resolve();else{env.onLoadObservable.addOnce(resolve);setTimeout(()=>reject(Error('Studio HDR load timeout')),60000);}});
   const world=desc.worldLinear.map(v=>v*desc.worldStrength),polynomial=new B.SphericalPolynomial();for(const key of ['xx','yy','zz'])polynomial[key].set(...world);env.sphericalPolynomial=polynomial;
   for(const lamp of scene.lights)lamp.specular=B.Color3.Black();
   for(const material of box.materials)if(material instanceof B.PBRMaterial){material.maxSimultaneousLights=27;material.usePhysicalLightFalloff=true;}
   scene.imageProcessingConfiguration.applyByPostProcess=true;scene.imageProcessingConfiguration.toneMappingEnabled=false;
   lut=new B.Texture(base+'__local_agx_lut__.png',scene,true,false,B.Texture.BILINEAR_SAMPLINGMODE);lut.gammaSpace=false;lut.wrapU=lut.wrapV=B.Texture.CLAMP_ADDRESSMODE;
   pp=new B.PostProcess('source-AgX','b2Agx',[],['agxLut'],1,camera,B.Texture.NEAREST_SAMPLINGMODE,engine,false,null,B.Engine.TEXTURETYPE_HALF_FLOAT);pp.onApply=e=>e.setTexture('agxLut',lut);
  }else new B.HemisphericLight('previous-inspection-light',new B.Vector3(1,2,-1),scene);
  await Promise.race([scene.whenReadyAsync(),new Promise((_,reject)=>setTimeout(()=>reject(Error('Shader/texture readiness exceeded 60 seconds')),60000))]);assertPage(scene.isReady(),'shaders ready');
  for(const action of ['idle','attack','hit','dodge','return','defeat']){
   const group=box.animationGroups.find(g=>g.name==='B2_'+action);assertPage(group.targetedAnimations.every(a=>a.animation.framePerSecond===60),'GLB loader channel frame rate 60');group.start(false,1);group.pause();
   for(const tick of [0,9,21]){group.goToFrame((1/30+tick/30)*60);scene.render();scene.render();const png=canvas.toDataURL('image/png');results.push({actor,action,tick,calibrated,png,nativeFrame:(1/30+tick/30)*60,clipStartSeconds:1/30,elapsedMs:tick*1000/30});}
   group.stop();
  }
  box.dispose();scene.dispose();assertPage(engine.scenes.length===0,'owned scenes released');
 }
 engine.dispose();canvas.remove();return {results,hardware:'SwiftShader headless only, not physical GPU or performance evidence',sameCamera:true,sameFrames:true,sampling:'authored clipStart 1/30s + tick/30s; skip loader-added zero key; channel fps verified 60',lightApproximation:'3x3 point quadrature of each saved area lamp; native raster/IBL and Cycles remain different',displayTransform:'same local Blender OCIO AgX LUT; LUT redistribution unavailable'};
 function assertPage(v,m){if(!v)throw Error(m);}
},{base,art,contract});
for(const row of result.results){const png=Buffer.from(row.png.split(',')[1],'base64');assert.ok(png.length>1000);const filename=`${row.actor}-${row.action}-${row.tick}-${row.calibrated?'agx':'before'}.png`;fs.writeFileSync(output+'/'+filename,png);delete row.png;row.file=filename;row.bytes=png.length;}
fs.writeFileSync(output+'/report.json',JSON.stringify(result,null,2)+'\n');console.log('PASS 54 actual r2 same-frame native renders, source camera/light/AgX correction, pixels await difference analysis');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
