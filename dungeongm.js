(function(){
 let bountyTestHtml="";
 let arenaTestHtml="";
 let voidMirageTestHtml="";
 let mapMonsterTestHtml="";
 let mapTestMap=0;
 let mapTestEnemy=0;
 const VOID_MIRAGE_GM_SIM_LIMIT=10000;

 function dungeonState(){return ensureDungeonProgressState();}
 function testPercent(value,total=GM_TEST_RUNS){return total?round1(value/total*100):0;}
 function showTestResult(id,html){const box=document.getElementById(id);if(box)box.innerHTML=html;}
 function setTestButton(button,busy,label){if(!button)return;button.disabled=busy;button.textContent=busy?"測試中…":label;}
 function testVip(){return Math.max(0,Math.min(VIP_MAX_LEVEL,Math.floor(Number(window.gmTestVipLevel)||0)));}
 function vipLabel(){return typeof gmTestVipLabel==="function"?gmTestVipLabel():`VIP${testVip()}`;}
 function testSummary(title,runLabel){return gmTestSummaryHtml(title,runLabel,vipLabel());}
 function testPlayer(base=null){return typeof gmTestPlayerStats==="function"?gmTestPlayerStats(base):createSpecialPlayerSnapshot(playerCombatStats(base||equippedStats(),testVip()));}
 function traitDetail(enemy){
  if(!enemy?.traits?.length)return "無";
  return enemy.traits.map(id=>{const t=MONSTER_TRAITS?.[id];return t?`${t.name}（${t.desc}）`:id;}).join("、");
 }
 function enemyLine(e){return `HP ${e.hp}　ATK ${e.atk}　DEF ${e.def}　暴擊 ${e.crit}%　閃避 ${e.dodge}%`;}
 function showBountyTest(html){bountyTestHtml=html;showTestResult("gmBountyTestResult",html);}
 function showArenaTest(html){arenaTestHtml=html;showTestResult("gmArenaTestResult",html);}
 function showVoidMirageTest(html){voidMirageTestHtml=html;showTestResult("gmVoidMirageTestResult",html);}
 function simulateFight(player,enemy,startHp=player.hp){return runCombatCore(player,enemy,startHp,{logs:false,useTestSpecializations:true});}
 function regionIndexForMap(mapIdx){
  const idx=Math.max(0,Math.min(MAPS.length-1,Math.floor(Number(mapIdx)||0)));
  const found=WORLD_REGIONS.findIndex(region=>idx>=region.mapStart&&idx<=region.mapEnd);
  return found>=0?found:0;
 }
 function regionAt(index){return WORLD_REGIONS[Math.max(0,Math.min(WORLD_REGIONS.length-1,Math.floor(Number(index)||0)))]||WORLD_REGIONS[0];}
 function mapOptionsForRegion(regionIndex,selectedMap=mapTestMap){
  const region=regionAt(regionIndex);if(!region)return "";
  const start=Math.max(0,region.mapStart),end=Math.min(MAPS.length-1,region.mapEnd);
  const selected=Math.max(start,Math.min(end,Math.floor(Number(selectedMap)||start));
  let html="";for(let i=start;i<=end;i++){const map=MAPS[i];if(map)html+=`<option value="${i}" ${i===selected?"selected":""}>${i+1}. ${map.name}（Lv.${map.min}～${map.max}）</option>`;}return html;
 }
 function enemyOptionsForMap(mapIdx,selectedEnemy=mapTestEnemy){
  const i=Math.max(0,Math.min(MAPS.length-1,Math.floor(Number(mapIdx)||0))),map=MAPS[i];if(!map)return "";
  const selected=Math.max(0,Math.min(map.enemies.length-1,Math.floor(Number(selectedEnemy)||0)));
  return map.enemies.map((e,eIdx)=>{const kind=e[2]==="boss"?"Boss":e[2]==="elite"?"菁英":"普通";return `<option value="${eIdx}" ${eIdx===selected?"selected":""}>${kind}｜${e[0]} Lv.${e[1]}</option>`;}).join("");
 }

 window.gmApplyDungeonValues=function(){
  const progress=Number(document.getElementById("gmDungeonProgress")?.value);
  const attempts=Math.floor(Number(document.getElementById("gmDungeonAttempts")?.value));
  const points=Math.floor(Number(document.getElementById("gmDungeonPoints")?.value));
  if(!Number.isFinite(progress)||progress<0||!Number.isFinite(attempts)||attempts<0||!Number.isFinite(points)||points<0){alert("請輸入 0 以上的數字。");return;}
  const d=dungeonState();
  d.progress=progress;d.attempts=attempts;state.vipPoints=points;d.points=points;
  normalizeVipState(state);ensureDungeonProgressState();save();render();
 };

 function clearMapMonsterTest(){mapMonsterTestHtml="";showTestResult("gmMapMonsterTestResult","");}
 window.gmMapMonsterChangeRegion=function(){
  const regionSelect=document.getElementById("gmMapMonsterRegion"),mapSelect=document.getElementById("gmMapMonsterMap"),enemySelect=document.getElementById("gmMapMonsterEnemy");
  if(!regionSelect||!mapSelect||!enemySelect)return;
  const regionIndex=Math.max(0,Math.min(WORLD_REGIONS.length-1,Math.floor(Number(regionSelect.value)||0))),region=regionAt(regionIndex);if(!region)return;
  mapTestMap=mapTestMap>=region.mapStart&&mapTestMap<=region.mapEnd?mapTestMap:region.mapStart;
  mapTestEnemy=Math.max(0,Math.min((MAPS[mapTestMap]?.enemies?.length||1)-1,mapTestEnemy));
  mapSelect.innerHTML=mapOptionsForRegion(regionIndex,mapTestMap);mapSelect.value=String(mapTestMap);
  enemySelect.innerHTML=enemyOptionsForMap(mapTestMap,mapTestEnemy);enemySelect.value=String(mapTestEnemy);clearMapMonsterTest();
 };
 window.gmMapMonsterChangeMap=function(){
  const mapSelect=document.getElementById("gmMapMonsterMap"),enemySelect=document.getElementById("gmMapMonsterEnemy");
  if(!mapSelect||!enemySelect)return;
  mapTestMap=Math.max(0,Math.min(MAPS.length-1,Number(mapSelect.value)||0));
  mapTestEnemy=Math.max(0,Math.min((MAPS[mapTestMap]?.enemies?.length||1)-1,mapTestEnemy));
  enemySelect.innerHTML=enemyOptionsForMap(mapTestMap,mapTestEnemy);enemySelect.value=String(mapTestEnemy);clearMapMonsterTest();
 };
 window.gmMapMonsterChangeEnemy=function(){const enemySelect=document.getElementById("gmMapMonsterEnemy");if(!enemySelect)return;mapTestEnemy=Math.max(0,Math.min(MAPS[mapTestMap].enemies.length-1,Number(enemySelect.value)||0));clearMapMonsterTest();};
 window.getMapMonsterGmSelection=function(){return {regionIdx:regionIndexForMap(mapTestMap),mapIdx:mapTestMap,eIdx:mapTestEnemy};};
 window.getMapMonsterGmMapOptions=function(regionIdx,mapIdx=mapTestMap){return mapOptionsForRegion(regionIdx,mapIdx);};
 window.getMapMonsterGmEnemyOptions=function(mapIdx,eIdx=mapTestEnemy){return enemyOptionsForMap(mapIdx,eIdx);};
 window.getMapMonsterGmTestHtml=function(){return mapMonsterTestHtml;};

 function mapMonsterResultHtml(mapIdx,eIdx,summary){
  const map=MAPS[mapIdx],base=map.enemies[eIdx],region=WORLD_REGIONS[regionIndexForMap(mapIdx)];
  return `<div class="notice">${testSummary(`${region?.name?region.name+"｜":""}${map.name}｜${base[0]}`,`${GM_TEST_RUNS} 次模擬`)}<div class="muted gm-test-context">敵人使用不含 VIP 的角色基準；玩家戰鬥使用本次測試 VIP 與專精。正式角色資料未變更。</div></div>
   <div class="stats" style="margin-top:10px;grid-template-columns:repeat(auto-fit,minmax(140px,1fr))">
    <div class="stat">勝率<b>${summary.winRate}%</b></div>
    <div class="stat">勝利平均剩餘 HP<b>${summary.avgWinHp}%</b></div>
    <div class="stat">死亡掉裝次數<b>${summary.deathDrops}</b></div>
   </div>
   ${summary.vip20Protected?`<div class="muted" style="margin-top:6px">VIP20 成功保護裝備 ${summary.vip20Protected} 次</div>`:""}
   ${gmRewardSummaryHtml(summary)}`;
 }

 window.gmStartMapMonsterTest=function(){
  if(battleBusy)return;
  const mapSelect=document.getElementById("gmMapMonsterMap"),enemySelect=document.getElementById("gmMapMonsterEnemy");
  const mapIdx=Math.max(0,Math.min(MAPS.length-1,Number(mapSelect?.value)||0));
  const eIdx=Math.max(0,Math.min(MAPS[mapIdx].enemies.length-1,Number(enemySelect?.value)||0));
  mapTestMap=mapIdx;mapTestEnemy=eIdx;
  const button=document.getElementById("gmMapMonsterStartBtn");setTestButton(button,true,`開始測試（${GM_TEST_RUNS} 次）`);
  const sandbox=gmCreateSandboxSnapshot(),basePlayer=createSpecialPlayerSnapshot(equippedStats()),player=testPlayer(basePlayer);
  const summary={wins:0,losses:0,winHpTotal:0,deathDrops:0,vip20Protected:0,totalXp:0,totalGold:0,convertedGold:0,dropCount:0,totalSellValue:0,qualityCounts:Array(QUALITY.length).fill(0)};
  battleBusy=true;
  for(let i=0;i<GM_TEST_RUNS;i++){
   gmResetSandbox(sandbox);state.vipLevel=testVip();state.hp=player.hp;
   let enemy=null;try{enemy=typeof createMonsterEncounter==="function"?createMonsterEncounter(mapIdx,eIdx):monsterObj(mapIdx,eIdx);}catch(e){}
   if(!enemy)continue;
   const r=simulateFight(player,enemy,player.hp);
   if(r.win){
    summary.wins++;summary.winHpTotal+=r.hp;
    const xp=Math.max(0,Math.ceil(Number(expReward(enemy,true))||0)),gold=Math.max(0,Math.ceil(Number(goldReward(enemy,true))||0));
    if(state.level>=MAX_LEVEL){summary.convertedGold+=xp;summary.totalGold+=gold+xp;}else{summary.totalXp+=xp;summary.totalGold+=gold;}
    const drops=[];const first=dropItem(enemy,mapIdx);if(first)drops.push(first);
    if(enemy.kind==="boss"&&testVip()>=16&&Math.random()<.15){const extra=dropItem(enemy,mapIdx);if(extra)drops.push(extra);}
    drops.forEach(item=>{summary.dropCount++;summary.totalSellValue+=specializationSellValue(item,true);summary.qualityCounts[item.q]=(summary.qualityCounts[item.q]||0)+1;});
   }else{
    summary.losses++;state.hp=0;const penalty=applyDeathPenalty([]);if(penalty?.dropped)summary.deathDrops++;if(penalty?.protectedByVip20)summary.vip20Protected++;
   }
  }
  summary.winRate=testPercent(summary.wins);summary.avgWinHp=summary.wins?round1(summary.winHpTotal/summary.wins/player.hp*100):0;
  gmRestoreSandbox(sandbox);battleBusy=false;
  mapMonsterTestHtml=mapMonsterResultHtml(mapIdx,eIdx,summary);showTestResult("gmMapMonsterTestResult",mapMonsterTestHtml);
  if(mapSelect)mapSelect.value=String(mapTestMap);if(enemySelect)enemySelect.value=String(mapTestEnemy);setTestButton(button,false,`開始測試（${GM_TEST_RUNS} 次）`);
 };

 window.gmSimulateBounty100=function(tierId){
  const tier=getBountyTierConfig(tierId);if(!tier)return alert("找不到懸賞資料。");
  const base=createSpecialPlayerSnapshot(equippedStats()),player=testPlayer(base),summary={wins:0,totalTurns:0,winHpTotal:0};
  for(let i=0;i<GM_TEST_RUNS;i++){const enemy=buildBountyEnemyForTest(tierId,base,state.level),r=simulateFight(player,enemy);summary.totalTurns+=r.turns;if(r.win){summary.wins++;summary.winHpTotal+=r.hp;}}
  const winRate=testPercent(summary.wins),avgWinHp=summary.wins?round1(summary.winHpTotal/summary.wins/player.hp*100):0,avgTurns=round1(summary.totalTurns/GM_TEST_RUNS);
  showBountyTest(`<div class="notice">${testSummary(tier.name,`${GM_TEST_RUNS} 次模擬`)}<div class="muted gm-test-context">敵人生成不含 VIP；玩家戰鬥使用本次測試 VIP 與專精。</div><div class="stats" style="margin-top:10px;grid-template-columns:repeat(auto-fit,minmax(140px,1fr))"><div class="stat">勝率<b>${winRate}%</b></div><div class="stat">勝利平均剩餘 HP<b>${avgWinHp}%</b></div><div class="stat">平均回合<b>${avgTurns}</b></div></div></div>`);
 };

 window.gmSimulateArena100=function(difficultyId){
  const cfg=(typeof getArenaDifficultyConfigs==="function"?getArenaDifficultyConfigs():[]).find(x=>x.id===difficultyId);if(!cfg)return alert("找不到競技場資料。");
  const base=createSpecialPlayerSnapshot(equippedStats()),player=testPlayer(base),reached=[GM_TEST_RUNS,0,0],wins=[0,0,0];
  let totalPoints=0,clearHpTotal=0,totalTurns=0;
  for(let run=0;run<GM_TEST_RUNS;run++){
   let hp=player.hp,points=0,cleared=true;
   for(let stage=0;stage<3;stage++){
    if(stage>0)reached[stage]++;
    const enemy=buildArenaEnemyForTest(difficultyId,stage,base,state.level),r=simulateFight(player,enemy,hp);totalTurns+=r.turns;
    if(r.win){wins[stage]++;hp=r.hp;points+=Number(cfg.stagePoints?.[stage])||0;}else{cleared=false;break;}
   }
   if(cleared)clearHpTotal+=hp;totalPoints+=points;
  }
  const clearCount=wins[2],avgPoints=round1(totalPoints/GM_TEST_RUNS),avgClearHp=clearCount?round1(clearHpTotal/clearCount/player.hp*100):0,avgTurns=round1(totalTurns/GM_TEST_RUNS),conditional=stage=>testPercent(wins[stage],reached[stage]);
  showArenaTest(`<div class="notice">${testSummary(cfg.name,`${GM_TEST_RUNS} 次完整三連戰`)}<div class="muted gm-test-context">敵人生成不含 VIP；玩家三戰鎖定本次測試 VIP 能力並套用測試專精；每個新敵人都重新獲得一次先制。</div><div class="stats" style="margin-top:10px"><div class="stat">第1戰通過<b>${testPercent(wins[0])}%</b></div><div class="stat">第2戰到達<b>${testPercent(reached[1])}%</b></div><div class="stat">第2戰條件通過<b>${conditional(1)}%</b></div><div class="stat">第3戰到達<b>${testPercent(reached[2])}%</b></div><div class="stat">第3戰條件通過<b>${conditional(2)}%</b></div><div class="stat">全通率<b>${testPercent(clearCount)}%</b></div><div class="stat">平均積分<b>${avgPoints}</b></div><div class="stat">全通平均剩餘 HP<b>${avgClearHp}%</b></div><div class="stat">平均總回合<b>${avgTurns}</b></div></div></div>`);
 };

 function gmVoidFloorValue(){const raw=Number(document.getElementById("gmVoidMirageFloor")?.value);return Number.isFinite(raw)&&raw>=1?Math.floor(raw):null;}
 window.gmPreviewVoidMirageFloor=function(){
  const floor=gmVoidFloorValue();if(!floor)return alert("請輸入 1 以上的起始樓層。");if(typeof buildVoidMirageEnemy!=="function")return alert("虛空幻境資料尚未載入。");
  const base=typeof voidMirageBaseStats==="function"?voidMirageBaseStats(floor):null,enemy=buildVoidMirageEnemy(floor),boss=!!enemy.isBossFloor;
  showVoidMirageTest(`<div class="notice"><b>虛空幻境・第 ${floor} 層${boss?"（雙特性關卡）":""}</b><div class="muted" style="margin-top:7px">名稱：${enemy.name}</div>${base?`<div class="muted" style="margin-top:4px">基礎能力：${enemyLine(base)}</div>`:""}<div class="muted" style="margin-top:4px">本次特性後：${enemyLine(enemy)}</div><div class="muted" style="margin-top:4px">特性：${traitDetail(enemy)}</div><div class="muted" style="margin-top:4px">首通積分：${typeof voidMirageFirstClearPoints==="function"?voidMirageFirstClearPoints(floor):enemy.firstClearPoints||0}</div></div>`);
 };

 window.gmSimulateVoidMirageClimb=function(){
  const startFloor=gmVoidFloorValue();if(!startFloor)return alert("請輸入 1 以上的起始樓層。");if(typeof buildVoidMirageEnemy!=="function")return alert("虛空幻境資料尚未載入。");
  const player=testPlayer();let floor=startFloor,cleared=0,totalPoints=0,totalTurns=0,lastWinHp=player.hp,lastWinFloor=startFloor-1,previousName="",failedEnemy=null,hitSafetyLimit=false;
  while(cleared<VOID_MIRAGE_GM_SIM_LIMIT){const enemy=buildVoidMirageEnemy(floor,{previousName});if(!enemy.isBossFloor)previousName=enemy.name;const r=simulateFight(player,enemy,player.hp);totalTurns+=r.turns;if(!r.win){failedEnemy=enemy;break;}cleared++;lastWinFloor=floor;lastWinHp=r.hp;totalPoints+=typeof voidMirageFirstClearPoints==="function"?voidMirageFirstClearPoints(floor):Number(enemy.firstClearPoints)||0;floor++;}
  if(cleared>=VOID_MIRAGE_GM_SIM_LIMIT)hitSafetyLimit=true;
  const avgPoints=cleared?round1(totalPoints/cleared):0,avgTurns=cleared?round1(totalTurns/cleared):0,lastHpPct=cleared?round1(lastWinHp/player.hp*100):0,stopFloor=hitSafetyLimit?floor:(failedEnemy?.floor||floor);
  showVoidMirageTest(`<div class="notice">${testSummary("虛空幻境",`從第 ${startFloor} 層連續爬塔`)}<div class="stats" style="margin-top:10px"><div class="stat">起始樓層<b>${startFloor}</b></div><div class="stat">成功層數<b>${cleared}</b></div><div class="stat">最後成功樓層<b>${cleared?lastWinFloor:"—"}</b></div><div class="stat">停止／失敗樓層<b>${stopFloor}</b></div><div class="stat">本次總積分<b>${totalPoints}</b></div><div class="stat">平均每層積分<b>${avgPoints}</b></div><div class="stat">平均戰鬥回合<b>${avgTurns}</b></div><div class="stat">最後成功剩餘 HP<b>${cleared?`${lastWinHp}（${lastHpPct}%）`:"—"}</b></div></div></div>`);
 };

 window.getBountyGmTestHtml=function(){return bountyTestHtml;};
 window.getArenaGmTestHtml=function(){return arenaTestHtml;};
 window.getVoidMirageGmTestHtml=function(){return voidMirageTestHtml;};
})();