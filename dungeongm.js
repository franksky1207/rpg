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
 function traitDetail(enemy){
  if(!enemy?.traits?.length)return "無";
  return enemy.traits.map(id=>{const t=MONSTER_TRAITS?.[id];return t?`${t.name}（${t.desc}）`:id;}).join("、");
 }
 function enemyLine(e){return `HP ${e.hp}　ATK ${e.atk}　DEF ${e.def}　暴擊 ${e.crit}%　閃避 ${e.dodge}%`;}
 function showBountyTest(html){bountyTestHtml=html;showTestResult("gmBountyTestResult",html);}
 function showArenaTest(html){arenaTestHtml=html;showTestResult("gmArenaTestResult",html);}
 function showVoidMirageTest(html){voidMirageTestHtml=html;showTestResult("gmVoidMirageTestResult",html);}

 window.gmApplyDungeonValues=function(){
  const progress=Number(document.getElementById("gmDungeonProgress")?.value);
  const attempts=Math.floor(Number(document.getElementById("gmDungeonAttempts")?.value));
  const points=Math.floor(Number(document.getElementById("gmDungeonPoints")?.value));
  if(!Number.isFinite(progress)||progress<0||!Number.isFinite(attempts)||attempts<0||!Number.isFinite(points)||points<0){alert("請輸入 0 以上的數字。");return;}
  const d=dungeonState();d.progress=progress;d.attempts=attempts;d.points=points;ensureDungeonProgressState();save();render();
 };

 function clearMapMonsterTest(){
  mapMonsterTestHtml="";
  showTestResult("gmMapMonsterTestResult","");
 }
 window.gmMapMonsterChangeMap=function(){
  const mapSelect=document.getElementById("gmMapMonsterMap"),enemySelect=document.getElementById("gmMapMonsterEnemy");
  if(!mapSelect||!enemySelect)return;
  mapTestMap=Math.max(0,Math.min(MAPS.length-1,Number(mapSelect.value)||0));
  mapTestEnemy=0;
  const map=MAPS[mapTestMap];
  enemySelect.innerHTML=map.enemies.map((e,eIdx)=>{const kind=e[2]==="boss"?"Boss":e[2]==="elite"?"菁英":"普通";return `<option value="${eIdx}">${kind}｜${e[0]} Lv.${e[1]}</option>`;}).join("");
  enemySelect.value="0";
  clearMapMonsterTest();
 };
 window.gmMapMonsterChangeEnemy=function(){
  const enemySelect=document.getElementById("gmMapMonsterEnemy");
  if(!enemySelect)return;
  mapTestEnemy=Math.max(0,Math.min(MAPS[mapTestMap].enemies.length-1,Number(enemySelect.value)||0));
  clearMapMonsterTest();
 };
 window.getMapMonsterGmSelection=function(){return {mapIdx:mapTestMap,eIdx:mapTestEnemy};};
 window.getMapMonsterGmTestHtml=function(){return mapMonsterTestHtml;};

 function mapMonsterResultHtml(mapIdx,eIdx,summary){
  const map=MAPS[mapIdx],base=map.enemies[eIdx];
  return `<div class="notice"><b>${map.name}｜${base[0]}・${GM_TEST_RUNS} 次模擬</b><div class="muted" style="margin-top:5px">以下 ${GM_TEST_RUNS} 次戰鬥皆以測試開始前完全相同的角色狀態獨立進行；正式角色資料未變更。</div></div>
   <div class="stats" style="margin-top:10px;grid-template-columns:repeat(auto-fit,minmax(140px,1fr))">
    <div class="stat">勝率<b>${summary.winRate}%</b></div>
    <div class="stat">勝利平均剩餘 HP<b>${summary.avgWinHp}%</b></div>
    <div class="stat">死亡掉裝次數<b>${summary.deathDrops}</b></div>
   </div>
   ${gmRewardSummaryHtml(summary)}`;
 }

 window.gmStartMapMonsterTest=function(){
  if(battleBusy)return;
  const mapSelect=document.getElementById("gmMapMonsterMap"),enemySelect=document.getElementById("gmMapMonsterEnemy");
  const mapIdx=Math.max(0,Math.min(MAPS.length-1,Number(mapSelect?.value)||0));
  const eIdx=Math.max(0,Math.min(MAPS[mapIdx].enemies.length-1,Number(enemySelect?.value)||0));
  mapTestMap=mapIdx;mapTestEnemy=eIdx;

  const button=document.getElementById("gmMapMonsterStartBtn");
  setTestButton(button,true,`開始測試（${GM_TEST_RUNS} 次）`);

  const snapshot=JSON.stringify(state);
  const upgradeSnapshot=upgradeDropNoticePending;
  const player=createSpecialPlayerSnapshot(equippedStats());
  const summary={wins:0,losses:0,winHpTotal:0,deathDrops:0,totalXp:0,totalGold:0,convertedGold:0,dropCount:0,qualityCounts:Array(QUALITY.length).fill(0)};
  battleBusy=true;

  for(let i=0;i<GM_TEST_RUNS;i++){
   state=JSON.parse(snapshot);
   upgradeDropNoticePending=upgradeSnapshot;
   state.hp=player.hp;
   let enemy=null;
   try{enemy=typeof createMonsterEncounter==="function"?createMonsterEncounter(mapIdx,eIdx):monsterObj(mapIdx,eIdx);}catch(e){}
   if(!enemy)continue;
   const r=simulateFight(player,enemy,player.hp);
   if(r.win){
    summary.wins++;
    summary.winHpTotal+=r.hp;
    const xp=Math.max(0,Math.ceil(Number(expReward(enemy))||0));
    const gold=Math.max(0,Math.ceil(Number(goldReward(enemy))||0));
    if(state.level>=MAX_LEVEL){summary.convertedGold+=xp;summary.totalGold+=gold+xp;}
    else{summary.totalXp+=xp;summary.totalGold+=gold;}
    const item=dropItem(enemy,mapIdx);
    if(item){summary.dropCount++;summary.qualityCounts[item.q]=(summary.qualityCounts[item.q]||0)+1;}
   }else{
    summary.losses++;
    state.hp=0;
    const penalty=applyDeathPenalty([]);
    if(penalty?.dropped)summary.deathDrops++;
   }
  }

  summary.winRate=testPercent(summary.wins);
  summary.avgWinHp=summary.wins?round1(summary.winHpTotal/summary.wins/player.hp*100):0;
  state=JSON.parse(snapshot);
  upgradeDropNoticePending=upgradeSnapshot;
  save(false);
  battleBusy=false;
  mapMonsterTestHtml=mapMonsterResultHtml(mapIdx,eIdx,summary);
  showTestResult("gmMapMonsterTestResult",mapMonsterTestHtml);
  if(mapSelect)mapSelect.value=String(mapTestMap);
  if(enemySelect)enemySelect.value=String(mapTestEnemy);
  setTestButton(button,false,`開始測試（${GM_TEST_RUNS} 次）`);
 };

 function simulateFight(player,enemy,startHp=player.hp){
  let php=Math.max(0,Number(startHp)||0),ehp=enemy.hp,turn=0;
  while(php>0&&ehp>0&&turn<200){
   turn++;
   if(Math.random()*100>=enemy.dodge){let pd=calcDamage(player.atk,enemy.def);if(Math.random()*100<player.crit)pd=ceil(pd*CRIT_DAMAGE_MULTIPLIER);ehp-=pd;}
   if(ehp<=0)break;
   if(Math.random()*100<player.dodge)continue;
   const enemyAtk=enemy.berserk&&ehp/enemy.hp<.5?ceil(enemy.atk*1.20):enemy.atk;
   let ed=calcDamage(enemyAtk,player.def);if(Math.random()*100<enemy.crit)ed=ceil(ed*CRIT_DAMAGE_MULTIPLIER);php-=ed;
  }
  return {win:ehp<=0,turnLimit:php>0&&ehp>0,hp:Math.max(0,php),turns:turn};
 }
 window.gmSimulateBounty100=function(tierId){
  const tier=getBountyTierConfig(tierId),player=createSpecialPlayerSnapshot(equippedStats());if(!tier)return alert("找不到懸賞資料。");
  const summary={wins:0,totalTurns:0,winHpTotal:0};
  for(let i=0;i<GM_TEST_RUNS;i++){
   const enemy=buildBountyEnemyForTest(tierId,player,state.level),r=simulateFight(player,enemy);
   summary.totalTurns+=r.turns;
   if(r.win){summary.wins++;summary.winHpTotal+=r.hp;}
  }
  const winRate=testPercent(summary.wins),avgWinHp=summary.wins?round1(summary.winHpTotal/summary.wins/player.hp*100):0,avgTurns=round1(summary.totalTurns/GM_TEST_RUNS);
  showBountyTest(`<div class="notice"><b>${tier.name}・${GM_TEST_RUNS} 次模擬</b><div class="stats" style="margin-top:10px;grid-template-columns:repeat(auto-fit,minmax(140px,1fr))"><div class="stat">勝率<b>${winRate}%</b></div><div class="stat">勝利平均剩餘 HP<b>${avgWinHp}%</b></div><div class="stat">平均回合<b>${avgTurns}</b></div></div></div>`);
 };

 window.gmSimulateArena100=function(difficultyId){
  const configs=typeof getArenaDifficultyConfigs==="function"?getArenaDifficultyConfigs():[];
  const cfg=configs.find(x=>x.id===difficultyId),player=createSpecialPlayerSnapshot(equippedStats());
  if(!cfg)return alert("找不到競技場資料。");
  const reached=[GM_TEST_RUNS,0,0],wins=[0,0,0];
  let totalPoints=0,clearHpTotal=0,totalTurns=0;
  for(let run=0;run<GM_TEST_RUNS;run++){
   let hp=player.hp,points=0,cleared=true;
   for(let stage=0;stage<3;stage++){
    if(stage>0)reached[stage]++;
    const enemy=buildArenaEnemyForTest(difficultyId,stage,player,state.level);
    const r=simulateFight(player,enemy,hp);totalTurns+=r.turns;
    if(r.win){wins[stage]++;hp=r.hp;points+=Number(cfg.stagePoints?.[stage])||0;}
    else{cleared=false;break;}
   }
   if(cleared){points+=Number(cfg.clearBonus)||0;clearHpTotal+=hp;}
   totalPoints+=points;
  }
  const clearCount=wins[2],avgPoints=round1(totalPoints/GM_TEST_RUNS),avgClearHp=clearCount?round1(clearHpTotal/clearCount/player.hp*100):0,avgTurns=round1(totalTurns/GM_TEST_RUNS);
  const conditional=(stage)=>testPercent(wins[stage],reached[stage]);
  showArenaTest(`<div class="notice"><b>${cfg.name}・${GM_TEST_RUNS} 次完整三連戰</b>
   <div class="stats" style="margin-top:10px">
    <div class="stat">第1戰通過<b>${testPercent(wins[0])}%</b></div>
    <div class="stat">第2戰到達<b>${testPercent(reached[1])}%</b></div>
    <div class="stat">第2戰條件通過<b>${conditional(1)}%</b></div>
    <div class="stat">第3戰到達<b>${testPercent(reached[2])}%</b></div>
    <div class="stat">第3戰條件通過<b>${conditional(2)}%</b></div>
    <div class="stat">全通率<b>${testPercent(clearCount)}%</b></div>
    <div class="stat">平均積分<b>${avgPoints}</b></div>
    <div class="stat">全通平均剩餘 HP<b>${avgClearHp}%</b></div>
    <div class="stat">平均總回合<b>${avgTurns}</b></div>
   </div>
  </div>`);
 };

 function gmVoidFloorValue(){
  const raw=Number(document.getElementById("gmVoidMirageFloor")?.value);
  return Number.isFinite(raw)&&raw>=1?Math.floor(raw):null;
 }
 window.gmPreviewVoidMirageFloor=function(){
  const floor=gmVoidFloorValue();
  if(!floor)return alert("請輸入 1 以上的樓層。");
  if(typeof buildVoidMirageEnemy!=="function")return alert("虛空幻境資料尚未載入。");
  const base=typeof voidMirageBaseStats==="function"?voidMirageBaseStats(floor):null;
  const enemy=buildVoidMirageEnemy(floor);
  const boss=!!enemy.isBossFloor;
  showVoidMirageTest(`<div class="notice"><b>虛空幻境・第 ${floor} 層${boss?"（雙特性關卡）":""}</b>
   <div class="muted" style="margin-top:7px">名稱：${enemy.name}</div>
   ${base?`<div class="muted" style="margin-top:4px">基礎能力：${enemyLine(base)}</div>`:""}
   <div class="muted" style="margin-top:4px">本次特性後：${enemyLine(enemy)}</div>
   <div class="muted" style="margin-top:4px">特性：${traitDetail(enemy)}</div>
   <div class="muted" style="margin-top:4px">首通積分：${typeof voidMirageFirstClearPoints==="function"?voidMirageFirstClearPoints(floor):enemy.firstClearPoints||0}</div>
  </div>`);
 };

 window.gmSimulateVoidMirageClimb=function(){
  const startFloor=gmVoidFloorValue();
  if(!startFloor)return alert("請輸入 1 以上的起始樓層。");
  if(typeof buildVoidMirageEnemy!=="function")return alert("虛空幻境資料尚未載入。");
  const player=createSpecialPlayerSnapshot(equippedStats());
  let floor=startFloor,cleared=0,totalPoints=0,totalTurns=0,lastWinHp=player.hp,lastWinFloor=startFloor-1,previousName="",failedEnemy=null;
  let hitSafetyLimit=false;
  while(cleared<VOID_MIRAGE_GM_SIM_LIMIT){
   const enemy=buildVoidMirageEnemy(floor,{previousName});
   if(!enemy.isBossFloor)previousName=enemy.name;
   const r=simulateFight(player,enemy,player.hp);
   totalTurns+=r.turns;
   if(!r.win){failedEnemy=enemy;break;}
   cleared++;
   lastWinFloor=floor;
   lastWinHp=r.hp;
   totalPoints+=typeof voidMirageFirstClearPoints==="function"?voidMirageFirstClearPoints(floor):Number(enemy.firstClearPoints)||0;
   floor++;
  }
  if(cleared>=VOID_MIRAGE_GM_SIM_LIMIT){hitSafetyLimit=true;}
  const avgPoints=cleared?round1(totalPoints/cleared):0;
  const avgTurns=cleared?round1(totalTurns/cleared):0;
  const lastHpPct=cleared?round1(lastWinHp/player.hp*100):0;
  const stopFloor=hitSafetyLimit?floor:(failedEnemy?.floor||floor);
  showVoidMirageTest(`<div class="notice"><b>虛空幻境・從第 ${startFloor} 層連續爬塔</b>
   <div class="stats" style="margin-top:10px">
    <div class="stat">起始樓層<b>${startFloor}</b></div>
    <div class="stat">成功層數<b>${cleared}</b></div>
    <div class="stat">最後成功樓層<b>${cleared?lastWinFloor:"—"}</b></div>
    <div class="stat">停止／失敗樓層<b>${stopFloor}</b></div>
    <div class="stat">本次總積分<b>${totalPoints}</b></div>
    <div class="stat">平均每層積分<b>${avgPoints}</b></div>
    <div class="stat">平均戰鬥回合<b>${avgTurns}</b></div>
    <div class="stat">最後成功剩餘 HP<b>${cleared?`${lastWinHp}（${lastHpPct}%）`:"—"}</b></div>
   </div>
  </div>`);
 };

 window.getBountyGmTestHtml=function(){return bountyTestHtml;};
 window.getArenaGmTestHtml=function(){return arenaTestHtml;};
 window.getVoidMirageGmTestHtml=function(){return voidMirageTestHtml;};
})();
