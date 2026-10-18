/* Batch 7: presentation-only epoch identity; gear never selects art. */
(function(global){
"use strict";
if(global.CivilizationEraAppearanceContract)return;
const IDS=Object.freeze({galaxy:"galaxy",universe:"universe",higher:"higher"});
const ID_LIST=Object.freeze(Object.values(IDS));
const SLOTS=Object.freeze(["weapon","helmet","armor","shoes","accessory"]);
const PREFIX="civilization-war-era-appearance-v1:";
const LOCAL_OWNER_KEY="civilization_frontline_local_owner_v1";
const epoch=n=>Number(n)===3?"higher":Number(n)===2?"universe":Number(n)===1?"galaxy":null;
const accountId=()=>String(global.civilizationAuthSession?.user?.id||"").trim();
// engine.js owns a global lexical `let state`, not window.state. Never capture a
// reference: import/cloud restore and new runs replace the formal state object.
const formalState=()=>typeof state!=="undefined"?state:global.state;
const count=()=>{const n=formalState()?.reincarnation?.count;return Number.isSafeInteger(n)&&n>0?n:0;};
let signedOut=false;
function ownsLocalProgress(){
 const id=accountId();if(!id||signedOut)return false;
 try{const owner=global.localStorage?.getItem(LOCAL_OWNER_KEY);return !owner||owner===id;}
 catch{return false;}
}
function readChoice(){
 const id=accountId();if(!id)return null;
 try{const value=global.localStorage?.getItem(PREFIX+id);return ID_LIST.includes(value)?value:null;}
 catch{return null;}
}
function canChoose(){return count()>0&&ownsLocalProgress();}
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
 // A different login must not inherit the previous local save's unlock. The
 // existing cloud/local owner decides when downloaded progress belongs to it.
 const unlocked=count()>0&&ownsLocalProgress();
 const visualId=unlocked?choice()||IDS.higher:base;
 return Object.freeze({ready:true,visualId,source:unlocked?"reincarnation-preference":"current-world",artReleased:true});
}
global.addEventListener?.("civilization-auth-signed-out",()=>{signedOut=true;});
global.addEventListener?.("civilization-auth-ready",()=>{signedOut=false;});
// Retained as a deprecated compatibility accessor; never feeds presentation.
function itemEpoch(){return null;}
global.CivilizationEraAppearanceContract=Object.freeze({version:2,visualIds:IDS,slots:SLOTS,resolve,itemEpoch,
 available:ID_LIST,canChoose,choice,select,reincarnationCount:count,accountId,readOnly:true});
})(window);
