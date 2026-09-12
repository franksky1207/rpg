(function(){
 // EXP 正式公式與曲線係數全部以 engine.js 為唯一來源。
 // 此檔保留相容 alias 與任意等級查詢工具；不再把成長檢查綁死在 Lv100。
 window.levelExpFactor=window.expProgressionFactor;
 window.level100ExpFactor=window.levelExpFactor;

 // 供 GM / 後續擴充直接檢查任意等級的同級普通怪約需擊敗數；不綁目前 MAX_LEVEL。
 window.sameLevelNormalKillsToLevel=function(level){
  const l=Math.max(1,Math.floor(Number(level)||1));
  return round1(expNeed(l)/Math.max(1,sameExp(l)));
 };

 window.levelProgressionAudit=function(level){
  const l=Math.max(1,Math.floor(Number(level)||1));
  return {
   level:l,
   expPerSameLevelNormal:sameExp(l),
   expNeed:expNeed(l),
   sameLevelNormalKills:window.sameLevelNormalKillsToLevel(l),
   baseHp:baseHP(l),
   baseAtk:baseATK(l),
   baseDef:baseDEF(l)
  };
 };
})();
