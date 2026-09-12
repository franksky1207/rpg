# 《文明戰線》正式跨對話交接文件

> **最高原則：GitHub `main` 實際程式碼永遠是唯一真實來源。**
>
> 若本文、歷史對話、舊截圖、舊規格或先前 ChatGPT 的敘述與目前 `main` 衝突，一律重新讀取 `main` 後，以實際程式碼為準。

更新日期：**2026-09-13**

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
- 桌面版與手機版都必須支援；**iPhone Safari 是重要真機環境**

目前 `index.html` 正式載入順序的重要骨架為：

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
→ battlepipeline.js / continuousbattle.js / offline
→ dungeonplayerui.js / arenaplayerflow2.js
→ runtimeintegrity.js（最後）
```

`runtimediag.js` 已刪除，不再常駐顯示診斷框。

---

# 2. 給下一個 ChatGPT 的操作規範

## 2.1 修改前

1. **每次修改前先重新讀取 `main` 的相關檔案。**
2. **同時重新讀完整 `index.html`**，確認實際 script / CSS 載入順序與 cache-bust。
3. 先搜尋跨檔案引用、state 欄位、save migration、normalize、後載入 override / wrapper、render / DOM 綁定，再決定真正修改位置。
4. 不可只根據本交接檔、聊天記憶或過去 commit 猜目前程式。

## 2.2 使用者授權語意

- 使用者說：**「先討論」「先分析」「先不要修改」「先檢查」** → **不能改 GitHub**，只能檢查、分析、提出方案。
- 使用者說：**「做」「修改」「修正」「執行」「開始」「第 X 批」** → 視為已授權，可直接修改 GitHub `main`。
- 不要在使用者已明確授權後重複要求確認。

## 2.3 修改原則

1. **優先修改正式來源，不要再額外做 wrapper、fallback、第二套公式或 UI 遮罩。**
2. 若新制度已正式取代舊制度，優先刪除／收斂舊路徑，而不是永遠靠後載入覆蓋。
3. 只為真正需要的相容性保留舊 API 名稱；必須在交接檔標清楚它只是相容層，不是正式制度。
4. 不要為了「看起來乾淨」而一次大改無關系統；先確認完整程式鏈，再修根因。

## 2.4 修改後

1. 修改 JS / CSS 時，**必須更新 `index.html` 對應 cache-bust**。
2. 修改後重新讀取所有變更檔案。
3. 再重新讀完整 `index.html`。
4. compare 修改前 base commit → 修改後 head，確認只有預期檔案。
5. GitHub 寫入成功 ≠ GitHub Pages / 桌面瀏覽器 / iPhone Safari runtime 已驗證；回覆時必須區分。

## 2.5 異常處理最高原則

**未來只要發生功能異常，不得先猜原因、不得先疊局部補丁。**

必須先自我檢查該問題涉及的完整程式鏈，包括：

- 核心函式與實際執行版本
- 所有呼叫來源
- state 狀態流
- 物件參照是否被替換
- 存檔 normalize / migration
- `index.html` 載入順序
- 後載入 override / wrapper
- render / DOM 事件鏈
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

怪物暴擊／閃避正式上限常數：

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

Lv500 後 EXP 不再累積；可轉換的 EXP 由正式特殊 payout 流程 1:1 轉為金幣。

---

# 4. 世界、100 張地圖與主線

## 4.1 十大區域

`WORLD_REGIONS` 正式固定：

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

## 4.2 第四批已完成：固定地圖註冊

`data.js` 現在唯一正式入口：

```text
registerRegionMaps(regionId, regionMaps)
```

十支 `worldmaps-*.js` 全部使用固定 region id 註冊，不再直接 `MAPS.push()` / `MAPS.splice()`。

正式規則：

- 每區只能寫到 `WORLD_REGIONS` 指定的 `mapStart～mapEnd`
- 每區必須剛好 10 張
- 註冊當下檢查 chapter
- 註冊當下檢查每張地圖必須剛好 5 級
- 同區重複載入只覆寫自己的固定 10 格
- 不同區若搶同一 map index 會直接報錯

`validateWorldMapRegistration()` 檢查固定註冊完整性；`worldmapregistrycheck.js` 在十區載完後產生：

```text
window.WORLD_MAP_REGISTRATION_REPORT
```

`worldnamingrules.js` 再做第二層資料完整性／命名檢查，包括：

- 100 張地圖連續
- 每張 5 級
- 每區 10 張
- 每張 5 件裝備
- 每張 5 隻怪
- 怪物 normal / elite / boss 順序
- chapter 對應
- 重名、近似名、詞彙密度

## 4.3 舊存檔與 map index

本次地圖擴充／註冊整理**沒有改既有 map index**，仍為 0～99，因此舊：

```text
unlockedMap
mapProgress
bossProgress
bossLocked
bossKilled
```

可直接由 `normalizeWorldSaveState()` 延長／修正，不需要另外搬移索引。

**重要限制：目前世界進度仍以 map index 當永久身分。**

未來若要：

- 重新排序既有地圖
- 在中間插入新地圖
- 改變某區原有 map index

必須做正式 schema migration，不能只改地圖檔。

## 4.4 主線 UI / 戰鬥模式

正式玩家主線模式只有：

- 單場戰鬥
- 連續戰鬥

Boss 永遠只跑單場。

`continuousbattle.js` 會把舊 `BATTLE_COUNT_UNLOCKS` runtime 改成：

```text
Lv1：單場
Lv1：連續戰鬥
```

連續主線：

- 一場一場持續戰鬥
- 每場結束後回滿 HP
- 玩家可按「停止連續戰鬥」
- 停止要求在目前這一場結束後生效
- 死亡時結束
- 已取得獎勵與副本進度保留
- 最後顯示連續戰鬥總結算

### 主線尚存技術債

`ui.js` 實體原始碼仍保留舊的：

```text
1 / 5 / 10 / 15 / 20 / 25 場
```

battle-count base renderer；正式玩家 runtime 由 `continuousbattle.js` 後載入覆蓋成「單場／連續」。

這不是目前功能 bug，但屬明確歷史技術債。若未來要清理，必須先完整檢查 `ui.js → battlepipeline.js → continuousbattle.js → specialencounter.js`，不要直接刪常數。

---

# 5. VIP 系統

## 5.1 VIP 等級與能力

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

已解鎖 VIP 等級不會因 VIP 積分降低而下降；`normalizeVipState()` 會保留歷史最高等級。

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

懸賞戰的特殊規則：VIP8、VIP14 可作用；VIP18 不套用懸賞品質。

---

# 6. 專精系統

每項最高 Lv30；升到目標等級 `N` 的價格：

```text
1000 × N² 金幣
```

8 項正式專精：

- 實戰訓練：每級 EXP +5%
- 搜刮技巧：每級怪物金幣 +5%
- 鑑價技巧：每級裝備售價 +5%
- 先制技巧：每級第一擊傷害 +2%
- 連擊技巧：每級連擊率 +1%；追加攻擊傷害 50%，且追加攻擊可再次連擊
- 穿透技巧：每級穿透率 +1%；觸發時忽略 25% 防禦
- 反擊技巧：每級反擊率 +1%；反擊傷害 40%
- 汲取技巧：每級汲取率 +1%；觸發時回復本次實際傷害 10%

GM 有正式專精管理與「測試專精」兩套；測試值只存在目前網頁工作階段，重新整理回 Lv0，不寫正式角色。

---

# 7. 副本共通

正式開放：

- Lv5：懸賞戰
- Lv15：競技場
- Lv25：虛空幻境

副本次數由主線勝利累積副本進度取得。

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

正式副本 round 真正開始時才由 `beginDungeonRun()` 扣次數並寫 marker；`finishDungeonRun()` 清 marker並依規則回血。

若網頁在正式副本 run 中斷，下一次 load 會由 `finalizeDungeonLoadedState()` 偵測 activeRun，回滿 HP 並清除 marker，避免卡死。

---

# 8. 懸賞戰：最新正式制度

## 8.1 定位

玩家只看到：

> **高 EXP・高金幣・多裝備**

玩家 UI 不公開：

- 三種懸賞抽選權重
- 裝備品質精確機率
- 戰前精確 EXP
- 戰前精確金幣
- 戰前精確裝備件數

## 8.2 內部 tier

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

懸賞敵人由不含 VIP 的裝備基礎能力生成；玩家正式戰鬥能力再套 VIP／戰鬥專精。

## 8.3 單次／連續

支援：

- 單次挑戰
- 連續挑戰

一場懸賞＝一個正式 dungeon round。

連續正式流程：

```text
combat
→ finishDungeonRun
→ transition
→ 下一場真正開始前 beginDungeonRun
→ combat
```

規則：

- 下一場真正開始時才消耗下一次副本次數
- 每場結束後回滿 HP
- 死亡停止
- 次數不足停止
- 手動停止在目前這一場結束後生效
- 中間場次不顯示單場／連續選擇頁
- 中間場次不顯示單場結算
- 最後只顯示一次總結算

總結算包含：

- runs
- wins
- EXP
- 金幣
- 滿等 EXP 轉換金幣
- 自動出售金幣
- 裝備總數
- 保留／售出數
- 停止原因

## 8.4 本對話重要懸賞修正

先前連續懸賞每打一場會短暫 render `ready`，因此玩家看到「單次挑戰／連續挑戰」頁面。

最終修法不是繼續遮 UI，而是第三批直接修正式核心：

- `prepareNextBounty()` 進 `transition`
- 正常連續流程中不 render ready 選單
- 若 transition 期間因其他原因 render，只顯示「準備下一場」
- `bountycontinuousui.js` 已刪除

同一批也把精確戰前獎勵 preview 從 `dungeonbounty.js` 正式核心移除，不再先產生再由 `dungeonplayerui.js` DOM 刪除。

`dungeonplayerui.js` 現在只負責副本首頁簡介 enhancement，不再介入懸賞 ready / combat / result。

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

**玩家介面不得把正式競技場叫「普通／困難／極限」。**

`normal / hard / extreme` 目前只保留為 internal position template id。

## 9.2 逐個解鎖＋最近最多3個

永久進度：

```text
state.dungeon.arena.highestArenaUnlocked
```

Lv15 初次開放只有第1個競技場。

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

玩家只能選目前 visibleRanks 內的競技場。

## 9.3 解鎖下一個競技場

必須同時：

```text
目前最高競技場戰力評估通過
AND
下一個競技場所對應主線區域已解鎖
```

沒有「前三階自動開放」或「前三區免主線」例外。

成功解鎖後：

- `highestArenaUnlocked +1`
- activeRank 清空
- promotionReady 清空
- 上次 assessment signature / runs / clears 清空
- 新最高競技場成為下一次評估目標

## 9.4 戰力評估：97%

正式唯一門檻：

```text
500 次完整三連戰
至少 485 次全通
= 97% 才合格
```

正式 async 評估：

```text
ASSESS_RUNS = 500
ASSESS_CLEAR_TARGET = 485
ASSESS_BATCH_SIZE = 10
```

Safari 友善：每批10次，`setTimeout(step, 0)` 讓出 event loop。

未達97%可反覆重新評估，所以邊界戰力可以「再拚一次」。一旦某次達標：

```text
promotionReady = true
```

玩家評估按鈕停用，資格保留到下一主線區域開放／成功解鎖為止。

評估 signature 會包含：

- arena rank
- position difficulty id
- player level
- 不含 VIP 的基礎 HP / ATK / DEF / crit / dodge
- VIP level
- 五項戰鬥專精

如果裝備、VIP 或戰鬥專精改變，舊結果可被判定 stale，玩家可重新評估。

## 9.5 舊競技場存檔規則

`dungeonprogress.js`：

```text
positionModelVersion = 1
assessmentRuleVersion = 2
```

只承認：

```text
500 次完整結果
+ 有效 lastCheckSignature
+ clears >= 485
```

才能保留 `promotionReady=true`。

舊存檔只有 `promotionReady=true`、但沒有完整500次證據者，資格會被清除。

舊完整結果若只有 450～484 次全通，同樣不再視為合格。

**已經解鎖的 `highestArenaUnlocked` 不因此倒退。**

## 9.6 位置算法

目前 visibleRanks 由左到右內部對應：

```text
左：normal（低位置算法）
中：hard（中位置算法）
右：extreme（高位置算法）
```

但**玩家 UI 不顯示「低／中／高位置」文字**。

最高競技場在早期：

```text
只有 arena1：以低位置算法評估
只有 arena1/2：arena2 以中位置算法評估
arena3 以上：最高 arena 以高位置算法評估
```

位置只影響：

- 暴擊
- 閃避
- 特性

不影響同 Rank 的 HP／ATK／DEF。

## 9.7 競技場 HP / ATK / DEF

Rank multiplier：

```text
R = 實際競技場 Rank

RankHp     = 1 + 0.05  × (R - 1)
RankDamage = 1 + 0.015 × (R - 1)
RankDef    = 1 + 0.03  × (R - 1)
```

共通三戰物理 profile：

```text
S1：HP ×0.60 / Damage ×0.57 / DEF ×0.78
S2：HP ×0.69 / Damage ×0.64 / DEF ×0.80
S3：HP ×0.78 / Damage ×0.73 / DEF ×0.82
```

敵人正式公式：

```text
EnemyHP
= BaseEnemyHP(P) × StageHp × RankHp

EnemyDamageComponent
= BaseEnemyDamage(P) × StageDamage × RankDamage

EnemyATK
= ceil(EnemyDamageComponent + P.def × 0.55)

EnemyDEF
= BaseEnemyDEF(P) × StageDef × RankDef
```

`P` 為不含 VIP 的玩家裝備／基礎 snapshot；玩家正式戰鬥則套 VIP 與戰鬥專精。

第二批整理後：**正式玩家戰鬥、GM測試、500次評估都直接共用 `dungeonarena.js` 的 `ARENA_PHYSICAL_STAGE_PROFILE`。**

舊「正式戰鬥吃 difficulty 三維，測試再被 wrapper 正規化」雙重來源已移除。

## 9.8 暴擊／閃避／特性

Rank 本身不增加 crit / dodge；位置 template 決定暴閃與 trait。

上限大致：

```text
低位置最高：約 crit 9 / dodge 8
中位置最高：約 crit 16 / dodge 14
高位置最高：約 crit 23 / dodge 20
```

特性最多 2 個。

traitMode：

```text
normal1：70% 0特性 / 30% 1特性
normal2：50% 0 / 50% 1
one：固定1
hard3：75% 1 / 25% 2
extreme2：60% 1 / 40% 2
extreme3：50% 1 / 50% 2
```

## 9.9 VIP 積分：整個三格視窗推進

正式 internal position base：

```text
normal  = 180
hard    = 300
extreme = 420
```

**前三個競技場本身不額外加130。只有最高已解鎖競技場到4之後，整個三格視窗每推進一格，三個位置才一起 +130。**

正式公式：

```text
windowOffset
= 130 × max(0, highestVisibleArena - 3)

totalPoints
= positionBase + windowOffset
```

正式 visible progression：

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

正式來源：

```text
dungeonarena.js
pointWindowHighest()
arenaPointOffset()
difficultyForRank()
```

玩家卡片、ready、每戰實際發放、單次結果、連續總結算、GM config 都吃同一套 config。

**玩家遊戲說明不得列上面這組精確積分 progression。**

玩家 guide 只用概念說法：

> 競技場越往後推進，可獲得的 VIP 積分也會提高。

GM 可以顯示精確積分。

## 9.10 單次／連續競技場

一個完整三連戰＝一輪。

- 三戰內 HP 連續，不回血
- 下一輪重新滿血
- 下一輪真正開始前才再扣1次
- 任一戰失敗即該輪失敗
- 死亡停止
- 次數不足停止
- 手動停止在目前整輪結束後生效
- 連續模式最後統一總結算

## 9.11 玩家 UI 行為

競技場選擇頁：

- 顯示目前最高已解鎖競技場
- 顯示 ①戰力評估 + ②主線條件
- 明確寫「97%」
- 500次 async 評估時顯示 `評估中 n/500`
- 最多顯示最近3張競技場卡片
- 卡片顯示「三戰全通 X VIP 積分」
- 不顯示低／中／高位置字樣
- 正式名稱一律用主線區域競技場名

`arenaplayerflow2.js` 目前仍是後載入接管 base `renderArenaDungeon()` 的正式玩家 UI 層；這屬尚存相容架構，不是目前功能 bug。

## 9.12 本對話重要競技場 bug 修正

### A. 解鎖按鈕按了沒反應

根因：舊 `normalizeArenaProgress()` 曾用：

```text
dungeon.arena = {...}
```

直接替換物件。

`promoteArenaRank()` 先取得舊 arena 參照，之後另一層 normalize 換成新物件，導致修改寫在 detached object，save 時正式 state 沒變。

正式修法：`normalizeArenaProgress()` 現在**保留原 `dungeon.arena` 物件 identity，原地 `Object.assign()`**。

此修正後使用者曾實際確認競技場可依序解鎖到第3個。

### B. 競技場積分顯示 180 / 430 / 680

根因：舊公式依 rank 本身：

```text
base + 130 × (rank - 1)
```

錯把前三個競技場直接當作已推進視窗。

正式修正為「highest visible window 從4開始才 +130」，得到 180 / 300 / 420。

### C. 90% → 97%

正式門檻改為 485/500，並加入 `assessmentRuleVersion = 2` 處理舊 `promotionReady`。

### D. 正式戰鬥與 GM／評估三維不一致

第二批完整檢查發現：正式玩家戰鬥仍曾使用低／中／高各自不同 HP／ATK／DEF；只有測試層被後載入 wrapper 正規化。

正式修法：三維直接收回 `dungeonarena.js` 單一 `ARENA_PHYSICAL_STAGE_PROFILE`，位置只保留暴閃／特性。

### E. 舊競技場 UI／wrapper 清理

已完成：

- 舊 450/500 assessment 從 `dungeonarena.js` 移除
- 舊玩家「普通／困難／極限」選擇 UI 移除
- `dungeonplayerui.js` 不再介入正式競技場內頁
- `arenapositioncore.js` 不再 wrapper `buildArenaEnemyForTest()` 正規化三維
- `arenawindowcore.js` 不再暫時改全域 rank 做評估
- `arenaranklabels.js` 已刪除

---

# 10. 虛空幻境

開放等級：Lv25。

核心常數：

```text
Base crit  = 10
Base dodge = 8
HP multiplier  = 2.40
ATK multiplier = 2.15
DEF multiplier = 2.65
```

樓層等價強度：

```text
EquivalentPower(F) = 24 + F / 10
```

基礎三維：

```text
HP  = ceil((62 + 16.2 × E) × 2.40)
ATK = ceil((10.5 + 2.45 × E) × 2.15)
DEF = ceil((3.2 + 0.92 × E) × 2.65)
```

每10層為 Boss；普通樓 1 個特性，Boss 樓 2 個特性。

首次通關積分：

```text
round(15 + 1.75 × sqrt(F - 1))
```

Boss 樓再 ×2。

正式進度：

```text
state.dungeon.voidMirage.highestCleared
```

只在「剛好挑戰 highestCleared + 1」首次通關時推進並發積分。

虛空幻境一個 run 開始時扣1次副本；run 內持續向上挑戰。每通過一層會回滿本 run 鎖定玩家 snapshot 的 HP。

GM 支援：

- 重置樓層
- 直接移動到指定樓層（最高已通過 = target-1）
- 模擬推進到指定樓層並補上首次通關積分
- 挑戰進行中禁止直接用 GM 樓層管理

---

# 11. GM 系統：目前正式功能

GM 從設定頁隱藏入口進入；密碼來源仍定義在 `data.js`，不要在交接檔另建立第二份密碼來源。

`gmhub.js` 有「管理」與「測試」概念；手機版也有對應 responsive UI。

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

GM 可直接設定：

- 副本進度
- 副本可挑戰次數
- VIP 積分
- 重置 VIP（等級＋積分）

注意：單純調低 VIP 積分不會降低已解鎖 VIP 等級；若要回 VIP0 要用正式重置功能。

## 11.3 專精管理與測試

- 正式管理：直接指定玩家 8 項專精等級並存檔
- 測試專精：只存在目前工作階段，不改正式角色
- 測試 VIP：VIP0～20，工作階段限定
- 「目前狀態」可把正式玩家目前 VIP＋專精複製到 GM 測試狀態

## 11.4 主線怪測試

GM 可不受玩家正式解鎖進度限制，選：

```text
區域 → 地圖 → 怪物
```

執行 100 次沙盒模擬，會整理：

- 勝率
- 勝利平均剩餘 HP
- 死亡掉裝次數
- VIP20 保護
- EXP / 金幣
- 滿等 EXP 轉金幣
- 掉落數與品質
- 測試鑑價專精下的售價總和

測試使用 sandbox snapshot，結束後恢復正式 state。

## 11.5 特殊怪測試

可指定特殊怪進行 100 次沙盒模擬；不修改正式角色資料。

## 11.6 懸賞測試

三個按鈕分別測：

- 普通懸賞
- 高級懸賞
- 危險懸賞

各跑 100 次。

敵人生成用不含 VIP 的基礎玩家能力；玩家模擬使用 GM 測試 VIP＋測試專精。

輸出勝率、勝利剩餘 HP、平均回合等。

## 11.7 競技場 GM5

`arenagm5.js` 是目前正式競技場測試 UI。

支援：

1. **100 次完整三連戰**
   - 任選 arena Rank 1～10
   - 任選左／中／右位置算法
   - 使用正式積分 config

2. **500 次正式戰力評估**
   - Rank1 自動用低位置
   - Rank2 自動用中位置
   - Rank3+ 自動用高位置
   - 485 / 500 才判定通過

GM 可以顯示精確積分範例；玩家 guide 不顯示。

## 11.8 虛空幻境 GM

除了樓層管理，也保留虛空幻境測試／UI 管理工具；正式樓層資料以 `dungeonvoid.js` 為唯一來源。

---

# 12. 正式存檔／載入 pipeline

## 12.1 schema

```text
SAVE_SCHEMA_VERSION = 10
SAVE_LOAD_PIPELINE_VERSION = 1
```

`data.js` 的 `SAVE_VERSION = 9` 只保留 legacy／fallback 用途，不是正式 schema。

## 12.2 第五批後正式 runtime load

`window.load` 現在由 `savemigration.js` 正式接管：

```text
讀 localStorage raw
→ 保留 rawSnapshot / sourceVersion
→ clone working state
→ migrateSave()
→ UI/gear normalize
→ 世界 normalize
→ VIP normalize
→ 專精 normalize
→ 副本／競技場 normalize
→ 虛空 normalize
→ offline normalize
→ finalizeDungeonLoadedState()
→ 恢復中斷副本
→ selectedMap / HP / shop normalize
→ 設 saveVersion = 10
→ 最後才 save(false)
```

重要原則：**舊 raw 存檔在 migration 完成以前，不會先被寫回新版 `saveVersion`。**

這修正了舊架構中「base load 可能先把 localStorage 標成新版，再做正式 migration」的風險。

## 12.3 各檔責任

- `engine.js`：保留基礎／fallback `load()`、newState、核心 state helper
- `savemigration.js`：正式 runtime 唯一 load / migration pipeline
- `dungeonprogress.js`：不再 wrapper `load()`；只做副本 normalize + `finalizeDungeonLoadedState()`
- `hpflow.js`：不再 wrapper `normalizeSaveState()`／重跑 migration；只負責 HP 規則與主線戰鬥入口
- `ui.js`：匯入存檔的防禦性 `normalizeSaveState()` / `normalizeCurrentSaveState()`；需要 schema migration 時呼叫正式 `migrateSave()`

## 12.4 migration 內容

目前會處理：

- 舊裝備 mainStat / affix 補齊
- shop 舊版本初始化
- v9 EXP 進度比例轉到新 EXP 曲線
- 世界100張陣列延長
- VIP
- 專精
- 副本／競技場
- 虛空幻境
- offline state

## 12.5 診斷報告

`LAST_SAVE_LOAD_REPORT`：

```text
pipelineVersion
hadRaw
parseFailed
sourceVersion
targetVersion
recoveredInterruptedDungeonRun
```

---

# 13. Runtime 自我檢查

`runtimeintegrity.js` 在 `index.html` 最後載入，不顯示任何玩家 UI。

會建立：

```text
window.PROJECT_RUNTIME_REPORT
```

目前檢查：

- `MAPS.length` 是否符合 WORLD_REGIONS
- `WORLD_MAP_REGISTRATION_REPORT` 是否通過
- `WORLD_NAMING_REPORT` 是否有硬錯
- 必要函式是否存在
- `SAVE_SCHEMA_VERSION === 10`
- `SAVE_LOAD_PIPELINE_VERSION === 1`
- `state.saveVersion` 是否一致
- `dungeon.arena` normalize 是否保持物件參照

有錯寫 console error；只有 warning 則 console warn。

可視 `runtimediag.js` 已移除。未來若 Safari／runtime 再出難定位問題，才臨時加診斷 UI；問題解決後應再移除，不要永久常駐玩家頁。

---

# 14. 本對話五批架構整理：已全部完成

## 第1批：規則與舊資料

完成：

- 競技場 90% → 97%
- 450/500 → 485/500
- `assessmentRuleVersion = 2`
- 舊無證據 `promotionReady` 清理
- 舊玩家競技場 UI 清除
- 異常處理「先查完整鏈」正式納入規範

## 第2批：競技場核心

完成：

- 舊 450 assessment 移除
- 正式三維收回 `dungeonarena.js`
- 位置只管暴閃／特性
- 移除測試層三維 wrapper
- 移除 assessment 暫時改全域 rank
- 舊玩家三難度制度正式退出

## 第3批：懸賞核心

完成：

- 連續懸賞中間不再回 ready 挑戰模式頁
- 最後才一次總結算
- `bountycontinuousui.js` 刪除
- 戰前精確獎勵 preview 從核心移除
- `dungeonplayerui.js` 不再二次修改懸賞內頁

## 第4批：地圖架構

完成：

- 十區統一 `registerRegionMaps()`
- 移除 worldmaps 的直接 push / splice 註冊
- 新增固定 slot 完整性檢查
- 100 張 map index 保持不變，舊存檔無需額外搬移

## 第5批：存檔／全域收尾

完成：

- `savemigration.js` 成為正式唯一 runtime migration pipeline
- `dungeonprogress.js` 不再 wrapper load
- `hpflow.js` 不再 wrapper migration
- 避免 migration 完成前先覆寫 saveVersion
- `arenaranklabels.js` 刪除
- 新增 `runtimeintegrity.js`
- `runtimediag.js` 後續已再刪除，不常駐診斷框

---

# 15. 已知尚未完成／需保留警覺的項目

這些不是目前已確認 bug，但下一個 ChatGPT 必須知道：

## 15.1 主線舊 battle-count base renderer

`ui.js` 還有歷史 1/5/10/15/20/25 battle-count 程式；正式 runtime 由 `continuousbattle.js` 改成單場／連續。

未來可整理，但**不要未檢查整條主線戰鬥鏈就直接刪。**

## 15.2 競技場相容命名

`normal / hard / extreme` 和部分 `difficulty*` 函式名仍保留，現在只表示 position template，相容用途，不是玩家三難度。

## 15.3 競技場玩家 UI 仍是後載入接管

`arenaplayerflow2.js` 仍 wrapper `render()` / `renderArenaDungeon()` 來接管正式玩家競技場頁。

目前正常，但如果未來再重構 UI，應優先把正式 renderer 入口參數化／單一化，而不是再加第三層 wrapper。

## 15.4 engine base load 仍存在

`engine.js` 的 base `load()` 仍保留作 fallback；正式 runtime 最終由後載入 `savemigration.js` 覆蓋。

不要誤以為 engine base load 是目前正式 migration 來源。

## 15.5 地圖 index 仍是永久身分

100張目前安全；但若日後要重新排序／中間插圖，必須正式 migration。

## 15.6 真機完整 smoke test

本對話多次 GitHub 寫入、回讀與 compare 已完成；競技場舊 identity bug 修正後曾由使用者實際確認可解鎖。

但五批大整理全部完成後，**尚未在本對話完成一輪完整 GitHub Pages + 桌面瀏覽器 + iPhone Safari 全系統 smoke test**。

建議下一次大功能前至少快速驗證：

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

# 16. 最重要的正式來源對照

```text
data.js
  世界 region / QUALITY / 固定 map registry

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

savemigration.js
  正式唯一 runtime save migration / load pipeline

runtimeintegrity.js
  背景 runtime integrity report

index.html
  最終實際載入順序與 cache-bust
```

---

# 17. 下一個對話如何接手

下一個對話開始時，建議使用者直接貼這句：

> **讀取 `franksky1207/rpg` 的 `PROJECT_HANDOFF.md`，再重新檢查 `main` 的實際程式碼與完整 `index.html`，完整承接《文明戰線》專案。以 GitHub `main` 為唯一真實來源；若交接檔與實碼衝突，以實碼為準。現在先不要修改，先告訴我你已承接到哪些最新系統、規則、公式、已知技術債與操作原則。**

若下一個對話接著要直接修改，再由使用者明確說：

> **「做／修改／修正／執行」**

才開始寫入 GitHub `main`。
