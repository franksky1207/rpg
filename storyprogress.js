(function(){
 const INTRO_STORY_ID="earth-prologue";
 const MODAL_ID="civilizationStarterGearModal";
 let resumeQueued=false;
 let starterGearOpen=false;

 function loadedFromExistingSave(){return window.LAST_SAVE_LOAD_REPORT?.hadRaw===true;}

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
 function availableStoryRegions(){return Array.isArray(window.CIVILIZATION_STORY_REGIONS)?window.CIVILIZATION_STORY_REGIONS:[];}
 function migrationOptions(options={}){
  return {
   introStoryId:INTRO_STORY_ID,
   fresh:options.fresh===true,
   legacy:options.legacy===true||(!options.fresh&&loadedFromExistingSave()),
   skipBackfill:options.skipBackfill===true,
   regions:availableStoryRegions(),
   stories:window.CIVILIZATION_STORIES||{},
   bossMapIndexForStory
  };
 }
 function normalizeProgress(target,options={}){
  const migration=window.civilizationStoryMigration;
  if(!migration?.migrate){
   console.error("Story migration module is unavailable");
   return target;
  }
  migration.migrate(target,migrationOptions(options));
  return target;
 }
 function backfillAvailableHistory(target){
  const migration=window.civilizationStoryMigration;
  if(!migration?.backfillAvailableHistory)return false;
  return migration.backfillAvailableHistory(target,migrationOptions());
 }

 function normalizeFreshState(target){
  normalizeProgress(target,{fresh:true});
  setTimeout(queueResume,0);
  return target;
 }
 if(typeof registerNewStateNormalizer==="function")registerNewStateNormalizer(normalizeFreshState);
 window.normalizeStoryProgressState=normalizeProgress;

 function readProgress(){const p=state?.storyProgress;return p&&typeof p==="object"&&!Array.isArray(p)?p:null;}
 function ensureProgress(options={}){normalizeProgress(state,options);return readProgress();}
 function persist(){if(typeof save==="function")save(false);}
 function addCompleted(id){
  const p=ensureProgress();
  if(p&&!p.completedStories.includes(id))p.completedStories.push(id);
 }
 function setPending(id){const p=ensureProgress();if(!p)return false;p.pendingStory=id||null;persist();return true;}
 function completeStory(id){
  const p=ensureProgress();
  if(!p)return false;
  const firstCompletion=!p.completedStories.includes(id);
  if(firstCompletion)p.completedStories.push(id);
  if(p.pendingStory===id)p.pendingStory=null;
  if(id===INTRO_STORY_ID){p.introCompleted=true;state.introSeen=true;}
  persist();
  if(firstCompletion&&typeof window.showCivilizationCalamityUnlockNoticeForStory==="function")queueMicrotask(()=>window.showCivilizationCalamityUnlockNoticeForStory(id));
  return true;
 }
 function queueBossStory(mapIdx){
  const id=bossStoryId(mapIdx);
  if(!id||!window.CIVILIZATION_STORIES?.[id])return null;
  normalizeProgress(state,{skipBackfill:true});
  const p=state.storyProgress;
  if(!p)return null;
  if(p.completedStories.includes(id))return null;
  if(p.pendingStory&&p.pendingStory!==id)return null;
  if(p.pendingStory!==id){
   p.pendingStory=id;
   normalizeProgress(state);
   persist();
  }
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
  const p=readProgress();
  if(!p)return false;
  return p.introCompleted===true&&p.starterGearReceived===true&&p.completedStories.length===1&&p.completedStories[0]===INTRO_STORY_ID&&hasNoMainProgress()&&allStarterGearMissing();
 }
 function ensureStarterEquipment(){
  const types=starterTypes();
  if(!types.length)return false;
  if(!state.equipment||typeof state.equipment!=="object"||Array.isArray(state.equipment))state.equipment={};
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
 function ensureStarterGearModal(){
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
  const p=ensureProgress();
  if(!p)return;
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

 function storyOrder(id){
  if(id===INTRO_STORY_ID)return 0;
  const mapIndex=bossMapIndexForStory(id);
  return mapIndex==null?100000:mapIndex+1;
 }
 function completedStoryRows(){
  const p=readProgress(),stories=window.CIVILIZATION_STORIES||{};
  if(!p)return [];
  return p.completedStories.filter(id=>stories[id]).map(id=>stories[id]).sort((a,b)=>storyOrder(a.id)-storyOrder(b.id));
 }
 window.replayCompletedStory=function(id){
  const p=readProgress();
  if(!p||!p.completedStories.includes(id)||!window.CIVILIZATION_STORIES?.[id])return false;
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
  const p=ensureProgress();
  if(!p)return false;
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
  version:9,
  introStoryId:INTRO_STORY_ID,
  normalize:normalizeProgress,
  resume:queueResume,
  get:()=>readProgress(),
  setPending,
  completeStory,
  queueBossStory,
  bossStoryId,
  backfillAvailableHistory:()=>{const changed=backfillAvailableHistory(state);if(changed)persist();return changed;},
  ensureStarterEquipment,
  completedStories:completedStoryRows
 };
 window.CIVILIZATION_STORY_PROGRESS_VERSION=9;

 if(typeof state!=="undefined"&&state){normalizeProgress(state);repairBrokenOnboardingGear();persist();}
 window.addEventListener("civilization-background-ready-before-reveal",queueResume);
 window.addEventListener("civilization-auth-ready",queueResume);
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",queueResume,{once:true});else queueResume();
})();