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
assert(/GM_MAINLINE_HP_LOCK_PRESENTATION_VERSION=1/.test(gmBackground),"GM 主線鎖血顯示橋接版本缺失。");
assert(/civilization_frontline_gm_mainline_hp_lock_v1_/.test(gmBackground),"GM 主線鎖血必須依帳號使用本機持續設定。");
assert(/resolvedActualDamage,actualDamage:0,playerHpLocked:true/.test(gmBackground),"鎖血呈現必須保留真實承傷但阻止 HP 顯示下降。");
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
assert(enemyHits.length>0&&enemyHits.some(e=>e.actualDamage>0),"戰鬥核心仍必須保留敵方真實承傷事件，不能靠清零傷害達成鎖血。");

const presentationContext={
 window:{
  prepareCombatPresentation:(result,options)=>({result,options}),
  civilizationAuth:{getUser:()=>({id:"test-user"})},
  registerGmHubSection:()=>true
 },
 document:{
  readyState:"complete",
  getElementById:()=>({}),
  createElement:()=>({style:{},classList:{},appendChild:()=>{}}),
  head:{appendChild:()=>{}},
  addEventListener:()=>{}
 },
 localStorage:{getItem:()=>"1",setItem:()=>{}},
 alert:()=>{},
 console,
 Math
};
vm.createContext(presentationContext);
vm.runInContext(gmBackground,presentationContext,{filename:"gmbackground.js"});
const raw={events:[
 {type:"attack",actor:"enemy",damage:250,actualDamage:100},
 {type:"attack",actor:"player",damage:10,actualDamage:10}
]};
const unlockedPresentation=presentationContext.window.gmMainlineHpLockPresentationResult(raw,{lockPlayerFullHp:false});
assert(unlockedPresentation===raw,"鎖血 OFF 時呈現資料不得被改寫。");
const lockedPresentation=presentationContext.window.gmMainlineHpLockPresentationResult(raw,{lockPlayerFullHp:true});
assert(lockedPresentation!==raw,"鎖血 ON 時呈現資料應使用隔離副本。");
assert(lockedPresentation.events[0].actualDamage===0,"鎖血 ON 時玩家血條不得因敵方攻擊下降。");
assert(lockedPresentation.events[0].resolvedActualDamage===100,"鎖血呈現仍必須保留真實承傷資料。");
assert(lockedPresentation.events[0].damage===250,"鎖血呈現仍必須保留原傷害數字。");
assert(lockedPresentation.events[1].actualDamage===10,"玩家對敵人的傷害呈現不得被鎖血功能修改。");

console.log("GM mainline HP lock integrity passed");
