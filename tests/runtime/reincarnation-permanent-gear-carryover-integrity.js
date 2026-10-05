const {chromium}=require("playwright");
const assert=require("assert");

(async()=>{
 const browser=await chromium.launch({headless:true});
 const page=await browser.newPage();
 const pageErrors=[];page.on("pageerror",error=>pageErrors.push(String(error?.stack||error?.message||error)));
 const url=process.env.RUNTIME_SMOKE_URL||"http://127.0.0.1:4173/index.html";
 try{
  await page.goto(url,{waitUntil:"domcontentloaded",timeout:30000});
  await page.waitForFunction(()=>window.SAVE_SCHEMA_VERSION===17&&window.EQUIPMENT_SAVE_LEVEL_WORLD_OWNER_VERSION===1&&window.SHARED_EQUIPMENT_LEVEL_SEMANTICS_VERSION===1&&window.REINCARNATION_PERMANENT_GEAR_LOAD_REPAIR_RETIRED_VERSION===1&&typeof window.normalizeSaveState==="function"&&typeof window.makeEquipmentRewardItem==="function",{timeout:30000});
  const report=await page.evaluate(()=>{
   const clone=v=>JSON.parse(JSON.stringify(v));
   const canonical=count=>({count,breakthrough:{permanent:0,milestoneLifeId:count,milestones:Object.fromEntries([100,200,300,400,500,600,700,800,900,1000].map(level=>[String(level),false]))},alternateUniverse:{unlocked:false,deepestCleared:0,activeAttempt:null,lifeFailures:{lifeId:count,failures:{}}}});
   const item=(world,level,id,type="weapon")=>window.makeEquipmentRewardItem({id,world,level,q:5,type,name:id,sourceTag:world===3?"third-world-boss":"probe",sell:0,buy:0,rng:()=>.42});
   const identity=row=>({id:row.id,world:row.world,level:row.level,type:row.type,hp:row.hp||0,atk:row.atk||0,def:row.def||0,crit:row.crit||0,dodge:row.dodge||0,mainStat:clone(row.mainStat),affixes:clone(row.affixes)});

   const w1=newState();w1.saveVersion=17;w1.reincarnation=canonical(1);w1.secondWorld=createBlankSecondWorldState();w1.thirdWorld=createBlankThirdWorldState();w1.equipment.weapon=item(3,2000,"w1-retained");w1.inventory=[item(3,2000,"w1-bag","helmet"),item(1,500,"w1-native","armor")];w1.lostGear=[{id:"lost",item:item(3,2000,"w1-lost","shoes"),cost:0,lostAt:1}];
   const w1Before={eq:identity(w1.equipment.weapon),bag:identity(w1.inventory[0]),native:identity(w1.inventory[1]),lost:identity(w1.lostGear[0].item)};window.normalizeSaveState(w1);const w1After={eq:identity(w1.equipment.weapon),bag:identity(w1.inventory[0]),native:identity(w1.inventory[1]),lost:identity(w1.lostGear[0].item)};

   const w2=newState();w2.saveVersion=17;w2.reincarnation=canonical(2);w2.secondWorld=createBlankSecondWorldState();w2.secondWorld.entered=true;w2.thirdWorld=createBlankThirdWorldState();w2.level=600;w2.equipment.weapon=item(3,2000,"w2-retained");w2.inventory=[item(2,1000,"w2-native","helmet")];window.normalizeSaveState(w2);const w2After={level:w2.level,retained:identity(w2.equipment.weapon),native:identity(w2.inventory[0])};

   const first=newState();first.saveVersion=17;first.reincarnation=canonical(0);first.secondWorld=createBlankSecondWorldState();first.thirdWorld=createBlankThirdWorldState();first.equipment.weapon=item(1,900,"first-w1-invalid");window.normalizeSaveState(first);
   const w3=newState();w3.saveVersion=17;w3.reincarnation=canonical(2);w3.secondWorld=createBlankSecondWorldState();w3.secondWorld.entered=true;w3.thirdWorld=createBlankThirdWorldState();w3.thirdWorld.entered=true;w3.level=1350;w3.equipment.weapon=item(3,1350,"w3-current");window.normalizeSaveState(w3);

   return {w1:{before:w1Before,after:w1After},w2:w2After,first:identity(first.equipment.weapon),w3:identity(w3.equipment.weapon),caps:{w1:window.sharedEquipmentLevelCap(1),w2:window.sharedEquipmentLevelCap(2),w3:window.sharedEquipmentLevelCap(3)},legacyRepairType:typeof window.normalizeReincarnationPermanentGearLevels};
  });
  assert.deepEqual(report.w1.after,report.w1.before,"W1 rerun normalization must preserve W3 Lv.2000 equipment/inventory/lostGear.");
  assert.equal(report.w2.level,600);assert.equal(report.w2.retained.world,3);assert.equal(report.w2.retained.level,2000);assert.equal(report.w2.native.world,2);assert.equal(report.w2.native.level,1000);
  assert.equal(report.first.world,1);assert.equal(report.first.level,500,"W1 native gear remains capped by its own world.");
  assert.equal(report.w3.level,1350,"Active W3 sub-2000 gear must remain unchanged.");
  assert.deepEqual(report.caps,{w1:500,w2:1000,w3:2000});
  assert.equal(report.legacyRepairType,"undefined","Duplicate migration load-repair API must be retired.");
  assert.deepEqual(pageErrors,[],"Browser pageerror:\n"+pageErrors.join("\n\n"));
  console.log("World-owned reincarnation gear carryover integrity passed:",JSON.stringify(report));
 }finally{await browser.close();}
})().catch(error=>{console.error(error?.stack||error);process.exit(1);});
