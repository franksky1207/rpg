/* Civilization 3D Batch 02: independent canvas, scene lifecycle and quality owner.
   Presentation-only; intentionally does not access game state or save. */
(function(global){
"use strict";
const VERSION=4;
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
  const controls=document.createElement("div");
  controls.className="civilization-3d-camera-controls";
  controls.style.cssText="position:absolute;right:12px;bottom:12px;z-index:5;display:flex;gap:7px;align-items:center;pointer-events:auto";
  const buttons=[["zoom-in","＋","放大鏡頭"],["zoom-out","－","縮小鏡頭"],["reset","⟲","重置視角"]].map(([action,label,title])=>{
    const button=document.createElement("button");
    button.type="button";button.className="civilization-3d-camera-button";
    button.dataset.cameraAction=action;button.textContent=label;button.title=title;
    button.setAttribute("aria-label",title);
    button.style.cssText="min-width:42px;height:42px;padding:0 10px;border:1px solid #6696c4;border-radius:9px;background:#091b30e8;color:#eaf6ff;font:700 22px system-ui;cursor:pointer;touch-action:manipulation";
    controls.appendChild(button);return button;
  });
  root.appendChild(controls);
  const layoutControls=document.createElement("div");
  layoutControls.className="civilization-3d-layout-controls";
  const expandButton=document.createElement("button");
  expandButton.type="button";
  expandButton.className="civilization-3d-layout-button";
  expandButton.setAttribute("aria-label","放大 3D 預覽");
  expandButton.textContent="⛶ 放大視窗";
  const closeButton=document.createElement("button");
  closeButton.type="button";
  closeButton.className="civilization-3d-layout-button";
  closeButton.setAttribute("aria-label","關閉 3D 預覽");
  closeButton.textContent="× 關閉";
  layoutControls.append(expandButton,closeButton);
  root.appendChild(layoutControls);
  let expanded=false;
  function setExpanded(value){
    expanded=!!value;
    host.classList.toggle("civilization-3d-expanded",expanded);
    expandButton.textContent=expanded?"⛶ 還原視窗":"⛶ 放大視窗";
    expandButton.setAttribute("aria-label",expanded?"還原 3D 預覽":"放大 3D 預覽");
    root.dataset.expanded=String(expanded);
    resize();
    if(typeof global.requestAnimationFrame==="function")global.requestAnimationFrame(resize);
  }
  const onExpand=()=>setExpanded(!expanded);
  const onClose=()=>typeof options.onClose==="function"?options.onClose():stop("user-close");
  expandButton.addEventListener("click",onExpand);
  closeButton.addEventListener("click",onClose);
  const onEscape=event=>{if(event.key==="Escape"&&expanded){event.preventDefault();setExpanded(false);}};
  document.addEventListener("keydown",onEscape);
  const preventCanvasWheel=event=>{if(!canvas.hidden&&scene?.activeCamera)event.preventDefault();};
  canvas.addEventListener("wheel",preventCanvasWheel,{passive:false});
  const controlClick=event=>{
    const action=event.currentTarget.dataset.cameraAction;
    const camera=scene?.activeCamera;
    if(!camera||!Number.isFinite(camera.radius))return;
    const low=Number.isFinite(camera.lowerRadiusLimit)&&camera.lowerRadiusLimit>0?camera.lowerRadiusLimit:1;
    const high=Number.isFinite(camera.upperRadiusLimit)&&camera.upperRadiusLimit>low?camera.upperRadiusLimit:100;
    if(action==="reset"){
      const baseline=camera.metadata?.civilization3dInitialCamera;
      if(baseline){camera.radius=baseline.radius;camera.alpha=baseline.alpha;camera.beta=baseline.beta;}
    }else{
      camera.radius=Math.max(low,Math.min(high,camera.radius*(action==="zoom-in"?.82:1.22)));
    }
  };
  buttons.forEach(button=>button.addEventListener("click",controlClick));
  host.appendChild(root);
  let epoch=0,scene=null,engine=null,disposed=false,reason="",quality="medium",activeId=null,controller=null,contextLost=false;
  const assets=new Map();
  const assetRefs=new Map();
  function safelyDisposeAsset(value){try{value?.dispose?.();}catch(err){console.warn("3D asset cleanup failed",err);}}
  function clearAssetCache(){for(const value of assets.values())safelyDisposeAsset(value);assets.clear();assetRefs.clear();}
  function releaseAsset(key){const k=String(key),entry=assetRefs.get(k);if(!entry)return false;entry.count--;if(entry.count<=0){assetRefs.delete(k);if(assets.get(k)===entry.value){assets.delete(k);safelyDisposeAsset(entry.value);}}return true;}
  let resizeObserver=null,renderPaused=false;
  const qualityFor=q=>QUALITY[q]||QUALITY.medium;
  function resize(){if(!disposed&&engine&&!contextLost){engine.resize();}}
  const onVisibility=()=>{renderPaused=document.hidden===true; if(!renderPaused)resize();};
  const onPageHide=()=>{renderPaused=true;};
  const onPageShow=()=>{renderPaused=false;resize();};
  function abortPending(){if(controller){controller.abort();controller=null;}}
  function releaseScene(){
    if(scene){try{scene.dispose();}catch(err){console.warn("3D scene disposal failed",err);}scene=null;}
    activeId=null;
  }
  function stop(reasonText="disabled"){
    epoch++;abortPending();releaseScene();reason=reasonText;
    clearAssetCache();
    if(engine){const previous=engine;engine=null;try{previous.stopRenderLoop();}catch(err){console.warn("3D loop stop failed",err);}try{previous.dispose();}catch(err){console.warn("3D engine disposal failed",err);}}
    canvas.hidden=true;root.dataset.state="fallback";
    return {ok:false,reason};
  }
  function ensureEngine(){
    if(engine)return engine;
    if(contextLost)throw new Error("webgl-context-lost");
    if(!global.BABYLON?.Engine)throw new Error("babylon-unavailable");
    const supported=typeof global.BABYLON.Engine.isSupported==="function"?global.BABYLON.Engine.isSupported():true;
    if(!supported)throw new Error("webgl-unavailable");
    engine=new global.BABYLON.Engine(canvas,true,{preserveDrawingBuffer:false,stencil:true},true);
    engine.setHardwareScalingLevel(qualityFor(quality).hardwareScaling);
    engine.runRenderLoop(()=>{
      if(disposed||renderPaused||contextLost||!scene||!scene.activeCamera)return;
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
      if(disposed||epoch!==ticket||signal.aborted){next?.dispose?.();return {ok:false,reason:"stale-scene"};}
      if(!next||typeof next.render!=="function")throw new Error("invalid-scene");
      if(next.activeCamera&&Number.isFinite(next.activeCamera.radius)){
        const camera=next.activeCamera;
        camera.metadata={...(camera.metadata||{}),civilization3dInitialCamera:{radius:camera.radius,alpha:camera.alpha,beta:camera.beta}};
      }
      controller=null;scene=next;activeId=String(id);canvas.hidden=false;root.dataset.state="active";
      resize();
      return {ok:true,sceneId:activeId,epoch:ticket};
    }catch(err){
      if(epoch!==ticket||disposed||signal.aborted)return {ok:false,reason:"stale-scene"};
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
    disposed=true;stop("disposed");
    global.removeEventListener("resize",resize);
    document.removeEventListener("visibilitychange",onVisibility);
    global.removeEventListener("pagehide",onPageHide);
    global.removeEventListener("pageshow",onPageShow);
    resizeObserver?.disconnect();resizeObserver=null;
    global.visualViewport?.removeEventListener("resize",resize);
    canvas.removeEventListener("webglcontextlost",onContextLost);
    canvas.removeEventListener("webglcontextrestored",onContextRestored);
    setExpanded(false);
    document.removeEventListener("keydown",onEscape);
    expandButton.removeEventListener("click",onExpand);
    closeButton.removeEventListener("click",onClose);
    canvas.removeEventListener("wheel",preventCanvasWheel);
    buttons.forEach(button=>button.removeEventListener("click",controlClick));
    root.remove();
    clearAssetCache();
  }
  function onContextLost(event){event.preventDefault();contextLost=true;stop("webgl-context-lost");options.onFallback?.("webgl-context-lost");}
  function onContextRestored(){if(disposed)return;contextLost=false;reason="webgl-context-restored";root.dataset.state="idle";options.onContextRestored?.();}
  canvas.addEventListener("webglcontextlost",onContextLost,false);
  canvas.addEventListener("webglcontextrestored",onContextRestored,false);
  global.addEventListener("resize",resize);
  document.addEventListener("visibilitychange",onVisibility);
  global.addEventListener("pagehide",onPageHide);
  global.addEventListener("pageshow",onPageShow);
  renderPaused=document.hidden===true;
  if(typeof global.ResizeObserver==="function"){resizeObserver=new global.ResizeObserver(()=>resize());resizeObserver.observe(host);}
  global.visualViewport?.addEventListener("resize",resize);
  canvas.hidden=true;
  root.dataset.state="idle";
  return Object.freeze({version:VERSION,root,canvas,show,stop,dispose,setQuality,setExpanded,resize,
    getSnapshot:()=>Object.freeze({disposed,epoch,activeId,quality,hasEngine:!!engine,hasScene:!!scene,reason,assetCount:assets.size,leasedAssetCount:assetRefs.size,contextLost,renderPaused}),
    cacheAsset:(key,value)=>{if(disposed)return false;const k=String(key);if(assetRefs.has(k))return assets.get(k)===value;if(assets.has(k)&&assets.get(k)!==value)safelyDisposeAsset(assets.get(k));assets.set(k,value);return true;},
    acquireAsset:(key,factory)=>{if(disposed)return null;const k=String(key);let entry=assetRefs.get(k);if(entry){entry.count++;return entry.value;}const value=assets.has(k)?assets.get(k):typeof factory==="function"?factory():null;if(!value)return null;assets.set(k,value);assetRefs.set(k,{value,count:1});return value;},
    releaseAsset,clearAssets:clearAssetCache});
}
global.Civilization3DRuntime=Object.freeze({VERSION,QUALITY,create});
})(window);
