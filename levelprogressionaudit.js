(function(){
 const VERSION=1;

 window.levelExpFactor=window.expProgressionFactor;
 window.sameLevelNormalKillsToLevel=function(level){
  const l=Math.max(1,Math.floor(Number(level)||1));
  const need=typeof window.effectiveExpNeed==="function"?window.effectiveExpNeed(l,state):typeof expNeed==="function"?expNeed(l):0;
  return round1(Math.max(0,Number(need)||0)/Math.max(1,sameExp(l)));
 };

 window.levelProgressionAudit=function(level){
  const l=Math.max(1,Math.floor(Number(level)||1));
  const need=typeof window.effectiveExpNeed==="function"?window.effectiveExpNeed(l,state):typeof expNeed==="function"?expNeed(l):0;
  return {
   level:l,
   expPerSameLevelNormal:sameExp(l),
   expNeed:Math.max(0,Number(need)||0),
   sameLevelNormalKills:window.sameLevelNormalKillsToLevel(l),
   baseHp:baseHP(l),
   baseAtk:baseATK(l),
   baseDef:baseDEF(l),
   effectiveCap:typeof window.effectiveLevelCap==="function"?window.effectiveLevelCap(state):null
  };
 };

 window.LEVEL_PROGRESSION_AUDIT_VERSION=VERSION;
})();
