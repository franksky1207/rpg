const fs=require("fs");

function assert(condition,message){if(!condition)throw new Error(message);}
function read(path){return fs.readFileSync(path,"utf8");}

const readme=read("README.md");
const handoff=read("PROJECT_HANDOFF.md");
const pending=read("PROJECT_PENDING_STATUS.md");
const vipUpdate=read("PROJECT_VIP_UNBOUNDED_UPDATE.md");
const historical=read("LEVEL100_EXPANSION.md");
const assets=read("assets/README.md");
const worldphase=read("worldphase.js");

assert(readme.includes("銀河紀元**：Lv.1～500")&&readme.includes("宇宙紀元**：Lv.501～1000")&&readme.includes("高維紀元**：Lv.1000～2000"),"README 必須描述正式三紀元 Lv.1～2000。");
assert(readme.includes("SAVE_SCHEMA_VERSION = 17"),"README 的正式 Save Schema 必須是 17。");
assert(readme.includes("10 名高維存在")&&readme.includes("永久削血")&&readme.includes("維度之弦")&&readme.includes("界弦核心"),"README 必須同步高維紀元已進 runtime 的正式基準。");
assert(readme.includes("VIP 等級無上限")&&readme.includes("特殊特權至 VIP20"),"README 必須同步 VIP 無上限／特權至20規則。");
assert(readme.includes("reincarnation")&&readme.includes("突破等級")&&readme.includes("異宇宙"),"README 必須同步轉生／突破／異宇宙後續主線。");
assert(readme.includes("PROJECT_VIP_UNBOUNDED_UPDATE.md"),"README 必須指向 VIP 無上限正式補充文件。");
assert(!readme.includes("高維紀元目前只有設計規格，尚未實作"),"README 不得再宣稱高維紀元尚未實作。");
assert(!readme.includes("SAVE_SCHEMA_VERSION = 15"),"README 不得再把舊 Schema15 當 current runtime。");

const handoffHasThirdWorldPhaseMapping=handoff.includes("3 = 高維紀元")||handoff.includes("1／2／3 對應銀河／宇宙／高維")||handoff.includes("1/2/3 對應銀河/宇宙/高維");
assert(handoff.includes("SAVE_SCHEMA_VERSION = 17")&&handoff.includes("currentWorldPhase()")&&handoffHasThirdWorldPhaseMapping&&handoff.includes("thirdWorld")&&handoff.includes("main` 的實際程式碼是唯一真實來源"),"Handoff 必須同步目前 Schema17／三紀元正式基準與 main 唯一真實來源原則。");
assert(handoff.includes("reincarnation")&&handoff.includes("異宇宙"),"Handoff 必須同步轉生／異宇宙主線資訊。");
assert(worldphase.includes("const WORLD_PHASE_VERSION=7;")&&worldphase.includes("const WORLD_PHASE_RERUN_ENTRY_POLICY_VERSION=1;")&&worldphase.includes('id:"higher-dimensional"'),"worldphase.js 必須維持 World Phase V7／轉生重征服 entry policy／高維紀元正式 owner。");

assert(pending.includes("SAVE_SCHEMA_VERSION = 17")&&pending.includes("高維紀元為 Lv.1000～2000")&&pending.includes("第6大批 6-1～6-5 均已完成"),"Pending 必須同步 Schema17、高維紀元與 Batch6 已完成現況。");
assert(pending.includes("reincarnationoverlevelrewards.js")&&pending.includes("ceil(base × M)")&&pending.includes("首輪 `count=0` 永遠為 1×")&&pending.includes("W3 Offline 完全不接越級倍率"),"Pending 必須同步 Batch6 越級 Online／Offline 正式規則。");
assert(pending.includes("playerbatchupgrades.js")&&pending.includes("專精「一鍵平均提升」只在第一紀元")&&pending.includes("強化「平均最大強化」在第一、第二紀元"),"Pending 必須同步 Batch6 共用批次成長 owner 與紀元範圍。");
assert(pending.includes("四大副本永久入口")&&pending.includes("首輪高維紀元仍維持「懸賞戰關閉」")&&pending.includes("500 場／485 勝（97%）"),"Pending 必須同步四副本永久入口與 Arena 原晉階規則。");
assert(pending.includes("W1／W2 轉生主線正式向下征服")&&pending.includes("Lv.500以前的普通／菁英進度")&&pending.includes("Boss0～99 正式完成")&&pending.includes("首輪 `count=0` 永遠拒絕這項 rerun 回填"),"Pending 必須以正式向下征服回填覆蓋舊的只記最高 Boss 語意。");
assert(!pending.includes("只寫入 `bossKilled[99]`")&&!pending.includes("不得偽造低階 key boss flag")&&!pending.includes("只寫入實際 Boss99"),"Pending 不得保留已失效的『只記最高 Boss、不回填低階』正式語意。");
assert(pending.includes("第6大批程式碼優化第1批：Schema17 舊轉生資料一致化")&&pending.includes("normalizeExistingReincarnationRerunProgress()")&&pending.includes("冪等")&&pending.includes("不升 Save Schema"),"Pending 必須同步第6大批優化第1批的 Schema17 舊轉生 normalization 與首輪隔離。");
assert(pending.includes("第6大批程式碼優化第2批：四大副本永久入口架構整理")&&pending.includes("dungeonModeAccessSnapshot()")&&pending.includes("state.level")&&pending.includes("不再被偽裝"),"Pending 必須同步第6大批優化第2批的共用副本 access owner 與正式 state 隔離。");
assert(pending.includes("第6大批程式碼優化第3批：一鍵專精／強化交易安全")&&pending.includes("runSettlementTransaction()")&&pending.includes("save exception rollback")&&pending.includes("root identity")&&pending.includes("nested reference identity")&&pending.includes("PLAYER_BATCH_UPGRADE_TRANSACTION_VERSION = 1"),"Pending 必須同步第6大批優化第3批的 shared transaction、save exception rollback 與 identity 安全。");
assert(pending.includes("第6大批程式碼優化第4批：Offline 舊樣本 provenance 安全化")&&pending.includes("OFFLINE_REWARD_CONTEXT_PROVENANCE_VERSION = 1")&&pending.includes("overlevelContextRecorded=true")&&pending.includes("舊 V4 pending")&&pending.includes("保守 1×"),"Pending 必須同步第6大批優化第4批的 Offline provenance 與舊樣本保守倍率策略。");
assert(pending.includes("第6大批程式碼優化第5批：戰鬥 wrapper 收斂＋Batch6 最終行為 regression")&&pending.includes("MAINLINE_OVERLEVEL_REWARD_INTEGRATION_VERSION = 1")&&pending.includes("REINCARNATION_OVERLEVEL_W1_ADAPTER_VERSION = 2")&&pending.includes("REINCARNATION_OVERLEVEL_FIGHT_WRAPPER_RETIRED_VERSION = 1")&&pending.includes("484 / 500")&&pending.includes("485 / 500")&&pending.includes("正式 save 只呼叫一次"),"Pending 必須同步第6大批優化第5批的 W1 settlement owner 收斂與行為 regression。");
assert(pending.includes("第6大批程式碼優化第1～5批已完成")&&pending.includes("優化第1～5批全部完成")&&!pending.includes("第6大批後續優化排程")&&pending.includes("目前主要施工剩餘：Batch7"),"Pending 必須標記第6大批優化第1～5批全部完成，後續只保留 Batch7。");
assert(pending.includes("GM 等級設定器必須共用突破 milestone owner"),"Pending 必須保留 Batch7 GM milestone 規則。");
assert(pending.includes("已取消／不得自動復活")&&pending.includes("AU 作為 Lv.2001+ 或第四紀元")&&pending.includes("VIP21+ 新增特殊特權"),"Pending 必須保留目前已取消項目，避免日後自動復活。");

assert(vipUpdate.includes("VIP 等級無上限")&&vipUpdate.includes("VIP20 是最後一個特殊特權階段"),"VIP 補充文件必須記錄正式無上限規則。");
assert(vipUpdate.includes("VIP_PROGRESSION_VERSION = 14")&&vipUpdate.includes("VIP_UNBOUNDED_INTEGRITY_VERSION = 1"),"VIP 補充文件必須記錄正式 owner／Integrity 版本。");
assert(vipUpdate.includes("490,000")&&vipUpdate.includes("VIP22"),"VIP 補充文件必須記錄舊積分自然重算案例。");
assert(vipUpdate.includes("worldmaps-core-war.js")&&vipUpdate.includes("已立即還原"),"VIP 補充文件必須保留本次自我檢查修正紀錄。");

assert(historical.includes("歷史文件／已失效基準"),"LEVEL100_EXPANSION 必須明確標示為歷史文件。");
assert(historical.includes("level100balance.js` 已退休"),"歷史文件頂部必須指出早期 level100 owner 已退休。");
assert(!historical.includes("目前 `main` 正式基準為：**Lv1～500"),"歷史文件不得再宣稱 current main 只有 Lv500。");

assert(assets.includes("backgrounds-source/`)：原始製作素材")||assets.includes("backgrounds-source/`：原始製作素材"),"素材規範必須區分 source 原稿角色。");
assert(assets.includes("`backgrounds/`：正式部署素材"),"素材規範必須區分正式 runtime 背景角色。");

console.log("Documentation Integrity OK");
console.log("README / HANDOFF / PENDING / VIP supplement / historical / asset policy are synchronized with the current main baseline.");
