# 《文明戰線》正式跨對話交接文件

> **最高原則：GitHub `main` 實際程式碼永遠是唯一真實來源。**
>
> 若本文、歷史對話、舊截圖、舊規格或先前 ChatGPT 的敘述與目前 `main` 衝突，一律重新讀取 `main` 後，以實際程式碼為準。

更新日期：**2026-09-13**
本次整理前 `main` HEAD：`9bd2dbee663bb73fd2f540a40a53bf310a59bcbf`

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

目前 `index.html` 正式載入骨架：

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

正式額外 CSS：

```text
homebackground.css
battlebackground.css
mapbackground.css
dungeondesktoppolish.css
```

`runtimediag.js` 已刪除，不再常駐顯示診斷框。

---

# 2. 修改與檢查規範

## 2.1 修改前

1. 每次修改前先重新讀取 `main` 的相關檔案。
2. 同時重新讀完整 `index.html`，確認 script / CSS 實際載入順序與 cache-bust。
3. 先查跨檔案引用、state、save migration、normalize、後載入 override / wrapper、render / DOM 綁定，再決定修改位置。
4. 不可只根據本交接檔、聊天記憶或過去 commit 猜目前程式。
5. 視覺／背景問題要先確認實際 DOM class 與容器高度來源。

## 2.2 使用者授權語意

- 「先討論」「先分析」「先不要修改」「先檢查」→ 不可改 GitHub。
- 「做」「修改」「修正」「執行」「開始」「第 X 批」「上傳到遊戲網頁」→ 已授權，可直接修改 `main`。
- 已明確授權後不要重複要求確認。

## 2.3 修改原則

1. 優先修改正式來源，不要額外堆第二套公式、第二套 UI 或無限 wrapper。
2. 新制度正式取代舊制度時，優先刪除／收斂舊路徑。
3. 相容 API 可保留，但必須清楚標記為相容層。
4. 不為了表面乾淨而一次大改無關系統。
5. 異常時先檢查完整程式鏈，不可連續猜原因、一直叫使用者重整。

## 2.4 修改後

1. 修改 JS / CSS 時必須更新 `index.html` 對應 cache-bust。
2. 重新讀所有變更檔案。
3. 再重新讀完整 `index.html`。
4. compare 修改前 base commit → 修改後 head，確認只改預期檔案。
5. GitHub 寫入成功 ≠ GitHub Pages / 桌面 / iPhone Safari runtime 已驗證，回覆時必須區分。

---

# 3. 核心成長公式

`engine.js`：

```text
BaseHP(L)  = ceil(110 + 12 × (L - 1))
BaseATK(L) = ceil(15 + 2.2 × (L - 1))
BaseDEF(L) = ceil(7 + 1.2 × (L - 1))
```

怪物／戰鬥：

```text
MONSTER_MAX_CRIT_RATE  = 30
MONSTER_MAX_DODGE_RATE = 30
CRIT_DAMAGE_MULTIPLIER = 1.5
```

EXP：

```text
sameExp(L) = ceil(25 + 4L)
expProgressionFactor(L) = 5 + 495 × (1 - exp(-(L-1)/142))
expNeed(L) = ceil(sameExp(L) × expProgressionFactor(L))
```

`EXP_CURVE = { killMin:5, killRange:495, scale:142 }`

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

Lv500 後 EXP 不再累積；正式 payout 可轉換 EXP 1:1 轉金幣。

---

# 4. 世界、100 張地圖與主線

十大區域：

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

每區 10 張，每張 5 級，共 100 張。

正式地圖由 `data.js` 的：

```text
registerRegionMaps(regionId, regionMaps)
```

固定寫入 `WORLD_REGIONS` 指定 slot，不靠 `push/splice` 或 script 順序決定 index。

`validateWorldMapRegistration()` 與 `worldmapregistrycheck.js` 檢查固定註冊；`worldnamingrules.js` 再檢查 100 張連續、每張 5 級、每區 10 張、每張 5 件裝備／5 隻怪、怪物順序、chapter、重名與近似命名。

世界永久進度仍以 map index 為身分：

```text
unlockedMap
mapProgress
bossProgress
bossLocked
bossKilled
```

若未來改既有 map index、插入地圖或重新排序，必須做正式 schema migration。

## 主線正式模式

正式玩家主線只有：

- 單場戰鬥
- 連續戰鬥

Boss 永遠只跑單場。

連續主線：

- 每場結束回滿 HP
- 可按「停止連續戰鬥」
- 停止於目前這一場結束後生效
- 死亡時結束
- 已取得獎勵與副本進度保留
- 最後顯示連續戰鬥總結算

### 重要最新更正

**主線「單場／連續」模式、準備頁與戰鬥頁已正式收回 `ui.js`。**

目前 `ui.js` 原生定義：

```text
CONTINUOUS_BATTLE_COUNT = "continuous"
battleModesForEnemy(enemy)
battleModeLabel(mode)
setBattleMode(mode)
```

一般／菁英顯示「單場、連續戰鬥」；Boss 只顯示單場。

`continuousbattle.js` **不再接管主線模式 UI**，目前只保留連續戰鬥結算相容層；待 `settlementui.js` 原生完整辨識 `ctx.continuous` 後即可考慮刪除。

舊交接中「`ui.js` 還有 1/5/10/15/20/25 場正式 renderer，由 `continuousbattle.js` 後載入接管」的描述已失效。

---

# 5. VIP 系統

```text
VIP threshold(level) = 1000 × level²
VIP level = floor(sqrt(points / 1000))，最高20
```

每級：

```text
HP  +0.5%
ATK +0.5%
DEF +0.25%
暴擊 +0.25%
閃避 +0.25%
```

`normalizeVipState()` 保留歷史最高 VIP 等級，單純降低積分不會降級。

偶數級特權：

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

8 項：

- 實戰訓練：每級 EXP +5%
- 搜刮技巧：每級怪物金幣 +5%
- 鑑價技巧：每級裝備售價 +5%
- 先制技巧：每級第一擊傷害 +2%
- 連擊技巧：每級連擊率 +1%；追加攻擊 50%，追加攻擊可再次連擊
- 穿透技巧：每級穿透率 +1%；觸發忽略 25% 防禦
- 反擊技巧：每級反擊率 +1%；反擊傷害 40%
- 汲取技巧：每級汲取率 +1%；觸發回復本次實際傷害 10%

GM 有正式專精管理與工作階段限定「測試專精」；測試值不寫正式角色。

---

# 7. 副本共通

正式開放：

- Lv5：懸賞戰
- Lv15：競技場
- Lv25：虛空幻境

副本進度：

```text
damageRate = (startHp - endHp) / playerMaxHp
baseProgress = (enemyMaxHp / BaseHP(playerLevel)) × 1.5 + damageRate × 4
實際進度 = baseProgress × VIP副本進度倍率
```

VIP 倍率：VIP0～3 ×1.00、VIP4～11 ×1.10、VIP12～20 ×1.20。

每累積 100 副本進度，自動轉成 1 次可挑戰次數。

正式 run marker：

```text
state.dungeon.activeRun
```

正式 round 真正開始時才 `beginDungeonRun()` 扣次數並寫 marker；`finishDungeonRun()` 清 marker。若正式副本 run 中斷，下次 load 由 `finalizeDungeonLoadedState()` 恢復 HP 並清 marker。

---

# 8. 懸賞戰

玩家只公開「高 EXP・高金幣・多裝備」，不公開 tier 機率、品質精確機率、戰前精確 EXP／金幣／件數。

內部 tier：

```text
普通 45%：EXP×5、金幣×5、2件、HP×1.00、Damage×1.00、DEF×0.88
高級 35%：EXP×8、金幣×8、3件、HP×1.03、Damage×1.03、DEF×0.90
危險 20%：EXP×12、金幣×12、5件、HP×1.08、Damage×1.06、DEF×0.92
```

品質基礎權重：稀有60%、史詩35%、傳說4.5%、神話0.5%。

敵人由不含 VIP 的裝備基礎能力生成；玩家正式戰鬥再套 VIP／戰鬥專精。

單次／連續：

- 一場懸賞＝一個正式 dungeon round
- 下一場真正開始前才再扣 1 次
- 每場結束回滿 HP
- 死亡／次數不足停止
- 手動停止於目前一場結束後生效
- 連續中間場不顯示選擇頁與單場結算
- 最後統一總結算

`prepareNextBounty()` 已使用 transition；`bountycontinuousui.js` 已刪除；戰前精確獎勵 preview 已移除。

---

# 9. 競技場

正式名稱為 10 個世界區域競技場；玩家介面不得把正式競技場稱為普通／困難／極限。`normal / hard / extreme` 只保留為 internal position template id。

永久進度：

```text
state.dungeon.arena.highestArenaUnlocked
```

可見視窗最多最近 3 個：

```text
1
1 2
1 2 3
2 3 4
...
8 9 10
```

解鎖下一個必須同時：

```text
目前最高競技場戰力評估通過
AND
下一個競技場所對應主線區域已解鎖
```

戰力評估：

```text
ASSESS_RUNS = 500
ASSESS_CLEAR_TARGET = 485
ASSESS_BATCH_SIZE = 10
```

即 97%；每批 10 次，`setTimeout(step,0)` 對 Safari 讓出 event loop。

評估 signature 包含 rank、position id、玩家等級、不含 VIP 的基礎 HP/ATK/DEF/crit/dodge、VIP level、五項戰鬥專精。

版本：

```text
positionModelVersion = 1
assessmentRuleVersion = 2
```

Rank multiplier：

```text
RankHp     = 1 + 0.05  × (R - 1)
RankDamage = 1 + 0.015 × (R - 1)
RankDef    = 1 + 0.03  × (R - 1)
```

三戰共通 profile：

```text
S1：HP×0.60 / Damage×0.57 / DEF×0.78
S2：HP×0.69 / Damage×0.64 / DEF×0.80
S3：HP×0.78 / Damage×0.73 / DEF×0.82
```

正式敵人：

```text
EnemyHP = BaseEnemyHP(P) × StageHp × RankHp
EnemyDamageComponent = BaseEnemyDamage(P) × StageDamage × RankDamage
EnemyATK = ceil(EnemyDamageComponent + P.def × 0.55)
EnemyDEF = BaseEnemyDEF(P) × StageDef × RankDef
```

`P` 為不含 VIP 的玩家基礎 snapshot；位置只影響 crit / dodge / trait，不影響同 Rank 三維。

位置最高約：低 9/8、中 16/14、高 23/20（crit/dodge）。

積分視窗：

```text
normal=180
hard=300
extreme=420
windowOffset = 130 × max(0, highestVisibleArena - 3)
totalPoints = positionBase + windowOffset
```

單次／連續：一完整三連戰＝一輪；三戰內 HP 連續；下一輪滿血；下一輪開始前再扣次數；任一戰失敗該輪結束；手動停止於目前整輪結束後生效；最後統一總結算。

已修重要問題：arena normalize 改為原地 `Object.assign()` 保持物件參照、積分改為 visible window 邏輯、90%→97%、三維收斂至 `dungeonarena.js`、舊三難度玩家 UI 已移除。

---

# 10. 虛空幻境

開放 Lv25。

```text
Base crit = 10
Base dodge = 8
HP multiplier = 2.40
ATK multiplier = 2.15
DEF multiplier = 2.65
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
- 一個 run 開始扣 1 次副本；run 內持續向上
- 每層通關後回滿該 run 鎖定 snapshot 的 HP

GM 支援重置樓層、指定樓層、模擬推進與補首次通關積分；挑戰進行中禁止 GM 樓層管理。

### 最新 UI 狀態

**桌機版虛空戰鬥畫面上下留白問題已由使用者實機確認解決。**

因此舊交接中「虛空桌機 UI 尚未完成／下一步要查高度來源」已失效，不再列為待辦。

手機版虛空先前已確認正常。

---

# 11. GM 系統

GM 從設定頁隱藏入口進入；密碼來源在 `data.js`，不要另建第二份密碼來源。

`gmhub.js` 分「管理」與「測試」，手機有 responsive UI。

正式管理包括：指定等級 1～500、金幣、主線進度、補滿 HP、清空背包、免費刷新商店、重置商店 refresh、依品質／等級／部位產裝、調整副本進度與次數、VIP 積分／重置 VIP、正式 8 專精。

測試功能包括：工作階段限定測試 VIP／專精、主線怪 100 次、特殊怪 100 次、懸賞各 tier 100 次、競技場 100 次完整三連戰與 500 次正式評估、虛空樓層管理／測試。

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
→ selectedMap / HP / shop normalize
→ saveVersion = 10
→ 最後才 save(false)
```

migration 完成前不會先把舊 raw 存檔寫成新版。

診斷：`window.LAST_SAVE_LOAD_REPORT`。

`engine.js` 仍保留 base `load()` fallback，但正式 runtime 以 `savemigration.js` 後載入版本為準。

---

# 13. 背景執行、離線與時間防護

`backgroundprogress.js`：背景補償 credit rate 0.96；單次背景最多計 12 小時；用 visibilitychange / blur / focus / pagehide / pageshow；主線連續、懸賞連續、競技場連續、虛空可用 `backgroundProgressSleep()`。

`offlineprogress.js`：EXP／金幣／裝備 roll／副本進度皆 10%；最短離線 1 分鐘；最長 12 小時。

真實戰鬥速度樣本最多 20 筆；normal gap +140ms、elite +220ms；等級差倍率 0～3×1、4～6×1.3、7～10×1.6、11～15×2、16+ 不採樣。

時間防護使用 `maxObservedWallClock`、`timeLockUntil`，容忍倒退 5 分鐘；`pendingSettlement` 防重入／中斷；大量模擬每 750 次讓出 event loop。

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

有 errors → console error；只有 warnings → console warn。

---

# 15. 視覺重整最新基準

統一風格：**科幻戰略風＋宇宙史詩風**。

主色：深藍、黑、鐵灰、銀灰、科技藍；輔以紫藍、能量紫、青藍、少量金色。

避免過亮、過度霓虹、卡通／兒童感、純寫實軍武、現代都市感、過度雜亂、電影海報感、圖片內大字／Logo。

背景圖預設 16:9、適合 `background-size:cover`、同時考慮桌機與手機直式裁切、中央保留 UI 安全區。

已完成：

1. 首頁背景：`homebackground.css/js` + 4 段 Base64；桌機／手機已實機確認。
2. 主線一般／菁英戰鬥背景：`battlebackground.css/js` + 12 段 Base64；桌機／iPhone 已確認。
3. 冒險地圖整頁背景：`mapbackground.css/js` + 6 段 Base64；固定 viewport 背景，桌機／手機與收合行為已確認。

Base64 圖片標準流程：壓 WebP → 拆成約 7～10KB 小段 → JS join → `new Image()` probe → 成功才設定 CSS variable。不要再使用單一超長 `.b64`。

後續背景圖一定先看實際 renderer / DOM / 高度行為，再決定掛 viewport、頁面或區塊。

---

# 16. 副本桌機 UI 最新狀態

`dungeondesktoppolish.css` 僅在 `@media (min-width:761px)` 生效。

目前已由使用者實機確認：

- 懸賞：桌機多餘紫色大底已移除。
- 競技場：桌機內容寬度已整理。
- 虛空：桌機戰鬥畫面上下留白問題已解決。
- 手機版副本整體維持原本合理版型。

因此**副本桌機 UI 這一批目前視為完成**。

---

# 17. 已知技術債／後續可整理項目

1. `continuousbattle.js` 現只剩主線連續戰鬥結算相容層；未來可在 `settlementui.js` 原生支援後移除。
2. `normal / hard / extreme` 在競技場只代表 internal position template；`arenaplayerflow2.js` 仍是後載入玩家 UI 層，若重構應收斂 renderer，避免再疊第三層 wrapper。
3. `engine.js` base `load()` 是 fallback；正式 load 以 `savemigration.js` 為準。
4. 世界 map index 是永久身分，改順序／插圖必須 schema migration。
5. 第1～3張背景目前仍是 Base64 chunk 技術方案；日後若有可靠二進位寫入方式，可整理成正常 `.webp`，但必須先確認 Pages 路徑與真機 cache。

已移除的舊技術債：

- 「主線仍有 1/5/10/15/20/25 正式 renderer」：已不是目前 main 狀態。
- 「桌機虛空 UI 尚未解」：已由使用者確認解決。

---

# 18. 2026-09-13 靜態 smoke check 狀態

本次重新讀取 `main` 並檢查：

- 完整 `index.html` 載入順序仍完整。
- `ui.js` 正式提供單場／連續主線模式；Boss 限單場。
- `continuousbattle.js` 與 `ui.js` 的最新責任分工一致：前者只剩結算相容。
- 100 張地圖固定 registry 架構仍存在。
- `savemigration.js` schema 10 / pipeline 1 正式 load 邏輯仍存在。
- 競技場 500/485 評估、最近 3 個視窗、Rank 物理倍率核心仍存在。
- `runtimeintegrity.js` 仍在最後階段載入並檢查世界、存檔 schema、必要函式與 arena object reference。
- 首頁／主線戰鬥／冒險地圖背景資產檔與 loader 仍存在於 repo。
- `dungeondesktoppolish.css` 仍在 `index.html` 載入。

**此處是程式碼／檔案層級的靜態 smoke check，不等同瀏覽器 runtime 自動化測試。**

使用者目前已實機確認的 UI／視覺項目：首頁背景、主線戰鬥背景、冒險地圖背景（含桌機／手機與收合）、桌機懸賞、桌機競技場、桌機虛空。

若要做真正完整 runtime smoke test，仍建議在 GitHub Pages + 桌面瀏覽器 + iPhone Safari 快速跑：

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

# 19. 最重要的正式來源對照

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
ui.js
  主線正式單場／連續模式、準備頁、戰鬥頁與主要 UI
battlepipeline.js
  主線正式 battle pipeline
continuousbattle.js
  主線連續戰鬥「結算相容層」；不再是模式 UI 正式來源
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
  虛空玩家 UI / 動態樣式；桌機版型問題已實機確認解決
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
  桌機副本 UI 修飾；懸賞／競技場／虛空目前均已確認
index.html
  最終實際載入順序與 cache-bust
```

---

# 20. 下一個對話如何接手

建議直接使用：

> **讀取 `franksky1207/rpg` 的 `PROJECT_HANDOFF.md`，再重新檢查 `main` 的實際程式碼與完整 `index.html`，完整承接《文明戰線》專案。以 GitHub `main` 為唯一真實來源；若交接檔與實碼衝突，以實碼為準。現在先不要修改。**

若接著要修改，由使用者明確說「做／修改／修正／執行／開始／上傳到遊戲網頁」後再寫入 `main`。
