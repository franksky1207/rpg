const fs=require("fs");
const vm=require("vm");
function assert(condition,message){if(!condition)throw new Error(message);}
const read=file=>fs.readFileSync(file,"utf8");

const combat=read("combatcore.js");
const special=read("specialcore.js");
const universe=read("secondworldcombat.js");
const gmBackground=read("gmbackground.js");
const gmHub=read("gmhubextensions.js");

assert(/COMBAT_OPTIONAL_FULL_HP_LOCK_VERSION=1/.test(combat),"Combat Core 必須提供 opt-in 滿血鎖 V1。");
assert(/lockPlayerFullHp=options\.lockPlayerFullHp===true/.test(combat),"Combat Core 鎖血必須是預設關閉的明確 option。");
assert(/gmMainlineHpLockEnabled/.test(combat)&&/lockPlayerFullHp:gmMainlineHpLock/.test(combat),"銀河紀元 fightOnce 必須只透過 GM 主線鎖血 gate 傳入。");
assert(/SPECIAL_MAINLINE_HP_LOCK_SCOPE_VERSION=1/.test(special),"特殊怪必須具備主線 scope 標記。");
assert(/activeMainBattleContext\|\|window\.activeSecondWorldMainlineContext/.test(special),"特殊怪鎖血必須要求正式主線 context。");
assert(/SECOND_WORLD_MAINLINE_HP_LOCK_SCOPE_VERSION=1/.test(universe),"宇宙主線必須具備鎖血 scope 標記。");
assert(/activeSecondWorldMainlineContext/.test(universe)&&/lockPlayerFullHp:formalMainlineHpLockActive\(options\)/.test(universe),"宇宙鎖血必須只由正式主線 context／明確 option 啟用。");
assert(/GM_MAINLINE_HP_LOCK_MANAGEMENT_VERSION=1/.test(gmBackground),"GM 主線鎖血管理版本缺失。");
assert(/civilization_frontline_gm_mainline_hp_lock_v1_/.test(gmBackground),"GM 主線鎖血必須依帳號使用本機持續設定。");
assert(/gm-background-battle","gm-mainline-hp-lock","gm-combat-speed/.test(gmHub),"GM 管理排序必須為背景戰鬥 → 主線鎖血 → 戰鬥速度。");

const excluded=[
 "dungeonbounty.js","dungeonarena.js","dungeonvoid.js","mirrordungeonrun.js",
 "calamitycore.js","calamityrun.js","secondworldcalamityrun.js","secondworldcalamity.js",
 "gmpowerbenchmark.js","vipgm.js"
];
for(const file of excluded){
 const src=read(file);
 assert(!/gmMainlineHpLockEnabled|lockPlayerFullHp/.test(src),`${file} 不得接入 GM 主線鎖血。`);
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
const locked=context.window.runCombatCore(player,enemy,100,{rng,preparePresentation:false,lockPlayerFullHp:true});
assert(locked.win===true,"鎖血 ON 時同一場主線戰鬥必須能持續到擊敗敵人。");
assert(locked.hp===100&&locked.playerMaxHp===100,"鎖血 ON 時戰鬥結束 HP 必須保持滿血。");
const enemyHits=locked.events.filter(e=>e?.type==="attack"&&e?.actor==="enemy");
assert(enemyHits.length>0&&enemyHits.some(e=>e.actualDamage>0),"鎖血不得跳過敵方攻擊；傷害事件仍必須正常產生。");

console.log("GM mainline HP lock integrity passed");
