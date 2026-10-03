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
  await page.waitForFunction(()=>window.MAJOR_TRANSITION_UI_VERSION===1&&window.WORLD_PHASE_SHARED_UI_VERSION===4&&window.REINCARNATION_MAJOR_TRANSITION_SHELL_VERSION===1&&window.REINCARNATION_PRECOMMIT_BACKUP_VERSION===1&&typeof window.createVerifiedReincarnationBackup==="function",{timeout:30000});

  const uiReport=await page.evaluate(()=>{
   const oldSecond=window.secondWorldEntryRequirements,oldThird=window.thirdWorldEntryRequirements;
   const w2={eligible:true,completed:5,total:5,level:{ok:true,current:500,required:500},mainline:{ok:true,bossCompleted:true},specializations:{ok:true,completed:8,total:8},enhancement:{ok:true,completed:5,total:5},marks:{ok:true,completed:10,total:10}};
   const w3={eligible:true,completed:7,total:7,level:{ok:true,current:1000,required:1000},mainline:{ok:true},enhancement:{ok:true,completed:5,total:5},civilization:{ok:true,current:10,required:10},vip:{ok:true,current:20,required:20},specializations:{ok:true,completed:8,total:8},marks:{ok:true,completed:10,total:10}};
   const capture=(world,fixture)=>{
    if(world===2)window.secondWorldEntryRequirements=()=>fixture;else window.thirdWorldEntryRequirements=()=>fixture;
    window.openWorldPhaseRequirements(world);
    const req=document.getElementById("worldPhaseRequirementsModal");
    const requirements={open:req?.classList.contains("open")===true,text:req?.textContent||"",html:req?.innerHTML||""};
    window.closeWorldPhaseRequirements();
    window.openWorldPhaseConfirmation(world);
    const confirm=document.getElementById("worldPhaseConfirmModal");
    const confirmation={open:confirm?.classList.contains("open")===true,text:confirm?.textContent||"",html:confirm?.innerHTML||"",button:confirm?.querySelector("#worldPhaseConfirmEnterButton")?.textContent||""};
    window.closeWorldPhaseConfirmation();
    return {requirements,confirmation};
   };
   try{return {w2:capture(2,w2),w3:capture(3,w3),versions:{major:window.MAJOR_TRANSITION_UI_VERSION,worldShared:window.WORLD_PHASE_SHARED_UI_VERSION,reincarnationShell:window.REINCARNATION_MAJOR_TRANSITION_SHELL_VERSION}};}
   finally{window.secondWorldEntryRequirements=oldSecond;window.thirdWorldEntryRequirements=oldThird;}
  });
  assert.deepEqual(uiReport.versions,{major:1,worldShared:4,reincarnationShell:1});
  assert.equal(uiReport.w2.requirements.open,true);assert.equal(uiReport.w2.confirmation.open,true);
  for(const text of ["銀河紀元 → 宇宙紀元","宇宙紀元突破條件","角色等級","完成銀河紀元主線","專精全滿","五個裝備欄位強化 +20","十種印記 Lv.10","進入宇宙紀元"])assert.ok(uiReport.w2.requirements.text.includes(text),`W2 requirements missing: ${text}`);
  for(const text of ["不可逆世界突破","確定進入「宇宙紀元」？","會保留","會清空","宇宙紀元新功能","1.5× 戰鬥速度","此操作無法復原"])assert.ok(uiReport.w2.confirmation.text.includes(text),`W2 confirmation missing: ${text}`);
  assert.equal(uiReport.w2.confirmation.button,"進入宇宙紀元");
  assert.equal(uiReport.w3.requirements.open,true);assert.equal(uiReport.w3.confirmation.open,true);
  for(const text of ["宇宙紀元 → 高維紀元","高維紀元突破條件","角色等級","完成宇宙紀元主線","五個裝備欄位強化 +40","文明等級 Lv.10","VIP Lv.20","專精全滿","十種印記 Lv.10","進入高維紀元"])assert.ok(uiReport.w3.requirements.text.includes(text),`W3 requirements missing: ${text}`);
  for(const text of ["不可逆世界突破","確定進入「高維紀元」？","會保留","會截止／清除","遺失裝備","副本變化","此操作無法復原"])assert.ok(uiReport.w3.confirmation.text.includes(text),`W3 confirmation missing: ${text}`);
  assert.equal(uiReport.w3.confirmation.button,"進入高維紀元");

  const backupReport=await page.evaluate(()=>{
   const clone=v=>JSON.parse(JSON.stringify(v));
   const stable=v=>Array.isArray(v)?v.map(stable):(v&&typeof v==="object"?Object.fromEntries(Object.keys(v).sort().map(key=>[key,stable(v[key])])):v);
   const makeQualified=()=>{
    const s=newState();
    s.saveVersion=17;s.level=2000;s.exp=321;s.hp=88888;s.gold=777;
    s.reincarnation={count:2,breakthrough:{permanent:17,milestoneLifeId:2,milestones:Object.fromEntries((window.BREAKTHROUGH_MILESTONE_LEVELS||[]).map(level=>[String(level),true]))},alternateUniverse:{unlocked:true,deepestCleared:12,activeAttempt:null,lifeFailures:{lifeId:2,failures:{}}}};
    s.specializations=Object.fromEntries((window.SPECIALIZATION_KEYS||[]).map(key=>[key,60]));
    s.enhancement={basicStones:3,advancedStones:2,levels:Object.fromEntries(["weapon","helmet","armor","shoes","accessory"].map(slot=>[slot,40]))};
    s.secondWorld=window.createBlankSecondWorldState();s.secondWorld.entered=true;s.secondWorld.civilizationLevel=10;
    s.thirdWorld=window.createBlankThirdWorldState();s.thirdWorld.entered=true;s.thirdWorld.entryVersion=2;s.thirdWorld.coreLevel=10;s.thirdWorld.bosses=s.thirdWorld.bosses.map(()=>({currentHp:0}));
    return s;
   };
   const originalState=clone(state);
   try{
    const probe=makeQualified();
    const direct=window.createVerifiedReincarnationBackup(probe);
    const directStored=direct?.ownerReport?.key?localStorage.getItem(direct.ownerReport.key):null;

    state=makeQualified();
    const failBefore=stable(clone(state));let failSaveCalls=0;
    const failed=window.executeFormalReincarnation({reload:false,backupFn:()=>({required:true,verified:false,failed:true,error:"forced-backup-failure"}),saveFn:()=>{failSaveCalls+=1;return true;}});
    const failAfter=stable(clone(state));

    state=makeQualified();let capturedRaw="",successSaveCalls=0;
    const success=window.executeFormalReincarnation({reload:false,currentTime:7000,backupFn:(reason,raw)=>{capturedRaw=raw;return {required:true,verified:true,failed:false,reason,key:"test-backup"};},saveFn:()=>{successSaveCalls+=1;return true;}});
    const captured=JSON.parse(capturedRaw);
    return {
     versions:{backup:window.REINCARNATION_PRECOMMIT_BACKUP_VERSION,transaction:window.REINCARNATION_TRANSACTION_VERSION},
     direct:{ok:direct.ok,verified:direct.verified,failed:direct.failed,reason:direct.ownerReport?.reason||"",storedMatches:directStored===JSON.stringify(probe)},
     failed:{ok:failed.ok,reason:failed.reason,backupVerified:failed.backup?.verified===true,backupError:failed.backup?.error||"",saveCalls:failSaveCalls,stateExact:JSON.stringify(failBefore)===JSON.stringify(failAfter),count:state?.reincarnation?.count},
     success:{ok:success.ok,backupVerified:success.backup?.verified===true,saveCalls:successSaveCalls,capturedLevel:captured.level,capturedCount:captured.reincarnation?.count,capturedPermanent:captured.reincarnation?.breakthrough?.permanent,afterLevel:state.level,afterCount:state.reincarnation?.count,afterPermanent:state.reincarnation?.breakthrough?.permanent}
    };
   }finally{state=originalState;}
  });
  assert.deepEqual(backupReport.versions,{backup:1,transaction:1});
  assert.equal(backupReport.direct.ok,true);assert.equal(backupReport.direct.verified,true);assert.equal(backupReport.direct.failed,false);assert.equal(backupReport.direct.reason,"formal-reincarnation");assert.equal(backupReport.direct.storedMatches,true);
  assert.equal(backupReport.failed.ok,false);assert.equal(backupReport.failed.reason,"backup-failed");assert.equal(backupReport.failed.backupVerified,false);assert.ok(backupReport.failed.backupError.includes("forced-backup-failure"));assert.equal(backupReport.failed.saveCalls,0);assert.equal(backupReport.failed.stateExact,true);
  assert.equal(backupReport.success.ok,true);assert.equal(backupReport.success.backupVerified,true);assert.equal(backupReport.success.saveCalls,1);assert.equal(backupReport.success.capturedLevel,2000);assert.equal(backupReport.success.capturedCount,2);assert.equal(backupReport.success.capturedPermanent,17);assert.equal(backupReport.success.afterLevel,1);assert.equal(backupReport.success.afterCount,3);assert.equal(backupReport.success.afterPermanent,17);
  assert.deepEqual(pageErrors,[],"Browser pageerror:\n"+pageErrors.join("\n\n"));
  console.log("Reincarnation optimization batch 4 integrity passed:",JSON.stringify({uiReport,backupReport}));
 }finally{await browser.close();}
})().catch(error=>{console.error(error?.stack||error);process.exit(1);});