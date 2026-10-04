(function(){
 const BATCH4_BRIDGE_VERSION=1;
 const CONTINUOUS_TARGET_LOCK_VERSION=1;
 const FAST_CATCH_UP_TARGET_LOCK_VERSION=1;
 const SPECIAL_PARENT_TARGET_VERSION=1;

 function currentFirstWorldTarget(context){
  if(typeof window.bindFirstWorldBattleTargetContext!=="function")return null;
  return window.bindFirstWorldBattleTargetContext(context,state);
 }

 function lockBattleTarget(ctx,target){
  if(!ctx||!target)return false;
  Object.defineProperty(ctx,"targetContext",{configurable:true,enumerable:true,writable:false,value:target});
  Object.defineProperty(ctx,"targetIdentity",{configurable:true,enumerable:true,writable:false,value:target.identity});
  return true;
 }

 function resolveSpecialParent(ctx,options={}){
  const candidate=options?.parentTargetContext||options?.targetContext||ctx?.targetContext||null;
  const target=currentFirstWorldTarget(candidate);
  if(!target||target.mode==="review"||target.policy?.specialEncounterAllowed!==true)return null;
  return target;
 }

 const baseRunBattles=window.runBattles;
 if(typeof baseRunBattles==="function"){
  window.runBattles=async function(count,ctx=null,targetContext=null){
   const candidate=targetContext||ctx?.targetContext||(typeof window.getPreparedFirstWorldTargetContext==="function"?window.getPreparedFirstWorldTargetContext():null);
   const target=currentFirstWorldTarget(candidate);
   if(!target)return false;
   const battleCtx=ctx|| (typeof window.createMainBattleContext==="function"?window.createMainBattleContext(count,target):null);
   if(!battleCtx)return false;
   lockBattleTarget(battleCtx,target);
   return baseRunBattles.call(this,count,battleCtx,target);
  };
 }

 const baseSpecial=window.maybeHandleSpecialEncounter;
 if(typeof baseSpecial==="function"){
  window.maybeHandleSpecialEncounter=async function(ctx,mainResult=null,options={}){
   const world=typeof window.specialEncounterWorldForState==="function"?Number(window.specialEncounterWorldForState(state)):1;
   if(world!==1)return baseSpecial.call(this,ctx,mainResult,options);
   const parentTargetContext=resolveSpecialParent(ctx,options);
   if(!parentTargetContext)return false;
   const hadMap=typeof selectedMap!=="undefined",hadEnemy=typeof selectedEnemy!=="undefined";
   const beforeMap=hadMap?selectedMap:undefined,beforeEnemy=hadEnemy?selectedEnemy:undefined;
   try{
    if(hadMap)selectedMap=parentTargetContext.mapIndex;
    if(hadEnemy)selectedEnemy=parentTargetContext.enemyIndex;
    const outcome=await baseSpecial.call(this,ctx,mainResult,{...options,mapIndex:parentTargetContext.mapIndex,enemyIndex:parentTargetContext.enemyIndex,targetContext:parentTargetContext,parentTargetContext});
    if(outcome?.triggered){
     outcome.parentTargetContext=parentTargetContext;
     outcome.parentTargetIdentity=parentTargetContext.identity;
     const rows=Array.isArray(ctx?.specialEncounters)?ctx.specialEncounters:null;
     const row=rows?.[rows.length-1];
     if(row&&row.result===outcome.result){row.parentTargetContext=parentTargetContext;row.parentTargetIdentity=parentTargetContext.identity;}
    }
    return outcome;
   }finally{
    if(hadMap)selectedMap=beforeMap;
    if(hadEnemy)selectedEnemy=beforeEnemy;
   }
  };
 }

 window.resolveFirstWorldSpecialParentTargetContext=resolveSpecialParent;
 window.FIRST_WORLD_TARGET_CONTEXT_BATCH4_BRIDGE_VERSION=BATCH4_BRIDGE_VERSION;
 window.FIRST_WORLD_CONTINUOUS_TARGET_LOCK_VERSION=CONTINUOUS_TARGET_LOCK_VERSION;
 window.FIRST_WORLD_FAST_CATCH_UP_TARGET_LOCK_VERSION=FAST_CATCH_UP_TARGET_LOCK_VERSION;
 window.FIRST_WORLD_SPECIAL_PARENT_TARGET_VERSION=SPECIAL_PARENT_TARGET_VERSION;
})();