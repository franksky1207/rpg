/* One visual sample clock anchored to the existing presentation owner's token/index/pacing. */
(function(global){
"use strict";
if(global.CivilizationFormalBOwnerClock)return;
const roles=new Set(["player","enemy"]);
function create(options={}){
 const now=options.now||(()=>global.performance.now());
 const read=options.read||(()=>global.getCombatPresentationSnapshot?.());
 const snapshot=options.snapshot||(()=>global.CivilizationCombatEvents?.snapshot?.("formal"));
 let battleId=null,token=null,index=-1,start=0,resumed=false,resumeIndex=null;
 const actions=new Map();
 function reset({resume=false}={}){if(!resume)actions.clear();token=null;index=-1;start=now();resumed=resume;resumeIndex=resume&&Number.isSafeInteger(read()?.index)?read().index:null;}
 function observe(e){
  if(e?.lane!=="formal"||e.availability!=="authoritative"||e.expired!==false)return;
  if(e.battleId!==battleId){reset();battleId=e.battleId;}
  // Retain source metadata only. Computed actions never drive playback on arrival.
  if(e.type==="combat-action"&&Number.isSafeInteger(e.sourceIndex)&&e.sourceIndex>=0&&e.sourceIndex<256){
   actions.set(e.sourceIndex,JSON.parse(JSON.stringify(e.data)));while(actions.size>256)actions.delete(actions.keys().next().value);
  }
 }
 function sample(){
  const p=read(),session=snapshot();
  if(!p||session?.battleId!==battleId||session.background||global.document?.hidden||session.presentation?.token!==p.token)return null;
  const idle=()=>({player:{clip:"idle",elapsedMs:Math.max(0,now()-start)%700},enemy:{clip:"idle",elapsedMs:Math.max(0,now()-start)%700},cue:null});
  if(resumed&&resumeIndex===null)resumeIndex=p.index;
  if(resumed&&p.index<=resumeIndex){const frame=idle();for(const role of ["player","enemy"])if(p[role+"Hp"]===0)frame[role]={clip:"defeat",elapsedMs:700};return frame;}
  if(resumed)resumed=false; // A later source index is a new owner action, not a replay.

  if(p.index===0)return idle();
  const d=p.action||actions.get(p.index-1);if(!d)throw Error("unavailable-authoritative-action-history");
  if(token!==p.token||index!==p.index){token=p.token;index=p.index;start=now();}
  const elapsed=Math.max(0,now()-start),pacing=session.pacing;
  if(!pacing||![1,1.5,2].includes(pacing.combatSpeed)||![pacing.impactDelay,pacing.stepDelay,pacing.endDelay].every(x=>Number.isFinite(x)&&x>=0))throw Error("unavailable-owner-pacing");
  const frame=idle(),actor=roles.has(d.actor)?d.actor:null,target=roles.has(d.target)?d.target:null;
  const impact=Math.max(1,pacing.impactDelay),step=Math.max(1,pacing.stepDelay);
  if(d.sourceType==="attack"||d.sourceType==="dodge"){
   if(!actor||!target)throw Error("unavailable-action-roles");
   frame[actor]=elapsed<impact?{clip:"attack",elapsedMs:Math.min(300,elapsed/impact*300)}:{clip:"return",elapsedMs:Math.min(700,(elapsed-impact)/step*700)};
   frame.weaponAttack={role:actor,elapsedMs:elapsed<impact?elapsed/impact*336:336+Math.min(1,(elapsed-impact)/step)*364};
   frame[actor].approach=.42*(elapsed<impact?Math.min(1,elapsed/impact):Math.max(0,1-(elapsed-impact)/step));
   if(d.sourceType==="dodge")frame[target]={clip:"dodge",elapsedMs:Math.min(700,elapsed/(impact+step)*700)};
   else if(elapsed>=impact)frame[target]={clip:"hit",elapsedMs:Math.min(700,(elapsed-impact)/step*700)};
  }else if(d.sourceType==="battleEnd"){
   // Death is shown only when the owner presentation actually reports zero HP.
   for(const role of ["player","enemy"])if(p[role+"Hp"]===0)frame[role]={clip:"defeat",elapsedMs:Math.min(700,elapsed/Math.max(1,pacing.endDelay)*700)};
  }
  const cueType=d.sourceType==="drain"?"drain":d.sourceType==="combo"?"combo":d.sourceType==="counter"?"counter":d.sourceType==="attack"&&elapsed>=impact?(d.crit===true||d.revengeCrit===true?"crit":d.source==="counter"?"counter":d.source==="combo"?"combo":"impact"):null;
  if(cueType&&actor)frame.cue={type:cueType,actor,target,ageMs:Math.max(0,elapsed-(d.sourceType==="attack"?impact:0)),damage:Number.isFinite(d.damage)?d.damage:null,actualDamage:Number.isFinite(d.actualDamage)?d.actualDamage:null,healed:Number.isFinite(d.healed)?d.healed:null};
  // Standard Combat Core has no battleEnd raw row. Zero HP is authoritative only
  // here, in the presentation owner, including reflected damage and shield exhaustion.
  for(const role of ["player","enemy"])if(p[role+"Hp"]===0)frame[role]={clip:"defeat",elapsedMs:Math.min(700,elapsed/Math.max(1,pacing.endDelay)*700)};
  return frame;
 }
 return Object.freeze({observe,sample,reset,snapshot:()=>Object.freeze({battleId,token,index,metadata:actions.size,resumed,canCommit:false})});
}
global.CivilizationFormalBOwnerClock=Object.freeze({version:1,create,canCommit:false,fixtureAllowed:false});
})(window);
