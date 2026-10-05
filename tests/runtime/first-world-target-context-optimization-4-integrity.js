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
  await page.waitForFunction(()=>window.FIRST_WORLD_TARGET_METADATA_VERSION===1&&window.FIRST_WORLD_PERSISTED_TARGET_ADAPTER_VERSION===1&&window.FIRST_WORLD_OFFLINE_TARGET_METADATA_BRIDGE_VERSION===1,{timeout:30000});
  const report=await page.evaluate(async()=>{
   const deep=value=>JSON.parse(JSON.stringify(value));
   const originalState=deep(state);
   try{
    if(state.secondWorld)state.secondWorld.entered=false;
    if(state.thirdWorld)state.thirdWorld.entered=false;
    if(!state.reincarnation)state.reincarnation={};
    state.reincarnation.count=0;

    const direct=window.createFirstWorldTargetContext({mode:"formal",mapIndex:2,enemyIndex:3,source:"opt4-direct"},state);
    const metadata=window.firstWorldTargetMetadata(direct);
    const persisted={sampleVersion:4,world:1,targetType:"mapEnemy",map:2,enemy:3};
    const fromPersisted=window.firstWorldTargetContextFromPersisted(persisted,{source:"opt4-persisted",policy:{offlineSampleAllowed:true}},state);
    const aliasPersisted=window.firstWorldTargetContextFromPersisted({world:1,targetType:"mapEnemy",mapIndex:2,enemyIndex:3},{source:"opt4-alias",policy:{offlineSampleAllowed:true}},state);
    const bossRejected=window.firstWorldTargetContextFromPersisted({world:1,targetType:"mapEnemy",map:2,enemy:4},{source:"opt4-boss"},state);
    const invalidRejected=window.firstWorldTargetContextFromPersisted({world:1,targetType:"mapEnemy",map:-1,enemy:0},{source:"opt4-invalid"},state);

    const legacyState=deep(state);
    legacyState.saveVersion=16;
    legacyState.offline={battleSampleVersion:3,lastSettledAt:1000,battleSamples:[{sampleVersion:3,world:1,targetType:"mapEnemy",combatSpeed:1,actualMs:1000,cycleMs:1140,adjustedMs:1140,playerLevel:10,enemyLevel:10,kind:"normal",map:0,enemy:0,multiplier:1,recordedAt:1000}],pendingSettlement:null,maxObservedWallClock:1000,timeLockUntil:0};
    window.normalizeOfflineSaveState(legacyState,{sourceVersion:16,currentTime:2000});
    const legacyRow=legacyState.offline.battleSamples[0];
    const legacyContext=window.firstWorldTargetContextFromPersisted(legacyRow,{source:"opt4-legacy",policy:{offlineSampleAllowed:true}},state);
    const legacyMetadata=window.firstWorldTargetMetadata(legacyContext);

    const resolved=window.resolveFirstWorldOfflineTargetContext({world:1,targetType:"mapEnemy",map:2,enemy:3},state,"opt4-bridge");
    const canonical=window.resolveCanonicalFirstWorldOfflineEnemy({world:1,targetType:"mapEnemy",map:2,enemy:3},state);

    const coreSource=await (await fetch("firstworldtargetcontext.js",{cache:"no-store"})).text();
    const batch5Source=await (await fetch("firstworldtargetcontextbatch5.js",{cache:"no-store"})).text();
    const offlineSource=await (await fetch("offlinestatecore.js",{cache:"no-store"})).text();
    return {
     versions:{metadata:window.FIRST_WORLD_TARGET_METADATA_VERSION,persisted:window.FIRST_WORLD_PERSISTED_TARGET_ADAPTER_VERSION,bridge:window.FIRST_WORLD_OFFLINE_TARGET_METADATA_BRIDGE_VERSION,delegate:window.FIRST_WORLD_OFFLINE_PERSISTED_TARGET_DELEGATE_VERSION,sample:window.OFFLINE_BATTLE_SAMPLE_VERSION,schema:window.SAVE_SCHEMA_VERSION},
     metadata:{frozen:Object.isFrozen(metadata),world:metadata?.world,mapIndex:metadata?.mapIndex,enemyIndex:metadata?.enemyIndex,targetType:metadata?.targetType,enemyLevel:metadata?.enemyLevel,mapName:metadata?.mapName,enemyName:metadata?.enemyName},
     persisted:{ok:!!fromPersisted,same:window.sameFirstWorldTargetIdentity(direct,fromPersisted),alias:window.sameFirstWorldTargetIdentity(direct,aliasPersisted),bossRejected:bossRejected===null,invalidRejected:invalidRejected===null},
     legacy:{sampleVersion:legacyRow?.sampleVersion,provenance:legacyRow?.overlevelContextRecorded,context:!!legacyContext,mapIndex:legacyMetadata?.mapIndex,enemyIndex:legacyMetadata?.enemyIndex,targetType:legacyMetadata?.targetType},
     bridge:{resolved:!!resolved,canonical:!!canonical,metadataVersion:canonical?.metadata?.version,identityMatch:window.sameFirstWorldTargetIdentity(resolved,canonical?.context)},
     source:{coreOwnsPersisted:coreSource.includes("function contextFromPersisted")&&coreSource.includes("FIRST_WORLD_PERSISTED_TARGET_ADAPTER_VERSION"),batch5Delegates:batch5Source.includes("window.firstWorldTargetContextFromPersisted")&&!batch5Source.includes("Math.floor(Number(raw.map))"),batch5Metadata:batch5Source.includes("window.firstWorldTargetMetadata")&&batch5Source.includes("targetMetadata:metadata"),legacyFormatUnchanged:offlineSource.includes("OFFLINE_BATTLE_SAMPLE_VERSION=4")&&offlineSource.includes('targetType:"mapEnemy"')&&offlineSource.includes("map,enemy")}
    };
   }finally{state=originalState;window.clearPreparedFirstWorldTargetContext?.();}
  });
  console.log("Target Context optimization 4 diagnostic:",JSON.stringify(report));
  assert.deepEqual(report.versions,{metadata:1,persisted:1,bridge:1,delegate:1,sample:4,schema:17});
  assert.equal(report.metadata.frozen,true);assert.equal(report.metadata.world,1);assert.equal(report.metadata.mapIndex,2);assert.equal(report.metadata.enemyIndex,3);assert.equal(report.metadata.targetType,"elite");assert.ok(report.metadata.enemyLevel>0);assert.ok(report.metadata.mapName);assert.ok(report.metadata.enemyName);
  assert.deepEqual(report.persisted,{ok:true,same:true,alias:true,bossRejected:true,invalidRejected:true});
  assert.equal(report.legacy.sampleVersion,4);assert.equal(report.legacy.provenance,true);assert.equal(report.legacy.context,true);assert.equal(report.legacy.mapIndex,0);assert.equal(report.legacy.enemyIndex,0);assert.equal(report.legacy.targetType,"normal");
  assert.equal(report.bridge.resolved,true);assert.equal(report.bridge.canonical,true);assert.equal(report.bridge.metadataVersion,1);assert.equal(report.bridge.identityMatch,true);
  Object.entries(report.source).forEach(([name,value])=>assert.equal(value,true,`Optimization 4 source contract failed: ${name}`));
  assert.deepEqual(pageErrors,[],"Browser pageerror:\n"+pageErrors.join("\n\n"));
  console.log("First-world Target Context optimization 4 integrity passed:",JSON.stringify(report));
 }finally{await browser.close();}
})().catch(error=>{console.error(error?.stack||error);process.exit(1);});