(function(){
 const ALTERNATE_UNIVERSE_ACCESS_VERSION=1;
 const UNLOCK_TRANSACTION_LABEL="alternate-universe-permanent-unlock";
 function currentState(){try{return typeof state!=="undefined"&&state&&typeof state==="object"?state:(window.state&&typeof window.state==="object"?window.state:null);}catch(_){return window.state&&typeof window.state==="object"?window.state:null;}}
 function alreadyUnlocked(target=currentState()){return typeof window.alternateUniverseUnlocked==="function"?window.alternateUniverseUnlocked(target)===true:target?.reincarnation?.alternateUniverse?.unlocked===true;}
 function thirdWorldAllDefeated(target=currentState()){
  if(!target)return false;
  if(typeof window.thirdWorldBossesAllDefeated==="function")return window.thirdWorldBossesAllDefeated(target)===true;
  const rows=target?.thirdWorld?.bosses;
  return Array.isArray(rows)&&rows.length===10&&rows.every(row=>Math.max(0,Math.floor(Number(row?.currentHp)||0))===0);
 }
 function unlockEligible(target=currentState()){return alreadyUnlocked(target)||thirdWorldAllDefeated(target);}
 function homeEntryVisible(target=currentState()){return unlockEligible(target);}
 function ensurePermanentUnlock(target=currentState()){
  if(!target)return Object.freeze({ok:false,reason:"state-missing",saved:false,unlocked:false});
  if(alreadyUnlocked(target))return Object.freeze({ok:true,reason:"",saved:false,unlocked:true,alreadyUnlocked:true});
  if(!thirdWorldAllDefeated(target))return Object.freeze({ok:false,reason:"third-world-bosses-incomplete",saved:false,unlocked:false});
  if(typeof window.runSettlementTransaction!=="function")return Object.freeze({ok:false,reason:"transaction-owner-missing",saved:false,unlocked:false});
  const tx=window.runSettlementTransaction({
   label:UNLOCK_TRANSACTION_LABEL,
   mutate:root=>{
    if(alreadyUnlocked(root))return {unlocked:true,alreadyUnlocked:true};
    if(!thirdWorldAllDefeated(root))return {ok:false,reason:"third-world-bosses-incomplete"};
    const alternate=root?.reincarnation?.alternateUniverse;
    if(!alternate||typeof alternate!=="object")return {ok:false,reason:"alternate-universe-state-missing"};
    alternate.unlocked=true;
    return {unlocked:true,alreadyUnlocked:false};
   }
  });
  if(!tx?.ok)return Object.freeze({ok:false,reason:String(tx?.reason||"transaction-failed"),saved:false,unlocked:false,transaction:tx||null});
  return Object.freeze({ok:true,reason:"",saved:tx.saved===true,unlocked:true,alreadyUnlocked:tx.value?.alreadyUnlocked===true,transaction:tx});
 }
 window.ALTERNATE_UNIVERSE_ACCESS_VERSION=ALTERNATE_UNIVERSE_ACCESS_VERSION;
 window.ALTERNATE_UNIVERSE_UNLOCK_TRANSACTION_LABEL=UNLOCK_TRANSACTION_LABEL;
 window.alternateUniverseThirdWorldCompletionReached=thirdWorldAllDefeated;
 window.alternateUniverseUnlockEligible=unlockEligible;
 window.alternateUniverseHomeEntryVisible=homeEntryVisible;
 window.ensureAlternateUniversePermanentUnlock=ensurePermanentUnlock;
})();
