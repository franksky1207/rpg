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
const compatibility=source("compatibilityowners.js"),saveHook=source("savehookcore.js"),saveGuard=source("saveversionguard.js"),backupRetention=source("savebackupretention.js"),saveMigration=source("savemigration.js"),migrationRegression=source("tests/runtime/save-level-migration-regression.js"),batch7Lazy=source("tests/runtime/code-cleanup-batch7-lazy-loading.js"),workflow=source(".github/workflows/runtime-integrity.yml"),scriptLoader=source("scriptgrouploader.js"),runtimeApi=source("runtimeapi.js"),combatMath=source("combatmath.js"),dungeonCore=source("dungeoncore.js"),secondWorldCombat=source("secondworldcombat.js"),worldTransitionSafety=source("worldtransitionsafety.js"),offlineState=source("offlinestatecore.js"),battlePipeline=source("battlepipeline.js"),rerun1=source("reincarnationrerunworld1.js"),rerun2=source("reincarnationrerunworld2.js"),rerun3=source("reincarnationrerunworld3.js");
const normalScripts=[...index.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["']/g)].map(match=>match[1].split("?")[0]).filter(src=>!/^https?:\/\//.test(src));
const delayedScripts=[...index.matchAll(/<script\b[^>]*\bdata-src=["']([^"']+)["']/g)].map(match=>match[1].split("?")[0]).filter(src=>!/^https?:\/\//.test(src));
const localScripts=[...new Set([...normalScripts,...delayedScripts])];
for(const src of localScripts)assert(fs.existsSync(src),"index.html 載入不存在的本地 script："+src);
const pos=name=>index.indexOf('src="'+name+'?v=');
const assetRef=name=>{const match=index.match(new RegExp(`(?:src|data-src|href)=["']${name.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}([^"']*)["']`));return match?match[1]:null;};

assert(pos("savehookcore.js")>pos("dungeonprogress.js")&&pos("savehookcore.js")<pos("compatibilityowners.js"),"Save Hook Core 必須在 engine/base save 之後、compatibility owner 之前載入。");
assert(pos("offlinestatecore.js")>=0&&pos("offlinestatecore.js")<pos("savemigration.js"),"Offline canonical owner 必須先於 save migration。");
assert(pos("savemigration.js")<pos("saveversionguard.js")&&pos("saveversionguard.js")<pos("savebackupretention.js")&&pos("savebackupretention.js")<pos("ui.js"),"Save migration → guard → backup retention → UI 載入順序錯誤。");
assert(pos("combatmath.js")<pos("combatcore.js")&&pos("combatcore.js")<pos("secondworldcombat.js"),"World Combat Adapter／Combat Core／W2 consumer 順序錯誤。");
assert(pos("worldtransitionsafety.js")>pos("offlineprogress.js"),"World transition guards 必須在 Offline owner 載入後安裝。");
assert(!index.includes('src="thirdworldmigrationregression.js'),"production index 不得載入 migration regression fixture。");
assert(!index.includes('save-level-migration-regression.js'),"production index 不得載入 level migration CI regression fixture。");
for(const group of ["gm","story","integrity"]){const re=new RegExp(`<script\\s+type="application/x-civilization-deferred"\\s+data-load-group="${group}"\\s+data-src=`);assert(re.test(index),`${group} scripts 必須由 Script Group Loader 延後載入。`);}
assert(index.includes('scriptgrouploader.js?v=20261005-gm-authorized-restore1'),"Script Group Loader GM restore canonical cache token 未更新。");
assert(index.includes('compatibilityowners.js?v=20261005-code-cleanup-batch7'),"Compatibility owner Batch7 canonical cache token 未更新。");
assert(assetRef("scriptgrouploader.js")==="?v=20261005-gm-authorized-restore1","Script Group Loader 必須只保留單一 canonical ?v= token。");
assert(assetRef("compatibilityowners.js")==="?v=20261005-code-cleanup-batch7","Compatibility owner 必須只保留單一 canonical ?v= token。");
assert(!/<script\s+defer\s+fetchpriority="low"\s+data-load-group="(?:gm|story|integrity)"/.test(index),"舊 defer-only 非核心載入方式必須退休。");
assert(/GROUP_ORDER=Object\.freeze\(\["story","gm","integrity"\]\)/.test(scriptLoader)&&/AUTO_GROUPS=Object\.freeze\(\["story"\]\)/.test(scriptLoader),"Batch7 loader 必須只自動載入 Story。");
assert(/CivilizationScriptLoader=namespace/.test(scriptLoader)&&/SCRIPT_GROUP_ACTIVATION_POLICY_VERSION=ACTIVATION_POLICY_VERSION/.test(scriptLoader)&&/SCRIPT_GROUP_LOAD_BEHAVIOR_VERSION=LOAD_BEHAVIOR_VERSION/.test(scriptLoader),"Batch7 canonical script-loader namespace／activation contract 缺失。");
assert(/gm:"authorized-save-or-password-modal-on-demand"/.test(scriptLoader)&&/integrity:"diagnostics-explicit-only"/.test(scriptLoader)&&/story:"post-load-sequenced"/.test(scriptLoader),"GM authorized restore lazy-load activation policy 錯誤。");
assert(/savedGmAuthorized/.test(scriptLoader)&&/ensureAuthorizedGmRuntime/.test(scriptLoader)&&/SCRIPT_GROUP_AUTHORIZED_GM_RESTORE_VERSION=1/.test(scriptLoader),"已授權 GM reload runtime restore 契約缺失。");
assert(/MutationObserver/.test(scriptLoader)&&/passwordModal/.test(scriptLoader)&&/production/.test(scriptLoader),"GM modal on-demand trigger／production probe 缺失。");
assert(!/window\.SCRIPT_GROUP_ROUTING_VERSION=/.test(scriptLoader)&&!/window\.SCRIPT_GROUP_AUTO_START_DELAY_MS=/.test(scriptLoader),"Batch7 不得重新暴露低價值 loader internals globals。");
assert(workflow.includes("code-cleanup-batch7-lazy-loading.js")&&/production=1/.test(batch7Lazy)&&/CivilizationScriptLoader\.ensure\("integrity"\)/.test(batch7Lazy)&&/applyReincarnationResetState/.test(batch7Lazy)&&/gmBackgroundBattleEnabled/.test(batch7Lazy),"Runtime Integrity 必須永久驗證 production lazy-loading、首輪與轉生後 GM runtime restore。");

assert(/IMPLEMENTATION_OWNER="savehookcore"/.test(saveHook)&&/CORE_VERSION=2/.test(saveHook),"Save Hook Core owner／V2 契約錯誤。");
assert(/window\.save=hookedSave/.test(saveHook)&&/registerBeforeSaveHook/.test(saveHook)&&/registerAfterSaveHook/.test(saveHook)&&/registerSaveSettlementHook/.test(saveHook),"Save Hook Core API 不完整。");
assert(/const VERSION=5;/.test(compatibility)&&/SCRIPT_LOAD_POLICY_VERSION=4/.test(compatibility)&&/SCRIPT_ON_DEMAND_ACTIVATION_VERSION=1/.test(compatibility)&&/EXPECTED_SAVE_SCHEMA_VERSION=17/.test(compatibility),"Compatibility owner V5／Script Load V4／Batch7 activation／Schema17 診斷未同步。");
assert(/read-compatible-no-duplicate-write/.test(compatibility)&&/legacyGlobalAliasSnapshot/.test(compatibility),"Legacy global alias policy 缺失。");
assert(!/window\.save\s*=/.test(compatibility),"Compatibility owner 不得重新成為 save writer。");
assert(!/window\.MAX_LEVEL\s*=\s*LEGACY_MAX_LEVEL_VALUE/.test(compatibility),"Compatibility owner 不得重寫 MAX_LEVEL。");
assert(!/window\.scriptLoadGroupFor\s*=/.test(compatibility),"內部 script group classifier 不應再暴露為 global API。");
assert(/CivilizationScriptLoader/.test(compatibility)&&/activation:snapshot\?\.activation\|\|null/.test(compatibility),"Compatibility runtime snapshot 必須讀 canonical loader namespace 的實際 activation policy。");

assert(/SAVE_SAFETY_VERSION=2/.test(saveGuard)&&/SAVE_MIGRATION_STAIRCASE_VERSION=1/.test(saveGuard),"Save Safety／Migration Staircase owner 缺失。");
assert(/strictPreSchema16Backup/.test(saveGuard)&&/strictPreSchema17Backup/.test(saveGuard),"Legacy migration backup guard 不完整。");
assert(/automaticDelete:false/.test(backupRetention)&&/manualPruneEligible/.test(backupRetention)&&/pruneLegacyMigrationBackups/.test(backupRetention),"Backup retention 必須預設不自動刪除並只允許手動 prune。");
assert(index.includes('savebackupretention.js?v=20261005-code-cleanup-batch2'),"Backup retention cache token 未更新。");
assert(/RETIRED_SAVE_STATE_MIGRATION_ONLY_VERSION=1/.test(saveMigration)&&/cleanupRetiredMigrationState/.test(saveMigration),"Retired save state 必須集中在 migration-only owner。");
assert(/function normalizePersistentFlags\(target\)\{if\(!isObject\(target\)\)return target;normalizePendingBlackMarketEncounter\(target\);return target;\}/.test(saveMigration),"Current-state persistent normalizer 不得持續清理 retired GM state。");
assert(!/window\.cleanupLegacyDungeonFields=/.test(saveMigration)&&!/window\.cleanupRetiredShopState=/.test(saveMigration)&&!/window\.cleanupTransientGmTestState=/.test(saveMigration),"Migration-only cleanup helpers 不應暴露為 global API。");
assert(/SAVE_MIGRATION_GLOBAL_API_CLEANUP_VERSION=2/.test(saveMigration)&&/SAVE_MIGRATION_REGRESSION_RUNTIME_SEPARATION_VERSION=1/.test(saveMigration),"Batch6 migration regression separation contract 未安裝。");
assert(!/runLevelMigrationRegression/.test(saveMigration)&&!/SAVE_LEVEL_MIGRATION_REGRESSION_VERSION/.test(saveMigration)&&!/SAVE_LEVEL_MIGRATION_REGRESSION_REPORT/.test(saveMigration),"production savemigration owner 不得再含 regression runner／fixture globals。");
assert(/SCHEMA16_WORLD3_LV1000/.test(migrationRegression)&&/SCHEMA16_CONTAMINATED_REINCARNATION/.test(migrationRegression),"CI migration regression fixtures 缺失。");
assert(workflow.includes("save-level-migration-regression.js"),"Runtime Integrity 必須永久執行分離後的 migration regression。");
assert(/REINCARNATION_PERMANENT_GEAR_LOAD_REPAIR_VERSION=1/.test(saveMigration)&&/normalizeReincarnationPermanentGearLevels/.test(saveMigration),"轉生永久 W3 裝備 lower-world load repair owner 缺失。");
assert(index.includes('savemigration.js?v=20261005-reincarnation-gear-carryover-batch1'),"轉生永久裝備修復 savemigration cache token 未同步。");
assert(workflow.includes("reincarnation-permanent-gear-carryover-integrity.js"),"Runtime Integrity 必須永久執行轉生永久裝備 carryover regression。");

assert(/WORLD_COMBAT_ADAPTER_VERSION=1/.test(combatMath)&&/runWorldCombatCore/.test(combatMath),"World Combat Adapter owner 缺失。");
assert(/DUNGEON_WORLD_COMBAT_ADAPTER_VERSION=1/.test(dungeonCore)&&/window\.runWorldCombatCore/.test(dungeonCore),"Dungeon 必須走 World Combat Adapter。");
assert(/SECOND_WORLD_WORLD_COMBAT_ADAPTER_VERSION=1/.test(secondWorldCombat)&&/window\.runWorldCombatCore/.test(secondWorldCombat),"W2 主線必須走 World Combat Adapter。");
assert(/WORLD_TRANSITION_GUARD_INSTALL_VERSION=2/.test(worldTransitionSafety),"World Transition guards 必須維持 single-install owner。");
assert(/const VERSION=4;/.test(offlineState)&&/const OFFLINE_BATTLE_SAMPLE_VERSION=4;/.test(offlineState)&&/const OFFLINE_SAMPLE_OWNER_VERSION=2;/.test(offlineState),"Offline canonical owner 版本錯誤。");
assert(/MAIN_OFFLINE_SAMPLE_OWNER_CONVERGENCE_VERSION=1/.test(battlePipeline)&&/window\.appendOfflineBattleSample/.test(battlePipeline),"W1 Offline sample consumer 尚未收斂 canonical owner。");

assert(/FIRST_WORLD_REINCARNATION_LIFECYCLE_OWNER_CONVERGENCE_VERSION=LIFECYCLE_OWNER_CONVERGENCE_VERSION/.test(rerun1),"W1 rerun 必須標記 shared lifecycle owner 已收斂。");
assert(/CivilizationReincarnation\?\.lifecycle\?\.worldRerunPolicy\|\|window\.worldRerunPolicy/.test(rerun1),"W1 rerun 必須 namespace-first 委派 canonical lifecycle owner。");
assert(!/function worldRerunPolicy\(/.test(rerun1)&&!/window\.worldRerunPolicy=/.test(rerun1)&&!/REINCARNATION_WORLD_RERUN_CONTEXT_OWNER_VERSION=/.test(rerun1),"W1 不得再定義或覆寫 shared rerun lifecycle owner。");
assert(/PRESENTATION_STATE_SWAP_RETIRED_VERSION=1/.test(rerun1)&&!/state=presentationState/.test(rerun1),"W1 rerun prepare 不得再替換 global state。");
assert(/CivilizationReincarnation=reincarnation/.test(runtimeApi)&&/CivilizationFirstWorldTarget=firstWorldTarget/.test(runtimeApi)&&/CivilizationSaveMigration=saveMigration/.test(runtimeApi),"Batch4 canonical runtime namespaces 不完整。");
assert(/window\.worldRerunPolicy=worldRerunPolicy/.test(runtimeApi)&&/REINCARNATION_WORLD_RERUN_CONTEXT_OWNER_VERSION=WORLD_RERUN_POLICY_VERSION/.test(runtimeApi),"shared rerun policy 必須只由 runtime API owner 輸出 legacy alias。");
assert(/CivilizationReincarnation\?\.lifecycle\?\.worldRerunPolicy\|\|window\.worldRerunPolicy/.test(rerun2)&&/SECOND_WORLD_REINCARNATION_GLOBAL_API_CLEANUP_VERSION=GLOBAL_API_CLEANUP_VERSION/.test(rerun2)&&!/SECOND_WORLD_REINCARNATION_BASE_OWNERS=/.test(rerun2)&&!/SECOND_WORLD_REINCARNATION_KEY_BOSSES=/.test(rerun2),"W2 必須 namespace-first 委派共用 lifecycle 並退休內部 globals。");
assert(/CivilizationReincarnation\?\.lifecycle\?\.worldRerunPolicy\|\|window\.worldRerunPolicy/.test(rerun3)&&/THIRD_WORLD_REINCARNATION_GLOBAL_API_CLEANUP_VERSION=GLOBAL_API_CLEANUP_VERSION/.test(rerun3)&&!/THIRD_WORLD_REINCARNATION_BASE_OWNERS=/.test(rerun3),"W3 必須 namespace-first 委派共用 lifecycle 並退休內部 globals。");
assert(pos("reincarnationrerunworld1.js")<pos("runtimeapi.js")&&pos("runtimeapi.js")<pos("reincarnationrerunworld2.js")&&pos("runtimeapi.js")<pos("reincarnationrerunworld3.js"),"runtime API owner 載入順序錯誤。");
assert(index.includes('reincarnationrerunworld1.js?v=20261005-code-cleanup-batch2-fix1&v2=20261005-code-cleanup-batch3&v3=20261005-code-cleanup-batch5')&&index.includes('runtimeapi.js?v=20261005-code-cleanup-batch4')&&index.includes('reincarnationrerunworld2.js?v=20261005-code-cleanup-batch2&v2=20261005-code-cleanup-batch3&v3=20261005-code-cleanup-batch4')&&index.includes('reincarnationrerunworld3.js?v=20261005-code-cleanup-batch2&v2=20261005-code-cleanup-batch3&v3=20261005-code-cleanup-batch4'),"第5批 rerun lifecycle cache token 未同步。");

console.log("JavaScript structural integrity passed:",JSON.stringify({files:files.length,localScripts:localScripts.length,normalScripts:normalScripts.length,delayedScripts:delayedScripts.length,saveHook:"savehookcore",schema:17,cleanupBatch:7,runtimeApi:1,migrationRegression:"ci-only",reincarnationPermanentGearRepair:1,lazyLoading:"story-auto-gm-authorized-or-modal-integrity-explicit",canonicalCacheTokens:["compatibilityowners.js","scriptgrouploader.js","savemigration.js"]}));