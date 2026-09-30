(function(){
 const VERSION=9;
 const POST_FLOW_COORDINATOR_VERSION=1;
 const STORY_POST_FLOW_SEQUENCE_VERSION=1;
 const TITLE_NOTICE_HOLD_VERSION=1;
 const PRESENTATION_ADAPTER_VERSION=1;
 const MINIMAL_MODE_ADAPTER_VERSION=2;
 const HP_CAP_PRESENTATION_VERSION=4;
 const HP_CAP_FALLBACK_OWNER_VERSION=1;
 const PROGRESS_EVENT_PRESENTATION_VERSION=1;
 const CATCH_UP_SYNC_VERSION=1;
 const RUN_SUMMARY_PRESENTATION_VERSION=1;
 const TITLE_POST_FLOW_SEQUENCE_VERSION=1;
 const STOP_REASON_PRESENTATION_VERSION=2;
 const RUN_IDENTITY_GUARD_VERSION=1;
 const TOTALS_FAIL_CLOSED_VERSION=1;
 const VIP20_DEATH_PROTECTION_PRESENTATION_VERSION=1;
 const ADAPTER_ID="third-world-mainline";
 const EVENT_MODAL_ID="thirdWorldProgressEventModal";
 const SUMMARY_MODAL_ID="thirdWorldRunSummaryModal";
 const TITLE_HOLD_SOURCE="third-world-player-flow";
 let activeContext=null;
 let retainedContext=null;
 let flowPromise=null;
 let adapterRegistered=false;
 let environmentSubscribed=false;
 let eventModalResolver=null;
 let summaryModalResolver=null;

 function whole(value){const n=Math.floor(Number(value));return Number.isFinite(n)?Math.max(0,n):0;}
 function clamp(value,min,max){return Math.max(min,Math.min(max,Number(value)||0));}
 function fmt(value){return whole(value).toLocaleString();}
 function pct(value){return `${clamp(value,0,100).toFixed(2)}%`;}
 function suppressionPct(value){return `${clamp(value,0,100).toFixed(3)}%`;}
 function runMaxDeaths(){return Math.max(1,whole(window.THIRD_WORLD_RUN_MAX_DEATHS||500));}
 function esc(value){return String(value??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[ch]));}
 function runSnapshot(){return typeof window.thirdWorldContinuousRunSnapshot==="function"?window.thirdWorldContinuousRunSnapshot():null;}
 function bossDefinition(index){return typeof window.thirdWorldBoss==="function"?window.thirdWorldBoss(index):(Array.isArray(window.THIRD_WORLD_BOSS_DEFINITIONS)?window.THIRD_WORLD_BOSS_DEFINITIONS[index]:null);}
 function bossProgress(index){return typeof window.thirdWorldBossProgressSnapshot==="function"?window.thirdWorldBossProgressSnapshot(index,state):null;}
 function levelProgress(){return typeof window.levelProgressSnapshot==="function"?window.levelProgressSnapshot(state):{atCap:false,exp:whole(state?.exp),need:0};}
 function displayContext(){return activeContext||retainedContext;}
 function activeFlow(){return !!activeContext&&activeContext.active===true;}
 function minimalOpen(){return window.getMinimalModeAdapterId?.()===ADAPTER_ID&&window.isMinimalModeOpen?.()===true;}
 function syncMinimal(){if(minimalOpen()&&typeof window.syncMinimalMode==="function")window.syncMinimalMode();}
 function setTitlePostFlowHold(held){return typeof window.setPlayerTitlePostFlowHold==="function"?window.setPlayerTitlePostFlowHold(TITLE_HOLD_SOURCE,held):null;}
 async function drainPostFlowStories(){if(typeof window.civilizationStoryProgress?.drainThirdWorldPostFlowStories==="function")return await window.civilizationStoryProgress.drainThirdWorldPostFlowStories();window.civilizationStoryProgress?.resume?.();return Object.freeze({ok:false,deferred:true,reason:"story-post-flow-owner-missing"});}
 function capFromCombat(combat,deathsOverride=null){
  const baseMax=Math.max(1,whole(combat?.playerMaxHp)),ratioCap=Math.max(1,Math.min(baseMax,whole(combat?.playerHealCap||baseMax))),runtime=runSnapshot(),deaths=whole(deathsOverride??displayContext()?.deaths??runtime?.deaths),coreAtStart=runtime?.coreLevelAtStart;
  if(typeof window.thirdWorldRunHpCapSnapshot==="function"){
   const formal=window.thirdWorldRunHpCapSnapshot(deaths,undefined,baseMax,coreAtStart==null?null:coreAtStart);
   const formalCap=Number(formal?.hpCap),formalPercent=Number(formal?.hpCapPercent);
   if(Number.isFinite(formalCap)&&Number.isFinite(formalPercent))return {baseMax,cap:Math.max(1,Math.min(baseMax,whole(formalCap))),percent:clamp(formalPercent,0,100),source:"run-owner"};
  }
  return {baseMax,cap:ratioCap,percent:baseMax>0?ratioCap/baseMax*100:100,source:"combat-ratio"};
 }
 function coreCombat(step){return step?.combat?.combat&&typeof step.combat.combat==="object"?step.combat.combat:null;}
 function publicContext(source=activeContext){
  if(!source)return null;
  return Object.freeze({
   version:VERSION,
   runId:source.runId==null?null:whole(source.runId),
   active:source.active===true,
   bossIndex:whole(source.bossIndex),
   bossName:String(source.bossName||"高維存在"),
   battleNumber:Math.max(1,whole(source.battleNumber||1)),
   deaths:whole(source.deaths),
   maxDeaths:runMaxDeaths(),
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
  const combat=coreCombat(step),summary=step?.summary||{},boss=bossDefinition(summary.bossIndex??activeContext.bossIndex),formalCap=step?.snapshot?.hpCap||{},deathsAfter=whole(step?.deathsAfter??step?.snapshot?.deaths??activeContext.deaths),deathsAtBattleStart=Math.max(0,deathsAfter-(step?.countsDeath===true?1:0)),derivedCap=capFromCombat(combat,deathsAtBattleStart);
  activeContext.bossIndex=whole(summary.bossIndex??activeContext.bossIndex);
  activeContext.bossName=String(boss?.name||step?.combat?.bossName||combat?.e?.name||activeContext.bossName||"高維存在");
  activeContext.battleNumber=Math.max(1,whole(summary.battleNumber||activeContext.battleNumber||1));
  activeContext.deaths=deathsAtBattleStart;
  activeContext.hpCap=Number.isFinite(Number(formalCap.hpCap))?whole(formalCap.hpCap):derivedCap.cap;
  activeContext.hpCapPercent=Number.isFinite(Number(formalCap.hpCapPercent))?clamp(formalCap.hpCapPercent,0,100):derivedCap.percent;
  activeContext.currentCombat=combat;
  activeContext.stopReason=String(step?.terminalReason||"");
  return combat;
 }
 function refreshContextAfterSettledStep(step){
  if(!activeContext)return;
  const snapshot=step?.snapshot||{},cap=snapshot?.hpCap||{},settledHp=Number(step?.settlement?.combatEndHp);
  activeContext.deaths=whole(step?.deathsAfter??snapshot?.deaths??activeContext.deaths);
  if(Number.isFinite(Number(cap.hpCap)))activeContext.hpCap=whole(cap.hpCap);
  if(Number.isFinite(Number(cap.hpCapPercent)))activeContext.hpCapPercent=clamp(cap.hpCapPercent,0,100);
  if(activeContext.currentCombat&&typeof activeContext.currentCombat==="object"){
   const nextCap=Number.isFinite(Number(cap.hpCap))?whole(cap.hpCap):whole(activeContext.currentCombat.playerHealCap||activeContext.currentCombat.playerMaxHp);
   activeContext.currentCombat={...activeContext.currentCombat,playerStartHp:nextCap,playerHealCap:nextCap,enemyStartHp:Number.isFinite(settledHp)?Math.max(0,whole(settledHp)):activeContext.currentCombat.enemyStartHp};
  }
 }
 function presentationResult(combat){
  const cap=capFromCombat(combat,displayContext()?.deaths),playerStart=Math.max(0,Math.min(cap.cap,whole(combat?.playerStartHp??cap.cap)));
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
    sections.push(`<div class="notice"><b>戰線偏離｜暫不可挑戰</b><div class="muted" style="margin-top:6px;line-height:1.55">${esc(boss?.name||"此高維存在")} 已超前目前 5% 戰線${gap>0?`（${fmt(gap)} HP）`:""}。本場已完整結算，但下一場已鎖定；請先推進其他存活高維存在。</div></div>`);
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
  const reasonCopy=reason==="boss-defeated"?"Boss 已擊破，本輪連戰結束。":reason==="stage-crossed"?"跨入新強化階段，本輪連戰結束。":reason==="five-point-front"?"5% 戰線鎖定，本輪連戰結束。":reason==="progress-event"?"高維整體進度已推進，本輪連戰結束。":"高維進度事件已結算。";
  modal.innerHTML=`<div class="modal-box"><h3>高維戰線事件</h3><div style="display:grid;gap:10px">${sections.join("")}</div><div class="muted" style="margin-top:12px">${esc(reasonCopy)}確認後可重新選擇高維存在開始下一輪。</div><div class="controls" style="margin-top:16px"><button class="btn primary" type="button" onclick="closeThirdWorldProgressEventModal()">確認</button></div></div>`;
  modal.classList.add("show");
  return new Promise(resolve=>{eventModalResolver=resolve;});
 }
 function stopReasonPresentation(reason=""){
  const value=String(reason||""),meta=typeof window.continuousRunStopReasonMeta==="function"?window.continuousRunStopReasonMeta(value):{category:"other"};
  const exact={manual:"玩家手動停止",stopped:"玩家手動停止","death-limit":`已達本輪 ${runMaxDeaths()} 次死亡上限`,"boss-defeated":"高維存在已擊破","stage-crossed":"Stage 已改變","five-point-front":"戰線進度已更新","progress-event":"戰線進度已更新","active-runtime":"其他正式流程接管","challenge-blocked":"挑戰條件已變更","combat-incomplete":"戰鬥未完整完成","settlement-failed":"正式結算失敗","owner-missing":"必要系統未載入","battle-error":"連戰流程發生異常","pagehide":"頁面已離開","reload":"頁面重新載入","world-transition":"世界切換"};
  const fallback={completion:"目標完成",progression:"戰線進度已更新",limit:"達到本輪限制",interruption:"連戰中斷",error:"流程異常",other:"連戰結束"};
  return Object.freeze({version:STOP_REASON_PRESENTATION_VERSION,reason:value,category:String(meta?.category||"other"),label:exact[value]||fallback[meta?.category]||fallback.other});
 }
 function summaryTotals(result){
  const direct=result?.totals;
  if(direct&&Number(direct.version)===Number(window.THIRD_WORLD_RUN_TOTALS_VERSION||1))return Object.freeze({complete:true,source:"run-totals",effectivePermanentDamage:whole(direct.effectivePermanentDamage),xp:whole(direct.xp),dimensionalStrings:whole(direct.dimensionalStrings),itemCount:whole(direct.itemCount)});
  if(result?.resultsTruncated===true)return Object.freeze({complete:false,source:"truncated-history",effectivePermanentDamage:null,xp:null,dimensionalStrings:null,itemCount:null});
  const fallback=(Array.isArray(result?.results)?result.results:[]).reduce((acc,row)=>{acc.effectivePermanentDamage+=whole(row?.effectivePermanentDamage);acc.xp+=whole(row?.xp);acc.dimensionalStrings+=whole(row?.dimensionalStrings);acc.itemCount+=whole(row?.itemCount);return acc;},{effectivePermanentDamage:0,xp:0,dimensionalStrings:0,itemCount:0});
  return Object.freeze({complete:true,source:"complete-history",...fallback});
 }
 function summaryValue(totals,key,{prefix="",suffix=""}={}){return totals?.complete===true?`${prefix}${fmt(totals[key])}${suffix}`:"無法完整還原";}
 function ensureRunSummaryModal(){
  if(typeof document==="undefined")return null;
  let modal=document.getElementById(SUMMARY_MODAL_ID);
  if(modal)return modal;
  modal=document.createElement("div");modal.id=SUMMARY_MODAL_ID;modal.className="modal";modal.setAttribute("role","dialog");modal.setAttribute("aria-modal","true");document.body.appendChild(modal);return modal;
 }
 function closeRunSummaryModal(){
  const modal=typeof document!=="undefined"?document.getElementById(SUMMARY_MODAL_ID):null;
  if(modal){modal.classList.remove("show");modal.remove();}
  const resolve=summaryModalResolver;summaryModalResolver=null;if(typeof resolve==="function")resolve(true);return true;
 }
 function presentRunSummary(result,finalSnapshot){
  const final=finalSnapshot||null;if(!final)return Promise.resolve(false);
  const reason=String(final.stopReason||result?.lastResult?.terminalReason||result?.reason||"");
  if(["pagehide","reload"].includes(reason))return Promise.resolve(false);
  const bossIndex=whole(final.bossIndex??result?.lastResult?.summary?.bossIndex),boss=bossDefinition(bossIndex),progress=bossProgress(bossIndex),totals=summaryTotals(result),stop=stopReasonPresentation(reason),battles=Math.max(0,whole(result?.battles??final.battles)),deaths=whole(final.deaths),vip20Protections=whole(final.vip20Protections),remainingHp=Math.max(0,whole(progress?.currentHp)),remainingPercent=Number.isFinite(Number(progress?.remainingPercent))?Number(progress.remainingPercent):null;
  closeRunSummaryModal();const modal=ensureRunSummaryModal();if(!modal)return Promise.resolve(false);
  const remainingText=remainingPercent==null?fmt(remainingHp):`${fmt(remainingHp)}（${pct(remainingPercent)}）`,totalsNotice=totals.complete===true?"":`<div class="muted" style="margin-top:10px">本輪完整 totals 不可用，且最近戰鬥摘要已截斷；為避免顯示錯誤總量，本輪收益欄位不進行推算。</div>`,vip20Notice=deaths>0?`<div class="notice" style="margin-top:12px"><b>VIP20｜裝備保護</b><div class="muted" style="margin-top:6px;line-height:1.55">本輪死亡 ${fmt(deaths)} 次；原本的 30% 死亡裝備遺失判定仍照常進行。${vip20Protections>0?`其中 ${fmt(vip20Protections)} 次判定原本會遺失裝備，已由 VIP20 全部阻止。`:`本輪沒有抽中裝備遺失，但 VIP20 保護仍持續生效。`}第三紀元的死亡裝備保護來自 VIP20 特權。</div></div>`:"";
  modal.innerHTML=`<div class="modal-box"><h3>高維紀元・連續戰鬥結算</h3><div class="settlement-section"><div class="settlement-section-title">${esc(boss?.name||"高維存在")}</div><div class="notice"><b>${esc(stop.label)}</b></div><div class="stats" style="margin-top:10px"><div class="stat">本輪戰鬥<b>${fmt(battles)} 場</b></div><div class="stat">本輪死亡<b>${fmt(deaths)} / ${fmt(runMaxDeaths())}</b></div><div class="stat">永久削血<b>${summaryValue(totals,"effectivePermanentDamage")}</b></div><div class="stat">EXP<b>${summaryValue(totals,"xp",{prefix:"+"})}</b></div><div class="stat">維度之弦<b>${summaryValue(totals,"dimensionalStrings",{prefix:"+"})}</b></div><div class="stat">裝備取得<b>${summaryValue(totals,"itemCount",{suffix:" 件"})}</b></div><div class="stat">Boss 剩餘 HP<b>${remainingText}</b></div></div>${totalsNotice}${vip20Notice}</div><div class="controls"><button class="btn primary" type="button" onclick="closeThirdWorldRunSummaryModal()">確認</button></div></div>`;
  modal.classList.add("show");return new Promise(resolve=>{summaryModalResolver=resolve;});
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
 function beginCatchUpUi(){
  if(!activeContext)return false;
  activeContext.catchingUp=true;
  if(typeof render==="function")render();
  syncMinimal();
  syncCatchUpNotice();
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
 function registerEnvironmentSync(){
  if(typeof window.backgroundProgressOnEnvironmentChange!=="function")return false;
  window.backgroundProgressOnEnvironmentChange(isBackground=>{
   if(isBackground||!activeContext)return;
   if(typeof window.backgroundProgressHasCatchUpCredit==="function"&&window.backgroundProgressHasCatchUpCredit("third-world")===true)beginCatchUpUi();
  });
  environmentSubscribed=true;
  return true;
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
   try{await window.animateStructuredCombatPresentation(combat,{clearAfter:true,clearReason:"third-world-player-battle-end",onUpdate:syncMinimal});}
   finally{if(activeContext)activeContext.presenting=false;}
  }
  if(step?.terminalReason)finishMinimalMode();
  if(Array.isArray(step?.settlement?.eventSequence)&&step.settlement.eventSequence.length||step?.settlement?.completionReady===true)await presentProgressEvents(step);
 }
 function updateContextFromFinalSnapshot(expectedRunId){
  if(!activeContext)return null;
  const final=typeof window.thirdWorldLastFinishedRunSnapshot==="function"?window.thirdWorldLastFinishedRunSnapshot(expectedRunId):null;
  if(final){activeContext.deaths=whole(final.deaths);activeContext.stopReason=String(final.stopReason||activeContext.stopReason||"");}
  return final;
 }
 function finishMinimalMode(){
  if(!minimalOpen())return;
  if(typeof window.setMinimalModeState==="function")window.setMinimalModeState("stopped");
  syncMinimal();
 }
 async function startFlow(value){
  const index=whole(value);
  if(flowPromise)return Object.freeze({ok:false,reason:"高維玩家連戰流程已在執行中。"});
  if(typeof window.runThirdWorldContinuousLoop!=="function")return Object.freeze({ok:false,reason:"高維連戰 runtime 尚未載入完整。"});
  const boss=bossDefinition(index);
  retainedContext=null;
  setTitlePostFlowHold(true);
  let loopPromise;
  try{loopPromise=window.runThirdWorldContinuousLoop(index,{preparePresentation:false,logs:true,onBattle:presentStep,onCatchUpFinal:async payload=>finishCatchUpUi(payload)});}catch(error){setTitlePostFlowHold(false);throw error;}
  const snapshot=runSnapshot();
  if(snapshot?.active!==true||whole(snapshot.bossIndex)!==index){
   try{return await loopPromise;}finally{setTitlePostFlowHold(false);}
  }
  const cap=snapshot?.hpCap||{},runId=snapshot?.runId==null?null:whole(snapshot.runId);
  activeContext={runId,active:true,bossIndex:index,bossName:String(boss?.name||"高維存在"),battleNumber:Math.max(1,whole(snapshot?.battles)+1),deaths:whole(snapshot?.deaths),hpCap:whole(cap.hpCap),hpCapPercent:clamp(cap.hpCapPercent??100,0,100),currentCombat:null,presenting:false,catchingUp:false,catchUpCompleted:0,stopReason:""};
  if(typeof render==="function")render();
  flowPromise=loopPromise;
  let completedResult=null,finalSnapshot=null;
  try{completedResult=await flowPromise;return completedResult;}
  finally{
   finalSnapshot=updateContextFromFinalSnapshot(runId);
   if(activeContext){activeContext.active=false;activeContext.catchingUp=false;activeContext.catchUpCompleted=0;retainedContext={...activeContext};}
   activeContext=null;
   if(typeof document!=="undefined")document.getElementById("thirdWorldCatchUpStatus")?.remove();
   if(typeof window.clearCombatPresentation==="function")window.clearCombatPresentation("third-world-player-flow-end");
   finishMinimalMode();
   flowPromise=null;
   if(typeof render==="function")render();
   try{
    await presentRunSummary(completedResult,finalSnapshot);
    await drainPostFlowStories();
   }catch(error){console.error("Third-world post-flow presentation failed",error);window.civilizationStoryProgress?.resume?.();}
   finally{
    setTitlePostFlowHold(false);
    if(typeof window.flushPendingPlayerTitleNoticeAfterFlow==="function")window.flushPendingPlayerTitleNoticeAfterFlow({source:"third-world-player-flow"});
   }
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
   <div class="main-minimal-mode-block"><div class="main-minimal-mode-label">死亡</div><div class="main-minimal-mode-value" data-third-world-minimal-deaths>${whole(ctx?.deaths)} / ${runMaxDeaths()}</div></div>
   <div class="main-minimal-mode-block"><div class="main-minimal-mode-label">目前最大 HP</div><div class="main-minimal-mode-value" data-third-world-minimal-cap>${suppressionPct(ctx?.hpCapPercent??100)}</div></div>
   <div class="main-minimal-mode-block"><div class="main-minimal-mode-label">角色</div><div class="main-minimal-mode-value" data-third-world-minimal-level>Lv.${whole(state?.level)}</div></div>
   <div class="main-minimal-mode-block main-minimal-mode-stats"><div data-third-world-minimal-exp>EXP　${expText()}</div><div data-third-world-minimal-strings>維度之弦　${fmt(state?.thirdWorld?.dimensionalStrings)}</div></div>`;
 }
 function syncMinimalValues(root,mode="running"){
  const ctx=displayContext(),enemy=root.querySelector("[data-third-world-minimal-enemy]"),round=root.querySelector("[data-third-world-minimal-round]"),deaths=root.querySelector("[data-third-world-minimal-deaths]"),cap=root.querySelector("[data-third-world-minimal-cap]"),level=root.querySelector("[data-third-world-minimal-level]"),exp=root.querySelector("[data-third-world-minimal-exp]"),strings=root.querySelector("[data-third-world-minimal-strings]"),note=root.querySelector("[data-main-minimal-mode-note]");
  if(enemy)enemy.textContent=ctx?.bossName||"高維存在";
  if(round)round.textContent=`第 ${Math.max(1,whole(ctx?.battleNumber||1))} 場`;
  if(deaths)deaths.textContent=`${whole(ctx?.deaths)} / ${runMaxDeaths()}`;
  if(cap)cap.textContent=suppressionPct(ctx?.hpCapPercent??100);
  if(level)level.textContent=`Lv.${whole(state?.level)}`;
  if(exp)exp.textContent=`EXP　${expText()}`;
  if(strings)strings.textContent=`維度之弦　${fmt(state?.thirdWorld?.dimensionalStrings)}`;
  if(note&&mode==="stopped"){note.textContent=stopReasonPresentation(ctx?.stopReason).label;note.hidden=false;}
 }
 function registerAdapter(){
  if(typeof window.registerMinimalModeAdapter!=="function")return false;
  adapterRegistered=window.registerMinimalModeAdapter(ADAPTER_ID,{isActive:activeFlow,runningStatus:"高維連戰持續進行中",centerClass:"",contentHtml:minimalContentHtml,sync:syncMinimalValues})===true;
  return adapterRegistered;
 }
 function validate(){
  const errors=[];
  if(typeof window.runThirdWorldContinuousLoop!=="function"||typeof window.stopThirdWorldContinuousRun!=="function")errors.push("THIRD_WORLD_RUN_OWNER_MISSING");
  if(typeof window.prepareCombatPresentation!=="function"||typeof window.animateStructuredCombatPresentation!=="function"||Number(window.COMBAT_STRUCTURED_PRESENTATION_VERSION)<2)errors.push("SHARED_COMBAT_PRESENTATION_OWNER_MISSING");
  if(typeof window.registerMinimalModeAdapter!=="function"||typeof window.openMinimalMode!=="function"||Number(window.MINIMAL_MODE_SHARED_API_VERSION)!==1)errors.push("SHARED_MINIMAL_MODE_OWNER_MISSING");
  if(typeof window.thirdWorldBoss!=="function"||typeof window.thirdWorldBossProgressSnapshot!=="function"||typeof window.thirdWorldTitleDefinition!=="function"||!Array.isArray(window.THIRD_WORLD_BOSS_ABILITY_DEFINITIONS))errors.push("THIRD_WORLD_EVENT_PRESENTATION_OWNER_MISSING");
  if(typeof window.thirdWorldRunBackgroundPolicySnapshot!=="function"||Number(window.THIRD_WORLD_RUN_BACKGROUND_GM_GATE_VERSION)!==1||Number(window.THIRD_WORLD_RUN_FOREGROUND_WAIT_VERSION)!==1)errors.push("THIRD_WORLD_BACKGROUND_POLICY_OWNER_MISSING");
  if(Number(window.GM_BACKGROUND_BATTLE_THIRD_WORLD_GATE_VERSION)!==1)errors.push("GM_BACKGROUND_THIRD_WORLD_GATE_MISSING");
  if(typeof window.continuousRunStopReasonMeta!=="function"||Number(window.CONTINUOUS_RUN_STOP_REASON_SEMANTICS_VERSION)!==2)errors.push("SHARED_STOP_REASON_OWNER_MISSING");
  if(typeof window.flushPendingPlayerTitleNoticeAfterFlow!=="function"||typeof window.setPlayerTitlePostFlowHold!=="function"||Number(window.PLAYER_TITLE_POST_FLOW_HOLD_VERSION)!==1)errors.push("SHARED_TITLE_POST_FLOW_MISSING");
  if(Number(window.THIRD_WORLD_RUN_TOTALS_VERSION)!==1)errors.push("RUN_TOTALS_CONTRACT_MISSING");
  if(Number(window.THIRD_WORLD_RUN_IDENTITY_VERSION)!==1||Number(window.THIRD_WORLD_RUN_EXCEPTION_CLEANUP_VERSION)!==1||Number(window.THIRD_WORLD_RUN_LAST_FINISHED_SNAPSHOT_VERSION)!==2)errors.push("RUN_IDENTITY_CONTRACT_MISSING");
  if(typeof window.thirdWorldRunHpCapSnapshot!=="function")errors.push("HP_CAP_FORMAL_FALLBACK_OWNER_MISSING");
  if(environmentSubscribed!==true)errors.push("BACKGROUND_ENVIRONMENT_SYNC_MISSING");
  if(runMaxDeaths()!==500)errors.push("MAX_DEATHS_CONTRACT");
  if(adapterRegistered!==true)errors.push("MINIMAL_MODE_ADAPTER_REGISTRATION");
  const manual=stopReasonPresentation("manual"),boss=stopReasonPresentation("boss-defeated"),stage=stopReasonPresentation("stage-crossed"),front=stopReasonPresentation("five-point-front"),limit=stopReasonPresentation("death-limit"),battleError=stopReasonPresentation("battle-error");
  if(manual.category!=="interruption"||boss.category!=="completion"||stage.category!=="progression"||front.label!=="戰線進度已更新"||stage.label!=="Stage 已改變"||limit.category!=="limit"||limit.label!=="已達本輪 500 次死亡上限"||battleError.category!=="error")errors.push("STOP_REASON_PRESENTATION_SEMANTICS");
  const completeFallback=summaryTotals({results:[{effectivePermanentDamage:1,xp:2,dimensionalStrings:3,itemCount:4}],resultsTruncated:false}),truncatedFallback=summaryTotals({results:[{effectivePermanentDamage:1,xp:2,dimensionalStrings:3,itemCount:4}],resultsTruncated:true});
  if(completeFallback.complete!==true||completeFallback.effectivePermanentDamage!==1||truncatedFallback.complete!==false||truncatedFallback.effectivePermanentDamage!==null)errors.push("RUN_TOTALS_FAIL_CLOSED");
  const flowSource=Function.prototype.toString.call(startFlow),finalSource=Function.prototype.toString.call(updateContextFromFinalSnapshot),summarySource=Function.prototype.toString.call(presentRunSummary),eventSource=Function.prototype.toString.call(presentProgressEvents),stepSource=Function.prototype.toString.call(presentStep),minimalSource=Function.prototype.toString.call(syncMinimalValues),refreshSource=Function.prototype.toString.call(refreshContextFromStep),capSource=Function.prototype.toString.call(capFromCombat);
  const summaryIndex=flowSource.indexOf("await presentRunSummary"),storyIndex=flowSource.indexOf("await drainPostFlowStories"),releaseIndex=flowSource.indexOf("setTitlePostFlowHold(false)",storyIndex),titleIndex=flowSource.indexOf("flushPendingPlayerTitleNoticeAfterFlow",storyIndex);
  if(summaryIndex<0||storyIndex<summaryIndex||releaseIndex<storyIndex||titleIndex<releaseIndex)errors.push("POST_FLOW_SEQUENCE");
  if(flowSource.indexOf("runId")<0||finalSource.indexOf("expectedRunId")<0||finalSource.indexOf("thirdWorldLastFinishedRunSnapshot(expectedRunId)")<0)errors.push("RUN_IDENTITY_GUARD");
  if(flowSource.includes("startThirdWorldContinuousRun"))errors.push("DUPLICATE_START_OWNER");
  if(summarySource.includes("停止類型")||eventSource.includes("5pp"))errors.push("PLAYER_INTERNAL_TERMINOLOGY_LEAK");
  if(!stepSource.includes("if(step?.terminalReason)finishMinimalMode()")||!minimalSource.includes("mode===\"stopped\"")||!minimalSource.includes("stopReasonPresentation"))errors.push("MINIMAL_STOP_PRESENTATION_WIRING");
  if(suppressionPct(99.908)!=="99.908%")errors.push("HP_CAP_THREE_DECIMAL_PRESENTATION");
  if(!refreshSource.includes("snapshot?.hpCap")||!refreshSource.includes("formalCap.hpCapPercent"))errors.push("HP_CAP_FORMAL_PERCENT_OWNER");
  if(!capSource.includes("thirdWorldRunHpCapSnapshot")||!capSource.includes("source:\"run-owner\"")||!capSource.includes("source:\"combat-ratio\""))errors.push("HP_CAP_FALLBACK_OWNER_WIRING");
  return Object.freeze({version:VERSION,postFlowCoordinatorVersion:POST_FLOW_COORDINATOR_VERSION,storyPostFlowSequenceVersion:STORY_POST_FLOW_SEQUENCE_VERSION,titleNoticeHoldVersion:TITLE_NOTICE_HOLD_VERSION,presentationAdapterVersion:PRESENTATION_ADAPTER_VERSION,minimalModeAdapterVersion:MINIMAL_MODE_ADAPTER_VERSION,hpCapPresentationVersion:HP_CAP_PRESENTATION_VERSION,hpCapFallbackOwnerVersion:HP_CAP_FALLBACK_OWNER_VERSION,progressEventPresentationVersion:PROGRESS_EVENT_PRESENTATION_VERSION,catchUpSyncVersion:CATCH_UP_SYNC_VERSION,runSummaryPresentationVersion:RUN_SUMMARY_PRESENTATION_VERSION,titlePostFlowSequenceVersion:TITLE_POST_FLOW_SEQUENCE_VERSION,stopReasonPresentationVersion:STOP_REASON_PRESENTATION_VERSION,runIdentityGuardVersion:RUN_IDENTITY_GUARD_VERSION,totalsFailClosedVersion:TOTALS_FAIL_CLOSED_VERSION,passed:errors.length===0,errors:Object.freeze(errors)});
 }

 registerAdapter();
 registerEnvironmentSync();
 window.startThirdWorldPlayerFlow=startFlow;
 window.stopThirdWorldPlayerFlow=stopFlow;
 window.getThirdWorldPlayerFlowContext=function(){return publicContext(activeContext);};
 window.openThirdWorldMinimalMode=function(){return typeof window.openMinimalMode==="function"?window.openMinimalMode(ADAPTER_ID):false;};
 window.closeThirdWorldProgressEventModal=closeProgressEventModal;
 window.closeThirdWorldRunSummaryModal=closeRunSummaryModal;
 window.thirdWorldRunStopReasonPresentation=stopReasonPresentation;
 window.THIRD_WORLD_PLAYER_FLOW_VERSION=VERSION;
 window.THIRD_WORLD_VIP20_DEATH_PROTECTION_PRESENTATION_VERSION=VIP20_DEATH_PROTECTION_PRESENTATION_VERSION;
 window.THIRD_WORLD_PLAYER_FLOW_POST_FLOW_COORDINATOR_VERSION=POST_FLOW_COORDINATOR_VERSION;
 window.THIRD_WORLD_PLAYER_FLOW_STORY_POST_FLOW_SEQUENCE_VERSION=STORY_POST_FLOW_SEQUENCE_VERSION;
 window.THIRD_WORLD_PLAYER_FLOW_TITLE_NOTICE_HOLD_VERSION=TITLE_NOTICE_HOLD_VERSION;
 window.THIRD_WORLD_PLAYER_FLOW_PRESENTATION_ADAPTER_VERSION=PRESENTATION_ADAPTER_VERSION;
 window.THIRD_WORLD_PLAYER_FLOW_MINIMAL_MODE_ADAPTER_VERSION=MINIMAL_MODE_ADAPTER_VERSION;
 window.THIRD_WORLD_PLAYER_FLOW_HP_CAP_PRESENTATION_VERSION=HP_CAP_PRESENTATION_VERSION;
 window.THIRD_WORLD_PLAYER_FLOW_HP_CAP_FALLBACK_OWNER_VERSION=HP_CAP_FALLBACK_OWNER_VERSION;
 window.THIRD_WORLD_PLAYER_FLOW_PROGRESS_EVENT_PRESENTATION_VERSION=PROGRESS_EVENT_PRESENTATION_VERSION;
 window.THIRD_WORLD_PLAYER_FLOW_CATCH_UP_SYNC_VERSION=CATCH_UP_SYNC_VERSION;
 window.THIRD_WORLD_PLAYER_FLOW_RUN_SUMMARY_PRESENTATION_VERSION=RUN_SUMMARY_PRESENTATION_VERSION;
 window.THIRD_WORLD_PLAYER_FLOW_TITLE_POST_FLOW_SEQUENCE_VERSION=TITLE_POST_FLOW_SEQUENCE_VERSION;
 window.THIRD_WORLD_PLAYER_FLOW_STOP_REASON_PRESENTATION_VERSION=STOP_REASON_PRESENTATION_VERSION;
 window.THIRD_WORLD_PLAYER_FLOW_RUN_IDENTITY_GUARD_VERSION=RUN_IDENTITY_GUARD_VERSION;
 window.THIRD_WORLD_PLAYER_FLOW_TOTALS_FAIL_CLOSED_VERSION=TOTALS_FAIL_CLOSED_VERSION;
 window.THIRD_WORLD_PLAYER_FLOW_ADAPTER_ID=ADAPTER_ID;
 window.THIRD_WORLD_PLAYER_FLOW_INTEGRITY=validate();
 if(!window.THIRD_WORLD_PLAYER_FLOW_INTEGRITY.passed)console.error("[文明戰線] Third-world player flow integrity error",window.THIRD_WORLD_PLAYER_FLOW_INTEGRITY.errors);
})();
