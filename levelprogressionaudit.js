(function(){
 const VERSION=2;

 function auditTarget(target=null){
  if(target&&typeof target==="object")return target;
  try{return typeof state!=="undefined"&&state&&typeof state==="object"?state:null;}catch(e){return null;}
 }

 window.levelExpFactor=window.expProgressionFactor;
 window.sameLevelNormalKillsToLevel=function(level,target=null){
  const l=Math.max(1,Math.floor(Number(level)||1));
  const s=auditTarget(target);
  const need=typeof window.effectiveExpNeed==="function"?window.effectiveExpNeed(l,s):typeof expNeed==="function"?expNeed(l):0;
  return round1(Math.max(0,Number(need)||0)/Math.max(1,sameExp(l)));
 };

 window.levelProgressionAudit=function(level,target=null){
  const l=Math.max(1,Math.floor(Number(level)||1));
  const s=auditTarget(target);
  const need=typeof window.effectiveExpNeed==="function"?window.effectiveExpNeed(l,s):typeof expNeed==="function"?expNeed(l):0;
  const world=typeof window.currentLevelWorldPhase==="function"?window.currentLevelWorldPhase(s):typeof window.currentWorldPhase==="function"?window.currentWorldPhase(s):null;
  return {
   level:l,
   world:Number.isInteger(Number(world))?Number(world):null,
   expPerSameLevelNormal:sameExp(l),
   expNeed:Math.max(0,Number(need)||0),
   sameLevelNormalKills:window.sameLevelNormalKillsToLevel(l,s),
   baseHp:baseHP(l),
   baseAtk:baseATK(l),
   baseDef:baseDEF(l),
   effectiveCap:typeof window.effectiveLevelCap==="function"?window.effectiveLevelCap(s):null
  };
 };

 window.LEVEL_PROGRESSION_AUDIT_VERSION=VERSION;
 window.LEVEL_PROGRESSION_AUDIT_WORLD_PHASE_VERSION=1;
})();
