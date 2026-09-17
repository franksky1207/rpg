(function(){
 let selectedRegionId=null;
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
 function selectedHtml(group){
  if(!group)return `<div class="card"><div class="story-record-empty">目前還沒有已完成的區域戰線紀錄。</div></div>`;
  const chapter=String(group.rows[0]?.chapter||group.region.name||"戰線紀錄");
  return `<div class="card story-record-card story-record-selected"><h2 class="story-record-chapter">${esc(chapter)}</h2><div class="story-record-list">${group.rows.map(entryHtml).join("")}</div></div>`;
 }

 window.prepareStoryRecordEntry=prepareEntry;
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
  const back=typeof homeBackHtml==="function"?homeBackHtml():`<div class="back-home"><button class="btn back-btn" onclick="go('home')">← 返回主頁</button></div>`;
  return `<div class="function-page story-record-page">${back}<div class="card"><h2>戰線紀錄</h2><div class="muted">僅顯示已完成的正式劇情；尚未抵達的區域與未完成劇情不會顯示。重播不會給予獎勵或改變進度。</div></div>${introHtml(completed)}${tabsHtml(groups)}${selectedHtml(selected)}</div>`;
 };

 window.STORY_RECORD_TABS_VERSION=5;
})();