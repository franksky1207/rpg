const fs=require("fs");
const assert=require("assert");
const index=fs.readFileSync("index.html","utf8");
const compatibility=fs.readFileSync("compatibilityowners.js","utf8");
const hookCore=fs.readFileSync("savehookcore.js","utf8");
const workflow=fs.readFileSync(".github/workflows/runtime-integrity.yml","utf8");

assert.ok(index.includes('src="savehookcore.js?v=20261005-code-cleanup-batch1"'),"index 必須載入 canonical Save Hook Core");
assert.ok(index.indexOf('src="savehookcore.js')<index.indexOf('src="compatibilityowners.js'),"Save Hook Core 必須先於 compatibility owner 載入");
assert.ok(!index.includes('src="thirdworldmigrationregression.js'),"production index 不應再載入 thirdworld migration regression");
assert.ok(/const EXPECTED_SAVE_SCHEMA_VERSION=17;/.test(compatibility),"Legacy compatibility diagnostic 必須對齊 Schema17");
assert.ok(/legacyReadPath:"migration-only"/.test(compatibility),"舊存檔必須明確走 migration-only 相容路徑");
assert.ok(/canonicalWriteSchema:current/.test(compatibility),"舊檔讀入後必須回到 current canonical schema");
assert.ok(!/window\.save\s*=/.test(compatibility),"compatibility owner 不得再覆寫 save()");
assert.ok(/IMPLEMENTATION_OWNER="savehookcore"/.test(hookCore),"Save Hook implementation owner 必須是 savehookcore");
assert.ok(/window\.SAVE_HOOK_RUNTIME_OWNER=LEGACY_RUNTIME_OWNER_ALIAS/.test(hookCore),"舊 runtime owner 名稱只可作相容 alias");
assert.ok(workflow.includes("post-reincarnation-cleanup-batch1-integrity.js"),"Runtime Integrity 必須永久執行本批 regression");
assert.ok(workflow.includes("save-schema17-compatibility-matrix.js"),"Schema17 legacy compatibility matrix 必須繼續保留");
console.log("Post-reincarnation cleanup Batch1 integrity passed.");
