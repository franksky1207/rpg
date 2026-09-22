(function(){
 const CALAMITY_RUN_VERSION=1;
 const CALAMITY_CONTINUOUS_RULE_VERSION=4;
 let activeRun=null;

 function clone(value){
  try{return value==null?value:JSON.parse(JSON.stringify(value));}
  catch(error){return null;}
 }
 function validMode(mode){return mode==="single"?"single":"continuous";}
 function backgroundEnabled(){return typeof window.gmBackgroundBattleEnabled==="function"&&window.gmBackgroundBattleEnabled()===true;}
 function startBackground(){if(!backgroundEnabled()||typeof window.backgroundProgressStart!=="function")return false;window.backgroundProgressStart("calamity",{mode:"continuous"});return true;}
 function stopBackground(){if(typeof window.backgroundProgressStop==="function")window.backgroundProgressStop("calamity");}
 function fastCatchUp(){return typeof window.backgroundProgressFastCatchUpActive==="function"&&window.backgroundProgressFastCatchUpActive("calamity")===true;}
 function catchUpPreviewPolicy(){
  if(!fastCatchUp()||typeof window.backgroundProgressCatchUpPolicy!=="function")return null;
  const snapshot=typeof window.backgroundProgressSnapshot==="function"?window.backgroundProgressSnapshot():null;
  const next=Math.max(0,Math.floor(Number(snapshot?.catchUpPolicyCount)||0))+1;
  return window.backgroundProgressCatchUpPolicy("calamity",next,false);
 }
 function definition(id){return typeof window.getCivilizationCalamityDefinition==="function"?window.getCivilizationCalamityDefinition(id):null;}
 function playerMaxHp(){return typeof playerCombatStats==="function"?Math.max(1,Math.floor(Number(playerCombatStats().hp)||1)):Math.max(1,Math.floor(Number(state?.hp)||1));}
 function runStatus(){
  if(!activeRun)return null;
  const calamity=typeof window.getCivilizationCalamityStatus==="function"?window.getCivilizationCalamityStatus(activeRun.calamityId):null;
  const maxPlayer=playerMaxHp();
  return {
   active:activeRun.active===true,
   mode:activeRun.mode,
   phase:activeRun.phase,
   calamityId:activeRun.calamityId,
   calamityName:activeRun.calamityName,
   battleCount:activeRun.battleCount,
   wins:activeRun.wins,
   losses:activeRun.losses,
   kills:activeRun.kills,
   totalTurns:activeRun.totalTurns,
   averageTurns:activeRun.battleCount>0?Math.round(activeRun.totalTurns/activeRun.battleCount*10)/10:0,
   stopRequested:activeRun.stopRequested===true,
   endedReason:activeRun.endedReason||"",
   startedAt:activeRun.startedAt,
   endedAt:activeRun.endedAt||null,
   currentHp:calamity?.currentHp??0,
   maxHp:calamity?.maxHp??0,
   playerHp:Math.max(0,Math.min(maxPlayer,Math.floor(Number(state?.hp)||maxPlayer))),
   playerMaxHp:maxPlayer,
   mark:clone(calamity?.mark)||null,
   lastBattle:clone(activeRun.lastBattle)
  };
 }
 function finish(reason){
  if(!activeRun)return null;
  if(typeof save==="function")save(false);
  stopBackground();
  activeRun.active=false;
  activeRun.phase="ended";
  activeRun.endedReason=String(reason||"ended");
  activeRun.endedAt=Date.now();
  return runStatus();
 }
 function begin(id,mode="continuous"){
  const def=definition(id);
  if(!def)return {ok:false,reason:"unknown-calamity",run:runStatus()};
  if(typeof window.isCivilizationCalamityUnlocked!=="function"||!window.isCivilizationCalamityUnlocked(def.id))return {ok:false,reason:"locked",calamityId:def.id,run:runStatus()};
  if(activeRun?.active)return {ok:false,reason:"already-active",run:runStatus()};
  activeRun={
   active:true,
   mode:validMode(mode),
   phase:"ready",
   calamityId:def.id,
   calamityName:def.name,
   battleCount:0,
   wins:0,
   losses:0,
   kills:0,
   totalTurns:0,
   stopRequested:false,
   endedReason:"",
   startedAt:Date.now(),
   endedAt:null,
   lastBattle:null
  };
  return {ok:true,run:runStatus()};
 }
 function compactBattle(result,battleNumber){
  return {
   battleNumber,
   win:result?.win===true,
   calamityId:String(result?.calamityId||activeRun?.calamityId||""),
   enemyStartHp:Math.max(0,Math.floor(Number(result?.enemyStartHp)||0)),
   enemyEndHp:Math.max(0,Math.floor(Number(result?.enemyEndHp)||0)),
   maxHp:Math.max(0,Math.floor(Number(result?.enemy?.hp)||0)),
   playerStartHp:Math.max(0,Math.floor(Number(result?.playerStartHp)||0)),
   playerEndHp:Math.max(0,Math.floor(Number(result?.playerEndHp)||0)),
   playerRestoredHp:Math.max(0,Math.floor(Number(result?.playerRestoredHp)||0)),
   turns:Math.max(0,Math.floor(Number(result?.turns)||0)),
   markSettlement:clone(result?.settlement?.markSettlement)||null
  };
 }
 function fightNext(options={}){
  if(!activeRun?.active)return {ok:false,reason:"no-active-run",run:runStatus()};
  if(activeRun.stopRequested&&activeRun.phase!=="fighting")return {ok:true,ended:true,reason:"stopped",run:finish("stopped")};
  activeRun.phase="fighting";
  const battleNumber=activeRun.battleCount+1;
  let result;
  try{
   result=window.runCivilizationCalamityBattle(activeRun.calamityId,{
    logs:options.logs===false?false:true,
    rng:typeof options.rng==="function"?options.rng:undefined,
    markLevels:options.markLevels&&typeof options.markLevels==="object"?options.markLevels:undefined,
    save:options.save!==false
   });
  }catch(error){
   activeRun.phase="between";
   const run=finish("error");
   return {ok:false,reason:"battle-error",error:String(error?.message||error),run};
  }
  if(!result?.ok){
   activeRun.phase="between";
   const reason=String(result?.reason||"battle-failed");
   const run=finish(reason);
   return {ok:false,reason,result,run};
  }
  activeRun.battleCount++;
  activeRun.totalTurns+=Math.max(0,Math.floor(Number(result.turns)||0));
  if(result.win){activeRun.wins++;activeRun.kills++;}
  else activeRun.losses++;
  activeRun.lastBattle=compactBattle(result,battleNumber);
  activeRun.phase="between";

  if(activeRun.mode==="single"){
   const run=finish("single-complete");
   return {ok:true,ended:true,reason:"single-complete",battleNumber,result,run};
  }
  if(result?.settlement?.titleSettlement?.firstAcquisition===true){
   if(options.save===false&&typeof save==="function")save(false);
   const run=finish("title-first-kill");
   return {ok:true,ended:true,reason:"title-first-kill",battleNumber,result,run};
  }
  if(activeRun.stopRequested){
   const run=finish("stopped");
   return {ok:true,ended:true,reason:"stopped",battleNumber,result,run};
  }
  return {ok:true,ended:false,battleNumber,result,run:runStatus()};
 }
 function requestStop(){
  if(!activeRun?.active)return {ok:false,reason:"no-active-run",run:runStatus()};
  if(activeRun.mode!=="continuous")return {ok:false,reason:"not-continuous",run:runStatus()};
  activeRun.stopRequested=true;
  if(activeRun.phase!=="fighting")return {ok:true,ended:true,run:finish("stopped")};
  return {ok:true,ended:false,run:runStatus()};
 }
 const yieldControl=()=>new Promise(resolve=>setTimeout(resolve,0));

 async function runContinuous(id,options={}){
  const requestedId=String(id||"");
  if(!activeRun?.active){
   const started=begin(requestedId,"continuous");
   if(!started.ok)return started;
  }
  if(activeRun.mode!=="continuous")return {ok:false,reason:"not-continuous",run:runStatus()};
  if(requestedId&&requestedId!==activeRun.calamityId)return {ok:false,reason:"different-calamity-active",run:runStatus()};

  const onBattle=typeof options.onBattleComplete==="function"?options.onBattleComplete:null;
  const onEnd=typeof options.onEnd==="function"?options.onEnd:null;
  startBackground();
  while(activeRun?.active){
   if(activeRun.stopRequested&&activeRun.phase!=="fighting"){
    const ended=finish("stopped");
    if(onEnd)await onEnd(ended);
    return {ok:true,ended:true,reason:"stopped",run:ended};
   }
   const previewPolicy=catchUpPreviewPolicy();
   const fast=!!previewPolicy?.active;
   const battle=fightNext({...options,save:fast?previewPolicy?.shouldCheckpoint===true:options.save});
   if(!battle.ok){
    if(onEnd)await onEnd(battle.run);
    return battle;
   }
   if(onBattle)await onBattle(battle);
   if(battle.ended||!activeRun?.active){
    const ended=!activeRun?.active?runStatus():(battle.run||runStatus());
    if(onEnd)await onEnd(ended);
    return {ok:true,ended:true,reason:ended?.endedReason||battle.reason||"ended",result:battle,run:ended};
   }
   if(activeRun.stopRequested){
    const ended=finish("stopped");
    if(onEnd)await onEnd(ended);
    return {ok:true,ended:true,reason:"stopped",result:battle,run:ended};
   }
   if(!fastCatchUp())await yieldControl();
  }
  const ended=runStatus();
  if(onEnd)await onEnd(ended);
  return {ok:true,ended:true,reason:ended?.endedReason||"ended",run:ended};
 }

 function runSingle(id,options={}){
  const started=begin(id,"single");
  if(!started.ok)return started;
  return fightNext(options);
 }

 function stopForPageHide(){
  if(!activeRun?.active)return;
  if(activeRun.mode==="continuous"&&backgroundEnabled())return;
  activeRun.stopRequested=true;
  activeRun.active=false;
  activeRun.phase="ended";
  activeRun.endedReason="pagehide";
  activeRun.endedAt=Date.now();
 }

 window.CALAMITY_RUN_VERSION=CALAMITY_RUN_VERSION;
 window.CALAMITY_CONTINUOUS_RULE_VERSION=CALAMITY_CONTINUOUS_RULE_VERSION;
 window.CALAMITY_FAST_CATCH_UP_POLICY_VERSION=1;
 window.beginCivilizationCalamityRun=begin;
 window.runCivilizationCalamitySingle=runSingle;
 window.fightNextCivilizationCalamityBattle=fightNext;
 window.runCivilizationCalamityContinuous=runContinuous;
 window.requestCivilizationCalamityContinuousStop=requestStop;
 window.getCivilizationCalamityRunSnapshot=runStatus;
 window.civilizationCalamityBackgroundEnabled=backgroundEnabled;
 window.stopCivilizationCalamityRunForPageHide=stopForPageHide;
 window.addEventListener("pagehide",stopForPageHide);
})();