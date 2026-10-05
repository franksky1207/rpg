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
  await page.waitForFunction(()=>window.FIRST_WORLD_SPECIAL_SELECTION_PROJECTION_RETIRED_VERSION===1&&window.FIRST_WORLD_CURRENT_CONTEXT_VALIDATOR_REQUIRED_VERSION===1&&window.FIRST_WORLD_EXECUTION_VALIDATOR_REQUIRED_VERSION===1&&window.SPECIAL_ENCOUNTER_W1_EXPLICIT_TARGET_VERSION===1,{timeout:30000});
  const report=await page.evaluate(async()=>{
   const deep=value=>JSON.parse(JSON.stringify(value));
   const originalState=deep(state),originalMap=selectedMap,originalEnemy=selectedEnemy;
   const originalValidator=window.validateCurrentFirstWorldTargetContext;
   function makeState(){
    const s=deep(originalState);
    if(s.secondWorld)s.secondWorld.entered=false;if(s.thirdWorld)s.thirdWorld.entered=false;
    if(!s.reincarnation)s.reincarnation={};s.reincarnation.count=0;
    s.level=500;s.unlockedMap=99;s.mapProgress=Array.from({length:MAPS.length},()=>[10,10,10,10]);s.bossProgress=Array(MAPS.length).fill(10);s.bossLocked=Array(MAPS.length).fill(false);s.bossKilled=Array(MAPS.length).fill(false);
    return s;
   }
   try{
    state=makeState();selectedMap=99;selectedEnemy=4;window.clearPreparedFirstWorldTargetContext?.();
    const target=window.prepareFirstWorldTargetContext({mode:"formal",mapIndex:4,enemyIndex:3,source:"opt1-target"},state);
    const parent=window.resolveFirstWorldSpecialParentTargetContext({targetContext:target},{parentTargetContext:target});
    const validExecution=window.validateFirstWorldExecutionTargetContext(target,state,{mode:"formal",policy:{formalRewardsAllowed:true,formalProgressAllowed:true}});
    const uiBefore={map:selectedMap,enemy:selectedEnemy};

    window.validateCurrentFirstWorldTargetContext=undefined;
    const missingExecution=window.validateFirstWorldExecutionTargetContext(target,state,{mode:"formal"});
    const missingOffline=window.resolveFirstWorldOfflineTargetContext({world:1,targetType:"mapEnemy",map:4,enemy:3},state,"opt1-validator-missing");
    const uiAfter={map:selectedMap,enemy:selectedEnemy};
    window.validateCurrentFirstWorldTargetContext=originalValidator;

    const specialSource=await (await fetch("specialencounter.js",{cache:"no-store"})).text();
    const batch4Source=await (await fetch("firstworldtargetcontextbatch4.js",{cache:"no-store"})).text();
    const batch5Source=await (await fetch("firstworldtargetcontextbatch5.js",{cache:"no-store"})).text();
    const batch6Source=await (await fetch("firstworldtargetcontextbatch6.js",{cache:"no-store"})).text();
    const closure=window.firstWorldTargetContextClosureSnapshot(state);
    return {
     versions:{special:window.SPECIAL_ENCOUNTER_W1_EXPLICIT_TARGET_VERSION,projectionRetired:window.FIRST_WORLD_SPECIAL_SELECTION_PROJECTION_RETIRED_VERSION,currentValidator:window.FIRST_WORLD_CURRENT_CONTEXT_VALIDATOR_REQUIRED_VERSION,executionValidator:window.FIRST_WORLD_EXECUTION_VALIDATOR_REQUIRED_VERSION},
     target:{id:target?.contextId,map:target?.mapIndex,enemy:target?.enemyIndex,parentId:parent?.contextId},
     execution:{valid:validExecution?.passed===true,missingPassed:missingExecution?.passed===true,missingErrors:[...(missingExecution?.errors||[])]},
     offline:{missingValidatorResult:missingOffline},
     selection:{before:uiBefore,after:uiAfter},
     closure,
     source:{specialNoSelectedMap:!specialSource.includes("selectedMap"),specialNoSelectedEnemy:!specialSource.includes("selectedEnemy"),specialUsesExplicitTarget:specialSource.includes("firstWorldSpecialTarget")&&specialSource.includes("w1Target.mapIndex"),batch4NoSelectionProjection:!batch4Source.includes("selectedMap=")&&!batch4Source.includes("selectedEnemy="),batch4PassesExplicitIdentity:batch4Source.includes("mapIndex:parentTargetContext.mapIndex")&&batch4Source.includes("enemyIndex:parentTargetContext.enemyIndex"),batch5RequiresCurrentValidator:batch5Source.includes('typeof window.validateCurrentFirstWorldTargetContext!=="function")return false')&&!batch5Source.includes("validateFirstWorldTargetContext(context)?.passed"),batch6FailsClosedMissingValidator:batch6Source.includes('errors:["current-validator-missing"]')&&!batch6Source.includes("validateFirstWorldTargetContext(context)")}
    };
   }finally{
    window.validateCurrentFirstWorldTargetContext=originalValidator;window.clearPreparedFirstWorldTargetContext?.();state=originalState;selectedMap=originalMap;selectedEnemy=originalEnemy;
   }
  });
  console.log("W1 Target Context optimization 1 diagnostic:",JSON.stringify(report));
  assert.deepEqual(report.versions,{special:1,projectionRetired:1,currentValidator:1,executionValidator:1});
  assert.equal(report.target.map,4);assert.equal(report.target.enemy,3);assert.equal(report.target.parentId,report.target.id);
  assert.equal(report.execution.valid,true);assert.equal(report.execution.missingPassed,false);assert.ok(report.execution.missingErrors.includes("current-validator-missing"));
  assert.equal(report.offline.missingValidatorResult,null);
  assert.deepEqual(report.selection.before,{map:99,enemy:4});assert.deepEqual(report.selection.after,report.selection.before);
  assert.equal(report.closure.executionValidatorRequired,1);assert.equal(report.closure.saveSchemaVersion,17);
  Object.entries(report.source).forEach(([name,value])=>assert.equal(value,true,`Optimization 1 source contract failed: ${name}`));
  assert.deepEqual(pageErrors,[],"Browser pageerror:\n"+pageErrors.join("\n\n"));
  console.log("First-world Target Context optimization 1 integrity passed:",JSON.stringify(report));
 }finally{await browser.close();}
})().catch(error=>{console.error(error?.stack||error);process.exit(1);});