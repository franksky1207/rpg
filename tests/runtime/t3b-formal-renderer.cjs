'use strict';
const fs=require('node:fs'),crypto=require('node:crypto'),assert=require('node:assert/strict'),vm=require('node:vm');
const w={crypto:crypto.webcrypto,fetch:async()=>{throw Error('unexpected network');}};w.window=w;
for(const f of ['t3b-formal-assets.js','t3b-formal-renderer.js'])vm.runInNewContext(fs.readFileSync('3d-test/'+f,'utf8'),{window:w,Uint8Array,WeakMap,Object,Array,Number,Error,JSON,setTimeout,clearTimeout});
const R=w.CivilizationFormalBRenderer,controller=new AbortController(),signal=controller.signal;
const bytes=Buffer.from('not a renderer asset; hash-gate test only'),sha=crypto.createHash('sha256').update(bytes).digest('hex');
const row={id:'p',path:'assets/test/player.glb',sha256:sha,bytes:bytes.length,license:'test only',type:'character',quality:'low'};
const identity={id:'enemy',world:1,kind:'normal',location:'test'};
const clip={asset:{...row,path:'assets/test/atlas.png'},dimensions:[22,1],frames:Array.from({length:22},(_,i)=>({rect:[i,0,1,1]}))};
const layout={durationMs:700,samples:22,clipStart:1/30,clips:Object.fromEntries(['idle','attack','hit','dodge','return','defeat'].map(x=>[x,clip]))};
const options={registry:{schema:1,player:{low:'p'},assets:[row]},catalog:{schema:'civilization.formal.b.enemy-atlas.v1',publish:true,approved:true,entries:[{...row,...identity,tier:'low',reviewed:true,layout}]},tier:'low',identity,appearance:{},approval:{player:true,equipment:true},signal,fetch:async()=>({ok:true,arrayBuffer:async()=>bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength)})};
(async()=>{
 await assert.rejects(R.prepare({...options,approval:{player:false}}),/unapproved/);
 await assert.rejects(R.prepare({...options,catalog:{...options.catalog,approved:false}}),/unreleased/);
 await assert.rejects(R.prepare({...options,identity:{...identity,id:'wrong'}}),/unmapped/);
 await assert.rejects(R.prepare({...options,fetch:async()=>({ok:true,arrayBuffer:async()=>new Uint8Array(bytes.length).buffer})}),/integrity/);
 await assert.rejects(R.prepare({...options,appearance:{helmet:{name:'G006',world:1,chapter:1,area:1,level:31}}}),/unmapped-equipment/);
 for(const field of [{masterPivot:[NaN,0]},{masterTrim:[0,0,1,0]},{masterTrim:[0,0,23,1]}]){
  const bad={...clip,sourceFrameDimensions:[22,1],frames:clip.frames.map((f,i)=>i===0?{...f,...field}:f)};
  await assert.rejects(R.prepare({...options,catalog:{...options.catalog,entries:[{...options.catalog.entries[0],layout:{...layout,clips:{...layout.clips,idle:bad}}}]}}),/invalid-atlas-timing/);
 }
 const token=await R.prepare(options);assert.ok(Object.isFrozen(token));assert.equal(token.body,undefined,'Verified bytes must not be exposed for post-verification mutation');
 await assert.rejects(R.create({bundle:{...token},host:{},signal,isCurrent:()=>true}),/unverified/);
 controller.abort();await assert.rejects(R.prepare(options));assert.equal(R.rendererReleased,false);assert.equal(R.fixtureAllowed,false);
 console.log('PASS formal renderer: art approval, exact identity, SHA/bytes, unavailable G006, opaque verified token, abort; no raster claim');
})().catch(e=>{console.error(e);process.exitCode=1;});
