const {chromium}=require("playwright");
const assert=require("assert");

(async()=>{
 const browser=await chromium.launch({headless:true});
 const page=await browser.newPage();
 const pageErrors=[];page.on("pageerror",error=>pageErrors.push(String(error?.stack||error?.message||error)));
 const url=process.env.RUNTIME_SMOKE_URL||"http://127.0.0.1:4173/index.html";
 try{
  await page.goto(url,{waitUntil:"domcontentloaded",timeout:30000});
  await page.waitForFunction(()=>window.REINCARNATION_PERMANENT_GEAR_SAVE_GUARD_VERSION===3&&window.REINCARNATION_PERMANENT_GEAR_SAVE_GUARD_POLICY==="evidence-gated-fallback-only"&&window.REINCARNATION_PERMANENT_GEAR_MARKER_VERSION===1&&typeof window.applyReincarnationResetState==="function"&&typeof window.runSettlementTransaction==="function"&&typeof window.normalizeSaveState==="function"&&typeof window.makeEquipmentRewardItem==="function",{timeout:30000});
  const report=await page.evaluate(()=>{
   const clone=v=>JSON.parse(JSON.stringify(v));
   const saveKey=typeof SAVE_KEY==="string"?SAVE_KEY:"frank_text_rpg_save";
   const slots=["weapon","helmet","armor","shoes","accessory"];
   const make=(type,index)=>window.makeEquipmentRewardItem({id:`reward-3-2000-5-${type}-${index}-rootfix`,world:3,level:2000,q:5,type,name:`root-${type}`,sourceTag:"third-world-boss",sourceBossId:`higher-dimensional-boss-0${Math.min(9,index+1)}`,sourceBossIndex:index,sourceOrdinal:0,sell:0,buy:0,rng:()=>.42});
   const snapshot=target=>Object.fromEntries(slots.map(type=>[type,{id:target.equipment[type].id,world:target.equipment[type].world,level:target.equipment[type].level,hp:target.equipment[type].hp||0,atk:target.equipment[type].atk||0,def:target.equipment[type].def||0,crit:target.equipment[type].crit||0,dodge:target.equipment[type].dodge||0,marker:clone(target.equipment[type].reincarnationPermanentGear||null)}]));
   const canonical=count=>({count,breakthrough:{permanent:0,milestoneLifeId:count,milestones:Object.fromEntries([100,200,300,400,500,600,700,800,900,1000].map(level=>[String(level),false]))},alternateUniverse:{unlocked:false,deepestCleared:0,activeAttempt:null,lifeFailures:{lifeId:count,failures:{}}}});

   const first=newState();first.saveVersion=17;first.level=2000;first.secondWorld=createBlankSecondWorldState();first.secondWorld.entered=true;first.thirdWorld=createBlankThirdWorldState();first.thirdWorld.entered=true;first.thirdWorld.coreLevel=10;first.thirdWorld.bosses=Array.from({length:10},()=>({currentHp:0}));if(typeof normalizeReincarnationState==="function")normalizeReincarnationState(first);first.reincarnation.count=0;slots.forEach((type,index)=>{first.equipment[type]=make(type,index);});
   const before=snapshot(first);state=first;if(typeof window.markSaveLoadResolved==="function")window.markSaveLoadResolved("root-fix-regression");
   const tx=window.runSettlementTransaction({label:"root-fix-regression",mutate:target=>window.applyReincarnationResetState(target,{requireEligible:true,currentTime:Date.now()})});
   const afterTx=snapshot(state),guardAfterTx=clone(window.LAST_REINCARNATION_PERMANENT_GEAR_SAVE_GUARD_REPORT||null),persistedTx=snapshot(JSON.parse(localStorage.getItem(saveKey)));

   window.normalizeSaveState(state);const afterW1Normalize=snapshot(state);save(false);const guardAfterW1=clone(window.LAST_REINCARNATION_PERMANENT_GEAR_SAVE_GUARD_REPORT||null);
   state.secondWorld.entered=true;state.level=600;window.normalizeSaveState(state);const afterW2Normalize=snapshot(state);save(false);const guardAfterW2=clone(window.LAST_REINCARNATION_PERMANENT_GEAR_SAVE_GUARD_REPORT||null);

   // Marked retained gear: evidence-backed fallback recovery.
   state.secondWorld.entered=false;state.thirdWorld.entered=false;state.level=1;slots.forEach(type=>{state.equipment[type].level=500;});
   const corruptBefore=snapshot(state);save(false);const corruptAfter=snapshot(state),guardFallback=clone(window.LAST_REINCARNATION_PERMANENT_GEAR_SAVE_GUARD_REPORT||null),corruptPersisted=snapshot(JSON.parse(localStorage.getItem(saveKey)));

   // Legacy shared-factory ID is strong historical evidence even before retention markers existed.
   const legacy=newState();legacy.saveVersion=17;legacy.reincarnation=canonical(1);legacy.secondWorld=createBlankSecondWorldState();legacy.thirdWorld=createBlankThirdWorldState();legacy.equipment.weapon=window.makeEquipmentRewardItem({id:"reward-3-2000-5-weapon-0-legacy",world:3,level:500,q:5,type:"weapon",name:"legacy",sell:0,buy:0,rng:()=>.42});legacy.equipment.weapon.level=500;delete legacy.equipment.weapon.reincarnationPermanentGear;state=legacy;save(false);const legacyGuard=clone(window.LAST_REINCARNATION_PERMANENT_GEAR_SAVE_GUARD_REPORT||null),legacySaved=JSON.parse(localStorage.getItem(saveKey));

   // Ambiguous W3 sub-2000 data has no proof that it was ever a retained Lv.2000 item, so it must not be promoted.
   const ambiguous=newState();ambiguous.saveVersion=17;ambiguous.reincarnation=canonical(1);ambiguous.secondWorld=createBlankSecondWorldState();ambiguous.thirdWorld=createBlankThirdWorldState();ambiguous.equipment.weapon=window.makeEquipmentRewardItem({id:"w3-ambiguous-500",world:3,level:500,q:5,type:"weapon",name:"ambiguous",sell:0,buy:0,rng:()=>.42});delete ambiguous.equipment.weapon.reincarnationPermanentGear;state=ambiguous;save(false);const ambiguousGuard=clone(window.LAST_REINCARNATION_PERMANENT_GEAR_SAVE_GUARD_REPORT||null),ambiguousSaved=JSON.parse(localStorage.getItem(saveKey));

   const firstLife=newState();firstLife.saveVersion=17;firstLife.secondWorld=createBlankSecondWorldState();firstLife.thirdWorld=createBlankThirdWorldState();if(typeof normalizeReincarnationState==="function")normalizeReincarnationState(firstLife);firstLife.reincarnation.count=0;firstLife.equipment.weapon=make("weapon",0);firstLife.equipment.weapon.level=500;state=firstLife;save(false);const firstLifeSaved=JSON.parse(localStorage.getItem(saveKey));
   const activeW3=newState();activeW3.saveVersion=17;activeW3.secondWorld=createBlankSecondWorldState();activeW3.secondWorld.entered=true;activeW3.thirdWorld=createBlankThirdWorldState();activeW3.thirdWorld.entered=true;if(typeof normalizeReincarnationState==="function")normalizeReincarnationState(activeW3);activeW3.reincarnation.count=2;activeW3.equipment.weapon=window.makeEquipmentRewardItem({id:"w3-normal-1350",world:3,level:1350,q:5,type:"weapon",name:"w3-normal",sell:0,buy:0,rng:()=>.42});state=activeW3;save(false);const activeSaved=JSON.parse(localStorage.getItem(saveKey));
   return {before,tx:{ok:tx?.ok===true,after:afterTx,persisted:persistedTx,guard:guardAfterTx},w1:{after:afterW1Normalize,guard:guardAfterW1},w2:{after:afterW2Normalize,guard:guardAfterW2},fallback:{before:corruptBefore,after:corruptAfter,persisted:corruptPersisted,guard:guardFallback},legacy:{memory:legacy.equipment.weapon.level,persisted:legacySaved.equipment.weapon.level,guard:legacyGuard},ambiguous:{memory:ambiguous.equipment.weapon.level,persisted:ambiguousSaved.equipment.weapon.level,guard:ambiguousGuard},firstLife:{memory:firstLife.equipment.weapon.level,persisted:firstLifeSaved.equipment.weapon.level},activeW3:{memory:activeW3.equipment.weapon.level,persisted:activeSaved.equipment.weapon.level},snapshot:window.reincarnationPermanentGearSaveGuardSnapshot?.()};
  });

  assert.equal(report.tx.ok,true);
  for(const type of Object.keys(report.before)){
   const expected={...report.before[type],marker:{version:1,retainedWorld:3,retainedLevel:2000,lifeId:1}};
   assert.deepEqual(report.tx.after[type],expected,`${type}: reset transaction must preserve W3 Lv.2000 identity and stamp retention evidence.`);
   assert.deepEqual(report.tx.persisted[type],expected,`${type}: formal persisted state must stay Lv.2000 with retention evidence.`);
   assert.deepEqual(report.w1.after[type],expected,`${type}: current-schema W1 normalization must not clamp higher-world gear.`);
   assert.deepEqual(report.w2.after[type],expected,`${type}: current-schema W2 normalization must not clamp higher-world gear.`);
   assert.equal(report.fallback.before[type].level,500);assert.equal(report.fallback.after[type].level,2000);assert.equal(report.fallback.persisted[type].level,2000);
  }
  assert.equal(report.tx.guard?.repaired,0,"Healthy formal reincarnation flow must not depend on the fallback guard.");
  assert.equal(report.w1.guard?.repaired,0,"Root-fixed W1 normalization must leave the fallback idle.");
  assert.equal(report.w2.guard?.repaired,0,"Root-fixed W2 normalization must leave the fallback idle.");
  assert.equal(report.fallback.guard?.policy,"evidence-gated-fallback-only");assert.equal(report.fallback.guard?.repaired,5,"Marked historical corruption must be recovered at save boundary.");assert.equal(report.fallback.guard?.evidence?.retentionMarker,5);
  assert.equal(report.legacy.memory,2000);assert.equal(report.legacy.persisted,2000);assert.equal(report.legacy.guard?.repaired,1);assert.equal(report.legacy.guard?.evidence?.legacyRewardId,1,"Legacy reward ID should be recoverable without guessing.");
  assert.equal(report.ambiguous.memory,500);assert.equal(report.ambiguous.persisted,500);assert.equal(report.ambiguous.guard?.repaired,0);assert.equal(report.ambiguous.guard?.ambiguous,1,"Ambiguous W3 sub-2000 data must remain unchanged.");
  assert.equal(report.firstLife.memory,500);assert.equal(report.firstLife.persisted,500,"First-life state must not be promoted by fallback guard.");
  assert.equal(report.activeW3.memory,1350);assert.equal(report.activeW3.persisted,1350,"Active W3 normal sub-2000 gear must remain untouched.");
  assert.ok(report.snapshot?.totalAmbiguous>=1);
  assert.deepEqual(pageErrors,[],"Browser pageerror:\n"+pageErrors.join("\n\n"));
  console.log("Evidence-gated formal reincarnation gear flow regression passed:",JSON.stringify(report));
 }finally{await browser.close();}
})().catch(error=>{console.error(error?.stack||error);process.exit(1);});
