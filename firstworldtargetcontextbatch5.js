(function(){
 const VERSION=1;
 const OFFLINE_VERSION=1;
 const RERUN_VERSION=1;
 const REVIEW_VERSION=1;

 function currentMode(target=state){
  const phase=typeof window.currentWorldPhase==="function"?Number(window.currentWorldPhase(target))||1:(target?.secondWorld?.entered===true?2:1);
  if(phase!==1)return null;
  const life=typeof window.worldReincarnationContext==="function"?window.worldReincarnationContext(target):null;
  return life?.reincarnationRun===true||Number(target?.reincarnation?.count)>0?"rerun":"formal";
 }
 function currentCheck(context,target=state){
  if(!context||typeof context!=="object")return false;
  if(typeof window.validateCurrentFirstWorldTargetContext==="function")return window.validateCurrentFirstWorldTargetContext(context,target)?.passed===true;
  return typeof window.validateFirstWorldTargetContext==="function"&&window.validateFirstWorldTargetContext(context)?.passed===true;
 }
 function offlineContext(raw,target=state,source="offline-persisted-identity"){
  if(!raw||Number(raw.world)!==1||raw.targetType!=="mapEnemy")return null;
  const mapIndex=Math.floor(Number(raw.map)),enemyIndex=Math.floor(Number(raw.enemy)),mode=currentMode(target);
  if(!mode||!Number.isInteger(mapIndex)||!Number.isInteger(enemyIndex)||enemyIndex<0||enemyIndex>3||typeof window.createFirstWorldTargetContext!=="function")return null;
  const context=window.createFirstWorldTargetContext({mode,mapIndex,enemyIndex,source},target);
  if(!currentCheck(context,target)||context.valid!==true||context.authorized!==true||context.policy?.offlineSampleAllowed!==true)return null;
  return context;
 }
 function canonicalOfflineEnemy(raw,target=state){
  const context=offlineContext(raw,target,"offline-settlement-target");
  if(!context)return null;
  const enemy=typeof window.firstWorldEncounterFromTargetContext==="function"?window.firstWorldEncounterFromTargetContext(context,{preview:false}):null;
  if(!enemy||enemy.kind==="boss")return null;
  return Object.freeze({context,identity:context.identity,enemy});
 }

 const baseResolveOffline=window.resolveOfflineFarmTarget;
 if(typeof baseResolveOffline==="function"){
  window.resolveOfflineFarmTarget=function(){
   const result=baseResolveOffline.apply(this,arguments);
   if(!result||Number(result.world)!==1)return result;
   const context=offlineContext(result,state,"offline-sample-selection");
   return context?{...result,targetContext:context,targetIdentity:context.identity}:null;
  };
 }
 const baseNormalizePending=window.normalizeOfflinePendingSettlement;
 if(typeof baseNormalizePending==="function"){
  window.normalizeOfflinePendingSettlement=function(raw){
   const result=baseNormalizePending.apply(this,arguments);
   if(!result||Number(result.world)!==1)return result;
   const context=offlineContext(result,state,"offline-pending-normalization");
   return context?{...result,targetContext:context,targetIdentity:context.identity}:null;
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
   if(!(context?.mode==="review"&&context.valid===true&&context.authorized===true&&context.policy?.formalRewardsAllowed===false&&context.policy?.formalProgressAllowed===false))return false;
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
})();