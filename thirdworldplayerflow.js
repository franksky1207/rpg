(function(){
 const VERSION=3;
 const PRESENTATION_ADAPTER_VERSION=1;
 const MINIMAL_MODE_ADAPTER_VERSION=1;
 const HP_CAP_PRESENTATION_VERSION=1;
 const PROGRESS_EVENT_PRESENTATION_VERSION=1;
 const CATCH_UP_SYNC_VERSION=1;
 const ADAPTER_ID="third-world-mainline";
 const EVENT_MODAL_ID="thirdWorldProgressEventModal";
 let activeContext=null;
 let retainedContext=null;
 let flowPromise=null;
 let adapterRegistered=false;
 let eventModalResolver=null;

 function whole(value){const n=Math.floor(Number(value));return Number.isFinite(n)?Math.max(0,n):0;}
 function clamp(value,min,max){return Math.max(min,Math.min(max,Number(value)||0));}
 function fmt(value){return whole(value).toLocaleString();}
 function pct(value){return `${clamp(value,0,100).toFixed(2)}%`;}
 function esc(value){return String(value??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[ch]));}
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
   catchingUp:source.catchingUp===true,
   catchUpCompleted:whole(source.catchUpCompleted),
   currentCombat:source.currentCombat||null,
   stopReason:String(source.stopReason||"")
  });
 }
 function refreshContextFromStep(step){
  if(!activeContext)return null;
  const combat=coreCombat(step),summary=step?.summary||{},boss=bossDefinition(summary.bossIndex??activeContext.bossIndex),cap=capFromCombat(combat),deathsAfter=whole(step?.deathsAfter??step?.snapshot?.deaths??activeContext.deaths),deathsAtBattleStart=Math.max(0,deathsAfter-(step?.countsDeath===true?1:0));
  activeContext.bossIndex=whole(summary.bossIndex??activeContext.bossIndex);
  activeContext.bossName=String(boss?.name||step?.combat?.bossName||combat?.e?.name||activeContext.bossName||"高維存在");
  activeContext.battleNumber=Math.max(1,whole(summary.battleNumber||activeContext.battleNumber||1));
  activeContext.deaths=deathsAtBattleStart;
  activeContext.hpCap=cap.cap;
  activeContext.hpCapPercent=cap.percent;
  activeContext.currentCombat=combat;
  activeContext.stopReason=String(step?.terminalReason||"");
  return combat;
 }
 function refreshContextAfterSettledStep(step){
  if(!activeContext)return;
  const snapshot=step?.snapshot||{},cap=snapshot?.hpCap||{};
  activeContext.deaths=whole(step?.deathsAfter??snapshot?.deaths??activeContext.deaths);
  if(Number.isFinite(Number(cap.hpCap)))activeContext.hpCap=whole(cap.hpCap);
  if(Number.isFinite(Number(cap.hpCapPercent)))activeContext.hpCapPercent=clamp(cap.hpCapPercent,0,100);
 }
 function presentationResult(combat){
  const cap=capFromCombat(combat),playerStart=Math.max(0,Math.min(cap.cap,whole(combat?.playerStartHp??cap.cap)));
  return {...combat,playerMaxHp:cap.cap,playerStartHp:playerStart,e:combat?.e?{...combat.e,hp:Math.max(1,whole(combat.enemyMaxHp||combat.e.hp||1))}:combat?.e};
 }
 function abilityName(id){
  const defs=Array.isArray(window.THIRD_WORLD_BOSS_ABILITY_DEFINITIONS)?window.THIRD_WORLD_BOSS_ABILITY_DEFINITIONS:[];
  return String(defs.find(row=>String(row?.id||"")===String(id||""))?.name||id||"");
 }
 function titleName(tier){
  const def=typeof window.thirdWorldTitleDefinition==="function"?window.thirdWorldTitleDefinition(whole(tier)):null;
  return String(def?.name||"");
 }
 function crossedThresholdText(stages){
  const rows=(Array.isArray(stages)?stages:[]).map(stage=>100-whole(stage)*10).filter(value=>value>=10&&value<=90);
  return rows.length?rows.map(value=>`${value}%`).join("、"):"";
 }
 function progressEventSections(step){
  const settlement=step?.settlement||{},events=Array.isArray(settlement.eventSequence)?settlement.eventSequence:[];
  const sections=[];
  events.forEach(event=>{
   if(!event||typeof event!=="object")return;
   if(event.type==="aggregate-progress"){
    const aggregate=settlement.aggregateAfter||null,remaining=Number(aggregate?.overallRemainingPercent),name=event.titleChanged?titleName(event.titleTier):"";
    const lines=[];
    if(Number.isFinite(remaining))lines.push(`十王總剩餘 HP：${pct(remaining)}`);
    if(event.titleChanged)lines.push(name?`新稱號門檻：${name}`:`高維稱號進度提升至第 ${whole(event.titleTier)} 階`);
    if(event.storyChanged)lines.push(`高維戰線紀錄推進至第 ${whole(event.storyStage)} 階`);
    sections.push(`<div class="notice"><b>高維戰線整體進度推進</b><div class="muted" style="margin-top:6px;line-height:1.55">${lines.map(esc).join("<br>")}</div></div>`);
    return;
   }
   if(event.type==="boss-defeated"){
    const boss=bossDefinition(event.bossIndex);
    sections.push(`<div class="notice"><b>${esc(boss?.name||"高維存在")} 已擊破</b><div class="muted" style="margin-top:6px">永久 HP 已歸零；此高維存在保留於戰線原位置並標記為已擊破。</div></div>`);
    return;
   }
   if(event.type==="stage-crossed"){
    const boss=bossDefinition(event.bossIndex),thresholds=crossedThresholdText(event.crossedStages),abilities=(Array.isArray(event.newAbilityIds)?event.newAbilityIds:[]).map(abilityName).filter(Boolean);
    const lines=[`${esc(boss?.name||"高維存在")}：Stage ${whole(event.from)} → Stage ${whole(event.to)}`];
    if(thresholds)lines.push(`本場跨越門檻：${thresholds}`);
    if(abilities.length)lines.push(`新增能力：${abilities.map(esc).join("、")}`);
    sections.push(`<div class="notice"><b>高維存在進入新強化階段</b><div class="muted" style="margin-top:6px;line-height:1.55">${lines.join("<br>")}</div></div>`);
    return;
   }
   if(event.type==="five-point-front"){
    const boss=bossDefinition(event.bossIndex),gap=whole(event.gapHp);
    sections.push(`<div class="notice"><b>戰線偏離｜暫不可挑戰</b><div class="muted" style="margin-top:6px;line-height:1.55">${esc(boss?.name||"此高維存在")} 已超前目前戰線${gap>0?` ${fmt(gap)} HP`:""}。本場已完整結算，但下一場已鎖定；請先推進其他存活高維存在。</div></div>`);
   }
  });
  if(settlement.completionReady===true)sections.push(`<div class="notice"><b>十名高維存在已全數擊破</b><div class="muted" style="margin-top:6px">高維戰線已達成十王全滅條件。</div></div>`);
  return sections;
 }
 function ensureProgressEventModal(){
  if(typeof document==="undefined")return null;
  let modal=document.getElementById(EVENT_MODAL_ID);
  if(modal)return modal;
  modal=document.createElement("div");
  modal.id=EVENT_MODAL_ID;
  modal.className="modal";
  modal.setAttribute("role","dialog");
  modal.setAttribute("aria-modal","true");
  document.body.appendChild(modal);
  return modal;
 }
 function closeProgressEventModal(){
  const modal=typeof document!=="undefined"?document.getElementById(EVENT_MODAL_ID):null;
  if(modal){modal.classList.remove("show");modal.remove();}
  const resolve=eventModalResolver;eventModalResolver=null;
  if(typeof resolve==="function")resolve(true);
  return true;
 }
 function presentProgressEvents(step){
  const sections=progressEventSections(step);
  if(!sections.length)return Promise.resolve(false);
  closeProgressEventModal();
  const modal=ensureProgressEventModal();
  if(!modal)return Promise.resolve(false);
  const reason=String(step?.terminalReason||"");
  const reasonCopy=reason==="boss-defeated"?"Boss 已擊破，本輪連戰結束。":reason==="stage-crossed"?"跨入新強化階段，本輪連戰結束。":reason==="five-point-front"?"5pp 戰線鎖定，本輪連戰結束。":reason==="progress-event"?"高維整體進度已推進，本輪連戰結束。":"高維進度事件已結算。";
  modal.innerHTML=`<div class="modal-box"><h3>高維戰線事件</h3><div style="display:grid;gap:10px">${sections.join("")}</div><div class="muted" style="margin-top:12px">${esc(reasonCopy)}確認後可重新選擇高維存在開始下一輪。</div><div class="controls" style="margin-top:16px"><button class="btn primary" type="button" onclick="closeThirdWorldProgressEventModal()">確認</button></div></div>`;
  modal.classList.add("show");
  return new Promise(resolve=>{eventModalResolver=resolve;});
 }
 function syncCatchUpNotice(){
  if(typeof document==="undefined")return false;
  const screen=document.querySelector(".third-world-combat-screen"),existing=document.getElementById("thirdWorldCatchUpStatus");
  if(!activeContext?.catchingUp){existing?.remove();return false;}
  if(!screen)return false;
  const node=existing||document.createElement("div");
  node.id="thirdWorldCatchUpStatus";
  node.className="notice";
  node.setAttribute("role","status");
  const completed=whole(activeContext.catchUpCompleted);
  node.innerHTML=`<b>正在快速補算背景進度</b><div class="muted" style="margin-top:4px">${completed>0?`已快速補算 ${fmt(completed)} 場；`:""}戰線資料會依共用 Fast Catch-up checkpoint 更新。</div>`;
  if(!existing){const head=screen.querySelector(".third-world-combat-head");if(head?.after)head.after(node);else screen.prepend(node);}
  return true;
 }
 function finishCatchUpUi(payload={}){
  if(!activeContext)return;
  const snapshot=payload?.snapshot||{},cap=snapshot?.hpCap||{};
  activeContext.catchingUp=false;
  activeContext.catchUpCompleted=0;
  activeContext.deaths=whole(snapshot?.deaths??activeContext.deaths);
  if(Number.isFinite(Number(cap.hpCap)))activeContext.hpCap=whole(cap.hpCap);
  if(Number.isFinite(Number(cap.hpCapPercent)))activeContext.hpCapPercent=clamp(cap.hpCapPercent,0,100);
  syncMinimal();
  if(typeof render==="function")render();
  syncCatchUpNotice();
 }
 async function presentStep(step,meta={}){
  if(step?.ok!==true||!activeContext)return;
  const combat=refreshContextFromStep(step);if(!combat)return;
  if(meta?.fastCatchUp===true){
   activeContext.catchingUp=true;
   activeContext.catchUpCompleted=Math.max(whole(activeContext.catchUpCompleted)+1,whole(meta?.catchUpPolicy?.completed));
   refreshContextAfterSettledStep(step);
   if(typeof window.clearCombatPresentation==="function")window.clearCombatPresentation("third-world-fast-catch-up-skip");
   if(meta?.catchUpPolicy?.shouldRefreshUi===true&&typeof render==="function")render();
   syncMinimal();
   syncCatchUpNotice();
  }else{
   activeContext.catchingUp=false;
   activeContext.catchUpCompleted=0;
   syncCatchUpNotice();
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
  if(Array.isArray(step?.settlement?.eventSequence)&&step.settlement.eventSequence.length||step?.settlement?.completionReady===true)await presentProgressEvents(step);
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
  activeContext={active:true,bossIndex:index,bossName:String(boss?.name||"高維存在"),battleNumber:Math.max(1,whole(snapshot?.battles)+1),deaths:whole(snapshot?.deaths),hpCap:whole(cap.hpCap),hpCapPercent:clamp(cap.hpCapPercent??100,0,100),currentCombat:null,presenting:false,catchingUp:false,catchUpCompleted:0,stopReason:""};
  if(typeof render==="function")render();
  flowPromise=window.runThirdWorldContinuousLoop(index,{preparePresentation:false,logs:true,onBattle:presentStep,onCatchUpFinal:async payload=>finishCatchUpUi(payload)});
  try{return await flowPromise;}
  finally{
   updateContextFromFinalSnapshot();
   if(activeContext){activeContext.active=false;activeContext.catchingUp=false;activeContext.catchUpCompleted=0;retainedContext={...activeContext};}
   activeContext=null;
   document.getElementById("thirdWorldCatchUpStatus")?.remove();
   if(typeof window.clearCombatPresentation==="function")window.clearCombatPresentation("third-world-player-flow-end");
   finishMinimalMode();
   flowPromise=null;
   if(typeof render==="function")render();
   if(typeof window.flushPendingPlayerTitleNoticeAfterFlow==="function")window.flushPendingPlayerTitleNoticeAfterFlow({source:"third-world-player-flow"});
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
  if(typeof window.thirdWorldBoss!=="function"||typeof window.thirdWorldTitleDefinition!=="function"||!Array.isArray(window.THIRD_WORLD_BOSS_ABILITY_DEFINITIONS))errors.push("THIRD_WORLD_EVENT_PRESENTATION_OWNER_MISSING");
  if(typeof window.thirdWorldRunBackgroundPolicySnapshot!=="function"||Number(window.THIRD_WORLD_RUN_BACKGROUND_GM_GATE_VERSION)!==1||Number(window.THIRD_WORLD_RUN_FOREGROUND_WAIT_VERSION)!==1)errors.push("THIRD_WORLD_BACKGROUND_POLICY_OWNER_MISSING");
  if(Number(window.GM_BACKGROUND_BATTLE_THIRD_WORLD_GATE_VERSION)!==1)errors.push("GM_BACKGROUND_THIRD_WORLD_GATE_MISSING");
  if(Number(window.THIRD_WORLD_RUN_MAX_DEATHS)!==100)errors.push("MAX_DEATHS_CONTRACT");
  if(adapterRegistered!==true)errors.push("MINIMAL_MODE_ADAPTER_REGISTRATION");
  return Object.freeze({version:VERSION,presentationAdapterVersion:PRESENTATION_ADAPTER_VERSION,minimalModeAdapterVersion:MINIMAL_MODE_ADAPTER_VERSION,hpCapPresentationVersion:HP_CAP_PRESENTATION_VERSION,progressEventPresentationVersion:PROGRESS_EVENT_PRESENTATION_VERSION,catchUpSyncVersion:CATCH_UP_SYNC_VERSION,passed:errors.length===0,errors:Object.freeze(errors)});
 }

 registerAdapter();
 window.startThirdWorldPlayerFlow=startFlow;
 window.stopThirdWorldPlayerFlow=stopFlow;
 window.getThirdWorldPlayerFlowContext=function(){return publicContext(activeContext);};
 window.openThirdWorldMinimalMode=function(){return typeof window.openMinimalMode==="function"?window.openMinimalMode(ADAPTER_ID):false;};
 window.closeThirdWorldProgressEventModal=closeProgressEventModal;
 window.THIRD_WORLD_PLAYER_FLOW_VERSION=VERSION;
 window.THIRD_WORLD_PLAYER_FLOW_PRESENTATION_ADAPTER_VERSION=PRESENTATION_ADAPTER_VERSION;
 window.THIRD_WORLD_PLAYER_FLOW_MINIMAL_MODE_ADAPTER_VERSION=MINIMAL_MODE_ADAPTER_VERSION;
 window.THIRD_WORLD_PLAYER_FLOW_HP_CAP_PRESENTATION_VERSION=HP_CAP_PRESENTATION_VERSION;
 window.THIRD_WORLD_PLAYER_FLOW_PROGRESS_EVENT_PRESENTATION_VERSION=PROGRESS_EVENT_PRESENTATION_VERSION;
 window.THIRD_WORLD_PLAYER_FLOW_CATCH_UP_SYNC_VERSION=CATCH_UP_SYNC_VERSION;
 window.THIRD_WORLD_PLAYER_FLOW_ADAPTER_ID=ADAPTER_ID;
 window.THIRD_WORLD_PLAYER_FLOW_INTEGRITY=validate();
 if(!window.THIRD_WORLD_PLAYER_FLOW_INTEGRITY.passed)console.error("[文明戰線] Third-world player flow integrity error",window.THIRD_WORLD_PLAYER_FLOW_INTEGRITY.errors);
})();