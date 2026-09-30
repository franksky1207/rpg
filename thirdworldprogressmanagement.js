(function(){
 const VERSION=1;
 const MAX_PERCENT=100;
 function clampPercent(value){
  const n=Math.floor(Number(value));
  return Number.isFinite(n)?Math.max(0,Math.min(MAX_PERCENT,n)):null;
 }
 function descriptors(){return typeof window.thirdWorldStoryTriggerDescriptors==="function"?Array.from(window.thirdWorldStoryTriggerDescriptors()):[];}
 function snapshot(target=null){
  const holder=target&&typeof target==="object"?target:(typeof state!=="undefined"?state:null);
  const aggregate=typeof window.thirdWorldBossAggregateSnapshot==="function"?window.thirdWorldBossAggregateSnapshot(holder):null;
  if(!aggregate||!Number.isFinite(Number(aggregate.maxHp))||Number(aggregate.maxHp)<=0)return Object.freeze({version:VERSION,completionPercent:0,titleTier:0,storyStage:0,defeatedBosses:0,totalBosses:10,currentHp:null,maxHp:null});
  const completion=Math.max(0,Math.min(100,(1-Number(aggregate.currentHp)/Number(aggregate.maxHp))*100));
  const titleTier=typeof window.thirdWorldTitleTier==="function"?Math.max(0,Math.min(10,Math.floor(Number(window.thirdWorldTitleTier(holder))||0))):0;
  return Object.freeze({version:VERSION,completionPercent:Math.round(completion*100)/100,titleTier,storyStage:Math.max(0,Math.min(10,Math.floor(Number(holder?.thirdWorld?.story?.unlockedStage)||0))),defeatedBosses:Math.max(0,Math.floor(Number(aggregate.defeatedCount)||0)),totalBosses:Math.max(0,Math.floor(Number(aggregate.bossCount)||10)),currentHp:Number(aggregate.currentHp),maxHp:Number(aggregate.maxHp)});
 }
 function rebuild(value,target=null){
  const percent=clampPercent(value),holder=target&&typeof target==="object"?target:(typeof state!=="undefined"?state:null);
  if(!holder||percent==null)return {ok:false,reason:"invalid-target"};
  if(holder?.thirdWorld?.entered!==true)return {ok:false,reason:"wrong-world"};
  if(typeof window.thirdWorldBossAggregateSnapshot!=="function"||typeof window.thirdWorldTitleTier!=="function")return {ok:false,reason:"progress-owner-missing"};
  const bossCount=Math.max(1,Math.floor(Number(window.THIRD_WORLD_BOSS_COUNT)||10)),bossMaxHp=Math.max(1,Math.floor(Number(window.THIRD_WORLD_BOSS_MAX_HP)||0));
  if(bossCount!==10||bossMaxHp<=0)return {ok:false,reason:"boss-owner-missing"};
  const rows=descriptors();
  if(rows.length!==11)return {ok:false,reason:"story-owner-missing"};
  const progress=holder?.storyProgress;
  if(!progress||typeof progress!=="object"||!Array.isArray(progress.completedStories))return {ok:false,reason:"story-progress-missing"};
  const remainingHp=Math.round(bossMaxHp*(100-percent)/100);
  holder.thirdWorld.bosses=Array.from({length:bossCount},()=>({currentHp:remainingHp}));
  const aggregate=window.thirdWorldBossAggregateSnapshot(holder),tier=Math.max(0,Math.min(10,Math.floor(Number(window.thirdWorldTitleTier(holder))||0))),full=percent===100;
  const thirdIds=new Set(rows.map(row=>String(row?.storyId||row?.id||"")).filter(Boolean));
  const intro=rows.find(row=>row?.kind==="intro")||null,final=rows.find(row=>row?.kind==="final")||null;
  const introId=String(intro?.storyId||intro?.id||""),finalId=String(final?.storyId||final?.id||"");
  const hadIntro=holder?.thirdWorld?.story?.introSeen===true||(introId&&progress.completedStories.includes(introId));
  const preserved=progress.completedStories.filter(id=>!thirdIds.has(id)),completedThird=[];
  if(hadIntro&&introId)completedThird.push(introId);
  rows.filter(row=>row?.kind==="milestone"&&Math.floor(Number(row.stage)||0)<=tier).forEach(row=>{const id=String(row.storyId||row.id||"");if(id)completedThird.push(id);});
  if(full&&finalId)completedThird.push(finalId);
  progress.completedStories=Array.from(new Set([...preserved,...completedThird]));
  if(thirdIds.has(String(progress.pendingStory||"")))progress.pendingStory=null;
  if(!holder.thirdWorld.story||typeof holder.thirdWorld.story!=="object")holder.thirdWorld.story={introSeen:false,unlockedStage:0,finalSeen:false};
  holder.thirdWorld.story.introSeen=hadIntro;
  holder.thirdWorld.story.unlockedStage=tier;
  holder.thirdWorld.story.finalSeen=full;
  holder.thirdWorld.completed=full;
  const titleIds=Array.from(window.THIRD_WORLD_PLAYER_TITLE_IDS||[]);
  if(titleIds.length!==10)return {ok:false,reason:"title-owner-missing"};
  if(!holder.titles||typeof holder.titles!=="object")holder.titles=typeof window.createBlankPlayerTitleState==="function"?window.createBlankPlayerTitleState():{version:1,unlocked:[],equipped:null,pendingNotice:null};
  const titleIdSet=new Set(titleIds),existing=Array.isArray(holder.titles.unlocked)?holder.titles.unlocked:[];
  holder.titles.unlocked=Array.from(new Set([...existing.filter(id=>!titleIdSet.has(id)),...titleIds.slice(0,tier)]));
  if(titleIdSet.has(String(holder.titles.pendingNotice||"")))holder.titles.pendingNotice=null;
  if(typeof window.normalizePlayerTitleState==="function")window.normalizePlayerTitleState(holder);
  if(typeof window.reconcileThirdWorldStoryState==="function")window.reconcileThirdWorldStoryState(holder);
  return {ok:true,...snapshot(holder),requestedPercent:percent,remainingHpPerBoss:remainingHp,aggregateCurrentHp:Number(aggregate.currentHp),completedThirdWorldStories:completedThird.length,completed:holder.thirdWorld.completed===true};
 }
 function integrity(){
  const errors=[],rows=descriptors(),intro=rows.find(row=>row?.kind==="intro"),introId=String(intro?.storyId||intro?.id||""),titleIds=Array.from(window.THIRD_WORLD_PLAYER_TITLE_IDS||[]),otherTitle=window.CIVILIZATION_PLAYER_TITLE_IDS?.[0]||null;
  const probe={level:1333,exp:777,secondWorld:{entered:true,civilizationLevel:10},thirdWorld:{entered:true,completed:false,dimensionalStrings:456789,coreLevel:4,coreProgress:123456,bosses:Array.from({length:10},()=>({currentHp:1100000000})),story:{introSeen:true,unlockedStage:0,finalSeen:false}},storyProgress:{pendingStory:null,completedStories:["earth-prologue"]},titles:{version:1,unlocked:[otherTitle,...titleIds].filter(Boolean),equipped:null,pendingNotice:null}};
  const before={level:probe.level,exp:probe.exp,strings:probe.thirdWorld.dimensionalStrings,coreLevel:probe.thirdWorld.coreLevel,coreProgress:probe.thirdWorld.coreProgress};
  const half=rebuild(50,probe),completed=new Set(probe.storyProgress.completedStories);
  if(half?.ok!==true||snapshot(probe).completionPercent!==50||snapshot(probe).titleTier!==5||snapshot(probe).storyStage!==5)errors.push({code:"REBUILD_50",half});
  if(!completed.has(introId)||probe.thirdWorld.story.introSeen!==true)errors.push({code:"INTRO_COMPAT",introId,story:probe.thirdWorld.story,completed:[...completed]});
  if(probe.level!==before.level||probe.exp!==before.exp||probe.thirdWorld.dimensionalStrings!==before.strings||probe.thirdWorld.coreLevel!==before.coreLevel||probe.thirdWorld.coreProgress!==before.coreProgress)errors.push({code:"UNRELATED_MUTATION"});
  const full=rebuild(100,probe);
  if(full?.ok!==true||probe.thirdWorld.completed!==true||probe.thirdWorld.story.finalSeen!==true)errors.push({code:"REBUILD_100",full});
  const reset=rebuild(0,probe);
  if(reset?.ok!==true||probe.thirdWorld.completed!==false||probe.thirdWorld.story.finalSeen!==false||probe.thirdWorld.story.introSeen!==true)errors.push({code:"RESET_0",reset,story:probe.thirdWorld.story});
  return Object.freeze({version:VERSION,passed:errors.length===0,errors:Object.freeze(errors)});
 }
 window.THIRD_WORLD_PROGRESS_MANAGEMENT_OWNER_VERSION=VERSION;
 window.GM_THIRD_WORLD_PROGRESS_MANAGEMENT_VERSION=1;
 window.thirdWorldProgressManagementClamp=clampPercent;
 window.thirdWorldProgressManagementSnapshot=snapshot;
 window.rebuildThirdWorldFormalProgress=rebuild;
 window.THIRD_WORLD_PROGRESS_MANAGEMENT_INTEGRITY=integrity();
 if(!window.THIRD_WORLD_PROGRESS_MANAGEMENT_INTEGRITY.passed)console.error("[文明戰線] Third-world progress management integrity error",window.THIRD_WORLD_PROGRESS_MANAGEMENT_INTEGRITY.errors);
})();
