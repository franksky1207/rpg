(function(){
 const baseGmHtmlForDungeon=gmHtml;
 let bountyDebugHtml="";
 let dungeonDebugMap=0;
 let dungeonDebugEnemy=0;

 function formatProgress(n){
  const x=Math.round((Number(n)||0)*100)/100;
  return Number.isInteger(x)?String(x):x.toFixed(2).replace(/0+$/,"" ).replace(/\.$/,"");
 }
 function formatAttempts(n){return Math.floor(Number(n)||0).toLocaleString();}
 function dungeonState(){return ensureDungeonProgressState();}
 function refreshAfterDungeonGm(message){save();render();if(message)alert(message);}

 function gmDungeonMapOptions(){
  return MAPS.map((map,mapIdx)=>`<option value="${mapIdx}" ${mapIdx===dungeonDebugMap?"selected":""}>${mapIdx+1}. ${map.name}（Lv.${map.min}～${map.max}）</option>`).join("");
 }
 function gmDungeonEnemyOptions(mapIdx){
  const safeMap=Math.max(0,Math.min(MAPS.length-1,Number(mapIdx)||0));
  return MAPS[safeMap].enemies.map((e,eIdx)=>{
   const kind=e[2]==="boss"?"Boss":e[2]==="elite"?"菁英":"普通";
   return `<option value="${eIdx}" ${eIdx===dungeonDebugEnemy?"selected":""}>${kind}｜${e[0]} Lv.${e[1]}</option>`;
  }).join("");
 }

 function dungeonGmPanel(){
  const d=dungeonState();
  dungeonDebugMap=Math.max(0,Math.min(MAPS.length-1,dungeonDebugMap));
  dungeonDebugEnemy=Math.max(0,Math.min(MAPS[dungeonDebugMap].enemies.length-1,dungeonDebugEnemy));
  return `<div class="item" style="margin-top:14px"><b>副本管理</b>
   <div class="muted" style="margin-top:5px">可直接指定正式副本資料，也保留原本的快速測試按鈕。</div>
   <div class="controls" style="align-items:end">
    <label>次數累積進度（%）<br><input id="gmDungeonProgress" type="number" min="0" step="0.01" value="${d.progress}" style="width:150px"></label>
    <label>可挑戰次數<br><input id="gmDungeonAttempts" type="number" min="0" step="1" value="${d.attempts}" style="width:130px"></label>
    <label>副本積分<br><input id="gmDungeonPoints" type="number" min="0" step="1" value="${d.points}" style="width:150px"></label>
    <button class="btn primary" onclick="gmApplyDungeonValues()">套用</button>
   </div>
   <div class="notice dungeon-gm-status" style="margin-top:10px">目前：${formatProgress(d.progress)}%　／　可挑戰 ${formatAttempts(d.attempts)} 次　／　副本積分 ${d.points}</div>
   <div class="controls dungeon-gm-actions" style="margin-top:10px">
    <button class="btn" onclick="gmDungeonAddProgress(10)">進度 +10%</button>
    <button class="btn" onclick="gmDungeonAddProgress(100)">進度 +100%</button>
    <button class="btn" onclick="gmDungeonAddProgress(250)">進度 +250%</button>
    <button class="btn" onclick="gmDungeonAddAttempt()">次數 +1</button>
    <button class="btn" onclick="gmDungeonClearProgress()">進度歸零</button>
    <button class="btn danger" onclick="gmDungeonResetAll()">副本資料全重置</button>
   </div>
  </div>
  <div class="item dungeon-debug-box" style="margin-top:14px"><b>副本進度／刷怪 Debug</b>
   <div class="muted" style="margin-top:5px">先選地圖，再選該地圖怪物，查看這隻怪在目前角色狀態下可累積多少副本次數進度。</div>
   <div class="controls dungeon-debug-controls" style="margin-top:10px;align-items:end">
    <label>地圖<br><select id="gmDungeonMap" class="btn dungeon-debug-select" onchange="gmDungeonChangeMap()">${gmDungeonMapOptions()}</select></label>
    <label>怪物<br><select id="gmDungeonMonster" class="btn dungeon-debug-select" onchange="gmDungeonChangeEnemy()">${gmDungeonEnemyOptions(dungeonDebugMap)}</select></label>
    <button class="btn blue" onclick="gmDungeonDebug()">查看 Debug</button>
   </div>
  </div>
  <div class="item" style="margin-top:14px"><b>懸賞戰 Debug</b>
   <div class="muted" style="margin-top:5px">以目前角色實際能力生成；不扣副本次數、不改正式角色資料。</div>
   <div class="controls">
    <button class="btn" onclick="gmPreviewBounty('normal')">生成普通懸賞</button>
    <button class="btn" onclick="gmPreviewBounty('high')">生成高級懸賞</button>
    <button class="btn" onclick="gmPreviewBounty('danger')">生成危險懸賞</button>
   </div>
   <div class="controls" style="margin-top:10px">
    <button class="btn blue" onclick="gmSimulateBounty100('normal')">普通懸賞 ×100</button>
    <button class="btn blue" onclick="gmSimulateBounty100('high')">高級懸賞 ×100</button>
    <button class="btn blue" onclick="gmSimulateBounty100('danger')">危險懸賞 ×100</button>
   </div>
   <div id="gmBountyDebugResult" style="margin-top:12px">${bountyDebugHtml}</div>
  </div>`;
 }

 gmHtml=function(){
  const html=baseGmHtmlForDungeon();
  const marker='<div class="controls" style="margin-top:14px"><button class="btn" onclick="state.gm=false;save();render()">關閉管理模式</button></div>';
  return html.includes(marker)?html.replace(marker,dungeonGmPanel()+marker):html+dungeonGmPanel();
 };

 window.gmApplyDungeonValues=function(){
  const progress=Number(document.getElementById("gmDungeonProgress")?.value);
  const attempts=Math.floor(Number(document.getElementById("gmDungeonAttempts")?.value));
  const points=Math.floor(Number(document.getElementById("gmDungeonPoints")?.value));
  if(!Number.isFinite(progress)||progress<0||!Number.isFinite(attempts)||attempts<0||!Number.isFinite(points)||points<0){alert("請輸入 0 以上的數字。");return;}
  const d=dungeonState();
  d.progress=progress;d.attempts=attempts;d.points=points;
  ensureDungeonProgressState();
  save();render();
 };

 window.gmDungeonAddProgress=function(amount){
  const r=addDungeonProgress(amount);
  refreshAfterDungeonGm(`副本進度 +${formatProgress(r.added)}%\n轉換副本次數 +${r.gainedAttempts}\n目前 ${formatProgress(r.progress)}%／${r.attempts} 次`);
 };
 window.gmDungeonAddAttempt=function(){
  const d=dungeonState();d.attempts=Math.floor(Number(d.attempts)||0)+1;
  refreshAfterDungeonGm("副本可挑戰次數 +1");
 };
 window.gmDungeonClearProgress=function(){
  const d=dungeonState();d.progress=0;
  refreshAfterDungeonGm("副本次數累積進度已歸零；可挑戰次數與副本積分保留。");
 };
 window.gmDungeonResetAll=function(){
  if(!confirm("確定要把副本累積進度、可挑戰次數與副本積分全部歸零嗎？"))return;
  const d=dungeonState();d.progress=0;d.attempts=0;d.points=0;
  refreshAfterDungeonGm("副本資料已全部歸零。");
 };

 window.gmDungeonChangeMap=function(){
  const mapSelect=document.getElementById("gmDungeonMap"),enemySelect=document.getElementById("gmDungeonMonster");
  if(!mapSelect||!enemySelect)return;
  dungeonDebugMap=Math.max(0,Math.min(MAPS.length-1,Number(mapSelect.value)||0));
  dungeonDebugEnemy=0;
  enemySelect.innerHTML=gmDungeonEnemyOptions(dungeonDebugMap);
  enemySelect.value="0";
 };
 window.gmDungeonChangeEnemy=function(){
  const enemySelect=document.getElementById("gmDungeonMonster");
  if(!enemySelect)return;
  dungeonDebugEnemy=Math.max(0,Math.min(MAPS[dungeonDebugMap].enemies.length-1,Number(enemySelect.value)||0));
 };
 window.gmDungeonDebug=function(){
  const d=dungeonState();
  const level=Math.max(1,Math.floor(Number(state.level)||1));
  const playerBaseHp=baseHP(level),ps=equippedStats();
  const mapIdx=Math.max(0,Math.min(MAPS.length-1,Number(document.getElementById("gmDungeonMap")?.value)||dungeonDebugMap||0));
  const eIdx=Math.max(0,Math.min(MAPS[mapIdx].enemies.length-1,Number(document.getElementById("gmDungeonMonster")?.value)||0));
  dungeonDebugMap=mapIdx;dungeonDebugEnemy=eIdx;
  let enemy=null;try{enemy=monsterObj(mapIdx,eIdx);}catch(e){}
  if(!enemy)return alert("目前沒有可計算的怪物。");
  const enemyPart=(enemy.hp/playerBaseHp)*1.5;
  const minProgress=calculateDungeonBattleProgress({source:"main",win:true,enemyMaxHp:enemy.hp,playerLevel:level,playerMaxHp:ps.hp,startHp:ps.hp,endHp:ps.hp});
  const nearDeathEnd=Math.max(1,Math.floor(ps.hp*.01));
  const nearDeathProgress=calculateDungeonBattleProgress({source:"main",win:true,enemyMaxHp:enemy.hp,playerLevel:level,playerMaxHp:ps.hp,startHp:ps.hp,endHp:nearDeathEnd});
  alert(`副本 Debug\n地圖：${MAPS[mapIdx].name}\n怪物：${enemy.name} Lv.${enemy.level}\n類型：${enemy.kind==="boss"?"Boss":enemy.kind==="elite"?"菁英":"普通"}\n敵人最大 HP：${enemy.hp}\n玩家等級：Lv.${level}\n玩家基礎 HP：${playerBaseHp}\n玩家實際最大 HP：${ps.hp}\n\nHP 負擔部分：${formatProgress(enemyPart)}%\n無損勝利：約 ${formatProgress(minProgress)}%\n接近殘血勝：約 ${formatProgress(nearDeathProgress)}%\n\n目前累積：${formatProgress(d.progress)}%\n可挑戰次數：${formatAttempts(d.attempts)} 次`);
 };

 function traitDetail(enemy){
  if(!enemy?.traits?.length)return "無";
  return enemy.traits.map(id=>{const t=MONSTER_TRAITS?.[id];return t?`${t.name}（${t.desc}）`:id;}).join("、");
 }
 function playerLine(p){return `HP ${p.hp}　ATK ${p.atk}　DEF ${p.def}　暴擊 ${p.crit}%　閃避 ${p.dodge}%`;}
 function enemyLine(e){return `HP ${e.hp}　ATK ${e.atk}　DEF ${e.def}　暴擊 ${e.crit}%　閃避 ${e.dodge}%`;}
 function showDebug(html){bountyDebugHtml=html;const box=document.getElementById("gmBountyDebugResult");if(box)box.innerHTML=html;}

 window.gmPreviewBounty=function(tierId){
  const tier=getBountyTierConfig(tierId),player=createSpecialPlayerSnapshot(equippedStats());
  const enemy=buildBountyEnemyForDebug(tierId,player,state.level);
  if(!tier||!enemy)return alert("找不到懸賞資料。");
  showDebug(`<div class="notice"><b>${tier.name}・${enemy.name}</b><div class="muted" style="margin-top:6px">玩家：${playerLine(player)}</div><div class="muted" style="margin-top:4px">怪物：${enemyLine(enemy)}</div><div class="muted" style="margin-top:4px">特性：${traitDetail(enemy)}</div><div class="muted" style="margin-top:4px">獎勵：${tier.points} 副本積分</div></div>`);
 };

 function simulateBountyFight(player,enemy){
  let php=player.hp,ehp=enemy.hp,turn=0;
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
  const tier=getBountyTierConfig(tierId),player=createSpecialPlayerSnapshot(equippedStats());
  if(!tier)return alert("找不到懸賞資料。");
  const summary={wins:0,losses:0,timeouts:0,totalTurns:0,winHpTotal:0};
  for(let i=0;i<100;i++){
   const enemy=buildBountyEnemyForDebug(tierId,player,state.level),r=simulateBountyFight(player,enemy);
   summary.totalTurns+=r.turns;
   if(r.win){summary.wins++;summary.winHpTotal+=r.hp;}else{summary.losses++;if(r.turnLimit)summary.timeouts++;}
  }
  const winRate=round1(summary.wins),avgWinHp=summary.wins?round1(summary.winHpTotal/summary.wins/player.hp*100):0,avgTurns=round1(summary.totalTurns/100);
  showDebug(`<div class="notice"><b>${tier.name}・100 次模擬</b><div class="stats" style="margin-top:10px"><div class="stat">勝利<b>${summary.wins}</b></div><div class="stat">失敗<b>${summary.losses}</b></div><div class="stat">勝率<b>${winRate}%</b></div><div class="stat">勝利平均剩餘 HP<b>${avgWinHp}%</b></div><div class="stat">平均回合<b>${avgTurns}</b></div><div class="stat">200 回合未決<b>${summary.timeouts}</b></div></div><div class="muted" style="margin-top:8px">玩家基準：${playerLine(player)}</div></div>`);
 };
})();
