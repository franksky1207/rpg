# 《文明戰線》目前待辦狀態

更新日期：2026-10-04  
分支：`main`

> 本檔只記錄**真正尚未完成、已知待修或刻意延後**的工作。若本檔、舊 handoff、舊對話、舊 Word 或歷史文件與 current `main` 衝突，一律以 current `main` 為準；完整現況與施工規範以最新 `PROJECT_HANDOFF.md` 與 current `main` 實碼為準。

## 目前狀態

銀河紀元、宇宙紀元、高維紀元三大紀元正式內容、轉生／突破核心、異宇宙正式玩法，以及轉生後三紀元自由重征服第5批均已進入 current `main` runtime。

目前正式基準：

- `SAVE_SCHEMA_VERSION = 17`；
- 三紀元 World Phase 已正式完成；
- 高維紀元 Lv.1000～2000、10 名高維存在、首輪 5pp、永久削血、維度之弦、界弦核心、Story／Final、Arena、loot／offline 與回顧均已有正式 runtime；
- VIP 等級無上限，特殊特權至 VIP20；
- 裝備六品質自動處理政策已完成；
- 轉生 persistent state、突破系統、正式轉生流程與轉生後優化第1～4批已完成；
- 異宇宙 Batch3～4 已完成；
- 轉生後重征服 Batch5-1～5-5 已完成。

目前主要正式施工剩餘：Batch6、Batch7，以及轉生系統全部完成後再進行的第一紀元 target-context 架構重構。

---

# 目前真正 pending

## 1. 第一紀元轉生重征服：已知目標錯位 bug

2026-10-04 實測發現：轉生後雖可從冒險 UI 直接選高階地圖／Boss，但第一紀元舊的 `adventurePreparePage()` 仍會用：

```text
selectedMap = Math.min(selectedMap, state.unlockedMap)
```

把已選定的高階 `selectedMap` 壓回目前首輪式 `unlockedMap`。因此剛轉生時點 Lv.500 Boss，實際可能被改成第1張地圖 Lv.5 Boss；之後再點高階 Boss 又依已推進的 `unlockedMap` 被改成 Lv.10 等低階目標。

連鎖影響包括：

- 準備頁／戰鬥介面顯示錯誤目標；
- encounter 實際建立成低階怪；
- `bossKilled` 寫入錯誤 map index；
- key boss downward coverage 不成立；
- 因未真正擊敗 Lv.50／100／…／500 關鍵王，文明災厄不會解鎖。

另需同步檢查同頁的：

```text
if(selectedEnemy > highest) selectedEnemy = highest
```

避免轉生 rerun 下 map 修正後，enemy 又被首輪進度二次壓回。

目前檢查結果：

- W1：確定有此類問題；
- W2：正式流程使用 Boss `index` 直接由 UI → challenge → encounter → combat → settlement，未發現同類降階錯位；
- W3：正式流程使用 `bossIndex` 由 UI → run → combat → settlement，未發現同類降階錯位。

修正原則：首輪解鎖規則保持不變；轉生 rerun 一旦目標通過 eligibility，就不得在 prepare／combat／settlement 中被重新降階解析。

## 2. 第6批：越級 EXP／核心資源／Offline

定案第一版：

```text
M = 1 + 0.03 * (enemyLevel - playerLevel)
```

只在 enemyLevel > playerLevel 時使用，無額外上限。

同一正式 multiplier owner 必須共用於 online／offline，並套用：

- W1：EXP、金幣、基礎強化石、進階強化石；
- W2：EXP、暗物質、暗能量。

裝備出售收入不套 M，避免雙重膨脹。

## 3. 第6批：首次轉生後四大副本永久解鎖

尚需實作／完整驗收：

- 懸賞、競技場、鏡像、虛空在首次轉生後永久可進；
- daily 不因轉生刷新；
- Mirror／Void permanent history 保留；
- W1／W2 Arena Rank 每輪重置；
- 區域 eligibility 依本輪最高 key boss downward coverage；
- W2 Arena downward coverage 已由 Batch5-3 接上；W1 Arena 仍需補齊；
- 原 97% 晉階驗收保留。

## 4. 第7批：GM／測試／完整 Integrity 收尾

尚需補：

- GM 指定轉生次數／永久突破等級；
- GM 正式轉生 transaction 按鈕；
- GM AU unlock／deepest；
- 角色能力測試新增突破值與正式角色同步；
- AU benchmark；
- 21 種雙 trait diagnostic；
- rerun／overlevel／dungeon／AU 全生命週期 regression；
- 最終完整 closure。

## 5. 轉生系統全部完成後：第一紀元 Target Context 架構重構【刻意延後】

**執行時機：Batch6、Batch7 與整個轉生系統正式完成、穩定後再做。現在只記錄，不提前施工。**

目標不是只補單一 bug，而是把第一紀元逐步收斂到與第二紀元相同的核心原則：

> 「能不能打」由 eligibility／unlock policy 判定；一旦合法目標確定，實際戰鬥目標 index 必須一路直傳到底，不得再由 UI session 進度偷偷改寫。

預定重構範圍：

- UI map/enemy 選擇；
- prepare page；
- single／continuous combat；
- Minimal Mode；
- Fast Catch-up；
- special encounter 插入與返回主線目標；
- encounter 建立；
- reward／equipment drop source；
- boss first-kill／Story／calamity trigger；
- offline sample target；
- inventory return context；
- review/formal state isolation；
- settlement 與 `bossKilled` 寫入。

重構安全原則：

- 首輪 sequential progression 行為不得改變；
- 首輪仍由 `unlockedMap`、`enemyUnlocked()`、`canBoss()`、`highestUnlockedEnemy()` 等正式 eligibility owner 限制入口；
- 轉生 rerun 仍依既有 rerun policy 解鎖；
- eligibility 只決定「可不可以打」，不得在核准後改寫「實際打誰」；
- W2 現行 index 直傳架構作為行為參考，但不為了表面一致而複製不必要 owner；
- 重構時需建立端到端 target identity regression，驗證 UI → prepare → encounter → combat → settlement → progression 的 map/enemy/boss identity 完全一致；
- 必須覆蓋 normal／elite／boss、單場／連戰、Minimal Mode、特殊遭遇、offline sample、回顧戰與正式戰隔離。

---

# 原定 7 大批目前進度

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

第一紀元 Target Context 架構重構不塞進第6／7批；等整個轉生系統完成後另開獨立重構批次。

---

# 已取消／不得自動復活

除非使用者主動重新開啟，以下不再列 pending：

- AU 作為 Lv.2001+ 或第四紀元；
- AU dynamic breakthrough scaling；
- AU 經濟／掉落；
- AU replay／review；
- forced old Story rereading；
- 取消 Lv.500／Lv.1000 紀元邊界；
- 越級 multiplier 額外 cap；
- 裝備出售收入套越級 multiplier；
- AU 套用 W3 5pp／永久削血／階段機制；
- AU 超過 2 traits；
- 保留 `lostGear` 跨轉生；
- 玩家介面顯示內部 B／U 縮寫；
- VIP21+ 新增特殊特權；
- 高維紀元新增第二套／第三套貨幣、+41～+60、專精61+、印記11+、文明11+。

---

## 承接規則

- `main` 是唯一真實來源；
- 修改前 fresh-read 真正 owner／consumer；
- 使用者說「先討論／先檢查／先不要修改」時不得修改；
- 使用者說「做／修改／執行／第 N 批」時可直接施工；
- JS／CSS 修改必須同步更新 `index.html` cache-bust；
- 每批完成後重新讀 current main，檢查 UI／邏輯／資料寫入／舊檔相容／Runtime／Integrity；
- 已完成規格不得因舊文件或舊對話自動復活。
