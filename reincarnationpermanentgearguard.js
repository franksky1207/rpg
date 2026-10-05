(function(){
 const VERSION=3;
 const POLICY="evidence-gated-fallback-only";
 const RECOVERY_POLICY_VERSION=1;
 const REQUIRED_WORLD=3;
 const REQUIRED_LEVEL=2000;
 const HOOK_ID="reincarnation-permanent-gear-levels";
 const FALLBACK_SLOTS=Object.freeze(["weapon","helmet","armor","shoes","accessory"]);
 const LEGACY_REWARD_ID_PATTERN=/^reward-3-2000-/;
 let runs=0,repairRuns=0,totalRepairs=0,totalAmbiguous=0,lastReport=null;

 function isObject(value){return !!value&&typeof value==="object"&&!Array.isArray(value);}
 function whole(value,fallback=0){const n=Math.floor(Number(value));return Number.isFinite(n)?n:fallback;}
 function slots(){return typeof EQUIPMENT_TYPES!=="undefined"&&Array.isArray(EQUIPMENT_TYPES)&&EQUIPMENT_TYPES.length?EQUIPMENT_TYPES:FALLBACK_SLOTS;}
 function eligibleLowerWorldRerun(target){
  return isObject(target)&&whole(target?.reincarnation?.count,0)>0&&target?.thirdWorld?.entered!==true;
 }
 function retentionMarkerEvidence(item){
  const marker=item?.reincarnationPermanentGear;
  return isObject(marker)&&whole(marker.version,0)>=1&&whole(marker.retainedWorld,0)===REQUIRED_WORLD&&whole(marker.retainedLevel,0)===REQUIRED_LEVEL;
 }
 function legacyRewardIdEvidence(item){return LEGACY_REWARD_ID_PATTERN.test(String(item?.id||""));}
 function recoveryEvidence(item){
  if(!isObject(item)||whole(item.world,0)!==REQUIRED_WORLD)return Object.freeze({recoverable:false,kind:"not-world3"});
  if(retentionMarkerEvidence(item))return Object.freeze({recoverable:true,kind:"retention-marker"});
  if(legacyRewardIdEvidence(item))return Object.freeze({recoverable:true,kind:"legacy-reward-id"});
  return Object.freeze({recoverable:false,kind:"ambiguous"});
 }
 function classify(item,target){
  if(!eligibleLowerWorldRerun(target)||!isObject(item)||whole(item.world,0)!==REQUIRED_WORLD)return Object.freeze({status:"ignored",evidence:"none"});
  if(whole(item.level,0)===REQUIRED_LEVEL)return Object.freeze({status:"valid",evidence:retentionMarkerEvidence(item)?"retention-marker":legacyRewardIdEvidence(item)?"legacy-reward-id":"current-level"});
  const evidence=recoveryEvidence(item);
  return Object.freeze({status:evidence.recoverable?"recoverable":"ambiguous",evidence:evidence.kind});
 }
 function enforce(target,options={}){
  const count=Math.max(0,whole(target?.reincarnation?.count,0));
  const thirdWorldEntered=target?.thirdWorld?.entered===true;
  const reason=String(options?.reason||"runtime");
  let checked=0,valid=0,recoverable=0,repaired=0,ambiguous=0;
  const evidenceCounts={retentionMarker:0,legacyRewardId:0};
  if(eligibleLowerWorldRerun(target)){
   const inspect=item=>{
    if(!isObject(item)||whole(item.world,0)!==REQUIRED_WORLD)return;
    checked++;
    const row=classify(item,target);
    if(row.status==="valid"){valid++;return;}
    if(row.status==="recoverable"){
     recoverable++;
     if(row.evidence==="retention-marker")evidenceCounts.retentionMarker++;
     if(row.evidence==="legacy-reward-id")evidenceCounts.legacyRewardId++;
     item.level=REQUIRED_LEVEL;
     repaired++;
     return;
    }
    if(row.status==="ambiguous")ambiguous++;
   };
   if(isObject(target.equipment))slots().forEach(type=>inspect(target.equipment[type]));
   if(Array.isArray(target.inventory))target.inventory.forEach(inspect);
   if(Array.isArray(target.lostGear))target.lostGear.forEach(entry=>inspect(entry?.item));
  }
  const report=Object.freeze({version:VERSION,policy:POLICY,recoveryPolicyVersion:RECOVERY_POLICY_VERSION,applied:eligibleLowerWorldRerun(target),reason,count,thirdWorldEntered,checked,valid,recoverable,repaired,ambiguous,evidence:Object.freeze({...evidenceCounts}),healthy:repaired===0&&ambiguous===0});
  lastReport=report;runs++;totalAmbiguous+=ambiguous;
  if(repaired>0){repairRuns++;totalRepairs+=repaired;console.warn("[文明戰線] Reincarnation permanent gear save guard repaired evidence-backed historical corruption.",report);}
  if(ambiguous>0)console.warn("[文明戰線] Reincarnation permanent gear save guard found ambiguous W3 gear and left it unchanged.",report);
  return report;
 }
 function beforeSave(context){
  const report=enforce(context?.state,{reason:"before-save"});
  window.LAST_REINCARNATION_PERMANENT_GEAR_SAVE_GUARD_REPORT=report;
  return true;
 }
 function snapshot(){return Object.freeze({version:VERSION,policy:POLICY,recoveryPolicyVersion:RECOVERY_POLICY_VERSION,runs,repairRuns,totalRepairs,totalAmbiguous,lastReport});}

 window.REINCARNATION_PERMANENT_GEAR_SAVE_GUARD_VERSION=VERSION;
 window.REINCARNATION_PERMANENT_GEAR_SAVE_GUARD_POLICY=POLICY;
 window.REINCARNATION_PERMANENT_GEAR_RECOVERY_POLICY_VERSION=RECOVERY_POLICY_VERSION;
 window.REINCARNATION_PERMANENT_GEAR_REQUIRED_WORLD=REQUIRED_WORLD;
 window.REINCARNATION_PERMANENT_GEAR_REQUIRED_LEVEL=REQUIRED_LEVEL;
 window.REINCARNATION_PERMANENT_GEAR_SAVE_HOOK_ID=HOOK_ID;
 window.reincarnationPermanentGearRecoveryEvidence=recoveryEvidence;
 window.classifyReincarnationPermanentGearRecovery=classify;
 window.enforceReincarnationPermanentGearLevels=enforce;
 window.reincarnationPermanentGearSaveGuardSnapshot=snapshot;
 if(typeof window.registerBeforeSaveHook!=="function")throw new Error("Reincarnation permanent gear guard requires Save Hook Core.");
 window.registerBeforeSaveHook(HOOK_ID,beforeSave);
})();
