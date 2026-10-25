'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
function harness({saved=true,renderFails=false}={}){
 const state={dungeon:{mirror:{daily:{status:'running',wins:20,losses:0}}},titles:{unlocked:[]},vipPoints:0,vipLevel:0,hp:100};let persisted;
 const ctx={state,run:{active:true,wins:20,losses:0,currentResult:{}},battleBusy:true,view:'',BATTLE_TOTAL:20,Date,JSON,Object,Array,Number,String,console,
  rewardForWins:()=>10,mirrorDungeonStatus:()=>({status:state.dungeon.mirror.daily.status,history:{bestWins:0}}),
  recordMirrorDungeonCompletion:()=>{state.dungeon.mirror.daily.status='completed';return {ok:true};},addVipPoints:n=>{state.vipPoints+=n;return {added:n};},
  save:()=>{if(saved)persisted=JSON.parse(JSON.stringify(state));return saved;},settlementFor:()=>({wins:20}),render:()=>{if(renderFails)throw Error('render failure');},setTimeout};
 ctx.window=ctx;vm.runInNewContext(fs.readFileSync('settlementtransaction.js','utf8'),ctx);
 const source=fs.readFileSync('mirrordungeonrun.js','utf8'),start=source.indexOf('async function finishRun()'),end=source.indexOf('async function executeRun()',start);
 assert(start>=0&&end>start);vm.runInNewContext(source.slice(start,end)+'\nthis.finishRun=finishRun;',ctx);
 return {ctx,state,persisted:()=>persisted};
}
test('mirror save failure rolls back progress and rewards without replacing persistent references',async()=>{
 const h=harness({saved:false}),mirror=h.state.dungeon.mirror,titles=h.state.titles;
 await assert.rejects(h.ctx.finishRun());assert.equal(h.state.vipPoints,0);assert.equal(h.state.dungeon.mirror.daily.status,'running');
 assert.equal(h.state.dungeon.mirror,mirror);assert.equal(h.state.titles,titles);assert.equal(h.ctx.run.active,true);
});
test('a presentation failure after a committed mirror settlement cannot undo or repay its reward',async()=>{
 const h=harness({renderFails:true});await assert.rejects(h.ctx.finishRun(),/render failure/);
 assert.equal(h.state.dungeon.mirror.daily.status,'completed');assert.equal(h.state.vipPoints,10);assert.equal(h.persisted().vipPoints,10);
 await h.ctx.finishRun();assert.equal(h.state.vipPoints,10);assert.equal(h.state.dungeon.mirror.daily.status,'completed');
});
