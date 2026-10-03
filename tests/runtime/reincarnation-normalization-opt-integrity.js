const {chromium}=require("playwright");
const assert=require("assert");

(async()=>{
 const browser=await chromium.launch({headless:true});
 const page=await browser.newPage();
 const errors=[];
 page.on("pageerror",e=>errors.push(String(e?.stack||e?.message||e)));
 const url=process.env.RUNTIME_SMOKE_URL||"http://127.0.0.1:4173/index.html";
 try{
  await page.goto(url,{waitUntil:"domcontentloaded",timeout:30000});
  await page.waitForFunction(()=>window.REINCARNATION_STATE_VERSION===6&&window.REINCARNATION_FIRST_RUN_BREAKTHROUGH_ISOLATION_VERSION===1&&window.REINCARNATION_BREAKTHROUGH_RECONCILIATION_VERSION===1&&window.ALTERNATE_UNIVERSE_UNLOCK_SALVAGE_VERSION===1&&typeof window.migrateSave==="function",{timeout:30000});
  const report=await page.evaluate(()=>{
   const clone=v=>JSON.parse(JSON.stringify(v));
   const run=source=>window.migrateSave(clone(source),17,null,clone(source));

   const first=run({saveVersion:17,level:2000,exp:0,secondWorld:{entered:true},thirdWorld:{entered:true},reincarnation:{count:0,breakthrough:{permanent:9,milestoneLifeId:0,milestones:{100:true,200:true}},alternateUniverse:{unlocked:true,deepestCleared:0,activeAttempt:null,lifeFailures:{lifeId:0,failures:{}}}}});
   const firstReport=clone(window.LAST_REINCARNATION_NORMALIZATION_REPORT||{});

   const missingOwner=run({saveVersion:17,level:250,exp:0,reincarnation:{count:2,breakthrough:{permanent:1,milestones:{100:true,200:true}},alternateUniverse:{unlocked:false,deepestCleared:0}}});
   const missingReport=clone(window.LAST_REINCARNATION_NORMALIZATION_REPORT||{});

   const staleOwner=run({saveVersion:17,level:250,exp:0,reincarnation:{count:3,breakthrough:{permanent:20,milestoneLifeId:2,milestones:{100:true,200:true}},alternateUniverse:{unlocked:false,deepestCleared:0}}});
   const staleReport=clone(window.LAST_REINCARNATION_NORMALIZATION_REPORT||{});

   const auSalvage=run({saveVersion:17,level:1,exp:0,reincarnation:{count:1,breakthrough:{permanent:0,milestoneLifeId:1,milestones:{}},alternateUniverse:{unlocked:false,deepestCleared:12,activeAttempt:{lifeId:1,depth:13,attemptId:"keep",traits:["strong","swift"]},lifeFailures:{lifeId:1,failures:{"13":3}}}}});
   const auReport=clone(window.LAST_REINCARNATION_NORMALIZATION_REPORT||{});

   const noEvidence=run({saveVersion:17,level:900,exp:0,reincarnation:{count:4,breakthrough:{permanent:30},alternateUniverse:{unlocked:false,deepestCleared:0}}});
   const noEvidenceReport=clone(window.LAST_REINCARNATION_NORMALIZATION_REPORT||{});

   return {first,firstReport,missingOwner,missingReport,staleOwner,staleReport,auSalvage,auReport,noEvidence,noEvidenceReport,integrity:window.REINCARNATION_LIFECYCLE_INTEGRITY};
  });

  assert.equal(report.first.reincarnation.count,0);
  assert.equal(report.first.reincarnation.breakthrough.permanent,0);
  assert.equal(report.first.reincarnation.breakthrough.milestoneLifeId,0);
  assert.ok(Object.values(report.first.reincarnation.breakthrough.milestones).every(v=>v===false));
  assert.equal(report.first.reincarnation.alternateUniverse.unlocked,true,"首輪合法 AU 解鎖不得被突破隔離一起清掉");
  assert.equal(report.firstReport.firstRunBreakthroughCleared,true);

  assert.equal(report.missingOwner.reincarnation.breakthrough.milestoneLifeId,2);
  assert.equal(report.missingOwner.reincarnation.breakthrough.milestones["100"],true);
  assert.equal(report.missingOwner.reincarnation.breakthrough.milestones["200"],true);
  assert.equal(report.missingOwner.reincarnation.breakthrough.permanent,2,"permanent 只能補到本輪已證明 milestone 的最低可信值");
  assert.equal(report.missingReport.missingMilestoneLifeOwnerSalvaged,true);
  assert.equal(report.missingReport.breakthroughPermanentRaised,true);

  assert.equal(report.staleOwner.reincarnation.breakthrough.permanent,20);
  assert.ok(Object.values(report.staleOwner.reincarnation.breakthrough.milestones).every(v=>v===false));
  assert.equal(report.staleReport.milestonesResetForLifeMismatch,true);

  assert.equal(report.auSalvage.reincarnation.alternateUniverse.unlocked,true);
  assert.equal(report.auSalvage.reincarnation.alternateUniverse.deepestCleared,12);
  assert.equal(report.auSalvage.reincarnation.alternateUniverse.activeAttempt?.depth,13);
  assert.equal(report.auSalvage.reincarnation.alternateUniverse.lifeFailures?.failures?.["13"],3);
  assert.equal(report.auReport.alternateUniverseUnlockSalvaged,true);

  assert.equal(report.noEvidence.reincarnation.breakthrough.permanent,30);
  assert.ok(Object.values(report.noEvidence.reincarnation.breakthrough.milestones).every(v=>v===false),"缺 owner 且無 milestone 證據時不得依角色等級猜測");
  assert.equal(report.noEvidenceReport.missingMilestoneLifeOwnerSalvaged,true);

  assert.equal(report.integrity?.passed,true,JSON.stringify(report.integrity?.errors||[]));
  assert.deepEqual(errors,[],"Browser pageerror:\n"+errors.join("\n\n"));
  console.log("Reincarnation normalization optimization integrity passed:",JSON.stringify({first:report.first.reincarnation,missingOwner:report.missingOwner.reincarnation,staleOwner:report.staleOwner.reincarnation,auSalvage:report.auSalvage.reincarnation,noEvidence:report.noEvidence.reincarnation}));
 }finally{await browser.close();}
})().catch(error=>{console.error(error?.stack||error);process.exit(1);});