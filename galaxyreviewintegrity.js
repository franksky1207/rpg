(function(){
 const VERSION=2;
 const ADVENTURE_VALIDATION_POLICY_VERSION=1;
 const LEGACY_RESTORE_POLICY_VERSION=1;
 let restorationCount=0;
 let lastRestoration=null;

 function snapshotFormalState(){
  try{return JSON.stringify(state);}catch(error){return null;}
 }
 function restoreFormalState(snapshot,source){
  if(!snapshot)return false;
  let parsed;
  try{parsed=JSON.parse(snapshot);}catch(error){return false;}
  try{
   state=parsed;
   if(typeof window.normalizeDungeonSaveState==="function")window.normalizeDungeonSaveState(state,{timestamp:Date.now(),mirrorOptions:{recoverInterrupted:false}});
   restorationCount++;
   lastRestoration={source:String(source||"unknown"),at:Date.now()};
   console.warn("[文明戰線] 銀河舊回顧流程偵測到正式 state 變動，已自動還原。",lastRestoration);
   return true;
  }catch(error){
   console.error("[文明戰線] 銀河舊回顧正式 state 還原失敗。",error);
   return false;
  }
 }
 function protectAsyncRestore(ownerName,source){
  const original=window[ownerName];
  if(typeof original!=="function"||original.__galaxyReviewFormalStateGuard===true)return false;
  const guarded=async function(...args){
   const before=snapshotFormalState();
   try{return await original.apply(this,args);}
   finally{
    if(before!=null){
     const after=snapshotFormalState();
     if(after!==before)restoreFormalState(before,source);
    }
   }
  };
  guarded.__galaxyReviewFormalStateGuard=true;
  guarded.__galaxyReviewOriginal=original;
  window[ownerName]=guarded;
  return true;
 }
 function validateAdventureOwner(){
  return typeof window.startGalaxyReviewBattle==="function"
   &&Number(window.GALAXY_REVIEW_LOCAL_HP_ISOLATION_VERSION)===1
   &&Number(window.GALAXY_REVIEW_SYNC_STATE_VALIDATION_VERSION)===1;
 }

 const protectedOwners={
  adventure:validateAdventureOwner(),
  calamity:protectAsyncRestore("startGalaxyCalamityReview","calamity")
 };
 const errors=[];
 if(!protectedOwners.adventure)errors.push({code:"ADVENTURE_REVIEW_OWNER_MISSING"});
 if(!protectedOwners.calamity)errors.push({code:"CALAMITY_REVIEW_OWNER_MISSING"});

 window.GALAXY_REVIEW_FORMAL_STATE_GUARD_VERSION=VERSION;
 window.GALAXY_REVIEW_ADVENTURE_VALIDATION_POLICY_VERSION=ADVENTURE_VALIDATION_POLICY_VERSION;
 window.GALAXY_REVIEW_LEGACY_RESTORE_POLICY_VERSION=LEGACY_RESTORE_POLICY_VERSION;
 window.getGalaxyReviewFormalStateGuardReport=function(){return {version:VERSION,adventureValidationPolicyVersion:ADVENTURE_VALIDATION_POLICY_VERSION,legacyRestorePolicyVersion:LEGACY_RESTORE_POLICY_VERSION,adventureMode:"owner-sync-validation",calamityMode:"legacy-async-restore",protectedOwners:{...protectedOwners},restorationCount,lastRestoration:lastRestoration?{...lastRestoration}:null,passed:errors.length===0,errors:errors.slice()};};
 window.GALAXY_REVIEW_FORMAL_STATE_GUARD_INTEGRITY=window.getGalaxyReviewFormalStateGuardReport();
 if(errors.length)console.error("[文明戰線] Galaxy review formal-state guard integrity error",errors);
})();
