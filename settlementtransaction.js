(function(){
 const VERSION=2;
 const ROLLBACK_IDENTITY_VERSION=1;
 const NESTED_REFERENCE_VERSION=1;
 let active=false;

 function currentState(){try{return typeof state!=="undefined"&&state&&typeof state==="object"?state:null;}catch(_){return null;}}
 function isRecord(value){return !!value&&typeof value==="object"&&!Array.isArray(value);}
 function snapshotState(target=currentState()){if(!target)return null;try{return JSON.stringify(target);}catch(_){return null;}}
 function restoreNode(target,source){
  if(Array.isArray(source)){
   if(!Array.isArray(target))return source;
   for(let index=0;index<source.length;index++){
    const next=source[index],current=target[index];
    if(Array.isArray(next)&&Array.isArray(current))restoreNode(current,next);
    else if(isRecord(next)&&isRecord(current))restoreNode(current,next);
    else target[index]=next;
   }
   target.length=source.length;
   return target;
  }
  if(isRecord(source)){
   if(!isRecord(target))return source;
   Object.keys(target).forEach(key=>{if(!Object.prototype.hasOwnProperty.call(source,key))delete target[key];});
   Object.keys(source).forEach(key=>{
    const next=source[key],current=target[key];
    if(Array.isArray(next)&&Array.isArray(current))restoreNode(current,next);
    else if(isRecord(next)&&isRecord(current))restoreNode(current,next);
    else target[key]=next;
   });
   return target;
  }
  return source;
 }
 function restoreState(snapshot,target=currentState()){
  if(typeof snapshot!=="string"||!snapshot||!target||typeof target!=="object")return false;
  try{
   const parsed=JSON.parse(snapshot);
   if(!parsed||typeof parsed!=="object")return false;
   restoreNode(target,parsed);
   if(currentState()!==target){try{state=target;}catch(_){return false;}}
   return currentState()===target;
  }catch(_){return false;}
 }
 function fail(reason,extra={}){return Object.freeze({ok:false,reason:String(reason||"transaction-failed"),rolledBack:extra.rolledBack===true,saved:false,label:String(extra.label||""),error:extra.error?String(extra.error):null,value:extra.value??null});}
 function runSettlementTransaction(options={}){
  const label=String(options.label||"settlement");
  if(active)return fail("transaction-busy",{label});
  if(typeof options.mutate!=="function")return fail("mutator-missing",{label});
  const root=currentState();
  if(!root)return fail("state-missing",{label});
  const before=snapshotState(root);
  if(!before)return fail("snapshot-failed",{label});
  const saveFn=typeof options.saveFn==="function"?options.saveFn:(typeof save==="function"?save:null);
  if(typeof saveFn!=="function")return fail("save-owner-missing",{label});
  active=true;
  try{
   const value=options.mutate(root);
   if(currentState()!==root){const rolledBack=restoreState(before,root);return fail("state-identity-drift",{label,rolledBack,value});}
   if(value===false||value?.ok===false){const rolledBack=restoreState(before,root);return fail(value?.reason||"mutation-rejected",{label,rolledBack,value});}
   let saved=false;
   try{saved=saveFn(false)===true;}catch(error){const rolledBack=restoreState(before,root);return fail("save-exception",{label,rolledBack,error:error?.message||error,value});}
   if(currentState()!==root){const rolledBack=restoreState(before,root);return fail("state-identity-drift",{label,rolledBack,value});}
   if(!saved){const rolledBack=restoreState(before,root);return fail("save-failed",{label,rolledBack,value});}
   return Object.freeze({ok:true,reason:"",rolledBack:false,saved:true,label,value:value??null});
  }catch(error){const rolledBack=restoreState(before,root);return fail("mutation-exception",{label,rolledBack,error:error?.message||error});}
  finally{active=false;}
 }
 function validateRestoreIdentity(){
  const root={level:10,nested:{value:2,child:{x:3}},rows:[{id:1},2],removeMe:true};
  const nested=root.nested,child=root.nested.child,rows=root.rows,row0=root.rows[0],snapshot=JSON.stringify(root);
  root.level=99;root.nested.value=8;root.nested.child.x=9;root.rows[0].id=7;root.rows.push({id:3});delete root.removeMe;root.extra=true;
  const parsed=JSON.parse(snapshot);restoreNode(root,parsed);
  return root.level===10&&root.nested===nested&&root.nested.child===child&&root.rows===rows&&root.rows[0]===row0&&root.nested.value===2&&root.nested.child.x===3&&root.rows.length===2&&root.rows[0].id===1&&root.removeMe===true&&!Object.prototype.hasOwnProperty.call(root,"extra");
 }
 function validate(){
  const errors=[];
  if(typeof runSettlementTransaction!=="function")errors.push({code:"TRANSACTION_API"});
  if(currentState()&&snapshotState()==null)errors.push({code:"SNAPSHOT_OWNER"});
  if(!validateRestoreIdentity())errors.push({code:"ROLLBACK_IDENTITY"});
  return Object.freeze({version:VERSION,rollbackIdentityVersion:ROLLBACK_IDENTITY_VERSION,nestedReferenceVersion:NESTED_REFERENCE_VERSION,passed:errors.length===0,errors:Object.freeze(errors)});
 }

 window.SHARED_SETTLEMENT_TRANSACTION_VERSION=VERSION;
 window.SHARED_SETTLEMENT_ROLLBACK_IDENTITY_VERSION=ROLLBACK_IDENTITY_VERSION;
 window.SHARED_SETTLEMENT_NESTED_REFERENCE_VERSION=NESTED_REFERENCE_VERSION;
 window.runSettlementTransaction=runSettlementTransaction;
 window.SETTLEMENT_TRANSACTION_INTEGRITY=validate();
 if(!window.SETTLEMENT_TRANSACTION_INTEGRITY.passed)console.error("[文明戰線] Shared settlement transaction integrity error",window.SETTLEMENT_TRANSACTION_INTEGRITY.errors);
})();