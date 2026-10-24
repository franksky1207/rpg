import {resolveMonsterAppearance,paintMonsterAppearance,appearanceFingerprint} from './3d-test/monster-appearance.mjs?v=20261024-identity-v1';
import {getSharedMonsterPool} from './3d-test/monster-sprite-pool.mjs?v=20261024-repair2';
import {findMapping,findAsset} from './3d-test/monster-sprites.mjs?v=20261024-au-ten-stages1';
const pool=getSharedMonsterPool();
const placements=new Map();
// Tiny geometry records only: no retained codex bitmaps or appearance canvases.
function placement(bitmap,asset){
 const key=asset.sha256;let result=placements.get(key);if(result)return result;
 const scratch=document.createElement('canvas');scratch.width=scratch.height=512;
 const ctx=scratch.getContext('2d'),[l,t,r,b]=asset.alphaBounds;
 const scale=Math.min(512*.79/(r-l),512*.79/(b-t));
 const x=256-(l+r)/2*scale,y=256-(t+b)/2*scale;
 ctx.drawImage(bitmap,x,y,512*scale,512*scale);
 const pixels=ctx.getImageData(0,0,512,512).data;let left=512,top=512,right=-1,bottom=-1;
 for(let i=3;i<pixels.length;i+=4)if(pixels[i]>0){const px=(i-3)/4%512,py=Math.floor((i-3)/4/512);left=Math.min(left,px);right=Math.max(right,px);top=Math.min(top,py);bottom=Math.max(bottom,py);}
 if(right<left)throw Error('monster-empty');
 result={x,y,size:512*scale,shiftX:Math.round(256-(left+right+1)/2),shiftY:Math.round(256-(top+bottom+1)/2)};
 scratch.width=scratch.height=1;
 if(placements.size>=39)placements.delete(placements.keys().next().value);placements.set(key,result);return result;
}
export async function drawCodexMonster(canvas,row,{signal,appearanceRoute}={}){
 const mapping=findMapping(row.id)||findMapping(row.id.replace(/^projection-/,''));
 const asset=findAsset(mapping?.assetId);if(!mapping||!asset)throw Error('monster-unavailable');
 let lease;
 try{
  lease=await pool.acquire(asset.assetId,{signal});if(!canvas.isConnected)return;
  const ctx=canvas.getContext('2d'),p=placement(lease.bitmap,asset);
  ctx.clearRect(0,0,canvas.width,canvas.height);
  const appearance=resolveMonsterAppearance(mapping,{route:appearanceRoute});canvas.style.filter='none';canvas.dataset.appearance=appearanceFingerprint(appearance);
  const prepared=document.createElement('canvas');prepared.width=prepared.height=512;
  const source=paintMonsterAppearance(lease.bitmap,asset,appearance);
  prepared.getContext('2d').drawImage(source,p.x,p.y,p.size,p.size);source.width=source.height=1;
  ctx.drawImage(prepared,p.shiftX,p.shiftY);prepared.width=prepared.height=1;
  canvas.dataset.palette=mapping.visual.palette;
  canvas.nextElementSibling.textContent='';
 }finally{lease?.release();}
}
