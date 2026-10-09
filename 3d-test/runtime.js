/* Civilization 3D Batch 02: independent canvas, scene lifecycle and quality owner.
   Presentation-only; intentionally does not access game state or save. */
(function(global){
"use strict";
const VERSION=2;
const QUALITY=Object.freeze({low:{scale:1.6,hardwareScaling:1.6},medium:{scale:1.25,hardwareScaling:1.25},high:{scale:1,hardwareScaling:1}});
function create(options={}){
  const host=options.host||document.body;
  const root=document.createElement("div");
  root.className="civilization-3d-root";
  root.setAttribute("data-civilization-3d-root","1");
  root.style.cssText="position:relative;width:100%;height:100%;min-height:0;overflow:hidden;isolation:isolate;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)";
  const canvas=document.createElement("canvas");
  canvas.setAttribute("aria-label","文明戰線 3D 場景");
  canvas.style.cssText="display:block;width:100%;height:100%;touch-action:none";
  root.appendChild(canvas);
  host.appendChild(root);
  let epoch=0,scene=null,engine=null,disposed=false,reason="",quality="medium",activeId=null,controller=null,contextLost=false;
  const assets=new Map();
  const qualityFor=q=>QUALITY[q]||QUALITY.medium;
  function resize(){if(!disposed&&engine){engine.resize();}}
  function abortPending(){if(controller){controller.abort();controller=null;}}
  function releaseScene(){
    if(scene){try{scene.dispose();}catch(err){console.warn("3D scene disposal failed",err);}scene=null;}
    activeId=null;
  }
  function stop(reasonText="disabled"){
    epoch++;abortPending();releaseScene();reason=reasonText;
    if(engine){try{engine.stopRenderLoop();engine.dispose();}catch(err){console.warn("3D engine disposal failed",err);}engine=null;}
    canvas.hidden=true;root.dataset.state="fallback";
    return {ok:false,reason};
  }
  function ensureEngine(){
    if(engine)return engine;
    if(!global.BABYLON?.Engine)throw new Error("babylon-unavailable");
    const supported=typeof global.BABYLON.Engine.isSupported==="function"?global.BABYLON.Engine.isSupported():true;
    if(!supported)throw new Error("webgl-unavailable");
    engine=new global.BABYLON.Engine(canvas,true,{preserveDrawingBuffer:false,stencil:true},true);
    engine.setHardwareScalingLevel(qualityFor(quality).hardwareScaling);
    engine.runRenderLoop(()=>{
      if(disposed||!scene||!scene.activeCamera)return;
      try{scene.render();}catch(err){console.error("3D render failed",err);stop("render-failed");options.onFallback?.("render-failed");}
    });
    return engine;
  }
  async function show(id,factory){
    if(disposed)return {ok:false,reason:"disposed"};
    const ticket=++epoch;
    abortPending();controller=new AbortController();
    const signal=controller.signal;
    releaseScene();
    try{
      ensureEngine();
      const next=await factory({BABYLON:global.BABYLON,engine,canvas,epoch:ticket,assets,signal,isCurrent:()=>!disposed&&epoch===ticket&&!signal.aborted});
      if(disposed||epoch!==ticket){next?.dispose?.();return {ok:false,reason:"stale-scene"};}
      if(!next||typeof next.render!=="function")throw new Error("invalid-scene");
      controller=null;scene=next;activeId=String(id);canvas.hidden=false;root.dataset.state="active";
      resize();
      return {ok:true,sceneId:activeId,epoch:ticket};
    }catch(err){
      if(epoch!==ticket||disposed)return {ok:false,reason:"stale-scene"};
      const failure=String(err?.message||"scene-failed");
      stop(failure);options.onFallback?.(failure);
      return {ok:false,reason:failure};
    }
  }
  function setQuality(value){
    if(!QUALITY[value])return false;
    quality=value;
    if(engine){engine.setHardwareScalingLevel(qualityFor(quality).hardwareScaling);resize();}
    return true;
  }
  function dispose(){
    if(disposed)return;
    stop("disposed");disposed=true;
    global.removeEventListener("resize",resize);
    global.visualViewport?.removeEventListener("resize",resize);
    canvas.removeEventListener("webglcontextlost",onContextLost);
    canvas.removeEventListener("webglcontextrestored",onContextRestored);
    root.remove();
    for(const entry of assets.values()){try{entry?.dispose?.();}catch(err){console.warn("3D asset cleanup failed",err);}}
    assets.clear();
  }
  function onContextLost(event){event.preventDefault();contextLost=true;stop("webgl-context-lost");options.onFallback?.("webgl-context-lost");}
  function onContextRestored(){contextLost=false;options.onContextRestored?.();}
  canvas.addEventListener("webglcontextlost",onContextLost,false);
  canvas.addEventListener("webglcontextrestored",onContextRestored,false);
  global.addEventListener("resize",resize);
  global.visualViewport?.addEventListener("resize",resize);
  canvas.hidden=true;
  root.dataset.state="idle";
  return Object.freeze({version:VERSION,root,canvas,show,stop,dispose,setQuality,
    getSnapshot:()=>Object.freeze({disposed,epoch,activeId,quality,hasEngine:!!engine,hasScene:!!scene,reason,assetCount:assets.size,contextLost}),
    cacheAsset:(key,value)=>{if(disposed)return false;const k=String(key);if(assets.has(k)&&assets.get(k)!==value){try{assets.get(k)?.dispose?.();}catch(_){}}assets.set(k,value);return true;},
    clearAssets:()=>{for(const entry of assets.values()){try{entry?.dispose?.();}catch(_){}}assets.clear();}});
}
global.Civilization3DRuntime=Object.freeze({VERSION,QUALITY,create});
})(window);
