(function(){
 function injectSettlementUiStyles(){
  if(document.getElementById("settlement-ui-styles"))return;
  const style=document.createElement("style");
  style.id="settlement-ui-styles";
  style.textContent=`
   #battleResultModal .modal-box{max-height:calc(100dvh - 24px)!important;display:flex!important;flex-direction:column!important;overflow:hidden!important}
   #battleResultModal #battleResultDetail{min-height:0!important;overflow:auto!important;overscroll-behavior:contain;padding-right:2px}
   #battleResultModal>.modal-box>.controls{flex:0 0 auto!important;margin-top:10px!important}
   .settlement-drop-wrap{margin-top:10px}
   .settlement-drop-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:7px}
   .settlement-drop-scroll{height:210px;overflow-y:auto;overscroll-behavior:contain;border:1px solid #323740;border-radius:10px;background:#0f1319;padding:7px;scrollbar-gutter:stable}
   .settlement-drop-row{padding:8px 9px;border-bottom:1px solid #292e36;line-height:1.35}
   .settlement-drop-row:last-child{border-bottom:0}
   .settlement-drop-row .muted{margin-top:3px;font-size:12px}
   @media(max-width:760px){
    #battleResultModal{padding:10px!important}
    #battleResultModal .modal-box{max-height:calc(100dvh - 20px)!important;padding:14px!important}
    .settlement-drop-scroll{height:190px;padding:6px}
    .settlement-drop-row{padding:7px 8px}
   }
  `;
  document.head.appendChild(style);
 }

 function normalizeItems(items){return Array.isArray(items)?items.filter(x=>x&&x.item):[];}

 window.settlementDropListHtml=function(items,options={}){
  injectSettlementUiStyles();
  const rows=normalizeItems(items);
  const title=options.title==null?"裝備":String(options.title);
  const emptyText=options.emptyText==null?"裝備：無":String(options.emptyText);
  const showCount=!!options.showCount;
  const marginTop=Number.isFinite(Number(options.marginTop))?Number(options.marginTop):10;
  if(!rows.length)return `<div class="muted" style="margin-top:${marginTop}px">${emptyText}</div>`;
  const heading=showCount?`${title} ${rows.length} 件`:title;
  return `<div class="settlement-drop-wrap" style="margin-top:${marginTop}px"><div class="settlement-drop-head"><b>${heading}</b></div><div class="settlement-drop-scroll">${rows.map(x=>`<div class="settlement-drop-row">${itemHtml(x.item,true)}${x.sold?`<div class="muted">自動出售 +${x.sold} 金幣</div>`:""}</div>`).join("")}</div></div>`;
 };

 if(typeof window.dropListHtml==="function"){
  window.dropListHtml=function(items){return settlementDropListHtml(items,{title:"裝備",emptyText:"裝備：無",showCount:false,marginTop:10});};
 }

 if(typeof window.showBattleResult==="function"){
  const baseShowBattleResult=window.showBattleResult;
  window.showBattleResult=function(ctx,defeat=null){
   baseShowBattleResult(ctx,defeat);
   const detail=document.getElementById("battleResultDetail");
   const extra=typeof vipEventsHtml==="function"?vipEventsHtml(ctx,defeat):"";
   if(detail&&extra)detail.insertAdjacentHTML("beforeend",extra);
  };
 }

 injectSettlementUiStyles();
})();