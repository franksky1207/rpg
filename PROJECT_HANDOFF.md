# 《文明戰線》正式跨對話交接文件

> **最高原則：GitHub `main` 的實際程式碼永遠是唯一真實來源。**
>
> 若本文件、歷史對話、舊截圖、舊規格、舊 commit 或任何記憶內容與目前 `main` 衝突，一律重新讀取 `main` 後，以實際程式碼為準。

更新日期：**2026-09-14**

本文件已依 2026-09-14 `main` 實際程式重新整理，並覆蓋先前已失效的「共享副本進度／共享副本次數、舊 VIP 1000×等級²、專精 Lv30、虛空逐層首通積分、虛空 5000 層上限」等舊資料。

---

# 1. 專案基本資料

- Repository：`franksky1207/rpg`
- 正式分支：`main`
- 遊戲名稱：**文明戰線**
- 架構：純前端 HTML / CSS / JavaScript + `localStorage`
- 正式存檔 key：`frank_text_rpg_save`
- `SAVE_VERSION = 11`
- `SAVE_SCHEMA_VERSION = 11`
- `SAVE_LOAD_PIPELINE_VERSION = 2`
- `VIP_PROGRESSION_VERSION = 12`
- `MAX_LEVEL = 500`
- `VIP_MAX_LEVEL = 20`
- `SPECIALIZATION_MAX_LEVEL = 60`
- 世界：10 大區域、100 張主線地圖、Lv1～500
- 桌面版＋手機版；**iPhone Safari 是重要真機環境**。
- 目前只有本機存檔，沒有雲端跨裝置同步。

`backgroundprogress.js` 的 background 指瀏覽器進入背景／失焦後的執行補償，**不是圖片背景 loader**，不可誤刪。

---

# 2. 下一個 ChatGPT 必須遵守的操作規範

## 修改前

1. **重新讀取 `main` 的實際程式碼。**
2. 至少讀與需求直接相關的正式來源，並且重新讀**完整 `index.html`**，確認 CSS / JS 載入順序與 cache-bust。
3. 追查跨檔 selector、state、renderer、migration、normalize、late override、全域函式覆蓋後再決定修改位置。
4. 不可只依賴本文件、歷史對話或模型記憶。
5. 視覺問題要同時確認 desktop / mobile media query 與 iPhone Safari。
6. 公式／數值只改正式來源，不建立第二套公式。

## 使用者授權語意

- 「先討論／先分析／先不要修改／先檢查」＝**不可寫 GitHub**。
- 「做／修改／修正／執行／開始／第 X 批／直接用／上傳到遊戲網頁」＝**已授權直接修改 GitHub `main`**，不需要再問一次。

## 修改原則

- 優先修改正式來源，不額外堆 wrapper、fallback、第二套 renderer、第二套公式。
- 新制度正式取代舊制度時，優先刪除舊路徑，不讓兩套規則同時存在。
- 不為表面整潔一次大改無關系統。
- Bug 要先追完整 override chain，不要連續猜原因。
- 玩家正式規則與 GM 測試規則必須共用同一套正式公式。
- `main` 是唯一真實來源；文件只能描述，不可反過來凌駕程式。

## 修改後

1. JS / CSS 有變更時，更新 `index.html` 對應 cache-bust。
2. 重讀所有變更檔。
3. 再重讀完整 `index.html`。
4. 做 base → head compare，確認只改預期檔案。
5. 能搜尋的舊 API／舊文字／舊欄位要再搜尋一次，避免 late override 復活。
6. GitHub 寫入成功 ≠ GitHub Pages / Safari runtime 已實機驗證；回覆時必須區分。

---

# 3. 正式載入骨架與權責

## CSS

目前 `index.html` 正式 CSS 順序：

```text
style.css
componentstyles.css
backgrounds.css
backgroundpreload.css
guide.css
dungeonarena.css
dungeonplayerui.css
arenaplayerflow2.css
battleflow.css
worldmapui.css
adventureuipolish.css
functionuipolish.css
dungeondesktoppolish.css
dungeonuipolish.css
combatsettlementpolish.css
```

重要權責：

- `style.css`：全域基礎元件。
- `componentstyles.css`：正式靜態元件樣式。
- `backgrounds.css`：**唯一正式圖片背景來源**。不要另外做第二套背景 URL 清單或 loader 資料源。
- `backgroundpreload.css`：進站背景預載畫面。
- `*uipolish.css` / `combatsettlementpolish.css`：正式玻璃 UI、透明度與視覺層級。
- `dungeondesktoppolish.css`：桌機副本排版，不應搶圖片背景所有權。

## JS 關鍵順序

核心順序目前是：

```text
data / worldmaps
→ engine.js
→ vipprogression.js
→ dailycore.js
→ specialization.js
→ combatcore.js
→ dungeonprogress.js
→ savemigration.js
→ dungeoncore.js
→ guide / UI
→ bounty / arena / void
→ GM
→ battle pipeline / background / offline
→ dungeon UI / arena player flow
→ runtimeintegrity.js
→ backgroundpreload.js
```

特別注意：

- `engine.js` 只保留 VIP 戰鬥能力基礎加成；VIP 門檻／等級正式公式在 `vipprogression.js`。
- `newState()` 只存在一套中央流程；VIP、Daily、Dungeon 透過 `registerNewStateNormalizer()` 註冊。
- 正式新存檔 normalizer 目前應恰好為 3 個。
- `continuousbattle.js` 已退休，不再載入。
- `dungeonvoidgmui.js` 已刪除，不再載入。
- `gameguidearena5.js` 目前只留 `GAME_GUIDE_ARENA_V6=true` 標記，避免舊說明覆蓋；真正說明只維護 `gameguide.js`。

---

# 4. 核心角色、EXP、經濟與裝備公式

正式來源以 `engine.js` 為主。

## 基礎能力

```text
BaseHP(L)  = ceil(110 + 12 × (L - 1))
BaseATK(L) = ceil(15 + 2.2 × (L - 1))
BaseDEF(L) = ceil(7 + 1.2 × (L - 1))

MONSTER_MAX_CRIT_RATE  = 30
MONSTER_MAX_DODGE_RATE = 30
CRIT_DAMAGE_MULTIPLIER = 1.5
```

## EXP

```text
sameExp(L) = ceil(25 + 4L)
expProgressionFactor(L) = 5 + 495 × (1 - exp(-(L-1)/142))
expNeed(L) = ceil(sameExp(L) × expProgressionFactor(L))
EXP_CURVE = { killMin:5, killRange:495, scale:142 }
```

等級差 EXP multiplier：

```text
怪物-玩家 >= +5：1.30
>= +3：1.20
>= +1：1.10
= 0：1.00
>= -2：0.90
>= -5：0.60
>= -10：0.25
更低：0.05
```

Lv500 後不再累積一般 EXP；相關特殊 payout 會依現行程式轉換為金幣。

## 經濟

```text
goldBase(L) = ceil(6 + 4L)
sellBase(L) = ceil(12 + 8L)
買價 = ceil(售價 × 3.5)
```

品質能力倍率：

```text
普通 1.00
優良 1.15
稀有 1.35
史詩 1.60
傳說 1.95
神話 2.40
```

品質售價倍率：

```text
1 / 1.4 / 2 / 3.2 / 5 / 8
```

主線基礎掉裝率：普通 25%、菁英 60%、Boss 100%。

`equipmentScore()`：

```text
atk×5 + def×5 + hp + crit×(20+0.5L) + dodge×(20+0.5L)
```

## 裝備出售的重要現況

- 自動出售永遠不出售神話（q5）。
- 手動「一鍵出售較低或同能力裝備」會包含**未鎖定**且評分 ≤ 目前同部位裝備的神話裝備。
- 單件出售神話需要額外 confirm。
- 鎖定裝備不會被手動出售、一鍵出售、自動出售。
- 換裝後舊裝若符合自動出售條件可直接賣出。

這裡曾修正過「神話裝備被錯誤排除在手動批次出售之外」的 bug；不要把 q5 再從 `equipmentLowerSalePreview()` 排除。

---

# 5. 世界與主線

10 大區域：

1. 地球戰爭 Lv1～50
2. 太陽系戰爭 Lv51～100
3. 近星戰爭 Lv101～150
4. 星際邊疆 Lv151～200
5. 獵戶臂戰爭 Lv201～250
6. 銀河邊境 Lv251～300
7. 銀河中域 Lv301～350
8. 銀河核心外圍 Lv351～400
9. 銀河核心戰爭 Lv401～450
10. 銀河統合戰爭 Lv451～500

每區 10 張，共 100 張。

`registerRegionMaps(regionId, regionMaps)` 固定寫入 `WORLD_REGIONS` 指定 slot。map index 是持久身分，若要插入／重排，必須先評估 save migration。

## 主線推進

- 普通怪、菁英依序各需 10 次推進。
- 達該地圖最高等級後才能挑戰 Boss。
- Boss 首殺解鎖下一張地圖並免費刷新新地圖商店。
- Boss 失敗後需再擊敗該地圖菁英 10 次才能再次挑戰。

## 主線戰鬥正式 invariant

**選怪 → 打怪 → 結算（獨立單一畫面）→ 確認 → 回選怪**

不要在結算顯示前先把 `adventureScreen` 切回 prepare；曾經因此造成結算畫面被提早覆蓋，已修正。

主線模式：

- 單場戰鬥
- 連續戰鬥
- Boss 固定單場

正式連續戰鬥：

```text
CONTINUOUS_BATTLE_COUNT = "continuous"
ctx.continuous = true
requestContinuousBattleStop()
```

停止時為「本場結束後停止」。每場結束回滿 HP；死亡終止；已取得獎勵保留；最後統一顯示結算。

主線戰鬥**不再產生任何副本進度／副本次數**。

---

# 6. VIP 正式規則

正式門檻來源：`vipprogression.js`。

```text
VIP_THRESHOLD_BASE = 2500
threshold(level) = 2500 × level²
VIP level = floor(sqrt(vipPoints / 2500))
最高 VIP20
VIP20 門檻 = 1,000,000
```

`engine.js` 裡舊的 `1000 × level²` 已刪除；不要再建立第二套門檻公式。

## 每級基礎能力

每 1 級 VIP：

```text
HP +0.5%
ATK +0.5%
DEF +0.25%
暴擊 +0.25%
閃避 +0.25%
```

## 偶數級特權

- VIP2：主線裝備掉落率 +5 個百分點
- VIP4：所有可取得 VIP 積分的副本，VIP 積分 +10%
- VIP6：特殊怪遭遇率 +2 個百分點
- VIP8：主線與懸賞掉落裝備 15% 機率優先目前最弱部位
- VIP10：特殊怪特殊獎勵 10% 機率再次發動一次
- VIP12：所有可取得 VIP 積分的副本，VIP 積分總加成提升為 +20%
- VIP14：主線與懸賞掉落裝備 5% 機率品質 +1 階
- VIP16：主線 Boss 15% 機率額外掉落 1 件裝備
- VIP18：主線 Boss 掉落裝備 10% 機率品質 +1 階
- VIP20：死亡時不再遺失裝備

## VIP 副本積分倍率

```text
VIP0～3   ×1.00
VIP4～11  ×1.10
VIP12～20 ×1.20
```

正式 API：

```text
vipDungeonPointMultiplier()
adjustVipDungeonPoints()
addDungeonPoints()
```

目前真正取得 VIP 積分的副本來源：**競技場、虛空幻境**。懸賞不給 VIP 積分。

---

# 7. 專精正式規則

正式來源：`specialization.js`。

8 項專精，全部最高 **Lv60**。

升到目標等級 N 的單級成本：

```text
1000 × N²
```

效果：

```text
training     每級 EXP +2.5%        → Lv60 +150%
scavenge     每級怪物金幣 +2.5%   → Lv60 +150%
appraisal    每級裝備售價 +2.5%   → Lv60 +150%
initiative   每級第一擊傷害 +1%   → Lv60 +60%
combo        每級連擊率 +0.5%     → Lv60 30%，追加攻擊 50% 傷害，可再次連擊
penetration  每級穿透率 +0.5%     → Lv60 30%，觸發時忽略 25% DEF
counter      每級反擊率 +0.5%     → Lv60 30%，反擊 40% 傷害
drain        每級汲取率 +0.5%     → Lv60 30%，回復本次實際傷害 10%
```

專精正式效果只由 `specializationPercentBonus()` / 對應 multiplier API 提供，戰鬥核心不要再額外乘舊公式，避免雙重計算。

GM 可直接管理正式專精等級，也可在測試工作階段使用獨立測試專精；測試專精重整後回 Lv0，不改正式角色資料。

---

# 8. 每日狀態與重置

正式來源：`dailycore.js`。

每日 key 以 UTC+8 計算：

```text
gameDailyDateKey(Date.now())
DAILY_TIMEZONE_OFFSET_MINUTES = 480
```

每日 state：

```js
state.daily = {
  dateKey,
  bounty: { used: 0 },
  arena: { used: 0 },
  voidMirage: { highestFloor: 0, claimed: false }
}
```

正式上限：

```text
懸賞：20 次 / 日
競技場：20 輪 / 日
```

`normalizeDailyState()` 會直接把異常 `used` clamp 到 0～20；不是只在畫面顯示時 clamp。

## Header 時鐘

`batch5ui.js` 在主畫面 Header 顯示：

```text
HH:MM:SS
每日凌晨 0 點重置
```

- 不顯示「臺灣時間」字樣。
- 每秒更新顯示，但不會每秒存檔。
- 真正跨日才同步 daily state 並 `save(false)`。
- 若當下有戰鬥或 bounty / arena / void background progress，跨日不會硬 `render()` 打斷戰鬥。

---

# 9. 副本共通：舊共享制度已完全退休

開放：

```text
懸賞 Lv5
競技場 Lv15
虛空 Lv25
```

**已不存在：**

```text
state.dungeon.progress
state.dungeon.attempts
state.dungeon.activeRun
state.dungeon.points
canStartDungeonRun()
beginDungeonRun()
getActiveDungeonRun()
finishDungeonRun()
```

`dungeoncore.js` 現在只保留共用 `dungeonFightCore()`。

`normalizeDungeonSaveState()` 與 `savemigration.js` 都會刪除上述四個舊欄位。

正式 state 入口：

```text
ensureDungeonState()
```

`ensureDungeonProgressState` 目前只保留為相容 alias；新程式一律優先使用 `ensureDungeonState()`。`dungeonarena.js` 仍有少量既有程式使用相容 alias，若未來要完全移除，需先全域搜尋再做單獨重構。

---

# 10. 懸賞戰

正式來源：`dungeonbounty.js`。

## 每日與流程

- 每日最多 **20 次**。
- 進入／預覽 ready 畫面不扣次數。
- 真正開始一場戰鬥時才 `consumeDailyDungeonUse("bounty",1)`。
- 單次與連續模式都保留。
- 連續模式停止條件：死亡／手動停止／今日額度用完。
- 每場結束後 HP 回滿。
- 不使用共享副本次數。

## Tier

```text
普通懸賞 45%
EXP ×5
金幣 ×5
裝備 2 件
HP ×1.00
Damage ×1.00
DEF ×0.88

高級懸賞 35%
EXP ×8
金幣 ×8
裝備 3 件
HP ×1.03
Damage ×1.03
DEF ×0.90

危險懸賞 20%
EXP ×12
金幣 ×12
裝備 5 件
HP ×1.08
Damage ×1.06
DEF ×0.92
```

懸賞品質基礎權重：

```text
普通 0
優良 0
稀有 60
史詩 35
傳說 4.5
神話 0.5
```

怪物特性、VIP8、VIP14 仍可進一步影響掉落部位／品質。

玩家 UI 不需要公開所有精確 Tier 機率與內部戰力倍率；GM 測試可顯示完整數據。

---

# 11. 競技場

正式由以下模組協作：

```text
dungeonprogress.js
dungeonarena.js
arenawindowcore.js
arenapositioncore.js
arenaplayerflow2.js
```

## 每日與基本流程

- 每日最多 **20 輪**。
- **1 輪 = 完整三連戰**。
- 選場館／預覽／ready 不扣。
- 真正開始第一戰時才扣 1 輪。
- 三戰之間不回血。
- 一輪結束（全通或中途失敗）後回滿 HP。
- 中途失敗仍保留已通過戰鬥的部分基礎積分。
- 連續模式每輪開始前重新檢查今日額度；死亡／手動停止／額度用完會終止。

## VIP 積分正式公式

第 1～3 階全通基礎值：

```text
普通 50
困難 100
極限 150
```

第 R 階（R >= 4）：

```text
基礎值 + 60 × (R - 3)
```

例：

```text
R4  = 110 / 160 / 210
R10 = 470 / 520 / 570
```

三戰 partial point 仍按原 stage weight 比例切分：

```text
normal  [25,35,120]
hard    [35,45,200]
extreme [40,60,320]
```

**VIP 倍率只在一輪結束時對該輪已取得的基礎積分總和套一次。**

這是重要 bug 修正：不能每戰分開套 VIP 再四捨五入，否則會產生 rounding drift。

R10 極限完整一輪：

```text
基礎 570
VIP4  → 627
VIP12 → 684
```

## 階級與戰力

Rank 1～10；每升一階敵人倍率：

```text
HP     × (1 + 0.05 × (rank-1))
Damage × (1 + 0.015 × (rank-1))
DEF    × (1 + 0.03 × (rank-1))
```

目前只顯示最近最多 3 個已解鎖競技場。

解鎖下一競技場需同時：

1. 目前最高競技場戰力評估通過。
2. 下一競技場對應世界區域已解鎖。

戰力評估：

```text
模擬 500 次
至少 485 次全通
= 97%
```

Async 評估每批 10 次讓出 event loop，避免 UI 長時間凍結。

玩家畫面位置顯示「低／中／高」；internal 仍使用 `normal / hard / extreme` template id。

---

# 12. 虛空幻境

正式來源：`dungeonvoid.js` + `dungeonvoidui.js` + `dailycore.js`。

## 核心規則

- **沒有最高層數。**
- 歷史最高永久存在：`state.dungeon.voidMirage.highestCleared`。
- 可以無限重複挑戰。
- 每次新挑戰起始層：

```text
max(1, 歷史最高 - 100)
```

例：

```text
80    → 1
850   → 750
2500  → 2400
4000  → 3900
5000  → 4900
10000 → 9900
```

歷史最高只決定起點；**當日最高只決定當日獎勵**，兩者不可混用。

## 每日獎勵

```text
基礎 VIP = 當日最高層 × 2
```

領取時再走通用 VIP 副本倍率。

- 每日只能**手動領取 1 次**。
- 若先領後再爬更高，當天不能領第二次。
- 忘記領，跨日後不補發。
- 每日重置只清當日最高與 claimed；不清歷史最高。

## 戰鬥公式

```text
equivalentPower = 24 + floor / 10
HP  = ceil((62 + 16.2 × equivalentPower) × 2.40)
ATK = ceil((10.5 + 2.45 × equivalentPower) × 2.15)
DEF = ceil((3.2 + 0.92 × equivalentPower) × 2.65)
Crit  = 10
Dodge = 8
```

- 每 10 層 Boss。
- 一般層 1 個怪物特性。
- Boss 層 2 個怪物特性。
- 每層勝利後 HP 回滿。
- 正常通關一層只做必要的一次 `save(false)`；已清掉先前同層重複存兩次的 localStorage 寫入。

## 已退休舊 API

以下不應再出現：

```text
getVoidMirageNextFloor
voidMirageFirstClearPoints
VOID_MIRAGE_MAX_FLOOR
```

也不存在逐層首通 VIP、Boss 首通 VIP×2、5000 層封頂等舊規則。

---

# 13. GM 功能現況

GM Hub 正式分為「管理」與「測試」方向。

## 副本／VIP正式資料管理

`batch5ui.js` 的 `gmDungeonManagementHtml()` 是正式來源，`gmhub.js` 直接呼叫，不再靠後載入字串替換舊 HTML。

可直接管理：

- VIP 積分（VIP level 由正式 normalizer 重算）
- 今日懸賞已用 0～20
- 今日競技場已用 0～20
- 虛空歷史最高
- 虛空當日最高
- 虛空今日是否已領獎

其他功能：

- 一鍵重置今日副本資料
- 重置虛空紀錄
- 重置 VIP
- 虛空 run 進行中時禁止直接改虛空資料
- 若 GM 設定「當日最高 > 歷史最高」，會自動把歷史最高同步提高

## 測試

`dungeongm.js` 可測：

- 主線怪物
- 三種懸賞
- 三種競技場
- 虛空指定樓層／連續爬塔

GM 模擬為沙盒，不修改正式角色資料。

競技場 GM 平均積分已修正：

- 顯示平均基礎積分
- 顯示平均實得 VIP 積分
- 每輪一次套測試 VIP 倍率，與正式玩法一致

虛空 GM 已改為新版每日獎勵概念，不再顯示「首通積分／平均每層積分」。

`dungeonvoidgmui.js` 已刪除；不要重新建立舊 GM UI 注入層。

---

# 14. Save / Load / Migration 正式狀態

正式來源：`savemigration.js`。

```text
SAVE_VERSION = 11
SAVE_SCHEMA_VERSION = 11
SAVE_LOAD_PIPELINE_VERSION = 2
```

正式 runtime load 只有 `savemigration.js` 的 `window.load()`。

流程：

```text
讀 localStorage raw
→ 保留 rawSnapshot / sourceVersion
→ clone working state
→ migrateSave()
→ normalizeSaveState()
→ EXP / gear / world / VIP / specialization / daily / dungeon / void / offline normalize
→ cleanupLegacyDungeonFields()
→ finalizeDungeonLoadedState()
→ selectedMap / HP / shop normalize
→ saveVersion = 11
→ save(false)
```

舊 EXP：`sourceVersion <= 9` 時會依舊曲線進度比例換算到目前 EXP 曲線。

舊副本欄位：

```text
progress
attempts
activeRun
points
```

在 migration 與 dungeon normalizer 都會被刪除。

重要背景：使用者已明確表示**不需要為極舊存檔保留已淘汰的共享副本進度／共享副本 points**；目前只有自己使用，必要時會自行重置。因此不要為了兼容已退休制度重新加回舊欄位。

## `newState()`

目前由 `engine.js` 建一份 base state，透過 `registerNewStateNormalizer()` 依序套正式 normalizer。

正式 normalizer 目前應為 3 個：

1. VIP
2. Daily
3. Dungeon

不要再用 `const baseNewState = newState; newState = function(){...}` 一層層包裝。

---

# 15. 離線收益

正式來源：`offlineprogress.js`。

```text
最短離線：1 分鐘
最長計算：12 小時
EXP rate：10%
Gold rate：10%
Gear roll rate：10%
```

離線收益只有：

- EXP
- 金幣
- 裝備

**不會：**

- 增加任何副本進度
- 增加任何副本次數
- 取得 VIP 積分

離線戰鬥速度會使用正式在線戰鬥樣本，並有時間回撥保護、heartbeat、pending settlement，避免時鐘異常重複取得收益。

舊版「離線副本進度」已完全移除；不要加回。

---

# 16. 遊戲說明現況

正式來源：`gameguide.js`，`GAME_GUIDE_VERSION = 7`。

設計原則已改成：**玩家說明講玩法與限制，不做開發規格表。**

因此遊戲說明目前刻意不列：

- 競技場 1～10 階完整 VIP 數表
- `2500 × VIP 等級²` 詳細公式
- VIP 每級完整能力百分比表
- 每個 VIP 特權的完整精確機率表
- 專精每級完整數值表
- 商店 12,800 → 100 等內部刷新數值
- 主線 100 張／每區 10 張等不必要的細節堆疊

但仍保留玩家必須知道的硬規則，例如：

- Lv5 / 15 / 25 副本解鎖
- 懸賞每日 20 次
- 競技場每日 20 輪
- 每日凌晨 0 點重置
- 虛空歷史最高前 100 層起跑
- 虛空「當日最高層 × 2」
- 角色 Lv500 上限
- 主線推進條件
- 離線最多 12 小時

`gameguidearena5.js` 只留停用舊文字覆蓋的 marker，不可再塞第二套說明內容。

---

# 17. 背景圖與預載

## 正式背景來源

`backgrounds.css` 是唯一圖片背景權責來源。

目前主要 scene：

```text
home
adventure-map
prepare
battle-main
character
inventory-shop
guide-settings
dungeon-home
dungeon-bounty
dungeon-bounty-battle
dungeon-arena
dungeon-arena-battle
dungeon-void
dungeon-void-battle
```

desktop / mobile 以 `761px` breakpoint 分流；實際遊戲使用 `assets/backgrounds/.../*.webp` 壓縮圖，不是 `backgrounds-source` 原始大圖。

## 背景預載

新增：

```text
backgroundpreload.js
backgroundpreload.css
```

進站流程：

```text
開網頁
→ 顯示「文明戰線／背景載入中 X / N」
→ backgroundpreload.js 直接掃描目前 CSS rule
→ 只預載目前裝置 media query 真正會用到的 assets/backgrounds 圖
→ 完成後顯示首頁
```

- 手機只載 mobile，桌機只載 desktop。
- 不維護第二份背景 URL 清單。
- 12 秒 safety timeout；個別圖 error 也不會永久卡住。
- 這是為了解決「第一次點冒險／角色／副本時背景晚 0.x～1 秒才跳出」的觀感問題。

---

# 18. UI / 結算重要行為

## 主線結算

`settlementui.js` 會：

- 保留主線本次 EXP、金幣、裝備
- 特殊遭遇另列
- 中途中止／死亡也保留已取得獎勵
- 掉落裝備若為真正升級，可在結算直接「立即裝備」
- 換下裝備仍走正式自動出售／鎖定規則

不要再顯示「副本進度／獲得副本次數」。

## 副本首頁

`dungeonui.js` 頂部狀態目前 4 格：

- 等級
- EXP
- 金幣
- VIP 狀態

不再顯示共享「副本次數」。

## 透明度／背景

`combatsettlementpolish.css` 不應在外層 `.dungeon-bounty-combat` / `.arena-combat` 重新加 `background:` shorthand 蓋掉 `backgrounds.css` 的 scene 圖。

---

# 19. Runtime Integrity 自我檢查

`runtimeintegrity.js` 目前會檢查至少以下項目：

- 世界地圖註冊完整
- save/schema/pipeline 版本
- VIP core version 12
- VIP 基數 2500
- VIP1=2500、VIP20=1,000,000
- 570 base points 在 VIP12 = 684
- 專精上限 60
- 懸賞／競技場每日 20
- 虛空沒有最高層
- 虛空 start offset 100，並測多組起點
- 競技場代表性積分點
- `newState()` normalizer 必須恰好 3 個
- 新存檔必須有 Daily / Arena / VIP 正確初始資料
- 新存檔不能帶舊 dungeon 欄位
- Daily `used=999` 必須 normalize 成 20
- 舊共享副本 run API 不得存在
- `getVoidMirageNextFloor` / `voidMirageFirstClearPoints` 不得存在
- 退休的 `VOID_MIRAGE_GM_UI_V2` 不得存在
- Header 時鐘格式／重置文字
- 遊戲說明新版必要文字與舊文字禁止清單
- GM UI 不得重新出現舊副本次數／首通積分文字
- Arena normalize 必須保留同一 arena object reference

修改核心系統後應同步擴充／修正這裡的 invariant，而不是只改功能檔。

---

# 20. 這個對話期間已完成的主要修改（時間線摘要）

## A. 副本／VIP／專精六批大改

1. **核心 foundation**
   - SAVE/schema → 11
   - VIP 門檻正式改 2500×level²
   - 專精 Lv60、每級效果減半
   - Daily core 建立
   - VIP 副本積分通用 multiplier 建立

2. **主線／離線退出共享副本進度**
   - 主線不再給 dungeon progress
   - settlement 不再顯示 dungeon progress / attempts
   - offline 不再給 dungeon progress
   - 修正主線結算前誤切 prepare 的 bug

3. **懸賞＋競技場每日制**
   - 懸賞每日 20 場
   - 競技場每日 20 輪
   - 競技場新積分公式
   - VIP multiplier 改成整輪只套一次，修正 rounding drift

4. **虛空重製**
   - 無共享次數
   - 可重複挑戰
   - 起點 = 歷史最高 - 100，最低 1
   - 每日獎勵 = 當日最高 ×2
   - 每日手動領 1 次
   - 原本曾加入 5000 層上限，後來依使用者更正**完整移除**，現在無限層

5. **時鐘＋GM＋VIP UI**
   - Header `HH:MM:SS`
   - 每日凌晨 0 點重置
   - 跨日戰鬥保護
   - GM 可管理 Daily / VIP / Void
   - VIP4/12 文案改成通用 VIP 積分副本加成

6. **遊戲說明與舊文字總清理**
   - game guide 全面改新版副本規則
   - 舊共享 dungeon state 清掉
   - late override 舊說明停用

## B. 遊戲說明再簡化

- 競技場完整 VIP 積分表移出玩家說明
- VIP 公式／完整特權精確數字移出玩家說明
- 專精完整數表移出玩家說明
- 商店內部刷新數字簡化
- 主線地圖說明簡化
- 保留真正影響操作的硬限制

## C. 背景預載

- 進站先預載目前裝置需要的所有正式背景
- 解決第一次切頁背景晚出現
- 直接讀 `backgrounds.css`，不做第二份 URL source

## D. 四批技術債清掃

1. **舊副本核心**
   - 刪 `canStartDungeonRun / beginDungeonRun / getActiveDungeonRun / finishDungeonRun`
   - `dungeoncore.js` 只留戰鬥核心

2. **GM 舊資料**
   - 移除舊 `progress / attempts / points` GM 寫入與 UI
   - `gmhub.js` 正式直接呼叫新版副本管理 HTML
   - 虛空 GM 改新版每日獎勵模型
   - Arena GM 正確套測試 VIP 積分倍率

3. **VIP／Save／Daily 核心**
   - `engine.js` 舊 1000×VIP² 完全刪除
   - newState wrapper chain 改成中央 normalizer registry
   - Daily used 正式 clamp 0～20
   - migration 明確清理舊 dungeon fields

4. **結構／效能收尾**
   - 虛空每層重複 save 減少
   - 移除 `getVoidMirageNextFloor / voidMirageFirstClearPoints`
   - 新正式名稱 `ensureDungeonState()`
   - 刪除 marker-only `dungeonvoidgmui.js`
   - 評估競技場模組後決定不做過度合併；維持 battle / window / assessment 分工

---

# 21. 已知尚未完成／刻意保留事項

目前沒有已知「必須立即完成」的核心玩法改版；主線、副本、VIP、專精、GM、Save pipeline 都已完成本輪正式收尾。

仍需注意：

1. **實機驗證永遠不是 GitHub 寫入可取代的。**
   - 下一個對話若有 UI／Safari 問題，仍需使用者實際在 GitHub Pages + iPhone Safari 測試。

2. **`ensureDungeonProgressState` 相容 alias 仍在。**
   - 正式新 API 是 `ensureDungeonState()`。
   - `dungeonarena.js` 仍有既有程式使用 alias。
   - 未來若要刪 alias，應另做小型重構並先全域搜尋，不要直接拔掉。

3. **`gameguidearena5.js` 是 marker-only 檔案。**
   - 目前無功能風險，只為防舊 override。
   - 若未來想刪，需同步調整 `runtimeintegrity.js` 與 `index.html`。

4. **部分舊 JS 仍動態注入 CSS。**
   - 例如 specialization / dungeon UI / GM / offline 等。
   - 這是結構債，不是目前 bug；除非使用者要求維護整理，不要為了潔癖一次大搬家。

5. **本機存檔。**
   - 尚未導入 Firebase / Google Sheet / server save；桌機與手機不會自動同步。

---

# 22. 下一個對話如何接手（標準指令）

建議使用者在新對話第一句直接貼：

> **讀取 `franksky1207/rpg` 的 `PROJECT_HANDOFF.md`，再重新檢查 `main` 的完整 `index.html` 與本次需求相關的實際程式碼，完整承接《文明戰線》專案。`main` 是唯一真實來源；如果交接文件和程式衝突，以 `main` 為準。現在先不要修改，先告訴我你已確認目前正式狀態。**

若要直接進行修改，可改成：

> **讀取 `franksky1207/rpg` 的 `PROJECT_HANDOFF.md`，再重新檢查 `main` 的完整 `index.html` 與本次需求相關的實際程式碼，完整承接《文明戰線》專案。`main` 是唯一真實來源；如果交接文件和程式衝突，以 `main` 為準。接著直接依我下面的需求修改 `main`；修改後重新讀回、自我檢查、更新 cache-bust，並做 base→head compare。**
