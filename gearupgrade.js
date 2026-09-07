(function(){
 function projectedStats(type,replacement){
  const s={hp:baseHP(state.level),atk:baseATK(state.level),def:baseDEF(state.level),crit:0,dodge:0};
  EQUIPMENT_TYPES.forEach(t=>{
   const it=t===type?replacement:state.equipment[t];
   if(!it)return;
   s.hp+=it.hp||0;
   s.atk+=it.atk||0;
   s.def+=it.def||0;
   s.crit+=it.crit||0;
   s.dodge+=it.dodge||0;
  });
  s.crit=round1(Math.min(MAX_CRIT_RATE,s.crit));
  s.dodge=round1(Math.min(MAX_DODGE_RATE,s.dodge));
  return s;
 }

 function combatValue(stats){
  return round1((stats.atk||0)*5+(stats.def||0)*5+(stats.hp||0)+(stats.crit||0)*12+(stats.dodge||0)*12);
 }

 window.gearActualDelta=function(item){
  if(!item||!EQUIPMENT_TYPES.includes(item.type))return 0;
  const current=equippedStats();
  const next=projectedStats(item.type,item);
  return round1(combatValue(next)-combatValue(current));
 };

 window.isActualGearUpgrade=function(item){
  return gearActualDelta(item)>0;
 };

 window.actualEquipmentContribution=function(type){
  if(!EQUIPMENT_TYPES.includes(type))return 0;
  const current=equippedStats();
  const without=projectedStats(type,null);
  return round1(combatValue(current)-combatValue(without));
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
   let best=current;
   let bestValue=combatValue(projectedStats(type,current));
   state.inventory.filter(it=>it.type===type).forEach(it=>{
    const value=combatValue(projectedStats(type,it));
    if(value>bestValue){best=it;bestValue=value;}
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
  alert(changed?`已更換 ${changed} 件實際較強裝備。`:"目前裝備已是實際最佳。");
 };

 sellLowerAll=function(){
  const targets=state.inventory.filter(it=>{
   if(it.q===5)return false;
   const current=state.equipment[it.type];
   if(!current)return false;
   return gearActualDelta(it)<=0;
  });
  if(!targets.length)return alert("沒有可出售的實際較低裝備。");
  const total=targets.reduce((a,it)=>a+(it.sell||0),0);
  if(!confirm(`將出售 ${targets.length} 件實際較低或無提升裝備，共獲得 ${total.toLocaleString()} 金幣。確定出售嗎？`))return;
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
   .map(type=>({type,value:actualEquipmentContribution(type),tie:Math.random()}))
   .sort((a,b)=>a.value-b.value||a.tie-b.tie)
   .map(x=>x.type);
 };
})();
