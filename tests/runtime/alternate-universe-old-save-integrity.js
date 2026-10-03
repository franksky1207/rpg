const fs=require("fs");
const vm=require("vm");
function assert(c,m){if(!c)throw new Error(m)}
const source=fs.readFileSync("reincarnationstate.js","utf8");
const sandbox={console,Math,JSON,Object,Array,Set,Number,String,Boolean,window:{},globalThis:null};sandbox.globalThis=sandbox;sandbox.window=sandbox;
vm.createContext(sandbox);vm.runInContext(source,sandbox,{filename:"reincarnationstate.js"});
assert(sandbox.REINCARNATION_STATE_VERSION===7,"reincarnation state version should be 7");
assert(sandbox.ALTERNATE_UNIVERSE_ACTIVE_ATTEMPT_REPAIR_VERSION===1,"AU activeAttempt repair contract missing");

function normalize(input){const target=JSON.parse(JSON.stringify(input));sandbox.normalizeReincarnationState(target);return {target,report:JSON.parse(JSON.stringify(sandbox.LAST_REINCARNATION_NORMALIZATION_REPORT||{}))};}

let row=normalize({saveVersion:17,reincarnation:{count:3,breakthrough:{permanent:4,milestoneLifeId:3,milestones:{}},alternateUniverse:{unlocked:true,deepestCleared:7,activeAttempt:{lifeId:3,depth:8,attemptId:"legacy-valid",traits:["強壯","巨體"],review:true},lifeFailures:{"8":{lifeId:3,failures:4}},reviewDepth:6,reviewEncounter:{depth:6},replay:{depth:5}}}});
assert(row.target.reincarnation.alternateUniverse.activeAttempt?.depth===8,"valid current-frontier attempt should survive normalization");
assert(row.target.reincarnation.alternateUniverse.activeAttempt.traits.join(",")==="strong,giant","legacy Chinese trait labels should canonicalize");
assert(row.target.reincarnation.alternateUniverse.lifeFailures.lifeId===3&&row.target.reincarnation.alternateUniverse.lifeFailures.failures["8"]===4,"legacy lifeFailures rows should canonicalize");
assert(!("reviewDepth" in row.target.reincarnation.alternateUniverse)&&!("reviewEncounter" in row.target.reincarnation.alternateUniverse)&&!("replay" in row.target.reincarnation.alternateUniverse),"retired replay/review fields must be removed by canonical rebuild");
assert(!("review" in row.target.reincarnation.alternateUniverse.activeAttempt),"retired activeAttempt review field must be removed");

row=normalize({saveVersion:17,reincarnation:{count:2,breakthrough:{permanent:1,milestoneLifeId:2,milestones:{}},alternateUniverse:{unlocked:true,deepestCleared:20,activeAttempt:{lifeId:2,depth:18,attemptId:"stale-behind",traits:["strong","hard"]},lifeFailures:{lifeId:2,failures:{}}}}});
assert(row.target.reincarnation.alternateUniverse.activeAttempt===null,"stale attempt behind frontier must be cleared");
assert(row.report.activeAttemptFrontierMismatch===true&&row.report.activeAttemptCleared===true&&row.report.activeAttemptExpectedFrontierDepth===21,"behind-frontier repair report mismatch");

row=normalize({saveVersion:17,reincarnation:{count:2,breakthrough:{permanent:1,milestoneLifeId:2,milestones:{}},alternateUniverse:{unlocked:true,deepestCleared:20,activeAttempt:{lifeId:2,depth:22,attemptId:"stale-ahead",traits:["swift","deadly"]},lifeFailures:{lifeId:2,failures:{}}}}});
assert(row.target.reincarnation.alternateUniverse.activeAttempt===null,"stale attempt ahead of frontier must be cleared");
assert(row.report.activeAttemptFrontierMismatch===true&&row.report.activeAttemptExpectedFrontierDepth===21,"ahead-frontier repair report mismatch");

row=normalize({saveVersion:17,reincarnation:{count:5,breakthrough:{permanent:9,milestoneLifeId:5,milestones:{}},alternateUniverse:{unlocked:true,deepestCleared:40,activeAttempt:{lifeId:5,depth:41,attemptId:"locked",traits:["ferocious","berserk"]},lifeFailures:{lifeId:5,failures:{"41":10}}}}});
assert(row.target.reincarnation.alternateUniverse.activeAttempt===null,"locked frontier must not retain activeAttempt");
assert(row.report.activeAttemptLocked===true&&row.report.activeAttemptCleared===true,"locked-attempt repair report mismatch");
assert(row.target.reincarnation.alternateUniverse.lifeFailures.failures["41"]===10,"repair must preserve formal 10-loss lock");

row=normalize({saveVersion:17,reincarnation:{count:1,breakthrough:{permanent:0,milestoneLifeId:1,milestones:{}},alternateUniverse:{unlocked:false,deepestCleared:5,activeAttempt:null,lifeFailures:{lifeId:1,failures:{}}}}});
assert(row.target.reincarnation.alternateUniverse.unlocked===true&&row.target.reincarnation.alternateUniverse.deepestCleared===5,"deepest progress should salvage permanent AU unlock");

row=normalize({saveVersion:17,reincarnation:{count:4,breakthrough:{permanent:3,milestoneLifeId:4,milestones:{}},alternateUniverse:{unlocked:true,deepestCleared:9,activeAttempt:{lifeId:3,depth:10,attemptId:"wrong-life",traits:["strong","deadly"]},lifeFailures:{lifeId:4,failures:{}}}}});
assert(row.target.reincarnation.alternateUniverse.activeAttempt===null,"attempt owned by another life must be cleared");

row=normalize({saveVersion:17,reincarnation:{count:6,breakthrough:{permanent:12,milestoneLifeId:6,milestones:{}},alternateUniverse:{unlocked:true,deepestCleared:1000,activeAttempt:{lifeId:6,depth:1000,attemptId:"after-complete",traits:["hard","giant"]},lifeFailures:{lifeId:6,failures:{}}}}});
assert(row.target.reincarnation.alternateUniverse.activeAttempt===null,"completed AU must not retain an activeAttempt");
assert(row.report.activeAttemptExpectedFrontierDepth===0&&row.report.activeAttemptFrontierMismatch===true,"completion repair report mismatch");

row=normalize({saveVersion:16,reincarnation:{count:9,breakthrough:{permanent:99,milestoneLifeId:9,milestones:{100:true}},alternateUniverse:{unlocked:true,deepestCleared:999,activeAttempt:{lifeId:9,depth:1000,attemptId:"prototype",traits:["strong","giant"]},lifeFailures:{lifeId:9,failures:{"1000":9}}}}});
assert(row.target.reincarnation.count===0&&row.target.reincarnation.breakthrough.permanent===0,"pre-Schema17 prototype reincarnation data must remain discarded");
assert(row.target.reincarnation.alternateUniverse.unlocked===false&&row.target.reincarnation.alternateUniverse.deepestCleared===0&&row.target.reincarnation.alternateUniverse.activeAttempt===null,"pre-Schema17 AU prototype data must remain discarded");
assert(row.report.preSchema17ReincarnationDiscarded===true,"pre-Schema17 discard must be reported");

console.log("Alternate Universe old-save normalization integrity passed.");