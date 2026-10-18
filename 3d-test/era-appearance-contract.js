/* Batch 5: read-only visual identity. Not a combat, save, or asset-release owner. */
(function(global){
"use strict";
if(global.CivilizationEraAppearanceContract)return;
const IDS=Object.freeze({galaxy:"galaxy",universe:"universe",higher:"higher"});
const SLOTS=Object.freeze(["weapon","helmet","armor","shoes","accessory"]);
const epoch=n=>n===3?"higher":n===2?"universe":n===1?"galaxy":null;
function itemEpoch(item){
 if(!item||typeof item!=="object")return null;
 const source=String(item.visualEpoch||item.epoch||item.sourceEpoch||"").toLowerCase();
 if(source==="higher"||source==="high"||source==="thirdworld")return "higher";
 if(source==="universe"||source==="secondworld")return "universe";
 if(source==="galaxy"||source==="firstworld")return "galaxy";
 // Never infer identity from item display names or historical preview images.
 return null;
}
function resolve({world,role="player",equipped={}}={}){
 if(role!=="player")return Object.freeze({ready:false,reason:"independent-enemy-identity",visualId:null});
 const base=epoch(world);
 if(!base)return Object.freeze({ready:false,reason:"unknown-formal-world",visualId:null});
 const rows=SLOTS.map(slot=>equipped?.[slot]).filter(Boolean);
 const origins=rows.map(itemEpoch).filter(Boolean);
 // Higher-dimensional equipment worn after reincarnation retains higher appearance.
 const visualId=origins.includes("higher")?"higher":origins.includes("universe")?"universe":base;
 return Object.freeze({ready:true,visualId,source:visualId===base?"current-world":"equipped-era",artReleased:false});
}
global.CivilizationEraAppearanceContract=Object.freeze({version:1,visualIds:IDS,slots:SLOTS,resolve,itemEpoch,readOnly:true});
})(window);
