(function(){
 const VERSION=2;
 const VIP8_LEVEL=8,VIP8_WEAK_SLOT_CHANCE=.15;
 const VIP14_LEVEL=14,VIP14_QUALITY_CHANCE=.05;
 const VIP16_LEVEL=16,VIP16_BOSS_EXTRA_CHANCE=.15;
 const VIP18_LEVEL=18,VIP18_BOSS_QUALITY_CHANCE=.10;
 const MAX_QUALITY=5;

 function normalizedVipLevel(value=null){
  const raw=value==null?(typeof state!=="undefined"?state?.vipLevel:0):value;
  return Math.max(0,Math.floor(Number(raw)||0));
 }
 function rngFn(value){return typeof value==="function"?value:Math.random;}
 function targetState(value=null){
  if(value&&typeof value==="object")return value;
  try{return typeof state!=="undefined"&&state&&typeof state==="object"?state:null;}catch(e){return null;}
 }
 function defaultWeakEquipmentTypes(target=null,rng=Math.random){
  const s=targetState(target),random=rngFn(rng);
  if(!s||typeof equipmentScore!=="function"||typeof EQUIPMENT_TYPES==="undefined")return [];
  return EQUIPMENT_TYPES
   .map(type=>({type,value:equipmentScore(s.equipment?.[type]),tie:random()}))
   .sort((a,b)=>a.value-b.value||a.tie-b.tie)
   .map(row=>row.type);
 }
 function vipLootForcedType(options={}){
  const level=normalizedVipLevel(options.vipLevel),rng=rngFn(options.rng);
  if(level<VIP8_LEVEL||rng()>=VIP8_WEAK_SLOT_CHANCE)return null;
  const resolver=typeof options.weakTypesResolver==="function"?options.weakTypesResolver:defaultWeakEquipmentTypes;
  const order=resolver(targetState(options.state),rng);
  return Array.isArray(order)?order[0]||null:null;
 }
 function applyVipLootQualityPromotions(quality,options={}){
  const level=normalizedVipLevel(options.vipLevel),rng=rngFn(options.rng),boss=options.boss===true;
  const max=Math.max(0,Math.floor(Number(options.maxQuality??MAX_QUALITY)||MAX_QUALITY));
  let q=Math.max(0,Math.min(max,Math.floor(Number(quality)||0)));
  const vip14Roll=level>=VIP14_LEVEL&&rng()<VIP14_QUALITY_CHANCE;
  const vip18Roll=boss&&level>=VIP18_LEVEL&&rng()<VIP18_BOSS_QUALITY_CHANCE;
  let vip14Promotion=0,vip18Promotion=0;
  if(vip14Roll&&q<max){q++;vip14Promotion=1;}
  if(vip18Roll&&q<max){q++;vip18Promotion=1;}
  return {quality:q,vip14Roll,vip18Roll,vip14Promotion,vip18Promotion};
 }
 function resolveVipLootModifiers(quality,options={}){
  const rng=rngFn(options.rng),baseQuality=Math.floor(Number(quality)||0);
  const qualityResult=applyVipLootQualityPromotions(baseQuality,{...options,rng});
  const forcedType=vipLootForcedType({...options,rng});
  return {baseQuality,quality:qualityResult.quality,forcedType,vip8WeakSlot:!!forcedType,qualityResult};
 }
 function vipLootBossExtraDropTriggered(options={}){
  const level=normalizedVipLevel(options.vipLevel),rng=rngFn(options.rng);
  return options.boss===true&&level>=VIP16_LEVEL&&rng()<VIP16_BOSS_EXTRA_CHANCE;
 }
 function vipLootPrivilegeSnapshot(value=null){
  const level=normalizedVipLevel(value);
  return {
   vipLevel:level,
   weakSlot:{enabled:level>=VIP8_LEVEL,chance:VIP8_WEAK_SLOT_CHANCE},
   quality:{enabled:level>=VIP14_LEVEL,chance:VIP14_QUALITY_CHANCE},
   bossExtra:{enabled:level>=VIP16_LEVEL,chance:VIP16_BOSS_EXTRA_CHANCE},
   bossQuality:{enabled:level>=VIP18_LEVEL,chance:VIP18_BOSS_QUALITY_CHANCE}
  };
 }

 window.VIP_LOOT_CORE_VERSION=VERSION;
 window.VIP_LOOT_PRIVILEGE_CONFIG=Object.freeze({
  vip8:Object.freeze({level:VIP8_LEVEL,chance:VIP8_WEAK_SLOT_CHANCE}),
  vip14:Object.freeze({level:VIP14_LEVEL,chance:VIP14_QUALITY_CHANCE}),
  vip16:Object.freeze({level:VIP16_LEVEL,chance:VIP16_BOSS_EXTRA_CHANCE}),
  vip18:Object.freeze({level:VIP18_LEVEL,chance:VIP18_BOSS_QUALITY_CHANCE})
 });
 window.vipLootDefaultWeakEquipmentTypes=defaultWeakEquipmentTypes;
 window.vipLootForcedType=vipLootForcedType;
 window.applyVipLootQualityPromotions=applyVipLootQualityPromotions;
 window.resolveVipLootModifiers=resolveVipLootModifiers;
 window.vipLootBossExtraDropTriggered=vipLootBossExtraDropTriggered;
 window.vipLootPrivilegeSnapshot=vipLootPrivilegeSnapshot;
})();
