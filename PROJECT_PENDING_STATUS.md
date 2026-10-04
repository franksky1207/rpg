# 《文明戰線》目前待辦狀態

更新日期：2026-10-04  
分支：`main`

> 本檔只記 current `main` 的正式現況、重要相容策略與真正尚未完成項目。若舊 handoff、舊對話、舊 Word、舊 regression 說明或歷史文件與 current `main` 衝突，一律以 current `main` 為唯一真實來源。

## 目前正式狀態

- `SAVE_SCHEMA_VERSION = 17`；目前沒有新增正式存檔欄位，因此不升 Schema18。
- 銀河紀元、宇宙紀元、高維紀元三紀元 runtime 已完成；高維紀元為 Lv.1000～2000。
- 轉生／突破核心、異宇宙 Batch3～4、轉生後重征服 Batch5、Batch5 後續架構優化，以及第6大批 6-1～6-5 均已完成。
- 第6大批完成內容：轉生越級 Online／Offline 收益、一鍵平均專精／平均最大強化、首次轉生後四大副本永久入口、主線正式向下征服回填，以及 Batch6 完整封箱 Regression。
- 第6大批程式碼優化第1～3批已完成；目前主要施工剩餘：Batch7，以及優化第4～5批。

## 第6大批正式規則

### 1. 轉生越級 Online／Offline 收益

- 共用 `reincarnationoverlevelrewards.js`。
- 倍率：`M = 1 + 0.03 × (enemyLevel - playerLevel)`，只在 `reincarnation.count > 0` 且敵人高於玩家時啟用；整數收益採 `ceil(base × M)`。
- 首輪 `count=0` 永遠為 1×，既有首輪 EXP／資源公式不改。
- W1 Online：EXP、金幣、戰鬥來源基礎／進階強化石可吃倍率；裝備出售與出售轉換資源排除。
- W2 Online：EXP、暗物質、暗能量可吃倍率；裝備出售排除。
- W1／W2 Offline 共用同一 multiplier owner，並以正式樣本的 `playerLevel / enemyLevel` 為準；沒有可靠等級 context 的舊 pending 採保守 1×。
- W3 Offline 完全不接越級倍率。

### 2. 共用批次成長

- 唯一 owner：`playerbatchupgrades.js`。
- 專精「一鍵平均提升」只在第一紀元可用，優先提升目前最低等級專精，最高 Lv.60。
- 強化「平均最大強化」在第一、第二紀元可用，優先提升目前最低強化欄位；第一紀元最高 +20，第二紀元最高 +40。
- 首輪與轉生輪使用同一套正式成本 owner，不以 `reincarnation.count` 分叉。
- 印記、文明等級不納入；第三紀元不提供這兩項批次提升。

### 3. 四大副本永久入口

- 第一次轉生後，懸賞戰、競技場、鏡像戰、虛空幻境入口永久可用，沿用原本副本頁與正式模式 owner，不建立轉生專用副本 UI。
- 首輪仍使用原本等級／紀元條件；首輪高維紀元仍維持「懸賞戰關閉」。
- Daily 不因轉生重置；Mirror／Void 永久歷史保留；W1／W2 Arena 本輪進度每次轉生重置。
- Arena 原本 500 場／485 勝（97%）的晉階驗收規則不變。

### 4. W1／W2 轉生主線正式向下征服

目前正式語意已覆蓋早期「只記實際最高 Boss、不回填低階 Boss」的舊設計：

- 轉生重征服擊敗高階主線 Boss，代表其以前的主線內容正式視為已征服。
- W1 例如擊敗 Lv.500 Boss：Lv.500以前的普通／菁英進度、Boss 前置、Boss 解鎖、`bossKilled` 與 `unlockedMap` 都正式回填到一致狀態；只打到中途 Boss 就只回填到該處。
- W2 例如擊敗 Lv.1000 Boss：Boss0～99 正式完成；若只擊敗 Boss59，就只完成 Boss0～59。
- 因此 Arena、文明災厄、地圖完成與後續任何依賴正式主線狀態的功能，都直接讀一致的正式資料，不再依賴「高階 flag + 假想 downward coverage」維持兩套語意。
- `reincarnationrerunprogress.js` 是正式回填 owner；首輪 `count=0` 永遠拒絕這項 rerun 回填。

## 2026-10-04 第6大批程式碼優化第1批：Schema17 舊轉生資料一致化

- `reincarnationrerunprogress.js` 新增冪等 `normalizeExistingReincarnationRerunProgress()`。
- `migrateSave()` 完成既有 Schema17 normalization 後，若 `reincarnation.count > 0`，依目前已完成的最高 W1／W2 Boss 正式補齊以前的主線紀錄。
- 只修正同為 Schema17、但建立於早期「不回填」語意期間的轉生存檔；pre-Schema17 仍依原 migration 政策初始化為 `count=0`，不會被誤判為已轉生。
- normalization 為冪等：第一次若有舊資料缺口會修正，第二次再跑 `changed=false`。
- 首輪 `count=0` 完全隔離；即使測試資料人工放入高階 Boss flag，也不會由此 owner 回填低階進度。
- `LAST_SAVE_MIGRATION_REPORT` 會記錄 rerun progression normalization 版本、是否實際修正，以及 W1／W2 最高修正位置。
- 不新增欄位、不升 Save Schema；正式 production JS 有改動時仍須更新 `index.html` cache-bust。
- `tests/runtime/reincarnation-rerun-batch5-e2e-regression.js` 已改為驗證目前正式語意：真實高階勝利會正式向下回填，並新增 Schema17 舊轉生 fixture、冪等與首輪隔離 regression。

## 2026-10-04 第6大批程式碼優化第2批：四大副本永久入口架構整理

- `reincarnationdungeonaccess.js` 升為 V2，新增唯一共用 `dungeonModeAccessSnapshot()`／`isDungeonModeEntryUnlocked()`；四大副本的轉生永久入口資格集中由同一 access snapshot 表達。
- 已完全移除舊 `withMinimumEntryLevel()` 與暫時把 global `state` 換成假 `level` presentation view 的做法；正式 `state` 參照與 `state.level` 在副本入口判定期間不再被偽裝。
- 懸賞戰、競技場、虛空幻境的正式入口函式改為直接動態讀共用 access owner；鏡像戰沿用原正式 daily/history owner，只由同一 access snapshot 放寬轉生後入口，不建立第二套副本狀態。
- 副本首頁最終卡片狀態與正式入口共用相同 access snapshot；轉生後顯示「轉生後永久解鎖」，Daily 用盡仍維持按鈕停用。
- 首輪 `count=0` 完整保留原門檻：懸賞 Lv.5、競技場 Lv.15、虛空 Lv.25、鏡像依既有 config；首輪高維紀元懸賞仍關閉。
- W1 rerun Arena cap 仍依本輪主線 key boss coverage；W2 Arena owner、500場／485勝 97% 驗收、Daily、Mirror/Void 歷史與轉生 reset 規則均未改。
- 本批不新增存檔欄位、不改 Save Schema、不改戰鬥／收益公式；只收斂入口與 UI 資格架構。
- `tests/runtime/reincarnation-dungeon-access-batch6-4-integrity.js` 已升級為架構 regression：同時驗證首輪門檻、轉生 Lv.1 四入口、正式 state identity／level 穩定、W3 懸賞政策、Arena cap，以及 production source 已無暫時 level presentation helper。

## 2026-10-04 第6大批程式碼優化第3批：一鍵專精／強化交易安全

- `playerbatchupgrades.js` 升為 V2，批次寫入正式改為共用既有 `runSettlementTransaction()`；不再自行建立 JSON snapshot，也不再以 `state = snapshot` 取代正式 root state。
- 專精與強化的 preview、成本 owner、最低等級優先演算法、按鈕位置、紀元範圍與首輪／轉生共用規則全部不變；本批只收斂正式交易與 rollback 架構。
- 每次一鍵操作只做一次正式 save；`save(false)` 回傳 false 或 `save()` 丟出例外時，都由 shared transaction 完整 rollback。
- rollback 會保留原本 formal `state` root identity，也保留已存在的 `specializations`、`enhancement`、`enhancement.levels` 等 nested reference identity，避免舊 UI／runtime 持有的參照失效。
- 交易成功仍沿用原本正式資源扣除與等級結果；交易失敗則不留下部分扣款、部分升級或 HP normalization 殘留。
- `PLAYER_BATCH_UPGRADE_TRANSACTION_VERSION = 1`；正式共用 transaction owner 維持 `SHARED_SETTLEMENT_TRANSACTION_VERSION = 2`。
- `tests/runtime/player-batch-upgrades-batch6-2-integrity.js` 已擴充驗證：單次 save、save false rollback、save exception rollback、root/nested identity、首輪／轉生結果一致、W2 專精鎖定及 W3 操作隱藏。
- 本批不新增存檔欄位、不升 Save Schema，也不修改任何專精／強化成本公式。

## 第6大批後續優化排程

1. **優化第4批：Offline 舊樣本 provenance 安全化**
   - V3→V4 明確區分可靠與缺失的 player/enemy level；不可靠越級 context 固定 1×。
2. **優化第5批：戰鬥 wrapper 收斂＋Batch6 最終行為 regression**
   - 收斂 W1 `fightOnce` 多層 wrapper；將 Arena 97% 與出售隔離由 source-string 檢查提升為正式行為測試。

## Batch7 尚待施工

- GM／測試工具正式收尾。
- GM 等級設定器必須共用突破 milestone owner：首輪不增加；轉生輪跨越 100／200／…／1000 才增加；降級不扣、已領不重複、Lv.1000以上不再增加本輪突破。
- 進入 Batch7 前仍須先重新讀取 current `main` 實碼。

## 已取消／不得自動復活

- AU 作為 Lv.2001+ 或第四紀元。
- VIP21+ 新增特殊特權。
- 任何與 current `main` 衝突的舊「高階 Boss 只記自身、不正式回填前段主線」規則。

## 操作規範

- `main` 是唯一真實來源；修改前先重新讀相關正式檔案。
- 使用者說「先討論／先檢查／先不要修改」時不得修改；說「修改／做／執行／第N批」可直接修改 `main`。
- JS／CSS production 變更必須同步更新 `index.html` cache-bust。
- 每批完成後重新讀取修改檔案並自我檢查 UI、邏輯、正式 state 寫入、舊存檔、transaction 與 regression；精確 HEAD 的 Runtime／Pages 必須通過，Story 僅在相關 production 變更時檢查。
