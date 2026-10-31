'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('cloudsave.js','utf8');
const fresh=(count=0,permanent=0,dead=0)=>({level:2000,exp:42,reincarnation:{count,breakthrough:{permanent}},thirdWorld:{bosses:Array.from({length:10},(_,i)=>({currentHp:i<dead?0:1}))},offline:{pendingSettlement:{},timeLockUntil:99}});
function fixture(local=fresh(),remote=fresh(3,17)){
 const storage=new Map(),requests=[],confirms=[],timers=[];let uid='one',failure=null,answer=false,uploaded=null,saveOK=true;
 const data=remote?{save_data:remote,level:remote.level,exp:remote.exp,revision:4,updated_at:'2026-10-30T00:00:00Z'}:null;
 const c={addEventListener(){},state:local,console:{error(){}},Date,Set,localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},document:{readyState:'loading',addEventListener(){},getElementById(){return null;}},location:{reload(){c.reloaded=true;}},setTimeout:fn=>timers.push(fn),confirm:t=>{confirms.push(t);return answer;},save:()=>saveOK};c.window=c;
 const client={from(table){assert.equal(table,'game_saves');let fields,write;const q={select(v){fields=v;return q;},eq(k,v){assert.equal(k,'user_id');assert.equal(v,uid);return q;},upsert(row){write=row;uploaded=row;return q;},async maybeSingle(){requests.push(fields);return {data:failure?null:data&&Object.fromEntries(fields.split(',').map(k=>[k,data[k]])),error:failure};},async single(){requests.push('upsert:'+fields);return {data:write,error:failure};}};return q;}};
 Object.assign(c,{civilizationAuth:{getClient:()=>client,getUser:()=>uid?{id:uid}:null},registerAfterSaveHook(){},assertSaveVersionSupported:()=>({sourceVersion:17}),saveCompatibilityFor(){},migrateSave:s=>s});
 vm.createContext(c);for(const p of ['thirdworldphase.js','reincarnationstate.js'])vm.runInContext(fs.readFileSync(p,'utf8'),c);
 vm.runInContext(source.replace(' function initialize(){',' window.__test={sectionHtml,confirmSummary,progressionVisible,mount};initialize();\n function initialize(){'),c);
 return {c,api:c.civilizationCloudSave,requests,confirms,storage,timers,setAnswer:v=>answer=v,setFailure:v=>failure=v,setUser:v=>uid=v,setSave:v=>saveOK=v,get uploaded(){return uploaded;}};
}
(async()=>{
 for(const dead of [0,1,9])for(const level of [1,1000,2000]){
  const s=fresh(0,0,dead);s.level=level;const f=fixture(s);await f.api.refreshMeta();
  assert.doesNotMatch(f.c.__test.sectionHtml(),/轉生|突破/);await f.api.upload();await f.api.download();
  assert(f.confirms.length===2);for(const t of f.confirms)assert.doesNotMatch(t,/轉生|突破/);
  assert.equal(f.requests[0],'updated_at,level,exp,revision');assert.equal(f.requests[1],f.requests[0]);
 }
 for(const s of [fresh(0,0,10),fresh(2,7)]){
  const f=fixture(s);const before=JSON.stringify(s);await Promise.all([f.api.refreshMeta(),f.api.refreshMeta()]);assert.equal(f.requests.length,1);
  for(let i=0;i<10;i++)f.c.__test.sectionHtml();assert.equal(f.requests.length,1);assert.equal(JSON.stringify(s),before);
  const html=f.c.__test.sectionHtml();assert.match(html,/轉生次數/);assert.match(html,/永久突破等級/);assert.match(html,/Lv.17/);
  if(s.reincarnation.count===0){assert.match(html,/0 次/);assert.match(html,/Lv.0/);}else assert.match(html,/Lv.7/);
  await f.api.upload();await f.api.download();for(const t of f.confirms){assert.match(t,/轉生次數/);assert.match(t,/永久突破等級 Lv.17/);}
 }
 const old=fixture(fresh(1,4),{level:1,exp:0});await old.api.refreshMeta();assert.match(old.c.__test.sectionHtml(),/未知/);assert.doesNotMatch(old.c.__test.sectionHtml(),/Lv.0/);
 const missing=fixture({level:2000,thirdWorld:{bosses:Array(10).fill({currentHp:0})}});await missing.api.refreshMeta();assert.match(missing.c.__test.sectionHtml(),/未知/);
 for(const bad of [undefined,null,-1,'2',NaN,Infinity]){const f=fixture(fresh());f.c.state.reincarnation.count=bad;assert.equal(f.c.__test.progressionVisible(),false);}
 const absent=fixture(fresh(1,1),null);await absent.api.refreshMeta();assert.match(absent.c.__test.sectionHtml(),/尚未建立/);
 const failed=fixture(fresh(1,1));failed.setFailure(new Error('network'));await failed.api.refreshMeta();assert.equal(failed.api.getCloudMeta(),null);assert.doesNotMatch(failed.c.__test.sectionHtml(),/Lv.0/);
 const transfer=fixture();transfer.setAnswer(true);await transfer.api.download();assert.doesNotMatch(transfer.confirms[0],/轉生|突破/);assert.equal(transfer.requests.length,1);assert.equal(transfer.c.state.reincarnation.breakthrough.permanent,17);assert.equal(transfer.c.state.offline.timeLockUntil,0);assert.equal(transfer.c.state.offline.pendingSettlement,undefined);assert.equal(transfer.c.state.offline.lastSettledAt,transfer.c.state.offline.maxObservedWallClock);transfer.timers[0]();assert(transfer.c.reloaded);const reboot=fixture(transfer.c.state);await reboot.api.refreshMeta();assert.match(reboot.c.__test.sectionHtml(),/Lv.17/);
 const up=fixture(fresh(2,7));up.setAnswer(true);await up.api.upload();assert.equal(up.requests.length,2);assert.equal(up.uploaded.save_data.reincarnation.breakthrough.permanent,7);assert.equal(up.api.getCloudMeta().progression.permanent,7);assert.equal(up.uploaded.revision,5);
 const mismatch=fixture();mismatch.storage.set('civilization_frontline_local_owner_v1','other');await mismatch.api.upload();assert.equal(mismatch.requests.length,0);mismatch.setAnswer(true);await mismatch.api.download();assert.equal(mismatch.storage.get('civilization_frontline_local_owner_v1'),'one');
 const failSave=fixture();failSave.setAnswer(true);failSave.setSave(false);const prior=failSave.c.state;await failSave.api.download();assert.equal(failSave.c.state,prior);assert.equal(failSave.timers.length,0);
 const cancelled=fixture();await cancelled.api.upload();assert.equal(cancelled.uploaded,null);await cancelled.api.download();assert.equal(cancelled.timers.length,0);
 assert.doesNotMatch(fs.readFileSync('cloudsaveguide.js','utf8'),/轉生|突破/);
 console.log('PASS cloud save A–H/J: formal ten-boss gate, unknown fields, confirmations, transfer/reload, payload reuse, ownership, offline reset, request deduplication.');
})().catch(e=>{console.error(e);process.exitCode=1;});
