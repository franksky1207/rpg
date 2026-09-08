# 《文明戰線》專案交接文件

> 本文件提供未來 ChatGPT／開發助手快速承接本專案。
>
> **最高原則：GitHub `main` branch 的實際程式碼永遠是唯一真實來源。**

---

## 1. 專案基本資料

- 遊戲名稱：**文明戰線**
- Repository：`franksky1207/rpg`
- Branch：`main`
- Pages：`https://franksky1207.github.io/rpg/`
- 純前端 HTML/CSS/JavaScript
- 本機存檔：`localStorage`
- `SAVE_KEY="frank_text_rpg_save"`
- `SAVE_VERSION=7`
- `MAX_LEVEL=100`
- GM 密碼：`franksky`
- 正式支援桌機＋手機

設計原則：**越單純、越簡單越好。**
核心只有打怪、升級、金幣、裝備、地圖、Boss、副本。
不做職業、技能樹、複雜任務、大量劇情、多角色、PvP、排行榜、每日登入式系統。

目前世界觀主線：
- Lv1～50：**地球戰爭**
- Lv51～100：**太陽系戰爭**
- 未來可再往 Lv101～150「銀河系戰爭」等尺度擴張。

開發規範：
- 每次修改前重新讀取 `main` 最新檔案。
- `.js` / `.css` 一旦修改，`index.html` 對應 `?v=` 必須同步 bump。
- 儘量不要大改 `ui.js`。
- 新功能優先 IIFE／wrapper／hook／獨立 module。
- classic `<script>` 頂層 `let/const` 可能衝突，新增模組優先包 IIFE。
- script load order 是架構的一部分，不要隨意重排。
- 地圖／怪物／裝備命名原則：**同區域內風格一致，不同區域之間避免過高重複性與模板感。**

---

## 2. Lv1～100 擴充架構

### 第1批：解除 Lv50 限制 —— 已完成

`level100.js`：
- `MAX_LEVEL=100`
- `clampGameLevel()` 支援 1～100
- Lv100 才視為滿等，滿等 EXP 1:1 轉金幣
- 主線掉裝等級可到100
- EXP / MAX 顯示支援100
- GM指定等級與產生裝備可到100
- 特殊怪／懸賞／競技場 Debug metadata 可到100

### 第2批：20張地圖＋存檔遷移 —— 已完成

新增：
- `worldmaps-earth.js`
- `worldmaps-solar.js`
- `worldexpansion.js`
- `LEVEL100_EXPANSION.md`

世界資料：
- 共20張地圖
- 共100隻主線怪物
- 共100個地圖裝備名稱
- 每張固定 3普通＋1菁英＋1Boss
- 每張固定5裝備部位：武器／頭盔／鎧甲／鞋子／飾品
- 每張地圖有 `chapter` 欄位

存檔遷移：
- 舊前10張地圖進度全部保留
- `mapProgress` / `bossProgress` / `bossLocked` / `bossKilled` 自動擴成20張
- 第11～20張預設全新未攻略
- 已擊敗原Lv50 Boss者，自動解鎖第11張
- 舊裝備名稱自動換成地球戰爭新名稱
- 轉換涵蓋穿戴、背包、遺失裝備、商店商品
- 裝備等級／品質／能力／詞條／價格／穿戴狀態不變
- 不要求重新開檔

20張地圖相容：
- Boss可從第10張繼續解鎖第11張，一路到第20張
- 商店目前地圖判定支援20張
- GM解鎖全部地圖支援20張
- 特殊怪GM測試地圖索引支援Lv1～100

---

## 3. 目前世界資料

### 地球戰爭 Lv1～50

1. 城市淪陷區 1～5
2. 郊區防衛線 6～10
3. 地下軍事設施 11～15
4. 荒漠戰區 16～20
5. 污染禁區 21～25
6. 極地戰線 26～30
7. 古代科技遺址 31～35
8. 火山兵器基地 36～40
9. 全球指揮中心 41～45
10. 地球決戰區 46～50

### 太陽系戰爭 Lv51～100

11. 月面登陸區 51～55
12. 月球軌道站 56～60
13. 火星殖民區 61～65
14. 火星赤原戰場 66～70
15. 小行星採礦帶 71～75
16. 木衛戰區 76～80
17. 木星軌道圈 81～85
18. 土星環防線 86～90
19. 外太陽系邊境 91～95
20. 太陽系終極戰線 96～100

正式怪物／裝備名稱以 `worldmaps-earth.js`、`worldmaps-solar.js` 為準。

---

## 4. 基礎戰鬥與成長

玩家：
```js
baseHP(l)=ceil(110+12*(l-1))
baseATK(l)=ceil(15+2.2*(l-1))
baseDEF(l)=ceil(7+1.2*(l-1))
```

主怪基礎由 `balance.js` 目前有效覆寫：
```js
hp=ceil(62+16.2*l)
atk=ceil(10.5+2.45*l)
def=ceil(3.2+.92*l)
```

主怪階段倍率（目前有效）：
- S1 1.00 / 1.00 / 1.00
- S2 1.12 / 1.10 / 1.08
- S3 1.30 / 1.22 / 1.16
- 菁英 1.62 / 1.36 / 1.24
- Boss 2.12 / 1.48 / 1.30

傷害：
```js
max(1,ceil((atk-def*.55)*random(.95~1.05)))
```

暴擊傷害1.5×；玩家暴擊cap30%，閃避cap25%。

EXP：
```js
sameExp(l)=ceil(25+4*l)
expNeed(l)=ceil(sameExp(l)*(4.5+.35*l+.023*l*l))
```

Lv51～100的實際升級節奏尚待後續平衡批次計算，不要先猜測調整。

---

## 5. 裝備與怪物特性

品質：普通／優良／稀有／史詩／傳說／神話。
倍率：1 / 1.15 / 1.35 / 1.6 / 1.95 / 2.4。
神話永不自動出售。

7種怪物特性：
- 強壯：HP +20%
- 兇猛：ATK +15%
- 堅硬：DEF +20%
- 迅捷：閃避 +8%
- 致命：暴擊 +8%
- 狂暴：HP <50% 後 ATK +20%
- 巨體：HP +30%、ATK +5%、閃避 -5%

`traits.js` 負責主線特性；懸賞與競技場各自套用其特性邏輯。

---

## 6. 主線副本進度

正式用語：
- **副本次數累積進度**
- **副本可挑戰次數**
- **副本積分**

`state.dungeon`：
```js
{progress:0,attempts:0,points:0}
```

每滿100%自動換1次挑戰，overflow保留，attempts可囤積。

正式主地圖成功戰鬥進度：
```text
(敵人最大HP / 玩家該場開始等級 baseHP) * 1.5%
+ 本場實際損血率 * 4%
```

敗北、timeout、特殊怪、真正副本皆不給進度。

Lv51～100主線怪物的副本進度速度仍需後續實測，因高等怪物HP可能影響第一項比例。

---

## 7. 副本共通規則

三種模式：
1. 懸賞戰（Lv5）
2. 競技場（Lv15）
3. 試煉塔（Lv25，尚未實作）

共通：
- 每次正式進場消耗1次副本可挑戰次數
- 開始時完整回血
- 不產生副本進度
- 不影響主線kill／elite／boss／unlock／map progress
- 不給主線EXP、金幣、一般裝備
- 副本死亡不吃主線死亡懲罰
- 已取得副本積分保留
- 結束後預設完整回血
- 200回合保護由 `dungeoncore.js`

`beginDungeonRun()`：扣次數、補滿、立即保存。
`finishDungeonRun()`：清runtime、預設補滿、保存。

---

## 8. 懸賞戰 —— 已完成／平衡凍結

出現率：
- 普通45%
- 高級35%
- 危險20%

積分：80 / 120 / 180。

平衡：
- 普通 HP1.00 / targetDamage1.00 / DEF.88，固定1特性
- 高級 HP1.03 / targetDamage1.06 / DEF.90，固定1特性
- 危險 HP1.08 / targetDamage1.10 / DEF.92，50% 1特性 / 50% 2特性

玩家近期實測：
- 普通約93～100%
- 高級約75～85%
- 危險約45～55%
- 長期平均每次懸賞約90副本積分

共用架構：
```text
玩家實際能力
→ specialBaseEnemyFromPlayer()
→ 懸賞tier倍率
→ 暴擊／閃避
→ 特性
```

ATK由targetDamage反推：
```js
atk=targetDamage+playerDEF*.55
```

懸賞視覺：紫黑。

---

## 9. 競技場 —— 已完成／平衡接受

Lv15解鎖。
三場之間不回血；正式選難度時才扣1次。

正式積分：
- 普通 30/40/50 + bonus40 = 160
- 困難 40/55/70 + bonus65 = 230
- 極限 50/70/95 + bonus105 = 320

每贏一戰立即入帳；後面輸掉仍保留前面積分。

目前有效 3×3 倍率（HP / targetDamage / DEF）：

普通：
- S1 .60 / .60 / .78
- S2 .69 / .68 / .80
- S3 .78 / .76 / .82

困難：
- S1 .64 / .62 / .80
- S2 .70 / .68 / .83
- S3 .78 / .75 / .85

極限：
- S1 .63 / .61 / .80
- S2 .70 / .67 / .83
- S3 .80 / .75 / .86

報酬實測目標／接受區：
- 懸賞約90
- 普通競技場約150～155
- 困難競技場約175～185附近
- 極限競技場約200～210

競技場視覺：黑鐵＋青銅金，獨立 `dungeonarena.css`。
正式準備頁不顯示敵人HP/ATK/DEF。

GM ×100結果顯示：
- 第1戰通過
- 第2戰到達
- 第2戰條件通過
- 第3戰到達
- 第3戰條件通過
- 全通率
- 平均積分
- 全通平均剩餘HP
- 平均總回合

**「各戰 timeout」已從測試介面移除，但200回合保護本身仍保留。**

---

## 10. GM Hub

頂層：
```text
[管理] [測試]
```

管理：
- 一般管理
- 副本管理

測試：
1. 特殊怪測試
2. 副本進度／刷怪測試
3. 懸賞戰測試
4. 競技場測試

按鈕固定語意：
- 深色＝一般管理／狀態設定
- 藍色＝立即執行／刷新／套用／測試／Debug
- 金橘色＝產生／生成／新增
- 紅色＝危險／刪除／清空

`GM_UI_GUIDE.md` 是正式規範。

第2批後：
- GM指定等級／產生裝備已支援Lv100
- 解鎖全部地圖支援20張
- 地圖下拉由 `MAPS.map()` 產生，因此可看到20張
- 完整Lv100 GM回歸與測試仍屬後續批次

---

## 11. 重要 script 順序

目前關鍵：
```html
<script src="data.js?v=20260908-2247b2"></script>
<script src="worldmaps-earth.js?v=20260908-2247b2"></script>
<script src="worldmaps-solar.js?v=20260908-2247b2"></script>
<script src="engine.js?v=20260907-2033"></script>
...
<script src="gmhub.js?v=20260908-2249"></script>
<script src="level100.js?v=20260908-2355"></script>
<script src="worldexpansion.js?v=20260908-2247b2a"></script>
...
<script src="dungeonui.js?v=20260908-2235"></script>
```

規則：
- `worldmaps-earth.js` / `worldmaps-solar.js` 必須在 `engine.js` 前，讓引擎第一次使用 `MAPS` 時已是20張正式資料。
- `worldexpansion.js` 必須在 `ui.js`、GM相關模組後，才能包裝既有函式與遷移目前已載入的存檔。
- `dungeonprogress.js` 在 `ui.js` 前。
- `dungeoncore.js` 在所有副本模式前。
- `specialmonsters.js` 在懸賞／競技場前。
- `gmhub.js` 建立最終 GM UI，`level100.js` 再補Lv100相容。
- `dungeonui.js` 最後包裝正式render/go/副本路由。

---

## 12. 手機版

正式要求：
- 不可水平溢出
- Modal可垂直捲動
- 按鈕不出畫面
- 長文字可換行
- input/select max-width100%
- iPhone safe area保留

最終視覺仍以玩家 Pages 真機測試為準。

---

## 13. 下一步

目前不要直接進試煉塔。

Lv1～100擴充後仍要完成：
1. GM／管理／測試系統完整Lv100回歸
2. Lv51～100 EXP節奏試算
3. Lv51～100主線難度、裝備、金幣檢查
4. Lv51～100主線副本進度速度檢查
5. Lv55／75／100 特殊怪、懸賞、競技場 ×100 驗證

若副本勝率仍維持原本合理區間，不要預防性重調懸賞／競技場。

之後才進試煉塔。

---

## 14. 試煉塔既定方向

Lv25解鎖，目前尚未實作。

方向：
- 永久樓層進度
- 例如死在第16樓，下次仍從第16樓開始
- 已通過樓層永久記錄
- 可考慮首通積分
- 可重用競技場連戰／累積HP概念，但要有獨立爬塔感
- 敵人優先共用 `specialBaseEnemyFromPlayer()`

尚未實作：
- 副本積分商店
- 副本積分抽獎

沒有正式需求前不先做UI。

---

## 15. 重要踩雷

- 大改 `ui.js` 曾造成整頁空白。
- JS/CSS忘記cache bust曾造成玩家讀舊版。
- 200回合曾有假勝利問題，已修正，不可恢復。
- `levelcapresult.js` 不可隨意放寬modal title監聽。
- `dungeonui.js` 最後主動 `render()` 有用途，不要隨意移除。
- `gmResetShop()` 是相容alias，除非GM Hub同步改，不要移除。
- 舊存檔必須持續相容，不可因擴地圖要求玩家重開檔。
- 前10張資料索引對應既有進度，未來改名稱可以，但不可隨意重新排序。

---

## 16. 核心檔案職責

- `data.js`：SAVE／品質／原始地圖容器
- `worldmaps-earth.js`：Lv1～50正式地球戰爭資料
- `worldmaps-solar.js`：Lv51～100正式太陽系戰爭資料
- `worldexpansion.js`：20張地圖相容／舊存檔遷移／名稱遷移／解鎖與商店地圖擴充
- `level100.js`：Lv100相容層
- `LEVEL100_EXPANSION.md`：Lv100擴充批次紀錄
- `engine.js`：舊核心引擎
- `balance.js`：目前主線怪物有效平衡覆寫
- `dungeonprogress.js`：progress／attempts／points normalization
- `dungeoncore.js`：副本進場／結束／戰鬥核心
- `ui.js`：核心UI，高風險
- `battlepipeline.js`：正式主戰鬥pipeline
- `risksettlement.js`：<30%主線連戰中斷
- `traits.js`：主地圖怪特性
- `specialmonsters.js`：特殊怪資料＋玩家能力動態基底
- `dungeonbounty.js`：懸賞正式模式
- `dungeonarena.js`：競技場正式模式／平衡／積分／戰鬥UI
- `dungeonarena.css`：競技場專屬視覺
- `dungeongm.js`：副本管理／懸賞與競技場GM測試邏輯
- `gmhub.js`：最終GM Hub
- `dungeonui.js`：副本首頁／路由／首頁與冒險狀態插入
- `GM_UI_GUIDE.md`：GM按鈕語意配色

---

## 17. 最後提醒

1. 先讀 GitHub `main`。
2. 不要用舊對話整份舊檔覆蓋新檔。
3. 小功能不要重寫核心。
4. 懸賞平衡已多輪實測，不要無理由重置。
5. 競技場目前接受，不要無理由重置。
6. 副本用語固定。
7. 新JS/CSS一定同步bump `index.html`。
8. 《文明戰線》主線命名要維持高辨識度，避免同類詞過度重複。
