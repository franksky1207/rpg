(function(){
 function arenaWorld(){
  if(typeof window.arenaWorldForState==="function")return Number(window.arenaWorldForState(state))===2?2:1;
  if(typeof window.isSecondWorldEntered==="function"&&window.isSecondWorldEntered(state)===true)return 2;
  return state?.secondWorld?.entered===true?2:1;
 }
 function maxArenaRank(world=arenaWorld()){return typeof window.getArenaMaxRankForWorld==="function"?Math.max(1,Math.floor(Number(window.getArenaMaxRankForWorld(world))||1)):Math.max(1,Array.isArray(WORLD_REGIONS)&&WORLD_REGIONS.length?WORLD_REGIONS.length:1);}
 function clampRank(value,world=arenaWorld()){return Math.max(1,Math.min(maxArenaRank(world),Math.floor(Number(value)||1)));}
 function arenaVenueName(rank,world=arenaWorld()){
  const w=Number(world)===2?2:1,r=clampRank(rank,w);
  const region=w===2&&typeof window.getSecondWorldRegion==="function"?window.getSecondWorldRegion(r-1):(Array.isArray(WORLD_REGIONS)?WORLD_REGIONS[r-1]:null);
  return `${region?.name||`第${r}區`}競技場`;
 }
 function arenaState(world=arenaWorld()){
  const w=Number(world)===2?2:1;
  if(typeof window.getArenaProgressForWorld==="function")return window.getArenaProgressForWorld(w,state);
  const dungeon=typeof ensureDungeonState==="function"?ensureDungeonState():state?.dungeon;
  if(!dungeon||typeof dungeon!=="object")return null;
  if(!dungeon.arena||typeof dungeon.arena!=="object")dungeon.arena={highestArenaUnlocked:1,activeRank:null,rank:1,promotionReady:false,lastCheckSignature:null,lastCheckRuns:0,lastCheckClearCount:0};
  return dungeon.arena;
 }
 function regionUnlockedCap(world=arenaWorld()){
  const w=Number(world)===2?2:1;
  if(typeof window.getArenaRankCapForWorld==="function")return clampRank(window.getArenaRankCapForWorld(w,state),w);
  if(w===1&&typeof unlockedArenaRankCapForState==="function")return clampRank(unlockedArenaRankCapForState(state),w);
  return 1;
 }
 function progressState(world=arenaWorld()){
  const w=Number(world)===2?2:1,arena=arenaState(w),max=maxArenaRank(w);
  const highest=clampRank(arena?.highestArenaUnlocked||1,w);
  const start=Math.max(1,highest-2),visible=[];
  for(let rank=start;rank<=highest;rank++)visible.push(rank);
  const nextRank=highest<max?highest+1:null;
  const cap=regionUnlockedCap(w);
  const combatReady=arena?.promotionReady===true;
  const regionReady=nextRank==null?true:nextRank<=cap;
  return {
   world:w,
   highestArenaUnlocked:highest,
   windowStart:start,
   windowEnd:highest,
   assessmentRank:highest,
   assessmentName:arenaVenueName(highest,w),
   visibleRanks:visible,
   visibleArenas:visible.map(rank=>({rank,name:arenaVenueName(rank,w)})),
   nextRank,
   nextName:nextRank==null?null:arenaVenueName(nextRank,w),
   unlockedCap:cap,
   combatReady,
   regionReady,
   canPromote:nextRank!=null&&combatReady&&regionReady,
   canUnlockNext:nextRank!=null&&combatReady&&regionReady,
   atFinalWindow:nextRank==null,
   maxRank:max
  };
 }
 function selectVisibleRank(rank){
  const world=arenaWorld(),arena=arenaState(world),p=progressState(world),r=clampRank(rank,world);
  if(!arena||!p.visibleRanks.includes(r))return false;
  arena.activeRank=r;arena.rank=r;
  return true;
 }
 function clearActiveRank(){
  const world=arenaWorld(),arena=arenaState(world);if(!arena)return;
  const p=progressState(world);arena.activeRank=null;arena.rank=p.assessmentRank;
 }
 window.promoteArenaRank=function(){
  const world=arenaWorld(),arena=arenaState(world),p=progressState(world);
  const assessment=typeof window.getArenaAssessmentStatus==="function"?window.getArenaAssessmentStatus():null;
  if(!arena||p.atFinalWindow)return {ok:false,reason:"max-arena",...(assessment||{})};
  if(!p.combatReady)return {ok:false,reason:"combat-not-qualified",...(assessment||{})};
  if(!p.regionReady)return {ok:false,reason:"region-locked",...(assessment||{})};
  arena.highestArenaUnlocked=clampRank(p.highestArenaUnlocked+1,world);
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
 window.SECOND_WORLD_ARENA_PROGRESS_RULES_VERSION=2;
 window.ARENA_VENUE_WORLD_NAME_VERSION=2;
 window.ARENA_WINDOW_WORLD_OWNER_VERSION=1;
 window.getArenaWindowState=progressState;
 window.getArenaProgressState=progressState;
 window.getArenaVisibleRanks=function(){return progressState().visibleRanks.slice();};
 window.getArenaAssessmentRank=function(){return progressState().assessmentRank;};
 window.getArenaHighestUnlocked=function(){return progressState().highestArenaUnlocked;};
 window.getArenaVenueName=arenaVenueName;
 window.isArenaRankVisible=function(rank){const p=progressState();return p.visibleRanks.includes(clampRank(rank,p.world));};
 window.selectArenaVenueRank=selectVisibleRank;
 window.clearArenaVenueSelection=clearActiveRank;
})();
