(function(){
 const VERSION=5;
 const DISPLAY_REPLACEMENTS=[["Boss 戰","首領戰"],["Boss戰","首領戰"],["最後Boss","最後首領"],["因Boss倒下","因首領倒下"],["Boss","首領"]];

 function normalizeDisplayText(value){
  let text=String(value??"");
  DISPLAY_REPLACEMENTS.forEach(([from,to])=>{text=text.replaceAll(from,to);});
  return text;
 }
 function normalizeDisplayValue(value){
  if(typeof value==="string")return normalizeDisplayText(value);
  if(Array.isArray(value))return value.map(normalizeDisplayValue);
  if(value&&typeof value==="object"){
   const copy={};
   Object.entries(value).forEach(([key,item])=>{copy[key]=normalizeDisplayValue(item);});
   return copy;
  }
  return value;
 }
 function normalizeLoadedStoryData(){
  const stories=window.CIVILIZATION_STORIES||{};
  Object.values(stories).forEach(story=>{
   if(!story||typeof story!=="object")return;
   story.chapter=normalizeDisplayText(story.chapter);
   story.location=normalizeDisplayText(story.location);
   story.title=normalizeDisplayText(story.title);
   story.pages=normalizeDisplayValue(story.pages);
  });
  const regions=Array.isArray(window.CIVILIZATION_STORY_REGIONS)?window.CIVILIZATION_STORY_REGIONS:[];
  regions.forEach(region=>{
   if(!region||typeof region!=="object")return;
   region.name=normalizeDisplayText(region.name);
   if(Array.isArray(region.stories))region.stories.forEach(row=>{if(row&&typeof row==="object")row.label=normalizeDisplayText(row.label);});
  });
  window.STORY_TEXT_NORMALIZE_REPORT={version:1,storyCount:Object.keys(stories).length,regionCount:regions.length,ranAt:Date.now()};
  window.STORY_TEXT_NORMALIZE_VERSION=1;
 }

 function plainText(value){
  if(typeof value==="string")return value;
  if(value&&typeof value==="object"&&typeof value.em==="string")return value.em;
  return "";
 }
 function pageText(page){return (Array.isArray(page)?page:[]).map(plainText).filter(Boolean).join("\n");}
 function hasEnglishLetters(value){return /[A-Za-z]/.test(String(value??""));}

 function run(){
  normalizeLoadedStoryData();
  const errors=[];
  const warnings=[];
  const fail=(code,message,data=null)=>errors.push({code,message,data});
  const warn=(code,message,data=null)=>warnings.push({code,message,data});
  const stories=window.CIVILIZATION_STORIES||{};
  const regions=Array.isArray(window.CIVILIZATION_STORY_REGIONS)?window.CIVILIZATION_STORY_REGIONS:[];
  const expectedRegions=typeof WORLD_REGIONS!=="undefined"&&Array.isArray(WORLD_REGIONS)?WORLD_REGIONS:[];
  const maps=typeof MAPS!=="undefined"&&Array.isArray(MAPS)?MAPS:[];
  const registeredIds=new Set();
  const expectedStoryIds=new Set(["earth-prologue"]);
  let bossStoryCount=0;

  function checkChineseDisplay(value,context){
   if(hasEnglishLetters(value))fail("STORY_ENGLISH_DISPLAY_TEXT",`${context} 正式顯示文字不可含英文字母`,String(value??""));
  }

  if(expectedRegions.length!==10)fail("STORY_WORLD_REGION_COUNT",`WORLD_REGIONS 應為 10 區，實際 ${expectedRegions.length}`);
  if(regions.length!==10)fail("STORY_REGION_REGISTRY_COUNT",`CIVILIZATION_STORY_REGIONS 應為 10 區，實際 ${regions.length}`);
  const regionIds=regions.map(r=>r?.id).filter(id=>typeof id==="string"&&id);
  if(new Set(regionIds).size!==regionIds.length)fail("STORY_REGION_DUPLICATE","CIVILIZATION_STORY_REGIONS 存在重複區域 id",regionIds);

  expectedRegions.forEach((worldRegion,regionIndex)=>{
   const storyRegion=regions.find(r=>r?.id===worldRegion.id);
   if(!storyRegion){fail("STORY_REGION_MISSING",`缺少故事區域：${worldRegion.id}`);return;}
   if(regions[regionIndex]?.id!==worldRegion.id)fail("STORY_REGION_ORDER",`故事區域順序錯誤：第 ${regionIndex+1} 區應為 ${worldRegion.id}，實際 ${regions[regionIndex]?.id||"缺少"}`);
   if(storyRegion.name!==worldRegion.name)fail("STORY_REGION_NAME",`${worldRegion.id} 故事區域名稱應為「${worldRegion.name}」，實際「${storyRegion.name}」`);
   checkChineseDisplay(storyRegion.name,`${worldRegion.id} 區域名稱`);
   const rows=Array.isArray(storyRegion.stories)?storyRegion.stories:[];
   const expectedRows=worldRegion.id==="earth"?11:10;
   if(rows.length!==expectedRows)fail("STORY_REGION_ROW_COUNT",`${worldRegion.name} 登錄應有 ${expectedRows} 筆，實際 ${rows.length}`);
   if(worldRegion.id==="earth"&&rows[0]?.id!=="earth-prologue")fail("STORY_PROLOGUE_ORDER","地球故事登錄第一筆必須是 earth-prologue");
   rows.forEach((row,rowIndex)=>checkChineseDisplay(row?.label,`${worldRegion.name} 第 ${rowIndex+1} 筆登錄名稱`));
   const bossRows=rows.filter(row=>typeof row?.id==="string"&&/-boss-\d+$/.test(row.id));
   if(bossRows.length!==10)fail("STORY_REGION_BOSS_COUNT",`${worldRegion.name} 應有 10 個首領故事，實際 ${bossRows.length}`);

   for(let offset=0;offset<10;offset++){
    const mapIdx=Number(worldRegion.mapStart)+offset;
    const expectedId=`${worldRegion.id}-boss-${offset+1}`;
    expectedStoryIds.add(expectedId);
    const map=maps[mapIdx];
    const expectedBoss=map?.enemies?.[4]?.[0];
    const row=rows.find(x=>x?.id===expectedId);
    const story=stories[expectedId];
    bossStoryCount++;

    if(!map){fail("STORY_MAP_MISSING",`${expectedId} 找不到 map index ${mapIdx}`);continue;}
    if(!expectedBoss){fail("STORY_MAP_BOSS_MISSING",`${expectedId} 找不到正式首領名稱`);continue;}
    if(!row)fail("STORY_REGISTRY_ID_MISSING",`${worldRegion.name} 登錄缺少 ${expectedId}`);
    else{
     if(row.label!==expectedBoss)fail("STORY_REGISTRY_LABEL_MISMATCH",`${expectedId} 登錄名稱應為「${expectedBoss}」，實際「${row.label}」`);
     if(registeredIds.has(expectedId))fail("STORY_REGISTRY_DUPLICATE",`${expectedId} 被重複登錄`);
     registeredIds.add(expectedId);
    }
    if(!story){fail("STORY_DATA_MISSING",`缺少故事資料 ${expectedId}`);continue;}
    if(story.id!==expectedId)fail("STORY_ID_MISMATCH",`${expectedId} story.id 不一致`,story.id);
    if(story.title!==expectedBoss)fail("STORY_TITLE_MISMATCH",`${expectedId} title 應為「${expectedBoss}」，實際「${story.title}」`);
    if(story.location!==map.name)fail("STORY_LOCATION_MISMATCH",`${expectedId} location 應為「${map.name}」，實際「${story.location}」`);
    if(typeof story.chapter!=="string"||!story.chapter.includes(worldRegion.name))fail("STORY_CHAPTER_MISMATCH",`${expectedId} chapter 應包含「${worldRegion.name}」，實際「${story.chapter}」`);
    checkChineseDisplay(story.chapter,`${expectedId} 章節名稱`);
    checkChineseDisplay(story.location,`${expectedId} 地點名稱`);
    checkChineseDisplay(story.title,`${expectedId} 劇情標題`);
    if(!Array.isArray(story.pages)||story.pages.length<7)fail("STORY_PAGE_COUNT",`${expectedId} 頁數過少或格式錯誤`,story.pages?.length);
    else{
     if(story.pages.length>20)warn("STORY_PAGE_COUNT_LONG",`${expectedId} 共 ${story.pages.length} 頁，超過目前建議上限 20 頁`);
     story.pages.forEach((page,pageIdx)=>{
      if(!Array.isArray(page)||!page.length){fail("STORY_PAGE_FORMAT",`${expectedId} 第 ${pageIdx+1} 頁格式錯誤`);return;}
      const texts=page.map(plainText).filter(Boolean);
      if(!texts.length)fail("STORY_PAGE_EMPTY",`${expectedId} 第 ${pageIdx+1} 頁沒有可顯示文字`);
      const joined=texts.join("\n");
      if(joined.includes("玩家"))fail("STORY_PLAYER_WORD",`${expectedId} 第 ${pageIdx+1} 頁正式文字不可使用「玩家」`);
      checkChineseDisplay(joined,`${expectedId} 第 ${pageIdx+1} 頁`);
      const visibleChars=Array.from(joined.replace(/\s/g,"")).length;
      if(visibleChars>230)warn("STORY_PAGE_DENSITY",`${expectedId} 第 ${pageIdx+1} 頁文字偏密，建議手機實機確認`,visibleChars);
     });
    }
   }
  });

  const intro=stories["earth-prologue"];
  if(!intro)fail("STORY_PROLOGUE_MISSING","缺少 earth-prologue");
  else{
   checkChineseDisplay(intro.chapter,"earth-prologue 章節名稱");
   checkChineseDisplay(intro.location,"earth-prologue 地點名稱");
   checkChineseDisplay(intro.title,"earth-prologue 劇情標題");
   if(!Array.isArray(intro.pages)||intro.pages.length<7)fail("STORY_PROLOGUE_FORMAT","earth-prologue 頁面格式錯誤");
   else intro.pages.forEach((page,pageIdx)=>{
    const joined=pageText(page);
    if(joined.includes("玩家"))fail("STORY_PLAYER_WORD",`earth-prologue 第 ${pageIdx+1} 頁正式文字不可使用「玩家」`);
    checkChineseDisplay(joined,`earth-prologue 第 ${pageIdx+1} 頁`);
    const visibleChars=Array.from(joined.replace(/\s/g,"")).length;
    if(visibleChars>230)warn("STORY_PAGE_DENSITY",`earth-prologue 第 ${pageIdx+1} 頁文字偏密，建議手機實機確認`,visibleChars);
   });
  }

  const actualStoryIds=Object.keys(stories);
  if(actualStoryIds.length!==101)fail("STORY_TOTAL_COUNT",`正式故事總數應為 101（序章＋100 首領），實際 ${actualStoryIds.length}`);
  actualStoryIds.forEach(id=>{if(!expectedStoryIds.has(id))fail("STORY_UNEXPECTED_ID",`存在未登錄的正式故事 id：${id}`);});
  expectedStoryIds.forEach(id=>{if(!stories[id])fail("STORY_EXPECTED_ID_MISSING",`正式故事集合缺少 ${id}`);});
  if(bossStoryCount!==100)fail("STORY_BOSS_CHECK_COUNT",`應檢查 100 個首領故事，實際 ${bossStoryCount}`);

  const finalStory=stories["galactic-unification-boss-10"];
  if(finalStory){
   const finalText=(finalStory.pages||[]).flatMap(page=>Array.isArray(page)?page.map(plainText):[]).join("\n");
   const continuum="本地連續體封閉狀態解除。";
   const observation="外層觀測開始。";
   const continuumIndex=finalText.indexOf(continuum),observationIndex=finalText.indexOf(observation);
   if(continuumIndex<0)fail("STORY_FINAL_CONTINUUM_LINE",`最終劇情缺少固定訊號：${continuum}`);
   if(observationIndex<0)fail("STORY_FINAL_OBSERVATION_LINE",`最終劇情缺少固定訊號：${observation}`);
   if(continuumIndex>=0&&observationIndex>=0&&continuumIndex>=observationIndex)fail("STORY_FINAL_SIGNAL_ORDER","最終固定訊號順序錯誤：必須先解除本地連續體封閉，再開始外層觀測");
  }

  const requiredVersions={
   earth:Number(window.STORY_EARTH_DATA_VERSION)||0,
   solar:Number(window.STORY_SOLAR_DATA_VERSION)||0,
   nearstar:Number(window.STORY_NEARSTAR_DATA_VERSION)||0,
   frontier:Number(window.STORY_FRONTIER_DATA_VERSION)||0,
   orion:Number(window.STORY_ORION_DATA_VERSION)||0,
   "galactic-frontier":Number(window.STORY_GALACTIC_FRONTIER_DATA_VERSION)||0,
   "galactic-mid":Number(window.STORY_GALACTIC_MID_DATA_VERSION)||0,
   "core-outer":Number(window.STORY_CORE_OUTER_DATA_VERSION)||0,
   "core-war":Number(window.STORY_CORE_WAR_DATA_VERSION)||0,
   "galactic-unification":Number(window.STORY_GALACTIC_UNIFICATION_DATA_VERSION)||0
  };
  Object.entries(requiredVersions).forEach(([id,version])=>{if(version<1)fail("STORY_DATA_VERSION_MISSING",`${id} 正式劇情資料版本未正確載入`);});

  const report={
   passed:errors.length===0,
   version:VERSION,
   checkedAt:Date.now(),
   worldRegions:expectedRegions.length,
   storyRegions:regions.length,
   bossStoriesExpected:100,
   bossStoriesChecked:bossStoryCount,
   totalStories:actualStoryIds.length,
   warnings,
   errors
  };
  window.STORY_INTEGRITY_REPORT=report;
  if(!report.passed)console.error("[文明戰線] 正式劇情完整性檢查失敗",errors);
  else if(warnings.length)console.warn("[文明戰線] 正式劇情完整性檢查通過，但有版面警告",report);
  else console.info("[文明戰線] 正式劇情完整性檢查通過",report);
  return report;
 }

 window.STORY_INTEGRITY_VERSION=VERSION;
 window.runCivilizationStoryIntegrity=run;
 run();
})();