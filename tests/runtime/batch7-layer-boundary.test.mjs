import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {webcrypto} from 'node:crypto';
import {createSpritePool} from '../../3d-test/equipment-sprites-v1/assets.mjs';
import {WholeSuitActor} from '../../3d-test/equipment-sprites-v1/actor.mjs';

const root=new URL('../../',import.meta.url);
const read=path=>JSON.parse(readFileSync(new URL(path,root)));
const candidates=read('development/combat-animation/batch7/candidates/manifest.json');
const review=read('development/combat-animation/batch7/layer-review/review.json');

test('all three incoming layer sets remain quarantined from BOTH actual pool usages',async()=>{
 for(const usage of ['formal','gm']){
  let fetches=0,decodes=0;
  const pool=createSpritePool({usage,subtle:webcrypto.subtle,fetcher:async()=>{fetches++;throw Error('must not fetch');},decode:async()=>{decodes++;throw Error('must not decode');}});
  for(const entry of candidates.entries){
   for(const layer of [null,'body','weapon'])await assert.rejects(pool.acquire(entry,{layer}),/sprite-unavailable/);
   // One erroneously flipped publication flag must never authorize a candidate.
   await assert.rejects(pool.acquire({...entry,formalBattleAllowed:true,gmPreviewAllowed:true}),/sprite-unavailable/);
   // Even a fabricated complete status cannot alias an era source as old G art.
   await assert.rejects(pool.acquire({...entry,status:'complete',formalBattleAllowed:true,gmPreviewAllowed:true,formalReleaseAllowed:false,gmTestStatus:'not-tested',version:'1.0.0'}),/sprite-identity-version/);
  }
  assert.equal(fetches,0);assert.equal(decodes,0);
  assert.equal(pool.stats().entries,0);assert.equal(pool.stats().refs,0);assert.equal(pool.stats().bytes,0);
  pool.dispose();assert.equal(pool.stats().closed,true);
 }
});

test('actual Actor failure disposes canvas and owns no candidate leases',async()=>{
 const pool=createSpritePool({usage:'formal',subtle:webcrypto.subtle,fetcher:async()=>{throw Error('must not fetch');}});
 for(const entry of candidates.entries){
  const canvas={width:0,height:0,getContext:()=>({})};
  const actor=new WholeSuitActor(pool,entry,{canvasFactory:()=>canvas});
  await assert.rejects(actor.init(),/sprite-unavailable/);
  assert.equal(actor.closed,true);assert.equal(canvas.width,1);assert.equal(canvas.height,1);
  assert.equal(actor.weaponReady,false);assert.equal(actor.layers.length,0);actor.dispose();
 }
 assert.equal(pool.stats().bytes,0);assert.equal(pool.stats().refs,0);pool.dispose();
});

test('review documents six unaccepted actions per era and static cape constraints',()=>{
 assert.equal(review.formalReleaseAllowed,false);assert.equal(review.batch,7);
 assert.deepEqual(review.entries.map(e=>e.id),['era-galaxy','era-universe','era-higher']);
 for(const entry of review.entries){
  assert.equal(entry.setAccepted,false);assert.deepEqual(entry.acceptedLayers,[]);
  assert.deepEqual(Object.keys(entry.actions),['idle','attack','hit','dodge','return','defeat']);
  assert.ok(Object.values(entry.actions).every(x=>x==='blocked-not-accepted'));
  assert.equal(entry.finalGrip,null);assert.ok(entry.blockers.length);
 }
 const cape=review.higherLowLoadPlan;
 assert.equal(cape.capeMotion,'static-follow-body');assert.equal(cape.clothSimulation,false);
 assert.equal(cape.requiresHiddenCapeRepair,false);assert.equal(cape.runtimeReady,false);
 assert.ok(cape.layers.includes('rings-back')&&cape.layers.includes('rings-front'));
 assert.equal(cape.independentCelestialBodies,4);
 assert.equal(cape.relativeCapeBodyMotionAllowed,false);
});
