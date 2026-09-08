# 純文字 RPG 專案交接文件

> 本文件是給未來 ChatGPT / 開發助手快速承接本專案使用的正式交接手冊。
>
> **最高原則：GitHub `main` branch 的實際程式碼永遠是唯一真實來源。**
> 如果本文件與目前 `main` 的程式碼有差異，必須以目前程式碼為準，並在修改完成後同步更新本文件。

---

## 1. 專案基本資料

- GitHub Repository：`franksky1207/rpg`
- Branch：`main`
- GitHub Pages：`https://franksky1207.github.io/rpg/`
- 專案型態：純前端、單機、本機存檔、文字 RPG
- 主要語言：HTML / CSS / JavaScript
- 儲存方式：`localStorage`
- 目前存檔版本：`SAVE_VERSION = 5`
- 玩家主要工作方式：
  - 玩家負責提出需求、測試、回報結果。
  - 開發助手負責讀取目前 GitHub 最新程式、設計修改方式、寫程式、提交 GitHub、處理快取版本、檢查相容性。
  - 除非真的缺少無法推斷的產品決策，否則不要要求玩家手動修改程式碼。

---

## 2. 遊戲核心設計原則

本遊戲的最高設計方向是：

> **越單純、越簡單越好。**

核心玩法：

- 打怪
- 升級
- 得到金幣
- 得到裝備
- 推進地圖
- 挑戰 Boss
- 累積副本可挑戰次數

目前刻意不做：

- 職業
- 技能樹
- 複雜任務系統
- 大量劇情
- 多角色養成
- 線上排行榜
- PVP
- 每日登入／每日任務式手遊設計

新增系統時應優先思考：

1. 是否真的增加玩法價值。
2. 是否會讓主地圖變得沒有必要。
3. 是否會讓介面與規則變得太複雜。
4. 是否能重用現有戰鬥、掉落、裝備、GM 架構。

---

## 3. 重要開發工作規範

### 3.1 GitHub 是唯一真實來源

每次修改前：

1. 先從 GitHub `main` 重新讀取要修改的最新檔案。
2. 不可直接拿舊對話中的完整舊版檔案覆蓋目前版本。
3. 修改後重新讀取關鍵檔案確認真的寫入成功。

### 3.2 Cache bust 規則非常重要

- 每次修改任何 `.js` 或 `.css`，都必須同步修改 `index.html` 中對應檔案的 `?v=`。
- 建議格式：`?v=YYYYMMDD-HHMM`
- 修改後必須重新讀取 `index.html`，確認實際引用已更新。
- 只改 JS/CSS、沒 bump `index.html`，視為修改未完成。

### 3.3 避免大改核心 `ui.js`

過去曾因 GM 擴充意外帶入舊版 `ui.js` 差異，造成整頁空白。

因此：

- 能用獨立 module 解決，就不要大改 `ui.js`。
- 能用 wrapper / hook / IIFE 擴充，就優先使用。
- 若真的必須修改 `ui.js`，修改前一定重新 fetch 最新版本。

### 3.4 Classic script 全域變數陷阱

本專案目前使用傳統 `<script>`，不是 ES module。

不同 script tag 的頂層 `const` / `let` 共享 global lexical scope；若不同檔案重複宣告同名變數，可能直接 `SyntaxError` 讓整頁初始化失敗。

新增 module 時：

- 優先包在 IIFE。
- 或使用 `window.xxx` namespace。
- 避免在不同檔案頂層重複宣告常見名稱。

---

## 4. 目前 `index.html` script 載入順序

截至 2026-09-08 目前 `main` 的實際順序：

```html
<script src="data.js?v=20260908-1332"></script>
<script src="engine.js?v=20260907-2033"></script>
<script src="dungeonprogress.js?v=20260908-1332"></script>
<script src="ui.js?v=20260907-2033"></script>
<script src="balance.js?v=20260907-2033"></script>
<script src="traits.js?v=20260907-2033"></script>
<script src="traitlock.js?v=20260907-2033"></script>
<script src="battlelimit.js?v=20260908-1341"></script>
<script src="playername.js?v=20260907-2033"></script>
<script src="battleflow.js?v=20260907-2033"></script>
<script src="traitdrop.js?v=20260907-2033"></script>
<script src="gmtools.js?v=20260907-2038"></script>
<script src="shopbalance.js?v=20260907-2052"></script>
<script src="gearupgrade.js?v=20260908-0710"></script>
<script src="specialmonsters.js?v=20260908-0645"></script>
<script src="levelcap.js?v=20260908-0752"></script>
<script src="specialgm.js?v=20260908-0721"></script>
<script src="specialcore.js?v=20260908-0701"></script>
<script src="specialgmbatch.js?v=20260908-0721"></script>
<script src="risksettlement.js?v=20260908-1356"></script>
<script src="specialencounter.js?v=20260908-1438"></script>
<script src="battlepipeline.js?v=20260908-1341"></script>
<script src="specialguide.js?v=20260908-0047"></script>
<script src="levelcapresult.js?v=20260908-0803"></script>
<script src="dungeonui.js?v=20260908-1526"></script>
```

**注意：load order 是架構的一部分，不可隨便重排。**

重要原因：

- `dungeonprogress.js` 必須在 `ui.js` 前，因為它會包裝 `newState()` / `load()`，而 `ui.js` 載入時就會立即 `load(); render();`。
- `dungeonui.js` 放在最後，用來取得最後生效版本的 `homePage`、`playerStatusHtml`、`showBattleResult`、`gmHtml` 等函式再做 wrapper。
- `dungeonui.js` 安裝完 wrapper 後會主動再 `render()` 一次，確保首次進站／重新整理首頁就能直接看到副本數值。

---

## 5. 主要檔案職責

### `data.js`
- SAVE key / SAVE version
- 裝備品質資料
- 10 張地圖資料
- 地圖怪物名稱、等級、類型、風格

### `engine.js`
核心舊引擎，包含玩家／怪物基礎能力、EXP／金幣、裝備生成、掉落、存讀檔、地圖進度、基礎 `fightOnce` 等。

### `dungeonprogress.js`
副本次數累積系統的資料與公式核心：
- 新遊戲建立 `state.dungeon`
- 舊存檔自動補資料
- 計算單場副本進度
- 100% 自動轉成可挑戰次數
- overflow 保留
- 一次跨多個 100%

### `ui.js`
核心畫面與導航。**高風險檔案，盡量少改。**

### `balance.js`
平衡相關補充。

### `traits.js`
怪物特性系統、trait-aware encounter cache。

### `traitlock.js`
怪物特性鎖定／一致性相關處理。

### `battlelimit.js`
200 回合保護；目前正式 `fightOnce` 的重要版本。另會保存戰鬥真正結束瞬間的 `combatEndHp`，供副本進度公式使用。

### `playername.js`
玩家名稱功能。

### `battleflow.js`
戰鬥準備、開始、回血等流程。

### `traitdrop.js`
怪物特性影響品質提升。

### `gmtools.js`
主 GM 工具。

### `shopbalance.js`
商店品質與刷新價格平衡。

### `gearupgrade.js`
用「實際全身能力變化」判斷裝備是否真正升級。

### `specialmonsters.js`
9 種特殊怪物、權重、三檔難度。

### `levelcap.js`
- `MAX_LEVEL = 50`
- 等級上限統一
- Lv50 EXP → 金幣
- 滿等戰鬥 wrapper

### `specialgm.js`
特殊怪物單次 GM 沙盒測試。

### `specialcore.js`
正式特殊怪物共用戰鬥、掉落、商店效果核心。

### `specialgmbatch.js`
特殊怪物 100 次批次測試。

### `risksettlement.js`
HP <30% 的連續戰鬥階段結算。已接副本進度顯示。

### `specialencounter.js`
正式 8% 特殊怪物自然遭遇；不再自行定義 `runBattles`。若特殊遭遇提前結束原連戰，會顯示並保留前段主地圖已取得的副本進度。

### `battlepipeline.js`
目前正式 `runBattles` 主流程。

內含 before-fight hook：

```js
window.registerBattleBeforeFightHook(fn)
```

正式特殊遭遇透過 hook 接入；主地圖副本進度也在此逐場結算。

### `specialguide.js`
特殊怪物說明 UI。

### `levelcapresult.js`
正常戰鬥 Lv50 EXP 轉金幣的結果顯示修補。

### `dungeonui.js`
副本前置系統 UI／GM／手機版適配：
- 首頁顯示副本累積進度與可挑戰次數
- 冒險準備頁顯示同一組數值
- 戰鬥結果顯示本批增加
- GM 副本測試工具
- 副本 Debug 地圖／怪物雙下拉
- 手機防溢出與 Modal 捲動
- 首次載入補 render

---

## 6. 地圖與等級結構

共 10 張地圖，每張 5 級：

1. 新手平原：Lv1～5
2. 幽暗森林：Lv6～10
3. 廢棄礦坑：Lv11～15
4. 荒蕪沙漠：Lv16～20
5. 毒霧沼澤：Lv21～25
6. 冰封山脈：Lv26～30
7. 遠古遺跡：Lv31～35
8. 火焰山谷：Lv36～40
9. 黑暗城堡：Lv41～45
10. 魔王領域：Lv46～50

每張地圖：
- 前 3 隻普通怪
- 第 4 隻菁英
- 第 5 隻 Boss

菁英等級：4、9、14、19、24、29、34、39、44、49。
Boss 等級：5、10、15、20、25、30、35、40、45、50。

---

## 7. 玩家與怪物基礎公式

### 玩家

```js
baseHP(l)  = ceil(110 + 12*(l-1))
baseATK(l) = ceil(15 + 2.2*(l-1))
baseDEF(l) = ceil(7 + 1.2*(l-1))
```

### 怪物

```js
monsterBase(l) = {
  hp:  ceil(60 + 16*l),
  atk: ceil(10 + 2.35*l),
  def: ceil(3 + 0.9*l)
}
```

怪物還會依 style、stage index、monster traits 調整。

### 傷害

```js
calcDamage(atk, def)
= max(1, ceil((atk - def*0.55) * 隨機0.95~1.05))
```

- 暴擊倍率：1.5
- 玩家暴擊 cap：30%
- 玩家閃避 cap：25%

---

## 8. EXP 公式

```js
sameExp(l) = ceil(25 + 4*l)
```

```js
expNeed(l) = ceil(
  sameExp(l) * (4.5 + 0.35*l + 0.023*l*l)
)
```

等級差倍率：

```text
怪物高玩家 5 級以上：×1.3
高 3～4 級：×1.2
高 1～2 級：×1.1
同級：×1.0
低 1～2 級：×0.9
低 3～5 級：×0.6
低 6～10 級：×0.25
低超過 10 級：×0.05
```

怪物種類 EXP 倍率：普通 ×1、菁英 ×2、Boss ×5。

### Lv50

- `MAX_LEVEL = 50`
- Lv50 不再累積 EXP。
- 正常戰鬥原應得 EXP 1:1 轉金幣。
- 特殊怪物也使用滿等 EXP→金幣機制。
- `levelcap.js` wrapper 必須保留 `combatEndHp` 等原 battle result 欄位，避免影響副本公式。

---

## 9. 金幣公式與目前平衡觀察

```js
goldBase(l) = ceil(6 + 4*l)
```

種類倍率：普通 ×1、菁英 ×2.5、Boss ×6。

重要觀察：Lv37 左右玩家可能已有十幾萬金幣，中後期不缺金幣。未來不要為了燒錢硬塞複雜系統。

---

## 10. 地圖推進與 Boss

- 前一隻怪擊殺 10 次，解下一隻。
- 第三普通怪 10 次後出菁英。
- 菁英 10 次且玩家達地圖最高等級後，Boss 出現。
- Boss 首殺解下一張地圖並免費刷新商店。
- Boss 可重複挑戰。
- 玩家真的死於 Boss 才會暫鎖 Boss；再擊敗該地圖菁英 10 隻後重開。
- 已解鎖的既有地圖不會重新鎖回。

---

## 11. 連續戰鬥

```text
Lv1～5：1 場
Lv6～20：5 場
Lv21～35：10 場
Lv36+：15 場
```

Boss 固定單場。

### HP <30% 風險流程

每完成一場後，若仍有剩餘場且 HP **嚴格低於 30%**：
- 暫停連戰
- 顯示「連續戰鬥階段結算」
- 已完成場次的 EXP、金幣、裝備、副本進度全部保留
- 玩家可選「回血並重新戰鬥」或「放棄戰鬥」

重新戰鬥：HP 回滿，重新跑原本整批場數；舊進度不回滾，新批重新逐場累積。

放棄：保留已完成場次資料，回血後回準備頁。

---

## 12. 200 回合保護

正常／菁英／Boss／特殊怪物都有 200 回合保護。

200 回合仍未分勝負：
- 不算勝利
- 不給 EXP／金幣／裝備
- 不推地圖進度
- 不給副本進度
- 不套死亡懲罰
- Boss 不因此被鎖

曾有「200 回合後假勝利」重大 bug，已修復，不得恢復舊行為。

`battlelimit.js` 會在死亡懲罰／升級回血等結算前保存：

```js
combatEndHp
```

這個值代表真正戰鬥結束瞬間 HP，是副本實際損血率的正式來源。

---

## 13. 裝備系統

品質：普通、優良、稀有、史詩、傳說、神話。

掉落等級 offset：
- 普通 `[-2,-1,0,0,1]`
- 菁英 `[-1,0,0,1]`
- Boss `[-1,0,0,1,2]`
- clamp Lv1～50

掉落率：普通 25%、菁英 60%、Boss 100%。

品質率：
- 普通：50 / 30 / 15 / 4 / 0.9 / 0.1
- 菁英：35 / 35 / 20 / 8 / 1.8 / 0.2
- Boss：0 / 45 / 35 / 15 / 4.5 / 0.5

自動出售：普通～傳說可設定；神話永不自動出售。

### 真正裝備升級判斷

`gearupgrade.js` 以模擬替換部位後的全身 capped stats 比較 combat value，不只看 raw `equipmentScore`。

以下應優先使用 actual upgrade：
- 一鍵最佳裝備
- 出售較差裝備
- 掉落提升提示
- 低血量階段結算升級標記

已知小不一致：`specialcore.js` 某些「最弱部位」仍可能使用 raw `equipmentScore`；沒有必要時不要順手大改。

---

## 14. 怪物特性

```text
強壯：HP +20%
兇猛：攻擊 +15%
堅硬：防禦 +20%
迅捷：閃避 +8%
致命：暴擊 +8%
狂暴：HP <50% 時攻擊 +20%
巨體：HP +30%、攻擊 +5%、閃避 -5%
```

最多 2 個、不重複。

特性數量機率：
- 普通：0/1/2 = 70/25/5
- 菁英：35/50/15
- Boss：15/55/30

品質提升：
- 1 特性：15% 品質 +1
- 2 特性：30% 品質 +1
- 神話 cap

`traits.js` 建立 encounter cache；準備頁看到的特性和實際戰鬥必須是同一份 encounter，不可入戰後重骰。

---

## 15. 商店

品質：普通 25%、優良 40%、稀有 25%、史詩 8%、傳說 2%、神話 0%。

3 件商品方向：最弱部位、第二弱部位、隨機部位。

刷新：由 100 逐步升到 12,800；買裝可降階；可重置回 100，冷卻 1 小時；首次解鎖新地圖免費刷新；商店不出神話。

---

## 16. 特殊怪物系統

正式 9 種：
1. 黃金史萊姆
2. 寶箱怪
3. 死神
4. 幸運兔
5. 古代守衛
6. 遺物守衛
7. 盜賊王
8. 收藏家
9. 神秘旅人

三檔：LOW / MID / HIGH，實際參數以 `specialmonsters.js` 為準。

### 自然遭遇正式規則

- 主地圖普通／菁英戰鬥前 8% 機率。
- Boss 不觸發。
- 玩家比原 base enemy 高 >=10 級，不觸發。
- 玩家 HP <30%，不觸發。
- 先顯示未知遭遇，可挑戰／略過。
- **挑戰特殊怪前先完全回血。**
- 特殊怪會結束原本整批連戰。
- 特殊怪本身不算主地圖場數、不算主地圖擊殺、不給副本進度。
- 若特殊遭遇出現在連戰中途，前面已完成主地圖場次的 EXP／金幣／裝備／副本進度全部保留，並在特殊結算或略過結算中顯示。

### GM 沙盒

特殊怪單次 GM 應 snapshot / restore 完整 state；副本資料也不能被測試污染。

100 次批次每次以相同初始條件獨立測試。

---

## 17. Battle Pipeline 架構

正式主流程在 `battlepipeline.js`。

`specialencounter.js` 不再複製 `runBattles`，特殊遭遇透過：

```js
window.registerBattleBeforeFightHook(fn)
```

接入。

### 目前 `runBattles` ctx 的副本欄位

```js
{
  wins,
  totalXp,
  totalGold,
  items,
  originalCount,
  completed,
  remaining,
  totalDungeonProgress,
  gainedDungeonAttempts
}
```

每場正式主地圖戰鬥前保存：
- `equippedStats()` 作為該場玩家最大 HP
- `startPlayerHp`
- `playerLevelBefore`

戰鬥完成動畫後呼叫：

```js
awardDungeonProgressForBattle({
  source: "main",
  win: r.win === true,
  enemyMaxHp: encounter.hp,
  playerLevel: playerLevelBefore,
  playerMaxHp: psBefore.hp,
  startHp: startPlayerHp,
  endHp: r.combatEndHp
})
```

因此：
- 單場、連戰、Boss 都可累積。
- 敗北／timeout 0。
- 特殊怪不走這個 award。
- 低血量中斷前已完成場次已立即寫入 state，不會丟失。

未來新增主地圖「戰前事件」應使用 hook，不要再複製整份 `runBattles`。

---

## 18. GM 功能

目前主 GM：
- 指定等級
- 指定金幣
- 解鎖全部地圖與怪物
- 生成裝備
- 刷新商店
- 補滿 HP
- 清空背包
- 關閉管理模式

另有：
- 特殊怪單次沙盒
- 特殊怪 100 次批次
- 副本進度測試

### 副本 GM 測試工具

目前包含：
- 進度 +10%
- 進度 +100%
- 進度 +250%
- 次數 +1
- 進度歸零（保留 attempts）
- 副本資料全重置
- 副本 Debug

副本 Debug 已改為兩個下拉：
1. 先選地圖
2. 再選該地圖怪物

未來地圖增加時，不會把全部怪物塞進單一下拉。

Debug 顯示：地圖、怪物、類型、敵人最大 HP、玩家等級、玩家基礎 HP、玩家實際最大 HP、HP 負擔部分、無損勝利進度、接近殘血勝進度、目前累積與可挑戰次數。

未來可把部分「測試」功能升格為正式管理功能，例如直接指定副本可挑戰次數或指定積分；正常遊戲規則不受影響。

---

## 19. 手機版與桌機版

正式雙平台需求。

### 桌機
- 卡片排列
- Modal 尺寸
- 長文字
- 大數字
- GM 控制區

### 手機
- 不可橫向溢出
- Modal 必須可捲動
- 按鈕不可被擠出畫面
- 長標題可換行
- 長數值正常顯示
- iPhone safe area 要處理

### 副本 UI 已完成的手機適配

`dungeonui.js` 目前處理：
- 首頁／冒險副本狀態長文字換行
- GM 副本按鈕手機兩欄；極窄螢幕一欄
- Debug 地圖／怪物 select 手機滿寬、不橫向溢出
- Battle Result / Risk Modal 設最大高度並可垂直捲動
- 大 attempts 使用千分位顯示

---

## 20. 已發生過的重要事故與踩雷

### 整頁空白事故
新增 GM 時誤帶舊 `ui.js` 差異，造成初始化失敗。之後優先獨立 module、小改、wrapper。

### Cache 舊版事故
每次 JS/CSS 都必須 bump `index.html`。

### 200 回合假勝利
已修復，不得恢復。

### Lv50 EXP 顯示污染 GM
`levelcapresult.js` 只允許以下 title：

```text
戰鬥勝利
連續戰鬥結算
連續戰鬥階段結算
```

不要放寬。

### 首頁副本狀態首次載入不顯示
原因：`ui.js` 在 `dungeonui.js` 前已先做一次初始 render。

目前修法：`dungeonui.js` 所有 wrapper 安裝完成後再主動 `render()` 一次。不要移除這個補 render，除非未來重構初始化流程。

---

## 21. 已完成的戰鬥／特殊怪四批重構

### Batch 1
- 正式特殊怪不依賴 GM helper
- 200 回合假勝利修正

### Batch 2
- 裝備真正提升改成 actual capped stats 判斷

### Batch 3
- 統一 `MAX_LEVEL`
- Lv50 EXP → 金幣
- 正常／特殊都支援
- 修結果顯示污染

### Batch 4
- 移除 `specialencounter.js` 重複 `runBattles`
- 建立 `battlepipeline.js`
- before-fight hook 架構

這四批已完成且先前使用者測試未回報現存問題。

---

## 22. 副本前置架構：第 1～4 批已正式完成

**這一節已不是規劃，而是目前 `main` 的正式實作。**

目前完整循環：

```text
主地圖正式戰鬥
→ 累積「副本次數累積進度」
→ 每滿 100% 自動 +1「副本可挑戰次數」
→ overflow 保留
→ 次數可囤積，原則不設上限
→ 未來進真正副本時消耗次數
```

正式命名：
- `副本次數累積進度`
- `副本可挑戰次數`

不要叫「特殊挑戰」。

### 22.1 正式存檔欄位

`SAVE_VERSION = 5`

```js
state.dungeon = {
  progress: 0, // 0 <= progress < 100，保留的百分比餘數
  attempts: 0 // 可挑戰次數，可囤積
}
```

`dungeonprogress.js`：
- wrapper `newState()`：新遊戲自動建立欄位
- wrapper `load()`：舊存檔自動補欄位並保存
- 若讀檔時 `progress >= 100`，自動換算 attempts 並保留 overflow

### 22.2 正式公式

```text
本場副本進度%
= (敵人最大HP ÷ 玩家該等級基礎HP) × 1.5%
+ 本場實際損血率 × 4%
```

其中：

```text
玩家該等級基礎HP = baseHP(該場開始時玩家等級)
本場實際損血率 = (本場開始HP - 本場戰鬥結束HP) ÷ 本場開始時玩家最大HP
```

正式資料來源：
- 敵人最大 HP：真正 encounter 的 `encounter.hp`，因此包含怪物特性後 HP
- 玩家等級：`playerLevelBefore`
- 玩家最大 HP：該場開始時 `equippedStats().hp`
- 開始 HP：`startPlayerHp`
- 結束 HP：`r.combatEndHp`

`combatEndHp` 必須使用戰鬥真正結束瞬間 HP，而不是 `gainExp()` 升級回血後的 `state.hp`。

### 22.3 正式規則

- 只有 `source === "main"` 且 `win === true` 才有進度。
- 普通／菁英／Boss 都是主地圖，勝利可拿進度。
- 敗北 0。
- 200 回合 timeout 0。
- 特殊怪 0。
- 連戰每場獨立計算。
- 不可用「滿血－目前 HP」去算後續場，避免重複計算前面損血。
- 每滿 100%：attempts +1。
- overflow 保留。
- 一次可跨多個 100%。
- attempts 可囤積。

### 22.4 Core API

`dungeonprogress.js` 提供：

```js
window.ensureDungeonProgressState()
window.calculateDungeonBattleProgress(params)
window.addDungeonProgress(amount)
window.awardDungeonProgressForBattle(params)
```

`addDungeonProgress()` 回傳：

```js
{
  added,
  gainedAttempts,
  progress,
  attempts
}
```

### 22.5 第 1 批：資料＋公式核心 —— 已完成

- SAVE_VERSION 4 → 5
- 新增 `dungeonprogress.js`
- 新存檔欄位
- 舊存檔相容
- 統一公式 API
- 100% 轉次數
- 多次跨 100%
- overflow 保留

### 22.6 第 2 批：正式主地圖戰鬥接入 —— 已完成

`battlelimit.js`：
- 新增 `combatEndHp`
- win / death / timeout 都回傳

`battlepipeline.js`：
- ctx 加 `totalDungeonProgress`
- ctx 加 `gainedDungeonAttempts`
- 每場保存開始時 HP、最大 HP、等級
- 正式呼叫 `awardDungeonProgressForBattle()`

Edge behavior：
- 單場勝利：有進度
- 連戰：每場有進度
- Boss：有進度
- 敗北／timeout：0
- low HP：前段已完成場次保留
- restart：舊進度保留，新批重新累積
- abandon：已完成場次保留，未完成不補
- level-up 場：以 `combatEndHp` 避免升級回血干擾
- special encounter：特殊戰本身 0

### 22.7 第 3 批：UI＋GM —— 已完成

正式 UI：
- 首頁直接顯示副本累積進度／可挑戰次數
- 冒險準備頁玩家狀態下方也顯示，兩邊並存
- 一般戰鬥／連戰結果顯示本批進度增加與 attempts 增加
- 低血量階段結算顯示前段實際取得
- 特殊遭遇提前中斷原連戰時，顯示前段主地圖已取得的副本進度

GM：
- +10%
- +100%
- +250%
- attempts +1
- 進度歸零
- 全重置
- Debug
- Debug 已改成「地圖下拉 → 怪物下拉」兩段式

### 22.8 第 4 批：手機／桌機＋回歸 —— 已完成

已處理：
- 手機 GM 長 select 不溢出
- GM 按鈕手機 2 欄／極窄 1 欄
- battle result / risk modal 手機可捲動
- safe area
- 長數字／長文字換行
- 特殊遭遇結算漏顯示前段副本進度問題
- 首頁首次載入不顯示問題

### 22.9 已知試算

Lv39 菁英「熔核巨人」：
- 基本 HP 約 1368
- 強壯 + 巨體極端 HP 約 2135

接近殘血勝：
- Lv35 約 10.18%
- Lv36 約 10.04%

一般 Lv39 菁英極端戰損：
- Lv35 約 7.96%
- Lv36 約 7.87%

目前認為「極端單場約 10%」可接受。

---

## 23. 下一階段：真正副本／積分方向

副本前置第 1～4 批已完成；**真正副本內容、積分、積分商店、抽獎目前仍未實作。**

已確認方向：
- 主地圖仍是主要成長來源
- 副本是額外玩法
- 進副本主要消耗「副本可挑戰次數」
- 副本主要產出「積分」
- 不同副本可共用同一種積分
- 積分未來可用於積分商店／積分抽獎

尚未決定：
- 第一個正式副本內容
- 副本場數／敵人規則
- 副本積分倍率
- 積分商店價格
- 抽獎率
- 商品池

不要自行把未決項目當成正式規則。

推薦後續順序：

```text
副本前置完成
→ 實機驗證
→ 第一個最小正式副本
→ 副本積分存檔／結算／UI／GM
→ 積分商店
→ 積分抽獎
→ 後續更多副本
```

第一個副本仍應維持「簡單、直接、容易理解」，不要一開始加入技能樹、每日限制、首通獎勵等手遊式系統。

---

## 24. 新對話接手標準流程

1. 連接 GitHub。
2. 讀取 `PROJECT_HANDOFF.md`。
3. 讀取目前 `index.html`。
4. 讀取與需求有關的最新 JS / CSS。
5. 若本文與程式不同，以 `main` 為準。
6. 修改前先規劃會動哪些檔案。
7. 避免無關檔案變動。
8. JS/CSS 修改同步 bump `index.html ?v=`。
9. 修改後重新 fetch 驗證。
10. 重大系統完成後更新本交接檔。

---

## 25. 建議給新對話的開場指令

```text
這是我的網頁 RPG 專案，GitHub 為 franksky1207/rpg。
請先連接 GitHub，完整讀取 repo 根目錄的 PROJECT_HANDOFF.md，並檢查目前 main branch 的實際程式碼與 index.html 載入順序。

PROJECT_HANDOFF.md 是專案的承接說明，但 GitHub main branch 的實際程式碼才是最終真實來源；如果兩者有差異，以目前程式碼為準，並在修改完成後同步更新交接檔。

我的工作方式是：我只負責提出需求、測試、回報結果；程式修改、GitHub 操作、檔案判斷、版本處理、cache bust、相容性檢查都由你處理。除非真的缺少無法推斷的產品需求，否則不要叫我手動改程式。

每次修改前先讀取相關最新檔案，不可依靠舊對話中的程式碼直接覆寫。
每次修改 JS/CSS 後，必須同步更新 index.html 對應的 ?v= 快取版本，修改後重新讀取確認實際引用已更新。

優先使用獨立模組擴充，避免大幅修改核心 ui.js；不得因新增功能破壞既有單場戰鬥、連續戰鬥、Boss、怪物特性、特殊怪物、GM、存檔、副本進度、手機版與桌機版。

先讀完交接資料與目前程式碼後，再告訴我你已經掌握目前版本。我接下來會直接告訴你要修改什麼。
```

---

## 26. 最後的開發判斷原則

當需求與現有系統衝突時，優先順序：

1. 玩家最新明確要求
2. GitHub `main` 實際程式
3. 本 `PROJECT_HANDOFF.md`
4. 舊聊天紀錄

玩家說「先不要改／先給建議／先討論」時，不要寫 GitHub。

玩家明確要求「直接改／幫我做／放進 GitHub」時，應直接執行，不要把程式修改工作丟回玩家。

---

## 27. 本文件版本

- 文件：`PROJECT_HANDOFF.md`
- 版本：v2
- 最後更新：2026-09-08
- 目前重大狀態：副本次數累積前置系統第 1～4 批已正式完成
- 建立目的：讓未來新對話可直接承接目前完整開發能力與專案脈絡

後續每完成重大系統，應同步更新本文件。
