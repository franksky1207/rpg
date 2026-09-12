(function(){
 const ASSESS_RUNS=500;
 const ASSESS_CLEAR_TARGET=485;
 const ASSESS_BATCH_SIZE=10;
 const COMBAT_SPEC_KEYS=["initiative","combo","penetration","counter","drain"];
 const POSITION_IDS=["normal","hard","extreme"];
 const POSITION_LABELS={normal:"低",hard:"中",extreme:"高"};

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

 function combatSpecSnapshot(){
  const out={};
  COMBAT_SPEC_KEYS.forEach(key=>{out[key]=typeof specializationLevel==="function"?Math.max(0,Math.floor(Number(specializationLevel(key))||0)):0;});
  return out;
 }
 function assessmentSignature(rank,difficultyId){
  const base=createSpecialPlayerSnapshot(equippedStats());
  const vip=Math.max(0,Math.floor(Number(state?.vipLevel)||0));
  return JSON.stringify({
   rank:clampRank(rank),
   positionDifficulty:difficultyId,
   level:typeof clampGameLevel==="function"?clampGameLevel(state?.level):Math.max(1,Math.floor(Number(state?.level)||1)),
   base:{hp:base.hp,atk:base.atk,def:base.def,crit:base.crit,dodge:base.dodge},
   vip,
   spec:combatSpecSnapshot()
  });
 }
 function assessmentArena(){
  const d=typeof ensureDungeonProgressState==="function"?ensureDungeonProgressState():state?.dungeon;
  return d?.arena||null;
 }
 function syncPromotionReady(arena){
  if(!arena||typeof arena!=="object")return false;
  const runs=Math.max(0,Math.min(ASSESS_RUNS,Math.floor(Number(arena.lastCheckRuns)||0)));
  const clears=Math.max(0,Math.min(runs,Math.floor(Number(arena.lastCheckClearCount)||0)));
  const hasResult=runs===ASSESS_RUNS&&typeof arena.lastCheckSignature==="string"&&!!arena.lastCheckSignature;
  const ready=hasResult&&clears>=ASSESS_CLEAR_TARGET;
  const changed=arena.promotionReady!==ready;
  arena.promotionReady=ready;
  if(changed&&typeof save==="function")save(false);
  return ready;
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
  const arena=assessmentArena();
  const rank=currentAssessmentRank();
  const difficultyId=positionDifficultyId(rank);
  const signature=assessmentSignature(rank,difficultyId);
  const runs=Math.max(0,Math.min(ASSESS_RUNS,Math.floor(Number(arena?.lastCheckRuns)||0)));
  const clears=Math.max(0,Math.min(runs,Math.floor(Number(arena?.lastCheckClearCount)||0)));
  const hasResult=runs===ASSESS_RUNS&&typeof arena?.lastCheckSignature==="string"&&!!arena.lastCheckSignature;
  const maxRank=Math.max(1,Array.isArray(WORLD_REGIONS)&&WORLD_REGIONS.length?WORLD_REGIONS.length:1);
  const unlockedCap=typeof getArenaUnlockedRankCap==="function"?clampRank(getArenaUnlockedRankCap()):rank;
  const promotionReady=syncPromotionReady(arena);
  return {
   rank,
   rankName:typeof getArenaRankName==="function"?getArenaRankName(rank):`第${rank}階`,
   positionDifficultyId:difficultyId,
   positionLabel:positionLabel(rank),
   runs,
   clears,
   rate:runs>0&&typeof round1==="function"?round1(clears/runs*100):runs>0?Math.round(clears/runs*1000)/10:0,
   promotionReady,
   signatureCurrent:arena?.lastCheckSignature===signature,
   hasResult,
   stale:hasResult&&arena?.lastCheckSignature!==signature,
   unlockedCap,
   maxRank,
   canPromote:promotionReady&&rank<unlockedCap&&rank<maxRank
  };
 }
 function assessmentContext(){
  const arena=assessmentArena();
  const rank=currentAssessmentRank();
  const maxRank=Math.max(1,Array.isArray(WORLD_REGIONS)&&WORLD_REGIONS.length?WORLD_REGIONS.length:1);
  if(!arena)return {early:{...assessmentStatus(),reason:"unavailable"}};
  if(rank>=maxRank)return {early:{...assessmentStatus(),reason:"max-rank"}};
  syncPromotionReady(arena);
  if(arena.promotionReady===true)return {early:{...assessmentStatus(),reason:"already-ready"}};
  const difficultyId=positionDifficultyId(rank);
  const base=createSpecialPlayerSnapshot(equippedStats());
  const player=createSpecialPlayerSnapshot(playerCombatStats(base,state.vipLevel));
  const signature=assessmentSignature(rank,difficultyId);
  return {rank,difficultyId,base,player,signature};
 }
 function finishAssessment(ctx,clears){
  const arena=assessmentArena();
  if(!arena)return {...assessmentStatus(),reason:"unavailable"};
  arena.lastCheckRuns=ASSESS_RUNS;
  arena.lastCheckClearCount=Math.max(0,Math.min(ASSESS_RUNS,Math.floor(Number(clears)||0)));
  arena.lastCheckSignature=ctx.signature;
  arena.promotionReady=arena.lastCheckClearCount>=ASSESS_CLEAR_TARGET;
  save(false);
  if(typeof render==="function")render();
  return {...assessmentStatus(),reason:arena.promotionReady?"qualified":"not-qualified"};
 }

 window.getArenaAssessmentStatus=assessmentStatus;
 window.assessArenaPromotion=function(){
  const ctx=assessmentContext();
  if(ctx.early)return ctx.early;
  let clears=0;
  for(let i=0;i<ASSESS_RUNS;i++)if(simulateFullRun(ctx.rank,ctx.difficultyId,ctx.base,ctx.player))clears++;
  return finishAssessment(ctx,clears);
 };
 window.assessArenaPromotionAsync=function(onProgress=null){
  const ctx=assessmentContext();
  if(ctx.early)return Promise.resolve(ctx.early);
  let completed=0,clears=0;
  return new Promise((resolve,reject)=>{
   function step(){
    try{
     const end=Math.min(ASSESS_RUNS,completed+ASSESS_BATCH_SIZE);
     for(;completed<end;completed++)if(simulateFullRun(ctx.rank,ctx.difficultyId,ctx.base,ctx.player))clears++;
     if(typeof onProgress==="function")onProgress({completed,total:ASSESS_RUNS,clears});
     if(completed<ASSESS_RUNS){setTimeout(step,0);return;}
     resolve(finishAssessment(ctx,clears));
    }catch(err){reject(err);}
   }
   setTimeout(step,0);
  });
 };

 window.getArenaPositionDifficultyId=positionDifficultyId;
 window.getArenaPositionLabel=positionLabel;
 window.getArenaPositionIndex=positionIndexForRank;
})();