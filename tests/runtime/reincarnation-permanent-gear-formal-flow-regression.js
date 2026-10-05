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
  await page.waitForFunction(()=>window.REINCARNATION_PERMANENT_GEAR_SAVE_GUARD_VERSION===1&&typeof window.enforceReincarnationPermanentGearLevels==="function"&&typeof window.applyReincarnationResetState==="function"&&typeof window.runSettlementTransaction==="function"&&typeof window.load==="function"&&typeof window.makeEquipmentRewardItem==="function",{timeout:30000});
  const report=await page.evaluate(()=>{
   const clone=v=>JSON.parse(JSON.stringify(v));
   const saveKey=typeof SAVE_KEY==="string"?SAVE_KEY:"frank_text_rpg_save";
   const slots=["weapon","helmet","armor","shoes","accessory"];
   const make=(type,index)=>window.makeEquipmentRewardItem({id:`reward-3-2000-5-${type}-${index}-formalflow`,world:3,level:2000,q:5,type,name:`formal-${type}`,sourceTag:"third-world-boss",sourceBossId:`higher-dimensional-boss-0${Math.min(9,index+1)}`,sourceBossIndex:index,sourceOrdinal:0,sell:0,buy:0,rng:()=>.42});
   const identity=item=>({id:item.id,world:item.world,level:item.level,type:item.type,hp:item.hp||0,atk:item.atk||0,def:item.def||0,crit:item.crit||0,dodge:item.dodge||0,mainStat:clone(item.mainStat),affixes:clone(item.affixes),sourceTag:item.sourceTag||"",sourceBossId:item.sourceBossId||""});
   const all2000=target=>slots.every(type=>target?.equipment?.[type]?.world===3&&target.equipment[type].level===2000);
   const snapshotGear=target=>Object.fromEntries(slots.map(type=>[type,identity(target.equipment[type])]));

   const first=newState();
   first.saveVersion=17;first.level=2000;first.secondWorld=createBlankSecondWorldState();first.secondWorld.entered=true;first.thirdWorld=createBlankThirdWorldState();first.thirdWorld.entered=true;first.thirdWorld.coreLevel=10;first.thirdWorld.bosses=Array.from({length:10},()=>({currentHp:0}));
   if(typeof normalizeReincarnationState==="function")normalizeReincarnationState(first);first.reincarnation.count=0;
   slots.forEach((type,index)=>{first.equipment[type]=make(type,index);});
   const before=snapshotGear(first);
   state=first;if(typeof window.markSaveLoadResolved==="function")window.markSaveLoadResolved("formal-gear-regression");

   const tx=window.runSettlementTransaction({label:"formal-gear-regression",mutate:target=>{
    const reset=window.applyReincarnationResetState(target,{requireEligible:true,currentTime:Date.now()});
    if(reset?.ok!==true)return reset;
    // Reproduce the observed historical corruption before the formal save boundary.
    slots.forEach(type=>{target.equipment[type].level=500;});
    return {ok:true,reset};
   }});
   const afterTxMemory=snapshotGear(state);
   const afterTxSaved=JSON.parse(localStorage.getItem(saveKey)||"null");
   const afterTxPersisted=afterTxSaved?snapshotGear(afterTxSaved):null;
   const guardAfterTx=clone(window.LAST_REINCARNATION_PERMANENT_GEAR_SAVE_GUARD_REPORT||null);

   const loaded=window.load();
   const afterReload=snapshotGear(state);
   const afterReloadSaved=JSON.parse(localStorage.getItem(saveKey)||"null");

   // W2 rerun must still preserve the higher-world permanent gear while native W2 cap stays 1000.
   state.secondWorld.entered=true;state.level=600;slots.forEach(type=>{state.equipment[type].level=1000;});
   save(false);
   const w2Saved=JSON.parse(localStorage.getItem(saveKey)||"null");
   const w2={level:state.level,gear:snapshotGear(state),persisted:snapshotGear(w2Saved),guard:clone(window.LAST_REINCARNATION_PERMANENT_GEAR_SAVE_GUARD_REPORT||null)};

   // First-life saves must never get the rerun repair.
   const firstLife=newState();firstLife.saveVersion=17;firstLife.secondWorld=createBlankSecondWorldState();firstLife.thirdWorld=createBlankThirdWorldState();if(typeof normalizeReincarnationState==="function")normalizeReincarnationState(firstLife);firstLife.reincarnation.count=0;firstLife.equipment.weapon=make("weapon",0);firstLife.equipment.weapon.level=500;state=firstLife;save(false);const firstLifeSaved=JSON.parse(localStorage.getItem(saveKey)||"null");

   // Active W3 normal sub-2000 equipment must also remain untouched.
   const activeW3=newState();activeW3.saveVersion=17;activeW3.secondWorld=createBlankSecondWorldState();activeW3.secondWorld.entered=true;activeW3.thirdWorld=createBlankThirdWorldState();activeW3.thirdWorld.entered=true;if(typeof normalizeReincarnationState==="function")normalizeReincarnationState(activeW3);activeW3.reincarnation.count=2;activeW3.equipment.weapon=window.makeEquipmentRewardItem({id:"w3-normal-1350",world:3,level:1350,q:5,type:"weapon",name:"w3-normal",sourceTag:"third-world-boss",sell:0,buy:0,rng:()=>.42});state=activeW3;save(false);const activeW3Saved=JSON.parse(localStorage.getItem(saveKey)||"null");

   return {before,tx:{ok:tx?.ok===true,afterMemory:afterTxMemory,afterPersisted:afterTxPersisted,guard:guardAfterTx},reload:{loaded,gear:afterReload,persisted:afterReloadSaved?snapshotGear(afterReloadSaved):null},w2,firstLife:{memory:identity(firstLife.equipment.weapon),persisted:identity(firstLifeSaved.equipment.weapon)},activeW3:{memory:identity(activeW3.equipment.weapon),persisted:identity(activeW3Saved.equipment.weapon)},all2000:{txMemory:all2000(afterTxSaved),reload:all2000(state)}};
  });

  assert.equal(report.tx.ok,true,"Formal reincarnation settlement must succeed.");
  Object.keys(report.before).forEach(type=>{
   assert.equal(report.tx.afterMemory[type].level,2000,`${type} must be restored before the formal save returns.`);
   assert.equal(report.tx.afterPersisted[type].level,2000,`${type} must persist as Lv.2000.`);
   assert.equal(report.tx.afterPersisted[type].world,3,`${type} must remain W3 gear.`);
   const expected={...report.before[type],level:2000};assert.deepEqual(report.tx.afterPersisted[type],expected,`${type} identity/stats must remain unchanged.`);
   assert.equal(report.reload.gear[type].level,2000,`${type} must remain Lv.2000 after reload.`);
   assert.equal(report.reload.persisted[type].level,2000,`${type} persisted reload must remain Lv.2000.`);
   assert.equal(report.w2.gear[type].level,2000,`${type} must remain Lv.2000 in W2 rerun.`);
   assert.equal(report.w2.persisted[type].level,2000,`${type} W2 save must persist Lv.2000.`);
  });
  assert.equal(report.tx.guard?.applied,true);assert.equal(report.tx.guard?.repaired,5,"Save guard must repair all five observed corrupted equipped items.");
  assert.equal(report.reload.loaded,true);
  assert.equal(report.w2.level,600,"Player W2 level must remain independent of permanent gear level.");
  assert.equal(report.w2.guard?.applied,true);assert.equal(report.w2.guard?.repaired,5);
  assert.equal(report.firstLife.memory.level,500,"First-life gear must not be promoted by the rerun guard.");assert.equal(report.firstLife.persisted.level,500);
  assert.equal(report.activeW3.memory.level,1350,"Active W3 normal equipment must not be promoted.");assert.equal(report.activeW3.persisted.level,1350);
  assert.deepEqual(pageErrors,[],"Browser pageerror:\n"+pageErrors.join("\n\n"));
  console.log("Formal reincarnation permanent gear save-boundary regression passed:",JSON.stringify(report));
 }finally{await browser.close();}
})().catch(error=>{console.error(error?.stack||error);process.exit(1);});
