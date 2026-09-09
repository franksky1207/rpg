(function(){
 window.specialExpPayout=function(rawXp,logs=[]){
  const amount=Math.max(0,ceil(Number(rawXp)||0));
  if(state.level>=MAX_LEVEL){
   state.gold+=amount;
   return {xp:0,convertedGold:amount};
  }
  gainExp(amount,logs);
  return {xp:amount,convertedGold:0};
 };

 // 一般／菁英／Boss：玩家在戰鬥開始時已滿等，該場 EXP 以 1:1 轉為金幣。
 const baseFightOnceForLevelCap=fightOnce;
 fightOnce=function(mapIdx,eIdx,encounter=null){
  const startedAtCap=state.level>=MAX_LEVEL;
  const r=baseFightOnceForLevelCap(mapIdx,eIdx,encounter);
  if(!startedAtCap||!r?.ok||!r.win)return r;

  const rawXp=Math.max(0,ceil(Number(r.xp)||0));
  if(!rawXp){r.xp=0;return r;}

  const originalGold=Math.max(0,Number(r.gold)||0);
  state.gold+=rawXp;
  r.convertedExpGold=rawXp;
  r.xp=0;
  r.gold=originalGold+rawXp;

  if(Array.isArray(r.logs)&&r.e?.name){
   const oldLine=`${r.e.name}被擊敗。獲得 EXP +${rawXp}、金幣 +${originalGold}。`;
   const newLine=`${r.e.name}被擊敗。獲得金幣 +${originalGold}；滿等 EXP ${rawXp} 已轉換為金幣 +${rawXp}。`;
   r.logs=r.logs.map(line=>line===oldLine?newLine:line);
  }
  save(false);
  return r;
 };
})();
