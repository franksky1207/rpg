// Independent monster validation and bounded decode pool. Player whitelist stays intact.
import {findAsset} from './monster-sprites.mjs?v=20261024-au-ten-stages1';
export function createMonsterPool({fetcher=globalThis.fetch,decode=globalThis.createImageBitmap,limit=2*512*512*4,usage='gm'}={}){
 const entries=new Map();let closed=false,hits=0,loads=0,clock=0;
 const cost=512*512*4,maxEntries=Math.max(1,Math.min(2,Math.floor(limit/cost)));
 function remove(key,e){if(entries.get(key)!==e)return;e.controller.abort();e.bitmap?.close();entries.delete(key);}
 function trim(reserve=0){for(const [key,e] of [...entries].sort((a,b)=>a[1].used-b[1].used)){if(entries.size+reserve<=maxEntries)break;if(!e.refs)remove(key,e);}}
 return Object.freeze({
  async acquire(id,{signal}={}){
   const a=findAsset(id);if(closed||signal?.aborted)throw Error('monster-aborted');
   if(!a||(usage==='formal'?a.formalBattleAllowed!==true:a.gmPreviewAllowed!==true)||a.facing!=='left-3/4'||a.width!==512||a.height!==512||!/^[a-f0-9]{64}$/.test(a.sha256))throw Error('monster-unavailable');
   let e=entries.get(id);
   if(!e){trim(1);if(entries.size>=maxEntries)throw Error('monster-memory-budget');
    e={refs:0,used:++clock,bitmap:null,controller:new AbortController()};entries.set(id,e);loads++;
    e.promise=(async()=>{
     const url=new URL('../'+a.path,import.meta.url);url.searchParams.set('asset',a.sha256.slice(0,24));
     const response=await fetcher(url,{signal:e.controller.signal,cache:'force-cache'});
     if(!response.ok)throw Error('monster-http:'+response.status);
     const bytes=await response.arrayBuffer();if(bytes.byteLength!==a.bytes)throw Error('monster-bytes');
     const hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(v=>v.toString(16).padStart(2,'0')).join('');
     if(hash!==a.sha256)throw Error('monster-sha');
     const bitmap=await decode(new Blob([bytes],{type:'image/webp'}));
     if(closed||e.controller.signal.aborted||entries.get(id)!==e){bitmap.close();throw Error('monster-aborted');}
     if(bitmap.width!==512||bitmap.height!==512){bitmap.close();throw Error('monster-dimensions');}
     e.bitmap=bitmap;return bitmap;
    })().catch(error=>{remove(id,e);throw error;});
   }else hits++;
   e.refs++;e.used=++clock;let released=false,rejectAbort;
   const release=()=>{if(released)return;released=true;signal?.removeEventListener('abort',abort);e.refs--;if(!e.refs&&(!e.bitmap||e.stale))remove(id,e);trim();};
   const abort=()=>{release();rejectAbort?.(Error('monster-aborted'));};
   const cancelled=new Promise((_,reject)=>{rejectAbort=reject;});signal?.addEventListener('abort',abort,{once:true});if(signal?.aborted)abort();
   try{const bitmap=await Promise.race([e.promise,cancelled]);if(released||closed)throw Error('monster-aborted');return {bitmap,release};}catch(error){release();throw error;}
  },
  clear(){for(const [key,e] of entries)if(!e.refs)remove(key,e);else e.stale=true;},
  dispose(){if(closed)return;closed=true;for(const [key,e] of entries)remove(key,e);},
  stats(){return {entries:entries.size,bytes:[...entries.values()].filter(e=>e.bitmap).length*cost,limit:maxEntries*cost,hits,loads,images:[...entries].map(([id,e])=>({id,decoded:!!e.bitmap,refs:e.refs})),pending:[...entries.values()].filter(e=>!e.bitmap).length,refs:[...entries.values()].reduce((n,e)=>n+e.refs,0),closed};}
 });
}

// Shared across formal modes, codex and versioned module URLs. SHA-owned sources
// remain in the existing SW; only two decoded prototype bitmaps are retained.
const SHARED_KEY=Symbol.for('civilization.monster-pool.20261024-repair2');
export function getSharedMonsterPool(){
 if(globalThis[SHARED_KEY])return globalThis[SHARED_KEY];
 const raw=createMonsterPool({usage:'formal'});let pending=null,idle=null;
 const cancel=()=>{if(idle!==null){if(typeof cancelIdleCallback==='function')cancelIdleCallback(idle);else clearTimeout(idle);idle=null;}pending?.controller.abort();pending=null;};
 const acquire=(id,options={})=>{
  if(pending&&pending.id!==id)cancel();
  return raw.acquire(id,options);
 };
 const prepare=(id,{signal,priority='next'}={})=>{
  if(signal?.aborted||globalThis.document?.hidden||globalThis.navigator?.connection?.saveData)return Promise.resolve(false);
  if(pending?.id===id)return pending.promise;
  cancel();const controller=new AbortController(),record={id,controller};pending=record;
  let finish;record.promise=new Promise(r=>finish=r);
  const abort=()=>{if(pending===record)cancel();else controller.abort();finish(false);};signal?.addEventListener('abort',abort,{once:true});
  const run=async()=>{
   idle=null;let lease;
   try{if(controller.signal.aborted)return;lease=await raw.acquire(id,{signal:controller.signal});finish(true);}
   catch(_){finish(false);}
   finally{lease?.release();signal?.removeEventListener('abort',abort);if(pending===record)pending=null;}
  };
  if(priority==='current')void run();
  else if(typeof requestIdleCallback==='function')idle=requestIdleCallback(run,{timeout:1000});
  else idle=setTimeout(run,0);
  // Cancelling a queued request must settle its promise as well.
  controller.signal.addEventListener('abort',()=>{signal?.removeEventListener('abort',abort);finish(false);},{once:true});
  return record.promise;
 };
 const clear=()=>{cancel();raw.clear();};
 const shared=Object.freeze({acquire,prepare,clear,stats:()=>({...raw.stats(),queued:pending?1:0}),dispose:()=>{clear();raw.dispose();delete globalThis[SHARED_KEY];}});
 globalThis[SHARED_KEY]=shared;
 for(const event of ['pagehide','civilization-auth-signed-out','civilization-resource-cache-cleared'])globalThis.addEventListener?.(event,clear);
 globalThis.document?.addEventListener('visibilitychange',()=>{if(document.hidden)clear();});
 return shared;
}
