(function(){
 const STYLE_ID="civilizationStoryStyles";
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
 function installStyles(){
  if(document.getElementById(STYLE_ID))return;
  const style=document.createElement("style");
  style.id=STYLE_ID;
  style.textContent=`
   .story-overlay{position:fixed;inset:0;z-index:10050;display:none;align-items:center;justify-content:center;padding:max(12px,env(safe-area-inset-top)) max(12px,env(safe-area-inset-right)) max(12px,env(safe-area-inset-bottom)) max(12px,env(safe-area-inset-left));background:rgba(2,5,10,.86);backdrop-filter:blur(5px)}
   .story-overlay.open{display:flex}
   .story-card{width:min(92vw,78dvh,620px);aspect-ratio:1/1;max-width:620px;max-height:620px;display:grid;grid-template-rows:14% 1fr 14%;overflow:hidden;border:1px solid #5c6f85;border-radius:16px;background:linear-gradient(180deg,#101722 0%,#0b1018 100%);box-shadow:0 24px 80px rgba(0,0,0,.62),inset 0 0 50px rgba(62,111,160,.08);color:#e8edf4}
   .story-head{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:8px 18px;border-bottom:1px solid #334153;background:linear-gradient(180deg,rgba(31,49,69,.96),rgba(20,31,44,.96));text-align:center;min-height:0}
   .story-chapter{font-size:clamp(11px,1.7vw,13px);font-weight:800;letter-spacing:.08em;color:#a9bed5;line-height:1.2}
   .story-location{margin-top:2px;font-size:clamp(10px,1.45vw,12px);color:#8298af;line-height:1.15}
   .story-title{margin-top:3px;font-size:clamp(15px,2.3vw,20px);font-weight:900;color:#f1d38b;line-height:1.15}
   .story-body{min-height:0;overflow:hidden;padding:clamp(15px,3.2vw,26px) clamp(17px,3.8vw,30px);font-size:clamp(14px,2.2vw,17px);line-height:1.58;letter-spacing:.015em;display:flex;flex-direction:column;justify-content:flex-start}
   .story-body p{margin:0 0 .78em;overflow-wrap:anywhere}.story-body p:last-child{margin-bottom:0}.story-body .story-em{margin:auto 0;text-align:center;font-size:1.12em;font-weight:900;color:#f0d494;letter-spacing:.035em;white-space:pre-line}
   .story-actions{display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);align-items:center;gap:14px;padding:10px 16px;border-top:1px solid #334153;background:#0d141e}
   .story-actions .btn{width:100%;height:42px;margin:0}.story-actions .story-spacer{display:block}.story-page-number{min-width:58px;text-align:center;color:#a9b6c5;font-size:13px;font-weight:800;letter-spacing:.04em;white-space:nowrap}
   @media(max-width:760px){
    .story-overlay{padding:8px}
    .story-card{width:min(94vw,88dvh);border-radius:13px;grid-template-rows:15% 1fr 15%}
    .story-head{padding:6px 12px}.story-body{padding:13px 16px;font-size:14px;line-height:1.52}.story-body p{margin-bottom:.68em}.story-actions{padding:8px 11px;gap:10px}.story-actions .btn{height:40px;padding:8px 10px}.story-page-number{min-width:52px;font-size:12px}
   }
   @media(max-width:390px){.story-body{font-size:13.5px;padding:12px 14px;line-height:1.5}.story-actions{gap:8px}.story-page-number{min-width:48px}}
  `;
  document.head.appendChild(style);
 }
 function ensureModal(){
  installStyles();
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
  document.getElementById("storyBody").innerHTML=page.map(block=>{
   if(block&&typeof block==="object"&&Object.prototype.hasOwnProperty.call(block,"em"))return `<p class="story-em">${esc(interpolate(block.em))}</p>`;
   return `<p>${esc(interpolate(block))}</p>`;
  }).join("");
  const first=activePage===0,last=activePage===activeStory.pages.length-1;
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
  if(modal)modal.classList.remove("open");
  activeStory=null;activePage=0;activeOptions=null;
  if(story&&typeof options?.onComplete==="function"){
   try{options.onComplete(story.id,story);}catch(error){console.error("Story completion callback failed",error);}
  }
 };
 window.isStoryOpen=function(){return !!activeStory;};
 window.STORY_UI_VERSION=3;
})();