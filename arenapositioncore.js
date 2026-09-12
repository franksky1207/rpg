(function(){
 const ASSESS_RUNS=500;
 const ASSESS_CLEAR_TARGET=450;
 const COMBAT_SPEC_KEYS=["initiative","combo","penetration","counter","drain"];
 const POSITION_IDS=["normal","hard","extreme"];
 const POSITION_LABELS={normal:"低",hard:"中",extreme:"高"};
 const POSITION_BASE_POINTS={normal:180,hard:300,extreme:420};
 const POSITION_STAGE_WEIGHTS={normal:[25,35,120],hard:[35,45,200],extreme:[40,60,320]};
 const ARENA_POINT_STEP=130;

 const PHYSICAL_STAGE_PROFILE=[
  {hpMul:.60,damageMul:.57,defMul:.78},
  {hpMul:.69,damageMul:.64,defMul:.80},
  {hpMul:.78,damageMul:.73,defMul:.82}
 ];
 const RANK_HP_STEP=.05;
 const RANK_DAMAGE_STEP=.015;
 const RANK_DEF_STEP=.03;
 let arenaAwardedPoints=0;

 function clampRank(value){
  const max=Math.max(1,Array.isArray(WORLD_REGIONS)&&WORLD_REGIONS.length?WORLD_REGIONS.length:1);
  return Math.max(1,Math.min(max,Math.floor(Number(value)||1)));
 }
 function arenaProgress(){
  if(typeof getArenaProgressState==="function")return getArenaProgressState();
  const d=typeof ensureDungeonProgressState==="function"?ensureDungeonProgressState():state?.dungeon;
  const highest=clampRank(d?.arena?.highestArenaUnlocked||d?.arena?.rank||1);
  const start=Math.max(1,highest-2),visible=[];
  for(let r=start;r<=highest;r++)visible.push(r);
  return {highestArenaUnlocked:highest,assessmentRank:highest,visibleRanks:visible};
 }
 function positionIndexForRank(rank){
  const r=clampRank(rank),visible=arenaProgress().visibleRanks||[];
  const idx=visible.indexOf(r);
  if(idx>=0)return Math.max(0,Math.min(2,idx));
  const highest=clampRank(arenaProgress().highestArenaUnlocked||r);
  const start=Math.max(1,highest-2);
  return Math.max(0,Math.min(2,r-start));
 }
 function positionDifficultyId(rank){return POSITION_IDS[positionIndexForRank(rank)]||"normal";}
 function positionLabel(rank){return POSITION_LABELS[positionDifficultyId(rank)]||"低";}
 function scaleStagePoints(weights,total){
  const source=Array.isArray(weights)&&weights.length===3?weights:[0,0,0];
  const sum=Math.max(1,source.reduce((a,b)=>a+Math.max(0,Number(b)||0),0));
  const target=Math.max(0,Math.floor(Number(total)||0));
  const first=Math.max(0,Math.round((Number(source[0])||0)*target/sum));
  const second=Math.max(0,Math.round((Number(source[1])||0)*target/sum));
  return [first,second,Math.max(0,target-first-second)];
 }
 function pointTotalForRankPosition(rank,difficultyId){
  const r=clampRank(rank),rawIndex=POSITION_IDS.indexOf(difficultyId),idx=rawIndex>=0?rawIndex:0;
  const id=POSITION_IDS[idx];
  const windowStart=Math.max(1,r-idx);
  return POSITION_BASE_POINTS[id]+ARENA_POINT_STEP*(windowStart-1);
 }
 function pointConfig(rank,difficultyId){
  const id=POSITION_IDS.includes(difficultyId)?difficultyId:"normal";
  const totalPoints=pointTotalForRankPosition(rank,id);
  return {totalPoints,stagePoints:scaleStagePoints(POSITION_STAGE_WEIGHTS[id],totalPoints)};
 }

 function rankScale(rank){
  const n=clampRank(rank)-1;
  return {hp:1+RANK_HP_STEP*n,damage:1+RANK_DAMAGE_STEP*n,def:1+RANK_DEF_STEP*n};
 }
 function normalizeArenaPhysicalStats(enemy){
  if(!enemy||enemy.kind!=="dungeon-arena"||!enemy.playerSnapshot||typeof specialBaseEnemyFromPlayer!=="function")return enemy;
  const idx=Math.max(0,Math.min(2,Math.floor(Number(enemy.arenaStage)||0)));
  const profile=PHYSICAL_STAGE_PROFILE[idx]||PHYSICAL_STAGE_PROFILE[0];
  const p=enemy.playerSnapshot;
  const base=specialBaseEnemyFromPlayer(p);
  const scale=rankScale(enemy.arenaRank||1);
  enemy.hp=Math.max(1,Math.ceil(base.hp*profile.hpMul*scale.hp));
  enemy.atk=Math.max(1,Math.ceil(base.damage*profile.damageMul*scale.damage+(Number(p.def)||0)*.55));
  enemy.def=Math.max(0,Math.ceil(base.def*profile.defMul*scale.def));
  enemy.arenaPositionDifficulty=positionDifficultyId(enemy.arenaRank||1);
  enemy.arenaPositionLabel=positionLabel(enemy.arenaRank||1);
  return enemy;
 }

 const baseRunCombatCore=window.runCombatCore;
 if(typeof baseRunCombatCore==="function"){
  window.runCombatCore=function(player,enemy,startHp=null,options={}){
   normalizeArenaPhysicalStats(enemy);
   return baseRunCombatCore(player,enemy,startHp,options);
  };
 }

 const baseBuildArenaEnemyForTest=window.buildArenaEnemyForTest;
 if(typeof baseBuildArenaEnemyForTest==="function"){
  window.buildArenaEnemyForTest=function(difficultyId,stageIndex,stats=null,level=null,rank=null){
   return normalizeArenaPhysicalStats(baseBuildArenaEnemyForTest(difficultyId,stageIndex,stats,level,rank));
  };
 }

 const baseGetArenaDifficultyConfigs=window.getArenaDifficultyConfigs;
 if(typeof baseGetArenaDifficultyConfigs==="function"){
  window.getArenaDifficultyConfigs=function(rank=null){
   return baseGetArenaDifficultyConfigs(rank).map(cfg=>{
    const pc=pointConfig(cfg.rank||rank||1,cfg.id);
    return {...cfg,totalPoints:pc.totalPoints,stagePoints:pc.stagePoints};
   });
  };
 }

 const baseGetArenaCoreState=window.getArenaCoreState;
 const baseAddDungeonPoints=window.addDungeonPoints;
 if(typeof baseAddDungeonPoints==="function"){
  window.addDungeonPoints=function(amount){
   const run=typeof getActiveDungeonRun==="function"?getActiveDungeonRun():null;
   const core=typeof baseGetArenaCoreState==="function"?baseGetArenaCoreState():null;
   if(run?.mode==="arena"&&core?.phase==="combat"&&core?.difficulty){
    const pc=pointConfig(core.rank,core.difficulty.id),stage=Math.max(0,Math.min(2,Math.floor(Number(core.stage)||0)));
    const corrected=Math.floor(Number(pc.stagePoints[stage])||0);
    arenaAwardedPoints+=corrected;
    return baseAddDungeonPoints(corrected);
   }
   return baseAddDungeonPoints(amount);
  };
 }

 if(typeof baseGetArenaCoreState==="function"){
  window.getArenaCoreState=function(){
   const core=baseGetArenaCoreState();
   if(!core?.difficulty)return core;
   const pc=pointConfig(core.rank,core.difficulty.id);
   core.difficulty={...core.difficulty,totalPoints:pc.totalPoints,stagePoints:pc.stagePoints.slice()};
   if(Array.isArray(core.history))core.history=core.history.map(h=>({...h,stagePoints:h.win?pc.stagePoints[Math.max(0,Math.min(2,Math.floor(Number(h.stage)||0)))]:0}));
   core.gainedPoints=arenaAwardedPoints;
   if(core.summary)core.summary={...core.summary,totalPoints:arenaAwardedPoints};
   return core;
  };
 }

 const baseRenderArenaDungeon=window.renderArenaDungeon;
 if(typeof baseRenderArenaDungeon==="function"){
  window.renderArenaDungeon=function(){
   let html=baseRenderArenaDungeon();
   const core=typeof window.getArenaCoreState==="function"?window.getArenaCoreState():null;
   if(!core?.difficulty||typeof html!=="string")return html;
   const pc=core.difficulty;
   if(core.phase==="ready")html=html.replace(/全通可獲得：\d+ VIP 積分/,`全通可獲得：${pc.totalPoints} VIP 積分`);
   if(core.phase==="result"){
    if(core.continuous)html=html.replace(/總獲得 VIP 積分：<strong>\d+<\/strong>/,`總獲得 VIP 積分：<strong>${arenaAwardedPoints}</strong>`);
    else{
     let passedIndex=0;
     html=html.replace(/通過　\+\d+/g,()=>`通過　+${pc.stagePoints[passedIndex++]||0}`);
     html=html.replace(/本次獲得 VIP 積分：<strong>\d+<\/strong>/,`本次獲得 VIP 積分：<strong>${arenaAwardedPoints}</strong>`);
    }
   }
   return html;
  };
 }

 const baseStartArenaDungeon=window.startArenaDungeon;
 if(typeof baseStartArenaDungeon==="function"){
  window.startArenaDungeon=function(_difficultyId){
   arenaAwardedPoints=0;
   const rank=typeof getArenaCurrentRank==="function"?getArenaCurrentRank():arenaProgress().assessmentRank;
   return baseStartArenaDungeon(positionDifficultyId(rank));
  };
 }

 function combatSpecSnapshot(){
  const out={};
  COMBAT_SPEC_KEYS.forEach(key=>{out[key]=typeof specializationLevel==="function"?Math.max(0,Math.floor(Number(specializationLevel(key))||0)):0;});
  return out;
 }
 function assessmentSignature(rank,difficultyId){
  const base=createSpecialPlayerSnapshot(equippedStats());
  const vip=Math.max(0,Math.floor(Number(state?.vipLevel)||0));
  return JSON.stringify({
   rank:clampRank(rank),positionDifficulty:difficultyId,
   level:typeof clampGameLevel==="function"?clampGameLevel(state?.level):Math.max(1,Math.floor(Number(state?.level)||1)),
   base:{hp:base.hp,atk:base.atk,def:base.def,crit:base.crit,dodge:base.dodge},vip,spec:combatSpecSnapshot()
  });
 }
 function assessmentArena(){
  const d=typeof ensureDungeonProgressState==="function"?ensureDungeonProgressState():state?.dungeon;
  return d?.arena||null;
 }
 function currentAssessmentRank(){return clampRank(arenaProgress().assessmentRank||arenaProgress().highestArenaUnlocked||1);}
 function simulateFullRun(rank,difficultyId,baseStats,playerStats){
  let hp=playerStats.hp;
  for(let stage=0;stage<3;stage++){
   const enemy=window.buildArenaEnemyForTest(difficultyId,stage,baseStats,state.level,rank);
   if(!enemy)return false;
   const result=window.runCombatCore(playerStats,enemy,hp,{logs:false});
   hp=result.hp;
   if(!result.win)return false;
  }
  return true;
 }
 function assessmentStatus(){
  const arena=assessmentArena(),rank=currentAssessmentRank(),difficultyId=positionDifficultyId(rank),signature=assessmentSignature(rank,difficultyId);
  const runs=Math.max(0,Math.min(ASSESS_RUNS,Math.floor(Number(arena?.lastCheckRuns)||0)));
  const clears=Math.max(0,Math.min(runs,Math.floor(Number(arena?.lastCheckClearCount)||0)));
  const hasResult=runs===ASSESS_RUNS&&typeof arena?.lastCheckSignature==="string"&&!!arena.lastCheckSignature;
  const maxRank=Math.max(1,Array.isArray(WORLD_REGIONS)&&WORLD_REGIONS.length?WORLD_REGIONS.length:1);
  const unlockedCap=typeof getArenaUnlockedRankCap==="function"?clampRank(getArenaUnlockedRankCap()):rank;
  return {rank,rankName:typeof getArenaRankName==="function"?getArenaRankName(rank):`第${rank}階`,positionDifficultyId:difficultyId,positionLabel:positionLabel(rank),runs,clears,rate:runs>0&&typeof round1==="function"?round1(clears/runs*100):runs>0?Math.round(clears/runs*1000)/10:0,promotionReady:arena?.promotionReady===true,signatureCurrent:arena?.lastCheckSignature===signature,hasResult,stale:hasResult&&arena?.lastCheckSignature!==signature,unlockedCap,maxRank,canPromote:arena?.promotionReady===true&&rank<unlockedCap&&rank<maxRank};
 }

 window.getArenaAssessmentStatus=assessmentStatus;
 window.assessArenaPromotion=function(){
  const arena=assessmentArena(),rank=currentAssessmentRank();
  const maxRank=Math.max(1,Array.isArray(WORLD_REGIONS)&&WORLD_REGIONS.length?WORLD_REGIONS.length:1);
  if(!arena)return {...assessmentStatus(),reason:"unavailable"};
  if(rank>=maxRank)return {...assessmentStatus(),reason:"max-rank"};
  if(arena.promotionReady===true)return {...assessmentStatus(),reason:"already-ready"};
  const difficultyId=positionDifficultyId(rank),base=createSpecialPlayerSnapshot(equippedStats()),player=createSpecialPlayerSnapshot(playerCombatStats(base,state.vipLevel));
  let clears=0;
  for(let i=0;i<ASSESS_RUNS;i++)if(simulateFullRun(rank,difficultyId,base,player))clears++;
  arena.lastCheckRuns=ASSESS_RUNS;arena.lastCheckClearCount=clears;arena.lastCheckSignature=assessmentSignature(rank,difficultyId);arena.promotionReady=clears>=ASSESS_CLEAR_TARGET;
  save(false);if(typeof render==="function")render();
  return {...assessmentStatus(),reason:arena.promotionReady?"qualified":"not-qualified"};
 };

 window.getArenaPositionDifficultyId=positionDifficultyId;
 window.getArenaPositionLabel=positionLabel;
 window.getArenaPositionIndex=positionIndexForRank;
 window.getArenaPointTotalForRankPosition=pointTotalForRankPosition;
 window.getArenaPointConfig=pointConfig;
 window.normalizeArenaPhysicalStats=normalizeArenaPhysicalStats;
})();
