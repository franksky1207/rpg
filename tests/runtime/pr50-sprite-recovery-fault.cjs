'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const sw=fs.readFileSync('resource-cache-sw.js','utf8'),renderer=fs.readFileSync('3d-test/t3b-formal-renderer.js','utf8');
assert.match(sw,/verifiedSprite\(saved,digest\)/);
assert.match(sw,/await cache\.delete\(key\);saved=null/);
assert.match(renderer,/sprite-repair=1/);
assert.match(renderer,/spritePool\?\.clear\(\)/);
let attempts=0;
const root={document:{hidden:false,addEventListener(){},removeEventListener(){}},addEventListener(){},removeEventListener(){},cancelAnimationFrame(){},requestAnimationFrame:()=>0};
root.window=root;
vm.runInNewContext(fs.readFileSync('3d-test/t3b-formal-controller.js','utf8'),{window:root,AbortController,Promise});
const snapshots=[];
const frame=(seq,type='encounter')=>({battleId:'fault-test',seq,type,phase:'presentation',background:false,canCommit:false,canEmitCombatEvents:false,enemyIdentity:{},actorNames:{enemy:'test'},world:'galaxy'});
const controller=root.CivilizationFormalBController.create({
 projection:{convert:e=>e},
 policy:()=>({requestedMode:'hybrid-b',effectiveMode:'hybrid-b',quality:'standard'}),
 resolve:async()=>({}),rendererAPI:{
  prepare:async()=>{if(++attempts===1)throw Error('sprite-sha');return {};},
  create:async()=>({dispose(){},resize(){},sample:()=>true,snapshot:()=>({engines:0})})
 },
 clock:{observe(){},reset(){},sample:()=>({clip:'idle',elapsedMs:0})},
 host:{}
});
const flush=()=>new Promise(resolve=>setImmediate(resolve));
(async()=>{
 controller.accept(frame(1));await flush();await flush();
 assert.equal(controller.snapshot().failed,true,'first failure must safely fall back');
 controller.accept(frame(2,'combat-action'));await flush();await flush();
 assert.equal(attempts,2,'next authentic presentation event retries exactly once');
 assert.equal(controller.snapshot().ready,true,'successful retry restores renderer');
 controller.dispose();
 assert.equal(controller.snapshot().ready,false,'dispose must release renderer');
 console.log('PASS Sprite corruption path and event-driven formal renderer recovery');
})().catch(error=>{console.error(error);process.exitCode=1});
