(function(){
 const WORLD_PHASE_VERSION=1;
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
   calamities:blankCalamities()
  };
 }
 function normalizeBossKilled(value){
  const source=Array.isArray(value)?value:[];
  return Array.from({length:SECOND_WORLD_MAIN_BOSS_COUNT},(_,index)=>source[index]===true);
 }
 function normalizeCalamities(value){
  const source=Array.isArray(value)?value:[];
  return Array.from({length:SECOND_WORLD_CALAMITY_COUNT},(_,index)=>{
   const row=isObject(source[index])?source[index]:{};
   const hp=Number(row.currentHp);
   return {
    currentHp:Number.isFinite(hp)&&hp>0?Math.max(1,Math.floor(hp)):null,
    trueKills:Math.max(0,Math.min(30,finiteCount(row.trueKills)))
   };
  });
 }
 function normalizeSecondWorldState(target){
  if(!isObject(target))return target;
  const source=isObject(target.secondWorld)?target.secondWorld:{};
  const mainline=isObject(source.mainline)?source.mainline:{};
  target.secondWorld={
   entered:source.entered===true,
   mainline:{bossKilled:normalizeBossKilled(mainline.bossKilled)},
   darkMatter:finiteCount(source.darkMatter),
   darkEnergy:finiteCount(source.darkEnergy),
   calamities:normalizeCalamities(source.calamities)
  };
  return target;
 }
 function secondWorldState(target=state){
  if(!isObject(target))return createBlankSecondWorldState();
  normalizeSecondWorldState(target);
  return target.secondWorld;
 }
 function isSecondWorldEntered(target=state){return secondWorldState(target).entered===true;}
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
  const requiredLevel=20;
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

 // Batch 1 intentionally does not perform the irreversible transition.
 // The formal entry point exists so later UI can depend on one owner without mutating state yet.
 function enterSecondWorld(){
  return {ok:false,reason:"transition-not-enabled",requirements:secondWorldEntryRequirements(state)};
 }

 window.WORLD_PHASE_VERSION=WORLD_PHASE_VERSION;
 window.SECOND_WORLD_MAIN_BOSS_COUNT=SECOND_WORLD_MAIN_BOSS_COUNT;
 window.SECOND_WORLD_CALAMITY_COUNT=SECOND_WORLD_CALAMITY_COUNT;
 window.createBlankSecondWorldState=createBlankSecondWorldState;
 window.normalizeSecondWorldState=normalizeSecondWorldState;
 window.secondWorldEntryRequirements=secondWorldEntryRequirements;
 window.canEnterSecondWorld=canEnterSecondWorld;
 window.isSecondWorldEntered=isSecondWorldEntered;
 window.firstWorldProgressionEnabled=firstWorldProgressionEnabled;
 window.secondWorldProgressionEnabled=secondWorldProgressionEnabled;
 window.enterSecondWorld=enterSecondWorld;
 if(typeof registerNewStateNormalizer==="function")registerNewStateNormalizer(normalizeSecondWorldState);
})();
