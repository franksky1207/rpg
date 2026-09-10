# 《文明戰線》正式跨對話交接文件

> **最高原則：GitHub `main` branch 的實際程式碼永遠是唯一真實來源。**
>
> 本文件是給下一個 ChatGPT／後續開發對話使用的承接層。若本文、歷史對話、記憶或任何舊規格與 `main` 實際程式碼衝突，**一律以 `main` 為準**。
>
> 本文件已於 **2026-09-10** 重新讀取 `main` 後更新，已納入本輪完整 VIP 系統、VIP 平衡調整、GM 測試 VIP、手機 GM UI 修正、VIP 架構清理，以及相關 bug 修正。舊交接檔中「VIP 尚未實作／下一階段預計 VIP」等內容已失效並刪除。

---

## 1. 專案基本資料

- 遊戲名稱：**文明戰線**
- Repository：`franksky1207/rpg`
- 正式分支：`main`
- GitHub Pages：`https://franksky1207.github.io/rpg/`
- 技術：純前端 HTML / CSS / JavaScript + `localStorage`
- `SAVE_KEY = "frank_text_rpg_save"`
- `SAVE_VERSION = 7`
- `MAX_LEVEL = 100`
- `VIP_MAX_LEVEL = 20`
- GM 密碼：`franksky`
- 正式世界：Lv1～100、20 張地圖
- 必須同時支援桌機與手機；使用者會用桌機與 iPhone Safari 實際測試

遊戲核心方向：**傳統、簡單、文字型 RPG**。

目前正式主要系統：
- 主線打怪／升級
- 金幣
- 裝備與品質
- 地圖與 Boss 推進
- 怪物特性
- 特殊怪
- 三種副本：懸賞戰、競技場、虛空幻境
- VIP0～20
- 商店
- GM 管理／批量測試

目前不要主動加入職業、技能樹、複雜任務、大量劇情、多角色、PvP、排行榜、登入、每日系統等，除非使用者後續明確要求。

世界規劃：
- Lv1～50：地球戰爭（已完成）
- Lv51～100：太陽系戰爭（已完成）
- Lv101～150：銀河系戰爭（規劃中，尚未實作）

目前狀態：**主線、三副本與 VIP 系統皆已進入暫定完成／平衡凍結階段。** 後續優先依使用者新需求或真機測試結果處理，不要自行重做已接受的平衡。

---

## 2. 給下一個 ChatGPT 的操作規範（必讀）

### 2.1 執行語意

如果使用者說：
- 「做」
- 「修改」
- 「修正」
- 「執行」
- 「做吧」
- 「第 1 批／第 2 批／第 3 批」
- 「可以」且上下文已明確是在要求執行

→ **可以直接修改 GitHub `main`，不需要再要求使用者貼程式碼，也不要重複確認已講清楚的內容。**

如果使用者說：
- 「先不要改」
- 「先討論」
- 「先建議」
- 「你覺得如何／你覺得呢」
- 單純回報測試結果而尚未要求修改

→ **只能分析／建議，不得寫入 GitHub。**

### 2.2 每次修改標準流程

1. **修改前先重新讀取目前 `main` 的相關正式檔案。**
2. 同時重新讀 `index.html`，確認實際 script load order 與 cache-bust。
3. 找出目前真正正式來源，以及後載入是否有覆蓋。
4. 優先直接修改正式來源。
5. **不要另外做 wrapper、fallback、alias、第二套公式、第二套 GM 邏輯或第二套 UI 產生器來繞過正式來源。**
6. 若舊程式已完全失效且無 consumer，應直接刪除，而不是留備用層。
7. 修改後重新讀取修改過的檔案，確認內容與 SHA。
8. **任何 `.js` / `.css` 修改都必須同步更新 `index.html` 對應 `?v=` cache-bust。**
9. 更新 `index.html` 後再重新讀一次，確認路徑、順序、版本正確。
10. GitHub 寫入成功不等於 Pages／Safari 已真機驗證；除非使用者實際回報，不可宣稱真機已測。
11. 重要系統、規則、架構變更後同步更新本 `PROJECT_HANDOFF.md`。

### 2.3 架構原則

- **`main` 是唯一真實來源。**
- classic `<script>` 的 load order 是架構的一部分。
- 頂層 `let/const` 可能互撞；獨立模組通常使用 IIFE。
- 不要看到舊檔名／舊交接內容就假設它有效；先確認 `index.html` 是否還載入。
- 優先「單一正式來源」，避免前面改對、後面舊檔再覆蓋。
- 裝備、戰鬥、主線怪、怪物特性、VIP 能力、GM 模擬尤其禁止複製公式。
- 不要為了架構漂亮主動大重構；先看是否有實際問題與使用者需求。

---

## 3. 目前 `index.html` 正式載入架構

截至本文件更新時，`main` 正式 script load order：

```text
data.js
worldmaps-earth.js
worldmaps-solar.js
engine.js
combatcore.js
dungeonprogress.js
dungeoncore.js
ui.js
vipui.js
settlementui.js
balance.js
traits.js
traitlock.js
traitdrop.js
gmtools.js
shopbalance.js
gearupgrade.js
specialmonsters.js
dungeonbounty.js
dungeonarena.js
dungeonvoid.js
dungeonvoidui.js
levelcap.js
specialcore.js
vipgm.js
specialgmbatch.js
dungeongm.js
gmhub.js
dungeonvoidgmmanage.js
dungeonvoidgmui.js
level100balance.js
specialencounter.js
battlepipeline.js
specialguide.js
levelcapresult.js
dungeonui.js
adventureprogressui.js
```

目前重要 cache-bust：
- `engine.js?v=20260910-2302-vipcleanup3`
- `combatcore.js?v=20260910-2245-vipcleanup`
- `dungeonprogress.js?v=20260910-2245-vipcleanup`
- `dungeoncore.js?v=20260910-2245-vipcleanup`
- `vipui.js?v=20260910-2245-vipcleanup`
- `traitdrop.js?v=20260910-1910-vip3`
- `dungeonbounty.js?v=20260910-2245-vipcleanup`
- `dungeonarena.js?v=20260910-2245-vipcleanup`
- `dungeonvoid.js?v=20260910-1856-vip1`
- `dungeonvoidui.js?v=20260910-2245-vipcleanup`
- `vipgm.js?v=20260910-2245-vipcleanup`
- `gmhub.js?v=20260910-2038-mobile-summary`
- `specialencounter.js?v=20260910-1925-vip4`
- `dungeonui.js?v=20260910-2245-vipcleanup`

已不再載入／不應自行恢復：
- `battleflow.js`
- `playername.js`
- `level100.js`
- `worldexpansion.js`
- `uifix.js`
- `specialgm.js`
- `battlelimit.js`
- `risksettlement.js`
- **`viprewards.js`**（本輪已刪除，VIP16／VIP20 已併回正式來源）

重要來源：
- `engine.js`：核心 state、玩家／裝備／VIP 基礎、死亡懲罰、商店等。
- `balance.js`：**主線怪唯一正式公式**。
- `combatcore.js`：共用戰鬥核心＋正式主線 `fightOnce()`。
- `traits.js`：怪物特性正式核心。
- `traitdrop.js`：主線掉裝＋VIP2／8／14／18。
- `battlepipeline.js`：主線連戰與特殊遭遇掛接。
- `dungeonprogress.js`：副本進度、VIP4／12、副本取得 VIP 積分。
- `vipui.js`：VIP 顯示／特權列表／VIP 結算事件提示。
- `vipgm.js`：GM runtime 測試 VIP。
- `gmhub.js`：正式 GM UI。
- `dungeongm.js`／`specialgmbatch.js`：正式 GM 批量模擬。

---

## 4. Lv1～100 正式世界

每 5 級一張地圖；每張固定：3 普通＋1 菁英＋1 Boss。
總計 20 張地圖、100 隻主線怪。

### 地球戰爭 Lv1～50

1. 城市淪陷區 Lv1～5
2. 郊區防衛線 Lv6～10
3. 地下軍事設施 Lv11～15
4. 荒漠戰區 Lv16～20
5. 污染禁區 Lv21～25
6. 極地戰線 Lv26～30
7. 古代科技遺址 Lv31～35
8. 火山兵器基地 Lv36～40
9. 全球指揮中心 Lv41～45
10. 地球決戰區 Lv46～50

### 太陽系戰爭 Lv51～100

11. 月面登陸區 Lv51～55
12. 月球軌道站 Lv56～60
13. 火星殖民區 Lv61～65
14. 火星赤原戰場 Lv66～70
15. 小行星採礦帶 Lv71～75
16. 木衛戰區 Lv76～80
17. 木星軌道圈 Lv81～85
18. 土星環防線 Lv86～90
19. 外太陽系邊境 Lv91～95
20. 太陽系終極戰線 Lv96～100

怪物／裝備名稱一律以 `worldmaps-earth.js`、`worldmaps-solar.js` 為準。

`engine.js` 會依 `MAPS.length` 正規化 `mapProgress / bossProgress / bossLocked / bossKilled`，舊存檔陣列不足會補齊。

---

## 5. 玩家能力、裝備與理論暴閃

### 5.1 玩家無 VIP 基礎

```js
baseHP(l)  = ceil(110 + 12*(l-1))
baseATK(l) = ceil(15 + 2.2*(l-1))
baseDEF(l) = ceil(7 + 1.2*(l-1))
```

`equippedStats()` = 等級基礎＋裝備，**不含 VIP**。

`playerCombatStats()` = 在 `equippedStats()` 或傳入 base snapshot 上再套正式 VIP，為實際玩家戰鬥能力。

玩家 crit / dodge 沒有 30% 硬上限；怪物仍有 30% cap。

### 5.2 裝備品質倍率

| 品質 | q | 能力倍率 | 出售倍率 |
|---|---:|---:|---:|
| 普通 | 0 | 1.00 | 1.0 |
| 優良 | 1 | 1.15 | 1.4 |
| 稀有 | 2 | 1.35 | 2.0 |
| 史詩 | 3 | 1.60 | 3.2 |
| 傳說 | 4 | 1.95 | 5.0 |
| 神話 | 5 | 2.40 | 8.0 |

神話不可自動出售。

### 5.3 五部位與主能力

- 武器：ATK
- 頭盔：HP
- 鎧甲：DEF
- 鞋子：HP
- 飾品：暴擊

```js
weapon = ceil((3 + 1.55*level) * m)
helmet = ceil((8 + 2.5*level) * m)
armor  = ceil((1 + 0.65*level) * m)
shoes  = ceil((8 + 2.5*level) * m)
```

飾品主暴擊：普通 1～2、優良 2～3、稀有 3～5、史詩 5～7、傳說 7～9、神話 9～10。

### 5.4 詞條

詞條池：
- 武器：ATK / crit / HP
- 頭盔：HP / DEF / dodge
- 鎧甲：DEF / HP / dodge
- 鞋子：dodge / DEF / HP
- 飾品：crit / ATK / HP / dodge

詞條數：普通0、優良1、稀有1～2、史詩2、傳說2～3、神話3；同件詞條不重複。

```js
ATK affix = ceil((1 + 0.45*level) * m)
DEF affix = ceil((0.5 + 0.20*level) * m)
HP  affix = ceil((3 + 0.9*level) * m)
```

crit / dodge 詞條：普通0、優良1、稀有1～2、史詩2～3、傳說3～4、神話4～5。

### 5.5 裝備評分

```js
rateWeight = 20 + 0.5*itemLevel
score = ATK*5 + DEF*5 + HP + crit*rateWeight + dodge*rateWeight
```

`gearupgrade.js` 依 `equipmentScore()` 做升級判定、一鍵裝備、一鍵出售。

### 5.6 暴擊／閃避理論極限理解

在目前裝備詞條結構下，全神話且所有相關詞條取最高值時，裝備可達約：
- 暴擊 20%
- 閃避 20%

VIP20 再提供暴擊＋5%、閃避＋5%，因此目前自然理論上限約 **25% / 25%**，沒有額外硬 cap。

---

## 6. 主線怪正式平衡（已凍結）

唯一正式來源：`balance.js`。

```js
monsterBase(l):
HP  = ceil(55 + 24*l)
ATK = ceil(9 + 4.2*l)
DEF = ceil(2.5 + 2.0*l)
```

style：
- `tank`：HP ×1.15、ATK ×0.95
- `attack`：HP ×0.92、ATK ×1.10

stage：

| 敵人 | HP | ATK | DEF |
|---|---:|---:|---:|
| 第1普通 | 1.22 | 1.17 | 1.10 |
| 第2普通 | 1.31 | 1.24 | 1.14 |
| 第3普通 | 1.34 | 1.28 | 1.15 |
| 菁英 | 1.39 | 1.29 | 1.17 |
| Boss | 1.44 | 1.27 | 1.17 |

先 base → style → stage。

設計基準：一般稀有／史詩／少量傳說為正常玩家；全傳說為偏強上限，可多推約一張圖，不應長期跨圖碾壓。

主線平衡已接受，不要因 VIP 調整再主動重做敵人公式。

---

## 7. 共用戰鬥核心

正式：`combatcore.js -> runCombatCore(player,enemy,startHp,options)`。

```js
calcDamage(atk,def)
= max(1, ceil((atk - def*0.55) * random(0.95~1.05)))
```

- 暴擊倍率 1.5×
- 最低傷害 1
- 怪物 crit / dodge cap 30%
- 玩家 crit / dodge 不受此 cap
- berserk：敵人 HP <50% 時 ATK ×1.20
- **沒有 200 回合上限**

正式主線 `fightOnce()` 也在 `combatcore.js`，目前已直接包含 VIP16 Boss 額外掉裝流程。

GM 模擬一律使用 `runCombatCore(...,{logs:false})`，不要複製戰鬥公式。

---

## 8. EXP、金幣、滿等

```js
sameExp(l) = ceil(25 + 4*l)
goldBase(l) = ceil(6 + 4*l)
```

EXP 等級差倍率：怪高 ≥5：1.3；+3～4：1.2；+1～2：1.1；同級1；-1～-2：.9；-3～-5：.6；-6～-10：.25；低超過10：.05。

種類倍率：
- EXP：普通1、菁英2、Boss5
- 金幣：普通1、菁英2.5、Boss6

正式永久 EXP 曲線由後載入 `level100balance.js` 覆蓋：

```js
x   = (level-1)^1.8
mid = 64^1.8
factor = 5 + 195*x/(x+mid)
expNeed(level) = ceil(sameExp(level) * factor)
```

Lv100 不再累積 EXP；`levelcap.js` 將原 EXP 1:1 轉金幣，`levelcapresult.js` 顯示主線滿等轉換。

---

## 9. 主線推進與連戰

每圖：第1普通10 → 第2普通10 → 第3普通10 → 菁英10，且達地圖最大 Lv → Boss。

Boss：
- 首勝解鎖下一地圖並免費刷新商店。
- 戰敗重新鎖定，需再擊敗本地圖菁英10隻。
- 最終地圖不解鎖第21張。

連戰數量：Lv1=1、Lv6=5、Lv11=10、Lv16=15、Lv21=20、Lv26+=25；Boss 單場。

`battlepipeline.js`：
- 整批開始前滿血。
- 每場勝利後下一場前滿血。
- 副本進度以該場真實 startHp / combatEndHp 計算後才回血。
- 任一場敗北立即終止整批。
- 前面已完成場次 EXP／金幣／裝備／副本進度保留。
- 舊 `<30% HP` risk modal／休息／繼續流程已刪除。

---

## 10. 怪物特性

正式來源：`traits.js -> applyMonsterTraits()`。

7 種：
- 強壯：HP +20%
- 兇猛：ATK +15%
- 堅硬：DEF +20%
- 迅捷：dodge +8
- 致命：crit +8
- 狂暴：HP <50% 時 ATK +20%
- 巨體：HP +30%、ATK +5%、dodge -5

主線特性數：普通 70%0／25%1／5%2；菁英35%0／50%1／15%2；Boss15%0／55%1／30%2。

`traitlock.js` 固定主線預覽 traits，避免 re-render 洗特性。

懸賞、競技場、虛空共用 `applyMonsterTraits()`，不要分叉效果。

---

## 11. 主線裝備掉落與 VIP 升階

正式主線掉裝最後由 `traitdrop.js` 定義 `window.dropItem()`。

基礎掉率：
- 普通 25%
- 菁英 60%
- Boss 100%

VIP2 後：普通30%、菁英65%、Boss仍100%。

Lv offset：
- 普通 `[-2,-1,0,0,+1]`
- 菁英 `[-1,0,0,+1]`
- Boss `[-1,0,0,+1,+2]`

品質升階來源彼此獨立判定、可連鎖、神話 q5 封頂：
- traits：1 特性15%、2 特性30% → +1
- VIP14：5% → +1
- VIP18：Boss 掉落10% → +1

順序目前：基礎品質 → trait → VIP14 → VIP18。

`_vipMeta` 為 non-enumerable metadata，紀錄實際升階與 VIP8 等事件供結算 UI 使用。

VIP8：每次成功掉裝後，15% 強制掉目前 `equipmentScore()` 最弱部位；同分時 `weakEquipmentTypes()` 先 shuffle，等同隨機 tie-break。

VIP16：主線 Boss 勝利後有15%機率再執行一次完整 `dropItem(e,mapIdx)`。第二件會正常吃 Boss 掉率、VIP8／14／18／traits，但**不再遞迴觸發 VIP16**。

---

## 12. 商店

刷新成本：100 → 200 → 400 → 800 → 1600 → 3200 → 6400 → 12800。

- 12800 後可重置回100，冷卻1小時。
- 買一件商品刷新價格下降1級。
- 首次解鎖新地圖免費刷新。
- 商店一次3件，不出神話。
- `shopbalance.js` 品質：普通25%、優良40%、稀有25%、史詩8%、傳說2%、神話0%。
- 第1件最弱部位、第2件次弱、第3件隨機。
- 死亡遺失裝備贖回價 `ceil(item.buy*2)`。

---

## 13. 副本共通與 VIP 積分

### 13.1 正式資料來源

現在正式 VIP 貨幣來源是：

```js
state.vipPoints
```

`state.dungeon` 正式仍保存：

```js
{ progress, attempts, points }
```

但 `dungeon.points` 現在只是**舊存檔／舊模組相容鏡像**，正式積分判斷與顯示應以 `state.vipPoints` 為準。

`normalizeDungeonState()` 會在舊資料只有 `dungeon.points` 時遷移到 `vipPoints`，之後同步鏡像避免舊 consumer 壞掉。不要新增新的正式邏輯依賴 `dungeon.points`。

### 13.2 副本次數進度

只有主線勝利增加：

```js
敵人HP部分 = (enemyMaxHp / playerBaseHp) * 1.5
受傷部分   = ((startHp - endHp) / playerMaxHp) * 4
baseProgress = 敵人HP部分 + 受傷部分
```

VIP 副本進度倍率：
- VIP0～3：×1.00
- VIP4～11：×1.10
- VIP12～20：×1.20

注意 VIP12 是**總倍率1.20，不是1.10再乘1.10。**

每100 progress → +1 `attempts`。

### 13.3 `dungeoncore.js`

- `canStartDungeonRun(cost)`：檢查次數。
- `beginDungeonRun({mode,cost})`：扣次數、補滿 HP、建立 active run。
- `finishDungeonRun()`：結束並預設補滿 HP。
- 回傳 points 已改以 `state.vipPoints` 為正式值。

競技場與虛空整趟鎖定角色快照，不應改回每場讀 live gear。

副本解鎖：懸賞 Lv5、競技場 Lv15、虛空 Lv25。

---

## 14. VIP 系統（目前暫定完成）

### 14.1 VIP 等級與門檻

VIP0～20。

```js
vipThreshold(n) = 1000 * n^2
```

門檻：VIP1=1,000；2=4,000；3=9,000；...；20=400,000。

`vipLevel` 是玩家曾解鎖的**永久最高 VIP 等級**；正常遊戲中就算 VIP 積分降低，VIP 等級不倒退。

`vipPoints` 是目前積分值，可增加／消耗／GM 調整；一次大量增加可跨多級。

`normalizeVipState()` = `max(已存 vipLevel, 目前 points 對應 level)`，再 clamp 0～20。

### 14.2 固定能力加成（2026-09-10 最新定案）

正式唯一來源：`engine.js -> vipBonusStats(level)`。

每 VIP1：
- HP +0.5%
- ATK +0.5%
- DEF +0.25%
- 暴擊 +0.25 個百分點
- 閃避 +0.25 個百分點

VIP20：HP +10%、ATK +10%、DEF +5%、暴擊 +5%、閃避 +5%。

`playerCombatStats()` 直接使用 `vipBonusStats()`，UI 與 GM 也必須用同一函式，不再各自重算。

**重要：** 本輪曾先測過 HP／ATK／DEF 每級 +2%，後改成1／1／0.5，再改成0.5／0.5／0.25；暴閃最後由每級 +0.5 降為 +0.25。舊倍率全部失效，不可恢復。

HP 最大值因 VIP 升級變化時，正常積分升級會保留當前 HP 比例；若原本滿血，升級後仍滿血。

### 14.3 十個偶數 VIP 特權

- **VIP2**：主線裝備掉率 +5 個百分點（普通25→30、菁英60→65、Boss100不變）
- **VIP4**：副本 progress +10%
- **VIP6**：符合特殊怪基本資格後，遭遇率 +2 個百分點（8%→10%）
- **VIP8**：每件成功主線掉落有15%優先目前最弱裝備部位
- **VIP10**：擊敗特殊怪後有10%機率再獲得一套全新的第二次特殊獎勵
- **VIP12**：副本 progress 總倍率提升為1.20
- **VIP14**：主線掉裝5%品質 +1
- **VIP16**：主線 Boss 15%額外掉1件
- **VIP18**：Boss 每件戰利品10%品質 +1
- **VIP20**：死亡時保護裝備不遺失；EXP與其他死亡後果仍照常

### 14.4 特權細節

VIP10 第二次特殊獎勵：
- 是全新的 reward context，不是複製第一次結果。
- EXP、金幣、裝備、商店折扣等照第二次 context 正常執行並累加。
- 流動交易代理人等 random reward 會重新 roll。
- 結算顯示 `【VIP10】特殊獎勵再次發動！`。

VIP14／VIP18／traits 品質升階：
- 彼此獨立 roll。
- 可鏈式升階。
- q5 神話封頂。
- 結算只算實際成功升階，不把在 q5 擲中但無法再升算成升階。

VIP20：
- 原本30%死亡掉裝 roll 仍可發生。
- VIP20 時 roll 中只設 `protectedByVip20=true`，不移除裝備。
- EXP 10%懲罰仍照常。
- 結算顯示 `【VIP20】裝備受到保護，本次死亡沒有遺失裝備。`

### 14.5 VIP 玩家／敵人快照原則

**自適應敵人永遠依無 VIP 的 `equippedStats()` 生成；玩家實戰使用含 VIP 的 `playerCombatStats()`。**

- 主線：敵人正式主線公式；玩家含 VIP。
- 特殊怪：敵人依無 VIP snapshot；玩家含 VIP。
- 懸賞：敵人依無 VIP snapshot；玩家含 VIP。
- 競技場：敵人依無 VIP snapshot；玩家第一戰開始時把含 VIP snapshot 鎖整趟。
- 虛空：敵人固定樓層公式；玩家第一次真正開打時鎖含 VIP snapshot 整趟。

競技場／虛空途中因取得 VIP 積分跨 VIP 等級，**當趟快照與 carry HP 不變**。`addDungeonPoints()` 對 active run `arena`／`void-mirage` 鎖 HP，避免升 VIP 偷改當趟狀態。

### 14.6 已接受 VIP 實測

使用者以**全身傳說裝**實測最高懸賞／極限競技場：
- 舊較高倍率時 VIP7 即接近100%，判定過強。
- 調成 HP/ATK+1%、DEF+0.5% 後，VIP10～12 仍接近100%，仍過強。
- 調成 HP/ATK+0.5%、DEF+0.25%，暴閃仍+0.5%後，VIP15約90%、VIP20懸賞約90～95%、競技場95～99甚至偶爾100%。
- 最後再將暴擊／閃避降為每級+0.25%。
- **目前最後結果：VIP15 約85～90%；VIP20 兩者多在90%多，不再常態貼近100%。**

此結果目前視為可接受。因尚未取得「全身神話」實測，未來全神話極限仍可再驗證，但**目前不要主動再砍 VIP**。

---

## 15. VIP UI

正式：`vipui.js`。

### 15.1 主頁 VIP 卡

一般：
```text
VIP2｜4,100 / 9,000
```

VIP20：
```text
VIP20 MAX｜VIP 積分 527,430
```

主頁有「查看特權」按鈕。

**使用者明確不要 VIP progress bar，勿自行加回。**

### 15.2 VIP 詳情 modal

顯示：
- 當前 VIP／積分／下一等門檻
- HP、ATK、DEF、暴擊、閃避實際 VIP 加成
- VIP2～20 十條特權與門檻
- 已解鎖／下一條／未解鎖不同視覺

視覺：
- unlocked：金褐底、金色文字
- next：暗底＋純金色2px邊框
- locked：灰暗、opacity降低

下一條是依「目前已解鎖 VIP」判斷，不因點數降低而倒退。

### 15.3 VIP 事件提示

只有真正觸發才顯示；一般金色，品質連鎖用更亮的 `.vip-event.chain`。

正式文字：
- `【VIP8】本次掉落優先鎖定目前最弱裝備部位。`
- `【VIP10】特殊獎勵再次發動！`
- `【VIP14】裝備品質提升 1 階！`
- `【VIP16】Boss 額外掉落 1 件裝備！`
- `【VIP18】Boss 戰利品品質提升 1 階！`
- `【VIP20】裝備受到保護，本次死亡沒有遺失裝備。`

多場／多件時 UI 可彙總次數；品質若多來源連續成功會顯示連鎖提示。

---

## 16. 特殊怪

基礎遭遇率：`SPECIAL_ENCOUNTER_RATE = 0.08`；VIP6 後符合條件時變10%。

共9種：
1. 稀有資源聚合體
2. 誘餌補給艙
3. 終止協議單元
4. 機率增幅信標
5. 封存警戒機
6. 裝備保全單元
7. 黑市武裝頭目
8. 戰利品回收者
9. 流動交易代理人

自適應基底在 `specialmonsters.js`：

```js
def = ceil(playerATK * .45)
playerHit = max(1, playerATK - def*.55)
hp = ceil(playerHit*6)
damage = playerHP/8
```

特殊怪生成用無 VIP snapshot；正式玩家戰鬥含 VIP。

特殊遭遇 eligibility：
- Boss 不觸發。
- 玩家等級不可高於該主線怪10級以上。
- 玩家當前 HP 必須至少30%。
- 先通過遭遇 roll，再詢問挑戰／略過。

VIP10 第二次特殊獎勵與 VIP20 死亡保護已整合正式流程。

主線連戰透過 `battlepipeline.js` before-fight hook 觸發，不要再建第二個特殊遭遇觸發器。

---

## 17. 懸賞戰（已完成）

正式：`dungeonbounty.js`。

一次一戰；隨機 tier；勝利給 VIP 積分，失敗0。

共同自適應基底為 `specialBaseEnemyFromPlayer()`。

正式 tier：

```text
普通：weight45，80 VIP積分
hp1.00 dmg1.00 def.88
crit .5+0 cap10 / dodge .5+0 cap8
1 trait

高級：weight35，120 VIP積分
hp1.03 dmg1.03 def.90
crit .7+2 cap20 / dodge .7+1 cap18
1 trait

危險：weight20，180 VIP積分
hp1.08 dmg1.06 def.92
crit .85+3 cap28 / dodge .85+2 cap22
50% 1 trait / 50% 2 traits
```

敵人 ATK = `ceil(base.damage * damageMul + playerDEF*0.55)`。

流程：進 ready 不扣次數；按開始時以**當下無 VIP 裝備能力**重建敵人，保留預覽名稱／traits，再扣1次；玩家正式戰鬥吃 VIP。

畫面文字已正式改成「VIP 積分」，不再靠 DOM 文字替換。

---

## 18. 競技場（已完成）

正式：`dungeonarena.js`。

- 普通／困難／極限三難度。
- 三場連戰，場間不回血。
- 每戰勝利立即給 VIP 積分；中途敗北保留前面所得。
- 無 clear bonus。
- 第一戰真正開始時鎖定玩家含 VIP snapshot 與敵人無 VIP scaling snapshot；三戰共用。

積分：
- 普通 `[25,35,120]`，總180
- 困難 `[35,45,200]`，總280
- 極限 `[40,60,320]`，總420

正式 stage 倍率仍以 `dungeonarena.js` 的 `ARENA_STAGE_CONFIGS` 為準；不要從舊對話複製另一套。

畫面已正式改「VIP 積分」。

---

## 19. 虛空幻境（已完成）

正式：`dungeonvoid.js` + `dungeonvoidui.js`。

定位：**隨機特性爬塔**；同角色每趟最高樓層有波動是刻意保留的玩法。

- Lv25 解鎖。
- `highestCleared + 1` 開始。
- 第一次真正開戰才扣1次副本次數。
- 整趟玩家能力鎖 snapshot。
- 每層開始前完全補滿 snapshot HP。
- 打到敗北或要求退出。
- 一般層1個隨機 trait；每10層 Boss 2個不同 traits。
- 只有新的最高樓層首通給 VIP 積分。

怪物固定公式：

```js
equivalentPower = 24 + floor/10
HP  = ceil((62 + 16.2*e) * 2.40)
ATK = ceil((10.5 + 2.45*e) * 2.15)
DEF = ceil((3.2 + 0.92*e) * 2.65)
crit = 10
dodge = 8
```

首通積分：

```js
round(15 + 1.75*sqrt(floor-1))
Boss floor => ×2
```

本輪 VIP 收尾後：
- 虛空途中升 VIP 不改當趟 carry HP。
- 虛空正式 UI 玩家能力顯示改用當趟 player snapshot，不再錯顯示無 VIP `equippedStats()`。
- 結果頁正式顯示「目前 VIP 積分」。

---

## 20. GM 管理與測試

### 20.1 GM UI

設定頁連點「設定」標題3下 → 密碼 modal → `franksky`。

正式 GM UI：`gmhub.js`，分「管理」與「測試」。

管理：
- 指定等級
- 指定金幣
- 指定世界解鎖
- 補滿 HP
- 清空背包
- 商店刷新／重置
- 產生指定品質／Lv／部位裝備
- 副本 progress／attempts／VIP 積分
- **重置 VIP（等級＋積分）**

### 20.2 GM 正式 VIP 管理

`gmApplyDungeonValues()` 可調 VIP 積分；正常規則下把積分調低**不會降低已解鎖 VIP 等級**。

因此另有 `gmResetVip()`：
- 明確確認後將 `state.vipLevel=0`
- `state.vipPoints=0`
- 相容鏡像 `dungeon.points=0`
- 不清空副本 progress／attempts／虛空樓層等其他進度
- 依重置前 HP 比例調整新最大 HP；原本滿血則重置後滿血

### 20.3 GM runtime 測試 VIP

正式：`vipgm.js`。

- `window.gmTestVipLevel`：VIP0～20。
- 只存在目前頁面 runtime，不寫 localStorage。
- GM 分頁切換、同頁測試之間保留。
- 重新整理／重新開頁後回 VIP0。
- 測試玩家用 `playerCombatStats(base, testVip)`。
- 顯示文字也用共用 `vipBonusStats()`。

目前 label 格式例如：
```text
VIP10｜HP/ATK +5%｜DEF +2.5%｜暴擊/閃避 +2.5%
```

### 20.4 GM 測試原則

GM sandbox：`gmCreateSandboxSnapshot()` / `gmResetSandbox()` / `gmRestoreSandbox()`，批量測試不可污染正式角色資料。

- 主線地圖怪：敵人正式主線生成；玩家套測試 VIP；測 EXP／金幣／掉落／VIP16／死亡／VIP20。
- 特殊怪：敵人以無 VIP snapshot 生成；玩家測試 VIP；VIP10／VIP20也按測試 VIP。
- 懸賞：敵人無 VIP scaling；玩家測試 VIP。
- 競技場：敵人無 VIP scaling；三戰玩家鎖測試 VIP snapshot。
- 虛空：敵人固定樓層；玩家套測試 VIP。

`GM_TEST_RUNS` 的100次模擬用於主線、特殊怪、懸賞、競技場；虛空爬塔不是固定100次。

### 20.5 手機 GM UI

本輪修正 GM「副本管理」最上方摘要。

桌機：橫向摘要。

手機 `<=760px`：2×2 資訊格：
- 副本進度
- 可挑戰次數
- VIP 等級
- VIP 積分

手機版 slash separator 隱藏，每格有 label＋value，避免 iPhone Safari 原本一長串 `／` 自動斷行很醜。

---

## 21. VIP 系統本輪重要 bug 修正／架構清理

### 21.1 VIP 能力公式單一來源

舊問題：正式戰鬥、VIP UI、GM 各自重算倍率，容易一次改三處漏一處。

目前：`engine.js -> vipBonusStats()` 為唯一能力百分比來源；`playerCombatStats()`、`vipui.js`、`vipgm.js` 共用。

常數現在以「百分比」保存：

```js
VIP_HP_ATK_PERCENT_PER_LEVEL = .5
VIP_DEF_PERCENT_PER_LEVEL = .25
VIP_RATE_STAT_PER_LEVEL = .25
```

避免 `.005*100` 類浮點顯示與多套公式。

### 21.2 刪除 `viprewards.js`

舊版 `viprewards.js` 用 wrapper 覆寫 `fightOnce()`，並重寫 `applyDeathPenalty()`。

現在：
- VIP16 直接併回 `combatcore.js -> fightOnce()`。
- VIP20 直接併回 `engine.js -> applyDeathPenalty()`。
- `viprewards.js` 已從 repository main 刪除，`index.html` 也不再載入。

不要恢復 wrapper。

### 21.3 VIP 積分名稱與資料來源清理

舊 `dungeonui.js` 有 `TreeWalker` 掃整個 DOM，把「副本積分」動態 replace 成「VIP 積分」。

目前：
- 各正式 UI 來源文字直接改成「VIP 積分」。
- `normalizeVipPointLabels()`／DOM 全頁替換已刪除。
- `state.vipPoints` 是正式貨幣來源。
- `dungeon.points` 只保留 migration／compatibility mirror。

### 21.4 虛空 snapshot 顯示與升級 HP

- `addDungeonPoints()` 對 arena／void-mirage active run 都鎖 carry HP。
- 虛空 UI 改顯示 run snapshot，避免實戰含 VIP、畫面卻顯示無 VIP。

### 21.5 GM VIP 控制曾消失

本輪調 VIP 暴閃時，`vipgm.js` 的 `testVip()` 曾少一個括號，造成整支 script syntax error，GM「測試 VIP 等級」區塊消失。

已立即修正並更新 cache-bust；目前 GM 測試 VIP 控制正常載入。後續改這支檔案要特別做語法回讀。

---

## 22. 其他已完成的重要清理／bug 修正

仍有效：
- `engine.js` 舊主線 `monsterBase()` / `monsterObj()` 已移除；主線怪只看 `balance.js`。
- 舊200回合限制已刪。
- 舊低血 risk modal 已刪。
- 舊奇幻地圖已從 `data.js` 移除。
- 舊 Lv50 限制全面改 `MAX_LEVEL`／`clampGameLevel()`。
- `battleflow.js / playername.js / level100.js / worldexpansion.js / uifix.js` 不載入。
- 懸賞／競技場／虛空 traits 共用 `applyMonsterTraits()`。
- 懸賞 ready 不扣次數；開始才扣，且開戰重建敵人堵弱裝進場漏洞。
- 競技場選難度不扣；第一戰才扣；三戰鎖同一 snapshot；舊 clear bonus 已刪。
- 虛空 ready 不扣；第一層真正開打才扣；未開打退出不免費補血；整趟鎖 snapshot。
- 主線冒險 UI 集中 `ui.js`；`adventureprogressui.js` 主要負責樣式。

---

## 23. 目前仍有正式責任、不要誤刪的後載入層

- `balance.js`：主線怪正式平衡。
- `level100balance.js`：正式 EXP 曲線。
- `traitlock.js`：主線預覽 traits 固定。
- `traitdrop.js`：主線掉裝＋VIP2／8／14／18。
- `shopbalance.js`：商店品質與弱部位邏輯。
- `gearupgrade.js`：裝備評分與批量裝備／出售。
- `levelcap.js`：Lv100 EXP 轉金幣。
- `levelcapresult.js`：滿等結算顯示。
- `dungeonui.js`：副本首頁／route／冒險側副本狀態。
- `settlementui.js`：主線結算擴充＋VIP event injection。
- `dungeonvoidui.js`：虛空正式 UI 與動畫。
- `vipui.js`：VIP card／modal／事件提示。
- `vipgm.js`：runtime test VIP。

沒有使用者需求時不要為「核心化」大規模搬檔。

---

## 24. 目前尚未完成／待後續驗證

1. **Lv101～150 銀河系戰爭**：尚未加入地圖、怪物、裝備與新等級上限。
2. **跨裝置雲端存檔**：目前只有 `localStorage`；手機／桌機無法共用進度。
3. 目前沒有登入、Firebase、Google 試算表存檔、排行榜、多人系統。
4. 部分 UI 仍由 JS 動態注入 CSS；目前正常，是否搬回 CSS 是可選整理，不是必修。
5. **VIP 全神話裝最終極限尚未真機完成驗證。** 目前最後接受的 VIP15／VIP20 勝率是以全傳說測得；若未來全神話使最高副本過度貼近100%，再依實測決定是否調整，不要預先削弱。
6. VIP 系統目前為「暫定完成」，後續除 bug 或真機數據明顯異常外，不主動重調。

不要從歷史對話自行恢復舊待辦；以使用者下一步與 `main` 為準。

---

## 25. 真機／回歸驗證重點

主線：
- Lv26+ 連戰數正確；Boss 單場。
- 每場勝利後下一場滿血。
- 戰敗立即結束。
- 主線玩家吃 VIP，但主線怪公式不因 VIP 自適應放大。

裝備／VIP：
- VIP2 掉率只加主線普通／菁英5個百分點。
- VIP8 最弱部位只有實際成功掉裝後才 roll。
- traits／VIP14／VIP18 可鏈式升階且神話封頂。
- VIP16 第二件是完整 Boss 掉落，不遞迴 VIP16。
- VIP20 只保裝備，EXP死亡懲罰仍存在。
- VIP UI／GM 顯示與正式戰鬥能力一致。

懸賞：
- ready 不扣；按開始才扣。
- 敵人無 VIP scaling；玩家含 VIP。

競技場：
- 第一戰開始才扣。
- 三戰不回血。
- 整趟敵人 scaling 無 VIP、玩家 snapshot 含開場 VIP。
- 中途取得積分升 VIP 不改該趟 snapshot／HP。

虛空：
- 第一層真正開打才扣。
- 每層滿血。
- 整趟玩家 snapshot 含開場 VIP。
- 中途升 VIP 不改當趟。
- UI 顯示 snapshot 真實能力。

特殊怪：
- VIP6 遭遇率8→10%，但 eligibility 仍先成立。
- VIP10 第二次獎勵是 fresh roll。
- 特殊怪失敗 VIP20 保護正常。

GM：
- 測試 VIP0～20 selector 正常存在。
- refresh 後測試 VIP回0。
- GM 測試不修改正式角色資料。
- 手機副本管理摘要為2×2。

---

# 26. 下一個對話如何接手（標準指令）

> 你正在接手 GitHub `franksky1207/rpg` 的《文明戰線》專案。請先讀 `PROJECT_HANDOFF.md`，但不要把交接檔當成最終真相；**GitHub `main` 的實際程式碼才是唯一真實來源。**
>
> 接手後，先重新讀 `index.html`，確認目前正式 script load order 與 cache-bust，再重新讀本次需求涉及的正式檔案與目前 SHA。不要只靠歷史對話、記憶或舊交接描述判斷。
>
> 修改時優先直接修改正式來源，不要另做 wrapper、fallback、第二套公式、第二套 GM 邏輯或第二套 UI 產生器；如果確認舊程式已完全失效且沒有 consumer，才直接刪除。
>
> 使用者若說「先討論／先不要改／先建議／你覺得如何」，只能分析與建議，**不能寫 GitHub**；若使用者說「做／修改／修正／執行／做吧」，且需求已明確，就可直接修改 GitHub `main`，不需要重複確認。
>
> 修改後必須重新讀修改檔確認內容與 SHA；只要有 `.js` / `.css` 變更，就同步更新 `index.html` 對應 cache-bust `?v=`，再重新讀 `index.html` 驗證。GitHub 寫入成功不代表 Safari／Pages 已真機驗證，除非使用者實際回報，不要宣稱已真機測過。
>
> 截至 2026-09-10：主線平衡、懸賞、競技場、虛空幻境與 VIP0～20 都已暫定完成。VIP 正式固定加成為 **每級 HP/ATK +0.5%、DEF +0.25%、暴擊/閃避 +0.25%**；`state.vipPoints` 是正式 VIP 積分來源；`dungeon.points` 只留相容鏡像；`viprewards.js` 已刪除。除非使用者回報 bug 或新的實測數據，不要自行恢復舊倍率、舊 VIP wrapper、舊副本積分文字或重做已接受平衡。
