(function(){
 const VERSION=1;
 const UI_PRESENTATION_VERSION=2;
 const base=Object.freeze({
  challengeStatus:typeof window.thirdWorldChallengeStatus==="function"?window.thirdWorldChallengeStatus:null,
  challengeAllowed:typeof window.thirdWorldChallengeAllowed==="function"?window.thirdWorldChallengeAllowed:null,
  canChallenge:typeof window.canChallengeThirdWorldBoss==="function"?window.canChallengeThirdWorldBoss:null,
  bossProgress:typeof window.thirdWorldBossProgressSnapshot==="function"?window.thirdWorldBossProgressSnapshot:null,
  adventurePage:typeof window.thirdWorldAdventurePageHtml==="function"?window.thirdWorldAdventurePageHtml:null
 });

 function stateTarget(target){
  if(target&&typeof target==="object")return target;
  try{return typeof state!=="undefined"&&state&&typeof state==="object"?state:null;}catch(_){return null;}
 }
 function whole(value,fallback=0){const n=Math.floor(Number(value));return Number.isFinite(n)?n:fallback;}
 function phase(target){
  if(typeof window.currentWorldPhase==="function")return Number(window.currentWorldPhase(target))||1;
  if(target?.thirdWorld?.entered===true)return 3;
  if(target?.secondWorld?.entered===true)return 2;
  return 1;
 }
 function context(target=null){
  const holder=stateTarget(target),lifecycle=typeof window.worldReincarnationContext==="function"?window.worldReincarnationContext(holder):null;
  const active=!!holder&&holder?.thirdWorld?.entered===true&&lifecycle?.reincarnationRun===true&&phase(holder)===3;
  return Object.freeze({version:VERSION,active,count:Math.max(0,whole(lifecycle?.count,0)),lifeId:Math.max(0,whole(lifecycle?.lifeId,0)),firstRun:lifecycle?.reincarnationRun!==true,reincarnationRun:lifecycle?.reincarnationRun===true,world:phase(holder),source:lifecycle?"reincarnation-context":"fail-closed"});
 }
 function active(target=null){return context(target).active===true;}
 function rerunChallengeStatus(value,target=null){
  const holder=stateTarget(target),original=typeof base.challengeStatus==="function"?base.challengeStatus(value,holder):null;
  if(!original||!active(holder))return original;
  if(original.allowed===true||original.reason!=="five-point-front")return original;
  return Object.freeze({...original,allowed:true,challengeable:true,reason:"reincarnation-rerun",fivePointBypassed:true,originalReason:"five-point-front",originalBlockingBossIndexes:Array.isArray(original.blockingBossIndexes)?Object.freeze(Array.from(original.blockingBossIndexes)):Object.freeze([]),blockingBossIndexes:Object.freeze([]),rerun:context(holder)});
 }
 function rerunBossProgress(value,target=null){
  const holder=stateTarget(target),original=typeof base.bossProgress==="function"?base.bossProgress(value,holder):null;
  if(!original||!active(holder))return original;
  const challenge=rerunChallengeStatus(value,holder);
  return Object.freeze({...original,challengeAllowed:challenge?.allowed===true,challengeStatus:challenge});
 }
 function applyRerunAdventurePresentation(html){
  const holder=stateTarget(null),ctx=context(holder);
  if(ctx.active!==true||typeof html!=="string"||typeof document==="undefined")return html;
  const shell=document.createElement("template");shell.innerHTML=html.trim();
  const screen=shell.content.querySelector(".third-world-adventure-screen");if(!screen)return html;
  screen.dataset.thirdWorldRerunPresentation="1";
  shell.content.querySelectorAll(".third-world-boss-card[data-third-world-boss]").forEach(card=>{
   const index=whole(card.getAttribute("data-third-world-boss"),-1),snap=typeof window.thirdWorldBossProgressSnapshot==="function"?window.thirdWorldBossProgressSnapshot(index,holder):null,status=snap?.challengeStatus||null;
   const statusBox=card.querySelector(".third-world-boss-status"),detail=statusBox?.querySelector("span");
   if(!detail||statusBox?.classList.contains("running")||snap?.defeated===true||status?.allowed!==true)return;
   if(status?.reason==="last-survivor")detail.textContent="轉生重征服：可持續集中攻略此高維存在";
   else detail.textContent=status?.fivePointBypassed===true?"轉生重征服：已解除 5% 戰線限制，可集中攻略此高維存在":"轉生重征服：可集中攻略任一存活高維存在";
  });
  const rule=shell.content.querySelector(".third-world-run-rule .muted");
  if(rule)rule.textContent=`玩家死亡後仍會繼續下一場；一輪最多累積 ${Math.max(1,whole(window.THIRD_WORLD_RUN_MAX_DEATHS||500))} 次死亡。停止連戰後死亡次數與高維壓制歸零；王死亡或跨入新強化階段時會停止下一場；轉生重征服不受 5% 戰線限制。`;
  return shell.innerHTML;
 }

 window.THIRD_WORLD_REINCARNATION_RERUN_POLICY_VERSION=VERSION;
 window.THIRD_WORLD_REINCARNATION_RERUN_UI_PRESENTATION_VERSION=UI_PRESENTATION_VERSION;
 window.thirdWorldReincarnationRerunContext=context;
 window.isThirdWorldReincarnationRerun=active;
 window.thirdWorldReincarnationRerunPolicySnapshot=function(target=null){const holder=stateTarget(target),ctx=context(holder);return {...ctx,bossCount:Number(window.THIRD_WORLD_BOSS_COUNT||10),fivePointBypassed:ctx.active===true,uiPresentationVersion:UI_PRESENTATION_VERSION};};
 window.thirdWorldChallengeStatus=rerunChallengeStatus;
 window.thirdWorldChallengeAllowed=function(value,target=null){const status=rerunChallengeStatus(value,target);return status?.allowed===true;};
 window.canChallengeThirdWorldBoss=function(value,target=null){const status=rerunChallengeStatus(value,target);return status?.allowed===true;};
 window.thirdWorldBossProgressSnapshot=rerunBossProgress;
 if(typeof base.adventurePage==="function")window.thirdWorldAdventurePageHtml=function(){return applyRerunAdventurePresentation(base.adventurePage());};
})();
