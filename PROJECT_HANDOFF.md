# 純文字 RPG 專案交接文件

> 本文件提供未來 ChatGPT／開發助手快速承接本專案。
>
> **最高原則：GitHub `main` branch 的實際程式碼永遠是唯一真實來源。**

---

## 1. 專案基本資料

- Repository：`franksky1207/rpg`
- Branch：`main`
- Pages：`https://franksky1207.github.io/rpg/`
- 純前端 HTML/CSS/JavaScript
- 本機存檔：`localStorage`
- `SAVE_KEY="frank_text_rpg_save"`
- `SAVE_VERSION=6`
- GM 密碼：`franksky`
- 正式支援桌機＋手機

設計原則：**越單純、越簡單越好。**
核心只有打怪、升級、金幣、裝備、地圖、Boss、副本。
不做職業、技能樹、複雜任務、大量劇情、多角色、PvP、排行榜、每日登入式系統。

開發規範：
- 每次修改前重新讀取 `main` 最新檔案。
- `.js` / `.css` 一旦修改，`index.html` 對應 `?v=` 必須同步 bump。
- 儘量不要大改 `ui.js`。
- 新功能優先 IIFE／wrapper／hook／獨立 module。
- classic `<script>` 頂層 `let/const` 可能衝突，新增模組優先包 IIFE。
- script load order 是架構的一部分，不要隨意重排。

---

## 2. 目前 script / CSS 重點

```html
<link rel="stylesheet" href="style.css?v=20260907-2033">
<link rel="stylesheet" href="dungeonarena.css?v=20260908-2245">

<script src="specialmonsters.js?v=20260908-0645"></script>
<script src="dungeonbounty.js?v=20260908-2200"></script>
<script src="dungeonarena.js?v=20260908-2245"></script>
...
<script src="dungeongm.js?v=20260908-2249"></script>
<script src="gmhub.js?v=20260908-2249"></script>
...
<script src="dungeonui.js?v=20260908-2235"></script>
```

重要順序：
- `dungeonprogress.js` 在 `ui.js` 前。
- `dungeoncore.js` 在所有副本模式前。
- `specialmonsters.js` 在懸賞／競技場前，因為兩者共用玩家能力基底。
- `gmhub.js` 最終擁有 `gmHtml()`。
- `dungeonui.js` 最後包裝正式 render / go / 副本路由。

---

## 3. 基礎戰鬥數值

玩家：
```js
baseHP(l)=ceil(110+12*(l-1))
baseATK(l)=ceil(15+2.2*(l-1))
baseDEF(l)=ceil(7+1.2*(l-1))
```

怪物：
```js
hp=ceil(60+16*l)
atk=ceil(10+2.35*l)
def=ceil(3+.9*l)
```

傷害：
```js
max(1,ceil((atk-def*.55)*random(.95~1.05)))
```

暴擊傷害 1.5×；玩家暴擊 cap 30%，閃避 cap 25%。

Lv50 上限；滿等後 EXP 1:1 轉金幣。

---

## 4. 裝備與怪物特性

品質：普通／優良／稀有／史詩／傳說／神話。
倍率：1 / 1.15 / 1.35 / 1.6 / 1.95 / 2.4。
神話永不自動出售。

7 種怪物特性：
- 強壯：HP +20%
- 兇猛：ATK +15%
- 堅硬：DEF +20%
- 迅捷：閃避 +8%
- 致命：暴擊 +8%
- 狂暴：HP <50% 後 ATK +20%
- 巨體：HP +30%、ATK +5%、閃避 -5%

---

## 5. 主地圖與副本進度

共 10 張地圖，Lv1～50，每張 3 普通＋1 菁英＋1 Boss。

副本正式用語：
- **副本次數累積進度**
- **副本可挑戰次數**
- **副本積分**

`state.dungeon`：
```js
{progress:0,attempts:0,points:0}
```

每滿 100% 進度自動換 1 次挑戰，overflow 保留，attempts 可囤積。

正式主地圖成功戰鬥進度：
```text
(敵人最大HP / 玩家該場開始等級 baseHP) * 1.5%
+ 本場實際損血率 * 4%
```

敗北、timeout、特殊怪、真正副本皆不給進度。

---

## 6. 副本共通規則

三種模式：
1. 懸賞戰（Lv5）
2. 競技場（Lv15）
3. 試煉塔（Lv25，尚未實作）

共通：
- 每次正式進場消耗 1 次副本可挑戰次數。
- 副本開始時完整回血。
- 副本戰鬥不給副本進度。
- 不影響主線 kill / elite / boss / unlock / map progress。
- 不給主線 EXP、金幣、一般裝備。
- 副本死亡不吃主線死亡懲罰。
- 已取得副本積分保留。
- 結束後預設完整回血。
- 200 回合保護由 `dungeoncore.js`。

`beginDungeonRun()`：扣次數、補滿、立即保存。
`finishDungeonRun()`：清 runtime、預設補滿、保存。

---

# 7. 懸賞戰 —— 正式完成

流程：
```text
副本首頁
→ 進入懸賞戰
→ 立即扣 1 次
→ 補滿 HP
→ 隨機 tier＋敵人
→ 開始挑戰
→ 戰鬥
→ 結算
```

出現率：
- 普通 45%
- 高級 35%
- 危險 20%

積分：80 / 120 / 180。

平衡：
- 普通：HP1.00 / targetDamage1.00 / DEF.88，固定1特性
- 高級：HP1.03 / targetDamage1.06 / DEF.90，固定1特性
- 危險：HP1.08 / targetDamage1.10 / DEF.92，50% 1特性 / 50% 2特性

玩家實測近期大致：
- 普通 93～100%
- 高級 75～85%
- 危險 45～55%

長期實測平均每次懸賞約 **90 副本積分**。

懸賞共用：
```text
玩家實際能力
→ specialBaseEnemyFromPlayer()
→ 懸賞 tier 倍率
→ 暴擊／閃避
→ 特性
```

ATK 仍由 targetDamage 反推：
```js
atk=targetDamage+playerDEF*.55
```

懸賞視覺：紫黑。

---

# 8. 競技場 —— Batch 6 已正式完成

Lv15 解鎖。

正式流程：
```text
副本首頁
→ 進入競技場（只看難度，不扣次數）
→ 選普通／困難／極限
→ 正式開始時扣 1 次
→ 補滿 HP
→ 第1戰
→ 第2戰
→ 第3戰
→ 結算
```

三場之間 **完全不回血**，HP 延續。
只有正式開始難度時才扣 1 次；查看難度選擇頁不扣。

### 8.1 正式 3×3 平衡

| 難度 | 場次 | HP | 目標傷害 | DEF |
|---|---:|---:|---:|---:|
| 普通 | 1 | .58 | .58 | .78 |
| 普通 | 2 | .65 | .64 | .80 |
| 普通 | 3 | .72 | .70 | .82 |
| 困難 | 1 | .66 | .66 | .80 |
| 困難 | 2 | .75 | .74 | .84 |
| 困難 | 3 | .85 | .84 | .88 |
| 極限 | 1 | .75 | .74 | .84 |
| 極限 | 2 | .88 | .86 | .89 |
| 極限 | 3 | 1.00 | .98 | .92 |

仍共用：
```text
玩家目前實際裝備能力
→ specialBaseEnemyFromPlayer()
→ 競技場 difficulty＋stage
→ 暴擊／閃避
→ 特性
```

ATK 仍由 targetDamage 反推，不直接乘 raw ATK。

### 8.2 競技場特性

普通：
- 第1戰：70% 無／30% 1個
- 第2戰：50% 無／50% 1個
- 第3戰：固定1個

困難：
- 第1、2戰：固定1個
- 第3戰：75% 1個／25% 2個

極限：
- 第1戰：固定1個
- 第2戰：60% 1個／40% 2個
- 第3戰：50% 1個／50% 2個

競技場使用自己的 `applyArenaTraits()`，保留競技場 crit/dodge 基底。

### 8.3 正式積分

| 難度 | 第1戰 | 第2戰 | 第3戰 | 全通 bonus | 全通總分 |
|---|---:|---:|---:|---:|---:|
| 普通 | 30 | 40 | 50 | 40 | **160** |
| 困難 | 40 | 55 | 70 | 65 | **230** |
| 極限 | 50 | 70 | 95 | 105 | **320** |

每贏一戰立即入帳，所以後面輸掉仍保留前面已得積分。
第三戰勝利時同時拿第三戰積分＋全通 bonus。

競技場視覺：**黑鐵＋青銅金**，獨立 `dungeonarena.css`，與懸賞紫黑區隔。
準備頁不顯示敵人 HP/ATK/DEF；戰鬥時可顯示 HP bar/numeric。

---

## 9. 競技場 GM ×100 —— Batch 6-4

GM → 測試 現在順序：
1. 特殊怪測試
2. 副本進度／刷怪測試
3. 懸賞戰測試
4. 競技場測試

競技場測試有三顆藍色按鈕：
- 普通競技場 ×100
- 困難競技場 ×100
- 極限競技場 ×100

使用**目前角色實際裝備狀態**，每次按鈕模擬 100 次完整三連戰。
不扣副本次數、不增加正式副本積分、不修改正式 HP／角色資料。

結果顯示：
- 第1戰通過率
- 第2戰到達率
- 第2戰條件通過率
- 第3戰到達率
- 第3戰條件通過率
- 全通率
- 平均積分
- 全通平均剩餘 HP
- 平均總回合
- 各戰 timeout 次數

結果會保存在頁面 session 內，GM Hub rerender／切頁籤後可重新顯示。

目標 full-clear 區間目前仍作為調整參考：
- 普通：80～90%
- 困難：55～70%
- 極限：30～45%

**這些是目標，不是保證值。** 需由玩家實際用 GM ×100 後決定是否微調。

---

## 10. GM Hub 規範

頂層：
```text
[管理] [測試]
```

管理：一般管理／副本管理。
測試：特殊怪／副本進度／懸賞／競技場。

按鈕固定語意：
- 深色＝一般管理／狀態設定
- 藍色＝立即執行／刷新／套用／測試／Debug
- 金橘色＝產生／生成／新增
- 紅色＝危險／刪除／清空

競技場 ×100 按鈕屬於藍色。

`dungeongm.js` 負責副本與 GM 測試邏輯。
`gmhub.js` 負責最終 GM UI。

---

## 11. 手機版

正式要求：
- 不可水平溢出
- Modal 可垂直捲動
- 按鈕不出畫面
- 長文字可換行
- input/select max-width 100%
- iPhone safe area 保留

競技場 `dungeonarena.css` 已含 760px / 420px responsive。
GM Hub 也有手機版 sticky tabs 與縮排。

最終視覺仍以玩家 Pages 真機測試為準。

---

## 12. Batch 6-4 回歸檢查

程式碼確認：
- 競技場 Lv15 解鎖。
- 正式開始才扣 1 次。
- 進場補滿 HP。
- 三戰之間不回血。
- 每戰成功即發放該戰積分。
- 中途敗北保留已得積分。
- 全通 bonus 正常加入。
- 競技場使用 `dungeonFightCore()`，不走主線 reward/progress pipeline。
- 不給 EXP／金幣／一般裝備／副本進度。
- 結束後 `finishDungeonRun()` 補滿 HP。
- 競技場 GM ×100 使用純模擬函式，不扣次數、不寫正式積分、不改正式 HP。
- GM 測試結果可在 rerender 後重顯。
- `dungeongm.js`、`gmhub.js` 已 bump cache。

最終點擊／視覺仍由玩家在 Pages 驗證。

---

# 13. 下一步：試煉塔

試煉塔 Lv25 解鎖，目前尚未實作。

目前方向：
- 永久樓層進度。
- 例如死在第16樓，下次仍從第16樓開始。
- 已通過樓層永久記錄。
- 可考慮首通積分。
- 戰鬥可重用競技場的連戰／累積 HP 概念，但規則要更像長期爬塔。
- 敵人仍優先共用 `specialBaseEnemyFromPlayer()`，避免另做重複基底公式。

尚未實作：
- 副本積分商店
- 副本積分抽獎

沒有正式需求前不先做 UI。

---

## 14. 重要踩雷

- 大改 `ui.js` 曾造成整頁空白。
- JS/CSS 忘記 cache bust 曾造成玩家仍讀舊版。
- 200 回合曾有假勝利問題，已修正，不可恢復。
- `levelcapresult.js` 不可隨意放寬 modal title 監聽。
- `dungeonui.js` 最後主動 `render()` 是為首次載入首頁副本狀態；不要隨意移除。
- `gmResetShop()` 是相容 alias，除非 GM Hub 同步改，不要移除。

---

## 15. 核心檔案職責

- `data.js`：SAVE／品質／地圖資料
- `engine.js`：舊核心引擎
- `dungeonprogress.js`：progress／attempts／points normalization
- `dungeoncore.js`：副本進場／結束／戰鬥核心
- `ui.js`：核心 UI，高風險
- `battlepipeline.js`：正式主戰鬥 pipeline
- `risksettlement.js`：<30% 主線連戰中斷
- `traits.js`：主地圖怪特性
- `specialmonsters.js`：特殊怪資料＋玩家能力動態基底
- `dungeonbounty.js`：懸賞正式模式
- `dungeonarena.js`：競技場正式模式／平衡／積分／戰鬥 UI
- `dungeonarena.css`：競技場專屬視覺
- `dungeongm.js`：副本管理／懸賞與競技場 GM 測試邏輯
- `gmhub.js`：最終 GM Hub
- `dungeonui.js`：副本首頁／路由／首頁與冒險狀態插入
- `GM_UI_GUIDE.md`：GM 按鈕語意配色

---

## 16. 最後提醒

1. 先讀 GitHub `main`。
2. 不要用舊對話整份舊檔覆蓋新檔。
3. 小功能不要重寫核心。
4. 懸賞平衡已多輪實測，不要無理由重置。
5. 競技場先看 GM ×100 實測，再決定是否微調。
6. 副本用語固定。
7. 新 JS/CSS 一定同步 bump `index.html`。
