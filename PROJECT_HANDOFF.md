# 《文明戰線》正式跨對話交接文件

> **最高原則：GitHub `main` 的實際程式碼永遠是唯一真實來源。**
>
> 若本文件、歷史對話、舊截圖、舊規格或舊 commit 與目前 `main` 衝突，一律重新讀取 `main` 後，以實際程式碼為準。

更新日期：**2026-09-14**

本文件已納入 2026-09-14 五批維護：CSS 權責整理、JS 靜態樣式外移、save/load pipeline 收斂、連續戰鬥相容層移除、文件與維護資料更新。為避免文件寫入本身讓 SHA 立即過期，不把本文件硬綁某個最終 HEAD；接手時必須重新讀 `main`。

---

# 1. 專案基本資料

- Repository：`franksky1207/rpg`
- 正式分支：`main`
- 遊戲名稱：**文明戰線**
- 架構：純前端 HTML / CSS / JavaScript + `localStorage`
- 正式存檔 key：`frank_text_rpg_save`
- `SAVE_VERSION = 10`
- `SAVE_SCHEMA_VERSION = 10`
- `SAVE_LOAD_PIPELINE_VERSION = 2`
- `MAX_LEVEL = 500`
- `VIP_MAX_LEVEL = 20`
- `SPECIALIZATION_MAX_LEVEL = 30`
- 世界：10 大區域、100 張主線地圖、Lv1～500
- 桌面版＋手機版；**iPhone Safari 是重要真機環境**。

`backgroundprogress.js` 的 background 指瀏覽器進入背景／失焦後的執行補償，**不是圖片背景 loader**，不可誤刪。

---

# 2. 修改規範

## 修改前

1. 重新讀 `main` 相關正式來源。
2. 重新讀**完整 `index.html`**，確認 CSS / JS 載入順序與 cache-bust。
3. 追查跨檔 selector、state、renderer、migration、normalize、wrapper、late override 後再決定修改位置。
4. 不可只依賴本交接文件或歷史對話。
5. 視覺問題要同時確認 desktop / mobile media query 與 iPhone Safari。
6. 公式／數值只改正式來源，不建立第二套公式。

## 使用者授權語意

- 「先討論／先分析／先不要修改／先檢查」＝不可寫 GitHub。
- 「做／修改／修正／執行／開始／第 X 批／直接用／上傳到遊戲網頁」＝已授權直接修改 `main`。

## 修改原則

- 優先修改正式來源。
- 不額外堆 wrapper、fallback、第二套 renderer、第二套公式。
- 新制度正式取代舊制度時，優先刪除舊路徑。
- 不為表面整潔一次大改無關系統。
- Bug 先追完整 override chain，不連續猜原因。

## 修改後

1. JS / CSS 有變更時更新 `index.html` cache-bust。
2. 重讀所有變更檔。
3. 再重讀完整 `index.html`。
4. base → head compare，確認只改預期檔案。
5. GitHub 寫入成功 ≠ Pages / Safari runtime 已實機驗證；回覆時必須區分。

---

# 3. 正式載入骨架

CSS 目前依序：

```text
style.css
componentstyles.css
backgrounds.css
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

- `style.css`：基礎元件／全域樣式。
- `componentstyles.css`：VIP、結算、特殊遭遇等正式靜態元件基礎樣式；原本在 JS 動態注入的相關 CSS 已搬出。
- `backgrounds.css`：**唯一正式圖片背景來源**；主要管圖片、viewport、cover、position、overlay，不再持有一般卡片材質。
- `*uipolish.css` / `combatsettlementpolish.css`：正式玻璃 UI、卡片透明度與視覺層級。
- `dungeondesktoppolish.css`：桌機副本 layout，不可搶背景 shell 所有權。

JS 大致依序：資料／世界 → engine → specialization / combat → dungeon progress → `savemigration.js` → UI → VIP / settlement → dungeon systems → special encounter → battle pipeline → background/offline → dungeon UI → runtime integrity。

`continuousbattle.js` **已刪除**，不再載入。

---

# 4. 核心成長與戰鬥公式

正式來源：`engine.js`。

```text
BaseHP(L)  = ceil(110 + 12 × (L - 1))
BaseATK(L) = ceil(15 + 2.2 × (L - 1))
BaseDEF(L) = ceil(7 + 1.2 × (L - 1))

MONSTER_MAX_CRIT_RATE  = 30
MONSTER_MAX_DODGE_RATE = 30
CRIT_DAMAGE_MULTIPLIER = 1.5
```

EXP：

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

Lv500 後 EXP 不累積；特殊 payout 可把 EXP 1:1 轉金幣。

經濟：

```text
goldBase(L) = ceil(6 + 4L)
sellBase(L) = ceil(12 + 8L)
買價 = ceil(售價 × 3.5)
```

品質倍率：普通 1.00、優良 1.15、稀有 1.35、史詩 1.60、傳說 1.95、神話 2.40；售價倍率依序 1 / 1.4 / 2 / 3.2 / 5 / 8。

主線掉裝率：普通 25%、菁英 60%、Boss 100%。

`equipmentScore()`：

```text
atk×5 + def×5 + hp + crit×(20+0.5L) + dodge×(20+0.5L)
```

---

# 5. 世界與主線

10 區：

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

每區 10 張，共 100 張。`registerRegionMaps(regionId, regionMaps)` 固定寫入 `WORLD_REGIONS` slot；map index 是永久身分，若插入／重排必須做 schema migration。

主線正式模式只有：

- 單場戰鬥
- 連續戰鬥

Boss 永遠單場。連續戰鬥每場結束回滿 HP，可要求「本場結束後停止」，死亡終止，已取得獎勵與副本進度保留，最後顯示總結算。

正式 API：

```text
CONTINUOUS_BATTLE_COUNT = "continuous"
requestContinuousBattleStop()
ctx.continuous
```

舊 `ctx.infinite`、`requestInfiniteBattleStop()`、`.infinite-stop-wrap` 已全部移除；特殊遭遇也直接使用 continuous 正式語意。

`settlementui.js` 已原生處理 `ctx.continuous`，不再需要 `continuousbattle.js` wrapper。

---

# 6. VIP 與專精

VIP：

```text
threshold = 1000 × level²
VIP level = floor(sqrt(points / 1000))，最高 20
```

每級：HP +0.5%、ATK +0.5%、DEF +0.25%、暴擊 +0.25%、閃避 +0.25%。

偶數級特權：VIP2 掉落率、VIP4/12 副本進度、VIP6 特殊遭遇、VIP8 最弱部位、VIP10 特殊獎勵再發動、VIP14 品質、VIP16 Boss 額外掉落、VIP18 Boss 品質、VIP20 死亡保裝。

專精正式來源：`specialization.js`，8 項最高 Lv30，升到目標等級 N 的成本：

```text
1000 × N²
```

training EXP +5%/lv、scavenge 金幣 +5%、appraisal 售價 +5%、initiative 第一擊 +2%、combo +1%（追加 50%）、penetration +1%（忽略 25% DEF）、counter +1%（40% 傷害）、drain +1%（回 10% 實際傷害）。

---

# 7. 副本共通

開放：懸賞 Lv5、競技場 Lv15、虛空 Lv25。

主線勝利副本進度：

```text
damageRate = (startHp - endHp) / playerMaxHp
baseProgress = (enemyMaxHp / BaseHP(playerLevel)) × 1.5 + damageRate × 4
VIP0～3 ×1.00
VIP4～11 ×1.10
VIP12～20 ×1.20
```

每 100 進度 → 1 次可挑戰次數。

正式 run marker：`state.dungeon.activeRun`。`beginDungeonRun()` 扣次數並設 marker；`finishDungeonRun()` 清除。中斷後由 `finalizeDungeonLoadedState()` 回滿 HP 並清 marker。

## 懸賞

普通 45%：EXP×5、金幣×5、2件、HP×1、Damage×1、DEF×0.88  
高級 35%：×8、3件、HP×1.03、Damage×1.03、DEF×0.90  
危險 20%：×12、5件、HP×1.08、Damage×1.06、DEF×0.92

玩家頁不公開 tier 精確機率與戰前精確收益。單次／連續每輪真正開始前才扣 1 次；中間不顯示單場結算，最後統一總結算。

## 競技場

正式由 `dungeonarena.js` + `arenapositioncore.js` + `arenawindowcore.js` + `arenaplayerflow2.js` 協作。

可見最近 3 個競技場；解鎖下一個需「目前最高競技場戰力評估通過＋下一世界區域已解鎖」。Promotion assessment：500 次、需 485 勝（97%），每批 10 次讓出 event loop。

位置對玩家顯示低／中／高；internal template 可保留 normal/hard/extreme id。

## 虛空

Base crit 10、dodge 8；HP×2.40、ATK×2.15、DEF×2.65；每 10 層 Boss。首次通關積分 `round(15 + 1.75 × sqrt(F - 1))`，Boss ×2。永久進度 `state.dungeon.voidMirage.highestCleared`。

一個 run 只在第一層扣一次副本次數；run 內逐層上升。

---

# 8. 正式 save / load pipeline

正式來源：`savemigration.js`。

```text
SAVE_VERSION = 10
SAVE_SCHEMA_VERSION = 10
SAVE_LOAD_PIPELINE_VERSION = 2
```

`engine.js` 的舊 `load()` 已刪除；正式 runtime 只有 `savemigration.js` 的 `window.load()`。

流程：

```text
讀 localStorage raw
→ 保留 rawSnapshot / sourceVersion
→ clone working state
→ migrateSave()
→ normalizeSaveState()
→ gear / world / VIP / specialization / dungeon / void / offline normalize
→ finalizeDungeonLoadedState()
→ selectedMap / HP / shop normalize
→ saveVersion = 10
→ 最後 save(false)
```

v1～v9 的舊 EXP 都以舊曲線比例轉到現在曲線，不只處理 v9。v1～v8 沒有舊離線系統，因此 migration 只從現在建立 offline 起點，不會憑空補多年收益。

`ui.js` 的 `normalizeSaveState()` / `normalizeCurrentSaveState()` 仍保留作為匯入存檔與 rollback 的 defensive normalization 工具；它們不是第二套正式 `load()`。

診斷：

```text
window.LAST_SAVE_MIGRATION_REPORT
window.LAST_SAVE_LOAD_REPORT
window.PROJECT_RUNTIME_REPORT
```

`runtimeintegrity.js` 會檢查 schema=10、pipeline=2、正式函式存在、世界資料與 arena reference 等。

---

# 9. 離線與背景執行

`backgroundprogress.js`：BACKGROUND_CREDIT_RATE=0.96，連續背景補償上限 12 小時。

離線：EXP／金幣／裝備 roll／副本進度皆為 10%；最短 1 分鐘、最長 12 小時；真實戰鬥速度樣本最多 20 筆。

時間防護包含 `maxObservedWallClock`、`timeLockUntil`、`pendingSettlement`。

**重要 UI 行為：**離線收益在結果頁出現前就已計算並存檔；按鈕目前文字為「進入遊戲」，只負責關閉結果頁並 render，不負責發放獎勵。重新整理結果頁不會重複領同一區段。

離線收益結果頁沒有正式專屬圖片背景，因此刻意維持高不透明度，不納入全站玻璃背景透明化。

---

# 10. 正式背景與 UI 系統

14 類：

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

原圖：`assets/backgrounds-source/<category>/desktop|mobile.png/jpg`  
runtime：`assets/backgrounds/<category>/desktop|mobile.webp`

`backgrounds.css` 是唯一正式圖片背景 source。不要重新建立 JS image loader、Base64 chunk、CSS variable loader 或每頁獨立背景模組。

主線戰鬥結算 `#battleResultModal` 使用 prepare 背景；結算流程仍是：

```text
選怪 → 打怪 → 結算（獨立單一畫面）→ 確認 → 回選怪
```

不能在顯示結算前把 `adventureScreen` 改回 prepare。

### 視覺原則

**背景是主角，UI 浮在上面。** 桌機與手機使用相同透明度基準，不因手機全域加深；只有真正高密度／過亮的局部情境才個別調整。

現行大致層級：

```text
背景 overlay：0.10～0.22
大型 outer panel：0.32～0.44
一般功能卡：0.50～0.62
高密度資訊卡：0.66～0.74
戰鬥玩家／敵人卡：0.56～0.66
一般 modal：0.58～0.68
高注意特殊卡：0.68～0.76
```

`backgrounds.css` 不再負責一般卡片 opacity；一般功能卡與高密度卡由 polish CSS 擁有。避免後載入 CSS 用 `background:` shorthand 覆蓋正式背景圖，尤其 bounty / arena combat outer shell。

VIP、結算、特殊遭遇的靜態 CSS 已從 JS 搬到 `componentstyles.css`；JS 只負責 DOM 與功能。後載入 polish CSS 負責最終透明度。

仍有部分舊模組可能使用動態 style injection，例如 `specialization.js`、`dungeonvoidui.js`；若未來整理，需先做 override audit，不要順手刪除。

---

# 11. 背景 Responsive 關鍵規則

- 背景外層＝viewport 寬；內容＝閱讀寬度。
- 不要為修背景而把所有內容強行拉到 100vw。
- desktop 通常 `100vw` + `calc(100vh - 57px)`；mobile 通常扣 52px。
- iPhone Safari 保留 `vh` + `dvh` 雙寫。
- `background-size: cover`。
- `max-width:760px` 是主要 mobile breakpoint。
- Guide 外層全寬，但內容約 1120px 置中。
- `dungeondesktoppolish.css` 不得重新限制 bounty / arena / void 背景 shell。
- 虛空 `dungeon-void` 只用於結算；`dungeon-void-battle` 用於戰鬥。
- `preparemobilecontrols.js` 是手機準備頁控制，不是背景 loader。

已永久淘汰：`assets/bg-*.b64`、Base64 chunk join、舊 home/battle/map/prepare background JS/CSS、圖片 probe＋CSS variable loader。

---

# 12. GM

GM 密碼唯一正式來源是 `data.js` 的 `GM_PASSWORD`。

`gmhub.js` 分管理／測試；手機 tabs sticky。按鈕語意依 `GM_UI_GUIDE.md`：深色一般管理、藍色執行／測試、金橘產生／新增、紅色危險操作。

正式管理包含等級、金幣、世界解鎖、HP、背包、商店、裝備產生、副本進度／次數、VIP、專精、競技場、虛空等。測試沙盒不應污染正式角色資料。

---

# 13. 目前重要正式來源

```text
data.js                 基本常數、SAVE_VERSION、QUALITY、世界 registry、GM_PASSWORD
worldmaps-*.js          100 張主線資料
worldnamingrules.js     世界資料與命名檢查
engine.js               基礎能力、EXP、裝備、VIP、newState、save
savemigration.js        唯一正式 load / migration pipeline
specialization.js       8 專精與專精 UI / GM
a combatcore.js         正式戰鬥核心（檔名實際為 combatcore.js）
ui.js                   主線 prepare / combat / function pages / 存檔匯入 UI
battlepipeline.js       主線單場／連續正式 battle pipeline
settlementui.js         主線＋特殊遭遇正式結算增強
specialencounter.js     特殊遭遇正式流程
dungeonprogress.js      副本進度、attempt、load finalizer
dungeoncore.js          dungeon run marker
dungeonbounty.js        懸賞核心
dungeonarena.js         競技場核心
arenapositioncore.js    position＋戰力評估
arenawindowcore.js      最近 3 個競技場視窗／區域解鎖
arenaplayerflow2.js     競技場玩家 UI
dungeonvoid.js          虛空核心
dungeonvoidui.js        虛空 UI
backgroundprogress.js   瀏覽器背景執行補償
offlinefarmtarget.js    離線 farm target／真實樣本
offlineprogress.js      離線結算／時間防護／結果 UI
componentstyles.css     靜態元件基礎樣式
backgrounds.css         唯一正式圖片背景來源
adventureuipolish.css   主線／首頁玻璃 UI
functionuipolish.css    功能頁玻璃 UI
dungeonuipolish.css     副本玻璃 UI
combatsettlementpolish.css 戰鬥／結算／modal 最終 polish
runtimeintegrity.js     runtime integrity report
index.html              最終實際載入順序與 cache-bust
```

---

# 14. 已完成的 2026-09-14 五批維護

1. **CSS 權責**：`backgrounds.css` 收斂成正式背景 owner；卡片材質交回 polish CSS。
2. **靜態樣式外移**：VIP／settlement／special encounter 的動態 `<style>` 搬入 `componentstyles.css`。
3. **Save pipeline**：`SAVE_VERSION` 統一 10；pipeline 升 2；刪除 engine 舊 load；v1～v9 EXP migration 補正。
4. **舊相容層**：刪除 `continuousbattle.js`；settlement／special encounter 原生使用 `ctx.continuous`；移除 infinite 舊別名。
5. **文件維護**：README 與本交接文件更新到現況；無用途 placeholder／歷史維護標記依本輪實際清理結果為準。

---

# 15. 尚可繼續整理但不是目前 bug

1. `specialization.js` 與部分 void UI 仍有歷史動態 style injection；可另開專門 CSS ownership 重構，不要混進玩法修改。
2. 競技場仍為多檔協作；若重構應收斂 renderer，而不是再疊 wrapper。
3. `ui.js` 的 defensive save normalizer 與正式 pipeline 有部分職責重疊，但它目前承擔 import / rollback 保護；沒有完整 migration 測試前不要粗暴刪除。
4. 背景 selector 使用現代 `:has()`；目前目標瀏覽器可用，無需為舊瀏覽器再建第二套背景系統。
5. 尚未建立完整自動化 visual regression；Safari / iPhone 視覺仍以真機測試為準。
6. 原始 `assets/backgrounds-source` PNG 體積大，但不被 runtime CSS 直接下載；它是 repo 體積而非玩家頁面效能問題。

---

# 16. 下一個對話接手指令

> **讀取 `franksky1207/rpg` 的 `PROJECT_HANDOFF.md`，再重新檢查 `main` 的實際程式碼與完整 `index.html`，完整承接《文明戰線》專案。以 GitHub `main` 為唯一真實來源；若交接檔、歷史對話或舊規格與實碼衝突，以實碼為準。修改前先讀相關正式來源與 override chain；修改 JS/CSS 後更新 `index.html` cache-bust，重新讀變更檔與完整 `index.html`，再做 base→head compare。使用者若說「先討論／先分析／先不要修改」就不可寫入；使用者若說「做／修改／修正／執行／開始／直接用」即代表已授權直接修改 GitHub `main`。優先修改正式來源，不要額外建立 wrapper、fallback、第二套公式或第二套 renderer。現在先不要修改。**
