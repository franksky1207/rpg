(function(){
 const ALTERNATE_UNIVERSE_ATTEMPT_VERSION=1;
 const ALTERNATE_UNIVERSE_ATTEMPT_TRAIT_COUNT=2;
 const ALTERNATE_UNIVERSE_FAILURE_LIMIT=10;
 const ALTERNATE_UNIVERSE_REVIEW_EPHEMERAL_VERSION=1;

 function currentState(){try{return typeof state!=="undefined"&&state&&typeof state==="object"?state:(window.state&&typeof window.state==="object"?window.state:null);}catch(_){return window.state&&typeof window.state==="object"?window.state:null;}}
 function whole(value,fallback=0){const n=Math.floor(Number(value));return Number.isFinite(n)?n:fallback;}
 function clamp(value,min,max){return Math.max(min,Math.min(max,value));}
 function clone(value){if(value==null)return value;try{return JSON.parse(JSON.stringify(value));}catch(_){return null;}}
 function fail(reason,extra={}){return Object.freeze({ok:false,reason:String(reason||"alternate-universe-attempt-failed"),saved:false,resumed:false,...extra});}
 function success(extra={}){return Object.freeze({ok:true,reason:"",...extra});}
 function lifeId(target=currentState()){return Math.max(0,whole(typeof window.reincarnationCount==="function"?window.reincarnationCount(target):target?.reincarnation?.count,0));}
 function auState(target=currentState()){return target?.reincarnation?.alternateUniverse&&typeof target.reincarnation.alternateUniverse==="object"?target.reincarnation.alternateUniverse:null;}
 function validDepth(value){const depth=whole(value,0),max=Math.max(1,whole(window.ALTERNATE_UNIVERSE_DATA_MAX_DEPTH||window.ALTERNATE_UNIVERSE_MAX_DEPTH,1000));return depth>=1&&depth<=max?depth:0;}
 function canonicalTraitPool(){
  const canonical=Array.isArray(window.ALTERNATE_UNIVERSE_TRAIT_IDS)?window.ALTERNATE_UNIVERSE_TRAIT_IDS:[];
  const live=Array.isArray(window.MONSTER_TRAIT_IDS)?window.MONSTER_TRAIT_IDS:[];
  return canonical.filter((id,index)=>typeof id==="string"&&live.includes(id)&&canonical.indexOf(id)===index);
 }
 function safeRandom(rng=Math.random){const fn=typeof rng==="function"?rng:Math.random;const value=Number(fn());return Number.isFinite(value)?Math.max(0,Math.min(.999999999999,value)):0;}
 function rollAlternateUniverseTraits(rng=Math.random){
  const pool=canonicalTraitPool();
  if(pool.length<ALTERNATE_UNIVERSE_ATTEMPT_TRAIT_COUNT)return null;
  const out=[];
  for(let i=0;i<ALTERNATE_UNIVERSE_ATTEMPT_TRAIT_COUNT;i++)out.push(pool.splice(Math.floor(safeRandom(rng)*pool.length),1)[0]);
  return Object.freeze(out);
 }
 function activeAttempt(target=currentState()){
  const row=auState(target)?.activeAttempt;
  if(!row||typeof row!=="object")return null;
  const currentLife=lifeId(target),depth=validDepth(row.depth),attemptLife=Math.max(0,whole(row.lifeId,-1)),traits=Array.isArray(row.traits)?row.traits.slice():[];
  if(attemptLife!==currentLife||!depth||typeof row.attemptId!=="string"||!row.attemptId.trim()||traits.length!==2||new Set(traits).size!==2)return null;
  const allowed=canonicalTraitPool();
  if(traits.some(id=>!allowed.includes(id)))return null;
  return Object.freeze({lifeId:currentLife,depth,attemptId:row.attemptId.trim(),traits:Object.freeze(traits)});
 }
 function deepestCleared(target=currentState()){return clamp(whole(typeof window.alternateUniverseDeepestCleared==="function"?window.alternateUniverseDeepestCleared(target):auState(target)?.deepestCleared,0),0,1000);}
 function failureCount(target=currentState(),depth=0){return clamp(whole(typeof window.alternateUniverseFailureCount==="function"?window.alternateUniverseFailureCount(target,depth):auState(target)?.lifeFailures?.failures?.[String(validDepth(depth))],0),0,ALTERNATE_UNIVERSE_FAILURE_LIMIT);}
 function depthLocked(target=currentState(),depth=0){return typeof window.alternateUniverseDepthLocked==="function"?window.alternateUniverseDepthLocked(target,depth)===true:failureCount(target,depth)>=ALTERNATE_UNIVERSE_FAILURE_LIMIT;}
 function unlocked(target=currentState()){return typeof window.alternateUniverseUnlocked==="function"?window.alternateUniverseUnlocked(target)===true:auState(target)?.unlocked===true;}
 function challengeStatus(depth,target=currentState()){
  const u=validDepth(depth),active=activeAttempt(target),deepest=deepestCleared(target);
  if(!target)return fail("state-missing",{depth:u||0});
  if(!unlocked(target))return fail("alternate-universe-locked",{depth:u||0});
  if(!u)return fail("invalid-depth",{depth:0});
  if(active&&active.depth!==u)return fail("active-attempt-exists",{depth:u,activeAttempt:active});
  if(active&&active.depth===u)return success({depth:u,resumable:true,activeAttempt:active,deepestCleared:deepest,failures:failureCount(target,u),locked:false});
  if(u!==deepest+1)return fail(u<=deepest?"depth-already-cleared":"depth-not-reached",{depth:u,deepestCleared:deepest});
  const failures=failureCount(target,u),locked=depthLocked(target,u);
  if(locked)return fail("depth-locked-for-life",{depth:u,deepestCleared:deepest,failures,locked:true});
  return success({depth:u,resumable:false,activeAttempt:null,deepestCleared:deepest,failures,locked:false});
 }
 function makeAttemptId(currentLife,depth){
  try{if(globalThis.crypto&&typeof globalThis.crypto.randomUUID==="function")return `au-${currentLife}-${depth}-${globalThis.crypto.randomUUID()}`;}catch(_){}
  return `au-${currentLife}-${depth}-${Date.now().toString(36)}-${Math.floor(Math.random()*0x100000000).toString(36)}`;
 }
 function runMutation(label,mutate){
  if(typeof window.runSettlementTransaction!=="function")return fail("transaction-owner-missing",{label});
  const tx=window.runSettlementTransaction({label,mutate});
  if(!tx?.ok)return fail(tx?.reason||"transaction-failed",{label,rolledBack:tx?.rolledBack===true,error:tx?.error||null});
  return success({label,saved:tx.saved===true,value:tx.value??null});
 }
 function beginAttempt(depth,options={}){
  const target=currentState(),status=challengeStatus(depth,target);
  if(!status.ok)return status;
  if(status.resumable)return success({depth:status.depth,resumed:true,saved:false,attempt:status.activeAttempt,failures:status.failures});
  const traits=rollAlternateUniverseTraits(options.rng);
  if(!traits)return fail("trait-owner-missing",{depth:status.depth});
  const currentLife=lifeId(target),attemptId=typeof options.attemptId==="string"&&options.attemptId.trim()?options.attemptId.trim():makeAttemptId(currentLife,status.depth);
  const tx=runMutation("alternate-universe-begin-attempt",root=>{
   const liveStatus=challengeStatus(status.depth,root);
   if(!liveStatus.ok||liveStatus.resumable)return {ok:false,reason:liveStatus.resumable?"attempt-created-concurrently":liveStatus.reason};
   const alternate=auState(root);
   if(!alternate)return {ok:false,reason:"alternate-universe-state-missing"};
   const row={lifeId:lifeId(root),depth:status.depth,attemptId,traits:Array.from(traits)};
   alternate.activeAttempt=row;
   return {attempt:row};
  });
  if(!tx.ok)return tx;
  return success({depth:status.depth,resumed:false,saved:true,attempt:activeAttempt(currentState()),failures:status.failures});
 }
 function ensureFailureOwner(alternate,currentLife){
  if(!alternate.lifeFailures||typeof alternate.lifeFailures!=="object"||whole(alternate.lifeFailures.lifeId,-1)!==currentLife||!alternate.lifeFailures.failures||typeof alternate.lifeFailures.failures!=="object")alternate.lifeFailures={lifeId:currentLife,failures:{}};
  return alternate.lifeFailures.failures;
 }
 function settleAttempt(outcome,options={}){
  const target=currentState(),attempt=activeAttempt(target),kind=String(outcome||"").trim().toLowerCase();
  if(!attempt)return fail("active-attempt-missing");
  if(!["win","loss","abandon"].includes(kind))return fail("invalid-outcome",{attempt});
  if(typeof options.attemptId==="string"&&options.attemptId.trim()&&options.attemptId.trim()!==attempt.attemptId)return fail("attempt-id-mismatch",{attempt});
  const tx=runMutation(`alternate-universe-${kind}`,root=>{
   const live=activeAttempt(root);
   if(!live||live.attemptId!==attempt.attemptId)return {ok:false,reason:"active-attempt-changed"};
   const alternate=auState(root),currentLife=lifeId(root);
   if(!alternate)return {ok:false,reason:"alternate-universe-state-missing"};
   let failures=failureCount(root,live.depth);
   if(kind==="win")alternate.deepestCleared=Math.max(deepestCleared(root),live.depth);
   else{
    const rows=ensureFailureOwner(alternate,currentLife);
    failures=Math.min(ALTERNATE_UNIVERSE_FAILURE_LIMIT,failures+1);
    rows[String(live.depth)]=failures;
   }
   alternate.activeAttempt=null;
   return {outcome:kind,depth:live.depth,attemptId:live.attemptId,failures,locked:kind!=="win"&&failures>=ALTERNATE_UNIVERSE_FAILURE_LIMIT,deepestCleared:kind==="win"?Math.max(deepestCleared(root),live.depth):deepestCleared(root)};
  });
  if(!tx.ok)return tx;
  return success({saved:true,...(tx.value||{})});
 }
 function abandonAttempt(options={}){return settleAttempt("abandon",options);}
 function buildEncounter(depth,traits,mode){
  if(typeof window.alternateUniverseEnemyStats!=="function"||typeof window.applyMonsterTraits!=="function")return null;
  const base=window.alternateUniverseEnemyStats(depth);
  if(!base)return null;
  const enemy=window.applyMonsterTraits({...base},Array.from(traits||[]));
  if(!enemy)return null;
  return Object.freeze({...enemy,alternateUniverse:true,alternateUniverseDepth:depth,alternateUniverseMode:mode,traits:Object.freeze(Array.from(traits||[]))});
 }
 function currentAttemptEncounter(target=currentState()){
  const attempt=activeAttempt(target);
  if(!attempt)return null;
  return buildEncounter(attempt.depth,attempt.traits,"challenge");
 }
 function createReviewEncounter(depth,rng=Math.random,target=currentState()){
  const u=validDepth(depth);
  if(!target||!unlocked(target)||!u||u>deepestCleared(target))return null;
  const traits=rollAlternateUniverseTraits(rng);
  if(!traits)return null;
  return buildEncounter(u,traits,"review");
 }
 function reviewStatus(depth,target=currentState()){
  const u=validDepth(depth),deepest=deepestCleared(target);
  return Object.freeze({ok:!!target&&unlocked(target)&&!!u&&u<=deepest,depth:u||0,deepestCleared:deepest,ephemeral:true,writesActiveAttempt:false,writesFailure:false});
 }

 window.ALTERNATE_UNIVERSE_ATTEMPT_VERSION=ALTERNATE_UNIVERSE_ATTEMPT_VERSION;
 window.ALTERNATE_UNIVERSE_ATTEMPT_TRAIT_COUNT=ALTERNATE_UNIVERSE_ATTEMPT_TRAIT_COUNT;
 window.ALTERNATE_UNIVERSE_FAILURE_LIMIT=ALTERNATE_UNIVERSE_FAILURE_LIMIT;
 window.ALTERNATE_UNIVERSE_REVIEW_EPHEMERAL_VERSION=ALTERNATE_UNIVERSE_REVIEW_EPHEMERAL_VERSION;
 window.rollAlternateUniverseTraits=rollAlternateUniverseTraits;
 window.alternateUniverseActiveAttempt=activeAttempt;
 window.alternateUniverseChallengeStatus=challengeStatus;
 window.beginAlternateUniverseAttempt=beginAttempt;
 window.settleAlternateUniverseAttempt=settleAttempt;
 window.abandonAlternateUniverseAttempt=abandonAttempt;
 window.alternateUniverseCurrentAttemptEncounter=currentAttemptEncounter;
 window.createAlternateUniverseReviewEncounter=createReviewEncounter;
 window.alternateUniverseReviewStatus=reviewStatus;
})();
