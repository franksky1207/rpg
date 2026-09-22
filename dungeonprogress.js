(function(){
 const ARENA_COMPATIBILITY_PROFILE=Object.freeze({
  positionModelVersion:1,
  assessmentRuleVersion:4,
  assessmentStateVersion:4,
  assessmentRuntimeVersion:4,
  balanceVersion:6,
  rankBalanceVersion:3,
  positionApiVersion:1,
  enemyProfileVersion:1,
  pacingSourceVersion:1
 });
 const ARENA_POSITION_MODEL_VERSION=ARENA_COMPATIBILITY_PROFILE.positionModelVersion;
 const ARENA_ASSESSMENT_RULE_VERSION=ARENA_COMPATIBILITY_PROFILE.assessmentRuleVersion;
 const ARENA_BALANCE_COMPAT_VERSION=ARENA_COMPATIBILITY_PROFILE.balanceVersion;
 const ARENA_ASSESS_RUNS=500;
 const ARENA_ASSESS_CLEAR_TARGET=485;

 function finiteNonNegative(value,fallback=0){const n=Number(value);return Number.isFinite(n)&&n>=0?n:fallback;}
 function unlockedArenaRankCap(target){
  const regions=Array.isArray(WORLD_REGIONS)&&WORLD_REGIONS.length?WORLD_REGIONS:[];
  if(!regions.length)return 1;
  const unlockedMap=Math.max(0,Math.floor(Number(target?.unlockedMap)||0));
  const unlockedRegions=regions.filter(region=>unlockedMap>=Math.max(0,Math.floor(Number(region?.mapStart)||0))).length;
  return Math.max(1,Math.min(regions.length,unlockedRegions||1));
 }
 function arenaWorldForState(target){
  return target?.secondWorld?.entered===true?2:1;
 }
 function blankArenaProgress(){
  return {};
 }
 function arenaMaxRankForWorld(world){
  if(Number(world)===2)return 10;
  const regions=Array.isArray(WORLD_REGIONS)&&WORLD_REGIONS.length?WORLD_REGIONS:[];
  return Math.max(1,regions.length||1);
 }
 function arenaRankCapForWorld(target,world){
  if(Number(world)===2)return 10;
  return Math.max(1,Math.min(arenaMaxRankForWorld(1),unlockedArenaRankCap(target)));
 }
 function normalizeArenaProfile(source,target,world){
  const row=source&&typeof source==="object"&&!Array.isArray(source)?source:blankArenaProgress();
  const maxRank=arenaMaxRankForWorld(world),cap=Math.max(1,Math.min(maxRank,arenaRankCapForWorld(target,world)));
  const hasHighest=Number.isFinite(Number(row.highestArenaUnlocked))&&Number(row.highestArenaUnlocked)>=1;
  const hasWindowStart=Number.isFinite(Number(row.windowStart))&&Number(row.windowStart)>=1;
  const legacyRank=Math.max(1,Math.min(maxRank,Math.floor(Number(row.rank)||1)));
  const positionModelCompatible=Math.floor(Number(row.positionModelVersion)||0)===ARENA_POSITION_MODEL_VERSION;
  const assessmentRuleCompatible=Math.floor(Number(row.assessmentRuleVersion)||0)===ARENA_ASSESSMENT_RULE_VERSION;
  const balanceCompatible=Math.floor(Number(row.balanceVersion)||0)===ARENA_BALANCE_COMPAT_VERSION;
  let highestArenaUnlocked,assessmentCompatible=false;
  if(hasHighest){highestArenaUnlocked=Math.floor(Number(row.highestArenaUnlocked));assessmentCompatible=positionModelCompatible&&assessmentRuleCompatible&&balanceCompatible;}
  else if(hasWindowStart)highestArenaUnlocked=Math.floor(Number(row.windowStart));
  else highestArenaUnlocked=legacyRank;
  highestArenaUnlocked=Math.max(1,Math.min(maxRank,cap,highestArenaUnlocked));
  const visibleStart=Math.max(1,highestArenaUnlocked-2);
  const activeRaw=Math.floor(Number(row.activeRank)||0);
  const activeRank=activeRaw>=visibleStart&&activeRaw<=highestArenaUnlocked?activeRaw:null;
  const runs=assessmentCompatible?Math.max(0,Math.min(ARENA_ASSESS_RUNS,Math.floor(Number(row.lastCheckRuns)||0))):0;
  const clears=assessmentCompatible?Math.max(0,Math.min(runs,Math.floor(Number(row.lastCheckClearCount)||0))):0;
  const signature=assessmentCompatible&&typeof row.lastCheckSignature==="string"&&row.lastCheckSignature?row.lastCheckSignature:null;
  const promotionReady=!!signature&&runs===ARENA_ASSESS_RUNS&&clears>=ARENA_ASSESS_CLEAR_TARGET;
  const normalized={positionModelVersion:ARENA_POSITION_MODEL_VERSION,assessmentRuleVersion:ARENA_ASSESSMENT_RULE_VERSION,balanceVersion:ARENA_BALANCE_COMPAT_VERSION,highestArenaUnlocked,activeRank,rank:activeRank||highestArenaUnlocked,promotionReady,lastCheckSignature:signature,lastCheckRuns:runs,lastCheckClearCount:clears};
  Object.keys(row).forEach(key=>{if(!(key in normalized))delete row[key];});
  Object.assign(row,normalized);
  return row;
 }
 function normalizeArenaProgress(dungeon,target){
  const legacyArena=dungeon.arena&&typeof dungeon.arena==="object"&&!Array.isArray(dungeon.arena)?dungeon.arena:null;
  if(!dungeon.arenaByWorld||typeof dungeon.arenaByWorld!=="object"||Array.isArray(dungeon.arenaByWorld))dungeon.arenaByWorld={};
  if(!dungeon.arenaByWorld[1]||typeof dungeon.arenaByWorld[1]!=="object"||Array.isArray(dungeon.arenaByWorld[1]))dungeon.arenaByWorld[1]=legacyArena||blankArenaProgress();
  if(!dungeon.arenaByWorld[2]||typeof dungeon.arenaByWorld[2]!=="object"||Array.isArray(dungeon.arenaByWorld[2]))dungeon.arenaByWorld[2]=blankArenaProgress();
  normalizeArenaProfile(dungeon.arenaByWorld[1],target,1);
  normalizeArenaProfile(dungeon.arenaByWorld[2],target,2);
  try{delete dungeon.arena;}catch(e){}
  Object.defineProperty(dungeon,"arena",{
   configurable:true,
   enumerable:false,
   get(){return dungeon.arenaByWorld[arenaWorldForState(target)]||dungeon.arenaByWorld[1];},
   set(value){const world=arenaWorldForState(target);dungeon.arenaByWorld[world]=normalizeArenaProfile(value,target,world);}
  });
  return dungeon.arena;
 }
 function arenaProgressForWorld(target,world=null){
  if(!target||typeof target!=="object")return null;
  if(!target.dungeon||typeof target.dungeon!=="object"||Array.isArray(target.dungeon))target.dungeon={};
  normalizeArenaProgress(target.dungeon,target);
  const key=Number(world)===2?2:Number(world)===1?1:arenaWorldForState(target);
  return target.dungeon.arenaByWorld[key];
 }
 window.ARENA_ASSESSMENT_STATE_VERSION=ARENA_COMPATIBILITY_PROFILE.assessmentStateVersion;
 window.getArenaVersionProfile=function(){return {...ARENA_COMPATIBILITY_PROFILE};};
 window.getArenaAssessmentCompatibilityVersions=function(){const v=window.getArenaVersionProfile();return {positionModelVersion:v.positionModelVersion,assessmentRuleVersion:v.assessmentRuleVersion,balanceVersion:v.balanceVersion};};
 window.unlockedArenaRankCapForState=unlockedArenaRankCap;
 window.ARENA_BY_WORLD_STATE_VERSION=1;
 window.arenaWorldForState=arenaWorldForState;
 window.normalizeArenaProgressByWorld=normalizeArenaProgress;
 window.getArenaProgressForWorld=function(world,target=null){const s=target&&typeof target==="object"?target:(typeof state!=="undefined"?state:null);return arenaProgressForWorld(s,world);};
 window.getCurrentArenaProgress=function(target=null){const s=target&&typeof target==="object"?target:(typeof state!=="undefined"?state:null);return arenaProgressForWorld(s,null);};

 function normalizeDungeonState(target,options={}){
  if(!target||typeof target!=="object")return null;
  if(!target.dungeon||typeof target.dungeon!=="object"||Array.isArray(target.dungeon))target.dungeon={};
  const dungeon=target.dungeon;
  delete dungeon.progress;
  delete dungeon.attempts;
  delete dungeon.activeRun;
  delete dungeon.points;
  normalizeArenaProgress(dungeon,target);
  if(typeof window.normalizeMirrorDungeonState==="function")window.normalizeMirrorDungeonState(target,options?.timestamp??Date.now(),options?.mirrorOptions||{});
  return dungeon;
 }
 window.normalizeDungeonSaveState=normalizeDungeonState;

 function initializeVipHpIfNeeded(){
  if(!state||state.vipInitialized===true)return false;
  const baseMax=Math.max(1,equippedStats().hp),current=Math.max(0,Number(state.hp)||0),ratio=Math.max(0,Math.min(1,current/baseMax)),vipMax=Math.max(1,playerCombatStats().hp);
  state.hp=current>=baseMax?vipMax:Math.max(0,Math.min(vipMax,Math.round(vipMax*ratio)));
  state.vipInitialized=true;
  return true;
 }
 function normalizeFreshDungeonState(target){normalizeDungeonState(target);target.vipInitialized=true;return target;}
 if(typeof registerNewStateNormalizer==="function")registerNewStateNormalizer(normalizeFreshDungeonState);

 window.finalizeDungeonLoadedState=function(){
  const vipHpInitialized=initializeVipHpIfNeeded();
  const beforeMirrorStatus=state?.dungeon?.mirror?.daily?.status;
  normalizeDungeonState(state,{timestamp:Date.now(),mirrorOptions:{recoverInterrupted:true}});
  const afterMirrorStatus=state?.dungeon?.mirror?.daily?.status;
  state.saveVersion=typeof currentSaveVersion==="function"?currentSaveVersion():SAVE_VERSION;
  return {
   vipHpInitialized,
   recoveredInterruptedRun:false,
   recoveredInterruptedMirrorRun:beforeMirrorStatus==="running"&&afterMirrorStatus!=="running",
   dungeon:state.dungeon
  };
 };
 window.ensureDungeonState=function(){return normalizeDungeonState(state);};
 // 舊名稱僅保留相容性；新程式一律使用 ensureDungeonState。
 window.ensureDungeonProgressState=window.ensureDungeonState;
 window.addDungeonPoints=function(amount){
  const baseAdded=Math.floor(finiteNonNegative(amount,0));
  const multiplier=typeof vipDungeonPointMultiplier==="function"?vipDungeonPointMultiplier():1;
  const adjusted=typeof adjustVipDungeonPoints==="function"?adjustVipDungeonPoints(baseAdded):Math.floor(baseAdded*multiplier);
  const result=typeof addVipPoints==="function"?addVipPoints(adjusted):{added:adjusted,points:(state.vipPoints||0)+adjusted};
  state.vipPoints=Math.floor(finiteNonNegative(result.points,0));
  return {added:result.added??adjusted,baseAdded,points:state.vipPoints,multiplier,vipLevel:state.vipLevel||0,levelsGained:result.levelsGained||0};
 };
})();