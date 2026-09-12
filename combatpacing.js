(function(){
 const baseSleep=window.sleep;
 if(typeof baseSleep!=="function")return;

 const MAIN_START_DELAY=120;
 const MAIN_WINDUP_DELAY=70;
 const MAIN_NORMAL_DELAY=115;
 const MAIN_BOSS_DELAY=160;
 const MAIN_END_DELAY=170;
 const MAIN_PRE_DELAY=60;
 const MAIN_NORMAL_GAP=140;
 const MAIN_ELITE_GAP=220;
 const SPECIAL_DELAY_MAP=new Map([
  [180,120],
  [120,70],
  [190,115],
  [220,135],
  [250,170]
 ]);
 let specialPacingActive=false;

 function mainFlowSleep(ms){
  const n=Math.max(0,Number(ms)||0);
  if(typeof window.backgroundProgressSleep==="function"&&typeof window.backgroundProgressIsActive==="function"&&window.backgroundProgressIsActive("main"))return window.backgroundProgressSleep(n,"main");
  return baseSleep(n);
 }

 window.createCombatPlaybackState=function(result,startPlayerHp,playerMaxHp){
  const events=Array.isArray(result?.events)?result.events:[];
  const maxHp=Math.max(1,Math.floor(Number(playerMaxHp)||1));
  let playerHp=Math.max(0,Math.min(maxHp,Math.floor(Number(startPlayerHp)||0)));
  let eventIndex=0;
  function consumePlayerAttackDrain(){
   let attack=null;
   while(eventIndex<events.length){
    const ev=events[eventIndex++];
    if(ev?.type==="attack"&&ev.actor==="player"){attack=ev;break;}
   }
   if(!attack)return {healed:0,hp:playerHp};
   const drain=events[eventIndex];
   if(drain?.type!=="drain")return {healed:0,hp:playerHp};
   eventIndex++;
   const healed=Math.max(0,Math.floor(Number(drain.healed)||0));
   if(healed>0)playerHp=Math.min(maxHp,playerHp+healed);
   return {healed,hp:playerHp};
  }
  function applyEnemyDamage(amount){
   playerHp=Math.max(0,playerHp-Math.max(0,Math.floor(Number(amount)||0)));
   return playerHp;
  }
  return {consumePlayerAttackDrain,applyEnemyDamage,currentHp:()=>playerHp,maxHp};
 };

 window.estimateMainBattleDurationMs=function(result){
  const r=result&&typeof result==="object"?result:{};
  const actionDelay=r?.e?.kind==="boss"?MAIN_BOSS_DELAY:MAIN_NORMAL_DELAY;
  const events=Array.isArray(r.events)?r.events:[];
  let actions=events.filter(ev=>ev&&(ev.type==="attack"||ev.type==="dodge")).length;
  if(!actions)actions=Math.max(1,Math.floor(Number(r.turns)||1));
  const gap=r?.e?.kind==="elite"?MAIN_ELITE_GAP:MAIN_NORMAL_GAP;
  return MAIN_PRE_DELAY+MAIN_START_DELAY+actions*(MAIN_WINDUP_DELAY+actionDelay)+MAIN_END_DELAY+gap;
 };

 window.sleep=function(ms){
  const n=Number(ms)||0;
  const paced=specialPacingActive?(SPECIAL_DELAY_MAP.get(n)??n):n;
  return mainFlowSleep(paced);
 };

 window.animateFight=async function(r,startPlayerHp,playerMax,enemyMax,roundText=""){
  let ehp=enemyMax;
  const playback=window.createCombatPlaybackState(r,startPlayerHp,playerMax);
  let php=playback.currentHp();
  const actionDelay=r?.e?.kind==="boss"?MAIN_BOSS_DELAY:MAIN_NORMAL_DELAY;
  async function applyDrainAfterAttack(){
   const drain=playback.consumePlayerAttackDrain();
   php=drain.hp;
   if(drain.healed<=0)return;
   setCombatHp(ehp,enemyMax,php,playerMax,`汲取恢復 ${drain.healed} HP`);
   await mainFlowSleep(Math.max(110,actionDelay));
  }
  setCombatHp(ehp,enemyMax,php,playerMax,roundText?`${roundText}・開始戰鬥`:"開始戰鬥");
  await mainFlowSleep(MAIN_START_DELAY);
  for(const line of r.logs){
   let m=line.match(/^你攻擊.+，暴擊造成 (\d+) 點傷害。$/);
   if(m){attackMotion("player");await mainFlowSleep(MAIN_WINDUP_DELAY);ehp=Math.max(0,ehp-(+m[1]));flashCombatText("enemy",`暴擊 -${m[1]}`);setCombatHp(ehp,enemyMax,php,playerMax,`暴擊！你造成 ${m[1]} 點傷害`);await mainFlowSleep(actionDelay);await applyDrainAfterAttack();continue}
   m=line.match(/^你攻擊.+，造成 (\d+) 點傷害。$/);
   if(m){attackMotion("player");await mainFlowSleep(MAIN_WINDUP_DELAY);ehp=Math.max(0,ehp-(+m[1]));flashCombatText("enemy",`-${m[1]}`);setCombatHp(ehp,enemyMax,php,playerMax,`你造成 ${m[1]} 點傷害`);await mainFlowSleep(actionDelay);await applyDrainAfterAttack();continue}
   m=line.match(/^你攻擊.+，.+閃避了攻擊。$/);
   if(m){attackMotion("player");await mainFlowSleep(MAIN_WINDUP_DELAY);flashCombatText("enemy","閃避");setCombatHp(ehp,enemyMax,php,playerMax,`${r.e.name}閃避了你的攻擊`);await mainFlowSleep(MAIN_NORMAL_DELAY);continue}
   m=line.match(/^.+攻擊你，暴擊造成 (\d+) 點傷害。$/);
   if(m){attackMotion("enemy");await mainFlowSleep(MAIN_WINDUP_DELAY);php=playback.applyEnemyDamage(+m[1]);flashCombatText("player",`暴擊 -${m[1]}`);setCombatHp(ehp,enemyMax,php,playerMax,`${r.e.name}暴擊造成 ${m[1]} 點傷害`);await mainFlowSleep(actionDelay);continue}
   m=line.match(/^.+攻擊你，造成 (\d+) 點傷害。$/);
   if(m){attackMotion("enemy");await mainFlowSleep(MAIN_WINDUP_DELAY);php=playback.applyEnemyDamage(+m[1]);flashCombatText("player",`-${m[1]}`);setCombatHp(ehp,enemyMax,php,playerMax,`${r.e.name}造成 ${m[1]} 點傷害`);await mainFlowSleep(actionDelay);continue}
   m=line.match(/^.+攻擊你，你閃避了攻擊。$/);
   if(m){attackMotion("enemy");await mainFlowSleep(MAIN_WINDUP_DELAY);flashCombatText("player","閃避");setCombatHp(ehp,enemyMax,php,playerMax,`你閃避了${r.e.name}的攻擊`);await mainFlowSleep(MAIN_NORMAL_DELAY)}
  }
  setCombatHp(ehp,enemyMax,php,playerMax,r.win?"戰鬥勝利！":"戰敗！");
  await mainFlowSleep(MAIN_END_DELAY);
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