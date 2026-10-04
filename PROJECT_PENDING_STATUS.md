# 《文明戰線》目前待辦狀態

更新日期：2026-10-04  
分支：`main`

> 本檔記錄真正尚未完成、重要已修紀錄與刻意延後工作。若本檔、舊 handoff、舊對話、舊 Word 或歷史文件與 current `main` 衝突，一律以 current `main` 為準。

## 目前正式狀態

- `SAVE_SCHEMA_VERSION = 17`。
- 銀河紀元、宇宙紀元、高維紀元三紀元正式 runtime 已完成；高維紀元 Lv.1000～2000、10 名高維存在、首輪 5pp、永久削血、維度之弦、界弦核心、Story／Final、Arena、loot／offline 與回顧均已實作。
- 轉生／突破核心、正式轉生流程與優化第1～4批已完成。
- 異宇宙 Batch3～4 已完成。
- 轉生後重征服 Batch5-1～5-5 已完成。
- Batch5 後續架構優化共 4 批已全部完成：第1批「W1 Target Context／prepare 正式 state 隔離」、第2批「W2 visibility owner 收斂」、第3批「共用 UI renderer 收斂」、第4批「完整端到端 regression 封箱」。
- 目前主要施工剩餘：Batch6、Batch7。

## 2026-10-04 已修：W1／W2 轉生重征服目標一致性

W1 曾發生轉生後點 Lv.500 Boss，舊 `adventurePreparePage()` 以 `selectedMap = Math.min(selectedMap, state.unlockedMap)` 把 map99 壓回 map0，導致準備頁、戰鬥、實際 encounter 與 `bossKilled` 都變成低階目標，並使 key boss downward coverage／文明災厄無法正確成立。

本次已修正：

- 首輪 `count=0` 完整沿用原本 sequential progression，不改首輪解鎖規則。
- W1 rerun 在 prepare 階段保留玩家真正選定的 map；正式 `state.unlockedMap` 不會被偽造或永久改寫。
- rerun 下普通／菁英／Boss 仍依既有 rerun policy 可直接選擇。
- regression 已固定驗證 map99 + Boss → prepare Lv.500 → combat Lv.500 → encounter Lv.500，且 `unlockedMap` 仍為 0。
- W2 重新檢查後沒有同類 production bug；既有流程仍由 Boss `index` 從 UI → challenge → encounter → combat → settlement 一路直傳。
- W2 regression 已固定驗證 Boss index99 的正式定義與 encounter 均為 Lv.1000 且同一 Boss。

## 2026-10-04 已完成：Batch5 後續架構優化第1批（W1 Target Context）

- 新增正式 `firstWorldReincarnationTargetContext()`，把 rerun 當前 `mapIndex / enemyIndex` 以不可變 context 固定下來。
- W1 rerun prepare 不再直接暫時改寫正式 `state.unlockedMap`。
- prepare 只在同步 render 期間使用 presentation state view 讓既有首輪 UI owner 正常渲染；離開後一定恢復原正式 `state` 參照與原 `selectedMap / selectedEnemy`。
- 首輪 `count=0` 仍完整委派原 `adventurePreparePage()`，首輪 sequential progression 不變。
- regression 已固定驗證 map99 + Boss 的 target context 為 `99 / 4`、prepare 前後正式 state JSON 完全不變、全域 `state` 參照正確恢復、`unlockedMap` 仍為 0。

## 2026-10-04 已完成：Batch5 後續架構優化第2批（W2 Visibility Owner）

- 第二紀元冒險區域顯示與 Arena 區域資格正式拆成不同語意 owner：`secondWorldAdventureRegionVisible()` 與 `secondWorldArenaRegionEligible()`。
- `secondWorldRegionVisible()` 恢復／保留原本「冒險主線區域是否顯示」的相容語意，不再承擔 Arena qualification。
- `dungeonprogress.js` 的第二紀元 Arena cap 改為優先讀 `secondWorldArenaRegionEligible()`；若新 owner 不存在才 fallback 舊 API。
- rerun 冒險頁不再為了顯示 10 區而暫時覆寫 `window.secondWorldRegionVisible`；所有 10 區直接由 adventure owner 判定為可顯示。
- rerun Arena 仍依本輪最高 key boss downward coverage 限制；零 coverage 時最低仍為第1區，coverage 6 時為前6區，coverage 10 時全10區。
- 首輪 `count=0` 的冒險顯示與 Arena cap 均委派原本第二紀元 progression 規則，不改首輪行為。
- regression 已固定驗證 rerun 冒險 render 前後三個 region owner 函式 identity 不變、正式 state JSON 不變、10區全顯示，而 Arena eligibility 仍依 coverage 分離運作。
- 此批沒有新增存檔欄位、沒有變更 Save Schema，不需要 migration。

## 2026-10-04 已完成：Batch5 後續架構優化第3批（共用 UI Renderer）

- `combatspeed.js` 新增正式共用速度徽章／標頭 renderer：`combatSpeedBadgeHtml()`、`combatSpeedHeaderHtml()`；W1 rerun 戰鬥標頭改由共用 renderer 產出，不再用 regex 改寫首輪 HTML。
- W1 首輪 `count=0` 不顯示額外速度徽章；轉生後 1.5× 解鎖時，rerun 戰鬥標頭使用正式 `.universe-combat-speed` 徽章，Minimal Mode 仍直接讀相同徽章節點。
- W3 rerun 不再對首輪 HTML 使用 `replaceAll()`；改為結構化讀取 `thirdWorldReincarnationRerunContext()` 與各 Boss `challengeStatus.fivePointBypassed`，只改對應 Boss 狀態文字與 rerun 戰鬥規則說明。
- W3 首輪 UI 不經 rerun presentation owner，5% 戰線原規則與文案維持不變；rerun 只在正式 policy 已解除 `five-point-front` 時顯示「可集中攻略」文案。
- regression 已固定驗證 W1 共用速度 renderer、舊 inline／regex 路徑消失；W3 驗證無 `replaceAll()`、確實讀取 `fivePointBypassed`／rerun context，且首輪不被污染。
- 此批只有 UI owner／renderer 收斂；不改 formal combat、settlement、Save Schema 或任何存檔欄位。

## 2026-10-04 已完成：Batch5 後續架構優化第4批（完整端到端 Regression）

- 新增 `tests/runtime/reincarnation-rerun-batch5-e2e-regression.js`，由真實瀏覽器 runtime 驗證，不只做 policy-level probe。
- W1 固定驗證：rerun 真實選 map99 / Boss → prepare 保持 Lv.500 → encounter Lv.500 → `fightOnce()` 正式 combat／settlement → 只寫入 `bossKilled[99]` → downward key coverage = 10 → 第10文明災厄解鎖；不得偽造低階 key boss flag，且 prepare 前後正式 state 不變。
- W2 固定驗證：Boss index99 / Lv.1000 → 正式 combat → `settleSecondWorldBossVictory(99)` → 只寫入實際 Boss99 → downward key coverage = 10 → 首／末宇宙文明災厄 eligibility 正確；不得偽造 Boss9 等低階 key flag。
- W3 固定驗證：rerun 可以且只能 bypass `five-point-front`；`defeated`、`invalid`、`world-locked` 仍維持拒絕。
- 同一支 closure regression 一併封箱首輪隔離、pre-Schema17 normalization、下一輪 reincarnation reset、1×／1.5× speed UI、Minimal Mode 與 W1／W2／W3 Fast Catch-up owner 版本。
- Runtime Integrity workflow 已納入此端到端測試，之後每次相關 JS／文件／workflow push 都會自動重跑。
- 此批只新增／收斂 regression 與文件，不改正式 combat／settlement 規則、不改 Save Schema，不需要 migration，也沒有 production JS／CSS cache-bust 需求。

---

# 目前真正 pending

## 1. 第6批：越級 EXP／核心資源／Offline

正式倍率：

```text
M = 1 + 0.03 * (enemyLevel - playerLevel)
```

只在 `enemyLevel > playerLevel` 時使用，無額外 cap。online／offline 必須共用同一正式 multiplier owner。

套用：
- W1：EXP、金幣、基礎強化石、進階強化石。
- W2：EXP、暗物質、暗能量。
- 裝備出售收入不套倍率。

## 2. 第6批：首次轉生後四大副本永久解鎖

- 懸賞、競技場、鏡像、虛空首次轉生後永久可進。
- daily 不因轉生刷新。
- Mirror／Void permanent history 保留。
- W1／W2 Arena Rank 每輪重置。
- 區域 eligibility 依本輪最高 key boss downward coverage。
- W2 Arena downward coverage 已由 Batch5-3 接上；W1 Arena 尚待補齊。
- 原 97% 晉階驗收保留。

## 3. 第7批：GM／測試／完整 Integrity 收尾

- GM 指定轉生次數／永久突破等級。
- GM 正式轉生 transaction 按鈕。
- GM AU unlock／deepest。
- **GM 指定角色等級時，若目前為轉生輪次，必須依實際跨越的 Lv.100／200／…／1000 突破里程碑同步增加本輪突破；直接沿用 `grantBreakthroughMilestonesForLevelCrossing(fromLevel, toLevel, state)` 正式 owner，不另寫公式。**
  - 首輪 `count=0`：GM 調等級不得增加突破。
  - 轉生輪 `Lv.1 → Lv.500`：應增加 5 級突破。
  - `Lv.500 → Lv.1000`：再增加 5 級突破。
  - 已取得里程碑不得重複給予。
  - GM 往下調等級不得倒扣突破。
  - Lv.1000 以上不再增加本輪突破。
- 角色能力測試新增突破值與正式角色同步。
- AU benchmark。
- 21 種雙 trait diagnostic。
- rerun／overlevel／dungeon／AU 全生命週期 regression。
- 最終完整 closure。

---

# 原定 7 大批進度

```text
第1批：轉生核心資料與首輪隔離                 完成
第2批：突破系統＋正式轉生最小可用流程         完成
第2批後優化1～4                               完成
第3批：異宇宙最小可玩版                       完成
第4批：異宇宙完整化與平衡測試                 完成
第5批：第一、第二、第三紀元轉生後重征服規則   完成（5-1～5-5）
第6批：越級 EXP／資源／離線＋四副本永久解鎖  未開始
第7批：GM 管理／測試／完整 Integrity 收尾      未開始
```

Batch5 後續架構優化為獨立 4 批；第1～4批已全部完成，不與原第6／7批混寫。

---

# 已取消／不得自動復活

除非使用者主動重新開啟：

- AU 作為 Lv.2001+ 或第四紀元。
- AU dynamic breakthrough scaling。
- AU 經濟／掉落。
- AU replay／review。
- forced old Story rereading。
- 取消 Lv.500／Lv.1000 紀元邊界。
- 越級 multiplier 額外 cap。
- 裝備出售收入套越級 multiplier。
- AU 套用 W3 5pp／永久削血／階段機制。
- AU 超過 2 traits。
- 保留 `lostGear` 跨轉生。
- 玩家介面顯示內部 B／U 縮寫。
- VIP21+ 新增特殊特權。
- 高維紀元新增第二套／第三套貨幣、+41～+60、專精61+、印記11+、文明11+。

---

## 承接規則

- `main` 是唯一真實來源。
- 修改前 fresh-read 真正 owner／consumer。
- 「先討論／先檢查／先不要修改」不得修改。
- 「做／修改／執行／第 N 批」可直接施工。
- JS／CSS 修改必須同步更新 `index.html` cache-bust。
- 每批完成後重新讀 current main，檢查 UI／邏輯／資料寫入／舊檔相容／Runtime／Integrity。
- 已完成規格不得因舊文件或舊對話自動復活。
