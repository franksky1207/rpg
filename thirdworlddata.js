(function(){
 const VERSION=1;
 const BOSS_COUNT=Math.max(1,Math.floor(Number(window.THIRD_WORLD_BOSS_COUNT)||10));
 const BOSS_MAX_HP=Math.max(1,Math.floor(Number(window.THIRD_WORLD_BOSS_MAX_HP)||1100000000));
 const BASE_STATS=Object.freeze({
  maxHp:BOSS_MAX_HP,
  atk:15000,
  def:10000,
  crit:10,
  dodge:10,
  initiativeBonusPercent:60,
  comboRate:30,
  penetrationRate:30,
  counterRate:30,
  drainRate:30
 });
 const STAGE_CONFIG=Object.freeze({
  maxStage:9,
  stepPercent:10,
  atkPerStage:600,
  defPerStage:1200,
  critPointsPerStage:2,
  dodgePointsPerStage:2
 });
 const BOSS_ROWS=Object.freeze([
  {id:"higher-dimensional-boss-01",name:"破界天裁",specialization:Object.freeze({id:"attack",atkMultiplier:1.15})},
  {id:"higher-dimensional-boss-02",name:"永劫重垣",specialization:Object.freeze({id:"defense",defMultiplier:1.15})},
  {id:"higher-dimensional-boss-03",name:"宿因天秤",specialization:Object.freeze({id:"critical",critPoints:6})},
  {id:"higher-dimensional-boss-04",name:"無相彼岸",specialization:Object.freeze({id:"dodge",dodgePoints:6})},
  {id:"higher-dimensional-boss-05",name:"萬象迴演",specialization:Object.freeze({id:"combo",comboRatePoints:10})},
  {id:"higher-dimensional-boss-06",name:"維隙之刃",specialization:Object.freeze({id:"penetration",penetrationRatePoints:10})},
  {id:"higher-dimensional-boss-07",name:"逆因輪轉",specialization:Object.freeze({id:"counter",counterRatePoints:10})},
  {id:"higher-dimensional-boss-08",name:"噬界深淵",specialization:Object.freeze({id:"drain",drainRatePoints:10})},
  {id:"higher-dimensional-boss-09",name:"先驗之瞳",specialization:Object.freeze({id:"initiative",initiativeBonusPoints:20})},
  {id:"higher-dimensional-boss-10",name:"高維原點",specialization:Object.freeze({id:"origin",atkMultiplier:1.08,defMultiplier:1.08})}
 ].map((row,index)=>Object.freeze({index,...row,maxHp:BOSS_MAX_HP})));
 const ABILITY_DEFS=Object.freeze([
  Object.freeze({id:"composure",name:"鎮心",unlockRemainingPercent:70,unlockStage:3,playerCritRateReductionPoints:5}),
  Object.freeze({id:"suppression",name:"壓制",unlockRemainingPercent:60,unlockStage:4,playerDodgeRateReductionPoints:5}),
  Object.freeze({id:"resilience",name:"韌性",unlockRemainingPercent:50,unlockStage:5,playerCritBonusDamageReductionPercent:30}),
  Object.freeze({id:"revenge",name:"復仇",unlockRemainingPercent:40,unlockStage:6,afterPlayerCrit:true,nextSuccessfulBossHitGuaranteedCrit:true}),
  Object.freeze({id:"backlash",name:"反噬",unlockRemainingPercent:30,unlockStage:7,triggerChance:15,reflectActualHpLossPercent:30}),
  Object.freeze({id:"ignore",name:"無視",unlockRemainingPercent:20,unlockStage:8,triggerChance:5,ignorePlayerDefensePercent:100}),
  Object.freeze({id:"battleSpirit",name:"戰意",unlockRemainingPercent:10,unlockStage:9,battleStartTriggerChance:75,atkPercentPerTurn:2,maxStacks:10})
 ]);

 function finiteWhole(value,fallback=0){const n=Math.floor(Number(value));return Number.isFinite(n)?n:fallback;}
 function clamp(value,min,max){return Math.max(min,Math.min(max,value));}
 function bossIndex(value){
  if(value&&typeof value==="object"){
   if(typeof value.id==="string"){
    const byId=BOSS_ROWS.findIndex(row=>row.id===value.id);
    if(byId>=0)return byId;
   }
   const byIndex=finiteWhole(value.index,-1);
   if(byIndex>=0&&byIndex<BOSS_ROWS.length)return byIndex;
  }
  if(typeof value==="string"){
   const byId=BOSS_ROWS.findIndex(row=>row.id===value);
   if(byId>=0)return byId;
  }
  const index=finiteWhole(value,-1);
  return index>=0&&index<BOSS_ROWS.length?index:-1;
 }
 function thirdWorldBoss(value){
  const index=bossIndex(value);
  return index>=0?BOSS_ROWS[index]:null;
 }
 function thirdWorldBossStage(currentHp,maxHp=BOSS_MAX_HP){
  const max=Math.max(1,finiteWhole(maxHp,BOSS_MAX_HP));
  const hp=clamp(finiteWhole(currentHp,max),0,max);
  let stage=0;
  for(let threshold=90;threshold>=10;threshold-=10){
   if(hp*100<=max*threshold)stage++;
   else break;
  }
  return Math.min(STAGE_CONFIG.maxStage,stage);
 }
 function applyBossSpecialization(stats,specialization){
  const spec=specialization&&typeof specialization==="object"?specialization:{};
  if(Number.isFinite(Number(spec.atkMultiplier)))stats.atk=Math.ceil(stats.atk*Number(spec.atkMultiplier));
  if(Number.isFinite(Number(spec.defMultiplier)))stats.def=Math.ceil(stats.def*Number(spec.defMultiplier));
  stats.crit+=Number(spec.critPoints)||0;
  stats.dodge+=Number(spec.dodgePoints)||0;
  stats.comboRate+=Number(spec.comboRatePoints)||0;
  stats.penetrationRate+=Number(spec.penetrationRatePoints)||0;
  stats.counterRate+=Number(spec.counterRatePoints)||0;
  stats.drainRate+=Number(spec.drainRatePoints)||0;
  stats.initiativeBonusPercent+=Number(spec.initiativeBonusPoints)||0;
  return stats;
 }
 function thirdWorldBossStats(value,currentHp=BOSS_MAX_HP){
  const boss=thirdWorldBoss(value);
  if(!boss)return null;
  const stage=thirdWorldBossStage(currentHp,boss.maxHp);
  const stats={
   index:boss.index,
   id:boss.id,
   name:boss.name,
   maxHp:boss.maxHp,
   stage,
   atk:BASE_STATS.atk+stage*STAGE_CONFIG.atkPerStage,
   def:BASE_STATS.def+stage*STAGE_CONFIG.defPerStage,
   crit:BASE_STATS.crit+stage*STAGE_CONFIG.critPointsPerStage,
   dodge:BASE_STATS.dodge+stage*STAGE_CONFIG.dodgePointsPerStage,
   initiativeBonusPercent:BASE_STATS.initiativeBonusPercent,
   comboRate:BASE_STATS.comboRate,
   penetrationRate:BASE_STATS.penetrationRate,
   counterRate:BASE_STATS.counterRate,
   drainRate:BASE_STATS.drainRate
  };
  applyBossSpecialization(stats,boss.specialization);
  return Object.freeze(stats);
 }
 function thirdWorldBossAbilities(value,currentHp=BOSS_MAX_HP){
  const boss=thirdWorldBoss(value);
  if(!boss)return null;
  const stage=thirdWorldBossStage(currentHp,boss.maxHp);
  return Object.freeze(Object.fromEntries(ABILITY_DEFS.map(def=>[
   def.id,
   Object.freeze({...def,active:stage>=def.unlockStage})
  ])));
 }

 window.THIRD_WORLD_DATA_VERSION=VERSION;
 window.THIRD_WORLD_BOSS_DATA_VERSION=1;
 window.THIRD_WORLD_BOSS_STAGE_VERSION=1;
 window.THIRD_WORLD_BOSS_ABILITY_DESCRIPTOR_VERSION=1;
 window.THIRD_WORLD_BOSS_BASE_STATS=BASE_STATS;
 window.THIRD_WORLD_BOSS_STAGE_CONFIG=STAGE_CONFIG;
 window.THIRD_WORLD_BOSS_DEFINITIONS=BOSS_ROWS;
 window.THIRD_WORLD_BOSS_ABILITY_DEFINITIONS=ABILITY_DEFS;
 window.thirdWorldBossIndex=bossIndex;
 window.thirdWorldBoss=thirdWorldBoss;
 window.thirdWorldBossStage=thirdWorldBossStage;
 window.thirdWorldBossStats=thirdWorldBossStats;
 window.thirdWorldBossAbilities=thirdWorldBossAbilities;
})();
