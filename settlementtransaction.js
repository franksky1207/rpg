(function(){
 const VERSION=1;
 let active=false;

 function currentState(){try{return typeof state!=="undefined"&&state&&typeof state==="object"?state:null;}catch(_){return null;}}
 function snapshotState(){const target=currentState();if(!target)return null;try{return JSON.stringify(target);}catch(_){return null;}}
 function restoreState(snapshot){if(typeof snapshot!=="string"||!snapshot)return false;try{state=JSON.parse(snapshot);return true;}catch(_){return false;}}
 function fail(reason,extra={}){return Object.freeze({ok:false,reason:String(reason||"transaction-failed"),rolledBack:extra.rolledBack===true,saved:false,label:String(extra.label||""),error:extra.error?String(extra.error):null,value:extra.value??null});}
 function runSettlementTransaction(options={}){
  const label=String(options.label||"settlement");
  if(active)return fail("transaction-busy",{label});
  if(typeof options.mutate!=="function")return fail("mutator-missing",{label});
  if(!currentState())return fail("state-missing",{label});
  const before=snapshotState();
  if(!before)return fail("snapshot-failed",{label});
  const saveFn=typeof options.saveFn==="function"?options.saveFn:(typeof save==="function"?save:null);
  if(typeof saveFn!=="function")return fail("save-owner-missing",{label});
  active=true;
  try{
   const value=options.mutate(currentState());
   if(value===false||value?.ok===false){const rolledBack=restoreState(before);return fail(value?.reason||"mutation-rejected",{label,rolledBack,value});}
   let saved=false;
   try{saved=saveFn(false)===true;}catch(error){const rolledBack=restoreState(before);return fail("save-exception",{label,rolledBack,error:error?.message||error,value});}
   if(!saved){const rolledBack=restoreState(before);return fail("save-failed",{label,rolledBack,value});}
   return Object.freeze({ok:true,reason:"",rolledBack:false,saved:true,label,value:value??null});
  }catch(error){const rolledBack=restoreState(before);return fail("mutation-exception",{label,rolledBack,error:error?.message||error});}
  finally{active=false;}
 }
 function validate(){
  const errors=[];
  if(typeof runSettlementTransaction!=="function")errors.push({code:"TRANSACTION_API"});
  if(currentState()&&snapshotState()==null)errors.push({code:"SNAPSHOT_OWNER"});
  return Object.freeze({version:VERSION,passed:errors.length===0,errors:Object.freeze(errors)});
 }

 window.SHARED_SETTLEMENT_TRANSACTION_VERSION=VERSION;
 window.runSettlementTransaction=runSettlementTransaction;
 window.SETTLEMENT_TRANSACTION_INTEGRITY=validate();
 if(!window.SETTLEMENT_TRANSACTION_INTEGRITY.passed)console.error("[文明戰線] Shared settlement transaction integrity error",window.SETTLEMENT_TRANSACTION_INTEGRITY.errors);
})();