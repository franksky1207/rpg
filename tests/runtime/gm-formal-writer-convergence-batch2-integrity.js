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
  await page.waitForFunction(()=>window.CivilizationScriptLoader&&typeof window.CivilizationScriptLoader.ensure==="function",{timeout:30000});
  await page.evaluate(()=>window.CivilizationScriptLoader.ensure("gm"));
  await page.waitForFunction(()=>window.GM_FORMAL_TRANSACTION_OWNER_VERSION===3&&window.GM_FORMAL_TRANSACTION_INTEGRITY?.passed===true,{timeout:30000});
  const report=await page.evaluate(()=>{
   const types=["weapon","helmet","armor","shoes","accessory"];
   const handlers=Object.fromEntries(["gmLevel","gmSetWorldProgress","gmCreateGear","gmCreateSecondWorldGear","gmCreateThirdWorldGear","gmApplyEnhancementLevels","gmResetVip"].map(name=>[name,{type:typeof window[name],owner:window[name]?.__gmFormalTransactionVersion||0}]));
   const w1={secondWorld:{entered:false},thirdWorld:{entered:false}};
   const progress=window.gmApplyFormalFirstWorldProgressMutation(17,w1);
   const wrongProgress=window.gmApplyFormalFirstWorldProgressMutation(17,{secondWorld:{entered:true},thirdWorld:{entered:false}});
   const enhancementFixture={secondWorld:{entered:false},thirdWorld:{entered:false},enhancement:{basicStones:0,advancedStones:0,levels:Object.fromEntries(types.map(type=>[type,0]))}};
   const enhancement=window.gmApplyFormalEnhancementMutation(Object.fromEntries(types.map(type=>[type,20])),enhancementFixture);
   const firstLife=typeof window.newState==="function"?window.newState():null;
   if(firstLife){firstLife.level=500;firstLife.inventory=[];firstLife.secondWorld.entered=false;firstLife.thirdWorld.entered=false;}
   const gear=firstLife?window.gmApplyFormalGeneratedEquipmentMutation({world:1,q:5,level:500,types:["weapon"]},firstLife):null;
   const wrongW2=firstLife?window.gmApplyFormalGeneratedEquipmentMutation({world:2,q:5,bossIndex:0,types:["weapon"]},firstLife):null;
   const vip={vipLevel:8,vipPoints:123,hp:100,level:1,equipment:{},secondWorld:{entered:false},thirdWorld:{entered:false}};
   const vipReset=window.gmApplyFormalVipResetMutation(vip);
   return {self:window.GM_FORMAL_TRANSACTION_INTEGRITY,versions:{owner:window.GM_FORMAL_TRANSACTION_OWNER_VERSION,character:window.GM_FORMAL_CHARACTER_TRANSACTION_VERSION,mainline:window.GM_FORMAL_MAINLINE_TRANSACTION_VERSION,gear:window.GM_FORMAL_GEAR_TRANSACTION_VERSION,enhancement:window.GM_FORMAL_ENHANCEMENT_TRANSACTION_VERSION,vip:window.GM_FORMAL_VIP_RESET_TRANSACTION_VERSION,ui:window.GM_FORMAL_UI_WRITER_CONVERGENCE_VERSION},handlers,progress,w1,wrongProgress,enhancement,enhancementFixture,gear,firstLifeInventory:firstLife?.inventory?.map(item=>({world:item.world??1,level:item.level,q:item.q,type:item.type}))||[],wrongW2,vipReset,vip};
  });
  assert.equal(report.self.passed,true,"GM formal transaction self-integrity failed: "+JSON.stringify(report.self.errors||null));
  assert.deepEqual(report.versions,{owner:3,character:1,mainline:1,gear:1,enhancement:2,vip:1,ui:1},"GM formal owner versions drifted.");
  for(const [name,row] of Object.entries(report.handlers)){assert.equal(row.type,"function",`${name} missing`);assert.equal(row.owner,1,`${name} must be installed by gmformaltransaction canonical owner`);}
  assert.equal(report.progress.ok,true);assert.equal(report.w1.unlockedMap,3);assert.equal(report.progress.currentEnemy,1);assert.equal(report.w1.bossKilled[0],true);
  assert.equal(report.wrongProgress.ok,false);assert.equal(report.wrongProgress.reason,"wrong-world","W1 progress writer must reject W2/W3 formal state.");
  assert.equal(report.enhancement.ok,true);for(const value of Object.values(report.enhancementFixture.enhancement.levels))assert.equal(value,20);
  assert.equal(report.gear.ok,true);assert.equal(report.gear.created,1);assert.equal(report.firstLifeInventory.length,1);assert.equal(report.firstLifeInventory[0].level,500);assert.equal(report.firstLifeInventory[0].type,"weapon");
  assert.equal(report.wrongW2.ok,false);assert.equal(report.wrongW2.reason,"wrong-world","W2 gear writer must reject first-world formal state.");
  assert.equal(report.vipReset.ok,true);assert.equal(report.vip.vipLevel,0);assert.equal(report.vip.vipPoints,0);
  assert.deepEqual(pageErrors,[],"Browser pageerror:\n"+pageErrors.join("\n\n"));
  console.log("GM formal writer convergence Batch2 passed:",JSON.stringify({versions:report.versions,handlers:report.handlers,progress:report.progress,gear:report.gear}));
 }finally{await browser.close();}
})().catch(error=>{console.error(error?.stack||error);process.exit(1);});