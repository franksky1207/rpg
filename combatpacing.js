(function(){
 const baseSleep=window.sleep;
 if(typeof baseSleep!=="function")return;

 const MAIN_START_DELAY=120;
 const MAIN_WINDUP_DELAY=70;
 const MAIN_NORMAL_DELAY=115;
 const MAIN_BOSS_DELAY=160;
 const MAIN_END_DELAY=170;
 const SPECIAL_DELAY_MAP=new Map([
  [180,120],
  [120,70],
  [190,115],
  [220,135],
  [250,170]
 ]);
 let specialPacingActive=false;

 window.sleep=function(ms){
  const n=Number(ms)||0;
  return baseSleep(specialPacingActive?(SPECIAL_DELAY_MAP.get(n)??n):n);
 };

 window.animateFight=async function(r,startPlayerHp,playerMax,enemyMax,roundText=""){
  let ehp=enemyMax,php=startPlayerHp;
  const actionDelay=r?.e?.kind==="boss"?MAIN_BOSS_DELAY:MAIN_NORMAL_DELAY;
  setCombatHp(ehp,enemyMax,php,playerMax,roundText?`${roundText}・開始戰鬥`:"開始戰鬥");
  await baseSleep(MAIN_START_DELAY);
  for(const line of r.logs){
   let m=line.match(/^你攻擊.+，暴擊造成 (\d+) 點傷害。$/);
   if(m){attackMotion("player");await baseSleep(MAIN_WINDUP_DELAY);ehp=Math.max(0,ehp-(+m[1]));flashCombatText("enemy",`暴擊 -${m[1]}`);setCombatHp(ehp,enemyMax,php,playerMax,`暴擊！你造成 ${m[1]} 點傷害`);await baseSleep(actionDelay);continue}
   m=line.match(/^你攻擊.+，造成 (\d+) 點傷害。$/);
   if(m){attackMotion("player");await baseSleep(MAIN_WINDUP_DELAY);ehp=Math.max(0,ehp-(+m[1]));flashCombatText("enemy",`-${m[1]}`);setCombatHp(ehp,enemyMax,php,playerMax,`你造成 ${m[1]} 點傷害`);await baseSleep(actionDelay);continue}
   m=line.match(/^你攻擊.+，.+閃避了攻擊。$/);
   if(m){attackMotion("player");await baseSleep(MAIN_WINDUP_DELAY);flashCombatText("enemy","閃避");setCombatHp(ehp,enemyMax,php,playerMax,`${r.e.name}閃避了你的攻擊`);await baseSleep(MAIN_NORMAL_DELAY);continue}
   m=line.match(/^.+攻擊你，暴擊造成 (\d+) 點傷害。$/);
   if(m){attackMotion("enemy");await baseSleep(MAIN_WINDUP_DELAY);php=Math.max(0,php-(+m[1]));flashCombatText("player",`暴擊 -${m[1]}`);setCombatHp(ehp,enemyMax,php,playerMax,`${r.e.name}暴擊造成 ${m[1]} 點傷害`);await baseSleep(actionDelay);continue}
   m=line.match(/^.+攻擊你，造成 (\d+) 點傷害。$/);
   if(m){attackMotion("enemy");await baseSleep(MAIN_WINDUP_DELAY);php=Math.max(0,php-(+m[1]));flashCombatText("player",`-${m[1]}`);setCombatHp(ehp,enemyMax,php,playerMax,`${r.e.name}造成 ${m[1]} 點傷害`);await baseSleep(actionDelay);continue}
   m=line.match(/^.+攻擊你，你閃避了攻擊。$/);
   if(m){attackMotion("enemy");await baseSleep(MAIN_WINDUP_DELAY);flashCombatText("player","閃避");setCombatHp(ehp,enemyMax,php,playerMax,`你閃避了${r.e.name}的攻擊`);await baseSleep(MAIN_NORMAL_DELAY)}
  }
  setCombatHp(ehp,enemyMax,php,playerMax,r.win?"戰鬥勝利！":"戰敗！");
  await baseSleep(MAIN_END_DELAY);
 };

 if(typeof window.maybeHandleSpecialEncounter==="function"){
  const baseMaybeHandleSpecialEncounter=window.maybeHandleSpecialEncounter;
  window.maybeHandleSpecialEncounter=async function(...args){
   specialPacingActive=true;
   try{return await baseMaybeHandleSpecialEncounter(...args);}
   finally{specialPacingActive=false;}
  };
 }
})();
