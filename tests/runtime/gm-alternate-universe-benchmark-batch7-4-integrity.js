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
  await page.waitForFunction(()=>window.GM_ALTERNATE_UNIVERSE_BENCHMARK_VERSION===1&&window.GM_ALTERNATE_UNIVERSE_BENCHMARK_INTEGRITY?.passed===true&&typeof window.gmRunAlternateUniverseTraitDiagnostics==="function",{timeout:30000});
  const report=await page.evaluate(async()=>{
   const formalBefore=JSON.stringify(state);
   const pairs=window.gmAlternateUniverseTraitPairs();
   const firstEnemy=window.gmAlternateUniverseBenchmarkEnemy(25,[pairs[0][1],pairs[0][0]]);
   const bench=await window.gmRunAlternateUniverseBenchmark({depth:25,runs:100,traits:pairs[0]});
   const diagnostics=await window.gmRunAlternateUniverseTraitDiagnostics({depth:25});
   const formalAfter=JSON.stringify(state);
   const ids=typeof window.gmHubRegisteredSectionIds==="function"?window.gmHubRegisteredSectionIds("test"):[];
   const html=window.gmAlternateUniverseBenchmarkHtml();
   return {
    versions:{benchmark:window.GM_ALTERNATE_UNIVERSE_BENCHMARK_VERSION,diagnostics:window.GM_ALTERNATE_UNIVERSE_TRAIT_PAIR_DIAGNOSTICS_VERSION,combatOwner:window.GM_ALTERNATE_UNIVERSE_BENCHMARK_COMBAT_OWNER_VERSION,hub:window.GM_HUB_EXTENSION_VERSION},
    self:window.GM_ALTERNATE_UNIVERSE_BENCHMARK_INTEGRITY,pairs,firstEnemy,bench,diagnostics,formalStable:formalBefore===formalAfter,ids,html
   };
  });

  assert.equal(report.self.passed,true,"Batch7-4 self-integrity failed: "+JSON.stringify(report.self.errors||null));
  assert.deepEqual(report.versions,{benchmark:1,diagnostics:1,combatOwner:1,hub:17});
  assert.equal(report.pairs.length,21,"7 canonical traits must yield exactly 21 unordered pairs.");
  assert.equal(new Set(report.pairs.map(pair=>pair.join("+"))).size,21,"Trait pairs must be unique.");
  assert.ok(report.pairs.every(pair=>pair.length===2&&pair[0]!==pair[1]),"Every diagnostic pair must contain two distinct traits.");
  assert.deepEqual(report.firstEnemy.traits,report.pairs[0],"Benchmark enemy must canonicalize trait ordering.");
  assert.equal(report.bench.runs,100);
  assert.equal(report.bench.depth,25);
  assert.equal(report.bench.completed,100,"Benchmark combat must resolve every run.");
  assert.equal(report.bench.actionSafety,0,"Benchmark must not hit combat action safety.");
  assert.equal(report.bench.invalid,0,"Benchmark must not produce NaN / invalid HP data.");
  assert.equal(report.bench.formalStateStable,true,"Benchmark must not mutate formal save state.");
  assert.equal(report.diagnostics.pairCount,21);
  assert.equal(report.diagnostics.failedCount,0,"All 21 trait-pair diagnostics must pass: "+JSON.stringify(report.diagnostics.failedPairs));
  assert.equal(report.diagnostics.passed,true);
  assert.equal(report.diagnostics.formalStateStable,true,"Trait diagnostics must not mutate formal save state.");
  assert.equal(report.formalStable,true,"Batch7-4 test sandbox must leave formal state byte-equivalent.");
  assert.ok(report.ids.includes("alternate-universe-benchmark-test"),"AU benchmark must register through GM Hub test registry.");
  const powerIndex=report.ids.indexOf("power-benchmark-test"),auIndex=report.ids.indexOf("alternate-universe-benchmark-test");
  assert.ok(powerIndex>=0&&auIndex===powerIndex+1,"AU benchmark should appear immediately after the shared power benchmark section.");
  assert.ok(report.html.includes("測試沙盒")&&report.html.includes("不寫入正式存檔"));
  assert.ok(report.html.includes("21 組雙特性"));
  assert.ok(report.html.includes("層域"));
  assert.ok(!report.html.includes("1000U")&&!/\bU\d+\b/.test(report.html),"AU benchmark UI must not expose internal U shorthand.");
  assert.deepEqual(pageErrors,[],"Browser pageerror:\n"+pageErrors.join("\n\n"));
  console.log("GM alternate universe Batch7-4 benchmark integrity passed:",JSON.stringify({versions:report.versions,pairCount:report.pairs.length,benchmark:{depth:report.bench.depth,runs:report.bench.runs,winRate:report.bench.winRate,avgTurns:report.bench.avgTurns,completed:report.bench.completed,formalStateStable:report.bench.formalStateStable},diagnostics:{pairCount:report.diagnostics.pairCount,failedCount:report.diagnostics.failedCount,formalStateStable:report.diagnostics.formalStateStable}}));
 }finally{await browser.close();}
})().catch(error=>{console.error(error?.stack||error);process.exit(1);});
