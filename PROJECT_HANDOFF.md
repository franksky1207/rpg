# 《文明戰線》正式跨對話交接文件

> **最高原則：GitHub `main` 實際程式碼永遠是唯一真實來源。**
>
> 若本文、歷史對話、舊截圖、舊規格或先前 ChatGPT 的敘述與目前 `main` 衝突，一律重新讀取 `main` 後，以實際程式碼為準。

更新日期：**2026-09-13**
本次交接整理前 `main` HEAD：`e224d869227099ffd05ff8e67871d4049e29ee3c`

---

# 1. 專案基本資料

- Repository：`franksky1207/rpg`
- 正式分支：`main`
- 遊戲名稱：**文明戰線**
- 架構：純前端 HTML / CSS / JavaScript + `localStorage`
- 正式本機存檔 key：`frank_text_rpg_save`
- `data.js` legacy `SAVE_VERSION = 9`
- 正式 schema：`savemigration.js` 的 `SAVE_SCHEMA_VERSION = 10`
- 正式載入 pipeline：`SAVE_LOAD_PIPELINE_VERSION = 1`
- `MAX_LEVEL = 500`
- `VIP_MAX_LEVEL = 20`
- `SPECIALIZATION_MAX_LEVEL = 30`
- 世界：10 大區域、100 張主線地圖、Lv1～500
- 桌面版與手機版都必須支援；**iPhone Safari 是重要真機環境**。

目前 `index.html` 的正式載入骨架：

```text
data.js
→ 10 支 worldmaps-*.js
→ worldmapregistrycheck.js
→ worldnamingrules.js
→ engine.js
→ specialization.js / combatcore.js
→ dungeonprogress.js
→ savemigration.js
→ dungeoncore.js
→ UI / VIP / Traits / GM / 副本
→ battlepipeline.js / continuousbattle.js
→ backgroundprogress.js / offlinefarmtarget.js / offlineprogress.js
→ dungeonplayerui.js / arenaplayerflow2.js
→ adventureprogressui.js / combatfx.js / runtimeintegrity.js
→ homebackground.js / battlebackground.js / mapbackground.js
```

目前正式 CSS 還額外載入：

```text
homebackground.css
battlebackground.css
mapbackground.css
dungeondesktoppolish.css
```

`runtimediag.js` 已刪除，不再常駐顯示診斷框。

---

# 2. 給下一個 ChatGPT 的操作規範

## 2.1 修改前

1. **每次修改前先重新讀取 `main` 的相關檔案。**
2. **同時重新讀完整 `index.html`**，確認 script / CSS 實際載入順序與 cache-bust。
3. 先搜尋跨檔案引用、state 欄位、save migration、normalize、後載入 override / wrapper、render / DOM 綁定，再決定真正修改位置。
4. 不可只根據本交接檔、聊天記憶或過去 commit 猜目前程式。
5. 若是視覺／背景問題，修改前先看**實際畫面結構與 DOM class**，不要先假設背景應該掛在哪一層。

## 2.2 使用者授權語意

- 使用者說：**「先討論」「先分析」「先不要修改」「先檢查」** → **不能改 GitHub**，只能檢查、分析、提出方案。
- 使用者說：**「做」「修改」「修正」「執行」「開始」「第 X 批」「上傳到遊戲網頁」** → 視為已授權，可直接修改 GitHub `main`。
- 不要在使用者已明確授權後重複要求確認。

## 2.3 修改原則

1. **優先修改正式來源，不要額外做 wrapper、fallback、第二套公式或第二套 UI 規則。**
2. 若新制度已正式取代舊制度，優先刪除／收斂舊路徑，而不是永遠靠後載入覆蓋。
3. 只為真正需要的相容性保留舊 API 名稱；必須清楚標記它只是相容層，不是正式制度。
4. 不要為了「看起來乾淨」而一次大改無關系統；先確認完整程式鏈，再修根因。
5. **異常時不得連續猜原因、一直叫使用者重整。** 先自我檢查完整鏈再修改。

## 2.4 修改後

1. 修改 JS / CSS 時，**必須更新 `index.html` 對應 cache-bust**。
2. 修改後重新讀取所有變更檔案。
3. 再重新讀完整 `index.html`。
4. compare 修改前 base commit → 修改後 head，確認只有預期檔案。
5. GitHub 寫入成功 ≠ GitHub Pages / 桌面瀏覽器 / iPhone Safari runtime 已驗證；回覆時必須區分。

## 2.5 異常處理最高原則

**只要發生功能異常，不得先猜原因、不得先疊局部補丁。**

必須先自我檢查該問題涉及的完整程式鏈，包括：

- 核心函式與實際執行版本
- 所有呼叫來源
- state 狀態流
- 物件參照是否被替換
- 存檔 normalize / migration
- `index.html` 載入順序
- 後載入 override / wrapper
- render / DOM 事件鏈
- CSS specificity / viewport / flex / min-height 等實際版型規則
- 舊函式／舊常數／舊制度殘留
- runtime / syntax error

確認根因後才修改。

---

# 3. 核心角色／成長公式

## 3.1 基礎能力

`engine.js`：

```text
BaseHP(L)  = ceil(110 + 12 × (L - 1))
BaseATK(L) = ceil(15 + 2.2 × (L - 1))
BaseDEF(L) = ceil(7 + 1.2 × (L - 1))
```

怪物暴擊／閃避正式上限：

```text
MONSTER_MAX_CRIT_RATE  = 30
MONSTER_MAX_DODGE_RATE = 30
CRIT_DAMAGE_MULTIPLIER = 1.5
```

## 3.2 EXP 曲線

```text
sameExp(L) = ceil(25 + 4L)

expProgressionFactor(L)
= 5 + 495 × (1 - exp(-(L-1)/142))

expNeed(L)
= ceil(sameExp(L) × expProgressionFactor(L))
```

`EXP_CURVE`：

```text
killMin   = 5
killRange = 495
scale     = 142
```

等級差 EXP multiplier：

```text
怪物 - 玩家 >= +5：1.30
>= +3：1.20
>= +1：1.10
= 0：1.00
>= -2：0.90
>= -5：0.60
>= -10：0.25
更低：0.05
```

Lv500 後 EXP 不再累積；可轉換 EXP 由正式 payout 流程 **1:1 轉為金幣**。

---

# 4. 世界、100 張地圖與主線

## 4.1 十大區域

1. 地球戰爭 Lv1～50（map 0～9）
2. 太陽系戰爭 Lv51～100（10～19）
3. 近星戰爭 Lv101～150（20～29）
4. 星際邊疆 Lv151～200（30～39）
5. 獵戶臂戰爭 Lv201～250（40～49）
6. 銀河邊境 Lv251～300（50～59）
7. 銀河中域 Lv301～350（60～69）
8. 銀河核心外圍 Lv351～400（70～79）
9. 銀河核心戰爭 Lv401～450（80～89）
10. 銀河統合戰爭 Lv451～500（90～99）

每區 10 張地圖，每張 5 級，共 100 張。

## 4.2 固定地圖註冊

`data.js` 正式入口：

```text
registerRegionMaps(regionId, regionMaps)
```

十支 `worldmaps-*.js` 全部使用固定 region id 註冊，不再直接 `MAPS.push()` / `MAPS.splice()`。

規則：

- 每區只能寫到 `WORLD_REGIONS` 指定的 `mapStart～mapEnd`
- 每區必須剛好 10 張
- 註冊時檢查 chapter
- 註冊時檢查每張地圖剛好 5 級
- 同區重複載入只覆寫自己的固定 10 格
- 不同區搶同一 map index 會直接報錯

`validateWorldMapRegistration()` 檢查固定註冊完整性；`worldmapregistrycheck.js` 產生：

```text
window.WORLD_MAP_REGISTRATION_REPORT
```

`worldnamingrules.js` 再檢查：

- 100 張地圖連續
- 每張 5 級
- 每區 10 張
- 每張 5 件裝備
- 每張 5 隻怪
- 怪物 normal / elite / boss 順序
- chapter 對應
- 重名、近似名、詞彙密度

## 4.3 存檔與 map index

目前世界進度仍以 map index 為永久身分：

```text
unlockedMap
mapProgress
bossProgress
bossLocked
bossKilled
```

100 張仍是 0～99。若未來要重新排序、在中間插圖或改既有 index，必須做正式 schema migration。

## 4.4 主線 UI / 戰鬥模式

正式玩家主線只有：

- 單場戰鬥
- 連續戰鬥

Boss 永遠只跑單場。

連續主線：

- 每場結束回滿 HP
- 可按「停止連續戰鬥」
- 停止在目前這一場結束後生效
- 死亡時結束
- 已取得獎勵與副本進度保留
- 最後顯示連續戰鬥總結算

### 技術債

`ui.js` 實體原始碼仍保留舊 `1 / 5 / 10 / 15 / 20 / 25 場` base renderer；正式 runtime 由 `continuousbattle.js` 後載入改為單場／連續。未來若整理，需先查完整 `ui.js → battlepipeline.js → continuousbattle.js → specialencounter.js`。

---

# 5. VIP 系統

## 5.1 等級與能力

```text
VIP threshold(level) = 1000 × level²
VIP level = floor(sqrt(points / 1000))，最高20
```

每級 VIP：

```text
HP  +0.5%
ATK +0.5%
DEF +0.25%
暴擊 +0.25%
閃避 +0.25%
```

已解鎖 VIP 等級不會因積分降低而下降；`normalizeVipState()` 保留歷史最高等級。

## 5.2 偶數級特權

- VIP2：主線裝備掉落率 +5 個百分點
- VIP4：副本進度 +10%
- VIP6：特殊怪遭遇率 +2 個百分點
- VIP8：主線掉落 15% 優先目前最弱部位
- VIP10：特殊怪特殊獎勵 10% 再發動一次
- VIP12：副本進度總加成提升為 +20%
- VIP14：主線掉落 5% 品質 +1
- VIP16：主線 Boss 15% 額外掉 1 件
- VIP18：主線 Boss 掉落 10% 品質 +1
- VIP20：死亡不遺失裝備

懸賞特殊規則：VIP8、VIP14 可作用；VIP18 不套用懸賞品質。

---

# 6. 專精系統

每項最高 Lv30；升到目標等級 `N`：

```text
1000 × N² 金幣
```

8 項正式專精：

- 實戰訓練：每級 EXP +5%
- 搜刮技巧：每級怪物金幣 +5%
- 鑑價技巧：每級裝備售價 +5%
- 先制技巧：每級第一擊傷害 +2%
- 連擊技巧：每級連擊率 +1%；追加攻擊 50%，且追加攻擊可再次連擊
- 穿透技巧：每級穿透率 +1%；觸發時忽略 25% 防禦
- 反擊技巧：每級反擊率 +1%；反擊傷害 40%
- 汲取技巧：每級汲取率 +1%；觸發時回復本次實際傷害 10%

GM 有正式專精管理與工作階段限定「測試專精」；測試值重新整理後回 Lv0，不寫正式角色。

---

# 7. 副本共通

正式開放：

- Lv5：懸賞戰
- Lv15：競技場
- Lv25：虛空幻境

## 7.1 副本進度公式

`dungeonprogress.js`：

```text
damageRate = (startHp - endHp) / playerMaxHp

baseProgress
= (enemyMaxHp / BaseHP(playerLevel)) × 1.5
  + damageRate × 4

實際進度 = baseProgress × VIP副本進度倍率
```

VIP 倍率：

```text
VIP0～3：×1.00
VIP4～11：×1.10
VIP12～20：×1.20
```

每累積 100 副本進度，自動轉成 1 次副本可挑戰次數。

## 7.2 正式 run marker

`dungeoncore.js`：

```text
state.dungeon.activeRun
```

正式 round 真正開始時才 `beginDungeonRun()` 扣次數並寫 marker；`finishDungeonRun()` 清 marker並依規則回血。

若網頁在正式副本 run 中斷，下次 load 由 `finalizeDungeonLoadedState()` 偵測 activeRun，回滿 HP 並清 marker。

---

# 8. 懸賞戰：最新正式制度

玩家只公開：

> **高 EXP・高金幣・多裝備**

不公開 tier 機率、品質精確機率、戰前精確 EXP／金幣／件數。

## 8.1 內部 tier

```text
普通懸賞：45%
EXP ×5
金幣 ×5
2 件裝備
HP ×1.00
Damage ×1.00
DEF ×0.88

高級懸賞：35%
EXP ×8
金幣 ×8
3 件裝備
HP ×1.03
Damage ×1.03
DEF ×0.90

危險懸賞：20%
EXP ×12
金幣 ×12
5 件裝備
HP ×1.08
Damage ×1.06
DEF ×0.92
```

品質基礎權重：

```text
稀有 60%
史詩 35%
傳說 4.5%
神話 0.5%
```

敵人由**不含 VIP 的裝備基礎能力**生成；玩家正式戰鬥再套 VIP／戰鬥專精。

## 8.2 單次／連續

- 一場懸賞＝一個正式 dungeon round
- 下一場真正開始前才再扣 1 次
- 每場結束回滿 HP
- 死亡／次數不足停止
- 手動停止在目前一場結束後生效
- 連續中間場次不顯示單次／連續選擇頁
- 中間場次不顯示單場結算
- 最後統一總結算

歷史 bug 已修：`prepareNextBounty()` 使用 `transition`，不再中間 render ready 選單；`bountycontinuousui.js` 已刪除；精確戰前獎勵 preview 已從核心移除。

---

# 9. 競技場：最新唯一有效制度

## 9.1 正式競技場名稱

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

玩家介面不得把正式競技場叫「普通／困難／極限」。`normal / hard / extreme` 只保留為 internal position template id。

## 9.2 逐個解鎖＋最近最多3個

永久進度：

```text
state.dungeon.arena.highestArenaUnlocked
```

可見視窗：

```text
1
1 2
1 2 3
2 3 4
3 4 5
4 5 6
5 6 7
6 7 8
7 8 9
8 9 10
```

解鎖下一個必須同時：

```text
目前最高競技場戰力評估通過
AND
下一個競技場所對應主線區域已解鎖
```

## 9.3 戰力評估：97%

```text
ASSESS_RUNS = 500
ASSESS_CLEAR_TARGET = 485
ASSESS_BATCH_SIZE = 10
```

即 500 次完整三連戰至少 485 次全通。每批 10 次，`setTimeout(step,0)` 對 Safari 讓出 event loop。

評估 signature 包含 rank、position id、玩家等級、不含 VIP 的基礎 HP/ATK/DEF/crit/dodge、VIP level、五項戰鬥專精。裝備、VIP、戰鬥專精改變時舊結果可 stale。

存檔版本：

```text
positionModelVersion = 1
assessmentRuleVersion = 2
```

只有完整 500 次、有 signature、clears>=485 才保留 `promotionReady=true`。已解鎖 `highestArenaUnlocked` 不倒退。

## 9.4 三維／位置算法

Rank multiplier：

```text
RankHp     = 1 + 0.05  × (R - 1)
RankDamage = 1 + 0.015 × (R - 1)
RankDef    = 1 + 0.03  × (R - 1)
```

三戰共通 profile：

```text
S1：HP ×0.60 / Damage ×0.57 / DEF ×0.78
S2：HP ×0.69 / Damage ×0.64 / DEF ×0.80
S3：HP ×0.78 / Damage ×0.73 / DEF ×0.82
```

正式敵人：

```text
EnemyHP = BaseEnemyHP(P) × StageHp × RankHp
EnemyDamageComponent = BaseEnemyDamage(P) × StageDamage × RankDamage
EnemyATK = ceil(EnemyDamageComponent + P.def × 0.55)
EnemyDEF = BaseEnemyDEF(P) × StageDef × RankDef
```

`P` 為不含 VIP 的玩家基礎 snapshot；玩家正式戰鬥再套 VIP／戰鬥專精。

位置只影響 crit / dodge / trait，不影響同 Rank 三維。

## 9.5 暴擊／閃避／特性

最高大致：

```text
低位置：約 crit 9 / dodge 8
中位置：約 crit 16 / dodge 14
高位置：約 crit 23 / dodge 20
```

traitMode：

```text
normal1：70% 0特性 / 30% 1特性
normal2：50% 0 / 50% 1
one：固定1
hard3：75% 1 / 25% 2
extreme2：60% 1 / 40% 2
extreme3：50% 1 / 50% 2
```

## 9.6 VIP 積分視窗推進

internal position base：

```text
normal  = 180
hard    = 300
extreme = 420
```

最高已解鎖競技場到4之後，整個三格視窗每推進一格，三個位置一起 +130：

```text
windowOffset = 130 × max(0, highestVisibleArena - 3)
totalPoints = positionBase + windowOffset
```

正式 progression：

```text
1          → 180
1 / 2      → 180 / 300
1 / 2 / 3  → 180 / 300 / 420
2 / 3 / 4  → 310 / 430 / 550
3 / 4 / 5  → 440 / 560 / 680
4 / 5 / 6  → 570 / 690 / 810
5 / 6 / 7  → 700 / 820 / 940
6 / 7 / 8  → 830 / 950 / 1070
7 / 8 / 9  → 960 / 1080 / 1200
8 / 9 / 10 → 1090 / 1210 / 1330
```

玩家 guide 不列精確 progression；GM 可以顯示。

## 9.7 單次／連續

- 一完整三連戰＝一輪
- 三戰內 HP 連續、不回血
- 下一輪重新滿血
- 下一輪真正開始前才再扣 1 次
- 任一戰失敗即該輪失敗
- 死亡／次數不足停止
- 手動停止在目前整輪結束後生效
- 連續最後統一總結算

## 9.8 重要已修 bug

- `normalizeArenaProgress()` 不再替換 `dungeon.arena` 物件，改原地 `Object.assign()`，修掉 promotion 寫入 detached object。
- 積分由錯誤 `base +130×(rank-1)` 改成 highest visible window 從4開始才加。
- 90% → 97%，正式 485/500。
- 正式戰鬥／GM／評估三維收斂成 `dungeonarena.js` 單一 `ARENA_PHYSICAL_STAGE_PROFILE`。
- 舊玩家「普通／困難／極限」選擇 UI 移除。
- `arenaranklabels.js` 已刪除。

---

# 10. 虛空幻境

開放 Lv25。

```text
Base crit  = 10
Base dodge = 8
HP multiplier  = 2.40
ATK multiplier = 2.15
DEF multiplier = 2.65
```

```text
EquivalentPower(F) = 24 + F / 10

HP  = ceil((62 + 16.2 × E) × 2.40)
ATK = ceil((10.5 + 2.45 × E) × 2.15)
DEF = ceil((3.2 + 0.92 × E) × 2.65)
```

- 每10層 Boss
- 普通樓 1 特性，Boss 2 特性
- 首次通關積分：`round(15 + 1.75 × sqrt(F - 1))`
- Boss 樓積分再 ×2
- 正式進度：`state.dungeon.voidMirage.highestCleared`
- 只在剛好挑戰 `highestCleared + 1` 首次通關時推進並發積分
- 一個 run 開始時扣1次副本；run 內持續向上挑戰
- 每層通關後回滿本 run 鎖定 snapshot 的 HP

GM 支援：重置樓層、直接移動到指定樓層、模擬推進並補首次通關積分；挑戰進行中禁止 GM 樓層管理。

---

# 11. GM 系統：目前正式功能

GM 從設定頁隱藏入口進入；密碼來源仍定義在 `data.js`，不要在交接檔另建第二份密碼來源。

`gmhub.js` 分「管理」與「測試」，手機有 responsive UI。

## 11.1 正式角色／世界管理

`gmtools.js`：

- 指定等級 1～500
- 指定金幣
- 指定主線攻略到某等級關卡
- 補滿 HP
- 清空背包（不動穿戴）
- 免費刷新商店
- 重置商店 refresh 狀態
- 依品質／等級／部位產生裝備

## 11.2 副本／VIP 管理

- 副本進度
- 副本可挑戰次數
- VIP 積分
- 重置 VIP（等級＋積分）

單純調低積分不會降低已解鎖 VIP；回 VIP0 必須使用正式重置。

## 11.3 專精管理與測試

- 正式管理：直接指定玩家 8 項專精並存檔
- 測試專精：只存在本工作階段
- 測試 VIP：VIP0～20，工作階段限定
- 「目前狀態」可把正式 VIP＋專精複製到 GM 測試狀態

## 11.4 主線怪／特殊怪／懸賞／競技場測試

主線怪測試可跨所有已實作區域，不受正式解鎖限制，沙盒跑 100 次，整理：勝率、勝利平均剩餘 HP、死亡掉裝／VIP20、EXP、金幣、滿等 EXP 轉金幣、掉落品質、測試鑑價售價。

特殊怪可指定後跑 100 次沙盒。

懸賞有普通／高級／危險三個 100 次測試按鈕；敵人生成用不含 VIP 基礎能力，玩家模擬使用測試 VIP＋測試專精。

`arenagm5.js` 支援：

1. 100 次完整三連戰：Rank1～10、左／中／右位置算法
2. 500 次正式戰力評估：Rank1低位置、Rank2中位置、Rank3+高位置；485/500 才通過

虛空另有樓層管理與測試 UI；正式樓層資料以 `dungeonvoid.js` 為唯一來源。

---

# 12. 正式存檔／載入 pipeline

```text
SAVE_SCHEMA_VERSION = 10
SAVE_LOAD_PIPELINE_VERSION = 1
```

`data.js SAVE_VERSION = 9` 只保留 legacy／fallback。

正式 `window.load` 由 `savemigration.js` 接管：

```text
讀 localStorage raw
→ 保留 rawSnapshot / sourceVersion
→ clone working state
→ migrateSave()
→ gear / UI normalize
→ 世界 normalize
→ VIP normalize
→ 專精 normalize
→ 副本／競技場 normalize
→ 虛空 normalize
→ offline normalize
→ finalizeDungeonLoadedState()
→ 恢復中斷副本
→ selectedMap / HP / shop normalize
→ saveVersion = 10
→ 最後才 save(false)
```

重要：**migration 完成前不會先把舊 raw 存檔寫成新版 saveVersion。**

migration 目前處理：舊裝備 mainStat/affix、shop、v9 EXP 比例轉換、世界100張陣列、VIP、專精、副本／競技場、虛空、offline。

診斷：

```text
window.LAST_SAVE_LOAD_REPORT
```

包含 pipelineVersion / hadRaw / parseFailed / sourceVersion / targetVersion / recoveredInterruptedDungeonRun。

---

# 13. 背景執行、離線與時間防護

## 13.1 Background progress

`backgroundprogress.js`：

- 背景補償 credit rate：`0.96`
- 連續背景最多計 12 小時
- 用 `visibilitychange / blur / focus / pagehide / pageshow` 判斷背景狀態
- 主線連續、懸賞連續、競技場連續、虛空可用 `backgroundProgressSleep()`
- 不是單場就建立 background flow；完成後停止

## 13.2 Offline reward

`offlineprogress.js` 正式基準：

```text
EXP 10%
金幣 10%
裝備 roll 10%
副本進度 10%
最短離線 1 分鐘
最長計算 12 小時
```

實際戰鬥速度樣本：

- 最多保留最近 20 筆真實前景主線勝利樣本
- normal 額外 cycle gap +140ms
- elite 額外 cycle gap +220ms
- 玩家高於敵人等級差的速度倍率：

```text
0～3：×1.00
4～6：×1.30
7～10：×1.60
11～15：×2.00
16+：不採樣
```

背景 catch-up credit 的戰鬥不應拿來污染真實速度樣本。

時間防護：

- `maxObservedWallClock`
- `timeLockUntil`
- 時鐘倒退容忍 5 分鐘
- 遇到明顯倒退會封鎖離線結算直到系統時間追上
- `pendingSettlement` 用於避免結算被中斷／重入
- 大量模擬每 750 次讓出 event loop

離線保留裝備策略：非神話每部位只保留最佳候選，再與穿戴比較；神話全部保留，其餘自動出售。

---

# 14. Runtime 自我檢查

`runtimeintegrity.js` 最後載入，不顯示玩家 UI，建立：

```text
window.PROJECT_RUNTIME_REPORT
```

檢查：

- `MAPS.length` 與 WORLD_REGIONS
- `WORLD_MAP_REGISTRATION_REPORT`
- `WORLD_NAMING_REPORT`
- 必要函式
- `SAVE_SCHEMA_VERSION === 10`
- `SAVE_LOAD_PIPELINE_VERSION === 1`
- `state.saveVersion`
- `dungeon.arena` normalize 是否保持物件參照

有錯 console error；只有 warning 則 console warn。

---

# 15. 視覺重整：目前最新正式方向

## 15.1 統一美術基準

整體固定：

> **科幻戰略風＋宇宙史詩風**

主色：深藍、黑、鐵灰、銀灰、科技藍；輔以紫藍、能量紫、青藍、少量金色。

避免：

- 過亮
- 過度霓虹
- 卡通／兒童感
- 純寫實軍武
- 現代都市感
- 過度雜亂
- 電影海報式構圖
- 圖片內大字／Logo

背景圖必須：

- 預設 16:9
- 適合 CSS `background-size: cover`
- 同時考慮桌機與手機直式裁切
- 中央保留 UI 安全區
- 關鍵主體不要全部堆在左右極端
- 讓 UI 長時間閱讀仍舒服

## 15.2 第1～3張已完成

### 第1張：主畫面背景

用途：**首頁／主畫面**。

目前正式檔案：

```text
homebackground.css
homebackground.js
assets/bg-main-test-1.b64
assets/bg-main-test-2.b64
assets/bg-main-test-3.b64
assets/bg-main-test-4.b64
```

`homebackground.js` 讀 4 段 Base64，拼成 `data:image/webp;base64,...` 設到 `--home-bg-image`。

CSS 用 `.home-screen::before / ::after` 做背景與暗色遮罩；手機 `background-position:52% center`。

已由使用者實際看過，桌機／手機可用。

### 第2張：主線一般／菁英戰鬥背景

用途：**主線一般與菁英戰鬥**。

目前正式檔案：

```text
battlebackground.css
battlebackground.js
assets/bg-battle-test-01.b64 ～ bg-battle-test-12.b64
```

JS 讀 12 段 Base64。CSS 只套 `#main > .combat-screen`，玩家／敵人卡片有半透明深色底。

桌機與 iPhone 真機已確認：中央戰鬥空間與手機裁切都良好。

### 第3張：冒險地圖整頁背景

**正式用途已重新定義為「整個冒險地圖頁面背景」，不是某一個區域背景。**

目前正式檔案：

```text
mapbackground.css
mapbackground.js
assets/bg-map-reupload-01.b64 ～ bg-map-reupload-06.b64
```

`mapbackground.js`：

- 讀 6 段 Base64
- join 後先用 `new Image()` probe 是否可解碼
- 解碼成功才設定 `--map-bg-image`
- 用 `MutationObserver` 監看 `#main`，當 `.map-screen` 存在時在 body 加 `map-background-active`

`mapbackground.css`：

- 背景固定在 `body.map-background-active::before`
- `position:fixed; inset:0`
- 因此收合／展開區域不會重新縮放背景
- `.map-screen` 本身設透明
- 區域／卡片維持半透明深色
- 手機目前 `background-position:58% 42%`

這一版已由使用者實機確認背景能鋪整頁，收合不再導致背景跳動。

## 15.3 第3張曾遇到的問題與正式經驗

### A. 一開始完全不顯示

真正根因不是單純 cache：**Base64 單檔過長曾被截斷，組出的 WebP 不完整。**

解法：

- 重新壓 WebP
- 重新產 Base64
- 拆成多個小段
- 上傳後核對每段與總長度
- JS join
- `Image()` probe 成功才套用

### B. 背景只在方框內，收合時圖片會變

根因：背景直接掛在高度會變動的 `.map-screen`，`background-size:cover` 每次都重新計算裁切。

解法：改成**固定 viewport 背景**，由 body class 控制顯示，內容高度變化不再影響背景。

### C. 手機裁切中央較空

改過 `background-position`，目前 58% 42%；實機差異有限，但可接受。結論：手機 `cover` 只能小修，真正要在**生圖構圖階段**就預留中央直式安全區。

---

# 16. 背景圖之後的標準工作流程

這段是後續最重要的視覺工作規範。

## 16.1 先看介面，再決定生什麼圖

不要「先有一張圖，再找地方塞」。正式流程：

```text
實際介面截圖
→ 判斷是否真的需要背景
→ 判斷背景應掛 viewport / 頁面 / 固定區塊 / 戰鬥區
→ 再決定圖片用途
→ 才寫生圖指令
```

如果頁面有收合、列表長度變化、動態 render，優先考慮 viewport／整頁固定背景，不要把 cover 背景綁在會改高度的容器。

## 16.2 生圖指令必備內容

每張指令一次寫完整，不要叫使用者再補句子。至少包含：

- 科幻戰略＋宇宙史詩
- 深色、高質感、成熟、耐看
- 深藍／黑／鐵灰／銀灰／科技藍
- 可少量紫藍／青藍／金色
- 不要過亮／過霓虹／卡通／現代都市／電影海報
- 不要文字／Logo
- 16:9
- 適合 `background-size:cover`
- 桌機＋手機直式裁切
- 中央保留 UI 空間
- 重要元素不要全部靠左右邊緣

不同用途再補：

- 首頁：中央乾淨，主體多放左右／上方
- 戰鬥：中下區保留角色卡片＋VS
- 系統頁：背景結構要穩，不依賴內容高度

## 16.3 上傳前先讀 main 的實際 DOM／CSS

使用者說「上傳到遊戲網頁」後，先做：

1. 讀相關 renderer
2. 確認真正輸出的 class
3. 看是否會 re-render
4. 看是否有後載入 CSS / wrapper
5. 決定背景該掛哪層

確認後才上傳，避免第3張曾經的錯誤定位。

## 16.4 圖片處理與 GitHub 上傳

目前 connector 寫二進位不方便，因此暫用 Base64 文字資產。建議測試版：

- 先壓 WebP
- 約 960×540（可依畫面需求略調）
- quality 約 80～85
- Base64 拆小段，建議每段約 7～10KB 文字
- 檔名固定有序，例如 `bg-dungeon-01.b64`、`02`、`03`

**不要再使用一個超長 `.b64`。**

## 16.5 上傳後完整性檢查

通知使用者重整前，必須先確認：

- 每一段檔案都存在
- 段數正確
- 每段長度合理
- 總 Base64 長度與本地原始值一致（若本地可得）
- JS 路徑與段數一致
- `Image()` probe 能成功解碼（適用這類 data URL 流程）
- CSS selector 真正命中目前 DOM
- `index.html` cache-bust 已更新
- compare 只包含預期修改

**不要只因 GitHub create/update 成功，就叫使用者重整測試。**

## 16.6 背景 CSS 保持獨立

目前已有：

```text
homebackground.css
battlebackground.css
mapbackground.css
```

之後背景仍優先用獨立檔，例如：

```text
dungeonbackground.css
specialbattlebackground.css
```

但前提是這真的是正式畫面規則，不要因為 selector 沒搞清楚就再疊一層補丁。

## 16.7 實機調整

桌機與手機至少分開考慮 `background-position`。但原則是：**生圖先做裁切安全，CSS 只小修，不拿 CSS 救錯誤構圖。**

使用者傳實機截圖後，先判斷是：

- 圖本身問題
- 背景掛錯層
- 版型問題
- 遮罩／位置問題

不要混在一起修。

---

# 17. 副本桌機 UI 整理：本對話最新狀態

使用者提供了副本入口、懸賞、競技場、虛空的桌機與手機截圖後，確認：

- 手機版整體其實已經合理，**目前這批只調桌機版**。
- 桌機懸賞 ready/result 原本主卡後還包一層大紫底，難看。
- 桌機競技場內容區偏窄、四周太空。
- 桌機虛空戰鬥上下留白過多。

目前新增獨立：

```text
dungeondesktoppolish.css
```

並只在 `@media (min-width:761px)` 生效。

## 17.1 已確認有效

### 懸賞

桌機移除 `.dungeon-bounty-shell.dungeon-page-shell` 的多餘紫色大底，保留真正內容卡。

### 競技場

桌機放寬 `.arena-shell / .arena-panel`，ready/result 也調整 max-width。

**使用者已回報：懸賞和競技場好了。**

## 17.2 虛空仍未完成

目前 `dungeondesktoppolish.css` 已嘗試對桌機虛空強制：

- `.void-combat.combat-screen` `display:block !important`
- `min-height:0 !important`
- `height:auto !important`
- `flex:none !important`
- `.combat-arena` 變三欄：玩家 / VS / 敵人
- 取消 flex 撐高

`index.html` cache-bust 現為：

```text
dungeondesktoppolish.css?v=20260913-dungeon-desktop3
```

**但使用者實機重整多次後，虛空桌機畫面仍幾乎相同，上下空白仍在。**

因此這是目前明確未完成項目。

### 下一步正確作法

不要再盲目加第四層 CSS override。

應先完整檢查：

```text
style.css 的 .combat-screen / .combat-arena
→ dungeonvoidui.js 實際輸出結構
→ dungeonvoidui.js 動態 injectStyles()
→ dungeondesktoppolish.css specificity / 生效順序
→ 實際 computed layout 的高度來源
```

若確認通用 `.combat-screen` 結構本身就是根因，**優先直接修改 `dungeonvoidui.js` 的正式桌機 layout／class 結構**，讓虛空不要再繼承主線「撐滿 viewport」的戰鬥版型，而不是再加更多外部 wrapper。

手機版虛空目前看起來正常，不應一起改壞。

---

# 18. 已完成的大型架構整理

先前五批均完成：

1. 規則／舊資料：競技場 97%、485/500、舊 promotion 清理
2. 競技場核心：三維單一來源、位置只管暴閃／特性、舊三難度退出
3. 懸賞核心：連續 transition、最後總結算、刪舊 bounty wrapper、移除戰前精確 preview
4. 地圖架構：十區固定 `registerRegionMaps()`、固定 slot 檢查
5. 存檔／全域收尾：`savemigration.js` 唯一 runtime migration、`runtimeintegrity.js`、刪除常駐診斷框

本對話另外完成：

- 第1張首頁背景
- 第2張主線戰鬥背景
- 第3張冒險地圖整頁背景
- 第3張多次修正：Base64 完整性、viewport 固定背景、手機裁切
- 桌機懸賞多餘紫底移除
- 桌機競技場寬度整理
- 虛空桌機版型仍待解決

---

# 19. 已知尚未完成／技術債

## 19.1 主線舊 battle-count base renderer

`ui.js` 還有歷史 1/5/10/15/20/25；正式 runtime 由 `continuousbattle.js` 改為單場／連續。未完整檢查鏈前不要直接刪。

## 19.2 競技場相容命名／玩家 UI 接管

`normal / hard / extreme` 只代表 internal position template。`arenaplayerflow2.js` 仍後載入接管正式玩家 UI；若重構，應收斂 renderer，不要再疊第三層 wrapper。

## 19.3 engine base load

`engine.js` base `load()` 仍保留 fallback；正式 runtime 以 `savemigration.js` 為準。

## 19.4 map index 永久身分

若未來改順序／插入地圖，必須正式 migration。

## 19.5 Base64 圖片資產是暫時的技術方案

目前第1～3張背景都以 Base64 chunk 文字檔載入。這可用，但 repo 結構較繁瑣。若日後有可靠的二進位資產寫入方式，可整理成正常單一 `.webp` 並改 CSS 直接引用；**整理前先確認真機 cache 與 Pages 路徑，不要在背景仍持續調整時急著搬。**

## 19.6 虛空桌機 UI

目前明確未解：桌機虛空戰鬥上下空白太多；`dungeon-desktop3` 外部 CSS 覆蓋未在實機產生預期效果。下一步應查 source-level layout，不要再猜。

## 19.7 全系統 smoke test

本對話已真機驗證：

- 首頁背景
- 主線戰鬥背景
- 冒險地圖背景（桌機／手機）
- 冒險地圖收合背景不再跳
- 桌機懸賞／競技場 UI 改善

但仍沒有完成一次全系統 GitHub Pages + 桌面 + iPhone Safari smoke test。建議大功能前快速驗證：

```text
舊存檔載入
新遊戲
主線單場
主線連續＋手動停
懸賞單次
懸賞連續＋手動停
競技場評估
競技場解鎖
競技場單次／連續
虛空幻境
GM 管理／沙盒測試
匯出／匯入存檔
```

---

# 20. 最重要的正式來源對照

```text
data.js
  世界 region / QUALITY / 固定 map registry / legacy save version

worldmaps-*.js
  100 張正式主線資料

worldnamingrules.js
  世界資料／命名檢查

engine.js
  基礎能力、EXP、裝備、VIP基礎、newState、fallback load

specialization.js
  8 專精正式資料

combatcore.js
  正式戰鬥核心

battlepipeline.js
  主線正式 battle pipeline

continuousbattle.js
  主線單場／連續模式 UI 與相容層

dungeonprogress.js
  副本進度、attempt、arena save normalize、load 後副本 finalizer

dungeoncore.js
  正式副本 run marker / begin / finish

dungeonbounty.js
  懸賞正式核心

dungeonarena.js
  競技場正式戰鬥／三維／位置 config／積分／單次連續

arenapositioncore.js
  位置判定＋97%戰力評估

arenawindowcore.js
  競技場最近3個／主線解鎖

arenaplayerflow2.js
  競技場正式玩家 UI

arenagm5.js
  競技場正式 GM 測試

dungeonvoid.js
  虛空幻境正式核心

dungeonvoidui.js
  虛空玩家 UI / 動態樣式；目前桌機版型未完成修正

savemigration.js
  正式唯一 runtime save migration / load pipeline

backgroundprogress.js
  背景 continuous credit / page visibility flow

offlinefarmtarget.js
  真實主線樣本與 offline farm target

offlineprogress.js
  離線結算／時鐘防護／reward UI

runtimeintegrity.js
  背景 runtime integrity report

homebackground.css/js
  第1張首頁背景

battlebackground.css/js
  第2張主線戰鬥背景

mapbackground.css/js
  第3張冒險地圖整頁背景

dungeondesktoppolish.css
  桌機副本 UI 修飾；懸賞／競技場有效，虛空仍待解

index.html
  最終實際載入順序與 cache-bust
```

---

# 21. 下一個對話如何接手

下一個對話開始時，建議直接貼：

> **讀取 `franksky1207/rpg` 的 `PROJECT_HANDOFF.md`，再重新檢查 `main` 的實際程式碼與完整 `index.html`，完整承接《文明戰線》專案。以 GitHub `main` 為唯一真實來源；若交接檔與實碼衝突，以實碼為準。現在先不要修改，先告訴我你已承接到哪些最新系統、規則、公式、GM功能、UI／背景圖狀態、已知 bug、尚未完成項目與操作原則。**

若下一個對話接著要直接修改，再由使用者明確說：

> **「做／修改／修正／執行／開始／上傳到遊戲網頁」**

才開始寫入 GitHub `main`。
