// Content-addressed, reference-counted bitmap pool, isolated from SW and official registry.
const HASH=/^[a-f0-9]{64}$/;
export function createSpritePool({fetcher=globalThis.fetch,decode=globalThis.createImageBitmap,subtle=globalThis.crypto.subtle,limit=16*1024*1024,maxPending=2,usage='gm'}={}){
 const entries=new Map();let closed=false,bytes=0,clock=0,hits=0,loads=0;
 const evict=()=>{for(const [key,e] of [...entries].sort((a,b)=>a[1].used-b[1].used)){if(bytes<=limit)break;if(!e.refs&&e.bitmap){e.bitmap.close();bytes-=e.cost;entries.delete(key);}}};
 const remove=(key,e)=>{if(entries.get(key)!==e)return;e.controller.abort();entries.delete(key);if(e.bitmap){e.bitmap.close();bytes-=e.cost;}};
 return Object.freeze({
  async acquire(entry,{signal,layer=null}={}){
   if(closed||signal?.aborted)throw Error('sprite-aborted');
   const era=entry?.releaseKind==='era-player-v1'&&entry.singleLayer===true;
   if((usage==='formal'?entry?.formalBattleAllowed!==true:entry?.gmPreviewAllowed!==true)||entry?.status!=='complete'||entry.formalReleaseAllowed!==(era?true:false)||entry.gmTestStatus!==(era?'lightweight-accepted':'not-tested')||entry.version!=='1.0.0'||entry.facing!=='right-3/4'||entry.pivot?.join(',')!=='0.5,0.9')throw Error('sprite-unavailable');
   if(layer!==null&&(!['body','weapon'].includes(layer)||entry.weaponAnimation?.weaponAnimationStatus!=='complete'))throw Error('weapon-unavailable');
   const a=layer?entry.weaponAnimation[layer]:entry.asset,id=entry.id;
   if(era&&layer!==null&&(entry.weaponAnimation?.template!=='short-rising-cut'||layer!=='body'))throw Error('weapon-unavailable');
   const expected=era?layer?`assets/era-player/v1/${id}-attack-atlas.webp`:`assets/era-player/v1/${id}.webp`:layer?`assets/gm-equipment-2_5d/v1/${id}-${layer==='body'?'attack-body':'weapon'}.webp`:`assets/gm-equipment-2_5d/v1/${id}.webp`;
   if((era?!/^era-(galaxy|universe|higher)$/.test(id):entry.formalIdentity?.id!==id||!/^(?:g(?:00[1-9]|0[1-9]\d|100)|u(?:00[1-9]|0[1-9]\d|100)|h(?:0[1-9]|10))$/.test(id))||a?.path!==expected||!HASH.test(a.sha256)||!Number.isSafeInteger(a.bytes)||a.bytes<1||a.bytes>800000||a.width!==512||a.height!==512)throw Error('sprite-identity-version');
   const key=id+'|'+entry.version+'|'+a.sha256;let e=entries.get(key);
   if(!e){
    if([...entries.values()].filter(e=>!e.bitmap).length>=maxPending)throw Error('sprite-load-concurrency');
    const controller=new AbortController();e={refs:0,used:++clock,bitmap:null,cost:0,controller,promise:null};entries.set(key,e);loads++;
    e.promise=(async()=>{
     const url=new URL('../../'+a.path,import.meta.url);
     if(usage==='formal')url.searchParams.set('asset',a.sha256.slice(0,24));
     const verified=async(repair)=>{
      const target=new URL(url.href);if(repair)target.searchParams.set('repair','1');
      const response=await fetcher(target,{signal:controller.signal,cache:repair?'reload':usage==='formal'?'force-cache':'no-store'});
      if(!response.ok)throw Error('sprite-http:'+response.status);
      const data=await response.arrayBuffer();if(data.byteLength!==a.bytes)throw Error('sprite-bytes');
      const hash=[...new Uint8Array(await subtle.digest('SHA-256',data))].map(n=>n.toString(16).padStart(2,'0')).join('');if(hash!==a.sha256)throw Error('sprite-sha');
      const image=await decode(new Blob([data],{type:'image/webp'}));
      if(image.width!==a.width||image.height!==a.height){image.close();throw Error('sprite-dimensions');}
      return image;
     };
     let bitmap;
     try{bitmap=await verified(false);}
     catch(error){
      if(controller.signal.aborted||!['sprite-bytes','sprite-sha','sprite-dimensions'].includes(error?.message)&&error?.name!=='EncodingError')throw error;
      bitmap=await verified(true);
     }
     if(closed||controller.signal.aborted||entries.get(key)!==e){bitmap.close();throw Error('sprite-aborted');}
     if(bitmap.width!==a.width||bitmap.height!==a.height){bitmap.close();throw Error('sprite-dimensions');}
     e.cost=bitmap.width*bitmap.height*4;if(e.cost>limit){bitmap.close();throw Error('sprite-memory-budget');}
     e.bitmap=bitmap;bytes+=e.cost;evict();if(bytes>limit){remove(key,e);throw Error('sprite-memory-budget');}return bitmap;
    })().catch(error=>{remove(key,e);throw error;});
   }else hits++;
   e.refs++;e.used=++clock;let released=false,abortReject;
   const release=()=>{if(released)return;released=true;signal?.removeEventListener('abort',abort);e.refs--;if(!e.refs&&!e.bitmap)remove(key,e);evict();};
   const abort=()=>{release();abortReject?.(Error('sprite-aborted'));};
   const cancelled=new Promise((_,reject)=>{abortReject=reject;});signal?.addEventListener('abort',abort,{once:true});
   if(signal?.aborted)abort();
   try{const bitmap=await Promise.race([e.promise,cancelled]);if(released||closed)throw Error('sprite-aborted');return Object.freeze({bitmap,release,id,sha256:a.sha256});}
   catch(error){release();throw error;}
  },
  clear(){for(const [key,e] of entries)if(!e.refs)remove(key,e);},
  dispose(){if(closed)return;closed=true;for(const [key,e] of entries)remove(key,e);},
  stats(){return {entries:entries.size,bytes,limit,hits,loads,pending:[...entries.values()].filter(e=>!e.bitmap).length,refs:[...entries.values()].reduce((n,e)=>n+e.refs,0),closed};}
 });
}
