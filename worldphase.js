(function(){
 const WORLD_PHASE_VERSION=6;
 const SECOND_WORLD_MAIN_BOSS_COUNT=100;
 const SECOND_WORLD_CALAMITY_COUNT=10;
 const WORLD_PHASE_METADATA=Object.freeze({
  1:Object.freeze({index:1,id:"galaxy",stateKey:null,name:"銀河紀元"}),
  2:Object.freeze({index:2,id:"universe",stateKey:"secondWorld",name:"宇宙紀元"}),
  3:Object.freeze({index:3,id:"higher-dimensional",stateKey:"thirdWorld",name:"高維紀元"})
 });

 function isObject(value){return !!value&&typeof value==="object"&&!Array.isArray(value);}
 function finiteCount(value){const n=Math.floor(Number(value));return Number.isFinite(n)&&n>=0?n:0;}
 function worldIndexOrNull(value){const n=Number(value);return Number.isInteger(n)&&n>=1&&n<=3?n:null;}
 function worldPhaseMeta(value){const index=worldIndexOrNull(value);return index?WORLD_PHASE_METADATA[index]:null;}
 function blankBossKilled(){return Array(SECOND_WORLD_MAIN_BOSS_COUNT).fill(false);}
 function blankCalamities(){return Array.from({length:SECOND_WORLD_CALAMITY_COUNT},()=>({currentHp:null,trueKills:0}));}
 function createBlankSecondWorldState(){return {entered:false,mainline:{bossKilled:blankBossKilled()},darkMatter:0,darkEnergy:0,civilizationLevel:0,calamities:blankCalamities()};}
 function normalizeBossKilled(value){const source=Array.isArray(value)?value:[];return Array.from({length:SECOND_WORLD_MAIN_BOSS_COUNT},(_,index)=>source[index]===true);}
 function normalizeCalamities(value){const source=Array.isArray(value)?value:[];return Array.from({length:SECOND_WORLD_CALAMITY_COUNT},(_,index)=>isObject(source[index])?{...source[index]}:{currentHp:null,trueKills:0});}
 function civilizationFloorFromCalamities(value){const rows=Array.isArray(value)?value:[];let level=0;for(let index=0;index<SECOND_WORLD_CALAMITY_COUNT;index++){if(finiteCount(rows[index]?.trueKills)>=30)level=index+1;else break;}return level;}
 function normalizeSecondWorldState(target){
  if(!isObject(target))return target;
  const source=isObject(target.secondWorld)?target.secondWorld:{},mainline=isObject(source.mainline)?source.mainline:{},calamities=normalizeCalamities(source.calamities);
  const storedCivilizationLevel=Math.max(0,Math.min(10,finiteCount(source.civilizationLevel))),inferredCivilizationLevel=civilizationFloorFromCalamities(calamities);
  target.secondWorld={...source,entered:source.entered===true,mainline:{...mainline,bossKilled:normalizeBossKilled(mainline.bossKilled)},darkMatter:finiteCount(source.darkMatter),darkEnergy:finiteCount(source.darkEnergy),civilizationLevel:Math.max(storedCivilizationLevel,inferredCivilizationLevel),calamities};
  return target;
 }
 function secondWorldState(target=state){if(!isObject(target))return createBlankSecondWorldState();return isObject(target.secondWorld)?target.secondWorld:createBlankSecondWorldState();}
 function isSecondWorldEntered(target=state){return !!(isObject(target)&&isObject(target.secondWorld)&&target.secondWorld.entered===true);}
 function isThirdWorldEntered(target=state){return !!(isObject(target)&&isObject(target.thirdWorld)&&target.thirdWorld.entered===true);}
 function isWorldEntered(world,target=state){const index=worldIndexOrNull(world);if(!index)return false;if(index===1)return true;if(index===2)return isSecondWorldEntered(target);return isThirdWorldEntered(target);}
 function currentWorldPhase(target=state){if(isThirdWorldEntered(target))return 3;if(isSecondWorldEntered(target))return 2;return 1;}
 function worldProgressionEnabled(world,target=state){const index=worldIndexOrNull(world);return !!index&&index===currentWorldPhase(target);}
 function firstWorldProgressionEnabled(target=state){return worldProgressionEnabled(1,target);}
 function secondWorldProgressionEnabled(target=state){return worldProgressionEnabled(2,target);}
 function thirdWorldProgressionEnabled(target=state){return worldProgressionEnabled(3,target);}
 function worldPhaseSnapshot(target=state){const current=currentWorldPhase(target),meta=worldPhaseMeta(current);return {current,currentId:meta?.id||"",currentName:meta?.name||"",entered:{1:true,2:isSecondWorldEntered(target),3:isThirdWorldEntered(target)},progression:{1:worldProgressionEnabled(1,target),2:worldProgressionEnabled(2,target),3:worldProgressionEnabled(3,target)}};}

 function specializationRequirement(target,requiredLevel=null){
  const keys=Array.isArray(window.SPECIALIZATION_KEYS)?window.SPECIALIZATION_KEYS:[];
  const fallback=Math.max(0,Math.floor(Number(window.SPECIALIZATION_MAX_LEVEL)||60));
  const required=Math.max(0,Math.floor(Number(requiredLevel??fallback)||fallback)),total=keys.length;
  const completed=keys.filter(key=>Math.floor(Number(target?.specializations?.[key])||0)>=required).length;
  return {ok:total===8&&completed===total,completed,total:total||8,requiredLevel:required};
 }
 function enhancementRequirement(target,requiredLevel=null){
  const slots=Array.isArray(window.ENHANCEMENT_SLOTS)?Array.from(window.ENHANCEMENT_SLOTS):["weapon","helmet","armor","shoes","accessory"];
  const fallback=Math.max(0,Math.floor(Number(window.FIRST_WORLD_ENHANCEMENT_CAP)||20));
  const required=Math.max(0,Math.floor(Number(requiredLevel??fallback)||fallback)),total=slots.length;
  const completed=slots.filter(slot=>Math.floor(Number(target?.enhancement?.levels?.[slot])||0)>=required).length;
  return {ok:total===5&&completed===total,completed,total:total||5,requiredLevel:required};
 }
 function markRequirement(target,requiredLevel=null){
  const ids=Array.from(window.CIVILIZATION_MARK_IDS||[]);
  const fallback=Math.max(0,Math.floor(Number(window.MARK_MAX_LEVEL)||10));
  const required=Math.max(0,Math.floor(Number(requiredLevel??fallback)||fallback)),total=ids.length;
  const completed=ids.filter(id=>Math.floor(Number(target?.marks?.entries?.[id]?.level)||0)>=required).length;
  return {ok:total===10&&completed===total,completed,total:total||10,requiredLevel:required};
 }
 function summarizeWorldEntryRequirements(rows,alreadyEntered=false,extra={}){
  const list=Array.isArray(rows)?rows.filter(Boolean):[],completed=list.filter(row=>row?.ok===true).length;
  return {...extra,eligible:completed===list.length&&list.length>0&&alreadyEntered!==true,alreadyEntered:alreadyEntered===true,completed,total:list.length};
 }

 function finalFirstWorldMapIndex(){if(Array.isArray(MAPS)&&MAPS.length)return MAPS.length-1;return 99;}
 function finalFirstWorldStoryId(){const mapIndex=finalFirstWorldMapIndex();if(!Array.isArray(WORLD_REGIONS))return null;const region=WORLD_REGIONS.find(row=>mapIndex>=Number(row?.mapStart)&&mapIndex<=Number(row?.mapEnd));if(!region?.id)return null;return `${region.id}-boss-${mapIndex-Number(region.mapStart)+1}`;}
 function finalFirstWorldBossKilled(target){const index=finalFirstWorldMapIndex();return Array.isArray(target?.bossKilled)&&target.bossKilled[index]===true;}
 function finalFirstWorldStoryCompleted(target){const storyId=finalFirstWorldStoryId();if(!storyId)return false;const completed=target?.storyProgress?.completedStories;return Array.isArray(completed)&&completed.includes(storyId);}
 function secondWorldEntryRequirements(target=state){
  const levelCurrent=Math.max(1,Math.floor(Number(target?.level)||1)),level={ok:levelCurrent>=500,current:levelCurrent,required:500};
  const bossCompleted=finalFirstWorldBossKilled(target),finalStoryCompleted=finalFirstWorldStoryCompleted(target),mainline={ok:bossCompleted&&finalStoryCompleted,bossCompleted,finalStoryCompleted,finalStoryId:finalFirstWorldStoryId()};
  const specializations=specializationRequirement(target),enhancement=enhancementRequirement(target),marks=markRequirement(target);
  return summarizeWorldEntryRequirements([level,mainline,specializations,enhancement,marks],isSecondWorldEntered(target),{level,mainline,specializations,enhancement,marks});
 }
 function canEnterSecondWorld(target=state){return secondWorldEntryRequirements(target).eligible===true;}
 function primaryResourceSnapshot(target=state){const phase=currentWorldPhase(target);if(phase===3)return {label:"維度之弦",amount:finiteCount(target?.thirdWorld?.dimensionalStrings),secondaryLabel:null,secondaryAmount:0};if(phase===2)return {label:"暗物質",amount:finiteCount(target?.secondWorld?.darkMatter),secondaryLabel:"暗能量",secondaryAmount:finiteCount(target?.secondWorld?.darkEnergy)};return {label:"金幣",amount:finiteCount(target?.gold),secondaryLabel:null,secondaryAmount:0};}
 function cloneState(value){try{return JSON.parse(JSON.stringify(value));}catch(e){return null;}}
 function clearFirstWorldCalamityResidualHp(target){const entries=target?.calamities?.entries;if(!isObject(entries))return;Object.values(entries).forEach(entry=>{if(isObject(entry))entry.currentHp=null;});}
 function resetOfflineStateForWorldTransition(target){
  if(!isObject(target))return false;
  if(!isObject(target.offline))target.offline={};
  const t=Date.now();
  target.offline.lastSettledAt=t;
  target.offline.farmMap=null;
  target.offline.farmEnemy=null;
  target.offline.avgBattleMs=0;
  target.offline.sampleCount=0;
  target.offline.battleSamples=[];
  target.offline.pendingSettlement=null;
  target.offline.maxObservedWallClock=t;
  target.offline.timeLockUntil=0;
  return true;
 }
 function clearFirstWorldOfflineState(target){return resetOfflineStateForWorldTransition(target);}
 function resetPendingBlackMarketForWorldTransition(target){if(!isObject(target))return false;target.pendingBlackMarketEncounter=false;return true;}
 function restoreLostGearForWorldTransition(target){
  if(!isObject(target))return {restored:0};
  if(!Array.isArray(target.inventory))target.inventory=[];
  const rows=Array.isArray(target.lostGear)?target.lostGear:[];
  let restored=0;
  rows.forEach(entry=>{const item=entry?.item;if(item&&typeof item==="object"){target.inventory.push(item);restored++;}});
  target.lostGear=[];
  return {restored};
 }
 function worldTransitionRuntimeStatus(){
  const blockers=[];
  try{if(typeof battleBusy!=="undefined"&&battleBusy===true)blockers.push("battle-busy");}catch(e){}
  if(window.activeMainBattleContext)blockers.push("mainline-active");
  if(window.activeSecondWorldMainlineContext)blockers.push("second-world-mainline-active");
  if(typeof window.isMinimalModeOpen==="function"&&window.isMinimalModeOpen())blockers.push("minimal-mode-open");
  return {blocked:blockers.length>0,blockers};
 }
 function resetWorldTransitionTransientRuntime(){
  try{if(typeof window.backgroundProgressStop==="function")window.backgroundProgressStop("main");}catch(e){}
  try{if(typeof window.closeMinimalMode==="function")window.closeMinimalMode();}catch(e){}
  window.activeMainBattleContext=null;
  window.activeSecondWorldMainlineContext=null;
  window.currentCombatEncounter=null;
  window.activeSpecialEncounter=null;
  return true;
 }
 function transitionContext(phase,requirements){return Object.freeze({phase,requirements:requirements||null,committed:phase==="postcommit"});}
 function runWorldTransition(config={}){
  const requirements=typeof config.requirements==="function"?config.requirements(state):config.requirements;
  if(requirements?.alreadyEntered===true)return {ok:false,reason:"already-entered",requirements};
  if(requirements&&requirements.eligible!==true)return {ok:false,reason:"requirements-incomplete",requirements};
  if(typeof config.runtimeStatus==="function"){
   const runtime=config.runtimeStatus();
   if(runtime?.blocked===true)return {ok:false,reason:"active-runtime",runtime,requirements};
  }
  const backup=cloneState(state);if(!backup)return {ok:false,reason:"backup-failed",requirements};
  try{
   const context=transitionContext("precommit",requirements);
   if(typeof config.mutate==="function")config.mutate(state,requirements,context);
   if(typeof config.prepareBeforeSave==="function")config.prepareBeforeSave(state,requirements,context);
   const saved=typeof save==="function"?save(false):false;
   if(saved!==true){state=backup;return {ok:false,reason:"save-failed",requirements};}
  }catch(error){state=backup;return {ok:false,reason:"transition-failed",error:String(error?.message||error),requirements};}
  let postCommitError="";
  try{if(typeof config.finalizeAfterSave==="function")config.finalizeAfterSave(state,requirements,transitionContext("postcommit",requirements));}catch(error){postCommitError=String(error?.message||error);console.error("[文明戰線] World transition committed, but post-commit finalization failed.",error);}
  const marker=String(config.sessionMarker||"").trim();if(marker){try{sessionStorage.setItem(marker,"1");}catch(e){}}
  if(config.reload!==false)setTimeout(()=>{try{location.reload();}catch(e){}},0);
  return {ok:true,reloading:config.reload!==false,requirements,postCommitError};
 }
 function enterSecondWorld(){return runWorldTransition({requirements:()=>secondWorldEntryRequirements(state),mutate:target=>{const next=createBlankSecondWorldState();next.entered=true;target.secondWorld=next;target.gold=0;if(!isObject(target.enhancement))target.enhancement={};target.enhancement.basicStones=0;target.enhancement.advancedStones=0;target.lostGear=[];resetPendingBlackMarketForWorldTransition(target);clearFirstWorldCalamityResidualHp(target);resetOfflineStateForWorldTransition(target);if(typeof playerCombatStats==="function")target.hp=playerCombatStats().hp;else if(typeof normalizeHP==="function")normalizeHP();},prepareBeforeSave:()=>{if(typeof window.prepareOfflineCheckpointForWorldTransition==="function")window.prepareOfflineCheckpointForWorldTransition();},finalizeAfterSave:()=>{if(typeof window.finalizeOfflineCheckpointForWorldTransition==="function")window.finalizeOfflineCheckpointForWorldTransition();},sessionMarker:"civilization_second_world_just_entered_v1"});}

 window.WORLD_PHASE_VERSION=WORLD_PHASE_VERSION;
 window.WORLD_PHASE_SHARED_CORE_VERSION=3;
 window.WORLD_PHASE_ENTRY_REQUIREMENT_CORE_VERSION=1;
 window.WORLD_PHASE_METADATA=WORLD_PHASE_METADATA;
 window.WORLD_PHASE_METADATA_VERSION=2;
 window.worldPhaseMeta=worldPhaseMeta;
 window.currentWorldPhase=currentWorldPhase;
 window.isWorldEntered=isWorldEntered;
 window.worldProgressionEnabled=worldProgressionEnabled;
 window.worldPhaseSnapshot=worldPhaseSnapshot;
 window.worldPhaseSpecializationRequirement=specializationRequirement;
 window.worldPhaseEnhancementRequirement=enhancementRequirement;
 window.worldPhaseMarkRequirement=markRequirement;
 window.summarizeWorldEntryRequirements=summarizeWorldEntryRequirements;
 window.WORLD_PHASE_SAFE_TRANSITION_VERSION=3;
 window.WORLD_PHASE_TRANSITION_CALLBACK_CONTRACT_VERSION=1;
 window.WORLD_TRANSITION_CLEANUP_VERSION=1;
 window.WORLD_TRANSITION_RUNTIME_GUARD_VERSION=1;
 window.runWorldTransition=runWorldTransition;
 window.worldTransitionRuntimeStatus=worldTransitionRuntimeStatus;
 window.resetOfflineStateForWorldTransition=resetOfflineStateForWorldTransition;
 window.restoreLostGearForWorldTransition=restoreLostGearForWorldTransition;
 window.resetWorldTransitionTransientRuntime=resetWorldTransitionTransientRuntime;
 window.WORLD_PHASE_PRIMARY_RESOURCE_VERSION=2;
 window.WORLD_PHASE_ENHANCEMENT_REQUIREMENT_OWNER_VERSION=2;
 window.SECOND_WORLD_MAIN_BOSS_COUNT=SECOND_WORLD_MAIN_BOSS_COUNT;
 window.SECOND_WORLD_CALAMITY_COUNT=SECOND_WORLD_CALAMITY_COUNT;
 window.createBlankSecondWorldState=createBlankSecondWorldState;
 window.SECOND_WORLD_CIVILIZATION_STATE_VERSION=1;
 window.SECOND_WORLD_STATE_PRESERVE_UNKNOWN_VERSION=1;
 window.SECOND_WORLD_ENTRY_PURE_READ_VERSION=2;
 window.SECOND_WORLD_CIVILIZATION_RECONCILIATION_VERSION=1;
 window.SECOND_WORLD_CALAMITY_STRUCTURE_OWNER_VERSION=1;
 window.secondWorldCivilizationFloorFromCalamities=civilizationFloorFromCalamities;
 window.normalizeSecondWorldState=normalizeSecondWorldState;
 window.finalFirstWorldStoryId=finalFirstWorldStoryId;
 window.isFinalFirstWorldStoryId=function(id){return !!id&&id===finalFirstWorldStoryId();};
 window.primaryWorldResourceSnapshot=primaryResourceSnapshot;
 window.secondWorldEntryRequirements=secondWorldEntryRequirements;
 window.canEnterSecondWorld=canEnterSecondWorld;
 window.isSecondWorldEntered=isSecondWorldEntered;
 window.isThirdWorldEntered=isThirdWorldEntered;
 window.firstWorldProgressionEnabled=firstWorldProgressionEnabled;
 window.secondWorldProgressionEnabled=secondWorldProgressionEnabled;
 window.thirdWorldProgressionEnabled=thirdWorldProgressionEnabled;
 window.resetPendingBlackMarketForWorldTransition=resetPendingBlackMarketForWorldTransition;
 window.PENDING_BLACK_MARKET_WORLD_TRANSITION_VERSION=1;
 window.enterSecondWorld=enterSecondWorld;
 if(typeof registerNewStateNormalizer==="function")registerNewStateNormalizer(normalizeSecondWorldState);
})();
