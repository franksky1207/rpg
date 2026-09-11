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
   .settlement-equip-control{margin-top:7px;display:flex;align-items:center;gap:8px;flex-wrap:wrap}
   .settlement-equip-control .btn{padding:7px 11px}
   .settlement-upgrade-delta{color:#76d587;font-weight:700}
   .settlement-swap-sold{margin-top:6px;color:#d8c49a;font-size:12px}
   #gameIntroModal .modal-box{max-width:520px}
   .game-intro-title{color:#f0d494;margin-bottom:12px}
   .game-intro-copy{line-height:1.8;color:#e6e0d5}
   .game-intro-gear{margin-top:14px;padding:10px 12px;border:1px solid #4a4232;border-radius:9px;background:#12161c;color:#d8c49a}
   #gameIntroModal .controls{margin-top:18px;justify-content:flex-end}
   @media(max-width:760px){
    #battleResultModal{padding:10px!important}
    #battleResultModal .modal-box{max-height:calc(100dvh - 20px)!important;padding:14px!important}
    .settlement-drop-scroll{height:190px;padding:6px}
    .settlement-drop-row{padding:7px 8px}
    #gameIntroModal{padding:12px!important}
   }
  `;
  document.head.appendChild(style);
 }

 function normalizeItems(items){return Array.isArray(items)?items.filter(x=>x&&x.item):[];}
 function round2(value){return Math.round((Number(value)||0)*100)/100;}
 function encodedItemId(item){return encodeURIComponent(String(item?.id||""));}
 function decodedItemId(value){try{return decodeURIComponent(String(value||""));}catch(e){return "";}}
 function inventoryItemById(id){return state.inventory?.find(it=>String(it?.id)===String(id))||null;}
 function equippedItemById(id){return EQUIPMENT_TYPES.map(type=>state.equipment?.[type]).find(it=>it&&String(it.id)===String(id))||null;}
 function actualUpgradeDelta(item){
  if(!item)return 0;
  if(typeof gearActualDelta==="function")return Number(gearActualDelta(item))||0;
  const current=state.equipment?.[item.type];
  return round1(equipmentScore(item)-equipmentScore(current));
 }
 function equipControlHtml(item){
  if(!item?.id)return "";
  const id=String(item.id);
  if(equippedItemById(id))return `<span class="muted">已裝備</span>`;
  const kept=inventoryItemById(id);
  if(!kept)return `<span class="muted">已處理</span>`;
  const delta=actualUpgradeDelta(kept);
  if(delta>0)return `<span class="settlement-upgrade-delta">較目前 +${round1(delta)}</span><button class="btn blue" onclick="equipSettlementDrop(this)">立即裝備</button>`;
  return `<span class="muted">留在背包</span>`;
 }
 function syncSettlementEquipControls(){
  document.querySelectorAll(".settlement-drop-row[data-settlement-item]").forEach(row=>{
   const id=decodedItemId(row.dataset.settlementItem),control=row.querySelector(".settlement-equip-control");
   if(!control)return;
   const item=inventoryItemById(id)||equippedItemById(id);
   control.innerHTML=item?equipControlHtml(item):`<span class="muted">已處理</span>`;
  });
 }

 window.equipSettlementDrop=function(button){
  const row=button?.closest?.(".settlement-drop-row[data-settlement-item]");
  if(!row)return;
  const id=decodedItemId(row.dataset.settlementItem);
  const index=state.inventory.findIndex(it=>String(it?.id)===String(id));
  if(index<0){syncSettlementEquipControls();return;}
  const item=state.inventory[index];
  if(actualUpgradeDelta(item)<=0){syncSettlementEquipControls();return;}
  const old=state.equipment[item.type]||null;
  state.inventory.splice(index,1);
  state.equipment[item.type]=item;
  let handled=null;
  if(old){
   if(typeof handleUnequippedItem==="function")handled=handleUnequippedItem(old);
   else{state.inventory.push(old);handled={kept:true,sold:0,item:old};}
  }
  normalizeHP();
  selectedItem=null;
  save(false);
  syncSettlementEquipControls();
  row.querySelector(".settlement-swap-sold")?.remove();
  if(handled?.sold){
   const note=document.createElement("div");
   note.className="settlement-swap-sold";
   note.textContent=`換下裝備已自動出售 +${handled.sold} 金幣`;
   row.appendChild(note);
  }
 };

 window.settlementDropListHtml=function(items,options={}){
  injectSettlementUiStyles();
  const rows=normalizeItems(items);
  const title=options.title==null?"裝備":String(options.title);
  const emptyText=options.emptyText==null?"裝備：無":String(options.emptyText);
  const showCount=!!options.showCount;
  const marginTop=Number.isFinite(Number(options.marginTop))?Number(options.marginTop):10;
  if(rows.length&&typeof upgradeDropNoticePending!=="undefined")upgradeDropNoticePending=false;
  if(!rows.length)return `<div class="muted" style="margin-top:${marginTop}px">${emptyText}</div>`;
  const heading=showCount?`${title} ${rows.length} 件`:title;
  return `<div class="settlement-drop-wrap" style="margin-top:${marginTop}px"><div class="settlement-drop-head"><b>${heading}</b></div><div class="settlement-drop-scroll">${rows.map(x=>{
   const item=x.item,sold=Number(x.sold)||0,id=encodedItemId(item);
   return `<div class="settlement-drop-row" data-settlement-item="${id}">${itemHtml(item,true)}${!sold&&typeof gearAbilityHtml==="function"?gearAbilityHtml(item,true):""}${sold?`<div class="muted">自動出售 +${sold} 金幣</div>`:`<div class="settlement-equip-control">${equipControlHtml(item)}</div>`}</div>`;
  }).join("")}</div></div>`;
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
   if(typeof upgradeDropNoticePending!=="undefined")upgradeDropNoticePending=false;
   syncSettlementEquipControls();
  };
 }

 function ensureIntroModal(){
  if(document.getElementById("gameIntroModal"))return;
  const modal=document.createElement("div");
  modal.className="modal";
  modal.id="gameIntroModal";
  modal.innerHTML=`<div class="modal-box"><h2 class="game-intro-title">文明戰線</h2><div class="game-intro-copy">戰火早已蔓延整個世界。<br>各地勢力為了資源與生存持續交鋒。<br>而你，也將從最基礎的裝備開始，一步步踏上自己的征途。</div><div class="game-intro-gear">此刻，你身上只有一套最普通的 <b>Lv.1 裝備</b>。<br>接下來，就靠戰鬥、升級與更換裝備走得更遠。</div><div class="controls"><button class="btn primary" onclick="completeGameIntro()">踏上征途</button></div></div>`;
  document.body.appendChild(modal);
 }
 function normalizeIntroState(){
  if(typeof state.introSeen==="boolean")return;
  state.introSeen=true;
  save(false);
 }
 function maybeShowIntro(){
  normalizeIntroState();
  if(state.introSeen!==false)return;
  ensureIntroModal();
  document.getElementById("gameIntroModal")?.classList.add("show");
 }
 window.completeGameIntro=function(){
  state.introSeen=true;
  save(false);
  document.getElementById("gameIntroModal")?.classList.remove("show");
 };
 if(typeof window.resetGame==="function"){
  const baseResetGame=window.resetGame;
  window.resetGame=function(){baseResetGame();setTimeout(maybeShowIntro,0);};
 }

 injectSettlementUiStyles();
 setTimeout(maybeShowIntro,0);
})();
