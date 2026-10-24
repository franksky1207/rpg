// Sole fixed appearance specification/render owner. Accepted designs are never selected again.
import {approvedArt} from './monster-approved-art.mjs?v=20261024-approved1';
import {mappings,findAsset} from './monster-sprites.mjs?v=20261024-au-ten-stages1';
import {paintArtSampleV2,BODY_VERSION} from './monster-body-v2.mjs?v=20261024-approved1';
import {render as renderEffects,VERSION as EFFECT_VERSION} from './monster-static-effects.mjs?v=20261024-approved1';
export const APPEARANCE_VERSION='20261024-approved1';
export const REVIEW_SOURCE=approvedArt.source;
const freeze=o=>{if(o&&typeof o==='object'&&!Object.isFrozen(o)){Object.values(o).forEach(freeze);Object.freeze(o);}return o;};
if(approvedArt.effectVersion!==EFFECT_VERSION||approvedArt.bodyVersion!==BODY_VERSION)throw Error('appearance-version-mismatch');
freeze(approvedArt);const resolved=new Map();
export function resolveMonsterAppearance(input,options){
 if(options?.designIndex!==undefined)throw Error('approved-art-is-fixed');
 const id=(typeof input==='string'?input:input?.id)?.replace(/^projection-/,'');const row=mappings[id];if(!row)throw Error('appearance-identity-required');
 const canonical=row.mode==='alternate'?'alternate-depth-'+String((row.universeNumber-1)*5+1).padStart(4,'0'):row.id;
 if(resolved.has(canonical))return resolved.get(canonical);
 const body=approvedArt.bodies[canonical],effect=approvedArt.effects[canonical],asset=findAsset(row.assetId);if(!body||!effect||!asset)throw Error('appearance-unregistered-identity');
 const key=[APPEARANCE_VERSION,asset.sha256,approvedArt.bodyVersion,approvedArt.bodyHashes[canonical],EFFECT_VERSION,approvedArt.effectHashes[canonical]].join(':');
 const rank=row.mode==='alternate'?7:row.world==='higher'?6:row.mode==='calamity'?(row.world==='universe'?5:4):['bounty','arena','void'].includes(row.mode)?3:row.kind==='special'?2:1;
 const value=freeze({id:canonical,assetId:row.assetId,version:APPEARANCE_VERSION,key,body,effect,rank,layer:effect.level+1,texture:effect.members.map(m=>m.id).join('+'),field:approvedArt.effectHashes[canonical],colors:{body:JSON.stringify(body.rules?.map(r=>r.target)||body.groups||[]),accent:effect.members[0].color,rim:effect.members[0].color}});resolved.set(canonical,value);return value;
}
export function appearanceFingerprint(input){return input?.key||resolveMonsterAppearance(input).key;}
export async function prepareMonsterAppearance(bitmap,asset,spec,{canvasFactory=()=>document.createElement('canvas'),signal}={}){
 signal?.throwIfAborted();const start=performance.now();let body=paintArtSampleV2(bitmap,asset,spec.body,{canvasFactory,bodyOnly:true}),source;
 try{
  // Review bodies were encoded by Canvas WebP quality .92. Match that accepted
  // raster before rendering effects, rather than subtly changing its material.
  if(body.toBlob&&globalThis.createImageBitmap){const blob=await new Promise(resolve=>body.toBlob(resolve,'image/webp',.92));signal?.throwIfAborted();if(blob?.type==='image/webp'){const raster=await createImageBitmap(blob);try{body.getContext('2d').clearRect(0,0,512,512);body.getContext('2d').drawImage(raster,0,0);}finally{raster.close();}}}
  signal?.throwIfAborted();source=renderEffects(body,spec.effect,{canvasFactory});
  const bc=body.getContext('2d',{willReadFrequently:true}),sc=source.getContext('2d',{willReadFrequently:true}),bp=bc.getImageData(0,0,512,512),sp=sc.getImageData(0,0,512,512);
  // Exact RGBA replacement, including semitransparent source edges. Only prep
  // reads pixels; six-action playback only draws the cached source.
  for(let i=0;i<bp.data.length;i+=4)if(bp.data[i+3])sp.data.set(bp.data.subarray(i,i+4),i);sc.putImageData(sp,0,0);signal?.throwIfAborted();
  return {body,source,prepareMs:performance.now()-start};
 }catch(error){body.width=body.height=1;if(source)source.width=source.height=1;throw error;}
}
export async function paintMonsterAppearance(bitmap,asset,spec,options){const prepared=await prepareMonsterAppearance(bitmap,asset,spec,options);prepared.body.width=prepared.body.height=1;return prepared.source;}
export function applyMirrorAppearance(canvas){
 canvas.style.filter='drop-shadow(1px 0 0 #87daed) drop-shadow(-1px 0 0 #b6caff)';
 canvas.style.outline='none';
 // Fixed hairline shards are behind the player raster, so equipment is never painted over.
 canvas.style.backgroundImage=canvas.dataset.clip==='defeat'?'none':'linear-gradient(115deg,transparent 28%,#8ce4ed80 28.2%,transparent 28.6%,transparent 68%,#c0d0ff70 68.2%,transparent 68.6%),linear-gradient(30deg,transparent 52%,#b4e7f080 52.2%,transparent 52.6%)';
 canvas.style.clipPath='polygon(0 0,96% 0,100% 7%,100% 92%,96% 100%,4% 100%,0 94%)';
 canvas.dataset.effect='mirror-projection';
}
