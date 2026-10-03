# 《文明戰線》目前待辦狀態

更新日期：2026-10-03  
分支：`main`

> 本檔只記錄**真正尚未完成或刻意保留未定**的工作。若本檔、舊 handoff、舊對話、舊 Word 或歷史文件與 current `main` 衝突，一律以 current `main` 為準；完整現況與施工規範以最新 `PROJECT_HANDOFF.md` 為準。

## 目前狀態

銀河紀元、宇宙紀元、高維紀元三大紀元既有正式內容均已進入 current `main` runtime，現階段以維護、實測與轉生後系統擴充為主。

目前正式基準：

- `SAVE_SCHEMA_VERSION = 17`；
- 三紀元 World Phase 已正式完成；
- 高維紀元 Lv.1000～2000、10 名高維存在、5pp、永久削血、維度之弦、界弦核心、Story／Final、Arena、loot／offline 與回顧均已有正式 runtime；
- VIP 等級無上限，特殊特權至 VIP20；
- 裝備六品質自動處理政策已完成；
- 轉生 persistent state、突破系統、正式轉生最小可用流程與轉生後優化第1～4批已完成。

因此，**高維紀元本身不再列為 pending**。目前真正的主線是異宇宙與轉生後重征服。

---

# 目前真正 pending

## 1. 異宇宙實際玩法

已完成 state／normalization 骨架，但 gameplay 尚未施工。

正式目標：

- 200 個異宇宙 × 每宇宙 5 深度 = 1000U；
- 外環 → 神庭 → 聖域 → 天座 → 主宰；
- 20 類文化、200 正式名稱須從定案 Word 核對，不自行命名；
- 敵人固定曲線只看 U，不讀玩家突破等級 dynamic scaling；
- 每次 active attempt 固定隨機 2 個不同 traits，F5 不重抽；
- 同一 U、同一 life 第 1～9 敗可重打，第 10 敗鎖到下次轉生；
- 第一次擊敗 W3 全 10 名高維存在後永久解鎖；之後任何轉生輪／任何紀元／任何角色等級都可進入；
- 正式 challenge／settlement／放棄／failure 計數與 1000U progression 尚待建立。

目前 state skeleton 已有 `alternateUniverse.unlocked`、`deepestCleared`、`activeAttempt`、life-scoped failures 與 7 種 canonical traits。

## 2. 轉生後 W1／W2／W3 自由重征服

尚需實作：

- W1 rerun 直接挑戰全部地圖／普通／菁英／Boss，不走首輪 10 次前置與 bossLocked 迴圈；
- W2 rerun 100 Boss 可直接挑戰；
- key boss 勝利提供對應向下區域資格，但不得偽造低階 boss kill history；
- W1→W2 仍需 Lv.500，W2→W3 仍需 Lv.1000；
- 轉生後故事完成不再額外阻塞世界突破；
- 已體驗過的主線／過場／災厄提示／紀元說明不自動彈；
- 首輪 W3 維持 5pp；轉生後 W3 rerun 取消 5pp，可集中單王。

## 3. 越級 EXP／核心資源／Offline

定案第一版：

```text
M = 1 + 0.03 * (enemyLevel - playerLevel)
```

只在 enemyLevel > playerLevel 時使用。

同一正式 multiplier owner 必須共用於 online／offline，並套用：

- W1：EXP、金幣、基礎強化石、進階強化石；
- W2：EXP、暗物質、暗能量。

裝備出售收入不套 M，避免雙重膨脹。

## 4. 首次轉生後四大副本永久解鎖

尚需實作：

- 懸賞、競技場、鏡像、虛空永久解鎖；
- daily 不因轉生刷新；
- Mirror／Void permanent history 保留；
- W1／W2 Arena Rank 每輪重置；
- 區域 eligibility 依本輪最高 key boss downward coverage；
- 原 97% 晉階驗收保留。

目前只完成 daily／Mirror／Void history 在正式轉生 mutation 中保留。

## 5. 更完整玩家總覽／GM／Regression

尚需補：

- 角色頁完整養成狀態與戰鬥加成 breakdown；
- AU home entry／最深 U 摘要；
- GM 指定轉生次數／永久突破等級；
- GM 正式轉生 transaction 按鈕；
- GM AU unlock／deepest U 管理；
- 角色能力測試新增突破值與正式角色同步；
- 戰力 benchmark 新增 AU U／traits／runs；
- 21 種雙 trait diagnostic；
- rerun／overlevel／dungeon／AU 全生命週期 regression。

---

# 原定 7 大批目前進度

```text
第1批：轉生核心資料與首輪隔離                 完成
第2批：突破系統＋正式轉生最小可用流程         完成
第2批後優化1～4                               完成
第3批：異宇宙最小可玩版                       未開始
第4批：異宇宙完整化與平衡測試                 未開始
第5批：第一、第二、第三紀元轉生後重征服規則   未開始
第6批：越級 EXP／資源／離線＋四副本永久解鎖  未開始
第7批：GM 管理／測試／完整 Integrity 收尾      未開始
```

注意：已完成的「轉生／突破優化第4批」不是原 7 大批中的「第4批異宇宙完整化」。

---

# 已取消／不得自動復活

除非使用者主動重新開啟，以下不再列 pending：

- Arena V2 額外500場驗收；
- 宇宙主線 `.015` 中後期平衡再驗證；
- Cloud Save 真實跨裝置驗證；
- VIP21+ 新增特殊特權；
- 高維紀元新增第二套／第三套貨幣、+41～+60、專精61+、印記11+、文明11+；
- 把異宇宙做成第四紀元或新增 Lv.2001+。

---

## 承接規則

- `main` 是唯一真實來源；
- 修改前 fresh-read `PROJECT_HANDOFF.md` 與真正 owner／consumer；
- 使用者說「先討論／先檢查／先不要修改」時不得修改；
- 使用者說「做／修改／執行／第 N 批」時可直接施工；
- JS／CSS 修改必須同步更新 `index.html` cache-bust；
- 每批完成後重新讀 current main，檢查 UI／邏輯／資料寫入／舊檔相容／Runtime／Integrity；
- 已完成規格不得因舊文件或舊對話自動復活。