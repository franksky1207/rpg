(function(){
 const VERSION=1;
 const RATE_PER_LEVEL=.03;

 function currentState(){try{return typeof state!=="undefined"&&state&&typeof state==="object"?state:null;}catch(_){return null;}}
 function targetState(target=null){return target&&typeof target==="object"?target:currentState();}
 function wholeLevel(value){return Math.max(1,Math.floor(Number(value)||1));}
 function rerunActive(target=null){
  const s=targetState(target);
  if(!s)return false;
  if(typeof window.isReincarnationRun==="function")return window.isReincarnationRun(s)===true;
  return Math.max(0,Math.floor(Number(s?.reincarnation?.count)||0))>0;
 }
 function reincarnationOverlevelRewardMultiplier(playerLevel,enemyLevel,target=null){
  const s=targetState(target),player=wholeLevel(playerLevel),enemy=wholeLevel(enemyLevel);
  if(!s||!rerunActive(s)||enemy<=player)return 1;
  return 1+RATE_PER_LEVEL*(enemy-player);
 }
 function applyReincarnationOverlevelIntegerReward(amount,playerLevel,enemyLevel,target=null){
  const base=Math.max(0,Number(amount)||0),multiplier=reincarnationOverlevelRewardMultiplier(playerLevel,enemyLevel,target);
  return multiplier>1?Math.max(0,Math.ceil(base*multiplier)):Math.max(0,Math.ceil(base));
 }
 function applyBattleStoneBonus(result,playerLevel,enemyLevel,target){
  const source=result?.enhancementStones&&typeof result.enhancementStones==="object"?result.enhancementStones:{basic:0,advanced:0};
  const baseBasic=Math.max(0,Math.floor(Number(source.basic)||0)),baseAdvanced=Math.max(0,Math.floor(Number(source.advanced)||0));
  const finalBasic=applyReincarnationOverlevelIntegerReward(baseBasic,playerLevel,enemyLevel,target),finalAdvanced=applyReincarnationOverlevelIntegerReward(baseAdvanced,playerLevel,enemyLevel,target);
  const bonusBasic=Math.max(0,finalBasic-baseBasic),bonusAdvanced=Math.max(0,finalAdvanced-baseAdvanced);
  if((bonusBasic>0||bonusAdvanced>0)&&typeof window.addEnhancementStones==="function")window.addEnhancementStones(bonusBasic,bonusAdvanced);
  return {basic:finalBasic,advanced:finalAdvanced};
 }
 function applyWorld1OnlineOverlevelReward(result,playerLevel,target=null){
  const s=targetState(target);
  if(!s||result?.ok!==true||result?.win!==true)return result;
  const enemyLevel=wholeLevel(result?.e?.level),multiplier=reincarnationOverlevelRewardMultiplier(playerLevel,enemyLevel,s);
  if(!(multiplier>1))return result;
  const baseXp=Math.max(0,Math.floor(Number(result.xp)||0)),baseGold=Math.max(0,Math.floor(Number(result.gold)||0));
  const finalXp=applyReincarnationOverlevelIntegerReward(baseXp,playerLevel,enemyLevel,s),finalGold=applyReincarnationOverlevelIntegerReward(baseGold,playerLevel,enemyLevel,s);
  const bonusXp=Math.max(0,finalXp-baseXp),bonusGold=Math.max(0,finalGold-baseGold);
  if(bonusGold>0)s.gold=Math.max(0,Math.floor(Number(s.gold)||0))+bonusGold;
  if(bonusXp>0){
   const logs=Array.isArray(result.logs)?result.logs:[];
   if(typeof window.gainEffectiveExp==="function")window.gainEffectiveExp(bonusXp,logs);else if(typeof gainExp==="function")gainExp(bonusXp,logs);
  }
  const enhancementStones=applyBattleStoneBonus(result,playerLevel,enemyLevel,s);
  if(Array.isArray(result.logs)){
   const exact=`${result.e?.name||"敵人"}被擊敗。獲得 EXP +${baseXp}、金幣 +${baseGold}。`;
   const index=result.logs.indexOf(exact);
   if(index>=0)result.logs[index]=`${result.e?.name||"敵人"}被擊敗。獲得 EXP +${finalXp}、金幣 +${finalGold}。`;
  }
  result.xp=finalXp;
  result.gold=finalGold;
  result.enhancementStones=enhancementStones;
  result.overlevelRewardMultiplier=multiplier;
  if(typeof save==="function")save(false);
  return result;
 }

 const originalFightOnce=typeof window.fightOnce==="function"?window.fightOnce:null;
 if(originalFightOnce){
  const wrapped=function(...args){
   const target=currentState(),playerLevel=wholeLevel(target?.level),result=originalFightOnce.apply(this,args);
   return applyWorld1OnlineOverlevelReward(result,playerLevel,target);
  };
  fightOnce=wrapped;
  window.fightOnce=wrapped;
 }

 function validate(){
  const first={reincarnation:{count:0}},rerun={reincarnation:{count:1}},errors=[];
  if(reincarnationOverlevelRewardMultiplier(100,500,first)!==1)errors.push({code:"FIRST_RUN_ISOLATION"});
  if(reincarnationOverlevelRewardMultiplier(500,500,rerun)!==1||reincarnationOverlevelRewardMultiplier(600,500,rerun)!==1)errors.push({code:"NO_OVERLEVEL_NO_BONUS"});
  if(Math.abs(reincarnationOverlevelRewardMultiplier(100,500,rerun)-13)>1e-9)errors.push({code:"GAP_400",actual:reincarnationOverlevelRewardMultiplier(100,500,rerun)});
  if(Math.abs(reincarnationOverlevelRewardMultiplier(1,1000,rerun)-30.97)>1e-9)errors.push({code:"NO_CAP",actual:reincarnationOverlevelRewardMultiplier(1,1000,rerun)});
  if(applyReincarnationOverlevelIntegerReward(1,100,105,rerun)!==2)errors.push({code:"INTEGER_CEIL"});
  return {passed:errors.length===0,version:VERSION,ratePerLevel:RATE_PER_LEVEL,errors};
 }

 window.REINCARNATION_OVERLEVEL_REWARD_VERSION=VERSION;
 window.REINCARNATION_OVERLEVEL_RATE_PER_LEVEL=RATE_PER_LEVEL;
 window.reincarnationOverlevelRewardMultiplier=reincarnationOverlevelRewardMultiplier;
 window.applyReincarnationOverlevelIntegerReward=applyReincarnationOverlevelIntegerReward;
 window.applyWorld1OnlineOverlevelReward=applyWorld1OnlineOverlevelReward;
 window.REINCARNATION_OVERLEVEL_REWARD_INTEGRITY=validate();
 if(!window.REINCARNATION_OVERLEVEL_REWARD_INTEGRITY.passed)console.error("[文明戰線] Reincarnation overlevel reward integrity error",window.REINCARNATION_OVERLEVEL_REWARD_INTEGRITY.errors);
})();
