(function(){
 const VERSION=1;
 const BOSS_COUNT=100;

 function targetState(target=null){
  if(target&&typeof target==="object")return target;
  try{return typeof state!=="undefined"&&state&&typeof state==="object"?state:null;}catch(e){return null;}
 }
 function clampCount(value){
  const n=Math.floor(Number(value));
  return Number.isFinite(n)?Math.max(0,Math.min(BOSS_COUNT,n)):null;
 }
 function universeStoryIds(){
  if(typeof window.universeStoryIdForBossIndex!=="function")return [];
  return Array.from({length:BOSS_COUNT},(_,index)=>window.universeStoryIdForBossIndex(index)).filter(Boolean);
 }
 function progressSnapshot(target=null){
  const s=targetState(target),rows=s?.secondWorld?.mainline?.bossKilled;
  let completed=0;
  if(Array.isArray(rows))for(let i=0;i<BOSS_COUNT&&rows[i]===true;i++)completed++;
  const nextBoss=completed<BOSS_COUNT&&typeof window.secondWorldBoss==="function"?window.secondWorldBoss(completed):null;
  return Object.freeze({version:VERSION,completedBosses:completed,totalBosses:BOSS_COUNT,highestClearedBossIndex:completed-1,nextBossIndex:nextBoss?.index??null,nextBossLevel:nextBoss?.level??null,nextBossName:nextBoss?.name||null});
 }
 function ensureStoryProgress(target){
  const progress=target?.storyProgress;
  return progress&&typeof progress==="object"&&!Array.isArray(progress)&&Array.isArray(progress.completedStories)?progress:null;
 }
 function applyCount(value,target=null){
  const s=targetState(target),count=clampCount(value);
  if(!s||count==null)return {ok:false,reason:"invalid-target"};
  if(s?.secondWorld?.entered!==true||s?.thirdWorld?.entered===true)return {ok:false,reason:"wrong-world"};
  if(!s.secondWorld.mainline||typeof s.secondWorld.mainline!=="object")s.secondWorld.mainline={};
  const storyIds=universeStoryIds();
  if(storyIds.length!==BOSS_COUNT||typeof window.universeBossIndexForStoryId!=="function")return {ok:false,reason:"story-owner-missing"};
  const progress=ensureStoryProgress(s);
  if(!progress)return {ok:false,reason:"story-progress-missing"};

  s.secondWorld.mainline.bossKilled=Array.from({length:BOSS_COUNT},(_,index)=>index<count);

  const universeIds=new Set(storyIds);
  const preserved=progress.completedStories.filter(id=>!universeIds.has(id));
  progress.completedStories=Array.from(new Set([...preserved,...storyIds.slice(0,count)]));
  const pendingIndex=window.universeBossIndexForStoryId(progress.pendingStory);
  if(pendingIndex!=null)progress.pendingStory=null;

  if(typeof window.normalizeSecondWorldCalamityState==="function")window.normalizeSecondWorldCalamityState(s);
  return {ok:true,...progressSnapshot(s),completedUniverseStories:count};
 }
 function setProgress(){
  const s=targetState();
  if(!s||s?.secondWorld?.entered!==true||s?.thirdWorld?.entered===true)return alert("只有目前位於宇宙紀元時才能指定宇宙紀元進度。");
  if(typeof window.runSettlementTransaction!=="function")return alert("正式存檔 transaction owner 尚未載入。");
  const current=progressSnapshot(s).completedBosses;
  const raw=prompt("指定宇宙紀元已擊破 Boss 數（0～100）",current);
  if(raw===null)return;
  const count=clampCount(raw);
  if(count==null||String(Math.floor(Number(raw)))!==String(Number(raw))||Number(raw)<0||Number(raw)>BOSS_COUNT){alert("請輸入 0～100 的整數。");return;}
  const tx=window.runSettlementTransaction({label:"gm-second-world-progress",mutate:live=>applyCount(count,live)});
  if(!tx?.ok){alert(`宇宙紀元進度更新失敗：${tx?.reason||tx?.value?.reason||"未知錯誤"}`);return;}
  const result=tx.value||progressSnapshot(s);
  if(typeof render==="function")render();
  if(count>=BOSS_COUNT){alert("宇宙紀元主線已指定為 100 / 100 Boss 完成；對應宇宙故事進度已同步。文明等級與文明災厄養成維持原值。");return;}
  const next=typeof window.secondWorldBoss==="function"?window.secondWorldBoss(count):null;
  const requirement=next?Math.max(500,Number(next.level)-5):null;
  const level=Math.max(1,Math.floor(Number(s.level)||1));
  const levelNote=next&&level<requirement?`\n下一隻 ${next.name} Lv.${next.level} 仍需角色至少 Lv.${requirement} 才能挑戰。`:"";
  alert(`宇宙紀元主線已指定為 ${count} / 100 Boss 完成。對應宇宙故事進度已同步；文明等級與文明災厄養成維持原值。${levelNote}`);
 }
 function validate(){
  const errors=[];
  try{
   const ids=universeStoryIds();
   if(ids.length!==BOSS_COUNT)errors.push({code:"STORY_IDS",actual:ids.length});
   const probe={level:600,secondWorld:{entered:true,civilizationLevel:5,mainline:{bossKilled:Array(BOSS_COUNT).fill(false)},calamities:[]},thirdWorld:{entered:false},storyProgress:{pendingStory:ids[50]||null,completedStories:["earth-prologue"]}};
   const applied=applyCount(20,probe);
   if(applied?.ok!==true)errors.push({code:"APPLY",applied});
   if(probe.secondWorld.mainline.bossKilled.filter(Boolean).length!==20||probe.secondWorld.mainline.bossKilled.slice(0,20).some(v=>v!==true)||probe.secondWorld.mainline.bossKilled.slice(20).some(v=>v===true))errors.push({code:"BOSS_PREFIX"});
   const completed=new Set(probe.storyProgress.completedStories);
   if(!completed.has("earth-prologue")||ids.slice(0,20).some(id=>!completed.has(id))||ids.slice(20).some(id=>completed.has(id)))errors.push({code:"STORY_PREFIX"});
   if(probe.storyProgress.pendingStory!==null)errors.push({code:"PENDING_STORY"});
   if(probe.secondWorld.civilizationLevel!==5)errors.push({code:"CIVILIZATION_MUTATED"});
   if(progressSnapshot(probe).completedBosses!==20)errors.push({code:"SNAPSHOT"});
  }catch(error){errors.push({code:"EXCEPTION",error:String(error?.message||error)});}
  return Object.freeze({version:VERSION,passed:errors.length===0,errors:Object.freeze(errors)});
 }

 window.gmSecondWorldProgressSnapshot=progressSnapshot;
 window.gmApplySecondWorldProgressCount=applyCount;
 window.gmSetSecondWorldProgress=setProgress;
 window.GM_SECOND_WORLD_PROGRESS_MANAGEMENT_VERSION=VERSION;
 window.GM_SECOND_WORLD_PROGRESS_INTEGRITY=validate();
 if(!window.GM_SECOND_WORLD_PROGRESS_INTEGRITY.passed)console.error("[文明戰線] GM Second World progress integrity error",window.GM_SECOND_WORLD_PROGRESS_INTEGRITY.errors);
})();
