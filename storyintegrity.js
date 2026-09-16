(function(){
 const errors=[];
 const fail=(code,message,data=null)=>errors.push({code,message,data});
 const stories=window.CIVILIZATION_STORIES||{};
 const regions=Array.isArray(window.CIVILIZATION_STORY_REGIONS)?window.CIVILIZATION_STORY_REGIONS:[];
 const expectedRegions=Array.isArray(WORLD_REGIONS)?WORLD_REGIONS:[];
 const registeredIds=new Map();
 let bossStoryCount=0;

 function plainText(value){
  if(typeof value==="string")return value;
  if(value&&typeof value==="object"&&typeof value.em==="string")return value.em;
  return "";
 }

 if(expectedRegions.length!==10)fail("STORY_WORLD_REGION_COUNT",`WORLD_REGIONS 應為 10 區，實際 ${expectedRegions.length}`);
 if(regions.length!==10)fail("STORY_REGION_REGISTRY_COUNT",`CIVILIZATION_STORY_REGIONS 應為 10 區，實際 ${regions.length}`);

 for(const worldRegion of expectedRegions){
  const storyRegion=regions.find(r=>r?.id===worldRegion.id);
  if(!storyRegion){fail("STORY_REGION_MISSING",`缺少故事區域：${worldRegion.id}`);continue;}
  const rows=Array.isArray(storyRegion.stories)?storyRegion.stories:[];
  const bossRows=rows.filter(row=>typeof row?.id==="string"&&/-boss-\d+$/.test(row.id));
  if(bossRows.length!==10)fail("STORY_REGION_BOSS_COUNT",`${worldRegion.name} 應有 10 個 Boss 故事，實際 ${bossRows.length}`);

  for(let offset=0;offset<10;offset++){
   const mapIdx=worldRegion.mapStart+offset;
   const expectedId=`${worldRegion.id}-boss-${offset+1}`;
   const map=MAPS?.[mapIdx];
   const expectedBoss=map?.enemies?.[4]?.[0];
   const row=rows.find(x=>x?.id===expectedId);
   const story=stories[expectedId];
   bossStoryCount++;

   if(!map){fail("STORY_MAP_MISSING",`${expectedId} 找不到 map index ${mapIdx}`);continue;}
   if(!expectedBoss){fail("STORY_MAP_BOSS_MISSING",`${expectedId} 找不到正式 Boss 名稱`);continue;}
   if(!row)fail("STORY_REGISTRY_ID_MISSING",`${worldRegion.name} 登錄缺少 ${expectedId}`);
   else{
    if(row.label!==expectedBoss)fail("STORY_REGISTRY_LABEL_MISMATCH",`${expectedId} 登錄名稱應為「${expectedBoss}」，實際「${row.label}」`);
    if(registeredIds.has(expectedId))fail("STORY_REGISTRY_DUPLICATE",`${expectedId} 被重複登錄`);
    registeredIds.set(expectedId,true);
   }
   if(!story){fail("STORY_DATA_MISSING",`缺少故事資料 ${expectedId}`);continue;}
   if(story.id!==expectedId)fail("STORY_ID_MISMATCH",`${expectedId} story.id 不一致`,story.id);
   if(story.title!==expectedBoss)fail("STORY_TITLE_MISMATCH",`${expectedId} title 應為「${expectedBoss}」，實際「${story.title}」`);
   if(story.location!==map.name)fail("STORY_LOCATION_MISMATCH",`${expectedId} location 應為「${map.name}」，實際「${story.location}」`);
   if(typeof story.chapter!=="string"||!story.chapter.includes(worldRegion.name))fail("STORY_CHAPTER_MISMATCH",`${expectedId} chapter 應包含「${worldRegion.name}」，實際「${story.chapter}」`);
   if(!Array.isArray(story.pages)||story.pages.length<7)fail("STORY_PAGE_COUNT",`${expectedId} 頁數過少或格式錯誤`,story.pages?.length);
   else story.pages.forEach((page,pageIdx)=>{
    if(!Array.isArray(page)||!page.length){fail("STORY_PAGE_FORMAT",`${expectedId} 第 ${pageIdx+1} 頁格式錯誤`);return;}
    const texts=page.map(plainText).filter(Boolean);
    if(!texts.length)fail("STORY_PAGE_EMPTY",`${expectedId} 第 ${pageIdx+1} 頁沒有可顯示文字`);
    const joined=texts.join("\n");
    if(joined.includes("玩家"))fail("STORY_PLAYER_WORD",`${expectedId} 第 ${pageIdx+1} 頁正式文字不可使用「玩家」`);
   });
  }
 }

 const intro=stories["earth-prologue"];
 if(!intro)fail("STORY_PROLOGUE_MISSING","缺少 earth-prologue");
 else if(!Array.isArray(intro.pages)||intro.pages.length<7)fail("STORY_PROLOGUE_FORMAT","earth-prologue 頁面格式錯誤");

 const finalStory=stories["galactic-unification-boss-10"];
 if(finalStory){
  const finalText=(finalStory.pages||[]).flatMap(page=>Array.isArray(page)?page.map(plainText):[]).join("\n");
  if(!finalText.includes("本地連續體封閉狀態解除。"))fail("STORY_FINAL_CONTINUUM_LINE","最終劇情缺少固定訊號：本地連續體封閉狀態解除。");
  if(!finalText.includes("外層觀測開始。"))fail("STORY_FINAL_OBSERVATION_LINE","最終劇情缺少固定訊號：外層觀測開始。");
 }

 const report={
  passed:errors.length===0,
  version:1,
  worldRegions:expectedRegions.length,
  storyRegions:regions.length,
  bossStoriesExpected:100,
  bossStoriesChecked:bossStoryCount,
  totalStories:Object.keys(stories).length,
  errors
 };
 window.STORY_INTEGRITY_VERSION=1;
 window.STORY_INTEGRITY_REPORT=report;
 if(!report.passed)console.error("[文明戰線] 正式劇情完整性檢查失敗",errors);
 else console.info("[文明戰線] 正式劇情完整性檢查通過",report);
})();