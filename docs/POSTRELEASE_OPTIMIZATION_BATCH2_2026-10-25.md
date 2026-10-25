# 《文明戰線》完工後全面優化第 2 批驗收報告

日期：2026-10-25（Asia/Taipei）。範圍：Issue #100 的 #1／#2／#3／#17。僅本機施工驗收，未執行第 3 批。

## 基準與保存

- 唯一基準：重新 fetch 的 main `ee1978ea2d9c60cad53a112250b1f5f214fc33ea`。
- 本機整合分支：`integrate/postrelease-optimization-20261025`。
- 第一個修正提交：`7a551a168b529dd9a4f6224683060b08a569bd94`；其後同分支承接鏡像結算修正及本報告。最終 SHA、統計與恢復步驟列於 Issue #100 驗收留言及本機 work/batch2/DELIVERY.md。
- 未 push、未建立 PR、未合併 main、未執行 Actions／workflow_dispatch、未發布 Pages、未修改 workflows。未使用 skip-CI。
- 工作區屬雲端環境，不能保證下一個新對話仍保留同一磁碟。指定聊天 output 目錄在本環境不可寫，無法提供該目錄的下載附件。incremental Git bundle／patch 保存在本機 `work/batch2/`，bundle 以以上 main 為 prerequisite，已驗證可在另一本機空 Git 庫還原。必須承接同一環境或先從環境取出 bundle；不能宣稱程式碼已安全保存到新環境。Issue 只保存報告，不保存程式碼。
- 真實存檔只用於本機測試；原始 JSON、角色名稱與進度數值均不提交、不寫 Issue。測試透過 `RPG_SAVE_FIXTURE` 接受外部檔案。

## 問題、根因及修改

| 編號 | 分類與證據 | 修正與保護 |
|---|---|---|
| F01 | 已確認錯誤：before-save hook 拋錯只記錄 console，仍執行 baseSave；新增測試在 main 實際失敗 | `savehookcore.js` 使 before hook 的例外取消寫入；after／settlement 診斷 hook 的例外仍不阻止其他收尾 hook |
| F02 | 已確認錯誤：baseSave 拋錯直接越過 settlement hooks；GM 暫時設為 false 後不恢復 | 同一 save owner 用 finally 執行收尾，保留原始例外；正常成功／拒絕寫入契約不變 |
| F03 | 已確認錯誤：supersede 呼叫會被 GM 背景豁免擋住，舊場 waiter 無法即時解除 | `combatlifecycle.js` 共用 `invalidate`，場次替換必定使舊場失效；離頁 cancel 仍依 GM 實際背景開關；舊場不得清新 presentation |
| F04 | 已確認錯誤：雲端下載在本機 save 成功前改 owner；失敗以 JSON clone 換回 state，破壞原參照 | `cloudsave.js` 成功寫入後才 bind owner；失敗恢復原 state 參照，移除無必要的完整 JSON clone |
| F05 | 已確認錯誤：雲端讀取 await 期間切換帳號，舊請求仍可能套用到目前本機資料／上傳目前快照 | await 後重新檢查帳號；上傳同時重新檢查本機 owner。不修改 Supabase API、資料庫、RLS 或正式帳號資料 |
| F06 | 已確認重複與錯誤：鏡像整輪自行複製／回填部分 state；save 成功後 render 拋錯仍回滾記憶體，造成落盤與記憶體不一致；save 失敗又替換巢狀參照 | `mirrordungeonrun.js` 改沿既有 `runSettlementTransaction`。移除手寫部分回退；原獎勵與完成 owner 不變。資料提交完成後才更新呈現，畫面錯誤不能撤回已落盤獎勵 |

F01/F02、F03、F04/F05、F06 的新回歸測試分別在修改前重現 2、1、2、2 項失敗；修正後全通過。沒有刪測試、放寬斷言或更改玩法來取得通過。

`index.html` 同步四個 runtime 檔案的 cache token；`resource-manifest.json` 由既有產生器重新生成。歷史美術／19-4／鏡像來源鎖不改原紀錄：只以精確 before/after SHA 登記本批 lifecycle／鏡像修正，並精確投影四個 cache token；未登記的其他改動仍失敗。實際行為測試執行目前程式。

## 引用、owner 與模式檢查

68 個模組的函式、window API、根層引用來源、main／施工 SHA256 及未變更狀態見 `evidence/optimization-batch2/dependencies.json`。其中 64 個模組與 main 逐位元相同。此清單是指定核心範圍的靜態索引與路徑審查，不宣稱完成全庫所有資源逐行審核。

- 共用：`combatcore`／`combatmath` 計算，`combat-events` 事件，`combatfx` 呈現，`combatlifecycle` 單場有效性，`backgroundprogress` 連戰／補算，`settlementtransaction` 可回退提交。`hpflow`、`combatspeed`、`bosscontinuousintegrity`、`continuousrunintegrity`、`combat-viewport-coordinator` 一併查核。
- 銀河：`battlepipeline` 及 `combatcore`；檢查 target lock、busy、延後結算、普通／菁英／Boss、連戰及停止。
- 宇宙：`secondworldcombat`、`secondworldmainline`、`secondworldrewards`、`secondworldprogressmanagement`。目前正式主線是 100 Boss；沒有為字面上的普通怪／菁英新增不存在入口。
- 高維：`thirdworldcombat`、`thirdworldcombatfinalize`、`thirdworldphase`、`thirdworldprogress`、`thirdworldrun`、`thirdworldplayerflow`、`thirdworldcombatsaveguard`、`thirdworldprogressmanagement`；十王的正式 ability/effect profile、永久 HP、rewardFloorHp、checkpoint、死亡與連戰。
- 異宇宙：`alternateuniverseattempt`、`alternateuniversecombat`、`alternateuniverseprogression`、`alternateuniverseui`；200 宇宙／1000 層、attempt 恢復、正式結算與重複拒絕。
- 災厄：`calamitycore/run/state/ui`、`secondworldcalamityrun/ui`；兩紀元全部 20 定義、永久 HP、印記／文明及停止／Fast Catch-up 的既有差異。
- 副本：`dungeoncore/bounty/arena/void/voidui`、`thirdworldarena/arenaui`、`mirrordungeonstate/run/ui`、`mirrorcombatcore`；扣次、stage／樓層／整輪各自提交點、恢復及 busy 釋放。高維懸賞仍實際關閉；高維沒有新增文明災厄。
- 特殊遭遇：`specialcore`、`specialencounter`；普通主線完成與特殊遭遇 epoch 分開，特殊怪 HP defer、正式掉落與懲罰 owner 不變。
- 離線及 GM：`offlineprogress`、`offlinestatecore`、`offlineworld3adapter`、`gmbackground`、`gmformaltransaction`、`gmruntimeauthorization`；不把 GM 開關豁免套到玩家，也不把場次替換當成背景豁免。
- 存檔／登入：`savemigration`、`saveversionguard`、`storymigration`、`enhancementmigration`、`cloudsave`、`savehookcore`、`savebackupretention`、`gmdata`、`engine`、`newstatecontract`、`reincarnationstate`、`compatibilityowners`、`accountcloudintegrity`、`supabaseauth`。

### 看似重複而保留的特殊規則

| 路徑 | 不合併的理由 |
|---|---|
| 高維與兩種災厄 checkpoint | 高維削血附 EXP／弦收入與 rewardFloorHp；災厄只保存已播放正 HP，不新增逐傷害收入 |
| 銀河／宇宙／高維勝敗提交 | 各紀元有不同進度、死亡、裝備、突破、首殺與核心養成 owner；只共用生命週期及交易邊界 |
| 競技場、虛空、鏡像 | 分別是 stage、floor、20 場比分／整輪獎勵契約；不把它們壓成通用一次勝敗 |
| GM 與正式流程 | GM sandbox／正式狀態及背景權限不同；保留實際開關、鎖血及測試參數隔離 |
| 離線與 Fast Catch-up | 離線有樣本來源與時鐘規則；Fast Catch-up 消耗原呈現時間與 gap，不用即時擊殺數代替 |
| 存檔不同版本／子格式 | schema 版本、story content、offline sample、裝備補齊不是同一版本軸；不能以根 schema18 推定所有選用子欄位都齊全 |

## Schema 18 欄位與載入／往返

使用者提供的真實匯出為 Schema18，共 35 個根欄位。逐欄位比較的是實際最新 main 的正規化結果，而不是要求尚未正規化的輸入 bytes 完全不變。

| 類別 | 實際根欄位／owner |
|---|---|
| 基本角色 | saveVersion、playerName、level、exp、hp、gold、introSeen；engine／ui／level progression |
| 主線 | unlockedMap、mapProgress、bossProgress、bossLocked、bossKilled；各紀元進度 owner |
| 裝備 | equipment、inventory、lostGear；正式裝備及永久裝備規則 |
| 養成 | enhancement、specializations、vipLevel、vipPoints、vipInitialized、marks、titles |
| 世界 | secondWorld、thirdWorld、reincarnation（含突破／異宇宙） |
| 副本／日常 | dungeon、daily |
| 劇情／圖鑑 | storyProgress、monsterCodex |
| 時鐘／目標 | offline（含 pendingSettlement、checkpointId、sampleMigration）、monsterTraitPreview、pendingBlackMarketEncounter |
| 偏好／權限 | settings、gm；gm 是 runtime／匯出資料，不是跨帳號授權證明 |

流程：engine newState → savemigration／版本 guard → root 與 subsystem normalizers → dungeon interrupted-run finalize → HP／每日資料 → markSaveLoadResolved → save hooks → engine localStorage → after／settlement hooks。

JSON 匯入由 gmdata 驗證結構／版本、執行同一 migrateSave，重設離線起點，驗證寫入；雲端下載同樣先驗證／正規化再套用。未改掉既有匯入／下載的離線起點重設規則。

實際存檔及另製的有背包／遺失裝備 Schema18 fixture，均在固定時鐘及相同 RNG 下比較 main 與施工版的完整結果：第一次／第二次 migrate、JSON 匯入、本機保存／重新載入、雲端替身 upload／download，全欄位相同；migrate 重複執行亦一致。真實存檔不被寫回使用者裝置或正式雲端。可選 `rewardFloorHp`／鏡像 resume 由既有 19-4 合成回歸另測。

### 歷史遷移刪留結果

- `SAVE_SCHEMA_VERSION` 仍是18，沒有更動任何持久欄位語意。
- 本批沒有刪除 Schema1–17 遷移或改成 current-only 政策，`SAVE_MIN_SUPPORTED_VERSION=1`／`all-known` 保留；**不把這個結果描述成歷史格式已全面退役**。
- 真實檔案證明目前這份資料的往返，但不能證明裝置上所有既存備份、其他有效 JSON、雲端副本與 Schema18 選用子欄位的來源／完整性。依「無法證明刪除安全則保留」原則，保留版本專屬 EXP 與 pre16／pre17 初始化分支；它們對有效 Schema18 不執行。這是本批保守刪留決定，不是新增維護歷史玩家的需求。
- `prepareAllGear` 在 root normalizer 前後用途不同：前者保留可恢復舊裝備殘餘能力，後者處理 normalizer 產出；不是只因名字相同就刪一遍。Schema18 匯入仍可能需要缺值修復。
- `storymigration` 的延遲 catalog 安全、劇情進度回填與 content version 不等於根 schema；`enhancementmigration` 主要是正式 integrity 探針，不是可直接移除的資料遷移 owner。
- shop／舊 dungeon 欄位／GM transient 清理仍由正式 migrateSave 呼叫，兼具不讓暫存污染有效存檔的用途；不依真實檔案暫時沒有該欄位就移除。
- `savebackupretention` 的舊備份 key 不等於無效進度：全部保留，未執行 prune，未清除任何備份。
- 實際精簡：雲端失敗回退不再完整 clone 原 state；鏡像不再維護自己的部分 state clone／回退邏輯。沒有刪除任何有效存檔欄位或檔案。

## 本機驗證與失敗追查

完整最終結果與執行歷程見 `evidence/optimization-batch2/test-results.json`；下表逐一列出測試名稱。PASS 指各測試原斷言通過，不能推論涵蓋所有 RNG／技能組合或真機。

56 個最終測試執行項全通過（包含真實／合成 fixture 兩次分別執行）；另有 87 筆 runner 執行歷程。

| 測試（tests/runtime/ 下） | 最終結果 |
|---|---|
| `alternate-universe-all-depths-browser.cjs` | PASS |
| `alternate-universe-attempt-integrity.js` | PASS |
| `alternate-universe-batch4-3-regression.js` | PASS |
| `alternate-universe-combat-integrity.js` | PASS |
| `alternate-universe-data-integrity.js` | PASS |
| `alternate-universe-failure-integrity.js` | PASS |
| `alternate-universe-old-save-integrity.js` | PASS |
| `alternate-universe-progression-integrity.js` | PASS |
| `alternate-universe-ui-integrity.js` | PASS |
| `batch16-mirror-browser.cjs` | PASS |
| `batch20-approved-runtime.cjs` | PASS |
| `batch20-cloud-browser.cjs` | PASS |
| `batch20-save-guide-browser.cjs` | PASS |
| `calamity-shared-terminal-fast-catchup-integrity.js` | PASS |
| `calamity-terminal-dynamic-opt-batch2.js` | PASS |
| `cloud-save-failure-regression.cjs` | PASS |
| `combat-events-contract.cjs` | PASS |
| `combat-events-integration.cjs` | PASS |
| `cross-combat-stale-continuous-regression.cjs` | PASS |
| `cross-era-background-browser.js` | PASS |
| `cross-mode-late-settlement-regression.cjs` | PASS |
| `foreground-combat-checkpoints-browser.cjs` | PASS |
| `foreground-combat-lifecycle.cjs` | PASS |
| `foreground-combat-modes-browser.cjs` | PASS |
| `foreground-combat-recovery-browser.cjs` | PASS |
| `formal-combat-catalog-browser.cjs` | PASS |
| `gm-formal-writer-convergence-batch2-integrity.js` | PASS |
| `gm-runtime-auth-preferences-integrity.js` | PASS |
| `gm-runtime-early-restore-integrity.js` | PASS |
| `js-integrity.js` | PASS |
| `mirror-settlement-failure-regression.cjs` | PASS |
| `mirror-void-formal-browser.cjs` | PASS |
| `mirror-void-formal-contract.mjs` | PASS |
| `mirror-void-recovery-browser.cjs` | PASS |
| `newstate-save-owner-integrity.js` | PASS |
| `offline-sample-provenance-opt4-integrity.js` | PASS |
| `pr48-live-combat-browser.cjs` | PASS |
| `pr48-mode-matrix-browser.cjs` | PASS |
| `reincarnation-normalization-opt-integrity.js` | PASS |
| `reincarnation-permanent-gear-formal-flow-regression.js` | PASS |
| `reincarnation-save-integrity.js` | PASS |
| `reincarnation-transaction-integrity.js` | PASS |
| `resource-manifest-integrity.js` | PASS |
| `save-global-writers.js` | PASS |
| `save-hook-failure-regression.cjs` | PASS |
| `save-level-migration-regression.js` | PASS |
| `save-load-pipeline-integrity.js` | PASS |
| `save-migration-staircase.js` | PASS |
| `save-schema17-compatibility-matrix.js` | PASS |
| `special-fast-catchup-integrity.js` | PASS |
| `thirdworld-background-browser.js` | PASS |
| `thirdworld-rerun-settlement-stage-regression.js` | PASS |
| `unified-combat-runtime-contract.cjs` | PASS |
| `schema18-save-roundtrip-browser.cjs (private fixture)` | PASS |
| `schema18-save-roundtrip-browser.cjs (synthetic inventory/lostGear)` | PASS |
| `docs-integrity.js` | PASS |

另通過 `git diff --check`、HTML cache guard 自測及 main→施工提交的四個直接載入 JS 版本檢查。

失敗追查：

1. 原環境缺少 Playwright 對應 Chromium；安裝 matching build 後，受影響的全部既有測試重新通過。
2. 新 roundtrip harness 最初未明確載入延後 GM group，等待 gmValidateImportedSave 逾時；補上正式 group 載入後通過。synthetic fixture 原有隨機新裝備造成兩頁比較不同，改為 baseline／施工兩頁使用相同 seeded RNG；沒有改遊戲 RNG。
3. 本批新增錯誤回歸先重現 F01–F06，再修 runtime，未放寬原斷言。
4. 鏡像歷史 exact-source contract 初次拒絕本批 lifecycle 修改；新增本批精確 before/after SHA 層後，保留原歷史來源與全部斷言，重新通過。
5. 一次指令把 `mirror-void-recovery-browser.cjs` 誤寫為不存在的 `mirror-void-run-recovery-browser.cjs`；該次是測試命令失敗，不是遊戲失敗。改正現有檔名後實際執行並通過，執行歷程保留於證據。
6. 部分舊 dev-mode browser 測試會輸出歷史 integrity warnings（例如被 fixture 替換的 GM 背景函式觸發來源契約診斷）。19-4 文件已記載此測試界線；未把 console 警告當成遊戲動態斷言成功的替代。production 路徑另由 foreground／mirror／pr48 測試檢查 pageerror。未修改或隱藏診斷。

### 動態範圍及限制

- 正式敵人定義：銀河 500、宇宙 100、高維 10、兩紀元災厄 20、特殊怪 18，合計648定義，各跑勝／敗，共1296案例。用正式 core／adapter 和固定 fixture 玩家能力；不是1296次人工 UI 通關，也不是每種技能與 trait 組合的窮舉。
- 異宇宙1000層：正式 begin、同 attempt 恢復、實際 core 勝利、正式 settle、重複 settle 拒絕，各1000次；使用固定 RNG／合成能力，不代表全部隨機詞綴組合。
- foreground modes：各紀元實際主線／懸賞／競技、特殊怪、兩災厄、三紀元虛空／鏡像、異宇宙；退役入口不存在、高維懸賞不可進維持原樣。
- 19-4 checkpoint：已播放正HP／致命尾端、5秒、save失敗、回血重削防重、最終獎勵、crash後恢復、鏡像完成場保留。
- GM：實際背景開關、跨紀元背景與高維背景、場次替換 waiter、正式存檔 hook 失敗收尾。
- 停止／連戰：pr48兩視窗模式矩陣、原停止 handler、兩輪高維異相完整三連戰、late callback／stale owner；單場 cancel 重複、異宇宙 begin 重複均有斷言。沒有宣稱對每個 UI 做無限次連按壓測。
- 本機只有 Linux Chromium 自動化。未測 iPhone Safari 真機、OS鎖屏／強制終止、原生 bfcache、實際耗電／溫度／長時間記憶體；注入 pagehide/visibility/blur 不等同真機。
- 未操作正式帳號登入、Supabase正式資料表、真實雲端上下載；雲端測試為本機 in-memory transport。沒有正式 Pages 驗收，Actions 刻意未執行。
- 沒有宣稱性能改善；共用交易使鏡像失敗回復一致，未量測整份 snapshot 的性能差異，交第3批量測。

## 修改量與第3批依賴

精確總檔案數、刪除數、程式／證據增減量及最終 commit 列於 Issue 驗收留言及本機交付紀錄（可由 `git diff --stat ee1978ea..HEAD` 重現）。沒有刪除檔案、沒有移除任何玩家進度、沒有美術異動。

第3批必須承接此本機整合分支／bundle，不從 main 另起而丟掉本批修正。性能量測時保留 `combatlifecycle.invalidate` 的替換與離頁差異、Save Hook finally 收尾、雲端 owner 只在寫入成功後更新、鏡像共用交易邊界，以及全部19-4 checkpoint／rewardFloorHp／resume規則。

可使用本批1000層／648定義測試和私有 Schema18 roundtrip 建立安全基線；私有原檔不在 Git，跨環境若要再次測真實資料，須重新提供 fixture 路徑。依賴清單與測試結果保存在本報告旁。歷史遷移保留項不得在後續性能整理中順手刪除，若要進一步退役，仍須逐項提供當前有效資料及復原路徑證據。

本批到此停止；未自動啟動第3–6批或集中驗收。
