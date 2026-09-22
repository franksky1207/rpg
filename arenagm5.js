(function(){
 let arenaGm5Result="";
 let arenaGm5Summary=null;
 let arenaGm5World=Number(window.gmTestWorld)===2?2:1;
 function withArenaTestWorld(fn){const oldLevel=state.level,hadSecond=!!state.secondWorld,oldEntered=state?.secondWorld?.entered;if(!state.secondWorld||typeof state.secondWorld!=="object")state.secondWorld={};state.secondWorld.entered=arenaGm5World===2;state.level=arenaGm5World===2?Math.max(500,Math.min(1000,Math.floor(Number(window.gmTestLevel)||500))):Math.max(1,Math.min(500,Math.floor(Number(window.gmTestLevel)||1)));try{return fn();}finally{state.level=oldLevel;if(hadSecond)state.secondWorld.entered=oldEntered;else delete state.secondWorld;}}
 function venueName(rank){return withArenaTestWorld(()=>{if(typeof getArenaVenueName==="function")return getArenaVenueName(rank);const regions=arenaGm5World===2?(window.SECOND_WORLD_REGIONS||[]):WORLD_REGIONS;return `${regions?.[rank-1]?.name||`第${rank}區`}競技場`;});}
 function rankOptions(){
  const regions=arenaGm5World===2?(Array.isArray(window.SECOND_WORLD_REGIONS)?window.SECOND_WORLD_REGIONS:[]):(Array.isArray(WORLD_REGIONS)?WORLD_REGIONS:[]);
  const max=Math.max(1,regions.length||10);
  const current=1;
  let html="";
  for(let rank=1;rank<=max;rank++)html+=`<option value="${rank}" ${rank===current?"selected":""}>第 ${rank} 個｜${venueName(rank)}</option>`;
  return html;
 }
 function positionOptions(){return `<option value="normal">左位（低）</option><option value="hard">中位（中）</option><option value="extreme" selected>右位（高）</option>`;}
 function formalAssessmentPosition(rank){
  if(typeof getArenaPositionTemplateId==="function")return getArenaPositionTemplateId(rank);
  return rank<=1?"normal":rank===2?"hard":"extreme";
 }
 function testVip(){return Math.max(0,Math.min(VIP_MAX_LEVEL,Math.floor(Number(window.gmTestVipLevel)||0)));}
 function testPlayer(base){return typeof gmTestPlayerStats==="function"?gmTestPlayerStats(base):createSpecialPlayerSnapshot(playerCombatStats(base,testVip()));}
 function pct(v,n){return n?round1(v/n*100):0;}
 function positionLabel(id){return id==="extreme"?"右位（高）":id==="hard"?"中位（中）":"左位（低）";}
 function simulate(rank,positionId,runs){
  return withArenaTestWorld(()=>{
   const configs=typeof getArenaPositionConfigs==="function"?getArenaPositionConfigs(rank):[];
   const cfg=configs.find(x=>x.id===positionId);if(!cfg)return null;
   const base=typeof window.gmTestEnhancedEquippedStats==="function"?createSpecialPlayerSnapshot(window.gmTestEnhancedEquippedStats()):createSpecialPlayerSnapshot(equippedStats()),player=testPlayer(base);
   const marks=typeof window.markLevelsSnapshot==="function"?window.markLevelsSnapshot(true):null;
   const level=arenaGm5World===2?Math.max(500,Math.min(1000,Math.floor(Number(window.gmTestLevel)||500))):Math.max(1,Math.min(500,Math.floor(Number(window.gmTestLevel)||1)));
   const reached=[runs,0,0],wins=[0,0,0];let totalPoints=0,totalTurns=0,clearHpTotal=0,clearCount=0;
   for(let run=0;run<runs;run++){let hp=player.hp,points=0,cleared=true;for(let stage=0;stage<3;stage++){if(stage>0)reached[stage]++;const enemy=buildArenaEnemyForTest(positionId,stage,base,level,rank);const out=runCombatCore(player,enemy,hp,{logs:false,useTestSpecializations:true,useTestMarks:true,markLevels:marks});totalTurns+=out.turns;if(out.win){wins[stage]++;hp=out.hp;points+=Number(cfg.stagePoints?.[stage])||0;}else{cleared=false;break;}}if(cleared){clearCount++;clearHpTotal+=hp;}totalPoints+=points;}
   return {world:arenaGm5World,rank,positionId,cfg,runs,reached,wins,clearCount,totalPoints,totalTurns,avgPoints:round1(totalPoints/runs),avgTurns:round1(totalTurns/runs),avgClearHp:clearCount?round1(clearHpTotal/clearCount/player.hp*100):0};
  });
 }
 function resultHtml(s,assessment=false){
  if(!s)return `<div class="notice">找不到競技場測試資料。</div>`;
  const conditional=i=>pct(s.wins[i],s.reached[i]);
  const vipText=typeof gmTestVipLabel==="function"?gmTestVipLabel():`VIP${testVip()}`;
  const specText=typeof gmTestSpecializationLabel==="function"?gmTestSpecializationLabel():"套用目前 GM 測試專精";
  const qualified=assessment&&s.clearCount>=485;
  const summary=typeof gmTestSummaryHtml==="function"?gmTestSummaryHtml(`${s.world===2?"宇宙紀元":"銀河紀元"}・${venueName(s.rank)}・${positionLabel(s.positionId)}算法`,`${s.runs} 次完整三連戰`,vipText,specText):`<div class="gm-test-summary"><div class="gm-test-summary-title">${venueName(s.rank)}・${positionLabel(s.positionId)}算法・${s.runs} 次完整三連戰</div><div class="gm-test-summary-line">${vipText}</div><div class="gm-test-summary-line">${specText}</div></div>`;
  return `<div class="notice">${summary}<div class="gm-test-summary-line">全通積分：${s.cfg.totalPoints}</div><div class="muted gm-test-context">HP／ATK／DEF 依競技場階層；暴擊、閃避與特性依位置。積分則依目前三格進度與位置一起調整。</div>${assessment?`<div class="notice" style="margin-top:10px;border-left-color:${qualified?"#6eaa78":"#d0ad63"}"><b>正式戰力評估：${s.clearCount} / 500（${pct(s.clearCount,500)}%）・${qualified?"通過":"未通過"}</b><div class="muted">正式解鎖下一個競技場時，仍需對應主線區域已開放。</div></div>`:""}<div class="stats" style="margin-top:10px;grid-template-columns:repeat(auto-fit,minmax(135px,1fr))"><div class="stat">第1戰通過<b>${pct(s.wins[0],s.runs)}%</b></div><div class="stat">第2戰到達<b>${pct(s.reached[1],s.runs)}%</b></div><div class="stat">第2戰條件通過<b>${conditional(1)}%</b></div><div class="stat">第3戰到達<b>${pct(s.reached[2],s.runs)}%</b></div><div class="stat">第3戰條件通過<b>${conditional(2)}%</b></div><div class="stat">全通率<b>${pct(s.clearCount,s.runs)}%</b></div><div class="stat">平均積分<b>${s.avgPoints}</b></div><div class="stat">全通平均剩餘 HP<b>${s.avgClearHp}%</b></div><div class="stat">平均總回合<b>${s.avgTurns}</b></div></div></div>`;
 }
 window.gmArena5Run100=function(){
  if(battleBusy)return;
  const rank=Math.max(1,Math.floor(Number(document.getElementById("gmArenaRank5")?.value)||1));
  const positionId=document.getElementById("gmArenaPosition5")?.value||"extreme";
  const button=document.getElementById("gmArenaRun100Btn5");if(button){button.disabled=true;button.textContent="測試中…";}
  battleBusy=true;try{arenaGm5Summary=simulate(rank,positionId,100);if(arenaGm5Summary)arenaGm5Summary.assessment=false;arenaGm5Result=resultHtml(arenaGm5Summary,false);}finally{battleBusy=false;}
  const box=document.getElementById("gmArenaTestResult");if(box)box.innerHTML=arenaGm5Result;
  if(button){button.disabled=false;button.textContent="100 次完整三連戰";}
 };
 window.gmArena5RunPromotion=function(){
  if(battleBusy)return;
  const rank=Math.max(1,Math.floor(Number(document.getElementById("gmArenaRank5")?.value)||1));
  const positionId=formalAssessmentPosition(rank);
  const button=document.getElementById("gmArenaRun500Btn5");if(button){button.disabled=true;button.textContent="評估中…";}
  battleBusy=true;try{arenaGm5Summary=simulate(rank,positionId,500);if(arenaGm5Summary)arenaGm5Summary.assessment=true;arenaGm5Result=resultHtml(arenaGm5Summary,true);}finally{battleBusy=false;}
  const position=document.getElementById("gmArenaPosition5");if(position)position.value=positionId;
  const box=document.getElementById("gmArenaTestResult");if(box)box.innerHTML=arenaGm5Result;
  if(button){button.disabled=false;button.textContent="500 次正式戰力評估";}
 };
 function arenaGmBody(){
  const curveText=arenaGm5World===2?"宇宙紀元獨立強度曲線":"銀河紀元正式強度曲線";
  return `<div class="muted gm-hub-note">競技場可獨立選擇銀河／宇宙紀元；不受正式角色目前世界、Rank 或主線解鎖限制。玩家固定使用 GM 測試角色。<br>目前：${curveText}。</div><div class="controls" style="align-items:end"><label>紀元<br><select id="gmArenaWorld5" class="btn" onchange="gmArena5SetWorld(this.value)"><option value="1" ${arenaGm5World===1?"selected":""}>銀河紀元</option><option value="2" ${arenaGm5World===2?"selected":""}>宇宙紀元</option></select></label><label>競技場<br><select id="gmArenaRank5" class="btn">${rankOptions()}</select></label><label>位置算法<br><select id="gmArenaPosition5" class="btn">${positionOptions()}</select></label><button id="gmArenaRun100Btn5" class="btn blue" onclick="gmArena5Run100()">100 次完整三連戰</button><button id="gmArenaRun500Btn5" class="btn gm-create" onclick="gmArena5RunPromotion()">500 次正式戰力評估</button></div><div class="muted" style="margin-top:8px">正式評估門檻仍以 485 / 500（97%）呈現；此處只模擬，不修改正式競技場進度。</div><div id="gmArenaTestResult" style="margin-top:12px">${arenaGm5Result}</div>`;
 }
 window.gmArena5SetWorld=function(value){arenaGm5World=Number(value)===2?2:1;arenaGm5Result="";arenaGm5Summary=null;if(typeof render==="function")render();return arenaGm5World;};
 window.gmArena5TestWorld=function(){return arenaGm5World;};
 window.gmArena5TestHtml=arenaGmBody;
 function enhanceArenaGm(){
  if(!state?.gm)return;
  const hub=document.querySelector(".gm-hub");if(!hub)return;
  const section=Array.from(hub.querySelectorAll(".gm-hub-section")).find(el=>el.querySelector(":scope > summary")?.textContent.trim()==="競技場測試");
  const body=section?.querySelector(":scope > .gm-hub-body");if(!body||body.dataset.arenaGm5==="1")return;
  body.dataset.arenaGm5="1";body.innerHTML=arenaGmBody();
 }
 const baseRender=render;
 render=function(){const out=baseRender();enhanceArenaGm();return out;};
 window.GM_SECOND_WORLD_ARENA_CURVE_PREVIEW_VERSION=1;
 window.gmArena5ResultSnapshot=function(){return arenaGm5Summary?JSON.parse(JSON.stringify(arenaGm5Summary)):null;};
 window.gmClearArena5Result=function(){arenaGm5Result="";arenaGm5Summary=null;return true;};
 window.GM_ARENA_INDEPENDENT_WORLD_TEST_VERSION=1;
 window.GM_ARENA_SUMMARY_EXPORT_VERSION=1;
 window.refreshArenaGm5=enhanceArenaGm;
 enhanceArenaGm();
})();