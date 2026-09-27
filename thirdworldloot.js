(function(){
 const VERSION=3;
 const QUALITY_POLICY_VERSION=1;
 const DETERMINISTIC_VERSION=1;
 const METADATA_OWNER_VERSION=1;
 const NAME_POOL_VERSION=1;
 const GENERIC_FACTORY_VERSION=1;
 const ENHANCEMENT_CAP_POLICY_VERSION=1;
 const BASE_LEGENDARY_CHANCE=.95;
 const BASE_MYTHIC_CHANCE=.05;
 const NAME_ROWS=Object.freeze([
  Object.freeze({band:1,theme:"異象初覺",weapon:"裂隙殘鋒",helmet:"偏光視域",armor:"錯影披層",shoes:"回聲殘步",accessory:"異痕餘響"}),
  Object.freeze({band:2,theme:"界外觸痕",weapon:"越界初裁",helmet:"界外感門",armor:"界膜包絡",shoes:"彼端越跡",accessory:"外側界標"}),
  Object.freeze({band:3,theme:"重影視界",weapon:"疊相複芒",helmet:"重映觀窗",armor:"錯位疊幕",shoes:"迴映雙途",accessory:"雙視折點"}),
  Object.freeze({band:4,theme:"表象穿透",weapon:"透界斷痕",helmet:"深視知膜",armor:"內層脈絡",shoes:"穿層透徑",accessory:"裏相鑰式"}),
  Object.freeze({band:5,theme:"尺度失序",weapon:"折距逆芒",helmet:"離軸思框",armor:"失序外相",shoes:"偏序離軸",accessory:"失衡座標"}),
  Object.freeze({band:6,theme:"認知重構",weapon:"再編斷式",helmet:"重構識場",armor:"思界織域",shoes:"解限移式",accessory:"覺構母式"}),
  Object.freeze({band:7,theme:"界律超越",weapon:"破序律裁",helmet:"凌界法眼",armor:"越律束界",shoes:"越則逾線",accessory:"界律公理"}),
  Object.freeze({band:8,theme:"高位俯視",weapon:"俯界截線",helmet:"上視天衡",armor:"投影覆軀",shoes:"映界俯行",accessory:"截面映源"}),
  Object.freeze({band:9,theme:"萬象同觀",weapon:"諸相共斷",helmet:"萬象共覺",armor:"眾相並身",shoes:"全映並途",accessory:"同觀匯點"}),
  Object.freeze({band:10,theme:"超越觀測",weapon:"無相原裁",helmet:"至界無觀",armor:"彼岸真軀",shoes:"超觀無步",accessory:"唯一原式"})
 ]);

 function currentState(){try{return typeof state!=="undefined"&&state&&typeof state==="object"?state:null;}catch(_){return null;}}
 function finiteWhole(value,fallback=0){const n=Math.floor(Number(value));return Number.isFinite(n)?n:fallback;}
 function rngFn(value){return typeof value==="function"?value:Math.random;}
 function equipmentTypes(){return typeof window.sharedEquipmentTypes==="function"?window.sharedEquipmentTypes():[];}
 function targetState(value=null){return value&&typeof value==="object"?value:currentState();}
 function playerEquipmentLevel(target=null){
  const s=targetState(target),cap=Math.max(1,finiteWhole(window.ABSOLUTE_MAX_LEVEL,2000));
  return Math.max(1,Math.min(cap,finiteWhole(s?.level,1000)));
 }
 function nameBand(target=null){return typeof window.thirdWorldEquipmentNameBand==="function"?window.thirdWorldEquipmentNameBand(targetState(target)):1;}
 function namesForBand(value){const band=Math.max(1,Math.min(10,finiteWhole(value,1)));return NAME_ROWS[band-1]||NAME_ROWS[0];}
 function equipmentName(type,target=null,bandOverride=null){
  const band=bandOverride==null?nameBand(target):Math.max(1,Math.min(10,finiteWhole(bandOverride,1)));
  const row=namesForBand(band);
  return String(row?.[type]||row?.accessory||"高維遺物");
 }
 function thirdWorldEquipmentBaseQualityRoll(rng=Math.random){return rngFn(rng)()<BASE_LEGENDARY_CHANCE?4:5;}
 function makeThirdWorldEquipment(options={}){
  if(typeof window.makeEquipmentRewardItem!=="function")return null;
  const rng=rngFn(options.rng),types=equipmentTypes(),s=targetState(options.state);
  if(!types.length)return null;
  const forcedType=types.includes(options.forcedType)?options.forcedType:null;
  const type=forcedType||types[Math.max(0,Math.min(types.length-1,Math.floor(rng()*types.length)))]||types[0];
  const q=Number.isInteger(options.forcedQ)?Math.max(4,Math.min(5,options.forcedQ)):thirdWorldEquipmentBaseQualityRoll(rng);
  const level=Math.max(1,Math.min(Math.max(1,finiteWhole(window.ABSOLUTE_MAX_LEVEL,2000)),finiteWhole(options.level,playerEquipmentLevel(s))));
  const band=options.nameBand==null?nameBand(s):Math.max(1,Math.min(10,finiteWhole(options.nameBand,1)));
  const name=String(options.name||equipmentName(type,s,band));
  const rewardOptions={world:3,level,q,type,name,sourceTag:String(options.sourceTag||"third-world"),sourceOrdinal:Math.max(0,finiteWhole(options.sourceOrdinal,0)),sell:0,buy:0,rng};
  if(Number.isInteger(options.sourceBossIndex))rewardOptions.sourceBossIndex=options.sourceBossIndex;
  if(options.sourceBossId!=null)rewardOptions.sourceBossId=String(options.sourceBossId);
  return window.makeEquipmentRewardItem(rewardOptions);
 }
 function makeThirdWorldEquipmentForBoss(value,options={}){
  const boss=typeof window.thirdWorldBoss==="function"?window.thirdWorldBoss(value):null;
  if(!boss)return null;
  return makeThirdWorldEquipment({...options,sourceBossIndex:boss.index,sourceBossId:boss.id,sourceTag:"third-world-boss"});
 }
 function makeDrop(options={}){
  if(typeof window.resolveVipLootModifiers!=="function")return null;
  const rng=rngFn(options.rng),s=targetState(options.state),baseQuality=thirdWorldEquipmentBaseQualityRoll(rng);
  const loot=window.resolveVipLootModifiers(baseQuality,{boss:true,maxQuality:5,rng,vipLevel:options.vipLevel,state:s,weakTypesResolver:options.weakTypesResolver});
  const item=makeThirdWorldEquipment({...options,state:s,forcedQ:loot.quality,forcedType:loot.forcedType,rng});
  return item?{item,baseQuality,qualityResult:loot.qualityResult,forcedType:loot.forcedType}:null;
 }
 function makeThirdWorldEquipmentDrops(options={}){
  if(typeof window.vipLootBossExtraDropTriggered!=="function")return Object.freeze([]);
  const rng=rngFn(options.rng),s=targetState(options.state),level=Math.max(1,finiteWhole(options.level,playerEquipmentLevel(s)));
  const first=makeDrop({...options,state:s,level,sourceOrdinal:0,rng});
  const drops=first?[{...first,vip16Extra:false}]:[];
  if(window.vipLootBossExtraDropTriggered({boss:true,rng,vipLevel:options.vipLevel})){
   const extra=makeDrop({...options,state:s,level,sourceOrdinal:1,rng});
   if(extra)drops.push({...extra,vip16Extra:true});
  }
  return Object.freeze(drops.map(row=>Object.freeze(row)));
 }
 function makeThirdWorldBossEquipmentDrops(value,options={}){
  const boss=typeof window.thirdWorldBoss==="function"?window.thirdWorldBoss(value):null;
  if(!boss)return Object.freeze([]);
  return makeThirdWorldEquipmentDrops({...options,sourceBossIndex:boss.index,sourceBossId:boss.id,sourceTag:"third-world-boss"});
 }
 function sequenceRng(values){let index=0;const rows=Array.isArray(values)&&values.length?values:[.5];return()=>rows[index++%rows.length];}
 function validate(){
  const errors=[];
  if(thirdWorldEquipmentBaseQualityRoll(()=>.949999)!==4||thirdWorldEquipmentBaseQualityRoll(()=>.95)!==5)errors.push({code:"BASE_QUALITY_95_5"});
  if(typeof window.makeEquipmentRewardItem!=="function"||window.EQUIPMENT_REWARD_CORE_INTEGRITY?.passed!==true||Number(window.SHARED_EQUIPMENT_RNG_PIPELINE_VERSION)!==1)errors.push({code:"SHARED_EQUIPMENT_FACTORY"});
  if(typeof window.sharedEquipmentTypes!=="function"||Number(window.SHARED_EQUIPMENT_METADATA_OWNER_VERSION)!==1)errors.push({code:"SHARED_EQUIPMENT_METADATA_OWNER"});
  if(typeof window.resolveVipLootModifiers!=="function"||typeof window.vipLootBossExtraDropTriggered!=="function")errors.push({code:"VIP_LOOT_OWNER"});
  if(typeof window.thirdWorldEquipmentNameBand!=="function"||Number(window.THIRD_WORLD_EQUIPMENT_NAME_BAND_VERSION)!==1)errors.push({code:"AGGREGATE_NAME_BAND_OWNER"});
  if(NAME_ROWS.length!==10||new Set(NAME_ROWS.map(row=>row.theme)).size!==10)errors.push({code:"NAME_POOL_TEN_BANDS"});
  const types=equipmentTypes(),allNames=NAME_ROWS.flatMap(row=>types.map(type=>row[type])).filter(Boolean);
  if(types.length!==5||allNames.length!==50||new Set(allNames).size!==50)errors.push({code:"NAME_POOL_FIFTY_UNIQUE",count:allNames.length,unique:new Set(allNames).size});
  types.forEach(type=>{
   const suffixes=NAME_ROWS.map(row=>String(row[type]||"").slice(-2));
   if(suffixes.some(value=>value.length!==2)||new Set(suffixes).size!==10)errors.push({code:"NAME_SUFFIX_DUPLICATE",type,suffixes});
  });
  const secondWorldNames=new Set(Array.from(window.SECOND_WORLD_BOSSES||[]).flatMap(row=>Object.values(row?.equipment||{})).map(String));
  const overlaps=allNames.filter(name=>secondWorldNames.has(name));
  if(overlaps.length)errors.push({code:"SECOND_WORLD_NAME_OVERLAP",names:overlaps});
  const probeState={level:1350,vipLevel:0,equipment:{},secondWorld:{entered:true},thirdWorld:{entered:true,bosses:Array.from({length:10},()=>({currentHp:Number(window.THIRD_WORLD_BOSS_MAX_HP)||1100000000}))}};
  const legendary=makeThirdWorldEquipment({state:probeState,level:1350,forcedQ:4,forcedType:"weapon",rng:()=>.5});
  const mythic=makeThirdWorldEquipment({state:probeState,level:1350,forcedQ:5,forcedType:"armor",rng:()=>.5});
  if(!legendary||legendary.world!==3||legendary.level!==1350||legendary.q!==4||legendary.type!=="weapon"||legendary.sell!==0||legendary.buy!==0||legendary.name!=="裂隙殘鋒")errors.push({code:"LEGENDARY_ITEM_POLICY",item:legendary});
  if(!mythic||mythic.world!==3||mythic.level!==1350||mythic.q!==5||mythic.type!=="armor"||mythic.sell!==0||mythic.buy!==0||mythic.name!=="錯影披層")errors.push({code:"MYTHIC_ITEM_POLICY",item:mythic});
  const level2000=makeThirdWorldEquipment({state:{...probeState,level:2000},level:2000,forcedQ:5,forcedType:"accessory",rng:()=>.5});
  if(!level2000||level2000.level!==2000||level2000.world!==3||level2000.q!==5)errors.push({code:"LEVEL_2000_EXTENSION",item:level2000});
  if(Number(window.ENHANCEMENT_ABSOLUTE_MAX_LEVEL)!==40||typeof window.effectiveEnhancementCap!=="function"||window.effectiveEnhancementCap({secondWorld:{entered:true},thirdWorld:{entered:true}})!==40)errors.push({code:"THIRD_WORLD_ENHANCEMENT_CAP_40",absolute:window.ENHANCEMENT_ABSOLUTE_MAX_LEVEL,effective:typeof window.effectiveEnhancementCap==="function"?window.effectiveEnhancementCap({secondWorld:{entered:true},thirdWorld:{entered:true}}):null});
  const baseDrops=makeThirdWorldBossEquipmentDrops(0,{state:probeState,level:1350,vipLevel:0,rng:()=>.5,weakTypesResolver:()=>["weapon"]});
  if(baseDrops.length!==1||baseDrops[0]?.vip16Extra!==false||baseDrops[0]?.item?.world!==3||baseDrops[0]?.item?.level!==1350||![4,5].includes(baseDrops[0]?.item?.q))errors.push({code:"FORMAL_BASE_DROP",drops:baseDrops});
  const vipDrops=makeThirdWorldBossEquipmentDrops(0,{state:{...probeState,vipLevel:16},level:1350,vipLevel:16,rng:()=>0,weakTypesResolver:()=>["weapon"]});
  if(vipDrops.length!==2||vipDrops[1]?.vip16Extra!==true||vipDrops.some(row=>row.item?.q!==5||row.item?.world!==3)||vipDrops[0]?.item?.id===vipDrops[1]?.item?.id)errors.push({code:"VIP_EXISTING_PRIVILEGES",drops:vipDrops});
  const noBossDrops=makeThirdWorldEquipmentDrops({state:probeState,level:1350,vipLevel:0,rng:()=>.5,weakTypesResolver:()=>["weapon"],sourceTag:"third-world-generic-probe"});
  if(noBossDrops.length!==1||noBossDrops[0]?.item?.sourceBossIndex!=null||noBossDrops[0]?.item?.sourceBossId!=null||noBossDrops[0]?.item?.sourceTag!=="third-world-generic-probe")errors.push({code:"GENERIC_FACTORY_BOSS_INDEPENDENCE",drops:noBossDrops});
  const seed=[.12,.98,.23,.34,.45,.56,.67,.78,.89,.11,.22,.33,.44,.55,.66,.77,.88,.99];
  const firstSeeded=makeThirdWorldBossEquipmentDrops(2,{state:{...probeState,vipLevel:16},level:1350,vipLevel:16,rng:sequenceRng(seed),weakTypesResolver:()=>["accessory"]});
  const secondSeeded=makeThirdWorldBossEquipmentDrops(2,{state:{...probeState,vipLevel:16},level:1350,vipLevel:16,rng:sequenceRng(seed),weakTypesResolver:()=>["accessory"]});
  if(JSON.stringify(firstSeeded)!==JSON.stringify(secondSeeded))errors.push({code:"SEEDED_DROP_NOT_DETERMINISTIC",firstSeeded,secondSeeded});
  return Object.freeze({version:VERSION,namePoolVersion:NAME_POOL_VERSION,genericFactoryVersion:GENERIC_FACTORY_VERSION,enhancementCapPolicyVersion:ENHANCEMENT_CAP_POLICY_VERSION,deterministicVersion:DETERMINISTIC_VERSION,metadataOwnerVersion:METADATA_OWNER_VERSION,passed:errors.length===0,errors:Object.freeze(errors.slice())});
 }

 window.THIRD_WORLD_EQUIPMENT_REWARD_VERSION=VERSION;
 window.THIRD_WORLD_EQUIPMENT_QUALITY_POLICY_VERSION=QUALITY_POLICY_VERSION;
 window.THIRD_WORLD_EQUIPMENT_DETERMINISTIC_VERSION=DETERMINISTIC_VERSION;
 window.THIRD_WORLD_EQUIPMENT_METADATA_OWNER_VERSION=METADATA_OWNER_VERSION;
 window.THIRD_WORLD_EQUIPMENT_NAME_POOL_VERSION=NAME_POOL_VERSION;
 window.THIRD_WORLD_EQUIPMENT_GENERIC_FACTORY_VERSION=GENERIC_FACTORY_VERSION;
 window.THIRD_WORLD_ENHANCEMENT_CAP_POLICY_VERSION=ENHANCEMENT_CAP_POLICY_VERSION;
 window.THIRD_WORLD_EQUIPMENT_NAME_ROWS=NAME_ROWS;
 window.THIRD_WORLD_EQUIPMENT_BASE_POLICY=Object.freeze({legendaryChance:BASE_LEGENDARY_CHANCE,mythicChance:BASE_MYTHIC_CHANCE,baseDropCount:1,levelSource:"player-current",saleResource:"none",vipLootPrivileges:true,nameSource:"aggregate-remaining-hp",enhancementCap:40});
 window.thirdWorldEquipmentNamesForBand=namesForBand;
 window.thirdWorldEquipmentName=equipmentName;
 window.thirdWorldEquipmentBaseQualityRoll=thirdWorldEquipmentBaseQualityRoll;
 window.makeThirdWorldEquipment=makeThirdWorldEquipment;
 window.makeThirdWorldEquipmentForBoss=makeThirdWorldEquipmentForBoss;
 window.makeThirdWorldEquipmentDrops=makeThirdWorldEquipmentDrops;
 window.makeThirdWorldBossEquipmentDrops=makeThirdWorldBossEquipmentDrops;
 window.THIRD_WORLD_EQUIPMENT_REWARD_INTEGRITY=validate();
 if(!window.THIRD_WORLD_EQUIPMENT_REWARD_INTEGRITY.passed)console.error("[文明戰線] Third-world equipment reward integrity error",window.THIRD_WORLD_EQUIPMENT_REWARD_INTEGRITY.errors);
})();
