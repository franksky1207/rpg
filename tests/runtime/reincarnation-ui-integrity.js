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
  await page.waitForFunction(()=>window.REINCARNATION_UI_VERSION===1&&window.REINCARNATION_HOME_BRIDGE_VERSION===1&&typeof window.reincarnationHomeEntryHtml==="function",{timeout:30000});
  const report=await page.evaluate(()=>{
   const makeQualified=()=>{
    const s=newState();
    s.level=2000;s.exp=0;
    s.secondWorld=window.createBlankSecondWorldState();s.secondWorld.entered=true;s.secondWorld.civilizationLevel=10;
    s.thirdWorld=window.createBlankThirdWorldState();s.thirdWorld.entered=true;s.thirdWorld.entryVersion=2;s.thirdWorld.coreLevel=10;s.thirdWorld.bosses=s.thirdWorld.bosses.map(()=>({currentHp:0}));
    s.reincarnation={count:2,breakthrough:{permanent:17,milestoneLifeId:2,milestones:{}},alternateUniverse:{unlocked:true,deepestCleared:12,activeAttempt:null,lifeFailures:{lifeId:2,failures:{}}}};
    return s;
   };
   const first=newState();
   const firstCard=(()=>{state=first;return window.reincarnationHomeEntryHtml();})();
   const firstSpeed=window.playerCombatSpeedOptions(first).slice();
   const qualified=makeQualified();state=qualified;
   const card=window.reincarnationHomeEntryHtml();
   const bridged=window.secondWorldHomeEntryHtml();
   window.openReincarnationRequirements();
   const requirementsText=document.getElementById("worldPhaseRequirementsModal")?.textContent||"";
   window.closeReincarnationRequirements();
   window.openReincarnationConfirmation();
   const confirmText=document.getElementById("worldPhaseConfirmModal")?.textContent||"";
   const originalExecute=window.executeFormalReincarnation;
   let calls=0;
   window.executeFormalReincarnation=()=>{calls+=1;return {ok:true,reason:""};};
   const button=document.getElementById("reincarnationConfirmEnterButton");
   button?.click();button?.click();
   const buttonDisabled=button?.disabled===true;
   window.executeFormalReincarnation=originalExecute;
   window.closeReincarnationConfirmation();
   const reincarnatedW1=newState();reincarnatedW1.reincarnation={count:1,breakthrough:{permanent:10,milestoneLifeId:1,milestones:{}},alternateUniverse:{unlocked:true,deepestCleared:0,activeAttempt:null,lifeFailures:{lifeId:1,failures:{}}}};reincarnatedW1.settings.combatSpeed=1.5;
   state=reincarnatedW1;
   const reincarnatedSpeedOptions=window.playerCombatSpeedOptions(reincarnatedW1).slice();
   const reincarnatedSpeed=window.playerCombatSpeed();
   return {firstCard,firstSpeed,card,bridged,requirementsText,confirmText,calls,buttonDisabled,reincarnatedSpeedOptions,reincarnatedSpeed,versions:{ui:window.REINCARNATION_UI_VERSION,bridge:window.REINCARNATION_HOME_BRIDGE_VERSION,speed:window.COMBAT_SPEED_REINCARNATION_UNLOCK_VERSION}};
  });
  assert.deepEqual(report.versions,{ui:1,bridge:1,speed:1});
  assert.equal(report.firstCard,"");
  assert.deepEqual(report.firstSpeed,[1]);
  assert.ok(report.card.includes("文明轉生"));
  assert.ok(report.card.includes("轉生條件 <b>3 / 3</b>"));
  assert.ok(report.card.includes("開始轉生"));
  assert.ok(report.bridged.includes("文明轉生"));
  for(const text of ["角色等級","擊敗 10 名高維存在","界弦核心 Lv.10"])assert.ok(report.requirementsText.includes(text),text);
  for(const text of ["會保留","會重置","轉生後突破","Lv.100","Lv.1000","此操作無法復原"])assert.ok(report.confirmText.includes(text),text);
  assert.equal(report.calls,1);
  assert.equal(report.buttonDisabled,true);
  assert.deepEqual(report.reincarnatedSpeedOptions,[1,1.5]);
  assert.equal(report.reincarnatedSpeed,1.5);
  assert.deepEqual(pageErrors,[],"Browser pageerror:\n"+pageErrors.join("\n\n"));
  console.log("Reincarnation UI integrity passed:",JSON.stringify(report));
 }finally{await browser.close();}
})().catch(error=>{console.error(error?.stack||error);process.exit(1);});
