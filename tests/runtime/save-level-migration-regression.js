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
  await page.waitForFunction(()=>window.SAVE_SCHEMA_VERSION===17&&window.SAVE_MIGRATION_REGRESSION_RUNTIME_SEPARATION_VERSION===1&&window.SAVE_MIGRATION_GLOBAL_API_CLEANUP_VERSION===2&&typeof window.migrateSave==="function",{timeout:30000});
  const report=await page.evaluate(()=>{
   const clone=value=>JSON.parse(JSON.stringify(value));
   const errors=[],cases=[];
   const runCase=(id,source,check)=>{
    try{
     const original=clone(source),seed=clone(source),migrated=window.migrateSave(seed,source.saveVersion,null,original),migration=clone(window.LAST_SAVE_MIGRATION_REPORT)||{};
     const ok=check(migrated,migration)===true;
     cases.push({id,ok,level:migrated?.level,exp:migrated?.exp,phase:typeof window.currentWorldPhase==="function"?window.currentWorldPhase(migrated):null,reincarnationCount:migrated?.reincarnation?.count,levelExpClamped:migration.levelExpClamped===true});
     if(!ok)errors.push({code:id,migrated,migration});
    }catch(error){cases.push({id,ok:false,error:String(error?.message||error)});errors.push({code:id,error:String(error?.message||error)});}
   };
   const world3=(level,exp)=>({saveVersion:16,level,exp,secondWorld:{entered:true},thirdWorld:{entered:true,entryVersion:1}});
   runCase("SCHEMA16_WORLD3_LV1000",world3(1000,0),(m,r)=>m?.thirdWorld?.entered===true&&m?.level===1000&&m?.exp===0&&m?.reincarnation?.count===0&&r?.reincarnationStateInitialized===true&&r?.targetReincarnationCount===0&&r?.levelExpClamped===false);
   runCase("SCHEMA16_WORLD3_LV1500",world3(1500,1234567),(m,r)=>m?.thirdWorld?.entered===true&&m?.level===1500&&m?.exp===1234567&&m?.reincarnation?.count===0&&r?.levelExpClamped===false);
   runCase("SCHEMA16_WORLD3_LV2000",world3(2000,9876543),(m,r)=>m?.thirdWorld?.entered===true&&m?.level===2000&&m?.exp===0&&m?.reincarnation?.count===0&&r?.levelExpClamped===true&&r?.expBeforeNormalization===9876543&&r?.expAfterNormalization===0);
   runCase("SCHEMA16_WORLD2_FAKE_LV1500",{saveVersion:16,level:1500,exp:123,secondWorld:{entered:true},thirdWorld:{entered:false}},(m,r)=>m?.thirdWorld?.entered!==true&&m?.level===1000&&m?.exp===0&&m?.reincarnation?.count===0&&r?.levelExpClamped===true&&r?.levelBeforeNormalization===1500&&r?.levelAfterNormalization===1000);
   runCase("SCHEMA15_FAKE_WORLD3_LV1500",{saveVersion:15,level:1500,exp:123,secondWorld:{entered:true},thirdWorld:{entered:true,entryVersion:1}},(m,r)=>m?.thirdWorld?.entered!==true&&m?.level===1000&&m?.exp===0&&m?.reincarnation?.count===0&&r?.legacyThirdWorldStateDiscarded===true&&r?.levelExpClamped===true);
   runCase("SCHEMA16_CONTAMINATED_REINCARNATION",{saveVersion:16,level:1000,exp:0,secondWorld:{entered:true},thirdWorld:{entered:false},reincarnation:{count:9,breakthrough:{permanent:88,milestoneLifeId:9,milestones:{100:true}},alternateUniverse:{unlocked:true,deepestCleared:900}}},(m,r)=>m?.reincarnation?.count===0&&m?.reincarnation?.breakthrough?.permanent===0&&m?.reincarnation?.alternateUniverse?.unlocked===false&&r?.sourceHadReincarnationRoot===true&&r?.sourceReincarnationCountRaw===9&&r?.sourceReincarnationCount===0&&r?.preSchema17ReincarnationDiscarded===true&&r?.targetReincarnationCount===0);
   return {version:3,passed:errors.length===0,errors,cases,production:{runner:typeof window.runLevelMigrationRegression,report:Object.prototype.hasOwnProperty.call(window,"SAVE_LEVEL_MIGRATION_REGRESSION_REPORT"),version:Object.prototype.hasOwnProperty.call(window,"SAVE_LEVEL_MIGRATION_REGRESSION_VERSION"),separation:window.SAVE_MIGRATION_REGRESSION_RUNTIME_SEPARATION_VERSION,cleanup:window.SAVE_MIGRATION_GLOBAL_API_CLEANUP_VERSION}};
  });
  assert.equal(report.version,3);
  assert.equal(report.passed,true,`Level migration regression failed: ${JSON.stringify(report.errors)}`);
  assert.equal(report.cases.length,6);
  assert.ok(report.cases.every(row=>row.ok===true),`Regression cases failed: ${JSON.stringify(report.cases)}`);
  assert.deepEqual(report.production,{runner:"undefined",report:false,version:false,separation:1,cleanup:2},"Production runtime still exposes migration regression fixture globals.");
  assert.deepEqual(pageErrors,[],"Browser pageerror:\n"+pageErrors.join("\n\n"));
  console.log("Save level migration CI regression passed:",JSON.stringify(report));
 }finally{await browser.close();}
})().catch(error=>{console.error(error?.stack||error);process.exit(1);});
