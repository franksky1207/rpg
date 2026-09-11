# 《文明戰線》正式跨對話交接文件

> **最高原則：GitHub `main` branch 的實際程式碼永遠是唯一真實來源。**
>
> 本文件只作為跨對話承接層。若本文、歷史對話、記憶、舊規格或舊截圖與 `main` 實際程式碼衝突，**一律以 `main` 為準**。
>
> 本文件於 **2026-09-11** 重新讀取目前 `main` 後更新，已納入本輪完整「專精」系統、戰鬥浮字與戰鬥紀錄、GM 五種測試摘要、GM 專精測試、專精正式來源架構清理、相關 bug 修正，以及最新平衡方向。

---

## 1. 專案基本資料

- 遊戲名稱：**文明戰線**
- Repository：`franksky1207/rpg`
- 正式分支：`main`
- 技術：純前端 HTML / CSS / JavaScript + `localStorage`
- `SAVE_KEY = "frank_text_rpg_save"`
- `SAVE_VERSION = 7`
- `MAX_LEVEL = 100`
- `VIP_MAX_LEVEL = 20`
- `SPECIALIZATION_MAX_LEVEL = 30`
- GM 密碼：`franksky`
- 正式世界：Lv1～100，共20張地圖
- 必須同時支援桌機與手機；使用者會以桌機與 iPhone Safari 真機測試

遊戲定位：**簡單、傳統、文字型 RPG**。

正式主要系統：
- 主線打怪／升級
- 金幣
- 裝備、品質、詞條與評分
- 地圖／Boss 推進
- 怪物特性
- 特殊怪
- 三大副本：懸賞戰、競技場、虛空幻境
- VIP0～20
- 專精8項、Lv0～30
- 商店
- GM 管理與批量測試

目前不要主動加入：職業、技能樹、複雜任務、大量劇情、多角色、PvP、排行榜、登入、每日系統等，除非使用者後續明確要求。

---

## 2. 給下一個 ChatGPT 的操作規範（必讀）

### 2.1 使用者語意

若使用者說：
- 「做」
- 「修改」
- 「修正」
- 「執行」
- 「做吧」
- 「可以」且上下文已明確是在要求執行

→ **可以直接修改 GitHub `main`，不必再要求貼程式碼，也不要重複確認已講清楚的需求。**

若使用者說：
- 「先不要改」
- 「先討論」
- 「先建議」
- 「你覺得如何／你判斷一下」
- 單純回報測試結果但沒有要求修改

→ **只能分析／建議，不得寫入 GitHub。**

### 2.2 每次修改標準流程

1. 修改前先重新讀取 `main` 的相關正式檔案。
2. 同時重新讀 `index.html`，確認實際 script load order 與 cache-bust。
3. 找出目前真正正式來源，以及後載入是否有覆蓋。
4. 優先直接修改正式來源。
5. **不要額外做 wrapper、fallback、alias、第二套公式、第二套 GM 邏輯或第二套 UI 產生器來繞過正式來源。**
6. 舊程式若已失效且無 consumer，應直接刪除或改回正式來源，不要留隱藏覆蓋層。
7. 修改後重新讀取修改檔，確認內容與 SHA。
8. **任何 `.js` / `.css` 修改都必須同步更新 `index.html` 對應 `?v=` cache-bust。**
9. 更新 `index.html` 後再重新讀一次，確認路徑、順序、版本正確。
10. 重要系統、規則、架構變更後同步更新本 `PROJECT_HANDOFF.md`。
11. GitHub 寫入成功不等於 Pages／Safari 已真機驗證；除非使用者實際回報，不可宣稱真機已測。

### 2.3 架構原則

- `main` 是唯一真實來源。
- classic `<script>` load order 是架構的一部分。
- 頂層 `let/const` 可能互撞；獨立模組通常使用 IIFE。
- 不要因舊檔名或舊交接文件存在就假設仍有效；先看 `index.html` 是否載入。
- 主線怪、戰鬥、裝備、VIP、專精、GM 模擬都應共用正式來源，不複製公式。
- 不要為了「看起來漂亮」主動大重構；只有實際 bug、維護性問題或使用者明確要求才整理。

---

## 3. 目前 `index.html` 正式載入順序

截至 2026-09-11 `main`：

```text
data.js
worldmaps-earth.js
worldmaps-solar.js
engine.js
specialization.js
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
combatfx.js
```

目前重要 cache-bust：
- `engine.js?v=20260911-1045-speccleanup`
- `specialization.js?v=20260911-1045-speccleanup`
- `combatcore.js?v=20260911-1045-speccleanup`
- `ui.js?v=20260911-1045-speccleanup`
- `gmtools.js?v=20260911-1045-speccleanup`
- `gearupgrade.js?v=20260911-1045-speccleanup`
- `specialmonsters.js?v=20260911-1045-speccleanup`
- `specialgmbatch.js?v=20260911-1045-speccleanup`
- `dungeongm.js?v=20260911-1045-speccleanup`
- `gmhub.js?v=20260911-1045-speccleanup`
- `dungeonui.js?v=20260911-1045-speccleanup`
- `combatfx.js?v=20260911-0935-fxcleanup`

重要：
- `specialization.js` 現在是**基礎正式模組**，位於 `engine.js` 後、`combatcore.js`／`ui.js` 前。
- 它不再在尾端 wrap `render()`、獎勵函式或出售函式。
- `combatfx.js` 維持最後載入，僅負責 presentation；正式戰鬥仍由 `runCombatCore()` 決定。

已不載入／不應自行恢復：
- `battleflow.js`
- `playername.js`
- `level100.js`
- `worldexpansion.js`
- `uifix.js`
- `specialgm.js`
- `battlelimit.js`
- `risksettlement.js`
- `viprewards.js`

---

## 4. 正式世界與主線

每5級一張地圖；每圖固定：3普通＋1菁英＋1 Boss。

- Lv1～50：地球戰爭，10圖
- Lv51～100：太陽系戰爭，10圖
- 目前正式共20圖、100隻主線怪

未來擴等尚未實作。曾討論可一路延伸到 Lv250 甚至更高；目前公式設計偏線性，保留長期擴充空間。

主線推進：

```text
第1普通擊敗10次
→ 第2普通10次
→ 第3普通10次
→ 菁英10次
→ 角色達該圖最大Lv
→ Boss
```

Boss：
- 首勝解鎖下一地圖並免費刷新商店。
- Boss 戰敗後再挑戰鎖定，需要再擊敗本圖菁英10次。
- Boss 一律單場。

連戰數：
- Lv1：1
- Lv6：5
- Lv11：10
- Lv16：15
- Lv21：20
- Lv26+：25

### 4.1 主線怪正式公式

唯一正式來源：`balance.js`。

```js
HP  = ceil(55 + 24*level)
ATK = ceil(9 + 4.2*level)
DEF = ceil(2.5 + 2.0*level)
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

順序：base → style → stage → traits。

### 4.2 最新平衡方向

目前**不因 VIP／專精出現而回頭強化主線怪**。

定位：
- 主線地圖怪：刷 EXP／金幣／裝備與推進地圖；後期變好打是正常成長回饋。
- 特殊怪：偏額外驚喜／禮物，不要求高壓挑戰。
- 真正挑戰內容以三大副本為主。

不要做「玩家一變強，主線怪同步膨脹」的追趕式平衡。

---

## 5. 玩家、VIP 與裝備能力

### 5.1 玩家無 VIP 基礎

```js
baseHP(l)  = ceil(110 + 12*(l-1))
baseATK(l) = ceil(15 + 2.2*(l-1))
baseDEF(l) = ceil(7 + 1.2*(l-1))
```

- `equippedStats()`：等級基礎＋裝備，不含 VIP。
- `playerCombatStats(baseStats?, vipLevel?)`：在 base snapshot 上再套 VIP，為實戰能力。

玩家 crit／dodge 沒有30%硬上限；怪物有30% cap。

### 5.2 裝備品質

| 品質 | q | 能力倍率 | 出售倍率 |
|---|---:|---:|---:|
| 普通 | 0 | 1.00 | 1.0 |
| 優良 | 1 | 1.15 | 1.4 |
| 稀有 | 2 | 1.35 | 2.0 |
| 史詩 | 3 | 1.60 | 3.2 |
| 傳說 | 4 | 1.95 | 5.0 |
| 神話 | 5 | 2.40 | 8.0 |

神話不可自動出售。

### 5.3 五部位主能力

- 武器：ATK
- 頭盔：HP
- 鎧甲：DEF
- 鞋子：HP
- 飾品：crit

```js
weapon = ceil((3 + 1.55*level) * qualityMultiplier)
helmet = ceil((8 + 2.5*level) * qualityMultiplier)
armor  = ceil((1 + 0.65*level) * qualityMultiplier)
shoes  = ceil((8 + 2.5*level) * qualityMultiplier)
```

飾品主暴擊範圍：
- 普通1～2
- 優良2～3
- 稀有3～5
- 史詩5～7
- 傳說7～9
- 神話9～10

### 5.4 詞條

池：
- 武器：ATK / crit / HP
- 頭盔：HP / DEF / dodge
- 鎧甲：DEF / HP / dodge
- 鞋子：dodge / DEF / HP
- 飾品：crit / ATK / HP / dodge

詞條數：普通0、優良1、稀有1～2、史詩2、傳說2～3、神話3；同件不重複。

```js
ATK affix = ceil((1 + 0.45*level) * m)
DEF affix = ceil((0.5 + 0.20*level) * m)
HP  affix = ceil((3 + 0.9*level) * m)
```

crit／dodge 詞條範圍：普通0、優良1、稀有1～2、史詩2～3、傳說3～4、神話4～5。

### 5.5 裝備評分

```js
rateWeight = 20 + 0.5*itemLevel
score = ATK*5 + DEF*5 + HP + crit*rateWeight + dodge*rateWeight
```

`gearupgrade.js` 是目前正式：
- `addItem()`
- 一鍵裝備較高評分
- 一鍵出售較低／同評分
- 最弱裝備部位判斷

### 5.6 鑑價技巧整合後的出售架構

`item.sell` 永遠保存**基礎售價**，不再為了專精暫時竄改物件。

實際售價統一透過：

```js
specializationSellValue(item, useTestSpecializations=false)
```

正式套用於：
- 自動出售
- 單件出售
- 一鍵出售
- 背包售價顯示
- GM 測試鑑價統計

商店購買價不吃鑑價技巧。

---

## 6. EXP、金幣與滿等

```js
sameExp(l) = ceil(25 + 4*l)
goldBase(l) = ceil(6 + 4*l)
```

EXP 等級差倍率：
- 怪高 ≥5：1.3
- +3～4：1.2
- +1～2：1.1
- 同級：1
- -1～-2：0.9
- -3～-5：0.6
- -6～-10：0.25
- 低超過10：0.05

種類倍率：
- EXP：普通1、菁英2、Boss5
- 金幣：普通1、菁英2.5、Boss6

正式 EXP 曲線由後載入 `level100balance.js`：

```js
x = (level-1)^1.8
mid = 64^1.8
factor = 5 + 195*x/(x+mid)
expNeed(level) = ceil(sameExp(level) * factor)
```

Lv100 不再累積 EXP；主線由 `levelcap.js` 將原 EXP 1:1 轉金幣；特殊獎勵用 `specialExpPayout()`。

### 6.1 專精正式整合

目前不再由 `specialization.js` 後掛 reward wrapper。

正式：

```js
expReward(enemy, useTestSpecializations=false)
goldReward(enemy, useTestSpecializations=false)
```

- EXP 基礎值後直接套「實戰訓練」。
- 怪物直接金幣後直接套「搜刮技巧」。
- GM 測試可傳 `true` 使用測試專精。

特殊怪的 `getSpecialRewardContext(special,useTestSpecializations)` 也直接把：
- 實戰訓練乘入 `expMultiplier`
- 搜刮技巧乘入 `goldMultiplier`

---

## 7. 怪物特性

正式來源：`traits.js -> applyMonsterTraits()`。

7種：
- 強壯：HP +20%
- 兇猛：ATK +15%
- 堅硬：DEF +20%
- 迅捷：dodge +8 個百分點
- 致命：crit +8 個百分點
- 狂暴：HP低於50%時 ATK +20%
- 巨體：HP +30%、ATK +5%、dodge -5 個百分點

主線特性數量：
- 普通：70% 0個／25% 1個／5% 2個
- 菁英：35% 0個／50% 1個／15% 2個
- Boss：15% 0個／55% 1個／30% 2個

套完後怪物 crit／dodge clamp 0～30%。

`traitlock.js`／preview cache 用於固定主線預覽，避免 re-render 洗特性。

懸賞、競技場、虛空也共用 `applyMonsterTraits()`。

---

## 8. VIP 系統

VIP0～20。

```js
vipThreshold(n) = 1000 * n^2
```

`vipLevel` 為曾解鎖的永久最高級；正常遊戲中點數降低不會倒退 VIP。

`state.vipPoints` 是正式積分來源；`state.dungeon.points` 只保留舊資料／舊模組相容鏡像。

### 8.1 固定能力

每 VIP1：
- HP +0.5%
- ATK +0.5%
- DEF +0.25%
- 暴擊 +0.25 個百分點
- 閃避 +0.25 個百分點

VIP20：HP/ATK +10%、DEF +5%、暴擊／閃避 +5%。

正式唯一能力來源：`engine.js -> vipBonusStats()`。

### 8.2 偶數 VIP 特權

- VIP2：主線普通／菁英裝備掉率 +5 個百分點；Boss仍100%
- VIP4：副本 progress ×1.10
- VIP6：符合特殊怪基本資格後遭遇率 8% → 10%
- VIP8：每次成功主線掉落15%優先目前最弱裝備部位
- VIP10：擊敗特殊怪10%機率再取得一套**全新**第二次特殊獎勵
- VIP12：副本 progress 總倍率改為 ×1.20，不是1.10再乘1.10
- VIP14：主線掉裝5%品質 +1
- VIP16：主線 Boss 15%額外執行一次完整掉落
- VIP18：Boss 每件戰利品10%品質 +1
- VIP20：死亡裝備不遺失；EXP死亡懲罰仍照常

VIP8／14／18 的品質／部位流程由正式掉落來源處理；不要建立第二套掉落。

---

## 9. 專精系統（正式完成基準）

正式來源：`specialization.js` + `engine.js` + `combatcore.js` + `gearupgrade.js` + `specialmonsters.js`。

### 9.1 基本規則

- 8項，Lv0～30。
- 使用既有金幣升級。
- 永久保留。
- 無重置、無失敗率、無額外材料、無專精總等級、無技能樹。
- 升到第 `n` 級的內部成本：

```js
1000 * n * n
```

- 每一項 Lv1～30 總花費 9,455,000。
- 全8項總花費 75,640,000。
- **玩家說明不公開成本公式**；只在各卡片顯示「目前下一級實際費用」，讓玩家自行發現價格成長。

### 9.2 八項效果

1. **實戰訓練**：EXP +5%/Lv，Lv30 = +150%。
2. **搜刮技巧**：怪物直接金幣 +5%/Lv，Lv30 = +150%；不影響裝備出售。
3. **鑑價技巧**：裝備出售 +5%/Lv，Lv30 = +150%；不影響怪物金幣或商店購買。
4. **先制技巧**：每場戰鬥第一次玩家主動普通攻擊傷害 +2%/Lv，Lv30 = +60%。每個新敵人重新算一場；連擊／反擊不吃先制。
5. **連擊技巧**：+1 個百分點/ Lv，Lv30 = 30%；觸發追加一次50%普通攻擊傷害；追加攻擊可再次 RNG 連擊，沒有玩法硬上限。
6. **穿透技巧**：+1 個百分點/ Lv，Lv30 = 30%；觸發時該擊忽略敵人25% DEF，即有效 DEF ×0.75；普通／連擊／反擊均可觸發。
7. **反擊技巧**：+1 個百分點/ Lv，Lv30 = 30%；敵人實際命中、造成傷害且玩家存活後，40%普通攻擊傷害反擊。敵人攻擊被閃避或玩家死亡不反擊。反擊可暴擊、穿透、汲取、連擊；不遞迴觸發反擊。
8. **汲取技巧**：+1 個百分點/ Lv，Lv30 = 30%；觸發時回復本擊「實際 HP 傷害」的10%，不超過最大 HP；overkill 以敵人真正失去的 HP 計。普通／連擊／反擊均可觸發。

### 9.3 正式戰鬥順序

普通玩家主動攻擊：

```text
先制 → 穿透 → 暴擊 → 傷害 → 汲取 → 敵人死亡判定 → 連擊
```

連擊：

```text
穿透 → 暴擊 → 傷害 → 汲取 → 死亡判定 → 再次連擊
```

敵人：

```text
玩家閃避 → 敵人傷害 → 玩家死亡判定 → 反擊
```

反擊：

```text
穿透 → 暴擊 → 傷害 → 汲取 → 死亡判定 → 連擊
```

連擊與反擊都不吃先制。

### 9.4 存檔與正式來源整理

現在 `newState()` 直接包含：

```js
specializations:{training:0,scavenge:0,appraisal:0,initiative:0,combo:0,penetration:0,counter:0,drain:0}
```

舊存檔透過 `ensureSpecializationState()`／`normalizeSpecializationState()` 自動補齊並 clamp 0～30。

本輪已移除舊開發階段的 `installEconomyHooks()` 以及對 `render()`／出售／獎勵的 runtime wrapper。

### 9.5 專精 UI

首頁正式順序：

```text
冒險｜角色｜專精｜副本｜背包｜商店｜設定
```

專精頁：
- 頂端顯示目前金幣。
- 有可收合「專精說明」。
- 說明只寫最高 Lv30、使用金幣、永久保留、各技能效果；**不顯示 `1000*n²` 公式**。
- 桌機 4×2。
- 手機 2×4。
- 每張卡：名稱、Lv.X/30、目前效果、固定效果（需要時）、下一級實際費用、升級按鈕。
- 不顯示「下一級效果」。
- Lv30 顯示滿級。
- 金幣不足按鈕 disabled。
- 升級有 confirm，會顯示目標等級與本次消耗。

---

## 10. 共用戰鬥核心與事件

正式：`combatcore.js -> runCombatCore(player,enemy,startHp,options)`。

傷害：

```js
calcDamage(atk,def)
= max(1, ceil((atk - def*0.55) * random(0.95~1.05)))
```

- 暴擊倍率：1.5×
- 最低傷害：1
- 怪物 crit／dodge cap：30%
- 玩家無30%硬 cap
- 狂暴：敵人 HP <50% 時 ATK ×1.20
- 無200回合硬上限

專精五項戰鬥能力全部集中在 `runCombatCore()`。

GM 測試用：

```js
runCombatCore(...,{logs:false,useTestSpecializations:true})
```

事件 `events` 會包含：
- `attack`
- `dodge`
- `combo`
- `counter`
- `drain`
- `berserk`

玩家 attack event 會記錄：
- `source`
- `damage`
- `actualDamage`
- `crit`
- `penetration`
- `initiative`

### 10.1 已修正：Lv0 先制誤事件

舊問題：第一回合即使先制 Lv0，event 的 `initiative` 也可能是 true，導致 UI 跳 `先制！`。

目前：

```js
initiativeApplied = initiative && spec.initiative > 0
```

只有真的套用先制加成才標記 event。

---

## 11. 戰鬥浮字與戰鬥紀錄

正式 presentation：`combatfx.js`，最後載入。

它不改戰鬥公式；`runCombatCore()` 結束時若存在 `prepareCombatPresentation()`，只把結果交給 presentation。

### 11.1 特殊浮字

目前額外浮字只保留真正沒有被既有大字表現的機制：

- 先制！：`#FFD54A`
- 連擊！：`#FF8A3D`
- 穿透！：`#B56CFF`
- 反擊！：`#FF5252`
- 汲取！：`#4CD964`
- 狂暴！：`#FF7043`
- `+XX HP`：`#7CFF8E`

**不再額外跳 `暴擊！`。**

暴擊保留原本戰鬥大字，例如：

```text
暴擊 -XXX
```

**不再額外跳 `閃避！`。**

閃避保留原本戰鬥大字：

```text
閃避
```

但顏色改為冰藍：

```css
#B8F4FF
```

也就是：暴擊／閃避由既有大字負責；六個新機制＋回血才使用額外彩色浮字。

### 11.2 浮字行為

- `.72s` 向上浮動。
- 多個語意事件每85ms錯開。
- 三條水平 lane：31%／50%／69%。
- 狂暴每隻敵人只顯示一次，因 core 只在第一次進入低血狀態時送 event。
- 汲取會先顯示 `汲取！`；若實際有補到 HP，再顯示 `+XX HP`。

### 11.3 戰鬥紀錄

戰鬥畫面下方有預設收合：

```text
戰鬥紀錄
```

- 桌機 scroll max-height：180px
- 手機 `<=760px`：135px
- overflow-y auto
- 內容自動滾到底
- 不新增「專精觸發文字」去污染原本戰鬥 logs；彩色浮字讀 structured events

結果頁也會帶最後一場戰鬥紀錄：
- 主線／特殊怪結果 modal
- 懸賞結果
- 競技場結果
- 虛空最終結果

---

## 12. 主線裝備掉落

正式主線掉落最後來源仍由 `traitdrop.js` 負責。

基礎掉率：
- 普通25%
- 菁英60%
- Boss100%

VIP2 後：普通30%、菁英65%、Boss仍100%。

Lv offset：
- 普通 `[-2,-1,0,0,+1]`
- 菁英 `[-1,0,0,+1]`
- Boss `[-1,0,0,+1,+2]`

品質升階彼此獨立、可連鎖、神話封頂：
- traits：1特性15%、2特性30% → +1
- VIP14：5% → +1
- VIP18：Boss每件10% → +1

VIP8：每次成功掉裝後15%鎖目前最弱裝備部位。

VIP16：主線 Boss 勝利15%多掉1件，第二件重新走完整 `dropItem()`，但不遞迴再觸發 VIP16。

---

## 13. 商店

刷新成本：

```text
100 → 200 → 400 → 800 → 1600 → 3200 → 6400 → 12800
```

- 到12,800後可重置回100，冷卻1小時。
- 買一件商品刷新價格下降1級。
- 首次解鎖新地圖免費刷新。
- 一次3件，不出神話。
- `shopbalance.js` 品質：普通25%、優良40%、稀有25%、史詩8%、傳說2%、神話0%。
- 第1件偏最弱部位、第2件偏次弱、第3件隨機。
- 死亡遺失裝備贖回價 `ceil(item.buy*2)`。
- 鑑價技巧只影響「賣出」，不降低商店購買價或贖回價。

---

## 14. 副本共通與副本進度

副本解鎖：
- 懸賞戰：Lv5
- 競技場：Lv15
- 虛空幻境：Lv25

### 14.1 副本次數進度公式

只有主線勝利增加。

```js
enemyHpPart = (enemyMaxHp / playerBaseHp) * 1.5

damageRate = clamp((startHp-endHp)/playerMaxHp, 0, 1)
damagePart = damageRate * 4

baseProgress = enemyHpPart + damagePart
progress = baseProgress * vipDungeonProgressMultiplier()
```

其中：

```js
playerBaseHp = baseHP(playerLevel)
```

VIP 倍率：
- VIP0～3：×1.00
- VIP4～11：×1.10
- VIP12～20：×1.20

每100 progress → +1副本挑戰次數。

此公式怪物 HP 與玩家 baseHP 都是線性成長，高等不會無限爆炸；先前檢視到 Lv250 時仍不會出現「打一隻直接拿大量副本次數」的情況。

### 14.2 副本 core

`dungeoncore.js`：
- `canStartDungeonRun(cost)`：檢查次數。
- `beginDungeonRun({mode,cost})`：真正開始才扣次數、補滿 HP、建立 active run。
- `finishDungeonRun()`：結束 active run，預設補滿 HP。

競技場與虛空整趟會鎖玩家 snapshot；途中因 VIP 積分升級不改當趟 carry HP。

---

## 15. 懸賞戰

正式：`dungeonbounty.js`。

一次一戰；進 ready 不扣次數，按「開始挑戰」才扣1次。

敵人由無 VIP 的 `equippedStats()` 生成；玩家戰鬥吃當下 VIP＋正式專精。

共同自適應基底：

```js
def = ceil(playerATK * .45)
playerHit = max(1, playerATK - def*.55)
hp = ceil(playerHit*6)
damage = playerHP/8
```

正式 tier：

```text
普通懸賞：weight45，80 VIP積分
HP×1.00，damage×1.00，DEF×.88
crit=.5*player +0 cap10
dodge=.5*player +0 cap8
1 trait

高級懸賞：weight35，120 VIP積分
HP×1.03，damage×1.03，DEF×.90
crit=.7*player +2 cap20
dodge=.7*player +1 cap18
1 trait

危險懸賞：weight20，180 VIP積分
HP×1.08，damage×1.06，DEF×.92
crit=.85*player +3 cap28
dodge=.85*player +2 cap22
50% 1 trait / 50% 2 traits
```

敵人 ATK：

```js
ceil(base.damage * damageMul + playerDEF*.55)
```

勝利只給 VIP 積分，不給一般主線 EXP／gold。

目前強度**先凍結**；未來若最高難度被 VIP＋專精明顯壓平，優先新增「第4難度」，而不是回頭把前三檔全部膨脹。

---

## 16. 競技場

正式：`dungeonarena.js`。

- 普通／困難／極限三難度。
- 三戰連戰，場間不回血。
- 每個新敵人都重新取得一次先制機會。
- 第一戰真正開始才扣1次副本次數。
- 第一戰時鎖：
  - 敵人 scaling snapshot：無 VIP 裝備能力
  - 玩家 snapshot：含開場 VIP
- 中途 VIP 升級不改當趟 snapshot。

積分：
- 普通 `[25,35,120]`，全通180
- 困難 `[35,45,200]`，全通280
- 極限 `[40,60,320]`，全通420

正式 stage config：

```text
normal
1: hp .60 / dmg .57 / def .78 / crit .25+0 cap5 / dodge .20+0 cap4
2: hp .69 / dmg .64 / def .80 / crit .35+0 cap7 / dodge .30+0 cap6
3: hp .78 / dmg .73 / def .82 / crit .45+0 cap9 / dodge .40+0 cap8

hard
1: hp .64 / dmg .57 / def .80 / crit .40+0 cap8 / dodge .35+0 cap7
2: hp .70 / dmg .63 / def .83 / crit .55+1 cap12 / dodge .50+1 cap10
3: hp .78 / dmg .70 / def .85 / crit .70+2 cap16 / dodge .65+1 cap14

extreme
1: hp .63 / dmg .56 / def .80 / crit .55+1 cap12 / dodge .50+1 cap10
2: hp .70 / dmg .61 / def .83 / crit .75+2 cap18 / dodge .70+1 cap15
3: hp .80 / dmg .69 / def .86 / crit .90+3 cap23 / dodge .85+2 cap20
```

目前強度先凍結；若未來最高難度失去挑戰性，可新增第4難度，不回頭重做既有三檔。

---

## 17. 虛空幻境

正式：`dungeonvoid.js` + `dungeonvoidui.js`。

定位：無限爬塔，本身就是長期挑戰內容，所以不需要因 VIP／專精而額外加固定「第4難度」。玩家變強只會爬得更高。

- Lv25 解鎖。
- 從 `highestCleared + 1` 開始。
- 進入 ready 不扣次數；第一層真正開打才扣1次。
- 整趟鎖玩家 snapshot。
- 每層開始前補滿該 snapshot HP。
- 一般層1個隨機 trait。
- 每10層 Boss，2個不同 traits。
- 只有新的最高樓層首通給 VIP 積分。

固定樓層公式：

```js
equivalentPower = 24 + floor/10
HP  = ceil((62 + 16.2*equivalentPower) * 2.40)
ATK = ceil((10.5 + 2.45*equivalentPower) * 2.15)
DEF = ceil((3.2 + 0.92*equivalentPower) * 2.65)
crit = 10
dodge = 8
```

首通積分：

```js
points = round(15 + 1.75*sqrt(floor-1))
Boss floor => points * 2
```

---

## 18. 特殊怪

基礎遭遇率：

```js
SPECIAL_ENCOUNTER_RATE = 0.08
```

VIP6 後、符合原本 eligibility 才變10%。

特殊遭遇 eligibility：
- Boss 不觸發。
- 玩家不可高主線怪10級以上。
- 當前 HP 至少30%。
- 通過 encounter roll 後才詢問挑戰／略過。

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

敵人自適應 base 仍用無 VIP snapshot，正式玩家戰鬥用 VIP＋專精。

正式 tier：

```text
low: hp .55 / atk .45 / def .55
crit scale .25 cap5 / dodge scale .30 cap5

mid: hp 1.00 / atk 1.15 / def .86
crit scale .90 +7 cap27 / dodge scale .90 +4.5 cap23

high: hp 1.05 / atk 1.22 / def .90
crit scale 1 +8 cap30 / dodge scale 1 +5 cap25
```

特殊獎勵 context 現在正式直接整合：
- 實戰訓練 EXP 倍率
- 搜刮技巧 gold 倍率

VIP10 第二次獎勵會重新建立 fresh context，不複製第一次 random result。

最新定位：特殊怪偏「禮物／驚喜」，目前不因 VIP／專精再刻意補強。

---

## 19. GM 管理／測試

設定頁連點「設定」標題3次 → GM 密碼 modal → `franksky`。

正式 GM UI：`gmhub.js`，分：
- 管理
- 測試

### 19.1 管理

一般管理：
- 指定角色等級
- 指定金幣
- 指定世界解鎖進度
- 補滿 HP
- 清空背包
- 商店刷新／重置
- 產生指定品質／Lv／部位裝備

專精管理：
- 8項正式專精各自 Lv0～30 select
- 套用後寫入正式存檔

副本／VIP 管理：
- 副本 progress
- 副本可挑戰次數
- VIP 積分
- 重置 VIP 等級＋積分

### 19.2 runtime 測試 VIP

`vipgm.js`：
- `window.gmTestVipLevel`：VIP0～20
- 只存在目前頁面 session runtime
- 不寫正式角色存檔
- refresh 後回 VIP0

VIP label 例：

```text
VIP10｜HP/ATK +5%｜DEF +2.5%｜暴擊/閃避 +2.5%
```

### 19.3 runtime 測試專精

`window.gmTestSpecializations`：8項 Lv0～30。

- 只存在目前 runtime。
- 不寫正式角色資料。
- refresh 後全回 Lv0。
- GM 測試頁會顯示前三項經濟效果摘要：EXP／怪物金幣／裝備售價。

### 19.4 五種正式測試

GM「測試」目前有：
1. 特殊怪
2. 地圖怪
3. 懸賞戰
4. 競技場
5. 虛空幻境

五種結果摘要統一使用三行：

```text
第1行：測試名稱＋次數／方式
第2行：VIP
第3行：專精
```

第三行固定顯示後五項戰鬥專精：

```text
專精｜先制傷害 +X%｜連擊率 X%｜穿透率 X%｜反擊率 X%｜汲取率 X%
```

前三項經濟專精不塞進戰鬥摘要第3行，避免 UI 過度擁擠；它們在專精測試控制區另有「測試效果」摘要。

手機版三行可自然換行；不再把測試名稱、VIP、次數、專精全部硬塞進一行。

### 19.5 GM 經濟專精已修正

舊問題：GM 後五項戰鬥專精會正確使用測試值，但前三項經濟專精曾仍讀正式角色值。

目前已修正：
- 地圖怪 EXP：`expReward(enemy,true)`
- 地圖怪 gold：`goldReward(enemy,true)`
- 地圖怪掉落售價統計：`specializationSellValue(item,true)`
- 特殊怪 reward context：`getSpecialRewardContext(special,true)`
- 特殊怪掉落 auto-sell：`addItem(item,{useTestSpecializations:true})`
- 特殊怪售價統計：測試鑑價值

GM sandbox 不應污染正式角色資料。

### 19.6 GM 手機 UI

副本管理摘要手機 `<=760px` 為2×2：
- 副本進度
- 可挑戰次數
- VIP 等級
- VIP 積分

避免原本一整串 slash 在 iPhone 上亂斷行。

---

## 20. 本輪專精完成後的重要架構清理／bug 修正

### 20.1 移除專精 economy wrappers

舊開發階段 `specialization.js` 會 wrap：
- `expReward`
- `goldReward`
- `getSpecialRewardContext`
- `addItem`
- `sellLowerAll`
- `sellSelected`
- `inventoryContent`

目前已全部整理回正式來源；`specialization.js` 不再用 `installEconomyHooks()`。

### 20.2 移除暫時竄改 `item.sell`

舊實作會暫時改 `item.sell`，呼叫既有出售函式後再 restore。

目前已刪除此方式，正式售價一律用 `specializationSellValue()` 直接算。

### 20.3 專精正式進入 state schema

新角色直接有完整8項專精；舊存檔會自動補齊，不需清檔。

### 20.4 專精頁正式進入 `ui.js` render

目前 `ui.js` 正式 render map 含：

```js
specialization:specializationPage
```

首頁「專精」也直接是正式 menu card。

舊 `specialization.js` 的：
- `arrangeHomeMenu()`
- `makeHomeCard()`
- `render` wrapper

已移除。

### 20.5 副本首頁卡重複風險已處理

因 `ui.js` 已正式有「副本」卡，`dungeonui.js` 已調整避免再額外插入第二張副本卡。

### 20.6 專精 GM section 正式併入 `gmhub.js`

舊 `injectGmSection()` DOM 後插方式已移除；管理／測試直接由 `gmhub.js` 正式產生。

### 20.7 Lv0 先制浮字 bug 已修

見第10.1節。

### 20.8 暴擊／閃避重複浮字已清理

- 額外 `暴擊！` 已刪。
- 額外 `閃避！` 已刪。
- 閃避原生大字改冰藍。

---

## 21. 最新整體平衡哲學

目前正式方向：

```text
主線 = 成長、刷資源、刷裝備
特殊怪 = 額外驚喜／禮物
副本 = 挑戰
```

因此：
- 主線怪目前不因 VIP／專精再補強。
- 特殊怪目前不因 VIP／專精再補強。
- 懸賞／競技場最高難度若未來過於簡單，優先新增第4難度，而不是回調舊三檔。
- 虛空本來無限，不需補固定難度；玩家變強只會爬更高。

這個方向是目前接受的設計原則，除非使用者未來明確改變。

---

## 22. 目前仍有正式責任、不要誤刪的後載入層

- `balance.js`：主線怪正式平衡。
- `level100balance.js`：正式 EXP 曲線。
- `traits.js`：怪物特性核心。
- `traitlock.js`：主線預覽 traits 固定。
- `traitdrop.js`：主線掉裝＋VIP掉落特權。
- `shopbalance.js`：商店品質／部位邏輯。
- `gearupgrade.js`：正式 `addItem()`、評分、一鍵裝備、一鍵出售。
- `levelcap.js`：Lv100 EXP 轉 gold。
- `levelcapresult.js`：滿等結算顯示。
- `dungeonui.js`：副本首頁／route／冒險側副本狀態。
- `dungeonvoidui.js`：虛空正式 UI／動畫。
- `vipui.js`：VIP card／modal／事件提示。
- `vipgm.js`：runtime test VIP。
- `gmhub.js`：GM 正式 UI 與五測試共用摘要。
- `dungeongm.js`／`specialgmbatch.js`：批量模擬。
- `combatfx.js`：戰鬥浮字＋戰鬥紀錄 presentation。

沒有使用者需求時，不要為了「核心化」全部搬檔。

---

## 23. 尚未完成／未來可能事項

1. **Lv101+ 世界擴充尚未實作。** 過去規劃過銀河系戰爭，也討論過長期可延伸至 Lv250；目前 `MAX_LEVEL` 仍是100，20張正式地圖。
2. **跨裝置雲端存檔尚未做。** 目前只有 localStorage，手機與桌機不能自動共用進度。
3. 目前沒有登入、Firebase、Google 試算表正式存檔、排行榜、多人系統。
4. 懸賞／競技場第4難度只是未來備案，**尚未實作，也不是目前待辦必做**。
5. 部分 CSS 仍由 JS 動態注入；目前正常，是否搬回 `style.css` 屬可選維護整理，不是功能 bug。
6. 專精系統目前視為完成／封版狀態；後續除真機 bug、數值實測明顯異常或使用者新需求外，不主動改平衡。
7. 本次 handoff 更新本身沒有做任何其他功能改動，也沒有宣稱 Pages／iPhone Safari 已完成回歸測試。

---

## 24. 回歸驗證重點

### 專精
- 舊存檔8項專精完整保留／補齊。
- 新存檔8項預設 Lv0。
- 專精說明不出現成本公式。
- 卡片仍顯示下一級實際價格。
- 首頁順序只有一張專精、一張副本卡。
- 單賣／一鍵賣／自動賣／背包顯示售價皆吃鑑價且一致。

### 戰鬥
- 先制 Lv0 不顯示 `先制！`。
- 先制 Lv1+ 第一個主動普通攻擊會套用且顯示。
- 連擊可連續 RNG，不硬限制鏈長。
- 反擊不遞迴，但可再連擊。
- 汲取 overkill 以 actualDamage 算。
- 暴擊沒有額外 `暴擊！`。
- 閃避沒有額外 `閃避！`，原生 `閃避` 是冰藍。
- 六個機制浮字顏色不變。
- 戰鬥紀錄預設收合且手機高度正常。

### GM
- 特殊怪／地圖怪／懸賞／競技場／虛空結果都是三行摘要。
- VIP 與後五專精摘要對應本次測試設定。
- 地圖怪前三經濟專精真的改變 EXP／gold／總售價統計。
- 特殊怪前三經濟專精真的改變 reward／售價統計。
- GM 測試不污染正式 state。

### 副本
- 懸賞 ready 不扣次數，開始才扣。
- 競技場第一戰開始才扣；三戰不回血；每個新敵人有一次先制。
- 虛空第一層真正開打才扣；每層滿血；整趟 snapshot 鎖定。

---

# 25. 下一個對話如何接手（標準指令）

> 你正在接手 GitHub `franksky1207/rpg` 的《文明戰線》專案。請先讀 `PROJECT_HANDOFF.md`，但不要把交接檔當成最終真相；**GitHub `main` 的實際程式碼才是唯一真實來源。**
>
> 接手後先重新讀 `index.html`，確認目前正式 script load order 與 cache-bust，再重新讀本次需求涉及的正式檔案與目前 SHA。不要只靠歷史對話、記憶或舊交接描述判斷。
>
> 修改時優先直接修改正式來源，不要另做 wrapper、fallback、第二套公式、第二套 GM 邏輯或第二套 UI 產生器；若確認舊程式已完全失效且沒有 consumer，直接刪除或改回正式來源。
>
> 使用者若說「先討論／先不要改／先建議／你覺得如何／你判斷一下」，只能分析與建議，**不能寫 GitHub**；若使用者說「做／修改／修正／執行／做吧」，且需求已明確，就可以直接修改 GitHub `main`，不需要重複確認。
>
> 修改後必須重新讀修改檔確認內容與 SHA；只要有 `.js` / `.css` 變更，就同步更新 `index.html` 對應 cache-bust `?v=`，再重新讀 `index.html` 驗證。GitHub 寫入成功不代表 Safari／Pages 已真機驗證，除非使用者實際回報，不要宣稱已真機測過。
>
> 截至 2026-09-11：主線 Lv1～100、VIP0～20、專精8項 Lv0～30、懸賞、競技場、虛空、特殊怪與 GM 五種測試均已正式整合。最新平衡原則是「主線刷成長與資源、特殊怪當驚喜、副本負責挑戰」；不要因 VIP／專精變強就自行回頭膨脹主線怪或特殊怪。專精已完成正式來源清理，不要恢復 `specialization.js` 的舊 economy／render wrappers。