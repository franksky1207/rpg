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
- Batch5 後續架構優化共 4 批；第1批「W1 Target Context／prepare 正式 state 隔離」已完成，第2～4批待做。
- 目前主要施工剩餘：Batch6、Batch7，以及 Batch5 後續架構優化第2～4批。

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
- 此批只處理 W1 target identity／prepare 正式 state 隔離；後續第2批再處理 W2 visibility owner 收斂，第3批處理共用 UI renderer，第4批做完整 settlement 端到端 regression。

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

## 4. Batch5 後續架構優化第2～4批

### 第2批：第二紀元 visibility owner 收斂
- 拆開冒險主線區域顯示與 Arena 區域 eligibility。
- 移除 rerun 冒險頁暫時覆寫 `window.secondWorldRegionVisible` 的做法。
- rerun 主線仍須 10 區全顯示；Arena 仍依 key boss downward coverage。

### 第3批：共用 UI renderer 收斂
- W1 戰鬥速度徽章改為正式共用 renderer，不再靠 regex 改 HTML。
- W3 rerun 文案直接由 rerun context／`fivePointBypassed` 決定，不再對首輪 HTML 做 `replaceAll()`。

### 第4批：完整端到端 regression
- W1 真實選 Boss → combat → settlement → `bossKilled` → key coverage → calamity eligibility。
- W2 真實 Boss index → settlement → key coverage／calamity eligibility。
- W3 驗證 rerun 只解除 5% 戰線，不解除其他 blocker。
- 首輪隔離、舊存檔 normalization、轉生 reset、速度 UI、Minimal／Fast Catch-up 一併封箱。

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

Batch5 後續架構優化為獨立 4 批；目前第1批已完成，第2～4批待做，不與原第6／7批混寫。

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
