const {chromium}=require('playwright');
const assert=require('assert');

(async()=>{
 const browser=await chromium.launch({headless:true});
 const page=await browser.newPage();
 const pageErrors=[];
 page.on('pageerror',error=>pageErrors.push(String(error?.stack||error?.message||error)));
 const url=process.env.RUNTIME_SMOKE_URL||'http://127.0.0.1:4173/index.html';
 try{
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>window.OFFLINE_REWARD_CONTEXT_PROVENANCE_VERSION===1&&window.OFFLINE_SAMPLE_OWNER_INTEGRITY?.passed===true&&typeof window.normalizeOfflineSaveState==='function'&&typeof window.offlineOverlevelRewardContext==='function',{timeout:30000});
  const report=await page.evaluate(()=>{
   const originalState=state;
   const baseOffline=(sampleVersion,rows=[],pending=null)=>({battleSampleVersion:sampleVersion,lastSettledAt:1000,farmMap:null,farmEnemy:null,avgBattleMs:0,sampleCount:0,battleSamples:rows,maxObservedWallClock:1000,timeLockUntil:0,pendingSettlement:pending,sampleMigration:null});
   const row=(sampleVersion,world,withLevels=true,marked=false)=>{
    const common={sampleVersion,world,targetType:world===2?'boss':'mapEnemy',combatSpeed:1,actualMs:1000,cycleMs:1140,adjustedMs:1140,kind:world===2?'boss':'normal',multiplier:1,recordedAt:1000};
    if(world===2){common.bossIndex=99;common.bossId='legacy-boss';}else{common.map=0;common.enemy=0;}
    if(withLevels){common.playerLevel=world===2?500:100;common.enemyLevel=world===2?1000:500;}
    if(marked)common.overlevelContextRecorded=true;
    return common;
   };
   const makeState=(sampleVersion,rows,pending=null,phase=1)=>{const s=newState();s.saveVersion=17;s.reincarnation={...(s.reincarnation||{}),count:1};s.secondWorld=createBlankSecondWorldState();s.thirdWorld=createBlankThirdWorldState();if(phase===2)s.secondWorld.entered=true;s.offline=baseOffline(sampleVersion,rows,pending);return s;};
   const normalize=s=>normalizeOfflineSaveState(s,{sourceVersion:17,currentTime:2000});
   const contextFor=(s,r,fallback)=>{state=s;return offlineOverlevelRewardContext({...r,overlevelContextRecorded:r?.overlevelContextRecorded===true},fallback);};
   const out={owner:OFFLINE_SAMPLE_OWNER_INTEGRITY,provenanceVersion:OFFLINE_REWARD_CONTEXT_PROVENANCE_VERSION};
   try{
    const v3Valid=makeState(3,[row(3,1,true)]);normalize(v3Valid);const v3ValidRow=v3Valid.offline.battleSamples[0];out.v3Valid={row:v3ValidRow,context:contextFor(v3Valid,v3ValidRow,1)};
    const v3Missing=makeState(3,[row(3,1,false)]);normalize(v3Missing);const v3MissingRow=v3Missing.offline.battleSamples[0];out.v3Missing={row:v3MissingRow,context:contextFor(v3Missing,v3MissingRow,500)};
    const v4Unmarked=makeState(4,[row(4,1,true,false)]);normalize(v4Unmarked);const v4UnmarkedRow=v4Unmarked.offline.battleSamples[0];out.v4Unmarked={row:v4UnmarkedRow,context:contextFor(v4Unmarked,v4UnmarkedRow,500)};
    const native=makeState(4,[]);state=native;const appended=appendOfflineBattleSample(native,row(4,1,true,false),{currentTime:2000});out.native={append:appended,context:contextFor(native,appended.row,1)};

    const v3W2Valid=makeState(3,[row(3,2,true)],null,2);normalize(v3W2Valid);const v3W2ValidRow=v3W2Valid.offline.battleSamples[0];out.v3W2Valid={row:v3W2ValidRow,context:contextFor(v3W2Valid,v3W2ValidRow,1000)};
    const v3W2Missing=makeState(3,[row(3,2,false)],null,2);normalize(v3W2Missing);const v3W2MissingRow=v3W2Missing.offline.battleSamples[0];out.v3W2Missing={row:v3W2MissingRow,context:contextFor(v3W2Missing,v3W2MissingRow,1000)};

    const pendingBase={sampleVersion:3,world:1,targetType:'mapEnemy',combatSpeed:1,avgBattleMs:1000,elapsedRaw:60000,elapsedUsed:60000,battles:60,createdAt:1000,map:0,enemy:0};
    const pendingValid=makeState(3,[],{...pendingBase,playerLevel:100,enemyLevel:500});normalize(pendingValid);out.pendingValid={pending:pendingValid.offline.pendingSettlement,context:contextFor(pendingValid,pendingValid.offline.pendingSettlement,1)};
    const pendingMissing=makeState(3,[],pendingBase);normalize(pendingMissing);out.pendingMissing={pending:pendingMissing.offline.pendingSettlement,context:contextFor(pendingMissing,pendingMissing.offline.pendingSettlement,500)};
    const pendingV4Unmarked=makeState(4,[],{...pendingBase,sampleVersion:4,playerLevel:100,enemyLevel:500});normalize(pendingV4Unmarked);out.pendingV4Unmarked={pending:pendingV4Unmarked.offline.pendingSettlement,context:contextFor(pendingV4Unmarked,pendingV4Unmarked.offline.pendingSettlement,500)};

    const firstRun=makeState(4,[]);firstRun.reincarnation.count=0;state=firstRun;out.firstRun=offlineOverlevelRewardContext({playerLevel:100,enemyLevel:500,overlevelContextRecorded:true},500);
    const w3=newState();w3.saveVersion=17;w3.reincarnation={...(w3.reincarnation||{}),count:1};w3.secondWorld=createBlankSecondWorldState();w3.secondWorld.entered=true;w3.thirdWorld=createBlankThirdWorldState();w3.thirdWorld.entered=true;w3.offline=baseOffline(4,[{sampleVersion:4,world:3,targetType:'higher-dimensional',combatSpeed:1,actualMs:1000,cycleMs:1140,adjustedMs:1140,playerLevel:1500,kind:'higher-dimensional',multiplier:1,recordedAt:1000}]);normalize(w3);out.w3=w3.offline.battleSamples[0];
   }finally{state=originalState;}
   return out;
  });

  assert.deepEqual(pageErrors,[],'Browser pageerror:\n'+pageErrors.join('\n\n'));
  assert.equal(report.provenanceVersion,1);assert.equal(report.owner.version,4);assert.equal(report.owner.passed,true);
  assert.equal(report.v3Valid.row.overlevelContextRecorded,true);assert.equal(report.v3Valid.row.playerLevel,100);assert.equal(report.v3Valid.row.enemyLevel,500);assert.equal(report.v3Valid.context.recorded,true);assert.equal(report.v3Valid.context.multiplier,13);
  assert.equal(report.v3Missing.row.overlevelContextRecorded,false);assert.equal('playerLevel' in report.v3Missing.row,false);assert.equal('enemyLevel' in report.v3Missing.row,false);assert.equal(report.v3Missing.context.recorded,false);assert.equal(report.v3Missing.context.multiplier,1);
  assert.equal(report.v4Unmarked.row.overlevelContextRecorded,false);assert.equal('playerLevel' in report.v4Unmarked.row,false);assert.equal('enemyLevel' in report.v4Unmarked.row,false);assert.equal(report.v4Unmarked.context.recorded,false);assert.equal(report.v4Unmarked.context.multiplier,1);
  assert.equal(report.native.append.ok,true);assert.equal(report.native.append.row.overlevelContextRecorded,true);assert.equal(report.native.context.recorded,true);assert.equal(report.native.context.multiplier,13);
  assert.equal(report.v3W2Valid.row.overlevelContextRecorded,true);assert.equal(report.v3W2Valid.context.recorded,true);assert.equal(report.v3W2Valid.context.multiplier,16);
  assert.equal(report.v3W2Missing.row.overlevelContextRecorded,false);assert.equal(report.v3W2Missing.context.recorded,false);assert.equal(report.v3W2Missing.context.multiplier,1);
  assert.equal(report.pendingValid.pending.overlevelContextRecorded,true);assert.equal(report.pendingValid.context.recorded,true);assert.equal(report.pendingValid.context.multiplier,13);
  assert.equal(report.pendingMissing.pending.overlevelContextRecorded,false);assert.equal('playerLevel' in report.pendingMissing.pending,false);assert.equal('enemyLevel' in report.pendingMissing.pending,false);assert.equal(report.pendingMissing.context.multiplier,1);
  assert.equal(report.pendingV4Unmarked.pending.overlevelContextRecorded,false);assert.equal(report.pendingV4Unmarked.context.multiplier,1);
  assert.equal(report.firstRun.recorded,true);assert.equal(report.firstRun.multiplier,1);
  assert.equal(report.w3.world,3);assert.equal(report.w3.targetType,'higher-dimensional');assert.equal('overlevelContextRecorded' in report.w3,false);
  console.log('Offline sample provenance optimization Batch4 integrity passed:',JSON.stringify(report));
 }finally{await browser.close();}
})().catch(error=>{console.error(error?.stack||error);process.exit(1);});
