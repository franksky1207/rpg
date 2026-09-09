(function(){
 equipmentScore=function(it){
  if(!it)return -1;
  const level=Math.max(1,Math.floor(Number(it.level)||1));
  const rateWeight=20+0.5*level;
  return round1(
   (it.atk||0)*5+
   (it.def||0)*5+
   (it.hp||0)+
   (it.crit||0)*rateWeight+
   (it.dodge||0)*rateWeight
  );
 };
 window.equipmentScore=equipmentScore;
})();
