(function(){
 window.MAX_LEVEL=50;

 window.clampGameLevel=function(level){
  return Math.max(1,Math.min(MAX_LEVEL,Math.floor(Number(level)||1)));
 };

 gainExp=function(n,logs=[]){
  state.exp+=Math.max(0,Number(n)||0);
  let ups=0;
  while(state.level<MAX_LEVEL&&state.exp>=expNeed(state.level)){
   state.exp-=expNeed(state.level);
   state.level++;
   ups++;
   state.hp=equippedStats().hp;
   logs.push(`升級！你到達 Lv.${state.level}，HP 已完全恢復。`);
  }
  if(state.level>=MAX_LEVEL)state.exp=0;
  return ups;
 };

 applyDeathPenalty=function(logs=[]){
  let loss=state.level>=MAX_LEVEL?0:ceil(expNeed(state.level)*.10),actual=Math.min(state.exp,loss);
  state.exp=Math.max(0,state.exp-loss);
  let dropped=null;
  let worn=EQUIPMENT_TYPES.map(slot=>[slot,state.equipment[slot]]).filter(([,it])=>!!it);
  if(worn.length&&Math.random()<.30){
   let [slot,it]=worn[Math.floor(Math.random()*worn.length)];
   state.equipment[slot]=null;
   dropped=it;
   state.lostGear.push({id:Date.now().toString(36)+Math.random().toString(36).slice(2),item:it,cost:ceil(it.buy*2),lostAt:Date.now()});
  }
  state.hp=equippedStats().hp;
  logs.push(`死亡懲罰：EXP -${actual}${loss>actual?`（目前 EXP 已扣至 0）`:""}。`);
  if(dropped)logs.push(`裝備遺失：${itemHtmlPlain(dropped)}。可前往商店贖回。`);
  else logs.push(`本次沒有遺失裝備。`);
  return {expLost:actual,dropped};
 };

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
 // 保留原 fightOnce 的所有戰鬥、掉落與進度邏輯，只修正結算數字。
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

 if(typeof buildSpecialMonsterFromPlayer==="function"){
  const baseBuild=buildSpecialMonsterFromPlayer;
  buildSpecialMonsterFromPlayer=function(playerStats,special,level=1){
   const enemy=baseBuild(playerStats,special,Math.min(50,clampGameLevel(level)));
   if(enemy)enemy.level=clampGameLevel(level);
   return enemy;
  };
 }
})();