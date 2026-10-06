(function(){
 const errors=[];
 const fail=(code,message,detail=null)=>errors.push({code,message,detail});
 const levels=value=>Object.fromEntries((window.SPECIALIZATION_KEYS||[]).map(key=>[key,value]));
 try{
  if(Number(window.GM_BATCH16_FORMAL_CONTROLS_VERSION)!==1)fail("FORMAL_UI_OWNER","第16批正式控制 owner 未載入");
  if(Number(window.GM_BATCH16_FIXED_VALUE_UI_VERSION)<2)fail("FIXED_VALUE_UI_VERSION","固定值 UI owner 未載入");
  if(typeof window.gmBatch16FormalWorldPhase!=="function")fail("PHASE_API","第16批正式紀元判定 API 未載入");
  const galaxy={secondWorld:{entered:false},thirdWorld:{entered:false},specializations:levels(0),enhancement:{levels:{weapon:0,helmet:0,armor:0,shoes:0,accessory:0}}};
  const universe={secondWorld:{entered:true,civilizationLevel:5},thirdWorld:{entered:false},specializations:levels(60),enhancement:{levels:{weapon:20,helmet:25,armor:30,shoes:35,accessory:40}}};
  const higher={secondWorld:{entered:true,civilizationLevel:0},thirdWorld:{entered:true},specializations:levels(60),enhancement:{levels:{weapon:40,helmet:40,armor:40,shoes:40,accessory:40}}};

  if(window.gmBatch16FormalWorldPhase?.(galaxy)!==1||window.gmBatch16FormalWorldPhase?.(universe)!==2||window.gmBatch16FormalWorldPhase?.(higher)!==3)fail("PHASE_PROBE","第16批三紀元判定異常");

  if(typeof window.specializationFormalStateIssues!=="function")fail("SPEC_API","專精正式狀態 API 未載入");
  else{
   if(window.specializationFormalStateIssues(galaxy).length!==0)fail("SPEC_W1","銀河紀元專精 Lv0 應合法");
   if(window.specializationFormalStateIssues(universe).length!==0)fail("SPEC_W2","宇宙紀元專精全 Lv60 應合法");
   if(window.specializationFormalStateIssues(higher).length!==0)fail("SPEC_W3","高維紀元專精全 Lv60 應合法");
   const low={...higher,specializations:{...higher.specializations,training:59}};
   if(!window.specializationFormalStateIssues(low).some(row=>row?.code==="LEVEL_BELOW_FORMAL_MIN"&&row?.key==="training"))fail("SPEC_W3_LOW","高維紀元專精 Lv59 未被正式規則拒絕");
  }

  if(typeof window.effectiveEnhancementMin!=="function"||typeof window.effectiveEnhancementCap!=="function")fail("ENH_API","強化正式範圍 API 未載入");
  else{
   if(window.effectiveEnhancementMin(galaxy)!==0||window.effectiveEnhancementCap(galaxy)!==20)fail("ENH_W1","銀河強化正式範圍不是 +0～+20");
   if(window.effectiveEnhancementMin(universe)!==20||window.effectiveEnhancementCap(universe)!==40)fail("ENH_W2","宇宙強化正式範圍不是 +20～+40");
   if(window.effectiveEnhancementMin(higher)!==40||window.effectiveEnhancementCap(higher)!==40)fail("ENH_W3","高維強化正式範圍不是固定 +40");
  }

  if(typeof window.gmFormalMarkMinimum!=="function")fail("MARK_API","印記正式紀元鎖定 API 未載入");
  else{
   if(window.gmFormalMarkMinimum(galaxy)!==0)fail("MARK_W1","銀河正式印記最低值應為 0");
   if(window.gmFormalMarkMinimum(universe)!==10)fail("MARK_W2","宇宙正式印記應固定 Lv10");
   if(window.gmFormalMarkMinimum(higher)!==10)fail("MARK_W3","高維正式印記應固定 Lv10");
  }

  if(typeof window.formalCivilizationRange!=="function")fail("CIV_API","文明等級正式範圍 API 未載入");
  else{
   const w1=window.formalCivilizationRange(galaxy),w2=window.formalCivilizationRange(universe),w3=window.formalCivilizationRange(higher);
   if(w1?.enabled!==false)fail("CIV_W1","銀河紀元不應啟用文明等級管理",w1);
   if(w2?.enabled!==true||w2?.min!==0||w2?.max!==10||w2?.fixed!==false)fail("CIV_W2","宇宙文明等級正式範圍不是 Lv0～10",w2);
   if(w3?.enabled!==true||w3?.min!==10||w3?.max!==10||w3?.fixed!==true)fail("CIV_W3","高維文明等級不是固定 Lv10",w3);
  }

  if(Number(window.GM_MANAGEMENT_PHASE_POLICY_VERSION)!==1||typeof window.gmGeneralManagementPolicy!=="function")fail("GM_PHASE_POLICY_API","GM 管理頁紀元政策未載入");
  else{
   const w1=window.gmGeneralManagementPolicy(galaxy),w2=window.gmGeneralManagementPolicy(universe),w3=window.gmGeneralManagementPolicy(higher);
   if(w1?.phase!==1||w1?.resourceKind!=="gold"||w1?.progressKind!=="galaxy"||JSON.stringify(w1?.gearWorlds)!==JSON.stringify([1]))fail("GM_PHASE_POLICY_W1","W1 管理政策不符",w1);
   if(w2?.phase!==2||w2?.resourceKind!=="universe"||w2?.progressKind!=="universe"||JSON.stringify(w2?.gearWorlds)!==JSON.stringify([1,2]))fail("GM_PHASE_POLICY_W2","W2 管理政策不符",w2);
   if(w3?.phase!==3||w3?.resourceKind!=="dimensional-strings"||w3?.progressKind!=="higher"||JSON.stringify(w3?.gearWorlds)!==JSON.stringify([1,2,3]))fail("GM_PHASE_POLICY_W3","W3 管理政策不符",w3);
  }
  if(typeof window.gmHubManageSectionVisible!=="function")fail("GM_SECTION_VISIBILITY_API","GM 管理區塊紀元顯示 API 未載入");
  else{
   if(window.gmHubManageSectionVisible("civilization-manage",galaxy)!==false)fail("CIV_SECTION_W1","W1 不應顯示文明等級管理");
   if(window.gmHubManageSectionVisible("civilization-manage",universe)!==true||window.gmHubManageSectionVisible("civilization-manage",higher)!==true)fail("CIV_SECTION_W23","W2/W3 應顯示文明等級管理");
   if(window.gmHubManageSectionVisible("general-manage",galaxy)!==true)fail("GENERAL_SECTION_VISIBILITY","角色管理不應被紀元隱藏");
  }
  if(Number(window.GM_DUNGEON_MIRROR_MANAGEMENT_WIRING_VERSION)!==1||typeof window.gmDungeonManagementHtml!=="function")fail("DUNGEON_MIRROR_MANAGEMENT_WIRING","副本管理未接上鏡像正式管理 renderer",{version:window.GM_DUNGEON_MIRROR_MANAGEMENT_WIRING_VERSION,renderer:typeof window.gmDungeonManagementHtml});
  else{
   const html=String(window.gmDungeonManagementHtml()||"");
   if(typeof window.gmMirrorManagementHtml==="function"&&!html.includes("GM・鏡像戰正式紀錄介入"))fail("DUNGEON_MIRROR_MANAGEMENT_RENDER","副本管理未顯示 GM 鏡像正式紀錄介入",html);
  }
  if(Number(window.GM_DUNGEON_PHASE_COPY_VERSION)!==1||typeof window.gmDungeonManagementNoteForPhase!=="function")fail("DUNGEON_PHASE_COPY_API","副本管理紀元文案 owner 未載入");
  else{
   const n1=String(window.gmDungeonManagementNoteForPhase(1)||""),n2=String(window.gmDungeonManagementNoteForPhase(2)||""),n3=String(window.gmDungeonManagementNoteForPhase(3)||"");
   if(n1.includes("宇宙")||n1.includes("高維")||!n1.includes("銀河"))fail("DUNGEON_COPY_W1","W1 副本管理不應提前提到未進入紀元",n1);
   if(n2.includes("高維")||!n2.includes("銀河")||!n2.includes("宇宙"))fail("DUNGEON_COPY_W2","W2 副本管理文案應只涵蓋銀河／宇宙",n2);
   if(!n3.includes("銀河")||!n3.includes("宇宙")||!n3.includes("高維"))fail("DUNGEON_COPY_W3","W3 副本管理文案應涵蓋三紀元",n3);
  }

  if(Number(window.GM_SECOND_WORLD_PROGRESS_MANAGEMENT_VERSION)!==1||typeof window.gmApplySecondWorldProgressCount!=="function"||typeof window.gmSetSecondWorldProgress!=="function")fail("GM_W2_PROGRESS_API","宇宙紀元正式進度管理 owner 未載入");
  else{
   const ids=Array.from({length:100},(_,index)=>window.universeStoryIdForBossIndex?.(index)).filter(Boolean);
   const probe={level:600,secondWorld:{entered:true,civilizationLevel:5,mainline:{bossKilled:Array(100).fill(false)},calamities:[]},thirdWorld:{entered:false},storyProgress:{pendingStory:ids[50]||null,completedStories:["earth-prologue"]}};
   const result=window.gmApplySecondWorldProgressCount(20,probe);
   const completed=new Set(probe.storyProgress.completedStories);
   if(result?.ok!==true||window.gmSecondWorldProgressSnapshot?.(probe)?.completedBosses!==20)fail("GM_W2_PROGRESS_APPLY","宇宙進度 20/100 套用失敗",result);
   if(probe.secondWorld.mainline.bossKilled.slice(0,20).some(v=>v!==true)||probe.secondWorld.mainline.bossKilled.slice(20).some(v=>v===true))fail("GM_W2_PROGRESS_PREFIX","宇宙 bossKilled 必須保持連續前綴");
   if(ids.length!==100||ids.slice(0,20).some(id=>!completed.has(id))||ids.slice(20).some(id=>completed.has(id))||!completed.has("earth-prologue"))fail("GM_W2_PROGRESS_STORY","宇宙 Story completion 未與主線同步");
   if(probe.storyProgress.pendingStory!==null)fail("GM_W2_PROGRESS_PENDING","指定進度後不應殘留宇宙 pending story");
   if(probe.secondWorld.civilizationLevel!==5)fail("GM_W2_PROGRESS_CIV_MUTATION","指定宇宙主線進度不得修改文明等級");
   const full={level:1000,secondWorld:{entered:true,civilizationLevel:10,mainline:{bossKilled:Array(100).fill(false)},calamities:[]},thirdWorld:{entered:false},storyProgress:{pendingStory:null,completedStories:[]}};
   const fullResult=window.gmApplySecondWorldProgressCount(100,full),finalId=window.universeStoryIdForBossIndex?.(99);
   if(fullResult?.ok!==true||full.secondWorld.mainline.bossKilled[99]!==true||!full.storyProgress.completedStories.includes(finalId))fail("GM_W2_PROGRESS_FINAL","100/100 必須同步最終 Boss 與最終宇宙故事",fullResult);
  }

  if(Number(window.GM_THIRD_WORLD_PROGRESS_MANAGEMENT_VERSION)!==1||typeof window.gmApplyThirdWorldProgressPercent!=="function"||typeof window.gmSetThirdWorldProgress!=="function")fail("GM_W3_PROGRESS_API","高維紀元正式進度管理 owner 未載入");
  else{
   const descriptors=window.thirdWorldStoryTriggerDescriptors?.()||[],intro=descriptors.find(row=>row.kind==="intro"),final=descriptors.find(row=>row.kind==="final"),introId=String(intro?.storyId||""),finalId=String(final?.storyId||""),thirdTitleIds=Array.from(window.THIRD_WORLD_PLAYER_TITLE_IDS||[]),otherTitle=window.CIVILIZATION_PLAYER_TITLE_IDS?.[0]||null;
   const probe={level:1333,exp:777,secondWorld:{entered:true,civilizationLevel:10},thirdWorld:{entered:true,completed:false,dimensionalStrings:456789,coreLevel:4,coreProgress:123456,bosses:Array.from({length:10},()=>({currentHp:1100000000})),story:{introSeen:true,unlockedStage:0,finalSeen:false}},storyProgress:{pendingStory:descriptors.find(row=>row.kind==="milestone"&&row.stage===8)?.storyId||null,completedStories:["earth-prologue",introId]},titles:{version:1,unlocked:[otherTitle,...thirdTitleIds].filter(Boolean),equipped:thirdTitleIds[9]||null,pendingNotice:thirdTitleIds[8]||null}};
   const before={level:probe.level,exp:probe.exp,strings:probe.thirdWorld.dimensionalStrings,coreLevel:probe.thirdWorld.coreLevel,coreProgress:probe.thirdWorld.coreProgress};
   const half=window.gmApplyThirdWorldProgressPercent(50,probe),halfSnapshot=window.gmThirdWorldProgressSnapshot?.(probe),halfCompleted=new Set(probe.storyProgress.completedStories),halfTitles=new Set(probe.titles.unlocked);
   if(half?.ok!==true||halfSnapshot?.completionPercent!==50||halfSnapshot?.titleTier!==5||halfSnapshot?.storyStage!==5)fail("GM_W3_PROGRESS_HALF","高維 50% 進度未同步 aggregate／Tier／Story Stage",half);
   if(probe.thirdWorld.bosses.some(row=>Number(row.currentHp)!==550000000)||window.thirdWorldBossStage?.(probe.thirdWorld.bosses[0].currentHp,1100000000)!==5)fail("GM_W3_PROGRESS_HP_STAGE","高維 50% 必須讓十王永久 HP 與個別 Stage 同步");
   const expectedMilestones=descriptors.filter(row=>row.kind==="milestone"&&row.stage<=5).map(row=>row.storyId),futureMilestones=descriptors.filter(row=>row.kind==="milestone"&&row.stage>5).map(row=>row.storyId);
   if(!halfCompleted.has(introId)||expectedMilestones.some(id=>!halfCompleted.has(id))||futureMilestones.some(id=>halfCompleted.has(id))||halfCompleted.has(finalId)||!halfCompleted.has("earth-prologue"))fail("GM_W3_PROGRESS_STORY","高維 50% Story completion 未同步");
   if(probe.storyProgress.pendingStory!==null||probe.thirdWorld.completed!==false||probe.thirdWorld.story.finalSeen!==false)fail("GM_W3_PROGRESS_PENDING_FINAL","50% 不應保留高維 pending story 或完成狀態");
   if(thirdTitleIds.slice(0,5).some(id=>!halfTitles.has(id))||thirdTitleIds.slice(5).some(id=>halfTitles.has(id))||(otherTitle&&!halfTitles.has(otherTitle))||probe.titles.equipped!==null||probe.titles.pendingNotice!==null)fail("GM_W3_PROGRESS_TITLES","高維 50% 稱號應同步收斂並保留其他系列稱號");
   if(probe.level!==before.level||probe.exp!==before.exp||probe.thirdWorld.dimensionalStrings!==before.strings||probe.thirdWorld.coreLevel!==before.coreLevel||probe.thirdWorld.coreProgress!==before.coreProgress)fail("GM_W3_PROGRESS_UNRELATED_MUTATION","指定高維進度不得修改等級／EXP／維度之弦／核心養成");
   const full=window.gmApplyThirdWorldProgressPercent(100,probe),fullSnapshot=window.gmThirdWorldProgressSnapshot?.(probe);
   if(full?.ok!==true||probe.thirdWorld.bosses.some(row=>Number(row.currentHp)!==0)||fullSnapshot?.titleTier!==10||fullSnapshot?.storyStage!==10||probe.thirdWorld.completed!==true||probe.thirdWorld.story.finalSeen!==true||!probe.storyProgress.completedStories.includes(finalId))fail("GM_W3_PROGRESS_FINAL","高維 100% 必須同步十王歸零、Tier10、Stage10 與最終故事完成",full);
   const reset=window.gmApplyThirdWorldProgressPercent(0,probe),resetSnapshot=window.gmThirdWorldProgressSnapshot?.(probe),resetCompleted=new Set(probe.storyProgress.completedStories),resetTitles=new Set(probe.titles.unlocked);
   if(reset?.ok!==true||probe.thirdWorld.bosses.some(row=>Number(row.currentHp)!==1100000000)||resetSnapshot?.titleTier!==0||resetSnapshot?.storyStage!==0||probe.thirdWorld.completed!==false||probe.thirdWorld.story.finalSeen!==false)fail("GM_W3_PROGRESS_RESET","高維進度往回調到 0% 未完整收斂",reset);
   if(!resetCompleted.has(introId)||descriptors.filter(row=>row.kind!=="intro").some(row=>resetCompleted.has(row.storyId))||thirdTitleIds.some(id=>resetTitles.has(id))||(otherTitle&&!resetTitles.has(otherTitle)))fail("GM_W3_PROGRESS_RESET_HISTORY","高維回調 0% 必須保留開場故事／其他稱號並移除後續高維里程碑");
  }

  const currentPhase=window.gmBatch16FormalWorldPhase?.();
  if(currentPhase>=2){
   const spec=String(window.gmSpecializationManagementHtml?.()||"");
   if(spec.includes("<select")||spec.includes("套用專精等級")||!spec.includes("gm-formal-fixed-value")||!spec.includes("Lv.60"))fail("SPEC_UI_FIXED","宇宙／高維正式專精 UI 必須是純固定值，不得產生下拉或套用按鈕");
   const mark=String(window.gmMarkManagementHtml?.()||"");
   if(mark.includes("<select")||mark.includes("套用印記狀態")||!mark.includes("gm-formal-fixed-value")||!mark.includes("Lv.10"))fail("MARK_UI_FIXED","宇宙／高維正式印記 UI 必須是純固定值，不得產生下拉或套用按鈕");
   if(currentPhase===3){
    const enhancement=String(window.gmEnhancementManagementHtml?.()||"");
    if(enhancement.includes("<select")||enhancement.includes("套用強化等級")||!enhancement.includes("gm-formal-fixed-value")||!enhancement.includes("+40"))fail("ENH_UI_FIXED","高維正式強化 UI 必須是純固定值");
    const civilization=String(window.gmCivilizationManagementHtml?.()||"");
    if(civilization.includes("<select")||civilization.includes("套用文明等級")||!civilization.includes("gm-formal-fixed-value")||!civilization.includes("Lv.10"))fail("CIV_UI_FIXED","高維正式文明 UI 必須是純固定值");
   }
  }
  const specTest=String(window.gmSpecializationTestHtml?.()||"");
  if(!specTest.includes("Lv.0")||!specTest.includes("Lv.60")||!specTest.includes("<select"))fail("SPEC_SANDBOX","專精 GM 沙盒未保留 Lv0～60 下拉測試");
  const markTest=String(window.gmMarkTestHtml?.()||"");
  if(!markTest.includes("Lv.0")||!markTest.includes("Lv.10")||!markTest.includes("<select"))fail("MARK_SANDBOX","印記 GM 沙盒未保留 Lv0～10 下拉測試");
 }catch(error){fail("EXCEPTION","第16批／GM 三紀元管理完整性檢查執行失敗",String(error?.message||error));}
 const report={version:5,passed:errors.length===0,errors,checkedAt:Date.now()};
 window.GM_BATCH16_INTEGRITY_VERSION=5;
 window.GM_BATCH16_INTEGRITY=report;
 if(errors.length)console.error("[文明戰線] GM Batch16 integrity error",errors);
})();
