(function(){
 const VIP_THRESHOLD_BASE=1000;
 const VIP_PROGRESSION_VERSION=14;

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
 window.VIP_THRESHOLD_BASE=VIP_THRESHOLD_BASE;
 window.VIP_PROGRESSION_VERSION=VIP_PROGRESSION_VERSION;
 window.normalizeVipLevel=normalizeVipLevel;
 window.vipThreshold=vipThresholdV14;
 window.vipLevelFromPoints=vipLevelFromPointsV14;
 window.normalizeVipState=normalizeVipStateV14;
 window.vipDungeonPointMultiplier=vipDungeonPointMultiplier;
 window.adjustVipDungeonPoints=adjustVipDungeonPoints;
 if(typeof registerNewStateNormalizer==="function")registerNewStateNormalizer(normalizeVipStateV14);
})();