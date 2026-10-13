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
 let disposed=false,epoch=0,battleId=null,lastSeq=-1,abort=null,renderer=null,loading=false,failed=false,attached=false;
 let frames=0,rejected=0,fallbacks=0;
 function retire(){epoch++;abort?.abort();abort=null;renderer?.dispose();renderer=null;loading=false;}
 function fallback(reason){retire();failed=true;fallbacks++;try{options.onFallback?.(reason);}catch(_){} }
 function current(ticket,id){return !disposed&&ticket===epoch&&battleId===id&&!global.document?.hidden;}
 async function initialize(frame){
  const ticket=epoch,id=frame.battleId;loading=true;abort=new AbortController();const signal=abort.signal;
  try{
   const context=await options.resolve(frame,signal);if(!current(ticket,id))return;
   const bundle=await rendererAPI.prepare({...context,identity:{...frame.enemyIdentity,world:frame.world},signal});
   if(!current(ticket,id))return;
   const result=await rendererAPI.create({bundle,host:options.host,signal,isCurrent:()=>current(ticket,id),onFallback:fallback});
   if(!current(ticket,id)){result.dispose();return;}
   renderer=result;loading=false;renderer.sample({clip:"idle",elapsedMs:0});
  }catch(error){if(current(ticket,id))fallback(String(error?.message||error));}
 }
 function accept(event){
  if(disposed)return false;
  const frame=projection?.convert(event);
  if(!frame||frame.canCommit!==false||frame.canEmitCombatEvents!==false){rejected++;return false;}
  if(frame.battleId!==battleId){retire();battleId=frame.battleId;lastSeq=-1;failed=false;}
  if(frame.seq<=lastSeq){rejected++;return false;}lastSeq=frame.seq;
  if(endings.has(frame.type)){retire();failed=true;return false;}
  if(frame.background||global.document?.hidden){retire();return false;}
  // Do not replay computed combat-action/outcome history as paced animation.
  if(event.phase!=="presentation"&&frame.type!=="battle-start"&&frame.type!=="snapshot")return false;
  if(options.policy?.()?.mode!=="hybrid-b"){fallback("text-or-minimal-policy");return false;}
  if(!renderer){if(!loading&&!failed)void initialize(frame);return false;}
  // The presentation owner must supply an actual sample. No synthetic actor/HP or second clock.
  const sample=options.clock?.sample?.(event);
  if(!sample)return false;
  try{const accepted=renderer.sample(sample);if(accepted)frames++;return accepted;}
  catch(error){fallback(String(error?.message||error));return false;}
 }
 const visibility=()=>{retire();failed=false;};
 const pagehide=()=>dispose();
 function attach(){if(disposed||attached)return false;attached=bridge?.attach?.(accept)===true;return attached;}
 function dispose(){if(disposed)return;disposed=true;retire();if(attached)bridge?.detach?.();attached=false;global.document?.removeEventListener?.("visibilitychange",visibility);global.removeEventListener?.("pagehide",pagehide);}
 global.document?.addEventListener?.("visibilitychange",visibility);global.addEventListener?.("pagehide",pagehide);
 return Object.freeze({accept,attach,dispose,snapshot:()=>Object.freeze({battleId,lastSeq,disposed,loading,ready:!!renderer,failed,frames,rejected,fallbacks,engines:renderer?1:0,canCommit:false,canEmitCombatEvents:false})});
}
global.CivilizationFormalBController=Object.freeze({version:1,create,formalReleased:FORMAL_B_RELEASED,fixtureAllowed:false});
})(window);
