const fs=require("fs");
const vm=require("vm");
function assert(condition,message){if(!condition)throw new Error(message);}
const read=file=>fs.readFileSync(file,"utf8");
const engine=read("engine.js");
const progression=read("vipprogression.js");
const vipUi=read("vipui.js");
const vipGm=read("vipgm.js");
const guide=read("gameguide.js");
const gmHub=read("gmhubextensions.js");
const contract=read("integritycontract.js");

assert(/VIP_PROGRESSION_VERSION=14/.test(progression),"VIP progression 應為 V14。");
assert(/VIP_UNBOUNDED_LEVEL_VERSION=1/.test(progression),"VIP 無上限 owner 標記缺失。");
assert(/VIP_PERK_MAX_LEVEL=20/.test(progression),"VIP 特權上限應固定為20。");
assert(!/Math\.min\(VIP_MAX_LEVEL/.test(progression),"VIP progression 不得再以 VIP_MAX_LEVEL 封頂正式等級。");
assert(/VIP_ENGINE_LEGACY_CAP_RETIRED_VERSION=1/.test(engine),"engine 必須標記舊 VIP20 cap owner 已退休。");
assert(!/VIP_MAX_LEVEL/.test(engine),"engine 不得再持有 VIP_MAX_LEVEL 舊上限。");
assert(!/function vipBonusStats\(/.test(engine),"engine 不得再持有第二套 vipBonusStats owner。");
assert(/let vipThreshold=null,vipLevelFromPoints=null,normalizeVipState=null,vipBonusStats=null/.test(engine),"engine 應只保留 VIP owner 注入槽位。");
assert(/VIP progression owner not loaded/.test(engine),"playerCombatStats 必須 fail-fast 要求正式 VIP owner 已載入。");
assert(/VIP_UI_VERSION=2/.test(vipUi),"VIP UI 應為 V2。");
assert(!/VIP\$\{VIP_MAX_LEVEL\} MAX/.test(vipUi)&&!/VIP20 MAX/.test(vipUi),"玩家 VIP UI 不得再顯示 VIP20 MAX。");
assert(/VIP 等級沒有上限/.test(vipUi),"VIP UI 必須說明等級無上限。");
assert(/VIP 等級沒有上限/.test(guide)&&/VIP21 以上不新增特權/.test(guide),"遊戲說明必須說明 VIP 無上限與特權止於20。");
assert(/GM_UNBOUNDED_VIP_TEST_VERSION=1/.test(vipGm),"GM 無上限 VIP 測試標記必須由 vipgm.js 正式持有。");
assert(/type=\"number\" min=\"0\" step=\"1\"/.test(vipGm),"GM VIP 測試應由 vipgm.js 使用無上限數字輸入。");
assert(!/VIP_MAX_LEVEL/.test(vipGm),"vipgm.js 不得再依賴 VIP_MAX_LEVEL。");
assert(!/installUnlimitedVipTestOverrides|normalizeTestVip/.test(gmHub),"gmhubextensions.js 不得再保留 VIP runtime override 層。");
assert(/指定 VIP 積分/.test(vipUi),"GM 正式 VIP 管理應以積分為入口。");
assert(/VIP_UNBOUNDED_INTEGRITY_VERSION:1/.test(contract),"Canonical Integrity Contract 必須鎖定 VIP 無上限 Integrity V1。");
assert(/GAME_GUIDE_VERSION:19/.test(contract),"Canonical Integrity Contract 應對齊 Game Guide V19。");

const context={
 state:{vipLevel:0,vipPoints:0},
 VIP_HP_ATK_PERCENT_PER_LEVEL:.5,
 VIP_DEF_PERCENT_PER_LEVEL:.25,
 VIP_RATE_STAT_PER_LEVEL:.25,
 registerNewStateNormalizer:()=>true,
 window:{},
 Math,
 console
};
vm.createContext(context);
vm.runInContext(progression,context,{filename:"vipprogression.js"});
assert(context.window.vipThreshold(21)===441000,"VIP21 門檻應為441,000。");
assert(context.window.vipThreshold(50)===2500000,"VIP50 門檻應為2,500,000。");
assert(context.window.vipLevelFromPoints(441000)===21,"441,000 積分應為 VIP21。");
assert(context.window.vipLevelFromPoints(2500000)===50,"2,500,000 積分應為 VIP50。");
const b=context.window.vipBonusStats(50);
assert(b.level===50&&b.hp===25&&b.atk===25&&b.def===12.5&&b.crit===12.5&&b.dodge===12.5,"VIP50 基本能力公式錯誤。");
const probe={vipPoints:490000,vipLevel:0};
context.window.normalizeVipState(probe);
assert(probe.vipPoints===490000&&probe.vipLevel===22,"舊存檔 490,000 積分應自然重算為 VIP22。");
console.log("VIP unlimited integrity passed");
