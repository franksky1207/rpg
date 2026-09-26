(function(){
 const VERSION=3;
 const BOSS_COUNT=Math.max(1,Math.floor(Number(window.THIRD_WORLD_BOSS_COUNT)||10));
 const BOSS_MAX_HP=Math.max(1,Math.floor(Number(window.THIRD_WORLD_BOSS_MAX_HP)||1100000000));
 const FIVE_POINT_PERCENT=5;
 const FIVE_POINT_HP_GAP=Math.floor(BOSS_MAX_HP*FIVE_POINT_PERCENT/100);
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
 const TITLE_ROWS=Object.freeze([
  {id:"higher-dimensional-title-01",name:"破界初臨",tier:1,thresholdRemainingPercentSum:900},
  {id:"higher-dimensional-title-02",name:"維外行者",tier:2,thresholdRemainingPercentSum:800},
  {id:"higher-dimensional-title-03",name:"超界之軀",tier:3,thresholdRemainingPercentSum:700},
  {id:"higher-dimensional-title-04",name:"高維真形",tier:4,thresholdRemainingPercentSum:600},
  {id:"higher-dimensional-title-05",name:"萬維共鳴",tier:5,thresholdRemainingPercentSum:500},
  {id:"higher-dimensional-title-06",name:"界律共主",tier:6,thresholdRemainingPercentSum:400},
  {id:"higher-dimensional-title-07",name:"維序凌駕",tier:7,thresholdRemainingPercentSum:300},
  {id:"higher-dimensional-title-08",name:"超維至尊",tier:8,thresholdRemainingPercentSum:200},
  {id:"higher-dimensional-title-09",name:"諸維唯一",tier:9,thresholdRemainingPercentSum:100},
  {id:"higher-dimensional-title-10",name:"萬維之上",tier:10,thresholdRemainingPercentSum:0,exactZero:true}
 ].map(row=>Object.freeze({...row,series:"higher-dimensional"})));

 function finiteWhole(value,fallback=0){const n=Math.floor(Number(value));return Number.isFinite(n)?n:fallback;}
 function clamp(value,min,max){return Math.max(min,Math.min(max,value));}
 function currentState(){try{return typeof state!=="undefined"&&state&&typeof state==="object"?state:null;}catch(e){return null;}}
 function targetState(target){return target&&typeof target==="object"?target:currentState();}
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
   index:boss.index,id:boss.id,name:boss.name,maxHp:boss.maxHp,stage,
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
  return Object.freeze(Object.fromEntries(ABILITY_DEFS.map(def=>[def.id,Object.freeze({...def,active:stage>=def.unlockStage})])));
 }
 function bossStoredHp(index,target=null){
  const boss=BOSS_ROWS[index];
  if(!boss)return 0;
  const s=targetState(target),raw=s?.thirdWorld?.bosses?.[index]?.currentHp;
  return clamp(finiteWhole(raw,boss.maxHp),0,boss.maxHp);
 }
 function bossProgressCore(index,target=null){
  const boss=BOSS_ROWS[index];
  if(!boss)return null;
  const currentHp=bossStoredHp(index,target),maxHp=boss.maxHp;
  const remainingRatio=maxHp>0?currentHp/maxHp:0;
  const remainingPercent=remainingRatio*100;
  const remainingBasisPoints=Math.round(remainingRatio*10000);
  const defeated=currentHp<=0;
  return Object.freeze({
   index:boss.index,id:boss.id,name:boss.name,maxHp,currentHp,
   remainingRatio,remainingPercent,remainingBasisPoints,
   alive:!defeated,defeated,
   stage:thirdWorldBossStage(currentHp,maxHp),
   stats:thirdWorldBossStats(index,currentHp),
   abilities:thirdWorldBossAbilities(index,currentHp)
  });
 }
 function thirdWorldBossAggregateSnapshot(target=null){
  const bosses=BOSS_ROWS.map((_,index)=>bossProgressCore(index,target));
  const maxHp=bosses.reduce((sum,row)=>sum+row.maxHp,0);
  const currentHp=bosses.reduce((sum,row)=>sum+row.currentHp,0);
  const alive=bosses.filter(row=>row.alive),defeated=bosses.filter(row=>row.defeated);
  const remainingPercentSum=bosses.reduce((sum,row)=>sum+row.remainingPercent,0);
  return Object.freeze({
   bossCount:bosses.length,aliveCount:alive.length,defeatedCount:defeated.length,currentHp,maxHp,
   overallRemainingPercent:maxHp>0?currentHp/maxHp*100:0,remainingPercentSum,
   aliveBossIndexes:Object.freeze(alive.map(row=>row.index)),
   defeatedBossIndexes:Object.freeze(defeated.map(row=>row.index)),
   bosses:Object.freeze(bosses.slice())
  });
 }
 function formalThirdWorldProgressionEnabled(target=null){
  const s=targetState(target);
  return !!s&&typeof window.worldProgressionEnabled==="function"&&window.worldProgressionEnabled(3,s)===true;
 }
 function thirdWorldChallengeStatus(value,target=null){
  const index=bossIndex(value),s=targetState(target);
  if(index<0||!s)return Object.freeze({allowed:false,challengeable:false,reason:"invalid",targetIndex:index});
  const aggregate=thirdWorldBossAggregateSnapshot(s),targetBoss=aggregate.bosses[index];
  if(!formalThirdWorldProgressionEnabled(s))return Object.freeze({allowed:false,challengeable:false,reason:"world-locked",targetIndex:index,target:targetBoss,aliveCount:aggregate.aliveCount});
  if(targetBoss.defeated)return Object.freeze({allowed:false,challengeable:false,reason:"defeated",targetIndex:index,target:targetBoss,aliveCount:aggregate.aliveCount});
  const alive=aggregate.bosses.filter(row=>row.alive);
  if(alive.length===1)return Object.freeze({
   allowed:true,challengeable:true,reason:"last-survivor",targetIndex:index,target:targetBoss,aliveCount:1,
   targetRemainingPercent:targetBoss.remainingPercent,highestAliveRemainingPercent:targetBoss.remainingPercent,gapPoints:0,
   highestAliveBossIndexes:Object.freeze([index]),blockingBossIndexes:Object.freeze([]),fivePointThreshold:FIVE_POINT_PERCENT,fivePointHpGap:FIVE_POINT_HP_GAP
  });
  const highestHp=Math.max(...alive.map(row=>row.currentHp));
  const highestAlive=alive.filter(row=>row.currentHp===highestHp);
  const blockers=alive.filter(row=>row.index!==index&&row.currentHp-targetBoss.currentHp>=FIVE_POINT_HP_GAP);
  const gapHp=Math.max(0,highestHp-targetBoss.currentHp),gapPoints=gapHp/BOSS_MAX_HP*100;
  const allowed=blockers.length===0;
  return Object.freeze({
   allowed,challengeable:allowed,reason:allowed?"":"five-point-front",targetIndex:index,target:targetBoss,aliveCount:alive.length,
   targetRemainingPercent:targetBoss.remainingPercent,highestAliveRemainingPercent:highestHp/BOSS_MAX_HP*100,gapHp,gapPoints,
   highestAliveBossIndexes:Object.freeze(highestAlive.map(row=>row.index)),blockingBossIndexes:Object.freeze(blockers.map(row=>row.index)),
   fivePointThreshold:FIVE_POINT_PERCENT,fivePointHpGap:FIVE_POINT_HP_GAP
  });
 }
 function thirdWorldChallengeAllowed(value,target=null){return thirdWorldChallengeStatus(value,target).allowed===true;}
 function canChallengeThirdWorldBoss(value,target=null){return thirdWorldChallengeAllowed(value,target);}
 function thirdWorldBossProgressSnapshot(value,target=null){
  const index=bossIndex(value);
  if(index<0)return null;
  const core=bossProgressCore(index,target),challenge=thirdWorldChallengeStatus(index,target);
  return Object.freeze({...core,challengeAllowed:challenge.allowed===true,challengeStatus:challenge});
 }
 function thirdWorldTotalRemainingPercent(target=null){return thirdWorldBossAggregateSnapshot(target).remainingPercentSum;}
 function thirdWorldOverallRemainingPercent(target=null){return thirdWorldBossAggregateSnapshot(target).overallRemainingPercent;}
 function thirdWorldTitleTierForRemainingPercentSum(value){
  const total=clamp(Number(value)||0,0,BOSS_COUNT*100);
  if(total<=0)return 10;
  for(let index=8;index>=0;index--){const def=TITLE_ROWS[index];if(total<=def.thresholdRemainingPercentSum)return def.tier;}
  return 0;
 }
 function thirdWorldTitleTier(target=null){
  if(typeof target==="number")return thirdWorldTitleTierForRemainingPercentSum(target);
  return thirdWorldTitleTierForRemainingPercentSum(thirdWorldTotalRemainingPercent(target));
 }
 function thirdWorldTitleDefinition(tier){
  const value=finiteWhole(tier,0);
  return TITLE_ROWS.find(row=>row.tier===value)||null;
 }
 function thirdWorldCurrentTitleDefinition(target=null){return thirdWorldTitleDefinition(thirdWorldTitleTier(target));}
 function makeThirdWorldProbeState(hps){
  const rows=Array.from({length:BOSS_COUNT},(_,index)=>({currentHp:clamp(finiteWhole(hps?.[index],BOSS_MAX_HP),0,BOSS_MAX_HP)}));
  return {secondWorld:{entered:true},thirdWorld:{entered:true,bosses:rows}};
 }
 function validateThirdWorldData(){
  const errors=[],fail=(code,data=null)=>errors.push({code,data});
  try{
   if(BOSS_COUNT!==10||BOSS_ROWS.length!==10)fail("BOSS_COUNT",{BOSS_COUNT,rows:BOSS_ROWS.length});
   if(new Set(BOSS_ROWS.map(row=>row.id)).size!==10)fail("BOSS_ID_UNIQUE");
   if(new Set(BOSS_ROWS.map(row=>row.name)).size!==10)fail("BOSS_NAME_UNIQUE");
   if(BOSS_MAX_HP!==1100000000||BOSS_ROWS.some(row=>row.maxHp!==BOSS_MAX_HP))fail("BOSS_MAX_HP",BOSS_MAX_HP);
   if(BASE_STATS.atk!==15000||BASE_STATS.def!==10000||BASE_STATS.crit!==10||BASE_STATS.dodge!==10)fail("BASE_STATS",BASE_STATS);
   const hp900001=Math.floor(BOSS_MAX_HP*900001/1000000),hp90=Math.floor(BOSS_MAX_HP*90/100);
   if(thirdWorldBossStage(BOSS_MAX_HP)!==0||thirdWorldBossStage(hp900001)!==0||thirdWorldBossStage(hp90)!==1||thirdWorldBossStage(BOSS_MAX_HP*.8)!==2||thirdWorldBossStage(BOSS_MAX_HP*.1)!==9||thirdWorldBossStage(0)!==9)fail("STAGE_BOUNDARY");
   const stage9=thirdWorldBossStats(4,BOSS_MAX_HP*.1);
   if(stage9?.atk!==20400||stage9?.def!==20800||stage9?.crit!==28||stage9?.dodge!==28||stage9?.comboRate!==40)fail("STAGE9_STATS",stage9);
   const specChecks=[thirdWorldBossStats(0)?.atk===17250,thirdWorldBossStats(1)?.def===11500,thirdWorldBossStats(2)?.crit===16,thirdWorldBossStats(3)?.dodge===16,thirdWorldBossStats(5)?.penetrationRate===40,thirdWorldBossStats(6)?.counterRate===40,thirdWorldBossStats(7)?.drainRate===40,thirdWorldBossStats(8)?.initiativeBonusPercent===80,thirdWorldBossStats(9)?.atk===16200&&thirdWorldBossStats(9)?.def===10800];
   if(specChecks.some(value=>value!==true))fail("BOSS_SPECIALIZATION",specChecks);
   const at70=thirdWorldBossAbilities(0,BOSS_MAX_HP*.7),above70=thirdWorldBossAbilities(0,Math.floor(BOSS_MAX_HP*.7)+1),at10=thirdWorldBossAbilities(0,BOSS_MAX_HP*.1);
   if(at70?.composure?.active!==true||at70?.suppression?.active!==false||above70?.composure?.active!==false||Object.values(at10||{}).some(row=>row.active!==true))fail("ABILITY_BOUNDARY",{at70,above70,at10});
   const full=makeThirdWorldProbeState(Array(10).fill(BOSS_MAX_HP)),fullAgg=thirdWorldBossAggregateSnapshot(full);
   if(fullAgg.currentHp!==11000000000||fullAgg.maxHp!==11000000000||fullAgg.aliveCount!==10||fullAgg.defeatedCount!==0||fullAgg.remainingPercentSum!==1000||fullAgg.overallRemainingPercent!==100)fail("AGGREGATE_FULL",fullAgg);
   const hp951=Math.floor(BOSS_MAX_HP*951/1000),hp950=Math.floor(BOSS_MAX_HP*95/100);
   const p951=makeThirdWorldProbeState([hp951,...Array(9).fill(BOSS_MAX_HP)]),p950=makeThirdWorldProbeState([hp950,...Array(9).fill(BOSS_MAX_HP)]);
   if(thirdWorldChallengeAllowed(0,p951)!==true||thirdWorldChallengeAllowed(0,p950)!==false||thirdWorldChallengeStatus(0,p950)?.reason!=="five-point-front")fail("FIVE_POINT_BOUNDARY",{p951:thirdWorldChallengeStatus(0,p951),p950:thirdWorldChallengeStatus(0,p950)});
   const oneDead=makeThirdWorldProbeState([0,...Array(9).fill(hp950)]),oneDeadStatus=thirdWorldChallengeStatus(1,oneDead);
   if(oneDeadStatus.allowed!==true||oneDeadStatus.blockingBossIndexes.length!==0)fail("DEAD_EXCLUDED_FROM_FIVE_POINT",oneDeadStatus);
   const last=makeThirdWorldProbeState([...Array(9).fill(0),1]),lastStatus=thirdWorldChallengeStatus(9,last);
   if(lastStatus.allowed!==true||lastStatus.reason!=="last-survivor")fail("LAST_SURVIVOR",lastStatus);
   const allDead=makeThirdWorldProbeState(Array(10).fill(0)),deadAgg=thirdWorldBossAggregateSnapshot(allDead);
   if(deadAgg.currentHp!==0||deadAgg.aliveCount!==0||deadAgg.defeatedCount!==10||deadAgg.remainingPercentSum!==0||deadAgg.overallRemainingPercent!==0)fail("AGGREGATE_DEAD",deadAgg);
   if(TITLE_ROWS.length!==10||new Set(TITLE_ROWS.map(row=>row.id)).size!==10||new Set(TITLE_ROWS.map(row=>row.name)).size!==10)fail("TITLE_METADATA");
   const titleCases=[[1000,0],[900,1],[800,2],[700,3],[600,4],[500,5],[400,6],[300,7],[200,8],[100,9],[1,9],[0,10]];
   titleCases.forEach(([remaining,expected])=>{const actual=thirdWorldTitleTierForRemainingPercentSum(remaining);if(actual!==expected)fail("TITLE_THRESHOLD",{remaining,expected,actual});});
  }catch(error){fail("EXCEPTION",String(error?.message||error));}
  return Object.freeze({version:1,passed:errors.length===0,errors:Object.freeze(errors.slice()),checkedAt:Date.now()});
 }

 window.THIRD_WORLD_DATA_VERSION=VERSION;
 window.THIRD_WORLD_BOSS_DATA_VERSION=1;
 window.THIRD_WORLD_BOSS_STAGE_VERSION=1;
 window.THIRD_WORLD_BOSS_ABILITY_DESCRIPTOR_VERSION=1;
 window.THIRD_WORLD_BOSS_PROGRESS_SNAPSHOT_VERSION=1;
 window.THIRD_WORLD_BOSS_AGGREGATE_SNAPSHOT_VERSION=1;
 window.THIRD_WORLD_FIVE_POINT_FRONT_VERSION=1;
 window.THIRD_WORLD_CHALLENGE_GATE_VERSION=1;
 window.THIRD_WORLD_TITLE_RULE_VERSION=1;
 window.THIRD_WORLD_DATA_INTEGRITY_VERSION=1;
 window.THIRD_WORLD_BOSS_BASE_STATS=BASE_STATS;
 window.THIRD_WORLD_BOSS_STAGE_CONFIG=STAGE_CONFIG;
 window.THIRD_WORLD_BOSS_DEFINITIONS=BOSS_ROWS;
 window.THIRD_WORLD_BOSS_ABILITY_DEFINITIONS=ABILITY_DEFS;
 window.THIRD_WORLD_TITLE_DEFINITIONS=TITLE_ROWS;
 window.THIRD_WORLD_FIVE_POINT_THRESHOLD=FIVE_POINT_PERCENT;
 window.THIRD_WORLD_FIVE_POINT_HP_GAP=FIVE_POINT_HP_GAP;
 window.thirdWorldBossIndex=bossIndex;
 window.thirdWorldBoss=thirdWorldBoss;
 window.thirdWorldBossStage=thirdWorldBossStage;
 window.thirdWorldBossStats=thirdWorldBossStats;
 window.thirdWorldBossAbilities=thirdWorldBossAbilities;
 window.thirdWorldBossProgressSnapshot=thirdWorldBossProgressSnapshot;
 window.thirdWorldBossAggregateSnapshot=thirdWorldBossAggregateSnapshot;
 window.thirdWorldChallengeStatus=thirdWorldChallengeStatus;
 window.thirdWorldChallengeAllowed=thirdWorldChallengeAllowed;
 window.canChallengeThirdWorldBoss=canChallengeThirdWorldBoss;
 window.thirdWorldTotalRemainingPercent=thirdWorldTotalRemainingPercent;
 window.thirdWorldOverallRemainingPercent=thirdWorldOverallRemainingPercent;
 window.thirdWorldTitleTierForRemainingPercentSum=thirdWorldTitleTierForRemainingPercentSum;
 window.thirdWorldTitleTier=thirdWorldTitleTier;
 window.thirdWorldTitleDefinition=thirdWorldTitleDefinition;
 window.thirdWorldCurrentTitleDefinition=thirdWorldCurrentTitleDefinition;
 window.validateThirdWorldData=validateThirdWorldData;
 window.THIRD_WORLD_DATA_INTEGRITY=validateThirdWorldData();
})();
