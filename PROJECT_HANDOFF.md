# 《文明戰線》正式跨對話交接文件

> **最高原則：GitHub `main` branch 的實際程式碼永遠是唯一真實來源。**
>
> 本文件是給下一個 ChatGPT／後續開發對話使用的「快速承接層」。若本文與 `main` 實際程式碼衝突，**一律以 `main` 為準**。接手後應先讀本文，再重新讀取本次要修改的正式檔案與 `index.html` 實際載入順序。
>
> 本文件已依 2026-09-09 最新 `main` 重新整理，舊交接內容中與目前程式衝突的 Lv50、10 張地圖、舊 UI wrapper、舊 GM UI、舊連續戰鬥與舊奇幻地圖等資訊已移除或修正。

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
- GM 密碼：`franksky`
- 正式世界：Lv1～100、20 張地圖
- 必須同時支援桌機與手機；使用者會以 iPhone Safari 與桌機實際測試

遊戲核心方向：**傳統、簡單、文字型 RPG**。
目前主要系統：打怪、升級、金幣、裝備、地圖、Boss、副本、特殊怪、商店、GM 管理／測試。

目前不要主動加入：職業、技能樹、複雜任務、大量劇情、多角色、PvP、排行榜、登入／每日系統等，除非使用者之後明確要求。

世界規劃：
- Lv1～50：地球戰爭（已完成）
- Lv51～100：太陽系戰爭（已完成）
- Lv101～150：銀河系戰爭（規劃中，**尚未實作**）

---

## 2. 給下一個 ChatGPT 的操作規範（必讀）

### 2.1 執行語意

如果使用者說：
- 「做」
- 「修改」
- 「修正」
- 「執行」
- 「第 1 批／第 2 批／第 3 批」
- 「可以」且上下文已經明確是在要求執行

→ **可以直接修改 GitHub `main`，不需要再要求使用者貼程式碼，也不需要重複確認已經講清楚的內容。**

如果使用者說：
- 「先不要改」
- 「先建議」
- 「先討論」
- 「你覺得如何／你覺得呢」

→ **只能討論，不得寫入 GitHub。**

### 2.2 每次修改流程

1. **修改前先重新抓目前 `main` 的相關檔案。**
2. 同時檢查 `index.html` 的實際 script load order；不要只看函式第一次出現在哪裡。
3. 找出目前真正的正式來源與最後有效覆蓋。
4. 優先直接修改正式來源。
5. **不要額外新增 wrapper、fallback、alias、第二套公式、第二套 GM 邏輯或第二套 UI 產生器來繞過正式來源。**
6. 若發現舊程式已完全失效且沒有 consumer，應直接刪除，而不是留著當「備用」。
7. 修改後重新抓取修改過的檔案確認內容與 SHA。
8. `.js` / `.css` 有修改時，必須同步更新 `index.html` 對應 `?v=` cache-bust。
9. 更新 `index.html` 後，再重新讀一次確認載入路徑與版本正確。
10. GitHub 寫入完成不代表真機測試完成；Pages 實際 UI／Safari 行為仍由使用者最後測試。
11. 重要系統或架構修改後，應同步更新本 `PROJECT_HANDOFF.md`。

### 2.3 架構原則

- **main 是唯一真實來源。**
- classic `<script>` 的 load order 是架構的一部分。
- 頂層 `let/const` 可能互撞；獨立模組通常使用 IIFE。
- 不要看到舊檔名或舊交接描述就假設它仍有效；先看 `index.html` 是否還載入，以及後面是否有正式覆蓋。
- 現在最重要的方向是「單一正式來源」，避免再次發生前面改對、後面舊檔又蓋回去的問題。
- 裝備、戰鬥、怪物特性、GM 模擬尤其禁止再複製公式。
- 若要清理現有 wrapper，必須先確認它是否仍負責正式功能（例如 `levelcap.js`、`dungeonui.js`、`traitlock.js`、`traitdrop.js`、`gearupgrade.js` 目前仍有有效責任，不能因為看到 wrapper 就直接刪）。

---

## 3. 目前 `index.html` 正式載入架構

2026-09-09 最新 `main` 已不再載入：
- `battleflow.js`
- `playername.js`
- `level100.js`
- `worldexpansion.js`
- `uifix.js`
- 更早已刪除：`specialgm.js`、`battlelimit.js`、`risksettlement.js`

目前主要載入順序（以 `index.html` 實際內容為準）：

```text
data.js
worldmaps-earth.js
worldmaps-solar.js
engine.js
combatcore.js
dungeonprogress.js
dungeoncore.js
ui.js
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

重要理解：
- `data.js` 現在只放 SAVE／品質與 `MAPS=[]`，不再放舊奇幻地圖。
- `worldmaps-earth.js` + `worldmaps-solar.js` 是正式 20 張地圖來源。
- `engine.js` 是核心狀態、裝備、獎勵、商店等基礎來源。
- `balance.js` 後載入後正式覆蓋主線 `monsterBase()` / `monsterObj()` 的怪物平衡。
- `level100balance.js` 後載入後正式覆蓋 `expNeed()`。
- `traits.js` 是怪物特性正式核心；`traitlock.js` 再處理主線預覽特性持久化。
- `combatcore.js` 是正式共用戰鬥核心。
- `ui.js` 現在直接承擔主線冒險正式 UI，不再依靠舊 playername／battleflow／level100／worldexpansion／uifix 補丁。

---

## 4. Lv1～100 正式世界

每 5 級 1 張地圖；每張固定：
- 3 隻普通怪
- 1 隻菁英
- 1 隻 Boss

總計：
- 20 張地圖
- 100 隻主線怪
- 每張地圖 5 個裝備名稱（對應 5 部位）

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

怪物／裝備名稱一律以：
- `worldmaps-earth.js`
- `worldmaps-solar.js`

為準。

`data.js` 裡舊「新手平原／幽暗森林／魔王領域」等奇幻地圖已正式刪除。

### 世界狀態與舊存檔

`engine.js` 已正式用 `MAPS.length` 建立：
- `mapProgress`
- `bossProgress`
- `bossLocked`
- `bossKilled`

舊存檔若陣列較短，`normalizeWorldState()` 會補齊目前 20 張地圖所需資料，不會再靠 `worldexpansion.js` 補丁。

---

## 5. 玩家與主線怪正式能力

### 5.1 玩家基礎能力

```js
baseHP(l)  = ceil(110 + 12*(l-1))
baseATK(l) = ceil(15 + 2.2*(l-1))
baseDEF(l) = ceil(7 + 1.2*(l-1))
```

玩家裝備後能力：
- HP / ATK / DEF 直接加總
- crit / dodge 直接加總並最低限制 0
- **玩家 crit / dodge 沒有 30% 硬上限**

### 5.2 主線怪正式基礎（`balance.js`）

```js
hp  = ceil(62 + 16.2*l)
atk = ceil(10.5 + 2.45*l)
def = ceil(3.2 + 0.92*l)
```

階段倍率 HP / ATK / DEF：
- 第 1 普通：1.00 / 1.00 / 1.00
- 第 2 普通：1.12 / 1.10 / 1.08
- 第 3 普通：1.30 / 1.22 / 1.16
- 菁英：1.62 / 1.36 / 1.24
- Boss：2.12 / 1.48 / 1.30

style：
- `tank`：HP ×1.25、ATK ×0.90
- `attack`：HP ×0.85、ATK ×1.20

### 5.3 傷害與暴擊

```js
calcDamage(atk,def)
= max(1, ceil((atk - def*0.55) * random(0.95~1.05)))
```

- 暴擊倍率：`1.5×`
- 每次傷害最低 1
- 正式共用常數：`CRIT_DAMAGE_MULTIPLIER = 1.5`
- 怪物暴擊上限：30%
- 怪物閃避上限：30%

---

## 6. 正式共用戰鬥核心

正式核心：`combatcore.js -> runCombatCore(player, enemy, startHp, options)`。

此核心目前被：
- 主線
- 副本
- 特殊怪
- GM 戰鬥模擬

共用。

重要規則：
- **沒有 200 回合上限。**
- 舊 `battlelimit.js` 已刪除。
- 舊 `traits.js` 裡那套 200 回合 `fightOnce()` 已清除。
- `VOID_MIRAGE_GM_SIM_LIMIT = 10000` 是「GM 最多連續模擬樓層數」的安全限制，**不是戰鬥回合上限，不要誤刪。**
- `options.logs=false` 供 GM 無動畫批量模擬。
- 主線傳 `mainlineLogs:true`，保留主線動畫 parser 需要的閃避文字格式。

`combatcore.js` 的 `fightOnce()` 負責主線 settlement：
- 勝利 EXP／金幣
- 主線進度
- Boss 解鎖下一地圖
- 掉落
- 死亡懲罰
- Boss 戰敗重新鎖定

副本與特殊怪則各自保留模式 settlement wrapper，但戰鬥計算共用 `runCombatCore()`。

---

## 7. EXP、金幣與滿等

### 7.1 EXP 基礎

```js
sameExp(l) = ceil(25 + 4*l)
```

等級差倍率：
- 怪高玩家 ≥5：1.30
- +3～4：1.20
- +1～2：1.10
- 同級：1.00
- -1～-2：0.90
- -3～-5：0.60
- -6～-10：0.25
- 低超過 10 級：0.05

種類倍率：
- 普通：1
- 菁英：2
- Boss：5

### 7.2 永久 EXP 曲線（正式有效來源：`level100balance.js`）

```js
x   = (level-1)^1.8
mid = 64^1.8
factor = 5 + 195 * x/(x+mid)
expNeed(level) = ceil(sameExp(level) * factor)
```

設計意義：
- Lv1 同級普通怪約 5 隻升級
- 隨等級提高逐步變難
- 高等級漸近約 200 隻同級普通怪，不會無限爆增

`window.level100ExpFactor` 目前仍存在，但只是 `expProgressionFactor` 的相容 alias；不要把它誤認為第二套 EXP 公式。

### 7.3 金幣

```js
goldBase(l) = ceil(6 + 4*l)
```

種類倍率：
- 普通：1
- 菁英：2.5
- Boss：6

### 7.4 滿等 Lv100

- `MAX_LEVEL=100` 已在 `engine.js` 正式核心化。
- `level100.js` 已刪除。
- Lv100 不再累積 EXP。
- 主線與特殊怪在玩家戰鬥開始時已滿等時，該場原本 EXP 會 **1:1 轉成金幣**。
- `levelcap.js` 負責這個滿等轉換；它現在不再設定 Lv50，也不再覆蓋 `gainExp()` / `applyDeathPenalty()`。
- `levelcapresult.js` 負責在主線結算顯示「滿等 EXP 轉金幣」資訊。

---

## 8. 裝備系統最新正式基準

### 8.1 品質

| 品質 | q | 能力倍率 | 出售倍率 |
|---|---:|---:|---:|
| 普通 | 0 | 1.00 | 1.0 |
| 優良 | 1 | 1.15 | 1.4 |
| 稀有 | 2 | 1.35 | 2.0 |
| 史詩 | 3 | 1.60 | 3.2 |
| 傳說 | 4 | 1.95 | 5.0 |
| 神話 | 5 | 2.40 | 8.0 |

神話不可自動出售。

### 8.2 五個部位

```js
EQUIPMENT_TYPES=["weapon","helmet","armor","shoes","accessory"]
```

主能力：
- 武器：ATK
- 頭盔：HP
- 鎧甲：DEF
- 鞋子：HP
- 飾品：暴擊

### 8.3 主能力公式

```js
weapon = ceil((3 + 1.55*level) * qualityMultiplier)
helmet = ceil((8 + 2.5*level) * qualityMultiplier)
armor  = ceil((1 + 0.65*level) * qualityMultiplier)
shoes  = ceil((8 + 2.5*level) * qualityMultiplier)
```

飾品主暴擊只看品質、不看裝備 Lv：
- 普通：1～2%
- 優良：2～3%
- 稀有：3～5%
- 史詩：5～7%
- 傳說：7～9%
- 神話：9～10%

### 8.4 詞條池

- 武器：ATK / 暴擊 / HP
- 頭盔：HP / DEF / 閃避
- 鎧甲：DEF / HP / 閃避
- 鞋子：閃避 / DEF / HP
- 飾品：暴擊 / ATK / HP / 閃避

詞條數：
- 普通：0
- 優良：1
- 稀有：50% 1 條 / 50% 2 條
- 史詩：2
- 傳說：50% 2 條 / 50% 3 條
- 神話：3

**同一件裝備詞條不重複**；`rollAffixes()` 直接從 pool `splice()`。

ATK / DEF / HP 詞條：

```js
ATK = ceil((1 + 0.45*level) * m)
DEF = ceil((0.5 + 0.20*level) * m)
HP  = ceil((3 + 0.9*level) * m)
```

暴擊／閃避詞條只依品質、不依裝備 Lv：
- 優良：1%
- 稀有：1～2%
- 史詩：2～3%
- 傳說：3～4%
- 神話：4～5%

### 8.5 裝備評分（正式比較標準）

```js
rateWeight = 20 + 0.5*itemLevel
score = ATK*5 + DEF*5 + HP
      + crit*rateWeight
      + dodge*rateWeight
```

`gearupgrade.js` 目前以這個 `equipmentScore()` 做：
- 是否是真正升級
- 一鍵裝備較強裝備
- 一鍵賣出較低／同評分裝備
- 判定「若新裝備更強就自動保留」

### 8.6 掉落

主線掉落率：
- 普通：25%
- 菁英：60%
- Boss：100%

裝備 Lv offset：
- 普通：`[-2,-1,0,0,+1]`
- 菁英：`[-1,0,0,+1]`
- Boss：`[-1,0,0,+1,+2]`
- 最終 clamp 到 `1～MAX_LEVEL`

有特性的主線怪由 `traitdrop.js` 接手掉落：
- 1 特性：成功掉裝後 15% 機率品質 +1
- 2 特性：成功掉裝後 30% 機率品質 +1
- 神話不再升階
- **舊 Lv50 掉裝上限 Bug 已修正為 `MAX_LEVEL`**

---

## 9. 商店

正式刷新成本：

```text
100 → 200 → 400 → 800 → 1600 → 3200 → 6400 → 12800
```

- 到 12800 後可重置回 100
- 重置冷卻 1 小時
- 買一件商品會讓刷新價格下降 1 級
- 首次解鎖新地圖會免費刷新
- 商店不會出神話
- 商店一次 3 件

`shopbalance.js` 正式品質：
- 普通 25%
- 優良 40%
- 稀有 25%
- 史詩 8%
- 傳說 2%
- 神話 0%

商店三件部位：
- 第 1 件：目前最弱部位
- 第 2 件：目前次弱部位
- 第 3 件：隨機部位

「最弱」以 `equipmentScore()` 判斷。

死亡遺失裝備：
- 穿戴裝備有 30% 機率隨機掉一件
- 放進商店「遺失裝備贖回」
- 贖回價：`ceil(item.buy * 2)`
- 可永久放棄

---

## 10. 主線地圖推進與 Boss

每張地圖：前三普通、菁英、Boss。

解鎖流程：
- 第 1 怪打 10 隻 → 第 2 怪
- 第 2 怪打 10 隻 → 第 3 怪
- 第 3 怪打 10 隻 → 菁英
- 菁英進度到 10 且角色達地圖最大等級 → Boss 出現

Boss：
- 第一次勝利會解鎖下一張地圖並免費刷新下一地圖商店
- Boss 勝利後可再次挑戰
- Boss 戰敗：Boss 重新鎖定，需再擊敗該地圖菁英 10 隻才能重開
- 最後一張地圖不會再解鎖不存在的第 21 張地圖

主線怪卡現在直接顯示：
- 名稱／等級
- 菁英／Boss badge
- 特性
- HP / ATK / DEF
- 目前 `x/10` 進度
- Boss 等級不足／Boss 再挑戰規則說明

舊 `mapProgressHtml()` 摺疊進度區已不再是正式冒險頁呈現方式；進度直接整合進怪物卡。

---

## 11. 主線連續戰鬥（2026-09-09 最新規則）

### 11.1 解鎖表

```js
Lv1  -> 單場
Lv6  -> 5 場
Lv11 -> 10 場
Lv16 -> 15 場
Lv21 -> 20 場
Lv26 -> 25 場
```

所以：
- Lv1～5：1
- Lv6～10：1 / 5
- Lv11～15：1 / 5 / 10
- Lv16～20：1 / 5 / 10 / 15
- Lv21～25：1 / 5 / 10 / 15 / 20
- Lv26～100：1 / 5 / 10 / 15 / 20 / 25

Boss 永遠只允許單場。

### 11.2 下一階段提示

未滿 Lv26 時，戰鬥次數區下方顯示下一個解鎖，例如：

```text
Lv.11 將開放 10 場
Lv.21 將開放 20 場
```

Lv26 已開放 25 場後提示消失；Boss 不顯示連戰下一階段提示。

### 11.3 UI

- 桌機：目前可用按鈕在同一橫列，依數量等分。
- 手機：目前可用按鈕也保持同一橫列，最多 6 格，不改成直向堆疊。
- 不顯示尚未解鎖的灰色按鈕。

### 11.4 連戰回血規則

主線連續戰鬥現在是「便利功能」，不是累積 HP 生存挑戰：

1. 開始整批戰鬥前補滿 HP。
2. 每場勝利後，**下一場開始前補滿 HP**。
3. 副本進度必須先用本場真實 `startHp` / `combatEndHp` 計算，再回血。
4. 任一場戰敗立即終止整批，剩餘場次取消。
5. 戰敗照正常死亡懲罰。
6. 戰敗後補滿 HP，返回同地圖的怪物／戰鬥次數準備畫面。
7. 前面已完成場次的 EXP、金幣、裝備與副本進度保留。

舊 `<30% HP` 暫停、風險 modal、繼續／休息／階段重啟流程已正式刪除；不要重建。

`battlepipeline.js` 是目前正式連戰流程。

---

## 12. 怪物特性正式單一核心

正式資料：`traits.js`

7 種特性：
- 強壯：HP +20%
- 兇猛：ATK +15%
- 堅硬：DEF +20%
- 迅捷：閃避 +8%
- 致命：暴擊 +8%
- 狂暴：HP 低於 50% 時 ATK +20%
- 巨體：HP +30%、ATK +5%、閃避 -5%

正式套用函式：

```js
applyMonsterTraits(enemy, traitIds)
```

重要：
- 會保留敵人原本的 crit / dodge，再加特性。
- 最後 monster crit / dodge clamp 到 0～30%。
- 主線、懸賞、競技場、虛空幻境現在共用這一套，不再各寫一份特性效果公式。

主線特性數量機率：
- 普通：70% 0 特性、25% 1、5% 2
- 菁英：35% 0、50% 1、15% 2
- Boss：15% 0、55% 1、30% 2

`traitlock.js` 會把主線預覽到的 traits 存在 `state.monsterTraitPreview`，避免重 render 就洗掉同一隻怪的預覽特性；真正打完後會清掉對應 preview。

---

## 13. 副本共通系統

正式副本狀態：

```js
state.dungeon = {
  progress,
  attempts,
  points
}
```

### 13.1 副本次數累積進度

只有 **主線勝利** 會加：

```js
敵人HP部分 = (enemyMaxHp / playerBaseHp) * 1.5
受傷部分   = ((startHp - endHp) / playerMaxHp) * 4
總增加     = 敵人HP部分 + 受傷部分
```

- 只計算 `source="main"` 且 `win=true`
- 每累積 100% → 自動轉成 1 次副本可挑戰次數
- 連戰每場都先算實際受傷，再回血，因此不會把受傷部分洗成 0

### 13.2 副本 run 共通規則

`dungeoncore.js`：
- `beginDungeonRun({cost:1})`：扣 1 次、進場補滿 HP
- `finishDungeonRun()`：預設結束後補滿 HP
- `dungeonFightCore()`：薄 wrapper，戰鬥直接呼叫 `runCombatCore()`

副本首頁目前解鎖：
- 懸賞戰：Lv5
- 競技場：Lv15
- 虛空幻境：Lv25

---

## 14. 懸賞戰

解鎖 Lv5；每次消耗 1 副本次數。

敵人依「目前玩家實際能力快照」動態生成，不是固定主線公式。

共同基底 `specialBaseEnemyFromPlayer()`：

```js
def = ceil(playerATK * 0.45)
playerHit = max(1, playerATK - def*0.55)
baseHP = ceil(playerHit * 6)
baseDamage = playerHP / 8
```

三種懸賞：

### 普通懸賞
- 出現權重 45
- 積分 80
- HP ×1.00
- damage ×1.00
- DEF ×0.88
- 1 個特性

### 高級懸賞
- 權重 35
- 積分 120
- HP ×1.03
- damage ×1.06
- DEF ×0.90
- 1 個特性

### 危險懸賞
- 權重 20
- 積分 180
- HP ×1.08
- damage ×1.10
- DEF ×0.92
- 50% 1 特性 / 50% 2 特性

crit / dodge 依玩家實際 crit / dodge 經各 tier scale / add / cap 計算，再套共用怪物特性，最後仍受怪物 30% 上限。

敵人 level 使用 `clampGameLevel()`，舊 Lv50 metadata 限制已修正。

---

## 15. 競技場

解鎖 Lv15；每次消耗 1 副本次數。

規則：
- 三戰連續
- **場與場之間不回血**
- 每戰敵人仍依玩家實際能力快照生成
- 通過每戰取得階段積分；三戰全通再加 bonus

### 積分

普通：
- 30 + 40 + 50
- 全通 bonus +40
- 總計 160

困難：
- 40 + 55 + 70
- bonus +65
- 總計 230

極限：
- 50 + 70 + 95
- bonus +105
- 總計 320

### 正式階段倍率

普通：
- 戰1 HP .60 / damage .60 / DEF .78
- 戰2 .69 / .68 / .80
- 戰3 .78 / .76 / .82

困難：
- 戰1 .64 / .62 / .80
- 戰2 .70 / .68 / .83
- 戰3 .78 / .75 / .85

極限：
- 戰1 .63 / .61 / .80
- 戰2 .70 / .67 / .83
- 戰3 .80 / .75 / .86

特性數量依各 stage `traitMode` 決定，實際效果統一走 `applyMonsterTraits()`。

敵人 level 使用 `clampGameLevel()`，舊 Lv50 限制已修正。

---

## 16. 虛空幻境

解鎖 Lv25；每次進場消耗 1 副本次數。

核心規則：
- 無限樓層
- 從 `highestCleared + 1` 開始
- **每層開始前完全補滿 HP**
- 每層勝利後也補滿 HP，再進下一層
- 普通樓層固定 1 特性
- 每 10 層為 Boss 樓層，固定 2 個不重複特性
- 可要求「本層結束後強制退出」
- 首通才推進 highestCleared 與給積分

等效強度：

```js
equivalentPower(floor) = 24 + floor/10
```

基礎能力：

```js
HP  = ceil((62 + 16.2*e) * 2.40)
ATK = ceil((10.5 + 2.45*e) * 2.15)
DEF = ceil((3.2 + 0.92*e) * 2.65)
crit = 10
dodge = 8
```

再套 `applyMonsterTraits()`。

首通積分：

```js
points = round(15 + 1.75*sqrt(floor-1))
```

Boss 樓層 ×2。

`dungeonvoidui.js` 現在已直接包含原本 `uifix.js` 才負責的正式功能：
- 玩家名稱
- 玩家 HP / ATK / DEF / 暴擊 / 閃避顯示
- 強制退出按鈕位置
- 手機版緊湊布局

因此 `uifix.js` 已刪除且不應重建。

---

## 17. 特殊怪

正式遭遇機率：

```js
SPECIAL_ENCOUNTER_RATE = 0.08
```

共 9 種：
1. 稀有資源聚合體
2. 誘餌補給艙
3. 終止協議單元
4. 機率增幅信標
5. 封存警戒機
6. 裝備保全單元
7. 黑市武裝頭目
8. 戰利品回收者
9. 流動交易代理人

特殊怪也依玩家能力快照生成，tier 分 low / mid / high。

重要正式基底與特殊獎勵效果都在 `specialmonsters.js`；戰鬥薄 wrapper 在 `specialcore.js`。

特殊怪可有：
- EXP 倍率
- 金幣倍率
- 必掉／不掉
- 指定品質表
- 最低品質
- 一次多件
- 優先補弱部位
- 商店刷新價格下降
- 流動交易代理人隨機財富／知識／裝備獎勵

特殊怪 level 使用 `clampGameLevel()`，舊 Lv50 限制已修正。

主線連戰每場開始前都會跑 before-fight hook；若觸發特殊遭遇，原連戰會依特殊遭遇流程提前處理，不應另外做第二個特殊怪觸發器。

---

## 18. 玩家名稱與 UI 正式來源

玩家名稱：
- `state.playerName`
- 預設「玩家」
- 最多 12 字
- 空白儲存會恢復「玩家」

目前已直接整合進 `ui.js`，並被懸賞／競技場／虛空 UI 使用。

舊 `playername.js` 已刪除。

遊戲名稱「文明戰線」也已直接寫入 `index.html` / `ui.js`，舊 `worldexpansion.js` 的 `replace("純文字 RPG","文明戰線")` 已刪除。

---

## 19. GM 管理與測試

### 19.1 GM 入口

設定頁連點「設定」標題 3 下 → 密碼 modal → `franksky`。

正式 GM UI 來源：`gmhub.js`。

`gmtools.js` **不再保存另一份舊 `gmHtml()`**；之前雙 GM UI 造成的覆蓋風險已清理。

### 19.2 管理頁

一般管理：
- 指定等級（1～MAX_LEVEL）
- 指定金幣
- 指定主線攻略到哪個等級關卡
- 補滿 HP
- 清空背包（不動穿戴）
- 刷新商店
- 重置商店刷新價格
- 產生裝備

產生裝備目前預設：
- 品質：**傳說**
- 等級：目前角色等級
- 部位選單順序：**全部**、武器、頭盔、鎧甲、鞋子、飾品
- 「全部」會一次用正式 `makeItem()` 各產 1 件五部位裝備

副本管理：
- 指定副本進度 %
- 指定副本可挑戰次數
- 指定副本積分

### 19.3 共用 GM 測試基礎

```js
GM_TEST_RUNS = 100
```

適用：
- 特殊怪
- 地圖怪
- 懸賞
- 競技場

虛空幻境不是固定 100 次測試。

GM sandbox：
- `gmCreateSandboxSnapshot()`
- `gmResetSandbox()`
- `gmRestoreSandbox()`

目的：批量測試不修改正式角色資料。

共同獎勵 HTML：`gmRewardSummaryHtml()`。

同步批量測試結束後避免整頁 `render()`，結果直接寫回目前 GM 區塊，避免畫面閃爍與選項重置。

### 19.4 特殊怪 GM ×100

- dropdown 選 9 種特殊怪
- 頁面記憶目前選擇；重新載入才回第一隻
- 統計：
  - 勝率
  - 勝利平均剩餘 HP
  - 死亡掉裝次數
  - 模擬獎勵合計（EXP／金幣／品質分布等）
- 使用正式 `specialFightCore()`、`specialMakeDrops()`、`specialApplyShopDiscount()`
- 舊 `specialgm.js` 已刪除

### 19.5 地圖怪 GM ×100

舊「副本進度／刷怪測試」已正式改為「地圖怪測試」。

- 選地圖
- 選怪物
- 地圖改變時怪物重設為第一隻
- 直接用正式主線怪生成、戰鬥、獎勵、掉落、死亡懲罰
- 統計同特殊怪：勝率／勝利平均剩餘 HP／死亡掉裝次數＋模擬獎勵

### 19.6 懸賞 GM ×100

三按鈕：
- 普通懸賞測試（100 次）
- 高級懸賞測試（100 次）
- 危險懸賞測試（100 次）

統計只保留：
- 勝率
- 勝利平均剩餘 HP
- 平均回合

桌機 3 欄；手機垂直。

### 19.7 競技場 GM ×100

三按鈕：
- 普通
- 困難
- 極限

每次模擬完整三連戰，統計 9 項：
- 第 1 戰通過
- 第 2 戰到達
- 第 2 戰條件通過
- 第 3 戰到達
- 第 3 戰條件通過
- 全通率
- 平均積分
- 全通平均剩餘 HP
- 平均總回合

### 19.8 虛空幻境 GM

功能：
- 指定樓層「查看單層能力」
- 指定起始樓層「從此層連續爬塔」

爬塔結果保留 8 張統計卡：
- 起始樓層
- 成功層數
- 最後成功樓層
- 停止／失敗樓層
- 本次總積分
- 平均每層積分
- 平均戰鬥回合
- 最後成功剩餘 HP

`VOID_MIRAGE_GM_SIM_LIMIT=10000` 保留，代表最多模擬樓層數，不是回合限制。

---

## 20. 這個對話期間完成的重要 Bug 修正／清理

### 20.1 連戰 Lv37 仍只有 15 場

症狀：
- `ui.js` 已改 25 場，但手機、桌機都仍只顯示到 15 場。

根因：
- 後載入的舊 `traits.js` 還完整重寫 `adventurePreparePage()`，裡面保留舊 `[1,5,10,15]` 解鎖規則。

修正：
- 舊規則刪除。
- 最終把冒險正式 UI 收斂到 `ui.js`。
- `traits.js` 不再重寫戰鬥次數 UI。

### 20.2 `traits.js` 還藏著舊 200 回合戰鬥

同一次檢查發現 `traits.js` 仍有舊 `fightOnce()`／`runBattles()` 與 200 回合限制、低血量流程殘留。

修正：全部刪除；正式戰鬥回到 `combatcore.js` + `battlepipeline.js`。

### 20.3 GM 產生裝備改了卻沒生效

根因：
- `gmtools.js` 的舊 `gmHtml()` 被後載入 `gmhub.js` 的另一套 GM UI 蓋掉。

修正：
- GM 裝備預設「傳說」與「全部」順序改到真正有效的 `gmhub.js`。
- 後續第 1 批清理已把 `gmtools.js` 的舊 `gmHtml()` 整段刪除。

### 20.4 Lv50 歷史限制

已修正：
- `engine.js` 核心 `MAX_LEVEL=100`
- 世界陣列讀 `MAPS.length`
- 主線裝備 Lv 上限用 `MAX_LEVEL`
- 懸賞敵人 level 不再卡 50
- 競技場敵人 level 不再卡 50
- 特殊怪 level 不再卡 50
- 特性怪掉裝 `traitdrop.js` 不再卡 50

### 20.5 舊奇幻地圖

`data.js` 原本仍保存 10 張舊奇幻地圖，但實際被地球地圖覆蓋。

修正：正式刪除，只留下 `MAPS=[]`，由兩支 world map 檔載入。

### 20.6 舊多層 UI 補丁

已正式刪除：
- `battleflow.js`
- `playername.js`
- `level100.js`
- `worldexpansion.js`
- `uifix.js`

相應功能已搬進正式來源，不是直接丟功能。

### 20.7 舊低血量連戰

已刪：
- `<30% HP` 暫停
- risk modal
- `lowHp()`
- `showRiskModal()`
- `continueRiskBattle()`
- `riskRest()`
- `risksettlement.js`

### 20.8 共用怪物特性

懸賞／競技場／虛空原本各自複製一套七特性效果。

修正：全部改用 `traits.js -> applyMonsterTraits()`。

---

## 21. 目前仍存在、但不要誤判為垃圾的正式層

三批清理後仍有一些後載入 wrapper／覆蓋，**它們目前仍有正式責任**：

- `balance.js`：正式主線怪平衡，覆蓋 `engine.js` 基底怪公式。
- `level100balance.js`：正式 EXP 曲線，覆蓋 `engine.js` 舊基底 `expNeed()`。
- `traitlock.js`：讓主線預覽 traits 固定／可存檔。
- `traitdrop.js`：特性怪品質升階掉落。
- `shopbalance.js`：正式商店品質與弱部位邏輯。
- `gearupgrade.js`：正式裝備評分升級判斷與批量裝備／出售。
- `levelcap.js`：Lv100 EXP 轉金幣。
- `levelcapresult.js`：主線滿等轉換結算提示。
- `dungeonui.js`：副本頁面的正式 route／首頁／冒險側欄副本狀態整合。
- `settlementui.js`：主線結算擴充。
- `adventureprogressui.js`：目前已縮成**純怪物卡進度樣式注入**，不再覆蓋 `adventurePreparePage()`。

未來若要繼續「核心化」這些檔案，可以討論，但**沒有使用者要求時不要為了漂亮而大規模重構。**

---

## 22. 尚未完成／未實作項目

目前明確尚未完成：

1. **跨裝置雲端存檔**：目前只有 `localStorage`；手機與桌機不能自動共用存檔。
2. **Lv101～150 銀河系戰爭**：只有方向，尚未加入地圖、怪物、裝備與等級上限。
3. **VIP 系統**：曾討論過 V0～V20 與暴擊／閃避加成概念，但目前 `main` 沒有實作，不可當成正式規則。
4. `adventureprogressui.js`、`gmhub.js`、`dungeonui.js`、`dungeonvoidui.js` 仍有 JS 動態注入 CSS；目前功能正常，是否搬回 CSS 檔屬未來可選清理，不是必要修正。
5. 目前沒有登入、Firebase、Google 試算表存檔、排行榜、多人功能。

除此之外，不要從舊對話自行推測「待辦」。以使用者下一步指示與 `main` 為準。

---

## 23. 真機驗證重點

重大改動後，建議至少檢查：

### 主線
- Lv7：單場＋5場，底下顯示 Lv11 開 10場
- Lv16：開到15場，顯示 Lv21 開20場
- Lv26+：1/5/10/15/20/25 六個同排，提示消失
- Boss：只單場
- 連戰每勝一場後下一場滿血
- 戰敗立即終止並回準備頁

### 裝備
- 5 部位主能力正確
- 同件詞條不重複
- 飾品主暴擊與 crit/dodge 詞條不隨 Lv 異常成長
- Lv51～100 特性怪可以掉 Lv50 以上裝備

### GM
- 產生裝備預設傳說
- 部位第一個是「全部」
- 特殊／地圖怪／懸賞／競技場測試不修改正式資料
- 測試結果不因整頁 render 閃掉

### 副本
- 主線勝利才加副本進度
- 懸賞／競技場／虛空各扣 1 次
- 競技場三戰不回血
- 虛空每層回血、每 10 層雙特性

---

# 24. 下一個對話如何接手（標準指令）

下一個 ChatGPT 接手時，應把以下內容視為標準操作指令：

> 你正在接手 GitHub `franksky1207/rpg` 的《文明戰線》專案。請先讀 `PROJECT_HANDOFF.md`，但不要把它當成最終真相；**GitHub `main` 實際程式碼才是唯一真實來源。**
>
> 每次要修改前，先重新讀 `index.html` 與相關正式檔案，確認最後有效來源與 script load order。修改時優先改正式來源，不要另做 wrapper、fallback、第二套公式、第二套 GM 邏輯或相容層；如果確認某段舊程式已完全失效且沒有 consumer，應直接刪除。
>
> 使用者如果說「先討論／先不要改／你覺得如何」，只能分析與建議，不能寫 GitHub；如果使用者說「做／修改／修正／執行／第 X 批」，且需求已明確，就直接修改 `main`。
>
> 修改後必須重新讀取修改檔確認；只要有 `.js` / `.css` 變更，就同步更新 `index.html` 對應 cache-bust `?v=`，並再確認 `index.html`。不要宣稱真機已測過，除非使用者實際回報。
>
> 特別注意：主線戰鬥核心是 `combatcore.js` + `battlepipeline.js`；主線冒險正式 UI 已集中在 `ui.js`；怪物特性正式效果集中在 `traits.js -> applyMonsterTraits()`；正式主線怪平衡看 `balance.js`；正式 EXP 曲線看 `level100balance.js`；GM 正式 UI 看 `gmhub.js`；不要重新建立已刪除的 `battleflow.js`、`playername.js`、`level100.js`、`worldexpansion.js`、`uifix.js`、`risksettlement.js`、`battlelimit.js`、`specialgm.js`，除非使用者明確要求全新設計。
