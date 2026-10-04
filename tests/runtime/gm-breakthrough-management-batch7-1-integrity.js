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
  await page.waitForFunction(()=>window.GM_BREAKTHROUGH_MANAGEMENT_VERSION===1&&window.GM_BREAKTHROUGH_MANAGEMENT_INTEGRITY?.passed===true&&typeof window.gmApplyFormalBreakthroughMutation==="function"&&typeof window.gmBreakthroughManagementHtml==="function",{timeout:30000});
  const report=await page.evaluate(()=>{
   const milestoneRows=()=>Object.fromEntries((window.BREAKTHROUGH_MILESTONE_LEVELS||[]).map(v=>[String(v),false]));
   const fixture=count=>({
    saveVersion:17,level:500,exp:0,hp:1,vipLevel:0,vipPoints:0,equipment:{},enhancement:{levels:{}},
    secondWorld:{entered:false},thirdWorld:{entered:false},
    reincarnation:{
     count,
     breakthrough:{permanent:0,milestoneLifeId:count,milestones:milestoneRows()},
     alternateUniverse:{unlocked:true,deepestCleared:37,activeAttempt:{lifeId:count,depth:38,attemptId:"probe",traits:["strong","swift"]},lifeFailures:{lifeId:count,failures:{"38":4}}}
    }
   });
   const first=fixture(0),reincarnated=fixture(1);
   const firstBefore=JSON.stringify(first);
   const firstResult=window.gmApplyFormalBreakthroughMutation(5,first);
   const firstAfter=JSON.stringify(first);
   const firstHtml=(()=>{const old=state;try{state=first;return window.gmBreakthroughManagementHtml();}finally{state=old;}})();
   const reincarnatedHtml=(()=>{const old=state;try{state=reincarnated;return window.gmBreakthroughManagementHtml();}finally{state=old;}})();

   const beforeMax=window.playerCombatStatsForState(reincarnated).hp;
   reincarnated.hp=beforeMax;
   const to25=window.gmApplyFormalBreakthroughMutation(25,reincarnated);
   const after25Stats=window.playerCombatStatsForState(reincarnated);
   const after25Character=window.characterWorldSnapshot(reincarnated);
   const after25Damage=window.formalPlayerFinalDamageSnapshot({world:1,state:reincarnated});
   const milestones25={...reincarnated.reincarnation.breakthrough.milestones};
   const au25=JSON.parse(JSON.stringify(reincarnated.reincarnation.alternateUniverse));
   const to20=window.gmApplyFormalBreakthroughMutation(20,reincarnated);
   const after20={count:reincarnated.reincarnation.count,current:window.breakthroughCurrentLifeEarned(reincarnated),permanent:window.breakthroughLevel(reincarnated),milestones:{...reincarnated.reincarnation.breakthrough.milestones}};
   const to0=window.gmApplyFormalBreakthroughMutation(0,reincarnated);
   const after0={count:reincarnated.reincarnation.count,current:window.breakthroughCurrentLifeEarned(reincarnated),permanent:window.breakthroughLevel(reincarnated),snapshot:window.breakthroughSnapshot(reincarnated)};
   return {self:window.GM_BREAKTHROUGH_MANAGEMENT_INTEGRITY,plans:[0,1,10,11,20,25,30,31].map(n=>window.gmBreakthroughManagementPlan(n)),first:{result:firstResult,unchanged:firstBefore===firstAfter,html:firstHtml},reincarnatedHtml,to25,after25Stats,after25Character,after25Damage,milestones25,au25,to20,after20,to0,after0,pageVersion:window.GM_BREAKTHROUGH_MANAGEMENT_VERSION};
  });

  assert.equal(report.self.passed,true,"GM breakthrough self-integrity failed: "+JSON.stringify(report.self.errors||null));
  assert.deepEqual(report.plans.map(x=>[x.total,x.count,x.currentLife]),[[0,1,0],[1,1,1],[10,1,10],[11,2,1],[20,2,10],[25,3,5],[30,3,10],[31,4,1]],"Breakthrough total -> reincarnation/current-life mapping drifted.");
  assert.equal(report.first.result.reason,"first-run-locked","First run must reject GM breakthrough mutation.");
  assert.equal(report.first.unchanged,true,"First-run rejection must not mutate state.");
  assert.equal(report.first.html,"","First run must not render GM breakthrough management controls.");
  assert.ok(report.reincarnatedHtml.includes("突破管理")&&report.reincarnatedHtml.includes('value="0"'),"Reincarnated zero-breakthrough state must expose management with value 0.");

  assert.equal(report.to25.ok,true,"B25 canonical rebuild failed.");
  assert.deepEqual({count:report.to25.count,current:report.to25.currentLife,total:report.to25.total},{count:3,current:5,total:25},"B25 must mean third reincarnation with five current-life breakthroughs.");
  for(const lv of [100,200,300,400,500])assert.equal(report.milestones25[String(lv)],true,`B25 current-life milestone ${lv} must be true.`);
  for(const lv of [600,700,800,900,1000])assert.equal(report.milestones25[String(lv)],false,`B25 current-life milestone ${lv} must be false.`);
  assert.equal(report.au25.deepestCleared,37,"Permanent AU deepest progress must be preserved when GM changes reincarnation count.");
  assert.equal(report.au25.activeAttempt,null,"Life-specific AU active attempt must clear when GM changes reincarnation count.");
  assert.deepEqual(report.au25.lifeFailures,{lifeId:3,failures:{}},"Life-specific AU failures must reset to the canonical new life.");
  assert.equal(report.to25.hpAfter,report.to25.maxHpAfter,"A full-HP character must remain full after breakthrough stat rebuild.");
  assert.equal(report.after25Character.breakthroughLevel,25,"Character UI snapshot must immediately read B25.");
  assert.equal(report.after25Character.breakthroughEquipmentBonusPercent,62.5,"Character UI equipment bonus must immediately read B25.");
  assert.equal(report.after25Character.breakthroughFinalDamageBonusPercent,125,"Character UI final-damage bonus must immediately read B25.");
  assert.ok(Math.abs(report.after25Damage.multiplier-2.25)<1e-12,"Formal W1 final damage must immediately become x2.25 at B25.");

  assert.equal(report.to20.ok,true);
  assert.deepEqual({count:report.after20.count,current:report.after20.current,permanent:report.after20.permanent},{count:2,current:10,permanent:20},"B20 canonical rebuild drifted.");
  assert.ok(Object.values(report.after20.milestones).every(Boolean),"B20 second life must have all ten milestones marked.");
  assert.equal(report.to0.ok,true);
  assert.deepEqual({count:report.after0.count,current:report.after0.current,permanent:report.after0.permanent},{count:1,current:0,permanent:0},"B0 management on a reincarnated save must remain first reincarnation, not revert to first run.");
  assert.equal(report.after0.snapshot.equipmentBonusPercent,0);
  assert.equal(report.after0.snapshot.finalDamageAdd,0);
  assert.deepEqual(pageErrors,[],"Browser pageerror:\n"+pageErrors.join("\n\n"));
  console.log("GM breakthrough Batch7-1 integrity passed:",JSON.stringify({plans:report.plans,to25:report.to25,after20:report.after20,after0:report.after0}));
 }finally{await browser.close();}
})().catch(error=>{console.error(error?.stack||error);process.exit(1);});
