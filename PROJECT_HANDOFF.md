# 《文明戰線》正式跨對話交接文件

> **最高原則：GitHub `main` branch 的實際程式碼永遠是唯一真實來源。**
>
> 本文件是給下一個 ChatGPT／後續開發對話使用的快速承接層。若本文與 `main` 實際程式碼衝突，**一律以 `main` 為準**。接手後應先讀本文，再重新讀取本次要修改的正式檔案與 `index.html` 實際載入順序。
>
> 本文件已於 **2026-09-10** 依目前 `main` 重新核對並更新。舊交接內容中已失效的主線怪物公式、舊懸賞倍率、舊競技場積分／倍率／clear bonus、舊副本扣次數時機等均已修正或刪除。

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
目前主要系統：打怪、升級、金幣、裝備、地圖、Boss、怪物特性、特殊怪、副本、商店、GM 管理／測試。

目前不要主動加入：職業、技能樹、複雜任務、大量劇情、多角色、PvP、排行榜、登入／每日系統等，除非使用者之後明確要求。

世界規劃：
- Lv1～50：地球戰爭（已完成）
- Lv51～100：太陽系戰爭（已完成）
- Lv101～150：銀河系戰爭（規劃中，**尚未實作**）

目前開發順序：主線平衡已完成 → 三個副本已完成平衡與主要流程修正 → **下一階段預計 VIP 系統**，除非使用者改變優先順序。

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
- 「可以」且上下文已經明確是在要求執行

→ **可以直接修改 GitHub `main`，不需要再要求使用者貼程式碼，也不需要重複確認已經講清楚的內容。**

如果使用者說：
- 「先不要改」
- 「先建議」
- 「先討論」
- 「你覺得如何／你覺得呢」
- 單純回報 GM 測試結果、尚未要求修改

→ **只能分析／建議，不得寫入 GitHub。**

### 2.2 每次修改流程

1. **修改前先重新抓目前 `main` 的相關檔案。**
2. 同時檢查 `index.html` 的實際 script load order；不要只看函式第一次出現在哪裡。
3. 找出目前真正的正式來源與最後有效覆蓋。
4. 優先直接修改正式來源。
5. **不要額外新增 wrapper、fallback、alias、第二套公式、第二套 GM 邏輯或第二套 UI 產生器來繞過正式來源。**
6. 若發現舊程式已完全失效且沒有 consumer，應直接刪除，而不是留著當備用。
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
- 現在最重要方向是「單一正式來源」，避免前面改對、後面舊檔又蓋回去。
- 裝備、戰鬥、怪物特性、主線怪、GM 模擬尤其禁止複製公式。
- 不要為了架構漂亮而主動大規模重構；先確認是否有實際問題與使用者需求。

---

## 3. 目前 `index.html` 正式載入架構

目前 `main` 主要 script load order：

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

目前重要 cache-bust：
- `engine.js?v=20260910-0849`
- `balance.js?v=20260910-0850`
- `dungeonbounty.js?v=20260910-0905`
- `dungeonarena.js?v=20260910-1305`
- `dungeonvoid.js?v=20260910-1440`
- `dungeongm.js?v=20260910-1305`

已不再載入／不應自行恢復：
- `battleflow.js`
- `playername.js`
- `level100.js`
- `worldexpansion.js`
- `uifix.js`
- `specialgm.js`
- `battlelimit.js`
- `risksettlement.js`

重要理解：
- `data.js` 只放 SAVE、品質與 `MAPS=[]`；正式地圖由兩支 world map 檔加入。
- `engine.js` 是核心狀態、裝備、獎勵、商店等基礎來源。
- **主線怪物正式公式只看 `balance.js`。** `engine.js` 已移除舊 `monsterBase()` / `monsterObj()`，不要再建立第二套。
- `level100balance.js` 後載入後正式覆蓋 `expNeed()`。
- `traits.js` 是怪物特性正式核心；`traitlock.js` 處理主線預覽特性固定。
- `combatcore.js` 是正式共用戰鬥核心。
- `battlepipeline.js` 是正式主線連戰流程。
- `gmhub.js` 是正式 GM UI。

---

## 4. Lv1～100 正式世界

每 5 級 1 張地圖；每張固定：
- 3 隻普通怪
- 1 隻菁英
- 1 隻 Boss

總計：20 張地圖、100 隻主線怪。

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

`engine.js` 以 `MAPS.length` 正規化 `mapProgress / bossProgress / bossLocked / bossKilled`，舊存檔陣列不足時會補齊。

---

## 5. 玩家能力與裝備

### 5.1 玩家基礎能力

```js
baseHP(l)  = ceil(110 + 12*(l-1))
baseATK(l) = ceil(15 + 2.2*(l-1))
baseDEF(l) = ceil(7 + 1.2*(l-1))
```

裝備後：HP / ATK / DEF / crit / dodge 直接加總；玩家 crit / dodge **沒有 30% 硬上限**。

### 5.2 品質倍率

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

飾品主暴擊（只看品質，不看 Lv）：
- 普通 1～2
- 優良 2～3
- 稀有 3～5
- 史詩 5～7
- 傳說 7～9
- 神話 9～10

### 5.4 詞條

詞條池：
- 武器：ATK / crit / HP
- 頭盔：HP / DEF / dodge
- 鎧甲：DEF / HP / dodge
- 鞋子：dodge / DEF / HP
- 飾品：crit / ATK / HP / dodge

詞條數：
- 普通 0
- 優良 1
- 稀有 50% 1 / 50% 2
- 史詩 2
- 傳說 50% 2 / 50% 3
- 神話 3

同件裝備詞條不重複。

```js
ATK affix = ceil((1 + 0.45*level) * m)
DEF affix = ceil((0.5 + 0.20*level) * m)
HP  affix = ceil((3 + 0.9*level) * m)
```

crit / dodge 詞條（只看品質）：
- 普通 0
- 優良 1
- 稀有 1～2
- 史詩 2～3
- 傳說 3～4
- 神話 4～5

### 5.5 裝備評分

```js
rateWeight = 20 + 0.5*itemLevel
score = ATK*5 + DEF*5 + HP + crit*rateWeight + dodge*rateWeight
```

`gearupgrade.js` 依 `equipmentScore()` 做升級判定、一鍵裝備、一鍵出售等。

### 5.6 主線掉落

掉率：普通 25%、菁英 60%、Boss 100%。

裝備 Lv offset：
- 普通 `[-2,-1,0,0,+1]`
- 菁英 `[-1,0,0,+1]`
- Boss `[-1,0,0,+1,+2]`
- 最終 clamp 到 `1～MAX_LEVEL`

`traitdrop.js`：成功掉裝後，1 特性 15% 品質 +1；2 特性 30% 品質 +1；神話不再升階。

---

## 6. 主線怪正式平衡（2026-09-10 定案）

**正式唯一來源：`balance.js`。**

```js
function monsterBase(l){
 return {
  hp:  ceil(55 + 24*l),
  atk: ceil(9 + 4.2*l),
  def: ceil(2.5 + 2.0*l)
 };
}
```

style：
- `tank`：HP ×1.15、ATK ×0.95
- `attack`：HP ×0.92、ATK ×1.10

依地圖內敵人位置 `eIdx` 套 stage：

| 敵人 | HP | ATK | DEF |
|---|---:|---:|---:|
| 第1普通 | 1.22 | 1.17 | 1.10 |
| 第2普通 | 1.31 | 1.24 | 1.14 |
| 第3普通 | 1.34 | 1.28 | 1.15 |
| 菁英 | 1.39 | 1.29 | 1.17 |
| Boss | 1.44 | 1.27 | 1.17 |

最終：先 base → style → stage。

### 6.1 主線平衡設計基準

設計目標：
- 一般「稀有＋史詩＋少量傳說」混裝作為正常玩家基準。
- 全傳說視為偏強上限，可多推約一張圖，但不應穩定跨多張圖碾壓。
- 玩家／裝備／怪物都採線性等級成長，預留未來 Lv200/Lv300 以上擴展，不走指數爆炸。

### 6.2 已接受 GM 實測基準

固定強勢 Lv37 全傳說測試角色：
- HP 1289
- ATK 283
- DEF 148
- crit 15
- dodge 11

最後接受的主線測試結果：約
- Lv36～42：100%
- Lv43：90%
- Lv44：80%
- Lv45：70%
- Lv46：98%
- Lv47：93%
- Lv48：70%
- Lv49：40%
- Lv50：10%
- Lv51：90%
- Lv52：55%
- Lv53：10%
- Lv54：5%
- Lv55：3%

Lv51 的新地圖勝率回彈是刻意保留的「新地圖立足／刷裝窗口」，不要自行把跨地圖曲線硬抹平。

**目前主線平衡視為完成／凍結；除非後續高等級實測發現結構問題，不要主動重調。**

---

## 7. 共用戰鬥核心

正式核心：`combatcore.js -> runCombatCore(player, enemy, startHp, options)`。

傷害：

```js
calcDamage(atk,def)
= max(1, ceil((atk - def*0.55) * random(0.95~1.05)))
```

- 暴擊倍率 1.5×
- 每次傷害最低 1
- 怪物 crit 上限 30%
- 怪物 dodge 上限 30%
- 玩家 crit / dodge 不受此 30% 上限
- `berserk` 在敵人 HP < 50% 時使其 ATK ×1.20
- **沒有 200 回合戰鬥上限**

主線 `fightOnce()` 也位於 `combatcore.js`，負責主線 settlement：EXP、金幣、地圖進度、Boss 狀態、掉落、死亡懲罰。

GM 批量戰鬥一律應透過 `runCombatCore(...,{logs:false})`，不要複製戰鬥公式。

---

## 8. EXP、金幣與滿等

### 8.1 EXP

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
- 低超過 10：0.05

種類倍率：普通 1、菁英 2、Boss 5。

正式永久 EXP 曲線：`level100balance.js`

```js
x   = (level-1)^1.8
mid = 64^1.8
factor = 5 + 195*x/(x+mid)
expNeed(level) = ceil(sameExp(level) * factor)
```

高等級逐漸趨近約 200 隻同級普通怪升級，不無限爆增。

### 8.2 金幣

```js
goldBase(l) = ceil(6 + 4*l)
```

種類倍率：普通 1、菁英 2.5、Boss 6。

### 8.3 Lv100

- `MAX_LEVEL=100` 正式在 `engine.js`。
- Lv100 不再累積 EXP。
- 滿等時主線與特殊怪原 EXP 由 `levelcap.js` 1:1 轉成金幣。
- `levelcapresult.js` 顯示主線滿等轉換資訊。

---

## 9. 主線推進與連續戰鬥

每張地圖解鎖：第1普通 10隻 → 第2普通 10隻 → 第3普通 10隻 → 菁英 10隻，且角色達地圖最大等級 → Boss。

Boss：
- 首勝解鎖下一地圖並免費刷新下一地圖商店。
- 戰敗後重新鎖定，需再擊敗本地圖菁英 10 隻重開。
- 最終地圖不再解鎖第 21 張。

連戰數量：
```text
Lv1  → 1
Lv6  → +5
Lv11 → +10
Lv16 → +15
Lv21 → +20
Lv26 → +25
```
Boss 永遠單場。

`battlepipeline.js` 正式規則：
- 整批開始前滿血。
- **每場勝利後，下一場開始前滿血。**
- 副本進度先以本場真實 `startHp / combatEndHp` 計算再回血。
- 任一場戰敗立即終止整批，剩餘場次取消。
- 戰敗照正常死亡懲罰，之後補滿 HP 回準備頁。
- 前面已完成場次的 EXP／金幣／裝備／副本進度保留。
- 舊 `<30% HP` risk modal／休息／繼續流程已刪除，不要重建。

---

## 10. 怪物特性正式核心

正式來源：`traits.js -> applyMonsterTraits()`。

7 種：
- 強壯：HP +20%
- 兇猛：ATK +15%
- 堅硬：DEF +20%
- 迅捷：dodge +8
- 致命：crit +8
- 狂暴：HP <50% 時 ATK +20%
- 巨體：HP +30%、ATK +5%、dodge -5

套用後怪物 crit / dodge clamp 0～30%。

主線特性數：
- 普通：70% 0、25% 1、5% 2
- 菁英：35% 0、50% 1、15% 2
- Boss：15% 0、55% 1、30% 2

`traitlock.js` 固定主線預覽 traits，避免重 render 洗特性。

懸賞、競技場、虛空均共用 `applyMonsterTraits()`；不要各自再寫第二套效果。

---

## 11. 商店

刷新成本：
```text
100 → 200 → 400 → 800 → 1600 → 3200 → 6400 → 12800
```

- 12800 後可重置回 100，重置冷卻 1 小時。
- 買一件商品會讓刷新價格下降 1 級。
- 首次解鎖新地圖免費刷新。
- 商店一次 3 件，不出神話。
- `shopbalance.js` 品質：普通25%、優良40%、稀有25%、史詩8%、傳說2%、神話0%。
- 第1件目前最弱部位、第2件次弱部位、第3件隨機；弱部位以 `equipmentScore()` 判斷。
- 死亡遺失裝備可在商店贖回，價格 `ceil(item.buy*2)`，也可永久放棄。

---

## 12. 副本共通系統

正式狀態：
```js
state.dungeon = { progress, attempts, points }
```

### 12.1 副本次數進度

只有 `source="main" && win=true` 的主線勝利增加：

```js
敵人HP部分 = (enemyMaxHp / playerBaseHp) * 1.5
受傷部分   = ((startHp - endHp) / playerMaxHp) * 4
總增加     = 敵人HP部分 + 受傷部分
```

每累積 100 progress → +1 `attempts`。

### 12.2 `dungeoncore.js`

- `canStartDungeonRun(cost)`：檢查次數。
- `beginDungeonRun({mode,cost})`：扣次數、補滿 HP、建立 active run。
- `finishDungeonRun()`：結束並預設補滿 HP。
- `dungeonFightCore(enemy)`：使用當下 `equippedStats()` 呼叫 `runCombatCore()`。

注意：競技場與虛空為了「整趟鎖定角色能力」，各自有自己的薄 fight wrapper，不應改回每場讀 live gear。

副本解鎖：
- 懸賞 Lv5
- 競技場 Lv15
- 虛空幻境 Lv25

---

## 13. 懸賞戰（已完成）

正式來源：`dungeonbounty.js`。

一次一戰；隨機抽 tier；勝利給 tier 積分，失敗 0。

共同自適應基底 `specialBaseEnemyFromPlayer()`：

```js
def = ceil(playerATK * 0.45)
playerHit = max(1, playerATK - def*0.55)
baseHP = ceil(playerHit * 6)
baseDamage = playerHP / 8
```

正式 tier：

```js
normal:
 weight 45, points 80
 hpMul 1.00, damageMul 1.00, defMul .88
 critScale .5, critAdd 0, critCap 10
 dodgeScale .5, dodgeAdd 0, dodgeCap 8
 1 trait

high:
 weight 35, points 120
 hpMul 1.03, damageMul 1.03, defMul .90
 critScale .7, critAdd 2, critCap 20
 dodgeScale .7, dodgeAdd 1, dodgeCap 18
 1 trait

danger:
 weight 20, points 180
 hpMul 1.08, damageMul 1.06, defMul .92
 critScale .85, critAdd 3, critCap 28
 dodgeScale .85, dodgeAdd 2, dodgeCap 22
 50% 1 trait / 50% 2 traits
```

敵人 ATK：
```js
ceil(base.damage * damageMul + playerDEF*0.55)
```
即防禦後目標傷害約為 `playerHP/8 * damageMul`。

### 13.1 懸賞流程重要修正

舊問題：
- 進準備頁就扣次數，重新整理可能白掉 1 次。
- 敵人依進場裝備生成，但正式開打再讀當下裝備，可「弱裝進場、強裝開打」。

目前正式：
1. `enterBountyDungeon()` 只檢查 `canStartDungeonRun(1)`，抽 tier / 名稱 / traits，**不扣次數**。
2. `startBountyFight()` 讀取開戰瞬間裝備，再 `beginDungeonRun({cost:1})` 扣次數與補滿血。
3. 保留預覽名稱／traits，但用開戰瞬間能力重建敵人。

### 13.2 已接受測試基準

固定 Lv37 強勢全傳說基準：
- 普通約 95～100%
- 高級約 80～90%
- 危險約 45～65%

使用出現權重與勝率估算，平均每次懸賞約 **84～97.2 分**，中點約 **90.6 ≈ 91 分/次**。

目前懸賞戰平衡與流程視為完成。

---

## 14. 競技場（已完成）

正式來源：`dungeonarena.js`。

規則：
- 玩家主動選普通／困難／極限。
- 三場連續戰鬥。
- **場與場之間不回血。**
- 每戰勝利立即拿該戰積分；中途敗北保留前面已得積分。
- 第三戰勝利即全通；**目前沒有任何額外 `clearBonus`。**
- 整趟三連戰鎖定第一戰真正開始時的角色快照；HP 在三戰間延續。

### 14.1 正式積分

```js
普通：stagePoints [25,35,120]，總計 180
困難：stagePoints [35,45,200]，總計 280
極限：stagePoints [40,60,320]，總計 420
```

前兩戰累積：
- 普通 60
- 困難 80
- 極限 100

設計原因：避免玩家只刷極限前兩戰就穩定壓過懸賞平均約 91 分。

### 14.2 正式戰鬥倍率

```js
normal:
 S1 hp .60 / dmg .57 / def .78 / crit .25+0 cap5 / dodge .20+0 cap4 / normal1
 S2 hp .69 / dmg .64 / def .80 / crit .35+0 cap7 / dodge .30+0 cap6 / normal2
 S3 hp .78 / dmg .73 / def .82 / crit .45+0 cap9 / dodge .40+0 cap8 / one

hard:
 S1 hp .64 / dmg .57 / def .80 / crit .40+0 cap8 / dodge .35+0 cap7 / one
 S2 hp .70 / dmg .63 / def .83 / crit .55+1 cap12 / dodge .50+1 cap10 / one
 S3 hp .78 / dmg .70 / def .85 / crit .70+2 cap16 / dodge .65+1 cap14 / hard3

extreme:
 S1 hp .63 / dmg .56 / def .80 / crit .55+1 cap12 / dodge .50+1 cap10 / one
 S2 hp .70 / dmg .61 / def .83 / crit .75+2 cap18 / dodge .70+1 cap15 / extreme2
 S3 hp .80 / dmg .69 / def .86 / crit .90+3 cap23 / dodge .85+2 cap20 / extreme3
```

traitMode：
- `normal1`：70% 0 / 30% 1
- `normal2`：50% 0 / 50% 1
- `one`：固定 1
- `hard3`：75% 1 / 25% 2
- `extreme2`：60% 1 / 40% 2
- `extreme3`：50% 1 / 50% 2

### 14.3 競技場流程重要修正

舊問題：選難度就扣次數；刷新會白掉一次；正式流程可理論上中途換裝，而 GM 是固定角色。

目前正式：
1. `startArenaDungeon()` 只建立 ready 預覽，不扣次數。
2. 第一戰 `startArenaStageFight()` 才鎖 `playerSnapshot` 並 `beginDungeonRun({cost:1})`。
3. 第一戰敵人依鎖定能力重建，但保留 ready 畫面已顯示的 traits。
4. 第二、三戰都用同一 `playerSnapshot` 生成敵人、進行戰鬥。
5. HP 不回血，延續到下一戰。
6. UI 顯示的玩家最大 HP 也依鎖定 snapshot，不受外部換裝影響。
7. GM 舊 `clearBonus` 死碼已移除。

### 14.4 已接受測試基準

固定 Lv37 強勢全傳說：
- 普通全通約 85～95%
- 困難全通約 55～65%
- 極限全通約 35～45%
- 三者幾乎都能抵達第 3 戰

用中點估算每次期望積分：約
- 普通 168
- 困難 200
- 極限 228

目前競技場平衡、獎勵與主要流程視為完成。

---

## 15. 虛空幻境（已完成）

正式來源：`dungeonvoid.js` + `dungeonvoidui.js`。

核心定位：**隨機性爬塔**。使用者已決定保留隨機特性；因名稱就是「虛空幻境」，同一角色每趟最高層有一定波動是可接受且有趣的玩法，不要自行把它改成完全固定塔。

規則：
- 解鎖 Lv25。
- 從 `highestCleared + 1` 開始。
- 每次真正開始一趟消耗 1 副本次數。
- **每層開始前完全補滿 HP。**
- 一路打到敗北或使用者要求退出；整趟只耗 1 次。
- 一般層固定 1 個隨機特性。
- 每 10 層為 Boss，固定 2 個不同特性。
- Boss 基礎 HP/ATK/DEF 公式與同樓層一般怪相同；主要差異是 2 traits 與 Boss 名稱。
- 只有新的最高樓層首通會給積分，舊樓層不能重複刷分。

### 15.1 怪物公式

```js
equivalentPower(floor) = 24 + floor/10

HP  = ceil((62 + 16.2*equivalentPower) * 2.40)
ATK = ceil((10.5 + 2.45*equivalentPower) * 2.15)
DEF = ceil((3.2 + 0.92*equivalentPower) * 2.65)
crit = 10
dodge = 8
```

再套 `applyMonsterTraits()`。

等價每層約增加：
- HP +3.888
- ATK +0.52675
- DEF +0.2438

### 15.2 首通積分

```js
points = round(15 + 1.75*sqrt(floor-1))
Boss floor => points * 2
```

只在 `floor === highestCleared + 1` 時更新最高紀錄並加分。

已估算的重要經濟量級（分析紀錄，不是硬編碼）：
- 1～100：約 2,930 分
- 1～1000：約 57,074 分
- 1～2450：約 196,040 分
- 1～10000：約 1,448,317 分

使用者目前認為此公式可接受：虛空是一次打到死才耗一個副本次數，後期可能一次只推不到 10 層甚至卡關；平常主力收益仍應是懸賞與競技場。聰明玩家可等戰力明顯提升後再打虛空，節省副本次數。

### 15.3 虛空實測與設計理解

固定角色從第1層測試時曾出現約 70～130 層停止的較大波動；但從 121 或 131 層開始測時，通常只能再推約 0～20／0～15 層，表示後段仍有明確實力牆。

結論：
- 不需要因波動就自動重做怪物公式。
- 隨機 traits、crit、dodge、傷害亂數使「這趟能走多遠」有差異，屬於虛空幻境特色。
- 目前怪物數值與 traits 都決定保留。

### 15.4 2026-09-10 流程修正

舊問題：
- 一進虛空就 `beginDungeonRun()`，尚未真正打第一層便扣次數；刷新／中斷可能白掉一次。
- 正式虛空每層重新讀 `equippedStats()`，而 GM 爬塔鎖一份角色快照，模型不完全一致。

目前正式：
1. `beginVoidMirageRun()` 只檢查 `canStartDungeonRun(1)` 並建立 ready run，**不扣次數，也不免費補血**。
2. `fightNextVoidMirageFloor()` 第一次真正戰鬥時：
   - 鎖 `playerSnapshot = createSpecialPlayerSnapshot(equippedStats())`
   - 呼叫 `beginDungeonRun({mode:"void-mirage",cost:1})`
   - 此刻才扣 1 次並正式開始 run。
3. 整趟所有樓層都使用同一 `playerSnapshot`。
4. 每層以 snapshot 最大 HP 補滿，再用 snapshot 呼叫 `runCombatCore()`。
5. 尚未真正開戰就退出，不耗次數，也不觸發 `finishDungeonRun()` 的免費補血。
6. `runSnapshot()` 現在包含 `runStarted` 與 `playerSnapshot` 資訊。

這使正式虛空與 GM 爬塔模型一致：**一趟鎖定能力，每層滿血，直到死亡／退出。**

---

## 16. 特殊怪

遭遇率：`SPECIAL_ENCOUNTER_RATE = 0.08`。

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

正式自適應基底仍在 `specialmonsters.js`：
```js
def = ceil(playerATK * .45)
playerHit = max(1, playerATK - def*.55)
hp = ceil(playerHit*6)
damage = playerHP/8
```

特殊怪 tier low/mid/high、獎勵效果、品質表、弱部位掉落、商店折扣等一律看 `specialmonsters.js`。

主線連戰透過 `battlepipeline.js` before-fight hook 觸發特殊遭遇；不要建立第二個觸發器。

---

## 17. 玩家名稱與正式 UI

- `state.playerName`，預設「玩家」，最多 12 字。
- 空白儲存回「玩家」。
- 主線名稱功能已直接整合 `ui.js`；舊 `playername.js` 不再使用。
- 遊戲名稱「文明戰線」已直接存在 `index.html / ui.js`。
- `adventureprogressui.js` 目前只注入怪物卡進度樣式，不再覆蓋 `adventurePreparePage()`。
- `dungeonvoidui.js` 已直接負責虛空玩家名稱、能力顯示、強制退出與手機緊湊布局；舊 `uifix.js` 不應恢復。

副本 UI 重要行為：
- 懸賞 ready 畫面先顯示 tier／怪名／traits／獎勵，按「開始挑戰」才正式扣次數。
- 競技場先選難度，再看到每戰 ready；第一戰按開始才扣次數；三戰不回血。
- 虛空由 UI 自動逐層戰鬥，可要求「本層結束後退出」；每層滿血。

---

## 18. GM 管理與測試

### 18.1 GM 入口與正式來源

設定頁連點「設定」標題 3 下 → 密碼 modal → `franksky`。

正式 GM UI：`gmhub.js`。
`gmtools.js` 不再保存第二套舊 `gmHtml()`。

GM sandbox：
- `gmCreateSandboxSnapshot()`
- `gmResetSandbox()`
- `gmRestoreSandbox()`

目的：批量測試不改正式角色資料。

`GM_TEST_RUNS` 的 ×100 模擬主要用於特殊怪、地圖怪、懸賞、競技場；虛空爬塔不是固定 100 次。

### 18.2 地圖怪 GM ×100

- 選地圖、選怪物。
- 使用正式主線怪生成與 `runCombatCore()`。
- 模擬正式 EXP／金幣／掉落／死亡掉裝。
- 統計勝率、勝利平均剩餘 HP、死亡掉裝、獎勵品質分布等。

### 18.3 特殊怪 GM ×100

- dropdown 選 9 種特殊怪。
- 統計勝率、勝利平均剩餘 HP、死亡掉裝與模擬獎勵。
- 正式特殊怪 reward / combat helper，不另複製公式。

### 18.4 懸賞 GM ×100

三 tier 各有按鈕；固定一份玩家快照，100 場獨立滿血戰鬥。

統計：
- 勝率
- 勝利平均剩餘 HP
- 平均回合

### 18.5 競技場 GM ×100

每一回模擬完整三連戰：
- 同一份玩家快照
- HP 在三戰之間延續
- 每戰敵人用正式 `buildArenaEnemyForTest()`
- 積分只加正式 `stagePoints`，**沒有 clear bonus**

統計 9 項：
- 第1戰通過
- 第2戰到達
- 第2戰條件通過
- 第3戰到達
- 第3戰條件通過
- 全通率
- 平均積分
- 全通平均剩餘 HP
- 平均總回合

### 18.6 虛空 GM

功能：
- 指定樓層查看單層能力（基礎＋traits 後）。
- 指定起始樓層連續爬塔。

GM 爬塔：
- 一開始鎖 `createSpecialPlayerSnapshot(equippedStats())`。
- 每層都從玩家滿 HP 開始。
- 使用正式 `buildVoidMirageEnemy()`。
- 打到第一場失敗或最多成功 10000 層。
- `VOID_MIRAGE_GM_SIM_LIMIT = 10000` 是**連續模擬樓層安全上限，不是戰鬥回合上限**。

統計 8 項：起始樓層、成功層數、最後成功樓層、停止／失敗樓層、本次總積分、平均每層積分、平均戰鬥回合、最後成功剩餘 HP。

---

## 19. 本輪已完成的重要 Bug 修正／清理

### 19.1 主線正式怪物來源清理

- `engine.js` 的舊 `monsterBase()` / `monsterObj()` 已移除。
- 正式主線怪只由 `balance.js` 定義。
- 避免兩套公式因 script order 產生誤讀。

### 19.2 主線平衡重做

舊交接中的：
```text
62+16.2L / 10.5+2.45L / 3.2+.92L
```
及舊 stage 1.00～2.12 等，**已不是主線正式公式**。

目前正式已改成第 6 節的 `55+24L / 9+4.2L / 2.5+2L` 與新版 stage。

### 19.3 懸賞戰

- 完成三 tier 重新平衡。
- 危險懸賞 traits 50% 1 / 50% 2。
- 修正 ready 畫面就扣次數問題。
- 修正弱裝進場／強裝開打的自適應漏洞。
- 開戰時依當下裝備重建敵人並保留預覽名稱／traits。

### 19.4 競技場

- 完成三難度完整平衡。
- 獎勵改成 180 / 280 / 420，且大部分獎勵集中第3戰。
- **刪除 clear bonus 概念與 GM 死碼。**
- 修正選難度就扣次數問題。
- 三戰鎖定同一角色快照，堵住中途換裝／正式與 GM 不一致。

### 19.5 虛空幻境

- 平衡與積分公式確認保留。
- 隨機 traits 明確保留為玩法特色。
- 修正進 ready 就扣次數。
- 整趟鎖角色 snapshot。
- 修正 ready 未開戰退出可能因 finish flow 免費補血的邊界漏洞。
- 正式與 GM 現在皆為「整趟固定角色能力、每層滿血」。

### 19.6 先前已完成的重要清理（仍有效）

- 舊 200 回合限制已刪。
- 舊低血量 risk modal 流程已刪。
- 舊奇幻地圖已從 `data.js` 移除。
- 舊 Lv50 限制已改成 `MAX_LEVEL`／`clampGameLevel()`。
- `battleflow.js / playername.js / level100.js / worldexpansion.js / uifix.js` 已不載入。
- 懸賞／競技場／虛空 traits 效果已集中共用 `applyMonsterTraits()`。
- 主線冒險正式 UI 已集中 `ui.js`；`adventureprogressui.js` 只負責樣式。

---

## 20. 目前仍有正式責任、不要誤刪的後載入層

- `balance.js`：主線怪正式平衡。
- `level100balance.js`：正式 EXP 曲線。
- `traitlock.js`：主線預覽 traits 固定。
- `traitdrop.js`：特性怪掉裝品質升階。
- `shopbalance.js`：商店品質與弱部位邏輯。
- `gearupgrade.js`：裝備評分與批量裝備／出售。
- `levelcap.js`：Lv100 EXP 轉金幣。
- `levelcapresult.js`：滿等結算顯示。
- `dungeonui.js`：副本首頁／route／冒險側副本狀態。
- `settlementui.js`：主線結算擴充。
- `adventureprogressui.js`：怪物卡進度樣式注入。
- `dungeonvoidui.js`：虛空正式 UI 與動畫。

沒有使用者需求時不要為了「核心化」而大規模搬檔。

---

## 21. 尚未完成／未實作

目前明確尚未完成：

1. **VIP 系統**：先前曾討論 V0～V20 等概念，但 `main` 尚未實作；不可視為正式規則。這是三副本完成後最自然的下一項。
2. **Lv101～150 銀河系戰爭**：尚未加入正式地圖、怪物、裝備與等級上限。
3. **跨裝置雲端存檔**：目前只有 `localStorage`；手機／桌機不能共用存檔。
4. 目前沒有登入、Firebase、Google 試算表存檔、排行榜、多人系統。
5. 部分 UI 模組仍以 JS 動態注入 CSS；功能正常，是否搬回 CSS 是可選整理，不是必要修正。

不要從歷史對話自行追加舊待辦；以使用者下一步與 `main` 為準。

---

## 22. 真機／回歸驗證重點

主線：
- Lv26+ 有 1/5/10/15/20/25 六種連戰；Boss 單場。
- 每場勝利後下一場滿血。
- 戰敗立即結束並回準備頁。
- 新版主線難度在 Lv43～55 一帶符合已接受測試趨勢。

裝備：
- 五部位主能力與詞條不重複。
- 飾品主 crit、crit/dodge 詞條不隨 Lv 異常放大。
- Lv51～100 可正常掉高於 Lv50 裝備。

懸賞：
- 進 ready 不扣次數；按開始才扣。
- ready 後若換裝，正式敵人按開戰能力重建但保留預覽 traits／名稱。

競技場：
- 選難度不扣；第一戰開始才扣。
- 三戰不回血。
- 整趟能力鎖定，不受中途換裝影響。
- 無 clear bonus。

虛空：
- 進 ready 不扣次數也不免費補血。
- 第一層正式開始才扣 1 次。
- 整趟能力鎖定。
- 每層開始滿血。
- 普通 1 trait、每10層 2 traits。
- 只有新最高樓層給首通積分。
- 未開戰就退出不耗次數／不免費補血。

GM：
- 批量測試不改正式角色資料。
- 競技場 GM 無 clear bonus。
- 虛空 GM 與正式皆鎖一趟玩家能力，且每層滿血。

---

# 23. 下一個對話如何接手（標準指令）

> 你正在接手 GitHub `franksky1207/rpg` 的《文明戰線》專案。請先讀 `PROJECT_HANDOFF.md`，但不要把它當成最終真相；**GitHub `main` 的實際程式碼才是唯一真實來源。**
>
> 每次要修改前，先重新讀 `index.html` 與本次相關正式檔案，確認實際 script load order、最後有效來源與目前 SHA。修改時優先直接改正式來源，不要另做 wrapper、fallback、第二套公式、第二套 GM 邏輯或第二套 UI 產生器；如果確認舊程式已完全失效且沒有 consumer，才直接刪除。
>
> 使用者如果說「先討論／先不要改／先建議／你覺得如何」，只能分析與建議，不能寫 GitHub；如果使用者說「做／修改／修正／執行／做吧」，且需求已明確，就可直接修改 `main`，不需要再重複確認。
>
> 修改後必須重新讀取修改檔確認內容與 SHA；只要有 `.js` / `.css` 變更，就同步更新 `index.html` 對應 cache-bust `?v=`，然後再重新讀 `index.html` 驗證。GitHub 寫入成功不等於真機驗證完成，不要宣稱 Safari／Pages 已實測，除非使用者實際回報。
>
> 目前主線平衡已定案；懸賞戰、競技場、虛空幻境的平衡與主要流程也已完成。三副本正式定位為：**懸賞＝穩定收益、競技場＝可選風險／高收益、虛空＝戰力成長後的階段性首通兌現與隨機爬塔。** 下一步若使用者沒有改變方向，可開始討論／實作 VIP 系統；在使用者明確要求前，不要自行修改。
