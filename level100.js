(function(){
 // UI 的 EXP / MAX 顯示統一讀正式 MAX_LEVEL。
 playerStatusHtml=function(){
  let s=equippedStats(),need=state.level<MAX_LEVEL?expNeed(state.level):0,hpPct=s.hp?state.hp/s.hp*100:0,expPct=state.level<MAX_LEVEL?Math.min(100,state.exp/need*100):100,low=hpPct<50;
  return `<div class="card player-status-card"><div class="stats"><div class="stat">等級<b>Lv.${state.level}</b></div><div class="stat">金幣<b>${state.gold.toLocaleString()}</b></div></div><div class="status-line ${low?"q-mythic":""}"><div class="status-label"><span>HP${low?"　⚠ 低血量":""}</span><span>${state.hp} / ${s.hp}</span></div><div class="bar"><span class="hp" style="width:${hpPct}%"></span></div></div><div class="status-line"><div class="status-label"><span>EXP</span><span>${state.level>=MAX_LEVEL?"MAX":state.exp+" / "+need}</span></div><div class="bar"><span class="xp" style="width:${expPct}%"></span></div></div></div>`;
 };

 adventureCombatPage=function(){
  let e=monsterObj(selectedMap,selectedEnemy),s=equippedStats(),need=state.level<MAX_LEVEL?expNeed(state.level):0,hpPct=s.hp?state.hp/s.hp*100:0,expPct=state.level<MAX_LEVEL?Math.min(100,state.exp/need*100):100;
  return `<section class="combat-screen"><div class="combat-head">${combatTotal>1?`第 ${combatRound} / ${combatTotal} 場`:`單場戰鬥`}</div><div class="combat-arena"><div class="combatant player" id="combatPlayerCard"><div class="combat-damage" id="combatPlayerDamage"></div><h2>玩家 Lv.${state.level}</h2><div class="muted">金幣 ${state.gold.toLocaleString()}</div><div class="big-hp"><div class="status-label"><span>HP</span><span id="combatPlayerHp">${state.hp} / ${s.hp}</span></div><div class="bar"><span class="hp" id="combatPlayerBar" style="width:${hpPct}%"></span></div></div><div class="xp-block"><div class="status-label"><span>EXP</span><span>${state.level>=MAX_LEVEL?"MAX":state.exp+" / "+need}</span></div><div class="bar"><span class="xp" style="width:${expPct}%"></span></div></div></div><div class="combat-vs">VS</div><div class="combatant enemy" id="combatEnemyCard"><div class="combat-damage" id="combatEnemyDamage"></div><h2 id="combatEnemyName">${e.name} Lv.${e.level}</h2><div class="big-hp"><div class="status-label"><span>HP</span><span id="combatEnemyHp">${e.hp} / ${e.hp}</span></div><div class="bar"><span class="hp" id="combatEnemyBar" style="width:100%"></span></div></div></div></div><div class="combat-message" id="combatMessage">準備戰鬥</div></section>`;
 };

 gmLevel=function(){
  let raw=prompt(`指定等級（1～${MAX_LEVEL}）`,state.level);
  if(raw===null)return;
  let n=Math.floor(Number(raw));
  if(!Number.isFinite(n)){alert("請輸入有效等級。");return;}
  state.level=clampGameLevel(n);
  state.exp=0;
  state.hp=equippedStats().hp;
  save();render();
 };
})();
