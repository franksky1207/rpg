(function(){
 const BATCH4_BRIDGE_VERSION=1;
 const CONTINUOUS_TARGET_LOCK_VERSION=1;
 const FAST_CATCH_UP_TARGET_LOCK_VERSION=1;
 const SPECIAL_PARENT_TARGET_VERSION=1;
 const SPECIAL_SELECTION_PROJECTION_RETIRED_VERSION=1;
 const WRAPPER_RETIREMENT_VERSION=1;

 function currentFirstWorldTarget(context){
  if(typeof window.bindFirstWorldBattleTargetContext!=="function")return null;
  return window.bindFirstWorldBattleTargetContext(context,state);
 }
 function resolveSpecialParent(ctx,options={}){
  const candidate=options?.parentTargetContext||options?.targetContext||ctx?.targetContext||null;
  const target=currentFirstWorldTarget(candidate);
  if(!target||target.mode==="review"||target.policy?.specialEncounterAllowed!==true)return null;
  return target;
 }

 window.resolveFirstWorldSpecialParentTargetContext=resolveSpecialParent;
 window.FIRST_WORLD_TARGET_CONTEXT_BATCH4_BRIDGE_VERSION=BATCH4_BRIDGE_VERSION;
 window.FIRST_WORLD_CONTINUOUS_TARGET_LOCK_VERSION=CONTINUOUS_TARGET_LOCK_VERSION;
 window.FIRST_WORLD_FAST_CATCH_UP_TARGET_LOCK_VERSION=FAST_CATCH_UP_TARGET_LOCK_VERSION;
 window.FIRST_WORLD_SPECIAL_PARENT_TARGET_VERSION=SPECIAL_PARENT_TARGET_VERSION;
 window.FIRST_WORLD_SPECIAL_SELECTION_PROJECTION_RETIRED_VERSION=SPECIAL_SELECTION_PROJECTION_RETIRED_VERSION;
 window.FIRST_WORLD_TARGET_CONTEXT_BATCH4_WRAPPER_RETIREMENT_VERSION=WRAPPER_RETIREMENT_VERSION;
})();