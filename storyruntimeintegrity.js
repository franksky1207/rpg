(function(){
 const VERSION=1;

 function run(){
  const errors=[];
  const warnings=[];
  const fail=(code,message,data=null)=>errors.push({code,message,data});
  const warn=(code,message,data=null)=>warnings.push({code,message,data});

  const dataReport=typeof window.runCivilizationStoryIntegrity==="function"?window.runCivilizationStoryIntegrity():null;
  if(!dataReport)fail("STORY_RUNTIME_DATA_INTEGRITY_MISSING","正式劇情資料完整性檢查器未載入");
  else if(dataReport.passed!==true)fail("STORY_RUNTIME_DATA_INTEGRITY_FAILED","正式劇情資料完整性檢查未通過",dataReport.errors||[]);

  if(typeof window.openStory!=="function")fail("STORY_RUNTIME_UI_OPEN_MISSING","openStory 未載入");
  if(typeof window.isStoryOpen!=="function")fail("STORY_RUNTIME_UI_STATE_MISSING","isStoryOpen 未載入");
  if(Number(window.STORY_UI_VERSION)<5)fail("STORY_RUNTIME_UI_VERSION","STORY_UI_VERSION 未達目前需求",window.STORY_UI_VERSION);

  const migration=window.civilizationStoryMigration;
  if(!migration||typeof migration.migrate!=="function"||typeof migration.backfillAvailableHistory!=="function")fail("STORY_RUNTIME_MIGRATION_MISSING","故事進度 migration 模組未完整載入");
  if(Number(window.STORY_MIGRATION_VERSION)<1)fail("STORY_RUNTIME_MIGRATION_VERSION","STORY_MIGRATION_VERSION 未達目前需求",window.STORY_MIGRATION_VERSION);

  const progress=window.civilizationStoryProgress;
  if(!progress)fail("STORY_RUNTIME_PROGRESS_MISSING","civilizationStoryProgress 未載入");
  else{
   ["normalize","resume","get","setPending","completeStory","queueBossStory","bossStoryId","backfillAvailableHistory","completedStories"].forEach(name=>{
    if(typeof progress[name]!=="function")fail("STORY_RUNTIME_PROGRESS_METHOD",`civilizationStoryProgress.${name} 未載入`);
   });
  }
  if(Number(window.CIVILIZATION_STORY_PROGRESS_VERSION)<6)fail("STORY_RUNTIME_PROGRESS_VERSION","CIVILIZATION_STORY_PROGRESS_VERSION 未達目前需求",window.CIVILIZATION_STORY_PROGRESS_VERSION);

  if(typeof window.replayCompletedStory!=="function")fail("STORY_RUNTIME_REPLAY_MISSING","戰線紀錄重播函式未載入");
  if(typeof window.storyRecordPageHtml!=="function")fail("STORY_RUNTIME_RECORD_PAGE_MISSING","戰線紀錄頁面函式未載入");
  if(typeof window.selectStoryRecordRegion!=="function")fail("STORY_RUNTIME_RECORD_SELECT_MISSING","戰線紀錄區域切換函式未載入");
  if(Number(window.STORY_RECORD_TABS_VERSION)<2)fail("STORY_RUNTIME_RECORD_VERSION","STORY_RECORD_TABS_VERSION 未達目前需求",window.STORY_RECORD_TABS_VERSION);

  if(typeof window.gmStoryTestHtml!=="function")fail("STORY_RUNTIME_GM_MISSING","GM 劇情測試模組未載入");
  if(typeof window.gmPreviewStory!=="function")fail("STORY_RUNTIME_GM_PREVIEW_MISSING","GM 劇情預覽函式未載入");
  if(Number(window.GM_STORY_TEST_VERSION)<1)fail("STORY_RUNTIME_GM_VERSION","GM_STORY_TEST_VERSION 未達目前需求",window.GM_STORY_TEST_VERSION);

  const regions=Array.isArray(window.WORLD_REGIONS)?window.WORLD_REGIONS:[];
  const stories=window.CIVILIZATION_STORIES||{};
  if(progress&&typeof progress.bossStoryId==="function"){
   let checked=0;
   for(const region of regions){
    const start=Number(region?.mapStart),end=Number(region?.mapEnd);
    if(!Number.isInteger(start)||!Number.isInteger(end))continue;
    for(let mapIdx=start;mapIdx<=end;mapIdx++){
     const storyId=progress.bossStoryId(mapIdx);
     checked++;
     if(!storyId)fail("STORY_RUNTIME_BOSS_MAPPING_EMPTY",`map ${mapIdx} 無法取得首領故事 id`);
     else if(!stories[storyId])fail("STORY_RUNTIME_BOSS_MAPPING_MISSING",`map ${mapIdx} 對應故事不存在：${storyId}`);
    }
   }
   if(checked!==100)fail("STORY_RUNTIME_BOSS_MAPPING_COUNT",`執行期應檢查 100 個首領故事對應，實際 ${checked}`);
  }

  if(typeof window.state!=="undefined"&&window.state&&progress&&typeof progress.get==="function"){
   let p=null;
   try{p=progress.get();}catch(error){fail("STORY_RUNTIME_PROGRESS_GET_FAILED","讀取故事進度時發生錯誤",String(error?.message||error));}
   if(p){
    if(!Array.isArray(p.completedStories))fail("STORY_RUNTIME_COMPLETED_FORMAT","completedStories 格式錯誤");
    else p.completedStories.forEach(id=>{if(!stories[id])warn("STORY_RUNTIME_COMPLETED_UNKNOWN",`已完成故事紀錄找不到正式資料：${id}`);});
    if(p.pendingStory!=null&&!stories[p.pendingStory])fail("STORY_RUNTIME_PENDING_UNKNOWN",`pendingStory 找不到正式資料：${p.pendingStory}`);
    if(!Array.isArray(p.historyBackfillRegions))fail("STORY_RUNTIME_BACKFILL_FORMAT","historyBackfillRegions 格式錯誤");
   }
  }

  const report={
   passed:errors.length===0,
   version:VERSION,
   checkedAt:Date.now(),
   dataIntegrityPassed:dataReport?.passed===true,
   errors,
   warnings
  };
  window.STORY_RUNTIME_INTEGRITY_REPORT=report;
  if(!report.passed)console.error("[文明戰線] 劇情執行期完整性檢查失敗",report);
  else if(warnings.length)console.warn("[文明戰線] 劇情執行期完整性檢查通過，但有警告",report);
  else console.info("[文明戰線] 劇情執行期完整性檢查通過",report);
  return report;
 }

 window.STORY_RUNTIME_INTEGRITY_VERSION=VERSION;
 window.runCivilizationStoryRuntimeIntegrity=run;
 run();
})();