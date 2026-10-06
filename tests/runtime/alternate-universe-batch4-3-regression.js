const fs=require("fs");const vm=require("vm");
function assert(c,m){if(!c)throw new Error(m)}
const dataSource=fs.readFileSync("alternateuniversedata.js","utf8");
const progressionSource=fs.readFileSync("alternateuniverseprogression.js","utf8");
const attemptSource=fs.readFileSync("alternateuniverseattempt.js","utf8");
const combatSource=fs.readFileSync("alternateuniversecombat.js","utf8");
const reincarnationCore=fs.readFileSync("reincarnationcore.js","utf8");
const TRAITS=["strong","ferocious","hard","swift","deadly","berserk","giant"];
const state={
 saveVersion:17,level:2000,exp:777,gold:888,inventory:[{id:"keep"}],
 secondWorld:{darkMatter:999,darkEnergy:111},thirdWorld:{dimensionalStrings:222},
 reincarnation:{count:7,breakthrough:{permanent:60,milestoneLifeId:7,milestones:{}},alternateUniverse:{unlocked:true,deepestCleared:0,activeAttempt:null,lifeFailures:{lifeId:7,failures:{}}}}
};
let saves=0;
const sandbox={console,Date,Math,JSON,Object,Array,Set,Number,String,Boolean,state,window:{},globalThis:null};sandbox.globalThis=sandbox;sandbox.window=sandbox;
sandbox.MONSTER_TRAIT_IDS=TRAITS.slice();sandbox.ALTERNATE_UNIVERSE_TRAIT_IDS=TRAITS.slice();sandbox.ALTERNATE_UNIVERSE_MAX_DEPTH=1000;
sandbox.reincarnationCount=t=>Number(t.reincarnation.count)||0;
sandbox.alternateUniverseUnlocked=t=>t.reincarnation.alternateUniverse.unlocked===true;
sandbox.alternateUniverseDeepestCleared=t=>Number(t.reincarnation.alternateUniverse.deepestCleared)||0;
sandbox.alternateUniverseFailureCount=(t,d)=>Number(t.reincarnation.alternateUniverse.lifeFailures.failures[String(d)]||0);
sandbox.alternateUniverseDepthLocked=(t,d)=>sandbox.alternateUniverseFailureCount(t,d)>=10;
sandbox.applyMonsterTraits=(enemy,traits)=>({...enemy,traits:traits.slice(),alternateUniverse:true,alternateUniverseDepth:enemy.depth,alternateUniverseMode:"challenge"});
let titleGrants=[];sandbox.grantPlayerTitlesForAlternateUniverseDepth=(depth,target,options={})=>{titleGrants.push({depth,previousDepth:options.previousDepth});target.titles=target.titles||{version:1,unlocked:[],equipped:null,pendingNotice:null};return {changed:true,unlockedTitles:[{id:`alternate-universe-title-${String(Math.floor(depth/100)).padStart(2,"0")}`}],noticeTitle:{id:`alternate-universe-title-${String(Math.floor(depth/100)).padStart(2,"0")}`},depth,previousDepth:options.previousDepth};};
sandbox.runSettlementTransaction=({label,mutate})=>{const before=JSON.stringify(state);try{const value=mutate(state);if(value?.ok===false){Object.assign(state,JSON.parse(before));return {ok:false,reason:value.reason,saved:false,label}}saves++;return {ok:true,saved:true,label,value}}catch(error){Object.assign(state,JSON.parse(before));return {ok:false,reason:String(error?.message||error),rolledBack:true,saved:false,label}}};
vm.createContext(sandbox);vm.runInContext(dataSource,sandbox,{filename:"alternateuniversedata.js"});vm.runInContext(progressionSource,sandbox,{filename:"alternateuniverseprogression.js"});vm.runInContext(attemptSource,sandbox,{filename:"alternateuniverseattempt.js"});

// Batch 4-3 balance lock: formal curve is finalized and must not drift accidentally.
for(const depth of [1,10,100,500,1000]){
 const s=sandbox.alternateUniverseEnemyStats(depth);const expectedHp=320000+30000*depth+1500*depth*depth,expectedAtk=26000+600*depth,expectedDef=12000+250*depth;
 assert(s.hp===expectedHp,`AU HP curve drift at layer ${depth}: ${s.hp} !== ${expectedHp}`);
 assert(s.atk===expectedAtk,`AU ATK curve drift at layer ${depth}: ${s.atk} !== ${expectedAtk}`);
 assert(s.def===expectedDef,`AU DEF curve drift at layer ${depth}: ${s.def} !== ${expectedDef}`);
 assert(s.crit===20&&s.dodge===20,`AU crit/dodge baseline drift at layer ${depth}`);
}
assert(sandbox.ALTERNATE_UNIVERSE_UNIVERSE_COUNT===200&&sandbox.ALTERNATE_UNIVERSE_DEPTHS_PER_UNIVERSE===5,"AU structure must remain 200 universes x 5 layers");
assert(sandbox.alternateUniverseDepthInfo(1000)?.depth===1000&&sandbox.alternateUniverseDepthFromUniverse(200,5)===1000&&sandbox.alternateUniverseDepthFromUniverse(201,1)===0,"AU data mapping must terminate at universe 200 / layer 1000");
assert(Array.isArray(sandbox.ALTERNATE_UNIVERSE_TRAIT_IDS)&&sandbox.ALTERNATE_UNIVERSE_TRAIT_IDS.join(",")===TRAITS.join(","),"AU must continue reusing the canonical seven traits");

// Formal lifecycle: F5/resume keeps traits; a win advances exactly one layer and does not award resources.
const unrelatedSnapshot=()=>JSON.stringify({exp:state.exp,gold:state.gold,inventory:state.inventory,secondWorld:state.secondWorld,thirdWorld:state.thirdWorld});
const seq=(...values)=>{let i=0;return ()=>values[Math.min(i++,values.length-1)]};
let a=sandbox.beginAlternateUniverseAttempt(1,{rng:seq(0,.99),attemptId:"b43-u1-a"});assert(a.ok&&!a.resumed,"U1 attempt should start");const firstTraits=JSON.stringify(a.attempt.traits),beforeResumeSaves=saves;
let resume=sandbox.beginAlternateUniverseAttempt(1,{rng:seq(.4,.5)});assert(resume.ok&&resume.resumed&&JSON.stringify(resume.attempt.traits)===firstTraits&&saves===beforeResumeSaves,"reload/resume must preserve the same two traits without a save/reroll");
const unrelatedBeforeWin=unrelatedSnapshot();let win=sandbox.settleAlternateUniverseAttempt("win",{attemptId:"b43-u1-a"});assert(win.ok&&state.reincarnation.alternateUniverse.deepestCleared===1,"formal victory must advance exactly one layer");assert(unrelatedSnapshot()===unrelatedBeforeWin,"AU victory must not award EXP/resources/equipment");
assert(!sandbox.alternateUniverseChallengeAccess(1,state).ok,"cleared layer must not be replayable");assert(sandbox.alternateUniverseChallengeAccess(2,state).ok&&!sandbox.alternateUniverseChallengeAccess(3,state).ok,"only the current frontier may be challenged");

// Ten formal losses lock the frontier for the current life, with no economic mutation.
for(let i=1;i<=10;i++){
 const id=`b43-u2-${i}`,before=unrelatedSnapshot();const begun=sandbox.beginAlternateUniverseAttempt(2,{rng:seq((i%7)/7,((i+2)%7)/7),attemptId:id});assert(begun.ok,`loss attempt ${i} should start`);
 const loss=sandbox.settleAlternateUniverseAttempt("loss",{attemptId:id});assert(loss.ok&&loss.failures===i,`loss ${i} must increment failure count exactly once`);assert(unrelatedSnapshot()===before,`loss ${i} must not mutate rewards/resources`);
}
const locked=sandbox.alternateUniverseFailureStatus(2,state);assert(locked.locked&&locked.failures===10&&!locked.canRetry&&locked.unlockRequiresReincarnation,"10 losses must lock the frontier for this life");assert(!sandbox.beginAlternateUniverseAttempt(2,{attemptId:"blocked"}).ok,"locked layer must reject new attempts");

// Reincarnation contract: preserve permanent AU progress/unlock, clear only current-life attempt/failures.
assert(/alternateUniverse:\{unlocked:auUnlocked,deepestCleared,activeAttempt:null,lifeFailures:\{lifeId:newCount,failures:\{\}\}\}/.test(reincarnationCore),"reincarnation must preserve AU unlock/deepest while clearing attempt/failures for the new life");

// U1000 completion and no U1001/replay path.
state.reincarnation.alternateUniverse.deepestCleared=999;state.reincarnation.alternateUniverse.activeAttempt=null;state.reincarnation.alternateUniverse.lifeFailures={lifeId:7,failures:{}};
titleGrants=[];let finalAttempt=sandbox.beginAlternateUniverseAttempt(1000,{rng:seq(.1,.8),attemptId:"b43-u1000"});assert(finalAttempt.ok,"U1000 should be challengeable from U999");const unrelatedBeforeFinal=unrelatedSnapshot();let finalWin=sandbox.settleAlternateUniverseAttempt("win",{attemptId:"b43-u1000"});assert(finalWin.ok&&state.reincarnation.alternateUniverse.deepestCleared===1000,"U1000 win must set deepest to 1000");assert(titleGrants.length===1&&titleGrants[0].depth===1000&&titleGrants[0].previousDepth===999&&finalWin.titleSettlement?.noticeTitle?.id==="alternate-universe-title-10","U1000 final victory must atomically grant the tier-10 AU title");assert(unrelatedSnapshot()===unrelatedBeforeFinal,"U1000 victory must still have no resource reward");const completed=sandbox.alternateUniverseProgressionSnapshot(state);assert(completed.completed&&completed.nextDepth===null&&completed.remainingDepths===0&&completed.completedUniverses===200,"U1000 must be terminal completion");assert(!sandbox.alternateUniverseChallengeAccess(1000,state).ok&&!sandbox.alternateUniverseChallengeAccess(1001,state).ok,"completed/replay/U1001 access must stay closed");

assert(!/createAlternateUniverseReviewEncounter|alternateUniverseReviewAccess|reviewEncounter|REVIEW_ISOLATION/.test(attemptSource+progressionSource+combatSource),"AU replay/review path must remain fully removed");
assert(!/gold\s*\+=|darkMatter\s*\+=|darkEnergy\s*\+=|dimensionalStrings?\s*\+=|inventory\.push|gainExp\s*\(/.test(attemptSource+combatSource+progressionSource),"AU formal owners must not gain reward/resource mutation code");
console.log("Alternate Universe Batch 4-3 finalized balance/lifecycle regression passed.");
