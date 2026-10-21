import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createMonsterPool} from '../../3d-test/monster-sprite-pool.mjs';
import {registry,plannedAssetId,mappings,findMapping} from '../../3d-test/monster-sprites.mjs';
import {MonsterActor,monsterPose,monsterPlacement} from '../../3d-test/monster-actor.mjs';
const rows=registry.assets;
function fixture(options={}){let fetched=0,decoded=0,closed=0;const pool=createMonsterPool({fetcher:async url=>{fetched++;return new Response(await fs.readFile(new URL('../../'+rows.find(a=>url.pathname.endsWith(a.path)).path,import.meta.url)));},decode:async()=>{decoded++;return {width:512,height:512,close(){closed++;}};},...options});return {pool,counts:()=>({fetched,decoded,closed})};}
test('same image shares in-flight decode; LRU bounded; all bitmaps close',async()=>{const f=fixture();const [a,b]=await Promise.all([f.pool.acquire('hm-01'),f.pool.acquire('hm-01')]);assert.equal(a.bitmap,b.bitmap);assert.equal(f.counts().decoded,1);a.release();b.release();
 for(const row of rows){const lease=await f.pool.acquire(row.assetId);lease.release();assert.ok(f.pool.stats().entries<=2);assert.ok(f.pool.stats().bytes<=2*512*512*4);}f.pool.dispose();assert.equal(f.pool.stats().bytes,0);assert.equal(f.counts().decoded,f.counts().closed);});
test('cancel obsolete load and close late bitmap',async()=>{let finish,closed=0;const f=fixture({decode:()=>new Promise(resolve=>finish=()=>resolve({width:512,height:512,close(){closed++;}}))});const abort=new AbortController();const pending=f.pool.acquire('ship-01',{signal:abort.signal});while(!finish)await new Promise(resolve=>setImmediate(resolve));abort.abort();await assert.rejects(pending,/aborted/);finish();await new Promise(resolve=>setImmediate(resolve));assert.equal(closed,1);assert.equal(f.pool.stats().entries,0);f.pool.dispose();});
test('corrupt bytes, unknown identity, capacity and disposed reject safely',async()=>{const bad=fixture({fetcher:async()=>new Response(new Uint8Array(rows[0].bytes))});await assert.rejects(bad.pool.acquire('hm-01'),/monster-sha/);assert.equal(bad.pool.stats().entries,0);bad.pool.dispose();
 const f=fixture();await assert.rejects(f.pool.acquire('missing'),/unavailable/);const a=await f.pool.acquire('hm-01'),b=await f.pool.acquire('ship-01');await assert.rejects(f.pool.acquire('bio-02'),/memory-budget/);a.release();b.release();f.pool.dispose();await assert.rejects(f.pool.acquire('hm-01'),/aborted/);});
test('registry remains trial-only; fixed pulse body and bounded motion; all 609 planned lookups',async()=>{assert.equal(registry.formalBattleEnabled,true);const design=JSON.parse(await fs.readFile(new URL('../../docs/MONSTER_MAP_MAPPING_BATCH13_STEP1_2026-10-20.json',import.meta.url)));for(const row of design.records)assert.equal(plannedAssetId(row.id),row.assetId);assert.equal(plannedAssetId('__proto__'),null);
 for(let ms=0;ms<=700;ms+=7){const p=monsterPose('pulse','attack',ms);assert.equal(p.x,0);assert.equal(p.y,0);assert.equal(p.rotation,0);assert.equal(p.scaleX,1);assert.equal(p.scaleY,1);}assert.ok(monsterPose('pounce','attack',336).x<0);assert.ok(monsterPose('short-thrust','attack',336).x<0);});

test('all 609 visual variants share bounded stage placement; fixed structures do not lunge',()=>{
 for(const row of Object.values(mappings))for(const width of [1365/2,390/2,844/2])for(const scale of [.6,row.visual.scale,1.3]){
  const p=monsterPlacement(width,240,row.visual,scale);assert.ok(p.size>0);assert.ok(p.x+p.size*.16>=0);assert.ok(p.x+p.size*.84<=width);assert.ok(p.y+p.size*.16>=0);assert.ok(p.y+p.size*.84<=240);
 }
 for(let ms=0;ms<=700;ms+=7){const p=monsterPose('stationary-shot','attack',ms);assert.equal(p.x,0);assert.equal(p.y,0);assert.equal(p.rotation,0);}
 assert.equal(findMapping('__proto__'),null);assert.equal(findMapping('galaxy-map-041').assetId,'hm-02');
});

test('HTTP, decode, integrity and cleared storage recover on the same pool',async()=>{
 for(const fault of ['http','decode','sha','bytes']){
  let broken=true,closed=0,decoded=0;
  const f=fixture({fetcher:async()=>{if(broken&&fault==='http')return new Response(null,{status:503});let bytes=await fs.readFile(new URL('../../'+rows[0].path,import.meta.url));if(broken&&fault==='bytes')bytes=bytes.subarray(0,50);if(broken&&fault==='sha'){bytes=Buffer.from(bytes);bytes[100]^=1;}return new Response(bytes);},decode:async()=>{if(broken&&fault==='decode')throw Error('injected decode');decoded++;return {width:512,height:512,close(){closed++;}};}});
  await assert.rejects(f.pool.acquire(rows[0].assetId));assert.equal(f.pool.stats().pending,0);assert.equal(f.pool.stats().refs,0);assert.equal(f.pool.stats().bytes,0);
  broken=false;const a=await f.pool.acquire(rows[0].assetId);a.release();f.pool.clear();assert.equal(f.pool.stats().bytes,0);
  const b=await f.pool.acquire(rows[0].assetId);b.release();f.pool.dispose();assert.equal(closed,decoded,fault+' leaks no bitmap');
 }
});
test('leave during download then reenter; active lease survives clear until release',async()=>{
 let complete;const f=fixture({fetcher:()=>new Promise(r=>complete=async()=>r(new Response(await fs.readFile(new URL('../../'+rows[0].path,import.meta.url))))) });
 const ac=new AbortController(),pending=f.pool.acquire(rows[0].assetId,{signal:ac.signal});while(!complete)await new Promise(r=>setImmediate(r));ac.abort();await assert.rejects(pending,/aborted/);await complete();await new Promise(r=>setImmediate(r));assert.equal(f.pool.stats().refs,0);f.pool.dispose();
 const next=fixture(),lease=await next.pool.acquire(rows[0].assetId);next.pool.clear();assert.equal(next.pool.stats().refs,1);lease.release();next.pool.clear();assert.equal(next.pool.stats().bytes,0);next.pool.dispose();assert.equal(next.counts().closed,next.counts().decoded);
});

test('actor disposed during initialization releases a late lease without an external abort',async()=>{
 let finish,released=0;const pool={acquire:()=>new Promise(r=>finish=()=>r({bitmap:{},release(){released++;}}))};
 const canvas={width:0,height:0,getContext:()=>({}),remove(){},dataset:{}};
 const actor=new MonsterActor(pool,'hm-01',{canvasFactory:()=>canvas}),pending=actor.init();actor.dispose();finish();
 await assert.rejects(pending,/monster-aborted/);assert.equal(released,1);
});
