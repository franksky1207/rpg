/* Batch 7: presentation-only epoch identity; gear never selects art. */
(function(global){
"use strict";
if(global.CivilizationEraAppearanceContract)return;
const IDS=Object.freeze({galaxy:"galaxy",universe:"universe",higher:"higher"});
const ID_LIST=Object.freeze(Object.values(IDS));
const SLOTS=Object.freeze(["weapon","helmet","armor","shoes","accessory"]);
const PREFIX="civilization-war-era-appearance-v1:";
const epoch=n=>Number(n)===3?"higher":Number(n)===2?"universe":Number(n)===1?"galaxy":null;
const accountId=()=>String(global.civilizationAuthSession?.user?.id||"").trim();
const count=()=>{const n=global.state?.reincarnation?.count;return Number.isSafeInteger(n)&&n>0?n:0;};
function readChoice(){
 const id=accountId();if(!id)return null;
 try{const value=global.localStorage?.getItem(PREFIX+id);return ID_LIST.includes(value)?value:null;}
 catch{return null;}
}
function canChoose(){return count()>0&&!!accountId();}
function choice(){return canChoose()?readChoice()||IDS.higher:null;}
function select(value){
 if(!ID_LIST.includes(value))return Object.freeze({ok:false,reason:"invalid-visual-id"});
 if(!canChoose())return Object.freeze({ok:false,reason:"reincarnation-locked-or-signed-out"});
 try{global.localStorage.setItem(PREFIX+accountId(),value);}
 catch{return Object.freeze({ok:false,reason:"storage-unavailable"});}
 // Deliberately do not rebuild a live combat; next safe presenter mount reads this.
 global.dispatchEvent?.(new CustomEvent("civilization-era-appearance-change",{detail:{visualId:value,apply:"next-battle"}}));
 return Object.freeze({ok:true,visualId:value,apply:"next-battle"});
}
function resolve({world,role="player"}={}){
 if(role!=="player")return Object.freeze({ready:false,reason:"independent-enemy-identity",visualId:null});
 const base=epoch(world);
 if(!base)return Object.freeze({ready:false,reason:"unknown-formal-world",visualId:null});
 const visualId=count()>0?choice()||IDS.higher:base;
 return Object.freeze({ready:true,visualId,source:count()>0?"reincarnation-preference":"current-world",artReleased:false});
}
// Retained as a deprecated compatibility accessor; never feeds presentation.
function itemEpoch(){return null;}
global.CivilizationEraAppearanceContract=Object.freeze({version:2,visualIds:IDS,slots:SLOTS,resolve,itemEpoch,
 available:ID_LIST,canChoose,choice,select,reincarnationCount:count,accountId,readOnly:true});
})(window);
