const fs=require("fs");
const path=require("path");
const {spawnSync}=require("child_process");

function assert(condition,message){if(!condition)throw new Error(message);}
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
const read=file=>fs.readFileSync(file,"utf8");
const files=walk(".").sort();
assert(files.length>0,"找不到任何 JavaScript 檔案。");
const failures=[];
for(const file of files){
 const checked=spawnSync(process.execPath,["--check",file],{encoding:"utf8"});
 if(checked.status!==0)failures.push(file+": "+String(checked.stderr||checked.stdout||"syntax error").trim());
}
assert(failures.length===0,"JavaScript 語法檢查失敗：\n"+failures.join("\n\n"));

const index=read("index.html");
const contract=read("integritycontract.js");
const runtime=read("runtimeintegrity.js");
const finalIntegrity=read("finalintegrity.js");
const dungeonProgress=read("dungeonprogress.js");
const arena=read("dungeonarena.js");
const bounty=read("dungeonbounty.js");
const secondWorldCombat=read("secondworldcombat.js");
const worldmap=read("worldmapui.js");
const secondWorldCalamityIntegrity=read("secondworldcalamityintegrity.js");
const titleCore=read("playertitlecore.js");

const localScripts=[...index.matchAll(/<script\s+src=["']([^"']+)["']/g)]
 .map(match=>match[1].split("?")[0])
 .filter(src=>!/^https?:\/\//.test(src));
for(const src of localScripts)assert(fs.existsSync(src),"index.html 載入不存在的本地 script："+src);
const pos=name=>index.indexOf('src="'+name+'?v=');
assert(pos("integritycontract.js")>=0,"index.html 缺少 integritycontract.js cache-bust 載入。");
assert(pos("runtimeintegrity.js")>pos("integritycontract.js"),"integritycontract.js 必須先於 runtimeintegrity.js 載入。");
assert(pos("finalintegrity.js")>pos("runtimeintegrity.js"),"finalintegrity.js 必須晚於 runtimeintegrity.js 載入。");
assert(!index.includes('src="runtimeintegrityaddon.js?v='),"runtimeintegrityaddon.js 已納入正式 Runtime owner，不應再載入。");

assert(/CIVILIZATION_INTEGRITY_CONTRACT_VERSION=VERSION/.test(contract),"Canonical Integrity Contract V1 export 缺失。");
assert(/SAVE_SCHEMA_VERSION:15/.test(contract),"Integrity Contract 的 Save Schema 應為 15。");
assert(/PLAYER_TITLE_CATALOG_VERSION:3/.test(contract),"Integrity Contract 的稱號 catalog 應為 V3。");
assert(/ARENA_BY_WORLD_STATE_VERSION:2/.test(contract),"Integrity Contract 的 Arena By World state 應為 V2。");
assert(/SECOND_WORLD_ARENA_UNLOCK_VERSION:2/.test(contract),"Integrity Contract 的宇宙 Arena unlock 應為 V2。");
assert(/SECOND_WORLD_ARENA_RANK_CURVE_VERSION:2/.test(contract),"Integrity Contract 的宇宙 Arena curve 應為 V2。");
assert(/SECOND_WORLD_CIVILIZATION_COMBAT_VERSION:2/.test(contract),"Integrity Contract 的宇宙文明戰鬥應為 V2。");
assert(/BOUNTY_BALANCE_VERSION:2/.test(contract)&&/BOUNTY_DIFFICULTY_FORMULA_VERSION:2/.test(contract),"Integrity Contract 的 Bounty 應為 V2。");
assert(/SECOND_WORLD_ADVENTURE_UI_VERSION:4/.test(contract),"Integrity Contract 的宇宙冒險 UI 應為 V4。");
assert(/SECOND_WORLD_CALAMITY_FULL_INTEGRITY_VERSION:2/.test(contract),"Integrity Contract 的宇宙災厄完整檢查應為 V2。");

assert(/const VERSION=18;/.test(runtime),"runtimeintegrity.js 應為 V18。");
assert(/runCivilizationIntegrityContract\(\{phase:"runtime"\}\)/.test(runtime),"runtimeintegrity.js 必須執行 canonical contract。");
assert(/PROJECT_RUNTIME_INTEGRITY_VERSION=VERSION/.test(runtime),"runtimeintegrity.js 缺少正式版本 export。");
assert(!runtime.includes("v11 → v14"),"runtimeintegrity.js 不得保留舊 Schema 14 診斷文字。");
assert(!/PLAYER_TITLE_DEFS\.length!==16/.test(runtime),"runtimeintegrity.js 不得再以 16 稱號為正式基準。");
assert(!/SECOND_WORLD_CIVILIZATION_COMBAT_VERSION\)!==1/.test(runtime),"runtimeintegrity.js 不得再要求舊宇宙文明戰鬥 V1。");
assert(!/ARENA_BY_WORLD_STATE_VERSION\)!==1/.test(runtime),"runtimeintegrity.js 不得再要求舊 Arena By World V1。");

assert(/const VERSION=18;/.test(finalIntegrity),"finalintegrity.js 應為 V18。");
assert(/runCivilizationIntegrityContract\(\{phase:"final"\}\)/.test(finalIntegrity),"finalintegrity.js 必須執行 canonical contract。");
assert(!/PLAYER_TITLE_DEFS\.length!==16/.test(finalIntegrity),"finalintegrity.js 不得再以 16 稱號為正式基準。");
assert(!/ARENA_BY_WORLD_STATE_VERSION\)!==1/.test(finalIntegrity),"finalintegrity.js 不得再要求舊 Arena By World V1。");
assert(!/SECOND_WORLD_ADVENTURE_UI_VERSION\)!==2/.test(finalIntegrity),"finalintegrity.js 不得再要求舊宇宙冒險 UI V2。");

assert(/ARENA_BY_WORLD_STATE_VERSION=2/.test(dungeonProgress),"dungeonprogress.js Arena By World state 應為 V2。");
assert(/SECOND_WORLD_ARENA_UNLOCK_VERSION=2/.test(dungeonProgress),"dungeonprogress.js 宇宙 Arena unlock 應為 V2。");
assert(/SECOND_WORLD_ARENA_RANK_CURVE_VERSION=2/.test(arena),"dungeonarena.js 第二世界 Arena Rank Curve 應為 V2。");
assert(/hp:Object\.freeze\(\{base:1\.68,linear:\.05,quadratic:-\.0015\}\)/.test(arena),"dungeonarena.js 第二世界 Arena HP curve 係數不符。");
assert(/damage:Object\.freeze\(\{base:1\.52,linear:\.04,quadratic:-\.001\}\)/.test(arena),"dungeonarena.js 第二世界 Arena damage curve 係數不符。");
assert(/def:Object\.freeze\(\{base:1\.11,linear:\.022,quadratic:-\.0004\}\)/.test(arena),"dungeonarena.js 第二世界 Arena DEF curve 係數不符。");
assert(/BOUNTY_BALANCE_VERSION=2/.test(bounty),"dungeonbounty.js Bounty Balance 應為 V2。");
assert(/BOUNTY_DIFFICULTY_FORMULA_VERSION=2/.test(bounty),"dungeonbounty.js Bounty Difficulty Formula 應為 V2。");
assert(/const BASE_STAT=2700;/.test(secondWorldCombat),"secondworldcombat.js 宇宙 Boss 單一基準應為 2700。");
assert(/SECOND_WORLD_CIVILIZATION_COMBAT_VERSION=2/.test(secondWorldCombat),"secondworldcombat.js 宇宙文明戰鬥 owner 應為 V2。");
assert(/STAT_RATIO=Object\.freeze\(\{hp:12,atk:2,def:1\}\)/.test(secondWorldCombat),"secondworldcombat.js 宇宙 Boss 比例應為 12:2:1。");
assert(/SECOND_WORLD_ADVENTURE_UI_VERSION=4/.test(worldmap),"worldmapui.js 宇宙冒險 UI 應為 V4。");
assert(/SECOND_WORLD_CALAMITY_FULL_INTEGRITY_VERSION=VERSION/.test(secondWorldCalamityIntegrity)&&/const VERSION=2;/.test(secondWorldCalamityIntegrity),"secondworldcalamityintegrity.js 應為完整 Integrity V2。");
assert(/PLAYER_TITLE_CATALOG_VERSION=3/.test(titleCore),"playertitlecore.js 正式稱號 catalog 應為 V3。");

console.log("Runtime integrity passed: "+files.length+" JavaScript files parsed; canonical source contract and load order are synchronized.");
