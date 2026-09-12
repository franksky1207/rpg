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

懸賞可選單次／連續：一場＝一個連續單位；每場真正開始前才扣1次副本次數；每場結束後回滿HP；死亡、次數不足、手動停止會結束；手動停止在目前這場打完後生效。

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

`getArenaVenueName(rank)` 是玩家／GM正式名稱來源。`arenaranklabels.js` 的「區域名＋階」只屬舊相容層。

## 8.2 逐個解鎖，不再使用三格視窗晉升

Lv15 開放競技場時，**只有第1個地球戰爭競技場已解鎖**。

永久進度主要欄位：

```text
state.dungeon.arena.highestArenaUnlocked
```

初始：

```text
highestArenaUnlocked = 1
```

每成功解鎖下一個競技場：

```text
highestArenaUnlocked += 1
```

舊 `windowStart` 制度已退場；不要再把 `windowStart` 當正式永久進度。

`state.dungeon.arena.rank` 暫時保留底層相容／目前戰鬥或評估目標使用。
`activeRank` 是玩家這次實際點選並正在準備／挑戰的競技場，不是永久進度。

## 8.3 解鎖下一個競技場：兩個條件缺一不可

要解鎖第 `N+1` 個競技場，必須同時滿足：

```text
目前最高已解鎖競技場（第N個）的高難500次全通率 >= 90%
AND
主線第N+1區域已解鎖
```

正式門檻：
- 高難500次完整三連戰。
- 至少450次全通。
- `clearCount >= 450` 才算戰力通過。
- 主線條件從第2個競技場開始就有效，沒有「前3個免主線」例外。

例：
- 開第2個太陽系戰爭競技場：第1個高難≥450/500 + 主線第2區已解鎖。
- 開第3個近星戰爭競技場：第2個高難≥450/500 + 主線第3區已解鎖。
- 開第4個星際邊疆競技場：第3個高難≥450/500 + 主線第4區已解鎖。
- 一路同理至第10個。

戰力達標後 `promotionReady=true`，資格可保留；如果主線條件尚未達成，先不解鎖下一個，等主線區域開放後即可手動解鎖。

## 8.4 戰力評估永遠評估目前最高已解鎖競技場

例：
- 只開第1個 → 評估地球戰爭競技場。
- 已開到第2個 → 評估太陽系戰爭競技場。
- 已開到第7個 → 評估銀河中域競技場。

評估規則：
- 固定高難。
- 模擬500次完整三連戰。
- 每次滿血開始，三戰殘血連續。
- 模擬不扣副本次數、不給VIP積分、不改正式HP。
- 敵人用玩家基礎＋裝備快照，不含VIP／戰鬥專精。
- 玩家端套正式VIP＋戰鬥專精。
- 裝備／VIP／戰鬥專精改變後，尚未取得資格時可重新評估。

解鎖下一個後：
- `highestArenaUnlocked += 1`
- 新的最高競技場成為下一次戰力評估目標。
- `promotionReady=false`
- 清空 `lastCheckSignature / lastCheckRuns / lastCheckClearCount`

## 8.5 首頁只顯示最近最多3個已解鎖競技場

顯示規則：

```text
visibleStart = max(1, highestArenaUnlocked - 2)
visibleEnd   = highestArenaUnlocked
```

因此：
- 已開1個 → 顯示1
- 已開2個 → 顯示1、2
- 已開3個 → 顯示1、2、3
- 已開4個 → 顯示2、3、4；第1個消失
- 已開5個 → 顯示3、4、5
- …
- 已開10個 → 顯示8、9、10

玩家只能從目前畫面上的已解鎖競技場進入挑戰。

## 8.6 玩家操作流程

```text
選擇目前顯示的競技場 → 選低／中／高難 → 準備 → 三連戰
```

`arenaplayerflow2.js` 負責正式玩家選場、難度第二層與解鎖條件 UI；正式敵人／戰鬥仍走 `dungeonarena.js`，沒有第二套怪物或戰鬥公式。

## 8.7 舊存檔轉換

`dungeonprogress.js` 正規化規則：
- 已有 `highestArenaUnlocked`：直接以它為新正式進度，再受目前主線可達區域上限夾住。
- 暫時版 `windowStart` 存檔：把 `windowStart` 視為「已完成幾次逐步推進後的最高解鎖序號」。因此 `windowStart=1` 轉成只開第1個；`windowStart=2` 轉成已開到第2個，以此類推。
- 更早、沒有 `windowStart` 的舊 Rank 存檔：以舊 `rank` 當最高已解鎖競技場。
- 從暫時 `windowStart` 制度遷移時，舊戰力評估不沿用，避免把原本最右卡的評估錯套到新的最高已解鎖競技場。

## 8.8 每個競技場都有低／中／高難

內部 difficulty id：
- `normal` = 低難
- `hard` = 中難
- `extreme` = 高難

舊內部 name 可能仍保留「普通競技場／困難競技場／極限競技場」字串作相容；玩家正式 UI 顯示低／中／高。

每輪固定三戰，三戰間不回血；任一戰失敗即該輪失敗。每個新敵人可重新觸發先制。

## 8.9 競技場序號壓力公式

令 `R = 競技場序號`：

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

暴擊／閃避與特性只跟低中高難度走，不隨競技場序號增加。最高高難上限仍為 crit23 / dodge20；特性最高2個。

## 8.10 VIP積分

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

## 8.11 單次／連續挑戰

任一目前顯示的已解鎖競技場、任一低中高難都可選單次／連續。

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
- 可直接選第1～10個任一競技場，不受玩家已解鎖競技場數或主線限制。
- 下拉顯示正式名稱，例如「第3個｜近星戰爭競技場」。
- 低／中／高難任選。
- 100次完整三連戰。
- 500次**戰力評估**固定高難，450/500達標。
- GM500次只代表戰力門檻；正式玩家還必須滿足下一競技場對應主線區域已解鎖。
- 使用GM測試VIP＋測試專精。
- 敵人不含VIP/專精。
- 沙盒測試不扣副本次數、不給正式VIP積分、不修改正式promotionReady。

---

## 10. 遊戲說明

`gameguidearena5.js` 正式玩家說明應呈現：
- 十個「區域名＋競技場」。
- Lv15只開地球戰爭競技場。
- 逐個解鎖下一個競技場。
- 每次都要求：目前最高競技場高難500次≥450 + 下一競技場對應主線區域已開。
- 首頁最多顯示最近3個已解鎖競技場。
- 點競技場後再選低／中／高難。
- 單次／連續挑戰。
- VIP積分公式。

原始 `gameguide.js` 內可仍有舊字串；正式玩家說明以 `gameguidearena5.js` patch 後呈現為準。

---

## 11. 重要檔案

- `dungeonprogress.js`：副本進度、`highestArenaUnlocked` 正規化、主線可解鎖競技場上限、舊存檔轉換
- `dungeoncore.js`：副本 begin/finish run
- `dungeonbounty.js`：懸賞核心＋連續流程
- `dungeonarena.js`：競技場正式敵人公式、低中高難、500次模擬底層、正式戰鬥、連續流程
- `arenawindowcore.js`：目前最高競技場、最近3個可見競技場、activeRank、戰力＋主線解鎖條件核心；檔名保留歷史名稱
- `arenaplayerflow2.js/.css`：玩家選場、第二層難度、解鎖條件UI
- `arenaranklabels.js`：舊Rank名稱相容層
- `dungeonplayerui.js/.css`：較早玩家副本presentation layer，仍與新版flow共同載入
- `arenagm5.js`：正式競技場GM沙盒測試
- `gameguidearena5.js`：新版競技場／懸賞guide patch
- `gmhub.js` / `dungeongm.js`：GM hub與原測試核心

---

## 12. 已知技術債與不要誤判

1. `dungeonarena.js` 內部 `ARENA_DIFFICULTY_BASES` 仍有「普通競技場／困難競技場／極限競技場」字串，屬底層歷史命名。
2. `dungeonarena.js` 內部仍以 `rank` 表示競技場序號與敵人強度；永久解鎖進度要看 `highestArenaUnlocked`。
3. `arenawindowcore.js` 檔名仍叫 window core，但正式制度已不是三格視窗晉升，而是逐個解鎖＋最近3個顯示。
4. `arenaranklabels.js` 的「區域名＋階」是舊相容層；目前正式競技場名稱使用 `getArenaVenueName()`。
5. `dungeonplayerui.js` 是較早 presentation layer；正式選場與解鎖UI由後載入的 `arenaplayerflow2.js` 接管。
6. `dungeongm.js` 舊競技場100次函式仍存在；正式GM畫面由 `arenagm5.js`。
7. `gameguide.js` 舊副本文字可能仍存在；正式guide由 `gameguidearena5.js` 替換。
8. `ui.js`仍可能保留舊battle-count設定；正式主線玩家由`continuousbattle.js` override為單場／連續。
9. `specialencounter.js` / `battlepipeline.js`仍可能有舊infinite相容命名。
10. presentation layer不得複製正式怪物／戰鬥公式；敵人數值仍以`dungeonarena.js` / `buildArenaEnemyForTest()`為準。

---

## 13. 最新競技場制度變更

前一版短暫採用「初始顯示1～3、最右90%、雙評估後整組2～4」制度，使用者認為不直觀，已正式撤回。

最新唯一有效版本：

```text
Lv15只開第1個
第1個90% + 主線第2區已開 -> 解鎖第2個
第2個90% + 主線第3區已開 -> 解鎖第3個
第3個90% + 主線第4區已開 -> 解鎖第4個，同時首頁第1個消失
之後同理
```

首頁永遠顯示最近最多3個已解鎖競技場。

---

## 14. 驗證狀態

截至本次更新：
- GitHub `main` 程式已改成逐個解鎖制度。
- 靜態回讀與 commit compare 應在每次修改後完成。
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