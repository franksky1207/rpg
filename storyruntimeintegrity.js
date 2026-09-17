(function(){
 const VERSION=7;

 function run(){
  const errors=[];
  const warnings=[];
  const fail=(code,message,data=null)=>errors.push({code,message,data});
  const warn=(code,message,data=null)=>warnings.push({code,message,data});

  const dataReport=typeof window.runCivilizationStoryIntegrity==="function"?window.runCivilizationStoryIntegrity():null;
  if(!dataReport)fail("STORY_RUNTIME_DATA_INTEGRITY_MISSING","正式劇情資料完整性檢查器未載入");
  else{
   if(dataReport.passed!==true)fail("STORY_RUNTIME_DATA_INTEGRITY_FAILED","正式劇情資料完整性檢查未通過",dataReport.errors||[]);
   if(Number(dataReport.storyRegions)!==10)fail("STORY_RUNTIME_REGION_COUNT",`正式劇情執行期必須載入 10 個區域，實際 ${Number(dataReport.storyRegions)||0}`);
   if(Number(dataReport.totalStories)!==101)fail("STORY_RUNTIME_STORY_COUNT",`正式劇情執行期必須載入 101 篇故事，實際 ${Number(dataReport.totalStories)||0}`);
   if(Number(dataReport.bossStoriesChecked)!==100)fail("STORY_RUNTIME_BOSS_DATA_COUNT",`正式劇情執行期必須完成 100 個首領故事資料檢查，實際 ${Number(dataReport.bossStoriesChecked)||0}`);
  }
  if(Number(window.STORY_INTEGRITY_VERSION)<6)fail("STORY_RUNTIME_DATA_INTEGRITY_VERSION","STORY_INTEGRITY_VERSION 未達目前需求",window.STORY_INTEGRITY_VERSION);
  if(typeof window.openStory!=="function")fail("STORY_RUNTIME_UI_OPEN_MISSING","openStory 未載入");
  if(typeof window.isStoryOpen!=="function")fail("STORY_RUNTIME_UI_STATE_MISSING","isStoryOpen 未載入");
  if(Number(window.STORY_UI_VERSION)<5)fail("STORY_RUNTIME_UI_VERSION","STORY_UI_VERSION 未達目前需求",window.STORY_UI_VERSION);

  const migration=window.civilizationStoryMigration;
  if(!migration||typeof migration.migrate!=="function"||typeof migration.backfillAvailableHistory!=="function")fail("STORY_RUNTIME_MIGRATION_MISSING","故事進度 migration 模組未完整載入");
  if(Number(window.STORY_MIGRATION_VERSION)<4)fail("STORY_RUNTIME_MIGRATION_VERSION","STORY_MIGRATION_VERSION 未達目前需求",window.STORY_MIGRATION_VERSION);
  if(!Array.isArray(migration?.legacyFields)||!migration.legacyFields.includes("historyBackfillRegions"))fail("STORY_RUNTIME_MIGRATION_LEGACY_FIELDS","migration 未標記 historyBackfillRegions 為 legacy 相容欄位");

  const progress=window.civilizationStoryProgress;
  if(!progress)fail("STORY_RUNTIME_PROGRESS_MISSING","civilizationStoryProgress 未載入");
  else{
   ["normalize","resume","get","setPending","completeStory","queueBossStory","bossStoryId","backfillAvailableHistory","completedStories"].forEach(name=>{
    if(typeof progress[name]!=="function")fail("STORY_RUNTIME_PROGRESS_METHOD",`civilizationStoryProgress.${name} 未載入`);
   });
  }
  if(Number(window.CIVILIZATION_STORY_PROGRESS_VERSION)<8)fail("STORY_RUNTIME_PROGRESS_VERSION","CIVILIZATION_STORY_PROGRESS_VERSION 未達目前需求",window.CIVILIZATION_STORY_PROGRESS_VERSION);

  if(typeof window.replayCompletedStory!=="function")fail("STORY_RUNTIME_REPLAY_MISSING","戰線紀錄重播函式未載入");
  if(typeof window.storyRecordPageHtml!=="function")fail("STORY_RUNTIME_RECORD_PAGE_MISSING","戰線紀錄頁面函式未載入");
  if(typeof window.selectStoryRecordRegion!=="function")fail("STORY_RUNTIME_RECORD_SELECT_MISSING","戰線紀錄區域切換函式未載入");
  if(typeof window.prepareStoryRecordEntry!=="function")fail("STORY_RUNTIME_RECORD_ENTRY_MISSING","戰線紀錄進頁初始化函式未載入");
  if(Number(window.STORY_RECORD_TABS_VERSION)<4)fail("STORY_RUNTIME_RECORD_VERSION","STORY_RECORD_TABS_VERSION 未達目前需求",window.STORY_RECORD_TABS_VERSION);
  if(window.go?.__storyRecordLatestWrapped)fail("STORY_RUNTIME_RECORD_GO_WRAPPER","戰線紀錄不得再包裝全域 go()；應由正式進頁 hook 處理");

  ["gmStoryTestHtml","gmPreviewStory","gmStoryMoveRegion","gmStoryMoveEntry","gmStoryRunIntegrity"].forEach(name=>{
   if(typeof window[name]!=="function")fail("STORY_RUNTIME_GM_METHOD",`${name} 未載入`);
  });
  if(Number(window.GM_STORY_TEST_VERSION)<3)fail("STORY_RUNTIME_GM_VERSION","GM_STORY_TEST_VERSION 未達目前需求",window.GM_STORY_TEST_VERSION);

  const regions=typeof WORLD_REGIONS!=="undefined"&&Array.isArray(WORLD_REGIONS)?WORLD_REGIONS:[];
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

  if(migration&&progress&&regions.length&&typeof progress.bossStoryId==="function"){
   const testRegion=regions[regions.length-1];
   const testMap=Number(testRegion?.mapStart);
   const testId=progress.bossStoryId(testMap);
   if(Number.isInteger(testMap)&&testId&&stories[testId]){
    const mapIndexForStory=id=>{
     for(const region of regions){
      const start=Number(region.mapStart),end=Number(region.mapEnd);
      for(let i=start;i<=end;i++)if(progress.bossStoryId(i)===id)return i;
     }
     return null;
    };
    const migrationOptions={introStoryId:"earth-prologue",regions:window.CIVILIZATION_STORY_REGIONS||[],stories,bossMapIndexForStory:mapIndexForStory};

    const firstClearState={
     bossKilled:[],
     storyProgress:{pendingStory:null,completedStories:[],introCompleted:true,starterGearReceived:true,historyBackfillRegions:[]},
     introSeen:true
    };
    firstClearState.bossKilled[testMap]=true;
    migration.migrate(firstClearState,{...migrationOptions,skipBackfill:true});
    if(firstClearState.storyProgress.completedStories.includes(testId))fail("STORY_RUNTIME_FIRST_CLEAR_PREFILL","首殺排隊前的保護模式仍會把當次首領故事回填成已完成",testId);
    firstClearState.storyProgress.pendingStory=testId;
    migration.migrate(firstClearState,migrationOptions);
    if(firstClearState.storyProgress.completedStories.includes(testId))fail("STORY_RUNTIME_PENDING_BACKFILL","pendingStory 不應被歷史回填標成已完成",testId);
    if(firstClearState.storyProgress.pendingStory!==testId)fail("STORY_RUNTIME_PENDING_LOST","歷史回填後 pendingStory 不應遺失",testId);

    const premarkedRepairState={
     bossKilled:[],
     storyProgress:{pendingStory:null,completedStories:[],introCompleted:true,starterGearReceived:true,historyBackfillRegions:[String(testRegion?.id||"")]},
     introSeen:true
    };
    premarkedRepairState.bossKilled[testMap]=true;
    migration.migrate(premarkedRepairState,migrationOptions);
    if(!premarkedRepairState.storyProgress.completedStories.includes(testId))fail("STORY_RUNTIME_PREMARKED_REPAIR_FAILED","已標記回填過的區域仍必須能補回缺失的已擊敗首領劇情",testId);

    const futureState={
     bossKilled:[],
     storyProgress:{pendingStory:null,completedStories:[],introCompleted:true,starterGearReceived:true,historyBackfillRegions:[]},
     introSeen:true
    };
    migration.migrate(futureState,migrationOptions);
    if(futureState.storyProgress.historyBackfillRegions.includes(String(testRegion?.id||"")))fail("STORY_RUNTIME_FUTURE_REGION_PREMARKED","尚未擊敗任何首領的區域不應被提前標記為已回填",testRegion?.id);
   }
  }

  if(typeof state!=="undefined"&&state&&progress&&typeof progress.get==="function"){
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