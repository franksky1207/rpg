(function(){
 const VERSION=6;
 const RNG_PIPELINE_VERSION=1;
 const METADATA_OWNER_VERSION=1;
 const WORLD_SEMANTICS_VERSION=1;
 const LEVEL_SEMANTICS_VERSION=2;
 const FACTORY_WORLD_LEVEL_GUARD_VERSION=1;
 const FALLBACK_TYPES=Object.freeze(["weapon","helmet","armor","shoes","accessory"]);

 function finiteWhole(value,fallback=0){const n=Math.floor(Number(value));return Number.isFinite(n)?n:fallback;}
 function sharedEquipmentTypes(){return typeof EQUIPMENT_TYPES!=="undefined"&&Array.isArray(EQUIPMENT_TYPES)&&EQUIPMENT_TYPES.length?EQUIPMENT_TYPES.slice():FALLBACK_TYPES.slice();}
 function sharedEquipmentTypeLabel(type){return typeof equipmentTypeLabel==="function"?equipmentTypeLabel(type):String(type||"裝備");}
 function sharedEquipmentWorld(value){
  const raw=value&&typeof value==="object"?value.world:value,n=Math.floor(Number(raw));
  return n===3?3:n===2?2:1;
 }
 function sharedEquipmentWorldLabel(value){
  const world=sharedEquipmentWorld(value),meta=typeof window.worldPhaseMeta==="function"?window.worldPhaseMeta(world):null;
  return meta?.name?String(meta.name):world===3?"高維紀元":world===2?"宇宙紀元":"銀河紀元";
 }
 function sharedEquipmentLevelCap(value){
  const world=sharedEquipmentWorld(value);
  if(world===3)return Math.max(1,finiteWhole(window.THIRD_WORLD_LEVEL_CAP,2000));
  if(world===2)return Math.max(1,finiteWhole(window.SECOND_WORLD_LEVEL_CAP,1000));
  return Math.max(1,finiteWhole(window.FIRST_WORLD_LEVEL_CAP,500));
 }
 function sharedNormalizeEquipmentLevelForWorld(value,rawLevel=null){
  const source=rawLevel==null&&value&&typeof value==="object"?value.level:rawLevel;
  const cap=sharedEquipmentLevelCap(value);
  return Math.max(1,Math.min(cap,finiteWhole(source,1)));
 }
 function withRng(rng,fn){
  const random=typeof rng==="function"?rng:Math.random;
  if(random===Math.random)return fn();
  const original=Math.random;
  Math.random=random;
  try{return fn();}finally{Math.random=original;}
 }
 function deterministicId(options,rng,type,level,q){
  if(options.id!=null&&String(options.id))return String(options.id);
  const world=sharedEquipmentWorld(options.world),ordinal=Math.max(0,finiteWhole(options.sourceOrdinal,0));
  const a=(Math.floor(Math.max(0,Math.min(.999999999999,Number(rng())||0))*0x100000000)>>>0).toString(36);
  const b=(Math.floor(Math.max(0,Math.min(.999999999999,Number(rng())||0))*0x100000000)>>>0).toString(36);
  return `reward-${world}-${level}-${q}-${type}-${ordinal}-${a}${b}`;
 }
 function makeEquipmentRewardItem(options={}){
  if(typeof QUALITY==="undefined"||typeof mainStatForType!=="function"||typeof mainStatValue!=="function"||typeof rollAffixes!=="function"||typeof addItemStat!=="function")return null;
  const types=sharedEquipmentTypes(),rng=typeof options.rng==="function"?options.rng:Math.random;
  const forcedType=types.includes(options.type)?options.type:(types.includes(options.forcedType)?options.forcedType:null);
  const type=forcedType||types[Math.max(0,Math.min(types.length-1,Math.floor(rng()*types.length)))]||types[0];
  const world=sharedEquipmentWorld(options.world);
  const level=sharedNormalizeEquipmentLevelForWorld(world,options.level);
  const q=Math.max(0,Math.min(5,finiteWhole(options.q,0)));
  const quality=QUALITY[q];
  if(!quality)return null;
  const name=String(options.name||`${String(options.namePrefix||"裝備")}・${sharedEquipmentTypeLabel(type)}`);
  const mainStat=mainStatForType(type),mainValue=withRng(rng,()=>mainStatValue(type,level,quality.m,q)),affixes=withRng(rng,()=>rollAffixes(type,level,q,quality.m));
  const item={
   id:deterministicId({...options,world},rng,type,level,q),
   name,level,q,type,world,
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
  const errors=[],types=sharedEquipmentTypes();
  if(types.length!==5||!types.includes("weapon")||sharedEquipmentTypeLabel("weapon")!==equipmentTypeLabel("weapon"))errors.push({code:"SHARED_METADATA_OWNER",types,label:sharedEquipmentTypeLabel("weapon")});
  if(sharedEquipmentWorld(1)!==1||sharedEquipmentWorld({world:2})!==2||sharedEquipmentWorld({world:3})!==3||sharedEquipmentWorld(99)!==1)errors.push({code:"SHARED_WORLD_SEMANTICS"});
  if(sharedEquipmentWorldLabel(1)!=="銀河紀元"||sharedEquipmentWorldLabel(2)!=="宇宙紀元"||sharedEquipmentWorldLabel(3)!=="高維紀元")errors.push({code:"SHARED_WORLD_LABELS"});
  if(sharedEquipmentLevelCap(1)!==500||sharedEquipmentLevelCap(2)!==1000||sharedEquipmentLevelCap(3)!==2000)errors.push({code:"SHARED_LEVEL_CAPS",w1:sharedEquipmentLevelCap(1),w2:sharedEquipmentLevelCap(2),w3:sharedEquipmentLevelCap(3)});
  if(sharedNormalizeEquipmentLevelForWorld({world:1,level:900})!==500||sharedNormalizeEquipmentLevelForWorld({world:2,level:1400})!==1000||sharedNormalizeEquipmentLevelForWorld({world:3,level:2000})!==2000||sharedNormalizeEquipmentLevelForWorld({world:3,level:1350})!==1350)errors.push({code:"SHARED_LEVEL_NORMALIZATION"});
  const cappedW1=makeEquipmentRewardItem({world:1,level:2000,q:5,type:"weapon",name:"W1 cap",rng:sequenceRng([.2,.7,.1,.8,.3,.6])});
  const cappedW2=makeEquipmentRewardItem({world:2,level:2000,q:5,type:"weapon",name:"W2 cap",rng:sequenceRng([.2,.7,.1,.8,.3,.6])});
  const cappedW3=makeEquipmentRewardItem({world:3,level:2000,q:5,type:"weapon",name:"W3 cap",rng:sequenceRng([.2,.7,.1,.8,.3,.6])});
  if(cappedW1?.level!==500||cappedW2?.level!==1000||cappedW3?.level!==2000)errors.push({code:"FACTORY_WORLD_LEVEL_GUARD",w1:cappedW1?.level,w2:cappedW2?.level,w3:cappedW3?.level});
  const item=makeEquipmentRewardItem({world:3,level:1000,q:4,type:"weapon",name:"共用裝備測試",sourceBossIndex:0,sourceBossId:"probe",rng:sequenceRng([.2,.7,.1,.8,.3,.6])});
  if(!item||item.world!==3||item.level!==1000||item.q!==4||item.type!=="weapon"||item.sourceBossIndex!==0||item.sourceBossId!=="probe"||!item.mainStat||!Array.isArray(item.affixes))errors.push({code:"SHARED_FACTORY",item});
  const seededOptions={world:3,level:1350,q:5,type:"accessory",name:"確定性測試",sourceBossIndex:2,sourceBossId:"probe-2",sourceOrdinal:1,sell:0,buy:0};
  const first=makeEquipmentRewardItem({...seededOptions,rng:sequenceRng([.11,.22,.33,.44,.55,.66,.77,.88,.99])});
  const second=makeEquipmentRewardItem({...seededOptions,rng:sequenceRng([.11,.22,.33,.44,.55,.66,.77,.88,.99])});
  if(JSON.stringify(first)!==JSON.stringify(second))errors.push({code:"SEEDED_REWARD_NOT_DETERMINISTIC",first,second});
  return Object.freeze({version:VERSION,rngPipelineVersion:RNG_PIPELINE_VERSION,metadataOwnerVersion:METADATA_OWNER_VERSION,worldSemanticsVersion:WORLD_SEMANTICS_VERSION,levelSemanticsVersion:LEVEL_SEMANTICS_VERSION,factoryWorldLevelGuardVersion:FACTORY_WORLD_LEVEL_GUARD_VERSION,passed:errors.length===0,errors:Object.freeze(errors.slice())});
 }

 window.SHARED_EQUIPMENT_REWARD_FACTORY_VERSION=VERSION;
 window.SHARED_EQUIPMENT_RNG_PIPELINE_VERSION=RNG_PIPELINE_VERSION;
 window.SHARED_EQUIPMENT_METADATA_OWNER_VERSION=METADATA_OWNER_VERSION;
 window.SHARED_EQUIPMENT_WORLD_SEMANTICS_VERSION=WORLD_SEMANTICS_VERSION;
 window.SHARED_EQUIPMENT_LEVEL_SEMANTICS_VERSION=LEVEL_SEMANTICS_VERSION;
 window.SHARED_EQUIPMENT_FACTORY_WORLD_LEVEL_GUARD_VERSION=FACTORY_WORLD_LEVEL_GUARD_VERSION;
 window.sharedEquipmentTypes=sharedEquipmentTypes;
 window.sharedEquipmentTypeLabel=sharedEquipmentTypeLabel;
 window.sharedEquipmentWorld=sharedEquipmentWorld;
 window.sharedEquipmentWorldLabel=sharedEquipmentWorldLabel;
 window.sharedEquipmentLevelCap=sharedEquipmentLevelCap;
 window.sharedNormalizeEquipmentLevelForWorld=sharedNormalizeEquipmentLevelForWorld;
 window.makeEquipmentRewardItem=makeEquipmentRewardItem;
 window.EQUIPMENT_REWARD_CORE_INTEGRITY=validate();
 if(!window.EQUIPMENT_REWARD_CORE_INTEGRITY.passed)console.error("[文明戰線] Shared equipment reward core integrity error",window.EQUIPMENT_REWARD_CORE_INTEGRITY.errors);
})();
