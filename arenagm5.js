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
 function difficultyOptions(){return `<option value="normal">低難</option><option value="hard">中難</option><option value="extreme" selected>高難</option>`;}
 function testVip(){return Math.max(0,Math.min(VIP_MAX_LEVEL,Math.floor(Number(window.gmTestVipLevel)||0)));}
 function testPlayer(base){return typeof gmTestPlayerStats==="function"?gmTestPlayerStats(base):createSpecialPlayerSnapshot(playerCombatStats(base,testVip()));}
 function pct(v,n){return n?round1(v/n*100):0;}
 function simulate(rank,difficultyId,runs){
  const configs=typeof getArenaDifficultyConfigs==="function"?getArenaDifficultyConfigs(rank):[];
  const cfg=configs.find(x=>x.id===difficultyId);if(!cfg)return null;
  const base=createSpecialPlayerSnapshot(equippedStats()),player=testPlayer(base);
  const reached=[runs,0,0],wins=[0,0,0];
  let totalPoints=0,totalTurns=0,clearHpTotal=0,clearCount=0;
  for(let run=0;run<runs;run++){
   let hp=player.hp,points=0,cleared=true;
   for(let stage=0;stage<3;stage++){
    if(stage>0)reached[stage]++;
    const enemy=buildArenaEnemyForTest(difficultyId,stage,base,state.level,rank);
    const r=runCombatCore(player,enemy,hp,{logs:false,useTestSpecializations:true});
    totalTurns+=r.turns;
    if(r.win){wins[stage]++;hp=r.hp;points+=Number(cfg.stagePoints?.[stage])||0;}else{cleared=false;break;}
   }
   if(cleared){clearCount++;clearHpTotal+=hp;}
   totalPoints+=points;
  }
  return {rank,difficultyId,cfg,runs,reached,wins,clearCount,totalPoints,totalTurns,avgPoints:round1(totalPoints/runs),avgTurns:round1(totalTurns/runs),avgClearHp:clearCount?round1(clearHpTotal/clearCount/player.hp*100):0};
 }
 function difficultyLabel(id){return id==="extreme"?"高難":id==="hard"?"中難":"低難";}
 function resultHtml(s,assessment=false){
  if(!s)return `<div class="notice">找不到競技場測試資料。</div>`;
  const conditional=i=>pct(s.wins[i],s.reached[i]);
  const vipText=typeof gmTestVipLabel==="function"?gmTestVipLabel():`VIP${testVip()}`;
  const specText=typeof gmTestSpecializationLabel==="function"?gmTestSpecializationLabel():"套用目前 GM 測試專精";
  const qualified=assessment&&s.clearCount>=450;
  return `<div class="notice"><div class="gm-test-summary"><div class="gm-test-summary-title">${venueName(s.rank)}・${difficultyLabel(s.difficultyId)}・${s.runs} 次完整三連戰</div><div class="gm-test-summary-line">${vipText}</div><div class="gm-test-summary-line">${specText}</div></div><div class="muted gm-test-context">敵人以目前裝備／基礎能力生成，不含 VIP 與戰鬥專精；玩家套用本次 GM 測試 VIP 與測試專精。三戰殘血連續，每個新敵人可重新觸發先制。GM 測試不扣副本次數、不給 VIP 積分、不修改正式角色資料。</div>${assessment?`<div class="notice" style="margin-top:10px;border-left-color:${qualified?"#6eaa78":"#d0ad63"}"><b>戰力評估：${s.clearCount} / 500（${pct(s.clearCount,500)}%）・${qualified?"通過":"未通過"}</b><div class="muted">戰力門檻為高難 500 次中至少 450 次全通。正式玩家仍需另外通過下一競技場對應的主線區域評估，雙評估都通過才可顯示下一組競技場。</div></div>`:""}<div class="stats" style="margin-top:10px;grid-template-columns:repeat(auto-fit,minmax(135px,1fr))"><div class="stat">第1戰通過<b>${pct(s.wins[0],s.runs)}%</b></div><div class="stat">第2戰到達<b>${pct(s.reached[1],s.runs)}%</b></div><div class="stat">第2戰條件通過<b>${conditional(1)}%</b></div><div class="stat">第3戰到達<b>${pct(s.reached[2],s.runs)}%</b></div><div class="stat">第3戰條件通過<b>${conditional(2)}%</b></div><div class="stat">全通率<b>${pct(s.clearCount,s.runs)}%</b></div><div class="stat">平均積分<b>${s.avgPoints}</b></div><div class="stat">全通平均剩餘 HP<b>${s.avgClearHp}%</b></div><div class="stat">平均總回合<b>${s.avgTurns}</b></div></div></div>`;
 }
 window.gmArena5Run100=function(){
  if(battleBusy)return;
  const rank=Math.max(1,Math.floor(Number(document.getElementById("gmArenaRank5")?.value)||1));
  const difficultyId=document.getElementById("gmArenaDifficulty5")?.value||"extreme";
  const button=document.getElementById("gmArenaRun100Btn5");if(button){button.disabled=true;button.textContent="測試中…";}
  battleBusy=true;try{arenaGm5Result=resultHtml(simulate(rank,difficultyId,100),false);}finally{battleBusy=false;}
  const box=document.getElementById("gmArenaTestResult");if(box)box.innerHTML=arenaGm5Result;
  if(button){button.disabled=false;button.textContent="100 次完整三連戰";}
 };
 window.gmArena5RunPromotion=function(){
  if(battleBusy)return;
  const rank=Math.max(1,Math.floor(Number(document.getElementById("gmArenaRank5")?.value)||1));
  const button=document.getElementById("gmArenaRun500Btn5");if(button){button.disabled=true;button.textContent="評估中…";}
  battleBusy=true;try{arenaGm5Result=resultHtml(simulate(rank,"extreme",500),true);}finally{battleBusy=false;}
  const difficulty=document.getElementById("gmArenaDifficulty5");if(difficulty)difficulty.value="extreme";
  const box=document.getElementById("gmArenaTestResult");if(box)box.innerHTML=arenaGm5Result;
  if(button){button.disabled=false;button.textContent="500 次戰力評估（高難）";}
 };
 function arenaGmBody(){
  return `<div class="muted gm-hub-note">可直接測試全部 10 個競技場，不受正式角色目前三競技場視窗或主線解鎖限制。敵人不含 VIP／專精；玩家套用上方 GM 測試 VIP 與測試專精。</div><div class="controls" style="align-items:end"><label>競技場<br><select id="gmArenaRank5" class="btn">${rankOptions()}</select></label><label>難度<br><select id="gmArenaDifficulty5" class="btn">${difficultyOptions()}</select></label><button id="gmArenaRun100Btn5" class="btn blue" onclick="gmArena5Run100()">100 次完整三連戰</button><button id="gmArenaRun500Btn5" class="btn gm-create" onclick="gmArena5RunPromotion()">500 次戰力評估（高難）</button></div><div class="muted" style="margin-top:8px">500 次戰力評估固定使用高難；450 / 500 以上視為戰力通過。正式玩家還要通過下一競技場對應的主線區域評估，才可推進三競技場視窗。</div><div id="gmArenaTestResult" style="margin-top:12px">${arenaGm5Result}</div>`;
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
