/* Batch 01: isolated Babylon.js engine foundation. No formal game state access. */
(function(global){
  "use strict";
  const VERSION="0.1.0";
  function supported(canvas){
    if(!canvas || typeof canvas.getContext!=="function" || !global.BABYLON?.Engine)return false;
    try{
      const gl=canvas.getContext("webgl2")||canvas.getContext("webgl");
      return !!gl;
    }catch(_){return false;}
  }
  function mount(canvas, options={}){
    if(!supported(canvas))return {ok:false,reason:"webgl-unavailable",dispose(){}};
    let engine=null, scene=null, disposed=false, resize=()=>{};
    try{
      engine=new global.BABYLON.Engine(canvas,true,{stencil:true, preserveDrawingBuffer:false},true);
      scene=new global.BABYLON.Scene(engine);
      scene.clearColor=new global.BABYLON.Color4(0.015,0.026,0.065,1);
      const camera=new global.BABYLON.ArcRotateCamera("prototype-camera",Math.PI/2,Math.PI/2.7,9,new global.BABYLON.Vector3(0,0.3,0),scene);
      camera.attachControl(canvas,true);
      camera.lowerRadiusLimit=4;
      camera.upperRadiusLimit=14;
      new global.BABYLON.HemisphericLight("ambient",new global.BABYLON.Vector3(0,1,0),scene).intensity=0.75;
      const key=new global.BABYLON.DirectionalLight("key",new global.BABYLON.Vector3(-0.5,-1,0.6),scene);
      key.intensity=1.3;
      const hub=global.BABYLON.MeshBuilder.CreateCylinder("hub",{diameterTop:3.1,diameterBottom:3.9,height:0.4,tessellation:48},scene);
      hub.position.y=-1.25;
      const core=global.BABYLON.MeshBuilder.CreatePolyhedron("core",{type:2,size:1.3},scene);
      core.position.y=0.45;
      const mat=new global.BABYLON.PBRMaterial("core-metal",scene);
      mat.metallic=0.68;mat.roughness=0.28;mat.albedoColor=new global.BABYLON.Color3(0.12,0.37,0.62);
      core.material=mat;
      const ring=global.BABYLON.MeshBuilder.CreateTorus("orbit",{diameter:4.7,thickness:0.055,tessellation:80},scene);
      ring.rotation.x=Math.PI/2.7;
      const ringMat=new global.BABYLON.StandardMaterial("orbit-light",scene);
      ringMat.emissiveColor=new global.BABYLON.Color3(0.15,0.7,1);
      ring.material=ringMat;
      const platform=new global.BABYLON.StandardMaterial("platform-metal",scene);
      platform.diffuseColor=new global.BABYLON.Color3(0.065,0.11,0.18);
      hub.material=platform;
      scene.onBeforeRenderObservable.add(()=>{
        if(disposed)return;
        const delta=Math.min(engine.getDeltaTime()/1000,0.05);
        core.rotation.y+=delta*0.22;
        ring.rotation.z+=delta*0.11;
      });
      engine.runRenderLoop(()=>{if(!disposed && scene && scene.activeCamera)scene.render();});
      resize=()=>{if(!disposed)engine.resize();};
      global.addEventListener("resize",resize);
      return {ok:true,version:VERSION,engine,scene,dispose(){
        if(disposed)return;
        disposed=true;
        global.removeEventListener("resize",resize);
        engine.stopRenderLoop();
        scene.dispose();
        engine.dispose();
        scene=null;engine=null;
      }};
    }catch(error){
      global.removeEventListener("resize",resize);
      try{scene?.dispose();}catch(_){}
      try{engine?.dispose();}catch(_){}
      return {ok:false,reason:"engine-start-failed",error:String(error?.message||error),dispose(){}};
    }
  }
  function createScene({BABYLON,engine,canvas}){
    const scene=new BABYLON.Scene(engine);
    scene.clearColor=new BABYLON.Color4(0.015,0.026,0.065,1);
    const camera=new BABYLON.ArcRotateCamera("prototype-camera",Math.PI/2,Math.PI/2.7,9,new BABYLON.Vector3(0,0.3,0),scene);
    camera.attachControl(canvas,true);
    camera.lowerRadiusLimit=4;camera.upperRadiusLimit=14;
    new BABYLON.HemisphericLight("ambient",new BABYLON.Vector3(0,1,0),scene).intensity=0.75;
    new BABYLON.DirectionalLight("key",new BABYLON.Vector3(-0.5,-1,0.6),scene).intensity=1.3;
    const hub=BABYLON.MeshBuilder.CreateCylinder("hub",{diameterTop:3.1,diameterBottom:3.9,height:0.4,tessellation:48},scene);
    hub.position.y=-1.25;
    const core=BABYLON.MeshBuilder.CreatePolyhedron("core",{type:2,size:1.3},scene);
    core.position.y=0.45;
    const mat=new BABYLON.PBRMaterial("core-metal",scene);
    mat.metallic=0.68;mat.roughness=0.28;mat.albedoColor=new BABYLON.Color3(0.12,0.37,0.62);core.material=mat;
    const ring=BABYLON.MeshBuilder.CreateTorus("orbit",{diameter:4.7,thickness:0.055,tessellation:80},scene);
    ring.rotation.x=Math.PI/2.7;
    const ringMat=new BABYLON.StandardMaterial("orbit-light",scene);
    ringMat.emissiveColor=new BABYLON.Color3(0.15,0.7,1);ring.material=ringMat;
    const platform=new BABYLON.StandardMaterial("platform-metal",scene);
    platform.diffuseColor=new BABYLON.Color3(0.065,0.11,0.18);hub.material=platform;
    scene.onBeforeRenderObservable.add(()=>{
      const delta=Math.min(engine.getDeltaTime()/1000,0.05);
      core.rotation.y+=delta*0.22;ring.rotation.z+=delta*0.11;
    });
    return scene;
  }
  /* Batch 19: distinct command centers, read-only and deliberately low-poly for mobile. */
  function createEpochScene(args){
    const scene=createScene(args),B=args.BABYLON;
    const world=[1,2,3].includes(Number(args.world))?Number(args.world):1;
    const accent=world===3?[.64,.36,.95]:world===2?[.14,.72,.88]:[.20,.48,.89];
    const metal=new B.StandardMaterial("command-metal",scene);
    metal.diffuseColor=new B.Color3(.10,.16,.25);
    metal.specularColor=new B.Color3(.19,.30,.42);
    const glow=new B.StandardMaterial("command-energy",scene);
    glow.diffuseColor=new B.Color3(...accent).scale(.22);
    glow.emissiveColor=new B.Color3(...accent).scale(.8);
    const bright=new B.StandardMaterial("command-bright",scene);
    bright.emissiveColor=new B.Color3(...accent);
    scene.clearColor=world===3?new B.Color4(.019,.010,.045,1):world===2?new B.Color4(.008,.025,.040,1):new B.Color4(.010,.019,.046,1);
    const createRing=(name,diameter,thickness,height,tilt,material)=>{
      const ring=B.MeshBuilder.CreateTorus(name,{diameter,thickness,tessellation:world===3?48:40},scene);
      ring.position.y=height;ring.rotation.x=tilt;ring.material=material;return ring;
    };
    const base=B.MeshBuilder.CreateCylinder("command-platform",{diameter:7.4,height:.28,tessellation:48},scene);
    base.position.y=-1.35;base.material=metal;
    const rim=createRing("command-platform-rim",7.2,.075,-1.17,Math.PI/2,glow);
    const portal=createRing("epoch-gateway",world===3?5.2:5.8,.10,.25,world===3?.34:Math.PI/3,bright);
    portal.rotation.y=Math.PI/3;
    const orbit=createRing("command-inner-orbit",3.4,.052,-.6,Math.PI/2,glow);
    const animated=[portal,orbit];
    if(world===1){
      const planet=B.MeshBuilder.CreateSphere("galaxy-command-planet",{diameter:2.1,segments:20},scene);
      planet.position.set(0,.05,0);planet.material=glow;animated.push(planet);
      for(let i=0;i<4;i++){
        const angle=i*Math.PI/2,x=Math.cos(angle)*2.4,z=Math.sin(angle)*2.4;
        const hull=B.MeshBuilder.CreateBox("galaxy-fleet-"+i,{width:.92,height:.17,depth:.28},scene);
        hull.position.set(x,.52,z);hull.rotation.y=-angle;hull.material=metal;
        const drive=B.MeshBuilder.CreateSphere("galaxy-drive-"+i,{diameter:.2,segments:8},scene);
        drive.position.set(x,.52,z);drive.material=bright;
      }
      for(let i=0;i<3;i++){
        const tower=B.MeshBuilder.CreateCylinder("galaxy-orbital-tower-"+i,{diameter:.2,height:.8,tessellation:8},scene);
        const a=i*Math.PI*2/3;tower.position.set(Math.cos(a)*3,-.72,Math.sin(a)*3);tower.material=glow;
      }
    }else if(world===2){
      const core=B.MeshBuilder.CreatePolyhedron("universe-dark-energy-core",{type:2,size:1.2},scene);
      core.position.y=.12;core.material=bright;animated.push(core);
      for(let i=0;i<3;i++){
        const ring=createRing("universe-dark-energy-ring-"+i,2.5+i*.85,.065,.15,Math.PI*(i+1)/5,glow);
        ring.rotation.y=i*Math.PI/3;animated.push(ring);
      }
      for(let i=0;i<6;i++){
        const a=2*Math.PI*i/6;
        const p=B.MeshBuilder.CreatePolyhedron("universe-energy-anchor-"+i,{type:1,size:.31},scene);
        p.position.set(2.8*Math.cos(a),.25+(i%2)*.42,2.8*Math.sin(a));p.material=i%2?bright:metal;
      }
    }else{
      const core=B.MeshBuilder.CreatePolyhedron("higher-dimensional-core",{type:2,size:1.05},scene);
      core.position.y=.1;core.material=bright;animated.push(core);
      for(let i=0;i<3;i++){
        const frame=B.MeshBuilder.CreateBox("higher-dimensional-frame-"+i,{width:2.3+i*.8,height:2.3+i*.8,depth:.09},scene);
        frame.position.y=.15;frame.rotation.set(i*.37,i*.55,i*.31);frame.material=i===1?bright:glow;animated.push(frame);
      }
      for(let i=0;i<6;i++){
        const a=i*Math.PI/3;
        const shard=B.MeshBuilder.CreatePolyhedron("higher-dimensional-shard-"+i,{type:1,size:.35},scene);
        shard.position.set(Math.cos(a)*2.65,.85*Math.sin(a*2),Math.sin(a)*2.65);
        shard.rotation.y=a;shard.material=i%2?glow:bright;
      }
    }
    scene.metadata={civilization3dCommand:{world,visualOnly:true,readOnly:true,batch:19}};
    scene.onBeforeRenderObservable.add(()=>{
      const dt=Math.min(Math.max(Number(args.engine.getDeltaTime())||0,0),50)*.00012;
      portal.rotation.z+=dt;
      orbit.rotation.y-=dt*.65;
      for(let i=2;i<animated.length;i++)animated[i].rotation.y+=dt*(i%2?-.4:.55);
    });
    return scene;
  }
  /* Decorative 3D map. The actual map/monster/target buttons stay in ui.js. */
  function createGalaxyScene(args){
    const B=args.BABYLON,scene=new B.Scene(args.engine);
    scene.clearColor=new B.Color4(.004,.014,.044,1);
    const camera=new B.ArcRotateCamera("galaxy-map-camera",Math.PI/2.15,Math.PI/2.75,14,new B.Vector3(0,0,0),scene);
    camera.lowerRadiusLimit=9;camera.upperRadiusLimit=21;camera.wheelPrecision=65;camera.pinchPrecision=120;camera.inertia=.78;camera.attachControl(args.canvas,true);
    new B.HemisphericLight("galaxy-map-ambient",new B.Vector3(0,1,0),scene).intensity=.65;
    const glowColor=new B.StandardMaterial("galaxy-map-node-light",scene);
    glowColor.emissiveColor=new B.Color3(.17,.65,1);glowColor.diffuseColor=new B.Color3(.05,.22,.38);
    const dimColor=new B.StandardMaterial("galaxy-map-locked-light",scene);
    dimColor.diffuseColor=new B.Color3(.085,.11,.19);
    const coreColor=new B.StandardMaterial("galaxy-map-core-metal",scene);
    coreColor.emissiveColor=new B.Color3(.2,.45,.82);
    const center=B.MeshBuilder.CreateSphere("galaxy-center",{diameter:1.5,segments:24},scene);
    center.material=coreColor;
    const points=Math.max(1,Math.min(10,Math.floor(Number(args.mapCount)||10)));
    const selected=Math.max(0,Math.min(points-1,Math.floor(Number(args.selectedMap)||0)));
    const unlockedRegions=Array.isArray(args.unlockedRegions)?args.unlockedRegions:null;
    const completedRegions=Array.isArray(args.completedRegions)?args.completedRegions:[];
    const completedMat=new B.StandardMaterial("galaxy-completed",scene);completedMat.emissiveColor=new B.Color3(.12,.77,.64);
    for(let i=0;i<points;i++){
      const angle=2*Math.PI*i/points;
      const x=4.2*Math.cos(angle),z=4.2*Math.sin(angle);
      const node=B.MeshBuilder.CreateSphere("region-"+(i+1),{diameter:i===selected?.92:.55,segments:16},scene);
      node.position.set(x,Math.sin(angle*3)*.35,z);
      node.material=completedRegions[i]===true?completedMat:(!unlockedRegions||unlockedRegions[i]===true)?glowColor:dimColor;
      if(i===selected){const halo=B.MeshBuilder.CreateTorus("galaxy-focus-"+i,{diameter:1.28,thickness:.065,tessellation:28},scene);halo.position.copyFrom(node.position);halo.rotation.x=Math.PI/2;halo.material=coreColor;}
      const link=B.MeshBuilder.CreateLines("route-"+i,{points:[new B.Vector3(0,0,0),node.position.clone()]},scene);
      link.color=(!unlockedRegions||unlockedRegions[i]===true)?new B.Color3(.15,.52,.73):new B.Color3(.11,.15,.23);
    }
    const ring=B.MeshBuilder.CreateTorus("galaxy-course",{diameter:8.4,thickness:.026,tessellation:96},scene);
    ring.rotation.x=Math.PI/2;ring.material=glowColor;
    const enemies=Math.min(5,Math.max(0,Math.floor(Number(args.enemyCount)||0)));
    for(let i=0;i<enemies;i++){
      const e=B.MeshBuilder.CreatePolyhedron("galaxy-enemy-"+i,{type:1,size:.27+(i===4?.14:0)},scene);
      e.position.set(-2+i,1.6+Math.sin(i)*.15,-1.6);
      e.material=i===4?coreColor:glowColor;
    }
    scene.onBeforeRenderObservable.add(()=>{ring.rotation.y+=Math.min(args.engine.getDeltaTime(),50)*.000035;center.rotation.y+=.0015;});
    return scene;
  }

  /* Universe mainline: ten regions, one hundred symbolic Boss markers; visual-only. */
  function createUniverseScene(args){
    const B=args.BABYLON,scene=new B.Scene(args.engine);
    scene.clearColor=new B.Color4(.014,.009,.038,1);
    const camera=new B.ArcRotateCamera("universe-camera",Math.PI/2.2,Math.PI/2.9,20,new B.Vector3(0,0,0),scene);
    camera.lowerRadiusLimit=11;camera.upperRadiusLimit=30;camera.wheelPrecision=85;camera.pinchPrecision=150;camera.inertia=.8;camera.attachControl(args.canvas,true);
    new B.HemisphericLight("universe-light",new B.Vector3(0,1,0),scene).intensity=.7;
    const lit=new B.StandardMaterial("universe-lit",scene);lit.emissiveColor=new B.Color3(.24,.52,.96);
    const won=new B.StandardMaterial("universe-won",scene);won.emissiveColor=new B.Color3(.1,.76,.65);
    const dim=new B.StandardMaterial("universe-dim",scene);dim.diffuseColor=new B.Color3(.07,.08,.15);
    const bossMat=new B.StandardMaterial("universe-boss-mat",scene);bossMat.emissiveColor=new B.Color3(.63,.28,.9);
    const progress=Math.max(0,Math.min(100,Math.floor(Number(args.clearedBossCount)||0)));
    const highest=Math.max(0,Math.min(99,Math.floor(Number(args.highestUnlockedBossIndex)||0)));
    const selected=Math.max(0,Math.min(9,Math.floor(Number(args.selectedMap)||0)));
    const review=args.review===true;
    const defeated=Array.isArray(args.defeatedBosses)?args.defeatedBosses:null;
    const bossCleared=index=>defeated?defeated[index]===true:index<progress;
    const regionCleared=index=>Array.from({length:10},(_,j)=>index*10+j).every(bossCleared);
    const core=B.MeshBuilder.CreatePolyhedron("universe-core",{type:2,size:1.1},scene);core.material=lit;
    for(let i=0;i<10;i++){
      const a=Math.PI*2*i/10,x=Math.cos(a)*6.4,z=Math.sin(a)*6.4;
      const node=B.MeshBuilder.CreateSphere("universe-region-"+(i+1),{diameter:i===selected?1:.7,segments:14},scene);
      node.position.set(x,.25*Math.sin(a*3),z);node.material=regionCleared(i)?won:review||i*10<=highest?lit:dim;
      if(i===selected){const focus=B.MeshBuilder.CreateTorus("universe-focus-"+i,{diameter:1.45,thickness:.07,tessellation:28},scene);focus.position.copyFrom(node.position);focus.rotation.x=Math.PI/2;focus.material=lit;}
      const line=B.MeshBuilder.CreateLines("universe-link-"+i,{points:[new B.Vector3(0,0,0),node.position.clone()]},scene);
      line.color=review||i*10<=highest?new B.Color3(.22,.44,.72):new B.Color3(.1,.1,.17);
      for(let j=0;j<10;j++){
        const t=Math.PI*2*j/10,index=i*10+j;
        const marker=B.MeshBuilder.CreatePolyhedron("universe-boss-"+(index+1),{type:1,size:.13},scene);
        marker.position.set(x+Math.cos(t)*1.27,.5+Math.sin(t*2)*.17,z+Math.sin(t)*1.27);
        marker.material=bossCleared(index)?won:review||index<=highest?bossMat:dim;
      }
    }
    const orbit=B.MeshBuilder.CreateTorus("universe-orbit",{diameter:12.8,thickness:.045,tessellation:96},scene);
    orbit.rotation.x=Math.PI/2;orbit.material=lit;
    scene.onBeforeRenderObservable.add(()=>{const dt=Math.min(args.engine.getDeltaTime(),50);core.rotation.y+=dt*.0002;orbit.rotation.z+=dt*.000025;});
    return scene;
  }

  /* High-dimensional front: visual-only ten presences, persistent HP proportions from formal snapshots. */
  function createHigherDimensionalScene(args){
    const B=args.BABYLON,scene=new B.Scene(args.engine);
    scene.clearColor=new B.Color4(.025,.01,.055,1);
    const camera=new B.ArcRotateCamera("higher-dimensional-camera",Math.PI/2.2,Math.PI/2.8,17,new B.Vector3(0,0,0),scene);
    camera.lowerRadiusLimit=9;camera.upperRadiusLimit=27;camera.wheelPrecision=75;camera.pinchPrecision=130;camera.inertia=.8;camera.attachControl(args.canvas,true);
    new B.HemisphericLight("higher-dimensional-ambient",new B.Vector3(0,1,0),scene).intensity=.7;
    const ready=new B.StandardMaterial("higher-ready",scene);ready.emissiveColor=new B.Color3(.53,.29,.95);
    const cleared=new B.StandardMaterial("higher-cleared",scene);cleared.emissiveColor=new B.Color3(.16,.78,.7);
    const locked=new B.StandardMaterial("higher-locked",scene);locked.diffuseColor=new B.Color3(.1,.085,.17);
    const fractured=new B.StandardMaterial("higher-fractured",scene);fractured.emissiveColor=new B.Color3(.8,.35,.56);
    const profiles=Array.isArray(args.presences)?args.presences:[];
    const selected=Math.max(0,Math.min(9,Math.floor(Number(args.selectedPresence)||0)));
    const core=B.MeshBuilder.CreatePolyhedron("higher-dimensional-core",{type:2,size:1.55},scene);core.material=ready;
    for(let i=0;i<10;i++){
      const p=profiles[i]||{},angle=2*Math.PI*i/10;
      const x=Math.cos(angle)*5.3,z=Math.sin(angle)*5.3;
      const remaining=Math.max(0,Math.min(100,Number(p.remainingPercent??100)));
      const completed=p.defeated===true;
      const available=p.available!==false;
      const pillar=B.MeshBuilder.CreateCylinder("higher-presence-"+i,{height:1.2+remaining/120,diameterTop:.16,diameterBottom:i===selected?.9:.65,tessellation:6},scene);
      pillar.position.set(x,(1.2+remaining/120)/2-.7,z);
      pillar.material=completed?cleared:!available?locked:remaining<100?fractured:ready;
      const base=B.MeshBuilder.CreateTorus("higher-presence-base-"+i,{diameter:1.15,thickness:.05,tessellation:30},scene);
      base.position.set(x,-.7,z);base.rotation.x=Math.PI/2;base.material=pillar.material;
      if(i===selected){const halo=B.MeshBuilder.CreateTorus("higher-focus-"+i,{diameter:1.52,thickness:.08,tessellation:30},scene);halo.position.set(x,-.66,z);halo.rotation.x=Math.PI/2;halo.material=ready;}
      const route=B.MeshBuilder.CreateLines("higher-route-"+i,{points:[new B.Vector3(0,0,0),new B.Vector3(x,-.65,z)]},scene);
      route.color=available?new B.Color3(.4,.2,.64):new B.Color3(.12,.1,.2);
    }
    const orbit=B.MeshBuilder.CreateTorus("higher-dimensional-orbit",{diameter:10.5,thickness:.035,tessellation:80},scene);
    orbit.rotation.x=Math.PI/2;orbit.material=ready;
    scene.onBeforeRenderObservable.add(()=>{const dt=Math.min(50,args.engine.getDeltaTime());core.rotation.y+=dt*.00025;orbit.rotation.z+=dt*.000022;});
    return scene;
  }

  /* B08: visual-only full-body character stand-in; no equipment/save mutation. */
  function configureDisplayCamera(camera,canvas,min,max){
    camera.lowerRadiusLimit=min;camera.upperRadiusLimit=max;
    camera.lowerBetaLimit=.25;camera.upperBetaLimit=Math.PI-.3;
    camera.wheelPrecision=65;camera.pinchPrecision=135;camera.inertia=.76;
    camera.attachControl(canvas,true);
  }
  function createCharacterScene(args){
    const B=args.BABYLON,scene=new B.Scene(args.engine);
    scene.clearColor=new B.Color4(.015,.02,.045,1);
    const camera=new B.ArcRotateCamera("character-camera",Math.PI/2.25,Math.PI/2.5,8.5,new B.Vector3(0,1.05,0),scene);
    configureDisplayCamera(camera,args.canvas,5.5,12);
    new B.HemisphericLight("character-light",new B.Vector3(0,1,0),scene).intensity=.9;
    const metal=new B.StandardMaterial("character-metal",scene);metal.diffuseColor=new B.Color3(.18,.23,.33);
    const glow=new B.StandardMaterial("character-glow",scene);
    const world=Math.max(1,Math.min(3,Math.floor(Number(args.world)||1)));
    glow.emissiveColor=world===3?new B.Color3(.6,.25,.92):world===2?new B.Color3(.13,.7,.8):new B.Color3(.22,.5,.95);
    const body=B.MeshBuilder.CreateCylinder("character-body",{height:1.8,diameterTop:.88,diameterBottom:.65,tessellation:8},scene);
    body.position.y=1.8;body.material=metal;
    const head=B.MeshBuilder.CreateSphere("character-head",{diameter:.65,segments:16},scene);
    head.position.y=3.05;head.material=glow;
    for(const side of [-1,1]){
      const arm=B.MeshBuilder.CreateCylinder("character-arm-"+side,{height:1.55,diameter:.28,tessellation:8},scene);
      arm.position.set(side*.72,1.75,0);arm.rotation.z=side*.14;arm.material=metal;
      const leg=B.MeshBuilder.CreateCylinder("character-leg-"+side,{height:1.5,diameter:.37,tessellation:8},scene);
      leg.position.set(side*.24,.45,0);leg.material=metal;
    }
    const platform=B.MeshBuilder.CreateCylinder("character-platform",{height:.2,diameter:3.2,tessellation:48},scene);
    platform.position.y=-.4;platform.material=glow;
    const orbit=B.MeshBuilder.CreateTorus("character-aura",{diameter:3.5,thickness:.065,tessellation:72},scene);
    orbit.rotation.x=Math.PI/2;orbit.position.y=-.18;orbit.material=glow;
    scene.onBeforeRenderObservable.add(()=>{orbit.rotation.z+=Math.min(args.engine.getDeltaTime(),50)*.00003;});
    return scene;
  }

  /* B09: five equipment pedestals, strictly read-only inventory/equipped visual data. */
  function createEquipmentScene(args){
    const B=args.BABYLON,scene=new B.Scene(args.engine);
    scene.clearColor=new B.Color4(.015,.021,.045,1);
    const camera=new B.ArcRotateCamera("equipment-camera",Math.PI/2.2,Math.PI/2.7,13,new B.Vector3(0,.5,0),scene);
    configureDisplayCamera(camera,args.canvas,10.5,20);
    new B.HemisphericLight("equipment-light",new B.Vector3(0,1,0),scene).intensity=.85;
    const slots=Array.isArray(args.slots)?args.slots.slice(0,5):[];
    const appearance=args.appearance||{};
    const world=Math.max(1,Math.min(3,Math.floor(Number(args.world||appearance.world)||1)));
    const eraTint=world===3?[.66,.32,.95]:world===2?[.15,.7,.83]:[.19,.5,.94];
    const cases=Array.isArray(args.inventorySamples)?args.inventorySamples.slice(0,5):[];
    const color=(item)=>{
      const quality=Math.max(0,Math.min(5,Math.floor(Number(item?.quality)||0)));
      const shades=[[.13,.23,.37],[.22,.44,.58],[.22,.64,.48],[.58,.4,.8],[.84,.61,.25],[.93,.36,.53]];
      const mat=new B.StandardMaterial("equipment-mat-"+quality+"-"+(item?.present?"equipped":"empty"),scene);
      mat.emissiveColor=new B.Color3(...(item?.present?shades[quality]:[.09,.11,.15]));
      return mat;
    };
    const base=new B.StandardMaterial("equipment-base",scene);base.diffuseColor=new B.Color3(.11,.16,.27);
    const accent=new B.StandardMaterial("equipment-era-accent",scene);accent.emissiveColor=new B.Color3(...eraTint).scale(.55);
    for(let i=0;i<5;i++){
      const item=slots[i]||{},x=(i-2)*2.2;
      const pedestal=B.MeshBuilder.CreateCylinder("equipment-slot-base-"+i,{diameter:1.7,height:.26,tessellation:24},scene);
      pedestal.position.set(x,-.55,0);pedestal.material=base;
      const relic=i===0?B.MeshBuilder.CreateBox("equipment-slot-"+i,{width:item.present?.16:.12,height:item.present?1.75:.45,depth:.17},scene):B.MeshBuilder.CreatePolyhedron("equipment-slot-"+i,{type:i%2?1:2,size:item.present?.56:.28},scene);
      relic.position.set(x,i===0?.47:.45,0);relic.material=color(item);
      if(i===0&&item.present){
        const guard=B.MeshBuilder.CreateBox("equipment-weapon-guard",{width:.78,height:.13,depth:.25},scene);
        guard.position.set(x,-.19,0);guard.material=accent;
        const tip=B.MeshBuilder.CreatePolyhedron("equipment-weapon-tip",{type:1,size:.28},scene);
        tip.position.set(x,1.48,0);tip.material=relic.material;
      }
      const ring=B.MeshBuilder.CreateTorus("equipment-slot-ring-"+i,{diameter:1.8,thickness:.045,tessellation:32},scene);
      ring.position.set(x,-.37,0);ring.rotation.x=Math.PI/2;ring.material=relic.material;
      const sample=cases[i]||{};
      const sampleMesh=B.MeshBuilder.CreateSphere("equipment-inventory-sample-"+i,{diameter:sample.present?.4:.16,segments:12},scene);
      sampleMesh.position.set(x,-.1,2);sampleMesh.material=color(sample);
    }
    scene.metadata={civilization3dEquipment:{visualOnly:true,readOnly:true,world,slotCount:5}};
    scene.onBeforeRenderObservable.add(()=>{const dt=Math.min(args.engine.getDeltaTime(),50);scene.meshes.forEach(mesh=>{if(mesh.name.startsWith("equipment-slot-")&&!mesh.name.includes("ring")&&!mesh.name.includes("base"))mesh.rotation.y+=dt*.00012;});});
    return scene;
  }

  /* B10: read-only five-slot forge. Formal transaction and cost confirmation remain in enhancementui.js. */
  function createForgeScene(args){
    const B=args.BABYLON,scene=new B.Scene(args.engine);
    scene.clearColor=new B.Color4(.025,.021,.022,1);
    const camera=new B.ArcRotateCamera("forge-camera",Math.PI/2.3,Math.PI/2.85,13.7,new B.Vector3(0,.35,0),scene);
    configureDisplayCamera(camera,args.canvas,9,21);
    new B.HemisphericLight("forge-light",new B.Vector3(0,1,0),scene).intensity=.9;
    const iron=new B.StandardMaterial("forge-iron",scene);iron.diffuseColor=new B.Color3(.16,.18,.21);
    const gold=new B.StandardMaterial("forge-gold",scene);gold.emissiveColor=new B.Color3(.7,.46,.16);
    const capped=new B.StandardMaterial("forge-max",scene);capped.emissiveColor=new B.Color3(.19,.66,.52);
    const blocked=new B.StandardMaterial("forge-blocked",scene);blocked.diffuseColor=new B.Color3(.12,.12,.14);
    const slots=Array.isArray(args.slots)?args.slots.slice(0,5):[];
    const cap=Math.max(1,Math.floor(Number(args.cap)||20));
    const activeForge=[];
    for(let i=0;i<5;i++){
      const item=slots[i]||{},x=(i-2)*2.18;
      const level=Math.max(0,Math.floor(Number(item.level)||0));
      const invalid=item.invalid===true,complete=level>=cap;
      const mat=invalid?blocked:complete?capped:gold;
      const base=B.MeshBuilder.CreateCylinder("forge-base-"+i,{diameter:1.65,height:.22,tessellation:28},scene);
      base.position.set(x,-.6,0);base.material=iron;
      const anvil=B.MeshBuilder.CreateBox("forge-slot-"+i,{width:.98,height:.45,depth:.78},scene);
      anvil.position.set(x,.06,0);anvil.material=mat;
      const energy=B.MeshBuilder.CreatePolyhedron("forge-energy-"+i,{type:2,size:.28+Math.min(level/cap,1)*.26},scene);
      energy.position.set(x,.86,0);energy.material=mat;
      if(!invalid&&level>0)activeForge.push(energy);
      const progress=B.MeshBuilder.CreateCylinder("forge-progress-"+i,{diameter:.18,height:.12+Math.min(level/cap,1)*.85,tessellation:10},scene);
      progress.position.set(x+.63,-.20+(.12+Math.min(level/cap,1)*.85)/2,0);progress.material=mat;
      const ring=B.MeshBuilder.CreateTorus("forge-ring-"+i,{diameter:1.5,thickness:.045,tessellation:32},scene);
      ring.rotation.x=Math.PI/2;ring.position.set(x,-.39,0);ring.material=mat;
    }
    const core=B.MeshBuilder.CreateCylinder("forge-central-core",{diameter:1.1,height:.25,tessellation:36},scene);
    core.position.set(0,-.63,-2.35);core.material=iron;
    scene.metadata={civilization3dForge:{visualOnly:true,readOnly:true,slotCount:5}};
    scene.onBeforeRenderObservable.add(()=>{const dt=Math.min(Math.max(Number(args.engine.getDeltaTime())||0,0),50);for(const mesh of activeForge)mesh.rotation.y+=dt*.00015;});
    return scene;
  }

  /* B11: four read-only growth installations. Numbers are presentation snapshots only. */
  function createGrowthScene(args){
    const B=args.BABYLON,scene=new B.Scene(args.engine);
    const kind=["specialization","marks","civilization","core"].includes(args.growthKind)?args.growthKind:"specialization";
    const palettes={specialization:[.11,.66,.86],marks:[.66,.36,.91],civilization:[.25,.85,.68],core:[.88,.57,.22]};
    const color=palettes[kind];scene.clearColor=new B.Color4(.008,.016,.038,1);
    const camera=new B.ArcRotateCamera("growth-camera",Math.PI/2.3,Math.PI/2.7,kind==="marks"?13:11,new B.Vector3(0,.25,0),scene);
    configureDisplayCamera(camera,args.canvas,7.5,19);
    new B.HemisphericLight("growth-light",new B.Vector3(0,1,0),scene).intensity=.85;
    const metal=new B.StandardMaterial("growth-metal",scene);metal.diffuseColor=new B.Color3(.11,.17,.25);
    const lit=new B.StandardMaterial("growth-active",scene);lit.emissiveColor=new B.Color3(...color);
    const dim=new B.StandardMaterial("growth-inactive",scene);dim.diffuseColor=new B.Color3(.1,.12,.17);
    const count=kind==="specialization"?8:kind==="marks"?10:kind==="civilization"?10:10;
    const values=Array.isArray(args.growthLevels)?args.growthLevels:[];
    const maximum=kind==="specialization"?60:10;
    const single=Math.max(0,Math.min(10,Number(args.growthLevel)||0));
    const platform=B.MeshBuilder.CreateCylinder("growth-platform",{diameter:6.6,height:.36,tessellation:48},scene);platform.position.y=-.65;platform.material=metal;
    for(let i=0;i<count;i++){
      const a=2*Math.PI*i/count,x=Math.cos(a)*2.7,z=Math.sin(a)*2.7;
      const value=kind==="specialization"||kind==="marks"?Math.max(0,Math.min(maximum,Number(values[i])||0)):Math.max(0,Math.min(1,single-i));
      const ratio=kind==="specialization"||kind==="marks"?value/maximum:value;
      const pedestal=B.MeshBuilder.CreateCylinder("growth-pedestal-"+i,{diameter:.66,height:.22,tessellation:12},scene);
      pedestal.position.set(x,-.36,z);pedestal.material=metal;
      const shard=B.MeshBuilder.CreatePolyhedron("growth-node-"+i,{type:2,size:.22+ratio*.38},scene);
      shard.position.set(x,.12+ratio*.45,z);shard.material=ratio>0?lit:dim;
      const halo=B.MeshBuilder.CreateTorus("growth-halo-"+i,{diameter:.88,thickness:.035,tessellation:24},scene);
      halo.position.set(x,-.21,z);halo.rotation.x=Math.PI/2;halo.material=ratio>0?lit:dim;
      if(ratio>0){
        const tier=B.MeshBuilder.CreateCylinder("growth-progress-"+i,{diameter:.11,height:.15+ratio*.7,tessellation:8},scene);
        tier.position.set(x+.48,.05+ratio*.35,z);tier.material=lit;
      }
    }
    const center=B.MeshBuilder.CreatePolyhedron("growth-center-"+kind,{type:2,size:kind==="core"?1.35:1},scene);
    const seal=B.MeshBuilder.CreateTorus("growth-seal-"+kind,{diameter:kind==="marks"?3.55:kind==="core"?2.7:3.1,thickness:.075,tessellation:48},scene);
    seal.position.y=.18;seal.rotation.x=kind==="core"?.42:Math.PI/2;seal.material=lit;
    center.position.y=.68;center.material=lit;
    const orbit=B.MeshBuilder.CreateTorus("growth-orbit",{diameter:4.3,thickness:.038,tessellation:60},scene);
    orbit.position.y=.55;orbit.rotation.x=Math.PI/2;orbit.material=lit;
    scene.metadata={civilization3dGrowth:{kind,visualOnly:true,readOnly:true}};
    scene.onBeforeRenderObservable.add(()=>{const dt=Math.min(Math.max(Number(args.engine.getDeltaTime())||0,0),50);center.rotation.y+=dt*.00022;orbit.rotation.z+=dt*.00008;seal.rotation.y-=dt*.000035;});
    return scene;
  }

  /* B12: presentation-only dungeon command center, bounty selection and W1/W2 arena. */
  function createDungeonScene(args){
    const B=args.BABYLON,scene=new B.Scene(args.engine);
    const mode=["hub","bounty","arena"].includes(args.dungeonKind)?args.dungeonKind:"hub";
    const world=Math.max(1,Math.min(3,Number(args.world)||1));
    const phase=["select","ready"].includes(args.dungeonPhase)?args.dungeonPhase:"select";
    scene.clearColor=new B.Color4(world===3?.015:world===2?.02:.013,.016,world===3?.075:world===2?.053:.038,1);
    const camera=new B.ArcRotateCamera("dungeon-camera",Math.PI/2.18,Math.PI/2.75,mode==="hub"?14.8:13,new B.Vector3(0,.25,0),scene);
    configureDisplayCamera(camera,args.canvas,8.5,21);
    new B.HemisphericLight("dungeon-light",new B.Vector3(0,1,0),scene).intensity=.91;
    const material=(name,rgb,glow=false)=>{
      const m=new B.StandardMaterial(name,scene);
      if(glow)m.emissiveColor=new B.Color3(...rgb);else m.diffuseColor=new B.Color3(...rgb);
      return m;
    };
    const iron=material("dungeon-metal",[.13,.18,.24]);
    const floor=material("dungeon-floor",[.075,.1,.16]);
    const teal=material("dungeon-activated",[.2,.76,.86],true);
    const purple=material("dungeon-arena",[.68,.42,.94],true);
    const gold=material("dungeon-bounty",[.86,.61,.24],true);
    const inactive=material("dungeon-disabled",[.12,.15,.2]);
    const platform=B.MeshBuilder.CreateCylinder("dungeon-command-platform",{diameter:11,height:.42,tessellation:60},scene);
    platform.position.y=-.72;platform.material=floor;
    const base=B.MeshBuilder.CreateTorus("dungeon-command-ring",{diameter:10.4,thickness:.055,tessellation:64},scene);
    base.rotation.x=Math.PI/2;base.position.y=-.48;base.material=teal;
    const canonicalModes=["bounty","arena","tower","mirror"];
    const visibleModes=mode==="hub"?(Array.isArray(args.dungeonVisibleModes)?canonicalModes.filter(key=>args.dungeonVisibleModes.includes(key)):canonicalModes.filter(key=>world!==3||key!=="bounty")):[];
    const modeTotal=mode==="hub"?visibleModes.length:mode==="bounty"?5:3;
    const count=Math.max(0,Math.min(40,Math.floor(Number(args.dungeonRemaining)||0)));
    const modeUnlocked=args.dungeonUnlocked!==false;
    const arenaRank=Math.max(1,Math.min(20,Math.floor(Number(args.dungeonRank)||1)));
    const arenaPosition=["normal","hard","extreme"].includes(args.dungeonPosition)?args.dungeonPosition:"normal";
    const bountyTier=["normal","high","danger"].includes(args.dungeonTier)?args.dungeonTier:"normal";
    for(let i=0;i<modeTotal;i++){
      const modeKey=mode==="hub"?visibleModes[i]:mode;
      const angle=(i-(modeTotal-1)/2)*.46;
      const x=Math.sin(angle)*6.8,z=Math.cos(angle)*2.1;
      const canonicalIndex=canonicalModes.indexOf(modeKey);
      const active=mode==="hub"?(Array.isArray(args.dungeonAvailableModes)?args.dungeonAvailableModes[canonicalIndex]===true:false):modeUnlocked&&count>0;
      const surface=active?(modeKey==="arena"?purple:modeKey==="bounty"?gold:teal):inactive;
      const disk=B.MeshBuilder.CreateCylinder("dungeon-node-base-"+modeKey+"-"+i,{diameter:1.45,height:.25,tessellation:32},scene);
      disk.position.set(x,-.38,z);disk.material=iron;
      const column=B.MeshBuilder.CreateBox("dungeon-node-"+modeKey+"-"+i,{width:.7,height:modeKey==="arena"?2.3:1.35,depth:.65},scene);
      column.position.set(x,modeKey==="arena"?.8:.35,z);column.material=surface;
      const loop=B.MeshBuilder.CreateTorus("dungeon-node-portal-"+modeKey+"-"+i,{diameter:modeKey==="arena"?2.05:1.42,thickness:.075,tessellation:36},scene);
      loop.position.set(x,modeKey==="arena"?1.03:.65,z);loop.material=surface;
      if(modeKey==="arena")loop.rotation.y=Math.PI/2.9;else loop.rotation.x=.18;
      if(modeKey==="tower"){
        const tower=B.MeshBuilder.CreateCylinder("dungeon-void-tower-"+i,{height:1.35,diameterTop:.13,diameterBottom:.72,tessellation:8},scene);
        tower.position.set(x,1.2,z);tower.material=surface;
      }else if(modeKey==="mirror"){
        const mirror=B.MeshBuilder.CreateBox("dungeon-mirror-gate-"+i,{width:1.02,height:1.6,depth:.09},scene);
        mirror.position.set(x,.85,z);mirror.material=surface;
      }else if(modeKey==="bounty"){
        const beacon=B.MeshBuilder.CreatePolyhedron("dungeon-bounty-beacon-"+i,{type:1,size:.4},scene);
        beacon.position.set(x,1.25,z);beacon.material=surface;
      }else if(modeKey==="arena"){
        const banner=B.MeshBuilder.CreateBox("dungeon-arena-banner-"+i,{width:1.15,height:.16,depth:.13},scene);
        banner.position.set(x,1.9,z);banner.material=surface;
      }
    }
    if(mode==="arena"){
      const accent=arenaPosition==="extreme"?purple:arenaPosition==="hard"?gold:teal;
      const rankRing=B.MeshBuilder.CreateTorus("dungeon-arena-rank-ring",{diameter:2.1+arenaRank*.13,thickness:.08,tessellation:48},scene);
      rankRing.rotation.x=Math.PI/2;rankRing.position.set(0,.1,-1.1);rankRing.material=accent;
    }else if(mode==="bounty"){
      const tier=["normal","high","danger"].indexOf(bountyTier);
      for(let i=0;i<=tier;i++){
        const mark=B.MeshBuilder.CreatePolyhedron("dungeon-bounty-tier-"+i,{type:1,size:.36},scene);
        mark.position.set((i-tier/2)*.85,1.65,-1.1);mark.material=tier===2?purple:gold;
      }
    }
    if(mode!=="hub"){
      const core=B.MeshBuilder.CreatePolyhedron("dungeon-center-"+mode,{type:2,size:mode==="arena"?.83:1},scene);
      core.position.set(0,2.2,-1.1);core.material=mode==="arena"?purple:gold;
      const hoop=B.MeshBuilder.CreateTorus("dungeon-center-orbit",{diameter:3.15,thickness:.06,tessellation:48},scene);
      hoop.position.set(0,1.8,-1.1);hoop.rotation.x=Math.PI/2;hoop.material=teal;
      scene.onBeforeRenderObservable.add(()=>{
        const dt=Math.min(args.engine.getDeltaTime(),50);core.rotation.y+=dt*.00018;
        hoop.rotation.z+=dt*.00012;
      });
    }
    scene.metadata={civilization3dDungeon:{kind:mode,world,phase,remaining:count,unlocked:modeUnlocked,visibleModes,arenaRank,arenaPosition,bountyTier,visualOnly:true,readOnly:true}};
    return scene;
  }

  /* B13: readonly higher arena, mirror record and void floor holograms. */
  function createDungeonAdvancedScene(args){
    const B=args.BABYLON,scene=new B.Scene(args.engine);
    const kind=["higher-arena","mirror","void"].includes(args.advancedKind)?args.advancedKind:"mirror";
    const color=kind==="higher-arena"?[.22,.84,.87]:kind==="mirror"?[.72,.49,.92]:[.35,.63,.94];
    scene.clearColor=new B.Color4(.012,.014,.04,1);
    const camera=new B.ArcRotateCamera("advanced-dungeon-camera",Math.PI/2.3,Math.PI/2.8,13,new B.Vector3(0,.25,0),scene);
    configureDisplayCamera(camera,args.canvas,8,20);
    new B.HemisphericLight("advanced-dungeon-light",new B.Vector3(0,1,0),scene).intensity=.86;
    const metal=new B.StandardMaterial("advanced-dungeon-metal",scene);metal.diffuseColor=new B.Color3(.12,.17,.24);
    const glow=new B.StandardMaterial("advanced-dungeon-glow",scene);glow.emissiveColor=new B.Color3(...color);
    const dim=new B.StandardMaterial("advanced-dungeon-dim",scene);dim.diffuseColor=new B.Color3(.11,.14,.18);
    const floor=B.MeshBuilder.CreateCylinder("advanced-dungeon-platform",{diameter:9,height:.3,tessellation:48},scene);
    floor.position.y=-.75;floor.material=metal;
    const portal=B.MeshBuilder.CreateTorus("advanced-dungeon-outer-ring",{diameter:8.5,thickness:.07,tessellation:56},scene);
    portal.position.y=-.52;portal.rotation.x=Math.PI/2;portal.material=glow;
    const count=kind==="higher-arena"?3:kind==="mirror"?6:8;
    const stage=Math.max(0,Math.floor(Number(args.advancedStage)||0));
    const value=Math.max(0,Math.floor(Number(args.advancedProgress)||0));
    const maximum=kind==="higher-arena"?3:kind==="mirror"?20:Math.max(1,value+1);
    const ratio=kind==="void"?Math.min(1,value/Math.max(100,value+1)):Math.min(1,value/maximum);
    const nodes=[];
    for(let i=0;i<count;i++){
      const theta=2*Math.PI*i/count;
      const x=Math.cos(theta)*3.2,z=Math.sin(theta)*3.2;
      const active=kind==="higher-arena"?i<=Math.min(2,stage):i/Math.max(1,count-1)<=ratio;
      const foundation=B.MeshBuilder.CreateCylinder("advanced-dungeon-base-"+i,{diameter:.92,height:.24,tessellation:18},scene);
      foundation.position.set(x,-.32,z);foundation.material=metal;
      const shard=B.MeshBuilder.CreatePolyhedron("advanced-dungeon-node-"+i,{type:2,size:active?.53:.29},scene);
      shard.position.set(x,active?.45:.14,z);shard.material=active?glow:dim;nodes.push(shard);
    }
    const center=B.MeshBuilder.CreatePolyhedron("advanced-dungeon-core-"+kind,{type:2,size:kind==="higher-arena"?1.3:1},scene);
    center.position.y=1.2;center.material=glow;
    if(kind==="higher-arena"){
      const varied=args.higherArenaMode==="varied";
      for(let i=0;i<3;i++){
        const marker=B.MeshBuilder.CreatePolyhedron("advanced-arena-opponent-"+i,{type:1,size:varied?.34:.26},scene);
        marker.position.set((i-1)*1.55,1.45,-1.5);
        marker.material=varied?(i%2?dim:glow):glow;
      }
    }
    if(kind==="mirror"){
      const reflection=B.MeshBuilder.CreatePolyhedron("advanced-dungeon-reflection",{type:2,size:1},scene);
      reflection.position.set(0,1.2,-2.1);reflection.material=dim;
      const mirror=B.MeshBuilder.CreateBox("advanced-mirror-plane",{width:3.3,height:2.75,depth:.09},scene);
      mirror.position.set(0,1.02,-2.5);mirror.material=glow;
      const opposite=B.MeshBuilder.CreatePolyhedron("advanced-mirror-opponent",{type:2,size:.85},scene);
      opposite.position.set(0,1.05,-2.16);opposite.material=dim;
    }else if(kind==="void"){
      for(let i=0;i<5;i++){
        const step=B.MeshBuilder.CreateBox("advanced-void-depth-"+i,{width:1.9-i*.19,height:.16,depth:.85},scene);
        step.position.set(0,-.33+i*.48,-2.2+i*.6);
        step.material=i/5<=ratio?glow:dim;
      }
    }else{
      for(let i=0;i<3;i++){
        const standard=B.MeshBuilder.CreateBox("advanced-arena-standard-"+i,{width:.16,height:1.1,depth:.18},scene);
        standard.position.set((i-1)*2.2,.44,-2.2);standard.material=i<=stage?glow:dim;
      }
    }
    scene.onBeforeRenderObservable.add(()=>{const dt=Math.min(args.engine.getDeltaTime(),50);center.rotation.y+=dt*.0002;});
    scene.metadata={civilization3dAdvanced:{kind,progress:value,stage,higherArenaMode:args.higherArenaMode||"fixed",unlocked:args.advancedUnlocked===true,visualOnly:true,readOnly:true}};
    return scene;
  }

  /* B14 readonly civilization calamity seals and alternate-frontier depth visual. */
  function createFrontierScene(args){
    const B=args.BABYLON,scene=new B.Scene(args.engine),mode=args.frontierKind==="alternate"?"alternate":"calamity";
    const world=Math.max(1,Math.min(3,Number(args.world)||1));
    const progress=Math.max(0,Math.min(mode==="alternate"?1000:10,Number(args.frontierProgress)||0));
    scene.clearColor=new B.Color4(.012,.016,world===2?.075:.05,1);
    const cam=new B.ArcRotateCamera("frontier-camera",Math.PI/2.35,Math.PI/2.75,14,new B.Vector3(0,.2,0),scene);
    cam.lowerRadiusLimit=7;cam.upperRadiusLimit=23;cam.attachControl(args.canvas,true);
    new B.HemisphericLight("frontier-light",new B.Vector3(0,1,0),scene).intensity=.88;
    const make=(name,c,glow=false)=>{const m=new B.StandardMaterial(name,scene);if(glow)m.emissiveColor=new B.Color3(...c);else m.diffuseColor=new B.Color3(...c);return m;};
    const iron=make("frontier-metal",[.12,.17,.25]),sealed=make("frontier-sealed",[.11,.13,.2]);
    const active=make("frontier-active",world===2?[.5,.3,.87]:[.18,.73,.9],true);
    const complete=make("frontier-complete",[.83,.61,.25],true);
    const ground=B.MeshBuilder.CreateCylinder("frontier-ground",{diameter:10.6,height:.3,tessellation:48},scene);
    ground.position.y=-.7;ground.material=iron;
    if(mode==="alternate"){
      // Visual identity is owned by the formal universe culture table, never U-number modulo.
      const universe=Math.max(1,Math.min(200,Math.floor(Number(args.alternateUniverse)||Math.min(200,Math.floor(progress/5)+1))));
      const depth=Math.max(1,Math.min(5,Math.floor(Number(args.alternateDepth)||Math.floor(progress%5)+1)));
      const segment=Math.ceil(universe/10),first=(segment-1)*10+1,selected=universe-first;
      const cultures=global.ALTERNATE_UNIVERSE_CULTURES||[];
      const rows=global.ALTERNATE_UNIVERSE_NAME_CULTURES||[];
      const names=global.ALTERNATE_UNIVERSE_NAMES||[];
      const culture=rows[universe-1]||"";
      const cultureIndex=Math.max(0,cultures.indexOf(culture));
      const cultureMembers=rows.map((v,i)=>v===culture?i+1:0).filter(Boolean);
      const cultureTier=Math.max(1,cultureMembers.indexOf(universe)+1);
      const seed=n=>((n*73+universe*131)%997)/997;
      // Twenty distinct chromatic identities; culture tiers vary texture and density, not battle strength.
      const palettes=[
        [.42,.75,.98],[.98,.39,.13],[.52,.72,1],[.34,.50,.74],[.12,.65,.88],
        [.29,.84,.43],[.73,.42,.96],[.36,.82,.92],[.81,.59,.93],[.47,.59,.99],
        [.95,.48,.26],[.94,.75,.34],[.57,.28,.77],[.74,.48,.92],[.96,.88,.54],
        [.73,.23,.39],[.78,.64,.42],[.95,.67,.30],[.38,.85,.61],[.60,.83,.98]
      ];
      const tint=palettes[cultureIndex],luminosity=.61+depth*.09+cultureTier*.018;
      const accent=make("alternate-accent-"+universe,tint.map(v=>Math.min(1,v*luminosity)),true);
      const depthAccent=make("alternate-depth-focus-"+universe,tint.map(v=>Math.min(1,v*(.8+depth*.085))),true);
      scene.clearColor=new B.Color4(.008+cultureIndex%4*.003,.014,.042+depth*.003,1);
      const motif=cultureIndex%5;
      const shape=(name,size,variant)=>{
        if(variant===0)return B.MeshBuilder.CreateSphere(name,{diameter:size*1.65,segments:12},scene);
        if(variant===1)return B.MeshBuilder.CreatePolyhedron(name,{type:2,size},scene);
        if(variant===2)return B.MeshBuilder.CreateCylinder(name,{height:size*1.9,diameterTop:size*.5,diameterBottom:size*1.3,tessellation:6+cultureIndex%4},scene);
        if(variant===3)return B.MeshBuilder.CreateBox(name,{size:size*1.46},scene);
        return B.MeshBuilder.CreateTorus(name,{diameter:size*1.9,thickness:size*.28,tessellation:16+cultureIndex%4*4},scene);
      };
      for(let i=0;i<10;i++){
        const number=first+i,theta=2*Math.PI*i/10,x=Math.cos(theta)*3.8,z=Math.sin(theta)*3.8;
        const cleared=progress>=number*5,focused=i===selected;
        const rowCulture=rows[number-1]||"",rowIndex=Math.max(0,cultures.indexOf(rowCulture));
        const size=focused?.75+(cultureTier-1)*.025:cleared?.54:.43;
        const node=shape("alternate-universe-"+number,size,rowIndex%5);
        node.position.set(x,focused?.5:.18,z);
        node.rotation.y=seed(number)*Math.PI;
        node.material=focused?accent:cleared?complete:sealed;
        const ring=B.MeshBuilder.CreateTorus("alternate-universe-ring-"+number,{diameter:focused?1.55:1.15,thickness:.05,tessellation:24},scene);
        ring.position.set(x,-.38,z);ring.rotation.x=Math.PI/2;ring.material=focused?accent:cleared?complete:sealed;
      }
      // Depth always progresses from stable outer structure to denser, brighter inner pressure.
      for(let i=1;i<=5;i++){
        const cleared=progress>=(universe-1)*5+i,focused=i===depth;
        const layer=B.MeshBuilder.CreateTorus("alternate-depth-"+i,{diameter:.7+i*.42,thickness:focused?.12:.045,tessellation:32},scene);
        layer.rotation.x=Math.PI/2;layer.position.y=.10+(i-1)*.15;
        layer.material=focused?depthAccent:cleared?complete:sealed;
        if(i<=depth){
          const spire=B.MeshBuilder.CreateCylinder("alternate-depth-signal-"+i,{height:.27+i*.09,diameterTop:.055,diameterBottom:.15,tessellation:5},scene);
          const angle=2*Math.PI*(i-1)/5;
          spire.position.set(Math.cos(angle)*(1.25+i*.14),.08,Math.sin(angle)*(1.25+i*.14));
          spire.material=i===depth?depthAccent:accent;
        }
      }
      // Culture-specific geometry plus tier-based embellishment, under bounded mesh counts.
      const core=shape("alternate-selected-core",.88+cultureTier*.075,motif);
      for(let i=0;i<Math.min(10,cultureTier);i++){
        const theta=2*Math.PI*i/Math.min(10,cultureTier);
        const relic=shape("alternate-culture-relic-"+i,.11+cultureTier*.009,(motif+i)%5);
        relic.position.set(Math.cos(theta)*(.8+cultureTier*.045),.7+Math.sin(i*1.7)*.22,Math.sin(theta)*(.8+cultureTier*.045));
        relic.material=accent;
      }
      core.position.y=1.35;core.material=accent;
      for(let i=0;i<depth;i++){
        const theta=2*Math.PI*i/Math.max(3,depth),satellite=B.MeshBuilder.CreateSphere("alternate-energy-"+i,{diameter:.10+.035*depth,segments:6},scene);
        satellite.position.set(Math.cos(theta)*(1.05+depth*.11),1.3+Math.sin(i*2.1)*.4,Math.sin(theta)*(1.05+depth*.11));
        satellite.material=depthAccent;
      }
      scene.onBeforeRenderObservable.add(()=>{core.rotation.y+=Math.min(args.engine.getDeltaTime(),50)*(.00009+depth*.000022+cultureTier*.000009);});
      scene.metadata={civilization3dFrontier:{mode,world,progress,segment,universe,universeName:names[universe-1]||"",culture,cultureIndex,cultureTier,depth,firstUniverse:first,lastUniverse:first+9,review:args.frontierReview===true,visualOnly:true}};
      return scene;
    }
    const seals=Array.isArray(args.calamitySeals)?args.calamitySeals.slice(0,10):null;
    const count=mode==="calamity"?10:12;
    for(let i=0;i<count;i++){
      const theta=2*Math.PI*i/count,x=Math.cos(theta)*3.75,z=Math.sin(theta)*3.75;
      const item=mode==="calamity"?seals?.[i]:null;
      const reached=item?item.completed===true:mode==="calamity"?i<progress:i<Math.ceil(progress/1000*count);
      const visible=item?item.visible!==false:true;
      const open=item?item.unlocked===true:false;
      const material=reached?complete:open?active:sealed;
      const node=B.MeshBuilder.CreatePolyhedron("frontier-seal-"+i,{type:2,size:reached?.61:open?.53:.43},scene);
      node.position.set(x,.18,z);node.material=visible?material:sealed;
      const ring=B.MeshBuilder.CreateTorus("frontier-ring-"+i,{diameter:1.25,thickness:.045,tessellation:26},scene);
      ring.position.set(x,-.38,z);ring.rotation.x=Math.PI/2;ring.material=visible?material:sealed;
    }
    const core=B.MeshBuilder.CreatePolyhedron("frontier-central-core",{type:2,size:1.25},scene);
    core.position.set(0,1,-.2);core.material=active;
    scene.onBeforeRenderObservable.add(()=>{core.rotation.y+=Math.min(args.engine.getDeltaTime(),50)*.00016;});
    scene.metadata={civilization3dFrontier:{mode,world,progress,review:args.frontierReview===true,sealStates:seals?seals.map(v=>({...v})):null,visualOnly:true,readOnly:true}};
    return scene;
  }

  /* B15: read-only battlefield, shield and settlement presentation. */
  function createBattlePresentationScene(args){
    const B=args.BABYLON,scene=new B.Scene(args.engine);
    const mode=["battle","shield","settlement","encounter"].includes(args.battleVisualKind)?args.battleVisualKind:"battle";
    scene.clearColor=new B.Color4(.015,.02,.05,1);
    const camera=new B.ArcRotateCamera("battle-presentation-camera",Math.PI/2.25,Math.PI/2.7,12,new B.Vector3(0,.3,0),scene);
    camera.lowerRadiusLimit=7;camera.upperRadiusLimit=19;camera.attachControl(args.canvas,true);
    new B.HemisphericLight("battle-presentation-light",new B.Vector3(0,1,0),scene).intensity=.82;
    const mat=(name,c,emissive=false)=>{const m=new B.StandardMaterial(name,scene);if(emissive)m.emissiveColor=new B.Color3(...c);else m.diffuseColor=new B.Color3(...c);return m;};
    const metal=mat("battle-platform",[.12,.18,.26]),blue=mat("battle-player",[.15,.72,.95],true);
    const red=mat("battle-enemy",[.94,.28,.42],true),white=mat("battle-shield",[.85,.96,1],true),gold=mat("battle-reward",[.96,.69,.23],true);
    const floor=B.MeshBuilder.CreateCylinder("battle-stage",{diameter:9.8,height:.35,tessellation:48},scene);floor.position.y=-.75;floor.material=metal;
    if(mode==="settlement"){
      for(let i=0;i<5;i++){
        const x=(i-2)*1.45,loot=B.MeshBuilder.CreatePolyhedron("battle-loot-"+i,{type:2,size:.4+(i%2)*.18},scene);
        loot.position.set(x,.4,0);loot.material=i%2?gold:blue;
      }
    }else{
      for(const [i,x,m] of [[0,-2.7,blue],[1,2.7,red]]){
        const figure=B.MeshBuilder.CreateCapsule("battle-combatant-"+i,{radius:.52,height:2.4,tessellation:16},scene);
        figure.position.set(x,.65,0);figure.material=m;
        const hp=Math.max(0,Math.min(1,Number(i?args.enemyHpRatio:args.playerHpRatio) || 0));
        const bar=B.MeshBuilder.CreateBox("battle-hp-"+i,{width:1.6*Math.max(.025,hp),height:.1,depth:.12},scene);
        bar.position.set(x,2.4,0);bar.material=m;
      }
      if(mode==="shield"||Number(args.shieldRatio)>0){
        const shield=B.MeshBuilder.CreateSphere("battle-shield-shell",{diameter:3,segments:20},scene);
        shield.position.set(-2.7,.7,0);shield.scaling.set(.75,1,.8);shield.visibility=.22;shield.material=white;
      }
      if(mode==="encounter"){
        const beacon=B.MeshBuilder.CreateTorus("battle-special-beacon",{diameter:2.1,thickness:.12,tessellation:36},scene);
        beacon.position.set(2.7,1,0);beacon.material=gold;
      }
    }
    scene.metadata={civilization3dBattlePresentation:{kind:mode,visualOnly:true}};
    return scene;
  }
  /* Batch 16: display-only chronicle and reincarnation visual compositions. */
  function createChronicleTransitionScene(args={}){
    const B=args.BABYLON,scene=new B.Scene(args.engine);
    const kind=["record","story","reincarnation"].includes(args.kind)?args.kind:"record";
    scene.clearColor=new B.Color4(.008,.019,.045,1);
    const camera=new B.ArcRotateCamera("chronicle-camera",Math.PI/2,Math.PI/2.6,9,new B.Vector3(0,0,0),scene);
    camera.attachControl(args.canvas,true);
    new B.HemisphericLight("chronicle-fill",new B.Vector3(0,1,0),scene).intensity=.8;
    const material=(n,c)=>{const m=new B.StandardMaterial(n,scene);m.diffuseColor=new B.Color3(...c);m.emissiveColor=new B.Color3(...c).scale(.35);return m;};
    const steel=material("chronicle-steel",[.11,.23,.38]),cyan=material("chronicle-cyan",[.13,.72,.89]),gold=material("chronicle-gold",[.84,.61,.24]);
    const base=B.MeshBuilder.CreateCylinder("chronicle-base",{diameter:7.5,height:.3,tessellation:48},scene);base.position.y=-1.15;base.material=steel;
    for(let i=0;i<5;i++){
      const slab=B.MeshBuilder.CreateBox("chronicle-page-"+i,{width:1.1,height:1.6,depth:.14},scene);
      slab.position.set((i-2)*1.25,-.1,kind==="story"?Math.abs(i-2)*.32:0);
      slab.rotation.y=kind==="story"?(i-2)*.18:0;slab.material=i===2?gold:cyan;
    }
    if(kind==="reincarnation"){
      const ring=B.MeshBuilder.CreateTorus("reincarnation-cycle",{diameter:5.7,thickness:.12,tessellation:64},scene);
      ring.rotation.x=Math.PI/2.8;ring.position.y=.2;ring.material=gold;
      const core=B.MeshBuilder.CreatePolyhedron("reincarnation-core",{type:2,size:.8},scene);
      core.position.y=.35;core.material=cyan;
    }
    scene.metadata={civilization3dChronicle:{kind,visualOnly:true,readOnly:true}};
    return scene;
  }
  /* B17-B: visual-only service consoles; account, cloud, and GM tools stay in HTML. */
  // Shared Babylon styling helper for visual-only ceremonial/utility scenes.
  function visualMaterial(B,scene,name,rgb,glow=0){
    const material=new B.StandardMaterial(name,scene);
    material.diffuseColor=new B.Color3(...rgb);
    if(glow>0)material.emissiveColor=new B.Color3(...rgb).scale(glow);
    return material;
  }
  function createServiceConsoleScene(args={}){
    const B=args.BABYLON,scene=new B.Scene(args.engine);
    const kind=["settings","guide","account","cloud","gm"].includes(args.kind)?args.kind:"settings";
    const hue={settings:[.18,.65,.98],guide:[.72,.54,.96],account:[.18,.87,.75],cloud:[.36,.69,1],gm:[.95,.7,.29]}[kind];
    scene.clearColor=new B.Color4(.012,.022,.053,1);
    const camera=new B.ArcRotateCamera("service-camera",Math.PI/2.2,Math.PI/2.65,10,new B.Vector3(0,.25,0),scene);
    camera.attachControl(args.canvas,true);
    new B.HemisphericLight("service-ambient",new B.Vector3(0,1,0),scene).intensity=.8;
    const mat=(name,color,glow=false)=>visualMaterial(B,scene,name,color,glow?.45:0);
    const metal=mat("service-metal",[.12,.2,.31]),accent=mat("service-accent",hue,true);
    const base=B.MeshBuilder.CreateCylinder("service-base",{diameter:7.5,height:.34,tessellation:48},scene);base.position.y=-1.2;base.material=metal;
    const count=kind==="gm"?5:kind==="cloud"?3:kind==="guide"?4:kind==="account"?2:3;
    for(let i=0;i<count;i++){
      const panel=B.MeshBuilder.CreateBox("service-panel-"+i,{width:1.2,height:2,depth:.12},scene);
      panel.position.set((i-(count-1)/2)*1.35,.15,-.2-Math.abs(i-(count-1)/2)*.2);panel.rotation.y=(i-(count-1)/2)*.13;
      panel.material=i===Math.floor(count/2)?accent:metal;
      const sig=B.MeshBuilder.CreateBox("service-signal-"+i,{width:.75,height:.12,depth:.16},scene);
      sig.position.set(panel.position.x,.5,panel.position.z+.12);sig.material=accent;
    }
    const orbit=B.MeshBuilder.CreateTorus("service-orbit",{diameter:6,thickness:.07,tessellation:56},scene);
    orbit.rotation.x=Math.PI/2;orbit.position.y=-.76;orbit.material=accent;
    scene.metadata={civilization3dService:{kind,readOnly:true,visualOnly:true}};
    return scene;
  }
  global.Civilization3DPrototype=Object.freeze({version:"0.23.2",supported,mount,createScene,createEpochScene,createGalaxyScene,createUniverseScene,createHigherDimensionalScene,createCharacterScene,createEquipmentScene,createForgeScene,createGrowthScene,createDungeonScene,createDungeonAdvancedScene,createFrontierScene,createBattlePresentationScene,createChronicleTransitionScene,createServiceConsoleScene});
})(window);
