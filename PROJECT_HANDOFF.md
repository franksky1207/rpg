# 《文明戰線》正式跨對話交接文件

> **最高原則：GitHub `main` branch 的實際程式碼永遠是唯一真實來源。**
>
> 本文件只作為跨對話承接層。若本文、歷史對話、記憶、舊規格或舊截圖與 `main` 實際程式碼衝突，**一律以 `main` 為準**。
>
> 本文件於 **2026-09-11** 重新整理，已納入：完整專精、VIP、副本、特殊怪、遊戲說明頁、玩家端取消戰鬥紀錄、競技場自動三連戰，以及最近正式來源清理。

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
- 必須同時支援桌機與手機，主要真機測試包含 iPhone Safari

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
- 專精8項 Lv0～30
- 商店
- 遊戲說明
- 本機存檔＋匯出／匯入
- GM 管理與批量測試

目前不要主動加入：職業、技能樹、複雜任務、大量劇情、多角色、PvP、排行榜、登入、每日系統等，除非使用者後續明確要求。

---

## 2. 修改與承接規範

### 2.1 使用者語意

若使用者說「做／修改／修正／執行／做吧／可以」且上下文已明確要求執行：

→ 可以直接修改 GitHub `main`，不必重複確認。

若使用者說「先不要改／先討論／先建議／你覺得如何／你判斷一下」：

→ 只能分析與建議，不得寫入 GitHub。

### 2.2 每次修改標準流程

1. 先重新讀取 `main` 的相關正式檔案。
2. 同時重新讀 `index.html`，確認正式載入順序與 cache-bust。
3. 找出目前真正正式來源，以及後載入是否有覆蓋。
4. 優先直接修改正式來源。
5. 不要額外做 wrapper、fallback、alias、第二套公式、第二套 GM 邏輯或第二套 UI 產生器。
6. 舊程式若已失效且無 consumer，直接刪除或整理回正式來源。
7. 修改後重新讀取修改檔，確認內容與 SHA。
8. 任何 `.js` / `.css` 修改都同步更新 `index.html` 對應 `?v=` cache-bust。
9. 重要規則或架構變更後同步更新本文件。
10. GitHub 寫入成功不代表 Pages／Safari 已真機驗證；除非使用者實際回報，不可宣稱真機已測。

### 2.3 架構原則

- `main` 是唯一真實來源。
- classic `<script>` load order 是架構的一部分。
- 獨立模組通常使用 IIFE，避免頂層 `let/const` 互撞。
- 不要因舊檔名存在就假設仍有效；先看 `index.html` 是否載入。
- 主線怪、戰鬥、裝備、VIP、專精、GM 模擬都應共用正式來源，不複製公式。
- 不要為了「程式看起來漂亮」主動大重構；只有實際 bug、維護性問題或使用者明確要求才整理。

---

## 3. `index.html` 正式載入順序

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
gameguide.js
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

目前關鍵 cache-bust：
- `gameguide.js?v=20260911-1435-arenaauto`
- `ui.js?v=20260911-1335-guidecopy`
- `dungeonarena.js?v=20260911-1455-arenacleanup`
- `combatfx.js?v=20260911-1415-nobattlelog`

重要：
- `gameguide.js` 必須在 `ui.js` 前載入，因 `ui.js` render map 直接使用 `gameGuidePage()`。
- `combatfx.js` 維持最後載入，只負責 presentation，不改戰鬥公式。

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

## 4. 主線世界與推進

每5級一張地圖；每圖固定：3普通＋1菁英＋1 Boss。

- Lv1～50：地球戰爭，10圖
- Lv51～100：太陽系戰爭，10圖
- 正式共20圖、100隻主線怪

推進：

```text
第1普通擊敗10次
→ 第2普通10次
→ 第3普通10次
→ 菁英10次
→ 角色達該圖最高等級
→ Boss
```

Boss：
- 首勝解鎖下一張地圖並免費刷新商店。
- Boss 戰敗後鎖定，需要再擊敗本圖菁英10次。
- Boss 固定單場。

連戰：
- Lv1：1
- Lv6：5
- Lv11：10
- Lv16：15
- Lv21：20
- Lv26+：25

主線怪正式來源：`balance.js`。

```js
HP  = ceil(55 + 24*level)
ATK = ceil(9 + 4.2*level)
DEF = ceil(2.5 + 2.0*level)
```

style：
- `tank`：HP ×1.15、ATK ×0.95
- `attack`：HP ×0.92、ATK ×1.10

stage：
- 第1普通：HP1.22 / ATK1.17 / DEF1.10
- 第2普通：HP1.31 / ATK1.24 / DEF1.14
- 第3普通：HP1.34 / ATK1.28 / DEF1.15
- 菁英：HP1.39 / ATK1.29 / DEF1.17
- Boss：HP1.44 / ATK1.27 / DEF1.17

順序：base → style → stage → traits。

---

## 5. 玩家、裝備與經濟

### 5.1 玩家無 VIP 基礎

```js
baseHP(l)  = ceil(110 + 12*(l-1))
baseATK(l) = ceil(15 + 2.2*(l-1))
baseDEF(l) = ceil(7 + 1.2*(l-1))
```

- `equippedStats()`：等級基礎＋裝備，不含 VIP。
- `playerCombatStats(baseStats?, vipLevel?)`：在 base snapshot 上套 VIP。
- 玩家 crit／dodge 無30%硬 cap；怪物有30% cap。

### 5.2 裝備品質

品質：普通、優良、稀有、史詩、傳說、神話。

能力倍率：

```text
1.00 / 1.15 / 1.35 / 1.60 / 1.95 / 2.40
```

出售倍率：

```text
1.0 / 1.4 / 2.0 / 3.2 / 5.0 / 8.0
```

神話不可自動出售。

五部位主能力：
- 武器：ATK
- 頭盔：HP
- 鎧甲：DEF
- 鞋子：HP
- 飾品：crit

### 5.3 裝備評分

```js
rateWeight = 20 + 0.5*itemLevel
score = ATK*5 + DEF*5 + HP + crit*rateWeight + dodge*rateWeight
```

`gearupgrade.js` 正式負責：
- `addItem()`
- 一鍵裝備較高評分
- 一鍵出售較低／同評分
- 最弱裝備部位判斷

### 5.4 鑑價技巧出售架構

`item.sell` 永遠保存基礎售價。

實際售價統一：

```js
specializationSellValue(item, useTestSpecializations=false)
```

套用於自動出售、單件出售、一鍵出售、背包售價顯示與 GM 測試。

商店購買價與贖回價不吃鑑價技巧。

---

## 6. EXP、金幣與 Lv100

```js
sameExp(l) = ceil(25 + 4*l)
goldBase(l) = ceil(6 + 4*l)
```

正式 EXP 曲線由 `level100balance.js`：

```js
x = (level-1)^1.8
mid = 64^1.8
factor = 5 + 195*x/(x+mid)
expNeed(level) = ceil(sameExp(level) * factor)
```

Lv100 為**目前版本上限**，不是永久世界終點。

在下一等級階段開放前：
- Lv100 不再累積 EXP。
- 主線由 `levelcap.js` 將原 EXP 1:1 轉金幣。
- 特殊獎勵走 `specialExpPayout()`。

專精經濟正式來源：

```js
expReward(enemy, useTestSpecializations=false)
goldReward(enemy, useTestSpecializations=false)
```

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

`traitlock.js` 用於固定主線預覽 traits，避免 re-render 洗特性。

---

## 8. VIP 系統

VIP0～20。

```js
vipThreshold(n) = 1000 * n^2
```

`vipLevel` 為曾解鎖的永久最高級；正常遊戲中點數下降不會倒退 VIP。

每 VIP1：
- HP +0.5%
- ATK +0.5%
- DEF +0.25%
- 暴擊 +0.25 個百分點
- 閃避 +0.25 個百分點

偶數特權：
- VIP2：普通／菁英主線掉裝率 +5 個百分點
- VIP4：副本進度 ×1.10
- VIP6：特殊怪基本遭遇率 8% → 10%
- VIP8：主線掉裝15%優先目前最弱部位
- VIP10：特殊怪10%機率再取得一套全新第二次獎勵
- VIP12：副本進度總倍率 ×1.20
- VIP14：主線掉裝5%品質 +1
- VIP16：Boss 15%額外再掉1件
- VIP18：Boss 每件戰利品10%品質 +1
- VIP20：死亡不遺失裝備；EXP懲罰仍存在

VIP 能力唯一來源：`engine.js -> vipBonusStats()`。

---

## 9. 專精系統

8項，Lv0～30，使用金幣升級，永久保留，無重置、無失敗率、無材料。

內部成本：

```js
1000 * n * n
```

玩家說明不公開成本公式，只顯示下一級實際費用。

效果：
1. 實戰訓練：EXP +5%/Lv
2. 搜刮技巧：怪物直接金幣 +5%/Lv
3. 鑑價技巧：裝備出售 +5%/Lv
4. 先制技巧：每場第一次主動普通攻擊傷害 +2%/Lv
5. 連擊技巧：+1 個百分點/Lv；追加50%普通攻擊傷害；可再次連擊
6. 穿透技巧：+1 個百分點/Lv；忽略25% DEF
7. 反擊技巧：+1 個百分點/Lv；40%普通攻擊傷害反擊；可暴擊／穿透／汲取／連擊，不遞迴反擊
8. 汲取技巧：+1 個百分點/Lv；回復實際 HP 傷害10%

正式戰鬥順序：

```text
主動普通：先制 → 穿透 → 暴擊 → 傷害 → 汲取 → 死亡判定 → 連擊
連擊：穿透 → 暴擊 → 傷害 → 汲取 → 死亡判定 → 再次連擊
敵人：玩家閃避 → 敵人傷害 → 玩家死亡判定 → 反擊
反擊：穿透 → 暴擊 → 傷害 → 汲取 → 死亡判定 → 連擊
```

`specialization.js` 不再用舊 economy／render wrappers。

---

## 10. 共用戰鬥核心與 presentation

正式核心：

```js
runCombatCore(player,enemy,startHp,options)
```

傷害：

```js
calcDamage(atk,def)
= max(1, ceil((atk - def*0.55) * random(0.95~1.05)))
```

- 暴擊倍率 1.5×
- 最低傷害 1
- 怪物 crit／dodge cap 30%
- 玩家無30%硬 cap
- 狂暴：敵人 HP <50% 時 ATK ×1.20
- 無200回合硬上限

structured events 包含：
- `attack`
- `dodge`
- `combo`
- `counter`
- `drain`
- `berserk`

`combatfx.js` 只負責即時浮字：
- 先制！
- 連擊！
- 穿透！
- 反擊！
- 汲取！
- 狂暴！
- `+XX HP`

暴擊與閃避沿用原本大字；閃避為冰藍。

### 10.1 玩家端戰鬥紀錄已正式取消

目前玩家端：
- 戰鬥畫面底部**不再顯示戰鬥紀錄**。
- 主線／特殊怪結果頁不附戰鬥紀錄。
- 懸賞／競技場／虛空結果頁不附戰鬥紀錄。
- 遊戲說明也已刪除「戰鬥紀錄」條目。

注意：**底層 `logs` 尚不可直接刪除。**

目前懸賞與競技場動畫仍會讀 `result.logs` 逐行播放傷害；GM 模擬則可用 `{logs:false}`。未來若要全面改成 structured events presentation，應另做完整重構，不要直接關掉 logs。

---

## 11. 商店

刷新成本：

```text
100 → 200 → 400 → 800 → 1600 → 3200 → 6400 → 12800
```

- 到12,800後可重置回100，冷卻1小時。
- 買一件商品刷新價格下降1級。
- 首次解鎖新地圖免費刷新。
- 一次3件，不出神話。
- 品質：普通25%、優良40%、稀有25%、史詩8%、傳說2%、神話0%。
- 死亡遺失裝備贖回價 `ceil(item.buy*2)`。

---

## 12. 副本共通

解鎖：
- 懸賞戰：Lv5
- 競技場：Lv15
- 虛空幻境：Lv25

只有主線勝利增加副本進度。

```js
enemyHpPart = (enemyMaxHp / playerBaseHp) * 1.5
damageRate = clamp((startHp-endHp)/playerMaxHp, 0, 1)
damagePart = damageRate * 4
baseProgress = enemyHpPart + damagePart
progress = baseProgress * vipDungeonProgressMultiplier()
```

VIP 倍率：
- VIP0～3：×1.00
- VIP4～11：×1.10
- VIP12～20：×1.20

每100 progress → +1副本挑戰次數。

`dungeoncore.js`：
- `canStartDungeonRun(cost)`
- `beginDungeonRun({mode,cost})`
- `finishDungeonRun()`

---

## 13. 懸賞戰

正式：`dungeonbounty.js`。

- 單場挑戰。
- 進 ready 不扣次數；按「開始挑戰」才扣1次。
- 普通／高級／危險三難度。
- 勝利只給 VIP 積分，不給一般主線 EXP／gold。
- 敵人由無 VIP 的裝備 snapshot 生成；玩家吃當下 VIP＋專精。

積分：
- 普通 80
- 高級 120
- 危險 180

目前強度先凍結；未來若最高難度被壓平，優先新增第4難度，不回頭膨脹前三檔。

---

## 14. 競技場

正式：`dungeonarena.js`。

三難度：普通／困難／極限。

### 14.1 正式玩家流程

```text
選擇難度
→ 進入三戰確認頁
→ 按「開始三戰」才扣1次副本次數
→ 第一戰自動開始
→ 第一戰勝利後自動進第二戰
→ 第二戰勝利後自動進第三戰
→ 三戰全勝或任一戰失敗
→ 一次最終結算
```

**中間不再出現「開始第二戰／開始第三戰」按鈕。**

規則：
- 三戰場間不回血。
- 每個新敵人重新取得一次先制機會。
- 任一戰失敗立刻結束整趟。
- 每戰勝利立即取得該戰 VIP 積分。
- 開始時鎖敵人 scaling snapshot（無 VIP 裝備能力）。
- 開始時鎖玩家 snapshot（含開場 VIP）。
- 中途因積分升 VIP 不改當趟 snapshot。

積分：
- 普通 `[25,35,120]`，全通180
- 困難 `[35,45,200]`，全通280
- 極限 `[40,60,320]`，全通420

### 14.2 最近清理

競技場改為自動三連戰後，已移除舊逐戰流程留下的：
- `runStarted`
- `startHp`
- `playerMaxHp` state 欄位
- `window.runArenaStage` 相容 alias

目前 `arenaState` 只保留真正跨畫面需要的狀態；每戰 `startHp`／`playerMax` 改為執行時區域變數。

---

## 15. 虛空幻境

正式：`dungeonvoid.js` + `dungeonvoidui.js`。

- Lv25 解鎖。
- 從 `highestCleared + 1` 開始。
- 第一層真正開打才扣1次。
- 整趟鎖玩家 snapshot。
- 每層開始前補滿該 snapshot HP。
- 一般層1個隨機 trait。
- 每10層 Boss，2個不同 traits。
- 只有新的最高樓層首通給 VIP 積分。
- 可要求「本層結束後退出」。

固定樓層公式：

```js
equivalentPower = 24 + floor/10
HP  = ceil((62 + 16.2*equivalentPower) * 2.40)
ATK = ceil((10.5 + 2.45*equivalentPower) * 2.15)
DEF = ceil((3.2 + 0.92*equivalentPower) * 2.65)
crit = 10
dodge = 8
```

---

## 16. 特殊怪

基礎遭遇率 8%；VIP6 後 10%。

基本 eligibility：
- Boss 不觸發。
- 玩家不可高主線怪10級以上。
- 當前 HP 至少30%。
- 主線勝利後才有機會出現。
- 特殊怪出現時會中止目前主線連戰。
- 玩家可挑戰或略過。

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

特殊怪定位：額外驚喜／禮物，不因 VIP／專精再刻意補強。

---

## 17. 遊戲說明頁

正式來源：
- `gameguide.js`
- `guide.css`
- `ui.js` route：`guide:gameGuidePage`

首頁順序目前正式為：

```text
冒險｜角色｜專精｜副本｜背包｜商店｜遊戲說明｜設定
```

首頁「遊戲說明」副標：

```text
查看玩法與規則
```

說明頁標題下方：

```text
查看玩法、系統、戰鬥與各項規則。
```

6 大分類：
- 冒險入門
- 角色與裝備
- 戰鬥與怪物
- 特殊怪
- 副本與 VIP
- 成長與功能

呈現方式：
- 桌機：左側分類＋右側內容。
- 手機：上方橫向滑動分類＋下方內容。
- 分類內**全部直接展開顯示**，不使用 `＋／－` 收合。

玩家說明原則：
- 公開玩家操作需要知道的規則與數字。
- 不公開傷害公式、掉落 RNG 內部表、專精成本公式等內部計算。

目前說明已包含：
- Boss 等級條件
- 特殊怪會中止主線連戰
- 本機存檔可匯出／匯入
- Lv100 是目前版本上限，下一階段未開放前 EXP 轉金幣
- 競技場開始後自動完成三連戰
- 不再包含「戰鬥紀錄」說明

---

## 18. 本機存檔

目前使用瀏覽器 `localStorage` 自動存檔。

玩家可以：
- 匯出存檔
- 匯入存檔

目前不支援：
- 帳號登入
- 雲端同步
- 手機與電腦自動共用進度

不要清除網站資料，否則本機存檔可能一併消失。

---

## 19. GM 管理與測試

設定頁連點「設定」標題3次 → GM 密碼 modal → `franksky`。

正式 GM UI：`gmhub.js`。

管理：
- 等級
- 金幣
- 世界解鎖
- HP
- 背包
- 商店
- 指定裝備
- 8項專精
- 副本 progress／次數
- VIP 積分與重置

runtime 測試 VIP：`window.gmTestVipLevel`。

runtime 測試專精：`window.gmTestSpecializations`。

五種正式測試：
1. 特殊怪
2. 地圖怪
3. 懸賞戰
4. 競技場
5. 虛空幻境

GM 測試不應污染正式 state。

---

## 20. 最新整體平衡哲學

```text
主線 = 成長、刷資源、刷裝備
特殊怪 = 額外驚喜／禮物
副本 = 挑戰
```

因此：
- 主線怪目前不因 VIP／專精再補強。
- 特殊怪目前不因 VIP／專精再補強。
- 懸賞／競技場最高難度若未來過於簡單，優先新增第4難度，而不是回調舊三檔。
- 虛空本來無限，玩家變強只會爬更高。

---

## 21. 目前仍有正式責任、不要誤刪的檔案

- `balance.js`：主線怪平衡
- `level100balance.js`：EXP 曲線
- `traits.js`：怪物特性核心
- `traitlock.js`：主線預覽 traits 固定
- `traitdrop.js`：主線掉裝＋VIP掉落特權
- `shopbalance.js`：商店品質／部位
- `gearupgrade.js`：`addItem()`、評分、一鍵裝備／出售
- `levelcap.js`：Lv100 EXP 轉 gold
- `levelcapresult.js`：滿等結算顯示
- `dungeonui.js`：副本首頁／route
- `dungeonvoidui.js`：虛空 UI／動畫
- `vipui.js`：VIP UI
- `vipgm.js`：runtime test VIP
- `gmhub.js`：GM UI
- `dungeongm.js`／`specialgmbatch.js`：批量模擬
- `gameguide.js`：玩家說明內容
- `guide.css`：玩家說明版型
- `combatfx.js`：特殊戰鬥浮字 presentation

注意：`combatfx.js` **現在不再負責玩家戰鬥紀錄 UI**。

---

## 22. 未來可能事項

1. Lv101+ 世界尚未實作；目前 `MAX_LEVEL=100`。
2. 跨裝置雲端存檔尚未做。
3. 沒有登入、Firebase、Google 試算表正式存檔、排行榜、多人系統。
4. 懸賞／競技場第4難度只是未來備案，不是目前必做。
5. 部分 CSS 仍由 JS 動態注入；目前正常，搬回 `style.css` 屬可選維護整理。
6. 戰鬥動畫目前仍有部分模式解析 `logs`；未來可考慮全面改用 structured events，但這是大重構，沒有需求不要主動做。

---

## 23. 回歸驗證重點

### 主線／說明
- 首頁只有一張「遊戲說明」卡，位置在設定前。
- 說明頁六分類切換正常。
- 手機分類列可橫向滑動。
- 分類內直接顯示，不出現 `＋／－`。
- Lv100 說明使用「下一等級階段開放前」。
- 本機存檔說明含匯出／匯入。
- 特殊遭遇說明含「觸發時中止目前連戰」。

### 戰鬥
- 玩家端完全不顯示戰鬥紀錄。
- 即時傷害字、暴擊、閃避與特殊彩色浮字正常。
- 先制 Lv0 不顯示 `先制！`。
- 反擊不遞迴，但可再連擊。
- 汲取 overkill 以 actualDamage 計算。

### 副本
- 懸賞 ready 不扣次數，開始才扣。
- 競技場選難度後只有一次「開始三戰」。
- 競技場第一戰開始才扣1次。
- 競技場第一戰勝利後自動進第二戰，第二戰勝利後自動進第三戰。
- 競技場三戰不回血，每個新敵人重新取得一次先制。
- 競技場任一戰失敗後直接最終結算。
- 虛空第一層真正開打才扣；每層滿血；整趟 snapshot 鎖定。

### GM
- 五種測試可正常執行。
- runtime VIP／專精不污染正式資料。
- 競技場批量測試仍是完整三連戰。

---

# 24. 下一個對話標準接手指令

> 你正在接手 GitHub `franksky1207/rpg` 的《文明戰線》專案。請先讀 `PROJECT_HANDOFF.md`，但不要把交接檔當成最終真相；**GitHub `main` 的實際程式碼才是唯一真實來源。**
>
> 接手後先重新讀 `index.html`，確認正式 script load order 與 cache-bust，再讀本次需求涉及的正式檔案與 SHA。不要只靠歷史對話、記憶或舊交接描述判斷。
>
> 修改時優先直接修改正式來源，不要另做 wrapper、fallback、第二套公式、第二套 GM 邏輯或第二套 UI 產生器；若確認舊程式完全失效且無 consumer，直接刪除或整理回正式來源。
>
> 使用者若說「先討論／先不要改／先建議／你覺得如何／你判斷一下」，只能分析與建議；若使用者說「做／修改／修正／執行／做吧」，且需求已明確，就直接修改 `main`。
>
> 修改後重新讀修改檔確認內容與 SHA；只要有 `.js` / `.css` 變更，就同步更新 `index.html` cache-bust，再重新讀 `index.html` 驗證。GitHub 寫入成功不代表 Safari／Pages 已真機驗證。
>
> 截至 2026-09-11：主線 Lv1～100、VIP0～20、專精8項 Lv0～30、三大副本、特殊怪、GM 五種測試與遊戲說明均已正式整合。玩家端戰鬥紀錄已取消；競技場現在按一次「開始三戰」後自動連打到結束。最新平衡原則仍是「主線刷成長與資源、特殊怪當驚喜、副本負責挑戰」。