(function(){
 const VERSION=1;
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
   console.warn("[文明戰線] 銀河回顧戰偵測到正式 state 變動，已自動還原。",lastRestoration);
   return true;
  }catch(error){
   console.error("[文明戰線] 銀河回顧正式 state 還原失敗。",error);
   return false;
  }
 }
 function protectAsync(ownerName,source){
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

 const protectedOwners={
  adventure:protectAsync("startGalaxyReviewBattle","adventure"),
  calamity:protectAsync("startGalaxyCalamityReview","calamity")
 };
 const errors=[];
 if(!protectedOwners.adventure)errors.push({code:"ADVENTURE_REVIEW_OWNER_MISSING"});
 if(!protectedOwners.calamity)errors.push({code:"CALAMITY_REVIEW_OWNER_MISSING"});

 window.GALAXY_REVIEW_FORMAL_STATE_GUARD_VERSION=VERSION;
 window.getGalaxyReviewFormalStateGuardReport=function(){return {version:VERSION,protectedOwners:{...protectedOwners},restorationCount,lastRestoration:lastRestoration?{...lastRestoration}:null,passed:errors.length===0,errors:errors.slice()};};
 window.GALAXY_REVIEW_FORMAL_STATE_GUARD_INTEGRITY=window.getGalaxyReviewFormalStateGuardReport();
 if(errors.length)console.error("[文明戰線] Galaxy review formal-state guard integrity error",errors);
})();
