(function(){
 const VERSION=2;
 const THIRD_WORLD_BOSS_COUNT=10;
 const THIRD_WORLD_BOSS_MAX_HP=1100000000;
 const THIRD_WORLD_CORE_MAX_LEVEL=10;
 const THIRD_WORLD_STORY_MAX_STAGE=10;
 const THIRD_WORLD_PERSISTENT_KEYS=Object.freeze(["entered","completed","dimensionalStrings","coreLevel","bosses","story"]);
 const THIRD_WORLD_BOSS_PERSISTENT_KEYS=Object.freeze(["currentHp"]);
 const THIRD_WORLD_STORY_PERSISTENT_KEYS=Object.freeze(["introSeen","unlockedStage","finalSeen"]);

 function isObject(value){return !!value&&typeof value==="object"&&!Array.isArray(value);}
 function finiteWhole(value,fallback=0){if(value==null)return fallback;const n=Math.floor(Number(value));return Number.isFinite(n)?n:fallback;}
 function clamp(value,min,max){return Math.max(min,Math.min(max,value));}
 function blankBosses(){return Array.from({length:THIRD_WORLD_BOSS_COUNT},()=>({currentHp:THIRD_WORLD_BOSS_MAX_HP}));}
 function createBlankThirdWorldState(){
  return {
   entered:false,
   completed:false,
   dimensionalStrings:0,
   coreLevel:0,
   bosses:blankBosses(),
   story:{introSeen:false,unlockedStage:0,finalSeen:false}
  };
 }
 function normalizeBosses(value){
  const source=Array.isArray(value)?value:[];
  return Array.from({length:THIRD_WORLD_BOSS_COUNT},(_,index)=>{
   const row=isObject(source[index])?source[index]:{};
   const hp=clamp(finiteWhole(row.currentHp,THIRD_WORLD_BOSS_MAX_HP),0,THIRD_WORLD_BOSS_MAX_HP);
   return {currentHp:hp};
  });
 }
 function normalizeStory(value){
  const source=isObject(value)?value:{};
  return {
   introSeen:source.introSeen===true,
   unlockedStage:clamp(finiteWhole(source.unlockedStage,0),0,THIRD_WORLD_STORY_MAX_STAGE),
   finalSeen:source.finalSeen===true
  };
 }
 function normalizeThirdWorldState(target){
  if(!isObject(target))return target;
  const source=isObject(target.thirdWorld)?target.thirdWorld:{};
  const entered=source.entered===true||source.completed===true;
  target.thirdWorld={
   entered,
   completed:source.completed===true,
   dimensionalStrings:Math.max(0,finiteWhole(source.dimensionalStrings,0)),
   coreLevel:clamp(finiteWhole(source.coreLevel,0),0,THIRD_WORLD_CORE_MAX_LEVEL),
   bosses:normalizeBosses(source.bosses),
   story:normalizeStory(source.story)
  };
  if(entered){
   if(!isObject(target.secondWorld)){
    target.secondWorld=typeof window.createBlankSecondWorldState==="function"?window.createBlankSecondWorldState():{entered:true};
   }
   target.secondWorld.entered=true;
  }
  return target;
 }
 function thirdWorldState(target=state){
  if(!isObject(target))return createBlankThirdWorldState();
  return isObject(target.thirdWorld)?target.thirdWorld:createBlankThirdWorldState();
 }

 window.THIRD_WORLD_PHASE_VERSION=VERSION;
 window.THIRD_WORLD_BOSS_COUNT=THIRD_WORLD_BOSS_COUNT;
 window.THIRD_WORLD_BOSS_MAX_HP=THIRD_WORLD_BOSS_MAX_HP;
 window.THIRD_WORLD_CORE_MAX_LEVEL=THIRD_WORLD_CORE_MAX_LEVEL;
 window.THIRD_WORLD_STORY_MAX_STAGE=THIRD_WORLD_STORY_MAX_STAGE;
 window.THIRD_WORLD_PERSISTENCE_POLICY_VERSION=1;
 window.THIRD_WORLD_PERSISTENT_KEYS=Array.from(THIRD_WORLD_PERSISTENT_KEYS);
 window.THIRD_WORLD_BOSS_PERSISTENT_KEYS=Array.from(THIRD_WORLD_BOSS_PERSISTENT_KEYS);
 window.THIRD_WORLD_STORY_PERSISTENT_KEYS=Array.from(THIRD_WORLD_STORY_PERSISTENT_KEYS);
 window.createBlankThirdWorldState=createBlankThirdWorldState;
 window.normalizeThirdWorldState=normalizeThirdWorldState;
 window.thirdWorldState=thirdWorldState;
 if(typeof registerNewStateNormalizer==="function")registerNewStateNormalizer(normalizeThirdWorldState);
})();
