const fs=require("fs");

function assert(condition,message){if(!condition)throw new Error(message);}
function read(path){return fs.readFileSync(path,"utf8");}

const readme=read("README.md");
const handoff=read("PROJECT_HANDOFF.md");
const pending=read("PROJECT_PENDING_STATUS.md");
const vipUpdate=read("PROJECT_VIP_UNBOUNDED_UPDATE.md");
const historical=read("docs/HISTORICAL_ENGINEERING.md");
const assets=read("assets/README.md");
const worldphase=read("worldphase.js");

assert(readme.includes("銀河紀元**：Lv.1～500")&&readme.includes("宇宙紀元**：Lv.501～1000")&&readme.includes("高維紀元**：Lv.1000～2000"),"README 必須描述正式三紀元 Lv.1～2000。");
assert(readme.includes("SAVE_SCHEMA_VERSION = 18"),"README 的正式 Save Schema 必須是 18。");
assert(readme.includes("10 名高維存在")&&readme.includes("永久削血")&&readme.includes("維度之弦")&&readme.includes("界弦核心"),"README 必須同步高維紀元已進 runtime 的正式基準。");
assert(readme.includes("VIP 等級無上限")&&readme.includes("特殊特權至 VIP20"),"README 必須同步 VIP 無上限／特權至20規則。");
assert(readme.includes("reincarnation")&&readme.includes("突破等級")&&readme.includes("異宇宙"),"README 必須同步轉生／突破／異宇宙後續主線。");
assert(readme.includes("PROJECT_VIP_UNBOUNDED_UPDATE.md"),"README 必須指向 VIP 無上限正式補充文件。");
assert(!readme.includes("高維紀元目前只有設計規格，尚未實作"),"README 不得再宣稱高維紀元尚未實作。");
assert(!readme.includes("SAVE_SCHEMA_VERSION = 15"),"README 不得再把舊 Schema15 當 current runtime。");

const handoffHasThirdWorldPhaseMapping=handoff.includes("3 = 高維紀元")||handoff.includes("1／2／3 對應銀河／宇宙／高維")||handoff.includes("1/2/3 對應銀河/宇宙/高維");
assert(handoff.includes("reincarnation")&&handoff.includes("異宇宙"),"Handoff 必須同步轉生／異宇宙主線資訊。");
assert(worldphase.includes("const WORLD_PHASE_VERSION=7;")&&worldphase.includes("const WORLD_PHASE_RERUN_ENTRY_POLICY_VERSION=1;")&&worldphase.includes('id:"higher-dimensional"'),"worldphase.js 必須維持 World Phase V7／轉生重征服 entry policy／高維紀元正式 owner。");

assert(pending.includes("SAVE_SCHEMA_VERSION = 18")&&pending.includes("高維紀元：Lv.1000～2000"),"Pending 必須同步 Schema17 與高維紀元 Lv.1000～2000。");
assert(pending.includes("Future schema 必須 fail closed")&&pending.includes("transaction owner"),"Pending 必須保留 Save／Migration 安全原則。");
assert(pending.includes("首輪 `reincarnation.count = 0`")&&pending.includes("只有 `count > 0` 啟用 rerun"),"Pending 必須保留首輪／轉生輪隔離規則。");

assert(vipUpdate.includes("VIP 等級無上限")&&vipUpdate.includes("VIP20 是最後一個特殊特權階段"),"VIP 補充文件必須記錄正式無上限規則。");
assert(vipUpdate.includes("VIP_PROGRESSION_VERSION = 14")&&vipUpdate.includes("VIP_UNBOUNDED_INTEGRITY_VERSION = 1"),"VIP 補充文件必須記錄正式 owner／Integrity 版本。");
assert(vipUpdate.includes("490,000")&&vipUpdate.includes("VIP22"),"VIP 補充文件必須記錄舊積分自然重算案例。");
assert(vipUpdate.includes("worldmaps-core-war.js")&&vipUpdate.includes("已立即還原"),"VIP 補充文件必須保留本次自我檢查修正紀錄。");

assert(!fs.existsSync("LEVEL100_EXPANSION.md")&&!fs.existsSync("PROJECT_HANDOFF_UPDATE_2026-09-28_ARENA.md")&&!fs.existsSync("PROJECT_HANDOFF_UPDATE_2026-09-29_GM_BATCH16.md"),"已封存歷史文件不得留在 project root。");


console.log("Documentation Integrity OK");
console.log("README / HANDOFF / PENDING / VIP supplement / docs/archive / asset policy are synchronized with the current main baseline.");
for(const p of ["PROJECT_HANDOFF.md","PROJECT_PENDING_STATUS.md"]){const s=read(p);assert(s.includes("PR #101")&&s.includes("PR #102")&&s.includes("PR #103")&&s.includes("第4批")&&s.includes("第5批")&&s.includes("第6批"),p+"必須標示最新已完成批次與現役狀態");
assert(!s.includes("尚待使用者另行授權最終整合 PR")&&!s.includes("第6批文件封箱以本整合分支為準"),p+"不得保留已合併工作為待發布狀態");}
assert(historical.includes("c0ec18d686d7111b2e5a7fa380c94653a2b8a2e4"),"歷史來源必須可從原SHA追溯");
assert(assets.includes("32張WebP")&&assets.includes("Manifest SHA")&&assets.includes("退役"),"素材規範必須保護正式WebP及SHA並記錄來源退役");
