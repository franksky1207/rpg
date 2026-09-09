(function(){
 window.gearActualDelta=function(item){
  if(!item||!EQUIPMENT_TYPES.includes(item.type))return 0;
  const current=state.equipment[item.type];
  return round1(equipmentScore(item)-equipmentScore(current));
 };

 window.isActualGearUpgrade=function(item){
  return gearActualDelta(item)>0;
 };

 window.actualEquipmentContribution=function(type){
  if(!EQUIPMENT_TYPES.includes(type))return 0;
  return equipmentScore(state.equipment[type]);
 };

 addItem=function(it){
  if(!it)return {kept:false,sold:0};
  const upgrade=isActualGearUpgrade(it);
  if(it.q===5||(state.settings.keepUpgrade&&upgrade)){
   state.inventory.push(it);
   if(upgrade)upgradeDropNoticePending=true;
   return {kept:true,sold:0};
  }
  if(it.q<=4&&state.settings.autoSell[it.q]){
   state.gold+=it.sell;
   return {kept:false,sold:it.sell};
  }
  state.inventory.push(it);
  if(upgrade)upgradeDropNoticePending=true;
  return {kept:true,sold:0};
 };

 equipBestAll=function(){
  let changed=0;
  EQUIPMENT_TYPES.forEach(type=>{
   const current=state.equipment[type];
   let best=current,bestScore=equipmentScore(current);
   state.inventory.filter(it=>it.type===type).forEach(it=>{
    const score=equipmentScore(it);
    if(score>bestScore){best=it;bestScore=score;}
   });
   if(best&&best!==current){
    const idx=state.inventory.findIndex(it=>it.id===best.id);
    if(idx>=0){
     state.inventory.splice(idx,1);
     if(current)state.inventory.push(current);
     state.equipment[type]=best;
     changed++;
    }
   }
  });
  normalizeHP();
  selectedItem=null;
  save();
  render();
  alert(changed?`已更換 ${changed} 件較高評分裝備。`:"目前裝備已是最高評分。");
 };

 sellLowerAll=function(){
  const targets=state.inventory.filter(it=>{
   if(it.q===5)return false;
   const current=state.equipment[it.type];
   if(!current)return false;
   return equipmentScore(it)<=equipmentScore(current);
  });
  if(!targets.length)return alert("沒有可出售的較低或同評分裝備。");
  const total=targets.reduce((a,it)=>a+(it.sell||0),0);
  if(!confirm(`將出售 ${targets.length} 件較低或同評分裝備，共獲得 ${total.toLocaleString()} 金幣。確定出售嗎？`))return;
  const ids=new Set(targets.map(it=>it.id));
  state.inventory=state.inventory.filter(it=>!ids.has(it.id));
  state.gold+=total;
  selectedItem=null;
  save();
  render();
  alert(`已出售 ${targets.length} 件裝備，獲得 ${total.toLocaleString()} 金幣。`);
 };

 weakestEquipmentTypes=function(){
  return EQUIPMENT_TYPES
   .map(type=>({type,value:equipmentScore(state.equipment[type]),tie:Math.random()}))
   .sort((a,b)=>a.value-b.value||a.tie-b.tie)
   .map(x=>x.type);
 };
})();
