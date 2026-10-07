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
  await page.waitForFunction(()=>window.GM_TEST_BREAKTHROUGH_VERSION===1&&window.GM_TEST_CHARACTER_SANDBOX_VERSION>=2&&window.GM_PLAYER_ABILITY_TEST_GROUP_VERSION>=4&&window.GM_POWER_BENCHMARK_BREAKTHROUGH_FINAL_DAMAGE_VERSION===1&&typeof window.gmSetTestBreakthroughLevel==="function"&&typeof window.gmTestBreakthroughSnapshot==="function"&&typeof window.gmPowerBenchmarkSnapshot==="function"&&typeof window.gmPowerBenchmarkSummaryText==="function",{timeout:30000});
  const report=await page.evaluate(()=>{
   const originalFormal=JSON.parse(JSON.stringify(state.reincarnation||{}));
   const originalTest=window.gmTestBreakthroughLevelValue();
   const originalSave=window.save;
   let saveCalls=0;
   if(typeof originalSave==="function")window.save=function(){saveCalls++;return originalSave.apply(this,arguments);};
   const milestoneRows=()=>Object.fromEntries((window.BREAKTHROUGH_MILESTONE_LEVELS||[]).map(v=>[String(v),false]));
   const installFormal=(count,permanent)=>{
    state.reincarnation={count,breakthrough:{permanent,milestoneLifeId:count,milestones:milestoneRows()},alternateUniverse:{unlocked:false,deepestCleared:0,activeAttempt:null,lifeFailures:{lifeId:count,failures:{}}}};
   };
   try{
    const abilityHtml=window.gmPlayerAbilityTestHtml();
    window.gmSetTestBreakthroughLevel(0,false);
    const b0=window.gmTestBreakthroughSnapshot();
    const stats0=window.gmTestPlayerStats();
    const formalBeforeManual=JSON.stringify(state.reincarnation);
    window.gmSetTestBreakthroughLevel(25,false);
    const b25=window.gmTestBreakthroughSnapshot();
    const stats25=window.gmTestPlayerStats();
    const character25=window.gmTestCharacterSnapshot();
    const detached25=window.gmTestBreakthroughState();
    const canonical25=window.breakthroughSnapshot(detached25);
    const damage25=window.formalPlayerFinalDamageSnapshot({world:1,breakthroughLevel:window.gmTestBreakthroughLevelValue()});
    const gmDamage25=window.gmTestFinalDamageSnapshot(1,0);
    if(typeof window.gmPowerBenchmarkInvalidateSnapshot==="function")window.gmPowerBenchmarkInvalidateSnapshot();
    const benchmark25=typeof window.gmPowerBenchmarkSnapshot==="function"?window.gmPowerBenchmarkSnapshot():null;
    const benchmarkSummary25=typeof window.gmPowerBenchmarkSummaryText==="function"?window.gmPowerBenchmarkSummaryText():"";
    saveCalls=0;
    const formalAfterManual=JSON.stringify(state.reincarnation);

    installFormal(3,25);
    const beforeSync25=JSON.stringify(state.reincarnation);
    window.gmSetTestBreakthroughLevel(2,false);
    const sync25=window.gmUseCurrentTestStatus();
    const afterSync25=JSON.stringify(state.reincarnation);

    installFormal(0,0);
    const beforeSync0=JSON.stringify(state.reincarnation);
    window.gmSetTestBreakthroughLevel(37,false);
    const sync0=window.gmUseCurrentTestStatus();
    const afterSync0=JSON.stringify(state.reincarnation);

    window.gmSetTestBreakthroughLevel(37,false);
    const b37=window.gmTestBreakthroughSnapshot();
    const damage37=window.formalPlayerFinalDamageSnapshot({world:1,breakthroughLevel:window.gmTestBreakthroughLevelValue()});
    const label37=window.gmTestBreakthroughLabel();
    const control37=window.gmTestBreakthroughControlHtml();
    return {abilityHtml,b0,b25,b37,stats0,stats25,character25,canonical25,damage25,gmDamage25,benchmark25,benchmarkSummary25,damage37,label37,control37,formalBeforeManual,formalAfterManual,beforeSync25,afterSync25,sync25,beforeSync0,afterSync0,sync0,saveCalls,versions:{state:window.GM_TEST_STATE_VERSION,sandbox:window.GM_TEST_CHARACTER_SANDBOX_VERSION,breakthrough:window.GM_TEST_BREAKTHROUGH_VERSION,group:window.GM_PLAYER_ABILITY_TEST_GROUP_VERSION,gmFinal:window.GM_TEST_FINAL_DAMAGE_FORMAL_OWNER_VERSION,benchmarkFinal:window.GM_POWER_BENCHMARK_BREAKTHROUGH_FINAL_DAMAGE_VERSION}};
   }finally{
    state.reincarnation=originalFormal;
    window.gmSetTestBreakthroughLevel(originalTest,false);
    if(typeof originalSave==="function")window.save=originalSave;
   }
  });

  assert.ok(report.abilityHtml.includes("突破測試"),"角色能力測試必須包含突破測試子區塊。");
  assert.ok(report.control37.includes("突破等級")&&report.control37.includes('min="0"'),"突破測試必須使用正式用語與非負整數輸入。");
  assert.ok(!/\bB\d+\b/.test(report.abilityHtml+report.control37+report.label37),"玩家／GM 可見文字不得使用 B1 類 shorthand。");
  assert.equal(report.b0.permanent,0);assert.equal(report.b0.equipmentBonusPercent,0);assert.equal(report.b0.finalDamageAdd,0);
  assert.equal(report.b25.permanent,25);assert.equal(report.b25.equipmentBonusPercent,62.5);assert.ok(Math.abs(report.b25.finalDamageAdd-1.25)<1e-12);
  assert.deepEqual(report.b25,report.canonical25,"GM 測試突破摘要必須直接等於正式 breakthrough owner 的 detached-state 結果。");
  assert.equal(report.character25.breakthroughLevel,25,"測試角色 snapshot 必須帶突破等級。");
  assert.ok(report.stats25.hp>=report.stats0.hp&&report.stats25.atk>=report.stats0.atk&&report.stats25.def>=report.stats0.def,"突破提高時測試角色三圍不得下降。");
  assert.ok(Math.abs(report.damage25.multiplier-2.25)<1e-12,"突破25的銀河紀元測試最終傷害 owner 應為 ×2.25。");
  assert.ok(Math.abs(report.gmDamage25.multiplier-report.damage25.multiplier)<1e-12,"GM 測試最終傷害必須直接等於正式 owner。");
  assert.equal(report.benchmark25.breakthroughLevel,25,"戰力基準 snapshot 必須保存突破等級。");
  assert.ok(Math.abs(report.benchmark25.finalDamageMultiplier-2.25)<1e-12,"銀河戰力基準必須套用突破最終傷害。");
  assert.ok(report.benchmarkSummary25.includes("突破 Lv.25")&&report.benchmarkSummary25.includes("總最終傷害倍率：×2.25"),"戰力基準摘要必須顯示突破等級與總最終傷害倍率。");
  assert.equal(report.versions.gmFinal,1);assert.equal(report.versions.benchmarkFinal,1);
  assert.equal(report.formalBeforeManual,report.formalAfterManual,"手動調整 GM 測試突破不得修改正式轉生資料。");

  assert.equal(report.sync25.breakthroughLevel,25,"同步正式角色必須同步永久突破25。");
  assert.equal(report.sync25.character.breakthroughLevel,25,"同步後測試角色 snapshot 必須是突破25。");
  assert.equal(report.beforeSync25,report.afterSync25,"正式→測試同步不得回寫正式 state。");
  assert.equal(report.sync0.breakthroughLevel,0,"首輪正式角色同步到沙盒時突破必須為0。");
  assert.equal(report.beforeSync0,report.afterSync0,"首輪同步不得修改正式 state。");
  assert.equal(report.saveCalls,0,"GM 測試突破設定／同步不得呼叫正式 save。");

  assert.equal(report.b37.permanent,37,"測試突破不得硬限制在單輪10級。");
  assert.equal(report.b37.equipmentBonusPercent,92.5);
  assert.ok(Math.abs(report.damage37.multiplier-2.85)<1e-12,"突破37最終傷害應由正式 owner 計算為 ×2.85。");
  assert.ok(report.label37.includes("突破等級 Lv.37")&&report.label37.includes("+92.5%")&&report.label37.includes("+185%"),"突破測試摘要應顯示正式 owner 的三圍／最終傷害效果。");
  assert.deepEqual(pageErrors,[],"Browser pageerror:\n"+pageErrors.join("\n\n"));
  console.log("GM character breakthrough Batch7-2 integrity passed:",JSON.stringify({versions:report.versions,b25:report.b25,b37:report.b37,damage25:report.damage25,damage37:report.damage37,sync25:{breakthroughLevel:report.sync25.breakthroughLevel,character:report.sync25.character},sync0:{breakthroughLevel:report.sync0.breakthroughLevel},saveCalls:report.saveCalls}));
 }finally{await browser.close();}
})().catch(error=>{console.error(error?.stack||error);process.exit(1);});
