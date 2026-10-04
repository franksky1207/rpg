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
- 目前主要施工剩餘：Batch6、Batch7，以及整套轉生完成後另開的第一紀元 Target Context 架構重構。

## 2026-10-04 已修：W1／W2 轉生重征服目標一致性

W1 曾發生轉生後點 Lv.500 Boss，舊 `adventurePreparePage()` 以 `selectedMap = Math.min(selectedMap, state.unlockedMap)` 把 map99 壓回 map0，導致準備頁、戰鬥、實際 encounter 與 `bossKilled` 都變成低階目標，並使 key boss downward coverage／文明災厄無法正確成立。

本次已修正：

- 首輪 `count=0` 完整沿用原本 sequential progression，不改首輪解鎖規則。
- W1 rerun 在 prepare 階段保留玩家真正選定的 map；正式 `state.unlockedMap` 不會被偽造或永久改寫。
- rerun 下普通／菁英／Boss 仍依既有 rerun policy 可直接選擇。
- regression 已固定驗證 map99 + Boss → prepare Lv.500 → combat Lv.500 → encounter Lv.500，且 `unlockedMap` 仍為 0。
- W2 重新檢查後沒有同類 production bug；既有流程仍由 Boss `index` 從 UI → challenge → encounter → combat → settlement 一路直傳。
- W2 regression 已固定驗證 Boss index99 的正式定義與 encounter 均為 Lv.1000 且同一 Boss。

這次只做安全 bugfix，不提前執行完整 W1 Target Context 重構。

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
- 角色能力測試新增突破值與正式角色同步。
- AU benchmark。
- 21 種雙 trait diagnostic。
- rerun／overlevel／dungeon／AU 全生命週期 regression。
- 最終完整 closure。

## 4. 轉生系統全部完成後：第一紀元 Target Context 架構重構【刻意延後】

執行時機：Batch6、Batch7 與整套轉生正式完成、穩定後再做。

核心原則：

> 「能不能打」由 eligibility／unlock policy 判定；一旦合法目標確定，實際 map／enemy／boss index 必須從 UI → prepare → encounter → combat → settlement → progression 一路保持一致，不得再由 UI session 進度偷偷改寫。

預定涵蓋：UI 選擇、prepare、單場／連戰、Minimal Mode、Fast Catch-up、特殊遭遇、encounter、reward／equipment source、Boss 首殺／Story／calamity、offline sample、inventory return、review/formal isolation、settlement。

安全要求：
- 首輪 sequential progression 行為不得改變。
- `unlockedMap`、`enemyUnlocked()`、`canBoss()`、`highestUnlockedEnemy()` 仍只負責首輪 eligibility。
- W2 現行 index 直傳架構作為行為參考，不複製不必要 owner。
- 重構時建立完整 target identity regression，覆蓋 normal／elite／boss、單場／連戰、Minimal、特殊遭遇、offline、回顧與正式戰隔離。

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

第一紀元 Target Context 架構重構不塞入第6／7批，等轉生系統完成後另開獨立批次。

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
