(function(){
 const WORLD_PHASE_VERSION=3;
 const SECOND_WORLD_MAIN_BOSS_COUNT=100;
 const SECOND_WORLD_CALAMITY_COUNT=10;

 function isObject(value){return !!value&&typeof value==="object"&&!Array.isArray(value);}
 function finiteCount(value){const n=Math.floor(Number(value));return Number.isFinite(n)&&n>=0?n:0;}
 function blankBossKilled(){return Array(SECOND_WORLD_MAIN_BOSS_COUNT).fill(false);}
 function blankCalamities(){return Array.from({length:SECOND_WORLD_CALAMITY_COUNT},()=>({currentHp:null,trueKills:0}));}
 function createBlankSecondWorldState(){
  return {
   entered:false,
   mainline:{bossKilled:blankBossKilled()},
   darkMatter:0,
   darkEnergy:0,
   civilizationLevel:0,
   calamities:blankCalamities()
  };
 }
 function normalizeBossKilled(value){
  const source=Array.isArray(value)?value:[];
  return Array.from({length:SECOND_WORLD_MAIN_BOSS_COUNT},(_,index)=>source[index]===true);
 }
 function normalizeCalamities(value){
  const source=Array.isArray(value)?value:[];
  return Array.from({length:SECOND_WORLD_CALAMITY_COUNT},(_,index)=>isObject(source[index])?{...source[index]}:{currentHp:null,trueKills:0});
 }
 function civilizationFloorFromCalamities(value){
  const rows=Array.isArray(value)?value:[];
  let level=0;
  for(let index=0;index<SECOND_WORLD_CALAMITY_COUNT;index++){
   if(finiteCount(rows[index]?.trueKills)>=30)level=index+1;
   else break;
  }
  return level;
 }
 function normalizeSecondWorldState(target){
  if(!isObject(target))return target;
  const source=isObject(target.secondWorld)?target.secondWorld:{};
  const mainline=isObject(source.mainline)?source.mainline:{};
  const calamities=normalizeCalamities(source.calamities);
  const storedCivilizationLevel=Math.max(0,Math.min(10,finiteCount(source.civilizationLevel)));
  const inferredCivilizationLevel=civilizationFloorFromCalamities(calamities);
  target.secondWorld={
   ...source,
   entered:source.entered===true,
   mainline:{...mainline,bossKilled:normalizeBossKilled(mainline.bossKilled)},
   darkMatter:finiteCount(source.darkMatter),
   darkEnergy:finiteCount(source.darkEnergy),
   civilizationLevel:Math.max(storedCivilizationLevel,inferredCivilizationLevel),
   calamities
  };
  return target;
 }
 function secondWorldState(target=state){
  if(!isObject(target))return createBlankSecondWorldState();
  return isObject(target.secondWorld)?target.secondWorld:createBlankSecondWorldState();
 }
 function isSecondWorldEntered(target=state){
  return !!(isObject(target)&&isObject(target.secondWorld)&&target.secondWorld.entered===true);
 }
 function firstWorldProgressionEnabled(target=state){return !isSecondWorldEntered(target);}
 function secondWorldProgressionEnabled(target=state){return isSecondWorldEntered(target);}

 function finalFirstWorldMapIndex(){
  if(Array.isArray(MAPS)&&MAPS.length)return MAPS.length-1;
  return 99;
 }
 function finalFirstWorldStoryId(){
  const mapIndex=finalFirstWorldMapIndex();
  if(!Array.isArray(WORLD_REGIONS))return null;
  const region=WORLD_REGIONS.find(row=>mapIndex>=Number(row?.mapStart)&&mapIndex<=Number(row?.mapEnd));
  if(!region?.id)return null;
  return `${region.id}-boss-${mapIndex-Number(region.mapStart)+1}`;
 }
 function finalFirstWorldBossKilled(target){
  const index=finalFirstWorldMapIndex();
  return Array.isArray(target?.bossKilled)&&target.bossKilled[index]===true;
 }
 function finalFirstWorldStoryCompleted(target){
  const storyId=finalFirstWorldStoryId();
  if(!storyId)return false;
  const completed=target?.storyProgress?.completedStories;
  return Array.isArray(completed)&&completed.includes(storyId);
 }
 function specializationRequirement(target){
  const keys=Array.isArray(window.SPECIALIZATION_KEYS)?window.SPECIALIZATION_KEYS:[];
  const max=Math.max(0,Math.floor(Number(window.SPECIALIZATION_MAX_LEVEL)||60));
  const total=keys.length;
  const completed=keys.filter(key=>Math.floor(Number(target?.specializations?.[key])||0)>=max).length;
  return {ok:total===8&&completed===total,completed,total:total||8,requiredLevel:max};
 }
 function enhancementRequirement(target){
  const slots=Array.isArray(window.ENHANCEMENT_SLOTS)?Array.from(window.ENHANCEMENT_SLOTS):["weapon","helmet","armor","shoes","accessory"];
  const requiredLevel=Math.max(0,Math.floor(Number(window.FIRST_WORLD_ENHANCEMENT_CAP)||20));
  const total=slots.length;
  const completed=slots.filter(slot=>Math.floor(Number(target?.enhancement?.levels?.[slot])||0)>=requiredLevel).length;
  return {ok:total===5&&completed===total,completed,total:total||5,requiredLevel};
 }
 function markRequirement(target){
  const ids=Array.from(window.CIVILIZATION_MARK_IDS||[]);
  const requiredLevel=Math.max(0,Math.floor(Number(window.MARK_MAX_LEVEL)||10));
  const total=ids.length;
  const completed=ids.filter(id=>Math.floor(Number(target?.marks?.entries?.[id]?.level)||0)>=requiredLevel).length;
  return {ok:total===10&&completed===total,completed,total:total||10,requiredLevel};
 }
 function secondWorldEntryRequirements(target=state){
  const levelCurrent=Math.max(1,Math.floor(Number(target?.level)||1));
  const level={ok:levelCurrent>=500,current:levelCurrent,required:500};
  const bossCompleted=finalFirstWorldBossKilled(target);
  const finalStoryCompleted=finalFirstWorldStoryCompleted(target);
  const mainline={ok:bossCompleted&&finalStoryCompleted,bossCompleted,finalStoryCompleted,finalStoryId:finalFirstWorldStoryId()};
  const specializations=specializationRequirement(target);
  const enhancement=enhancementRequirement(target);
  const marks=markRequirement(target);
  const rows=[level,mainline,specializations,enhancement,marks];
  const completed=rows.filter(row=>row.ok).length;
  return {
   eligible:completed===rows.length&&!isSecondWorldEntered(target),
   alreadyEntered:isSecondWorldEntered(target),
   completed,
   total:rows.length,
   level,
   mainline,
   specializations,
   enhancement,
   marks
  };
 }
 function canEnterSecondWorld(target=state){return secondWorldEntryRequirements(target).eligible===true;}
 function primaryResourceSnapshot(target=state){
  if(isSecondWorldEntered(target))return {label:"暗物質",amount:finiteCount(target?.secondWorld?.darkMatter),secondaryLabel:"暗能量",secondaryAmount:finiteCount(target?.secondWorld?.darkEnergy)};
  return {label:"金幣",amount:finiteCount(target?.gold),secondaryLabel:null,secondaryAmount:0};
 }
 function cloneState(value){try{return JSON.parse(JSON.stringify(value));}catch(e){return null;}}
 function clearFirstWorldCalamityResidualHp(target){
  const entries=target?.calamities?.entries;
  if(!isObject(entries))return;
  Object.values(entries).forEach(entry=>{if(isObject(entry))entry.currentHp=null;});
 }
 function clearFirstWorldOfflineState(target){
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
 }
 function resetPendingBlackMarketForWorldTransition(target){
  if(!isObject(target))return false;
  target.pendingBlackMarketEncounter=false;
  return true;
 }
 function enterSecondWorld(){
  const requirements=secondWorldEntryRequirements(state);
  if(requirements.alreadyEntered)return {ok:false,reason:"already-entered",requirements};
  if(!requirements.eligible)return {ok:false,reason:"requirements-incomplete",requirements};
  const backup=cloneState(state);
  if(!backup)return {ok:false,reason:"backup-failed",requirements};
  try{
   const next=createBlankSecondWorldState();
   next.entered=true;
   state.secondWorld=next;
   state.gold=0;
   if(!isObject(state.enhancement))state.enhancement={};
   state.enhancement.basicStones=0;
   state.enhancement.advancedStones=0;
   state.lostGear=[];
   resetPendingBlackMarketForWorldTransition(state);
   clearFirstWorldCalamityResidualHp(state);
   clearFirstWorldOfflineState(state);
   if(typeof window.prepareOfflineCheckpointForWorldTransition==="function")window.prepareOfflineCheckpointForWorldTransition();
   if(typeof playerCombatStats==="function")state.hp=playerCombatStats().hp;
   else if(typeof normalizeHP==="function")normalizeHP();
   const saved=typeof save==="function"?save(false):false;
   if(saved!==true){
    state=backup;
    return {ok:false,reason:"save-failed",requirements};
   }
   if(typeof window.finalizeOfflineCheckpointForWorldTransition==="function")window.finalizeOfflineCheckpointForWorldTransition();
   try{sessionStorage.setItem("civilization_second_world_just_entered_v1","1");}catch(e){}
   setTimeout(()=>{try{location.reload();}catch(e){}},0);
   return {ok:true,reloading:true};
  }catch(error){
   state=backup;
   return {ok:false,reason:"transition-failed",error:String(error?.message||error),requirements};
  }
 }

 window.WORLD_PHASE_VERSION=WORLD_PHASE_VERSION;
 window.WORLD_PHASE_ENHANCEMENT_REQUIREMENT_OWNER_VERSION=1;
 window.SECOND_WORLD_MAIN_BOSS_COUNT=SECOND_WORLD_MAIN_BOSS_COUNT;
 window.SECOND_WORLD_CALAMITY_COUNT=SECOND_WORLD_CALAMITY_COUNT;
 window.createBlankSecondWorldState=createBlankSecondWorldState;
 window.SECOND_WORLD_CIVILIZATION_STATE_VERSION=1;
 window.SECOND_WORLD_STATE_PRESERVE_UNKNOWN_VERSION=1;
 window.SECOND_WORLD_ENTRY_PURE_READ_VERSION=1;
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
 window.firstWorldProgressionEnabled=firstWorldProgressionEnabled;
 window.secondWorldProgressionEnabled=secondWorldProgressionEnabled;
 window.resetPendingBlackMarketForWorldTransition=resetPendingBlackMarketForWorldTransition;
 window.PENDING_BLACK_MARKET_WORLD_TRANSITION_VERSION=1;
 window.enterSecondWorld=enterSecondWorld;
 if(typeof registerNewStateNormalizer==="function")registerNewStateNormalizer(normalizeSecondWorldState);
})();
