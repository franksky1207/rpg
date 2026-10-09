/* Formal 3D appearance snapshot. Presentation-only; never writes to game state. */
(function(global){
"use strict";
const SLOTS=["weapon","helmet","armor","shoes","accessory"];
const finite=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d;
const bound=(v,low,high)=>Math.max(low,Math.min(high,Math.floor(finite(v,low))));
const clone=o=>JSON.parse(JSON.stringify(o));
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
 return clone({version:1,source:"formal",world,level:bound(s.level,1,9999),vip:bound(s.vipLevel,0,9999),
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
global.Civilization3DAppearance=Object.freeze({version:1,slotIds:SLOTS,capture,scene});
})(window);
