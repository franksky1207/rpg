# 《文明戰線》目前待辦狀態

更新日期：2026-10-04  
分支：`main`

> `main` 是唯一真實來源。本檔只保留 current main 的正式現況、仍有效相容策略，以及真正尚未完成工程。

## 目前正式狀態

- `SAVE_SCHEMA_VERSION = 17`；Batch7 沒有新增正式 persistent root，因此不升 Schema18。
- 銀河紀元、宇宙紀元、高維紀元三紀元 runtime 已完成；高維紀元為 Lv.1000～2000。
- 轉生／突破核心、異宇宙 Batch3～4、AU 架構優化、Batch5 重征服、Batch6 與 Batch6 程式碼優化第1～5批均已完成。
- **Batch7：GM／測試工具正式收尾 7-1～7-5 已完成。**
- 下一個獨立大型工程：**第一紀元完整 Target Context 重構**；目前尚未施工，不能與 Batch7 混在一起。

## 第6大批正式規則（仍有效）

### 1. 轉生越級 Online／Offline 收益

- 共用 `reincarnationoverlevelrewards.js`。
- 倍率：`M = 1 + 0.03 × (enemyLevel - playerLevel)`，只在 `reincarnation.count > 0` 且敵人高於玩家時啟用；整數收益採 `ceil(base × M)`。
- 首輪 `count=0` 永遠為 1×。
- W1 Online：EXP、金幣、戰鬥來源基礎／進階強化石可吃倍率；出售收益排除。
- W2 Online：EXP、暗物質、暗能量可吃倍率；出售收益排除。
- W1／W2 Offline 共用相同 multiplier owner；沒有可靠等級 provenance 的舊 sample／pending 採保守 1×。
- W3 Offline 完全不接越級倍率。

### 2. 共用批次成長

- 唯一 owner：`playerbatchupgrades.js`。
- 專精「一鍵平均提升」只在第一紀元。
- 強化「平均最大強化」在第一、第二紀元。
- 共用正式成本 owner；第三紀元不提供玩家強化操作。

### 3. 四大副本永久入口

- 第一次轉生後，懸賞戰、競技場、鏡像戰、虛空幻境入口永久可用。
- 首輪高維紀元仍維持「懸賞戰關閉」。
- Daily 不因轉生重置；Mirror／Void 永久歷史保留；W1／W2 Arena current-life 進度每次轉生重置。
- Arena 晉階驗收仍為 500 場／485 勝（97%）。

### 4. W1／W2 轉生主線正式向下征服

- W1 rerun 高階 Boss 勝利會正式回填此前主線；例如 Lv.500 Boss 代表 Lv.500以前的普通／菁英進度、Boss 前置、`bossKilled`、`unlockedMap` 一致完成。
- W2 rerun 高階 Boss 勝利同樣正式回填；Lv.1000 Boss 代表 Boss0～99 正式完成。
- 首輪 `count=0` 永遠拒絕這項 rerun 回填。
- 正式 owner：`reincarnationrerunprogress.js`。

## 2026-10-04 第6大批程式碼優化第1批：Schema17 舊轉生資料一致化

- `normalizeExistingReincarnationRerunProgress()` 只處理 `count>0`，依既有最高正式 Boss 補齊早期 Schema17 rerun 主線缺口。
- normalization 冪等，首輪隔離，不升 Save Schema。

## 2026-10-04 第6大批程式碼優化第2批：四大副本永久入口架構整理

- 共用 `dungeonModeAccessSnapshot()`／`isDungeonModeEntryUnlocked()`。
- 已移除暫時偽裝 `state.level` 的方案；正式 `state.level` 不再被偽裝。
- UI 與正式入口共用同一 eligibility owner。

## 2026-10-04 第6大批程式碼優化第3批：一鍵專精／強化交易安全

- 共用 `runSettlementTransaction()`。
- 成功單一 save；`save(false)` 與 save exception rollback。
- rollback 保留 root identity 與 nested reference identity。
- `PLAYER_BATCH_UPGRADE_TRANSACTION_VERSION = 1`。

## 2026-10-04 第6大批程式碼優化第4批：Offline 舊樣本 provenance 安全化

- `OFFLINE_REWARD_CONTEXT_PROVENANCE_VERSION = 1`。
- 只有可驗證等級來源才標記 `overlevelContextRecorded=true`。
- 舊 V4 pending 沒有明確 marker 時固定保守 1×。

## 2026-10-04 第6大批程式碼優化第5批：戰鬥 wrapper 收斂＋Batch6 最終行為 regression

- W1 `fightOnce` 回到唯一 settlement/save owner。
- `MAINLINE_OVERLEVEL_REWARD_INTEGRATION_VERSION = 1`。
- `REINCARNATION_OVERLEVEL_W1_ADAPTER_VERSION = 2`。
- `REINCARNATION_OVERLEVEL_FIGHT_WRAPPER_RETIRED_VERSION = 1`。
- Regression 鎖定 Arena 484 / 500 不通過、485 / 500 通過，以及 W1 正式 save 只呼叫一次。

## 第6大批程式碼優化封箱

- 第6大批 6-1～6-5 均已完成。
- 第6大批程式碼優化第1～5批已完成；優化第1～5批全部完成。

# Batch7：GM／測試工具正式收尾（已完成）

## 7-1 GM 正式突破管理

- 只有 `reincarnation.count > 0` 才顯示／可用；首輪完全隔離。
- GM 只設定「總突破次數」。
- 系統自動 canonical rebuild 轉生次數與本輪 milestones；例如 25 次突破 = 第3次轉生、本輪5次突破。
- GM 可上下調；正式能力、戰鬥、存檔與相關 UI 一致更新。
- 正式 mutation 走 transaction，不以 GM UI 維護第二套狀態。

## 7-2 角色能力測試同步突破能力

- 突破不是獨立戰鬥模式，而是測試角色能力的一部分。
- 「同步正式角色到測試設定」會同步正式突破等級。
- 首輪同步固定突破 Lv.0；轉生後才有突破能力。
- sandbox 不寫正式 save。

## 7-3 GM 異宇宙正式進度管理

- GM 只需要設定「最深已完成層域」，不再手動選已解鎖／未解鎖。
- 正數進度自動維持／建立 AU 解鎖；0 層域不會任意反轉既有解鎖狀態。
- 正式操作走 shared transaction；調整 frontier 時清理舊 activeAttempt 與 current-life failures。
- 玩家／GM可見進度用語固定「層域」。

## 7-4 異宇宙戰力基準＋21 雙特性 diagnostics

- 異宇宙已整合進既有「戰力基準測試」，成為第8種模式；不是另外增加第9個 GM 測試大區塊。
- 異宇宙各王以王編號 1～1000 直接輸入，支援上一隻／下一隻；同一頁 session 保留目前王編號，重新整理／新開頁面回第1隻。
- 測試角色共用既有角色能力測試 snapshot。
- 7種 traits 兩兩組合 `C(7,2)=21` 全部由內部 diagnostics 驗證；不把 trait diagnostics 塞到 GM UI。
- AU benchmark 共用正式敵人、trait、combat/stat owner，不建立第二套戰鬥公式。

## 7-5 最終多生命週期／GM formal-sandbox／摘要封箱

- 新增 `tests/runtime/reincarnation-batch7-closure.js` 並納入 Runtime Integrity。
- 首輪不發突破；Life1 跨100～1000正式取得10次，重複／Lv1000以上不再發；Life2 milestones 重新歸零但永久突破保留。
- AU deepest 永久保留；新生命 activeAttempt 與 `lifeFailures` 重置到新 lifeId。
- Offline samples／pending settlement 在轉生時清空並重設 settlement 時點。
- W1/W2 Arena current-life reset；Mirror/Void 永久歷史保留。
- 第一次轉生後四大副本永久入口、rerun overlevel 等既有規則在多生命週期下維持有效。
- GM AU formal snapshot 為 read-only；GM 角色測試與 AU benchmark 不污染 formal state、不呼叫 formal save。
- 戰力基準正式為 **8模式**；清空後顯示 `0 / 8`，跑 AU 後 `1 / 8`。
- 角色測試能力變更後舊 benchmark 結果立即失效，摘要回 `0 / 8`；修正原先未測卻殘留 `1 / 7` 的問題。
- AU 王編號 session 行為：同頁切換保留；reload／new page 回第1隻。

# Batch7 硬規則（後續不得倒退）

- GM 正式 level 若未來會被其他控制器調整，仍必須共用突破 milestone owner：首輪不發；轉生輪只對實際跨過 100／200／…／1000 發；降級不扣、已領不重複、Lv.1000以上不再增加本輪突破。
- formal management 與 test sandbox 永遠分離。
- 突破正式用語是「突破等級」。
- AU 正式進度用語是「層域」。
- 戰力基準模式數量 current = 8。

# 真正下一個尚未完成工程：第一紀元完整 Target Context 重構

這是 Batch7 之後的**獨立大型工程**，目前尚未施工。

目標不是改玩法，而是讓同一次 W1 battle 自 UI 到 settlement 使用同一份明確 target context：

```text
UI → prepare → encounter → combat → settlement → progression
```

核心 target identity：

```text
mapIndex / enemyIndex
```

範圍需覆蓋：普通、菁英、Boss、單場、連續、Minimal Mode、Fast Catch-up、特殊遭遇、Offline sample、回顧戰隔離、settlement、progression。

必須保留現有玩法語意：首輪 sequential progression、地圖/Boss解鎖、回顧戰零正式收益、轉生向下征服、越級收益、Offline、特殊遭遇與 Fast Catch-up。

開工前必須 fresh-read W1 battle／encounter／settlement／offline／progression consumer；不可新增第二套 progression/combat/offline/target owner。

## 已取消／不得自動復活

- AU 作為 Lv.2001+ 或第四紀元。
- VIP21+ 新增特殊特權。
- AU replay／review。
- 高階 Boss 只記自身、不正式回填前段主線的舊規則。
- 任何 GM sandbox 寫正式 save 的做法。

## 操作規範

- `main` 是唯一真實來源；修改前先重新讀相關正式 owner／consumer。
- 使用者說「先討論／先檢查／先不要修改」時不得修改；說「修改／做／執行／第N批」可直接修改 `main`。
- JS／CSS production 變更必須同步更新 `index.html` cache-bust。
- 每批完成後 fresh-read current main、compare base→head，自我檢查 UI、邏輯、正式 state、舊檔、transaction、regression；沒有 exact HEAD 的 Actions success 不可宣稱完成。
