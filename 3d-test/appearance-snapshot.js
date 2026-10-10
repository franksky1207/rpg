/* Formal 3D appearance snapshot. Presentation-only; never writes to game state. */
(function(global){
"use strict";
const SLOTS=["weapon","helmet","armor","shoes","accessory"];
const finite=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d;
const bound=(v,low,high)=>Math.max(low,Math.min(high,Math.floor(finite(v,low))));
const clone=o=>JSON.parse(JSON.stringify(o));
/* Model mapping contract: names/visualKeys identify appearance, never numeric combat ownership.
   Geometry remains the explicit safe fallback until a licensed GLB manifest exists. */
function modelDescriptor(type,item,defaultWorld=1,enhancement=0){
 const slot=SLOTS.includes(type)?type:"accessory";
 const present=item?.present===true;
 const world=bound(item?.world??defaultWorld,1,3);
 const quality=bound(item?.quality,0,5);
 const level=bound(item?.level,0,9999);
 const name=present?String(item?.name||"").slice(0,120):"";
 const visualKey=present?String(item?.visualKey||name).slice(0,120):"";
 return Object.freeze({type:slot,present,world,name,visualKey,quality,level,
  enhancement:bound(enhancement,0,40),assetKind:"geometry-fallback",assetId:null,
  fallback:"procedural-geometry",source:"read-only-appearance"});
}
function modelDescriptors(appearance){
 const a=appearance||{};
 return SLOTS.map(type=>modelDescriptor(type,a.equipment?.[type],a.world,a.enhancements?.[type]));
}
function capture(){
 const s=typeof state!=="undefined"?state:global.state;
 if(!s||typeof s!=="object")return null;
 const world=bound(typeof global.currentWorldPhase==="function"?global.currentWorldPhase():s.thirdWorld?.entered?3:s.secondWorld?.entered?2:1,1,3);
 const min=typeof global.effectiveEnhancementMin==="function"?bound(global.effectiveEnhancementMin(s),0,40):0;
 const cap=typeof global.effectiveEnhancementCap==="function"?bound(global.effectiveEnhancementCap(s),1,40):world===1?20:40;
 const equipment=Object.fromEntries(SLOTS.map(type=>{
  const item=s.equipment?.[type];
  return [type,item&&typeof item==="object"?{
   present:true,name:String(item.name||"").slice(0,120),level:bound(item.level,0,9999),
   quality:bound(item.q,0,5),world:bound(item.world||world,1,3),
   visualKey:String(item.visualKey||item.name||"").slice(0,120)
  }:{present:false,name:"",level:0,quality:0,world,visualKey:""}];
 }));
 const enhancements=Object.fromEntries(SLOTS.map(type=>[type,bound(s.enhancement?.levels?.[type],0,40)]));
 const inventorySamples=Array.isArray(s.inventory)?s.inventory.slice(0,5).map(item=>({present:!!item,quality:bound(item?.q,0,5),name:String(item?.name||"").slice(0,120)})):[];
 const specs=Array.isArray(global.SPECIALIZATION_KEYS)?global.SPECIALIZATION_KEYS:[];
 const marks=Array.isArray(global.MARK_KEYS)?global.MARK_KEYS:[];
 const stats=typeof global.playerCombatStats==="function"?global.playerCombatStats():null;
 const abilities=stats?{hp:finite(stats.hp),atk:finite(stats.atk),def:finite(stats.def),crit:finite(stats.crit),dodge:finite(stats.dodge)}:null;
 const specializations=Object.fromEntries(specs.map(k=>[k,bound(s.specializations?.[k],0,60)]));
 const markLevels=Object.fromEntries(marks.map(k=>[k,bound(s.marks?.entries?.[k]?.level,0,10)]));
 const markNames=marks.map(k=>String(global.markDisplayName?.(k)||k).slice(0,40));
 return clone({version:2,source:"formal",abilities,specializations,markLevels,markNames,
  civilizationLevel:bound(s.secondWorld?.civilizationLevel,0,10),
  coreLevel:bound(s.thirdWorld?.coreLevel,0,10),world,level:bound(s.level,1,9999),vip:bound(s.vipLevel,0,9999),
  breakthrough:bound(s.breakthrough?.level??s.breakthroughLevel,0,9999),equipment,enhancements,
  enhancementMin:min,enhancementCap:cap,inventorySamples});
}
function scene(kind,appearance){
 const a=appearance||capture();if(!a)return {};
 if(kind==="character")return {world:a.world,appearance:a};
 if(kind==="equipment")return {world:a.world,slots:SLOTS.map(type=>a.equipment[type]),inventorySamples:a.inventorySamples,appearance:a};
 if(kind==="forge")return {world:a.world,cap:a.enhancementCap,slots:SLOTS.map(type=>({level:a.enhancements[type],invalid:a.enhancements[type]<a.enhancementMin})),appearance:a};
 return {world:a.world,appearance:a};
}
global.Civilization3DAppearance=Object.freeze({version:3,slotIds:SLOTS,capture,scene,modelDescriptor,modelDescriptors});
})(window);
