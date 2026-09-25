(function(){
 const VERSION=1;
 const VIP8_LEVEL=8,VIP8_WEAK_SLOT_CHANCE=.15;
 const VIP14_LEVEL=14,VIP14_QUALITY_CHANCE=.05;
 const VIP16_LEVEL=16,VIP16_BOSS_EXTRA_CHANCE=.15;
 const VIP18_LEVEL=18,VIP18_BOSS_QUALITY_CHANCE=.10;
 const MAX_QUALITY=5;

 function normalizedVipLevel(value=null){
  const raw=value==null?(typeof state!=="undefined"?state?.vipLevel:0):value;
  const max=typeof VIP_MAX_LEVEL!=="undefined"?Math.max(0,Math.floor(Number(VIP_MAX_LEVEL)||0)):20;
  return Math.max(0,Math.min(max,Math.floor(Number(raw)||0)));
 }
 function rngFn(value){return typeof value==="function"?value:Math.random;}
 function vipLootForcedType(options={}){
  const level=normalizedVipLevel(options.vipLevel),rng=rngFn(options.rng);
  if(level<VIP8_LEVEL||rng()>=VIP8_WEAK_SLOT_CHANCE||typeof weakEquipmentTypes!=="function")return null;
  const order=weakEquipmentTypes();
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
 window.vipLootForcedType=vipLootForcedType;
 window.applyVipLootQualityPromotions=applyVipLootQualityPromotions;
 window.vipLootBossExtraDropTriggered=vipLootBossExtraDropTriggered;
 window.vipLootPrivilegeSnapshot=vipLootPrivilegeSnapshot;
})();
