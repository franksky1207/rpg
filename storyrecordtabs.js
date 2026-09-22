(function(){
 let selectedRegionId=null;
 let storyRecordEraView="universe";
 const INTRO_STORY_ID="earth-prologue";

 function esc(v){return String(v??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[ch]));}
 function progress(){return window.civilizationStoryProgress?.get?.()||{completedStories:[]};}
 function stories(){return window.CIVILIZATION_STORIES||{};}
 function regions(){return Array.isArray(window.CIVILIZATION_STORY_REGIONS)?window.CIVILIZATION_STORY_REGIONS:[];}
 function completedIds(){return new Set(Array.isArray(progress().completedStories)?progress().completedStories:[]);}
 function bossRows(region,completed){
  return (Array.isArray(region?.stories)?region.stories:[])
   .filter(row=>typeof row?.id==="string"&&/-boss-\d+$/.test(row.id)&&completed.has(row.id)&&stories()[row.id])
   .map(row=>stories()[row.id]);
 }
 function visibleRegions(){
  const completed=completedIds();
  return regions().map(region=>({region,rows:bossRows(region,completed)})).filter(group=>group.rows.length>0);
 }
 function ensureSelection(groups){
  if(!groups.length){selectedRegionId=null;return null;}
  if(!groups.some(group=>group.region.id===selectedRegionId))selectedRegionId=groups[groups.length-1].region.id;
  return groups.find(group=>group.region.id===selectedRegionId)||groups[groups.length-1];
 }
 function prepareEntry(){
  const groups=visibleRegions();
  selectedRegionId=groups.length?groups[groups.length-1].region.id:null;
  return selectedRegionId;
 }
 function entryHtml(story){
  return `<button class="story-record-entry" onclick="replayCompletedStory('${esc(story.id)}')"><b>${esc(story.title||story.id)}</b><span>${esc(story.location||"")}</span></button>`;
 }
 function introHtml(completed){
  const intro=stories()[INTRO_STORY_ID];
  if(!intro||!completed.has(INTRO_STORY_ID))return "";
  return `<div class="card story-record-card story-record-intro"><h2 class="story-record-chapter">序章</h2><div class="story-record-list">${entryHtml(intro)}</div></div>`;
 }
 function tabsHtml(groups){
  if(!groups.length)return "";
  return `<div class="card story-record-card"><h2 class="story-record-chapter">戰區紀錄</h2><div class="story-record-tabs">${groups.map(group=>`<button class="story-record-tab ${group.region.id===selectedRegionId?"active":""}" onclick="selectStoryRecordRegion('${esc(group.region.id)}')">${esc(group.region.name||group.region.id)}</button>`).join("")}</div></div>`;
 }
 function eraTabsHtml(){
  if(!(typeof window.isSecondWorldEntered==="function"&&window.isSecondWorldEntered()))return "";
  return `<div class="era-view-tabs story-record-era-tabs" role="tablist" aria-label="戰線紀錄紀元"><button class="era-view-tab ${storyRecordEraView==="universe"?"active":""}" type="button" onclick="setStoryRecordEraView('universe')">宇宙紀元</button><button class="era-view-tab ${storyRecordEraView==="galaxy-review"?"active":""}" type="button" onclick="setStoryRecordEraView('galaxy-review')">銀河紀元・回顧</button></div>`;
 }
 function universeRecordHtml(){
  return `<div class="card story-record-card story-record-universe-empty"><h2 class="story-record-chapter">宇宙紀元</h2><div class="story-record-empty">目前宇宙紀元尚未建立正式劇情紀錄。之後若加入宇宙紀元正式劇情，將由此紀元頁面承接。</div></div>`;
 }
 function selectedHtml(group){
  if(!group)return `<div class="card"><div class="story-record-empty">目前還沒有已完成的區域戰線紀錄。</div></div>`;
  const chapter=String(group.rows[0]?.chapter||group.region.name||"戰線紀錄");
  return `<div class="card story-record-card story-record-selected"><h2 class="story-record-chapter">${esc(chapter)}</h2><div class="story-record-list">${group.rows.map(entryHtml).join("")}</div></div>`;
 }

 window.prepareStoryRecordEntry=prepareEntry;
 window.setStoryRecordEraView=function(value){
  if(!(typeof window.isSecondWorldEntered==="function"&&window.isSecondWorldEntered()))storyRecordEraView="galaxy-review";
  else storyRecordEraView=value==="galaxy-review"?"galaxy-review":"universe";
  if(storyRecordEraView==="galaxy-review")prepareEntry();
  if(typeof render==="function")render();
  return storyRecordEraView;
 };
 window.getStoryRecordEraView=function(){return storyRecordEraView;};
 window.selectStoryRecordRegion=function(id){
  const groups=visibleRegions();
  if(!groups.some(group=>group.region.id===id))return false;
  selectedRegionId=id;
  if(typeof render==="function")render();
  return true;
 };
 window.storyRecordPageHtml=function(){
  const completed=completedIds();
  const groups=visibleRegions();
  const selected=ensureSelection(groups);
  const secondWorld=typeof window.isSecondWorldEntered==="function"&&window.isSecondWorldEntered();
  if(!secondWorld)storyRecordEraView="galaxy-review";
  const back=typeof homeBackHtml==="function"?homeBackHtml():`<div class="back-home"><button class="btn back-btn" onclick="go('home')">← 返回主頁</button></div>`;
  const head=`<div class="card"><h2>戰線紀錄</h2>${eraTabsHtml()}<div class="muted">${secondWorld?(storyRecordEraView==="universe"?"查看宇宙紀元的正式劇情紀錄。":"回顧銀河紀元已完成的正式劇情；重播不會給予獎勵或改變進度。"):"僅顯示已完成的正式劇情；尚未抵達的區域與未完成劇情不會顯示。重播不會給予獎勵或改變進度。"}</div></div>`;
  if(secondWorld&&storyRecordEraView==="universe")return `<div class="function-page story-record-page">${back}${head}${universeRecordHtml()}</div>`;
  return `<div class="function-page story-record-page">${back}${head}${introHtml(completed)}${tabsHtml(groups)}${selectedHtml(selected)}</div>`;
 };

 window.STORY_RECORD_TABS_VERSION=6;
 window.STORY_RECORD_WORLD_REVIEW_VERSION=1;
})();