'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
function harness({save=()=>false,read}={}){
 const store=new Map([['civilization_frontline_local_owner_v1','old-owner']]);let user={id:'new-owner'},writes=0;
 const oldState={saveVersion:18,level:10,exp:1,equipment:{weapon:{id:'keep'}},inventory:[]};
 const db={from:()=>({select:()=>({eq:()=>({maybeSingle:read||async function(){return {data:{save_data:{saveVersion:18,level:20,exp:2},updated_at:'2026-10-25',revision:1}};}})}),upsert:()=>{writes++;throw Error('unexpected write');}})};
 const context={state:oldState,console:{error(){},warn(){}},Date,setTimeout(){},location:{reload(){}},confirm:()=>true,
  document:{readyState:'complete',getElementById:()=>null},localStorage:{getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)},
  civilizationAuth:{getClient:()=>db,getUser:()=>user},save,registerAfterSaveHook(){},addEventListener(){},
  assertSaveVersionSupported:()=>({sourceVersion:18}),saveCompatibilityFor(){},migrateSave:s=>s,markSaveLoadResolved(){}};
 context.window=context;vm.runInNewContext(fs.readFileSync('cloudsave.js','utf8'),context);
 return {context,store,oldState,user:v=>user=v,writes:()=>writes};
}
test('failed cloud download preserves the original runtime root, nested references and local owner',async()=>{
 const h=harness();const gear=h.oldState.equipment;
 await h.context.civilizationCloudDownload();
 assert.equal(h.context.state,h.oldState);assert.equal(h.context.state.equipment,gear);
 assert.equal(h.store.get('civilization_frontline_local_owner_v1'),'old-owner');
});
test('account switch during cloud read cannot replace local state or upload another account snapshot',async()=>{
 for(const action of ['civilizationCloudDownload','civilizationCloudUpload']){
  let resolve;const h=harness({save:()=>true,read:()=>new Promise(r=>resolve=r)});
  if(action==='civilizationCloudUpload')h.store.set('civilization_frontline_local_owner_v1','new-owner');
  const task=h.context[action]();h.user({id:'switched-account'});resolve({data:{save_data:{saveVersion:18,level:20},revision:1}});await task;
  assert.equal(h.context.state,h.oldState);assert.equal(h.writes(),0);
 }
});
