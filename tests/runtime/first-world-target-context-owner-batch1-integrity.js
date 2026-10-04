const {chromium}=require("playwright");
const assert=require("assert");

(async()=>{
 const browser=await chromium.launch({headless:true});
 const page=await browser.newPage();
 const pageErrors=[];
 page.on("pageerror",error=>pageErrors.push(String(error?.stack||error?.message||error)));
 const url=process.env.RUNTIME_SMOKE_URL||"http://127.0.0.1:4173/index.html";
 try{
  await page.goto(url,{waitUntil:"domcontentloaded",timeout:30000});
  await page.waitForFunction(()=>window.FIRST_WORLD_TARGET_CONTEXT_VERSION===1&&window.FIRST_WORLD_REINCARNATION_TARGET_CONTEXT_DELEGATE_VERSION===1&&window.FIRST_WORLD_TARGET_CONTEXT_INTEGRITY?.passed===true,{timeout:30000});
  const report=await page.evaluate(()=>{
   const deep=value=>JSON.parse(JSON.stringify(value));
   const originalState=deep(state),beforeState=JSON.stringify(state),beforeStorage=localStorage.getItem(SAVE_KEY);
   const originalSelection={selectedMap,selectedEnemy};
   const makeFirstWorldState=count=>{
    const s=deep(originalState);
    if(s.secondWorld&&typeof s.secondWorld==="object")s.secondWorld.entered=false;
    if(s.thirdWorld&&typeof s.thirdWorld==="object")s.thirdWorld.entered=false;
    if(!s.reincarnation||typeof s.reincarnation!=="object")s.reincarnation={};
    s.reincarnation.count=count;
    return s;
   };
   try{
    const first=makeFirstWorldState(0),rerun=makeFirstWorldState(2);
    const formalNormal=window.createFirstWorldTargetContext({mode:"formal",mapIndex:0,enemyIndex:0,source:"test"},first);
    const formalElite=window.createFirstWorldTargetContext({mode:"formal",mapIndex:0,enemyIndex:3,source:"test"},first);
    const formalBoss=window.createFirstWorldTargetContext({mode:"formal",mapIndex:0,enemyIndex:4,source:"test"},first);
    const invalid=window.createFirstWorldTargetContext({mode:"formal",mapIndex:-1,enemyIndex:9,source:"test"},first);
    const rerunBoss=window.createFirstWorldTargetContext({mode:"rerun",mapIndex:99,enemyIndex:4,source:"test"},rerun);
    const wrongFormalOnRerun=window.createFirstWorldTargetContext({mode:"formal",mapIndex:99,enemyIndex:4,source:"test"},rerun);
    const review=window.createFirstWorldTargetContext({mode:"review",mapIndex:7,enemyIndex:4,source:"test"},first);
    const uniqueA=window.createFirstWorldTargetContext({mode:"formal",mapIndex:0,enemyIndex:0},first);
    const uniqueB=window.createFirstWorldTargetContext({mode:"formal",mapIndex:0,enemyIndex:0},first);

    state=rerun;selectedMap=99;selectedEnemy=4;
    const compat=window.firstWorldReincarnationTargetContext(state);
    const canonical=compat.canonicalContext;

    window.openGalaxyReviewMap(6);window.setGalaxyReviewSelectedEnemy(3);
    const reviewSelection=window.firstWorldTargetContextFromSelection({mode:"review",source:"review-test"},first);

    const sourcePromise=fetch("reincarnationrerunworld1.js",{cache:"no-store"}).then(r=>r.text());
    return Promise.resolve(sourcePromise).then(source=>({
     versions:{context:window.FIRST_WORLD_TARGET_CONTEXT_VERSION,identity:window.FIRST_WORLD_TARGET_IDENTITY_VERSION,policy:window.FIRST_WORLD_TARGET_POLICY_VERSION,delegate:window.FIRST_WORLD_REINCARNATION_TARGET_CONTEXT_DELEGATE_VERSION},
     self:window.FIRST_WORLD_TARGET_CONTEXT_INTEGRITY,
     formalNormal,formalElite,formalBoss,invalid,rerunBoss,wrongFormalOnRerun,review,uniqueIds:[uniqueA.contextId,uniqueB.contextId],compat,canonical,reviewSelection,
     sameIdentity:window.sameFirstWorldTargetIdentity(rerunBoss,canonical),
     validation:{formal:window.validateFirstWorldTargetContext(formalNormal),invalid:window.validateFirstWorldTargetContext(invalid)},
     frozen:{context:Object.isFrozen(formalNormal),identity:Object.isFrozen(formalNormal.identity),policy:Object.isFrozen(formalNormal.policy)},
     noMutableRefs:!["state","map","enemy"].some(key=>Object.prototype.hasOwnProperty.call(formalNormal,key)),
     rerunDelegates:source.includes("firstWorldTargetContextFromSelection")&&source.includes("canonicalContext:canonical||null"),
     stateStable:beforeState===JSON.stringify(originalState),
     storageStable:beforeStorage===localStorage.getItem(SAVE_KEY)
    }));
   }finally{state=originalState;selectedMap=originalSelection.selectedMap;selectedEnemy=originalSelection.selectedEnemy;}
  });

  assert.deepEqual(report.versions,{context:1,identity:1,policy:1,delegate:1});
  assert.equal(report.self.passed,true,JSON.stringify(report.self.errors||[]));
  assert.equal(report.formalNormal.valid,true);assert.equal(report.formalNormal.authorized,true);assert.equal(report.formalNormal.targetType,"normal");
  assert.equal(report.formalElite.targetType,"elite");assert.equal(report.formalBoss.targetType,"boss");
  assert.equal(report.formalNormal.policy.formalRewardsAllowed,true);assert.equal(report.formalNormal.policy.formalProgressAllowed,true);assert.equal(report.formalNormal.policy.offlineSampleAllowed,true);assert.equal(report.formalBoss.policy.offlineSampleAllowed,false);assert.equal(report.formalBoss.policy.specialEncounterAllowed,false);
  assert.equal(report.invalid.valid,false);assert.equal(report.invalid.authorized,false);assert.equal(report.invalid.policy.formalRewardsAllowed,false);assert.equal(report.invalid.mapIndex,-1);assert.equal(report.invalid.enemyIndex,-1);
  assert.equal(report.rerunBoss.authorized,true);assert.equal(report.rerunBoss.reincarnationRun,true);assert.equal(report.rerunBoss.lifeId,2);
  assert.equal(report.wrongFormalOnRerun.authorized,false,"Formal mode must not authorize a rerun life.");
  assert.equal(report.review.authorized,true);assert.equal(report.review.mode,"review");Object.entries(report.review.policy).filter(([k])=>k!=="version").forEach(([k,v])=>assert.equal(v,false,`Review policy ${k} must be false.`));
  assert.notEqual(report.uniqueIds[0],report.uniqueIds[1],"Every runtime context must have a unique contextId.");
  assert.deepEqual(report.frozen,{context:true,identity:true,policy:true});assert.equal(report.noMutableRefs,true);
  assert.equal(report.validation.formal.passed,true);assert.equal(report.validation.invalid.passed,true,"Fail-closed invalid contexts are still structurally valid contexts.");
  assert.equal(report.compat.authorized,true);assert.equal(report.compat.mapIndex,99);assert.equal(report.compat.enemyIndex,4);assert.equal(report.canonical.mode,"rerun");assert.equal(report.sameIdentity,true);assert.equal(report.rerunDelegates,true);
  assert.equal(report.reviewSelection.mapIndex,6);assert.equal(report.reviewSelection.enemyIndex,3);assert.equal(report.reviewSelection.mode,"review");assert.equal(report.reviewSelection.source,"review-test");
  assert.equal(report.stateStable,true);assert.equal(report.storageStable,true);
  assert.deepEqual(pageErrors,[],"Browser pageerror:\n"+pageErrors.join("\n\n"));
  console.log("First-world target context owner Batch1 integrity passed:",JSON.stringify({versions:report.versions,formal:{normal:report.formalNormal.identity,elite:report.formalElite.identity,boss:report.formalBoss.identity},rerun:report.canonical.identity,review:report.reviewSelection.identity,frozen:report.frozen,uniqueIds:report.uniqueIds,stateStable:report.stateStable,storageStable:report.storageStable}));
 }finally{await browser.close();}
})().catch(error=>{console.error(error?.stack||error);process.exit(1);});
