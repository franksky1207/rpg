# 《文明戰線》正式跨對話交接文件

> **最高原則：GitHub `main` 的實際程式碼永遠是唯一真實來源。**
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
- 每圖固定 5 級、5 隻敵人：普通×3、菁英×1、Boss×1
- 桌面與手機都要支援；iPhone Safari 是重要真機環境

遊戲定位：簡單、傳統、文字型 RPG。核心循環是打怪、升級、拿裝備、推地圖。不要主動加入職業、技能樹、複雜任務、大量劇情、多角色、PvP、排行榜、登入、每日系統等，除非使用者明確要求。

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

`worldmapui.js`：未到達大區域與未解鎖地圖不顯示；最高已解鎖區域預設展開，舊區域可收合/展開。

主線流程：普通1×10 → 普通2×10 → 普通3×10 → 菁英×10 → 達本圖最高等級 → Boss。Boss 固定單場；首勝解鎖下一圖並免費刷新商店；Boss 戰敗後需再打本圖菁英10次才能重挑。

主線玩家正式戰鬥模式只有：
- 單場戰鬥
- 連續戰鬥

Boss 永遠單場。連續戰鬥手動停止是在目前這一場打完後生效；戰敗立即停止。背景最多12小時。

---

## 4. Lv500 / EXP / 金幣

基礎：

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

Lv500 為滿等，不再累積 EXP；原本 EXP 1:1 轉金幣。Lv500 死亡沒有 EXP 損失，但裝備遺失照常，除非 VIP20。

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

### 懸賞單次／連續

- 玩家可選單次或連續。
- 一場＝一個連續單位。
- 每場真正開始前才扣1次副本次數。
- 每場結束後正常回滿HP。
- 停止：死亡、次數不足、手動停止。
- 手動停止在目前這場打完後生效。
- 連續中間不跳完整結算，最後總結算累積場數、勝場、EXP、金幣、裝備、出售與停止原因。

---

## 8. 競技場正式基準

### 8.1 十大競技場階級命名

正式玩家／GM公開名稱一律是「主線區域名稱＋階」：

1. 地球戰爭階
2. 太陽系戰爭階
3. 近星戰爭階
4. 星際邊疆階
5. 獵戶臂戰爭階
6. 銀河邊境階
7. 銀河中域階
8. 銀河核心外圍階
9. 銀河核心戰爭階
10. 銀河統合戰爭階

`arenaranklabels.js` 統一正式公開 API 的 Rank 名稱。`dungeonarena.js` 內部仍可能存在舊「級」字串作底層相容，不要把內部舊字串視為玩家正式命名。

### 8.2 競技場解鎖上限：前三階基礎開放

**最新正式規則：**

- 競技場本身仍於 Lv15 開放。
- 一旦 Lv15 可以進入競技場，最高可達 Rank 至少為 **Rank3**。
- Rank1～Rank3 不要求主線已解鎖對應第1～3區。
- 玩家仍從 Rank1 開始，必須逐階通過晉升評估並手動晉升；不是直接送 Rank3。
- Rank4 開始才與主線區域同步。
- 要升 Rank4「星際邊疆階」，必須先解鎖主線第4區。
- Rank5～Rank10 同理，必須先解鎖對應主線區域。

核心上限概念：

```text
arenaUnlockedRankCap = max(3, highestUnlockedWorldRegion)
```

再夾在實際世界 Rank 最大值內。

例：
- Lv15、主線仍第1區 → 最高可達Rank3
- 主線第2區 → Rank3
- 主線第3區 → Rank3
- 解鎖主線第4區 → Rank4
- 解鎖第7區 → Rank7
- 解鎖第10區 → Rank10

此規則正式來源在 `dungeonprogress.js` 的 `unlockedArenaRankCap()`；`dungeonarena.js` 會優先呼叫該公開函式。

舊存檔沒有 Rank 時正規化為 Rank1。

永久資料：
- `state.dungeon.arena.rank`
- `promotionReady`
- `lastCheckSignature`
- `lastCheckRuns`
- `lastCheckClearCount`

### 8.3 每階難度

玩家名稱：
- 低難：穩定挑戰／安全收益
- 中難：較高收益／明顯風險
- 高難：最高風險／晉升評估基準

內部 difficulty id 仍是 `normal / hard / extreme`，舊普通／困難／極限名稱可保留作相容；玩家 UI 顯示低／中／高。

每輪固定三戰，三戰間不回血；任一戰失敗即該輪失敗。每個新敵人可重新觸發先制。

### 8.4 Rank HP / 傷害 / DEF

令 `R = arenaRank`：

```text
RankHp     = 1 + 0.05*(R-1)
RankDamage = 1 + 0.015*(R-1)
RankDef    = 1 + 0.03*(R-1)
```

```text
EnemyHP = BaseEnemyHP(P) × difficultyHp[stage] × RankHp
EnemyDamageComponent = BaseEnemyDamage(P) × difficultyDamage[stage] × RankDamage
EnemyATK = ceil(EnemyDamageComponent + P.def*0.55)
EnemyDEF = BaseEnemyDEF(P) × difficultyDef[stage] × RankDef
```

`P` 是玩家基礎＋裝備快照，不含 VIP、不含戰鬥專精。正式戰鬥玩家端才套 VIP 與戰鬥專精。

### 8.5 暴擊／閃避固定，不隨Rank

低難：
- S1 crit×0.25 cap5；dodge×0.20 cap4
- S2 crit×0.35 cap7；dodge×0.30 cap6
- S3 crit×0.45 cap9；dodge×0.40 cap8

中難：
- S1 crit×0.40 cap8；dodge×0.35 cap7
- S2 crit×0.55+1 cap12；dodge×0.50+1 cap10
- S3 crit×0.70+2 cap16；dodge×0.65+1 cap14

高難：
- S1 crit×0.55+1 cap12；dodge×0.50+1 cap10
- S2 crit×0.75+2 cap18；dodge×0.70+1 cap15
- S3 crit×0.90+3 cap23；dodge×0.85+2 cap20

Rank1～10完全相同。未來擴Rank也不要自行提高暴閃。

### 8.6 特性

特性只跟低／中／高難走，不隨Rank：
- 低S1：70%0 /30%1
- 低S2：50%0 /50%1
- 低S3：固定1
- 中S1/S2：固定1
- 中S3：75%1 /25%2
- 高S1：固定1
- 高S2：60%1 /40%2
- 高S3：50%1 /50%2

最高2特性。

### 8.7 VIP積分

```text
低難 = 180 + 130*(Rank-1)
中難 = 300 + 130*(Rank-1)
高難 = 420 + 130*(Rank-1)
```

Rank1～10：
- R1 180 / 300 / 420
- R2 310 / 430 / 550
- R3 440 / 560 / 680
- R4 570 / 690 / 810
- R5 700 / 820 / 940
- R6 830 / 950 / 1070
- R7 960 / 1080 / 1200
- R8 1090 / 1210 / 1330
- R9 1220 / 1340 / 1460
- R10 1350 / 1470 / 1590

三戰積分依Rank1原比例一起放大。

### 8.8 晉升評估

- 只有目前Rank的高難可取得晉升資格。
- 500次完整三連戰。
- `clearCount >= 450` 達標。
- 每次滿血開始，三戰殘血連續。
- 模擬不扣副本次數、不給VIP積分、不改正式HP。
- 敵人用裝備基準；玩家套正式VIP＋戰鬥專精。
- `promotionReady=true` 後永久保留直到晉升。
- 晉升手動操作，不自動升階。
- Rank1→2、Rank2→3只需晉升資格。
- Rank3→4開始，還需要主線已解鎖下一對應區域。
- 晉升後 Rank+1，清空上次評估結果。
- 戰力簽章包含Rank、等級、裝備後HP/ATK/DEF/crit/dodge、VIP、5個戰鬥專精。

### 8.9 競技場單次／連續

- 玩家可選單次或連續。
- 一個完整三連戰＝一輪。
- 連續模式鎖定開始時 Rank＋難度。
- 三戰內不回血；新一輪重新滿血。
- 下一輪真正開始前才扣下一次副本次數。
- 停止：該輪失敗/死亡、次數不足、手動停止。
- 手動停止完成目前整輪後才停。
- 中間不跳正式結算，最後總結算顯示輪數、全通/失敗、總VIP積分、停止原因。

### 8.10 玩家UI

`dungeonplayerui.js` + `dungeonplayerui.css`：
- 顯示正式「區域名＋階」。
- 顯示目前Rank / 可達上限。
- Rank1～3時明確說明為Lv15基礎開放前三階。
- Rank4起顯示主線區域解鎖上限與卡階提示。
- 顯示500次晉升狀態與進度條。
- 顯示低／中／高難。
- 準備頁說明單次／連續。
- 連續戰鬥顯示已完成輪數。
- 總結算顯示停止原因。
- 手機窄版已處理。

---

## 9. GM測試

GM主線測試：區域 → 地圖 → 怪物，可看全部10區/100圖，不受正式角色探索限制。

`arenagm5.js`：
- Rank1～Rank10任選，不受正式角色Rank/主線限制。
- Rank名稱讀 `getArenaRankName()`，所以正式顯示「地球戰爭階」等。
- 低／中／高難任選。
- 100次完整三連戰。
- 500次晉升評估固定高難，450/500達標。
- 使用GM測試VIP＋測試專精。
- 敵人不含VIP/專精。
- 顯示第1戰通過、第2/3戰到達與條件通過、全通率、平均積分、全通平均HP、平均總回合。
- 沙盒測試不扣副本次數、不給正式VIP積分、不修改正式promotionReady。

舊 `dungeongm.js` 的 `gmSimulateArena100()` 仍保留作相容；正式GM競技場畫面由 `arenagm5.js` 升級呈現。

---

## 10. 遊戲說明

`gameguidearena5.js` 會替換副本分類中的舊懸賞／競技場文字，正式呈現：
- 懸賞定位與連續挑戰。
- 競技場十大「區域名＋階」。
- Lv15先開前三階。
- Rank4起才需要主線對應區域。
- 低／中／高難。
- 500次／450次晉升。
- 單次／連續。
- Rank積分公式。

原始 `gameguide.js` 內可仍有舊字串；正式玩家說明以 patch 後呈現為準。

---

## 11. 重要檔案

- `dungeonprogress.js`：副本進度、arena永久狀態、**競技場最高可達Rank核心**
- `dungeoncore.js`：副本 begin/finish run
- `dungeonbounty.js`：懸賞核心＋連續流程
- `dungeonarena.js`：競技場公式、難度、晉升、正式戰鬥、連續流程
- `arenaranklabels.js`：正式公開Rank名稱「區域名＋階」
- `dungeonui.js`：副本主頁與基礎UI
- `dungeonplayerui.js/.css`：玩家競技場／懸賞presentation layer
- `arenagm5.js`：Rank版競技場GM測試
- `gameguidearena5.js`：新版競技場／懸賞guide patch
- `gmhub.js` / `dungeongm.js`：GM hub與原測試核心

JS/CSS變更需同步更新 `index.html` cache-bust。

---

## 12. 已知技術債

1. `ui.js` 仍可能保留舊 1/5/10/15/20/25 battle-count 設定，正式玩家由 `continuousbattle.js` runtime override 為單場/連續。
2. `specialencounter.js` / `battlepipeline.js` 仍有舊 infinite 相容命名。
3. `dungeonarena.js` 內部 difficulty ids/names 仍是 normal/hard/extreme 與普通/困難/極限；正式玩家顯示低/中/高。
4. `dungeonarena.js` 內部 `arenaRankName()` 仍可能產生舊「級」字串；正式公開 API / 玩家 / GM 名稱由 `arenaranklabels.js` 統一為「階」。
5. `dungeongm.js` 舊競技場100次函式仍存在；正式Rank版由 `arenagm5.js`。
6. `gameguide.js` 舊副本文字可能仍存在；正式guide由 `gameguidearena5.js`替換。
7. presentation enhancement layer 不得複製正式怪物／戰鬥公式；敵人數值仍以 `dungeonarena.js` / `buildArenaEnemyForTest()` 為準。

---

## 13. 驗證狀態

截至本次更新：
- GitHub `main` 寫入與靜態回讀已完成。
- 競技場五批改版與後續命名／前三階解鎖修正均已寫入。
- **尚未實際完成 GitHub Pages／桌機瀏覽器／iPhone Safari 的完整 runtime 驗證。**

下一個對話承接時，先讀 `PROJECT_HANDOFF.md`，再重新讀 `main` 的 `dungeonprogress.js`、`dungeonarena.js`、`arenaranklabels.js`、`dungeonplayerui.js`、`arenagm5.js`、`gameguidearena5.js` 與完整 `index.html`。
