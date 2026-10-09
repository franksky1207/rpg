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
  global.Civilization3DPrototype=Object.freeze({version:"0.6.0",supported,mount,createScene,createEpochScene,createGalaxyScene,createUniverseScene});
})(window);
