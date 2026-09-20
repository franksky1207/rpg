(function(){
 const VIP_THRESHOLD_BASE=1000;
 const VIP_PROGRESSION_VERSION=13;

 function clampVipLevel(value){
  return Math.max(0,Math.min(VIP_MAX_LEVEL,Math.floor(Number(value)||0)));
 }
 function vipThresholdV13(level){
  const lv=clampVipLevel(level);
  return VIP_THRESHOLD_BASE*lv*lv;
 }
 function vipLevelFromPointsV13(points){
  const p=Math.max(0,Math.floor(Number(points)||0));
  return clampVipLevel(Math.floor(Math.sqrt(p/VIP_THRESHOLD_BASE)));
 }
 function normalizeVipStateV13(target){
  if(!target||typeof target!=="object")return target;
  const ownPoints=Number(target.vipPoints);
  target.vipPoints=Number.isFinite(ownPoints)&&ownPoints>=0?Math.floor(ownPoints):0;
  target.vipLevel=vipLevelFromPointsV13(target.vipPoints);
  return target;
 }
 function vipDungeonPointMultiplier(level=null){
  const lv=clampVipLevel(level??state?.vipLevel);
  if(lv>=12)return 1.20;
  if(lv>=4)return 1.10;
  return 1;
 }
 function adjustVipDungeonPoints(points,level=null){
  const base=Math.max(0,Math.floor(Number(points)||0));
  return Math.max(0,Math.floor(base*vipDungeonPointMultiplier(level)));
 }

 vipThreshold=vipThresholdV13;
 vipLevelFromPoints=vipLevelFromPointsV13;
 normalizeVipState=normalizeVipStateV13;
 window.VIP_THRESHOLD_BASE=VIP_THRESHOLD_BASE;
 window.VIP_PROGRESSION_VERSION=VIP_PROGRESSION_VERSION;
 window.vipThreshold=vipThresholdV13;
 window.vipLevelFromPoints=vipLevelFromPointsV13;
 window.normalizeVipState=normalizeVipStateV13;
 window.vipDungeonPointMultiplier=vipDungeonPointMultiplier;
 window.adjustVipDungeonPoints=adjustVipDungeonPoints;
 if(typeof registerNewStateNormalizer==="function")registerNewStateNormalizer(normalizeVipStateV13);
})();