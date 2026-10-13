/* Formal integration entry. No automatic release, preload, save migration or GM fixture. */
(function(global){
"use strict";
if(global.CivilizationFormalBEntry)return;
let active=null,routeDispose=null;
function retireScene(){active?.dispose();active=null;}
function dispose(){const close=routeDispose;routeDispose=null;close?.();retireScene();}
function mount(options){
 if(!options?.host||typeof options.resolve!=="function")throw Error("missing-approved-formal-resolver");
 retireScene();
 let notice=null;
 const clearNotice=()=>{notice?.remove();notice=null;};
 const clock=global.CivilizationFormalBOwnerClock.create();
 const controller=global.CivilizationFormalBController.create({
  host:options.host,clock,
  resolve:async(frame,signal)=>{
   await global.Civilization3DLoader?.ensure?.("appearance");signal.throwIfAborted();
   const appearance=global.Civilization3DFormalSnapshots?.appearance?.();
   if(!appearance||appearance.source!=="formal"||appearance.world!==frame.world)throw Error("unavailable-formal-appearance");
   const context=await options.resolve(frame,appearance,signal);
   if(!context)throw Error("unavailable-formal-assets");
   return context;
  },
  loadRuntime:async(context,signal)=>{
   await global.Civilization3DLoader?.ensure?.("engine");signal.throwIfAborted();
   if(!global.BABYLON?.SceneLoader)throw Error("unavailable-formal-engine");
   if(global.BABYLON.SceneLoader.IsPluginForExtensionAvailable(".glb"))return;
   const row=context.registry?.assets?.find(x=>x.id==="babylon.gltf-loader.v7.54.3");
   if(!row||row.path!=="vendor/babylonjs/7.54.3/babylonjs.loaders.min.js"||!row.license?.trim()||!Number.isSafeInteger(row.bytes)||!/^[a-f0-9]{64}$/.test(row.sha256))throw Error("unavailable-registered-decoder");
   const response=await fetch(row.path+"?asset="+row.sha256.slice(0,24),{signal});if(!response.ok)throw Error("decoder-http");
   const bytes=await response.arrayBuffer(),digest=Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",bytes)),x=>x.toString(16).padStart(2,"0")).join("");
   signal.throwIfAborted();if(bytes.byteLength!==row.bytes||digest!==row.sha256)throw Error("decoder-integrity");
   const url=URL.createObjectURL(new Blob([bytes],{type:"text/javascript"}));
   try{await new Promise((resolve,reject)=>{
    const s=document.createElement("script");let settled=false,timer;
    const cancelled=()=>finish(Error("decoder-aborted"));
    function finish(error){if(settled)return;settled=true;clearTimeout(timer);signal.removeEventListener("abort",cancelled);s.onload=s.onerror=null;s.remove();error?reject(error):resolve();}
    signal.addEventListener("abort",cancelled,{once:true});timer=setTimeout(()=>finish(Error("decoder-timeout")),15000);
    s.src=url;s.onload=()=>finish();s.onerror=()=>finish(Error("decoder-load"));if(signal.aborted)cancelled();else document.head.appendChild(s);
   });}finally{URL.revokeObjectURL(url);}
   signal.throwIfAborted();
  },
  policy:state=>global.CivilizationHybridBattlePolicy.resolve({requestedMode:"hybrid-b",quality:global.document.body.classList.contains("main-minimal-mode-open")?"minimal":options.quality||"standard",...state,background:global.document.hidden}),
  onRetire:()=>{options.host.hidden=true;},
  onReady:()=>{clearNotice();options.host.hidden=false;},
  onFallback:reason=>{
   options.host.hidden=true;clearNotice();notice=document.createElement("p");notice.className="formal-b-visual-fallback";notice.dataset.status="unavailable";notice.setAttribute("role","status");
   notice.textContent=reason==="text-or-minimal-policy"?"戰鬥視覺已關閉，保留文字戰鬥。":"戰鬥視覺暫不可用，已保留文字戰鬥。";
   options.host.after(notice);options.onFallback?.(reason);
  }
 });
 const managed=Object.freeze({...controller,dispose:()=>{clearNotice();controller.dispose();}});
 active=managed;if(options.subscribe!==false&&!controller.attach()){dispose();throw Error("unavailable-formal-event-bridge");}
 return managed;
}
function bindRoutes(options){
 dispose();let id=null,host=null;
 const bridge=global.CivilizationFormalHybridBridge;
 const observer=new MutationObserver(()=>{if(host&&!host.isConnected){retireScene();host=null;id=null;}});
 observer.observe(document.body,{childList:true,subtree:true});
 const attached=bridge.attach((event,delivery)=>{
  const frame=global.CivilizationFormalBProjection.convert(event);if(!frame)return;
  const screen=document.querySelector("#main .combat-screen");
  if(!screen||document.hidden){retireScene();host?.remove();host=null;id=null;return;}
  if(id!==frame.battleId||!host?.isConnected){
   retireScene();host?.remove();host=document.createElement("div");host.className="formal-b-battle-stage";host.style.cssText="width:100%;height:clamp(200px,42dvh,380px);position:relative;overflow:hidden";host.hidden=true;
   const anchor=screen.querySelector(".combat-arena");screen.insertBefore(host,anchor?.parentNode===screen?anchor:null);id=frame.battleId;
   mount({...options,host,subscribe:false,onFallback:reason=>{host.hidden=true;options.onFallback?.(reason);}});
  }
  active?.accept(event,delivery);
 });
 if(!attached){observer.disconnect();throw Error("unavailable-formal-route-bridge");}
 global.addEventListener("pagehide",dispose,{once:true});
 routeDispose=()=>{global.removeEventListener("pagehide",dispose);observer.disconnect();bridge.detach();host?.remove();host=null;};
 return Object.freeze({dispose,snapshot:()=>active?.snapshot?.()||Object.freeze({ready:false,engines:0,rafs:0})});
}
function boot(){
 // Internal integration does not grant user approval of broad formal release.
 if(global.CivilizationFormalBController?.formalReleased!==true)return false;
 const approved=global.CivilizationFormalBApprovedAssets;
 if(approved?.approved!==true||typeof approved.resolve!=="function")return false;
 return bindRoutes(approved);
}
global.CivilizationFormalBEntry=Object.freeze({version:1,mount,bindRoutes,dispose,boot,fixtureAllowed:false});
boot();
})(window);
