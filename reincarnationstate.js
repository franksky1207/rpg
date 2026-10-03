(function(){
 const REINCARNATION_STATE_VERSION=3;
 const REINCARNATION_LIFECYCLE_POLICY_VERSION=1;
 const REINCARNATION_DOMAIN_CONTEXT_VERSION=1;
 const REINCARNATION_BREAKTHROUGH_LIFE_OWNERSHIP_VERSION=1;
 const ALTERNATE_UNIVERSE_MAX_DEPTH=1000;
 const BREAKTHROUGH_MILESTONES=Object.freeze([100,200,300,400,500,600,700,800,900,1000]);
 const REINCARNATION_CONTEXT_DOMAINS=Object.freeze(["world","level","story","dungeon","speed"]);

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
 function currentLifeId(target=window.state){return normalizedCount(target?.reincarnation?.count);}
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
   breakthrough:{permanent:0,milestoneLifeId:0,milestones:blankMilestones()},
   alternateUniverse:{unlocked:false,deepestCleared:0,activeAttempt:null,lifeFailures:{}}
  };
 }
 function normalizeReincarnationState(target){
  if(!isObject(target))return target;
  const source=isObject(target.reincarnation)?target.reincarnation:{};
  const count=normalizedCount(source.count),lifeId=count;
  const breakthroughSource=isObject(source.breakthrough)?source.breakthrough:{};
  const milestoneLifeId=normalizedCount(breakthroughSource.milestoneLifeId),milestonesOwnedByCurrentLife=milestoneLifeId===lifeId;
  const alternateSource=isObject(source.alternateUniverse)?source.alternateUniverse:{};
  target.reincarnation={
   count,
   breakthrough:{permanent:normalizedBreakthrough(breakthroughSource.permanent),milestoneLifeId:lifeId,milestones:milestonesOwnedByCurrentLife?normalizeMilestones(breakthroughSource.milestones):blankMilestones()},
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
  const lifeId=currentLifeId(target),owner=normalizedCount(target?.reincarnation?.breakthrough?.milestoneLifeId);
  if(owner!==lifeId)return 0;
  const milestones=normalizeMilestones(target?.reincarnation?.breakthrough?.milestones);
  return BREAKTHROUGH_MILESTONES.reduce((sum,level)=>sum+(milestones[String(level)]===true?1:0),0);
 }
 function isReincarnationRun(target=window.state){return reincarnationCount(target)>0;}
 function isFirstRun(target=window.state){return reincarnationCount(target)===0;}
 function reincarnationLifecycleSnapshot(target=window.state){
  const count=reincarnationCount(target),reincarnationRun=count>0;
  return Object.freeze({version:REINCARNATION_LIFECYCLE_POLICY_VERSION,count,lifeId:count,mode:reincarnationRun?"reincarnation-run":"first-run",firstRun:!reincarnationRun,reincarnationRun});
 }
 function reincarnationContextForDomain(domain,target=window.state){
  const key=String(domain||"").trim().toLowerCase();
  if(!REINCARNATION_CONTEXT_DOMAINS.includes(key))return null;
  const lifecycle=reincarnationLifecycleSnapshot(target);
  return Object.freeze({version:REINCARNATION_DOMAIN_CONTEXT_VERSION,domain:key,lifecycleVersion:lifecycle.version,count:lifecycle.count,lifeId:lifecycle.lifeId,mode:lifecycle.mode,firstRun:lifecycle.firstRun,reincarnationRun:lifecycle.reincarnationRun});
 }
 function worldReincarnationContext(target=window.state){return reincarnationContextForDomain("world",target);}
 function levelReincarnationContext(target=window.state){return reincarnationContextForDomain("level",target);}
 function storyReincarnationContext(target=window.state){return reincarnationContextForDomain("story",target);}
 function dungeonReincarnationContext(target=window.state){return reincarnationContextForDomain("dungeon",target);}
 function speedReincarnationContext(target=window.state){return reincarnationContextForDomain("speed",target);}
 function alternateUniverseUnlocked(target=window.state){return target?.reincarnation?.alternateUniverse?.unlocked===true;}
 function alternateUniverseDeepestCleared(target=window.state){return normalizedDepth(target?.reincarnation?.alternateUniverse?.deepestCleared);}
 function runReincarnationLifecycleIntegrity(){
  const first={reincarnation:createBlankReincarnationState()},later={reincarnation:createBlankReincarnationState()};later.reincarnation.count=3;later.reincarnation.breakthrough.milestoneLifeId=3;
  const stale={reincarnation:createBlankReincarnationState()};stale.reincarnation.count=3;stale.reincarnation.breakthrough.milestoneLifeId=2;stale.reincarnation.breakthrough.milestones["100"]=true;normalizeReincarnationState(stale);
  const firstLife=reincarnationLifecycleSnapshot(first),laterLife=reincarnationLifecycleSnapshot(later),domains={};
  REINCARNATION_CONTEXT_DOMAINS.forEach(domain=>{domains[domain]={first:reincarnationContextForDomain(domain,first),later:reincarnationContextForDomain(domain,later)};});
  const errors=[];
  if(firstLife.count!==0||firstLife.lifeId!==0||firstLife.firstRun!==true||firstLife.reincarnationRun!==false||firstLife.mode!=="first-run")errors.push({code:"FIRST_RUN_SEMANTICS",actual:firstLife});
  if(laterLife.count!==3||laterLife.lifeId!==3||laterLife.firstRun!==false||laterLife.reincarnationRun!==true||laterLife.mode!=="reincarnation-run")errors.push({code:"REINCARNATION_RUN_SEMANTICS",actual:laterLife});
  if(stale.reincarnation.breakthrough.milestoneLifeId!==3||currentLifeBreakthrough(stale)!==0)errors.push({code:"BREAKTHROUGH_LIFE_OWNERSHIP",actual:stale.reincarnation.breakthrough});
  REINCARNATION_CONTEXT_DOMAINS.forEach(domain=>{const row=domains[domain];if(row.first?.firstRun!==true||row.first?.reincarnationRun!==false||row.later?.firstRun!==false||row.later?.reincarnationRun!==true||row.later?.lifeId!==3)errors.push({code:"DOMAIN_CONTEXT_DRIFT",domain,row});});
  return Object.freeze({version:REINCARNATION_LIFECYCLE_POLICY_VERSION,passed:errors.length===0,errors:Object.freeze(errors),domains:Object.freeze(REINCARNATION_CONTEXT_DOMAINS.slice())});
 }

 window.REINCARNATION_STATE_VERSION=REINCARNATION_STATE_VERSION;
 window.REINCARNATION_LIFECYCLE_POLICY_VERSION=REINCARNATION_LIFECYCLE_POLICY_VERSION;
 window.REINCARNATION_DOMAIN_CONTEXT_VERSION=REINCARNATION_DOMAIN_CONTEXT_VERSION;
 window.REINCARNATION_BREAKTHROUGH_LIFE_OWNERSHIP_VERSION=REINCARNATION_BREAKTHROUGH_LIFE_OWNERSHIP_VERSION;
 window.REINCARNATION_CONTEXT_DOMAINS=Array.from(REINCARNATION_CONTEXT_DOMAINS);
 window.ALTERNATE_UNIVERSE_MAX_DEPTH=ALTERNATE_UNIVERSE_MAX_DEPTH;
 window.BREAKTHROUGH_MILESTONES=Array.from(BREAKTHROUGH_MILESTONES);
 window.createBlankReincarnationState=createBlankReincarnationState;
 window.normalizeReincarnationState=normalizeReincarnationState;
 window.reincarnationCount=reincarnationCount;
 window.currentLifeId=currentLifeId;
 window.permanentBreakthroughLevel=permanentBreakthroughLevel;
 window.currentLifeBreakthrough=currentLifeBreakthrough;
 window.isReincarnationRun=isReincarnationRun;
 window.isFirstRun=isFirstRun;
 window.reincarnationLifecycleSnapshot=reincarnationLifecycleSnapshot;
 window.reincarnationContextForDomain=reincarnationContextForDomain;
 window.worldReincarnationContext=worldReincarnationContext;
 window.levelReincarnationContext=levelReincarnationContext;
 window.storyReincarnationContext=storyReincarnationContext;
 window.dungeonReincarnationContext=dungeonReincarnationContext;
 window.speedReincarnationContext=speedReincarnationContext;
 window.alternateUniverseUnlocked=alternateUniverseUnlocked;
 window.alternateUniverseDeepestCleared=alternateUniverseDeepestCleared;
 window.runReincarnationLifecycleIntegrity=runReincarnationLifecycleIntegrity;
 window.REINCARNATION_LIFECYCLE_INTEGRITY=runReincarnationLifecycleIntegrity();
 if(typeof window.registerNewStateNormalizer==="function")window.registerNewStateNormalizer(normalizeReincarnationState);
})();