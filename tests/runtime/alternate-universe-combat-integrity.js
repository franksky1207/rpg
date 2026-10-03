const fs=require("fs");
const vm=require("vm");
function assert(condition,message){if(!condition)throw new Error(message);}
const source=fs.readFileSync("alternateuniversecombat.js","utf8");
const index=fs.readFileSync("index.html","utf8");
const workflow=fs.readFileSync(".github/workflows/runtime-integrity.yml","utf8");

const state={
 hp:5000,
 secondWorld:{entered:true,civilizationLevel:7},
 thirdWorld:{entered:false},
 reincarnation:{count:2,alternateUniverse:{unlocked:true,deepestCleared:0,activeAttempt:{lifeId:2,depth:1,attemptId:"au-formal-1",traits:["strong","deadly"]},lifeFailures:{lifeId:2,failures:{}}}}
};
let worldCombatCalls=0,attemptSettlementCalls=0,lastWorldOptions=null;
const sandbox={console,Math,JSON,Object,Array,Number,String,Boolean,Set,state,window:{},globalThis:null};
sandbox.globalThis=sandbox;sandbox.window=sandbox;
sandbox.currentWorldPhase=target=>target?.thirdWorld?.entered?3:(target?.secondWorld?.entered?2:1);
sandbox.playerCombatStats=()=>({hp:10000,atk:5000,def:2500,crit:25,dodge:20});
sandbox.alternateUniverseActiveAttempt=target=>{
 const row=target?.reincarnation?.alternateUniverse?.activeAttempt;
 return row?{lifeId:row.lifeId,depth:row.depth,attemptId:row.attemptId,traits:row.traits.slice()}:null;
};
sandbox.alternateUniverseCurrentAttemptEncounter=target=>{
 const row=target?.reincarnation?.alternateUniverse?.activeAttempt;if(!row)return null;
 return {hp:351500,atk:26600,def:12250,crit:28,dodge:20,traits:row.traits.slice(),alternateUniverse:true,alternateUniverseDepth:row.depth,alternateUniverseMode:"challenge"};
};
sandbox.createAlternateUniverseReviewEncounter=(depth,rng,target)=>depth<=target.reincarnation.alternateUniverse.deepestCleared?{hp:500,atk:10,def:1,crit:20,dodge:20,traits:["hard","swift"],alternateUniverse:true,alternateUniverseDepth:depth,alternateUniverseMode:"review"}:null;
sandbox.settleAlternateUniverseAttempt=(outcome,options)=>{
 attemptSettlementCalls+=1;
 const row=state.reincarnation.alternateUniverse.activeAttempt;
 if(!row)return {ok:false,reason:"active-attempt-missing"};
 if(options?.attemptId!==row.attemptId)return {ok:false,reason:"attempt-id-mismatch"};
 if(outcome==="win")state.reincarnation.alternateUniverse.deepestCleared=Math.max(state.reincarnation.alternateUniverse.deepestCleared,row.depth);
 else state.reincarnation.alternateUniverse.lifeFailures.failures[String(row.depth)]=(state.reincarnation.alternateUniverse.lifeFailures.failures[String(row.depth)]||0)+1;
 state.reincarnation.alternateUniverse.activeAttempt=null;
 return {ok:true,saved:true,outcome,depth:row.depth,failures:state.reincarnation.alternateUniverse.lifeFailures.failures[String(row.depth)]||0};
};
sandbox.runWorldCombatCore=(player,enemy,startHp,options)=>{
 worldCombatCalls+=1;lastWorldOptions={player,enemy,startHp,options};
 const loss=options.__forceLoss===true;
 return {version:1,world:options.world,playerFinalDamageMultiplier:1.85,combat:{win:!loss,hp:loss?0:4200,enemyHp:loss?12345:0,turns:4,logs:["combat"],events:[{type:"attack"}]}};
};
vm.createContext(sandbox);
vm.runInContext(source,sandbox,{filename:"alternateuniversecombat.js"});

assert(sandbox.ALTERNATE_UNIVERSE_COMBAT_VERSION===1,"AU combat owner version 應為 1。");
assert(sandbox.ALTERNATE_UNIVERSE_COMBAT_ADAPTER_VERSION===1,"AU 必須宣告 shared world combat adapter consumer。");
assert(sandbox.ALTERNATE_UNIVERSE_COMBAT_SETTLEMENT_VERSION===1,"AU combat settlement contract 缺失。");
assert(typeof sandbox.runAlternateUniverseCombat==="function"&&typeof sandbox.settleAlternateUniverseCombat==="function","AU combat run／settle API 缺失。");

const formal=sandbox.runAlternateUniverseCombat({logs:false,preparePresentation:false});
assert(formal.ok&&formal.review===false&&formal.depth===1&&formal.attemptId==="au-formal-1","正式 AU combat 必須綁定目前 activeAttempt。");
assert(worldCombatCalls===1,"AU 正式戰鬥必須且只應呼叫 shared runWorldCombatCore。");
assert(lastWorldOptions.options.world===2,"AU 跨紀元挑戰必須以角色目前所在紀元解析正式最終傷害。");
assert(lastWorldOptions.startHp===5000,"正式 AU 戰鬥應使用目前正式角色 HP 作為起始 HP。");
assert(formal.playerFinalDamageMultiplier===1.85,"AU 應沿用 shared world combat adapter 回傳的正式最終傷害倍率。");
assert(formal.settlementReady===true&&formal.settlementBasis.formalSettlementEligible===true&&formal.settlementBasis.outcome==="win","完整勝利應產生可結算的正式 settlement basis。");
assert(JSON.stringify(formal.traits)===JSON.stringify(["strong","deadly"]),"AU combat 必須沿用 activeAttempt 已固定的兩個 traits，不得重抽。");

const settled=sandbox.settleAlternateUniverseCombat(formal);
assert(settled.ok&&settled.win&&settled.outcome==="win"&&attemptSettlementCalls===1,"AU combat 勝利必須委派既有 attempt settlement owner。");
assert(state.reincarnation.alternateUniverse.deepestCleared===1&&state.reincarnation.alternateUniverse.activeAttempt===null,"AU combat 勝利 settlement 應推進 U 並清除 activeAttempt。");
const doubleSettle=sandbox.settleAlternateUniverseCombat(formal);
assert(!doubleSettle.ok&&doubleSettle.reason==="active-attempt-missing"&&attemptSettlementCalls===1,"同一 combat result 不得重複 settlement。");

state.reincarnation.alternateUniverse.activeAttempt={lifeId:2,depth:2,attemptId:"au-formal-2",traits:["ferocious","giant"]};
sandbox.runWorldCombatCore=(player,enemy,startHp,options)=>{
 worldCombatCalls+=1;lastWorldOptions={player,enemy,startHp,options};
 return {version:1,world:options.world,playerFinalDamageMultiplier:1.85,combat:{win:false,hp:0,enemyHp:50000,turns:3,logs:[],events:[]}};
};
sandbox.alternateUniverseCurrentAttemptEncounter=()=>({hp:446000,atk:27200,def:12500,crit:20,dodge:15,traits:["ferocious","giant"],alternateUniverse:true,alternateUniverseDepth:2,alternateUniverseMode:"challenge"});
const loss=sandbox.runAlternateUniverseCombat({logs:false,preparePresentation:false});
assert(loss.ok&&loss.settlementBasis.outcome==="loss"&&loss.settlementReady,"玩家死亡必須形成正式 loss settlement。");
const lossSettled=sandbox.settleAlternateUniverseCombat(loss);
assert(lossSettled.ok&&lossSettled.outcome==="loss"&&state.reincarnation.alternateUniverse.lifeFailures.failures["2"]===1,"AU 正式敗北必須交由 attempt owner 累加 failure。");

state.reincarnation.alternateUniverse.deepestCleared=2;
state.reincarnation.alternateUniverse.activeAttempt=null;
const beforeReview=JSON.stringify(state),settlementsBeforeReview=attemptSettlementCalls;
sandbox.runWorldCombatCore=(player,enemy,startHp,options)=>{worldCombatCalls+=1;return {version:1,world:options.world,playerFinalDamageMultiplier:1.85,combat:{win:true,hp:10000,enemyHp:0,turns:1,logs:[],events:[]}};};
const review=sandbox.runAlternateUniverseCombat({review:true,depth:1,rng:()=>.4,logs:false,preparePresentation:false});
assert(review.ok&&review.review===true&&review.settlementReady===false,"AU 回顧戰可戰鬥但不得產生正式 settlement。");
assert(review.settlementBasis.formalSettlementEligible===false&&review.attemptId==="","回顧戰不得綁 formal attemptId。");
assert(JSON.stringify(state)===beforeReview,"AU 回顧戰不得修改正式 state。");
const reviewSettlement=sandbox.settleAlternateUniverseCombat(review);
assert(!reviewSettlement.ok&&reviewSettlement.reason==="review-has-no-settlement"&&attemptSettlementCalls===settlementsBeforeReview,"AU 回顧結果不得進入正式 attempt settlement。");

state.reincarnation.alternateUniverse.activeAttempt={lifeId:2,depth:3,attemptId:"au-incomplete",traits:["hard","berserk"]};
sandbox.alternateUniverseCurrentAttemptEncounter=()=>({hp:600000,atk:30000,def:14000,crit:20,dodge:20,traits:["hard","berserk"],alternateUniverse:true,alternateUniverseDepth:3,alternateUniverseMode:"challenge"});
sandbox.runWorldCombatCore=(player,enemy,startHp,options)=>({version:1,world:options.world,playerFinalDamageMultiplier:1.85,combat:{win:false,hp:3000,enemyHp:200000,turns:10,logs:[],events:[]}});
const incomplete=sandbox.runAlternateUniverseCombat({maxTurns:10,logs:false,preparePresentation:false});
assert(incomplete.ok&&!incomplete.settlementReady&&incomplete.settlementBasis.outcome==="incomplete","未分勝負的 combat 不得誤結算 failure 或 victory。");
assert(!sandbox.settleAlternateUniverseCombat(incomplete).ok,"未完成戰鬥不得 formal settle。");

assert(!source.includes("thirdWorldBoss")&&!source.includes("five-point")&&!source.includes("permanentDamage"),"AU combat 不得帶入 W3 十王專用戰鬥規則。");
assert(source.includes("runWorldCombatCore"),"AU combat 必須共用正式 World Combat Adapter。");
assert(index.includes('src="alternateuniversecombat.js?v=20261003-reincarnation-batch3-3"'),"3-3 AU combat cache-bust／script 載入缺失。");
assert(index.indexOf('src="alternateuniversecombat.js?v=20261003-reincarnation-batch3-3"')>index.indexOf('src="alternateuniverseattempt.js?v=20261003-reincarnation-batch3-4"'),"AU combat owner 必須在 AU attempt owner 後載入。");
assert(index.indexOf('src="alternateuniversecombat.js?v=20261003-reincarnation-batch3-3"')>index.indexOf('src="combatmath.js?'),"AU combat owner 必須在 shared world combat adapter 後載入。");
assert(workflow.includes("node tests/runtime/alternate-universe-combat-integrity.js"),"Runtime Integrity workflow 必須正式執行 AU combat test。");
console.log("Alternate Universe combat adapter integrity passed.");
