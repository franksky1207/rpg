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
  await page.waitForFunction(()=>window.FORMAL_PLAYER_FINAL_DAMAGE_OWNER_VERSION===1&&window.COMBAT_WORLD_ADAPTER_VERSION===1&&typeof window.formalPlayerFinalDamageMultiplier==="function"&&typeof window.worldCombatDamageMultiplier==="function"&&typeof window.runWorldCombatCore==="function"&&typeof window.civilizationCombatDamageMultiplier==="function"&&typeof window.breakthroughFinalDamageAdd==="function",{timeout:30000});
  const report=await page.evaluate(()=>{
   const milestones=()=>Object.fromEntries((window.BREAKTHROUGH_MILESTONE_LEVELS||[]).map(v=>[String(v),false]));
   const makeState=(world,civ,breakthrough)=>({
    saveVersion:17,level:world===3?1500:world===2?700:300,exp:0,hp:100,
    secondWorld:{entered:world>=2,civilizationLevel:civ},thirdWorld:{entered:world>=3},
    reincarnation:{count:breakthrough>0?1:0,breakthrough:{permanent:breakthrough,milestoneLifeId:breakthrough>0?1:0,milestones:milestones()},alternateUniverse:{unlocked:false,deepestCleared:0,activeAttempt:null,lifeFailures:{lifeId:breakthrough>0?1:0,failures:{}}}}
   });
   const w1b0=makeState(1,10,0),w1b10=makeState(1,10,10),w2=makeState(2,4,10),w3=makeState(3,10,10);
   const snapshots={
    w1b0:window.formalPlayerFinalDamageSnapshot({world:1,state:w1b0}),
    w1b10:window.formalPlayerFinalDamageSnapshot({world:1,state:w1b10}),
    w2:window.formalPlayerFinalDamageSnapshot({world:2,state:w2}),
    w3:window.formalPlayerFinalDamageSnapshot({world:3,state:w3}),
    explicit:window.formalPlayerFinalDamageSnapshot({world:2,state:w2,civilizationLevel:2,breakthroughLevel:3})
   };
   const direct={
    w1b0:window.worldCombatDamageMultiplier(1,w1b0),
    w1b10:window.worldCombatDamageMultiplier(1,w1b10),
    w2:window.worldCombatDamageMultiplier(2,w2),
    w3:window.worldCombatDamageMultiplier(3,w3),
    explicit:window.worldCombatDamageMultiplier(2,w2,2,3)
   };
   const combat=window.runWorldCombatCore({hp:1000,atk:100,def:0,crit:0,dodge:0},{name:"probe",hp:1000,atk:0,def:0,crit:0,dodge:0},1000,{world:2,state:w2,civilizationLevel:4,breakthroughLevel:10,rng:()=>.5,maxTurns:1,logs:false});
   const override=window.runWorldCombatCore({hp:1000,atk:100,def:0,crit:0,dodge:0},{name:"probe",hp:1000,atk:0,def:0,crit:0,dodge:0},1000,{world:2,state:w2,playerFinalDamageMultiplier:1.23,rng:()=>.5,maxTurns:1,logs:false});
   return {snapshots,direct,combatMultiplier:combat.playerFinalDamageMultiplier,overrideMultiplier:override.playerFinalDamageMultiplier,versions:{owner:window.FORMAL_PLAYER_FINAL_DAMAGE_OWNER_VERSION,adapter:window.COMBAT_WORLD_ADAPTER_VERSION}};
  });
  assert.deepEqual(report.versions,{owner:1,adapter:1},"Final damage owner/adapter version drifted.");
  assert.equal(report.snapshots.w1b0.multiplier,1,"W1 B0 must remain x1.00.");
  assert.equal(report.snapshots.w1b10.multiplier,1.5,"W1 must apply breakthrough final damage even without civilization.");
  assert.ok(Math.abs(report.snapshots.w2.multiplier-1.7)<1e-12,"W2 Civ4 + breakthrough10 must be additive x1.70, not multiplicative.");
  assert.ok(Math.abs(report.snapshots.w3.multiplier-2)<1e-12,"W3 Civ10 + breakthrough10 must be x2.00.");
  assert.ok(Math.abs(report.snapshots.explicit.multiplier-1.25)<1e-12,"Explicit Civ2 + breakthrough3 must be x1.25.");
  assert.deepEqual(report.direct,{w1b0:1,w1b10:1.5,w2:1.7,w3:2,explicit:1.25},"worldCombatDamageMultiplier must delegate to the formal additive owner.");
  assert.ok(Math.abs(report.combatMultiplier-1.7)<1e-12,"runWorldCombatCore must consume the formal final damage owner.");
  assert.ok(Math.abs(report.overrideMultiplier-1.23)<1e-12,"Explicit playerFinalDamageMultiplier override must remain authoritative.");
  assert.deepEqual(pageErrors,[],"Browser pageerror:\n"+pageErrors.join("\n\n"));
  console.log("Breakthrough final damage integrity passed:",JSON.stringify(report));
 }finally{await browser.close();}
})().catch(error=>{console.error(error?.stack||error);process.exit(1);});
