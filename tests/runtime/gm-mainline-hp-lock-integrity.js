const fs=require("fs");
const vm=require("vm");
function assert(condition,message){if(!condition)throw new Error(message);}
const read=file=>fs.readFileSync(file,"utf8");

const combat=read("combatcore.js");
const combatFx=read("combatfx.js");
const special=read("specialcore.js");
const universe=read("secondworldcombat.js");
const gmBackground=read("gmbackground.js");
const gmHub=read("gmhubextensions.js");

assert(/COMBAT_OPTIONAL_FULL_HP_LOCK_VERSION=1/.test(combat),"Combat Core 必須提供 opt-in 滿血鎖 V1。");
assert(/COMBAT_FULL_HP_LOCK_START_NORMALIZATION_VERSION=1/.test(combat),"Combat Core 必須將鎖血戰鬥起始 HP 正規化為滿血。");
assert(/lockPlayerFullHp=options\.lockPlayerFullHp===true/.test(combat),"Combat Core 鎖血必須是預設關閉的明確 option。");
assert(/gmMainlineHpLockActive\("world1-mainline"\)/.test(combat),"銀河紀元 fightOnce 必須透過正式 GM 主線鎖血 gate。");
assert(/COMBAT_FULL_HP_LOCK_PRESENTATION_VERSION=1/.test(combatFx),"Combat FX 必須正式擁有鎖血呈現 V1。");
assert(/lockPlayerFullHp=options\.lockPlayerFullHp===true/.test(combatFx),"Combat FX 必須直接理解 lockPlayerFullHp option。");
assert(/if\(p\.lockPlayerFullHp\)p\.playerHp=p\.playerMaxHp/.test(combatFx),"鎖血呈現時玩家 HP 不得下降。");
assert(/GM_MAINLINE_HP_LOCK_GATE_VERSION=1/.test(gmBackground),"GM 主線鎖血必須有統一正式 gate。");
assert(/gmMainlineHpLockActive=mainlineHpLockActive/.test(gmBackground),"GM 主線鎖血正式 gate 必須由 GM preference owner 輸出。");
assert(/GM_DEVICE_BOOLEAN_PREFERENCE_VERSION=1/.test(gmBackground),"GM 裝置布林偏好必須有共用 owner V1。");
assert(/gmDevicePreferenceStorageKey=devicePreferenceStorageKey/.test(gmBackground),"GM 裝置偏好 storage key helper 必須正式輸出。");
assert(/gmDeviceBooleanPreferenceEnabled=deviceBooleanPreferenceEnabled/.test(gmBackground),"GM 裝置偏好讀取 helper 必須正式輸出。");
assert(/gmSetDeviceBooleanPreference=setDeviceBooleanPreference/.test(gmBackground),"GM 裝置偏好寫入 helper 必須正式輸出。");
assert(!/installMainlineHpLockPresentationBridge|gmMainlineHpLockPresentationResult|__gmMainlineHpLockWrapped/.test(gmBackground),"GM 設定 owner 不得再 monkey-patch Combat Presentation。");
assert(/SPECIAL_MAINLINE_HP_LOCK_SCOPE_VERSION=2/.test(special),"特殊怪必須使用共享主線鎖血 scope V2。");
assert(/gmMainlineHpLockActive\("special"\)/.test(special),"特殊怪正式鎖血必須只走共享 GM gate。");
assert(/explicitHpLock=options\.lockPlayerFullHp===true/.test(special),"特殊怪 explicit test override 必須與正式 GM gate 分離命名。");
assert(/SECOND_WORLD_MAINLINE_HP_LOCK_SCOPE_VERSION=2/.test(universe),"宇宙主線必須使用共享鎖血 scope V2。");
assert(/gmMainlineHpLockActive\("world2-mainline"\)/.test(universe),"宇宙正式鎖血必須只走共享 GM gate。");
assert(/explicitHpLock=options\.lockPlayerFullHp===true/.test(universe),"宇宙 explicit test override 必須與正式 GM gate 分離命名。");
assert(/GM_MAINLINE_HP_LOCK_MANAGEMENT_VERSION=1/.test(gmBackground),"GM 主線鎖血管理版本缺失。");
assert(/civilization_frontline_gm_mainline_hp_lock_v1_/.test(gmBackground),"GM 主線鎖血必須沿用既有 v1 帳號本機 key。");
assert(/gm-background-battle","gm-mainline-hp-lock","gm-combat-speed/.test(gmHub),"GM 管理排序必須為背景戰鬥 → 主線鎖血 → 戰鬥速度。");

const excluded=[
 "dungeonbounty.js","dungeonarena.js","dungeonvoid.js","mirrordungeonrun.js",
 "calamitycore.js","calamityrun.js","secondworldcalamityrun.js","secondworldcalamity.js",
 "gmpowerbenchmark.js","vipgm.js"
];
for(const file of excluded){
 const src=read(file);
 assert(!/gmMainlineHpLockActive|gmMainlineHpLockEnabled|lockPlayerFullHp/.test(src),`${file} 不得接入 GM 主線鎖血。`);
}

const saveOwners=["savemigration.js","cloudsave.js","gmdata.js"];
for(const file of saveOwners){
 const src=read(file);
 assert(!/gmMainlineHpLock|civilization_frontline_gm_mainline_hp_lock/.test(src),`${file} 不得把 GM 主線鎖血寫入正式 save／cloud／GM JSON 資料。`);
}

const context={
 window:{MARK_KEYS:[]},
 Math,
 console,
 CRIT_DAMAGE_MULTIPLIER:1.5,
 ceil:Math.ceil,
 calcDamage:(atk,def)=>Math.max(1,Math.ceil((Number(atk)||0)-(Number(def)||0)*.55))
};
vm.createContext(context);
vm.runInContext(combat,context,{filename:"combatcore.js"});
const player={hp:100,atk:10,def:0,crit:0,dodge:0};
const enemy={name:"測試敵人",hp:20,atk:200,def:0,crit:0,dodge:0};
const rng=()=>.99;
const normal=context.window.runCombatCore(player,enemy,100,{rng,preparePresentation:false});
assert(normal.win===false&&normal.hp===0,"鎖血 OFF 時原本會死亡的戰鬥必須仍會死亡。");
const locked=context.window.runCombatCore(player,enemy,30,{rng,preparePresentation:false,lockPlayerFullHp:true});
assert(locked.win===true,"鎖血 ON 時同一場主線戰鬥必須能持續到擊敗敵人。");
assert(locked.hp===100&&locked.playerMaxHp===100,"鎖血 ON 時戰鬥結束 HP 必須保持滿血。");
assert(locked.playerStartHp===100,"鎖血 ON 且原始 HP 非滿血時，正式戰鬥起始 HP 必須回報滿血。");
const enemyHits=locked.events.filter(e=>e?.type==="attack"&&e?.actor==="enemy");
assert(enemyHits.length>0&&enemyHits.some(e=>e.actualDamage>0),"戰鬥核心仍必須保留敵方真實承傷事件，不能靠清零傷害達成鎖血。");

let activeUserId="legacy-user";
const storage=new Map([["civilization_frontline_gm_mainline_hp_lock_v1_legacy-user","1"]]);
const preferenceContext={
 window:{
  civilizationAuth:{getUser:()=>activeUserId?{id:activeUserId}:null},
  registerGmHubSection:()=>true
 },
 document:{getElementById:()=>({})},
 localStorage:{
  getItem:key=>storage.has(key)?storage.get(key):null,
  setItem:(key,value)=>storage.set(key,String(value))
 },
 alert:()=>{},
 render:()=>{},
 console,
 Math
};
vm.createContext(preferenceContext);
vm.runInContext(gmBackground,preferenceContext,{filename:"gmbackground.js"});
const pref=preferenceContext.window;
assert(pref.GM_DEVICE_BOOLEAN_PREFERENCE_VERSION===1,"GM device preference runtime 版本必須為1。");
assert(pref.gmMainlineHpLockStorageKey()==="civilization_frontline_gm_mainline_hp_lock_v1_legacy-user","既有 v1 主線鎖血 key 格式不得改名。");
assert(pref.gmMainlineHpLockEnabled()===true,"既有 v1 localStorage=1 必須直接沿用，不得要求 migration。");
assert(pref.gmMainlineHpLockActive("world1-mainline")===true,"銀河正式主線在既有開啟狀態下必須生效。");
assert(pref.gmMainlineHpLockActive("world2-mainline")===false,"沒有宇宙正式主線 context 時不得套用鎖血。");
pref.activeSecondWorldMainlineContext={id:"runtime"};
assert(pref.gmMainlineHpLockActive("world2-mainline")===true,"宇宙正式主線 context 存在時必須套用鎖血。");
assert(pref.gmMainlineHpLockActive("special")===true,"宇宙主線中的特殊怪必須套用鎖血。");
delete pref.activeSecondWorldMainlineContext;
assert(pref.gmMainlineHpLockActive("special")===false,"沒有正式主線 context 的特殊怪不得套用鎖血。");
pref.activeMainBattleContext={id:"world1"};
assert(pref.gmMainlineHpLockActive("special")===true,"銀河主線中的特殊怪必須套用鎖血。");
delete pref.activeMainBattleContext;
assert(pref.gmMainlineHpLockActive("unknown")===false,"未知 scope 必須 fail-closed。");

activeUserId="other-user";
assert(pref.gmMainlineHpLockEnabled()===false,"切換帳號後不得沿用另一帳號的 GM 主線鎖血狀態。");
assert(pref.gmSetMainlineHpLock(true)===true,"新帳號必須能獨立開啟 GM 主線鎖血。");
assert(storage.get("civilization_frontline_gm_mainline_hp_lock_v1_other-user")==="1","新帳號必須寫入自己的 v1 key。");
assert(storage.get("civilization_frontline_gm_mainline_hp_lock_v1_legacy-user")==="1","切換帳號不得改寫原帳號設定。");
assert(pref.gmSetBackgroundBattle(true)===true,"背景戰鬥應共用 device preference owner 並可獨立寫入。");
assert(storage.get("civilization_frontline_gm_background_battle_v1_other-user")==="1","背景戰鬥必須維持既有獨立 key。");
assert(storage.get("civilization_frontline_gm_mainline_hp_lock_v1_other-user")==="1","背景戰鬥設定不得覆寫主線鎖血設定。");

activeUserId="legacy-user";
assert(pref.gmSetMainlineHpLock(false)===true,"原帳號必須能獨立關閉主線鎖血。");
assert(storage.get("civilization_frontline_gm_mainline_hp_lock_v1_legacy-user")==="0","原帳號關閉狀態必須持續保存在原 v1 key。");
assert(storage.get("civilization_frontline_gm_mainline_hp_lock_v1_other-user")==="1","原帳號關閉不得影響其他帳號。");
activeUserId="";
assert(pref.gmMainlineHpLockEnabled()===false&&pref.gmMainlineHpLockStorageKey()==="","未登入帳號時主線鎖血必須 fail-closed 且不得產生匿名 key。");

console.log("GM mainline HP lock integrity passed");
