/* Formal B lifecycle coordinator. Explicit internal construction; release stays closed. */
(function(global){
"use strict";
if(global.CivilizationFormalBController)return;
const FORMAL_B_RELEASED=false;
const endings=new Set(["cancelled","presentation-ended","presentation-skipped"]);
function create(options){
 const bridge=options.bridge||global.CivilizationFormalHybridBridge;
 const projection=options.projection||global.CivilizationFormalBProjection;
 const rendererAPI=options.rendererAPI||global.CivilizationFormalBRenderer;
 let disposed=false,epoch=0,battleId=null,lastSeq=-1,abort=null,renderer=null,loading=false,failed=false,attached=false,ended=false,upstream=null,upstreamAbort=null;
 let frames=0,rejected=0,fallbacks=0,raf=0,lastFailure=null;
 const policy=()=>options.policy?.({rendererReady:!!renderer,assetsVerified:!!renderer,webglAvailable:!!renderer});
 const allowed=()=>{const p=policy();return (p?.requestedMode==="hybrid-b"||p?.mode==="hybrid-b")&&p?.quality!=="minimal"&&!global.document?.hidden;};
 function retire(){if(upstream&&upstreamAbort)upstream.removeEventListener("abort",upstreamAbort);upstream=null;upstreamAbort=null;if(raf){global.cancelAnimationFrame?.(raf);raf=0;}epoch++;abort?.abort();abort=null;renderer?.dispose();renderer=null;loading=false;try{options.onRetire?.();}catch(_){} }
 function fallback(reason){retire();lastFailure=String(reason||'unknown');failed=reason!=="text-or-minimal-policy";fallbacks++;try{options.onFallback?.(reason);}catch(_){} }
 function current(ticket,id){return !disposed&&!ended&&ticket===epoch&&battleId===id&&!global.document?.hidden;}
 async function initialize(frame){
  const ticket=epoch,id=frame.battleId;loading=true;abort=new AbortController();const signal=abort.signal;
  try{
   const context=await options.resolve(frame,signal);if(!current(ticket,id))return;
   const bundle=await rendererAPI.prepare({...context,identity:{...frame.enemyIdentity,name:frame.actorNames.enemy,mode:frame.mode,world:frame.world},signal});
   if(!current(ticket,id))return;
   await options.loadRuntime?.(context,signal);if(!current(ticket,id))return;
   const result=await rendererAPI.create({bundle,host:options.host,signal,isCurrent:()=>current(ticket,id),onFallback:fallback});
   if(!current(ticket,id)){result.dispose();return;}
   renderer=result;loading=false;options.clock?.reset?.({resume:true});options.onReady?.();renderer.resize?.();renderer.sample(options.clock?.sample?.()||{clip:"idle",elapsedMs:0});
   if(global.requestAnimationFrame)raf=global.requestAnimationFrame(draw);
  }catch(error){if(current(ticket,id))fallback(String(error?.message||error));}
 }
 function draw(){
  raf=0;if(!renderer||disposed||global.document?.hidden)return;
  if((policy()?.effectiveMode||policy()?.mode)!=="hybrid-b"){fallback("text-or-minimal-policy");return;}
  try{const sample=options.clock?.sample?.();if(sample){renderer.sample(sample);frames++;}}
  catch(error){fallback(String(error?.message||error));return;}
  if(renderer&&!disposed)raf=global.requestAnimationFrame(draw);
 }
 function accept(event,delivery){
  if(disposed)return false;
  const frame=projection?.convert(event);
  if(!frame||frame.canCommit!==false||frame.canEmitCombatEvents!==false){rejected++;return false;}
  if(frame.battleId!==battleId){retire();battleId=frame.battleId;lastSeq=-1;failed=false;ended=false;lastFailure=null;}
  if(ended){
   const session=global.CivilizationCombatEvents?.snapshot?.('formal'),p=global.getCombatPresentationSnapshot?.();
   // Several official owners compute headless, then explicitly bind a paced token.
   // Only that live owner token can reopen the same battle; computed history cannot.
   if(frame.type==='snapshot'&&frame.phase==='presentation'&&session?.battleId===battleId&&p&&session.presentation?.token===p.token){ended=false;failed=false;options.clock?.reset?.({resume:true});}
   else{rejected++;return false;}
  }
  if(delivery?.signal&&delivery.signal!==upstream){
   if(upstream&&upstreamAbort)upstream.removeEventListener("abort",upstreamAbort);upstream=delivery.signal;
   const id=battleId,ticket=epoch;upstreamAbort=()=>{Promise.resolve().then(()=>{if(ticket===epoch&&id===battleId){retire();failed=false;}});};upstream.addEventListener("abort",upstreamAbort,{once:true});if(upstream.aborted){upstreamAbort();return false;}
  }
  if(frame.seq<=lastSeq){rejected++;return false;}lastSeq=frame.seq;options.clock?.observe?.(event);
  if(endings.has(frame.type)){retire();ended=!(frame.type==="presentation-ended"&&event.data?.reason==="replace");failed=false;return false;}
  if(frame.background||global.document?.hidden){retire();return false;}
  // Do not replay computed combat-action/outcome history as paced animation.
  if(event.phase!=="presentation"&&frame.type!=="battle-start"&&frame.type!=="snapshot")return false;
  if(!allowed()){fallback("text-or-minimal-policy");return false;}
  if(!renderer){if(!loading&&!failed)void initialize(frame);return false;}
  // The presentation owner must supply an actual sample. No synthetic actor/HP or second clock.
  const sample=options.clock?.sample?.(event);
  if(!sample)return false;
  try{const accepted=renderer.sample(sample);if(accepted)frames++;return accepted;}
  catch(error){fallback(String(error?.message||error));return false;}
 }
 const visibility=()=>{retire();failed=false;options.clock?.reset?.({resume:true});};
 const pagehide=event=>{if(event?.persisted===true){retire();failed=false;options.clock?.reset?.({resume:true});}else dispose();};
 function attach(){if(disposed||attached)return false;attached=bridge?.attach?.(accept)===true;return attached;}
 function dispose(){if(disposed)return;disposed=true;retire();if(attached)bridge?.detach?.();attached=false;global.document?.removeEventListener?.("visibilitychange",visibility);global.removeEventListener?.("pagehide",pagehide);}
 global.document?.addEventListener?.("visibilitychange",visibility);global.addEventListener?.("pagehide",pagehide);
 return Object.freeze({accept,attach,dispose,suspend:()=>{if(renderer||loading){retire();failed=false;options.clock?.reset?.({resume:true});}},snapshot:()=>Object.freeze({battleId,lastSeq,disposed,loading,ready:!!renderer,ended,failed,lastFailure,frames,rejected,fallbacks,engines:renderer?(renderer.snapshot?.().engines??1):0,canvases:renderer?1:0,rafs:raf?1:0,canCommit:false,canEmitCombatEvents:false})});
}
global.CivilizationFormalBController=Object.freeze({version:1,create,formalReleased:FORMAL_B_RELEASED,fixtureAllowed:false});
})(window);
