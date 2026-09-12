(function(){
 let selectedVenueRank=null;
 const baseRenderArenaDungeon=window.renderArenaDungeon;
 const baseStartArenaDungeon=window.startArenaDungeon;
 const baseOpenArenaDungeon=window.openArenaDungeon;

 function venueName(rank){return typeof getArenaVenueName==="function"?getArenaVenueName(rank):`${WORLD_REGIONS?.[rank-1]?.name||`第${rank}區`}競技場`;}
 function difficultyLabel(id){return id==="extreme"?"高難":id==="hard"?"中難":"低難";}
 function difficultyDesc(id){return id==="extreme"?"最高風險・解鎖評估基準":id==="hard"?"收益較高・具明顯風險":"穩定挑戰・安全收益";}
 function difficultyClass(id){return id==="extreme"?"arena-tag-extreme":id==="hard"?"arena-tag-hard":"arena-tag-normal";}
 function assessmentTone(a){if(a?.promotionReady)return "ready";if(a?.stale)return "warn";return "neutral";}
 function combatAssessmentHtml(a,p){
  const target=venueName(p.assessmentRank),pct=a?.hasResult?Math.max(0,Math.min(100,Number(a.rate)||0)):0;
  let value="尚未評估",detail=`以 ${target} 高難進行 500 次完整三連戰。`;
  if(a?.promotionReady){value=`${a.clears} / 500（${a.rate}%）・通過`;detail="戰力評估已通過；等下一競技場對應主線區域開放後即可解鎖。";}
  else if(a?.stale){value=`上次 ${a.clears} / 500`;detail="目前裝備、VIP 或戰鬥專精已變化，可重新評估。";}
  else if(a?.hasResult){value=`${a.clears} / 500（${a.rate}%）`;detail=a.clears>=450?"已達 90% 門檻。":"尚未達 450 / 500，可提升戰力後重新評估。";}
  return `<div class="arena-dual-card ${assessmentTone(a)}"><div class="arena-dual-head"><span>① 戰力評估</span><strong>${value}</strong></div><div class="arena-dual-target">目前最高：${target}</div><div class="arena-dual-bar"><span style="width:${pct}%"></span></div><p>${detail}</p></div>`;
 }
 function regionAssessmentHtml(p){
  if(p.atFinalWindow)return `<div class="arena-dual-card ready"><div class="arena-dual-head"><span>② 主線條件</span><strong>已完成</strong></div><div class="arena-dual-target">10 個競技場已全部解鎖</div><p>沒有下一個競技場需要解鎖。</p></div>`;
  const nextRegion=WORLD_REGIONS?.[p.nextRank-1]?.name||`第${p.nextRank}區域`;
  return `<div class="arena-dual-card ${p.regionReady?"ready":"locked"}"><div class="arena-dual-head"><span>② 主線條件</span><strong>${p.regionReady?"已達成":"未達成"}</strong></div><div class="arena-dual-target">下一個：${p.nextName}</div><p>${p.regionReady?`主線第 ${p.nextRank} 區域「${nextRegion}」已解鎖。`:`需先解鎖主線第 ${p.nextRank} 區域「${nextRegion}」。`}</p></div>`;
 }
 function unlockPanelHtml(a,p){
  if(p.atFinalWindow)return `<section class="arena-dual-assessment"><div class="arena-window-title">已解鎖全部 10 個競技場</div><div class="arena-dual-grid">${combatAssessmentHtml(a,p)}${regionAssessmentHtml(p)}</div></section>`;
  const assessDisabled=a?.promotionReady;
  return `<section class="arena-dual-assessment"><div class="arena-window-title">目前最高已解鎖：第 ${p.highestArenaUnlocked} 個・${p.assessmentName}</div><div class="arena-window-sub">解鎖 ${p.nextName} 需要：目前最高競技場高難達 90%，且主線第 ${p.nextRank} 區已解鎖。</div><div class="arena-dual-grid">${combatAssessmentHtml(a,p)}${regionAssessmentHtml(p)}</div><div class="arena-dual-actions"><button class="btn" ${assessDisabled?"disabled":""} onclick="${assessDisabled?"void(0)":"assessArenaPromotion()"}">戰力評估（500次）</button><button class="btn primary" ${p.canUnlockNext?"":"disabled"} onclick="${p.canUnlockNext?"promoteArenaRank()":"void(0)"}">解鎖 ${p.nextName}</button></div></section>`;
 }
 function venueCard(rank,p,d){
  const configs=typeof getArenaDifficultyConfigs==="function"?getArenaDifficultyConfigs(rank):[];
  const points=configs.map(x=>`${difficultyLabel(x.id)} ${x.totalPoints}`).join("　");
  const target=rank===p.assessmentRank?`<span class="arena-venue-badge">目前最高</span>`:"";
  return `<button class="arena-venue-card ${rank===p.assessmentRank?"assessment-target":""}" ${d.attempts>0?"":"disabled"} onclick="${d.attempts>0?`selectArenaVenueForDifficulty(${rank})`:"void(0)"}"><div class="arena-venue-rank">第 ${rank} 個競技場 ${target}</div><strong>${venueName(rank)}</strong><span>低／中／高難三種挑戰</span><small>${points}</small></button>`;
 }
 function venueSelectionHtml(){
  const d=ensureDungeonProgressState(),p=getArenaProgressState?getArenaProgressState():getArenaWindowState(),a=getArenaAssessmentStatus();
  const cards=p.visibleRanks.map(rank=>venueCard(rank,p,d)).join("");
  const visibleText=p.visibleRanks.length===1?"目前只開放 1 個競技場":`目前顯示最近 ${p.visibleRanks.length} 個已解鎖競技場`;
  return `<div class="function-page dungeon-page-shell arena-shell arena-venue-page"><div class="back-home"><button class="btn back-btn" onclick="go('dungeon')">← 返回副本</button></div><section class="arena-panel"><div class="arena-title">競技場</div><div class="arena-attempts">目前可挑戰次數：<strong>${d.attempts}</strong> 次・${visibleText}</div>${unlockPanelHtml(a,p)}<div class="arena-venue-grid">${cards}</div></section></div>`;
 }
 function difficultySelectionHtml(rank){
  const d=ensureDungeonProgressState(),configs=getArenaDifficultyConfigs(rank);
  const cards=configs.map(cfg=>`<button class="arena-venue-difficulty ${difficultyClass(cfg.id)}" ${d.attempts>0?"":"disabled"} onclick="${d.attempts>0?`startArenaVenueDifficulty(${rank},'${cfg.id}')`:"void(0)"}"><span>${difficultyDesc(cfg.id)}</span><strong>${difficultyLabel(cfg.id)}</strong><b>三戰全通 ${cfg.totalPoints} VIP 積分</b><small>${cfg.stagePoints.join(" + ")}</small></button>`).join("");
  return `<div class="function-page dungeon-page-shell arena-shell arena-venue-page"><div class="back-home"><button class="btn back-btn" onclick="backToArenaVenueList()">← 返回競技場</button></div><section class="arena-panel"><div class="arena-venue-kicker">第 ${rank} 個競技場</div><div class="arena-title">${venueName(rank)}</div><div class="arena-attempts">選擇挑戰難度・目前可挑戰 <strong>${d.attempts}</strong> 次</div><div class="arena-venue-difficulty-grid">${cards}</div></section></div>`;
 }
 window.selectArenaVenueForDifficulty=function(rank){
  const p=typeof getArenaProgressState==="function"?getArenaProgressState():getArenaWindowState(),r=Math.floor(Number(rank)||0);if(!p.visibleRanks.includes(r))return;
  selectedVenueRank=r;render();
 };
 window.backToArenaVenueList=function(){selectedVenueRank=null;if(typeof clearArenaVenueSelection==="function")clearArenaVenueSelection();render();};
 window.startArenaVenueDifficulty=function(rank,difficultyId){
  const r=Math.floor(Number(rank)||0);if(typeof selectArenaVenueRank!=="function"||!selectArenaVenueRank(r))return;
  selectedVenueRank=null;
  if(typeof baseStartArenaDungeon==="function")baseStartArenaDungeon(difficultyId);
 };
 window.openArenaDungeon=function(){selectedVenueRank=null;return typeof baseOpenArenaDungeon==="function"?baseOpenArenaDungeon():undefined;};
 window.renderArenaDungeon=function(){
  const core=typeof getArenaCoreState==="function"?getArenaCoreState():null;
  if(core?.phase==="select"){
   const p=typeof getArenaProgressState==="function"?getArenaProgressState():getArenaWindowState();
   if(selectedVenueRank&&!p.visibleRanks.includes(selectedVenueRank))selectedVenueRank=null;
   return selectedVenueRank?difficultySelectionHtml(selectedVenueRank):venueSelectionHtml();
  }
  return typeof baseRenderArenaDungeon==="function"?baseRenderArenaDungeon():"";
 };

 function enhanceActiveArenaNames(){
  if(view!=="dungeon-arena")return;
  const main=document.getElementById("main"),core=typeof getArenaCoreState==="function"?getArenaCoreState():null;if(!main||!core||core.phase==="select")return;
  const name=venueName(core.rank),id=core.difficulty?.id||"normal",label=difficultyLabel(id);
  if(core.phase==="ready"){
   const title=main.querySelector(".arena-ready-panel .arena-title");if(title)title.textContent=name;
  }else if(core.phase==="combat"){
   const head=main.querySelector(".arena-combat-head");if(head)head.textContent=`【競技場】 ${name}・${label}・第 ${(Number(core.stage)||0)+1} 戰${core.continuous?"・連續挑戰":""}`;
  }else if(core.phase==="result"){
   const diff=main.querySelector(".arena-result-difficulty");if(diff)diff.textContent=`${name}・${label}`;
  }
 }
 const baseRender=render;
 render=function(){const out=baseRender();enhanceActiveArenaNames();return out;};
 window.refreshArenaPlayerFlow2=enhanceActiveArenaNames;
})();