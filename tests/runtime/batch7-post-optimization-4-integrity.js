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
  await page.waitForFunction(()=>window.GM_ALTERNATE_UNIVERSE_BENCHMARK_VERSION===2&&window.GM_ALTERNATE_UNIVERSE_BENCHMARK_OPTIMIZATION_VERSION===1&&window.GM_ALTERNATE_UNIVERSE_BENCHMARK_INTEGRITY?.passed===true,{timeout:30000});
  const report=await page.evaluate(async()=>{
   const originalCharacter=window.gmTestCharacterSnapshot;
   const originalStats=window.gmTestPlayerStats;
   const originalCiv=window.gmTestCivilizationLevelValue;
   let characterCalls=0,statsCalls=0,civCalls=0;
   window.gmTestCharacterSnapshot=function(){characterCalls++;return originalCharacter.apply(this,arguments);};
   window.gmTestPlayerStats=function(){statsCalls++;return originalStats.apply(this,arguments);};
   window.gmTestCivilizationLevelValue=function(){civCalls++;return originalCiv.apply(this,arguments);};
   try{
    const formalBefore=JSON.stringify(state);
    const guardBefore=window.gmAlternateUniverseBenchmarkFormalStateFingerprint(state);
    const prepared=window.gmAlternateUniverseBenchmarkPrepareContext(25);
    characterCalls=0;statsCalls=0;civCalls=0;
    const bench=await window.gmRunAlternateUniverseBenchmark({depth:25,runs:100,traits:window.gmAlternateUniverseTraitPairs()[0]});
    const benchCalls={characterCalls,statsCalls,civCalls};
    characterCalls=0;statsCalls=0;civCalls=0;
    const diagnostics=await window.gmRunAlternateUniverseTraitDiagnostics({depth:25});
    const diagnosticCalls={characterCalls,statsCalls,civCalls};
    const formalAfter=JSON.stringify(state);
    const guardAfter=window.gmAlternateUniverseBenchmarkFormalStateFingerprint(state);
    const clone=JSON.parse(formalAfter);clone.level=(Number(clone.level)||1)+1;
    const changedGuard=window.gmAlternateUniverseBenchmarkFormalStateFingerprint(clone);
    return {
     versions:{benchmark:window.GM_ALTERNATE_UNIVERSE_BENCHMARK_VERSION,optimization:window.GM_ALTERNATE_UNIVERSE_BENCHMARK_OPTIMIZATION_VERSION,guard:window.GM_ALTERNATE_UNIVERSE_BENCHMARK_FORMAL_STATE_GUARD_VERSION,prepared:window.GM_ALTERNATE_UNIVERSE_BENCHMARK_PREPARED_CONTEXT_VERSION},
     self:window.GM_ALTERNATE_UNIVERSE_BENCHMARK_INTEGRITY,prepared,bench,diagnostics,benchCalls,diagnosticCalls,
     formalExact:formalBefore===formalAfter,guardStable:guardBefore.fingerprint===guardAfter.fingerprint,guardDetectsMutation:guardBefore.fingerprint!==changedGuard.fingerprint,
     guardBefore,guardAfter,changedGuard
    };
   }finally{
    window.gmTestCharacterSnapshot=originalCharacter;
    window.gmTestPlayerStats=originalStats;
    window.gmTestCivilizationLevelValue=originalCiv;
   }
  });
  assert.deepEqual(report.versions,{benchmark:2,optimization:1,guard:1,prepared:1});
  assert.equal(report.self.passed,true,"Optimization self-integrity failed: "+JSON.stringify(report.self.errors||null));
  assert.equal(report.prepared.ok,true);assert.equal(report.prepared.version,1);assert.equal(report.prepared.depth,25);assert.equal(report.prepared.pairs.length,21);
  assert.equal(report.bench.completed,100);assert.equal(report.bench.invalid,0);assert.equal(report.bench.actionSafety,0);assert.equal(report.bench.formalStateStable,true);
  assert.equal(report.bench.optimizationVersion,1);assert.equal(report.bench.preparedContextVersion,1);assert.equal(report.bench.formalStateGuardVersion,1);
  assert.deepEqual(report.benchCalls,{characterCalls:1,statsCalls:1,civCalls:1},"100-run benchmark must prepare the fixed player context once per batch.");
  assert.equal(report.diagnostics.pairCount,21);assert.equal(report.diagnostics.failedCount,0);assert.equal(report.diagnostics.formalStateStable,true);
  assert.deepEqual(report.diagnosticCalls,{characterCalls:1,statsCalls:1,civCalls:1},"21 trait-pair diagnostics must share one prepared player context.");
  assert.equal(report.formalExact,true,"CI full deep compare must remain byte-equivalent across benchmark + diagnostics.");
  assert.equal(report.guardStable,true,"Lightweight runtime fingerprint must remain stable when formal state is untouched.");
  assert.equal(report.guardDetectsMutation,true,"Lightweight runtime fingerprint must detect a representative formal-state mutation.");
  assert.deepEqual(pageErrors,[],"Browser pageerror:\n"+pageErrors.join("\n\n"));
  console.log("Batch7 post optimization 4 AU benchmark integrity passed:",JSON.stringify({versions:report.versions,benchCalls:report.benchCalls,diagnosticCalls:report.diagnosticCalls,formalExact:report.formalExact,guardStable:report.guardStable,guardDetectsMutation:report.guardDetectsMutation,bench:{runs:report.bench.runs,completed:report.bench.completed,winRate:report.bench.winRate},diagnostics:{pairCount:report.diagnostics.pairCount,failedCount:report.diagnostics.failedCount}}));
 }finally{await browser.close();}
})().catch(error=>{console.error(error?.stack||error);process.exit(1);});
