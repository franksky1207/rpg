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
  await page.waitForFunction(()=>window.CIVILIZATION_FINAL_INTEGRITY_REPORT&&window.PROJECT_RUNTIME_REPORT,{timeout:30000});
  const snapshot=await page.evaluate(()=>{
   const higher={level:1000,secondWorld:{entered:true,darkMatter:0,darkEnergy:0},thirdWorld:{entered:true,dimensionalStrings:0}};
   const arena=typeof window.dungeonModeAvailability==="function"?window.dungeonModeAvailability("arena",higher):null;
   const bounty=typeof window.dungeonModeAvailability==="function"?window.dungeonModeAvailability("bounty",higher):null;
   const contract=typeof window.runCivilizationIntegrityContract==="function"?window.runCivilizationIntegrityContract({phase:"browser-smoke"}):null;
   return {
    runtime:window.PROJECT_RUNTIME_REPORT||null,
    final:window.CIVILIZATION_FINAL_INTEGRITY_REPORT||null,
    contract,
    gmBatch16:window.GM_BATCH16_INTEGRITY||null,
    offlineOwner:window.OFFLINE_SAMPLE_OWNER_INTEGRITY||null,
    versions:{contract:window.CIVILIZATION_INTEGRITY_CONTRACT_VERSION,runtime:window.PROJECT_RUNTIME_INTEGRITY_VERSION,final:window.CIVILIZATION_FINAL_INTEGRITY_VERSION,offline:window.OFFLINE_STATE_NORMALIZATION_VERSION,sample:window.OFFLINE_BATTLE_SAMPLE_VERSION,w3Dungeon:window.THIRD_WORLD_DUNGEON_UI_VERSION},
    arena,bounty,
    stateSchema:typeof state!=="undefined"?state?.saveVersion:null,
    schema:window.SAVE_SCHEMA_VERSION
   };
  });
  assert.equal(snapshot.versions.contract,3,"Contract V3 未載入");
  assert.equal(snapshot.versions.runtime,20,"Runtime Integrity V20 未載入");
  assert.equal(snapshot.versions.final,20,"Final Integrity V20 未載入");
  assert.ok(snapshot.versions.offline>=4,"Offline normalization 低於 V4");
  assert.ok(snapshot.versions.sample>=4,"Offline sample 低於 V4");
  assert.ok(snapshot.versions.w3Dungeon>=6,"W3 dungeon UI 低於 V6");
  assert.equal(snapshot.runtime?.passed,true,"PROJECT_RUNTIME_REPORT 未通過："+JSON.stringify(snapshot.runtime?.errors||null));
  assert.equal(snapshot.contract?.passed,true,"Canonical contract 未通過："+JSON.stringify(snapshot.contract?.errors||null));
  assert.equal(snapshot.final?.passed,true,"Final Integrity 未通過："+JSON.stringify(snapshot.final?.errors||null));
  assert.equal(snapshot.gmBatch16?.passed,true,"GM Batch16 integrity 未通過："+JSON.stringify(snapshot.gmBatch16?.errors||null));
  assert.equal(snapshot.offlineOwner?.passed,true,"Offline sample owner integrity 未通過："+JSON.stringify(snapshot.offlineOwner?.errors||null));
  assert.equal(snapshot.arena?.visible,true,"W3 高維競技場應可見");
  assert.equal(snapshot.arena?.enabled,true,"W3 高維競技場應可進入");
  assert.equal(snapshot.bounty?.visible,false,"W3 懸賞戰應隱藏");
  assert.equal(snapshot.stateSchema,snapshot.schema,"啟動後 state schema 與正式 schema 不一致");
  assert.deepEqual(pageErrors,[],"瀏覽器 pageerror：\n"+pageErrors.join("\n\n"));
  console.log("Browser runtime smoke passed:",JSON.stringify({versions:snapshot.versions,arena:snapshot.arena,bounty:snapshot.bounty}));
 }finally{await browser.close();}
})().catch(error=>{console.error(error?.stack||error);process.exit(1);});
