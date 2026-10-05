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
  await page.waitForFunction(()=>window.SAVE_SCHEMA_VERSION===17&&window.REINCARNATION_PERMANENT_GEAR_LOAD_REPAIR_VERSION===1&&typeof window.normalizeReincarnationPermanentGearLevels==="function"&&typeof window.migrateSave==="function"&&typeof window.load==="function"&&typeof window.makeEquipmentRewardItem==="function",{timeout:30000});
  const report=await page.evaluate(()=>{
   const clone=v=>JSON.parse(JSON.stringify(v));
   const saveKey=typeof SAVE_KEY==="string"?SAVE_KEY:"frank_text_rpg_save";
   const canonicalReincarnation=count=>({count,breakthrough:{permanent:0,milestoneLifeId:count,milestones:Object.fromEntries([100,200,300,400,500,600,700,800,900,1000].map(level=>[String(level),false]))},alternateUniverse:{unlocked:false,deepestCleared:0,activeAttempt:null,lifeFailures:{lifeId:count,failures:{}}}});
   const item=(world,level,id,type="weapon")=>window.makeEquipmentRewardItem({id,world,level,q:5,type,name:id,sourceTag:world===3?"third-world-boss":"probe",sell:0,buy:0,rng:()=>.42});
   const identity=row=>({id:row.id,world:row.world,level:row.level,type:row.type,hp:row.hp||0,atk:row.atk||0,def:row.def||0,crit:row.crit||0,dodge:row.dodge||0,mainStat:clone(row.mainStat),affixes:clone(row.affixes),locked:row.locked===true});
   const score=row=>equipmentScore(row);

   const first=newState();first.saveVersion=17;first.reincarnation=canonicalReincarnation(0);first.secondWorld=createBlankSecondWorldState();first.thirdWorld=createBlankThirdWorldState();first.equipment.weapon=item(3,500,"first-life-illegal");
   const firstBefore=identity(first.equipment.weapon),firstResult=window.normalizeReincarnationPermanentGearLevels(first),firstAfter=identity(first.equipment.weapon);

   const w1=newState();w1.saveVersion=17;w1.reincarnation=canonicalReincarnation(1);w1.secondWorld=createBlankSecondWorldState();w1.thirdWorld=createBlankThirdWorldState();
   w1.equipment.weapon=item(3,500,"w1-equipped");w1.inventory=[item(3,500,"w1-inventory","helmet"),item(1,500,"w1-native","armor")];w1.lostGear=[{id:"lost-w3",item:item(3,500,"w1-lost","shoes"),cost:0,lostAt:1}];
   const w1Expected={equipped:{...identity(w1.equipment.weapon),level:2000},inventory:{...identity(w1.inventory[0]),level:2000},lost:{...identity(w1.lostGear[0].item),level:2000},native:identity(w1.inventory[1])};
   const w1ExpectedScore=score({...w1.equipment.weapon,level:2000});
   localStorage.setItem(saveKey,JSON.stringify(w1));const w1Loaded=window.load();const w1Saved=JSON.parse(localStorage.getItem(saveKey)||"null");
   const w1Actual={equipped:identity(w1Saved.equipment.weapon),inventory:identity(w1Saved.inventory[0]),lost:identity(w1Saved.lostGear[0].item),native:identity(w1Saved.inventory[1]),score:score(w1Saved.equipment.weapon),repair:clone(window.LAST_SAVE_LOAD_REPORT?.reincarnationPermanentGearLoadRepair||null)};

   const w2=newState();w2.saveVersion=17;w2.reincarnation=canonicalReincarnation(2);w2.secondWorld=createBlankSecondWorldState();w2.secondWorld.entered=true;w2.thirdWorld=createBlankThirdWorldState();w2.level=600;
   w2.equipment.weapon=item(3,1000,"w2-retained");w2.inventory=[item(2,1000,"w2-native","helmet")];
   const w2ExpectedRetained={...identity(w2.equipment.weapon),level:2000},w2Native=identity(w2.inventory[0]);
   localStorage.setItem(saveKey,JSON.stringify(w2));const w2Loaded=window.load();const w2Saved=JSON.parse(localStorage.getItem(saveKey)||"null");
   const w2Actual={retained:identity(w2Saved.equipment.weapon),native:identity(w2Saved.inventory[0]),repair:clone(window.LAST_SAVE_LOAD_REPORT?.reincarnationPermanentGearLoadRepair||null)};

   const w3=newState();w3.saveVersion=17;w3.reincarnation=canonicalReincarnation(3);w3.secondWorld=createBlankSecondWorldState();w3.secondWorld.entered=true;w3.thirdWorld=createBlankThirdWorldState();w3.thirdWorld.entered=true;w3.level=1350;w3.equipment.weapon=item(3,1350,"w3-current");
   const w3Before=identity(w3.equipment.weapon),w3Result=window.normalizeReincarnationPermanentGearLevels(w3),w3After=identity(w3.equipment.weapon);

   return {first:{before:firstBefore,after:firstAfter,result:firstResult},w1:{loaded:w1Loaded,expected:w1Expected,expectedScore:w1ExpectedScore,actual:w1Actual},w2:{loaded:w2Loaded,expectedRetained:w2ExpectedRetained,native:w2Native,actual:w2Actual},w3:{before:w3Before,after:w3After,result:w3Result}};
  });

  assert.equal(report.first.result.applied,false,"First-life state must not receive reincarnation gear repair.");
  assert.deepEqual(report.first.after,report.first.before,"First-life gear must remain completely untouched.");
  assert.equal(report.w1.loaded,true);assert.deepEqual(report.w1.actual.equipped,report.w1.expected.equipped);assert.deepEqual(report.w1.actual.inventory,report.w1.expected.inventory);assert.deepEqual(report.w1.actual.lost,report.w1.expected.lost);assert.deepEqual(report.w1.actual.native,report.w1.expected.native);assert.equal(report.w1.actual.score,report.w1.expectedScore,"Restored Lv.2000 equipment score must match the original Lv.2000 score.");assert.equal(report.w1.actual.repair?.applied,true);assert.equal(report.w1.actual.repair?.repaired,3);
  assert.equal(report.w2.loaded,true);assert.deepEqual(report.w2.actual.retained,report.w2.expectedRetained,"Retained W3 gear must remain Lv.2000 while the rerun player is in W2.");assert.deepEqual(report.w2.actual.native,report.w2.native,"Native W2 Lv.1000 gear must remain unchanged.");assert.equal(report.w2.actual.repair?.applied,true);assert.equal(report.w2.actual.repair?.repaired,1);
  assert.equal(report.w3.result.applied,false,"Current W3 gameplay must not use lower-world reincarnation repair.");assert.deepEqual(report.w3.after,report.w3.before,"Normal W3 sub-2000 drops must remain untouched while W3 is active.");
  assert.deepEqual(pageErrors,[],"Browser pageerror:\n"+pageErrors.join("\n\n"));
  console.log("Reincarnation permanent gear carryover integrity passed:",JSON.stringify(report));
 }finally{await browser.close();}
})().catch(error=>{console.error(error?.stack||error);process.exit(1);});
