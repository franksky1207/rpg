(function(){
 const VERSION=12;
 function run(){
  const errors=[],warnings=[],fail=(code,message,data=null)=>errors.push({code,message,data});
  const data=window.runCivilizationStoryIntegrity?.();
  if(!data||data.passed!==true)fail("STORY_RUNTIME_DATA_INTEGRITY_FAILED","正式劇情資料完整性檢查未通過",data?.errors||[]);
  if(Number(data?.galaxyStories)!==101)fail("STORY_RUNTIME_GALAXY_COUNT",`銀河紀元必須維持 101 篇，實際 ${Number(data?.galaxyStories)||0}`);
  if(Number(data?.universeStoriesExpected)!==100)fail("STORY_RUNTIME_UNIVERSE_REGISTRY_COUNT",`宇宙紀元 Registry 必須為 100 篇，實際 ${Number(data?.universeStoriesExpected)||0}`);
  if(window.UNIVERSE_STORY_REGISTRY_READY!==true)fail("STORY_RUNTIME_UNIVERSE_REGISTRY_READY","宇宙紀元 10 區／100 Boss Registry 未就緒");

  if(Number(window.CIVILIZATION_STORY_ERA_REGISTRY_VERSION)!==1)fail("STORY_RUNTIME_SHARED_ERA_REGISTRY","三紀元共用 Story Era Registry owner 未就緒");
  const eraIds=typeof window.getCivilizationStoryEraIds==="function"?Array.from(window.getCivilizationStoryEraIds()):[];
  if(JSON.stringify(eraIds)!==JSON.stringify(["galaxy","universe","higher-dimensional"]))fail("STORY_RUNTIME_ERA_ORDER","Story Era Registry 應依序包含銀河／宇宙／高維",eraIds);
  if(window.CIVILIZATION_STORY_ERA_REGISTRY_INTEGRITY?.passed!==true)fail("STORY_RUNTIME_ERA_REGISTRY_INTEGRITY","Story Era Registry 自我檢查失敗",window.CIVILIZATION_STORY_ERA_REGISTRY_INTEGRITY||null);
  ["galaxy","universe","higher-dimensional"].forEach(id=>{if(typeof window.getCivilizationStoryEra?.(id)?.regions!=="function")fail("STORY_RUNTIME_ERA_DEFINITION",`Story Era 缺少 regions owner：${id}`);});

  const triggers=typeof window.thirdWorldStoryTriggerDescriptors==="function"?Array.from(window.thirdWorldStoryTriggerDescriptors()):[];
  const milestones=triggers.filter(row=>row?.kind==="milestone"),finals=triggers.filter(row=>row?.kind==="final"),intros=triggers.filter(row=>row?.kind==="intro");
  if(Number(window.THIRD_WORLD_STORY_TRIGGER_REGISTRY_VERSION)!==1||Number(window.THIRD_WORLD_STORY_TRIGGER_POLICY_VERSION)!==1||triggers.length!==11||intros.length!==1||milestones.length!==9||finals.length!==1)fail("STORY_RUNTIME_THIRD_WORLD_TRIGGER_SHAPE","高維 Trigger Registry 必須為序章 1＋900～100% milestone 9＋0% final 1",triggers);
  const expectedStages=[1,2,3,4,5,6,7,8,9];
  if(JSON.stringify(milestones.map(row=>row.stage))!==JSON.stringify(expectedStages))fail("STORY_RUNTIME_THIRD_WORLD_MILESTONE_STAGES","高維 milestone stage 必須為 1～9",milestones);
  const expectedThresholds=expectedStages.map(stage=>Number(window.thirdWorldTitleDefinition?.(stage)?.thresholdRemainingPercentSum));
  if(JSON.stringify(milestones.map(row=>row.thresholdRemainingPercentSum))!==JSON.stringify(expectedThresholds))fail("STORY_RUNTIME_THIRD_WORLD_THRESHOLD_OWNER","高維 milestone 門檻必須直接對齊 thirdWorldTitleDefinition owner",{actual:milestones.map(row=>row.thresholdRemainingPercentSum),expected:expectedThresholds});
  const final=finals[0]||null,finalThreshold=Number(window.thirdWorldTitleDefinition?.(10)?.thresholdRemainingPercentSum);
  if(final?.stage!==10||final?.thresholdRemainingPercentSum!==finalThreshold||milestones.some(row=>row.stage===10))fail("STORY_RUNTIME_THIRD_WORLD_FINAL_STAGE10","stage 10／0% 必須只對應 final，不得再有第 10 段 milestone",final);
  if(triggers.some(row=>row.contentReady!==false))fail("STORY_RUNTIME_THIRD_WORLD_CONTENT_PLACEHOLDER","第 12-1 批 Trigger Descriptor 只能是技術 placeholder，不得宣告正式內容已就緒");

  if(typeof window.openStory!=="function"||typeof window.isStoryOpen!=="function")fail("STORY_RUNTIME_UI_MISSING","共用正式劇情視窗未完整載入");
  const progress=window.civilizationStoryProgress;
  ["normalize","resume","get","setPending","completeStory","queueBossStory","queueUniverseBossStory","bossStoryId","universeBossStoryId","universeBossIndexForStory","completedStories"].forEach(name=>{if(typeof progress?.[name]!=="function")fail("STORY_RUNTIME_PROGRESS_METHOD",`civilizationStoryProgress.${name} 未載入`);});
  if(Number(window.UNIVERSE_STORY_FIRST_CLEAR_HOOK_VERSION)!==1)fail("STORY_RUNTIME_UNIVERSE_FIRST_CLEAR_HOOK","宇宙紀元首次擊破劇情 hook 未載入");
  ["replayCompletedStory","storyRecordPageHtml","selectStoryRecordRegion","prepareStoryRecordEntry","setStoryRecordEraView"].forEach(name=>{if(typeof window[name]!=="function")fail("STORY_RUNTIME_RECORD_METHOD",`${name} 未載入`);});
  ["gmStoryTestHtml","gmStoryChangeEra","gmPreviewStory","gmStoryMoveRegion","gmStoryMoveEntry","gmStoryRunIntegrity"].forEach(name=>{if(typeof window[name]!=="function")fail("STORY_RUNTIME_GM_METHOD",`${name} 未載入`);});

  const universeBosses=Array.isArray(window.SECOND_WORLD_BOSSES)?window.SECOND_WORLD_BOSSES:[],universeIds=new Set();
  universeBosses.forEach((boss,index)=>{
   const id=progress?.universeBossStoryId?.(index);
   if(!id)fail("STORY_RUNTIME_UNIVERSE_MAPPING_EMPTY",`宇宙 Boss ${index} 無故事 id`);else universeIds.add(id);
   const reverse=progress?.universeBossIndexForStory?.(id);
   if(reverse!==index)fail("STORY_RUNTIME_UNIVERSE_MAPPING_REVERSE",`${id} 反向對應錯誤`,{expected:index,actual:reverse});
   if(Number(boss.level)!==505+index*5)fail("STORY_RUNTIME_UNIVERSE_LEVEL_SEQUENCE",`宇宙 Boss ${index} 等級序列錯誤`);
  });
  if(universeIds.size!==100)fail("STORY_RUNTIME_UNIVERSE_MAPPING_COUNT",`宇宙紀元應有 100 個唯一故事對應，實際 ${universeIds.size}`);
  if(typeof state!=="undefined"&&state&&progress?.get){
   try{
    const before=JSON.stringify(state.storyProgress??null),p=progress.get();
    if(JSON.stringify(state.storyProgress??null)!==before)fail("STORY_RUNTIME_PROGRESS_GET_MUTATED","讀取故事進度時不應修改 storyProgress");
    if(p?.pendingStory&&!window.CIVILIZATION_STORIES?.[p.pendingStory])fail("STORY_RUNTIME_PENDING_UNKNOWN",`pendingStory 找不到正式資料：${p.pendingStory}`);
   }catch(error){fail("STORY_RUNTIME_PROGRESS_GET_FAILED","讀取故事進度時發生錯誤",String(error?.message||error));}
  }
  const report={passed:errors.length===0,version:VERSION,checkedAt:Date.now(),dataIntegrityPassed:data?.passed===true,galaxyStories:Number(data?.galaxyStories)||0,universeRegistry:universeIds.size,universeStoriesLoaded:Number(data?.universeStoriesLoaded)||0,targetStories:201,eraIds,thirdWorldTriggerCount:triggers.length,firstClearHook:Number(window.UNIVERSE_STORY_FIRST_CLEAR_HOOK_VERSION)||0,errors,warnings};
  window.STORY_RUNTIME_INTEGRITY_REPORT=report;
  if(!report.passed)console.error("[文明戰線] 劇情執行期完整性檢查失敗",report);else console.info("[文明戰線] 劇情執行期完整性檢查通過",report);
  return report;
 }
 window.STORY_RUNTIME_INTEGRITY_VERSION=VERSION;
 window.runCivilizationStoryRuntimeIntegrity=run;
 run();
})();