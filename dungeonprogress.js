(function(){
 const ARENA_POSITION_MODEL_VERSION=1;
 const ARENA_ASSESSMENT_RULE_VERSION=2;
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
 function normalizeArenaProgress(dungeon,target){
  if(!dungeon.arena||typeof dungeon.arena!=="object"||Array.isArray(dungeon.arena))dungeon.arena={};
  const source=dungeon.arena;
  const regions=Array.isArray(WORLD_REGIONS)&&WORLD_REGIONS.length?WORLD_REGIONS:[];
  const maxRank=Math.max(1,regions.length||1),cap=Math.max(1,Math.min(maxRank,unlockedArenaRankCap(target)));
  const hasHighest=Number.isFinite(Number(source.highestArenaUnlocked))&&Number(source.highestArenaUnlocked)>=1;
  const hasWindowStart=Number.isFinite(Number(source.windowStart))&&Number(source.windowStart)>=1;
  const legacyRank=Math.max(1,Math.min(maxRank,Math.floor(Number(source.rank)||1)));
  const positionModelCompatible=Math.floor(Number(source.positionModelVersion)||0)===ARENA_POSITION_MODEL_VERSION;
  let highestArenaUnlocked;
  let assessmentCompatible=false;
  if(hasHighest){highestArenaUnlocked=Math.floor(Number(source.highestArenaUnlocked));assessmentCompatible=positionModelCompatible;}
  else if(hasWindowStart)highestArenaUnlocked=Math.floor(Number(source.windowStart));
  else highestArenaUnlocked=legacyRank;
  highestArenaUnlocked=Math.max(1,Math.min(maxRank,cap,highestArenaUnlocked));
  const visibleStart=Math.max(1,highestArenaUnlocked-2);
  const activeRaw=Math.floor(Number(source.activeRank)||0);
  const activeRank=activeRaw>=visibleStart&&activeRaw<=highestArenaUnlocked?activeRaw:null;
  const runs=assessmentCompatible?Math.max(0,Math.min(ARENA_ASSESS_RUNS,Math.floor(Number(source.lastCheckRuns)||0))):0;
  const clears=assessmentCompatible?Math.max(0,Math.min(runs,Math.floor(Number(source.lastCheckClearCount)||0))):0;
  const signature=assessmentCompatible&&typeof source.lastCheckSignature==="string"&&source.lastCheckSignature?source.lastCheckSignature:null;
  const promotionReady=!!signature&&runs===ARENA_ASSESS_RUNS&&clears>=ARENA_ASSESS_CLEAR_TARGET;
  const normalized={positionModelVersion:ARENA_POSITION_MODEL_VERSION,assessmentRuleVersion:ARENA_ASSESSMENT_RULE_VERSION,highestArenaUnlocked,activeRank,rank:activeRank||highestArenaUnlocked,promotionReady,lastCheckSignature:signature,lastCheckRuns:runs,lastCheckClearCount:clears};
  Object.keys(source).forEach(key=>{if(!(key in normalized))delete source[key];});
  Object.assign(source,normalized);
  return source;
 }
 window.unlockedArenaRankCapForState=unlockedArenaRankCap;

 function normalizeDungeonState(target){
  if(!target||typeof target!=="object")return null;
  if(!target.dungeon||typeof target.dungeon!=="object"||Array.isArray(target.dungeon))target.dungeon={};
  const dungeon=target.dungeon;
  delete dungeon.progress;
  delete dungeon.attempts;
  delete dungeon.activeRun;
  delete dungeon.points;
  normalizeArenaProgress(dungeon,target);
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
  normalizeDungeonState(state);
  state.saveVersion=typeof currentSaveVersion==="function"?currentSaveVersion():SAVE_VERSION;
  return {vipHpInitialized,recoveredInterruptedRun:false,dungeon:state.dungeon};
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