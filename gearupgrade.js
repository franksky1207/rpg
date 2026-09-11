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

 window.weakestEquipmentTypes=function(){
  return EQUIPMENT_TYPES
   .map(type=>({type,value:equipmentScore(state.equipment[type]),tie:Math.random()}))
   .sort((a,b)=>a.value-b.value||a.tie-b.tie)
   .map(x=>x.type);
 };
})();
