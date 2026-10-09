(function(){
 const VERSION=1;
 const OFFLINE_VERSION=1;
 const RERUN_VERSION=1;
 const REVIEW_VERSION=1;
 const CURRENT_VALIDATOR_REQUIRED_VERSION=1;
 const LIFECYCLE_DELEGATE_VERSION=1;
 const POLICY_GATE_VERSION=1;
 const PERSISTED_TARGET_DELEGATE_VERSION=1;
 const TARGET_METADATA_BRIDGE_VERSION=1;

 function currentMode(target=state){
  return typeof window.resolveFirstWorldTargetRuntimeMode==="function"?window.resolveFirstWorldTargetRuntimeMode(target):null;
 }
 function currentCheck(context,target=state){
  if(!context||typeof context!=="object")return false;
  if(typeof window.validateCurrentFirstWorldTargetContext!=="function")return false;
  return window.validateCurrentFirstWorldTargetContext(context,target)?.passed===true;
 }
 function policyAllows(context,requirements){return typeof window.firstWorldTargetPolicyAllows==="function"&&window.firstWorldTargetPolicyAllows(context,requirements)===true;}
 function offlineContext(raw,target=state,source="offline-persisted-identity"){
  if(typeof window.firstWorldTargetContextFromPersisted!=="function")return null;
  return window.firstWorldTargetContextFromPersisted(raw,{source,policy:{offlineSampleAllowed:true}},target);
 }
 function targetMetadata(context){return typeof window.firstWorldTargetMetadata==="function"?window.firstWorldTargetMetadata(context):null;}
 function attachOfflineTarget(result,context){
  if(!result||!context)return null;const metadata=targetMetadata(context);if(!metadata)return null;
  return {...result,targetContext:context,targetIdentity:context.identity,targetMetadata:metadata};
 }
 function canonicalOfflineEnemy(raw,target=state){
  const context=offlineContext(raw,target,"offline-settlement-target");
  if(!context)return null;
  const enemy=typeof window.firstWorldEncounterFromTargetContext==="function"?window.firstWorldEncounterFromTargetContext(context,{preview:false}):null;
  const metadata=targetMetadata(context);
  if(!enemy||enemy.kind==="boss"||!metadata)return null;
  return Object.freeze({context,identity:context.identity,metadata,enemy});
 }

 const baseResolveOffline=window.resolveOfflineFarmTarget;
 if(typeof baseResolveOffline==="function"){
  window.resolveOfflineFarmTarget=function(){
   const result=baseResolveOffline.apply(this,arguments);
   if(!result||Number(result.world)!==1)return result;
   const context=offlineContext(result,state,"offline-sample-selection");
   return attachOfflineTarget(result,context);
  };
 }
 const baseNormalizePending=window.normalizeOfflinePendingSettlement;
 if(typeof baseNormalizePending==="function"){
  window.normalizeOfflinePendingSettlement=function(raw){
   const result=baseNormalizePending.apply(this,arguments);
   if(!result||Number(result.world)!==1)return result;
   const context=offlineContext(result,state,"offline-pending-normalization");
   return attachOfflineTarget(result,context);
  };
 }
 const baseGrantOffline=window.grantFirstWorldOfflineRewards;
 if(typeof baseGrantOffline==="function"){
  window.grantFirstWorldOfflineRewards=async function(pending,enemy){
   const canonical=canonicalOfflineEnemy(pending,state);
   return baseGrantOffline.call(this,pending,canonical?.enemy||enemy);
  };
 }

 const baseFromSelection=window.firstWorldTargetContextFromSelection;
 if(typeof baseFromSelection==="function"){
  window.firstWorldTargetContextFromSelection=function(options={},target=state){
   if(String(options?.mode||"")==="rerun"){
    const prepared=typeof window.getPreparedFirstWorldTargetContext==="function"?window.getPreparedFirstWorldTargetContext():null;
    if(prepared?.mode==="rerun"&&prepared.valid===true&&prepared.authorized===true&&currentCheck(prepared,target))return prepared;
   }
   return baseFromSelection.call(this,options,target);
  };
 }
 const baseRerunTarget=window.firstWorldReincarnationTargetContext;
 if(typeof baseRerunTarget==="function"){
  window.firstWorldReincarnationTargetContext=function(target=state){
   const prepared=typeof window.getPreparedFirstWorldTargetContext==="function"?window.getPreparedFirstWorldTargetContext():null;
   if(prepared?.mode==="rerun"&&prepared.valid===true&&prepared.authorized===true&&currentCheck(prepared,target)){
    const life=typeof window.firstWorldReincarnationRerunContext==="function"?window.firstWorldReincarnationRerunContext(target):null;
    return Object.freeze({version:Number(window.FIRST_WORLD_REINCARNATION_TARGET_CONTEXT_VERSION)||1,active:life?.active===true,valid:true,authorized:true,mapIndex:prepared.mapIndex,enemyIndex:prepared.enemyIndex,count:Number(life?.count)||prepared.count,lifeId:Number(life?.lifeId)||prepared.lifeId,world:Number(life?.world)||1,canonicalContext:prepared});
   }
   return baseRerunTarget.apply(this,arguments);
  };
 }

 const baseReviewStart=window.startGalaxyReviewBattle;
 if(typeof baseReviewStart==="function"){
  window.startGalaxyReviewBattle=async function(){
   let context=typeof window.getPreparedFirstWorldTargetContext==="function"?window.getPreparedFirstWorldTargetContext():null;
   if(!(context?.mode==="review"&&context.valid===true&&context.authorized===true&&currentCheck(context,state))&&typeof window.prepareFirstWorldTargetContextFromSelection==="function")context=window.prepareFirstWorldTargetContextFromSelection({mode:"review",source:"review-battle-start"},state);
   const validReview=ctx=>ctx?.mode==="review"&&ctx.valid===true&&ctx.authorized===true&&currentCheck(ctx,state)&&policyAllows(ctx,{formalRewardsAllowed:false,formalProgressAllowed:false});
   if(!validReview(context)&&typeof window.prepareFirstWorldTargetContext==="function"){
    context=window.prepareFirstWorldTargetContext({mode:"review",mapIndex:window.getGalaxyReviewSelectedMap?.(),enemyIndex:window.getGalaxyReviewSelectedEnemy?.(),source:"review-battle-revalidate"},state);
   }
   if(!validReview(context)){
    console.warn("[文明戰線] 銀河紀元回顧目標驗證未通過",window.validateCurrentFirstWorldTargetContext?.(context,state)?.errors||[],{valid:context?.valid,authorized:context?.authorized,mode:context?.mode});
    // Pure review uses runCombatCore without settlement or formal progression.
    // An unavailable legacy target context must not silently disable this read-only challenge.
    return await baseReviewStart.apply(this,arguments);
   }
   const originalGetMap=window.getGalaxyReviewSelectedMap;
   const originalGetEnemy=window.getGalaxyReviewSelectedEnemy;
   try{
    window.getGalaxyReviewSelectedMap=()=>context.mapIndex;
    window.getGalaxyReviewSelectedEnemy=()=>context.enemyIndex;
    return await baseReviewStart.apply(this,arguments);
   }finally{
    window.getGalaxyReviewSelectedMap=originalGetMap;
    window.getGalaxyReviewSelectedEnemy=originalGetEnemy;
   }
  };
 }

 window.resolveFirstWorldOfflineTargetContext=offlineContext;
 window.resolveCanonicalFirstWorldOfflineEnemy=canonicalOfflineEnemy;
 window.FIRST_WORLD_TARGET_CONTEXT_BATCH5_VERSION=VERSION;
 window.FIRST_WORLD_OFFLINE_TARGET_CONTEXT_VERSION=OFFLINE_VERSION;
 window.FIRST_WORLD_RERUN_TARGET_CONTEXT_BOUNDARY_VERSION=RERUN_VERSION;
 window.FIRST_WORLD_REVIEW_TARGET_CONTEXT_BOUNDARY_VERSION=REVIEW_VERSION;
 window.FIRST_WORLD_CURRENT_CONTEXT_VALIDATOR_REQUIRED_VERSION=CURRENT_VALIDATOR_REQUIRED_VERSION;
 window.FIRST_WORLD_TARGET_CONTEXT_BATCH5_LIFECYCLE_DELEGATE_VERSION=LIFECYCLE_DELEGATE_VERSION;
 window.FIRST_WORLD_TARGET_CONTEXT_BATCH5_POLICY_GATE_VERSION=POLICY_GATE_VERSION;
 window.FIRST_WORLD_OFFLINE_PERSISTED_TARGET_DELEGATE_VERSION=PERSISTED_TARGET_DELEGATE_VERSION;
 window.FIRST_WORLD_OFFLINE_TARGET_METADATA_BRIDGE_VERSION=TARGET_METADATA_BRIDGE_VERSION;
})();