(function(){
 function maxArenaRank(){return Math.max(1,Array.isArray(WORLD_REGIONS)&&WORLD_REGIONS.length?WORLD_REGIONS.length:1);}
 function clampRank(value){return Math.max(1,Math.min(maxArenaRank(),Math.floor(Number(value)||1)));}
 function arenaVenueName(rank){
  const r=clampRank(rank),region=Array.isArray(WORLD_REGIONS)?WORLD_REGIONS[r-1]:null;
  return `${region?.name||`第${r}區`}競技場`;
 }
 function arenaState(){
  const dungeon=typeof ensureDungeonProgressState==="function"?ensureDungeonProgressState():state?.dungeon;
  if(!dungeon||typeof dungeon!=="object")return null;
  if(!dungeon.arena||typeof dungeon.arena!=="object")dungeon.arena={highestArenaUnlocked:1,activeRank:null,rank:1,promotionReady:false,lastCheckSignature:null,lastCheckRuns:0,lastCheckClearCount:0};
  return dungeon.arena;
 }
 function regionUnlockedCap(){
  if(typeof unlockedArenaRankCapForState==="function")return clampRank(unlockedArenaRankCapForState(state));
  return 1;
 }
 function progressState(){
  const arena=arenaState();
  const highest=clampRank(arena?.highestArenaUnlocked||1);
  const start=Math.max(1,highest-2),visible=[];
  for(let rank=start;rank<=highest;rank++)visible.push(rank);
  const nextRank=highest<maxArenaRank()?highest+1:null;
  const cap=regionUnlockedCap();
  const combatReady=arena?.promotionReady===true;
  const regionReady=nextRank==null?true:nextRank<=cap;
  return {
   highestArenaUnlocked:highest,
   windowStart:start,
   windowEnd:highest,
   assessmentRank:highest,
   assessmentName:arenaVenueName(highest),
   visibleRanks:visible,
   visibleArenas:visible.map(rank=>({rank,name:arenaVenueName(rank)})),
   nextRank,
   nextName:nextRank==null?null:arenaVenueName(nextRank),
   unlockedCap:cap,
   combatReady,
   regionReady,
   canPromote:nextRank!=null&&combatReady&&regionReady,
   canUnlockNext:nextRank!=null&&combatReady&&regionReady,
   atFinalWindow:nextRank==null,
   maxRank:maxArenaRank()
  };
 }
 function selectVisibleRank(rank){
  const arena=arenaState(),p=progressState(),r=clampRank(rank);
  if(!arena||!p.visibleRanks.includes(r))return false;
  arena.activeRank=r;arena.rank=r;
  return true;
 }
 function clearActiveRank(){
  const arena=arenaState();if(!arena)return;
  const p=progressState();arena.activeRank=null;arena.rank=p.assessmentRank;
 }

 window.promoteArenaRank=function(){
  const arena=arenaState(),p=progressState();
  const assessment=typeof window.getArenaAssessmentStatus==="function"?window.getArenaAssessmentStatus():null;
  if(!arena||p.atFinalWindow)return {ok:false,reason:"max-arena",...(assessment||{})};
  if(!p.combatReady)return {ok:false,reason:"combat-not-qualified",...(assessment||{})};
  if(!p.regionReady)return {ok:false,reason:"region-locked",...(assessment||{})};
  arena.highestArenaUnlocked=clampRank(p.highestArenaUnlocked+1);
  arena.activeRank=null;
  arena.rank=arena.highestArenaUnlocked;
  arena.promotionReady=false;
  arena.lastCheckSignature=null;
  arena.lastCheckRuns=0;
  arena.lastCheckClearCount=0;
  save(false);
  if(view==="dungeon-arena"&&typeof openArenaDungeon==="function")openArenaDungeon();
  else if(typeof render==="function")render();
  const nextAssessment=typeof window.getArenaAssessmentStatus==="function"?window.getArenaAssessmentStatus():null;
  return {ok:true,...(nextAssessment||{})};
 };

 window.getArenaWindowState=progressState;
 window.getArenaProgressState=progressState;
 window.getArenaVisibleRanks=function(){return progressState().visibleRanks.slice();};
 window.getArenaAssessmentRank=function(){return progressState().assessmentRank;};
 window.getArenaHighestUnlocked=function(){return progressState().highestArenaUnlocked;};
 window.getArenaVenueName=arenaVenueName;
 window.isArenaRankVisible=function(rank){return progressState().visibleRanks.includes(clampRank(rank));};
 window.selectArenaVenueRank=selectVisibleRank;
 window.clearArenaVenueSelection=clearActiveRank;
})();