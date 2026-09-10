(function(){
 const DUNGEON_PROGRESS_THRESHOLD=100;
 const ENEMY_HP_PROGRESS_RATE=1.5;
 const DAMAGE_PROGRESS_RATE=4;

 function finiteNonNegative(value,fallback=0){
  const n=Number(value);
  return Number.isFinite(n)&&n>=0?n:fallback;
 }

 function roundProgress(value){
  return Math.round((Number(value)||0)*1000000)/1000000;
 }

 function vipDungeonProgressMultiplier(){
  const lv=Math.max(0,Math.floor(Number(state?.vipLevel)||0));
  if(lv>=12)return 1.20;
  if(lv>=4)return 1.10;
  return 1;
 }
 window.vipDungeonProgressMultiplier=vipDungeonProgressMultiplier;

 function normalizeDungeonState(target){
  if(!target||typeof target!=="object")return null;
  if(!target.dungeon||typeof target.dungeon!=="object")target.dungeon={};

  let progress=finiteNonNegative(target.dungeon.progress,0);
  let attempts=Math.floor(finiteNonNegative(target.dungeon.attempts,0));
  const legacyPoints=finiteNonNegative(target.dungeon.points,0);
  const vipPoints=Math.floor(finiteNonNegative(target.vipPoints,legacyPoints));
  const converted=Math.floor((progress+1e-9)/DUNGEON_PROGRESS_THRESHOLD);
  if(converted>0){
   attempts+=converted;
   progress-=converted*DUNGEON_PROGRESS_THRESHOLD;
  }

  target.dungeon.progress=roundProgress(Math.max(0,progress));
  target.dungeon.attempts=attempts;
  target.vipPoints=vipPoints;
  // 舊存檔／舊模組相容鏡像；正式積分來源以 state.vipPoints 為準。
  target.dungeon.points=vipPoints;
  if(typeof normalizeVipState==="function")normalizeVipState(target);
  return target.dungeon;
 }

 function initializeVipHpIfNeeded(){
  if(!state||state.vipInitialized===true)return;
  const baseMax=Math.max(1,equippedStats().hp);
  const current=Math.max(0,Number(state.hp)||0);
  const ratio=Math.max(0,Math.min(1,current/baseMax));
  const vipMax=Math.max(1,playerCombatStats().hp);
  state.hp=current>=baseMax?vipMax:Math.max(0,Math.min(vipMax,Math.round(vipMax*ratio)));
  state.vipInitialized=true;
 }

 const baseNewState=newState;
 newState=function(){
  const next=baseNewState();
  normalizeDungeonState(next);
  next.vipInitialized=true;
  return next;
 };

 const baseLoad=load;
 load=function(){
  baseLoad();
  initializeVipHpIfNeeded();
  normalizeDungeonState(state);
  state.saveVersion=SAVE_VERSION;
  save(false);
 };

 window.ensureDungeonProgressState=function(){
  return normalizeDungeonState(state);
 };

 window.calculateDungeonBattleProgress=function(params={}){
  if(params.source!=="main"||params.win!==true)return 0;

  const enemyMaxHp=finiteNonNegative(params.enemyMaxHp,0);
  const playerLevel=Math.max(1,Math.floor(Number(params.playerLevel)||Number(state?.level)||1));
  const playerBaseHp=Math.max(1,baseHP(playerLevel));
  const playerMaxHp=Math.max(1,finiteNonNegative(params.playerMaxHp,playerBaseHp));
  const startHp=Math.max(0,finiteNonNegative(params.startHp,0));
  const endHp=Math.max(0,finiteNonNegative(params.endHp,0));
  const damageRate=Math.max(0,Math.min(1,(startHp-endHp)/playerMaxHp));

  const enemyHpPart=(enemyMaxHp/playerBaseHp)*ENEMY_HP_PROGRESS_RATE;
  const damagePart=damageRate*DAMAGE_PROGRESS_RATE;
  const baseProgress=Math.max(0,enemyHpPart+damagePart);
  return roundProgress(baseProgress*vipDungeonProgressMultiplier());
 };

 window.addDungeonProgress=function(amount){
  const dungeon=normalizeDungeonState(state);
  if(!dungeon)return {added:0,gainedAttempts:0,progress:0,attempts:0};

  const added=finiteNonNegative(amount,0);
  const total=dungeon.progress+added;
  const gainedAttempts=Math.floor((total+1e-9)/DUNGEON_PROGRESS_THRESHOLD);
  dungeon.progress=roundProgress(Math.max(0,total-gainedAttempts*DUNGEON_PROGRESS_THRESHOLD));
  dungeon.attempts+=gainedAttempts;

  return {
   added:roundProgress(added),
   gainedAttempts,
   progress:dungeon.progress,
   attempts:dungeon.attempts
  };
 };

 window.addDungeonPoints=function(amount){
  const dungeon=normalizeDungeonState(state);
  if(!dungeon)return {added:0,points:0};
  const added=Math.floor(finiteNonNegative(amount,0));
  const activeRun=typeof getActiveDungeonRun==="function"?getActiveDungeonRun():null;
  const lockCarryHp=activeRun?.mode==="arena"||activeRun?.mode==="void-mirage";
  const hpBefore=state.hp;
  const result=typeof addVipPoints==="function"?addVipPoints(added):{added,points:(state.vipPoints||0)+added};
  if(lockCarryHp)state.hp=hpBefore;
  state.vipPoints=Math.floor(finiteNonNegative(result.points,0));
  dungeon.points=state.vipPoints;
  return {added:result.added??added,points:state.vipPoints,vipLevel:state.vipLevel||0,levelsGained:result.levelsGained||0};
 };

 window.awardDungeonProgressForBattle=function(params={}){
  const added=calculateDungeonBattleProgress(params);
  if(added<=0){
   const dungeon=normalizeDungeonState(state)||{progress:0,attempts:0};
   return {added:0,gainedAttempts:0,progress:dungeon.progress,attempts:dungeon.attempts};
  }
  return addDungeonProgress(added);
 };
})();
