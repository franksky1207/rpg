# 《文明戰線》正式跨對話交接文件

> **最高原則：GitHub `main` 實際程式碼永遠是唯一真實來源。**
>
> 若本文、歷史對話、舊截圖或舊規格與目前 `main` 衝突，一律重新讀取 `main`。

更新日期：**2026-09-13**

---

## 1. 專案基本資料

- Repository：`franksky1207/rpg`
- 正式分支：`main`
- 遊戲名稱：**文明戰線**
- 純前端 HTML / CSS / JavaScript + `localStorage`
- `SAVE_KEY = "frank_text_rpg_save"`
- `data.js` legacy `SAVE_VERSION = 9`
- 正式 schema：`savemigration.js` 的 `SAVE_SCHEMA_VERSION = 10`
- 正式 save pipeline：`SAVE_LOAD_PIPELINE_VERSION = 1`
- `MAX_LEVEL = 500`
- `VIP_MAX_LEVEL = 20`
- `SPECIALIZATION_MAX_LEVEL = 30`
- 世界：10 大區域、100 張主線地圖、Lv1～500
- 桌面與手機都要支援；iPhone Safari 是重要真機環境

---

## 2. 修改與異常處理最高原則

1. 修改前先重新讀 `main` 的相關檔案與完整 `index.html`。
2. 先搜尋跨檔案引用、state、存檔欄位、載入順序、後載入 override / wrapper，再決定修改位置。
3. 使用者未明確授權不得寫入 repo；若使用者說「先不要修改／先分析」，只能檢查。
4. 修改 JS / CSS 後必須更新 `index.html` cache-bust。
5. 修改後重新讀取變更檔案與完整 `index.html`，再 compare base→head，確認沒有意外檔案。
6. GitHub 寫入成功不等於 GitHub Pages、瀏覽器或 iPhone Safari runtime 已驗證，必須明確區分。

### 異常處理基本原則

**未來只要發生功能異常，不得先猜原因、不得先疊局部補丁。**

必須先自我檢查該問題涉及的完整程式鏈，包括：
- 核心函式與實際執行版本
- 所有呼叫來源
- state 狀態流與物件參照
- 存檔 normalize / migration
- `index.html` 載入順序
- 後載入 override / wrapper
- render / DOM 事件鏈
- 跨檔案引用與舊實作殘留
- runtime / syntax error

確認真正根因後才修改。若新邏輯已正式取代舊邏輯，應優先移除或封存舊路徑，不應永久依賴載入順序把舊實作蓋住。

### Runtime 自我檢查

`runtimeintegrity.js` 會在全部正式 script 載入後建立：

```text
window.PROJECT_RUNTIME_REPORT
```

目前檢查：
- 世界地圖固定註冊是否完整
- 世界命名／資料硬錯誤
- 正式 save schema / load pipeline
- 必要懸賞、競技場、地圖函式是否存在
- `state.saveVersion` 是否與正式 schema 一致
- `dungeon.arena` normalize 是否保持原物件參照

正式載入報告：

```text
window.LAST_SAVE_LOAD_REPORT
```

包含 sourceVersion、targetVersion、是否有 raw save、是否 JSON parse 失敗、是否恢復中斷副本等資訊。

`runtimediag.js` 的可視診斷框已移除，不再常駐玩家頁面；未來只有真的需要除錯時才臨時加入診斷工具。

---

## 3. 世界與主線

十大區域：
1. 地球戰爭
2. 太陽系戰爭
3. 近星戰爭
4. 星際邊疆
5. 獵戶臂戰爭
6. 銀河邊境
7. 銀河中域
8. 銀河核心外圍
9. 銀河核心戰爭
10. 銀河統合戰爭

每區10張地圖，共100張，Lv1～500。

正式玩家主線模式只有：
- 單場戰鬥
- 連續戰鬥

Boss 永遠單場。Lv500後 EXP 1:1 轉金幣；Lv500死亡不扣 EXP，但裝備遺失照常，除非 VIP20。

世界 UI：最高已解鎖區域預設展開；舊區域可折疊；未到達區域不顯示；折疊狀態只保留本次 session。

### 地圖固定註冊

`data.js` 唯一正式入口：

```text
registerRegionMaps(regionId, regionMaps)
```

十支 `worldmaps-*.js` 全部使用固定 region id 註冊，不再直接 `MAPS.push()` / `MAPS.splice()`。

正式行為：
- 每區只能寫 `WORLD_REGIONS` 指定的 `mapStart～mapEnd`
- 每區剛好10張
- 註冊時檢查 chapter 與每張5級範圍
- 同區重複載入只覆寫自己的固定10格
- 不同區若搶同一 index 直接報錯

完整性報告：

```text
window.WORLD_MAP_REGISTRATION_REPORT
```

`worldnamingrules.js` 繼續檢查100張連續性、每區10張、每張5件裝備／5隻怪、怪物 rank 順序、chapter、重名與詞彙等。

### 舊存檔

本次地圖整理沒有改任何 map index：仍為0～99，因此舊 `unlockedMap / mapProgress / bossProgress / bossLocked / bossKilled` 不需要額外 migration。

世界進度仍以 map index 為永久身分。未來若重新排列既有地圖或在中間插新圖，必須另做 schema migration。

---

## 4. 副本共通

- Lv5：懸賞戰
- Lv15：競技場
- Lv25：虛空幻境

副本次數由主線戰鬥累積副本進度取得。每次正式副本 round 真正開始前才扣次數。

`dungeonprogress.js` 負責副本永久進度 normalize；`dungeoncore.js` 負責正式 run marker 與開始／結束。

---

## 5. 懸賞戰

定位：**高 EXP、高金幣、多裝備**。

內部：
- 普通：45%，EXP×5、金幣×5、2件裝備
- 高級：35%，EXP×8、金幣×8、3件裝備
- 危險：20%，EXP×12、金幣×12、5件裝備

玩家 UI 不公開權重、品質機率或戰前精確獎勵，只顯示「高 EXP・高金幣・多裝備」。

品質：稀有60%、史詩35%、傳說4.5%、神話0.5%。特性升階、VIP14、VIP8可影響裝備；VIP18不套用懸賞品質。

支援單次／連續。

連續正式流程：

```text
combat
→ finishDungeonRun
→ transition
→ beginDungeonRun
→ combat
```

規則：
- 一場懸賞＝一輪
- 下一輪真正開始才扣1次
- 每輪結束回滿HP
- 死亡／次數不足／手動停止時結束
- 手動停止完成目前場次後生效
- 中間不出單次／連續選擇頁
- 中間不出單場結算
- 最後只出一次總結算

`bountycontinuousui.js` 已刪除；懸賞 ready/combat/result 現在由 `dungeonbounty.js` 核心直接輸出，不再由 `dungeonplayerui.js` 二次修改。

---

## 6. 競技場：最新唯一有效制度

正式名稱對應十大主線區域：
1. 地球戰爭競技場
2. 太陽系戰爭競技場
3. 近星戰爭競技場
4. 星際邊疆競技場
5. 獵戶臂戰爭競技場
6. 銀河邊境競技場
7. 銀河中域競技場
8. 銀河核心外圍競技場
9. 銀河核心戰爭競技場
10. 銀河統合戰爭競技場

玩家介面不得把正式競技場叫普通／困難／極限。`normal / hard / extreme` 只保留為 internal position id。

### 逐個解鎖＋最近3個

永久進度：

```text
state.dungeon.arena.highestArenaUnlocked
```

顯示：

```text
1
1 2
1 2 3
2 3 4
3 4 5
...
8 9 10
```

解鎖第 N+1 個：

```text
目前最高競技場戰力評估通過
AND
主線第 N+1 區域已解鎖
```

沒有前三階自動開放例外。

### 戰力評估

```text
500 次完整三連戰
至少 485 次全通
= 97% 才合格
```

未達97%可一直重新評估；達標後 `promotionReady=true`，資格保留到下一主線區域開放。

舊存檔：
- `positionModelVersion = 1`
- `assessmentRuleVersion = 2`
- 只有完整500次＋有效 signature＋至少485次全通才保留 qualification
- 舊 `promotionReady=true` 若沒有完整證據會被清除
- 已解鎖 `highestArenaUnlocked` 不倒退

### 位置與三維

可見列表由左到右內部使用低／中／高位置算法；玩家不顯示位置文字。

位置只影響：
- 暴擊
- 閃避
- 特性

HP／ATK／DEF 只看實際 Rank：

```text
RankHp     = 1 + 0.05*(R-1)
RankDamage = 1 + 0.015*(R-1)
RankDef    = 1 + 0.03*(R-1)
```

三戰物理 profile：

```text
S1: hp .60 / damage .57 / def .78
S2: hp .69 / damage .64 / def .80
S3: hp .78 / damage .73 / def .82
```

正式玩家戰鬥、GM測試、500次評估共用 `dungeonarena.js` 同一組物理來源。

### VIP積分

整個競技場視窗往前推才一起+130：

```text
123 → 180 / 300 / 420
234 → 310 / 430 / 550
345 → 440 / 560 / 680
456 → 570 / 690 / 810
567 → 700 / 820 / 940
678 → 830 / 950 / 1070
789 → 960 / 1080 / 1200
8910 → 1090 / 1210 / 1330
```

正式來源：`dungeonarena.js` 的 `pointWindowHighest()` / `arenaPointOffset()` / `difficultyForRank()`。

### 正式檔案責任

- `dungeonprogress.js`：永久進度與 arena save normalize
- `dungeonarena.js`：唯一正式三戰戰鬥核心、物理 profile、位置暴閃／特性 template、積分、單次／連續
- `arenapositioncore.js`：位置判定＋97%評估
- `arenawindowcore.js`：最近3個、主線條件、解鎖
- `arenaplayerflow2.js/.css`：正式玩家競技場頁
- `arenagm5.js`：GM測試
- `gameguidearena5.js`：玩家說明

`arenaranklabels.js` 已刪除；區域階級名稱直接使用核心 `getArenaRankName()`。

---

## 7. 正式存檔／載入 pipeline

正式 schema：

```text
SAVE_SCHEMA_VERSION = 10
SAVE_LOAD_PIPELINE_VERSION = 1
```

正式 runtime `load()` 現在唯一由 `savemigration.js` 接管：

```text
讀 localStorage raw
→ 保留原始 source snapshot / sourceVersion
→ clone 到 working state
→ migrateSave
→ normalize UI / 世界 / VIP / 專精 / 副本 / 虛空 / 離線
→ finalizeDungeonLoadedState
→ interrupted dungeon recovery
→ normalizeHP / ensureShop
→ saveVersion 設為正式 schema
→ 最後一次 save(false)
```

重要原則：**舊 raw 存檔在 migration 完成以前不會先被寫回新版 `saveVersion`。**

這修正了舊架構中 engine/base load 可能先把 localStorage 標成新版、之後才 migration 的風險。

### 各檔責任

- `engine.js`：保留基礎／fallback `load()`、核心 state 建立與通用 normalize helper
- `savemigration.js`：正式 runtime 唯一 load/migration pipeline
- `dungeonprogress.js`：不再 wrapper `load()`；只提供 `normalizeDungeonSaveState()` 與 `finalizeDungeonLoadedState()`
- `hpflow.js`：不再 wrapper `normalizeSaveState()`／重跑 migration，只負責 HP 規則與戰鬥入口
- `ui.js`：`normalizeSaveState()` 與匯入存檔的防禦性 normalize；正式 schema migration 仍只走 `migrateSave()`

匯入舊存檔時，`ui.js` 的 `normalizeCurrentSaveState()` 會呼叫正式 `migrateSave()`；匯入後 reload 再經同一正式 load pipeline。

---

## 8. 五批架構整理完成狀態

1. **規則與舊資料清理**：97%正式化、assessmentRuleVersion、舊玩家競技場UI清除。✅
2. **競技場架構整理**：舊450 assessment清除、三維／位置分離、assessment wrapper清理。✅
3. **懸賞核心整理**：ready workaround移除、精確戰前獎勵preview移除。✅
4. **地圖架構整理**：十區固定 `registerRegionMaps()`＋完整性檢查。✅
5. **存檔／載入／全專案收尾**：正式單一 migration pipeline、移除 dungeon/hp migration wrapper、刪除 arena label wrapper、加入 runtime integrity report。✅

---

## 9. 已知仍保留的非阻斷相容層

以下不是目前 bug，但屬歷史命名／base renderer 相容：

- 競技場 internal `normal / hard / extreme` id 與部分 `difficulty*` 函式名稱仍保留；它們只是位置 template id，不是玩家三難度。
- `arenaplayerflow2.js` 仍以後載入方式接管 base arena select renderer；base renderer 已不再產生舊三難度功能。
- `ui.js` 仍保留歷史 1/5/10/15/20/25 主線戰鬥次數 base renderer，正式玩家主線由 `continuousbattle.js` 接管成「單場／連續」。這屬主線舊 base UI 技術債，與本次地圖／懸賞／競技場／存檔五批整理無直接功能衝突。

未來若要處理上述項目，仍依「先完整檢查整條程式鏈，再移除」原則，不要只刪看起來舊的函式。

---

## 10. 目前重要提醒

- GitHub `main` 永遠優先於本文。
- 競技場門檻只有 **97%（485/500）**。
- 競技場沒有玩家可選的低／中／高三難度。
- 競技場 HP／ATK／DEF 只看 Rank＋Stage；位置只影響暴閃特性。
- 懸賞不公開權重、品質機率與戰前精確獎勵。
- 懸賞連續模式中間不回挑戰模式頁，只在停止時總結算。
- 十區主線只透過 `registerRegionMaps()` 固定註冊。
- 正式 schema migration 只由 `savemigration.js` 的 runtime load pipeline 負責。
- 發生異常時，先看 `PROJECT_RUNTIME_REPORT`／`LAST_SAVE_LOAD_REPORT`，再完整檢查程式鏈，確認根因後才修。