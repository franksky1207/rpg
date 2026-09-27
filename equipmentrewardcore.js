(function(){
 const VERSION=2;
 const RNG_PIPELINE_VERSION=1;

 function finiteWhole(value,fallback=0){const n=Math.floor(Number(value));return Number.isFinite(n)?n:fallback;}
 function equipmentTypes(){return typeof EQUIPMENT_TYPES!=="undefined"&&Array.isArray(EQUIPMENT_TYPES)&&EQUIPMENT_TYPES.length?EQUIPMENT_TYPES.slice():["weapon","helmet","armor","shoes","accessory"];}
 function typeLabel(type){return typeof equipmentTypeLabel==="function"?equipmentTypeLabel(type):String(type||"裝備");}
 function withRng(rng,fn){
  const random=typeof rng==="function"?rng:Math.random;
  if(random===Math.random)return fn();
  const original=Math.random;
  Math.random=random;
  try{return fn();}finally{Math.random=original;}
 }
 function deterministicId(options,rng,type,level,q){
  if(options.id!=null&&String(options.id))return String(options.id);
  const world=Math.max(1,finiteWhole(options.world,1)),ordinal=Math.max(0,finiteWhole(options.sourceOrdinal,0));
  const a=(Math.floor(Math.max(0,Math.min(.999999999999,Number(rng())||0))*0x100000000)>>>0).toString(36);
  const b=(Math.floor(Math.max(0,Math.min(.999999999999,Number(rng())||0))*0x100000000)>>>0).toString(36);
  return `reward-${world}-${level}-${q}-${type}-${ordinal}-${a}${b}`;
 }
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
  const mainStat=mainStatForType(type),mainValue=withRng(rng,()=>mainStatValue(type,level,quality.m,q)),affixes=withRng(rng,()=>rollAffixes(type,level,q,quality.m));
  const item={
   id:deterministicId(options,rng,type,level,q),
   name,level,q,type,world:Math.max(1,finiteWhole(options.world,1)),
   mainStat:{stat:mainStat,value:mainValue},affixes,
   sell:Math.max(0,finiteWhole(options.sell,0)),buy:Math.max(0,finiteWhole(options.buy,0))
  };
  if(Number.isInteger(options.sourceBossIndex))item.sourceBossIndex=options.sourceBossIndex;
  if(options.sourceBossId!=null)item.sourceBossId=String(options.sourceBossId);
  if(options.sourceTag!=null)item.sourceTag=String(options.sourceTag);
  if(options.sourceOrdinal!=null)item.sourceOrdinal=Math.max(0,finiteWhole(options.sourceOrdinal,0));
  addItemStat(item,mainStat,mainValue);
  affixes.forEach(a=>addItemStat(item,a.stat,a.value));
  return item;
 }
 function sequenceRng(values){let index=0;const rows=Array.isArray(values)&&values.length?values:[.5];return()=>rows[index++%rows.length];}
 function validate(){
  const errors=[];
  const item=makeEquipmentRewardItem({world:3,level:1000,q:4,type:"weapon",name:"共用裝備測試",sourceBossIndex:0,sourceBossId:"probe",rng:sequenceRng([.2,.7,.1,.8,.3,.6])});
  if(!item||item.world!==3||item.level!==1000||item.q!==4||item.type!=="weapon"||item.sourceBossIndex!==0||item.sourceBossId!=="probe"||!item.mainStat||!Array.isArray(item.affixes))errors.push({code:"SHARED_FACTORY",item});
  const seededOptions={world:3,level:1350,q:5,type:"accessory",name:"確定性測試",sourceBossIndex:2,sourceBossId:"probe-2",sourceOrdinal:1,sell:0,buy:0};
  const first=makeEquipmentRewardItem({...seededOptions,rng:sequenceRng([.11,.22,.33,.44,.55,.66,.77,.88,.99])});
  const second=makeEquipmentRewardItem({...seededOptions,rng:sequenceRng([.11,.22,.33,.44,.55,.66,.77,.88,.99])});
  if(JSON.stringify(first)!==JSON.stringify(second))errors.push({code:"SEEDED_REWARD_NOT_DETERMINISTIC",first,second});
  return Object.freeze({version:VERSION,rngPipelineVersion:RNG_PIPELINE_VERSION,passed:errors.length===0,errors:Object.freeze(errors.slice())});
 }

 window.SHARED_EQUIPMENT_REWARD_FACTORY_VERSION=VERSION;
 window.SHARED_EQUIPMENT_RNG_PIPELINE_VERSION=RNG_PIPELINE_VERSION;
 window.makeEquipmentRewardItem=makeEquipmentRewardItem;
 window.EQUIPMENT_REWARD_CORE_INTEGRITY=validate();
 if(!window.EQUIPMENT_REWARD_CORE_INTEGRITY.passed)console.error("[文明戰線] Shared equipment reward core integrity error",window.EQUIPMENT_REWARD_CORE_INTEGRITY.errors);
})();
