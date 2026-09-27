(function(){
 const VERSION=1;

 function finiteWhole(value,fallback=0){const n=Math.floor(Number(value));return Number.isFinite(n)?n:fallback;}
 function equipmentTypes(){return typeof EQUIPMENT_TYPES!=="undefined"&&Array.isArray(EQUIPMENT_TYPES)&&EQUIPMENT_TYPES.length?EQUIPMENT_TYPES.slice():["weapon","helmet","armor","shoes","accessory"];}
 function typeLabel(type){return typeof equipmentTypeLabel==="function"?equipmentTypeLabel(type):String(type||"裝備");}
 function makeEquipmentRewardItem(options={}){
  if(typeof QUALITY==="undefined"||typeof mainStatForType!=="function"||typeof mainStatValue!=="function"||typeof rollAffixes!=="function"||typeof addItemStat!=="function")return null;
  const types=equipmentTypes(),rng=typeof options.rng==="function"?options.rng:Math.random;
  const forcedType=types.includes(options.type)?options.type:(types.includes(options.forcedType)?options.forcedType:null);
  const type=forcedType||types[Math.max(0,Math.min(types.length-1,Math.floor(rng()*types.length)))]||types[0];
  const maxLevel=Math.max(1,finiteWhole(window.ABSOLUTE_MAX_LEVEL,2000));
  const level=Math.max(1,Math.min(maxLevel,finiteWhole(options.level,1)));
  const q=Math.max(0,Math.min(5,finiteWhole(options.q,0)));
  const quality=QUALITY[q];
  if(!quality)return null;
  const name=String(options.name||`${String(options.namePrefix||"裝備")}・${typeLabel(type)}`);
  const mainStat=mainStatForType(type),mainValue=mainStatValue(type,level,quality.m,q),affixes=rollAffixes(type,level,q,quality.m);
  const item={
   id:Date.now().toString(36)+Math.random().toString(36).slice(2),
   name,level,q,type,world:Math.max(1,finiteWhole(options.world,1)),
   mainStat:{stat:mainStat,value:mainValue},affixes,
   sell:Math.max(0,finiteWhole(options.sell,0)),buy:Math.max(0,finiteWhole(options.buy,0))
  };
  if(Number.isInteger(options.sourceBossIndex))item.sourceBossIndex=options.sourceBossIndex;
  if(options.sourceBossId!=null)item.sourceBossId=String(options.sourceBossId);
  if(options.sourceTag!=null)item.sourceTag=String(options.sourceTag);
  addItemStat(item,mainStat,mainValue);
  affixes.forEach(a=>addItemStat(item,a.stat,a.value));
  return item;
 }
 function validate(){
  const errors=[];
  const item=makeEquipmentRewardItem({world:3,level:1000,q:4,type:"weapon",name:"共用裝備測試",sourceBossIndex:0,sourceBossId:"probe"});
  if(!item||item.world!==3||item.level!==1000||item.q!==4||item.type!=="weapon"||item.sourceBossIndex!==0||item.sourceBossId!=="probe"||!item.mainStat||!Array.isArray(item.affixes))errors.push({code:"SHARED_FACTORY",item});
  return Object.freeze({version:VERSION,passed:errors.length===0,errors:Object.freeze(errors.slice())});
 }

 window.SHARED_EQUIPMENT_REWARD_FACTORY_VERSION=VERSION;
 window.makeEquipmentRewardItem=makeEquipmentRewardItem;
 window.EQUIPMENT_REWARD_CORE_INTEGRITY=validate();
 if(!window.EQUIPMENT_REWARD_CORE_INTEGRITY.passed)console.error("[文明戰線] Shared equipment reward core integrity error",window.EQUIPMENT_REWARD_CORE_INTEGRITY.errors);
})();
