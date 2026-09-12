# 《文明戰線》正式跨對話交接文件

> **最高原則：GitHub `main` 實際程式碼永遠是唯一真實來源。**
>
> 本文件只做跨對話承接。若本文、歷史對話、記憶、舊截圖或舊規格與目前 `main` 衝突，一律重新讀取 `main` 並以實際程式碼為準。

更新日期：**2026-09-12**

---

## 1. 專案基本資料

- Repository：`franksky1207/rpg`
- 正式分支：`main`
- 遊戲名稱：**文明戰線**
- 純前端 HTML / CSS / JavaScript + `localStorage`
- `SAVE_KEY = "frank_text_rpg_save"`
- `data.js` legacy `SAVE_VERSION = 9`
- 正式 schema：`savemigration.js` 的 `SAVE_SCHEMA_VERSION = 10`
- `MAX_LEVEL = 500`
- `VIP_MAX_LEVEL = 20`
- `SPECIALIZATION_MAX_LEVEL = 30`
- 世界：10 大區域、100 張主線地圖、Lv1～500
- 桌面與手機都要支援；iPhone Safari 是重要真機環境

遊戲定位：簡單、傳統、文字型 RPG。核心循環是打怪、升級、拿裝備、推地圖。

---

## 2. 操作規範

1. 修改前先重新讀 GitHub `main` 相關正式檔，並重讀完整 `index.html`。
2. 涉及公式、狀態、save/load、戰鬥流程、UI 共用函式時先搜尋引用。
3. 使用者說「先不要改／先分析／先討論」時不得寫 GitHub。
4. 使用者明確說「修改／開始／做」且規格清楚，可直接改 `main`。
5. 優先修改正式來源；presentation layer 只能改呈現，不得複製第二套戰鬥公式。
6. JS/CSS 修改後同步更新 `index.html` cache-bust。
7. 修改後回讀改動檔與完整 `index.html`。
8. 多檔修改後用 compare 檢查差異。
9. GitHub 寫入成功不代表 GitHub Pages／桌機／iPhone Safari runtime 已驗證。
10. handoff 與 `main` 衝突時，以 `main` 為準。

---

## 3. 世界與主線

`WORLD_REGIONS` 為 10 大區域唯一正式來源：

1. Lv1–50 地球戰爭，Map1–10
2. Lv51–100 太陽系戰爭，Map11–20
3. Lv101–150 近星戰爭，Map21–30
4. Lv151–200 星際邊疆，Map31–40
5. Lv201–250 獵戶臂戰爭，Map41–50
6. Lv251–300 銀河邊境，Map51–60
7. Lv301–350 銀河中域，Map61–70
8. Lv351–400 銀河核心外圍，Map71–80
9. Lv401–450 銀河核心戰爭，Map81–90
10. Lv451–500 銀河統合戰爭，Map91–100

主線流程：普通1×10 → 普通2×10 → 普通3×10 → 菁英×10 → 達本圖最高等級 → Boss。Boss 固定單場。

主線玩家正式戰鬥模式只有：
- 單場戰鬥
- 連續戰鬥

Boss 永遠單場。連續戰鬥手動停止是在目前這一場打完後生效；戰敗立即停止。背景最多12小時。

---

## 4. Lv500 / EXP / 金幣

```js
baseHP(l)  = ceil(110 + 12*(l-1))
baseATK(l) = ceil(15 + 2.2*(l-1))
baseDEF(l) = ceil(7 + 1.2*(l-1))
```

正式 EXP 曲線在 `engine.js`：

```js
const EXP_CURVE = { killMin:5, killRange:495, scale:142 };
sameExp(l) = ceil(25 + 4*l);
expNeed(l) = ceil(sameExp(l) * (5 + 495*(1-exp(-(l-1)/142))));
```

Lv500 為滿等，不再累積 EXP；原本 EXP 1:1 轉金幣。Lv500死亡沒有EXP損失，但裝備遺失照常，除非VIP20。

---

## 5. 裝備 / 專精 / VIP

裝備部位：武器、頭盔、鎧甲、鞋子、飾品。
品質：普通、優良、稀有、史詩、傳說、神話。
裝備最高 Lv500。

主線 Boss 品質表：`[0,45,35,15,4.5,0.5]`。
`traitdrop.js`：1特性15%、2特性30%、VIP14 5%、VIP18主線Boss 10%、VIP8弱部位15%，品質最高神話。

專精共8種、最高Lv30：訓練、搜刮、鑑價、先制、連擊、穿透、反擊、汲取。戰鬥專精由 `runCombatCore()` 處理。

VIP最高20。每級 HP/ATK +0.5%、DEF +0.25%、暴擊/閃避 +0.25%；VIP20合計 HP/ATK +10%、DEF +5%、暴擊/閃避 +5%。

---

## 6. 副本總覽

- Lv5：懸賞戰
- Lv15：競技場
- Lv25：虛空幻境

副本次數由主線勝利累積副本進度換得；VIP4 / VIP12 提高取得速度。

---

## 7. 懸賞戰

定位：**高 EXP、高金幣、多裝備**。

內部 Tier：
- 普通45%，EXP×5、金幣×5、2件
- 高級35%，EXP×8、金幣×8、3件
- 危險20%，EXP×12、金幣×12、5件

品質：稀有60%、史詩35%、傳說4.5%、神話0.5%，普通/優良0%。Trait、VIP14、VIP8仍可作用；VIP18不作用於懸賞。

玩家 UI / guide 不公開 Tier 權重與品質百分比，也不顯示戰前精確 EXP／金幣／裝備件數預覽。

懸賞可選單次／連續：一場＝一個連續單位；每場真正開始前才扣1次副本次數；每場結束後回滿HP；死亡、次數不足、手動停止會結束；手動停止在目前這場打完後生效。

---

# 8. 競技場：最新唯一有效制度

## 8.1 十個正式區域競技場

玩家與 GM 公開名稱一律是「主線區域名稱＋競技場」：

1. 地球戰爭競技場
2. 太陽系戰爭競技場
3. 近星戰爭競技場
4. 星際邊疆競技場
5. 獵戶臂戰爭競技場
6. 銀河邊境競技場
7. 銀河中域競技場
8. 銀河核心外圍競技場
9. 銀河核心戰爭競技場
10. 銀河統合戰爭競技場

**不要把正式競技場命名成普通／困難／極限。**

`getArenaVenueName(rank)` 是玩家／GM正式名稱來源。`arenaranklabels.js` 的「區域名＋階」只屬舊相容層。

## 8.2 逐個解鎖＋最近最多3個

Lv15 開放競技場時，只有第1個地球戰爭競技場。

永久進度主要欄位：

```text
state.dungeon.arena.highestArenaUnlocked
```

初始：

```text
highestArenaUnlocked = 1
```

顯示：

```text
已開1個 → 1
已開2個 → 1 2
已開3個 → 1 2 3
已開4個 → 2 3 4
已開5個 → 3 4 5
...
已開10個 → 8 9 10
```

公式：

```text
visibleStart = max(1, highestArenaUnlocked - 2)
visibleEnd   = highestArenaUnlocked
```

玩家只能挑戰目前畫面中可見的已解鎖競技場。

## 8.3 最重要：位置算法，不是每場再選低中高

正式玩家沒有「先選競技場，再選低／中／高難」第二層。

玩家首頁直接顯示目前1～3個區域競技場；點哪一張就直接進入該競技場準備頁。

目前畫面由左至右的位置決定：

```text
左 → 低位置算法（internal id = normal）
中 → 中位置算法（internal id = hard）
右 → 高位置算法（internal id = extreme）
```

只開1個時：

```text
1 → 低
```

開到2個時：

```text
1 2
低 中
```

開到3個以上時：

```text
1 2 3 → 低 中 高
2 3 4 → 低 中 高
3 4 5 → 低 中 高
...
```

因此同一個競技場會隨進度改變位置算法。例如第3個近星戰爭競技場：
- 顯示123時在右邊 → 高位置算法。
- 顯示234時在中間 → 中位置算法。
- 顯示345時在左邊 → 低位置算法。

但它的 HP／ATK／DEF 仍始終使用第3階的實際 Rank 倍率。

## 8.4 位置算法控制什麼

位置算法控制：
- 暴擊
- 閃避
- 怪物特性分布
- VIP積分模板

位置算法**不控制**：
- HP
- ATK
- DEF

`arenapositioncore.js` 是此制度的正式 overlay 核心。

## 8.5 HP／ATK／DEF：只依競技場實際階層

`arenapositioncore.js` 使用一套共通三戰物理基準：

```text
S1: hp .60 / damage .57 / def .78
S2: hp .69 / damage .64 / def .80
S3: hp .78 / damage .73 / def .82
```

再乘實際競技場 Rank：

```text
RankHp     = 1 + 0.05*(R-1)
RankDamage = 1 + 0.015*(R-1)
RankDef    = 1 + 0.03*(R-1)
```

正式：

```text
EnemyHP = BaseEnemyHP(P) × PhysicalStageHp × RankHp
EnemyDamageComponent = BaseEnemyDamage(P) × PhysicalStageDamage × RankDamage
EnemyATK = ceil(EnemyDamageComponent + P.def*0.55)
EnemyDEF = BaseEnemyDEF(P) × PhysicalStageDef × RankDef
```

`P` 是玩家基礎＋裝備快照，不含 VIP、不含戰鬥專精。玩家正式戰鬥才套 VIP＋戰鬥專精。

## 8.6 暴擊／閃避／特性：只依位置算法

位置低（internal normal）：
- S1 crit×0.25 cap5；dodge×0.20 cap4；特性70%0/30%1
- S2 crit×0.35 cap7；dodge×0.30 cap6；特性50%0/50%1
- S3 crit×0.45 cap9；dodge×0.40 cap8；固定1特性

位置中（internal hard）：
- S1 crit×0.40 cap8；dodge×0.35 cap7；固定1特性
- S2 crit×0.55+1 cap12；dodge×0.50+1 cap10；固定1特性
- S3 crit×0.70+2 cap16；dodge×0.65+1 cap14；75%1/25%2特性

位置高（internal extreme）：
- S1 crit×0.55+1 cap12；dodge×0.50+1 cap10；固定1特性
- S2 crit×0.75+2 cap18；dodge×0.70+1 cap15；60%1/40%2特性
- S3 crit×0.90+3 cap23；dodge×0.85+2 cap20；50%1/50%2特性

最高2特性。Rank 不再額外提高暴擊／閃避。

## 8.7 VIP積分：Rank＋位置模板

令 `R = 競技場序號`：

```text
低位置 = 180 + 130*(R-1)
中位置 = 300 + 130*(R-1)
高位置 = 420 + 130*(R-1)
```

三戰積分依原 stageWeights 比例拆分。

因此同一競技場移到不同位置後，積分模板也會跟著位置改變。

## 8.8 戰力評估

戰力評估永遠測「目前最高已解鎖競技場」在當下畫面中的正式位置算法。

因此：
- 只開第1個時：第1個是左位 → 用低位置算法評估。
- 開到第2個時：第2個是右側但兩張卡中的第2位置 → 用中位置算法評估。
- 開到第3個以上時：最高競技場固定在三張卡最右 → 用高位置算法評估。

評估規則：
- 500次完整三連戰。
- 至少450次全通，即90%。
- 每次滿血開始，三戰殘血連續。
- 模擬不扣副本次數、不給正式VIP積分、不改正式HP。
- 敵人用基礎＋裝備快照；玩家套正式VIP＋戰鬥專精。

評估簽章由 `arenapositioncore.js` 重新建立，包含 Rank、位置算法、等級、裝備後五維、VIP、5個戰鬥專精。

## 8.9 解鎖下一個：90%＋下一主線區域

要解鎖第 `N+1` 個競技場，必須：

```text
目前最高第N個競技場正式位置算法500次全通率 >= 90%
AND
主線第N+1區域已解鎖
```

沒有「前3個免主線」例外。

例：
- 開第2個太陽系戰爭競技場：第1個低位置評估≥450/500 + 主線第2區已開。
- 開第3個近星戰爭競技場：第2個中位置評估≥450/500 + 主線第3區已開。
- 開第4個星際邊疆競技場：第3個高位置評估≥450/500 + 主線第4區已開。
- 之後最高競技場皆以右側高位置算法評估，再搭配下一主線區域。

戰力通過後 `promotionReady=true`；主線尚未達成時資格保留。手動解鎖下一個後：
- `highestArenaUnlocked += 1`
- `promotionReady=false`
- 清空 `lastCheckSignature / lastCheckRuns / lastCheckClearCount`
- 新最高競技場成為下一次評估目標。

## 8.10 存檔／遷移

`dungeonprogress.js`：
- 正式進度 `highestArenaUnlocked`。
- `positionModelVersion = 1`。
- 舊制度第一次載入 position model 時，只清空舊戰力評估結果，不倒退已解鎖到第幾個競技場。
- 舊暫時 `windowStart`：`windowStart=1` → 已開第1個；`windowStart=2` → 已開到第2個，以此類推。
- `rank` 仍作底層相容／目前 active rank；永久進度不要看 `rank`。
- `activeRank` 是目前玩家點選的可見競技場，不是永久進度。

## 8.11 單次／連續挑戰

玩家直接點目前可見的區域競技場 → 準備頁 → 選單次或連續。

- 一個完整三連戰＝一輪。
- 連續模式鎖定開始時的競技場 Rank＋當下位置算法。
- 三戰內不回血；新一輪重新滿血。
- 下一輪真正開始前才扣下一次副本次數。
- 停止：該輪失敗/死亡、次數不足、手動停止。
- 手動停止完成目前整輪後才停。
- 最後總結算顯示輪數、全通/失敗、總VIP積分、停止原因。

---

## 9. GM競技場測試

`arenagm5.js` 正式 GM 畫面：
- 競技場下拉顯示第1～10個正式區域名稱，例如「第3個｜近星戰爭競技場」。
- 不顯示「普通競技場／困難競技場／極限競技場」作正式名稱。
- 額外提供「位置算法」沙盒選項：左位（低）／中位（中）／右位（高）。
- 100次完整三連戰可自由指定 Rank＋位置算法。
- 500次正式戰力評估會自動使用正常解鎖流程中該 Rank 作為最高競技場時的位置：Rank1低、Rank2中、Rank3以上高。
- HP／ATK／DEF 依 Rank；暴閃／特性／積分依位置算法。
- 使用GM測試VIP＋測試專精。
- 沙盒測試不扣副本次數、不給正式VIP積分、不修改正式promotionReady。

舊 `dungeongm.js` 的競技場測試函式可保留相容；正式GM畫面由 `arenagm5.js` 接管。

---

## 10. 遊戲說明

`gameguidearena5.js` 正式玩家說明現在應呈現：
- 十個「區域名＋競技場」。
- Lv15只開地球戰爭競技場。
- 逐個解鎖下一個。
- 首頁最近最多3個。
- 不再有第二層低／中／高難選擇。
- 左／中／右位置對應低／中／高算法。
- HP／ATK／DEF看實際Rank；暴閃／特性／積分看位置。
- 500次90%＋下一主線區域才解鎖下一個。
- 單次／連續挑戰。

原始 `gameguide.js` 內可仍有舊字串；正式玩家說明以 `gameguidearena5.js` patch 後呈現為準。

---

## 11. 重要檔案

- `dungeonprogress.js`：副本進度、`highestArenaUnlocked`、`positionModelVersion`、主線可解鎖上限、舊存檔轉換
- `dungeonarena.js`：舊底層競技場三連戰、stage config、積分 config、戰鬥流程、連續流程；仍含歷史 difficulty ids/names
- `arenapositioncore.js`：**目前競技場正式位置模型核心**；物理三維正規化、位置映射、500次正式評估、正式 start wrapper
- `arenawindowcore.js`：最高競技場、最近3個可見Rank、activeRank、主線條件、解鎖下一個；檔名保留歷史名稱
- `arenaplayerflow2.js/.css`：正式玩家區域競技場首頁、直接進場、評估/主線UI、正式名稱覆寫
- `arenagm5.js`：正式競技場GM測試
- `gameguidearena5.js`：正式競技場／懸賞guide patch
- `arenaranklabels.js`：舊Rank名稱相容層
- `dungeonplayerui.js/.css`：較早副本presentation layer，後載入的新玩家flow會覆寫正式競技場呈現
- `gmhub.js` / `dungeongm.js`：GM hub與舊測試相容

JS/CSS變更需同步更新 `index.html` cache-bust。

---

## 12. 已知技術債與不要誤判

1. `dungeonarena.js` 仍有 `normal / hard / extreme` 與「普通競技場／困難競技場／極限競技場」字串，現在只作底層 template compatibility；不是正式玩家名稱。
2. `dungeonarena.js` 原 stage HP/ATK/DEF multiplier 依 difficulty 不同；正式 runtime 會由 `arenapositioncore.js` 在進戰鬥前正規化成共通 physical profile，再乘 Rank。
3. `arenawindowcore.js` 檔名仍叫 window core，但正式制度是逐個解鎖＋最近最多3個顯示。
4. `arenaplayerflow2.js` 檔名保留歷史名稱，但第二層 difficulty selection 已從正式玩家流程移除。
5. `arenaranklabels.js` 的「區域名＋階」是舊相容層；正式競技場名稱使用 `getArenaVenueName()`。
6. `dungeonplayerui.js` 是較早 presentation layer；正式競技場首頁由後載入 `arenaplayerflow2.js` 接管。
7. `dungeongm.js` 舊競技場測試仍存在；正式GM畫面由 `arenagm5.js`。
8. `gameguide.js` 舊副本文字可能仍存在；正式guide由 `gameguidearena5.js`替換。
9. `ui.js`仍可能保留舊 battle-count 設定；正式主線玩家由 `continuousbattle.js` override為單場／連續。
10. `specialencounter.js` / `battlepipeline.js`仍可能有舊 infinite 相容命名。

---

## 13. 最新競技場兩批重構

### 第一批：核心
- 新增 `arenapositioncore.js`。
- 保留逐個解鎖 `highestArenaUnlocked`。
- 左／中／右位置對應低／中／高算法。
- HP／ATK／DEF 改為共通三戰物理 profile × 實際Rank。
- 暴擊／閃避／特性／積分依位置 template。
- 500次評估改為目前最高競技場當下正式位置算法。
- 新增 `positionModelVersion=1`，舊評估資格重置但解鎖進度保留。

### 第二批：玩家UI／GM／guide／handoff
- 正式玩家移除第二層低中高選單。
- 首頁直接點區域名稱競技場進入準備頁。
- 玩家畫面不再顯示普通／困難／極限作競技場名稱。
- GM改成區域競技場＋位置算法沙盒。
- guide與handoff改成位置模型唯一有效版本。

---

## 14. 驗證狀態

截至本次更新：
- GitHub `main` 寫入與靜態回讀會在本批結束後完成。
- 第一批核心已完成；第二批玩家UI／GM／guide／handoff已寫入。
- **尚未實際完成 GitHub Pages／桌機瀏覽器／iPhone Safari 的完整 runtime 驗證。**

下一個對話承接時，先讀 `PROJECT_HANDOFF.md`，再重新讀：
- `dungeonprogress.js`
- `dungeonarena.js`
- `arenapositioncore.js`
- `arenawindowcore.js`
- `arenaplayerflow2.js`
- `arenagm5.js`
- `gameguidearena5.js`
- 完整 `index.html`

以 `main` 為唯一真實來源。
