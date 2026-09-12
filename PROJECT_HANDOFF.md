# 《文明戰線》正式跨對話交接文件

> **最高原則：GitHub `main` 實際程式碼永遠是唯一真實來源。**
>
> 若本文、歷史對話、舊截圖或舊規格與目前 `main` 衝突，一律重新讀取 `main`。

更新日期：**2026-09-12**

---

## 1. 專案基本資料與開發原則

- Repository：`franksky1207/rpg`
- 正式分支：`main`
- 遊戲名稱：**文明戰線**
- 純前端 HTML / CSS / JavaScript + `localStorage`
- `SAVE_KEY = "frank_text_rpg_save"`
- `data.js` legacy `SAVE_VERSION = 9`
- 正式 schema：`savemigration.js` 的 `SAVE_SCHEMA_VERSION = 10`
- `MAX_LEVEL = 500`
- `VIP_MAX_LEVEL = 20`
- `SPECIALIZATION_MAX_LEVEL = 30`
- 世界：10 大區域、100 張主線地圖、Lv1～500
- 桌面與手機都要支援；iPhone Safari 是重要真機環境

### 修改規範

1. 修改前先重新讀 `main` 相關檔案與完整 `index.html`。
2. 先搜尋跨檔案引用、後載入 override / wrapper、狀態與存檔欄位，再決定修改位置。
3. 使用者未明確授權不得寫入 repo；若使用者說「先不要修改／先分析」，只能檢查。
4. 修改 JS / CSS 後必須更新 `index.html` cache-bust。
5. 修改後重新讀取變更檔案與完整 `index.html`，再 compare base→head，確認沒有意外檔案。
6. GitHub 寫入成功不等於 GitHub Pages、瀏覽器或 iPhone Safari runtime 已驗證，必須明確區分。

### 異常處理最高原則

**未來只要發生功能異常，不得先以局部猜測方式疊加補丁。**

必須先自我檢查該問題涉及的完整程式鏈，包括：
- 核心函式與實際執行版本
- 所有呼叫來源
- state 狀態流與物件參照
- 存檔正規化／migration
- `index.html` 載入順序
- 後載入 override / wrapper
- render / DOM 事件鏈
- 跨檔案引用與舊實作殘留
- runtime / syntax error

確認真正根因後才修改。若新邏輯已正式取代舊邏輯，應優先移除或封存舊路徑，不應永久依賴載入順序把舊實作蓋住。

---

## 2. 世界與主線

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

舊存檔的 `mapProgress / bossProgress / bossLocked / bossKilled` 會依目前 `MAPS.length` 正規化延長。現行世界進度仍以 map index 為永久身分，未來若要重排既有地圖需特別處理 migration。

---

## 3. 副本共通

- Lv5：懸賞戰
- Lv15：競技場
- Lv25：虛空幻境

副本次數由主線戰鬥累積副本進度取得。每次正式副本 round 真正開始前才扣次數。

---

## 4. 懸賞戰

定位：**高 EXP、高金幣、多裝備**。

內部三種懸賞：
- 普通：權重45%，EXP×5、金幣×5、2件裝備
- 高級：權重35%，EXP×8、金幣×8、3件裝備
- 危險：權重20%，EXP×12、金幣×12、5件裝備

正式玩家 UI 不公開上述權重、品質機率或戰前精確獎勵數字，只呈現「高 EXP・高金幣・多裝備」。

品質基礎權重：稀有60%、史詩35%、傳說4.5%、神話0.5%。特性升階、VIP14、VIP8 可影響裝備；VIP18不套用懸賞品質。

支援：
- 單次挑戰
- 連續挑戰

連續規則：
- 一場懸賞＝一輪
- 下一輪真正開始時才再扣1次
- 每輪結束後回滿 HP
- 死亡、次數不足或手動停止時結束
- 手動停止會完成目前場次後停止
- 中間場次不出單次／連續選擇頁與單場結算
- 最後只出一次總結算

### 第三批已整理項目

1. `dungeonbounty.js` 已把連續模式中間流程正式改成 `combat → finishDungeonRun → transition → beginDungeonRun → combat`；正常流程不在 transition 階段 render，因此玩家直接一場接下一場。
2. 若 transition 的300ms等待期間因其他原因觸發 render，只顯示「準備下一場」，不會出現單次／連續挑戰按鈕。
3. `bountycontinuousui.js` 已刪除，`index.html` 也不再載入該 workaround。
4. 戰前 ready 頁不再生成精確 EXP／金幣／裝備件數 preview；`dungeonbounty.js` 核心直接只輸出「高 EXP・高金幣・多裝備」與模式說明。
5. `dungeonplayerui.js` 不再修改懸賞 ready/combat/result DOM，只保留副本首頁簡介 enhancement。
6. 連續挑戰的已完成場數／勝場狀態與 `dungeon-continuous-result` class 已由 `dungeonbounty.js` 核心直接輸出。

---

# 5. 競技場：最新唯一有效制度

## 5.1 正式名稱

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

玩家介面**不得**把正式競技場命名成普通／困難／極限。`normal / hard / extreme` 僅為底層位置模板相容 id。

## 5.2 逐個解鎖＋最近最多3個

永久進度：

```text
state.dungeon.arena.highestArenaUnlocked
```

Lv15 剛開放時只有第1個競技場。

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

玩家只能挑戰目前可見的最近最多3個競技場。

## 5.3 解鎖條件

解鎖第 `N+1` 個競技場必須同時：

```text
目前最高競技場戰力評估通過
AND
主線第 N+1 區域已解鎖
```

沒有「前三階自動開放」或「前三區免主線」例外。

## 5.4 戰力評估

正式門檻：

```text
500 次完整三連戰
至少 485 次全通
= 97% 才合格
```

第1個最高時套低位置算法，第2個最高時套中位置算法，第3個以上最高時套高位置算法；位置只影響暴擊／閃避／特性，不影響 Rank 的 HP／ATK／DEF。

評估採 Safari 友善的非同步分批執行，每批10次。未達97%可反覆重新評估；一旦達標，`promotionReady=true`，評估按鈕停用。若下一區主線尚未開，資格保留到可解鎖為止。

### 評估舊存檔規則

`dungeonprogress.js`：
- `positionModelVersion = 1`
- `assessmentRuleVersion = 2`
- 新評估規則只承認有完整證據的結果：500次＋有效 signature＋至少485次全通。
- 舊存檔若只有 `promotionReady=true`，但沒有完整500次評估資料，不再保留資格。
- 舊完整結果若低於485次全通，改為未通過。
- 已解鎖的 `highestArenaUnlocked` 不因此倒退。

## 5.5 位置算法與物理三維

目前可見競技場由左至右內部分別套：
- 左：低位置算法（internal `normal`）
- 中：中位置算法（internal `hard`）
- 右：高位置算法（internal `extreme`）

玩家 UI 不顯示「目前位置：低／中／高」。

HP／ATK／DEF 只看實際競技場 Rank：
```text
RankHp     = 1 + 0.05*(R-1)
RankDamage = 1 + 0.015*(R-1)
RankDef    = 1 + 0.03*(R-1)
```

正式三戰物理基準：
```text
S1: hp .60 / damage .57 / def .78
S2: hp .69 / damage .64 / def .80
S3: hp .78 / damage .73 / def .82
```

`dungeonarena.js` 現在直接以 `ARENA_PHYSICAL_STAGE_PROFILE` 作為正式玩家戰鬥與 GM／評估測試共用的三維來源；`normal / hard / extreme` 的 stage config 只保留暴擊、閃避與特性。已移除「正式戰鬥先用舊 difficulty 三維、測試再靠後載入 wrapper 正規化」的雙重路徑。

暴擊／閃避／特性依位置；最高約 crit23 / dodge20，特性最多2個。

## 5.6 VIP積分：整組視窗推進

初始123：
```text
180 / 300 / 420
```

第4個解鎖、整組變234後才第一次全體+130：
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

目前正式積分來源在 `dungeonarena.js` 的 `pointWindowHighest()` / `arenaPointOffset()` / `difficultyForRank()`，玩家卡片、正式戰鬥與結算皆吃同一組 config。

## 5.7 單次／連續

- 一個完整三連戰＝一輪
- 三戰內不回血
- 新一輪才重新滿血
- 下一輪真正開始前才扣次數
- 失敗、次數不足或手動停止會結束
- 手動停止完成目前整輪後才停

---

## 6. 競技場正式檔案責任

- `dungeonprogress.js`：副本永久進度、競技場存檔正規化、`assessmentRuleVersion`
- `dungeonarena.js`：**唯一正式三戰戰鬥核心**；共通 HP／ATK／DEF 三戰物理 profile、位置暴閃／特性 template、正式視窗積分 config、單次／連續流程
- `arenapositioncore.js`：位置判定（左／中／右）與 **97% 戰力評估**；不再負責覆寫／正規化正式戰鬥三維
- `arenawindowcore.js`：最高競技場、最近3個、主線條件、解鎖；已移除舊評估 wrapper 暫時切換全域 rank 的做法
- `arenaplayerflow2.js/.css`：唯一正式玩家競技場選擇頁面與戰力評估 UI
- `arenagm5.js`：正式 GM 競技場測試
- `gameguidearena5.js`：正式玩家說明
- `arenaranklabels.js`：名稱相容層
- `dungeonplayerui.js`：目前只保留副本首頁文字 enhancement，不再介入正式競技場或懸賞戰內頁

### 第二批已清理項目

1. `dungeonarena.js` 的舊 `450/500` assessment、舊同步晉升判定與舊 `promoteArenaRank()` 已移除；正式評估只存在於 `arenapositioncore.js`，門檻485/500。
2. `dungeonarena.js` 不再含「普通競技場／困難競技場／極限競技場」正式顯示名稱；三個 internal id 的 config 名稱統一回區域競技場名稱。
3. 舊三難度玩家 selection UI 已移除；base select 只保留安全 fallback，正式玩家頁由 `arenaplayerflow2.js` 唯一接管。
4. HP／ATK／DEF 的位置差異已從核心移除；正式戰鬥、GM測試與500次評估使用同一組物理 profile。
5. `arenapositioncore.js` 的 `normalizeArenaPhysicalStats` 與 `buildArenaEnemyForTest` 後載入 wrapper 已刪除。
6. `arenawindowcore.js` 不再包裝／暫時切換 assessment rank；位置評估直接依 `getArenaProgressState().assessmentRank` 取得最高競技場。

### 競技場剩餘技術債

- `normal / hard / extreme` 名稱仍保留作 internal position id，部分函式名仍叫 `difficulty*`，屬相容 API 命名，不是玩家難度制度。
- `arenaranklabels.js` 仍是歷史名稱相容 wrapper；後續全域整理時可評估是否併回單一命名來源。
- `arenaplayerflow2.js` 仍以後載入方式接管 base select renderer；目前已無舊玩家三難度功能，但未來可再把 select renderer 入口正式參數化。

---

## 7. 世界資料與命名檢查

`WORLD_REGIONS` 固定10區、每區50級／10張地圖。

`worldnamingrules.js` 可檢查：
- 100張地圖是否連續
- 每張5級
- 每區10張
- 每張5件裝備／5隻怪
- 怪物 normal/elite/boss 順序
- chapter 對應
- 重名／近似名／詞彙密度

目前十個 `worldmaps-*.js` 還混用 `splice / push` 註冊方式，正常載入順序可運作，但後續地圖架構整理應統一成單一 `registerRegionMaps()` 類型入口。

---

## 8. 存檔與載入

正式 schema：`SAVE_SCHEMA_VERSION = 10`。

`normalizeWorldSaveState()` 會把舊世界陣列配合目前100張地圖延長；`normalizeDungeonSaveState()` 負責副本與競技場進度；`savemigration.js` 再做正式 schema migration。

目前 `engine.js → dungeonprogress.js → savemigration.js` 存在多層 `load()` wrapper，依賴 `index.html` 載入順序。功能目前正常，但屬後續全域整理項目，不應在局部 bug 時隨意再疊新的 load wrapper。

---

## 9. 後續技術債整理順序

1. **規則與舊資料清理**：97%正式化、assessmentRuleVersion、移除舊玩家競技場 UI、更新 handoff。✅ 已完成
2. **競技場架構整理**：移除舊450 assessment、收斂物理三維與位置算法、減少 assessment/window wrapper。✅ 已完成
3. **懸賞戰核心整理**：移除 ready UI workaround、精確獎勵不再於核心玩家頁生成。✅ 已完成
4. **地圖架構整理**：統一十區地圖註冊與完整性驗證。
5. **存檔／載入／全專案收尾**：收斂 load pipeline、全 repo 舊引用／語法／載入順序健檢。

---

## 10. 目前重要提醒

- GitHub `main` 永遠優先於本文件。
- 玩家競技場正式門檻只有 **97%（485/500）**。
- 玩家競技場沒有第二層低／中／高難度選擇，也不顯示位置文字。
- 競技場 HP／ATK／DEF 只看 Rank＋共通 Stage profile；位置只影響暴擊、閃避與特性。
- 玩家懸賞不公開權重、品質機率與戰前精確獎勵；連續模式中間不回到挑戰模式選擇頁，只在停止時總結算。
- 發生異常時，先完整自我檢查整條程式鏈，再修根因，不先猜補丁。