const fs=require("fs");
const path=require("path");
const {spawnSync}=require("child_process");

function assert(condition,message){ if(!condition)throw new Error(message); }
function walk(dir){
 const rows=[];
 for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
  if([".git","node_modules"].includes(entry.name))continue;
  const full=path.join(dir,entry.name);
  if(entry.isDirectory())rows.push(...walk(full));
  else if(entry.isFile()&&entry.name.endsWith(".js"))rows.push(full);
 }
 return rows;
}

const files=walk(".").sort();
assert(files.length>0,"找不到任何 JavaScript 檔案。");
const failures=[];
for(const file of files){
 const checked=spawnSync(process.execPath,["--check",file],{encoding:"utf8"});
 if(checked.status!==0)failures.push(file+": "+String(checked.stderr||checked.stdout||"syntax error").trim());
}
assert(failures.length===0,"JavaScript 語法檢查失敗：\n"+failures.join("\n\n"));

const read=file=>fs.readFileSync(file,"utf8");
const ui=read("ui.js");
const worldmap=read("worldmapui.js");
const gmhub=read("gmhub.js");
const mobile=read("preparemobilecontrols.js");
const css=read("adventureuipolish.css");
const index=read("index.html");
const civilization=read("civilizationcore.js");
const bounty=read("dungeonbounty.js");
const secondWorldCombat=read("secondworldcombat.js");
const civilizationFormalFiles=["secondworldcombat.js","specialcore.js","secondworldcalamityrun.js","dungeoncore.js","dungeonarena.js","dungeonvoid.js","mirrorcombatcore.js"];
const civilizationGmFiles=["dungeongm.js","arenagm5.js","mirrordungeongm.js","specialgmbatch.js","secondworldcalamitygm.js","gmpowerbenchmark.js"];

assert(/window\.startGalaxyReviewBattle=async function\(\)/.test(ui),"ui.js 缺少銀河回顧戰正式入口。");
assert(/ADVENTURE_INVENTORY_RETURN_CONTEXT_VERSION=1/.test(ui),"ui.js 缺少冒險背包返回 context owner。");
assert(/GALAXY_REVIEW_SELECTION_ISOLATION_VERSION=1/.test(ui),"ui.js 缺少銀河回顧 selection isolation 標記。");
assert(/window\.secondWorldAdventurePageHtml=function\(\)/.test(worldmap),"worldmapui.js 缺少宇宙紀元冒險 owner。");
assert(/GALAXY_REVIEW_SELECTION_OWNER_VERSION=1/.test(worldmap),"worldmapui.js 缺少銀河回顧 selection owner。");
assert(/SECOND_WORLD_ADVENTURE_UI_VERSION=4/.test(worldmap),"worldmapui.js 宇宙冒險 UI 版本不符。");
assert(/gmHtml=function\(\)\{installGmHubStyles\(\);return hubHtml\(\);\}/.test(gmhub),"gmhub.js 缺少 GM Hub 正式 renderer。");
assert(/function generalManagementHtml\(\)/.test(gmhub),"gmhub.js 缺少一般管理 renderer。");
assert(/data-mobile-prepare-actions/.test(mobile),"preparemobilecontrols.js 未使用 explicit action owner selector。");
assert(/data-mobile-battle-panel/.test(mobile),"preparemobilecontrols.js 未使用 explicit battle panel owner selector。");
assert(!/#main \.prepare-screen \.prepare-actions/.test(mobile),"preparemobilecontrols.js 不得再用泛用 prepare-actions selector。");
assert(/PREPARE_MOBILE_CONTROLS_VERSION=2/.test(mobile),"preparemobilecontrols.js 版本應為 2。");
assert(/data-mobile-prepare-actions/.test(css),"adventureuipolish.css 未綁定 explicit mobile action owner。");

assert(/CIVILIZATION_COMBAT_DAMAGE_OWNER_VERSION=1/.test(civilization),"civilizationcore.js 缺少統一文明戰鬥倍率 owner。");
assert(/BOUNTY_BALANCE_VERSION=2/.test(bounty),"dungeonbounty.js Bounty Balance 應為 V2。");
assert(/SECOND_WORLD_BOSS_STAT_FORMULA_VERSION=1/.test(secondWorldCombat),"secondworldcombat.js 缺少宇宙 Boss 基準公式版本。");
assert(/const BASE_STAT=3000;/.test(secondWorldCombat),"secondworldcombat.js 宇宙 Boss 單一基準應為 3000。");
assert(/STAT_RATIO=Object\.freeze\(\{hp:12,atk:2,def:1\}\)/.test(secondWorldCombat),"secondworldcombat.js 宇宙 Boss 比例應為 12:2:1。");
assert(!/const BASE_HP=|const BASE_ATK=|const BASE_DEF=/.test(secondWorldCombat),"secondworldcombat.js 不得恢復三套獨立基準常數。");
assert(/BOUNTY_DIFFICULTY_FORMULA_VERSION=2/.test(bounty),"dungeonbounty.js Difficulty Formula 應為 V2。");
assert(/BOUNTY_CIVILIZATION_SCALING_VERSION=1/.test(bounty),"dungeonbounty.js 缺少文明動態縮放。");
assert(/hp:Object\.freeze\(\{linear:\.67,quadratic:-\.19\}\)/.test(bounty),"dungeonbounty.js HP curve 係數不符。");
assert(/damage:Object\.freeze\(\{linear:\.57,quadratic:-\.13\}\)/.test(bounty),"dungeonbounty.js damage curve 係數不符。");
assert(/def:Object\.freeze\(\{base:\.88,linear:\.15,quadratic:-\.04\}\)/.test(bounty),"dungeonbounty.js DEF curve 係數不符。");
assert(/window\.civilizationCombatDamageMultiplier=civilizationCombatDamageMultiplier/.test(civilization),"civilizationcore.js 缺少正式 combat multiplier API。");
for(const file of [...civilizationFormalFiles,...civilizationGmFiles]){
 const source=read(file);
 assert(/civilizationCombatDamageMultiplier/.test(source),file+" 未接統一文明戰鬥倍率 owner。");
 assert(!/civilizationDamageMultiplierForLevel\s*\(/.test(source),file+" 不得自行直呼 civilizationDamageMultiplierForLevel。");
 assert(!/civilizationDamageMultiplier\s*\(/.test(source),file+" 不得自行直呼 civilizationDamageMultiplier。");
}

for(const source of ["ui.js","worldmapui.js","preparemobilecontrols.js","gmhub.js","civilizationcore.js","secondworldcombat.js","specialcore.js","secondworldcalamityrun.js","dungeoncore.js","dungeonarena.js","dungeonvoid.js","mirrorcombatcore.js","dungeongm.js","arenagm5.js","mirrordungeongm.js","specialgmbatch.js","secondworldcalamitygm.js","gmpowerbenchmark.js","civilizationintegrity.js","finalintegrity.js"]){
 assert(index.includes('src="'+source+'?v='),"index.html 缺少 "+source+" cache-bust 載入。");
}

const localScripts=[...index.matchAll(/<script\s+src=["\']([^"\']+)["\']/g)]
 .map(match=>match[1].split("?")[0])
 .filter(src=>!/^https?:\/\//.test(src));
for(const src of localScripts)assert(fs.existsSync(src),"index.html 載入不存在的本地 script："+src);

console.log("Runtime integrity passed: "+files.length+" JavaScript files parsed; critical owners present.");
