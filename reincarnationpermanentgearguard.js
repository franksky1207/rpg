(function(){
 const VERSION=2;
 const POLICY="fallback-only";
 const REQUIRED_WORLD=3;
 const REQUIRED_LEVEL=2000;
 const HOOK_ID="reincarnation-permanent-gear-levels";
 const FALLBACK_SLOTS=Object.freeze(["weapon","helmet","armor","shoes","accessory"]);
 let runs=0,repairRuns=0,totalRepairs=0,lastReport=null;

 function isObject(value){return !!value&&typeof value==="object"&&!Array.isArray(value);}
 function whole(value,fallback=0){const n=Math.floor(Number(value));return Number.isFinite(n)?n:fallback;}
 function slots(){return typeof EQUIPMENT_TYPES!=="undefined"&&Array.isArray(EQUIPMENT_TYPES)&&EQUIPMENT_TYPES.length?EQUIPMENT_TYPES:FALLBACK_SLOTS;}
 function eligibleLowerWorldRerun(target){
  return isObject(target)&&whole(target?.reincarnation?.count,0)>0&&target?.thirdWorld?.entered!==true;
 }
 function enforce(target,options={}){
  const count=Math.max(0,whole(target?.reincarnation?.count,0));
  const thirdWorldEntered=target?.thirdWorld?.entered===true;
  const reason=String(options?.reason||"runtime");
  let checked=0,repaired=0;
  if(eligibleLowerWorldRerun(target)){
   const repair=item=>{
    if(!isObject(item)||whole(item.world,0)!==REQUIRED_WORLD)return;
    checked++;
    if(whole(item.level,0)===REQUIRED_LEVEL)return;
    item.level=REQUIRED_LEVEL;
    repaired++;
   };
   if(isObject(target.equipment))slots().forEach(type=>repair(target.equipment[type]));
   if(Array.isArray(target.inventory))target.inventory.forEach(repair);
   if(Array.isArray(target.lostGear))target.lostGear.forEach(entry=>repair(entry?.item));
  }
  const report=Object.freeze({version:VERSION,policy:POLICY,applied:eligibleLowerWorldRerun(target),reason,count,thirdWorldEntered,checked,repaired,healthy:repaired===0});
  lastReport=report;runs++;
  if(repaired>0){repairRuns++;totalRepairs+=repaired;console.warn("[文明戰線] Reincarnation permanent gear save guard repaired a fallback-only invariant.",report);}
  return report;
 }
 function beforeSave(context){
  const report=enforce(context?.state,{reason:"before-save"});
  window.LAST_REINCARNATION_PERMANENT_GEAR_SAVE_GUARD_REPORT=report;
  return true;
 }
 function snapshot(){return Object.freeze({version:VERSION,policy:POLICY,runs,repairRuns,totalRepairs,lastReport});}

 window.REINCARNATION_PERMANENT_GEAR_SAVE_GUARD_VERSION=VERSION;
 window.REINCARNATION_PERMANENT_GEAR_SAVE_GUARD_POLICY=POLICY;
 window.REINCARNATION_PERMANENT_GEAR_REQUIRED_WORLD=REQUIRED_WORLD;
 window.REINCARNATION_PERMANENT_GEAR_REQUIRED_LEVEL=REQUIRED_LEVEL;
 window.REINCARNATION_PERMANENT_GEAR_SAVE_HOOK_ID=HOOK_ID;
 window.enforceReincarnationPermanentGearLevels=enforce;
 window.reincarnationPermanentGearSaveGuardSnapshot=snapshot;
 if(typeof window.registerBeforeSaveHook!=="function")throw new Error("Reincarnation permanent gear guard requires Save Hook Core.");
 window.registerBeforeSaveHook(HOOK_ID,beforeSave);
})();
