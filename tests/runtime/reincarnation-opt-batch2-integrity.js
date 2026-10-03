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
  await page.waitForFunction(()=>window.MIRROR_COMBAT_CORE_VERSION===7&&window.MIRROR_FORMAL_FINAL_DAMAGE_OWNER_VERSION===1&&window.STATE_AWARE_COMBAT_STATS_OWNER_VERSION===1&&window.REINCARNATION_HP_OWNER_VERSION===1&&typeof window.playerCombatStatsForState==="function",{timeout:30000});
  const report=await page.evaluate(()=>{
   const clone=v=>JSON.parse(JSON.stringify(v));
   const original=clone(state);
   const blankMilestones=()=>Object.fromEntries((window.BREAKTHROUGH_MILESTONE_LEVELS||[100,200,300,400,500,600,700,800,900,1000]).map(v=>[String(v),false]));
   const zeroMarks=()=>Object.fromEntries(Array.from(window.MARK_KEYS||[]).map(key=>[key,0]));
   const zeroSpecs=()=>({initiative:0,combo:0,penetration:0,counter:0,drain:0});
   try{
    const detached=newState();
    detached.level=1;detached.vipLevel=0;
    detached.reincarnation={count:2,breakthrough:{permanent:10,milestoneLifeId:2,milestones:blankMilestones()},alternateUniverse:{unlocked:false,deepestCleared:0,activeAttempt:null,lifeFailures:{lifeId:2,failures:{}}}};
    detached.enhancement={basicStones:0,advancedStones:0,levels:{weapon:0,helmet:0,armor:0,shoes:0,accessory:0}};
    detached.equipment={
     weapon:{type:"weapon",hp:100,atk:80,def:40,crit:0,dodge:0,mainStat:{stat:"atk",value:80}},
     helmet:{type:"helmet",hp:0,atk:0,def:0,crit:0,dodge:0,mainStat:{stat:"hp",value:0}},
     armor:{type:"armor",hp:0,atk:0,def:0,crit:0,dodge:0,mainStat:{stat:"def",value:0}},
     shoes:{type:"shoes",hp:0,atk:0,def:0,crit:0,dodge:0,mainStat:{stat:"hp",value:0}},
     accessory:{type:"accessory",hp:0,atk:0,def:0,crit:0,dodge:0,mainStat:{stat:"crit",value:0}}
    };
    const detachedStats=window.playerCombatStatsForState(detached);
    const resetProbe=clone(detached);
    const resetResult=window.applyReincarnationResetState(resetProbe,{currentTime:7000,requireEligible:false});
    const resetOwnerHp=window.playerCombatStatsForState(resetProbe).hp;

    const probe=newState();
    probe.saveVersion=17;probe.level=600;probe.vipLevel=0;
    probe.reincarnation={count:2,breakthrough:{permanent:10,milestoneLifeId:2,milestones:blankMilestones()},alternateUniverse:{unlocked:false,deepestCleared:0,activeAttempt:null,lifeFailures:{lifeId:2,failures:{}}}};
    probe.secondWorld=window.createBlankSecondWorldState();probe.secondWorld.entered=true;probe.secondWorld.civilizationLevel=10;
    probe.thirdWorld=window.createBlankThirdWorldState();
    state=probe;
    const snapB10=window.createMirrorCombatSnapshot();
    const synthetic={...snapB10,stats:{hp:1000,atk:100,def:0,crit:0,dodge:0},specializations:zeroSpecs(),specializationBonuses:zeroSpecs(),marks:zeroMarks()};
    const run=window.runMirrorCombatCore(synthetic,{logs:false,rng:()=>.5});
    const firstAttack=run.events.find(row=>row.type==="attack");

    state.reincarnation.breakthrough.permanent=0;
    const snapB0=window.createMirrorCombatSnapshot();
    const audit=window.auditCurrentMirrorCombatSnapshotSources();
    return {detachedStats,reset:{ok:resetResult?.ok===true,hp:resetProbe.hp,ownerHp:resetOwnerHp,count:resetProbe.reincarnation?.count,permanent:resetProbe.reincarnation?.breakthrough?.permanent},snapB10:{civilizationLevel:snapB10.civilizationLevel,breakthroughLevel:snapB10.breakthroughLevel,civilizationDamageMultiplier:snapB10.civilizationDamageMultiplier,finalDamageMultiplier:snapB10.finalDamageMultiplier},snapB0:{breakthroughLevel:snapB0.breakthroughLevel,finalDamageMultiplier:snapB0.finalDamageMultiplier},firstAttack,audit,versions:{mirror:window.MIRROR_COMBAT_CORE_VERSION,mirrorOwner:window.MIRROR_FORMAL_FINAL_DAMAGE_OWNER_VERSION,stateAware:window.STATE_AWARE_COMBAT_STATS_OWNER_VERSION,reincarnationHp:window.REINCARNATION_HP_OWNER_VERSION,resetMutation:window.REINCARNATION_RESET_MUTATION_VERSION}};
   }finally{state=original;}
  });

  assert.deepEqual(report.versions,{mirror:7,mirrorOwner:1,stateAware:1,reincarnationHp:1,resetMutation:1});
  assert.equal(report.detachedStats.hp,235,"Detached state HP must include raw gear + B bonus without depending on global state.");
  assert.equal(report.detachedStats.atk,115,"Detached state ATK must include base + raw gear + B bonus.");
  assert.equal(report.detachedStats.def,57,"Detached state DEF must include base + raw gear + B bonus.");
  assert.equal(report.reset.ok,true);assert.equal(report.reset.count,3);assert.equal(report.reset.permanent,10);
  assert.equal(report.reset.hp,report.reset.ownerHp,"Reincarnation reset HP must be exactly the shared state-aware formal max HP.");
  assert.equal(report.snapB10.civilizationLevel,10);assert.equal(report.snapB10.breakthroughLevel,10);
  assert.ok(Math.abs(report.snapB10.civilizationDamageMultiplier-1.5)<1e-9);
  assert.ok(Math.abs(report.snapB10.finalDamageMultiplier-2)<1e-9,"Mirror must use shared formal final damage owner: 1 + civ 0.5 + breakthrough 0.5.");
  assert.equal(report.firstAttack.damage,200,"Mirror actual strike must apply formal 2.0 final damage multiplier.");
  assert.ok(Math.abs(report.firstAttack.finalDamageMultiplier-2)<1e-9);
  assert.equal(report.snapB0.breakthroughLevel,0);assert.ok(Math.abs(report.snapB0.finalDamageMultiplier-1.5)<1e-9,"B0 mirror behavior must remain civilization-only.");
  assert.equal(report.audit.passed,true,JSON.stringify(report.audit.issues||[]));
  assert.deepEqual(errors,[],"Browser pageerror:\n"+errors.join("\n\n"));
  console.log("Reincarnation optimization batch 2 integrity passed:",JSON.stringify(report));
 }finally{await browser.close();}
})().catch(error=>{console.error(error?.stack||error);process.exit(1);});
