// Shared lease-aware LRU across formal combat, codex and GM. No game/save writes.
import {resolveMonsterAppearance,prepareMonsterAppearance,APPEARANCE_VERSION} from './monster-appearance.mjs?v=20261024-approved1';
import {findAsset} from './monster-sprites.mjs?v=20261024-au-ten-stages1';
const GLOBAL=Symbol.for('civilization.monster-appearance.approved1'),COST=2*512*512*4;
export function createMonsterAppearanceManager({limit,canvasFactory}={}){
 const memory=globalThis.navigator?.deviceMemory??2,cores=globalThis.navigator?.hardwareConcurrency??4;
 const capacity=Math.max(1,Math.min(4,Math.floor((limit??COST*(memory<=4||cores<=4?2:4))/COST)));
 const entries=new Map();let clock=0,closed=false,hits=0,misses=0,prepares=0,prepareMs=0,evictions=0,warm=null,epoch=0;
 const remove=(key,e)=>{if(entries.get(key)!==e)return;entries.delete(key);e.controller.abort();if(e.value){e.value.body.width=e.value.body.height=e.value.source.width=e.value.source.height=1;}evictions++;};
 const trim=reserve=>{for(const [k,e] of [...entries].sort((a,b)=>a[1].used-b[1].used))if(entries.size+reserve>capacity&&!e.refs)remove(k,e);};
 async function acquire(identity,{pool,signal}={}){
  if(closed||signal?.aborted)throw Error('appearance-aborted');const spec=resolveMonsterAppearance(identity),key=spec.key;let e=entries.get(key);
  if(!e){trim(1);if(entries.size>=capacity)throw Error('appearance-memory-budget');misses++;const generation=epoch;e={refs:0,used:++clock,controller:new AbortController(),value:null,stale:false};entries.set(key,e);
   e.promise=(async()=>{let raw;try{raw=await pool.acquire(spec.assetId,{signal:e.controller.signal});const prepared=await prepareMonsterAppearance(raw.bitmap,findAsset(spec.assetId),spec,{canvasFactory,signal:e.controller.signal});if(closed||generation!==epoch||entries.get(key)!==e||e.controller.signal.aborted){prepared.body.width=prepared.body.height=prepared.source.width=prepared.source.height=1;throw Error('appearance-aborted');}e.value=prepared;prepares++;prepareMs+=prepared.prepareMs;return prepared;}finally{raw?.release();}})().catch(error=>{remove(key,e);throw error;});
  }else hits++;
  e.refs++;e.used=++clock;let released=false,rejectAbort;
  const release=()=>{if(released)return;released=true;signal?.removeEventListener('abort',abort);e.refs--;if(!e.refs&&(!e.value||e.stale))remove(key,e);trim(0);};
  const abort=()=>{release();rejectAbort?.(Error('appearance-aborted'));},cancelled=new Promise((_,reject)=>rejectAbort=reject);signal?.addEventListener('abort',abort,{once:true});if(signal?.aborted)abort();
  try{const value=await Promise.race([e.promise,cancelled]);if(released||closed)throw Error('appearance-aborted');return {source:value.source,body:value.body,spec,release};}catch(error){release();throw error;}
 }
 function clear(){epoch++;warm?.controller.abort();warm=null;for(const [k,e] of entries)if(!e.refs)remove(k,e);else e.stale=true;}
 async function prepare(identity,{pool,signal,priority='next'}={}){
  if(closed||signal?.aborted||globalThis.document?.hidden||globalThis.navigator?.connection?.saveData)return false;
  const spec=resolveMonsterAppearance(identity);if(entries.get(spec.key)?.value)return true;
  if(priority!=='current'&&(memory<=2||cores<=2||capacity===1))return false;if(capacity===1&&[...entries.values()].some(e=>e.refs))return false;
  if(warm){if(warm.key===spec.key)return warm.promise;return false;}const controller=new AbortController(),record={key:spec.key,controller};warm=record;
  const abort=()=>controller.abort();signal?.addEventListener('abort',abort,{once:true});
  record.promise=(async()=>{let lease;try{if(priority!=='current'&&typeof requestIdleCallback==='function')await new Promise(resolve=>{const idle=requestIdleCallback(resolve);controller.signal.addEventListener('abort',()=>{cancelIdleCallback(idle);resolve();},{once:true});});if(controller.signal.aborted)return false;lease=await acquire(identity,{pool,signal:controller.signal});return true;}catch(_){return false;}finally{lease?.release();signal?.removeEventListener('abort',abort);if(warm===record)warm=null;}})();return record.promise;
 }
 return Object.freeze({acquire,prepare,clear,dispose(){clear();closed=true;},stats:()=>({version:APPEARANCE_VERSION,entries:entries.size,bytes:[...entries.values()].filter(e=>e.value).length*COST,limit:capacity*COST,capacity,refs:[...entries.values()].reduce((n,e)=>n+e.refs,0),pending:[...entries.values()].filter(e=>!e.value).length,hits,misses,prepares,prepareMs,evictions,queued:warm?1:0})});
}
export function getMonsterAppearanceManager(){
 if(globalThis[GLOBAL])return globalThis[GLOBAL];const manager=createMonsterAppearanceManager();globalThis[GLOBAL]=manager;
 for(const event of ['pagehide','civilization-auth-signed-out','civilization-resource-cache-cleared'])globalThis.addEventListener?.(event,manager.clear);
 globalThis.document?.addEventListener('visibilitychange',()=>{if(document.hidden)manager.clear();});return manager;
}
