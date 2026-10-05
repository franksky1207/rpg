const {chromium}=require("playwright");
const assert=require("assert");

(async()=>{
 const browser=await chromium.launch({headless:true});
 const page=await browser.newPage();
 const pageErrors=[];page.on("pageerror",error=>pageErrors.push(String(error?.stack||error?.message||error)));
 const url=process.env.RUNTIME_SMOKE_URL||"http://127.0.0.1:4173/index.html";
 try{
  await page.goto(url,{waitUntil:"domcontentloaded",timeout:30000});
  await page.waitForFunction(()=>window.REINCARNATION_PERMANENT_GEAR_SAVE_GUARD_VERSION===2&&window.REINCARNATION_PERMANENT_GEAR_SAVE_GUARD_POLICY==="fallback-only"&&typeof window.applyReincarnationResetState==="function"&&typeof window.runSettlementTransaction==="function"&&typeof window.normalizeSaveState==="function"&&typeof window.makeEquipmentRewardItem==="function",{timeout:30000});
  const report=await page.evaluate(()=>{
   const clone=v=>JSON.parse(JSON.stringify(v));
   const saveKey=typeof SAVE_KEY==="string"?SAVE_KEY:"frank_text_rpg_save";
   const slots=["weapon","helmet","armor","shoes","accessory"];
   const make=(type,index)=>window.makeEquipmentRewardItem({id:`reward-3-2000-5-${type}-${index}-rootfix`,world:3,level:2000,q:5,type,name:`root-${type}`,sourceTag:"third-world-boss",sourceBossId:`higher-dimensional-boss-0${Math.min(9,index+1)}`,sourceBossIndex:index,sourceOrdinal:0,sell:0,buy:0,rng:()=>.42});
   const snapshot=target=>Object.fromEntries(slots.map(type=>[type,{id:target.equipment[type].id,world:target.equipment[type].world,level:target.equipment[type].level,hp:target.equipment[type].hp||0,atk:target.equipment[type].atk||0,def:target.equipment[type].def||0,crit:target.equipment[type].crit||0,dodge:target.equipment[type].dodge||0}]));

   const first=newState();first.saveVersion=17;first.level=2000;first.secondWorld=createBlankSecondWorldState();first.secondWorld.entered=true;first.thirdWorld=createBlankThirdWorldState();first.thirdWorld.entered=true;first.thirdWorld.coreLevel=10;first.thirdWorld.bosses=Array.from({length:10},()=>({currentHp:0}));if(typeof normalizeReincarnationState==="function")normalizeReincarnationState(first);first.reincarnation.count=0;slots.forEach((type,index)=>{first.equipment[type]=make(type,index);});
   const before=snapshot(first);state=first;if(typeof window.markSaveLoadResolved==="function")window.markSaveLoadResolved("root-fix-regression");
   const tx=window.runSettlementTransaction({label:"root-fix-regression",mutate:target=>window.applyReincarnationResetState(target,{requireEligible:true,currentTime:Date.now()})});
   const afterTx=snapshot(state),guardAfterTx=clone(window.LAST_REINCARNATION_PERMANENT_GEAR_SAVE_GUARD_REPORT||null),persistedTx=snapshot(JSON.parse(localStorage.getItem(saveKey)));

   // The current-schema UI normalizer is the historical root writer. It must now be harmless in W1/W2.
   window.normalizeSaveState(state);const afterW1Normalize=snapshot(state);save(false);const guardAfterW1=clone(window.LAST_REINCARNATION_PERMANENT_GEAR_SAVE_GUARD_REPORT||null);
   state.secondWorld.entered=true;state.level=600;window.normalizeSaveState(state);const afterW2Normalize=snapshot(state);save(false);const guardAfterW2=clone(window.LAST_REINCARNATION_PERMANENT_GEAR_SAVE_GUARD_REPORT||null);

   // Explicitly corrupted historical Schema17 data is still recovered by the save-boundary fallback.
   state.secondWorld.entered=false;state.thirdWorld.entered=false;state.level=1;slots.forEach(type=>{state.equipment[type].level=500;});
   const corruptBefore=snapshot(state);save(false);const corruptAfter=snapshot(state),guardFallback=clone(window.LAST_REINCARNATION_PERMANENT_GEAR_SAVE_GUARD_REPORT||null),corruptPersisted=snapshot(JSON.parse(localStorage.getItem(saveKey)));

   const firstLife=newState();firstLife.saveVersion=17;firstLife.secondWorld=createBlankSecondWorldState();firstLife.thirdWorld=createBlankThirdWorldState();if(typeof normalizeReincarnationState==="function")normalizeReincarnationState(firstLife);firstLife.reincarnation.count=0;firstLife.equipment.weapon=make("weapon",0);firstLife.equipment.weapon.level=500;state=firstLife;save(false);const firstLifeSaved=JSON.parse(localStorage.getItem(saveKey));
   const activeW3=newState();activeW3.saveVersion=17;activeW3.secondWorld=createBlankSecondWorldState();activeW3.secondWorld.entered=true;activeW3.thirdWorld=createBlankThirdWorldState();activeW3.thirdWorld.entered=true;if(typeof normalizeReincarnationState==="function")normalizeReincarnationState(activeW3);activeW3.reincarnation.count=2;activeW3.equipment.weapon=window.makeEquipmentRewardItem({id:"w3-normal-1350",world:3,level:1350,q:5,type:"weapon",name:"w3-normal",sell:0,buy:0,rng:()=>.42});state=activeW3;save(false);const activeSaved=JSON.parse(localStorage.getItem(saveKey));
   return {before,tx:{ok:tx?.ok===true,after:afterTx,persisted:persistedTx,guard:guardAfterTx},w1:{after:afterW1Normalize,guard:guardAfterW1},w2:{after:afterW2Normalize,guard:guardAfterW2},fallback:{before:corruptBefore,after:corruptAfter,persisted:corruptPersisted,guard:guardFallback,snapshot:window.reincarnationPermanentGearSaveGuardSnapshot?.()},firstLife:{memory:firstLife.equipment.weapon.level,persisted:firstLifeSaved.equipment.weapon.level},activeW3:{memory:activeW3.equipment.weapon.level,persisted:activeSaved.equipment.weapon.level}};
  });

  assert.equal(report.tx.ok,true);
  for(const type of Object.keys(report.before)){
   assert.deepEqual(report.tx.after[type],report.before[type],`${type}: reset transaction must preserve W3 Lv.2000 identity.`);
   assert.deepEqual(report.tx.persisted[type],report.before[type],`${type}: formal persisted state must stay Lv.2000.`);
   assert.deepEqual(report.w1.after[type],report.before[type],`${type}: current-schema W1 normalization must not clamp higher-world gear.`);
   assert.deepEqual(report.w2.after[type],report.before[type],`${type}: current-schema W2 normalization must not clamp higher-world gear.`);
   assert.equal(report.fallback.before[type].level,500);assert.equal(report.fallback.after[type].level,2000);assert.equal(report.fallback.persisted[type].level,2000);
  }
  assert.equal(report.tx.guard?.repaired,0,"Healthy formal reincarnation flow must not depend on the fallback guard.");
  assert.equal(report.w1.guard?.repaired,0,"Root-fixed W1 normalization must leave the fallback idle.");
  assert.equal(report.w2.guard?.repaired,0,"Root-fixed W2 normalization must leave the fallback idle.");
  assert.equal(report.fallback.guard?.policy,"fallback-only");assert.equal(report.fallback.guard?.repaired,5,"Historical corruption must still be recovered at save boundary.");assert.ok(report.fallback.snapshot?.repairRuns>=1);
  assert.equal(report.firstLife.memory,500);assert.equal(report.firstLife.persisted,500,"First-life state must not be promoted by fallback guard.");
  assert.equal(report.activeW3.memory,1350);assert.equal(report.activeW3.persisted,1350,"Active W3 normal sub-2000 gear must remain untouched.");
  assert.deepEqual(pageErrors,[],"Browser pageerror:\n"+pageErrors.join("\n\n"));
  console.log("Root-fixed formal reincarnation gear flow regression passed:",JSON.stringify(report));
 }finally{await browser.close();}
})().catch(error=>{console.error(error?.stack||error);process.exit(1);});
