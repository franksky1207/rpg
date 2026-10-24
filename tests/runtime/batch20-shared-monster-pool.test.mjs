import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {getSharedMonsterPool} from '../../3d-test/monster-sprite-pool.mjs?v=20261024-repair2';
import {registry} from '../../3d-test/monster-sprites.mjs';
test('formal/codex/version URLs share two decoded prototypes; current cancels speculative work; clear/retry is bounded',async()=>{
 const originalFetch=globalThis.fetch,originalDecode=globalThis.createImageBitmap;
 let fetches=0,decodes=0,closed=0,delay=false,finish;
 globalThis.fetch=async(url,{signal}={})=>{
  fetches++;const asset=registry.assets.find(a=>url.pathname.endsWith(a.path));
  if(delay)await new Promise((resolve,reject)=>{finish=resolve;signal.addEventListener('abort',()=>reject(Error('aborted')),{once:true});});
  return new Response(await fs.readFile(new URL('../../'+asset.path,import.meta.url)));
 };
 globalThis.createImageBitmap=async()=>{decodes++;return {width:512,height:512,close(){closed++;}};};
 const pool=getSharedMonsterPool();
 try{
  const {getSharedMonsterPool:otherURL}=await import('../../3d-test/monster-sprite-pool.mjs?different-consumer');assert.equal(pool,otherURL());
  const [battle,codex]=await Promise.all([pool.acquire('hm-01'),otherURL().acquire('hm-01')]);assert.equal(battle.bitmap,codex.bitmap);assert.equal(fetches,1);assert.equal(decodes,1);codex.release();battle.release();
  delay=true;const next=pool.prepare('ship-01',{priority:'current'});while(!finish)await new Promise(r=>setImmediate(r));
  delay=false;const current=await pool.acquire('mech-02');assert.equal(await next,false);current.release();assert.ok(pool.stats().entries<=2);assert.ok(pool.stats().pending===0);assert.equal(pool.stats().queued,0);
  const active=await pool.acquire('mech-02');pool.clear();assert.equal(pool.stats().refs,1);active.release();assert.equal(pool.stats().entries,0,'clear marks active entries for release');
  const before=fetches;const again=await pool.acquire('mech-02');again.release();assert.equal(fetches,before+1);pool.clear();
  const ac=new AbortController();ac.abort();assert.equal(await pool.prepare('hm-01',{signal:ac.signal}),false);assert.equal(pool.stats().entries,0);
  // One active plus one exact next prototype fit; a third pinned decode is refused.
  const a=await pool.acquire('hm-01');assert.equal(await pool.prepare('ship-01',{priority:'current'}),true);const b=await pool.acquire('ship-01');await assert.rejects(pool.acquire('bio-02'),/memory-budget/);a.release();b.release();
  assert.ok(pool.stats().bytes<=2*512*512*4);
 }finally{pool.dispose();globalThis.fetch=originalFetch;globalThis.createImageBitmap=originalDecode;}
 assert.equal(decodes,closed);assert.equal(pool.stats().refs,0);assert.equal(pool.stats().pending,0);
});
