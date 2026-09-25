(function(){
 const VIP_THRESHOLD_BASE=1000;
 const VIP_PROGRESSION_VERSION=14;
 const VIP_UNBOUNDED_LEVEL_VERSION=1;
 const VIP_PERK_MAX_LEVEL=20;
 const VIP_POINTS_SOURCE_OF_TRUTH_VERSION=1;
 const VIP_STATE_RECONCILIATION_VERSION=1;

 function normalizeVipLevel(value){
  return Math.max(0,Math.floor(Number(value)||0));
 }
 function vipThresholdV14(level){
  const lv=normalizeVipLevel(level);
  return VIP_THRESHOLD_BASE*lv*lv;
 }
 function vipLevelFromPointsV14(points){
  const p=Math.max(0,Math.floor(Number(points)||0));
  return normalizeVipLevel(Math.floor(Math.sqrt(p/VIP_THRESHOLD_BASE)));
 }
 function normalizeVipStateV14(target){
  if(!target||typeof target!=="object")return target;
  const ownPoints=Number(target.vipPoints);
  target.vipPoints=Number.isFinite(ownPoints)&&ownPoints>=0?Math.floor(ownPoints):0;
  target.vipLevel=vipLevelFromPointsV14(target.vipPoints);
  return target;
 }
 function vipBonusStatsV14(level=null){
  const lv=normalizeVipLevel(level??state?.vipLevel);
  return {
   level:lv,
   hp:lv*VIP_HP_ATK_PERCENT_PER_LEVEL,
   atk:lv*VIP_HP_ATK_PERCENT_PER_LEVEL,
   def:lv*VIP_DEF_PERCENT_PER_LEVEL,
   crit:lv*VIP_RATE_STAT_PER_LEVEL,
   dodge:lv*VIP_RATE_STAT_PER_LEVEL
  };
 }
 function vipDungeonPointMultiplier(level=null){
  const lv=normalizeVipLevel(level??state?.vipLevel);
  if(lv>=12)return 1.20;
  if(lv>=4)return 1.10;
  return 1;
 }
 function adjustVipDungeonPoints(points,level=null){
  const base=Math.max(0,Math.floor(Number(points)||0));
  return Math.max(0,Math.floor(base*vipDungeonPointMultiplier(level)));
 }

 vipThreshold=vipThresholdV14;
 vipLevelFromPoints=vipLevelFromPointsV14;
 normalizeVipState=normalizeVipStateV14;
 vipBonusStats=vipBonusStatsV14;
 window.VIP_THRESHOLD_BASE=VIP_THRESHOLD_BASE;
 window.VIP_PROGRESSION_VERSION=VIP_PROGRESSION_VERSION;
 window.VIP_UNBOUNDED_LEVEL_VERSION=VIP_UNBOUNDED_LEVEL_VERSION;
 window.VIP_PERK_MAX_LEVEL=VIP_PERK_MAX_LEVEL;
 window.VIP_POINTS_SOURCE_OF_TRUTH_VERSION=VIP_POINTS_SOURCE_OF_TRUTH_VERSION;
 window.VIP_STATE_RECONCILIATION_VERSION=VIP_STATE_RECONCILIATION_VERSION;
 window.normalizeVipLevel=normalizeVipLevel;
 window.vipThreshold=vipThresholdV14;
 window.vipLevelFromPoints=vipLevelFromPointsV14;
 window.normalizeVipState=normalizeVipStateV14;
 window.vipBonusStats=vipBonusStatsV14;
 window.vipDungeonPointMultiplier=vipDungeonPointMultiplier;
 window.adjustVipDungeonPoints=adjustVipDungeonPoints;
 if(typeof registerNewStateNormalizer==="function")registerNewStateNormalizer(normalizeVipStateV14);
})();