(function(){
 let bountyTestHtml="";
 let arenaTestHtml="";
 let voidMirageTestHtml="";
 let mapMonsterTestHtml="";
 let mapTestMap=0;
 let mapTestEnemy=0;
 const VOID_MIRAGE_GM_SIM_LIMIT=10000;

 function testPercent(value,total=GM_TEST_RUNS){return total?round1(value/total*100):0;}
 function showTestResult(id,html){const box=document.getElementById(id);if(box)box.innerHTML=html;}
 function setTestButton(button,busy,label){if(!button)return;button.disabled=busy;button.textContent=busy?"測試中…":label;}
 function testVip(){return Math.max(0,Math.min(VIP_MAX_LEVEL,Math.floor(Number(window.gmTestVipLevel)||0)));}
 function vipLabel(){return typeof gmTestVipLabel==="function"?gmTestVipLabel():`VIP${testVip()}`;}
 function testSummary(title,runLabel,specText=null){return gmTestSummaryHtml(title,runLabel,vipLabel(),specText);}
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
  const selected=Math.max(start,Math.min(end,Math.floor(Number(selectedMap)||start)));
  let html="";for(let i=start;i<=end;i++){const map=MAPS[i];if(map)html+=`<option value="${i}" ${i===selected?"selected":""}>${i+1}. ${map.name}（Lv.${map.min}～${map.max}）</option>`;}return html;
 }
 function enemyOptionsForMap(mapIdx,selectedEnemy=mapTestEnemy){
  const i=Math.max(0,Math.min(MAPS.length-1,Math.floor(Number(mapIdx)||0))),map=MAPS[i];if(!map)return "";
  const selected=Math.max(0,Math.min(map.enemies.length-1,Math.floor(Number(selectedEnemy)||0)));
  return map.enemies.map((e,eIdx)=>{const kind=e[2]==="boss"?"Boss":e[2]==="elite"?"菁英":"普通";return `<option value="${eIdx}" ${eIdx===selected?"selected":""}>${kind}｜${e[0]} Lv.${e[1]}</option>`;}).join("");
 }

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

 let secondWorldTestRegion=0;
 let secondWorldTestBoss=0;
 let secondWorldBossTestHtml="";
 function secondWorldRegionList(){
  return Array.isArray(window.SECOND_WORLD_REGIONS)?window.SECOND_WORLD_REGIONS:[];
 }
 function secondWorldRegionAt(index=secondWorldTestRegion){
  const regions=secondWorldRegionList();
  const i=Math.max(0,Math.min(regions.length-1,Math.floor(Number(index)||0)));
  return regions[i]||null;
 }
 function secondWorldBossListForRegion(regionIndex=secondWorldTestRegion){
  if(typeof window.secondWorldBossesForRegion==="function")return window.secondWorldBossesForRegion(regionIndex);
  const region=secondWorldRegionAt(regionIndex);
  const bosses=Array.isArray(window.SECOND_WORLD_BOSSES)?window.SECOND_WORLD_BOSSES:[];
  return region?bosses.filter(b=>Number(b.regionIndex)===Number(region.index)):[];
 }
 function secondWorldRegionOptions(){
  return secondWorldRegionList().map((region,i)=>`<option value="${i}" ${i===secondWorldTestRegion?"selected":""}>${region.name}（Lv.${region.minLevel}～${region.maxLevel}）</option>`).join("");
 }
 function secondWorldBossOptions(regionIndex=secondWorldTestRegion){
  const bosses=secondWorldBossListForRegion(regionIndex);
  return bosses.map(boss=>`<option value="${boss.index}" ${boss.index===secondWorldTestBoss?"selected":""}>Boss ${boss.index+1}｜${boss.name} Lv.${boss.level}</option>`).join("");
 }
 function normalizeSecondWorldGmSelection(){
  const regions=secondWorldRegionList();
  if(!regions.length){secondWorldTestRegion=0;secondWorldTestBoss=0;return;}
  secondWorldTestRegion=Math.max(0,Math.min(regions.length-1,Math.floor(Number(secondWorldTestRegion)||0)));
  const bosses=secondWorldBossListForRegion(secondWorldTestRegion);
  if(!bosses.length){secondWorldTestBoss=0;return;}
  if(!bosses.some(b=>b.index===secondWorldTestBoss))secondWorldTestBoss=bosses[0].index;
 }
 function clearSecondWorldBossTest(){secondWorldBossTestHtml="";showTestResult("gmSecondWorldBossTestResult","");}
 window.getSecondWorldBossGmSelection=function(){normalizeSecondWorldGmSelection();return {regionIdx:secondWorldTestRegion,bossIdx:secondWorldTestBoss};};
 window.getSecondWorldBossGmRegionOptions=function(){normalizeSecondWorldGmSelection();return secondWorldRegionOptions();};
 window.getSecondWorldBossGmOptions=function(regionIdx=secondWorldTestRegion){
  secondWorldTestRegion=Math.max(0,Math.min(secondWorldRegionList().length-1,Math.floor(Number(regionIdx)||0)));
  normalizeSecondWorldGmSelection();
  return secondWorldBossOptions(secondWorldTestRegion);
 };
 window.getSecondWorldBossGmTestHtml=function(){return secondWorldBossTestHtml;};
 window.SECOND_WORLD_GM_SPECIALIZATION_SEMANTICS_VERSION=1;
 window.gmSecondWorldRegionChange=function(){
  const regionSelect=document.getElementById("gmSecondWorldRegion"),bossSelect=document.getElementById("gmSecondWorldBoss");
  if(!regionSelect||!bossSelect)return;
  secondWorldTestRegion=Math.max(0,Math.min(secondWorldRegionList().length-1,Math.floor(Number(regionSelect.value)||0)));
  const bosses=secondWorldBossListForRegion(secondWorldTestRegion);
  secondWorldTestBoss=bosses[0]?.index??0;
  bossSelect.innerHTML=secondWorldBossOptions(secondWorldTestRegion);
  bossSelect.value=String(secondWorldTestBoss);
  clearSecondWorldBossTest();
 };
 window.gmSecondWorldBossChange=function(){
  const el=document.getElementById("gmSecondWorldBoss");
  const bosses=secondWorldBossListForRegion(secondWorldTestRegion);
  const requested=Math.floor(Number(el?.value));
  secondWorldTestBoss=bosses.some(b=>b.index===requested)?requested:(bosses[0]?.index??0);
  clearSecondWorldBossTest();
 };
 function secondWorldBossResultHtml(boss,summary){
  const region=typeof window.secondWorldRegion==="function"?window.secondWorldRegion(boss.regionIndex):null;
  const reward=summary.reward||null;
  const economy=typeof window.specializationWorldEconomySummary==="function"?window.specializationWorldEconomySummary({secondWorld:{entered:true}},true).text:"";
  const specText=(typeof gmTestSpecializationLabel==="function"?gmTestSpecializationLabel():"專精")+(economy?`｜經濟：${economy}`:"");
  return `<div class="notice">${testSummary(`宇宙紀元｜${region?.name?region.name+"｜":""}${boss.name} Lv.${boss.level}`,`${GM_TEST_RUNS} 次模擬`,specText)}<div class="muted gm-test-context">使用正式宇宙 Boss 能力公式與 Boss 隨機特性；玩家套用本次 GM 測試 VIP／專精／強化／印記。純沙盒，不修改正式進度、EXP、HP 或存檔。</div></div>
  <div class="stats" style="margin-top:10px;grid-template-columns:repeat(auto-fit,minmax(140px,1fr))">
   <div class="stat">勝率<b>${summary.winRate}%</b></div>
   <div class="stat">勝利平均剩餘 HP<b>${summary.avgWinHp}%</b></div>
   <div class="stat">平均回合<b>${summary.avgTurns}</b></div>
   <div class="stat">平均 Boss HP<b>${Math.round(summary.avgEnemyHp).toLocaleString()}</b></div>
   <div class="stat">平均 Boss ATK<b>${Math.round(summary.avgEnemyAtk).toLocaleString()}</b></div>
   <div class="stat">平均 Boss DEF<b>${Math.round(summary.avgEnemyDef).toLocaleString()}</b></div>
  </div>${reward?`<div class="notice" style="margin-top:9px"><b>正式單場勝利獎勵預覽</b><div class="muted" style="margin-top:5px">EXP +${reward.xp.toLocaleString()}　／　暗物質 +${reward.darkMatter.toLocaleString()}　／　暗能量 +1　／　固定 1 件 Lv.${reward.equipmentLevel} 裝備</div></div>`:""}<div class="muted" style="margin-top:7px">特性出現：${summary.traits||"無"}</div>`;
 }
 window.gmStartSecondWorldBossTest=function(){
  if(battleBusy)return;
  normalizeSecondWorldGmSelection();
  const regionSelect=document.getElementById("gmSecondWorldRegion"),select=document.getElementById("gmSecondWorldBoss");
  if(regionSelect)secondWorldTestRegion=Math.max(0,Math.min(secondWorldRegionList().length-1,Math.floor(Number(regionSelect.value)||secondWorldTestRegion)));
  const bosses=secondWorldBossListForRegion(secondWorldTestRegion);
  const requested=Math.floor(Number(select?.value));
  const index=bosses.some(b=>b.index===requested)?requested:(bosses[0]?.index??secondWorldTestBoss);
  secondWorldTestBoss=index;
  const boss=typeof window.secondWorldBoss==="function"?window.secondWorldBoss(index):null;
  if(!boss||typeof window.secondWorldBossEncounter!=="function"||typeof window.runSecondWorldBossCombat!=="function")return alert("宇宙紀元 Boss 戰鬥資料尚未載入。");
  const button=document.getElementById("gmSecondWorldBossStartBtn");setTestButton(button,true,`開始測試（${GM_TEST_RUNS} 次）`);
  const sandbox=gmCreateSandboxSnapshot(),basePlayer=createSpecialPlayerSnapshot(equippedStats()),player=testPlayer(basePlayer);
  const traits={},summary={wins:0,losses:0,winHpTotal:0,totalTurns:0,enemyHp:0,enemyAtk:0,enemyDef:0,reward:typeof window.secondWorldMainlineRewardPreview==="function"?window.secondWorldMainlineRewardPreview(index,{state,useTestSpecializations:true}):null};
  battleBusy=true;
  for(let i=0;i<GM_TEST_RUNS;i++){
   gmResetSandbox(sandbox);state.vipLevel=testVip();
   const encounter=window.secondWorldBossEncounter(index);
   if(!encounter)continue;
   summary.enemyHp+=encounter.hp;summary.enemyAtk+=encounter.atk;summary.enemyDef+=encounter.def;
   (encounter.traits||[]).forEach(key=>traits[key]=(traits[key]||0)+1);
   const result=window.runSecondWorldBossCombat(index,{ignoreUnlock:true,encounter,player,startHp:player.hp,logs:false,preparePresentation:false,useTestSpecializations:true,useTestMarks:true});
   if(!result.ok)continue;
   summary.totalTurns+=Math.max(0,Number(result.turns)||0);
   if(result.win){summary.wins++;summary.winHpTotal+=Math.max(0,Number(result.hp)||0);}else summary.losses++;
  }
  const completed=Math.max(1,summary.wins+summary.losses);
  summary.winRate=testPercent(summary.wins,completed);
  summary.avgWinHp=summary.wins?round1(summary.winHpTotal/summary.wins/player.hp*100):0;
  summary.avgTurns=round1(summary.totalTurns/completed);
  summary.avgEnemyHp=summary.enemyHp/completed;summary.avgEnemyAtk=summary.enemyAtk/completed;summary.avgEnemyDef=summary.enemyDef/completed;
  summary.traits=Object.entries(traits).map(([key,count])=>{const t=window.MONSTER_TRAITS?.[key];return `${t?.name||key} ${round1(count/completed*100)}%`;}).join("｜");
  gmRestoreSandbox(sandbox);battleBusy=false;
  secondWorldBossTestHtml=secondWorldBossResultHtml(boss,summary);
  showTestResult("gmSecondWorldBossTestResult",secondWorldBossTestHtml);
  if(regionSelect)regionSelect.value=String(secondWorldTestRegion);
  if(select)select.value=String(secondWorldTestBoss);
  setTestButton(button,false,`開始測試（${GM_TEST_RUNS} 次）`);
 };

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

 window.gmSimulateBounty=function(tierId){
  const tier=typeof getBountyTierMeta==="function"?getBountyTierMeta(tierId):null;if(!tier)return alert("找不到懸賞資料。");
  const base=createSpecialPlayerSnapshot(equippedStats()),player=testPlayer(base),summary={wins:0,totalTurns:0,winHpTotal:0};
  for(let i=0;i<GM_TEST_RUNS;i++){const enemy=buildBountyEnemyForTest(tierId,base,state.level),r=simulateFight(player,enemy);summary.totalTurns+=r.turns;if(r.win){summary.wins++;summary.winHpTotal+=r.hp;}}
  const winRate=testPercent(summary.wins),avgWinHp=summary.wins?round1(summary.winHpTotal/summary.wins/player.hp*100):0,avgTurns=round1(summary.totalTurns/GM_TEST_RUNS);
  showBountyTest(`<div class="notice">${testSummary(tier.name,`${GM_TEST_RUNS} 次模擬`)}<div class="muted gm-test-context">敵人生成不含 VIP；玩家戰鬥使用本次測試 VIP 與專精。</div><div class="stats" style="margin-top:10px;grid-template-columns:repeat(auto-fit,minmax(140px,1fr))"><div class="stat">勝率<b>${winRate}%</b></div><div class="stat">勝利平均剩餘 HP<b>${avgWinHp}%</b></div><div class="stat">平均回合<b>${avgTurns}</b></div></div></div>`);
 };

 window.gmSimulateArena=function(positionId){
  const cfg=(typeof getArenaPositionConfigs==="function"?getArenaPositionConfigs():[]).find(x=>x.id===positionId);if(!cfg)return alert("找不到競技場資料。");
  const base=createSpecialPlayerSnapshot(equippedStats()),player=testPlayer(base),reached=[GM_TEST_RUNS,0,0],wins=[0,0,0],vip=testVip();
  let totalBasePoints=0,totalVipPoints=0,clearHpTotal=0,totalTurns=0;
  for(let run=0;run<GM_TEST_RUNS;run++){
   let hp=player.hp,basePoints=0,cleared=true;
   for(let stage=0;stage<3;stage++){
    if(stage>0)reached[stage]++;
    const enemy=buildArenaEnemyForTest(positionId,stage,base,state.level),r=simulateFight(player,enemy,hp);totalTurns+=r.turns;
    if(r.win){wins[stage]++;hp=r.hp;basePoints+=Number(cfg.stagePoints?.[stage])||0;}else{cleared=false;break;}
   }
   if(cleared)clearHpTotal+=hp;
   totalBasePoints+=basePoints;
   totalVipPoints+=typeof adjustVipDungeonPoints==="function"?adjustVipDungeonPoints(basePoints,vip):basePoints;
  }
  const clearCount=wins[2],avgBasePoints=round1(totalBasePoints/GM_TEST_RUNS),avgVipPoints=round1(totalVipPoints/GM_TEST_RUNS),avgClearHp=clearCount?round1(clearHpTotal/clearCount/player.hp*100):0,avgTurns=round1(totalTurns/GM_TEST_RUNS),conditional=stage=>testPercent(wins[stage],reached[stage]);
  showArenaTest(`<div class="notice">${testSummary(cfg.name,`${GM_TEST_RUNS} 次完整三連戰`)}<div class="muted gm-test-context">敵人生成不含 VIP；玩家三戰鎖定本次測試 VIP 能力並套用測試專精；每個新敵人都重新獲得一次先制。積分依正式規則在每輪結束時一次套用測試 VIP 倍率。</div><div class="stats" style="margin-top:10px"><div class="stat">第1戰通過<b>${testPercent(wins[0])}%</b></div><div class="stat">第2戰到達<b>${testPercent(reached[1])}%</b></div><div class="stat">第2戰條件通過<b>${conditional(1)}%</b></div><div class="stat">第3戰到達<b>${testPercent(reached[2])}%</b></div><div class="stat">第3戰條件通過<b>${conditional(2)}%</b></div><div class="stat">全通率<b>${testPercent(clearCount)}%</b></div><div class="stat">平均基礎積分<b>${avgBasePoints}</b></div><div class="stat">平均實得 VIP 積分<b>${avgVipPoints}</b></div><div class="stat">全通平均剩餘 HP<b>${avgClearHp}%</b></div><div class="stat">平均總回合<b>${avgTurns}</b></div></div></div>`);
 };

 function gmVoidFloorValue(){const raw=Number(document.getElementById("gmVoidMirageFloor")?.value);return Number.isFinite(raw)&&raw>=1?Math.floor(raw):null;}
 window.gmPreviewVoidMirageFloor=function(){
  const floor=gmVoidFloorValue();if(!floor)return alert("請輸入 1 以上的起始樓層。");if(typeof buildVoidMirageEnemy!=="function")return alert("虛空幻境資料尚未載入。");
  const base=typeof voidMirageBaseStats==="function"?voidMirageBaseStats(floor):null,enemy=buildVoidMirageEnemy(floor),boss=!!enemy.isBossFloor;
  const rewardBase=floor*2,reward=typeof adjustVipDungeonPoints==="function"?adjustVipDungeonPoints(rewardBase,testVip()):rewardBase;
  showVoidMirageTest(`<div class="notice"><b>虛空幻境・第 ${floor} 層${boss?"（雙特性關卡）":""}</b><div class="muted" style="margin-top:7px">名稱：${enemy.name}</div>${base?`<div class="muted" style="margin-top:4px">基礎能力：${enemyLine(base)}</div>`:""}<div class="muted" style="margin-top:4px">本次特性後：${enemyLine(enemy)}</div><div class="muted" style="margin-top:4px">特性：${traitDetail(enemy)}</div><div class="muted" style="margin-top:4px">若第 ${floor} 層成為當日最高：基礎每日獎勵 ${rewardBase.toLocaleString()} VIP，依目前測試 VIP 實得 ${reward.toLocaleString()} VIP。</div></div>`);
 };

 window.gmSimulateVoidMirageClimb=function(){
  const startFloor=gmVoidFloorValue();if(!startFloor)return alert("請輸入 1 以上的起始樓層。");if(typeof buildVoidMirageEnemy!=="function")return alert("虛空幻境資料尚未載入。");
  const player=testPlayer();let floor=startFloor,cleared=0,totalTurns=0,lastWinHp=player.hp,lastWinFloor=startFloor-1,previousName="",failedEnemy=null,hitSafetyLimit=false;
  while(cleared<VOID_MIRAGE_GM_SIM_LIMIT){const enemy=buildVoidMirageEnemy(floor,{previousName});if(!enemy.isBossFloor)previousName=enemy.name;const r=simulateFight(player,enemy,player.hp);totalTurns+=r.turns;if(!r.win){failedEnemy=enemy;break;}cleared++;lastWinFloor=floor;lastWinHp=r.hp;floor++;}
  if(cleared>=VOID_MIRAGE_GM_SIM_LIMIT)hitSafetyLimit=true;
  const avgTurns=cleared?round1(totalTurns/cleared):0,lastHpPct=cleared?round1(lastWinHp/player.hp*100):0,stopFloor=hitSafetyLimit?floor:(failedEnemy?.floor||floor),rewardBase=cleared?lastWinFloor*2:0,reward=typeof adjustVipDungeonPoints==="function"?adjustVipDungeonPoints(rewardBase,testVip()):rewardBase;
  showVoidMirageTest(`<div class="notice">${testSummary("虛空幻境",`從第 ${startFloor} 層連續爬塔`)}<div class="muted gm-test-context">每層皆以滿血開始下一層；以下每日獎勵是假設最後成功樓層成為當日最高時的結果。</div><div class="stats" style="margin-top:10px"><div class="stat">起始樓層<b>${startFloor}</b></div><div class="stat">成功層數<b>${cleared}</b></div><div class="stat">最後成功樓層<b>${cleared?lastWinFloor:"—"}</b></div><div class="stat">停止／失敗樓層<b>${stopFloor}</b></div><div class="stat">基礎每日獎勵<b>${rewardBase.toLocaleString()}</b></div><div class="stat">測試 VIP 實得<b>${reward.toLocaleString()}</b></div><div class="stat">平均戰鬥回合<b>${avgTurns}</b></div><div class="stat">最後成功剩餘 HP<b>${cleared?`${lastWinHp}（${lastHpPct}%）`:"—"}</b></div></div></div>`);
 };

 window.getBountyGmTestHtml=function(){return bountyTestHtml;};
 window.getArenaGmTestHtml=function(){return arenaTestHtml;};
 window.getVoidMirageGmTestHtml=function(){return voidMirageTestHtml;};
})();