(function(){
 let bountyDebugHtml="";
 let dungeonDebugMap=0;
 let dungeonDebugEnemy=0;

 function formatProgress(n){
  const x=Math.round((Number(n)||0)*100)/100;
  return Number.isInteger(x)?String(x):x.toFixed(2).replace(/0+$/,"" ).replace(/\.$/,"");
 }
 function formatAttempts(n){return Math.floor(Number(n)||0).toLocaleString();}
 function dungeonState(){return ensureDungeonProgressState();}

 window.gmApplyDungeonValues=function(){
  const progress=Number(document.getElementById("gmDungeonProgress")?.value);
  const attempts=Math.floor(Number(document.getElementById("gmDungeonAttempts")?.value));
  const points=Math.floor(Number(document.getElementById("gmDungeonPoints")?.value));
  if(!Number.isFinite(progress)||progress<0||!Number.isFinite(attempts)||attempts<0||!Number.isFinite(points)||points<0){
   alert("請輸入 0 以上的數字。");
   return;
  }
  const d=dungeonState();
  d.progress=progress;
  d.attempts=attempts;
  d.points=points;
  ensureDungeonProgressState();
  save();
  render();
 };

 window.gmDungeonChangeMap=function(){
  const mapSelect=document.getElementById("gmDungeonMap"),enemySelect=document.getElementById("gmDungeonMonster");
  if(!mapSelect||!enemySelect)return;
  dungeonDebugMap=Math.max(0,Math.min(MAPS.length-1,Number(mapSelect.value)||0));
  dungeonDebugEnemy=0;
  const map=MAPS[dungeonDebugMap];
  enemySelect.innerHTML=map.enemies.map((e,eIdx)=>{
   const kind=e[2]==="boss"?"Boss":e[2]==="elite"?"菁英":"普通";
   return `<option value="${eIdx}">${kind}｜${e[0]} Lv.${e[1]}</option>`;
  }).join("");
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
  dungeonDebugMap=mapIdx;
  dungeonDebugEnemy=eIdx;
  let enemy=null;
  try{enemy=monsterObj(mapIdx,eIdx);}catch(e){}
  if(!enemy)return alert("目前沒有可計算的怪物。");
  const enemyPart=(enemy.hp/playerBaseHp)*1.5;
  const minProgress=calculateDungeonBattleProgress({source:"main",win:true,enemyMaxHp:enemy.hp,playerLevel:level,playerMaxHp:ps.hp,startHp:ps.hp,endHp:ps.hp});
  const nearDeathEnd=Math.max(1,Math.floor(ps.hp*.01));
  const nearDeathProgress=calculateDungeonBattleProgress({source:"main",win:true,enemyMaxHp:enemy.hp,playerLevel:level,playerMaxHp:ps.hp,startHp:ps.hp,endHp:nearDeathEnd});
  alert(`副本 Debug\n地圖：${MAPS[mapIdx].name}\n怪物：${enemy.name} Lv.${enemy.level}\n類型：${enemy.kind==="boss"?"Boss":enemy.kind==="elite"?"菁英":"普通"}\n敵人最大 HP：${enemy.hp}\n玩家等級：Lv.${level}\n玩家基礎 HP：${playerBaseHp}\n玩家實際最大 HP：${ps.hp}\n\nHP 負擔部分：${formatProgress(enemyPart)}%\n無損勝利：約 ${formatProgress(minProgress)}%\n接近殘血勝：約 ${formatProgress(nearDeathProgress)}%\n\n目前累積：${formatProgress(d.progress)}%\n可挑戰次數：${formatAttempts(d.attempts)} 次`);
 };

 function traitDetail(enemy){
  if(!enemy?.traits?.length)return "無";
  return enemy.traits.map(id=>{
   const t=MONSTER_TRAITS?.[id];
   return t?`${t.name}（${t.desc}）`:id;
  }).join("、");
 }
 function playerLine(p){return `HP ${p.hp}　ATK ${p.atk}　DEF ${p.def}　暴擊 ${p.crit}%　閃避 ${p.dodge}%`;}
 function enemyLine(e){return `HP ${e.hp}　ATK ${e.atk}　DEF ${e.def}　暴擊 ${e.crit}%　閃避 ${e.dodge}%`;}
 function showDebug(html){
  bountyDebugHtml=html;
  const box=document.getElementById("gmBountyDebugResult");
  if(box)box.innerHTML=html;
 }

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
   if(Math.random()*100>=enemy.dodge){
    let pd=calcDamage(player.atk,enemy.def);
    if(Math.random()*100<player.crit)pd=ceil(pd*CRIT_DAMAGE_MULTIPLIER);
    ehp-=pd;
   }
   if(ehp<=0)break;
   if(Math.random()*100<player.dodge)continue;
   const enemyAtk=enemy.berserk&&ehp/enemy.hp<.5?ceil(enemy.atk*1.20):enemy.atk;
   let ed=calcDamage(enemyAtk,player.def);
   if(Math.random()*100<enemy.crit)ed=ceil(ed*CRIT_DAMAGE_MULTIPLIER);
   php-=ed;
  }
  return {win:ehp<=0,turnLimit:php>0&&ehp>0,hp:Math.max(0,php),turns:turn};
 }

 window.gmSimulateBounty100=function(tierId){
  const tier=getBountyTierConfig(tierId),player=createSpecialPlayerSnapshot(equippedStats());
  if(!tier)return alert("找不到懸賞資料。");
  const summary={wins:0,losses:0,timeouts:0,totalTurns:0,winHpTotal:0};
  for(let i=0;i<100;i++){
   const enemy=buildBountyEnemyForDebug(tierId,player,state.level);
   const r=simulateBountyFight(player,enemy);
   summary.totalTurns+=r.turns;
   if(r.win){summary.wins++;summary.winHpTotal+=r.hp;}
   else{summary.losses++;if(r.turnLimit)summary.timeouts++;}
  }
  const winRate=round1(summary.wins);
  const avgWinHp=summary.wins?round1(summary.winHpTotal/summary.wins/player.hp*100):0;
  const avgTurns=round1(summary.totalTurns/100);
  showDebug(`<div class="notice"><b>${tier.name}・100 次模擬</b><div class="stats" style="margin-top:10px"><div class="stat">勝利<b>${summary.wins}</b></div><div class="stat">失敗<b>${summary.losses}</b></div><div class="stat">勝率<b>${winRate}%</b></div><div class="stat">勝利平均剩餘 HP<b>${avgWinHp}%</b></div><div class="stat">平均回合<b>${avgTurns}</b></div><div class="stat">200 回合未決<b>${summary.timeouts}</b></div></div><div class="muted" style="margin-top:8px">玩家基準：${playerLine(player)}</div></div>`);
 };

 window.getBountyGmDebugHtml=function(){return bountyDebugHtml;};
})();
