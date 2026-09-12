(function(){
 const DUNGEON_PROGRESS_THRESHOLD=100;
 const ENEMY_HP_PROGRESS_RATE=1.5;
 const DAMAGE_PROGRESS_RATE=4;

 function finiteNonNegative(value,fallback=0){
  const n=Number(value);return Number.isFinite(n)&&n>=0?n:fallback;
 }
 function roundProgress(value){return Math.round((Number(value)||0)*1000000)/1000000;}
 function vipDungeonProgressMultiplier(){
  const lv=Math.max(0,Math.floor(Number(state?.vipLevel)||0));
  if(lv>=12)return 1.20;
  if(lv>=4)return 1.10;
  return 1;
 }
 window.vipDungeonProgressMultiplier=vipDungeonProgressMultiplier;

 function unlockedArenaRankCap(target){
  const regions=Array.isArray(WORLD_REGIONS)&&WORLD_REGIONS.length?WORLD_REGIONS:[];
  if(!regions.length)return 1;
  const unlockedMap=Math.max(0,Math.floor(Number(target?.unlockedMap)||0));
  const unlockedRegions=regions.filter(region=>unlockedMap>=Math.max(0,Math.floor(Number(region?.mapStart)||0))).length;
  const baseArenaRanks=Math.min(3,regions.length);
  return Math.max(baseArenaRanks,Math.min(regions.length,unlockedRegions||1));
 }
 function normalizeArenaProgress(dungeon,target){
  const source=dungeon.arena&&typeof dungeon.arena==="object"&&!Array.isArray(dungeon.arena)?dungeon.arena:{};
  const regions=Array.isArray(WORLD_REGIONS)&&WORLD_REGIONS.length?WORLD_REGIONS:[];
  const maxRank=Math.max(1,regions.length||1),cap=Math.max(1,Math.min(maxRank,unlockedArenaRankCap(target)));
  const maxWindowStart=Math.max(1,maxRank-2),maxAllowedStart=Math.max(1,Math.min(maxWindowStart,cap-2));
  const hasWindowStart=Number.isFinite(Number(source.windowStart))&&Number(source.windowStart)>=1;
  const legacyRank=Math.max(1,Math.min(maxRank,Math.floor(Number(source.rank)||1));
  let windowStart=hasWindowStart?Math.floor(Number(source.windowStart)):legacyRank>=3?legacyRank-2:1;
  windowStart=Math.max(1,Math.min(maxAllowedStart,windowStart));
  const assessmentRank=Math.max(1,Math.min(maxRank,windowStart+2));
  const legacyAssessmentCompatible=hasWindowStart||legacyRank>=3&&legacyRank===assessmentRank;
  const runs=legacyAssessmentCompatible?Math.max(0,Math.min(500,Math.floor(Number(source.lastCheckRuns)||0))):0;
  const clears=legacyAssessmentCompatible?Math.max(0,Math.min(runs,Math.floor(Number(source.lastCheckClearCount)||0))):0;
  dungeon.arena={
   windowStart,
   rank:assessmentRank,
   promotionReady:legacyAssessmentCompatible&&source.promotionReady===true,
   lastCheckSignature:legacyAssessmentCompatible&&typeof source.lastCheckSignature==="string"&&source.lastCheckSignature?source.lastCheckSignature:null,
   lastCheckRuns:runs,
   lastCheckClearCount:clears
  };
  return dungeon.arena;
 }
 window.unlockedArenaRankCapForState=unlockedArenaRankCap;

 function normalizeDungeonState(target){
  if(!target||typeof target!=="object")return null;
  if(!target.dungeon||typeof target.dungeon!=="object")target.dungeon={};
  const dungeon=target.dungeon;
  let progress=finiteNonNegative(dungeon.progress,0);
  let attempts=Math.floor(finiteNonNegative(dungeon.attempts,0));
  const legacyPoints=finiteNonNegative(dungeon.points,0);
  const vipPoints=Math.floor(finiteNonNegative(target.vipPoints,legacyPoints));
  const converted=Math.floor((progress+1e-9)/DUNGEON_PROGRESS_THRESHOLD);
  if(converted>0){attempts+=converted;progress-=converted*DUNGEON_PROGRESS_THRESHOLD;}
  dungeon.progress=roundProgress(Math.max(0,progress));
  dungeon.attempts=attempts;
  target.vipPoints=vipPoints;
  dungeon.points=vipPoints;
  normalizeArenaProgress(dungeon,target);
  const marker=dungeon.activeRun;
  if(marker&&typeof marker==="object"&&!Array.isArray(marker)){
   dungeon.activeRun={
    id:typeof marker.id==="string"?marker.id:"",
    mode:typeof marker.mode==="string"?marker.mode:"dungeon",
    cost:Math.max(1,Math.floor(Number(marker.cost)||1)),
    startedAt:Math.max(0,Number(marker.startedAt)||0)
   };
  }else dungeon.activeRun=null;
  if(typeof normalizeVipState==="function")normalizeVipState(target);
  return dungeon;
 }
 window.normalizeDungeonSaveState=normalizeDungeonState;

 function initializeVipHpIfNeeded(){
  if(!state||state.vipInitialized===true)return;
  const baseMax=Math.max(1,equippedStats().hp),current=Math.max(0,Number(state.hp)||0),ratio=Math.max(0,Math.min(1,current/baseMax)),vipMax=Math.max(1,playerCombatStats().hp);
  state.hp=current>=baseMax?vipMax:Math.max(0,Math.min(vipMax,Math.round(vipMax*ratio)));
  state.vipInitialized=true;
 }
 function recoverInterruptedDungeonRun(){
  const dungeon=normalizeDungeonState(state);if(!dungeon?.activeRun)return false;
  state.hp=playerCombatStats().hp;
  dungeon.activeRun=null;
  return true;
 }

 const baseNewState=newState;
 newState=function(){const next=baseNewState();normalizeDungeonState(next);next.vipInitialized=true;return next;};
 const baseLoad=load;
 load=function(){
  baseLoad();
  initializeVipHpIfNeeded();
  normalizeDungeonState(state);
  recoverInterruptedDungeonRun();
  state.saveVersion=typeof currentSaveVersion==="function"?currentSaveVersion():SAVE_VERSION;
  save(false);
 };

 window.ensureDungeonProgressState=function(){return normalizeDungeonState(state);};
 window.calculateDungeonBattleProgress=function(params={}){
  if(params.source!=="main"||params.win!==true)return 0;
  const enemyMaxHp=finiteNonNegative(params.enemyMaxHp,0),playerLevel=Math.max(1,Math.floor(Number(params.playerLevel)||Number(state?.level)||1)),playerBaseHp=Math.max(1,baseHP(playerLevel)),playerMaxHp=Math.max(1,finiteNonNegative(params.playerMaxHp,playerBaseHp)),startHp=Math.max(0,finiteNonNegative(params.startHp,0)),endHp=Math.max(0,finiteNonNegative(params.endHp,0));
  const damageRate=Math.max(0,Math.min(1,(startHp-endHp)/playerMaxHp));
  return roundProgress(Math.max(0,(enemyMaxHp/playerBaseHp)*ENEMY_HP_PROGRESS_RATE+damageRate*DAMAGE_PROGRESS_RATE)*vipDungeonProgressMultiplier());
 };
 window.addDungeonProgress=function(amount){
  const dungeon=normalizeDungeonState(state);if(!dungeon)return {added:0,gainedAttempts:0,progress:0,attempts:0};
  const added=finiteNonNegative(amount,0),total=dungeon.progress+added,gainedAttempts=Math.floor((total+1e-9)/DUNGEON_PROGRESS_THRESHOLD);
  dungeon.progress=roundProgress(Math.max(0,total-gainedAttempts*DUNGEON_PROGRESS_THRESHOLD));dungeon.attempts+=gainedAttempts;
  return {added:roundProgress(added),gainedAttempts,progress:dungeon.progress,attempts:dungeon.attempts};
 };
 window.addDungeonPoints=function(amount){
  const dungeon=normalizeDungeonState(state);if(!dungeon)return {added:0,points:0};
  const added=Math.floor(finiteNonNegative(amount,0)),activeRun=typeof getActiveDungeonRun==="function"?getActiveDungeonRun():null,lockCarryHp=activeRun?.mode==="arena"||activeRun?.mode==="void-mirage",hpBefore=state.hp;
  const result=typeof addVipPoints==="function"?addVipPoints(added):{added,points:(state.vipPoints||0)+added};
  if(lockCarryHp)state.hp=hpBefore;
  state.vipPoints=Math.floor(finiteNonNegative(result.points,0));dungeon.points=state.vipPoints;
  return {added:result.added??added,points:state.vipPoints,vipLevel:state.vipLevel||0,levelsGained:result.levelsGained||0};
 };
 window.awardDungeonProgressForBattle=function(params={}){
  const added=calculateDungeonBattleProgress(params);
  if(added<=0){const dungeon=normalizeDungeonState(state)||{progress:0,attempts:0};return {added:0,gainedAttempts:0,progress:dungeon.progress,attempts:dungeon.attempts};}
  return addDungeonProgress(added);
 };
})();