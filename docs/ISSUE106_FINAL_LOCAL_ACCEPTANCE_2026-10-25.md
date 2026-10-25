# Issue #106 第 2 批與最終本機驗收

日期：2026-10-25（Asia/Taipei）。本報告記錄 PR 建立前的本機結果；GitHub Actions、合併與 Pages 的最終 SHA／URL 另記於 Issue #106，不能以本機結果冒稱已部署。

## 承接與修改範圍

- fetch 核對 main：`314fe6814ea17e3ff2cd8deafe25ef6943204513`；main 自第 1 批後沒有新增提交。
- 第 1 批：`f424b0fe3901b1072c0f54d086074c0628d16c5f`。
- 第 2 批既有 HEAD：`6d69dc15a3e01ef31f64afcad030267ad9467c74`；以 fast-forward 承接，保留既有 UI 成果，不重作。
- 角色 UI 沿用 `playersemanticsui.js` 既有 owner；X 直接取永久突破級數。沒有修改存檔、經濟、戰鬥或高維核心機制。
- 同步 UI script cache token、resource manifest、精確歷史 source seal；合法 UI 文案與 cache URL 斷言更新，不改歷史 SHA 或弱化存檔／正式戰鬥守衛。
- 新增測試接入既有 Runtime R3 與 command inventory；沒有新增 workflow 或取消既有 Gate。

## 實際角色 UI 驗收

`issue106-character-ui-integrity.cjs` 保留靜態保護並新增 Playwright 真正執行：

- 三紀元 × 永久突破 Lv.0／1／10／130／500 × 桌機 1440×900、直式 390×844、橫式 844×390，共 **45 個 UI 情境**。
- 每個情境反覆首頁→角色及重繪五次（225 次循環，另重複執行語意 apply），確認只有一個收益欄、一段說明、與最終傷害欄緊接。
- 收益值精確為 +0%、+1%、+10%、+130%、+500%；DOM 實測欄位及數值不溢出，透過 hit test 驗證真的可見、未被遮罩擋住。另檢視三種 viewport 的實際截圖。
- 說明精確為「突破每級：裝備原始 HP／攻擊／防禦 +2.5%、最終傷害 +5%、轉生收益 +1%。」。
- 三紀元角色屬性頁沒有重複界弦核心欄；高維冒險頁保留核心等級、進度、注入按鈕。
- 透過原確認 modal／原 transaction 實際注入 synthetic save：核心 Lv.3、進度 900,000,000、弦 200,000,000 → Lv.4、進度 100,000,000、弦 0，原有機制不變。
- 反覆渲染與切頁前後，整份 synthetic state JSON 相等，沒有資料遺失或新增存檔欄位。
- 使用既有本機 SDK mock 與正式 onboarding 流程，不連線外部玩家帳號。測試 fixture 明確設 `entryVersion=2`，避免把合法核心投資誤當舊版未付費核心。

中途兩個測試 fixture 問題已追查修正：確認 modal 的實際 ID；以及必須等待正式 Story group 並完成 onboarding，不能只關閉早期 legacy intro。沒有為通過 hit test 移除實際產品遮罩或故事安全機制。

## 第 1 批回歸

共用 raw 收益 owner、先算後發、突破 +1%／級、專精相加／越級最後相乘、素材不受專精、正式／離線各種出售、唯一 10% 折算、B0/B1 取整、里程碑快照及高維隔離全部重驗。

- 收益瀏覽器矩陣：80 場正式戰鬥、180 次手動／自動／批次出售、20 組離線小數累積，另驗離線素材出售。
- Main Minimal Mode、11 個 First World Target Context、正式連戰／背景／GM 隔離與歷史來源 seal 通過。
- Schema 18 不變；Schema1～17 migration、Schema17 matrix、Schema18 本機／JSON／mock cloud full-field parity、銀河／宇宙 V3／V4 pending 失敗復原／重試／去重通過。
- 高維 EXP、維度之弦及其他經濟 owner 保持 main 字節封存，核心注入使用原函式；沒有新增高維離線 EXP／弦。

## 指令與結果

本機 **62 個選定獨立驗收指令：62 通過、0 失敗、0 個必要項目未執行**。中途過期文案／快取斷言與 fixture 失敗均修正重驗；未刪除、跳過或放寬安全斷言。

瀏覽器測試在本機 HTTP server 執行，使用 `/usr/bin/chromium` 與既有 SDK fixture：

```sh
python3 -m http.server 4173 --bind 127.0.0.1
# browser commands use this environment prefix:
CHROMIUM_EXECUTABLE=/usr/bin/chromium NODE_PATH=/workspace/.rpg-tools/node_modules NODE_OPTIONS=--require=/workspace/.rpg-tools/system-chromium.cjs RPG_OFFLINE_SDK=1 node tests/runtime/issue106-character-ui-integrity.cjs
```

Node-only 命令不需要 browser preload；特別是 JS Structural 不加 NODE_OPTIONS，避免每個語法子程序重載 Playwright。

完整本機指令清單：

```sh
node tests/runtime/asset-integrity.js
node tests/runtime/batch12-presentation-safety.cjs
node tests/runtime/batch16-dungeon-contract.cjs
node tests/runtime/batch17-boss-contract.cjs
node tests/runtime/batch18-alternate-contract.cjs
node tests/runtime/batch19-absolute-sizing-contract.cjs
node tests/runtime/batch20-alternate-ten-stages.mjs
node tests/runtime/batch20-approved-runtime.cjs
node tests/runtime/breakthrough-core-integrity.js
node tests/runtime/breakthrough-final-damage-integrity.js
node tests/runtime/cleanup-batch2-4-integration.cjs
node tests/runtime/cross-era-background-browser.js
node tests/runtime/cross-mode-late-settlement-regression.cjs
node tests/runtime/docs-integrity.js
node tests/runtime/equipment-world-semantics-batch2-integrity.js
node tests/runtime/first-world-target-context-baseline-integrity.js
node tests/runtime/first-world-target-context-combat-batch3-integrity.js
node tests/runtime/first-world-target-context-continuous-batch4-integrity.js
node tests/runtime/first-world-target-context-final-batch6-integrity.js
node tests/runtime/first-world-target-context-offline-rerun-review-batch5-integrity.js
node tests/runtime/first-world-target-context-optimization-1-integrity.js
node tests/runtime/first-world-target-context-optimization-2-integrity.js
node tests/runtime/first-world-target-context-optimization-3-integrity.js
node tests/runtime/first-world-target-context-optimization-4-integrity.js
node tests/runtime/first-world-target-context-owner-batch1-integrity.js
node tests/runtime/first-world-target-context-ui-batch2-integrity.js
node tests/runtime/foreground-combat-lifecycle.cjs
node tests/runtime/foreground-combat-modes-browser.cjs
node tests/runtime/gm-character-breakthrough-batch7-2-integrity.js
node tests/runtime/gm-mainline-hp-lock-integrity.js
node tests/runtime/issue106-approved-sources.cjs
node tests/runtime/issue106-reward-yield-browser.cjs
node tests/runtime/issue106-reward-yield-integrity.js
node tests/runtime/js-integrity.js
node tests/runtime/mirror-void-formal-contract.mjs
node tests/runtime/monster-appearance-contract.mjs
node tests/runtime/newstate-save-owner-integrity.js
node tests/runtime/offline-sample-provenance-opt4-integrity.js
node tests/runtime/pr48-stop-contract.cjs
node tests/runtime/publish-build-regression.cjs
node tests/runtime/reincarnation-overlevel-batch6-1-integrity.js
node tests/runtime/reincarnation-save-integrity.js
node tests/runtime/reincarnation-transaction-integrity.js
node tests/runtime/resource-cache-integrity.js
node tests/runtime/resource-manifest-integrity.js
node tests/runtime/save-global-writers.js
node tests/runtime/save-hook-failure-regression.cjs
node tests/runtime/save-level-migration-regression.js
node tests/runtime/save-load-pipeline-integrity.js
node tests/runtime/save-migration-staircase.js
node tests/runtime/save-schema17-compatibility-matrix.js
node tests/runtime/schema18-save-roundtrip-browser.cjs
node tests/runtime/special-fast-catchup-integrity.js
node tests/runtime/thirdworld-rerun-settlement-stage-regression.js
node tests/runtime/vip-unbounded-integrity.js
node tests/runtime/issue106-character-ui-integrity.cjs
node tests/runtime/reincarnation-opt-batch3-integrity.js
node tests/runtime/alternate-universe-ui-integrity.js
node tests/runtime/browser-smoke.js
node --test tests/ci-suites.test.cjs
node scripts/build-publish-dry-run.cjs
node tests/runtime/html-cache-version-guard.js origin/main HEAD
```

另在本機 `.publish-stage3` 發布候選（port 4174）重跑角色 UI 與 browser-smoke，兩者成功；只是本機檢查，不是部署。dry run 為 `deploy=false`、missing refs=0，32 背景／6 音樂／11 音效集合維持不變。

本機判定：可建立 Issue #106 唯一整合 PR。仍須等待該 PR 所有必要 Actions 成功後，才合併並核對 Pages 部署與最新 main SHA。實機 Safari 不在本次瀏覽器模擬驗收範圍。
