(function(){
 const VERSION=1;
 const RATE_PER_LEVEL=.03;
 const W1_ADAPTER_VERSION=2;
 const FIGHT_WRAPPER_RETIRED_VERSION=1;

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
 const BREAKTHROUGH_YIELD_RATE=.01;
 function rewardStateSnapshot(target=null){
  const s=targetState(target);
  return s?{...s,specializations:{...s.specializations},reincarnation:{...s.reincarnation,breakthrough:{...s.reincarnation?.breakthrough}}}:null;
 }
 function breakthroughYieldLevel(target=null){return Math.max(0,Math.floor(Number(targetState(target)?.reincarnation?.breakthrough?.permanent)||0));}
 // Raw means before specialization. Currency B0 keeps legacy ceil(spec) -> ceil(overlevel).
 // Materials floor the complete value, with the historical overlevel ceil as a
 // lower bound: B1 cannot turn an unboosted unit into two or reduce an old award.
 // Offline callers request the unrounded expectation, then apply the common rate.
 function calculateReincarnationYield(base,{specialization="none",target=null,playerLevel=null,enemyLevel=null,integer=true,resource=false,useTest=false,overlevelMultiplier=null}={}){
  const s=targetState(target),raw=Math.max(0,Number(base)||0);
  const spec=specialization==="none"?1:(typeof window.specializationMultiplierForState==="function"?window.specializationMultiplierForState(specialization,s,useTest):typeof window.specializationMultiplier==="function"?window.specializationMultiplier(specialization,useTest):1);
  const overlevel=overlevelMultiplier==null?(playerLevel==null||enemyLevel==null?1:reincarnationOverlevelRewardMultiplier(playerLevel,enemyLevel,s)):Math.max(1,Number(overlevelMultiplier)||1);
  const level=breakthroughYieldLevel(s),value=raw*(spec+level*BREAKTHROUGH_YIELD_RATE)*overlevel;
  if(!integer)return Math.max(0,value);
  const legacy=Math.ceil(Math.ceil(raw*spec)*overlevel);
  if(resource)return Math.max(legacy,Math.floor(value+1e-10));
  return Math.max(legacy,Math.ceil(value-1e-10));
 }
 function applyReincarnationOverlevelIntegerReward(amount,playerLevel,enemyLevel,target=null){
  const base=Math.max(0,Number(amount)||0),multiplier=reincarnationOverlevelRewardMultiplier(playerLevel,enemyLevel,target);
  return multiplier>1?Math.max(0,Math.ceil(base*multiplier)):Math.max(0,Math.ceil(base));
 }
 // Compatibility alias only. Formal combat now calculates before granting.
 // Keeping this no-op prevents an old consumer from issuing a second award.
 function applyWorld1OnlineOverlevelReward(result){return result;}

 function validate(){
  const first={reincarnation:{count:0}},rerun={reincarnation:{count:1}},errors=[];
  const yield130={reincarnation:{count:1,breakthrough:{permanent:130}}};
  if(calculateReincarnationYield(100,{target:yield130})!==230)errors.push({code:"BREAKTHROUGH_YIELD_130"});
  if(calculateReincarnationYield(1,{target:yield130})!==3)errors.push({code:"BREAKTHROUGH_YIELD_INTEGER"});
  if(reincarnationOverlevelRewardMultiplier(100,500,first)!==1)errors.push({code:"FIRST_RUN_ISOLATION"});
  if(reincarnationOverlevelRewardMultiplier(500,500,rerun)!==1||reincarnationOverlevelRewardMultiplier(600,500,rerun)!==1)errors.push({code:"NO_OVERLEVEL_NO_BONUS"});
  if(Math.abs(reincarnationOverlevelRewardMultiplier(100,500,rerun)-13)>1e-9)errors.push({code:"GAP_400",actual:reincarnationOverlevelRewardMultiplier(100,500,rerun)});
  if(Math.abs(reincarnationOverlevelRewardMultiplier(1,1000,rerun)-30.97)>1e-9)errors.push({code:"NO_CAP",actual:reincarnationOverlevelRewardMultiplier(1,1000,rerun)});
  if(applyReincarnationOverlevelIntegerReward(1,100,105,rerun)!==2)errors.push({code:"INTEGER_CEIL"});
  return {passed:errors.length===0,version:VERSION,ratePerLevel:RATE_PER_LEVEL,w1AdapterVersion:W1_ADAPTER_VERSION,fightWrapperRetiredVersion:FIGHT_WRAPPER_RETIRED_VERSION,errors};
 }

 window.REINCARNATION_OVERLEVEL_REWARD_VERSION=VERSION;
 window.REINCARNATION_OVERLEVEL_RATE_PER_LEVEL=RATE_PER_LEVEL;
 window.REINCARNATION_OVERLEVEL_W1_ADAPTER_VERSION=W1_ADAPTER_VERSION;
 window.REINCARNATION_OVERLEVEL_FIGHT_WRAPPER_RETIRED_VERSION=FIGHT_WRAPPER_RETIRED_VERSION;
 window.reincarnationOverlevelRewardMultiplier=reincarnationOverlevelRewardMultiplier;
 window.calculateReincarnationYield=calculateReincarnationYield;
 window.reincarnationYieldStateSnapshot=rewardStateSnapshot;
 window.REINCARNATION_SHARED_YIELD_VERSION=1;
 window.REINCARNATION_POST_SETTLEMENT_TOPUP_RETIRED_VERSION=1;
 window.reincarnationBreakthroughYieldLevel=breakthroughYieldLevel;
 window.applyReincarnationOverlevelIntegerReward=applyReincarnationOverlevelIntegerReward;
 window.applyWorld1OnlineOverlevelReward=applyWorld1OnlineOverlevelReward;
 window.REINCARNATION_OVERLEVEL_REWARD_INTEGRITY=validate();
 if(!window.REINCARNATION_OVERLEVEL_REWARD_INTEGRITY.passed)console.error("[文明戰線] Reincarnation overlevel reward integrity error",window.REINCARNATION_OVERLEVEL_REWARD_INTEGRITY.errors);
})();
