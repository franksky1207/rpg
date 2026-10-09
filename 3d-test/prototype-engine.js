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
  global.Civilization3DPrototype=Object.freeze({version:VERSION,supported,mount});
})(window);
