(function(){
 window.restorePlayerHp=function(options={}){
  state.hp=playerCombatStats().hp;
  if(options.save!==false)save(false);
  return state.hp;
 };

 // 匯入舊存檔時保留原始版本判斷，避免 normalize 先升版後跳過舊商店初始化規則。
 if(typeof window.normalizeSaveState==="function"){
  const baseNormalizeSaveState=window.normalizeSaveState;
  window.normalizeSaveState=function(target){
   const sourceVersion=Math.max(1,Math.floor(Number(target?.saveVersion)||1));
   const sourceShop=target?.shop;
   const hadInitialized=!!sourceShop&&typeof sourceShop==="object"&&!Array.isArray(sourceShop)&&typeof sourceShop.initialized==="boolean";
   const normalized=baseNormalizeSaveState(target);
   if(!normalized.shop||typeof normalized.shop!=="object"||Array.isArray(normalized.shop))normalized.shop=newShopState();
   if(sourceVersion<4){
    normalized.shop.items=[];
    normalized.shop.initialized=false;
   }else if(!hadInitialized){
    normalized.shop.initialized=Array.isArray(normalized.shop.items)&&normalized.shop.items.length>0;
   }
   return normalized;
  };
 }

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

 // 新版規則下，非戰鬥狀態應維持滿 HP；同時把舊存檔殘留的低 HP 校正掉。
 restorePlayerHp({save:false});
 save(false);
})();
