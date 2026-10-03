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
  await page.waitForFunction(()=>window.BREAKTHROUGH_CORE_VERSION===1&&window.BREAKTHROUGH_CORE_INTEGRITY&&window.LEVEL_PROGRESSION_VERSION>=3&&window.BREAKTHROUGH_EXP_MILESTONE_BRIDGE_VERSION===1&&typeof window.breakthroughSnapshot==="function"&&typeof window.grantBreakthroughMilestonesForLevelCrossing==="function"&&typeof window.gainEffectiveExpForState==="function",{timeout:30000});
  const report=await page.evaluate(()=>{
   const milestones=Array.from(window.BREAKTHROUGH_MILESTONE_LEVELS||[]);
   const blankMilestones=()=>Object.fromEntries(milestones.map(v=>[String(v),false]));
   const makeState=(count,permanent=0,level=1,phase=1)=>({
    saveVersion:17,level,exp:0,hp:1,
    secondWorld:{entered:phase>=2},thirdWorld:{entered:phase>=3},
    reincarnation:{count,breakthrough:{permanent,milestoneLifeId:count,milestones:blankMilestones()},alternateUniverse:{unlocked:false,deepestCleared:0,activeAttempt:null,lifeFailures:{lifeId:count,failures:{}}}}
   });
   const expToReach=(from,to,target)=>{
    let total=0;
    for(let level=from;level<to;level++)total+=window.effectiveExpNeed(level,target);
    return total;
   };
   const b0=makeState(0,0),b10=makeState(2,10),b37=makeState(5,37);
   const raw={hp:1033.8,atk:294.35,def:150.225,crit:12,dodge:9};
   const firstRunGrant=window.grantBreakthroughMilestonesForLevelCrossing(73,312,b0);
   const reincarnated=makeState(1,0);
   const multiGrant=window.grantBreakthroughMilestonesForLevelCrossing(73,312,reincarnated);
   const repeatGrant=window.grantBreakthroughMilestonesForLevelCrossing(73,312,reincarnated);

   const firstNatural=makeState(0,0,99,1),firstNaturalLogs=[];
   const firstNaturalUps=window.gainEffectiveExpForState(expToReach(99,100,firstNatural),firstNatural,firstNaturalLogs);
   const singleNatural=makeState(1,0,99,1),singleNaturalLogs=[];
   const singleNaturalUps=window.gainEffectiveExpForState(expToReach(99,100,singleNatural),singleNatural,singleNaturalLogs);
   const multiNatural=makeState(2,7,73,1),multiNaturalLogs=[];
   const multiNaturalUps=window.gainEffectiveExpForState(expToReach(73,312,multiNatural),multiNatural,multiNaturalLogs);
   const afterMulti=JSON.parse(JSON.stringify(multiNatural.reincarnation.breakthrough));
   const noProgressUps=window.gainEffectiveExpForState(0,multiNatural,multiNaturalLogs);
   const afterNoProgress=JSON.parse(JSON.stringify(multiNatural.reincarnation.breakthrough));
   const gmDirect=makeState(3,20,99,1);
   gmDirect.level=500;
   const gmDirectAfter=JSON.parse(JSON.stringify(gmDirect.reincarnation.breakthrough));
   const w2Final=makeState(4,30,999,2),w2Logs=[];
   const w2Ups=window.gainEffectiveExpForState(expToReach(999,1000,w2Final),w2Final,w2Logs);
   const w3NoExtra=makeState(5,40,1000,3),w3Logs=[];
   w3NoExtra.reincarnation.breakthrough.milestones["1000"]=true;
   const w3Ups=window.gainEffectiveExpForState(window.THIRD_WORLD_EXP_PER_LEVEL,w3NoExtra,w3Logs);

   return {
    core:window.BREAKTHROUGH_CORE_INTEGRITY,
    constants:{percent:window.BREAKTHROUGH_EQUIPMENT_PERCENT_PER_LEVEL,finalAdd:window.BREAKTHROUGH_FINAL_DAMAGE_ADD_PER_LEVEL,maxPerLife:window.BREAKTHROUGH_MAX_PER_LIFE,stats:window.BREAKTHROUGH_STAT_IDS,milestones,bridge:window.BREAKTHROUGH_EXP_MILESTONE_BRIDGE_VERSION,levelVersion:window.LEVEL_PROGRESSION_VERSION},
    b0:window.breakthroughSnapshot(b0),
    b10:window.breakthroughSnapshot(b10),
    b37:window.breakthroughSnapshot(b37),
    b10RawBonuses:window.breakthroughRawEquipmentBonuses(raw,b10),
    b37RawBonuses:window.breakthroughRawEquipmentBonuses(raw,b37),
    firstRunGrant,multiGrant,repeatGrant,reincarnatedState:reincarnated.reincarnation.breakthrough,
    natural:{
     first:{ups:firstNaturalUps,level:firstNatural.level,permanent:firstNatural.reincarnation.breakthrough.permanent,currentLife:window.breakthroughCurrentLifeEarned(firstNatural),logs:firstNaturalLogs},
     single:{ups:singleNaturalUps,level:singleNatural.level,permanent:singleNatural.reincarnation.breakthrough.permanent,currentLife:window.breakthroughCurrentLifeEarned(singleNatural),milestones:singleNatural.reincarnation.breakthrough.milestones,logs:singleNaturalLogs},
     multi:{ups:multiNaturalUps,level:multiNatural.level,permanent:multiNatural.reincarnation.breakthrough.permanent,currentLife:window.breakthroughCurrentLifeEarned(multiNatural),milestones:multiNatural.reincarnation.breakthrough.milestones,logs:multiNaturalLogs,afterMulti,afterNoProgress,noProgressUps},
     gmDirect:{level:gmDirect.level,permanent:gmDirectAfter.permanent,milestones:gmDirectAfter.milestones},
     w2Final:{ups:w2Ups,level:w2Final.level,permanent:w2Final.reincarnation.breakthrough.permanent,currentLife:window.breakthroughCurrentLifeEarned(w2Final),milestones:w2Final.reincarnation.breakthrough.milestones,logs:w2Logs},
     w3NoExtra:{ups:w3Ups,level:w3NoExtra.level,permanent:w3NoExtra.reincarnation.breakthrough.permanent,currentLife:window.breakthroughCurrentLifeEarned(w3NoExtra),logs:w3Logs}
    }
   };
  });
  assert.equal(report.core?.passed,true,"Breakthrough core self-integrity failed: "+JSON.stringify(report.core?.errors||null));
  assert.deepEqual(report.constants,{percent:2.5,finalAdd:.05,maxPerLife:10,stats:["hp","atk","def"],milestones:[100,200,300,400,500,600,700,800,900,1000],bridge:1,levelVersion:3},"Breakthrough/level canonical constants drifted.");
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
  assert.equal(report.repeatGrant.awarded,0,"Repeated crossing must not duplicate milestone B.");
  assert.equal(report.reincarnatedState.permanent,3,"Permanent B must increase exactly by newly granted milestones.");

  assert.deepEqual({ups:report.natural.first.ups,level:report.natural.first.level,permanent:report.natural.first.permanent,currentLife:report.natural.first.currentLife},{ups:1,level:100,permanent:0,currentLife:0},"First-run natural Lv99→100 must not award B.");
  assert.deepEqual({ups:report.natural.single.ups,level:report.natural.single.level,permanent:report.natural.single.permanent,currentLife:report.natural.single.currentLife},{ups:1,level:100,permanent:1,currentLife:1},"Reincarnated natural Lv99→100 must award exactly B+1.");
  assert.equal(report.natural.single.milestones["100"],true,"Natural Lv99→100 must mark Lv100 milestone.");
  assert.ok(report.natural.single.logs.some(line=>line.includes("突破成功！")&&line.includes("突破等級提升 1 級")&&line.includes("目前為 Lv.1")&&line.includes("Lv.100")&&!line.includes(" B")),"Natural milestone award must emit player-facing breakthrough-level wording without B notation.");
  assert.deepEqual({level:report.natural.multi.level,permanent:report.natural.multi.permanent,currentLife:report.natural.multi.currentLife},{level:312,permanent:10,currentLife:3},"Natural Lv73→312 must add three milestones to existing B7.");
  assert.equal(report.natural.multi.milestones["100"],true);assert.equal(report.natural.multi.milestones["200"],true);assert.equal(report.natural.multi.milestones["300"],true);
  assert.ok(report.natural.multi.logs.some(line=>line.includes("突破等級提升 3 級")&&line.includes("目前為 Lv.10")&&!line.includes(" B")),"Multi-milestone log must use breakthrough-level wording without B notation.");
  assert.equal(report.natural.multi.noProgressUps,0,"Zero EXP must not create synthetic level gains.");
  assert.deepEqual(report.natural.multi.afterNoProgress,report.natural.multi.afterMulti,"No-level-change call must not mutate breakthrough state.");
  assert.deepEqual({level:report.natural.gmDirect.level,permanent:report.natural.gmDirect.permanent},{level:500,permanent:20},"Direct/GM-style level assignment must not award B.");
  assert.ok(Object.values(report.natural.gmDirect.milestones).every(value=>value===false),"Direct/GM-style level assignment must not mark milestones.");
  assert.deepEqual({ups:report.natural.w2Final.ups,level:report.natural.w2Final.level,permanent:report.natural.w2Final.permanent,currentLife:report.natural.w2Final.currentLife},{ups:1,level:1000,permanent:31,currentLife:1},"Natural W2 Lv999→1000 must award the Lv1000 milestone.");
  assert.equal(report.natural.w2Final.milestones["1000"],true,"W2 Lv1000 milestone must be marked.");
  assert.ok(report.natural.w2Final.logs.some(line=>line.includes("突破等級提升 1 級")&&line.includes("目前為 Lv.31")&&!line.includes(" B")),"W2 final milestone log must use breakthrough-level wording without B notation.");
  assert.deepEqual({ups:report.natural.w3NoExtra.ups,level:report.natural.w3NoExtra.level,permanent:report.natural.w3NoExtra.permanent,currentLife:report.natural.w3NoExtra.currentLife},{ups:1,level:1001,permanent:40,currentLife:1},"W3 Lv1000→1001 must not award any new B.");
  assert.ok(!report.natural.w3NoExtra.logs.some(line=>line.includes("突破等級提升")),"W3 above Lv1000 must not emit breakthrough award logs.");
  assert.deepEqual(pageErrors,[],"Browser pageerror:\n"+pageErrors.join("\n\n"));
  console.log("Breakthrough EXP bridge integrity passed:",JSON.stringify({first:report.natural.first,single:report.natural.single,multi:{level:report.natural.multi.level,permanent:report.natural.multi.permanent,currentLife:report.natural.multi.currentLife},gmDirect:report.natural.gmDirect,w2Final:report.natural.w2Final,w3NoExtra:report.natural.w3NoExtra}));
 }finally{await browser.close();}
})().catch(error=>{console.error(error?.stack||error);process.exit(1);});