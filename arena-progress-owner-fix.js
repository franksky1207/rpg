(function(){
 function currentWorld(){return typeof window.arenaWorldForState==="function"?window.arenaWorldForState(state):(state?.secondWorld?.entered===true?2:1);}
 window.getArenaRuntimeProgress=function(){
  const world=Number(currentWorld())===2?2:1;
  if(typeof window.getArenaProgressForWorld==="function")return window.getArenaProgressForWorld(world,state);
  return state?.dungeon?.arena||null;
 };
 window.ARENA_RUNTIME_PROGRESS_OWNER_VERSION=1;
})();
