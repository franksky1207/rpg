const fs=require("fs");
function assert(condition,message){if(!condition)throw new Error(message);}
const read=file=>fs.readFileSync(file,"utf8");
const index=read("index.html");
const contract=read("newstatecontract.js");
const daily=read("dailycore.js");
const migration=read("savemigration.js");
const guard=read("saveversionguard.js");
const pos=name=>index.indexOf('src="'+name+'?v=');

assert(/const VERSION=1;/.test(contract)&&/NEW_STATE_NORMALIZER_CONTRACT_VERSION/.test(contract),"New-state normalizer contract V1 缺失。");
assert(/returned a subsystem object; root replacement was rejected/.test(contract),"New-state contract 必須拒絕 subsystem root replacement。");
assert(pos("engine.js")>=0&&pos("newstatecontract.js")>pos("engine.js")&&pos("newstatecontract.js")<pos("reincarnationstate.js"),"newstatecontract.js 必須緊接 engine owner、早於所有後續 state normalizer。");
assert(/function normalizeFreshDailyState\(target\)\{normalizeDailyState\(target\);return target;\}/.test(daily),"Daily fresh-state adapter 缺失。");
assert(/registerNewStateNormalizer\(normalizeFreshDailyState\)/.test(daily),"Daily 必須以 root-preserving adapter 註冊 newState normalizer。");
assert(!/registerNewStateNormalizer\(normalizeDailyState\)/.test(daily),"Daily subsystem normalizer 不得直接註冊進 newState pipeline。");
assert(/DAILY_NEW_STATE_NORMALIZER_VERSION=1/.test(daily),"Daily new-state contract marker 缺失。");

assert(/const SAVE_LOAD_PIPELINE_VERSION=3;/.test(migration),"Save load pipeline 必須升級為 V3。");
assert(/SAVE_VERSION_BACKUP_DELEGATION_VERSION=1/.test(migration),"savemigration 必須宣告 version-backup delegation。");
assert(!/PRE_SCHEMA16_BACKUP_SUFFIX/.test(migration)&&!/PRE_SCHEMA17_BACKUP_SUFFIX/.test(migration),"savemigration 不得再持有 pre-Schema backup key owner。");
assert(!/ensurePreSchema16Backup/.test(migration)&&!/ensurePreSchema17Backup/.test(migration)&&!/ensureVersionBackup/.test(migration),"savemigration 不得再持有 version backup 寫入邏輯。");
assert(/versionBackupOwner:"saveversionguard"/.test(migration),"canonical load report 必須標示 saveversionguard 為 version backup owner。");
assert(/PRE_SCHEMA16_BACKUP_SUFFIX/.test(guard)&&/PRE_SCHEMA17_BACKUP_SUFFIX/.test(guard),"saveversionguard 必須保留 pre-Schema backup keys。");
assert(/strictPreSchema16Backup/.test(guard)&&/strictPreSchema17Backup/.test(guard)&&/writeVerified/.test(guard),"saveversionguard 必須單獨持有 strict verified version backup。");
assert(/pre-schema16-backup-failed/.test(guard)&&/pre-schema17-backup-failed/.test(guard),"version backup 失敗必須維持 fail-closed。");

console.log("New-state / save backup owner integrity passed");