const {chromium}=require("playwright");
const assert=require("assert");
const fs=require("fs");

(async()=>{
 const browser=await chromium.launch({headless:true});
 const page=await browser.newPage();
 const pageErrors=[];
 page.on("pageerror",error=>pageErrors.push(String(error?.stack||error?.message||error)));
 const url=process.env.RUNTIME_SMOKE_URL||"http://127.0.0.1:4173/index.html";
 try{
  await page.goto(url,{waitUntil:"domcontentloaded",timeout:30000});
  await page.waitForFunction(()=>
   window.REINCARNATION_LIFE_CHANGE_RECONCILIATION_VERSION===1&&
   window.ALTERNATE_UNIVERSE_LIFECYCLE_SNAPSHOT_VERSION===1&&
   window.BREAKTHROUGH_LIFE_CHANGE_DELEGATION_VERSION===1&&
   typeof window.reconcileReincarnationLifeChange==="function"&&
   typeof window.alternateUniverseLifecycleSnapshot==="function"&&
   typeof window.rebuildBreakthroughFromPermanentTotal==="function"&&
   typeof window.gmAlternateUniverseFormalSnapshot==="function",
   {timeout:30000}
  );

  const report=await page.evaluate(()=>{
   const clone=value=>JSON.parse(JSON.stringify(value));
   const milestones=count=>Object.fromEntries([100,200,300,400,500,600,700,800,900,1000].map((level,index)=>[String(level),index<count]));
   const makeState=(count,permanent,currentLife=0)=>({saveVersion:17,hp:100,reincarnation:{count,breakthrough:{permanent,milestoneLifeId:count,milestones:milestones(currentLife)},alternateUniverse:{unlocked:true,deepestCleared:40,activeAttempt:{lifeId:count,depth:41,attemptId:`life-${count}`,traits:["strong","swift"]},lifeFailures:{lifeId:count,failures:{"41":3}}}}});

   const malformed=makeState(3,25,5);
   malformed.reincarnation.alternateUniverse.activeAttempt.traits=["強壯","迅捷"];
   malformed.reincarnation.alternateUniverse.lifeFailures={lifeId:3,failures:{"41":4,"42":99,"1001":8,"0":7}};
   const malformedBefore=JSON.stringify(malformed);
   const lifecycleSnapshot=window.alternateUniverseLifecycleSnapshot(malformed);
   const gmSnapshot=window.gmAlternateUniverseFormalSnapshot(malformed);
   const malformedAfter=JSON.stringify(malformed);

   const changed=makeState(2,20,10);
   changed.reincarnation.count=3;
   const changedReport=window.reconcileReincarnationLifeChange(changed,2);

   const same=makeState(3,25,5);
   const sameBefore=clone(same.reincarnation.alternateUniverse);
   const sameReport=window.reconcileReincarnationLifeChange(same,3);
   const sameAfter=clone(same.reincarnation.alternateUniverse);

   const rebuilt=makeState(2,20,10);
   const rebuildResult=window.rebuildBreakthroughFromPermanentTotal(25,rebuilt);

   const rebuiltSame=makeState(3,25,5);
   const rebuiltSameBefore=clone(rebuiltSame.reincarnation.alternateUniverse);
   const rebuildSameResult=window.rebuildBreakthroughFromPermanentTotal(27,rebuiltSame);
   const rebuiltSameAfter=clone(rebuiltSame.reincarnation.alternateUniverse);

   return {
    versions:{lifeChange:window.REINCARNATION_LIFE_CHANGE_RECONCILIATION_VERSION,auSnapshot:window.ALTERNATE_UNIVERSE_LIFECYCLE_SNAPSHOT_VERSION,breakthroughDelegation:window.BREAKTHROUGH_LIFE_CHANGE_DELEGATION_VERSION,gmSnapshotOwner:window.GM_ALTERNATE_UNIVERSE_FORMAL_SNAPSHOT_OWNER_VERSION},
    malformed:{before:malformedBefore,after:malformedAfter,lifecycleSnapshot:clone(lifecycleSnapshot),gmSnapshot:clone(gmSnapshot)},
    changed:{report:clone(changedReport),state:clone(changed.reincarnation.alternateUniverse)},
    same:{report:clone(sameReport),before:sameBefore,after:sameAfter},
    rebuilt:{result:clone(rebuildResult),state:clone(rebuilt.reincarnation)},
    rebuiltSame:{result:clone(rebuildSameResult),before:rebuiltSameBefore,after:rebuiltSameAfter},
    integrity:{reincarnation:clone(window.REINCARNATION_LIFECYCLE_INTEGRITY),breakthrough:clone(window.BREAKTHROUGH_CORE_INTEGRITY),gmAu:clone(window.GM_ALTERNATE_UNIVERSE_MANAGEMENT_INTEGRITY)}
   };
  });

  assert.deepEqual(report.versions,{lifeChange:1,auSnapshot:1,breakthroughDelegation:1,gmSnapshotOwner:2},"Owner convergence versions drifted.");
  assert.equal(report.malformed.before,report.malformed.after,"Read-only AU lifecycle snapshot mutated its target.");
  assert.equal(report.malformed.lifecycleSnapshot.lifeId,3);
  assert.equal(report.malformed.lifecycleSnapshot.frontier,41);
  assert.deepEqual(report.malformed.lifecycleSnapshot.activeAttempt?.traits,["strong","swift"],"Formal AU snapshot must canonicalize trait aliases without mutating source.");
  assert.equal(report.malformed.lifecycleSnapshot.failures["41"],4);
  assert.equal(report.malformed.lifecycleSnapshot.failures["42"],10);
  assert.equal(Object.prototype.hasOwnProperty.call(report.malformed.lifecycleSnapshot.failures,"1001"),false);
  assert.deepEqual(report.malformed.gmSnapshot.failures,report.malformed.lifecycleSnapshot.failures,"GM AU snapshot must consume the formal lifecycle owner failures.");
  assert.deepEqual(report.malformed.gmSnapshot.activeAttempt,report.malformed.lifecycleSnapshot.activeAttempt,"GM AU snapshot must consume the formal lifecycle owner active attempt.");

  assert.equal(report.changed.report.ok,true);
  assert.equal(report.changed.report.changed,true);
  assert.equal(report.changed.report.beforeLifeId,2);
  assert.equal(report.changed.report.afterLifeId,3);
  assert.equal(report.changed.state.deepestCleared,40,"Life change must preserve permanent AU deepest progress.");
  assert.equal(report.changed.state.activeAttempt,null,"Life change owner must clear stale AU active attempt.");
  assert.deepEqual(report.changed.state.lifeFailures,{lifeId:3,failures:{}},"Life change owner must reset AU failures for the new life.");

  assert.equal(report.same.report.changed,false);
  assert.deepEqual(report.same.after,report.same.before,"Same-life reconciliation must not clear AU current-life state.");

  assert.equal(report.rebuilt.result.ok,true);
  assert.equal(report.rebuilt.result.lifeReconciliation?.changed,true,"Breakthrough rebuild must delegate cross-life cleanup to reincarnation owner.");
  assert.equal(report.rebuilt.state.count,3);
  assert.equal(report.rebuilt.state.breakthrough.permanent,25);
  assert.equal(report.rebuilt.state.alternateUniverse.deepestCleared,40);
  assert.equal(report.rebuilt.state.alternateUniverse.activeAttempt,null);
  assert.deepEqual(report.rebuilt.state.alternateUniverse.lifeFailures,{lifeId:3,failures:{}});

  assert.equal(report.rebuiltSame.result.ok,true);
  assert.equal(report.rebuiltSame.result.lifeReconciliation?.changed,false);
  assert.deepEqual(report.rebuiltSame.after,report.rebuiltSame.before,"Same-life breakthrough adjustment must preserve AU attempt/failure state.");

  assert.equal(report.integrity.reincarnation?.passed,true,"Reincarnation lifecycle integrity failed.");
  assert.equal(report.integrity.breakthrough?.passed,true,"Breakthrough integrity failed.");
  assert.equal(report.integrity.gmAu?.passed,true,"GM AU management integrity failed.");
  assert.deepEqual(pageErrors,[],"Browser pageerror:\n"+pageErrors.join("\n\n"));

  const breakthroughSource=fs.readFileSync("breakthroughcore.js","utf8");
  const gmAuSource=fs.readFileSync("gmalternateuniversemanage.js","utf8");
  assert.equal(breakthroughSource.includes("au.activeAttempt=null"),false,"Breakthrough owner must not directly clear AU activeAttempt.");
  assert.equal(breakthroughSource.includes("au.lifeFailures="),false,"Breakthrough owner must not directly rebuild AU lifeFailures.");
  assert.equal(gmAuSource.includes("Object.entries(failureOwner).map"),false,"GM AU snapshot must not maintain a second failure canonicalization pipeline.");

  console.log("Batch7 post optimization 3 integrity passed:",JSON.stringify({versions:report.versions,readOnly:report.malformed.before===report.malformed.after,lifeChange:report.changed.report,rebuildLifeChange:report.rebuilt.result.lifeReconciliation,sameLifePreserved:JSON.stringify(report.rebuiltSame.before)===JSON.stringify(report.rebuiltSame.after)}));
 }finally{await browser.close();}
})().catch(error=>{console.error(error?.stack||error);process.exit(1);});
