import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {webcrypto} from 'node:crypto';
import {release} from '../../3d-test/era-player-sprites.mjs';import {createSpritePool} from '../../3d-test/equipment-sprites-v1/assets.mjs';
for(const usage of ['formal','gm'])test(`${usage}: only explicit era release, exact identity, bytes, SHA and safe failure cleanup`,async()=>{
 for(const e of release.entries){
  const raw=readFileSync(e.asset.path);let fetches=0,decodes=0,closes=0;
  const pool=createSpritePool({usage,subtle:webcrypto.subtle,fetcher:async()=>{fetches++;return new Response(raw);},decode:async()=>{decodes++;return {width:512,height:512,close(){closes++;}};}});
  for(const patch of [{formalReleaseAllowed:false},{status:'candidate-only'},{releaseKind:'candidate'},{id:'era-old-higher'},{gmTestStatus:'not-tested'},{asset:{...e.asset,path:'development/unsafe.webp'}},{asset:{...e.asset,sha256:'0'.repeat(64)}}])await assert.rejects(pool.acquire({...e,...patch}));
  assert.equal(pool.stats().refs,0);const [a,b]=await Promise.all([pool.acquire(e),pool.acquire(e)]);assert.equal(a.bitmap,b.bitmap);assert.equal(decodes,1);a.release();b.release();assert.equal(pool.stats().refs,0);pool.clear();assert.equal(closes,1);assert.equal(pool.stats().bytes,0);pool.dispose();
 }
});
test('new era HTTP/SHA/decode/dimension failures cannot retain references or bytes',async()=>{
 const e=release.entries[2],raw=readFileSync(e.asset.path);
 for(const fault of ['404','sha','decode','size']){const pool=createSpritePool({usage:'formal',subtle:webcrypto.subtle,fetcher:async()=>new Response(fault==='sha'?new Uint8Array(raw.length):raw,{status:fault==='404'?404:200}),decode:async()=>{if(fault==='decode')throw Error('decode');return {width:fault==='size'?256:512,height:512,close(){}};}});await assert.rejects(pool.acquire(e));assert.equal(pool.stats().refs,0);assert.equal(pool.stats().bytes,0);pool.dispose();}
});
