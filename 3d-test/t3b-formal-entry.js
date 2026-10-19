/* Formal integration entry. No automatic release, preload, save migration or GM fixture. */
(function(global){
"use strict";
if(global.CivilizationFormalBEntry)return;
let active=null,routeDispose=null;
const animationEnabled=()=>global.CivilizationPresentationMode?.combatAnimationEnabled?.()!==false;
function retireScene(){active?.dispose();active=null;}
function dispose(){const close=routeDispose;routeDispose=null;close?.();retireScene();global.CivilizationFormalBRenderer?.clearSpriteCache?.();}
function mount(options){
 if(!options?.host||typeof options.resolve!=="function")throw Error("missing-approved-formal-resolver");
 retireScene();
 let notice=null;
 const clearNotice=()=>{notice?.remove();notice=null;};
 const clock=options.clock||global.CivilizationFormalBOwnerClock.create();
 const controller=global.CivilizationFormalBController.create({
  host:options.host,clock,
  resolve:async(frame,signal)=>{
   if(options.wholeSuit===true){const context=await options.resolve(frame,options.appearance,signal);if(!context)throw Error("unavailable-formal-armor");return {...context,eraVisualId:options.eraVisualId};}
   await global.Civilization3DLoader?.ensure?.("appearance");signal.throwIfAborted();
   const appearance=global.Civilization3DFormalSnapshots?.appearance?.();
   if(!appearance||appearance.source!=="formal"||appearance.world!==frame.world)throw Error("unavailable-formal-appearance");
   const context=await options.resolve(frame,appearance,signal);
   if(!context)throw Error("unavailable-formal-assets");
   return context;
  },
  loadRuntime:async(context,signal)=>{
   if(context.wholeSuit===true)return;
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
  policy:state=>global.CivilizationHybridBattlePolicy.resolve({requestedMode:!animationEnabled()?"text":"hybrid-b",quality:global.document.body.classList.contains("main-minimal-mode-open")?"minimal":options.quality||"standard",...state,background:global.document.hidden}),
  onRetire:()=>{options.host.hidden=true;options.host.closest(".combat-screen")?.classList.remove("formal-b-shared-layout");},
  onReady:()=>{clearNotice();options.host.hidden=false;if(options.host.classList.contains("formal-b-shared-stage"))options.host.closest(".combat-screen")?.classList.add("formal-b-shared-layout");},
  onFallback:reason=>{
   options.host.hidden=true;options.host.closest(".combat-screen")?.classList.remove("formal-b-shared-layout");clearNotice();
   // Expected text / minimal policies are normal UI choices, not failures.
   if(reason!=="text-or-minimal-policy"){
    notice=document.createElement("p");notice.className="formal-b-visual-fallback";notice.dataset.status="unavailable";notice.setAttribute("role","status");
    notice.textContent="戰鬥動畫暫不可用，已安全保留文字戰鬥。";options.host.after(notice);
   }
   options.onFallback?.(reason);
  }
 });
 const managed=Object.freeze({...controller,dispose:()=>{clearNotice();controller.dispose();}});
 active=managed;if(options.subscribe!==false&&!controller.attach()){dispose();throw Error("unavailable-formal-event-bridge");}
 return managed;
}
function bindRoutes(options){
 dispose();let id=null,host=null,clockBattleId=null,clock=null,appearance=null,eraVisualId=null;
 const bridge=global.CivilizationFormalHybridBridge;
 const observer=new MutationObserver(()=>{const screen=document.querySelector('#main .combat-screen');if(host&&!host.isConnected){retireScene();host=null;id=null;}if(!screen&&!host)global.CivilizationFormalBRenderer?.clearSpriteCache?.();if(global.document.body.classList.contains('main-minimal-mode-open'))active?.suspend?.();});
 observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:["class"]});
 const attached=bridge.attach((event,delivery)=>{
  const frame=global.CivilizationFormalBProjection.convert(event);if(!frame)return;
  if(clockBattleId!==frame.battleId){clock=global.CivilizationFormalBOwnerClock.create();clockBattleId=frame.battleId;appearance=frame.appearance||null;eraVisualId=global.CivilizationEraAppearanceContract?.resolve({world:frame.world})?.visualId||null;}
  if(frame.appearance)appearance=frame.appearance;
  if(!appearance){const session=global.CivilizationCombatEvents?.snapshot?.('formal');if(session?.battleId===frame.battleId)appearance=session.appearance;}

  clock.observe(event); // Metadata only: some formal owners compute before creating combat DOM.
  const screen=document.querySelector("#main .combat-screen");
  if(!screen||document.hidden){retireScene();host?.remove();screen?.classList.remove('formal-b-shared-layout');host=null;id=null;return;}

  if(id!==frame.battleId||!host?.isConnected){
   retireScene();host?.remove();host=document.createElement("div");host.className="formal-b-battle-stage";host.style.cssText="width:100%;height:clamp(200px,42dvh,380px);position:relative;overflow:hidden";host.hidden=true;
   if(options.wholeSuit===true){
    // One common battlefield, separate from both combatants' authoritative HUD cards.
    host.className='formal-b-shared-stage';host.style.cssText='';
    const anchor=screen.querySelector('.combat-arena');
    if(!anchor){host.remove();host=null;return;}
    screen.insertBefore(host,anchor);
    screen.classList.add('formal-b-shared-layout');
   }else{const anchor=screen.querySelector(".combat-arena");screen.insertBefore(host,anchor?.parentNode===screen?anchor:null);}id=frame.battleId;
   mount({...options,appearance,eraVisualId,host,clock,subscribe:false,onFallback:reason=>{host.hidden=true;options.onFallback?.(reason);}});
  }
  active?.accept(event,delivery);
 });
 if(!attached){observer.disconnect();throw Error("unavailable-formal-route-bridge");}
 const preferenceChanged=()=>{active?.suspend?.();global.CivilizationFormalBRenderer?.clearSpriteCache?.();};
 global.addEventListener("civilization-combat-animation-change",preferenceChanged);
 const pagehide=event=>{if(event?.persisted===true){active?.suspend?.();global.CivilizationFormalBRenderer?.clearSpriteCache?.();}else dispose();};
 global.addEventListener("pagehide",pagehide);
 routeDispose=()=>{global.removeEventListener("civilization-combat-animation-change",preferenceChanged);global.removeEventListener("pagehide",pagehide);observer.disconnect();bridge.detach();host?.closest('.combat-screen')?.classList.remove('formal-b-shared-layout');host?.remove();host=null;};
 return Object.freeze({dispose,snapshot:()=>active?.snapshot?.()||Object.freeze({ready:false,engines:0,rafs:0})});
}
function boot(){
 // Only three verified player sprites; no enemy/GLB/full-3D release is implied.
 if(global.CivilizationFormalPlayerSprites?.playerSpritesEnabled===true){
  return bindRoutes({wholeSuit:true,resolve:async(frame,appearance)=>({wholeSuit:true,appearance,world:frame.world})});
 }
 // Internal integration does not grant user approval of broad formal release.
 if(global.CivilizationFormalBController?.formalReleased!==true)return false;
 const approved=global.CivilizationFormalBApprovedAssets;
 if(approved?.approved!==true||typeof approved.resolve!=="function")return false;
 return bindRoutes(approved);
}
global.CivilizationFormalBEntry=Object.freeze({version:1,mount,bindRoutes,dispose,boot,diagnostics:()=>active?.snapshot?.()||{ready:false,engines:0,rafs:0,canvases:0},fixtureAllowed:false});
global.addEventListener("civilization-auth-ready",()=>{if(!routeDispose)boot();});
global.addEventListener("civilization-auth-signed-out",dispose);
boot();
})(window);
