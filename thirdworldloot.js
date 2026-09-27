(function(){
 const VERSION=1;
 const QUALITY_POLICY_VERSION=1;
 const BASE_LEGENDARY_CHANCE=.95;
 const BASE_MYTHIC_CHANCE=.05;

 function currentState(){try{return typeof state!=="undefined"&&state&&typeof state==="object"?state:null;}catch(_){return null;}}
 function finiteWhole(value,fallback=0){const n=Math.floor(Number(value));return Number.isFinite(n)?n:fallback;}
 function rngFn(value){return typeof value==="function"?value:Math.random;}
 function equipmentTypes(){return typeof EQUIPMENT_TYPES!=="undefined"&&Array.isArray(EQUIPMENT_TYPES)&&EQUIPMENT_TYPES.length?EQUIPMENT_TYPES.slice():["weapon","helmet","armor","shoes","accessory"];}
 function typeLabel(type){return typeof equipmentTypeLabel==="function"?equipmentTypeLabel(type):String(type||"裝備");}
 function targetState(value=null){return value&&typeof value==="object"?value:currentState();}
 function playerEquipmentLevel(target=null){
  const s=targetState(target),cap=Math.max(1,finiteWhole(window.ABSOLUTE_MAX_LEVEL,2000));
  return Math.max(1,Math.min(cap,finiteWhole(s?.level,1000)));
 }
 function thirdWorldEquipmentBaseQualityRoll(rng=Math.random){return rngFn(rng)()<BASE_LEGENDARY_CHANCE?4:5;}
 function makeThirdWorldEquipmentForBoss(value,options={}){
  const boss=typeof window.thirdWorldBoss==="function"?window.thirdWorldBoss(value):null;
  if(!boss||typeof window.makeEquipmentRewardItem!=="function")return null;
  const rng=rngFn(options.rng),types=equipmentTypes(),forcedType=types.includes(options.forcedType)?options.forcedType:null;
  const type=forcedType||types[Math.max(0,Math.min(types.length-1,Math.floor(rng()*types.length)))]||types[0];
  const q=Number.isInteger(options.forcedQ)?Math.max(4,Math.min(5,options.forcedQ)):thirdWorldEquipmentBaseQualityRoll(rng);
  const level=Math.max(1,Math.min(Math.max(1,finiteWhole(window.ABSOLUTE_MAX_LEVEL,2000)),finiteWhole(options.level,playerEquipmentLevel(options.state))));
  const name=String(options.name||`${boss.name}・${typeLabel(type)}`);
  return window.makeEquipmentRewardItem({world:3,level,q,type,name,sourceBossIndex:boss.index,sourceBossId:boss.id,sourceTag:"third-world-boss",sell:0,buy:0,rng});
 }
 function makeDrop(value,options={}){
  if(typeof window.resolveVipLootModifiers!=="function")return null;
  const rng=rngFn(options.rng),s=targetState(options.state),baseQuality=thirdWorldEquipmentBaseQualityRoll(rng);
  const loot=window.resolveVipLootModifiers(baseQuality,{boss:true,maxQuality:5,rng,vipLevel:options.vipLevel,state:s,weakTypesResolver:options.weakTypesResolver});
  const item=makeThirdWorldEquipmentForBoss(value,{state:s,level:options.level,forcedQ:loot.quality,forcedType:loot.forcedType,rng});
  return item?{item,baseQuality,qualityResult:loot.qualityResult,forcedType:loot.forcedType}:null;
 }
 function makeThirdWorldBossEquipmentDrops(value,options={}){
  const boss=typeof window.thirdWorldBoss==="function"?window.thirdWorldBoss(value):null;
  if(!boss||typeof window.vipLootBossExtraDropTriggered!=="function")return Object.freeze([]);
  const rng=rngFn(options.rng),s=targetState(options.state),level=Math.max(1,finiteWhole(options.level,playerEquipmentLevel(s)));
  const first=makeDrop(boss.index,{...options,state:s,level,rng});
  const drops=first?[{...first,vip16Extra:false}]:[];
  if(window.vipLootBossExtraDropTriggered({boss:true,rng,vipLevel:options.vipLevel})){
   const extra=makeDrop(boss.index,{...options,state:s,level,rng});
   if(extra)drops.push({...extra,vip16Extra:true});
  }
  return Object.freeze(drops.map(row=>Object.freeze(row)));
 }
 function validate(){
  const errors=[];
  if(thirdWorldEquipmentBaseQualityRoll(()=>.949999)!==4||thirdWorldEquipmentBaseQualityRoll(()=>.95)!==5)errors.push({code:"BASE_QUALITY_95_5"});
  if(typeof window.makeEquipmentRewardItem!=="function"||window.EQUIPMENT_REWARD_CORE_INTEGRITY?.passed!==true)errors.push({code:"SHARED_EQUIPMENT_FACTORY"});
  if(typeof window.resolveVipLootModifiers!=="function"||typeof window.vipLootBossExtraDropTriggered!=="function")errors.push({code:"VIP_LOOT_OWNER"});
  const probeState={level:1350,vipLevel:0,equipment:{},secondWorld:{entered:true},thirdWorld:{entered:true}};
  const legendary=makeThirdWorldEquipmentForBoss(0,{state:probeState,level:1350,forcedQ:4,forcedType:"weapon",rng:()=>.5});
  const mythic=makeThirdWorldEquipmentForBoss(0,{state:probeState,level:1350,forcedQ:5,forcedType:"armor",rng:()=>.5});
  if(!legendary||legendary.world!==3||legendary.level!==1350||legendary.q!==4||legendary.type!=="weapon"||legendary.sell!==0||legendary.buy!==0)errors.push({code:"LEGENDARY_ITEM_POLICY",item:legendary});
  if(!mythic||mythic.world!==3||mythic.level!==1350||mythic.q!==5||mythic.type!=="armor"||mythic.sell!==0||mythic.buy!==0)errors.push({code:"MYTHIC_ITEM_POLICY",item:mythic});
  const baseDrops=makeThirdWorldBossEquipmentDrops(0,{state:probeState,level:1350,vipLevel:0,rng:()=>.5,weakTypesResolver:()=>["weapon"]});
  if(baseDrops.length!==1||baseDrops[0]?.vip16Extra!==false||baseDrops[0]?.item?.world!==3||baseDrops[0]?.item?.level!==1350||![4,5].includes(baseDrops[0]?.item?.q))errors.push({code:"FORMAL_BASE_DROP",drops:baseDrops});
  const vipDrops=makeThirdWorldBossEquipmentDrops(0,{state:{...probeState,vipLevel:16},level:1350,vipLevel:16,rng:()=>0,weakTypesResolver:()=>["weapon"]});
  if(vipDrops.length!==2||vipDrops[1]?.vip16Extra!==true||vipDrops.some(row=>row.item?.q!==5||row.item?.world!==3))errors.push({code:"VIP_EXISTING_PRIVILEGES",drops:vipDrops});
  return Object.freeze({version:VERSION,passed:errors.length===0,errors:Object.freeze(errors.slice())});
 }

 window.THIRD_WORLD_EQUIPMENT_REWARD_VERSION=VERSION;
 window.THIRD_WORLD_EQUIPMENT_QUALITY_POLICY_VERSION=QUALITY_POLICY_VERSION;
 window.THIRD_WORLD_EQUIPMENT_BASE_POLICY=Object.freeze({legendaryChance:BASE_LEGENDARY_CHANCE,mythicChance:BASE_MYTHIC_CHANCE,baseDropCount:1,levelSource:"player-current",saleResource:"none",vipLootPrivileges:true});
 window.thirdWorldEquipmentBaseQualityRoll=thirdWorldEquipmentBaseQualityRoll;
 window.makeThirdWorldEquipmentForBoss=makeThirdWorldEquipmentForBoss;
 window.makeThirdWorldBossEquipmentDrops=makeThirdWorldBossEquipmentDrops;
 window.THIRD_WORLD_EQUIPMENT_REWARD_INTEGRITY=validate();
 if(!window.THIRD_WORLD_EQUIPMENT_REWARD_INTEGRITY.passed)console.error("[文明戰線] Third-world equipment reward integrity error",window.THIRD_WORLD_EQUIPMENT_REWARD_INTEGRITY.errors);
})();
