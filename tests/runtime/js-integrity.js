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

const index=read("index.html");
const source=name=>read(name);
const compatibility=source("compatibilityowners.js"),saveHook=source("savehookcore.js"),saveGuard=source("saveversionguard.js"),backupRetention=source("savebackupretention.js"),combatMath=source("combatmath.js"),dungeonCore=source("dungeoncore.js"),secondWorldCombat=source("secondworldcombat.js"),worldTransitionSafety=source("worldtransitionsafety.js"),offlineState=source("offlinestatecore.js"),battlePipeline=source("battlepipeline.js"),rerun1=source("reincarnationrerunworld1.js"),rerun2=source("reincarnationrerunworld2.js"),rerun3=source("reincarnationrerunworld3.js");
const localScripts=[...index.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["']/g)].map(match=>match[1].split("?")[0]).filter(src=>!/^https?:\/\//.test(src));
for(const src of localScripts)assert(fs.existsSync(src),"index.html 載入不存在的本地 script："+src);
const pos=name=>index.indexOf('src="'+name+'?v=');

assert(pos("savehookcore.js")>pos("dungeonprogress.js")&&pos("savehookcore.js")<pos("compatibilityowners.js"),"Save Hook Core 必須在 engine/base save 之後、compatibility owner 之前載入。");
assert(pos("offlinestatecore.js")>=0&&pos("offlinestatecore.js")<pos("savemigration.js"),"Offline canonical owner 必須先於 save migration。");
assert(pos("savemigration.js")<pos("saveversionguard.js")&&pos("saveversionguard.js")<pos("savebackupretention.js")&&pos("savebackupretention.js")<pos("ui.js"),"Save migration → guard → backup retention → UI 載入順序錯誤。");
assert(pos("combatmath.js")<pos("combatcore.js")&&pos("combatcore.js")<pos("secondworldcombat.js"),"World Combat Adapter／Combat Core／W2 consumer 順序錯誤。");
assert(pos("worldtransitionsafety.js")>pos("offlineprogress.js"),"World transition guards 必須在 Offline owner 載入後安裝。");
assert(!index.includes('src="thirdworldmigrationregression.js'),"production index 不得載入 migration regression fixture。");
for(const group of ["gm","story","integrity"]){const re=new RegExp(`<script\\s+defer\\s+fetchpriority="low"\\s+data-load-group="${group}"`);assert(re.test(index),`${group} scripts 必須維持 deferred + low-priority。`);}

assert(/IMPLEMENTATION_OWNER="savehookcore"/.test(saveHook)&&/CORE_VERSION=2/.test(saveHook),"Save Hook Core owner／V2 契約錯誤。");
assert(/window\.save=hookedSave/.test(saveHook)&&/registerBeforeSaveHook/.test(saveHook)&&/registerAfterSaveHook/.test(saveHook)&&/registerSaveSettlementHook/.test(saveHook),"Save Hook Core API 不完整。");
assert(/const VERSION=3;/.test(compatibility)&&/IMPLEMENTATION_VERSION=4/.test(compatibility)&&/EXPECTED_SAVE_SCHEMA_VERSION=17/.test(compatibility),"Compatibility owner V3 contract／Implementation V4／Schema17 診斷未同步。");
assert(/read-compatible-no-duplicate-write/.test(compatibility)&&/first-world-legacy-alias-only/.test(compatibility),"Legacy MAX_LEVEL 必須明確降級為第一紀元相容 alias。");
assert(!/window\.save\s*=/.test(compatibility),"Compatibility owner 不得重新成為 save writer。");
assert(!/window\.MAX_LEVEL\s*=\s*LEGACY_MAX_LEVEL_VALUE/.test(compatibility),"Compatibility owner 不得重寫 MAX_LEVEL。");

assert(/SAVE_SAFETY_VERSION=2/.test(saveGuard)&&/SAVE_MIGRATION_STAIRCASE_VERSION=1/.test(saveGuard),"Save Safety／Migration Staircase owner 缺失。");
assert(/strictPreSchema16Backup/.test(saveGuard)&&/strictPreSchema17Backup/.test(saveGuard),"Legacy migration backup guard 不完整。");
assert(/automaticDelete:false/.test(backupRetention)&&/manualPruneEligible/.test(backupRetention)&&/pruneLegacyMigrationBackups/.test(backupRetention),"Backup retention 必須預設不自動刪除並只允許手動 prune。");
assert(index.includes('savebackupretention.js?v=20261005-code-cleanup-batch2'),"Backup retention cache token 未更新。");

assert(/WORLD_COMBAT_ADAPTER_VERSION=1/.test(combatMath)&&/runWorldCombatCore/.test(combatMath),"World Combat Adapter owner 缺失。");
assert(/DUNGEON_WORLD_COMBAT_ADAPTER_VERSION=1/.test(dungeonCore)&&/window\.runWorldCombatCore/.test(dungeonCore),"Dungeon 必須走 World Combat Adapter。");
assert(/SECOND_WORLD_WORLD_COMBAT_ADAPTER_VERSION=1/.test(secondWorldCombat)&&/window\.runWorldCombatCore/.test(secondWorldCombat),"W2 主線必須走 World Combat Adapter。");
assert(/WORLD_TRANSITION_GUARD_INSTALL_VERSION=2/.test(worldTransitionSafety),"World Transition guards 必須維持 single-install owner。");
assert(/OFFLINE_STATE_NORMALIZATION_VERSION=4/.test(offlineState)&&/OFFLINE_SAMPLE_OWNER_VERSION=2/.test(offlineState),"Offline canonical owner 版本錯誤。");
assert(/MAIN_OFFLINE_SAMPLE_OWNER_CONVERGENCE_VERSION=1/.test(battlePipeline)&&/window\.appendOfflineBattleSample/.test(battlePipeline),"W1 Offline sample consumer 尚未收斂 canonical owner。");

assert(/PRESENTATION_STATE_SWAP_RETIRED_VERSION=1/.test(rerun1)&&!/state=presentationState/.test(rerun1),"W1 rerun prepare 不得再替換 global state。");
assert(/SECOND_WORLD_REINCARNATION_WRAPPER_BOUNDARY_VERSION=WRAPPER_BOUNDARY_VERSION/.test(rerun2)&&/if\(Number\(window\.SECOND_WORLD_REINCARNATION_RERUN_POLICY_VERSION\)>=1\)return;/.test(rerun2),"W2 rerun 必須有單次安裝 owner boundary。");
assert(/THIRD_WORLD_REINCARNATION_WRAPPER_BOUNDARY_VERSION=WRAPPER_BOUNDARY_VERSION/.test(rerun3)&&/if\(Number\(window\.THIRD_WORLD_REINCARNATION_RERUN_POLICY_VERSION\)>=1\)return;/.test(rerun3),"W3 rerun 必須有單次安裝 owner boundary。");
assert(index.includes('reincarnationrerunworld1.js?v=20261005-code-cleanup-batch2')&&index.includes('reincarnationrerunworld2.js?v=20261005-code-cleanup-batch2')&&index.includes('reincarnationrerunworld3.js?v=20261005-code-cleanup-batch2'),"本批 rerun scripts 必須使用單一 canonical cache token。");

console.log("JavaScript structural integrity passed:",JSON.stringify({files:files.length,localScripts:localScripts.length,saveHook:"savehookcore",schema:17,cleanupBatch:2}));
