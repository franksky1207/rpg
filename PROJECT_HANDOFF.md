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

主線流程：普通1×10 → 普通2×10 → 普通3×10 → 菁英×10 → 達本圖最高等級 → Boss。Boss固定單場。

主線玩家正式戰鬥模式只有：
- 單場戰鬥
- 連續戰鬥

Boss永遠單場。連續戰鬥手動停止是在目前這一場打完後生效；戰敗立即停止。背景最多12小時。

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

懸賞可選單次／連續：
- 一場＝一個連續單位。
- 每場真正開始前才扣1次副本次數。
- 每場結束後回滿HP。
- 停止：死亡、次數不足、手動停止。
- 手動停止在目前這場打完後生效。
- 連續中間不跳完整結算，最後總結算。

---

# 8. 競技場：最新唯一有效制度

## 8.1 十個正式競技場

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

`getArenaVenueName(rank)` 是目前玩家／GM正式競技場名稱來源。

舊「地球戰爭階／太陽系戰爭階」等命名已不是目前玩家-facing主要制度名稱；`arenaranklabels.js` 仍可能保留相容 API。

## 8.2 三競技場視窗

競技場 Lv15 開放後，玩家首頁一次顯示**連續3個不同競技場**。

正式視窗：

```text
1～3
2～4
3～5
4～6
5～7
6～8
7～9
8～10
```

初始顯示：
- 地球戰爭競技場
- 太陽系戰爭競技場
- 近星戰爭競技場

晉升一次後顯示：
- 太陽系戰爭競技場
- 近星戰爭競技場
- 星際邊疆競技場

最後視窗為第8～10個。

永久進度主要欄位：

```text
state.dungeon.arena.windowStart
```

`windowStart=1` → 顯示1～3；`windowStart=2` → 顯示2～4。

`state.dungeon.arena.rank` 暫時保留作相容／目前目標欄位。不要再把它理解成舊制度的「玩家單一階級」。

`activeRank` 是玩家目前點選並正在準備／挑戰的競技場；它不是永久晉升進度。

## 8.3 玩家選場流程

首頁三張卡＝三個不同競技場，不是低／中／高難。

玩家操作：

```text
選擇競技場 → 選低／中／高難 → 準備 → 三連戰
```

玩家可挑戰目前視窗內任一競技場。

`arenaplayerflow2.js` 負責正式玩家三競技場選場與第二層難度選擇；正式敵人／戰鬥仍走 `dungeonarena.js`，沒有第二套公式。

## 8.4 雙評估晉升

每一個三競技場視窗要通過兩道評估，才可往後推一格。

### ① 戰力評估

永遠評估**目前視窗最右邊的競技場**。

例：
- 視窗1～3 → 評估第3個近星戰爭競技場
- 視窗2～4 → 評估第4個星際邊疆競技場
- 視窗5～7 → 評估第7個銀河中域競技場

評估規則：
- 固定高難。
- 模擬500次完整三連戰。
- `clearCount >= 450`，即至少90%，戰力評估通過。
- 每次滿血開始，三戰殘血連續。
- 模擬不扣副本次數、不給VIP積分、不改正式HP。
- 敵人用玩家基礎＋裝備快照，不含VIP／專精；玩家端套正式VIP＋戰鬥專精。
- 戰力通過後 `promotionReady=true`，資格保留至本視窗真正晉升。

### ② 區域評估

檢查**下一個要進入畫面的競技場**所對應主線區域是否已解鎖。

例：視窗1～3：
- 戰力目標＝第3個近星戰爭競技場
- 下一個＝第4個星際邊疆競技場
- 區域評估＝主線第4區「星際邊疆」是否解鎖

只有：

```text
戰力評估通過 AND 區域評估通過
```

才可把視窗1～3推成2～4。

主線前三區不需要拿來限制初始三張卡；真正第一次區域門檻就是第4區。

## 8.5 晉升後狀態

晉升不是舊式 `Rank1 → Rank2`，而是：

```text
windowStart += 1
```

晉升後：
- 視窗整體往後一格。
- 戰力評估目標改成新的最右競技場。
- `promotionReady=false`。
- 清空 `lastCheckSignature / lastCheckRuns / lastCheckClearCount`。
- 重新評估新的最右競技場。

## 8.6 舊存檔轉換

`dungeonprogress.js` 會補 `windowStart`。

舊資料大致映射：
- 舊 Rank1～2 → 新視窗1～3，舊評估不沿用。
- 舊 Rank3 → 新視窗1～3，評估目標仍是第3個，可在相容條件成立時保留評估。
- 舊 Rank4 → 新視窗2～4。
- 舊 Rank5 → 新視窗3～5。
- 依此類推。

原則：只有舊評估目標與新視窗最右目標一致時才保留，避免把舊資格錯套到別的競技場。

## 8.7 每個競技場都有低／中／高難

內部 difficulty id：
- `normal` = 低難
- `hard` = 中難
- `extreme` = 高難

舊內部 name 可能仍保留普通／困難／極限相容字串，但玩家首頁三張卡不再是這三種難度。

每輪固定三戰，三戰間不回血；任一戰失敗即該輪失敗。每個新敵人可重新觸發先制。

## 8.8 Rank HP / 傷害 / DEF

競技場序號仍作為敵人壓力 Rank。令 `R = 競技場序號`：

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

`P` 是玩家基礎＋裝備快照，不含VIP、不含戰鬥專精。

## 8.9 暴擊／閃避固定，不隨競技場序號增長

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

第1～10個競技場都相同；未來擴充也不要自行提高暴閃。

## 8.10 特性

特性只跟低／中／高難走，不隨競技場序號：
- 低S1：70%0 /30%1
- 低S2：50%0 /50%1
- 低S3：固定1
- 中S1/S2：固定1
- 中S3：75%1 /25%2
- 高S1：固定1
- 高S2：60%1 /40%2
- 高S3：50%1 /50%2

最高2特性。

## 8.11 VIP積分

令 `R = 競技場序號`：

```text
低難 = 180 + 130*(R-1)
中難 = 300 + 130*(R-1)
高難 = 420 + 130*(R-1)
```

第1～10個：
- 1：180 / 300 / 420
- 2：310 / 430 / 550
- 3：440 / 560 / 680
- 4：570 / 690 / 810
- 5：700 / 820 / 940
- 6：830 / 950 / 1070
- 7：960 / 1080 / 1200
- 8：1090 / 1210 / 1330
- 9：1220 / 1340 / 1460
- 10：1350 / 1470 / 1590

三戰積分依第1個競技場原比例一起放大。

## 8.12 單次／連續挑戰

任一可見競技場、任一低中高難都可選單次／連續。

- 一個完整三連戰＝一輪。
- 連續模式鎖定開始時選定的競技場序號＋難度。
- 三戰內不回血；新一輪重新滿血。
- 下一輪真正開始前才扣下一次副本次數。
- 停止：該輪失敗/死亡、次數不足、手動停止。
- 手動停止完成目前整輪後才停。
- 最後總結算顯示輪數、全通/失敗、總VIP積分、停止原因。

---

## 9. GM競技場測試

`arenagm5.js` 正式GM畫面：
- 可直接選第1～10個任一競技場，不受玩家目前三競技場視窗或主線限制。
- 下拉顯示正式名稱，例如「第3個｜近星戰爭競技場」。
- 低／中／高難任選。
- 100次完整三連戰。
- 500次**戰力評估**固定高難，450/500達標。
- GM500次只代表戰力門檻，不代表正式玩家可晉升；正式玩家還要區域評估。
- 使用GM測試VIP＋測試專精。
- 敵人不含VIP/專精。
- 顯示各戰通過／到達率、全通率、平均積分、全通平均HP、平均總回合。
- 沙盒測試不扣副本次數、不給正式VIP積分、不修改正式promotionReady。

舊 `dungeongm.js` 的競技場測試函式仍可保留相容，不要誤認為正式GM介面仍採舊制度。

---

## 10. 遊戲說明

`gameguidearena5.js` 正式玩家說明目前應呈現：
- 十個「區域名＋競技場」。
- 一次顯示連續3個競技場。
- 初始1～3，晉升後2～4，最後8～10。
- 點競技場後再選低／中／高難。
- 雙評估：最右競技場高難500次≥450 + 下一競技場對應主線區域已開。
- 雙評估通過後視窗往後推一格。
- 單次／連續挑戰。
- VIP積分公式。

原始 `gameguide.js` 內可仍有舊字串；正式玩家說明以 `gameguidearena5.js` patch 後呈現為準。

---

## 11. 重要檔案

- `dungeonprogress.js`：副本進度、arena永久狀態、windowStart正規化與舊存檔轉換
- `dungeoncore.js`：副本 begin/finish run
- `dungeonbounty.js`：懸賞核心＋連續流程
- `dungeonarena.js`：競技場正式敵人公式、低中高難、500次模擬底層、正式戰鬥、連續流程
- `arenawindowcore.js`：三競技場視窗、activeRank、雙評估、視窗晉升核心
- `arenaplayerflow2.js/.css`：玩家三競技場選擇、第二層難度選擇、雙評估UI
- `arenaranklabels.js`：舊Rank名稱相容層，不是目前競技場正式命名主來源
- `dungeonplayerui.js/.css`：較早玩家副本presentation layer，仍與新版flow共同載入
- `arenagm5.js`：正式競技場GM沙盒測試
- `gameguidearena5.js`：新版競技場／懸賞guide patch
- `gmhub.js` / `dungeongm.js`：GM hub與原測試核心

JS/CSS變更需同步更新 `index.html` cache-bust。

---

## 12. 已知技術債與不要誤判

1. `dungeonarena.js` 內部 `ARENA_DIFFICULTY_BASES` 仍有「普通競技場／困難競技場／極限競技場」字串，屬底層歷史命名；玩家首頁正式三張卡已由 `arenaplayerflow2.js` 改成三個不同競技場。
2. `dungeonarena.js` 內部仍以 `rank` 表示競技場序號與敵人強度；永久晉升進度不要看單一rank，要看 `windowStart`。
3. `arenaranklabels.js` 的「區域名＋階」是前一版相容層；目前正式競技場名稱使用 `getArenaVenueName()` 的「區域名＋競技場」。
4. `dungeonplayerui.js` 是前一版presentation layer，新三競技場流程由後載入的 `arenaplayerflow2.js` 接管選場與雙評估畫面。
5. `dungeongm.js` 舊競技場100次函式仍存在；正式GM畫面由 `arenagm5.js`。
6. `gameguide.js` 舊副本文字可能仍存在；正式guide由 `gameguidearena5.js`替換。
7. `ui.js`仍可能保留舊battle-count設定；正式主線玩家由`continuousbattle.js` override為單場／連續。
8. `specialencounter.js` / `battlepipeline.js`仍可能有舊infinite相容命名。
9. presentation layer不得複製正式怪物／戰鬥公式；敵人數值仍以`dungeonarena.js` / `buildArenaEnemyForTest()`為準。

---

## 13. 最近三批競技場重構

### 第一批：核心與存檔
- 新增 `windowStart`。
- 三競技場視窗1～3→2～4→…→8～10。
- 最右競技場為500次戰力評估目標。
- 下一競技場對應主線區域為第二道評估。
- 舊Rank存檔安全映射。

### 第二批：玩家UI與操作流程
- 新增 `arenaplayerflow2.js/.css`。
- 首頁三張卡改成三個不同競技場。
- 點入某競技場後再選低／中／高難。
- 正式戰鬥鎖定玩家選到的競技場序號。
- 雙評估UI與手機版。

### 第三批：GM / guide / handoff
- GM正式名稱改成十個競技場。
- GM500次改稱戰力評估，明示區域評估是另一道門。
- guide改成三競技場視窗＋雙評估。
- handoff更新為本文件。

---

## 14. 驗證狀態

截至本次更新：
- GitHub `main` 寫入與靜態回讀完成。
- 最近三批均有 commit range 檢查。
- **尚未實際完成 GitHub Pages／桌機瀏覽器／iPhone Safari 的完整 runtime 驗證。**

下一個對話承接時，先讀 `PROJECT_HANDOFF.md`，再重新讀：
- `dungeonprogress.js`
- `dungeonarena.js`
- `arenawindowcore.js`
- `arenaplayerflow2.js`
- `arenagm5.js`
- `gameguidearena5.js`
- 完整 `index.html`

以 `main` 為唯一真實來源。
