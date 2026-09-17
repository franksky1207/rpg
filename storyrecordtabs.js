(function(){
 let selectedRegionId=null;
 const STYLE_ID="civilizationStoryRecordTabsStyles";
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
 function installStyles(){
  if(document.getElementById(STYLE_ID))return;
  const style=document.createElement("style");
  style.id=STYLE_ID;
  style.textContent=`
   .story-record-page{display:grid;gap:14px}
   .story-record-card{display:grid;gap:10px}
   .story-record-chapter{margin:0;color:#f0d494}
   .story-record-list{display:grid;gap:9px}
   .story-record-entry{width:100%;text-align:left;border:1px solid #3b4b5d;border-radius:12px;background:rgba(13,20,30,.9);color:#e7edf5;padding:13px 14px;cursor:pointer}
   .story-record-entry b{display:block;color:#f1d38b;font-size:16px}
   .story-record-entry span{display:block;margin-top:4px;color:#9fb0c1;font-size:13px;line-height:1.45}
   .story-record-empty{padding:18px 0;color:#9aa8b6}
   .story-record-tabs{display:flex;flex-wrap:wrap;gap:10px}
   .story-record-tab{border:1px solid #465a70;border-radius:11px;background:rgba(13,20,30,.9);color:#c8d4df;padding:11px 16px;min-height:44px;font-weight:800;cursor:pointer}
   .story-record-tab.active{border-color:#d8b96f;background:rgba(76,59,27,.55);color:#f1d38b;box-shadow:inset 0 0 0 1px rgba(241,211,139,.12)}
   .story-record-intro{display:grid;gap:9px}
   .story-record-selected{display:grid;gap:10px}
   @media(max-width:560px){
    .story-record-tabs{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}
    .story-record-tab{width:100%;padding:10px 8px;min-height:48px;font-size:14px;line-height:1.25}
    .story-record-entry{padding:12px}
    .story-record-entry b{font-size:15px}
   }
  `;
  document.head.appendChild(style);
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
  installStyles();
  const completed=completedIds();
  const groups=visibleRegions();
  const selected=ensureSelection(groups);
  const back=typeof homeBackHtml==="function"?homeBackHtml():`<div class="back-home"><button class="btn back-btn" onclick="go('home')">← 返回主頁</button></div>`;
  return `<div class="function-page story-record-page">${back}<div class="card"><h2>戰線紀錄</h2><div class="muted">僅顯示已完成的正式劇情；尚未抵達的區域與未完成劇情不會顯示。重播不會給予獎勵或改變進度。</div></div>${introHtml(completed)}${tabsHtml(groups)}${selectedHtml(selected)}</div>`;
 };

 window.STORY_RECORD_TABS_VERSION=4;
})();