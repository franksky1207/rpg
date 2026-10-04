# 《文明戰線》目前待辦狀態

更新日期：2026-10-04  
分支：`main`

> 本檔只記 current `main` 的正式現況、重要相容策略與真正尚未完成項目。若舊 handoff、舊對話、舊 Word、舊 regression 說明或歷史文件與 current `main` 衝突，一律以 current `main` 為唯一真實來源。

## 目前正式狀態

- `SAVE_SCHEMA_VERSION = 17`；目前沒有新增正式存檔欄位，因此不升 Schema18。
- 銀河紀元、宇宙紀元、高維紀元三紀元 runtime 已完成；高維紀元為 Lv.1000～2000。
- 轉生／突破核心、異宇宙 Batch3～4、轉生後重征服 Batch5、Batch5 後續架構優化，以及第6大批 6-1～6-5 均已完成。
- 第6大批完成內容：轉生越級 Online／Offline 收益、一鍵平均專精／平均最大強化、首次轉生後四大副本永久入口、主線正式向下征服回填，以及 Batch6 完整封箱 Regression。
- 目前主要施工剩餘：Batch7；另有第6大批程式碼優化第2～5批依序待處理。

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

## 第6大批後續優化排程

1. **優化第2批：四大副本永久入口架構整理**
   - 移除以暫時 global `state.level` presentation view 繞過最低等級的方式。
   - 功能資格與 UI 卡片改共用同一 access snapshot。
2. **優化第3批：一鍵專精／強化交易安全**
   - 改共用既有 `runSettlementTransaction()`；補 save throw／rollback／state identity regression。
3. **優化第4批：Offline 舊樣本 provenance 安全化**
   - V3→V4 明確區分可靠與缺失的 player/enemy level；不可靠越級 context 固定 1×。
4. **優化第5批：戰鬥 wrapper 收斂＋Batch6 最終行為 regression**
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
