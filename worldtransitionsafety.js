(function(){
 const VERSION=1;
 function currentPhase(){return typeof window.currentWorldPhase==="function"?window.currentWorldPhase():state?.thirdWorld?.entered===true?3:state?.secondWorld?.entered===true?2:1;}
 function activeView(){try{return String(view||"");}catch(e){return "";}}
 function bountyAllowed(){return currentPhase()!==3;}
 function subsystemRuntimeStatus(){
  const reasons=[],v=activeView();
  try{const bounty=typeof window.getBountyTestSnapshot==="function"?window.getBountyTestSnapshot():null;if(v==="dungeon-bounty"||bounty?.phase==="ready"||bounty?.phase==="transition"||bounty?.phase==="combat"||bounty?.continuous===true)reasons.push("bounty-active");}catch(e){reasons.push("bounty-check-error");}
  try{const arena=typeof window.getArenaCoreState==="function"?window.getArenaCoreState():null;if(v==="dungeon-arena"||arena?.phase==="ready"||arena?.phase==="combat"||arena?.continuous===true)reasons.push("arena-active");}catch(e){reasons.push("arena-check-error");}
  try{const mirror=typeof window.mirrorDungeonStatus==="function"?window.mirrorDungeonStatus():null;if(mirror?.status==="running")reasons.push("mirror-active");}catch(e){reasons.push("mirror-check-error");}
  try{const voidRun=typeof window.getVoidMirageRunSnapshot==="function"?window.getVoidMirageRunSnapshot():null;if(voidRun?.active===true)reasons.push("void-active");}catch(e){reasons.push("void-check-error");}
  try{const calamity=typeof window.getSecondWorldCalamityRunSnapshot==="function"?window.getSecondWorldCalamityRunSnapshot():null;if(calamity?.active===true)reasons.push("second-world-calamity-active");}catch(e){reasons.push("second-world-calamity-check-error");}
  if(window.activeSpecialEncounter)reasons.push("special-encounter-active");
  return {blocked:reasons.length>0,reasons};
 }
 const baseEnterBountyDungeon=typeof window.enterBountyDungeon==="function"?window.enterBountyDungeon:null;
 if(baseEnterBountyDungeon){
  window.enterBountyDungeon=function(...args){
   if(!bountyAllowed()){
    if(typeof alert==="function")alert("高維紀元已關閉懸賞戰。競技場、鏡像戰與虛空仍可使用。");
    return false;
   }
   return baseEnterBountyDungeon.apply(this,args);
  };
 }
 window.WORLD_TRANSITION_SUBSYSTEM_SAFETY_VERSION=VERSION;
 window.BOUNTY_WORLD_PHASE_GATE_VERSION=1;
 window.worldPhaseBountyAvailable=bountyAllowed;
 window.worldTransitionSubsystemRuntimeStatus=subsystemRuntimeStatus;
 if(typeof window.registerWorldTransitionRuntimeBlocker==="function")window.registerWorldTransitionRuntimeBlocker("subsystems",subsystemRuntimeStatus);
})();