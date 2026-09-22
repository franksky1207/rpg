(function(){
 const ASSESS_RUNS=500;
 const ASSESS_CLEAR_TARGET=485;
 const ASSESS_BATCH_SIZE=10;
 const COMBAT_SPEC_KEYS=["initiative","combo","penetration","counter","drain"];
 const ASSESS_MARK_KEYS=["ward","suppression","composure","indomitable","resilience","battleSpirit","absorption","revenge","backlash","ignore"];
 const POSITION_TEMPLATE_IDS=["normal","hard","extreme"];
 const POSITION_LABELS={normal:"低",hard:"中",extreme:"高"};

 function clampRank(value){
  const max=Math.max(1,Array.isArray(WORLD_REGIONS)&&WORLD_REGIONS.length?WORLD_REGIONS.length:1);
  return Math.max(1,Math.min(max,Math.floor(Number(value)||1)));
 }
 function arenaProgress(){
  if(typeof getArenaProgressState==="function")return getArenaProgressState();
  const d=typeof ensureDungeonState==="function"?ensureDungeonState():state?.dungeon;
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
 function positionTemplateId(rank){return POSITION_TEMPLATE_IDS[positionIndexForRank(rank)]||"normal";}
 function positionLabel(rank){return POSITION_LABELS[positionTemplateId(rank)]||"低";}

 function combatSpecSnapshot(){
  const out={};
  COMBAT_SPEC_KEYS.forEach(key=>{out[key]=typeof specializationLevel==="function"?Math.max(0,Math.floor(Number(specializationLevel(key))||0)):0;});
  return out;
 }
 function combatMarkSnapshot(){
  const live=typeof window.markLevelsSnapshot==="function"?window.markLevelsSnapshot(false):{};
  return Object.fromEntries(ASSESS_MARK_KEYS.map(key=>[key,typeof window.markClampLevel==="function"?window.markClampLevel(live?.[key]):Math.max(0,Math.min(10,Math.floor(Number(live?.[key])||0)))]));
 }
 function assessmentCompatibilityVersions(){
  const formal=typeof window.getArenaVersionProfile==="function"?window.getArenaVersionProfile():{};
  return {
   positionModelVersion:Math.max(0,Math.floor(Number(formal.positionModelVersion)||0)),
   assessmentRuleVersion:Math.max(0,Math.floor(Number(formal.assessmentRuleVersion)||0)),
   balanceVersion:Math.max(0,Math.floor(Number(formal.balanceVersion)||0))
  };
 }
 function assessmentLevel(){
  if(state?.secondWorld?.entered===true)return Math.max(500,Math.min(1000,Math.floor(Number(state?.level)||500)));
  return typeof clampGameLevel==="function"?clampGameLevel(state?.level):Math.max(1,Math.floor(Number(state?.level)||1));
 }
 function assessmentSignature(rank,positionId){
  const base=createSpecialPlayerSnapshot(equippedStats());
  const vip=Math.max(0,Math.floor(Number(state?.vipLevel)||0));
  const versions=assessmentCompatibilityVersions();
  return JSON.stringify({
   positionModelVersion:versions.positionModelVersion,
   assessmentRuleVersion:versions.assessmentRuleVersion,
   balanceVersion:versions.balanceVersion,
   markRuleVersion:Math.max(0,Math.floor(Number(window.MARK_COMBAT_RULE_VERSION)||0)),
   rank:clampRank(rank),
   positionDifficulty:positionId,
   level:assessmentLevel(),
   base:{hp:base.hp,atk:base.atk,def:base.def,crit:base.crit,dodge:base.dodge},
   vip,
   spec:combatSpecSnapshot(),
   marks:combatMarkSnapshot()
  });
 }
 function assessmentArena(){
  const d=typeof ensureDungeonState==="function"?ensureDungeonState():state?.dungeon;
  return d?.arena||null;
 }
 function syncPromotionReady(arena,currentSignature=null){
  if(!arena||typeof arena!=="object")return false;
  const runs=Math.max(0,Math.min(ASSESS_RUNS,Math.floor(Number(arena.lastCheckRuns)||0)));
  const clears=Math.max(0,Math.min(runs,Math.floor(Number(arena.lastCheckClearCount)||0)));
  const hasResult=runs===ASSESS_RUNS&&typeof arena.lastCheckSignature==="string"&&!!arena.lastCheckSignature;
  const signatureCurrent=currentSignature==null?true:arena.lastCheckSignature===currentSignature;
  const ready=hasResult&&signatureCurrent&&clears>=ASSESS_CLEAR_TARGET;
  const changed=arena.promotionReady!==ready;
  arena.promotionReady=ready;
  if(changed&&typeof save==="function")save(false);
  return ready;
 }
 function currentAssessmentRank(){return clampRank(arenaProgress().assessmentRank||arenaProgress().highestArenaUnlocked||1);}
 function simulateFullRun(rank,positionId,baseStats,playerStats,markLevels){
  let hp=playerStats.hp;
  for(let stage=0;stage<3;stage++){
   const enemy=window.buildArenaEnemyForTest(positionId,stage,baseStats,state.level,rank);
   if(!enemy)return false;
   const result=window.runCombatCore(playerStats,enemy,hp,{logs:false,markLevels});
   hp=result.hp;
   if(!result.win)return false;
  }
  return true;
 }
 function assessmentStatus(){
  const arena=assessmentArena();
  const rank=currentAssessmentRank();
  const positionId=positionTemplateId(rank);
  const signature=assessmentSignature(rank,positionId);
  const runs=Math.max(0,Math.min(ASSESS_RUNS,Math.floor(Number(arena?.lastCheckRuns)||0)));
  const clears=Math.max(0,Math.min(runs,Math.floor(Number(arena?.lastCheckClearCount)||0)));
  const hasResult=runs===ASSESS_RUNS&&typeof arena?.lastCheckSignature==="string"&&!!arena.lastCheckSignature;
  const maxRank=Math.max(1,Array.isArray(WORLD_REGIONS)&&WORLD_REGIONS.length?WORLD_REGIONS.length:1);
  const unlockedCap=typeof getArenaUnlockedRankCap==="function"?clampRank(getArenaUnlockedRankCap()):rank;
  const promotionReady=syncPromotionReady(arena,signature);
  return {
   rank,
   rankName:typeof getArenaRankName==="function"?getArenaRankName(rank):`第${rank}階`,
   positionTemplateId:positionId,
   positionDifficultyId:positionId,
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
  const positionId=positionTemplateId(rank);
  const base=createSpecialPlayerSnapshot(equippedStats());
  const player=createSpecialPlayerSnapshot(playerCombatStats(base,state.vipLevel));
  const signature=assessmentSignature(rank,positionId);
  const marks=combatMarkSnapshot();
  syncPromotionReady(arena,signature);
  if(arena.promotionReady===true)return {early:{...assessmentStatus(),reason:"already-ready"}};
  return {rank,positionId,base,player,marks,signature};
 }
 function finishAssessment(ctx,clears){
  const arena=assessmentArena();
  if(!arena)return {...assessmentStatus(),reason:"unavailable"};
  const versions=assessmentCompatibilityVersions();
  arena.positionModelVersion=versions.positionModelVersion;
  arena.assessmentRuleVersion=versions.assessmentRuleVersion;
  arena.balanceVersion=versions.balanceVersion;
  arena.lastCheckRuns=ASSESS_RUNS;
  arena.lastCheckClearCount=Math.max(0,Math.min(ASSESS_RUNS,Math.floor(Number(clears)||0)));
  arena.lastCheckSignature=ctx.signature;
  arena.promotionReady=arena.lastCheckClearCount>=ASSESS_CLEAR_TARGET;
  save(false);
  if(typeof render==="function")render();
  return {...assessmentStatus(),reason:arena.promotionReady?"qualified":"not-qualified"};
 }

 window.SECOND_WORLD_ARENA_ASSESSMENT_LEVEL_VERSION=1;
 window.ARENA_ASSESSMENT_RUNTIME_VERSION=Math.max(0,Math.floor(Number(window.getArenaVersionProfile?.().assessmentRuntimeVersion)||0));
 window.getArenaAssessmentSignature=function(rank=null){const r=clampRank(rank==null?currentAssessmentRank():rank);return assessmentSignature(r,positionTemplateId(r));};
 window.getArenaAssessmentStatus=assessmentStatus;
 window.assessArenaPromotion=function(){
  const ctx=assessmentContext();
  if(ctx.early)return ctx.early;
  let clears=0;
  for(let i=0;i<ASSESS_RUNS;i++)if(simulateFullRun(ctx.rank,ctx.positionId,ctx.base,ctx.player,ctx.marks))clears++;
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
     for(;completed<end;completed++)if(simulateFullRun(ctx.rank,ctx.positionId,ctx.base,ctx.player,ctx.marks))clears++;
     if(typeof onProgress==="function")onProgress({completed,total:ASSESS_RUNS,clears});
     if(completed<ASSESS_RUNS){setTimeout(step,0);return;}
     resolve(finishAssessment(ctx,clears));
    }catch(err){reject(err);}
   }
   setTimeout(step,0);
  });
 };

 window.getArenaPositionTemplateId=positionTemplateId;
 window.getArenaPositionLabel=positionLabel;
 window.getArenaPositionIndex=positionIndexForRank;
})();