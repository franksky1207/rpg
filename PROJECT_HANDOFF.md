# 純文字 RPG 專案交接文件

> 本文件是給未來 ChatGPT / 開發助手快速承接本專案使用的正式交接手冊。
>
> **最高原則：GitHub `main` branch 的實際程式碼永遠是唯一真實來源。**
> 如果本文件與目前 `main` 的程式碼有差異，必須以目前程式碼為準。

---

## 1. 專案基本資料

- GitHub Repository：`franksky1207/rpg`
- Branch：`main`
- GitHub Pages：`https://franksky1207.github.io/rpg/`
- 專案型態：純前端、單機、本機存檔、文字 RPG
- 主要語言：HTML / CSS / JavaScript
- 儲存方式：`localStorage`
- `SAVE_KEY = "frank_text_rpg_save"`
- `SAVE_VERSION = 6`
- GM 密碼：`franksky`
- 正式支援：桌機＋手機

工作方式：
- 玩家提出需求、實際操作 Pages、回報結果。
- 開發助手先重新讀取 GitHub `main` 最新檔案，再修改並提交。
- 除非使用者說「先不要改／先討論」，否則明確說「做／修改」時可以直接修改 GitHub。
- 不要求玩家手動改程式碼，除非真的沒有其他方式。

---

## 2. 遊戲最高設計方向

> **越單純、越簡單越好。**

核心玩法：
- 打怪
- 升級
- 得到金幣
- 得到裝備
- 推進地圖
- 挑戰 Boss
- 累積副本次數
- 挑戰副本取得副本積分

刻意不做：
- 職業
- 技能樹
- 複雜任務系統
- 大量劇情
- 多角色養成
- PVP
- 排行榜
- 每日登入／每日任務式手遊系統

新增系統時優先問：
1. 是否真的增加玩法價值？
2. 是否會讓主地圖失去意義？
3. 是否讓規則變複雜？
4. 是否能重用現有戰鬥、掉落、GM、副本架構？

---

## 3. 開發規範

### 3.1 GitHub `main` 是唯一真實來源
每次修改前重新 fetch 相關檔案，不可用舊對話中的完整舊版檔案覆蓋目前版本。

### 3.2 Cache bust 必做
任何 `.js` / `.css` 修改，都要同步修改 `index.html` 對應 `?v=`。
建議格式：`YYYYMMDD-HHMM`。

### 3.3 儘量不要大改 `ui.js`
曾因帶入舊版 `ui.js` 造成整頁空白。優先使用：
- IIFE
- wrapper
- hook
- 新增獨立 module

### 3.4 Classic `<script>` 全域衝突
本專案不是 ES module。不同 script tag 的頂層 `let` / `const` 可能共用 global lexical scope並產生重複宣告錯誤。
新增檔案優先包 IIFE。

### 3.5 Load order 是架構的一部分
不要隨意重排 script。

---

## 4. 目前 `index.html` script 順序

截至 2026-09-08 Batch 5：

```html
<script src="data.js?v=20260908-1937"></script>
<script src="engine.js?v=20260907-2033"></script>
<script src="dungeonprogress.js?v=20260908-1937"></script>
<script src="dungeoncore.js?v=20260908-1958"></script>
<script src="ui.js?v=20260907-2033"></script>
<script src="balance.js?v=20260907-2033"></script>
<script src="traits.js?v=20260907-2033"></script>
<script src="traitlock.js?v=20260907-2033"></script>
<script src="battlelimit.js?v=20260908-1341"></script>
<script src="playername.js?v=20260907-2033"></script>
<script src="battleflow.js?v=20260907-2033"></script>
<script src="traitdrop.js?v=20260907-2033"></script>
<script src="gmtools.js?v=20260908-2053"></script>
<script src="shopbalance.js?v=20260907-2052"></script>
<script src="gearupgrade.js?v=20260908-0710"></script>
<script src="specialmonsters.js?v=20260908-0645"></script>
<script src="dungeonbounty.js?v=20260908-2048"></script>
<script src="levelcap.js?v=20260908-0752"></script>
<script src="specialgm.js?v=20260908-0721"></script>
<script src="specialcore.js?v=20260908-0701"></script>
<script src="specialgmbatch.js?v=20260908-0721"></script>
<script src="dungeongm.js?v=20260908-2103"></script>
<script src="gmhub.js?v=20260908-2125"></script>
<script src="risksettlement.js?v=20260908-1356"></script>
<script src="specialencounter.js?v=20260908-1438"></script>
<script src="battlepipeline.js?v=20260908-1341"></script>
<script src="specialguide.js?v=20260908-0047"></script>
<script src="levelcapresult.js?v=20260908-0803"></script>
<script src="dungeonui.js?v=20260908-1958"></script>
```

重要：
- `dungeonprogress.js` 必須在 `ui.js` 前。
- `dungeoncore.js` 必須在副本功能模組前。
- `gmhub.js` 在舊 GM wrapper 後面，最終擁有 `gmHtml()`。
- `dungeonui.js` 最後包裝正式 render / go / player status。

---

## 5. 地圖與等級

共 10 張地圖，每張 5 級：
1. 新手平原 Lv1–5
2. 幽暗森林 Lv6–10
3. 廢棄礦坑 Lv11–15
4. 荒蕪沙漠 Lv16–20
5. 毒霧沼澤 Lv21–25
6. 冰封山脈 Lv26–30
7. 遠古遺跡 Lv31–35
8. 火焰山谷 Lv36–40
9. 黑暗城堡 Lv41–45
10. 魔王領域 Lv46–50

每張：3 普通＋1 菁英＋1 Boss，共 50 怪。

---

## 6. 玩家／怪物／傷害公式

玩家：
```js
baseHP(l)  = ceil(110 + 12*(l-1))
baseATK(l) = ceil(15 + 2.2*(l-1))
baseDEF(l) = ceil(7 + 1.2*(l-1))
```

怪物：
```js
hp  = ceil(60 + 16*l)
atk = ceil(10 + 2.35*l)
def = ceil(3 + .9*l)
```

style：
- tank：HP×1.25、ATK×0.9
- attack：HP×0.85、ATK×1.2
- balanced：不變

stage 倍率：
```js
0 {hp:1,atk:1,def:1}
1 {hp:1.12,atk:1.10,def:1.08}
2 {hp:1.28,atk:1.20,def:1.15}
3 {hp:1.60,atk:1.30,def:1.22}
4 {hp:2.05,atk:1.35,def:1.28}
```

傷害：
```js
max(1, ceil((atk - def*.55) * random(.95~1.05)))
```

- 暴擊傷害：1.5×
- 玩家暴擊 cap：30%
- 玩家閃避 cap：25%

---

## 7. EXP 與等級上限

```js
sameExp(l)=ceil(25+4*l)
expNeed(l)=ceil(sameExp(l)*(4.5+.35*l+.023*l*l))
```

等級差 EXP 倍率：
- >= +5：1.3
- +3~+4：1.2
- +1~+2：1.1
- 0：1
- -1~-2：0.9
- -3~-5：0.6
- -6~-10：0.25
- < -10：0.05

怪物類型 EXP：normal 1 / elite 2 / boss 5。

Lv50 為上限；滿等後 EXP 1:1 轉金幣。

---

## 8. 金幣與裝備

金幣：
```js
goldBase(l)=ceil(6+4*l)
```
類型倍率：normal 1 / elite 2.5 / boss 6。

裝備品質：
- 普通 1.00
- 優良 1.15
- 稀有 1.35
- 史詩 1.60
- 傳說 1.95
- 神話 2.40

出售倍率：1 / 1.4 / 2 / 3.2 / 5 / 8。

掉落率：
- 普通 25%
- 菁英 60%
- Boss 100%

品質機率：
- normal：50 / 30 / 15 / 4 / .9 / .1
- elite：35 / 35 / 20 / 8 / 1.8 / .2
- boss：0 / 45 / 35 / 15 / 4.5 / .5

神話裝備永不自動出售。

`gearupgrade.js` 用模擬整套實際裝備後 capped stats 比較升級：
```text
atk*5 + def*5 + hp + crit*12 + dodge*12
```

---

## 9. 怪物特性

7 種：
- 強壯：HP +20%
- 兇猛：ATK +15%
- 堅硬：DEF +20%
- 迅捷：閃避 +8%
- 致命：暴擊 +8%
- 狂暴：HP <50% 後 ATK +20%
- 巨體：HP +30%、ATK +5%、閃避 -5%

一般主地圖最多 2 特性。
一般／菁英／Boss 的原有特性數量機率保留。
`traits.js` 會維持預覽與實戰同一隻 encounter，不可 reroll。

---

## 10. 連續戰鬥與風險結算

連戰上限：
- Lv1–5：1
- Lv6–20：5
- Lv21–35：10
- Lv36+：15
- Boss 永遠單場

正式低 HP 判定：完成一場後，若還有剩餘戰鬥且 HP **<30%**，進 `risksettlement.js`。

- 已完成戰鬥獎勵保留。
- 「回血並重新戰鬥」：回血後重跑原本選定的完整批次。
- 「放棄戰鬥」：保留已完成結果、回血、回準備頁。

200 回合保護：
- main 由 `battlelimit.js`
- special 由 `specialcore.js`
- dungeon 由 `dungeoncore.js`

timeout：不算勝利、不給該場獎勵、不推進主線、不給副本進度。

---

## 11. 主戰鬥 pipeline

`battlepipeline.js` 擁有正式 `runBattles`。

特殊怪使用：
```js
window.registerBattleBeforeFightHook(fn)
```

主戰鬥 ctx 目前含：
```text
wins
totalXp
totalGold
items
originalCount
completed
remaining
totalDungeonProgress
gainedDungeonAttempts
```

每一場正式主地圖戰鬥都會保存：
- battle start 等級
- equipped maxHP / ATK / DEF
- start HP
- encounter actual HP
- `combatEndHp`

用於副本進度公式。

---

## 12. 特殊怪

自然遭遇率 8%。

9 隻：
- 黃金史萊姆
- 幸運兔
- 古代守衛
- 遺物守衛
- 盜賊王
- 收藏家
- 寶箱怪
- 死神
- 神秘旅人

觸發限制：
- Boss 不觸發
- 玩家若高於原目標 >=10 級不觸發
- 目前 HP <30% 不觸發

遇到後可挑戰／跳過；挑戰特殊怪前會完整回血。
無論挑戰或跳過，都會結束原本連戰；前面完成的主地圖獎勵與副本進度保留。
特殊怪本身不給副本進度。

特殊怪強度基底：依目前實際裝備後玩家能力動態生成。

```js
specialBaseEnemyFromPlayer(snapshot)
```
概念：
- 基礎 DEF 約為玩家 ATK 的 45%
- 基礎 HP 約等於玩家對基礎 DEF 打約 6 下
- 目標單次入傷約玩家最大 HP / 8
- 再套 low / mid / high tier 參數

GM 特殊怪測試：100 次沙盒，正式角色資料還原。

---

# 13. 副本系統正式基準

正式用語：
- **副本次數累積進度**
- **副本可挑戰次數**
- **副本積分**

不要叫「特殊挑戰」。

`state.dungeon`：
```js
{
 progress: 0,
 attempts: 0,
 points: 0
}
```

`dungeonprogress.js` 會自動 normalize：
- progress 每滿 100 → attempts +1
- overflow 保留
- progress 可一次跨多個 100
- attempts 可囤積，無設計上限
- 舊存檔自動補欄位

---

## 14. 副本進度公式

只對正式主地圖成功戰鬥：

```text
本場副本進度%
= (敵人最大HP ÷ 玩家該場開始等級的 baseHP) × 1.5%
+ 本場實際損血率 × 4%
```

```text
本場實際損血率
= (startHp - combatEndHp) / battle-start equipped maxHP
```

規則：
- 普通／菁英／Boss 勝利：有
- 敗北：0
- timeout：0
- 特殊怪：0
- 真正副本：0
- 連戰逐場計算
- 使用 actual encounter HP，因此怪物特性造成的 HP 提升會反映在進度
- level-up 場用 `combatEndHp`，不被升級回血污染

Lv39 菁英熔核巨人是曾用來人工驗證公式的高負擔案例。

---

## 15. 副本共通規則

目前只設計 3 種：
1. 懸賞戰
2. 競技場
3. 試煉塔

解鎖：
- Lv5 懸賞戰
- Lv15 競技場
- Lv25 試煉塔

共通：
- 每次正式進場消耗 1 副本可挑戰次數
- 開始副本時完整回血
- 副本戰鬥不產生副本進度
- 不影響主地圖 kill / elite / boss / unlock / map progress
- 不給主線 EXP、金幣、一般裝備掉落
- 主要獎勵：副本積分
- 副本死亡不吃主遊戲死亡懲罰
- 已取得副本積分保留
- 沒有副本次數時按鈕 disabled，顯示「挑戰次數不足」

副本首頁：
- 顯示 attempts + points
- 三模式卡片永遠可見
- 未解鎖顯示 Lv
- 尚未實作顯示「尚未開放」

首頁：顯示 progress / attempts / points。
冒險準備頁：顯示 progress / attempts。

---

# 16. 懸賞戰 —— 已正式完成

正式流程：
```text
副本首頁
→ 進入懸賞戰
→ 立刻扣 1 次
→ 完整回血
→ 隨機普通／高級／危險
→ 立刻生成敵人
→ 只顯示「開始挑戰」
→ 戰鬥
→ 結算
→ 再次進入／返回副本
```

生成敵人後沒有取消／返回／免費 reroll。
再次進入等同全新進場，會再次扣 1 次並重新生成。

出現率：
- 普通 60%
- 高級 30%
- 危險 10%

積分：
- 普通 80
- 高級 120
- 危險 180

勝利才得分，失敗／timeout 0。

---

## 17. 懸賞最新正式平衡

所有懸賞怪**至少有 1 個特性**。

### 普通懸賞
```text
HP ×1.00
目標傷害 ×1.00
DEF ×0.88
暴擊：玩家暴擊×0.5，+0，上限10%
閃避：玩家閃避×0.5，+0，上限8%
特性：固定 1 個
積分：80
權重：60
```

### 高級懸賞
```text
HP ×1.03
目標傷害 ×1.06
DEF ×0.90
暴擊：玩家暴擊×0.8，+3，上限20%
閃避：玩家閃避×0.8，+2，上限18%
特性：固定 1 個
積分：120
權重：30
```

### 危險懸賞
```text
HP ×1.08
目標傷害 ×1.10
DEF ×0.92
暴擊：玩家暴擊×1.0，+5，上限28%
閃避：玩家閃避×1.0，+3，上限22%
特性：50% 1 個 / 50% 2 個
積分：180
權重：10
```

玩家實測近期大致：
- 普通：約 93～100%
- 高級：約 75～85%
- 危險：約 45～55%

這個區間目前視為可接受，不要為了追求精準百分比一直微調。

### 懸賞怪生成方式
仍共用特殊怪的玩家能力基底：
```text
玩家目前實際裝備能力
→ specialBaseEnemyFromPlayer()
→ 懸賞 tier 倍率
→ 懸賞暴擊／閃避
→ 懸賞特性
```

ATK 是用目標入傷反推：
```js
atk = targetDamage + playerDEF*.55
```
而不是直接乘 raw ATK。

### 懸賞特性效果
懸賞使用相同 7 種特性效果，但用 `applyBountyTraits()` 保留懸賞自己的暴擊／閃避基底。
不要直接改成 `traits.js` 的一般怪套用方式，因為舊函式會覆蓋 crit/dodge。

---

## 18. 懸賞視覺

懸賞需和普通戰鬥、特殊怪、未來競技場／試煉塔有明顯視覺區隔。

主色：紫黑。
- 背景 `#1B1724`
- 怪框 `#241B2F`
- 邊框 `#8A5FB0`
- 標題 `#C7A6E8`
- 怪名 `#F2E9FF`
- 一般文字 `#D6CCE3`
- 次要文字 `#A99DB8`
- 積分 `#E6C979`

Tier label：
- 普通 `#7891A8`
- 高級 `#A56AC4`
- 危險 `#C45F73`

開始按鈕：
- `#6E4A91`
- hover `#8159A8`

準備頁不可對玩家顯示敵人 ATK / DEF；HP 也不在準備頁顯示。
戰鬥時可以顯示 HP bar / numeric。

---

# 19. GM Hub 正式架構

`gmhub.js` 最終擁有 `gmHtml()`。

頂層固定：
```text
[管理] [測試]
```

## 管理
### 一般管理
- 指定等級
- 指定金幣
- 解鎖全部地圖與怪物
- 補滿 HP
- 清空背包
- 刷新商店
- 重置商店（刷新價格回 100 金幣）
- 產生裝備

### 副本管理
直接指定：
- 副本次數累積進度 %
- 副本可挑戰次數
- 副本積分
- 套用

不要再加入舊式冗餘快捷鈕：
- +10%
- +100%
- +250%
- +1 次
- 進度歸零
- 副本資料全重置

`gmApplyDungeonValues()` 輸入 progress >=100 時會交給 `ensureDungeonProgressState()` normalize，自動換 attempts 並保留 overflow。

## 測試
順序固定：
1. 特殊怪測試
2. 副本進度／刷怪測試
3. 懸賞戰測試
4. 未來新增測試往後接

特殊怪：100 次沙盒。
副本進度 Debug：地圖＋怪物雙下拉。
懸賞：三檔生成＋各自 100 次模擬；不改正式角色資料。

Batch 5 已補：懸賞 Debug／100 次結果在 GM Hub rerender 或切換頁籤後仍可重新顯示。

---

## 20. GM 按鈕配色規範

另有獨立文件：`GM_UI_GUIDE.md`。

固定語意：
- **深色**＝一般管理／狀態設定
- **藍色**＝立即執行／刷新／套用／測試／Debug
- **金橘色**＝產生／生成／新增
- **紅色**＝危險／刪除／清空

目前例子：
- 指定等級、指定金幣、補 HP、重置商店：深色
- 刷新商店、套用、副本 Debug、100 次測試：藍色
- 產生裝備、生成懸賞：金橘色
- 清空背包：紅色

未來新增 GM 按鈕直接依語意延續，不要每次重新設計。

---

## 21. 商店 GM 注意事項

正式重置函式核心：
```js
gmResetShopPrice()
```
目前保留 `gmResetShop()` 相容入口供 GM Hub 使用。

「重置商店（100 金幣）」只代表：
- 把刷新價格級數重置
- 下一次刷新回到 100 金幣

不是清空商店、不是重生所有資料、也不送金幣。

---

## 22. 手機版要求

正式雙平台。

手機：
- 不可水平溢出
- Modal 可垂直捲動
- 按鈕不出畫面
- 長文字可換行
- select / input 不超寬
- iPhone safe area 要保留

`dungeonui.js`：
- 副本狀態手機單欄
- 副本模式手機單欄
- 懸賞卡片／戰鬥縮排

`gmhub.js`：
- 手機 top tabs sticky
- controls 小間距
- input/select max-width 100%

玩家仍以真機／實際瀏覽器 Pages 測試為最後確認。

---

# 23. Batch 5 回歸檢查結果

本批以目前 `main` 程式重新檢查核心流程。

確認的程式邏輯：
- `SAVE_VERSION = 6`
- `state.dungeon` 含 progress / attempts / points
- progress >=100 normalize 正常存在
- begin dungeon：檢查 attempts、立即扣次數、完整回血、立即存檔
- finish dungeon：預設完整回血並保存
- dungeon combat：同 damage / crit / dodge 核心、200 回合保護
- dungeon combat 不呼叫主線 reward / progress pipeline
- bounty unlock Lv5
- arena Lv15、tower Lv25 卡片可見但尚未實作
- bounty 正式進場立即扣 1 次
- bounty 隨機 tier 60/30/10
- bounty 勝利加 80/120/180，失敗 0
- bounty 普通／高級至少 1 trait；危險 1～2 trait
- GM dungeon direct assignment 可 normalize 100%+
- GM 商店重置函式已修正
- GM 特殊怪按鈕目前實際執行 100 次 sandbox
- GM 懸賞 100 次模擬不改正式資料
- GM 懸賞結果 rerender persistence 已補
- dungeon / GM 手機 CSS 規則存在
- JS 修改有對應 cache bust

注意：以上是**程式碼回歸檢查**；最終視覺與點擊流程仍由玩家在 GitHub Pages 實際測試確認。

---

# 24. 下一步規劃

目前副本基礎＋懸賞已視為一個穩定基準。

接下來優先：

## 第 6 批：競技場
概念：
- 一次副本消耗 1 次
- 連續 3 名敵人
- 不自動補滿每一場之間 HP（目前偏好）
- 因為有累積損血，每一隻不能直接等同同級懸賞強度
- Stage 1 弱、Stage 2 中、Stage 3 最強

早期概念 full-clear 目標：
- 普通：80～90%
- 困難：55～70%
- 極限：30～45%

未定案，實作前要再設計／測試。

## 後續：試煉塔
- 永久樓層進度
- 例如死在 16 樓，下次從 16 樓開始
- 已通過樓層永久記錄
- 可考慮首通積分

## 尚未實作
- 副本積分商店
- 副本積分抽獎

沒有正式需求前，不先做 UI。

---

# 25. 重要歷史踩雷

- 大改 `ui.js` 曾造成整頁空白。
- JS/CSS 忘記 cache bust 曾造成玩家仍讀舊版。
- 200 回合曾有假勝利問題，已修正，不可恢復。
- `levelcapresult.js` 不可隨意放寬 modal title 監聽，避免污染 GM／特殊結果。
- `dungeonui.js` 最後主動 `render()` 是為了解決首次載入時首頁副本狀態不出現；不要隨意移除。
- `dungeongm.js` 現在只負責 GM 功能邏輯，不再負責 GM 版面。
- `gmhub.js` 負責 GM 介面分類與樣式。

---

# 26. 目前核心檔案職責

- `data.js`：SAVE / 品質 / 地圖資料
- `engine.js`：舊核心引擎
- `dungeonprogress.js`：副本進度 / attempts / points normalization
- `dungeoncore.js`：真正副本進場／結束／戰鬥核心
- `ui.js`：核心 UI，高風險
- `battlelimit.js`：main 200-turn + combatEndHp
- `battlepipeline.js`：正式 main runBattles
- `risksettlement.js`：<30% 中斷流程
- `traits.js`：主地圖怪特性
- `gearupgrade.js`：裝備真正升級判斷
- `specialmonsters.js`：特殊怪資料與玩家能力基底
- `specialcore.js`：特殊怪正式戰鬥／獎勵
- `specialencounter.js`：8% 自然遭遇 hook
- `specialgm.js`：特殊 GM 功能基底
- `specialgmbatch.js`：特殊怪 ×100 sandbox
- `dungeonbounty.js`：懸賞正式模式
- `dungeongm.js`：副本／懸賞 GM 邏輯
- `gmtools.js`：一般 GM 邏輯
- `gmhub.js`：最終 GM Hub UI
- `dungeonui.js`：副本首頁／首頁插入／冒險狀態／懸賞路由＋副本 CSS
- `GM_UI_GUIDE.md`：GM 按鈕語意配色規範

---

## 27. 最後提醒

未來承接時：
1. 先讀 GitHub `main`。
2. 不要相信舊對話裡的 blob SHA / cache 版本一定仍是最新。
3. 不要為了小功能重寫核心檔。
4. 懸賞目前平衡已經過使用者多輪 ×100 實測，不要無理由重置倍率。
5. 副本用語固定，不要改名。
6. GM 新增功能先判斷「管理」或「測試」，再套固定按鈕顏色。
7. 新 JS/CSS 一定同步 bump `index.html`。
