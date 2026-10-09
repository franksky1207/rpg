const fs=require("fs");
const vm=require("vm");
function assert(condition,message){if(!condition)throw new Error(message);}
const authCore=fs.readFileSync("gmruntimeauthorization.js","utf8");
const loader=fs.readFileSync("scriptgrouploader.js","utf8");
const ui=fs.readFileSync("ui.js","utf8");
const index=fs.readFileSync("index.html","utf8");

assert(/GM_RUNTIME_AUTHORIZATION_CORE_VERSION=VERSION/.test(authCore),"GM runtime authorization must have a startup owner.");
assert(/GM_RUNTIME_EARLY_RESTORE_VERSION=EARLY_RESTORE_VERSION/.test(authCore),"GM early restore must be owned by startup authorization core.");
assert(/GM_RUNTIME_LEGACY_RECONCILE_VERSION=LEGACY_RECONCILE_VERSION/.test(authCore),"Legacy GM save reconcile must be versioned.");
assert(/gmReconcileRuntimeAuthorizationAfterLoad=reconcileAfterLoad/.test(authCore),"Startup owner must expose post-load reconciliation.");
assert(!/stripLegacySaveAuthorization/.test(loader),"Deferred script loader must not perform legacy GM save cleanup.");
assert(/gmRuntimeAuthorizationAuthorized/.test(loader)&&/gmSetRuntimeAuthorization/.test(loader),"Deferred loader must delegate authorization state to startup owner.");
assert(/gmReconcileRuntimeAuthorizationAfterLoad/.test(ui),"UI startup must reconcile GM authorization after load.");
assert(/normalizeCurrentSaveState\(\);if\(typeof window\.gmReconcileRuntimeAuthorizationAfterLoad/.test(ui),"GM authorization must reconcile before startup save/render.");
const authPos=index.indexOf("gmruntimeauthorization.js");
const uiPos=index.indexOf('src="ui.js?');
assert(authPos>=0&&uiPos>authPos,"GM authorization startup owner must load before ui.js.");

function makeContext(authorized,initialGm){
 const storage=new Map(authorized?[["civilization-war-gm-authorized-v2-account-user-a","1"]]:[]);
 const before=[],settlement=[];
 const state={gm:initialGm===true};
 const window={civilizationAuthSession:{user:{id:"user-a"}},
  registerBeforeSaveHook:(id,fn)=>{before.push({id,fn});return true;},
  registerSaveSettlementHook:(id,fn)=>{settlement.push({id,fn});return true;},
  getBeforeSaveHookIds:()=>before.map(x=>x.id),
  getSaveSettlementHookIds:()=>settlement.map(x=>x.id)
 };
 const context={window,state,localStorage:{
  getItem:key=>storage.has(key)?storage.get(key):null,
  setItem:(key,value)=>storage.set(key,String(value)),
  removeItem:key=>storage.delete(key)
 },Object,String,console};
 vm.createContext(context);
 vm.runInContext(authCore,context,{filename:"gmruntimeauthorization.js"});
 return {window,state,before,settlement,storage};
}

const authorized=makeContext(true,false);
const a=authorized.window.gmReconcileRuntimeAuthorizationAfterLoad(authorized.state);
assert(a.authorized===true&&authorized.state.gm===true,"Authorized device must restore runtime GM immediately after save load.");
assert(a.legacyCleared===false,"Authorized runtime restore must not be misclassified as legacy cleanup.");
assert(authorized.window.GM_RUNTIME_EARLY_RESTORE_VERSION===2,"Early restore version must be V2.");
assert(authorized.before.length===1&&authorized.settlement.length===1,"GM save boundary must install exactly once.");
const saveContext={state:authorized.state};
authorized.before[0].fn(saveContext);
assert(saveContext.state.gm===false,"Before-save boundary must strip runtime GM flag.");
authorized.settlement[0].fn(saveContext);
assert(authorized.state.gm===true,"Save settlement must restore runtime GM flag.");

const legacy=makeContext(false,true);
const l=legacy.window.gmReconcileRuntimeAuthorizationAfterLoad(legacy.state);
assert(l.authorized===false&&l.legacyCleared===true&&legacy.state.gm===false,"Unauthorized legacy save gm=true must be cleared in-memory without a second save owner.");

const legacyDevice=makeContext(false,false);
legacyDevice.storage.set("civilization-war-gm-authorized-v1","1");
assert(legacyDevice.window.gmRuntimeAuthorizationAuthorized()===false,"Unscoped legacy GM flag must never authorize an account.");
legacyDevice.window.civilizationAuthSession={user:{id:"user-b"}};
assert(legacyDevice.window.gmRuntimeAuthorizationAuthorized()===false,"Different account must fail closed.");
legacyDevice.window.civilizationAuthSession={user:{id:"user-a"}};
assert(legacyDevice.window.gmSetRuntimeAuthorization(true)===true,"Explicitly authorized current account should persist.");
assert(legacyDevice.window.gmRuntimeAuthorizationAuthorized()===true,"Same signed-in account should restore.");
assert(legacyDevice.storage.has("civilization-war-gm-authorized-v1")===false,"Legacy device-wide grant must retire.");
legacyDevice.window.civilizationAuthSession={user:{id:"user-b"}};
assert(legacyDevice.window.gmRuntimeAuthorizationAuthorized()===false,"GM account A cannot authorize B.");
legacyDevice.window.gmClearCurrentRuntimeAuthorization("user-a");
legacyDevice.window.civilizationAuthSession={user:{id:"user-a"}};
assert(legacyDevice.window.gmRuntimeAuthorizationAuthorized()===false,"Signout must revoke current account grant.");

const clean=makeContext(false,false);
const n=clean.window.gmReconcileRuntimeAuthorizationAfterLoad(clean.state);
assert(n.authorized===false&&n.legacyCleared===false&&clean.state.gm===false,"Unauthorized clean save must remain fail-closed.");

console.log("GM runtime first-render authorization integrity passed");
