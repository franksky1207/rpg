# 《文明戰線》正式跨對話交接文件

> **最高原則：GitHub `main` branch 的實際程式碼永遠是唯一真實來源。**
>
> 本文件是後續開發對話的承接層。若本文、歷史對話、記憶或舊規格與 `main` 實際程式碼衝突，**一律以 `main` 為準**。
>
> 本文件於 **2026-09-11** 重新依 `main` 更新，已納入完整 VIP 系統、完整「專精」系統、共用戰鬥事件／浮字、GM 專精測試、以及專精正式來源架構清理。

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
- 專精最高等級：30
- GM 密碼：`franksky`
- 正式世界：Lv1～100、20 張地圖
- 必須同時支援桌機與手機，使用者會以桌機與 iPhone Safari 實測

遊戲核心方向：**傳統、簡單、文字型 RPG**。

正式主要系統：
- 主線打怪／升級
- 金幣
- 裝備與品質
- 地圖與 Boss 推進
- 怪物特性
- 特殊怪
- 三種副本：懸賞戰、競技場、虛空幻境
- VIP0～20
- 專精 8 項、Lv0～30
- 商店
- GM 管理／批量測試

目前不要主動加入職業、技能樹、複雜任務、大量劇情、多角色、PvP、排行榜、登入、每日系統等，除非使用者後續明確要求。

---

## 2. 操作規範

### 2.1 使用者語意

若使用者說「做／修改／修正／執行／做吧／可以」且上下文已明確要求執行，可直接修改 GitHub `main`，不必要求貼程式碼或重複確認。

若使用者說「先不要改／先討論／先建議／你覺得如何」或只是回報測試結果，**只能分析，不得寫入 GitHub**。

### 2.2 每次修改標準流程

1. 修改前重新讀取 `main` 的相關正式檔案。
2. 同時重新讀 `index.html`，確認 script load order 與 cache-bust。
3. 找出唯一正式來源以及後載入覆蓋關係。
4. 優先直接修改正式來源。
5. **不要另做 wrapper、fallback、第二套公式、第二套 GM 邏輯或第二套 UI 產生器來繞過正式來源。**
6. 舊程式若已失效且無 consumer，直接刪除，不留備援層。
7. 修改後重新讀取修改檔確認內容與 SHA。
8. 任一 `.js` / `.css` 修改都同步更新 `index.html` 的 `?v=`。
9. 重要系統／架構變更同步更新本文件。
10. GitHub 寫入成功不等於 Pages／Safari 真機測試成功；除非使用者實測，不可宣稱已真機驗證。

---

## 3. 正式 script load order

截至 2026-09-11：

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

重要：`specialization.js` 現在是**基礎正式模組**，位於 `engine.js` 後、`combatcore.js` 與 `ui.js` 前；它不再在尾端包覆正式函式。

`combatfx.js` 維持最後載入，只負責戰鬥 presentation，不改戰鬥公式。

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

## 4. 世界與主線

每 5 級一張地圖，每張固定 3 普通＋1 菁英＋1 Boss。

- Lv1～50：地球戰爭，10 張圖
- Lv51～100：太陽系戰爭，10 張圖
- 未來可繼續擴等；曾討論可長期延伸至 Lv250 以上

主線推進：第1普通10 → 第2普通10 → 第3普通10 → 菁英10，且達地圖最大 Lv → Boss。

Boss：
- 首勝解鎖下一地圖並免費刷新商店。
- 戰敗後鎖定，需再擊敗同圖菁英10隻。
- Boss 單場。

連戰：Lv1=1、Lv6=5、Lv11=10、Lv16=15、Lv21=20、Lv26+=25。

### 主線怪正式公式

唯一正式來源 `balance.js`：

```js
HP  = ceil(55 + 24*level)
ATK = ceil(9 + 4.2*level)
DEF = ceil(2.5 + 2.0*level)
```

再套 style 與 stage。

style：
- tank：HP×1.15、ATK×0.95
- attack：HP×0.92、ATK×1.10

stage（第1／2／3普通、菁英、Boss）：
- HP：1.22 / 1.31 / 1.34 / 1.39 / 1.44
- ATK：1.17 / 1.24 / 1.28 / 1.29 / 1.27
- DEF：1.10 / 1.14 / 1.15 / 1.17 / 1.17

---

## 5. 玩家／裝備核心

無 VIP 基礎：

```js
baseHP(l)  = ceil(110 + 12*(l-1))
baseATK(l) = ceil(15 + 2.2*(l-1))
baseDEF(l) = ceil(7 + 1.2*(l-1))
```

- `equippedStats()`：等級基礎＋裝備，不含 VIP。
- `playerCombatStats()`：在 base snapshot 上套 VIP，為正式玩家實戰能力。

品質倍率：普通1、優良1.15、稀有1.35、史詩1.6、傳說1.95、神話2.4。
出售倍率：1、1.4、2、3.2、5、8。

裝備評分：

```js
rateWeight = 20 + 0.5*itemLevel
score = ATK*5 + DEF*5 + HP + crit*rateWeight + dodge*rateWeight
```

`gearupgrade.js` 為目前 `addItem()`、一鍵裝備與一鍵出售的重要後載入正式來源。

---

## 6. EXP、金幣、滿等

```js
sameExp(l) = ceil(25 + 4*l)
goldBase(l) = ceil(6 + 4*l)
```

種類倍率：
- EXP：普通1、菁英2、Boss5
- 金幣：普通1、菁英2.5、Boss6

正式 EXP 曲線由 `level100balance.js`：

```js
x = (level-1)^1.8
mid = 64^1.8
factor = 5 + 195*x/(x+mid)
expNeed = ceil(sameExp(level)*factor)
```

Lv100 主線 EXP 由 `levelcap.js` 1:1 轉金幣。

### 專精整合後正式來源

- `engine.js -> expReward(e,useTestSpecializations=false)`：基礎 EXP 後直接套實戰訓練。
- `engine.js -> goldReward(e,useTestSpecializations=false)`：基礎金幣後直接套搜刮技巧。
- 不再由 `specialization.js` 後掛 wrapper 覆寫。

---

## 7. VIP 系統

VIP0～20。

```js
vipThreshold(n) = 1000*n^2
```

每 VIP1：
- HP +0.5%
- ATK +0.5%
- DEF +0.25%
- 暴擊 +0.25 個百分點
- 閃避 +0.25 個百分點

VIP20：HP/ATK +10%、DEF +5%、暴擊/閃避 +5%。

十個偶數特權：
- VIP2：主線裝備掉率 +5 個百分點
- VIP4：副本 progress ×1.10
- VIP6：特殊怪符合資格後遭遇率 8%→10%
- VIP8：成功主線掉落15%優先最弱部位
- VIP10：特殊怪勝利10%再取得一套 fresh reward
- VIP12：副本 progress 總倍率 ×1.20
- VIP14：主線掉裝5%品質 +1
- VIP16：主線 Boss 15%額外完整掉1件
- VIP18：Boss 每件10%品質 +1
- VIP20：死亡裝備不遺失；EXP懲罰仍存在

`state.vipPoints` 是正式積分來源；`dungeon.points` 只留舊資料相容鏡像。

---

## 8. 專精系統（2026-09-11 正式完成基準）

系統名稱：**專精**。

- 8 項，全部 Lv0～30。
- 使用既有金幣升級。
- 永久保留。
- 無重置、失敗率、專精總等級、技能樹、額外貨幣。
- 升到 Lv.n 的內部成本：`1000*n²`。
- **玩家「專精說明」不公開成本公式**；卡片只顯示下一次實際價格。

8 項效果：

1. **實戰訓練**：EXP +5%/Lv，最高 +150%。
2. **搜刮技巧**：怪物直接金幣 +5%/Lv，最高 +150%；不影響裝備出售。
3. **鑑價技巧**：裝備出售 +5%/Lv，最高 +150%；不影響怪物金幣／商店購買。
4. **先制技巧**：每場戰鬥第一次玩家主動普通攻擊傷害 +2%/Lv，最高 +60%。新敵人即新戰鬥；連擊／反擊不吃先制。
5. **連擊技巧**：每 Lv +1 個百分點，最高30%；觸發追加 50% 普通攻擊傷害，可再次 RNG 連擊，無玩法硬上限。
6. **穿透技巧**：每 Lv +1 個百分點，最高30%；該擊忽略25%敵防，等同有效 DEF×0.75。普通／連擊／反擊均可觸發。
7. **反擊技巧**：每 Lv +1 個百分點，最高30%；敵人實際命中且玩家存活後，40%傷害反擊。閃避／死亡不反擊；反擊可暴擊、穿透、汲取、連擊；不遞迴反擊。
8. **汲取技巧**：每 Lv +1 個百分點，最高30%；觸發時回復本擊「實際 HP 傷害」10%，不超過最大 HP；overkill 以實際扣掉 HP 計。普通／連擊／反擊均可觸發。

正式戰鬥順序：

普通主動：
```text
先制 → 穿透 → 暴擊 → 傷害 → 汲取 → 死亡判定 → 連擊
```

連擊：
```text
穿透 → 暴擊 → 傷害 → 汲取 → 死亡判定 → 再次連擊
```

敵攻：
```text
閃避 → 傷害 → 玩家死亡判定 → 反擊
```

反擊：
```text
穿透 → 暴擊 → 傷害 → 汲取 → 死亡判定 → 連擊
```

### 專精正式架構

`specialization.js` 現在只負責：
- 專精定義／等級正規化
- 升級成本與效果 helper
- 專精頁 UI
- GM 專精控制 UI
- 專精專屬樣式

它**不再**：
- wrap `expReward` / `goldReward`
- 暫時修改 `item.sell`
- wrap `addItem` / `sellLowerAll` / `sellSelected` / `inventoryContent`
- wrap `render`
- 動態重新排列主頁
- 動態插入 GM section

正式整合位置：
- state：`engine.js -> newState/load`
- EXP／金幣：`engine.js`
- 裝備實際售價：`specializationSellValue()`，由 `gearupgrade.js`／`ui.js` 直接使用
- 特殊怪 EXP／金幣：`specialmonsters.js -> getSpecialRewardContext(special,useTest)`
- 戰鬥五專精：`combatcore.js -> runCombatCore()`
- 主頁／專精 view：`ui.js`
- GM section：`gmhub.js`

`item.sell` 永遠保留基礎售價；鑑價技巧不再靠暫時竄改物件值實作。

---

## 9. 共用戰鬥核心與 presentation

正式戰鬥核心：`combatcore.js -> runCombatCore(player,enemy,startHp,options)`。

```js
calcDamage(atk,def)
= max(1, ceil((atk-def*0.55)*random(0.95~1.05)))
```

- 暴擊倍率1.5。
- 怪物 crit／dodge cap30%。
- 玩家無30%硬 cap。
- berserk：敵人 HP<50% 時 ATK×1.20。
- 連擊用 iterative `while`，不是遞迴 stack。

`runCombatCore` 會回傳 legacy `logs` 與 structured `events`。

2026-09-11 已修正：先制 event 只有在**先制專精 Lv>0 且該擊實際套用先制**時才標記，Lv0 不應再跳「先制！」。

### `combatfx.js`

只做 presentation：
- 先制：金黃
- 連擊：亮橘
- 穿透：亮紫
- 反擊：亮紅
- 汲取：亮綠
- 狂暴：橘紅
- 回血：`+XX HP` 綠色

暴擊與閃避不再額外跳第二層文字：
- 暴擊保留既有 `暴擊 -XXX`。
- 閃避保留既有大字 `閃避`，改為冰藍 `#B8F4FF`。

戰鬥紀錄預設收合：桌機 max-height 180px、手機135px，可捲動。

---

## 10. 怪物特性與掉落

7 traits：強壯、兇猛、堅硬、迅捷、致命、狂暴、巨體。

主線掉裝基礎：普通25%、菁英60%、Boss100%；VIP2 後普通30%、菁英65%。

品質升階來源：traits、VIP14、VIP18，彼此獨立可連鎖，神話 q5 封頂。

VIP16 第二件 Boss 掉落會完整走正式 `dropItem()`，但不遞迴 VIP16。

---

## 11. 特殊怪

9 種特殊怪，正式資料 `specialmonsters.js`。

基礎遭遇率8%，VIP6後10%。

eligibility：
- Boss 不觸發
- 玩家不可高於主線怪10級以上
- 當前 HP 至少30%

特殊怪敵人以**無 VIP 的 equippedStats snapshot**生成；玩家戰鬥吃 VIP＋專精。

`getSpecialRewardContext(special,useTestSpecializations=false)` 現在直接整合實戰訓練／搜刮技巧；不再靠專精 wrapper。

定位：**特殊怪是驚喜／禮物內容，不要求長期維持高壓難度。**

---

## 12. 三大副本

### 懸賞戰

Lv5 解鎖；一次一戰；普通／高級／危險三檔；勝利給 VIP 積分。

### 競技場

Lv15 解鎖；普通／困難／極限；三場連戰不回血；第一戰開始鎖玩家 snapshot；每戰勝利立即給積分。

積分：
- 普通 `[25,35,120]` = 180
- 困難 `[35,45,200]` = 280
- 極限 `[40,60,320]` = 420

### 虛空幻境

Lv25 解鎖；無限爬塔；每層前補滿該趟 snapshot HP；每10層 Boss 雙特性；只有新最高樓層首通給 VIP 積分。

怪物固定公式以 `dungeonvoid.js` 為準。

### 目前正式難度方向

2026-09-11 使用者定案：
- 不因 VIP／專精讓現有內容變容易，就回頭全面強化怪物。
- **地圖怪**定位為推進、刷 EXP／金幣／裝備，後期好打沒關係。
- **特殊怪**定位為禮物／驚喜，好打沒關係。
- **挑戰性以三大副本為主。**
- 現有懸賞／競技場難度暫時凍結；若未來最高檔過度失去挑戰，可新增「第4難度」，而不是強化舊三檔。
- 虛空本來就是無限樓層，不需為玩家成長調高既有公式。

不要未經使用者要求自行 buff 主線、特殊怪或現有副本。

---

## 13. 副本挑戰次數進度

只有主線勝利增加。

```js
敵人HP部分 = (enemyMaxHp / playerBaseHp) * 1.5
受傷部分   = ((startHp-endHp) / playerMaxHp) * 4
baseProgress = 敵人HP部分 + 受傷部分
```

受傷比例 clamp 0～1。

VIP倍率：
- VIP0～3：×1.00
- VIP4～11：×1.10
- VIP12～20：×1.20

每100 progress → +1副本挑戰次數。

由於主線怪 HP 與玩家 baseHP 都是線性等級成長，這個比值長期趨穩；以現有公式假設延伸 Lv250，單隻不會因等級本身爆炸成數十點進度。

---

## 14. GM 管理／測試

設定頁連點「設定」3下，輸入密碼進入。

GM 分「管理／測試」。

專精管理：8項正式 Lv0～30，套用後存正式檔。

專精測試：8項 session-only Lv0～30，重新整理回0，不修改正式角色資料。

五種戰鬥測試：
- 特殊怪
- 地圖怪
- 懸賞戰
- 競技場
- 虛空幻境

結果摘要統一三行：
1. 測試名稱＋次數／模式
2. VIP
3. `專精｜先制傷害 +X%｜連擊率 X%｜穿透率 X%｜反擊率 X%｜汲取率 X%`

後五項戰鬥專精全部由 `runCombatCore(...,{useTestSpecializations:true})` 正式測試。

2026-09-11 已補齊前三項經濟專精的 GM 測試：
- 地圖怪的 EXP 用 `expReward(enemy,true)`。
- 地圖怪金幣用 `goldReward(enemy,true)`。
- 地圖怪掉裝會統計本次測試鑑價後總售價。
- 特殊怪 reward context 用 `getSpecialRewardContext(special,true)`。
- 特殊怪掉裝同樣統計測試鑑價後總售價，sandbox auto-sell 也使用測試專精。

懸賞／競技場／虛空本來不給一般 EXP／金幣，因此前三項經濟專精不改它們的勝率結果。

GM sandbox 不得污染正式角色資料。

---

## 15. 目前架構清理結果

專精完成後已進行正式來源整理：

- `specialization.js` 的 `installEconomyHooks()` 已刪除。
- 專精不再 wrap `render()`。
- 專精不再用 `arrangeHomeMenu()` 後排主頁。
- 專精不再用 `injectGmSection()` 後插 GM。
- `ui.js` 正式 home 直接包含「專精」與「副本」入口。
- `ui.js` 正式 view map 直接包含 specialization view。
- `gmhub.js` 直接包含「專精管理／專精測試」。
- `dungeonui.js` 會辨識已存在的正式副本卡，不重複插入。
- 裝備售價直接使用 `specializationSellValue()`，不再暫時修改 `item.sell`。
- `engine.js newState()` 正式含 `specializations`，舊存檔由 `ensureSpecializationState()` 補齊。

仍有其他 subsystem wrapper 是既有架構的一部分，例如 `dungeonui.js` 的 dungeon route/render extension、`levelcap.js` 的滿等結算等；未經需求不要為「漂亮」大規模重構。

---

## 16. 後續世界規劃與平衡原則

目前 Lv1～100 完成。

曾規劃：
- Lv101～150 銀河系戰爭

後續也討論過長期可擴至 Lv250；主線怪、玩家基礎與裝備多採線性成長，設計上可延伸，但正式新增地圖前仍需重新試算。

現階段不要因專精／VIP 自動重調已接受的地圖怪、特殊怪或副本公式。

---

## 17. 真機／回歸驗證重點

專精：
- 舊存檔載入後8項都存在且原等級保留。
- 新遊戲8項皆Lv0。
- 升級扣金、Lv30封頂、刷新後正式等級保留。
- 專精說明不顯示 `1000*n²`，卡片仍顯示當次價格。
- Lv0先制不跳「先制！」；Lv1以上第一個主動攻擊正常觸發。
- 連擊／穿透／反擊／汲取在主線、特殊怪、三副本共用。
- 鑑價後背包顯示、單件出售、一鍵出售、自動出售金額一致。

浮字：
- 暴擊不額外跳第二個「暴擊！」。
- 閃避只有原大字且為冰藍。
- 六個特殊浮字顏色保持定案。
- iPhone Safari 多次連擊時確認浮字不過度重疊。

GM：
- 8項測試 selector 可用且 refresh 回0。
- 五種戰鬥摘要三行一致。
- 地圖怪／特殊怪測試 EXP、金幣、鑑價統計會隨前三項測試專精改變。
- 測試不污染正式角色。

UI：
- 首頁只有一張副本卡，順序為：冒險｜角色｜專精｜副本｜背包｜商店｜設定。
- 專精頁桌機4×2、手機2×4。

---

## 18. 下一個對話標準接手指令

> 你正在接手 GitHub `franksky1207/rpg` 的《文明戰線》專案。先讀 `PROJECT_HANDOFF.md`，但 **GitHub `main` 的實際程式碼才是唯一真實來源**。
>
> 接手後先重新讀 `index.html` 確認 script load order，再讀需求涉及的正式檔案與目前 SHA。修改優先進正式來源，不要新增 wrapper／fallback／第二套公式。
>
> 截至 2026-09-11，VIP0～20 與專精8項 Lv0～30皆已進入正式完成／平衡凍結階段。專精已完成架構清理：state、EXP／金幣、出售、特殊怪 reward、戰鬥、主頁與 GM 都已接回正式來源。除 bug、真機問題或使用者新需求外，不要自行重做已接受系統。
>
> 地圖怪主要負責推進／刷資源，特殊怪是驚喜禮物，主要挑戰集中在三大副本。不要因 VIP／專精讓舊內容變簡單就自行 buff；未來若需要，懸賞／競技場優先新增第4難度，虛空以無限樓層自然延伸。
