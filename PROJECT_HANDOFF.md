# 《文明戰線》正式跨對話交接文件

> **最高原則：GitHub `main` 的實際程式碼永遠是唯一真實來源。**
>
> 本文件只是跨對話承接層。若本文、歷史對話、記憶、舊規格、舊截圖或先前回答與目前 `main` 衝突，一律以重新讀取到的 `main` 實際程式碼為準。

更新日期：**2026-09-12**。

---

## 1. 專案基本資料

- Repository：`franksky1207/rpg`
- 正式分支：`main`
- 遊戲名稱：**文明戰線**
- 技術：純前端 HTML / CSS / JavaScript + `localStorage`
- `SAVE_KEY = "frank_text_rpg_save"`
- `data.js` 仍保留 legacy `SAVE_VERSION = 9`
- **目前正式存檔 schema：v10**，由 `savemigration.js` 的 `SAVE_SCHEMA_VERSION = 10` 提供；`engine.js` 的 `currentSaveVersion()` 優先使用此值
- `MAX_LEVEL = 100`
- `VIP_MAX_LEVEL = 20`
- `SPECIALIZATION_MAX_LEVEL = 30`
- 正式世界：20 張地圖、Lv1～100
- 桌機、手機皆支援；iPhone Safari 是重要真機環境

定位：**簡單、傳統、文字型 RPG**。

正式主要系統：
- 主線冒險
- 1 / 5 / 10 / 15 / 20 / 25 / 無限連戰
- 背景持續戰鬥
- 離線收益
- 裝備／品質／主能力／詞條／評分
- 裝備鎖定、自動出售、一鍵換裝、一鍵出售
- 7 種怪物特性
- 9 種特殊怪
- 懸賞戰／競技場／虛空幻境
- VIP0～20
- 8 項專精 Lv0～30
- 商店／遺失裝備贖回
- 遊戲說明
- 本機自動存檔、匯出／匯入
- Save Schema migration
- GM 管理與大量模擬測試

目前不要主動加入職業、技能樹、複雜任務、大量劇情、多角色、PvP、排行榜、登入、每日系統等，除非使用者明確要求。

---

## 2. 下一個 ChatGPT 的硬性操作規範

1. **任何修改前，一定先重新讀目前 GitHub `main` 的相關正式檔案，並重新讀完整 `index.html`。** 不可只靠本文件或聊天記憶。
2. 涉及公式、狀態、UI 共用函式、load/save、戰鬥流程或跨檔案行為時，修改前先搜尋引用點，確認真正正式來源。
3. 使用者說「先不要改／先討論／先分析／先檢查／你覺得／先想想」時，只能分析，**不得寫 GitHub**。
4. 使用者明確說「做／修改／修正／執行／開始／做吧／好，修改」且需求已明確時，可以直接修改 GitHub `main`，不用再二次確認。
5. 優先直接修改**正式來源**；不要額外新增 wrapper、fallback、第二套公式、第二套 UI、第二套狀態或 alias 去蓋舊程式。現有專案已因多層後載入 wrapper 產生過衝突，新增功能應避免繼續擴大。
6. 每個 `.js` / `.css` 修改後，都必須同步更新 `index.html` 對應的 cache-bust query。
7. 修改完成後，重新讀回**所有被修改的檔案**；若有 JS/CSS 變更，再重新讀完整 `index.html`，確認載入順序與 cache-bust。
8. 修改多檔後，盡量 compare 變更，確認只有預期檔案與預期差異。
9. GitHub API 回報成功只代表 `main` 已寫入；除非使用者實際回報，不可宣稱 GitHub Pages、桌機瀏覽器或 iPhone Safari 已真機驗證。
10. 新需求若與本 handoff 衝突，以重新讀到的 `main` 為準，並在下一次更新 handoff 時同步修正本文。

---

## 3. 目前 `index.html` 正式載入順序與 cache-bust

目前完整載入順序：

```text
data.js?v=20260912-0015-offline1
worldmaps-earth.js?v=20260908-2247b2
worldmaps-solar.js?v=20260908-2247b2
engine.js?v=20260912-1205-expv10
specialization.js?v=20260911-1745-stability12
combatcore.js?v=20260911-1045-speccleanup
dungeonprogress.js?v=20260912-1205-expv10
savemigration.js?v=20260912-1205-expv10
dungeoncore.js?v=20260911-2055-postheal2
gameguide.js?v=20260912-0845-offline10
ui.js?v=20260912-1220-expv10import
hpflow.js?v=20260911-2335-savev8
vipui.js?v=20260910-2245-vipcleanup
settlementui.js?v=20260911-2145-specialflow3
balance.js?v=20260910-0850
traits.js?v=20260912-1255-directdungeontraits1
traitlock.js?v=20260907-2033
traitdrop.js?v=20260910-1910-vip3
gmtools.js?v=20260911-1045-speccleanup
shopbalance.js?v=20260911-1620-shopcooldown
gearupgrade.js?v=20260911-2355-refactor3
equipmentlock.js?v=20260911-2355-refactor3
specialmonsters.js?v=20260911-1045-speccleanup
dungeonbounty.js?v=20260912-1255-directdungeontraits1
dungeonarena.js?v=20260912-1255-directdungeontraits1
dungeonvoid.js?v=20260911-2055-postheal2
dungeonvoidui.js?v=20260912-1255-directdungeontraits1
levelcap.js?v=20260909-2305
specialcore.js?v=20260911-0818-spec3
vipgm.js?v=20260912-0010-currentstatus1
specialgmbatch.js?v=20260911-2055-postheal2
dungeongm.js?v=20260911-1045-speccleanup
gmhub.js?v=20260911-1045-speccleanup
dungeonvoidgmmanage.js?v=20260909-0915
dungeonvoidgmui.js?v=20260911-1645-voiduipolish
level100balance.js?v=20260912-1205-expv10
specialencounter.js?v=20260912-0215-flowopt2
combatpacing.js?v=20260912-0015-offline1
battlepipeline.js?v=20260912-0015-offline1
infinitebattle.js?v=20260912-0205-flowopt1
backgroundprogress.js?v=20260912-0205-flowopt1
offlinefarmtarget.js?v=20260912-1235-checkpointisolation1
offlineprogress.js?v=20260912-0940-syntaxfix1
specialguide.js?v=20260911-2115-postheal3
levelcapresult.js?v=20260908-0803
dungeonui.js?v=20260912-2245-bountyreward1
adventureprogressui.js?v=20260909-2245
combatfx.js?v=20260911-1415-nobattlelog
```

重要依賴：
- `savemigration.js` 在 `ui.js` 真正執行 `load()` 前載入。
- `hpflow.js` 在 `ui.js` 後，現在仍覆寫部分 UI／開戰回血行為與 migration 接線。
- `traits.js` 必須早於三種副本，因副本直接呼叫 `applyMonsterTraits()` 與 `combatTraitBadgesHtml()`。
- `infinitebattle.js` 在主線 pipeline 後加入 Lv31 無限連戰。
- `backgroundprogress.js` 在無限連戰後包裝主線／虛空背景時間推進。
- `offlinefarmtarget.js` 再建立／校正離線刷怪目標與 checkpoint。
- `offlineprogress.js` 最後接離線結算與 heartbeat。
- `combatfx.js` 最後載入，只做 presentation，不應改戰鬥數值。

---

## 4. 世界、主線與推進

每張地圖固定 5 個敵人：普通怪1、普通怪2、普通怪3、菁英、Boss。

正式主線推進：

```text
普通1 ×10 → 普通2 ×10 → 普通3 ×10 → 菁英 ×10 → 達本圖最高等級 → Boss
```

Boss：
- 固定單場。
- 第一次勝利解鎖下一張地圖。
- 首勝同時對新地圖做一次免費商店刷新。
- 已擊敗 Boss 可再次挑戰。
- Boss 戰敗後 `bossProgress=0` 並進入鎖定；需重新擊敗本圖菁英 10 次才可再挑戰。

連戰解鎖目前是：

```text
Lv1   → 1 場
Lv6   → 5 場
Lv11  → 10 場
Lv16  → 15 場
Lv21  → 20 場
Lv26  → 25 場
Lv31+ → 無限連戰（∞）
Boss  → 永遠 1 場
```

無限連戰：
- `infinitebattle.js` 把 `"infinite"` 加入 `BATTLE_COUNT_UNLOCKS`。
- 戰鬥畫面顯示「無限連戰・第 N 場」。
- 玩家可按「停止連戰」；實際在本場結束後停止。
- 已完成場次的 EXP／金幣／裝備／副本進度都保留。
- 戰敗同樣結束無限連戰並保留此前收益。

---

## 5. 玩家基礎公式、EXP、金幣與傷害

玩家基礎：

```js
baseHP(l)  = ceil(110 + 12*(l-1))
baseATK(l) = ceil(15 + 2.2*(l-1))
baseDEF(l) = ceil(7 + 1.2*(l-1))
```

### 正式 EXP 曲線（2026-09-12 最新）

`engine.js` 是唯一正式來源：

```js
const EXP_CURVE = {
  killMin: 5,
  killRange: 495,
  scale: 142
};

sameExp(l) = ceil(25 + 4*l)
expProgressionFactor(l)
= 5 + 495 * (1 - exp(-(l-1)/142))

expNeed(l)
= ceil(sameExp(l) * expProgressionFactor(l))
```

意義：
- 同級普通怪的「理論升級需求隻數」從 Lv1 的約 5 隻逐漸增加。
- 長期漸近上限約 500 隻同級普通怪。
- `MAX_LEVEL` 目前仍是 100，所以 Lv100 並未接近 500 隻上限。
- `level100balance.js` **不再保存第二份 EXP 常數，也不再覆寫 `expNeed()`**；只保留 `level100ExpFactor` alias 與 `sameLevelNormalKillsToLevel()` 查詢工具。

怪物 EXP 倍率：

```text
普通 ×1
菁英 ×2
Boss ×5
```

怪物與玩家等級差 `expLevelFactor(monsterLevel, playerLevel)`：

```text
差 >= +5 → 1.30
差 >= +3 → 1.20
差 >= +1 → 1.10
差 =   0 → 1.00
差 >= -2 → 0.90
差 >= -5 → 0.60
差 >=-10 → 0.25
更低     → 0.05
```

實戰訓練專精：每級 EXP +5%，Lv30 = +150% = 基礎 ×2.5。

金幣：

```js
goldBase(l) = ceil(6 + 4*l)
普通 ×1
菁英 ×2.5
Boss ×6
```

金幣目前不做玩家／怪物等級差衰減。

傷害：

```js
calcDamage(atk, def)
= max(1, ceil((atk - def*0.55) * random(0.95~1.05)))
```

暴擊傷害倍率：`1.5`。

Lv100：
- 不再累積 EXP。
- 一般／菁英／Boss 若開戰時已 Lv100，原本 EXP 以 1:1 轉金幣。
- 特殊怪用 `specialExpPayout()`，滿等同樣 1:1 轉金幣。

---

## 6. EXP 曲線最近重要修正

近期曾發生：
- `engine.js` 已改新 EXP 公式，但後載入的 `level100balance.js` 又重新指定 `expNeed()`，造成 runtime 顯示仍使用舊曲線。
- 典型症狀：Lv68 升級需求顯示 31,636，而正式公式應是另一數值。

已修正：
- `expNeed()` 現在只由 `engine.js` 提供。
- `level100balance.js` 不得再覆寫正式 EXP。
- 之後再調 EXP，應只改 `engine.js` 的 `EXP_CURVE`；不要另建第二套曲線常數。

2026-09-12 又將高等漸近目標從 250 隻調成 500 隻：
- 舊 v9 曲線：`5 + 245*(1-e^(-(L-1)/142))`
- 現 v10 曲線：`5 + 495*(1-e^(-(L-1)/142))`

---

## 7. Save Schema v10 與 EXP 百分比 migration

正式 schema 來源：`savemigration.js`：

```js
SAVE_SCHEMA_VERSION = 10
```

`engine.js`：

```js
currentSaveVersion()
```

會優先讀 `window.SAVE_SCHEMA_VERSION`，所以目前正式新存檔與 normalize 後存檔皆為 v10。

### v9 → v10 EXP 進度保留

因 500 隻曲線提高升級需求，v9 舊存檔不直接保留原始 EXP 數字，而是保留當級的**升級百分比**：

```text
oldProgress = oldExp / oldV9ExpNeed(level)
newExp      = round(newV10ExpNeed(level) * oldProgress)
```

- 百分比限制在 0～100%。
- 新 EXP 上限限制為 `newNeed - 1`。
- Lv100 直接 EXP=0。
- v9 舊曲線公式只存在 `savemigration.js` 的 `legacyExpNeedV9()`，用途只限一次性 migration，不得拿來當 runtime 正式公式。
- 本機載入與匯入 JSON 都走相同 migration 核心。

### 其他 migration

集中處理：
- world map progress
- VIP／舊 `dungeon.points → vipPoints`
- specializations
- dungeon progress／attempts／activeRun
- void `highestCleared`
- shop legacy 初始化
- `introSeen`
- 裝備 `locked`
- legacy gear metadata
- offline state

離線 migration：
- `< v9` 或沒有合法 `offline`：從目前時間建立新的 offline state，不會回溯到幾個月前算離線。
- v9+：正規化 `lastSettledAt / farmMap / farmEnemy / avgBattleMs / sampleCount`。

### 現有技術細節

`data.js` 目前仍寫 `SAVE_VERSION=9`，但 runtime 正式 schema 已是 v10；下一個對話不要誤判為目前只有 v9。若未來整理，可把 legacy constant 一併收斂，但修改前要檢查所有引用。

---

## 8. 主線怪物正式平衡公式

正式來源：`balance.js`。

```js
monsterBase(level) = {
  hp:  ceil(55 + 24*level),
  atk: ceil(9 + 4.2*level),
  def: ceil(2.5 + 2.0*level)
}
```

style：

```text
tank   → HP ×1.15，ATK ×0.95
attack → HP ×0.92，ATK ×1.10
```

同圖倍率：

```text
第1怪：HP 1.22 / ATK 1.17 / DEF 1.10
第2怪：HP 1.31 / ATK 1.24 / DEF 1.14
第3怪：HP 1.34 / ATK 1.28 / DEF 1.15
菁英 ：HP 1.39 / ATK 1.29 / DEF 1.17
Boss ：HP 1.44 / ATK 1.27 / DEF 1.17
```

平衡哲學：主線是成長／刷資源／刷裝備，不因 VIP／專精自動再次膨脹怪物。

---

## 9. 裝備系統

部位：`weapon / helmet / armor / shoes / accessory`。

主要能力：
- 武器 ATK
- 頭盔 HP
- 鎧甲 DEF
- 鞋子 HP
- 飾品 Crit

品質：普通／優良／稀有／史詩／傳說／神話。

品質能力倍率：

```text
普通 1.00
優良 1.15
稀有 1.35
史詩 1.60
傳說 1.95
神話 2.40
```

售價倍率：

```text
普通 1
優良 1.4
稀有 2
史詩 3.2
傳說 5
神話 8
```

裝備評分：

```js
rateWeight = 20 + 0.5*itemLevel
score = ATK*5 + DEF*5 + HP + Crit*rateWeight + Dodge*rateWeight
```

主線裝備掉落等級：

```text
普通：怪物等級 + [-2,-1,0,0,+1]
菁英：怪物等級 + [-1,0,0,+1]
Boss：怪物等級 + [-1,0,0,+1,+2]
```

仍受 `MAX_LEVEL` 限制。

---

## 10. 裝備取得、鎖定與出售

正式責任目前仍分散於 `engine.js`、`gearupgrade.js`、`equipmentlock.js`。

`gearupgrade.js` 只保留評分／升級判斷工具，不應再改裝備 state。

`equipmentlock.js` 目前負責：
- `locked` 正規化
- 鎖定 UI
- `isGearLocked()`
- `shouldAutoSellItem()`
- `handleUnequippedItem()`
- 正式 `addItem()`
- 手動換裝／出售
- 一鍵裝備較強裝備
- 一鍵出售較低／同能力裝備
- 遺失裝備保護
- 換裝後滿血

規則：
- 神話永不自動出售。
- `locked=true` 不會被自動出售、一鍵出售、手動出售。
- 神話可手動出售，但要二次確認。
- 換下裝備依正式自動出售規則處理。
- 鑑價專精的所有真正出售應走 `specializationSellValue()`。

---

## 11. 新角色與開場

`newState()` 直接給 Lv1 普通五件套。

新角色 `introSeen=false`；舊存檔缺欄位會 migration 成 `true`，避免老玩家升版後看到新手開場。

---

## 12. 怪物特性正式資料與最新 UI

7 種：

```text
強壯 strong     → HP +20%
兇猛 ferocious  → ATK +15%
堅硬 hard       → DEF +20%
迅捷 swift      → Dodge +8 個百分點
致命 deadly     → Crit +8 個百分點
狂暴 berserk    → HP <50% 時 ATK +20%
巨體 giant      → HP +30%、ATK +5%、Dodge -5 個百分點
```

怪物 Crit / Dodge 最終上限皆 30%。

主線 trait 數量：

```text
普通：0 70%、1 25%、2 5%
菁英：0 35%、1 50%、2 15%
Boss：0 15%、1 55%、2 30%
```

### 戰鬥中的特性顯示

`traits.js` 正式共用：

```js
combatTraitBadgesHtml(traits)
```

目前戰鬥中使用同一套**大型彩色標籤**：
- 主線
- 懸賞
- 競技場
- 虛空幻境

準備／預覽畫面仍可使用較小的文字或詳細說明。

近期已移除舊補丁：
- `dungeonCombatTraitIdsFromText()`
- `syncDungeonCombatTraitBadges()`
- `MutationObserver` 全頁掃 DOM

三種副本現在直接把 `enemy.traits` 傳給 `combatTraitBadgesHtml()`，不再從中文文字反解析 trait。

---

## 13. 主線掉裝與品質升階

基礎掉裝率：

```text
普通 25%
菁英 60%
Boss 100%
```

VIP2：上述掉落率 +5 個百分點，最高100%。

品質基礎表：

```text
普通怪：普通50 / 優良30 / 稀有15 / 史詩4 / 傳說0.9 / 神話0.1
菁英  ：普通35 / 優良35 / 稀有20 / 史詩8 / 傳說1.8 / 神話0.2
Boss  ：普通0  / 優良45 / 稀有35 / 史詩15 / 傳說4.5 / 神話0.5
```

品質升階來源獨立：
- 1 trait：15% 機率 +1
- 2 traits：30% 機率 +1
- VIP14：5% 機率 +1
- Boss + VIP18：10% 機率 +1
- 神話封頂

VIP8：15% 優先目前最弱裝備槽。
VIP16：Boss 15% 額外再掉1件。

---

## 14. VIP 系統

VIP0～20。

```js
vipThreshold(level) = 1000 * level^2
```

每 VIP1：

```text
HP +0.5%
ATK +0.5%
DEF +0.25%
Crit +0.25 個百分點
Dodge +0.25 個百分點
```

偶數特權：

```text
VIP2  主線裝備掉落率 +5 個百分點
VIP4  副本進度 +10%
VIP6  特殊怪遭遇率 +2 個百分點
VIP8  主線掉落 15% 優先最弱部位
VIP10 特殊怪特殊獎勵 10% 再發動一套全新獎勵
VIP12 副本進度總加成提高為 +20%
VIP14 主線掉落 5% 品質 +1
VIP16 Boss 15% 額外掉 1 件裝備
VIP18 Boss 掉落 10% 品質 +1
VIP20 死亡不遺失裝備；EXP 懲罰仍存在
```

VIP 等級只升不降；降低積分不會自動降已解鎖等級。GM 有重置 VIP。

---

## 15. 專精系統

8 項、Lv0～30，永久金幣升級。

升到目標等級 `n`：

```js
cost = 1000 * n^2
```

8 項：

```text
training     實戰訓練 → 每級 EXP +5%
scavenge     搜刮技巧 → 每級怪物直接金幣 +5%
appraisal    鑑價技巧 → 每級裝備售價 +5%
initiative   先制技巧 → 每級第一擊傷害 +2%
combo        連擊技巧 → 每級連擊率 +1%；追加攻擊50%，可再連擊
penetration  穿透技巧 → 每級穿透率 +1%；觸發忽略敵人25% DEF
counter      反擊技巧 → 每級反擊率 +1%；反擊傷害40%
drain        汲取技巧 → 每級汲取率 +1%；回復本次實際傷害10%
```

專精升級有 action lock，確認後再次檢查等級與金幣，避免快速連點重複扣款。

---

## 16. 共用戰鬥核心、回血與死亡

正式核心：

```js
runCombatCore(player, enemy, startHp, options)
```

回傳至少：`win / hp / enemyHp / turns / logs / events / e`。

structured events 已有：`attack / dodge / combo / counter / drain / berserk`。

玩家可見持久 logs 已取消；但多個動畫仍解析 `logs` regex，所以底層 logs 目前不能直接刪除。

回血規則：
- 主線每場戰後回滿。
- 特殊怪勝敗後回滿。
- 懸賞整場結束回滿。
- 競技場三戰**場間不回血**，整組結束後回滿。
- 虛空每層勝利後回滿，再進下一層；整趟結束也回滿。
- 非戰鬥換裝後回滿新的最大 HP。

需要統計真實戰後 HP 時，必須保存 `combatEndHp` 或直接讀 `runCombatCore().hp`，不可讀已回血後的 `state.hp`。

死亡 EXP 懲罰：

```js
loss = ceil(expNeed(state.level) * 0.10)
actual = min(state.exp, loss)
```

非 VIP20：每次死亡對目前穿戴裝備有30%機率遺失1件，進 `state.lostGear`；贖回價 `ceil(item.buy*2)`。

---

## 17. 特殊遭遇

基礎遭遇率 8%；VIP6 後 10%。

資格：
- 該場主線勝利。
- Boss 不觸發。
- 玩家等級比怪物高10級以上不觸發。
- **沒有 HP30% 條件。**

一次連戰可觸發多次特殊遭遇，不可加「每次指令最多一次」限制。

流程：

```text
主線勝利
→ 保存真實戰後資料與主線獎勵
→ 主線戰後回滿
→ 判斷特殊遭遇
→ 顯示警報
→ 自動特殊戰鬥
→ 勝利：回滿並繼續主線
→ 失敗：死亡懲罰、回滿、整段連戰立即停止
```

9 種特殊怪與獎勵結構維持既有正式設定；若要修改，先讀 `specialmonsters.js / specialencounter.js / specialcore.js`。

---

## 18. 商店

刷新成本：

```text
100 → 200 → 400 → 800 → 1600 → 3200 → 6400 → 12800
```

- 最高12,800。
- 最高階可手動重置回100，冷卻1小時。
- 購買1件商品後刷新成本降低1級。
- 首次解鎖新地圖免費刷新。
- 每次刷新3件。
- 商店不出神話。
- 買光保持空商店，reload 不免費補貨。
- transaction lock 防止快速雙擊重複交易。

---

## 19. 副本進度

解鎖：

```text
懸賞 Lv5
競技場 Lv15
虛空 Lv25
```

只有主線勝利增加正式副本進度；每100 progress 轉1次挑戰次數。

```js
damageRate = clamp((startHp - combatEndHp) / playerMaxHp, 0, 1)
progress = (enemyMaxHp/playerBaseHp * 1.5 + damageRate * 4) * vipMultiplier
```

`playerBaseHp = baseHP(playerLevel)`。

VIP multiplier：

```text
VIP0~3  → 1.00
VIP4~11 → 1.10
VIP12+  → 1.20
```

---

## 20. 懸賞戰（2026-09-12 最新獎勵版）

單場；ready 不扣次數，按開始才 `beginDungeonRun(cost=1)`。

Tier：

```text
普通懸賞：45%｜VIP積分80｜金幣 ×5 ｜保證裝備2件
高級懸賞：35%｜VIP積分120｜金幣 ×8 ｜保證裝備3件
危險懸賞：20%｜VIP積分180｜金幣 ×12｜保證裝備5件
```

這裡的金幣基準是角色目前等級的普通怪 `goldReward()` 再乘 tier 倍率。

懸賞：
- **不給 EXP**。
- 勝利給 VIP 積分、懸賞金幣、保證件數裝備。
- 保證裝備透過正式 `dropItem()`／`addItem()` 路徑，不另外造第二套裝備系統。
- 裝備來源視為 normal kind；trait 可影響正式 trait drop quality 升階邏輯。
- 結算顯示保留／自動出售與出售金幣。
- 戰鬥結束 `finishDungeonRun()` 回滿。

特性：普通／高級固定1 trait；危險 50%一特性、50%兩特性。

---

## 21. 競技場

流程：選難度 → ready → 自動三戰 → 一次結算。

積分：

```text
普通 [25,35,120] = 180
困難 [35,45,200] = 280
極限 [40,60,320] = 420
```

規則：
- 三戰場間不回血。
- 任一戰失敗立即結束。
- 真正開始才扣1次。
- 開始時鎖玩家 combat snapshot／VIP snapshot／敵人 scaling snapshot。
- 第一戰沿用 ready traits；第2、3戰重新 roll。
- 每一戰通過立即取得該 stage VIP 積分；後續失敗不追回。
- 戰鬥中的 traits 直接用 `combatTraitBadgesHtml()`。

---

## 22. 虛空幻境

正式檔：`dungeonvoid.js + dungeonvoidui.js`。

- Lv25 解鎖。
- 從 `highestCleared + 1` 開始。
- 第一層真正開戰才扣1次。
- 整趟鎖玩家 snapshot。
- 一般層1 trait；每10層 Boss 2 traits。
- 每層勝利後完全回血。
- 可要求本層結束後退出。
- 戰敗／退出後整趟結束並回滿。
- 戰鬥 traits 直接用 `combatTraitBadgesHtml()`。

固定基礎：

```text
Base Crit 10%
Base Dodge 8%
HP ×2.40
ATK ×2.15
DEF ×2.65
```

```js
e = 24 + floor/10
HP  = ceil((62 + 16.2*e) * 2.40)
ATK = ceil((10.5 + 2.45*e) * 2.15)
DEF = ceil((3.2 + 0.92*e) * 2.65)
points = round(15 + 1.75*sqrt(floor-1))
Boss floor points ×2
```

---

## 23. 背景戰鬥系統

正式檔：`backgroundprogress.js`。

「背景」定義：頁面仍開著，但 tab/app 切換、視窗失焦、手機切到背景或螢幕關閉等，JS runtime 尚存在的情況。

用途：
- 多場主線連戰
- 無限主線連戰
- 虛空自動爬塔

核心方式：
- 前景正常 `sleep()`。
- 進背景時計算經過時間，回前景時轉成 progress credit，快速消化本來需要等待的動畫時間。
- `BACKGROUND_CREDIT_RATE = 0.96`。
- 無限主線的背景累積上限為12小時。
- 有 `visibilitychange / blur / focus / pagehide / pageshow` 監控。

注意：背景系統與「真正關閉頁面後的離線收益」是兩套不同機制。

---

## 24. 離線收益系統

正式檔：
- `offlinefarmtarget.js`
- `offlineprogress.js`

### 基本規則

```text
最低離線時間：1 分鐘
最多計算：12 小時
EXP 比例：在線正式獎勵的 10%
金幣比例：在線正式獎勵的 10%
裝備抽取節奏比例：10%
副本進度比例：正式主線進度的 10%
```

離線不會：
- 自動推主線地圖
- 自動打 Boss
- 自動觸發特殊遭遇
- 自動進副本

### 離線刷怪目標

- 只用玩家**確實打贏過的非 Boss 主線怪**。
- 載入時掃 `state.mapProgress`，自動選歷史上已擊敗過的最高等級非 Boss 怪；同級時偏後面的地圖／敵人。
- 不會給完全沒打過主線的新角色硬塞 Map0 fallback。
- 線上實際勝利會呼叫 `recordOfflineMainBattleSample()` 記錄 farm target 與預估戰鬥時間。
- 平均戰鬥時間限制 600～60000ms，最多累積20個 sample。
- 如果載入時自動切到更高等的 farm target，**不再沿用上一隻怪的平均時間**；改回預設1800ms、sampleCount=1，之後再由新怪實戰採樣更新。

### 離線裝備處理

- 神話全部保留。
- 非神話每個部位只保留本次離線取得中最強的候選。
- 候選只有比目前穿戴裝備強才保留；其餘自動出售。
- 出售套用鑑價專精。

### 離線副本進度

- 使用正式 `calculateDungeonBattleProgress()`，再乘 `OFFLINE_DUNGEON_RATE=.10`。
- 仍會吃正式 VIP4／VIP12 副本進度倍率。
- 每100進度仍會轉成挑戰次數。

### 離線結算 UI

完整全頁式、手機優先：

```text
整理離線收益
→ 離線收益結算頁
→ 顯示離線時間
→ 戰鬥場次 / Lv.X 怪物 × N
→ EXP +N（含前後 Lv/EXP）
→ 金幣 +N
→ 副本進度
→ 裝備：共取得 / 自動出售 / 留下裝備
→ 領取並進入遊戲
```

超過12小時會明確寫「僅計算前12小時」。

---

## 25. 離線 checkpoint、pendingSettlement 與安全性

### 每份存檔隔離 checkpoint

獨立 localStorage key：

```text
frank_text_rpg_offline_checkpoint
```

目前格式：

```js
{ id: checkpointId, ts: timestamp }
```

`checkpointId` 存在 `state.offline.checkpointId`。

只有 id 與目前存檔一致的 structured checkpoint 才可使用，避免本機舊 checkpoint 汙染匯入的另一份存檔。

舊版單純數字 checkpoint 仍可相容一次，之後會被新版 JSON 格式覆蓋。

checkpoint 只在比 `state.offline.lastSettledAt` **更新**時往前校正，不再把時間往更早拉長。

### pendingSettlement 防重複

離線結算先建立並存入 `state.offline.pendingSettlement`，再發獎勵。

結算時：
- `offlineSettlementBusy=true`
- 暫停一般 save wrapper 寫入
- 完成後清 pending、更新 `lastSettledAt` 再存
- 若中途出錯，rollback state；pending 區段保留，reload 後可重算

目的：避免「算到一半已存一部分獎勵，重整後又再領一次」。

### heartbeat

`offlineprogress.js`：
- 每分鐘更新前景 checkpoint。
- 每5分鐘實際 persist 一次正式 save。
- 頁面進背景／pagehide 時也做 checkpoint。

`offlinefarmtarget.js` 另有每分鐘獨立 localStorage checkpoint。

目前兩套時間保活機制共存且功能可用；屬之後可收斂的技術債，但不要未經分析一次大改。

---

## 26. 離線系統近期重要 bug 修正歷程

已處理：
- 初版關閉數分鐘回來沒有離線結算。
- 缺／非法 farm target 會把 timestamp 吃掉，導致離線區段消失。
- 加入最高已擊敗非 Boss fallback。
- 增加獨立 checkpoint，解決真正關閉頁面後 state 最後時間未即時落盤的問題。
- 初次 checkpoint 修正後曾一次回算8小時以上造成大量升級，因此把離線 EXP／金幣／裝備／副本全部降為10%。
- 修正 `offlineprogress.js` 一次缺右括號造成整個檔案 parse fail。
- 修正最高已擊敗怪的 farm target 持久化。
- 修正 checkpoint 可能把 `lastSettledAt` 拉到更舊時間。
- checkpoint 現在與存檔 `checkpointId` 隔離。
- 切換到更高等 farm target 時重設 `avgBattleMs`，不再沿用上一隻怪速度。

使用者曾實測確認離線結算頁已正常出現，且可顯示戰鬥場次、EXP、金幣、副本進度、裝備。

---

## 27. 遊戲說明與 UI

首頁順序：

```text
冒險｜角色｜專精｜副本｜背包｜商店｜遊戲說明｜設定
```

玩家端戰鬥持久 logs 已移除，只保留動畫與浮字。

主線戰鬥中的怪物 traits 是大型彩色標籤；三種副本已統一。

離線收益為 full-page overlay，不混在一般 battle result modal。

---

## 28. GM 管理中心

入口：設定頁標題連點3次 → 密碼。

GM Hub 有「管理／測試」兩大分頁。

一般管理：
- 指定角色等級
- 指定金幣
- 指定主線解鎖到某等級關卡
- 補滿 HP
- 清空背包（confirm）
- 刷新商店
- 重置商店刷新價格
- 指定品質／等級／部位產生裝備
- 正式專精等級管理
- 副本 progress／挑戰次數／VIP 積分管理
- VIP 重置
- 虛空進度管理

GM 測試 VIP：VIP0～20，runtime-only，reload 後回預設，不污染正式角色。

GM 測試專精：8項可獨立 Lv0～30，runtime-only。

GM Hub 目前會顯示目前世界 Lv1～MAX_LEVEL／地圖數量，副本摘要會顯示 progress、次數、VIP 等級、VIP 積分。

---

## 29. GM 戰鬥模擬

`GM_TEST_RUNS = 100`。

可測：
- 指定主線怪 ×100
- 指定特殊怪 ×100
- 普通／高級／危險懸賞各 ×100
- 普通／困難／極限競技場各 ×100 完整三連戰
- 虛空指定樓層預覽
- 虛空從指定樓層爬塔模擬；安全上限10,000層

測試沙盒會備份正式 `state`，測試後恢復，測試 VIP／專精不應污染正式資料。

平均剩餘 HP 必須使用真實 combat 結果，不可使用戰後已回滿的 `state.hp`。

懸賞 GM 的正式獎勵資料若要新增統計，要以目前「VIP積分＋金幣倍率＋保證裝備件數、無EXP」的新規則為準，不能再沿用舊交接檔的「只有VIP積分」敘述。

---

## 30. 目前仍存在的技術債／尚未完成項目

以下不是目前已知致命 bug，但下一個對話應知道：

### A. `ui.js` 與 `hpflow.js` 尚未真正合併

`ui.js` 原始內容仍有：
- `⚠ 低血量`
- 「回血並開始戰鬥」
- 「回血並挑戰 Boss」
- `healBeforeBattle()`
- 原始 `startBattles()` 開戰前回血

runtime 被後載入 `hpflow.js` 改成：
- 不顯示低血量警告
- 「開始戰鬥／挑戰 Boss」
- 開戰前不回血，改戰後回滿

若整理，應直接把正式新版寫回 `ui.js`，再移除對應 wrapper，不要加第三層。

### B. 現有 wrapper 仍偏多

目前仍有：
- `hpflow.js` 包 `normalizeSaveState / adventurePreparePage / startBattles`
- `infinitebattle.js` 包 `adventurePreparePage / adventureCombatPage / showBattleResult`
- `backgroundprogress.js` 包 `beginCombat / runBattles`
- `offlineprogress.js` 包 `save`
- `savemigration.js` 包 `load`
- `equipmentlock.js` 仍有多個 UI／裝備入口 override

這些是歷史累積。未來新增功能不要再用「後載入再蓋一次」當第一選擇。

### C. `data.js SAVE_VERSION=9` 與正式 schema v10 名稱不一致

功能目前正確，因 `currentSaveVersion()` 優先 `SAVE_SCHEMA_VERSION=10`；但閱讀程式容易誤判。若整理，先搜尋所有 SAVE_VERSION 使用點再收斂。

### D. 回血責任有重複

`applyDeathPenalty()`、`gainExp()` 與外層戰鬥流程仍有部分重複回血責任。現在因真實 `combatEndHp` 先保存所以安全，但責任不單一。

### E. 戰鬥動畫仍依賴 logs regex

structured events 已存在，但主線／特殊／懸賞／競技場／虛空仍有文字 log regex 動畫。不可直接刪 core logs。

### F. 離線系統有 state heartbeat + 獨立 localStorage checkpoint 兩套時間保活

目前已解決資料隔離與舊時間回拉問題，但架構仍可日後收斂成單一 checkpoint API。沒有實際 bug 時不要一次重寫。

### G. 部分 CSS 仍由 JS 動態注入

例如 VIP、專精、裝備鎖定、特殊警報、結算、虛空、離線結算等。沒有 UI 問題時不要只為整理一次大搬家。

### H. 沒有自動化瀏覽器／iPhone Safari 真機回歸

GitHub 靜態檢查不能等同 Pages 或真機驗證。

---

## 31. 2026-09-12 本輪對話已完成修改摘要

本輪已完成並已進 `main`：

1. **背景持續戰鬥**：tab/app 切背景後回前景可依經過時間消化戰鬥動畫，無限主線背景上限12小時。
2. **Lv31 無限連戰**：新增∞選項、本場後停止、收益保留、專用結算文字。
3. **完整離線收益系統**：1分鐘起算、最多12小時、10% EXP／金幣／裝備／副本進度、全頁結算 UI。
4. **離線 farm target**：最高已擊敗非 Boss 怪、自動實戰時間採樣、目標切換重設1800ms。
5. **離線 pendingSettlement / rollback / heartbeat**：降低重複領獎與中途失敗風險。
6. **離線 checkpoint 修正**：獨立 checkpoint、每份存檔 `checkpointId` 隔離、只採用較新的 checkpoint。
7. **懸賞獎勵重做**：普通80/×5/2件；高級120/×8/3件；危險180/×12/5件；無EXP。
8. **怪物特性戰鬥文字放大與上色**。
9. **副本特性 UI 正式共用**：懸賞／競技場／虛空直接呼叫 `combatTraitBadgesHtml()`；移除 MutationObserver 掃 DOM 補丁。
10. **EXP 曲線先修正後調整**：移除 `level100balance.js` 對 `expNeed()` 的覆寫；正式曲線集中 `engine.js`。
11. **EXP 高等漸近上限改為500隻**：`5 + 495*(1-e^(-(L-1)/142))`。
12. **Save Schema v10**：v9 → v10 以升級百分比遷移 EXP，避免曲線變更讓老玩家百分比大幅倒退。
13. **EXP 單一正式來源**：`level100balance.js` 不再重複保存 5/495/142。
14. **匯入存檔也走 v10 migration**：`normalizeCurrentSaveState()` 會依 sourceVersion 正式遷移。

---

## 32. 近期重要 bug 修正總表

- 修正 EXP 新公式被後載入 `level100balance.js` 舊公式覆寫。
- 修正離線數分鐘不出現結算。
- 修正沒有 farm target 時誤吃離線 timestamp。
- 修正 checkpoint 初版可能回算過長離線。
- 修正離線比例過高，統一下調成10%。
- 修正離線 `offlineprogress.js` syntax parse error。
- 修正離線目標沒有升級到最高已擊敗非 Boss。
- 修正離線 target 變更沿用舊怪 `avgBattleMs`。
- 修正 structured checkpoint 可能污染另一份匯入存檔。
- 修正 checkpoint 把 `lastSettledAt` 往舊時間拉。
- 修正副本 trait 顯示靠 DOM MutationObserver 與中文文字反解析的補丁架構。
- 修正 EXP 曲線改版時舊玩家只保留 raw EXP、升級百分比大幅下降；v9→v10 現改保留百分比。

---

## 33. 平衡哲學

```text
主線 = 成長、刷資源、刷裝備
特殊怪 = 額外驚喜／禮物
副本 = 挑戰
```

原則：
- 不因 VIP／專精變強就自動補強主線。
- 不因 VIP／專精變強就自動補強特殊怪。
- 懸賞／競技場若未來過度被碾壓，優先新增更高難度，不要把既有難度全部膨脹。
- 虛空本身無限爬高，可自然承接角色變強。
- EXP 平衡用「實際分鐘／級」評估，不只看 raw EXP 數字。使用者實測在線約24隻普通怪／分鐘，可作未來平衡參考，但實際 runtime 回報優先。

---

## 34. 建議回歸檢查清單

### 主線／無限／背景
- 1/5/10/15/20/25/∞ 解鎖
- Boss 永遠單場
- 無限停止為本場後停止
- 無限戰敗與主動停止都保留此前收益
- 前景／背景切換不重複戰鬥、不遺失收益
- 無限背景上限12小時

### EXP / Save v10
- 新角色 schema=10
- 現有 v9 存檔升 v10 後等級不變、EXP 百分比大致保持
- v9 匯入 JSON 也會做百分比 migration
- `level100balance.js` 不得覆寫 `expNeed()`
- Lv100 EXP 行為正確

### 離線
- <1分鐘不結算
- ≥1分鐘完整結算
- >12小時只算前12小時
- 目標是最高已擊敗非 Boss
- 切換 farm target 後 avg=1800ms 起算
- EXP／金幣／裝備／副本皆10%
- 神話全留、普通裝每槽只留最強且需強於穿戴
- pendingSettlement 中途失敗不重複發獎
- 匯入另一份存檔不吃本機舊 structured checkpoint

### traits
- 主線戰鬥大型彩色 badge
- 懸賞戰鬥同樣 badge
- 競技場戰鬥同樣 badge
- 虛空戰鬥同樣 badge
- ready／預覽畫面維持較小資訊版
- `traits.js` 無 MutationObserver dungeon sync 補丁

### 懸賞
- 普通80分／×5金幣／2件
- 高級120分／×8金幣／3件
- 危險180分／×12金幣／5件
- 無EXP
- 自動出售與保留統計正確

### GM
- 測試 VIP／專精只在 runtime
- 測試不污染正式 state
- 主線／特殊／懸賞／競技場／虛空平均剩餘 HP 讀真實 combat result

---

## 35. 下一個對話如何接手（標準指令）

> 讀取 `franksky1207/rpg` 的 `PROJECT_HANDOFF.md`，再重新讀取目前 GitHub `main` 的**完整 `index.html`**與本次需求相關正式程式碼；**`main` 是唯一真實來源**，不要只依賴交接檔、記憶或舊聊天。先比對交接檔是否仍與程式一致，再處理需求。使用者若說「先討論／先不要改／先檢查」，只能分析，不得寫入；若明確說「做／修改／執行／開始」，可直接修改 `main`。修改前先搜尋所有引用點，優先改正式來源，不新增不必要 wrapper／fallback／第二套公式／第二套 UI；JS/CSS 修改必須同步 bump `index.html` cache-bust。修改後重新讀回所有修改檔與完整 `index.html`，必要時 compare commits，並清楚區分「GitHub main 靜態確認」與「實際 Pages／桌機／iPhone Safari 真機驗證」。