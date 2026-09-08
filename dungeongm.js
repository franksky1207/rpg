(function(){
 const baseGmHtmlForDungeon=gmHtml;
 let bountyDebugHtml="";

 function dungeonGmPanel(){
  const d=ensureDungeonProgressState();
  return `<div class="item" style="margin-top:14px"><b>副本管理</b>
   <div class="controls" style="align-items:end">
    <label>可挑戰次數<br><input id="gmDungeonAttempts" type="number" min="0" step="1" value="${d.attempts}" style="width:130px"></label>
    <label>副本積分<br><input id="gmDungeonPoints" type="number" min="0" step="1" value="${d.points}" style="width:150px"></label>
    <button class="btn primary" onclick="gmApplyDungeonValues()">套用</button>
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
  const attempts=Math.floor(Number(document.getElementById("gmDungeonAttempts")?.value));
  const points=Math.floor(Number(document.getElementById("gmDungeonPoints")?.value));
  if(!Number.isFinite(attempts)||attempts<0||!Number.isFinite(points)||points<0){alert("請輸入 0 以上的整數。");return;}
  const d=ensureDungeonProgressState();
  d.attempts=attempts;d.points=points;
  save();render();
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
  showDebug(`<div class="notice"><b>${tier.name}・${enemy.name}</b>
   <div class="muted" style="margin-top:6px">玩家：${playerLine(player)}</div>
   <div class="muted" style="margin-top:4px">怪物：${enemyLine(enemy)}</div>
   <div class="muted" style="margin-top:4px">特性：${traitDetail(enemy)}</div>
   <div class="muted" style="margin-top:4px">獎勵：${tier.points} 副本積分</div>
  </div>`);
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
  showDebug(`<div class="notice"><b>${tier.name}・100 次模擬</b>
   <div class="stats" style="margin-top:10px">
    <div class="stat">勝利<b>${summary.wins}</b></div>
    <div class="stat">失敗<b>${summary.losses}</b></div>
    <div class="stat">勝率<b>${winRate}%</b></div>
    <div class="stat">勝利平均剩餘 HP<b>${avgWinHp}%</b></div>
    <div class="stat">平均回合<b>${avgTurns}</b></div>
    <div class="stat">200 回合未決<b>${summary.timeouts}</b></div>
   </div>
   <div class="muted" style="margin-top:8px">玩家基準：${playerLine(player)}</div>
  </div>`);
 };
})();