(function(){
 const INTRO_STORY_ID="earth-prologue";
 const MODAL_ID="civilizationStarterGearModal";
 const STYLE_ID="civilizationStarterGearStyles";
 let resumeQueued=false;
 let starterGearOpen=false;

 function isObject(v){return !!v&&typeof v==="object"&&!Array.isArray(v);}
 function uniqueStrings(values){return Array.from(new Set((Array.isArray(values)?values:[]).filter(v=>typeof v==="string"&&v)));}
 function freshProgress(){return {pendingStory:null,completedStories:[],introCompleted:false,starterGearReceived:false};}
 function legacyProgress(){return {pendingStory:null,completedStories:[INTRO_STORY_ID],introCompleted:true,starterGearReceived:true};}
 function loadedFromExistingSave(){return window.LAST_SAVE_LOAD_REPORT?.hadRaw===true;}

 function normalizeProgress(target,options={}){
  if(!isObject(target))return target;
  const hadProgress=isObject(target.storyProgress);
  if(!hadProgress){
   const legacy=options.fresh===true?false:(options.legacy===true||loadedFromExistingSave());
   target.storyProgress=legacy?legacyProgress():freshProgress();
  }
  const p=target.storyProgress;
  p.pendingStory=typeof p.pendingStory==="string"&&p.pendingStory?p.pendingStory:null;
  p.completedStories=uniqueStrings(p.completedStories);
  p.introCompleted=p.introCompleted===true;
  p.starterGearReceived=p.starterGearReceived===true;
  if(p.introCompleted&&!p.completedStories.includes(INTRO_STORY_ID))p.completedStories.unshift(INTRO_STORY_ID);
  target.introSeen=p.introCompleted;
  return target;
 }

 function normalizeFreshState(target){
  normalizeProgress(target,{fresh:true});
  setTimeout(queueResume,0);
  return target;
 }
 if(typeof registerNewStateNormalizer==="function")registerNewStateNormalizer(normalizeFreshState);
 window.normalizeStoryProgressState=normalizeProgress;

 function progress(){normalizeProgress(state);return state.storyProgress;}
 function persist(){if(typeof save==="function")save(false);}
 function addCompleted(id){
  const p=progress();
  if(!p.completedStories.includes(id))p.completedStories.push(id);
 }
 function setPending(id){const p=progress();p.pendingStory=id||null;persist();}
 function completeStory(id){
  const p=progress();
  addCompleted(id);
  if(p.pendingStory===id)p.pendingStory=null;
  if(id===INTRO_STORY_ID){p.introCompleted=true;state.introSeen=true;}
  persist();
 }

 function esc(v){return String(v??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[ch]));}
 function gearLabel(type){return typeof equipmentTypeLabel==="function"?equipmentTypeLabel(type):({weapon:"武器",helmet:"頭盔",armor:"鎧甲",shoes:"鞋子",accessory:"飾品"}[type]||type);}
 function gearText(item){
  if(!item)return "未取得";
  if(typeof itemHtml==="function")return itemHtml(item,true);
  return esc(item.name||"作戰裝備");
 }
 function installStarterGearStyles(){
  if(document.getElementById(STYLE_ID))return;
  const style=document.createElement("style");
  style.id=STYLE_ID;
  style.textContent=`
   .starter-gear-overlay{position:fixed;inset:0;z-index:10055;display:none;align-items:center;justify-content:center;padding:max(12px,env(safe-area-inset-top)) max(12px,env(safe-area-inset-right)) max(12px,env(safe-area-inset-bottom)) max(12px,env(safe-area-inset-left));background:rgba(2,5,10,.88);backdrop-filter:blur(5px)}
   .starter-gear-overlay.open{display:flex}.starter-gear-card{width:min(92vw,560px);max-height:min(86dvh,720px);overflow:auto;border:1px solid #5c6f85;border-radius:16px;background:linear-gradient(180deg,#101722,#0b1018);box-shadow:0 24px 80px rgba(0,0,0,.62);padding:22px;color:#e8edf4}
   .starter-gear-card h2{margin:0;text-align:center;color:#f1d38b}.starter-gear-intro{margin:10px 0 16px;color:#b8c5d2;line-height:1.65;text-align:center}.starter-gear-list{display:grid;gap:8px}.starter-gear-row{display:grid;grid-template-columns:72px 1fr;gap:10px;align-items:center;padding:10px 12px;border:1px solid #334153;border-radius:10px;background:#0d141e}.starter-gear-type{color:#8fa7bf;font-weight:800}.starter-gear-note{margin-top:14px;color:#8fa0b2;font-size:13px;line-height:1.55}.starter-gear-actions{margin-top:18px;display:flex;justify-content:center}.starter-gear-actions .btn{min-width:180px}
   @media(max-width:560px){.starter-gear-card{padding:18px 15px}.starter-gear-row{grid-template-columns:64px 1fr;padding:9px 10px}.starter-gear-actions .btn{width:100%}}
  `;
  document.head.appendChild(style);
 }
 function ensureStarterGearModal(){
  installStarterGearStyles();
  let modal=document.getElementById(MODAL_ID);
  if(modal)return modal;
  modal=document.createElement("div");
  modal.id=MODAL_ID;
  modal.className="starter-gear-overlay";
  modal.setAttribute("role","dialog");
  modal.setAttribute("aria-modal","true");
  document.body.appendChild(modal);
  return modal;
 }
 function starterGearRows(){
  const types=Array.isArray(EQUIPMENT_TYPES)?EQUIPMENT_TYPES:[];
  return types.map(type=>`<div class="starter-gear-row"><div class="starter-gear-type">${esc(gearLabel(type))}</div><div>${gearText(state.equipment?.[type])}</div></div>`).join("");
 }
 function showStarterGear(){
  if(starterGearOpen)return true;
  const modal=ensureStarterGearModal();
  modal.innerHTML=`<div class="starter-gear-card"><h2>文明戰線・作戰裝備發放</h2><div class="starter-gear-intro">正式編制已完成。文明戰線已為你配發第一套基礎作戰裝備，確認後即可進入主畫面。</div><div class="starter-gear-list">${starterGearRows()}</div><div class="starter-gear-note">這些裝備就是目前角色已建立的初始裝備；此步驟只完成正式發放確認，不會重新抽取或改變裝備數值。</div><div class="starter-gear-actions"><button class="btn primary" onclick="confirmStarterGearReceived()">領取裝備</button></div></div>`;
  modal.classList.add("open");starterGearOpen=true;return true;
 }
 window.confirmStarterGearReceived=function(){
  const p=progress();
  p.starterGearReceived=true;
  persist();
  const modal=document.getElementById(MODAL_ID);if(modal)modal.classList.remove("open");
  starterGearOpen=false;
 };

 function authReady(){return window.CIVILIZATION_AUTH_REQUIRED!==true||!!window.civilizationAuthSession;}
 function backgroundReady(){return window.BACKGROUND_PRELOAD_READY===true;}
 function openFormalStory(id){
  if(typeof openStory!=="function")return false;
  if(typeof isStoryOpen==="function"&&isStoryOpen())return true;
  return openStory(id,{onComplete:(storyId)=>{completeStory(storyId);queueResume();}});
 }
 function resume(){
  resumeQueued=false;
  if(typeof state==="undefined"||!state||!authReady()||!backgroundReady())return false;
  const p=progress();
  if(p.pendingStory){
   if(openFormalStory(p.pendingStory))return true;
   console.error("Pending story is unavailable",p.pendingStory);
   return false;
  }
  if(!p.introCompleted){
   setPending(INTRO_STORY_ID);
   return openFormalStory(INTRO_STORY_ID);
  }
  if(!p.starterGearReceived)return showStarterGear();
  return false;
 }
 function queueResume(){
  if(resumeQueued)return;
  resumeQueued=true;
  queueMicrotask(resume);
 }

 window.civilizationStoryProgress={
  version:1,
  introStoryId:INTRO_STORY_ID,
  normalize:normalizeProgress,
  resume:queueResume,
  get:()=>progress(),
  setPending,
  completeStory
 };
 window.CIVILIZATION_STORY_PROGRESS_VERSION=1;

 if(typeof state!=="undefined"&&state){normalizeProgress(state);persist();}
 window.addEventListener("civilization-background-ready-before-reveal",queueResume);
 window.addEventListener("civilization-auth-ready",queueResume);
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",queueResume,{once:true});else queueResume();
})();