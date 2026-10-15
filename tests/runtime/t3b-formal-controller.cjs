'use strict';
const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const listeners=new Map(),w={document:{hidden:false,addEventListener:(k,v)=>listeners.set(k,v),removeEventListener:k=>listeners.delete(k)},addEventListener:(k,v)=>listeners.set(k,v),removeEventListener:k=>listeners.delete(k)};w.window=w;
for(const path of ['t3b-formal-projection.js','t3b-formal-controller.js'])vm.runInNewContext(fs.readFileSync('3d-test/'+path,'utf8'),{window:w,AbortController,Set,Object,Error});
const event={schema:1,lane:'formal',mode:'main',world:1,type:'battle-start',phase:'computed',availability:'authoritative',expired:false,battleId:'b1',sessionId:'b1',seq:1,actors:{player:{name:'P'},enemy:{id:'E',kind:'normal',location:'map'}},data:{}};
const flush=()=>new Promise(r=>setImmediate(r));let engines=0,draws=0,closed=0,lateResolve;
const api={prepare:async x=>x,create:async()=>{engines++;let dead=false;return{sample:()=>{assert.equal(dead,false);draws++;return true;},dispose:()=>{if(!dead){dead=true;engines--;closed++;}}};}};
const bridge={attach:f=>{bridge.f=f;return true;},detach:()=>{bridge.f=null;}};
const options={host:{},bridge,rendererAPI:api,policy:()=>({mode:'hybrid-b'}),clock:{sample:()=>({player:{clip:'attack',elapsedMs:100},enemy:{clip:'hit',elapsedMs:100}})},resolve:async()=>({})};
(async()=>{
 const C=w.CivilizationFormalBController;assert.equal(C.formalReleased,false);
 const s=C.create(options);assert.equal(s.attach(),true);assert.equal(s.accept(event),false);await flush();assert.equal(s.snapshot().ready,true);assert.equal(engines,1);
 assert.equal(s.accept({...event,type:'combat-action',seq:2}),false,'Computed history cannot be replayed');
 assert.equal(s.accept({...event,type:'snapshot',phase:'presentation',seq:3}),true);
 assert.equal(s.accept({...event,type:'snapshot',phase:'presentation',seq:3}),false);
 assert.equal(s.accept({...event,seq:4,lane:'gm-fixture'}),false);
 w.document.hidden=true;listeners.get('visibilitychange')();assert.equal(engines,0);
 w.document.hidden=false;listeners.get('visibilitychange')();assert.equal(s.accept({...event,seq:4,type:'snapshot'}),false);await flush();assert.equal(engines,1);
 s.accept({...event,type:'presentation-skipped',seq:5,phase:'presentation'});assert.equal(engines,0);
 s.dispose();s.dispose();assert.equal(listeners.size,0);assert.equal(bridge.f,null);
 const upstream=new AbortController(),cancelled=C.create(options);cancelled.accept(event,{signal:upstream.signal});await flush();assert.equal(engines,1);upstream.abort();await flush();assert.equal(engines,0);assert.equal(cancelled.snapshot().ready,false);cancelled.dispose();
 const rebound=C.create(options);rebound.accept(event);await flush();rebound.accept({...event,type:'presentation-skipped',seq:2});assert.equal(rebound.snapshot().ended,true);w.CivilizationCombatEvents={snapshot:()=>({battleId:'b1',presentation:{token:88}})};w.getCombatPresentationSnapshot=()=>({token:88,index:0});rebound.accept({...event,type:'snapshot',phase:'presentation',seq:3});await flush();assert.equal(rebound.snapshot().ready,true,'explicit live presentation token reopens computed-headless battle');rebound.dispose();delete w.CivilizationCombatEvents;delete w.getCombatPresentationSnapshot;
 const replaced=C.create(options);replaced.accept(event);await flush();replaced.accept({...event,type:'presentation-ended',phase:'presentation',seq:2,data:{reason:'replace'}});assert.equal(replaced.snapshot().ended,false);replaced.accept({...event,type:'snapshot',phase:'presentation',seq:3});await flush();assert.equal(replaced.snapshot().ready,true,'same-battle replacement presentation can remount');replaced.dispose();
 // An old resolver may settle after a new battle; it must not mount a late renderer.
 const late=C.create({...options,resolve:()=>new Promise(r=>lateResolve=r)});late.accept(event);late.accept({...event,battleId:'b2',sessionId:'b2',seq:1,type:'cancelled'});lateResolve({});await flush();assert.equal(engines,0);late.dispose();
 for(let i=0;i<100;i++){const x=C.create(options);x.accept({...event,battleId:'switch'+i,sessionId:'switch'+i});await flush();assert.equal(engines,1);x.dispose();assert.equal(engines,0);assert.equal(listeners.size,0);}
 const fail=C.create({...options,resolve:async()=>{throw Error('missing atlas');}});fail.accept(event);await flush();assert.equal(fail.snapshot().failed,true);assert.equal(engines,0);fail.dispose();
 assert.ok(draws>0&&closed>=100);
 console.log('PASS formal B controller: formal-only, computed history excluded, dedupe, background, stop, late load, missing assets, 100 lifecycle switches; mocked resource counter, not GPU measurement');
})().catch(e=>{console.error(e);process.exitCode=1;});
