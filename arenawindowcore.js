(function(){
 function maxArenaRank(){return Math.max(1,Array.isArray(WORLD_REGIONS)&&WORLD_REGIONS.length?WORLD_REGIONS.length:1);}
 function maxWindowStart(){return Math.max(1,maxArenaRank()-2);}
 function clampRank(value){return Math.max(1,Math.min(maxArenaRank(),Math.floor(Number(value)||1)));}
 function clampWindowStart(value){return Math.max(1,Math.min(maxWindowStart(),Math.floor(Number(value)||1)));}
 function arenaVenueName(rank){
  const r=clampRank(rank),region=Array.isArray(WORLD_REGIONS)?WORLD_REGIONS[r-1]:null;
  return `${region?.name||`第${r}區`}競技場`;
 }
 function arenaState(){
  const dungeon=typeof ensureDungeonProgressState==="function"?ensureDungeonProgressState():state?.dungeon;
  if(!dungeon||typeof dungeon!=="object")return null;
  if(!dungeon.arena||typeof dungeon.arena!=="object")dungeon.arena={windowStart:1,activeRank:null,rank:Math.min(3,maxArenaRank()),promotionReady:false,lastCheckSignature:null,lastCheckRuns:0,lastCheckClearCount:0};
  return dungeon.arena;
 }
 function unlockedCap(){
  if(typeof unlockedArenaRankCapForState==="function")return clampRank(unlockedArenaRankCapForState(state));
  return Math.min(3,maxArenaRank());
 }
 function windowState(){
  const arena=arenaState();
  const start=clampWindowStart(arena?.windowStart||1),end=clampRank(Math.min(maxArenaRank(),start+2));
  const visible=[];for(let rank=start;rank<=end;rank++)visible.push(rank);
  const nextRank=end<maxArenaRank()?end+1:null;
  const cap=unlockedCap();
  const combatReady=arena?.promotionReady===true;
  const regionReady=nextRank==null?true:nextRank<=cap;
  return {
   windowStart:start,
   windowEnd:end,
   assessmentRank:end,
   assessmentName:arenaVenueName(end),
   visibleRanks:visible,
   visibleArenas:visible.map(rank=>({rank,name:arenaVenueName(rank)})),
   nextRank,
   nextName:nextRank==null?null:arenaVenueName(nextRank),
   unlockedCap:cap,
   combatReady,
   regionReady,
   canPromote:nextRank!=null&&combatReady&&regionReady,
   atFinalWindow:nextRank==null,
   maxRank:maxArenaRank()
  };
 }
 function withAssessmentRank(fn){
  const arena=arenaState();if(!arena||typeof fn!=="function")return null;
  const w=windowState(),previousActive=arena.activeRank,previousRank=arena.rank;
  arena.activeRank=null;arena.rank=w.assessmentRank;
  try{return fn();}
  finally{arena.activeRank=previousActive;arena.rank=previousActive||w.assessmentRank;if(previousRank&&previousActive==null)arena.rank=w.assessmentRank;}
 }
 function selectVisibleRank(rank){
  const arena=arenaState(),w=windowState(),r=clampRank(rank);
  if(!arena||!w.visibleRanks.includes(r))return false;
  arena.activeRank=r;arena.rank=r;
  return true;
 }
 function clearActiveRank(){
  const arena=arenaState();if(!arena)return;
  const w=windowState();arena.activeRank=null;arena.rank=w.assessmentRank;
 }

 const baseAssessment=typeof window.getArenaAssessmentStatus==="function"?window.getArenaAssessmentStatus:null;
 const baseAssessPromotion=typeof window.assessArenaPromotion==="function"?window.assessArenaPromotion:null;
 const baseOpenArena=typeof window.openArenaDungeon==="function"?window.openArenaDungeon:null;
 window.getArenaAssessmentStatus=function(){
  const base=baseAssessment?withAssessmentRank(()=>baseAssessment()):{};
  const w=windowState();
  return {...base,...w,rank:w.assessmentRank,rankName:typeof getArenaRankName==="function"?getArenaRankName(w.assessmentRank):base.rankName,canPromote:w.canPromote};
 };
 window.assessArenaPromotion=function(){
  if(!baseAssessPromotion)return {...window.getArenaAssessmentStatus(),reason:"unavailable"};
  return withAssessmentRank(()=>baseAssessPromotion());
 };
 window.promoteArenaRank=function(){
  const arena=arenaState(),w=windowState();
  if(!arena||w.atFinalWindow)return {ok:false,reason:"max-window",...window.getArenaAssessmentStatus()};
  if(!w.combatReady)return {ok:false,reason:"combat-not-qualified",...window.getArenaAssessmentStatus()};
  if(!w.regionReady)return {ok:false,reason:"region-locked",...window.getArenaAssessmentStatus()};
  arena.windowStart=clampWindowStart(w.windowStart+1);
  arena.activeRank=null;
  arena.rank=clampRank(arena.windowStart+2);
  arena.promotionReady=false;
  arena.lastCheckSignature=null;
  arena.lastCheckRuns=0;
  arena.lastCheckClearCount=0;
  save(false);
  if(view==="dungeon-arena"&&typeof openArenaDungeon==="function")openArenaDungeon();
  else if(typeof render==="function")render();
  return {ok:true,...window.getArenaAssessmentStatus()};
 };
 window.openArenaDungeon=function(){clearActiveRank();return baseOpenArena?baseOpenArena():undefined;};

 window.getArenaWindowState=windowState;
 window.getArenaVisibleRanks=function(){return windowState().visibleRanks.slice();};
 window.getArenaAssessmentRank=function(){return windowState().assessmentRank;};
 window.getArenaVenueName=arenaVenueName;
 window.isArenaRankVisible=function(rank){return windowState().visibleRanks.includes(clampRank(rank));};
 window.selectArenaVenueRank=selectVisibleRank;
 window.clearArenaVenueSelection=clearActiveRank;
})();