/* T3-B formal asset identity gate. No GM fixture and no speculative asset aliases. */
(function(global){
"use strict";
if(global.CivilizationFormalBAssets)return;
const slots=Object.freeze(["weapon","helmet","armor","shoes","accessory"]);
const tiers=Object.freeze(["low","medium","high"]);
const blocked=reason=>Object.freeze({ready:false,reason,asset:null});
function safePath(v){return typeof v==="string"&&!v.startsWith("/")&&!v.includes("..")&&!v.includes(":")&&v.startsWith("assets/");}
function valid(row){return !!row&&safePath(row.path)&&/^[a-f0-9]{64}$/.test(row.sha256||"")&&Number.isSafeInteger(row.bytes)&&row.bytes>0&&typeof row.license==="string"&&row.license.trim().length>0;}
function identityMatch(row,details){
 const id=row.identity;
 return !!id&&id.world===details.world&&id.chapter===details.chapter&&id.area===details.area&&
 Number.isFinite(details.level)&&details.level>=id.minLevel&&details.level<=id.maxLevel;
}
function player(doc,tier){
 if(!tiers.includes(tier)||doc?.schema!==1||!Array.isArray(doc.assets))return blocked("invalid-registry");
 const row=doc.assets.find(a=>a.id===doc.player?.[tier]&&a.type==="character"&&a.quality===tier);
 if(!valid(row))return blocked("unavailable-player");
 return Object.freeze({ready:true,reason:"registered",asset:Object.freeze({id:row.id,path:row.path,sha256:row.sha256,bytes:row.bytes})});
}
function equipment(doc,{name,slot,world,chapter,area,level,tier}={}){
 if(!slots.includes(slot)||!tiers.includes(tier)||typeof name!=="string"||!name||!Array.isArray(doc?.assets))return blocked("invalid-equipment-query");
 const hits=doc.assets.filter(row=>row.type==="equipment"&&row.slot===slot&&row.quality===tier&&
 Array.isArray(row.names)&&row.names.includes(name)&&identityMatch(row,{world,chapter,area,level})&&valid(row));
 if(hits.length!==1)return blocked(hits.length?"ambiguous-equipment":"unmapped-equipment");
 const row=hits[0];return Object.freeze({ready:true,reason:"registered",asset:Object.freeze({id:row.id,path:row.path,sha256:row.sha256,bytes:row.bytes,slot,name})});
}
function enemy(catalog,{id,name,mode,world,kind,location,tier}={}){
 // A catalog can release only signed, formal, identity-specific entries.
 if(!tiers.includes(tier)||(id!==null&&(typeof id!=="string"||!id))||(id===null&&(typeof name!=="string"||!name||typeof mode!=="string"||!mode))||!Number.isSafeInteger(world)||typeof kind!=="string"||typeof location!=="string")return blocked("invalid-enemy-identity");
 if(catalog?.schema!=="civilization.formal.b.enemy-atlas.v1"||catalog.publish!==true||catalog.approved!==true||!Array.isArray(catalog.entries))return blocked("unreleased-enemy-catalog");
 const hits=catalog.entries.filter(row=>(id===null?row.sourceIdentity?.mode===mode&&row.sourceIdentity?.world===world&&row.sourceIdentity?.name===name&&row.sourceIdentity?.kind===kind&&row.sourceIdentity?.location===location:row.id===id)&&typeof row.id==="string"&&row.id.length>0&&row.world===world&&row.kind===kind&&row.location===location&&row.tier===tier&&valid(row)&&row.reviewed===true);
 if(hits.length!==1)return blocked(hits.length?"ambiguous-enemy":"unmapped-enemy");
 const row=hits[0];return Object.freeze({ready:true,reason:id===null?"verified-source-locator-mapping":"verified-identity-mapping",formalIdAvailable:id!==null,asset:Object.freeze({id:row.id,path:row.path,sha256:row.sha256,bytes:row.bytes})});
}
global.CivilizationFormalBAssets=Object.freeze({version:1,slots,tiers,player,equipment,enemy,fixtureAllowed:false});
})(window);
