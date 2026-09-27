(function(){
 const VERSION=1;
 let commonAbilitiesOpen=false;

 function n(value){const x=Number(value);return Number.isFinite(x)?x:0;}
 function whole(value){return Math.max(0,Math.floor(n(value)));}
 function pct(value,digits=2){return `${Math.max(0,Math.min(100,n(value))).toFixed(digits)}%`;}
 function fmt(value){return whole(value).toLocaleString();}
 function currentPhase(){return typeof window.currentWorldPhase==="function"?Number(window.currentWorldPhase(state)):state?.thirdWorld?.entered===true?3:state?.secondWorld?.entered===true?2:1;}
 function bossDefs(){return Array.isArray(window.THIRD_WORLD_BOSS_DEFINITIONS)?window.THIRD_WORLD_BOSS_DEFINITIONS:[];}
 function abilityDefs(){return Array.isArray(window.THIRD_WORLD_BOSS_ABILITY_DEFINITIONS)?window.THIRD_WORLD_BOSS_ABILITY_DEFINITIONS:[];}
 function aggregate(){return typeof window.thirdWorldBossAggregateSnapshot==="function"?window.thirdWorldBossAggregateSnapshot(state):null;}
 function bossSnapshot(index){return typeof window.thirdWorldBossProgressSnapshot==="function"?window.thirdWorldBossProgressSnapshot(index,state):null;}
 function titleDefinition(){return typeof window.thirdWorldCurrentTitleDefinition==="function"?window.thirdWorldCurrentTitleDefinition(state):null;}
 function coreLevel(){return Math.max(0,Math.min(whole(window.THIRD_WORLD_CORE_MAX_LEVEL||10),whole(state?.thirdWorld?.coreLevel)));}
 function strings(){return whole(state?.thirdWorld?.dimensionalStrings);}
 function maxCore(){return Math.max(0,whole(window.THIRD_WORLD_CORE_MAX_LEVEL||10));}

 function specializationPresentation(boss){
  const spec=boss?.specialization||{};
  const id=String(spec.id||"");
  const rows={
   attack:["高攻型",`ATK ×${n(spec.atkMultiplier).toFixed(2)}`],
   defense:["高防型",`DEF ×${n(spec.defMultiplier).toFixed(2)}`],
   critical:["高暴型",`暴擊 +${whole(spec.critPoints)}pp`],
   dodge:["高閃型",`閃避 +${whole(spec.dodgePoints)}pp`],
   combo:["連擊型",`連擊率 +${whole(spec.comboRatePoints)}pp`],
   penetration:["穿透型",`穿透率 +${whole(spec.penetrationRatePoints)}pp`],
   counter:["反擊型",`反擊率 +${whole(spec.counterRatePoints)}pp`],
   drain:["汲取型",`汲取率 +${whole(spec.drainRatePoints)}pp`],
   initiative:["先制型",`第一擊加成 +${whole(spec.initiativeBonusPoints)}pp`],
   origin:["均衡型",`ATK ×${n(spec.atkMultiplier).toFixed(2)}、DEF ×${n(spec.defMultiplier).toFixed(2)}`]
  };
  const hit=rows[id]||["高維存在","個體特化"];
  return {label:hit[0],effect:hit[1]};
 }
 function activeAbilityNames(snapshot){
  if(!snapshot?.abilities||typeof snapshot.abilities!=="object")return [];
  return abilityDefs().filter(def=>snapshot.abilities?.[def.id]?.active===true).map(def=>def.name);
 }
 function challengePresentation(snapshot){
  if(snapshot?.defeated)return {className:"defeated",label:"已擊破",detail:"永久 HP 已歸零"};
  const status=snapshot?.challengeStatus||{};
  if(status.allowed===true&&status.reason==="last-survivor")return {className:"ready final",label:"最終存活・可挑戰",detail:"僅存一名高維存在，5pp 限制自然解除"};
  if(status.allowed===true)return {className:"ready",label:"可挑戰",detail:"目前位於合法 5pp 戰線內"};
  if(status.reason==="five-point-front")return {className:"blocked",label:"戰線偏離｜暫不可挑戰",detail:"請先推進其他存活高維存在"};
  return {className:"blocked",label:"正式挑戰未開放",detail:"目前世界狀態不允許正式挑戰"};
 }
 function actionHtml(snapshot,status){
  if(snapshot?.defeated)return `<button class="btn third-world-boss-action" type="button" disabled>已擊破</button>`;
  if(status.className.includes("blocked"))return `<button class="btn third-world-boss-action" type="button" disabled>暫不可挑戰</button>`;
  return `<button class="btn primary third-world-boss-action third-world-boss-action-ready" type="button" disabled title="正式連續戰鬥流程將於下一批接入">開始連續戰鬥</button>`;
 }
 function bossCardHtml(boss,index){
  const snap=bossSnapshot(index);if(!boss||!snap)return "";
  const spec=specializationPresentation(boss),status=challengePresentation(snap),abilities=activeAbilityNames(snap);
  const abilityText=abilities.length?abilities.join("、"):"尚無新增能力";
  const remaining=Math.max(0,Math.min(100,n(snap.remainingPercent)));
  return `<article class="map-card universe-boss-card third-world-boss-card ${snap.defeated?"cleared defeated":""}" data-third-world-boss="${index}">
   <div class="third-world-boss-head"><div><h3>${boss.name}</h3><div class="third-world-boss-type">${spec.label}</div></div><div class="third-world-boss-stage">Stage ${whole(snap.stage)}</div></div>
   <div class="third-world-boss-specialization">${spec.effect}</div>
   <div class="third-world-boss-hp"><div class="status-label"><span>剩餘 HP</span><b>${fmt(snap.currentHp)}</b></div><div class="bar"><span class="hp" style="width:${remaining}%"></span></div><div class="third-world-boss-percent">${pct(remaining)}</div></div>
   <div class="third-world-boss-abilities"><span class="muted">已解鎖：</span>${abilityText}</div>
   <div class="third-world-boss-status ${status.className}"><b>${status.label}</b><span>${status.detail}</span></div>
   ${actionHtml(snap,status)}
  </article>`;
 }
 function summaryHtml(agg){
  const title=titleDefinition(),remaining=Math.max(0,Math.min(100,n(agg?.overallRemainingPercent)));
  return `<section class="card third-world-summary">
   <div class="third-world-summary-head"><div><h2>高維戰線</h2><div class="muted">十名高維存在共享第三紀元正式進度；每名初始 HP ${fmt(window.THIRD_WORLD_BOSS_MAX_HP)}。</div></div><div class="third-world-era-tag">高維紀元</div></div>
   <div class="third-world-total-hp"><div class="status-label"><span>十王總剩餘 HP</span><b>${fmt(agg.currentHp)}</b></div><div class="bar"><span class="hp" style="width:${remaining}%"></span></div><div class="third-world-total-meta"><span>總剩餘 ${pct(remaining)}</span><span>已擊破 ${whole(agg.defeatedCount)} / ${whole(agg.bossCount)}</span></div></div>
   <div class="third-world-summary-grid"><div class="stat">目前高維稱號<b>${title?.name||"尚未取得"}</b></div><div class="stat">維度之弦<b>${fmt(strings())}</b></div><div class="stat">界弦核心<b>Lv.${coreLevel()} / ${maxCore()}</b></div></div>
  </section>`;
 }
 function baseAbilityItems(){
  const s=window.THIRD_WORLD_BOSS_BASE_STATS||{};
  return [
   ["先制",`第一擊加成 +${whole(s.initiativeBonusPercent)}%`],
   ["連擊",`${whole(s.comboRate)}%`],
   ["穿透",`${whole(s.penetrationRate)}%`],
   ["反擊",`${whole(s.counterRate)}%`],
   ["汲取",`${whole(s.drainRate)}%`]
  ];
 }
 function commonAbilitiesHtml(){
  const base=baseAbilityItems().map(([name,value])=>`<div class="third-world-common-item"><b>${name}</b><span>${value}</span></div>`).join("");
  const unlocks=abilityDefs().map(def=>`<div class="third-world-common-item"><b>${whole(def.unlockRemainingPercent)}%</b><span>${def.name}</span></div>`).join("");
  return `<section class="world-region third-world-common ${commonAbilitiesOpen?"open":""}">
   <button class="world-region-header" type="button" aria-expanded="${commonAbilitiesOpen?"true":"false"}" onclick="toggleThirdWorldCommonAbilities()"><span class="world-region-title-wrap"><b class="world-region-title">高維存在・共通能力</b><span class="world-region-level">十王共用，不在王卡重複</span></span><span class="world-region-toggle">${commonAbilitiesOpen?"▲":"▼"}</span></button>
   ${commonAbilitiesOpen?`<div class="world-region-body"><div class="third-world-common-section"><h3>固定基礎能力</h3><div class="third-world-common-grid">${base}</div></div><div class="third-world-common-section"><h3>階段新增能力</h3><div class="third-world-common-grid third-world-common-unlocks">${unlocks}</div></div></div>`:""}
  </section>`;
 }
 function combatRuleHtml(){return `<div class="notice third-world-run-rule"><b>高維正式挑戰皆採連續戰鬥</b><div class="muted">玩家死亡後仍會繼續下一場；一輪最多累積 100 次死亡。停止連戰後死亡次數與高維壓制歸零；王死亡、跨入新強化階段或 5pp 戰線鎖定時會停止下一場。</div></div>`;}
 function unavailableHtml(message){
  return `<section class="map-screen third-world-adventure-screen"><div class="page-top"><button class="btn back-btn" onclick="go('home')">← 返回主頁</button><h2 class="page-title">高維戰線</h2><span></span></div><div class="notice"><b>${message}</b></div></section>`;
 }
 function pageHtml(){
  if(currentPhase()!==3)return unavailableHtml("目前尚未正式進入高維紀元。");
  const agg=aggregate();if(!agg||!Array.isArray(agg.bosses)||agg.bosses.length!==10)return unavailableHtml("高維戰線資料尚未載入完整，請重新整理後再試。");
  const defs=bossDefs();if(defs.length!==10)return unavailableHtml("十王資料尚未載入完整，請重新整理後再試。");
  return `<section class="map-screen third-world-adventure-screen"><div class="page-top"><button class="btn back-btn" onclick="go('home')">← 返回主頁</button><h2 class="page-title">冒險</h2><span></span></div>${summaryHtml(agg)}${commonAbilitiesHtml()}${combatRuleHtml()}<div class="map-grid universe-boss-grid third-world-boss-grid">${defs.map((boss,index)=>bossCardHtml(boss,index)).join("")}</div></section>`;
 }
 function validate(){
  const errors=[];
  if(typeof window.currentWorldPhase!=="function")errors.push("WORLD_PHASE_OWNER_MISSING");
  if(typeof window.thirdWorldBossAggregateSnapshot!=="function")errors.push("AGGREGATE_OWNER_MISSING");
  if(typeof window.thirdWorldBossProgressSnapshot!=="function")errors.push("BOSS_SNAPSHOT_OWNER_MISSING");
  if(typeof window.thirdWorldChallengeStatus!=="function")errors.push("CHALLENGE_OWNER_MISSING");
  if(typeof window.thirdWorldCurrentTitleDefinition!=="function")errors.push("TITLE_OWNER_MISSING");
  if(bossDefs().length!==10)errors.push("BOSS_DEFINITION_COUNT");
  if(abilityDefs().length!==7)errors.push("ABILITY_DEFINITION_COUNT");
  return Object.freeze({version:VERSION,passed:errors.length===0,errors:Object.freeze(errors)});
 }

 window.toggleThirdWorldCommonAbilities=function(){commonAbilitiesOpen=!commonAbilitiesOpen;if(typeof window.render==="function")window.render();};
 window.thirdWorldAdventurePageHtml=pageHtml;
 window.validateThirdWorldPlayerUi=validate;
 window.THIRD_WORLD_PLAYER_UI_VERSION=VERSION;
 window.THIRD_WORLD_PLAYER_UI_BOSS_GRID_VERSION=1;
 window.THIRD_WORLD_PLAYER_UI_DERIVED_OWNER_VERSION=1;
 window.THIRD_WORLD_PLAYER_UI_INTEGRITY=validate();
 if(!window.THIRD_WORLD_PLAYER_UI_INTEGRITY.passed)console.error("[文明戰線] Third-world player UI integrity error",window.THIRD_WORLD_PLAYER_UI_INTEGRITY.errors);
})();
