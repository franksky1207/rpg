(function(){
 const VERSION=1;
 const BOSS_COUNT=100;
 function clampCount(value){
  const n=Math.floor(Number(value));
  return Number.isFinite(n)?Math.max(0,Math.min(BOSS_COUNT,n)):null;
 }
 function storyIds(){
  if(typeof window.universeStoryIdForBossIndex!=="function")return [];
  return Array.from({length:BOSS_COUNT},(_,index)=>window.universeStoryIdForBossIndex(index)).filter(Boolean);
 }
 function snapshot(target=null){
  const holder=target&&typeof target==="object"?target:(typeof state!=="undefined"?state:null);
  const rows=holder?.secondWorld?.mainline?.bossKilled;
  let completed=0;
  if(Array.isArray(rows))for(let i=0;i<BOSS_COUNT&&rows[i]===true;i++)completed++;
  const nextBoss=completed<BOSS_COUNT&&typeof window.secondWorldBoss==="function"?window.secondWorldBoss(completed):null;
  return Object.freeze({version:VERSION,completedBosses:completed,totalBosses:BOSS_COUNT,highestClearedBossIndex:completed-1,nextBossIndex:nextBoss?.index??null,nextBossLevel:nextBoss?.level??null,nextBossName:nextBoss?.name||null});
 }
 function rebuild(value,target=null){
  const count=clampCount(value),holder=target&&typeof target==="object"?target:(typeof state!=="undefined"?state:null);
  if(!holder||count==null)return {ok:false,reason:"invalid-target"};
  if(holder?.secondWorld?.entered!==true||holder?.thirdWorld?.entered===true)return {ok:false,reason:"wrong-world"};
  const ids=storyIds();
  if(ids.length!==BOSS_COUNT||typeof window.universeBossIndexForStoryId!=="function")return {ok:false,reason:"story-owner-missing"};
  const progress=holder?.storyProgress;
  if(!progress||typeof progress!=="object"||!Array.isArray(progress.completedStories))return {ok:false,reason:"story-progress-missing"};
  if(!holder.secondWorld.mainline||typeof holder.secondWorld.mainline!=="object")holder.secondWorld.mainline={};
  holder.secondWorld.mainline.bossKilled=Array.from({length:BOSS_COUNT},(_,index)=>index<count);
  const universeIds=new Set(ids),preserved=progress.completedStories.filter(id=>!universeIds.has(id));
  progress.completedStories=Array.from(new Set([...preserved,...ids.slice(0,count)]));
  if(window.universeBossIndexForStoryId(progress.pendingStory)!=null)progress.pendingStory=null;
  if(typeof window.normalizeSecondWorldCalamityState==="function")window.normalizeSecondWorldCalamityState(holder);
  return {ok:true,...snapshot(holder),completedUniverseStories:count};
 }
 function integrity(){
  const errors=[];
  const ids=storyIds();
  if(ids.length!==BOSS_COUNT)errors.push({code:"STORY_IDS",actual:ids.length});
  const probe={level:600,secondWorld:{entered:true,civilizationLevel:7,mainline:{bossKilled:Array(BOSS_COUNT).fill(false)},calamities:[]},thirdWorld:{entered:false},storyProgress:{pendingStory:ids[50]||null,completedStories:["earth-prologue"]}};
  const result=rebuild(20,probe),completed=new Set(probe.storyProgress.completedStories);
  if(result?.ok!==true||snapshot(probe).completedBosses!==20)errors.push({code:"REBUILD_20",result});
  if(probe.secondWorld.mainline.bossKilled.slice(0,20).some(v=>v!==true)||probe.secondWorld.mainline.bossKilled.slice(20).some(v=>v===true))errors.push({code:"PREFIX"});
  if(ids.slice(0,20).some(id=>!completed.has(id))||ids.slice(20).some(id=>completed.has(id))||!completed.has("earth-prologue"))errors.push({code:"STORY_SYNC"});
  if(probe.storyProgress.pendingStory!==null)errors.push({code:"PENDING_STORY"});
  if(probe.secondWorld.civilizationLevel!==7)errors.push({code:"CIV_MUTATION"});
  return Object.freeze({version:VERSION,passed:errors.length===0,errors:Object.freeze(errors)});
 }
 window.SECOND_WORLD_PROGRESS_MANAGEMENT_OWNER_VERSION=VERSION;
 window.secondWorldProgressManagementClamp=clampCount;
 window.secondWorldProgressManagementSnapshot=snapshot;
 window.rebuildSecondWorldFormalProgress=rebuild;
 window.SECOND_WORLD_PROGRESS_MANAGEMENT_INTEGRITY=integrity();
 if(!window.SECOND_WORLD_PROGRESS_MANAGEMENT_INTEGRITY.passed)console.error("[文明戰線] Second-world progress management integrity error",window.SECOND_WORLD_PROGRESS_MANAGEMENT_INTEGRITY.errors);
})();
