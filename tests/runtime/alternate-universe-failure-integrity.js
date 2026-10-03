const fs=require("fs");
const vm=require("vm");
function assert(condition,message){if(!condition)throw new Error(message);}
const source=fs.readFileSync("alternateuniverseattempt.js","utf8");
const reincarnationCore=fs.readFileSync("reincarnationcore.js","utf8");
const index=fs.readFileSync("index.html","utf8");
const workflow=fs.readFileSync(".github/workflows/runtime-integrity.yml","utf8");

const TRAITS=["strong","ferocious","hard","swift","deadly","berserk","giant"];
let saveCount=0;
const state={
 saveVersion:17,
 reincarnation:{
  count:1,
  breakthrough:{permanent:0,milestoneLifeId:1,milestones:{}},
  alternateUniverse:{unlocked:true,deepestCleared:4,activeAttempt:null,lifeFailures:{lifeId:1,failures:{}}}
 }
};
const sandbox={console,Date,Math,JSON,Object,Array,Set,Number,String,Boolean,state,window:{},globalThis:null};
sandbox.globalThis=sandbox;sandbox.window=sandbox;
sandbox.ALTERNATE_UNIVERSE_TRAIT_IDS=TRAITS.slice();
sandbox.MONSTER_TRAIT_IDS=TRAITS.slice();
sandbox.ALTERNATE_UNIVERSE_DATA_MAX_DEPTH=1000;
sandbox.reincarnationCount=target=>Math.max(0,Math.floor(Number(target?.reincarnation?.count)||0));
sandbox.alternateUniverseUnlocked=target=>target?.reincarnation?.alternateUniverse?.unlocked===true;
sandbox.alternateUniverseDeepestCleared=target=>Math.max(0,Math.min(1000,Math.floor(Number(target?.reincarnation?.alternateUniverse?.deepestCleared)||0)));
sandbox.alternateUniverseFailureCount=(target,depth)=>{
 const life=Math.max(0,Math.floor(Number(target?.reincarnation?.count)||0));
 const owner=target?.reincarnation?.alternateUniverse?.lifeFailures;
 if(!owner||Math.floor(Number(owner.lifeId))!==life)return 0;
 return Math.max(0,Math.min(10,Math.floor(Number(owner.failures?.[String(depth)])||0)));
};
sandbox.alternateUniverseDepthLocked=(target,depth)=>sandbox.alternateUniverseFailureCount(target,depth)>=10;
sandbox.alternateUniverseEnemyStats=depth=>({depth,hp:1,atk:1,def:0,crit:20,dodge:20});
sandbox.applyMonsterTraits=(enemy,traits)=>({...enemy,traits:traits.slice()});
sandbox.runSettlementTransaction=({label,mutate})=>{
 const before=JSON.stringify(state);
 try{
  const value=mutate(state);
  if(value===false||value?.ok===false){Object.keys(state).forEach(key=>delete state[key]);Object.assign(state,JSON.parse(before));return {ok:false,reason:value?.reason||"mutation-rejected",rolledBack:true,saved:false,label};}
  saveCount+=1;return {ok:true,reason:"",saved:true,label,value};
 }catch(error){Object.keys(state).forEach(key=>delete state[key]);Object.assign(state,JSON.parse(before));return {ok:false,reason:"mutation-exception",rolledBack:true,saved:false,label,error:String(error)};}
};
vm.createContext(sandbox);vm.runInContext(source,sandbox,{filename:"alternateuniverseattempt.js"});

assert(sandbox.ALTERNATE_UNIVERSE_ATTEMPT_VERSION===2,"3-4 後 AU attempt owner 應升為 v2。");
assert(sandbox.ALTERNATE_UNIVERSE_FAILURE_POLICY_VERSION===1,"AU failure lifecycle policy owner 缺失。");
assert(sandbox.ALTERNATE_UNIVERSE_FAILURE_LIMIT===10,"AU failure limit 必須固定為 10。");

let snap=sandbox.alternateUniverseFailureStatus(5,state);
assert(snap.depth===5&&snap.lifeId===1&&snap.failures===0&&snap.failuresRemainingBeforeLock===10&&!snap.locked&&snap.canRetry,"U5 初始 failure snapshot 錯誤。");

const rng=()=>0;
for(let failure=1;failure<=10;failure++){
 const started=sandbox.beginAlternateUniverseAttempt(5,{rng,attemptId:`life1-u5-${failure}`});
 assert(started.ok,`第 ${failure} 次挑戰在鎖定前應可建立。`);
 const settled=sandbox.settleAlternateUniverseAttempt("loss",{attemptId:`life1-u5-${failure}`});
 assert(settled.ok&&settled.failures===failure,`第 ${failure} 敗應正式累計。`);
 snap=sandbox.alternateUniverseFailureStatus(5,state);
 assert(snap.failures===failure,"failure snapshot 必須與正式 state 同步。");
 assert(snap.failuresRemainingBeforeLock===Math.max(0,10-failure),"剩餘失敗額度計算錯誤。");
 if(failure<10){assert(!snap.locked&&snap.canRetry,`第 ${failure} 敗後仍應可重試。`);}else{assert(snap.locked&&!snap.canRetry&&snap.unlockRequiresReincarnation,"第 10 敗後必須鎖定至下一輪轉生。");}
}
const blocked=sandbox.beginAlternateUniverseAttempt(5,{rng,attemptId:"must-not-start"});
assert(!blocked.ok&&blocked.reason==="depth-locked-for-life"&&blocked.failures===10&&blocked.locked===true,"第 10 敗後不得建立新 attempt。");

state.reincarnation.alternateUniverse.activeAttempt={lifeId:1,depth:5,attemptId:"stale-locked-attempt",traits:["strong","hard"]};
const staleStatus=sandbox.alternateUniverseChallengeStatus(5,state);
assert(!staleStatus.ok&&staleStatus.reason==="depth-locked-for-life"&&staleStatus.resumable===false,"即使殘留 activeAttempt，10 敗鎖定也必須優先 fail-closed。");
const abandoned=sandbox.abandonAlternateUniverseAttempt({attemptId:"stale-locked-attempt"});
assert(abandoned.ok&&abandoned.outcome==="abandon"&&abandoned.failures===10&&abandoned.locked===true,"鎖定狀態的殘留 attempt 可被正式放棄清除，但 failure 不得超過 10。");
assert(state.reincarnation.alternateUniverse.activeAttempt===null,"放棄後 activeAttempt 必須清空。");
assert(sandbox.alternateUniverseFailureStatus(5,state).failures===10,"放棄殘留 attempt 不得產生第 11 敗。");

state.reincarnation.count=2;
state.reincarnation.alternateUniverse.activeAttempt=null;
state.reincarnation.alternateUniverse.lifeFailures={lifeId:2,failures:{}};
snap=sandbox.alternateUniverseFailureStatus(5,state);
assert(snap.lifeId===2&&snap.failures===0&&!snap.locked&&snap.canRetry&&snap.unlockRequiresReincarnation===false,"下一輪轉生後同 U failure lock 必須解除。");
const nextLifeAttempt=sandbox.beginAlternateUniverseAttempt(5,{rng,attemptId:"life2-u5-1"});
assert(nextLifeAttempt.ok,"下一輪轉生後原鎖定 U 必須可再次挑戰。");

state.reincarnation.alternateUniverse.lifeFailures={lifeId:1,failures:{"5":10}};
state.reincarnation.alternateUniverse.activeAttempt=null;
snap=sandbox.alternateUniverseFailureStatus(5,state);
assert(snap.lifeId===2&&snap.failures===0&&!snap.locked,"舊 life failure owner 不得污染新 life。");

assert(/activeAttempt:null,lifeFailures:\{lifeId:newCount,failures:\{\}\}/.test(reincarnationCore),"正式轉生 reset 必須清除 AU activeAttempt 並以 newCount 建立空白 lifeFailures。");
assert(index.includes('src="alternateuniverseattempt.js?v=20261003-reincarnation-batch3-4"'),"3-4 AU attempt cache-bust 缺失。");
assert(workflow.includes("node tests/runtime/alternate-universe-failure-integrity.js"),"Runtime Integrity 必須正式執行 AU failure lifecycle test。");
assert(saveCount>=12,"failure lifecycle 測試應實際走共享 settlement transaction。");
console.log("Alternate Universe failure lifecycle integrity passed.");
