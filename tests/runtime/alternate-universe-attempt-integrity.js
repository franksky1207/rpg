const fs=require("fs");
const vm=require("vm");
function assert(condition,message){if(!condition)throw new Error(message);}
const source=fs.readFileSync("alternateuniverseattempt.js","utf8");
const index=fs.readFileSync("index.html","utf8");
const workflow=fs.readFileSync(".github/workflows/runtime-integrity.yml","utf8");

const TRAITS=["strong","ferocious","hard","swift","deadly","berserk","giant"];
let saveCount=0;
const state={
 saveVersion:17,
 reincarnation:{
  count:1,
  breakthrough:{permanent:0,milestoneLifeId:1,milestones:{}},
  alternateUniverse:{unlocked:true,deepestCleared:0,activeAttempt:null,lifeFailures:{lifeId:1,failures:{}}}
 }
};
const sandbox={
 console,
 Date,
 Math,
 JSON,
 Object,
 Array,
 Set,
 Number,
 String,
 Boolean,
 state,
 window:{},
 globalThis:null
};
sandbox.globalThis=sandbox;
sandbox.window=sandbox;
sandbox.ALTERNATE_UNIVERSE_TRAIT_IDS=TRAITS.slice();
sandbox.MONSTER_TRAIT_IDS=TRAITS.slice();
sandbox.ALTERNATE_UNIVERSE_DATA_MAX_DEPTH=1000;
sandbox.reincarnationCount=target=>Math.max(0,Math.floor(Number(target?.reincarnation?.count)||0));
sandbox.alternateUniverseUnlocked=target=>target?.reincarnation?.alternateUniverse?.unlocked===true;
sandbox.alternateUniverseDeepestCleared=target=>Math.max(0,Math.min(1000,Math.floor(Number(target?.reincarnation?.alternateUniverse?.deepestCleared)||0)));
sandbox.alternateUniverseFailureCount=(target,depth)=>Math.max(0,Math.min(10,Math.floor(Number(target?.reincarnation?.alternateUniverse?.lifeFailures?.failures?.[String(depth)])||0)));
sandbox.alternateUniverseDepthLocked=(target,depth)=>sandbox.alternateUniverseFailureCount(target,depth)>=10;
sandbox.alternateUniverseEnemyStats=depth=>({depth,hp:320000+30000*depth+1500*depth*depth,atk:26000+600*depth,def:12000+250*depth,crit:20,dodge:20});
sandbox.applyMonsterTraits=(enemy,traits)=>({...enemy,traits:traits.slice(),traitApplied:true});
sandbox.runSettlementTransaction=({label,mutate})=>{
 const before=JSON.stringify(state);
 try{
  const value=mutate(state);
  if(value===false||value?.ok===false){Object.keys(state).forEach(key=>delete state[key]);Object.assign(state,JSON.parse(before));return {ok:false,reason:value?.reason||"mutation-rejected",rolledBack:true,saved:false,label};}
  saveCount+=1;
  return {ok:true,reason:"",rolledBack:false,saved:true,label,value};
 }catch(error){Object.keys(state).forEach(key=>delete state[key]);Object.assign(state,JSON.parse(before));return {ok:false,reason:"mutation-exception",rolledBack:true,saved:false,label,error:String(error)};}
};
vm.createContext(sandbox);
vm.runInContext(source,sandbox,{filename:"alternateuniverseattempt.js"});

assert(sandbox.ALTERNATE_UNIVERSE_ATTEMPT_VERSION===2,"AU attempt owner version 應為 2。");
assert(sandbox.ALTERNATE_UNIVERSE_ATTEMPT_TRAIT_COUNT===2,"AU 每場必須固定兩個 traits。");
assert(sandbox.ALTERNATE_UNIVERSE_FAILURE_LIMIT===10,"AU 同 U／同輪迴失敗上限必須為 10。");
assert(sandbox.ALTERNATE_UNIVERSE_REVIEW_EPHEMERAL_VERSION===1,"AU 回顧戰 ephemeral policy 缺失。");
assert(sandbox.ALTERNATE_UNIVERSE_FAILURE_POLICY_VERSION===1,"AU failure lifecycle policy 缺失。");

const seq=(...values)=>{let i=0;return ()=>values[Math.min(i++,values.length-1)];};
const first=sandbox.beginAlternateUniverseAttempt(1,{rng:seq(0,0.99),attemptId:"attempt-1"});
assert(first.ok&&first.saved&&!first.resumed,"U1 首次挑戰應建立正式 activeAttempt 並存檔。");
assert(first.attempt?.attemptId==="attempt-1","正式 attemptId 應持久化。");
assert(first.attempt?.traits?.length===2&&new Set(first.attempt.traits).size===2,"正式挑戰必須抽到兩個不同 traits。");
const persistedTraits=JSON.stringify(first.attempt.traits),savedAfterFirst=saveCount;

const resumed=sandbox.beginAlternateUniverseAttempt(1,{rng:seq(0.5,0.5),attemptId:"should-not-replace"});
assert(resumed.ok&&resumed.resumed&&!resumed.saved,"同一 U 已有 activeAttempt 時必須直接恢復，不得重抽或再存檔。");
assert(resumed.attempt?.attemptId==="attempt-1"&&JSON.stringify(resumed.attempt.traits)===persistedTraits,"F5／重新進入後必須沿用原 attemptId 與 traits。");
assert(saveCount===savedAfterFirst,"恢復 activeAttempt 不應產生額外 save。");

const serialized=JSON.parse(JSON.stringify(state));
assert(serialized.reincarnation.alternateUniverse.activeAttempt.attemptId==="attempt-1"&&JSON.stringify(serialized.reincarnation.alternateUniverse.activeAttempt.traits)===persistedTraits,"activeAttempt 必須完整存在正式 state，可跨 reload 保存。");
const formalEnemy=sandbox.alternateUniverseCurrentAttemptEncounter(state);
assert(formalEnemy?.alternateUniverseMode==="challenge"&&formalEnemy?.traitApplied===true&&JSON.stringify(formalEnemy.traits)===persistedTraits,"正式挑戰 encounter 必須套用 persisted traits。");

const blockedOther=sandbox.beginAlternateUniverseAttempt(2,{rng:seq(0.2,0.8),attemptId:"attempt-2"});
assert(!blockedOther.ok&&blockedOther.reason==="active-attempt-exists","未結算 activeAttempt 存在時不得靜默改挑其他 U。");

const loss=sandbox.settleAlternateUniverseAttempt("loss",{attemptId:"attempt-1"});
assert(loss.ok&&loss.saved&&loss.failures===1&&!loss.locked,"正式敗北應清除 attempt 並記 1 次 failure。");
assert(state.reincarnation.alternateUniverse.activeAttempt===null,"敗北結算後 activeAttempt 必須清空，下一戰才可重抽。");
assert(state.reincarnation.alternateUniverse.lifeFailures.failures["1"]===1,"U1 failure 應寫入當輪迴 owner。");

const retry=sandbox.beginAlternateUniverseAttempt(1,{rng:seq(0.45,0.1),attemptId:"attempt-1-retry"});
assert(retry.ok&&!retry.resumed&&retry.attempt.attemptId==="attempt-1-retry","結算後再次挑戰應建立新 attempt。");
assert(JSON.stringify(retry.attempt.traits)!==persistedTraits,"新的正式 attempt 應重新抽 traits。");
const win=sandbox.settleAlternateUniverseAttempt("win",{attemptId:"attempt-1-retry"});
assert(win.ok&&state.reincarnation.alternateUniverse.deepestCleared===1&&state.reincarnation.alternateUniverse.activeAttempt===null,"勝利應推進 deepestCleared 並清空 activeAttempt。");
assert(!sandbox.beginAlternateUniverseAttempt(1,{rng:seq(0,0.5)}).ok,"已通關 U 不應再次走正式 progression challenge；應改走回顧戰。");

const u2=sandbox.beginAlternateUniverseAttempt(2,{rng:seq(0.2,0.7),attemptId:"attempt-2"});
assert(u2.ok,"通過 U1 後應可正式挑戰 U2。");
const abandon=sandbox.abandonAlternateUniverseAttempt({attemptId:"attempt-2"});
assert(abandon.ok&&abandon.outcome==="abandon"&&abandon.failures===1&&abandon.abandoned===true,"放棄未結算 attempt 必須計 1 次 failure。");

state.reincarnation.alternateUniverse.lifeFailures.failures["2"]=9;
const ninthRetry=sandbox.beginAlternateUniverseAttempt(2,{rng:seq(0.3,0.6),attemptId:"attempt-2-lock"});
assert(ninthRetry.ok,"U2 第 10 次失敗前仍應可挑戰。");
const tenth=sandbox.settleAlternateUniverseAttempt("loss",{attemptId:"attempt-2-lock"});
assert(tenth.ok&&tenth.failures===10&&tenth.locked,"第 10 次失敗必須鎖定該 U 至下次輪迴。");
const locked=sandbox.beginAlternateUniverseAttempt(2,{rng:seq(0.1,0.9),attemptId:"should-lock"});
assert(!locked.ok&&locked.reason==="depth-locked-for-life","同 U／同輪迴達 10 failures 後不得再建立 attempt。");

state.reincarnation.alternateUniverse.deepestCleared=3;
state.reincarnation.alternateUniverse.activeAttempt=null;
const beforeReview=JSON.stringify(state),saveBeforeReview=saveCount;
const review1=sandbox.createAlternateUniverseReviewEncounter(1,seq(0,0.99),state);
const review2=sandbox.createAlternateUniverseReviewEncounter(1,seq(0.5,0.2),state);
assert(review1?.alternateUniverseMode==="review"&&review2?.alternateUniverseMode==="review","已通關 U 必須可建立回顧 encounter。");
assert(review1.traits.length===2&&new Set(review1.traits).size===2&&review2.traits.length===2&&new Set(review2.traits).size===2,"每場回顧戰都必須臨時抽兩個不同 traits。");
assert(JSON.stringify(review1.traits)!==JSON.stringify(review2.traits),"獨立回顧戰應能重新抽到不同 traits，不得沿用 activeAttempt。");
assert(JSON.stringify(state)===beforeReview&&saveCount===saveBeforeReview,"回顧戰不得寫 activeAttempt、failure、deepestCleared 或觸發 save。");
const reviewStatus=sandbox.alternateUniverseReviewStatus(1,state);
assert(reviewStatus.ok&&reviewStatus.ephemeral&&reviewStatus.writesActiveAttempt===false&&reviewStatus.writesFailure===false,"回顧戰 policy 必須明示完全 ephemeral。");
assert(sandbox.createAlternateUniverseReviewEncounter(4,seq(0,0.5),state)===null,"未通關 U 不得開回顧戰。");

assert(index.includes('src="traits.js?v=20260922-universe-adventure-batch4"'),"traits.js 正式 owner 載入缺失。");
assert(index.includes('src="alternateuniverseattempt.js?v=20261003-reincarnation-batch3-4"'),"3-4 AU attempt owner cache-bust／script 載入缺失。");
assert(index.indexOf('src="alternateuniverseattempt.js?v=20261003-reincarnation-batch3-4"')>index.indexOf('src="traits.js?v=20260922-universe-adventure-batch4"'),"AU attempt owner 必須在既有 traits owner 後載入。");
assert(index.indexOf('src="alternateuniverseattempt.js?v=20261003-reincarnation-batch3-4"')>index.indexOf('src="settlementtransaction.js?'),"AU attempt owner 必須在共享 transaction owner 後載入。");
assert(workflow.includes("node tests/runtime/alternate-universe-attempt-integrity.js"),"Runtime Integrity workflow 必須正式執行 AU attempt lifecycle test。");
assert(!/activeAttempt\s*=.*review/i.test(source),"回顧流程不得寫 activeAttempt。");
console.log("Alternate Universe attempt lifecycle integrity passed.");
