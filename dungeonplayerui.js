(function(){
 function arenaDifficultyLabel(id){return id==="extreme"?"高難":id==="hard"?"中難":"低難";}
 function arenaDifficultyDesc(id){return id==="extreme"?"最高風險・晉升評估基準":id==="hard"?"收益較高・具明顯風險":"穩定挑戰・安全收益";}
 function arenaDifficultyClass(id){return id==="extreme"?"arena-tag-extreme":id==="hard"?"arena-tag-hard":"arena-tag-normal";}
 function arenaRankLabel(rank){return typeof getArenaRankName==="function"?getArenaRankName(rank):`${WORLD_REGIONS?.[rank-1]?.name||`第${rank}區`}階`;}
 function arenaNextRegionName(rank){const region=Array.isArray(WORLD_REGIONS)?WORLD_REGIONS[rank]:null;return region?.name||`第 ${rank+1} 區域`;}
 function assessmentCopy(a){
  if(!a)return {tone:"neutral",title:"尚未評估",detail:"以目前高難進行 500 次完整三連戰模擬。"};
  if(a.rank>=a.maxRank)return {tone:"ok",title:"已達目前最高階",detail:"目前版本沒有更高競技場階級。"};
  if(a.promotionReady&&a.rank>=a.unlockedCap)return {tone:"ready",title:"戰力資格已取得",detail:`下一階需先解鎖主線第 ${a.rank+1} 區域（${arenaNextRegionName(a.rank)}）。`};
  if(a.promotionReady)return {tone:"ready",title:"可以晉升",detail:"高難評估已達 450 / 500 以上，晉升資格已永久保留。"};
  if(!a.hasResult)return {tone:"neutral",title:"尚未進行本階評估",detail:"高難 500 次完整三連戰中至少全通 450 次，即可取得晉升資格。"};
  if(a.stale)return {tone:"warn",title:"戰力已變化",detail:`上次結果 ${a.clears} / ${a.runs}；裝備、VIP 或戰鬥專精已變化，可重新評估。`};
  return {tone:a.clears>=450?"ready":"neutral",title:`${a.clears} / ${a.runs}（${a.rate}%）`,detail:a.clears>=450?"已達晉升標準。":"尚未達 450 次全通，可在戰力提升後再次評估。"};
 }
 function buildArenaRankPanel(a){
  const copy=assessmentCopy(a),rank=a?.rank||1,cap=a?.unlockedCap||3,max=a?.maxRank||1;
  const nextRank=rank+1;
  const next=rank<max?`<div class="arena-next-map">下一階：${arenaRankLabel(nextRank)}${rank>=cap?`　<span>需先解鎖主線第 ${nextRank} 區域</span>`:""}</div>`:`<div class="arena-next-map">目前已達競技場最高階</div>`;
  const pct=a?.hasResult?Math.max(0,Math.min(100,Number(a.rate)||0)):0;
  const assessDisabled=!!a?.promotionReady||rank>=max;
  const promoteDisabled=!a?.canPromote;
  const capSource=cap<=3?"Lv15 開放競技場後，前三階為基礎開放":"第 4 階起依主線區域解鎖；目前主線已開放至第 "+cap+"區域";
  return `<section class="arena-rank-dashboard"><div class="arena-rank-hero"><div><span class="arena-rank-kicker">目前競技場階級</span><strong>${arenaRankLabel(rank)}</strong></div><div class="arena-rank-count"><b>${rank}</b><span>/ ${cap}</span><small>目前可達上限</small></div></div><div class="arena-map-cap">目前競技場最高可達：第 ${cap} 階・${arenaRankLabel(cap)}</div><div class="arena-map-cap">${capSource}</div>${next}<div class="arena-assessment-box ${copy.tone}"><div class="arena-assessment-head"><b>晉升評估</b><strong>${copy.title}</strong></div><div class="arena-assessment-bar"><span style="width:${pct}%"></span></div><p>${copy.detail}</p><div class="arena-assessment-actions"><button class="btn" ${assessDisabled?"disabled":""} onclick="${assessDisabled?"void(0)":"assessArenaPromotion()"}">進行 500 次評估</button><button class="btn primary" ${promoteDisabled?"disabled":""} onclick="${promoteDisabled?"void(0)":"promoteArenaRank()"}">晉升下一階</button></div></div></section>`;
 }
 function enhanceArenaSelection(main){
  const grid=main.querySelector(".arena-difficulty-grid");if(!grid)return;
  const panel=grid.closest(".arena-panel");if(!panel||panel.dataset.playerUi==="1")return;
  panel.dataset.playerUi="1";
  const a=typeof getArenaAssessmentStatus==="function"?getArenaAssessmentStatus():null;
  panel.querySelectorAll(":scope > .arena-current-points,:scope > .controls.arena-actions").forEach(el=>el.remove());
  const attempts=panel.querySelector(".arena-attempts");
  if(attempts)attempts.insertAdjacentHTML("afterend",buildArenaRankPanel(a));
  const configs=typeof getArenaDifficultyConfigs==="function"?getArenaDifficultyConfigs(a?.rank||null):[];
  Array.from(grid.children).forEach((card,i)=>{
   const cfg=configs[i],id=cfg?.id||["normal","hard","extreme"][i]||"normal";
   card.classList.add("arena-player-difficulty-card");
   const b=card.querySelector("b");if(b)b.textContent=arenaDifficultyLabel(id);
   if(!card.querySelector(".arena-difficulty-role"))card.insertAdjacentHTML("afterbegin",`<span class="arena-difficulty-role ${arenaDifficultyClass(id)}">${arenaDifficultyDesc(id)}</span>`);
  });
 }
 function enhanceArenaReady(main,core){
  const panel=main.querySelector(".arena-ready-panel");if(!panel||panel.dataset.playerUi==="1")return;
  panel.dataset.playerUi="1";
  const id=core?.difficulty?.id||"normal",label=arenaDifficultyLabel(id);
  const title=panel.querySelector(".arena-title");if(title)title.textContent=arenaRankLabel(core?.rank||1);
  panel.querySelector(".arena-stage-label")?.insertAdjacentHTML("beforebegin",`<div class="arena-ready-meta"><span>${label}</span><b>${arenaDifficultyDesc(id)}</b></div>`);
  const carry=panel.querySelector(".arena-carry");if(carry)carry.textContent="每輪固定進行三戰，三戰之間不回血；若選連續挑戰，新一輪才會重新滿血。";
  const actions=panel.querySelector(".arena-actions");if(actions)actions.insertAdjacentHTML("beforebegin",`<div class="arena-mode-help"><div><b>單次挑戰</b><span>完成這一輪後進入結算</span></div><div><b>連續挑戰</b><span>自動開始下一輪，死亡、次數不足或手動停止時結算</span></div></div>`);
 }
 function enhanceArenaCombat(main,core){
  const screen=main.querySelector(".arena-combat");if(!screen)return;
  const id=core?.difficulty?.id||"normal",label=arenaDifficultyLabel(id),head=screen.querySelector(".arena-combat-head");
  if(head)head.textContent=`【競技場】 ${arenaRankLabel(core?.rank||1)}・${label}・第 ${(Number(core?.stage)||0)+1} 戰${core?.continuous?"・連續挑戰":""}`;
  const tier=screen.querySelector(".arena-combat-tier");if(tier)tier.textContent=label;
  if(core?.continuous&&!screen.querySelector(".arena-live-summary")){
   const runs=Number(core?.summary?.runs)||0,clears=Number(core?.summary?.fullClears)||0;
   screen.querySelector(".arena-progress-wrap")?.insertAdjacentHTML("afterend",`<div class="arena-live-summary">連續挑戰中・已完成 ${runs} 輪・全通 ${clears} 輪</div>`);
  }
 }
 function enhanceArenaResult(main,core){
  const panel=main.querySelector(".arena-result-panel");if(!panel||panel.dataset.playerUi==="1")return;
  panel.dataset.playerUi="1";
  const id=core?.difficulty?.id||"normal",label=arenaDifficultyLabel(id),diff=panel.querySelector(".arena-result-difficulty");
  if(diff)diff.textContent=`${arenaRankLabel(core?.rank||1)}・${label}`;
  if(core?.continuous){
   const title=panel.querySelector(".arena-title");if(title)title.textContent="競技場連續挑戰總結算";
   const reason=Array.from(panel.querySelectorAll(".arena-current-points")).find(el=>el.textContent.includes("停止原因"));if(reason)reason.classList.add("arena-stop-reason");
  }
 }
 function enhanceArena(main){
  const core=typeof getArenaCoreState==="function"?getArenaCoreState():null;
  if(!core)return;
  if(core.phase==="select")enhanceArenaSelection(main);
  else if(core.phase==="ready")enhanceArenaReady(main,core);
  else if(core.phase==="combat")enhanceArenaCombat(main,core);
  else if(core.phase==="result")enhanceArenaResult(main,core);
 }
 function enhanceBounty(main){
  const snap=typeof getBountyTestSnapshot==="function"?getBountyTestSnapshot():null;
  const ready=main.querySelector(".dungeon-bounty-ready-card");
  if(ready&&ready.dataset.playerUi!=="1"){
   ready.dataset.playerUi="1";
   ready.querySelector(".dungeon-bounty-reward-grid")?.remove();
   const traits=ready.querySelector(".dungeon-bounty-traits");
   traits?.insertAdjacentHTML("afterend",`<div class="dungeon-bounty-positioning"><strong>高 EXP・高金幣・多裝備</strong><span>每次懸賞隨機產生強敵與獎勵等級，實際獎勵於戰後結算。</span></div>`);
   const actions=ready.querySelector(".dungeon-bounty-ready-actions");
   actions?.insertAdjacentHTML("beforebegin",`<div class="dungeon-mode-help"><div><b>單次挑戰</b><span>完成本場後結算</span></div><div><b>連續挑戰</b><span>每場開始前消耗 1 次；死亡、次數不足或手動停止時總結算</span></div></div>`);
  }
  const combat=main.querySelector(".dungeon-bounty-combat");
  if(combat&&snap?.continuous&&!combat.querySelector(".dungeon-continuous-status")){
   const runs=Number(snap.summary?.runs)||0,wins=Number(snap.summary?.wins)||0;
   combat.querySelector(".combat-head")?.insertAdjacentHTML("afterend",`<div class="dungeon-continuous-status">連續挑戰中・已完成 ${runs} 場・勝利 ${wins} 場${snap.stopRequested?"・本場結束後停止":""}</div>`);
  }
  const result=main.querySelector(".dungeon-bounty-result-card");
  if(result&&result.querySelector(".dungeon-bounty-title")?.textContent.includes("連續挑戰"))result.classList.add("dungeon-continuous-result");
 }
 function enhanceDungeonHome(main){
  const bounty=main.querySelector(".dungeon-mode-bounty p");if(bounty)bounty.textContent="隨機挑戰依目前實力生成的強敵，可選單次或連續挑戰，主打高 EXP、高金幣與多裝備。";
  const arena=main.querySelector(".dungeon-mode-arena p");if(arena)arena.textContent="Lv15 開放競技場後先提供前三階；第4階起需推進對應主線區域。每階可挑戰低、中、高三種難度。";
 }
 function enhance(){
  const main=document.getElementById("main");if(!main)return;
  if(view==="dungeon")enhanceDungeonHome(main);
  else if(view==="dungeon-arena")enhanceArena(main);
  else if(view==="dungeon-bounty")enhanceBounty(main);
 }
 const baseRender=render;
 render=function(){const out=baseRender();enhance();return out;};
 window.refreshDungeonPlayerUi=enhance;
 enhance();
})();
