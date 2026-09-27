(function(){
 const VERSION=1;
 const PRESENTATION_ADAPTER_VERSION=1;
 const MINIMAL_MODE_ADAPTER_VERSION=1;
 const HP_CAP_PRESENTATION_VERSION=1;
 const ADAPTER_ID="third-world-mainline";
 let activeContext=null;
 let retainedContext=null;
 let flowPromise=null;
 let adapterRegistered=false;

 function whole(value){const n=Math.floor(Number(value));return Number.isFinite(n)?Math.max(0,n):0;}
 function clamp(value,min,max){return Math.max(min,Math.min(max,Number(value)||0));}
 function fmt(value){return whole(value).toLocaleString();}
 function pct(value){return `${clamp(value,0,100).toFixed(2)}%`;}
 function runSnapshot(){return typeof window.thirdWorldContinuousRunSnapshot==="function"?window.thirdWorldContinuousRunSnapshot():null;}
 function bossDefinition(index){return typeof window.thirdWorldBoss==="function"?window.thirdWorldBoss(index):(Array.isArray(window.THIRD_WORLD_BOSS_DEFINITIONS)?window.THIRD_WORLD_BOSS_DEFINITIONS[index]:null);}
 function levelProgress(){return typeof window.levelProgressSnapshot==="function"?window.levelProgressSnapshot(state):{atCap:false,exp:whole(state?.exp),need:0};}
 function displayContext(){return activeContext||retainedContext;}
 function activeFlow(){return !!activeContext&&activeContext.active===true;}
 function minimalOpen(){return window.getMinimalModeAdapterId?.()===ADAPTER_ID&&window.isMinimalModeOpen?.()===true;}
 function syncMinimal(){if(minimalOpen()&&typeof window.syncMinimalMode==="function")window.syncMinimalMode();}
 function capFromCombat(combat){
  const baseMax=Math.max(1,whole(combat?.playerMaxHp)),cap=Math.max(1,Math.min(baseMax,whole(combat?.playerHealCap||baseMax)));
  return {baseMax,cap,percent:baseMax>0?cap/baseMax*100:100};
 }
 function coreCombat(step){return step?.combat?.combat&&typeof step.combat.combat==="object"?step.combat.combat:null;}
 function publicContext(source=activeContext){
  if(!source)return null;
  return Object.freeze({
   version:VERSION,
   active:source.active===true,
   bossIndex:whole(source.bossIndex),
   bossName:String(source.bossName||"高維存在"),
   battleNumber:Math.max(1,whole(source.battleNumber||1)),
   deaths:whole(source.deaths),
   maxDeaths:whole(window.THIRD_WORLD_RUN_MAX_DEATHS||100),
   hpCap:whole(source.hpCap),
   hpCapPercent:clamp(source.hpCapPercent,0,100),
   presenting:source.presenting===true,
   currentCombat:source.currentCombat||null,
   stopReason:String(source.stopReason||"")
  });
 }
 function refreshContextFromStep(step){
  if(!activeContext)return null;
  const combat=coreCombat(step),summary=step?.summary||{},boss=bossDefinition(summary.bossIndex??activeContext.bossIndex),cap=capFromCombat(combat);
  activeContext.bossIndex=whole(summary.bossIndex??activeContext.bossIndex);
  activeContext.bossName=String(boss?.name||step?.combat?.bossName||combat?.e?.name||activeContext.bossName||"高維存在");
  activeContext.battleNumber=Math.max(1,whole(summary.battleNumber||activeContext.battleNumber||1));
  activeContext.deaths=whole(step?.deathsAfter??step?.snapshot?.deaths??activeContext.deaths);
  activeContext.hpCap=cap.cap;
  activeContext.hpCapPercent=cap.percent;
  activeContext.currentCombat=combat;
  activeContext.stopReason=String(step?.terminalReason||"");
  return combat;
 }
 function presentationResult(combat){
  const cap=capFromCombat(combat),playerStart=Math.max(0,Math.min(cap.cap,whole(combat?.playerStartHp??cap.cap)));
  return {...combat,playerMaxHp:cap.cap,playerStartHp:playerStart,e:combat?.e?{...combat.e,hp:Math.max(1,whole(combat.enemyMaxHp||combat.e.hp||1))}:combat?.e};
 }
 async function presentStep(step,meta={}){
  if(step?.ok!==true||!activeContext)return;
  const combat=refreshContextFromStep(step);if(!combat)return;
  if(meta?.fastCatchUp===true){
   if(typeof window.clearCombatPresentation==="function")window.clearCombatPresentation("third-world-fast-catch-up-skip");
   syncMinimal();
   return;
  }
  if(typeof window.prepareCombatPresentation!=="function"||typeof window.animateStructuredCombatPresentation!=="function")throw new Error("共用戰鬥呈現 owner 尚未載入。");
  if(typeof render==="function")render();
  window.prepareCombatPresentation(presentationResult(combat),{logs:true});
  activeContext.presenting=true;
  syncMinimal();
  try{
   await window.animateStructuredCombatPresentation(combat,{clearAfter:true,clearReason:"third-world-player-battle-end",onUpdate:syncMinimal});
  }finally{
   if(activeContext)activeContext.presenting=false;
  }
 }
 function updateContextFromFinalSnapshot(){
  if(!activeContext)return;
  const final=typeof window.thirdWorldLastFinishedRunSnapshot==="function"?window.thirdWorldLastFinishedRunSnapshot():null;
  if(final){
   activeContext.deaths=whole(final.deaths);
   activeContext.stopReason=String(final.stopReason||activeContext.stopReason||"");
  }
 }
 function finishMinimalMode(){
  if(!minimalOpen())return;
  if(typeof window.setMinimalModeState==="function")window.setMinimalModeState("stopped");
  syncMinimal();
 }
 async function startFlow(value){
  const index=whole(value);
  if(flowPromise)return Object.freeze({ok:false,reason:"高維玩家連戰流程已在執行中。"});
  if(typeof window.startThirdWorldContinuousRun!=="function"||typeof window.runThirdWorldContinuousLoop!=="function")return Object.freeze({ok:false,reason:"高維連戰 runtime 尚未載入完整。"});
  const started=window.startThirdWorldContinuousRun(index);
  if(started?.ok!==true)return started;
  const boss=bossDefinition(index),snapshot=started.snapshot||runSnapshot(),cap=snapshot?.hpCap||{};
  retainedContext=null;
  activeContext={active:true,bossIndex:index,bossName:String(boss?.name||"高維存在"),battleNumber:Math.max(1,whole(snapshot?.battles)+1),deaths:whole(snapshot?.deaths),hpCap:whole(cap.hpCap),hpCapPercent:clamp(cap.hpCapPercent??100,0,100),currentCombat:null,presenting:false,stopReason:""};
  if(typeof render==="function")render();
  flowPromise=window.runThirdWorldContinuousLoop(index,{preparePresentation:false,logs:true,onBattle:presentStep,onCatchUpFinal:async()=>{syncMinimal();if(typeof render==="function")render();}});
  try{return await flowPromise;}
  finally{
   updateContextFromFinalSnapshot();
   if(activeContext){activeContext.active=false;retainedContext={...activeContext};}
   activeContext=null;
   if(typeof window.clearCombatPresentation==="function")window.clearCombatPresentation("third-world-player-flow-end");
   finishMinimalMode();
   flowPromise=null;
   if(typeof render==="function")render();
  }
 }
 function stopFlow(reason="manual"){
  if(typeof window.stopThirdWorldContinuousRun!=="function")return false;
  const snapshot=runSnapshot();
  if(snapshot?.active!==true)return false;
  const stopped=window.stopThirdWorldContinuousRun(reason);
  if(activeContext)activeContext.stopReason=String(reason||"manual");
  return !!stopped;
 }
 function expText(){
  const progress=levelProgress();
  return progress?.atCap?"MAX":`${fmt(progress?.exp)} / ${fmt(progress?.need)}`;
 }
 function minimalContentHtml(){
  const ctx=displayContext();
  return `<div class="main-minimal-mode-block"><div class="main-minimal-mode-label">目前敵人</div><div class="main-minimal-mode-value" data-third-world-minimal-enemy>${ctx?.bossName||"高維存在"}</div></div>
   <div class="main-minimal-mode-block"><div class="main-minimal-mode-label">連續戰鬥</div><div class="main-minimal-mode-value" data-third-world-minimal-round>第 ${Math.max(1,whole(ctx?.battleNumber||1))} 場</div></div>
   <div class="main-minimal-mode-block"><div class="main-minimal-mode-label">死亡</div><div class="main-minimal-mode-value" data-third-world-minimal-deaths>${whole(ctx?.deaths)} / ${whole(window.THIRD_WORLD_RUN_MAX_DEATHS||100)}</div></div>
   <div class="main-minimal-mode-block"><div class="main-minimal-mode-label">目前最大 HP</div><div class="main-minimal-mode-value" data-third-world-minimal-cap>${pct(ctx?.hpCapPercent??100)}</div></div>
   <div class="main-minimal-mode-block"><div class="main-minimal-mode-label">角色</div><div class="main-minimal-mode-value" data-third-world-minimal-level>Lv.${whole(state?.level)}</div></div>
   <div class="main-minimal-mode-block main-minimal-mode-stats"><div data-third-world-minimal-exp>EXP　${expText()}</div><div data-third-world-minimal-strings>維度之弦　${fmt(state?.thirdWorld?.dimensionalStrings)}</div></div>`;
 }
 function syncMinimalValues(root){
  const ctx=displayContext(),enemy=root.querySelector("[data-third-world-minimal-enemy]"),round=root.querySelector("[data-third-world-minimal-round]"),deaths=root.querySelector("[data-third-world-minimal-deaths]"),cap=root.querySelector("[data-third-world-minimal-cap]"),level=root.querySelector("[data-third-world-minimal-level]"),exp=root.querySelector("[data-third-world-minimal-exp]"),strings=root.querySelector("[data-third-world-minimal-strings]");
  if(enemy)enemy.textContent=ctx?.bossName||"高維存在";
  if(round)round.textContent=`第 ${Math.max(1,whole(ctx?.battleNumber||1))} 場`;
  if(deaths)deaths.textContent=`${whole(ctx?.deaths)} / ${whole(window.THIRD_WORLD_RUN_MAX_DEATHS||100)}`;
  if(cap)cap.textContent=pct(ctx?.hpCapPercent??100);
  if(level)level.textContent=`Lv.${whole(state?.level)}`;
  if(exp)exp.textContent=`EXP　${expText()}`;
  if(strings)strings.textContent=`維度之弦　${fmt(state?.thirdWorld?.dimensionalStrings)}`;
 }
 function registerAdapter(){
  if(typeof window.registerMinimalModeAdapter!=="function")return false;
  adapterRegistered=window.registerMinimalModeAdapter(ADAPTER_ID,{isActive:activeFlow,runningStatus:"高維連戰持續進行中",centerClass:"",contentHtml:minimalContentHtml,sync:syncMinimalValues})===true;
  return adapterRegistered;
 }
 function validate(){
  const errors=[];
  if(typeof window.startThirdWorldContinuousRun!=="function"||typeof window.runThirdWorldContinuousLoop!=="function"||typeof window.stopThirdWorldContinuousRun!=="function")errors.push("THIRD_WORLD_RUN_OWNER_MISSING");
  if(typeof window.prepareCombatPresentation!=="function"||typeof window.animateStructuredCombatPresentation!=="function"||Number(window.COMBAT_STRUCTURED_PRESENTATION_VERSION)<2)errors.push("SHARED_COMBAT_PRESENTATION_OWNER_MISSING");
  if(typeof window.registerMinimalModeAdapter!=="function"||typeof window.openMinimalMode!=="function"||Number(window.MINIMAL_MODE_SHARED_API_VERSION)!==1)errors.push("SHARED_MINIMAL_MODE_OWNER_MISSING");
  if(Number(window.THIRD_WORLD_RUN_MAX_DEATHS)!==100)errors.push("MAX_DEATHS_CONTRACT");
  if(adapterRegistered!==true)errors.push("MINIMAL_MODE_ADAPTER_REGISTRATION");
  return Object.freeze({version:VERSION,presentationAdapterVersion:PRESENTATION_ADAPTER_VERSION,minimalModeAdapterVersion:MINIMAL_MODE_ADAPTER_VERSION,hpCapPresentationVersion:HP_CAP_PRESENTATION_VERSION,passed:errors.length===0,errors:Object.freeze(errors)});
 }

 registerAdapter();
 window.startThirdWorldPlayerFlow=startFlow;
 window.stopThirdWorldPlayerFlow=stopFlow;
 window.getThirdWorldPlayerFlowContext=function(){return publicContext(activeContext);};
 window.openThirdWorldMinimalMode=function(){return typeof window.openMinimalMode==="function"?window.openMinimalMode(ADAPTER_ID):false;};
 window.THIRD_WORLD_PLAYER_FLOW_VERSION=VERSION;
 window.THIRD_WORLD_PLAYER_FLOW_PRESENTATION_ADAPTER_VERSION=PRESENTATION_ADAPTER_VERSION;
 window.THIRD_WORLD_PLAYER_FLOW_MINIMAL_MODE_ADAPTER_VERSION=MINIMAL_MODE_ADAPTER_VERSION;
 window.THIRD_WORLD_PLAYER_FLOW_HP_CAP_PRESENTATION_VERSION=HP_CAP_PRESENTATION_VERSION;
 window.THIRD_WORLD_PLAYER_FLOW_ADAPTER_ID=ADAPTER_ID;
 window.THIRD_WORLD_PLAYER_FLOW_INTEGRITY=validate();
 if(!window.THIRD_WORLD_PLAYER_FLOW_INTEGRITY.passed)console.error("[文明戰線] Third-world player flow integrity error",window.THIRD_WORLD_PLAYER_FLOW_INTEGRITY.errors);
})();