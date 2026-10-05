const fs=require("fs");
const assert=require("assert");

function read(path){return fs.readFileSync(path,"utf8");}
function exists(path){return fs.existsSync(path);}

const migration=read("savemigration.js");
const compatibility=read("compatibilityowners.js");
const matrix=read("tests/runtime/save-schema17-compatibility-matrix.js");
const index=read("index.html");
const workflow=read(".github/workflows/runtime-integrity.yml");
const archiveIndex=read("docs/archive/README.md");

assert.ok(/const SAVE_SCHEMA_VERSION=17;/.test(migration),"Batch8 不得改動 current Schema17");
assert.ok(/const SAVE_MIN_SUPPORTED_VERSION=1;/.test(migration),"Batch8 必須保留最低支援 Schema1");
assert.ok(/const SAVE_LEGACY_SUPPORT_MODE="all-known";/.test(migration),"Batch8 必須保留 all-known legacy support");
assert.ok(/legacyReadPath:"migration-only"/.test(compatibility),"Legacy 讀取只能走 migration pipeline");
assert.ok(/futureSchemaPolicy:"fail-closed"/.test(compatibility),"Future schema 必須 fail closed");
assert.ok(/minSupportedVersion!==1/.test(compatibility)&&/configuredMode!=="all-known"/.test(compatibility),"Compatibility diagnostics 必須永久守住 V1～current 邊界");

for(const version of [1,9,15,16,17,18])assert.ok(matrix.includes(String(version)),`Schema compatibility matrix 缺少 ${version}`);
assert.ok(matrix.includes("Schema18 must fail closed until explicitly supported"),"Future schema fail-closed regression 不得移除");
assert.ok(matrix.includes("Schema17 must be supported current schema"),"Current Schema17 regression 不得移除");

assert.ok(/function cleanupLegacyDungeonFields\(/.test(migration),"仍支援 legacy import 時不得誤刪舊 dungeon cleanup");
assert.ok(/function cleanupRetiredShopState\(/.test(migration),"仍支援 legacy import 時不得誤刪 retired shop cleanup");
assert.ok(/function cleanupTransientGmTestState\(/.test(migration),"仍支援 legacy import 時不得誤刪 GM sandbox cleanup");
assert.ok(/function cleanupRetiredMigrationState\(/.test(migration)&&/cleanupRetiredMigrationState\(target\)/.test(migration),"Legacy cleanup 必須維持在 migrateSave migration owner 內");
assert.equal((migration.match(/cleanupRetiredMigrationState\(target\)/g)||[]).length,1,"Retired cleanup 不得擴散成第二套 runtime pipeline");
assert.ok(/RETIRED_SAVE_STATE_MIGRATION_ONLY_VERSION=1/.test(migration),"Migration-only cleanup contract 不得遺失");

assert.ok(index.includes('data-load-group="story"')&&index.includes('data-load-group="gm"')&&index.includes('data-load-group="integrity"'),"Batch8 不得為了合併碎片破壞 Batch7 lazy-loading boundaries");
assert.ok(index.includes('scriptgrouploader.js?v=20261005-code-cleanup-batch7'),"Batch8 不得退回 eager loading");

const archived=[
 "docs/archive/LEVEL100_EXPANSION.md",
 "docs/archive/PROJECT_HANDOFF_UPDATE_2026-09-28_ARENA.md",
 "docs/archive/PROJECT_HANDOFF_UPDATE_2026-09-29_GM_BATCH16.md"
];
for(const path of archived)assert.ok(exists(path),`歷史文件未封存：${path}`);
for(const path of ["LEVEL100_EXPANSION.md","PROJECT_HANDOFF_UPDATE_2026-09-28_ARENA.md","PROJECT_HANDOFF_UPDATE_2026-09-29_GM_BATCH16.md"])assert.equal(exists(path),false,`歷史文件不應繼續留在根目錄：${path}`);
assert.ok(archiveIndex.includes("main` 的實際程式碼永遠是唯一真實來源")&&archiveIndex.includes("不得作為 current runtime owner"),"Archive index 必須明示 historical/current 邊界");

assert.ok(workflow.includes("code-cleanup-batch8-legacy-boundary.js"),"Runtime Integrity 必須永久執行 Batch8 boundary regression");
assert.ok(workflow.includes("docs/archive/**"),"Historical archive 變更必須觸發 Runtime Integrity");

console.log("Code cleanup Batch8 legacy/archive boundary integrity passed:",JSON.stringify({schema:17,minSupported:1,legacyMode:"all-known",future:"fail-closed",legacyCleanup:"migration-owner-only",runtimeMergePolicy:"preserve-lazy-loading-boundaries",archived:archived.length}));
