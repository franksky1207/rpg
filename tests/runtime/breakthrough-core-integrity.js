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
  await page.waitForFunction(()=>window.BREAKTHROUGH_CORE_VERSION===1&&window.BREAKTHROUGH_CORE_INTEGRITY&&typeof window.breakthroughSnapshot==="function"&&typeof window.grantBreakthroughMilestonesForLevelCrossing==="function",{timeout:30000});
  const report=await page.evaluate(()=>{
   const milestones=Array.from(window.BREAKTHROUGH_MILESTONE_LEVELS||[]);
   const makeState=(count,permanent=0)=>({saveVersion:17,reincarnation:{count,breakthrough:{permanent,milestoneLifeId:count,milestones:Object.fromEntries(milestones.map(v=>[String(v),false]))},alternateUniverse:{unlocked:false,deepestCleared:0,activeAttempt:null,lifeFailures:{lifeId:count,failures:{}}}}});
   const b0=makeState(0,0),b10=makeState(2,10),b37=makeState(5,37);
   const raw={hp:1033.8,atk:294.35,def:150.225,crit:12,dodge:9};
   const firstRunGrant=window.grantBreakthroughMilestonesForLevelCrossing(73,312,b0);
   const reincarnated=makeState(1,0);
   const multiGrant=window.grantBreakthroughMilestonesForLevelCrossing(73,312,reincarnated);
   const repeatGrant=window.grantBreakthroughMilestonesForLevelCrossing(73,312,reincarnated);
   return {
    core:window.BREAKTHROUGH_CORE_INTEGRITY,
    constants:{percent:window.BREAKTHROUGH_EQUIPMENT_PERCENT_PER_LEVEL,finalAdd:window.BREAKTHROUGH_FINAL_DAMAGE_ADD_PER_LEVEL,maxPerLife:window.BREAKTHROUGH_MAX_PER_LIFE,stats:window.BREAKTHROUGH_STAT_IDS,milestones},
    b0:window.breakthroughSnapshot(b0),
    b10:window.breakthroughSnapshot(b10),
    b37:window.breakthroughSnapshot(b37),
    b10RawBonuses:window.breakthroughRawEquipmentBonuses(raw,b10),
    b37RawBonuses:window.breakthroughRawEquipmentBonuses(raw,b37),
    firstRunGrant,multiGrant,repeatGrant,
    reincarnatedState:reincarnated.reincarnation.breakthrough
   };
  });
  assert.equal(report.core?.passed,true,"Breakthrough core self-integrity failed: "+JSON.stringify(report.core?.errors||null));
  assert.deepEqual(report.constants,{percent:2.5,finalAdd:.05,maxPerLife:10,stats:["hp","atk","def"],milestones:[100,200,300,400,500,600,700,800,900,1000]},"Breakthrough canonical constants drifted.");
  assert.equal(report.b0.equipmentBonusPercent,0,"B0 must not change raw equipment stats.");
  assert.equal(report.b0.finalDamageAdd,0,"B0 final-damage add must be zero.");
  assert.equal(report.b10.equipmentBonusPercent,25,"B10 raw-equipment bonus must be +25%.");
  assert.equal(report.b10.finalDamageAdd,.5,"B10 final-damage add must be +0.50.");
  assert.equal(report.b37.equipmentBonusPercent,92.5,"B37 raw-equipment bonus must be +92.5%.");
  assert.ok(Math.abs(report.b37.finalDamageAdd-1.85)<1e-12,"B37 final-damage add must be +1.85.");
  assert.deepEqual(Object.keys(report.b10RawBonuses).sort(),["atk","def","hp"],"Breakthrough raw-equipment bonus must exclude crit/dodge.");
  assert.ok(Math.abs(report.b10RawBonuses.hp-258.45)<1e-9,"B10 HP raw bonus formula drifted.");
  assert.ok(Math.abs(report.b10RawBonuses.atk-73.5875)<1e-9,"B10 ATK raw bonus formula drifted.");
  assert.ok(Math.abs(report.b10RawBonuses.def-37.55625)<1e-9,"B10 DEF raw bonus formula drifted.");
  assert.equal(report.firstRunGrant.awarded,0,"First run must never receive milestone B.");
  assert.equal(report.multiGrant.awarded,3,"Lv73→312 must grant exactly three milestones on a reincarnated life.");
  assert.deepEqual(report.multiGrant.milestones,[100,200,300],"Multi-level milestone list drifted.");
  assert.equal(report.repeatGrant.awarded,0,"Reload/repeated crossing must not duplicate milestone B.");
  assert.equal(report.reincarnatedState.permanent,3,"Permanent B must increase exactly by newly granted milestones.");
  assert.equal(report.reincarnatedState.milestones["100"],true);
  assert.equal(report.reincarnatedState.milestones["200"],true);
  assert.equal(report.reincarnatedState.milestones["300"],true);
  assert.deepEqual(pageErrors,[],"Browser pageerror:\n"+pageErrors.join("\n\n"));
  console.log("Breakthrough core integrity passed:",JSON.stringify({b0:report.b0,b10:report.b10,b37:report.b37,multiGrant:report.multiGrant}));
 }finally{await browser.close();}
})().catch(error=>{console.error(error?.stack||error);process.exit(1);});