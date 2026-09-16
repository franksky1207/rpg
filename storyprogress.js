(function(){
 const INTRO_STORY_ID="earth-prologue";
 const MODAL_ID="civilizationStarterGearModal";
 const STYLE_ID="civilizationStarterGearStyles";
 const RECORD_STYLE_ID="civilizationStoryRecordStyles";
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

 function bossStoryId(mapIdx){
  const index=Math.floor(Number(mapIdx));
  if(!Number.isInteger(index)||index<0||!Array.isArray(WORLD_REGIONS))return null;
  const region=WORLD_REGIONS.find(r=>index>=Number(r.mapStart)&&index<=Number(r.mapEnd));
  if(!region)return null;
  return `${region.id}-boss-${index-Number(region.mapStart)+1}`;
 }
 function bossMapIndexForStory(id){
  if(typeof id!=="string"||!Array.isArray(WORLD_REGIONS))return null;
  for(const region of WORLD_REGIONS){
   const start=Number(region.mapStart),end=Number(region.mapEnd);
   for(let i=start;i<=end;i++)if(bossStoryId(i)===id)return i;
  }
  return null;
 }
 function queueBossStory(mapIdx){
  const id=bossStoryId(mapIdx);
  if(!id||!window.CIVILIZATION_STORIES?.[id])return null;
  const p=progress();
  if(p.completedStories.includes(id))return null;
  if(p.pendingStory&&p.pendingStory!==id)return null;
  if(p.pendingStory!==id){p.pendingStory=id;persist();}
  return id;
 }

 function starterTypes(){return Array.isArray(EQUIPMENT_TYPES)?EQUIPMENT_TYPES:[];}
 function allStarterGearMissing(){const types=starterTypes();return !!types.length&&types.every(type=>!state?.equipment?.[type]);}
 function hasNoMainProgress(){
  if(Number(state?.level)!==1||Number(state?.exp)!==0||Number(state?.gold)!==0||Number(state?.unlockedMap)!==0)return false;
  if(Array.isArray(state?.inventory)&&state.inventory.length)return false;
  if(Array.isArray(state?.bossKilled)&&state.bossKilled.some(Boolean))return false;
  if(Array.isArray(state?.bossProgress)&&state.bossProgress.some(v=>Number(v)>0))return false;
  if(Array.isArray(state?.mapProgress)&&state.mapProgress.some(row=>Array.isArray(row)&&row.some(v=>Number(v)>0)))return false;
  return true;
 }
 function brokenOnboardingGearState(){
  const p=progress();
  return p.introCompleted===true&&p.starterGearReceived===true&&p.completedStories.length===1&&p.completedStories[0]===INTRO_STORY_ID&&hasNoMainProgress()&&allStarterGearMissing();
 }
 function ensureStarterEquipment(){
  const types=starterTypes();
  if(!types.length)return false;
  if(!isObject(state.equipment))state.equipment={};
  const missing=types.filter(type=>!state.equipment[type]);
  if(!missing.length)return false;
  const generated=typeof starterEquipment==="function"?starterEquipment():null;
  missing.forEach(type=>{
   if(generated?.[type])state.equipment[type]=generated[type];
   else if(typeof makeItem==="function")state.equipment[type]=makeItem(1,0,"normal",0,type);
  });
  if(typeof playerCombatStats==="function")state.hp=playerCombatStats().hp;
  persist();
  return true;
 }
 function repairBrokenOnboardingGear(){if(brokenOnboardingGearState())return ensureStarterEquipment();return false;}

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
  return starterTypes().map(type=>`<div class="starter-gear-row"><div class="starter-gear-type">${esc(gearLabel(type))}</div><div>${gearText(state.equipment?.[type])}</div></div>`).join("");
 }
 function showStarterGear(){
  if(starterGearOpen)return true;
  ensureStarterEquipment();
  const modal=ensureStarterGearModal();
  modal.innerHTML=`<div class="starter-gear-card"><h2>文明戰線・作戰裝備發放</h2><div class="starter-gear-intro">正式編制已完成。文明戰線已為你配發第一套基礎作戰裝備，確認後即可進入主畫面。</div><div class="starter-gear-list">${starterGearRows()}</div><div class="starter-gear-note">這些裝備就是目前角色已建立的初始裝備；此步驟只完成正式發放確認，不會重新抽取或改變裝備數值。</div><div class="starter-gear-actions"><button class="btn primary" onclick="confirmStarterGearReceived()">領取裝備</button></div></div>`;
  modal.classList.add("open");starterGearOpen=true;return true;
 }
 window.confirmStarterGearReceived=function(){
  ensureStarterEquipment();
  const p=progress();
  p.starterGearReceived=true;
  if(typeof normalizeCurrentSaveState==="function")normalizeCurrentSaveState();
  persist();
  const modal=document.getElementById(MODAL_ID);
  if(modal){modal.classList.remove("open");modal.remove();}
  starterGearOpen=false;
  const enterHome=()=>{
   if(typeof go==="function")go("home");
   else{
    try{view="home";adventureScreen="maps";}catch(e){}
    if(typeof render==="function")render();
   }
  };
  if(typeof requestAnimationFrame==="function")requestAnimationFrame(enterHome);else setTimeout(enterHome,0);
 };

 function installRecordStyles(){
  if(document.getElementById(RECORD_STYLE_ID))return;
  const style=document.createElement("style");
  style.id=RECORD_STYLE_ID;
  style.textContent=`.story-record-page{display:grid;gap:14px}.story-record-card{display:grid;gap:10px}.story-record-chapter{margin:0;color:#f0d494}.story-record-list{display:grid;gap:9px}.story-record-entry{width:100%;text-align:left;border:1px solid #3b4b5d;border-radius:12px;background:rgba(13,20,30,.9);color:#e7edf5;padding:13px 14px;cursor:pointer}.story-record-entry b{display:block;color:#f1d38b;font-size:16px}.story-record-entry span{display:block;margin-top:4px;color:#9fb0c1;font-size:13px;line-height:1.45}.story-record-empty{padding:18px 0;color:#9aa8b6}@media(max-width:560px){.story-record-entry{padding:12px}.story-record-entry b{font-size:15px}}`;
  document.head.appendChild(style);
 }
 function storyOrder(id){
  if(id===INTRO_STORY_ID)return 0;
  const mapIndex=bossMapIndexForStory(id);
  return mapIndex==null?100000:mapIndex+1;
 }
 function completedStoryRows(){
  const p=progress(),stories=window.CIVILIZATION_STORIES||{};
  return p.completedStories.filter(id=>stories[id]).map(id=>stories[id]).sort((a,b)=>storyOrder(a.id)-storyOrder(b.id));
 }
 function storyRecordPageHtml(){
  installRecordStyles();
  const rows=completedStoryRows();
  const groups=[];
  rows.forEach(story=>{
   const chapter=String(story.chapter||"戰線紀錄");
   let group=groups.find(x=>x.chapter===chapter);
   if(!group){group={chapter,rows:[]};groups.push(group);}
   group.rows.push(story);
  });
  const body=groups.length?groups.map(group=>`<div class="card story-record-card"><h2 class="story-record-chapter">${esc(group.chapter)}</h2><div class="story-record-list">${group.rows.map(story=>`<button class="story-record-entry" onclick="replayCompletedStory('${esc(story.id)}')"><b>${esc(story.title||story.id)}</b><span>${esc(story.location||"")}</span></button>`).join("")}</div></div>`).join(""):`<div class="card"><div class="story-record-empty">目前還沒有已完成的戰線紀錄。</div></div>`;
  return `<div class="function-page story-record-page">${typeof homeBackHtml==="function"?homeBackHtml():`<div class="back-home"><button class="btn back-btn" onclick="go('home')">← 返回主頁</button></div>`}<div class="card"><h2>戰線紀錄</h2><div class="muted">僅顯示已完成的正式劇情；重播不會給予獎勵或改變進度。</div></div>${body}</div>`;
 }
 window.storyRecordPageHtml=storyRecordPageHtml;
 window.replayCompletedStory=function(id){
  const p=progress();
  if(!p.completedStories.includes(id)||!window.CIVILIZATION_STORIES?.[id])return false;
  return typeof openStory==="function"?openStory(id):false;
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
  repairBrokenOnboardingGear();
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
  version:4,
  introStoryId:INTRO_STORY_ID,
  normalize:normalizeProgress,
  resume:queueResume,
  get:()=>progress(),
  setPending,
  completeStory,
  queueBossStory,
  bossStoryId,
  ensureStarterEquipment,
  completedStories:completedStoryRows
 };
 window.CIVILIZATION_STORY_PROGRESS_VERSION=4;

 if(typeof state!=="undefined"&&state){normalizeProgress(state);repairBrokenOnboardingGear();persist();}
 window.addEventListener("civilization-background-ready-before-reveal",queueResume);
 window.addEventListener("civilization-auth-ready",queueResume);
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",queueResume,{once:true});else queueResume();
})();