(function(){
 const VERSION=3;
 const THIRD_WORLD_BOSS_COUNT=10;
 const THIRD_WORLD_BOSS_MAX_HP=1100000000;
 const THIRD_WORLD_CORE_MAX_LEVEL=10;
 const THIRD_WORLD_STORY_MAX_STAGE=10;
 const THIRD_WORLD_ENTRY_LEVEL=1000;
 const THIRD_WORLD_ENTRY_ENHANCEMENT_LEVEL=40;
 const THIRD_WORLD_ENTRY_CIVILIZATION_LEVEL=10;
 const THIRD_WORLD_ENTRY_VIP_LEVEL=20;
 const THIRD_WORLD_ENTRY_SPECIALIZATION_LEVEL=60;
 const THIRD_WORLD_ENTRY_MARK_LEVEL=10;
 const THIRD_WORLD_PERSISTENT_KEYS=Object.freeze(["entered","completed","dimensionalStrings","coreLevel","bosses","story"]);
 const THIRD_WORLD_BOSS_PERSISTENT_KEYS=Object.freeze(["currentHp"]);
 const THIRD_WORLD_STORY_PERSISTENT_KEYS=Object.freeze(["introSeen","unlockedStage","finalSeen"]);

 function isObject(value){return !!value&&typeof value==="object"&&!Array.isArray(value);}
 function finiteWhole(value,fallback=0){if(value==null)return fallback;const n=Math.floor(Number(value));return Number.isFinite(n)?n:fallback;}
 function clamp(value,min,max){return Math.max(min,Math.min(max,value));}
 function blankBosses(){return Array.from({length:THIRD_WORLD_BOSS_COUNT},()=>({currentHp:THIRD_WORLD_BOSS_MAX_HP}));}
 function createBlankThirdWorldState(){return {entered:false,completed:false,dimensionalStrings:0,coreLevel:0,bosses:blankBosses(),story:{introSeen:false,unlockedStage:0,finalSeen:false}};}
 function normalizeBosses(value){const source=Array.isArray(value)?value:[];return Array.from({length:THIRD_WORLD_BOSS_COUNT},(_,index)=>{const row=isObject(source[index])?source[index]:{},hp=clamp(finiteWhole(row.currentHp,THIRD_WORLD_BOSS_MAX_HP),0,THIRD_WORLD_BOSS_MAX_HP);return {currentHp:hp};});}
 function normalizeStory(value){const source=isObject(value)?value:{};return {introSeen:source.introSeen===true,unlockedStage:clamp(finiteWhole(source.unlockedStage,0),0,THIRD_WORLD_STORY_MAX_STAGE),finalSeen:source.finalSeen===true};}
 function normalizeThirdWorldState(target){
  if(!isObject(target))return target;
  const source=isObject(target.thirdWorld)?target.thirdWorld:{},entered=source.entered===true||source.completed===true;
  target.thirdWorld={entered,completed:source.completed===true,dimensionalStrings:Math.max(0,finiteWhole(source.dimensionalStrings,0)),coreLevel:clamp(finiteWhole(source.coreLevel,0),0,THIRD_WORLD_CORE_MAX_LEVEL),bosses:normalizeBosses(source.bosses),story:normalizeStory(source.story)};
  if(entered){if(!isObject(target.secondWorld))target.secondWorld=typeof window.createBlankSecondWorldState==="function"?window.createBlankSecondWorldState():{entered:true};target.secondWorld.entered=true;}
  return target;
 }
 function thirdWorldState(target=state){if(!isObject(target))return createBlankThirdWorldState();return isObject(target.thirdWorld)?target.thirdWorld:createBlankThirdWorldState();}
 function thirdWorldBossesAllDefeated(target=state){const rows=thirdWorldState(target).bosses;return Array.isArray(rows)&&rows.length===THIRD_WORLD_BOSS_COUNT&&rows.every(row=>finiteWhole(row?.currentHp,THIRD_WORLD_BOSS_MAX_HP)===0);}
 function thirdWorldCompletionSnapshot(target=state){const data=thirdWorldState(target),bossesDefeated=thirdWorldBossesAllDefeated(target);return {storedCompleted:data.completed===true,bossesDefeated,finalSeen:data.story?.finalSeen===true,readyForCompletionOwner:bossesDefeated};}

 function finalSecondWorldBossIndex(){const count=Math.max(1,finiteWhole(window.SECOND_WORLD_MAIN_BOSS_COUNT,100));return count-1;}
 function finalSecondWorldStoryId(){
  const index=finalSecondWorldBossIndex();
  if(typeof window.universeStoryIdForBossIndex==="function")return window.universeStoryIdForBossIndex(index);
  const bosses=Array.isArray(window.SECOND_WORLD_BOSSES)?window.SECOND_WORLD_BOSSES:[],regions=Array.isArray(window.SECOND_WORLD_REGIONS)?window.SECOND_WORLD_REGIONS:[],boss=bosses[index];if(!boss)return null;
  const region=regions.find(row=>Number(row.index)===Number(boss.regionIndex));if(!region)return null;
  const offset=index-Number(region.firstBossIndex);return offset>=0&&offset<=9?`universe-${region.id}-boss-${offset+1}`:null;
 }
 function isFinalSecondWorldStoryId(id){const finalId=finalSecondWorldStoryId();return !!id&&!!finalId&&id===finalId;}
 function finalSecondWorldBossKilled(target=state){const rows=target?.secondWorld?.mainline?.bossKilled,index=finalSecondWorldBossIndex();return Array.isArray(rows)&&rows[index]===true;}
 function finalSecondWorldStoryCompleted(target=state){const storyId=finalSecondWorldStoryId(),completed=target?.storyProgress?.completedStories;return !!storyId&&Array.isArray(completed)&&completed.includes(storyId);}
 function vipEntryRequirement(target){const points=Math.max(0,finiteWhole(target?.vipPoints,0));const current=typeof window.vipLevelFromPoints==="function"?Math.max(0,finiteWhole(window.vipLevelFromPoints(points),0)):Math.max(0,finiteWhole(target?.vipLevel,0));return {ok:current>=THIRD_WORLD_ENTRY_VIP_LEVEL,current,required:THIRD_WORLD_ENTRY_VIP_LEVEL,source:"vipPoints"};}
 function civilizationEntryRequirement(target){const current=clamp(finiteWhole(target?.secondWorld?.civilizationLevel,0),0,10);return {ok:current>=THIRD_WORLD_ENTRY_CIVILIZATION_LEVEL,current,required:THIRD_WORLD_ENTRY_CIVILIZATION_LEVEL};}
 function thirdWorldEntryRequirements(target=state){
  const levelCurrent=Math.max(1,finiteWhole(target?.level,1)),level={ok:levelCurrent>=THIRD_WORLD_ENTRY_LEVEL,current:levelCurrent,required:THIRD_WORLD_ENTRY_LEVEL};
  const secondWorldEntered=typeof window.isSecondWorldEntered==="function"?window.isSecondWorldEntered(target)===true:target?.secondWorld?.entered===true;
  const bossCompleted=finalSecondWorldBossKilled(target),finalStoryCompleted=finalSecondWorldStoryCompleted(target);
  const mainline={ok:secondWorldEntered&&bossCompleted&&finalStoryCompleted,secondWorldEntered,bossCompleted,finalStoryCompleted,finalStoryId:finalSecondWorldStoryId(),finalBossIndex:finalSecondWorldBossIndex()};
  const enhancement=typeof window.worldPhaseEnhancementRequirement==="function"?window.worldPhaseEnhancementRequirement(target,THIRD_WORLD_ENTRY_ENHANCEMENT_LEVEL):{ok:false,completed:0,total:5,requiredLevel:THIRD_WORLD_ENTRY_ENHANCEMENT_LEVEL};
  const civilization=civilizationEntryRequirement(target),vip=vipEntryRequirement(target);
  const specializations=typeof window.worldPhaseSpecializationRequirement==="function"?window.worldPhaseSpecializationRequirement(target,THIRD_WORLD_ENTRY_SPECIALIZATION_LEVEL):{ok:false,completed:0,total:8,requiredLevel:THIRD_WORLD_ENTRY_SPECIALIZATION_LEVEL};
  const marks=typeof window.worldPhaseMarkRequirement==="function"?window.worldPhaseMarkRequirement(target,THIRD_WORLD_ENTRY_MARK_LEVEL):{ok:false,completed:0,total:10,requiredLevel:THIRD_WORLD_ENTRY_MARK_LEVEL};
  const rows=[level,mainline,enhancement,civilization,vip,specializations,marks],alreadyEntered=target?.thirdWorld?.entered===true;
  if(typeof window.summarizeWorldEntryRequirements==="function")return window.summarizeWorldEntryRequirements(rows,alreadyEntered,{level,mainline,enhancement,civilization,vip,specializations,marks});
  const completed=rows.filter(row=>row.ok===true).length;return {eligible:completed===rows.length&&!alreadyEntered,alreadyEntered,completed,total:rows.length,level,mainline,enhancement,civilization,vip,specializations,marks};
 }
 function canEnterThirdWorld(target=state){return thirdWorldEntryRequirements(target).eligible===true;}

 window.THIRD_WORLD_PHASE_VERSION=VERSION;
 window.THIRD_WORLD_BOSS_COUNT=THIRD_WORLD_BOSS_COUNT;
 window.THIRD_WORLD_BOSS_MAX_HP=THIRD_WORLD_BOSS_MAX_HP;
 window.THIRD_WORLD_CORE_MAX_LEVEL=THIRD_WORLD_CORE_MAX_LEVEL;
 window.THIRD_WORLD_STORY_MAX_STAGE=THIRD_WORLD_STORY_MAX_STAGE;
 window.THIRD_WORLD_PERSISTENCE_POLICY_VERSION=1;
 window.THIRD_WORLD_PERSISTENT_KEYS=Array.from(THIRD_WORLD_PERSISTENT_KEYS);
 window.THIRD_WORLD_BOSS_PERSISTENT_KEYS=Array.from(THIRD_WORLD_BOSS_PERSISTENT_KEYS);
 window.THIRD_WORLD_STORY_PERSISTENT_KEYS=Array.from(THIRD_WORLD_STORY_PERSISTENT_KEYS);
 window.THIRD_WORLD_COMPLETION_DERIVATION_VERSION=1;
 window.THIRD_WORLD_ENTRY_REQUIREMENTS_VERSION=1;
 window.THIRD_WORLD_ENTRY_CONFIG=Object.freeze({level:THIRD_WORLD_ENTRY_LEVEL,enhancementLevel:THIRD_WORLD_ENTRY_ENHANCEMENT_LEVEL,civilizationLevel:THIRD_WORLD_ENTRY_CIVILIZATION_LEVEL,vipLevel:THIRD_WORLD_ENTRY_VIP_LEVEL,specializationLevel:THIRD_WORLD_ENTRY_SPECIALIZATION_LEVEL,markLevel:THIRD_WORLD_ENTRY_MARK_LEVEL});
 window.createBlankThirdWorldState=createBlankThirdWorldState;
 window.normalizeThirdWorldState=normalizeThirdWorldState;
 window.thirdWorldState=thirdWorldState;
 window.thirdWorldBossesAllDefeated=thirdWorldBossesAllDefeated;
 window.thirdWorldCompletionSnapshot=thirdWorldCompletionSnapshot;
 window.finalSecondWorldBossIndex=finalSecondWorldBossIndex;
 window.finalSecondWorldStoryId=finalSecondWorldStoryId;
 window.isFinalSecondWorldStoryId=isFinalSecondWorldStoryId;
 window.finalSecondWorldBossKilled=finalSecondWorldBossKilled;
 window.finalSecondWorldStoryCompleted=finalSecondWorldStoryCompleted;
 window.thirdWorldEntryRequirements=thirdWorldEntryRequirements;
 window.canEnterThirdWorld=canEnterThirdWorld;
 if(typeof registerNewStateNormalizer==="function")registerNewStateNormalizer(normalizeThirdWorldState);
})();
