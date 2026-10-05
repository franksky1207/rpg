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
  await page.waitForFunction(()=>window.PLAYER_BATCH_UPGRADE_VERSION===2&&window.PLAYER_BATCH_UPGRADE_TRANSACTION_VERSION===1&&window.SHARED_SETTLEMENT_TRANSACTION_VERSION===2&&typeof window.runSettlementTransaction==='function'&&typeof window.specializationBalancedUpgradePreview==='function'&&typeof window.enhancementBalancedUpgradePreview==='function',{timeout:30000});
  const report=await page.evaluate(()=>{
   const milestones=count=>Object.fromEntries([100,200,300,400,500,600,700,800,900,1000].map(level=>[String(level),false]));
   const reincarnation=count=>({count,breakthrough:{permanent:0,milestoneLifeId:count,milestones:milestones(count)},alternateUniverse:{unlocked:false,deepestCleared:0,activeAttempt:null,lifeFailures:{lifeId:count,failures:{}}}});
   const makeW1=count=>{const s=newState();s.saveVersion=17;s.reincarnation=reincarnation(count);s.secondWorld=createBlankSecondWorldState();s.thirdWorld=createBlankThirdWorldState();return s;};
   const makeW2=count=>{const s=makeW1(count);s.level=500;s.secondWorld=createBlankSecondWorldState();s.secondWorld.entered=true;s.thirdWorld=createBlankThirdWorldState();return s;};
   const makeW3=count=>{const s=makeW2(count);s.level=1000;s.thirdWorld=createBlankThirdWorldState();s.thirdWorld.entered=true;return s;};
   const originalState=state,originalView=view,originalSave=save;
   const out={versions:{batch:PLAYER_BATCH_UPGRADE_VERSION,batchTransaction:PLAYER_BATCH_UPGRADE_TRANSACTION_VERSION,shared:SHARED_SETTLEMENT_TRANSACTION_VERSION}};
   try{
    // Specialization: same owner and same result for first-run and rerun W1 only.
    const specFirst=makeW1(0);specFirst.gold=3500;
    const specRerun=makeW1(1);specRerun.gold=3500;
    out.specPreviewFirst=specializationBalancedUpgradePreview(specFirst);
    out.specPreviewRerun=specializationBalancedUpgradePreview(specRerun);

    state=specRerun;view='specialization';render();
    out.specButtonW1=!!document.getElementById('balancedSpecializationUpgradeButton');
    out.specExec=performBalancedSpecializationUpgrade({skipConfirm:true,silent:true});
    out.specAfter={gold:state.gold,levels:Object.fromEntries(SPECIALIZATION_KEYS.map(key=>[key,state.specializations[key]]))};

    const specW2=makeW2(0);SPECIALIZATION_KEYS.forEach(key=>specW2.specializations[key]=60);state=specW2;view='specialization';render();
    out.specButtonW2=!!document.getElementById('balancedSpecializationUpgradeButton');
    out.specW2Preview=specializationBalancedUpgradePreview(state);

    // Enhancement W1: 3 affordable +13 upgrades from equal +12 state.
    const enhFirst=makeW1(0),enhRerun=makeW1(1);
    [enhFirst,enhRerun].forEach(s=>{ENHANCEMENT_SLOTS.forEach(key=>s.enhancement.levels[key]=12);s.enhancement.basicStones=2000;s.enhancement.advancedStones=200;});
    out.enhW1First=enhancementBalancedUpgradePreview(enhFirst);
    out.enhW1Rerun=enhancementBalancedUpgradePreview(enhRerun);
    state=enhRerun;view='enhancement';render();
    out.enhButtonW1=!!document.getElementById('balancedEnhancementUpgradeButton');
    out.enhW1Exec=performBalancedEnhancementUpgrade({skipConfirm:true,silent:true});
    out.enhW1After={levels:Object.fromEntries(ENHANCEMENT_SLOTS.map(key=>[key,state.enhancement.levels[key]])),basic:state.enhancement.basicStones,advanced:state.enhancement.advancedStones};

    // Enhancement W2: same logic for first-run/rerun, using formal W2 resources/cost owner.
    const enhW2First=makeW2(0),enhW2Rerun=makeW2(1);
    [enhW2First,enhW2Rerun].forEach(s=>{ENHANCEMENT_SLOTS.forEach(key=>s.enhancement.levels[key]=20);s.secondWorld.darkMatter=100000;s.secondWorld.darkEnergy=950;SPECIALIZATION_KEYS.forEach(key=>s.specializations[key]=60);});
    out.enhW2First=enhancementBalancedUpgradePreview(enhW2First);
    out.enhW2Rerun=enhancementBalancedUpgradePreview(enhW2Rerun);
    state=enhW2Rerun;view='enhancement';render();
    out.enhButtonW2=!!document.getElementById('balancedEnhancementUpgradeButton');
    out.enhW2Exec=performBalancedEnhancementUpgrade({skipConfirm:true,silent:true});
    out.enhW2After={levels:Object.fromEntries(ENHANCEMENT_SLOTS.map(key=>[key,state.enhancement.levels[key]])),darkMatter:state.secondWorld.darkMatter,darkEnergy:state.secondWorld.darkEnergy};

    // W3: neither batch-upgrade action is presented.
    const w3=makeW3(1);SPECIALIZATION_KEYS.forEach(key=>w3.specializations[key]=60);ENHANCEMENT_SLOTS.forEach(key=>w3.enhancement.levels[key]=40);state=w3;view='specialization';render();out.specButtonW3=!!document.getElementById('balancedSpecializationUpgradeButton');view='enhancement';render();out.enhButtonW3=!!document.getElementById('balancedEnhancementUpgradeButton');out.enhW3Preview=enhancementBalancedUpgradePreview(state);

    // Shared transaction must commit exactly once on success.
    const singleSave=makeW1(1);singleSave.gold=3500;state=singleSave;let saveCalls=0;save=()=>{saveCalls++;return true;};
    out.singleSave={result:performBalancedSpecializationUpgrade({skipConfirm:true,silent:true}),saveCalls};
    save=originalSave;

    // save(false) rollback: normalize the fixture before the transaction boundary, then require exact state/reference restoration.
    const rollback=makeW1(1);ENHANCEMENT_SLOTS.forEach(key=>rollback.enhancement.levels[key]=12);rollback.enhancement.basicStones=2000;rollback.enhancement.advancedStones=200;state=rollback;
    enhancementBalancedUpgradePreview(state);
    const rollbackRoot=state,rollbackEnhancement=state.enhancement,rollbackLevels=state.enhancement.levels,rollbackBefore=JSON.stringify(state);
    save=()=>false;
    const rollbackResult=performBalancedEnhancementUpgrade({skipConfirm:true,silent:true});
    out.rollback={result:rollbackResult,semanticExact:JSON.stringify(state)===rollbackBefore,sameRoot:state===rollbackRoot,sameEnhancement:state.enhancement===rollbackEnhancement,sameLevels:state.enhancement.levels===rollbackLevels};
    save=originalSave;

    // save() exception rollback: specialization resources/levels and all captured identities must also survive.
    const throwState=makeW1(1);throwState.gold=3500;state=throwState;
    specializationBalancedUpgradePreview(state);
    const throwRoot=state,throwSpecializations=state.specializations,throwBefore=JSON.stringify(state);
    save=()=>{throw new Error('batch-save-throw');};
    const throwResult=performBalancedSpecializationUpgrade({skipConfirm:true,silent:true});
    out.saveThrow={result:throwResult,semanticExact:JSON.stringify(state)===throwBefore,sameRoot:state===throwRoot,sameSpecializations:state.specializations===throwSpecializations};
    save=originalSave;
   }finally{save=originalSave;state=originalState;view=originalView;render();}
   return out;
  });

  assert.deepEqual(pageErrors,[],'Browser pageerror:\n'+pageErrors.join('\n\n'));
  assert.deepEqual(report.versions,{batch:2,batchTransaction:1,shared:2});
  assert.equal(report.specPreviewFirst.steps,3);assert.equal(report.specPreviewRerun.steps,3);assert.equal(report.specPreviewFirst.goldSpent,3000);assert.deepEqual(report.specPreviewFirst.levelsAfter,report.specPreviewRerun.levelsAfter);
  assert.equal(report.specButtonW1,true);assert.equal(report.specExec.ok,true);assert.equal(report.specExec.transaction.saved,true);assert.equal(report.specAfter.gold,500);assert.deepEqual(Object.values(report.specAfter.levels),[1,1,1,0,0,0,0,0]);
  assert.equal(report.specButtonW2,false);assert.equal(report.specW2Preview.available,false);assert.equal(report.specW2Preview.reason,'phase-locked');

  assert.equal(report.enhW1First.steps,3);assert.equal(report.enhW1Rerun.steps,3);assert.deepEqual(report.enhW1First.levelsAfter,report.enhW1Rerun.levelsAfter);assert.equal(report.enhButtonW1,true);assert.equal(report.enhW1Exec.ok,true);assert.equal(report.enhW1Exec.transaction.saved,true);assert.deepEqual(Object.values(report.enhW1After.levels),[13,13,13,12,12]);assert.deepEqual({basic:report.enhW1After.basic,advanced:report.enhW1After.advanced},{basic:1025,advanced:5});

  assert.equal(report.enhW2First.steps,3);assert.equal(report.enhW2Rerun.steps,3);assert.deepEqual(report.enhW2First.levelsAfter,report.enhW2Rerun.levelsAfter);assert.equal(report.enhButtonW2,true);assert.equal(report.enhW2Exec.ok,true);assert.equal(report.enhW2Exec.transaction.saved,true);assert.deepEqual(Object.values(report.enhW2After.levels),[21,21,21,20,20]);assert.deepEqual({darkMatter:report.enhW2After.darkMatter,darkEnergy:report.enhW2After.darkEnergy},{darkMatter:10000,darkEnergy:50});

  assert.equal(report.specButtonW3,false);assert.equal(report.enhButtonW3,false);assert.equal(report.enhW3Preview.available,false);assert.equal(report.enhW3Preview.reason,'phase-locked');
  assert.equal(report.singleSave.result.ok,true);assert.equal(report.singleSave.result.transaction.saved,true);assert.equal(report.singleSave.saveCalls,1);

  assert.equal(report.rollback.result.ok,false);assert.equal(report.rollback.result.reason,'save');assert.equal(report.rollback.result.rolledBack,true);assert.equal(report.rollback.result.transaction.reason,'save-failed');assert.equal(report.rollback.semanticExact,true);assert.equal(report.rollback.sameRoot,true);assert.equal(report.rollback.sameEnhancement,true);assert.equal(report.rollback.sameLevels,true);

  assert.equal(report.saveThrow.result.ok,false);assert.equal(report.saveThrow.result.reason,'save');assert.equal(report.saveThrow.result.rolledBack,true);assert.equal(report.saveThrow.result.transaction.reason,'save-exception');assert.equal(report.saveThrow.result.transaction.error,'batch-save-throw');assert.equal(report.saveThrow.semanticExact,true);assert.equal(report.saveThrow.sameRoot,true);assert.equal(report.saveThrow.sameSpecializations,true);
  console.log('Player Batch6-2 / optimization Batch3 transaction integrity passed:',JSON.stringify(report));
 }finally{await browser.close();}
})().catch(error=>{console.error(error?.stack||error);process.exit(1);});
