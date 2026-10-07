const fs=require("fs");
const vm=require("vm");
function assert(condition,message){if(!condition)throw new Error(message);}
const read=file=>fs.readFileSync(file,"utf8");
const prefs=read("gmdevicepreferences.js");
const speed=read("combatspeed.js");
const backgroundUi=read("gmbackground.js");
const loader=read("scriptgrouploader.js");

assert(/GM_RUNTIME_DEVICE_PREFERENCE_AUTH_SYNC_VERSION=AUTH_SYNC_VERSION/.test(prefs),"GM device preferences must expose auth-sync version.");
assert(/GM_RUNTIME_DEVICE_PREFERENCE_ACCOUNT_RECONCILE_VERSION=ACCOUNT_RECONCILE_VERSION/.test(prefs),"GM device preferences must expose account-reconcile version.");
assert(/civilization-auth-ready/.test(prefs),"GM device preferences must listen for civilization-auth-ready.");
assert(/COMBAT_SPEED_GM_AUTH_SYNC_VERSION=GM_AUTH_SYNC_VERSION/.test(speed),"GM combat speed must expose auth-sync version.");
assert(/gmSyncCombatSpeedFromAuth=syncGmOverrideFromAuth/.test(speed),"GM combat speed must expose auth sync helper.");
assert(!/civilization_frontline_gm_background_battle_v1_|civilization_frontline_gm_mainline_hp_lock_v1_/.test(backgroundUi),"GM background UI must not know runtime preference storage keys.");
assert(/gmSetBackgroundBattlePreference/.test(backgroundUi)&&/gmSetMainlineHpLockPreference/.test(backgroundUi),"GM background UI must delegate writes to semantic preference APIs.");
assert(/return ensureAuthorizedGmRuntime\(\{retry:true\}\)/.test(loader),"First GM password authorization must reuse the authorized retry owner.");

let userId="";
const listeners={};
const events=[];
let backgroundActive=true;
let backgroundStopCount=0;
const storage=new Map([
 ["civilization_frontline_gm_background_battle_v1_user-a","1"],
 ["civilization_frontline_gm_mainline_hp_lock_v1_user-a","1"],
 ["civilization_frontline_gm_combat_speed_v1_user-a","2"],
 ["civilization_frontline_gm_background_battle_v1_user-b","0"],
 ["civilization_frontline_gm_mainline_hp_lock_v1_user-b","0"],
 ["civilization_frontline_gm_combat_speed_v1_user-b","1.5"]
]);
const state={settings:{combatSpeed:1},secondWorld:{entered:false},thirdWorld:{entered:false},reincarnation:{count:0}};
const window={
 civilizationAuth:{getUser:()=>userId?{id:userId}:null},
 civilizationAuthSession:null,
 addEventListener:(name,fn)=>{(listeners[name]||(listeners[name]=[])).push(fn);},
 dispatchEvent:event=>{events.push(event);for(const fn of listeners[event.type]||[])fn(event);return true;},
 backgroundProgressIsActive:()=>backgroundActive,
 backgroundProgressStop:()=>{if(!backgroundActive)return false;backgroundActive=false;backgroundStopCount+=1;return true;}
};
const context={
 window,state,localStorage:{
  getItem:key=>storage.has(key)?storage.get(key):null,
  setItem:(key,value)=>storage.set(key,String(value)),
  removeItem:key=>storage.delete(key)
 },
 CustomEvent:function(type,options){this.type=type;this.detail=options?.detail||null;},
 Object,Array,String,Number,Math,console
};
vm.createContext(context);
vm.runInContext(speed,context,{filename:"combatspeed.js"});
vm.runInContext(prefs,context,{filename:"gmdevicepreferences.js"});

assert(window.gmBackgroundBattleEnabled()===false,"Before auth user id is ready, background battle must fail closed.");
assert(window.gmMainlineHpLockEnabled()===false,"Before auth user id is ready, mainline HP lock must fail closed.");
assert(window.gmCombatSpeedOverride()===null,"Before auth user id is ready, GM 2x override must be unavailable.");

userId="user-a";
window.civilizationAuthSession={user:{id:"user-a"}};
window.dispatchEvent(new CustomEvent("civilization-auth-ready",{detail:{session:window.civilizationAuthSession}}));

assert(window.gmBackgroundBattleEnabled()===true,"After auth-ready, existing background battle preference must restore immediately.");
assert(window.gmMainlineHpLockEnabled()===true,"After auth-ready, existing HP lock preference must restore immediately.");
assert(window.gmMainlineHpLockActive("world1-mainline")===true,"Restored HP lock must immediately gate W1 mainline.");
assert(window.gmCombatSpeedOverride()===2,"After auth-ready, existing GM 2x override must restore immediately.");
assert(window.effectiveCombatSpeed()===2,"After auth-ready, effective combat speed must immediately become 2x.");
assert(events.some(e=>e.type==="gm-runtime-preferences-ready"&&e.detail?.userId==="user-a"&&e.detail?.backgroundBattle===true&&e.detail?.mainlineHpLock===true),"Auth-ready must broadcast restored GM runtime device preferences.");
assert(events.some(e=>e.type==="combat-speed-change"&&e.detail?.source==="auth-ready"&&e.detail?.effectiveSpeed===2),"Auth-ready must broadcast restored GM combat speed.");

const prefEventsBefore=events.filter(e=>e.type==="gm-runtime-preferences-ready").length;
const speedEventsBefore=events.filter(e=>e.type==="combat-speed-change"&&e.detail?.source==="auth-ready").length;
window.dispatchEvent(new CustomEvent("civilization-auth-ready",{detail:{session:window.civilizationAuthSession}}));
assert(events.filter(e=>e.type==="gm-runtime-preferences-ready").length===prefEventsBefore,"Duplicate auth-ready for the same account/state must not rebroadcast GM preferences.");
assert(events.filter(e=>e.type==="combat-speed-change"&&e.detail?.source==="auth-ready").length===speedEventsBefore,"Duplicate auth-ready for the same account/speed must not rebroadcast combat speed.");

userId="user-b";
window.civilizationAuthSession={user:{id:"user-b"}};
backgroundActive=true;
window.dispatchEvent(new CustomEvent("civilization-auth-ready",{detail:{session:window.civilizationAuthSession}}));
assert(window.gmBackgroundBattleEnabled()===false,"Account switch must read the new account background preference.");
assert(window.gmMainlineHpLockEnabled()===false,"Account switch must read the new account HP-lock preference.");
assert(window.gmCombatSpeedOverride()===1.5,"Account switch must read the new account GM speed preference.");
assert(backgroundStopCount===1&&backgroundActive===false,"Switching to an account with background battle disabled must stop the active background flow immediately.");
const switched=events.filter(e=>e.type==="gm-runtime-preferences-ready").at(-1)?.detail;
assert(switched?.accountChanged===true&&switched?.backgroundFlowStopped===true,"Account switch preference event must report reconciliation results.");

assert(window.gmSetBackgroundBattlePreference(true)===true,"Semantic background preference setter must work.");
assert(storage.get("civilization_frontline_gm_background_battle_v1_user-b")==="1","Semantic background setter must preserve the existing storage key.");
assert(window.gmSetMainlineHpLockPreference(true)===true,"Semantic HP-lock preference setter must work.");
assert(storage.get("civilization_frontline_gm_mainline_hp_lock_v1_user-b")==="1","Semantic HP-lock setter must preserve the existing storage key.");

console.log("GM runtime auth preference sync integrity passed");
