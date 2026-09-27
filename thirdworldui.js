(function(){
 const VERSION=5;
 const CORE_UI_VERSION=2;
 const CORE_FEEDBACK_LIFECYCLE_VERSION=1;
 const CORE_CONFIRMATION_VERSION=1;
 const RUN_ENTRY_UI_VERSION=1;
 const THREE_COLUMN_HEADER_VERSION=1;
 let commonAbilitiesOpen=false;
 let coreFeedback="";
 let coreFeedbackOk=false;
 let pendingCoreConfirmation=null;
 let playerRunPromise=null;

 function n(value){const x=Number(value);return Number.isFinite(x)?x:0;}
 function whole(value){return Math.max(0,Math.floor(n(value)));}
 function pct(value,digits=2){return `${Math.max(0,Math.min(100,n(value))).toFixed(digits)}%`;}
 function fmt(value){return whole(value).toLocaleString();}
 function currentPhase(){return typeof window.currentWorldPhase==="function"?Number(window.currentWorldPhase(state)):state?.thirdWorld?.entered===true?3:state?.secondWorld?.entered===true?2:1;}
 function expectedBossCount(){return Math.max(0,whole(window.THIRD_WORLD_BOSS_COUNT));}
 function expectedAbilityCount(){return Math.max(0,whole(window.THIRD_WORLD_BOSS_ABILITY_COUNT));}
 function bossDefs(){return Array.isArray(window.THIRD_WORLD_BOSS_DEFINITIONS)?window.THIRD_WORLD_BOSS_DEFINITIONS:[];}
 function abilityDefs(){return Array.isArray(window.THIRD_WORLD_BOSS_ABILITY_DEFINITIONS)?window.THIRD_WORLD_BOSS_ABILITY_DEFINITIONS:[];}
 function aggregate(){return typeof window.thirdWorldBossAggregateSnapshot==="function"?window.thirdWorldBossAggregateSnapshot(state):null;}
 function bossSnapshot(index){return typeof window.thirdWorldBossProgressSnapshot==="function"?window.thirdWorldBossProgressSnapshot(index,state):null;}
 function titleDefinition(){return typeof window.thirdWorldCurrentTitleDefinition==="function"?window.thirdWorldCurrentTitleDefinition(state):null;}
 function coreSnapshot(){return typeof window.thirdWorldCoreSnapshot==="function"?window.thirdWorldCoreSnapshot(state):null;}
 function corePlan(){return typeof window.thirdWorldCoreInjectionPlan==="function"?window.thirdWorldCoreInjectionPlan(state):null;}
 function coreLevel(){return Math.max(0,Math.min(whole(window.THIRD_WORLD_CORE_MAX_LEVEL||10),whole(state?.thirdWorld?.coreLevel)));}
 function strings(){return whole(state?.thirdWorld?.dimensionalStrings);}
 function maxCore(){return Math.max(0,whole(window.THIRD_WORLD_CORE_MAX_LEVEL||10));}
 function suppressionPerDeath(level){return typeof window.thirdWorldSuppressionPerDeathPoints==="function"?n(window.thirdWorldSuppressionPerDeathPoints(level)):null;}
 function runSnapshot(){return typeof window.thirdWorldContinuousRunSnapshot==="function"?window.thirdWorldContinuousRunSnapshot():{active:false,bossIndex:-1,deaths:0,battles:0,hpCap:null};}
 function clearCoreFeedback(){coreFeedback="";coreFeedbackOk=false;return true;}
 function clearCoreFeedbackOnFreshEntry(){if(typeof document==="undefined")return false;if(document.querySelector(".third-world-adventure-screen"))return false;return clearCoreFeedback();}
 function specializationPresentation(boss){return typeof window.thirdWorldBossSpecializationPresentation==="function"?(window.thirdWorldBossSpecializationPresentation(boss)||{label:"高維存在",effect:"個體特化"}):{label:"高維存在",effect:"個體特化"};}
 function activeAbilityNames(snapshot){if(!snapshot?.abilities||typeof snapshot.abilities!=="object")return [];return abilityDefs().filter(def=>snapshot.abilities?.[def.id]?.active===true).map(def=>def.name);}
 function challengePresentation(snapshot){
  if(snapshot?.defeated)return {className:"defeated",label:"已擊破",detail:"永久 HP 已歸零"};
  const status=snapshot?.challengeStatus||{};
  if(status.allowed===true&&status.reason==="last-survivor")return {className:"ready final",label:"最終存活・可挑戰",detail:"僅存一名高維存在，5pp 限制自然解除"};
  if(status.allowed===true)return {className:"ready",label:"可挑戰",detail:"目前位於合法 5pp 戰線內"};
  if(status.reason==="five-point-front")return {className:"blocked",label:"戰線偏離｜暫不可挑戰",detail:"請先推進其他存活高維存在"};
  return {className:"blocked",label:"正式挑戰未開放",detail:"目前世界狀態不允許正式挑戰"};
 }
 function actionHtml(snapshot,status,index){
  const run=runSnapshot();
  if(snapshot?.defeated)return `<button class="btn third-world-boss-action" type="button" disabled>已擊破</button>`;
  if(run.active===true){
   if(whole(run.bossIndex)===whole(index))return `<button class="btn danger third-world-boss-action third-world-boss-action-stop" type="button" onclick="stopThirdWorldRunFromPlayerUi()">停止連續戰鬥</button>`;
   return `<button class="btn third-world-boss-action" type="button" disabled>其他高維存在連戰進行中</button>`;
  }
  if(status.className.includes("blocked"))return `<button class="btn third-world-boss-action" type="button" disabled>暫不可挑戰</button>`;
  return `<button class="btn primary third-world-boss-action third-world-boss-action-ready" type="button" onclick="startThirdWorldRunFromPlayerUi(${whole(index)})">開始連續戰鬥</button>`;
 }
 function bossCardHtml(boss,index){
  const snap=bossSnapshot(index);if(!boss||!snap)return "";
  const spec=specializationPresentation(boss),status=challengePresentation(snap),abilities=activeAbilityNames(snap),abilityText=abilities.length?abilities.join("、"):"尚無新增能力",remaining=Math.max(0,Math.min(100,n(snap.remainingPercent))),run=runSnapshot(),isActive=run.active===true&&whole(run.bossIndex)===whole(index);
  return `<article class="map-card universe-boss-card third-world-boss-card ${snap.defeated?"cleared defeated":""} ${isActive?"running":""}" data-third-world-boss="${index}"><div class="third-world-boss-head"><div><h3>${boss.name}</h3><div class="third-world-boss-type">${spec.label}</div></div><div class="third-world-boss-stage">Stage ${whole(snap.stage)}</div></div><div class="third-world-boss-specialization">${spec.effect}</div><div class="third-world-boss-hp"><div class="status-label"><span>剩餘 HP</span><b>${fmt(snap.currentHp)}</b></div><div class="bar"><span class="hp" style="width:${remaining}%"></span></div><div class="third-world-boss-percent">${pct(remaining)}</div></div><div class="third-world-boss-abilities"><span class="muted">已解鎖：</span>${abilityText}</div><div class="third-world-boss-status ${isActive?"running":status.className}"><b>${isActive?"連戰進行中":status.label}</b><span>${isActive?`死亡 ${whole(run.deaths)} / ${whole(window.THIRD_WORLD_RUN_MAX_DEATHS||100)}｜目前最大 HP ${pct(run.hpCap?.hpCapPercent??100)}`:status.detail}</span></div>${actionHtml(snap,status,index)}</article>`;
 }
 function summaryHtml(agg){
  const title=titleDefinition(),remaining=Math.max(0,Math.min(100,n(agg?.overallRemainingPercent)));
  return `<section class="card third-world-summary"><div class="third-world-summary-head"><div><h2>高維戰線</h2><div class="muted">十名高維存在共享第三紀元正式進度；每名初始 HP ${fmt(window.THIRD_WORLD_BOSS_MAX_HP)}。</div></div><div class="third-world-era-tag">高維紀元</div></div><div class="third-world-total-hp"><div class="status-label"><span>十王總剩餘 HP</span><b>${fmt(agg.currentHp)}</b></div><div class="bar"><span class="hp" style="width:${remaining}%"></span></div><div class="third-world-total-meta"><span>總剩餘 ${pct(remaining)}</span><span>已擊破 ${whole(agg.defeatedCount)} / ${whole(agg.bossCount)}</span></div></div><div class="third-world-summary-grid"><div class="stat">目前高維稱號<b>${title?.name||"尚未取得"}</b></div><div class="stat">維度之弦<b>${fmt(strings())}</b></div><div class="stat">界弦核心<b>Lv.${coreLevel()} / ${maxCore()}</b></div></div></section>`;
 }
 function baseAbilityItems(){const s=window.THIRD_WORLD_BOSS_BASE_STATS||{};return [["先制",`第一擊加成 +${whole(s.initiativeBonusPercent)}%`],["連擊",`${whole(s.comboRate)}%`],["穿透",`${whole(s.penetrationRate)}%`],["反擊",`${whole(s.counterRate)}%`],["汲取",`${whole(s.drainRate)}%`]];}
 function commonAbilitiesHtml(){
  const base=baseAbilityItems().map(([name,value])=>`<div class="third-world-common-item"><b>${name}</b><span>${value}</span></div>`).join(""),unlocks=abilityDefs().map(def=>`<div class="third-world-common-item"><b>${whole(def.unlockRemainingPercent)}%</b><span>${def.name}</span></div>`).join("");
  return `<section class="world-region third-world-common ${commonAbilitiesOpen?"open":""}"><button class="world-region-header" type="button" aria-expanded="${commonAbilitiesOpen?"true":"false"}" onclick="toggleThirdWorldCommonAbilities()"><span class="world-region-title-wrap"><b class="world-region-title">高維存在・共通能力</b><span class="world-region-level">十王共用，不在王卡重複</span></span><span class="world-region-toggle">${commonAbilitiesOpen?"▲":"▼"}</span></button>${commonAbilitiesOpen?`<div class="world-region-body"><div class="third-world-common-section"><h3>固定基礎能力</h3><div class="third-world-common-grid">${base}</div></div><div class="third-world-common-section"><h3>階段新增能力</h3><div class="third-world-common-grid third-world-common-unlocks">${unlocks}</div></div></div>`:""}</section>`;
 }
 function combatRuleHtml(){return `<div class="notice third-world-run-rule"><b>高維正式挑戰皆採連續戰鬥</b><div class="muted">玩家死亡後仍會繼續下一場；一輪最多累積 100 次死亡。停止連戰後死亡次數與高維壓制歸零；王死亡、跨入新強化階段或 5pp 戰線鎖定時會停止下一場。</div></div>`;}
 function activeRunHtml(){
  const run=runSnapshot();if(run.active!==true)return "";
  const boss=bossDefs()[whole(run.bossIndex)]||null;
  return `<div class="notice third-world-active-run" role="status"><b>連戰中｜${boss?.name||"高維存在"}</b><div class="muted">死亡 ${whole(run.deaths)} / ${whole(window.THIRD_WORLD_RUN_MAX_DEATHS||100)}｜目前最大 HP ${pct(run.hpCap?.hpCapPercent??100)}</div></div>`;
 }
 function coreButtonText(snap){if(!snap)return "核心資料未載入";if(snap.atMax)return "界弦核心已達 Lv.10";if(snap.runActive)return "連戰中不可注入";if(snap.dimensionalStrings<=0)return "目前沒有維度之弦可注入";return `全部注入 ${fmt(snap.availableInjection)} 維度之弦`;}
 function corePreviewHtml(snap,plan){
  if(!snap||snap.atMax)return `<div class="third-world-core-preview max"><b>核心已完成</b><span>Lv.${maxCore()} 已達最高等級，不再吸收維度之弦。</span></div>`;
  if(!plan||plan.injected<=0)return `<div class="third-world-core-preview"><b>等待維度之弦</b><span>正式戰鬥造成的有效永久削血會同步取得維度之弦，可隨時累積後注入。</span></div>`;
  const levelText=plan.levelAfter>plan.levelBefore?`Lv.${whole(plan.levelBefore)} → Lv.${whole(plan.levelAfter)}`:`維持 Lv.${whole(plan.levelBefore)}`,progressText=plan.levelAfter>=maxCore()?"核心完成":`注入後本級進度 ${fmt(plan.coreProgressAfter)} / ${fmt(snap.progressRequired)}`;
  return `<div class="third-world-core-preview ready"><b>${levelText}</b><span>${progressText}${plan.dimensionalStringsAfter>0?`；剩餘維度之弦 ${fmt(plan.dimensionalStringsAfter)}`:""}</span></div>`;
 }
 function corePanelHtml(){
  const snap=coreSnapshot(),plan=corePlan();if(!snap)return `<section class="card third-world-core-panel"><h2>界弦核心</h2><div class="notice">核心資料尚未載入完整。</div></section>`;
  const progress=Math.max(0,Math.min(100,n(snap.progressPercent))),perDeath=suppressionPerDeath(snap.level),nextPerDeath=snap.atMax?null:suppressionPerDeath(Math.min(maxCore(),snap.level+1)),disabled=!snap.canInject,feedback=coreFeedback?`<div class="third-world-core-feedback ${coreFeedbackOk?"ok":"error"}" role="status">${coreFeedback}</div>`:"";
  return `<section class="card third-world-core-panel"><div class="third-world-core-head"><div><h2>界弦核心</h2><div class="muted">注入維度之弦累積核心進度。界弦核心只降低高維連戰死亡壓制，不增加一般戰鬥能力。</div></div><div class="third-world-core-level">Lv.${whole(snap.level)} / ${whole(snap.maxLevel)}</div></div><div class="third-world-core-progress"><div class="status-label"><span>${snap.atMax?"核心完成":"目前等級注入進度"}</span><b>${snap.atMax?"MAX":`${fmt(snap.coreProgress)} / ${fmt(snap.progressRequired)}`}</b></div><div class="bar"><span class="hp" style="width:${progress}%"></span></div><div class="third-world-core-progress-meta"><span>${snap.atMax?"100.00%":pct(progress)}</span><span>${snap.atMax?"已達最高等級":`距下一級 ${fmt(snap.remainingToNext)}`}</span></div></div><div class="third-world-core-stats"><div class="stat">持有維度之弦<b>${fmt(snap.dimensionalStrings)}</b></div><div class="stat">本次可注入<b>${fmt(snap.availableInjection)}</b></div><div class="stat">每次死亡壓制<b>${perDeath==null?"—":`${perDeath.toFixed(2)}%`}</b></div><div class="stat">下一級壓制<b>${snap.atMax?"MAX":nextPerDeath==null?"—":`${nextPerDeath.toFixed(2)}%`}</b></div></div>${corePreviewHtml(snap,plan)}${feedback}<button class="btn primary third-world-core-inject" type="button" onclick="injectThirdWorldCoreFromPlayerUi()" ${disabled?"disabled":""}>${coreButtonText(snap)}</button>${snap.runActive?`<div class="muted third-world-core-lock-note">目前正式高維連戰進行中。核心等級會在一輪開始時固定，因此必須先停止連戰才能注入。</div>`:""}</section>`;
 }
 function ensureCoreConfirmModal(){
  if(typeof document==="undefined")return null;
  let modal=document.getElementById("thirdWorldCoreInjectionConfirmModal");if(modal)return modal;
  modal=document.createElement("div");modal.id="thirdWorldCoreInjectionConfirmModal";modal.className="modal";
  modal.innerHTML=`<div class="modal-box"><h3>確認注入維度之弦</h3><div id="thirdWorldCoreInjectionConfirmDetail"></div><div class="controls"><button class="btn" type="button" onclick="closeThirdWorldCoreInjectionConfirm()">取消</button><button class="btn primary" type="button" onclick="confirmThirdWorldCoreInjection()">確認注入</button></div></div>`;
  document.body.appendChild(modal);return modal;
 }
 function samePlan(a,b){return !!a&&!!b&&["levelBefore","levelAfter","coreProgressBefore","coreProgressAfter","dimensionalStringsBefore","dimensionalStringsAfter","injected","levelsGained"].every(key=>whole(a[key])===whole(b[key]));}
 function executeCoreInjection(){
  if(typeof window.injectAllThirdWorldCoreStrings!=="function"){coreFeedbackOk=false;coreFeedback="界弦核心注入功能尚未載入完整。";}
  else{
   const result=window.injectAllThirdWorldCoreStrings();coreFeedbackOk=result?.ok===true;
   if(coreFeedbackOk){const gained=whole(result.levelsGained),injected=whole(result.injected),after=result.snapshot||coreSnapshot();coreFeedback=`已注入 ${fmt(injected)} 維度之弦${gained>0?`，界弦核心提升 ${gained} 級`:""}。目前 Lv.${whole(after?.level)}${after?.atMax?" MAX":`，本級進度 ${fmt(after?.coreProgress)} / ${fmt(after?.progressRequired)}`}。`;}
   else coreFeedback=String(result?.reason||"界弦核心注入失敗，請稍後再試。");
  }
  if(typeof window.render==="function")window.render();return coreFeedbackOk;
 }
 function stopActiveRun(reason="manual"){
  const run=runSnapshot();if(run.active!==true)return false;
  if(typeof window.stopThirdWorldContinuousRun!=="function")return false;
  window.stopThirdWorldContinuousRun(reason);return true;
 }
 function topBarHtml(withInventory=true){return `<div class="page-top third-world-page-top"><div class="third-world-page-top-cell left"><button class="btn back-btn" onclick="thirdWorldGoHomeFromPlayerUi()">← 返回主頁</button></div><div class="third-world-page-top-cell center"><h2 class="page-title">高維戰線</h2></div><div class="third-world-page-top-cell right">${withInventory?`<button class="btn" onclick="thirdWorldOpenInventoryFromPlayerUi()">背包</button>`:""}</div></div>`;}
 function unavailableHtml(message){return `<section class="map-screen third-world-adventure-screen">${topBarHtml(false)}<div class="notice"><b>${message}</b></div></section>`;}
 function pageHtml(){
  clearCoreFeedbackOnFreshEntry();
  if(currentPhase()!==3)return unavailableHtml("目前尚未正式進入高維紀元。");
  const count=expectedBossCount(),agg=aggregate();if(count<=0||!agg||!Array.isArray(agg.bosses)||agg.bosses.length!==count)return unavailableHtml("高維戰線資料尚未載入完整，請重新整理後再試。");
  const defs=bossDefs();if(defs.length!==count)return unavailableHtml("十王資料尚未載入完整，請重新整理後再試。");
  return `<section class="map-screen third-world-adventure-screen">${topBarHtml(true)}${summaryHtml(agg)}${commonAbilitiesHtml()}${combatRuleHtml()}${activeRunHtml()}<div class="map-grid universe-boss-grid third-world-boss-grid">${defs.map((boss,index)=>bossCardHtml(boss,index)).join("")}</div>${corePanelHtml()}</section>`;
 }
 function validate(){
  const errors=[],bossCount=expectedBossCount(),abilityCount=expectedAbilityCount();
  if(typeof window.currentWorldPhase!=="function")errors.push("WORLD_PHASE_OWNER_MISSING");
  if(typeof window.thirdWorldBossAggregateSnapshot!=="function")errors.push("AGGREGATE_OWNER_MISSING");
  if(typeof window.thirdWorldBossProgressSnapshot!=="function")errors.push("BOSS_SNAPSHOT_OWNER_MISSING");
  if(typeof window.thirdWorldChallengeStatus!=="function")errors.push("CHALLENGE_OWNER_MISSING");
  if(typeof window.thirdWorldCurrentTitleDefinition!=="function")errors.push("TITLE_OWNER_MISSING");
  if(typeof window.thirdWorldBossSpecializationPresentation!=="function")errors.push("SPECIALIZATION_PRESENTATION_OWNER_MISSING");
  if(typeof window.thirdWorldCoreSnapshot!=="function")errors.push("CORE_SNAPSHOT_OWNER_MISSING");
  if(typeof window.thirdWorldCoreInjectionPlan!=="function")errors.push("CORE_PLAN_OWNER_MISSING");
  if(typeof window.injectAllThirdWorldCoreStrings!=="function")errors.push("CORE_INJECTION_OWNER_MISSING");
  if(bossCount<=0||bossDefs().length!==bossCount)errors.push("BOSS_DEFINITION_COUNT");
  if(abilityCount<=0||abilityDefs().length!==abilityCount)errors.push("ABILITY_DEFINITION_COUNT");
  return Object.freeze({version:VERSION,coreUiVersion:CORE_UI_VERSION,coreFeedbackLifecycleVersion:CORE_FEEDBACK_LIFECYCLE_VERSION,coreConfirmationVersion:CORE_CONFIRMATION_VERSION,runEntryUiVersion:RUN_ENTRY_UI_VERSION,threeColumnHeaderVersion:THREE_COLUMN_HEADER_VERSION,passed:errors.length===0,errors:Object.freeze(errors)});
 }

 window.toggleThirdWorldCommonAbilities=function(){commonAbilitiesOpen=!commonAbilitiesOpen;if(typeof window.render==="function")window.render();};
 window.startThirdWorldRunFromPlayerUi=async function(value){
  const index=whole(value),current=runSnapshot();
  if(current.active===true)return current.bossIndex===index?true:false;
  if(playerRunPromise)return false;
  if(typeof window.startThirdWorldContinuousRun!=="function"||typeof window.runThirdWorldContinuousLoop!=="function"){alert("高維連戰模組尚未載入完整，請重新整理後再試。");return false;}
  const started=window.startThirdWorldContinuousRun(index);
  if(started?.ok!==true){alert(String(started?.reason||"目前無法開始高維連戰。"));return false;}
  if(typeof window.render==="function")window.render();
  playerRunPromise=window.runThirdWorldContinuousLoop(index,{onBattle:async()=>{if(typeof window.render==="function")window.render();}});
  try{return await playerRunPromise;}
  catch(error){console.error("[文明戰線] 高維玩家連戰失敗",error);alert("高維連戰發生錯誤，已停止本輪挑戰。");stopActiveRun("error");return false;}
  finally{playerRunPromise=null;if(typeof window.render==="function")window.render();}
 };
 window.stopThirdWorldRunFromPlayerUi=function(){const stopped=stopActiveRun("manual");if(typeof window.render==="function")window.render();return stopped;};
 window.thirdWorldGoHomeFromPlayerUi=function(){stopActiveRun("manual");if(typeof go==="function")go("home");return true;};
 window.thirdWorldOpenInventoryFromPlayerUi=function(){stopActiveRun("manual");if(typeof openAdventureInventory==="function")openAdventureInventory();else if(typeof go==="function")go("inventory");return true;};
 window.openThirdWorldCoreInjectionConfirm=function(){
  const snap=coreSnapshot(),plan=corePlan();
  if(!snap?.canInject||!plan||plan.injected<=0){coreFeedbackOk=false;coreFeedback=snap?.reason==="run-active"?"高維連戰進行中，必須先停止連戰才能注入。":snap?.reason==="max-level"?"界弦核心已達最高等級。":"目前沒有可注入的維度之弦。";if(typeof window.render==="function")window.render();return false;}
  const modal=ensureCoreConfirmModal(),detail=modal?.querySelector("#thirdWorldCoreInjectionConfirmDetail");if(!modal||!detail)return false;
  pendingCoreConfirmation={...plan};
  detail.innerHTML=`<div class="notice"><b>維度之弦注入後無法取回</b><div class="muted" style="margin-top:6px">本次將注入目前可投入的全部維度之弦。</div></div><div class="stats" style="margin-top:10px"><div class="stat">本次注入<b>${fmt(plan.injected)}</b></div><div class="stat">核心等級<b>Lv.${whole(plan.levelBefore)} → Lv.${whole(plan.levelAfter)}</b></div><div class="stat">注入後本級進度<b>${plan.levelAfter>=maxCore()?"MAX":`${fmt(plan.coreProgressAfter)} / ${fmt(snap.progressRequired)}`}</b></div><div class="stat">剩餘維度之弦<b>${fmt(plan.dimensionalStringsAfter)}</b></div></div>`;
  modal.classList.add("show");return true;
 };
 window.closeThirdWorldCoreInjectionConfirm=function(){pendingCoreConfirmation=null;document.getElementById("thirdWorldCoreInjectionConfirmModal")?.classList.remove("show");return true;};
 window.confirmThirdWorldCoreInjection=function(){
  const pending=pendingCoreConfirmation,fresh=corePlan();
  if(!samePlan(pending,fresh)){window.closeThirdWorldCoreInjectionConfirm();coreFeedbackOk=false;coreFeedback="維度之弦或核心狀態已變更，請重新確認本次注入內容。";if(typeof window.render==="function")window.render();return false;}
  window.closeThirdWorldCoreInjectionConfirm();return executeCoreInjection();
 };
 window.injectThirdWorldCoreFromPlayerUi=function(){return window.openThirdWorldCoreInjectionConfirm();};
 window.clearThirdWorldCoreFeedback=clearCoreFeedback;
 window.thirdWorldAdventurePageHtml=pageHtml;
 window.validateThirdWorldPlayerUi=validate;
 window.THIRD_WORLD_PLAYER_UI_VERSION=VERSION;
 window.THIRD_WORLD_PLAYER_UI_BOSS_GRID_VERSION=1;
 window.THIRD_WORLD_PLAYER_UI_CORE_VERSION=CORE_UI_VERSION;
 window.THIRD_WORLD_PLAYER_UI_DERIVED_OWNER_VERSION=2;
 window.THIRD_WORLD_PLAYER_UI_CORE_FEEDBACK_LIFECYCLE_VERSION=CORE_FEEDBACK_LIFECYCLE_VERSION;
 window.THIRD_WORLD_PLAYER_UI_CORE_CONFIRMATION_VERSION=CORE_CONFIRMATION_VERSION;
 window.THIRD_WORLD_PLAYER_UI_RUN_ENTRY_VERSION=RUN_ENTRY_UI_VERSION;
 window.THIRD_WORLD_PLAYER_UI_THREE_COLUMN_HEADER_VERSION=THREE_COLUMN_HEADER_VERSION;
 window.THIRD_WORLD_PLAYER_UI_INTEGRITY=validate();
 if(!window.THIRD_WORLD_PLAYER_UI_INTEGRITY.passed)console.error("[文明戰線] Third-world player UI integrity error",window.THIRD_WORLD_PLAYER_UI_INTEGRITY.errors);
})();