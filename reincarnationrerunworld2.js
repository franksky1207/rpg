(function(){
 const VERSION=1;
 const REGION_OWNER_SPLIT_VERSION=1;
 const KEY_BOSS_INDEXES=Object.freeze(Array.from({length:10},(_,index)=>9+index*10));
 const base=Object.freeze({
  canChallengeBoss:typeof window.canChallengeSecondWorldBoss==="function"?window.canChallengeSecondWorldBoss:null,
  bossVisible:typeof window.secondWorldBossVisible==="function"?window.secondWorldBossVisible:null,
  regionVisible:typeof window.secondWorldRegionVisible==="function"?window.secondWorldRegionVisible:null,
  calamityVisible:typeof window.isSecondWorldCalamityVisible==="function"?window.isSecondWorldCalamityVisible:null,
  calamityUnlockStatus:typeof window.getSecondWorldCalamityUnlockStatus==="function"?window.getSecondWorldCalamityUnlockStatus:null,
  calamityCanChallenge:typeof window.canChallengeSecondWorldCalamity==="function"?window.canChallengeSecondWorldCalamity:null,
  calamityStatus:typeof window.getSecondWorldCalamityStatus==="function"?window.getSecondWorldCalamityStatus:null
 });

 function stateTarget(target){
  if(target&&typeof target==="object")return target;
  try{return typeof state!=="undefined"&&state&&typeof state==="object"?state:null;}catch(_){return null;}
 }
 function whole(value,fallback=0){const n=Math.floor(Number(value));return Number.isFinite(n)?n:fallback;}
 function phase(target){
  if(typeof window.currentWorldPhase==="function")return Number(window.currentWorldPhase(target))||1;
  if(target?.thirdWorld?.entered===true)return 3;
  if(target?.secondWorld?.entered===true)return 2;
  return 1;
 }
 function context(target=null){
  const holder=stateTarget(target);
  const lifecycle=typeof window.worldReincarnationContext==="function"?window.worldReincarnationContext(holder):null;
  const active=!!holder&&holder?.secondWorld?.entered===true&&holder?.thirdWorld?.entered!==true&&lifecycle?.reincarnationRun===true&&phase(holder)===2;
  return Object.freeze({version:VERSION,active,count:Math.max(0,whole(lifecycle?.count,0)),lifeId:Math.max(0,whole(lifecycle?.lifeId,0)),firstRun:!active&&lifecycle?.reincarnationRun!==true,reincarnationRun:lifecycle?.reincarnationRun===true,world:phase(holder),source:lifecycle?"reincarnation-context":"fail-closed"});
 }
 function active(target=null){return context(target).active===true;}
 function validBoss(value){const n=whole(value,-1);return n>=0&&n<100?n:-1;}
 function validRegion(value){
  const row=typeof window.secondWorldRegion==="function"?window.secondWorldRegion(value):null;
  return row&&Number.isInteger(Number(row.index))?Math.floor(Number(row.index)):-1;
 }
 function bossKilled(index,target=null){const holder=stateTarget(target);return validBoss(index)>=0&&holder?.secondWorld?.mainline?.bossKilled?.[index]===true;}
 function keyBossCoverage(target=null){
  const holder=stateTarget(target);if(!active(holder))return 0;
  let coverage=0;
  KEY_BOSS_INDEXES.forEach((bossIndex,index)=>{if(bossKilled(bossIndex,holder))coverage=Math.max(coverage,index+1);});
  return coverage;
 }
 function baseRegionVisible(value,holder){return typeof base.regionVisible==="function"?base.regionVisible(value,holder):false;}
 function adventureRegionVisible(value,target=null){
  const holder=stateTarget(target),index=validRegion(value);if(index<0)return false;
  if(active(holder))return true;
  return baseRegionVisible(value,holder);
 }
 function arenaRegionEligible(value,target=null){
  const holder=stateTarget(target),index=validRegion(value);if(index<0)return false;
  if(!active(holder))return baseRegionVisible(value,holder);
  return index<Math.max(1,keyBossCoverage(holder));
 }
 function calamityDefinition(value){return typeof window.getSecondWorldCalamityDefinition==="function"?window.getSecondWorldCalamityDefinition(value):null;}
 function calamityUnlockStatus(value,target=null){
  const holder=stateTarget(target);
  if(!active(holder))return typeof base.calamityUnlockStatus==="function"?base.calamityUnlockStatus(value,holder):{visible:false,unlocked:false,challengeable:false,reason:"invalid",definition:null};
  const def=calamityDefinition(value);
  if(!def||!holder)return {visible:false,unlocked:false,challengeable:false,reason:"invalid",definition:def||null};
  const coverage=keyBossCoverage(holder),bossCleared=coverage>=Number(def.index)+1,civLevel=Math.max(0,Math.min(10,whole(holder?.secondWorld?.civilizationLevel,0))),previousCivilizationComplete=civLevel>=Math.max(0,whole(def.previousCivilizationLevel,0)),unlocked=bossCleared&&previousCivilizationComplete;
  return {visible:bossCleared,discovered:bossCleared,unlocked,challengeable:unlocked,reason:unlocked?"":(!bossCleared?"main-boss":"previous-civilization"),definition:def,mainBossCleared:bossCleared,previousCivilizationComplete,civilizationLevel:civLevel,requiredCivilizationLevel:Math.max(0,whole(def.previousCivilizationLevel,0)),rerunCoverage:coverage};
 }
 function calamityStatus(value,target=null){
  const holder=stateTarget(target),original=typeof base.calamityStatus==="function"?base.calamityStatus(value,holder):null;
  if(!active(holder))return original;
  const unlock=calamityUnlockStatus(value,holder);if(!original)return null;
  return {...original,visible:unlock.visible,discovered:unlock.visible,unlocked:unlock.unlocked,challengeable:unlock.challengeable,unlock};
 }

 window.SECOND_WORLD_REINCARNATION_RERUN_POLICY_VERSION=VERSION;
 window.SECOND_WORLD_REINCARNATION_REGION_OWNER_SPLIT_VERSION=REGION_OWNER_SPLIT_VERSION;
 window.SECOND_WORLD_REINCARNATION_KEY_BOSSES=KEY_BOSS_INDEXES.slice();
 window.secondWorldReincarnationRerunContext=context;
 window.isSecondWorldReincarnationRerun=active;
 window.secondWorldRerunKeyBossCoverage=keyBossCoverage;
 window.secondWorldAdventureRegionVisible=adventureRegionVisible;
 window.secondWorldArenaRegionEligible=arenaRegionEligible;
 window.secondWorldRerunPolicySnapshot=function(target=null){const holder=stateTarget(target),ctx=context(holder);return {...ctx,keyBossCoverage:keyBossCoverage(holder),bossCount:Number(window.SECOND_WORLD_BOSS_COUNT||100),regionCount:Number(window.SECOND_WORLD_REGION_COUNT||10),regionOwnerSplitVersion:REGION_OWNER_SPLIT_VERSION};};

 window.canChallengeSecondWorldBoss=function(value,target=null){
  const holder=stateTarget(target),index=validBoss(value);
  if(active(holder))return index>=0;
  return typeof base.canChallengeBoss==="function"?base.canChallengeBoss(value,holder):false;
 };
 window.secondWorldBossVisible=function(value,target=null){
  const holder=stateTarget(target),index=validBoss(value);
  if(active(holder))return index>=0;
  return typeof base.bossVisible==="function"?base.bossVisible(value,holder):false;
 };
 // secondWorldRegionVisible retains its original adventure-visibility meaning for compatibility.
 // Arena progression consumes secondWorldArenaRegionEligible explicitly, so the two semantics no longer share one owner.
 window.secondWorldRegionVisible=function(value,target=null){return adventureRegionVisible(value,target);};

 window.isSecondWorldCalamityVisible=function(value,target=null){
  const holder=stateTarget(target);
  if(active(holder))return calamityUnlockStatus(value,holder).visible===true;
  return typeof base.calamityVisible==="function"?base.calamityVisible(value,holder):false;
 };
 window.getSecondWorldCalamityUnlockStatus=calamityUnlockStatus;
 window.canChallengeSecondWorldCalamity=function(value,target=null){
  const holder=stateTarget(target);
  if(active(holder))return calamityUnlockStatus(value,holder).challengeable===true;
  return typeof base.calamityCanChallenge==="function"?base.calamityCanChallenge(value,holder):false;
 };
 window.getSecondWorldCalamityStatus=calamityStatus;
})();
