(function(){
 if(typeof window.specialEncounterSettlementHtml!=="function")return;
 const baseSpecialEncounterSettlementHtml=window.specialEncounterSettlementHtml;
 window.specialEncounterSettlementHtml=function(ctx){
  let html=baseSpecialEncounterSettlementHtml(ctx);
  const granted=(Array.isArray(ctx?.specialEncounters)?ctx.specialEncounters:[]).some(entry=>entry?.result?.blackMarketIntelGranted===true);
  if(granted)html+=`<div class="notice black-market-intel-notice" style="margin-top:10px"><b>取得黑市情報</b><div class="muted" style="margin-top:5px">下一次符合特殊遭遇條件的主線戰鬥勝利後，必定觸發另一隻特殊怪；不會再次遇到黑市武裝頭目。</div></div>`;
  return html;
 };
 window.BLACK_MARKET_INTEL_UI_VERSION=1;
})();