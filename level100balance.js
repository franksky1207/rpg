(function(){
 // 《文明戰線》永久 EXP 曲線：Lv1 起到未來任意等級都使用同一算法。
 // 目標是前期成長明顯、後期持續變難，但同級普通怪需求逐漸趨近約 200 隻而不會無限爆增。
 const EXP_KILL_MIN=5;
 const EXP_KILL_RANGE=195;
 const EXP_KILL_MIDPOINT=64;
 const EXP_KILL_POWER=1.8;

 window.expProgressionFactor=function(level){
  const l=Math.max(1,Math.floor(Number(level)||1));
  const x=Math.pow(l-1,EXP_KILL_POWER);
  const mid=Math.pow(EXP_KILL_MIDPOINT,EXP_KILL_POWER);
  return EXP_KILL_MIN+EXP_KILL_RANGE*(x/(x+mid));
 };

 // 保留既有名稱作相容 alias，避免其他測試工具若引用舊函式時失效。
 window.level100ExpFactor=window.expProgressionFactor;

 expNeed=function(level){
  const l=Math.max(1,Math.floor(Number(level)||1));
  return ceil(sameExp(l)*expProgressionFactor(l));
 };

 // 供 GM / 後續擴充直接檢查任意等級的同級普通怪約需擊敗數；不綁目前 MAX_LEVEL。
 window.sameLevelNormalKillsToLevel=function(level){
  const l=Math.max(1,Math.floor(Number(level)||1));
  return round1(expNeed(l)/Math.max(1,sameExp(l)));
 };
})();
