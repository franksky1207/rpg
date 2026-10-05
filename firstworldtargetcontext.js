(function(){
 const VERSION=1;
 const IDENTITY_VERSION=1;
 const POLICY_VERSION=1;
 const PREPARED_CONTEXT_VERSION=1;
 const PREPARED_SESSION_VERSION=1;
 const ENCOUNTER_BRIDGE_VERSION=1;
 const UI_PREPARE_BRIDGE_VERSION=1;
 const BATTLE_BINDING_VERSION=1;
 const LIFECYCLE_DELEGATE_VERSION=1;
 const POLICY_GATE_VERSION=1;
 const MODES=Object.freeze(["formal","rerun","review"]);
 let sequence=0;
 let sessionSequence=0;
 let preparedSession=null;

 function whole(value,fallback=-1){const n=Math.floor(Number(value));return Number.isFinite(n)?n:fallback;}
 function maps(){try{return typeof MAPS!=="undefined"&&Array.isArray(MAPS)?MAPS:[];}catch(_){return [];}}
 function targetState(target=null){return target&&typeof target==="object"?target:(typeof state!=="undefined"?state:null);}
 function currentPhase(target){
  if(typeof window.currentWorldPhase==="function")return Math.max(1,Math.min(3,whole(window.currentWorldPhase(target),1)));
  if(target?.thirdWorld?.entered===true)return 3;
  if(target?.secondWorld?.entered===true)return 2;
  return 1;
 }
 function lifeSnapshot(target){
  const s=targetState(target);
  const external=typeof window.worldReincarnationContext==="function"?window.worldReincarnationContext(s):null;
  if(!external||external.domain!=="world")return Object.freeze({version:LIFECYCLE_DELEGATE_VERSION,available:false,count:0,lifeId:0,reincarnationRun:false,firstRun:false,mode:"unavailable"});
  const count=Math.max(0,whole(external.count,0)),lifeId=Math.max(0,whole(external.lifeId,count)),reincarnationRun=external.reincarnationRun===true,firstRun=external.firstRun===true;
  return Object.freeze({version:LIFECYCLE_DELEGATE_VERSION,available:true,count,lifeId,reincarnationRun,firstRun,mode:String(external.mode||"")});
 }
 function runtimeMode(target=null){
  const s=targetState(target),life=lifeSnapshot(s);
  if(!life.available||currentPhase(s)!==1)return null;
  if(life.reincarnationRun===true)return "rerun";
  if(life.firstRun===true)return "formal";
  return null;
 }
 function validMapIndex(value){const index=whole(value,-1);return index>=0&&index<maps().length?index:-1;}
 function validEnemyIndex(value){const index=whole(value,-1);return index>=0&&index<=4?index:-1;}
 function targetType(enemyIndex){return enemyIndex===4?"boss":enemyIndex===3?"elite":"normal";}
 function resolvedMeta(mapIndex,enemyIndex){
  const map=maps()[mapIndex]||null,raw=map?.enemies?.[enemyIndex]||null;
  let encounter=null;
  try{if(typeof window.monsterObj==="function")encounter=window.monsterObj(mapIndex,enemyIndex);}catch(_){encounter=null;}
  return Object.freeze({mapName:String(map?.name||""),enemyName:String(encounter?.name||raw?.name||""),enemyLevel:Math.max(0,whole(encounter?.level??raw?.level,0)),targetType:targetType(enemyIndex)});
 }
 function immutableIdentity(mapIndex,enemyIndex){return Object.freeze({version:IDENTITY_VERSION,world:1,mapIndex,enemyIndex});}
 function denyPolicy(){return Object.freeze({version:POLICY_VERSION,formalRewardsAllowed:false,formalProgressAllowed:false,offlineSampleAllowed:false,specialEncounterAllowed:false,storyAllowed:false,deathPenaltyAllowed:false});}
 function policyFor(mode,type,valid=true){
  if(!valid||mode==="review")return denyPolicy();
  return Object.freeze({version:POLICY_VERSION,formalRewardsAllowed:true,formalProgressAllowed:true,offlineSampleAllowed:type!=="boss",specialEncounterAllowed:type!=="boss",storyAllowed:true,deathPenaltyAllowed:true});
 }
 function policySnapshot(context){return context?.policy?.version===POLICY_VERSION?context.policy:denyPolicy();}
 function policyAllows(context,requirements={}){
  const policy=policySnapshot(context),entries=requirements&&typeof requirements==="object"?Object.entries(requirements):[];
  return entries.every(([key,value])=>policy?.[key]===value);
 }
 function makeContextId(){sequence++;return `w1-${Date.now().toString(36)}-${sequence.toString(36)}`;}
 function makeSessionId(){sessionSequence++;return `w1s-${Date.now().toString(36)}-${sessionSequence.toString(36)}`;}
 function normalizeMode(value,target){
  const requested=String(value||"").trim();
  if(MODES.includes(requested))return requested;
  return runtimeMode(target)||"formal";
 }
 function authorizedFor(mode,valid,target,life){
  if(!valid)return false;
  if(mode==="review")return true;
  if(!life?.available||currentPhase(target)!==1)return false;
  if(mode==="rerun")return life.reincarnationRun===true;
  return life.firstRun===true;
 }
 function create(options={},target=null){
  const s=targetState(target),mode=normalizeMode(options.mode,s),mapIndex=validMapIndex(options.mapIndex),enemyIndex=validEnemyIndex(options.enemyIndex),valid=mapIndex>=0&&enemyIndex>=0,life=lifeSnapshot(s);
  const meta=valid?resolvedMeta(mapIndex,enemyIndex):Object.freeze({mapName:"",enemyName:"",enemyLevel:0,targetType:"invalid"});
  const identity=valid?immutableIdentity(mapIndex,enemyIndex):Object.freeze({version:IDENTITY_VERSION,world:1,mapIndex:-1,enemyIndex:-1});
  const policy=policyFor(mode,meta.targetType,valid),authorized=authorizedFor(mode,valid,s,life);
  return Object.freeze({version:VERSION,contextId:makeContextId(),world:1,mode,source:String(options.source||"explicit"),valid,authorized,identity,mapIndex:identity.mapIndex,enemyIndex:identity.enemyIndex,targetType:meta.targetType,mapName:meta.mapName,enemyName:meta.enemyName,enemyLevel:meta.enemyLevel,count:life.count,lifeId:life.lifeId,reincarnationRun:life.reincarnationRun,policy});
 }
 function selection(mode){
  if(mode==="review"){
   const mapIndex=typeof window.getGalaxyReviewSelectedMap==="function"?window.getGalaxyReviewSelectedMap():-1;
   const enemyIndex=typeof window.getGalaxyReviewSelectedEnemy==="function"?window.getGalaxyReviewSelectedEnemy():-1;
   return Object.freeze({mapIndex,enemyIndex,source:"review-selection"});
  }
  const mapIndex=typeof selectedMap!=="undefined"?selectedMap:-1;
  const enemyIndex=typeof selectedEnemy!=="undefined"?selectedEnemy:-1;
  return Object.freeze({mapIndex,enemyIndex,source:"ui-selection"});
 }
 function fromSelection(options={},target=null){const s=targetState(target),mode=normalizeMode(options.mode,s),picked=selection(mode);return create({mode,mapIndex:picked.mapIndex,enemyIndex:picked.enemyIndex,source:String(options.source||picked.source)},s);}
 function identityOf(context){const identity=context?.identity;if(identity?.world!==1||validMapIndex(identity.mapIndex)<0||validEnemyIndex(identity.enemyIndex)<0)return null;return immutableIdentity(identity.mapIndex,identity.enemyIndex);}
 function sameIdentity(a,b){const left=identityOf(a),right=identityOf(b);return !!left&&!!right&&left.mapIndex===right.mapIndex&&left.enemyIndex===right.enemyIndex;}
 function validate(context){
  const errors=[];
  if(!context||typeof context!=="object")errors.push("context-missing");
  else{
   if(context.version!==VERSION)errors.push("version");if(context.world!==1)errors.push("world");if(!MODES.includes(context.mode))errors.push("mode");
   if(context.valid===true){if(validMapIndex(context.mapIndex)<0)errors.push("map-index");if(validEnemyIndex(context.enemyIndex)<0)errors.push("enemy-index");if(!identityOf(context))errors.push("identity");}else if(context.authorized===true)errors.push("invalid-authorized");
   if(!context.policy||typeof context.policy!=="object"||context.policy.version!==POLICY_VERSION)errors.push("policy");
   if(Object.prototype.hasOwnProperty.call(context,"state")||Object.prototype.hasOwnProperty.call(context,"map")||Object.prototype.hasOwnProperty.call(context,"enemy"))errors.push("mutable-reference-field");
  }
  return Object.freeze({version:VERSION,passed:errors.length===0,errors:Object.freeze(errors)});
 }
 function validateCurrent(context,target=null){
  const s=targetState(target),base=validate(context),errors=[...base.errors],life=lifeSnapshot(s),phase=currentPhase(s);
  if(base.passed===true&&context?.valid===true&&context.mode!=="review"&&!life.available)errors.push("lifecycle-owner-missing");
  if(base.passed===true&&context?.valid===true&&life.available){if(context.count!==life.count)errors.push("stale-count");if(context.lifeId!==life.lifeId)errors.push("stale-life");if(context.mode==="formal"&&(phase!==1||life.firstRun!==true))errors.push("formal-life-mismatch");if(context.mode==="rerun"&&(phase!==1||life.reincarnationRun!==true))errors.push("rerun-life-mismatch");}
  return Object.freeze({version:BATTLE_BINDING_VERSION,passed:errors.length===0,errors:Object.freeze([...new Set(errors)]),phase,count:life.count,lifeId:life.lifeId,lifecycleAvailable:life.available});
 }
 function bindForBattle(context,target=null){const check=validateCurrent(context,target);if(check.passed!==true||context?.valid!==true||context?.authorized!==true)return null;if(context.mode==="review")return null;if(!policyAllows(context,{formalRewardsAllowed:true,formalProgressAllowed:true}))return null;return context;}
 function preparedContext(){return preparedSession?.context||null;}
 function preparedMatches(context,mode,picked,life){return !!context&&context.valid===true&&context.authorized===true&&life?.available===true&&context.mode===mode&&context.mapIndex===validMapIndex(picked.mapIndex)&&context.enemyIndex===validEnemyIndex(picked.enemyIndex)&&context.lifeId===life.lifeId&&context.count===life.count;}
 function sessionFor(context){
  if(!context||context.valid!==true||context.authorized!==true)return null;
  return Object.freeze({version:PREPARED_SESSION_VERSION,sessionId:makeSessionId(),contextId:String(context.contextId||""),mode:context.mode,world:1,mapIndex:context.mapIndex,enemyIndex:context.enemyIndex,count:context.count,lifeId:context.lifeId,context});
 }
 function setPrepared(context){preparedSession=sessionFor(context);return context;}
 function prepareFromSelection(options={},target=null){
  const s=targetState(target),mode=normalizeMode(options.mode,s),picked=selection(mode),life=lifeSnapshot(s),current=preparedContext();
  if(preparedMatches(current,mode,picked,life))return current;
  const next=create({mode,mapIndex:picked.mapIndex,enemyIndex:picked.enemyIndex,source:String(options.source||picked.source||"prepare-selection")},s);
  if(next.valid===true&&next.authorized===true)setPrepared(next);else preparedSession=null;
  return next;
 }
 function prepareExplicit(options={},target=null){
  const s=targetState(target),mode=normalizeMode(options.mode,s),life=lifeSnapshot(s),picked={mapIndex:options.mapIndex,enemyIndex:options.enemyIndex},current=preparedContext();
  if(preparedMatches(current,mode,picked,life))return current;
  const next=create({...options,mode,source:String(options.source||"prepare-explicit")},s);
  if(next.valid===true&&next.authorized===true)setPrepared(next);else preparedSession=null;
  return next;
 }
 function preparedSnapshot(){return preparedContext();}
 function preparedSessionSnapshot(){return preparedSession;}
 function preparedSessionForContext(context){return preparedSession&&context&&preparedSession.contextId===String(context.contextId||"")?preparedSession:null;}
 function clearPrepared(){preparedSession=null;return true;}
 function encounterFromContext(context,{preview=true}={}){if(validate(context).passed!==true||context?.valid!==true||context?.authorized!==true)return null;const mapIndex=context.mapIndex,enemyIndex=context.enemyIndex;try{if(preview&&typeof getPreviewEncounter==="function")return getPreviewEncounter(mapIndex,enemyIndex);if(typeof createMonsterEncounter==="function")return createMonsterEncounter(mapIndex,enemyIndex);if(typeof window.monsterObj==="function")return window.monsterObj(mapIndex,enemyIndex);}catch(_){return null;}return null;}
 function clearPreviewForContext(context){if(!identityOf(context)||typeof clearPreviewEncounter!=="function")return false;clearPreviewEncounter(context.mapIndex,context.enemyIndex);return true;}
 function withContextSelection(context,callback){if(typeof callback!=="function"||context?.valid!==true)return typeof callback==="function"?callback():undefined;let beforeMap,beforeEnemy,hasMap=false,hasEnemy=false;try{hasMap=typeof selectedMap!=="undefined";hasEnemy=typeof selectedEnemy!=="undefined";if(hasMap)beforeMap=selectedMap;if(hasEnemy)beforeEnemy=selectedEnemy;if(hasMap)selectedMap=context.mapIndex;if(hasEnemy)selectedEnemy=context.enemyIndex;return callback();}finally{if(hasMap)selectedMap=beforeMap;if(hasEnemy)selectedEnemy=beforeEnemy;}}
 function installUiBridge(){
  const report={version:UI_PREPARE_BRIDGE_VERSION,prepare:false,combatPreview:false,enterMap:false,selectEnemy:false,backToMaps:false,reviewPrepare:false,reviewSelection:false,reviewBack:false};
  const basePrepare=window.adventurePreparePage;if(typeof basePrepare==="function"){window.adventurePreparePage=function(){const context=prepareFromSelection({source:"prepare-render"},targetState());return withContextSelection(context,()=>basePrepare.apply(this,arguments));};report.prepare=true;}
  const baseCombat=window.adventureCombatPage;if(typeof baseCombat==="function"){window.adventureCombatPage=function(){const context=preparedSnapshot()||prepareFromSelection({source:"combat-render"},targetState());if(typeof currentCombatEncounter!=="undefined"&&!currentCombatEncounter){const encounter=encounterFromContext(context,{preview:true});if(encounter)currentCombatEncounter=encounter;}return withContextSelection(context,()=>baseCombat.apply(this,arguments));};report.combatPreview=true;}
  const baseBegin=window.beginCombat;if(typeof baseBegin==="function"){window.beginCombat=function(count){const context=preparedSnapshot()||prepareFromSelection({source:"begin-combat"},targetState());const bound=bindForBattle(context,targetState());if(!bound)return false;const encounter=encounterFromContext(bound,{preview:true});if(!encounter)return false;combatRound=1;combatTotal=count;currentCombatEncounter=encounter;adventureScreen="combat";if(typeof render==="function")render();if(typeof runBattles==="function")runBattles(count,null,bound);return true;};}
  const baseEnter=window.enterMap;if(typeof baseEnter==="function"){window.enterMap=function(){clearPrepared();return baseEnter.apply(this,arguments);};report.enterMap=true;}
  const baseSelect=window.selectEnemy;if(typeof baseSelect==="function"){window.selectEnemy=function(){clearPrepared();return baseSelect.apply(this,arguments);};report.selectEnemy=true;}
  const baseBack=window.backToMaps;if(typeof baseBack==="function"){window.backToMaps=function(){clearPrepared();return baseBack.apply(this,arguments);};report.backToMaps=true;}
  const baseReviewPrepare=window.galaxyReviewPreparePage;if(typeof baseReviewPrepare==="function"){window.galaxyReviewPreparePage=function(){const context=prepareFromSelection({mode:"review",source:"review-prepare-render"},targetState());return withContextSelection(context,()=>baseReviewPrepare.apply(this,arguments));};report.reviewPrepare=true;}
  const baseReviewSelect=window.selectGalaxyReviewEnemy;if(typeof baseReviewSelect==="function"){window.selectGalaxyReviewEnemy=function(){clearPrepared();const out=baseReviewSelect.apply(this,arguments);prepareFromSelection({mode:"review",source:"review-enemy-selection"},targetState());return out;};report.reviewSelection=true;}
  const baseReviewBack=window.backToGalaxyReviewMaps;if(typeof baseReviewBack==="function"){window.backToGalaxyReviewMaps=function(){clearPrepared();return baseReviewBack.apply(this,arguments);};report.reviewBack=true;}
  return Object.freeze(report);
 }
 function selfIntegrity(){const invalid=create({mode:"formal",mapIndex:-1,enemyIndex:99,source:"self-integrity"},targetState());const errors=[];if(invalid.valid!==false||invalid.authorized!==false)errors.push("invalid-fail-closed");if(Object.isFrozen(invalid)!==true||Object.isFrozen(invalid.identity)!==true||Object.isFrozen(invalid.policy)!==true)errors.push("immutable");if(policyAllows(invalid,{formalRewardsAllowed:false,formalProgressAllowed:false})!==true)errors.push("invalid-policy");if(typeof window.worldReincarnationContext!=="function")errors.push("lifecycle-owner-missing");return Object.freeze({version:VERSION,identityVersion:IDENTITY_VERSION,policyVersion:POLICY_VERSION,preparedContextVersion:PREPARED_CONTEXT_VERSION,preparedSessionVersion:PREPARED_SESSION_VERSION,encounterBridgeVersion:ENCOUNTER_BRIDGE_VERSION,uiPrepareBridgeVersion:UI_PREPARE_BRIDGE_VERSION,battleBindingVersion:BATTLE_BINDING_VERSION,lifecycleDelegateVersion:LIFECYCLE_DELEGATE_VERSION,policyGateVersion:POLICY_GATE_VERSION,passed:errors.length===0,errors:Object.freeze(errors)});}

 window.FIRST_WORLD_TARGET_CONTEXT_VERSION=VERSION;
 window.FIRST_WORLD_TARGET_IDENTITY_VERSION=IDENTITY_VERSION;
 window.FIRST_WORLD_TARGET_POLICY_VERSION=POLICY_VERSION;
 window.FIRST_WORLD_PREPARED_TARGET_CONTEXT_VERSION=PREPARED_CONTEXT_VERSION;
 window.FIRST_WORLD_PREPARED_TARGET_SESSION_VERSION=PREPARED_SESSION_VERSION;
 window.FIRST_WORLD_TARGET_ENCOUNTER_BRIDGE_VERSION=ENCOUNTER_BRIDGE_VERSION;
 window.FIRST_WORLD_TARGET_UI_PREPARE_BRIDGE_VERSION=UI_PREPARE_BRIDGE_VERSION;
 window.FIRST_WORLD_TARGET_BATTLE_BINDING_VERSION=BATTLE_BINDING_VERSION;
 window.FIRST_WORLD_TARGET_LIFECYCLE_DELEGATE_VERSION=LIFECYCLE_DELEGATE_VERSION;
 window.FIRST_WORLD_TARGET_POLICY_GATE_VERSION=POLICY_GATE_VERSION;
 window.FIRST_WORLD_TARGET_CONTEXT_MODES=MODES;
 window.createFirstWorldTargetContext=create;
 window.firstWorldTargetContextFromSelection=fromSelection;
 window.firstWorldTargetSelectionSnapshot=selection;
 window.firstWorldTargetLifecycleSnapshot=lifeSnapshot;
 window.resolveFirstWorldTargetRuntimeMode=runtimeMode;
 window.firstWorldTargetPolicy=policySnapshot;
 window.firstWorldTargetPolicyAllows=policyAllows;
 window.firstWorldTargetIdentity=identityOf;
 window.sameFirstWorldTargetIdentity=sameIdentity;
 window.validateFirstWorldTargetContext=validate;
 window.validateCurrentFirstWorldTargetContext=validateCurrent;
 window.bindFirstWorldBattleTargetContext=bindForBattle;
 window.prepareFirstWorldTargetContextFromSelection=prepareFromSelection;
 window.prepareFirstWorldTargetContext=prepareExplicit;
 window.getPreparedFirstWorldTargetContext=preparedSnapshot;
 window.getPreparedFirstWorldTargetSession=preparedSessionSnapshot;
 window.firstWorldPreparedTargetSessionForContext=preparedSessionForContext;
 window.clearPreparedFirstWorldTargetContext=clearPrepared;
 window.firstWorldEncounterFromTargetContext=encounterFromContext;
 window.clearFirstWorldPreviewForTargetContext=clearPreviewForContext;
 window.FIRST_WORLD_TARGET_CONTEXT_INTEGRITY=selfIntegrity();
 window.FIRST_WORLD_TARGET_UI_BRIDGE_INSTALL_REPORT=installUiBridge();
 if(!window.FIRST_WORLD_TARGET_CONTEXT_INTEGRITY.passed)console.error("[文明戰線] First World Target Context integrity error",window.FIRST_WORLD_TARGET_CONTEXT_INTEGRITY.errors);
})();