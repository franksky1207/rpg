const fs=require("fs");
const path=require("path");
const {spawnSync}=require("child_process");
function assert(condition,message){if(!condition)throw new Error(message);}
function walk(dir){const rows=[];for(const entry of fs.readdirSync(dir,{withFileTypes:true})){if([".git","node_modules"].includes(entry.name))continue;const full=path.join(dir,entry.name);if(entry.isDirectory())rows.push(...walk(full));else if(entry.isFile()&&entry.name.endsWith(".js"))rows.push(full);}return rows;}
const read=file=>fs.readFileSync(file,"utf8");
const files=walk(".").sort();assert(files.length>0,"找不到任何 JavaScript 檔案。");
const syntaxFailures=[];for(const file of files){const checked=spawnSync(process.execPath,["--check",file],{encoding:"utf8"});if(checked.status!==0)syntaxFailures.push(file+": "+String(checked.stderr||checked.stdout||"syntax error").trim());}assert(syntaxFailures.length===0,"JavaScript 語法檢查失敗：\n"+syntaxFailures.join("\n\n"));

const index=read("index.html"),source=name=>read(name);
const compatibility=source("compatibilityowners.js"),saveHook=source("savehookcore.js"),saveGuard=source("saveversionguard.js"),backupRetention=source("savebackupretention.js"),saveMigration=source("savemigration.js"),migrationRegression=source("tests/runtime/save-level-migration-regression.js"),batch7Lazy=source("tests/runtime/code-cleanup-batch7-lazy-loading.js"),workflow=source(".github/workflows/runtime-integrity.yml"),scriptLoader=source("scriptgrouploader.js"),runtimeApi=source("runtimeapi.js"),combatMath=source("combatmath.js"),dungeonCore=source("dungeoncore.js"),secondWorldCombat=source("secondworldcombat.js"),worldTransitionSafety=source("worldtransitionsafety.js"),offlineState=source("offlinestatecore.js"),battlePipeline=source("battlepipeline.js"),rerun1=source("reincarnationrerunworld1.js"),rerun2=source("reincarnationrerunworld2.js"),rerun3=source("reincarnationrerunworld3.js"),equipmentCore=source("equipmentrewardcore.js"),reincarnationCore=source("reincarnationcore.js"),uiSource=source("ui.js"),permanentGearGuard=source("reincarnationpermanentgearguard.js"),gmFormalControls=source("gmbatch16formalcontrols.js");
const normalScripts=[...index.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["']/g)].map(match=>match[1].split("?")[0]).filter(src=>!/^https?:\/\//.test(src));
const delayedScripts=[...index.matchAll(/<script\b[^>]*\bdata-src=["']([^"']+)["']/g)].map(match=>match[1].split("?")[0]).filter(src=>!/^https?:\/\//.test(src));
const localScripts=[...new Set([...normalScripts,...delayedScripts])];for(const src of localScripts)assert(fs.existsSync(src),"index.html 載入不存在的本地 script："+src);
const pos=name=>index.indexOf('src="'+name+'?v='),assetRef=name=>{const match=index.match(new RegExp(`(?:src|data-src|href)=["']${name.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}([^"']*)["']`));return match?match[1]:null;};

assert(pos("savehookcore.js")>pos("dungeonprogress.js")&&pos("savehookcore.js")<pos("compatibilityowners.js"),"Save Hook Core 載入順序錯誤。");
assert(pos("offlinestatecore.js")>=0&&pos("offlinestatecore.js")<pos("savemigration.js"),"Offline canonical owner 必須先於 save migration。");
assert(pos("savemigration.js")<pos("saveversionguard.js")&&pos("saveversionguard.js")<pos("savebackupretention.js")&&pos("savebackupretention.js")<pos("ui.js"),"Save migration → guard → backup retention → UI 載入順序錯誤。");
assert(pos("combatmath.js")<pos("combatcore.js")&&pos("combatcore.js")<pos("secondworldcombat.js"),"World Combat Adapter／Combat Core／W2 consumer 順序錯誤。");
assert(pos("worldtransitionsafety.js")>pos("offlineprogress.js"),"World transition guards 必須在 Offline owner 載入後安裝。");
assert(!index.includes('src="thirdworldmigrationregression.js')&&!index.includes('save-level-migration-regression.js'),"production index 不得載入 migration CI fixtures。");
for(const group of ["gm","story","integrity"]){const re=new RegExp(`<script\\s+type="application/x-civilization-deferred"\\s+data-load-group="${group}"\\s+data-src=`);assert(re.test(index),`${group} scripts 必須由 Script Group Loader 延後載入。`);}

const loaderRef=assetRef("scriptgrouploader.js");
assert(loaderRef==="?v=20261005-gm-authorized-restore1&v2=20261006-gm-runtime-policy-batch3&v3=20261006-gm-runtime-policy-batch3-final1&v4=20261006-gm-runtime-policy-batch3-final2&v5=20261008-gm-early-runtime-restore1&v6=20261008-gm-auth-pref-sync1&v7=20261008-gm-first-render1&v8=20261008-gm-load-opt2&v9=20261009-gm-dom-ready","Script Group Loader Batch3 canonical cache token 未同步。");
assert(assetRef("compatibilityowners.js")==="?v=20261005-code-cleanup-batch7","Compatibility owner canonical cache token 漂移。");
assert(!/<script\s+defer\s+fetchpriority="low"\s+data-load-group="(?:gm|story|integrity)"/.test(index),"舊 defer-only 非核心載入方式必須退休。");
assert(/GROUP_ORDER=Object\.freeze\(\["story","gm","integrity"\]\)/.test(scriptLoader)&&/AUTO_GROUPS=Object\.freeze\(\["story"\]\)/.test(scriptLoader),"Loader 必須只自動載入 Story。");
assert(/CivilizationScriptLoader=namespace/.test(scriptLoader)&&/ACTIVATION_POLICY_VERSION=3/.test(scriptLoader)&&/LOAD_BEHAVIOR_VERSION=5/.test(scriptLoader),"Batch3 canonical script-loader namespace／版本契約缺失。");
assert(/gm:"browser-local-authorization-or-password-modal-on-demand"/.test(scriptLoader)&&/integrity:"diagnostics-explicit-only"/.test(scriptLoader)&&/story:"post-load-sequenced"/.test(scriptLoader),"Batch3 lazy-load activation policy 錯誤。");
assert(/GM_AUTHORIZATION_KEY="civilization-war-gm-authorized-v1"/.test(scriptLoader)&&/gmAuthorizationSnapshot/.test(scriptLoader)&&/saveStateAuthoritative:false/.test(scriptLoader),"GM browser-local authorization owner 缺失。");
assert(/SCRIPT_GROUP_AUTHORIZED_GM_RESTORE_VERSION=2/.test(scriptLoader)&&/GM_RUNTIME_SAVE_BOUNDARY_VERSION=1/.test(scriptLoader)&&/registerBeforeSaveHook/.test(scriptLoader)&&/registerSaveSettlementHook/.test(scriptLoader),"GM runtime/save boundary 契約缺失。");
assert(/groupPromises\.delete\(key\)/.test(scriptLoader)&&/retryable:true/.test(scriptLoader)&&/script\.remove\(\)/.test(scriptLoader),"Lazy loader 失敗後必須允許重試並清除失敗 script。");
assert(/MutationObserver/.test(scriptLoader)&&/passwordModal/.test(scriptLoader)&&/production/.test(scriptLoader),"GM modal on-demand trigger／production probe 缺失。");
assert(!/window\.SCRIPT_GROUP_ROUTING_VERSION=/.test(scriptLoader)&&!/window\.SCRIPT_GROUP_AUTO_START_DELAY_MS=/.test(scriptLoader),"不得重新暴露低價值 loader internals globals。");
assert(workflow.includes("code-cleanup-batch7-lazy-loading.js")&&/production=1/.test(batch7Lazy)&&/gmAuthorizationSnapshot/.test(batch7Lazy)&&/__saveHookBase/.test(batch7Lazy)&&/retryable/.test(batch7Lazy)&&/gmBackgroundBattleEnabled/.test(batch7Lazy),"Runtime Integrity 必須永久驗證 production lazy-loading、GM runtime authorization/save boundary 與 retry。");

assert(/IMPLEMENTATION_OWNER="savehookcore"/.test(saveHook)&&/CORE_VERSION=2/.test(saveHook),"Save Hook Core owner／V2 契約錯誤。");
assert(/window\.save=hookedSave/.test(saveHook)&&/registerBeforeSaveHook/.test(saveHook)&&/registerAfterSaveHook/.test(saveHook)&&/registerSaveSettlementHook/.test(saveHook),"Save Hook Core API 不完整。");
assert(/const VERSION=5;/.test(compatibility)&&/SCRIPT_LOAD_POLICY_VERSION=4/.test(compatibility)&&/EXPECTED_SAVE_SCHEMA_VERSION=17/.test(compatibility),"Compatibility owner／Schema17 診斷未同步。");
assert(/read-compatible-no-duplicate-write/.test(compatibility)&&/legacyGlobalAliasSnapshot/.test(compatibility),"Legacy global alias policy 缺失。");
assert(!/window\.save\s*=/.test(compatibility)&&!/window\.MAX_LEVEL\s*=\s*LEGACY_MAX_LEVEL_VALUE/.test(compatibility)&&!/window\.scriptLoadGroupFor\s*=/.test(compatibility),"Compatibility owner 不得重新成為正式 writer/global classifier owner。");
assert(/CivilizationScriptLoader/.test(compatibility)&&/activation:snapshot\?\.activation\|\|null/.test(compatibility),"Compatibility runtime snapshot 必須讀 canonical loader namespace。");

assert(/SAVE_SAFETY_VERSION=2/.test(saveGuard)&&/SAVE_MIGRATION_STAIRCASE_VERSION=1/.test(saveGuard),"Save Safety／Migration Staircase owner 缺失。");
assert(/strictPreSchema16Backup/.test(saveGuard)&&/strictPreSchema17Backup/.test(saveGuard),"Legacy migration backup guard 不完整。");
assert(/automaticDelete:false/.test(backupRetention)&&/manualPruneEligible/.test(backupRetention)&&/pruneLegacyMigrationBackups/.test(backupRetention),"Backup retention policy 漂移。");
assert(/RETIRED_SAVE_STATE_MIGRATION_ONLY_VERSION=1/.test(saveMigration)&&/cleanupRetiredMigrationState/.test(saveMigration),"Retired save state 必須集中在 migration-only owner。");
assert(/SAVE_MIGRATION_GLOBAL_API_CLEANUP_VERSION=2/.test(saveMigration)&&/SAVE_MIGRATION_REGRESSION_RUNTIME_SEPARATION_VERSION=1/.test(saveMigration),"Migration regression separation contract 未安裝。");
assert(!/runLevelMigrationRegression/.test(saveMigration)&&!/SAVE_LEVEL_MIGRATION_REGRESSION_REPORT/.test(saveMigration),"production savemigration 不得含 regression runner。");
assert(/SCHEMA16_WORLD3_LV1000/.test(migrationRegression)&&/SCHEMA16_CONTAMINATED_REINCARNATION/.test(migrationRegression)&&workflow.includes("save-level-migration-regression.js"),"CI migration regression fixtures／workflow 缺失。");
assert(/REINCARNATION_PERMANENT_GEAR_LOAD_REPAIR_RETIRED_VERSION=1/.test(saveMigration)&&!/function normalizeReincarnationPermanentGearLevels/.test(saveMigration),"重複永久裝備 migration load repair 必須退休。");
assert(/const VERSION=6;/.test(equipmentCore)&&/LEVEL_SEMANTICS_VERSION=2/.test(equipmentCore)&&/FACTORY_WORLD_LEVEL_GUARD_VERSION=1/.test(equipmentCore)&&/sharedEquipmentLevelCap/.test(equipmentCore)&&/sharedNormalizeEquipmentLevelForWorld/.test(equipmentCore),"裝備 world/level canonical owner 錯誤。");
assert(/EQUIPMENT_SAVE_LEVEL_WORLD_OWNER_VERSION=1/.test(uiSource)&&/sharedNormalizeEquipmentLevelForWorld/.test(uiSource)&&!/clampEffectiveGameLevel\(it\.level,target\)/.test(uiSource),"UI save normalizer 不得用角色 cap 壓縮裝備 level。");
assert(/REINCARNATION_PERMANENT_GEAR_MARKER_VERSION=1/.test(reincarnationCore)&&/retainedWorld:3/.test(reincarnationCore)&&/retainedLevel:2000/.test(reincarnationCore),"正式轉生保留 retention evidence 缺失。");
assert(/const VERSION=3;/.test(permanentGearGuard)&&/evidence-gated-fallback-only/.test(permanentGearGuard)&&/retentionMarkerEvidence/.test(permanentGearGuard)&&/legacyRewardIdEvidence/.test(permanentGearGuard),"永久裝備 fallback guard 未收窄。");

assert(/WORLD_COMBAT_ADAPTER_VERSION=1/.test(combatMath)&&/runWorldCombatCore/.test(combatMath),"World Combat Adapter owner 缺失。");
assert(/DUNGEON_WORLD_COMBAT_ADAPTER_VERSION=1/.test(dungeonCore)&&/window\.runWorldCombatCore/.test(dungeonCore),"Dungeon 必須走 World Combat Adapter。");
assert(/SECOND_WORLD_WORLD_COMBAT_ADAPTER_VERSION=1/.test(secondWorldCombat)&&/window\.runWorldCombatCore/.test(secondWorldCombat),"W2 主線必須走 World Combat Adapter。");
assert(/WORLD_TRANSITION_GUARD_INSTALL_VERSION=2/.test(worldTransitionSafety),"World Transition guards 必須維持 single-install owner。");
assert(/const VERSION=4;/.test(offlineState)&&/OFFLINE_BATTLE_SAMPLE_VERSION=4/.test(offlineState)&&/OFFLINE_SAMPLE_OWNER_VERSION=2/.test(offlineState),"Offline canonical owner 版本錯誤。");
assert(/MAIN_OFFLINE_SAMPLE_OWNER_CONVERGENCE_VERSION=1/.test(battlePipeline)&&/window\.appendOfflineBattleSample/.test(battlePipeline),"W1 Offline sample consumer 尚未收斂 canonical owner。");

assert(/FIRST_WORLD_REINCARNATION_LIFECYCLE_OWNER_CONVERGENCE_VERSION=LIFECYCLE_OWNER_CONVERGENCE_VERSION/.test(rerun1),"W1 rerun shared lifecycle owner 未收斂。");
assert(/CivilizationReincarnation\?\.lifecycle\?\.worldRerunPolicy\|\|window\.worldRerunPolicy/.test(rerun1)&&!/function worldRerunPolicy\(/.test(rerun1)&&!/window\.worldRerunPolicy=/.test(rerun1),"W1 rerun 必須 namespace-first 且不得定義 shared owner。");
assert(/PRESENTATION_STATE_SWAP_RETIRED_VERSION=1/.test(rerun1)&&!/state=presentationState/.test(rerun1),"W1 rerun 不得替換 global state。");
assert(/CivilizationReincarnation=reincarnation/.test(runtimeApi)&&/CivilizationFirstWorldTarget=firstWorldTarget/.test(runtimeApi)&&/CivilizationSaveMigration=saveMigration/.test(runtimeApi),"Canonical runtime namespaces 不完整。");
assert(/window\.worldRerunPolicy=worldRerunPolicy/.test(runtimeApi),"shared rerun policy legacy alias owner 錯誤。");
assert(/CivilizationReincarnation\?\.lifecycle\?\.worldRerunPolicy\|\|window\.worldRerunPolicy/.test(rerun2)&&/SECOND_WORLD_REINCARNATION_GLOBAL_API_CLEANUP_VERSION=GLOBAL_API_CLEANUP_VERSION/.test(rerun2),"W2 lifecycle namespace-first 契約缺失。");
assert(/CivilizationReincarnation\?\.lifecycle\?\.worldRerunPolicy\|\|window\.worldRerunPolicy/.test(rerun3)&&/THIRD_WORLD_REINCARNATION_GLOBAL_API_CLEANUP_VERSION=GLOBAL_API_CLEANUP_VERSION/.test(rerun3),"W3 lifecycle namespace-first 契約缺失。");
assert(pos("reincarnationrerunworld1.js")<pos("runtimeapi.js")&&pos("runtimeapi.js")<pos("reincarnationrerunworld2.js")&&pos("runtimeapi.js")<pos("reincarnationrerunworld3.js"),"runtime API owner 載入順序錯誤。");

assert(/GM_BATCH16_FORMAL_POLICY_VERSION=POLICY_VERSION/.test(gmFormalControls)&&/currentWorldPhase/.test(gmFormalControls)&&/replaceGmHubSectionRenderer/.test(gmFormalControls),"GM Batch16 formal controls 必須委派 canonical phase/policy 與 section registry。");
assert(/GM_BATCH16_GLOBAL_RENDERER_COMPAT_ALIAS_VERSION=COMPAT_ALIAS_VERSION/.test(gmFormalControls)&&/gmSpecializationManagementHtml=specializationRenderer/.test(gmFormalControls)&&/gmMarkManagementHtml=markRenderer/.test(gmFormalControls)&&/gmCivilizationManagementHtml=civilizationRenderer/.test(gmFormalControls),"GM Batch16 舊 global renderer 只能保留為 canonical policy compatibility alias。");
assert(index.includes('gmbatch16formalcontrols.js?v=20260930-gm-late-binding-batch2&v2=20261006-gm-runtime-policy-batch3&v3=20261006-gm-runtime-policy-batch3-final1'),"GM Batch16 Batch3 cache token 未同步。");

console.log("JavaScript structural integrity passed:",JSON.stringify({files:files.length,localScripts:localScripts.length,normalScripts:normalScripts.length,delayedScripts:delayedScripts.length,saveHook:"savehookcore",schema:17,cleanupBatch:7,runtimeApi:1,migrationRegression:"ci-only",reincarnationPermanentGearSaveGuard:"evidence-gated-fallback-only",gmAuthorization:"browser-local-runtime",gmLazyRetry:true,gmFormalPolicy:1,lazyLoading:"story-auto-gm-browser-authorized-or-modal-integrity-explicit"}));