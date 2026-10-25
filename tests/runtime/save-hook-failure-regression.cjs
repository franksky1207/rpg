'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
function harness(base){
 const context={state:{gm:true},console:{error(){}},Date,save:base};context.window=context;
 vm.runInNewContext(fs.readFileSync('savehookcore.js','utf8'),context);
 return context;
}
test('a throwing before-save guard cannot persist unvalidated state; settlement still restores runtime',()=>{
 let writes=0,after=0,settled;
 const h=harness(()=>{writes++;return true;});
 h.registerBeforeSaveHook('runtime',c=>{c.state.gm=false;});
 h.registerBeforeSaveHook('guard',()=>{throw Error('validation failed');});
 h.registerAfterSaveHook('metadata',()=>after++);
 h.registerSaveSettlementHook('restore',c=>{settled=c;h.state.gm=true;});
 assert.equal(h.save(false),false);assert.equal(writes,0);assert.equal(after,0);assert.equal(h.state.gm,true);
 assert.equal(settled.cancelled,true);assert.equal(settled.cancelReason,'hook:guard');assert.equal(settled.result,false);
});
test('base-save exception always settles GM runtime and preserves the original exception',()=>{
 const fault=Error('storage fault');let settled,after=0;
 const h=harness(()=>{throw fault;});
 h.registerBeforeSaveHook('runtime',c=>{c.state.gm=false;});
 h.registerAfterSaveHook('metadata',()=>after++);
 h.registerSaveSettlementHook('restore',c=>{settled=c;h.state.gm=true;});
 assert.throws(()=>h.save(false),e=>e===fault);assert.equal(h.state.gm,true);assert.equal(after,0);
 assert.equal(settled.result,false);assert.equal(typeof settled.finishedAt,'number');
});
test('successful writes, rejected writes, and diagnostic hook failures keep their existing contract',()=>{
 for(const success of [true,false]){
  let after=0,settlements=0;const h=harness(()=>success);
  h.registerAfterSaveHook('broken-diagnostic',()=>{throw Error('diagnostic');});
  h.registerAfterSaveHook('metadata',()=>after++);
  h.registerSaveSettlementHook('broken-diagnostic',()=>{throw Error('diagnostic');});
  h.registerSaveSettlementHook('restore',()=>settlements++);
  assert.equal(h.save(false),success);assert.equal(after,success?1:0);assert.equal(settlements,1);
 }
});
