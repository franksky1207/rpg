(function(){
 // EXP 正式公式與曲線係數全部以 engine.js 為唯一來源。
 // 此檔只保留查詢／測試用 alias 與輔助函式，不再保存另一份曲線常數。
 window.level100ExpFactor=window.expProgressionFactor;

 // 供 GM / 後續擴充直接檢查任意等級的同級普通怪約需擊敗數；不綁目前 MAX_LEVEL。
 window.sameLevelNormalKillsToLevel=function(level){
  const l=Math.max(1,Math.floor(Number(level)||1));
  return round1(expNeed(l)/Math.max(1,sameExp(l)));
 };
})();
