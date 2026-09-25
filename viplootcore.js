(function(){
 const VERSION=2;
 const VIP8_LEVEL=8;
 const VIP14_LEVEL=14;
 const VIP16_LEVEL=16;
 const VIP18_LEVEL=18;
 const VIP8_WEAK_SLOT_CHANCE=.15;
 const VIP14_QUALITY_CHANCE=.05;
 const VIP16_BOSS_EXTRA_CHANCE=.15;
 const VIP18_BOSS_QUALITY_CHANCE=.10;
 const MAX_QUALITY_INDEX=5;

 function normalizedVipLevel(level=null){
  return Math.max(0,Math.floor(Number(level??state?.vipLevel)||0));
 }
 function roll(rng=Math.random){
  const value=Number((typeof rng==="function"?rng:Math.random)());
  return Number.isFinite(value)?Math.max(0,Math.min(.999999999,value)):.999999999;
 }
 function defaultWeakEquipmentTypes(targetState=null){
  const holder=targetState&&typeof targetState==="object"?targetState:(typeof state!=="undefined"?state:null);
  const types=Array.isArray(EQUIPMENT_TYPES)?EQUIPMENT_TYPES:[];
  if(!types.length)return [];
  const equipment=holder?.equipment||{};
  let lowest=Infinity,out=[];
  types.forEach(type=>{
   const item=equipment[type]||null;
   const score=item&&typeof equipmentScore==="function"?Number(equipmentScore(item)):-1;
   const normalized=Number.isFinite(score)?score:-1;
   if(normalized<lowest){lowest=normalized;out=[type];}
   else if(normalized===lowest)out.push(type);
  });
  return out;
 }
 function chooseWeakType(rng=Math.random,targetState=null,resolver=null){
  const source=typeof resolver==="function"?resolver(targetState):defaultWeakEquipmentTypes(targetState);
  const types=Array.isArray(source)?source.filter(type=>Array.isArray(EQUIPMENT_TYPES)&&EQUIPMENT_TYPES.includes(type)):[];
  if(!types.length)return null;
  return types[Math.min(types.length-1,Math.floor(roll(rng)*types.length))]||null;
 }
 function resolveVipLootModifiers(baseQuality,options={}){
  const vipLevel=normalizedVipLevel(options.vipLevel);
  const boss=options.boss===true;
  const rng=typeof options.rng==="function"?options.rng:Math.random;
  const targetState=options.state&&typeof options.state==="object"?options.state:null;
  const weakTypesResolver=typeof options.weakTypesResolver==="function"?options.weakTypesResolver:null;
  const base=Math.max(0,Math.min(MAX_QUALITY_INDEX,Math.floor(Number(baseQuality)||0)));
  let forcedType=null,quality=base,vip8WeakSlot=false,vip14Promotion=0,vip18Promotion=0;
  if(vipLevel>=VIP8_LEVEL&&roll(rng)<VIP8_WEAK_SLOT_CHANCE){
   forcedType=chooseWeakType(rng,targetState,weakTypesResolver);
   vip8WeakSlot=!!forcedType;
  }
  if(vipLevel>=VIP14_LEVEL&&roll(rng)<VIP14_QUALITY_CHANCE){vip14Promotion=1;quality=Math.min(MAX_QUALITY_INDEX,quality+1);}
  if(boss&&vipLevel>=VIP18_LEVEL&&roll(rng)<VIP18_BOSS_QUALITY_CHANCE){vip18Promotion=1;quality=Math.min(MAX_QUALITY_INDEX,quality+1);}
  return {vipLevel,forcedType,quality,vip8WeakSlot,vip14Promotion,vip18Promotion,actualPromotions:quality-base};
 }
 function vipLootBossExtraDropTriggered(options={}){
  const vipLevel=normalizedVipLevel(options.vipLevel);
  if(options.boss!==true||vipLevel<VIP16_LEVEL)return false;
  return roll(typeof options.rng==="function"?options.rng:Math.random)<VIP16_BOSS_EXTRA_CHANCE;
 }

 window.VIP_LOOT_CORE_VERSION=VERSION;
 window.VIP_LOOT_RULES=Object.freeze({
  vip8:Object.freeze({level:VIP8_LEVEL,chance:VIP8_WEAK_SLOT_CHANCE}),
  vip14:Object.freeze({level:VIP14_LEVEL,chance:VIP14_QUALITY_CHANCE}),
  vip16:Object.freeze({level:VIP16_LEVEL,chance:VIP16_BOSS_EXTRA_CHANCE}),
  vip18:Object.freeze({level:VIP18_LEVEL,chance:VIP18_BOSS_QUALITY_CHANCE})
 });
 window.resolveVipLootModifiers=resolveVipLootModifiers;
 window.vipLootBossExtraDropTriggered=vipLootBossExtraDropTriggered;
 window.vipLootWeakEquipmentTypes=function(targetState=null){return defaultWeakEquipmentTypes(targetState);};
})();