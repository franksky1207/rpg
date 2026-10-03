(function(){
 const REINCARNATION_STATE_VERSION=5;
 const REINCARNATION_LIFECYCLE_POLICY_VERSION=1;
 const REINCARNATION_DOMAIN_CONTEXT_VERSION=1;
 const REINCARNATION_BREAKTHROUGH_LIFE_OWNERSHIP_VERSION=1;
 const REINCARNATION_PRE_SCHEMA17_POLICY_VERSION=1;
 const ALTERNATE_UNIVERSE_STATE_FORMAT_VERSION=2;
 const ALTERNATE_UNIVERSE_TRAIT_POLICY_VERSION=1;
 const ALTERNATE_UNIVERSE_FAILURES_FORMAT_VERSION=1;
 const ALTERNATE_UNIVERSE_MAX_DEPTH=1000;
 const BREAKTHROUGH_MILESTONES=Object.freeze([100,200,300,400,500,600,700,800,900,1000]);
 const REINCARNATION_CONTEXT_DOMAINS=Object.freeze(["world","level","story","dungeon","speed"]);
 const ALTERNATE_UNIVERSE_TRAIT_ROWS=Object.freeze([
  Object.freeze({id:"strong",name:"強壯"}),
  Object.freeze({id:"ferocious",name:"兇猛"}),
  Object.freeze({id:"hard",name:"堅硬"}),
  Object.freeze({id:"swift",name:"迅捷"}),
  Object.freeze({id:"deadly",name:"致命"}),
  Object.freeze({id:"berserk",name:"狂暴"}),
  Object.freeze({id:"giant",name:"巨體"})
 ]);
 const ALTERNATE_UNIVERSE_TRAIT_IDS=Object.freeze(ALTERNATE_UNIVERSE_TRAIT_ROWS.map(row=>row.id));
 const ALTERNATE_UNIVERSE_TRAIT_ID_SET=new Set(ALTERNATE_UNIVERSE_TRAIT_IDS);
 const ALTERNATE_UNIVERSE_TRAIT_LABEL_TO_ID=Object.freeze(Object.fromEntries(ALTERNATE_UNIVERSE_TRAIT_ROWS.map(row=>[row.name,row.id])));

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
 function normalizeAlternateUniverseTraitId(value){
  if(typeof value!=="string")return null;
  const raw=value.trim();
  if(!raw)return null;
  if(ALTERNATE_UNIVERSE_TRAIT_ID_SET.has(raw))return raw;
  return ALTERNATE_UNIVERSE_TRAIT_LABEL_TO_ID[raw]||null;
 }
 function blankLifeFailures(lifeId=0){return {lifeId:normalizedCount(lifeId),failures:{}};}
 function normalizeFailureDepthMap(value){
  const source=isObject(value)?value:{},out={};
  Object.entries(source).forEach(([key,row])=>{
   const depth=finiteWhole(key,0);
   if(depth<1||depth>ALTERNATE_UNIVERSE_MAX_DEPTH)return;
   const count=clamp(finiteWhole(row,0),0,10);
   if(count>0)out[String(depth)]=count;
  });
  return out;
 }
 function normalizeLegacyFailureRows(value,lifeId){
  const source=isObject(value)?value:{},out={};
  Object.entries(source).forEach(([key,row])=>{
   const depth=finiteWhole(key,0);
   if(depth<1||depth>ALTERNATE_UNIVERSE_MAX_DEPTH||!isObject(row))return;
   if(normalizedCount(row.lifeId)!==lifeId)return;
   const count=clamp(finiteWhole(row.failures,0),0,10);
   if(count>0)out[String(depth)]=count;
  });
  return out;
 }
 function normalizeLifeFailures(value,lifeId){
  const source=isObject(value)?value:null;
  if(!source)return blankLifeFailures(lifeId);
  if(Object.prototype.hasOwnProperty.call(source,"lifeId")||Object.prototype.hasOwnProperty.call(source,"failures")){
   if(normalizedCount(source.lifeId)!==lifeId||!isObject(source.failures))return blankLifeFailures(lifeId);
   return {lifeId,failures:normalizeFailureDepthMap(source.failures)};
  }
  return {lifeId,failures:normalizeLegacyFailureRows(source,lifeId)};
 }
 function normalizeActiveAttempt(value,lifeId){
  if(!isObject(value))return null;
  const depth=normalizedDepth(value.depth);
  if(depth<1||normalizedCount(value.lifeId)!==lifeId)return null;
  const rawTraits=Array.isArray(value.traits)?value.traits:[];
  if(rawTraits.length!==2)return null;
  const traits=rawTraits.map(normalizeAlternateUniverseTraitId);
  if(traits.some(id=>!id)||new Set(traits).size!==2)return null;
  const attemptId=typeof value.attemptId==="string"?value.attemptId.trim():"";
  if(!attemptId)return null;
  return {lifeId,depth,attemptId,traits};
 }
 function createBlankReincarnationState(){
  return {
   count:0,
   breakthrough:{permanent:0,milestoneLifeId:0,milestones:blankMilestones()},
   alternateUniverse:{unlocked:false,deepestCleared:0,activeAttempt:null,lifeFailures:blankLifeFailures(0)}
  };
 }
 function normalizeReincarnationState(target){
  if(!isObject(target))return target;
  const sourceVersion=Math.floor(Number(target.saveVersion)),preSchema17=Number.isFinite(sourceVersion)&&sourceVersion<17;
  const sourceHadReincarnationRoot=Object.prototype.hasOwnProperty.call(target,"reincarnation")&&isObject(target.reincarnation);
  const sourceReincarnationCountRaw=sourceHadReincarnationRoot?target.reincarnation?.count:null;
  if(preSchema17){
   target.reincarnation=createBlankReincarnationState();
   window.LAST_REINCARNATION_NORMALIZATION_REPORT={version:REINCARNATION_PRE_SCHEMA17_POLICY_VERSION,sourceVersion,sourceHadReincarnationRoot,sourceReincarnationCountRaw,preSchema17ReincarnationDiscarded:sourceHadReincarnationRoot,targetReincarnationCount:0};
   return target;
  }
  const source=isObject(target.reincarnation)?target.reincarnation:{};
  const count=normalizedCount(source.count),lifeId=count;
  const breakthroughSource=isObject(source.breakthrough)?source.breakthrough:{};
  const milestoneLifeId=normalizedCount(breakthroughSource.milestoneLifeId),milestonesOwnedByCurrentLife=milestoneLifeId===lifeId;
  const alternateSource=isObject(source.alternateUniverse)?source.alternateUniverse:{};
  const sourceLifeFailures=alternateSource.lifeFailures;
  const sourceLifeFailuresCanonical=isObject(sourceLifeFailures)&&(Object.prototype.hasOwnProperty.call(sourceLifeFailures,"lifeId")||Object.prototype.hasOwnProperty.call(sourceLifeFailures,"failures"));
  target.reincarnation={
   count,
   breakthrough:{permanent:normalizedBreakthrough(breakthroughSource.permanent),milestoneLifeId:lifeId,milestones:milestonesOwnedByCurrentLife?normalizeMilestones(breakthroughSource.milestones):blankMilestones()},
   alternateUniverse:{
    unlocked:alternateSource.unlocked===true,
    deepestCleared:normalizedDepth(alternateSource.deepestCleared),
    activeAttempt:normalizeActiveAttempt(alternateSource.activeAttempt,lifeId),
    lifeFailures:normalizeLifeFailures(sourceLifeFailures,lifeId)
   }
  };
  if(!target.reincarnation.alternateUniverse.unlocked){
   target.reincarnation.alternateUniverse.deepestCleared=0;
   target.reincarnation.alternateUniverse.activeAttempt=null;
   target.reincarnation.alternateUniverse.lifeFailures=blankLifeFailures(lifeId);
  }
  window.LAST_REINCARNATION_NORMALIZATION_REPORT={
   version:REINCARNATION_PRE_SCHEMA17_POLICY_VERSION,
   sourceVersion:Number.isFinite(sourceVersion)?sourceVersion:null,
   sourceHadReincarnationRoot,
   sourceReincarnationCountRaw,
   preSchema17ReincarnationDiscarded:false,
   targetReincarnationCount:count,
   milestoneLifeId:lifeId,
   milestonesResetForLifeMismatch:!milestonesOwnedByCurrentLife,
   alternateUniverseStateFormatVersion:ALTERNATE_UNIVERSE_STATE_FORMAT_VERSION,
   lifeFailuresCanonicalized:alternateSource.unlocked===true&&!sourceLifeFailuresCanonical
  };
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
 function alternateUniverseFailureCount(target=window.state,depth=0){
  const lifeId=currentLifeId(target),failures=target?.reincarnation?.alternateUniverse?.lifeFailures;
  if(!isObject(failures)||normalizedCount(failures.lifeId)!==lifeId||!isObject(failures.failures))return 0;
  const key=String(normalizedDepth(depth));
  if(key==="0")return 0;
  return clamp(finiteWhole(failures.failures[key],0),0,10);
 }
 function alternateUniverseDepthLocked(target=window.state,depth=0){return alternateUniverseFailureCount(target,depth)>=10;}
 function runReincarnationLifecycleIntegrity(){
  const first={saveVersion:17,reincarnation:createBlankReincarnationState()},later={saveVersion:17,reincarnation:createBlankReincarnationState()};later.reincarnation.count=3;later.reincarnation.breakthrough.milestoneLifeId=3;
  const stale={saveVersion:17,reincarnation:createBlankReincarnationState()};stale.reincarnation.count=3;stale.reincarnation.breakthrough.milestoneLifeId=2;stale.reincarnation.breakthrough.milestones["100"]=true;normalizeReincarnationState(stale);
  const legacy={saveVersion:16,reincarnation:{count:9,breakthrough:{permanent:99,milestoneLifeId:9,milestones:{100:true}},alternateUniverse:{unlocked:true,deepestCleared:999}}};normalizeReincarnationState(legacy);
  const firstLife=reincarnationLifecycleSnapshot(first),laterLife=reincarnationLifecycleSnapshot(later),domains={};
  REINCARNATION_CONTEXT_DOMAINS.forEach(domain=>{domains[domain]={first:reincarnationContextForDomain(domain,first),later:reincarnationContextForDomain(domain,later)};});
  const errors=[];
  if(firstLife.count!==0||firstLife.lifeId!==0||firstLife.firstRun!==true||firstLife.reincarnationRun!==false||firstLife.mode!=="first-run")errors.push({code:"FIRST_RUN_SEMANTICS",actual:firstLife});
  if(laterLife.count!==3||laterLife.lifeId!==3||laterLife.firstRun!==false||laterLife.reincarnationRun!==true||laterLife.mode!=="reincarnation-run")errors.push({code:"REINCARNATION_RUN_SEMANTICS",actual:laterLife});
  if(stale.reincarnation.breakthrough.milestoneLifeId!==3||currentLifeBreakthrough(stale)!==0)errors.push({code:"BREAKTHROUGH_LIFE_OWNERSHIP",actual:stale.reincarnation.breakthrough});
  if(legacy.reincarnation.count!==0||legacy.reincarnation.breakthrough.permanent!==0||legacy.reincarnation.alternateUniverse.unlocked!==false)errors.push({code:"PRE_SCHEMA17_MUST_BE_FIRST_RUN",actual:legacy.reincarnation});
  REINCARNATION_CONTEXT_DOMAINS.forEach(domain=>{const row=domains[domain];if(row.first?.firstRun!==true||row.first?.reincarnationRun!==false||row.later?.firstRun!==false||row.later?.reincarnationRun!==true||row.later?.lifeId!==3)errors.push({code:"DOMAIN_CONTEXT_DRIFT",domain,row});});
  return Object.freeze({version:REINCARNATION_LIFECYCLE_POLICY_VERSION,passed:errors.length===0,errors:Object.freeze(errors),domains:Object.freeze(REINCARNATION_CONTEXT_DOMAINS.slice())});
 }

 window.REINCARNATION_STATE_VERSION=REINCARNATION_STATE_VERSION;
 window.REINCARNATION_LIFECYCLE_POLICY_VERSION=REINCARNATION_LIFECYCLE_POLICY_VERSION;
 window.REINCARNATION_DOMAIN_CONTEXT_VERSION=REINCARNATION_DOMAIN_CONTEXT_VERSION;
 window.REINCARNATION_BREAKTHROUGH_LIFE_OWNERSHIP_VERSION=REINCARNATION_BREAKTHROUGH_LIFE_OWNERSHIP_VERSION;
 window.REINCARNATION_PRE_SCHEMA17_POLICY_VERSION=REINCARNATION_PRE_SCHEMA17_POLICY_VERSION;
 window.ALTERNATE_UNIVERSE_STATE_FORMAT_VERSION=ALTERNATE_UNIVERSE_STATE_FORMAT_VERSION;
 window.ALTERNATE_UNIVERSE_TRAIT_POLICY_VERSION=ALTERNATE_UNIVERSE_TRAIT_POLICY_VERSION;
 window.ALTERNATE_UNIVERSE_FAILURES_FORMAT_VERSION=ALTERNATE_UNIVERSE_FAILURES_FORMAT_VERSION;
 window.REINCARNATION_CONTEXT_DOMAINS=Array.from(REINCARNATION_CONTEXT_DOMAINS);
 window.ALTERNATE_UNIVERSE_MAX_DEPTH=ALTERNATE_UNIVERSE_MAX_DEPTH;
 window.ALTERNATE_UNIVERSE_TRAIT_ROWS=ALTERNATE_UNIVERSE_TRAIT_ROWS.map(row=>({...row}));
 window.ALTERNATE_UNIVERSE_TRAIT_IDS=Array.from(ALTERNATE_UNIVERSE_TRAIT_IDS);
 window.BREAKTHROUGH_MILESTONES=Array.from(BREAKTHROUGH_MILESTONES);
 window.createBlankReincarnationState=createBlankReincarnationState;
 window.normalizeReincarnationState=normalizeReincarnationState;
 window.normalizeAlternateUniverseTraitId=normalizeAlternateUniverseTraitId;
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
 window.alternateUniverseFailureCount=alternateUniverseFailureCount;
 window.alternateUniverseDepthLocked=alternateUniverseDepthLocked;
 window.runReincarnationLifecycleIntegrity=runReincarnationLifecycleIntegrity;
 window.REINCARNATION_LIFECYCLE_INTEGRITY=runReincarnationLifecycleIntegrity();
 if(typeof window.registerNewStateNormalizer==="function")window.registerNewStateNormalizer(normalizeReincarnationState);
})();