(function(){
 const VERSION=17;
 const THIRD_WORLD_QUEUE_VERSION=1;
 const THIRD_WORLD_POST_FLOW_DRAIN_VERSION=1;
 const THIRD_WORLD_STORY_COMPLETION_OWNER_VERSION=1;
 const STORY_NORMALIZATION_CONVERGENCE_VERSION=1;
 const STORY_PENDING_ARBITRATION_VERSION=1;
 const STORY_PROGRESS_BEHAVIOR_REGRESSION_VERSION=1;
 const THIRD_WORLD_SETTLEMENT_BRIDGE_VERSION=1;
 const THIRD_WORLD_COMPLETION_FRAMEWORK_VERSION=1;
 const THIRD_WORLD_ELIGIBILITY_VERSION=1;
 const THIRD_WORLD_RELOAD_RECOVERY_VERSION=1;
 const THIRD_WORLD_PLACEHOLDER_GUARD_VERSION=1;
 const STORY_REINCARNATION_W1_W2_SUPPRESSION_VERSION=1;
 const STORY_REINCARNATION_W3_ISOLATION_VERSION=1;
 const INTRO_STORY_ID="earth-prologue",MODAL_ID="civilizationStarterGearModal";let resumeQueued=false,starterGearOpen=false;
 function loadedFromExistingSave(){return window.LAST_SAVE_LOAD_REPORT?.hadRaw===true;}
 function galaxyBossStoryId(mapIdx){const index=Math.floor(Number(mapIdx));if(!Number.isInteger(index)||index<0||!Array.isArray(WORLD_REGIONS))return null;const region=WORLD_REGIONS.find(r=>index>=Number(r.mapStart)&&index<=Number(r.mapEnd));return region?`${region.id}-boss-${index-Number(region.mapStart)+1}`:null;}
 function galaxyBossMapIndexForStory(id){if(typeof id!=="string"||!Array.isArray(WORLD_REGIONS))return null;for(const region of WORLD_REGIONS){for(let i=Number(region.mapStart);i<=Number(region.mapEnd);i++)if(galaxyBossStoryId(i)===id)return i;}return null;}
 function universeBossStoryId(index){return typeof window.universeStoryIdForBossIndex==="function"?window.universeStoryIdForBossIndex(index):null;}function universeBossIndexForStory(id){return typeof window.universeBossIndexForStoryId==="function"?window.universeBossIndexForStoryId(id):null;}
 function reincarnationStoryRun(target=state){return window.storyReincarnationContext?.(target)?.reincarnationRun===true;}
 function suppressRerunStory(id,target=state){if(!reincarnationStoryRun(target))return false;const era=storyEraForId(id);return era==="galaxy"||era==="universe"||era==="higher-dimensional";}
 function availableStoryRegions(){return Array.isArray(window.CIVILIZATION_STORY_REGIONS)?window.CIVILIZATION_STORY_REGIONS:[];}function migrationOptions(options={}){return {introStoryId:INTRO_STORY_ID,fresh:options.fresh===true,legacy:options.legacy===true||(!options.fresh&&loadedFromExistingSave()),skipBackfill:options.skipBackfill===true,regions:availableStoryRegions(),stories:window.CIVILIZATION_STORIES||{},bossMapIndexForStory:galaxyBossMapIndexForStory};}
 function normalizeProgress(target,options={}){
  const migration=window.civilizationStoryMigration;
  if(!migration?.migrate){console.error("Story migration module is unavailable");return target;}
  migration.migrate(target,migrationOptions({...options,skipBackfill:options.skipBackfill===true||reincarnationStoryRun(target)}));
  const pending=target?.storyProgress?.pendingStory;
  if(pending&&suppressRerunStory(pending,target))target.storyProgress.pendingStory=null;
  reconcileThirdWorldStoryCompletionState(target);
  return target;
 }function backfillAvailableHistory(target){return reincarnationStoryRun(target)?false:window.civilizationStoryMigration?.backfillAvailableHistory?.(target,migrationOptions())===true;}
 function normalizeFreshState(target){normalizeProgress(target,{fresh:true});setTimeout(queueResume,0);return target;}if(typeof registerNewStateNormalizer==="function")registerNewStateNormalizer(normalizeFreshState);window.normalizeStoryProgressState=normalizeProgress;
 function readProgress(){const p=state?.storyProgress;return p&&typeof p==="object"&&!Array.isArray(p)?p:null;}function ensureProgress(options={}){normalizeProgress(state,options);return readProgress();}function persist(){if(typeof save==="function")save(false);}
 function setPending(id,{progress=null}={}){if(suppressRerunStory(id))return false;const p=progress||ensureProgress();if(!p)return false;p.pendingStory=id||null;persist();return true;}function completeStory(id){if(suppressRerunStory(id))return false;const p=ensureProgress();if(!p)return false;const thirdGate=thirdWorldStoryCompletionGate(id,state);if(thirdGate.handled&&thirdGate.allowed!==true)return false;const first=!p.completedStories.includes(id);if(first)p.completedStories.push(id);if(p.pendingStory===id)p.pendingStory=null;if(id===INTRO_STORY_ID){p.introCompleted=true;state.introSeen=true;}if(thirdGate.handled)applyThirdWorldStoryCompletion(id,state,thirdGate);persist();if(first&&typeof window.showCivilizationCalamityUnlockNoticeForStory==="function")queueMicrotask(()=>window.showCivilizationCalamityUnlockNoticeForStory(id));if(first&&typeof window.handleSecondWorldStoryCompletion==="function")window.handleSecondWorldStoryCompletion(id);return true;}
 function queueStory(id,{resume=true,progress=null}={}){if(!id||suppressRerunStory(id)||!window.CIVILIZATION_STORIES?.[id])return null;const p=progress||ensureProgress({skipBackfill:true});if(!p||p.completedStories.includes(id)||p.pendingStory&&p.pendingStory!==id)return null;if(p.pendingStory!==id){p.pendingStory=id;persist();}if(resume)queueResume();return id;}function queueBossStory(mapIdx){return queueStory(galaxyBossStoryId(mapIdx));}function queueUniverseBossStory(index){return queueStory(universeBossStoryId(index));}
 function thirdWorldDescriptors(){return typeof window.thirdWorldStoryTriggerDescriptors==="function"?Array.from(window.thirdWorldStoryTriggerDescriptors()):[];}
 function formalStoryContentReady(descriptor){const id=String(descriptor?.storyId||"");const story=id?window.CIVILIZATION_STORIES?.[id]:null;return descriptor?.contentReady===true&&!!story&&Array.isArray(story.pages)&&story.pages.length>0;}
 function thirdWorldBossesDefeated(target){if(typeof window.thirdWorldBossesAllDefeated==="function")return window.thirdWorldBossesAllDefeated(target)===true;const rows=target?.thirdWorld?.bosses;return Array.isArray(rows)&&rows.length===10&&rows.every(row=>Number(row?.currentHp)===0);}
 function thirdWorldDescriptorForStory(id){const key=String(id||"");return thirdWorldDescriptors().find(row=>String(row?.storyId||row?.id||"")===key)||null;}
 function storyEraForId(id){const key=String(id||"");if(!key)return null;if(key===INTRO_STORY_ID||galaxyBossMapIndexForStory(key)!=null)return "galaxy";if(universeBossIndexForStory(key)!=null)return "universe";if(thirdWorldDescriptorForStory(key))return "higher-dimensional";return null;}
 function storyPendingArbitration(target=state,{expectedEra=null}={}){const pending=String(target?.storyProgress?.pendingStory||"");const expected=expectedEra==null?null:String(expectedEra);if(!pending)return Object.freeze({version:STORY_PENDING_ARBITRATION_VERSION,pendingStory:null,era:null,expectedEra:expected,known:true,catalogReady:false,own:false,foreign:false,disposition:"empty"});const era=storyEraForId(pending),known=!!era,catalogReady=!!window.CIVILIZATION_STORIES?.[pending],own=known&&(!expected||era===expected),foreign=known&&!!expected&&era!==expected,disposition=!known?"unknown":foreign?"foreign":"own";return Object.freeze({version:STORY_PENDING_ARBITRATION_VERSION,pendingStory:pending,era,expectedEra:expected,known,catalogReady,own,foreign,disposition});}
 function thirdWorldStoryCompletionGate(id,target=state){const descriptor=thirdWorldDescriptorForStory(id);if(!descriptor)return Object.freeze({handled:false,allowed:true,reason:"not-third-world-story",storyId:String(id||"")});if(reincarnationStoryRun(target))return Object.freeze({handled:true,allowed:false,reason:"reincarnation-story-archived",storyId:String(id||"")});const third=target?.thirdWorld,story=third?.story||{},stage=Math.max(0,Math.floor(Number(descriptor.stage)||0)),entered=third?.entered===true,bossesDefeated=thirdWorldBossesDefeated(target),unlockedStage=Math.max(0,Math.min(10,Math.floor(Number(story.unlockedStage)||0)));let allowed=entered,reason=entered?"eligible":"third-world-not-entered";if(allowed&&descriptor.kind==="milestone"&&unlockedStage<stage){allowed=false;reason="milestone-not-unlocked";}if(allowed&&descriptor.kind==="final"&&(!bossesDefeated||unlockedStage<10)){allowed=false;reason="final-not-ready";}return Object.freeze({handled:true,allowed,reason,storyId:String(descriptor.storyId||descriptor.id||id),kind:String(descriptor.kind||""),stage,entered,bossesDefeated,unlockedStage});}
 function applyThirdWorldStoryCompletion(id,target=state,gate=null){if(reincarnationStoryRun(target))return Object.freeze({handled:true,allowed:false,applied:false,reason:"reincarnation-story-archived",storyId:String(id||"")});const decision=gate?.handled?gate:thirdWorldStoryCompletionGate(id,target);if(!decision.handled||decision.allowed!==true)return Object.freeze({...decision,applied:false});const third=target.thirdWorld;if(!third.story||typeof third.story!=="object"||Array.isArray(third.story))third.story={introSeen:false,unlockedStage:0,finalSeen:false};if(decision.kind==="intro")third.story.introSeen=true;if(decision.kind==="final"){third.story.finalSeen=true;third.completed=true;}return Object.freeze({...decision,applied:true,finalSeen:third.story.finalSeen===true,storedCompleted:third.completed===true});}
 function reconcileThirdWorldStoryCompletionState(target=state){
  const third=target?.thirdWorld,p=target?.storyProgress;
  if(third?.entered!==true||!p||!Array.isArray(p.completedStories))return {applied:false,reason:"unavailable"};
  if(!third.story||typeof third.story!=="object"||Array.isArray(third.story))third.story={introSeen:false,unlockedStage:0,finalSeen:false};
  const before={introSeen:third.story.introSeen===true,finalSeen:third.story.finalSeen===true,completed:third.completed===true};
  if(reincarnationStoryRun(target)){
   // Re-conquest completion comes from this life's formal boss/stage state, never historical Story records.
   const battleComplete=thirdWorldBossesDefeated(target);
   third.story.introSeen=false;
   third.story.finalSeen=false;
   third.completed=battleComplete;
  }else{
   const completed=new Set(p.completedStories),intro=thirdWorldDescriptors().find(row=>row?.kind==="intro")||null,final=thirdWorldDescriptors().find(row=>row?.kind==="final")||null;
   if(intro&&formalStoryContentReady(intro))third.story.introSeen=completed.has(String(intro.storyId||intro.id||""));
   if(final&&formalStoryContentReady(final)){const finalDone=completed.has(String(final.storyId||final.id||""))&&thirdWorldBossesDefeated(target)&&Number(third.story.unlockedStage)>=10;third.story.finalSeen=finalDone;third.completed=finalDone;}
  }
  const after={introSeen:third.story.introSeen===true,finalSeen:third.story.finalSeen===true,completed:third.completed===true};
  return {applied:JSON.stringify(before)!==JSON.stringify(after),before,after};
 }
 function thirdWorldStoryEligibility(target=state){
  const third=target?.thirdWorld,entered=third?.entered===true,story=third?.story&&typeof third.story==="object"?third.story:{},unlockedStage=Math.max(0,Math.min(10,Math.floor(Number(story.unlockedStage)||0))),completed=new Set(Array.isArray(target?.storyProgress?.completedStories)?target.storyProgress.completedStories:[]),bossesDefeated=thirdWorldBossesDefeated(target);
  const rows=thirdWorldDescriptors().map(descriptor=>{
   const id=String(descriptor?.storyId||descriptor?.id||""),kind=String(descriptor?.kind||""),stage=Math.max(0,Math.floor(Number(descriptor?.stage)||0));
   const seen=kind==="intro"?story.introSeen===true:kind==="final"?story.finalSeen===true:false;
   const unlocked=kind==="intro"?entered:entered&&unlockedStage>=stage;
   const gateSatisfied=kind==="final"?bossesDefeated:true;
   const completedByHistory=completed.has(id),eligible=!!id&&!reincarnationStoryRun(target)&&unlocked&&gateSatisfied&&!seen&&!completedByHistory,contentReady=formalStoryContentReady(descriptor),queueable=eligible&&contentReady;
   return Object.freeze({id,storyId:id,kind,stage,thresholdRemainingPercentSum:descriptor?.thresholdRemainingPercentSum??null,unlocked,gateSatisfied,seen,completed:completedByHistory,eligible,contentReady,queueable});
  });
  const nextEligible=rows.find(row=>row.eligible)||null,nextQueueable=rows.find(row=>row.queueable)||null;
  return Object.freeze({version:THIRD_WORLD_ELIGIBILITY_VERSION,entered,unlockedStage,bossesDefeated,introSeen:story.introSeen===true,finalSeen:story.finalSeen===true,rows:Object.freeze(rows),nextEligibleId:nextEligible?.storyId||null,nextQueueableId:nextQueueable?.storyId||null});
 }
 function nextThirdWorldStory(target=state,{requireContent=true}={}){const snapshot=thirdWorldStoryEligibility(target);return snapshot.rows.find(row=>requireContent?row.queueable:row.eligible)||null;}
 function queueThirdWorldEligibleStory({resume=true,progress=null}={}){
  if(typeof state==="undefined"||!state?.thirdWorld?.entered||reincarnationStoryRun(state))return null;
  const p=progress||ensureProgress({skipBackfill:true});if(!p||storyPendingArbitration(state,{expectedEra:"higher-dimensional"}).disposition!=="empty")return null;
  const row=nextThirdWorldStory(state,{requireContent:true});return row?queueStory(row.storyId,{resume,progress:p}):null;
 }
 function thirdWorldStoryCompletionFramework(target=state){
  const third=target?.thirdWorld||{},snapshot=thirdWorldStoryEligibility(target),finalRow=snapshot.rows.find(row=>row.kind==="final")||null;
  const completionReady=third.entered===true&&snapshot.bossesDefeated===true&&snapshot.unlockedStage>=10;
  return Object.freeze({version:THIRD_WORLD_COMPLETION_FRAMEWORK_VERSION,entered:third.entered===true,bossesDefeated:snapshot.bossesDefeated===true,unlockedStage:snapshot.unlockedStage,completionReady,finalEligible:completionReady&&finalRow?.eligible===true,finalQueueable:completionReady&&finalRow?.queueable===true,finalStoryId:finalRow?.storyId||"higher-dimensional-final",finalSeen:third.story?.finalSeen===true,storedCompleted:third.completed===true,readyForCompletionOwner:completionReady});
 }
 function consumeThirdWorldSettlement(settlement,{queue=true}={}){
  if(!settlement||settlement.ok!==true||Number(settlement.world)!==3)return Object.freeze({version:THIRD_WORLD_SETTLEMENT_BRIDGE_VERSION,accepted:false,reason:"invalid-settlement",unlockedStages:Object.freeze([]),milestoneStages:Object.freeze([]),finalStageUnlocked:false,completion:thirdWorldStoryCompletionFramework(state),queuedStoryId:null});
  if(reincarnationStoryRun(state))reconcileThirdWorldStoryCompletionState(state);
  const unlockedStages=Array.from(new Set((Array.isArray(settlement.unlockedStoryStages)?settlement.unlockedStoryStages:[]).map(value=>Math.floor(Number(value))).filter(value=>value>=1&&value<=10))).sort((a,b)=>a-b),milestoneStages=unlockedStages.filter(stage=>stage<=9),finalStageUnlocked=unlockedStages.includes(10),completion=thirdWorldStoryCompletionFramework(state);
  const queuedStoryId=queue?queueThirdWorldEligibleStory({resume:false}):null;
  return Object.freeze({version:THIRD_WORLD_SETTLEMENT_BRIDGE_VERSION,accepted:true,unlockedStages:Object.freeze(unlockedStages),milestoneStages:Object.freeze(milestoneStages),finalStageUnlocked,completion,queuedStoryId:queuedStoryId||null,presentationDeferred:true});
 }
 async function drainThirdWorldPostFlowStories(){
  if(typeof state==="undefined"||state?.thirdWorld?.entered!==true)return Object.freeze({version:THIRD_WORLD_POST_FLOW_DRAIN_VERSION,ok:true,drained:false,presented:0,deferred:false,reason:"not-third-world"});
  if(reincarnationStoryRun(state))return Object.freeze({version:THIRD_WORLD_POST_FLOW_DRAIN_VERSION,ok:true,drained:false,presented:0,deferred:false,reason:"reincarnation-story-archived"});
  let presented=0;
  for(let guard=0;guard<12;guard++){
   if(typeof document!=="undefined"&&document.hidden)return Object.freeze({version:THIRD_WORLD_POST_FLOW_DRAIN_VERSION,ok:true,drained:presented>0,presented,deferred:true,reason:"hidden"});
   const p=ensureProgress({skipBackfill:true});if(!p)return Object.freeze({version:THIRD_WORLD_POST_FLOW_DRAIN_VERSION,ok:false,drained:presented>0,presented,deferred:true,reason:"progress-unavailable"});
   let arbitration=storyPendingArbitration(state,{expectedEra:"higher-dimensional"});
   if(arbitration.disposition==="empty"){const queued=queueThirdWorldEligibleStory({resume:false,progress:p});if(!queued)return Object.freeze({version:THIRD_WORLD_POST_FLOW_DRAIN_VERSION,ok:true,drained:presented>0,presented,deferred:false,reason:"complete"});arbitration=storyPendingArbitration(state,{expectedEra:"higher-dimensional"});}
   if(arbitration.disposition==="foreign")return Object.freeze({version:THIRD_WORLD_POST_FLOW_DRAIN_VERSION,ok:true,drained:presented>0,presented,deferred:true,reason:"foreign-pending-story",pendingStory:arbitration.pendingStory,pendingEra:arbitration.era});
   if(arbitration.disposition!=="own")return Object.freeze({version:THIRD_WORLD_POST_FLOW_DRAIN_VERSION,ok:false,drained:presented>0,presented,deferred:true,reason:"unknown-pending-story",pendingStory:arbitration.pendingStory});
   const pending=String(arbitration.pendingStory||""),descriptor=thirdWorldDescriptorForStory(pending);
   if(!descriptor)return Object.freeze({version:THIRD_WORLD_POST_FLOW_DRAIN_VERSION,ok:false,drained:presented>0,presented,deferred:true,reason:"story-arbitration-mismatch",pendingStory:pending});
   if(typeof window.waitForStoryClosed!=="function")return Object.freeze({version:THIRD_WORLD_POST_FLOW_DRAIN_VERSION,ok:false,drained:presented>0,presented,deferred:true,reason:"story-lifecycle-owner-missing",pendingStory:pending});
   if(typeof window.isStoryOpen!=="function"||window.isStoryOpen()!==true){if(!openFormalStory(pending))return Object.freeze({version:THIRD_WORLD_POST_FLOW_DRAIN_VERSION,ok:false,drained:presented>0,presented,deferred:true,reason:"story-open-failed",pendingStory:pending});}
   if(window.isStoryOpen(pending)!==true)return Object.freeze({version:THIRD_WORLD_POST_FLOW_DRAIN_VERSION,ok:true,drained:presented>0,presented,deferred:true,reason:"foreign-active-story",pendingStory:pending});
   const lifecycle=typeof window.activeStoryLifecycleSnapshot==="function"?window.activeStoryLifecycleSnapshot():null;if(!lifecycle||lifecycle.storyId!==pending||lifecycle.owner!=="formal")return Object.freeze({version:THIRD_WORLD_POST_FLOW_DRAIN_VERSION,ok:false,drained:presented>0,presented,deferred:true,reason:"story-identity-unavailable",pendingStory:pending});
   const closed=await window.waitForStoryClosed({storyId:pending,token:lifecycle.token,owner:"formal"});if(closed?.matched!==true)return Object.freeze({version:THIRD_WORLD_POST_FLOW_DRAIN_VERSION,ok:false,drained:presented>0,presented,deferred:true,reason:"story-lifecycle-mismatch",pendingStory:pending});presented++;
  }
  return Object.freeze({version:THIRD_WORLD_POST_FLOW_DRAIN_VERSION,ok:false,drained:presented>0,presented,deferred:true,reason:"guard-limit"});
 }
 function starterTypes(){return Array.isArray(EQUIPMENT_TYPES)?EQUIPMENT_TYPES:[];}function allStarterGearMissing(){const types=starterTypes();return !!types.length&&types.every(type=>!state?.equipment?.[type]);}function hasNoMainProgress(){if(Number(state?.level)!==1||Number(state?.exp)!==0||Number(state?.gold)!==0||Number(state?.unlockedMap)!==0)return false;if(Array.isArray(state?.inventory)&&state.inventory.length)return false;if(Array.isArray(state?.bossKilled)&&state.bossKilled.some(Boolean))return false;return true;}function brokenOnboardingGearState(){const p=readProgress();return !!p&&p.introCompleted===true&&p.starterGearReceived===true&&p.completedStories.length===1&&p.completedStories[0]===INTRO_STORY_ID&&hasNoMainProgress()&&allStarterGearMissing();}
 function ensureStarterEquipment(){const types=starterTypes();if(!types.length)return false;if(!state.equipment||typeof state.equipment!=="object"||Array.isArray(state.equipment))state.equipment={};const missing=types.filter(type=>!state.equipment[type]);if(!missing.length)return false;const generated=typeof starterEquipment==="function"?starterEquipment():null;missing.forEach(type=>{state.equipment[type]=generated?.[type]||makeItem(1,0,"normal",0,type);});if(typeof playerCombatStats==="function")state.hp=playerCombatStats().hp;persist();return true;}function repairBrokenOnboardingGear(){return brokenOnboardingGearState()?ensureStarterEquipment():false;}
 function esc(v){return String(v??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[ch]));}function gearLabel(type){return typeof equipmentTypeLabel==="function"?equipmentTypeLabel(type):({weapon:"武器",helmet:"頭盔",armor:"鎧甲",shoes:"鞋子",accessory:"飾品"}[type]||type);}function gearText(item){if(!item)return "未取得";return typeof itemHtml==="function"?itemHtml(item,true):esc(item.name||"作戰裝備");}
 function ensureStarterGearModal(){let modal=document.getElementById(MODAL_ID);if(modal)return modal;modal=document.createElement("div");modal.id=MODAL_ID;modal.className="starter-gear-overlay";modal.setAttribute("role","dialog");modal.setAttribute("aria-modal","true");document.body.appendChild(modal);return modal;}function showStarterGear(){if(starterGearOpen)return true;ensureStarterEquipment();const modal=ensureStarterGearModal();modal.innerHTML=`<div class="starter-gear-card"><h2>文明戰線・作戰裝備發放</h2><div class="starter-gear-intro">正式編制已完成。文明戰線已為你配發第一套基礎作戰裝備，確認後即可進入主畫面。</div><div class="starter-gear-list">${starterTypes().map(type=>`<div class="starter-gear-row"><div class="starter-gear-type">${esc(gearLabel(type))}</div><div>${gearText(state.equipment?.[type])}</div></div>`).join("")}</div><div class="starter-gear-actions"><button class="btn primary" onclick="confirmStarterGearReceived()">領取裝備</button></div></div>`;modal.classList.add("open");starterGearOpen=true;return true;}window.confirmStarterGearReceived=function(){ensureStarterEquipment();const p=ensureProgress();if(!p)return;p.starterGearReceived=true;if(typeof normalizeCurrentSaveState==="function")normalizeCurrentSaveState();persist();document.getElementById(MODAL_ID)?.remove();starterGearOpen=false;if(typeof go==="function")go("home");};
 function storyOrder(id){if(id===INTRO_STORY_ID)return 0;const galaxy=galaxyBossMapIndexForStory(id);if(galaxy!=null)return galaxy+1;const universe=universeBossIndexForStory(id);if(universe!=null)return 1001+universe;const third=typeof window.thirdWorldStoryTriggerDescriptor==="function"?window.thirdWorldStoryTriggerDescriptor(id):null;return third?2001+Math.max(0,Number(third.stage)||0):100000;}function completedStoryRows(){const p=readProgress(),stories=window.CIVILIZATION_STORIES||{};return p?p.completedStories.filter(id=>stories[id]).map(id=>stories[id]).sort((a,b)=>storyOrder(a.id)-storyOrder(b.id)):[];}window.replayCompletedStory=function(id){const p=readProgress();if(!p||!p.completedStories.includes(id)||!window.CIVILIZATION_STORIES?.[id])return false;return typeof openStory==="function"?openStory(id):false;};
 function authReady(){return window.CIVILIZATION_AUTH_REQUIRED!==true||!!window.civilizationAuthSession;}function backgroundReady(){return window.BACKGROUND_PRELOAD_READY===true;}function openFormalStory(id){if(typeof openStory!=="function")return false;if(typeof isStoryOpen==="function"&&isStoryOpen()){const lifecycle=typeof window.activeStoryLifecycleSnapshot==="function"?window.activeStoryLifecycleSnapshot():null;return isStoryOpen(id)===true&&lifecycle?.owner==="formal";}return openStory(id,{lifecycleOwner:"formal",onComplete:storyId=>{completeStory(storyId);queueResume();}});}function resume(){resumeQueued=false;if(typeof state==="undefined"||!state||!authReady()||!backgroundReady())return false;repairBrokenOnboardingGear();const p=ensureProgress();if(!p)return false;if(p.pendingStory){if(reincarnationStoryRun(state)&&!state?.thirdWorld?.entered&&storyEraForId(p.pendingStory)==="higher-dimensional")return false;if(openFormalStory(p.pendingStory))return true;console.error("Pending story is unavailable",p.pendingStory);return false;}if(!p.introCompleted&&!reincarnationStoryRun(state)){setPending(INTRO_STORY_ID,{progress:p});return openFormalStory(INTRO_STORY_ID);}if(!p.starterGearReceived)return showStarterGear();if(queueThirdWorldEligibleStory({progress:p}))return true;if(state?.thirdWorld?.entered===true&&typeof window.flushPendingPlayerTitleNoticeAfterFlow==="function")window.flushPendingPlayerTitleNoticeAfterFlow({source:"third-world-story-idle"});return false;}function queueResume(){if(resumeQueued)return;resumeQueued=true;queueMicrotask(resume);}

 function runStoryProgressBehaviorRegression(){
  const full=Number(window.THIRD_WORLD_BOSS_MAX_HP)||1100000000,alive=Array.from({length:10},()=>({currentHp:full})),dead=Array.from({length:10},()=>({currentHp:0})),checks=[];
  const record=(id,passed,data=null)=>checks.push(Object.freeze({id,passed:passed===true,data}));
  const foreign={thirdWorld:{entered:true,bosses:alive,story:{introSeen:false,unlockedStage:3,finalSeen:false}},storyProgress:{pendingStory:INTRO_STORY_ID,completedStories:[]}},foreignBefore=JSON.stringify(foreign),foreignDecision=storyPendingArbitration(foreign,{expectedEra:"higher-dimensional"});record("FOREIGN_PENDING_PRESERVED",foreignDecision.disposition==="foreign"&&foreignDecision.era==="galaxy"&&JSON.stringify(foreign)===foreignBefore,foreignDecision);
  const own={thirdWorld:{entered:true,bosses:alive,story:{introSeen:false,unlockedStage:3,finalSeen:false}},storyProgress:{pendingStory:"higher-dimensional-intro",completedStories:[]}},ownBefore=JSON.stringify(own),ownDecision=storyPendingArbitration(own,{expectedEra:"higher-dimensional"});record("W3_PENDING_OWNED",ownDecision.disposition==="own"&&ownDecision.era==="higher-dimensional"&&JSON.stringify(own)===ownBefore,ownDecision);
  const unknown={storyProgress:{pendingStory:"unknown-story-probe",completedStories:[]}},unknownBefore=JSON.stringify(unknown),unknownDecision=storyPendingArbitration(unknown,{expectedEra:"higher-dimensional"});record("UNKNOWN_PENDING_FAIL_CLOSED",unknownDecision.disposition==="unknown"&&JSON.stringify(unknown)===unknownBefore,unknownDecision);
  const intro={thirdWorld:{entered:true,completed:false,bosses:alive,story:{introSeen:false,unlockedStage:0,finalSeen:false}},storyProgress:{pendingStory:null,completedStories:[]}},introGate=thirdWorldStoryCompletionGate("higher-dimensional-intro",intro),introResult=applyThirdWorldStoryCompletion("higher-dimensional-intro",intro,introGate);record("INTRO_COMPLETION_TRANSITION",introResult.applied===true&&intro.thirdWorld.story.introSeen===true&&intro.thirdWorld.completed!==true,introResult);
  const blocked={thirdWorld:{entered:true,completed:false,bosses:alive,story:{introSeen:true,unlockedStage:10,finalSeen:false}},storyProgress:{pendingStory:null,completedStories:[]}},blockedGate=thirdWorldStoryCompletionGate("higher-dimensional-final",blocked);record("FINAL_FAILS_CLOSED_BEFORE_ALL_DEAD",blockedGate.allowed===false&&blocked.thirdWorld.story.finalSeen===false&&blocked.thirdWorld.completed===false,blockedGate);
  const finalTarget={thirdWorld:{entered:true,completed:false,bosses:dead,story:{introSeen:true,unlockedStage:10,finalSeen:false}},storyProgress:{pendingStory:null,completedStories:[]}},finalGate=thirdWorldStoryCompletionGate("higher-dimensional-final",finalTarget),finalResult=applyThirdWorldStoryCompletion("higher-dimensional-final",finalTarget,finalGate);record("FINAL_COMPLETION_ATOMIC",finalResult.applied===true&&finalTarget.thirdWorld.story.finalSeen===true&&finalTarget.thirdWorld.completed===true,finalResult);
  const failures=checks.filter(row=>!row.passed);return Object.freeze({version:STORY_PROGRESS_BEHAVIOR_REGRESSION_VERSION,passed:failures.length===0,checks:Object.freeze(checks),failures:Object.freeze(failures)});
 }
 function installUniverseFirstClearHook(){
  if(window.__universeStoryFirstClearHook)return true;const settle=window.settleSecondWorldBossVictory;if(typeof settle!=="function")return false;
  window.settleSecondWorldBossVictory=function(value,options={}){const result=settle(value,options);if(result?.ok&&result.firstKill===true&&!reincarnationStoryRun(state)){const id=queueUniverseBossStory(result.bossIndex);if(id)result.pendingStoryId=id;}return result;};
  const continuous=window.startSecondWorldBossContinuous,single=window.startSecondWorldBossBattle;if(typeof continuous==="function"&&typeof single==="function")window.startSecondWorldBossContinuous=function(value){const index=Math.floor(Number(value));if(!reincarnationStoryRun(state)&&window.secondWorldBossKilled?.(index)!==true&&window.CIVILIZATION_STORIES?.[universeBossStoryId(index)])return single(index);return continuous(index);};
  window.__universeStoryFirstClearHook=true;window.UNIVERSE_STORY_FIRST_CLEAR_HOOK_VERSION=1;return true;
 }
 window.civilizationStoryProgress={version:VERSION,thirdWorldStoryCompletionGate,applyThirdWorldStoryCompletion,reconcileThirdWorldStoryCompletionState,storyPendingArbitration,runBehaviorRegression:runStoryProgressBehaviorRegression,introStoryId:INTRO_STORY_ID,normalize:normalizeProgress,resume:queueResume,get:()=>readProgress(),setPending,completeStory,queueStory,queueBossStory,queueUniverseBossStory,thirdWorldEligibility:thirdWorldStoryEligibility,nextThirdWorldStory,queueThirdWorldEligibleStory,thirdWorldCompletionFramework:thirdWorldStoryCompletionFramework,consumeThirdWorldSettlement,drainThirdWorldPostFlowStories,bossStoryId:galaxyBossStoryId,universeBossStoryId,universeBossIndexForStory,backfillAvailableHistory:()=>{const changed=backfillAvailableHistory(state);if(changed)persist();return changed;},ensureStarterEquipment,completedStories:completedStoryRows};
 window.CIVILIZATION_STORY_PROGRESS_VERSION=VERSION;
 window.STORY_REINCARNATION_W1_W2_SUPPRESSION_VERSION=STORY_REINCARNATION_W1_W2_SUPPRESSION_VERSION;
 window.STORY_REINCARNATION_W3_ISOLATION_VERSION=STORY_REINCARNATION_W3_ISOLATION_VERSION;
 window.THIRD_WORLD_STORY_QUEUE_VERSION=THIRD_WORLD_QUEUE_VERSION;
 window.THIRD_WORLD_STORY_POST_FLOW_DRAIN_VERSION=THIRD_WORLD_POST_FLOW_DRAIN_VERSION;
 window.THIRD_WORLD_STORY_COMPLETION_OWNER_VERSION=THIRD_WORLD_STORY_COMPLETION_OWNER_VERSION;
 window.STORY_NORMALIZATION_CONVERGENCE_VERSION=STORY_NORMALIZATION_CONVERGENCE_VERSION;
 window.STORY_PENDING_ARBITRATION_VERSION=STORY_PENDING_ARBITRATION_VERSION;
 window.STORY_PROGRESS_BEHAVIOR_REGRESSION_VERSION=STORY_PROGRESS_BEHAVIOR_REGRESSION_VERSION;
 window.THIRD_WORLD_STORY_SETTLEMENT_BRIDGE_VERSION=THIRD_WORLD_SETTLEMENT_BRIDGE_VERSION;
 window.THIRD_WORLD_STORY_COMPLETION_FRAMEWORK_VERSION=THIRD_WORLD_COMPLETION_FRAMEWORK_VERSION;
 window.THIRD_WORLD_STORY_ELIGIBILITY_VERSION=THIRD_WORLD_ELIGIBILITY_VERSION;
 window.THIRD_WORLD_STORY_RELOAD_RECOVERY_VERSION=THIRD_WORLD_RELOAD_RECOVERY_VERSION;
 window.THIRD_WORLD_STORY_PLACEHOLDER_GUARD_VERSION=THIRD_WORLD_PLACEHOLDER_GUARD_VERSION;
 window.thirdWorldStoryEligibilitySnapshot=thirdWorldStoryEligibility;
 window.nextThirdWorldStoryCandidate=nextThirdWorldStory;
 window.queueThirdWorldEligibleStory=queueThirdWorldEligibleStory;
 window.thirdWorldStoryCompletionFramework=thirdWorldStoryCompletionFramework;
 window.consumeThirdWorldStorySettlement=consumeThirdWorldSettlement;
 window.drainThirdWorldPostFlowStories=drainThirdWorldPostFlowStories;
 installUniverseFirstClearHook();
 if(typeof state!=="undefined"&&state){normalizeProgress(state);repairBrokenOnboardingGear();persist();}window.addEventListener("civilization-background-ready-before-reveal",queueResume);window.addEventListener("civilization-auth-ready",queueResume);if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",queueResume,{once:true});else queueResume();
})();