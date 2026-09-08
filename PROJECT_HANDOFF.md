# 《文明戰線》專案交接文件

> **最高原則：GitHub `main` branch 的實際程式碼永遠是唯一真實來源。**

## 1. 專案基本資料

- 遊戲名稱：**文明戰線**
- Repository：`franksky1207/rpg`
- Branch：`main`
- Pages：`https://franksky1207.github.io/rpg/`
- 純前端 HTML/CSS/JavaScript
- 本機存檔：`localStorage`
- `SAVE_KEY="frank_text_rpg_save"`
- `SAVE_VERSION=7`
- 目前正式 `MAX_LEVEL=100`
- GM 密碼：`franksky`
- 正式支援桌機＋手機

設計原則：**越單純、越簡單越好。**
核心只有打怪、升級、金幣、裝備、地圖、Boss、副本。
不做職業、技能樹、複雜任務、大量劇情、多角色、PvP、排行榜、每日登入式系統。

世界觀：
- Lv1～50：**地球戰爭**
- Lv51～100：**太陽系戰爭**
- 未來可繼續 Lv101～150「銀河系戰爭」及更大尺度。

命名原則：**同區域內風格一致，不同區域之間避免過高重複性與模板感。**
特殊怪、懸賞、競技場目前統一採現代軍事／科技／自律系統語彙，避免回到傳統奇幻或古代競技場風格。

## 2. 開發規範

- 每次修改前重新讀取 `main` 最新檔案。
- `.js` / `.css` 修改後，`index.html` 對應 `?v=` 必須同步 bump。
- 儘量不要大改 `ui.js`。
- 新功能優先 IIFE／wrapper／hook／獨立 module。
- classic `<script>` 頂層 `let/const` 可能衝突，新增模組優先包 IIFE。
- script load order 是架構的一部分，不要隨意重排。
- 舊存檔必須持續相容，不可因擴地圖要求玩家重開檔。
- 前10張地圖索引對應既有進度，未來可改名稱但不可隨意重新排序。

## 3. Lv1～100 世界資料

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

正式怪物／裝備名稱以：
- `worldmaps-earth.js`
- `worldmaps-solar.js`
為準。

每張固定：3普通＋1菁英＋1Boss；5裝備部位：武器／頭盔／鎧甲／鞋子／飾品。

## 4. 存檔遷移與20張地圖相容

`worldexpansion.js` 負責：
- 舊前10張地圖攻略與 Boss 紀錄保留。
- `mapProgress` / `bossProgress` / `bossLocked` / `bossKilled` 自動擴成20張。
- 第11～20張自動補空白進度。
- 已擊敗原Lv50 Boss者自動解鎖第11張。
- 舊奇幻裝備名稱自動改成地球戰爭新名稱。
- 轉換涵蓋穿戴、背包、遺失裝備、商店商品。
- 裝備等級／品質／能力／詞條／價格／穿戴狀態不變。
- Boss 可從第10張繼續解鎖第11張一路到第20張。
- 商店地圖判定、GM全解鎖、特殊怪GM地圖索引均支援20張／Lv100。

## 5. 玩家、怪物與傷害

玩家：
```js
baseHP(l)=ceil(110+12*(l-1))
baseATK(l)=ceil(15+2.2*(l-1))
baseDEF(l)=ceil(7+1.2*(l-1))
```

主怪目前有效基礎（`balance.js`）：
```js
hp=ceil(62+16.2*l)
atk=ceil(10.5+2.45*l)
def=ceil(3.2+.92*l)
```

階段倍率（HP / ATK / DEF）：
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

## 6. EXP：永久單一曲線

**這是目前正式成長原則：從 Lv1 開始，到未來任何等級都使用同一條算法，不再分段。**

`sameExp(l)=ceil(25+4*l)`。

同級普通怪約需擊敗數係數：
```js
const x=Math.pow(level-1,1.8);
const mid=Math.pow(64,1.8);
factor=5+195*(x/(x+mid));
expNeed(level)=ceil(sameExp(level)*factor);
```

代表節奏：
- Lv1→2：約5.0隻
- Lv5→6：約6.3隻
- Lv10→11：約10.5隻
- Lv20→21：約24.7隻
- Lv30→31：約42.8隻
- Lv40→41：約61.7隻
- Lv50→51：約79.5隻
- Lv60→61：約95.4隻
- Lv75→76：約115.2隻
- Lv100→101：約138.9隻
- Lv150→151：約165.0隻
- Lv200→201：約177.6隻
- Lv300→301：約188.6隻
- Lv1000→1001：約198.6隻

高等時逐漸逼近約200隻同級普通怪，不會無限爆增。

實作於 `level100balance.js`：
- `expProgressionFactor(level)`：正式永久係數。
- `level100ExpFactor`：保留相容 alias。
- `sameLevelNormalKillsToLevel(level)`：可檢查任意等級，不綁目前 `MAX_LEVEL`。

未來擴 Lv101～150 時，**EXP公式不需重做**。

## 7. 裝備與怪物特性

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

`traits.js` 負責主線特性；懸賞與競技場各自套用自己的特性邏輯。

## 8. 副本進度

正式用語：
- **副本次數累積進度**
- **副本可挑戰次數**
- **副本積分**

`state.dungeon`：
```js
{progress:0,attempts:0,points:0}
```

每滿100%自動換1次挑戰，overflow保留，attempts可囤積。

正式主地圖成功戰鬥：
```text
(敵人最大HP / 玩家該場開始等級 baseHP) * 1.5%
+ 本場實際損血率 * 4%
```

敗北、timeout、特殊怪、真正副本皆不給進度。
Lv50→100檢查後，高等同級怪物 HP/baseHP 比例仍穩定，因此目前不調公式。

## 9. 副本共通規則

三種模式：
1. 懸賞戰（Lv5）
2. 競技場（Lv15）
3. 試煉塔（Lv25，尚未實作）

共通：
- 每次正式進場消耗1次副本可挑戰次數。
- 開始時完整回血。
- 不產生副本進度。
- 不影響主線 kill / elite / boss / unlock / map progress。
- 不給主線EXP、金幣、一般裝備。
- 副本死亡不吃主線死亡懲罰。
- 已取得副本積分保留。
- 結束後預設完整回血。
- 200回合保護由 `dungeoncore.js`。

## 10. 特殊怪 —— 現代／科幻命名

正式名稱：
- 稀有資源聚合體
- 誘餌補給艙
- 終止協議單元
- 機率增幅信標
- 封存警戒機
- 裝備保全單元
- 黑市武裝頭目
- 戰利品回收者
- 流動交易代理人

效果、權重與強度未因改名而變更；僅名稱、描述與「遺物」獎勵標籤改為符合《文明戰線》的科技語彙。

## 11. 懸賞戰 —— 已完成／平衡凍結

出現率：普通45%／高級35%／危險20%。
積分：80／120／180。

正式目標名稱：
- 普通：武裝逃逸者／非法改裝兵／黑市護衛／走私突擊手／失控安保機
- 高級：裝甲追緝犯／戰區破壞手／非法火力平台／禁區滲透指揮／深空走私艦長
- 危險：都市級威脅體／殲滅協議載體／戰爭失控核心／軌道破壞平台／深空封鎖母艦

平衡：
- 普通 HP1.00 / targetDamage1.00 / DEF.88，固定1特性
- 高級 HP1.03 / targetDamage1.06 / DEF.90，固定1特性
- 危險 HP1.08 / targetDamage1.10 / DEF.92，50%1特性／50%2特性

玩家近期實測：普通約93～100%、高級75～85%、危險45～55%；長期平均每次懸賞約90積分。

共用架構：
```text
玩家實際能力
→ specialBaseEnemyFromPlayer()
→ 懸賞 tier 倍率
→ 暴擊／閃避
→ 特性
```
ATK由targetDamage反推：`atk=targetDamage+playerDEF*.55`。
懸賞視覺：紫黑。

## 12. 競技場 —— 已完成／平衡接受

Lv15解鎖；三場之間完全不回血；正式選難度時才扣1次。

三戰正式敵名：
1. 基礎模擬單元
2. 戰術強化單元
3. 極限測試平台

三種難度共用這三個階段名稱，難度由倍率與特性區分。

積分：
- 普通 30/40/50 + bonus40 = 160
- 困難 40/55/70 + bonus65 = 230
- 極限 50/70/95 + bonus105 = 320

目前有效倍率（HP / targetDamage / DEF）：

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

接受區：懸賞約90、普通競技場約150～155、困難約175～185、極限約200～210。

GM ×100顯示：第1戰通過、第2戰到達與條件通過、第3戰到達與條件通過、全通率、平均積分、全通平均剩餘HP、平均總回合。
「各戰 timeout」顯示已移除，但200回合保護仍保留。

## 13. GM Hub

頂層：`[管理] [測試]`

管理：一般管理／副本管理。
測試：特殊怪／副本進度與刷怪／懸賞／競技場。

目前已支援：
- GM指定等級 Lv1～100。
- GM產生裝備 Lv1～100。
- 解鎖全部20張地圖與怪物。
- **回復現有等級地圖與怪物**：依角色目前等級重建合理地圖／怪物進度，高於目前等級內容重新鎖定，不動等級、EXP、金幣、裝備、背包或副本資料。
- 副本進度 Debug 可選全部20張地圖。
- 地圖選單顯示篇章＋名稱＋等級範圍。
- 特殊怪／懸賞／競技場測試依目前角色能力生成。

按鈕語意：
- 深色＝一般管理／狀態設定
- 藍色＝立即執行／刷新／套用／測試／Debug
- 金橘色＝產生／生成／新增
- 紅色＝危險／刪除／清空

`GM_UI_GUIDE.md` 是正式規範。

## 14. 關鍵 script 順序

```html
<script src="data.js"></script>
<script src="worldmaps-earth.js"></script>
<script src="worldmaps-solar.js"></script>
<script src="engine.js"></script>
...
<script src="gmhub.js"></script>
<script src="level100.js"></script>
<script src="worldexpansion.js"></script>
<script src="level100balance.js"></script>
...
<script src="dungeonui.js"></script>
```

規則：
- `worldmaps-earth.js` / `worldmaps-solar.js` 必須在 `engine.js` 前。
- `worldexpansion.js` 必須在 `ui.js`、GM相關模組後。
- `level100balance.js` 在 `worldexpansion.js` 後覆寫正式 `expNeed()`。
- `dungeonprogress.js` 在 `ui.js` 前。
- `dungeoncore.js` 在所有副本模式前。
- `specialmonsters.js` 在懸賞／競技場前。
- `dungeonui.js` 最後包裝正式 render/go/副本路由。

## 15. 桌機／手機版

手機正式要求：不可水平溢出、Modal可垂直捲動、按鈕不出畫面、長文字可換行、input/select max-width100%、保留 iPhone safe area。

冒險準備頁目前：
- 手機版維持單欄。
- 桌機版使用「左側玩家狀態＋副本資訊／右側怪物與戰鬥操作」雙欄布局。
- `dungeonui.js` 用 `.prepare-sidebar` 將玩家狀態與副本資訊包為同一 Grid 項目，避免副本資訊變成第三欄而把主內容擠到下一列。

最終視覺仍以 Pages 真機測試為準。

## 16. 下一步：試煉塔

Lv25解鎖，目前尚未實作。
既定方向：
- 永久樓層進度。
- 例如死在第16樓，下次仍從第16樓開始。
- 已通過樓層永久記錄。
- 可考慮首通積分。
- 可重用競技場連戰／累積HP概念，但要有獨立爬塔感。
- 敵人優先共用 `specialBaseEnemyFromPlayer()`。
- **試煉塔敵人名稱尚未定稿，之後再決定。**

尚未實作：副本積分商店／副本積分抽獎。沒有正式需求前不先做UI。

## 17. 重要踩雷

- 大改 `ui.js` 曾造成整頁空白。
- JS/CSS忘記cache bust曾造成玩家讀舊版。
- 200回合曾有假勝利問題，已修正，不可恢復。
- `levelcapresult.js` 不可隨意放寬modal title監聽。
- `dungeonui.js` 最後主動 `render()` 有用途，不要隨意移除。
- `gmResetShop()` 是相容 alias，除非GM Hub同步改，不要移除。
- 懸賞與競技場平衡已多輪實測，不要無理由重置。

## 18. 核心檔案職責

- `data.js`：SAVE／品質／原始地圖容器
- `worldmaps-earth.js`：Lv1～50地球戰爭資料
- `worldmaps-solar.js`：Lv51～100太陽系戰爭資料
- `worldexpansion.js`：20張地圖相容／舊存檔與名稱遷移／解鎖與商店地圖擴充
- `level100.js`：目前Lv100相容層
- `level100balance.js`：**Lv1～未來任意等級的永久單一 EXP 曲線**
- `LEVEL100_EXPANSION.md`：Lv100擴充與平衡紀錄
- `engine.js`：舊核心引擎
- `balance.js`：主線怪物有效平衡覆寫
- `dungeonprogress.js`：progress／attempts／points
- `dungeoncore.js`：副本進場／結束／戰鬥核心
- `ui.js`：核心UI，高風險
- `battlepipeline.js`：正式主戰鬥pipeline
- `risksettlement.js`：<30%主線連戰中斷
- `traits.js`：主地圖怪特性
- `specialmonsters.js`：特殊怪資料＋玩家能力動態基底＋現代科幻命名
- `dungeonbounty.js`：懸賞正式模式＋15個現代／科幻通緝目標名稱
- `dungeonarena.js`：競技場正式模式＋三階段模擬敵名
- `dungeongm.js`：副本管理與GM測試
- `gmhub.js`：最終GM Hub
- `dungeonui.js`：副本首頁／路由／首頁與冒險狀態插入／桌機冒險側欄修正
- `GM_UI_GUIDE.md`：GM按鈕語意配色
