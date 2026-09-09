(function(){
 // Lv1～100 擴充：解除原 Lv50 硬上限。
 window.MAX_LEVEL=100;

 window.clampGameLevel=function(level){
  return Math.max(1,Math.min(MAX_LEVEL,Math.floor(Number(level)||1)));
 };

 // 主線裝備掉落等級改讀 MAX_LEVEL，不再固定卡 50。
 dropItem=function(enemy,mapIdx){
  let chance=enemy.kind==="boss"?1:enemy.kind==="elite"?.6:.25;
  if(Math.random()>chance)return null;
  let offset=enemy.kind==="boss"?[-1,0,0,1,2]:enemy.kind==="elite"?[-1,0,0,1]:[-2,-1,0,0,1];
  let lv=Math.max(1,Math.min(MAX_LEVEL,enemy.level+offset[Math.floor(Math.random()*offset.length)]));
  return makeItem(lv,mapIdx,enemy.kind);
 };

 // UI 的 EXP / MAX 顯示改讀 MAX_LEVEL。
 playerStatusHtml=function(){
  let s=equippedStats(),need=state.level<MAX_LEVEL?expNeed(state.level):0,hpPct=s.hp?state.hp/s.hp*100:0,expPct=state.level<MAX_LEVEL?Math.min(100,state.exp/need*100):100,low=hpPct<50;
  return `<div class="card player-status-card"><div class="stats"><div class="stat">等級<b>Lv.${state.level}</b></div><div class="stat">金幣<b>${state.gold.toLocaleString()}</b></div></div><div class="status-line ${low?"q-mythic":""}"><div class="status-label"><span>HP${low?"　⚠ 低血量":""}</span><span>${state.hp} / ${s.hp}</span></div><div class="bar"><span class="hp" style="width:${hpPct}%"></span></div></div><div class="status-line"><div class="status-label"><span>EXP</span><span>${state.level>=MAX_LEVEL?"MAX":state.exp+" / "+need}</span></div><div class="bar"><span class="xp" style="width:${expPct}%"></span></div></div></div>`;
 };

 adventureCombatPage=function(){
  let e=monsterObj(selectedMap,selectedEnemy),s=equippedStats(),need=state.level<MAX_LEVEL?expNeed(state.level):0,hpPct=s.hp?state.hp/s.hp*100:0,expPct=state.level<MAX_LEVEL?Math.min(100,state.exp/need*100):100;
  return `<section class="combat-screen"><div class="combat-head">${combatTotal>1?`第 ${combatRound} / ${combatTotal} 場`:`單場戰鬥`}</div><div class="combat-arena"><div class="combatant player" id="combatPlayerCard"><div class="combat-damage" id="combatPlayerDamage"></div><h2>玩家 Lv.${state.level}</h2><div class="muted">金幣 ${state.gold.toLocaleString()}</div><div class="big-hp"><div class="status-label"><span>HP</span><span id="combatPlayerHp">${state.hp} / ${s.hp}</span></div><div class="bar"><span class="hp" id="combatPlayerBar" style="width:${hpPct}%"></span></div></div><div class="xp-block"><div class="status-label"><span>EXP</span><span>${state.level>=MAX_LEVEL?"MAX":state.exp+" / "+need}</span></div><div class="bar"><span class="xp" style="width:${expPct}%"></span></div></div></div><div class="combat-vs">VS</div><div class="combatant enemy" id="combatEnemyCard"><div class="combat-damage" id="combatEnemyDamage"></div><h2 id="combatEnemyName">${e.name} Lv.${e.level}</h2><div class="big-hp"><div class="status-label"><span>HP</span><span id="combatEnemyHp">${e.hp} / ${e.hp}</span></div><div class="bar"><span class="hp" id="combatEnemyBar" style="width:100%"></span></div></div></div></div><div class="combat-message" id="combatMessage">準備戰鬥</div></section>`;
 };

 // GM 指定角色等級改為 1～MAX_LEVEL。
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

 // 這些模式本身以角色實際能力縮放；此處只把 Debug / metadata 的等級解除50封頂。
 if(typeof buildBountyEnemyForDebug==="function"){
  const baseBountyDebugForLevel100=buildBountyEnemyForDebug;
  window.buildBountyEnemyForDebug=function(tierId,playerStats=null,level=null){
   const e=baseBountyDebugForLevel100(tierId,playerStats,level);
   if(e)e.level=clampGameLevel(level??state.level);
   return e;
  };
 }
 if(typeof buildArenaEnemyForDebug==="function"){
  const baseArenaDebugForLevel100=buildArenaEnemyForDebug;
  window.buildArenaEnemyForDebug=function(difficultyId,stageIndex,stats=null,level=null){
   const e=baseArenaDebugForLevel100(difficultyId,stageIndex,stats,level);
   if(e)e.level=clampGameLevel(level??state.level);
   return e;
  };
 }

 // levelcap.js 先載入並建立滿等邏輯；MAX_LEVEL 在本檔改為100後，其動態判斷會直接跟著生效。
 // 再包一次特殊怪 builder，確保顯示 / metadata 也可到 Lv100。
 if(typeof buildSpecialMonsterFromPlayer==="function"){
  const baseSpecialBuilderForLevel100=buildSpecialMonsterFromPlayer;
  window.buildSpecialMonsterFromPlayer=function(playerStats,special,level=1){
   const e=baseSpecialBuilderForLevel100(playerStats,special,clampGameLevel(level));
   if(e)e.level=clampGameLevel(level);
   return e;
  };
 }
})();
