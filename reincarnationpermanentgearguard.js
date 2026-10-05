(function(){
 const VERSION=1;
 const REQUIRED_WORLD=3;
 const REQUIRED_LEVEL=2000;
 const HOOK_ID="reincarnation-permanent-gear-levels";
 const FALLBACK_SLOTS=Object.freeze(["weapon","helmet","armor","shoes","accessory"]);

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
  if(!eligibleLowerWorldRerun(target))return Object.freeze({version:VERSION,applied:false,reason,count,thirdWorldEntered,checked:0,repaired:0});
  let checked=0,repaired=0;
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
  return Object.freeze({version:VERSION,applied:true,reason,count,thirdWorldEntered:false,checked,repaired});
 }
 function beforeSave(context){
  const report=enforce(context?.state,{reason:"before-save"});
  window.LAST_REINCARNATION_PERMANENT_GEAR_SAVE_GUARD_REPORT=report;
  return true;
 }

 window.REINCARNATION_PERMANENT_GEAR_SAVE_GUARD_VERSION=VERSION;
 window.REINCARNATION_PERMANENT_GEAR_REQUIRED_WORLD=REQUIRED_WORLD;
 window.REINCARNATION_PERMANENT_GEAR_REQUIRED_LEVEL=REQUIRED_LEVEL;
 window.REINCARNATION_PERMANENT_GEAR_SAVE_HOOK_ID=HOOK_ID;
 window.enforceReincarnationPermanentGearLevels=enforce;
 if(typeof window.registerBeforeSaveHook!=="function")throw new Error("Reincarnation permanent gear guard requires Save Hook Core.");
 window.registerBeforeSaveHook(HOOK_ID,beforeSave);
})();
