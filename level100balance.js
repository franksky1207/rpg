(function(){
 // Lv1～100 擴充・最終平衡：保留 Lv1～50 原曲線，Lv51～100 改為較平順但持續變難。
 const baseExpNeedForLevel100=expNeed;
 const EXP_FACTOR_AT_50=4.5+.35*50+.023*50*50; // 79.5，同原公式 Lv50 完全銜接

 window.level100ExpFactor=function(level){
  const l=Math.max(1,Math.floor(Number(level)||1));
  if(l<=50)return 4.5+.35*l+.023*l*l;
  const d=l-50;
  return EXP_FACTOR_AT_50+1.10*d+.01*d*d;
 };

 expNeed=function(level){
  const l=Math.max(1,Math.floor(Number(level)||1));
  if(l<=50)return baseExpNeedForLevel100(l);
  return ceil(sameExp(l)*level100ExpFactor(l));
 };

 // 供 GM / 後續平衡檢查直接取得同級普通怪約需擊敗數。
 window.sameLevelNormalKillsToLevel=function(level){
  const l=Math.max(1,Math.min(MAX_LEVEL-1,Math.floor(Number(level)||1)));
  return round1(expNeed(l)/Math.max(1,sameExp(l)));
 };
})();
