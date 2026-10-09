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
  function createEpochScene(args){
    const scene=createScene(args),B=args.BABYLON;
    const world=Number(args.world)||1;
    const color=world===3?new B.Color3(.48,.23,.83):world===2?new B.Color3(.1,.52,.68):new B.Color3(.11,.39,.79);
    scene.clearColor=world===3?new B.Color4(.035,.015,.075,1):world===2?new B.Color4(.01,.035,.055,1):new B.Color4(.015,.026,.065,1);
    const portal=B.MeshBuilder.CreateTorus("epoch-gateway",{diameter:6,thickness:.12,tessellation:80},scene);
    portal.rotation.y=Math.PI/3;portal.position.y=.2;
    const portalMat=new B.StandardMaterial("epoch-gateway-light",scene);
    portalMat.emissiveColor=color;portal.material=portalMat;
    scene.onBeforeRenderObservable.add(()=>{portal.rotation.z+=Math.min(args.engine.getDeltaTime(),50)*.00012;});
    return scene;
  }
  /* Decorative 3D map. The actual map/monster/target buttons stay in ui.js. */
  function createGalaxyScene(args){
    const B=args.BABYLON,scene=new B.Scene(args.engine);
    scene.clearColor=new B.Color4(.004,.014,.044,1);
    const camera=new B.ArcRotateCamera("galaxy-map-camera",Math.PI/2.15,Math.PI/2.75,14,new B.Vector3(0,0,0),scene);
    camera.lowerRadiusLimit=9;camera.upperRadiusLimit=21;camera.attachControl(args.canvas,true);
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
    for(let i=0;i<points;i++){
      const angle=2*Math.PI*i/points;
      const x=4.2*Math.cos(angle),z=4.2*Math.sin(angle);
      const node=B.MeshBuilder.CreateSphere("region-"+(i+1),{diameter:i===selected?.92:.55,segments:16},scene);
      node.position.set(x,Math.sin(angle*3)*.35,z);
      node.material=(!unlockedRegions||unlockedRegions[i]===true)?glowColor:dimColor;
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
    camera.lowerRadiusLimit=11;camera.upperRadiusLimit=30;camera.attachControl(args.canvas,true);
    new B.HemisphericLight("universe-light",new B.Vector3(0,1,0),scene).intensity=.7;
    const lit=new B.StandardMaterial("universe-lit",scene);lit.emissiveColor=new B.Color3(.24,.52,.96);
    const won=new B.StandardMaterial("universe-won",scene);won.emissiveColor=new B.Color3(.1,.76,.65);
    const dim=new B.StandardMaterial("universe-dim",scene);dim.diffuseColor=new B.Color3(.07,.08,.15);
    const bossMat=new B.StandardMaterial("universe-boss-mat",scene);bossMat.emissiveColor=new B.Color3(.63,.28,.9);
    const progress=Math.max(0,Math.min(100,Math.floor(Number(args.clearedBossCount)||0)));
    const highest=Math.max(0,Math.min(99,Math.floor(Number(args.highestUnlockedBossIndex)||0)));
    const selected=Math.max(0,Math.min(9,Math.floor(Number(args.selectedMap)||0)));
    const review=args.review===true;
    const core=B.MeshBuilder.CreatePolyhedron("universe-core",{type:2,size:1.1},scene);core.material=lit;
    for(let i=0;i<10;i++){
      const a=Math.PI*2*i/10,x=Math.cos(a)*6.4,z=Math.sin(a)*6.4;
      const node=B.MeshBuilder.CreateSphere("universe-region-"+(i+1),{diameter:i===selected?1:.7,segments:14},scene);
      node.position.set(x,.25*Math.sin(a*3),z);node.material=i*10+9<progress?won:review||i*10<=highest?lit:dim;
      const line=B.MeshBuilder.CreateLines("universe-link-"+i,{points:[new B.Vector3(0,0,0),node.position.clone()]},scene);
      line.color=review||i*10<=highest?new B.Color3(.22,.44,.72):new B.Color3(.1,.1,.17);
      for(let j=0;j<10;j++){
        const t=Math.PI*2*j/10,index=i*10+j;
        const marker=B.MeshBuilder.CreatePolyhedron("universe-boss-"+(index+1),{type:1,size:.13},scene);
        marker.position.set(x+Math.cos(t)*1.27,.5+Math.sin(t*2)*.17,z+Math.sin(t)*1.27);
        marker.material=index<progress?won:review||index<=highest?bossMat:dim;
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
    camera.lowerRadiusLimit=9;camera.upperRadiusLimit=27;camera.attachControl(args.canvas,true);
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
      const route=B.MeshBuilder.CreateLines("higher-route-"+i,{points:[new B.Vector3(0,0,0),new B.Vector3(x,-.65,z)]},scene);
      route.color=available?new B.Color3(.4,.2,.64):new B.Color3(.12,.1,.2);
    }
    const orbit=B.MeshBuilder.CreateTorus("higher-dimensional-orbit",{diameter:10.5,thickness:.035,tessellation:80},scene);
    orbit.rotation.x=Math.PI/2;orbit.material=ready;
    scene.onBeforeRenderObservable.add(()=>{const dt=Math.min(50,args.engine.getDeltaTime());core.rotation.y+=dt*.00025;orbit.rotation.z+=dt*.000022;});
    return scene;
  }

  /* B08: visual-only full-body character stand-in; no equipment/save mutation. */
  function createCharacterScene(args){
    const B=args.BABYLON,scene=new B.Scene(args.engine);
    scene.clearColor=new B.Color4(.015,.02,.045,1);
    const camera=new B.ArcRotateCamera("character-camera",Math.PI/2.25,Math.PI/2.5,8.5,new B.Vector3(0,1.05,0),scene);
    camera.lowerRadiusLimit=5;camera.upperRadiusLimit=13;camera.attachControl(args.canvas,true);
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
    camera.lowerRadiusLimit=7;camera.upperRadiusLimit=21;camera.attachControl(args.canvas,true);
    new B.HemisphericLight("equipment-light",new B.Vector3(0,1,0),scene).intensity=.85;
    const slots=Array.isArray(args.slots)?args.slots.slice(0,5):[];
    const cases=Array.isArray(args.inventorySamples)?args.inventorySamples.slice(0,5):[];
    const color=(item)=>{
      const quality=Math.max(0,Math.min(5,Math.floor(Number(item?.quality)||0)));
      const shades=[[.13,.23,.37],[.22,.44,.58],[.22,.64,.48],[.58,.4,.8],[.84,.61,.25],[.93,.36,.53]];
      const mat=new B.StandardMaterial("equipment-mat-"+quality+"-"+(item?.present?"equipped":"empty"),scene);
      mat.emissiveColor=new B.Color3(...(item?.present?shades[quality]:[.09,.11,.15]));
      return mat;
    };
    const base=new B.StandardMaterial("equipment-base",scene);base.diffuseColor=new B.Color3(.11,.16,.27);
    for(let i=0;i<5;i++){
      const item=slots[i]||{},x=(i-2)*2.2;
      const pedestal=B.MeshBuilder.CreateCylinder("equipment-slot-base-"+i,{diameter:1.7,height:.26,tessellation:24},scene);
      pedestal.position.set(x,-.55,0);pedestal.material=base;
      const relic=B.MeshBuilder.CreatePolyhedron("equipment-slot-"+i,{type:i%2?1:2,size:item.present?.56:.28},scene);
      relic.position.set(x,.45,0);relic.material=color(item);
      const ring=B.MeshBuilder.CreateTorus("equipment-slot-ring-"+i,{diameter:1.8,thickness:.045,tessellation:32},scene);
      ring.position.set(x,-.37,0);ring.rotation.x=Math.PI/2;ring.material=relic.material;
      const sample=cases[i]||{};
      const sampleMesh=B.MeshBuilder.CreateSphere("equipment-inventory-sample-"+i,{diameter:sample.present?.4:.16,segments:12},scene);
      sampleMesh.position.set(x,-.1,2);sampleMesh.material=color(sample);
    }
    scene.onBeforeRenderObservable.add(()=>{const dt=Math.min(args.engine.getDeltaTime(),50);scene.meshes.forEach(mesh=>{if(mesh.name.startsWith("equipment-slot-")&&!mesh.name.includes("ring")&&!mesh.name.includes("base"))mesh.rotation.y+=dt*.00012;});});
    return scene;
  }

  /* B10: read-only five-slot forge. Formal transaction and cost confirmation remain in enhancementui.js. */
  function createForgeScene(args){
    const B=args.BABYLON,scene=new B.Scene(args.engine);
    scene.clearColor=new B.Color4(.025,.021,.022,1);
    const camera=new B.ArcRotateCamera("forge-camera",Math.PI/2.3,Math.PI/2.85,13.7,new B.Vector3(0,.35,0),scene);
    camera.lowerRadiusLimit=8;camera.upperRadiusLimit=22;camera.attachControl(args.canvas,true);
    new B.HemisphericLight("forge-light",new B.Vector3(0,1,0),scene).intensity=.9;
    const iron=new B.StandardMaterial("forge-iron",scene);iron.diffuseColor=new B.Color3(.16,.18,.21);
    const gold=new B.StandardMaterial("forge-gold",scene);gold.emissiveColor=new B.Color3(.7,.46,.16);
    const capped=new B.StandardMaterial("forge-max",scene);capped.emissiveColor=new B.Color3(.19,.66,.52);
    const blocked=new B.StandardMaterial("forge-blocked",scene);blocked.diffuseColor=new B.Color3(.12,.12,.14);
    const slots=Array.isArray(args.slots)?args.slots.slice(0,5):[];
    const cap=Math.max(1,Math.floor(Number(args.cap)||20));
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
      const ring=B.MeshBuilder.CreateTorus("forge-ring-"+i,{diameter:1.5,thickness:.045,tessellation:32},scene);
      ring.rotation.x=Math.PI/2;ring.position.set(x,-.39,0);ring.material=mat;
    }
    const core=B.MeshBuilder.CreateCylinder("forge-central-core",{diameter:1.1,height:.25,tessellation:36},scene);
    core.position.set(0,-.63,-2.35);core.material=iron;
    scene.onBeforeRenderObservable.add(()=>{const dt=Math.min(args.engine.getDeltaTime(),50);for(const mesh of scene.meshes){if(mesh.name.startsWith("forge-energy-"))mesh.rotation.y+=dt*.00015;}});
    return scene;
  }

  /* B11: four read-only growth installations. Numbers are presentation snapshots only. */
  function createGrowthScene(args){
    const B=args.BABYLON,scene=new B.Scene(args.engine);
    const kind=["specialization","marks","civilization","core"].includes(args.growthKind)?args.growthKind:"specialization";
    const palettes={specialization:[.11,.66,.86],marks:[.66,.36,.91],civilization:[.25,.85,.68],core:[.88,.57,.22]};
    const color=palettes[kind];scene.clearColor=new B.Color4(.008,.016,.038,1);
    const camera=new B.ArcRotateCamera("growth-camera",Math.PI/2.3,Math.PI/2.7,kind==="marks"?13:11,new B.Vector3(0,.25,0),scene);
    camera.lowerRadiusLimit=6;camera.upperRadiusLimit=22;camera.attachControl(args.canvas,true);
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
    }
    const center=B.MeshBuilder.CreatePolyhedron("growth-center-"+kind,{type:2,size:kind==="core"?1.35:1},scene);
    center.position.y=.68;center.material=lit;
    const orbit=B.MeshBuilder.CreateTorus("growth-orbit",{diameter:4.3,thickness:.038,tessellation:60},scene);
    orbit.position.y=.55;orbit.rotation.x=Math.PI/2;orbit.material=lit;
    scene.onBeforeRenderObservable.add(()=>{const dt=Math.min(args.engine.getDeltaTime(),50);center.rotation.y+=dt*.00022;orbit.rotation.z+=dt*.00008;});
    return scene;
  }

  /* B12: presentation-only dungeon command center, bounty selection and W1/W2 arena. */
  function createDungeonScene(args){
    const B=args.BABYLON,scene=new B.Scene(args.engine);
    const mode=["hub","bounty","arena"].includes(args.dungeonKind)?args.dungeonKind:"hub";
    const world=Math.max(1,Math.min(2,Number(args.world)||1));
    const phase=["select","ready"].includes(args.dungeonPhase)?args.dungeonPhase:"select";
    scene.clearColor=new B.Color4(world===2?.02:.013,.016,world===2?.053:.038,1);
    const camera=new B.ArcRotateCamera("dungeon-camera",Math.PI/2.18,Math.PI/2.75,mode==="hub"?14.8:13,new B.Vector3(0,.25,0),scene);
    camera.lowerRadiusLimit=7;camera.upperRadiusLimit=23;camera.attachControl(args.canvas,true);
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
    const modeTotal=mode==="hub"?4:mode==="bounty"?5:3;
    const count=Math.max(0,Math.min(40,Math.floor(Number(args.dungeonRemaining)||0)));
    const modeUnlocked=args.dungeonUnlocked!==false;
    for(let i=0;i<modeTotal;i++){
      const angle=(i-(modeTotal-1)/2)*.46;
      const x=Math.sin(angle)*6.8,z=Math.cos(angle)*2.1;
      const active=mode==="hub"?i<2||args.dungeonExtraUnlocked===true:modeUnlocked&&count>0;
      const surface=active?(mode==="arena"?purple:mode==="bounty"?gold:i===0?gold:purple):inactive;
      const disk=B.MeshBuilder.CreateCylinder("dungeon-node-base-"+i,{diameter:1.45,height:.25,tessellation:32},scene);
      disk.position.set(x,-.38,z);disk.material=iron;
      const column=B.MeshBuilder.CreateBox("dungeon-node-"+i,{width:.7,height:mode==="arena"?2.3:1.35,depth:.65},scene);
      column.position.set(x,mode==="arena"?.8:.35,z);column.material=surface;
      const loop=B.MeshBuilder.CreateTorus("dungeon-node-portal-"+i,{diameter:mode==="arena"?2.05:1.42,thickness:.075,tessellation:36},scene);
      loop.position.set(x,mode==="arena"?1.03:.65,z);loop.material=surface;
      if(mode==="arena"){loop.rotation.y=Math.PI/2.9;}else{loop.rotation.x=.18;}
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
    scene.metadata={civilization3dDungeon:{kind:mode,world,phase,remaining:count,unlocked:modeUnlocked}};
    return scene;
  }
  global.Civilization3DPrototype=Object.freeze({version:"0.12.0",supported,mount,createScene,createEpochScene,createGalaxyScene,createUniverseScene,createHigherDimensionalScene,createCharacterScene,createEquipmentScene,createForgeScene,createGrowthScene,createDungeonScene});
})(window);
