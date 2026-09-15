(function(){
 function normalizeItems(items){return Array.isArray(items)?items.filter(x=>x&&x.item):[];}
 function encodedItemId(item){return encodeURIComponent(String(item?.id||""));}
 function decodedItemId(value){try{return decodeURIComponent(String(value||""));}catch(e){return "";}}
 function inventoryItemById(id){return state.inventory?.find(it=>String(it?.id)===String(id))||null;}
 function equippedItemById(id){return EQUIPMENT_TYPES.map(type=>state.equipment?.[type]).find(it=>it&&String(it.id)===String(id))||null;}
 function stoneText(reward){return typeof enhancementStoneRewardText==="function"?enhancementStoneRewardText(reward):"";}
 function mergeRewards(...rewards){return typeof mergeEnhancementStoneRewards==="function"?mergeEnhancementStoneRewards(...rewards):rewards.reduce((sum,reward)=>({basic:sum.basic+Math.max(0,Math.floor(Number(reward?.basic)||0)),advanced:sum.advanced+Math.max(0,Math.floor(Number(reward?.advanced)||0))}),{basic:0,advanced:0});}
 function rewardStatsHtml(reward,label="強化石"){
  const r=mergeRewards(reward),parts=[];
  if(r.basic)parts.push(`<div class="stat">${label}・基礎<b>+${r.basic}</b></div>`);
  if(r.advanced)parts.push(`<div class="stat">${label}・進階<b>+${r.advanced}</b></div>`);
  return parts.join("");
 }
 function battleEnhancementSummaryHtml(ctx){
  const battle=mergeRewards(ctx?.enhancementRewards?.battle),autoSale=mergeRewards(ctx?.enhancementRewards?.autoSale),total=mergeRewards(battle,autoSale);
  if(!total.basic&&!total.advanced)return "";
  const rows=[];
  if(battle.basic||battle.advanced)rows.push(`<div class="muted">打怪掉落：${stoneText(battle)}</div>`);
  if(autoSale.basic||autoSale.advanced)rows.push(`<div class="muted">AUTO 出售：${stoneText(autoSale)}</div>`);
  return `<div class="notice" style="margin-top:10px"><b>強化石獎勵</b><div class="stats" style="margin-top:8px">${rewardStatsHtml(total)}</div>${rows.join("")}</div>`;
 }
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
   const reward=stoneText(handled.enhancementStones);
   const note=document.createElement("div");
   note.className="settlement-swap-sold";
   note.textContent=`換下裝備已自動出售 +${handled.sold} 金幣${reward?`，另獲得 ${reward}`:""}`;
   row.appendChild(note);
  }
 };

 window.settlementDropListHtml=function(items,options={}){
  const rows=normalizeItems(items);
  const title=options.title==null?"裝備":String(options.title);
  const emptyText=options.emptyText==null?"裝備：無":String(options.emptyText);
  const showCount=!!options.showCount;
  const marginTop=Number.isFinite(Number(options.marginTop))?Number(options.marginTop):10;
  if(rows.length&&typeof upgradeDropNoticePending!=="undefined")upgradeDropNoticePending=false;
  if(!rows.length)return `<div class="muted" style="margin-top:${marginTop}px">${emptyText}</div>`;
  const heading=showCount?`${title} ${rows.length} 件`:title;
  return `<div class="settlement-drop-wrap" style="margin-top:${marginTop}px"><div class="settlement-drop-head"><b>${heading}</b></div><div class="settlement-drop-scroll">${rows.map(x=>{
   const item=x.item,sold=Number(x.sold)||0,id=encodedItemId(item),saleStoneText=sold&&typeof enhancementStoneSaleReward==="function"?stoneText(enhancementStoneSaleReward(item)):"";
   return `<div class="settlement-drop-row" data-settlement-item="${id}">${itemHtml(item,true)}${!sold&&typeof gearAbilityHtml==="function"?gearAbilityHtml(item,true):""}${sold?`<div class="muted">自動出售 +${sold} 金幣${saleStoneText?`｜${saleStoneText}`:""}</div>`:`<div class="settlement-equip-control">${equipControlHtml(item)}</div>`}</div>`;
  }).join("")}</div></div>`;
 };

 function mainBattleSectionHtml(ctx,options={}){
  const wins=Math.max(0,Math.floor(Number(ctx?.wins)||0));
  const continuous=ctx?.continuous===true;
  const total=continuous?null:Math.max(wins,Math.floor(Number(ctx?.originalCount)||wins));
  const drops=normalizeItems(ctx?.items);
  const interrupted=options.interrupted===true;
  const note=continuous
   ?(interrupted?`已完成 ${wins} 場，連續戰鬥已結束；已取得的獎勵均保留。`:`完成 ${wins} 場`)
   :(interrupted?`已完成 ${wins} / ${total} 場，剩餘連戰已取消；已取得的獎勵均保留。`:`勝利 ${wins} / ${total} 場`);
  return `<div class="settlement-section"><div class="settlement-section-title">主線戰鬥</div><div class="notice"><b>${note}</b></div><div class="stats" style="margin-top:10px"><div class="stat">EXP<b>+${Number(ctx?.totalXp)||0}</b></div><div class="stat">金幣<b>+${Number(ctx?.totalGold)||0}</b></div></div>${battleEnhancementSummaryHtml(ctx)}${drops.length?settlementDropListHtml(drops,{title:"主線裝備",emptyText:"",showCount:true,marginTop:10}):`<div class="muted" style="margin-top:10px">本次沒有主線裝備掉落。</div>`}</div>`;
 }
 window.mainBattleSettlementHtml=mainBattleSectionHtml;
 window.enhancementStoneSettlementSummaryHtml=battleEnhancementSummaryHtml;

 function specialEntryHtml(entry,index,total){
  const special=entry?.special||{},result=entry?.result||{},name=special.name||"未知特殊怪";
  const prefix=total>1?`特殊遭遇 ${index+1}｜`:"";
  if(result.win){
   const rewardLabel=result.rewardContext?.randomReward?.label;
   const bonusLabel=result.bonusRewardContext?.randomReward?.label;
   const intel=result.blackMarketIntelGranted?`<div class="notice black-market-intel-notice" style="margin-top:10px"><b>取得黑市情報</b><div class="muted" style="margin-top:5px">下一次符合特殊遭遇條件的主線戰鬥勝利後，必定觸發另一隻特殊怪；不會再次遇到黑市武裝頭目。</div></div>`:"";
   return `<div class="settlement-special-entry"><div class="settlement-special-name">${prefix}✦ ${name} 擊破</div>${rewardLabel?`<div class="muted" style="margin-top:5px">特殊獎勵：${rewardLabel}</div>`:""}<div class="stats" style="margin-top:9px"><div class="stat">特殊 EXP<b>+${Number(result.xp)||0}</b></div><div class="stat">特殊金幣<b>+${Number(result.gold)||0}</b></div>${result.convertedGold?`<div class="stat">滿等 EXP 轉金幣<b>+${result.convertedGold}</b></div>`:""}</div>${settlementDropListHtml(result.drops,{title:"特殊裝備",emptyText:"本次沒有特殊裝備掉落。",showCount:true,marginTop:10})}${result.vip10Triggered?`<div class="vip-event">【VIP10】特殊獎勵再次發動！${bonusLabel?`<div class="muted" style="margin-top:4px">第二次獎勵：${bonusLabel}</div>`:""}</div>`:""}${intel}</div>`;
  }
  const lost=result.penalty?.dropped;
  return `<div class="settlement-special-entry"><div class="settlement-special-name">${prefix}✦ ${name} 挑戰失敗</div><div class="notice" style="margin-top:9px">本次連續戰鬥立即結束。</div><div class="item" style="margin-top:9px"><b>EXP 損失：${result.penalty?.expLost||0}</b></div>${lost?`<div style="margin-top:9px"><b>遺失裝備</b><div class="item">${itemHtml(lost,true)}${typeof gearAbilityHtml==="function"?gearAbilityHtml(lost,true):""}</div><div class="muted">已移至背包的「遺失裝備贖回」。</div></div>`:`<div class="muted" style="margin-top:9px">本次沒有遺失裝備。</div>`}${result.penalty?.protectedByVip20?`<div class="vip-event">【VIP20】裝備受到保護，本次死亡沒有遺失裝備。</div>`:""}</div>`;
 }
 function specialEncounterSectionHtml(ctx){
  const entries=Array.isArray(ctx?.specialEncounters)?ctx.specialEncounters.filter(x=>x?.result):[];
  if(!entries.length)return "";
  return `<div class="settlement-section"><div class="settlement-section-title">特殊遭遇</div>${entries.map((entry,index)=>specialEntryHtml(entry,index,entries.length)).join("")}</div>`;
 }
 window.specialEncounterSettlementHtml=specialEncounterSectionHtml;

 function preservedMainRewardsHtml(ctx){return mainBattleSectionHtml(ctx,{interrupted:true});}

 if(typeof window.dropListHtml==="function"){
  window.dropListHtml=function(items){return settlementDropListHtml(items,{title:"裝備",emptyText:"裝備：無",showCount:false,marginTop:10});};
 }

 if(typeof window.showBattleResult==="function"){
  const baseShowBattleResult=window.showBattleResult;
  window.showBattleResult=function(ctx,defeat=null){
   const title=document.getElementById("battleResultTitle"),detail=document.getElementById("battleResultDetail"),modal=document.getElementById("battleResultModal");
   if(!defeat&&title&&detail&&modal){
    title.textContent=ctx?.continuous===true?"連續戰鬥結算":"戰鬥勝利";
    detail.innerHTML=mainBattleSectionHtml(ctx)+specialEncounterSectionHtml(ctx);
    modal.classList.add("show");
   }else{
    baseShowBattleResult(ctx,defeat);
    const preserved=defeat?preservedMainRewardsHtml(ctx):"";
    if(detail&&preserved)detail.insertAdjacentHTML("afterbegin",preserved);
   }
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

 setTimeout(maybeShowIntro,0);
})();
