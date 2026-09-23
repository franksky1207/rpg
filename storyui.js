(function(){
 const MODAL_ID="civilizationStoryModal";
 let activeStory=null;
 let activePage=0;
 let activeOptions=null;

 function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));}
 function playerName(){
  let name="";
  if(typeof currentPlayerName==="function")name=String(currentPlayerName()||"").trim();
  if(!name&&typeof state?.playerName==="string")name=state.playerName.trim();
  return !name||name==="玩家"?"作戰員":name;
 }
 function interpolate(v){return String(v??"").replaceAll("{角色名稱}",playerName());}
 function regionFinaleLabel(story){
  if(!story?.id)return "";
  const registries=[window.CIVILIZATION_STORY_REGIONS,window.CIVILIZATION_UNIVERSE_STORY_REGIONS];
  for(const regions of registries){
   if(!Array.isArray(regions))continue;
   for(const region of regions){
    const rows=Array.isArray(region?.stories)?region.stories:[];
    if(!rows.length||rows[rows.length-1]?.id!==story.id)continue;
    const chapter=String(story.chapter||"").replace(/^宇宙紀元・/,"").trim();
    return chapter?`${chapter}　完`:"";
   }
  }
  return "";
 }
 function ensureModal(){
  let modal=document.getElementById(MODAL_ID);
  if(modal)return modal;
  modal=document.createElement("div");
  modal.id=MODAL_ID;
  modal.className="story-overlay";
  modal.setAttribute("role","dialog");
  modal.setAttribute("aria-modal","true");
  modal.innerHTML=`<div class="story-card"><div class="story-head"><div id="storyChapter" class="story-chapter"></div><div id="storyLocation" class="story-location"></div><div id="storyTitle" class="story-title"></div></div><div id="storyBody" class="story-body"></div><div id="storyActions" class="story-actions"></div></div>`;
  document.body.appendChild(modal);
  return modal;
 }
 function renderPage(){
  const modal=ensureModal();
  if(!activeStory||!Array.isArray(activeStory.pages)||!activeStory.pages.length)return;
  activePage=Math.max(0,Math.min(activeStory.pages.length-1,activePage));
  document.getElementById("storyChapter").textContent=interpolate(activeStory.chapter||"");
  document.getElementById("storyLocation").textContent=interpolate(activeStory.location||"");
  document.getElementById("storyTitle").textContent=interpolate(activeStory.title||"");
  const page=activeStory.pages[activePage]||[];
  const first=activePage===0,last=activePage===activeStory.pages.length-1;
  const finaleLabel=last?regionFinaleLabel(activeStory):"";
  const hasFinaleLabel=!!finaleLabel&&page.some(block=>block&&typeof block==="object"&&typeof block.em==="string"&&String(block.em).trim()===finaleLabel.trim());
  let bodyHtml=page.map(block=>{
   if(block&&typeof block==="object"&&Object.prototype.hasOwnProperty.call(block,"em"))return `<p class="story-em">${esc(interpolate(block.em))}</p>`;
   return `<p>${esc(interpolate(block))}</p>`;
  }).join("");
  if(finaleLabel&&!hasFinaleLabel)bodyHtml+=`<p class="story-em">${esc(interpolate(finaleLabel))}</p>`;
  document.getElementById("storyBody").innerHTML=bodyHtml;
  const pageLabel=`${activePage+1} / ${activeStory.pages.length}`;
  document.getElementById("storyActions").innerHTML=`${first?'<span class="story-spacer"></span>':'<button class="btn" onclick="storyPreviousPage()">上一頁</button>'}<div class="story-page-number" aria-label="劇情頁數">${pageLabel}</div><button class="btn primary" onclick="${last?'closeStory()':'storyNextPage()'}">${last?'結束':'下一頁'}</button>`;
  modal.classList.add("open");
 }
 window.openStory=function(storyId,options=null){
  const story=window.CIVILIZATION_STORIES?.[storyId];
  if(!story||!Array.isArray(story.pages)||!story.pages.length)return false;
  activeStory=story;activePage=0;activeOptions=options&&typeof options==="object"?options:null;renderPage();return true;
 };
 window.storyPreviousPage=function(){if(!activeStory||activePage<=0)return;activePage--;renderPage();};
 window.storyNextPage=function(){if(!activeStory||activePage>=activeStory.pages.length-1)return;activePage++;renderPage();};
 window.closeStory=function(){
  const modal=document.getElementById(MODAL_ID);
  const story=activeStory,options=activeOptions;
  const completed=!!story&&Array.isArray(story.pages)&&story.pages.length>0&&activePage===story.pages.length-1;
  if(modal)modal.classList.remove("open");
  activeStory=null;activePage=0;activeOptions=null;
  if(completed&&typeof options?.onComplete==="function"){
   try{options.onComplete(story.id,story);}catch(error){console.error("Story completion callback failed",error);}
  }
 };
 window.isStoryOpen=function(){return !!activeStory;};
 window.STORY_UI_VERSION=7;
})();