(function(){
 const FIXED_TITLE="連續戰鬥階段結算";

 function getStageItems(ctx){return Array.isArray(ctx?.items)?ctx.items:[];}
 function stageSoldGold(ctx){return getStageItems(ctx).reduce((sum,x)=>sum+(Number(x?.sold)||0),0);}
 function stageUpgradeCount(ctx){
  return getStageItems(ctx).filter(x=>{
   if(!x?.item||x.sold)return false;
   return typeof isActualGearUpgrade==="function"?isActualGearUpgrade(x.item):equipmentScore(x.item)>equipmentScore(state.equipment?.[x.item.type]||null);
  }).length;
 }
 function stageDropListHtml(ctx){
  const items=getStageItems(ctx);
  if(!items.length)return `<div class="muted" style="margin-top:10px">裝備：無</div>`;
  return `<div style="margin-top:10px"><b>裝備掉落 ${items.length} 件</b>${items.map(x=>{
   const it=x.item;
   const upgrade=!x.sold&&(typeof isActualGearUpgrade==="function"?isActualGearUpgrade(it):equipmentScore(it)>equipmentScore(state.equipment?.[it.type]||null));
   return `<div class="item">${itemHtml(it,true)}${gearAbilityHtml(it,true)}${upgrade?`<div class="q-uncommon"><b>★ 可提升目前裝備</b></div>`:""}${x.sold?`<div class="muted">自動出售 +${x.sold} 金幣</div>`:""}</div>`;
  }).join("")}</div>`;
 }
 function showStageSettlement(ctx,action){
  if(!ctx)return;
  const title=document.getElementById("battleResultTitle"),detail=document.getElementById("battleResultDetail"),modal=document.getElementById("battleResultModal");
  if(!title||!detail||!modal)return;
  const done=ctx.completed||0,total=ctx.originalCount||done;
  const soldGold=stageSoldGold(ctx),goldTotal=(ctx.totalGold||0)+soldGold,upgradeCount=stageUpgradeCount(ctx);
  const dungeonHtml=typeof dungeonBattleResultHtml==="function"?dungeonBattleResultHtml(ctx):"";
  title.textContent=FIXED_TITLE;
  detail.innerHTML=`<div class="notice"><b>已完成 ${done} / ${total} 場</b><div class="muted" style="margin-top:5px">以下獎勵已正式取得並保留。</div></div><div class="stats" style="margin-top:10px"><div class="stat">EXP<b>+${ctx.totalXp||0}</b></div><div class="stat">戰鬥金幣<b>+${ctx.totalGold||0}</b></div><div class="stat">自動出售<b>+${soldGold}</b></div><div class="stat">金幣合計<b>+${goldTotal}</b></div></div>${upgradeCount?`<div class="notice" style="margin-top:10px"><b>★ 有 ${upgradeCount} 件掉落可提升目前裝備</b></div>`:`<div class="muted" style="margin-top:10px">本階段沒有可提升目前裝備的掉落。</div>`}${stageDropListHtml(ctx)}${dungeonHtml}`;
  const btn=modal.querySelector(".controls .btn.primary");
  if(btn){
   btn.textContent=action==="restart"?"確認並重新戰鬥":"確認並返回";
   btn.onclick=function(){finishStageSettlement(ctx,action)};
  }
  modal.classList.add("show");
 }
 function restoreResultButton(){
  const modal=document.getElementById("battleResultModal"),btn=modal?.querySelector(".controls .btn.primary");
  if(btn){btn.textContent="確認";btn.onclick=closeBattleResultModal;}
 }
 function finishStageSettlement(ctx,action){
  const modal=document.getElementById("battleResultModal");if(modal)modal.classList.remove("show");
  restoreResultButton();
  pendingContinuousBattle=null;
  pendingResultAfterRest=null;
  if(typeof currentCombatEncounter!=="undefined")currentCombatEncounter=null;
  healBeforeBattle();
  if(action==="restart"){
   beginCombat(ctx.originalCount||selectedBattleCount||1);
  }else{
   adventureScreen="prepare";
   save();
   render();
  }
 }

 window.continueRiskBattle=function(){
  closeRiskModal();
  if(riskMode==="continuous"&&pendingContinuousBattle){
   showStageSettlement(pendingContinuousBattle,"restart");
   return;
  }
  beginCombat(pendingBattleCount||1);
 };

 window.riskRest=function(){
  closeRiskModal();
  if(riskMode==="continuous"&&pendingContinuousBattle){
   showStageSettlement(pendingContinuousBattle,"abandon");
   return;
  }
  pendingContinuousBattle=null;
  pendingResultAfterRest=null;
  if(typeof currentCombatEncounter!=="undefined")currentCombatEncounter=null;
  healBeforeBattle();
  adventureScreen="prepare";
  save();
  render();
 };
})();
