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
  await page.waitForFunction(()=>window.FIRST_WORLD_TARGET_CONTEXT_BATCH5_VERSION===1&&window.FIRST_WORLD_OFFLINE_TARGET_CONTEXT_VERSION===1&&window.FIRST_WORLD_RERUN_TARGET_CONTEXT_BOUNDARY_VERSION===1&&window.FIRST_WORLD_REVIEW_TARGET_CONTEXT_BOUNDARY_VERSION===1,{timeout:30000});
  const report=await page.evaluate(async()=>{
   const deep=value=>JSON.parse(JSON.stringify(value));
   const originalState=deep(state);
   const originals={selectedMap,selectedEnemy,selectedBattleCount,adventureScreen,battleBusy,currentCombatEncounter,runCombatCore:window.runCombatCore,render:window.render,animateFight:window.animateFight,alert:window.alert};
   function makeState(count=0){
    const s=deep(originalState);
    if(s.secondWorld)s.secondWorld.entered=false;if(s.thirdWorld)s.thirdWorld.entered=false;
    if(!s.reincarnation)s.reincarnation={};s.reincarnation.count=count;
    s.level=count>0?100:500;s.unlockedMap=99;
    s.mapProgress=Array.from({length:MAPS.length},()=>[10,10,10,10]);s.bossProgress=Array(MAPS.length).fill(10);s.bossLocked=Array(MAPS.length).fill(false);s.bossKilled=Array(MAPS.length).fill(false);
    return s;
   }
   try{
    state=makeState(1);selectedMap=99;selectedEnemy=4;window.clearPreparedFirstWorldTargetContext();
    const offlineRaw={world:1,targetType:"mapEnemy",map:4,enemy:3};
    const offline=window.resolveFirstWorldOfflineTargetContext(offlineRaw,state,"batch5-offline-test");
    const canonicalEnemy=window.resolveCanonicalFirstWorldOfflineEnemy(offlineRaw,state);

    window.clearPreparedFirstWorldTargetContext();
    const rerunPrepared=window.prepareFirstWorldTargetContext({mode:"rerun",mapIndex:9,enemyIndex:4,source:"batch5-rerun-prepared"},state);
    selectedMap=99;selectedEnemy=0;
    const rerunResolved=window.firstWorldReincarnationTargetContext(state);
    const rerunFromSelection=window.firstWorldTargetContextFromSelection({mode:"rerun",source:"batch5-rerun-consumer"},state);

    state=makeState(0);selectedMap=55;selectedEnemy=2;battleBusy=false;currentCombatEncounter=null;window.clearPreparedFirstWorldTargetContext();
    window.openGalaxyReviewMap(7);window.setGalaxyReviewSelectedEnemy(3);
    const reviewPrepared=window.prepareFirstWorldTargetContextFromSelection({mode:"review",source:"batch5-review-prepared"},state);
    window.openGalaxyReviewMap(0);window.setGalaxyReviewSelectedEnemy(0);
    let combatEnemy=null;
    window.runCombatCore=(ps,e,startHp)=>{combatEnemy={name:e?.name,level:e?.level};return {win:true,logs:[],events:[],hp:startHp,enemyHp:0,turns:1};};
    window.render=()=>{};window.animateFight=async()=>{};window.alert=()=>{};
    const stateBefore=JSON.stringify(state),formalBefore={map:selectedMap,enemy:selectedEnemy};
    const reviewOk=await window.startGalaxyReviewBattle();
    const stateAfter=JSON.stringify(state),formalAfter={map:selectedMap,enemy:selectedEnemy};
    const reviewSelectionAfter={map:window.getGalaxyReviewSelectedMap?.(),enemy:window.getGalaxyReviewSelectedEnemy?.()};

    const source=await (await fetch("firstworldtargetcontextbatch5.js",{cache:"no-store"})).text();
    return {
     versions:{batch5:window.FIRST_WORLD_TARGET_CONTEXT_BATCH5_VERSION,offline:window.FIRST_WORLD_OFFLINE_TARGET_CONTEXT_VERSION,rerun:window.FIRST_WORLD_RERUN_TARGET_CONTEXT_BOUNDARY_VERSION,review:window.FIRST_WORLD_REVIEW_TARGET_CONTEXT_BOUNDARY_VERSION},
     offline:{context:{mode:offline?.mode,map:offline?.mapIndex,enemy:offline?.enemyIndex,allowed:offline?.policy?.offlineSampleAllowed},canonical:{map:canonicalEnemy?.context?.mapIndex,enemy:canonicalEnemy?.context?.enemyIndex,name:canonicalEnemy?.enemy?.name},ui:{map:selectedMap,enemy:selectedEnemy}},
     rerun:{preparedId:rerunPrepared?.contextId,resolvedId:rerunResolved?.canonicalContext?.contextId,selectionId:rerunFromSelection?.contextId,map:rerunResolved?.mapIndex,enemy:rerunResolved?.enemyIndex},
     review:{ok:reviewOk,prepared:{id:reviewPrepared?.contextId,map:reviewPrepared?.mapIndex,enemy:reviewPrepared?.enemyIndex,name:reviewPrepared?.enemyName},combatEnemy,stateStable:stateBefore===stateAfter,formalStable:JSON.stringify(formalBefore)===JSON.stringify(formalAfter),selectionAfter:reviewSelectionAfter},
     source:{offlineExplicitIdentity:source.includes("offline-persisted-identity")&&source.includes("createFirstWorldTargetContext"),offlineNoBoss:source.includes("offlineSampleAllowed"),rerunPreparedBoundary:source.includes('prepared?.mode==="rerun"'),reviewPreparedBoundary:source.includes('context?.mode==="review"'),reviewRestoresSelection:source.includes("window.getGalaxyReviewSelectedMap=originalGetMap")&&source.includes("window.getGalaxyReviewSelectedEnemy=originalGetEnemy")}
    };
   }finally{
    window.clearPreparedFirstWorldTargetContext?.();state=originalState;selectedMap=originals.selectedMap;selectedEnemy=originals.selectedEnemy;selectedBattleCount=originals.selectedBattleCount;adventureScreen=originals.adventureScreen;battleBusy=originals.battleBusy;currentCombatEncounter=originals.currentCombatEncounter;window.runCombatCore=originals.runCombatCore;window.render=originals.render;window.animateFight=originals.animateFight;window.alert=originals.alert;
   }
  });
  console.log("Batch5 diagnostic:",JSON.stringify(report));
  assert.deepEqual(report.versions,{batch5:1,offline:1,rerun:1,review:1});
  assert.equal(report.offline.context.mode,"rerun");assert.equal(report.offline.context.map,4);assert.equal(report.offline.context.enemy,3);assert.equal(report.offline.context.allowed,true);assert.equal(report.offline.canonical.map,4);assert.equal(report.offline.canonical.enemy,3);
  assert.equal(report.rerun.resolvedId,report.rerun.preparedId);assert.equal(report.rerun.selectionId,report.rerun.preparedId);assert.equal(report.rerun.map,9);assert.equal(report.rerun.enemy,4);
  assert.equal(report.review.ok,true);assert.equal(report.review.prepared.map,7);assert.equal(report.review.prepared.enemy,3);assert.equal(report.review.combatEnemy.name,report.review.prepared.name);assert.equal(report.review.stateStable,true);assert.equal(report.review.formalStable,true);assert.deepEqual(report.review.selectionAfter,{map:0,enemy:0});
  Object.entries(report.source).forEach(([name,value])=>assert.equal(value,true,`Batch5 source contract failed: ${name}`));
  assert.deepEqual(pageErrors,[],"Browser pageerror:\n"+pageErrors.join("\n\n"));
  console.log("First-world Target Context Batch5 offline/rerun/review integrity passed:",JSON.stringify(report));
 }finally{await browser.close();}
})().catch(error=>{console.error(error?.stack||error);process.exit(1);});