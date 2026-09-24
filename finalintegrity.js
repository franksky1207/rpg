(function(){
 const VERSION=18;
 function run(){
  const errors=[],warnings=[];
  const fail=(code,message,data=null)=>errors.push({code,message,data});
  const warn=(code,message,data=null)=>warnings.push({code,message,data});

  const reports=[
   ["PROJECT_RUNTIME_REPORT",window.PROJECT_RUNTIME_REPORT],
   ["MIRROR_DUNGEON_FINAL_INTEGRITY",window.MIRROR_DUNGEON_FINAL_INTEGRITY],
   ["STORY_RUNTIME_INTEGRITY_REPORT",window.STORY_RUNTIME_INTEGRITY_REPORT],
   ["SECOND_WORLD_CALAMITY_FULL_INTEGRITY_REPORT",window.SECOND_WORLD_CALAMITY_FULL_INTEGRITY_REPORT]
  ];
  reports.forEach(([name,report])=>{
   if(report?.passed!==true)fail("FINAL_REPORT",`${name} 未通過或未載入`,report?.errors||null);
   if(Array.isArray(report?.warnings)&&report.warnings.length)warn("FINAL_REPORT_WARNING",`${name} 有 warning`,report.warnings);
  });

  if(Number(window.PROJECT_RUNTIME_INTEGRITY_VERSION)!==18)fail("FINAL_RUNTIME_VERSION","Runtime Integrity 應為 V18",window.PROJECT_RUNTIME_INTEGRITY_VERSION);
  if(Number(window.CIVILIZATION_INTEGRITY_CONTRACT_VERSION)!==1||typeof window.runCivilizationIntegrityContract!=="function"){
   fail("FINAL_CONTRACT_MISSING","Canonical Integrity Contract V1 未載入",{version:window.CIVILIZATION_INTEGRITY_CONTRACT_VERSION,api:typeof window.runCivilizationIntegrityContract});
  }else{
   const contract=window.runCivilizationIntegrityContract({phase:"final"});
   if(contract?.passed!==true)fail("FINAL_CONTRACT","Canonical Integrity Contract 最終檢查未通過",contract?.errors||null);
  }

  if(Number(window.STORY_RUNTIME_INTEGRITY_VERSION)!==9)fail("FINAL_STORY_RUNTIME_VERSION","Story Runtime Integrity 應為 V9",window.STORY_RUNTIME_INTEGRITY_VERSION);
  if(Number(window.MIRROR_DUNGEON_FINAL_INTEGRITY_VERSION)!==5)fail("FINAL_MIRROR_VERSION","Mirror Final Integrity 應為 V5",window.MIRROR_DUNGEON_FINAL_INTEGRITY_VERSION);
  if(Number(window.SECOND_WORLD_CALAMITY_FULL_INTEGRITY_VERSION)!==2)fail("FINAL_UNIVERSE_CALAMITY_VERSION","宇宙文明災厄完整 Integrity 應為 V2",window.SECOND_WORLD_CALAMITY_FULL_INTEGRITY_VERSION);

  try{
   const main=document.getElementById("main");
   if(!main)fail("FINAL_BACKGROUND_MAIN","找不到 #main，無法檢查戰線紀錄背景");
   else{
    const probe=document.createElement("div");
    probe.className="function-page story-record-page";
    probe.style.position="absolute";
    probe.style.visibility="hidden";
    probe.style.pointerEvents="none";
    probe.innerHTML="<div class=\"card\">背景檢查</div>";
    main.appendChild(probe);
    const image=getComputedStyle(probe).backgroundImage||"";
    probe.remove();
    if(!image.includes("guide-settings"))fail("FINAL_STORY_RECORD_BACKGROUND","戰線紀錄未實際解析到 guide-settings 背景",image);
   }
  }catch(error){fail("FINAL_BACKGROUND_PROBE","戰線紀錄背景 DOM probe 失敗",String(error?.message||error));}

  try{
   const probe=document.createElement("div");
   probe.className="combat-message";
   probe.textContent="戰鬥訊息檢查";
   document.body.appendChild(probe);
   const display=getComputedStyle(probe).display||"";
   probe.remove();
   if(display!=="none")fail("FINAL_COMBAT_MESSAGE_VISIBLE","正式戰鬥文字訊息列應從玩家畫面移除",display);
  }catch(error){fail("FINAL_COMBAT_MESSAGE_PROBE","戰鬥訊息隱藏 DOM probe 失敗",String(error?.message||error));}

  const report={version:VERSION,contractVersion:Number(window.CIVILIZATION_INTEGRITY_CONTRACT_VERSION)||0,passed:errors.length===0,clean:errors.length===0&&warnings.length===0,errors,warnings,checkedAt:Date.now()};
  window.CIVILIZATION_FINAL_INTEGRITY_REPORT=report;
  if(errors.length)console.error("[文明戰線] Final integrity error",errors);
  else if(warnings.length)console.warn("[文明戰線] Final integrity warning",warnings);
  else console.info("[文明戰線] Final integrity passed");
  return report;
 }
 window.CIVILIZATION_FINAL_INTEGRITY_VERSION=VERSION;
 window.runCivilizationFinalIntegrity=run;
 setTimeout(run,0);
})();
