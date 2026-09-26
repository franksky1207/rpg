(function(){
 const VERSION=1;
 function run(){
  const errors=[],fail=(code,data=null)=>errors.push({code,data});
  try{
   if(Number(window.WORLD_TRANSITION_SUBSYSTEM_SAFETY_VERSION)!==3)fail("WORLD_TRANSITION_SUBSYSTEM_SAFETY_VERSION",window.WORLD_TRANSITION_SUBSYSTEM_SAFETY_VERSION);
   if(Number(window.DUNGEON_MODE_AVAILABILITY_POLICY_VERSION)!==1)fail("DUNGEON_MODE_AVAILABILITY_POLICY_VERSION",window.DUNGEON_MODE_AVAILABILITY_POLICY_VERSION);
   if(Number(window.THIRD_WORLD_ARENA_PROVISIONAL_GATE_VERSION)!==1)fail("THIRD_WORLD_ARENA_PROVISIONAL_GATE_VERSION",window.THIRD_WORLD_ARENA_PROVISIONAL_GATE_VERSION);
   if(Number(window.OFFLINE_WORLD_PHASE_POLICY_VERSION)!==2)fail("OFFLINE_WORLD_PHASE_POLICY_VERSION",window.OFFLINE_WORLD_PHASE_POLICY_VERSION);
   if(Number(window.OFFLINE_WORLD3_LEGACY_SETTLEMENT_GATE_VERSION)!==1)fail("OFFLINE_WORLD3_LEGACY_SETTLEMENT_GATE_VERSION",window.OFFLINE_WORLD3_LEGACY_SETTLEMENT_GATE_VERSION);
   if(Number(window.WORLD_PHASE_STALE_WELCOME_CLEANUP_VERSION)!==1)fail("WORLD_PHASE_STALE_WELCOME_CLEANUP_VERSION",window.WORLD_PHASE_STALE_WELCOME_CLEANUP_VERSION);
   const world2={secondWorld:{entered:true},thirdWorld:{entered:false}},world3={secondWorld:{entered:true},thirdWorld:{entered:true}};
   const bounty2=window.dungeonModeAvailability?.("bounty",world2),arena2=window.dungeonModeAvailability?.("arena",world2),bounty3=window.dungeonModeAvailability?.("bounty",world3),arena3=window.dungeonModeAvailability?.("arena",world3),void3=window.dungeonModeAvailability?.("tower",world3);
   if(bounty2?.visible!==true||bounty2?.enabled!==true||arena2?.visible!==true||arena2?.enabled!==true)fail("WORLD2_DUNGEON_REGRESSION",{bounty2,arena2});
   if(bounty3?.visible!==false||bounty3?.enabled!==false)fail("WORLD3_BOUNTY_POLICY",bounty3||null);
   if(arena3?.visible!==true||arena3?.enabled!==false||!String(arena3?.buttonLabel||"").includes("等待"))fail("WORLD3_ARENA_POLICY",arena3||null);
   if(void3?.visible!==true||void3?.enabled!==true)fail("WORLD3_VOID_POLICY",void3||null);
   if(window.currentOfflineWorldPhase?.(world2)!==2||window.currentOfflineWorldPhase?.(world3)!==3)fail("OFFLINE_CURRENT_WORLD_PHASE",{world2:window.currentOfflineWorldPhase?.(world2),world3:window.currentOfflineWorldPhase?.(world3)});
  }catch(error){fail("EXCEPTION",String(error?.message||error));}
  return {version:VERSION,passed:errors.length===0,errors,checkedAt:Date.now()};
 }
 window.THIRD_WORLD_ENTRY_OPTIMIZATION_INTEGRITY_VERSION=VERSION;
 window.THIRD_WORLD_ENTRY_OPTIMIZATION_INTEGRITY_REPORT=run();
})();