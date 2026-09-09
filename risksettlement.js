(function(){
 const FIXED_TITLE="連續戰鬥階段結算";

 function injectSettlementStyles(){
  if(document.getElementById("stage-settlement-ui-styles"))return;
  const style=document.createElement("style");
  style.id="stage-settlement-ui-styles";
  style.textContent=`
   #battleResultModal .modal-box{max-height:calc(100dvh - 28px);display:flex;flex-direction:column;overflow:hidden}
   #battleResultModal #battleResultDetail{min-height:0;overflow:auto;overscroll-behavior:contain;padding-right:2px}
   #battleResultModal>.modal-box>.controls{flex:0 0 auto;margin-top:10px}
   .stage-drop-wrap{margin-top:10px}
   .stage-drop-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:7px}
   .stage-drop-scroll{height:210px;overflow-y:auto;overscroll-behavior:contain;border:1px solid #323740;border-radius:10px;background:#0f1319;padding:7px;scrollbar-gutter:stable}
   .stage-drop-row{padding:8px 9px;border-bottom:1px solid #292e36;line-height:1.35}
   .stage-drop-row:last-child{border-bottom:0}
   .stage-drop-row .muted{margin-top:3px;font-size:12px}
   @media(max-width:760px){
    #battleResultModal{padding:10px}
    #battleResultModal .modal-box{max-height:calc(100dvh - 20px);padding:14px}
    .stage-drop-scroll{height:190px;padding:6px}
    .stage-drop-row{padding:7px 8px}
   }
  `;
  document.head.appendChild(style);
 }

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
  return `<div class="stage-drop-wrap"><div class="stage-drop-head"><b>裝備掉落 ${items.length} 件</b></div><div class="stage-drop-scroll">${items.map(x=>{
   const it=x.item;
   return `<div class="stage-drop-row">${itemHtml(it,true)}${x.sold?`<div class="muted">自動出售 +${x.sold} 金幣</div>`:""}</div>`;
  }).join("")}</div></div>`;
 }
 function showStageSettlement(ctx,action){
  if(!ctx)return;
  injectSettlementStyles();
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

 injectSettlementStyles();
})();
