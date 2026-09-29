const fs=require("fs");
const path=require("path");
const {spawnSync}=require("child_process");
function assert(condition,message){if(!condition)throw new Error(message);}
function walk(dir){const rows=[];for(const entry of fs.readdirSync(dir,{withFileTypes:true})){if([".git","node_modules"].includes(entry.name))continue;const full=path.join(dir,entry.name);if(entry.isDirectory())rows.push(...walk(full));else if(entry.isFile()&&entry.name.endsWith(".js"))rows.push(full);}return rows;}
const read=file=>fs.readFileSync(file,"utf8");
const files=walk(".").sort();
assert(files.length>0,"找不到任何 JavaScript 檔案。");
const syntaxFailures=[];
for(const file of files){const checked=spawnSync(process.execPath,["--check",file],{encoding:"utf8"});if(checked.status!==0)syntaxFailures.push(file+": "+String(checked.stderr||checked.stdout||"syntax error").trim());}
assert(syntaxFailures.length===0,"JavaScript 語法檢查失敗：\n"+syntaxFailures.join("\n\n"));
const index=read("index.html"),contract=read("integritycontract.js"),runtime=read("runtimeintegrity.js"),finalIntegrity=read("finalintegrity.js"),offlineStateCore=read("offlinestatecore.js"),dungeonProgress=read("dungeonprogress.js"),arena=read("dungeonarena.js"),thirdWorldDungeonUi=read("thirdworlddungeonui.js"),gameGuideSource=read("gameguide.js");
const localScripts=[...index.matchAll(/<script\s+(?:defer\s+)?(?:data-[^=]+="[^"]*"\s+)*src=["']([^"']+)["']/g)].map(match=>match[1].split("?")[0]).filter(src=>!/^https?:\/\//.test(src));
for(const src of localScripts)assert(fs.existsSync(src),"index.html 載入不存在的本地 script："+src);
const pos=name=>index.indexOf('src="'+name+'?v=');
assert(pos("offlinestatecore.js")>=0&&pos("offlinestatecore.js")<pos("savemigration.js"),"offlinestatecore.js 必須先於 savemigration.js 載入。");
assert(pos("saveversionguard.js")>pos("savemigration.js"),"saveversionguard.js 必須在正式 migration 之後載入。");
assert(pos("compatibilityowners.js")>pos("dungeonprogress.js")&&pos("compatibilityowners.js")<pos("integritycontract.js"),"compatibilityowners.js 必須在正式 owner 後、Integrity Contract 前載入。");
assert(pos("integritycontract.js")<pos("runtimeintegrity.js")&&pos("runtimeintegrity.js")<pos("finalintegrity.js"),"Integrity Contract → Runtime → Final 載入順序錯誤。");
assert(!index.includes("legacy Runtime Integrity cache-bust contract marker"),"index.html 不應再保留只為舊 regex 存在的 cache-bust marker。");
assert(!thirdWorldDungeonUi.includes("Runtime legacy source token only"),"thirdworlddungeonui.js 不應再保留假 legacy source token。");
assert(!thirdWorldDungeonUi.includes('rewardText:"尚未開放"')&&!thirdWorldDungeonUi.includes('buttonLabel:"等待高維競技場開放"'),"高維競技場正式 owner 不應再含已退休的未開放 placeholder。");
assert(/const VERSION=6;/.test(thirdWorldDungeonUi)&&/THIRD_WORLD_ARENA_LIVE_VERSION=1/.test(thirdWorldDungeonUi),"高維副本 adapter 應為 V6 並宣告競技場正式開放。");
assert(/mode==="arena"\)return \{visible:true,enabled:true/.test(thirdWorldDungeonUi)&&/buttonLabel:"進入高維競技場"/.test(thirdWorldDungeonUi),"高維競技場正式 policy 必須可進入。");
assert(/const VERSION=3;/.test(contract)&&/OFFLINE_STATE_NORMALIZATION_VERSION:4/.test(contract)&&/THIRD_WORLD_DUNGEON_UI_VERSION:6/.test(contract)&&/GAME_GUIDE_VERSION:24/.test(contract),"Canonical Integrity Contract V3 最低版本基準未同步。");
assert(/VERSION_BELOW_MINIMUM/.test(contract)&&/CIVILIZATION_INTEGRITY_MINIMUM_VERSIONS/.test(contract)&&/runCanonicalCivilizationIntegrityContract/.test(contract),"Canonical Integrity Contract 必須使用最低版本策略並保留不受 extension 覆寫的正式入口。");
assert(/const VERSION=21;/.test(runtime)&&/runCanonicalCivilizationIntegrityContract/.test(runtime)&&/LEGACY_DIAGNOSTIC/.test(runtime),"Runtime Integrity 應為 V21，並把歷史自測降為 diagnostics。");
assert(/OFFLINE_STATE_NORMALIZATION_VERSION\)<4/.test(runtime)&&/OFFLINE_BATTLE_SAMPLE_VERSION/.test(runtime),"Runtime Integrity 必須依正式 Offline V4 owner／動態 sample version 驗證。");
assert(/balanceVersion\)!==7/.test(runtime)&&/rankBalanceVersion\)!==4/.test(runtime),"Runtime Integrity Arena profile 必須同步 Balance V7／Rank V4。");
assert(/const VERSION=21;/.test(finalIntegrity)&&/PROJECT_RUNTIME_INTEGRITY_VERSION\)!==21/.test(finalIntegrity)&&/runCanonicalCivilizationIntegrityContract/.test(finalIntegrity),"Final Integrity 應同步 Runtime V21／Canonical Contract V3。");
assert(/const VERSION=4;/.test(offlineStateCore)&&/OFFLINE_BATTLE_SAMPLE_VERSION=4/.test(offlineStateCore),"Offline canonical owner 應為 normalization V4／sample V4。");
assert(/balanceVersion:7,rankBalanceVersion:4/.test(dungeonProgress),"Arena canonical profile 應為 Balance V7／Rank V4。");
assert(/hp:Object\.freeze\(\{base:1\.68,linear:\.05,quadratic:-\.0027\}\)/.test(arena)&&/damage:Object\.freeze\(\{base:1\.52,linear:\.04,quadratic:-\.0019\}\)/.test(arena)&&/def:Object\.freeze\(\{base:1\.11,linear:\.022,quadratic:-\.00085\}\)/.test(arena),"第二紀元 Arena 最新三條 Rank 曲線不符。");
assert(/GAME_GUIDE_VERSION=24/.test(gameGuideSource),"遊戲說明正式 owner 應為 V24。");
assert(fs.existsSync("tests/runtime/browser-smoke.js"),"缺少真正瀏覽器啟動 smoke test。");
const guideExtensionBehavior=spawnSync(process.execPath,["tests/runtime/gameguide-extension-integrity.js"],{encoding:"utf8"});
assert(guideExtensionBehavior.status===0,"Guide shared extension behavior regression failed：\n"+String(guideExtensionBehavior.stderr||guideExtensionBehavior.stdout||"unknown error").trim());
console.log("Runtime static integrity passed: "+files.length+" JavaScript files parsed; canonical V3/V21 runtime guards, live W3 dungeon policy, offline V4 owner and Arena V7/V4 are synchronized.");
