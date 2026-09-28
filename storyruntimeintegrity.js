(function(){
 const VERSION=23;
 const LEGACY_REFERENCE_RECOVERY_VERSION=1;
 const expectedThirdWorldIds=Object.freeze(["higher-dimensional-intro",...Array.from({length:9},(_,index)=>`higher-dimensional-milestone-${String(index+1).padStart(2,"0")}`),"higher-dimensional-final"]);
 const expectedReadyThirdWorldIds=Object.freeze(["higher-dimensional-intro","higher-dimensional-milestone-01","higher-dimensional-milestone-02","higher-dimensional-milestone-03","higher-dimensional-milestone-04","higher-dimensional-milestone-05","higher-dimensional-milestone-06","higher-dimensional-milestone-07","higher-dimensional-milestone-08","higher-dimensional-milestone-09"]);
 function run(){
  const errors=[],warnings=[],fail=(code,message,data=null)=>errors.push({code,message,data});
  const data=window.runCivilizationStoryIntegrity?.();
  if(!data||data.passed!==true)fail("STORY_RUNTIME_DATA_INTEGRITY_FAILED","正式劇情資料完整性檢查未通過",data?.errors||[]);
  if(Number(data?.galaxyStories)!==101)fail("STORY_RUNTIME_GALAXY_COUNT",`銀河紀元必須維持 101 篇，實際 ${Number(data?.galaxyStories)||0}`);
  if(Number(data?.universeStoriesExpected)!==100||Number(data?.universeStoriesLoaded)!==100)fail("STORY_RUNTIME_UNIVERSE_COUNT","宇宙紀元必須維持 100/100 正式劇情",data);
  if(Number(data?.thirdWorldStoriesExpected)!==11||Number(data?.thirdWorldStoriesLoaded)!==10)fail("STORY_RUNTIME_THIRD_WORLD_COUNT","第 13-6 批高維紀元正式內容必須為 10/11（序章＋Stage 1～9）",data);
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
  const readyIds=triggers.filter(row=>row.contentReady===true).map(row=>row.storyId);
  if(JSON.stringify(readyIds)!==JSON.stringify(expectedReadyThirdWorldIds))fail("STORY_RUNTIME_THIRD_WORLD_CONTENT_READY_BATCH13_6","第 13-6 批只應啟用序章＋Stage 1～9",readyIds);
  expectedReadyThirdWorldIds.forEach(id=>{const story=window.CIVILIZATION_STORIES?.[id];if(!story||!Array.isArray(story.pages)||!story.pages.length)fail("STORY_RUNTIME_THIRD_WORLD_STORY_MISSING",`已上線高維正式劇情缺少資料：${id}`);});
  expectedThirdWorldIds.filter(id=>!expectedReadyThirdWorldIds.includes(id)).forEach(id=>{if(window.CIVILIZATION_STORIES?.[id])fail("STORY_RUNTIME_THIRD_WORLD_PLACEHOLDER_LOADED",`尚未上線高維故事不得進正式 runtime catalog：${id}`);});

  if(Number(window.STORY_MIGRATION_VERSION)!==6||Number(window.STORY_REFERENCE_RECOVERY_VERSION)!==1)fail("STORY_RUNTIME_REFERENCE_RECOVERY_OWNER","Story migration reference recovery owner 未就緒");
  try{
   const migration=window.civilizationStoryMigration,stories=window.CIVILIZATION_STORIES||{},universeId=window.universeStoryIdForBossIndex?.(0),options={introStoryId:"earth-prologue",stories,regions:[],skipBackfill:true};
   const probe=(pending,completed)=>({introSeen:true,storyProgress:{pendingStory:pending,completedStories:completed,introCompleted:true,starterGearReceived:true}});
   const galaxy=probe("earth-prologue",["earth-prologue"]);migration?.migrate?.(galaxy,options);if(galaxy.storyProgress.pendingStory!=="earth-prologue")fail("STORY_RUNTIME_VALID_GALAXY_PENDING_REMOVED","合法銀河 pendingStory 不得被清除",galaxy.storyProgress);
   if(universeId&&stories[universeId]){const universe=probe(universeId,["earth-prologue",universeId]);migration?.migrate?.(universe,options);if(universe.storyProgress.pendingStory!==universeId||!universe.storyProgress.completedStories.includes(universeId))fail("STORY_RUNTIME_VALID_UNIVERSE_REFERENCE_REMOVED","合法宇宙 Story reference 不得被清除",universe.storyProgress);}
   const w3=probe("higher-dimensional-milestone-08",["earth-prologue","higher-dimensional-intro","higher-dimensional-milestone-01","higher-dimensional-milestone-02","higher-dimensional-milestone-03","higher-dimensional-milestone-04","higher-dimensional-milestone-05","higher-dimensional-milestone-06","higher-dimensional-milestone-07"]);migration?.migrate?.(w3,options);if(w3.storyProgress.pendingStory!=="higher-dimensional-milestone-08")fail("STORY_RUNTIME_VALID_THIRD_WORLD_REFERENCE_REMOVED","已上線高維 Story reference 不得被清除",w3.storyProgress);
   const placeholder=probe("higher-dimensional-final",["earth-prologue",...expectedReadyThirdWorldIds,"higher-dimensional-final"]);migration?.migrate?.(placeholder,options);if(placeholder.storyProgress.pendingStory!==null||placeholder.storyProgress.completedStories.includes("higher-dimensional-final"))fail("STORY_RUNTIME_PLACEHOLDER_PENDING_NOT_CLEANED","尚未上線高維 Story reference 應保持 fail-closed",placeholder.storyProgress);
   const stale=probe("retired-story-probe",["earth-prologue","retired-story-probe"]);migration?.migrate?.(stale,options);if(stale.storyProgress.pendingStory!==null||stale.storyProgress.completedStories.includes("retired-story-probe"))fail("STORY_RUNTIME_STALE_REFERENCE_NOT_CLEANED","退休 Story reference 應於正式 catalog 可用時清除",stale.storyProgress);
  }catch(error){fail("STORY_RUNTIME_REFERENCE_RECOVERY_FAILED","Story reference recovery regression 發生錯誤",String(error?.message||error));}

  if(typeof window.openStory!=="function"||typeof window.isStoryOpen!=="function"||typeof window.waitForStoryClosed!=="function"||typeof window.activeStoryLifecycleSnapshot!=="function"||Number(window.STORY_UI_VERSION)!==10||Number(window.STORY_UI_LIFECYCLE_WAIT_VERSION)!==2||Number(window.STORY_UI_INSTANCE_IDENTITY_VERSION)!==1)fail("STORY_RUNTIME_UI_MISSING","共用正式劇情視窗／identity lifecycle wait owner 未完整載入");
  const progress=window.civilizationStoryProgress;
  ["normalize","resume","get","setPending","completeStory","queueStory","queueBossStory","queueUniverseBossStory","thirdWorldStoryCompletionGate","applyThirdWorldStoryCompletion","reconcileThirdWorldStoryCompletionState","storyPendingArbitration","runBehaviorRegression","thirdWorldEligibility","nextThirdWorldStory","queueThirdWorldEligibleStory","thirdWorldCompletionFramework","consumeThirdWorldSettlement","drainThirdWorldPostFlowStories","bossStoryId","universeBossStoryId","universeBossIndexForStory","completedStories"].forEach(name=>{if(typeof progress?.[name]!=="function")fail("STORY_RUNTIME_PROGRESS_METHOD",`civilizationStoryProgress.${name} 未載入`);});
  if(Number(window.CIVILIZATION_STORY_PROGRESS_VERSION)!==17||Number(window.STORY_NORMALIZATION_CONVERGENCE_VERSION)!==1||Number(window.STORY_PENDING_ARBITRATION_VERSION)!==1||Number(window.STORY_PROGRESS_BEHAVIOR_REGRESSION_VERSION)!==1||Number(window.THIRD_WORLD_STORY_COMPLETION_OWNER_VERSION)!==1||Number(window.THIRD_WORLD_STORY_QUEUE_VERSION)!==1||Number(window.THIRD_WORLD_STORY_POST_FLOW_DRAIN_VERSION)!==1||Number(window.THIRD_WORLD_STORY_SETTLEMENT_BRIDGE_VERSION)!==1||Number(window.THIRD_WORLD_STORY_COMPLETION_FRAMEWORK_VERSION)!==1||Number(window.THIRD_WORLD_STORY_ELIGIBILITY_VERSION)!==1||Number(window.THIRD_WORLD_STORY_RELOAD_RECOVERY_VERSION)!==1||Number(window.THIRD_WORLD_STORY_PLACEHOLDER_GUARD_VERSION)!==1)fail("STORY_RUNTIME_THIRD_WORLD_QUEUE_VERSION","高維共用 Story Queue／Eligibility／Reload Recovery owner 版本未就緒");
  if(typeof window.thirdWorldStoryEligibilitySnapshot!=="function"||typeof window.nextThirdWorldStoryCandidate!=="function"||typeof window.queueThirdWorldEligibleStory!=="function")fail("STORY_RUNTIME_THIRD_WORLD_QUEUE_API","高維共用 Story Queue API 未完整載入");
  if(Number(window.UNIVERSE_STORY_FIRST_CLEAR_HOOK_VERSION)!==1)fail("STORY_RUNTIME_UNIVERSE_FIRST_CLEAR_HOOK","宇宙紀元首次擊破劇情 hook 未載入");
  ["replayCompletedStory","storyRecordPageHtml","selectStoryRecordRegion","prepareStoryRecordEntry","setStoryRecordEraView"].forEach(name=>{if(typeof window[name]!=="function")fail("STORY_RUNTIME_RECORD_METHOD",`${name} 未載入`);});
  ["gmStoryTestHtml","gmStoryChangeEra","gmPreviewStory","gmStoryMoveRegion","gmStoryMoveEntry","gmStoryRunIntegrity"].forEach(name=>{if(typeof window[name]!=="function")fail("STORY_RUNTIME_GM_METHOD",`${name} 未載入`);});

  if(typeof progress?.thirdWorldEligibility==="function"){
   try{
    const blankCompleted={thirdWorld:{entered:true,bosses:Array.from({length:10},()=>({currentHp:0})),story:{introSeen:false,unlockedStage:10,finalSeen:false}},storyProgress:{pendingStory:null,completedStories:[],introCompleted:true,starterGearReceived:true}};
    const before=JSON.stringify(blankCompleted),snapshot=progress.thirdWorldEligibility(blankCompleted);
    if(JSON.stringify(blankCompleted)!==before)fail("STORY_RUNTIME_THIRD_WORLD_ELIGIBILITY_MUTATED","高維 eligibility snapshot 必須是純讀取，不得修改傳入 state");
    if(snapshot?.rows?.length!==11||snapshot?.nextEligibleId!=="higher-dimensional-intro"||snapshot?.nextQueueableId!=="higher-dimensional-intro")fail("STORY_RUNTIME_THIRD_WORLD_RECOVERY_ORDER","reload recovery 應從首個未完成且已上線高維故事開始",snapshot);
    if(snapshot?.rows?.filter(row=>row.queueable).length!==10)fail("STORY_RUNTIME_THIRD_WORLD_BATCH13_6_QUEUE_COUNT","第 13-6 批最多只能有 10 篇已上線高維故事可 queue",snapshot);
    const partial={thirdWorld:{entered:true,bosses:Array.from({length:10},()=>({currentHp:1100000000})),story:{introSeen:true,unlockedStage:9,finalSeen:false}},storyProgress:{pendingStory:null,completedStories:["higher-dimensional-intro","higher-dimensional-milestone-01","higher-dimensional-milestone-02","higher-dimensional-milestone-03","higher-dimensional-milestone-04","higher-dimensional-milestone-05","higher-dimensional-milestone-06","higher-dimensional-milestone-07"],introCompleted:true,starterGearReceived:true}};
    const partialSnapshot=progress.thirdWorldEligibility(partial);
    if(partialSnapshot?.nextEligibleId!=="higher-dimensional-milestone-08"||partialSnapshot?.nextQueueableId!=="higher-dimensional-milestone-08")fail("STORY_RUNTIME_THIRD_WORLD_SEQUENTIAL_RECOVERY","已完成序章至第七段後，reload recovery 應按順序指向第八段正式內容",partialSnapshot);
    if(partialSnapshot?.rows?.find(row=>row.kind==="final")?.eligible===true)fail("STORY_RUNTIME_THIRD_WORLD_FINAL_GATE","十名高維存在尚未全數擊破時 final 不得 eligible",partialSnapshot);
    const firstTenDone={thirdWorld:{entered:true,bosses:Array.from({length:10},()=>({currentHp:0})),story:{introSeen:true,unlockedStage:10,finalSeen:false}},storyProgress:{pendingStory:null,completedStories:[...expectedReadyThirdWorldIds],introCompleted:true,starterGearReceived:true}};
    const gated=progress.thirdWorldEligibility(firstTenDone);
    if(gated?.nextEligibleId!=="higher-dimensional-final"||gated?.nextQueueableId!==null||gated?.rows?.find(row=>row.storyId==="higher-dimensional-final")?.queueable===true)fail("STORY_RUNTIME_THIRD_WORLD_PLACEHOLDER_QUEUED","Final 尚未上線時可保留 eligibility，但不得進正式 queue",gated);
    const completion=progress.thirdWorldCompletionFramework?.(blankCompleted);
    if(completion?.completionReady!==true||completion?.finalEligible!==true||completion?.finalQueueable!==false||completion?.storedCompleted!==false)fail("STORY_RUNTIME_THIRD_WORLD_COMPLETION_READY","十名高維存在全數擊破＋stage10 可達 completion-ready，但 Final 未上線前不得 queue 或自動 completed",completion);
    const beforeCompletion=JSON.stringify(blankCompleted);progress.thirdWorldCompletionFramework?.(blankCompleted);if(JSON.stringify(blankCompleted)!==beforeCompletion)fail("STORY_RUNTIME_THIRD_WORLD_COMPLETION_MUTATED","Completion Framework 必須純推導，不得修改正式 state");
   }catch(error){fail("STORY_RUNTIME_THIRD_WORLD_ELIGIBILITY_FAILED","高維 queue eligibility regression 發生錯誤",String(error?.message||error));}
  }
  try{const regression=progress?.runBehaviorRegression?.();if(!regression||regression.passed!==true)fail("STORY_RUNTIME_PROGRESS_BEHAVIOR_REGRESSION_FAILED","Story Progress behavioral regression failed",regression||null);}catch(error){fail("STORY_RUNTIME_PROGRESS_BEHAVIOR_REGRESSION_ERROR","Story Progress behavioral regression threw",String(error?.message||error));}

  const universeBosses=Array.isArray(window.SECOND_WORLD_BOSSES)?window.SECOND_WORLD_BOSSES:[],universeIds=new Set();
  universeBosses.forEach((boss,index)=>{const id=progress?.universeBossStoryId?.(index);if(!id)fail("STORY_RUNTIME_UNIVERSE_MAPPING_EMPTY",`宇宙 Boss ${index} 無故事 id`);else universeIds.add(id);const reverse=progress?.universeBossIndexForStory?.(id);if(reverse!==index)fail("STORY_RUNTIME_UNIVERSE_MAPPING_REVERSE",`${id} 反向對應錯誤`,{expected:index,actual:reverse});if(Number(boss.level)!==505+index*5)fail("STORY_RUNTIME_UNIVERSE_LEVEL_SEQUENCE",`宇宙 Boss ${index} 等級序列錯誤`);});
  if(universeIds.size!==100)fail("STORY_RUNTIME_UNIVERSE_MAPPING_COUNT",`宇宙紀元應有 100 個唯一故事對應，實際 ${universeIds.size}`);
  if(typeof state!=="undefined"&&state&&progress?.get){try{const before=JSON.stringify(state.storyProgress??null),p=progress.get();if(JSON.stringify(state.storyProgress??null)!==before)fail("STORY_RUNTIME_PROGRESS_GET_MUTATED","讀取故事進度時不應修改 storyProgress");if(p?.pendingStory&&!window.CIVILIZATION_STORIES?.[p.pendingStory])fail("STORY_RUNTIME_PENDING_UNKNOWN",`pendingStory 找不到正式資料：${p.pendingStory}`);}catch(error){fail("STORY_RUNTIME_PROGRESS_GET_FAILED","讀取故事進度時發生錯誤",String(error?.message||error));}}
  const report={passed:errors.length===0,version:VERSION,checkedAt:Date.now(),dataIntegrityPassed:data?.passed===true,galaxyStories:Number(data?.galaxyStories)||0,universeRegistry:universeIds.size,universeStoriesLoaded:Number(data?.universeStoriesLoaded)||0,thirdWorldStoriesLoaded:Number(data?.thirdWorldStoriesLoaded)||0,targetStories:211,eraIds,thirdWorldTriggerCount:triggers.length,thirdWorldQueueVersion:Number(window.THIRD_WORLD_STORY_QUEUE_VERSION)||0,firstClearHook:Number(window.UNIVERSE_STORY_FIRST_CLEAR_HOOK_VERSION)||0,errors,warnings};
  window.STORY_RUNTIME_INTEGRITY_REPORT=report;if(!report.passed)console.error("[文明戰線] 劇情執行期完整性檢查失敗",report);else console.info("[文明戰線] 劇情執行期完整性檢查通過",report);return report;
 }
 window.STORY_RUNTIME_INTEGRITY_VERSION=VERSION;window.STORY_RUNTIME_LEGACY_REFERENCE_RECOVERY_VERSION=LEGACY_REFERENCE_RECOVERY_VERSION;window.runCivilizationStoryRuntimeIntegrity=run;run();
})();
