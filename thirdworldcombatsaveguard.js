(function(){
 const VERSION=2;
 const POLICY_VERSION=1;
 const SAVE_HOOK_CONVERGENCE_VERSION=1;
 const SAVE_HOOK_ID="third-world-combat-transient-cleanup";
 const ROOT_TRANSIENT_KEYS=Object.freeze(["thirdWorldCombat","thirdWorldCombatResult","thirdWorldCombatSnapshot","thirdWorldCombatRuntime","thirdWorldBattleRuntime","thirdWorldSettlementBasis"]);
 const RUNTIME_FIELD_NAMES=Object.freeze(["revengeReady","initiativeUsed","battleSpiritActivated","battleSpiritLayer","indomitableActivated","indomitableUsed","shield","actorState","playerAbilityProfile","enemyAbilityProfile","enemyEffectProfile","combat","snapshot","diagnostics","settlementBasis"]);
 function isObject(value){return !!value&&typeof value==="object"&&!Array.isArray(value);}
 function allowedSet(value,fallback){const rows=Array.isArray(value)?value:fallback;return new Set(rows.map(String));}
 function cleanup(target){
  if(!isObject(target))return {changed:false,removed:[]};
  const removed=[];
  ROOT_TRANSIENT_KEYS.forEach(key=>{if(Object.prototype.hasOwnProperty.call(target,key)){delete target[key];removed.push(key);}});
  if(isObject(target.thirdWorld)){
   const allowed=allowedSet(window.THIRD_WORLD_PERSISTENT_KEYS,["entered","completed","entryVersion","dimensionalStrings","coreLevel","bosses","story"]);
   Object.keys(target.thirdWorld).forEach(key=>{if(!allowed.has(key)){delete target.thirdWorld[key];removed.push(`thirdWorld.${key}`);}});
   if(Array.isArray(target.thirdWorld.bosses)){
    const bossAllowed=allowedSet(window.THIRD_WORLD_BOSS_PERSISTENT_KEYS,["currentHp"]);
    target.thirdWorld.bosses.forEach((row,index)=>{if(!isObject(row))return;Object.keys(row).forEach(key=>{if(!bossAllowed.has(key)){delete row[key];removed.push(`thirdWorld.bosses[${index}].${key}`);}});});
   }
   if(isObject(target.thirdWorld.story)){
    const storyAllowed=allowedSet(window.THIRD_WORLD_STORY_PERSISTENT_KEYS,["introSeen","unlockedStage","finalSeen"]);
    Object.keys(target.thirdWorld.story).forEach(key=>{if(!storyAllowed.has(key)){delete target.thirdWorld.story[key];removed.push(`thirdWorld.story.${key}`);}});
   }
  }
  return {changed:removed.length>0,removed};
 }
 function beforeSaveHook(context){
  try{const target=context?.state&&typeof context.state==="object"?context.state:(typeof state!=="undefined"?state:null);cleanup(target);return true;}
  catch(error){console.error("[文明戰線] Third-world combat save guard cleanup failed",error);if(context){context.cancelReason="third-world-combat-save-cleanup-failed";}return false;}
 }
 function runIntegrity(){
  const sample={saveVersion:Number(window.SAVE_SCHEMA_VERSION)||16,level:1000,thirdWorld:{entered:true,completed:false,entryVersion:1,dimensionalStrings:7,coreLevel:2,bosses:[{currentHp:123,revengeReady:true,initiativeUsed:true,combat:{}}],story:{introSeen:true,unlockedStage:2,finalSeen:false,battleSpiritLayer:9},combat:{actorState:{}}},thirdWorldCombatResult:{settlementBasis:{}},thirdWorldCombatRuntime:{revengeReady:true}};
  const result=cleanup(sample),boss=sample.thirdWorld?.bosses?.[0]||{},story=sample.thirdWorld?.story||{};
  const ok=result.changed===true&&sample.thirdWorld?.dimensionalStrings===7&&sample.thirdWorld?.coreLevel===2&&boss.currentHp===123&&story.unlockedStage===2&&!Object.prototype.hasOwnProperty.call(sample,"thirdWorldCombatResult")&&!Object.prototype.hasOwnProperty.call(sample,"thirdWorldCombatRuntime")&&!Object.prototype.hasOwnProperty.call(sample.thirdWorld,"combat")&&!Object.prototype.hasOwnProperty.call(boss,"revengeReady")&&!Object.prototype.hasOwnProperty.call(boss,"initiativeUsed")&&!Object.prototype.hasOwnProperty.call(boss,"combat")&&!Object.prototype.hasOwnProperty.call(story,"battleSpiritLayer");
  return Object.freeze({version:VERSION,passed:ok,removed:Object.freeze(result.removed.slice()),schemaVersion:Number(window.SAVE_SCHEMA_VERSION)||0,schemaBumpRequired:false,saveHookConvergenceVersion:SAVE_HOOK_CONVERGENCE_VERSION});
 }
 window.THIRD_WORLD_COMBAT_SAVE_GUARD_VERSION=VERSION;
 window.THIRD_WORLD_COMBAT_SAVE_SCHEMA_POLICY_VERSION=POLICY_VERSION;
 window.THIRD_WORLD_COMBAT_SAVE_SCHEMA_BUMP_REQUIRED=false;
 window.THIRD_WORLD_COMBAT_SAVE_HOOK_CONVERGENCE_VERSION=SAVE_HOOK_CONVERGENCE_VERSION;
 window.THIRD_WORLD_COMBAT_TRANSIENT_SAVE_KEYS=Object.freeze([...ROOT_TRANSIENT_KEYS,...RUNTIME_FIELD_NAMES]);
 window.THIRD_WORLD_COMBAT_SAVE_GUARD_REPORT=runIntegrity();
 if(typeof window.registerBeforeSaveHook!=="function")throw new Error("正式 Save Hook owner 尚未載入。");
 window.registerBeforeSaveHook(SAVE_HOOK_ID,beforeSaveHook);
 if(typeof window.registerNewStateNormalizer==="function")window.registerNewStateNormalizer(target=>{cleanup(target);return target;});
 if(window.THIRD_WORLD_COMBAT_SAVE_GUARD_REPORT.passed!==true)console.error("[文明戰線] Third-world combat save guard integrity error",window.THIRD_WORLD_COMBAT_SAVE_GUARD_REPORT);
})();
