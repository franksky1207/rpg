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
 function round2(value){return Math.round((Number(value)||0)*100)/100;}

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

 function preservedMainRewardsHtml(ctx){
  const wins=Math.max(0,Math.floor(Number(ctx?.wins)||0));
  if(wins<=0)return "";
  const total=Math.max(wins,Math.floor(Number(ctx?.originalCount)||wins));
  const progress=round2(ctx?.totalDungeonProgress);
  const attempts=Math.max(0,Math.floor(Number(ctx?.gainedDungeonAttempts)||0));
  const drops=normalizeItems(ctx?.items);
  const dungeon=progress>0||attempts>0?`<div class="notice" style="margin-top:10px">副本進度 +${progress}${attempts>0?`　｜　可挑戰次數 +${attempts}`:""}</div>`:"";
  return `<div class="notice" style="margin-bottom:10px"><b>失敗前已勝利 ${wins} / ${total} 場</b><div class="muted" style="margin-top:5px">前段戰鬥已取得的 EXP、金幣、裝備與副本進度均已保留。</div></div><div class="stats" style="margin-bottom:10px"><div class="stat">前段 EXP<b>+${Number(ctx?.totalXp)||0}</b></div><div class="stat">前段金幣<b>+${Number(ctx?.totalGold)||0}</b></div></div>${drops.length?settlementDropListHtml(drops,{title:"前段裝備",emptyText:"",showCount:true,marginTop:10}):""}${dungeon}`;
 }

 if(typeof window.dropListHtml==="function"){
  window.dropListHtml=function(items){return settlementDropListHtml(items,{title:"裝備",emptyText:"裝備：無",showCount:false,marginTop:10});};
 }

 if(typeof window.showBattleResult==="function"){
  const baseShowBattleResult=window.showBattleResult;
  window.showBattleResult=function(ctx,defeat=null){
   baseShowBattleResult(ctx,defeat);
   const detail=document.getElementById("battleResultDetail");
   const preserved=defeat?preservedMainRewardsHtml(ctx):"";
   if(detail&&preserved)detail.insertAdjacentHTML("afterbegin",preserved);
   const extra=typeof vipEventsHtml==="function"?vipEventsHtml(ctx,defeat):"";
   if(detail&&extra)detail.insertAdjacentHTML("beforeend",extra);
  };
 }

 injectSettlementUiStyles();
})();