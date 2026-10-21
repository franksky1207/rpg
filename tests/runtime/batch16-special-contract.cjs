'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
(async()=>{
 const {resolveFormalMonster}=await import('../../3d-test/monster-formal-resolver.mjs');
 const rows=require('./batch16-special-fixtures.cjs');assert.equal(rows.length,18);
 for(const row of rows){
  const input={world:row.world==='galaxy'?1:2,mode:'special',kind:'special',name:row.name,location:row.specialId};
  const result=resolveFormalMonster(input);assert.equal(result?.mapping.id,row.id);assert.equal(result.asset.assetId,row.assetId);assert.equal(result.asset.facing,'left-3/4');
  for(const invalid of [{location:'unknown'},{location:''},{location:row.specialId+'x'},{id:'wrong-id'},{world:3},{world:0},{world:'1'},{world:input.world===1?2:1},{name:row.name+'偽'},{kind:'boss'},...['main','arena','bounty','void','calamity','mirror','alternate'].map(mode=>({mode}))])assert.equal(resolveFormalMonster({...input,...invalid}),null,JSON.stringify(invalid));
  // Execute the actual combat owner to prove identity is passed without altering results.
  const enemy={specialId:row.specialId,name:row.name,kind:'special'},resultCore={win:true,hp:77,events:[],logs:[],turns:2};let options;
  const context=vm.createContext({window:{},state:{hp:100,playerName:'測試'},playerCombatStats:()=>({}),runCombatCore:(p,e,h,o)=>{assert.equal(e,enemy);options=o;return resultCore;}});
  vm.runInContext(fs.readFileSync('specialcore.js','utf8'),context);
  const combat=context.window.specialFightCore(enemy,{world:input.world});assert.equal(options.visualContext.location,row.specialId);assert.equal(options.visualContext.world,input.world);assert.equal(combat.e,enemy);assert.equal(combat.win,true);assert.equal(combat.combatEndHp,77);
 }
 console.log('PASS 18 special owner identities, names/prototypes/facing, malformed and cross-era rejection, actual combat context/results');
})().catch(e=>{console.error(e);process.exitCode=1;});
