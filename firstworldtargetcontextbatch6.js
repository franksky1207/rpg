(function(){
 const VERSION=1;
 const DRIFT_VERSION=1;
 const FALLBACK_RETIREMENT_VERSION=1;
 const CLOSURE_VERSION=1;

 function currentValidation(context,target=state){
  if(!context||typeof context!=="object")return {passed:false,errors:["missing-context"]};
  if(typeof window.validateCurrentFirstWorldTargetContext==="function")return window.validateCurrentFirstWorldTargetContext(context,target);
  if(typeof window.validateFirstWorldTargetContext==="function")return window.validateFirstWorldTargetContext(context);
  return {passed:false,errors:["validator-missing"]};
 }
 function validateExecution(context,target=state,requirements={}){
  const errors=[];
  const checked=currentValidation(context,target);
  if(checked?.passed!==true)errors.push(...(Array.isArray(checked?.errors)?checked.errors:["invalid-context"]));
  if(Number(context?.world)!==1)errors.push("wrong-world");
  if(context?.valid!==true||context?.authorized!==true)errors.push("unauthorized");
  const modes=Array.isArray(requirements?.modes)?requirements.modes.map(String):requirements?.mode?[String(requirements.mode)]:[];
  if(modes.length&&!modes.includes(String(context?.mode||"")))errors.push("wrong-mode");
  if(requirements?.policy&&typeof requirements.policy==="object"){
   for(const [key,value] of Object.entries(requirements.policy))if(context?.policy?.[key]!==value)errors.push(`policy:${key}`);
  }
  return Object.freeze({version:DRIFT_VERSION,passed:errors.length===0,errors:Object.freeze([...new Set(errors)]),context:errors.length?null:context});
 }
 function preparedExecution(mode,target=state,requirements={}){
  const prepared=typeof window.getPreparedFirstWorldTargetContext==="function"?window.getPreparedFirstWorldTargetContext():null;
  const check=validateExecution(prepared,target,{...requirements,mode});
  return check.passed?prepared:null;
 }
 function invalidRerunTarget(target=state){
  const life=typeof window.firstWorldReincarnationRerunContext==="function"?window.firstWorldReincarnationRerunContext(target):null;
  return Object.freeze({version:Number(window.FIRST_WORLD_REINCARNATION_TARGET_CONTEXT_VERSION)||1,active:life?.active===true,valid:false,authorized:false,mapIndex:-1,enemyIndex:-1,count:Number(life?.count)||0,lifeId:Number(life?.lifeId)||0,world:1,canonicalContext:null,reason:"prepared-target-required"});
 }
 function rerunExecutionTarget(target=state){
  const context=preparedExecution("rerun",target,{policy:{formalRewardsAllowed:true,formalProgressAllowed:true}});
  if(!context)return invalidRerunTarget(target);
  const life=typeof window.firstWorldReincarnationRerunContext==="function"?window.firstWorldReincarnationRerunContext(target):null;
  return Object.freeze({version:Number(window.FIRST_WORLD_REINCARNATION_TARGET_CONTEXT_VERSION)||1,active:life?.active===true,valid:true,authorized:true,mapIndex:context.mapIndex,enemyIndex:context.enemyIndex,count:Number(life?.count)||context.count,lifeId:Number(life?.lifeId)||context.lifeId,world:1,canonicalContext:context,reason:"prepared-target"});
 }
 function driftSnapshot(context,target=state){
  const check=validateExecution(context,target);
  return Object.freeze({version:DRIFT_VERSION,passed:check.passed,errors:check.errors,contextId:String(context?.contextId||""),mode:String(context?.mode||""),mapIndex:Number.isInteger(Number(context?.mapIndex))?Number(context.mapIndex):-1,enemyIndex:Number.isInteger(Number(context?.enemyIndex))?Number(context.enemyIndex):-1,count:Math.max(0,Math.floor(Number(target?.reincarnation?.count)||0)),lifeId:Math.max(0,Math.floor(Number(target?.reincarnation?.count)||0))});
 }
 function closureSnapshot(target=state){
  const prepared=typeof window.getPreparedFirstWorldTargetContext==="function"?window.getPreparedFirstWorldTargetContext():null;
  const preparedCheck=prepared?validateExecution(prepared,target):null;
  return Object.freeze({version:CLOSURE_VERSION,owner:Number(window.FIRST_WORLD_TARGET_CONTEXT_VERSION)||0,identity:Number(window.FIRST_WORLD_TARGET_IDENTITY_VERSION)||0,batch4:Number(window.FIRST_WORLD_TARGET_CONTEXT_BATCH4_BRIDGE_VERSION)||0,batch5:Number(window.FIRST_WORLD_TARGET_CONTEXT_BATCH5_VERSION)||0,batch6:VERSION,driftGuard:DRIFT_VERSION,fallbackRetirement:FALLBACK_RETIREMENT_VERSION,saveSchemaVersion:Number(window.SAVE_SCHEMA_VERSION)||Number(target?.saveVersion)||0,prepared:prepared?Object.freeze({contextId:String(prepared.contextId||""),mode:String(prepared.mode||""),mapIndex:prepared.mapIndex,enemyIndex:prepared.enemyIndex,passed:preparedCheck?.passed===true}):null});
 }

 // Post-prepare execution must never reconstruct a rerun target from mutable UI selection.
 window.firstWorldReincarnationExecutionTargetContext=rerunExecutionTarget;
 window.resolvePreparedFirstWorldExecutionTargetContext=preparedExecution;
 window.validateFirstWorldExecutionTargetContext=validateExecution;
 window.firstWorldTargetDriftSnapshot=driftSnapshot;
 window.firstWorldTargetContextClosureSnapshot=closureSnapshot;
 window.FIRST_WORLD_TARGET_CONTEXT_BATCH6_VERSION=VERSION;
 window.FIRST_WORLD_TARGET_DRIFT_GUARD_VERSION=DRIFT_VERSION;
 window.FIRST_WORLD_TARGET_FALLBACK_RETIREMENT_VERSION=FALLBACK_RETIREMENT_VERSION;
 window.FIRST_WORLD_TARGET_CONTEXT_FINAL_CLOSURE_VERSION=CLOSURE_VERSION;
})();