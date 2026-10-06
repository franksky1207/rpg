(function(){
 const VERSION=4;
 const ERA_RESTRICTION_VERSION=2;
 const ERA_POLICY_DELEGATION_VERSION=1;
 const ACCESS_SNAPSHOT_VERSION=2;
 const MIN_LEVELS=Object.freeze({bounty:5,arena:15,tower:25,mirror:Math.max(1,Math.floor(Number(window.MIRROR_DUNGEON_CONFIG?.unlockLevel)||50))});
 const base=Object.freeze({
  mirrorDungeonStatus:typeof window.mirrorDungeonStatus==="function"?window.mirrorDungeonStatus:null,
  beginMirrorDungeonState:typeof window.beginMirrorDungeonState==="function"?window.beginMirrorDungeonState:null,
  getArenaRankCapForWorld:typeof window.getArenaRankCapForWorld==="function"?window.getArenaRankCapForWorld:null
 });

 function targetState(target=null){return target&&typeof target==="object"?target:(typeof state!=="undefined"?state:null);}
 function modeKey(mode){const key=String(mode||"").trim().toLowerCase();return key==="void"||key==="void-mirage"?"tower":key;}
 function permanent(target=null){
  const s=targetState(target),context=typeof window.dungeonReincarnationContext==="function"?window.dungeonReincarnationContext(s):null;
  return context?.reincarnationRun===true;
 }
 function eraPolicy(mode,target=null){
  const key=modeKey(mode),s=targetState(target);
  if(typeof window.dungeonModeAvailability!=="function")return Object.freeze({mode:key,visible:false,enabled:false,reason:"副本紀元規則尚未載入。",ownerMissing:true});
  const policy=window.dungeonModeAvailability(key,s);
  return Object.freeze({...policy,mode:key,ownerMissing:false});
 }
 function accessSnapshot(mode,target=null){
  const key=modeKey(mode),s=targetState(target),minimum=Math.max(1,Math.floor(Number(MIN_LEVELS[key])||1)),level=Math.max(1,Math.floor(Number(s?.level)||1));
  const permanentUnlocked=permanent(s),levelUnlocked=level>=minimum,qualificationUnlocked=permanentUnlocked||levelUnlocked,qualificationSource=permanentUnlocked?"reincarnation-permanent":(levelUnlocked?"level":"locked");
  const policy=eraPolicy(key,s),eraVisible=policy.visible!==false,eraEnabled=policy.enabled!==false,eraAllowed=eraVisible&&eraEnabled&&!policy.ownerMissing,effectiveEnabled=qualificationUnlocked&&eraAllowed;
  return Object.freeze({version:ACCESS_SNAPSHOT_VERSION,mode:key,minimumLevel:minimum,level,permanent:permanentUnlocked,permanentUnlocked,levelUnlocked,qualificationUnlocked,qualificationSource,eraVisible,eraEnabled,eraAllowed,effectiveEnabled,unlocked:effectiveEnabled,source:qualificationSource,effectiveSource:!qualificationUnlocked?"qualification-locked":(!eraAllowed?"era-blocked":qualificationSource),reason:!eraAllowed?String(policy.reason||"此紀元目前無法挑戰此副本。"):"",unlockText:permanentUnlocked?"轉生後永久解鎖":`Lv.${minimum}${levelUnlocked?" 已解鎖":" 解鎖"}`});
 }
 function entryUnlocked(mode,target=null){return accessSnapshot(mode,target).effectiveEnabled===true;}
 function currentPhase(target=null){
  const s=targetState(target);
  if(typeof window.currentWorldPhase!=="function")throw new Error("Canonical world phase owner unavailable.");
  const phase=Number(window.currentWorldPhase(s));
  if(phase!==1&&phase!==2&&phase!==3)throw new Error("Canonical world phase owner returned an invalid phase.");
  return phase;
 }
 function replaceDaily(target,next){
  const row=target&&typeof target==="object"?target:null;if(!row)return false;
  Object.keys(row).forEach(key=>{if(!(key in next))delete row[key];});Object.assign(row,next);return true;
 }
 function dateKey(timestamp){return typeof window.gameDailyDateKey==="function"?window.gameDailyDateKey(timestamp):new Date(Number(timestamp)||Date.now()).toISOString().slice(0,10);}

 window.reincarnationDungeonPermanentAccessUnlocked=permanent;
 window.dungeonModeAccessSnapshot=accessSnapshot;
 window.isDungeonModeEntryUnlocked=entryUnlocked;
 window.REINCARNATION_DUNGEON_ACCESS_VERSION=VERSION;
 window.REINCARNATION_DUNGEON_ACCESS_SNAPSHOT_VERSION=ACCESS_SNAPSHOT_VERSION;

 if(typeof base.mirrorDungeonStatus==="function")window.mirrorDungeonStatus=function(...args){
  const info=base.mirrorDungeonStatus.apply(this,args),access=accessSnapshot("mirror",state);
  if(!info||!access.unlocked||info.unlocked===true)return info;
  return {...info,unlocked:true,canStart:info.status==="idle",access};
 };
 if(typeof base.beginMirrorDungeonState==="function")window.beginMirrorDungeonState=function(timestamp=Date.now()){
  const access=accessSnapshot("mirror",state);
  if(!access.unlocked)return base.beginMirrorDungeonState.call(this,timestamp);
  const baseInfo=base.mirrorDungeonStatus(timestamp);
  if(baseInfo?.unlocked===true)return base.beginMirrorDungeonState.call(this,timestamp);
  const info=window.mirrorDungeonStatus(timestamp);
  if(!info?.unlocked)return {ok:false,reason:"locked",...(info||{})};
  if(info.status!=="idle")return {ok:false,reason:"already_used",...info};
  if(typeof window.ensureMirrorDungeonState!=="function")return {ok:false,reason:"missing_state",...info};
  const mirror=window.ensureMirrorDungeonState(timestamp),key=dateKey(timestamp),now=Math.max(0,Math.floor(Number(timestamp)||Date.now()));
  if(!mirror?.daily)return {ok:false,reason:"missing_state",...info};
  const previous={...mirror.daily};
  replaceDaily(mirror.daily,{dateKey:key,status:"running",challengeDate:key,startedAt:now,wins:0,losses:0,completedAt:0});
  let persisted=false;
  try{persisted=typeof save==="function"&&save(false)===true;}catch(error){console.error("Reincarnation mirror dungeon start save failed",error);}
  if(!persisted){replaceDaily(mirror.daily,previous);return {ok:false,reason:"save_failed",...window.mirrorDungeonStatus(timestamp)};}
  return {ok:true,...window.mirrorDungeonStatus(timestamp)};
 };

 if(typeof base.getArenaRankCapForWorld==="function")window.getArenaRankCapForWorld=function(world,target=state){
  const w=Number(world)===2?2:1;
  if(w===1&&permanent(target)&&typeof window.firstWorldRerunKeyBossCoverage==="function"){
   const coverage=Math.max(0,Math.floor(Number(window.firstWorldRerunKeyBossCoverage(target))||0));
   const max=typeof window.getArenaMaxRankForWorld==="function"?Math.max(1,Math.floor(Number(window.getArenaMaxRankForWorld(1))||1)):10;
   return Math.max(1,Math.min(max,coverage||1));
  }
  return base.getArenaRankCapForWorld.call(this,w,target);
 };

 function dailyRemaining(mode){const row=typeof window.dailyDungeonStatus==="function"?window.dailyDungeonStatus(mode):null;return row?Math.max(0,Math.floor(Number(row.remaining)||0)):0;}
 function syncAccessCard(main,selector,mode){
  const card=main?.querySelector(selector);if(!card)return false;
  const policy=typeof window.dungeonModeAvailability==="function"?window.dungeonModeAvailability(mode,state):null;
  if(policy?.visible===false){
   card.hidden=true;card.style.setProperty("display","none","important");card.dataset.dungeonPolicyHidden="1";
   return true;
  }
  const access=accessSnapshot(mode,state);if(!access.permanentUnlocked||!access.effectiveEnabled)return false;
  card.hidden=false;card.style.removeProperty("display");delete card.dataset.dungeonPolicyHidden;card.classList.remove("locked");
  const unlock=card.querySelector(".dungeon-unlock-label"),button=card.querySelector(".dungeon-entry-btn");
  if(unlock){unlock.textContent=access.unlockText;unlock.hidden=false;}
  if(!button)return true;
  let disabled=false,onclick="",label="";
  if(mode==="bounty"){disabled=dailyRemaining("bounty")<=0;onclick="enterBountyDungeon()";label=disabled?"今日次數已用完":"進入懸賞戰";}
  else if(mode==="arena"){disabled=dailyRemaining("arena")<=0;onclick="openArenaDungeon()";label=disabled?"今日次數已用完":(currentPhase()===3?"進入高維競技場":"進入競技場");}
  else if(mode==="tower"){onclick="enterVoidMirageDungeon()";label="進入虛空幻境";}
  else if(mode==="mirror"){onclick="openMirrorDungeon()";const info=typeof window.mirrorDungeonStatus==="function"?window.mirrorDungeonStatus():null;label=info?.ended?"查看鏡像戰":"進入鏡像戰";}
  button.disabled=disabled;
  if(onclick)button.setAttribute("onclick",disabled?"void(0)":onclick);
  if(label)button.textContent=label;
  return true;
 }
 function syncUi(context={}){
  if(!permanent(state))return false;
  const main=context.main||document.getElementById("main"),viewName=String(context.view??(typeof view!=="undefined"?view:""));if(!main)return false;
  if(viewName==="dungeon"){
   syncAccessCard(main,".dungeon-mode-bounty","bounty");
   syncAccessCard(main,".dungeon-mode-arena","arena");
   syncAccessCard(main,".dungeon-mode-tower","tower");
   syncAccessCard(main,"[data-mirror-dungeon-card], .dungeon-mode-mirror","mirror");
  }else if(viewName==="home"&&currentPhase()===3){
   const cards=Array.from(main.querySelectorAll(".menu-card")),dungeon=cards.find(card=>(card.getAttribute("onclick")||"").includes("go('dungeon')")),desc=dungeon?.querySelector("span");
   if(desc)desc.textContent="挑戰高維競技場、鏡像戰與虛空幻境";
  }
  return true;
 }

 if(typeof window.registerDungeonPostRenderHook==="function")window.registerDungeonPostRenderHook(syncUi);
 window.REINCARNATION_DUNGEON_ERA_RESTRICTION_VERSION=ERA_RESTRICTION_VERSION;
 window.REINCARNATION_DUNGEON_ERA_POLICY_DELEGATION_VERSION=ERA_POLICY_DELEGATION_VERSION;
 window.REINCARNATION_DUNGEON_ACCESS_INSTALL_REPORT=Object.freeze({version:VERSION,snapshotVersion:ACCESS_SNAPSHOT_VERSION,eraRestrictionVersion:ERA_RESTRICTION_VERSION,eraPolicyDelegationVersion:ERA_POLICY_DELEGATION_VERSION,eraPolicyOwner:"thirdworlddungeonui",policyReinstalled:false,temporaryLevelPresentation:false,entryOwner:"effective-access-snapshot",wrapped:{bounty:false,arena:false,void:false,mirror:typeof base.beginMirrorDungeonState==="function",arenaCap:typeof base.getArenaRankCapForWorld==="function"}});
 window.syncReincarnationDungeonAccessUi=syncUi;
})();