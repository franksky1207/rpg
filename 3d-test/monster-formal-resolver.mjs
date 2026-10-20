// Formal presentation resolver: only main galaxy/universe, no fuzzy matching or gameplay writes.
import {registry,findMapping,findAsset} from './monster-sprites.mjs?v=20261021-batch14-formal1';
export function resolveFormalMonster({world,mode,kind,name,location,id}={}){
 if(mode!=='main'||!registry.formalBattleEnabled||![1,2].includes(world))return null;
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
