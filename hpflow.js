(function(){
 window.restorePlayerHp=function(options={}){
  state.hp=playerCombatStats().hp;
  if(options.save!==false)save(false);
  return state.hp;
 };

 window.playerStatusHtml=function(){
  const s=playerCombatStats(),need=state.level<MAX_LEVEL?expNeed(state.level):0,hpPct=s.hp?state.hp/s.hp*100:0,expPct=state.level<MAX_LEVEL?Math.min(100,state.exp/need*100):100;
  return `<div class="card player-status-card"><div style="font-size:18px;font-weight:700;color:#f0d494;margin-bottom:9px">${playerNameHtml()}</div><div class="stats"><div class="stat">等級<b>Lv.${state.level}</b></div><div class="stat">金幣<b>${state.gold.toLocaleString()}</b></div></div><div class="status-line"><div class="status-label"><span>HP</span><span>${state.hp} / ${s.hp}</span></div><div class="bar"><span class="hp" style="width:${hpPct}%"></span></div></div><div class="status-line"><div class="status-label"><span>EXP</span><span>${state.level>=MAX_LEVEL?"MAX":state.exp+" / "+need}</span></div><div class="bar"><span class="xp" style="width:${expPct}%"></span></div></div></div>`;
 };

 const baseAdventurePreparePage=window.adventurePreparePage;
 window.adventurePreparePage=function(){
  return baseAdventurePreparePage()
   .replace("回血並挑戰 Boss","挑戰 Boss")
   .replace("回血並開始戰鬥","開始戰鬥");
 };

 window.startBattles=function(){
  if(battleBusy)return;
  const e=typeof getPreviewEncounter==="function"?getPreviewEncounter(selectedMap,selectedEnemy):monsterObj(selectedMap,selectedEnemy);
  const count=e.kind==="boss"?1:selectedBattleCount;
  beginCombat(count);
 };
})();
