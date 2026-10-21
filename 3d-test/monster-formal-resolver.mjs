// Explicit map/dungeon presentation whitelist. No fuzzy identity matching or gameplay writes.
import {registry,mappings,findMapping,findAsset} from './monster-sprites.mjs?v=20261021-batch16-dungeons1';
export function resolveFormalMonster({world,mode,kind,name,location,id}={}){
 if(!registry.formalBattleEnabled||![1,2].includes(world))return null;
 if(['bounty','arena','void'].includes(mode)){
  // Names are exact canonical owner identities, never substring/fuzzy matches.
  const row=Object.values(mappings).find(r=>r.mode===mode&&r.name===name&&r.kind===kind&&(r.world==='both'||r.world===(world===1?'galaxy':'universe')));
  if(!row)return null;
  if(mode==='arena'&&location!==String(row.arenaStage))return null;
  if(mode==='void'){
   if(typeof location!=='string'||! /^[1-9]\d*$/.test(location)||!Number.isSafeInteger(Number(location)))return null;
   const floor=Number(location),boss=floor%10===0;
   if(row.isBossFloor!==boss||boss&&row.bossCycle!==Math.floor(((floor-1)%100)/10))return null;
  }
  const asset=findAsset(row.assetId);
  return asset?.formalBattleAllowed&&asset.gmPreviewAllowed&&asset.facing==='left-3/4'?Object.freeze({mapping:row,asset}):null;
 }
 if(mode!=='main')return null;
 let key=null;
 if(world===1){
  // Official W1 combat owner uses zero-based map index and enemy index in location.
  if(typeof location!=='string'||!/^(?:0|[1-9]\d*):[0-4]$/.test(location))return null;
  const [map,slot]=location.split(':').map(Number);
  if(!Number.isSafeInteger(map)||map<0||map>=100)return null;
  key='galaxy-map-'+String(map*5+slot+1).padStart(3,'0');
 }else{
  // Official W2 boss encounter carries the stable second-world boss id.
  if(typeof id!=='string'||!/^universe-boss-(?:0(?:0[1-9]|[1-9][0-9])|100)$/.test(id))return null;
  if(typeof location!=='string'||!/^(?:0|[1-9]\d*)$/.test(location)||Number(location)!==Number(id.slice(-3))-1)return null;
  key=id;
 }
 const mapping=findMapping(key);
 if(!mapping||mapping.world!==(world===1?'galaxy':'universe')||mapping.name!==name||mapping.kind!==kind)return null;
 if(world===1&&(mapping.region!==Math.floor(Number(location.split(':')[0])/10)+1||mapping.mapIndex!==Math.floor(Number(location.split(':')[0])%10)+1||mapping.slot!==Number(location.split(':')[1])+1))return null;
 if(world===2&&id!==mapping.id)return null;
 const asset=findAsset(mapping.assetId);
 if(!asset||asset.formalBattleAllowed!==true||asset.gmPreviewAllowed!==true||asset.facing!=='left-3/4')return null;
 return Object.freeze({mapping,asset});
}

// Mirror has no monster prototype: the same approved player appearance/Actor is reused.
export function resolveFormalMirror({mode,world,name,playerName}={},entry){
 if(mode!=='mirror'||![1,2].includes(world)||typeof playerName!=='string'||name!=='鏡像・'+playerName||entry?.formalBattleAllowed!==true)return null;
 return Object.freeze({id:'mirror-'+world,name,visual:{sizePolicy:'dungeon',visibleRatio:1.06,palette:'cyan-violet',effect:'rim',energy:1,mirror:true}});
}
