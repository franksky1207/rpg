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

 if(typeof window.makeItem==="function"){
  const baseMakeItem=window.makeItem;
  window.makeItem=function(...args){
   const item=baseMakeItem(...args);
   if(item&&typeof item.locked!=="boolean")item.locked=false;
   return item;
  };
 }

 if(typeof window.normalizeSaveItem==="function"){
  const baseNormalizeSaveItem=window.normalizeSaveItem;
  window.normalizeSaveItem=function(...args){return normalizeLockFlag(baseNormalizeSaveItem(...args));};
 }

 if(typeof window.addItem==="function"){
  const baseAddItem=window.addItem;
  window.addItem=function(item,options={}){
   normalizeLockFlag(item);
   if(!item?.locked)return baseAddItem(item,options);
   const q=Math.floor(Number(item.q));
   if(q<0||q>4||!state?.settings?.autoSell?.[q])return baseAddItem(item,options);
   const previous=state.settings.autoSell[q];
   state.settings.autoSell[q]=false;
   try{return baseAddItem(item,options);}
   finally{state.settings.autoSell[q]=previous;}
  };
 }

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
  save(false);
  render();
 };
 window.toggleEquippedItemLock=function(type){
  if(!EQUIPMENT_TYPES.includes(type))return;
  const item=state.equipment?.[type];
  if(!item)return;
  item.locked=item.locked!==true;
  save(false);
  render();
 };

 if(typeof window.compareHtml==="function"){
  window.compareHtml=function(it){
   const old=state.equipment[it.type],newScore=equipmentScore(it),oldScore=equipmentScore(old),diff=round1(old?newScore-oldScore:newScore),locked=it.locked===true;
   return `<div class="card" style="margin-top:14px"><h3>裝備比較</h3><div class="grid3"><div><div class="muted">目前</div>${itemHtml(old,true)}${old?gearAbilityHtml(old,true):""}</div><div><div class="muted">新裝備</div>${itemHtml(it,true)}${gearAbilityHtml(it,true)}</div><div><div class="muted">整體比較</div><div>目前 ${old?oldScore:"無"}</div><div>新裝備 ${newScore}</div><b style="color:${diff>0?"#76d587":diff<0?"#e27474":"#ccc"}">${diff>0?"+":""}${diff}</b></div></div><div class="controls"><button class="btn blue" onclick="equipSelected()">裝備</button><button class="btn ${locked?"ok":""}" onclick="toggleSelectedItemLock()">${locked?"🔒 已鎖定｜點擊解鎖":"🔓 鎖定裝備"}</button><button class="btn" onclick="sellSelected()" ${locked?"disabled":""}>出售</button></div>${locked?`<div class="muted" style="margin-top:7px">此裝備已鎖定，不會被手動出售、一鍵出售或自動出售。</div>`:""}</div>`;
  };
 }

 if(typeof window.equipSelected==="function"){
  window.equipSelected=function(){
   const i=state.inventory.findIndex(x=>x.id===selectedItem);
   if(i<0)return;
   const item=state.inventory.splice(i,1)[0],old=state.equipment[item.type]||null;
   state.equipment[item.type]=item;
   if(old)handleUnequippedItem(old);
   restoreAfterEquipmentChange();
   selectedItem=null;
   save();
   render();
  };
 }

 if(typeof window.equipBestAll==="function"){
  window.equipBestAll=function(){
   let changed=0,soldCount=0,soldGold=0;
   EQUIPMENT_TYPES.forEach(type=>{
    const current=state.equipment[type];let best=current,bestScore=equipmentScore(current);
    state.inventory.filter(it=>it.type===type).forEach(it=>{const sc=equipmentScore(it);if(sc>bestScore){best=it;bestScore=sc}});
    if(best&&best!==current){
     const idx=state.inventory.findIndex(it=>it.id===best.id);
     if(idx>=0){
      state.inventory.splice(idx,1);
      state.equipment[type]=best;
      if(current){const handled=handleUnequippedItem(current);if(handled.sold){soldCount++;soldGold+=handled.sold;}}
      changed++;
     }
    }
   });
   restoreAfterEquipmentChange();selectedItem=null;save();render();
   if(!changed)return alert("目前裝備已是最佳。");
   const soldText=soldCount?`\n換下裝備自動出售 ${soldCount} 件，獲得 ${soldGold.toLocaleString()} 金幣。`:"";
   alert(`已更換 ${changed} 件較強裝備。${soldText}`);
  };
 }

 if(typeof window.equipSettlementDrop==="function"){
  const baseEquipSettlementDrop=window.equipSettlementDrop;
  window.equipSettlementDrop=function(...args){
   const result=baseEquipSettlementDrop(...args);
   restoreAfterEquipmentChange();
   save(false);
   return result;
  };
 }

 if(typeof window.sellSelected==="function"){
  const baseSellSelected=window.sellSelected;
  window.sellSelected=function(){
   const item=state.inventory?.find(x=>x?.id===selectedItem);
   if(item?.locked===true)return alert("這件裝備已鎖定，請先解鎖後再出售。");
   return baseSellSelected();
  };
 }

 window.sellLowerAll=function(){
  const targets=state.inventory.filter(it=>{
   if(it?.locked===true||it.q===5)return false;
   const current=state.equipment[it.type];
   if(!current)return false;
   return equipmentScore(it)<=equipmentScore(current);
  });
  if(!targets.length)return alert("沒有可出售的未鎖定較低裝備。");
  const total=targets.reduce((a,it)=>a+specializationSellValue(it),0);
  if(!confirm(`將出售 ${targets.length} 件未鎖定的較低或同能力裝備，共獲得 ${total.toLocaleString()} 金幣。確定出售嗎？`))return;
  const ids=new Set(targets.map(it=>it.id));
  state.inventory=state.inventory.filter(it=>!ids.has(it.id));
  state.gold+=total;
  selectedItem=null;
  save();
  render();
  alert(`已出售 ${targets.length} 件裝備，獲得 ${total.toLocaleString()} 金幣。`);
 };

 if(typeof window.discardLostGear==="function"){
  const baseDiscardLostGear=window.discardLostGear;
  window.discardLostGear=function(i){
   const lost=state.lostGear?.[i];
   if(lost?.item?.locked===true)return alert("這件遺失裝備仍處於鎖定狀態；請先贖回並解鎖後再放棄。");
   return baseDiscardLostGear(i);
  };
 }

 function injectLockStyles(){
  if(document.getElementById("equipment-lock-styles"))return;
  const style=document.createElement("style");
  style.id="equipment-lock-styles";
  style.textContent=`.gear-lock-mark{display:inline-block;margin-right:2px;font-size:.92em}.equipped-lock-control{margin-top:7px}.equipped-lock-control .btn{padding:6px 10px;font-size:12px}`;
  document.head.appendChild(style);
 }
 function enhanceEquippedLockControls(){
  if(view!=="inventory")return;
  const main=document.getElementById("main");
  const firstCard=main?.querySelector(".grid > .card");
  if(!firstCard)return;
  const rows=Array.from(firstCard.children).filter(el=>el.classList?.contains("item"));
  rows.slice(0,EQUIPMENT_TYPES.length).forEach((row,index)=>{
   if(row.querySelector(".equipped-lock-control"))return;
   const type=EQUIPMENT_TYPES[index],item=state.equipment?.[type];
   if(!item)return;
   const control=document.createElement("div");
   control.className="equipped-lock-control";
   control.innerHTML=`<button class="btn ${item.locked===true?"ok":""}" onclick="toggleEquippedItemLock('${type}')">${item.locked===true?"🔒 已鎖定｜點擊解鎖":"🔓 鎖定裝備"}</button>`;
   row.appendChild(control);
  });
 }

 injectLockStyles();
 normalizeAllGearLocks();
 save(false);
 const main=document.getElementById("main");
 if(main&&typeof MutationObserver!=="undefined")new MutationObserver(()=>setTimeout(enhanceEquippedLockControls,0)).observe(main,{childList:true,subtree:true});
 render();
 setTimeout(enhanceEquippedLockControls,0);
})();
