(function(){
 function normalizeLockFlag(item){
  if(item&&typeof item==="object")item.locked=item.locked===true;
  return item;
 }
 function normalizeAllGearLocks(){
  EQUIPMENT_TYPES.forEach(type=>normalizeLockFlag(state?.equipment?.[type]));
  (state?.inventory||[]).forEach(normalizeLockFlag);
  (state?.lostGear||[]).forEach(x=>normalizeLockFlag(x?.item));
 }
 function normalizeLostGearEconomy(){
  const universe=secondWorldActive();
  (state?.lostGear||[]).forEach(entry=>{
   const item=entry?.item;if(!item)return;
   const world=Number(item.world)===2?2:1;
   const rawCost=Number(entry.cost);
   if(world===2){
    entry.currency="darkMatter";
    const official=typeof window.secondWorldEquipmentRedemptionCost==="function"?window.secondWorldEquipmentRedemptionCost(item,false):null;
    if(official!=null&&Number.isFinite(Number(official)))entry.cost=Math.max(0,Math.floor(Number(official)));
    else entry.cost=Number.isFinite(rawCost)&&rawCost>=0?Math.floor(rawCost):0;
   }else if(universe){entry.currency="free";entry.cost=0;}
   else{entry.currency="gold";entry.cost=Number.isFinite(rawCost)&&rawCost>=0?Math.floor(rawCost):Math.ceil(Math.max(0,Number(item.buy)||0)*2);}
   entry.redemptionPending=false;
  });
 }
 function restoreAfterEquipmentChange(){
  if(typeof restorePlayerHp==="function")return restorePlayerHp({save:false});
  state.hp=playerCombatStats().hp;
  return state.hp;
 }
 function saleEnhancementReward(item,sale=null){return sale?.quote?.currency==="gold"?grantEnhancementStoneSaleReward(item):normalizeEnhancementStoneReward(null);}
 function saleEnhancementRewards(items,sale=null){return sale?.quote?.currency==="gold"?grantEnhancementStoneSaleRewards(items):normalizeEnhancementStoneReward(null);}
 function saleEnhancementText(reward){return enhancementStoneRewardText(reward);}
 function blankEnhancementReward(){return normalizeEnhancementStoneReward(null);}
 function mergeEnhancementRewards(...rewards){return mergeEnhancementStoneRewards(...rewards);}
 function secondWorldActive(){
  return typeof window.isSecondWorldEntered==="function"&&window.isSecondWorldEntered()===true;
 }
 function saleOwnerMissingResult(item=null){return {ok:false,reason:"sale-owner-missing",item,quote:{ok:false,currency:"unavailable",amount:0,gold:0,darkMatter:0,darkEnergy:0}};}
 function settleSale(item,options={}){
  if(typeof window.settleEquipmentSale==="function")return window.settleEquipmentSale(item,options);
  if(secondWorldActive())return saleOwnerMissingResult(item);
  const sold=typeof specializationSellValue==="function"?specializationSellValue(item,options.useTestSpecializations===true):Math.max(0,Math.floor(Number(item?.sell)||0));
  state.gold+=sold;
  return {ok:true,item,sold,quote:{currency:"gold",amount:sold,gold:sold,darkMatter:0,darkEnergy:0}};
 }
 function saleQuote(item,options={}){
  if(typeof window.equipmentSaleQuote==="function")return window.equipmentSaleQuote(item,options);
  if(secondWorldActive())return saleOwnerMissingResult(item).quote;
  const gold=typeof specializationSellValue==="function"?specializationSellValue(item,options.useTestSpecializations===true):Math.max(0,Math.floor(Number(item?.sell)||0));
  return {currency:"gold",amount:gold,gold,darkMatter:0,darkEnergy:0};
 }
 function saleText(value){
  if(typeof window.equipmentSaleText==="function")return window.equipmentSaleText(value);
  const quote=value?.quote||value||{};
  if(quote.currency==="unavailable")return "出售系統未載入";
  return Math.max(0,Math.floor(Number(quote.gold)||0)).toLocaleString()+" 金幣";
 }
 window.restoreAfterEquipmentChange=restoreAfterEquipmentChange;
 window.isGearLocked=function(item){return item?.locked===true;};
 window.shouldAutoSellItem=function(item){
  if(!item||item.locked===true||Number(item.q)===5)return false;
  const q=Math.floor(Number(item.q));
  return q>=0&&q<=4&&state?.settings?.autoSell?.[q]===true;
 };
 window.handleUnequippedItem=function(item,options={}){
  if(!item)return {kept:false,sold:0,item:null,sale:null,enhancementStones:blankEnhancementReward()};
  normalizeLockFlag(item);
  if(shouldAutoSellItem(item)){
   const sale=settleSale(item,options);
   if(!sale?.ok){state.inventory.push(item);return {kept:true,sold:0,item,sale:null,reason:sale?.reason||"sale",enhancementStones:blankEnhancementReward()};}
   return {kept:false,sold:Math.max(0,Number(sale?.quote?.amount)||0),item,sale,enhancementStones:saleEnhancementReward(item,sale)};
  }
  state.inventory.push(item);
  return {kept:true,sold:0,item,sale:null,enhancementStones:blankEnhancementReward()};
 };

 addItem=function(item,options={}){
  if(!item)return {kept:false,sold:0,item:null,sale:null,enhancementStones:blankEnhancementReward()};
  normalizeLockFlag(item);
  const upgrade=typeof isActualGearUpgrade==="function"?isActualGearUpgrade(item):equipmentScore(item)>equipmentScore(state.equipment[item.type]);
  if(Number(item.q)===5||(state.settings.keepUpgrade&&upgrade)||item.locked===true){
   state.inventory.push(item);
   if(upgrade)upgradeDropNoticePending=true;
   return {kept:true,sold:0,item,sale:null,enhancementStones:blankEnhancementReward()};
  }
  if(shouldAutoSellItem(item)){
   const sale=settleSale(item,options);
   if(!sale?.ok){state.inventory.push(item);if(upgrade)upgradeDropNoticePending=true;return {kept:true,sold:0,item,sale:null,reason:sale?.reason||"sale",enhancementStones:blankEnhancementReward()};}
   return {kept:false,sold:Math.max(0,Number(sale?.quote?.amount)||0),item,sale,enhancementStones:saleEnhancementReward(item,sale)};
  }
  state.inventory.push(item);
  if(upgrade)upgradeDropNoticePending=true;
  return {kept:true,sold:0,item,sale:null,enhancementStones:blankEnhancementReward()};
 };
 window.addItem=addItem;

 const baseItemHtml=typeof window.itemHtml==="function"?window.itemHtml:null;
 if(baseItemHtml){
  window.itemHtml=function(item,compact=false){
   const html=baseItemHtml(item,compact);
   return item?.locked===true?`<span class="gear-lock-mark" title="已鎖定">🔒</span> ${html}`:html;
  };
 }

 window.toggleSelectedItemLock=function(){
  const item=state.inventory?.find(x=>x?.id===selectedItem);
  if(!item)return;
  item.locked=item.locked!==true;
  save(false);render();
 };
 window.toggleEquippedItemLock=function(type){
  if(!EQUIPMENT_TYPES.includes(type))return;
  const item=state.equipment?.[type];if(!item)return;
  item.locked=item.locked!==true;
  save(false);render();
 };

 window.equipmentCompareHtml=function(it){
  const old=state.equipment[it.type],newScore=equipmentScore(it),oldScore=equipmentScore(old),diff=round1(old?newScore-oldScore:newScore),locked=it.locked===true;
  return `<div class="card" style="margin-top:14px"><h3>裝備比較</h3><div class="grid3"><div><div class="muted">目前</div>${itemHtml(old,true)}${old?gearAbilityHtml(old,true):""}</div><div><div class="muted">新裝備</div>${itemHtml(it,true)}${gearAbilityHtml(it,true)}</div><div><div class="muted">整體比較</div><div>目前 ${old?oldScore:"無"}</div><div>新裝備 ${newScore}</div><b style="color:${diff>0?"#76d587":diff<0?"#e27474":"#ccc"}">${diff>0?"+":""}${diff}</b></div></div><div class="controls"><button class="btn blue" onclick="equipSelected()">裝備</button><button class="btn ${locked?"ok":""}" onclick="toggleSelectedItemLock()">${locked?"🔒 已鎖定｜點擊解鎖":"🔓 鎖定裝備"}</button><button class="btn" onclick="sellSelected()" ${locked?"disabled":""}>出售</button></div>${locked?`<div class="muted" style="margin-top:7px">此裝備已鎖定，不會被手動出售、一鍵出售或自動出售。</div>`:""}</div>`;
 };
 window.equipmentEquipSelected=function(){
  const i=state.inventory.findIndex(x=>x.id===selectedItem);if(i<0)return {changed:false,enhancementStones:blankEnhancementReward()};
  const item=state.inventory.splice(i,1)[0],old=state.equipment[item.type]||null;
  state.equipment[item.type]=item;
  const handled=old?handleUnequippedItem(old):null;
  restoreAfterEquipmentChange();selectedItem=null;
  return {changed:true,item,old,handled,enhancementStones:normalizeEnhancementStoneReward(handled?.enhancementStones)};
 };
 window.equipmentEquipBestAll=function(){
  let changed=0,soldCount=0,enhancementStones=blankEnhancementReward();const saleQuotes=[];
  EQUIPMENT_TYPES.forEach(type=>{
   const current=state.equipment[type];let best=current,bestScore=equipmentScore(current);
   state.inventory.filter(it=>it.type===type).forEach(it=>{const sc=equipmentScore(it);if(sc>bestScore){best=it;bestScore=sc}});
   if(best&&best!==current){
    const idx=state.inventory.findIndex(it=>it.id===best.id);
    if(idx>=0){
     state.inventory.splice(idx,1);state.equipment[type]=best;
     if(current){
      const handled=handleUnequippedItem(current);
      if(handled.sale){soldCount++;saleQuotes.push(handled.sale.quote);}
      enhancementStones=mergeEnhancementRewards(enhancementStones,handled.enhancementStones);
     }
     changed++;
    }
   }
  });
  restoreAfterEquipmentChange();selectedItem=null;
  const sale=typeof window.mergeEquipmentSaleQuotes==="function"?window.mergeEquipmentSaleQuotes(saleQuotes):{currency:"gold",amount:saleQuotes.reduce((n,q)=>n+(Number(q?.gold)||0),0),gold:saleQuotes.reduce((n,q)=>n+(Number(q?.gold)||0),0)};
  return {changed,soldCount,sale,soldGold:Number(sale.gold)||0,enhancementStones};
 };
 window.equipmentSellSelected=function(options={}){
  const i=state.inventory.findIndex(x=>x.id===selectedItem);if(i<0)return {ok:false,reason:"missing"};
  const item=state.inventory[i];
  if(item.locked===true)return {ok:false,reason:"locked",item};
  if(Number(item.q)===5&&options.confirmMythic!==true)return {ok:false,reason:"mythic",item};
  const sale=settleSale(item);
  if(!sale?.ok)return {ok:false,reason:sale?.reason||"sale",item};
  state.inventory.splice(i,1);selectedItem=null;
  return {ok:true,item,sold:Math.max(0,Number(sale.quote?.amount)||0),sale,enhancementStones:saleEnhancementReward(item,sale)};
 };
 window.equipmentLowerSalePreview=function(){
  const targets=state.inventory.filter(item=>{
   if(item?.locked===true)return false;
   const current=state.equipment[item.type];
   return !!current&&equipmentScore(item)<=equipmentScore(current);
  });
  const quote=typeof window.equipmentSaleBatchQuote==="function"?window.equipmentSaleBatchQuote(targets):(secondWorldActive()?{ok:false,currency:"unavailable",amount:0,gold:0,darkMatter:0,darkEnergy:0}:{currency:"gold",amount:targets.reduce((sum,item)=>sum+saleQuote(item).amount,0),gold:targets.reduce((sum,item)=>sum+saleQuote(item).gold,0),darkMatter:0,darkEnergy:0});
  return {targets,total:quote.amount,quote};
 };
 window.equipmentSellLowerAll=function(preview=null){
  const data=preview?.targets?preview:equipmentLowerSalePreview();
  if(secondWorldActive()&&typeof window.settleEquipmentSaleBatch!=="function")return {ok:false,reason:"sale-owner-missing",count:0,total:0};
  const sale=typeof window.settleEquipmentSaleBatch==="function"?window.settleEquipmentSaleBatch(data.targets):null;
  if(!sale?.ok&&typeof window.settleEquipmentSaleBatch==="function")return {ok:false,reason:sale?.reason||"sale",count:0,total:0};
  if(!sale){
   const rows=data.targets.map(item=>settleSale(item));if(rows.some(row=>!row?.ok))return {ok:false,reason:"sale",count:0,total:0};
  }
  const ids=new Set(data.targets.map(item=>item.id));
  state.inventory=state.inventory.filter(item=>!ids.has(item.id));selectedItem=null;
  const effectiveSale=sale||{ok:true,quote:data.quote,total:data.quote?.amount||0,count:data.targets.length};
  const enhancementStones=saleEnhancementRewards(data.targets,effectiveSale);
  return {ok:true,count:data.targets.length,total:Math.max(0,Number(effectiveSale.quote?.amount)||0),sale:effectiveSale,enhancementStones};
 };
 window.equipmentDiscardLostGear=function(i){
  const lost=state.lostGear?.[i];if(!lost)return {ok:false,reason:"missing"};
  if(lost.item?.locked===true)return {ok:false,reason:"locked",lost};
  state.lostGear.splice(i,1);return {ok:true,lost};
 };

 compareHtml=function(it){return equipmentCompareHtml(it)};
 window.compareHtml=compareHtml;
 equipSelected=function(){
  const r=equipmentEquipSelected();if(!r.changed)return;
  save();render();
  if(r.handled?.sale){
   const stoneText=saleEnhancementText(r.enhancementStones),reward=saleText(r.handled.sale);
   alert(`已裝備新裝備。換下裝備自動出售，獲得 ${reward}${stoneText?`，另獲得 ${stoneText}`:""}。`);
  }
 };
 window.equipSelected=equipSelected;
 equipBestAll=function(){
  const r=equipmentEquipBestAll();save();render();
  if(!r.changed)return alert("目前裝備已是最佳。");
  const stoneText=saleEnhancementText(r.enhancementStones);
  const soldText=r.soldCount?`\n換下裝備自動出售 ${r.soldCount} 件，獲得 ${saleText(r.sale)}${stoneText?`，另獲得 ${stoneText}`:""}。`:"";
  alert(`已更換 ${r.changed} 件較強裝備。${soldText}`);
 };
 window.equipBestAll=equipBestAll;
 sellSelected=function(){
  let r=equipmentSellSelected();
  if(r.reason==="locked")return alert("這件裝備已鎖定，請先解鎖後再出售。");
  if(r.reason==="mythic"){
   const preview=saleQuote(r.item);
   if(!confirm(`這是神話裝備，出售可獲得 ${saleText(preview)}。確定要出售嗎？`))return;
   r=equipmentSellSelected({confirmMythic:true});
  }
  if(!r.ok)return alert("裝備出售失敗。");
  const stoneText=saleEnhancementText(r.enhancementStones);
  save();render();
  alert(`已出售裝備，獲得 ${saleText(r.sale)}${stoneText?`，另獲得 ${stoneText}`:""}。`);
 };
 window.sellSelected=sellSelected;
 sellLowerAll=function(){
  const preview=equipmentLowerSalePreview();
  if(!preview.targets.length)return alert("沒有可出售的未鎖定較低裝備。");
  if(!confirm(`將出售 ${preview.targets.length} 件未鎖定的較低或同能力裝備，共獲得 ${saleText(preview.quote)}。確定出售嗎？`))return;
  const r=equipmentSellLowerAll(preview);if(!r.ok)return alert("批量出售失敗。");save();render();
  const stoneText=saleEnhancementText(r.enhancementStones);
  alert(`已出售 ${r.count} 件裝備，獲得 ${saleText(r.sale)}${stoneText?`，另獲得 ${stoneText}`:""}。`);
 };
 window.sellLowerAll=sellLowerAll;
 discardLostGear=function(i){
  const lost=state.lostGear?.[i];if(!lost)return;
  if(lost.item?.locked===true)return alert("這件遺失裝備仍處於鎖定狀態；請先贖回並解鎖後再放棄。");
  const label=lost.item?itemHtmlPlain(lost.item):"這件遺失裝備";
  if(!confirm(`確定永久放棄 ${label} 嗎？放棄後無法復原。`))return;
  const r=equipmentDiscardLostGear(i);if(!r.ok)return;
  save();render();
 };
 window.discardLostGear=discardLostGear;

 if(typeof window.equipSettlementDrop==="function"){
  const baseEquipSettlementDrop=window.equipSettlementDrop;
  window.equipSettlementDrop=function(...args){
   const result=baseEquipSettlementDrop(...args);
   restoreAfterEquipmentChange();save(false);
   return result;
  };
 }

 function injectLockStyles(){
  if(document.getElementById("equipment-lock-styles"))return;
  const style=document.createElement("style");style.id="equipment-lock-styles";
  style.textContent=`.gear-lock-mark{display:inline-block;margin-right:2px;font-size:.92em}.equipped-lock-control{margin-top:7px}.equipped-lock-control .btn{padding:6px 10px;font-size:12px}`;
  document.head.appendChild(style);
 }
 function enhanceEquippedLockControls(){
  if(view!=="inventory")return;
  const main=document.getElementById("main"),firstCard=main?.querySelector(".grid > .card");if(!firstCard)return;
  const rows=Array.from(firstCard.children).filter(el=>el.classList?.contains("item"));
  rows.slice(0,EQUIPMENT_TYPES.length).forEach((row,index)=>{
   if(row.querySelector(".equipped-lock-control"))return;
   const type=EQUIPMENT_TYPES[index],item=state.equipment?.[type];if(!item)return;
   const control=document.createElement("div");control.className="equipped-lock-control";
   control.innerHTML=`<button class="btn ${item.locked===true?"ok":""}" onclick="toggleEquippedItemLock('${type}')">${item.locked===true?"🔒 已鎖定｜點擊解鎖":"🔓 鎖定裝備"}</button>`;
   row.appendChild(control);
  });
 }

 window.EQUIPMENT_ENHANCEMENT_PIPELINE_VERSION=4;
 window.EQUIPMENT_SALE_FAIL_CLOSED_VERSION=1;
 window.EQUIPMENT_LOST_GEAR_ECONOMY_NORMALIZATION_VERSION=1;
 injectLockStyles();normalizeAllGearLocks();normalizeLostGearEconomy();save(false);
 const main=document.getElementById("main");
 if(main&&typeof MutationObserver!=="undefined")new MutationObserver(()=>setTimeout(enhanceEquippedLockControls,0)).observe(main,{childList:true,subtree:true});
 setTimeout(enhanceEquippedLockControls,0);
})();
