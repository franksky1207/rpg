(function(){
 const REINCARNATION_STATE_VERSION=7;
 const REINCARNATION_LIFECYCLE_POLICY_VERSION=1;
 const REINCARNATION_DOMAIN_CONTEXT_VERSION=1;
 const REINCARNATION_BREAKTHROUGH_LIFE_OWNERSHIP_VERSION=2;
 const REINCARNATION_PRE_SCHEMA17_POLICY_VERSION=1;
 const REINCARNATION_FIRST_RUN_BREAKTHROUGH_ISOLATION_VERSION=1;
 const REINCARNATION_BREAKTHROUGH_RECONCILIATION_VERSION=1;
 const REINCARNATION_LIFE_CHANGE_RECONCILIATION_VERSION=1;
 const ALTERNATE_UNIVERSE_STATE_FORMAT_VERSION=2;
 const ALTERNATE_UNIVERSE_TRAIT_POLICY_VERSION=1;
 const ALTERNATE_UNIVERSE_FAILURES_FORMAT_VERSION=1;
 const ALTERNATE_UNIVERSE_UNLOCK_SALVAGE_VERSION=1;
 const ALTERNATE_UNIVERSE_ACTIVE_ATTEMPT_REPAIR_VERSION=1;
 const ALTERNATE_UNIVERSE_LIFECYCLE_SNAPSHOT_VERSION=1;
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
 function milestoneCount(value){const rows=normalizeMilestones(value);return BREAKTHROUGH_MILESTONES.reduce((sum,level)=>sum+(rows[String(level)]===true?1:0),0);}
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
  const hasMilestoneLifeId=Object.prototype.hasOwnProperty.call(breakthroughSource,"milestoneLifeId");
  const milestoneLifeId=hasMilestoneLifeId?normalizedCount(breakthroughSource.milestoneLifeId):null;
  const explicitLifeMismatch=hasMilestoneLifeId&&milestoneLifeId!==lifeId;
  const missingMilestoneLifeOwnerSalvaged=count>0&&!hasMilestoneLifeId;
  let milestones=count===0?blankMilestones():(explicitLifeMismatch?blankMilestones():normalizeMilestones(breakthroughSource.milestones));
  const currentLifeEarned=count===0?0:milestoneCount(milestones);
  const sourcePermanent=normalizedBreakthrough(breakthroughSource.permanent);
  const permanent=count===0?0:Math.max(sourcePermanent,currentLifeEarned);
  const firstRunBreakthroughCleared=count===0&&(sourcePermanent>0||milestoneCount(breakthroughSource.milestones)>0||milestoneLifeId!==0);
  const breakthroughPermanentRaised=permanent>sourcePermanent;

  const alternateSource=isObject(source.alternateUniverse)?source.alternateUniverse:{};
  const deepestCleared=normalizedDepth(alternateSource.deepestCleared);
  const alternateUniverseUnlockSalvaged=alternateSource.unlocked!==true&&deepestCleared>0;
  const alternateUniverseUnlocked=alternateSource.unlocked===true||deepestCleared>0;
  const sourceLifeFailures=alternateSource.lifeFailures;
  const sourceLifeFailuresCanonical=isObject(sourceLifeFailures)&&(Object.prototype.hasOwnProperty.call(sourceLifeFailures,"lifeId")||Object.prototype.hasOwnProperty.call(sourceLifeFailures,"failures"));
  const normalizedLifeFailures=alternateUniverseUnlocked?normalizeLifeFailures(sourceLifeFailures,lifeId):blankLifeFailures(lifeId);
  const sourceAttempt=alternateUniverseUnlocked?normalizeActiveAttempt(alternateSource.activeAttempt,lifeId):null;
  const expectedFrontierDepth=alternateUniverseUnlocked&&deepestCleared<ALTERNATE_UNIVERSE_MAX_DEPTH?deepestCleared+1:0;
  const activeAttemptFrontierMismatch=!!sourceAttempt&&sourceAttempt.depth!==expectedFrontierDepth;
  const activeAttemptLocked=!!sourceAttempt&&clamp(finiteWhole(normalizedLifeFailures.failures[String(sourceAttempt.depth)],0),0,10)>=10;
  const activeAttempt=sourceAttempt&&!activeAttemptFrontierMismatch&&!activeAttemptLocked?sourceAttempt:null;
  const activeAttemptCleared=!!sourceAttempt&&!activeAttempt;
  target.reincarnation={
   count,
   breakthrough:{permanent,milestoneLifeId:lifeId,milestones},
   alternateUniverse:{
    unlocked:alternateUniverseUnlocked,
    deepestCleared:alternateUniverseUnlocked?deepestCleared:0,
    activeAttempt,
    lifeFailures:normalizedLifeFailures
   }
  };
  window.LAST_REINCARNATION_NORMALIZATION_REPORT={
   version:REINCARNATION_STATE_VERSION,
   sourceVersion:Number.isFinite(sourceVersion)?sourceVersion:null,
   sourceHadReincarnationRoot,
   sourceReincarnationCountRaw,
   preSchema17ReincarnationDiscarded:false,
   targetReincarnationCount:count,
   milestoneLifeId:lifeId,
   milestoneLifeIdWasMissing:!hasMilestoneLifeId,
   missingMilestoneLifeOwnerSalvaged,
   milestonesResetForLifeMismatch:explicitLifeMismatch,
   firstRunBreakthroughCleared,
   breakthroughPermanentRaised,
   breakthroughCurrentLifeEarned:currentLifeEarned,
   alternateUniverseStateFormatVersion:ALTERNATE_UNIVERSE_STATE_FORMAT_VERSION,
   alternateUniverseUnlockSalvaged,
   lifeFailuresCanonicalized:alternateUniverseUnlocked&&!sourceLifeFailuresCanonical,
   activeAttemptRepairVersion:ALTERNATE_UNIVERSE_ACTIVE_ATTEMPT_REPAIR_VERSION,
   activeAttemptSourceDepth:sourceAttempt?.depth||0,
   activeAttemptExpectedFrontierDepth:expectedFrontierDepth,
   activeAttemptFrontierMismatch,
   activeAttemptLocked,
   activeAttemptCleared
  };
  return target;
 }
 function reincarnationCount(target=window.state){return normalizedCount(target?.reincarnation?.count);}
 function permanentBreakthroughLevel(target=window.state){return normalizedBreakthrough(target?.reincarnation?.breakthrough?.permanent);}
 function currentLifeBreakthrough(target=window.state){
  const lifeId=currentLifeId(target),owner=normalizedCount(target?.reincarnation?.breakthrough?.milestoneLifeId);
  if(owner!==lifeId)return 0;
  return milestoneCount(target?.reincarnation?.breakthrough?.milestones);
 }
 function isReincarnationRun(target=window.state){return reincarnationCount(target)>0;}
 function isFirstRun(target=window.state){return reincarnationCount(target)===0;}
 function reincarnationLifecycleSnapshot(target=window.state){
  const count=reincarnationCount(target),reincarnationRun=count>0;
  return Object.freeze({version:REINCARNATION_LIFECYCLE_POLICY_VERSION,count,lifeId:count,mode:reincarnationRun?"reincarnation-run":"first-run",firstRun:!reincarnationRun,reincarnationRun});
 }
 function reconcileReincarnationLifeChange(target=window.state,previousLifeId=null){
  if(!isObject(target)||!isObject(target.reincarnation))return Object.freeze({version:REINCARNATION_LIFE_CHANGE_RECONCILIATION_VERSION,ok:false,reason:"reincarnation-state-missing",changed:false,beforeLifeId:normalizedCount(previousLifeId),afterLifeId:0,clearedActiveAttempt:false,resetLifeFailures:false});
  const beforeLifeId=normalizedCount(previousLifeId),afterLifeId=currentLifeId(target),changed=beforeLifeId!==afterLifeId;
  const au=isObject(target.reincarnation.alternateUniverse)?target.reincarnation.alternateUniverse:null;
  const clearedActiveAttempt=changed&&!!au?.activeAttempt;
  const resetLifeFailures=changed&&!!au&&(normalizedCount(au?.lifeFailures?.lifeId)!==afterLifeId||Object.keys(isObject(au?.lifeFailures?.failures)?au.lifeFailures.failures:{}).length>0);
  if(changed&&au){au.activeAttempt=null;au.lifeFailures=blankLifeFailures(afterLifeId);}
  return Object.freeze({version:REINCARNATION_LIFE_CHANGE_RECONCILIATION_VERSION,ok:true,reason:"",changed,beforeLifeId,afterLifeId,clearedActiveAttempt,resetLifeFailures});
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
 function alternateUniverseLifecycleSnapshot(target=window.state){
  const lifeId=currentLifeId(target),source=isObject(target?.reincarnation?.alternateUniverse)?target.reincarnation.alternateUniverse:{};
  const deepestRaw=normalizedDepth(source.deepestCleared),unlocked=source.unlocked===true||deepestRaw>0,deepestCleared=unlocked?deepestRaw:0;
  const lifeFailures=unlocked?normalizeLifeFailures(source.lifeFailures,lifeId):blankLifeFailures(lifeId);
  const frontier=unlocked&&deepestCleared<ALTERNATE_UNIVERSE_MAX_DEPTH?deepestCleared+1:null;
  const candidate=unlocked?normalizeActiveAttempt(source.activeAttempt,lifeId):null;
  const activeLocked=!!candidate&&clamp(finiteWhole(lifeFailures.failures[String(candidate.depth)],0),0,10)>=10;
  const activeAttempt=candidate&&candidate.depth===frontier&&!activeLocked?candidate:null;
  const frozenAttempt=activeAttempt?Object.freeze({...activeAttempt,traits:Object.freeze(activeAttempt.traits.slice())}):null;
  return Object.freeze({version:ALTERNATE_UNIVERSE_LIFECYCLE_SNAPSHOT_VERSION,lifeId,unlocked,deepestCleared,maxDepth:ALTERNATE_UNIVERSE_MAX_DEPTH,completed:unlocked&&deepestCleared>=ALTERNATE_UNIVERSE_MAX_DEPTH,frontier,activeAttempt:frozenAttempt,failures:Object.freeze({...lifeFailures.failures})});
 }
 function runReincarnationLifecycleIntegrity(){
  const first={saveVersion:17,reincarnation:createBlankReincarnationState()},later={saveVersion:17,reincarnation:createBlankReincarnationState()};later.reincarnation.count=3;later.reincarnation.breakthrough.milestoneLifeId=3;
  const contaminatedFirst={saveVersion:17,reincarnation:{count:0,breakthrough:{permanent:9,milestoneLifeId:0,milestones:{100:true}},alternateUniverse:{unlocked:true,deepestCleared:0}}};normalizeReincarnationState(contaminatedFirst);
  const stale={saveVersion:17,reincarnation:createBlankReincarnationState()};stale.reincarnation.count=3;stale.reincarnation.breakthrough.milestoneLifeId=2;stale.reincarnation.breakthrough.milestones["100"]=true;normalizeReincarnationState(stale);
  const missingOwner={saveVersion:17,reincarnation:{count:2,breakthrough:{permanent:1,milestones:{100:true,200:true}},alternateUniverse:{unlocked:false,deepestCleared:0}}};normalizeReincarnationState(missingOwner);
  const auSalvage={saveVersion:17,reincarnation:{count:1,breakthrough:{permanent:0,milestoneLifeId:1,milestones:{}},alternateUniverse:{unlocked:false,deepestCleared:8}}};normalizeReincarnationState(auSalvage);
  const legacy={saveVersion:16,reincarnation:{count:9,breakthrough:{permanent:99,milestoneLifeId:9,milestones:{100:true}},alternateUniverse:{unlocked:true,deepestCleared:999}}};normalizeReincarnationState(legacy);
  const lifeChange={saveVersion:17,reincarnation:{count:2,breakthrough:{permanent:20,milestoneLifeId:2,milestones:{}},alternateUniverse:{unlocked:true,deepestCleared:40,activeAttempt:{lifeId:2,depth:41,attemptId:"life-change",traits:["strong","swift"]},lifeFailures:{lifeId:2,failures:{"41":3}}}}};
  lifeChange.reincarnation.count=3;const lifeChangeReport=reconcileReincarnationLifeChange(lifeChange,2);
  const snapshotProbe={saveVersion:17,reincarnation:{count:3,breakthrough:{permanent:25,milestoneLifeId:3,milestones:{}},alternateUniverse:{unlocked:true,deepestCleared:40,activeAttempt:{lifeId:3,depth:41,attemptId:"snapshot",traits:["強壯","迅捷"]},lifeFailures:{lifeId:3,failures:{"41":4,"1001":9}}}}};
  const snapshotBefore=JSON.stringify(snapshotProbe),auSnapshot=alternateUniverseLifecycleSnapshot(snapshotProbe),snapshotAfter=JSON.stringify(snapshotProbe);
  const firstLife=reincarnationLifecycleSnapshot(first),laterLife=reincarnationLifecycleSnapshot(later),domains={};
  REINCARNATION_CONTEXT_DOMAINS.forEach(domain=>{domains[domain]={first:reincarnationContextForDomain(domain,first),later:reincarnationContextForDomain(domain,later)};});
  const errors=[];
  if(firstLife.count!==0||firstLife.lifeId!==0||firstLife.firstRun!==true||firstLife.reincarnationRun!==false||firstLife.mode!=="first-run")errors.push({code:"FIRST_RUN_SEMANTICS",actual:firstLife});
  if(laterLife.count!==3||laterLife.lifeId!==3||laterLife.firstRun!==false||laterLife.reincarnationRun!==true||laterLife.mode!=="reincarnation-run")errors.push({code:"REINCARNATION_RUN_SEMANTICS",actual:laterLife});
  if(contaminatedFirst.reincarnation.breakthrough.permanent!==0||currentLifeBreakthrough(contaminatedFirst)!==0||contaminatedFirst.reincarnation.alternateUniverse.unlocked!==true)errors.push({code:"FIRST_RUN_BREAKTHROUGH_ISOLATION",actual:contaminatedFirst.reincarnation});
  if(stale.reincarnation.breakthrough.milestoneLifeId!==3||currentLifeBreakthrough(stale)!==0)errors.push({code:"BREAKTHROUGH_LIFE_OWNERSHIP",actual:stale.reincarnation.breakthrough});
  if(missingOwner.reincarnation.breakthrough.milestoneLifeId!==2||currentLifeBreakthrough(missingOwner)!==2||missingOwner.reincarnation.breakthrough.permanent!==2)errors.push({code:"BREAKTHROUGH_SAME_SCHEMA_RECONCILIATION",actual:missingOwner.reincarnation.breakthrough});
  if(auSalvage.reincarnation.alternateUniverse.unlocked!==true||auSalvage.reincarnation.alternateUniverse.deepestCleared!==8)errors.push({code:"ALTERNATE_UNIVERSE_UNLOCK_SALVAGE",actual:auSalvage.reincarnation.alternateUniverse});
  if(legacy.reincarnation.count!==0||legacy.reincarnation.breakthrough.permanent!==0||legacy.reincarnation.alternateUniverse.unlocked!==false)errors.push({code:"PRE_SCHEMA17_MUST_BE_FIRST_RUN",actual:legacy.reincarnation});
  if(!lifeChangeReport.ok||lifeChangeReport.changed!==true||lifeChange.reincarnation.alternateUniverse.deepestCleared!==40||lifeChange.reincarnation.alternateUniverse.activeAttempt!==null||lifeChange.reincarnation.alternateUniverse.lifeFailures.lifeId!==3||Object.keys(lifeChange.reincarnation.alternateUniverse.lifeFailures.failures).length!==0)errors.push({code:"LIFE_CHANGE_OWNER",actual:{lifeChangeReport,state:lifeChange.reincarnation.alternateUniverse}});
  if(snapshotBefore!==snapshotAfter||auSnapshot.lifeId!==3||auSnapshot.frontier!==41||auSnapshot.failures["41"]!==4||Object.prototype.hasOwnProperty.call(auSnapshot.failures,"1001")||JSON.stringify(auSnapshot.activeAttempt?.traits)!==JSON.stringify(["strong","swift"]))errors.push({code:"AU_LIFECYCLE_SNAPSHOT_READ_ONLY",actual:{auSnapshot,before:snapshotBefore,after:snapshotAfter}});
  REINCARNATION_CONTEXT_DOMAINS.forEach(domain=>{const row=domains[domain];if(row.first?.firstRun!==true||row.first?.reincarnationRun!==false||row.later?.firstRun!==false||row.later?.reincarnationRun!==true||row.later?.lifeId!==3)errors.push({code:"DOMAIN_CONTEXT_DRIFT",domain,row});});
  return Object.freeze({version:REINCARNATION_LIFECYCLE_POLICY_VERSION,lifeChangeVersion:REINCARNATION_LIFE_CHANGE_RECONCILIATION_VERSION,alternateUniverseLifecycleSnapshotVersion:ALTERNATE_UNIVERSE_LIFECYCLE_SNAPSHOT_VERSION,passed:errors.length===0,errors:Object.freeze(errors),domains:Object.freeze(REINCARNATION_CONTEXT_DOMAINS.slice())});
 }

 window.REINCARNATION_STATE_VERSION=REINCARNATION_STATE_VERSION;
 window.REINCARNATION_LIFECYCLE_POLICY_VERSION=REINCARNATION_LIFECYCLE_POLICY_VERSION;
 window.REINCARNATION_DOMAIN_CONTEXT_VERSION=REINCARNATION_DOMAIN_CONTEXT_VERSION;
 window.REINCARNATION_BREAKTHROUGH_LIFE_OWNERSHIP_VERSION=REINCARNATION_BREAKTHROUGH_LIFE_OWNERSHIP_VERSION;
 window.REINCARNATION_PRE_SCHEMA17_POLICY_VERSION=REINCARNATION_PRE_SCHEMA17_POLICY_VERSION;
 window.REINCARNATION_FIRST_RUN_BREAKTHROUGH_ISOLATION_VERSION=REINCARNATION_FIRST_RUN_BREAKTHROUGH_ISOLATION_VERSION;
 window.REINCARNATION_BREAKTHROUGH_RECONCILIATION_VERSION=REINCARNATION_BREAKTHROUGH_RECONCILIATION_VERSION;
 window.REINCARNATION_LIFE_CHANGE_RECONCILIATION_VERSION=REINCARNATION_LIFE_CHANGE_RECONCILIATION_VERSION;
 window.ALTERNATE_UNIVERSE_STATE_FORMAT_VERSION=ALTERNATE_UNIVERSE_STATE_FORMAT_VERSION;
 window.ALTERNATE_UNIVERSE_TRAIT_POLICY_VERSION=ALTERNATE_UNIVERSE_TRAIT_POLICY_VERSION;
 window.ALTERNATE_UNIVERSE_FAILURES_FORMAT_VERSION=ALTERNATE_UNIVERSE_FAILURES_FORMAT_VERSION;
 window.ALTERNATE_UNIVERSE_UNLOCK_SALVAGE_VERSION=ALTERNATE_UNIVERSE_UNLOCK_SALVAGE_VERSION;
 window.ALTERNATE_UNIVERSE_ACTIVE_ATTEMPT_REPAIR_VERSION=ALTERNATE_UNIVERSE_ACTIVE_ATTEMPT_REPAIR_VERSION;
 window.ALTERNATE_UNIVERSE_LIFECYCLE_SNAPSHOT_VERSION=ALTERNATE_UNIVERSE_LIFECYCLE_SNAPSHOT_VERSION;
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
 window.reconcileReincarnationLifeChange=reconcileReincarnationLifeChange;
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
 window.alternateUniverseLifecycleSnapshot=alternateUniverseLifecycleSnapshot;
 window.runReincarnationLifecycleIntegrity=runReincarnationLifecycleIntegrity;
 window.REINCARNATION_LIFECYCLE_INTEGRITY=runReincarnationLifecycleIntegrity();
 if(typeof window.registerNewStateNormalizer==="function")window.registerNewStateNormalizer(normalizeReincarnationState);
})();