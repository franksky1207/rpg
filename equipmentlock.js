(function(){
 function normalizeLockFlag(item){
  if(item&&typeof item==="object")item.locked=item.locked===true;
  return item;
 }
 function normalizeAllGearLocks(){
  EQUIPMENT_TYPES.forEach(type=>normalizeLockFlag(state?.equipment?.[type]));
  (state?.inventory||[]).forEach(normalizeLockFlag);
  (state?.lostGear||[]).forEach(x=>normalizeLockFlag(x?.item));
  (state?.shop?.items||[]).forEach(normalizeLockFlag);
 }
 function restoreAfterEquipmentChange(){
  if(typeof restorePlayerHp==="function")return restorePlayerHp({save:false});
  state.hp=playerCombatStats().hp;
  return state.hp;
 }
 window.restoreAfterEquipmentChange=restoreAfterEquipmentChange;
 window.isGearLocked=function(item){return item?.locked===true;};
 window.shouldAutoSellItem=function(item){
  if(!item||item.locked===true||Number(item.q)===5)return false;
  const q=Math.floor(Number(item.q));
  return q>=0&&q<=4&&state?.settings?.autoSell?.[q]===true;
 };
 window.handleUnequippedItem=function(item,options={}){
  if(!item)return {kept:false,sold:0,item:null};
  normalizeLockFlag(item);
  if(shouldAutoSellItem(item)){
   const sold=specializationSellValue(item,options.useTestSpecializations===true);
   state.gold+=sold;
   return {kept:false,sold,item};
  }
  state.inventory.push(item);
  return {kept:true,sold:0,item};
 };

 addItem=function(item,options={}){
  if(!item)return {kept:false,sold:0};
  normalizeLockFlag(item);
  const upgrade=typeof isActualGearUpgrade==="function"?isActualGearUpgrade(item):equipmentScore(item)>equipmentScore(state.equipment[item.type]);
  if(Number(item.q)===5||(state.settings.keepUpgrade&&upgrade)||item.locked===true){
   state.inventory.push(item);
   if(upgrade)upgradeDropNoticePending=true;
   return {kept:true,sold:0};
  }
  if(shouldAutoSellItem(item)){
   const sold=specializationSellValue(item,options.useTestSpecializations===true);
   state.gold+=sold;
   return {kept:false,sold};
  }
  state.inventory.push(item);
  if(upgrade)upgradeDropNoticePending=true;
  return {kept:true,sold:0};
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
  const i=state.inventory.findIndex(x=>x.id===selectedItem);if(i<0)return {changed:false};
  const item=state.inventory.splice(i,1)[0],old=state.equipment[item.type]||null;
  state.equipment[item.type]=item;
  const handled=old?handleUnequippedItem(old):null;
  restoreAfterEquipmentChange();selectedItem=null;
  return {changed:true,item,old,handled};
 };
 window.equipmentEquipBestAll=function(){
  let changed=0,soldCount=0,soldGold=0;
  EQUIPMENT_TYPES.forEach(type=>{
   const current=state.equipment[type];let best=current,bestScore=equipmentScore(current);
   state.inventory.filter(it=>it.type===type).forEach(it=>{const sc=equipmentScore(it);if(sc>bestScore){best=it;bestScore=sc}});
   if(best&&best!==current){
    const idx=state.inventory.findIndex(it=>it.id===best.id);
    if(idx>=0){
     state.inventory.splice(idx,1);state.equipment[type]=best;
     if(current){const handled=handleUnequippedItem(current);if(handled.sold){soldCount++;soldGold+=handled.sold;}}
     changed++;
    }
   }
  });
  restoreAfterEquipmentChange();selectedItem=null;
  return {changed,soldCount,soldGold};
 };
 window.equipmentSellSelected=function(options={}){
  const i=state.inventory.findIndex(x=>x.id===selectedItem);if(i<0)return {ok:false,reason:"missing"};
  const item=state.inventory[i];
  if(item.locked===true)return {ok:false,reason:"locked",item};
  if(Number(item.q)===5&&options.confirmMythic!==true)return {ok:false,reason:"mythic",item};
  state.inventory.splice(i,1);
  const sold=specializationSellValue(item);state.gold+=sold;selectedItem=null;
  return {ok:true,item,sold};
 };
 window.equipmentLowerSalePreview=function(){
  const targets=state.inventory.filter(item=>{
   if(item?.locked===true||Number(item.q)===5)return false;
   const current=state.equipment[item.type];
   return !!current&&equipmentScore(item)<=equipmentScore(current);
  });
  return {targets,total:targets.reduce((sum,item)=>sum+specializationSellValue(item),0)};
 };
 window.equipmentSellLowerAll=function(preview=null){
  const data=preview?.targets?preview:equipmentLowerSalePreview();
  const ids=new Set(data.targets.map(item=>item.id));
  state.inventory=state.inventory.filter(item=>!ids.has(item.id));
  state.gold+=data.total;selectedItem=null;
  return {count:data.targets.length,total:data.total};
 };
 window.equipmentDiscardLostGear=function(i){
  const lost=state.lostGear?.[i];if(!lost)return {ok:false,reason:"missing"};
  if(lost.item?.locked===true)return {ok:false,reason:"locked",lost};
  state.lostGear.splice(i,1);return {ok:true,lost};
 };

 // 公開 UI 入口只做確認、提示、存檔與 render；裝備資料異動都交給上面的 equipment* 核心。
 compareHtml=function(it){return equipmentCompareHtml(it)};
 window.compareHtml=compareHtml;
 equipSelected=function(){
  const r=equipmentEquipSelected();if(!r.changed)return;
  save();render();
 };
 window.equipSelected=equipSelected;
 equipBestAll=function(){
  const r=equipmentEquipBestAll();save();render();
  if(!r.changed)return alert("目前裝備已是最佳。");
  const soldText=r.soldCount?`\n換下裝備自動出售 ${r.soldCount} 件，獲得 ${r.soldGold.toLocaleString()} 金幣。`:"";
  alert(`已更換 ${r.changed} 件較強裝備。${soldText}`);
 };
 window.equipBestAll=equipBestAll;
 sellSelected=function(){
  let r=equipmentSellSelected();
  if(r.reason==="locked")return alert("這件裝備已鎖定，請先解鎖後再出售。");
  if(r.reason==="mythic"){
   if(!confirm("這是神話裝備，確定要出售嗎？"))return;
   r=equipmentSellSelected({confirmMythic:true});
  }
  if(!r.ok)return;
  save();render();
 };
 window.sellSelected=sellSelected;
 sellLowerAll=function(){
  const preview=equipmentLowerSalePreview();
  if(!preview.targets.length)return alert("沒有可出售的未鎖定較低裝備。");
  if(!confirm(`將出售 ${preview.targets.length} 件未鎖定的較低或同能力裝備，共獲得 ${preview.total.toLocaleString()} 金幣。確定出售嗎？`))return;
  const r=equipmentSellLowerAll(preview);save();render();
  alert(`已出售 ${r.count} 件裝備，獲得 ${r.total.toLocaleString()} 金幣。`);
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

 injectLockStyles();normalizeAllGearLocks();save(false);
 const main=document.getElementById("main");
 if(main&&typeof MutationObserver!=="undefined")new MutationObserver(()=>setTimeout(enhanceEquippedLockControls,0)).observe(main,{childList:true,subtree:true});
 render();setTimeout(enhanceEquippedLockControls,0);
})();
