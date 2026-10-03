(function(){
 const REINCARNATION_STATE_VERSION=1;
 const ALTERNATE_UNIVERSE_MAX_DEPTH=1000;
 const BREAKTHROUGH_MILESTONES=Object.freeze([100,200,300,400,500,600,700,800,900,1000]);

 function isObject(value){return !!value&&typeof value==="object"&&!Array.isArray(value);}
 function finiteWhole(value,fallback=0){const n=Math.floor(Number(value));return Number.isFinite(n)?n:fallback;}
 function clamp(value,min,max){return Math.max(min,Math.min(max,value));}
 function normalizedCount(value){return Math.max(0,finiteWhole(value,0));}
 function normalizedBreakthrough(value){return Math.max(0,finiteWhole(value,0));}
 function normalizedDepth(value){return clamp(finiteWhole(value,0),0,ALTERNATE_UNIVERSE_MAX_DEPTH);}
 function blankMilestones(){return Object.fromEntries(BREAKTHROUGH_MILESTONES.map(level=>[String(level),false]));}
 function normalizeMilestones(value){
  const source=isObject(value)?value:{};
  return Object.fromEntries(BREAKTHROUGH_MILESTONES.map(level=>[String(level),source[String(level)]===true]));
 }
 function currentLifeId(target){return normalizedCount(target?.reincarnation?.count);}
 function normalizeLifeFailures(value,lifeId){
  const source=isObject(value)?value:{};
  const out={};
  Object.entries(source).forEach(([key,row])=>{
   const depth=finiteWhole(key,0);
   if(depth<1||depth>ALTERNATE_UNIVERSE_MAX_DEPTH)return;
   const failures=isObject(row)?finiteWhole(row.failures,0):finiteWhole(row,0);
   const rowLifeId=isObject(row)?normalizedCount(row.lifeId):lifeId;
   if(rowLifeId!==lifeId)return;
   const count=clamp(failures,0,10);
   if(count>0)out[String(depth)]={lifeId,failures:count};
  });
  return out;
 }
 function normalizeActiveAttempt(value,lifeId){
  if(!isObject(value))return null;
  const depth=normalizedDepth(value.depth);
  if(depth<1||normalizedCount(value.lifeId)!==lifeId)return null;
  const traits=Array.isArray(value.traits)?value.traits.filter(item=>typeof item==="string"&&item.trim()).map(item=>item.trim()):[];
  const uniqueTraits=[...new Set(traits)].slice(0,2);
  const attemptId=typeof value.attemptId==="string"?value.attemptId.trim():"";
  if(uniqueTraits.length!==2||!attemptId)return null;
  return {lifeId,depth,attemptId,traits:uniqueTraits};
 }
 function createBlankReincarnationState(){
  return {
   count:0,
   breakthrough:{permanent:0,milestones:blankMilestones()},
   alternateUniverse:{unlocked:false,deepestCleared:0,activeAttempt:null,lifeFailures:{}}
  };
 }
 function normalizeReincarnationState(target){
  if(!isObject(target))return target;
  const source=isObject(target.reincarnation)?target.reincarnation:{};
  const count=normalizedCount(source.count),lifeId=count;
  const breakthroughSource=isObject(source.breakthrough)?source.breakthrough:{};
  const alternateSource=isObject(source.alternateUniverse)?source.alternateUniverse:{};
  target.reincarnation={
   count,
   breakthrough:{permanent:normalizedBreakthrough(breakthroughSource.permanent),milestones:normalizeMilestones(breakthroughSource.milestones)},
   alternateUniverse:{
    unlocked:alternateSource.unlocked===true,
    deepestCleared:normalizedDepth(alternateSource.deepestCleared),
    activeAttempt:normalizeActiveAttempt(alternateSource.activeAttempt,lifeId),
    lifeFailures:normalizeLifeFailures(alternateSource.lifeFailures,lifeId)
   }
  };
  if(!target.reincarnation.alternateUniverse.unlocked){
   target.reincarnation.alternateUniverse.deepestCleared=0;
   target.reincarnation.alternateUniverse.activeAttempt=null;
   target.reincarnation.alternateUniverse.lifeFailures={};
  }
  return target;
 }
 function reincarnationCount(target=window.state){return normalizedCount(target?.reincarnation?.count);}
 function permanentBreakthroughLevel(target=window.state){return normalizedBreakthrough(target?.reincarnation?.breakthrough?.permanent);}
 function currentLifeBreakthrough(target=window.state){
  const milestones=normalizeMilestones(target?.reincarnation?.breakthrough?.milestones);
  return BREAKTHROUGH_MILESTONES.reduce((sum,level)=>sum+(milestones[String(level)]===true?1:0),0);
 }
 function isReincarnationRun(target=window.state){return reincarnationCount(target)>0;}
 function alternateUniverseUnlocked(target=window.state){return target?.reincarnation?.alternateUniverse?.unlocked===true;}
 function alternateUniverseDeepestCleared(target=window.state){return normalizedDepth(target?.reincarnation?.alternateUniverse?.deepestCleared);}

 window.REINCARNATION_STATE_VERSION=REINCARNATION_STATE_VERSION;
 window.ALTERNATE_UNIVERSE_MAX_DEPTH=ALTERNATE_UNIVERSE_MAX_DEPTH;
 window.BREAKTHROUGH_MILESTONES=Array.from(BREAKTHROUGH_MILESTONES);
 window.createBlankReincarnationState=createBlankReincarnationState;
 window.normalizeReincarnationState=normalizeReincarnationState;
 window.reincarnationCount=reincarnationCount;
 window.currentLifeId=currentLifeId;
 window.permanentBreakthroughLevel=permanentBreakthroughLevel;
 window.currentLifeBreakthrough=currentLifeBreakthrough;
 window.isReincarnationRun=isReincarnationRun;
 window.alternateUniverseUnlocked=alternateUniverseUnlocked;
 window.alternateUniverseDeepestCleared=alternateUniverseDeepestCleared;
 if(typeof window.registerNewStateNormalizer==="function")window.registerNewStateNormalizer(normalizeReincarnationState);
})();
