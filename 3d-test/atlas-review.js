/* GM-only registered atlas inspection; manual source samples, no battle/audio clock. */
(function(global){
'use strict';
const clips=['idle','attack','hit','dodge','return','defeat'],labels=['待機','攻擊','受擊','閃避','返回','倒下'];
function mount({host,catalog,source,signal}){
 let closed=false,epoch=0,bitmaps=[],images=new Map(),rows=null;
 const own=new AbortController();host.replaceChildren();
 const status=document.createElement('p');status.setAttribute('role','status');host.append(status);
 const unavailable=()=>{status.textContent='尚無可用的已核准動畫圖集（unavailable）。';};
 if(source!=='fixture'||catalog?.schema!=='civilization.formal.b.enemy-atlas.v1'||catalog.approved!==true||catalog.publish!==true||!Array.isArray(catalog.entries)||!catalog.entries.length){unavailable();return Object.freeze({dispose:()=>host.replaceChildren(),snapshot:()=>({unavailable:true,canCommit:false,rafs:0})});}
 catalog=JSON.parse(JSON.stringify(catalog));
 const actor=document.createElement('select'),action=document.createElement('select'),frame=document.createElement('input'),canvas=document.createElement('canvas');
 actor.setAttribute('aria-label','圖集角色');action.setAttribute('aria-label','圖集動作');frame.type='range';frame.min=0;frame.max=21;frame.value=0;frame.setAttribute('aria-label','圖集畫格');canvas.width=400;canvas.height=400;canvas.style.cssText='display:block;width:min(100%,400px);height:auto;background:#081629';
 catalog.entries.forEach((r,i)=>{const o=document.createElement('option');o.value=i;o.textContent=r.name||'未命名圖集';actor.append(o);});clips.forEach((r,i)=>{const o=document.createElement('option');o.value=r;o.textContent=labels[i];action.append(o);});host.append(actor,action,frame,canvas);
 const release=()=>{for(const b of bitmaps)b.close();bitmaps=[];images.clear();rows=null;canvas.getContext("2d").clearRect(0,0,400,400);};
 function sample(){if(closed||!rows)return;const clip=action.value,row=rows[clip],image=images.get(clip),cell=row.frames[Number(frame.value)];if(!image||!cell)return;const ctx=canvas.getContext('2d');ctx.clearRect(0,0,400,400);const r=cell.rect,scale=Math.min(340/r[2],340/r[3]);ctx.drawImage(image,...r,(400-r[2]*scale)/2,380-r[3]*scale,r[2]*scale,r[3]*scale);status.textContent=labels[clips.indexOf(clip)]+' · '+cell.timeMs.toFixed(0)+' ms／700 ms（自由圖集檢視）';}
 async function load(){const ticket=++epoch;release();status.textContent='正在驗證動畫圖集…';
  try{const entry=catalog.entries[Number(actor.value)],layout=entry.layout;
   if(entry.reviewed!==true||layout?.durationMs!==700||layout.samples!==22||layout.clipStart!==1/30)throw Error('unavailable');
   const next=new Map(),opened=[];for(const clip of clips){
    const row=layout.clips?.[clip],asset=row?.asset;if(!asset||!/^assets\/[a-zA-Z0-9_./-]+\.png$/.test(asset.path)||asset.path.split('/').includes('..')||!asset.license?.trim()||!/^[a-f0-9]{64}$/.test(asset.sha256)||!Number.isSafeInteger(asset.bytes)||asset.bytes<=0||!Array.isArray(row.dimensions)||row.dimensions.length!==2||row.dimensions.some(n=>!Number.isSafeInteger(n)||n<=0)||row.frames?.length!==22||row.frames.some((f,i)=>!Array.isArray(f.rect)||f.rect.length!==4||f.rect.some(n=>!Number.isSafeInteger(n)||n<0)||f.rect[2]<=0||f.rect[3]<=0||f.rect[0]+f.rect[2]>row.dimensions[0]||f.rect[1]+f.rect[3]>row.dimensions[1]||!Number.isFinite(f.timeMs)||Math.abs(f.timeMs-i*700/21)>.01))throw Error('invalid-atlas');
    const response=await fetch('../'+asset.path+'?asset='+asset.sha256.slice(0,24),{signal:own.signal});if(!response.ok)throw Error('atlas-http');const bytes=await response.arrayBuffer();const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),x=>x.toString(16).padStart(2,'0')).join('');if(bytes.byteLength!==asset.bytes||hash!==asset.sha256)throw Error('atlas-integrity');
    const image=await createImageBitmap(new Blob([bytes],{type:'image/png'}));if(closed||ticket!==epoch){image.close();for(const b of opened)b.close();return;}if(image.width!==row.dimensions[0]||image.height!==row.dimensions[1]){image.close();throw Error('atlas-dimensions');}opened.push(image);bitmaps.push(image);next.set(clip,image);
   }
   if(closed||ticket!==epoch)return;images=next;rows=layout.clips;sample();
  }catch(error){if(!closed&&ticket===epoch){release();unavailable();}}
 }
 actor.addEventListener('change',load);action.addEventListener('change',sample);frame.addEventListener('input',sample);
 function dispose(){if(closed)return;closed=true;epoch++;own.abort();release();signal?.removeEventListener('abort',dispose);actor.removeEventListener('change',load);action.removeEventListener('change',sample);frame.removeEventListener('input',sample);host.replaceChildren();}
 signal?.addEventListener('abort',dispose,{once:true});if(signal?.aborted)dispose();else void load();
 return Object.freeze({dispose,snapshot:()=>({closed,ready:!!rows,bitmaps:bitmaps.length,canCommit:false,rafs:0})});
}
global.CivilizationGMAtlasReview=Object.freeze({mount,version:1,canCommit:false});
})(window);
