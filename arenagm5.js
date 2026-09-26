(function(){
 let arenaGm5Result="";
 let arenaGm5Summary=null;
 let arenaGm5Results={};
 let arenaGm5World=Number(window.gmTestWorld)===2?2:1;
 let arenaGm5Rank=1;
 let arenaGm5PositionId="extreme";
 function gmArenaTestLevel(){return arenaGm5World===2?Math.max(500,Math.min(1000,Math.floor(Number(window.gmTestLevel)||500))):Math.max(1,Math.min(500,Math.floor(Number(window.gmTestLevel)||1)));}
 function venueName(rank){
  if(typeof window.getArenaVenueNameForWorld==="function")return window.getArenaVenueNameForWorld(rank,arenaGm5World);
  const regions=arenaGm5World===2?(window.SECOND_WORLD_REGIONS||[]):WORLD_REGIONS;
  return `${regions?.[rank-1]?.name||`第${rank}區`}競技場`;
 }
 function rankOptions(){
  const regions=arenaGm5World===2?(Array.isArray(window.SECOND_WORLD_REGIONS)?window.SECOND_WORLD_REGIONS:[]):(Array.isArray(WORLD_REGIONS)?WORLD_REGIONS:[]);
  const max=Math.max(1,regions.length||10);
  const current=Math.max(1,Math.min(max,Math.floor(Number(arenaGm5Rank)||1)));
  arenaGm5Rank=current;
  let html="";
  for(let rank=1;rank<=max;rank++)html+=`<option value="${rank}" ${rank===current?"selected":""}>第 ${rank} 個｜${venueName(rank)}</option>`;
  return html;
 }
 function positionOptions(){return ["normal","hard","extreme"].map(id=>`<option value="${id}" ${id===arenaGm5PositionId?"selected":""}>${positionLabel(id)}</option>`).join("");}
 function formalAssessmentPosition(rank){
  if(typeof getArenaPositionTemplateId==="function")return getArenaPositionTemplateId(rank);
  return rank<=1?"normal":rank===2?"hard":"extreme";
 }
 function testVip(){return typeof window.normalizeVipLevel==="function"?window.normalizeVipLevel(window.gmTestVipLevel):Math.max(0,Math.floor(Number(window.gmTestVipLevel)||0));}
 function testPlayer(base){return typeof gmTestPlayerStats==="function"?gmTestPlayerStats(base):createSpecialPlayerSnapshot(playerCombatStats(base,testVip()));}
 function pct(v,n){return n?round1(v/n*100):0;}
 function positionLabel(id){return id==="extreme"?"右位（高）":id==="hard"?"中位（中）":"左位（低）";}
 function simulate(rank,positionId,runs){
   const configs=typeof getArenaPositionConfigs==="function"?getArenaPositionConfigs(rank,arenaGm5World):[];
   const cfg=configs.find(x=>x.id===positionId);if(!cfg)return null;
   const base=typeof window.gmTestEnhancedEquippedStats==="function"?createSpecialPlayerSnapshot(window.gmTestEnhancedEquippedStats()):createSpecialPlayerSnapshot(equippedStats()),player=testPlayer(base);
   const marks=typeof window.markLevelsSnapshot==="function"?window.markLevelsSnapshot(true):null;
   const civilizationLevel=typeof window.gmTestCivilizationLevelValue==="function"?window.gmTestCivilizationLevelValue():0;
   const civilizationMultiplier=typeof window.civilizationCombatDamageMultiplier==="function"?window.civilizationCombatDamageMultiplier({world:arenaGm5World,civilizationLevel}):1;
   const level=gmArenaTestLevel();
   const reached=[runs,0,0],wins=[0,0,0];let totalPoints=0,totalVipPoints=0,totalTurns=0,clearHpTotal=0,clearCount=0;
   for(let run=0;run<runs;run++){let hp=player.hp,points=0,cleared=true;for(let stage=0;stage<3;stage++){if(stage>0)reached[stage]++;const enemy=buildArenaEnemyForTest(positionId,stage,base,level,rank,arenaGm5World,civilizationLevel);const out=runCombatCore(player,enemy,hp,{logs:false,useTestSpecializations:true,useTestMarks:true,markLevels:marks,playerFinalDamageMultiplier:civilizationMultiplier});totalTurns+=out.turns;if(out.win){wins[stage]++;hp=out.hp;points+=Number(cfg.stagePoints?.[stage])||0;}else{cleared=false;break;}}if(cleared){clearCount++;clearHpTotal+=hp;}totalPoints+=points;totalVipPoints+=typeof adjustVipDungeonPoints==="function"?adjustVipDungeonPoints(points,testVip()):points;}
   return {world:arenaGm5World,rank,positionId,cfg,runs,reached,wins,clearCount,totalPoints,totalVipPoints,totalTurns,avgPoints:round1(totalPoints/runs),avgVipPoints:round1(totalVipPoints/runs),avgTurns:round1(totalTurns/runs),avgClearHp:clearCount?round1(clearHpTotal/clearCount/player.hp*100):0,civilizationLevel,civilizationDamageMultiplier:civilizationMultiplier};
 }
 function resultHtml(s,assessment=false){
  if(!s)return `<div class="notice">找不到競技場測試資料。</div>`;
  const conditional=i=>pct(s.wins[i],s.reached[i]);
  const vipText=typeof gmTestVipLabel==="function"?gmTestVipLabel():`VIP${testVip()}`;
  const specText=typeof gmTestSpecializationLabel==="function"?gmTestSpecializationLabel():"套用目前 GM 測試專精";
  const qualified=assessment&&s.clearCount>=485;
  const summary=typeof gmTestSummaryHtml==="function"?gmTestSummaryHtml(`${s.world===2?"宇宙紀元":"銀河紀元"}・${venueName(s.rank)}・${positionLabel(s.positionId)}算法`,`${s.runs} 次完整三連戰`,vipText,specText):`<div class="gm-test-summary"><div class="gm-test-summary-title">${venueName(s.rank)}・${positionLabel(s.positionId)}算法・${s.runs} 次完整三連戰</div><div class="gm-test-summary-line">${vipText}</div><div class="gm-test-summary-line">${specText}</div></div>`;
  return `<div class="notice">${summary}<div class="gm-test-summary-line">全通積分：${s.cfg.totalPoints}</div><div class="muted gm-test-context">HP／ATK／DEF 依競技場階層；暴擊、閃避與特性依位置。積分則依目前三格進度與位置一起調整。</div>${assessment?`<div class="notice" style="margin-top:10px;border-left-color:${qualified?"#6eaa78":"#d0ad63"}"><b>正式戰力評估：${s.clearCount} / 500（${pct(s.clearCount,500)}%）・${qualified?"通過":"未通過"}</b><div class="muted">正式解鎖下一個競技場時，仍需對應主線區域已開放。</div></div>`:""}<div class="stats" style="margin-top:10px;grid-template-columns:repeat(auto-fit,minmax(135px,1fr))"><div class="stat">第1戰通過<b>${pct(s.wins[0],s.runs)}%</b></div><div class="stat">第2戰到達<b>${pct(s.reached[1],s.runs)}%</b></div><div class="stat">第2戰條件通過<b>${conditional(1)}%</b></div><div class="stat">第3戰到達<b>${pct(s.reached[2],s.runs)}%</b></div><div class="stat">第3戰條件通過<b>${conditional(2)}%</b></div><div class="stat">全通率<b>${pct(s.clearCount,s.runs)}%</b></div><div class="stat">平均基礎積分<b>${s.avgPoints}</b></div><div class="stat">平均 VIP 實得積分<b>${s.avgVipPoints}</b></div><div class="stat">全通平均剩餘 HP<b>${s.avgClearHp}%</b></div><div class="stat">平均總回合<b>${s.avgTurns}</b></div></div></div>`;
 }
 window.gmArena5Run100=function(){
  if(battleBusy)return;
  const rank=Math.max(1,Math.floor(Number(document.getElementById("gmArenaRank5")?.value)||arenaGm5Rank||1));
  const positionId=document.getElementById("gmArenaPosition5")?.value||arenaGm5PositionId||"extreme";
  arenaGm5Rank=rank;arenaGm5PositionId=positionId;
  const button=document.getElementById("gmArenaRun100Btn5");if(button){button.disabled=true;button.textContent="測試中…";}
  battleBusy=true;
  try{
   arenaGm5Summary=simulate(rank,positionId,100);
   if(arenaGm5Summary){arenaGm5Summary.assessment=false;arenaGm5Results[String(arenaGm5Summary.world)+":"+rank+":"+positionId+":100"]=JSON.parse(JSON.stringify(arenaGm5Summary));}
   arenaGm5Result=resultHtml(arenaGm5Summary,false);
   const box=document.getElementById("gmArenaTestResult");if(box)box.innerHTML=arenaGm5Result;
  }catch(error){
   console.error("GM arena benchmark failed",error);
   arenaGm5Result='<div class="notice">競技場測試執行失敗，請重新整理後再試。</div>';
   const box=document.getElementById("gmArenaTestResult");if(box)box.innerHTML=arenaGm5Result;
  }finally{
   battleBusy=false;
   if(button){button.disabled=false;button.textContent="100 次完整三連戰";}
  }
  if(typeof window.gmPowerBenchmarkRefreshSummary==="function")window.gmPowerBenchmarkRefreshSummary();
 };
 window.gmArena5RunPromotion=function(){
  if(battleBusy)return;
  const rank=Math.max(1,Math.floor(Number(document.getElementById("gmArenaRank5")?.value)||arenaGm5Rank||1));
  const positionId=formalAssessmentPosition(rank);
  arenaGm5Rank=rank;arenaGm5PositionId=positionId;
  const button=document.getElementById("gmArenaRun500Btn5");if(button){button.disabled=true;button.textContent="評估中…";}
  battleBusy=true;
  try{
   arenaGm5Summary=simulate(rank,positionId,500);
   if(arenaGm5Summary){arenaGm5Summary.assessment=true;arenaGm5Results[String(arenaGm5Summary.world)+":"+rank+":"+positionId+":500"]=JSON.parse(JSON.stringify(arenaGm5Summary));}
   arenaGm5Result=resultHtml(arenaGm5Summary,true);
   const position=document.getElementById("gmArenaPosition5");if(position)position.value=positionId;
   const box=document.getElementById("gmArenaTestResult");if(box)box.innerHTML=arenaGm5Result;
  }catch(error){
   console.error("GM arena assessment failed",error);
   arenaGm5Result='<div class="notice">競技場正式戰力評估失敗，請重新整理後再試。</div>';
   const box=document.getElementById("gmArenaTestResult");if(box)box.innerHTML=arenaGm5Result;
  }finally{
   battleBusy=false;
   if(button){button.disabled=false;button.textContent="500 次正式戰力評估";}
  }
  if(typeof window.gmPowerBenchmarkRefreshSummary==="function")window.gmPowerBenchmarkRefreshSummary();
 };
 function arenaGmBody(){
  const curveText=arenaGm5World===2?"宇宙紀元獨立強度曲線":"銀河紀元正式強度曲線";
  return `<div class="muted gm-hub-note">競技場可獨立選擇銀河／宇宙紀元；不受正式角色目前世界、Rank 或主線解鎖限制。玩家固定使用 GM 測試角色。<br>目前：${curveText}。</div><div class="controls" style="align-items:end"><label>紀元<br><select id="gmArenaWorld5" class="btn" onchange="gmArena5SetWorld(this.value)"><option value="1" ${arenaGm5World===1?"selected":""}>銀河紀元</option><option value="2" ${arenaGm5World===2?"selected":""}>宇宙紀元</option></select></label><label>競技場<br><select id="gmArenaRank5" class="btn" onchange="gmArena5SetRank(this.value)">${rankOptions()}</select></label><label>位置算法<br><select id="gmArenaPosition5" class="btn" onchange="gmArena5SetPosition(this.value)">${positionOptions()}</select></label><button id="gmArenaRun100Btn5" class="btn blue" onclick="gmArena5Run100()">100 次完整三連戰</button><button id="gmArenaRun500Btn5" class="btn gm-create" onclick="gmArena5RunPromotion()">500 次正式戰力評估</button></div><div class="muted" style="margin-top:8px">正式評估門檻仍以 485 / 500（97%）呈現；此處只模擬，不修改正式競技場進度。</div><div id="gmArenaTestResult" style="margin-top:12px">${arenaGm5Result}</div>`;
 }
 window.gmArena5SetWorld=function(value){arenaGm5World=Number(value)===2?2:1;arenaGm5Result="";arenaGm5Summary=null;if(typeof render==="function")render();return arenaGm5World;};
 window.gmArena5SetRank=function(value){arenaGm5Rank=Math.max(1,Math.floor(Number(value)||1));return arenaGm5Rank;};
 window.gmArena5SetPosition=function(value){arenaGm5PositionId=["normal","hard","extreme"].includes(String(value))?String(value):"extreme";return arenaGm5PositionId;};
 window.gmArena5TestWorld=function(){return arenaGm5World;};
 window.gmArena5TestHtml=arenaGmBody;

 window.GM_SECOND_WORLD_ARENA_CURVE_PREVIEW_VERSION=1;
 window.gmArena5ResultSnapshot=function(){const rows=Object.values(arenaGm5Results);return rows.length?JSON.parse(JSON.stringify(rows)):null;};
 window.gmClearArena5Result=function(){arenaGm5Result="";arenaGm5Summary=null;arenaGm5Results={};return true;};
 window.GM_ARENA_INDEPENDENT_WORLD_TEST_VERSION=1;
 window.GM_ARENA_SUMMARY_EXPORT_VERSION=1;
 window.GM_ARENA_SESSION_SETTINGS_VERSION=1;
 window.GM_ARENA_STATE_ISOLATION_VERSION=1;
 window.GM_ARENA_LEGACY_INJECTION_RETIRED_VERSION=1;
 window.GM_ARENA_CIVILIZATION_DAMAGE_VERSION=2;
 window.GM_ARENA_CIVILIZATION_COMBAT_OWNER_VERSION=1;
 window.GM_SECOND_WORLD_ARENA_CIVILIZATION_SCALING_VERSION=1;
 window.GM_ARENA_UNBOUNDED_VIP_OWNER_VERSION=1;
 window.GM_ARENA_TEST_CLEANUP_VERSION=1;
})();