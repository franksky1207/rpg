'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
let handler=null,disposals=0;
const events={subscribe(fn,o){assert.equal(o.lane,'formal');handler=fn;return ()=>{disposals++;handler=null}},validateEvent:e=>e.valid===true,isCurrent:e=>e.current===true};
const listeners={};const window={CivilizationCombatEvents:events,addEventListener:(name,fn)=>listeners[name]=fn,
 CivilizationPresentationMode:{accountPreference:()=> '3d',currentMode:()=> 'text'}};
vm.runInNewContext(fs.readFileSync('3d-test/t3a-hybrid-policy.js','utf8'),{window});
const b=window.CivilizationFormalHybridBridge,p=window.CivilizationHybridBattlePolicy;
assert.equal(b.version,1);assert.equal(b.supportedModes.length,9);
assert.equal(b.monitor(),true);
let calls=0;
const event=(mode='main',world=1,seq=1)=>({lane:'formal',schema:1,battleId:'b1',seq,mode,world,availability:'authoritative',expired:false,valid:true,current:true});
handler(event());assert.equal(b.diagnostics().observed,1);assert.equal(calls,0);
assert.equal(b.attach(()=>calls++),true); // a visual consumer can attach after startup monitoring
assert.equal(b.attach(()=>calls++),false);
for(const [m,w] of [['bounty',3],['special',3],['calamity',3],['main',4],['gm-benchmark',1]]){
 handler(event(m,w,2));assert.equal(b.diagnostics().observed,1);
}
handler({...event(),lane:'gm-fixture'});handler({...event(),valid:false});handler({...event(),current:false});
assert.equal(b.diagnostics().observed,1);
b.detach();assert.equal(disposals,1);assert.equal(b.attach(()=>{calls++;throw Error('visual failed')}),true);
handler(event('alternate',3,1));assert.equal(calls,1);
assert.equal(b.diagnostics().canCommit,false);assert.equal(b.diagnostics().canCreateEvents,false);
listeners.pagehide();assert.equal(b.diagnostics().subscribed,false);
assert.equal(p.resolve({requestedMode:'hybrid-b',rendererReady:false}).effectiveMode,'text');
console.log('PASS T3-B formal-only bridge, unsupported realms, dedupe, hostile consumer isolation, teardown');
