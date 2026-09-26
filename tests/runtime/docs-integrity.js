const fs=require("fs");

function assert(condition,message){if(!condition)throw new Error(message);}
function read(path){return fs.readFileSync(path,"utf8");}

const readme=read("README.md");
const handoff=read("PROJECT_HANDOFF.md");
const pending=read("PROJECT_PENDING_STATUS.md");
const vipUpdate=read("PROJECT_VIP_UNBOUNDED_UPDATE.md");
const historical=read("LEVEL100_EXPANSION.md");
const assets=read("assets/README.md");

assert(readme.includes("銀河紀元**：Lv.1～500")&&readme.includes("宇宙紀元**：Lv.501～1000"),"README 必須描述正式雙紀元 Lv.1～1000。");
assert(readme.includes("SAVE_SCHEMA_VERSION = 15"),"README 的正式 Save Schema 必須是 15。");
assert(readme.includes("正式玩家稱號共 26 個"),"README 必須同步 26 個正式玩家稱號。");
assert(readme.includes("VIP 等級無上限")&&readme.includes("特殊特權至 VIP20"),"README 必須同步 VIP 無上限／特權至20的新規則。");
assert(readme.includes("PROJECT_VIP_UNBOUNDED_UPDATE.md"),"README 必須指向 VIP 無上限正式補充文件。");
assert(!readme.includes("養成系統：8 種專精（各 Lv.60）、VIP20、"),"README 不得再把 VIP20 當正式等級上限。");
assert(!readme.includes("正式 save schema：`12`"),"README 不得復活舊 Schema 12。");

assert(handoff.includes("SAVE_SCHEMA_VERSION = 16")&&handoff.includes("WORLD_PHASE_VERSION = 6")&&handoff.includes("thirdWorld")&&handoff.includes("main` 的實際程式碼是唯一真實來源"),"Handoff 必須同步目前 Schema16／World3 正式基準與 main 唯一真實來源原則。");
assert(handoff.includes("Background")||handoff.includes("backgroundpreload.js"),"Handoff 必須保留啟動背景／preload 現況。");
assert(handoff.includes("使用者親自從頭完整玩一次銀河紀元＋宇宙紀元"),"Handoff 的目前下一階段必須是雙紀元實玩。");
assert(handoff.includes("第三紀元")&&handoff.includes("禁止自行推導"),"Handoff 必須明確禁止自行推導第三紀元。");

assert(pending.includes("親自從頭完整玩一次銀河紀元＋宇宙紀元"),"Pending 下一階段必須是雙紀元完整實玩。");
assert(pending.includes("全介面＋遊戲說明雙紀元語意總掃描」已完成"),"Pending 必須標記雙紀元語意總掃描已完成。");
assert(pending.includes("VIP 無上限正式改版")&&pending.includes("VIP 等級本身無上限"),"Pending 必須同步 VIP 無上限改版完成狀態。");
assert(pending.includes("PROJECT_VIP_UNBOUNDED_UPDATE.md"),"Pending 必須指向 VIP 正式補充文件。");
assert(!pending.includes("此掃描目前**尚未執行**"),"Pending 不得保留已完成掃描的舊待辦。");
assert(pending.includes("Arena V2 額外「實機 500 場」驗收")&&pending.includes("Cloud Save 真實跨裝置驗證"),"Pending 必須保留已取消項目，避免日後自動復活。");

assert(vipUpdate.includes("VIP 等級無上限")&&vipUpdate.includes("VIP20 是最後一個特殊特權階段"),"VIP 補充文件必須記錄正式無上限規則。");
assert(vipUpdate.includes("VIP_PROGRESSION_VERSION = 14")&&vipUpdate.includes("VIP_UNBOUNDED_INTEGRITY_VERSION = 1"),"VIP 補充文件必須記錄正式 owner／Integrity 版本。");
assert(vipUpdate.includes("490,000")&&vipUpdate.includes("VIP22"),"VIP 補充文件必須記錄舊積分自然重算案例。");
assert(vipUpdate.includes("worldmaps-core-war.js")&&vipUpdate.includes("已立即還原"),"VIP 補充文件必須保留本次自我檢查修正紀錄。");

assert(historical.includes("歷史文件／已失效基準"),"LEVEL100_EXPANSION 必須明確標示為歷史文件。");
assert(historical.includes("SAVE_SCHEMA_VERSION = 15")&&historical.includes("level100balance.js` 已退休"),"歷史文件頂部必須指出 current main 的現行 owner／schema。");
assert(!historical.includes("目前 `main` 正式基準為：**Lv1～500"),"歷史文件不得再宣稱 current main 只有 Lv500。");

assert(assets.includes("backgrounds-source/`)：原始製作素材")||assets.includes("backgrounds-source/`：原始製作素材"),"素材規範必須區分 source 原稿角色。");
assert(assets.includes("`backgrounds/`：正式部署素材"),"素材規範必須區分正式 runtime 背景角色。");

console.log("Documentation Integrity OK");
console.log("README / HANDOFF / PENDING / VIP supplement / historical / asset policy are synchronized with the current main baseline.");