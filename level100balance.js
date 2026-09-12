(function(){
 // EXP 正式公式以 engine.js 的 expNeed() 為唯一來源。
 // 此檔只保留查詢／測試用輔助函式，避免再次覆寫正式升級需求。
 const EXP_KILL_MIN=5;
 const EXP_KILL_RANGE=245;
 const EXP_KILL_SCALE=142;

 window.expProgressionFactor=function(level){
  const l=Math.max(1,Math.floor(Number(level)||1));
  return EXP_KILL_MIN+EXP_KILL_RANGE*(1-Math.exp(-(l-1)/EXP_KILL_SCALE));
 };

 // 保留既有名稱作相容 alias，避免其他測試工具若引用舊函式時失效。
 window.level100ExpFactor=window.expProgressionFactor;

 // 供 GM / 後續擴充直接檢查任意等級的同級普通怪約需擊敗數；不綁目前 MAX_LEVEL。
 window.sameLevelNormalKillsToLevel=function(level){
  const l=Math.max(1,Math.floor(Number(level)||1));
  return round1(expNeed(l)/Math.max(1,sameExp(l)));
 };
})();
