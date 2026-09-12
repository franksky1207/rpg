(function(){
 let arenaGm5Result="";
 function venueName(rank){
  if(typeof getArenaVenueName==="function")return getArenaVenueName(rank);
  return `${WORLD_REGIONS?.[rank-1]?.name||`第${rank}區`}競技場`;
 }
 function rankOptions(){
  const max=Math.max(1,Array.isArray(WORLD_REGIONS)?WORLD_REGIONS.length:1);
  const current=typeof getArenaAssessmentRank==="function"?getArenaAssessmentRank():(typeof getArenaCurrentRank==="function"?getArenaCurrentRank():1);
  let html="";
  for(let rank=1;rank<=max;rank++)html+=`<option value="${rank}" ${rank===current?"selected":""}>第 ${rank} 個｜${venueName(rank)}</option>`;
  return html;
 }
 function positionOptions(){return `<option value="normal">左位（低）</option><option value="hard">中位（中）</option><option value="extreme" selected>右位（高）</option>`;}
 function formalAssessmentPosition(rank){return rank<=1?"normal":rank===2?"hard":"extreme";}
 function testVip(){return Math.max(0,Math.min(VIP_MAX_LEVEL,Math.floor(Number(window.gmTestVipLevel)||0)));}
 function testPlayer(base){return typeof gmTestPlayerStats==="function"?gmTestPlayerStats(base):createSpecialPlayerSnapshot(playerCombatStats(base,testVip()));}
 function pct(v,n){return n?round1(v/n*100):0;}
 function positionLabel(id){return id==="extreme"?"右位（高）":id==="hard"?"中位（中）":"左位（低）";}
 function simulate(rank,positionId,runs){
  const configs=typeof getArenaDifficultyConfigs==="function"?getArenaDifficultyConfigs(rank):[];
  const cfg=configs.find(x=>x.id===positionId);if(!cfg)return null;
  const base=createSpecialPlayerSnapshot(equippedStats()),player=testPlayer(base);
  const reached=[runs,0,0],wins=[0,0,0];
  let totalPoints=0,totalTurns=0,clearHpTotal=0,clearCount=0;
  for(let run=0;run<runs;run++){
   let hp=player.hp,points=0,cleared=true;
   for(let stage=0;stage<3;stage++){
    if(stage>0)reached[stage]++;
    const enemy=buildArenaEnemyForTest(positionId,stage,base,state.level,rank);
    const r=runCombatCore(player,enemy,hp,{logs:false,useTestSpecializations:true});
    totalTurns+=r.turns;
    if(r.win){wins[stage]++;hp=r.hp;points+=Number(cfg.stagePoints?.[stage])||0;}else{cleared=false;break;}
   }
   if(cleared){clearCount++;clearHpTotal+=hp;}
   totalPoints+=points;
  }
  return {rank,positionId,cfg,runs,reached,wins,clearCount,totalPoints,totalTurns,avgPoints:round1(totalPoints/runs),avgTurns:round1(totalTurns/runs),avgClearHp:clearCount?round1(clearHpTotal/clearCount/player.hp*100):0};
 }
 function resultHtml(s,assessment=false){
  if(!s)return `<div class="notice">找不到競技場測試資料。</div>`;
  const conditional=i=>pct(s.wins[i],s.reached[i]);
  const vipText=typeof gmTestVipLabel==="function"?gmTestVipLabel():`VIP${testVip()}`;
  const specText=typeof gmTestSpecializationLabel==="function"?gmTestSpecializationLabel():"套用目前 GM 測試專精";
  const qualified=assessment&&s.clearCount>=485;
  return `<div class="notice"><div class="gm-test-summary"><div class="gm-test-summary-title">${venueName(s.rank)}・${positionLabel(s.positionId)}算法・${s.runs} 次完整三連戰</div><div class="gm-test-summary-line">全通積分：${s.cfg.totalPoints}</div><div class="gm-test-summary-line">${vipText}</div><div class="gm-test-summary-line">${specText}</div></div><div class="muted gm-test-context">HP／ATK／DEF 依競技場階層；暴擊、閃避與特性依位置。積分則依目前三格進度與位置一起調整。</div>${assessment?`<div class="notice" style="margin-top:10px;border-left-color:${qualified?"#6eaa78":"#d0ad63"}"><b>正式戰力評估：${s.clearCount} / 500（${pct(s.clearCount,500)}%）・${qualified?"通過":"未通過"}</b><div class="muted">正式解鎖下一個競技場時，仍需對應主線區域已開放。</div></div>`:""}<div class="stats" style="margin-top:10px;grid-template-columns:repeat(auto-fit,minmax(135px,1fr))"><div class="stat">第1戰通過<b>${pct(s.wins[0],s.runs)}%</b></div><div class="stat">第2戰到達<b>${pct(s.reached[1],s.runs)}%</b></div><div class="stat">第2戰條件通過<b>${conditional(1)}%</b></div><div class="stat">第3戰到達<b>${pct(s.reached[2],s.runs)}%</b></div><div class="stat">第3戰條件通過<b>${conditional(2)}%</b></div><div class="stat">全通率<b>${pct(s.clearCount,s.runs)}%</b></div><div class="stat">平均積分<b>${s.avgPoints}</b></div><div class="stat">全通平均剩餘 HP<b>${s.avgClearHp}%</b></div><div class="stat">平均總回合<b>${s.avgTurns}</b></div></div></div>`;
 }
 window.gmArena5Run100=function(){
  if(battleBusy)return;
  const rank=Math.max(1,Math.floor(Number(document.getElementById("gmArenaRank5")?.value)||1));
  const positionId=document.getElementById("gmArenaPosition5")?.value||"extreme";
  const button=document.getElementById("gmArenaRun100Btn5");if(button){button.disabled=true;button.textContent="測試中…";}
  battleBusy=true;try{arenaGm5Result=resultHtml(simulate(rank,positionId,100),false);}finally{battleBusy=false;}
  const box=document.getElementById("gmArenaTestResult");if(box)box.innerHTML=arenaGm5Result;
  if(button){button.disabled=false;button.textContent="100 次完整三連戰";}
 };
 window.gmArena5RunPromotion=function(){
  if(battleBusy)return;
  const rank=Math.max(1,Math.floor(Number(document.getElementById("gmArenaRank5")?.value)||1));
  const positionId=formalAssessmentPosition(rank);
  const button=document.getElementById("gmArenaRun500Btn5");if(button){button.disabled=true;button.textContent="評估中…";}
  battleBusy=true;try{arenaGm5Result=resultHtml(simulate(rank,positionId,500),true);}finally{battleBusy=false;}
  const position=document.getElementById("gmArenaPosition5");if(position)position.value=positionId;
  const box=document.getElementById("gmArenaTestResult");if(box)box.innerHTML=arenaGm5Result;
  if(button){button.disabled=false;button.textContent="500 次正式戰力評估";}
 };
 function arenaGmBody(){
  return `<div class="muted gm-hub-note">競技場名稱固定依主線區域。100次測試可自由指定位置算法；積分會同步使用目前正式的三格推進規則。</div><div class="controls" style="align-items:end"><label>競技場<br><select id="gmArenaRank5" class="btn">${rankOptions()}</select></label><label>位置算法<br><select id="gmArenaPosition5" class="btn">${positionOptions()}</select></label><button id="gmArenaRun100Btn5" class="btn blue" onclick="gmArena5Run100()">100 次完整三連戰</button><button id="gmArenaRun500Btn5" class="btn gm-create" onclick="gmArena5RunPromotion()">500 次正式戰力評估</button></div><div class="muted" style="margin-top:8px">正式評估需至少 97% 全通；積分測試沿用目前正式的三格推進規則。</div><div id="gmArenaTestResult" style="margin-top:12px">${arenaGm5Result}</div>`;
 }
 function enhanceArenaGm(){
  if(!state?.gm)return;
  const hub=document.querySelector(".gm-hub");if(!hub)return;
  const section=Array.from(hub.querySelectorAll(".gm-hub-section")).find(el=>el.querySelector(":scope > summary")?.textContent.trim()==="競技場測試");
  const body=section?.querySelector(":scope > .gm-hub-body");if(!body||body.dataset.arenaGm5==="1")return;
  body.dataset.arenaGm5="1";body.innerHTML=arenaGmBody();
 }
 const baseRender=render;
 render=function(){const out=baseRender();enhanceArenaGm();return out;};
 window.refreshArenaGm5=enhanceArenaGm;
 enhanceArenaGm();
})();
