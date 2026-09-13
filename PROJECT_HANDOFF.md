# 《文明戰線》正式跨對話交接文件

> **最高原則：GitHub `main` 的實際程式碼永遠是唯一真實來源。**
>
> 若本文件、歷史對話、舊截圖、舊規格、舊 commit、先前 ChatGPT 敘述與目前 `main` 衝突，一律重新讀取 `main` 後，以實際程式碼為準。

更新日期：**2026-09-14**

本次重新檢查基準：`main` commit **`a7a49cc995b5c91c1460561616d42b5a3ed97a93`**（背景系統 14 類完成後）。

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

目前正式 CSS 載入順序：

```text
style.css
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

目前 `backgrounds.css` cache-bust：

```text
backgrounds.css?v=20260914-dungeon-void-battle1
```

目前 `dungeondesktoppolish.css` cache-bust：

```text
dungeondesktoppolish.css?v=20260914-dungeon-desktop8
```

正式 JS 載入骨架：

```text
data.js
→ 10 支 worldmaps-*.js
→ worldmapregistrycheck.js
→ worldnamingrules.js
→ engine.js
→ specialization.js
→ combatcore.js
→ dungeonprogress.js
→ savemigration.js
→ dungeoncore.js
→ gameguide.js / gameguidearena5.js
→ ui.js / preparemobilecontrols.js / worldmapui.js / hpflow.js
→ vipui.js / settlementui.js / balance.js
→ traits.js / traitlock.js / traitdrop.js
→ gmtools.js / shopbalance.js / gearupgrade.js / equipmentlock.js
→ specialmonsters.js
→ dungeonbounty.js / dungeonarena.js / arenapositioncore.js / arenawindowcore.js
→ dungeonvoid.js / dungeonvoidui.js
→ levelcap.js / specialcore.js / vipgm.js / specialgmbatch.js
→ dungeongm.js / gmhub.js / arenagm5.js / dungeonvoidgmmanage.js / dungeonvoidgmui.js
→ level100balance.js / specialencounter.js / combatpacing.js
→ battlepipeline.js / continuousbattle.js
→ backgroundprogress.js / offlinefarmtarget.js / offlineprogress.js
→ specialguide.js / levelcapresult.js
→ dungeonui.js / dungeonplayerui.js / arenaplayerflow2.js
→ adventureprogressui.js / combatfx.js / runtimeintegrity.js
```

`backgroundprogress.js` 的「background」是**瀏覽器頁面切到背景／失焦時的戰鬥與補償機制**，不是圖片背景系統，不可誤刪。

`runtimediag.js` 已刪除，不再常駐顯示診斷框。

---

# 2. 修改與檢查規範（下一個 ChatGPT 必須遵守）

## 2.1 修改前

1. **每次修改前先重新讀取 `main` 的相關檔案。**
2. 同時重新讀**完整 `index.html`**，確認 script / CSS 實際載入順序與 cache-bust。
3. 先追查跨檔案引用、state、save migration、normalize、後載入 override / wrapper、render / DOM class，再決定修改位置。
4. 不可只根據本交接檔、聊天記憶、舊 commit 或截圖猜目前程式。
5. 視覺問題尤其要先確認：真正 renderer、DOM class、後載入 CSS、容器 `max-width` / `min-height`、桌機與手機 media query、iPhone Safari 行為。
6. 若是公式／數值問題，先找正式來源函式，不要直接在後載入檔再包第二套公式。

## 2.2 使用者授權語意

- 使用者說「先討論」「先分析」「先不要修改」「先檢查」→ **不可修改 GitHub**。
- 使用者說「做」「修改」「修正」「執行」「開始」「第 X 批」「上傳到遊戲網頁」「直接用」→ **已授權，可直接修改 GitHub `main`**。
- 已明確授權後不要重複要求確認。

## 2.3 修改原則

1. **優先修改正式來源。**
2. 不要額外堆 wrapper、fallback、第二套 renderer、第二套公式。
3. 新制度正式取代舊制度時，優先刪除／收斂舊路徑。
4. 相容 API 可保留，但必須清楚知道它只是相容層。
5. 不為了表面乾淨一次大改無關系統。
6. 遇到 bug 先追完整 override chain，不可連續猜原因、一直叫使用者重整。
7. 對圖片二進位資產不要用不可靠的文字/base64 contents write；目前已驗證可用一次性 GitHub Actions 在 runner 原生產 WebP，成功後刪 workflow。

## 2.4 修改後

1. 修改 JS / CSS 時必須更新 `index.html` 對應 cache-bust。
2. 重新讀所有變更檔案。
3. 再重新讀**完整 `index.html`**。
4. compare 修改前 base commit → 修改後 head，確認只改預期檔案。
5. GitHub 寫入成功 ≠ GitHub Pages / 桌面 / iPhone Safari runtime 已實機驗證；回覆時必須區分。
6. 如果使用一次性 workflow 產圖，必須確認 Actions run `completed/success`、確認輸出檔存在，再刪除 workflow。

---

# 3. 核心成長、戰鬥、經濟公式

正式基礎數值來源：`engine.js`。

## 3.1 玩家基礎能力

```text
BaseHP(L)  = ceil(110 + 12 × (L - 1))
BaseATK(L) = ceil(15 + 2.2 × (L - 1))
BaseDEF(L) = ceil(7 + 1.2 × (L - 1))
```

怪物／戰鬥上限：

```text
MONSTER_MAX_CRIT_RATE  = 30
MONSTER_MAX_DODGE_RATE = 30
CRIT_DAMAGE_MULTIPLIER = 1.5
```

## 3.2 EXP

```text
sameExp(L) = ceil(25 + 4L)
expProgressionFactor(L) = 5 + 495 × (1 - exp(-(L-1)/142))
expNeed(L) = ceil(sameExp(L) × expProgressionFactor(L))
```

正式常數：

```text
EXP_CURVE = { killMin:5, killRange:495, scale:142 }
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

Lv500 後 EXP 不再累積；正式特殊 payout 可把 EXP 1:1 轉為金幣。

`level100balance.js` 已不再擁有第二套 EXP 公式，只保留：

```text
levelExpFactor = expProgressionFactor
sameLevelNormalKillsToLevel(level)
levelProgressionAudit(level)
```

因此 EXP 公式只以 `engine.js` 為準。

## 3.3 金幣／裝備基礎

```text
goldBase(L) = ceil(6 + 4L)
sellBase(L) = ceil(12 + 8L)
買價 = ceil(售價 × 3.5)
```

品質倍率／售價倍率：

```text
普通   m=1.00  sm=1.0
優良   m=1.15  sm=1.4
稀有   m=1.35  sm=2.0
史詩   m=1.60  sm=3.2
傳說   m=1.95  sm=5.0
神話   m=2.40  sm=8.0
```

主線掉落品質權重仍由 `qualityRoll(kind)`：

```text
普通怪：50 / 30 / 15 / 4 / 0.9 / 0.1
菁英怪：35 / 35 / 20 / 8 / 1.8 / 0.2
Boss：  0 / 45 / 35 / 15 / 4.5 / 0.5
```

掉裝率：

```text
普通 25%
菁英 60%
Boss 100%
```

裝備等級 offset：

```text
普通：[-2,-1,0,0,+1]
菁英：[-1,0,0,+1]
Boss：[-1,0,0,+1,+2]
```

主要部位主屬性：

```text
武器 atk
頭盔 hp
鎧甲 def
鞋子 hp
飾品 crit
```

`equipmentScore()` 現行評分：

```text
atk×5 + def×5 + hp + crit×(20+0.5L) + dodge×(20+0.5L)
```

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

正式地圖由 `data.js`：

```text
registerRegionMaps(regionId, regionMaps)
```

固定寫入 `WORLD_REGIONS` 指定 slot，不靠 `push/splice` 或 script 順序決定 index。

`validateWorldMapRegistration()`、`worldmapregistrycheck.js`、`worldnamingrules.js` 檢查：

- 100 張 slot 完整
- 每區 10 張
- 每張 5 級
- 每張 5 件裝備／5 隻怪
- 怪物順序
- chapter
- 重名與近似命名

世界永久進度仍以 map index 為身分：

```text
unlockedMap
mapProgress
bossProgress
bossLocked
bossKilled
```

若未來改既有 map index、插入地圖或重新排序，必須做正式 schema migration。

## 4.1 主線正式模式

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

`ui.js` 正式模式 API：

```text
CONTINUOUS_BATTLE_COUNT = "continuous"
battleModesForEnemy(enemy)
battleModeLabel(mode)
setBattleMode(mode)
```

`continuousbattle.js` 不再是主線模式 UI 正式來源，目前主要是連續戰鬥結算相容層。

---

# 5. VIP 系統

正式來源：`engine.js` + VIP UI / GM。

```text
VIP threshold(level) = 1000 × level²
VIP level = floor(sqrt(points / 1000))，最高 20
```

每級：

```text
HP  +0.5%
ATK +0.5%
DEF +0.25%
暴擊 +0.25%
閃避 +0.25%
```

`normalizeVipState()` 保留歷史最高 VIP 等級：單純降低積分不會降級；要回 VIP0 必須用正式 GM「重置 VIP」。

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

VIP 升級導致 max HP 改變時，`addVipPoints()` 會維持原 HP 比例；原本滿血則保持滿血。

---

# 6. 專精系統

正式來源：`specialization.js`。

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

正式 UI：角色主頁的「專精」功能頁。

GM 有兩套明確用途：

- **正式專精管理**：會寫入存檔。
- **測試專精**：只在目前工作階段存在，重新整理後回 Lv0，不修改正式角色。

---

# 7. 副本共通

正式開放：

- Lv5：懸賞戰
- Lv15：競技場
- Lv25：虛空幻境

副本進度只由主線勝利結算：

```text
damageRate = (startHp - endHp) / playerMaxHp
baseProgress = (enemyMaxHp / BaseHP(playerLevel)) × 1.5 + damageRate × 4
實際進度 = baseProgress × VIP副本進度倍率
```

VIP 副本進度倍率：

```text
VIP0～3   ×1.00
VIP4～11  ×1.10
VIP12～20 ×1.20
```

每累積 100 副本進度，自動轉成 1 次可挑戰次數。

正式 run marker：

```text
state.dungeon.activeRun
```

規則：

- 真正開始正式 dungeon round 時才 `beginDungeonRun()`。
- `beginDungeonRun()` 扣次數並同步寫 `state.dungeon.activeRun`。
- `finishDungeonRun()` 清 marker，預設回滿 HP。
- 若正式副本 run 中斷／重新整理，下次 load 由 `finalizeDungeonLoadedState()` 回滿 HP 並清 marker。

---

# 8. 懸賞戰

正式來源：`dungeonbounty.js`。

玩家只公開：「高 EXP・高金幣・多裝備」。

玩家介面**不公開**：

- tier 精確機率
- 品質精確機率
- 戰前精確 EXP
- 戰前精確金幣
- 戰前精確件數

內部 tier：

```text
普通 45%：EXP×5、金幣×5、2件、HP×1.00、Damage×1.00、DEF×0.88
高級 35%：EXP×8、金幣×8、3件、HP×1.03、Damage×1.03、DEF×0.90
危險 20%：EXP×12、金幣×12、5件、HP×1.08、Damage×1.06、DEF×0.92
```

另外 crit / dodge scale/cap 依 tier 上升；正式上限仍受怪物 30% cap。

品質基礎權重：

```text
稀有 60%
史詩 35%
傳說 4.5%
神話 0.5%
```

特性影響懸賞品質：

```text
1 特性：15% 品質 +1
2 特性：30% 品質 +1
```

再疊 VIP14 的 5% 品質 +1；VIP8 可 15% 優先目前最弱部位。

敵人由**不含 VIP**的目前裝備基礎能力生成；玩家正式戰鬥再套 VIP／戰鬥專精。

單次／連續：

- 一場懸賞＝一個正式 dungeon round
- 下一場真正開始前才再扣 1 次
- 每場結束回滿 HP
- 死亡／次數不足停止
- 手動停止於目前一場結束後生效
- 連續中間場不顯示選擇頁與單場結算
- 最後統一總結算

`prepareNextBounty()` 使用 transition；`bountycontinuousui.js` 已刪除；舊戰前精確獎勵 preview 已移除。

目前「停止連續挑戰」在桌機與手機都由：

```css
#main .dungeon-bounty-combat>.controls{justify-content:center}
```

正式置中。

---

# 9. 競技場

正式來源：`dungeonarena.js` + `arenapositioncore.js` + `arenawindowcore.js` + `arenaplayerflow2.js`。

正式玩家名稱為 10 個世界區域競技場；玩家介面不得把正式競技場稱為「普通／困難／極限」。

`normal / hard / extreme` 只保留為 internal position template id；玩家定位標示為「低／中／高」。

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

## 9.1 戰力評估

```text
ASSESS_RUNS = 500
ASSESS_CLEAR_TARGET = 485
ASSESS_BATCH_SIZE = 10
```

即 97%；非同步版每批 10 次後 `setTimeout(step,0)`，避免 Safari 長時間堵塞 event loop。

assessment signature 包含：

- rank
- position template id
- 玩家等級
- 不含 VIP 的基礎 HP / ATK / DEF / crit / dodge
- VIP level
- 五項戰鬥專精：initiative / combo / penetration / counter / drain

版本：

```text
positionModelVersion = 1
assessmentRuleVersion = 2
```

## 9.2 三維與積分

Rank multiplier：

```text
RankHp     = 1 + 0.05  × (R - 1)
RankDamage = 1 + 0.015 × (R - 1)
RankDef    = 1 + 0.03  × (R - 1)
```

三戰共通 physical profile：

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

`P` 為不含 VIP 的玩家基礎 snapshot；position 只影響 crit / dodge / trait，不影響同 Rank 三維。

位置最高約：

```text
低：crit 9 / dodge 8
中：crit 16 / dodge 14
高：crit 23 / dodge 20
```

積分：

```text
低 position base = 180
中 position base = 300
高 position base = 420
windowOffset = 130 × max(0, highestVisibleArena - 3)
totalPoints = positionBase + windowOffset
```

單次／連續：

- 一完整三連戰＝一輪
- 三戰內 HP 連續
- 下一輪開始滿血
- 下一輪開始前再扣副本次數
- 任一戰失敗該輪結束
- 手動停止於目前整輪結束後生效
- 最後統一總結算

---

# 10. 虛空幻境

正式來源：`dungeonvoid.js` + `dungeonvoidui.js`。

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

規則：

- 每 10 層 Boss
- 普通樓 1 特性
- Boss 2 特性
- 普通怪名避免連續重複
- 首次通關積分：`round(15 + 1.75 × sqrt(F - 1))`
- Boss 樓積分再 ×2
- 永久進度：`state.dungeon.voidMirage.highestCleared`
- 只有剛好挑戰 `highestCleared + 1` 並首次通關時才推進與發積分
- 一個 run 只在第一層真正開始戰鬥時扣 1 次副本次數
- run 內持續向上挑戰，不逐層重扣
- 每層通關後回滿該 run 鎖定玩家 snapshot 的 HP
- 可要求強制退出；正在戰鬥時會等本層結束

**UI 特別規則：虛空沒有真正需要背景圖的「主頁」流程；玩家進入後就是自動逐層挑戰。**

因此目前圖片背景分成：

- `dungeon-void` → **只套虛空結算頁**
- `dungeon-void-battle` → **只套虛空戰鬥頁**

---

# 11. 正式存檔／載入 pipeline

正式來源：`savemigration.js`。

```text
SAVE_SCHEMA_VERSION = 10
SAVE_LOAD_PIPELINE_VERSION = 1
```

`data.js SAVE_VERSION = 9` 只保留 legacy／fallback。

正式 `window.load`：

```text
讀 localStorage raw
→ 保留 rawSnapshot / sourceVersion
→ clone working state
→ migrateSave()
→ gear normalize
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

重要：migration 完成前不會先把舊 raw 存檔寫成新版。

診斷：

```text
window.LAST_SAVE_LOAD_REPORT
```

v9 → v10 EXP migration 會保留原等級內 EXP 進度比例，而不是直接把舊數字當成新公式 EXP。

`engine.js` 仍保留 base `load()` fallback，但正式 runtime 以後載入的 `savemigration.js` `window.load` 為準。

---

# 12. 瀏覽器背景執行、離線與時間防護

此章的「背景」指瀏覽器 background execution，不是圖片背景。

`backgroundprogress.js`：

```text
BACKGROUND_CREDIT_RATE = 0.96
CONTINUOUS_BACKGROUND_MAX_MS = 12 小時
```

監聽：

```text
visibilitychange
blur
focus
pagehide
pageshow
```

主線連續、懸賞連續、競技場連續、虛空都能使用 `backgroundProgressSleep()` 做 foreground / background 時間補償。

離線系統正式規則維持：

- EXP／金幣／裝備 roll／副本進度：10%
- 最短離線 1 分鐘
- 最長離線 12 小時
- 真實戰鬥速度樣本最多 20 筆
- normal gap +140ms
- elite gap +220ms

真實樣本等級差倍率：

```text
0～3  ×1
4～6  ×1.3
7～10 ×1.6
11～15 ×2
16+ 不採樣
```

時間防護：

```text
maxObservedWallClock
timeLockUntil
```

並有時鐘倒退防護、`pendingSettlement` 防重入／中斷；大型模擬會定期讓出 event loop。

---

# 13. Runtime 自我檢查

`runtimeintegrity.js` 最後階段載入，不顯示玩家 UI，建立：

```text
window.PROJECT_RUNTIME_REPORT
```

檢查重點：

- `MAPS.length` 與 WORLD_REGIONS
- `WORLD_MAP_REGISTRATION_REPORT`
- `WORLD_NAMING_REPORT`
- 必要函式是否存在
- `SAVE_SCHEMA_VERSION === 10`
- `SAVE_LOAD_PIPELINE_VERSION === 1`
- `state.saveVersion`
- dungeon arena normalize 物件狀態

errors → console error；只有 warnings → console warn。

---

# 14. GM 系統最新狀態

GM 密碼正式來源只在 `data.js` 的 `GM_PASSWORD`；不要建立第二份密碼來源。

GM 由設定頁的隱藏入口進入。

`gmhub.js` 分成：

```text
管理
測試
```

手機版有 responsive / sticky tab UI。

## 14.1 管理功能

目前正式管理包含：

- 指定角色等級 1～500
- 指定金幣
- 指定主線世界解鎖進度
- 補滿 HP
- 清空背包
- 刷新商店
- 重置商店 refresh / 回到基礎刷新狀態
- 依品質、等級、部位產生裝備
- 修改副本進度
- 修改副本可挑戰次數
- 修改 VIP 積分
- 重置 VIP（等級＋積分）
- 正式 8 項專精等級管理
- 虛空永久樓層／相關 GM 管理
- 競技場相關正式進度／測試支援

VIP 管理要注意：單純調低 VIP 積分不會降低已解鎖 VIP 等級；如需 VIP0，要使用正式重置。

## 14.2 測試功能

測試功能為沙盒，不應修改正式角色資料：

- 工作階段限定測試 VIP
- 工作階段限定測試專精
- 指定主線怪批次 100 次
- 指定特殊怪批次 100 次
- 懸賞普通／高級／危險各 100 次
- 競技場 100 次完整三連戰測試
- 競技場 500 次正式 promotion assessment
- 虛空樓層／敵人／戰鬥測試

競技場、懸賞等 GM 測試的敵人生成與玩家套用邏輯要沿用正式來源，不可另建第二套公式。

## 14.3 GM 按鈕視覺規範

正式規範在 `GM_UI_GUIDE.md`：

```text
深色 = 一般管理
藍色 = 執行／刷新／測試
金橘 = 產生／新增
紅色 = 危險／刪除／清空
```

例如：

- 指定等級／金幣／補血／重置商店 → 深色
- 刷新／套用／Debug／批次測試 → 藍色
- 產生裝備 → 金橘色
- 清空背包／破壞性清除 → 紅色

未來新增 GM 按鈕應先按「功能語意」分類，不要任意新增配色系統。

---

# 15. 圖片背景系統：目前已全部完成

這一輪背景系統已從舊 Base64 chunk 架構完全重做，**14 類背景、桌機版與手機版目前全部完成並接入 runtime**。

統一美術方向：**科幻戰略風＋宇宙史詩風**。

主色：深藍、黑、鐵灰、銀灰、科技藍；輔以紫藍、能量紫、青藍、少量金色。

避免：過亮、過度霓虹、卡通兒童感、純寫實軍武、現代都市、過度雜亂、電影海報感、圖片內大字／Logo。

## 15.1 正式資料夾

原始素材：

```text
assets/backgrounds-source/<category>/desktop.png|jpg
assets/backgrounds-source/<category>/mobile.png|jpg
```

runtime：

```text
assets/backgrounds/<category>/desktop.webp
assets/backgrounds/<category>/mobile.webp
```

目前 14 類：

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

## 15.2 正式頁面對應

```text
home
  主畫面

adventure-map
  冒險地圖

prepare
  一般主線戰前準備

battle-main
  一般主線戰鬥

character
  角色頁 + 專精頁共用

inventory-shop
  背包 + 商店共用

guide-settings
  遊戲說明 + 設定共用

dungeon-home
  副本首頁

dungeon-bounty
  懸賞準備 / transition / 單次結算 / 連續總結算

dungeon-bounty-battle
  懸賞戰鬥

dungeon-arena
  競技場非戰鬥頁（選擇 / 準備 / 結算等 arena-shell）

dungeon-arena-battle
  競技場戰鬥

dungeon-void
  虛空結算頁 בלבד；沒有另外做虛空主頁背景

dungeon-void-battle
  虛空戰鬥
```

## 15.3 統一全視窗規則

背景預設：

- 圖片層填滿整個 viewport，不被 `.app max-width:1200px` 限制。
- 內容卡片仍維持原本適合閱讀的中央寬度。
- 桌機通常 `100vw` + `calc(100vh - 57px)` / `100dvh`。
- 手機通常 `100vw` + `calc(100vh - 52px)` / `100dvh`。
- 使用 `background-size: cover`。
- iPhone Safari 要保留 `vh` + `dvh` 雙寫法。
- 主要卡片使用半透明＋少量 blur，以兼顧背景與文字可讀性。

正式統一背景檔：

```text
backgrounds.css
```

不要重新拆回每頁一個背景 loader JS/CSS。

## 15.4 圖片最佳化標準

本輪已驗證的正式做法：使用一次性 GitHub Actions + Python Pillow 直接在 runner 產二進位 WebP。

```text
Desktop：max width 1536
Mobile：max width 1080
不放大原圖
保留比例
WebP quality = 72
method = 6
```

流程：

```text
使用者上傳 source PNG/JPG
→ 建立一次性 workflow
→ Actions runner 轉 WebP
→ git add -f runtime WebP
→ commit / push
→ 確認 run success + runtime 檔存在
→ 更新 backgrounds.css / index cache
→ 刪除一次性 workflow
```

目前最後一個一次性背景 workflow 已刪除；repo 不應常駐任何這批 build-background workflow。

## 15.5 已永久淘汰，不得重新使用

```text
assets/bg-*.b64
Base64 chunk 拆段
JS fetch 多段文字後 join
new Image() probe 後塞 CSS variable
--home-bg-image
--home-mobile-bg-image
--battle-bg-image
--battle-mobile-bg-image
--map-bg-image
--map-mobile-bg-image
--prepare-bg-image
body.map-background-active
舊背景專用 MutationObserver
```

已刪除舊模組：

```text
homebackground.js / homebackground.css
battlebackground.js / battlebackground.css
mapbackground.js / mapbackground.css
preparebackground.js / preparebackground.css
```

`backgroundprogress.js` 必須保留，它與圖片背景無關。

---

# 16. 本輪背景與 UI 重要 bug 修正

以下都是已經發生過、且容易被未來修改重新引入的問題。

## 16.1 桌機背包沒有背景

原先 selector 綁「背包裡一定有 table」，空背包／某些狀態可能匹配不到。

已改為較穩定的直接 `.grid` 判斷：

```css
#main>.function-page:has(>.grid)
```

商店仍由 `.shop-table-wrap` 判斷。

**未來不要再把背包背景綁死在 table 存不存在。**

## 16.2 遊戲說明桌機背景只在左側，右邊黑

原因：`guide.css` 的 `.guide-page` 曾被 `max-width:1120px` 限制，導致背景容器也只 1120px。

目前正式做法：

```css
.guide-page{max-width:none}
.guide-page>.back-home,
.guide-page>.guide-header,
.guide-page>.guide-layout{max-width:1120px;margin-left:auto;margin-right:auto}
```

也就是：**背景全寬，內容 1120px 置中。**

## 16.3 懸賞桌機背景被後載入 CSS 覆蓋

原因：`dungeondesktoppolish.css` 曾對 bounty shell 再套 `max-width` / transparent / padding，因它後載入而把 `backgrounds.css` 的全視窗布局破壞。

目前 bounty 背景／layout 由 `backgrounds.css` 擁有；desktop polish 只保留必要 card sizing。

## 16.4 懸賞「停止連續挑戰」偏左

目前桌機＋手機共用：

```css
#main .dungeon-bounty-combat>.controls{justify-content:center}
```

正式規則在 `dungeonuipolish.css`，不要只放桌機 media query。

## 16.5 競技場桌機背景寬度衝突

原先 `dungeondesktoppolish.css` 對 `.arena-shell` 有 desktop max-width；已移除 shell 限制。

現在：

- 背景 shell 由 `backgrounds.css` 全視窗。
- `.arena-panel` 仍在 desktop polish 保持 `max-width:1020px` 置中。

## 16.6 虛空結算頁下半部變黑

原因：desktop polish 曾對所有 `.void-shell` 強制 `min-height:0!important`，把 `backgrounds.css` 結算頁的 viewport min-height 壓掉。

已修正為不限制 result shell。

## 16.7 虛空戰鬥加入背景後的 desktop selector

目前 desktop polish 的 shell compact 限制只留給「不是 result、也不是 combat」的其他 void shell：

```css
html body #main .void-shell:not(:has(.void-result-grid)):not(:has(.void-combat))
```

而正式虛空戰鬥背景由：

```css
#main>.void-shell:has(.void-combat)
```

直接全視窗。

## 16.8 副本非戰鬥 UI 透明層次

`dungeonuipolish.css` 已建立：

- 副本首頁卡片
- 懸賞紫系
- 競技場金棕系
- 虛空青藍系
- 桌機較透明、手機稍提高不透明度

不要任意把所有副本卡片恢復成完全不透明純色。

---

# 17. UI / Responsive 最新行為

## 17.1 全域背景 + 內容寬度分離

目前重要原則：

```text
背景 = viewport 寬
內容 = 原功能頁自己的閱讀寬度
```

因此碰到 `max-width` bug 時，不要簡單把整頁內容也撐到 100vw；應把外層背景 shell 與內層內容寬度拆開。

## 17.2 手機版

- `max-width:760px` 為主要 mobile breakpoint。
- iPhone Safari 必須實測。
- Guide 類別列手機為橫向可滑 tab。
- GM tabs 手機 sticky。
- 副本卡片在手機提高不透明度以維持可讀性。
- 虛空戰鬥的 compact layout 由 `dungeonvoidui.js` 動態注入樣式，再加上外部 polish；改動前要一起看兩邊。

## 17.3 prepare 手機控制

`preparemobilecontrols.js` 是戰前準備頁手機控制／定位邏輯，**不是圖片背景 loader**，不可因名稱含 prepare 而誤刪。

---

# 18. GM / 遊戲 UI 正式來源對照

```text
data.js
  世界 region / QUALITY / 固定 map registry / legacy save version / GM_PASSWORD

worldmaps-*.js
  100 張正式主線資料

worldnamingrules.js
  世界資料與命名檢查

engine.js
  基礎能力、EXP、裝備、VIP基礎、newState、fallback load

specialization.js
  8 專精正式資料 + 玩家專精 UI + GM 正式/測試專精

combatcore.js
  正式戰鬥核心

ui.js
  主線正式單場／連續模式、prepare、戰鬥、主要 function pages

battlepipeline.js
  主線正式 battle pipeline

continuousbattle.js
  主線連續戰鬥結算相容層；不是模式 UI 正式來源

dungeonprogress.js
  副本進度、attempt、arena save normalize、load 後副本 finalizer

dungeoncore.js
  正式 dungeon run marker / begin / finish

dungeonbounty.js
  懸賞正式核心 + 準備 / 戰鬥 / 結算 renderer

dungeonarena.js
  競技場正式戰鬥／三維／position config／積分／單次連續

arenapositioncore.js
  position 判定＋97%戰力評估

arenawindowcore.js
  競技場最近 3 個視窗／主線解鎖

arenaplayerflow2.js
  競技場正式玩家 UI

arenagm5.js
  競技場 GM 測試

dungeonvoid.js
  虛空幻境正式核心

dungeonvoidui.js
  虛空玩家 UI / 動態樣式

savemigration.js
  正式唯一 runtime save migration / load pipeline

backgroundprogress.js
  瀏覽器背景執行 continuous credit / visibility flow；不是圖片背景

offlinefarmtarget.js
  真實主線樣本與 offline farm target

offlineprogress.js
  離線結算／時鐘防護／reward UI

gmhub.js
  GM 管理 / 測試總介面

GM_UI_GUIDE.md
  GM 按鈕語意與配色規範

backgrounds.css
  目前所有圖片背景正式統一來源

guide.css
  遊戲說明 desktop / mobile 內容布局

dungeondesktoppolish.css
  桌機副本 layout polish；不可搶背景 shell 所有權

dungeonuipolish.css
  副本各模式透明層次與跨裝置細節

assets/backgrounds-source/
  原始 PNG/JPG 素材

assets/backgrounds/
  runtime WebP

runtimeintegrity.js
  runtime integrity report

index.html
  最終實際載入順序與 cache-bust
```

---

# 19. 已知技術債／尚未完成項目

目前**沒有尚未接入的 14 類背景項目**；這一輪背景系統已完成。

仍存在的技術債／未來可整理：

1. `continuousbattle.js` 現主要是主線連續戰鬥結算相容層；未來若 `settlementui.js` 原生完整承接，可再移除。
2. 競技場仍由多檔協作：`dungeonarena.js` + `arenapositioncore.js` + `arenawindowcore.js` + `arenaplayerflow2.js`；若重構應收斂 renderer，不要再堆第三層 wrapper。
3. `engine.js` base `load()` 是 fallback；正式 load 以 `savemigration.js` 為準。未來若整理載入系統，要避免產生兩套正式 load。
4. 世界 map index 是永久身分；任何插入／重排都需要 schema migration。
5. `dungeonvoidui.js` 仍使用動態 style injection；外部 `backgrounds.css` / `dungeonuipolish.css` / `dungeondesktoppolish.css` 也會影響虛空。未來若整理 CSS，必須先做完整 override audit。
6. 背景 selector 多處使用 `:has()`（例如背包、設定、虛空 result/combat）。目前目標現代瀏覽器可用；若未來要支援更舊瀏覽器，再評估是否增加語意 class，但**現在不要為相容性再建第二套背景 loader**。
7. GitHub Pages / Safari 的視覺驗證仍以使用者實機為準；目前本輪重要 desktop/mobile 問題已由使用者逐頁檢查並修正，但沒有建立全自動瀏覽器視覺 regression suite。

已完成且不再是待辦：

- 14 類桌機／手機背景全部接入。
- 舊 Base64 chunk 圖片背景完整淘汰。
- 遊戲說明桌機背景 full viewport 修正。
- 桌機背包背景 selector 修正。
- 懸賞 desktop shell 背景覆蓋衝突修正。
- 懸賞停止連續挑戰按鈕跨裝置置中。
- 競技場 desktop shell max-width 衝突修正。
- 虛空結算 desktop 下半部黑底問題修正。
- 虛空戰鬥桌機全視窗背景完成。

---

# 20. 本次重新檢查的 main 重點

本交接更新前已重新讀取目前 `main` 的實際程式，包括至少：

```text
index.html
PROJECT_HANDOFF.md
data.js
engine.js
level100balance.js
specialization.js
dungeonprogress.js
dungeoncore.js
dungeonbounty.js
dungeonarena.js
arenapositioncore.js
dungeonvoid.js
dungeonvoidui.js
savemigration.js
backgroundprogress.js
gmhub.js
GM_UI_GUIDE.md
backgrounds.css
guide.css
dungeondesktoppolish.css
dungeonuipolish.css
assets/backgrounds/ tree
assets/backgrounds-source/ tree
```

重新確認的核心事實：

- `main` 在更新交接前為 `a7a49cc995b5c91c1460561616d42b5a3ed97a93`。
- `MAX_LEVEL = 500`。
- 正式 save schema = 10、load pipeline = 1。
- EXP 正式公式仍只在 `engine.js`。
- 專精 8 項、最高 Lv30、成本 `1000×N²`。
- 副本 run marker、懸賞、競技場、虛空正式邏輯與本文件一致。
- 14 類 runtime 背景目錄已存在並已由 `backgrounds.css` 正式引用。
- `backgrounds.css` 已是統一圖片背景層。
- 舊 Base64 背景系統沒有恢復。
- 最後一批 void battle 一次性 workflow 已刪除。

---

# 21. 下一個對話如何接手

標準接手指令：

> **讀取 `franksky1207/rpg` 的 `PROJECT_HANDOFF.md`，再重新檢查 `main` 的實際程式碼與完整 `index.html`，完整承接《文明戰線》專案。以 GitHub `main` 為唯一真實來源；若交接檔、歷史對話或舊規格與實碼衝突，以實碼為準。修改前先讀相關正式來源與 override chain；修改 JS/CSS 後更新 `index.html` cache-bust，重新讀變更檔與完整 `index.html`，再做 base→head compare。使用者若說「先討論／先分析／先不要修改」就不可寫入；使用者若說「做／修改／修正／執行／開始／直接用」即代表已授權直接修改 GitHub `main`。優先修改正式來源，不要額外建立 wrapper、fallback、第二套公式或第二套 renderer。現在先不要修改。**
