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
  await page.waitForFunction(()=>window.NEW_STATE_NORMALIZER_CONTRACT_VERSION===1&&window.DAILY_NEW_STATE_NORMALIZER_VERSION===1&&window.SAVE_LOAD_PIPELINE_VERSION===3&&typeof newState==="function",{timeout:30000});
  const report=await page.evaluate(()=>{
   const rootOk=s=>!!s&&typeof s==="object"&&!Array.isArray(s)&&typeof s.settings==="object"&&typeof s.equipment==="object"&&Array.isArray(s.inventory)&&Array.isArray(s.mapProgress)&&Array.isArray(s.bossProgress)&&Array.isArray(s.bossKilled)&&typeof s.daily==="object"&&typeof s.dungeon==="object"&&typeof s.reincarnation==="object"&&Number(s.level)===1;
   const before=window.newStateNormalizerContractSnapshot();
   const fresh=newState();
   const afterFresh=window.newStateNormalizerContractSnapshot();
   const registered=window.registerNewStateNormalizer(function intentionalBadNormalizer(){return {dateKey:"bad-subsystem"};});
   const guarded=newState();
   const afterGuard=window.newStateNormalizerContractSnapshot();
   return {
    freshOk:rootOk(fresh),guardedOk:rootOk(guarded),registered,
    fresh:{level:fresh.level,hasSettings:!!fresh.settings,hasDaily:!!fresh.daily,hasDungeon:!!fresh.dungeon,hasReincarnation:!!fresh.reincarnation},
    before,afterFresh,afterGuard,
    backupDelegation:window.SAVE_VERSION_BACKUP_DELEGATION_VERSION,
    loadOwner:window.LAST_SAVE_LOAD_REPORT?.versionBackupOwner||null
   };
  });
  assert.equal(report.freshOk,true,"Full-runtime newState lost root fields: "+JSON.stringify(report.fresh));
  assert.equal(report.afterFresh.violations,report.before.violations,"Formal normalizers must not violate the root contract.");
  assert.equal(report.registered,true,"Intentional bad normalizer registration failed.");
  assert.equal(report.guardedOk,true,"Contract guard failed to preserve the state root.");
  assert.equal(report.afterGuard.violations,report.afterFresh.violations+1,"Intentional subsystem replacement was not rejected exactly once.");
  assert.equal(report.afterGuard.lastViolation?.normalizer,"intentionalBadNormalizer","Wrong normalizer recorded as the contract violation.");
  assert.equal(report.backupDelegation,1,"Save migration backup delegation marker missing.");
  assert.equal(report.loadOwner,"saveversionguard","Canonical load report does not identify saveversionguard as backup owner.");
  assert.deepEqual(pageErrors,[],"Browser pageerror:\n"+pageErrors.join("\n\n"));
  console.log("New-state browser integrity passed:",JSON.stringify({fresh:report.fresh,formalViolations:report.afterFresh.violations,guardViolation:report.afterGuard.lastViolation,loadOwner:report.loadOwner}));
 }finally{await browser.close();}
})().catch(error=>{console.error(error?.stack||error);process.exit(1);});